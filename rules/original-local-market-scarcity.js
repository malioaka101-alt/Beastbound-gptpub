'use strict';
// #19 actual observed scarcity — original merchant, actual region, actual
// living forage/quality and original grain index. This is NOT a universal
// price-law, imagined demand survey, tax, wage, price for distant goods, or
// implicit consumption of forage during an ordinary price conversation.
// A market's original world tick already reflects original trade conditions.
const Crypto=require('node:crypto'),E=require('../engine.js');
const ORIGIN='original-local-provisioner-scarcity-quotation-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function percent(q){
 return (q.localForage<45?12:0)+(q.localQuality<35?10:0)+
  (q.actualSellerStock<=1?8:0);
}
function price(q){
 const base=E.RESOURCES.clean_rations.value*100;
 return Math.max(100,Math.round(base*q.originalGrainIndex*
  (100+percent(q))/100/10)*10);
}
function proof(q){
 return {origin:ORIGIN,sourceSellerNpcId:'otto',
  sourceRegionId:'morrowfen_basin',sourcePolityId:'reedmarch',
  originalMarketCategory:'grain',
  originalGrainIndex:q.originalGrainIndex,
  localForage:q.localForage,localQuality:q.localQuality,
  actualSellerStock:q.actualSellerStock,
  provenance:'independent-original-grain-market-and-established-local-habitat',
  physicalGoodsNeverCreated:true,
  regionalIndexAlreadyRespondsToOriginalTradeAndProsperity:true,
  householdDemandNotInvented:true,
  scarcityPremiumPct:percent(q),
  actualQuotedPriceScales:price(q)};
}
function observe(w,v){
 const eco=w.ecosystems?.morrowfen_basin,index=w.market?.reedmarch?.grain;
 if(!eco||!v||v.origin!=='established-reedmarch-provisions-v1'||
  v.regionId!=='morrowfen_basin'||v.sellerNpcId!=='otto'||
  v.item!=='clean_rations'||
  !Number.isFinite(index)||index<=0||index>5||
  !Number.isInteger(eco.forage)||eco.forage<0||eco.forage>100||
  !Number.isInteger(eco.quality)||eco.quality<0||eco.quality>100||
  !Number.isInteger(v.stock)||v.stock<0||v.stock>8)
  throw Error('A real original regional commodity index, habitat and seller-owned stock are required for the local price');
 const source=proof({originalGrainIndex:index,localForage:eco.forage,
  localQuality:eco.quality,actualSellerStock:v.stock});
 return {source,sourceHash:hash(source)};
}
function verify(source,sourceHash,priceScales,initialStock){
 if(!source||typeof source!=='object'||Array.isArray(source)||
  !Number.isFinite(source.originalGrainIndex)||
  source.originalGrainIndex<=0||source.originalGrainIndex>5||
  !Number.isInteger(source.localForage)||source.localForage<0||
  source.localForage>100||
  !Number.isInteger(source.localQuality)||source.localQuality<0||
  source.localQuality>100||
  !Number.isInteger(source.actualSellerStock)||
  source.actualSellerStock<0||source.actualSellerStock>8||
  source.actualSellerStock!==initialStock||
  sourceHash!==hash(source))return false;
 const expected=proof(source);
 return JSON.stringify(source)===JSON.stringify(expected)&&
  priceScales===expected.actualQuotedPriceScales;
}
module.exports={ORIGIN,observe,verify};
