'use strict';
// #177: independent original Rift Anchor Step II after a LIVE, successful
// personal exterior Riftglass reading. Follows player Rift Anchor source:
// THREE physical spatial axes, integrated proof, actual evolving risk,
// 3 Stamina/120 minutes, original Core d20/DC, strain and real wound.
// A stable exterior reference NEVER grants Fold Step, a hidden route,
// entry to the protected vault, portal or universal spatial travel.
const Crypto=require('node:crypto'),Core=require('./core'),
 Combat=require('./combat'),Early=require('./independent-original-discipline-preparation'),
 Sense=require('./independent-original-rift-sense-observation'),
 SenseLaw=require('./rift-shared-original-exterior-sense'),
 Law=require('./rift-shared-original-anchor-law');
const ORIGIN='source-earned-individual-original-rift-anchor-two-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const blank=()=>({bearing:0,resonance:0,stability:0});
const PREFERENCE=Object.freeze({
 curious:'resonance',steady:'stability',independent:'bearing',
 reserved:'bearing'});
function focusFor(p,axes,integrated){
 const desired=PREFERENCE[p.personality];
 if(!desired)throw Error('Original independent Rift practitioner personality required');
 if(!integrated&&axes[desired]===0)return desired;
 if(!integrated)return 'integrated';
 return Law.AXES.find(k=>axes[k]<2)||'integrated';
}
function sourceReading(p){
 const r=p?.originalRiftMeasuredSense;
 const proof=r?.successfulReading;
 if(!proof?.success||proof.siteId!==SenseLaw.SITE_ID||
  proof.location!==SenseLaw.LOCATION||
  !/^[a-f0-9]{64}$/.test(proof.sourceHash||'')||
  !/^[a-f0-9]{64}$/.test(proof.readingSnapshotHash||''))return null;
 return proof;
}
function safeCheck(s,params){
 const before=s.log.slice();
 try{return Core.check(s,{...params,privateDisplay:true});}
 finally{s.log.splice(0,s.log.length,...before);}
}
function verify(s,p){
 const r=p?.originalRiftExteriorAnchor;
 if(r===undefined)return true;
 if(!Sense.verify(s,p)||!Early.verify(s,p)||!sourceReading(p)||
  !r||r.origin!==ORIGIN||
  r.originalReadingSourceHash!==sourceReading(p).sourceHash||
  r.originalReadingSnapshotHash!==sourceReading(p).readingSnapshotHash||
  !Array.isArray(r.attempts)||r.attempts.length>480||
  !r.attempts.length||!r.axes||
  !Law.AXES.every(k=>Number.isInteger(r.axes[k])&&r.axes[k]>=0&&r.axes[k]<=2)||
  !Number.isInteger(r.strain)||r.strain<0||r.strain>100)return false;
 const body=s.table?.combatants?.['npc_'+p.id],
  Offscreen=require('../world/independent-original-power-days'),
  worldSeed=s.table?.realm?.worldSeed;
 if(!body?.npcOrigin?.seal||!Number.isInteger(worldSeed))return false;
 let axes=blank(),strain=0,integrated=false,completed=false,
  formedIntegrity=null,lastDay=-1,lastMinute=0;
 for(const row of r.attempts){
  const q=row?.source;
  if(!q||row.seal!==hash(q)||completed||
   q.origin!==ORIGIN||q.actorId!==p.actorId||q.system!=='rift'||
   q.target!=='exterior-anchor-marking'||
   q.individualOriginHash!==p.originHash||
   q.originalFoundationSeal!==p.mechanicalFoundation.seal||
   q.originalCombatEntrySeal!==body.npcOrigin.seal||
   q.originalReadingSourceHash!==r.originalReadingSourceHash||
   q.originalReadingSnapshotHash!==r.originalReadingSnapshotHash||
   q.originalSiteId!==SenseLaw.SITE_ID||
   q.originalAnchorId!==Law.SITE||
   q.actualSite!==SenseLaw.LOCATION||
   q.noFoldOrVaultRouteByAnchorAlone!==true||
   !Number.isInteger(q.day)||q.day<=lastDay||
   q.day<=sourceReading(p).day||
   q.startMinute!==q.day*1440+600||
   q.startMinute<lastMinute||
   q.startMinute+q.actualMinutes>s.world.minutes||
   q.sampledMinute!==(q.day+1)*1440||
   q.sampledMinute>s.world.minutes||
   !Offscreen.verifyEvidence(s,p,q)||
   q.choiceChance!==Early.chance({
    personality:q.personalityAtDecision,fatigue:q.fatigueAtDecision})||
   !Number.isInteger(q.rngBefore)||q.rngBefore<1||
   q.strainBefore!==strain||
   JSON.stringify(q.axesBefore)!==JSON.stringify(axes)||
   q.integratedBefore!==integrated||
   !Number.isInteger(q.staminaBefore)||q.staminaBefore<Law.staminaCost(120)||
   !Number.isInteger(q.maxStaminaAtAttempt)||
   q.staminaBefore>q.maxStaminaAtAttempt||
   JSON.stringify(q.woundsBefore)!=='[0,0,0]'||
   !Array.isArray(q.woundsAfter)||q.woundsAfter.length!==3)
   return false;
  const roller={rngState:q.rngBefore};
  if(q.choiceD100!==Core.die(roller,100)||
   q.accepted!==(q.choiceD100<=q.choiceChance)||
   q.focus!==(q.accepted?focusFor(p,axes,integrated):null))
   return false;
  let severe=false;
  if(!q.accepted){
   if(q.actualMinutes!==5||q.snapshot!==null||q.sampleHash!==null||
    q.check!==null||q.progressEarned!==0||q.staminaSpent!==0||
    q.staminaAfter!==q.staminaBefore||q.originalSpatialBacklash!==false)
    return false;
  }else{
   const v=q.snapshot;
   try{
    if(v.worldSeed!==worldSeed||v.day!==q.day+1||
     q.sampleHash!==SenseLaw.digest(v))return false;
    SenseLaw.risk(v);
   }catch{return false;}
   const dc=Law.dc(v),
    modifier=Math.floor((p.mechanicalFoundation.baselineAttributes.int-10)/2)-
     Math.floor(strain/12),
    roll=Core.die(roller,20),margin=roll+modifier+
     Core.naturalAdjustment(roll)-dc,
    degree=Core.degree(margin),acceptedCheck=margin>=0,
    grown=Law.grow(axes,integrated,q.focus,degree);
   severe=degree==='severe failure';
   if(q.actualMinutes!==120||
    q.staminaSpent!==Law.staminaCost(120)||
    q.staminaAfter!==q.staminaBefore-Law.staminaCost(120)||
    q.check?.roll!==roll||q.check?.modifier!==modifier||
    q.check?.dc!==dc||q.check?.degree!==degree||
    q.check?.margin!==margin||q.check?.success!==acceptedCheck||
    q.progressEarned!==grown.earned||
    q.originalSpatialBacklash!==severe)return false;
   strain=Law.strainAfter(strain,degree,acceptedCheck);
   axes=grown.axes;integrated=grown.integrated;
   if(Law.formed(axes,integrated)){
    completed=true;formedIntegrity=Law.integrity(margin,strain);
   }
  }
  if(JSON.stringify(q.woundsAfter)!==JSON.stringify(severe?[1,0,0]:[0,0,0])||
   q.strainAfter!==strain||
   JSON.stringify(q.axesAfter)!==JSON.stringify(axes)||
   q.integratedAfter!==integrated||
   q.completedAfter!==completed||
   q.anchorIntegrityAfter!==formedIntegrity||
   q.rngAfter!==roller.rngState)return false;
  lastDay=q.day;lastMinute=q.startMinute+q.actualMinutes;
 }
 const expectedAnchor=completed?{
  id:Law.SITE,siteId:SenseLaw.SITE_ID,
  name:'Exterior Riftglass wardline',location:SenseLaw.LOCATION,
  source:ORIGIN,originalReadingHash:r.originalReadingSourceHash,
  originalReadingSnapshotHash:r.originalReadingSnapshotHash,
  completedDay:lastDay,integrity:formedIntegrity,
  axes:{...axes},noFoldStepVaultEntryOrPortalGranted:true}:null;
 return r.lastPracticeDay===lastDay&&
  JSON.stringify(r.axes)===JSON.stringify(axes)&&
  r.integrated===integrated&&r.strain===strain&&
  r.completed===completed&&r.anchorIntegrity===formedIntegrity&&
  JSON.stringify(r.anchor)===JSON.stringify(expectedAnchor);
}
function ensureLedger(s,p){
 const reading=sourceReading(p);
 if(!reading||!Sense.verify(s,p)||!Early.verify(s,p))
  throw Error('Only a personally source-measured successful Riftglass exterior reading may start an original spatial anchor');
 if(p.originalRiftExteriorAnchor!==undefined){
  if(!verify(s,p))throw Error('Original independent exterior Rift Anchor source failed replay');
  return p.originalRiftExteriorAnchor;
 }
 const r={origin:ORIGIN,originalReadingSourceHash:reading.sourceHash,
  originalReadingSnapshotHash:reading.readingSnapshotHash,
  attempts:[],axes:blank(),integrated:false,strain:0,
  lastPracticeDay:-1,completed:false,anchorIntegrity:null,anchor:null};
 p.originalRiftExteriorAnchor=r;
 return r;
}
function privateStatus(s,p){
 if(!Sense.verify(s,p)||!Early.verify(s,p)||!verify(s,p))
  throw Error('Independent original Rift Anchor proof was altered');
 const r=p.originalRiftExteriorAnchor;
 return {privateToGM:true,sourceOwner:'rules/rift-anchors.js',
  verifiedRiftStep:r?.completed?2:1,
  provenRiftglassAnchor:r?.anchor?structuredClone(r.anchor):null,
  measuredRiftAxisProgress:r?.axes?{...r.axes}:null,
  measuredSpatialStrain:r?.strain??null,
  noFoldOrVaultAccess:true};
}
function afterDaily(s,ctx){
 const p=ctx.actor,body=ctx.body,
  reading=sourceReading(p);
 if(!reading||!Sense.verify(s,p)||!Early.verify(s,p)||!verify(s,p)||
  ctx.site!==SenseLaw.LOCATION||ctx.actor.regionId!=='riftglass'||
  ctx.workDay<=reading.day||p.originalRiftExteriorAnchor?.completed||
  body.status!=='ok'||body.wounds.some(x=>x!==0)||
  body.stamina<Law.staminaCost(120))return null;
 const r=ensureLedger(s,p);
 if(r.attempts.length>=480||r.lastPracticeDay>=ctx.workDay||
  Object.values(p.originalEarlyDisciplinePreparation||{}).
   some(x=>x.lastAttemptDay>=ctx.workDay)||
  p.meridianTraining?.lastAttemptDay>=ctx.workDay)return null;
 const chance=Early.chance(p),rngBefore=p.rngState,
  choiceD100=Core.die(p,100),accepted=choiceD100<=chance,
  focus=focusFor(p,r.axes,r.integrated),
  staminaBefore=body.stamina,woundsBefore=[...body.wounds],
  originalOpportunity=require('../world/independent-original-power-days')
   .opportunityEvidence(ctx,'rift'),
  strainBefore=r.strain,axesBefore={...r.axes},
  integratedBefore=r.integrated;
 let snapshot=null,sampleHash=null,check=null,
  progressEarned=0,backlash=false;
 if(accepted){
  const Realm=require('../world/simulation');
  snapshot=SenseLaw.snapshot(Realm.peek(s),ctx.workDay+1);
  sampleHash=SenseLaw.digest(snapshot);
  const modifier=Math.floor((p.mechanicalFoundation.baselineAttributes.int-10)/2)-
   Math.floor(r.strain/12),
   actual=safeCheck(s,{modifier,dc:Law.dc(snapshot),
    label:'Private original independent Rift Anchor exterior geometry',
    independentRngOwner:p});
  check={roll:actual.roll,modifier:actual.modifier,
   dc:actual.dc,degree:actual.degree,margin:actual.margin,
   success:actual.success};
  const grown=Law.grow(r.axes,r.integrated,focus,actual.degree);
  progressEarned=grown.earned;
  r.axes=grown.axes;r.integrated=grown.integrated;
  r.strain=Law.strainAfter(r.strain,actual.degree,actual.success);
  body.stamina-=Law.staminaCost(120);
  backlash=actual.degree==='severe failure';
  if(backlash)Combat.harm(s,body,2);
  if(Law.formed(r.axes,r.integrated)){
   r.completed=true;
   r.anchorIntegrity=Law.integrity(actual.margin,r.strain);
  }
 }
 const source={origin:ORIGIN,actorId:p.actorId,system:'rift',
  target:'exterior-anchor-marking',
  individualOriginHash:p.originHash,
  originalFoundationSeal:p.mechanicalFoundation.seal,
  originalCombatEntrySeal:body.npcOrigin.seal,
  originalReadingSourceHash:r.originalReadingSourceHash,
  originalReadingSnapshotHash:r.originalReadingSnapshotHash,
  originalShiftHash:ctx.originalShiftHash,
  originalSceneHash:hash(originalOpportunity),
  offscreenOpportunity:originalOpportunity,
  originalSiteId:SenseLaw.SITE_ID,originalAnchorId:Law.SITE,
  actualSite:SenseLaw.LOCATION,
  day:ctx.workDay,startMinute:ctx.workDay*1440+600,
  sampledMinute:s.world.minutes,actualMinutes:accepted?120:5,
  rngBefore,rngAfter:p.rngState,personalityAtDecision:p.personality,
  fatigueAtDecision:p.fatigue,choiceChance:chance,choiceD100,accepted,
  focus:accepted?focus:null,snapshot,sampleHash,check,
  progressEarned,strainBefore,strainAfter:r.strain,
  axesBefore,axesAfter:{...r.axes},
  integratedBefore,integratedAfter:r.integrated,
  staminaBefore,maxStaminaAtAttempt:body.maxStamina,
  staminaSpent:accepted?Law.staminaCost(120):0,
  staminaAfter:body.stamina,woundsBefore,woundsAfter:[...body.wounds],
  originalSpatialBacklash:backlash,completedAfter:r.completed,
  anchorIntegrityAfter:r.anchorIntegrity,
  noFoldOrVaultRouteByAnchorAlone:true};
 r.attempts.push({source,seal:hash(source)});
 r.lastPracticeDay=ctx.workDay;
 if(r.completed)r.anchor={
  id:Law.SITE,siteId:SenseLaw.SITE_ID,
  name:'Exterior Riftglass wardline',location:SenseLaw.LOCATION,
  source:ORIGIN,originalReadingHash:r.originalReadingSourceHash,
  originalReadingSnapshotHash:r.originalReadingSnapshotHash,
  completedDay:ctx.workDay,integrity:r.anchorIntegrity,
  axes:{...r.axes},noFoldStepVaultEntryOrPortalGranted:true};
 if(!verify(s,p))
  throw Error('Independent original Rift Anchor Step II replay rejected result');
 return {kind:'original-rift-anchor-marking',accepted,
  originalAxisProgress:progressEarned,formed:r.completed,
  verifiedExteriorReferenceId:r.completed?Law.SITE:null,
  originalStaminaSpent:accepted?Law.staminaCost(120):0,
  originalSpatialBacklash:backlash,privateToGM:true,
  sourceHash:hash(source),noFoldTeleportOrVaultAccess:true};
}
module.exports={ORIGIN,verify,ensureLedger,focusFor,privateStatus,afterDaily};
