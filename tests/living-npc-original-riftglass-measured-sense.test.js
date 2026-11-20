'use strict';
// SOURCE-OWNED real living Riftglass measurement: fixture has test-only
// earlier preparation, genuine original Step I rite, then only actual
// autonomous personal life decisions. No stage/roll/reading is chosen.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine'),Rules=require('../rules'),World=require('../rules/world'),
 Realm=require('../world/simulation'),Lives=require('../world/independent-person-lives'),
 Early=require('../rules/independent-original-discipline-preparation'),
 Sense=require('../rules/independent-original-rift-sense-observation'),
 Law=require('../rules/rift-shared-original-exterior-sense'),
 FirstSense=require('../rules/first-stage-senses'),
 Foundation=require('../world/person-mechanical-foundations');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const {fixture}=require('./living-npc-original-soul-body-rift-first-milestones.test.js');
A.equal(FirstSense.RIFT_STAMINA,Law.STAMINA_COST);
A.equal(FirstSense.RIFT_MINUTES,Law.READ_MINUTES);
A.equal(Law.dc({siteId:'riftglass_vault',phase:'quiet',charge:10,seal:70,
 ecosystemPressure:10,worldSeed:123,day:2}),13);
A.equal(Law.dc({siteId:'riftglass_vault',phase:'surging',charge:10,seal:70,
 ecosystemPressure:10,worldSeed:123,day:2}),15);
A.equal(Law.dc({siteId:'riftglass_vault',phase:'unstable',charge:10,seal:70,
 ecosystemPressure:10,worldSeed:123,day:2}),17);
const {s,p,day}=fixture('rift','breakthrough',973800);
const completed=Rules.act(s,{system:'discipline',operation:'npcOriginalFirstMilestone',
 params:{actorId:p.actorId,system:'rift'}});
A.equal(completed.observedOutcome,'breakthrough');
A.equal(p.originalFirstPowerMilestones.rift.step,1);
A.equal(Early.verify(s,p),true);
const life=Realm.peek(s).independentPersonLives.people[p.id];
life.lastDay=day;
A.equal(Lives.verifyEntry(Realm.peek(s),life),true);
let attempt=null;
for(let i=0;i<170;i++){
 const before=s.world.minutes;
 E.advance(s,1440);World.finalizeTime(s,before);
 const rows=p.originalRiftMeasuredSense?.attempts||[];
 const accepted=rows.find(x=>x.source.accepted===true);
 if(accepted){attempt=accepted;break;}
}
A.ok(attempt,'Actual original independent life must decide to sense a real Riftglass exterior');
const q=attempt.source;
A.equal(attempt.seal,hash(q));
A.equal(q.offscreenOpportunity.kind,'rift');
A.equal(q.originalShiftHash,q.offscreenOpportunity.originalShiftHash);
A.equal(q.originalSceneHash,hash(q.offscreenOpportunity));
A.equal(q.originalSiteId,Law.SITE_ID);
A.equal(q.sampledMinute,(q.day+1)*1440);
A.equal(q.readingSnapshot.worldSeed,Realm.peek(s).worldSeed);
A.equal(q.sampleHash,Law.digest(q.readingSnapshot));
A.equal(q.check.dc,Law.dc(q.readingSnapshot));
A.equal(q.check.success,q.success);
A.equal(q.publicObservation,Law.observation(q.readingSnapshot,q.success));
A.equal(q.staminaSpent,Law.STAMINA_COST);
A.equal(q.noAnchorFoldRouteOrVaultAccess,true);
A.equal(Sense.verify(s,p),true);
A.equal(Early.verify(s,p),true);
A.equal(p.originalRiftMeasuredSense?.successfulReading?.success||false,q.success);
A.deepEqual(p.knownTechniques,[]);
const dossier=Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence;
A.equal(dossier.originalRiftExteriorBoundaryReading.noSpatialAnchorFoldOrVaultAccess,true);
A.equal(dossier.originalPowerMilestones.rift.step,1);
A.equal(dossier.originalPowerReadiness.actualExteriorRiftglassReading?.success||false,q.success);
const original=E.exportGame(s),imported=E.importGame(original),
 rp=Realm.peek(imported).emergentPeople.people[p.id];
A.equal(Sense.verify(imported,rp),true);
const corrupted=E.importGame(original),
 cp=Realm.peek(corrupted).emergentPeople.people[p.id];
const row=cp.originalRiftMeasuredSense.attempts.find(x=>x.source.accepted);
row.source.check.dc=2;row.seal=hash(row.source);
A.equal(Sense.verify(corrupted,cp),false,
 'A resealed fake easy spatial DC is never the measured original Rift rule');
console.log('Real independent Riftglass exterior measured Rift Sense, owner parity, import and forgery contract PASS');
