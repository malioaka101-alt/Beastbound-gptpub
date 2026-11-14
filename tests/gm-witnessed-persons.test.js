'use strict';
// Regression for GM-created people through the EXISTING independent citizen
// life, physical presence and local-conversation ledger. Disposable only.
const A=require('node:assert/strict'),E=require('../engine'),
 New=require('../scripts/new-campaign'),Opening=require('../scripts/gm-campaign-opening'),
 Person=require('../world/emergent-people'),Presence=require('../world/person-presence'),
 Realm=require('../world/simulation'),Rules=require('../rules'),World=require('../rules/world');
const s=New.create({seed:912433101,slug:'gm_lived_person_test',
 mode:'guided',homeRegion:'morrowfen_basin',age:10}).state;
const name='Alder Vale',basis='The GM directly witnessed Alder checking the local orchard paths beside the player.';
const p={name,profession:'Travelling orchard surveyor',
 purpose:'Map seasonal orchard footpaths and document broken stone crossings.',
 personality:'Careful, softly spoken and occasionally argumentative about maps.',
 background:'A travelling worker who studies ordinary orchard routes and chooses their own appointments.',
 witness:basis};
A.throws(()=>Rules.act(s,{system:'social',operation:'introduceWitnessedPerson',params:p}),
 /actually introduced/);
Opening.apply(s,{place:{placeId:'gm_witnessed_cottage_test',
 name:'The Cider Cottage',regionId:s.campaign.origin.birthRegionId,
 description:'A small working cottage on a well-used orchard lane with a bench and muddy boots.',
 kind:'family cottage',sceneType:'settlement',
 culture:'Neighbours discuss work without automatically owing each other services.'},
 scene:'Alder Vale is visibly standing near the cottage, studying orchard paths while the player listens.',
 focus:'Meet the travelling surveyor',weather:'Cool and clear',hour:10,minute:20});
const minute=s.world.minutes,playerRng=s.rngState,coins=s.player.coins;
A.throws(()=>Rules.act(s,{system:'social',operation:'introduceWitnessedPerson',
 params:{...p,coins:100}}),/GM individual needs/);
const result=Rules.act(s,{system:'social',operation:'introduceWitnessedPerson',params:p});
A.equal(result.registered,true);
A.equal(result.usesExistingLivingPersonLedger,true);
A.equal(s.world.minutes,minute,'Documented presence does not advance time or manufacture a new meeting');
A.equal(s.rngState,playerRng,'New NPC uses only its seeded independent personal RNG');
A.equal(s.player.coins,coins,'No invented money');
const w=Realm.peek(s),person=w.emergentPeople.people[result.npcId.slice('emergent:'.length)];
A.equal(Person.verify(w,person),true);
A.equal(person.birthSource.locationId,s.world.location);
A.equal(person.cashScales,0);
A.equal(person.career.competenceRank,0);
A.ok(Presence.localStatus(s,w).people.some(x=>x.npcId===result.npcId));
const presence=Presence.resolve(w,result.npcId,s.world.location,0);
A.ok(presence?.presence,'Registered actor must have a genuinely source-verified lived-place shift');
A.equal(Presence.proof(w,result.npcId,s.world.location,0,presence.presence),true);
const report=Rules.act(s,{system:'social',operation:'witnessedPeopleStatus',params:{npcId:result.npcId}});
A.equal(report.people[0].name,name);
A.equal(report.people[0].observedHere,true);
A.throws(()=>Rules.act(s,{system:'social',operation:'introduceWitnessedPerson',params:p}),
 /already exists here/);
const save=E.exportGame(s),restored=E.importGame(save);
A.equal(Person.verify(Realm.peek(restored),Realm.peek(restored).emergentPeople.people[person.id]),true);
A.ok(Presence.localStatus(restored,Realm.peek(restored)).people.some(x=>x.npcId===result.npcId));
const convo=Rules.act(restored,{system:'social',operation:'speakLocalPerson',
 params:{npcId:result.npcId,question:'What work are you doing here?'}});
A.equal(convo.met,true);
A.equal(convo.npcId,result.npcId);
A.equal(typeof convo.spoke,'boolean','Independently free to answer or decline');
const afterConvo=E.importGame(E.exportGame(restored));
World.advance(afterConvo,6);
const actor=Realm.peek(afterConvo).emergentPeople.people[person.id];
A.equal(Person.verify(Realm.peek(afterConvo),actor),true);
A.ok(actor.lastTickDay>0&&actor.lastTickDay<=Math.floor(afterConvo.world.minutes/1440),
 'The calendar-anchored sixday world update preserves independent life');
A.equal(actor.birthSource.name,name);
const altered=E.importGame(save);
altered.table.realm.emergentPeople.people[person.id].birthSource.name='Someone Else';
A.equal(Person.verify(Realm.peek(altered),altered.table.realm.emergentPeople.people[person.id]),false);
console.log('GM individual foundation: witnessed living-place registration, original citizen career and conversation, per-actor independent world updates, sealed source, replay-safe save, no free gains or consent');
