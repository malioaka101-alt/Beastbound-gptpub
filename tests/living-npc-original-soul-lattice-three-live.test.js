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
// Continue the original independent person's life, including actual
// severe interference. New own-soul diagnostics MUST be separately paid
// and checked before the original DC14 correction may be attempted.
// No synthetic physician, observed success, or changed personal RNG.
for(let n=0;n<420;n++){
 const at=s.world.minutes;
 E.advance(s,1440);World.finalizeTime(s,at);
}
const lifeResult=p.originalSoulLatticeThree,
 Law=require('../rules/soul-shared-original-resonance-lattice'),
 Senses=require('../rules/first-stage-senses'),
 checks=lifeResult.sessions.filter(x=>x.source.origin===Lattice.ORIGIN),
 acceptedChecks=checks.filter(x=>x.source.kind==='practice'&&x.source.accepted),
 diagnoses=checks.filter(x=>x.source.kind==='diagnose'&&x.source.accepted),
 repairs=checks.filter(x=>x.source.kind==='repair'&&x.source.accepted),
 successfulRepairs=repairs.filter(x=>x.source.check.success);
A.ok(acceptedChecks.length>=2,'Personal original life must have resolved genuine Soul practice');
A.ok(acceptedChecks.some(x=>x.source.strainAfter>=5),
 'The original seeded person must actually experience serious interference before clinical action');
A.ok(diagnoses.length>=1,'The same person must undertake a separate genuine own-pattern diagnostic check');
A.ok(repairs.length>=1,'A successful own-pattern diagnosis must precede a real independently accepted repair check');
const spec=Senses.ownSoulPerceptionSpec(p.mechanicalFoundation.baselineAttributes.wis,0,true);
for(const row of diagnoses){
 const q=row.source;
 A.equal(q.check.dc,spec.dc);
 A.equal(q.check.modifier,spec.modifier);
 A.equal(q.actualMinutes,spec.minutes);
 A.equal(q.reserveSpent,spec.reserveCost);
 A.equal(q.staminaSpent,0);
 A.equal(q.strainAfter,q.strainBefore);
 A.equal(q.stabilityAfter,q.stabilityBefore);
 A.equal(q.pointsAfter,q.pointsBefore);
 A.equal(!!q.diagnosticReport,q.check.success);
 if(q.check.success){
  A.equal(q.diagnosticReport.actorId,p.actorId);
  A.equal(q.diagnosticReport.measuredStrain,q.strainBefore);
  A.equal(q.diagnosticReport.noOtherMindOrExternalClinicianAssumed,true);
  A.equal(q.diagnosticReport.noHealingOrFormationAward,true);
 }
}
const utilized=new Set();
for(const row of repairs){
 const q=row.source,d=diagnoses.find(x=>x.seal===q.originalDiagnosisSourceHash);
 A.ok(d&&d.source.check.success&&d.source.day<q.day);
 A.ok(!utilized.has(d.seal),'Each accepted correction consumes its own actual successful diagnostic receipt');
 utilized.add(d.seal);
 A.equal(d.source.diagnosticReport.measuredStrain,q.strainBefore);
 A.equal(d.source.diagnosticReport.measuredStability,q.stabilityBefore);
 A.equal(q.check.dc,Law.REPAIR_DC);
 A.equal(q.reserveSpent,Law.REPAIR_RESERVE);
 A.equal(q.staminaSpent,Law.repairStamina(q.actualMinutes));
 const change=Law.repairState(q.strainBefore,q.stabilityBefore,q.check);
 A.equal(q.strainAfter,change.strain);
 A.equal(q.stabilityAfter,change.stability);
 A.equal(q.pointsAfter,q.pointsBefore);
}
for(const row of checks.filter(x=>x.source.kind==='form')){
 A.ok(row.source.pointsBefore>=Law.GOAL&&row.source.strainBefore<=2);
}
A.equal(lifeResult.formed,!!lifeResult.earnedProof);
A.ok(lifeResult.sessions.some(x=>x.source.origin===Lattice.NIGHT),
 'Actual ordinary rest still restores reserve, not clinical interference');
console.log('Original independent Soul III self-diagnosis and corrective checks: '+JSON.stringify({
 diagnoses:diagnoses.length,successfulDiagnoses:diagnoses.filter(x=>x.source.check.success).length,
 repairs:repairs.length,successfulRepairs:successfulRepairs.length,
 points:lifeResult.points,strain:lifeResult.strain,formed:lifeResult.formed}));
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
const forgedRepair=E.importGame(saved),fpr=Realm.peek(forgedRepair).emergentPeople.people[p.id],
 counterfeit=fpr.originalSoulLatticeThree.sessions.find(x=>
 x.source.kind==='repair'&&x.source.accepted);
counterfeit.source.originalDiagnosisSourceHash='0'.repeat(64);
counterfeit.seal=hash(counterfeit.source);
A.equal(Lattice.verify(forgedRepair,fpr),false,
 'A resealed repair without a genuinely earlier successful own-pattern diagnosis is forbidden');
const forgedDiagnosis=E.importGame(saved),fpd=Realm.peek(forgedDiagnosis).emergentPeople.people[p.id],
 bad=fpd.originalSoulLatticeThree.sessions.find(x=>
 x.source.kind==='diagnose'&&x.source.check?.success);
bad.source.diagnosticReport.measuredStrain=0;
bad.seal=hash(bad.source);
A.equal(Lattice.verify(forgedDiagnosis,fpd),false,
 'A resealed fabricated own-interference measurement cannot establish repair or power');
console.log('REAL independent Soul II -> original III personal design, actual self-diagnosis and separate source-paid DC14 self-repair checks, save/replay/forgery rejection PASS; seed '+seed);
