'use strict';
// Real public offices for the existing twenty-four Beastbound polities.
// New regional authoring grounded in atlas governments, NOT names copied from
// the Master Prompt. A surname, hereditary court or wealthy clan is never
// an automatic entitlement to the sovereignty of its home country.
const Crypto=require('node:crypto'),A=require('./atlas'),Houses=require('./social-houses');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const MANDATE_SOURCE='original-public-office-independent-mandate-v1';
const RECORDS_REMEDY='original-council-public-records-procedural-remedy-v1';
const RAW=[
 // polity, public office, incumbent, independent non-family challenger
 ['reedmarch','March Council Speaker','Iria Highwater','Nessa Towbank'],
 ['asterwyn','Sovereign of the Asterwyn Crown','Queen Orelia Asterwyn','Corven Briar'],
 ['crownspine','Holds Convenor','Harric Stonepath','Rina Crestmere'],
 ['saltleague','First Harbour Factor','Evan Mereglass','Iri Dockward'],
 ['sahri_wells','First Cup Council Convenor','Dara Wellwind','Sami Aquifer'],
 ['red_sultanate','Sultan of the Red Dunes','Sultan Nasir Marqesh','Hala Coppersand'],
 ['stair_guilds','Stair Charter Moderator','Yaren Switchback','Leva Dustmere'],
 ['pearl_bight','Garden Republic Premier','Nerin Palmwake','Tera Petalgate'],
 ['whitewake','Speaker of the Jarls','Ragna Icewake','Veyn Fjordholm'],
 ['icehollow','High Observatory Abbess','Arieth Starlorn','Torva Winterlens'],
 ['winter_court','First Commons Convenor','Ellan Boughrest','Nael Sapline'],
 ['frostmarch','Protector of Coldgate','Meren Northwatch','Sova Rimehall'],
 ['cinder_free','First Forge Chair','Daran Hearthstone','Hela Anvilside'],
 ['terrace_union','Cliff Assembly Convenor','Kaela Skyglass','Risen Aerie'],
 ['ashglass_march','Warden-Regent of the March','Varia Boundary','Issen Sealrock'],
 ['sunforge','Prince of Sunforge','Prince Merian Goldflame','Toren Brighthall'],
 ['tide_assembly','Tide Parliament Convenor','Evara Wavecord','Neli Harbourlight'],
 ['reef_cantons','Speaker of the Reef Cantons','Speaker Ossa Reefchime','Speaker Narel Shoal'],
 ['storm_peaks','Storm Harbour Moot Speaker','Taren Rainsail','Mera Galehaven'],
 ['blackcurrent','First Exchange Factor','Lorin Blackwake','Vera Netglass'],
 ['grassroad','Grassland Moot Convenor','Eris Longtrack','Tova Greenstep'],
 ['skyvillage','Highland League Speaker','Lena Openwind','Sera Windharbour'],
 ['iron_citadel','Citadel Director','Marshal Daran Redwall','Nera Irongate'],
 ['old_tracks','First Kin Mediator','Speaker Ven of Many Tracks','Speaker Kesh of Burrow']
];
// A polity's leading academy or merchant network is often NOT the
// constitutional government. Reuse actual civil bodies when the atlas
// authors one; otherwise declare a *new* small public governing body,
// without silently enthroning the atlas' lead guild or school.
const CIVIC_BODIES=Object.freeze({
 reedmarch:['March Council','marsh_council'],
 asterwyn:['Hearth-Court','hearth_court'],
 crownspine:['Crownspine Holds Moot',null],
 saltleague:['Mirror Gulf Merchant Assembly',null],
 sahri_wells:['Sahri Well Council',null],
 red_sultanate:["Red Dune Sultan's Court",null],
 stair_guilds:['Copper Stair Charter Chamber',null],
 pearl_bight:['Pearl Bight Garden Assembly',null],
 whitewake:["Whitewake Jarls' Moot",null],
 icehollow:['Icehollow Monastic Council',null],
 winter_court:['Quiet Bough Council','bough_council'],
 frostmarch:['Frostmarch Protectorate Council',null],
 cinder_free:['Free Forges Civic Chamber',null],
 terrace_union:['Sky Terrace Delegates Assembly',null],
 ashglass_march:['Ashglass Boundary Regency',null],
 sunforge:['Princely Court of Sunforge',null],
 tide_assembly:['Tide Assembly House','tide_assembly_house'],
 reef_cantons:['Reef Consistory','reef_consistory'],
 storm_peaks:['Stormpeak Freehold Moot',null],
 blackcurrent:['Blackcurrent Harbour Charter Assembly',null],
 grassroad:['Herd Council','herd_council'],
 skyvillage:['Skyvillage League Council',null],
 iron_citadel:['Iron Citadel Directorate',null],
 old_tracks:['Council of Many Tracks','beast_parliament']
});
const royal=new Set(['monarchy','sultanate','principality']);
const appointed=new Set(['protectorate','military regency','military oligarchy']);
const communal=new Set(['beast polity','commons','water council','monastic council','confederation','island assembly','council']);
const style=g=>royal.has(g)?'hereditary sovereignty':appointed.has(g)?'appointed mandate':
 communal.has(g)?'consensual assembly mandate':'elected or chartered mandate';
