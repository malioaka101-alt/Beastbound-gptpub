'use strict';
// Original player's Stage V living anatomy remains the authority. Share
// exactly its source formulas; a copied route name cannot grant Stage V.
const A=require('node:assert/strict'),
 Web=require('../rules/meridian-shared-original-web'),
 NPC=require('../world/independent-meridian-web'),
 Engine=require('../engine.js');
A.deepEqual(Web.SEGMENTS,{extraordinary:8,major:36,minor:72});
for(let load=1;load<=9;load++)
 for(let segments=1;segments<=12;segments++){
  const required=Math.max(2,Math.ceil(segments/3)+load-2);
  A.equal(Web.required(segments,load),required);
  for(const flawed of [0,1,4,12]){
   const law=Web.pressure({load,segments,flawed,seaPurity:5,minutes:120});
   A.equal(law.qiSpent,2+load);
   A.equal(law.staminaSpent,1+Math.ceil(load/3));
   A.equal(law.dc,13+load+Math.ceil(segments/4)+2*flawed);
   A.equal(law.modifierPurity,1);
   A.equal(law.routeTarget,required);
  }
 }
for(const routes of [1,2,3,8,12]){
 const law=Web.integration({routes,extraordinary:3,stability:95,minutes:90});
 A.equal(law.qiSpent,11);
 A.equal(law.staminaSpent,3);
 A.equal(law.dc,19+Math.ceil(routes/4));
 A.equal(law.modifierStability,Math.floor(95/25)-2);
}
const p=(kind,number,gate=1)=>({kind,
 segments:[{kind,number}],gates:[gate],load:3,required:2,
 integrity:2,injuries:[]});
const ready=[p('extraordinary',2),p('major',15),p('minor',61)];
A.deepEqual(Web.spanning(ready,95),{ready:true,extraordinary:1});
A.equal(Web.spanning(ready,59).ready,false);
A.equal(Web.spanning(ready.slice(0,2),95).ready,false);
A.equal(Web.spanning([
 p('extraordinary',2,1),p('major',15,2),p('minor',61,3)],95).ready,false);
A.equal(Web.spanning([{...ready[0],integrity:1},
 ready[1],ready[2]],95).ready,false);
A.equal(Web.spanning([{...ready[0],injuries:[{healed:false}]},
 ready[1],ready[2]],95).ready,false);
A.throws(()=>Web.pressure({load:0,segments:1,flawed:0,
 seaPurity:5}),/Actual Meridian route anatomy/);
const s=Engine.newGame({name:'No phantom Living Web',seed:915918});
A.equal(NPC.verify(s,{id:'not-an-actor'}),true);
A.equal(NPC.verify(s,{id:'not-an-actor',
 originalMeridianWeb:{origin:NPC.ORIGIN,stage:5}}),false);
console.log('Existing original living Meridian Web parity PASS: physical 8/36/72 segment limits, pressure DC, distinct Qi and Stamina costs, physically connected healed Stage V source graph, no automatic actor stage');
