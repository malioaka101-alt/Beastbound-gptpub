'use strict';
// Source-owned first ACTUAL visiting-person purchase at the original
// Morrowfen ration provisioner. Reuses precisely the current merchant
// stock, scarcity quotation, personal cash and original material custody.
// A purchased ration is the HUMAN's property; it is neither offered nor
// eaten by the independent sapient beast without a further separate action.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),Time=require('./world'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Person=require('../world/sapient-beast-persons'),Journey=require('./independent-sapient-terrestrial-journey'),
 Agency=require('./beast-agency'),Arr=require('./independent-sapient-arrangements'),
 BondCare=require('./bond-care'),Scarcity=require('./original-local-market-scarcity'),
 Market=require('../world/independent-local-purchases'),Handoffs=require('./material-handoffs');
const ORIGIN='real-independent-visitor-funded-original-ration-purchase-v1',
 WITNESS='gm-witnessed-original-independent-visitor-provisioner-ration-request-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 int=(x,a=0,z=1000000000)=>Number.isInteger(x)&&x>=a&&x<=z,
 prose=x=>typeof x==='string'&&x.trim().length>=25&&x.length<=900;
function id(q){return 'visitor_interest_'+hash({
 actorId:q.actorId,beastId:q.beastId,minute:q.minute,
 witnessHash:q.witnessHash}).slice(0,48);}
