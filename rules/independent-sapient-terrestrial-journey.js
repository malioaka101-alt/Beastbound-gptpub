'use strict';
// Source-owned independently chosen original physical linked legs. The first
// original home leg and a later visitor-site proposal each need their OWN
// witnessed proposal and fresh independent departure decision. Neither
// older agreement nor an arrival supplies consent, travel or player knowledge.
const Crypto=require('node:crypto'),E=require('../engine'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Person=require('../world/sapient-beast-persons'),Presence=require('../world/person-presence'),
 Pair=require('./independent-original-bond-pair'),Arr=require('./independent-sapient-arrangements'),
 Social=require('./beast-social-arrangements'),Agency=require('./beast-agency'),
 Route=require('./independent-sapient-terrestrial-preflight'),
 Proposal=require('./independent-sapient-terrestrial-proposal'),
 Travel=require('./travel-shared-original-law'),World=require('./world'),
 Health=require('./unified'),Atlas=require('../world/atlas');
const ORIGIN='source-actual-independent-original-linked-terrestrial-leg-v1',
 WITNESS='gm-witnessed-independent-linked-terrestrial-departure-v1',
 VISITOR='source-earned-independent-terrestrial-visitor-presence-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 integer=(x,a=0,z=1000000000)=>Number.isInteger(x)&&x>=a&&x<=z,
 prose=x=>typeof x==='string'&&x.trim().length>=25&&x.length<=900;
function witnessValid(p,b,q){
 const w=q.witness,d=w?.details;
 return w?.type==='story'&&prose(w.text)&&w.text.includes(p.name)&&w.text.includes(b.name)&&
  w.day===q.day+1&&w.time===E.clock({world:{minutes:q.minute}})&&
  d?.origin===WITNESS&&d.actorId===p.actorId&&d.beastId===b.id&&
  d.proposalSeal===q.proposalSeal&&d.from===q.from&&d.to===q.to&&
  d.actualFreshDepartureDecision===true&&d.noAssumedFutureConsentOrOwnedBeast===true&&
  d.originalRouteMinutes===q.law.minutes&&d.originalHumanStaminaCost===q.law.stamina&&
  prose(d.currentInformedDepartureAndReturnFreedom)&&
  prose(d.originalRouteConditionsAndKnownHazards)&&
  prose(d.actualIndividualBeastMovementAbility)&&
  d.noCompelledUnsafeWeatherOrHazardBypass===true;
}
// Structure is intentionally independent from People.verify and Person.verify.
// They consult this physically chronological owner for their own presence
// projection; the full engine-sided verifier cross-checks both people.
function structure(p){
 const rows=p?.originalSapientTerrestrialJourneys;
 if(rows===undefined)return true;
 if(!Array.isArray(rows)||rows.length>24)return false;
 let prev=p.originHash,last=-1,at=null;
 const seen=new Set();
 for(const row of rows){
  const q=row?.source;
  if(!q||row.seal!==hash(q)||q.origin!==ORIGIN||q.previous!==prev||
   q.actorId!==p.actorId||q.humanHash!==p.originHash||
   !integer(q.minute,last+1)||q.day!==Math.floor(q.minute/1440)||
   !E.LOCATIONS[q.from]?.exits?.includes(q.to)||!E.LOCATIONS[q.to]||
   q.fromRegion!==Atlas.LOCATION_REGION[q.from]||q.toRegion!==Atlas.LOCATION_REGION[q.to]||
   !eq(q.law,Travel.legSpec(q.to))||
   q.originalProposalSourceHash!==hash(q.originalProposalSource)||
   ![Proposal.ORIGIN,'source-actually-considered-independent-terrestrial-visitor-next-leg-v1'].includes(q.originalProposalSource?.origin)||
   q.originalProposalSource?.actorId!==p.actorId||
   q.originalProposalSource?.beastId!==q.beastId||
   q.originalProposalSource?.from!==q.from||
   q.originalProposalSource?.to!==q.to||
   q.originalProposalSource?.mutuallyInterested!==true||
   q.originalProposalSource?.minute>q.minute||
   !integer(q.staminaBefore,q.law.stamina,q.originalHumanMaxStamina)||
   q.staminaAfter!==q.staminaBefore-(q.departed?q.law.stamina:0)||
   q.arrivalMinute!==q.minute+(q.departed?q.law.minutes:0)||
   q.arrivalMinute>q.minute+1440||
   q.noPlayerMovementOrPartnership!==true||
   !integer(q.beastFatigueBefore,0,100)||
   q.beastFatigueAfter!==q.beastFatigueBefore||
   q.departed!==(q.humanChoice?.accepted&&q.beastChoice?.outcome==='accepted')||
   !integer(q.humanChoice?.rngBefore,1,4294967295)||
   q.humanChoice?.personality!==p.personality||
   !Arr.verifyHuman(q.humanChoice,q.witnessHash)||
   q.witnessHash!==hash(q.witness)||
   seen.has(q.witnessHash)||!integer(q.minute%1440,0,1440-q.law.minutes)||
   q.from!==(at??q.from)||q.day<0)return false;
  if(q.humanChoice.accepted){
   if(!q.beastChoice||!integer(q.beastChoice.rngBefore,1,4294967295)||
    !eq(q.beastChoice,Social.sapientChoice({rngState:q.beastChoice.rngBefore},q.beastDisposition)))return false;
  }else if(q.beastChoice!==null)return false;
  if(q.departed){
   if(at!==null&&at!==q.from)return false;
   at=q.to;
  }
  last=q.minute;prev=row.seal;seen.add(q.witnessHash);
 }
 return true;
}
function position(p,minute){
 if(!integer(minute)||!structure(p))return {invalid:true};
 let location=null;
 for(const row of p.originalSapientTerrestrialJourneys||[]){
  const q=row.source;if(!q.departed||q.minute>minute)continue;
  if(minute<q.arrivalMinute)return {inTransit:true,from:q.from,to:q.to,sourceHash:row.seal};
  location=q.to;
 }
 const latest=(p.originalSapientTerrestrialJourneys||[]).filter(x=>
  x.source.departed&&x.source.arrivalMinute<=minute).at(-1);
 return location===null?null:{arrived:true,location,
  sourceHash:latest?.seal,arrivalMinute:latest?.source.arrivalMinute};
}
function awayDuring(p,start,end){
 if(!integer(start)||!integer(end,start)||!structure(p))return true;
 return (p.originalSapientTerrestrialJourneys||[]).some(x=>
  x.source.departed&&x.source.minute<end);
}
function visitorPresence(p,minute,location){
 const pos=position(p,minute);
 if(!pos?.arrived||pos.location!==location)return null;
 const day=Math.floor(minute/1440),
  arrivalDay=Math.floor(pos.arrivalMinute/1440),
  fromDay=arrivalDay+6*Math.floor((day-arrivalDay)/6),
  body={source:VISITOR,actorId:p.actorId,npcId:p.actorId,
   personId:p.id,name:p.name,profession:p.profession,polity:p.polity,
   originHash:p.originHash,location,
   arrivedBy:pos.sourceHash,scheduledAtDay:fromDay,fromDay,throughDay:fromDay+5};
 return {...body,hash:hash(body)};
}
function verify(s,p){
 const VisitorProposal=require('./independent-sapient-terrestrial-visitor-proposal');
 if(!structure(p)||!Proposal.verify(s,p)||!VisitorProposal.verify(s,p)||
  !People.verify(Realm.peek(s),p))return false;
 let previousEnd=-1,previousPlace=null;
 for(const row of p.originalSapientTerrestrialJourneys||[]){
  const q=row.source,b=s.beasts?.[q.beastId],
   prop=(q.originalProposalSource?.origin===VisitorProposal.ORIGIN?
    p.originalSapientVisitorLegProposals:p.originalSapientTerrestrialProposals)
    ?.find(x=>x.seal===q.proposalSeal),
   body=s.table?.combatants?.['npc_'+p.id],
   sh=q.originalShift;
  if(!b?.sapientLife||!Person.verify(b)||!prop||!eq(prop.source,q.originalProposalSource)||
   q.humanHash!==p.originHash||q.beastHash!==b.sapientLife.sourceHash||
   !integer(q.minute,previousEnd+1,s.world.minutes)||
   q.arrivalMinute>s.world.minutes||
   !witnessValid(p,b,q)||sh?.hash!==q.originalProposalSource.originalShift?.hash||
   q.combatSeal!==q.originalProposalSource.combatEntrySeal||
   q.originalHumanMaxStamina!==body?.maxStamina||
   body?.npcOrigin?.seal!==q.combatSeal||
   q.beastDisposition!==Agency.profile(s,b).disposition||
   q.originalProposalSource?.mutuallyInterested!==true||
   q.witnessHash===q.originalProposalSource.witnessHash||
   q.actualCurrentWelfare?.condition<60||
   q.actualCurrentWelfare?.fatigue>=70||
   q.actualCurrentWelfare?.hunger>=70||
   q.afterBeastLocation!==(q.departed?q.to:q.from)||
   q.afterHumanLocation!==(q.departed?q.to:q.from)||
   !b.sapientLife.terrestrialJourneyReceipts?.some(x=>x.seal===row.seal)||
   (previousPlace!==null&&q.from!==previousPlace))return false;
  if(q.originalProposalSource.origin===VisitorProposal.ORIGIN){
   const arrivedEarlier=p.originalSapientTerrestrialJourneys?.find(x=>
    x.seal===q.originalProposalSource.arrivalSeal);
   if(!arrivedEarlier?.source.departed||arrivedEarlier.source.to!==q.from||
    arrivedEarlier.source.beastId!==q.beastId||
    arrivedEarlier.source.arrivalMinute>q.originalProposalSource.minute||
    arrivedEarlier.source.minute>=q.originalProposalSource.minute||
    q.originalProposalSource.minute>=q.minute)return false;
  }else if(q.originalProposalSource.origin!==Proposal.ORIGIN)return false;
  previousEnd=q.arrivalMinute;
  if(q.departed)previousPlace=q.to;
 }
 const last=(p.originalSapientTerrestrialJourneys||[]).filter(x=>x.source.departed).at(-1);
 if(last){
  const b=s.beasts?.[last.source.beastId],
   body=s.table?.combatants?.['npc_'+p.id];
  if(b?.location!==last.source.to||body?.stamina!==last.source.staminaAfter)return false;
 }
 return true;
}
function depart(s,{actorId,beastId,proposalSeal,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId)||typeof beastId!=='string'||
  typeof proposalSeal!=='string'||!integer(witnessIndex,0,s.log.length-1))
  throw Error('Exact witnessed independent linked leg proposal only; no chosen assent, arrival, stamina or location');
 const VisitorProposal=require('./independent-sapient-terrestrial-visitor-proposal'),
  VisitorRoute=require('./independent-sapient-terrestrial-return-preflight'),
  w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],b=s.beasts?.[beastId],
  visitor=p?.originalSapientVisitorLegProposals?.find(x=>x.seal===proposalSeal),
  prop=visitor||p?.originalSapientTerrestrialProposals?.find(x=>x.seal===proposalSeal),
  minute=s.world.minutes,day=Math.floor(minute/1440),
  witness=structuredClone(s.log[witnessIndex]),
  route=p&&b&&prop?(visitor?VisitorRoute.routeStatus(s,p,b,prop.source.to):
   Route.routeStatus(s,p,b,prop.source.to)):null,
  body=s.table?.combatants?.['npc_'+p?.id],
  q={origin:ORIGIN,previous:p?.originalSapientTerrestrialJourneys?.at(-1)?.seal??p?.originHash,
   actorId,humanHash:p?.originHash,beastId,beastHash:b?.sapientLife?.sourceHash,
   from:prop?.source.from,to:prop?.source.to,
   fromRegion:prop?.source.fromRegion,toRegion:prop?.source.toRegion,
   originalProposalSource:structuredClone(prop?.source),originalProposalSourceHash:hash(prop?.source),
   proposalSeal,originalShift:structuredClone(prop?.source.originalShift),
   combatSeal:prop?.source.combatEntrySeal,
   minute,day,law:prop?Travel.legSpec(prop.source.to):null,
   staminaBefore:body?.stamina,originalHumanMaxStamina:body?.maxStamina,
   beastFatigueBefore:b?.needs?.fatigue,beastDisposition:b&&Agency.profile(s,b).disposition,
   actualCurrentWelfare:{condition:b?.condition,calculatedNoExtraEnergy:true,
    fatigue:b?.needs?.fatigue,hunger:b?.needs?.hunger},
   witness,witnessHash:hash(witness),noPlayerMovementOrPartnership:true};
 if(!p||!b||!prop||!prop.source.mutuallyInterested||!Proposal.verify(s,p)||
  !structure(p)||!route?.proposalEligible||!verify(s,p)||
  prop.source.actorId!==actorId||prop.source.beastId!==beastId||
  prop.source.minute>minute||prop.source.day!==day||
  (visitor?(!VisitorProposal.verify(s,p)||
   prop.source.origin!==VisitorProposal.ORIGIN||
   prop.source.minute>=minute||
   position(p,minute)?.location!==q.from||
   position(p,minute)?.sourceHash!==prop.source.arrivalSeal):
   (prop.source.origin!==Proposal.ORIGIN||s.world.location!==q.from))||
  (p.originalSapientTerrestrialJourneys||[]).some(x=>x.source.proposalSeal===proposalSeal)||
  (!visitor&&position(p,minute)!==null)||
  b.needs.hunger>=70||b.needs.fatigue>=70||b.condition<60||
  !witnessValid(p,b,q)||!s.chatRuntime?.scene?.includes(p.name)||
  !s.chatRuntime.scene.includes(b.name))
  throw Error('Only the same current still-willing, fit, source-present pair may make a separately witnessed original departure decision');
 if(q.minute%1440+q.law.minutes>1440)throw Error('Every original physical linked leg must finish within its own original calendar day');
 q.humanChoice=Arr.humanChoice(p,q.witnessHash);
 q.beastChoice=q.humanChoice.accepted?Social.sapientChoice(b.sapientLife,q.beastDisposition):null;
 q.departed=!!(q.humanChoice.accepted&&q.beastChoice?.outcome==='accepted');
 q.staminaAfter=q.staminaBefore-(q.departed?q.law.stamina:0);
 q.arrivalMinute=minute+(q.departed?q.law.minutes:0);
 q.beastFatigueAfter=q.beastFatigueBefore;
 q.afterHumanLocation=q.departed?q.to:q.from;
 q.afterBeastLocation=q.departed?q.to:q.from;
 const row={source:q,seal:hash(q)};
 p.originalSapientTerrestrialJourneys||=[];p.originalSapientTerrestrialJourneys.push(row);
 b.sapientLife.terrestrialJourneyReceipts||=[];
 b.sapientLife.terrestrialJourneyReceipts.push({source:structuredClone(q),seal:row.seal});
 if(q.departed){
  body.stamina-=q.law.stamina;
  b.location=q.to;
  E.advance(s,q.law.minutes);World.finalizeTime(s,minute);
 }
 if(!verify(s,p))throw Error('Independent original linked physical journey source verification failed');
 return {departureConsent:q.departed,originalLocation:q.from,
  actualArrival:q.departed?q.to:null,
  actualMinutes:q.departed?q.law.minutes:0,
  actualHumanStaminaPaid:q.departed?q.law.stamina:0,
  originalWitness:row.seal,noPlayerTravelOrPartnership:true,privateToGM:true};
}
function privateStatus(s,p){
 if(!verify(s,p))throw Error('Original independent physical journey history altered');
 return (p.originalSapientTerrestrialJourneys||[]).map(x=>({
  beastId:x.source.beastId,from:x.source.from,to:x.source.to,
  departureMinute:x.source.minute,actualArrivalMinute:x.source.departed?x.source.arrivalMinute:null,
  actuallyDeparted:x.source.departed,staminaPaid:x.source.departed?x.source.law.stamina:0,
  sourceHash:x.seal,privateToGM:true,noPlayerMovement:true}));
}
module.exports={ORIGIN,WITNESS,VISITOR,structure,position,awayDuring,visitorPresence,verify,depart,privateStatus};
