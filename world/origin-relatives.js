'use strict';
// Known pre-campaign relatives become individual world actors with their own
// continuing schedules and decisions. A name/kinship is NOT a summons,
// personality prescription, guaranteed affection or supernatural inheritance.
const Crypto=require('node:crypto');
const Atlas=require('./atlas');
const Engine=require('../engine.js');
const ORIGIN='independent-origin-kin-v1';
const SHIFT='independent-kin-local-visit-v1';
const DAY=1440,START=8*60,END=18*60;
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function seedNumber(x){return Crypto.createHash('sha256').update(String(x)).digest().readUInt32BE(0)||0x6fb78a3d;}
function draw(p){
 let x=p.rngState>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 p.rngState=(x>>>0)||0x6fb78a3d;
 return p.rngState/4294967296;
}
function site(regionId){
 const region=Atlas.R[regionId];
 if(!region)return null;
 return (region.loc||[]).find(loc=>Engine.LOCATIONS[loc]&&
  Atlas.LOCATION_REGION[loc]===regionId)||null;
}
function ensure(w){
 const t=w.originKin;
 if(!t)return null;
 if(t.version!==1||t.origin!==ORIGIN||
  !Number.isInteger(t.seed)||t.seed<1||
  typeof t.ownerName!=='string'||!Atlas.R[t.homeRegionId]||
  !t.people||typeof t.people!=='object'||Array.isArray(t.people)||
  !Number.isInteger(t.lastSixday)||t.lastSixday<0)
  throw Error('A known family ledger has inconsistent founding evidence');
 return t;
}
function verify(w,p){
 const t=ensure(w),src=p?.source;
 if(!t||!p||!src||p.origin!==ORIGIN||src.origin!==ORIGIN||
  !/^kin_[1-9][0-9]*$/.test(p.id)||p.actorId!=='origin-kin:'+p.id||
  src.id!==p.id||src.actorId!==p.actorId||
  src.playerName!==t.ownerName||src.campaignSeed!==t.seed||
  src.regionId!==t.homeRegionId||!Atlas.R[src.regionId]||
  src.name!==p.name||src.relation!==p.relation||
  p.sourceHash!==hash(src)||
  !['active','unavailable'].includes(p.status)||
  !Number.isInteger(p.lastSixday)||p.lastSixday<0||
  !Number.isInteger(p.rngState)||p.rngState<1||
  !Number.isInteger(p.funds)||p.funds<0||p.funds>100||
  !Number.isInteger(p.fatigue)||p.fatigue<0||p.fatigue>100||
  !['reserved','practical','curious','self-directed'].includes(p.temperament)||
  !Array.isArray(p.history)||p.history.length>24||
  p.history.some(x=>x.hash!==hash(x.source)||
   x.source?.personId!==p.id||x.source?.origin!==ORIGIN||
   !Number.isInteger(x.source?.day)||x.source.day<0||
   x.source.day>p.lastSixday))return false;
 if(!p.shift)return true;
 const {hash:seal,...body}=p.shift;
 return seal===hash(body)&&p.shift.origin===SHIFT&&
  p.shift.personId===p.id&&p.shift.npcId===p.actorId&&
  p.shift.name===p.name&&p.shift.regionId===t.homeRegionId&&
  p.shift.location===site(t.homeRegionId)&&
  Number.isInteger(p.shift.fromDay)&&
  p.shift.fromDay===p.lastSixday&&
  p.shift.throughDay===p.shift.fromDay+5;
}
function appointment(t,p,day){
 const place=site(t.homeRegionId);
 if(!place||p.status!=='active')return null;
 const body={origin:SHIFT,personId:p.id,npcId:p.actorId,
  name:p.name,relation:p.relation,regionId:t.homeRegionId,
  location:place,fromDay:day,throughDay:day+5,
  scheduledAtDay:day,sourceHash:p.sourceHash,
  notAPromiseOfConversation:true};
 return {...body,hash:hash(body)};
}
function install(s,w){
 if(!s?.campaign?.origin||s.campaign.origin.version!==1||
  !s.player?.family||s.campaign.oldCampaignImported!==false)
  throw Error('Individual starting kin require an actual new campaign origin');
 if(w.originKin)throw Error('Cannot re-roll or replace existing relative lives');
 const family=s.player.family,members=family.members||[],
  home=s.campaign.origin.birthRegionId,seed=s.campaign.startSeed>>>0;
 if(!Atlas.R[home]||!seed||!Array.isArray(members)||
  members.length>12||new Set(members.map(m=>m.name)).size!==members.length)
  throw Error('Starting relatives require distinct names and a real home');
 const t={version:1,origin:ORIGIN,seed,ownerName:s.player.name,
  homeRegionId:home,lastSixday:0,people:{}};
 for(let i=0;i<members.length;i++){
  const m=members[i];
  if(!m||typeof m.name!=='string'||m.name.trim().length<3||
   m.name.length>70||typeof m.relation!=='string'||
   m.relation.length<2||m.relation.length>50)
   throw Error('A relative must have an existing plausible name and relation');
  const id='kin_'+(i+1),actorId='origin-kin:'+id,
   source={origin:ORIGIN,id,actorId,campaignSeed:seed,
    playerName:s.player.name,name:m.name,relation:m.relation,
    regionId:home,houseId:family.house?.id||null,
    homeTrade:family.homeTrade||'ordinary household work',
    establishedAtDay:0,noPresumedAdultAge:true,
    noAutomaticInheritance:true};
  const p={id,actorId,origin:ORIGIN,source,sourceHash:hash(source),
   name:m.name,relation:m.relation,regionId:home,
   status:'active',temperament:['reserved','practical','curious','self-directed'][
    seedNumber(seed+'|'+id+'|temperament')%4],
   funds:8+seedNumber(seed+'|'+id+'|funds')%19,
   fatigue:seedNumber(seed+'|'+id+'|fatigue')%21,
   rngState:seedNumber(seed+'|'+id+'|life'),
   lastSixday:0,shift:null,history:[]};
  // Whether someone is visible at the first scene is their own bounded
  // schedule, *not* a request to summon a family member.
  if(draw(p)<.47)p.shift=appointment(t,p,0);
  t.people[id]=p;
 }
 w.originKin=t;
 for(const p of Object.values(t.people))
  if(!verify(w,p))throw Error('A founding family member failed source validation');
 return {knownRelatives:members.length,localOpeningSchedules:
  Object.values(t.people).filter(p=>p.shift).length};
}
function sixday(w,day){
 const t=ensure(w);
 if(!t)return {changed:0,absent:true};
 if(!Number.isInteger(day)||day<6||day%6!==0)
  throw Error('Independent relatives advance on the established sixday clock');
 if(t.lastSixday>=day)return {changed:0,duplicate:true};
 let changed=0;
 for(const p of Object.values(t.people)){
  if(!verify(w,p))throw Error('Saved relative has lost their founding source');
  const oldFunds=p.funds,oldFatigue=p.fatigue;
  const roll=draw(p);
  const choice=roll<.28?'rest':roll<.72?'ordinary-work':
   roll<.91?'community-assistance':'private-errand';
  if(choice==='rest')p.fatigue=Math.max(0,p.fatigue-7);
  else if(choice==='ordinary-work'){
   p.funds=Math.min(100,p.funds+2);
   p.fatigue=Math.min(100,p.fatigue+3);
  }else if(choice==='community-assistance'){
   p.fatigue=Math.min(100,p.fatigue+2);
  }else{
   p.funds=Math.max(0,p.funds-1);
   p.fatigue=Math.min(100,p.fatigue+1);
  }
  p.lastSixday=day;
  p.status=p.fatigue>=90?'unavailable':'active';
  p.shift=choice==='rest'||draw(p)>.47?null:appointment(t,p,day);
  const evidence={origin:ORIGIN,personId:p.id,day,
   decision:choice,before:{funds:oldFunds,fatigue:oldFatigue},
   after:{funds:p.funds,fatigue:p.fatigue},
   presentAtLocalSite:!!p.shift};
  p.history.push({source:evidence,hash:hash(evidence)});
  if(p.history.length>24)p.history.shift();
  if(!verify(w,p))throw Error('Individual kin progress cannot be authenticated');
  changed++;
 }
 t.lastSixday=day;
 return {changed,duplicate:false};
}
function presence(w,id,location,day){
 const t=ensure(w);
 if(!t||typeof id!=='string'||!id.startsWith('origin-kin:'))return null;
 const p=t.people[id.slice('origin-kin:'.length)];
 if(!p||!verify(w,p)||p.actorId!==id||p.status!=='active')return null;
 const sh=p.shift;
 if(!sh||sh.location!==location||day<sh.fromDay||day>sh.throughDay)
  return null;
 return structuredClone(sh);
}
function identity(w,id){
 const t=ensure(w),p=t?.people?.[id?.slice('origin-kin:'.length)];
 if(!p||p.actorId!==id||!verify(w,p))return null;
 return {id:p.actorId,actorId:p.actorId,name:p.name,
  profession:p.source.homeTrade,goal:'independent personal responsibilities',
  topic:'ordinary work and known family background',
  polity:Atlas.R[p.regionId].polity,source:'seeded-independent-family-person'};
}
function status(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Known starting family status accepts no invented present person or hidden query');
 const t=ensure(s.table?.realm||{}),owned=s.player.family?.members||[],
  heard=s.table?.originKinConversations?.records||[];
 if(t&&(t.ownerName!==s.player.name||
  t.seed!==s.campaign?.startSeed||
  owned.length!==Object.keys(t.people).length))
  throw Error('Starting kin ledger is from a different campaign or family');
 if(!Array.isArray(heard))throw Error('Personal family recollections need a valid saved ledger');
 return {home:Atlas.R[s.player.startingContext?.birthRegionId]?.name||null,
  relatives:owned.map((x,i)=>({npcId:'origin-kin:kin_'+(i+1),
   name:x.name,relation:x.relation,
   lastPersonallyHeard:heard.filter(v=>v.npcId==='origin-kin:kin_'+(i+1))
    .at(-1)?.heard||null})),
  note:'Known family identity is not current location, current consent, affection, pay, private thoughts or a magical birthright. Only personally witnessed conversation is added.'};
}
function answer(s,p,question){
 const q=question.toLowerCase(),reg=Atlas.R[p.regionId],
  h=p.source.houseId?require('./social-houses').byId[p.source.houseId]:null;
 if(/\b(?:family|relative|related|kin|house|home|homeland|where are you from)\b/.test(q))
  return {kind:'known-family-background',
   text:'Our known home is '+reg.name+'. '+(h?
    'The public history of '+h.name+' includes '+h.duty+'. ':
    'Our household has its own ordinary history. ')+
    'I cannot speak for every relative or promise a family decision.'};
 if(/\b(?:work|occupation|job|trade|craft|livelihood|help)\b/.test(q))
  return {kind:'known-household-work',
   text:'Our household background includes '+p.source.homeTrade+
    '. I have my own obligations; this is not an offer of work or teaching.'};
 if(/\b(?:weather|rain|wind|mist)\b/.test(q))
  return {kind:'local-weather',
   text:'The weather we can observe here is '+s.world.weather+'.'};
 if(/\b(?:route|road|path|directions)\b/.test(q))
  return {kind:'local-roads',text:'The established paths here lead to '+
   Engine.LOCATIONS[s.world.location].exits.map(x=>Engine.LOCATIONS[x].name).join(', ')+
   '. I cannot promise safe travel.'};
 return {kind:'unverified',
  text:'I would rather not claim to know that. Tell me what you want to ask about our shared history or what is visible here.'};
}
function talk(s,{npcId,question,...extras}={}){
 if(Object.keys(extras).length||typeof npcId!=='string'||
  typeof question!=='string'||question.trim().length<5||question.length>300)
  throw Error('Ask an actual present relative a real question without supplying their response');
 if(s.battle||s.encounter||s.table?.combatants?.player?.status==='incapacitated')
  throw Error('A live threat or incapacitation prevents a settled family conversation');
 const w=require('./simulation').peek(s),day=Math.floor(s.world.minutes/DAY),
  minute=s.world.minutes%DAY,shift=presence(w,npcId,s.world.location,day),
  person=w.originKin?.people?.[npcId.slice('origin-kin:'.length)];
 if(!shift||!person||minute<START||minute+12>END)
  throw Error('This relative is not independently present for a daytime conversation');
 s.table||={};
 const l=s.table.originKinConversations||={records:[]};
 if(!Array.isArray(l.records))throw Error('An earlier family conversation record was altered');
 const q=question.trim(),earlier=l.records.filter(x=>x.npcId===npcId&&x.day===day),
  repeated=earlier.find(x=>x.question===q);
 if(repeated)return {alreadyAsked:true,name:person.name,
  heard:repeated.heard,agreed:repeated.agreed,minutes:0,
  noAutomaticBenefits:true};
 if(earlier.some(x=>x.agreed===false))return {
  alreadyDeclined:true,name:person.name,agreed:false,minutes:0,
  noAutomaticBenefits:true};
 const consent=earlier.length?true:draw(person)<(person.fatigue>70?.42:.69),
  response=consent?answer(s,person,q):null,
  heard=response?.text||'I have other responsibilities right now.';
 const start=s.world.minutes,duration=earlier.length?6:12;
 if(minute+duration>END)
  throw Error('The established local family visit is ending');
 Engine.advance(s,duration);
 require('../rules/world').finalizeTime(s,start);
 require('../rules/unified').sync(s,{source:'legacy'});
 const record={origin:ORIGIN,npcId,name:person.name,
  location:shift.location,day,question:q,
  heard,kind:response?.kind||'declined',agreed:consent,
  presenceHash:shift.hash,minutes:duration,
  sourceHash:person.sourceHash,noAutomaticBenefits:true};
 l.records.push(record);
 if(l.records.length>120)l.records.shift();
 require('../rules/core').event(s,'story',
  person.name+(consent?' answers a question.':' declines to speak further.'),{
   origin:'witnessed-starting-kin-conversation',
   npcId,day,question:q,heard:consent?heard:null,agreed:consent,
   shiftHash:shift.hash,noFreeTechnique:true,noAutomaticConsent:true});
 return {met:true,npcId,name:person.name,agreed:consent,
  heard,kind:record.kind,minutes:duration,
  noAutomaticBenefits:true,
  message:consent?person.name+' says: “'+heard+'”':
   person.name+' is not willing to talk just now.'};
}
module.exports={ORIGIN,SHIFT,ensure,install,verify,identity,presence,
 sixday,status,talk};
