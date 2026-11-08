'use strict';
// Established world heritage matters in ordinary labour AND defensive
// action: authentic independent school-method reconstruction from actual
// source-proven civic practice, never a menu-awarded school secret, title,
// combat technique, family bloodline or free second turn.
// All save states in this test are disposable.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 Disc=require('../rules/disciplines'),Civic=require('../rules/world-practice'),
 Combat=require('../rules/combat'),Lore=require('../world/renown-and-practice'),
 Atlas=require('../world/atlas'),Turn=require('../scripts/chat-turn');
const act=(s,system,operation,params={})=>R.act(s,{system,operation,params});
const body=seed=>{
 const s=E.newGame({seed,name:'Independent Ashwind Rescue Practitioner',
  path:'body',background:'fieldworker'});
 R.unified.ensurePlayer(s);
 const p=s.player,c=s.table.combatants.player;
 p.body.cycles=['Muscle-Tendon Cycle','Bone-Marrow Cycle'];
 p.attributes.con=30;p.skills.survival.rank=5;
 p.maxStamina+=2;p.stamina+=2;c.maxStamina+=2;c.stamina+=2;
 c.toughness+=1;c.boxes[1]+=1;
 s.table.disciplineTraining||={};
 s.table.disciplineTraining.body={target:null,points:0,weeks:0,
  methods:{},cooldownUntil:0,complications:[],history:[
   {day:1,target:'cycle1',quality:'strong',
    change:'Completed Cycle I Muscle-Tendon refinement; +2 stamina, Might +1, M1 natural force'},
   {day:1,target:'cycle2',quality:'strong',
    change:'Completed Cycle II Bone-Marrow refinement; +1 Toughness, +1 Serious wound box'}
  ]};
 let earned=false;
 for(let i=0;i<12&&!earned;i++){
  const r=act(s,'body','organWork',{focus:'integrated',minutes:15,
   approach:'Build real resilience in my heart, lungs, kidneys and liver for rescue duty'});
  earned=r.completed;
 }
 A.equal(earned,true);
 A.equal(Disc.organEarned(s).cycle,3);
 A.equal(E.dispatch(s,'travel forest').ok,true);
 A.equal(E.dispatch(s,'travel hills').ok,true);
 R.unified.sync(s,{source:'legacy'});
 return s;
};
const job='ashwind_body_rescue',school='openpeak_rescue_breath';
const workArgs={
 id:job,minutes:90,
 approach:'On this actual volcanic hillside I carry a measured load uphill while monitoring my own heart, lungs, and breathing recovery, recording the verified effort carefully'
};
const schoolArgs={
 ...workArgs,schoolId:school,minutes:105,
 approach:'Independently reconstruct the publicly described Open Peak rescue breath by comparing my own repeated uphill load and actual organ-refinement observations, rather than claiming private teaching'
};
A.equal(Lore.M.organ_conditioning.institution,'open_peak');
A.equal(Lore.T[school].common,Lore.J[job].method);
A.equal(Atlas.I.open_peak.polity,'skyvillage');
A.equal(Atlas.R.ashwind.polity,'reedmarch',
 'This is an INDEPENDENT local equivalent, not a remote school visit');
{
 const s=E.newGame({seed:789201,name:'Never Trained',path:'undecided'});
 A.equal(E.dispatch(s,'travel forest').ok,true);
 A.equal(E.dispatch(s,'travel hills').ok,true);
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'world','culturalPractice',schoolArgs),
  /original full-body Organ Cycle|verified tissue-work/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=body(789202),atStart=E.exportGame(s),rng=s.rngState;
 for(const params of [
  schoolArgs,
  {...schoolArgs,schoolId:'sealwall_three_marks'},
  {...schoolArgs,schoolId:'manytracks_oaths'},
  {...schoolArgs,schoolId:'openpeak_rescue_breath',guaranteedMastery:true},
  {...schoolArgs,minutes:90}
 ]){
  A.throws(()=>act(s,'world','culturalPractice',params));
  A.equal(E.exportGame(s),atStart);
  A.equal(s.rngState,rng,
   'School names or fake credentials may not roll before real work evidence');
 }
 const first=act(s,'world','culturalPractice',workArgs);
 A.equal(first.energySpent,0);
 A.equal(first.noTechniqueLearned,true);
 A.ok(Number.isInteger(first.check.roll));
 let studied=(first.success&&['strong','exceptional'].includes(first.check.degree));
 for(let i=0;i<8&&!studied;i++){
  const r=act(s,'world','culturalPractice',workArgs);
  studied=r.success&&['strong','exceptional'].includes(r.check.degree);
 }
 A.equal(studied,true,'At least one honest strong original rescue assessment is available');
 const can=act(s,'world','culturalPracticeStatus',{id:job});
 const open=can.possibleWork[0].publiclyIdentifiedSchoolApplications
  .find(x=>x.id===school);
 A.ok(open);
 A.equal(open.mode,'independent equivalent study from public school account');
 A.equal(open.realPriorWorkEvidence,true);
 A.equal(open.personallyApplied,false);
 A.equal(Civic.earnedSchoolApplication(s,school),false);
 const before=E.exportGame(s),oldRng=s.rngState;
 for(const bad of [
  {...schoolArgs,schoolId:'sealwall_three_marks'},
  {...schoolArgs,method:'arcane_circles'},
  {...schoolArgs,teacherStatus:'legendary immortal'}
 ]){
  A.throws(()=>act(s,'world','culturalPractice',bad));
  A.equal(E.exportGame(s),before);A.equal(s.rngState,oldRng);
 }
 const started=s.world.minutes,stamina=s.player.stamina;
 const originalMod=Math.floor((s.player.attributes.con-10)/2)+
   2*s.player.skills.survival.rank;
 let practiced=null;
 for(let i=0;i<7&&!practiced;i++){
  const r=act(s,'world','culturalPractice',schoolArgs);
  A.ok(Number.isInteger(r.check.roll));
  A.equal(r.check.dc,16);
  A.equal(r.check.modifier,originalMod+1);
  A.equal(r.schoolBonusApplied,1);
  A.equal(r.staminaSpent,4);
  A.equal(r.minutes,105);
  A.equal(r.noInstitutionalTeachingOrMembership,true);
  A.equal(r.noTechniqueLearned,true);
  practiced=r.success?r:null;
 }
 A.ok(practiced,'The original honest check, not the player, determines whether the new method worked');
 const record=s.table.realm.culturalPractice.reports.at(-1);
 A.equal(record.receipt.methodId,'organ_conditioning');
 A.equal(record.receipt.school.traditionId,school);
 A.equal(record.receipt.school.bonus,1);
 A.equal(record.receipt.school.privateTeachingClaimed,false);
 A.equal(record.receipt.school.witnesses.length>=1,true);
 A.ok(Civic.verifyReport(record));
 A.equal(Civic.earnedSchoolApplication(s,school),true);
 const status=act(s,'world','culturalPracticeStatus',{id:job});
 A.equal(status.possibleWork[0].publiclyIdentifiedSchoolApplications[0].personallyApplied,true);
 const snapshot=E.exportGame(s),postRng=s.rngState;
 const heritage=act(s,'world','heritage',{type:'school',id:school});
 A.equal(heritage.entries[0].notAnInheritedSkill,true);
 A.equal(heritage.entries[0].notPersonallyEarnedFromReading,true);
 A.equal(E.exportGame(s),snapshot);A.equal(s.rngState,postRng);
 const forgery=E.importGame(snapshot);
 const witness=forgery.table.realm.culturalPractice.reports.at(-1);
 witness.receipt.school.witnesses[0].receipt.check.roll=20;
 A.equal(Civic.verifyReport(witness),false);
 A.equal(Civic.earnedSchoolApplication(forgery,school),false);
 const forgedRank=E.importGame(snapshot);
 forgedRank.player.body.cycles=[];
 A.equal(Civic.earnedSchoolApplication(forgedRank,school),true,
  'The original school work remains historical evidence despite later physiology; its USABLE effect still needs genuine current organ anatomy');
 const statusSchool=E.importGame(snapshot),baseline=E.importGame(before);
 // Body III contributes one existing ordinary Recover benefit.
 // Authentic individually demonstrated rescue breathing adds exactly
 // one further Stamina to that very same single Recover action.
 for(const x of [baseline,statusSchool]){
  x.table.combatants.player.stamina=10;
  x.player.stamina=10;
  x.table.combatants.player.recoverUses=0;
 }
 const raw=Combat.recover(baseline,{id:'player'});
 const developed=Combat.recover(statusSchool,{id:'player'});
 A.equal(developed.gained,raw.gained+1);
 A.equal(developed.uses,1);
 A.equal(Combat.recover(statusSchool,{id:'player'}).gained,0);
 A.equal(statusSchool.player.humanEvolution.stage,0);
 A.equal(statusSchool.player.origin.phase,0);
 A.deepEqual(statusSchool.player.body.cycles,
  ['Muscle-Tendon Cycle','Bone-Marrow Cycle','Organ Cycle']);
 // The same source survives a save/load, while unsupported formula claims
 // and altered bloodlines do not acquire professional status.
 const saved=E.importGame(snapshot);
 A.equal(Civic.earnedSchoolApplication(saved,school),true);
 A.equal(saved.table.realm.culturalPractice.schoolProofs[school].report.receipt.school.traditionId,school);
 // World careers outlast the bounded rolling report list. The ORIGINAL
 // verified demonstration remains within the same professional archive.
 const compacted=E.importGame(snapshot);
 compacted.table.realm.culturalPractice.reports=[];
 A.equal(Civic.earnedSchoolApplication(compacted,school),true);
 const corruptPermanent=E.importGame(E.exportGame(compacted));
 corruptPermanent.table.realm.culturalPractice.schoolProofs[school]
  .report.receipt.originalRollEvent.details.roll=20;
 A.equal(Civic.earnedSchoolApplication(corruptPermanent,school),false);
 A.equal(saved.player.qualifications.some(x=>x==='open_peak'),false);
 A.equal(saved.player.arcane.circles,0);
 A.equal(saved.player.meridian.stage,0);
 const report=record;
 A.equal(report.reviewedDay,null);
 // There is genuine intercontinental courier lag to the remote Open Peak
 // institution; reports do not become instant praise or permission.
 R.world.advance(s,6);
 A.equal(report.reviewedDay,null);
 R.world.advance(s,30);
 A.ok(Number.isInteger(report.reviewedDay));
 A.ok(report.response.length>8);
 A.equal(s.table.realm.institutions.open_peak.status==='active'||s.table.realm.institutions.open_peak.status==='suspended',true);
}
{
 // Same unique ID is an immutable private turn receipt, not two
 // independent attempts to claim a legendary academy technique.
 const s=body(789203);
 let source=null;
 for(let i=0;i<9&&!source;i++){
  const r=act(s,'world','culturalPractice',workArgs);
  source=r.success&&['strong','exceptional'].includes(r.check.degree)?r:null;
 }
 A.ok(source);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-heritage-school-'));
 try{
  const file=Path.join(dir,'disposable.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const req={id:'school_heritage_independent_789203',mode:'rule',
   system:'world',operation:'culturalPractice',params:schoolArgs};
  const first=Turn.execute(file,req);
  A.equal(first.ok,true);A.equal(first.applied,true);
  A.ok(Number.isInteger(first.output.rules.check.roll));
  const persisted=FS.readFileSync(file,'utf8');
  const second=Turn.execute(file,req);
  A.equal(second.duplicate,true);A.equal(second.applied,false);
  A.equal(FS.readFileSync(file,'utf8'),persisted);
  const restored=E.importGame(persisted);
  A.ok(restored.table.realm.culturalPractice.reports.at(-1).receipt.school);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Cultural school practice: original ordinary work -> independent recognised syllabus method -> authentic practical benefit -> bounded combat Recover; individual source, distant transport and private replay');
