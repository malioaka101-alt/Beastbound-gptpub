'use strict';
// Original Soul Phase II law remains one and the same for player and NPC.
// No fabricated Soul phase, thought reading or private spiritual competence.
const A=require('node:assert/strict');
const Player=require('../rules/soul-threading');
const NPC=require('../rules/independent-original-soul-thread-two');
const Law=require('../rules/soul-shared-original-threading');
const Build=require('../rules/build');
A.equal(Law.DC,16);
A.equal(Law.RESERVE_COST,2);
A.equal(Law.staminaCost(120),1);
A.equal(Law.staminaCost(180),2);
A.equal(Law.requiredPerLink,2);
A.deepEqual(Law.LINKS,['mind','body','resonance']);
A.deepEqual(Player.LINKS,Law.LINKS);
A.deepEqual(Player.FOCI,Law.FOCI);
A.equal(Law.gain({degree:'exceptional'}),3);
A.equal(Law.gain({degree:'strong'}),2);
A.equal(Law.gain({degree:'success'}),1);
for(const d of ['failure','setback','severe failure'])
 A.equal(Law.gain({degree:d}),0);
const initial={mind:0,body:0,resonance:0};
let a=Law.grow(initial,false,'integrated','success');
A.deepEqual(a.links,{mind:1,body:1,resonance:1});
A.equal(a.integrated,true);
A.equal(Law.formed(a.links,a.integrated),false);
a=Law.grow(a.links,a.integrated,'mind','exceptional');
A.deepEqual(a.links,{mind:2,body:1,resonance:1});
a=Law.grow(a.links,a.integrated,'integrated','success');
A.equal(Law.formed(a.links,a.integrated),true);
A.equal(Law.integrity(0),65);
A.equal(Law.integrity(30),100);
A.equal(Law.stabilityAfter(95,{degree:'severe failure'}),89);
A.equal(Law.stabilityAfter(2,{degree:'severe failure'}),1);
A.equal(Law.stabilityAfter(95,{degree:'failure'}),95);
A.equal(Build.soulProfile(2,{will:0}).perceptionRangeMetres,20);
A.match(Player.work.toString(),/soul-shared-original-threading/);
A.match(Player.work.toString(),/LAW\.grow/);
A.match(Player.work.toString(),/LAW\.stabilityAfter/);
A.equal(NPC.verify({table:{}},{originalSoulThreadTwo:undefined}),true);
A.equal(NPC.verify({table:{}},{originalSoulThreadTwo:{completed:true}}),false);
A.throws(()=>NPC.privateStatus({table:{}},{
 originalSoulThreadTwo:{completed:true}
}),/Source-verified Soul Threading is required/);
console.log('Original Soul Phase II law parity and private anti-forgery contract PASS');
