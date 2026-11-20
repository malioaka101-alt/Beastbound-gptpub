'use strict';
// ISOLATED SOURCE-LAW CONTRACT TEST ONLY. This disposable fixture explicitly
// substitutes a synthetic earlier Stage V web and synthetic source witnesses
// to exercise the advanced NPC transition *logic*. It is NEVER a campaign
// save, proof of 108 opened Gates, a valid original offscreen day, an earned
// stage or an alternative production progression route.
// Production verify() still calls original Web.verify and real Offscreen
// proof; these stubs exist exclusively in this Node VM test boundary.
const A=require('node:assert/strict'),FS=require('node:fs'),
 VM=require('node:vm'),Path=require('node:path'),
 E=require('../engine.js'),Core=require('../rules/core'),
 Gate=require('../rules/meridian-shared-original-gates'),
 Law=require('../rules/meridian-shared-original-advanced');
const file=Path.resolve(__dirname,'../world/independent-meridian-advanced.js'),
 source=FS.readFileSync(file,'utf8'),
 mod={exports:{}};
const prior={
 stage:5,stability:95,
 energy:{maxQi:500,currentQi:500,flow:20,recovery:45,
  originalCapacityOwner:'rules/build.js:meridianProfile'},
 routes:[{id:'route_extraordinary',kind:'extraordinary',load:1,
  integrity:2,required:2,injuries:[],
  segments:[{kind:'extraordinary',number:1}],gates:[1],
  originalMapSourceHash:'m'.repeat(64)}],
 sessions:[{source:{day:0}}],
 originalStageFiveSourceHash:'w'.repeat(64)
};
const stub={
 './independent-meridian-web':{verify:()=>true},
 './independent-offscreen-meridian':{chance:p=>{
  const base={curious:66,steady:59,independent:51,reserved:39}[p.personality];
  return Math.max(10,base-(p.fatigue>=55?15:0));
 }},
 './independent-original-power-days':{
  opportunityEvidence:(ctx,kind)=>({
   origin:'test-only-disposable-original-actor-opportunity',
   actorId:ctx.actor.actorId,kind,
   privatePhysicalSite:ctx.site,
   originalShiftHash:ctx.originalShiftHash,
   originalWorkDay:ctx.workDay}),
  verifyEvidence:()=>true
 },
 './lived-places':{location:()=>({name:'Disposable settlement',
  biome:'settlement'})},
 '../rules/meridian-shared-original-gates':Gate,
 '../rules/meridian-shared-original-advanced':Law,
 '../rules/core':Core
};
VM.runInNewContext(source+'\nmodule.exports.__diagnose={initial,compute,action,params,plan};',{module:mod,require:id=>{
 if(id==='node:crypto')return require('node:crypto');
 if(!Object.hasOwn(stub,id))
  throw Error('Isolated source-law test attempted unexpected import '+id);
 return stub[id];
 },structuredClone,console});
const Advanced=mod.exports;
const game=E.newGame({name:'Disposable only — advanced original law',
 seed:605911});
game.log||=[];game.table||={};game.table.combatants||={};
const p={id:'person_1',actorId:'emergent:person_1',
 originHash:'a'.repeat(64),
 mechanicalFoundation:{seal:'f'.repeat(64),
  baselineAttributes:{str:11,dex:13,con:18,int:12,wis:18,cha:11}},
 personality:'curious',fatigue:0,rngState:0x91e10da5,
 originalMeridianWeb:structuredClone(prior),
 originalMeridianGates:{gates:Array.from({length:108},(_,i)=>{
  const g=Gate.gateSpec(i+1);
  return {number:i+1,band:g.band,quality:'Sound'};
 })}};
const body={npcOrigin:{seal:'b'.repeat(64)},name:'Source-only test adult',
 status:'ok',stamina:1000,maxStamina:1000,wounds:[0,0,0]};
game.table.combatants['npc_'+p.id]=body;
let reached=5,acceptedCare=null,days=0;
for(let day=1;day<=600;day++){
 game.world.minutes=(day+1)*1440;
 const rng=game.rngState,log=JSON.stringify(game.log);
 let r;
 try{
  r=Advanced.afterDaily(game,{actor:p,body,workDay:day,
   site:'crossing',originalShiftHash:'c'.repeat(64)});
 }catch(err){
  const current=p.originalMeridianAdvanced,last=current?.sessions?.at(-1),
   replay=last&&Advanced.__diagnose.compute(game,p,
    p.originalMeridianWeb,Advanced.__diagnose.initial(p),last.source,last.seal);
  console.error('ISOLATED DEBUG replay',JSON.stringify({
   day,error:err.message,rng:p.rngState,
   source:last?.source,
   stored:current?{stage:current.stage,track:current.track,
    achieved:current.achieved,energy:current.energy,
    stability:current.stability,
    burden:current.originalConstitutionBurden}:null,
   replay:replay?{stage:replay.stage,track:replay.track,
    achieved:replay.achieved,energy:replay.energy,
    stability:replay.stability,
    burden:replay.originalConstitutionBurden}:null
  }));
  throw err;
 }
 A.equal(game.rngState,rng,'Only original personal owner RNG may be used');
 A.equal(JSON.stringify(game.log),log,
  'A remote authentic individual check may not leak to player event log');
 A.equal(Advanced.verify(game,p),true,
  'Original advanced stage law remains source-replayable in isolated fixture');
 if(r){
  A.equal(r.noPlayerKnowledge,true);
  A.equal(r.sourceHash,p.originalMeridianAdvanced.sessions.at(-1).seal);
  const q=p.originalMeridianAdvanced.sessions.at(-1).source;
  A.ok(['map','practice','form','care'].includes(q.action));
  A.equal(q.originalStageFiveWebHash,prior.originalStageFiveSourceHash);
  A.equal(q.noFreeHumanEvolutionBloodlineOrBeastAbility,true);
  if(q.target===8){
   A.equal(q.radiusMetres,3);
   A.equal(q.environmentBiome,'settlement');
  }
  if(q.action==='care'&&q.accepted){acceptedCare=q;days=day;break;}
 }
 if(p.originalMeridianAdvanced?.stage)
  reached=Math.max(reached,p.originalMeridianAdvanced.stage);
}
A.equal(reached,9,
 'The four distinct existing Stage VI–IX original checks can each be earned in a synthetic source-law contract');
A.ok(acceptedCare,'Source-owned Stage IX personal metabolic care can resolve after a true successful Stage IX check');
A.equal(acceptedCare.qiSpent,Law.maintenance({minutes:45}).qiSpent);
A.equal(acceptedCare.staminaSpent,Law.maintenance({minutes:45}).staminaSpent);
A.equal(acceptedCare.check.dc,19);
A.ok(p.originalMeridianAdvanced.originalConstitutionBurden>=0);
A.ok(p.originalMeridianAdvanced.originalConstitutionBurden<=10);
for(const stage of [6,7,8,9]){
 const milestone=p.originalMeridianAdvanced.achieved[stage];
 A.ok(milestone,'Each original advanced source must produce its OWN witnessed source hash');
 A.equal(milestone.noFreeHumanEvolutionOrUnlearnedTechnique,true);
}
const last=p.originalMeridianAdvanced.sessions.at(-1);
last.source.check.dc=2;
A.equal(Advanced.verify(game,p),false,
 'A re-authored original Stage IX maintenance DC cannot survive replay');
console.log('ISOLATED noncanonical advanced adapter contract PASS: existing source Stage VI–IX genuine Core math, finite Qi and body, local domain, distinct earned physiology and ongoing original metabolic care; not a production history');
