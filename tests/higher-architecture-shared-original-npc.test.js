'use strict';
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine'),R=require('../rules'),Core=require('../rules/core'),
 Law=require('../rules/higher-architecture-shared-original-law'),
 Arcane=require('../rules/arcane-higher-circles'),Soul=require('../rules/soul-higher-architecture'),
 NPC=require('../rules/independent-original-higher-architectures');
A.deepEqual(Law.arcaneFourth('practice',120,16,0,80),{dc:21,energy:3,stamina:2,modifier:4});
A.deepEqual(Law.arcaneFourth('form',90,16,0,80),{dc:24,energy:8,stamina:3,modifier:4});
for(let stage=5;stage<=9;stage++){
 const sp=Arcane.SPEC[stage];
 A.deepEqual(Law.arcaneHigher(sp,'practice',120,16,0,90),
  {dc:sp.dc,energy:sp.minuteCost,stamina:2,modifier:4});
 A.deepEqual(Law.arcaneHigher(sp,'form',91,16,0,90),
  {dc:sp.dc+3,energy:sp.minuteCost+4,stamina:4,modifier:4});
 A.deepEqual(Law.arcaneHigher(sp,'repair',121,16,0,90),
  {dc:14,energy:2,stamina:3,modifier:3});
}
for(let stage=4;stage<=7;stage++){
 const sp=Soul.SPEC[stage];
 A.deepEqual(Law.soulHigher(sp,'practice',120,16,0,90),
  {dc:sp.dc,energy:sp.cost,stamina:2,modifier:5});
 A.deepEqual(Law.soulHigher(sp,'form',90,16,0,90),
  {dc:sp.dc+3,energy:sp.cost+3,stamina:3,modifier:4});
 A.deepEqual(Law.soulHigher(sp,'repair',60,16,0,90),
  {dc:14,energy:2,stamina:2,modifier:3});
}
const severe={success:false,degree:'severe failure'},hit={success:true,degree:'strong'};
A.deepEqual(Law.arcaneState(4,'practice',2,1,80,severe),{points:2,strain:4,stability:74,wound:false});
A.deepEqual(Law.arcaneState(5,'practice',2,1,80,severe),{points:2,strain:4,stability:77,wound:false});
A.deepEqual(Law.soulState('practice',2,1,80,severe),{points:2,strain:4,stability:77,wound:true});
A.deepEqual(Law.soulState('repair',2,4,80,hit),{points:2,strain:2,stability:82,wound:false});
A.deepEqual(Law.arcaneState(4,'repair',2,4,80,hit),{points:2,strain:2,stability:82,wound:false});
const s=E.newGame({name:'Disposable higher architecture source gates',seed:589172});
const original=E.exportGame(s);
for(const system of ['arcane','soul']){
 const key=system==='arcane'?'originalArcaneHigherArchitecture':'originalSoulHigherArchitecture';
 A.equal(NPC.verify(s,{},system),true);
 A.equal(NPC.verify(s,{id:'person_0',[key]:{stage:9,sessions:[]}},system),false);
 A.throws(()=>R.act(s,{system,operation:'npcHigherWork',
  params:{actorId:'emergent:person_0',witnessIndex:0,formed:true}}),/fresh architecture witness/);
 A.equal(E.exportGame(s),original);
 A.throws(()=>R.act(s,{system,operation:'npcHigherWork',
  params:{actorId:'emergent:person_0',witnessIndex:0}}),/architecture observation required|fresh architecture witness/);
 A.equal(E.exportGame(s),original);
}
require('./arcane-higher-architecture.test.js');
require('./soul-higher-architecture.test.js');
console.log('Original Arcane IV–IX and Soul IV–VII shared numeric laws, original PC parity and independent forged-stage gates PASS');
