'use strict';
// ISOLATED SOURCE CONTRACT ONLY. The fully source-replayed prior 108 Gates
// are synthetic inside this VM. Production Stage IV and V still require the
// actual original Stage II and 108 personally earned Gate receipts. We use
// TRUE Core.check RNG, original Stage IV source laws and original Stage V
// route/Qi/anatomy logic for all NEW sessions, without forcing outcomes.
const A=require('node:assert/strict'),FS=require('node:fs'),
 Path=require('node:path'),VM=require('node:vm'),
 Crypto=require('node:crypto'),
 E=require('../engine.js'),C=require('../rules/core'),
 Combat=require('../rules/combat'),Build=require('../rules/build'),
 Gates=require('../rules/meridian-shared-original-gates'),
 SeaLaw=require('../rules/meridian-shared-original-sea'),
 WebLaw=require('../rules/meridian-shared-original-web'),
 Night=require('../world/independent-meridian-night-qi');
const chance=p=>{
 const original={curious:66,steady:59,independent:51,reserved:39}[p.personality];
 return Math.max(10,original-(p.fatigue>=55?15:0));
};
const witness={
 opportunityEvidence:(ctx,kind)=>({
  origin:'disposable-source-only-day',actorId:ctx.actor.actorId,
  kind,privatePhysicalSite:ctx.site,originalWorkDay:ctx.workDay,
  originalShiftHash:ctx.originalShiftHash}),
 verifyEvidence:()=>true
};
const seaStub={
 '../rules/core':C,'../rules/combat':Combat,
 '../rules/build':Build,
 '../rules/meridian-shared-original-sea':SeaLaw,
 '../rules/meridian-shared-original-gates':Gates,
 './independent-meridian-gates':{verify:()=>true},
 './independent-meridian-night-qi':Night,
 './independent-offscreen-meridian':{chance},
 './independent-original-power-days':witness
};
function load(name,extra={}){
 const mod={exports:{}},
  src=FS.readFileSync(Path.resolve(__dirname,'../world/'+name+'.js'),'utf8'),
  stubs={...seaStub,...extra};
 VM.runInNewContext(src,{module:mod,structuredClone,console,
  require:id=>{
   if(id==='node:crypto')return Crypto;
   if(!Object.hasOwn(stubs,id))
    throw Error('Unexpected isolated Stage IV/V source owner: '+id);
   return stubs[id];
  }});
 return mod.exports;
}
const Sea=load('independent-meridian-sea');
const Web=load('independent-meridian-web',{
 '../rules/meridian-shared-original-web':WebLaw,
 './independent-meridian-sea':{verify:(s,p)=>Sea.verify(s,p)},
 './independent-meridian-advanced':{afterDaily:()=>{
  throw Error('Stage VI needs its original separate source owner')}},
 './lived-places':{location:()=>({biome:'settlement'})}
});
const s=E.newGame({seed:988127,name:'Disposable original Dantian/Web source'});
s.table||={};s.table.combatants||={};
const p={id:'disposable_human',actorId:'emergent:disposable_human',
 originHash:'a'.repeat(64),mechanicalFoundation:{seal:'f'.repeat(64),
 baselineAttributes:{str:12,dex:12,con:16,int:12,wis:20,cha:11}},
 meridianTraining:{foundationQuality:'Perfect'},
 originalMeridianGates:{
  stage:3,originalAwakeningSourceHash:'s'.repeat(64),
  sessions:[{source:{day:0}}],
  energy:{maxQi:500,currentQi:500,flow:20,recovery:35,
   originalCapacityOwner:'rules/build.js:meridianProfile'},
  gates:Array.from({length:108},(_,i)=>({
   number:i+1,band:Gates.gateSpec(i+1).band,
   quality:'Perfect',sourceHash:(''+(i+1)).padStart(64,'g')
  }))},
 personality:'curious',fatigue:0,rngState:0x91e10da5
};
const body={npcOrigin:{seal:'b'.repeat(64)},status:'ok',
 stamina:1000,maxStamina:1000,wounds:[0,0,0]};
