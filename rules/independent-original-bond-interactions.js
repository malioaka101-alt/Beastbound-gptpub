'use strict';
// Original relationship event arithmetic, earned by actual independent
// co-present interactions, not merely an accepted social arrangement.
// The pair foundation remains immutable; replay returns the one current
// original bond record. No magical contract or Sync awarded here.
const Crypto=require('node:crypto'),E=require('../engine'),C=require('./core'),B=require('./bonds'),
 Original=require('./bond-witness'),Pair=require('./independent-original-bond-pair'),
 Arr=require('./independent-sapient-arrangements'),Social=require('./beast-social-arrangements'),
 Agency=require('./beast-agency'),Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Presence=require('../world/person-presence'),Person=require('../world/sapient-beast-persons'),W=require('./world');
const ORIGIN='source-earned-independent-original-pair-interaction-v1',
 WITNESS='gm-witnessed-independent-original-pair-friendly-opportunity-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 int=(v,a=0,b=1000000000)=>Number.isInteger(v)&&v>=a&&v<=b,
 prose=x=>typeof x==='string'&&x.trim().length>=25&&x.length<=900;
function checkRecord(roll,sp){
 const margin=roll+sp.modifier+C.naturalAdjustment(roll)-sp.dc;
 return {roll,modifier:sp.modifier,dc:sp.dc,margin,degree:C.degree(margin),success:margin>=0};
}
function welfare(b){
 return {mood:String(b.mood),condition:b.condition,needs:{hunger:b.needs.hunger,fatigue:b.needs.fatigue},
 relationship:b.relationship,injuries:structuredClone(b.injuries||[]),conditions:structuredClone(b.conditions||[]),
 agencyBoundaries:structuredClone(b.agencyBoundaries??null)};
}
function opportunity(s,b,r,q){
 const actor={...b,...q.welfare};
 if(actor.agencyBoundaries===null)delete actor.agencyBoundaries;
 return Agency.evaluate({...s,world:{...s.world,minutes:q.minute}},actor,r,q.approach).possible;
}
function witnessValid(p,b,q){
 const w=q.witness,d=w?.details;
 return w?.type==='story'&&prose(w.text)&&w.text.includes(p.name)&&
  w.day===q.day+1&&w.time===E.clock({world:{minutes:q.minute}})&&
  d?.origin===WITNESS&&d.actorId===p.actorId&&d.beastId===b.id&&
  d.pairSeal===q.pairSeal&&d.arrangementHash===q.arrangementHash&&d.arrangementRevision===q.arrangementRevision&&
  d.location===q.site&&d.contactHash===hash(q.contact)&&d.approach===q.approach&&
  prose(d.independentConcreteOpportunity)&&prose(d.actualCommunication)&&
  prose(d.unconditionalRightToRefuse)&&d.noCompelledInteraction===true;
}
function mode(p,b,r,q){
 return Original.interactionSpec(q.approach,p.mechanicalFoundation.baselineAttributes.cha,0,
  /wary|uneasy|agitated|fear|hostile|territorial/i.test(q.welfare.mood),r.willingness,b.sapience);
}
function consequence(r,q,check){
 // A respected real refusal is distinct from failure of an accepted
 // interaction, or the human declining to initiate. It grants only the
 // original respected_refusal event.
 if(!q.humanChoice.accepted)return null;
 if(!q.possible||q.beastChoice.outcome!=='accepted')return B.applyEvent(r,'respected_refusal',1);
 return check.success?B.applyEvent(r,q.law.event,1):null;
}
function replay(s,p){
 if(!Pair.verify(s,p))return null;
 const foundations=(p.originalBondPairRecognitions||[]).filter(x=>x.source.accepted),
  pairs=new Map(foundations.map(x=>[x.seal,{base:x,bond:structuredClone(x.bond),head:x.seal,last:x.source.minute}]));
 const rows=p.originalBondInteractions;
 if(rows===undefined)return pairs;
 if(!Array.isArray(rows)||rows.length>960)return null;
 const seen=new Set(),days=new Set();let previousMinute=0;
 for(const row of rows){
  const q=row?.source,pair=pairs.get(q?.pairSeal),b=s.beasts?.[q?.beastId],
   arr=p.originalSapientArrangements?.find(x=>x.seal===q?.arrangementHash),sh=q?.shift;
  if(!q||!pair||!b?.sapientLife||!Person.verify(b)||
   row.seal!==hash(q)||q.origin!==ORIGIN||q.previous!==pair.head||
   q.actorId!==p.actorId||q.humanSeal!==p.originHash||
   q.beastId!==pair.base.source.beastId||q.beastSeal!==b.sapientLife.sourceHash||
   arr?.source.beastId!==q.beastId||!Pair.revision(arr,q.minute,q.arrangementRevision)||
   !int(q.minute,Math.max(pair.last,previousMinute),s.world.minutes)||q.day!==Math.floor(q.minute/1440)||
   !['gentle','play'].includes(q.approach)||!witnessValid(p,b,q)||
   q.witnessHash!==hash(q.witness)||seen.has(q.witnessHash)||days.has(q.pairSeal+':'+q.day)||
   q.contact?.type!=='personally-witnessed-contact'||q.contact.willingness!==true||q.contact.location!==q.site||
   !int(q.contact.minute,Math.max(0,q.minute-60),q.minute)||
   !Person.contactProof(b,q.contact)||
   !sh||sh.hash!==hash(Object.fromEntries(Object.entries(sh).filter(([k])=>k!=='hash')))||
   sh.actorId!==p.actorId||sh.originHash!==p.originHash||sh.location!==q.site||
   sh.fromDay>q.day||sh.throughDay<q.day||sh.throughDay-sh.fromDay!==5||sh.scheduledAtDay!==sh.fromDay||
   !Arr.safe({...b,...q.welfare})||!eq(q.before,pair.bond)||
   !Arr.verifyHuman(q.humanChoice,q.witnessHash)||q.humanChoice.personality!==p.personality||
   q.noMagicOrSync!==true)return null;
  const sp=mode(p,b,pair.bond,q),possible=opportunity(s,b,pair.bond,q);
  if(!eq(q.law,sp)||q.possible!==possible||q.minute+sp.minutes>s.world.minutes)return null;
  if(q.humanChoice.accepted&&possible){
   const d=q.beastChoice;
   if(!d||d.disposition!==Agency.profile(s,b).disposition||!int(d.rngBefore,1,4294967295)||
    !eq(d,Social.sapientChoice({rngState:d.rngBefore},d.disposition)))return null;
  }else if(q.beastChoice!==null)return null;
  const rng={rngState:q.humanChoice.rngAfter},accepted=q.humanChoice.accepted&&possible&&q.beastChoice.outcome==='accepted',
   check=accepted?checkRecord(C.die(rng,20),sp):null;
  if(!eq(q.check,check)||q.humanRngAfter!==rng.rngState)return null;
  const event=consequence(pair.bond,q,check);
  if(!eq(q.event,event)||!eq(q.after,pair.bond))return null;
  pair.head=row.seal;pair.last=q.minute+sp.minutes;previousMinute=q.minute;seen.add(q.witnessHash);days.add(q.pairSeal+':'+q.day);
 }
 return pairs;
}
function verify(s,p){try{return replay(s,p)!==null;}catch{return false;}}
function current(s,p,seal){const map=replay(s,p);if(!map)throw Error('Original independent pair interaction history altered');return map.get(seal)||null;}
function interact(s,{actorId,beastId,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId)||
  typeof beastId!=='string'||!int(witnessIndex,0,s.log.length-1))
  throw Error('Original independent participants and fresh friendly opportunity only, no outcome or affinity supplied');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],b=s.beasts?.[beastId],
  minute=s.world.minutes,day=Math.floor(minute/1440),site=s.world.location,
  present=p&&Presence.resolve(w,actorId,site,day,minute%1440),witness=structuredClone(s.log[witnessIndex]),d=witness?.details,
  pair=p&&current(s,p,d?.pairSeal),arr=p?.originalSapientArrangements?.find(x=>x.seal===d?.arrangementHash),
  contact=b?.sapientLife?.history?.filter(x=>x.type==='personally-witnessed-contact'&&x.willingness&&
   x.location===site&&int(x.minute,Math.max(0,minute-60),minute)).at(-1);
 if(!p||!People.verify(w,p)||!present?.presence||p.status!=='active'||
  p.ageBand!=='adult, exact birthday not established'||!pair||pair.base.source.beastId!==beastId||
  !b?.sapientLife||!Person.verify(b)||!Arr.safe(b)||b.location!==site||b.away===true||
  b.owner!==null||s.player.partnerIds?.includes(beastId)||s.battle||s.encounter?.threat||
  s.encounter?.beastId!==beastId||!contact||arr?.source.beastId!==beastId||Arr.statusAt(arr,minute)!=='accepted')
  throw Error('Actual present independent recognised pair and current voluntary cooperation required');
 const rows=p.originalBondInteractions||[],rev=arr.events.at(-1)?.seal||arr.seal,
  q={origin:ORIGIN,previous:pair.head,actorId,humanSeal:p.originHash,beastId,beastSeal:b.sapientLife.sourceHash,
   pairSeal:pair.base.seal,arrangementHash:arr.seal,arrangementRevision:rev,site,minute,day,
   contact:structuredClone(contact),shift:structuredClone(present.presence),witness,witnessHash:hash(witness),
   approach:d?.approach,welfare:welfare(b),before:structuredClone(pair.bond),noMagicOrSync:true};
 if(!['gentle','play'].includes(q.approach)||!witnessValid(p,b,q)||!Pair.revision(arr,minute,rev)||
  minute<pair.last||rows.length>=960||rows.some(x=>x.source.witnessHash===q.witnessHash||
   x.source.pairSeal===q.pairSeal&&x.source.day===day))
  throw Error('Fresh original gentle or play opportunity and unused independent pair day required');
 q.law=mode(p,b,pair.bond,q);q.possible=opportunity(s,b,pair.bond,q);
 if(minute%1440+q.law.minutes>1440)throw Error('Complete original interaction within the witnessed day');
 q.humanChoice=Arr.humanChoice(p,q.witnessHash);
 q.beastChoice=q.humanChoice.accepted&&q.possible?Social.sapientChoice(b.sapientLife,Agency.profile(s,b).disposition):null;
 q.check=null;
 if(q.humanChoice.accepted&&q.possible&&q.beastChoice.outcome==='accepted'){
  const actual=C.check(s,{modifier:q.law.modifier,dc:q.law.dc,privateDisplay:true,independentRngOwner:p,label:p.name+' original freely accepted pair interaction'});
  q.check=checkRecord(actual.roll,q.law);
 }
 q.humanRngAfter=p.rngState;
 q.event=consequence(pair.bond,q,q.check);q.after=structuredClone(pair.bond);
 const seal=hash(q);rows.push({source:q,seal});p.originalBondInteractions=rows;
 E.advance(s,q.law.minutes);W.finalizeTime(s,minute);
 if(!verify(s,p))throw Error('Original independent pair interaction failed replay');
 return {independentlyInitiated:q.humanChoice.accepted,accepted:!!q.check,
  successful:!!q.check?.success,observedEvent:q.event?.event??null,elapsedMinutes:q.law.minutes,noMagicOrSync:true};
}
function privateStatus(s,p){
 const map=replay(s,p);if(!map)throw Error('Original independent pair interactions cannot be verified');
 return [...map.values()].map(x=>({beastId:x.base.source.beastId,sourceHash:x.base.seal,head:x.head,
  bond:structuredClone(x.bond),noMagicOrSync:true,privateToGM:true}));
}
module.exports={ORIGIN,WITNESS,verify,current,interact,privateStatus};
