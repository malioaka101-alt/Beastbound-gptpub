'use strict';
// #177: reuse the existing Meridian Stage II track and original 108-Gate
// source instead of building a generic or competing cultivation ladder.
// The original Disciplines, Potential, Difficulty, Core, Combat and Build
// formulas own all actual per-person progress, consequences and anatomy.
const Crypto=require('node:crypto'),
 Core=require('../rules/core'),Combat=require('../rules/combat'),
 Disc=require('../rules/disciplines'),Potential=require('../rules/potential-mechanics'),
 Difficulty=require('../rules/dynamic-difficulty'),Build=require('../rules/build'),
 Gate=require('../rules/meridian-shared-original-gates'),
 Meridian=require('./independent-offscreen-meridian'),
 Offscreen=require('./independent-original-power-days');
const ORIGIN='source-owned-independent-meridian-existing-ladder-v1',
 PREP='original-independent-meridian-awakening-practice-v1',
 RITE='original-independent-meridian-stage-two-awakening-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const num=x=>Number.isInteger(x)&&x>=0;
const methods=Disc.KEYS.meridian.focus;
const pointsNeeded=Disc.KEYS.meridian.tracks.awakening[0];
const baseDC=Disc.KEYS.meridian.tracks.awakening[1];
const foundationSeal=p=>{
 const r=p?.meridianTraining;
 if(!r||r.earnedStage!==1||r.target!=='awakening'||
  !Array.isArray(r.sessions))return null;
 const last=r.sessions.at(-1);
 return last?.source?.outcome==='breakthrough'&&
  last.source.earnedStageAfter===1?last.seal:null;
};
function newRecord(p){
 return {origin:ORIGIN,foundationRiteSeal:foundationSeal(p),stage:1,
  awakening:{target:'awakening',points:0,methods:{},
   sessions:[],lastAttemptDay:-1,cooldownUntil:0},
  primaryMapped:0,awareness:0,energy:null,
  completedAtMinute:null,originalStageTwoSourceHash:null};
}
function check(s,p,modifier,dc,description){
 const oldLog=s.log.slice();
 try{return Core.check(s,{modifier,dc,label:description,
  independentRngOwner:p,privateDisplay:true});}
 finally{s.log.splice(0,s.log.length,...oldLog);}
}
function chance(p){return Meridian.chance(p);}
function originalSource(ctx,origin,r,details){
 const x=Offscreen.opportunityEvidence(ctx,'meridian'),
  person=ctx.actor;
 return {origin,system:'meridian',actorId:person.actorId,
  individualOriginHash:person.originHash,
  originalFoundationSeal:person.mechanicalFoundation.seal,
  originalCombatEntrySeal:ctx.body.npcOrigin.seal,
  originalFoundationRiteHash:r.foundationRiteSeal,
  target:'awakening',originalShiftHash:ctx.originalShiftHash,
  originalSceneHash:hash(x),offscreenOpportunity:x,
  day:ctx.workDay,startMinute:ctx.workDay*1440+600,
  personalityAtAttempt:person.personality,
  fatigueAtAttempt:person.fatigue,originalSkillRankBonus:0,...details};
}
function verify(s,p){
 const r=p?.originalMeridianLadder;
 if(r===undefined)return true;
 const previous=foundationSeal(p);
 if(!previous||!r||r.origin!==ORIGIN||
  r.foundationRiteSeal!==previous||
  ![1,2].includes(r.stage)||
  !num(r.primaryMapped)||!num(r.awareness)||
  !r.awakening||r.awakening.target!=='awakening'||
  !Array.isArray(r.awakening.sessions)||
  r.awakening.sessions.length<1||r.awakening.sessions.length>480||
  !num(r.awakening.points)||r.awakening.points>pointsNeeded||
  !r.awakening.methods||typeof r.awakening.methods!=='object'||
  Array.isArray(r.awakening.methods)||
  !Number.isInteger(r.awakening.lastAttemptDay)||
  r.awakening.lastAttemptDay<0||
  !num(r.awakening.cooldownUntil))
  return false;
 const body=s.table?.combatants?.['npc_'+p.id],foundation=
  p.mechanicalFoundation;
 if(!body?.npcOrigin||body.npcOrigin.actorId!==p.actorId||
  body.npcOrigin.foundationSeal!==foundation?.seal||
  !Object.values(foundation.unassessedPotential||{}).every(Number.isInteger))
  return false;
 let points=0,currentMethods={},cooldown=0,lastDay=-1,
  endMinute=0,awakened=false,sourceHash=null;
 const prior=[],track=Disc.KEYS.meridian.tracks.awakening;
 for(const row of r.awakening.sessions){
  const q=row?.source;
  if(!q||row.seal!==hash(q)||awakened||
   ![PREP,RITE].includes(q.origin)||
   q.system!=='meridian'||q.target!=='awakening'||
   q.actorId!==p.actorId||q.individualOriginHash!==p.originHash||
   q.originalFoundationSeal!==foundation.seal||
   q.originalCombatEntrySeal!==body.npcOrigin.seal||
   q.originalFoundationRiteHash!==previous||
   q.originalSkillRankBonus!==0||
   !num(q.day)||q.day<=lastDay||
   !num(q.startMinute)||q.startMinute<endMinute||
   q.day!==Math.floor(q.startMinute/1440)||
   !num(q.actualMinutes)||q.startMinute+q.actualMinutes>s.world.minutes||
   !num(q.rngBefore)||q.rngBefore<1||
   !num(q.rngAfter)||q.rngAfter<1||
   !['reserved','curious','steady','independent'].includes(q.personalityAtAttempt)||
   !num(q.fatigueAtAttempt)||q.fatigueAtAttempt>100||
   q.choiceChance!==chance({personality:q.personalityAtAttempt,
     fatigue:q.fatigueAtAttempt})||
   q.pointsBefore!==points||q.cooldownBefore!==cooldown||
   !Offscreen.verifyEvidence(s,p,q))
   return false;
  const roll={rngState:q.rngBefore};
  if(q.choiceD100!==Core.die(roll,100)||
   q.accepted!==(q.choiceD100<=q.choiceChance)||q.day<cooldown)
   return false;
  if(q.origin===PREP){
   if(q.noAutomaticRankOrStage!==true||
    q.method===undefined||q.accepted&&q.actualMinutes!==120||
    !q.accepted&&q.actualMinutes!==5||
    q.maxStaminaAtAttempt!==null&&
     (!num(q.maxStaminaAtAttempt)||q.maxStaminaAtAttempt<1))
    return false;
   if(q.accepted){
    if(q.staminaCost!==1||q.staminaBefore<1||
     q.staminaBefore>q.maxStaminaAtAttempt||
     q.staminaAfter!==q.staminaBefore-1||
     q.methodNumber!==Core.die(roll,methods.length)||
     q.method!==methods[q.methodNumber-1]||
     !q.check||q.check.roll!==Core.die(roll,20))
     return false;
    const dc=Difficulty.disciplinePractice(s,{
     system:'meridian',method:q.method,
     record:{target:'awakening',methods:currentMethods},
     baseDC:track[1],independent:true,short:true,
     originalPhysicalOwner:{stamina:q.staminaBefore,
      maxStamina:q.maxStaminaAtAttempt},
     originalTrainingWitnesses:prior}).dc,
     aptitude=Potential.bonus(foundation.unassessedPotential[
      Potential.METHODS.meridian[q.method]]),
     modifier=Math.floor((foundation.baselineAttributes.wis-10)/2)+aptitude,
     margin=q.check.roll+modifier+
      Core.naturalAdjustment(q.check.roll)-dc,
     degree=Core.degree(margin),
     earned=Core.progress(degree)+(margin>=0?Math.max(0,aptitude):0);
    if(q.check.dc!==dc||q.check.modifier!==modifier||
     q.check.degree!==degree||q.check.success!==(margin>=0)||
     q.check.earned!==earned||
     q.pointsAfter!==Math.min(pointsNeeded,points+earned))
     return false;
    if(degree==='severe failure'){
     const complication=Core.die(roll,20),
      wounded=complication<=3||complication===14||complication===15;
     if(q.complicationRoll!==complication||
      q.originalPhysicalInjury!==wounded||
      q.cooldownUntil!==(complication<=5?q.day+6:cooldown))
      return false;
    }else if(q.complicationRoll!==null||
     q.originalPhysicalInjury!==false||
     q.cooldownUntil!==cooldown)return false;
    if(!Array.isArray(q.woundsBefore)||q.woundsBefore.length!==3||
     q.woundsBefore.some(x=>x!==0)||
     JSON.stringify(q.woundsAfter)!==JSON.stringify(
      q.originalPhysicalInjury?[1,0,0]:[0,0,0]))
     return false;
    points=q.pointsAfter;
    currentMethods[q.method]=(currentMethods[q.method]||0)+1;
    prior.push({system:'meridian',target:'awakening',
     method:q.method,minutes:120,startMinute:q.startMinute,
     eventHash:row.seal});
   }else if(q.method!==null||q.methodNumber!==null||
    q.check!==null||q.complicationRoll!==null||
    q.staminaCost!==0||q.staminaBefore!==null||
    q.staminaAfter!==null||q.maxStaminaAtAttempt!==null||
    q.originalPhysicalInjury!==false||
    q.woundsBefore!==null||q.woundsAfter!==null||
    q.pointsAfter!==points||q.cooldownUntil!==cooldown)
    return false;
   cooldown=q.cooldownUntil;
  }else{
   if(q.pointsBefore!==pointsNeeded||
    Object.keys(currentMethods).length<2||
    q.originalRiteDC!==baseDC+5||
    q.originalAptitudeDimension!==
     Potential.PRIMARY.meridian.awakening||
    q.originalAptitudeBonus!==Potential.bonus(
     foundation.unassessedPotential[
      Potential.PRIMARY.meridian.awakening])||
    q.accepted&&q.actualMinutes!==180||
    !q.accepted&&q.actualMinutes!==5||
    q.insightSpent!==0||q.feeTalons!==0||
    q.noFreeQiTechniqueOrOtherSystem!==true)return false;
   if(q.accepted){
    if(q.staminaBefore<1||
     q.maxStaminaBefore<q.staminaBefore||
     !q.check||q.check.roll!==Core.die(roll,20))
     return false;
    const modifier=Math.floor((foundation.baselineAttributes.wis-10)/2)+
      q.originalAptitudeBonus,
     margin=q.check.roll+modifier+
      Core.naturalAdjustment(q.check.roll)-q.originalRiteDC,
     degree=Core.degree(margin),successful=margin>=0,
     expectedCooldown=successful?cooldown:
      q.day+(degree==='setback'?12:degree==='failure'?24:30),
     expectedPoints=successful?0:degree==='severe failure'?
      Math.floor(points*.75):points,
     cap=successful?Build.meridianProfile(2,{meridians:12}):null;
    if(q.check.modifier!==modifier||
     q.check.degree!==degree||q.check.success!==successful||
     q.check.dc!==q.originalRiteDC||
     q.outcome!==(successful?'breakthrough':
      degree==='severe failure'?'backlash':'stalled')||
     q.cooldownUntil!==expectedCooldown||
     q.pointsAfter!==expectedPoints||
     q.originalPhysicalBacklash!==
      (degree==='severe failure')||
     q.primaryMappedAfter!==(successful?12:0)||
     q.awarenessAfter!==(successful?12:0)||
     JSON.stringify(q.energyAfter)!==JSON.stringify(cap?{
      maxQi:cap.qi,currentQi:cap.qi,flow:cap.flow,
      recovery:cap.recovery,
      originalCapacityOwner:'rules/build.js:meridianProfile'}:null)||
     !Array.isArray(q.woundsBefore)||
     q.woundsBefore.some(x=>x!==0)||
     JSON.stringify(q.woundsAfter)!==JSON.stringify(
      degree==='severe failure'?[1,0,0]:[0,0,0]))
     return false;
    cooldown=expectedCooldown;points=expectedPoints;
    if(successful){
     awakened=true;sourceHash=row.seal;currentMethods={};
    }
   }else if(q.check!==null||q.outcome!=='declined'||
    q.pointsAfter!==points||q.cooldownUntil!==cooldown||
    q.originalPhysicalBacklash!==false||
    q.energyAfter!==null||q.primaryMappedAfter!==0||
    q.awarenessAfter!==0||q.staminaBefore!==null||
    q.maxStaminaBefore!==null||q.woundsBefore!==null||
    q.woundsAfter!==null)return false;
   cooldown=q.cooldownUntil;
  }
  if(roll.rngState!==q.rngAfter)return false;
  lastDay=q.day;endMinute=q.startMinute+q.actualMinutes;
 }
 const saved=r.awakening;
 return saved.points===points&&saved.lastAttemptDay===lastDay&&
  saved.cooldownUntil===cooldown&&
  JSON.stringify(saved.methods)===JSON.stringify(currentMethods)&&
  r.stage===(awakened?2:1)&&
  r.primaryMapped===(awakened?12:0)&&
  r.awareness===(awakened?12:0)&&
  JSON.stringify(r.energy)===JSON.stringify(awakened?
   {maxQi:Build.meridianProfile(2,{meridians:12}).qi,
    currentQi:Build.meridianProfile(2,{meridians:12}).qi,
    flow:Build.meridianProfile(2,{meridians:12}).flow,
    recovery:Build.meridianProfile(2,{meridians:12}).recovery,
    originalCapacityOwner:'rules/build.js:meridianProfile'}:null)&&
  r.originalStageTwoSourceHash===(awakened?sourceHash:null)&&
  r.completedAtMinute===(awakened?
   saved.sessions.at(-1).source.startMinute:null);
}
function afterDaily(s,ctx){
 const p=ctx.actor,body=ctx.body,
  foundation=foundationSeal(p);
 if(!foundation||ctx.workDay<=p.meridianTraining.lastAttemptDay||
  body.status!=='ok'||body.stamina<1||
  body.wounds.some(x=>x!==0))return null;
 if(!Disc.verifyNpcMeridian(s,p)||!verify(s,p))
  throw Error('Original Meridian Stage I or later source was altered');
 let r=p.originalMeridianLadder;
 if(r?.stage===2)
  return require('./independent-meridian-gates').afterDaily(s,ctx);
 if(r?.awakening.lastAttemptDay>=ctx.workDay||
  r&&ctx.workDay<r.awakening.cooldownUntil)return null;
 if(Object.values(p.originalEarlyDisciplinePreparation||{}).
   some(x=>x.lastAttemptDay>=ctx.workDay))return null;
 if(!r)r=newRecord(p);
 if(r.awakening.sessions.length>=480)return null;
 const track=r.awakening;
 if(track.points>=pointsNeeded&&Object.keys(track.methods).length>=2)
  return attemptRite(s,ctx,r);
 if(track.points>=pointsNeeded)return null;
 const chanceD100=chance(p),startRng=p.rngState,
  choiceD100=Core.die(p,100),accepted=choiceD100<=chanceD100,
  stamina=body.stamina;
 let method=null,methodNumber=null,checkReceipt=null,complicationRoll=null,
  injury=false,cooldown=track.cooldownUntil,staminaCost=0,
  minutes=accepted?120:5,oldWounds=null,newWounds=null;
 const pointsBefore=track.points;
 if(accepted){
  methodNumber=Core.die(p,methods.length);
  method=methods[methodNumber-1];
  const prior=track.sessions.filter(x=>x.source.origin===PREP&&
   x.source.accepted).map(x=>({
    system:'meridian',target:'awakening',method:x.source.method,
    minutes:120,startMinute:x.source.startMinute,eventHash:x.seal})),
   dc=Difficulty.disciplinePractice(s,{
    system:'meridian',method,record:track,baseDC,
    independent:true,short:true,originalPhysicalOwner:body,
    originalTrainingWitnesses:prior}).dc,
   training=Disc.originalActorTrainingProfile(s,{
    actorId:p.actorId,system:'meridian',target:'awakening',method});
  staminaCost=1;oldWounds=[...body.wounds];body.stamina--;
  const checked=check(s,p,training.modifier,dc,'Private Meridian primary awakening');
  const earned=checked.progress+
   (checked.success?Math.max(0,training.potential.modifier):0);
  checkReceipt={roll:checked.roll,modifier:checked.modifier,dc:checked.dc,
   degree:checked.degree,success:checked.success,earned};
  track.points=Math.min(pointsNeeded,track.points+earned);
  track.methods[method]=(track.methods[method]||0)+1;
  if(checked.degree==='severe failure'){
   complicationRoll=Core.die(p,20);
   injury=complicationRoll<=3||complicationRoll===14||complicationRoll===15;
   if(injury)Combat.harm(s,body,2);
   if(complicationRoll<=5)cooldown=ctx.workDay+6;
  }
  newWounds=[...body.wounds];
 }
 const q=originalSource(ctx,PREP,r,{
  rngBefore:startRng,rngAfter:p.rngState,
  choiceD100,choiceChance:chanceD100,accepted,
  actualMinutes:minutes,method,methodNumber,check:checkReceipt,
  complicationRoll,originalPhysicalInjury:injury,
  staminaCost,staminaBefore:accepted?stamina:null,
  maxStaminaAtAttempt:accepted?body.maxStamina:null,
  staminaAfter:accepted?stamina-1:null,
  woundsBefore:oldWounds,woundsAfter:newWounds,
  pointsBefore,pointsAfter:track.points,
  cooldownBefore:track.cooldownUntil,cooldownUntil:cooldown,
  noAutomaticRankOrStage:true});
 track.sessions.push({source:q,seal:hash(q)});
 track.lastAttemptDay=ctx.workDay;track.cooldownUntil=cooldown;
 p.originalMeridianLadder=r;
 if(!verify(s,p))throw Error('Original Meridian Awakening practice source replay failed');
 return {kind:'original-meridian-primary-preparation',system:'meridian',
  actualOriginalCheck:accepted,sourceHash:hash(q),noPlayerKnowledge:true};
}
function attemptRite(s,ctx,r){
 const p=ctx.actor,body=ctx.body,track=r.awakening,
  sourceRng=p.rngState,startPoints=track.points,
  chanceD100=chance(p),choiceD100=Core.die(p,100),
  accepted=choiceD100<=chanceD100,
  initialStamina=body.stamina,maxStamina=body.maxStamina,
  beforeWounds=accepted?[...body.wounds]:null,
  training=Disc.originalActorTrainingProfile(s,{
   actorId:p.actorId,system:'meridian',target:'awakening'}),
  profile=Build.meridianProfile(2,{meridians:12}),
  oldCooldown=track.cooldownUntil;
 let outcome='declined',dc=baseDC+5,minutes=accepted?180:5,
  receipt=null,afterPoints=track.points,cooldown=track.cooldownUntil,
  injury=false,energy=null,primary=0,awareness=0;
 if(accepted){
  const actual=check(s,p,training.modifier,dc,
   'Private Meridian all-12-Primary Awakening rite');
  receipt={roll:actual.roll,modifier:actual.modifier,
   dc:actual.dc,degree:actual.degree,success:actual.success};
  if(actual.success){
   outcome='breakthrough';afterPoints=0;track.methods={};
   energy={maxQi:profile.qi,currentQi:profile.qi,flow:profile.flow,
    recovery:profile.recovery,
    originalCapacityOwner:'rules/build.js:meridianProfile'};
   primary=12;awareness=12;r.stage=2;r.primaryMapped=12;
   r.awareness=12;r.energy=energy;
   r.completedAtMinute=ctx.workDay*1440+600;
  }else if(actual.degree==='setback'){
   outcome='stalled';cooldown=ctx.workDay+12;
  }else if(actual.degree==='failure'){
   outcome='stalled';cooldown=ctx.workDay+24;
  }else{
   outcome='backlash';cooldown=ctx.workDay+30;
   afterPoints=Math.floor(startPoints*.75);
   Combat.harm(s,body,2);injury=true;
  }
 }
 track.points=afterPoints;track.cooldownUntil=cooldown;
 const q=originalSource(ctx,RITE,r,{
  rngBefore:sourceRng,rngAfter:p.rngState,
  choiceD100,choiceChance:chanceD100,accepted,
  actualMinutes:minutes,originalRiteDC:dc,
  originalAptitudeDimension:training.potential.dimension,
  originalAptitudeBonus:training.potential.modifier,
  pointsBefore:startPoints,pointsAfter:afterPoints,
  cooldownBefore:oldCooldown,
  cooldownUntil:cooldown,
  check:receipt,outcome,primaryMappedAfter:primary,
  awarenessAfter:awareness,energyAfter:energy,
  staminaBefore:accepted?initialStamina:null,
  maxStaminaBefore:accepted?maxStamina:null,
  woundsBefore:beforeWounds,woundsAfter:accepted?[...body.wounds]:null,
  originalPhysicalBacklash:injury,
  insightSpent:0,feeTalons:0,
  noFreeQiTechniqueOrOtherSystem:true});
 track.sessions.push({source:q,seal:hash(q)});
 track.lastAttemptDay=ctx.workDay;
 if(outcome==='breakthrough')r.originalStageTwoSourceHash=hash(q);
 if(!verify(s,p))throw Error('Original Meridian Stage II rite failed source replay');
 return {kind:'original-meridian-awakening-rite',system:'meridian',
  actualOriginalCheck:accepted,outcome,sourceHash:hash(q),
  noPlayerKnowledge:true};
}
module.exports={ORIGIN,PREP,RITE,afterDaily,verify};
