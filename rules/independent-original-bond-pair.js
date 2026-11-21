'use strict';
// The original bond data model belongs to an actual pair, not the player.
// This first adapter registers an uncommitted independent sapient pair's
// observed calibration. Social cooperation is not magical partnership,
// and no trust, willingness, history, contract or synchronisation is assumed.
const Crypto=require('node:crypto'),E=require('../engine'),Core=require('./core'),
 Bond=require('./bonds'),Arrangement=require('./independent-sapient-arrangements'),
 Social=require('./beast-social-arrangements'),Agency=require('./beast-agency'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Presence=require('../world/person-presence'),Person=require('../world/sapient-beast-persons');
const ORIGIN='source-witnessed-independent-original-bond-pair-v1',
 WITNESS='gm-witnessed-independent-pair-calibration-recognition-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 int=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b,
 prose=x=>typeof x==='string'&&x.trim().length>=25&&x.length<=900;
function revision(arr,minute,seal){
 if(!arr||arr.source.minute>minute||arr.source.outcome!=='accepted'||
  arr.endMinute!==null&&minute>=arr.endMinute)return null;
 if(seal===arr.seal){
  // A later review is allowed at the same minute, but never an earlier one.
  if(arr.events.some(x=>x.source.minute<minute))return null;
  return arr.source;
 }
 const index=arr.events.findIndex(x=>x.seal===seal),rev=arr.events[index]?.source;
 if(index<0||rev.outcome!=='resumed'||rev.minute>minute||
  arr.events.slice(index+1).some(x=>x.source.minute<minute))return null;
 return rev;
}
function makeRecord(p,b,q){
 return Bond.create({human:p.actorId,beast:b.id,sapience:q.sapience,
  start:'unfamiliar',years:0,compatibility:q.compatibility,resonance:q.resonance,
  personality:q.personality});
}
function validWitness(p,b,q){
 const w=q.witness,d=w?.details;
 return w?.type==='story'&&prose(w.text)&&w.text.includes(p.name)&&
  w.day===q.day+1&&w.time===E.clock({world:{minutes:q.minute}})&&
  d?.origin===WITNESS&&d.actorId===p.actorId&&d.beastId===b.id&&
  d.location===q.site&&d.arrangementHash===q.arrangementHash&&
  d.arrangementRevision===q.arrangementRevision&&d.contactHash===hash(q.contact)&&
  d.measuredSapience===q.sapience&&d.measuredCompatibility===q.compatibility&&
  d.measuredResonance===q.resonance&&
  prose(d.actualPriorBioSpiritualCalibration)&&prose(d.actualPriorEnergyCalibration)&&
  prose(d.independentlyUnderstoodTerms)&&prose(d.rightToDeclineRecord)&&
  d.noAssignedAffectionOrWillingness===true&&d.noMagicalContract===true;
}
function verify(s,p){
 if(p?.originalBondPairRecognitions===undefined)return true;
 try{
  const w=Realm.peek(s),rows=p.originalBondPairRecognitions;
  if(!People.verify(w,p)||!Arrangement.verify(s,p)||!Array.isArray(rows)||rows.length>480)return false;
  const used=new Set(),pairs=new Set(),days=new Set();let previousMinute=-1;
  for(const row of rows){
   const q=row?.source,b=s.beasts?.[q?.beastId],sh=q?.shift,
    arr=p.originalSapientArrangements?.find(x=>x.seal===q?.arrangementHash);
   if(!q||row.seal!==hash(q)||q.origin!==ORIGIN||q.actorId!==p.actorId||q.humanSeal!==p.originHash||
    !b?.sapientLife||!Person.verify(b)||q.beastSeal!==b.sapientLife.sourceHash||
    q.species!==b.species||q.form!==b.evolutionStage||
    !int(q.sapience,3,5)||q.sapience!==b.sapience||
    !int(q.compatibility,1,10)||!int(q.resonance,1,10)||
    !Array.isArray(q.personality)||q.personality.length>5||
    q.personality.some(x=>typeof x!=='string')||
    !eq(q.personality,(b.personalityTags||[]).slice(0,5))||
    !int(q.minute,Math.max(0,previousMinute),s.world.minutes)||q.day!==Math.floor(q.minute/1440)||
    arr?.source.beastId!==q.beastId||!revision(arr,q.minute,q.arrangementRevision)||
    q.contact?.type!=='personally-witnessed-contact'||q.contact.willingness!==true||
    q.contact.location!==q.site||!int(q.contact.minute,Math.max(0,q.minute-60),q.minute)||
    (q.contact.meetingHash!==b.sapientLife.source.encounterHash&&
     !b.sapientLife.triedEncounters.includes(q.contact.meetingHash))||
    !sh||sh.hash!==hash(Object.fromEntries(Object.entries(sh).filter(([k])=>k!=='hash')))||
    sh.actorId!==p.actorId||sh.originHash!==p.originHash||sh.location!==q.site||
    sh.scheduledAtDay!==sh.fromDay||sh.throughDay-sh.fromDay!==5||
    sh.fromDay>q.day||sh.throughDay<q.day||
    !validWitness(p,b,q)||q.witnessHash!==hash(q.witness)||used.has(q.witnessHash)||
    days.has(q.beastId+':'+q.day)||pairs.has(q.beastId)||
    !Arrangement.verifyHuman(q.humanChoice,q.witnessHash)||q.humanChoice.personality!==p.personality||
    q.noPartnershipOrMagic!==true)return false;
   const retained=b.sapientLife.history.find(x=>x.type==='personally-witnessed-contact'&&x.meetingHash===q.contact.meetingHash);
   if(retained&&!eq(retained,q.contact)||
    !retained&&b.sapientLife.history.length&&q.contact.day>=b.sapientLife.history[0].day)return false;
   if(q.humanChoice.accepted){
    const d=q.beastChoice;
    if(!d||d.disposition!==Agency.profile(s,b).disposition||!int(d.rngBefore,1,4294967295)||
     !eq(d,Social.sapientChoice({rngState:d.rngBefore},d.disposition)))return false;
   }else if(q.beastChoice!==null)return false;
   const accepted=q.humanChoice.accepted&&q.beastChoice.outcome==='accepted';
   if(q.accepted!==accepted||!eq(row.bond,accepted?makeRecord(p,b,q):null))return false;
   if(accepted)pairs.add(q.beastId);
   used.add(q.witnessHash);days.add(q.beastId+':'+q.day);previousMinute=q.minute;
  }
  return true;
 }catch{return false;}
}
function record(s,{actorId,beastId,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId)||
  typeof beastId!=='string'||!int(witnessIndex,0,s.log.length-1))
  throw Error('Only actual independent participants and fresh original pair recognition witness; no assigned affinity or consent');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],b=s.beasts?.[beastId],
  minute=s.world.minutes,day=Math.floor(minute/1440),site=s.world.location,
  present=p&&Presence.resolve(w,actorId,site,day,minute%1440),witness=structuredClone(s.log[witnessIndex]),d=witness?.details,
  arr=p?.originalSapientArrangements?.find(x=>x.seal===d?.arrangementHash),
  contact=b?.sapientLife?.history?.filter(x=>x.type==='personally-witnessed-contact'&&x.willingness&&
   x.location===site&&int(x.minute,Math.max(0,minute-60),minute)).at(-1);
 if(!p||!People.verify(w,p)||!present?.presence||p.status!=='active'||
  p.ageBand!=='adult, exact birthday not established'||!b?.sapientLife||!Person.verify(b)||
  !int(b.sapience,3,5)||!Arrangement.safe(b)||b.away===true||b.location!==site||
  b.owner!==null||s.player.partnerIds?.includes(beastId)||s.table?.bondRecords?.[beastId]?.contract||
  s.battle||s.encounter?.threat||s.encounter?.beastId!==beastId||!contact||
  !verify(s,p)||!Arrangement.verify(s,p)||arr?.source.beastId!==beastId||
  Arrangement.statusAt(arr,minute)!=='accepted')
  throw Error('Real co-present independently cooperating persons and current voluntary arrangement required');
 const rows=p.originalBondPairRecognitions||[],latest=arr.events.at(-1)?.seal||arr.seal,
  q={origin:ORIGIN,actorId,humanSeal:p.originHash,beastId,beastSeal:b.sapientLife.sourceHash,
   species:b.species,form:b.evolutionStage,sapience:b.sapience,minute,day,site,
   arrangementHash:arr.seal,arrangementRevision:latest,contact:structuredClone(contact),
   shift:structuredClone(present.presence),witness,witnessHash:hash(witness),
   compatibility:d?.measuredCompatibility,resonance:d?.measuredResonance,
   personality:[...(b.personalityTags||[])].slice(0,5),noPartnershipOrMagic:true};
 if(rows.length>=480||rows.some(x=>x.source.beastId===beastId&&(x.source.accepted||x.source.day===day))||
  rows.some(x=>x.source.witnessHash===q.witnessHash)||!revision(arr,minute,latest)||
  !int(q.compatibility,1,10)||!int(q.resonance,1,10)||!validWitness(p,b,q))
  throw Error('Separate distinctly witnessed actual measured compatibility and resonance, voluntary recognition and no repeated decision required');
 q.humanChoice=Arrangement.humanChoice(p,q.witnessHash);
 q.beastChoice=q.humanChoice.accepted?Social.sapientChoice(b.sapientLife,Agency.profile(s,b).disposition):null;
 q.accepted=q.humanChoice.accepted&&q.beastChoice.outcome==='accepted';
 const seal=hash(q);rows.push({source:q,seal,bond:q.accepted?makeRecord(p,b,q):null});p.originalBondPairRecognitions=rows;
 if(!verify(s,p))throw Error('Original independent pair recognition source failed replay');
 Core.event(s,'story',p.name+' and the sapient person independently resolve whether to retain the witnessed calibration as an uncommitted relationship record.',{
  origin:ORIGIN,actorId,beastId,accepted:q.accepted,sourceHash:seal,noPartnershipOrMagic:true});
 return {recorded:q.accepted,sourceHash:seal,noPartnershipOrMagic:true,noTrustOrSynchronisationGranted:true};
}
function privateStatus(s,p){
 if(!verify(s,p))throw Error('Original independent pair recognition history altered');
 return (p.originalBondPairRecognitions||[]).filter(x=>x.source.accepted).map(x=>({
  beastId:x.source.beastId,sourceHash:x.seal,bond:structuredClone(x.bond),
  noPartnershipOrMagic:true,privateToGM:true}));
}
module.exports={ORIGIN,WITNESS,verify,record,privateStatus,revision};
