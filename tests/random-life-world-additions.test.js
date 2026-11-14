'use strict';
// Disposable fixtures only. An ordinary random life can add local canon to its
// own world without overwriting the shared Atlas, grants or retired campaigns.
const A=require('node:assert/strict');
const E=require('../engine');
const New=require('../scripts/new-campaign');
const Atlas=require('../world/atlas');
const Bestiary=require('../world/bestiary');
const Places=require('../world/lived-places');
const Add=require('../scripts/random-life-world-additions');
let made=0,reused=0,knownEcology=0;
const genders=new Set();
for(let seed=1;seed<=160;seed++){
 const args={seed,slug:'new_world_additions_fixture',age:18};
 const first=New.create(args),second=New.create(args);
 A.deepEqual(first,second,'All generated facts must be reproducible from one seed');
 const state=E.importGame(E.exportGame(first.state));
 const record=state.campaign.origin.worldAdditions;
 A.equal(Add.verify(state),true);
 A.deepEqual(record,first.summary.worldAdditions);
 A.equal(state.player.age,18,'User-chosen age cannot be rerolled');
 genders.add(state.player.gender);
 A.equal(state.campaign.openingState,'awaiting-gm');
 A.equal(state.campaign.startingLocation,null);
 A.deepEqual(state.flags.visited,{});
 A.equal(state.chatRuntime.revision,0);
 A.equal(state.table.realm.ticks.sixdays,0);
 A.equal(state.player.humanEvolution.stage,0);
 A.equal(state.player.arcane.circles,0);
 A.equal(state.player.origin.stableTraits.length,0);
 A.equal(state.player.meridian.gatesOpened||0,0);
 A.equal(record.noAutomaticBenefits,true);
 A.equal(record.noNewNpcConsent,true);
 A.equal(record.noLineagePowerGranted,true);
 A.equal(record.noEditedGlobalAtlas,true);
 A.ok(Atlas.R[record.regionId]);
 A.ok(state.player.history.localCustom);
 if(record.locale.source==='created'){
  made++;
  const p=Places.get(state,record.locale.id);
  A.ok(p&&Places.verifyPlace(p));
  A.equal(p.founding.originSeeded,true);
  A.equal(p.regionId,record.regionId);
  A.equal(p.sceneType,'settlement');
  A.equal(state.world.location===p.id,false,'A new hometown is not a forced opening location');
 }else{
  reused++;
  A.equal(record.locale.regionId,record.regionId);
 }
 if(record.localEcology){
  knownEcology++;
  const species=Bestiary.lookup(record.localEcology.taxonId);
  A.equal(species.name,record.localEcology.name);
  A.ok(species.biome.includes(Atlas.R[record.regionId].biome));
  A.equal(record.localEcology.noEncounter,true);
  A.equal(record.localEcology.noPowerGranted,true);
 }
 const frozen=E.exportGame(state);
 A.throws(()=>Add.install(state),/fresh unmodified|require a fresh/i);
 A.equal(E.exportGame(state),frozen,'A duplicate creation attempt cannot change a saved life');
}
A.ok(made>25&&reused>25,'Both old and new home possibilities must occur');
A.ok(knownEcology>100,'World-connected beast records should span normal habitats');
A.ok(genders.has('male')&&genders.has('female')&&genders.has('nonbinary'));
const guided=New.create({seed:87241,slug:'guided_additions_fixture',
 mode:'guided',age:31});
A.equal(guided.summary.worldAdditions,null,'Guided creation does not silently author extras');
A.equal(guided.state.campaign.origin.worldAdditions,undefined);
A.equal(Add.verify(guided.state),false);
A.ok(!guided.state.table.realm.livedPlaces||
 Object.keys(guided.state.table.realm.livedPlaces.places).length===0);
console.log('Random-life world additions: seeded independent places and ecology, age/gender, repeat-proof save records, unchanged original powers, guided opt-out');
