'use strict';
// #19: a GM-authored and ACTUALLY built persistent original tool belongs in
// the existing property-observation ledger, not a fabricated new item list.
// Disposable fixture games only. No inventory, power or sale is generated.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine.js'),R=require('../rules'),
 Custody=require('../rules/material-handoffs'),
 Prototype=require('../rules/creation-prototype');
const sha=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const create=(s,operation,params={})=>R.act(s,{system:'creation',operation,params});
const social=(s,operation,params={})=>R.act(s,{system:'social',operation,params});
const description='One genuine handmade wetland water gauge, examined as an ordinary owned physical instrument rather than a magical source of unlimited readings.';
const spec=()=>({title:'Ordinary Hand-Built Wetland Water Gauge',
 purpose:'Prepare a physically measurable narrow tool for a local wetland worker without imagining a remotely known water level.',
 medium:'tool',system:'mundane',function:'sense',target:'surface_water',
 magnitude:0,range:'touch',area:'single',duration:'1min',novelty:'variant',
 materials:[{id:'marsh_reed',quantity:2}]});
function genuineBuild(){
 for(let i=0;i<130;i++){
  const seed=(172911+Math.imul(i,2654435761))>>>0;
  const s=E.newGame({name:'Disposable Authored Ownership',seed,
   background:'fieldworker',path:'undecided'});
  A.equal(E.dispatch(s,'travel fen').ok,true);
  s.player.inventory.marsh_reed=16; // test supplies only
  const design=create(s,'draft',spec());
  const result=create(s,'prototype',{id:design.id});
  if(result.assembled)return {s,design:design.id,id:result.prototypeId};
 }
 throw Error('Disposable seeded trials had no actual independently rolled success');
}
{
 const s=E.newGame({name:'Disposable Unbuilt Design',seed:172900,
  background:'fieldworker',path:'undecided'});
 const snapshot=E.exportGame(s),rng=s.rngState;
 A.throws(()=>social(s,'documentOwnedMaterial',{ownerId:'player',
  item:'water_indicator_design_999',quantity:1,description}),
  /owned physical invention/);
 A.equal(E.exportGame(s),snapshot);
 A.equal(s.rngState,rng);
}
const {s,design,id}=genuineBuild();
const physical=s.table.creationPrototypes[id];
A.equal(physical.owner,s.player.name);
A.equal(Prototype.ownedAsset(s,id).originalRoot,physical.sourceHash);
 A.equal(Prototype.ownedAsset(s,id).kind,'existing-authored-personal-tool');
 A.match(Prototype.ownedAsset(s,id).source,/original completed/);
const existingCount=Object.keys(s.table.creationPrototypes).length;
const inventory=structuredClone(s.player.inventory);
const money=structuredClone(s.player.money);
const stamina=s.player.stamina,time=s.world.minutes,rng=s.rngState;
const original=E.exportGame(s);
const denied=[
 {ownerId:'player',item:id,quantity:2,description},
 {ownerId:'npc:otto',item:id,quantity:1,description},
 {ownerId:'merchant:otto',item:id,quantity:1,description},
 {ownerId:'player',item:'imaginary_tool_legendary',quantity:1,description},
 {ownerId:'player',item:id,quantity:1,description,magicRank:99}
];
for(const attempt of denied){
 A.throws(()=>social(s,'documentOwnedMaterial',attempt));
 A.equal(E.exportGame(s),original);
 A.equal(s.rngState,rng);
}
const witnessed=social(s,'documentOwnedMaterial',{
 ownerId:'player',item:id,quantity:1,description});
A.equal(witnessed.documented,true);
A.equal(witnessed.item,id);
A.equal(witnessed.quantity,1);
A.equal(witnessed.actualStockUnchanged,true);
A.equal(witnessed.noNewGoodsOrCurrency,true);
A.equal(witnessed.noLegalTitleOrCompulsoryAgreement,true);
A.deepEqual(s.player.inventory,inventory);
A.deepEqual(s.player.money,money);
A.equal(s.player.stamina,stamina);
A.equal(s.world.minutes,time);
A.equal(s.rngState,rng);
A.equal(Object.keys(s.table.creationPrototypes).length,existingCount);
A.equal(Custody.verifyAssetAttestations(s),true);
const asset=s.table.materialAssetAttestations[0];
A.equal(asset.source.ownerKind,'existing-authored-personal-tool');
A.equal(asset.source.originalRoot,physical.sourceHash);
A.equal(asset.source.physicalStockAtWitness,1);
A.equal(asset.source.noNewPhysicalStock,true);
const observed=social(s,'ownedMaterialHistory',{ownerId:'player'});
A.equal(observed.knownOwnedPhysicalMaterialObservations.length,1);
A.equal(observed.knownOwnedPhysicalMaterialObservations[0].currentlyCarried,1);
A.equal(observed.knownOwnedPhysicalMaterialObservations[0].sourceHash,asset.hash);
const after=E.exportGame(s);
A.throws(()=>social(s,'documentOwnedMaterial',{
 ownerId:'player',item:id,quantity:1,description}),/double recorded/);
A.equal(E.exportGame(s),after);
const restored=E.importGame(after);
A.equal(E.exportGame(restored),after);
A.equal(Custody.verifyAssetAttestations(restored),true);
A.equal(social(restored,'ownedMaterialHistory',{ownerId:'player'})
 .knownOwnedPhysicalMaterialObservations[0].currentlyCarried,1);
// The property observation keeps referring to the SAME originally built tool
// after real wear and material-consuming maintenance.
const calibrated=create(s,'calibrate',{id:design});
A.equal(calibrated.elapsedMinutes,15);
A.equal(Custody.verifyAssetAttestations(s),true);
const beforeStock=s.player.inventory.marsh_reed,
 beforeToolCount=Object.keys(s.table.creationPrototypes).length;
const repaired=create(s,'repair',{id:design});
A.equal(repaired.elapsedMinutes,50);
A.equal(s.player.inventory.marsh_reed,beforeStock-1);
A.equal(Object.keys(s.table.creationPrototypes).length,beforeToolCount);
A.equal(Custody.verifyAssetAttestations(s),true);
A.equal(s.table.materialAssetAttestations[0].source.originalRoot,physical.sourceHash);
A.equal(social(s,'ownedMaterialHistory',{ownerId:'player'})
 .knownOwnedPhysicalMaterialObservations[0].currentlyCarried,1);
const afterMaintenance=E.exportGame(s);
A.equal(E.exportGame(E.importGame(afterMaintenance)),afterMaintenance);
// Even with the hash re-sealed, inventing two owned copies of this unique
// researched original tool is not a valid historical source.
const intact=structuredClone(s.table.materialAssetAttestations[0]);
const row=s.table.materialAssetAttestations[0];
row.source.quantity=2;
row.source.physicalStockAtWitness=2;
row.quantity=2;
row.id='physical_asset_'+sha({
 ownerId:row.source.ownerId,item:row.source.item,
 description:row.source.description,minute:row.source.minute,
 quantity:row.source.quantity}).slice(0,25);
row.source.id=row.id;
row.hash=sha(row.source);
A.equal(Custody.verifyAssetAttestations(s),false);
s.table.materialAssetAttestations[0]=intact;
A.equal(Custody.verifyAssetAttestations(s),true);
A.equal(E.exportGame(s),afterMaintenance);
console.log('Authentic personally designed real tool can be observed in the existing material ownership ledger; built source, wear, repairs, conservation, read-only history, forged stock rejection and saved replay PASS');
