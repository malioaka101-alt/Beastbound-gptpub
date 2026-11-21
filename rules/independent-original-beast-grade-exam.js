'use strict';
// Source-owned independent individual Grade EXAM, using the exact existing
// original Grade owner: no rarity -> numeric Grade mapping, no paid fee from
// family status, no free skill rank, no compelled sapient examination.
const Crypto=require('node:crypto'),E=require('../engine'),C=require('./core'),
 Original=require('./bond-grade'),Pair=require('./independent-original-bond-pair'),
 Interaction=require('./independent-original-bond-interactions'),
 Arr=require('./independent-sapient-arrangements'),Social=require('./beast-social-arrangements'),
 Agency=require('./beast-agency'),People=require('../world/emergent-people'),
 Realm=require('../world/simulation'),Presence=require('../world/person-presence'),
 Person=require('../world/sapient-beast-persons'),World=require('./world'),
 Visit=require('./independent-sapient-terrestrial-journey'),
 Readiness=require('./independent-original-beast-grade-preflight');
const ORIGIN='source-paid-independent-original-numeric-beast-grade-exam-v1',
 WITNESS='gm-witnessed-independent-original-facility-grade-assessment-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 int=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b,
 text=x=>typeof x==='string'&&x.trim().length>=25&&x.length<=900;
