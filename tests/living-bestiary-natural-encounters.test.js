'use strict';
// Disposable end-to-end checks: living bestiary generated on encounter,
// remembered wild individuals, independent autonomy and no invented powers.
// Never operate on campaign saves.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Rules=require('../rules'),W=require('../rules/world'),
 B=require('../world/bestiary'),G=require('../world/generated-wildlife');
const rule=(s,operation,params={})=>Rules.act(s,{
 system:'world',operation,params});
const s=E.newGame({name:'Living bestiary regression',seed:56102931,
 path:'undecided'});
A.equal(E.dispatch(s,'travel forest').ok,true);
const unchanged=E.exportGame(s);
A.throws(()=>rule(s,'fieldTaxonSighting',{speciesId:'tx:moonmoth:0:0:0:0'}),
 /cannot choose a species/);
A.equal(E.exportGame(s),unchanged,
 'Caller cannot choose a new species or change the world on rejection');
let created;
for(let i=0;i<25;i++){
 const r=rule(s,'fieldTaxonSighting');
 if(r.individualSighting?.firstSighting){created=r;break;}
}
A.ok(created,'An actual field encounter can generate an individual from a previously unmaterialised taxon');
A.equal(created.noForcedEncounter,true);
const id=created.individualSighting.beastId,b=s.beasts[id];
A.ok(b&&b.generatedWild&&b.species.startsWith('tx:'));
A.equal(B.lookup(b.species).id,created.id);
A.equal(created.firstRecordedSpeciesSighting,true);
A.equal(G.verify(s,b),true);
A.equal(b.owner,null);
A.equal(b.relationship,'wild');
A.equal(b.evolutionStage,'Unclassified');
A.equal(b.hp,undefined);
A.equal(b.sapience,undefined);
A.equal(b.individualGrade,undefined);
A.equal(b.consent,false);
A.equal(s.encounter,null,'Taxon sighting must not manufacture a combat/bond encounter');
A.ok(s.table.realm.knownSights.some(x=>x.beastId===id&&x.id===b.species));
A.equal(rule(s,'species',{id:b.species}).id,b.species,
 'First witnessed species can be consistently looked up later');
const beforeMem=E.exportGame(s),known=rule(s,'wildMemoriesStatus');
A.ok(known.knownIndividuals.some(x=>x.beastId===id));
A.equal(E.exportGame(s),beforeMem,'Wildlife memories must not mutate time or state');
const copy=E.importGame(E.exportGame(s));
A.equal(G.verify(copy,copy.beasts[id]),true,
 'Generated individual and taxonomy survive exact save roundtrip');
W.advance(s,7);
A.equal(G.verify(s,s.beasts[id]),true);
A.ok(b.individualLife.history.some(x=>x.type==='offscreen-sixday'));
A.equal(b.individualLife.lastTickDay,
 Math.floor(Math.floor(s.world.minutes/1440)/6)*6,
 'Wildlife updates on the genuine sixday clock, not every calendar day');
A.equal(b.hp,undefined,'Offscreen activity cannot invent measured combat stats');
A.equal(s.player.partnerIds.length,0);
// Repeated encounters need not be new species or the same animal:
 // another distinct individual can belong to this already discovered taxon.
let anotherOfSameSpecies=null;
for(let i=0;i<65;i++){
 const r=rule(s,'fieldTaxonSighting');
 if(r.id===b.species&&r.individualSighting?.firstSighting&&
   r.individualSighting.beastId!==id){
  anotherOfSameSpecies=r;break;
 }
}
A.ok(anotherOfSameSpecies,
 'A known generated species should produce new distinct individuals naturally');
A.equal(anotherOfSameSpecies.firstRecordedSpeciesSighting,false);
A.notEqual(anotherOfSameSpecies.individualSighting.beastId,id);
A.equal(G.verify(s,s.beasts[anotherOfSameSpecies.individualSighting.beastId]),true);
let returning=null;
for(let i=0;i<80;i++){
 const r=rule(s,'fieldTaxonSighting');
 if(r.individualSighting?.previouslyWitnessed){
  returning=r;break;
 }
}
A.ok(returning,'An already encountered generated individual sometimes returns organically');
A.ok(s.beasts[returning.individualSighting.beastId].generatedWild.encounterCount>=2);
A.equal(G.verify(s,s.beasts[returning.individualSighting.beastId]),true);
const spent=s.world.minutes,stamina=s.player.stamina;
const searched=rule(s,'seekKnownWildBeast',{beastId:id});
A.equal(searched.searched,true);
A.equal(searched.beastId,id);
A.equal(searched.minutes,45);
A.equal(s.world.minutes,spent+45);
A.equal(s.player.stamina,stamina-3);
A.equal(s.encounter,null,'An unmeasured new species cannot be turned into combat or bond by tracking');
A.equal(G.verify(s,b),true);
A.ok(G.verify(E.importGame(E.exportGame(s)),
 E.importGame(E.exportGame(s)).beasts[id]));
console.log('Living bestiary: first sourced species/individual, real local return, private life, no fabricated profile and save replay PASS');

const knownState=E.newGame({name:'Returning wild beast',seed:811001,path:'undecided'});
A.equal(E.dispatch(knownState,'travel forest').ok,true);
let watched;
for(let i=0;i<45;i++){
 A.equal(E.dispatch(knownState,'explore').ok,true);
 const live=knownState.beasts[knownState.encounter.beastId],
   sp=E.SPECIES[live.species];
 if(!knownState.encounter.threat&&sp.intelligence!=='sapient'&&
   !/terrified|panicked|hostile|fleeing/i.test(live.mood)){
   watched=rule(knownState,'watchWildBeast');break;
 }
 A.equal(E.dispatch(knownState,'leave').ok,true);
}
A.ok(watched,'Test requires an actual original wildlife witness');
const originalId=watched.beastId;
if(knownState.encounter)A.equal(E.dispatch(knownState,'leave').ok,true);
const old=knownState.world.minutes;
W.advance(knownState,12);
// The returning animal may have moved to a genuinely connected compatible
// habitat during the real off-screen sixday; the fixture follows its source
// location without pretending a live player knows it remotely.
const knownAnimal=knownState.beasts[originalId];
if(knownAnimal.location!==knownState.world.location)
 A.equal(E.dispatch(knownState,'travel '+knownAnimal.location).ok,true);
let reunion=false;
for(let i=0;i<85;i++){
 A.equal(E.dispatch(knownState,'explore').ok,true);
 if(knownState.encounter.beastId===originalId){
  const latest=knownState.log.at(-1);
  A.equal(latest.details.returningIndividual,true);
  A.equal(latest.details.previouslyWitnessed,true);
  A.equal(knownState.beasts[originalId].owner,null);
  reunion=true;
  break;
 }
 A.equal(E.dispatch(knownState,'leave').ok,true);
}
A.equal(reunion,true,'Ordinary exploration must sometimes meet the same witnessed beast');
A.equal(E.importGame(E.exportGame(knownState)).beasts[originalId].id,originalId);
console.log('Original wildlife: natural non-forced same-ID reencounter with preserved individual source PASS');
