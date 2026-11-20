'use strict';
// Expensive full-game Rift acceptance comes at PR review, not here.
// This fast source test exercises a TRUE autonomous Rift I -> personally
// observed original exterior Riftglass reading -> independent Anchor II
// check without choosing an actor's d20, environment, fate or stage.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine'),Rules=require('../rules'),World=require('../rules/world'),
 Realm=require('../world/simulation'),Lives=require('../world/independent-person-lives'),
 Early=require('../rules/independent-original-discipline-preparation'),
 Sense=require('../rules/independent-original-rift-sense-observation'),
 Anchor=require('../rules/independent-original-rift-exterior-anchor-two'),
 Law=require('../rules/rift-shared-original-anchor-law'),
 FirstSense=require('../rules/rift-shared-original-exterior-sense'),
 Foundation=require('../world/person-mechanical-foundations');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const {fixture}=require('./living-npc-original-soul-body-rift-first-milestones.test.js');
const {s,p,day}=fixture('rift','breakthrough',973800);
const outcome=Rules.act(s,{system:'discipline',operation:'npcOriginalFirstMilestone',
 params:{actorId:p.actorId,system:'rift'}});
A.equal(outcome.observedOutcome,'breakthrough');
const w=Realm.peek(s),life=w.independentPersonLives.people[p.id];
life.lastDay=day;
A.equal(Lives.verifyEntry(w,life),true);
const playerRng=s.rngState;
let exercised=null;
for(let i=0;i<500;i++){
 const before=s.world.minutes;
 E.advance(s,1440);World.finalizeTime(s,before);
 exercised=p.originalRiftExteriorAnchor?.attempts?.find(a=>a.source.accepted);
 if(exercised)break;
}
const measured=p.originalRiftMeasuredSense?.successfulReading;
A.ok(measured,'A genuinely successful independently checked original boundary measurement must precede Anchor II; '+JSON.stringify({
 measuredAttempts:p.originalRiftMeasuredSense?.attempts?.length||0,
 accepted:p.originalRiftMeasuredSense?.attempts?.filter(a=>a.source.accepted).length||0,
 successful:p.originalRiftMeasuredSense?.attempts?.filter(a=>a.source.success).length||0,
 anchorAttempts:p.originalRiftExteriorAnchor?.attempts?.length||0,
 status:p.status,site:p.regionId,lifeDay:life.lastDay,
 last15Actions:life.history.slice(-15).map(a=>[a.source.action,a.source.focus]),
 lastSenseDay:p.originalRiftMeasuredSense?.lastPracticeDay||null
 }));
A.ok(exercised,'A living NPC must personally choose a real original Anchor II attempt');
A.equal(Sense.verify(s,p),true);
A.equal(Anchor.verify(s,p),true);
A.equal(Early.verify(s,p),true);
A.equal(s.rngState,playerRng,'Private actor power checks must not consume player RNG');
const q=exercised.source;
A.equal(exercised.seal,hash(q));
A.equal(q.offscreenOpportunity.kind,'rift');
A.equal(q.originalShiftHash,q.offscreenOpportunity.originalShiftHash);
A.equal(q.originalSceneHash,hash(q.offscreenOpportunity));
A.equal(q.originalReadingSourceHash,measured.sourceHash);
A.equal(q.originalReadingSnapshotHash,measured.readingSnapshotHash);
A.equal(q.sampleHash,FirstSense.digest(q.snapshot));
A.equal(q.sampledMinute,(q.day+1)*1440);
A.equal(q.check.dc,Law.dc(q.snapshot));
A.equal(q.focus,Anchor.focusFor(p,q.axesBefore,q.integratedBefore));
A.equal(q.staminaSpent,Law.staminaCost(120));
A.equal(q.noFoldOrVaultRouteByAnchorAlone,true);
A.deepEqual(p.knownTechniques,[]);
const dossier=Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence;
A.equal(dossier.originalRiftExteriorAnchorMarking.noFoldOrVaultAccess,true);
A.equal(dossier.originalPowerMilestones.rift.step,
 p.originalRiftExteriorAnchor.completed?2:1);
const saved=E.exportGame(s),imported=E.importGame(saved),
 copy=Realm.peek(imported).emergentPeople.people[p.id];
A.equal(Sense.verify(imported,copy),true);
A.equal(Anchor.verify(imported,copy),true);
A.deepEqual(copy.originalRiftExteriorAnchor,p.originalRiftExteriorAnchor);
const corrupted=E.importGame(saved),
 forged=Realm.peek(corrupted).emergentPeople.people[p.id];
const tampered=forged.originalRiftExteriorAnchor.attempts.find(a=>a.source.accepted);
tampered.source.check.dc=2;tampered.seal=hash(tampered.source);
A.equal(Anchor.verify(corrupted,forged),false,
 'An invented easy DC fails original measured physical spatial source replay even if resealed');
console.log('Live independent Rift I -> genuine sensed exterior -> measured Anchor II d20, save and anti-forgery PASS');