const terms=g=>royal.has(g)?null:
 ['republic','merchant republic','communal republic'].includes(g)?48:
 ['council','island assembly','beast polity','confederation'].includes(g)?60:84;
const CHARTERS=Object.freeze(RAW.map(([id,title,first,independent])=>{
 const p=A.P[id],house=Houses.houses.find(h=>h.polity===id),
  body=CIVIC_BODIES[id];
 if(!p||!house||!title||!first||!independent||!body)
  throw Error('The public office register must belong to an existing fully defined polity');
 if(body[1]&&(A.I?.[body[1]]?.name!==body[0]||A.I?.[body[1]]?.polity!==id))
  throw Error('A prior canon civil governing body must agree with the existing atlas');
 const candidates=[first,independent,house.relative];
 if(new Set(candidates).size!==3)
  throw Error('A civic office needs distinct established initial names; nobility alone is insufficient');
 return Object.freeze({id,title,first,independent,houseId:house.id,
  relativeCandidate:house.relative,governingBody:body[0],
  governingBodySource:body[1]?
   'Existing named civic institution in world/atlas.js':
   'New public civic institution authorised for this previously outlined polity',
  government:p.government,style:style(p.government),
  termMonths:terms(p.government),
  basis:'Authored public office associated with the existing '+p.name+
   ' polity and '+p.government+' charter; not a verified supernatural family constitution'
 });
}));
const C=Object.freeze(Object.fromEntries(CHARTERS.map(c=>[c.id,c])));
const royalID=id=>C[id]?.style==='hereditary sovereignty';
function seed(){
 const offices={};
 for(const c of CHARTERS)offices[c.id]={
  holder:c.first,office:c.title,status:'in_office',
  lastChangeDay:null,mandateNumber:0,courtReviews:0,
  recentPublic:[],source:c.basis,
  auditVersion:1,
  auditAnchor:{holder:c.first,mandateNumber:0,
   note:'Actual newly seeded original civic office; no invented previous officeholders'},
  mandateHistory:[],civicProcedures:[]
 };
 return offices;
}
function ensure(w){
 // Earlier saves recorded "government cycle" counts but never any person.
 // Add a present-day public register without inventing prior reigns/heirs.
 if(w.governance===undefined){
  w.governance=seed();
  if((w.ticks?.months||0)>0)for(const row of Object.values(w.governance))
   row.source='First reconstructed present-day public office register; earlier individual succession records do not exist in this save';
 }
 if(!w.governance||typeof w.governance!=='object'||Array.isArray(w.governance))
  throw Error('Government registers must be real objects, not invented claimant arrays');
 for(const c of CHARTERS){
  if(!w.governance[c.id])w.governance[c.id]=seed()[c.id];
  const v=w.governance[c.id];
  if(v.auditVersion===undefined){
   // Old files only know the CURRENT incumbent/mandate counter. Never
   // manufacture previous elections or unknown predecessor identities.
   v.auditVersion=1;
   v.auditAnchor={holder:v.holder,mandateNumber:v.mandateNumber,
    note:'Auditing begins from an earlier original save; historic names and decisions were not recorded'};
   v.mandateHistory=[];
  }
  if(!verifyMandateAudit(v,c)||!verifyCivicProcedures(v,c)||!verifyRecordsRemedies(v,c,w))
   throw Error('Civic mandate evidence or witnessed jurisdictional procedure is inconsistent');
 }
 return w.governance;
}

