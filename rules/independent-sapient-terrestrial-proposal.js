'use strict';
// Actual independently considered terrestrial itinerary. This is a SEPARATE
// source-owned proposal, not a visit, ticket, transport, bond or free arrival.
// Both people draw their own willingness once; no one is moved or charged.
const Crypto=require('node:crypto'),E=require('../engine'),C=require('./core'),
 Atlas=require('../world/atlas'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),Presence=require('../world/person-presence'),
 Person=require('../world/sapient-beast-persons'),Agency=require('./beast-agency'),
 Social=require('./beast-social-arrangements'),Arr=require('./independent-sapient-arrangements'),
 Pair=require('./independent-original-bond-pair'),
 Route=require('./independent-sapient-terrestrial-preflight'),
 Original=require('./travel-shared-original-law');
const ORIGIN='source-considered-independent-linked-terrestrial-journey-v1',
 WITNESS='gm-witnessed-independent-sapient-linked-journey-proposal-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 integer=(n,a=0,z=1000000000)=>Number.isInteger(n)&&n>=a&&n<=z,
 long=x=>typeof x==='string'&&x.trim().length>=25&&x.length<=850;
function validWitness(p,b,q){
 const w=q.witness,d=w?.details;
 return w?.type==='story'&&long(w.text)&&w.text.includes(p.name)&&w.text.includes(b.name)&&
  w.day===q.day+1&&w.time===E.clock({world:{minutes:q.minute}})&&
  d?.origin===WITNESS&&d.actorId===p.actorId&&d.beastId===b.id&&
  d.from===q.from&&d.to===q.to&&d.arrangementSeal===q.arrangementSeal&&
  d.recognisedPairSeal===q.pairSeal&&d.originalHumanCombatSeal===q.combatEntrySeal&&
  d.originalLinkedLegMinutes===q.law.minutes&&d.originalHumanStaminaCost===q.law.stamina&&
  d.separateInformedHumanAndBeastChoices===true&&d.noCompelledDepartureOrReturn===true&&
  d.noGuaranteedArrivingBeastOrHazardClearance===true&&
  long(d.actualInformedDestinationAndPurpose)&&long(d.actualKnownRouteRisks)&&
  long(d.individualRightToDecline)&&long(d.originalAvailableTravelMeans);
}
function lawAt(s,p,b,q){
 const from=E.LOCATIONS[q.from],to=E.LOCATIONS[q.to],body=s.table?.combatants?.['npc_'+p.id],
  shift=q.originalShift;
 if(!from?.exits?.includes(q.to)||!to||q.from===q.to||
  !integer(q.minute,0,s.world.minutes)||q.day!==Math.floor(q.minute/1440)||
  q.fromRegion!==Atlas.LOCATION_REGION[q.from]||
  q.toRegion!==Atlas.LOCATION_REGION[q.to]||
  !eq(q.law,Original.legSpec(q.to))||
  shift?.source!==People.SHIFT||shift.npcId!==p.actorId||
  shift.actorId!==p.actorId||shift.personId!==p.id||
  shift.originHash!==p.originHash||shift.name!==p.name||
  shift.profession!==p.profession||shift.polity!==p.polity||
  shift.location!==q.from||shift.fromDay>q.day||shift.throughDay<q.day||
  shift.scheduledAtDay!==shift.fromDay||shift.throughDay-shift.fromDay!==5||
  hash(Object.fromEntries(Object.entries(shift).filter(([k])=>k!=='hash')))!==shift.hash||
  body?.npcOrigin?.seal!==q.combatEntrySeal||
  !integer(q.humanStaminaAtProposal,q.law.stamina,body?.maxStamina)||
  q.afterHumanStamina!==q.humanStaminaAtProposal||
  q.afterBeastLocation!==q.from||q.afterHumanLocation!==q.from||
  q.noMovementAndNoPayment!==true)return false;
 return true;
}
function replay(s,p){
 if(p?.originalSapientTerrestrialProposals===undefined)return [];
 const rows=p.originalSapientTerrestrialProposals,w=Realm.peek(s);
 if(!People.verify(w,p)||!Pair.verify(s,p)||!Arr.verify(s,p)||
  !Array.isArray(rows)||rows.length>180)return null;
 let prev=p.originHash,last=-1;const seen=new Set(),days=new Set();
 for(const row of rows){
  const q=row?.source,b=s.beasts?.[q?.beastId],
   arr=p.originalSapientArrangements?.find(x=>x.seal===q?.arrangementSeal);
  if(!q||row.seal!==hash(q)||q.origin!==ORIGIN||q.previous!==prev||
   q.actorId!==p.actorId||q.actorOriginHash!==p.originHash||
   !b?.sapientLife||!Person.verify(b)||q.beastOriginHash!==b.sapientLife.sourceHash||
   !p.originalBondPairRecognitions?.some(x=>x.seal===q.pairSeal&&x.source.accepted&&
    x.source.beastId===q.beastId&&x.source.minute<=q.minute)||
   arr?.source.beastId!==b.id||!Pair.revision(arr,q.minute,q.arrangementRevision)||
   !integer(q.minute,last+1,s.world.minutes)||!integer(q.day,0)||q.day!==Math.floor(q.minute/1440)||
   q.witnessHash!==hash(q.witness)||!validWitness(p,b,q)||seen.has(q.witnessHash)||
   days.has(q.pairSeal+':'+q.day)||!lawAt(s,p,b,q)||
   q.humanChoice?.personality!==p.personality||
   !Arr.verifyHuman(q.humanChoice,q.witnessHash)||
   q.beastDisposition!==Agency.profile(s,b).disposition||q.noAssumedBondOrAgreement!==true)return null;
  if(q.humanChoice.accepted){
   const bc=q.beastChoice;
   if(!bc||bc.disposition!==q.beastDisposition||
    !integer(bc.rngBefore,1,4294967295)||
    !eq(bc,Social.sapientChoice({rngState:bc.rngBefore},bc.disposition)))return null;
  }else if(q.beastChoice!==null)return null;
  const mutual=q.humanChoice.accepted&&q.beastChoice?.outcome==='accepted';
  if(q.mutuallyInterested!==mutual||
   q.outcome!==(mutual?'both-consider-leg':!q.humanChoice.accepted?'human-refused':'beast-refused'))return null;
  seen.add(q.witnessHash);days.add(q.pairSeal+':'+q.day);
  last=q.minute;prev=row.seal;
 }
 return rows;
}
function verify(s,p){try{return replay(s,p)!==null;}catch{return false;}}
function propose(s,{actorId,beastId,destination,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId)||
  typeof beastId!=='string'||typeof destination!=='string'||
  !integer(witnessIndex,0,s.log.length-1))
  throw Error('Only genuine observed individuals, exact linked destination and fresh proposal witness; no chosen consent, cost or movement');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],b=s.beasts?.[beastId],
  now=s.world.minutes,day=Math.floor(now/1440),from=s.world.location,
  route=p&&b?Route.routeStatus(s,p,b,destination):null,
  witness=structuredClone(s.log[witnessIndex]),d=witness?.details,
  arrangement=p?.originalSapientArrangements?.find(x=>x.seal===d?.arrangementSeal),
  pair=p?.originalBondPairRecognitions?.find(x=>x.seal===d?.recognisedPairSeal);
 if(!p||!b||!route?.proposalEligible||!Pair.verify(s,p)||!Arr.verify(s,p)||!verify(s,p)||
  !pair?.source.accepted||pair.source.beastId!==beastId||
  arrangement?.source.beastId!==beastId||Arr.statusAt(arrangement,now)!=='accepted')
  throw Error('A real uninjured independently co-present consenting pair and original affordable linked route are required');
 const presence=Presence.resolve(w,actorId,from,day,now%1440),combat=s.table.combatants['npc_'+p.id],
  rows=p.originalSapientTerrestrialProposals||[],last=rows.at(-1),
  q={origin:ORIGIN,previous:last?.seal??p.originHash,actorId,actorOriginHash:p.originHash,
   beastId,beastOriginHash:b.sapientLife.sourceHash,pairSeal:pair.seal,
   arrangementSeal:arrangement.seal,arrangementRevision:arrangement.events.at(-1)?.seal??arrangement.seal,
   minute:now,day,from,to:destination,
   fromRegion:Atlas.LOCATION_REGION[from],toRegion:Atlas.LOCATION_REGION[destination],
   law:Original.legSpec(destination),combatEntrySeal:combat.npcOrigin.seal,
   humanStaminaAtProposal:combat.stamina,afterHumanStamina:combat.stamina,
   afterHumanLocation:from,afterBeastLocation:b.location,
   originalShift:structuredClone(presence.presence),
   witness,witnessHash:hash(witness),beastDisposition:Agency.profile(s,b).disposition,
   noMovementAndNoPayment:true,noAssumedBondOrAgreement:true};
 if(rows.length>=180||rows.some(x=>x.source.witnessHash===q.witnessHash||
  x.source.pairSeal===q.pairSeal&&x.source.day===day)||
  !validWitness(p,b,q)||!lawAt(s,p,b,q)||
  !s.chatRuntime?.scene?.includes(p.name)||!s.chatRuntime.scene.includes(b.name))
  throw Error('Distinct explicitly witnessed original linked-leg proposal required, once per pair and calendar day');
 q.humanChoice=Arr.humanChoice(p,q.witnessHash);
 q.beastChoice=q.humanChoice.accepted?Social.sapientChoice(b.sapientLife,q.beastDisposition):null;
 q.mutuallyInterested=!!(q.humanChoice.accepted&&q.beastChoice?.outcome==='accepted');
 q.outcome=q.mutuallyInterested?'both-consider-leg':!q.humanChoice.accepted?'human-refused':'beast-refused';
 const seal=hash(q);rows.push({source:q,seal});p.originalSapientTerrestrialProposals=rows;
 if(!verify(s,p))throw Error('Independent original linked journey proposal source replay failed');
 return {humanActorId:actorId,beastId,originalDestination:destination,outcome:q.outcome,
  bothSeparatelyInterested:q.mutuallyInterested,sourceHash:seal,
  noActualJourneyOrStaminaCost:true,noAssignedFutureConsentOrCompelledReturn:true};
}
function privateStatus(s,p){
 const rows=replay(s,p);if(!rows)throw Error('Independent terrestrial itinerary proposal provenance invalid');
 return rows.map(x=>({actorId:p.actorId,beastId:x.source.beastId,
  to:x.source.to,minute:x.source.minute,outcome:x.source.outcome,
  sourceHash:x.seal,noMovementOrCompelledTravel:true,privateToGM:true}));
}
module.exports={ORIGIN,WITNESS,propose,verify,privateStatus};
