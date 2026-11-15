'use strict';
// Lightweight local acquaintances: stable people and memories, not guaranteed
// encounters or fake completion of an earlier mechanical interaction.
const A=require('node:assert/strict');
const E=require('../engine.js'),New=require('../scripts/new-campaign'),
 Opening=require('../scripts/gm-campaign-opening'),
 Rules=require('../rules'),People=require('../world/emergent-people'),
 Presence=require('../world/person-presence'),
 Realm=require('../world/simulation'),
 Continuity=require('../scripts/scene-continuity');
const s=New.create({seed:947128531,slug:'minor_local_acquaintances_test',
 mode:'guided',homeRegion:'orchard_vales',age:10}).state;
const oldSite='minor_test_homestead',yard='minor_test_yard';
Opening.apply(s,{place:{placeId:oldSite,name:'Minor Test Homestead',
 regionId:'orchard_vales',description:'A family cottage beside the public orchard road where neighbours sometimes tend livestock.',
 kind:'family cottage',sceneType:'structure',culture:'Nearby residents conduct independent household work.'},
 scene:'An older neighbour tends a feed basket at the family cottage gate.',
 focus:'Seek ordinary local help',weather:'Cool and clear',hour:8,minute:18});
const before=s.world.minutes;
Rules.act(s,{system:'world',operation:'establishPlace',params:{
 placeId:yard,name:'Minor Test Yard',regionId:'orchard_vales',
 description:'A shared outdoor beast-handling yard with watering troughs and timber harness posts.',
 kind:'working community yard',sceneType:'structure',
 culture:'Working people have their own shifts and private lives.'}});
const journey=Rules.act(s,{system:'world',operation:'travelTo',params:{
 destinationId:yard,minutes:12,uncontested:true,
 journey:'The player leaves the familiar family cottage gate and takes the public orchard road to the adjacent shared yard without hazards.'}});
A.equal(journey.arrived,true);
const neighbourWitness='An older neighbour tended her feed basket at the cottage gate and talked to Maddoc about finding his parents.';
const handlerWitness='A regular beast handler at the yard joked with Maddoc about his imaginary secret sibling.';
s.chatRuntime.scene=neighbourWitness+' '+handlerWitness;
const input=(name,profession,purpose,personality,background,witness)=>({
 name,profession,purpose,personality,background,witness});
const n=Rules.act(s,{system:'social',operation:'introduceWitnessedPerson',
 params:{...input('Mira Fenlow','Orchard-side animal keeper',
 'Maintain her own small animal enclosures and family garden by the public lane.',
 'Practical and gently humorous without sharing other people’s private affairs.',
 'A nearby long-term resident occupied with ordinary animals, chores and neighbours.',
 neighbourWitness),witnessedPlaceId:oldSite,witnessedMinute:before}});
const h=Rules.act(s,{system:'social',operation:'introduceWitnessedPerson',
 params:input('Darron Pike','Community beast-handling yard worker',
 'Maintain safe carrying harnesses and oversee ordinary handling work at the community yard.',
 'Warm, teasing and observant while still focused on animal welfare and practical duties.',
 'A regular worker at a shared public yard who has his own routine beyond the protagonist.',
 handlerWitness)});
A.equal(n.registered,true);A.equal(h.registered,true);
const w=Realm.peek(s),woman=w.emergentPeople.people[n.npcId.slice(9)],
 worker=w.emergentPeople.people[h.npcId.slice(9)];
A.equal(woman.birthSource.locationId,oldSite);
A.equal(woman.birthSource.worldMinute,before);
A.equal(woman.birthSource.witnessedJourneyHash.length,64);
A.equal(worker.birthSource.locationId,yard);
A.equal(People.verify(w,woman),true);A.equal(People.verify(w,worker),true);
A.equal(s.world.minutes,before+12,'Recording people does not charge another hour');
A.equal(Presence.localStatus(s,w).people.some(p=>p.npcId===n.npcId),false,
 'Earlier neighbour is not teleported into the yard');
A.equal(Presence.localStatus(s,w).people.some(p=>p.npcId===h.npcId),true,
 'The actually witnessed handler is still here in his introductory scene');
A.throws(()=>Rules.act(s,{system:'social',operation:'introduceWitnessedPerson',
 params:{...input('Invented Stranger','An independent worker with no proof',
 'Perform ordinary work away from the player and their chosen actions.',
 'Some personality detail must be given to pass the ordinary checks.',
 'An ordinary background that the GM did not witness in this scene.',
 'There was no witnessed stranger here.'),witnessedPlaceId:oldSite,witnessedMinute:before+1}}),
 /actually introduced|original completed journey/);
const memoryScene='The older neighbour heard Maddoc say he wanted to cultivate Soul. The handler heard his joke about a secret sibling.';
Continuity.apply(s,{id:'minor_acquaintance_memory_947128531',
 mode:'checkpoint',scene:memoryScene,continuity:[
 {id:'minor_neighbour_remembers_soul',action:'record',
 subject:{kind:'person',id:n.npcId},category:'npc-knowledge',
 statement:'The older neighbour heard Maddoc personally announce his Soul cultivation ambition.',
 witness:'The older neighbour heard Maddoc say he wanted to cultivate Soul',
 visibility:'player-known'},
 {id:'minor_handler_remembers_sibling',action:'record',
 subject:{kind:'person',id:h.npcId},category:'npc-knowledge',
 statement:'The yard worker heard Maddoc make a playful remark about a possible secret sibling.',
 witness:'The handler heard his joke about a secret sibling',
 visibility:'player-known'}
 ]});
const saved=E.exportGame(s),restored=E.importGame(saved),
 after=Realm.peek(restored);
A.equal(People.verify(after,after.emergentPeople.people[woman.id]),true);
A.equal(People.verify(after,after.emergentPeople.people[worker.id]),true);
A.equal(restored.chatRuntime.continuity.facts.minor_neighbour_remembers_soul.status,'active');
A.equal(restored.chatRuntime.continuity.facts.minor_handler_remembers_sibling.status,'active');
A.equal(restored.world.minutes,before+12);
const day=Math.floor(s.world.minutes/1440);
const later=[1,2,3,4,5].map(nDay=>People.presence(w,h.npcId,yard,day+nDay));
A.ok(later.some(p=>p===null),'A recurring site never guarantees daily attendance');
A.deepEqual(later,[1,2,3,4,5].map(nDay=>People.presence(w,h.npcId,yard,day+nDay)),
 'Presence does not reroll because the player checks again');
A.equal(People.presence(w,n.npcId,yard,day),null,
 'A local person is not magically visible at an unrelated workplace');
A.equal(Continuity.verify(restored.chatRuntime.continuity),true);
console.log('Minor local acquaintances: anchored retrospective contact, independent intermittent routines, remembered dialogue, no forced summons or fake rewards PASS');
