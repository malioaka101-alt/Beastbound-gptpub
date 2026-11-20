'use strict';
// Detailed source replay of the EXISTING Meridian PC Gate law for a separate
// independent human. Previous stage preparation is built only in this
// disposable test fixture with test-only stamina resets; it is NOT a saved
// Beastbound character, proof of free rest or a lawful production recovery.
// Each original cultivation and Gate check/choice STILL uses the real Core,
// Disciplines and individual RNG, and the final source must verify itself.
const A=require('node:assert/strict'),
 E=require('../engine.js'),Rules=require('../rules'),
 Realm=require('../world/simulation'),
 Lives=require('../world/independent-person-lives'),
 Disc=require('../rules/disciplines'),
 Gate=require('../rules/meridian-shared-original-gates'),
 OriginalGate=require('../world/independent-meridian-gates'),
 Ladder=require('../world/independent-meridian-ladder'),
 {fixture}=require('./living-npc-original-meridian-stage-one-rite.test.js');
const {s,p,c}=fixture('breakthrough',982111);
const first=Rules.act(s,{system:'discipline',
 operation:'npcMeridianStageOneRite',params:{actorId:p.actorId}});
A.equal(first.observedOutcome,'breakthrough');
const w=Realm.peek(s),life=w.independentPersonLives.people[p.id],
 base=Math.floor(s.world.minutes/1440),
 firstEntry=p.meridianTraining.sessions.at(-1).seal;
life.lastDay=base;
A.equal(Lives.verifyEntry(w,life),true);
let found=null,awakened=false,day=null;
for(let i=1;i<=780;i++){
 day=base+i;
 // This is a synthetic disposable chronological training fixture. Rest
 // requires its actual source owner in a real campaign; this isolated setup
 // resets ONLY the preexisting fixture Combat body to reach and TEST the
 // far-higher Stage III source law without granting anyone free recovery.
 c.stamina=c.maxStamina;c.wounds=[0,0,0];c.status='ok';
 s.world.minutes=day*1440;
 Lives.tick(s,day-1,day);
 const verified=Disc.verifyNpcMeridian(s,p);
 A.equal(verified,true,'Original current NPC Meridian source must replay');
 if(p.originalMeridianLadder?.stage===2)awakened=true;
 if(p.originalMeridianGates?.sessions.length){
  found=p.originalMeridianGates.sessions[0].source;break;
 }
}
A.equal(awakened,true,
 'A genuinely successful original Stage II independent check is needed before Gate 1');
A.ok(found,'The genuinely awakened practitioner eventually chooses an original 108-Gate attempt');
A.equal(found.origin,OriginalGate.PRACTICE);
A.equal(found.gateNumber,1);
A.equal(found.gateBand,'Lower');
A.equal(found.transition,false);
A.equal(found.actualDC,Gate.gateSpec(1).actualDC);
A.equal(found.requiredPoints,3);
A.equal(found.originalStageTwoSourceHash,
 p.originalMeridianLadder.originalStageTwoSourceHash);
A.equal(found.originalSkillRankBonus,0);
A.equal(found.originalForceChoice,false);
A.equal(found.staminaSpent,0,
 'Existing player Gate action does not impose a fabricated Stamina cost');
A.equal(found.offscreenOpportunity.kind,'meridian');
A.equal(found.noInventedTechniqueOrOtherStage,true);
A.equal(OriginalGate.verify(s,p),true);
A.equal(Disc.verifyNpcMeridian(s,p),true);
A.equal(p.meridianTraining.sessions.at(-1).seal,firstEntry,
 'First Foundation rite must never be rewritten by later Gate work');
if(found.accepted){
 A.ok(found.check.roll>=1&&found.check.roll<=20);
 A.equal(found.actualMinutes,180);
 A.equal(found.check.dc,found.actualDC);
}else A.equal(found.actualMinutes,5);
const recorded=p.originalMeridianGates.gates;
if(recorded.length){
 A.equal(recorded[0].number,1);
 A.equal(recorded[0].band,'Lower');
 A.ok(['Perfect','Sound','Flawed'].includes(recorded[0].quality));
}
const saved=E.exportGame(s),restored=E.importGame(saved),
 person=Realm.peek(restored).emergentPeople.people[p.id];
A.equal(Disc.verifyNpcMeridian(restored,person),true);
A.equal(OriginalGate.verify(restored,person),true);
A.deepEqual(person.originalMeridianGates,p.originalMeridianGates);
const tampered=E.importGame(saved),other=Realm.peek(tampered).
 emergentPeople.people[p.id],row=other.originalMeridianGates.sessions[0];
row.source.actualDC=2;
row.seal=require('node:crypto').createHash('sha256').
 update(JSON.stringify(row.source)).digest('hex');
A.equal(OriginalGate.verify(tampered,other),false);
A.equal(Disc.verifyNpcMeridian(tampered,other),false);
A.equal(s.player.meridian.stage,0,
 'Another original human cannot confer stages or Gates on player');
console.log('Real source-owned independent Meridian Gate 1 PASS: existing 108-Gate PC law, earned distinct Stage II, private individual check and capacity, physical consequences, exact repeatable proof and saved tamper rejection (prehistory explicitly synthetic disposable fixture)');
