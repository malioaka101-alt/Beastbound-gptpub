'use strict';
// GM-private original independent Grade-readiness inspection, no time, RNG,
// magic Grade, money or animal consent. Never use the PLAYER location or the
// player's active wild encounter as a proxy for an independent travelling pair.
// Each positive fact comes from the existing original owner at this minute.
const E=require('../engine'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),Person=require('../world/sapient-beast-persons'),
 Visit=require('./independent-sapient-terrestrial-journey'),
 Presence=require('../world/person-presence'),Pair=require('./independent-original-bond-pair'),
 Interaction=require('./independent-original-bond-interactions'),
 Arr=require('./independent-sapient-arrangements'),
 Grade=require('./bond-grade'),Health=require('./unified');
function routeStatus(s,p,b){
 const deny=reason=>({privateToGM:true,assessmentEligible:false,reason,
  noMoneyTimeRngConsentOrGrade:true});
 if(!s||!p||!b||typeof p.actorId!=='string'||!b.id)
  return deny('missing-source-individuals');
 const minute=s.world?.minutes,day=Math.floor(minute/1440);
 if(!Number.isInteger(minute)||minute<0||!People.verify(Realm.peek(s),p)||
  !p.actorId.startsWith('emergent:')||p.status!=='active'||
  p.ageBand!=='adult, exact birthday not established')
  return deny('no-current-valid-independent-human');
 const pos=Visit.position(p,minute),site=pos?.arrived?pos.location:null;
 if(!['crossing','academy'].includes(site))
  return deny('no-real-accredited-original-facility-arrival');
 if(!Visit.verify(s,p))return deny('unverified-actual-terrestrial-source-history');
 const originalVisit=Presence.resolve(Realm.peek(s),p.actorId,site,day,minute%1440);
 if(!originalVisit?.presence||originalVisit.presence.source!==Visit.VISITOR||
  originalVisit.presence.arrivedBy!==pos.sourceHash)
  return deny('absent-original-individual-visitor-presence');
 if(s.battle||s.encounter?.threat)
  return deny('unresolved-original-danger');
 if(!b.sapientLife||!Person.verify(b)||b.location!==site||b.away===true||
  b.owner!==null||s.player?.partnerIds?.includes(b.id)||
  s.table?.bondRecords?.[b.id]?.contract||!Arr.safe(b)||b.sapience<3||
  !b.sapientLife.terrestrialJourneyReceipts?.some(x=>x.seal===pos.sourceHash))
  return deny('no-real-safe-independent-sapient-at-facility');
 if(!Pair.verify(s,p)||!Arr.verify(s,p)||!Interaction.verify(s,p))
  return deny('unverified-original-pair-or-consent-history');
 const pair=Interaction.privateStatus(s,p).find(x=>x.beastId===b.id),
  arrangement=(p.originalSapientArrangements||[]).find(x=>
   x.source.beastId===b.id&&Arr.statusAt(x,minute)==='accepted');
 if(!pair||pair.bond.fractured||pair.bond.willingness<30||!arrangement)
  return deny('no-current-mutually-revocable-examination-relationship');
 const condition=Health.currentNpcWoundCondition(s,p.actorId);
 if(!condition||condition.terminal||condition.workAndOrdinaryPracticeBlocked)
  return deny('real-human-original-combat-unfit');
 if(!Number.isInteger(p.cashScales)||p.cashScales<100)
  return deny('original-individual-fee-not-funded');
 let calibration;
 try{calibration=Grade.gradeReference(s,b);}catch{
  return deny('no-pre-established-numeric-individual-grade-calibration');
 }
 if(b.contractGradeAssessment?.grade===calibration.grade&&
  b.contractGradeAssessment?.species===b.species&&
  b.contractGradeAssessment?.evolutionStage===b.evolutionStage)
  return deny('current-individual-grade-already-assessed');
 if(b.gradeExamLastMinute!==undefined&&
  minute-b.gradeExamLastMinute<6*1440)
  return deny('original-sixday-examination-cooldown');
 if(minute%1440+120>1440)
  return deny('original-120-minute-daylight-window-unavailable');
 return {privateToGM:true,assessmentEligible:true,site,
  actorId:p.actorId,beastId:b.id,
  actualArrivalSourceHash:pos.sourceHash,
  sourceGradeCalibrationPresent:true,originalPersonalScalesAtLeast100:true,
  originalExamMinutes:120,originalFeeScales:100,
  requiresSeparatelyWitnessedIndependentHumanAndBeastChoice:true,
  requiresOriginalPrivateD20AfterMutualAssent:true,
  noMoneyTimeRngConsentOrGrade:true};
}
function status(s,{actorId,beastId,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId)||typeof beastId!=='string')
  throw Error('Source-read-only individual Grade readiness requires only actual actorId and beastId');
 const w=Realm.peek(s),p=w.emergentPeople?.people?.[actorId.slice(9)],
  b=s.beasts?.[beastId];
 return routeStatus(s,p,b);
}

