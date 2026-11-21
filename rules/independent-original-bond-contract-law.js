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
function gradeAt(b,assessment,minute){
 if(!assessment||!int(assessment.grade,1,9)||!int(assessment.worldMinute,0,minute)||
  typeof assessment.source!=='string'||assessment.source.trim().length<18||
  assessment.species!==b.species||assessment.evolutionStage!==b.evolutionStage||
  assessment.individualGrade!==b.individualGrade)return null;
 return {grade:assessment.grade,gradeSeal:hash(assessment)};
}
function inputs(s,p,b,minute,assessment,depth,usedCapacity){
 const soul=soulAt(s,p,minute),grade=gradeAt(b,assessment,minute);
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
