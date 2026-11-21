'use strict';
// Original player owner parity and independent NPC source-gate contracts.
const A=require('node:assert/strict'),Law=require('../rules/body-shared-original-nerve-sense'),
 PC=require('../rules/body-nerve-sense'),NPC=require('../rules/independent-original-body-nerve-sense-four'),
 R=require('../rules'),E=require('../engine');
A.equal(Law.PRACTICE_DC,18);A.equal(Law.REPAIR_DC,15);A.equal(Law.FORMATION_DC,21);
A.equal(Law.practiceStamina(15),2);A.equal(Law.practiceStamina(120),3);
A.equal(Law.repairStamina(120),2);A.equal(Law.formationStamina(90),4);
A.equal(Law.STAMINA_GAIN,1);
const original={motor:0,peripheral:1,vestibular:2,regional9:0};
A.deepEqual(Law.grow(original,false,'integrated',{success:true,degree:'success'}),{
 progress:{motor:1,peripheral:2,vestibular:2,regional9:1},integrated:true,earned:1,strainAdded:0});
A.deepEqual(Law.grow(original,false,'motor',{success:false,degree:'severe failure'}),{
 progress:original,integrated:false,earned:0,strainAdded:3});
A.equal(Law.repaired(5,{success:true}),3);A.equal(Law.repaired(5,{success:false}),5);
A.equal(Law.ready({motor:2,peripheral:2},true,2),true);
A.equal(Law.ready({motor:2,peripheral:2},true,3),false);
A.equal(Law.ready({},true,0),false);
A.equal(NPC.verify({table:{}},{}),true);
A.equal(NPC.verify({table:{}},{id:'person_0',originalBodyNerveSenseFour:{completed:true}}),false);
const s=E.newGame({seed:293860,name:'Disposable neural source gate'});
const old=E.exportGame(s);
A.throws(()=>R.act(s,{system:'body',operation:'npcNerveWork',params:{
 actorId:'emergent:person_0',witnessIndex:0,success:true}}),/accepts actorId/);
A.equal(E.exportGame(s),old);
A.throws(()=>R.act(s,{system:'body',operation:'npcNerveWork',params:{
 actorId:'emergent:person_0',witnessIndex:0}}),/genuinely present independent/);
A.equal(E.exportGame(s),old);
A.match(PC.practice.toString(),/Law.grow/);
A.match(PC.finish.toString(),/Law.ready/);
require('./body-advanced-nerve-sense.test.js');
console.log('Original PC and independent NPC Nerve–Sense IV shared physiology, unearned-stage and caller-outcome rejection PASS');
