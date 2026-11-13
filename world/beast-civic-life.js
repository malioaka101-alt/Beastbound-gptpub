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
// #20: A living polity's independent council may have a genuinely
// authored legislative COMPETENCE, but a charter alone never enacts law.
const LOCAL_RULE='personally-witnessed-local-civic-enactment-v1';
// The existing sovereign institution MAY have its own separately authored
// authority to hear a contested civil matter. This one optional adapter does
// not define courts, compulsory procedures or outcomes for other societies.
const CASE='source-witnessed-contested-local-civic-case-v1';
function caseCompetence(c){
 return c&&typeof c==='object'&&!Array.isArray(c)&&
  Object.keys(c).sort().join('|')==='authoritySource|procedure|scope'&&
  valid(c.authoritySource,24,900)&&valid(c.procedure,24,900)&&valid(c.scope,16,600);
}
function competence(c){
 return c&&typeof c==='object'&&!Array.isArray(c)&&
  Object.keys(c).sort().join('|')==='authoritySource|minimumNoticeDays|procedure|requiredAssents|scope'&&
  valid(c.authoritySource,24,900)&&valid(c.procedure,24,900)&&
  valid(c.scope,16,600)&&Number.isInteger(c.minimumNoticeDays)&&
  c.minimumNoticeDays>=0&&c.minimumNoticeDays<=360&&
  Number.isInteger(c.requiredAssents)&&c.requiredAssents>=1&&
  c.requiredAssents<=24;
}
// No universal offence menu, automatic punishment, seizure or assumed
// consent: these are actual ORIGINAL free-person deliberations only.
function validLocalEnactment(inst,row){
 const d=row?.source?.details,e=d?.enactment,
  authority=inst.origin.legalCompetence;
 if(e===undefined)return row?.source?.legalAuthorityHash===undefined;
 if(!competence(authority)||
  row.source.legalAuthorityHash!==inst.originHash||
  inst.origin.visibility!=='public'||d.visibility!=='public'||
  !e||typeof e!=='object'||Array.isArray(e)||
  Object.keys(e).sort().join('|')!==
   'appealProcess|conductRule|effectiveDay|id|jurisdictionRegionId|originalProcedure|permittedRemedy|ratifications|rightsAndLimits'||
  !ident(e.id)||!Atlas.R[e.jurisdictionRegionId]||
  Atlas.R[e.jurisdictionRegionId].polity!==inst.origin.polityId||
  !valid(e.conductRule,18,900)||!valid(e.rightsAndLimits,18,900)||
  !valid(e.permittedRemedy,18,900)||!valid(e.appealProcess,18,900)||
  e.originalProcedure!==authority.procedure||
  !Number.isInteger(e.effectiveDay)||
  e.effectiveDay<row.source.sessionDay+authority.minimumNoticeDays||
  e.effectiveDay>10000000||
  !Array.isArray(e.ratifications)||e.ratifications.length!==d.participants.length||
  !Array.isArray(row.source.participatingBeasts)||
  row.source.participatingBeasts.length!==d.participants.length)
  return false;
 const identities=new Set(d.participants);
 if(identities.size!==d.participants.length||
  new Set(row.source.participatingBeasts.map(x=>x.id)).size!==identities.size||
  row.source.participatingBeasts.some(x=>!identities.has(x.id)||
   typeof x.lifeSourceHash!=='string'||!/^([a-f0-9]{64})$/.test(x.lifeSourceHash))||
  new Set(e.ratifications.map(x=>x?.beastId)).size!==identities.size||
  e.ratifications.some(x=>!x||!identities.has(x.beastId)||
   typeof x.assented!=='boolean'||!valid(x.basis,18,600))||
  e.ratifications.filter(x=>x.assented).length<authority.requiredAssents)
  return false;
 return true;
}
// A case hearing records the TWO independently present people's witnessed
// statements, not a judicial finding. Its law is snapshotted FROM an actual
// earlier sealed enactment, never supplied by the requesting player/GM.
function validLocalCase(inst,row,w){
 const d=row?.source?.details,q=d?.caseReview;
 if(q===undefined)return row?.source?.caseAuthorityHash===undefined&&
  row?.source?.caseRegionId===undefined&&
  row?.source?.siteEvidence===undefined&&
  row?.source?.caseWitnessMinute===undefined&&
  row?.source?.citedLaw===undefined;
 const auth=inst.origin.caseCompetence,src=row?.source?.citedLaw;
 if(!caseCompetence(auth)||row.source.caseAuthorityHash!==inst.originHash||
  !src||src.origin!==SESSION||!validLocalEnactment(inst,{source:src})||
  !q||typeof q!=='object'||Array.isArray(q)||
  !['allegation','caseId','claimantId','claimantStatement',
    'requestedFollowUp','respondentId','respondentStatement','ruleId']
   .every(key=>Object.hasOwn(q,key))||
  Object.keys(q).some(key=>!['allegation','caseId','claimantId',
   'claimantStatement','requestedFollowUp','respondentId',
   'respondentStatement','ruleId','siteNoteSeal'].includes(key))||
  !ident(q.caseId)||!ident(q.ruleId)||q.claimantId===q.respondentId||
  !valid(q.allegation,20,900)||!valid(q.claimantStatement,18,900)||
  !valid(q.respondentStatement,18,900)||!valid(q.requestedFollowUp,18,900)||
  !d.participants.includes(q.claimantId)||!d.participants.includes(q.respondentId)||
  d.visibility!=='public'||inst.origin.visibility!=='public'||
  !Array.isArray(row.source.participatingBeasts)||
  !row.source.participatingBeasts.some(x=>x.id===q.claimantId)||
  !row.source.participatingBeasts.some(x=>x.id===q.respondentId)||
  src.details?.institutionId!==inst.id||
  src.details?.enactment?.id!==q.ruleId||
  src.details?.enactment?.effectiveDay>row.source.sessionDay||
  src.sessionDay>row.source.sessionDay||
  !Atlas.R[row.source.caseRegionId]||
  Atlas.R[row.source.caseRegionId].polity!==inst.origin.polityId||
  src.details.enactment.jurisdictionRegionId!==row.source.caseRegionId||
  (Atlas.LOCATION_REGION[d.location]!==undefined&&
   Atlas.LOCATION_REGION[d.location]!==row.source.caseRegionId))
  return false;
 // The original local landscape note is contextual evidence only.
 // It was not an accusation, testimony, culprit finding or court order.
 const noteSeal=q.siteNoteSeal,record=row.source.siteEvidence,
  moment=row.source.caseWitnessMinute;
 if(noteSeal===undefined){
  if(record!==undefined||moment!==undefined)return false;
 }else{
  if(typeof noteSeal!=='string'||!/^[a-f0-9]{64}$/.test(noteSeal)||
   !Number.isSafeInteger(moment)||moment<0||
   Math.floor(moment/1440)!==row.source.sessionDay||
   !record||Object.keys(record).sort().join('|')!=='seal|source'||
   record.seal!==noteSeal||hash(record.source)!==noteSeal||
   record.source?.source!==require('./lived-places').SOURCE||
   record.source?.placeId!==d.location||
   record.source?.witnessedAtSite!==true||
   !Number.isSafeInteger(record.source?.minute)||
   record.source.minute<0||record.source.minute>moment||
   !w?.livedPlaces?.places?.[d.location]||
   !require('./lived-places').verifyPlace(w.livedPlaces.places[d.location])||
   !w.livedPlaces.places[d.location].notes.some(n=>
    n.seal===record.seal&&hash(n.source)===hash(record.source)))
   return false;
 }
 const current=inst.sessions.find(x=>x.source?.eventHash===src.eventHash);
 return !current||hash(current.source)===hash(src);
}
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
  b.away===true||b.location!==s.world.location)
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
  (inst.origin.legalCompetence!==undefined&&
   !competence(inst.origin.legalCompetence))||
  (inst.origin.caseCompetence!==undefined&&
   !caseCompetence(inst.origin.caseCompetence))||
  inst.sessions.some(x=>!x||x.origin!==SESSION||x.seal!==hash(x.source)||
    x.source?.details?.institutionId!==id||x.source?.details?.polityId!==p||
    x.source.eventHash!==hash(x.source.event)||
    x.source.event?.details?.origin!==SESSION||
    x.source.event?.details?.location!==x.source.details.location||
    hash(x.source.event.details)!==hash(x.source.details)||
    !validLocalEnactment(inst,x)||!validLocalCase(inst,x,w))||
  new Set(inst.sessions.filter(x=>x.source?.details?.enactment).
   map(x=>x.source.details.enactment.id)).size!==
  inst.sessions.filter(x=>x.source?.details?.enactment).length||
  new Set(inst.sessions.filter(x=>x.source?.details?.caseReview).
   map(x=>x.source.details.caseReview.caseId)).size!==
  inst.sessions.filter(x=>x.source?.details?.caseReview).length)
  throw Error('Institutional origin, witnessed law or historical decisions were changed');
 return inst;
}
function authorInstitution(s,p={}){
 const keys=['polityId','institutionId','name','kind','mandate','language','medium','rules','source','visibility','legalCompetence','caseCompetence'];
 if(!p||Object.keys(p).some(k=>!keys.includes(k))||
  !ident(p.institutionId)||!valid(p.name,3,160)||!valid(p.kind,4,160)||
  !valid(p.mandate)||!valid(p.language,3,200)||
  !valid(p.medium,3,200)||!valid(p.rules)||!valid(p.source,24,1200)||
  (p.caseCompetence!==undefined&&(!caseCompetence(p.caseCompetence)||
    (p.visibility||'gm-only')!=='public'))||
  (p.legalCompetence!==undefined&&(!competence(p.legalCompetence)||
    (p.visibility||'gm-only')!=='public'))||
  !['public','gm-only'].includes(p.visibility||'gm-only'))
  throw Error('An institution needs original civic mandate, language or sensory medium, rules, physical jurisdiction and source');
 if(!Atlas.P[p.polityId]||Atlas.P[p.polityId].government!=='beast polity')
  throw Error('An actual autonomous recognised beast polity is required');
 const w=realm(s),c=polity(w,p.polityId),t=create(c,p.polityId);
 if(t.institutions[p.institutionId])throw Error('That civic institution is already established');
 const origin={origin:ROOT,id:p.institutionId,polityId:p.polityId,
  name:p.name.trim(),kind:p.kind.trim(),mandate:p.mandate.trim(),
  language:p.language.trim(),medium:p.medium.trim(),rules:p.rules.trim(),
  source:p.source.trim(),visibility:p.visibility||'gm-only',
  ...(p.legalCompetence===undefined?{}:{
   legalCompetence:structuredClone(p.legalCompetence)}),
  ...(p.caseCompetence===undefined?{}:{
   caseCompetence:structuredClone(p.caseCompetence)}),
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
 // Validate the actual extant diplomatic relationship before writing any
 // civic session receipt, so rejected sources never partly mutate a save.
 const treatyOther=d.treaty?.polities?.[1];
 const diplomaticTie=d.treaty?Object.values(w.diplomacy).find(y=>
  y.a===p.polityId&&y.b===treatyOther||
  y.a===treatyOther&&y.b===p.polityId):null;
 if(d.treaty&&!diplomaticTie)
  throw Error('The proposed treaty has no actual diplomatic relationship');
 if(diplomaticTie?.civicTreaties?.some(y=>y.source?.eventHash===evHash))
  throw Error('A bilateral scene cannot ratify duplicate treaty entries');
 // A disputed case may reference only an actual, already-effective rule
 // issued by this original institution. Its source copy survives bounded
 // proceeding-history rotation without fabricating a second law ledger.
 const cited=d.caseReview?inst.sessions.find(x=>
  x.source?.details?.enactment?.id===d.caseReview.ruleId):null;
 if(d.caseReview&&(!caseCompetence(inst.origin.caseCompetence)||
  !cited||cited.source.details.enactment.effectiveDay>
   Math.floor(s.world.minutes/1440)||
  inst.sessions.some(x=>x.source?.details?.caseReview?.caseId===
   d.caseReview.caseId)))
  throw Error('A contested case needs the original effective local rule, unique case and independently authored hearing competence');
 // An existing freeform personally recorded site note can corroborate
 // physical CONTEXT, not a named actor's alleged deed. Never use a remote
 // annotation or fabricate a fresh observation as case proof.
 let siteNote=null;
 if(d.caseReview?.siteNoteSeal!==undefined){
  const seal=d.caseReview.siteNoteSeal;
  const place=require('./lived-places').get(s,s.world.location);
  siteNote=place?.notes.find(n=>n.seal===seal);
  if(!siteNote||!place||!siteNote.source?.witnessedAtSite||
   siteNote.source.placeId!==s.world.location||
   siteNote.source.minute>s.world.minutes)
   throw Error('A disputed case needs an actual earlier personally witnessed local site note, not remote lore or a claimed offence');
 }
 const source={origin:SESSION,eventHash:evHash,event:structuredClone(ev),
  details:structuredClone(d),sessionDay:Math.floor(s.world.minutes/1440),
  participatingBeasts:actual.map(b=>({id:b.id,lifeSourceHash:b.sapientLife.sourceHash})),
  ...(d.enactment===undefined?{}:{legalAuthorityHash:inst.originHash}),
  ...(d.caseReview===undefined?{}:{caseAuthorityHash:inst.originHash,
   caseRegionId:localRegion(s),
   ...(siteNote?{caseWitnessMinute:s.world.minutes,
    siteEvidence:structuredClone(siteNote)}:{}),
   citedLaw:structuredClone(cited.source)})};
 const receipt={origin:SESSION,source,seal:hash(source)};
 if(!validLocalEnactment(inst,receipt)||!validLocalCase(inst,receipt,w)||
  d.enactment!==undefined&&
   inst.sessions.some(x=>x.source.details.enactment?.id===d.enactment.id))
  throw Error('An actual public local law requires a pre-existing competent charter, its own actual assent threshold, separate witnessed individual positions, real jurisdiction and the charter notice period');
 inst.sessions.push(receipt);
 if(inst.sessions.length>80)inst.sessions.splice(0,20);
 append(inst,Math.floor(s.world.minutes/1440),'personally-witnessed-civic-session',
  {eventHash:evHash,topic:d.topic,result:d.result,private:d.visibility!=='public'});
 // Treaty text belongs inside actual diplomatic relationships; it makes no
 // automatic war/peace, trade, rights or party loyalty change.
 if(d.treaty){
  const target=diplomaticTie;
  target.civicTreaties||=[];
  target.civicTreaties.push({source:{origin:ROOT,polities:[...d.treaty.polities],
   terms:d.treaty.terms,eventHash:evHash,day:source.sessionDay},seal:hash({
   origin:ROOT,polities:[...d.treaty.polities],terms:d.treaty.terms,
   eventHash:evHash,day:source.sessionDay})});
 }
 return {recorded:true,institutionId:p.institutionId,
  ...(d.enactment?{witnessedLocalRuleId:d.enactment.id,
    effectiveDay:d.enactment.effectiveDay}:{}),
  ...(d.caseReview?{witnessedCaseId:d.caseReview.caseId,
    contestedStatementsOnly:true,noJudicialFindingOrEnforcement:true}:{}),
  legalOutcomeOnlyAsWitnessed:true,noUnchosenMemberOrPowers:true,
  noAutomaticOffenceOrEnforcement:true};
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
 const already=new Set(Object.values(t.households).flatMap(h=>
  h.source.members.map(m=>m.id)));
 if(members.some(b=>already.has(b.id)))
  throw Error('A living sapient individual cannot belong to two active households without an independently recorded departure');
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
   medium:x.origin.medium,
   // These are genuine PUBLICLY ratified local instruments already
   // past their originally authored notice period. A proposed or hidden
   // procedure never becomes law by reading this public view.
   publicLocalRules:x.sessions.filter(e=>e.source.details.enactment&&
    e.source.details.visibility==='public'&&
    e.source.details.enactment.effectiveDay<=Math.floor(s.world.minutes/1440)).
    map(e=>({instrumentId:e.source.details.enactment.id,
     jurisdictionRegionId:e.source.details.enactment.jurisdictionRegionId,
     conductRule:e.source.details.enactment.conductRule,
     rightsAndLimits:e.source.details.enactment.rightsAndLimits,
     permittedRemedy:e.source.details.enactment.permittedRemedy,
     appealProcess:e.source.details.enactment.appealProcess,
     effectiveDay:e.source.details.enactment.effectiveDay,
     sourceEventHash:e.source.eventHash,
     noAutomaticConvictionOrPropertyTransfer:true})).slice(-30),
   publicContestedCases:x.sessions.filter(e=>e.source.details.caseReview&&
    e.source.details.visibility==='public').map(e=>({
     caseId:e.source.details.caseReview.caseId,
     ruleId:e.source.details.caseReview.ruleId,
     allegation:e.source.details.caseReview.allegation,
     claimantStatement:e.source.details.caseReview.claimantStatement,
     respondentStatement:e.source.details.caseReview.respondentStatement,
     proposedNextStep:e.source.details.caseReview.requestedFollowUp,
     originalWitnessHash:e.source.eventHash,
     ...(e.source.siteEvidence?{witnessedLocalContext:{
      recordedDetail:e.source.siteEvidence.source.context,
      recordedSubject:e.source.siteEvidence.source.name,
      originalSiteSeal:e.source.siteEvidence.seal,
      placeId:e.source.siteEvidence.source.placeId,
      noteIsNotProofOfOffence:true
     }}:{}),
     allegationUnproven:true,noFindingOrRemedyExecuted:true
    })).slice(-20),
   publicOffices:x.sessions.filter(e=>e.source.details.visibility==='public'&&
     e.source.details.office).map(e=>({
      title:e.source.details.office.title,
      acceptedById:e.source.details.office.holderId,
      witnessedAcceptance:true})).slice(-8),
   publicProceedings:x.sessions.filter(e=>e.source.details.visibility==='public').map(e=>({
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
module.exports={ROOT,SESSION,HOME,LOCAL_RULE,CASE,authorInstitution,proceeding,household,monthly,status,
 _debug:{create,polity,journal,verifyInstitution,sourcePerson}};
