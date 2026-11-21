'use strict';
const A=require('node:assert/strict'),Law=require('../rules/body-shared-original-living-physique'),
 PC=require('../rules/body-living-physiques'),NPC=require('../rules/independent-original-body-living-physiques'),
 E=require('../engine'),R=require('../rules');
A.equal(PC.SPEC,Law.SPEC);
for(const [cycle,dc,cost,bonus] of [[5,19,3,2],[6,20,3,1],[7,22,5,2]]){
 A.equal(Law.SPEC[cycle].bonus,bonus);
 A.deepEqual(Law.checkSpec(cycle,'work',16,0,3),{dc,cost,modifier:2});
 A.deepEqual(Law.checkSpec(cycle,'care',16,0,3),{dc:15,cost:2,modifier:2});
 A.deepEqual(Law.checkSpec(cycle,'form',16,0,3),{dc:dc+3,cost:cost+2,modifier:2});
 A.deepEqual(Law.checkSpec(cycle,'repeat',16,0,3),{dc:dc+1,cost:cost+2,modifier:2});
}
A.deepEqual(Law.workState(5,0,{success:true,degree:'exceptional'}),
 {points:6,strain:0,earned:3,strainAdded:0});
A.deepEqual(Law.workState(3,4,{success:false,degree:'severe failure'}),
 {points:3,strain:7,earned:0,strainAdded:3});
A.equal(Law.repaired(7,{success:true}),5);A.equal(Law.repaired(7,{success:false}),7);
A.equal(Law.ready(6,2),true);A.equal(Law.ready(6,3),false);
A.equal(NPC.verify({table:{}},{}),true);
A.equal(NPC.verify({table:{}},{id:'person_0',originalBodyLivingPhysiques:{cycles:{7:{completed:true}}}}),false);
const s=E.newGame({name:'Disposable advanced physiology source gate',seed:293865});
const before=E.exportGame(s);
A.throws(()=>R.act(s,{system:'body',operation:'npcLivingPhysiqueWork',
 params:{actorId:'emergent:person_0',witnessIndex:0,formed:true}}),/accepts actorId/);
A.equal(E.exportGame(s),before);
A.deepEqual(Law.adaptiveSpec(1,16,0,3),{dc:18,cost:2,modifier:2});
A.deepEqual(Law.adaptiveSpec(61,16,2,3),{dc:18,cost:3,modifier:6});
A.deepEqual(Law.adaptiveWindow(100,61,true),{activeFrom:101,activeUntil:162,cooldownUntil:170});
A.deepEqual(Law.adaptiveWindow(100,61,false),{activeFrom:101,activeUntil:null,cooldownUntil:109});
A.equal(Law.releaseCooldown(120),129);
A.throws(()=>Law.adaptiveSpec(0,16,0,0),/Measured adaptive duration/);
A.throws(()=>R.act(s,{system:'body',operation:'npcAdaptiveAssume',
 params:{actorId:'emergent:person_0',witnessIndex:0,minutes:60,formed:true}}),/accepts actorId/);
A.equal(E.exportGame(s),before);
A.throws(()=>R.act(s,{system:'body',operation:'npcAdaptiveRelease',
 params:{actorId:'emergent:person_0',witnessIndex:0}}),/verified Adaptive VI|accepts actorId/);
A.equal(E.exportGame(s),before);
require('./body-living-physiques.test.js');
console.log('Original individual advanced Body V–VII PC law parity and NPC forged-stage/forced-result gates PASS');
