'use strict';
// GM-established, source-witnessed individual life on the EXISTING s.beasts
// and region speciesWeb. No parallel creature registry, fabricated combat
// stats, grades, talents, contracts, sapience or evolutionary permissions.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 Atlas=require('./atlas'),Places=require('./lived-places');
const BIO=require('./bestiary'),DAY=1440,INTERVAL=60,MINUTES=12;
const SOURCE='gm-witnessed-living-beast-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const integer=(x,a,b)=>Number.isInteger(x)&&x>=a&&x<=b;
const text=(x,a,b)=>typeof x==='string'&&x.trim().length>=a&&x.trim().length<=b;
function roll(life){
 let x=life.rngState>>>0;
 if(!x)throw Error('Independent beast must possess an original RNG');
 x^=x<<13;x^=x>>>17;x^=x<<5;
 life.rngState=(x>>>0)||0x91e10da5;
 return life.rngState/4294967296;
}
function sealed(b){
 const root=b?.gmWild?.source;
 const life=b?.individualLife;
 if(!root||root.origin!==SOURCE||b.gmWild.seal!==hash(root)||
    root.id!==b.id||root.speciesId!==b.species||
    b.evolutionStage!=='Unclassified'||
    !root.habitatAtWitness||
    !['forage','water','quality','pressure'].every(k=>
      integer(root.habitatAtWitness[k],0,100))||
    root.locationId!==b.gmWild.originalPlace||
    root.description!==b.gmWild.description||
    !text(root.description,12,500)||!text(root.marker,4,90)||
    !text(root.witness,20,900)||!integer(root.minute,0,1000000000)||
    !life||life.version!==1||life.beastId!==b.id||
    life.species!==b.species||
    life.source?.origin!==SOURCE||
    life.source.beastId!==b.id||life.source.species!==b.species||
    life.source.witnessHash!==b.gmWild.seal||
    life.source.initialDay!==Math.floor(root.minute/DAY)||
    life.sourceHash!==hash(life.source)||
    !integer(life.rngState,1,0xffffffff)||
    !integer(life.lastTickDay,life.source.initialDay,10000000)||
    !Array.isArray(life.history)||!Array.isArray(life.witnessed)||
    !Number.isInteger(life.lastWatchMinute)||
    !['wild','reciprocal partner','former partner'].includes(b.relationship)||
    b.owner!==null||
    (b.gmWild.profile===undefined?
     b.gmWild.verifiedCombatProfile!==false||b.gmWild.verifiedCognition!==false:
     b.gmWild.verifiedCombatProfile!==true||b.gmWild.verifiedCognition!==true)||
    (life.lastEngagementSource!==undefined&&
     (life.lastEngagementHash!==hash(life.lastEngagementSource)||
      life.lastEngagementSource.beastId!==b.id||
      life.lastEngagementSource.rootSeal!==b.gmWild.seal||
      life.lastEngagedWatchMinute!==life.lastEngagementSource.watchedAtMinute)))
  return false;
 return true;
}
function verify(s,b){
 if(!sealed(b))return false;
 const root=b.gmWild.source,w=s.table?.realm,
  species=w?.speciesBiology?.species?.[root.speciesId],
  eco=w?.ecosystems?.[root.regionId],
  population=eco?.speciesWeb?.populations?.[root.speciesId],
  originalPlace=Places.location(s,root.locationId);
 if(!species)return false;
 const {originHash,observations,...originalBiology}=species;
 if(hash(originalBiology)!==originHash)return false;
 if(!verifyProfile(s,b))return false;
 if(b.relationship==='reciprocal partner'&&
    (!b.consent||!s.player?.partnerIds?.includes(b.id)||
      !s.table?.bondRecords?.[b.id]?.contract))return false;
 return !!(population&&originalPlace&&
   root.regionId===originalPlace.regionId&&
   species.originHash===root.speciesOriginHash&&
   population.originHash===root.populationOriginHash&&
   species.provenance==='gm-established'&&
   species.habitatRegions.includes(root.regionId)&&
   species.needs&&population.index>=0&&
   population.origin.startIndex>0&&
   species.needs.minForage<=root.habitatAtWitness.forage&&
   species.needs.minWater<=root.habitatAtWitness.water&&
   species.needs.minQuality<=root.habitatAtWitness.quality&&
   species.needs.maxPressure>=root.habitatAtWitness.pressure&&
   b.gmWild.originalPlace===root.locationId&&
   b.id===root.id);
}
function witnessed(s,p={}){
 const keys=['speciesId','marker','description','witness'];
 if(!p||typeof p!=='object'||Array.isArray(p)||
   Object.keys(p).sort().join('|')!==keys.sort().join('|')||
   !text(p.speciesId,6,90)||!p.speciesId.startsWith('gm:')||
   !text(p.marker,4,90)||!text(p.description,12,500)||
   !text(p.witness,20,900))
  throw Error('A witnessed GM beast requires an established species and direct real scene observations; no caller-chosen rank, combat stat, consent or reaction');
 if(s.battle||s.encounter)
  throw Error('An existing encounter must first be resolved; no creature may be inserted into an unresolved confrontation');
 const place=Places.location(s),scene=s.chatRuntime?.scene;
 if(!place||typeof scene!=='string'||
    !scene.toLowerCase().includes(p.marker.trim().toLowerCase()))
  throw Error('A new individual needs an actually recorded local scene that already mentions its visible marker');
 const w=require('./simulation').ensure(s);
 BIO.bioValidate(w.speciesBiology);
 const species=w.speciesBiology.species[p.speciesId],
  eco=w.ecosystems?.[place.regionId],
  population=eco?.speciesWeb?.populations?.[p.speciesId];
 if(!species||species.provenance!=='gm-established'||
   !species.habitatRegions.includes(place.regionId)||
   !species.needs||!population||population.index<1||
   population.origin.source!=='world-region-species-web-v1'||
   population.originHash!==hash(population.origin))
  throw Error('A genuine individually witnessed wild beast needs recorded GM biology and a real local established species population');
 const n=species.needs;
 if(!eco||eco.forage<n.minForage||eco.water<n.minWater||
  eco.quality<n.minQuality||eco.pressure>n.maxPressure)
  throw Error('The current region does not satisfy recorded physiology; no living presence can be assumed here');
 if(Object.values(s.beasts||{}).some(b=>b?.gmWild?.source?.minute===s.world.minutes&&
   b.gmWild.source.marker===p.marker.trim()&&b.gmWild.source.locationId===place.id))
  throw Error('The same witnessed individual cannot be manufactured twice from the same moment');
 let id;
 do{id='beast_'+(++s.sequence);}while(s.beasts?.[id]);
 const root={origin:SOURCE,id,speciesId:p.speciesId,
  speciesOriginHash:species.originHash,
  populationOriginHash:population.originHash,
  regionId:place.regionId,locationId:place.id,
  habitatAtWitness:{forage:eco.forage,water:eco.water,
   quality:eco.quality,pressure:eco.pressure},
  marker:p.marker.trim(),description:p.description.trim(),
  witness:p.witness.trim(),minute:s.world.minutes,
  noInferredGrade:true,noInferredSapience:true,
  noGrantedAbilityOrContract:true};
 const seal=hash(root),lifeSource={origin:SOURCE,beastId:id,
  species:p.speciesId,witnessHash:seal,initialDay:Math.floor(s.world.minutes/DAY)};
 const rng=Crypto.createHash('sha256')
  .update(String(s.seed)+'|'+id+'|'+seal+'|independent-wildlife-v1')
  .digest().readUInt32BE(0)||0x91e10da5;
 const life={version:1,beastId:id,species:p.speciesId,
  source:lifeSource,sourceHash:hash(lifeSource),
  rngState:rng,lastTickDay:Math.floor(s.world.minutes/DAY),
  lastWatchMinute:-INTERVAL,history:[],witnessed:[]};
 const b={id,name:root.marker,species:p.speciesId,
  // The original current-form field, without claiming a measured Grade,
  // matured stage, evolution ability or known transformation path.
  evolutionStage:'Unclassified',relationship:'wild',
  owner:null,location:place.id,away:false,
  habitatExposure:{[place.id]:1},individualLife:life,
  // Their first visible presence is not a medical examination or a combat
  // profile. Unsupported mechanics must NOT infer these missing properties.
  gmWild:{source:root,seal,originalPlace:place.id,
   description:root.description,verifiedCombatProfile:false,
   verifiedCognition:false}};
 if(!verify(s,b))throw Error('The original witnessed GM beast could not be verified');
 s.beasts||={};s.beasts[id]=b;
 require('../rules/core').event(s,'beast',
  'You notice '+p.marker.trim()+' at '+place.name+'; it remains unapproached and its intentions are unknown.',
  {origin:SOURCE,beastId:id,location:place.id,
   observedDescription:root.description,sourceHash:seal,
   noConsentOrSpeciesIdentificationGranted:true,
   noCombatProfileOrEvolutionCreated:true});
 return {beastId:id,witnessed:true,marker:root.marker,
  observedDescription:root.description,location:place.name,
  noCombatOrBondAllowed:true,noAbilityOrEvolutionGranted:true,
  noEncounterForced:true,noPlayerRoll:true};
}
// Reuse the existing wildlife-watch public route for known GM individuals;
// its distinct first-source proof is established through witnessed() above.
function watch(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
   Object.keys(p).join('|')!=='beastId'||typeof p.beastId!=='string')
  throw Error('GM wildlife observation names only the original creature; it cannot select behaviour or outcomes');
 const b=s.beasts?.[p.beastId];
 if(!b?.gmWild||!verify(s,b))throw Error('Only a source-witnessed GM individual may be observed');
 if(b.gmWild.profile&&b.sapience>=3)throw Error('Sapient individual interactions require actual personhood and dialogue evidence, not an animal routine');
 if(s.battle||s.encounter||b.away||
    b.location!==s.world.location)
  throw Error('The original visible beast is no longer safely available for non-invasive observation');
 if(s.table?.combatants?.player?.status&&
    s.table.combatants.player.status!=='ok')
  throw Error('An incapacitated observer cannot safely watch wildlife');
 const life=b.individualLife,last=life.witnessed.at(-1),
  returned=life.returnEncounters?.at(-1);
 if(last?.type==='witnessed-wildlife-routine'&&
   (!returned||returned.worldMinute<=last.worldMinute||
     returned.originalSourceHash!==life.sourceHash||
     returned.beastId!==b.id||
     returned.location!==s.world.location||
     returned.worldMinute>s.world.minutes||
     !life.history.some(x=>x.type==='observed-return'&&
       x.sourceHash===hash(returned))))
  throw Error('A distinct source-witnessed later re-encounter is required, not another roll from the same sighting');
 if(s.world.minutes-life.lastWatchMinute<INTERVAL)
  throw Error('This animal needs a genuine interval between observations');
 const w=require('./simulation').ensure(s),
   reg=Places.location(s)?.regionId,
   eco=w.ecosystems[reg];
 if(!eco||!verify(s,b))throw Error('The original ecological source has changed');
 const at=s.world.minutes,decision=roll(life);
 const stressed=eco.pressure>73||eco.quality<30;
 const action=stressed&&decision<.60?'withdraw':
  decision<.18?'withdraw':decision<.50?'forage':
  decision<.72?'shelter':'survey';
 const details={
  withdraw:'The creature slips away into the habitat without attempting contact.',
  forage:'The creature quietly investigates nearby natural food sources.',
  shelter:'The creature remains under cover, leaving others undisturbed.',
  survey:'The creature looks over its immediate surroundings without approaching.'
 };
 if(action==='withdraw')b.away=true;
 const observed={type:'witnessed-wildlife-routine',
  day:Math.floor(at/DAY),worldMinute:at,location:b.location,
  action,description:details[action],beastId:b.id,
  originalEncounterHash:returned?.encounterHash||life.source.witnessHash,
  noAssumedAffection:true,noBondAward:true};
 life.witnessed.push(observed);
 if(life.witnessed.length>18)life.witnessed.shift();
 life.history.push({type:'observed',day:observed.day,location:b.location,
  action,sourceHash:hash(observed),observed:true});
 if(life.history.length>24)life.history.shift();
 life.lastWatchMinute=at;
 const C=require('../rules/core'),World=require('../rules/world'),U=require('../rules/unified');
 C.event(s,'beast',details[action],{
  origin:SOURCE,beastId:b.id,action,witnessHash:hash(observed),
  unknownCognition:true,noContactOrProgress:true});
 E.advance(s,MINUTES);World.finalizeTime(s,at);U.sync(s,{source:'legacy'});
 return {observed:true,beastId:b.id,action,description:details[action],
  elapsedMinutes:MINUTES,animalWithdrew:b.away,
  noContactOrBond:true,noFreeIndividualSkills:true,noPlayerRoll:true};
}
function sixday(s,days){
 if(!Array.isArray(days)||!days.length)return {updated:0};
 let updated=0;
 for(const day of days){
  for(const b of Object.values(s.beasts||{})){
   if(!b?.gmWild||b.owner!==null||b.relationship!=='wild'||
      s.encounter?.beastId===b.id||s.battle?.beastId===b.id)continue;
   if(!verify(s,b))throw Error('GM individual wildlife source became unverified before sixday life');
   const life=b.individualLife;
   if(day<=life.lastTickDay)continue;
   const region=b.gmWild.source.regionId,
    eco=s.table?.realm?.ecosystems?.[region];
   if(!eco)throw Error('Independent wildlife requires its source regional ecology');
   const selection=roll(life),
    highStress=eco.quality<30||eco.pressure>75,
    shortage=eco.forage<30||eco.water<25,
    action=highStress&&selection<.62?'sheltered-from-habitat-pressure':
     shortage&&selection<.75?'searched-for-resources':
     selection<.44?'foraged-in-established-habitat':
     selection<.78?'rested-in-established-habitat':
     'continued-independent-territorial-life';
   b.away=true;
   life.lastTickDay=day;
   life.history.push({type:'offscreen-sixday',day,
    action,location:b.location,observed:false,
    noProgressWithoutPhysicalEvidence:true});
   if(life.history.length>24)life.history.shift();
   updated++;
  }
 }
 return {updated};
}
function status(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
   Object.keys(p).some(x=>x!=='beastId'))
  throw Error('Only witnessed GM wildlife may be inspected; no hidden individual state');
 const seen=Object.values(s.beasts||{}).filter(b=>b?.gmWild&&
  (p.beastId===undefined||p.beastId===b.id));
 return {individuals:seen.map(b=>{
  if(!verify(s,b))throw Error('Original GM wildlife witness has been altered');
  return {beastId:b.id,visibleMarker:b.gmWild.source.marker,
   originalObservation:b.gmWild.description,
   firstSeenPlace:b.gmWild.originalPlace,
   lastPersonallyObserved:b.individualLife.witnessed.at(-1)?.description||
    'The original distant appearance only',
   noCurrentLocationOrIntentRevealed:true,
   noCompelledPartnership:true,
   noGrantedAbilityOrCombatGrade:true};
 })};
}

