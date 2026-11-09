'use strict';
// #07: Living intelligent-beast civic charters live on the EXISTING sovereign
// country and diplomacy records. Authoring a charter invents no residents,
// ruler, treaty assent, officeholder, language comprehension or legal power.
const Crypto=require('node:crypto'),Atlas=require('./atlas'),
 Sapient=require('./sapient-beast-persons');
const ROOT='authored-beast-civic-life-v1',SESSION='personally-witnessed-beast-civic-proceeding-v1',
 HOME='personally-witnessed-sapient-beast-household-v1',REVIEW='independent-beast-civic-review-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const valid=(v,a=12,b=1000)=>typeof v==='string'&&v.trim().length>=a&&v.trim().length<=b;
const ident=v=>typeof v==='string'&&/^[a-z][a-z0-9_-]{2,78}$/.test(v);
const nonneg=v=>Number.isInteger(v)&&v>=0&&v<=10000000;
const localRegion=s=>Atlas.LOCATION_REGION[s.world?.location]||
 require('./lived-places').get(s,s.world?.location)?.regionId||null;
function realm(s){return require('./simulation').ensure(s);}
function polity(w,polityId){
 const p=Atlas.P[polityId],c=w.countries?.[polityId];
 if(!p||p.government!=='beast polity'||!c)
  throw Error('An actual autonomous recognised beast polity is required');
 return c;
}
function create(c,polityId){
 c.beastCivic||={version:1,origin:ROOT,polityId,institutions:{},households:{}};
 const t=c.beastCivic;
 if(t.version!==1||t.origin!==ROOT||t.polityId!==polityId||
  !t.institutions||typeof t.institutions!=='object'||Array.isArray(t.institutions)||
  !t.households||typeof t.households!=='object'||Array.isArray(t.households))
  throw Error('Beast polity civic and household source was changed');
 return t;
}
function journal(entry){
 if(!Array.isArray(entry.history)||entry.history.length>100||
    typeof entry.originHash!=='string'||entry.originHash!==hash(entry.origin))
  return false;
 let previous=entry.anchorHash||entry.originHash;
 for(const row of entry.history){
  if(!row||row.previous!==previous||row.seal!==hash(row.source)||
   row.source?.origin!==ROOT||!nonneg(row.source.day))return false;
  previous=row.seal;
 }
 return entry.headHash===previous;
}
function append(entry,day,kind,detail){
 const source={origin:ROOT,day,kind,detail,previous:entry.headHash};
 const row={source,previous:entry.headHash,seal:hash(source)};
 entry.history.push(row);entry.headHash=row.seal;
 if(entry.history.length>80){
  const retired=entry.history.splice(0,32);
  entry.anchorHash=retired.at(-1).seal;
 }
 if(!journal(entry))throw Error('Civic proceeding history cannot be reconciled');
 return row;
}
function sourcePerson(s,id){
 const b=s.beasts?.[id];
 if(!b||!b.sapientLife||!Sapient.verify(b)||b.owner||
  s.player.partnerIds?.includes(id)||b.relationship!=='wild'||
  b.location!==s.world.location)
  throw Error('An independently documented sapient beast person is required, never an owned animal or invented official');
 return b;
}
function verifyInstitution(w,p,id){
 const c=polity(w,p),inst=create(c,p).institutions[id];
 if(!inst||inst.id!==id||inst.origin?.origin!==ROOT||
  inst.origin.polityId!==p||inst.origin.id!==id||
  !valid(inst.origin.name,3,160)||!valid(inst.origin.mandate)||
  !valid(inst.origin.language,3,200)||!valid(inst.origin.medium,3,200)||
  !valid(inst.origin.rules)||!valid(inst.origin.source,24,1200)||
  !['public','gm-only'].includes(inst.origin.visibility)||!journal(inst)||
  !nonneg(inst.lastReviewMonth)||!Array.isArray(inst.sessions)||inst.sessions.length>100||
  inst.sessions.some(x=>!x||x.origin!==SESSION||x.seal!==hash(x.source)||
    x.source?.details?.institutionId!==id||x.source?.details?.polityId!==p))
  throw Error('Institutional origin, witnessed law or historical decisions were changed');
 return inst;
}
function authorInstitution(s,p={}){
 const keys=['polityId','institutionId','name','kind','mandate','language','medium','rules','source','visibility'];
 if(!p||Object.keys(p).some(k=>!keys.includes(k))||
  !ident(p.institutionId)||!valid(p.name,3,160)||!valid(p.kind,4,160)||
  !valid(p.mandate)||!valid(p.language,3,200)||
  !valid(p.medium,3,200)||!valid(p.rules)||!valid(p.source,24,1200)||
  !['public','gm-only'].includes(p.visibility||'gm-only'))
  throw Error('An institution needs original civic mandate, language or sensory medium, rules, physical jurisdiction and source');
 const w=realm(s),c=polity(w,p.polityId),t=create(c,p.polityId);
 if(t.institutions[p.institutionId])throw Error('That civic institution is already established');
 const origin={origin:ROOT,id:p.institutionId,polityId:p.polityId,
  name:p.name.trim(),kind:p.kind.trim(),mandate:p.mandate.trim(),
  language:p.language.trim(),medium:p.medium.trim(),rules:p.rules.trim(),
  source:p.source.trim(),visibility:p.visibility||'gm-only',
  foundedDay:Math.floor(s.world.minutes/1440)};
 const digest=hash(origin);
 t.institutions[p.institutionId]={id:p.institutionId,origin,
  originHash:digest,anchorHash:null,headHash:digest,
  history:[],sessions:[],lastReviewMonth:w.ticks.months,
  currentlyNeedsReview:false};
 verifyInstitution(w,p.polityId,p.institutionId);
 return {established:true,polityId:p.polityId,institutionId:p.institutionId,
  notAResidentOrNewOrganizationMember:true,noAutomaticLawOrPowers:true};
}
function witness(s,eventIndex,polityId,kind){
 if(!nonneg(eventIndex)||eventIndex>=s.log.length)
  throw Error('A previously witnessed individual civic scene index is required');
 const ev=s.log[eventIndex],d=ev?.details;
 if(ev.type!=='story'||d?.origin!==kind||d.polityId!==polityId||
  ev.day>Math.floor(s.world.minutes/1440)+1||
  !Atlas.R[localRegion(s)]||
  Atlas.R[localRegion(s)].polity!==polityId||
  d.location!==s.world.location||
  !valid(ev.text,12,1000))
  throw Error('Civic decisions require a personally witnessed original source in the actual polity');
 return {ev,d};
}
function proceeding(s,p={}){
 if(!p||Object.keys(p).some(k=>!['polityId','institutionId','eventIndex'].includes(k)))
  throw Error('Civic proceeding accepts only a pre-existing independently witnessed session');
 const w=realm(s),inst=verifyInstitution(w,p.polityId,p.institutionId);
 const {ev,d}=witness(s,p.eventIndex,p.polityId,SESSION);
 if(d.institutionId!==p.institutionId||!valid(d.topic,6,250)||
  !valid(d.result,12,900)||!valid(d.basis,18,900)||
  !Array.isArray(d.participants)||d.participants.length<1||d.participants.length>24||
  !['public','gm-only'].includes(d.visibility)||
  new Set(d.participants).size!==d.participants.length)
  throw Error('A civic session must document a real subject, participant choices and bounded result');
 const actual=d.participants.map(id=>sourcePerson(s,id));
 if(!actual.every(b=>b.sapientLife.source.encounteredAtMinute<=s.world.minutes))
  throw Error('Civic participants lack an actual personal timeline');
 const evHash=hash(ev);
 if(inst.sessions.some(x=>x.source?.eventHash===evHash))
  throw Error('One original hearing, election or treaty scene cannot be recorded twice');
 if(d.office!==undefined){
  if(!d.office||!valid(d.office.title,3,140)||
    !d.participants.includes(d.office.holderId)||d.office.holderAgreed!==true||
    !valid(d.office.acceptanceBasis,18,500))
   throw Error('A public office cannot be assigned without the named sapient individual accepting it in this specific scene');
 }
 if(d.treaty!==undefined){
  const t=d.treaty;
  if(!t||!Array.isArray(t.polities)||t.polities.length!==2||
    t.polities[0]!==p.polityId||!Atlas.P[t.polities[1]]||
    !Array.isArray(t.acceptedBy)||t.acceptedBy.length!==2||
    !t.polities.every(x=>t.acceptedBy.includes(x))||
    !valid(t.terms,24,1000))
   throw Error('A beast polity cannot claim a treaty without the other real polity authorising the same original terms');
 }
 const source={origin:SESSION,eventHash:evHash,event:structuredClone(ev),
  details:structuredClone(d),sessionDay:Math.floor(s.world.minutes/1440),
  participatingBeasts:actual.map(b=>({id:b.id,lifeSourceHash:b.sapientLife.sourceHash}))};
 const receipt={origin:SESSION,source,seal:hash(source)};
 inst.sessions.push(receipt);
 if(inst.sessions.length>80)inst.sessions.splice(0,20);
 append(inst,Math.floor(s.world.minutes/1440),'personally-witnessed-civic-session',
  {eventHash:evHash,topic:d.topic,result:d.result,private:d.visibility!=='public'});
 // Treaty text belongs inside actual diplomatic relationships; it makes no
 // automatic war/peace, trade, rights or party loyalty change.
 if(d.treaty){
  const x=d.treaty.polities[1];
  const target=Object.values(w.diplomacy).find(y=>
   y.a===p.polityId&&y.b===x||y.a===x&&y.b===p.polityId);
  if(!target)throw Error('The proposed treaty has no actual diplomatic relationship');
  target.civicTreaties||=[];
  if(target.civicTreaties.some(y=>y.source?.eventHash===evHash))
   throw Error('A bilateral scene cannot ratify duplicate treaty entries');
  target.civicTreaties.push({source:{origin:ROOT,polities:[...d.treaty.polities],
   terms:d.treaty.terms,eventHash:evHash,day:source.sessionDay},seal:hash({
   origin:ROOT,polities:[...d.treaty.polities],terms:d.treaty.terms,
   eventHash:evHash,day:source.sessionDay})});
 }
 return {recorded:true,institutionId:p.institutionId,
  legalOutcomeOnlyAsWitnessed:true,noUnchosenMemberOrPowers:true};
}
function household(s,p={}){
 if(!p||Object.keys(p).some(k=>!['polityId','householdId','eventIndex'].includes(k))||
  !ident(p.householdId))
  throw Error('A source-witnessed original household identity is required');
 const w=realm(s),c=polity(w,p.polityId),t=create(c,p.polityId);
 if(t.households[p.householdId])throw Error('The proposed household already has a specific history');
 const {ev,d}=witness(s,p.eventIndex,p.polityId,HOME);
 if(d.householdId!==p.householdId||!valid(d.name,3,160)||
  !Array.isArray(d.individualChoices)||d.individualChoices.length<2||
  d.individualChoices.length>16||
  d.individualChoices.some(x=>!x||x.accepted!==true||
    !valid(x.basis,18,600)||typeof x.beastId!=='string')||
  new Set(d.individualChoices.map(x=>x.beastId)).size!==d.individualChoices.length||
  !['public','gm-only'].includes(d.visibility))
  throw Error('A household is only real after independently witnessed consent from each actual sapient resident');
 const members=d.individualChoices.map(x=>sourcePerson(s,x.beastId));
 const source={origin:HOME,polityId:p.polityId,householdId:p.householdId,
  name:d.name,visibility:d.visibility,eventHash:hash(ev),
  witness:structuredClone(ev),members:members.map(b=>({id:b.id,
   personSourceHash:b.sapientLife.sourceHash})),foundedDay:Math.floor(s.world.minutes/1440)};
 t.households[p.householdId]={origin:HOME,source,seal:hash(source),
  status:'voluntarily-established',notAnAssignedBloodline:true};
 return {recorded:true,householdId:p.householdId,personCount:members.length,
  noBondOrBiologicalLineageCreated:true};
}
function monthly(w,day){
 if(!nonneg(day))throw Error('Actual world tick day required');
 let reviewed=0;
 for(const [id,p] of Object.entries(Atlas.P)){
  if(p.government!=='beast polity'||!w.countries?.[id]?.beastCivic)continue;
  const c=w.countries[id],t=create(c,id),regions=Atlas.regions.filter(x=>x.polity===id);
  const stressed=regions.some(x=>{
   const e=w.ecosystems[x.id];return e&&(e.quality<32||e.pressure>74||e.water<25);
  });
  for(const inst of Object.values(t.institutions)){
   verifyInstitution(w,id,inst.id);
   if(day<=inst.lastReviewMonth)continue;
   const needsReview=stressed||c.stability<34||c.legitimacy<30;
   if(needsReview!==inst.currentlyNeedsReview){
    append(inst,day,'material-civic-review-pressure',
     {needsReview,ecologyStress:stressed,stability:c.stability,legitimacy:c.legitimacy,
      noVoteOrPersonalDecisionGenerated:true});
   }
   inst.currentlyNeedsReview=needsReview;
   inst.lastReviewMonth=day;reviewed++;
  }
 }
 return {reviewed}; // GM-side bookkeeping only, not a remote public report.
}
function status(s,p={}){
 if(!p||Object.keys(p).some(x=>x!=='institutionId'))
  throw Error('Beast civic status is an unmodified local knowledge view');
 const w=s.table?.realm;if(!w)return {known:[],households:[],note:'No witnessed civic facts'};
 const region=localRegion(s),polityId=Atlas.R[region]?.polity;
 if(!polityId||Atlas.P[polityId].government!=='beast polity')
  return {known:[],households:[],note:'Only the local known polity can be viewed'};
 const t=w.countries?.[polityId]?.beastCivic;
 if(!t)return {known:[],households:[],note:'No additional civic institutions witnessed'};
 const known=Object.values(t.institutions).map(x=>verifyInstitution(w,polityId,x.id)).filter(x=>
  x.origin.visibility==='public'&&(!p.institutionId||p.institutionId===x.id))
  .map(x=>({id:x.id,name:x.origin.name,kind:x.origin.kind,
   mandate:x.origin.mandate,communication:x.origin.language,
   medium:x.origin.medium,publicProceedings:x.sessions.filter(e=>e.source.details.visibility==='public').map(e=>({
    topic:e.source.details.topic,result:e.source.details.result})).slice(-8)}));
 const households=Object.values(t.households).filter(x=>{
  if(x?.origin!==HOME||x.seal!==hash(x.source)||
     x.source?.origin!==HOME||x.source?.polityId!==polityId||
     hash(x.source.witness)!==x.source.eventHash||
     x.source.witness.details?.householdId!==x.source.householdId)
   throw Error('Original beast household choice has been altered');
  return x.source.visibility==='public';
 })
  .map(x=>({name:x.source.name,residents:x.source.members.length}));
 return {polity:Atlas.P[polityId].name,known,households,
  note:'Local public charter and witnessed proceedings only; no private officeholders, undiscovered languages, hidden court decisions or automatic comprehension'};
}
module.exports={ROOT,SESSION,HOME,authorInstitution,proceeding,household,monthly,status,
 _debug:{create,polity,journal,verifyInstitution,sourcePerson}};
