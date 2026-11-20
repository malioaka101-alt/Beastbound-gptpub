'use strict';
// SOURCE-BORN Soul Phase I, NO synthetic prerequisite preparation, chosen
// training, dictated NPC decision, free stage, fabricated teacher or roll.
// Select a real source-born individual based ONLY on existing aptitude,
// health and the separately ORIGINAL independently accepted first safe rest.
// The full NPC original calendar then decides daily actions and all checks.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Rules=require('../rules'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),Atlas=require('../world/atlas'),
 Lives=require('../world/independent-person-lives'),
 Unified=require('../rules/unified'),World=require('../rules/world'),
 Combat=require('../rules/combat'),
 Early=require('../rules/independent-original-discipline-preparation'),
 First=require('../rules/independent-original-first-milestones'),
 Foundation=require('../world/person-mechanical-foundations');
function next(n){let x=n>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 return(x>>>0)||0x91e10da5;}
const s=E.newGame({seed:974070,name:'Disposable true Soul Phase I research'}),
 w=Realm.ensure(s),roster=People.ensure(w),
 region=Atlas.regions.find(r=>
  E.LOCATIONS[People.siteFor(r.id)]?.biome==='settlement');
A.ok(region,'A real original lived settlement is required');
Object.assign(w.ecosystems[region.id],
 {quality:77,pressure:14,water:78,forage:83});
Object.assign(w.countries[region.polity],
 {prosperity:78,stability:82});
const demand=People.sourceDemand(w,region);
A.ok(demand);
let p=null,best=-Infinity;
for(let i=0;i<290;i++){
 const candidate=People._debug.make(w,roster,0,demand),
  attr=candidate.mechanicalFoundation.baselineAttributes,
  pot=candidate.mechanicalFoundation.unassessedPotential,
  chance=Math.min(94,
   ({curious:71,steady:82,independent:68,reserved:77})[candidate.personality]+
   (candidate.fatigue>=50?9:0)),
  nextChoice=1+Math.floor(next(candidate.rngState)/4294967296*100);
 if(attr.wis<13||attr.con<9||pot.soulDepth<6||
  nextChoice>chance)continue;
 const score=7*attr.wis+8*pot.soulDepth+6*pot.soulResilience+
  (candidate.personality==='curious'?12:0);
 if(score>best){best=score;p=candidate;}
}
A.ok(p,'Real born practitioner with actual high comprehension and independently accepted initial shelter');
p.shift=People.shift(p,0,w);s.world.location=People.siteFor(p.regionId);
s.chatRuntime||={};
const originalWitness=p.name+
 ' is an uninjured, unarmed and unarmoured adult visibly present in '+s.world.location+'.';
s.chatRuntime.scene=originalWitness;
Lives.enroll(s,{actorId:p.actorId,interests:['soul'],
 motivation:'Personally chosen interest in exploring the structure and boundaries of their own soul without a compulsory master',
 witness:originalWitness});
const linked=Rules.act(s,{system:'health',operation:'linkWitnessedHuman',
 params:{npcId:p.actorId,witness:originalWitness}});
A.equal(linked.created,true);
const body=Combat.get(s,linked.id);
A.equal(p.originalFirstPowerMilestones,undefined);
A.equal(p.originalEarlyDisciplinePreparation,undefined);
A.equal(p.originalSoulThreadTwo,undefined);
const before=s.world.minutes;
E.advance(s,990-before);World.finalizeTime(s,before);
const witness=p.name+
 ' voluntarily settles for eight hours of safe sleep in a personally witnessed room at home.';
s.chatRuntime.scene='Actual safe shelter and original consent: '+witness;
const sleep=Rules.act(s,{system:'health',operation:'witnessedNpcNightSleep',
 params:{actorId:p.actorId,witness}});
