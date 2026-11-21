'use strict';
// Foundation #19 — first REAL independent NPC purchase in original Scales.
// This is an optional purchase by an originally paid, independently present
// living worker at the established seller, NOT a universal demand curve,
// invented wages, player-controlled agency or newly generated goods.
const Crypto=require('node:crypto'),
 E=require('../engine.js'),Core=require('../rules/core'),
 Atlas=require('./atlas'),
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
 const rows=p?.independentMarketPurchases||[];
 if(!Array.isArray(rows)||rows.length>10000)
  return {valid:false,spentScales:0,receivedScales:0};
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
   !Core.conservedScales({sourceBefore:q.personCashBefore,
    sourceAfter:q.personCashAfter,targetBefore:q.sellerScalesBefore,
    targetAfter:q.sellerScalesAfter,amount:q.paidPriceScales})||
   !Number.isInteger(q.day)||q.day<prior||
   !Number.isInteger(q.originalBuyerChoice)||
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
 // Original owner-to-player purchases are physical SALES by this citizen.
 // They are not earned work, and they cannot be misclassified as wages.
 // This is the same citizen's existing independent-market source and cash.
 let received=0;
 const saleRows=p?.independentMarketSales||[];
 if(!Array.isArray(saleRows)||saleRows.length>10000)
  return {valid:false,spentScales:spent,receivedScales:0};
 const seenSales=new Set();
 for(const row of saleRows){
  const q=row?.source,resource=E.RESOURCES[q?.item];
  if(!q||row.origin!==Handoffs.PERSON_SALE||
     q.origin!==Handoffs.PERSON_SALE||
     row.sourceHash!==hash(q)||!q.accepted||
     q.sellerActorId!==p.actorId||q.sellerId!==p.id||
     q.sellerOriginHash!==p.originHash||q.sellerName!==p.name||
     typeof q.buyerName!=='string'||q.buyerName.length<3||
     !Number.isSafeInteger(q.buyerSeed)||
     typeof q.originalOwnedSourceHash!=='string'||
     !/^[a-f0-9]{64}$/.test(q.originalOwnedSourceHash)||
     typeof q.location!=='string'||!E.LOCATIONS[q.location]||
     !Number.isInteger(q.worldMinute)||q.worldMinute<0||
     q.day!==Math.floor(q.worldMinute/1440)||
     !resource||!Number.isSafeInteger(resource.value)||resource.value<1||
     !Number.isSafeInteger(q.quantity)||q.quantity<1||
     q.referenceValueScales!==resource.value*100||
     q.priceScales!==q.referenceValueScales*q.quantity||
     !Number.isSafeInteger(q.priceScales)||q.priceScales<1||
     !Core.conservedItems({sourceBefore:q.sellerHeldBefore,
      sourceAfter:q.sellerHeldAfter,targetBefore:q.buyerHeldBefore,
      targetAfter:q.buyerHeldAfter,amount:q.quantity})||
     !Core.conservedScales({sourceBefore:q.buyerScalesBefore,
      sourceAfter:q.buyerScalesAfter,targetBefore:q.sellerScalesBefore,
      targetAfter:q.sellerScalesAfter,amount:q.priceScales})||
     !Number.isInteger(q.sellerRngBefore)||q.sellerRngBefore<1||
     !Number.isInteger(q.sellerRngAfter)||q.sellerRngAfter<1||
     q.sellerRngAfter!==nextOwnerRng(q.sellerRngBefore)||
     q.drawBits!==q.sellerRngAfter||
     q.sellerAccepted!==true||
     q.drawBits/4294967296>=.62||
     q.noCreatedGoodsOrScales!==true||
     q.noCompelledSale!==true||q.noUniversalTradePrice!==true||
     seenSales.has(row.sourceHash))
   return {valid:false,spentScales:spent,receivedScales:0};
  received+=q.priceScales;
  if(!Number.isSafeInteger(received))
   return {valid:false,spentScales:spent,receivedScales:0};
  seenSales.add(row.sourceHash);
 }
 // Actual original non-consumable examination service is a paid use of
 // the SAME physical Scales; it does not issue goods, a licence or a Grade
 // merely because it was purchased. The assessment owner separately replays
 // its own private choices, biological calibration and actual d20 result.
 const examOrigin='source-paid-independent-original-numeric-beast-grade-exam-v1',
  originalExamFee=100,examRows=p?.originalIndependentGradeExams||[];
 if(!Array.isArray(examRows)||examRows.length>480)
  return {valid:false,spentScales:spent,receivedScales:received};
 const usedGradeWitnesses=new Set();
 for(const row of examRows){
  const q=row?.source;
  if(!q||row.seal!==hash(q)||q.origin!==examOrigin||
   q.actorId!==p.actorId||q.humanHash!==p.originHash||
   !Number.isInteger(q.minute)||q.minute<0||
   q.endMinute!==q.minute+q.actualMinutes||
   q.accepted!==Boolean(q.humanChoice?.accepted&&q.beastChoice?.outcome==='accepted')||
   !Number.isInteger(q.cashBefore)||q.cashBefore<0||
   q.cashAfter!==q.cashBefore-(q.accepted?originalExamFee:0)||
   q.feeScales!==(q.accepted?originalExamFee:0)||
   (q.accepted&&q.cashBefore<originalExamFee)||
   q.actualMinutes!==(q.accepted?120:5)||
   !['academy','crossing'].includes(q.site)||
   typeof q.witnessHash!=='string'||q.witnessHash.length!==64||
   usedGradeWitnesses.has(q.witnessHash))
    return {valid:false,spentScales:spent,receivedScales:received};
  if(q.accepted){
   if(!Number.isSafeInteger(spent+originalExamFee))
    return {valid:false,spentScales:spent,receivedScales:received};
   spent+=originalExamFee;
  }
  usedGradeWitnesses.add(q.witnessHash);
 }
 return {valid:true,spentScales:spent,receivedScales:received};
}
function nextOwnerRng(n){
 let x=n>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 return (x>>>0)||0x45aef127;
}
function verifyOwnerSales(w){
 for(const p of Object.values(w?.emergentPeople?.people||{})){
  if(!verifyPersonal(p).valid)return false;
  const acct=w.materialCustody?.accounts?.[p.actorId];
  for(const row of p.independentMarketSales||[]){
   if(!acct?.saleReceipts?.some(x=>x.sourceHash===row.sourceHash&&
      JSON.stringify(x)===JSON.stringify(row)))return false;
  }
 }
 for(const [id,acct] of Object.entries(w?.materialCustody?.accounts||{})){
  const person=id.startsWith('emergent:')?
   w.emergentPeople?.people?.[id.slice(9)]:null;
  for(const row of acct.saleReceipts||[])
   if(!person?.independentMarketSales?.some(x=>
     x.sourceHash===row.sourceHash&&JSON.stringify(x)===JSON.stringify(row)))
    return false;
 }
 return true;
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
// An independently travelled human can consider the SAME already owned
// ration and source-local original price. No invented demand posting or
// home-region rewrite: signed live visitor arrival is their actual shift.
function visitorPurchaseSource(w,p,q,sourceHash){
 const v=q?.visitorSource;
 if(!v)return false;
 const Visit=require('../rules/independent-sapient-terrestrial-journey'),
  Arr=require('../rules/independent-sapient-arrangements'),
  Food=require('../rules/independent-visitor-ration-trade'),
  pos=Visit.position(p,v.minute),
  shift=Visit.visitorPresence(p,v.minute,'crossing'),
  old=(p.originalSapientTerrestrialJourneys||[]).find(x=>x.seal===v.arrivalSeal);
 const check=hash({origin:Food.ORIGIN,intentId:v.intentId,
  actorId:p.actorId,beastId:v.beastId,minute:v.minute,
  arrivalSeal:v.arrivalSeal,witnessHash:v.witnessHash,
  choice:v.humanChoice});
 return v.origin===Food.ORIGIN&&v.actorId===p.actorId&&
  v.humanHash===p.originHash&&typeof v.beastId==='string'&&
  typeof v.beastHash==='string'&&v.beastHash.length===64&&
  v.site==='crossing'&&Number.isInteger(v.minute)&&v.minute>=1440&&
  v.day===Math.floor(v.minute/1440)&&q.day===v.day&&
  q.interestId===v.intentId&&v.intentId===Food.id(v)&&
  v.originalVisitorShiftHash===shift?.hash&&
  pos?.arrived&&pos.location==='crossing'&&
  pos.sourceHash===v.arrivalSeal&&
  old?.source?.beastId===v.beastId&&
  old.source.beastHash===v.beastHash&&
  old.source.departed===true&&old.source.to==='crossing'&&
  old.source.arrivalMinute<=v.minute&&
  q.independentOriginalPresence?.hash===shift?.hash&&
  v.purchaseContextHash===check&&
  Arr.verifyHuman(v.humanChoice,v.witnessHash)&&
  v.humanChoice.personality===p.personality&&
  v.humanChoice.accepted===true&&
  v.noAssumedAnimalFeeding===true&&
  v.noOtherSellerOrChosenPurchase===true&&
  q.originalBuyerChoice===v.humanChoice.rngAfter&&
  q.individualWillingness===v.humanChoice.chance&&
  q.individualAccepted===true&&
  (p.originalVisitorRationRequests||[]).some(r=>
   r.source?.intentId===v.intentId&&
   r.source?.purchaseContextHash===v.purchaseContextHash&&
   r.source?.purchaseSourceHash===sourceHash&&
   r.source?.accepted===true);
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
  !Core.conservedScales({sourceBefore:q.personCashBefore,
   sourceAfter:q.personCashAfter,targetBefore:q.sellerScalesBefore,
   targetAfter:q.sellerScalesAfter,amount:q.paidPriceScales})||
  q.sellerStockAfter!==q.sellerStockBefore-1||
  q.independentOriginalPresence?.hash!==hash(Object.fromEntries(
   Object.entries(q.independentOriginalPresence||{}).filter(([k])=>k!=='hash')))||
  q.independentOriginalPresence?.originHash!==p.originHash||
  q.independentOriginalPresence?.location!=='crossing'||
  q.independentOriginalPresence?.fromDay>q.day||
  q.independentOriginalPresence?.throughDay<q.day||
  (q.visitorSource?(!visitorPurchaseSource(w,p,q,row.sourceHash)||
   q.originalDemandHash!==undefined||
   q.originalDemandSource!==undefined):
   (q.originalDemandHash!==hash(q.originalDemandSource)||
  !['grain','feed'].includes(q.originalDemandSource?.good)||
  q.originalDemandSource?.regionId!=='morrowfen_basin'||
  q.originalDemandSource?.day>=q.day||
  q.originalDemandSource?.expiryDay<q.day||
  q.interestId!==q.originalDemandSource?.id||
  !Demand.verifyOne(w,{id:q.interestId,day:q.originalDemandSource.day,
   origin:Demand.ORIGIN,accepted:true,
   source:q.originalDemandSource,sourceHash:q.originalDemandHash})))||
  !Scarcity.verify(q.priceSource,q.priceSourceHash,
   q.paidPriceScales,q.sellerStockBefore)||
  (q.priceSource?.originalPaidDemand!==undefined&&
   !require('../rules/original-paid-demand-price').backedByActualSeller(
    w,q.priceSource.originalPaidDemand))||
  (!q.visitorSource&&(
   q.originalBuyerChoice!==Math.floor(independentChoice(p,{
    sourceHash:q.originalDemandHash})*4294967296)||
   q.individualWillingness!==chance(q)||
   q.individualAccepted!==true||
   q.originalBuyerChoice/4294967296>=q.individualWillingness))||
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
 if(!q.visitorSource&&interests.some(x=>x.id===q.interestId&&
  x.sourceHash!==q.originalDemandHash))return false;
 return true;
}
function verify(w){
 const merchant=w?.localProvisioner;
 if(!merchant)return verifyOwnerSales(w);
 const rows=merchant.independentCustomerPurchases;
 if(rows===undefined)
  return verifyOwnerSales(w)&&Object.values(w.emergentPeople?.people||{}).every(p=>
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
 return verifyOwnerSales(w);
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
 const heldBefore=w.materialCustody?.accounts?.[p.actorId]?.held?.clean_rations??0;
 if(!Core.conservedItems({sourceBefore:q.sellerStockBefore,
   sourceAfter:q.sellerStockAfter,targetBefore:heldBefore,
   targetAfter:heldBefore+q.quantity,amount:q.quantity}))
  throw Error('An original independently purchased physical item must conserve between seller and person custody');
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
// Source-bounded physically visiting citizen, not an alternative shop.
// Called only after fresh original independent buyer acceptance. Conserves
// the SAME original merchant finite stock, actual Scales and owner holdings.
function buyVerifiedVisitor(s,p,b,{visitorIntent:it,quoted}={}){
 const Realm=require('./simulation'),Visit=require('../rules/independent-sapient-terrestrial-journey'),
  w=Realm.peek(s),vendor=w.localProvisioner,day=Math.floor(s.world.minutes/1440),
  shift=Visit.visitorPresence(p,s.world.minutes,'crossing');
 if(!it||!quoted?.canOffer||it.origin!=='real-independent-visitor-funded-original-ration-purchase-v1'||
  it.actorId!==p.actorId||it.beastId!==b?.id||!it.humanChoice?.accepted||
  day!==it.day||it.minute!==s.world.minutes||it.site!=='crossing'||
  shift?.hash!==it.shiftHash||!People.verify(w,p)||!verify(w)||
  !vendor||vendor.origin!=='established-reedmarch-provisions-v1'||
  vendor.sellerNpcId!=='otto'||vendor.location!=='crossing'||
  vendor.item!=='clean_rations'||vendor.stock<1||
  !Number.isInteger(p.cashScales)||p.cashScales<quoted.priceScales||
  vendor.fundsScales+quoted.priceScales>100000000)
  throw Error('Actual self-funded visitor, original saved physical seller and unspent ration stock required');
 const price=Scarcity.observe(w,vendor),amount=price.source.actualQuotedPriceScales;
 if(amount!==quoted.priceScales||price.sourceHash!==quoted.originalPriceSourceHash||
  vendor.stock!==quoted.originalMerchantStock||
  it.actualPriceScales!==amount||it.originalPriceSourceHash!==price.sourceHash)
  throw Error('Actual seller inventory and original quoted ration price changed');
 const v={origin:it.origin,actorId:p.actorId,humanHash:p.originHash,
  beastId:b.id,beastHash:b.sapientLife.sourceHash,
  site:'crossing',day,minute:it.minute,arrivalSeal:it.arrivalSeal,
  originalVisitorShiftHash:it.shiftHash,intentId:it.intentId,
  witnessHash:it.witnessHash,
  purchaseContextHash:it.purchaseContextHash,
  humanChoice:structuredClone(it.humanChoice),
  noAssumedAnimalFeeding:true,noOtherSellerOrChosenPurchase:true};
 const q={origin:ORIGIN,id:receiptId(p.id,it.intentId),
  personId:p.id,actorId:p.actorId,personOriginHash:p.originHash,
  personName:p.name,sellerId:'otto',sellerName:vendor.seller,
  sellerLocation:'crossing',sellerRegionId:'morrowfen_basin',
  item:'clean_rations',quantity:1,day,
  originalSixdayNumber:w.ticks.sixdays,
  interestId:it.intentId,
  independentOriginalPresence:structuredClone(shift),
  priceSource:price.source,priceSourceHash:price.sourceHash,
  paidPriceScales:amount,
  personCashBefore:p.cashScales,
  personCashAfter:p.cashScales-amount,
  sellerScalesBefore:vendor.fundsScales,
  sellerScalesAfter:vendor.fundsScales+amount,
  sellerStockBefore:vendor.stock,sellerStockAfter:vendor.stock-1,
  originalBuyerChoice:it.humanChoice.rngAfter,
  individualWillingness:it.humanChoice.chance,
  individualAccepted:true,visitorSource:v,
  noCreditOrGoodsCreated:true,noCompulsoryPurchase:true,
  notUniversalPriceOrDemand:true};
 const row={id:q.id,origin:ORIGIN,source:q,sourceHash:hash(q)};
 if(!verifyPersonal(p).valid||
  (p.independentMarketPurchases||[]).some(x=>x.id===row.id))
  throw Error('Prior visitor purchase or person money source is invalid');
 Handoffs.preflightPurchasedRation(w,p.actorId,row);
 const before=w.materialCustody?.accounts?.[p.actorId]?.held?.clean_rations??0;
 if(!Core.conservedItems({sourceBefore:q.sellerStockBefore,
  sourceAfter:q.sellerStockAfter,targetBefore:before,
  targetAfter:before+1,amount:1})||
  !Core.conservedScales({sourceBefore:q.personCashBefore,
   sourceAfter:q.personCashAfter,targetBefore:q.sellerScalesBefore,
   targetAfter:q.sellerScalesAfter,amount}))
  throw Error('Genuine original visitor ration sale must conserve goods and Scales');
 p.cashScales=q.personCashAfter;
 p.independentMarketPurchases||=[];p.independentMarketPurchases.push(row);
 vendor.stock=q.sellerStockAfter;vendor.fundsScales=q.sellerScalesAfter;
 vendor.independentCustomerPurchases||=[];
 vendor.independentCustomerPurchases.push(structuredClone(row));
 vendor.history.push({day,kind:'real-independent-funded-local-sale',
  buyerId:p.id,item:'clean_rations',quantity:1,
  paidScales:amount,remainingStock:vendor.stock,
  remainingScales:vendor.fundsScales,sourceHash:row.sourceHash});
 if(vendor.history.length>80)vendor.history.shift();
 Handoffs.creditPurchasedRation(w,p.actorId,row);
 return {sourceHash:row.sourceHash,amountScales:amount,
  item:'clean_rations',humanOwnedQuantity:1};
}
module.exports={ORIGIN,verifyPersonal,verifyOne,verify,buy,sixday,buyVerifiedVisitor};
