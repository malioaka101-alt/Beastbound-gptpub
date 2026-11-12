'use strict';
// #19: one ORIGINAL locally established provisioner's already-existing
// wholesale deliveries are exposed to the ORIGINAL grain/feed corridors.
// Original local goods do not vanish when an interstate road closes.
// This is NOT a universal supply model, a new merchant, a manufactured
// shipment, a new route, a foreign permit, a treaty or extra world dice.
const Crypto=require('node:crypto'),Atlas=require('./atlas');
const ORIGIN='original-reedmarch-wholesale-transport-evidence-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function supplyCorridors(){
 return Atlas.tradeRoutes.filter(r=>
  (r.a==='reedmarch'||r.b==='reedmarch')&&
  (['grain','feed'].includes(r.exportA)||
   ['grain','feed'].includes(r.exportB)));
}
function sourceAt(w,day){
 if(!w||!Number.isInteger(day)||day<0||day>10000000)
  throw Error('A genuine original wholesale world day is required');
 const region=Atlas.R.morrowfen_basin;
 if(!region||region.polity!=='reedmarch'||
  !['grain','feed'].every(x=>region.goods.includes(x)))
  throw Error('Actual canonical local wholesale goods and their home polity are required');
 const routes=supplyCorridors();
 if(!routes.length)
  throw Error('Original relevant real grain/feed transport corridors were not established');
 const Sim=require('./simulation'),records=[];
 for(const r of routes){
  const v=w.routes?.[r.id];
  if(!v||!Sim.verifyOriginalRouteHistory(w,r))
   throw Error('A genuine original recorded trade route is required for wholesale provenance');
  const changes=v.originalChanges||[];
  if(v.disrupted&&!changes.length)
   throw Error('An unrecorded private route closure cannot be treated as a real disruption');
  const latest=changes.filter(x=>x.day<=day).at(-1);
  const disrupted=latest?.disrupted??false;
  // These are actual prior ORIGINAL month decisions, not new inferred
  // weather checks, merchant roll results or newly imported stock.
  records.push({routeId:r.id,mode:r.mode,
   goods:[r.exportA,r.exportB].filter(x=>['grain','feed'].includes(x)),
   actualTransportDisrupted:disrupted,
   originalChangeDay:latest?.day??null,
   originalChangeSourceHash:latest?.sourceHash??null});
 }
 const constrained=records.some(x=>x.actualTransportDisrupted);
 return {origin:ORIGIN,day,
  sourceRegionId:'morrowfen_basin',sourcePolityId:'reedmarch',
  sourceSellerNpcId:'otto',materialBasis:['grain','feed'],
  originalTradeCorridors:records,
  regionalLocalSupplyRemainsPossible:true,
  oneOriginalBulkDeliveryMaximum:2,
  // One closed, ORIGINAL grain/feed corridor burdens a small seller's
  // outside wholesale access. Ordinary local provisions may still arrive.
  wholesaleUnitCeiling:constrained?1:2,
  actualScarcityFromOriginalCorridor:constrained,
  noNewTradeGoodsOrCurrency:true,
  noPlayerOrWorldRandomConsumed:true,
  noGuaranteedTreatyOrForeignPermission:true};
}
function observe(w,day){
 const source=sourceAt(w,day);
 return {source,sourceHash:hash(source)};
}
function verify(w,v){
 if(!v)return false;
 const start=v.originalTransportWitnessStartDay;
 if(start===undefined){
  // Valid legacy merchant ledgers predate this extension.
  return (v.history||[]).every(x=>x?.originalTransportWitness===undefined);
 }
 if(!Number.isInteger(start)||start<0||start>v.lastRestockDay||
  !Array.isArray(v.history))return false;
 let previous=-1;
 for(const row of v.history){
  if(!row)return false;
  const proof=row.originalTransportWitness;
  // Ordinary physical sales record worldMinute, not day; keep the
  // pre-existing authentic sale and wage ledgers untouched.
  if(row.kind!=='independent-wholesale-attempt'){
   if(proof!==undefined)return false;
   continue;
  }
  if(!Number.isInteger(row.day)||row.day<previous)return false;
  previous=row.day;
  if(row.day<start){
   if(proof!==undefined)return false;
   continue;
  }
  if(!proof||typeof proof!=='object'||!proof.source||
   proof.source.origin!==ORIGIN||
   proof.source.day!==row.day||
   proof.sourceHash!==hash(proof.source))
   return false;
  let expected;
  try{expected=sourceAt(w,row.day);}catch{return false;}
  if(JSON.stringify(proof.source)!==JSON.stringify(expected)||
   !Number.isInteger(row.received)||row.received<0||
   row.received>expected.wholesaleUnitCeiling||
   row.paidScales!==row.received*500||
   !Number.isInteger(row.remainingStock)||
   row.remainingStock<0||row.remainingStock>8)
   return false;
 }
 return true;
}
module.exports={ORIGIN,supplyCorridors,sourceAt,observe,verify};
