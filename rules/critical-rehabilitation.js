'use strict';
// First non-surgical Critical-injury convalescence after a *real* physician
// intervention. The original Critical damage, rescue, patient and clinician
// remain independently witnessed. Time, cost, bedrest and rehabilitation are
// real. No instant surgery, fabricated medicine or free revival.
const Crypto=require('node:crypto');
const CriticalReferral=require('./conscious-critical-referral');
const E=require('../engine.js'),C=require('./core'),W=require('./world'),
 Health=require('./unified'),Combat=require('./combat');
const DAY=1440,CLINIC='academy',DOCTOR='vale',CARE_DAYS=18,REHAB_DAYS=6,
 FOLLOWUP_DAYS=12,CARE_FEE_SCALES=6000,FOLLOWUP_MINUTES=15;
const digest=e=>Crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex');
const rescueSource='Named local physician personally responds to independently witnessed safe post-combat incapacity';
function noFields(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Critical care takes no caller-selected doctor, diagnosis, days, fee, dice, complications or healing results');
}
function established(s){
 const loc=E.LOCATIONS[CLINIC],doc=E.NPCS[DOCTOR],
   c=s.table?.combatants?.player;
 if(!loc?.facilities?.includes('clinic')||doc?.location!==CLINIC||
    doc.profession!=='Origin-pattern physician')
  throw Error('An existing on-site clinical physician and real Lumenfall clinic are required');
 if(s.world?.location!==CLINIC)
  throw Error('This protected medical course cannot move the patient or conjure an off-site clinic');
 if(s.encounter||s.battle)
  throw Error('Hospital recovery requires an independently safe scene');
 if(s.table?.healthModel!=='wounds-v1'||!c)
  throw Error('A single authoritative wound-model patient record is required');
 if(s.player.partnerIds?.length)
  throw Error('A genuine independent partner welfare/provision plan is required before this multi-sixday hospital admission');
 if(!Array.isArray(c.wounds)||c.wounds.length!==3||
    !Array.isArray(c.boxes)||c.boxes.length!==3||
    c.wounds.some((v,i)=>!Number.isInteger(v)||v<0||v>c.boxes[i])||
    s.player.health!==s.table.legacyHealth?.current||
    s.player.maxHealth!==s.table.legacyHealth?.max)
  throw Error('Existing wounds and historical HP must be reconciled without guessed injury conversion');
 return {c,doc};
}
function witness(s,c,doc){
 const incident=s.table?.combatDefeats?.at(-1);
 const receipts=s.table?.physicianRescue?.receipts||[];
 const receipt=receipts.at(-1);
 if(!incident||!receipt||!incident.rescued||incident.status!=='knocked_out'||
    incident.location!==CLINIC||incident.dangerCleared!==true||
    !['cautious','defensive'].includes(incident.opponentStyle)||
    receipt.eventHash!==incident.eventHash||
    receipt.doctor!==doc.name||receipt.location!==CLINIC||
    receipt.finalStatus!=='incapacitated'||receipt.woundsHealed!==0||
    receipt.minutes!==270||receipt.source!==rescueSource||
    !Number.isInteger(receipt.startMinute)||
    receipt.startMinute<incident.worldMinute||
    receipt.startMinute-incident.worldMinute>60||
    s.world.minutes<receipt.startMinute+270||
    s.world.minutes>receipt.startMinute+270+DAY||
    !Number.isInteger(incident.eventIndex)||incident.eventIndex<0||
    !Number.isInteger(incident.worldMinute)||
    typeof incident.eventHash!=='string'||
    incident.eventHash.length!==64)
  throw Error('A fresh genuinely witnessed and completed Dr Vael rescue after a safe nonlethal knock-out is required');
 const defeat=s.log[incident.eventIndex];
 if(defeat?.type!=='injury'||defeat.details?.origin!=='engine-wound-defeat'||
    defeat.details?.status!=='knocked_out'||
    defeat.details?.location!==CLINIC||
    defeat.details?.worldMinute!==incident.worldMinute||
    defeat.details?.beastId!==incident.beastId||
    defeat.details?.dangerCleared!==true||
    digest(defeat)!==incident.eventHash)
  throw Error('The actual defeat event has no matching original log witness');
 const follow=s.log.find(x=>x.type==='injury'&&
  x.details?.origin==='verified-clinic-rescue-followup'&&
  x.details?.defeatEventHash===incident.eventHash&&
  x.details?.doctor===doc.name&&
  x.details?.remainingWounds?.every((v,i)=>c.wounds[i]===v));
 if(!follow)
  throw Error('The clinician must have actually completed monitored emergency observation of these exact wounds');
 return {incident,receipt,follow};
}
function status(s,p={}){
 noFields(p);
 const c=s.table?.combatants?.player,rec=s.table?.clinicalCritical||null;
 const evidence=s.table?.physicianRescue?.receipts?.at(-1);
 return {patientStatus:c?.status||'unexamined',
  clinicPresent:s.world?.location===CLINIC,
  hasRecordedEmergencyObservation:!!evidence,
  hasWitnessedConsciousReferral:!!s.table?.criticalConsciousReferral&&!s.table.criticalConsciousReferral.used,
  phase:rec?.phase||'no-critical-course',
  completedRescueHash:rec?.sourceRescueHash||null,
  seriousWounds:c?.wounds?.[1]??null,
  criticalWounds:c?.wounds?.[2]??null,
  currentRehabRestriction:c?.lingeringPenalty||0,
  careFee:rec?'already assessed':'60 Talons, if eligible',
  nextAction:rec?.phase==='in_rehabilitation'?'health.criticalRehab':
   rec?.phase==='discharged'?'health.criticalFollowup (after 12 days)':rec?.phase==='completed'?
   'ordinary action under current wound/conditions':'health.criticalCare after verified rescue or conscious referral'};
}
function criticalCare(s,p={}){
 noFields(p);
 const {c,doc}=established(s);
 if(c.wounds[2]!==1||c.boxes[2]!==1||
    !['incapacitated','ok'].includes(c.status))
  throw Error('This narrow non-surgical course requires one verified Critical wound and a clinically eligible patient');
 if(s.table.clinicalCritical&&s.table.clinicalCritical.phase!=='completed')
  throw Error('A witnessed Critical-injury treatment course is still active');
 const rescued=c.status==='incapacitated';
 if(rescued&&(!c.firstAided||!c.conditions?.includes('under_clinical_observation')))
  throw Error('The unconscious patient must have genuinely completed external professional observation');
 // Conscious patients have a separate *real* prior field-wound + doctor
 // consultation provenance; they have NOT been rescued or knocked out.
 const proof=rescued?witness(s,c,doc):CriticalReferral.verify(s,c,doc);
 const sourceDefeatHash=rescued?proof.incident.eventHash:null;
 const sourceInjuryHash=rescued?null:proof.sourceHash;
 const sourceRescueHash=rescued?proof.receipt.eventHash:null;
 if(!Number.isFinite(s.player.coins)||s.player.coins*100<CARE_FEE_SCALES)
  throw Error('Real available funds of 60 Talons are required for this 24-day supervised course; a debtor or charity route is not yet established');
 const start=s.world.minutes,original=[...c.wounds];
 // The whole recovery schedule and non-surgical scope are fixed BEFORE the
 // world advances. Formal surgery, death treatment and soul/meridian damage
 // cannot be inferred from a nonlethal flesh-wound examination.
 const protocol={sourceDefeatHash,sourceInjuryHash,sourceRescueHash,
  clinicalEntryRoute:rescued?'independent-safe-rescue':'conscious-witnessed-field-injury',
  doctor:doc.name,patient:s.player.name,location:CLINIC,phase:'in_rehabilitation',
  startedMinute:start,feeScales:CARE_FEE_SCALES,careDays:CARE_DAYS,
  rehabilitationDays:REHAB_DAYS,criticalBefore:1,
  originalWounds:original,
  source:rescued?
    'Existing Dr Vael emergency observation of one actual nonlethal Critical wound at Lumenfall clinic':
    'Dr Vael in-person assessment of a survived Critical combat injury with authenticated original witnessed attack',
  localRuling:'18 days intensive non-surgical care, six days supervised rehabilitation; one-time 60 Talons'};
 const proofHash=digest(protocol);
 s.table.clinicalCritical={...protocol,protocolHash:proofHash};
 Health.spend(s,{scales:CARE_FEE_SCALES,
  reason:'Dr Vael supervised non-surgical Critical wound convalescence and rehabilitation'});
 if(!rescued){
  // The same original attack cannot be used to obtain a second admission,
  // even after completion of this episode.
  proof.referral.used=true;
  proof.referral.usedAtMinute=start;
  s.table.criticalConsciousReferralsUsed||={};
  s.table.criticalConsciousReferralsUsed[sourceInjuryHash]=start;
 }
 C.event(s,'injury',doc.name+' admits a genuinely examined patient for prolonged non-surgical Critical-wound observation.',{
   origin:'verified-critical-course-admission',sourceDefeatHash,
   sourceInjuryHash,clinicalEntryRoute:protocol.clinicalEntryRoute,
   clinician:doc.name,feeScales:CARE_FEE_SCALES,careDays:CARE_DAYS,
   rehabilitationDays:REHAB_DAYS
 });
 E.advance(s,CARE_DAYS*DAY);
 W.finalizeTime(s,start);
 // Baseline wound rules already treat one Serious wound per sixday
 // under skilled supervision. Critical recovery is strictly limited to
 // this previously recorded nonlethal injury and dedicated long course.
 c.wounds[2]-=1;
 c.wounds[1]=Math.max(0,c.wounds[1]-Math.floor(CARE_DAYS/6));
 c.wounds[0]=0;
 c.status='rehabilitating'; // still cannot initiate conscious player actions
 c.conditions=c.conditions.filter(x=>x!=='under_clinical_observation');
 if(!c.conditions.includes('post_critical_rehabilitation'))
  c.conditions.push('post_critical_rehabilitation');
 c.lingeringPenalty=1;
 c.stamina=Math.min(c.stamina,c.maxStamina);
 Health.sync(s,{source:'wounds'});
 const rec=s.table.clinicalCritical;
 rec.intensiveCompletedMinute=s.world.minutes;
 rec.afterCareWounds=[...c.wounds];
 rec.intensiveResultHash=digest({
   sourceDefeatHash:rec.sourceDefeatHash,protocolHash:rec.protocolHash,
   originalWounds:rec.originalWounds,
   afterCareWounds:rec.afterCareWounds,
   intensiveCompletedMinute:rec.intensiveCompletedMinute,
   status:c.status,condition:'post_critical_rehabilitation'
 });
 C.event(s,'injury',doc.name+' completes 18 genuine days of closely supervised non-surgical Critical recovery. The patient remains in rehabilitation.',{
  origin:'verified-critical-intensive-complete',protocolHash:proofHash,
  criticalAfter:c.wounds[2],remainingWounds:[...c.wounds],
  elapsedDays:CARE_DAYS,phase:'in_rehabilitation'
 });
 return {careCompleted:true,doctor:doc.name,careDays:CARE_DAYS,
  feeTalons:60,originalWounds:original,wounds:[...c.wounds],
  status:c.status,rehabilitationStillRequired:true,
  noExtraRoll:true,sourceDefeatHash,sourceInjuryHash,
  clinicalEntryRoute:protocol.clinicalEntryRoute};
}
function rehabilitation(s,p={}){
 noFields(p);
 const {c,doc}=established(s),rec=s.table?.clinicalCritical;
 if(!rec||rec.phase!=='in_rehabilitation'||
    rec.doctor!==doc.name||rec.patient!==s.player.name||
    rec.location!==CLINIC||rec.feeScales!==CARE_FEE_SCALES||
    rec.careDays!==CARE_DAYS||rec.rehabilitationDays!==REHAB_DAYS||
    !Number.isInteger(rec.intensiveCompletedMinute)||
    rec.intensiveCompletedMinute>s.world.minutes||
    c.status!=='rehabilitating'||
    c.wounds[2]!==0||c.lingeringPenalty!==1||
    !c.conditions?.includes('post_critical_rehabilitation')||
    JSON.stringify(c.wounds)!==JSON.stringify(rec.afterCareWounds)||
    rec.intensiveResultHash!==digest({
     sourceDefeatHash:rec.sourceDefeatHash,protocolHash:rec.protocolHash,
     originalWounds:rec.originalWounds,afterCareWounds:rec.afterCareWounds,
     intensiveCompletedMinute:rec.intensiveCompletedMinute,
     status:'rehabilitating',condition:'post_critical_rehabilitation'
    }))
  throw Error('A previously completed and unchanged Dr Vael intensive-care course is required before rehabilitation');
 const old=s.world.minutes;
 E.advance(s,REHAB_DAYS*DAY);
 W.finalizeTime(s,old);
 c.wounds[1]=Math.max(0,c.wounds[1]-1);
 c.wounds[0]=0;
 c.status='ok';
 c.stamina=c.maxStamina;c.recoverUses=0;
 c.conditions=c.conditions.filter(x=>x!=='post_critical_rehabilitation');
 if(!c.conditions.includes('post_critical_fatigue'))
  c.conditions.push('post_critical_fatigue');
 Health.sync(s,{source:'wounds'});
 rec.phase='discharged';
 rec.dischargeMinute=s.world.minutes;
 rec.fatigueUntilMinute=s.world.minutes+FOLLOWUP_DAYS*DAY;
 rec.dischargeWounds=[...c.wounds];
 rec.dischargeHash=digest({
  sourceDefeatHash:rec.sourceDefeatHash,protocolHash:rec.protocolHash,
  dischargeMinute:rec.dischargeMinute,
  fatigueUntilMinute:rec.fatigueUntilMinute,dischargeWounds:rec.dischargeWounds
 });
 C.event(s,'injury',doc.name+' discharges the patient after six days of supervised rehabilitation. Their Critical wound is closed, but reduced endurance persists.',{
   origin:'verified-critical-rehab-discharge',
   protocolHash:rec.protocolHash,remainingWounds:[...c.wounds],
   fatigueUntilMinute:rec.fatigueUntilMinute
 });
 return {discharged:true,doctor:doc.name,elapsedDays:REHAB_DAYS,
  status:c.status,wounds:[...c.wounds],lingeringCombatPenalty:1,
  followupAfterMinute:rec.fatigueUntilMinute,
  note:'The body is conscious and mobile, but injury history and a temporary -1 combat/wound resilience penalty persist.'};
}
function followup(s,p={}){
 noFields(p);
 const {c,doc}=established(s),r=s.table?.clinicalCritical;
 if(!r||r.phase!=='discharged'||r.doctor!==doc.name||
    r.patient!==s.player.name||r.location!==CLINIC||
    c.status!=='ok'||c.wounds[2]!==0||
    c.lingeringPenalty!==1||
    !c.conditions?.includes('post_critical_fatigue')||
    !Number.isInteger(r.fatigueUntilMinute)||
    s.world.minutes<r.fatigueUntilMinute||
    !Number.isInteger(r.dischargeMinute)||
    r.fatigueUntilMinute-r.dischargeMinute!==FOLLOWUP_DAYS*DAY||
    r.dischargeHash!==digest({
     sourceDefeatHash:r.sourceDefeatHash,protocolHash:r.protocolHash,
     dischargeMinute:r.dischargeMinute,
     fatigueUntilMinute:r.fatigueUntilMinute,dischargeWounds:r.dischargeWounds
    }))
  throw Error('A full 12 days of actual follow-up recovery after a witnessed discharge are required');
 if(s.world.minutes%DAY<8*60||s.world.minutes%DAY+FOLLOWUP_MINUTES>17*60)
  throw Error('A real daytime follow-up visit with the actual physician is required');
 const start=s.world.minutes;
 E.advance(s,FOLLOWUP_MINUTES);
 W.finalizeTime(s,start);
 c.lingeringPenalty=0;
 c.conditions=c.conditions.filter(x=>x!=='post_critical_fatigue');
 r.phase='completed';r.followupMinute=s.world.minutes;
 s.table.clinicalInjuryHistory||=[];
 s.table.clinicalInjuryHistory.push({
  sourceDefeatHash:r.sourceDefeatHash,doctor:doc.name,
  startedMinute:r.startedMinute,dischargedMinute:r.dischargeMinute,
  completedMinute:r.followupMinute,injury:'one nonlethal Critical wound',
  lastingRecord:'previous critical injury treated over 24 supervised days plus 12 days regained endurance',
  permanentAbilityLost:false
 });
 C.event(s,'injury',doc.name+' confirms recovery after twelve more actual days. The previous Critical injury stays in the clinical history.',{
  origin:'verified-post-critical-followup',
  sourceDefeatHash:r.sourceDefeatHash,doctor:doc.name,
  lingeringPenaltyAfter:0
 });
 return {fullyRehabilitated:true,doctor:doc.name,elapsedMinutes:FOLLOWUP_MINUTES,
  status:c.status,wounds:[...c.wounds],lingeringPenalty:0,
  sourceDefeatHash:r.sourceDefeatHash,clinicalHistoryPreserved:true};
}
module.exports={status,criticalCare,rehabilitation,followup};
