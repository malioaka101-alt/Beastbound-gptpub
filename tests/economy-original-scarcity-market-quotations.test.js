'use strict';
// #19 source-grounded price pressure of one REAL existing merchant, not a
// universal price law, invented buyer, or remote omniscient market oracle.
// All market and ecological stress fixtures here are disposable only.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),Realm=require('../world/simulation'),
 Market=require('../rules/original-local-market-scarcity'),
 Crypto=require('node:crypto');
const sha=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function fresh(seed=993810){
 const s=E.newGame({seed,name:'Source Market Price Fixture',path:'undecided'});
 s.world.minutes=8*60;Realm.ensure(s);
 return s;
}
const quote=s=>R.act(s,{system:'gear',operation:'inquire',params:{npcId:'otto'}});
const offers=s=>R.act(s,{system:'gear',operation:'offers',params:{}});
const buy=(s,id)=>R.act(s,{system:'gear',operation:'purchase',
 params:{offerId:id}});
{
 const s=fresh(),w=s.table.realm,v=w.localProvisioner,
  market=w.market.reedmarch.grain,eco=w.ecosystems.morrowfen_basin,
  oldRng=s.rngState,oldCoins=s.player.coins,oldStock=v.stock;
 A.equal(market,1);
 A.ok(oldStock>1);
 const first=quote(s),o=s.table.merchantOffers[first.offerId],
  e=o.originalMarketScarcity;
 A.equal(first.quoted,true);
 A.equal(first.priceScales,800,
  'the unchanged original healthy and moderately stocked local scene preserves existing quoted price');
 A.equal(o.originalMarketScarcityHash,sha(e));
 A.equal(e.originalGrainIndex,market);
 A.equal(e.localForage,eco.forage);
 A.equal(e.localQuality,eco.quality);
 A.equal(e.actualSellerStock,oldStock);
 A.equal(e.scarcityPremiumPct,0);
 A.equal(Market.verify(e,o.originalMarketScarcityHash,
  o.priceScales,o.initialStock),true);
 A.equal(first.stock,oldStock);
 A.equal(s.rngState,oldRng,'a merchant quotation has no random draw');
 A.equal(s.player.coins,oldCoins);
 A.equal(v.stock,oldStock);
 const before=E.exportGame(s);
 const fromMarket=offers(s);
 A.equal(fromMarket.available[0].priceScales,800);
 A.equal(E.exportGame(s),before,'an already witnessed market offer is read-only');
 const result=buy(s,first.offerId);
 A.equal(result.paidScales,800);
 A.equal(s.player.coins,oldCoins-8);
 A.equal(v.fundsScales,2500+800);
 A.equal(v.stock,oldStock-1);
 A.equal(s.rngState,oldRng);
 A.equal(Market.verify(e,o.originalMarketScarcityHash,
  o.priceScales,o.initialStock),true,
  'already witnessed original quote keeps its original valid historical conditions after real sale');
 const save=E.exportGame(s),copy=E.importGame(save);
 A.equal(E.exportGame(copy),save);
 A.equal(offers(copy).available[0].priceScales,800);
}
{
 const s=fresh(993811),w=s.table.realm;
 const original=quote(s);
 const v=w.localProvisioner,base=s.table.merchantOffers[original.offerId];
 // Synthetic pressure is confined to the disposable source fixture.
 w.ecosystems.morrowfen_basin.forage=30;
 w.ecosystems.morrowfen_basin.quality=20;
 const oldRng=s.rngState,oldCoins=s.player.coins,
  oldStock=v.stock,oldPrice=base.priceScales;
 const strained=quote(s),q=s.table.merchantOffers[strained.offerId],
  snapshot=q.originalMarketScarcity;
 A.equal(strained.priceScales,Math.round(
  E.RESOURCES.clean_rations.value*100*1.22/10)*10);
 A.equal(snapshot.scarcityPremiumPct,22);
 A.equal(strained.priceScales>original.priceScales,true);
 A.equal(s.rngState,oldRng);
 A.equal(v.stock,oldStock);
 A.equal(s.player.coins,oldCoins);
 A.equal(Market.verify(snapshot,q.originalMarketScarcityHash,
  q.priceScales,q.initialStock),true);
 A.equal(base.priceScales,oldPrice,'a past witnessed quote never reprices itself');
 const purchase=buy(s,strained.offerId);
 A.equal(purchase.paidScales,strained.priceScales);
 A.equal(v.stock,oldStock-1);
 A.equal(s.player.coins,oldCoins-strained.priceScales/100);
 const snapshotSave=E.exportGame(s);
 A.equal(E.exportGame(E.importGame(snapshotSave)),snapshotSave);
}
{
 const s=fresh(993812),w=s.table.realm,v=w.localProvisioner;
 const first=quote(s);
 for(let i=0;i<v.founding.initialStock-1;i++)
  A.equal(buy(s,first.offerId).purchased,true);
 A.equal(v.stock,1);
 const currentPrice=quote(s),q=s.table.merchantOffers[currentPrice.offerId];
 A.equal(q.originalMarketScarcity.actualSellerStock,1);
 A.equal(q.originalMarketScarcity.scarcityPremiumPct,8);
 A.equal(currentPrice.priceScales,860);
 const former=s.table.merchantOffers[first.offerId];
 A.equal(former.priceScales,800,'valid old quote keeps established price until expiry');
 A.equal(buy(s,currentPrice.offerId).purchased,true);
 A.equal(v.stock,0);
 const empty=quote(s);
 A.equal(empty.stock,0);
 A.equal(s.table.merchantOffers[empty.offerId].originalMarketScarcity.actualSellerStock,0);
 A.throws(()=>buy(s,empty.offerId),/no item left in stock/);
 A.equal(v.stock,0,'quote cannot generate goods when shelf is empty');
}
{
 const s=fresh(993813),q0=quote(s),q=s.table.merchantOffers[q0.offerId],
  v=s.table.realm.localProvisioner;
 const copied=structuredClone(q);
 q.originalMarketScarcity.localForage=0;
 A.equal(offers(s).available.length,0,
  'altered original ecological source is not a valid merchant quote');
 A.throws(()=>buy(s,q.id),/source-verified price/);
 Object.assign(q,copied);
 A.equal(offers(s).available.length,1);
 const seal=sha(q.originalMarketScarcity);
 q.originalMarketScarcity.localForage=10;
 q.originalMarketScarcityHash=sha(q.originalMarketScarcity);
 q.proofHash=sha({origin:'source-witnessed-local-provisions-v1',id:q.id,
  sellerNpcId:q.sellerNpcId,seller:q.seller,location:q.location,item:q.item,
  source:q.source,worldMinute:q.worldMinute,
  expiresAtMinute:q.expiresAtMinute,priceScales:q.priceScales,
  initialStock:q.initialStock,
  originalMarketScarcity:q.originalMarketScarcity,
  originalMarketScarcityHash:q.originalMarketScarcityHash});
 A.equal(Market.verify(q.originalMarketScarcity,q.originalMarketScarcityHash,
  q.priceScales,q.initialStock),false,
  'resealing a false local price snapshot without the real calculated price still fails verification');
 A.notEqual(q.originalMarketScarcityHash,seal);
 A.throws(()=>buy(s,q.id),/source-verified price/);
 A.equal(v.stock,v.founding.initialStock);
}
{
 const s=fresh(993814),o=quote(s),
  q=s.table.merchantOffers[o.offerId];
 // Historical legacy offers had no specific scarcity snapshot, and
 // remain valid at their original time and price. Do not rewrite them.
 delete q.originalMarketScarcity;
 delete q.originalMarketScarcityHash;
 q.proofHash=sha({origin:'source-witnessed-local-provisions-v1',
  id:q.id,sellerNpcId:q.sellerNpcId,seller:q.seller,
  location:q.location,item:q.item,source:q.source,
  worldMinute:q.worldMinute,expiresAtMinute:q.expiresAtMinute,
  priceScales:q.priceScales,initialStock:q.initialStock});
 A.equal(offers(s).available.length,1);
 A.equal(buy(s,o.offerId).paidScales,800);
}
console.log('Original source-grounded local market: real regional grain index, ecology and actual merchant stock control a witnessed fixed-price quote, with independent supply stress, conservation, save reload, no extra RNG, tamper rejection and old quote compatibility PASS');
