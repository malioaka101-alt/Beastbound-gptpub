'use strict';
// Original Master Prompt §24: the first evidence-backed Beast-Origin steps.
// An identified wild animal is a NONINVASIVE ecological observation, not a
// sample of tissue, a measured magical organ, a consenting donor, a lineage
// licence, or a granted beast power. Until physical/magical/spiritual sources
// exist, only preliminary pattern hypotheses and safety screening are possible.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),W=require('./world'),
 U=require('./unified');
const ORIGIN='beast-origin-provisional-pattern-mapping-v1';
const FOCI=Object.freeze(['habitat','diet','ecological-role']);
const AXES=Object.freeze(['physical','energetic','spiritual','trait-conflict']);
const FIELD=Object.freeze({'habitat':'biome','diet':'diet',
 'ecological-role':'role'});
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const SCAN_MIN=15,SCAN_MAX=480,STUDY_TARGET=3;
const SOURCE='verified-present-wildlife-observation';
function noExtra(params,keys){
 if(!params||typeof params!=='object'||Array.isArray(params)||
    Object.keys(params).some(k=>!keys.includes(k)))
  throw Error('Only actual recorded Beast-Origin research choices are accepted; no player-selected hidden trait, bloodline, donor consent, grade, check, compatibility or result');
}
function safe(s){
 if(!E.LOCATIONS[s.world?.location])
  throw Error('A real present local study setting is required');
 if(s.battle||s.encounter?.threat===true)
  throw Error('Resolve actual combat or an immediately threatening beast before deliberate study');
 const c=s.table?.combatants?.player;
 if(c&&c.status!=='ok')
  throw Error('An incapacitated researcher cannot perform independent Beast-Origin study');
}
function modifier(s,attribute,skill){
 const attr=C.int(s.player?.attributes?.[attribute],'earned '+attribute,1,30),
  rank=C.int(s.player?.skills?.[skill]?.rank,'earned '+skill,0,5);
 return Math.floor((attr-10)/2)+2*rank;
}
function observed(s,beastId){
 if(typeof beastId!=='string'||!/^[a-z0-9_-]{2,90}$/.test(beastId))
  throw Error('One actual identified and witnessed individual beast ID is required');
 const e=s.table?.wildlifeObservationEvidence?.[beastId],
  b=s.beasts?.[beastId],sp=E.SPECIES[b?.species];
 const sightings=s.sightings||[];
 const matching=sightings.some(x=>
  x?.beastId===beastId&&x.species===b?.species&&
  x.location===e?.location&&x.source===SOURCE);
 const originalRoll=Array.isArray(s.log)?s.log.find(x=>
  x?.type==='roll'&&digest(x)===e?.rollEventHash):null;
 if(!e||!b||!sp||!matching||
    e.beastId!==beastId||e.species!==b.species||
    e.identified!==true||e.degree!=='success'&&
      e.degree!=='strong'&&e.degree!=='exceptional'||
    !Number.isInteger(e.observedMinute)||e.observedMinute<0||
    e.observedMinute>s.world.minutes||
    !E.LOCATIONS[e.location]?.spawns?.includes(b.species)||
    e.biome!==E.LOCATIONS[e.location].biome||
    typeof e.source!=='string'||!e.source.startsWith('Engine-witnessed ')||
    !/^[0-9a-f]{64}$/.test(e.rollEventHash||'')||
    !originalRoll||
    originalRoll.details?.degree!==e.degree||
    originalRoll.details?.success!==true||
    originalRoll.details?.dc!==10)
  throw Error('Beast-Origin research requires the original successful noninvasive wildlife observation and its unchanged real check');
 if((Number.isInteger(b.sapience)&&b.sapience>=3)||
    sp.intelligence==='sapient')
  throw Error('An intelligent beast requires person-aware consent rather than being treated as a wild research specimen');
 // Preserve only already publicly observed ecology. Never return the
 // E.SPECIES ability, element affinity, hidden grade or mutation branches.
 return {beastId,species:b.species,name:sp.name,
  sourceLocation:e.location,
  publicEcology:{habitat:sp.biome,diet:sp.diet,
   'ecological-role':sp.role},
  observation:{
   beastId,species:b.species,location:e.location,
   observedMinute:e.observedMinute,rollEventHash:e.rollEventHash,
   degree:e.degree,source:e.source,identified:true}
 };
}
function idOf(beastId,focus){
 return 'originmap_'+digest([ORIGIN,beastId,focus]).slice(0,18);
}
function verifiedMap(s,map){
 if(!map||map.source!==ORIGIN||!FOCI.includes(map.focus)||
    !Array.isArray(map.attempts)||map.attempts.length<1||
    map.attempts.length>200||map.id!==idOf(map.beastId,map.focus)||
    map.completed!==true||map.progress!==STUDY_TARGET||
    typeof map.observationHash!=='string'||
    map.observationHash!==digest(map.originalObservation)||
    map.originalObservation?.beastId!==map.beastId||
    map.originalObservation?.species!==map.species||
    !Number.isInteger(map.originalObservation?.observedMinute)||
    !map.publicFact||typeof map.publicFact!=='string'||
    map.publicFact.length>250||
    !Number.isInteger(map.completedMinute)||
    map.completedMinute>s.world.minutes)
  throw Error('A provisional beast-pattern map lacks its original observed source');
 let progress=0;
 for(const a of map.attempts){
  if(!a||!Number.isInteger(a.minute)||a.minute<map.originalObservation.observedMinute||
     !Number.isInteger(a.minutes)||a.minutes<SCAN_MIN||a.minutes>SCAN_MAX||
     a.minute+a.minutes>s.world.minutes||
     !Number.isInteger(a.staminaSpent)||a.staminaSpent!==Math.ceil(a.minutes/120)||
     !['exceptional','strong','success','setback','failure','severe failure'].includes(a.degree)||
     a.earned!==(a.degree==='exceptional'?3:
       a.degree==='strong'?2:a.degree==='success'?1:0))
   throw Error('The map has an invalid original practice ledger');
  progress=Math.min(STUDY_TARGET,progress+a.earned);
 }
 if(progress!==STUDY_TARGET||map.completedMinute!==
    map.attempts.at(-1).minute+map.attempts.at(-1).minutes||
    map.attemptsHash!==digest(map.attempts))
  throw Error('The claimed mapped pattern is unsupported by genuine research checks');
 return {candidateId:map.id,species:map.species,focus:map.focus,
  publicFact:map.publicFact,source:ORIGIN,
  confirmedTrait:false,actualOrganUnknown:true,
  hiddenAbilityUnknown:true,donationOrLineageRightsNotEstablished:true};
}
function status(s){
 const maps=Object.values(s.table?.originPatternStudies||{}).slice(-40)
  .filter(x=>x&&x.source===ORIGIN);
 return {
  research:maps.map(x=>{
   const mapped=x.completed===true;
   let verified=false;
   if(mapped)try{verified=!!verifiedMap(s,x);}catch{}
   const axes=s.table?.originCompatibilityScreens?.[x.id];
   return {candidateId:x.id,speciesName:x.speciesName,
    focus:x.focus,progress:x.progress||0,required:STUDY_TARGET,
    mapped:verified,source:'personally witnessed noninvasive ecology',
    compatibility:verified?
     AXES.map(k=>({axis:k,
      provisional:axes?.[k]?.result==='promising'||false,
      cautions:axes?.[k]?.riskFlags||[]})):[],
    seedingApproved:false,traitExpressed:false};
  }),
  originPhase:s.player?.origin?.phase||0,
  integrationLoad:s.player?.origin?.load||0,
  integrationCapacity:s.player?.origin?.capacity||0,
  routes:['noninvasive ecological pattern investigation'],
  noCompulsoryTeacher:true,noSpeciesAbilityInference:true,
  note:'Ecology-based mapping is preliminary until actual biological, magical, spiritual and material provenance are established; compatibility screening cannot seed a trait'
 };
}
function mapPattern(s,params={}){
 noExtra(params,['beastId','focus','minutes','approach']);
 const {beastId,focus='habitat',minutes=90,approach}=params;
 if(!FOCI.includes(focus))throw Error('Study only witnessed habitat, diet or ecological-role evidence');
 C.int(minutes,'actual independent pattern study minutes',SCAN_MIN,SCAN_MAX);
 if(approach!==undefined&&
    (typeof approach!=='string'||approach.trim().length<8||approach.length>240))
  throw Error('Describe genuine noninvasive pattern analysis, not a desired result');
 safe(s);
 const witness=observed(s,beastId),id=idOf(beastId,focus);
 const previous=s.table?.originPatternStudies?.[id];
 if(previous?.completed)throw Error('This observation/focus has already produced its original provisional pattern map');
 const originalObservation=structuredClone(witness.observation);
 const observationHash=digest(originalObservation);
 if(previous&&(previous.source!==ORIGIN||previous.id!==id||
    previous.observationHash!==observationHash||
    !Array.isArray(previous.attempts)||previous.attempts.length>200||
    !Number.isInteger(previous.progress)||previous.progress<0||
    previous.progress>=STUDY_TARGET))
  throw Error('Earlier beast-pattern research cannot silently change its subject or witnessed evidence');
 const staminaSpent=Math.ceil(minutes/120);
 if(!Number.isInteger(s.player.stamina)||s.player.stamina<staminaSpent||
    s.table?.combatants?.player&&s.table.combatants.player.stamina<staminaSpent)
  throw Error('A real noninvasive mapping session requires remaining Stamina');
 const work=previous||{id,source:ORIGIN,beastId,species:witness.species,
  speciesName:witness.name,focus,
  publicFact:witness.publicEcology[focus],
  originalObservation,observationHash,
  progress:0,attempts:[],completed:false};
 const start=s.world.minutes;
 const check=C.check(s,{modifier:modifier(s,'wis','beastcraft')+
    Math.min(2,s.player.skills?.research?.rank||0),
   dc:15,label:'Beast-Origin: noninvasive '+focus+' pattern investigation'});
 s.player.stamina-=staminaSpent;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
 work.progress=Math.min(STUDY_TARGET,work.progress+check.progress);
 const entry={minute:start,minutes,staminaSpent,focus,
  degree:check.degree,roll:check.roll,earned:check.progress,
  ...(approach?{approach:approach.trim()}:{}),
  sourceObservationHash:observationHash};
 work.attempts.push(entry);
 let mapped=false;
 if(work.progress>=STUDY_TARGET){
  work.completed=true;work.completedMinute=start+minutes;
  work.attemptsHash=digest(work.attempts);mapped=true;
 }
 s.table||={};s.table.originPatternStudies||={};
 s.table.originPatternStudies[id]=work;
 E.advance(s,minutes);W.finalizeTime(s,start);U.sync(s,{source:'legacy'});
 C.event(s,'progress',mapped?
  'A preliminary ecological beast-pattern research map is documented; actual lineage organs and powers remain unverified.':
  'Noninvasive Beast-Origin pattern investigation proceeds without disturbing or using the animal.',{
   origin:ORIGIN,sourceObservationHash:observationHash,
   researchId:id,focus,originalCheck:check,
   progress:work.progress,required:STUDY_TARGET,
   staminaSpent,minutes,mapped,
   noMaterialTaken:true,noNewBeastTrait:true,noAutomaticHumanEvolution:true
  });
 return {candidateId:id,focus,speciesName:witness.name,
  studiedFact:witness.publicEcology[focus],
  progress:work.progress,required:STUDY_TARGET,mapped,
  check,staminaSpent,minutes,route:'independent',
  feeTalons:0,animalDisturbed:false,
  actualTraitIdentified:false,actualAnatomyUnmeasured:true,
  noBloodlineAwarded:true,noSeeding:true};
}
const SCREEN=Object.freeze({
 physical:Object.freeze({attribute:'wis',skill:'medicine',
   basis:'human tissue, metabolism and known physical adaptation'}),
 energetic:Object.freeze({attribute:'int',skill:'arcana',
   basis:'existing energy transport and measured throughput'}),
 spiritual:Object.freeze({attribute:'wis',skill:'cultivation',
   basis:'current identity and soul-body stability'}),
 'trait-conflict':Object.freeze({attribute:'int',skill:'research',
   basis:'existing stable traits, integration load and incompatible demands'})
});
function screening(s,params={}){
 noExtra(params,['candidateId','axis','minutes','approach']);
 const {candidateId,axis,minutes=90,approach}=params;
 if(typeof candidateId!=='string'||!/^originmap_[a-f0-9]{18}$/.test(candidateId))
  throw Error('A previously earned provisional pattern-map ID is required');
 if(!AXES.includes(axis))throw Error('Assess a real physical, energetic, spiritual or trait-conflict axis');
 C.int(minutes,'actual compatibility screening minutes',SCAN_MIN,SCAN_MAX);
 if(approach!==undefined&&
   (typeof approach!=='string'||approach.trim().length<8||approach.length>240))
  throw Error('Describe actual noninvasive compatibility screening, not a claimed compatible outcome');
 safe(s);
 const map=s.table?.originPatternStudies?.[candidateId];
 const verified=verifiedMap(s,map);
 const origin=s.player.origin;
 if(!origin||!Number.isInteger(origin.capacity)||origin.capacity<0||
    !Number.isInteger(origin.load)||origin.load<0||
    !Array.isArray(origin.stableTraits)||
    !Number.isInteger(origin.rejectionRisk)||origin.rejectionRisk<0)
  throw Error('The current human Origin Pattern and actual integration load require a consistent saved physiology');
 const previous=s.table?.originCompatibilityScreens?.[candidateId]?.[axis];
 if(previous?.result==='promising')
  throw Error('This screening axis already has its original promising result; new independent evidence is needed before reassessing');
 if(previous&&(!Array.isArray(previous.attempts)||previous.attempts.length>=40||
    previous.candidateId!==candidateId||previous.axis!==axis||
    previous.mapHash!==digest(map)))
  throw Error('The saved source-linked compatibility screening history needs reconciliation');
 const fatigue=Math.ceil(minutes/120);
 if(!Number.isInteger(s.player.stamina)||s.player.stamina<fatigue||
    s.table?.combatants?.player&&s.table.combatants.player.stamina<fatigue)
  throw Error('Real stamina is required for a valid personal compatibility screen');
 const phys=s.player,stable=origin.stableTraits,
   headroom=origin.capacity-origin.load;
 const riskFlags=[];
 if(headroom<=0)riskFlags.push('no measured integration headroom');
 if(origin.load+stable.length>origin.capacity)
  riskFlags.push('existing trait interactions exceed stated capacity');
 if(axis==='spiritual'&&phys.soul?.stability<65)
  riskFlags.push('current soul stability requires additional specialist testing');
 if(axis==='physical'&&phys.humanEvolution?.stability<60)
  riskFlags.push('current evolutionary stability requires medical attention');
 if(axis==='energetic'&&!phys.arcane?.coreIgnited&&phys.meridian?.stage===0)
  riskFlags.push('no awakened Arcane or Meridian throughput structure');
 // A missing energy discipline is a compatibility caution, NOT a mandated
 // teacher, Circle, Meridian rank or blanket ban on future biological traits.
 const dc=15+Math.min(5,Math.floor(origin.load/Math.max(1,origin.capacity)*5))+
  (riskFlags.length?2:0);
 const rule=SCREEN[axis],start=s.world.minutes;
 const check=C.check(s,{modifier:modifier(s,rule.attribute,rule.skill),
  dc,label:'Beast-Origin provisional '+axis+' compatibility screening'});
 phys.stamina-=fatigue;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=phys.stamina;
 const result=check.success&&riskFlags.length===0?'promising':
  check.success?'caution':'inconclusive';
 const attempt={minute:start,minutes,degree:check.degree,
  roll:check.roll,staminaSpent:fatigue,result,riskFlags:[...riskFlags],
  mapHash:digest(map)};
 const record=previous||{candidateId,axis,mapHash:digest(map),attempts:[]};
 record.attempts.push(attempt);
 record.result=result;record.riskFlags=[...riskFlags];
 record.lastCheckedMinute=start+minutes;
 s.table||={};s.table.originCompatibilityScreens||={};
 s.table.originCompatibilityScreens[candidateId]||={};
 s.table.originCompatibilityScreens[candidateId][axis]=record;
 E.advance(s,minutes);W.finalizeTime(s,start);U.sync(s,{source:'legacy'});
 C.event(s,'progress','Provisional '+axis+' compatibility screen: '+result+
  '; biological integration is still unproven.',{
  origin:'beast-origin-compatibility-screen-v1',candidateId,axis,
  originalCheck:check,minutes,staminaSpent,riskFlags,
  provisional:true,approvedForSeeding:false
 });
 return {candidateId,axis,basis:rule.basis,result,check,minutes,
  staminaSpent,riskFlags,feeTalons:0,route:'independent',
  noIntegrationDone:true,noNewTrait:true,
  donorConsentNotEstablished:true,
  screeningOnly:true,approvalForSeeding:false,
  remainingAxes:AXES.filter(a=>
   s.table.originCompatibilityScreens[candidateId]?.[a]?.result!=='promising')
 };
}
module.exports={ORIGIN,FOCI,AXES,status,mapPattern,screening,verifiedMap};
