'use strict';
// Real GM person -> originally owned professional duties -> the SAME
// independent livelihood, work receipts and source checks. Disposable game.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine'),New=require('../scripts/new-campaign'),
 Rules=require('../rules'),Turn=require('../scripts/chat-turn'),
 People=require('../world/emergent-people'),Careers=require('../world/person-careers'),
 Realm=require('../world/simulation');
const s=New.create({seed:9283101,slug:'gm_witnessed_worker_duties_test',
 mode:'gm',age:28,gmOpening:{locationId:'crossing',
 scene:'Talia Vale surveys actual ferry routes and records the old bridge repairs at the river crossing while the player watches.',
 focus:'A working surveyor beside the ferry',weather:'Mild and overcast',
 hour:9,minute:25}}).state;
const act=(state,operation,params={})=>Rules.act(state,{system:'social',operation,params});
const seen=act(s,'introduceWitnessedPerson',{
 name:'Talia Vale',profession:'Travelling river bridge surveyor',
 purpose:'Record the actual condition of ferries and river bridges and help nearby people navigate documented routes.',
 personality:'Attentive, quiet and skeptical of unobserved promises.',
 background:'A travelling field professional with her own working commitments, habits and freedom to refuse invitations.',
 witness:'The GM saw Talia Vale surveying ferry routes and recording old bridge repairs in the original scene.'});
const npcId=seen.npcId,w=Realm.peek(s),
 person=w.emergentPeople.people[npcId.slice('emergent:'.length)];
A.equal(People.verify(w,person),true);
A.deepEqual(Careers.authoredDutyStatus(person),[],
 'A profession biography is not itself a proven executable task');
const originalScene='Talia Vale surveys actual ferry routes and records the old bridge repairs at the river crossing while the player watches.';
const duty={npcId,id:'observed_ferry_route_work',
 role:'River bridge route surveyor',method:'route-survey',domain:'trade',
 goal:'Observe the physical route conditions and document safe ferry travel for local workers.',
 witness:originalScene};
const before=E.exportGame(s),rng=s.rngState,
 funds=s.player.coins,minute=s.world.minutes,worldRng=w.rngState,
 personalRng=person.rngState;
A.throws(()=>act(s,'authorWitnessedPersonDuty',{...duty,
 effect:'instant-invented-ability'}),/duty needs only/);
A.throws(()=>act(s,'authorWitnessedPersonDuty',{...duty,
 witness:'No witnessed description of magical transport exists in the scene.'}),
 /actually introduced|witnessed professional scene/);
A.equal(E.exportGame(s),before);
const first=act(s,'authorWitnessedPersonDuty',duty);
A.equal(first.originalCareerOwner,true);
A.equal(first.noCompletedWork,true);
A.equal(first.noEmployerOrTeachingLicence,true);
A.equal(s.player.coins,funds);
A.equal(s.world.minutes,minute);
A.equal(s.rngState,rng);
A.equal(w.rngState,worldRng);
A.equal(person.rngState,personalRng);
A.equal(person.career.workReceipts.length,0);
A.equal(person.career.authoredDuties.length,1);
A.equal(person.career.authoredDuties[0].institutionId,null,
 'A real skill is not automatically a chartered academy or employer');
A.equal(Careers.verify(person),true);
A.throws(()=>act(s,'authorWitnessedPersonDuty',duty),
 /Invalid authored work|already|genuine|existing/);
const report=act(s,'witnessedPersonDutiesStatus',{npcId});
A.equal(report.known,true);
A.equal(report.witnessedDuties.length,1);
A.equal(report.witnessedDuties[0].status,'available');
A.equal(report.witnessedDuties[0].verifiedCompletedWork,0);
A.equal(report.noPrivateCompetenceOrNewWorkExposed,true);
// The exact real career work owner, not an invented labour or school-roll
// adapter, executes once through its established ecology/market mechanics.
const originalLive=E.importGame(E.exportGame(s));
const nextW=Realm.peek(originalLive),
 nextPerson=nextW.emergentPeople.people[person.id],
 outcome=Careers.work(nextW,nextPerson,Math.floor(originalLive.world.minutes/1440),
  'independent-duty');
