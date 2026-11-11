'use strict';
// Real public offices for the existing twenty-four Beastbound polities.
// New regional authoring grounded in atlas governments, NOT names copied from
// the Master Prompt. A surname, hereditary court or wealthy clan is never
// an automatic entitlement to the sovereignty of its home country.
const Crypto=require('node:crypto'),A=require('./atlas'),Houses=require('./social-houses');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const MANDATE_SOURCE='original-public-office-independent-mandate-v1';
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
  mandateHistory:[]
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
  if(!verifyMandateAudit(v,c))
   throw Error('Civic mandate evidence or office continuity is inconsistent');
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
    (v.auditVersion!==undefined&&!verifyMandateAudit(v,c)))
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
 MANDATE_SOURCE,historicMandates,verifyMandateAudit};
