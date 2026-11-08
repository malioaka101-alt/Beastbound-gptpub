'use strict';
// Source-grounded, read-only distinction between discipline structure,
// learned skill rank, anatomical progress and separate human evolution.
// Never infer an awakening from a legacy resource pool or a technique name.
const E=require('../engine.js'),Disc=require('./disciplines');
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
   ...(a.circles>=2?{matrix:Disc.matrixStatus(s)}:{}),
   training:verifiedTrain('arcane'),
   note:'A legacy Mana reservoir does not itself prove an ignited Core or a completed Circle'},
  soul:{phase:soul.phase||0,phaseName:phase(SOUL,soul.phase||0),
   training:verifiedTrain('soul')},
  body:{cycles:[...completed],completedCycles:completed.length,
   totalNamedCycles:BODY.length,nextCycle:BODY[completed.length]||null,
   training:verifiedTrain('body')},
  rift:{step:rift.step||0,stepName:phase(RIFT,rift.step||0),
   training:verifiedTrain('rift')},
  origin:{phase:origin.phase||0,load:origin.load??0,
   capacity:origin.capacity??0,stableTraits:[...(origin.stableTraits||[])],
   nextWork:'Trait-mapping, compatibility and stabilisation depend on actual recorded material and evidence; not a Meridian stage'},
  humanEvolution:{stage:evo.stage||0,stageName:phase(HUMAN,evo.stage||0),
   stability:evo.stability??null,
   traits:[...(evo.traits||[])]},
  principle:'Discipline stage, skill rank, human evolution and beast grades are different measurements. Unmeasured abilities are not zero; no innate power is granted from a display.'};
}
module.exports={read,MERIDIAN,ARCANE,SOUL,BODY,RIFT,HUMAN};
