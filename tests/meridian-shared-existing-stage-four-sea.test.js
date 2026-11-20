'use strict';
// Source parity for the EXISTING Stage IV Dantian Sea PC law, now
// extracted without replacing player mechanics or inventing new NPC ranks.
const A=require('node:assert/strict'),
 Shared=require('../rules/meridian-shared-original-sea'),
 Gate=require('../rules/meridian-shared-original-gates'),
 Build=require('../rules/build'),
 NPC=require('../world/independent-meridian-sea'),
 Engine=require('../engine.js');
const kinds=['Perfect','Sound','Flawed'];
for(const basis of [
 {p:0,f:0,quality:'Sound',stability:95},
 {p:36,f:9,quality:'Firm',stability:69},
 {p:72,f:18,quality:'Perfect',stability:40},
 {p:81,f:27,quality:'Thin',stability:1}
]){
 const {p,f,quality,stability}=basis,
  planned=Shared.working({perfect:p,flawed:f,
   foundationQuality:quality,stability,minutes:120});
 A.equal(planned.actualDC,21+Math.floor(f/18)+(stability<70?2:0));
 A.equal(planned.foundationBonus,quality==='Perfect'?2:quality==='Firm'?1:0);
 A.equal(planned.gateBonus,Math.min(2,Math.floor(p/36)));
 A.equal(planned.qiSpent,8);
 A.equal(planned.staminaSpent,1);
 A.equal(planned.requiredPoints,5);
 const formed=Shared.formation({perfect:p,flawed:f,stability}),
  original=Build.meridianProfile(4,{meridians:12,gatesP:p,
   gatesS:108-p-f,gatesF:f,seaRings:1});
 A.equal(formed.purity,Math.max(1,Math.min(9,
  3+Math.floor(p/36)-Math.floor(f/27))));
 A.equal(formed.density,Math.max(1,Math.min(9,
  3+Math.floor(p/27)-Math.floor(f/36))));
 A.deepEqual(formed.profile,original);
}
A.deepEqual(Shared.METHODS,
 ['compression','circulation','stabilisation','integrated']);
A.equal(Shared.originalBaselineStability,95);
A.equal(Shared.progress('exceptional',3),5);
A.equal(Shared.progress('strong',3),3);
A.equal(Shared.working({perfect:0,flawed:0,
 foundationQuality:'Sound',stability:95,minutes:15}).staminaSpent,1);
A.equal(Shared.working({perfect:0,flawed:0,
 foundationQuality:'Sound',stability:95,minutes:480}).staminaSpent,4);
A.throws(()=>Shared.working({perfect:109,flawed:0,
 foundationQuality:'Sound',stability:95}),/original verified/);
A.throws(()=>Shared.formation({perfect:0,flawed:0,stability:0}),
 /current circulation stability/);
for(const [p,f] of [[0,0],[50,5],[36,36],[108,0]]){
 const gates=Array.from({length:108},(_,i)=>{
  const spec=Gate.gateSpec(i+1);
  return {number:i+1,band:spec.band,
   quality:i<p?'Perfect':i<p+f?'Flawed':'Sound'};
 });
 A.deepEqual(Shared.qualities(gates),
  {perfect:p,sound:108-p-f,flawed:f});
}
A.throws(()=>Shared.qualities([
 {number:1,band:'Lower',quality:'Sound'}]),/108 individually opened/);
const game=Engine.newGame({name:'No fictitious NPC Stage IV',seed:198923});
A.equal(NPC.verify(game,{id:'missing-human'}),true);
A.equal(NPC.verify(game,{id:'missing-human',
 originalMeridianSea:{origin:NPC.ORIGIN,stage:4}}),false);
console.log('Existing shared Stage IV original Dantian Sea PASS: PC DC/progress/8 Qi/variable stamina and maturity are unchanged, 108 real gate qualities required, no imaginary NPC sea');
