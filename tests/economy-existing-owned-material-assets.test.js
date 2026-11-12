'use strict';
// Foundation #19: extend actual shared physical custody with a GM-described
// observation about an item already owned. A descriptive registry is NOT
// another shop, guaranteed output, deed, forced transfer or money printer.
// Disposable original engine saves only.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),W=require('../rules/world'),
 Realm=require('../world/simulation'),
 H=require('../rules/material-handoffs');
const action=(s,operation,params)=>R.act(s,{system:'social',operation,params});
const description='A real hand-carried reed supply identified by its owner for ordinary wetland survey notes, without an asserted magical property.';
const merchantDescription='An existing provisioner ration lot physically owned by the real local seller, not awarded to the observer or duplicated.';
const personDescription='One ration previously accepted in a genuine voluntary in-person handoff, now belonging to the individual recipient.';
const fresh=seed=>E.newGame({seed,name:'Disposable Real Physical Ownership',path:'undecided',background:'fieldworker'});
function local(seed){
 const s=fresh(seed);
 s.world.minutes=8*60;
 Realm.ensure(s);
 return s;
}
{
 const s=local(992310),saved=E.exportGame(s),oldRng=s.rngState;
 const invalid=[
  {ownerId:'player',item:'unknown_magic_relic',quantity:1,description},
  {ownerId:'player',item:'marsh_reed',quantity:100000,description},
  {ownerId:'player',item:'marsh_reed',quantity:0,description},
  {ownerId:'player',item:'marsh_reed',quantity:1.5,description},
  {ownerId:'npc:imaginary_person',item:'clean_rations',quantity:1,description},
  {ownerId:'npc:otto',item:'clean_rations',quantity:1,description},
  {ownerId:'imagined-merchant',item:'clean_rations',quantity:1,description},
  {ownerId:'player',item:'marsh_reed',quantity:1,description,grantPower:true}
 ];
 for(const p of invalid){
  A.throws(()=>action(s,'documentOwnedMaterial',p));
  A.equal(E.exportGame(s),saved);
  A.equal(s.rngState,oldRng);
 }
 const prior=s.player.inventory.marsh_reed,coins=s.player.coins,minute=s.world.minutes;
 A.ok(prior>=1);
 const observation=action(s,'documentOwnedMaterial',{
  ownerId:'player',item:'marsh_reed',quantity:1,description});
 A.equal(observation.documented,true);
 A.equal(observation.actualStockUnchanged,true);
 A.equal(observation.noNewGoodsOrCurrency,true);
 A.equal(observation.noLegalTitleOrCompulsoryAgreement,true);
 A.equal(s.player.inventory.marsh_reed,prior);
 A.equal(s.player.coins,coins);
 A.equal(s.rngState,oldRng);
 A.equal(s.world.minutes,minute);
 A.equal(H.verifyAssetAttestations(s),true);
 const history=action(s,'ownedMaterialHistory',{ownerId:'player'});
 A.equal(history.knownOwnedPhysicalMaterialObservations.length,1);
 A.equal(history.knownOwnedPhysicalMaterialObservations[0].ownerName,s.player.name);
 A.equal(history.knownOwnedPhysicalMaterialObservations[0].currentlyCarried,prior);
 A.equal(history.knownOwnedPhysicalMaterialObservations[0].stillHasAtLeastQuantity,true);
 const previous=E.exportGame(s);
 A.throws(()=>action(s,'documentOwnedMaterial',{
  ownerId:'player',item:'marsh_reed',quantity:1,description}),
  /double recorded/);
 A.equal(E.exportGame(s),previous);
 // Genuine unrelated physical consumption is not undone by a prior
 // observation and the historical observation remains replayable.
 s.player.inventory.marsh_reed--;
 A.equal(H.verifyAssetAttestations(s),true);
 const changed=action(s,'ownedMaterialHistory',{ownerId:'player'});
 A.equal(changed.knownOwnedPhysicalMaterialObservations[0].currentlyCarried,prior-1);
 const persisted=E.exportGame(s);
 const copy=E.importGame(persisted);
 A.equal(E.exportGame(copy),persisted);
 A.equal(H.verifyAssetAttestations(copy),true);
 const old=structuredClone(s.table.materialAssetAttestations);
 s.table.materialAssetAttestations[0].quantity=9999;
 A.equal(H.verifyAssetAttestations(s),false);
 s.table.materialAssetAttestations=old;
 s.table.materialAssetAttestations[0].source.quantity=9999;
 s.table.materialAssetAttestations[0].quantity=9999;
 s.table.materialAssetAttestations[0].hash=
  require('node:crypto').createHash('sha256').update(JSON.stringify(
   s.table.materialAssetAttestations[0].source)).digest('hex');
 A.equal(H.verifyAssetAttestations(s),false,
  'a resealed invented asset quantity cannot override the witnessed stock');
}
{
 const s=local(992311),w=s.table.realm,
  v=w.localProvisioner,oldStock=v.stock,oldFunds=v.fundsScales,
  beforeCoins=s.player.coins;
 A.ok(v.stock>=1);
 const result=action(s,'documentOwnedMaterial',{
  ownerId:'merchant:otto',item:'clean_rations',
  quantity:1,description:merchantDescription});
 A.equal(result.documented,true);
 A.equal(result.ownerId,'merchant:otto');
 A.equal(v.stock,oldStock);
 A.equal(v.fundsScales,oldFunds);
 A.equal(s.player.coins,beforeCoins);
 const quote=R.act(s,{system:'gear',operation:'inquire',params:{npcId:'otto'}});
 const bought=R.act(s,{system:'gear',operation:'purchase',
  params:{offerId:quote.offerId}});
 A.equal(bought.purchased,true);
 A.equal(v.stock,oldStock-1);
 A.equal(H.verifyAssetAttestations(s),true);
 const observed=action(s,'ownedMaterialHistory',{ownerId:'merchant:otto'});
 A.equal(observed.knownOwnedPhysicalMaterialObservations.length,1);
 A.equal(observed.knownOwnedPhysicalMaterialObservations[0].currentPrivateHoldingNotDisclosed,true);
 A.equal(s.player.inventory.clean_rations>0,true);
 const asSaved=E.exportGame(s);
 A.equal(E.exportGame(E.importGame(asSaved)),asSaved);
}
{
 let accepted=null;
 for(let seed=992315;seed<992390;seed++){
  const s=local(seed);
  const transferred=action(s,'materialHandoff',{
   npcId:'otto',item:'clean_rations'});
  if(transferred.accepted){accepted=s;break;}
 }
 A.ok(accepted,'a genuinely independently accepted original material handoff must occur');
 const s=accepted,original=s.player.inventory.clean_rations,acct=s.table.realm.materialCustody.accounts.otto;
 A.equal(acct.held.clean_rations,1);
 const response=action(s,'documentOwnedMaterial',{
  ownerId:'npc:otto',item:'clean_rations',quantity:1,
  description:personDescription});
 A.equal(response.documented,true);
 A.equal(response.ownerId,'npc:otto');
 A.equal(acct.held.clean_rations,1,
  'recording real recipient property cannot duplicate a gifted item');
 A.equal(s.player.inventory.clean_rations,original);
 const before=E.exportGame(s);
 A.equal(H.verifyAssetAttestations(s),true);
 W.advance(s,24);
 A.equal(H.verifyAssetAttestations(s),true);
 A.equal(s.table.materialAssetAttestations[0].source.originalRoot,
  s.table.personalMaterialOffers.find(x=>x.accepted).hash);
 const status=action(s,'ownedMaterialHistory',{ownerId:'npc:otto'});
 A.equal(status.knownOwnedPhysicalMaterialObservations.length,1);
 A.equal(status.knownOwnedPhysicalMaterialObservations[0].currentPrivateHoldingNotDisclosed,true);
 A.equal('currentlyCarried' in status.knownOwnedPhysicalMaterialObservations[0],false);
 const snap=E.exportGame(s),restored=E.importGame(snap);
 A.equal(E.exportGame(restored),snap);
 A.equal(H.verifyAssetAttestations(restored),true);
 A.notEqual(snap,before,'the original world still passes time autonomously');
 // An unrelated owner cannot rename the historical person to appropriate
 // privately held goods, even by resealing a forged descriptive source.
 const copies=structuredClone(s.table.materialAssetAttestations),
  row=s.table.materialAssetAttestations[0];
 row.source.ownerName='Invented foreign property claimant';
 row.hash=require('node:crypto').createHash('sha256')
  .update(JSON.stringify(row.source)).digest('hex');
 A.equal(H.verifyAssetAttestations(s),false);
 s.table.materialAssetAttestations=copies;
 A.equal(H.verifyAssetAttestations(s),true);
}
console.log('Original #19 physical property source: GM-described witnessed real player, merchant and freely accepting NPC ownership; zero created items or money, live stock transfer, historical durable receipts, private inventory not revealed and forged claims rejected PASS');
