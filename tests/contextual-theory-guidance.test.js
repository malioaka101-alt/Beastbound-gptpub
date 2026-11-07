'use strict';
// An individual's knowledge, practical power and teaching ability are
// different. Witnessed relevant theory can help a learner's own effort,
// while self-discovery stays viable. All rolls remain engine-owned.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),
 Turn=require('../scripts/chat-turn');
const npc=(s,id)=>R.act(s,{system:'npc',operation:'converse',params:{npcId:id}});
const gate=(s,params)=>R.act(s,{system:'meridian',operation:'gatePractice',params});
const practice=(s,params)=>R.act(s,{system:'discipline',operation:'practice',params});
function fresh(seed=771231){
 const s=E.newGame({seed,name:'Theory Versus Practice Fixture',path:'undecided'});
 R.unified.ensurePlayer(s);s.world.location='academy';return s;
}
function stageTwo(seed){
 const s=fresh(seed);
 // Isolated genuine stage-II anatomy fixture. Earlier rite mechanics
 // are covered by source-parity tests and cannot be bypassed in play.
 s.player.meridian.stage=2;s.player.meridian.gates=[];
 s.table.powerPhysiology={meridian:{foundationQuality:'Firm',
  primaryMapped:12,gateRecords:[],deviationHistory:[]}};
 return s;
}
{
 const s=stageTwo(771231),initial=E.exportGame(s),rng=s.rngState;
 for(const guidanceId of ['sera','elira','imaginary_mentor']){
  A.throws(()=>gate(s,{guidanceId}),/actual witnessed|source-backed/);
  A.equal(E.exportGame(s),initial);
  A.equal(s.rngState,rng);
 }
 // No teacher is required to practise successfully in the same location.
 const independent=gate(s,{minutes:15});
 A.equal(independent.theoreticalGuidance,null);
 A.equal(independent.tuitionTalons,0);
 A.equal(independent.check.roll>=1&&independent.check.roll<=20,true);
}
{
 A.equal(E.NPCS.sera.profession,'Meridian anatomist');
 A.equal(E.NPCS.sera.stage,undefined,
  'recorded anatomical expertise does not fabricate a cultivation stage');
 const student=stageTwo(771232),control=stageTwo(771232);
 A.equal(npc(student,'sera').noRoll,true);
 A.equal(npc(control,'sera').noRoll,true);
 A.equal(student.rngState,control.rngState);
 const before=E.exportGame(student),rng=student.rngState;
 A.throws(()=>gate(student,{guidanceId:'elira'}),/source-backed/);
 A.equal(E.exportGame(student),before);A.equal(student.rngState,rng);
 const guided=gate(student,{guidanceId:'sera',minutes:15}),
  solo=gate(control,{minutes:15});
 A.equal(guided.check.roll,solo.check.roll);
 A.equal(guided.check.modifier,solo.check.modifier+1);
 A.equal(guided.theoreticalGuidance.bonus,1);
 A.equal(guided.theoreticalGuidance.practitionerRankClaimed,false);
 A.equal(guided.theoreticalGuidance.aDemonstration,false);
 A.equal(guided.theoreticalGuidance.automaticLearning,false);
 A.equal(guided.route,'independent');
 A.equal(guided.tuitionTalons,solo.tuitionTalons);
 A.equal(student.world.minutes,control.world.minutes);
 const saved=E.importGame(E.exportGame(student));
 A.deepEqual(saved.table.npcConversations,student.table.npcConversations);
 A.deepEqual(saved.npcKnowledge,student.npcKnowledge);
}
{
 const student=fresh(771233),control=fresh(771233);
 npc(student,'sera');npc(control,'sera');
 const guided=practice(student,{system:'meridian',method:'breath',
  route:'independent',guidanceId:'sera'});
 const solo=practice(control,{system:'meridian',method:'breath',
  route:'independent'});
 A.equal(guided.check.roll,solo.check.roll);
 A.equal(guided.check.modifier,solo.check.modifier+1);
 A.equal(guided.theoreticalGuidance.kind,'witnessed-relevant-theory');
 A.equal(guided.feeTalons,0);
 A.equal(solo.feeTalons,0);
 A.equal(student.player.meridian.stage,0);
 A.equal(control.player.meridian.stage,0);
}
{
 const student=fresh(771234),control=fresh(771234);
 npc(student,'sera');npc(control,'sera');
 for(const s of [student,control]){
  s.table.disciplineTraining={meridian:{target:'foundation',points:40,
   weeks:10,methods:{breath:2,tissue:2},cooldownUntil:0,
   complications:[],history:[]}};
 }
 const guided=R.act(student,{system:'discipline',operation:'breakthrough',
  params:{system:'meridian',route:'independent',guidanceId:'sera'}}),
  solo=R.act(control,{system:'discipline',operation:'breakthrough',
   params:{system:'meridian',route:'independent'}});
 A.equal(guided.check.roll,solo.check.roll);
 A.equal(guided.check.modifier,solo.check.modifier+1);
 A.equal(guided.theoreticalGuidance.sourceId,'sera');
 A.equal(guided.feeTalons,0);
 A.equal(solo.feeTalons,0);
}
{
 // A surveyor's bounded rift theory can help with boundary observation
 // without asserting that the surveyor herself has achieved a Rift rank.
 const student=fresh(771235),control=fresh(771235);
 student.world.location='ruins';control.world.location='ruins';
 npc(student,'iskra');npc(control,'iskra');
 A.equal(E.NPCS.iskra.step,undefined);
 const guided=practice(student,{system:'rift',method:'anchor-theory',
   route:'independent',guidanceId:'iskra'}),
  solo=practice(control,{system:'rift',method:'anchor-theory',
   route:'independent'});
 A.equal(guided.check.roll,solo.check.roll);
 A.equal(guided.check.modifier,solo.check.modifier+1);
 A.equal(guided.theoreticalGuidance.aDemonstration,false);
}
{
 // Tampering with a claimed teacher or hearsay is not a shortcut.
 const s=stageTwo(771236);
 npc(s,'sera');
 s.npcKnowledge['Professor Sera'][0].fact='An imaginary lesson granting ten Gates';
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>gate(s,{guidanceId:'sera'}),/not part of the learner/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=stageTwo(771237);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-advice-'));
 try{
  const file=Path.join(dir,'checkpoint.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const talk={id:'scholar_conversation_771237',mode:'rule',
   system:'npc',operation:'converse',params:{npcId:'sera'}};
  const heard=Turn.execute(file,talk);
  A.equal(heard.applied,true);
  const request={id:'scholar_gate_work_771237',mode:'rule',
   system:'meridian',operation:'gatePractice',
   params:{minutes:20,guidanceId:'sera'}};
  const effort=Turn.execute(file,request);
  A.equal(effort.applied,true);
  A.equal(effort.output.rules.theoreticalGuidance.sourceId,'sera');
  const checkpoint=FS.readFileSync(file,'utf8');
  A.equal(Turn.execute(file,request).duplicate,true);
  A.equal(FS.readFileSync(file,'utf8'),checkpoint);
  const restored=E.importGame(checkpoint);
  A.equal(restored.world.minutes,s.world.minutes+12+20);
  A.equal(restored.table.npcConversations.records.length,1);
  A.equal(restored.table.meridianGateTraining.gate>=1,true);
  const cheat={...request,id:'unheard_scholar_771237',
   params:{minutes:20,guidanceId:'unknown_person'}};
  A.throws(()=>Turn.execute(file,cheat),/source-backed/);
  A.equal(FS.readFileSync(file,'utf8'),checkpoint);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
{
 // This person is created ONLY in this isolated fixture, not in the world's
 // canonical roster or anyone's campaign. A broadly read non-practitioner
 // has real public material on two distinct fields, no magical rank, and
 // their verified explanation can help either field without name whitelists.
 const id='fixture_comparative_scholar';
 E.NPCS[id]={
  name:'Theoretical Archivist',
  location:'academy',
  profession:'Comparative scholar',
  topic:'Meridian Gate anatomy and Arcane Mana Circle geometry share some abstract mapping ideas, although each discipline has its own actual structure.',
  publicExpertise:['meridian','arcane'],
  goal:'Compare diverse traditions',
  temperament:'careful, scholarly'
 };
 try{
  A.equal(E.NPCS[id].stage,undefined);
  A.equal(E.NPCS[id].circles,undefined);
  for(const [system,method] of [['arcane','formulae'],['meridian','circulation']]){
   const student=fresh(771240,undefined),solo=fresh(771240,undefined);
   A.equal(npc(student,id).noRoll,true);
   A.equal(npc(solo,id).noRoll,true);
   const guided=practice(student,{system,method,route:'independent',
      guidanceId:id,minutes:30}),
    self=practice(solo,{system,method,route:'independent',minutes:30});
   A.equal(guided.check.roll,self.check.roll);
   A.equal(guided.check.modifier,self.check.modifier+1);
   A.equal(guided.theoreticalGuidance.sourceId,id);
   A.equal(guided.theoreticalGuidance.practitionerRankClaimed,false);
   A.equal(student.world.minutes,solo.world.minutes);
  }
  // Public subject evidence, not a player's asserted label, determines
  // which fields are actually informed.
  const bad=fresh(771241);
  npc(bad,id);
  bad.world.location='ruins'; // Actual Rift environment, but irrelevant advice.
  const snapshot=E.exportGame(bad),rng=bad.rngState;
  A.throws(()=>practice(bad,{system:'rift',method:'boundaries',
     route:'independent',guidanceId:id,minutes:15}),
    /source-backed/);
  A.equal(E.exportGame(bad),snapshot);A.equal(bad.rngState,rng);
 }finally{delete E.NPCS[id];}
}
{
 // Generic professional PP calculation also distinguishes the teacher's
 // verified knowledge and clarity from an independently earned stage. The
 // calculator is pure; game actions must NOT accept user-selected scores.
 const PP=R.progress.trainingPP;
 A.equal(PP({currentRank:1,comprehension:3}),2);
 A.equal(PP({currentRank:1,teacherKnowledge:5,teachingClarity:5,
  teacherRank:null,comprehension:3}),5);
 A.equal(PP({currentRank:1,teacherRank:5,teachingClarity:0,
  comprehension:3}),2);
 A.equal(PP({currentRank:1,teacherRank:5,teacherKnowledge:5,
  teachingClarity:5,comprehension:5}),6);
 A.equal(PP({currentRank:1,teacherKnowledge:6,teachingClarity:0,
  comprehension:3}),2);
 A.throws(()=>PP({currentRank:1,teacherKnowledge:999}),/knowledge/);
}
{
 // Institutional capacity is not evidence of a particular living teacher.
 // A thriving school with no separately witnessed instructor must not mint
 // a fictional high-rank mentor for background professional advancement.
 const Notables=require('../world/notables');
 const s=fresh(771242),world=R.realm.ensure(s);
 const n=Object.values(world.notables).find(p=>
  world.institutions[p.institution]&&world.countries[p.polity]);
 A.ok(n);
 const inst=world.institutions[n.institution],country=world.countries[n.polity];
 inst.status='active';inst.capacity=90;country.stability=80;
 n.professional.rank=1;n.professional.pp=0;
 Notables.update(world,30,()=>0.5,()=>{});
 A.equal(n.professional.rank,1);
 A.equal(n.professional.pp,2,
  'no invented higher-rank teacher from institutional capacity alone');
 A.equal(n.discipline.stage,0);
}
console.log('Sourced theoretical experts can help genuine personal learning with no practised rank or mandatory teacher; private rolls and checkpoints verified');
