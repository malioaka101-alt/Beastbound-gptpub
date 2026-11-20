'use strict';
// Real one-use original Combat Recover after an independently chosen rest
// DAY at a remote Riftglass exterior. There is NO fake eight-hour shelter,
// player recovery, owned extra RNG roll, automatic anchor or stage grant.
// Earlier Step I preparation in this disposable test is the specifically
// labeled source-replay historical fixture; the actual Step I rite, sensed
// exterior check and subsequent daily life are all original lived actions.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine'),Rules=require('../rules'),World=require('../rules/world'),
 Realm=require('../world/simulation'),Lives=require('../world/independent-person-lives'),
 Early=require('../rules/independent-original-discipline-preparation'),
 Sense=require('../rules/independent-original-rift-sense-observation'),
 Recovery=require('../rules/independent-original-riftglass-one-recover');
const {fixture}=require('./living-npc-original-soul-body-rift-first-milestones.test.js');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const {s,p,day}=fixture('rift','breakthrough',973800);
const rite=Rules.act(s,{system:'discipline',
 operation:'npcOriginalFirstMilestone',
 params:{actorId:p.actorId,system:'rift'}});
A.equal(rite.observedOutcome,'breakthrough');
const w=Realm.peek(s),life=w.independentPersonLives.people[p.id];
life.lastDay=day;
A.equal(Lives.verifyEntry(w,life),true);
const start=s.world.minutes;
E.advance(s,180*1440);World.finalizeTime(s,start);
A.equal(Early.verify(s,p),true);
A.equal(Sense.verify(s,p),true);
A.equal(Recovery.verify(s,p),true);
const record=p.originalRiftglassRecover;
A.ok(record,"The actually earned sensing practitioner\x27s own rest days should allow one legal original Combat Recover");
const q=record.source,body=s.table.combatants['npc_'+p.id];
A.equal(record.seal,hash(q));
A.equal(q.independentRestDay.action,'rest');
A.equal(q.independentRestDay.actorId,p.actorId);
A.equal(q.independentRestDay.identityHash,p.originHash);
A.equal(q.independentRestDayHash,hash(q.independentRestDay));
A.equal(q.originalShiftHash,q.originalShiftProof.hash);
A.equal(q.originalShiftProof.originHash,p.originHash);
A.equal(q.originalShiftProof.location,'ruins');
A.equal(q.originalShiftHash,hash(Object.fromEntries(
 Object.entries(q.originalShiftProof).filter(([k])=>k!=='hash'))));
A.ok(p.originalRiftMeasuredSense.attempts.some(x=>
 x.seal===q.originalRiftSenseSourceHash&&x.source.accepted&&
 x.source.day<q.day));
A.equal(q.recoverUsesBefore,0);A.equal(q.recoverUsesAfter,1);
A.equal(body.recoverUses,1,'Only one original Recover can be spent until a real completed night');
A.equal(q.actualOriginalRecoverGain,Math.min(q.maximumStamina,
 q.staminaBefore+Math.max(0,2+q.vigorAtAttempt))-q.staminaBefore);
A.deepEqual(q.woundsAfter,q.woundsBefore);
A.equal(q.noUnverifiedShelterNightOrWoundHealing,true);
A.equal(q.noAdditionalWorldTimeOrAnotherAction,true);
A.equal(q.noQiManaSoulOrFreeSpatialPower,true);
A.equal((p.originalOffscreenCombatNights||[]).length,0);
A.equal((p.originalOvernightRestDecisions||[]).length,0);
A.deepEqual(p.knownTechniques,[]);
const saved=E.exportGame(s),replayed=E.importGame(saved),
 rp=Realm.peek(replayed).emergentPeople.people[p.id];
A.equal(Recovery.verify(replayed,rp),true);
A.deepEqual(rp.originalRiftglassRecover,record);
const falsified=E.importGame(saved),
 fp=Realm.peek(falsified).emergentPeople.people[p.id];
fp.originalRiftglassRecover.source.actualOriginalRecoverGain+=4;
fp.originalRiftglassRecover.seal=
 hash(fp.originalRiftglassRecover.source);
A.equal(Recovery.verify(falsified,fp),false,
 'Resealed invented Stamina recovery must not alter original Combat Recover');
const falsePlace=E.importGame(saved),
 forgedPlace=Realm.peek(falsePlace).emergentPeople.people[p.id];
forgedPlace.originalRiftglassRecover.source.originalShiftProof.location='fen';
forgedPlace.originalRiftglassRecover.seal=
 hash(forgedPlace.originalRiftglassRecover.source);
A.equal(Recovery.verify(falsePlace,forgedPlace),false,
 'A resealed alternative location is not authentic source-owned Riftglass rest');
console.log('Authentic Riftglass independent rest DAY => exactly ONE original Combat Recover, no overnight campsite, replay/import/forged-recovery rejection PASS');
