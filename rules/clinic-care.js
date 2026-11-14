'use strict';
// One bounded, actual medical service for a conscious injured character.
// A public professional and real clinic must exist. Consultation witnesses a
// specific present injury; subsequent inpatient care costs money and six days.
// Neither a caller nor a clinic roll can rewrite Critical wounds or save the
// dying by fiat.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),W=require('./world'),Health=require('./unified');
const CLINIC='academy',PHYSICIAN='vale',COST_SC=3000;
const CONSULT_MINUTES=15,STAY_DAYS=6,DAY=1440;
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
// A completed Serious-wound course belongs to the original clinical and
// wound ledgers. Retain its actual consultation and completion witnesses in
// the EXISTING receipt, so rotating scene logs cannot fabricate treatment.
const COURSE='original-supervised-serious-recovery-proof-v1';
function verifyHistory(s){
 const visits=s.table?.clinicCare;
 if(visits===undefined)return true;
 if(!visits||!Array.isArray(visits.receipts))
  throw Error('The saved clinical recovery history is inconsistent');
 const ids=new Set();
 for(const row of visits.receipts){
  if(!row||typeof row.caseId!=='string'||ids.has(row.caseId))
   throw Error('A clinical recovery cannot reuse a case');
  ids.add(row.caseId);
  if(row.source===undefined&&row.sourceHash===undefined)continue;
  const q=row.source,a=q?.originalIntake,b=q?.originalCompletion;
  if(!q||row.sourceHash!==digest(q)||q.origin!==COURSE||
   q.caseId!==row.caseId||q.patient!==s.player.name||
   q.doctor!==E.NPCS[PHYSICIAN]?.name||
   q.location!==CLINIC||
   q.intakeHash!==digest(a)||q.completionHash!==digest(b)||
   a?.type!=='injury'||a.details?.origin!=='engine-clinic-intake'||
   a.details.caseId!==row.caseId||
   a.details.clinician!==q.doctor||
   a.details.location!==CLINIC||
   a.details.seriousWounds!==row.seriousBefore||
   b?.type!=='injury'||b.details?.caseId!==row.caseId||
   b.details?.source!==q.originalVisitSource||
   b.details?.elapsedDays!==STAY_DAYS||
   b.details?.seriousBefore!==row.seriousBefore||
   b.details?.seriousAfter!==row.seriousAfter||
   b.details?.lightBefore!==q.lightBefore||
   row.treated!=='one Serious wound'||row.days!==STAY_DAYS||
   row.feeScales!==COST_SC||
   row.seriousBefore<1||!Number.isInteger(row.seriousBefore)||
   row.seriousAfter!==row.seriousBefore-1||
   q.seriousAfter!==row.seriousAfter||q.lightAfter!==0||
   !Number.isInteger(q.startedAtMinute)||q.startedAtMinute<0||
   q.finishedAtMinute!==q.startedAtMinute+STAY_DAYS*DAY||
   row.day!==Math.floor(q.finishedAtMinute/DAY)+1||
   q.paidScales!==COST_SC||
   !Number.isInteger(q.balanceBeforeScales)||
   q.balanceBeforeScales<COST_SC||
   q.balanceAfterScales!==q.balanceBeforeScales-COST_SC||
   q.noAdditionalRecoveryRoll!==true||
   q.noCriticalWoundTreatment!==true)
   throw Error('A completed clinical course lacks its actual injury, time, payment or physician evidence');
 }
 return true;
}
function only(p,keys){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>!keys.includes(k))||keys.some(k=>!Object.hasOwn(p,k)))
  throw Error('Clinic care accepts only a witnessed case ID, never chosen wounds, dates, costs or outcomes');
}
function context(s,{daytime=false}={}){
 const loc=E.LOCATIONS[s.world?.location],doctor=E.NPCS[PHYSICIAN];
 if(s.world?.location!==CLINIC||!loc?.facilities?.includes('clinic')||
    doctor?.location!==CLINIC||doctor.profession!=='Origin-pattern physician')
  throw Error('An established human clinician and actual Lumenfall Annex clinic are required');
 if(s.battle||s.encounter)
  throw Error('Resolve the active combat or wild animal encounter before requesting outpatient clinical care');
 if(daytime){
  const now=s.world.minutes%DAY;
  if(now<8*60||now+CONSULT_MINUTES>17*60)
   throw Error('Clinic consultation requires the witnessed local daytime appointment window');
 }
 const c=s.table?.combatants?.player;
 if(s.table?.healthModel!=='wounds-v1'||!c)
  throw Error('The authoritative player wound record is required for clinical treatment');
 if(c.status!=='ok'||c.wounds?.[2]>0)
  throw Error('Unconscious, dying or Critical-wound patients need witnessed emergency rescue and specialist treatment, not outpatient recovery');
 if(!Array.isArray(c.wounds)||c.wounds.length!==3||!Number.isInteger(c.wounds[1])||
    c.wounds[1]<1)
  throw Error('A recorded Serious wound is required; no injury can be invented for clinic care');
 return {c,doctor,loc};
}
function status(s,p={}){
 only(p,[]);
 verifyHistory(s);
 const visits=s.table?.clinicCare;
 const active=visits?.active;
 const visible=active&&!active.used&&active.location===s.world?.location&&
   Number.isInteger(active.worldMinute)&&s.world.minutes-active.worldMinute<=DAY;
 return {clinicAvailable:s.world?.location===CLINIC,
  physician:s.world?.location===CLINIC?E.NPCS[PHYSICIAN].name:null,
  pendingCaseId:visible?active.caseId:null,
  seriousWounds:s.table?.combatants?.player?.wounds?.[1]??null,
  fullSixdayCareAvailable:!!visible&&s.world?.location===CLINIC&&
    !(s.player.partnerIds||[]).length&&
    s.table?.combatants?.player?.status==='ok'&&
    s.table?.combatants?.player?.wounds?.[2]===0,
  price:visible?'30 Talons including sixday room and provisions':null,
  recentReceipts:(visits?.receipts||[]).slice(-5).map(x=>({
   caseId:x.caseId,treated:x.treated,day:x.day,days:x.days,
   originalSourceVerified:!!x.sourceHash
  }))};
}
function intake(s,p={}){
 only(p,[]);
 const {c,doctor,loc}=context(s,{daytime:true});
 verifyHistory(s);
 const day=E.day(s),care=s.table?.clinicCare;
 if(care?.lastConsultDay===day||
    (care?.active&&!care.active.used&&
     s.world.minutes-care.active.worldMinute<=DAY))
  throw Error('This clinical intake has already been witnessed today');
 if(!Number.isFinite(s.player.coins)||s.player.coins<30)
  throw Error('A current treatment offer requires enough money for the quoted 30-Talon service');
 const old=s.world.minutes;
 E.advance(s,CONSULT_MINUTES);
 W.finalizeTime(s,old);
 Health.sync(s,{source:'legacy'});
 s.table||={};s.table.clinicCare||={serial:0,receipts:[]};
 const ledger=s.table.clinicCare;
 C.int(ledger.serial,'clinic case serial',0,1000000000);
 let caseId;
 do{ledger.serial++;caseId='clinic_case_'+String(ledger.serial).padStart(6,'0');}
 while(ledger.active?.caseId===caseId||(ledger.receipts||[]).some(r=>r.caseId===caseId));
 const source='Actual supervised serious-injury intake at '+loc.name+
  ' with '+doctor.name+', '+doctor.profession;
 C.event(s,'injury',doctor.name+' examines the existing Serious wound and offers sixdays of supervised clinic care.',{
  origin:'engine-clinic-intake',caseId,clinician:doctor.name,
  location:CLINIC,seriousWounds:c.wounds[1]
 });
 const eventIndex=s.log.length-1;
 ledger.lastConsultDay=day;
 ledger.active={caseId,source,location:CLINIC,clinician:doctor.name,
  player:s.player.name,worldMinute:s.world.minutes,seriousWounds:c.wounds[1],
  criticalWounds:0,feeScales:COST_SC,eventIndex,
  eventHash:digest(s.log[eventIndex]),used:false};
 return {admittedForAssessment:true,caseId,physician:doctor.name,
  injury:'Serious wound',feeTalons:30,careDays:STAY_DAYS,
  includesRoomAndFood:true,elapsedMinutes:CONSULT_MINUTES,
  note:'No wound has been healed by the consultation itself'};
}
function recover(s,p={}){
 only(p,['caseId']);
 const {c,doctor}=context(s);
 verifyHistory(s);
 const caseId=p.caseId,ledger=s.table?.clinicCare,visit=ledger?.active;
 if(typeof caseId!=='string'||!visit||visit.used||visit.caseId!==caseId||
    visit.location!==CLINIC||visit.clinician!==doctor.name||
    visit.player!==s.player.name||visit.feeScales!==COST_SC||
    visit.criticalWounds!==0||visit.seriousWounds!==c.wounds[1]||
    typeof visit.source!=='string'||!visit.source.includes(doctor.name)||
    !Number.isInteger(visit.worldMinute)||visit.worldMinute<0||
    visit.worldMinute>s.world.minutes||s.world.minutes-visit.worldMinute>DAY)
  throw Error('A current unused, individually witnessed clinical intake for the unchanged Serious wound is required');
 if(!Number.isInteger(visit.eventIndex)||visit.eventIndex<0||visit.eventIndex>=s.log.length||
    s.log[visit.eventIndex]?.details?.origin!=='engine-clinic-intake'||
    s.log[visit.eventIndex]?.details?.caseId!==caseId||
    s.log[visit.eventIndex]?.details?.seriousWounds!==visit.seriousWounds||
    digest(s.log[visit.eventIndex])!==visit.eventHash)
  throw Error('The saved doctor consultation must match its original independent scene witness');
 if((s.player.partnerIds||[]).length)
  throw Error('A partner needs its own sixday welfare and provision arrangement before the player can enter inpatient care');
 if(!Number.isFinite(s.player.coins)||s.player.coins*100<COST_SC)
  throw Error('Insufficient real funds for supervised sixday clinical care');
 // The original wound rule already heals one Serious wound in a full sixday.
 // There is no d20 here: the available qualified clinician supervises rest,
 // not a magical instant cure or an upgrade to an unearned skill.
 const before=s.world.minutes,beforeSerious=c.wounds[1],beforeLight=c.wounds[0],
  originalIntake=structuredClone(s.log[visit.eventIndex]),
  balanceBeforeScales=Math.round(s.player.coins*100);
 const payment=Health.spend(s,{scales:COST_SC,reason:'Sixday inpatient care with Dr Vael at Lumenfall Annex'});
 if(payment.spentScales!==COST_SC||
    payment.balanceScales!==balanceBeforeScales-COST_SC)
  throw Error('Original clinic funds did not conserve their paid treatment cost');
 visit.used=true;visit.recoveredAtMinute=before;
 E.advance(s,STAY_DAYS*DAY);
 W.finalizeTime(s,before);
 c.wounds[1]--;
 c.wounds[0]=0; // six ordinary nights of Light-wound recovery
 c.stamina=c.maxStamina;c.recoverUses=0;c.firstAided=false;
 Health.sync(s,{source:'wounds'});
 C.event(s,'injury',doctor.name+' completes sixdays of genuine supervised recovery; one Serious wound heals.',{
  caseId,source:visit.source,elapsedDays:STAY_DAYS,
  seriousBefore:beforeSerious,seriousAfter:c.wounds[1],lightBefore:beforeLight
 });
 const originalCompletion=structuredClone(s.log[s.log.length-1]);
 const source={origin:COURSE,caseId,patient:s.player.name,
  doctor:doctor.name,location:CLINIC,
  originalVisitSource:visit.source,originalIntake,originalCompletion,
  intakeHash:digest(originalIntake),completionHash:digest(originalCompletion),
  startedAtMinute:before,finishedAtMinute:s.world.minutes,
  seriousAfter:c.wounds[1],lightBefore:beforeLight,lightAfter:c.wounds[0],
  paidScales:COST_SC,balanceBeforeScales,
  balanceAfterScales:payment.balanceScales,
  noAdditionalRecoveryRoll:true,noCriticalWoundTreatment:true};
 ledger.receipts||=[];
 ledger.receipts.push({caseId,day:E.day(s),days:STAY_DAYS,treated:'one Serious wound',
  feeScales:COST_SC,seriousBefore:beforeSerious,seriousAfter:c.wounds[1],
  source,sourceHash:digest(source)});
 verifyHistory(s);
 return {recovered:true,caseId,elapsedDays:STAY_DAYS,
  feeTalons:30,seriousBefore:beforeSerious,seriousAfter:c.wounds[1],
  lightAfter:c.wounds[0],noCriticalHealing:true,physician:doctor.name,
  noExtraRoll:true};
}
module.exports={intake,recover,status,verifyHistory};
