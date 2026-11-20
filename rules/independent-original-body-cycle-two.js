'use strict';
// #177: the original Body Cycle II is an anatomical Bone–Marrow refinement
// undertaken by an independently acting original Cycle I human. This is not
// an NPC rank table, generic XP, birth-attribute rewrite or learned attack.
const Crypto=require('node:crypto'),
 Core=require('./core'),Combat=require('./combat'),
 Early=require('./independent-original-discipline-preparation'),
 Potential=require('./potential-mechanics'),
 Difficulty=require('./dynamic-difficulty'),
 Law=require('./body-shared-original-cycle-two');
const ORIGIN='source-earned-independent-original-body-bone-marrow-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const clamp=x=>Math.min(Law.required(),Math.max(0,x));
const completedCycleOne=p=>p.originalFirstPowerMilestones?.body?.kind===
 'body-muscle-tendon-cycle-one'&&
 p.originalFirstPowerMilestones.body.completedCycle==='Muscle-Tendon Cycle'&&
 /^[a-f0-9]{64}$/.test(p.originalFirstPowerMilestones.body.originalSourceHash||'');
const aptitude=p=>Potential.bonus(p.mechanicalFoundation.unassessedPotential[
 Potential.PRIMARY.body.cycle2]);
const workDC=(s,methods,method,stamina,maxStamina,witnesses)=>
 Difficulty.disciplinePractice(s,{system:'body',method,
  record:{target:'cycle2',methods},baseDC:Law.baseDC(),independent:true,
  short:true,originalPhysicalOwner:{stamina,maxStamina},
  originalTrainingWitnesses:witnesses}).dc;