function setting(s,p,b,minute=s.world.minutes){
 if(!s||!p||!b||s.battle||s.encounter?.threat||
  !People.verify(Realm.peek(s),p)||!Person.verify(b)||
  !Journey.verify(s,p)||p.status!=='active'||b.owner!==null||
  s.player?.partnerIds?.includes(b.id)||b.sapience<3||
  b.away===true||b.location!=='crossing'||!b.sapientLife?.sourceHash||
  s.table?.bondRecords?.[b.id]?.contract)return null;
 const pos=Journey.position(p,minute),
  shift=Journey.visitorPresence(p,minute,'crossing');
 if(!pos?.arrived||pos.location!=='crossing'||!shift||
  shift.arrivedBy!==pos.sourceHash||
  !b.sapientLife.terrestrialJourneyReceipts?.some(x=>x.seal===pos.sourceHash)||
  shift.actorId!==p.actorId||shift.originHash!==p.originHash)
  return null;
 let diet;
 try{diet=BondCare.feedingProfile(s,b);}catch{return null;}
 if(!diet.locations.includes('crossing')||diet.item!=='clean_rations'||
  diet.quantity!==1||!E.SPECIES[b.species]||
  E.SPECIES[b.species].diet!=='omnivore')return null;
 return {pos,shift,diet};
}
function witnessValid(p,b,q){
 const w=q?.witness,d=w?.details;
 return w?.type==='story'&&prose(w.text)&&w.text.includes(p.name)&&
  w.text.includes(b.name)&&w.text.includes(E.NPCS.otto.name)&&
  w.day===q.day+1&&w.time===E.clock({world:{minutes:q.minute}})&&
  d?.origin===WITNESS&&d.actorId===p.actorId&&d.beastId===b.id&&
  d.humanOriginHash===p.originHash&&d.beastPersonHash===b.sapientLife.sourceHash&&
  d.sellerId==='otto'&&d.sellerName===E.NPCS.otto.name&&
  d.site==='crossing'&&d.minute===q.minute&&
  d.actualOriginalVisitorArrivalSeal===q.arrivalSeal&&
  d.originalVisitorShiftHash===q.shiftHash&&
  d.originalRationItem==='clean_rations'&&d.actualPriceScales===q.actualPriceScales&&
  prose(d.currentOriginalProvisionerOfferAndSeparateBuyerFreedom)&&
  prose(d.beastDietIsNotFoodConsent)&&
  d.noGuaranteedBeastFeedingOrWelfareAward===true&&
  d.noCompelledBuyerChoiceOrSellerFreeStock===true;
}
function readOnly(s,actorId,beastId){
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId?.slice(9)],
  b=s.beasts?.[beastId],minute=s.world.minutes,
  pair=setting(s,p,b,minute),v=w.localProvisioner;
 const reason=!pair?'no-current-authentic-independent-diet-verified-visiting-pair':
  minute%1440<480||minute%1440+10>1080?'outside-established-daytime-provisioner-service':
  !v||v.origin!=='established-reedmarch-provisions-v1'||
  v.sellerNpcId!=='otto'||v.location!=='crossing'||
  v.item!=='clean_rations'?'no-original-physical-provisioner':
  !Number.isSafeInteger(v.stock)||v.stock<1?'original-seller-out-of-stock':
  !int(w.ticks?.sixdays,1)?'original-sixday-market-ledger-not-yet-established':
  !int(p.cashScales,0,1000000000)?'human-earned-cash-not-established':null;
 if(reason)return {privateToGM:true,canOffer:false,reason,
  noPurchaseOrAnimalFeedingOrFundsCreated:true};
 const quote=Scarcity.observe(w,v);
 return {privateToGM:true,canOffer:p.cashScales>=quote.source.actualQuotedPriceScales,
  reason:p.cashScales>=quote.source.actualQuotedPriceScales?null:'insufficient-actual-individually-earned-scales',
  item:'clean_rations',quantity:1,originalVendor:'otto',priceScales:quote.source.actualQuotedPriceScales,
  buyerIndividualCashScales:p.cashScales,originalMerchantStock:v.stock,
  originalPriceSourceHash:quote.sourceHash,arrivalSeal:pair.pos.sourceHash,
  noPurchaseOrAnimalFeedingOrFundsCreated:true};
}
function verify(s,p){
 const rows=p?.originalVisitorRationRequests;
 if(rows===undefined)return true;
 if(!Array.isArray(rows)||rows.length>180||
  !People.verify(Realm.peek(s),p)||!Journey.verify(s,p))return false;
 const w=Realm.peek(s),seen=new Set(),days=new Set();let previous=-1;
 for(const row of rows){
  const q=row?.source,b=s.beasts?.[q?.beastId],
   pos=Journey.position(p,q?.minute),shift=Journey.visitorPresence(p,q?.minute,'crossing'),
   event=s.log?.[q?.witnessIndex],
   paid=(p.independentMarketPurchases||[]).find(x=>x.sourceHash===q?.purchaseSourceHash);
  if(!q||row.seal!==hash(q)||q.origin!==ORIGIN||
   q.actorId!==p.actorId||q.humanHash!==p.originHash||
   !b?.sapientLife||!Person.verify(b)||q.beastHash!==b.sapientLife.sourceHash||
   !int(q.minute,previous+1,s.world.minutes)||
   q.day!==Math.floor(q.minute/1440)||!int(q.day,1)||
   q.site!=='crossing'||!pos?.arrived||pos.location!=='crossing'||
   pos.sourceHash!==q.arrivalSeal||!shift||shift.hash!==q.shiftHash||
   !b.sapientLife.terrestrialJourneyReceipts?.some(x=>x.seal===q.arrivalSeal)||
   !int(q.witnessIndex,0,(s.log?.length||0)-1)||
   hash(event)!==q.witnessHash||!same(event,q.witness)||!witnessValid(p,b,q)||
   q.intentId!==id(q)||q.witnessHash!==hash(q.witness)||
   !Arr.verifyHuman(q.humanChoice,q.witnessHash)||
   q.humanChoice.personality!==p.personality||
   q.originalPriceSourceHash!==hash(q.priceSource)||
   !Scarcity.verify(q.priceSource,q.originalPriceSourceHash,
    q.actualPriceScales,q.originalSellerStockBefore)||
   q.accepted!==q.humanChoice.accepted||
   q.outcome!==(q.accepted?'actual-visitor-purchased-one-owned-ration':
    'actual-visitor-declined-ration-purchase')||
   q.actualMinutes!==(q.accepted?10:5)||
   q.endMinute!==q.minute+q.actualMinutes||
   q.endMinute>s.world.minutes||
   q.noInferredEatingOrAnimalConsent!==true||
   q.noSecondMerchantOrWalletOrInventedCurrency!==true||
   seen.has(q.witnessHash)||days.has(q.beastId+':'+q.day)||
   (q.accepted?!paid||paid.origin!==Market.ORIGIN||
    paid.source?.visitorSource?.intentId!==q.intentId||
    paid.source?.visitorSource?.purchaseContextHash!==q.purchaseContextHash||
    paid.source?.paidPriceScales!==q.actualPriceScales||
    paid.source?.sellerStockBefore!==q.originalSellerStockBefore||
    paid.source?.day!==q.day||
    paid.source?.visitorSource?.humanChoice?.accepted!==true:
    q.purchaseSourceHash!==null))
   return false;
  previous=q.minute;seen.add(q.witnessHash);days.add(q.beastId+':'+q.day);
 }
 return true;
}
function buy(s,{actorId,beastId,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId)||typeof beastId!=='string'||
  !int(witnessIndex,0,(s.log?.length||0)-1))
  throw Error('Only original individual IDs and actual witnessed seller price; no caller-selected stock, Grade, buyer acceptance or feeding');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  b=s.beasts?.[beastId],read=readOnly(s,actorId,beastId),
  minute=s.world.minutes,day=Math.floor(minute/1440),
  found=setting(s,p,b,minute),event=structuredClone(s.log[witnessIndex]);
 if(!read.canOffer||!found||day<1||s.battle||s.encounter||
  !verify(s,p)||!Market.verify(w)||!s.chatRuntime?.scene?.includes(event.text))
  throw Error('A legitimately funded and independently present buyer, real daylight vendor, actual quoted ration and original witness are required');
 const q={origin:ORIGIN,actorId,humanHash:p.originHash,
  beastId,beastHash:b.sapientLife.sourceHash,
  site:'crossing',minute,day,
  arrivalSeal:found.pos.sourceHash,shiftHash:found.shift.hash,
  witness:event,witnessHash:hash(event),witnessIndex,
  actualPriceScales:read.priceScales,
  originalSellerStockBefore:read.originalMerchantStock,
  originalPriceSourceHash:read.originalPriceSourceHash,
  priceSource:Scarcity.observe(w,w.localProvisioner).source,
  noInferredEatingOrAnimalConsent:true,
  noSecondMerchantOrWalletOrInventedCurrency:true};
 q.intentId=id(q);
 if(!witnessValid(p,b,q)||!Scarcity.verify(q.priceSource,q.originalPriceSourceHash,
    q.actualPriceScales,q.originalSellerStockBefore)||
  p.originalVisitorRationRequests?.some(x=>x.source.beastId===beastId&&x.source.day===day))
  throw Error('A separate first fully witnessed, unconsumed original visitor purchase opportunity is required');
 q.humanChoice=Arr.humanChoice(p,q.witnessHash);
 q.accepted=q.humanChoice.accepted;
 q.actualMinutes=q.accepted?10:5;
 q.endMinute=minute+q.actualMinutes;
 q.outcome=q.accepted?'actual-visitor-purchased-one-owned-ration':
  'actual-visitor-declined-ration-purchase';
 q.purchaseContextHash=hash({origin:ORIGIN,intentId:q.intentId,
  actorId,beastId,minute,arrivalSeal:q.arrivalSeal,
  witnessHash:q.witnessHash,choice:q.humanChoice});
 q.purchaseSourceHash=null;
 if(q.accepted){
  const local=Market.buyVerifiedVisitor(s,p,b,{
   visitorIntent:q,quoted:read});
  q.purchaseSourceHash=local.sourceHash;
 }
 const row={source:q,seal:hash(q)};
 p.originalVisitorRationRequests||=[];
 p.originalVisitorRationRequests.push(row);
 E.advance(s,q.actualMinutes);Time.finalizeTime(s,minute);
 if(!verify(s,p)||!Market.verify(Realm.peek(s)))
  throw Error('Actual visitor sale and personally selected offer failed original conserved source replay');
 return {privateToGM:true,actorId,beastId,
  purchased:q.accepted,individualBuyerChoice:q.outcome,
  actualMinuteCost:q.actualMinutes,
  realHumanScalesSpent:q.accepted?q.actualPriceScales:0,
  actualMerchantStockTransferred:q.accepted?1:0,
  itemOwnedByHuman:q.accepted?'clean_rations':null,
  realSaleSourceHash:q.purchaseSourceHash,individualDecisionSourceHash:row.seal,
  noAutomaticBeastFoodOrHealthOrTrustOrPartnership:true,
  noCurrencyOrStockCreated:true};
}
function status(s,{actorId,beastId,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId)||typeof beastId!=='string')
  throw Error('Only real existing visitor and individual beast IDs; no chosen price, funds, grade, outcome or inventory');
 return readOnly(s,actorId,beastId);
}
function privateStatus(s,p){
 if(!verify(s,p))throw Error('Private original visiting human purchasing choices are altered');
 return (p.originalVisitorRationRequests||[]).map(row=>({
  privateToGM:true,actorId:p.actorId,beastId:row.source.beastId,
  site:'crossing',day:row.source.day,purchased:row.source.accepted,
  genuineRealPriceScales:row.source.actualPriceScales,
  actuallyPaidScales:row.source.accepted?row.source.actualPriceScales:0,
  actualPersonalRationSaleHash:row.source.purchaseSourceHash,
  sourceHash:row.seal,noBeastConsumptionOrOwnershipGranted:true
 }));
}
module.exports={ORIGIN,WITNESS,id,verify,readOnly,status,buy,privateStatus};
