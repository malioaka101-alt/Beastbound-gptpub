'use strict';
// PRIVATE, non-mutating preflight for an independent pair's eventual
// terrestrial journey. No consent is generated here, no NPC or beast is
// moved, no player travel is invoked, and no Grade or contract is granted.
const E=require('../engine'),Atlas=require('../world/atlas'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Presence=require('../world/person-presence'),Person=require('../world/sapient-beast-persons'),
 Pair=require('./independent-original-bond-pair'),
 Interactions=require('./independent-original-bond-interactions'),
 Arr=require('./independent-sapient-arrangements'),Health=require('./unified'),
 Travel=require('./travel-shared-original-law');
function routeStatus(s,p,b,destination){
 const deny=reason=>({privateToGM:true,proposalEligible:false,reason,
  noMovementOrConsentOrGrade:true});
 if(!s||!p||!b||typeof destination!=='string'||!E.LOCATIONS[destination])
  return deny('missing-original-individual-or-established-destination');
 const w=Realm.peek(s),from=s.world.location,
  here=E.LOCATIONS[from],to=E.LOCATIONS[destination],
  day=Math.floor(s.world.minutes/1440),minute=s.world.minutes%1440;
 if(!here||!to||!here.exits.includes(destination)||from===destination)
  return deny('not-one-original-linked-leg');
 if(!Atlas.LOCATION_REGION[from]||Atlas.LOCATION_REGION[from]!==Atlas.LOCATION_REGION[destination])
  return deny('cross-region-route-needs-separate-original-journey-owner');
 if(s.battle||s.encounter)return deny('original-encounter-or-combat-unresolved');
 if(!People.verify(w,p)||p.status!=='active'||p.ageBand!=='adult, exact birthday not established')
  return deny('original-adult-human-unavailable');
 const seen=Presence.resolve(w,p.actorId,from,day,minute);
 if(!seen?.presence||seen.presence.originHash!==p.originHash)
  return deny('no-verified-individual-physical-attendance');
 if(!b.sapientLife||!Person.verify(b)||b.location!==from||b.away===true||
  b.owner!==null||s.player.partnerIds?.includes(b.id)||!Arr.safe(b))
  return deny('actual-independent-sapient-person-not-present-and-safe');
 if(!Pair.verify(s,p)||!Interactions.verify(s,p))return deny('original-pair-history-unverified');
 const pair=Interactions.privateStatus(s,p).find(x=>x.beastId===b.id);
 const active=(p.originalSapientArrangements||[]).some(x=>x.source.beastId===b.id&&
  Arr.statusAt(x,s.world.minutes)==='accepted');
 if(!pair||!active||pair.bond.fractured)
  return deny('no-current-accepted-revocable-pair-arrangement');
 const body=s.table?.combatants?.['npc_'+p.id];
 if(!body?.npcOrigin||body.npcOrigin.location!==from||
  body.status!=='ok'||body.wounds?.some(x=>x!==0))
  return deny('no-real-uninjured-source-linked-human-combat-body');
 const condition=Health.currentNpcWoundCondition(s,p.actorId);
 if(!condition||condition.workAndOrdinaryPracticeBlocked)
  return deny('original-combat-body-not-fit-for-journey');
 const law=Travel.legSpec(destination);
 if(body.stamina<law.stamina)return deny('insufficient-original-human-stamina');
 return {privateToGM:true,proposalEligible:true,from,to:destination,
  ...law,originalHumanActorId:p.actorId,independentBeastId:b.id,
  humanShiftHash:seen.presence.hash,actualOriginalCombatEntrySeal:body.npcOrigin.seal,
  noMovementOrConsentOrGrade:true};
}
module.exports={routeStatus};