function verify(s,p){
 const r=p?.originalBodyCycleTwo;
 if(r===undefined)return true;
 if(!completedCycleOne(p)||!Early.verify(s,p)||!r||
  r.origin!==ORIGIN||
  r.originalCycleOneSourceHash!==p.originalFirstPowerMilestones.body.originalSourceHash||
  !Array.isArray(r.sessions)||r.sessions.length<1||r.sessions.length>480)
  return false;
 const body=s.table?.combatants?.['npc_'+p.id];
 if(!body?.npcOrigin?.seal)return false;
 const Offscreen=require('../world/independent-original-power-days');
 let points=0,methods={},cooldown=0,completed=false,previousDay=-1,
  previousEnd=0,sourceHash=null;
 const prior=[];
 for(const row of r.sessions){
  const q=row?.source;
  if(!q||row.seal!==hash(q)||completed||
   q.origin!==ORIGIN||q.system!=='body'||
   !['cycle2-practice','cycle2-rite'].includes(q.target)||
   q.actorId!==p.actorId||q.individualOriginHash!==p.originHash||
   q.originalFoundationSeal!==p.mechanicalFoundation?.seal||
   q.originalCombatEntrySeal!==body.npcOrigin.seal||
   q.originalCycleOneSourceHash!==r.originalCycleOneSourceHash||
   q.noOtherPowerOrLearnedTechniqueGranted!==true||
   !Number.isInteger(q.day)||q.day<=previousDay||
   q.startMinute!==q.day*1440+600||q.startMinute<previousEnd||
   q.startMinute+q.actualMinutes>s.world.minutes||
   !Offscreen.verifyEvidence(s,p,q)||
   q.pointsBefore!==points||
   JSON.stringify(q.methodsBefore)!==JSON.stringify(methods)||
   q.cooldownBefore!==cooldown||
   q.day<cooldown||!Number.isInteger(q.rngBefore)||q.rngBefore<1||
   q.personalityAtDecision!==p.personality||
   !Number.isInteger(q.fatigueAtDecision)||
   q.fatigueAtDecision<0||q.fatigueAtDecision>100||
   q.choiceChance!==Early.chance({
    personality:q.personalityAtDecision,fatigue:q.fatigueAtDecision})||
   !Array.isArray(q.woundsBefore)||q.woundsBefore.length!==3||
   q.woundsBefore.some(x=>x!==0)||
   !Array.isArray(q.woundsAfter)||q.woundsAfter.length!==3||
   !Number.isInteger(q.toughnessBefore)||q.toughnessBefore<0||
   !Number.isInteger(q.seriousBoxBefore)||q.seriousBoxBefore<1||
   q.staminaBefore!==null&&
    (!Number.isInteger(q.staminaBefore)||q.staminaBefore<1))
   return false;
  const roller={rngState:q.rngBefore};
  if(q.choiceD100!==Core.die(roller,100)||
   q.accepted!==(q.choiceD100<=q.choiceChance))
   return false;
  let earned=0,complication=null,injury=false,success=false;
  const rite=points===Law.required();
  if(q.target!==(rite?'cycle2-rite':'cycle2-practice'))return false;
  if(!q.accepted){
   if(q.actualMinutes!==5||q.check!==null||
    q.method!==null||q.methodNumber!==null||
    q.complicationRoll!==null||q.staminaSpent!==0||
    q.staminaBefore!==null||q.staminaAfter!==null||
    q.maxStaminaAtAttempt!==null||q.originalPhysicalInjury!==false||
    q.originalBreakthroughBacklash!==false||q.earned!==0||
    q.outcome!=='declined')return false;
  }else if(!rite){
   const number=Core.die(roller,Law.METHODS.length),
    method=Law.METHODS[number-1],
    roll=Core.die(roller,20),
    dc=workDC(s,methods,method,q.staminaBefore,
     q.maxStaminaAtAttempt,prior),
    mod=Math.floor((p.mechanicalFoundation.baselineAttributes.con-10)/2)+
     Potential.bonus(p.mechanicalFoundation.unassessedPotential[
      Potential.METHODS.body[method]]),
    margin=roll+mod+Core.naturalAdjustment(roll)-dc,
    degree=Core.degree(margin);
   earned=Core.progress(degree)+(margin>=0?
    Math.max(0,Potential.bonus(p.mechanicalFoundation.unassessedPotential[
     Potential.METHODS.body[method]])):0);
   if(q.actualMinutes!==120||q.methodNumber!==number||
    q.method!==method||!q.check||q.check.roll!==roll||
    q.check.modifier!==mod||q.check.dc!==dc||
    q.check.degree!==degree||q.check.success!==(margin>=0)||
    q.earned!==earned||q.staminaSpent!==1||
    !Number.isInteger(q.maxStaminaAtAttempt)||
    q.staminaBefore>q.maxStaminaAtAttempt||
    q.staminaAfter!==q.staminaBefore-1||
    q.originalBreakthroughBacklash!==false||q.outcome!=='practice')
    return false;
   if(degree==='severe failure'){
    complication=Core.die(roller,20);
    injury=complication<=3||complication===14||complication===15;
    if(q.complicationRoll!==complication)return false;
    if(complication<=5)cooldown=q.day+6;
   }else if(q.complicationRoll!==null)return false;
   methods[method]=(methods[method]||0)+1;
   points=clamp(points+earned);
   prior.push({system:'body',target:'cycle2',method,minutes:120,
    startMinute:q.startMinute,eventHash:row.seal});
  }else{
   const roll=Core.die(roller,20),
    mod=Math.floor((p.mechanicalFoundation.baselineAttributes.con-10)/2)+
     aptitude(p),
    margin=roll+mod+Core.naturalAdjustment(roll)-Law.riteDC(),
    degree=Core.degree(margin);
   success=margin>=0;injury=degree==='severe failure';
   if(q.actualMinutes!==180||q.method!==null||
    q.methodNumber!==null||q.complicationRoll!==null||
    q.staminaSpent!==0||q.staminaBefore===null||
    q.staminaAfter!==q.staminaBefore||
    q.maxStaminaAtAttempt!==null||
    !q.check||q.check.roll!==roll||q.check.modifier!==mod||
    q.check.dc!==Law.riteDC()||q.check.degree!==degree||
    q.check.success!==success||q.earned!==0||
    q.originalBreakthroughBacklash!==injury)
    return false;
   if(Object.keys(methods).filter(k=>methods[k]>0).length<2)return false;
   if(success){completed=true;points=0;methods={};sourceHash=row.seal;}
   else if(degree==='setback')cooldown=q.day+12;
   else if(degree==='failure')cooldown=q.day+24;
   else{cooldown=q.day+30;points=Math.floor(points*.75);}
   if(q.outcome!==(success?'breakthrough':
    injury?'backlash':'stalled'))return false;
  }
  if(q.accepted!==true&&q.originalBreakthroughBacklash!==false)return false;
  if(q.originalPhysicalInjury!==injury||
   JSON.stringify(q.woundsAfter)!==JSON.stringify(injury?[1,0,0]:[0,0,0])||
   q.toughnessAfter!==q.toughnessBefore+(success?Law.toughGain:0)||
   q.seriousBoxAfter!==q.seriousBoxBefore+(success?Law.seriousBoxGain:0)||
   q.pointsAfter!==points||
   JSON.stringify(q.methodsAfter)!==JSON.stringify(methods)||
   q.cooldownUntil!==cooldown||q.completedAfter!==completed||
   q.rngAfter!==roller.rngState)return false;
  previousDay=q.day;previousEnd=q.startMinute+q.actualMinutes;
 }
 return r.points===points&&
  JSON.stringify(r.methods)===JSON.stringify(methods)&&
  r.cooldownUntil===cooldown&&r.completed===completed&&
  r.originalCycleTwoSourceHash===sourceHash&&
  r.lastAttemptDay===previousDay;
}
function privateStatus(s,p){
 if(!Early.verify(s,p)||!verify(s,p))
  throw Error('Original independent Body Cycle II source was altered');
 const r=p.originalBodyCycleTwo;
 return {privateToGM:true,
  originalOwner:'rules/disciplines.js:body-cycle2',
  verifiedOriginalBodyCycles:r?.completed?
   ['Muscle-Tendon Cycle','Bone-Marrow Cycle']:['Muscle-Tendon Cycle'],
  earnedBoneMarrowRefinement:r?.completed===true,
  currentCycleTwoPoints:r?.points||0,
  sourceVerifiedAnatomicalToughnessBonus:r?.completed?Law.toughGain:0,
  sourceVerifiedSeriousWoundBoxBonus:r?.completed?Law.seriousBoxGain:0,
  noAutomaticSkillOrTechnique:true};
}
function safeCheck(s,args){
 const previous=s.log.slice();
 try{return Core.check(s,{...args,privateDisplay:true});}
 finally{s.log.splice(0,s.log.length,...previous);}
}
function afterDaily(s,ctx){
 const p=ctx.actor,body=ctx.body;
 if(!completedCycleOne(p)||p.originalBodyCycleTwo?.completed||
  !Early.verify(s,p)||!verify(s,p)||
  body.status!=='ok'||body.wounds.some(x=>x!==0)||
  body.stamina<1)return null;
 const r=p.originalBodyCycleTwo||{origin:ORIGIN,
  originalCycleOneSourceHash:p.originalFirstPowerMilestones.body.originalSourceHash,
  points:0,methods:{},cooldownUntil:0,sessions:[],
  lastAttemptDay:-1,completed:false,originalCycleTwoSourceHash:null};
 if(r.lastAttemptDay>=ctx.workDay||
  r.sessions.length>=480||ctx.workDay<r.cooldownUntil||
  Object.values(p.originalEarlyDisciplinePreparation||{}).
   some(x=>x.lastAttemptDay>=ctx.workDay)||
  p.meridianTraining?.lastAttemptDay>=ctx.workDay)return null;
 const rite=r.points===Law.required();
 if(rite&&Object.keys(r.methods).filter(k=>r.methods[k]>0).length<2)
  return null;
 const before=p.rngState,choiceChance=Early.chance(p),
  choiceD100=Core.die(p,100),accepted=choiceD100<=choiceChance,
  oldWounds=[...body.wounds],toughnessBefore=body.toughness,
  seriousBoxBefore=body.boxes[1],staminaBefore=body.stamina,
  oldPoints=r.points,oldMethods={...r.methods},oldCooldown=r.cooldownUntil;
 let minutes=5,method=null,methodNumber=null,check=null,
  complicationRoll=null,injury=false,backlash=false,earned=0,
  outcome='declined',spent=0,maxAtAttempt=null,staminaAtStart=null,
  staminaAfter=null;
 if(accepted){
  minutes=rite?180:120;staminaAtStart=staminaBefore;
  if(rite){
   const modifier=Math.floor((p.mechanicalFoundation.baselineAttributes.con-10)/2)+
    aptitude(p);
   const actual=safeCheck(s,{modifier,dc:Law.riteDC(),
    label:'Original independent Body Bone-Marrow breakthrough',
    independentRngOwner:p});
   check={roll:actual.roll,modifier:actual.modifier,
    dc:actual.dc,degree:actual.degree,success:actual.success};
   if(actual.success){
    outcome='breakthrough';r.points=0;r.methods={};r.completed=true;
    body.toughness+=Law.toughGain;body.boxes[1]+=Law.seriousBoxGain;
   }else if(actual.degree==='setback'){
    outcome='stalled';r.cooldownUntil=ctx.workDay+12;
   }else if(actual.degree==='failure'){
    outcome='stalled';r.cooldownUntil=ctx.workDay+24;
   }else{
    outcome='backlash';backlash=true;injury=true;
    r.cooldownUntil=ctx.workDay+30;
    r.points=Math.floor(r.points*.75);
    Combat.harm(s,body,2);
   }
  }else{
   methodNumber=Core.die(p,Law.METHODS.length);
   method=Law.METHODS[methodNumber-1];
   const witnesses=r.sessions.filter(x=>x.source.target==='cycle2-practice'&&
    x.source.accepted).map(x=>({system:'body',target:'cycle2',
    method:x.source.method,minutes:120,startMinute:x.source.startMinute,
    eventHash:x.seal})),
    dc=workDC(s,r.methods,method,body.stamina,body.maxStamina,witnesses),
    modifier=Math.floor((p.mechanicalFoundation.baselineAttributes.con-10)/2)+
     Potential.bonus(p.mechanicalFoundation.unassessedPotential[
      Potential.METHODS.body[method]]);
   maxAtAttempt=body.maxStamina;spent=1;body.stamina--;
   const actual=safeCheck(s,{modifier,dc,
    label:'Private original Bone-Marrow physical practice',
    independentRngOwner:p});
   check={roll:actual.roll,modifier:actual.modifier,dc:actual.dc,
    degree:actual.degree,success:actual.success};
   earned=actual.progress+(actual.success?Math.max(0,
    Potential.bonus(p.mechanicalFoundation.unassessedPotential[
     Potential.METHODS.body[method]])):0);
   r.points=clamp(r.points+earned);
   r.methods[method]=(r.methods[method]||0)+1;
   if(actual.degree==='severe failure'){
    complicationRoll=Core.die(p,20);
    injury=complicationRoll<=3||complicationRoll===14||complicationRoll===15;
    if(injury)Combat.harm(s,body,2);
    if(complicationRoll<=5)r.cooldownUntil=ctx.workDay+6;
   }
   outcome='practice';
  }
  staminaAfter=body.stamina;
 }
 const Offscreen=require('../world/independent-original-power-days');
 const source={origin:ORIGIN,actorId:p.actorId,system:'body',
  target:rite?'cycle2-rite':'cycle2-practice',
  individualOriginHash:p.originHash,
  originalFoundationSeal:p.mechanicalFoundation.seal,
  originalCombatEntrySeal:body.npcOrigin.seal,
  originalCycleOneSourceHash:r.originalCycleOneSourceHash,
  originalShiftHash:ctx.originalShiftHash,
  originalSceneHash:hash(Offscreen.opportunityEvidence(ctx,'body')),
  offscreenOpportunity:Offscreen.opportunityEvidence(ctx,'body'),
  day:ctx.workDay,startMinute:ctx.workDay*1440+600,
  actualMinutes:minutes,rngBefore:before,rngAfter:p.rngState,
  personalityAtDecision:p.personality,fatigueAtDecision:p.fatigue,
  choiceD100,choiceChance,accepted,
  pointsBefore:oldPoints,methodsBefore:oldMethods,cooldownBefore:oldCooldown,
  method,methodNumber,check,complicationRoll,
  earned,staminaSpent:spent,staminaBefore:accepted?staminaAtStart:null,
  maxStaminaAtAttempt:maxAtAttempt,staminaAfter,
  originalPhysicalInjury:injury,originalBreakthroughBacklash:backlash,
  woundsBefore:oldWounds,woundsAfter:[...body.wounds],
  toughnessBefore,toughnessAfter:body.toughness,
  seriousBoxBefore,seriousBoxAfter:body.boxes[1],
  pointsAfter:r.points,methodsAfter:{...r.methods},
  cooldownUntil:r.cooldownUntil,completedAfter:r.completed,
  outcome,noOtherPowerOrLearnedTechniqueGranted:true};
 const row={source,seal:hash(source)};
 r.sessions.push(row);r.lastAttemptDay=ctx.workDay;
 if(r.completed)r.originalCycleTwoSourceHash=row.seal;
 p.originalBodyCycleTwo=r;
 if(!verify(s,p))
  throw Error('Original independent Body Cycle II source replay failed');
 return {kind:'body-bone-marrow',target:source.target,accepted,
  outcome,earned,points:r.points,completed:r.completed,
  actualStaminaSpent:spent,actualPhysicalInjury:injury,
  newToughness:r.completed?Law.toughGain:0,
  seriousWoundBoxGain:r.completed?Law.seriousBoxGain:0,
  originalSourceHash:row.seal,noPlayerKnowledge:true,noNewTechnique:true};
}
module.exports={ORIGIN,verify,privateStatus,afterDaily};
