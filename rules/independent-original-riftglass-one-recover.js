'use strict';
// #177: A genuinely independently CHOSEN rest day at the dangerous
// Riftglass exterior may use the EXISTING Combat.recover action once
// within the ORIGINAL current completed-night budget. Any later renewal
// requires a separately source-verified Combat.completedNight that occurred
// AFTER the previous Recover; no new daily charge is manufactured.
// Recover is NOT Combat.completedNight: it grants no safe shelter, eight-
// hour sleep, Qi/Mana/Soul recharge, wound healing, Fold or free spatial
// progress. A prior source-measured Rift exterior effort, physical person,
// independently chosen REST day and real place remain mandatory.
const Crypto=require('node:crypto'),Combat=require('./combat'),
 Early=require('./independent-original-discipline-preparation'),
 Sense=require('./independent-original-rift-sense-observation'),
 SenseLaw=require('./rift-shared-original-exterior-sense');
const ORIGIN='source-chosen-original-riftglass-single-combat-recover-v1',
 RENEW='source-chosen-original-riftglass-combat-recover-after-earned-night-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function previousSense(p,day){
 const list=p?.originalRiftMeasuredSense?.attempts||[];
 return list.filter(row=>row?.source?.accepted===true&&
  row.source.day<day).at(-1)||null;
}
function verify(s,p){
 const r=p?.originalRiftglassRecover;
 if(r===undefined)return true;
 const q=r?.source,body=s.table?.combatants?.['npc_'+p.id],
  w=s.table?.realm,life=w?.independentPersonLives?.people?.[p.id],
  People=require('../world/emergent-people'),
  Lives=require('../world/independent-person-lives');
 if(!r||r.origin!==ORIGIN||r.seal!==hash(q)||
  !q||q.origin!==ORIGIN||
  !Early.verify(s,p)||!Sense.verify(s,p)||
  !life||!Lives.verifyEntry(w,life)||
  !body?.npcOrigin?.seal||
  q.actorId!==p.actorId||q.individualOriginHash!==p.originHash||
  q.originalFoundationSeal!==p.mechanicalFoundation?.seal||
  q.originalCombatEntrySeal!==body.npcOrigin.seal||
  q.originalRiftSenseSourceHash!==previousSense(p,q.day)?.seal||
  q.site!==SenseLaw.LOCATION||q.regionId!=='riftglass'||
  !Number.isInteger(q.day)||q.day<1||
  q.startMinute!==q.day*1440+960||
  q.checkedAtMinute!==(q.day+1)*1440||
  q.checkedAtMinute>s.world.minutes||
  q.actualMinutes!==5||
  !q.originalShiftProof||
  q.originalShiftProof.hash!==q.originalShiftHash||
  q.originalShiftProof.actorId!==p.actorId||
  q.originalShiftProof.originHash!==p.originHash||
  q.originalShiftProof.location!==SenseLaw.LOCATION||
  q.originalShiftProof.fromDay>q.day||
  q.originalShiftProof.throughDay<q.day||
  hash(Object.fromEntries(Object.entries(q.originalShiftProof).
   filter(([k])=>k!=='hash')))!==q.originalShiftHash||
  !q.independentRestDay||q.independentRestDay.day!==q.day+1||
  q.independentRestDay.origin!==Lives.ORIGIN||
  q.independentRestDay.actorId!==p.actorId||
  q.independentRestDay.identityHash!==p.originHash||
  q.independentRestDay.action!=='rest'||
  q.independentRestDayHash!==hash(q.independentRestDay)||
  q.staminaBefore>=q.maximumStamina||
  !Number.isInteger(q.staminaBefore)||q.staminaBefore<0||
  !Number.isInteger(q.maximumStamina)||q.maximumStamina<1||
  !Number.isInteger(q.vigorAtAttempt)||q.vigorAtAttempt!==body.vigor||
  q.recoverUsesBefore!==0||q.recoverUsesAfter!==1||
  q.staminaAfter!==Math.min(q.maximumStamina,
   q.staminaBefore+Math.max(0,2+q.vigorAtAttempt))||
  q.actualOriginalRecoverGain!==q.staminaAfter-q.staminaBefore||
  q.originalStatusAtDecision!=='ok'||
  !Array.isArray(q.woundsBefore)||q.woundsBefore.length!==3||
  JSON.stringify(q.woundsAfter)!==JSON.stringify(q.woundsBefore)||
  q.noUnverifiedShelterNightOrWoundHealing!==true||
  q.noAdditionalWorldTimeOrAnotherAction!==true||
  q.noQiManaSoulOrFreeSpatialPower!==true)return false;
 const actual=life.history.find(row=>row.source.day===q.day+1);
 if(actual&&(
  actual.seal!==q.independentRestDayHash||
  JSON.stringify(actual.source)!==JSON.stringify(q.independentRestDay)))
  return false;
 if(!actual&&life.history.length&&
  q.day+1>=life.history[0].source.day)return false;
 // A new original Recover charge can be obtained only from an ACTUAL
 // source-replayed Combat.completedNight after the PREVIOUS Recover.
 // Use a receipt for historical replays even if the original rolling
 // 480-entry night ledger later archives the night away.
 const renewals=r.renewals||[];
 if(!Array.isArray(renewals)||renewals.length>90)return false;
 const Offscreen=require('../world/independent-original-power-days');
 let previousReceiptHash=r.seal,previousMinute=q.checkedAtMinute,priorDay=q.day;
 const provenNights=new Set();
 for(const entry of renewals){
  const x=entry?.source,shift=x?.originalShiftProof,
   daily=x?.independentRestDay,night=x?.originalCombatNight;
  if(!x||entry.seal!==hash(x)||x.origin!==RENEW||
   x.actorId!==p.actorId||x.individualOriginHash!==p.originHash||
   x.originalFoundationSeal!==p.mechanicalFoundation.seal||
   x.originalCombatEntrySeal!==body.npcOrigin.seal||
   x.originalRiftSenseSourceHash!==q.originalRiftSenseSourceHash||
   x.previousRecoverSourceHash!==previousReceiptHash||
   x.site!==SenseLaw.LOCATION||x.regionId!=='riftglass'||
   !Number.isInteger(x.day)||x.day<=priorDay||
   x.startMinute!==x.day*1440+960||
   x.checkedAtMinute!==(x.day+1)*1440||
   x.checkedAtMinute>s.world.minutes||
   x.actualMinutes!==5||
   !shift||shift.hash!==x.originalShiftHash||
   shift.actorId!==p.actorId||shift.originHash!==p.originHash||
   shift.location!==SenseLaw.LOCATION||
   shift.fromDay>x.day||shift.throughDay<x.day||
   hash(Object.fromEntries(Object.entries(shift).
    filter(([k])=>k!=='hash')))!==shift.hash||
   !daily||daily.day!==x.day+1||daily.action!=='rest'||
   daily.origin!==Lives.ORIGIN||
   daily.actorId!==p.actorId||daily.identityHash!==p.originHash||
   hash(daily)!==x.independentRestDayHash||
   !night||night.seal!==x.originalCombatNightSourceHash||
   !night.source||night.source.site!==SenseLaw.LOCATION||
   provenNights.has(night.seal)||
   !Offscreen.verifyNights(s,p,[night])||
   night.source.endMinute<=previousMinute||
   night.source.endMinute>x.startMinute||
   !Number.isInteger(x.staminaBefore)||x.staminaBefore<0||
   !Number.isInteger(x.maximumStamina)||x.maximumStamina<1||
   x.staminaBefore>=x.maximumStamina||
   !Number.isInteger(x.vigorAtAttempt)||
   x.vigorAtAttempt!==body.vigor||
   x.recoverUsesBefore!==0||x.recoverUsesAfter!==1||
   x.staminaAfter!==Math.min(x.maximumStamina,
    x.staminaBefore+Math.max(0,2+x.vigorAtAttempt))||
   x.actualOriginalRecoverGain!==x.staminaAfter-x.staminaBefore||
   x.originalStatusAtDecision!=='ok'||
   !Array.isArray(x.woundsBefore)||x.woundsBefore.length!==3||
   JSON.stringify(x.woundsAfter)!==JSON.stringify(x.woundsBefore)||
   x.noUnverifiedShelterNightOrWoundHealing!==true||
   x.noAdditionalWorldTimeOrAnotherAction!==true||
   x.noQiManaSoulOrFreeSpatialPower!==true||
   x.originalRecoverResetOnlyByActualNight!==true)
    return false;
  const observed=life.history.find(e=>e.source.day===x.day+1);
  if(observed&&(observed.seal!==x.independentRestDayHash||
   JSON.stringify(observed.source)!==JSON.stringify(daily)))return false;
  if(!observed&&life.history.length&&
   x.day+1>=life.history[0].source.day)return false;
  provenNights.add(night.seal);
  previousReceiptHash=entry.seal;previousMinute=x.checkedAtMinute;
  priorDay=x.day;
 }
 return true;
}
function afterRestDay(s,ctx){
 const p=ctx.actor,body=ctx.body,
  source=previousSense(p,ctx.workDay),existing=p.originalRiftglassRecover;
 if(ctx.site!==SenseLaw.LOCATION||p.regionId!=='riftglass'||
  ctx.dailyActivity?.action!=='rest'||!source||
  !Early.verify(s,p)||!Sense.verify(s,p)||!verify(s,p)||
  body.status!=='ok'||body.stamina>=body.maxStamina||
  (body.recoverUses||0)!==0)return null;
 // Only a full, individually surveyed and VOLUNTARILY accepted original
 // Combat night that happened AFTER the last Recover can reset that
 // person's once-per-night Recover budget. No overnight source, no renewal.
 const last=existing?.renewals?.at(-1)||existing,
  lastMinute=last?.source?.checkedAtMinute??-1,
  originalNight=existing?
   (p.originalOffscreenCombatNights||[]).filter(row=>
    row.source?.site===SenseLaw.LOCATION&&
    row.source.endMinute>lastMinute&&
    row.source.endMinute<=ctx.workDay*1440+960).at(-1):null;
 if(existing&&(!originalNight||
  !require('../world/independent-original-power-days').
   verifyNights(s,p,[originalNight])||
  existing.renewals?.length>=90))return null;
 const before=body.stamina,maximum=body.maxStamina,
  vigor=body.vigor,wounds=[...body.wounds],
  restSource=structuredClone(ctx.dailyActivity);
 if(hash(restSource)!==ctx.dailySourceHash||
  ctx.originalShiftHash!==ctx.originalShift.hash)
  throw Error('Original independent Rift field recovery needs the actual chosen rest source');
 // Exactly the ORIGINAL one-use Combat action, NOT a second health pool.
 const action=Combat.recover(s,{id:'npc_'+p.id});
 const q={origin:existing?RENEW:ORIGIN,actorId:p.actorId,
  individualOriginHash:p.originHash,
  originalFoundationSeal:p.mechanicalFoundation.seal,
  originalCombatEntrySeal:body.npcOrigin.seal,
  originalRiftSenseSourceHash:source.seal,
  ...(existing?{previousRecoverSourceHash:last.seal,
   originalCombatNight:structuredClone(originalNight),
   originalCombatNightSourceHash:originalNight.seal}:{}),
  site:ctx.site,regionId:p.regionId,
  day:ctx.workDay,startMinute:ctx.workDay*1440+960,
  checkedAtMinute:s.world.minutes,actualMinutes:5,
  originalShiftHash:ctx.originalShiftHash,
  originalShiftProof:structuredClone(ctx.originalShift),
  independentRestDay:restSource,independentRestDayHash:ctx.dailySourceHash,
  staminaBefore:before,maximumStamina:maximum,
  staminaAfter:body.stamina,vigorAtAttempt:vigor,
  recoverUsesBefore:0,recoverUsesAfter:body.recoverUses,
  actualOriginalRecoverGain:action.gained,
  originalStatusAtDecision:'ok',
  woundsBefore:wounds,woundsAfter:[...body.wounds],
  noUnverifiedShelterNightOrWoundHealing:true,
  noAdditionalWorldTimeOrAnotherAction:true,
  noQiManaSoulOrFreeSpatialPower:true,
  ...(existing?{originalRecoverResetOnlyByActualNight:true}:{})};
 const row={source:q,seal:hash(q)};
 if(existing){
  existing.renewals||=[];
  existing.renewals.push(row);
 }else p.originalRiftglassRecover={origin:ORIGIN,...row};
 if(!verify(s,p))
  throw Error('Original Recover action needs real previously completed overnight reset proof');
 return {kind:existing?'original-riftglass-recover-after-earned-night':
  'original-riftglass-one-legal-combat-recover',
  actuallyRecoveredStamina:action.gained,originalRecoverUses:action.uses,
  sourceHash:row.seal,
  originalSourceNightReset:originalNight?.seal||null,
  noUnverifiedNightOrExtraRecover:true,
  noSpatialStageOrTechnique:true,privateToGM:true};
}
module.exports={ORIGIN,RENEW,verify,afterRestDay};