/*
 * The GM may author a mechanically measured individual ONLY after a real,
 * independently observed wild life and matching source biology. This records
 * a separate immutable assessment inside the ORIGINAL beast object.
 * It grants no ability, Grade, partnership, encounter or voluntary response.
 */
const PROFILE='gm-witnessed-individual-biophysical-assessment-v1';
const ENCOUNTER='gm-witnessed-existing-beast-encounter-v1';
function verifyProfile(s,b){
 const g=b?.gmWild,p=g?.profile;
 if(p===undefined)return g?.verifiedCombatProfile===false&&
   g?.verifiedCognition===false&&b?.combatAssessment===undefined&&
   b?.sapience===undefined;
 const q=p?.source,a=b.combatAssessment,obs=q?.individualObservation,
  bio=s.table?.realm?.speciesBiology?.species?.[b.species];
 if(!q||p.sourceHash!==hash(q)||q.origin!==PROFILE||
    q.beastId!==b.id||q.species!==b.species||
    q.firstWitnessSeal!==g.seal||q.speciesOriginHash!==bio?.originHash||
    !integer(q.worldMinute,g.source.minute,1000000000)||
    !text(q.witness,20,900)||!text(q.anatomicalBasis,40,1000)||
    !text(q.cognitionEvidence,30,900)||!text(q.welfareEvidence,30,900)||
    !obs||obs.type!=='witnessed-wildlife-routine'||
    obs.beastId!==b.id||obs.location!==q.location||
    obs.worldMinute>q.worldMinute||q.observationHash!==hash(obs)||
    !integer(q.sapience,0,5)||q.stats?.sapience!==q.sapience||
    !integer(q.condition,0,100)||!integer(q.hunger,0,100)||
    !integer(q.fatigue,0,100)||g.verifiedCombatProfile!==true||
    g.verifiedCognition!==true||b.sapience!==q.sapience||
    !a||a.gmSourceHash!==p.sourceHash||
    a.beastId!==b.id||a.species!==b.species||
    a.evolutionStage!==q.evolutionStage||
    a.sapience!==q.sapience||
    a.worldMinute!==q.worldMinute||
    a.source!==q.anatomicalBasis||
    hash(a.stats)!==hash(q.stats)||hash(a.behavior)!==hash(q.behavior))
  return false;
 try{
  const C=require('../rules/core'),Combat=require('../rules/combat'),
   Agency=require('../rules/combat-agency');
  for(const [k,lo,hi] of [
   ['toughness',0,100],['defense',1,100],['stamina',0,10000],
   ['vigor',-10,50],['will',-10,50],['offM',0,10],['durM',0,10],
   ['sapience',0,5],['attack',-20,50],['damage',0,100]
  ])C.int(q.stats[k],k,lo,hi);
  if(Object.keys(q.stats).sort().join('|')!==
    ['toughness','defense','stamina','vigor','will','offM','durM',
     'sapience','attack','damage','boxes'].sort().join('|'))return false;
  Combat.makeCombatant({name:b.name,...q.stats});
  const behaviour=Agency.verify({behavior:q.behavior});
  if(q.sapience<=2&&behaviour.canCommunicate)return false;
 }catch(_){return false;}
 return true;
}
function characterise(s,p={}){
 const required=['beastId','witness','anatomicalBasis','cognitionEvidence',
  'welfareEvidence','sapience','condition','hunger','fatigue','stats','behavior'];
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).sort().join('|')!==required.sort().join('|'))
  throw Error('An individual measured profile needs original anatomy, cognition, welfare, real observed scene and combat evidence; no ranks or outcomes');
 const b=s.beasts?.[p.beastId],site=Places.location(s),scene=s.chatRuntime?.scene;
 if(!b?.gmWild||b.gmWild.profile||!verify(s,b)||
    b.away||!site||b.location!==site.id||
    s.battle||s.encounter||
    !text(scene,20,2500)||!scene.includes(p.witness)||
    !scene.includes(b.gmWild.source.marker)||
    !text(p.anatomicalBasis,40,1000)||
    !text(p.cognitionEvidence,30,900)||
    !text(p.welfareEvidence,30,900))
  throw Error('The original living beast must still be present after an independently witnessed observation and a genuine local anatomy and cognition scene');
 const last=b.individualLife.witnessed.at(-1),bio=s.table.realm.speciesBiology.species[b.species];
 if(!last||last.type!=='witnessed-wildlife-routine'||
    last.beastId!==b.id||last.location!==site.id||
    last.action==='withdraw'||last.worldMinute>s.world.minutes||
    s.world.minutes-last.worldMinute>6*1440||
    !bio||bio.originHash!==b.gmWild.source.speciesOriginHash)
  throw Error('Only recent, unchanged individual wildlife evidence and genuine original species biology can support assessment');
 const stats=structuredClone(p.stats),behavior=structuredClone(p.behavior);
 const {sapience,condition,hunger,fatigue}=p;
 if(!integer(sapience,0,5)||!integer(condition,0,100)||
    !integer(hunger,0,100)||!integer(fatigue,0,100)||
    !stats||stats.sapience!==sapience)
  throw Error('Genuinely measured cognition and welfare must agree with the same individual profile');
 const C=require('../rules/core'),Combat=require('../rules/combat'),
  Agency=require('../rules/combat-agency');
 for(const [k,lo,hi] of [
  ['toughness',0,100],['defense',1,100],['stamina',0,10000],
  ['vigor',-10,50],['will',-10,50],['offM',0,10],['durM',0,10],
  ['sapience',0,5],['attack',-20,50],['damage',0,100]
 ])C.int(stats[k],k,lo,hi);
 if(Object.keys(stats).sort().join('|')!==
  ['toughness','defense','stamina','vigor','will','offM','durM',
   'sapience','attack','damage','boxes'].sort().join('|'))
  throw Error('The measured source profile cannot add arbitrary combat effects or powers');
 Combat.makeCombatant({name:b.name,...stats});
 const temperament=Agency.verify({behavior});
 if(sapience<=2&&temperament.canCommunicate)
  throw Error('An unknown animal cannot gain a spoken negotiation channel from an assessment label');
 const q={origin:PROFILE,beastId:b.id,species:b.species,
  evolutionStage:b.evolutionStage,firstWitnessSeal:b.gmWild.seal,
  speciesOriginHash:bio.originHash,location:site.id,
  worldMinute:s.world.minutes,witness:p.witness,
  anatomicalBasis:p.anatomicalBasis,cognitionEvidence:p.cognitionEvidence,
  welfareEvidence:p.welfareEvidence,
  individualObservation:structuredClone(last),
  observationHash:hash(last),sapience,condition,hunger,fatigue,
  stats,behavior};
 const assessment={source:q,sourceHash:hash(q)};
 b.gmWild.profile=assessment;
 b.gmWild.verifiedCombatProfile=true;b.gmWild.verifiedCognition=true;
 b.sapience=sapience;b.condition=condition;
 b.needs={hunger,fatigue};
 b.mood=last.action==='forage'?'foraging':
  last.action==='shelter'?'reserved':'watchful';
 b.combatAssessment={beastId:b.id,species:b.species,
  evolutionStage:b.evolutionStage,sapience,worldMinute:s.world.minutes,
  source:p.anatomicalBasis,stats,behavior,used:false,
  gmSourceHash:assessment.sourceHash};
 if(!verify(s,b))
  throw Error('The original beast and immutable anatomical assessment could not be reconciled');
 return {assessed:true,beastId:b.id,originalBiologyVerified:true,
  physicalProfileRecorded:true,cognitionRecorded:true,
  noGradeOrTechniqueGranted:true,noBondOrConsentGranted:true,
  noEncounterOrAttackCreated:true,noPlayerRoll:true};
}
// A player's later approach does not manufacture another beast or guarantee
// a meeting. The original individual makes one independent choice from its
// existing wildlife RNG. No imagined exact range, danger, contract or skill.
function engage(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
   Object.keys(p).join('|')!=='beastId'||
   typeof p.beastId!=='string')
  throw Error('Approach only an original currently observed individual, never a selected reaction or combat outcome');
 const b=s.beasts?.[p.beastId],site=Places.location(s),last=b?.individualLife?.witnessed?.at(-1);
 if(!b?.gmWild?.profile||!verify(s,b)||!site||
    b.location!==site.id||b.away||
    !last||last.type!=='witnessed-wildlife-routine'||
    last.location!==site.id||last.action==='withdraw'||
    b.individualLife.lastEngagedWatchMinute===last.worldMinute||
    s.encounter||s.battle||
    (s.table?.combatants?.player?.status&&
     s.table.combatants.player.status!=='ok'))
  throw Error('Only a newly witnessed, freely present, source-characterised wild beast may be approached; an older sighting cannot be rerolled');
 if(b.sapience>=3)
  throw Error('An independent sapient beast person requires their actual social contact and negotiation source, not an animal-approach shortcut');
 const life=b.individualLife,old=s.world.minutes,
  choice=roll(life),withdrawn=choice<.22;
 const record={origin:ENCOUNTER,beastId:b.id,rootSeal:b.gmWild.seal,
  profileHash:b.gmWild.profile.sourceHash,
  watchedAtMinute:last.worldMinute,watchHash:hash(last),
  worldMinute:old,location:site.id,response:withdrawn?'withdrawn':'stayed',
  noForcedAffection:true,noInferredDangerOrDistance:true};
 life.lastEngagementSource=record;
 life.lastEngagementHash=hash(record);
 life.lastEngagedWatchMinute=last.worldMinute;
 if(withdrawn)b.away=true;
 else s.encounter={beastId:b.id,observed:true,approaches:0,
  threat:false,origin:ENCOUNTER};
 const C=require('../rules/core');
 C.event(s,'encounter',withdrawn?
  b.name+' turns away from the attempted approach and withdraws independently.':
  b.name+' stays within the observed surroundings as you approach; no trust or cooperation is implied.',{
   ...record,sourceHash:life.lastEngagementHash,
   noContractOrBond:true,noCombatOrGradeGranted:true});
 E.advance(s,8);require('../rules/world').finalizeTime(s,old);
 require('../rules/unified').sync(s,{source:'legacy'});
 return {approached:true,beastId:b.id,encounterOpen:!withdrawn,
  beastWithdrew:withdrawn,minutes:8,noPlayerDice:true,
  noForcedReactionOrPartnership:true,distanceUnmeasured:true};
}

module.exports={SOURCE,hash,sealed,verify,witnessed,watch,sixday,status,verifyProfile,characterise,engage};
