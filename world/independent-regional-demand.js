'use strict';
// #19 — a locally present original independent PERSON may choose to post
// one observable expression of regional goods interest. A posted request
// is NOT a sale, solvent buyer, firm order, legal obligation, universal
// cultural preference, newly spawned person or invented regional demand.
//
// Works with the original source-grounded emergent-people lives and actual
// sixday world tick. Uses a separate deterministic person-bound *choice
// witness*: no additional player, world or individual-career RNG draws.
const Crypto=require('node:crypto'),Atlas=require('./atlas'),
 People=require('./emergent-people');
const ORIGIN='independent-real-person-local-demand-expression-v1';
const LEDGER='original-source-witnessed-regional-market-interest-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function fraction(personHash,day,regionId){
 return parseInt(hash('regional-interest-choice|'+ORIGIN+'|'+
  personHash+'|'+day+'|'+regionId).slice(0,8),16)/4294967296;
}
function suggestedGood(personHash,day,reg){
 // The person's own original identity and actual date select among what
 // the established region genuinely produces; no universal recipe list.
 const i=parseInt(hash('regional-interest-good|'+personHash+'|'+
  day+'|'+reg.id).slice(0,8),16);
 return reg.goods[i%reg.goods.length];
}
function chance(q){
 return Math.min(.83,Math.max(.14,.32+
  (q.personOriginalNeed==='local-provisioning'?.18:0)+
  (q.personOriginalNeed==='community-relief'?.09:0)+
  (q.ecologyAtDecision.forage<43?.12:0)+
  (q.ecologyAtDecision.quality<39?.08:0)+
  (q.ecologyAtDecision.pressure>68?.06:0)-
  (q.fatigueAtDecision>70?.16:0)));
}
function text(q){
 return q.personName+' has publicly asked about locally available '+
  q.good.replace(/_/g,' ')+' at '+Atlas.R[q.regionId].name+
  ' while pursuing their established work: '+q.personPurpose+
  '. This is an expression of interest, not a confirmed order or payment.';
}
function verifyShift(q){
 const sh=q.originalIndependentPresence;
 if(!sh||typeof sh!=='object'||Array.isArray(sh))return false;
 const {hash:h,...body}=sh;
 return h===hash(body)&&sh.source===People.SHIFT&&
  sh.npcId===q.actorId&&sh.actorId===q.actorId&&
  sh.personId===q.personId&&sh.name===q.personName&&
  sh.profession===q.personProfession&&
  sh.originHash===q.personOriginHash&&sh.polity===q.polity&&
  sh.location===q.site&&
  sh.scheduledAtDay===sh.fromDay&&sh.fromDay<=q.day&&
  sh.throughDay>=q.day&&sh.throughDay-sh.fromDay===5&&
  People.siteFor(q.regionId)===q.site;
}
function verifyOne(w,row){
 const q=row?.source,p=w.emergentPeople?.people?.[q?.personId],
  reg=Atlas.R[q?.regionId],eco=q?.ecologyAtDecision;
 if(!q||!p||!reg||!eco||!People.verify(w,p)||
  row.origin!==ORIGIN||row.sourceHash!==hash(q)||
  row.id!==q.id||row.day!==q.day||
  row.accepted!==q.accepted||
  q.origin!==ORIGIN||
  q.id!=='local_interest_'+q.personId+'_'+q.day||
  q.personId!==p.id||q.actorId!==p.actorId||
  q.personOriginHash!==p.originHash||
  q.personName!==p.name||q.personPurpose!==p.purpose||
  q.personProfession!==p.birthSource.initialProfession||
  q.personOriginalNeed!==p.birthSource.need||
  q.regionId!==reg.id||q.polity!==reg.polity||
  q.language!==p.language||
  q.cultureId!==Atlas.P[reg.polity]?.culture||
  !Array.isArray(q.originalLocalGoods)||
  JSON.stringify(q.originalLocalGoods)!==JSON.stringify(reg.goods)||
  !Number.isInteger(q.day)||q.day<6||q.day%6!==0||
  q.day<p.birthSource.day||
  q.site!==People.siteFor(reg.id)||
  !verifyShift(q)||
  q.good!==suggestedGood(p.originHash,q.day,reg)||
  !Number.isInteger(q.fatigueAtDecision)||
  q.fatigueAtDecision<0||q.fatigueAtDecision>100||
  !['quality','pressure','forage','water'].every(k=>
   Number.isInteger(eco[k])&&eco[k]>=0&&eco[k]<=100)||
  q.willingness!==chance(q)||
  q.independentDraw!==fraction(p.originHash,q.day,reg.id)||
  q.accepted!==(q.independentDraw<q.willingness)||
  q.releaseDay!==q.day+1||q.expiryDay!==q.day+12||
  q.publicExpression!==(q.accepted?text(q):null)||
  q.notAConfirmedPurchase!==true||
  q.noMoneyOrItemsCreatedOrMoved!==true||
  q.noBindingOrderOrWorkerCompulsion!==true||
  q.noFinancialSolvencyInferred!==true||
  q.noExtraOriginalRandomDraws!==true)return false;
 return true;
}
function verify(w){
 const ledger=w?.independentMarketDemand;
 if(ledger===undefined)return true; // Existing world checkpoints remain valid.
 if(!ledger||ledger.origin!==LEDGER||ledger.version!==1||
  !Number.isInteger(ledger.lastSixday)||ledger.lastSixday<6||
  ledger.lastSixday%6!==0||
  !Array.isArray(ledger.records)||ledger.records.length>280)
  return false;
 const seen=new Set();let previous=-1;
 for(const row of ledger.records){
  if(!verifyOne(w,row)||seen.has(row.id)||
   row.day<previous||row.day>ledger.lastSixday)return false;
  seen.add(row.id);previous=row.day;
 }
 return true;
}
function snapshot(w,p,day){
 if(!People.verify(w,p)||p.status!=='active'||
  p.lastTickDay!==day||
  !Number.isInteger(day)||day<6||day%6!==0)
  return null;
 const reg=Atlas.R[p.regionId],eco=w.ecosystems?.[reg?.id],
  site=People.siteFor(p.regionId);
 if(!reg||!Array.isArray(reg.goods)||!reg.goods.length||
  !site||!eco||!['quality','pressure','forage','water']
   .every(k=>Number.isInteger(eco[k])&&eco[k]>=0&&eco[k]<=100))
  return null;
 const sh=People.presence(w,p.actorId,site,day);
 if(!sh)return null;
 const q0={origin:ORIGIN,
  id:'local_interest_'+p.id+'_'+day,
  personId:p.id,actorId:p.actorId,personOriginHash:p.originHash,
  personName:p.name,personPurpose:p.purpose,
  personProfession:p.birthSource.initialProfession,
  personOriginalNeed:p.birthSource.need,
  regionId:reg.id,polity:reg.polity,
  cultureId:Atlas.P[reg.polity].culture,language:p.language,
  originalLocalGoods:reg.goods.slice(),
  originalIndependentPresence:structuredClone(sh),
  site,day,good:suggestedGood(p.originHash,day,reg),
  ecologyAtDecision:{quality:eco.quality,pressure:eco.pressure,
   forage:eco.forage,water:eco.water},
  fatigueAtDecision:p.fatigue,
  releaseDay:day+1,expiryDay:day+12,
  notAConfirmedPurchase:true,noMoneyOrItemsCreatedOrMoved:true,
  noBindingOrderOrWorkerCompulsion:true,
  noFinancialSolvencyInferred:true,noExtraOriginalRandomDraws:true};
 const willingness=chance(q0),
  independentDraw=fraction(p.originHash,day,reg.id),
  accepted=independentDraw<willingness,
  source={...q0,willingness,independentDraw,accepted,
   publicExpression:accepted?text(q0):null},
  row={id:source.id,day,origin:ORIGIN,accepted,
   source,sourceHash:hash(source)};
 if(!verifyOne(w,row))
  throw Error('An independent interest decision requires a real person and genuine original local presence');
 return row;
}
function sixday(w,day){
 if(!Number.isInteger(day)||day<6||day%6!==0||
  !Number.isInteger(w?.lastTickDay)||day>w.lastTickDay+6||
  !Number.isInteger(w?.ticks?.sixdays)||w.ticks.sixdays<1||
  !verify(w))throw Error('Regional demand can only evolve at a verified original sixday');
 const prior=w.independentMarketDemand;
 if(prior&&day<=prior.lastSixday)
  return {newDecisions:0,publicExpressions:0,noMarketSaleInferred:true};
 const people=Object.values(w.emergentPeople?.people||{})
  .sort((a,b)=>a.id.localeCompare(b.id));
 const additions=[];
 for(const p of people){
  const row=snapshot(w,p,day);
  if(row)additions.push(row);
 }
 if(!w.independentMarketDemand)
  w.independentMarketDemand={origin:LEDGER,version:1,
   lastSixday:day,records:[]};
 const ledger=w.independentMarketDemand;
 ledger.records.push(...additions);
 if(ledger.records.length>280)
  ledger.records.splice(0,ledger.records.length-280);
 ledger.lastSixday=day;
 if(!verify(w))
  throw Error('A locally expressed real person demand was not source-replayable');
 return {newDecisions:additions.length,
  publicExpressions:additions.filter(x=>x.accepted).length,
  noMarketSaleInferred:true,noNewGoodsOrMoney:true};
}
function publicLocal(s,w){
 if(!verify(w))throw Error('The original independent local demand ledger is invalid');
 const regionId=Atlas.LOCATION_REGION[s.world?.location];
 if(!Atlas.R[regionId])return [];
 const now=Math.floor(s.world.minutes/1440);
 return (w.independentMarketDemand?.records||[])
  .filter(row=>row.accepted&&row.source.regionId===regionId&&
   row.source.releaseDay<=now&&row.source.expiryDay>=now)
  .slice(-12).map(row=>({
   person:row.source.personName,profession:row.source.personProfession,
   localGood:row.source.good,
   statement:row.source.publicExpression,
   day:row.day,sourceHash:row.sourceHash,
   confirmedOrder:false,confirmedBuyerFunds:false,
   noSaleOrTransfer:true}));
}
module.exports={ORIGIN,LEDGER,sixday,verify,publicLocal};
