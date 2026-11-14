'use strict';
// One bounded, source-owned chain executed on a disposable save. Only one
// final save write; original checks, world ticks and wounds remain untouched.
const FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine'),P=require('../panels');
const Preflight=require('./turn-preflight'),Pickup=require('./turn-scene');
function run(savePath,req,{execute,hash}){
 Preflight.validate(req);
 const original=FS.readFileSync(savePath,'utf8'),preHash=hash(original);
 const initial=E.importGame(original),runtime=initial.chatRuntime||{revision:0,applied:{}};
 const requestHash=hash(JSON.stringify(req));
 if(runtime.applied?.[req.id]){
  const previous=runtime.applied[req.id];
  if(previous.hash!==requestHash)return {id:req.id,ok:false,applied:false,
   error:'Turn ID already used for a different request',stateHash:preHash};
  const receipt=previous.receipt;
  return {id:req.id,ok:receipt?.ok??true,applied:false,duplicate:true,
   recovered:true,originalRevision:previous.revision,revision:runtime.revision,
   clock:receipt?.clock,output:receipt?.output,events:receipt?.events,
   stateHash:preHash,panel:P.core(initial),hud:P.hudData(initial)};
 }
 if(req.expectedHash&&req.expectedHash!==preHash)return {id:req.id,ok:false,
  applied:false,error:'Stale checkpoint; reload before processing this turn',stateHash:preHash};
 const directory=FS.mkdtempSync(Path.join(OS.tmpdir(),'beastbound-sequence-'));
 const temporary=Path.join(directory,'candidate.json'),completed=[];
 let stopped=null;
 try{
  FS.writeFileSync(temporary,original);
  for(let i=0;i<req.steps.length;i++){
   const step=req.steps[i];
   const ownedId=req.id+'_s'+(i+1);
   let result;
   try{result=execute(temporary,{...step,id:ownedId,campaign:req.campaign});}
   catch(error){stopped={beforeStep:i+1,reason:String(error.message||error).slice(0,180)};break;}
   if(!result?.ok||!result.applied){
    stopped={beforeStep:i+1,reason:result?.error||result?.message||
      'Original source owner could not apply this action'};break;
   }
   completed.push({index:i+1,mode:step.mode,system:step.system,
    operation:step.operation,clock:result.clock,output:result.output,
    events:result.events||[]});
   const state=E.importGame(FS.readFileSync(temporary,'utf8'));
   const check=result.output?.rules?.check;
   if(i<req.steps.length-1&&(
     result.output?.rules?.complication||
     check?.degree==='severe failure'||
     state.battle||state.encounter||
     state.table?.combatants?.player?.status!=='ok'&&
       state.table?.combatants?.player?.status!==undefined
   )){
    stopped={afterStep:i+1,reason:'Original outcome needs GM review before further actions'};
    break;
   }
  }
  if(!completed.length){
   return {id:req.id,ok:false,applied:false,stopped,
    error:stopped?.reason||'No sequence action was applied',stateHash:preHash};
  }
  const s=E.importGame(FS.readFileSync(temporary,'utf8'));
  if(!stopped){
   Pickup.apply(s,req,E.day(s));
   if(req.focus)s.chatRuntime.focus=req.focus;
  }
  const completedAll=!stopped,clock=E.clock(s);
  const output={sequence:{completed:completedAll,steps:completed,
   ...(stopped?{stopped}:{}),
   note:'Each step used its own real rule and original roll; an interruption prevents later steps.'}};
  const events=completed.flatMap(x=>x.events).slice(-12);
  const receipt={ok:true,clock,output,events};
  s.chatRuntime.applied ||= {};
  s.chatRuntime.revision=(Number(s.chatRuntime.revision)||0)+1;
  s.chatRuntime.applied[req.id]={revision:s.chatRuntime.revision,mode:'sequence',
   hash:requestHash,receipt};
  const next=E.exportGame(s)+'\n';
  // A stale original file must never be overwritten by local execution.
  if(hash(FS.readFileSync(savePath,'utf8'))!==preHash)
   return {id:req.id,ok:false,applied:false,
    error:'Concurrent save changed during sequence; reload without rerolling',stateHash:preHash};
  const out=savePath+'.sequence-tmp-'+process.pid;
  try{FS.writeFileSync(out,next,{flag:'wx'});FS.renameSync(out,savePath);}
  finally{if(FS.existsSync(out))FS.unlinkSync(out);}
  return {id:req.id,ok:true,applied:true,revision:s.chatRuntime.revision,
   stateHash:hash(next),clock,output,events,
   panel:P.core(s),hud:P.hudData(s),recap:E.recap(s)};
 }finally{FS.rmSync(directory,{recursive:true,force:true});}
}
module.exports={run};
