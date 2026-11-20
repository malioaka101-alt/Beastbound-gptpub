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
 Combat=require('../rules/combat'),
 Gates=require('../rules/meridian-shared-original-gates'),
 SeaLaw=require('../rules/meridian-shared-original-sea'),
 WebLaw=require('../rules/meridian-shared-original-web');
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
 '../rules/meridian-shared-original-sea':SeaLaw,
 '../rules/meridian-shared-original-gates':Gates,
 './independent-meridian-gates':{verify:()=>true},
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
  throw Error('Stage VI needs its original separate source owner')}}
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
  site:'crossing',originalShiftHash:'c'.repeat(64)});
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
let observed=0,completed=false,blockedByInjury=false;
for(let day=2;day<=140;day++){
 s.world.minutes=(day+1)*1440;
 const shared=s.rngState,log=JSON.stringify(s.log);
 const result=Web.afterDaily(s,{actor:p,body,workDay:day,
  site:'crossing',originalShiftHash:'c'.repeat(64)});
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
 }
 if(p.originalMeridianWeb?.stage===5){completed=true;break;}
 if(p.originalMeridianWeb?.routes.some(r=>
  r.injuries.some(x=>!x.healed))){blockedByInjury=true;break;}
}
A.ok(observed>0,'True independent original Web mapping/practice resolves checks');
A.ok(completed||blockedByInjury,
 'The actual source either forms a physically connected Stage V web or blocks on untreated pressure injury');
if(completed){
 A.equal(p.originalMeridianWeb.stage,5);
 A.equal(WebLaw.spanning(p.originalMeridianWeb.routes,
  p.originalMeridianWeb.stability).ready,true);
}else{
 A.equal(p.originalMeridianWeb.stage,4);
 A.ok(blockedByInjury,'An unhealed Meridian source injury is never silently repaired');
}
const pristine=structuredClone(p),
 latest=p.originalMeridianWeb.sessions.at(-1);
latest.source.noAdditionalPlayerTime=false;
latest.seal=Crypto.createHash('sha256').
 update(JSON.stringify(latest.source)).digest('hex');
A.equal(Web.verify(s,p),false,
 'Resealing an invented source that claims an additional world-time turn must not pass');
A.equal(Web.verify(s,pristine),true);
console.log('ISOLATED Stage IV/V source owner PASS: true Core d20, 108 prerequisite contract, actual Dantian Sea at 8 Qi, private replay, Stage V physical mapped routes, real costs/healed graph or clinical blockage; no production progression forged');
