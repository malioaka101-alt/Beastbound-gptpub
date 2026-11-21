'use strict';
// Original independent Soul Phase III and player Soul Lattice share one
// binding practice/repair/formation physics; no fabricated prior thread.
const A=require('node:assert/strict'),
 PC=require('../rules/soul-resonance-lattice'),
 NPC=require('../rules/independent-original-soul-lattice-three'),
 Second=require('../rules/independent-original-soul-thread-two'),
 Law=require('../rules/soul-shared-original-resonance-lattice'),
 Build=require('../rules/build');
A.equal(Law.GOAL,5);
A.equal(Law.PRACTICE_DC,17);
A.equal(Law.REPAIR_DC,14);
A.equal(Law.FORMATION_DC,21);
A.equal(Law.PRACTICE_RESERVE,2);
A.equal(Law.REPAIR_RESERVE,1);
A.equal(Law.FORMATION_RESERVE,4);
A.equal(Law.FORMATION_INTEGRITY,1);
A.equal(Law.practiceStamina(60),2);
A.equal(Law.practiceStamina(120),2);
A.equal(Law.repairStamina(60),2);
A.equal(Law.formationStamina(90),3);
A.equal(Law.formationModifier(3,0,95),4);
A.equal(Law.earned({success:true,degree:'exceptional'}),3);
A.equal(Law.earned({success:true,degree:'strong'}),2);
A.equal(Law.earned({success:true,degree:'success'}),1);
A.equal(Law.earned({success:false,degree:'severe failure'}),0);
A.deepEqual(Law.practiceState(4,1,{success:true,degree:'strong'}),
 {points:5,strain:1,stabilityLost:0});
A.deepEqual(Law.practiceState(0,99,{success:false,degree:'severe failure'}),
 {points:0,strain:100,stabilityLost:3});
A.deepEqual(Law.repairState(3,98,{success:true}),{strain:1,stability:100});
A.equal(Law.formationReady(5,2),true);
A.equal(Law.formationReady(5,3),false);
A.equal(Build.soulProfile(3,{will:1}).perceptionRangeMetres,50);
A.match(PC.practice.toString(),/LatticeLaw.practiceState/);
A.match(PC.repair.toString(),/LatticeLaw.repairState/);
A.match(PC.complete.toString(),/LatticeLaw.formationModifier/);
// Original player remains the source of repair and formation requirements.
// An independent NPC needs an actual paid prior diagnosis for repair and
// a fresh separately demonstrated identity-control test for formation.
const ThreadLaw=require('../rules/soul-shared-original-threading');
A.match(NPC.afterDaily.toString(),/diagnosisReady\(diagnosis/);
A.match(NPC.verify.toString(),/originalDiagnosisSourceHash!==diagnosis\?\.seal/);
A.match(NPC.afterDaily.toString(),/countertestReady\(countertest/);
A.match(NPC.verify.toString(),/originalFormationCountertestHash!==countertest\?\.seal/);
A.deepEqual(NPC.formationCountertestSpec(3),{
 minutes:120,dc:ThreadLaw.DC,modifier:3,reserveCost:ThreadLaw.RESERVE_COST,
 staminaCost:ThreadLaw.staminaCost(120)});
A.equal(ThreadLaw.stabilityAfter(90,{degree:'severe failure'}),84);
A.equal(ThreadLaw.stabilityAfter(90,{degree:'success'}),90);
A.equal(NPC.verify({table:{}},{originalSoulLatticeThree:undefined}),true);
A.equal(NPC.verify({table:{}},{
 originalSoulLatticeThree:{formed:true}
}),false,'Claiming an unearned Soul Phase III cannot create structure');
A.equal(Second.verify({table:{}},{
 originalSoulThreadTwo:{completed:true}
}),false,'Phase II source cannot be faked to unlock Phase III');
A.throws(()=>NPC.privateStatus({table:{}},{
 originalSoulLatticeThree:{formed:true}
}),/original private Soul Phase III lattice evidence was altered/i);
// Real original PLAYER Soul Phase III witness, progress, repair, physical
// check and capacity acceptance must survive the shared rule refactor.
require('./soul-resonance-lattice.test.js');
console.log('Original Soul Phase III player/NPC law parity, identity, no invented stage PASS');