function verifyMandateAudit(v,c){
 if(!v||v.auditVersion!==1||!v.auditAnchor||
   !Number.isInteger(v.auditAnchor.mandateNumber)||
   v.auditAnchor.mandateNumber<0||
   typeof v.auditAnchor.holder!=='string'||
   v.auditAnchor.holder.length<5||
   typeof v.auditAnchor.note!=='string'||
   !Array.isArray(v.mandateHistory))
  return false;
 let holder=v.auditAnchor.holder,num=v.auditAnchor.mandateNumber,lastDay=-1;
 for(const row of v.mandateHistory){
  const q=row?.source;
  if(!q||row.hash!==hash(q)||q.origin!==MANDATE_SOURCE||
    q.polity!==c.id||q.office!==c.title||
    q.government!==c.government||
    q.governingBody!==c.governingBody||
    q.previous!==holder||q.mandateBefore!==num||
    q.mandateAfter!==num+1||row.number!==q.mandateAfter||
    row.previous!==q.previous||row.next!==q.next||
    row.day!==q.day||row.changed!==q.changed||
    !Number.isInteger(q.day)||q.day<0||q.day<lastDay||
    typeof q.crisis!=='boolean'||
    !Number.isFinite(q.stability)||q.stability<0||q.stability>100||
    !Number.isFinite(q.legitimacy)||q.legitimacy<0||q.legitimacy>100||
    !Number.isFinite(q.householdInfluence)||
    q.householdInfluence<0||q.householdInfluence>100||
    typeof q.firstDraw!=='number'||q.firstDraw<0||q.firstDraw>=1)
   return false;
  const retain=q.crisis?0:
    q.stability>=55&&q.legitimacy>=55?.65:.28;
  const weight=Math.max(.15,Math.min(.65,q.householdInfluence/120));
  const contested=q.firstDraw>=retain;
  if(q.retainChance!==retain||
    q.houseWeight!==weight||
    (contested?
     typeof q.secondDraw!=='number'||q.secondDraw<0||q.secondDraw>=1:
     q.secondDraw!==null))
   return false;
  const winner=contested?
    q.secondDraw<weight?c.relativeCandidate:c.independent:holder;
  const reason=contested?
    q.crisis?'temporary public caretaker selected under political stress':
     'new officeholder publicly selected under its '+c.style:
    'renewed by its '+c.style;
  if(q.next!==winner||q.reason!==reason||
    q.changed!==(winner!==holder))
   return false;
  holder=winner;num++;lastDay=q.day;
 }
 return v.mandateNumber===num&&v.holder===holder;
}

/*
 * Real constitutional jurisdiction: a public decision is tied to an
 * actual place, original civic office/mandate, original independently
 * resolved procedural source, and historical holder AT THE TIME.
 * This does not grant powers to enact laws, punish, confiscate, appoint,
 * compel residents, or govern another polity. Future independently
 * proven procedural providers may be connected without a law catalogue.
 */
