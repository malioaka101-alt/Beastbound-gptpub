'use strict';
// #19: genuine individual buyer payment of already earned Scales for an
// EXISTING original local ration. Uses real original work wages, independently
// expressed regional interest, real merchant stock, original personal material
// custody and the unchanged true sixday world clock. All people disposable.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine.js'),W=require('../rules/world'),
 Realm=require('../world/simulation'),Atlas=require('../world/atlas'),
 People=require('../world/emergent-people'),
 Careers=require('../world/person-careers'),
 Demand=require('../world/independent-regional-demand'),
 Market=require('../world/independent-local-purchases');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const DAY=1440;
function fixture(seed=994821,count=72){
 const s=E.newGame({seed,name:'Disposable Actual Funded Independent Market',
  path:'undecided'}),w=Realm.ensure(s),t=People.ensure(w),
  reg=Atlas.R.morrowfen_basin,polity=Atlas.P[reg.polity],
  eco=w.ecosystems[reg.id],host=w.countries[reg.polity],
  seller=w.localProvisioner;
 for(let i=0;i<count;i++){
  const d={kind:'livelihood-work',regionId:reg.id,
   polity:reg.polity,language:polity.language,good:'grain',
   localName:reg.name,evidence:{
    regionalGoods:reg.goods.slice(),regionBiome:reg.biome,
    ecological:{quality:eco.quality,pressure:eco.pressure,
     water:eco.water,forage:eco.forage},
    civic:{stability:host.stability,prosperity:host.prosperity},
    existingMerchant:seller.seller,existingStock:seller.stock,
    witnessedNeed:'Real original grain/feed seller needs actual local service without creating new inventory'}};
  const p=People._debug.make(w,t,0,d);
  p.shift=People.shift(p,0);
  A.ok(People.presence(w,p.actorId,'crossing',0));
  A.equal(Careers.verify(p),true);
 }
 return {s,w,seller};
}
{
 const {s,w,seller}=fixture(994821);
 const beforePlayerCoins=s.player.coins,
  beforePlayerStock=structuredClone(s.player.inventory),
  initial=E.exportGame(s),clock=structuredClone(s);
 A.equal(Market.verify(w),true);
 A.equal(Demand.verify(w),true);
 A.deepEqual(Realm.publicEconomy(s).locallyPostedGoodsInterest,[]);
 A.equal(E.exportGame(s),initial);
 W.advance(s,6);
 E.advance(clock,6*DAY);
 A.equal(s.rngState,clock.rngState);
 A.equal(Market.verify(w),true);
 A.equal(Demand.verify(w),true);
 A.equal((seller.independentCustomerPurchases||[]).length,0,
  'no original resident was given free spending money by wishing for food');
 const eligible=w.independentMarketDemand.records.filter(row=>
  row.accepted&&row.source.regionId==='morrowfen_basin'&&
  ['grain','feed'].includes(row.source.good));
 A.ok(eligible.length>4,'existing original people can independently seek genuine regional grain/feed');
 const selected=eligible.find(row=>{
  const p=w.emergentPeople.people[row.source.personId],
   draw=parseInt(hash('real-funded-purchase|'+Market.ORIGIN+'|'+
    p.originHash+'|'+row.sourceHash).slice(0,8),16)/4294967296;
  return draw<.46; // Real next-market acceptance decision, not caller-chosen
 });
 A.ok(selected,'one originally observed individual independently chooses to consider a funded shop transaction');
 const p=w.emergentPeople.people[selected.source.personId],
  other=w.emergentPeople.people[eligible.find(x=>
   x.source.personId!==p.id).source.personId];
 A.equal(p.cashScales,0);
 A.equal(other.cashScales,0);
 const dutyId='original_witnessed_stock_maintenance',
  duty=Careers.authorDuty(w,p,{
   id:dutyId,role:'Existing provisioner stock inspection',
   method:'shop-stock-service',domain:'trade',day:6,
   goal:'Examine existing shop stock and honestly report observed storage conditions with no imaginary cargo',
   witness:'The real established local provisioner independently needs ordinary actual service from this present worker'});
 A.equal(duty.id,dutyId);
 let finished=null;
 for(let i=0;i<160;i++){
  const response=Careers.work(w,p,6);
  if(response.success&&p.career.workReceipts.some(x=>
   x.sourceHash===response.receiptHash&&
   x.source.task.authoredDutyId===dutyId)){
   finished=response;break;
  }
 }
 A.ok(finished,'a genuine separately resolved original professional trade task succeeds before wages');
 const actualWage=1100,priorSellerMoney=seller.fundsScales,
  oldPlayerRng=s.rngState,oldWorldRng=w.rngState;
 A.ok(priorSellerMoney>=actualWage);
 const wage=Careers.payVerifiedTradeWork(w,p,{
  workHash:finished.receiptHash,amountScales:actualWage,day:6,
  witness:seller.seller+' independently pays for the completed real trading service by '+
   p.name+' after genuine existing stock maintenance; these Scales come from only the established original merchant funds.'});
 A.equal(wage.paidScales,actualWage);
 A.equal(p.cashScales,actualWage);
 A.equal(seller.fundsScales,priorSellerMoney-actualWage);
 A.equal(s.rngState,oldPlayerRng);
 A.equal(w.rngState,oldWorldRng);
 A.equal(Careers.verify(p),true);
 A.equal(Market.verify(w),true);
 const beforeNextDay=E.exportGame(s),
  noPlayerChange=structuredClone(s.player.inventory),
  moneyBeforeSale=seller.fundsScales,stockBeforeSale=seller.stock;
 W.advance(s,6);
 const sales=seller.independentCustomerPurchases||[];
 A.equal(sales.length,1,
  'exactly one independent genuinely funded worker may buy one source-supported ration');
 const row=sales[0],q=row.source;
 A.equal(q.origin,Market.ORIGIN);
 A.equal(q.personId,p.id);
 A.equal(q.originalDemandHash,selected.sourceHash);
 A.equal(q.item,'clean_rations');
 A.equal(q.quantity,1);
 A.equal(q.day,12);
 A.equal(q.individualAccepted,true);
 A.equal(q.noCompulsoryPurchase,true);
 A.equal(q.noCreditOrGoodsCreated,true);
 A.equal(row.sourceHash,hash(q));
 A.equal(q.sellerStockAfter,q.sellerStockBefore-1);
 A.equal(q.sellerScalesAfter,q.sellerScalesBefore+q.paidPriceScales);
 A.equal(q.personCashAfter,q.personCashBefore-q.paidPriceScales);
 A.equal(p.independentMarketPurchases.length,1);
 A.equal(p.cashScales,actualWage-q.paidPriceScales);
 A.equal(other.cashScales,0,'unfunded person with same local needs cannot buy by assumption');
 A.equal(seller.fundsScales,moneyBeforeSale-
  (seller.history.filter(x=>x.kind==='independent-wholesale-attempt'&&x.day===12)
   .reduce((n,x)=>n+x.paidScales,0))+q.paidPriceScales);
 A.equal(seller.stock,
  stockBeforeSale+
  seller.history.filter(x=>x.kind==='independent-wholesale-attempt'&&x.day===12)
   .reduce((n,x)=>n+x.received,0)-1);
 const acct=w.materialCustody.accounts[p.actorId];
 A.equal(acct.held.clean_rations,1);
 A.equal(acct.purchaseReceipts.length,1);
 A.equal(acct.purchaseReceipts[0].purchaseSourceHash,row.sourceHash);
 A.equal(acct.purchaseReceipts[0].hash,
  hash(Object.fromEntries(Object.entries(acct.purchaseReceipts[0])
   .filter(([key])=>key!=='hash'))));
 A.equal(Careers.verify(p),true);
 A.equal(Market.verifyPersonal(p).valid,true);
 A.equal(Market.verifyPersonal(p).spentScales,q.paidPriceScales);
 A.equal(Careers.verifyLocalTradePayments(w),true);
 A.equal(Market.verify(w),true);
 A.equal(s.player.coins,beforePlayerCoins,
  'real NPC shopping does not pay the player or change player-owned Scales');
 A.deepEqual(s.player.inventory,noPlayerChange,
  'NPC shopping does not give the player the other person’s purchased ration');
 A.deepEqual(s.player.inventory,beforePlayerStock);
 const save=E.exportGame(s),copy=E.importGame(save);
 A.equal(E.exportGame(copy),save);
 A.equal(Market.verify(copy.table.realm),true);
 A.equal(Careers.verify(copy.table.realm.emergentPeople.people[p.id]),true);
 A.equal(Realm.localProvisioner(copy).fundsScales,seller.fundsScales);
 const saved=E.exportGame(s);
 A.throws(()=>Market.buy(w,p,12),/original worker|sixday|required/,
  'the same original purchasing decision cannot be reexecuted off the completed world tick');
 A.equal(E.exportGame(s),saved);
 A.notEqual(beforeNextDay,saved);
 const originalRow=structuredClone(sales[0]);
 sales[0].source.sellerScalesAfter+=100;
 sales[0].sourceHash=hash(sales[0].source);
 A.equal(Market.verify(w),false,'rewritten merchant proceeds cannot survive source replay');
 sales[0]=structuredClone(originalRow);
 A.equal(Market.verify(w),true);
 const originalAcct=structuredClone(acct.purchaseReceipts[0]);
 acct.purchaseReceipts[0].purchaseSourceHash='f'.repeat(64);
 acct.purchaseReceipts[0].hash=hash(Object.fromEntries(
  Object.entries(acct.purchaseReceipts[0]).filter(([key])=>key!=='hash')));
 A.equal(Market.verify(w),false,'a resealed personal ration without original sale is rejected');
 acct.purchaseReceipts[0]=structuredClone(originalAcct);
 A.equal(Market.verify(w),true);
 const originalCash=p.cashScales;
 p.cashScales+=q.paidPriceScales;
 A.equal(Careers.verify(p),false,'spending cash cannot be silently restored as freshly earned wages');
 p.cashScales=originalCash;
 A.equal(Careers.verify(p),true);
 W.advance(s,6);
 A.equal(Market.verify(w),true);
 A.equal(Careers.verify(p),true);
 A.equal(acct.purchaseReceipts.length,1,
  'independent postpurchase ration use does not destroy authenticated financial and physical provenance');
 const finalSave=E.exportGame(s);
 A.equal(E.exportGame(E.importGame(finalSave)),finalSave);
 A.equal(Market.verify(E.importGame(finalSave).table.realm),true);
}
console.log('Foundation #19 true independent funded food purchase: real separately successful original work wage, private individually chosen and locally founded buyer interest, physically verified merchant ration, one-time exact two-way Scales conservation, original personal item custody and later use, no invented buyer or NPC funds, durable save and tamper refusal PASS');
