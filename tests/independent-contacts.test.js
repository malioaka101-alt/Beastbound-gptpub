'use strict';
// Social facts must result from co-presence and separate independent choices.
// No world tick creates friends or transmits skills merely for elapsed time.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Time=require('../rules/world'),Realm=require('../world/simulation'),
 Emergent=require('../world/emergent-people'),Atlas=require('../world/atlas'),
 Careers=require('../world/person-careers'),Contacts=require('../world/independent-contacts');
function fixture(seed=929110){
 const s=E.newGame({seed,name:'Independent Relationships Fixture'});
 const w=Realm.ensure(s),t=Emergent.ensure(w);
 const reg=Atlas.regions.find(r=>Emergent.siteFor(r.id));
 A.ok(reg,'there must be a physically supported location');
 const eco=w.ecosystems[reg.id],nation=w.countries[reg.polity];
 eco.pressure=20;eco.quality=75;eco.water=75;eco.forage=75;
 nation.stability=72;nation.prosperity=75;
 const source=Emergent.sourceDemand(w,reg);
 A.ok(source,'a person must have a genuine local livelihood cause');
 const actors=[];
 for(let i=0;i<12;i++){
  const p=Emergent._debug.make(w,t,0,source);
  p.shift=Emergent.shift(p,0);
  A.ok(Emergent.verify(w,p));
  A.ok(Emergent.presence(w,p.actorId,p.shift.location,0));
  actors.push(p);
 }
 t.lastSixday=0;
 return {s,w,actors,location:Emergent.siteFor(reg.id)};
}
{
 const {s,w,actors,location}=fixture();
 const social=Contacts.ensure(w);
 A.equal(Contacts.verify(w,social),true);
 A.equal(social.attempts,0);
 A.deepEqual(social.state,{relations:{},knowledge:{}});
 const original=E.exportGame(s),firstRng=s.rngState;
 // Nothing has happened just because people were created in the same town.
 A.equal(Contacts.ensure(w).attempts,0);
 A.equal(E.exportGame(s),original);A.equal(s.rngState,firstRng);
 // The actual world advances people before independently checking meetings.
 Time.advance(s,6);
 A.ok(s.table.realm===w);
 A.equal(Contacts.verify(w,social),true);
 A.ok(social.lastSixday>=6);
 A.ok(social.attempts>=1,'some actual independent meetings should occur');
 A.ok(social.receipts.every(r=>
  r.source.people.every(p=>p.location===location&&
    Contacts._debug.shiftValid(p,r.source.day))));
 A.ok(social.receipts.every(r=>
  ['declined','cooperated','conversed','disagreed'].includes(r.source.decision.kind)));
 A.ok(actors.every(p=>p.knownTechniques.length===0));
 A.ok(actors.every(p=>p.practicedDisciplines.length===0));
 A.equal(s.player.arcane.circles,0);
 A.deepEqual(s.table.emergentConversations,undefined);
 A.deepEqual(s.table.personWorkWitnesses,undefined);
 const before=social.attempts,noChange=E.exportGame(s);
 const again=Contacts.sixday(w,social.lastSixday);
 A.equal(again.duplicate,true);A.equal(social.attempts,before);
 A.equal(E.exportGame(s),noChange);
 const reloaded=E.importGame(noChange),restored=reloaded.table.realm;
 A.equal(Contacts.verify(restored,restored.independentContacts),true);
 A.deepEqual(restored.independentContacts,social);
 // Changing the role, consent or history of a sealed meeting is detectable.
 const tampered=structuredClone(social);
 tampered.receipts[0].source.decision.kind=
  tampered.receipts[0].source.decision.kind==='cooperated'?'declined':'cooperated';
 A.equal(Contacts.verify(w,tampered),false);
 const tamperedRelation=structuredClone(social);
 const pair=Object.keys(tamperedRelation.state.relations)[0];
 tamperedRelation.state.relations[pair].regardA=5;
 A.equal(Contacts.verify(w,tamperedRelation),false);
 const tamperedShift=structuredClone(social);
 tamperedShift.receipts[0].source.people[0].shift.location='elsewhere';
 A.equal(Contacts.verify(w,tamperedShift),false);
 // Every relationship is internal: absent firsthand/player-known witness,
 // there are no suddenly readable NPC secrets, friendships or biographies.
 A.ok(!JSON.stringify(Realm.publicNews(s)).includes('person_'+actors[0].id));
}
{
 const first=fixture(929112);
 const second=E.importGame(E.exportGame(first.s));
 Time.advance(first.s,90);Time.advance(second,90);
 A.deepEqual(first.s.table.realm.independentContacts,
  second.table.realm.independentContacts);
 A.deepEqual(first.s.table.realm.emergentPeople,
  second.table.realm.emergentPeople);
 A.equal(first.s.rngState,second.rngState);
 A.equal(Contacts.verify(first.w,first.w.independentContacts),true);
 A.equal(Contacts.verify(second.table.realm,
  second.table.realm.independentContacts),true);
}
{
 // Source-proven ordinary work MAY be freely offered by one person and
 // received by another, but a contact never copies their professional rank.
 let found=false;
 for(let n=929113;n<929130&&!found;n++){
  const {w,actors}=fixture(n);
  const history=Contacts.ensure(w);
  for(const p of actors){
   Careers.work(w,p,0);
   A.equal(Careers.verify(p),true);
  }
  const snaps=actors.map(p=>Contacts._debug.snapshot(w,p,0));
  for(let i=0;i<snaps.length&&!found;i++){
   for(let j=i+1;j<snaps.length&&!found;j++){
    const a=snaps[i],b=snaps[j];
    const result=Contacts._debug.decision(w.worldSeed,a,b,0);
    if(!result||!['cooperated','conversed'].includes(result.kind))continue;
    const old=JSON.stringify(actors.map(p=>p.career));
    const output=Contacts._debug.record(w,history,[a,b],0);
    if(!output?.sharedOrdinaryMethod)continue;
    A.equal(Contacts.verify(w,history),true);
    A.ok(Object.values(history.state.knowledge).flat().length>=1);
    A.ok(Object.values(history.state.knowledge).flat().every(k=>
      k.learnedCompetence===false&&k.noSpellOrStage===true));
    A.equal(JSON.stringify(actors.map(p=>p.career)),old);
    A.ok(actors.every(p=>p.knownTechniques.length===0));
    const sealed=structuredClone(history);
    sealed.receipts.at(-1).source.shared.work.source.outcome.success=false;
    A.equal(Contacts.verify(w,sealed),false);
    A.throws(()=>Contacts._debug.record(w,history,[a,b],0),
     /cannot be resolved twice/);
    found=true;
   }
  }
 }
 A.ok(found,'some real co-present individuals may independently offer and receive validated ordinary work evidence');
}
console.log('Independent co-present contacts persist, consent or disagreement is individual, genuine vocational leads transfer without free competence, private facts stay sealed and replay is deterministic');
