'use strict';
// Existing original PC Gate and Build laws shared as immutable sources.
// Only genuine NPC source-owned Stage I completion may open Stage II
// practice through personally chosen world days; later-stage PC rules are
// not prematurely converted into NPC skills or free Gate openings.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),World=require('../rules/world'),
 Realm=require('../world/simulation'),Lives=require('../world/independent-person-lives'),
 Disc=require('../rules/disciplines'),Core=require('../rules/core'),
 Gate=require('../rules/meridian-shared-original-gates'),
 Ladder=require('../world/independent-meridian-ladder'),
 {fixture}=require('./living-npc-original-meridian-stage-one-rite.test.js');
const original=Gate.gateSpec;
for(const number of [1,12,35,36,37,71,72,73,107,108]){
 const g=original(number),last=number<=36?[3,13]:
  number<=72?[5,16]:[8,19];
 A.equal(g.points,last[0]);A.equal(g.baseDC,last[1]);
 A.equal(g.actualDC,last[1]+([36,72,108].includes(number)?3:0));
 A.equal(g.band,number<=36?'Lower':number<=72?'Middle':'High');
}
for(const quality of ['Perfect','Firm','Sound','Thin','Cracked'])
 A.equal(typeof Gate.foundationBonus(quality),'number');
A.equal(Gate.gateQuality('exceptional','Sound'), 'Perfect');
A.equal(Gate.gateQuality('strong','Perfect'), 'Perfect');
A.equal(Gate.gateQuality('strong','Sound'), 'Sound');
A.equal(Gate.gateQuality('exceptional','Perfect',true), 'Flawed');
A.throws(()=>Gate.gateSpec(109),/1–108/);
A.deepEqual(Gate.verifiedGates([
 {number:1,band:'Lower',quality:'Sound'},
 {number:2,band:'Lower',quality:'Flawed'}]),
 {Perfect:0,Sound:1,Flawed:1});
for(let stage=1;stage<=9;stage++){
 const p=Gate.profile(stage,[]);
 A.equal(p.stage,stage);
 A.ok(p.bonuses.stamina>=2);
}
// The Stage I history is an explicitly synthetic ORIGINAL source-replayed
// *past* fixture. The Stage I rite is genuinely performed through the live
// engine, and EVERY subsequent day/acceptance/roll is genuinely chosen by
// the independent adult and its original world/day owner, not this test.
const {s,p,c}=fixture('breakthrough',982111);
const earned=R.act(s,{system:'discipline',
 operation:'npcMeridianStageOneRite',params:{actorId:p.actorId}});
A.equal(earned.observedOutcome,'breakthrough');
A.equal(p.meridianTraining.earnedStage,1);
A.equal(Disc.verifyNpcMeridian(s,p),true);
const w=Realm.peek(s),q=w.independentPersonLives.people[p.id],
 day=Math.floor(s.world.minutes/1440),originalPcState=s.player.meridian.stage;
q.lastDay=day;
A.equal(Lives.verifyEntry(w,q),true);
const originalRng=p.rngState,playerCoins=s.player.coins;
let first=null;
for(let i=0;i<30;i++){
 const clock=s.world.minutes,
  target=(Math.floor(clock/1440)+1)*1440;
 E.advance(s,target-clock);World.finalizeTime(s,clock);
 first=p.originalMeridianLadder?.awakening?.sessions?.[0]?.source||null;
 if(first)break;
}
A.ok(first,'Independent real world days eventually provide a real Meridian Stage II practice opportunity');
A.equal(first.origin,Ladder.PREP);
A.equal(first.system,'meridian');
A.equal(first.target,'awakening');
A.equal(first.noAutomaticRankOrStage,true);
A.equal(first.offscreenOpportunity.kind,'meridian');
A.equal(first.originalFoundationRiteHash,
 p.meridianTraining.sessions.at(-1).seal);
A.equal(first.originalSkillRankBonus,0);
A.equal(Disc.verifyNpcMeridian(s,p),true);
A.equal(Ladder.verify(s,p),true);
A.equal(p.originalMeridianLadder.stage,1);
A.equal(p.originalMeridianLadder.primaryMapped,0,
 'A single ordinary practice never automatically grants Stage II');
A.equal(s.player.meridian.stage,originalPcState);
A.equal(s.player.coins,playerCoins);
A.ok(first.choiceD100>=1&&first.choiceD100<=100);
if(first.accepted){
 A.ok(first.check.roll>=1&&first.check.roll<=20);
 A.equal(first.actualMinutes,120);
}else A.equal(first.actualMinutes,5);
A.notEqual(p.rngState,originalRng);
const exportState=E.exportGame(s),replay=E.importGame(exportState),
 replayPerson=Realm.peek(replay).emergentPeople.people[p.id];
A.equal(Disc.verifyNpcMeridian(replay,replayPerson),true);
A.equal(Ladder.verify(replay,replayPerson),true);
A.equal(replayPerson.originalMeridianLadder.awakening.sessions[0].seal,
 p.originalMeridianLadder.awakening.sessions[0].seal);
const damaged=E.importGame(exportState),dp=Realm.peek(damaged).
 emergentPeople.people[p.id],row=dp.originalMeridianLadder.awakening.sessions[0];
row.source.offscreenOpportunity.privatePhysicalSite='fictional-remote-altar';
row.seal=require('node:crypto').createHash('sha256').
 update(JSON.stringify(row.source)).digest('hex');
A.equal(Ladder.verify(damaged,dp),false);
A.equal(Disc.verifyNpcMeridian(damaged,dp),false);
const intact=E.exportGame(s);
Lives.tick(s,Math.floor(s.world.minutes/1440)-1,Math.floor(s.world.minutes/1440));
A.equal(E.exportGame(s),intact,'The same completed day never rerolls Meridian training');
console.log('Shared existing nine-stage Meridian source laws and genuine independent Stage II primary awakening preparation PASS; actual original 108-Gate thresholds unchanged, private source replay, save/forgery, no free Stage II or PC progression');
