'use strict';
// A source-present human and sapient person may INDEPENDENTLY consider a
// second ORIGINAL linked terrestrial leg. Neither person's earlier proposal,
// original arrival, or social agreement supplies future travel assent.
// This independent origin never moves either body, spends Stamina, or rolls
// a departure. The GM-private visitor scene is not player-known narration.
const Crypto=require('node:crypto'),E=require('../engine'),
 Atlas=require('../world/atlas'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),Person=require('../world/sapient-beast-persons'),
 Presence=require('../world/person-presence'),Journey=require('./independent-sapient-terrestrial-journey'),
 Preflight=require('./independent-sapient-terrestrial-return-preflight'),
 Pair=require('./independent-original-bond-pair'),Arr=require('./independent-sapient-arrangements'),
 Social=require('./beast-social-arrangements'),Agency=require('./beast-agency'),
 Travel=require('./travel-shared-original-law');
const ORIGIN='source-actually-considered-independent-terrestrial-visitor-next-leg-v1',
 WITNESS='gm-witnessed-independent-terrestrial-visitor-next-leg-proposal-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 integer=(n,a=0,z=1000000000)=>Number.isInteger(n)&&n>=a&&n<=z,
 prose=x=>typeof x==='string'&&x.trim().length>=25&&x.length<=900;
