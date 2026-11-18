'use strict';
// Stage 2B increment: current mundane capabilities belong to ORIGINAL
// professional work, not chosen GM stats, generic ranks or occult ability.
// Entirely disposable; Maddoc's campaign file is never opened.
const A=require('node:assert/strict'),E=require('../engine'),
 New=require('../scripts/new-campaign'),Rules=require('../rules'),
 Realm=require('../world/simulation'),
 Careers=require('../world/person-careers'),
 People=require('../world/emergent-people'),
 Foundations=require('../world/person-mechanical-foundations');

const scene="Talia Vale surveys the ferry's worn plank routes and records the old bridge repairs at the river crossing while the player watches.";
const s=New.create({seed:9283101,slug:'disposable_current_work_ability',
 mode:'gm',age:28,gmOpening:{locationId:'crossing',
 scene,focus:'Visit the working river surveyor',
 weather:'Mild and overcast',hour:9,minute:25}}).state;
const act=(operation,params={})=>Rules.act(s,{system:'social',operation,params});
const joined=act('introduceWitnessedPerson',{
 name:'Talia Vale',profession:'Travelling river bridge surveyor',
 purpose:'Document ferry-route safety, bridge damage and practical crossing access without presuming legal authority.',
 personality:'Attentive, independent and skeptical of unobserved promises.',
 background:'A travelling professional with her own work choices and no proven personal magical development.',
 witness:'The GM saw Talia Vale surveying ferry routes and recording old bridge repairs in the original scene.'});
const id=joined.npcId;
const duty={npcId:id,id:'observed_ferry_route_work',
 role:'River bridge route surveyor',method:'route-survey',domain:'trade',
 goal:'Observe the real local route conditions and document safe ferry travel for independent local workers.',
 witness:scene};
const authorized=act('authorWitnessedPersonDuty',duty);
A.equal(authorized.originalCareerOwner,true);
const w=Realm.peek(s),p=w.emergentPeople.people[id.slice(9)];
A.equal(People.verify(w,p),true);
const firstSave=E.exportGame(s),rng=s.rngState,personalRng=p.rngState,
 time=s.world.minutes,coins=s.player.coins;
const base=Careers.currentCapability(p);
A.equal(base.origin,'original-earned-professional-readiness-v1');
A.equal(base.earnedCompetenceRank,0);
A.equal(base.attemptedWork,0);
A.equal(base.unassistedModifier,
  base.earnedCompetenceRank*2+base.aptitudeAdjustment-base.fatiguePenalty);
A.equal(base.originalDCNotPredetermined,true);
A.equal(base.presentlyWilling,null);
A.equal(base.injuryAdjustment,null);
A.equal(base.noCultivationOrCombatPowerAward,true);
A.deepEqual(base.demonstratedMethods,[]);
A.deepEqual(Foundations.earnedEvidence(w,id).currentMundaneWork,base);
A.equal(E.exportGame(s),firstSave,'Readiness must be a pure read');
A.equal(p.rngState,personalRng,'Read cannot predetermine a real worker roll');
A.equal(s.rngState,rng);
A.equal(s.world.minutes,time);
A.equal(s.player.coins,coins);

const work=Careers.work(w,p,Math.floor(time/1440),'independent-duty');
const receipt=p.career.workReceipts.at(-1);
A.equal(receipt.sourceHash,work.receiptHash);
A.equal(receipt.source.task.method,duty.method);
A.equal(receipt.source.modifier,base.unassistedModifier,
 'Actual original work owner must use exactly the same unsupplemented modifier');
A.equal(work.noTechniqueOrSpellLearned,true);
const current=Foundations.gmDossier(w,id).earnedEvidence.currentMundaneWork;
A.equal(current.attemptedWork,1);
A.equal(current.successfulWork,work.success?1:0);
A.equal(current.earnedCompetenceRank,p.career.competenceRank);
A.equal(current.currentFatigue,p.fatigue);
A.equal(current.unassistedModifier,
 current.earnedCompetenceRank*2+current.aptitudeAdjustment-
 current.fatiguePenalty);
if(work.success){
 const method=current.demonstratedMethods.find(x=>x.method===duty.method);
 A.equal(method.lifetimeRecordedSuccesses,1);
 A.equal(method.recentVerifiedWork[0].receiptHash,work.receiptHash);
}else A.deepEqual(current.demonstratedMethods,[]);
A.equal(Foundations.gmDossier(w,id).earnedEvidence.originalPowerMilestones.arcane.circles,null);
A.equal(Foundations.gmDossier(w,id).earnedEvidence.originalPowerMilestones.meridian.stage,null);
A.deepEqual(Foundations.gmDossier(w,id).earnedEvidence.verifiedLearnedTechniques,[]);
A.equal(Foundations.gmDossier(w,id).earnedEvidence.equipment.verifiedItems,null);
A.equal(E.exportGame(s).includes('Maddoc'),false,'Not the live campaign');
A.equal(s.rngState,rng,'The original person work roll never touches player RNG');
A.equal(s.world.minutes,time,'Readiness and off-screen professional work do not invent player elapsed time');
A.equal(s.player.coins,coins);

const stored=E.exportGame(s),replay=E.importGame(stored);
A.deepEqual(Foundations.earnedEvidence(Realm.peek(replay),id).currentMundaneWork,current,
 'The exact earned modifier and verified methods survive save replay');
const tamper=E.importGame(stored),tw=Realm.peek(tamper);
tw.emergentPeople.people[p.id].career.workReceipts[0].source.modifier=999;
A.throws(()=>Foundations.gmDossier(tw,id),/Unverified|Unverified original/i,
 'A changed original work roll or modifier cannot be reported as evidence');
const publicView=act('witnessedPeopleStatus',{npcId:id});
A.equal(Object.hasOwn(publicView.people[0],'currentMundaneWork'),false);
A.equal(Object.hasOwn(publicView.people[0],'unassistedModifier'),false);
A.equal(Object.hasOwn(publicView.people[0],'baselineAttributes'),false);
A.equal(Object.hasOwn(publicView.people[0],'latentPotential'),false);
A.equal(Careers.currentCapability({}),null,'Unknown legacy career stays unknown');
console.log('NPC Stage 2B: original real-work modifier, receipt mastery, fatigue, replay, privacy, tamper and no magic PASS');