// This read NEVER makes an examination eligible. It distinguishes one
// independently lived person's PHYSICALLY earned Scales from the many
// unproven other Grade prerequisites (calibration, relationship, welfare,
// actual examiner and fresh two-person assent). Merchant accounting is
// verified in both directions before attributing real work-paid funds.
function fundingStatus(s,{actorId,beastId,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
   !/^emergent:person_[0-9]+$/.test(actorId)||typeof beastId!=='string')
  throw Error('Exact source human and beast only; no chosen Grade, money, exam success or consent');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  b=s.beasts?.[beastId],
  Career=require('../world/person-careers'),
  Merchant=require('../world/merchant-voluntary-work-terms');
 const base={privateToGM:true,actorId,beastId,requiredPersonalScales:100,
  noFeeDebitedOrGradeAssignedOrExamChoice:true,
  noCreditFromAbstractCareerOrPlayerCoins:true,
  notAReceivedInstitutionalCalibration:true};
 if(!p||!b||!People.verify(w,p)||!Person.verify(b)||
   !Career.verify(p)||!Career.verifyLocalTradePayments(w)||
   !Merchant.verify(w))
  return {...base,sourceFinancialHistoryVerified:false,
    individuallyFunded:false,reason:'invalid-real-original-individual-or-payment-ledger'};
 const workerRows=p.career?.tradePayments||[],
  sellerRows=w.localProvisioner?.laborPayments||[];
 const matched=workerRows.filter(x=>
  sellerRows.some(y=>y.sourceHash===x.sourceHash&&
    JSON.stringify(y)===JSON.stringify(x))&&
  x.source?.sellerId==='otto'&&
  x.source?.sourceCurrency==='Scales'&&
  x.source?.work?.outcome?.success===true);
 const paid=matched.reduce((sum,x)=>sum+x.amountScales,0),
  pos=Visit.position(p,s.world.minutes),
  site=pos?.arrived?pos.location:null,
  visit=site&&['crossing','academy'].includes(site)&&
   Presence.resolve(w,actorId,site,Math.floor(s.world.minutes/1440),
    s.world.minutes%1440),
  facilityPresent=!!visit?.presence&&
   visit.presence.source===Visit.VISITOR&&
   visit.presence.arrivedBy===pos.sourceHash&&
   Visit.verify(s,p)&&b.location===site&&
   b.sapientLife?.terrestrialJourneyReceipts?.some(x=>x.seal===pos.sourceHash),
  balance=p.cashScales,
  gradeGate=routeStatus(s,p,b);
 return {...base,sourceFinancialHistoryVerified:true,
  originalPersonalBalanceScales:balance,
  genuineSourcePaidMerchantWagesScales:paid,
  individuallyFunded:Number.isSafeInteger(balance)&&balance>=100,
  originalWageReceipts:matched.map(x=>x.sourceHash),
  sourcePaidIndividualWorker:matched.length>0,
  actualOriginalAccreditedFacilityPresence:facilityPresent,
  originalGradeReadinessCurrentlyEligible:gradeGate.assessmentEligible,
  readinessBlocker:gradeGate.reason??null,
  numericGradeNotInferredFromWageOrRarity:true};
}
module.exports={routeStatus,status,fundingStatus};
