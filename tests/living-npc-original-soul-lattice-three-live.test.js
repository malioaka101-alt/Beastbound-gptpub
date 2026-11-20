'use strict';
// Focused source chain with NO invented Phase II rank, reserve, III progress,
// chosen die or forced private action. Earlier Phase I preparation is the
// separately identified disposable synthetic original REPLAY fixture; the
// actual Phase I rite, Phase II threads, safe shelter and Phase III action
// all use the real source owners and true individual-world ticks.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine'),Rules=require('../rules'),World=require('../rules/world'),
 Realm=require('../world/simulation'),Lives=require('../world/independent-person-lives'),
 Early=require('../rules/independent-original-discipline-preparation'),
 Thread=require('../rules/independent-original-soul-thread-two'),
 Lattice=require('../rules/independent-original-soul-lattice-three'),
 Health=require('../rules/unified'),
 Foundation=require('../world/person-mechanical-foundations');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const {fixture}=require('./living-npc-original-soul-body-rift-first-milestones.test.js');
const diagnostic=[];
let chosen=null;
for(let i=0;i<12&&!chosen;i++){
 const seed=971800+97*i;
 const {s,p,day}=fixture('soul','breakthrough',seed);
 const result=Rules.act(s,{system:'discipline',
  operation:'npcOriginalFirstMilestone',
  params:{actorId:p.actorId,system:'soul'}});
 A.equal(result.observedOutcome,'breakthrough');
 const w=Realm.peek(s),life=w.independentPersonLives.people[p.id];
 life.lastDay=day;
 A.equal(Lives.verifyEntry(w,life),true);
 const before=s.world.minutes,evening=day*1440+990;
 A.ok(evening>before);
 E.advance(s,evening-before);World.finalizeTime(s,before);
 const scene=p.name+' personally chooses a safe room at home for eight hours of real sleep, physically witnessed while preparing for bed.';
 s.chatRuntime.scene='A real safe room, a real voluntary rest opportunity: '+scene;
 const original=Rules.act(s,{system:'health',
  operation:'witnessedNpcNightSleep',params:{
   actorId:p.actorId,witness:scene}});
 if(!original.freelyAccepted){
  diagnostic.push({seed,night:'declined'});continue;
 }
 A.equal(Health.verifyNpcNightHistory(s,p.actorId),true);
 for(let dayCount=0;dayCount<200;dayCount++){
  const last=s.world.minutes;
  E.advance(s,1440);World.finalizeTime(s,last);
  const source=p.originalSoulLatticeThree?.sessions?.find(x=>
   x.source.origin===Lattice.ORIGIN&&x.source.kind==='design'&&
   x.source.accepted===true);
  if(source){chosen={s,p,seed,source};break;}
 }
 if(!chosen)diagnostic.push({seed,
  phase2Completed:p.originalSoulThreadTwo?.completed||false,
  threadWork:p.originalSoulThreadTwo?.sessions?.filter(x=>
   x.source.origin===Thread.ORIGIN).length||0,
  phase3Work:p.originalSoulLatticeThree?.sessions?.length||0,
  nights:p.originalOffscreenCombatNights?.length||0,
  stamina:s.table.combatants['npc_'+p.id].stamina,
  status:s.table.combatants['npc_'+p.id].status});
}
A.ok(chosen,'Actual independently progressing Soul II to Phase III mapping was not observed: '+
 JSON.stringify(diagnostic));
const {s,p,seed,source}=chosen,q=source.source;
A.equal(q.personalBlueprint.originalEarnedPhaseTwoSourceHash,
 p.originalSoulLatticeThree.originalThreadSourceHash);
