'use strict';
// Additional DEPTH WITHIN original rankings, not invented higher ranks.
// Canonical tiers remain distinct: skill 0-5, specialists 1-7, Meridian
// I-IX, Arcane 1-9, Soul I-VII, Body 1-7, Rift 1-8, Sync 1-10.
// Qualifiers require separately attributable completed work and never
// grant extra Circle, Grade, Soul phase, legal licence or power budget.
const E=require('../engine.js'),C=require('./core');
const Proto=require('./creation-prototype');
const Lifepath=require('./mastery-lifepath');
const DESCRIPTORS=['not established','initially demonstrated','practised','refined'];
const WITHIN_TIER=Object.freeze({
 meridian:['Initial circulation','Stable circulation','Refined integration'],
 arcane:['Circle formed','Geometry stabilised','Formula integration refined'],
 soul:['Initial spiritual control','Stable inner pattern','Refined spiritual practice'],
 body:['Cycle consolidated','Conditioned application','Integrated physique control'],
 rift:['Initial spatial control','Stable boundary application','Refined anchor precision'],
 origin:['Initial trait control','Stable compatibility','Integrated personal expression'],
 evolution:['Newly changed form','Stable constitution','Refined adaptation'],
 sync:['Tentative mutual coordination','Stable reciprocal coordination','Fluent shared practice'],
 specialist:['Initiating','Established','Refined'],
 profession:['Initially demonstrated','Practised','Refined']
});
const SKILLS=['Untrained','Novice','Trained','Expert','Master','Grandmaster'];
const SPECIALISTS=['Runes and Sigils','Formation Mastery','Alchemy and Magical Biology',
 'Weapon Cultivation','Elemental Ascendancy','Healing and Regenerative Arts'];
