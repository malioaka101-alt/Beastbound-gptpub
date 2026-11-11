'use strict';
// Two actual public conflicts drawn from existing Reedmarch household charters.
// Their published positions are known; their private thoughts and undisclosed
// wealth are not. This is a scheduled hearing, not a royal favour menu.
const Crypto=require('node:crypto'),Atlas=require('./atlas'),
 Houses=require('./social-houses'),Gov=require('./government-offices');
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const SOURCE='Witnessed open public March Council hearing at Morrowfen Crossing';
const REVIEW='Independent sixday March Council hearing disposition';
const ISSUES=Object.freeze({
 general_business:Object.freeze({
  id:'general_business',label:'Open matters brought by residents',
  houseIds:[],habitats:[],
  question:'What other civic concerns does a resident want formally heard without a noble intermediary?'}),
 river_crossings:Object.freeze({
  id:'river_crossings',label:'Public river passage and ferry tolls',
  houseIds:['fenwake','reedward'],habitats:['fen'],
  question:'How should public refuge crossings remain accessible alongside the canal and ferry upkeep obligations?'}),
 reedbed_access:Object.freeze({
  id:'reedbed_access',label:'Shared wetland reedbeds and commercial leases',
  houseIds:['reedcouncil','fenwake'],habitats:['fen'],
  question:'How should shared wetland harvesting and sanctuary access coexist with commercial canal leases?'})
});
const DECISIONS=Object.freeze({
 records_review:'The March Council orders an open records review of the competing public obligations; no allegation is adjudicated and no law changes.',
 mediation_invite:'The March Council invites the affected households and interested residents to further voluntary mediation; consent has not been assumed.',
 defer:'The March Council records the testimony but postpones any further procedural step; existing public rights remain unchanged.'
});
function issue(id){
 const i=ISSUES[id];
 if(!i)throw Error('Only an actually published local civic dispute may enter this first public hearing register');
 const positions=i.houseIds.map(houseId=>{
  const h=Houses.byId[houseId];
  if(!h||h.polity!=='reedmarch')throw Error('Household testimony must match the actual published local family charter');
  return {houseId:h.id,name:h.name,publicDuty:h.duty,declaredDispute:h.dispute};
 });
 return {id:i.id,label:i.label,question:i.question,habitats:i.habitats,positions};
}
function sourceCheck(s,r){
 const e=s.log?.[r.eventIndex],i=ISSUES[r.issueId];
 if(!i||e?.type!=='story'||e.details?.origin!=='witnessed-public-civic-hearing'||
   e.details?.hearingId!==r.hearingId||
   e.details?.issueId!==r.issueId||
   e.details?.testimony!==r.testimony||
   e.details?.source!==SOURCE||
   e.details?.location!=='crossing'||
   e.details?.minutes!==35||
   e.details?.publicHouseholds?.join('|')!==i.houseIds.join('|')||
   e.details?.originalTerrainHash!==(r.evidence?.sceneHash||null)||
   e.details?.originalCheckHash!==(r.evidence?.rollHash||null)||
   digest(e)!==r.eventHash)
   return false;
 return true;
}
function review(s,w,day,random,emit){
 const records=s.table?.publicHearings?.records;
 if(!Array.isArray(records)||!records.length)return 0;
 const council=w.institutions?.marsh_council,host=w.countries?.reedmarch,
  gov=Gov.ensure(w).reedmarch;
 if(!council||council.status!=='active'||!host||!gov)return 0;
 if(typeof random!=='function')throw Error('Independent council deliberation requires the world simulation draw');
 w.publicHearingReviews||=[];
 gov.publicHearingDockets||=[];
 let reviewed=0;
 for(const r of records){
  if(r.state!=='submitted'||!Number.isInteger(r.earliestReviewDay)||
   day<r.earliestReviewDay||!sourceCheck(s,r)||
   w.publicHearingReviews.some(x=>x.hearingId===r.hearingId))continue;
  const i=ISSUES[r.issueId];
  const familyResponses=i.houseIds.map(houseId=>{
   const h=Houses.byId[houseId],standing=w.houses?.[houseId];
   if(!h||!standing)return {houseId,response:'No independently verified household reply'};
   const x=random(),tolerance=Math.max(.18,Math.min(.74,.3+standing.publicPressure/210));
   if(!Number.isFinite(x)||x<0||x>=1)throw Error('Household response must be independently drawn from a valid world source');
   return {houseId,response:x<tolerance?'requests open records review':'urges the council to delay until the obligations are reconciled'};
  });
  const draw=random();
  if(!Number.isFinite(draw)||draw<0||draw>=1)
   throw Error('Council public disposition needs independent genuine world uncertainty');
  const competent=council.capacity>=50,accountable=host.legitimacy>=45,
   corroborated=!!r.evidence;
  const activeChance=.22+(competent?.12:0)+(accountable?.08:0)+(corroborated?.16:0);
  const disposition=draw<activeChance?'records_review':
   draw<Math.min(.88,activeChance+.26)?'mediation_invite':'defer';
  r.state='reviewed';r.reviewDay=day;r.releaseDay=day+2;
  r.disposition=disposition;r.publicResponse=DECISIONS[disposition];
  r.householdResponses=familyResponses;r.reviewSource=REVIEW;
  w.publicHearingReviews.push({
   hearingId:r.hearingId,issueId:r.issueId,day,releaseDay:day+2,
   disposition,sourceEventHash:r.eventHash,source:REVIEW,
   familyResponses
  });
  if(w.publicHearingReviews.length>120)w.publicHearingReviews.shift();
  gov.publicHearingDockets.push({hearingId:r.hearingId,issueId:r.issueId,
   day,releaseDay:day+2,disposition,sourceEventHash:r.eventHash});
  if(gov.publicHearingDockets.length>60)gov.publicHearingDockets.shift();
  Gov.attestOriginalCivicProcedure(s,w,{kind:'public_hearing',witnessId:r.hearingId});
  if(typeof emit==='function')emit({
   day,region:'reedmarch',subject:'hearing:'+r.hearingId,
   text:'The March Council records a public procedural disposition on '+i.label+
    '. It has not changed the law or adjudicated any resident allegation.',
   channel:'public notice',releaseDay:day+2,severity:'routine'
  });
  reviewed++;
 }
 return reviewed;
}
module.exports={ISSUES,SOURCE,REVIEW,DECISIONS,issue,sourceCheck,review};
