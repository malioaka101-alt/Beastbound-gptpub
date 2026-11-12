'use strict';
// Foundation #19 — first REAL independent NPC purchase in original Scales.
// This is an optional purchase by an originally paid, independently present
// living worker at the established seller, NOT a universal demand curve,
// invented wages, player-controlled agency or newly generated goods.
const Crypto=require('node:crypto'),
 E=require('../engine.js'),Atlas=require('./atlas'),
 People=require('./emergent-people'),
 Demand=require('./independent-regional-demand'),
 Scarcity=require('../rules/original-local-market-scarcity'),
 Handoffs=require('../rules/material-handoffs');
const ORIGIN='genuine-independent-funded-local-ration-purchase-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function chance(q){
 return Math.min(.89,Math.max(.17,.48+
  (q.originalDemandSource.personOriginalNeed==='local-provisioning'?.15:0)+
  (q.originalDemandSource.ecologyAtDecision.forage<43?.09:0)-
  (q.paidPriceScales>1000?.12:0)));
}
function independentChoice(p,interest){
 return parseInt(hash('real-funded-purchase|'+ORIGIN+'|'+
  p.originHash+'|'+interest.sourceHash).slice(0,8),16)/4294967296;
}
function receiptId(personId,interestId){
 return 'actual_ration_sale_'+hash(personId+'|'+interestId).slice(0,40);
}
function verifyPersonal(p){
 // Exact conservation is checked by the existing independently paid career
 // balance verifier. This function only audits physically confirmed spends.
 const rows=p?.independentMarketPurchases;
 if(rows===undefined)return {valid:true,spentScales:0};
 if(!Array.isArray(rows)||rows.length>10000)
  return {valid:false,spentScales:0};
 let spent=0,prior=-1;
 const seen=new Set();
 for(const row of rows){
  const q=row?.source;
  if(!q||row.origin!==ORIGIN||row.id!==q.id||
   row.sourceHash!==hash(q)||
   q.origin!==ORIGIN||q.id!==receiptId(p.id,q.interestId)||
   q.personId!==p.id||q.personOriginHash!==p.originHash||
   q.actorId!==p.actorId||
   q.item!=='clean_rations'||q.quantity!==1||
   !Number.isInteger(q.paidPriceScales)||q.paidPriceScales<100||
   !Number.isInteger(q.personCashBefore)||q.personCashBefore<q.paidPriceScales||
   q.personCashAfter!==q.personCashBefore-q.paidPriceScales||
   !Number.isInteger(q.day)||q.day<prior||
   !Number.isInteger(q.originalBuyerChoice)||
   !Number.isInteger(q.sellerScalesBefore)||q.sellerScalesBefore<0||
   q.sellerScalesAfter!==q.sellerScalesBefore+q.paidPriceScales||
   !Number.isInteger(q.sellerStockBefore)||q.sellerStockBefore<1||q.sellerStockBefore>8||
   q.sellerStockAfter!==q.sellerStockBefore-1||
   q.noCreditOrGoodsCreated!==true||
   q.noCompulsoryPurchase!==true||
   q.notUniversalPriceOrDemand!==true||
   seen.has(q.id))
   return {valid:false,spentScales:0};
  if(!Number.isSafeInteger(spent+q.paidPriceScales))
   return {valid:false,spentScales:0};
  spent+=q.paidPriceScales;prior=q.day;seen.add(q.id);
 }
 return {valid:true,spentScales:spent};
}
function actualInterest(w,p,day){
 const candidates=w.independentMarketDemand?.records||[];
 if(!Demand.verify(w))throw Error('Prior individually expressed market demand is not authentic');
 return candidates.filter(row=>
  row.accepted&&row.source.personId===p.id&&
  row.source.regionId==='morrowfen_basin'&&
  ['grain','feed'].includes(row.source.good)&&
  row.source.day<day&&row.source.expiryDay>=day&&
  !p.independentMarketPurchases?.some(x=>x.source.interestId===row.id))
  .at(-1)||null;
}
function verifyOne(w,row){
 const q=row?.source,p=w.emergentPeople?.people?.[q?.personId],
  merchant=w.localProvisioner,acct=w.materialCustody?.accounts?.[q?.actorId],
  interests=w.independentMarketDemand?.records||[];
 if(!q||!p||!merchant||row.origin!==ORIGIN||
  row.id!==q.id||row.sourceHash!==hash(q)||
  !People.verify(w,p)||
  q.origin!==ORIGIN||q.id!==receiptId(q.personId,q.interestId)||
  q.personId!==p.id||q.personOriginHash!==p.originHash||
  q.actorId!==p.actorId||q.personName!==p.name||
  q.sellerId!=='otto'||q.sellerName!==E.NPCS.otto.name||
  q.sellerRegionId!=='morrowfen_basin'||q.sellerLocation!=='crossing'||
  q.item!=='clean_rations'||q.quantity!==1||
  !Number.isInteger(q.day)||q.day<1||q.day>w.lastTickDay+15||
  !Number.isInteger(q.originalSixdayNumber)||q.originalSixdayNumber<1||
  q.originalSixdayNumber>w.ticks.sixdays||
  q.personCashAfter!==q.personCashBefore-q.paidPriceScales||
  q.sellerScalesAfter!==q.sellerScalesBefore+q.paidPriceScales||
  q.sellerStockAfter!==q.sellerStockBefore-1||
  q.independentOriginalPresence?.hash!==hash(Object.fromEntries(
   Object.entries(q.independentOriginalPresence||{}).filter(([k])=>k!=='hash')))||
  q.independentOriginalPresence?.originHash!==p.originHash||
  q.independentOriginalPresence?.location!=='crossing'||
  q.independentOriginalPresence?.fromDay>q.day||
  q.independentOriginalPresence?.throughDay<q.day||
  q.originalDemandHash!==hash(q.originalDemandSource)||
  !['grain','feed'].includes(q.originalDemandSource?.good)||
  q.originalDemandSource?.regionId!=='morrowfen_basin'||
  q.originalDemandSource?.day>=q.day||
  q.originalDemandSource?.expiryDay<q.day||
  q.interestId!==q.originalDemandSource?.id||
  !Demand.verifyOne(w,{id:q.interestId,day:q.originalDemandSource.day,
   origin:Demand.ORIGIN,accepted:true,
   source:q.originalDemandSource,sourceHash:q.originalDemandHash})||
  !Scarcity.verify(q.priceSource,q.priceSourceHash,
   q.paidPriceScales,q.sellerStockBefore)||
  (q.priceSource?.originalPaidDemand!==undefined&&
   !require('../rules/original-paid-demand-price').backedByActualSeller(
    w,q.priceSource.originalPaidDemand))||
  q.originalBuyerChoice!==Math.floor(independentChoice(p,{
   sourceHash:q.originalDemandHash})*4294967296)||
  q.individualWillingness!==chance(q)||
  q.individualAccepted!==true||
  q.originalBuyerChoice/4294967296>=q.individualWillingness||
  q.noCreditOrGoodsCreated!==true||
  q.noCompulsoryPurchase!==true||
  q.notUniversalPriceOrDemand!==true||
  !p.independentMarketPurchases?.some(x=>x.id===row.id&&
   x.sourceHash===row.sourceHash&&JSON.stringify(x)===JSON.stringify(row))||
  !acct||
  !acct.purchaseReceipts?.some(x=>x.origin===ORIGIN&&
   x.purchaseSourceHash===row.sourceHash&&
   x.actorId===p.actorId&&x.item==='clean_rations'&&
   x.quantity===1&&x.hash===hash(Object.fromEntries(
    Object.entries(x).filter(([k])=>k!=='hash')))))
  return false;
 // Earlier source posts can roll out of the bounded market-interest board;
 // original complete proof stays copied in this real purchase.
 if(interests.some(x=>x.id===q.interestId&&
  x.sourceHash!==q.originalDemandHash))return false;
 return true;
}
function verify(w){
 const merchant=w?.localProvisioner;
 if(!merchant)return true;
 const rows=merchant.independentCustomerPurchases;
 if(rows===undefined)
  return Object.values(w.emergentPeople?.people||{}).every(p=>
   (p.independentMarketPurchases||[]).length===0);
 if(!Array.isArray(rows)||rows.length>10000)return false;
 const seen=new Set();
 for(const row of rows){
  if(!verifyOne(w,row)||seen.has(row.id))return false;
  seen.add(row.id);
 }
 for(const p of Object.values(w.emergentPeople?.people||{}))
  for(const row of p.independentMarketPurchases||[])
   if(!seen.has(row.id))return false;
 // Also check the other direction: NO forged 'paid purchase' can be
 // inserted into the existing personal material-custody account without
 // the same actual seller-funded sale. This remains true after the
 // rolling independent-use journal has pruned old events.
 const sales=new Set(rows.map(x=>x.sourceHash));
 for(const [actorId,acct] of Object.entries(w.materialCustody?.accounts||{}))
  for(const receipt of acct.purchaseReceipts||[])
   if(receipt.actorId!==actorId||
    !sales.has(receipt.purchaseSourceHash)||
    !rows.some(x=>x.sourceHash===receipt.purchaseSourceHash&&
     x.source.actorId===actorId))
    return false;
 return true;
}
function buy(w,p,day){
 const merchant=w.localProvisioner;
 if(!merchant||merchant.origin!=='established-reedmarch-provisions-v1'||
  merchant.sellerNpcId!=='otto'||merchant.regionId!=='morrowfen_basin'||
  merchant.item!=='clean_rations'||merchant.location!=='crossing'||
  !People.verify(w,p)||p.status!=='active'||
  p.regionId!==merchant.regionId||p.lastTickDay!==day||
  !Number.isInteger(day)||day<1||
  !Number.isInteger(w.ticks?.sixdays)||w.ticks.sixdays<1||
  day<=w.lastTickDay||day>w.lastTickDay+15||
  !People.presence(w,p.actorId,'crossing',day)||
  !verify(w))
  throw Error('One real present original worker and source-verified original local seller are required');
 const interest=actualInterest(w,p,day);
 if(!interest)return {bought:false,reason:'no-authentic-prior-interest'};
 const price=Scarcity.observe(w,merchant),amount=price.source.actualQuotedPriceScales,
  decision=independentChoice(p,interest),
  interestSource=structuredClone(interest.source),
  q0={origin:ORIGIN,id:receiptId(p.id,interest.id),
   personId:p.id,actorId:p.actorId,personOriginHash:p.originHash,
   personName:p.name,sellerId:'otto',sellerName:merchant.seller,
   sellerLocation:'crossing',sellerRegionId:'morrowfen_basin',
   item:'clean_rations',quantity:1,day,
   originalSixdayNumber:w.ticks.sixdays,
   interestId:interest.id,
   originalDemandSource:interestSource,
   originalDemandHash:interest.sourceHash,
   independentOriginalPresence:People.presence(w,p.actorId,'crossing',day),
   priceSource:price.source,priceSourceHash:price.sourceHash,
   paidPriceScales:amount,
   personCashBefore:p.cashScales??0,
   personCashAfter:(p.cashScales??0)-amount,
   sellerScalesBefore:merchant.fundsScales,
   sellerScalesAfter:merchant.fundsScales+amount,
   sellerStockBefore:merchant.stock,
   sellerStockAfter:merchant.stock-1,
   originalBuyerChoice:Math.floor(decision*4294967296),
   noCreditOrGoodsCreated:true,noCompulsoryPurchase:true,
   notUniversalPriceOrDemand:true},
  willingness=chance(q0);
 if(decision>=willingness)return {bought:false,reason:'person-declined',noForcedChoice:true};
 if(merchant.stock<1)return {bought:false,reason:'original-seller-out-of-stock'};
 if(p.cashScales<amount)return {bought:false,reason:'actual-wage-cash-insufficient'};
 if(merchant.fundsScales+amount>100000000)
  return {bought:false,reason:'original-merchant-account-limit'};
 const q={...q0,individualWillingness:willingness,individualAccepted:true},
  row={id:q.id,origin:ORIGIN,source:q,sourceHash:hash(q)};
 const paymentCheck=verifyPersonal(p);
 if(!paymentCheck.valid)return {bought:false,reason:'wage-and-spend-ledger-invalid'};
 // Preflight physical destination BEFORE moving seller-owned stock or Scales.
 Handoffs.preflightPurchasedRation(w,p.actorId,row);
 p.cashScales=q.personCashAfter;
 p.independentMarketPurchases||=[];p.independentMarketPurchases.push(row);
 merchant.stock=q.sellerStockAfter;merchant.fundsScales=q.sellerScalesAfter;
 merchant.independentCustomerPurchases||=[];
 merchant.independentCustomerPurchases.push(structuredClone(row));
 merchant.history.push({day,kind:'real-independent-funded-local-sale',
  buyerId:p.id,item:'clean_rations',quantity:1,
  paidScales:amount,remainingStock:merchant.stock,
  remainingScales:merchant.fundsScales,sourceHash:row.sourceHash});
 if(merchant.history.length>80)merchant.history.shift();
 Handoffs.creditPurchasedRation(w,p.actorId,row);
 if(!verify(w))
  throw Error('One genuine independent funded purchase failed original source-custody reconciliation');
 return {bought:true,amountScales:amount,item:'clean_rations',
  buyerId:p.id,sourceHash:row.sourceHash,
  originalWageMoneyTransferred:true,noItemsOrScalesCreated:true,
  hiddenIndependentPurchaseNotAutomaticallyPublic:true};
}
function sixday(w,day){
 if(!Number.isInteger(day)||day<1||day<=w.lastTickDay||
  !verify(w))throw Error('Only the real current original sixday can settle independent retail trade');
 const buyerList=Object.values(w.emergentPeople?.people||{})
  .filter(x=>x.regionId==='morrowfen_basin'&&
   x.status==='active'&&x.cashScales>0)
  .sort((a,b)=>a.id.localeCompare(b.id));
 let bought=0;
 for(const p of buyerList){
  const result=buy(w,p,day);
  if(result.bought)bought++;
 }
 return {genuineFundedPurchases:bought,
  note:'Only original independently chosen paid purchases alter real stock/currency'};
}
module.exports={ORIGIN,verifyPersonal,verifyOne,verify,buy,sixday};