A.equal(sleep.freelyAccepted,true);
A.equal(Unified.verifyNpcNightHistory(s,p.actorId),true);
const initialSource=E.exportGame(s),originalPcSoul=s.player.soul.phase;
let completed=false,days=0;
for(let interval=0;interval<36&&!completed;interval++){
 const minute=s.world.minutes;
 // The original 45-day Meridian real-chain acceptance already establishes
 // that the existing calendar processes EVERY individual daily source
 // in order within a bulk advance, without selecting rolls or actions.
 // This avoids 900 redundant top-level world-finalization invocations.
 E.advance(s,45*1440);World.finalizeTime(s,minute);
 days+=45;
 A.equal(Early.verify(s,p),true);
 A.equal(Unified.verifyNpcNightHistory(s,p.actorId),true);
 completed=p.originalFirstPowerMilestones?.soul?.phase===1;
}
const rec=p.originalEarlyDisciplinePreparation?.soul;
const diag=()=>JSON.stringify({
 days,actor:p.personality,
 wis:p.mechanicalFoundation.baselineAttributes.wis,
 depth:p.mechanicalFoundation.unassessedPotential.soulDepth,
 originalPractices:rec?.sessions?.filter(x=>x.source.origin===Early.ORIGIN).length||0,
 trueMilestoneAttempts:rec?.sessions?.filter(x=>x.source.origin===First.ORIGIN).length||0,
 points:rec?.points,methods:rec?.methods,
 cooldown:rec?.cooldownUntil,
 homeRecovery:p.originalOffscreenCombatNights?.length||0,
 combat:{status:body.status,wounds:body.wounds,
 stamina:body.stamina,maxStamina:body.maxStamina}
});
A.ok(completed,'A truly source-born Soul adult has not completed the original 100-point Phase I rite in the bounded acceptance horizon: '+diag());
A.ok(rec?.sessions?.filter(x=>x.source.origin===Early.ORIGIN).length,
 'The original 100-point Soul Phase I cannot emerge from an untrained actor with no actual sessions');
const originalRite=rec.sessions.find(x=>
 x.source.origin===First.ORIGIN&&x.source.outcome==='breakthrough');
A.ok(originalRite,'An earned Soul Phase I requires an actual resolved first-milestone receipt');
A.equal(originalRite.source.pointsBefore,100,
 'Original Soul Phase I demands the source-owned 100-point threshold, not 40');
A.ok(originalRite.source.distinctMethodsBefore>=2,
 'The personally earned original rite requires at least two actually practised methods');
A.equal(Early.verify(s,p),true);
A.ok(p.originalFirstPowerMilestones.soul.originalSourceHash,
 'The original Source-owner rite must retain its own earned success receipt');
A.equal(p.originalFirstPowerMilestones.soul.noUnlearnedSoulArt,true);
A.equal(s.player.soul.phase,originalPcSoul);
A.deepEqual(p.knownTechniques,[]);
A.equal(Unified.verifyNpcNightHistory(s,p.actorId),true);
const dossier=Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence;
A.ok(dossier.originalPowerMilestones.soul.phase>=1,
 'Genuine Soul phase is allowed to continue advancing after the true original Phase I receipt');
A.equal(dossier.originalPowerMilestones.soul.phase,
 p.originalSoulThreadTwo?.completed?2:1);
const save=E.exportGame(s),
 restored=E.importGame(save),
 rp=Realm.peek(restored).emergentPeople.people[p.id];
A.equal(Early.verify(restored,rp),true);
A.equal(Realm.peek(restored).independentPersonLives.people[p.id].lastDay,
 Realm.peek(s).independentPersonLives.people[p.id].lastDay);
A.deepEqual(rp.originalFirstPowerMilestones,p.originalFirstPowerMilestones);
const forged=E.importGame(save),
 fp=Realm.peek(forged).emergentPeople.people[p.id];
fp.originalFirstPowerMilestones.soul.soulReserve+=100;
A.equal(Early.verify(forged,fp),false,
 'Changing an earned original Soul reserve cannot bypass genuine rite replay');
console.log('Untrained source-born independent Soul -> genuine daily study/practice -> 100-point/2-method preparation -> authentic original Phase I rite, overnight recovery, save/tamper PASS; days '+days);
