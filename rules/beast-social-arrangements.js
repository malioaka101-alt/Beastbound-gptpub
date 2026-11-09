'use strict';
// #08. An original human–beast agreement belongs to that ACTUAL beast.
// Neither describing a service nor signing these social terms creates a
// magical contract, mastery, animal ownership, friendship or affection.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),Bond=require('./bonds'),
 Agency=require('./beast-agency'),Person=require('../world/sapient-beast-persons');
const ORIGIN='source-witnessed-revocable-beast-social-arrangement-v1',
 DISCUSSION='personally-witnessed-beast-terms-discussion-v1',
 DISPUTE='personally-witnessed-beast-arrangement-dispute-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const text=(x,min=10,max=900)=>typeof x==='string'&&x.trim().length>=min&&x.trim().length<=max;
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{2,75}$/.test(x);
const int=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
const keys=(v,accepted)=>v&&typeof v==='object'&&!Array.isArray(v)&&
 Object.keys(v).every(k=>accepted.includes(k));
function personKind(s,b){
 if(!b||!E.SPECIES[b.species])throw Error('A real existing individually identified beast is required');
 if(b.sapience>=3||E.SPECIES[b.species].intelligence==='sapient'){
  if(!b.sapientLife||!Person.verify(b))
   throw Error('Sapient social relations require actual source-proven personal contact and personhood');
  return {kind:'sapient',proof:b.sapientLife.sourceHash};
 }
 if(b.sapience===2)
  throw Error('Protected Mind social obligations require separate independent guardian and comprehension evidence');
 if(!Number.isInteger(b.sapience)||b.sapience<0)
  throw Error('Individual beast sapience has not been established');
 const record=s.table?.bondRecords?.[b.id];
 const life=b.individualLife;
 if(!record&&!life)throw Error('An animal needs actually established first contact or witnessed relationship evidence');
 if(life&&!require('../world/beast-ecological-learning').verify(b))
  throw Error('Original wild animal evidence cannot be replaced by a social label');
 return {kind:'animal',proof:life?.sourceHash||hash({
  beastId:b.id,bondHuman:record.human,bondBeast:record.beast,
  sapience:record.sapience})};
}
function historyValid(row,b){
 if(!row||row.origin!==ORIGIN||row.beastId!==b.id||!id(row.id)||
  row.originHash!==hash(row.source)||row.source.origin!==ORIGIN||
  row.source.beastId!==b.id||row.source.id!==row.id||
  !text(row.source.kind,3,150)||!text(row.source.purpose,12,700)||
  !text(row.source.humanDuty)||!text(row.source.beastDuty)||
  !text(row.source.protections)||!text(row.source.termination)||
  !text(row.source.communication,5,260)||
  !int(row.source.durationDays,0,36500)||!int(row.source.minute,0,1000000000)||
  !Array.isArray(row.events)||row.events.length>180)
  return false;
 let seal=row.archive?.seal||row.originHash,minute=row.archive?.minute||row.source.minute;
 if(row.archive&&(
   !int(row.archive.minute,row.source.minute,1000000000)||
   row.archive.checksum!==hash({originHash:row.originHash,seal,minute,
    status:row.archive.status,
    startMinute:row.archive.startMinute,endMinute:row.archive.endMinute})))return false;
 let lastStatus=row.archive?.status||'proposed',seen=new Set();
 const accepted=row.events.find(ev=>['accepted','contact-only'].includes(ev.source?.outcome));
 const start=accepted?.source.minute??row.archive?.startMinute;
 if(start!==undefined){
  const expectedEnd=accepted?.source.outcome==='contact-only'?
   null:(row.source.durationDays?start+row.source.durationDays*1440:null);
  if(row.startMinute!==start||
   (accepted&&row.endMinute!==expectedEnd)||
   (row.archive&&(row.archive.startMinute!==row.startMinute||
     row.archive.endMinute!==row.endMinute)))
   return false;
 }else if(row.startMinute!==undefined||row.endMinute!==undefined)return false;
 for(const ev of row.events){
  const v=ev?.source;
  if(!v||v.origin!==ORIGIN||v.id!==row.id||v.beastId!==b.id||
   !int(v.minute,minute,1000000000)||v.previous!==seal||
   ev.seal!==hash(v)||!['accepted','countered','declined','contact-only',
   'paused','resumed','expired','revoked','disputed','notice-given'].includes(v.outcome)||
   seen.has(ev.seal))return false;
  seen.add(ev.seal);seal=ev.seal;minute=v.minute;lastStatus=v.outcome;
 }
 return row.headHash===seal&&row.status===lastStatus;
}
function verify(s,b){
 const records=b?.socialArrangements;
 if(!records)return true;
 if(records.origin!==ORIGIN||records.beastId!==b.id||
  !records.entries||typeof records.entries!=='object'||Array.isArray(records.entries)||
  Object.keys(records.entries).length>100)return false;
 // The underlying original beast personhood/bond-life source must still
 // match the specific identity recorded when these terms were explained.
 let kind;
 try{kind=personKind(s,b);}catch{return false;}
 return Object.entries(records.entries).every(([key,row])=>
  row&&key===row.id&&row.source?.kindOfBeing===kind.kind&&
  row.source.personSourceHash===kind.proof&&
  row.source.minute<=s.world.minutes&&historyValid(row,b));
}
function ensure(s,b){
 if(!b.socialArrangements)b.socialArrangements={origin:ORIGIN,beastId:b.id,entries:{}};
 if(!verify(s,b))throw Error('Beast social terms or authentic history have been altered');
 return b.socialArrangements;
}
function append(s,b,row,outcome,details={}){
 if(!historyValid(row,b))throw Error('Cannot extend altered beast arrangement evidence');
 if(!keys(details,['proof','reason','sourceHash','welfare','effectiveDay','notice']))
  throw Error('Unsupported social outcome fields');
 const minute=s.world.minutes;
 const source={origin:ORIGIN,id:row.id,beastId:b.id,
  minute,outcome,details:structuredClone(details),previous:row.headHash};
 const ev={source,seal:hash(source)};
 row.events.push(ev);row.headHash=ev.seal;row.status=outcome;
 if(outcome==='accepted'||outcome==='contact-only'){
  row.startMinute=minute;
  row.endMinute=outcome==='accepted'&&row.source.durationDays?
   minute+row.source.durationDays*1440:null;
 }
 if(row.events.length>140){
  const old=row.events.splice(0,40),last=old.at(-1);
  row.archive={seal:last.seal,minute:last.source.minute,
   status:last.source.outcome,startMinute:row.startMinute,
   endMinute:row.endMinute};
  row.archive.checksum=hash({originHash:row.originHash,
   seal:row.archive.seal,minute:row.archive.minute,
   status:row.archive.status,
   startMinute:row.archive.startMinute,endMinute:row.archive.endMinute});
 }
 if(!historyValid(row,b))throw Error('Recorded agreement outcome invalid');
 return ev;
}
function present(s,b){
 if(s.battle||!b||b.away===true||
  b.location!==s.world.location||
  (s.encounter?.beastId!==b.id&&!s.player.partnerIds?.includes(b.id)))
  throw Error('The independently existing beast must actually be present outside unresolved danger');
 if(['captured','coerced','imprisoned','forced'].includes(String(b.relationship).toLowerCase())||
  /hostile|terrified|panicked|fleeing|desperate/i.test(String(b.mood))||
  b.condition<55||b.needs?.hunger>=75||b.needs?.fatigue>=75)
  throw Error('A social promise cannot be demanded from a distressed, captive or unwilling individual');
}
function draft(s,p={}){
 const fields=['beastId','id','kind','purpose','humanDuty','beastDuty',
  'protections','termination','communication','durationDays'];
 if(!keys(p,fields)||!id(p.id)||!text(p.kind,3,150)||
   !text(p.purpose,12,700)||!text(p.humanDuty)||
   !text(p.beastDuty)||!text(p.protections)||
   !text(p.termination)||!text(p.communication,5,260)||
   !int(p.durationDays,0,36500))
  throw Error('A voluntary arrangement needs original purpose, two-sided duties, safeguards, communication and an exit path');
 const b=s.beasts?.[p.beastId],kind=personKind(s,b);
 present(s,b);
 const table=ensure(s,b);
 if(table.entries[p.id])throw Error('Original social arrangement ID already exists');
 const source={origin:ORIGIN,beastId:b.id,id:p.id,kind:p.kind.trim(),
  purpose:p.purpose.trim(),humanDuty:p.humanDuty.trim(),
  beastDuty:p.beastDuty.trim(),protections:p.protections.trim(),
  termination:p.termination.trim(),communication:p.communication.trim(),
  durationDays:p.durationDays,minute:s.world.minutes,
  kindOfBeing:kind.kind,personSourceHash:kind.proof,
  proposalOnly:true,noMagicalLink:true,noCompelledAffection:true};
 const originHash=hash(source);
 table.entries[p.id]={id:p.id,beastId:b.id,origin:ORIGIN,
  source,originHash,events:[],headHash:originHash,status:'proposed'};
 return {drafted:true,id:p.id,kind:p.kind,originHash,
  noConsentOrServiceEstablished:true,
  note:'A proposal is neither another person’s agreement nor a magical bond'};
}
function witnessed(s,b,row,index){
 if(!int(index,0,s.log.length-1))throw Error('An original personally witnessed terms conversation is required');
 const ev=s.log[index],d=ev?.details;
 if(ev.type!=='story'||d?.origin!==DISCUSSION||d.beastId!==b.id||
  d.arrangementId!==row.id||d.termHash!==row.originHash||
  d.location!==s.world.location||!text(d.comprehension,12,500)||
  !text(d.communication,5,260)||ev.day>Math.floor(s.world.minutes/1440)+1)
  throw Error('The specific terms must have been meaningfully communicated in a witnessed local exchange');
 return {ev,hash:hash(ev)};
}
function negotiate(s,p={}){
 if(!keys(p,['beastId','id','witnessIndex']))throw Error('Only a real beast, proposal and witnessed discussion can negotiate');
 const b=s.beasts?.[p.beastId],kind=personKind(s,b);
 present(s,b);
 const row=b.socialArrangements?.entries?.[p.id];
 if(!row||!verify(s,b)||row.status!=='proposed')
  throw Error('A current unchanged unnegotiated social proposal is required');
const encounter=witnessed(s,b,row,p.witnessIndex);
 if(row.events.some(x=>x.source.details.sourceHash===encounter.hash))
  throw Error('One original agreement conversation cannot be reused');
 let outcome='declined',detail={sourceHash:encounter.hash};
 if(kind.kind==='animal'){
  // Successful animal contact can support a limited care/companionship note,
  // but an animal cannot legally promise labour, rent or magical servitude.
  const record=s.table?.bondRecords?.[b.id];
  const evidence=Object.values(s.table?.bondEvidence||{}).find(x=>
   x.beastId===b.id&&x.origin==='resolved-bond-interaction'&&
   x.check?.success===true&&x.worldMinute<=s.world.minutes);
  if(!record||!evidence)
   throw Error('An animal needs authentic successful original witnessed voluntary interaction');
  const yes=Agency.evaluate(s,b,record,'gentle');
  outcome=yes.possible?'contact-only':'declined';
  detail.proof=evidence.source;
 }else{
  const life=b.sapientLife,contact=[...life.history].reverse().find(x=>
   x.type==='personally-witnessed-contact'&&x.willingness===true&&
   x.location===s.world.location&&x.minute<=s.world.minutes);
  if(!contact||!Person.verify(b))
   throw Error('A person must have freely engaged in a personally witnessed real encounter');
  // This is the autonomous individual's own persisted decision stream,
  // never a human-supplied yes/no or a reusable social check.
  const disposition=Agency.profile(s,b).disposition;
  const willingness=disposition==='independent'?.30:
   disposition==='reserved'?.43:disposition==='curious'?.60:.66;
  const decision=Person._debug.draw(life);
  outcome=decision<willingness?'accepted':
   decision<willingness+.18?'countered':'declined';
  detail.proof='Independent choice from source-verified sapient personal life after witnessed comprehension';
 }
 append(s,b,row,outcome,detail);
 C.event(s,'beast',
  outcome==='accepted'?'The sapient individual agrees to the specific revocable social terms.':
  outcome==='countered'?'The independent person proposes changes; the offered duties are not agreed.':
  outcome==='contact-only'?'The animal voluntarily engages; it has not accepted legal service or ownership.':
  'The beast declines the proposed social arrangement.',{
   origin:ORIGIN,beastId:b.id,id:row.id,outcome,
   sourceHash:encounter.hash,noMagicalContract:true,
   noForcedLoyalty:true});
 return {negotiated:true,beastId:b.id,id:row.id,outcome,
  activeLegalDuties:outcome==='accepted',
  noOwnershipOrMagicalContract:true};
}
function conclude(s,p={}){
 if(!keys(p,['beastId','id','reason'])||
  !text(p.reason,12,500))throw Error('Ending a social agreement needs a real saved arrangement and reason');
 const b=s.beasts?.[p.beastId],row=b?.socialArrangements?.entries?.[p.id];
 if(!row||!verify(s,b)||!['accepted','paused','disputed','notice-given','contact-only'].includes(row.status))
  throw Error('No valid open relationship promise is recorded');
 // The human can always stop participating, but not erase another person's
 // already owed care/expenses, or forcibly compel their immediate presence.
 const physicallyThere=b.location===s.world.location&&b.away!==true;
 const outcome=physicallyThere?'revoked':'notice-given';
 append(s,b,row,outcome,{reason:p.reason.trim(),
  notice:physicallyThere?'directly-delivered':'delivery-unverified'});
 C.event(s,'beast','The human withdraws from an existing social arrangement. Outstanding duties need separate reconciliation.',{
  origin:ORIGIN,id:row.id,beastId:b.id,noticeDelivered:physicallyThere,
  noForcedBeastCompliance:true});
 return {endedByHuman:true,id:row.id,status:outcome,
  outstandingMaterialOrLegalDutiesNotErased:true,noBondDissolved:true};
}
function dispute(s,p={}){
 if(!keys(p,['beastId','id','witnessIndex']))throw Error('A dispute requires a saved arrangement and original witnessed claim');
 const b=s.beasts?.[p.beastId],row=b?.socialArrangements?.entries?.[p.id];
 if(!row||!verify(s,b)||!['accepted','paused','notice-given','disputed'].includes(row.status))
  throw Error('Only an active or challenged social commitment can be disputed');
 const ev=s.log[p.witnessIndex],d=ev?.details;
 if(!int(p.witnessIndex,0,s.log.length-1)||
  ev.type!=='story'||d?.origin!==DISPUTE||
  d.beastId!==b.id||d.arrangementId!==row.id||
  !text(d.claim,18,800)||d.location!==s.world.location)
  throw Error('Disputes need a real contemporaneous, personally witnessed source, not a chosen legal verdict');
 const sourceHash=hash(ev);
 if(row.events.some(e=>e.source.details.sourceHash===sourceHash))
  throw Error('The same witnessed dispute cannot become multiple cases');
 append(s,b,row,'disputed',{reason:d.claim,sourceHash});
 return {recorded:true,id:row.id,claimOnly:true,
  noAutomaticPenaltyOrCoercion:true};
}
function sixday(s,days=[]){
 if(!days.length)return {reviewed:0};
 let reviewed=0;
 for(const b of Object.values(s.beasts||{})){
  const entries=b.socialArrangements?.entries;if(!entries)continue;
  if(!verify(s,b))throw Error('Unverified saved social promises in living world');
  for(const row of Object.values(entries)){
   if(!['accepted','paused'].includes(row.status))continue;
   const day=days.at(-1),end=row.endMinute;
   if(end!==null&&end!==undefined&&s.world.minutes>=end){
    append(s,b,row,'expired',{effectiveDay:day});
    reviewed++;continue;
   }
   const needs=b.needs||{};
   const unsafe=(Number.isFinite(b.condition)&&b.condition<45)||
    needs.hunger>=80||needs.fatigue>=85||
    ['captured','coerced','imprisoned','forced'].includes(String(b.relationship).toLowerCase());
   if(unsafe&&row.status==='accepted'){
    append(s,b,row,'paused',{welfare:'Real condition or autonomous absence prevents a guaranteed service',effectiveDay:day});
    reviewed++;
   }else if(!unsafe&&row.status==='paused'){
    // Recovery may reopen the *possibility* of talks, not force renewed
    // agreement: only a new witnessed choice can resume legal duties.
    // The paused state therefore remains until authentic reassent.
   }
  }
 }
 return {reviewed,noAutomaticObedience:true};
}
function status(s,p={}){
 if(!keys(p,['beastId'])||typeof p.beastId!=='string')
  throw Error('A social arrangements view needs only a known original beast');
 const b=s.beasts?.[p.beastId];
 if(!b)return {known:false};
 if(!verify(s,b))throw Error('Saved social arrangement source has been altered');
 const entries=Object.values(b.socialArrangements?.entries||{}).map(row=>({
  id:row.id,kind:row.source.kind,purpose:row.source.purpose,
  humanDuty:row.source.humanDuty,
  beastDuty:row.source.kindOfBeing==='sapient'?row.source.beastDuty:
   'No enforceable animal labour or legal obligation',
  protections:row.source.protections,termination:row.source.termination,
  status:row.status==='paused'?'performance-not-confirmed':row.status,
  note:row.status==='proposed'?'A proposal only; no assent':
   row.status==='contact-only'?'Voluntary animal contact is not a legal contract':
   row.status==='accepted'?'Individually accepted and revocable; no magical bond':
   'No compelled cooperation or unconditional affection'}));
 return {known:true,beastId:b.id,arrangements:entries,
  noPartnerOrContractSealGranted:true};
}
module.exports={ORIGIN,DISCUSSION,DISPUTE,draft,negotiate,conclude,dispute,status,sixday,verify};
