'use strict';
// #177: a real independent Mana Core ignition by an already prepared,
// individually sourced human. PC and NPC use the ORIGINAL Arcane core law:
// 40 actual points / two original methods, base DC 12 + 2 rite + 3 alone,
// one original check, 180 minutes, original cooldown and severe Light wound.
// This grants no Circle, learned spell, casting formula, technique or bond.
const Crypto=require('node:crypto'),
 Core=require('./core'),Combat=require('./combat'),
 E=require('../engine'),World=require('./world'),
 Disc=require('./disciplines'),Build=require('./build'),
 Early=require('./independent-original-discipline-preparation'),
 Potential=require('./potential-mechanics');
const ORIGIN='original-source-independent-arcane-mana-core-ignition-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const chance=p=>{
 const c={curious:66,steady:59,independent:51,reserved:39}[p.personality];
 if(!Number.isInteger(c)||!Number.isInteger(p.fatigue)||p.fatigue<0||p.fatigue>100)
  throw Error('Original independent Arcane decision requires a genuine personality and fatigue');
 return c-(p.fatigue>=55?15:0);
};
const DC=()=>Disc.KEYS.arcane.tracks.core[1]+2+3;
const originalMana=()=>Build.arcaneProfile(0).mana;
function replay(s,p,q,roller,{points,methods,cooldown,body,priorSuccess}={}){
 if(priorSuccess||
  q.origin!==ORIGIN||q.system!=='arcane'||q.target!=='core'||
  q.actorId!==p.actorId||q.individualOriginHash!==p.originHash||
  q.originalFoundationSeal!==p.mechanicalFoundation.seal||
  q.originalCombatEntrySeal!==body.npcOrigin?.seal||
  !/^[a-f0-9]{64}$/.test(q.originalShiftHash||'')||
  !/^[a-f0-9]{64}$/.test(q.originalSceneHash||'')||
  q.noCircleSpellOrTechniqueGranted!==true||
  q.originalSkillRankBonus!==0||
  points!==Disc.KEYS.arcane.tracks.core[0]||
  Object.keys(methods).filter(k=>methods[k]>0).length<2||
  q.pointsBefore!==points||q.distinctMethodsBefore!==Object.keys(methods).length||
  q.cooldownBefore!==cooldown||q.day<cooldown||
  q.originalRiteDC!==DC()||
  q.originalPotentialDimension!==Potential.PRIMARY.arcane.core||
  q.originalPotentialBonus!==Potential.bonus(
   p.mechanicalFoundation.unassessedPotential[Potential.PRIMARY.arcane.core])||
  q.insightSpent!==0||q.feeTalons!==0||
  q.choiceChance!==chance({personality:q.personalityAtAttempt,fatigue:q.fatigueAtAttempt})||
  q.choiceD100!==Core.die(roller,100)||
  q.accepted!==(q.choiceD100<=q.choiceChance))
  return null;
 let expected,afterPoints=points,afterMethods={...methods},end=cooldown,ignited=false;
 if(!q.accepted){
  if(q.actualMinutes!==5||q.check!==null||
   q.outcome!=='declined'||q.cooldownUntil!==cooldown||
   q.structuredManaAfter!==null||q.geometryAfter!==null||
   q.originalPhysicalBacklash!==false||
   q.woundsBefore!==null||q.woundsAfter!==null)
   return null;
 }else{
  const natural=Math.floor((p.mechanicalFoundation.baselineAttributes.int-10)/2),
   modifier=natural+q.originalPotentialBonus,roll=Core.die(roller,20),
   margin=roll+modifier+Core.naturalAdjustment(roll)-DC(),
   degree=Core.degree(margin),successful=margin>=0;
  if(q.actualMinutes!==180||!q.check||q.check.roll!==roll||
   q.check.modifier!==modifier||q.check.dc!==DC()||
   q.check.success!==successful||q.check.degree!==degree||
   !Array.isArray(q.woundsBefore)||!Array.isArray(q.woundsAfter)||
   q.woundsBefore.length!==q.woundsAfter.length||
   q.woundsBefore.some(x=>!Number.isInteger(x)||x<0)||
   q.woundsAfter.some(x=>!Number.isInteger(x)||x<0))
   return null;
  if(successful){
   ignited=true;afterPoints=0;afterMethods={};
   expected='ignited';
   if(q.structuredManaAfter!==originalMana()||
    q.geometryAfter!=='seeded core'||
    q.originalPhysicalBacklash!==false||
    q.woundsBefore.some((x,i)=>x!==q.woundsAfter[i]))
    return null;
  }else if(degree==='setback'){
   end=q.day+12;expected='stalled';
  }else if(degree==='failure'){
   end=q.day+24;expected='stalled';
  }else{
   end=q.day+30;afterPoints=Math.floor(points*.75);
   expected='backlash';
  }
  if(!successful){
   if(q.structuredManaAfter!==null||q.geometryAfter!==null||
    q.originalPhysicalBacklash!==(degree==='severe failure'))
    return null;
   // Only an actual severe failure may cause an original Light wound.
   // Its historical before/after is recorded by the Combat owner; ordinary
   // later healing must not retroactively delete this genuine consequence.
   if(degree!=='severe failure'&&q.woundsBefore.some((x,i)=>x!==q.woundsAfter[i]))
    return null;
  }
  if(q.outcome!==expected||q.cooldownUntil!==end)
   return null;
 }
 if(q.pointsAfter!==afterPoints||
  JSON.stringify(q.methodsAfter)!==JSON.stringify(afterMethods)||
  roller.rngState!==q.rngAfter)
  return null;
 return {points:afterPoints,methods:afterMethods,cooldown:end,
  ignited,coreSourceHash:ignited?hash(q):null};
}
// Canonical ORIGINAL Arcane Core is a single source-earned individual event,
// not a GM assignable circle or saved ordinary-study familiarity.
function practice(s,{actorId,...untrusted}={}){
 if(Object.keys(untrusted).length||
  typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId))
  throw Error('Original independent Arcane rite accepts only an authentic actorId, never result, dice, stage, fee or consent');
 const w=require('../world/simulation').peek(s),
  p=w?.emergentPeople?.people?.[actorId.slice('emergent:'.length)],
  r=p?.originalEarlyDisciplinePreparation?.arcane,
  today=Math.floor(s.world.minutes/1440);
 if(!p||!Early.verify(s,p))
  throw Error('Original independent Arcane source or preparation has been altered');
 if(p.originalArcaneCore?.coreIgnited)
  throw Error('This person has already earned their original Arcane Mana Core');
 if(!r||r.target!=='core'||r.points!==Disc.KEYS.arcane.tracks.core[0]||
  Object.keys(r.methods).filter(k=>r.methods[k]>0).length<2)
  throw Error('Arcane Core ignition requires 40 genuine points and two distinct original methods');
 if(today<r.cooldownUntil)
  throw Error('Original Arcane tissue and energy recovery cooldown prevents an ignition attempt');
 if(r.lastAttemptDay>=today||
  p.meridianTraining?.lastAttemptDay>=today||
  Object.values(p.originalEarlyDisciplinePreparation||{}).
   some(x=>x!==r&&x.lastAttemptDay>=today))
  throw Error('An independent original discipline or rite decision cannot be rerolled today');
 if(r.sessions.length>=480)
  throw Error('Original source-owned Arcane training journal must be reconciled before a rite');
 const ctx=Disc.originalActorSessionContext(s,{
  actorId,system:'arcane',target:'core'}),
  {combatant:c,minute,presence:present}=ctx;
 if(c.status!=='ok'||c.stamina<1||c.wounds.some(x=>x!==0))
  throw Error('The original Arcane rite requires a physically capable, uninjured practitioner');
 if(minute<8*60||minute+180>18*60)
  throw Error('A genuine uninterrupted three-hour daylight Arcane ignition is required');
 if(!s.chatRuntime?.scene?.includes(p.name+' begins a prepared Arcane Mana Core ignition rite'))
  throw Error('Current scene must witness this particular person preparing the original Mana Core rite');
 const start=s.world.minutes,beforeRng=p.rngState,
  choiceChance=chance(p),choiceD100=Core.die(p,100),
  accepted=choiceD100<=choiceChance,
  training=Disc.originalActorTrainingProfile(s,{
   actorId,system:'arcane',target:'core'}),
  bodyWounds=[...c.wounds],
  methodsBefore={...r.methods},beforePoints=r.points,
  beforeCooldown=r.cooldownUntil;
 let check=null,outcome='declined',minutes=5,
  nextPoints=r.points,nextMethods=r.methods,cooldown=r.cooldownUntil,
  currentMana=null,geometry=null,injury=false;
 if(accepted){
  minutes=180;
  const actual=Core.check(s,{modifier:training.modifier,dc:DC(),
   label:p.name+' independently ignites an original Arcane Mana Core',
   independentRngOwner:p,privateDisplay:true});
  check={roll:actual.roll,modifier:actual.modifier,
   dc:actual.dc,degree:actual.degree,success:actual.success};
  if(actual.success){
   outcome='ignited';currentMana=originalMana();geometry='seeded core';
   nextPoints=0;nextMethods={};
  }else if(actual.degree==='setback'){
   outcome='stalled';cooldown=today+12;
  }else if(actual.degree==='failure'){
   outcome='stalled';cooldown=today+24;
  }else{
   outcome='backlash';cooldown=today+30;
   nextPoints=Math.floor(nextPoints*.75);
   Combat.harm(s,c,2);injury=true;
  }
 }
 const source={origin:ORIGIN,actorId,system:'arcane',target:'core',
  individualOriginHash:p.originHash,
  originalFoundationSeal:p.mechanicalFoundation.seal,
  originalCombatEntrySeal:c.npcOrigin.seal,
  originalShiftHash:present.presence.hash,
  originalSceneHash:hash(s.chatRuntime.scene),
  startMinute:start,day:today,actualMinutes:minutes,
  rngBefore:beforeRng,rngAfter:p.rngState,
  personalityAtAttempt:p.personality,fatigueAtAttempt:p.fatigue,
  choiceD100,choiceChance,accepted,
  originalRiteDC:DC(),originalSkillRankBonus:0,
  originalPotentialDimension:training.potential.dimension,
  originalPotentialBonus:training.potential.modifier,
  pointsBefore:beforePoints,distinctMethodsBefore:Object.keys(methodsBefore).length,
  pointsAfter:nextPoints,methodsAfter:{...nextMethods},
  cooldownBefore:beforeCooldown,cooldownUntil:cooldown,
  check,outcome,structuredManaAfter:currentMana,geometryAfter:geometry,
  originalPhysicalBacklash:injury,
  woundsBefore:accepted?bodyWounds:null,
  woundsAfter:accepted?[...c.wounds]:null,
  insightSpent:0,feeTalons:0,
  noCircleSpellOrTechniqueGranted:true};
 r.sessions.push({source,seal:hash(source)});
 r.points=nextPoints;r.methods=nextMethods;r.cooldownUntil=cooldown;
 r.lastAttemptDay=today;
 if(outcome==='ignited'){
  r.target='circle1';
  p.originalArcaneCore={coreIgnited:true,circles:0,
   geometry:'seeded core',structuredMana:currentMana,
   originalSourceHash:hash(source),noLearnedSpells:true};
 }
 if(!Early.verify(s,p))
  throw Error('Original independent Arcane ignition failed complete source replay');
 E.advance(s,minutes);World.finalizeTime(s,start);
 Core.event(s,'progress',outcome==='declined'?
  p.name+' independently declines the prepared Arcane ignition rite.':
  outcome==='ignited'?
  p.name+' completes a genuine Arcane Mana Core ignition without constructing a Circle.':
  p.name+' attempts an Arcane Mana Core ignition with genuine physical consequences.',{
   origin:ORIGIN,actorId,originalSourceHash:hash(source),
   privateOriginalDiceAndAptitude:true,observedOutcome:outcome,
   noFreeCircleOrSpell:true});
 return {actorId,independentChoice:accepted?'attempted':'declined',
  observedOutcome:outcome,
  verifiedOriginalCoreGMOnly:outcome==='ignited',
  playerKnownExactCore:false,elapsedMinutes:minutes,
  actualOriginalCheck:accepted,realBacklash:injury,
  noCircleSpellOrTechniqueAwarded:true};
}
module.exports={ORIGIN,hash,chance,replay,practice};
