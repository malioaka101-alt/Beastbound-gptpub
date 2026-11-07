'use strict';
// Individual professional relationships arise from actual public deeds.
// Separate people choose whether to cooperate, compare methods, or abstain.
// Cooperation needs BOTH people's independent consent and actual funding.
// A comparison is a test of a method, NOT invented malice or family feud.
const Crypto=require('node:crypto'),Atlas=require('./atlas'),Amb=require('./adaptive-ambitions');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const clamp=(n,lo=0,hi=100)=>Math.max(lo,Math.min(hi,n));
const SOURCE='Two existing independent professionals respond to a genuinely published, source-verified local practical deed';
const FOCUS=new Set(['habitat_care','route_safety','civic_audit','teaching_access']);
const GROUPS=Object.freeze(Atlas.polities.map(p=>{
 const civic=p.id+'_civic',field=p.id+'_field';
 return Object.freeze({polity:p.id,civic,field,id:p.id+'_peer_pair'});
}));
function baseEvent(r){return {
 id:r.id,day:r.day,month:r.month,actorId:r.actorId,name:r.name,
 polity:r.polity,profession:r.profession,employerId:r.employerId,
 kind:r.kind,source:r.source,details:r.details
};}
function sourced(w,r,day){
 if(!r||r.kind!=='verified-effort'||r.source!==Amb.SOURCE||
   !FOCUS.has(r.details?.focus?.kind)||r.details.success!==true||
   r.details.changed!==true||
   !Number.isInteger(r.day)||r.day<0||
   !Number.isInteger(r.releaseDay)||r.releaseDay>day||
   !Number.isInteger(r.details.roll)||r.details.roll<1||r.details.roll>20||
   !Number.isFinite(r.details.modifier)||!Number.isInteger(r.details.dc)||
   !(r.details.roll===20||(r.details.roll!==1&&
    r.details.roll+r.details.modifier>=r.details.dc))||
   r.hash!==hash(baseEvent(r)))return false;
 return !!w.chronicle?.some(e=>e.subject==='ambition:'+r.id&&
   e.region===r.polity&&e.day===r.day&&
   e.releaseDay===r.releaseDay&&e.text===r.publicText&&
   e.channel==='guild report');
}
function seed(w){
 const pairs={};
 for(const g of GROUPS){
  const a=w.notables?.[g.civic],b=w.notables?.[g.field];
  if(!a||!b||a.polity!==g.polity||b.polity!==g.polity||
     a.id===b.id)throw Error('A professional pair must consist of two existing distinct people in one actual polity');
  pairs[g.id]={pairId:g.id,polity:g.polity,people:[a.id,b.id],
   lastSeen:0,pending:null,collaborations:0,comparisons:0,
   failedWork:0,trust:0,contrast:0,lastPublicKind:null,
   lastOutcome:null,history:[]};
 }
 return {version:1,startedAtSixday:w.ticks.sixdays,
  rngState:((w.worldSeed^0x6924c73a)>>>0)||0x304e64a1,
  pairs,records:[],counter:0};
}
function ensure(w){
 if(w.professionalPeers===undefined)w.professionalPeers=seed(w);
 const t=w.professionalPeers;
 if(!t||t.version!==1||!t.pairs||!Array.isArray(t.records)||
  !Number.isInteger(t.counter))
  throw Error('Professional relations need a real persistent individual witness ledger');
 return t;
}
function random(t){
 let x=t.rngState>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 t.rngState=(x>>>0)||0x304e64a1;
 return t.rngState/4294967296;
}
function organisation(w,n){
 return w.agentInitiatives?.entrants?.[n.independentPracticeId]||
  w.institutions?.[n.institution];
}
function record(w,t,p,day,kind,details,notice,emit){
 const id='peers_'+(++t.counter),one=w.notables[p.people[0]],two=w.notables[p.people[1]];
 const basis={id,day,polity:p.polity,firstId:one.id,firstName:one.name,
  secondId:two.id,secondName:two.name,kind,source:SOURCE,details};
 const row={...basis,hash:hash(basis),notice:notice||null,
  releaseDay:notice?day+8:null};
 t.records.push(row);if(t.records.length>250)t.records.splice(0,t.records.length-250);
 p.history.push({id,day,kind,hash:row.hash});
 if(p.history.length>22)p.history.splice(0,p.history.length-22);
 if(notice&&typeof emit==='function')emit({
  day,region:p.polity,subject:'professional-peers:'+id,text:notice,
  channel:'guild report',releaseDay:day+8,severity:'routine'});
 return row;
}
function sourceSnapshot(w,r){
 return {sourceId:r.id,sourceHash:r.hash,sourceDay:r.day,
  sourceReleaseDay:r.releaseDay,kind:r.details.focus.kind,
  targetId:r.details.focus.targetId,
  realAuthorId:r.actorId,realOrganisationId:r.employerId};
}
function initiate(w,t,p,day,emit){
 const ledger=w.adaptiveAmbitions?.records||[],g=p.people;
 const sample=ledger.filter(r=>r.polity===p.polity&&
  g.includes(r.actorId)&&r.kind==='verified-effort'&&sourced(w,r,day))
  .sort((a,b)=>Number(a.id.split('_').at(-1))-Number(b.id.split('_').at(-1)));
 const next=sample.find(r=>Number(r.id.split('_').at(-1))>p.lastSeen);
 if(!next)return;
 p.lastSeen=Number(next.id.split('_').at(-1));
 const author=w.notables[next.actorId],
  peer=w.notables[g.find(x=>x!==author.id)];
 if(!peer||!author||peer.polity!==author.polity)return;
 const draw=random(t);
 // All three are genuinely plausible: a joint working offer, independent
 // professional comparison, or an uninterested colleague.
 const reaction=draw<.43?'joint_offer':draw<.78?'independent_comparison':'no_action';
 const source=sourceSnapshot(w,next);
 if(reaction==='no_action'){
  p.lastOutcome='Colleague elected not to respond to published work';
  record(w,t,p,day,'no-engagement',{source,peerId:peer.id},null,emit);
  return;
 }
 p.pending={kind:reaction,source,authorId:author.id,peerId:peer.id,
  offeredDay:day,stage:reaction==='joint_offer'?'awaiting_reply':'checking',
  work:0,spent:0,blocked:0,choices:[]};
 record(w,t,p,day,reaction==='joint_offer'?'work-invitation':'independent-review-started',
  {source,authorId:author.id,peerId:peer.id,
   consentRequired:reaction==='joint_offer'},null,emit);
}
function reply(w,t,p,day,emit){
 const q=p.pending;
 if(!q||q.stage!=='awaiting_reply'||day-q.offeredDay<6)return;
 const author=w.notables[q.authorId],peer=w.notables[q.peerId],
  a=organisation(w,author),b=organisation(w,peer);
 if(!author||!peer||!a||!b)throw Error('An actual pair cannot become an invented participant');
 const choice=random(t),available=a.status==='active'&&b.status==='active'&&
  a.funds>=14&&b.funds>=14&&!author.injuryMonths&&!peer.injuryMonths;
 const accept=available&&choice<.63;
 q.choices.push({actorId:author.id,day,choice:accept?'willing':'declined',
  independentChoice:true,available});
 record(w,t,p,day,'personal-response',{source:q.source,
  proposedBy:q.peerId,replyBy:author.id,
  decision:accept?'willing':'declined',available},null,emit);
 if(!accept){
  p.lastOutcome='A personal request to cooperate was declined; no professional feud followed';
  p.pending=null;
 }else q.stage='checking';
}
function undertake(w,t,p,day,emit){
 const q=p.pending;
 if(!q||q.stage!=='checking')return;
 const author=w.notables[q.authorId],peer=w.notables[q.peerId],
  actor=q.kind==='joint_offer'?[author,peer]:[peer];
 const institutions=actor.map(n=>organisation(w,n));
 if(actor.some(x=>!x)||institutions.some(x=>!x))
  throw Error('A research result cannot be recorded for nonexistent participants');
 const costs=new Map();
 for(const org of institutions)costs.set(org,(costs.get(org)||0)+2);
 const available=actor.every(n=>!n.injuryMonths)&&
  [...costs].every(([org,cost])=>org.status==='active'&&org.funds>=cost+10);
 if(!available){
  q.blocked++;
  if(q.blocked>=2&&q.work)q.work--;
  if(q.blocked>=4){
   record(w,t,p,day,'attempt-abandoned',{
    source:q.source,kind:q.kind,actualWork:q.work,
    lostFunding:q.spent,reason:'real institutional closure, illness, or insufficient resources'},null,emit);
   p.lastOutcome='Joint or comparative work stalled without any fabricated achievement';
   p.pending=null;
  }
  return;
 }
 q.blocked=0;
 const before=institutions.map((org,i)=>({participantId:actor[i].id,
  orgId:org.id||actor[i].institution,funds:org.funds,capacity:org.capacity,
  reputation:org.reputation,skillRank:actor[i].professional.rank}));
 for(const [org,cost] of costs)org.funds-=cost;
 q.spent+=[...costs.values()].reduce((a,b)=>a+b,0);
 q.work++;
 if(q.work<3)return;
 const score=actor.reduce((a,n)=>a+n.professional.rank,0),
  modifier=score+(institutions.every(org=>org.capacity>=60)?2:0)+
   (w.countries[p.polity].stability>=55?1:0)-
   (institutions.some(org=>org.funds<18)?2:0),
  roll=1+Math.floor(random(t)*20),dc=q.kind==='joint_offer'?13:15,
  success=roll===20||(roll!==1&&roll+modifier>=dc);
 const originalSource=q.source,mode=q.kind;
 const changes=[];
 if(success){
  // A genuine bounded locally tested comparison or joint review improves
  // one relevant training practice, not the source person's magic skills.
  const target=mode==='joint_offer'?institutions:institutions.slice(-1);
  for(const org of new Set(target)){
   const prior=org.capacity;
   org.capacity=clamp(org.capacity+1);
   changes.push({orgId:org.id||null,beforeCapacity:prior,afterCapacity:org.capacity});
  }
  if(mode==='joint_offer'){
   p.collaborations++;p.trust=Math.min(5,p.trust+1);
   p.lastPublicKind='collaborative';
  }else{
   p.comparisons++;p.contrast=Math.min(5,p.contrast+1);
   p.lastPublicKind='comparative';
  }
 }else p.failedWork++;
 const details={source:originalSource,kind:mode,
  participants:actor.map(n=>n.id),
  separateConsent:q.choices,paidSessions:q.work,totalCost:q.spent,
  employerStatesBefore:before,roll,modifier,dc,success,
  employerCapacityChanges:changes,
  cooperationNotGuaranteed:mode==='joint_offer'};
 const message=success?
  (mode==='joint_offer'?
    author.name+' and '+peer.name+' publish a jointly funded practical verification of earlier local work. Both agreed to the limited study; neither accepted other personal obligations.':
    peer.name+' independently validates an alternative practical comparison of work published by '+author.name+'. Both methods remain legitimate; disagreement is professional, not personal hostility.'):
  (mode==='joint_offer'?
    author.name+' and '+peer.name+' publicly report that their independently funded joint study did not pass a practical verification.':
    peer.name+' reports an unsuccessful independent comparison of the previously published method by '+author.name+'.');
 record(w,t,p,day,success?(mode==='joint_offer'?'verified-cooperation':'verified-alternative'):'failed-peer-review',
  details,message,emit);
 p.lastOutcome=success?'Independent professional work was verified':'Real paid work did not pass verification';
 if(success){
  for(const n of actor){
   n.memory.push({day,event:mode==='joint_offer'?
    'Completed funded joint vocational research with an independently consenting colleague':
    'Completed independent practical comparison of a previously published method'});
   if(n.memory.length>15)n.memory.splice(0,n.memory.length-15);
  }
 }
 p.pending=null;
}
function tick(w,day,emit){
 const t=ensure(w);
 for(const p of Object.values(t.pairs)){
  if(p.pending?.stage==='awaiting_reply')reply(w,t,p,day,emit);
  else if(p.pending?.stage==='checking')undertake(w,t,p,day,emit);
  if(!p.pending)initiate(w,t,p,day,emit);
 }
 return t;
}
function visible(s,w){
 const local=Atlas.R[Atlas.LOCATION_REGION[s.world.location]]?.polity,
  day=Math.floor(s.world.minutes/1440),t=w.professionalPeers;
 if(!local||!t)return {polity:Atlas.P[local]?.name||null,
  verifiedPeerWork:[],note:'Unpublished personal relationships, intentions and invitations are not common knowledge.'};
 const found=t.records.filter(r=>r.polity===local&&r.notice&&r.releaseDay<=day&&
  w.chronicle?.some(e=>e.subject==='professional-peers:'+r.id&&
   e.day===r.day&&e.region===local&&e.releaseDay===r.releaseDay&&
   e.channel==='guild report'&&e.text===r.notice)&&
  r.hash===hash({id:r.id,day:r.day,polity:r.polity,
   firstId:r.firstId,firstName:r.firstName,secondId:r.secondId,
   secondName:r.secondName,kind:r.kind,source:r.source,details:r.details}))
  .slice(-12).map(r=>({day:r.day,people:[r.firstName,r.secondName],
   kind:r.kind,notice:r.notice}));
 return {polity:Atlas.P[local].name,verifiedPeerWork:found,
  note:'Only independent, source-supported published professional work; private trust, consent requests, unpublished plans and finances remain sealed.'};
}
module.exports={SOURCE,GROUPS,baseEvent,sourced,seed,ensure,tick,visible,
 _debug:{random,initiate,reply,undertake,record}};
