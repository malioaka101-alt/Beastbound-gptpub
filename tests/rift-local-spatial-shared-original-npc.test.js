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
const Journey=require('../rules/independent-original-rift-realm-walking'),Crypto=require('node:crypto'),
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
A.deepEqual(Law.walkSpec('prepare',90,3,16,0),{dc:21,modifier:3,stamina:4,minutes:90});
A.deepEqual(Law.walkSpec('enter',10,6,16,0),{dc:25,modifier:3,stamina:5,minutes:10});
A.deepEqual(Law.walkSpec('return',10,0,16,0),{dc:18,modifier:3,stamina:4,minutes:10});
for(const op of ['npcRealmPrepare','npcRealmEnter','npcRealmReturn']){
 A.throws(()=>R.act(s,{system:'rift',operation:op,params:{actorId:'emergent:person_0',routeId:'unseen_route',witnessIndex:0,crossed:true}}),/fresh action witness/);
 A.equal(E.exportGame(s),before);
 A.throws(()=>R.act(s,{system:'rift',operation:op,params:{actorId:'emergent:person_0',routeId:'unseen_route',witnessIndex:0}}),/original exterior human required|fresh action witness/);
 A.equal(E.exportGame(s),before);
}
// Pure temporal scheduling fixture ONLY. The full original source owner
// deliberately REJECTS this fabricated actor and no campaign stage is gained.
const stub={actorId:'emergent:person_0',originHash:'0'.repeat(64),id:'person_0'};
const row=(kind,minute,actualMinutes,success,accepted=true)=>{
 const source={origin:Journey.ORIGIN,actorId:stub.actorId,identityOriginHash:stub.originHash,kind,minute,actualMinutes,accepted,check:accepted?{success}:null};
 return {source,seal:hash(source)};
};
stub.originalRiftRealmJourney={origin:Journey.ORIGIN,rows:[
 row('prepare',100,90,true),row('enter',200,10,false),row('enter',220,10,true),
 row('return',240,5,false,false),row('return',250,10,true)]};
A.equal(Journey.awayAt(stub,229),false);A.equal(Journey.awayAt(stub,230),true);
A.equal(Journey.awayAt(stub,245),true);A.equal(Journey.awayAt(stub,259),true);
A.equal(Journey.awayAt(stub,260),false);
A.equal(Journey.awayDuring(stub,200,230),false);A.equal(Journey.awayDuring(stub,229,231),true);
A.equal(Journey.awayDuring(stub,260,300),false);A.equal(Journey.verify(s,stub),false);
stub.originalRiftRealmJourney.rows[2].source.minute=221;
A.throws(()=>Journey.awayAt(stub,231),/Unverified independent realm location receipt/);
require('./rift-fold-step.test.js');
require('./rift-boundary-weaving.test.js');
require('./rift-pocket-architecture.test.js');
require('./rift-adaptation.test.js');
require('./rift-realm-walking.test.js');
const Domain=require('../rules/independent-original-rift-boundary-domain'),
 PC=require('../rules/rift-boundary-domain'),
 Mana=require('../rules/independent-arcane-external-mana');
A.deepEqual(PC.domainSpec(4,12,3,1,16,0),{dc:27,modifier:3,mana:18,stamina:13,minutes:120});
A.equal(Mana.current(s,{}),null);
A.throws(()=>R.act(s,{system:'rift',operation:'npcBoundaryDomain',
 params:{actorId:'emergent:person_0',witnessIndex:0,success:true}}),/fresh measured Domain witness/);
A.equal(E.exportGame(s),before);
A.throws(()=>R.act(s,{system:'rift',operation:'npcBoundaryDomain',
 params:{actorId:'emergent:person_0',witnessIndex:0}}),/original exterior individual required|fresh measured Domain witness/);
A.equal(E.exportGame(s),before);
// Isolated receipt-law fixture only, NOT a character, original reservoir,
// formed Domain, earned Circle or actual cross-system payment.
const actor={actorId:'emergent:person_1',originHash:'1'.repeat(64)},
 debit={origin:Mana.ORIGIN,purpose:Mana.PURPOSE,actorId:actor.actorId,identityOriginHash:actor.originHash,
 owner:'second',stage:2,minute:100,endMinute:220,witnessHash:'2'.repeat(64),
 manaBefore:25,capacity:25,amount:18,manaAfter:7,noSeparateReserve:true},
 debitRow={source:debit,seal:hash(debit)},
 consumer={actorId:actor.actorId,accepted:true,minute:100,actualMinutes:120,witnessHash:debit.witnessHash,
 manaSpent:18,manaOwner:'second',manaDebitSeal:debitRow.seal};
actor.originalRiftBoundaryDomains={rows:[{source:consumer,seal:hash(consumer)}]};
A.equal(Mana.validRow(s,actor,debitRow,'second',2,25,25,90),true);
A.equal(Mana.validRow(s,actor,debitRow,'second',2,24,25,90),false);
A.equal(Mana.validRow(s,actor,debitRow,'matrix',2,25,25,90),false);
A.equal(Mana.validRow(s,actor,debitRow,'second',2,25,25,101),false);
A.equal(Mana.proof(s,actor,debitRow.seal,'second',debit.witnessHash,100),false);
A.equal(Domain.verify(s,actor),false);
consumer.accepted=false;actor.originalRiftBoundaryDomains.rows[0].seal=hash(consumer);
A.equal(Mana.validRow(s,actor,debitRow,'second',2,25,25,90),false);
require('./rift-boundary-domain.test.js');

console.log('Original Fold III and Weave IV shared original local spatial laws, player parity and independent source gates PASS');