s.table.combatants['npc_'+p.id]=body;
// Select only the isolated RNG seed for a substantive high-quality original
// Core roll; the engine, not the test, still resolves this future action.
let sourceSeed=null;
for(let n=1;n<15000;n++){
 const roller={rngState:n},
  c=C.die(roller,100);
 C.die(roller,SeaLaw.METHODS.length);
 if(c<=66&&C.die(roller,20)===20){sourceSeed=n;break;}
}
A.ok(sourceSeed);
p.rngState=sourceSeed;
s.world.minutes=2*1440;
const beforeShared=s.rngState,playerLog=JSON.stringify(s.log),
 seaResult=Sea.afterDaily(s,{actor:p,body,workDay:1,
  site:'crossing',loc:{biome:'settlement'},
  originalShiftHash:'c'.repeat(64)});
A.equal(Sea.verify(s,p),true);
A.equal(seaResult.formed,true);
A.equal(s.player.meridian.stage,0);
A.equal(s.rngState,beforeShared);
A.equal(JSON.stringify(s.log),playerLog);
A.equal(p.originalMeridianSea.stage,4);
A.equal(p.originalMeridianSea.sea.rings,1);
const seaSource=p.originalMeridianSea.attempts.at(-1).source;
A.equal(seaSource.originalStageThreeGateHash,
 p.originalMeridianGates.gates[107].sourceHash);
A.equal(seaSource.check.roll,20);
A.equal(seaSource.check.earned,5);
A.equal(seaSource.qiSpent,8);
A.equal(seaSource.staminaSpent,1);
A.equal(body.stamina,999);
A.equal(seaSource.noAdditionalWorldTime,true);
// Disposable source-contract only: select personal RNG seeds BEFORE test
// actions to exercise a real severe pressure failure, free refusal, then
// independently checked self-care. Production NPC RNG is NEVER selectable.
const seed=(want)=>{
 for(let n=1;n<200000;n++){
  const roller={rngState:n},choice=C.die(roller,100);
  if(want==='decline'&&choice>66)return n;
  if(want!=='decline'&&choice<=66&&
   C.die(roller,20)===(want==='injury'?1:20))
   return n;
 }
 throw Error('Disposable deterministic RNG fixture not found');
};
const severeSeed=seed('injury'),declinedSeed=seed('decline'),
 healSeed=seed('heal');
let observed=0,completed=false,blockedByInjury=false,
 placedInjury=false,careRefused=false,careHealed=false,
 injuryReceiptHash=null;
