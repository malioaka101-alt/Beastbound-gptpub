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
 journey:'The player walked by the public orchard road from the family cottage to the hamlet training and reading spaces.',
 uncontested:true}});
A.equal(moved.arrived,true);
const witness='Maddoc personally met Tessa and Bram at the community green, and both spoke about the lessons they wanted to explore.';
s.chatRuntime.journal.push({day:1,text:witness});
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
const b=R.act(s,{system:'social',operation:'introduceWitnessedPerson',
 params:make('Bram','Young arcane reader',
  'Investigate Arcane foundations and learn how patterns work without guaranteed magical powers.',
  'Inquisitive and patient, with time for friends and other priorities.',
  'A young local reader who can work on ordinary learning and neighbourhood responsibilities.')});
A.equal(t.registered,true);A.equal(b.registered,true);
const world=Realm.peek(s),day=Math.floor(s.world.minutes/1440);
A.equal(Person.presence(world,t.npcId,'peer_test_home',day),null);
A.equal(Person.presence(world,b.npcId,'peer_test_home',day),null);
A.equal(Person.presence(world,t.npcId,'peer_test_common',day),null,
 'Historical meeting does not force a same-day reunion');
A.equal(Person.presence(world,b.npcId,'peer_test_common',day),null);
A.equal(world.emergentPeople.people[t.npcId.slice(9)].birthSource.retroactiveProgressDenied,true);
A.equal(world.emergentPeople.people[b.npcId.slice(9)].birthSource.retroactiveProgressDenied,true);
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
A.throws(()=>R.act(s,{system:'social',operation:'introduceWitnessedPerson',
 params:make('Fake Person','Unverified worker','A full-time dream of magical rank without evidence.',
 'No legitimate observed personality.',
 'This person has not appeared in the actual journal or played world.')}),
 /earlier|actually introduced/);
console.log('Independent characters: historical witness, no forced reunion, own daily training/study/work/social/rest decisions, source checks, untouched magic and safe save replay PASS');
