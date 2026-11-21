'use strict';
// Exact original PC own-Soul Perception rules must still hold after the
// independent NPC Lattice III diagnostic adapter began sharing its spec.
const A=require('node:assert/strict'),
 Senses=require('../rules/first-stage-senses'),
 Law=require('../rules/soul-shared-original-resonance-lattice');
for(const wis of [8,10,13,16,30])
 for(const rank of [0,1,3,5])
  for(const threaded of [false,true]){
   const spec=Senses.ownSoulPerceptionSpec(wis,rank,threaded);
   A.deepEqual(spec,{dc:12,
    modifier:Math.floor((wis-10)/2)+2*rank+(threaded?2:0),
    reserveCost:2,minutes:6});
  }
A.equal(Law.REPAIR_DC,14);
A.equal(Law.REPAIR_RESERVE,1);
A.equal(Law.repairStamina(120),2);
A.deepEqual(Law.repairState(6,70,{success:true}),{
 strain:4,stability:72});
A.deepEqual(Law.repairState(6,70,{success:false}),{
 strain:6,stability:70});
A.equal(Law.formationReady(5,3),false);
A.equal(Law.formationReady(5,2),true);
// Original actual player checks, witnesses, earned skill/Threading modifier,
// unsafe guesses, exact original player repair costs, formation and saves.
require('./earned-senses.test.js');
require('./soul-resonance-lattice.test.js');
console.log('Original PC/NPC bounded Soul Perception and witnessed Resonance Lattice repair/formation parity PASS');
