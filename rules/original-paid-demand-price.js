'use strict';
// #19: Only ACTUALLY PURCHASED, source-verified local provisions
// can affect this particular seller's later demand-sensitive quotation.
// A public interest expression or an unfunded offer is not a sale,
// buyer solvency, contract, economic vote, universal price formula or tax.
const Crypto=require('node:crypto');
const ORIGIN='original-verified-paid-local-retail-demand-pressure-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const WINDOW=6;
const premium=n=>Math.min(12,n*6);
function proof({day,paidSales}){
 return {origin:ORIGIN,regionId:'morrowfen_basin',
  sellerNpcId:'otto',good:'clean_rations',
  observedOriginalSixday:day,windowDays:WINDOW,
  genuineSellerPaidSales:paidSales.map(row=>({
   receiptId:row.id,sourceHash:row.sourceHash,
   day:row.source.day,
   physicallyTransferredUnits:row.source.quantity,
   paidOriginalScales:row.source.paidPriceScales})),
  realFundedBuyerSalesCount:paidSales.length,
  originalSellerSpecificMarkupPct:premium(paidSales.length),
  noUnfundedInterestOrInventedCustomersCounted:true,
  noAutomaticPurchaseOrExtraCurrency:true,
  noRetroactiveQuoteRepricing:true};
}
function validate(source,seal){
 if(!source||source.origin!==ORIGIN||
  source.regionId!=='morrowfen_basin'||
  source.sellerNpcId!=='otto'||source.good!=='clean_rations'||
  !Number.isInteger(source.observedOriginalSixday)||
  source.observedOriginalSixday<0||
  source.windowDays!==WINDOW||
  !Array.isArray(source.genuineSellerPaidSales)||
  source.genuineSellerPaidSales.length>10000||
  source.realFundedBuyerSalesCount!==source.genuineSellerPaidSales.length||
  source.originalSellerSpecificMarkupPct!==premium(source.genuineSellerPaidSales.length)||
  source.noUnfundedInterestOrInventedCustomersCounted!==true||
  source.noAutomaticPurchaseOrExtraCurrency!==true||
  source.noRetroactiveQuoteRepricing!==true||
  seal!==hash(source))return false;
 const seen=new Set();
 for(const row of source.genuineSellerPaidSales){
  if(!row||typeof row.receiptId!=='string'||
   typeof row.sourceHash!=='string'||!/^[a-f0-9]{64}$/.test(row.sourceHash)||
   !Number.isInteger(row.day)||
   row.day>source.observedOriginalSixday||
   row.day<source.observedOriginalSixday-WINDOW||
   row.physicallyTransferredUnits!==1||
   !Number.isInteger(row.paidOriginalScales)||
   row.paidOriginalScales<1||row.paidOriginalScales>100000000||
   seen.has(row.receiptId))
   return false;
  seen.add(row.receiptId);
 }
 return true;
}
function backedByActualSeller(w,source){
 if(!source)return true; // Honest historical quotes predate this record.
 if(!validate(source,hash(source)))return false;
 const rows=w?.localProvisioner?.independentCustomerPurchases||[];
 if(!Array.isArray(rows))return false;
 return source.genuineSellerPaidSales.every(sale=>{
  const row=rows.find(x=>x.id===sale.receiptId);
  return !!row&&row.sourceHash===sale.sourceHash&&
   row.origin==='genuine-independent-funded-local-ration-purchase-v1'&&
   row.source?.sellerId==='otto'&&
   row.source?.sellerRegionId==='morrowfen_basin'&&
   row.source?.item==='clean_rations'&&
   row.source?.quantity===sale.physicallyTransferredUnits&&
   row.source?.day===sale.day&&
   row.source?.paidPriceScales===sale.paidOriginalScales;
 });
}
function observe(w,v){
 if(!v||v.origin!=='established-reedmarch-provisions-v1'||
  v.sellerNpcId!=='otto'||v.item!=='clean_rations'||
  !Number.isInteger(w?.lastTickDay)||w.lastTickDay<0)
  throw Error('Only a real original seller at its actual world day may report confirmed paid demand');
 // The same preexisting buyer-to-seller/physical-custody verifier proves
 // these are real financed transactions, not fabricated board requests.
 if(!require('../world/independent-local-purchases').verify(w))
  throw Error('Genuine independent buyer wages, goods and seller proceeds are inconsistent');
 const rows=v.independentCustomerPurchases||[];
 const eligible=rows.filter(row=>row?.source?.day<=w.lastTickDay&&
  row.source.day>=w.lastTickDay-WINDOW)
  .sort((a,b)=>a.source.day-b.source.day||a.id.localeCompare(b.id));
 const source=proof({day:w.lastTickDay,paidSales:eligible}),
  sourceHash=hash(source);
 if(!validate(source,sourceHash)||!backedByActualSeller(w,source))
  throw Error('Original completed and actual funded regional sales are unverified');
 return {source,sourceHash};
}
module.exports={ORIGIN,observe,validate,backedByActualSeller};
