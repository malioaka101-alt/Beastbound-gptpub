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
module.exports={routeStatus,status};