A.equal(q.personalBlueprint.noOtherPersonConsentPresumed,true);
A.equal(q.personalBlueprint.noLearnedArtOrSpiritContract,true);
A.equal(q.offscreenOpportunity.kind,'soul');
A.equal(q.originalShiftHash,q.offscreenOpportunity.originalShiftHash);
A.equal(q.originalSceneHash,hash(q.offscreenOpportunity));
A.equal(q.reserveSpent,0);
A.equal(q.staminaSpent,0);
A.equal(q.noOtherMindReadingOrUnlearnedArt,true);
// The mapped lattice alone is only a personally observed design; it must
// develop actual structural practice from another real independent choice.
let actualPractice=null;
for(let n=0;n<180;n++){
 const before=s.world.minutes;
 E.advance(s,1440);World.finalizeTime(s,before);
 actualPractice=p.originalSoulLatticeThree?.sessions?.find(x=>
  x.source.origin===Lattice.ORIGIN&&x.source.kind==='practice'&&
  x.source.accepted===true);
 if(actualPractice)break;
}
A.ok(actualPractice,'A mapped Phase III needs later genuine independently chosen, resource-paid Soul lattice practice');
const worked=actualPractice.source;
A.equal(actualPractice.seal,hash(worked));
A.equal(worked.reserveSpent,2);
A.equal(worked.staminaSpent,2);
A.equal(worked.actualMinutes,120);
A.equal(worked.check.dc,17);
A.equal(worked.noOtherMindReadingOrUnlearnedArt,true);
A.equal(worked.offscreenOpportunity.kind,'soul');
A.equal(worked.originalShiftHash,worked.offscreenOpportunity.originalShiftHash);
A.equal(worked.originalSceneHash,hash(worked.offscreenOpportunity));
// Continue *the same genuine person* to attempt full structural
// formation. No selected dice, forced work, healing, or invented reserve.
let attemptedFormation=null,formedDay=null;
for(let n=0;n<420&&!p.originalSoulLatticeThree?.formed;n++){
 const at=s.world.minutes;
 E.advance(s,1440);World.finalizeTime(s,at);
 const forms=p.originalSoulLatticeThree?.sessions?.filter(x=>
  x.source.origin===Lattice.ORIGIN&&x.source.kind==='form'&&
  x.source.accepted);
 if(forms?.length)attemptedFormation=forms.at(-1);
 if(p.originalSoulLatticeThree?.formed)formedDay=Math.floor(s.world.minutes/1440);
}
const lifeResult=p.originalSoulLatticeThree;
A.ok(lifeResult?.formed,'Genuine Phase III resonance lattice was not completed; '+JSON.stringify({
 seed,phase2:p.originalSoulThreadTwo?.completed,
 acceptedPractice:lifeResult?.sessions?.filter(x=>
  x.source.kind==='practice'&&x.source.accepted).length||0,
 progress:lifeResult?.points,interference:lifeResult?.strain,
 attempts:lifeResult?.sessions?.length,formationAttempts:lifeResult?.sessions?.
  filter(x=>x.source.kind==='form').length||0,
 nightlyRecovery:lifeResult?.sessions?.filter(x=>
  x.source.origin===Lattice.NIGHT).length||0,
 currentReserve:lifeResult?.reserveRemaining,
 body:s.table.combatants['npc_'+p.id].wounds,
 stamina:s.table.combatants['npc_'+p.id].stamina,
 lastDay:Math.floor(s.world.minutes/1440)
 }));
A.ok(attemptedFormation&&attemptedFormation.source.check.success);
A.equal(lifeResult.earnedProof.formationSourceHash,attemptedFormation.seal);
A.equal(lifeResult.earnedProof.latticeIntegrity,1);
A.equal(lifeResult.earnedProof.perceptionRangeMetres,50);
A.equal(attemptedFormation.source.reserveSpent,4);
A.equal(attemptedFormation.source.staminaSpent,3);
A.equal(attemptedFormation.source.check.dc,21);
A.equal(formedDay>q.day,true);
A.equal(Thread.verify(s,p),true);
A.equal(Lattice.verify(s,p),true);
A.equal(Early.verify(s,p),true);
A.deepEqual(p.knownTechniques,[]);
const d=Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence;
A.equal(d.originalSoulResonanceLatticeThree.actuallyMappedPersonalLattice,true);
A.equal(d.originalSoulResonanceLatticeThree.noMindReadingContractsOrFreeSoulArt,true);
A.equal(d.originalPowerMilestones.soul.phase,
 p.originalSoulLatticeThree.formed?3:2);
const saved=E.exportGame(s),loaded=E.importGame(saved),
 rp=Realm.peek(loaded).emergentPeople.people[p.id];
A.equal(Thread.verify(loaded,rp),true);
A.equal(Lattice.verify(loaded,rp),true);
A.deepEqual(rp.originalSoulLatticeThree,p.originalSoulLatticeThree);
const falseSave=E.importGame(saved),
 fp=Realm.peek(falseSave).emergentPeople.people[p.id];
fp.originalSoulLatticeThree.sessions.find(x=>x.source.kind==='design')
 .source.personalBlueprint.originalThreadIntegrity=999;
fp.originalSoulLatticeThree.sessions.find(x=>x.source.kind==='design').seal=
 hash(fp.originalSoulLatticeThree.sessions.find(x=>x.source.kind==='design').source);
A.equal(Lattice.verify(falseSave,fp),false,
 'Resealing an invented personal Phase III map cannot bypass verified own Soul II anatomy');
console.log('REAL independent Soul II -> observed original self-lattice III design through personally chosen safe sleep and genuine source-owned life days, save/replay/tamper PASS; seed '+seed);
