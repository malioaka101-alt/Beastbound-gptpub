'use strict';
// The same ORIGINAL player discipline milestone rules can resolve a source-
// proved independent person's distinct first Soul, Body or Rift event.
// One shared actor decision/check/proof protocol; THREE DIFFERENT power
// anatomies, milestones and consequences. No general NPC level or XP.
const Crypto=require('node:crypto'),Core=require('./core'),
 Combat=require('./combat'),Build=require('./build'),
 Disc=require('./disciplines'),
 Potential=require('./potential-mechanics'),
 E=require('../engine'),World=require('./world'),
 Early=require('./independent-original-discipline-preparation');
const ORIGIN='source-owned-independent-original-first-milestone-v1';
const TRACKS=Object.freeze({
 soul:Object.freeze({target:'phase1',label:'Phase I Soul Perception',
  knowledge:'original individual identity and resonance'}),
 body:Object.freeze({target:'cycle1',label:'Cycle I Muscle-Tendon refinement',
  knowledge:'original individual muscle, tendon and recovery tissues'}),
 rift:Object.freeze({target:'sense',label:'Step I Rift Sense',
  knowledge:'original measured nearby spatial weakness'})
});
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function spec(system){
 const entry=TRACKS[system];
 if(!entry)throw Error('Original first-milestone owner supports Soul, Body and Rift only');
 const source=Disc.KEYS[system]?.tracks?.[entry.target];
 if(!source||source.length!==2)
  throw Error('Missing original power-specific first milestone source');
 return {...entry,system,required:source[0],dc:source[1]+2+3,
  attribute:Disc.KEYS[system].attribute,
  dimension:Potential.PRIMARY[system][entry.target]};
}
function chance(p){
 const n={curious:66,steady:59,independent:51,reserved:39}[p.personality];
 if(!Number.isInteger(n)||!Number.isInteger(p.fatigue)||
    p.fatigue<0||p.fatigue>100)
  throw Error('Source-verified independent choice requires original personal condition');
 return n-(p.fatigue>=55?15:0);
}
function effect(system,p,bodyBefore){
 if(system==='soul'){
  const will=Math.floor((p.mechanicalFoundation.baselineAttributes.wis-10)/2),
   soul=Build.soulProfile(1,{will});
  return {kind:'soul-phase-one',phase:1,soulReserve:soul.soulReserve,
   maxSoulReserve:soul.soulReserve,perceptionRangeMetres:soul.perceptionRangeMetres,
   noUnlearnedSoulArt:true};
 }
 if(system==='body'){
  if(!bodyBefore||!Number.isInteger(bodyBefore.stamina)||
   !Number.isInteger(bodyBefore.maxStamina)||!Number.isInteger(bodyBefore.offM))
   throw Error('Original Body refinement requires witnessed current human anatomy');
  return {kind:'body-muscle-tendon-cycle-one',completedCycle:'Muscle-Tendon Cycle',
   naturalStrengthIncrease:1,
   staminaBefore:bodyBefore.stamina,staminaAfter:bodyBefore.stamina+2,
   maxStaminaBefore:bodyBefore.maxStamina,
   maxStaminaAfter:bodyBefore.maxStamina+2,
   offMBefore:bodyBefore.offM,offMAfter:Math.max(bodyBefore.offM,1),
   originalBirthAttributesRemainImmutable:true};
 }
 if(system==='rift')
  return {kind:'rift-step-one-sense',step:1,
   sense:{scope:'boundary weakness and spatial pressure only',
    requires:'Nearby anomaly or measured weak boundary',notTeleportation:true},
   noAnchorFoldOrTravelAward:true};
 throw Error('No original owner for this supernatural anatomy');
}
// Pure replay: no time, dice, injury or milestones mutate during validation.
function replay(s,p,q,roller,{points,methods,cooldown,body,priorSuccess=false}={}){
 const rule=TRACKS[q?.system];
 if(!rule||priorSuccess)return null;
 const sp=spec(q.system);
 if(!q||q.origin!==ORIGIN||q.actorId!==p.actorId||
  q.target!==sp.target||
  q.individualOriginHash!==p.originHash||
  q.originalFoundationSeal!==p.mechanicalFoundation.seal||
  q.originalCombatEntrySeal!==body?.npcOrigin?.seal||
  !/^[a-f0-9]{64}$/.test(q.originalShiftHash||'')||
  !/^[a-f0-9]{64}$/.test(q.originalSceneHash||'')||
  q.sourceOwner!=='rules/disciplines.js'||
  q.noOtherSystemOrTechniqueGranted!==true||
  q.originalSkillRankBonus!==0||
  points!==sp.required||
  Object.keys(methods).filter(k=>methods[k]>0).length<2||
  q.pointsBefore!==points||
  q.distinctMethodsBefore!==Object.keys(methods).length||
  q.cooldownBefore!==cooldown||q.day<cooldown||
  !Number.isInteger(q.startMinute)||
  q.startMinute%1440<8*60||q.startMinute%1440+180>18*60||
  q.originalRiteDC!==sp.dc||
  q.originalPotentialDimension!==sp.dimension||
  q.originalPotentialBonus!==Potential.bonus(
   p.mechanicalFoundation.unassessedPotential[sp.dimension])||
  q.feeTalons!==0||q.insightSpent!==0||
  q.choiceChance!==chance({personality:q.personalityAtAttempt,
   fatigue:q.fatigueAtAttempt})||
  q.choiceD100!==Core.die(roller,100)||
  q.accepted!==(q.choiceD100<=q.choiceChance))
  return null;
 let nextPoints=points,nextMethods={...methods},nextCooldown=cooldown,
  attained=false,verifiedEffect=null;
 if(!q.accepted){
  if(q.actualMinutes!==5||q.check!==null||
   q.outcome!=='declined'||q.cooldownUntil!==cooldown||
   q.effect!==null||q.originalPhysicalBacklash!==false||
   q.woundsBefore!==null||q.woundsAfter!==null)
   return null;
 }else{
  const natural=Math.floor((p.mechanicalFoundation.baselineAttributes[
    sp.attribute]-10)/2),
   modifier=natural+q.originalPotentialBonus,
   rolled=Core.die(roller,20),
   margin=rolled+modifier+Core.naturalAdjustment(rolled)-sp.dc,
   degree=Core.degree(margin),success=margin>=0;
  if(q.actualMinutes!==180||!q.check||
   q.check.roll!==rolled||q.check.modifier!==modifier||
   q.check.dc!==sp.dc||q.check.degree!==degree||
   q.check.success!==success||
   !Array.isArray(q.woundsBefore)||q.woundsBefore.length!==3||
   !Array.isArray(q.woundsAfter)||q.woundsAfter.length!==3||
   q.woundsBefore.some(x=>x!==0)||
   q.woundsAfter.some(x=>!Number.isInteger(x)||x<0))
   return null;
  let expected;
  if(success){
   attained=true;nextPoints=0;nextMethods={};expected='breakthrough';
   // Body effects use the actual original human combatant before the rite
   // rather than inventing an alternate physical state or modifying birth.
   if(q.system==='body'){
    if(!q.effect||q.effect.kind!=='body-muscle-tendon-cycle-one')
     return null;
    verifiedEffect=effect(q.system,p,{
     stamina:q.effect.staminaBefore,
     maxStamina:q.effect.maxStaminaBefore,
     offM:q.effect.offMBefore});
   }else verifiedEffect=effect(q.system,p);
   if(JSON.stringify(q.effect)!==JSON.stringify(verifiedEffect)||
    q.woundsAfter.some((x,i)=>x!==q.woundsBefore[i])||
    q.originalPhysicalBacklash!==false)
    return null;
  }else if(degree==='setback'){
   nextCooldown=q.day+12;expected='stalled';
  }else if(degree==='failure'){
   nextCooldown=q.day+24;expected='stalled';
  }else{
   nextCooldown=q.day+30;nextPoints=Math.floor(points*.75);
   expected='backlash';
  }
  if(!success){
   if(q.effect!==null||
    q.originalPhysicalBacklash!==(degree==='severe failure'))
    return null;
   if(degree==='severe failure'){
    if(JSON.stringify(q.woundsAfter)!==JSON.stringify([1,0,0]))
     return null;
   }else if(q.woundsAfter.some((x,i)=>x!==q.woundsBefore[i]))
    return null;
  }
  if(q.outcome!==expected||q.cooldownUntil!==nextCooldown)
   return null;
 }
 if(q.pointsAfter!==nextPoints||
  JSON.stringify(q.methodsAfter)!==JSON.stringify(nextMethods)||
  roller.rngState!==q.rngAfter)
  return null;
 return {points:nextPoints,methods:nextMethods,cooldown:nextCooldown,
  attained,effect:verifiedEffect,ownerSourceHash:attained?hash(q):null};
}
function practice(s,{actorId,system,...untrusted}={}){
 if(Object.keys(untrusted).length||
  typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId))
  throw Error('Original independent first-milestone rite accepts actorId and power system only, never dice, rank, method or consent');
 const sp=spec(system),
  w=require('../world/simulation').peek(s),
  p=w?.emergentPeople?.people?.[actorId.slice('emergent:'.length)],
  r=p?.originalEarlyDisciplinePreparation?.[system],
  today=Math.floor(s.world.minutes/1440);
 if(!p||!Early.verify(s,p))
  throw Error('Original independent individual milestone or preparation history was altered');
 if(p.originalFirstPowerMilestones?.[system])
  throw Error('Original individual already earned this power-system milestone');
 // An existing decision is final EVEN IF the failed rite injured them
 // or destroyed preparation. Never open a new roll by rechecking readiness.
 if(r?.lastAttemptDay>=today||
  p.meridianTraining?.lastAttemptDay>=today||
  Object.entries(p.originalEarlyDisciplinePreparation||{}).
   some(([k,x])=>k!==system&&x.lastAttemptDay>=today))
  throw Error('This individual already made a discipline decision today');
 if(!r||r.target!==sp.target||r.points!==sp.required||
  Object.keys(r.methods).filter(k=>r.methods[k]>0).length<2)
  throw Error('Real original '+system+' milestone requires '+sp.required+
   ' earned preparation points and two different original methods');
 if(today<r.cooldownUntil)
  throw Error('Original '+system+' anatomy recovery cooldown has not ended');
 if(r.sessions.length>=480)
  throw Error('Original personal preparation history needs source-owner review');
 const ctx=Disc.originalActorSessionContext(s,{
  actorId,system,target:sp.target}),
  {combatant:body,minute,presence:present}=ctx;
 if(body.status!=='ok'||body.stamina<1||
    body.wounds.some(x=>x!==0))
  throw Error('Original '+system+' milestone needs a living, physically capable uninjured human');
 if(minute<8*60||minute+180>18*60)
  throw Error('A full uninterrupted daylight first-milestone rite is necessary');
 if(!s.chatRuntime?.scene?.includes(
   p.name+' begins a prepared '+sp.label+' rite'))
  throw Error('A genuinely witnessed original '+system+' rite for this present individual is required');
 const start=s.world.minutes,initialRng=p.rngState,
  choiceChance=chance(p),choiceD100=Core.die(p,100),
  accepted=choiceD100<=choiceChance,
  training=Disc.originalActorTrainingProfile(s,{
   actorId,system,target:sp.target}),
  initialWounds=[...body.wounds],
  originalPoints=r.points,originalMethods={...r.methods},
  originalCooldown=r.cooldownUntil;
 let check=null,outcome='declined',minutes=5,
  effectAfter=null,nextPoints=r.points,nextMethods=r.methods,
  cooldown=r.cooldownUntil,backlash=false;
 if(accepted){
  minutes=180;
  const actual=Core.check(s,{modifier:training.modifier,dc:sp.dc,
   label:p.name+' original independent '+sp.label,
   independentRngOwner:p,privateDisplay:true});
  check={roll:actual.roll,modifier:actual.modifier,dc:actual.dc,
   degree:actual.degree,success:actual.success};
  if(actual.success){
   outcome='breakthrough';
   effectAfter=effect(system,p,body);
   if(system==='body'){
    body.maxStamina=effectAfter.maxStaminaAfter;
    body.stamina=effectAfter.staminaAfter;
    body.offM=effectAfter.offMAfter;
   }
   nextPoints=0;nextMethods={};
  }else if(actual.degree==='setback'){
   outcome='stalled';cooldown=today+12;
  }else if(actual.degree==='failure'){
   outcome='stalled';cooldown=today+24;
  }else{
   outcome='backlash';cooldown=today+30;
   nextPoints=Math.floor(nextPoints*.75);
   Combat.harm(s,body,2);backlash=true;
  }
 }
 const source={origin:ORIGIN,actorId,system,target:sp.target,
  sourceOwner:'rules/disciplines.js',
  individualOriginHash:p.originHash,
  originalFoundationSeal:p.mechanicalFoundation.seal,
  originalCombatEntrySeal:body.npcOrigin.seal,
  originalShiftHash:present.presence.hash,
  originalSceneHash:hash(s.chatRuntime.scene),
  startMinute:start,day:today,actualMinutes:minutes,
  rngBefore:initialRng,rngAfter:p.rngState,
  personalityAtAttempt:p.personality,fatigueAtAttempt:p.fatigue,
  choiceD100,choiceChance,accepted,
  originalRiteDC:sp.dc,originalSkillRankBonus:0,
  originalPotentialDimension:training.potential.dimension,
  originalPotentialBonus:training.potential.modifier,
  pointsBefore:originalPoints,
  distinctMethodsBefore:Object.keys(originalMethods).length,
  pointsAfter:nextPoints,methodsAfter:{...nextMethods},
  cooldownBefore:originalCooldown,cooldownUntil:cooldown,
  check,outcome,effect:effectAfter,originalPhysicalBacklash:backlash,
  woundsBefore:accepted?initialWounds:null,
  woundsAfter:accepted?[...body.wounds]:null,
  insightSpent:0,feeTalons:0,noOtherSystemOrTechniqueGranted:true};
 r.sessions.push({source,seal:hash(source)});
 r.points=nextPoints;r.methods=nextMethods;r.cooldownUntil=cooldown;
 r.lastAttemptDay=today;
 if(outcome==='breakthrough'){
  r.target='earned-first-milestone';
  p.originalFirstPowerMilestones||={};
  p.originalFirstPowerMilestones[system]={
   originalSourceHash:hash(source),...effectAfter};
 }
 if(!Early.verify(s,p))
  throw Error('Original independent first-milestone source replay failed');
 E.advance(s,minutes);World.finalizeTime(s,start);
 Core.event(s,'progress',outcome==='declined'?
  p.name+' chooses not to undertake the prepared '+system+' rite.':
  outcome==='breakthrough'?
  p.name+' completes a genuine '+sp.label+' rite with its original anatomical effects.':
  p.name+' attempts a genuine '+system+' milestone and bears its original consequences.',{
  origin:ORIGIN,actorId,system,originalSourceHash:hash(source),
  independentlyChosen:accepted,observedOutcome:outcome,
  privateActualPowerAndDiceNotDisclosed:true,
  noOtherSystemOrTechniqueGranted:true});
 return {actorId,system,
  independentChoice:accepted?'attempted':'declined',
  observedOutcome:outcome,elapsedMinutes:minutes,
  actualOriginalCheck:accepted,realBacklash:backlash,
  exactEarnedPowerRemainsGMPrivate:true,noFreeOtherSystemOrTechnique:true};
}
module.exports={ORIGIN,TRACKS,hash,chance,spec,effect,replay,practice};
