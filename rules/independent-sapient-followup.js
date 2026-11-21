'use strict';
// Genuine RENEWED contact between two previously recognised people. Neither
// the original encounter nor either participant's earlier consent is reused;
// both must currently be physically present, safe and freely interested.
const Crypto=require('node:crypto'),E=require('../engine'),Core=require('./core'),
 People=require('../world/emergent-people'),Realm=require('../world/simulation'),
 Presence=require('../world/person-presence'),Person=require('../world/sapient-beast-persons'),
 Pair=require('./independent-original-bond-pair'),Arr=require('./independent-sapient-arrangements'),
 Agency=require('./beast-agency'),World=require('./world');
const ORIGIN=Person.FOLLOWUP,
 WITNESS='gm-witnessed-independent-renewed-sapient-contact-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 int=(v,a=0,b=1000000000)=>Number.isInteger(v)&&v>=a&&v<=b,
 prose=x=>typeof x==='string'&&x.trim().length>=25&&x.length<=900;
function validateWitness(p,b,q){
 const w=q.witness,d=w?.details;
 return w?.type==='story'&&prose(w.text)&&w.text.includes(p.name)&&w.text.includes(b.name)&&
  w.day===q.day+1&&w.time===E.clock({world:{minutes:q.minute}})&&
  d?.origin===WITNESS&&d.actorId===p.actorId&&d.beastId===b.id&&
  d.location===q.location&&d.actualRenewedCoPresence===true&&
  d.noAssignedBeastConsentOrOwnership===true&&prose(d.unconditionalRefusalAndCommunication)&&
  prose(d.currentRealSharedActivity)&&d.pairSeal===q.pairSeal&&
  d.arrangementHash===q.arrangementHash&&d.contactStatus==='new-independent-choices';
}
function verify(s,p){
 const rows=p?.originalSapientRenewedContacts;
 if(rows===undefined)return true;
 if(!Array.isArray(rows)||rows.length>480||!Pair.verify(s,p)||!Arr.verify(s,p))return false;
 let last=-1;const seen=new Set();
 for(const row of rows){
  const r=row?.source,b=s.beasts?.[r?.beastId],
   q=b?.sapientLife?.contactReceipts?.find(x=>x.seal===r?.contactSeal)?.source,sh=r?.shift;
  if(!r||row.seal!==hash(r)||r.origin!==ORIGIN||r.actorId!==p.actorId||
   r.actorHash!==p.originHash||r.beastHash!==b?.sapientLife?.sourceHash||
   !b||!Person.verify(b)||!q||q.origin!==ORIGIN||q.actorId!==p.actorId||
   q.humanHash!==p.originHash||q.beastId!==b.id||r.witnessHash!==q.witnessHash||
   !eq(r.contact,q.contact)||r.contactSeal!==hash(q)||
   !int(r.minute,last+1,s.world.minutes)||r.minute!==q.minute||
   r.day!==Math.floor(r.minute/1440)||r.day!==q.contact.day||
   r.minutes!==(q.contact.willingness?12:5)||r.minute+r.minutes>s.world.minutes||
   !validateWitness(p,b,q)||seen.has(r.witnessHash)||
   !sh||sh.hash!==hash(Object.fromEntries(Object.entries(sh).filter(([k])=>k!=='hash')))||
   sh.actorId!==p.actorId||sh.originHash!==p.originHash||sh.location!==q.location||
   sh.scheduledAtDay!==sh.fromDay||sh.throughDay-sh.fromDay!==5||
   sh.fromDay>r.day||sh.throughDay<r.day||
   !p.originalBondPairRecognitions?.some(x=>x.seal===r.pairSeal&&
    x.source.beastId===b.id&&x.source.accepted&&x.source.minute<r.minute))
   return false;
  seen.add(r.witnessHash);last=r.minute;
 }
 return true;
}
function contact(s,{actorId,beastId,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId)||
  typeof beastId!=='string'||!int(witnessIndex,0,s.log.length-1))
  throw Error('Exact independent known people and fresh local follow-up scene only; no chosen consent or outcome');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],b=s.beasts?.[beastId],
  minute=s.world.minutes,day=Math.floor(minute/1440),site=s.world.location,
  present=p&&Presence.resolve(w,actorId,site,day,minute%1440),witness=structuredClone(s.log[witnessIndex]),
  d=witness?.details,arr=p?.originalSapientArrangements?.find(x=>x.seal===d?.arrangementHash),
  pair=p?.originalBondPairRecognitions?.find(x=>x.seal===d?.pairSeal);
 if(!p||!People.verify(w,p)||!present?.presence||p.status!=='active'||
  !b?.sapientLife||!Person.verify(b)||!Arr.safe(b)||b.owner!==null||
  b.away===true||b.location!==site||!E.LOCATIONS[site]?.spawns?.includes(b.species)||
  s.battle||s.encounter?.threat||(s.encounter&&s.encounter.beastId!==beastId)||
  s.player.partnerIds?.includes(beastId)||!pair?.source.accepted||
  pair.source.beastId!==beastId||pair.source.minute>=minute||
  !Pair.verify(s,p)||!Arr.verify(s,p)||!verify(s,p)||
  arr?.source.beastId!==beastId||Arr.statusAt(arr,minute)!=='accepted'||
  p.originalSapientRenewedContacts?.some(x=>x.source.beastId===beastId&&x.source.day===day)||
  b.sapientLife.contactReceipts?.length>=4096)
  throw Error('Genuine known, independently willing co-present sapient people and unused renewed contact day required');
 const sh=structuredClone(present.presence),
  q={origin:ORIGIN,previous:b.sapientLife.contactHead||b.sapientLife.sourceHash,
   personSeal:b.sapientLife.sourceHash,actorId,humanHash:p.originHash,beastId,
   minute,day,location:site,pairSeal:pair.seal,arrangementHash:arr.seal,
   encounterHash:hash(witness),witness,witnessHash:hash(witness),disposition:Agency.profile(s,b).disposition,
   welfare:{hunger:b.needs.hunger,fatigue:b.needs.fatigue,condition:b.condition}};
 if(!validateWitness(p,b,q)||!s.chatRuntime?.scene?.includes(p.name)||!s.chatRuntime.scene.includes(b.name))
  throw Error('Fresh actually observed local follow-up and freely revocable contact required');
 q.humanChoice=Arr.humanChoice(p,q.witnessHash);
 q.rngBefore=b.sapientLife.rngState;
 q.offer=q.humanChoice.accepted?Person._debug.draw(b.sapientLife):null;
 q.rngAfter=b.sapientLife.rngState;
 const threshold=q.disposition==='independent'?.36:q.disposition==='reserved'?.49:.72,
  available=q.welfare.hunger<65&&q.welfare.fatigue<65&&q.welfare.condition>=65,
  willing=q.humanChoice.accepted&&available&&q.offer<threshold;
 q.contact={type:'personally-witnessed-contact',day,minute,location:site,meetingHash:q.encounterHash,
  willingness:willing,
  description:willing?'Both separately choose a new local conversation; no existing contract or earlier consent is reused.':
   'At least one person declines this renewed conversation; their distance and right not to participate are respected.',
  private:false};
 const seal=hash(q);
 b.sapientLife.contactReceipts||=[];
 b.sapientLife.contactReceipts.push({source:q,seal});b.sapientLife.contactHead=seal;
 b.sapientLife.history.push(structuredClone(q.contact));
 if(b.sapientLife.history.length>24)b.sapientLife.history.shift();
 const source={origin:ORIGIN,actorId,actorHash:p.originHash,beastId,
  beastHash:b.sapientLife.sourceHash,contactSeal:seal,
  witnessHash:q.witnessHash,contact:structuredClone(q.contact),
  pairSeal:pair.seal,minute,day,minutes:willing?12:5,shift:sh};
 p.originalSapientRenewedContacts||=[];p.originalSapientRenewedContacts.push({source,seal:hash(source)});
 E.advance(s,source.minutes);World.finalizeTime(s,minute);
 if(!Person.verify(b)||!verify(s,p))throw Error('Original renewed independent sapient contact failed reciprocal source replay');
 return {actorId,beastId,newContact:willing,minutes:source.minutes,
  freelyRefused:!willing,noOwnershipOrCompelledPartnership:true};
}
module.exports={ORIGIN,WITNESS,verify,contact};
