'use strict';
// Bounded multi-person live acceptance. The earlier Phase I preparation
// is the disclosed synthetic source-replayed fixture. Nothing AFTER the
// genuine Phase I rite is selected, assigned, or preloaded.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine'),Rules=require('../rules'),World=require('../rules/world'),
 Realm=require('../world/simulation'),Lives=require('../world/independent-person-lives'),
 Early=require('../rules/independent-original-discipline-preparation'),
 Thread=require('../rules/independent-original-soul-thread-two'),
 Lattice=require('../rules/independent-original-soul-lattice-three'),
 Law=require('../rules/soul-shared-original-resonance-lattice'),
 Health=require('../rules/unified'),Build=require('../rules/build'),
 Foundation=require('../world/person-mechanical-foundations');
const {fixture}=require('./living-npc-original-soul-body-rift-first-milestones.test.js');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const candidates=[];
for(let i=0;i<12;i++){
 const seed=975000+i*73,f=fixture('soul','breakthrough',seed);
 candidates.push({...f,seed,wis:f.p.mechanicalFoundation.baselineAttributes.wis});
}
// Native attribute sampling only; none of the future personal-day choices
// or dice have been seen. Simulate all four selected high-Wisdom persons.
candidates.sort((a,b)=>b.wis-a.wis||a.seed-b.seed);
let surveyed=0,checks=0,successes=0,formations=0,formed=0;
const reports=[];
for(const {s,p,day,seed,wis} of candidates.slice(0,4)){
 const rite=Rules.act(s,{system:'discipline',operation:'npcOriginalFirstMilestone',
  params:{actorId:p.actorId,system:'soul'}});
 A.equal(rite.observedOutcome,'breakthrough');
 const w=Realm.peek(s),life=w.independentPersonLives.people[p.id];
 life.lastDay=day;
 A.equal(Lives.verifyEntry(w,life),true);
 const before=s.world.minutes,target=day*1440+990;
 E.advance(s,target-before);World.finalizeTime(s,before);
 const witness=p.name+' personally chooses a genuinely safe room at home for eight hours of sleep, witnessed while preparing for bed.';
 s.chatRuntime.scene='A real safe room and individual voluntary rest opportunity: '+witness;
 const night=Rules.act(s,{system:'health',operation:'witnessedNpcNightSleep',
  params:{actorId:p.actorId,witness}});
 if(!night.freelyAccepted){
  reports.push({seed,wis,night:'declined'});continue;
 }
 surveyed++;
 A.equal(Health.verifyNpcNightHistory(s,p.actorId),true);
 for(let interval=0;interval<24;interval++){
  const t=s.world.minutes;
  E.advance(s,30*1440);World.finalizeTime(s,t);
  if(p.originalSoulLatticeThree?.formed)break;
 }
 A.equal(Early.verify(s,p),true);
 A.equal(Thread.verify(s,p),true);
 A.equal(Lattice.verify(s,p),true);
 const r=p.originalSoulLatticeThree,rows=r?.sessions||[],
  counters=rows.filter(x=>x.source.kind==='countertest'&&x.source.accepted),
  attempts=rows.filter(x=>x.source.kind==='form'&&x.source.accepted),
  used=new Set(),spec=Lattice.formationCountertestSpec(Math.floor((wis-10)/2));
 checks+=counters.length;successes+=counters.filter(x=>x.source.check.success).length;
 formations+=attempts.length;if(r?.formed)formed++;
 for(const row of counters){
  const q=row.source;
  A.equal(q.pointsBefore,Law.GOAL);A.ok(q.strainBefore<=2);
  A.equal(q.check.dc,spec.dc);A.equal(q.check.modifier,spec.modifier);
  A.equal(q.actualMinutes,spec.minutes);
  A.equal(q.reserveSpent,spec.reserveCost);A.equal(q.staminaSpent,spec.staminaCost);
  A.equal(q.pointsAfter,q.pointsBefore);A.equal(q.strainAfter,q.strainBefore);
  A.equal(q.formedAfter,false);
  A.equal(!!q.formationCountertest,q.check.success);
  if(q.check.success){
   const v=q.formationCountertest;
   A.equal(v.individualIdentityOriginHash,p.originHash);
   A.equal(v.independentResponseVerified,true);
   A.equal(v.identityBoundaryStopVerified,true);
   A.equal(v.originalPersonalMapHash,hash(r.personalBlueprint));
   A.ok(rows.some(x=>x.seal===v.originalStructuralPracticeSourceHash&&
    x.source.kind==='practice'&&x.source.check.success&&x.source.pointsAfter===Law.GOAL));
  }else A.equal(q.formationCountertest,null);
 }
 for(const row of attempts){
  const q=row.source,prior=counters.find(x=>x.seal===q.originalFormationCountertestHash);
  A.ok(prior&&prior.source.check.success&&prior.source.day<q.day);
  A.ok(!used.has(prior.seal));used.add(prior.seal);
  A.equal(prior.source.formationCountertest.location,q.offscreenOpportunity.privatePhysicalSite);
  A.equal(q.check.dc,Law.FORMATION_DC);
  A.equal(q.reserveSpent,4);A.equal(q.staminaSpent,3);A.equal(q.actualMinutes,90);
  A.equal(q.formedAfter,q.check.success);
 }
 if(r?.formed){
  const win=attempts.find(x=>x.source.check.success);
  A.equal(r.originalFormationSourceHash,win.seal);
  A.equal(r.earnedProof.latticeIntegrity,1);
  A.equal(r.earnedProof.perceptionRangeMetres,Build.soulProfile(3,{will:spec.modifier}).perceptionRangeMetres);
 }
 const dossier=Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence;
 if(r){
  A.equal(dossier.originalSoulResonanceLatticeThree.verifiedSoulPhase,r.formed?3:2);
  A.equal(dossier.originalSoulResonanceLatticeThree.sourceVerifiedFormationCountertests,counters.length);
 }
 A.deepEqual(p.knownTechniques,[]);
 const saved=E.exportGame(s),copy=E.importGame(saved),cp=Realm.peek(copy).emergentPeople.people[p.id];
 A.equal(Lattice.verify(copy,cp),true);
 if(counters.some(x=>x.source.check.success)){
  const bad=E.importGame(saved),bp=Realm.peek(bad).emergentPeople.people[p.id],
   edited=bp.originalSoulLatticeThree.sessions.find(x=>x.source.kind==='countertest'&&x.source.check?.success);
  edited.source.formationCountertest.identityBoundaryStopVerified=false;
  edited.seal=hash(edited.source);
  A.equal(Lattice.verify(bad,bp),false,'A false identity stop is never a genuine formation witness');
 }
 if(attempts.length){
  const bad=E.importGame(saved),bp=Realm.peek(bad).emergentPeople.people[p.id],
   edited=bp.originalSoulLatticeThree.sessions.find(x=>x.source.kind==='form'&&x.source.accepted);
  edited.source.originalFormationCountertestHash='0'.repeat(64);edited.seal=hash(edited.source);
  A.equal(Lattice.verify(bad,bp),false,'A resealed formation without its original countertest is invalid');
 }
 reports.push({seed,wis,threadFormed:!!p.originalSoulThreadTwo?.completed,
  points:r?.points??0,strain:r?.strain??null,stability:r?.soulStability??null,
  sessions:rows.length,countertests:counters.length,formationAttempts:attempts.length,formed:!!r?.formed});
}
A.ok(surveyed>0,'At least one genuine sampled actor must accept the original safe room');
console.log('SOUL III INDEPENDENT IDENTITY FORMATION ASSESSMENT PASS '+JSON.stringify({surveyed,checks,successes,formations,formed,reports}));
console.log(formed?'Original full Soul III genuinely earned in sample':'Full Soul III formation remains unproven; no forced personal choices or altered dice');
