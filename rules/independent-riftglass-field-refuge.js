'use strict';
// #177: a personally CHOSEN independent rest day at the REAL Riftglass
// exterior may include one physical 45-minute, 3-Stamina Survival survey
// using the ORIGINAL player's wilderness-camp law. Only a real DC20+weather
// success creates an 18-hour exterior windbreak. An original second PRIVATE
// human choice determines whether they actually sleep there; a failed
// scout or refused night does NOT restore ANY stamina or wound boxes.
//
// This records a temporary SITE opportunity, not a GM-made camp, fixed
// sleeping right, licence, Fold, portal, vault route, travel permit or
// magical restoration. The original independent day (REST) is the owner of
// the person's time; no extra calendar day, fake source RNG, or player turn.
const Crypto=require('node:crypto'),Core=require('./core'),
 Combat=require('./combat'),Wilderness=require('./wilderness-camp'),
 People=require('../world/emergent-people'),
 Lives=require('../world/independent-person-lives'),
 Sense=require('./independent-original-rift-sense-observation'),
 SenseLaw=require('./rift-shared-original-exterior-sense');
const ORIGIN='source-surveyed-independent-riftglass-exterior-night-refuge-v1',
 REGION='riftglass',LOCATION='ruins',
 SCOUT_AT=15*60,REST_AT=16*60,DURATION=18*60;
const hash=x=>Crypto.createHash('sha256').
 update(JSON.stringify(x)).digest('hex');
const witness=(q)=>hash({origin:ORIGIN,
 actorId:q.actorId,site:LOCATION,day:q.day,
 originalShiftHash:q.originalShiftHash,
 sampleHash:q.sampleHash,
 originalSurvivalRoll:q.check?.roll});
