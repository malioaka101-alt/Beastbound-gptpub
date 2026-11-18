'use strict';
// Stage 2A: earned capability evidence is read from the ORIGINAL owners.
// Disposable witnessed worker; this does not touch Maddoc's save or create
// the imaginary clan elder as a canonical person.
const A=require('node:assert/strict');
const Engine=require('../engine');
const New=require('../scripts/new-campaign');
const Opening=require('../scripts/gm-campaign-opening');
const Rules=require('../rules');
const Realm=require('../world/simulation');
const Lives=require('../world/independent-person-lives');
const People=require('../world/emergent-people');
const Foundations=require('../world/person-mechanical-foundations');

const s=New.create({seed:11082631,slug:'disposable_earned_evidence',
 mode:'guided',homeRegion:'morrowfen_basin',age:10}).state;
const witness='Rowan Flintwell is sorting wicker bundles beside the working-yard gate, and answers an ordinary neighbour about the repairs.';
Opening.apply(s,{place:{placeId:'disposable_evidence_yard',
 name:'Willow Working Yard',regionId:s.campaign.origin.birthRegionId,
 description:'An established work yard for village repairs and local deliveries.',
 kind:'working yard',sceneType:'settlement',
 culture:'Residents make independent decisions about their time, trade and private studies.'},
 scene:witness,focus:'Meet a local person without assuming supernatural ability',
 weather:'Overcast',hour:9,minute:20});
const result=Rules.act(s,{system:'social',operation:'introduceWitnessedPerson',
 params:{name:'Rowan Flintwell',profession:'Village wicker repair worker',
 purpose:'Repair useful baskets and study ways to improve local craft without claiming a mystical breakthrough.',
 personality:'Restless, matter-of-fact and occasionally witty when conversation turns to repairs.',
 background:'A local craftsperson with their own work routines and no established magical history.',
 witness}});
const id=result.npcId,w=Realm.peek(s),p=w.emergentPeople.people[id.slice(9)];
A.equal(People.verify(w,p),true);
const snap=Engine.exportGame(s),playerRng=s.rngState,clock=s.world.minutes;
const e=Foundations.earnedEvidence(w,id);
A.equal(e.privateToGM,true);
A.equal(e.physicalCondition.currentAttributes,null,'Natural traits do not become combat statistics');
A.equal(e.physicalCondition.wounds,null,'Missing wounds are unknown, not healed');
A.equal(e.profession.competenceRank,0,'Office/title cannot award professional rank');
A.equal(e.profession.completedWorkChecks,0);
A.deepEqual(e.profession.verifiedWorkReceipts,[]);
A.equal(e.originalPowerMilestones.meridian.stage,null);
A.equal(e.originalPowerMilestones.arcane.circles,null);
A.equal(e.originalPowerMilestones.soul.phase,null);
A.equal(e.originalPowerMilestones.body.completedCycles,null);
A.equal(e.originalPowerMilestones.rift.step,null);
A.equal(e.originalPowerMilestones.beastOrigin.integrations,null);
A.deepEqual(e.verifiedLearnedTechniques,[]);
A.equal(e.beastRelationships.verifiedPartners,null);
A.equal(e.equipment.verifiedItems,null);
A.equal(Engine.exportGame(s),snap,'Private evidence queries must never mutate world/save');
A.equal(s.rngState,playerRng,'Read-only capabilities must not consume player dice');
A.equal(s.world.minutes,clock);
const publicView=Rules.act(s,{system:'social',operation:'witnessedPeopleStatus',
 params:{npcId:id}});
A.equal(Object.hasOwn(publicView.people[0],'earnedEvidence'),false);
A.equal(Object.hasOwn(publicView.people[0],'originalPowerMilestones'),false);
A.equal(Object.hasOwn(publicView.people[0],'latentPotential'),false);

const enrolled=Lives.enroll(s,{actorId:id,interests:['craft','arcane'],
 motivation:'The worker wants to improve personal basketmaking and is curious about ordinary arcane theory.',
 witness});
A.equal(enrolled.established,true);
const learned=Foundations.gmDossier(Realm.peek(s),id).earnedEvidence;
A.deepEqual(learned.ordinaryIndependentLife.familiarity,{});
A.equal(learned.ordinaryIndependentLife.notSupernaturalAdvancement,true);
A.equal(learned.originalPowerMilestones.arcane.circles,null,
 'Interest is not a Circle');
const save=Engine.exportGame(s),replay=Engine.importGame(save);
A.deepEqual(Foundations.earnedEvidence(Realm.peek(replay),id),learned,
 'Source-backed private evidence is replay-stable');
const liar=Engine.importGame(save),lw=Realm.peek(liar);
lw.emergentPeople.people[p.id].career.supernaturalSystemRanks.arcane=9;
A.throws(()=>Foundations.gmDossier(lw,id),/Unverified|Unverified original/i,
 'Career tampering cannot create an Arcane rank');
const falsePractice=Engine.importGame(save),fw=Realm.peek(falsePractice);
fw.independentPersonLives.people[p.id].metrics.arcane=-1;
A.throws(()=>Foundations.gmDossier(fw,id),/Unverified/i,
 'A forged familiarity ledger is rejected');
const notable=Object.values(w.notables)[0],n=Foundations.gmDossier(w,'notable:'+notable.id);
A.equal(n.earnedEvidence.profession.competenceRank,notable.professional.rank);
A.equal(n.earnedEvidence.disciplinePreparation.path,notable.discipline.path);
A.equal(n.earnedEvidence.disciplinePreparation.actualBreakthroughNotGranted,true);
A.equal(n.earnedEvidence.originalPowerMilestones.arcane.circles,null);
console.log('Living NPC Stage 2A: career/life/notable evidence, unresolved power, privacy, replay and tamper rejection PASS');
