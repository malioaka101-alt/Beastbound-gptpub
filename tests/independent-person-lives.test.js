'use strict';
// Disposable integration: two established children remain independently free.
// No speculative training, forced reunion, salary, magical stage or NPC data leak.
const A=require('node:assert/strict'),E=require('../engine.js'),
 New=require('../scripts/new-campaign'),Opening=require('../scripts/gm-campaign-opening'),
 R=require('../rules'),Realm=require('../world/simulation'),
 Person=require('../world/emergent-people'),
 Lives=require('../world/independent-person-lives'),
 Presence=require('../world/person-presence'),World=require('../rules/world');
const s=New.create({seed:82910473,slug:'independent_peers_regression',
 mode:'guided',homeRegion:'orchard_vales',age:10}).state;
Opening.apply(s,{place:{
 placeId:'peer_test_home',name:'Peer Test Homestead',
 regionId:'orchard_vales',description:'A homestead on a worked orchard lane, with neighbours and a nearby practice ground.',
 kind:'family cottage',sceneType:'structure',culture:'Children study independently and live around ordinary household responsibilities.'},
 scene:'Maddoc is at his family homestead on a clear morning.',
 focus:'Observe ordinary learning',weather:'Cool and clear',hour:8,minute:0});
R.act(s,{system:'world',operation:'establishPlace',params:{
 placeId:'peer_test_common',name:'Peer Test Common',
 regionId:'orchard_vales',description:'A familiar community green with public training grounds and a reading house.',
 kind:'hamlet common',sceneType:'settlement',
 culture:'Community learning is open but does not force student careers or magical progress.'}});
const moved=R.act(s,{system:'world',operation:'travelTo',params:{
 destinationId:'peer_test_common',minutes:15,
 journey:'The player walked with Tessa and Bram by the public orchard road from the family cottage to the hamlet training and reading spaces.',
 uncontested:true}});
A.equal(moved.arrived,true);
const witness='Maddoc personally met Tessa and Bram at the community green, and both spoke about the lessons they wanted to explore.';
(s.chatRuntime.journal||=([])).push({day:1,text:witness});
const returnHome=R.act(s,{system:'world',operation:'travelTo',params:{
 destinationId:'peer_test_home',minutes:15,
 journey:'Maddoc returned by the safe public orchard lane without claiming either friend travelled with him.',
 uncontested:true}});
A.equal(returnHome.arrived,true);
World.advance(s,2);
A.equal(s.world.location,'peer_test_home');
s.chatRuntime.scene='Maddoc is now at home; the people met earlier are not presumed present.';
const make=(name,profession,purpose,personality,background)=>({
 name,profession,purpose,personality,background,
 witness:'The earlier community meeting with the two young learners was a witnessed social encounter, not an automatic skill award.',
 journalWitness:witness,historicalPlaceId:'peer_test_common'
});
const t=R.act(s,{system:'social',operation:'introduceWitnessedPerson',
 params:make('Tessa','Young martial learner',
  'Practise supervised footwork and explore Meridian anatomy without compulsory training.',
  'Persistent, frank, and willing to challenge an instructor.',
  'A young local learner with friends and chores besides interest in physical practice.')});
// Simulate the short journal having pruned the original witness; the original
// saved completed journey must still establish Bram without inventing a visit.
s.chatRuntime.summary=witness;
s.chatRuntime.journal=[];
const bramFields=make('Bram','Young arcane reader',
  'Investigate Arcane foundations and learn how patterns work without guaranteed magical powers.',
  'Inquisitive and patient, with time for friends and other priorities.',
  'A young local reader who can work on ordinary learning and neighbourhood responsibilities.');
delete bramFields.journalWitness;
bramFields.journeyWitness='The player walked with Tessa and Bram by the public orchard road';
const b=R.act(s,{system:'social',operation:'introduceWitnessedPerson',
 params:bramFields});
A.equal(t.registered,true);A.equal(b.registered,true);
const world=Realm.peek(s),day=Math.floor(s.world.minutes/1440);
A.equal(Person.presence(world,t.npcId,'peer_test_home',day),null);
A.equal(Person.presence(world,b.npcId,'peer_test_home',day),null);
A.equal(Person.presence(world,t.npcId,'peer_test_common',day),null,
 'Historical meeting does not force a same-day reunion');
