'use strict';
// #177. Real independent actor cultivation on days ALREADY chosen by the
// original personal-life owner. No GM-edited stage, scene witness from the
// player's whereabouts, phantom opponent, parallel progress or added clock.
// All outcomes use the ORIGINAL Core, Disciplines, Potential, Difficulty,
// Combat and first milestone owners, and the SAME original source ledger.
const Crypto=require('node:crypto'),
 Core=require('../rules/core'),Combat=require('../rules/combat'),
 Disc=require('../rules/disciplines'),Build=require('../rules/build'),
 Potential=require('../rules/potential-mechanics'),
 Difficulty=require('../rules/dynamic-difficulty'),
 Early=require('../rules/independent-original-discipline-preparation'),
 First=require('../rules/independent-original-first-milestones'),
 People=require('./emergent-people'),
 Lived=require('./lived-places'),
 Realm=require('./simulation');
const ORIGIN='original-autonomous-offscreen-power-opportunity-v1';
const REST='original-autonomous-offscreen-combat-night-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const isDay=x=>Number.isInteger(x)&&x>=0;
const supported=new Set(['arcane','soul','body','rift']);
function opportunity(s,w,life,activity,day){
 if(!isDay(day)||day<1||s.world.minutes!==day*1440||
  !life||life.lastDay!==day||!activity||
  activity.seal!==hash(activity.source)||
  activity.source?.day!==day||activity.source.actorId!==life.actorId||
  !require('./independent-person-lives').verifyEntry(w,life))
  throw Error('A real completed personal day and sealed independent daily activity are required');
 const p=w.emergentPeople?.people?.[life.id];
 if(!p||p.actorId!==life.actorId||!People.verify(w,p)||
  p.status!=='active'||p.ageBand!=='adult, exact birthday not established')
  return null;
 const id='npc_'+p.id,condition=require('../rules/unified').
  currentNpcWoundCondition(s,p.actorId),body=condition&&Combat.get(s,id);
 if(!body||!body.npcOrigin||body.status!=='ok')return null;
 const workDay=day-1,site=People.shift(p,workDay,w)?.location;
 if(!site||site!==People.siteFor(p.regionId))return null;
 const loc=Lived.location(s,site);
 if(!loc)return null;
 return {actor:p,life,body,workDay,site,loc,condition,
  dailySourceHash:activity.seal,dailyActivity:activity.source,
  originalShiftHash:People.shift(p,workDay,w).hash};
}
function evidence(ctx,kind){
 return {origin:ORIGIN,kind,actorId:ctx.actor.actorId,
  independentLifeDay:ctx.workDay+1,
  independentDailySourceHash:ctx.dailySourceHash,
  originalWorkDay:ctx.workDay,sourceRegionId:ctx.actor.regionId,
  privatePhysicalSite:ctx.site,
  originalShiftHash:ctx.originalShiftHash,
  noPlayerPresenceOrPlayerControlAssumed:true};
}
// A sealed original personal-day event may age out of its 80-entry ordinary
// history. Check it against that actual record whenever retained, and retain
// its original signed source inside the cultivation receipt for older saves.
function verifyEvidence(s,p,q){
 const x=q?.offscreenOpportunity;
 if(!x)return q?.offscreenOpportunity===undefined;
 if(x.origin!==ORIGIN||x.actorId!==p.actorId||
  x.kind!==q.system||!supported.has(x.kind)||
  !isDay(x.originalWorkDay)||x.independentLifeDay!==x.originalWorkDay+1||
  x.originalWorkDay!==q.day||x.originalShiftHash!==q.originalShiftHash||
  q.originalSceneHash!==hash(x)||
  !/^[a-f0-9]{64}$/.test(x.independentDailySourceHash||'')||
  typeof x.privatePhysicalSite!=='string'||
  x.noPlayerPresenceOrPlayerControlAssumed!==true)
  return false;
 const w=s.table?.realm,life=w?.independentPersonLives?.people?.[p.id];
 if(!life||!require('./independent-person-lives').verifyEntry(w,life))
  return false;
 const row=life.history.find(y=>y.source.day===x.independentLifeDay);
 if(row){
  if(row.seal!==x.independentDailySourceHash||
   row.source.action!=='practice'||row.source.focus!==x.kind)
   return false;
 }else if(life.history.length&&
  x.independentLifeDay>=life.history[0].source.day)
  return false;
 return true;
}
function sourceBase(ctx,system,start,minutes,before,choice,accepted,points,methods,
 cooldown,training,extra={}){
 const e=evidence(ctx,system);
 return {origin:extra.origin||Early.ORIGIN,actorId:ctx.actor.actorId,
  system,target:Early.TARGETS[system],
  individualOriginHash:ctx.actor.originHash,
  originalFoundationSeal:ctx.actor.mechanicalFoundation.seal,
  originalCombatEntrySeal:ctx.body.npcOrigin.seal,
  originalShiftHash:ctx.originalShiftHash,
  originalSceneHash:hash(e),offscreenOpportunity:e,
  day:ctx.workDay,startMinute:start,actualMinutes:minutes,
  rngBefore:before,rngAfter:ctx.actor.rngState,
  personalityAtAttempt:ctx.actor.personality,
  fatigueAtAttempt:ctx.actor.fatigue,choiceD100:choice,
  choiceChance:Early.chance(ctx.actor),accepted,
  originalSkillRankBonus:0,pointsBefore:points,
  distinctMethodsBefore:Object.keys(methods).length,
  cooldownBefore:cooldown,...extra};
}
function safeCheck(s,params){
 // The actual original Core.check writes one GM-only outcome to the shared
 // event log. Distant private actions must not leak their names or outcomes.
 const earlier=s.log.slice();
 try{return Core.check(s,{...params,privateDisplay:true});}
 finally{
  // Original Core.event keeps at most 90 records. Restoring only an old
  // length would leak the 90th private distant check when the shared
  // player-facing event log was already full.
  s.log.splice(0,s.log.length,...earlier);
 }
}
function dailyPractice(s,ctx,system){
 const {actor:p,body}=ctx,sp=Disc.KEYS[system],spec=Early.TARGETS[system],
  original=sp.tracks[spec],journal=p.originalEarlyDisciplinePreparation||{},
  old=journal[system],all=Object.values(journal);
 if(p.originalArcaneCore?.coreIgnited&&system==='arcane'||
  p.originalFirstPowerMilestones?.[system]||
  all.some(x=>x.lastAttemptDay>=ctx.workDay)||
  p.meridianTraining?.lastAttemptDay>=ctx.workDay||
  old?.points>=original[0]||ctx.workDay<(old?.cooldownUntil||0)||
  body.stamina<1||body.wounds.some(x=>x>0)||
  old?.sessions?.length>=480)return null;
 if(!Early.verify(s,p))throw Error('Original off-screen training source is altered');
 const minutes=ctx.workDay*1440+600,
  before=p.rngState,oldPoints=old?.points||0,
  oldMethods={...(old?.methods||{})},cooldown=old?.cooldownUntil||0,
  choiceChance=Early.chance(p),choice=Core.die(p,100),
  accepted=choice<=choiceChance,
  record=old||{origin:Early.ORIGIN,target:spec,points:0,methods:{},
   sessions:[],lastAttemptDay:-1,cooldownUntil:0};
 let method=null,methodNumber=null,check=null,complicationRoll=null,
  injury=false,actualMinutes=5,spent=0,endCooldown=cooldown,
  startingStamina=body.stamina;
 if(accepted){
  methodNumber=Core.die(p,Early.METHODS[system].length);
  method=Early.METHODS[system][methodNumber-1];
  const prior=record.sessions.filter(x=>x.source.origin===Early.ORIGIN&&
   x.source.accepted).map(x=>({system,target:spec,method:x.source.method,
    minutes:120,startMinute:x.source.startMinute,eventHash:x.seal})),
   dc=Difficulty.disciplinePractice(s,{system,method,record,
    baseDC:original[1],independent:true,short:true,
    originalPhysicalOwner:body,originalTrainingWitnesses:prior}).dc,
   training=Disc.originalActorTrainingProfile(s,{actorId:p.actorId,
    system,target:spec,method});
  spent=1;actualMinutes=120;body.stamina--;
  const actual=safeCheck(s,{modifier:training.modifier,dc,
   label:'Private independent original '+system+' practice',
   independentRngOwner:p});
  const earned=actual.progress+
   (actual.success?Math.max(0,training.potential.modifier):0);
  check={roll:actual.roll,modifier:actual.modifier,dc:actual.dc,
   degree:actual.degree,success:actual.success,earned};
  record.points=Math.min(original[0],record.points+earned);
  record.methods[method]=(record.methods[method]||0)+1;
  if(actual.degree==='severe failure'){
   complicationRoll=Core.die(p,20);
   injury=complicationRoll<=3||complicationRoll===14||complicationRoll===15;
   if(injury)Combat.harm(s,body,2);
   if(complicationRoll<=5)endCooldown=ctx.workDay+6;
  }
 }
 const source=sourceBase(ctx,system,minutes,actualMinutes,before,choice,
  accepted,oldPoints,oldMethods,cooldown,null,{
   method,methodNumber,check,complicationRoll,
   originalPhysicalInjury:injury,staminaCost:spent,
   staminaBefore:accepted?startingStamina:null,
   maxStaminaAtAttempt:accepted?body.maxStamina:null,
   staminaAfter:accepted?startingStamina-1:null,
   pointsAfter:record.points,cooldownUntil:endCooldown,
   noAutomaticStageOrTechnique:true});
 const row={source,seal:Early.hash(source)};
 record.sessions.push(row);record.cooldownUntil=endCooldown;
 record.lastAttemptDay=ctx.workDay;
 p.originalEarlyDisciplinePreparation={...journal,[system]:record};
 if(!Early.verify(s,p))throw Error('Offscreen original discipline practice failed replay');
 return {kind:'practice',system,accepted,actualOriginalCheck:accepted,
  sourceHash:row.seal,minutes:actualMinutes,noPlayerKnowledge:true};
}
function milestone(s,ctx,system){
 const {actor:p,body}=ctx,journal=p.originalEarlyDisciplinePreparation||{},
  record=journal[system],target=Early.TARGETS[system],
  [required,baseDC]=Disc.KEYS[system].tracks[target],
  isArcane=system==='arcane';
 if(!record||record.points!==required||record.target!==target||
  Object.keys(record.methods).filter(k=>record.methods[k]>0).length<2||
  ctx.workDay<record.cooldownUntil||
  Object.values(journal).some(x=>x.lastAttemptDay>=ctx.workDay)||
  p.meridianTraining?.lastAttemptDay>=ctx.workDay||
  p.originalFirstPowerMilestones?.[system]||
  p.originalArcaneCore?.coreIgnited||
  body.status!=='ok'||body.stamina<1||
  body.wounds.some(x=>x!==0)||record.sessions.length>=480)
  return null;
 if(!Early.verify(s,p))throw Error('Original offscreen milestone source is altered');
 const before=p.rngState,chance=Early.chance(p),choice=Core.die(p,100),
  accepted=choice<=chance,starting=ctx.workDay*1440+600,
  base=sourceBase(ctx,system,starting,accepted?180:5,before,choice,
   accepted,record.points,record.methods,record.cooldownUntil,null,{
    origin:isArcane?require('../rules/independent-original-arcane-core').ORIGIN:
     First.ORIGIN,
    originalRiteDC:baseDC+5,
    originalPotentialDimension:Potential.PRIMARY[system][target],
    originalPotentialBonus:Potential.bonus(
     p.mechanicalFoundation.unassessedPotential[
      Potential.PRIMARY[system][target]]),
    insightSpent:0,feeTalons:0,
    ...(isArcane?{noCircleSpellOrTechniqueGranted:true}:{
     sourceOwner:'rules/disciplines.js',noOtherSystemOrTechniqueGranted:true})
   }),
  previous={...record.methods},previousPoints=record.points,
  initialWounds=[...body.wounds];
 let check=null,outcome='declined',endCooldown=record.cooldownUntil,
  nextPoints=record.points,nextMethods=record.methods,
  injury=false,effect=null,mana=null,geometry=null;
 if(accepted){
  const training=Disc.originalActorTrainingProfile(s,{
   actorId:p.actorId,system,target});
  const actual=safeCheck(s,{modifier:training.modifier,dc:baseDC+5,
   label:'Private original '+system+' milestone',
   independentRngOwner:p});
  check={roll:actual.roll,modifier:actual.modifier,dc:actual.dc,
   degree:actual.degree,success:actual.success};
  if(actual.success){
   outcome=isArcane?'ignited':'breakthrough';
   nextPoints=0;nextMethods={};
   if(isArcane){
    mana=Build.arcaneProfile(0).mana;geometry='seeded core';
   }else{
    effect=First.effect(system,p,body);
    if(system==='body'){
     body.maxStamina=effect.maxStaminaAfter;
     body.stamina=effect.staminaAfter;
     body.offM=effect.offMAfter;
    }
   }
  }else if(actual.degree==='setback'){
   outcome='stalled';endCooldown=ctx.workDay+12;
  }else if(actual.degree==='failure'){
   outcome='stalled';endCooldown=ctx.workDay+24;
  }else{
   outcome='backlash';endCooldown=ctx.workDay+30;
   nextPoints=Math.floor(nextPoints*.75);
   Combat.harm(s,body,2);injury=true;
  }
 }
 const source={...base,rngAfter:p.rngState,check,outcome,
  pointsAfter:nextPoints,methodsAfter:{...nextMethods},
  cooldownUntil:endCooldown,
  originalPhysicalBacklash:injury,
  woundsBefore:accepted?initialWounds:null,
  woundsAfter:accepted?[...body.wounds]:null,
  ...(isArcane?{
   structuredManaAfter:mana,geometryAfter:geometry
  }:{effect})};
 const seal=Early.hash(source);
 record.sessions.push({source,seal});
 record.points=nextPoints;record.methods=nextMethods;
 record.cooldownUntil=endCooldown;record.lastAttemptDay=ctx.workDay;
 if(outcome==='ignited'){
  record.target='circle1';
  p.originalArcaneCore={coreIgnited:true,circles:0,geometry:'seeded core',
   structuredMana:mana,originalSourceHash:hash(source),noLearnedSpells:true};
 }else if(outcome==='breakthrough'){
  record.target='earned-first-milestone';
  p.originalFirstPowerMilestones||={};
  p.originalFirstPowerMilestones[system]={
   originalSourceHash:hash(source),...effect};
 }
 if(!Early.verify(s,p))throw Error('Offscreen original milestone failed source replay');
 return {kind:'milestone',system,accepted,outcome,sourceHash:seal,
  minutes:accepted?180:5,noPlayerKnowledge:true};
}
function night(s,ctx){
 const {actor:p,body,loc}=ctx;
 if(loc.biome!=='settlement'||ctx.workDay<0||
  body.status!=='ok'||!ctx.dailyActivity||
  ctx.dailyActivity.action!=='rest')return null;
 // The completed real night is 16:00–00:00 before this day boundary,
 // never another E.advance(s,480). Same Combat owner, one night.
 const start=ctx.workDay*1440+960,before={wounds:[...body.wounds],
  stamina:body.stamina,maxStamina:body.maxStamina,status:body.status},
  recovery=Combat.completedNight(s,'npc_'+p.id),
  proof={origin:REST,actorId:p.actorId,personOriginHash:p.originHash,
   physicalEntrySeal:body.npcOrigin.seal,
   independentDailySourceHash:ctx.dailySourceHash,
   originalShiftHash:ctx.originalShiftHash,
   site:ctx.site,startMinute:start,endMinute:start+480,
   completedDay:ctx.workDay+1,
   before,after:{wounds:[...body.wounds],stamina:body.stamina,
    maxStamina:body.maxStamina,status:body.status},
   noAdditionalPlayerTimeOrFreePower:true};
 p.originalOffscreenCombatNights||=[];
 if(p.originalOffscreenCombatNights.length>=480)
  p.originalOffscreenCombatNights.shift();
 p.originalOffscreenCombatNights.push({source:proof,seal:hash(proof)});
 if(!verifyNights(s,p))throw Error('Actual original offscreen sleep source failed replay');
 return {kind:'sleep',actualOriginalCombatRecovery:recovery.completedNights,
  noPlayerKnowledge:true};
}
function verifyNights(s,p){
 const rows=p?.originalOffscreenCombatNights||[];
 if(!Array.isArray(rows)||rows.length>480)return false;
 let prev=-1;
 for(const row of rows){
  const q=row?.source;
  if(!q||row.seal!==hash(q)||q.origin!==REST||
   q.actorId!==p.actorId||q.personOriginHash!==p.originHash||
   q.physicalEntrySeal!==s.table?.combatants?.['npc_'+p.id]?.npcOrigin?.seal||
   q.noAdditionalPlayerTimeOrFreePower!==true||
   !isDay(q.completedDay)||q.completedDay<=prev||
   q.startMinute!==(q.completedDay-1)*1440+960||
   q.endMinute!==q.startMinute+480||q.endMinute>s.world.minutes||
   !Array.isArray(q.before?.wounds)||!Array.isArray(q.after?.wounds)||
   JSON.stringify(q.after.wounds)!==JSON.stringify([
    Math.max(0,q.before.wounds[0]-1),
    q.before.wounds[1],q.before.wounds[2]])||
   q.after.stamina!==q.before.maxStamina||
   q.after.maxStamina!==q.before.maxStamina||
   q.after.status!==(q.before.status==='incapacitated'&&q.before.wounds[2]===0?
    'ok':q.before.status))
   return false;
  prev=q.completedDay;
 }
 return true;
}
// Runs only after the original independent daily life has chosen its OWN
// activity and committed its authentic three-draw receipt. Never runs from
// an explicit player/GM chosen person, rank, success or past world day.
function afterDaily(s,w,life,activity,day){
 if(!['practice','rest'].includes(activity?.source?.action))return null;
 const ctx=opportunity(s,w,life,activity,day);
 if(!ctx)return null;
 if(activity.source.action==='rest')
  return night(s,ctx);
 const system=activity.source.focus;
 if(!supported.has(system)||ctx.condition.workAndOrdinaryPracticeBlocked||
  !ctx.life.interests.includes(system)||
  system==='rift'&&ctx.site!=='ruins')return null;
 // Existing ordinary day decisions have already picked today's activity.
 // No extra independent action is granted, no duplicated time advancement.
 const original=ctx.actor.originalEarlyDisciplinePreparation?.[system];
 return original?.points===Disc.KEYS[system].tracks[Early.TARGETS[system]][0]?
  milestone(s,ctx,system):dailyPractice(s,ctx,system);
}
module.exports={ORIGIN,REST,afterDaily,verifyEvidence,verifyNights};
