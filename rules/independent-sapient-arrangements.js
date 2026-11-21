'use strict';
// Independent witnessed sapient cooperation, separate from proposal
// interest, magical bonds, civic recognition and actual paid performance.
const Crypto=require('node:crypto'),E=require('../engine'),Core=require('./core'),
 Social=require('./beast-social-arrangements'),Agency=require('./beast-agency'),
 People=require('../world/emergent-people'),Presence=require('../world/person-presence'),
 Person=require('../world/sapient-beast-persons'),Realm=require('../world/simulation'),
 Proposal=require('./independent-sapient-proposal-discussions');
const ORIGIN='source-witnessed-bilateral-sapient-arrangement-v1',
 WITNESS='witnessed-independent-sapient-final-terms-v1',
 REVIEW='witnessed-independent-sapient-continuation-review-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 txt=(v,min=24)=>typeof v==='string'&&v.trim().length>=min&&v.length<=900;
function humanChance(personality,fatigue){
 const base={curious:.64,steady:.60,independent:.43,reserved:.35}[personality];
 if(!Number.isFinite(base)||!Number.isInteger(fatigue)||fatigue<0||fatigue>100)
  throw Error('An established individual decision condition is required');
 // Same existing bounded participation propensity, separately applied
 // to these precise comprehended terms; never public-entry consent reused.
 return Math.max(.07,Math.min(.76,base-fatigue/300));
}
function humanChoice(p,witnessHash){
 const rngBefore=p.rngState,personality=p.personality,fatigue=p.fatigue,
  chance=humanChance(personality,fatigue),draw=People._debug.draw(p);
 return {rngBefore,rngAfter:p.rngState,personality,fatigue,chance,witnessHash,
  accepted:fatigue<76&&draw<chance};
}
function verifyHuman(q,witnessHash){
 if(!q||!Number.isInteger(q.rngBefore)||q.rngBefore<1||
  q.witnessHash!==witnessHash)return false;
 try{return eq(q,humanChoice({rngState:q.rngBefore,
  personality:q.personality,fatigue:q.fatigue},witnessHash));}catch{return false;}
}
function outcome(q,review=false){
 if(!q.humanChoice.accepted)return review?'withdrawn-by-human':'human-declined';
 if(q.beastChoice.outcome==='accepted')return review?'resumed':'accepted';
 if(q.beastChoice.outcome==='countered')return review?'paused':'beast-proposed-changes';
 return review?'withdrawn-by-beast':'beast-declined';
}
function safe(b){
 return !!b&&b.condition>=55&&Number.isFinite(b.condition)&&
  Number.isFinite(b.needs?.hunger)&&b.needs.hunger<75&&
  Number.isFinite(b.needs?.fatigue)&&b.needs.fatigue<75&&
  !/hostile|agitated|terrified|panicked|fleeing|desperate/i.test(String(b.mood))&&
  !['captured','coerced','imprisoned','forced'].includes(String(b.relationship).toLowerCase());
}
function validWitness(q,p,b,review=false){
 const d=q.witness?.details;
 return q.witness?.type==='story'&&txt(q.witness.text,16)&&
  q.witness.text.includes(p.name)&&
  q.witness.day===Math.floor(q.minute/1440)+1&&
  q.witness.time===E.clock({world:{minutes:q.minute}})&&
  d?.origin===(review?REVIEW:WITNESS)&&d.actorId===p.actorId&&d.beastId===b.id&&
  d.location===q.site&&d.minute===q.minute&&d.proposalHash===q.proposalHash&&
  d.arrangementHash===(review?q.arrangementHash:undefined)&&
  d.contactHash===hash(q.contact)&&eq(d.terms,q.terms)&&
  Social.termsValid(q.terms)&&q.terms.beastId===b.id&&
  txt(d.comprehension)&&txt(d.communication,5)&&
  txt(d.rightToRefuse)&&d.noAssumedSharedLanguage===true&&
  d.noMagicalPromise===true;
}
function verifyDecision(s,p,b,q,review=false){
 const sh=q?.shift;
 if(!q||q.actorId!==p.actorId||q.personOriginHash!==p.originHash||
  q.beastId!==b.id||q.beastOriginHash!==b.sapientLife.sourceHash||
  !Number.isInteger(q.minute)||q.minute>s.world.minutes||
  q.day!==Math.floor(q.minute/1440)||q.contact?.willingness!==true||
  q.contact.type!=='personally-witnessed-contact'||q.contact.location!==q.site||
  !Number.isInteger(q.contact.minute)||q.contact.minute>q.minute||
  q.minute-q.contact.minute>60||
  (q.contact.meetingHash!==b.sapientLife.source.encounterHash&&
   !b.sapientLife.triedEncounters.includes(q.contact.meetingHash))||
  !sh||sh.hash!==hash(Object.fromEntries(Object.entries(sh).filter(([k])=>k!=='hash')))||
  sh.actorId!==p.actorId||sh.originHash!==p.originHash||sh.location!==q.site||
  sh.scheduledAtDay!==sh.fromDay||sh.throughDay-sh.fromDay!==5||
  sh.fromDay>q.day||sh.throughDay<q.day||
  q.witnessHash!==hash(q.witness)||!validWitness(q,p,b,review)||
  !verifyHuman(q.humanChoice,q.witnessHash)||
  q.noMagicOwnershipOrCompelledService!==true||
  q.noExecutedWorkPaymentOrCivicRecognition!==true)return false;
 const retained=b.sapientLife.history.find(x=>x.type==='personally-witnessed-contact'&&
  x.meetingHash===q.contact.meetingHash);
 if(retained&&!eq(retained,q.contact))return false;
 if(!retained&&b.sapientLife.history.length&&q.contact.day>=b.sapientLife.history[0].day)return false;
 if(q.humanChoice.accepted){
  const d=q.beastChoice;
  if(!d||d.disposition!==Agency.profile(s,b).disposition||
   !Number.isInteger(d.rngBefore)||d.rngBefore<1||
   !eq(d,Social.sapientChoice({rngState:d.rngBefore},d.disposition)))return false;
 }else if(q.beastChoice!==null)return false;
 return q.outcome===outcome(q,review);
}
function statusAt(row,minute){
 const last=row.events.at(-1)?.source.outcome||row.source.outcome;
 if(['accepted','resumed','paused'].includes(last)&&row.endMinute!==null&&minute>=row.endMinute)
  return 'expired';
 return last==='resumed'?'accepted':last;
}
function verify(s,p){
 const rows=p?.originalSapientArrangements;
 if(rows===undefined)return true;
 if(!Array.isArray(rows)||rows.length>180||!Proposal.verify(s,p))return false;
 const used=new Set(),witnesses=new Set();let previousMinute=-1;
 for(const row of rows){
  const q=row?.source,b=s.beasts?.[q?.beastId],
   proposal=p.originalSapientProposalDiscussions?.find(x=>x.seal===q?.proposalHash);
  if(!q||q.origin!==ORIGIN||row.seal!==hash(q)||!proposal||
   proposal.source.outcome!=='mutually-interested'||
   proposal.source.beastId!==q.beastId||proposal.source.minute>q.minute||
   q.witnessHash===proposal.source.witnessHash||
   used.has(q.proposalHash)||witnesses.has(q.witnessHash)||
   q.minute<previousMinute||!b?.sapientLife||!Person.verify(b)||
   !verifyDecision(s,p,b,q)||
   row.endMinute!==(q.outcome==='accepted'&&q.terms.durationDays?
    q.minute+q.terms.durationDays*1440:null)||
   !Array.isArray(row.events)||row.events.length>180)return false;
  used.add(q.proposalHash);witnesses.add(q.witnessHash);previousMinute=q.minute;
  let status=q.outcome,last=q.minute,head=row.seal,reviewDay=q.day-1;
  for(const ev of row.events){
   const v=ev?.source;
   if(!v||v.origin!==ORIGIN||ev.seal!==hash(v)||v.previous!==head||
    !['accepted','paused','resumed'].includes(status)||
    v.arrangementHash!==row.seal||v.minute<last||
    !Number.isInteger(v.minute)||v.minute>s.world.minutes||
    (row.endMinute!==null&&v.minute>=row.endMinute))return false;
   if(v.kind==='welfare'){
    const h=v.condition;
    if(status==='paused'||v.outcome!=='paused'||!h||
     ![h.condition,h.hunger,h.fatigue].every(n=>Number.isFinite(n)&&n>=0&&n<=100)||
     !(h.condition<45||h.hunger>=80||h.fatigue>=85||
      ['captured','coerced','imprisoned','forced'].includes(h.relationship)))return false;
   }else{
    if(v.kind!=='review'||v.proposalHash!==q.proposalHash||
     v.day<=reviewDay||witnesses.has(v.witnessHash)||!eq(v.terms,q.terms)||
     !verifyDecision(s,p,b,v,true))return false;
    reviewDay=v.day;witnesses.add(v.witnessHash);
   }
   status=v.outcome;last=v.minute;head=ev.seal;
  }
 }
 return true;
}
function decide(s,{actorId,beastId,witnessIndex,...extra}={},review=false){
 if(Object.keys(extra).length||typeof actorId!=='string'||typeof beastId!=='string'||
  !Number.isInteger(witnessIndex)||witnessIndex<0||witnessIndex>=s.log.length)
  throw Error('Actual independent participants and witnessed terms only; no assigned consent');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  b=s.beasts?.[beastId],minute=s.world.minutes,day=Math.floor(minute/1440),
  site=s.world.location,present=p&&Presence.resolve(w,actorId,site,day,minute%1440),
  wit=structuredClone(s.log[witnessIndex]),d=wit?.details,
  proposal=p?.originalSapientProposalDiscussions?.find(x=>x.seal===d?.proposalHash),
  contact=b?.sapientLife?.history?.filter(x=>x.type==='personally-witnessed-contact'&&
   x.willingness===true&&x.location===site&&x.minute<=minute&&minute-x.minute<=60).at(-1),
  rows=p?.originalSapientArrangements||[],
  existing=rows.find(x=>x.seal===d?.arrangementHash);
 if(!p||p.actorId!==actorId||!People.verify(w,p)||!present?.presence||
  p.status!=='active'||p.ageBand!=='adult, exact birthday not established'||
  !b?.sapientLife||!Person.verify(b)||b.away===true||b.location!==site||
  b.owner||s.player.partnerIds?.includes(b.id)||s.battle||s.encounter?.threat||
  s.encounter?.beastId!==beastId||!safe(b)||!contact||
  !proposal||proposal.source.outcome!=='mutually-interested'||
  proposal.source.beastId!==beastId||proposal.source.minute>minute||!verify(s,p))
  throw Error('Real co-present willing persons and an original mutually interested proposal are required');
 const q={origin:ORIGIN,actorId,personOriginHash:p.originHash,
  beastId,beastOriginHash:b.sapientLife.sourceHash,minute,day,site,
  proposalHash:proposal.seal,...(review?{kind:'review',arrangementHash:existing?.seal,
   previous:existing?.events.at(-1)?.seal||existing?.seal}:{}),
  shift:structuredClone(present.presence),contact:structuredClone(contact),
  witness:wit,witnessHash:hash(wit),terms:structuredClone(d?.terms),
  noMagicOwnershipOrCompelledService:true,noExecutedWorkPaymentOrCivicRecognition:true};
 if(!validWitness(q,p,b,review)||q.witnessHash===proposal.source.witnessHash)
  throw Error('Separate current informed final terms and revocable comprehension witness required');
 if(review){
  if(!existing||existing.source.proposalHash!==proposal.seal||
   !['accepted','paused'].includes(statusAt(existing,minute))||
   !eq(q.terms,existing.source.terms)||existing.events.length>=180||
   existing.events.some(x=>x.source.kind==='review'&&x.source.day===day))
   throw Error('A genuine open same-terms arrangement and unused review day are required');
 }else if(rows.length>=180||rows.some(x=>x.source.proposalHash===proposal.seal))
  throw Error('The original proposal has already received its separate final decision');
 q.humanChoice=humanChoice(p,q.witnessHash);
 q.beastChoice=q.humanChoice.accepted?Social.sapientChoice(b.sapientLife,Agency.profile(s,b).disposition):null;
 q.outcome=outcome(q,review);
 const seal=hash(q);
 if(review)existing.events.push({source:q,seal});
 else p.originalSapientArrangements=[...rows,{source:q,seal,events:[],
  endMinute:q.outcome==='accepted'&&q.terms.durationDays?minute+q.terms.durationDays*1440:null}];
 if(!verify(s,p))throw Error('Independent final agreement source failed replay');
 Core.event(s,'story',p.name+' and the sapient person resolve the witnessed voluntary terms without a magical contract.',{
  origin:ORIGIN,actorId,beastId,outcome:q.outcome,sourceHash:seal});
 return {observedOutcome:q.outcome,mutuallyAccepted:['accepted','resumed'].includes(q.outcome),
  sourceHash:review?existing.seal:seal,noMagicOwnershipOrCompelledService:true,
  noExecutedWorkPaymentOrCivicRecognition:true};
}
function sixday(s,days=[]){
 if(!days.length)return;
 for(const p of Object.values(Realm.peek(s)?.emergentPeople?.people||{})){
  if(!p.originalSapientArrangements)continue;
  if(!verify(s,p))throw Error('Independent sapient arrangement history altered');
  for(const row of p.originalSapientArrangements){
   if(statusAt(row,s.world.minutes)!=='accepted'||row.events.length>=180)continue;
   const b=s.beasts[row.source.beastId],h={condition:b.condition,hunger:b.needs.hunger,
    fatigue:b.needs.fatigue,relationship:String(b.relationship).toLowerCase()};
   if(!(h.condition<45||h.hunger>=80||h.fatigue>=85||
    ['captured','coerced','imprisoned','forced'].includes(h.relationship)))continue;
   const q={origin:ORIGIN,kind:'welfare',arrangementHash:row.seal,
    minute:s.world.minutes,previous:row.events.at(-1)?.seal||row.seal,
    condition:h,outcome:'paused'};
   row.events.push({source:q,seal:hash(q)});
  }
  if(!verify(s,p))throw Error('Actual welfare review failed arrangement replay');
 }
}
function privateStatus(s,p){
 if(!verify(s,p))throw Error('Original independent sapient arrangements were altered');
 return (p.originalSapientArrangements||[]).map(row=>({
  beastId:row.source.beastId,sourceHash:row.seal,terms:structuredClone(row.source.terms),
  status:statusAt(row,s.world.minutes),endMinute:row.endMinute,
  noMagicalBondOrExecutedPayment:true}));
}
module.exports={ORIGIN,WITNESS,REVIEW,verify,humanChoice,verifyHuman,statusAt,safe,accept:(s,p)=>decide(s,p),
 review:(s,p)=>decide(s,p,true),sixday,privateStatus};
