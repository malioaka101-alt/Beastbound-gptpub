'use strict';
// Private read-only ORIGINAL source check for a genuinely arrived independent
// human and sapient person's POSSIBLE next adjacent terrestrial leg.
// This grants NO travel, future presence, free recovery, beast consent,
// contract, Grade or player knowledge. Separate fresh proposal, witnessed
// decision, physical resource payment and source-replayed journey are still
// required before any return/onward movement can be added.
const E=require('../engine'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),Presence=require('../world/person-presence'),
 Person=require('../world/sapient-beast-persons'),
 Pair=require('./independent-original-bond-pair'),
 Interactions=require('./independent-original-bond-interactions'),
 Arr=require('./independent-sapient-arrangements'),
 Journey=require('./independent-sapient-terrestrial-journey'),
 Health=require('./unified'),Travel=require('./travel-shared-original-law'),
 Atlas=require('../world/atlas');
function routeStatus(s,p,b,destination){
 const deny=reason=>({privateToGM:true,proposalEligible:false,reason,
  noMovementOrConsentOrGrade:true});
 if(!s||!p||!b||typeof destination!=='string'||!E.LOCATIONS[destination])
  return deny('missing-original-individual-or-established-destination');
 const w=Realm.peek(s),minute=s.world.minutes,day=Math.floor(minute/1440),
  pos=Journey.position(p,minute);
 if(!pos?.arrived)return deny('no-verified-original-visitor-arrival');
 if(!Journey.verify(s,p)||!People.verify(w,p)||p.status!=='active'||
  p.ageBand!=='adult, exact birthday not established')
  return deny('original-visitor-history-or-adult-source-unverified');
 const from=pos.location,here=E.LOCATIONS[from],to=E.LOCATIONS[destination];
 if(!here?.exits?.includes(destination)||!to||from===destination)
  return deny('not-one-original-linked-leg');
 if(!Atlas.LOCATION_REGION[from]||!Atlas.LOCATION_REGION[destination])
  return deny('unverified-original-linked-regions');
 const last=(p.originalSapientTerrestrialJourneys||[]).filter(x=>x.source.departed).at(-1),
  q=last?.source;
 if(!q||last.seal!==pos.sourceHash||q.beastId!==b.id||
  q.to!==from||q.arrivalMinute>minute)
  return deny('not-the-original-co-travelling-sapient-person');
 const at=Presence.resolve(w,p.actorId,from,day,minute%1440);
 if(!at?.presence||at.presence.source!==Journey.VISITOR||
  at.presence.arrivedBy!==last.seal||
  at.presence.originHash!==p.originHash)
  return deny('no-verified-current-visitor-attendance');
 if(!b.sapientLife||!Person.verify(b)||b.location!==from||b.away===true||
  b.owner!==null||s.player.partnerIds?.includes(b.id)||!Arr.safe(b))
  return deny('independent-sapient-person-not-currently-present-and-fit');
 if(!Pair.verify(s,p)||!Interactions.verify(s,p)||!Arr.verify(s,p))
  return deny('original-pair-or-arrangement-history-unverified');
 const active=(p.originalSapientArrangements||[]).some(x=>
  x.source.beastId===b.id&&Arr.statusAt(x,minute)==='accepted'),
  pair=Interactions.privateStatus(s,p).find(x=>x.beastId===b.id);
 if(!active||!pair||pair.bond.fractured)
  return deny('no-current-revocable-mutual-travel-arrangement');
 const body=s.table?.combatants?.['npc_'+p.id],condition=
  Health.currentNpcWoundCondition(s,p.actorId);
 if(!body?.npcOrigin||body.npcOrigin.seal!==q.combatSeal||
  body.status!=='ok'||body.wounds?.some(x=>x!==0)||!condition||
  condition.workAndOrdinaryPracticeBlocked)
  return deny('original-source-linked-human-combat-body-unfit');
 const law=Travel.legSpec(destination);
 if(body.stamina<law.stamina)return deny('insufficient-original-human-stamina');
 if(minute%1440+law.minutes>1440)
  return deny('original-linked-leg-must-finish-in-current-day');
 return {privateToGM:true,proposalEligible:true,from,to:destination,
  ...law,sourceArrivalHash:last.seal,originalHumanActorId:p.actorId,
  independentSapientId:b.id,fromRegion:Atlas.LOCATION_REGION[from],
  toRegion:Atlas.LOCATION_REGION[destination],
  physicallyPresentAtVisitedLocation:true,
  requiresNewSeparateWitnessAndIndependentDecisions:true,
  noMovementOrConsentOrGrade:true};
}
module.exports={routeStatus};
