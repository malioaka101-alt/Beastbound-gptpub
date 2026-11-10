'use strict';
// Master §25: the FIRST short controlled Fold Step. Original Anchor II is
// a spatial reference, not automatic entry, long-range transit or a portal.
// A separate witnessed local line-of-effect and measured endpoint are needed.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),W=require('./world'),U=require('./unified'),
 Combat=require('./combat'),Anchor=require('./rift-anchors'),
 Cosmos=require('../world/cosmology-ledger'),
 Realm=require('../world/simulation');
const SOURCE='earned-rift-fold-step-local-geometry-v1',
 WITNESS='gm-witnessed-present-local-fold-geometry-v1';
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const integer=(x,min=0,max=1000000)=>Number.isInteger(x)&&x>=min&&x<=max;
const phrase=(x,min=25)=>typeof x==='string'&&x.trim().length>=min&&x.trim().length<=900;
const only=(p,keys)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(k=>keys.includes(k));
function anchor(s){
 if(s.player?.rift?.step<2)throw Error('A personally earned original Step II Anchor Marking is required');
 return Anchor.earned(s);
}
function worldRisk(s){
 const w=Realm.peek(s),site=w?.mythic?.riftglass_vault,
  eco=w?.ecosystems?.riftglass;
 if(!site||!eco||!integer(site.charge,0,100)||
  !integer(site.seal,0,100)||!integer(eco.pressure,0,100)||
  !['quiet','fading','surging','unstable'].includes(site.phase))
  throw Error('The original measured Riftglass environment is unavailable');
 const severe=site.phase==='unstable'||site.seal<35;
 return {dcRisk:severe?6:
  site.phase==='surging'||site.charge>72||eco.pressure>73?3:0,
  identity:digest({phase:site.phase,charge:site.charge,seal:site.seal,
   pressure:eco.pressure,worldSeed:w.worldSeed,
   day:Math.floor(s.world.minutes/1440)})};
}
function evidence(s,index){
 if(!integer(index,0,s.log?.length-1))
  throw Error('An actual newly witnessed local Fold Step geometry observation is required');
 const e=s.log[index],d=e?.details;
 if(e?.type!=='story'||d?.origin!==WITNESS||
  d.location!==s.world.location||
  d.anchorId!==Anchor.SITE||
  !phrase(e.text,18)||
  !phrase(d.fromObservedPosition)||
  !phrase(d.toObservedPosition)||
  !phrase(d.lineOfEffectMeasurement)||
  !phrase(d.independentObstructionTest)||
  !phrase(d.energyAndPhysicalLimit)||
  !phrase(d.measuredPressureCountertest)||
  !integer(d.measuredDistanceMetres,1,12)||
  !integer(d.safeRangeMetres,d.measuredDistanceMetres,12)||
  d.lineOfEffectClear!==true||
  d.crossesSealedBoundary!==false||
  d.crossesWorldLocation!==false||
  (d.segmentId!==undefined&&
   (typeof d.segmentId!=='string'||!/^[a-z][a-z0-9_-]{3,65}$/.test(d.segmentId))))
  throw Error('A physically measured short local displacement, unobstructed path and independent spatial limit are required');
 return structuredClone(e);
}
function verifyCheck(a){
 const c=a.check,event=a.rollEvent;
 return !!(event?.type==='roll'&&a.rollEventHash===digest(event)&&
  digest(event.details)===digest(c)&&
  integer(a.roll,1,20)&&a.roll===c?.roll&&
  c.dc===a.dc&&c.modifier===a.modifier&&
  c.naturalBonus===C.naturalAdjustment(a.roll)&&
  c.total===a.roll+c.modifier+c.naturalBonus&&
  c.margin===c.total-c.dc&&
  c.success===(c.margin>=0)&&
  c.degree===C.degree(c.margin,true)&&
  c.progress===C.progress(c.degree));
}
// Previously earned spatial methods stay usable at later real stages.
// The witness minute must follow the ACTUAL source-proven breakthrough;
// a forged step number, or a future-earned skill used in the past, fails.
function higherStageEarnedAt(s,stage,minute){
 const p=s.player?.rift;
 if(!p||!integer(minute,0,s.world.minutes))return false;
 if(stage===4)return require('./rift-boundary-weaving').earnedAt(s,minute);
 if(stage>=5&&(!p.pocketProof||
  !integer(p.pocketProof.earnedMinute,0,minute)||
  !require('./rift-pocket-architecture').verify(s)))return false;
 if(stage>=6&&(!p.adaptationProof||
  !integer(p.adaptationProof.earnedMinute,0,minute)||
  !require('./rift-adaptation').verify(s)))return false;
 if(stage>=7&&(!p.realmWalkingProof||
  !integer(p.realmWalkingProof.earnedMinute,0,minute)||
  !require('./rift-realm-walking').verify(s)))return false;
 if(stage>=8&&(!p.domainProof||
  !integer(p.domainProof.earnedMinute,0,minute)||
  !require('./rift-boundary-domain').verify(s)))return false;
 return stage>=4&&stage<=8;
}
function verify(s){
 const r=s.table?.riftFoldSteps;
 if(!r)return !s.player?.rift?.foldProof;
 if(r.source!==SOURCE||!Array.isArray(r.attempts)||
  !r.attempts.length||!r.anchorProofHash||
  !Array.isArray(r.formedPositions)||
  r.anchorProofHash!==digest(s.player?.rift?.anchorProof))
  return false;
 let step=2,prior=null,strain=0;
 const witnesses=new Set();
 for(const receipt of r.attempts){
  const a=receipt?.source,e=a?.witness,d=e?.details;
  if(receipt?.origin!==SOURCE||receipt.seal!==digest(a)||
   a.origin!==SOURCE||a.kind!=='fold'||
   a.location!=='ruins'||a.anchorId!==Anchor.SITE||
   !integer(a.minute,0,s.world.minutes)||
   !integer(a.minutes,1,12)||a.minutes!==5||
   !integer(a.staminaSpent,2,2)||
   !integer(a.distance,1,12)||
   !integer(a.range,a.distance,12)||
   !integer(a.strainBefore,0,100)||
   a.strainBefore!==strain||
   !integer(a.strainAdded,0,6)||
   a.strainAdded!==(a.check?.degree==='severe failure'?6:0)||
   a.strainAfter!==Math.min(100,strain+a.strainAdded)||
   a.wounded!==(a.strainAdded>0)||
   !integer(a.dc,15,35)||
   a.dc!==16+Math.ceil(a.distance/4)+a.riskAdjustment+
    Math.floor(a.strainBefore/12)-
     Math.max(a.weaveMitigation||0,a.domainMitigation||0)||
   ![0,1].includes(a.weaveMitigation||0)||
   (a.weaveMitigation===1&&(
    !a.segmentId||!a.weaveReceiptSeal||
    !require('./rift-boundary-weaving').supportProof(
     s,a.weaveReceiptSeal,a.segmentId,a.minute)))||
   (a.weaveMitigation===0&&a.weaveReceiptSeal!==null)||
   ![0,2].includes(a.domainMitigation||0)||
   (a.domainMitigation===2&&(
    !a.segmentId||!a.domainReceiptSeal||
    !require('./rift-boundary-domain').supportProof(
     s,a.domainReceiptSeal,a.segmentId,a.minute)))||
   (a.domainMitigation===0&&a.domainReceiptSeal!==null)||
   ![0,3,6].includes(a.riskAdjustment)||
   !integer(a.sourceInt,1,30)||
   !integer(a.sourceArcana,0,5)||
   a.modifier!==Math.floor((a.sourceInt-10)/2)+2*a.sourceArcana||
   !verifyCheck(a)||
   a.success!==a.check.success||
   (a.stepBefore!==step&&!(
    step>=3&&a.stepBefore>step&&
    higherStageEarnedAt(s,a.stepBefore,a.minute)))||
   a.stepAfter!==(a.success?Math.max(3,a.stepBefore):a.stepBefore)||
   !e||a.witnessHash!==digest(e)||e.type!=='story'||
   d?.origin!==WITNESS||d.location!==a.location||
   d.anchorId!==Anchor.SITE||
   !phrase(d.fromObservedPosition)||
   !phrase(d.toObservedPosition)||
   !phrase(d.lineOfEffectMeasurement)||
   !phrase(d.independentObstructionTest)||
   !phrase(d.energyAndPhysicalLimit)||
   !phrase(d.measuredPressureCountertest)||
   d.measuredDistanceMetres!==a.distance||
   d.safeRangeMetres!==a.range||
   (d.segmentId||null)!==(a.segmentId||null)||
   d.lineOfEffectClear!==true||
   d.crossesSealedBoundary!==false||
   d.crossesWorldLocation!==false||
   witnesses.has(a.witnessHash)||
   (prior!==null&&a.from!==prior)||
   a.from!==d.fromObservedPosition||
   a.to!==d.toObservedPosition||
   a.positionAfter!==(a.success?a.to:a.from))
   return false;
  witnesses.add(a.witnessHash);
  if(a.success){prior=a.to;step=Math.max(3,a.stepBefore);}
  else if(prior===null)prior=a.from;
  strain=a.strainAfter;
 }
 const formed=r.attempts.filter(x=>x.source.success)
  .map(x=>({location:x.source.location,description:x.source.to,
   completedMinute:x.source.minute+x.source.minutes,
   sourceSeal:x.seal}));
 if(digest(formed)!==digest(r.formedPositions)||
  r.currentPosition!==prior||
  r.strain!==strain||
  (step>=3)!==!!s.player.rift.foldProof||
  (step>=3&&(
   s.player.rift.step<3||
   s.player.rift.foldProof?.source!==SOURCE||
   s.player.rift.foldProof?.firstSuccessSeal!==r.attempts.find(x=>x.source.success)?.seal)))
  return false;
 return true;
}
function status(s){
 const r=s.table?.riftFoldSteps;
 if(r&&!verify(s))
  throw Error('Existing earned Fold Step original spatial measurements cannot be verified');
 let ready=false,reason=null;
 try{
  const a=anchor(s);
  if(s.world?.location!==a.location)
   throw Error('The original reference is not physically at this local scene');
  ready=!s.battle&&!s.encounter&&
   s.table?.combatants?.player?.status==='ok';
 }catch(e){reason=e.message;}
 return {step:s.player?.rift?.step||0,ready,
  locallyEarned:!!s.player?.rift?.foldProof,
  recordedAttempts:r?.attempts?.length||0,
  lastConfirmedLocalPosition:r?.currentPosition||null,
  strain:r?.strain||0,
  noVaultEntry:true,noRealmTransit:true,
  ...(reason?{reason}:{}),
  note:'A real local Fold Step requires a fresh GM-measured line-of-effect and source-specific original position; no claimed coordinates or safe portal'};
}
function fold(s,p={}){
 if(!only(p,['witnessIndex'])||!integer(p.witnessIndex,0,s.log?.length-1))
  throw Error('A real prior observed individual scene geometry witness index is required');
 const a=anchor(s);
 if(s.world?.location!==a.location||s.battle||s.encounter||
  s.table?.combatants?.player?.status!=='ok')
  throw Error('The already earned spatial anchor and real stable scene must support this attempt');
 const cosmology=Cosmos.peek(s)||Cosmos.seed();
 if(!cosmology.boundaries?.riftglass_wardline||
  !Cosmos.validate(cosmology,s))
  throw Error('The original real Riftglass realm boundary is not documented');
 if(!verify(s))throw Error('An earlier original Fold Step or local position has lost source integrity');
 const witness=evidence(s,p.witnessIndex),d=witness.details,
  wHash=digest(witness),risk=worldRisk(s);
 const r=s.table?.riftFoldSteps;
 if(r?.attempts.some(x=>x.source.witnessHash===wHash))
  throw Error('The same local spatial geometry cannot be rerolled for a better Fold Step result');
 if(r?.currentPosition&&r.currentPosition!==d.fromObservedPosition)
  throw Error('The observed local starting position disagrees with the original current physical scene');
 const strain=r?.strain||0;
 if(strain>=30)throw Error('Severe prior spatial disorientation needs physical treatment before further folding');
 const cost=2;
 if(!integer(s.player.stamina,cost,100000)||
  !integer(s.table.combatants.player.stamina,cost,100000))
  throw Error('An actual human Stamina pool must support the measured local displacement');
 const sourceInt=C.int(s.player.attributes.int,'earned Int',1,30),
  sourceArcana=C.int(s.player.skills.arcana.rank,'earned Arcana skill',0,5),
  modifier=Math.floor((sourceInt-10)/2)+2*sourceArcana;
 const segmentId=d.segmentId||null;
 const weave=segmentId?
  require('./rift-boundary-weaving').support(s,segmentId):
  {mitigation:0,sourceSeal:null};
 const domain=segmentId?
  require('./rift-boundary-domain').support(s,segmentId):
  {mitigation:0,sourceSeal:null};
 // Domain and local weave share the SAME physical frame; never add both.
 const dc=16+Math.ceil(d.measuredDistanceMetres/4)+risk.dcRisk+
   Math.floor(strain/12)-Math.max(weave.mitigation,domain.mitigation);
 const start=s.world.minutes;
 const check=C.check(s,{modifier,dc,
  label:'Original measured short Rift Fold Step'});
 const rollEvent=structuredClone(s.log.at(-1)),
  added=check.degree==='severe failure'?6:0;
 if(added){Combat.harm(s,Combat.get(s,'player'),2);U.sync(s,{source:'wounds'});}
 s.player.stamina-=cost;s.table.combatants.player.stamina=s.player.stamina;
 const prev=s.player.rift.step;
 if(check.success&&prev===2){
  s.player.rift.step=3;
 }
 const src={origin:SOURCE,kind:'fold',anchorId:Anchor.SITE,
  location:s.world.location,minute:start,minutes:5,
  distance:d.measuredDistanceMetres,range:d.safeRangeMetres,
  from:d.fromObservedPosition,to:d.toObservedPosition,
  positionAfter:check.success?d.toObservedPosition:d.fromObservedPosition,
  staminaSpent:cost,dc,riskAdjustment:risk.dcRisk,
  riskSourceHash:risk.identity,segmentId,
  weaveMitigation:weave.mitigation,weaveReceiptSeal:weave.sourceSeal,
  domainMitigation:domain.mitigation,domainReceiptSeal:domain.sourceSeal,
  sourceInt,sourceArcana,modifier,
  stepBefore:prev,stepAfter:s.player.rift.step,
  strainBefore:strain,strainAdded:added,
  strainAfter:Math.min(100,strain+added),wounded:added>0,
  witness,witnessHash:wHash,check:structuredClone(check),
  rollEvent,rollEventHash:digest(rollEvent),
  roll:check.roll,success:check.success};
 const receipt={origin:SOURCE,source:src,seal:digest(src)};
 const ledger=r||{source:SOURCE,anchorProofHash:digest(s.player.rift.anchorProof),
  attempts:[],formedPositions:[],currentPosition:null,strain:0};
 ledger.attempts.push(receipt);
 ledger.currentPosition=src.positionAfter;ledger.strain=src.strainAfter;
 if(check.success){
  ledger.formedPositions.push({location:s.world.location,
   description:src.to,completedMinute:start+5,sourceSeal:receipt.seal});
  if(prev===2)s.player.rift.foldProof={source:SOURCE,
   firstSuccessSeal:receipt.seal,earnedMinute:start+5,
   noLongRangeTransit:true};
 }
 s.table.riftFoldSteps=ledger;
 E.advance(s,5);W.finalizeTime(s,start);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('A source-backed genuine Fold Step has inconsistent original physical position or roll');
 return {attempted:true,success:check.success,check,meters:d.measuredDistanceMetres,
  from:src.from,observedPosition:src.positionAfter,
  step:s.player.rift.step,staminaSpent:cost,elapsedMinutes:5,
  backlash:added>0?'real spatial shear wound':null,
  localBoundarySupport:Math.max(weave.mitigation,domain.mitigation),
  actuallyEarnedDomainSupport:domain.mitigation,
  noVaultAccess:true,noRealmTransit:true,noInventedDestination:true};
}
module.exports={SOURCE,WITNESS,status,fold,verify};
