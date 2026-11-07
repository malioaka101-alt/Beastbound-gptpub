'use strict';
// Public household charters and slow correspondence. Never invent an audience,
// kinship, aristocratic title, awakened bloodline or friendly NPC decision.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),
 W=require('./world'),H=require('./unified'),
 Atlas=require('../world/atlas'),Houses=require('../world/social-houses'),Realm=require('../world/simulation');
const OPEN=8*60,CLOSE=18*60,READ=15,POST=12,COLLECT=8;
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const publicHouse=h=>({
 id:h.id,name:h.name,kind:h.kind,
 polity:Atlas.P[h.polity].name,publicRole:h.role,duty:h.duty,
 politicalStatus:h.politicalStatus
});
const localPolity=s=>Atlas.R[Atlas.LOCATION_REGION[s.world?.location]]?.polity||null;
function exact(p,keys){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>!keys.includes(k))||
    keys.some(k=>!Object.hasOwn(p,k)))
  throw Error('Only an actual known household and supported civic action can be requested; titles, replies, bloodlines and favour cannot be caller-selected');
}
function civic(s,mins){
 const registrar=E.NPCS.elira;
 if(!registrar||registrar.location!=='crossing'||
    registrar.profession!=='Guild registrar'||
    s.world?.location!=='crossing'||
    Atlas.P[localPolity(s)]?.id!=='reedmarch')
  throw Error('This first civic correspondence route exists at the actual Morrowfen Crossing guild registrar');
 if(s.battle||s.encounter)
  throw Error('An active wildlife threat or battle cannot be converted into a peaceful guild appointment');
 const health=s.table?.combatants?.player;
 if(health&&health.status!=='ok')
  throw Error('An incapacitated character cannot conduct an unsupervised legal appointment');
 const minute=s.world.minutes%1440;
 if(minute<OPEN||minute+mins>CLOSE)
  throw Error('The existing guild registrar operates during actual daytime appointment hours');
 return registrar;
}
function ledger(s){
 s.table||={};
 s.table.socialFabric||={inquiries:[],letters:[]};
 const l=s.table.socialFabric;
 if(!Array.isArray(l.inquiries)||!Array.isArray(l.letters))
  throw Error('Invalid household social history must be reconciled, not guessed');
 return l;
}
function status(s,p={}){
 exact(p,[]);
 const local=localPolity(s);
 const own=s.player?.family&&typeof s.player.family==='object'?
  {...s.player.family}:null;
 const w=Realm.peek(s),day=Math.floor(s.world.minutes/1440);
 const entries=Houses.catalog(w,{publicOnly:true,day}).filter(h=>h.polity===local).map(publicHouse);
 const l=s.table?.socialFabric;
 const known=Array.isArray(l?.inquiries)?l.inquiries.map(rec=>{
  const h=Houses.lookup(w,rec.houseId);
  return h?{
   houseId:h.id,name:h.name,consultedDay:rec.day,
   elder:h.elder,relative:h.relative,relation:h.relation,
   publiclyDeclaredDispute:h.dispute,recordedTradition:h.heritage,
   kinshipToPlayer:'unverified'
  }:null;
 }).filter(Boolean).slice(-30):[];
 const mail=Array.isArray(l?.letters)?l.letters.map(m=>({
  letterId:m.letterId,houseId:m.houseId,purpose:m.purpose,
  state:m.state==='held_at_registry'&&s.world.location!=='crossing'?
   'reply awaiting pickup at Morrowfen guild':m.state,
  postedDay:Math.floor(m.postedAtMinute/1440)+1,
  // A response is not known until the player ACTUALLY collects it.
  response:m.state==='collected'?m.response:null,
  responseDay:m.state==='collected'?m.responseDay:null
 })).slice(-25):[];
 return {polity:Atlas.P[local]?.name||'unregistered',
   government:Atlas.P[local]?.government||null,
   familyBackground:own,localPublicHouses:entries,
   emergingGroups:Realm.publicEmergentGroups(s).groups,knownCharters:known,letters:mail,
   earnedCivicRegard:Object.fromEntries(Object.entries(l?.civicRegard||{}).filter(([id])=>
    known.some(x=>x.houseId===id))),
   note:'Public notice and personal acquaintance differ from kinship, membership, office, hereditary power or an offered private audience.'};
}
function inquire(s,p={}){
 exact(p,['houseId']);
 const h=Houses.lookup(Realm.peek(s),p.houseId,{
  publishedOnly:true,day:Math.floor(s.world.minutes/1440)});
 if(!h||h.polity!==localPolity(s)||h.polity!=='reedmarch')
  throw Error('The household must be an actual locally filed publicly accessible lineage, not a distant or invented clan');
 const npc=civic(s,READ),t=s.table?.socialFabric,
  today=E.day(s);
 if(t?.inquiries?.some(x=>x.houseId===h.id&&x.day===today))
  throw Error('The same public family charter has already been examined today');
 const start=s.world.minutes;
 E.advance(s,READ);W.finalizeTime(s,start);H.sync(s,{source:'legacy'});
 C.event(s,'story',(h.source==='New Beastbound regional household authoring linked to existing world/atlas.js political charter'?
  'A filed public household charter': 'A self-declared published association notice')+
  ' for '+h.name+' is consulted at the Morrowfen guild desk.',{
  origin:'witnessed-public-household-charter',
  houseId:h.id,polity:h.polity,registrar:npc.name,location:'crossing',
  elder:h.elder,relative:h.relative,relation:h.relation,
  publicDuty:h.duty,readMinutes:READ
 });
 const ev=s.log[s.log.length-1],l=ledger(s),eventHash=hash(ev);
 l.inquiries.push({houseId:h.id,day:today,worldMinute:s.world.minutes,
  eventIndex:s.log.length-1,eventHash,
  source:h.source});
 if(l.inquiries.length>90)l.inquiries.splice(0,l.inquiries.length-90);
 return {consulted:true,house:publicHouse(h),elder:h.elder,
  relative:h.relative,relation:h.relation,
  dispute:h.dispute,tradition:h.heritage,
  source:h.source==='New Beastbound regional household authoring linked to existing world/atlas.js political charter'? 'actual Morrowfen guild public registry':'actual self-declared locally published association notice',
  minutes:READ,knowledgeOnly:true,noAutomaticKinship:true,
  noGrantedRank:true,noAutomaticBloodline:true};
}
function lastWitness(s,h){
 const l=s.table?.socialFabric,visits=l?.inquiries;
 const inquiry=Array.isArray(visits)?[...visits].reverse().find(x=>x.houseId===h.id):null;
 if(!inquiry||!Number.isInteger(inquiry.worldMinute)||
   s.world.minutes-inquiry.worldMinute>30*1440||
   !Number.isInteger(inquiry.eventIndex)||inquiry.eventIndex<0||
   inquiry.eventIndex>=s.log.length||
   typeof inquiry.eventHash!=='string'||inquiry.eventHash.length!==64)
  throw Error('A recent actually witnessed charter consultation is required before contacting this household');
 const ev=s.log[inquiry.eventIndex];
 if(ev?.type!=='story'||ev.details?.origin!=='witnessed-public-household-charter'||
   ev.details.houseId!==h.id||ev.details.polity!==h.polity||
   ev.details.registrar!==E.NPCS.elira.name||
   ev.details.publicDuty!==h.duty||hash(ev)!==inquiry.eventHash)
  throw Error('Household charter provenance cannot be verified against the original local registrar event');
 return inquiry;
}
function request(s,p={}){
 exact(p,['houseId','purpose']);
 const h=Houses.lookup(Realm.peek(s),p.houseId,{
  publishedOnly:true,day:Math.floor(s.world.minutes/1440)});
 if(!h||h.polity!=='reedmarch'||h.polity!==localPolity(s))
  throw Error('Only real Reedmarch household charters accessible through the local guild can receive this request');
 const own=Realm.peek(s).emergentGroups?.entries?.[h.id];
 if(own?.origin==='player-declaration'&&own.founder.name===s.player.name)
  throw Error('A letter to your own newly founded group cannot manufacture an independent reply from yourself');
 if(!['request_history','offer_service','request_audience'].includes(p.purpose))
  throw Error('A concrete supported public inquiry purpose is required, not a caller-authored favourable response');
 civic(s,POST);
 const src=lastWitness(s,h);
 const existing=s.table?.socialFabric?.letters||[];
 if(existing.some(x=>x.houseId===h.id&&s.world.minutes-x.postedAtMinute<30*1440))
  throw Error('The family has already received an inquiry in the last thirty in-world days; it is not obliged to answer daily');
 const start=s.world.minutes,letterId='house_mail_'+h.id+'_'+start;
 E.advance(s,POST);W.finalizeTime(s,start);H.sync(s,{source:'legacy'});
 C.event(s,'story','A public '+p.purpose.replace(/_/g,' ')+' note is filed for '+h.name+' without claiming any promise or accepted audience.',{
  origin:'registered-household-letter',houseId:h.id,letterId,
  purpose:p.purpose,location:'crossing',minutes:POST,
  witnessedCharterHash:src.eventHash
 });
 const ev=s.log[s.log.length-1],l=ledger(s);
 l.letters.push({letterId,houseId:h.id,purpose:p.purpose,
  state:'sent',postedAtMinute:start,nextReplyDay:Math.floor(start/1440)+6,
  source:'Witnessed local guild registrar correspondence about a known public household',
  eventHash:hash(ev),charterHash:src.eventHash});
 return {registered:true,letterId,houseId:h.id,purpose:p.purpose,
  minutes:POST,replyPending:true,guaranteedResponse:false,
  guaranteedMembership:false,automaticAuthority:false};
}
function collect(s,p={}){
 exact(p,['letterId']);
 civic(s,COLLECT);
 const letters=s.table?.socialFabric?.letters;
 const m=Array.isArray(letters)?letters.find(x=>x.letterId===p.letterId):null;
 if(!m||m.state!=='held_at_registry'||!m.response||
    !Houses.lookup(Realm.peek(s),m.houseId)||
    !Number.isInteger(m.responseDay)||m.responseDay<0||
    !Number.isInteger(m.postedAtMinute)||m.responseDay<Math.floor(m.postedAtMinute/1440)+6)
  throw Error('An independently delivered, uncollected real household response must exist');
 const report=m.purpose==='field_report';
 const ev=s.log.find(x=>
  (x.details?.origin===(report?'registered-source-witnessed-family-fieldwork':'registered-household-letter'))&&
  x.details.letterId===m.letterId&&x.details.houseId===m.houseId);
 if(!ev||hash(ev)!==m.eventHash)
  throw Error('This claimed correspondence has no matching original player letter');
 if(report){
  if(m.source!=='Witnessed noninvasive field report submitted to a chartered local household'||
     !m.evidenceCheckId||s.table?.socialFabric?.reportsUsed?.[m.evidenceCheckId]!==m.letterId||
     !['accepted','declined'].includes(m.review)||
     ev.details?.checkId!==m.evidenceCheckId||
     ev.details?.originalTerrainHash!==m.evidenceSceneHash||
     ev.details?.originalCheckHash!==m.evidenceRollHash)
   throw Error('This family review lacks its authentic public fieldwork report and independent decision');
  const proof=require('./social-service').proof(s,m.evidenceCheckId,m.houseId);
  if(proof.rollHash!==m.evidenceRollHash||
     proof.a.eventHash!==m.evidenceSceneHash||
     proof.a.location!==m.habitat||
     proof.f.degree!==m.degree)
   throw Error('The field report no longer matches its actually completed survey or legal local habitat');
 }
 const old=s.world.minutes;
 E.advance(s,COLLECT);W.finalizeTime(s,old);H.sync(s,{source:'legacy'});
 m.state='collected';m.collectedAtMinute=s.world.minutes;
 let civicRegardGained=0;
 if(report&&m.review==='accepted'){
  const l=ledger(s);l.civicRegard||={};
  const prior=C.int(l.civicRegard[m.houseId]||0,'earned documented local household regard',0,4);
  l.civicRegard[m.houseId]=Math.min(4,prior+1);
  civicRegardGained=l.civicRegard[m.houseId]-prior;
 }
 C.event(s,'story','The guild registrar delivers the independent reply filed by '+Houses.lookup(Realm.peek(s),m.houseId).name+'.',{
  origin:'witnessed-household-reply',letterId:m.letterId,
  houseId:m.houseId,response:m.response,responseDay:m.responseDay
 });
 return {collected:true,letterId:m.letterId,houseId:m.houseId,
  purpose:m.purpose,response:m.response,
  receivedAfterWorldDays:m.responseDay-Math.floor(m.postedAtMinute/1440),
  minutes:COLLECT,civicRegardGained,
  recognizedService:report?m.review==='accepted':null,
  noRankGranted:true,noAutomaticMembership:true,noInventedAudience:true};
}
module.exports={status,inquire,request,collect,civic,lastWitness,ledger};
