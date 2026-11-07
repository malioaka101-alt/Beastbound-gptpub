'use strict';
// Privately simulated, source-grounded person-to-person contact. The initial
// adapter is for independently generated people with VERIFIED overlapping
// shifts; the evidence structure is actor-neutral for later person adapters.
// No world-wide friendships, instant language, inherited knowledge or powers.
const Practice=require('./earned-individual-practice'),
 Emergent=require('./emergent-people'),Careers=require('./person-careers');
const hash=Practice.hash,ORIGIN='co-present-independent-person-contact-v1',
 LIMIT=48;
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const validHash=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const cap=x=>Math.max(-5,Math.min(5,x));
const clone=x=>structuredClone(x);
function seed(w){
 const source={origin:ORIGIN,worldSeed:w.worldSeed},h=hash(source);
 return {version:1,origin:ORIGIN,source,sourceHash:h,
  lastSixday:-1,attempts:0,anchorAttempts:0,
  anchorHash:h,headHash:h,anchorState:{relations:{},knowledge:{}},
  state:{relations:{},knowledge:{}},receipts:[]};
}
function unit(seedValue,actor,other,day,tag){
 return parseInt(hash({origin:ORIGIN,seed:seedValue,person:actor.id,
  personOriginHash:actor.originHash,personality:actor.personality,
  other:other.id,day,site:actor.location,tag}).slice(0,8),16)/4294967296;
}
function pairKey(a,b){return [a.id,b.id].sort().join('|');}
function shiftValid(a,day){
 const s=a.shift;
 if(!s||s.source!==Emergent.SHIFT||!validHash(s.hash)||
  s.npcId!==a.id||s.actorId!==a.id||
  s.personId!==a.id.slice('emergent:'.length)||
  s.originHash!==a.originHash||s.location!==a.location||
  s.polity!==a.polity||s.name!==a.name||
  !Number.isInteger(s.fromDay)||!Number.isInteger(s.throughDay)||
  s.fromDay>day||day>s.throughDay||
  s.throughDay-s.fromDay!==5||s.scheduledAtDay!==s.fromDay)return false;
 const {hash:seal,...body}=s;return hash(body)===seal;
}
function snapshot(w,p,day){
 if(!p||p.status!=='active'||p.fatigue>85||
  p.lastTickDay!==day||!p.language||!p.personality)return null;
 const location=Emergent.siteFor(p.regionId);
 if(!location)return null;
 const shift=Emergent.presence(w,p.actorId,location,day);
 if(!shift)return null;
 return {id:p.actorId,originHash:p.originHash,language:p.language,
  personality:p.personality,polity:p.polity,name:p.name,
  location,fatigue:p.fatigue,shift};
}
function historical(w,a,day){
 if(!obj(a)||typeof a.id!=='string'||!a.id.startsWith('emergent:')||
  !validHash(a.originHash)||!Number.isInteger(a.fatigue)||
  a.fatigue<0||a.fatigue>85||!shiftValid(a,day))return false;
 const p=w.emergentPeople?.people?.[a.id.slice('emergent:'.length)];
 return !!(p&&p.actorId===a.id&&p.originHash===a.originHash&&
  p.birthSource?.day<=day&&p.birthSource.language===a.language&&
  p.personality===a.personality&&
  p.birthSource.polity===a.polity);
}
function decision(seedValue,a,b,day){
 const seekA=unit(seedValue,a,b,day,'approach')<
  (a.fatigue>65?.29:a.personality==='curious'?.73:.54);
 const seekB=unit(seedValue,b,a,day,'approach')<
  (b.fatigue>65?.29:b.personality==='curious'?.73:.54);
 if(!seekA&&!seekB)return null;
 const initiator=seekA?a.id:b.id;
 const welcome=seekA&&seekB||
  (seekA?unit(seedValue,b,a,day,'respond')<
   (b.fatigue>60?.28:.67):
   unit(seedValue,a,b,day,'respond')<
   (a.fatigue>60?.28:.67));
 let kind='declined';
 if(welcome){
  const stanceA=unit(seedValue,a,b,day,'stance'),
   stanceB=unit(seedValue,b,a,day,'stance');
  kind=stanceA>.88&&stanceB>.72||
   stanceB>.88&&stanceA>.72?'disagreed':
   stanceA<.68&&stanceB<.68?'cooperated':'conversed';
 }
 return {initiator,kind,mutualConsent:welcome,
  sharedLanguage:a.language===b.language};
}
function successfulWork(w,p,day){
 if(!Emergent.verify(w,p)||!Careers.verify(p))return null;
 return [...(p.career?.workReceipts||[])].reverse().find(r=>
  r.origin===Careers.WORK&&r.sourceHash===hash(r.source)&&
  r.source?.personId===p.id&&
  r.source?.personOriginHash===p.originHash&&
  r.source?.outcome?.success===true&&r.source.day<=day)||null;
}
function offeredWork(w,a,b,day,kind,state){
 if(!['cooperated','conversed'].includes(kind)||a.language!==b.language)
  return null;
 for(const [source,recipient] of [[a,b],[b,a]]){
  const donor=w.emergentPeople.people[source.id.slice(9)],
   work=successfulWork(w,donor,day);
  if(!work||unit(w.worldSeed,source,recipient,day,'offer-work')>=.61||
   unit(w.worldSeed,recipient,source,day,'receive-work')>=.72)continue;
  if(state.knowledge[recipient.id]?.some(k=>
   k.sourceWorkHash===work.sourceHash))continue;
  return {sourceActorId:source.id,receiverActorId:recipient.id,
   work:{source:clone(work.source),sourceHash:work.sourceHash}};
 }
 return null;
}
function validExchange(e){
 const sh=e.shared;if(sh===null)return true;
 const [a,b]=e.people;
 if(!obj(sh)||!['cooperated','conversed'].includes(e.decision.kind)||
  !e.decision.sharedLanguage||a.language!==b.language||
  ![a.id,b.id].includes(sh.sourceActorId)||
  ![a.id,b.id].includes(sh.receiverActorId)||
  sh.sourceActorId===sh.receiverActorId||!obj(sh.work)||
  !obj(sh.work.source)||sh.work.sourceHash!==hash(sh.work.source))
  return false;
 const donor=sh.sourceActorId===a.id?a:b,s=sh.work.source;
 return s.origin===Careers.WORK&&s.personId===donor.id.slice(9)&&
  s.personOriginHash===donor.originHash&&
  Number.isInteger(s.day)&&s.day<=e.day&&
  s.outcome?.success===true&&
  Number.isInteger(s.roll)&&s.roll>=1&&s.roll<=20&&
  Number.isInteger(s.dc)&&Number.isInteger(s.modifier)&&
  s.total===s.roll+s.modifier+(s.roll===20?5:s.roll===1?-5:0)&&
  s.margin===s.total-s.dc&&s.margin>=0&&
  typeof s.task?.method==='string'&&s.task?.method.length>0&&
  typeof s.task?.domain==='string'&&s.task?.domain.length>0;
}
function validateEvent(w,e){
 if(!obj(e)||e.origin!==ORIGIN||!Number.isInteger(e.day)||
  e.day<0||typeof e.location!=='string'||!Array.isArray(e.people)||
  e.people.length!==2||e.people[0].id>=e.people[1].id||
  e.people.some(a=>a.location!==e.location||!historical(w,a,e.day))||
  e.pairKey!==pairKey(...e.people)||
  JSON.stringify(decision(w.worldSeed,...e.people,e.day))!==
    JSON.stringify(e.decision)||!e.decision||
  !validExchange(e))return false;
 return true;
}
function apply(state,e,receiptHash){
 const [a,b]=e.people,id=e.pairKey,prev=state.relations[id]||
  {people:[a.id,b.id],contacts:0,regardA:0,regardB:0,
   lastMeetingDay:null,exchanges:0};
 const row={...prev,contacts:prev.contacts+1,lastMeetingDay:e.day,
  regardA:cap(prev.regardA+(e.decision.kind==='cooperated'?1:
   e.decision.kind==='disagreed'?-1:0)),
  regardB:cap(prev.regardB+(e.decision.kind==='cooperated'?1:
   e.decision.kind==='disagreed'?-1:0)),
  exchanges:prev.exchanges+(e.shared?1:0)};
 state.relations[id]=row;
 if(e.shared){
  const receiver=e.shared.receiverActorId;
  state.knowledge[receiver]||=[];
  if(!state.knowledge[receiver].some(k=>
   k.sourceWorkHash===e.shared.work.sourceHash)){
   state.knowledge[receiver].push({
    from:e.shared.sourceActorId,atDay:e.day,
    sourceWorkHash:e.shared.work.sourceHash,
    method:e.shared.work.source.task.method,
    domain:e.shared.work.source.task.domain,
    meetingReceiptHash:receiptHash,
    learnedCompetence:false,noSpellOrStage:true});
  }
 }
}
function verify(w,t){
 if(!obj(t)||t.version!==1||t.origin!==ORIGIN||
  t.source?.origin!==ORIGIN||t.source.worldSeed!==w.worldSeed||
  t.sourceHash!==hash(t.source)||!Number.isInteger(t.lastSixday)||
  t.lastSixday< -1||!Number.isInteger(t.attempts)||t.attempts<0||
  !Number.isInteger(t.anchorAttempts)||t.anchorAttempts<0||
  !Array.isArray(t.receipts)||t.receipts.length>LIMIT||
  t.attempts!==t.anchorAttempts+t.receipts.length||
  !validHash(t.anchorHash)||!validHash(t.headHash)||
  !obj(t.anchorState)||!obj(t.anchorState.relations)||
  !obj(t.anchorState.knowledge)||!obj(t.state)||
  !obj(t.state.relations)||!obj(t.state.knowledge))return false;
 const state=clone(t.anchorState);let previous=t.anchorHash;
 const encountered=new Set();
 for(const r of t.receipts){
  const e=r?.source;
  if(!e||r.hash!==hash(e)||e.previous!==previous||
   !validateEvent(w,e)||encountered.has(e.day+'|'+e.pairKey)||
   e.day>t.lastSixday)return false;
  encountered.add(e.day+'|'+e.pairKey);
  apply(state,e,r.hash);previous=r.hash;
 }
 return previous===t.headHash&&
  JSON.stringify(state)===JSON.stringify(t.state);
}
function ensure(w){
 if(w.independentContacts===undefined)w.independentContacts=seed(w);
 if(!verify(w,w.independentContacts))
  throw Error('A persistent person-to-person relationship or knowledge source is unverified');
 return w.independentContacts;
}
function record(w,t,people,day){
 const [a,b]=people.sort((x,y)=>x.id.localeCompare(y.id));
 const outcome=decision(w.worldSeed,a,b,day);
 if(!outcome)return null;
 const e={origin:ORIGIN,day,location:a.location,
  pairKey:pairKey(a,b),people:[clone(a),clone(b)],
  decision:outcome,shared:offeredWork(w,a,b,day,outcome.kind,t.state),
  previous:t.headHash};
 if(!validateEvent(w,e))throw Error('Contact lacks authentic independent choices and shared physical presence');
 // Source and independent decisions are validated before any mutation.
 // Updating one pair in place avoids copying the entire world social graph
 // on every ordinary encounter. Tick/checkpoint performs full replay.
 const r={source:e,hash:hash(e)};
 if(day<t.lastSixday)throw Error('A contact cannot be backdated');
 if(t.receipts.some(x=>x.source.day===day&&x.source.pairKey===e.pairKey))
  throw Error('The same social meeting cannot be resolved twice');
 apply(t.state,e,r.hash);
 t.headHash=r.hash;t.attempts++;t.receipts.push(r);
 if(t.receipts.length>LIMIT){
  const retired=t.receipts.shift();
  apply(t.anchorState,retired.source,retired.hash);
  t.anchorHash=retired.hash;t.anchorAttempts++;
 }
 t.lastSixday=day;
 return {receiptHash:r.hash,day,people:[a.id,b.id],
  outcome:outcome.kind,sharedOrdinaryMethod:!!e.shared,
  noAutomaticTeaching:true,noPlayerKnowledge:true};
}
function sixday(w,day){
 if(!Number.isInteger(day)||day<0)
  throw Error('Independent contact needs a real completed world sixday');
 const t=ensure(w);
 if(t.lastSixday>=day)return {meetings:0,exchanges:0,duplicate:true};
 // Group inexpensive identity/location candidates BEFORE costly career
 // provenance and work-shift verification. A lone worker cannot meet
 // another, so verifying their entire lifetime here would be wasted.
 const sites={};
 for(const p of Object.values(w.emergentPeople?.people||{})){
  if(!p||p.status!=='active'||p.lastTickDay!==day||p.fatigue>85||
   !p.shift||p.shift.fromDay>day||p.shift.throughDay<day)continue;
  const site=Emergent.siteFor(p.regionId);
  if(site&&p.shift.location===site)(sites[site]||=[]).push(p);
 }
 let meetings=0,exchanges=0;
 for(const [site,agents] of Object.entries(sites)){
  // One significant offscreen contact per person per sampled sixday is a
  // simulation budget, NOT a limit on how often people may actually meet.
  agents.sort((a,b)=>hash({day,site,id:a.actorId}).localeCompare(
   hash({day,site,id:b.actorId})));
  // Only some consequential interactions need an individual ledger.
  // Sublinear sampling prevents an ever-growing world population from
  // writing a fabricated complete census of every incidental conversation.
  // Hash order changes each real world tick so every individual remains
  // eligible; unsampled people still have their full independent lives.
  const sampledPairs=Math.min(Math.floor(agents.length/2),
   Math.max(1,Math.ceil(Math.sqrt(agents.length))));
  for(let i=0;i<sampledPairs*2;i+=2){
   const first=snapshot(w,agents[i],day),
    second=snapshot(w,agents[i+1],day);
   if(!first||!second)continue;
   const result=record(w,t,[first,second],day);
   if(result){meetings++;if(result.sharedOrdinaryMethod)exchanges++;}
  }
 }
 t.lastSixday=day;
 if(!verify(w,t))throw Error('Independent social history failed checkpoint replay');
 return {meetings,exchanges,duplicate:false};
}
module.exports={ORIGIN,LIMIT,seed,ensure,verify,sixday,
 _debug:{snapshot,decision,record,validateEvent,shiftValid,validExchange,unit}};
