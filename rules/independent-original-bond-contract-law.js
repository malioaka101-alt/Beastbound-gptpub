'use strict';
// Original contract inputs derived from the same proven individual source
// owners. No occupation-derived lore, species-rarity grade or current Soul
// stage applied retroactively to an old contract.
const Crypto=require('node:crypto'),B=require('./bonds'),Build=require('./build'),
 Early=require('./independent-original-discipline-preparation'),
 Thread=require('./independent-original-soul-thread-two'),
 Lattice=require('./independent-original-soul-lattice-three'),
 Higher=require('./independent-original-higher-architectures');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 end=q=>q.endMinute??((q.startMinute??q.minute)+q.actualMinutes),
 int=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b;
function soulAt(s,p,minute){
 if(!Early.verify(s,p)||!Thread.verify(s,p)||!Lattice.verify(s,p)||
  p.originalSoulHigherArchitecture&&!Higher.verify(s,p,'soul'))return null;
 let phase=0,sourceSeal=null;
 const first=p.originalFirstPowerMilestones?.soul;
 if(first){
  const row=p.originalEarlyDisciplinePreparation?.soul?.sessions.find(x=>x.seal===first.originalSourceHash);
  if(!row||!Number.isInteger(end(row.source)))return null;
  if(end(row.source)<=minute){phase=1;sourceSeal=row.seal;}
 }
 const second=p.originalSoulThreadTwo?.sessions.find(x=>x.source.origin===Thread.ORIGIN&&x.source.completedAfter===true);
 if(second&&end(second.source)<=minute){phase=2;sourceSeal=second.seal;}
 const third=p.originalSoulLatticeThree?.sessions.find(x=>x.source.origin===Lattice.ORIGIN&&x.source.formedAfter===true);
 if(third&&end(third.source)<=minute){phase=3;sourceSeal=third.seal;}
 for(const row of p.originalSoulHigherArchitecture?.sessions||[]){
  const q=row.source;
  if(q.origin===Higher.ORIGIN&&q.kind==='form'&&q.check?.success&&end(q)<=minute&&q.after.stage>phase){
   phase=q.after.stage;sourceSeal=row.seal;
  }
 }
 return {phase,sourceSeal};
}
function gradeAt(b,assessment,minute,s=null,p=null){
 const GradeExam=require('./independent-original-beast-grade-exam'),
  independent=assessment?.origin===GradeExam.ORIGIN;
 const paid=independent&&p?.originalIndependentGradeExams?.find(x=>
  x.source?.assessment&&JSON.stringify(x.source.assessment)===JSON.stringify(assessment));
 if(independent&&(!s||!paid||!GradeExam.paidSource(s,p,b,paid)))return null;
 // An individual Grade field is NOT a measured Grade. The only current
 // original numeric exam owner is rules/bond-grade.js; require its actual
 // calibrated prior and successful, paid, 120-minute examination receipt.
 const calibration=b?.gradeCalibration,exam=b?.gradeExaminations?.find(x=>
  x.worldMinute===assessment?.worldMinute&&x.outcome==='verified'&&
  x.facility===assessment?.facility&&x.check?.roll===assessment?.examCheck?.roll&&
  x.check?.dc===assessment?.examCheck?.dc);
 if(!assessment||!['observed-independent-grade-exam',GradeExam.ORIGIN].includes(assessment.origin)||
  !int(assessment.grade,1,9)||!int(assessment.worldMinute,0,minute)||
  assessment.worldMinute<120||
  !['crossing','academy'].includes(assessment.facility)||
  !exam||!int(exam.check.roll,1,20)||
  exam.check.dc!==12+2*assessment.grade||
  (independent&&(exam.sourceSeal!==paid.seal||exam.actorId!==p.actorId||exam.origin!==GradeExam.ORIGIN))||
  !int(calibration?.worldMinute,0,assessment.worldMinute-120)||
  calibration?.grade!==assessment.grade||
  calibration.species!==assessment.species||
  calibration.evolutionStage!==assessment.evolutionStage||
  calibration.individualGrade!==assessment.individualGrade||
  assessment.calibrationMinute!==calibration.worldMinute||
  assessment.species!==b.species||assessment.evolutionStage!==b.evolutionStage||
  assessment.individualGrade!==b.individualGrade||
  typeof calibration.source!=='string'||calibration.source.trim().length<18||
  assessment.source!==('Individual Grade '+assessment.grade+
   ' verified at '+assessment.facility+' after d20 '+exam.check.roll+
   ' vs DC '+exam.check.dc+', against prior independent calibration: '+
   calibration.source.trim().slice(0,120)))
  return null;
 return {grade:assessment.grade,gradeSeal:hash(assessment)};
}
function inputs(s,p,b,minute,assessment,depth,usedCapacity){
 const soul=soulAt(s,p,minute),grade=gradeAt(b,assessment,minute,s,p);
 if(!soul||!grade)return null;
 const will=Math.floor((p.mechanicalFoundation.baselineAttributes.wis-10)/2),
  soulDB=Build.soulProfile(soul.phase,{will}).disciplineBonus;
 // No independently verified Contract Lore skill owner yet. Rank zero is
 // absence of an earned bonus, not a limit on future study.
 const spec=B.contractSpec({grade:grade.grade,sapience:b.sapience,depth,will,
  contractLore:0,soulDB,soulPhase:soul.phase,usedCapacity,bonuses:0});
 return {soul,grade,will,soulDB,spec};
}
module.exports={soulAt,gradeAt,inputs};