function costWeather(weather){
 return Wilderness.SITES.ruins.dc+Wilderness.weatherPenalty(weather);
}
function verify(s,p){
 const record=p?.originalRiftglassFieldRest;
 if(record===undefined)return true;
 const world=s.table?.realm,life=world?.independentPersonLives?.people?.[p.id],
  body=s.table?.combatants?.['npc_'+p.id],
  reading=p?.originalRiftMeasuredSense?.successfulReading;
 if(!record||record.origin!==ORIGIN||
  !Array.isArray(record.attempts)||record.attempts.length<1||
  record.attempts.length>480||
  !life||!Lives.verifyEntry(world,life)||!body?.npcOrigin?.seal||
  !Sense.verify(s,p)||!reading?.sourceHash||
  !p.mechanicalFoundation?.baselineAttributes||
  !Number.isInteger(world?.worldSeed))return false;
 let previous=-1;
 for(const row of record.attempts){
  const q=row?.source,sh=q?.originalShiftProof,
   daily=q?.originalIndependentRestDay;
  if(!q||row.seal!==hash(q)||
   q.origin!==ORIGIN||q.actorId!==p.actorId||
   q.individualOriginHash!==p.originHash||
   q.originalFoundationSeal!==p.mechanicalFoundation.seal||
   q.originalCombatEntrySeal!==body.npcOrigin.seal||
   q.originalReadingSourceHash!==reading.sourceHash||
   q.site!==LOCATION||q.regionId!==REGION||
   !Number.isInteger(q.day)||q.day<=previous||
   q.day<=reading.day||
   q.startMinute!==q.day*1440+SCOUT_AT||
   q.scoutEndMinute!==q.startMinute+Wilderness.MINUTES||
   q.nightStartMinute!==q.day*1440+REST_AT||
   q.scoutEndMinute>q.nightStartMinute||
   q.sampledMinute!==(q.day+1)*1440||
   q.sampledMinute>s.world.minutes||
   !sh||sh.hash!==q.originalShiftHash||
   sh.actorId!==p.actorId||sh.originHash!==p.originHash||
   sh.location!==LOCATION||sh.fromDay>q.day||sh.throughDay<q.day||
   hash(Object.fromEntries(Object.entries(sh).
    filter(([k])=>k!=='hash')))!==sh.hash||
   !daily||daily.origin!==Lives.ORIGIN||
   daily.actorId!==p.actorId||daily.identityHash!==p.originHash||
   daily.day!==q.day+1||daily.action!=='rest'||
   q.originalIndependentDailySourceHash!==hash(daily)||
   !Number.isInteger(q.rngBefore)||q.rngBefore<1||
   q.scoutMinutes!==Wilderness.MINUTES||
   q.scoutStaminaSpent!==Wilderness.STAMINA||
   !Number.isInteger(q.staminaBefore)||
   q.staminaBefore<Wilderness.STAMINA||
   !Number.isInteger(q.maxStaminaAtDecision)||
   q.staminaBefore>q.maxStaminaAtDecision||
   q.staminaAfterSurvey!==q.staminaBefore-Wilderness.STAMINA||
   JSON.stringify(q.woundsBefore)!==JSON.stringify(q.woundsAfterSurvey)||
   !Array.isArray(q.woundsBefore)||q.woundsBefore.length!==3||
   !q.scoutingLocationSafeToAttempt||
   q.scoutingLocationSafeToAttempt!==true||
   q.noInventedWildernessNightOrPlayerTravel!==true||
   q.noFoldVaultOrAutomaticExtraMagic!==true)
   return false;
  const matching=life.history.find(x=>x.source.day===daily.day);
  if(matching&&(matching.seal!==q.originalIndependentDailySourceHash||
   JSON.stringify(matching.source)!==JSON.stringify(daily)))return false;
  if(!matching&&life.history.length&&
   daily.day>=life.history[0].source.day)return false;
  try{
   const sample=q.snapshot;
   if(sample.worldSeed!==world.worldSeed||
    sample.day!==q.day+1||
    q.sampleHash!==SenseLaw.digest(sample))
    return false;
   SenseLaw.risk(sample);
  }catch{return false;}
  if(typeof q.weather!=='string'||q.weather.length>120||
   q.dc!==costWeather(q.weather)||
   q.modifier!==Math.floor(
    (p.mechanicalFoundation.baselineAttributes.wis-10)/2))
   return false;
  const roller={rngState:q.rngBefore},
   roll=Core.die(roller,20),
   margin=roll+q.modifier+Core.naturalAdjustment(roll)-q.dc,
   degree=Core.degree(margin),success=margin>=0;
  if(!q.check||q.check.roll!==roll||
   q.check.dc!==q.dc||q.check.modifier!==q.modifier||
   q.check.margin!==margin||q.check.degree!==degree||
   q.check.success!==success||
   q.shelterSurveySucceeded!==success||
   q.validUntilMinute!==(success?
     q.scoutEndMinute+DURATION:null))
   return false;
  if(success){
   const choice=q.nightChoice;
   if(!choice||q.nightChoiceHash!==hash(choice)||
    !People.verifyOriginalNightChoice(choice)||
    choice.actorId!==p.actorId||
    choice.individualOriginHash!==p.originHash||
    choice.originalCombatEntrySeal!==body.npcOrigin.seal||
    choice.location!==LOCATION||
    choice.sourceShiftHash!==q.originalShiftHash||
    choice.sceneWitnessHash!==witness(q)||
    choice.startMinute!==q.nightStartMinute||
    choice.rngBefore!==roller.rngState||
    q.nightAccepted!==choice.accepted||
    q.rngAfter!==choice.rngAfter||
    q.validUntilMinute<q.sampledMinute)
    return false;
  }else if(q.nightChoice!==null||q.nightChoiceHash!==null||
   q.nightAccepted!==false||q.rngAfter!==roller.rngState)
   return false;
  previous=q.day;
 }
 return true;
}
function verifiedNight(s,p,proof){
 const r=p?.originalRiftglassFieldRest,
  row=r?.attempts?.find(x=>x.seal===proof.originalFieldSurveyHash&&
   x.source.nightChoiceHash===proof.originalFieldNightChoiceHash);
 if(!row||!verify(s,p))return false;
 const q=row.source;
 return q.nightAccepted===true&&
  q.shelterSurveySucceeded===true&&
  q.day===proof.completedDay-1&&
  q.sampledMinute===proof.endMinute&&
  q.site===proof.site&&
  q.nightStartMinute===proof.startMinute&&
  q.validUntilMinute>=proof.endMinute;
}
function propose(s,ctx){
 const p=ctx.actor,body=ctx.body,world=s.table?.realm,
  reading=p?.originalRiftMeasuredSense?.successfulReading;
 if(!reading||!Sense.verify(s,p)||!verify(s,p)||
  ctx.site!==LOCATION||p.regionId!==REGION||
  ctx.dailyActivity?.action!=='rest'||
  body.status!=='ok'||body.stamina<Wilderness.STAMINA||
  ctx.workDay<=reading.day||
  p.originalRiftglassFieldRest?.attempts?.some(x=>
   x.source.day===ctx.workDay)||
  (p.originalRiftglassFieldRest?.attempts.length||0)>=480||
  s.battle||s.encounter)return null;
 const initialRng=p.rngState,wounds=[...body.wounds],
  current=body.stamina,
  weather=String(s.world.weather||'Fair').slice(0,120),
  snapshot=SenseLaw.snapshot(world,ctx.workDay+1),
  dc=costWeather(weather),
  modifier=Math.floor((p.mechanicalFoundation.baselineAttributes.wis-10)/2),
  previousLog=s.log.slice();
 let check;
 try{
  check=Core.check(s,{modifier,dc,privateDisplay:true,
   label:'Original Riftglass exterior wardstone refuge Survival survey',
   independentRngOwner:p,risky:true});
 }finally{s.log.splice(0,s.log.length,...previousLog);}
 // Exactly the ORIGINAL Wilderness-Camp physical survey cost, regardless
 // of whether the real player's original Survival rule succeeds.
 body.stamina-=Wilderness.STAMINA;
 const q={origin:ORIGIN,actorId:p.actorId,
  individualOriginHash:p.originHash,
  originalFoundationSeal:p.mechanicalFoundation.seal,
  originalCombatEntrySeal:body.npcOrigin.seal,
  originalReadingSourceHash:reading.sourceHash,
  regionId:REGION,site:LOCATION,day:ctx.workDay,
  startMinute:ctx.workDay*1440+SCOUT_AT,
  scoutEndMinute:ctx.workDay*1440+SCOUT_AT+Wilderness.MINUTES,
  nightStartMinute:ctx.workDay*1440+REST_AT,
  sampledMinute:s.world.minutes,
  originalShiftHash:ctx.originalShiftHash,
  originalShiftProof:structuredClone(ctx.originalShift),
  originalIndependentRestDay:structuredClone(ctx.dailyActivity),
  originalIndependentDailySourceHash:ctx.dailySourceHash,
  snapshot,sampleHash:SenseLaw.digest(snapshot),weather,
  dc,modifier,rngBefore:initialRng,rngAfter:null,
  scoutMinutes:Wilderness.MINUTES,
  scoutStaminaSpent:Wilderness.STAMINA,
  staminaBefore:current,maxStaminaAtDecision:body.maxStamina,
  staminaAfterSurvey:body.stamina,
  woundsBefore:wounds,woundsAfterSurvey:[...body.wounds],
  check:{roll:check.roll,dc:check.dc,modifier:check.modifier,
   margin:check.margin,degree:check.degree,success:check.success},
  shelterSurveySucceeded:check.success,
  validUntilMinute:check.success?
   ctx.workDay*1440+SCOUT_AT+Wilderness.MINUTES+DURATION:null,
  scoutingLocationSafeToAttempt:true,
  nightChoice:null,nightChoiceHash:null,nightAccepted:false,
  noInventedWildernessNightOrPlayerTravel:true,
  noFoldVaultOrAutomaticExtraMagic:true};
 if(check.success){
  const night=People.considerOriginalOvernightSleep(world,p,{
   startMinute:q.nightStartMinute,
   sourceShiftHash:q.originalShiftHash,
   sceneWitnessHash:witness(q),
   originalCombatEntrySeal:body.npcOrigin.seal,
   location:LOCATION});
  q.nightChoice=night.source;q.nightChoiceHash=night.sourceHash;
  q.nightAccepted=night.source.accepted;
 }
 q.rngAfter=p.rngState;
 const row={source:q,seal:hash(q)};
 p.originalRiftglassFieldRest||={origin:ORIGIN,attempts:[]};
 p.originalRiftglassFieldRest.attempts.push(row);
 if(!verify(s,p))
  throw Error('Actual personally surveyed Riftglass shelter or sleep choice failed replay');
 return {accepted:q.nightAccepted,originalSurveySourceHash:row.seal,
  originalNightChoiceSourceHash:q.nightChoiceHash,
  surveySucceeded:q.shelterSurveySucceeded,
  actualOriginalSurvivalDC:dc,
  originalSurveyStaminaSpent:Wilderness.STAMINA,
  noUnverifiedNightOrFutureRiftProgress:true};
}
function privateStatus(s,p){
 if(!verify(s,p)||!require('../world/independent-original-power-days').
  verifyNights(s,p))
  throw Error('Original private Riftglass field refuge proof was altered');
 const attempts=p.originalRiftglassFieldRest?.attempts||[],
  nights=(p.originalOffscreenCombatNights||[]).filter(x=>
   x.source?.site===LOCATION&&x.source.originalFieldSurveyHash);
 return {privateToGM:true,
  originalSurvivalRuleOwner:'rules/wilderness-camp.js',
  actualIndependentRestSurveys:attempts.length,
  personallySuccessfulScoutedRefuges:attempts.filter(x=>
   x.source.shelterSurveySucceeded).length,
  personallyAcceptedOriginalFieldNights:nights.length,
  verifiedOriginalCombatNightStaminaRestored:nights.reduce((sum,x)=>
   sum+x.source.after.stamina-x.source.before.stamina,0),
  originalSurveyStaminaCost:Wilderness.STAMINA,
  originalSurveyMinutes:Wilderness.MINUTES,
  originalRiftglassSurvivalBaseDC:Wilderness.SITES.ruins.dc,
  temporaryRefugeNotPermanentHousing:true,
  expiresAfterOriginalHours:DURATION/60,
  noUnverifiedFreeSleepOrVoidVaultTravel:true};
}
module.exports={ORIGIN,REGION,LOCATION,SCOUT_AT,REST_AT,DURATION,
 costWeather,verify,verifiedNight,propose,privateStatus};
