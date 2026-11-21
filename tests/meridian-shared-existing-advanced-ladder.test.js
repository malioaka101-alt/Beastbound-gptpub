'use strict';
// Real, already-implemented PC Stage VI–IX rules own the individual source
// checks. These exact costs/DCs must remain identical when a non-player
// human receives genuine personally earned anatomy and witness evidence.
const A=require('node:assert/strict'),
 Original=require('../rules/meridian-shared-original-advanced'),
 Advance=require('../world/independent-meridian-advanced'),
 Engine=require('../engine.js');
A.deepEqual(Original.POINTS,{6:6,7:6,8:6,9:8});
A.deepEqual(Original.SYSTEM,{6:'intent',7:'physique',
 8:'domain',9:'constitution'});
for(const load of [1,3,6,9])
 for(const radius of [2,3,10,60])
  for(const minutes of [45,60,90,180]){
   const t=Math.ceil(minutes/90),stability=91,
    tests=[
     {stage:6,practice:[2+Math.ceil(load/2),t+1,15+load,'wis'],
      form:[6+load,t+2,20+load,'wis']},
     {stage:7,practice:[3+Math.ceil(load/2),t+2,17+load,'con'],
      form:[8+load,t+3,21+load,'con']},
     {stage:8,practice:[2+Math.ceil(radius/4),t+2,
       17+Math.ceil(radius/5),'wis'],
      form:[6+Math.ceil(radius/3),t+3,
       20+Math.ceil(radius/5),'wis']},
     {stage:9,practice:[4+t,t+3,21,'con'],
      form:[10,t+4,24,'con']}
    ];
   for(const spec of tests){
    const options={load,radius,stability,minutes};
    for(const kind of ['practice','form']){
     const plan=Original.law(spec.stage,{...options,kind});
     A.deepEqual([plan.qiSpent,plan.staminaSpent,plan.dc,
      plan.attribute],spec[kind]);
     A.equal(plan.pointsNeeded,Original.POINTS[spec.stage]);
     A.equal(plan.sourceOwner,Original.SOURCE[spec.stage]);
     A.equal(plan.severePracticeStabilityLoss,
      kind==='practice'?2:0);
     A.equal(plan.stabilityModifier,spec.stage===6?
      Math.floor(stability/25)-2:Math.floor(stability/30)-1);
    }
   }
  }
for(const minutes of [15,45,90,120,240,480]){
 const care=Original.maintenance({minutes});
 A.equal(care.qiSpent,3);
 A.equal(care.staminaSpent,2+Math.ceil(minutes/120));
 A.equal(care.dc,19);
 A.equal(care.attribute,'con');
 A.equal(care.severeStabilityLoss,2);
 A.equal(care.noImmortalityOrAutomaticBiologicalUpkeep,true);
}
A.throws(()=>Original.maintenance({minutes:0}),/metabolic maintenance time/);
A.throws(()=>Original.law(10),/original source-evidenced/);
A.throws(()=>Original.law(8,{radius:0}),/original source-evidenced/);
const game=Engine.newGame({name:'No fictional advanced constitution',seed:906602});
A.equal(Advance.verify(game,{id:'unassessed-independent-human'}),true);
A.equal(Advance.verify(game,{id:'unassessed-independent-human',
 originalMeridianAdvanced:{origin:Advance.ORIGIN,stage:9}}),false);
console.log('Existing four distinct advanced Meridian sources PASS: unique VI Intent, VII Physique, VIII bounded Domain and IX metabolic Constitution costs/checks/thresholds, no generic rank ladder or invented NPC stage');
