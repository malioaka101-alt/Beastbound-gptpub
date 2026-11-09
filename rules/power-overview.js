'use strict';
// Source-grounded, read-only distinction between discipline structure,
// learned skill rank, anatomical progress and separate human evolution.
// Never infer an awakening from a legacy resource pool or a technique name.
const E=require('../engine.js'),Disc=require('./disciplines'),Thread=require('./soul-threading'),Anchors=require('./rift-anchors'),OriginFoundations=require('./beast-origin-foundations'),MeridianWeb=require('./meridian-living-anatomy');
const MERIDIAN=['Preparatory: Stage I not yet attained',
 'Stage I — Foundation Tempering','Stage II — Meridian Awakening',
 'Stage III — 108 Gate Opening','Stage IV — Dantian Sea Formation',
 'Stage V — Meridian Web Integration','Stage VI — Living Intent Embodiment',
 'Stage VII — Physique-Meridian Integration','Stage VIII — Living Domain',
 'Stage IX — Transcendent Constitution'];
const ARCANE=['No completed Circle','First Circle — Core Ignition',
 'Second Circle — Dual Channeling','Third Circle — Matrix Formation',
 'Fourth Circle — Dynamic Architecture','Fifth Circle — Field Projection',
 'Sixth Circle — Living Lattice','Seventh Circle — Astral Architecture',
 'Eighth Circle — Law Interpretation','Ninth Circle — World Circuit'];
const SOUL=['Soul Perception not awakened',
 'Phase I — Soul Perception','Phase II — Soul Threading',
 'Phase III — Resonance Lattice','Phase IV — Soul Forge',
 'Phase V — Inner Sanctuary','Phase VI — Soul Domain',
 'Phase VII — Living Soul Architecture'];
const BODY=['Muscle-Tendon Cycle','Bone-Marrow Cycle','Organ Cycle',
 'Nerve-Sense Cycle','Blood-Essence Cycle','Adaptive Physique Cycle',
 'Evolved Physique Cycle'];
const RIFT=['Rift Sense not awakened','Rift Sense','Anchor Marking',
 'Fold Step','Boundary Weaving','Pocket Architecture','Rift Adaptation',
 'Realm Walking','Boundary Domain'];
const HUMAN=['Baseline Human','Awakened Human','Refined Human',
 'Transformed Human','Ascendant Human','Transcendent Human',
 'Higher Evolved Existence'];
