'use strict';
// #177 — An independently living person's first original Riftglass exterior
// measurement after source-verified Rift Sense I. Mirrors the REAL player
// first-stage-senses.js physics, not a fabricated offscreen anchor reading.
// One independently owned practice-day choice, optional actual private d20,
// original boundary snapshot, real Stamina, no added world time or PC RNG.
const Crypto=require('node:crypto'),Core=require('./core'),
 Combat=require('./combat'),Early=require('./independent-original-discipline-preparation'),
 Law=require('./rift-shared-original-exterior-sense');
const ORIGIN='source-earned-individual-riftglass-exterior-sense-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function first(p){
 const one=p?.originalFirstPowerMilestones?.rift;
 if(one?.kind!=='rift-step-one-sense'||one.step!==1||
  one.sense?.notTeleportation!==true||
  one.sense?.requires!=='Nearby anomaly or measured weak boundary'||
  !/^[a-f0-9]{64}$/.test(one.originalSourceHash||''))return null;
 return one;
}
function safeCheck(s,params){
 const before=s.log.slice();
 try{return Core.check(s,{...params,privateDisplay:true,risky:false});}
 finally{s.log.splice(0,s.log.length,...before);}
}
function verify(s,p){
 const r=p?.originalRiftMeasuredSense;
 if(r===undefined)return true;
 if(!first(p)||!Early.verify(s,p)||r?.origin!==ORIGIN||
  r.originalFirstSenseHash!==first(p).originalSourceHash||
  !Array.isArray(r.attempts)||r.attempts.length>480||
  !r.attempts.length||r.lastPracticeDay<0||
  !Number.isInteger(r.lastPracticeDay))return false;
 const body=s.table?.combatants?.['npc_'+p.id],
  Offscreen=require('../world/independent-original-power-days'),
  worldSeed=s.table?.realm?.worldSeed;
 if(!body?.npcOrigin?.seal||!Number.isInteger(worldSeed))return false;
 let lastDay=-1,lastMinute=0,success=null;
 for(const row of r.attempts){
  const q=row?.source;
  if(!q||row.seal!==hash(q)||success||
   q.origin!==ORIGIN||q.actorId!==p.actorId||q.system!=='rift'||
   q.target!=='exterior-sense-reading'||
   q.originalFirstSenseHash!==first(p).originalSourceHash||
   q.originalFoundationSeal!==p.mechanicalFoundation.seal||
   q.originalCombatEntrySeal!==body.npcOrigin.seal||
   q.individualOriginHash!==p.originHash||
   q.originalSiteId!==Law.SITE_ID||q.actualSite!=='ruins'||
   q.noAnchorFoldRouteOrVaultAccess!==true||
   !Number.isInteger(q.day)||q.day<=lastDay||
   q.startMinute!==q.day*1440+600||
   q.startMinute<lastMinute||
   q.startMinute+q.actualMinutes>s.world.minutes||
   q.sampledMinute!==(q.day+1)*1440||
   q.sampledMinute>s.world.minutes||
   !Offscreen.verifyEvidence(s,p,q)||
   q.choiceChance!==Early.chance({
    personality:q.personalityAtDecision,fatigue:q.fatigueAtDecision})||
   !Number.isInteger(q.rngBefore)||q.rngBefore<1||
   !Number.isInteger(q.staminaBefore)||q.staminaBefore<2||
   !Number.isInteger(q.maxStaminaAtAttempt)||
   q.staminaBefore>q.maxStaminaAtAttempt||
   JSON.stringify(q.woundsBefore)!=='[0,0,0]'||
   JSON.stringify(q.woundsAfter)!=='[0,0,0]')
   return false;
  const roller={rngState:q.rngBefore};
  if(q.choiceD100!==Core.die(roller,100)||
   q.accepted!==(q.choiceD100<=q.choiceChance))return false;
  if(!q.accepted){
   if(q.actualMinutes!==5||q.readingSnapshot!==null||
    q.sampleHash!==null||q.check!==null||
    q.publicObservation!==null||q.success!==false||
    q.staminaSpent!==0||q.staminaAfter!==q.staminaBefore)
    return false;
  }else{
   const v=q.readingSnapshot;
   try{if(v.worldSeed!==worldSeed||v.day!==q.day+1||
     q.sampleHash!==Law.digest(v))return false;
    Law.risk(v);
   }catch{return false;}
   const dc=Law.dc(v),
    modifier=Math.floor((p.mechanicalFoundation.baselineAttributes.int-10)/2),
    roll=Core.die(roller,20),
    margin=roll+modifier+Core.naturalAdjustment(roll)-dc,
    degree=Core.degree(margin,false),
    successNow=margin>=0;
   if(q.actualMinutes!==Law.READ_MINUTES||
    q.staminaSpent!==Law.STAMINA_COST||
    q.staminaAfter!==q.staminaBefore-Law.STAMINA_COST||
    q.check?.roll!==roll||q.check?.modifier!==modifier||
    q.check?.dc!==dc||q.check?.degree!==degree||
    q.check?.margin!==margin||q.check?.success!==successNow||
    q.publicObservation!==Law.observation(v,successNow)||
    q.success!==successNow)return false;
   if(successNow)success={day:q.day,worldMinute:q.sampledMinute,
    siteId:Law.SITE_ID,location:Law.LOCATION,
    worldSeed,readingSnapshotHash:q.sampleHash,
    sourceHash:row.seal,
    publicObservation:q.publicObservation,
    success:true,noAnchorFoldOrTravelGranted:true};
  }
  if(q.rngAfter!==roller.rngState)return false;
  lastDay=q.day;lastMinute=q.startMinute+q.actualMinutes;
 }
 return r.lastPracticeDay===lastDay&&
  JSON.stringify(r.successfulReading)===JSON.stringify(success);
}
function ensureLedger(s,p){
 const one=first(p);
 if(!one||!Early.verify(s,p))
  throw Error('An actual source-earned Step I Rift Sense is required');
 if(p.originalRiftMeasuredSense!==undefined){
  if(!verify(s,p))throw Error('Original independent Rift measurement failed replay');
  return p.originalRiftMeasuredSense;
 }
 p.originalRiftMeasuredSense={origin:ORIGIN,
  originalFirstSenseHash:one.originalSourceHash,
  attempts:[],lastPracticeDay:-1,successfulReading:null};
 return p.originalRiftMeasuredSense;
}
function privateStatus(s,p){
 if(!Early.verify(s,p)||!verify(s,p))
  throw Error('Original private Rift measurement evidence was altered');
 return {privateToGM:true,
  verifiedRiftStep:1,
  originalExteriorSenseMeasured:!!p.originalRiftMeasuredSense?.successfulReading,
  originalReading:p.originalRiftMeasuredSense?.successfulReading?
   structuredClone(p.originalRiftMeasuredSense.successfulReading):null,
  noSpatialAnchorFoldOrVaultAccess:true};
}
function afterDaily(s,ctx){
 const p=ctx.actor,body=ctx.body;
 if(!first(p)||!Early.verify(s,p)||!verify(s,p)||
  ctx.site!==Law.LOCATION||ctx.actor.regionId!=='riftglass'||
  p.originalRiftMeasuredSense?.successfulReading||
  body.status!=='ok'||body.wounds.some(x=>x!==0)||
  body.stamina<Law.STAMINA_COST)return null;
 const r=ensureLedger(s,p);
 if(r.attempts.length>=480||r.lastPracticeDay>=ctx.workDay||
  Object.values(p.originalEarlyDisciplinePreparation||{}).
   some(x=>x.lastAttemptDay>=ctx.workDay)||
  p.meridianTraining?.lastAttemptDay>=ctx.workDay)return null;
 const chance=Early.chance(p),rngBefore=p.rngState,
  choiceD100=Core.die(p,100),accepted=choiceD100<=chance,
  staminaBefore=body.stamina,originalWounds=[...body.wounds],
  originalOpportunity=require('../world/independent-original-power-days')
   .opportunityEvidence(ctx,'rift');
 let snapshot=null,sampleHash=null,check=null,observation=null,success=false;
 if(accepted){
  const LawWorld=require('../world/simulation');
  // This is the ACTUAL world source at the independent-day processing
  // moment; never claim a fabricated earlier player visit or hidden site.
  snapshot=Law.snapshot(LawWorld.peek(s),ctx.workDay+1);
  sampleHash=Law.digest(snapshot);
  const modifier=Math.floor((p.mechanicalFoundation.baselineAttributes.int-10)/2),
   result=safeCheck(s,{modifier,dc:Law.dc(snapshot),
    label:'Independent original Riftglass exterior spatial sensing',
    independentRngOwner:p});
  check={roll:result.roll,modifier:result.modifier,dc:result.dc,
   degree:result.degree,margin:result.margin,success:result.success};
  success=result.success;
  observation=Law.observation(snapshot,success);
  body.stamina-=Law.STAMINA_COST;
 }
 const source={origin:ORIGIN,actorId:p.actorId,system:'rift',
  target:'exterior-sense-reading',
  individualOriginHash:p.originHash,
  originalFoundationSeal:p.mechanicalFoundation.seal,
  originalCombatEntrySeal:body.npcOrigin.seal,
  originalFirstSenseHash:r.originalFirstSenseHash,
  originalShiftHash:ctx.originalShiftHash,
  originalSceneHash:hash(originalOpportunity),
  offscreenOpportunity:originalOpportunity,
  originalSiteId:Law.SITE_ID,actualSite:Law.LOCATION,
  day:ctx.workDay,startMinute:ctx.workDay*1440+600,
  sampledMinute:s.world.minutes,actualMinutes:accepted?Law.READ_MINUTES:5,
  rngBefore,rngAfter:p.rngState,
  personalityAtDecision:p.personality,fatigueAtDecision:p.fatigue,
  choiceChance:chance,choiceD100,accepted,
  readingSnapshot:snapshot,sampleHash,check,
  success,publicObservation:observation,
  staminaBefore,maxStaminaAtAttempt:body.maxStamina,
  staminaSpent:accepted?Law.STAMINA_COST:0,staminaAfter:body.stamina,
  woundsBefore:originalWounds,woundsAfter:[...body.wounds],
  noAnchorFoldRouteOrVaultAccess:true};
 const row={source,seal:hash(source)};
 r.attempts.push(row);r.lastPracticeDay=ctx.workDay;
 if(success)r.successfulReading={day:ctx.workDay,worldMinute:s.world.minutes,
  siteId:Law.SITE_ID,location:Law.LOCATION,
  worldSeed:snapshot.worldSeed,readingSnapshotHash:sampleHash,
  sourceHash:row.seal,publicObservation:observation,success:true,
  noAnchorFoldOrTravelGranted:true};
 if(!verify(s,p))throw Error('Independent Rift exterior measurement failed full source replay');
 return {kind:'original-rift-exterior-sense',accepted,
  observedSuccess:success,privateToGM:true,
  originalReadingHash:success?row.seal:null,
  measuredPublicObservation:observation,
  sourceHash:row.seal,noAnchorFoldOrVaultPermission:true};
}
module.exports={ORIGIN,first,verify,ensureLedger,privateStatus,afterDaily};
