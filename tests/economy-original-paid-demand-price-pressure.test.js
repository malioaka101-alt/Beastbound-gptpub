'use strict';
// #19: sale-specific pressure, never inferred from unfunded resident desires.
// This example belongs to the one existing source-established provisioner,
// not universal prices, wages, cultural appetites or imaginary customers.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine.js'),W=require('../rules/world'),
 R=require('../rules'),Realm=require('../world/simulation'),
 Atlas=require('../world/atlas'),People=require('../world/emergent-people'),
 Paid=require('../rules/original-paid-demand-price'),
 Scarcity=require('../rules/original-local-market-scarcity');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function originalPerson(w){
 const t=People.ensure(w),reg=Atlas.R.morrowfen_basin,
  polity=Atlas.P[reg.polity],eco=w.ecosystems[reg.id],
  host=w.countries[reg.polity];
 const d={kind:'local-provisioning',regionId:reg.id,
  polity:reg.polity,language:polity.language,good:'grain',
  localName:reg.name,evidence:{regionalGoods:reg.goods.slice(),
   regionBiome:reg.biome,ecological:{quality:eco.quality,
    pressure:eco.pressure,water:eco.water,forage:eco.forage},
   civic:{stability:host.stability,prosperity:host.prosperity}}};
 const p=People._debug.make(w,t,0,d);p.shift=People.shift(p,0);
 A.ok(People.presence(w,p.actorId,'crossing',0));
 return p;
}
{
 const s=E.newGame({seed:995251,name:'Unfunded Original Market Interest',
  path:'undecided'}),w=Realm.ensure(s),v=w.localProvisioner,
  initial=E.exportGame(s),currency=s.player.coins,
  ownerFunds=v.fundsScales,ownerStock=v.stock;
 const original=Scarcity.observe(w,v),data=original.source.originalPaidDemand;
 A.equal(data.realFundedBuyerSalesCount,0);
 A.equal(data.originalSellerSpecificMarkupPct,0);
 A.equal(data.genuineSellerPaidSales.length,0);
 A.equal(Paid.validate(data,original.source.originalPaidDemandHash),true);
 A.equal(Paid.backedByActualSeller(w,data),true);
 A.equal(original.source.actualQuotedPriceScales,800);
 A.equal(Scarcity.verify(original.source,original.sourceHash,800,v.stock),true);
 A.equal(E.exportGame(s),initial,'looking at conditions neither rolls dice nor creates a quote');
 const older=R.act(s,{system:'gear',operation:'inquire',params:{npcId:'otto'}});
 A.equal(older.priceScales,800);
 A.equal(v.fundsScales,ownerFunds);
 A.equal(v.stock,ownerStock);
 const oldSource=structuredClone(s.table.merchantOffers[older.offerId]);
 for(let i=0;i<28;i++)originalPerson(w);
 W.advance(s,6); // real original individuals may independently post interest
 const expressions=(w.independentMarketDemand?.records||[])
  .filter(x=>x.accepted&&x.source.regionId==='morrowfen_basin');
 A.ok(expressions.length>0,'real independent people do express genuine source-backed local interest');
 A.equal((v.independentCustomerPurchases||[]).length,0,
  'none have earned actual Scales, so an unfunded desire is not a sale');
 const after=Scarcity.observe(w,v),newData=after.source.originalPaidDemand;
 A.equal(newData.realFundedBuyerSalesCount,0);
 A.equal(newData.originalSellerSpecificMarkupPct,0);
 A.equal(newData.genuineSellerPaidSales.length,0);
 A.equal(Paid.validate(newData,after.source.originalPaidDemandHash),true);
 A.equal(Paid.backedByActualSeller(w,newData),true);
 const normal=Math.max(100,Math.round(
  E.RESOURCES.clean_rations.value*100*w.market.reedmarch.grain*
  (100+(w.ecosystems.morrowfen_basin.forage<45?12:0)+
   (w.ecosystems.morrowfen_basin.quality<35?10:0)+
   (v.stock<=1?8:0))/100/10)*10);
 A.equal(after.source.actualQuotedPriceScales,normal,
  'actual ecological supply and original grain still matter, but unfunded public desire does not create a retail premium');
 A.equal(s.table.merchantOffers[older.offerId].priceScales,800,
  'existing witnessed old offer cannot retroactively reprice');
 A.deepEqual(s.table.merchantOffers[older.offerId],oldSource);
 A.equal(s.player.coins,currency);
 const saved=E.exportGame(s),copy=E.importGame(saved);
 A.equal(E.exportGame(copy),saved);
 A.equal(Paid.validate(Scarcity.observe(copy.table.realm,copy.table.realm.localProvisioner)
  .source.originalPaidDemand,after.source.originalPaidDemandHash),true);
}
{
 const s=E.newGame({seed:995252,name:'No Imaginary Local Shopper',
  path:'undecided'}),w=Realm.ensure(s),v=w.localProvisioner;
 const actual=Scarcity.observe(w,v),source=structuredClone(actual.source.originalPaidDemand);
 source.genuineSellerPaidSales.push({receiptId:'made-up-customer',
  sourceHash:'f'.repeat(64),day:0,physicallyTransferredUnits:1,paidOriginalScales:800});
 source.realFundedBuyerSalesCount=1;
 source.originalSellerSpecificMarkupPct=6;
 const seal=hash(source);
 A.equal(Paid.validate(source,seal),true,
  'syntactically consistent customer evidence alone is not proof of a real sale');
 A.equal(Paid.backedByActualSeller(w,source),false,
  'no person or seller can manufacture a past paid purchase by resealing an invented source');
 A.equal(Paid.backedByActualSeller(w,actual.source.originalPaidDemand),true);
 v.independentCustomerPurchases=[{id:'made-up-customer',
  origin:'genuine-independent-funded-local-ration-purchase-v1',
  source:{personId:'invented',day:0},sourceHash:'f'.repeat(64)}];
 A.throws(()=>Scarcity.observe(w,v),
  /wages, goods and seller proceeds are inconsistent/,
  'fictitious buyer history is rejected before it may influence a price');
 delete v.independentCustomerPurchases;
 A.equal(Scarcity.observe(w,v).source.actualQuotedPriceScales,800);
}
console.log('Original #19 paid-demand local quotes: true unpaid community interest stays nonbinding and no retail sale premium, only genuine source-funded recorded customer transfers can influence future prices, older fixed quotes and source receipts survive, fake buyers rejected, exact save replay PASS');
