'use strict';
// Private read-only ORIGINAL ecology exposure of an individually verified
// human + independent sapient traveller. Existing Atlas dangers are known
// long-run regional hazards, not events. Existing WildLives critical pressure,
// quality, water and forage thresholds indicate stress/shortage, not a roll
// or actual storm, wound, sickness, weather shield or changed travel law.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Person=require('../world/sapient-beast-persons'),
 Journey=require('./independent-sapient-terrestrial-journey'),
 Presence=require('../world/person-presence'),
 Atlas=require('../world/atlas'),Travel=require('./travel-shared-original-law'),
 Initial=require('./independent-sapient-terrestrial-preflight'),
 Visitor=require('./independent-sapient-terrestrial-return-preflight');
const ORIGIN='original-source-independent-terrestrial-travel-ecology-exposure-v1',
 ORIGINAL_THRESHOLDS=Object.freeze({stressPressureAbove:73,
  stressQualityBelow:30,shortageForageBelow:30,shortageWaterBelow:25}),
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 integer=(n,a=0,z=1000000000)=>Number.isInteger(n)&&n>=a&&n<=z,
 same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function region(s,site){
 const w=Realm.peek(s),id=Atlas.LOCATION_REGION[site],
  reg=id&&Atlas.R[id],eco=id&&w.ecosystems?.[id];
 if(!reg||!eco||!Array.isArray(reg.dangers)||
  ![eco.pressure,eco.quality,eco.forage,eco.water].every(v=>integer(v,0,100)))
  return null;
 const snapshot={regionId:id,regionName:reg.name,
  sourceBiome:reg.biome,originalAtlasKnownDangers:[...reg.dangers],
  originalEcology:{pressure:eco.pressure,quality:eco.quality,
   forage:eco.forage,water:eco.water},
  preExistingWildlifeStressPressure:eco.pressure>ORIGINAL_THRESHOLDS.stressPressureAbove,
  preExistingWildlifeStressQuality:eco.quality<ORIGINAL_THRESHOLDS.stressQualityBelow,
  preExistingForageShortage:eco.forage<ORIGINAL_THRESHOLDS.shortageForageBelow,
  preExistingWaterShortage:eco.water<ORIGINAL_THRESHOLDS.shortageWaterBelow};
 return snapshot;
}
function assessment(s,{actorId,beastId,destination,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId)||typeof beastId!=='string'||
  typeof destination!=='string')
  throw Error('Only exact real original individuals and a named original linked destination; no chosen hazard, weather, wound, roll or consent');
 const deny=reason=>({privateToGM:true,verifiedOriginalPhysicalPair:false,
  routeSourceAvailable:false,reason,
  noMovementOrTimeOrRngOrWoundOrTravelConsentChanged:true,
  noHazardOccurrenceOrGradeOrNewEnvironmentalLaw:true});
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  b=s.beasts?.[beastId],minute=s.world.minutes,
  visitor=p&&Journey.position(p,minute),
  sourceSite=visitor?.arrived?visitor.location:s.world.location;
 if(!p||!b||!People.verify(w,p)||!Person.verify(b)||
  !Journey.verify(s,p)||p.status!=='active'||b.owner!==null||
  s.player?.partnerIds?.includes(b.id)||b.away===true||
  b.location!==sourceSite||!b.sapientLife)
  return deny('unverified-original-independent-physically-present-pair');
 if(!E.LOCATIONS[sourceSite]?.exits?.includes(destination)||
  !E.LOCATIONS[destination]||!Atlas.LOCATION_REGION[sourceSite]||
  !Atlas.LOCATION_REGION[destination])
  return deny('not-a-verified-existing-original-linked-route');
 const departure=visitor?.arrived,
  presence=Presence.resolve(w,actorId,sourceSite,
   Math.floor(minute/1440),minute%1440)?.presence,
  originalSigned=departure?Journey.visitorPresence(p,minute,sourceSite):null;
 if(!presence||presence.originHash!==p.originHash||
  departure&&(!originalSigned||!same(presence,originalSigned)||
   originalSigned.arrivedBy!==visitor.sourceHash||
   !b.sapientLife.terrestrialJourneyReceipts?.some(x=>x.seal===visitor.sourceHash)))
  return deny('no-source-verified-original-current-physical-attendance');
 const from=region(s,sourceSite),to=region(s,destination);
 if(!from||!to)return deny('original-ecosystem-source-not-established');
 const law=Travel.legSpec(destination),
  readiness=departure?Visitor.routeStatus(s,p,b,destination):
   Initial.routeStatus(s,p,b,destination);
 // The original player's weather field is observed at the PLAYER'S
 // physical site. A travelling independent pair away from that place
 // must not magically know that remote site's present weather.
 const weatherLocal=s.world.location===sourceSite?
  s.world.weather??null:null;
 const q={origin:ORIGIN,minute,day:Math.floor(minute/1440),
  actorId,humanOriginHash:p.originHash,
  beastId,beastPersonSourceHash:b.sapientLife.sourceHash,
  sourceSite,destination,arrivedIndependentVisitor:!!departure,
  sourceHumanPresenceHash:presence.hash,
  currentOriginalArrivalSeal:visitor?.arrived?visitor.sourceHash:null,
  originalDirectPhysicalRoute:E.LOCATIONS[sourceSite].exits.includes(destination),
  originalTransitLaw:law,
  authenticSourceWeatherOnlyAtPlayerLocatedSite:weatherLocal,
  originalFrom:from,originalTo:to,
  ecologicalCriteriaSource:'world/wild-lives.js original wildlife stressed and forage availability gates',
  originalThresholds:{...ORIGINAL_THRESHOLDS},
  noDirectlyWitnessedStormFloodRiftWoundOrInjury:true,
  noHazardDamageOrChangeToTravelLaw:true};
 const currentContext={privateToGM:true,verifiedOriginalPhysicalPair:true,
  routeSourceAvailable:true,from:sourceSite,to:destination,
  originalLinkedMinutes:law.minutes,originalHumanStaminaCost:law.stamina,
  originalIndependentProposalEligible:!!readiness.proposalEligible,
  originalIndependentProposalBlocker:readiness.proposalEligible?null:readiness.reason,
  observedWeatherAtRemoteSiteUnknown:s.world.location!==sourceSite,
  actualPlayerLocalWeatherSourceOnly:weatherLocal,
  potentialLongTermAtlasDangersByRegion:{
   from:from.originalAtlasKnownDangers,
   to:to.originalAtlasKnownDangers},
  originalHabitatStressAndShortageByRegion:{
   from:{pressure:from.preExistingWildlifeStressPressure,
    quality:from.preExistingWildlifeStressQuality,
    forage:from.preExistingForageShortage,
    water:from.preExistingWaterShortage},
   to:{pressure:to.preExistingWildlifeStressPressure,
    quality:to.preExistingWildlifeStressQuality,
    forage:to.preExistingForageShortage,
    water:to.preExistingWaterShortage}},
  originalSourceEvidence:q,
  evidenceHash:hash(q),
  requiresSeparateActuallyWitnessedHazardAndAnOriginalLawfulCheck:true,
  longTermEnvironmentalRisksDoNotProveCurrentIncident:true,
  noMovementOrTimeOrRngOrWoundOrTravelConsentChanged:true,
  noHazardOccurrenceOrGradeOrNewEnvironmentalLaw:true};
 return currentContext;
}
module.exports={ORIGIN,ORIGINAL_THRESHOLDS,region,assessment};