function receiptAssessment(b,q){
 const grade=q.calibration.grade,dc=q.spec.dc,roll=q.check.roll,
  source='Individual Grade '+grade+' verified at '+q.site+
   ' after d20 '+roll+' vs DC '+dc+
   ', against prior independent calibration: '+q.calibration.source.trim().slice(0,120);
 return {grade,species:q.species,evolutionStage:q.form,individualGrade:q.individualGrade,
  worldMinute:q.endMinute,source,origin:ORIGIN,facility:q.site,
  calibrationMinute:q.calibration.worldMinute,examCheck:{roll,dc}};
}
function witnessValid(p,b,q){
 const w=q.witness,d=w?.details;
 return w?.type==='story'&&text(w.text)&&w.text.includes(p.name)&&w.text.includes(b.name)&&
  w.day===q.day+1&&w.time===E.clock({world:{minutes:q.minute}})&&
  d?.origin===WITNESS&&d.actorId===p.actorId&&d.beastId===b.id&&
  d.location===q.site&&d.pairSeal===q.pairSeal&&d.arrangementHash===q.arrangementHash&&
  d.gradeCalibrationHash===hash(q.calibration)&&d.measuredSapience===b.sapience&&
  text(d.explainedOriginalIndividualGradeAssessment)&&text(d.individualInformedExaminationChoice)&&
  text(d.examinationSafetyAndLimits)&&d.noInferredGradeOrForcedExamination===true;
}
function actualOriginalFacilityPresence(s,p,b,q){
 const Visit=require('./independent-sapient-terrestrial-journey'),
  pos=Visit.position(p,q.minute);
 // Original native habitats and accredited facilities are different.
 // Do not fabricate a beast at crossing from a forest sighting, or
 // accept a written Grade exam without an actual signed physical visit.
 return !!pos?.arrived&&pos.location===q.site&&
  Visit.verify(s,p)&&
  eq(q.shift,Visit.visitorPresence(p,q.minute,q.site))&&
  b.sapientLife?.terrestrialJourneyReceipts?.some(x=>x.seal===pos.sourceHash);
}
function physical(s,p,b,q,minute){
 const pair=Interaction.currentAt(s,p,q.pairSeal,minute),arr=p.originalSapientArrangements?.find(x=>x.seal===q.arrangementHash);
 if(!actualOriginalFacilityPresence(s,p,b,q)||
  !pair||pair.base.source.beastId!==b.id||pair.bond.fractured||
  pair.bond.willingness<30||arr?.source.beastId!==b.id||
  !Pair.revision(arr,minute,q.arrangementRevision)||b.sapience<3||
  !Person.verify(b)||!q.welfare||!Arr.safe({...b,...q.welfare}))return false;
 return true;
}
function replay(s,p){
 if(p?.originalIndependentGradeExams===undefined)return [];
 const rows=p.originalIndependentGradeExams,w=Realm.peek(s);
 if(!Array.isArray(rows)||rows.length>480||!People.verify(w,p)||!Pair.verify(s,p)||!Interaction.verify(s,p))return null;
 let minute=-1,lastDay=-1;
 const seen=new Set(),local=[];
 for(const row of rows){
  const q=row?.source,b=s.beasts?.[q?.beastId],sh=q?.shift;
  if(!q||row.seal!==hash(q)||q.origin!==ORIGIN||
   q.actorId!==p.actorId||q.humanHash!==p.originHash||q.beastHash!==b?.sapientLife?.sourceHash||
   !b?.sapientLife||!Person.verify(b)||
   !int(q.minute,minute+1,s.world.minutes)||!int(q.day,lastDay+1)||q.day!==Math.floor(q.minute/1440)||
   !['crossing','academy'].includes(q.site)||q.form!==b.evolutionStage||q.species!==b.species||
   q.individualGrade!==b.individualGrade||
   !eq(q.calibration,b.gradeCalibration)||!int(q.calibration.worldMinute,0,q.minute)||
   !physical(s,p,b,q,q.minute)||!witnessValid(p,b,q)||q.witnessHash!==hash(q.witness)||
   seen.has(q.witnessHash)||!int(q.cashBefore,0)||!int(q.cashAfter,0)||
   !int(q.rngBefore,1,4294967295)||
   !sh||sh.hash!==hash(Object.fromEntries(Object.entries(sh).filter(([k])=>k!=='hash')))||
   sh.actorId!==p.actorId||sh.originHash!==p.originHash||sh.location!==q.site||
   sh.scheduledAtDay!==sh.fromDay||sh.throughDay-sh.fromDay!==5||sh.fromDay>q.day||sh.throughDay<q.day||
   q.spec?.feeScales!==100||q.spec?.minutes!==120||q.spec?.cooldownMinutes!==6*1440||
   !eq(q.spec,Original.examSpec(q.calibration.grade,p.mechanicalFoundation.baselineAttributes.wis,0))||
   q.humanChoice?.rngBefore!==q.rngBefore||
   !Arr.verifyHuman(q.humanChoice,q.witnessHash)||q.humanChoice.personality!==p.personality||
   q.noRarityGradeOrPlayerPaymentOrPartnership!==true)return null;
  const consent=q.humanChoice.accepted;
  if(consent){
   const d=q.beastChoice;
   if(!d||d.disposition!==Agency.profile(s,b).disposition||
    !int(d.rngBefore,1,4294967295)||!eq(d,Social.sapientChoice({rngState:d.rngBefore},d.disposition)))
    return null;
  }else if(q.beastChoice!==null)return null;
  const accepted=consent&&q.beastChoice.outcome==='accepted',
   roller={rngState:q.humanChoice.rngAfter},
   roll=accepted?C.die(roller,20):null,
   margin=accepted?roll+q.spec.modifier+C.naturalAdjustment(roll)-q.spec.dc:null,
   check=accepted?{roll,dc:q.spec.dc,modifier:q.spec.modifier,degree:C.degree(margin),success:margin>=0}:null,
   exam=accepted?{worldMinute:q.endMinute,facility:q.site,
    outcome:check.success?'verified':'inconclusive',
    check:{roll,dc:q.spec.dc,degree:check.degree},origin:ORIGIN,actorId:p.actorId,sourceSeal:row.seal}:null;
  if(q.accepted!==accepted||!eq(q.check,check)||q.humanRngAfter!==roller.rngState||
   q.actualMinutes!==(accepted?120:5)||q.endMinute!==q.minute+q.actualMinutes||
   q.endMinute>s.world.minutes||q.cashAfter!==q.cashBefore-(accepted?100:0)||
   accepted&&q.cashBefore<100||
   q.feeScales!==(accepted?100:0)||q.result!==(accepted?check.success?'verified':'inconclusive':'declined')||
   !eq(q.assessment,check?.success?receiptAssessment(b,q):null)||
   accepted&&!(b.gradeExaminations||[]).some(x=>eq(x,exam))&&
    !(b.gradeExaminations||[]).length<20||
   !accepted&&q.assessment!==null)return null;
  // Only a successful current paid exam can certify the individual's
  // present Grade. No historical grade is applied to a later form.
  if(check?.success&&q.assessment?.worldMinute===b.contractGradeAssessment?.worldMinute&&
   !eq(q.assessment,b.contractGradeAssessment))return null;
  seen.add(q.witnessHash);minute=q.endMinute;lastDay=q.day;local.push(row);
 }
 return local;
}
// A self-contained receipt proof for the original contract law. In this
// function do NOT recurse into the full pair history: contract verification
// itself reads the grade receipt, and the two ledgers audit each other at
// the action gate and in GM-private status.
function paidSource(s,p,b,row){
 try{
  const q=row?.source,d=q?.witness?.details;
  if(!q||!actualOriginalFacilityPresence(s,p,b,q)||
   row.seal!==hash(q)||q.origin!==ORIGIN||!q.accepted||
   q.actorId!==p?.actorId||q.humanHash!==p.originHash||q.beastId!==b?.id||
   q.beastHash!==b?.sapientLife?.sourceHash||!eq(q.calibration,b.gradeCalibration)||
   !['academy','crossing'].includes(q.site)||q.form!==b.evolutionStage||
   q.species!==b.species||q.individualGrade!==b.individualGrade||
   q.feeScales!==100||!int(q.cashBefore,100)||q.cashAfter!==q.cashBefore-100||
   q.actualMinutes!==120||q.endMinute!==q.minute+120||q.endMinute>s.world.minutes||
   !eq(q.spec,Original.examSpec(q.calibration.grade,p.mechanicalFoundation.baselineAttributes.wis,0))||
   !witnessValid(p,b,q)||q.witnessHash!==hash(q.witness)||
   !Arr.verifyHuman(q.humanChoice,q.witnessHash)||
   q.humanChoice.rngBefore!==q.rngBefore||q.humanChoice.personality!==p.personality||
   !q.humanChoice.accepted)return false;
  const dChoice=q.beastChoice;
  if(!dChoice||dChoice.disposition!==Agency.profile(s,b).disposition||
   !int(dChoice.rngBefore,1,4294967295)||
   !eq(dChoice,Social.sapientChoice({rngState:dChoice.rngBefore},dChoice.disposition)))return false;
  const rng={rngState:q.humanChoice.rngAfter},roll=C.die(rng,20),
   margin=roll+q.spec.modifier+C.naturalAdjustment(roll)-q.spec.dc,
   check={roll,dc:q.spec.dc,modifier:q.spec.modifier,degree:C.degree(margin),success:margin>=0};
  const exam={worldMinute:q.endMinute,facility:q.site,
   outcome:check.success?'verified':'inconclusive',
   check:{roll,dc:q.spec.dc,degree:check.degree},origin:ORIGIN,actorId:p.actorId,sourceSeal:row.seal};
  return check.success&&q.result==='verified'&&q.humanRngAfter===rng.rngState&&
   eq(q.check,check)&&eq(q.assessment,receiptAssessment(b,q))&&
   (b.gradeExaminations||[]).some(x=>eq(x,exam));
 }catch{return false;}
}
function verify(s,p){try{return replay(s,p)!==null;}catch{return false;}}
function examine(s,{actorId,beastId,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId)||
  typeof beastId!=='string'||!int(witnessIndex,0,s.log.length-1))
  throw Error('Exact independent candidate and witnessed original Grade assessment only; no selected grade, consent or success');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],b=s.beasts?.[beastId],
  minute=s.world.minutes,day=Math.floor(minute/1440),
  // This independent person's source-arrival, NOT the player's map position,
  // is the only lawful location of a private facility examination.
  position=p&&Visit.position(p,minute),site=position?.arrived?position.location:null,
  present=p&&site&&Presence.resolve(w,actorId,site,day,minute%1440),
  ready=p&&b?Readiness.routeStatus(s,p,b):null,
  witness=structuredClone(s.log[witnessIndex]),d=witness?.details;
 if(!p||!People.verify(w,p)||!present?.presence||p.status!=='active'||
  !b?.sapientLife||!Person.verify(b)||b.owner!==null||b.away===true||
  b.location!==site||s.battle||s.encounter?.threat||
  !ready?.assessmentEligible||!['crossing','academy'].includes(site)||p.cashScales<100||
  s.player.partnerIds?.includes(beastId)||s.table?.bondRecords?.[beastId]?.contract||
  !verify(s,p)||!Pair.verify(s,p)||!Interaction.verify(s,p))
  throw Error('Real co-present independent sapient individual, original examination facility, funds, verified pair and safe welfare required');
 let calibration;
 try{calibration=Original.gradeReference(s,b);}catch{throw Error('Pre-existing individual numeric Grade calibration required; species rarity is not a Grade');}
 const pair=Interaction.privateStatus(s,p).find(x=>x.beastId===beastId),
  arr=p.originalSapientArrangements?.find(x=>x.seal===d?.arrangementHash),
  revision=arr?.events.at(-1)?.seal||arr?.seal;
 if(!pair||pair.bond.willingness<30||!arr||Arr.statusAt(arr,minute)!=='accepted'||
  !Pair.revision(arr,minute,revision)||b.contractGradeAssessment?.grade===calibration.grade&&
  b.contractGradeAssessment.species===b.species&&b.contractGradeAssessment.evolutionStage===b.evolutionStage||
  b.gradeExamLastMinute!==undefined&&minute-b.gradeExamLastMinute<6*1440)
  throw Error('Actual current consenting pair, unused original Grade examination and cooldown required');
 const q={origin:ORIGIN,actorId,humanHash:p.originHash,beastId,beastHash:b.sapientLife.sourceHash,
  pairSeal:pair.sourceHash,arrangementHash:arr.seal,arrangementRevision:revision,minute,day,site,
  species:b.species,form:b.evolutionStage,individualGrade:b.individualGrade,
  calibration:structuredClone(calibration),welfare:{condition:b.condition,mood:b.mood,
   relationship:b.relationship,needs:structuredClone(b.needs),injuries:structuredClone(b.injuries||[]),
   conditions:structuredClone(b.conditions||[])},witness,witnessHash:hash(witness),
  shift:structuredClone(present.presence),spec:Original.examSpec(calibration.grade,p.mechanicalFoundation.baselineAttributes.wis,0),
  noRarityGradeOrPlayerPaymentOrPartnership:true};
 if(!physical(s,p,b,q,minute)||!witnessValid(p,b,q)||!int(p.cashScales,100)||s.world.minutes%1440+120>1440||
  p.originalIndependentGradeExams?.some(x=>x.source.witnessHash===q.witnessHash||
   x.source.day===day&&x.source.beastId===beastId))
  throw Error('Actual individually authorised measured Grade, fresh same-day facility and paid original fee required');
 q.rngBefore=p.rngState;q.cashBefore=p.cashScales;
 q.humanChoice=Arr.humanChoice(p,q.witnessHash);
 q.beastChoice=q.humanChoice.accepted?Social.sapientChoice(b.sapientLife,Agency.profile(s,b).disposition):null;
 q.accepted=q.humanChoice.accepted&&q.beastChoice.outcome==='accepted';
 q.check=null;q.assessment=null;q.feeScales=q.accepted?100:0;
 if(q.accepted){
  p.cashScales-=100;
  const out=C.check(s,{modifier:q.spec.modifier,dc:q.spec.dc,independentRngOwner:p,privateDisplay:true,
   label:p.name+' original paid individual Grade examination'});
  const margin=out.roll+q.spec.modifier+C.naturalAdjustment(out.roll)-q.spec.dc;
  q.check={roll:out.roll,dc:q.spec.dc,modifier:q.spec.modifier,degree:C.degree(margin),success:margin>=0};
 }
 q.actualMinutes=q.accepted?120:5;q.endMinute=minute+q.actualMinutes;
 q.cashAfter=p.cashScales;q.humanRngAfter=p.rngState;
 q.result=q.accepted?(q.check.success?'verified':'inconclusive'):'declined';
 if(q.check?.success)q.assessment=receiptAssessment(b,q);
 const row={source:q,seal:hash(q)};
 p.originalIndependentGradeExams||=[];p.originalIndependentGradeExams.push(row);
 if(q.accepted){
  b.gradeExamLastMinute=minute;
  b.gradeExaminations||=[];
  b.gradeExaminations.push({worldMinute:q.endMinute,facility:site,
   outcome:q.result,check:{roll:q.check.roll,dc:q.spec.dc,degree:q.check.degree},
   origin:ORIGIN,actorId,sourceSeal:row.seal});
  if(b.gradeExaminations.length>20)b.gradeExaminations=b.gradeExaminations.slice(-20);
  if(q.check.success)b.contractGradeAssessment=structuredClone(q.assessment);
 }
 E.advance(s,q.actualMinutes);World.finalizeTime(s,minute);
 if(!verify(s,p))throw Error('Original independent paid individual Grade examination failed source replay');
 return {actorId,beastId,independentlyAccepted:q.accepted,verified:!!q.check?.success,
  elapsedMinutes:q.actualMinutes,paidScales:q.feeScales,noGradeFromSpeciesRarity:true,
  noOwnershipOrMagicalBond:true};
}
function privateStatus(s,p){
 if(!verify(s,p))throw Error('Original independent paid Grade assessment history altered');
 return (p.originalIndependentGradeExams||[]).map(x=>({beastId:x.source.beastId,
  sourceHash:x.seal,observedOutcome:x.source.result,
  examinedIndividualGrade:x.source.assessment?.grade??null,
  feeScales:x.source.feeScales,privateToGM:true,noSpeciesRarityOrAutomaticContract:true}));
}
module.exports={ORIGIN,WITNESS,verify,examine,paidSource,privateStatus};