A.equal(Person.presence(world,b.npcId,'peer_test_common',day),null);
A.equal(world.emergentPeople.people[t.npcId.slice(9)].birthSource.retroactiveProgressDenied,true);
A.equal(world.emergentPeople.people[b.npcId.slice(9)].birthSource.retroactiveProgressDenied,true);
A.equal(world.emergentPeople.people[b.npcId.slice(9)].birthSource.historicalJourneyHash.length,64,
 'Immutable original completed journey persists after journal pruning');
const tLife=R.act(s,{system:'social',operation:'establishIndependentLife',params:{
 actorId:t.npcId,interests:['martial','meridian','community','craft'],
 motivation:'Tessa is interested in martial exercises and Meridian learning but is also a child with other priorities.',
 witness:'Maddoc personally met Tessa and Bram at the community green'}});
const bLife=R.act(s,{system:'social',operation:'establishIndependentLife',params:{
 actorId:b.npcId,interests:['arcane','academic','craft','community'],
 motivation:'Bram wants to study Arcane foundations while keeping room for friendships and ordinary community tasks.',
 witness:'Maddoc personally met Tessa and Bram at the community green'}});
A.equal(tLife.established,true);A.equal(bLife.established,true);
const saveBefore=E.exportGame(s),start=s.world.minutes;
const initial=R.act(s,{system:'social',operation:'independentLifeStatus'});
A.equal(initial.people.length,2);
A.ok(initial.people.every(p=>!Object.keys(p.ordinaryPracticeIndicators).length));
A.equal(s.world.minutes,start,'Read-only personal life does not cost time');
A.equal(E.exportGame(s),saveBefore,'Read-only personal life does not mutate state');
World.advance(s,25);
const later=R.act(s,{system:'social',operation:'independentLifeStatus'});
A.equal(later.people.length,2);
for(const q of Object.values(Realm.peek(s).independentPersonLives.people)){
 A.equal(q.lastDay,Math.floor(s.world.minutes/1440));
 A.ok(q.history.length>=20);
 A.equal(Lives.verifyEntry(Realm.peek(s),q),true);
 A.ok(q.history.some(x=>x.source.action==='rest'));
 A.ok(q.history.some(x=>['local-chores','job-preparation','friends','explore','change-focus'].includes(x.source.action)),
  'Independent characters have legitimate lives beyond their starting cultivation interests');
}
const afterSave=E.importGame(E.exportGame(s));
A.equal(Object.values(Realm.peek(afterSave).independentPersonLives.people).every(p=>
 Lives.verifyEntry(Realm.peek(afterSave),p)),true);
const mage=Realm.peek(afterSave).emergentPeople.people[b.npcId.slice(9)];
const fighter=Realm.peek(afterSave).emergentPeople.people[t.npcId.slice(9)];
A.deepEqual(mage.practicedDisciplines,[]);A.deepEqual(fighter.practicedDisciplines,[]);
A.deepEqual(mage.knownTechniques,[]);A.deepEqual(fighter.knownTechniques,[]);
A.equal(s.player.coins,afterSave.player.coins);
// A genuinely met working adult can take an evidenced original duty even
// between sixday boundaries. Future work, if chosen, remains Career-owned.
const jobWitness='Caro Valeweaver checks actual worn harness fittings near the orchard shed with her own tools.';
s.chatRuntime.scene=jobWitness;
const caretaker=R.act(s,{system:'social',operation:'introduceWitnessedPerson',params:{
 name:'Caro Valeweaver',profession:'Independent harness repair worker',
 purpose:'Repair weathered beast harness fittings for ordinary orchard safety and her own livelihood.',
 personality:'Methodical, self-directed and protective of animals near the working yard.',
 background:'An independent local repair worker with her own practical work routines and responsibilities.',
 witness:jobWitness}});
A.equal(caretaker.registered,true);
const original=R.act(s,{system:'social',operation:'authorWitnessedPersonDuty',params:{
 npcId:caretaker.npcId,id:'local_harness_upkeep',role:'Independent orchard harness maintenance worker',
 method:'harness-repair',goal:'Maintain worn carrying-harness fittings to reduce ordinary handling accidents.',
 domain:'trade',witness:jobWitness}});
