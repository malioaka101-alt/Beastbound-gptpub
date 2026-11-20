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
