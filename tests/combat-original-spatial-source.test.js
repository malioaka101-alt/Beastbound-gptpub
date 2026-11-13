'use strict';
// #23: The original local wildlife encounter is the only owner of measured
// starting distance. Existing wound combat owns cover, time, independent
// opponent decisions and all actual injuries.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),Agency=require('../rules/combat-agency'),
 Core=require('../rules/core');
const act=(s,op,params={})=>R.act(s,{system:'combat',operation:op,params});
function setup(seed){
 const s=E.newGame({name:'Witnessed Tactical Space Test',seed});
 A.equal(E.dispatch(s,'travel forest').ok,true);
 A.equal(E.dispatch(s,'explore').ok,true);
 const distance=s.encounter.distanceMetres, id=s.encounter.beastId,
  beast=s.beasts[id];
 A.ok(distance>=2&&distance<=17);
 A.ok(s.log.some(e=>e.type==='encounter'&&
  e.details?.origin==='engine-local-wildlife-encounter'&&
  e.details.beastId===id&&e.details.distanceMetres===distance));
 // A disposable individual appraisal using the same original verified
 // combatant contract as the existing combat-profile regression.
 beast.combatAssessment={beastId:id,species:beast.species,
  evolutionStage:beast.evolutionStage,sapience:beast.sapience,
  worldMinute:s.world.minutes,
  source:'Actual field-observed anatomy and temperament of the individual local wild beast',
  behavior:{style:'predatory',nonlethal:true,canCommunicate:false,
   withdrawalDC:15,parleyDC:19,
   source:'Previously observed independent defensive and pursuit tendencies of this individual'},
  stats:{toughness:60,defense:12,stamina:8,vigor:1,will:1,
   offM:0,durM:0,sapience:beast.sapience,
   attack:2,damage:0,boxes:[3,2,1]}};
 return {s,id,distance};
}
const {s,id,distance}=setup(231321);
const before=s.rngState;
const opened=act(s,'begin',{beastId:id});
A.equal(opened.started,true);
A.equal(opened.startingDistanceMetres,distance);
A.equal(s.rngState,before,'measuring the existing separation makes no second roll');
const seen=act(s,'sceneStatus');
A.equal(seen.startingDistanceMetres,distance);
A.equal(seen.currentDistanceMetres,distance);
A.equal(seen.preciseDistanceUnverified,false);
A.equal(seen.playerPosition,'not-at-verified-cover');
A.equal(seen.lineOfSight,'not independently established');
A.equal(seen.availableCover,'copperwood trunks');
const original=E.exportGame(s),rng=s.rngState;
A.throws(()=>act(s,'sceneStatus',{distanceMetres:1}),/read-only/);
A.throws(()=>act(s,'exchange',{intent:'take_cover',distanceMetres:1}),
 /Player attack bonuses/);
A.equal(E.exportGame(s),original);A.equal(s.rngState,rng);
const current=s.battle.originalSpace,source=structuredClone(current.sourceEvent);
current.distanceMetres=1;
A.throws(()=>act(s,'sceneStatus'),/original encounter separation/);
A.throws(()=>act(s,'exchange',{intent:'defend'}),/original encounter separation/);
current.distanceMetres=distance;
const live=s.log.find(x=>x.details?.origin==='engine-local-wildlife-encounter'&&
 x.details.beastId===id);
const originalEvent=structuredClone(live);
live.details.distanceMetres=99;
A.throws(()=>act(s,'sceneStatus'),/original observed encounter range/);
Object.assign(live,originalEvent);
A.equal(E.exportGame(s),original);
A.equal(act(s,'sceneStatus').startingDistanceMetres,distance);
// Real terrain changes position and forces an actual opponent response.
// Once movement/fighting starts, the engine must not claim an exact range
// from a no-longer-current original sighting.
const out=act(s,'exchange',{intent:'take_cover'});
A.equal(out.ownResult.takingCover,true);
A.equal(out.elapsedMinutes,1);
if(s.battle){
 const moved=act(s,'sceneStatus');
 A.equal(moved.playerPosition,'behind-verified-cover');
 A.equal(moved.coverBonus,2);
 A.equal(moved.startingDistanceMetres,distance);
 A.equal(moved.currentDistanceMetres,null);
 A.equal(moved.preciseDistanceUnverified,true);
 const saved=E.importGame(E.exportGame(s));
 A.deepEqual(act(saved,'sceneStatus'),moved);
 // Archive survives ordinary ninety-entry log rotation without magically
 // restoring current range, choosing the opponent or granting new effects.
 for(let i=0;i<96;i++)Core.event(s,'world','Unrelated world log '+i,{i});
 A.equal(act(s,'sceneStatus').startingDistanceMetres,distance);
 A.equal(act(s,'sceneStatus').currentDistanceMetres,null);
 A.equal(act(s,'sceneStatus').coverBonus,2);
}
const legacy=setup(231322).s;
delete legacy.encounter.distanceMetres;
act(legacy,'begin',{beastId:legacy.encounter.beastId});
const old=act(legacy,'sceneStatus');
A.equal(old.startingDistanceMetres,null);
A.equal(old.currentDistanceMetres,null);
A.equal(old.preciseDistanceUnverified,true);
A.equal(old.cooperativeEffect,'requires a real independently acting ally and its own source');
A.deepEqual(current.sourceEvent,source);
console.log('Original encounter distance, actual covered player position, no fabricated current range, independent exchange, source tamper, legacy saves and replay verified');
