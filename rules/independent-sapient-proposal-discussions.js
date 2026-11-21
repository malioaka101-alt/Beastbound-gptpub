'use strict';
// Original independent human + sapient relationship foundation.
// This owner records mutual willingness to DISCUSS an explicitly witnessed
// proposal with an actually present sapient person. It is not a magical
// bond, an enacted legal arrangement, paid work, a contract, or ownership.
// The original human public-invitation decision is INTEREST, not consent
// to binding duties. The original beast choice remains independently owned.
const Crypto=require('node:crypto'),E=require('../engine'),Core=require('./core'),
 Social=require('./beast-social-arrangements'),Agency=require('./beast-agency'),
 People=require('../world/emergent-people'),Presence=require('../world/person-presence'),
 Person=require('../world/sapient-beast-persons'),Realm=require('../world/simulation');
const ORIGIN='source-witnessed-independent-human-sapient-proposal-v1',
 WITNESS='witnessed-independent-human-sapient-proposal-exchange-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 text=(x,min=12,max=900)=>typeof x==='string'&&x.trim().length>=min&&x.length<=max;
function report(q){
 const human=q.humanChoice.interested;
 return !human?'human-declined':
  q.beastChoice.outcome==='accepted'?'mutually-interested':
  q.beastChoice.outcome==='countered'?'beast-proposed-changes':'beast-declined';
}
function validateWitness(wit,p,b,site,minute,terms,contact){
 const d=wit?.details;
 return !!(wit?.type==='story'&&text(wit.text,16)&&wit.text.includes(p.name)&&
  wit.day===Math.floor(minute/1440)+1&&
  wit.time===E.clock({world:{minutes:minute}})&&
  d?.origin===WITNESS&&d.actorId===p.actorId&&d.beastId===b.id&&
  d.location===site&&d.minute===minute&&d.contactHash===hash(contact)&&
  Social.termsValid(terms)&&terms.beastId===b.id&&
  eq(d.terms,terms)&&text(d.comprehension,24,500)&&
  text(d.communication,5,260)&&
  d.noAssumedSharedLanguage===true&&d.publicInvitationOnly===true);
}
function verify(s,p){
 const rows=p?.originalSapientProposalDiscussions;
 if(rows===undefined)return true;
 const w=Realm.peek(s);
 if(!p||!w||!People.verify(w,p)||!Array.isArray(rows)||rows.length>180)return false;
 const seen=new Set(),days=new Set();
 let last=-1;
 for(const row of rows){
  const q=row?.source,b=s.beasts?.[q?.beastId],sh=q?.humanShift;
  if(!q||row.seal!==hash(q)||q.origin!==ORIGIN||
   q.humanActorId!==p.actorId||q.humanOriginHash!==p.originHash||
   !b?.sapientLife||!Person.verify(b)||q.beastOriginHash!==b.sapientLife.sourceHash||
   !Number.isInteger(q.minute)||q.minute<last||q.minute>s.world.minutes||
   q.day!==Math.floor(q.minute/1440)||q.physicalSite!==q.contact?.location||
   q.contact?.type!=='personally-witnessed-contact'||
   q.contact.willingness!==true||q.contact.minute>q.minute||
   q.minute-q.contact.minute>60||
   !Person.contactProof(b,q.contact)||
   !sh||sh.hash!==hash(Object.fromEntries(Object.entries(sh).filter(([k])=>k!=='hash')))||
   sh.actorId!==p.actorId||sh.originHash!==p.originHash||sh.location!==q.physicalSite||
   sh.scheduledAtDay!==sh.fromDay||sh.throughDay-sh.fromDay!==5||
   sh.fromDay>q.day||sh.throughDay<q.day||
   q.witnessHash!==hash(q.witness)||seen.has(q.witnessHash)||
   days.has(b.id+':'+q.day)||
   !validateWitness(q.witness,p,b,q.physicalSite,q.minute,q.terms,q.contact)||
   !People.verifyPublicInvitationChoice(q.humanChoice)||
   q.humanChoice.personOriginHash!==p.originHash||
   q.humanChoice.activityHash!==q.witnessHash||
   q.humanChoice.status!=='active'||
   q.noLegalDutyOrMaterialTransfer!==true||
   q.noBondSyncOwnershipOrCompelledService!==true)return false;
  // Recent actual personally witnessed contact must reconcile. The beast's
  // original personal history is bounded; preserve the exact snapshot.
  
  if(q.humanChoice.interested){
   const d=q.beastChoice;
   if(!d||d.disposition!==Agency.profile(s,b).disposition||
    !Number.isInteger(d.rngBefore)||d.rngBefore<1)return false;
   const roller={rngState:d.rngBefore};
   if(!eq(d,Social.sapientChoice(roller,d.disposition)))return false;
  }else if(q.beastChoice!==null)return false;
  if(q.outcome!==report(q))return false;
  seen.add(q.witnessHash);days.add(b.id+':'+q.day);last=q.minute;
 }
 return true;
}
function discuss(s,{actorId,beastId,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||typeof beastId!=='string'||
  !Number.isInteger(witnessIndex)||witnessIndex<0||witnessIndex>=s.log.length)
  throw Error('Independent sapient proposal requires named participants and actual witnessIndex, never assigned consent or outcome');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  b=s.beasts?.[beastId],minute=s.world.minutes,day=Math.floor(minute/1440),
  site=s.world.location,present=p&&Presence.resolve(w,actorId,site,day,minute%1440),
  contact=b?.sapientLife?.history?.filter(x=>x.type==='personally-witnessed-contact'&&
   x.willingness===true&&x.location===site&&x.minute<=minute&&minute-x.minute<=60).at(-1),
  wit=structuredClone(s.log[witnessIndex]),terms=wit?.details?.terms;
 if(!p||p.actorId!==actorId||!People.verify(w,p)||!present?.presence||
  p.status!=='active'||p.ageBand!=='adult, exact birthday not established'||
  !b?.sapientLife||!Person.verify(b)||
  !(E.SPECIES[b.species]?.intelligence==='sapient'||Number.isInteger(b.sapience)&&b.sapience>=3)||
  b.location!==site||b.away===true||b.owner||s.player.partnerIds?.includes(b.id)||
  s.battle||s.encounter?.threat||s.encounter?.beastId!==beastId||
  !contact||!Number.isFinite(b.condition)||b.condition<55||
  !Number.isFinite(b.needs?.hunger)||b.needs.hunger>=75||
  !Number.isFinite(b.needs?.fatigue)||b.needs.fatigue>=75||
  /hostile|agitated|terrified|panicked|fleeing|desperate/i.test(String(b.mood))||
  ['captured','coerced','imprisoned','forced'].includes(String(b.relationship).toLowerCase())||
  !validateWitness(wit,p,b,site,minute,terms,contact)||!verify(s,p))
  throw Error('Both original independent persons must actually be present with a fresh, voluntary, comprehended proposal discussion');
 const rows=p.originalSapientProposalDiscussions||[],witnessHash=hash(wit);
 if(rows.length>=180||rows.some(x=>x.source.witnessHash===witnessHash||
  x.source.beastId===beastId&&x.source.day===day))
  throw Error('One genuine discussion opportunity per pair per day; do not reroll willingness');
 const humanChoice=People.considerPublicInvitation(w,p,witnessHash).source,
  beastChoice=humanChoice.interested?
   Social.sapientChoice(b.sapientLife,Agency.profile(s,b).disposition):null,
  q={origin:ORIGIN,humanActorId:actorId,humanOriginHash:p.originHash,
   beastId,beastOriginHash:b.sapientLife.sourceHash,minute,day,
   physicalSite:site,humanShift:structuredClone(present.presence),
   contact:structuredClone(contact),witness:wit,witnessHash,
   terms:structuredClone(terms),humanChoice,beastChoice,
   outcome:null,noLegalDutyOrMaterialTransfer:true,
   noBondSyncOwnershipOrCompelledService:true};
 q.outcome=report(q);
 const row={source:q,seal:hash(q)};
 p.originalSapientProposalDiscussions=[...rows,row];
 if(!verify(s,p))throw Error('Actual independent sapient cooperation discussion failed replay');
 Core.event(s,'story',p.name+' and the sapient individual have considered the witnessed proposal without establishing binding duties.',{
  origin:ORIGIN,actorId,beastId,outcome:q.outcome,sourceHash:row.seal,
  noLegalDutyOrMaterialTransfer:true,noBondSyncOwnershipOrCompelledService:true});
 return {actorId,beastId,observedOutcome:q.outcome,
  mutuallyInterested:q.outcome==='mutually-interested',
  legalDutiesEstablished:false,magicalBondEstablished:false,
  noCompelledFutureAgreement:true};
}
function privateStatus(s,p){
 if(!verify(s,p))throw Error('Original independent sapient proposal evidence was altered');
 return (p.originalSapientProposalDiscussions||[]).map(row=>({
  beastId:row.source.beastId,day:row.source.day,sourceHash:row.seal,
  observedOutcome:row.source.outcome,purpose:row.source.terms.purpose,
  noLegalDutyOrMagicalBond:true}));
}
module.exports={ORIGIN,WITNESS,verify,discuss,privateStatus};