const phase=(names,n)=>names[Number.isInteger(n)&&n>=0&&n<names.length?n:0];
const skill=(p,name)=>Number.isInteger(p.skills?.[name]?.rank)?p.skills[name].rank:0;
function read(s){
 if(!s?.player)throw Error('A saved player is required');
 const p=s.player,m=p.meridian||{},a=p.arcane||{},soul=p.soul||{},
  body=p.body||{},rift=p.rift||{},origin=p.origin||{},evo=p.humanEvolution||{},
  stage=Math.max(0,Math.min(9,Number.isInteger(m.stage)?m.stage:0)),
  gates=Array.isArray(m.gates)?m.gates:[],
  completed=Array.isArray(body.cycles)?body.cycles:[],
  state=Disc.status(s).systems,
  mTraining=s.table?.disciplineTraining?.meridian,
  verifiedStage=mTraining?.history?.filter(x=>x.change?.startsWith('Stage ')).length||0;
 const verifiedTrain=(system)=>state[system]&&({
  target:state[system].target,progress:state[system].progress,
  required:state[system].required,
  methods:state[system].availableMethods,
  independentAvailable:state[system].independentAvailableAtCurrentSite,
  procedureAvailable:state[system].required!==null,
  ...(state[system].nextEligibleDay?{nextEligibleDay:state[system].nextEligibleDay}:{})
 });
 return {name:p.name,primaryPath:p.path,
  meridian:{stage,stageName:phase(MERIDIAN,stage),cultivationSkillRank:skill(p,'cultivation'),
   gatesOpened:gates.length,gatesTotal:108,
   primaryMapped:s.table?.powerPhysiology?.meridian?.primaryMapped||0,
   qi:{current:p.qi,max:p.maxQi},stability:m.stability,
   foundationQuality:s.table?.powerPhysiology?.meridian?.foundationQuality||null,
   ...(stage>=4?{livingWeb:MeridianWeb.status(s)}:{}),
   ...(stage===0&&m.foundation>0&&!verifiedStage?
    (s.campaign?.oldCampaignImported===false?
     {startingPreparatoryFoundation:m.foundation,
      warning:'Starting preparation is not verified current training-track progress'}:
     {legacyPreparatoryFoundation:m.foundation,
      warning:'Legacy foundation value is not verified current training-track progress'}):{}),
   ...(m.stage>=3?{dantianSea:Disc.seaStatus(s)}:{}),
   training:verifiedTrain('meridian')},
  arcane:{circles:a.circles||0,circleName:phase(ARCANE,a.circles||0),
   coreIgnited:a.coreIgnited===true,coreStability:a.coreStability,
   arcanaSkillRank:skill(p,'arcana'),manaCoreEstablished:a.coreIgnited===true,
   ...(a.circles>=2&&a.circles<=3?{matrix:Disc.matrixStatus(s)}:{}),
   ...(a.circles>=4?{
    matrix:{formed:true,verified:require('./arcane-dynamic-architecture').verify(s),
     preservedEarlierThreeCircle:true,noAutomaticSpells:true},
    dynamic:require('./arcane-dynamic-architecture').status(s)}:{}),
   ...(a.circles>=5?{
    higherCircles:require('./arcane-higher-circles').status(s)}:{}),
   ...(s.table?.arcaneArchitecture?.formulae?{
    knownFormulae:require('./arcane-spell-grammar').status(s)}:{}),
   training:verifiedTrain('arcane'),
   note:'A legacy Mana reservoir does not itself prove an ignited Core or a completed Circle'},
  soul:{phase:soul.phase||0,phaseName:phase(SOUL,soul.phase||0),
   ...(soul.phase>=1?{threading:Thread.status(s)}:{}),
    ...(soul.phase>=2?{lattice:require('./soul-resonance-lattice').status(s)}:{}),
    ...(soul.phase>=3?{higherArchitecture:require('./soul-higher-architecture').status(s)}:{}),
    ...(soul.phase>=4?{ethicalApplications:require('./soul-ethical-applications').status(s)}:{}),
   training:verifiedTrain('soul')},
  body:{cycles:[...completed],completedCycles:completed.length,
   totalNamedCycles:BODY.length,nextCycle:BODY[completed.length]||null,
   ...(completed.length>=2?{organCycle:Disc.organStatus(s)}:{}),
   training:verifiedTrain('body')},
  rift:{step:rift.step||0,stepName:phase(RIFT,rift.step||0),
   ...(rift.step>=1?{anchors:Anchors.status(s)}:{}),
   training:verifiedTrain('rift')},
  origin:{phase:origin.phase||0,load:origin.load??0,
   preliminaryResearch:OriginFoundations.status(s),
   capacity:origin.capacity??0,stableTraits:[...(origin.stableTraits||[])],
   nextWork:'Witnessed ecology supports preliminary pattern research; full anatomy, source rights and compatibility evidence are required before any trait seeding or expression'},
  humanEvolution:{stage:evo.stage||0,stageName:phase(HUMAN,evo.stage||0),
   stability:evo.stability??null,
   traits:[...(evo.traits||[])]},
  principle:'Discipline stage, skill rank, human evolution and beast grades are different measurements. Unmeasured abilities are not zero; no innate power is granted from a display.'};
}
module.exports={read,MERIDIAN,ARCANE,SOUL,BODY,RIFT,HUMAN};
