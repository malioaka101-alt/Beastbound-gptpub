'use strict';
// Unified NPC dossier reads ORIGINAL sapient-beast personhood/earnings.
// No new beast skill, human rank, encounter, cultivation or bond mechanism.
// All fixtures are generated separately from Maddoc's actual save.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Rules=require('../rules'),Time=require('../rules/world'),
 Realm=require('../world/simulation'),
 Sapient=require('../world/sapient-beast-persons'),
 Practice=require('../world/earned-individual-practice'),
 Foundations=require('../world/person-mechanical-foundations');
const s=E.newGame({name:'Disposable Sapient Person Dossier',
 seed:963202,path:'undecided'});
A.equal(E.dispatch(s,'travel forest').ok,true);
let b=null;
for(let n=0;n<150;n++){
 A.equal(E.dispatch(s,'explore').ok,true);
 const encountered=s.beasts[s.encounter.beastId],
  species=E.SPECIES[encountered.species];
 if(species.intelligence==='sapient'&&!s.encounter.threat&&
  !/hostile|agitated|panicked|terrified|fleeing/i.test(encountered.mood)){
  b=encountered;break;
 }
 A.equal(E.dispatch(s,'leave').ok,true);
}
A.ok(b,'The individual must first exist from a real original wild encounter');
const first=Rules.act(s,{system:'social',
 operation:'meetSapientBeast',params:{}});
A.equal(first.encountered,true);
A.equal(Sapient.verify(b),true);
const w=Realm.ensure(s),id='sapient:'+b.id,
 originalLevel=b.level,originalGrade=b.individualGrade,
 originalTechniques=JSON.stringify(b.techniques);
A.equal(Practice.verify(b.sapientLife.practice,id,
 b.sapientLife.sourceHash,Sapient._debug.aptitude(b)),true);
const baseline=Foundations.gmDossier(w,id,s);
A.equal(baseline.known,true);
A.equal(baseline.kind,'independent-sapient-beast-person');
A.equal(baseline.privateToGM,true);
A.equal(baseline.species,b.species);
A.equal(baseline.earnedEvidence.witnessedEncounterHash,
 b.sapientLife.source.encounterHash);
A.equal(baseline.earnedEvidence.autonomousEarnedWork.completedAttempts,0);
A.equal(baseline.earnedEvidence.humanDisciplineProgression,null);
A.equal(baseline.earnedEvidence.speciesEvolutionMilestones,null);
A.equal(baseline.earnedEvidence.actualLearnedTechniqueEvents,null);
A.equal(baseline.earnedEvidence.partnerConsentEvidence,null);
A.equal(baseline.humanBaselineAttributes,null);
A.equal(baseline.humanLatentPotential,null);
A.equal(baseline.noAssumedPartnershipOrPlayerKnowledge,true);
const untouched=E.exportGame(s),prng=s.rngState,
 clock=s.world.minutes,pRng=b.sapientLife.rngState;
A.deepEqual(Foundations.earnedEvidence(w,id,s),baseline.earnedEvidence);
A.equal(E.exportGame(s),untouched,'The GM-only read must not write');
A.equal(s.rngState,prng);
A.equal(s.world.minutes,clock);
A.equal(b.sapientLife.rngState,pRng);
A.throws(()=>Foundations.gmDossier(w,id),/matching original game state/);
const mismatched=E.importGame(untouched);
A.throws(()=>Foundations.gmDossier(w,id,mismatched),
 /matching original game state/,'No mixing individual evidence from distinct game states');
A.deepEqual(Foundations.gmDossier(w,'sapient:unknown_person',s),
 {known:false},'A missing individual must not be created from a GM read');
const publicView=Rules.act(s,{system:'social',
 operation:'sapientBeastMemoriesStatus',params:{}});
A.equal(publicView.personallyWitnessedContacts.length,1);
A.equal(JSON.stringify(publicView).includes('earnedPracticalPoints'),false);
A.equal(JSON.stringify(publicView).includes('originalReceipt'),false);
A.equal(JSON.stringify(publicView).includes('aptitude'),false);
if(s.encounter)A.equal(E.dispatch(s,'leave').ok,true);
Time.advance(s,180);
const life=b.sapientLife,verified=Foundations.gmDossier(Realm.peek(s),id,s);
A.ok(life.practice.attempts>0,
 'Source-owned sixday agency must create at least one actual individual task');
A.equal(verified.earnedEvidence.autonomousEarnedWork.completedAttempts,
 life.practice.attempts);
A.equal(verified.earnedEvidence.autonomousEarnedWork.sourceHash,
 life.practice.sourceHash);
for(const domain of verified.earnedEvidence.autonomousEarnedWork.domains){
 A.equal(domain.earnedPracticalPoints,life.practice.points[domain.domain]);
 A.deepEqual(domain.demonstratedMethods,
  life.practice.successfulMethods[domain.domain]);
}
A.deepEqual(verified.earnedEvidence.autonomousEarnedWork.recentOriginalReceipts,
 life.practice.receipts.map(r=>({
  sourceHash:r.hash,day:r.source.day,domain:r.source.domain,
  method:r.source.method,success:r.source.result.success,
  earned:r.source.result.earned
 })));
A.equal(b.level,originalLevel);
A.equal(b.individualGrade,originalGrade);
A.equal(JSON.stringify(b.techniques),originalTechniques);
A.equal(verified.earnedEvidence.humanDisciplineProgression,null);
A.equal(verified.earnedEvidence.partnerConsentEvidence,null);
const saved=E.exportGame(s),replay=E.importGame(saved);
A.deepEqual(Foundations.gmDossier(Realm.peek(replay),id,replay),verified,
 'Verified original person and earned work survive a full engine save');
const falsePoints=E.importGame(saved),fake=falsePoints.beasts[b.id];
fake.sapientLife.practice.points['field-judgement']=9999;
A.equal(Sapient.verify(fake),false);
A.throws(()=>Foundations.gmDossier(Realm.peek(falsePoints),id,falsePoints),
 /Unverified original sapient-person/,
 'Falsified competence must never enter the GM dossier');
const falseOrigin=E.importGame(saved),fakeOrigin=falseOrigin.beasts[b.id];
fakeOrigin.sapientLife.source.species='falsified_animal';
A.throws(()=>Foundations.gmDossier(Realm.peek(falseOrigin),id,falseOrigin),
 /Unverified original sapient-person/,
 'Cannot attach a real encounter to a different fabricated species');
A.equal(E.exportGame(s),saved);
const another=Object.values(Realm.peek(s).notables)[0];
A.equal(Foundations.gmDossier(Realm.peek(s),'notable:'+another.id).known,true,
 'Established human NPC dossiers continue to work without a game-state argument');
console.log('Living NPC sapient bridge: original species-personhood, autonomous earned practice, privacy, identity, replay, source-tamper and no human rank/bond PASS');
