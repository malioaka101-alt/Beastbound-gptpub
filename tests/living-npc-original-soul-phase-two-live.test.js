'use strict';
// A disposable SOURCE-REPLAYED Phase I fixture (its earlier preparation is
// explicitly test-only) makes a TRUE original first-milestone check. From
// then on, later NPC life choices are real daily owner outcomes: no chosen
// Soul focus, d20, technique, success, claimed private witness or PC clock.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine'),Rules=require('../rules'),World=require('../rules/world'),
 Realm=require('../world/simulation'),Lives=require('../world/independent-person-lives'),
 Early=require('../rules/independent-original-discipline-preparation'),
 Soul=require('../rules/independent-original-soul-thread-two'),
 Foundation=require('../world/person-mechanical-foundations');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const {fixture}=require('./living-npc-original-soul-body-rift-first-milestones.test.js');
const {s,p,day}=fixture('soul','breakthrough',971800);
const outcome=Rules.act(s,{system:'discipline',operation:'npcOriginalFirstMilestone',
 params:{actorId:p.actorId,system:'soul'}});
A.equal(outcome.observedOutcome,'breakthrough');
A.equal(p.originalFirstPowerMilestones.soul.phase,1);
A.equal(Early.verify(s,p),true);
const life=Realm.peek(s).independentPersonLives.people[p.id];
// This is the disposable fixture's explicitly historical day cursor,
// never an authorization to backfill a real campaign.
life.lastDay=day;
A.equal(Lives.verifyEntry(Realm.peek(s),life),true);
let witnessed=null;
for(let i=0;i<130;i++){
 const before=s.world.minutes;
 E.advance(s,1440);World.finalizeTime(s,before);
 const rows=p.originalSoulThreadTwo?.sessions||[];
 const latest=rows.find(x=>x.source.origin===Soul.ORIGIN);
 if(latest){witnessed=latest;break;}
}
A.ok(witnessed,'A truly autonomous completed life day must eventually offer Soul II work');
A.equal(witnessed.seal,hash(witnessed.source));
A.equal(witnessed.source.offscreenOpportunity.kind,'soul');
A.equal(witnessed.source.originalShiftHash,
 witnessed.source.offscreenOpportunity.originalShiftHash);
A.equal(witnessed.source.originalSceneHash,
 hash(witnessed.source.offscreenOpportunity));
A.equal(witnessed.source.focus,witnessed.source.accepted?
 Soul.focusFor(p,witnessed.source.linksBefore,witnessed.source.integratedBefore):null);
A.equal(witnessed.source.noThoughtReadingSoulArtOrForcedBond,true);
A.equal(Soul.verify(s,p),true);
A.equal(Early.verify(s,p),true);
A.deepEqual(p.knownTechniques,[]);
const dossier=Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence;
A.equal(dossier.originalSoulMindBodyThreading.noMindReadingOrFreeSoulArt,true);
A.equal(dossier.originalPowerMilestones.soul.phase,
 p.originalSoulThreadTwo.completed?2:1);
const saved=E.exportGame(s),
 restored=E.importGame(saved),rp=Realm.peek(restored).emergentPeople.people[p.id];
A.equal(Soul.verify(restored,rp),true);
A.deepEqual(rp.originalSoulThreadTwo,p.originalSoulThreadTwo);
const corrupted=E.importGame(saved),cp=Realm.peek(corrupted).emergentPeople.people[p.id],
 row=cp.originalSoulThreadTwo.sessions.find(x=>x.source.origin===Soul.ORIGIN);
row.source.earned+=20;row.seal=hash(row.source);
A.equal(Soul.verify(corrupted,cp),false,
 'Resealing invented Phase II progress cannot bypass original private Core dice');
console.log('Live independent Soul Phase II opportunity and source-replay / tamper test PASS');