const CIVIC_PROCEDURE='original-lawful-jurisdictional-procedure-v1';
function incumbentAtMandate(v,number,day){
 let holder=v.auditAnchor?.holder,n=v.auditAnchor?.mandateNumber;
 if(!Number.isInteger(number)||!Number.isInteger(day)||day<0||
  !Number.isInteger(n)||number<n)return null;
 for(const transition of v.mandateHistory||[]){
  if(transition.number>number)break;
  if(transition.day>day)return null;
  holder=transition.next;n=transition.number;
 }
 return number===n?holder:null;
}
function verifyCivicProcedure(v,c,row){
 const q=row?.source,review=q?.originalReview;
 if(!q||row.origin!==CIVIC_PROCEDURE||
  row.hash!==hash(q)||q.origin!==CIVIC_PROCEDURE||
  row.procedureId!==q.procedureId||
  q.polity!==c.id||q.office!==c.title||
  q.governingBody!==c.governingBody||
  !A.R[q.regionId]||A.R[q.regionId].polity!==c.id||
  !Number.isInteger(q.day)||q.day<0||
  !Number.isInteger(q.mandateNumber)||q.mandateNumber<0||
  q.incumbent!==incumbentAtMandate(v,q.mandateNumber,q.day)||
  !['in_office','interim'].includes(q.officeStatus)||
  !['public_hearing','citizen_petition'].includes(q.kind)||
  typeof q.witnessId!=='string'||q.witnessId.length<8||
  q.procedureId!==q.kind+':'+q.witnessId||
  typeof q.originalSourceHash!=='string'||
  !/^[a-f0-9]{64}$/.test(q.originalSourceHash)||
  !review||q.originalReviewHash!==hash(review)||
  q.reviewSource!==review.source||
  typeof q.reviewSource!=='string'||q.reviewSource.length<15||
  q.noNewLawEnacted!==true||q.noFindingOfGuilt!==true||
  q.noNewRightToCompel!==true||
  q.decision!==row.decision||row.day!==q.day||
  q.originalReviewDay!==review.day||
  review.day!==q.day)return false;
 if(q.kind==='public_hearing'){
  if(review.hearingId!==q.witnessId||
   review.sourceEventHash!==q.originalSourceHash||
   review.issueId!==q.issueId||
   review.disposition!==q.decision||
   !['records_review','mediation_invite','defer'].includes(q.decision)||
   review.releaseDay!==q.day+2||
   q.publicReleaseDay!==review.releaseDay||
   !Array.isArray(review.familyResponses))
   return false;
 }else{
  if(review.petitionId!==q.witnessId||
   review.petitionEventHash!==q.originalSourceHash||
   !['docketed','deferred','declined'].includes(q.decision)||
   review.decision!==q.decision||
   q.issueId!==null||
   q.publicReleaseDay!==(q.decision==='docketed'?q.day+2:null))
   return false;
 }
 return true;
}
function verifyCivicProcedures(v,c){
 if(v?.civicProcedures===undefined)return true;
 if(!Array.isArray(v.civicProcedures))return false;
 const ids=new Set();let previousDay=-1;
 for(const row of v.civicProcedures){
  if(!verifyCivicProcedure(v,c,row)||
   ids.has(row.procedureId)||row.day<previousDay)return false;
  ids.add(row.procedureId);previousDay=row.day;
 }
 return true;
}
function jurisdictionSnapshot(w,polity,regionId,day){
 ensure(w);
 const {c,v}=valid(w,polity);
 if(!A.R[regionId]||A.R[regionId].polity!==polity||
  !w.countries?.[polity]||
  !Number.isInteger(day)||day<0||
  !['in_office','interim'].includes(v.status)||
  incumbentAtMandate(v,v.mandateNumber,day)!==v.holder)
  throw Error('A real present civic jurisdiction and competent original governing office are required');
 return {polity:c.id,regionId,office:c.title,
  governingBody:c.governingBody,
  incumbent:v.holder,mandateNumber:v.mandateNumber,day,
  noAutomaticEnforcement:true,noForeignJurisdiction:true};
}
function attestOriginalCivicProcedure(s,w,{kind,witnessId}={}){
 // A PLAYER cannot pass an official verdict or new powers: every value is
 // reconstructed from the existing actual world review + original log.
 const hearing=kind==='public_hearing',
  petition=kind==='citizen_petition';
 if(!hearing&&!petition||typeof witnessId!=='string')
  throw Error('A real independently decided original civic review is required');
 const scope=jurisdictionSnapshot(w,'reedmarch','morrowfen_basin',
  (w.publicHearingReviews||[]).find(x=>hearing&&x.hearingId===witnessId)?.day??
  (w.civicPetitionReviews||[]).find(x=>petition&&x.petitionId===witnessId)?.day);
 const rec=hearing?
  s.table?.publicHearings?.records?.find(x=>x.hearingId===witnessId):
  s.table?.civicPetitions?.records?.find(x=>x.petitionId===witnessId);
 const review=hearing?
  w.publicHearingReviews?.find(x=>x.hearingId===witnessId):
  w.civicPetitionReviews?.find(x=>x.petitionId===witnessId);
 const original=hearing?require('./public-hearings'):require('./civic-petitions'),
  docket=hearing?
   w.governance.reedmarch.publicHearingDockets?.find(x=>x.hearingId===witnessId):
   w.governance.reedmarch.publicDockets?.find(x=>x.petitionId===witnessId);
 const decision=hearing?review?.disposition:review?.decision;
 if(!rec||!review||!original.sourceCheck(s,rec)||
  review.source!==original.REVIEW||
  (hearing?
   rec.state!=='reviewed'||rec.disposition!==decision||
   rec.reviewDay!==review.day||rec.releaseDay!==review.releaseDay||
   review.sourceEventHash!==rec.eventHash||
   docket?.sourceEventHash!==rec.eventHash||
   docket?.disposition!==decision||docket?.releaseDay!==review.releaseDay:
   rec.state!=='at_counter'||rec.decision!==decision||
   rec.responseDay!==review.day||review.petitionEventHash!==rec.eventHash||
   (decision==='docketed'?
    !docket||docket.petitionEventHash!==rec.eventHash:
    !!docket)))
  throw Error('A real independently verified local council decision and its original witness are required');
 const office=w.governance.reedmarch,id=kind+':'+witnessId;
 if((office.civicProcedures||[]).some(x=>x.procedureId===id))
  throw Error('The original civic procedure is already recorded; no duplicate mandate');
 const q={origin:CIVIC_PROCEDURE,kind,procedureId:id,
  polity:scope.polity,regionId:scope.regionId,
  office:scope.office,governingBody:scope.governingBody,
  incumbent:scope.incumbent,mandateNumber:scope.mandateNumber,
  officeStatus:office.status,day:review.day,originalReviewDay:review.day,
  witnessId,issueId:hearing?review.issueId:null,
  originalSourceHash:rec.eventHash,
  originalReview:structuredClone(review),originalReviewHash:hash(review),
  reviewSource:review.source,decision,
  publicReleaseDay:hearing?review.releaseDay:
   decision==='docketed'?review.day+2:null,
  noNewLawEnacted:true,noFindingOfGuilt:true,noNewRightToCompel:true};
 const row={origin:CIVIC_PROCEDURE,procedureId:id,
  day:q.day,decision,source:q,hash:hash(q)};
 if(!verifyCivicProcedure(office,C.reedmarch,row))
  throw Error('Civic office jurisdiction or real public review provenance is inconsistent');
 office.civicProcedures||=[];office.civicProcedures.push(row);
 if(!verifyCivicProcedures(office,C.reedmarch))
  throw Error('Civic history cannot accept an inconsistent official source');
 return {procedureId:id,polity:scope.polity,regionId:scope.regionId,
  reviewSourceHash:row.hash,incumbentAtDecision:scope.incumbent,
  independentDecision:decision,
  noNewLawEnacted:true,noCompulsoryOrder:true};
}
function historicalCivicProcedures(w,polity){
 ensure(w);
 const {c,v}=valid(w,polity);
 return {polity:c.id,
  constitutionalBody:c.governingBody,
  originalAttestedReviews:(v.civicProcedures||[]).map(row=>({
   procedureId:row.procedureId,day:row.day,
   officeholderAtReview:row.source.incumbent,
   mandateNumberAtReview:row.source.mandateNumber,
   regionId:row.source.regionId,
   originalDecision:row.decision,
   originalSourceHash:row.source.originalSourceHash,
   reviewEvidenceHash:row.hash,
   publicReleaseDay:row.source.publicReleaseDay,
   noEnactedLaw:true,noFindingOfGuilt:true
  }))};
}

