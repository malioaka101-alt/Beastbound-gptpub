'use strict';
// #19: The very same real independently living citizen who accepts genuine
// source-owned materials can independently decide to sell a finite quantity.
// Both original money accounts and both real physical inventories conserve.
// Fixtures are disposable; no campaign/request/result state is touched.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),Realm=require('../world/simulation'),
 Atlas=require('../world/atlas'),People=require('../world/emergent-people'),
 Careers=require('../world/person-careers'),
 Market=require('../world/independent-local-purchases'),
 H=require('../rules/material-handoffs'),Core=require('../rules/core'),
 World=require('../rules/world');
function fixture(seed,item,quantity){
 const s=E.newGame({seed,name:'Disposable Private Person Seller',path:'undecided',
  background:'fieldworker'}),w=Realm.ensure(s),t=People.ensure(w),
  reg=Atlas.R.morrowfen_basin,polity=Atlas.P[reg.polity],
  eco=w.ecosystems[reg.id],host=w.countries[reg.polity],vendor=w.localProvisioner;
 const d={kind:'livelihood-work',regionId:reg.id,
  polity:reg.polity,language:polity.language,good:'grain',
  localName:reg.name,evidence:{
   regionalGoods:reg.goods.slice(),regionBiome:reg.biome,
   ecological:{quality:eco.quality,pressure:eco.pressure,
    water:eco.water,forage:eco.forage},
   civic:{stability:host.stability,prosperity:host.prosperity},
   existingMerchant:vendor.seller,existingStock:vendor.stock,
   witnessedNeed:'Ordinary trade work is independently needed at the original market'}};
 const person=People._debug.make(w,t,0,d);
 person.shift=People.shift(person,0);
 s.world.minutes=8*60;
 A.ok(People.presence(w,person.actorId,'crossing',0));
 A.equal(Careers.verify(person),true);
 A.equal(Market.verify(w),true);
 const gift=R.act(s,{system:'social',operation:'materialHandoff',
  params:{npcId:person.actorId,item,quantity}});
 if(!gift.accepted)return null;
 const accepted=R.act(s,{system:'social',
  operation:'purchaseOwnedMaterial',params:{npcId:person.actorId,item,quantity:1}});
 if(!accepted.accepted)return null;
 return {s,w,person,item,gift,accepted,quantity};
}
function chosen(item,quantity,first){
 for(let seed=first;seed<first+100;seed++){
  const f=fixture(seed,item,quantity);
  if(f)return f;
 }
 throw Error('An independently accepted gift and sale should occur among real disposable citizen choices');
}
for(const [item,quantity,first] of [
 ['marsh_reed',2,910321],
 ['clean_rations',1,910721]
]){
 const {s,w,person,gift,accepted}=chosen(item,quantity,first);
 const account=w.materialCustody.accounts[person.actorId],
  record=account.history.at(-1),q=record.source,
  sales=person.independentMarketSales||[];
 A.equal(gift.quantityMoved,quantity);
 A.equal(accepted.quantityMoved,1);
 A.equal(accepted.paidScales,E.RESOURCES[item].value*100);
 A.equal(record.origin,H.PERSON_SALE);
 A.equal(record.sourceHash,sales[0].sourceHash);
 A.equal(record.sourceHash,account.saleReceipts[0].sourceHash);
 A.equal(sales.length,1);
 A.equal(q.accepted,true);
 A.equal(q.sellerActorId,person.actorId);
 A.equal(q.item,item);
 A.equal(q.sellerHeldBefore,quantity);
 A.equal(q.sellerHeldAfter,quantity-1);
 A.equal(q.noCreatedGoodsOrScales,true);
 A.equal(q.noCompelledSale,true);
 A.equal(Core.conservedItems({sourceBefore:q.sellerHeldBefore,
  sourceAfter:q.sellerHeldAfter,targetBefore:q.buyerHeldBefore,
  targetAfter:q.buyerHeldAfter,amount:1}),true);
 A.equal(Core.conservedScales({sourceBefore:q.buyerScalesBefore,
  sourceAfter:q.buyerScalesAfter,targetBefore:q.sellerScalesBefore,
  targetAfter:q.sellerScalesAfter,amount:q.priceScales}),true);
 A.equal(s.player.inventory[item],q.buyerHeldAfter);
 A.equal(account.held[item]||0,q.sellerHeldAfter);
 A.equal(person.cashScales,q.sellerScalesAfter);
 A.equal(Market.verifyPersonal(person).receivedScales,q.priceScales);
 A.equal(Careers.verify(person),true);
 A.equal(Market.verify(w),true);
 A.doesNotThrow(()=>H.validateAccount(account,person.actorId));
 A.equal(s.table.finances.entries.at(-1).change,-q.priceScales);
 A.equal(s.log.at(-1).details?.sellerScalesBefore,undefined,
  'the player may witness the sale but not inspect private seller cash');
 const oldState=E.exportGame(s);
 const snapshot=E.importGame(oldState);
 A.equal(E.exportGame(snapshot),oldState);
 A.equal(Market.verify(snapshot.table.realm),true);
 const oldCash=person.cashScales,oldRng=s.rngState,oldWorldRng=w.rngState;
 A.equal(R.act(s,{system:'social',operation:'ownedMaterialHistory',
  params:{ownerId:'npc:'+person.actorId}}).knownOwnedPhysicalMaterialObservations.length,0);
 A.equal(person.cashScales,oldCash);
 A.equal(s.rngState,oldRng);
 A.equal(w.rngState,oldWorldRng);
 // False source payments and orphaned property mirrors are rejected.
 const existing=structuredClone(sales[0]);
 sales[0].source.sellerScalesAfter+=100;
 sales[0].sourceHash=require('node:crypto').createHash('sha256')
  .update(JSON.stringify(sales[0].source)).digest('hex');
 A.equal(Careers.verify(person),false);
 sales[0]=existing;
 A.equal(Market.verify(w),true);
 account.saleReceipts[0].sourceHash='f'.repeat(64);
 A.equal(Market.verify(w),false);
 account.saleReceipts[0]=structuredClone(existing);
 A.equal(Market.verify(w),true);
 const beforeCheat=E.exportGame(s);
 for(const params of [
  {npcId:person.actorId,item,quantity:0},
  {npcId:person.actorId,item,quantity:1,priceScales:1},
  {npcId:'emergent:imaginary_seller',item,quantity:1},
  {npcId:person.actorId,item:'imagined_crystal',quantity:1},
  {npcId:person.actorId,item,quantity:900},
 ]){
  A.throws(()=>R.act(s,{system:'social',operation:'purchaseOwnedMaterial',params}));
  A.equal(E.exportGame(s),beforeCheat);
 }
 World.advance(s,24);
 A.equal(Careers.verify(person),true);
 A.equal(Market.verify(w),true);
 A.equal(E.exportGame(E.importGame(E.exportGame(s))),E.exportGame(s));
}
console.log('Foundation #19: two unlike finite source-owned goods sold by an actual independently present citizen; exact original money/item conservation, autonomous choice, person career income, privacy, persistence, later world ticks, forged claims rejected PASS');
