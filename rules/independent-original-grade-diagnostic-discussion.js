'use strict';
// An independently witnessed, preliminary conversation about whether the
// people wish to seek an as-yet-undefined individual Grade diagnostic.
// NOT the diagnostic, institutional accreditation, numeric rubric, consent to
// a later instrument, examination, contract, or synchronisation.
const Crypto=require('node:crypto'),E=require('../engine'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Person=require('../world/sapient-beast-persons'),Visit=require('./independent-sapient-terrestrial-journey'),
 Presence=require('../world/person-presence'),Pair=require('./independent-original-bond-pair'),
 Interaction=require('./independent-original-bond-interactions'),
 Arr=require('./independent-sapient-arrangements'),Social=require('./beast-social-arrangements'),
 Agency=require('./beast-agency');
const ORIGIN='original-independent-grade-diagnostic-discussion-v1',
 WITNESS='gm-witnessed-original-visitor-grade-diagnostic-interest-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 validInt=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b,
 prose=x=>typeof x==='string'&&x.trim().length>=25&&x.length<=900;
function context(s,p,b,minute){
 if(!p||!b||!People.verify(Realm.peek(s),p)||!Person.verify(b)||
  !Visit.verify(s,p)||!Pair.verify(s,p)||!Arr.verify(s,p)||!Interaction.verify(s,p))return null;
 const pos=Visit.position(p,minute),site=pos?.arrived?pos.location:null,
  shift=site&&Presence.resolve(Realm.peek(s),p.actorId,site,
   Math.floor(minute/1440),minute%1440)?.presence,
  signed=site&&Visit.visitorPresence(p,minute,site);
 if(!['crossing','academy'].includes(site)||!shift||!eq(shift,signed)||
  b.location!==site||b.away===true||b.owner!==null||
  s.player?.partnerIds?.includes(b.id)||s.table?.bondRecords?.[b.id]?.contract||
  !b.sapientLife?.terrestrialJourneyReceipts?.some(x=>x.seal===pos.sourceHash)||
  b.sapience<3||!Arr.safe(b)||s.battle||s.encounter?.threat)return null;
 const pair=Interaction.privateStatus(s,p).find(x=>x.beastId===b.id),
  arr=p.originalSapientArrangements?.find(x=>
   x.source.beastId===b.id&&Arr.statusAt(x,minute)==='accepted');
 return pair&&!pair.bond.fractured&&arr?{pos,site,signed,pair,arr}:null;
}
function witnessValid(p,b,q){
 const w=q.witness,d=w?.details;
 return w?.type==='story'&&prose(w.text)&&w.text.includes(p.name)&&
  w.text.includes(b.name)&&w.day===q.day+1&&
  w.time===E.clock({world:{minutes:q.minute}})&&
  d?.origin===WITNESS&&d.actorId===p.actorId&&d.beastId===b.id&&
  d.location===q.site&&d.minute===q.minute&&
  d.pairSeal===q.pairSeal&&d.arrangementHash===q.arrangementHash&&
  d.originalSignedVisitorHash===q.visitHash&&d.originalSapientLifeHash===q.beastHash&&
  prose(d.explainedFutureMethodAndExamAreNotYetEstablished)&&
  prose(d.separateUnconditionalRightToDecline)&&
  prose(d.futureDiagnosticRequiresEntirelyFreshPermission)&&
  d.noGradeRubricOrMeasurementNow===true&&
  d.noOwnerContractOrSync===true;
}
function verify(s,p){
 const rows=p?.originalIndependentGradeDiagnosticDiscussions;
 if(rows===undefined)return true;
 if(!Array.isArray(rows)||rows.length>180||!People.verify(Realm.peek(s),p)||
  !Visit.verify(s,p)||!Pair.verify(s,p)||!Arr.verify(s,p)||
  !Interaction.verify(s,p))return false;
 const witnesses=new Set(),days=new Set();let previous=-1;
 for(const row of rows){
  const q=row?.source,b=s.beasts?.[q?.beastId],
   arr=p.originalSapientArrangements?.find(x=>x.seal===q?.arrangementHash),
   pos=Visit.position(p,q?.minute),
   onBeast=b?.sapientLife?.originalGradeDiagnosticDiscussions?.find(x=>x.seal===row?.seal);
  if(!q||row.seal!==hash(q)||!onBeast||!eq(onBeast,row)||
   !b?.sapientLife||!Person.verify(b)||q.origin!==ORIGIN||
   q.actorId!==p.actorId||q.humanHash!==p.originHash||
   q.beastHash!==b.sapientLife.sourceHash||
   !validInt(q.minute,previous+1,s.world.minutes)||
   q.day!==Math.floor(q.minute/1440)||
   !pos?.arrived||!['crossing','academy'].includes(q.site)||
   pos.location!==q.site||pos.sourceHash!==q.visitHash||
   !b.sapientLife.terrestrialJourneyReceipts?.some(x=>x.seal===q.visitHash)||
   !eq(q.shift,Visit.visitorPresence(p,q.minute,q.site))||
   arr?.source.beastId!==q.beastId||
   !Pair.revision(arr,q.minute,q.arrangementRevision)||
   !p.originalBondPairRecognitions?.some(x=>x.seal===q.pairSeal&&
    x.source.accepted&&x.source.beastId===b.id)||
   q.witnessHash!==hash(q.witness)||!witnessValid(p,b,q)||
   witnesses.has(q.witnessHash)||days.has(q.beastId+':'+q.day)||
   !Arr.verifyHuman(q.humanChoice,q.witnessHash)||
   q.humanChoice.personality!==p.personality||
   q.humanRngAfter!==q.humanChoice.rngAfter||
   q.noAssayOrFeeOrTimeOrFuturePermissionGranted!==true)return false;
  if(q.humanChoice.accepted){
   if(!q.beastChoice||!validInt(q.beastChoice.rngBefore,1,4294967295)||
    q.beastChoice.disposition!==Agency.profile(s,b).disposition||
    !eq(q.beastChoice,Social.sapientChoice({rngState:q.beastChoice.rngBefore},
     q.beastChoice.disposition)))return false;
  }else if(q.beastChoice!==null)return false;
  const mutual=q.humanChoice.accepted&&q.beastChoice.outcome==='accepted',
   outcome=!q.humanChoice.accepted?'human-declined':mutual?
    'interested-in-finding-a-real-diagnostic':'beast-declined-or-countered';
  if(q.mutualInterest!==mutual||q.outcome!==outcome)return false;
  previous=q.minute;witnesses.add(q.witnessHash);days.add(q.beastId+':'+q.day);
 }
 return true;
}
function discuss(s,{actorId,beastId,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId)||typeof beastId!=='string'||
  !validInt(witnessIndex,0,(s.log?.length||0)-1))
  throw Error('Only exact original individuals and observed witness; no selected grade, interest, roll or assay');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  b=s.beasts?.[beastId],minute=s.world.minutes,day=Math.floor(minute/1440),
  found=context(s,p,b,minute),witness=structuredClone(s.log[witnessIndex]);
 if(!found||!verify(s,p)||p.status!=='active'||
  p.ageBand!=='adult, exact birthday not established')
  throw Error('Actually source-present mutually cooperating independent individuals and safe facility required');
 const {pos,site,signed,pair,arr}=found,
  revision=arr.events.at(-1)?.seal||arr.seal,
  q={origin:ORIGIN,actorId,humanHash:p.originHash,beastId,
   beastHash:b.sapientLife.sourceHash,minute,day,site,
   visitHash:pos.sourceHash,shift:structuredClone(signed),
   pairSeal:pair.sourceHash,arrangementHash:arr.seal,arrangementRevision:revision,
   witness,witnessHash:hash(witness),noAssayOrFeeOrTimeOrFuturePermissionGranted:true},
  rows=p.originalIndependentGradeDiagnosticDiscussions||[];
 if(!witnessValid(p,b,q)||rows.length>=180||
  rows.some(x=>x.source.beastId===beastId&&x.source.day===day)||
  rows.some(x=>x.source.witnessHash===q.witnessHash))
  throw Error('Fresh truthful individual discussion witness and unused pair day required');
 const originalMinute=s.world.minutes,originalWorldRng=s.rngState,
  originalCoins=s.player.coins,originalPlayerPosition=s.world.location;
 q.humanChoice=Arr.humanChoice(p,q.witnessHash);
 q.beastChoice=q.humanChoice.accepted?
  Social.sapientChoice(b.sapientLife,Agency.profile(s,b).disposition):null;
 q.mutualInterest=q.humanChoice.accepted&&q.beastChoice.outcome==='accepted';
 q.outcome=!q.humanChoice.accepted?'human-declined':q.mutualInterest?
  'interested-in-finding-a-real-diagnostic':'beast-declined-or-countered';
 q.humanRngAfter=p.rngState;
 const row={source:q,seal:hash(q)};
 p.originalIndependentGradeDiagnosticDiscussions=[...rows,row];
 b.sapientLife.originalGradeDiagnosticDiscussions||=[];
 b.sapientLife.originalGradeDiagnosticDiscussions.push(structuredClone(row));
 if(!verify(s,p)||s.world.minutes!==originalMinute||
  s.rngState!==originalWorldRng||s.player.coins!==originalCoins||
  s.world.location!==originalPlayerPosition)
  throw Error('Original source-only diagnostic-interest decision replay altered');
 return {privateToGM:true,actorId,beastId,mutualInterest:q.mutualInterest,
  outcome:q.outcome,sourceHash:row.seal,actualDiagnostic:null,
  noCurrentOrFutureAssayConsent:true,noGradeFeeOrTimeOrPartnership:true};
}
function privateStatus(s,p){
 if(!verify(s,p))throw Error('Individual future-diagnostic interest receipt altered');
 return (p.originalIndependentGradeDiagnosticDiscussions||[]).map(x=>({
  privateToGM:true,beastId:x.source.beastId,site:x.source.site,
  outcome:x.source.outcome,sourceHash:x.seal,
  diagnosticPerformed:false,numericGradeCertified:false,futureAssayConsent:false}));
}
module.exports={ORIGIN,WITNESS,verify,discuss,privateStatus};