for(let day=2;day<=220;day++){
 const active=p.originalMeridianWeb,
  untreated=active?.routes.find(r=>r.injuries.some(x=>!x.healed));
 if(active?.routes.length===3&&!placedInjury&&!untreated&&
  active.routes.some(r=>r.integrity<r.required)){
  p.rngState=severeSeed;placedInjury=true;
 }else if(untreated&&!careRefused){
  p.rngState=declinedSeed;
 }else if(untreated&&careRefused&&!careHealed){
  p.rngState=healSeed;
 }
 s.world.minutes=(day+1)*1440;
 const shared=s.rngState,log=JSON.stringify(s.log);
 const result=Web.afterDaily(s,{actor:p,body,workDay:day,
  site:'crossing',loc:{biome:'settlement'},
  originalShiftHash:'c'.repeat(64)});
 A.equal(s.rngState,shared);
 A.equal(JSON.stringify(s.log),log);
 A.equal(Sea.verify(s,p),true);
 A.equal(Web.verify(s,p),true,'Every actual new web source must replay');
 if(result){
  observed++;
  const q=p.originalMeridianWeb.sessions.at(-1).source;
  A.equal(q.originalStageFourSeaHash,
   p.originalMeridianSea.attempts.at(-1).seal);
  A.equal(q.noOtherSystemTechniqueOrStageGranted,true);
  A.equal(q.noAdditionalPlayerTime,true);
  A.equal(q.actionType,result.originalActionType);
  if(q.accepted)A.ok(q.check.roll>=1&&q.check.roll<=20);
  if(q.pressureInjury){
   const route=p.originalMeridianWeb.routes.find(r=>r.id===q.routeId);
   injuryReceiptHash=route.injuries.at(-1).sourceHash;
   A.equal(injuryReceiptHash,p.originalMeridianWeb.sessions.at(-1).seal);
   A.equal(route.injuries.at(-1).healed,false);
  }
  if(q.actionType==='care'){
   A.equal(q.originalPressureInjuryHash,injuryReceiptHash);
   A.equal(q.originalMedicalSkillRank,0);
   A.equal(q.originalCareSite,'crossing');
   A.equal(q.selfCareNotPhysicianTreatment,true);
   A.equal(q.qiSpent,0);
   A.equal(q.staminaSpent,q.accepted?1:0);
   A.equal(q.check?.dc,q.accepted?12+4+
    p.originalMeridianWeb.routes.find(r=>r.id===q.routeId).injuries.
     find(x=>x.sourceHash===injuryReceiptHash).loss:undefined);
   if(!q.accepted){
    careRefused=true;
    A.equal(q.careStabilityRecovered,0);
    A.equal(q.careSucceeded,false);
    A.ok(p.originalMeridianWeb.routes.some(r=>
     r.injuries.some(x=>!x.healed)));
   }else if(q.careSucceeded){
    careHealed=true;
    A.ok(q.careStabilityRecovered>0);
    A.ok(p.originalMeridianWeb.routes.every(r=>
     r.injuries.every(x=>x.healed)));
   }
  }
 }
 if(p.originalMeridianWeb?.stage===5){completed=true;break;}
 if(day===220&&p.originalMeridianWeb?.routes.some(r=>
  r.injuries.some(x=>!x.healed))){blockedByInjury=true;}
}
A.ok(observed>0,'True independent original Web mapping/practice resolves checks');
A.equal(placedInjury,true,'True original pressure check reached its selected fixture seed');
A.ok(injuryReceiptHash,'The actual source-owned severe check generated an injury');
A.equal(careRefused,true,'Independent refusal cannot heal an existing injury. '+JSON.stringify({
 observed,placedInjury,careHealed,completed,blockedByInjury,
 lastAction:p.originalMeridianWeb?.sessions.at(-1)?.source.actionType,
 lastDay:p.originalMeridianWeb?.sessions.at(-1)?.source.day,
 routeInjuries:p.originalMeridianWeb?.routes.map(x=>({
  id:x.id,injuries:x.injuries,integrity:x.integrity,
  required:x.required
 })),energy:p.originalMeridianWeb?.energy,
 bodyStamina:body.stamina,
 seeds:{severeSeed,declinedSeed,healSeed},
 careRows:p.originalMeridianWeb.sessions.filter(x=>
  x.source.actionType==='care').map(x=>({day:x.source.day,
   rngBefore:x.source.rngBefore,choice:x.source.choiceD100,
   chance:x.source.choiceChance,accepted:x.source.accepted,
   healed:x.source.careSucceeded,roll:x.source.check?.roll}))
}));
A.equal(careHealed,true,'A later real original Medicine check can heal precisely that injury');
A.ok(completed||blockedByInjury,
 'The actual source either forms a physically connected Stage V web or blocks on untreated pressure injury');
if(completed){
 A.equal(p.originalMeridianWeb.stage,5);
 A.equal(WebLaw.spanning(p.originalMeridianWeb.routes,
  p.originalMeridianWeb.stability).ready,true);
}else{
 A.equal(p.originalMeridianWeb.stage,4);
 A.equal(careHealed,true,'No unstated free medical reset is permitted');
}
const pristine=structuredClone(p),
 latest=p.originalMeridianWeb.sessions.at(-1);
latest.source.noAdditionalPlayerTime=false;
latest.seal=Crypto.createHash('sha256').
 update(JSON.stringify(latest.source)).digest('hex');
A.equal(Web.verify(s,p),false,
 'Resealing an invented source that claims an additional world-time turn must not pass');
A.equal(Web.verify(s,pristine),true);
console.log('ISOLATED Stage IV/V source owner PASS: actual independent pressure deviation, separate refused self-care, accepted original Medicine roll, real Stamina/time source and healed anatomical graph; synthetic earlier 108 Gates remain TEST-ONLY, not production completion');
