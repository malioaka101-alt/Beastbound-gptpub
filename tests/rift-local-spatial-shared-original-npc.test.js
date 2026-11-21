'use strict';
const A=require('node:assert/strict'),E=require('../engine'),R=require('../rules'),
 Core=require('../rules/core'),Law=require('../rules/rift-shared-original-local-spatial-law'),
 Exterior=require('../rules/rift-shared-original-exterior-sense'),
 NPC=require('../rules/independent-original-rift-local-spatial');
const snap={siteId:Exterior.SITE_ID,phase:'quiet',charge:50,seal:80,ecosystemPressure:30,worldSeed:15,day:3};
A.equal(Law.pressureAdjust(snap),0);
A.equal(Law.pressureAdjust({...snap,phase:'surging'}),3);
A.equal(Law.pressureAdjust({...snap,phase:'unstable'}),6);
A.deepEqual(Law.foldSpec(12,12,3,16,0,1,0),{dc:22,modifier:3,stamina:2,minutes:5});
A.deepEqual(Law.foldSpec(12,12,3,16,0,1,2),{dc:21,modifier:3,stamina:2,minutes:5});
A.deepEqual(Law.weaveSpec(12,121,12,3,16,0),{dc:25,modifier:3,stamina:5,minutes:121});
A.deepEqual(Law.pocketSpec(8,180,12,3,16,0),{dc:27,modifier:3,stamina:6,minutes:180});
A.deepEqual(Law.adaptationSpec(2,90,12,3,16,0),{dc:21,modifier:3,stamina:4,minutes:90});
A.equal(Law.pocketStrainAdded({degree:'severe failure'}),8);
A.equal(Law.strainAdded({degree:'severe failure'}),6);
A.equal(Law.strainAdded({degree:'failure'}),0);
const s=E.newGame({name:'Disposable original spatial actor gates',seed:523842});
const before=E.exportGame(s);
A.equal(NPC.verify(s,{}),true);
A.equal(NPC.verify(s,{id:'person_0',originalRiftLocalSpatial:{step:4,sessions:[]}}),false);
for(const operation of ['npcFoldStep','npcWeaveBoundary','npcPocketBuild','npcAdaptExposure']){
 A.throws(()=>R.act(s,{system:'rift',operation,params:{actorId:'emergent:person_0',witnessIndex:0,success:true}}),/actor and witness only/);
 A.equal(E.exportGame(s),before);
 A.throws(()=>R.act(s,{system:'rift',operation,params:{actorId:'emergent:person_0',witnessIndex:0}}),/exterior Rift practitioner|required|actor and witness only/);
 A.equal(E.exportGame(s),before);
}
A.throws(()=>R.act(s,{system:'rift',operation:'npcPocketTransfer',
 params:{actorId:'emergent:person_0',witnessIndex:0,transferred:true}}),/fresh original pocket material/);
A.equal(E.exportGame(s),before);
A.throws(()=>R.act(s,{system:'rift',operation:'npcPocketTransfer',
 params:{actorId:'emergent:person_0',witnessIndex:0}}),/original spatial practitioner required|fresh original pocket material/);
A.equal(E.exportGame(s),before);
require('./rift-fold-step.test.js');
require('./rift-boundary-weaving.test.js');
require('./rift-pocket-architecture.test.js');
require('./rift-adaptation.test.js');
console.log('Original Fold III and Weave IV shared original local spatial laws, player parity and independent source gates PASS');