const SYSTEM_INFO=Object.freeze({
 meridian:{label:'Meridian stage',stages:E.MERIDIAN_STAGES,
  current:s=>s.player?.meridian?.stage||0},
 arcane:{label:'Arcane Circle',stages:E.MERIDIAN_STAGES&&[
  'Core Ignition','Dual Channeling','Matrix Formation',
  'Dynamic Architecture','Field Projection','Living Lattice',
  'Astral Architecture','Law Interpretation','World Circuit'],
  current:s=>s.player?.arcane?.circles||0},
 soul:{label:'Soul phase',stages:E.SOUL_PHASES.slice(1),
  current:s=>s.player?.soul?.phase||0},
 body:{label:'Body refinement cycle',stages:E.BODY_CYCLES,
  current:s=>s.player?.body?.cycles?.length||0},
 rift:{label:'Rift step',stages:E.RIFT_STEPS.slice(1),
  current:s=>s.player?.rift?.step||0},
 origin:{label:'Beast-Origin integration procedure',stages:[
  'Pattern Mapping','Compatibility Testing','Trait Seeding','Rejection Window',
  'Stabilisation','Expression','Adaptation','Personal Evolution'],
  current:s=>s.player?.origin?.phase||0},
 evolution:{label:'Human evolutionary form',stages:E.STAGES,
  current:s=>s.player?.humanEvolution?.stage??0},
 sync:{label:'Reciprocal human-beast synchronisation',stages:E.SYNCHRONISATION,
  current:()=>null}
});
function proof(s,skill){
 const earned=[];
 if(skill==='crafting'){
  for(const row of Object.values(s.table?.creationPrototypes||{})){
   if(row?.origin!==Proto.ORIGIN)continue;
   try{
    const p=Proto._debug.checkItem(s,row.id);
    if(['unverified','calibrated','broken'].includes(p.status)&&
       p.source?.checkWitnessHash===p.checkWitnessHash&&
       typeof p.sourceHash==='string')
      earned.push(p.checkWitnessHash);
   }catch{/* forged or orphaned material does not establish practice */}
  }
 }
 const recognised=s.table?.professionalPractice?.[skill];
 if(Array.isArray(recognised)){
  for(const item of recognised){
   if(item?.source==='verified-instrument-trial'&&
      typeof item.eventHash==='string'&&item.eventHash.length===64&&
      earned.includes(item.eventHash))earned.push(item.eventHash);
  }
 }
 return [...new Set(earned)];
}
function degree(n){return n>=6?3:n>=3?2:n>=1?1:0;}
function status(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Extended rankings are strictly read-only; a title, certificate, breakthrough or mastery cannot be asserted by the caller');
 const skills={};
 for(const [key,rec] of Object.entries(s.player?.skills||{})){
  const rank=C.int(rec.rank,'earned '+key+' rank',0,5);
  const witnessed=proof(s,key),depth=degree(witnessed.length);
  const long=Lifepath.details(s,'profession',key);
  skills[key]={canonicalRank:rank,title:SKILLS[rank],
   demonstratedPracticeEvents:witnessed.length,
   withinRankDepth:long.masteryDegree>0?long.masteryName:DESCRIPTORS[depth],
   withinRankDepthIndex:depth,extendedMasteryDegree:long.masteryDegree,
   earnedMasteryProgress:long.earnedProgress,
   additionalMiddleStages:long.additionalMiddleStages,
   expandedLadderWaypoints:SKILLS.length+Lifepath.BRIDGES.profession.length,
   credential:'Separate legal licence or institution recognition is required',
   noRankIncrease:true};
 }
 const systems={};
 for(const [key,spec]of Object.entries(SYSTEM_INFO)){
  if(key==='sync'){
   const partner=s.player?.partnerIds?.[0];
   const long=Lifepath.details(s,'sync',partner);
   systems[key]={measure:spec.label,
    earnedStage:long.qualifiedForPractice?long.canonicalStage:null,
    availableWithinStageDegrees:WITHIN_TIER.sync,
    deepMasteryDegrees:Lifepath.DEGREES.slice(1),
    expandedLadderWaypoints:spec.stages.length+Lifepath.BRIDGES.sync.length,
    additionalMiddleStages:long.additionalMiddleStages,
    stageName:long.qualifiedForPractice?
     spec.stages[long.canonicalStage-1]:
     'Pair-specific; no stage can be inferred without a recorded willing partner',
    withinStageDepth:long.qualifiedForPractice?long.masteryName:'unassessed',
    notUniversalPower:true};continue;
  }
  const index=C.int(spec.current(s),'recorded '+spec.label,
   0,key==='evolution'?spec.stages.length-1:spec.stages.length);
  const stageName=key==='evolution'?spec.stages[index]:
    (index===0?'Not initiated':spec.stages[index-1]);
  // Training records for prior stages do not automatically make the current
  // stage mastered. Retain real completed breakthrough as a distinct source.
  const history=s.table?.disciplineTraining?.[key]?.history||[],
   witnessedBreakthrough=Array.isArray(history)&&history.some(x=>
    x&&typeof x.change==='string'&&x.change.length>10);
  const long=Lifepath.details(s,key);
  systems[key]={measure:spec.label,earnedStage:index,stageName,
   availableWithinStageDegrees:WITHIN_TIER[key],
   deepMasteryDegrees:Lifepath.DEGREES.slice(1),
   expandedLadderWaypoints:spec.stages.length+Lifepath.BRIDGES[key].length,
   additionalMiddleStages:long.additionalMiddleStages,
   withinStageMasteryDegree:long.masteryDegree,
   withinStageDepth:long.masteryDegree>0?long.masteryName:
    'unassessed; system-specific mastery demonstration required',
   completedBreakthroughEvidence:witnessedBreakthrough,
   noAutomaticNewAbilities:true,notUniversalPower:true};
 }
 const specials=Object.fromEntries(SPECIALISTS.map(name=>{
   const long=Lifepath.details(s,'specialist',name);
   return [name,{
    canonicalProgression:'Ranks 1–7 according to specialist discipline',
    expandedLadderWaypoints:7+Lifepath.BRIDGES.specialist.length,
    additionalMiddleStages:long.additionalMiddleStages,
    deepMasteryDegrees:Lifepath.DEGREES.slice(1),
    withinRankDegrees:WITHIN_TIER.specialist,
    personalRank:long.qualifiedForPractice?long.canonicalStage:
     'not independently assessed',
    noAutomaticLicence:true}];
  }));
 return {professions:skills,systems,specialists:specials,
  beastGrades:{speciesGrade:'I–IX',individualGrade:'I–IX',
   individualMiddleStudies:Lifepath.BRIDGES.beastIndividual,
   withinGradeQuality:'Actual biological development and potential, never extra Grades or assumed consent'},
  itemsAndResearch:{grade:'I–IX',
   materialQualityMilestones:Lifepath.BRIDGES.item,
   quality:'Unverified, standard or refined only through material trials',
   noMagicFromName:true},
  explanation:'Extensions are source-earned depth within canonical stages and professional skill; they do not raise grades, grant salaries/licences, copy beast powers or convert one discipline into another.'};
}
module.exports={SKILLS,SPECIALISTS,SYSTEM_INFO,DESCRIPTORS,WITHIN_TIER,proof,status};
