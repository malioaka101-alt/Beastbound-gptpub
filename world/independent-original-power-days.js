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
const supported=new Set(['meridian','arcane','soul','body','rift']);
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
 const workDay=day-1,originalShift=People.shift(p,workDay,w),
  site=originalShift?.location;
 if(!site)return null;
 const loc=Lived.location(s,site);
 // A real GM-established home/work settlement is every bit as legitimate
 // as one of the engine's six fixed player locations. Only the person's
 // own source-authored site and actual region may supply a remote practice
 // opportunity, never the player's current location or a fabricated visit.
 if(!loc||loc.regionId!==p.regionId)return null;
 // A completed original paid-work sixday on the same physical daylight
 // date is not a free simultaneous two-hour supernatural practice slot.
 if(p.history?.some(h=>h.day===workDay&&
  h.type==='independent-life'&&h.choice==='livelihood-work'))return null;
 return {actor:p,life,body,workDay,site,loc,condition,
  originalShift,
  dailySourceHash:activity.seal,dailyActivity:activity.source,
  originalShiftHash:originalShift.hash};
}
function evidence(ctx,kind){
 return {origin:ORIGIN,kind,actorId:ctx.actor.actorId,
  independentLifeDay:ctx.workDay+1,
  independentDailySourceHash:ctx.dailySourceHash,
  originalWorkDay:ctx.workDay,sourceRegionId:ctx.actor.regionId,
  privatePhysicalSite:ctx.site,
  originalShiftHash:ctx.originalShiftHash,
  originalShiftProof:structuredClone(ctx.originalShift),
  noPlayerPresenceOrPlayerControlAssumed:true};
}
// A sealed original personal-day event may age out of its 80-entry ordinary
// history. Check it against that actual record whenever retained, and retain
// its original signed source inside the cultivation receipt for older saves.
function verifyEvidenceInternal(s,p,q,verifiedLife=null){
 const x=q?.offscreenOpportunity;
 if(!x)return q?.offscreenOpportunity===undefined;
 if(x.origin!==ORIGIN||x.actorId!==p.actorId||
  x.kind!==(q.system||'meridian')||!supported.has(x.kind)||
  !isDay(x.originalWorkDay)||x.independentLifeDay!==x.originalWorkDay+1||
  x.originalWorkDay!==q.day||x.originalShiftHash!==q.originalShiftHash||
  !x.originalShiftProof||
  x.originalShiftProof.hash!==x.originalShiftHash||
  hash(Object.fromEntries(Object.entries(x.originalShiftProof).
   filter(([k])=>k!=='hash')))!==x.originalShiftHash||
  x.originalShiftProof.actorId!==p.actorId||
  x.originalShiftProof.originHash!==p.originHash||
  x.originalShiftProof.location!==x.privatePhysicalSite||
  x.originalShiftProof.scheduledAtDay!==q.day||
  q.originalSceneHash!==hash(x)||
  !/^[a-f0-9]{64}$/.test(x.independentDailySourceHash||'')||
  typeof x.privatePhysicalSite!=='string'||
  x.noPlayerPresenceOrPlayerControlAssumed!==true)
  return false;
 const w=s.table?.realm,life=w?.independentPersonLives?.people?.[p.id];
 if(!life||(verifiedLife!==life&&
  !require('./independent-person-lives').verifyEntry(w,life)))
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
// One SOURCE-VERIFIED life for ONE immediate 108-Gate history replay.
// Never cache this across world ticks, replay calls, imports or mutations.
// Each practice witness / shift / day hash is STILL checked individually.
function verifyEvidence(s,p,q){return verifyEvidenceInternal(s,p,q);}
function verifyEvidenceBatch(s,p,receipts){
 if(!Array.isArray(receipts)||!receipts.length)return false;
 const w=s.table?.realm,life=w?.independentPersonLives?.people?.[p?.id];
 if(!life||!require('./independent-person-lives').verifyEntry(w,life))
  return false;
 return receipts.every(q=>verifyEvidenceInternal(s,p,q,life));
}
function sourceBase(ctx,system,start,minutes,before,choice,accepted,points,methods,
 cooldown,training,extra={}){
 const e=evidence(ctx,system);
 return {origin:extra.origin||Early.ORIGIN,actorId:ctx.actor.actorId,
  system,target:extra.target||Early.TARGETS[system],
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
 const {actor:p,body}=ctx,sp=Disc.KEYS[system],
  spec=system==='arcane'&&p.originalArcaneCore?.coreIgnited?'circle1':Early.TARGETS[system],
  original=sp.tracks[spec],journal=p.originalEarlyDisciplinePreparation||{},
  old=journal[system],all=Object.values(journal);
 if(p.originalArcaneCore?.circles>=1&&system==='arcane'||
  p.originalFirstPowerMilestones?.[system]||
  all.some(x=>x.lastAttemptDay>=ctx.workDay)||
  p.meridianTraining?.lastAttemptDay>=ctx.workDay||
  old?.points>=original[0]||old?.target&&old.target!==spec||
  ctx.workDay<(old?.cooldownUntil||0)||
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
   x.source.accepted&&x.source.target===spec).map(x=>({system,target:spec,method:x.source.method,
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
   target:spec,method,methodNumber,check,complicationRoll,
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
  record=journal[system],
  target=system==='arcane'&&p.originalArcaneCore?.coreIgnited?'circle1':Early.TARGETS[system],
  [required,baseDC]=Disc.KEYS[system].tracks[target],
  isArcane=system==='arcane',isCircleOne=isArcane&&target==='circle1';
 if(!record||record.points!==required||record.target!==target||
  Object.keys(record.methods).filter(k=>record.methods[k]>0).length<2||
  ctx.workDay<record.cooldownUntil||
  Object.values(journal).some(x=>x.lastAttemptDay>=ctx.workDay)||
  p.meridianTraining?.lastAttemptDay>=ctx.workDay||
  p.originalFirstPowerMilestones?.[system]||
  p.originalArcaneCore?.circles>=1||
  body.status!=='ok'||body.stamina<1||
  body.wounds.some(x=>x!==0)||record.sessions.length>=480)
  return null;
 if(!Early.verify(s,p))throw Error('Original offscreen milestone source is altered');
 const before=p.rngState,chance=Early.chance(p),choice=Core.die(p,100),
  accepted=choice<=chance,starting=ctx.workDay*1440+600,
  base=sourceBase(ctx,system,starting,accepted?180:5,before,choice,
   accepted,record.points,record.methods,record.cooldownUntil,null,{
    target,origin:isCircleOne?
     require('../rules/independent-original-arcane-core').CIRCLE:
     isArcane?require('../rules/independent-original-arcane-core').ORIGIN:
     First.ORIGIN,
    originalRiteDC:baseDC+5,
    originalPotentialDimension:Potential.PRIMARY[system][target],
    originalPotentialBonus:Potential.bonus(
     p.mechanicalFoundation.unassessedPotential[
      Potential.PRIMARY[system][target]]),
    insightSpent:0,feeTalons:0,
    ...(isCircleOne?{
     noLearnedSpellOrTechniqueGranted:true,
     originalPriorCoreSourceHash:p.originalArcaneCore.originalSourceHash
    }:isArcane?{noCircleSpellOrTechniqueGranted:true}:{
     sourceOwner:'rules/disciplines.js',noOtherSystemOrTechniqueGranted:true})
   }),
  previous={...record.methods},previousPoints=record.points,
  initialWounds=[...body.wounds];
 let check=null,outcome='declined',endCooldown=record.cooldownUntil,
  nextPoints=record.points,nextMethods=record.methods,
  injury=false,effect=null,mana=null,geometry=null,channels=null,maxComplexity=null;
 if(accepted){
  const training=Disc.originalActorTrainingProfile(s,{
   actorId:p.actorId,system,target});
  const actual=safeCheck(s,{modifier:training.modifier,dc:baseDC+5,
   label:'Private original '+system+' milestone',
   independentRngOwner:p});
  check={roll:actual.roll,modifier:actual.modifier,dc:actual.dc,
   degree:actual.degree,success:actual.success};
  if(actual.success){
   outcome=isCircleOne?'circle-formed':isArcane?'ignited':'breakthrough';
   nextPoints=0;nextMethods={};
   if(isArcane){
    const profile=Build.arcaneProfile(isCircleOne?1:0);
    mana=profile.mana;
    geometry=isCircleOne?
     require('../rules/independent-original-arcane-core').circleGeometry(p):
     'seeded core';
    if(isCircleOne){channels=profile.channels;maxComplexity=profile.maxComplexity;}
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
   structuredManaAfter:mana,geometryAfter:geometry,
   ...(isCircleOne?{channelsAfter:channels,maxComplexityAfter:maxComplexity}:{})
  }:{effect})};
 const seal=Early.hash(source);
 record.sessions.push({source,seal});
 record.points=nextPoints;record.methods=nextMethods;
 record.cooldownUntil=endCooldown;record.lastAttemptDay=ctx.workDay;
 if(outcome==='circle-formed'){
  record.target='circle-one-earned';
  p.originalArcaneCore={coreIgnited:true,circles:1,
   geometry,structuredMana:mana,
   originalSourceHash:p.originalArcaneCore.originalSourceHash,
   noLearnedSpells:true,
   originalCircleOneSourceHash:seal,channels,maxComplexity};
 }else if(outcome==='ignited'){
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
 // A real observed sleep already occupies these physical hours. Never
 // duplicate it with an unwitnessed 16:00–00:00 NPC rest on the same day.
 const overlapping=s.table?.originalNpcNightInProgress;
 if(overlapping?.actorId===p.actorId&&
  overlapping.day===ctx.workDay&&overlapping.accepted===true)
  return null;
 if(ctx.workDay<1||body.status!=='ok'||!ctx.dailyActivity||
  ctx.dailyActivity.action!=='rest')return null;
 // Settlement nights retain their OWN prior witnessed, independently
 // accepted original shelter. A Riftglass RUINS night instead requires
 // original survival surveying (45 minutes, 3 real Stamina, weather/risk),
 // an actual successful temporary site and a distinct independent human
 // choice to sleep there. Mere wardstones or a rift survey facility are
 // never automatic shelter; no other wilderness site becomes free lodging.
 let witnessed=null,field=null;
 if(loc.biome==='settlement'){
  const Health=require('../rules/unified');
  if(!Health.verifyNpcNightHistory(s,p.actorId))
   throw Error('Prior original safe-shelter history is invalid');
  witnessed=(p.originalOvernightRestDecisions||[]).filter(x=>
   x?.source?.accepted===true&&x.result?.accepted===true&&
   x.source.location===ctx.site&&x.source.day<ctx.workDay).at(-1);
  if(!witnessed)return null;
 }else if(ctx.site==='ruins'&&p.regionId==='riftglass'){
  field=require('../rules/independent-riftglass-field-refuge').propose(s,ctx);
  if(!field?.accepted)return null;
 }else return null;
 // The completed real night is 16:00–00:00 before this day boundary,
 // never another E.advance(s,480). Same Combat owner, one night.
 const start=ctx.workDay*1440+960,before={wounds:[...body.wounds],
  stamina:body.stamina,maxStamina:body.maxStamina,status:body.status},
  recovery=Combat.completedNight(s,'npc_'+p.id),
  proof={origin:REST,actorId:p.actorId,personOriginHash:p.originHash,
   physicalEntrySeal:body.npcOrigin.seal,
   ...(witnessed?{originalWitnessedShelterHash:witnessed.sourceHash}:{}),
   ...(field?{originalFieldSurveyHash:field.originalSurveySourceHash,
    originalFieldNightChoiceHash:field.originalNightChoiceSourceHash}:{}),
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
 const originalNight=p.originalOffscreenCombatNights.at(-1);
 const qi=require('./independent-meridian-night-qi').afterNight(s,p,
  originalNight);
 const soulReserve=p.originalSoulHigherArchitecture!==undefined?
  require('../rules/independent-original-higher-architectures').afterNight(s,p,originalNight,'soul'):
  p.originalSoulLatticeThree!==undefined?
  require('../rules/independent-original-soul-lattice-three')
   .afterNight(s,p,originalNight):
  require('../rules/independent-original-soul-thread-two')
   .afterNight(s,p,originalNight);
 const arcaneMana=p.originalArcaneHigherArchitecture!==undefined?
  require('../rules/independent-original-higher-architectures').afterNight(s,p,originalNight,'arcane'):
  p.originalArcaneMatrix!==undefined?
  require('../rules/independent-original-arcane-matrix-three')
   .afterNight(s,p,originalNight):
  require('../rules/independent-original-arcane-circle-two')
   .afterNight(s,p,originalNight);
 // Original Combat.rest({weeks:1}) Serious recovery requires six
 // consecutive PERSONALLY chosen, fully witnessed safe rest days.
 // Already elapsed independent days never advance again.
 const convalesced=require('./independent-serious-convalescence').
  afterNight(s,ctx);
 return {kind:'sleep',actualOriginalCombatRecovery:recovery.completedNights,
  originalRestoredQi:qi?.restoredQi||0,
  ...(soulReserve?{originalRestoredSoulReserve:soulReserve.originalSoulReserveRestored}:{}),
  ...(arcaneMana?{originalRestoredArcaneMana:arcaneMana.actualOriginalManaRestored}:{}),
  ...(convalesced?{originalSeriousSixdayRecovery:1}:{}),
  noPlayerKnowledge:true};
}
// An archived original-night receipt can be checked after the current
// 480-night rolling body ledger has aged it out. All ordinary source checks,
// prior witnessed shelter, physical costs and daily provenance still apply.
function verifyNights(s,p,archivedRows=null){
 const rows=archivedRows===null?(p?.originalOffscreenCombatNights||[]):archivedRows,
  life=s.table?.realm?.independentPersonLives?.people?.[p?.id];
 if(!Array.isArray(rows)||rows.length>480)return false;
 if(rows.length&&(!life||!require('./independent-person-lives').
  verifyEntry(s.table.realm,life)))return false;
 let prev=-1;
 for(const row of rows){
  const q=row?.source,
   body=s.table?.combatants?.['npc_'+p.id];
  if(!q||row.seal!==hash(q)||q.origin!==REST||
   q.actorId!==p.actorId||q.personOriginHash!==p.originHash||
   q.physicalEntrySeal!==body?.npcOrigin?.seal||
   q.noAdditionalPlayerTimeOrFreePower!==true||
   !isDay(q.completedDay)||q.completedDay<=prev||
   q.startMinute!==(q.completedDay-1)*1440+960||
   q.endMinute!==q.startMinute+480||q.endMinute>s.world.minutes||
   typeof q.site!=='string'||q.site.length<2||
   !/^[a-f0-9]{64}$/.test(q.originalShiftHash||'')||
   !/^[a-f0-9]{64}$/.test(q.independentDailySourceHash||'')||
   !(q.site==='ruins'?
    /^[a-f0-9]{64}$/.test(q.originalFieldSurveyHash||'')&&
    /^[a-f0-9]{64}$/.test(q.originalFieldNightChoiceHash||'')&&
    q.originalWitnessedShelterHash===undefined:
    /^[a-f0-9]{64}$/.test(q.originalWitnessedShelterHash||'')&&
    q.originalFieldSurveyHash===undefined&&
    q.originalFieldNightChoiceHash===undefined)||
   !Array.isArray(q.before?.wounds)||q.before.wounds.length!==3||
   !Array.isArray(q.after?.wounds)||q.after.wounds.length!==3||
   q.before.wounds.some((v,i)=>!Number.isInteger(v)||v<0||
    v>body.boxes[i])||
   !Number.isInteger(q.before.stamina)||q.before.stamina<0||
   !Number.isInteger(q.before.maxStamina)||q.before.maxStamina<1||
   q.before.stamina>q.before.maxStamina||
   !['ok','incapacitated','knocked_out'].includes(q.before.status)||
   JSON.stringify(q.after.wounds)!==JSON.stringify([
    Math.max(0,q.before.wounds[0]-1),
    q.before.wounds[1],q.before.wounds[2]])||
   q.after.stamina!==q.before.maxStamina||
   q.after.maxStamina!==q.before.maxStamina||
   q.after.status!==(
    ['incapacitated','knocked_out'].includes(q.before.status)&&
     q.before.wounds[2]===0?'ok':q.before.status))
   return false;
  // Keep independent physical shelter owner source-specific.
  // A source-proven exterior Riftglass wardstone refuge is NOT a
  // settlement room, must expire after 18h and requires BOTH a completed
  // Survival survey AND an independently accepted personal sleep choice.
  if(q.site==='ruins'){
   if(!require('../rules/independent-riftglass-field-refuge').
    verifiedNight(s,p,q))return false;
  }else if(!require('../rules/unified').verifyNpcNightHistory(s,p.actorId)||
   !(p.originalOvernightRestDecisions||[]).some(x=>
    x.sourceHash===q.originalWitnessedShelterHash&&
    x.source.accepted===true&&x.result.accepted===true&&
    x.source.location===q.site&&
    x.source.day<q.completedDay-1))
   return false;
  // Source-verify original private rest from the already chosen daily
  // action. This remains required while the 80-entry daily ledger retains
  // that date; old archived histories rely on the separately sealed receipt.
  const day=life.history.find(x=>x.source.day===q.completedDay);
  if(day){
   if(day.seal!==q.independentDailySourceHash||
    day.source.action!=='rest')return false;
  }else if(life.history.length&&q.completedDay>=life.history[0].source.day)
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
 if(activity.source.action==='rest'){
  // An exterior Riftglass rest is NOT a settlement safe night. After
  // independently witnessed sensing, the person can still choose ONE
  // original Combat Recover action without inventing shelter or an
  // overnight recharge. It does not create a second independent life day.
  if(ctx.site==='ruins'&&ctx.actor.regionId==='riftglass'){
   const safeNight=night(s,ctx);
   return safeNight||require('../rules/independent-original-riftglass-one-recover')
    .afterRestDay(s,ctx);
  }
  return night(s,ctx);
 }
 const system=activity.source.focus;
 // Witnessed original Nerve–Sense work already owns this person's
 // daylight discipline decision; no duplicate autonomous power practice.
 if(ctx.actor.originalBodyNerveSenseFour?.lastAttemptDay===ctx.workDay||
  ctx.actor.originalBodyLivingPhysiques?.lastAttemptDay===ctx.workDay||
  ctx.actor.originalOriginPatternResearch?.lastAttemptDay===ctx.workDay||
  ['originalSoulHigherArchitecture','originalArcaneHigherArchitecture'].some(k=>ctx.actor[k]?.sessions.some(x=>x.source.day===ctx.workDay)))return null;
 if(!supported.has(system)||ctx.condition.workAndOrdinaryPracticeBlocked||
  !ctx.life.interests.includes(system)||
  system==='rift'&&ctx.site!=='ruins')return null;
 // Meridian uses its OWN Foundation / Stage I source owner. Never route
 // its Qi quality, integrity or stamina through a generic first-milestone.
 if(system==='meridian'){
  const result=require('./independent-offscreen-meridian').practice(s,ctx);
  // Real verified Meridian breakthroughs have real physical Combat effects.
  // Apply the EXISTING Build.meridianProfile anatomy to this same Combat
  // body only after its actual original source receipt has passed replay.
  // Not every practice or refusal updates stats; no second check or tick.
  if(result&&(result.outcome==='breakthrough'||
   result.gateOpened&&[1,36,72,108].includes(result.gateNumber)||
   result.formed===true))
   require('../rules/meridian-npc-physical').synchronize(s,ctx.actor);
  return result;
 }
 // Only after a genuinely verified First Circle may this exact existing
 // independent practice day advance the original Second Circle architecture.
 // No extra life choice, time, player RNG, training rank or spell is created.
 if(system==='arcane'&&ctx.actor.originalArcaneCore?.circles===1)
  return ctx.actor.originalArcaneCircleTwo?.completed?
   require('../rules/independent-original-arcane-matrix-three').afterDaily(s,ctx):
   require('../rules/independent-original-arcane-circle-two').afterDaily(s,ctx);
 // Independently earned Soul Phase I begins only original Phase II inner
 // mind/body/resonance Threading. A title never unlocks an art.
 if(system==='soul'&&ctx.actor.originalFirstPowerMilestones?.soul?.phase===1)
  return ctx.actor.originalSoulThreadTwo?.completed?
   require('../rules/independent-original-soul-lattice-three')
    .afterDaily(s,ctx):
   require('../rules/independent-original-soul-thread-two')
    .afterDaily(s,ctx);
 // Only genuine source-earned Rift Sense I at the original Riftglass
 // exterior may independently MEASURE the real spatial boundary. A signed
 // successful reading is NOT an anchor, Fold Step or vault permission.
 if(system==='rift'&&ctx.actor.originalFirstPowerMilestones?.rift?.step===1)
  return ctx.actor.originalRiftMeasuredSense?.successfulReading?
   require('../rules/independent-original-rift-exterior-anchor-two')
    .afterDaily(s,ctx):
   require('../rules/independent-original-rift-sense-observation')
    .afterDaily(s,ctx);
 // Stage I Body tissue proof unlocks only the original Bone-Marrow work,
 // not a free cycle, technique or invented combat statistics.
 if(system==='body'&&ctx.actor.originalFirstPowerMilestones?.body?.
  completedCycle==='Muscle-Tendon Cycle')
  return ctx.actor.originalBodyCycleTwo?.completed?
   require('../rules/independent-original-body-organ-cycle-three')
    .afterDaily(s,ctx):
   require('../rules/independent-original-body-cycle-two').afterDaily(s,ctx);
 // Existing ordinary day decisions have already picked today's activity.
 // No extra independent action is granted, no duplicated time advancement.
 const original=ctx.actor.originalEarlyDisciplinePreparation?.[system];
 const target=system==='arcane'&&ctx.actor.originalArcaneCore?.coreIgnited?
  'circle1':Early.TARGETS[system];
 return original?.points===Disc.KEYS[system].tracks[target][0]?
  milestone(s,ctx,system):dailyPractice(s,ctx,system);
}
module.exports={ORIGIN,REST,afterDaily,verifyEvidence,verifyEvidenceBatch,verifyNights,
 opportunityEvidence:evidence};