A.equal(original.available,true,'Real witnessed duties can be authored on ordinary days');
const jobActor=Realm.peek(s).emergentPeople.people[caretaker.npcId.slice(9)];
A.equal(jobActor.career.authoredDuties.length,1);
A.equal(jobActor.cashScales,0,'A possible job is not a cash payment');
const jobLife=R.act(s,{system:'social',operation:'establishIndependentLife',params:{
 actorId:caretaker.npcId,interests:['livelihood','craft','community'],
 motivation:'Caro balances her repair work with her private life and community obligations.',
 witness:jobWitness}});
A.equal(jobLife.established,true);
const pastCount=jobActor.career.workCount;
World.advance(s,7);
const working=Realm.peek(s).emergentPeople.people[caretaker.npcId.slice(9)];
A.ok(working.career.workCount>=pastCount,
 'Original career work, when independently selected, must retain its own receipts');
A.equal(working.cashScales,0,'No invented cash wages from ordinary activity');
A.throws(()=>R.act(s,{system:'social',operation:'introduceWitnessedPerson',
 params:make('Fake Person','Unverified worker','A full-time dream of magical rank without evidence.',
 'No legitimate observed personality.',
 'This person has not appeared in the actual journal or played world.')}),
 /earlier|actually introduced/);
console.log('Independent characters: historical witness, no forced reunion, own daily training/study/work/social/rest decisions, source checks, untouched magic and safe save replay PASS');


// Population regression: many independently sourced minor locals in one
// settlement must not collide, leak private lives, create powers or change
// the player on registration. This is disposable test state, not a save edit.
const bulkStart=s.world.minutes,coinsBefore=s.player.coins;
const added=[];
for(let i=0;i<40;i++){
 const name='Local Resident '+String(i+1).padStart(2,'0');
 const witness=name+' was personally encountered at the homestead during ordinary daily neighbourhood activity.';
 s.chatRuntime.scene=witness;
 const created=R.act(s,{system:'social',operation:'introduceWitnessedPerson',params:{
  name,profession:'Independent orchard community worker',
  purpose:'Carry out ordinary local responsibilities and pursue a personal life outside the player story.',
  personality:'Self-directed, practical and differently occupied from other local residents.',
  background:'A local adult with ordinary community obligations, private social ties and independent routines.',
  witness
 }});
 A.equal(created.registered,true);
 const lived=R.act(s,{system:'social',operation:'establishIndependentLife',params:{
  actorId:created.npcId,interests:['community','craft','livelihood'],
  motivation:'This neighbour maintains an independent balance of livelihood, private priorities and friendships.',
  witness
 }});
 A.equal(lived.established,true);
 added.push(created.npcId);
}
A.equal(new Set(added).size,40,'Many NPCs must retain distinct identities');
A.equal(s.world.minutes,bulkStart,'NPC registration does not consume player time');
A.equal(s.player.coins,coinsBefore,'NPC registration does not spend or award player money');
const countBefore=Object.keys(Realm.peek(s).independentPersonLives.people).length;
A.ok(countBefore>=43,'Existing friends and worker remain alongside the additional locals');
World.advance(s,30);
const advanced=Realm.peek(s);
for(const actorId of added){
 const id=actorId.slice('emergent:'.length),person=advanced.emergentPeople.people[id],
  life=advanced.independentPersonLives.people[id];
 A.ok(person&&life,'Each individually witnessed NPC remains in the ledger');
 A.equal(Person.verify(advanced,person),true);
 A.equal(Lives.verifyEntry(advanced,life),true);
 A.equal(life.lastDay,Math.floor(s.world.minutes/1440));
 A.ok(life.history.length>0,'Every NPC received independent daily activity');
 A.deepEqual(person.practicedDisciplines,[],'Ordinary practice must not grant magical ranks');
 A.deepEqual(person.knownTechniques,[],'Ordinary learning does not award techniques');
 A.equal(person.cashScales,0,'Independent activity does not mint wages');
}
const restored=E.importGame(E.exportGame(s));
const persisted=Realm.peek(restored);
A.equal(Object.keys(persisted.independentPersonLives.people).length,countBefore);
A.equal(new Set(added.map(id=>persisted.emergentPeople.people[id.slice(9)]?.actorId)).size,40);
A.ok(added.every(id=>Lives.verifyEntry(persisted,persisted.independentPersonLives.people[id.slice(9)])),
 'All independently living NPC records survive exact save roundtrip');
A.equal(restored.player.coins,s.player.coins);
console.log('40 additional witnessed independent NPCs: distinct IDs, 30-day autonomy, no unearned awards, save roundtrip PASS');