/*
 * #20 — an actual independent March Council "records_review" disposition
 * is a narrowly competent PROCEDURAL order on its OWN civic docket, not
 * a criminal finding, a new statute, confiscation or compelled third-party
 * testimony. Its only presently grounded follow-up is inspection/indexing
 * of the filed hearing and already PUBLIC household charters.
 *
 * Keep both steps inside the original government office and hearing docket;
 * no universal law/merchant/rights ledger or second choice is created.
 */
function originalRecordsOrder(v,c,docket){
 const procedure=(v.civicProcedures||[]).find(x=>
  x.procedureId==='public_hearing:'+docket?.hearingId);
 const q=procedure?.source,review=q?.originalReview;
 if(!docket||!q||c.id!=='reedmarch'||
  docket.disposition!=='records_review'||
  review?.disposition!=='records_review'||
  review.hearingId!==docket.hearingId||
  review.issueId!==docket.issueId||
  review.day!==docket.day||
  review.sourceEventHash!==docket.sourceEventHash||
  q.originalSourceHash!==docket.sourceEventHash||
  q.day!==docket.day||!Array.isArray(review.familyResponses))
  throw Error('Only a genuine independent council records-review decision can direct an official records inspection');
 const charters=review.familyResponses.map(x=>{
  const h=Houses.byId[x?.houseId];
  if(!h||h.polity!=='reedmarch')
   throw Error('The council cannot inspect imaginary private household charters');
  return {houseId:h.id,name:h.name,publicDuty:h.duty,
   declaredDispute:h.dispute};
 });
 if(new Set(charters.map(x=>x.houseId)).size!==charters.length)
  throw Error('One original public household charter cannot be counted twice');
 return {origin:RECORDS_REMEDY,kind:'public-charter-records-review',
  polity:c.id,regionId:q.regionId,office:q.office,
  incumbentAtDecision:q.incumbent,mandateAtDecision:q.mandateNumber,
  hearingId:docket.hearingId,issueId:docket.issueId,orderedDay:docket.day,
  originalHearingHash:docket.sourceEventHash,
  originalCivicProcedureHash:procedure.hash,
  originalPublicCharters:charters,
  originalPublicRights:A.P[c.id].rights,
  noNewLaw:true,noFindingOfGuilt:true,
  noPrivateDisclosureOrForcedWitness:true,noPropertyTransfer:true};
}
function originalInspectionCompletion(order,day,calendarAnchor=null){
 const q=order.source;
 // A dated receipt is not proof of a world tick. This public office may
 // complete work only on the ORIGINAL calendar's actual sixday boundary,
 // including the original anchored calendar and Concord Days.
 const originalSixday=Number.isInteger(day)&&day>0&&day<=100000&&
  require('../rules/world').calendarTicks(day-1,1,calendarAnchor).
   sixdays.includes(day);
 if(!originalSixday||day<q.orderedDay+6)
  throw Error('An actual later completed world-sixday is necessary before council records can be inspected');
 return {origin:RECORDS_REMEDY,kind:'completed-original-public-records-inspection',
  hearingId:q.hearingId,orderSourceHash:order.hash,
  completedDay:day,releaseDay:day+2,
  publicRecordsExamined:q.originalPublicCharters.map(x=>hash(x)),
  residentFilingExamined:q.originalHearingHash,
  outcome:'Existing public charter positions and the resident filing have been indexed for council review; no disputed allegation was judicially determined.',
  noNewLaw:true,noFindingOfGuilt:true,noPrivateRecordsOpened:true,
  noFinesOrCompelledBeastAction:true};
}
function verifyRecordsRemedies(v,c,w=null){
 if(v?.publicHearingDockets===undefined)return true;
 if(!Array.isArray(v.publicHearingDockets))return false;
 const seen=new Set();
 for(const docket of v.publicHearingDockets){
  if(!docket||typeof docket.hearingId!=='string'||
    seen.has(docket.hearingId))return false;
  seen.add(docket.hearingId);
  if(docket.recordsInspection===undefined)continue; // old, untouched saves
  const order=docket.recordsInspection;
  try{
   const expected=originalRecordsOrder(v,c,docket);
   if(!order||order.hash!==hash(order.source)||
     JSON.stringify(order.source)!==JSON.stringify(expected)||
     (order.fulfilled!==null&&
      (!order.fulfilled||!order.fulfilled.source||
       order.fulfilled.hash!==hash(order.fulfilled.source)||
       JSON.stringify(order.fulfilled.source)!==
        JSON.stringify(originalInspectionCompletion(order,
         order.fulfilled.source.completedDay,w?.calendarAnchor||null)))))
    return false;
  }catch{return false;}
 }
 return true;
}
function orderPublicRecordsInspection(s,w,hearingId){
 const {c,v}=valid(w,'reedmarch'),docket=
  v.publicHearingDockets?.find(x=>x.hearingId===hearingId),
  rec=s.table?.publicHearings?.records?.find(x=>x.hearingId===hearingId);
 if(!docket||!rec||docket.recordsInspection!==undefined||
  rec.disposition!=='records_review'||
  rec.state!=='reviewed'||rec.reviewDay!==docket.day||
  !require('./public-hearings').sourceCheck(s,rec))
  throw Error('Only one newly source-attested public council records order is possible');
 const q=originalRecordsOrder(v,c,docket);
 // Ensure the static charter source agrees with the exact public contents
 // the resident could actually have heard at this particular hearing.
 if(JSON.stringify(q.originalPublicCharters)!==
   JSON.stringify(rec.writtenPositions.map(x=>({
    houseId:x.houseId,name:x.name,publicDuty:x.publicDuty,
    declaredDispute:x.declaredDispute}))))
  throw Error('Previously witnessed public charter positions cannot be silently rewritten');
 docket.recordsInspection={source:q,hash:hash(q),fulfilled:null};
 if(!verifyRecordsRemedies(v,c,w))
  throw Error('The original public administrative order failed its own source history');
 return {ordered:true,hearingId,noNewLaw:true,
  noFindingOfGuilt:true,noCompulsoryPrivateAction:true};
}
function followUpPublicRecordsInspections(w,day,emit){
 // Original saves may not yet have a current-day civic register. The
 // established constitutional migration must run before this sixday read,
 // exactly as it does before the original monthly office transitions.
 ensure(w);
 const {c,v}=valid(w,'reedmarch'),
  council=w.institutions?.marsh_council;
 if(!Number.isInteger(day)||day<0)
  throw Error('Public order follow-up requires a real completed world day');
 if(!council||council.status!=='active'||
  !Number.isFinite(council.capacity)||council.capacity<45||
  !['in_office','interim'].includes(v.status))return 0;
 let completed=0;
 for(const docket of v.publicHearingDockets||[]){
  const order=docket.recordsInspection;
  if(!order||order.fulfilled!==null||
    day<order.source.orderedDay+6)continue;
  const source=originalInspectionCompletion(order,day,w.calendarAnchor||null);
  order.fulfilled={source,hash:hash(source)};
  completed++;
  if(typeof emit==='function')emit({
   day,region:'reedmarch',subject:'council-records:'+docket.hearingId,
   text:'The March Council has indexed its existing public charter positions and the original citizen filing under a previously issued records-review order. No offence, new law, fine or private testimony is established.',
   channel:'public notice',releaseDay:day+2,severity:'routine'
  });
 }
 if(!verifyRecordsRemedies(v,c,w))
  throw Error('An independent council records review lacks original jurisdiction or charter sources');
 return completed;
}
function publicRecordsInspectionStatus(w,hearingId,day){
 const v=w?.governance?.reedmarch;
 if(!v)return null;
 if(!Number.isInteger(day)||day<0||!verifyRecordsRemedies(v,C.reedmarch,w))
  throw Error('Original public records order source cannot be verified');
 const order=v.publicHearingDockets?.find(x=>
  x.hearingId===hearingId)?.recordsInspection;
 if(!order||order.source.orderedDay+2>day)return null;
 const completion=order.fulfilled?.source,
  released=completion&&completion.releaseDay<=day;
 return {ordered:true,orderedDay:order.source.orderedDay,
  proceduralRemedy:'Original council review of the cited public filing and already published charter positions',
  completed:!!released,
  publicCompletionDay:released?completion.completedDay:null,
  findingOfGuilt:false,newLawEnacted:false,
  noCompulsoryPrivateOrBeastAction:true};
}

