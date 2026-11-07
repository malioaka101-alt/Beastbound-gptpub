'use strict';
// Causal ambitions for all 48 already-established NPC professionals.
// New practical goals arise from changing REAL local conditions; projects can
// be chosen, revised, abandoned, funded, failed or actually completed.
// An NPC's private plan is not automatically player knowledge.
const Crypto=require('node:crypto'),A=require('./atlas');
const SOURCE='Existing named professional independently responds to witnessed regional circumstances';
const sha=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const clamp=(n,lo=0,hi=100)=>Math.max(lo,Math.min(hi,n));
const TARGETS=Object.freeze({
 habitat_care:'Community habitat monitoring and erosion prevention',
 route_safety:'Practical passage and rescue-safety review',
 civic_audit:'Open local service-record review',
 teaching_access:'Independent practical skills and access workshop'
});
function seed(w){
 const people={};
 for(const n of Object.values(w.notables||{})){
  if(!A.P[n.polity]||!A.I[n.institution]||
     A.I[n.institution].polity!==n.polity||
     !['field specialist','civic representative'].includes(n.profession))
   throw Error('An adaptive ambition needs an existing real NPC and its established local employer');
  people[n.id]={actorId:n.id,polity:n.polity,organisationId:n.institution,
   personalGoal:n.life?.goal,decisionPhase:Math.abs(hashSmall(n.id))%4,
   focus:null,work:0,spent:0,blocked:0,
   successes:0,failures:0,pivots:0,history:[],lastDecision:null};
 }
 return {version:1,startedAtMonth:w.ticks.months,
  rngState:((w.worldSeed^0x42a7a915)>>>0)||0x7039f119,
  people,records:[],counter:0};
}
function hashSmall(s){
 let h=2166136261;
 for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}
 return h>>>0;
}
function ensure(w){
 if(w.adaptiveAmbitions===undefined)w.adaptiveAmbitions=seed(w);
 const t=w.adaptiveAmbitions;
 if(!t||t.version!==1||!t.people||!Array.isArray(t.records)||
    !Number.isInteger(t.counter))
  throw Error('World ambitions must have real persistent provenance');
 return t;
}
function random(t){
 let x=t.rngState>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 t.rngState=(x>>>0)||0x7039f119;
 return t.rngState/4294967296;
}
function options(w,n,org){
 const candidates=[],regions=A.regions.filter(r=>r.polity===n.polity),
  routes=A.tradeRoutes.filter(r=>r.a===n.polity||r.b===n.polity),
  host=w.countries[n.polity];
 if(n.profession==='field specialist'){
  for(const r of regions){
   const e=w.ecosystems[r.id];
   if(!e)continue;
   if(e.pressure>=38||e.quality<67){
    candidates.push({kind:'habitat_care',targetId:r.id,
      score:Math.round(e.pressure+Math.max(0,67-e.quality)+9),
      snapshot:{region:r.name,pressure:e.pressure,quality:e.quality}});
   }
  }
  for(const r of routes){
   const v=w.routes[r.id];
   if(!v)continue;
   if(v.disrupted||v.risk>=48||v.flow<34)
    candidates.push({kind:'route_safety',targetId:r.id,
      score:Math.round(v.risk+(v.disrupted?35:0)+(v.flow<34?12:0)),
      snapshot:{mode:r.mode,flow:v.flow,risk:v.risk,
       interrupted:v.disrupted,otherPolity:r.a===n.polity?r.b:r.a}});
  }
 }else if(host.legitimacy<62){
  candidates.push({kind:'civic_audit',targetId:n.polity,
    score:50+Math.round((62-host.legitimacy)*1.3),
    snapshot:{polity:A.P[n.polity].name,
      legitimacy:host.legitimacy,originalBody:A.I[n.institution].type}});
 }
 // People can seek improvement without a disaster; the goal originates in
 // an actual skilled person's opportunity, NOT an invisible universal tutor.
 if(n.professional.rank>=2&&org.capacity<78)
  candidates.push({kind:'teaching_access',targetId:n.institution,
   score:34+Math.floor((78-org.capacity)/2),
   snapshot:{institution:A.I[n.institution].name,
    capacity:org.capacity,skillRank:n.professional.rank}});
 const drive=hashSmall(n.id+':'+n.life?.goal);
 candidates.sort((a,b)=>{
  const sa=a.score+(a.kind==='teaching_access'&&drive%3===0?7:0),
    sb=b.score+(b.kind==='teaching_access'&&drive%3===0?7:0);
  return sb-sa||a.kind.localeCompare(b.kind)||a.targetId.localeCompare(b.targetId);
 });
 return candidates;
}
function record(w,t,p,day,kind,details,message,emit){
 const n=w.notables[p.actorId],id='ambition_'+(++t.counter);
 const evidence={id,day,month:w.ticks.months,actorId:n.id,
  name:n.name,polity:n.polity,profession:n.profession,
  employerId:p.organisationId,kind,source:SOURCE,details};
 const row={...evidence,hash:sha(evidence),
  publicText:message||null,releaseDay:message?day+8:null};
 t.records.push(row);if(t.records.length>300)t.records.splice(0,t.records.length-300);
 p.history.push({id,day,kind,hash:row.hash});
 if(p.history.length>20)p.history.splice(0,p.history.length-20);
 if(message&&typeof emit==='function')
  emit({day,region:n.polity,subject:'ambition:'+id,text:message,
   channel:'guild report',releaseDay:day+8,severity:'routine'});
 return row;
}
function abandon(w,t,p,day,why){
 const focus=p.focus;
 if(!focus)return;
 p.pivots++;
 p.lastDecision=why;
 record(w,t,p,day,'revised-plan',{
  previous:focus,unrecoveredCosts:p.spent,unfinishedWork:p.work,
  reason:why},null);
 delete w.notables[p.actorId].life.currentAmbition;
 p.focus=null;p.work=0;p.spent=0;p.blocked=0;
}
function choose(w,t,p,n,org,day){
 const available=options(w,n,org),best=available[0],current=p.focus,
  still=current&&available.find(x=>x.kind===current.kind&&x.targetId===current.targetId);
 if(current&&(!still||(best&&!((best.kind===current.kind&&best.targetId===current.targetId))&&
      best.score>still.score+24))){
  abandon(w,t,p,day,!still?
   'The need changed before any verified completion':
   'A more urgent genuine regional need redirected this independent worker');
 }
 if(!p.focus&&best){
  // Ambition is a choice; crises and proven talent make it more likely,
  // but no named NPC is assigned a compulsory destiny.
  const chance=best.score>=75?.88:best.score>=55?.72:.56;
  if(random(t)<chance){
   p.focus={kind:best.kind,targetId:best.targetId,
    startedMonth:w.ticks.months,initialContext:best.snapshot,
    purpose:TARGETS[best.kind]};
   p.lastDecision='began personally motivated practical work';
   n.life.currentAmbition={kind:best.kind,targetId:best.targetId,
    startedMonth:w.ticks.months};
   record(w,t,p,day,'new-plan',{
    focus:p.focus,personalGoal:p.personalGoal,workingFor:p.organisationId},null);
  }
 }
 return p.focus;
}
function act(w,t,p,day,emit){
 const n=w.notables[p.actorId],org=w.institutions[p.organisationId],
  host=w.countries[p.polity];
 if(!n||!org||!host||n.institution!==p.organisationId)
  throw Error('An independent NPC cannot perform research for a made-up employer');
 const focus=choose(w,t,p,n,org,day);
 if(!focus)return;
 if(org.status!=='active'||org.funds<14||n.injuryMonths>0){
  p.blocked++;
  if(p.blocked>=2&&p.work){
   p.work--;p.lastDecision='real interrupted work loses preparation';
  }
  if(p.blocked>=4){
   abandon(w,t,p,day,'Repeated real illness or institutional closure exhausted this attempt');
   delete n.life.currentAmbition;
  }
  return;
 }
 p.blocked=0;
 // Institution/independent professional must actually afford the field kit.
 const cost=org.funds>=40?3:2;
 org.funds-=cost;p.work++;p.spent+=cost;
 if(p.work<3)return;
 const {kind,targetId}=focus,before={
  funds:org.funds+cost,capacity:org.capacity,reputation:org.reputation,
  skillRank:n.professional.rank,stability:host.stability,
  goalContext:focus.initialContext
 };
 const local=kind==='habitat_care'?w.ecosystems[targetId]:
  kind==='route_safety'?w.routes[targetId]:
  kind==='civic_audit'?w.countries[targetId]:org;
 if(!local){
  abandon(w,t,p,day,'Real target no longer exists');
  return;
 }
 const roll=1+Math.floor(random(t)*20),dc=14,
  modifier=n.professional.rank*2+(org.capacity>=60?2:0)+
   (host.stability>=55?1:0)-(org.funds<18?2:0),
  success=roll===20||(roll!==1&&roll+modifier>=dc);
 const beforeTarget=kind==='habitat_care'?
  {pressure:local.pressure,quality:local.quality}:
  kind==='route_safety'?{risk:local.risk,flow:local.flow,disrupted:local.disrupted}:
  kind==='civic_audit'?{legitimacy:local.legitimacy,orgReputation:org.reputation}:
  {capacity:org.capacity,reputation:org.reputation};
 let changed=false;
 if(success){
  if(kind==='habitat_care'){
   local.pressure=clamp(local.pressure-4);
   local.quality=clamp(local.quality+2);
   changed=local.pressure!==beforeTarget.pressure||local.quality!==beforeTarget.quality;
  }else if(kind==='route_safety'){
   local.risk=clamp(local.risk-4);changed=local.risk!==beforeTarget.risk;
   // A worker cannot overturn actual wars, embargoes or ship closures.
  }else if(kind==='civic_audit'){
   org.reputation=clamp(org.reputation+2);
   if(['civil council','civil court','ministry','beast government','beast civil service'].includes(A.I[n.institution].type))
    local.legitimacy=clamp(local.legitimacy+1);
   changed=org.reputation!==beforeTarget.orgReputation||
    local.legitimacy!==beforeTarget.legitimacy;
  }else{
   org.capacity=clamp(org.capacity+2);
   org.reputation=clamp(org.reputation+1);
   changed=org.capacity!==beforeTarget.capacity||org.reputation!==beforeTarget.reputation;
  }
  p.successes++;p.lastDecision='limited practical goal completed with independently tested results';
 }else{
  p.failures++;p.lastDecision='attempt failed without solving the documented need';
 }
 const afterTarget=kind==='habitat_care'?
  {pressure:local.pressure,quality:local.quality}:
  kind==='route_safety'?{risk:local.risk,flow:local.flow,disrupted:local.disrupted}:
  kind==='civic_audit'?{legitimacy:local.legitimacy,orgReputation:org.reputation}:
  {capacity:org.capacity,reputation:org.reputation};
 const details={focus,originalPurpose:p.personalGoal,realEmployerId:p.organisationId,
  amountSpent:p.spent,workSessions:p.work,roll,modifier,dc,success,
  before,beforeTarget,afterTarget,changed};
 const area=kind==='habitat_care'?A.R[targetId]?.name:
  kind==='route_safety'?A.tradeRoutes.find(x=>x.id===targetId)?.mode:
  kind==='civic_audit'?A.P[targetId]?.name:A.I[targetId]?.name;
 const publicMessage=success?
  n.name+' completes a funded, tested '+TARGETS[kind].toLowerCase()+
  ' effort concerning '+area+'. This is a limited practical result, not a new magical technique or legal ruling.':
  n.name+' reports that their funded '+TARGETS[kind].toLowerCase()+
  ' attempt in '+area+' did not meet the practical verification standard.';
 record(w,t,p,day,success?'verified-effort':'failed-effort',details,
  success?publicMessage:p.failures%2===0?publicMessage:null,emit);
 if(success){
  n.memory.push({day,event:'Completed documented '+TARGETS[kind].toLowerCase()+' at '+area});
  if(n.memory.length>15)n.memory.splice(0,n.memory.length-15);
 }
 delete n.life.currentAmbition;
 p.focus=null;p.work=0;p.spent=0;p.blocked=0;
}
function month(w,day,emit){
 const t=ensure(w);
 for(const p of Object.values(t.people)){
  if((w.ticks.months+p.decisionPhase)%4!==0)continue;
  act(w,t,p,day,emit);
 }
 return t;
}
function visible(s,w){
 const local=A.R[A.LOCATION_REGION[s.world.location]]?.polity,
  now=Math.floor(s.world.minutes/1440),t=w.adaptiveAmbitions;
 if(!local||!t)return {polity:A.P[local]?.name||null,publicDeeds:[],
   note:'Unpublished NPC ambitions, research plans, costs and failed attempts are not public.'};
 const items=t.records.filter(x=>x.polity===local&&
  x.publicText&&x.releaseDay<=now&&
  w.chronicle?.some(e=>e.subject==='ambition:'+x.id&&
   e.region===local&&e.day===x.day&&e.releaseDay===x.releaseDay&&e.text===x.publicText)&&
  x.hash===sha({id:x.id,day:x.day,month:x.month,actorId:x.actorId,
   name:x.name,polity:x.polity,profession:x.profession,
   employerId:x.employerId,kind:x.kind,source:x.source,details:x.details})
 ).slice(-12).map(x=>({day:x.day,person:x.name,kind:x.kind,
  notice:x.publicText,polity:A.P[x.polity].name}));
 return {polity:A.P[local].name,publicDeeds:items,
  note:'Only genuinely published local professional deeds; private goals and unverified hypotheses remain sealed.'};
}
module.exports={SOURCE,TARGETS,seed,ensure,options,month,visible,
 _debug:{random,choose,act,record,abandon}};