function witnessed(p,b,q){
 const w=q.witness,d=w?.details;
 return w?.type==='story'&&prose(w.text)&&w.text.includes(p.name)&&w.text.includes(b.name)&&
  w.day===q.day+1&&w.time===E.clock({world:{minutes:q.minute}})&&
  d?.origin===WITNESS&&d.actorId===p.actorId&&d.beastId===b.id&&
  d.arrivalSeal===q.arrivalSeal&&d.from===q.from&&d.to===q.to&&
  d.arrangementSeal===q.arrangementSeal&&d.pairSeal===q.pairSeal&&
  d.combatSeal===q.combatEntrySeal&&
  d.originalLinkedMinutes===q.law.minutes&&d.originalHumanStamina===q.law.stamina&&
  d.separateNewHumanAndSapientChoices===true&&
  d.noInheritedReturnConsentOrGuaranteedJourney===true&&
  prose(d.actualVisitorSitePurposeAndDestination)&&prose(d.currentRouteRisksAndWeather)&&
  prose(d.freshRightOfEachPersonToRefuse)&&
  prose(d.originalTerrestrialMeansNotTeleportOrMount);
}
function sourceAt(s,p,b,q){
 const old=(p.originalSapientTerrestrialJourneys||[]).filter(x=>
  x.source.departed&&x.source.minute<q.minute&&x.source.arrivalMinute<=q.minute).at(-1),
  pos=Journey.position(p,q.minute),at=Journey.visitorPresence(p,q.minute,q.from),
  sh=q.originalShift,body=s.table?.combatants?.['npc_'+p.id];
 return !!old&&old.seal===q.arrivalSeal&&old.source.beastId===b.id&&
  old.source.to===q.from&&pos?.arrived&&pos.sourceHash===old.seal&&
  pos.location===q.from&&
  sh?.source===Journey.VISITOR&&sh.arrivedBy===old.seal&&
  equal(sh,at)&&sh.location===q.from&&
  sh.actorId===p.actorId&&sh.originHash===p.originHash&&
  body?.npcOrigin?.seal===q.combatEntrySeal&&
  integer(q.humanStaminaAtProposal,q.law.stamina,body?.maxStamina)&&
  q.humanStaminaUnspent===q.humanStaminaAtProposal&&
  q.afterHumanLocation===q.from&&q.afterBeastLocation===q.from&&
  q.noMovementOrAssumedFurtherConsent===true;
}
function replay(s,p){
 if(p?.originalSapientVisitorLegProposals===undefined)return [];
 const rows=p.originalSapientVisitorLegProposals,w=Realm.peek(s);
 if(!Array.isArray(rows)||rows.length>100||!People.verify(w,p)||
  !Pair.verify(s,p)||!Arr.verify(s,p)||!Journey.structure(p))return null;
 let prev=p.originHash,lastMinute=-1;const witnessedSet=new Set(),days=new Set();
 for(const row of rows){
  const q=row?.source,b=s.beasts?.[q?.beastId],
   arr=p.originalSapientArrangements?.find(x=>x.seal===q?.arrangementSeal);
  if(!q||row.seal!==hash(q)||q.previous!==prev||q.origin!==ORIGIN||
   q.actorId!==p.actorId||q.actorOriginHash!==p.originHash||
   !b?.sapientLife||!Person.verify(b)||q.beastOriginHash!==b.sapientLife.sourceHash||
   !p.originalBondPairRecognitions?.some(x=>x.seal===q.pairSeal&&
    x.source.accepted&&x.source.beastId===b.id&&x.source.minute<=q.minute)||
   arr?.source.beastId!==b.id||!Pair.revision(arr,q.minute,q.arrangementRevision)||
   !integer(q.minute,lastMinute+1,s.world.minutes)||q.day!==Math.floor(q.minute/1440)||
   !E.LOCATIONS[q.from]?.exits?.includes(q.to)||!E.LOCATIONS[q.to]||
   q.fromRegion!==Atlas.LOCATION_REGION[q.from]||
   q.toRegion!==Atlas.LOCATION_REGION[q.to]||
   !equal(q.law,Travel.legSpec(q.to))||
   q.minute%1440+q.law.minutes>1440||
   !witnessed(p,b,q)||q.witnessHash!==hash(q.witness)||
   witnessedSet.has(q.witnessHash)||days.has(q.pairSeal+':'+q.day)||
   !sourceAt(s,p,b,q)||
   q.beastDisposition!==Agency.profile(s,b).disposition||
   !Arr.verifyHuman(q.humanChoice,q.witnessHash)||
   q.humanChoice.personality!==p.personality)return null;
  if(q.humanChoice.accepted){
   const bc=q.beastChoice;
   if(!bc||bc.disposition!==q.beastDisposition||
    !integer(bc.rngBefore,1,4294967295)||
    !equal(bc,Social.sapientChoice({rngState:bc.rngBefore},bc.disposition)))return null;
  }else if(q.beastChoice!==null)return null;
  const mutual=!!(q.humanChoice.accepted&&q.beastChoice?.outcome==='accepted');
  if(q.mutuallyInterested!==mutual||
   q.outcome!==(mutual?'both-consider-visitor-leg':!q.humanChoice.accepted?
    'visitor-human-refused':'visitor-beast-refused'))return null;
  prev=row.seal;lastMinute=q.minute;
  witnessedSet.add(q.witnessHash);days.add(q.pairSeal+':'+q.day);
 }
 return rows;
}
function verify(s,p){try{return replay(s,p)!==null;}catch{return false;}}
function propose(s,{actorId,beastId,destination,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId)||typeof beastId!=='string'||
  typeof destination!=='string'||!integer(witnessIndex,0,s.log.length-1))
  throw Error('Real individual visitor and fresh witnessed linked destination only; no caller chosen consent or movement');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  b=s.beasts?.[beastId],now=s.world.minutes,day=Math.floor(now/1440),
  route=p&&b?Preflight.routeStatus(s,p,b,destination):null,
  witness=structuredClone(s.log[witnessIndex]),d=witness?.details,
  arr=p?.originalSapientArrangements?.find(x=>x.seal===d?.arrangementSeal),
  pair=p?.originalBondPairRecognitions?.find(x=>x.seal===d?.pairSeal);
 if(!p||!b||!route?.proposalEligible||!verify(s,p)||!arr||!pair?.source.accepted||
  pair.source.beastId!==b.id||arr.source.beastId!==b.id||
  Arr.statusAt(arr,now)!=='accepted')
  throw Error('An actual independently arrived, fit and still mutually willing original pair is required');
 const from=route.from,at=Presence.resolve(w,actorId,from,day,now%1440),
  body=s.table.combatants['npc_'+p.id],rows=p.originalSapientVisitorLegProposals||[],
  old=rows.at(-1);
 const q={origin:ORIGIN,previous:old?.seal??p.originHash,
  actorId,actorOriginHash:p.originHash,beastId,beastOriginHash:b.sapientLife.sourceHash,
  pairSeal:pair.seal,arrangementSeal:arr.seal,
  arrangementRevision:arr.events.at(-1)?.seal??arr.seal,
  arrivalSeal:route.sourceArrivalHash,minute:now,day,from,to:destination,
  fromRegion:Atlas.LOCATION_REGION[from],toRegion:Atlas.LOCATION_REGION[destination],
  law:Travel.legSpec(destination),combatEntrySeal:body.npcOrigin.seal,
  humanStaminaAtProposal:body.stamina,humanStaminaUnspent:body.stamina,
  afterHumanLocation:from,afterBeastLocation:b.location,
  originalShift:structuredClone(at?.presence),
  witness,witnessHash:hash(witness),beastDisposition:Agency.profile(s,b).disposition,
  noMovementOrAssumedFurtherConsent:true};
 if(rows.length>=100||rows.some(x=>x.source.witnessHash===q.witnessHash||
  x.source.pairSeal===q.pairSeal&&x.source.day===day)||
  !witnessed(p,b,q)||!sourceAt(s,p,b,q)||
  !s.chatRuntime?.scene?.includes(p.name)||!s.chatRuntime.scene.includes(b.name))
  throw Error('A distinct originally witnessed informed visitor-leg discussion is required once per pair and day');
 q.humanChoice=Arr.humanChoice(p,q.witnessHash);
 q.beastChoice=q.humanChoice.accepted?
  Social.sapientChoice(b.sapientLife,q.beastDisposition):null;
 q.mutuallyInterested=!!(q.humanChoice.accepted&&q.beastChoice?.outcome==='accepted');
 q.outcome=q.mutuallyInterested?'both-consider-visitor-leg':
  !q.humanChoice.accepted?'visitor-human-refused':'visitor-beast-refused';
 const seal=hash(q);rows.push({source:q,seal});p.originalSapientVisitorLegProposals=rows;
 if(!verify(s,p))throw Error('Original visitor-leg source decision provenance invalid');
 return {actorId,beastId,from,to:destination,mutuallyInterested:q.mutuallyInterested,
  outcome:q.outcome,sourceHash:seal,noArrivalOrAdditionalConsent:true,privateToGM:true};
}
function privateStatus(s,p){
 const rows=replay(s,p);if(!rows)throw Error('Visitor proposal history cannot be verified');
 return rows.map(x=>({from:x.source.from,to:x.source.to,
  minute:x.source.minute,beastId:x.source.beastId,outcome:x.source.outcome,
  sourceHash:x.seal,noActualReturnOrCompelledTravel:true,privateToGM:true}));
}
module.exports={ORIGIN,WITNESS,verify,propose,privateStatus};