function historicMandates(w,id){
 ensure(w);
 const {c,v}=valid(w,id);
 return {polity:c.id,office:c.title,
  originalAuditAnchor:structuredClone(v.auditAnchor),
  actualMandates:v.mandateHistory.map(row=>({
   number:row.number,day:row.day,
   previous:row.previous,next:row.next,
   changed:row.changed,sourceHash:row.hash,
   constitutionalProcess:c.style,
   governingBody:c.governingBody,
   noInferredHeirOrRoyalInheritance:true
  }))};
}

function valid(w,id){
 const c=C[id],v=w.governance?.[id];
 if(!c||!v||!['in_office','interim','court_review'].includes(v.status)||
    typeof v.holder!=='string'||v.holder.length<5||
    !Array.isArray(v.recentPublic)||
    !Number.isInteger(v.mandateNumber)||v.mandateNumber<0||
    (v.auditVersion!==undefined&&!verifyMandateAudit(v,c))||
    !verifyCivicProcedures(v,c)||!verifyRecordsRemedies(v,c,w))
  throw Error('Existing civic leadership record or original mandate history is not internally consistent');
 return {c,v};
}
const note=(v,item)=>{v.recentPublic.push(item);if(v.recentPublic.length>12)v.recentPublic.shift();};
function report(w,id){
 const c=C[id],v=w.governance?.[id]||seed()[id];
 if(!c)throw Error('No such existing public polity office');
 return {polity:A.P[id].name,polityId:id,government:c.government,
  office:c.title,officeholder:v.holder,governingBody:c.governingBody,
  legalProcess:c.style,termMonths:c.termMonths,
  status:v.status,publicMandates:v.mandateNumber,
  lastOfficeChangeDay:v.lastChangeDay,
  sourcedMandateHistoryCount:v.mandateHistory?.length||0,
  knownAnnouncements:v.recentPublic.map(n=>({day:n.day,text:n.text})).slice(-5),
  limitation:'Public office does not imply automatic inherited techniques, permission to bind beasts, marriage, or allegiance from residents'};
}
function local(s,w){
 const region=A.LOCATION_REGION[s.world?.location]||
  require('./lived-places').get(s,s.world?.location)?.regionId,
  polity=A.R[region]?.polity;
 if(!polity)throw Error('An actual visited region is required to report local public government');
 return report(w,polity);
}
function announce(w,c,v,day,text,emit,kind){
 note(v,{day,text,kind});
 if(typeof emit==='function')emit({day,region:c.id,subject:'public-office:'+c.id,
  text,channel:'official proclamation',publiclyKnown:true,
  releaseDay:day+(kind==='interim'?5:7),severity:kind==='interim'?'important':'routine'});
}
function review(w,id,day,emit){
 ensure(w);const {c,v}=valid(w,id);
 if(!royalID(id))throw Error('Only actually hereditary constitutional offices have royal succession reviews');
 v.courtReviews++;
 const text=A.P[id].name+' holds a court succession and legal-obligation review while '+v.holder+
  ' continues to hold office. No death, abdication, heir or succession is confirmed.';
 announce(w,c,v,day,text,emit,'review');
 return {review:true,officeholder:v.holder,changed:false,courtReviews:v.courtReviews};
}
function transition(w,id,day,{crisis=false,random,emit}={}){
 ensure(w);const {c,v}=valid(w,id);
 if(royalID(id))
  throw Error('A hereditary sovereign may not be replaced by a timed random election; an actual legal succession event is required');
 if(typeof random!=='function'||!Number.isInteger(day)||day<0)
  throw Error('A dated independent world process, not the player combat RNG, must decide civic office');
 const land=A.P[id],host=w.countries?.[id];
 if(!host||!Number.isFinite(host.legitimacy)||!Number.isFinite(host.stability))
  throw Error('The real host government and local legitimacy must exist');
 const h=Houses.byId[c.houseId],standing=w.houses?.[h.id],
  householdInfluence=standing?.influence??45,
  source=v.holder;
 // Ordinary incumbents may retain public office; strong institutions make
 // continuity more likely. A family is ONE contender, never a birthright.
 const retainChance=crisis?0:(host.stability>=55&&host.legitimacy>=55?0.65:0.28);
 const first=random();
 if(!(first>=0&&first<1))throw Error('Independent government process must return a bounded random choice');
 let next=source,reason='renewed by its '+c.style,secondDraw=null;
 if(first>=retainChance){
  const houseWeight=Math.max(0.15,Math.min(0.65,householdInfluence/120));
  const vote=random();
  if(!(vote>=0&&vote<1))throw Error('Independent public office selection must be a real bounded choice');
  secondDraw=vote;
  next=vote<houseWeight?c.relativeCandidate:c.independent;
  reason=crisis?'temporary public caretaker selected under political stress':
   'new officeholder publicly selected under its '+c.style;
 }
 const changed=next!==source;
 const beforeNumber=v.mandateNumber,
  sourceRecord={
   origin:MANDATE_SOURCE,polity:id,office:c.title,
   government:c.government,governingBody:c.governingBody,
   previous:source,next,changed,day,crisis:!!crisis,
   stability:host.stability,legitimacy:host.legitimacy,
   householdInfluence,retainChance,houseWeight:Math.max(.15,Math.min(.65,householdInfluence/120)),
   firstDraw:first,secondDraw,
   mandateBefore:beforeNumber,mandateAfter:beforeNumber+1,
   reason
  };
 const row={number:sourceRecord.mandateAfter,day,previous:source,
  next,changed,source:sourceRecord,hash:hash(sourceRecord)};
 v.holder=next;
 v.mandateNumber++;
 v.mandateHistory.push(row);
 if(!verifyMandateAudit(v,c))
  throw Error('The actual original independent public-office mandate lacks authentic continuity');
 v.status=crisis?'interim':'in_office';
 if(changed){
  v.lastChangeDay=day;
  w.counters.changesOfGovernment++;
 }
 const text=land.name+' '+(changed?'records '+next+' replacing '+source:
  'renews '+source)+
  ' as '+c.title+' ('+reason+').'+
  ' No household gains sovereign property or hereditary powers from this office.';
 announce(w,c,v,day,text,emit,crisis?'interim':'mandate');
 return {changed,previous:source,officeholder:next,
   title:c.title,reason,mandateNumber:v.mandateNumber};
}
function crisisReview(w,id,day,emit){
 ensure(w);const {c,v}=valid(w,id);
 if(!royalID(id))throw Error('Only a hereditary court requires a non-abdicating crisis review');
 v.status='court_review';
 const text=A.P[id].name+' publicly convenes a council of obligations around '+v.holder+
  ' after sustained unrest. The crown has NOT automatically changed hands.';
 announce(w,c,v,day,text,emit,'interim');
 return {underReview:true,officeholder:v.holder,changed:false};
}
function recover(w,id,day,emit){
 const {c,v}=valid(w,id),host=w.countries?.[id];
 if(v.status!=='court_review'||!host||host.stability<58||host.legitimacy<58)return false;
 v.status='in_office';
 announce(w,c,v,day,A.P[id].name+' closes a review of crown obligations while '+v.holder+
  ' remains sovereign; no unrecorded succession has occurred.',emit,'review');
 return true;
}
module.exports={charters:CHARTERS,byId:C,seed,ensure,report,local,review,transition,crisisReview,recover,royalID,terms,
 MANDATE_SOURCE,historicMandates,verifyMandateAudit,
 CIVIC_PROCEDURE,verifyCivicProcedures,jurisdictionSnapshot,
 RECORDS_REMEDY,verifyRecordsRemedies,orderPublicRecordsInspection,
 followUpPublicRecordsInspections,publicRecordsInspectionStatus,
 attestOriginalCivicProcedure,historicalCivicProcedures};
