'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path');
const Engine=require('../engine'),Turn=require('../scripts/chat-turn');
const Preflight=require('../scripts/turn-preflight');
const {verify}=require('../scripts/verified-local-turn');
const Crypto=require('node:crypto');
const sha=x=>Crypto.createHash('sha256').update(x).digest('hex');
function fixture(seed=910190){
 const s=Engine.newGame({seed,name:'Fast Turn Fixture',path:'meridian'});
 s.world.location='crossing';s.chatRuntime ||= {revision:0,applied:{},focus:[]};
 return s;
}
function temporary(s,run){
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-fast-turn-test-'));
 try{
  const save=Path.join(dir,'save.json');
  FS.writeFileSync(save,Engine.exportGame(s)+'\n');
  return run(save);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
{
 const p={id:'fast_910190',mode:'sequence',steps:[
  {mode:'rule',system:'world',operation:'wait',params:{minutes:17}},
  {mode:'rule',system:'world',operation:'wait',params:{minutes:23}}
 ],scene:'At the original crossing after forty ordinary minutes.',
  summary:'Ordinary time passed, without awarding anything.',focus:['Look at the roads']};
 Preflight.validate(p);
 for(const bad of [
  {...p,id:'x'}, {...p,steps:[p.steps[0]]},
  {...p,steps:[...p.steps,{mode:'rule',system:'combat',operation:'exchange',params:{}}]},
  {...p,steps:[p.steps[0],{mode:'act',action:'fight'}]},
  {...p,scene:'x'.repeat(451)},
  {...p,chosenRoll:20}
 ])A.throws(()=>Preflight.validate(bad));
 const s=fixture(),old=s.world.minutes,rng=s.rngState;
 temporary(s,save=>{
  const result=Turn.execute(save,p);
  A.equal(result.ok,true);A.equal(result.applied,true);
  A.equal(result.output.sequence.completed,true);
  A.equal(result.output.sequence.steps.length,2);
  const output=FS.readFileSync(save,'utf8'),fresh=Engine.importGame(output);
  A.equal(fresh.world.minutes,old+40);
  A.equal(fresh.rngState,rng,'pure waiting never selects a dice value');
  A.equal(fresh.chatRuntime.scene,p.scene);
  A.equal(fresh.chatRuntime.journal.at(-1).text,p.summary);
  A.equal(fresh.player.coins,s.player.coins);
  A.equal(fresh.chatRuntime.applied[p.id+'_s1'].receipt.output.rules.waited,true);
  A.equal(fresh.chatRuntime.applied[p.id+'_s2'].receipt.output.rules.waited,true);
  const replay=Turn.execute(save,p);
  A.equal(replay.duplicate,true);A.equal(replay.recovered,true);
  A.equal(FS.readFileSync(save,'utf8'),output,'replayed sequence must not change save');
 });
}
{
 const s=fixture(910191),old=s.world.minutes;
 temporary(s,save=>{
  const q={id:'fast_stop_910191',mode:'sequence',steps:[
   {mode:'rule',system:'world',operation:'wait',params:{minutes:16}},
   {mode:'rule',system:'health',operation:'sleep',params:{hours:1}},
   {mode:'rule',system:'world',operation:'wait',params:{minutes:999}}
  ],scene:'Must not apply because the sequence stopped.'};
  const out=Turn.execute(save,q);
  A.equal(out.ok,true);A.equal(out.applied,true);
  A.equal(out.output.sequence.completed,false);
  A.equal(out.output.sequence.stopped.beforeStep,2);
  const next=Engine.importGame(FS.readFileSync(save,'utf8'));
  A.equal(next.world.minutes,old+16);
  A.notEqual(next.chatRuntime.scene,q.scene);
  A.equal(next.chatRuntime.applied.fast_stop_910191_s2,undefined);
 });
}
{
 const s=fixture(910192);temporary(s,save=>{
  const before=FS.readFileSync(save,'utf8'),expectedHash=sha(before);
  const req={id:'fast_scene_910192',mode:'rule',system:'world',operation:'wait',
   params:{minutes:12},scene:'A new safe pickup after an ordinary wait.',
   summary:'The person saw no quest reward.'};
  const res=Turn.execute(save,{...req,expectedHash});
  A.equal(res.applied,true);
  const next=Engine.importGame(FS.readFileSync(save,'utf8'));
  A.equal(next.chatRuntime.scene,req.scene);
  A.equal(next.chatRuntime.journal.at(-1).text,req.summary);
  const failed=Turn.execute(save,{...req});
  A.equal(failed.ok,false);
  A.match(failed.error,/already used/);
 });
}
{
 const s=fixture(910193);
 temporary(s,save=>{
  A.throws(()=>verify({root:Path.resolve(__dirname,'..'),sourceHead:'bad',
    savePath:save,saveBlobSha:'bad',saveHash:'bad'}),/Node 22|verified|GitHub/);
 });
}
console.log('Fast turn sequence: original actions once, bounded interruptions, replay safety, pickup-scene atomicity and source verification guards');