A.equal(outcome.taskMethod,'route-survey');
A.equal(outcome.context,'independent-duty');
A.equal(outcome.noTechniqueOrSpellLearned,true);
A.equal(nextPerson.career.workReceipts.length,1);
A.equal(nextPerson.career.authoredDuties[0].workProofHashes.length,1);
A.equal(nextPerson.career.authoredDuties[0].workProofHashes[0],outcome.receiptHash);
A.equal(Careers.verify(nextPerson),true);
A.equal(People.verify(nextW,nextPerson),true);
A.equal(originalLive.player.coins,funds);
A.equal(originalLive.rngState,rng);
A.equal(originalLive.world.minutes,minute);
const broken=E.importGame(E.exportGame(originalLive));
broken.table.realm.emergentPeople.people[person.id].career.authoredDuties[0]
 .source.goal='A different fabricated job';
A.equal(Careers.verify(broken.table.realm.emergentPeople.people[person.id]),false);
// A real local observation may still be declined. The profession is now
// mechanically executable whenever the actual individual decides to work.
const observed=act(s,'observeLocalPersonWork',{npcId});
A.equal(observed.witnessed,true);
A.equal(observed.npcId,npcId);
A.equal(typeof observed.freelyAgreed,'boolean');
A.equal(s.rngState,rng,'Original worker uses own RNG, not player d20');
A.equal(s.player.coins,funds);
A.equal(People.verify(Realm.peek(s),Realm.peek(s).emergentPeople.people[person.id]),true);
if(observed.freelyAgreed){
 A.equal(person.career.workReceipts.length,1);
 A.equal(person.career.authoredDuties[0].workProofHashes.length,1);
 A.equal(observed.observed.work,'route-survey');
}else A.equal(person.career.workReceipts.length,0,
 'Refusal must not be rewritten as a secretly completed professional task');
const tmp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-gm-original-career-'));
try{
 const file=Path.join(tmp,'save.json');
 FS.writeFileSync(file,before+'\n');
 const request={id:'gm_witnessed_career_author_001',mode:'rule',system:'social',
  operation:'authorWitnessedPersonDuty',params:duty};
 const firstTurn=Turn.execute(file,request);
 A.equal(firstTurn.ok,true);A.equal(firstTurn.applied,true);
 A.equal(firstTurn.output.rules.originalCareerOwner,true);
 const saved=FS.readFileSync(file,'utf8');
 A.equal(Turn.execute(file,request).duplicate,true);
 A.equal(FS.readFileSync(file,'utf8'),saved);
 const inspect={id:'gm_witnessed_career_read_001',mode:'rule',
  system:'social',operation:'witnessedPersonDutiesStatus',params:{npcId}};
 const read=Turn.execute(file,inspect);
 A.equal(read.applied,false);
 A.equal(read.output.rules.witnessedDuties[0].method,'route-survey');
 A.equal(FS.readFileSync(file,'utf8'),saved);
 const retirementScene='Talia Vale says the old ferry route survey duty has ended after a completed local river inspection.';
 const checkpoint=Turn.execute(file,{id:'gm_witnessed_career_scene_001',
  mode:'checkpoint',scene:retirementScene,
  summary:'Talia Vale explains that the earlier survey duty is no longer offered.'});
 A.equal(checkpoint.applied,true);
 const retired=Turn.execute(file,{id:'gm_witnessed_career_retire_001',
  mode:'rule',system:'social',operation:'retireWitnessedPersonDuty',
  params:{npcId,id:duty.id,reason:retirementScene}});
 A.equal(retired.applied,true);
 A.equal(retired.output.rules.retired,true);
 const done=FS.readFileSync(file,'utf8'),final=E.importGame(done);
 A.equal(Turn.execute(file,{id:'gm_witnessed_career_read_002',mode:'rule',
   system:'social',operation:'witnessedPersonDutiesStatus',
   params:{npcId}}).output.rules.witnessedDuties[0].status,'retired');
 A.equal(Turn.execute(file,{id:'gm_witnessed_career_retire_001',
  mode:'rule',system:'social',operation:'retireWitnessedPersonDuty',
  params:{npcId,id:duty.id,reason:retirementScene}}).duplicate,true);
 A.equal(FS.readFileSync(file,'utf8'),done);
 const persisted=final.table.realm.emergentPeople.people[person.id];
 A.equal(Careers.verify(persisted),true);
 A.equal(persisted.career.authoredDuties[0].sourceHash,
  person.career.authoredDuties[0].sourceHash,
  'Retirement cannot rewrite or erase the original professional duty');
 A.equal(persisted.career.authoredDuties[0].status,'retired');
 A.equal(final.rngState,rng);
 A.equal(final.player.coins,funds);
 A.equal(final.world.minutes,minute);
}finally{FS.rmSync(tmp,{recursive:true,force:true});}
console.log('GM person career handoff: original witnessed duty, one independent real career work receipt, refusal respected, later sourced retirement, no invented jobs/powers/money/dice, private rank or replay');
