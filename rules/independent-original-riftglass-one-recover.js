'use strict';
// #177: A genuinely independently CHOSEN rest day at the dangerous
// Riftglass exterior may use the EXISTING Combat.recover action ONCE.
// It is not Combat.completedNight; no safe ruins shelter, eight-hour sleep,
// second Recover use, Qi/Mana/Soul recharge, wound healing, Fold or free
// spatial progress is manufactured. A real preceding source-measured
// Rift exterior effort, physical person, day and place are mandatory.
const Crypto=require('node:crypto'),Combat=require('./combat'),
 Early=require('./independent-original-discipline-preparation'),
 Sense=require('./independent-original-rift-sense-observation'),
 SenseLaw=require('./rift-shared-original-exterior-sense');
const ORIGIN='source-chosen-original-riftglass-single-combat-recover-v1';
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
  q.originalShiftHash!==People.shift(p,q.day,w)?.hash||
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
 return true;
}
function afterRestDay(s,ctx){
 const p=ctx.actor,body=ctx.body,
  source=previousSense(p,ctx.workDay);
 if(ctx.site!==SenseLaw.LOCATION||p.regionId!=='riftglass'||
  ctx.dailyActivity?.action!=='rest'||!source||
  !Early.verify(s,p)||!Sense.verify(s,p)||!verify(s,p)||
  p.originalRiftglassRecover!==undefined||
  body.status!=='ok'||body.stamina>=body.maxStamina||
  (body.recoverUses||0)!==0)return null;
 const before=body.stamina,maximum=body.maxStamina,
  vigor=body.vigor,wounds=[...body.wounds],
  restSource=structuredClone(ctx.dailyActivity);
 if(hash(restSource)!==ctx.dailySourceHash||
  ctx.originalShiftHash!==ctx.originalShift.hash)
  throw Error('Original independent Rift field recovery needs the actual chosen rest source');
 // Exactly the ORIGINAL one-use Combat action, NOT a second health pool.
 const action=Combat.recover(s,{id:'npc_'+p.id});
 const q={origin:ORIGIN,actorId:p.actorId,
  individualOriginHash:p.originHash,
  originalFoundationSeal:p.mechanicalFoundation.seal,
  originalCombatEntrySeal:body.npcOrigin.seal,
  originalRiftSenseSourceHash:source.seal,
  site:ctx.site,regionId:p.regionId,
  day:ctx.workDay,startMinute:ctx.workDay*1440+960,
  checkedAtMinute:s.world.minutes,actualMinutes:5,
  originalShiftHash:ctx.originalShiftHash,
  independentRestDay:restSource,independentRestDayHash:ctx.dailySourceHash,
  staminaBefore:before,maximumStamina:maximum,
  staminaAfter:body.stamina,vigorAtAttempt:vigor,
  recoverUsesBefore:0,recoverUsesAfter:body.recoverUses,
  actualOriginalRecoverGain:action.gained,
  originalStatusAtDecision:'ok',
  woundsBefore:wounds,woundsAfter:[...body.wounds],
  noUnverifiedShelterNightOrWoundHealing:true,
  noAdditionalWorldTimeOrAnotherAction:true,
  noQiManaSoulOrFreeSpatialPower:true};
 p.originalRiftglassRecover={origin:ORIGIN,source:q,seal:hash(q)};
 if(!verify(s,p))
  throw Error('Original single Recover action after independent Riftglass rest failed replay');
 return {kind:'original-riftglass-one-legal-combat-recover',
  actuallyRecoveredStamina:action.gained,originalRecoverUses:action.uses,
  sourceHash:p.originalRiftglassRecover.seal,
  noNightSleepOrExtraRecover:true,noSpatialStageOrTechnique:true,
  privateToGM:true};
}
module.exports={ORIGIN,verify,afterRestDay};
