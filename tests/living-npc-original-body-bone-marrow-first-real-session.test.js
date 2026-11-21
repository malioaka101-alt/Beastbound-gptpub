'use strict';
// A genuine Body Cycle I rite followed by a truly independent first
// Bone–Marrow Cycle II action (not a full 180-point completion).
// Original Cycle I historical preparation in the fixture is a disclosed,
// source-replayable synthetic *prehistory*. After it, no session, focus,
// roll, wound, result or sleep outcome is selected.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine'),Rules=require('../rules'),World=require('../rules/world'),
 Realm=require('../world/simulation'),Lives=require('../world/independent-person-lives'),
 Early=require('../rules/independent-original-discipline-preparation'),
 Two=require('../rules/independent-original-body-cycle-two'),
 Health=require('../rules/unified');
const {fixture}=require('./living-npc-original-soul-body-rift-first-milestones.test.js');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const {s,p,day}=fixture('body','breakthrough',973165);
const original=Rules.act(s,{system:'discipline',
 operation:'npcOriginalFirstMilestone',
 params:{actorId:p.actorId,system:'body'}});
A.equal(original.observedOutcome,'breakthrough');
const world=Realm.peek(s),life=world.independentPersonLives.people[p.id];
life.lastDay=day;
A.equal(Lives.verifyEntry(world,life),true);
const start=s.world.minutes,evening=day*1440+990;
A.ok(evening>start);
E.advance(s,evening-start);World.finalizeTime(s,start);
const witness=p.name+
 ' personally chooses a genuinely safe room at home for eight hours of sleep, observed while preparing for bed.';
s.chatRuntime.scene='A real safe home and visible original rest opportunity: '+witness;
const night=Rules.act(s,{system:'health',
 operation:'witnessedNpcNightSleep',params:{actorId:p.actorId,witness}});
A.equal(night.freelyAccepted,true,'This native test person really accepted the original shelter choice');
let accepted=null,days=0;
for(let interval=0;interval<20&&!accepted;interval++){
 const before=s.world.minutes;
 E.advance(s,10*1440);World.finalizeTime(s,before);
 days+=10;
 accepted=p.originalBodyCycleTwo?.sessions?.find(x=>
  x.source.origin===Two.ORIGIN&&x.source.target==='cycle2-practice'&&
  x.source.accepted===true);
}
A.ok(accepted,'An original independent Bone–Marrow II practice was never personally chosen after '+days+' genuine world days');
const q=accepted.source;
A.equal(accepted.seal,hash(q));
A.equal(q.system,'body');
A.equal(q.target,'cycle2-practice');
A.equal(q.staminaSpent,1);
A.equal(q.staminaAfter,q.staminaBefore-1);
A.equal(q.actualMinutes,120);
A.equal(q.check.success,typeof q.check.success==='boolean');
A.equal(q.offscreenOpportunity.kind,'body');
A.equal(q.originalShiftHash,q.offscreenOpportunity.originalShiftHash);
A.equal(q.originalSceneHash,hash(q.offscreenOpportunity));
A.equal(q.noOtherPowerOrLearnedTechniqueGranted,true);
A.equal(Two.verify(s,p),true);
A.equal(Early.verify(s,p),true);
A.ok(!p.originalBodyCycleTwo.completed,
 'A single early Body II practice cannot grant the 180-point Bone–Marrow breakthrough');
A.deepEqual(p.knownTechniques,[]);
const saved=E.exportGame(s),restored=E.importGame(saved),
 person=Realm.peek(restored).emergentPeople.people[p.id];
A.equal(Two.verify(restored,person),true);
const forged=E.importGame(saved),
 fake=Realm.peek(forged).emergentPeople.people[p.id],
 row=fake.originalBodyCycleTwo.sessions.find(x=>x.source.accepted);
row.source.check.dc=1;row.seal=hash(row.source);
A.equal(Two.verify(forged,fake),false,
 'Changing a sealed native Bone–Marrow DC cannot bypass original owner replay');
console.log('Original real independent Body I -> first source-paid Bone–Marrow II session, NPC-owned RNG, actual Combat Stamina, true shelter, source replay/save/tamper PASS; '+days+' days');
