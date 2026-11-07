'use strict';
// Lifelong *feel* emerges from independently earned skills, aptitude,
// challenging results and diverse practice, NEVER an elapsed-time gate.
// Clock movement only records how long a chosen action actually takes.
// The Unified Master Prompt's original named stages remain authoritative.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),W=require('./world'),
 U=require('./unified'),Char=require('./character'),
 Disciplines=require('./disciplines');
const ORIGIN='lifelong-mastery-practicum-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const POINTS_PER_DEGREE=90;
const DEGREES=Object.freeze(['Not established','Awareness','Reliable basics',
 'Repeatability','Applied fluency','Stabilised practice','Adaptation',
 'Integrated control','Independent innovation','Peak mastery']);
// Legacy multi-sixday routine practice remains available for old callers,
// but NO one must train for a day or a sixday to earn a mastery advancement.
// A short focused session is an equally legitimate earned opportunity.
const DAYS=[6,30,90,180];
const MINUTES={min:15,max:480,default:60};
const FOCI=Object.freeze({
 physical:['observation','repetition','field-application','recovery','innovation'],
 mental:['observation','repetition','analysis','field-application','innovation'],
 spiritual:['self-awareness','repetition','stabilisation','service','innovation'],
 social:['listening','shared-practice','field-application','reflection','innovation'],
 craft:['observation','repetition','field-application','repair','innovation']
});
const PROFESSION_FACETS=Object.freeze({
 survival:{attribute:'wis',potential:'physicalAdaptation'},
 beastcraft:{attribute:'wis',potential:'lineageCompatibility'},
 diplomacy:{attribute:'cha',potential:'synchronisation'},
 cultivation:{attribute:'wis',potential:'meridianBreadth'},
 arcana:{attribute:'int',potential:'manaCoreArchitecture'},
 medicine:{attribute:'int',potential:'soulResilience'},
 crafting:{attribute:'int',potential:'techniqueCreativity'},
 combat:{attribute:'dex',potential:'physicalAdaptation'},
 research:{attribute:'int',potential:'comprehension'}
});
const SPEC=Object.freeze({
 profession:{family:'craft',attribute:'int',skill:null},
 specialist:{family:'craft',attribute:'int',skill:null},
 meridian:{family:'physical',attribute:'wis',skill:'cultivation'},
 arcane:{family:'mental',attribute:'int',skill:'arcana'},
 soul:{family:'spiritual',attribute:'wis',skill:'cultivation'},
 body:{family:'physical',attribute:'con',skill:'survival'},
 rift:{family:'mental',attribute:'int',skill:'arcana'},
 origin:{family:'physical',attribute:'con',skill:'medicine'},
 evolution:{family:'physical',attribute:'con',skill:'survival'},
 sync:{family:'social',attribute:'wis',skill:'beastcraft'}
});
const BRIDGES=Object.freeze({
 profession:Object.freeze([{after:1,name:'Independent Foundations'},
  {after:3,name:'Applied Judgement'},{after:4,name:'Integrated Masterwork'}]),
 specialist:Object.freeze([{after:2,name:'School Technique Integration'},
  {after:4,name:'Independent Method Synthesis'},
  {after:5,name:'Original Discipline Architecture'}]),
 meridian:Object.freeze([{after:3,name:'Gate-Weave Consolidation'},
  {after:5,name:'Living Circulation Synthesis'},
  {after:7,name:'Constitutional Resonance'}]),
 arcane:Object.freeze([{after:3,name:'Circle-Lattice Stabilisation'},
  {after:5,name:'Field-Matrix Coherence'},
  {after:7,name:'Astral Circuit Synthesis'}]),
 soul:Object.freeze([{after:2,name:'Spirit-Thread Tempering'},
  {after:4,name:'Inner Pattern Consolidation'},
  {after:5,name:'Sanctuary Resonance Integration'}]),
 body:Object.freeze([{after:2,name:'Marrow-Tissue Harmonisation'},
  {after:4,name:'Sense-Organ Integration'},
  {after:5,name:'Blood-Essence Consolidation'}]),
 rift:Object.freeze([{after:3,name:'Anchored Fold Stabilisation'},
  {after:5,name:'Boundary-Space Integration'},
  {after:6,name:'Realm-Pressure Harmonisation'}]),
 origin:Object.freeze([{after:2,name:'Lineage Acceptance Trials'},
  {after:4,name:'Trait-Pattern Consolidation'},
  {after:6,name:'Ancestral Expression Synthesis'}]),
 evolution:Object.freeze([{after:2,name:'Awakened Constitution Stabilisation'},
  {after:4,name:'Transformed Form Integration'},
  {after:5,name:'Ascendant Adaptation Synthesis'}]),
 sync:Object.freeze([{after:3,name:'Reciprocal Pattern Alignment'},
  {after:6,name:'Paired Manifestation Refinement'},
  {after:8,name:'Shared Evolution Readiness'}]),
 beastIndividual:Object.freeze([{after:3,name:'Lineage Expression Study'},
  {after:5,name:'Adaptive Potential Study'},
  {after:7,name:'Evolutionary Stability Study'}]),
 item:Object.freeze([{after:3,name:'Material Stability Verification'},
  {after:5,name:'Operational Endurance Verification'},
  {after:7,name:'Exceptional Quality Verification'}])
});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function stage(s,path,skill){
 if(!Object.hasOwn(SPEC,path))throw Error('Unknown distinct mastery path');
 const sp=SPEC[path];
 if(path==='profession'){
  if(typeof skill!=='string'||!Object.hasOwn(s.player?.skills||{},skill))
   throw Error('An actual existing profession or earned skill is required');
  return {value:C.int(s.player.skills[skill].rank,'existing professional rank',0,5),
   skill,qualified:true};
 }
 if(path==='specialist'){
  // No generic Crafting rank may impersonate an earned specialist rank.
  const x=s.table?.specialistMilestones?.[skill];
  if(!x||!Number.isInteger(x.rank)||x.rank<1||x.rank>7||
    !Array.isArray(x.authenticatedWork)||x.authenticatedWork.length===0)
   return {value:0,skill:skill||null,qualified:false};
  return {value:x.rank,skill,qualified:true};
 }
 if(path==='sync'){
  const records=s.table?.verifiedPairSync||{};
  const x=skill&&records[skill];
  if(!x||!s.player.partnerIds?.includes(skill)||
    !Number.isInteger(x.stage)||x.stage<1||x.stage>10||
    x.consented!==true||!Array.isArray(x.evidence)||!x.evidence.length)
   return {value:0,skill:skill||null,qualified:false};
  return {value:x.stage,skill,qualified:true};
 }
 if(path==='evolution'){
  const v=s.player?.humanEvolution?.stage||0;
  // The legacy engine can set human forms, but this next fine-grained
  // model must not make an unsourced old evolution look verified.
  const witnessed=s.table?.evolutionEventProof?.some(x=>
   x?.stage===v&&x?.verified===true);
  return {value:v,skill:sp.skill,qualified:v>0&&!!witnessed};
 }
 if(path==='origin'){
  const x=s.player?.origin?.phase||0;
  return {value:x,skill:sp.skill,qualified:x>0&&!!s.table?.originIntegrationEvidence?.some(y=>
   y?.phase===x&&y?.sourceHash)};
 }
 const v=path==='meridian'?s.player?.meridian?.stage||0:
  path==='arcane'?s.player?.arcane?.circles||0:
  path==='soul'?s.player?.soul?.phase||0:
  path==='body'?s.player?.body?.cycles?.length||0:
  path==='rift'?s.player?.rift?.step||0:0;
 const hist=s.table?.disciplineTraining?.[path]?.history||[];
 const anyBreakthrough=hist.some(h=>typeof h?.change==='string'&&h.change.length>12);
 // Only currently implemented *first* milestones have complete verification.
 // Further tiers must eventually verify their own detailed discipline record.
 const verified=anyBreakthrough && v>0 && (
  (path==='arcane'&&v===1&&s.player.arcane.coreIgnited)||
  (path==='soul'&&v===1)||
  (path==='body'&&v===1)||
  (path==='rift'&&v===1)||
  (path==='meridian'&&v===1));
 return {value:v,skill:sp.skill,qualified:!!verified};
}
function key(path,skill,rank){
 return [path,skill||'personal',rank].join(':');
}
function derived(s,path,skill){
 const sp=SPEC[path],t=stage(s,path,skill),
  str=sp.skill||t.skill;
 const base=s.player?.skills?.[str];
 const rank=base?C.int(base.rank,'earned practice skill rank',0,5):0;
 const field=path==='profession'?PROFESSION_FACETS[skill]:null,
  attribute=field?.attribute||sp.attribute,
  attr=C.int(s.player?.attributes?.[attribute],attribute,1,30);
 const profile=s.player?.capabilityProfile||Char.make(s);
 Char.validate(profile);
 const potentialKey=path==='profession'?(field?.potential||'techniqueCreativity'):
  path==='specialist'?'techniqueCreativity':
  path==='arcane'?'manaCoreArchitecture':
  path==='soul'?'soulDepth':
  path==='body'?'physicalAdaptation':
  path==='meridian'?'meridianBreadth':
  path==='rift'?'comprehension':
  path==='origin'?'traitIntegration':
  path==='evolution'?'evolutionaryPlasticity':'synchronisation';
 const latent=profile.potential?.[potentialKey]?.latent||1;
 const factor=latent>=9&&attr>=18&&rank>=4?3:
  latent>=8&&attr>=15&&rank>=3?2:1;
 return {stage:t,skill:str,rank,attr,factor,
  modifier:Math.floor((attr-10)/2)+2*rank,focus:FOCI[sp.family]};
}
function verify(s,rec,path,skill,rank){
 if(!rec)return;
 if(rec.origin!==ORIGIN||rec.path!==path||rec.stage!==rank||
  rec.key!==key(path,skill,rank)||rec.sourceHash!==hash(rec.source)||
  rec.source?.path!==path||rec.source?.skill!==(skill||null)||
  rec.source?.stage!==rank||
  !Number.isInteger(rec.points)||rec.points<0||rec.points>900||
  !Number.isInteger(rec.workSixdays)||rec.workSixdays<0||
  (rec.workSessions!==undefined&&
   (!Number.isInteger(rec.workSessions)||rec.workSessions<rec.workSixdays))||
  (rec.workMinutes!==undefined&&
   (!Number.isInteger(rec.workMinutes)||rec.workMinutes<rec.workSixdays*6*1440))||
  !Number.isInteger(rec.successes)||rec.successes<0||
  rec.successes>(rec.workSessions??rec.workSixdays)||
  !Number.isInteger(rec.lastCompletedDay)||rec.lastCompletedDay<0||
  rec.lastCompletedDay>Math.floor(s.world.minutes/1440)||
  !rec.methods||typeof rec.methods!=='object'||
  !Array.isArray(rec.events)||rec.events.length>24||
  !Array.isArray(rec.bridges)||rec.bridges.length>3||
  rec.events.some(x=>!x||typeof x.checkHash!=='string'||x.checkHash.length!==64))
  throw Error('Unverified long-term mastery record; claimed ranks and hidden progress are not accepted');
}
function depth(rec){
 if(!rec)return 0;
 const raw=Math.min(9,Math.floor(rec.points/POINTS_PER_DEGREE));
 // Performing four different *unsuccessful* drills does not prove four
 // mastered methods. Only genuinely successful varied applications count.
 const varieties=Object.values(rec.provenMethods||rec.methods)
  .filter(n=>Number.isInteger(n)&&n>0).length;
 const breadth=varieties>=4?9:varieties>=3?7:varieties>=2?4:2;
 return Math.min(raw,breadth);
}
function current(s,path,skill){
 const v=derived(s,path,skill),id=key(path,skill,v.stage.value),
  rec=s.table?.lifelongMastery?.[id];
 verify(s,rec,path,skill,v.stage.value);
 return {id,record:rec,derived:v,level:depth(rec)};
}
function details(s,path,skill){
 const c=current(s,path,skill),r=c.record,ext=BRIDGES[path]||[];
 // A bridge already earned at an earlier rank remains part of a real
 // individual's history when that person later advances to another rank.
 const historic=Object.values(s.table?.lifelongMastery||{}).filter(x=>
  x?.path===path&&x.source?.skill===(skill||null));
 for(const previous of historic)
  verify(s,previous,path,skill,previous.stage);
 const pastBridges=new Set(historic.flatMap(x=>x.bridges||[]));
 return {path,subject:skill||null,canonicalStage:c.derived.stage.value,
  qualifiedForPractice:c.derived.stage.qualified,
  // Time is descriptive, never a prerequisite for an earned degree.
  establishedWorkDays:(r?.workMinutes??((r?.workSixdays||0)*6*1440))/1440,
  actualPracticeSessions:r?.workSessions??r?.workSixdays??0,
  demonstratedMethods:r?Object.keys(r.provenMethods||r.methods)
   .filter(k=>(r.provenMethods||r.methods)[k]>0):[],
  earnedProgress:r?.points||0,
  progressPerDegree:POINTS_PER_DEGREE,
  masteryDegree:c.level,masteryName:DEGREES[c.level],
  availableMasteryDegrees:DEGREES.slice(1),
  earnedBridgeStages:[...pastBridges],
  additionalMiddleStages:ext.map(b=>({...b,
   attained:pastBridges.has(b.name)})),
  note:'Progress comes from the calibre and diversity of the work and individual aptitude, not elapsed calendar days. Time only records the real duration of chosen activity; no minimum days, years or age are required.'};
}
function validateAction(s,p){
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).some(k=>!['path','skill','focus','days','minutes'].includes(k))||
  !Object.hasOwn(SPEC,p.path)||
  (p.skill!==undefined&&(typeof p.skill!=='string'||p.skill.length>80))||
  (p.days!==undefined&&!DAYS.includes(p.days))||
  (p.minutes!==undefined&&
    (!Number.isInteger(p.minutes)||p.minutes<MINUTES.min||p.minutes>MINUTES.max))||
  (p.days!==undefined&&p.minutes!==undefined))
  throw Error('Mastery requires actual work, an earned path and an optional real session length; no caller-provided success, calendar minimum, bonus or breakthrough');
 const d=derived(s,p.path,p.skill);
 if(!d.stage.qualified||
    (d.stage.value===0&&p.path!=='profession'))
  throw Error('This discipline has not been independently established; ordinary training cannot claim an unearned supernatural stage or specialist licence');
 // Rank-zero professionals may genuinely learn by doing. An untrained
 // inventor, medic or scout does not need a purchased rank before practice.
 if(!d.focus.includes(p.focus))
  throw Error('The proposed practice focus must be appropriate to this actual distinct discipline');
 if(s.encounter||s.battle||s.table?.combatants?.player?.status&&
   s.table.combatants.player.status!=='ok')
  throw Error('An unresolved threat or incapacity prevents a settled, sustained practice period');
 if(p.days>6&&s.player.partnerIds?.length)
  throw Error('Multi-sixday dedicated practice with living partners requires a separately witnessed care arrangement');
 if(p.path==='rift'&&!['ruins'].includes(s.world.location))
  throw Error('Rift work currently needs an actual documented local spatial anomaly');
 const rec=current(s,p.path,p.skill);
 // No date-based recovery lock. Actual fatigue, injury, danger and
 // available Stamina determine whether another session is physically possible.
 if(C.int(s.player.stamina,'recorded training Stamina',0,100000)<3)
  throw Error('Sustained physical and mental practice requires available Stamina');
 return rec;
}
function practice(s,p={}){
 const c=validateAction(s,p),
  // The old days option describes optional long-form routine training only;
  // minutes offers immediate meaningful work without waiting for a sixday.
  legacyDays=p.days!==undefined,periods=legacyDays?p.days/6:1,
  sessionMinutes=legacyDays?6*1440:(p.minutes??MINUTES.default),
  lastRec=c.record,df=c.derived,path=p.path,id=c.id,skill=p.skill||null;
 s.table||={};s.table.lifelongMastery||={};
 const rec=lastRec||{
  origin:ORIGIN,key:id,path,stage:df.stage.value,
  source:{origin:ORIGIN,key:id,path,skill,stage:df.stage.value,
   startedAtMinute:s.world.minutes,recordedBy:s.player.name},
  sourceHash:null,points:0,workSixdays:0,workSessions:0,
  workMinutes:0,successes:0,methods:{},provenMethods:{},
  events:[],bridges:[],lastCompletedDay:0
 };
 if(!rec.sourceHash)rec.sourceHash=hash(rec.source);
 let successful=0,gained=0,lastCheck=null,elapsedMinutes=0;
 const checks=[];
 for(let i=0;i<periods;i++){
  // The *challenge* grows with actual demonstrated skill, not years
  // served. High mastery takes rarer, more difficult success, while genuine
  // talent and original insight can still achieve it immediately.
  const old=s.world.minutes,curDay=Math.floor(old/1440),
   demonstrated=Math.min(9,Math.floor(rec.points/POINTS_PER_DEGREE)),
   base=12+Math.min(6,Math.floor(df.stage.value/2))+demonstrated;
  const check=C.check(s,{modifier:df.modifier,dc:base,
   label:path+' '+p.focus+' sustained mastery study'});
  const witnessHash=hash(s.log.at(-1));
  const earned=check.success?check.progress*df.factor:0;
  rec.points=clamp(rec.points+earned,0,900);
  rec.workSessions=(rec.workSessions??rec.workSixdays)+1;
  if(legacyDays)rec.workSixdays++;
  rec.workMinutes=(rec.workMinutes??(rec.workSixdays*6*1440-
   (legacyDays?6*1440:0)))+sessionMinutes;
  if(check.success){
   rec.successes++;successful++;
   rec.provenMethods||={};
   rec.provenMethods[p.focus]=(rec.provenMethods[p.focus]||0)+1;
  }
  gained+=earned;lastCheck=check;elapsedMinutes+=sessionMinutes;
  checks.push({roll:check.roll,dc:check.dc,degree:check.degree,
   progress:earned,checkWitnessHash:witnessHash});
  rec.methods[p.focus]=(rec.methods[p.focus]||0)+1;
  rec.events.push({fromMinute:old,day:curDay,focus:p.focus,
   degree:check.degree,earned,checkHash:witnessHash});
  if(rec.events.length>24)rec.events.shift();
  // Time is a *consequence* of doing work, not the condition for earning
  // advancement. 15-minute work can be meaningful; idling for a century
  // without achievements does not change this ledger.
  s.player.stamina=Math.max(0,s.player.stamina-2);
  E.advance(s,sessionMinutes);
  W.finalizeTime(s,old);
  U.sync(s,{source:'legacy'});
  rec.lastCompletedDay=Math.floor(s.world.minutes/1440);
  if(check.degree==='severe failure'){
   s.player.stamina=Math.max(0,s.player.stamina-2);
   C.event(s,'progress','Strain interrupts the practicum; present physical condition, not a calendar date, determines further activity.',{
    origin:ORIGIN,path,focus:p.focus,checkHash:witnessHash,
    additionalStaminaSpent:2,noCalendarCooldown:true,
    notACompletedPowerStage:true});
   break;
  }
 }
 s.table.lifelongMastery[id]=rec;
 return {path,subject:skill,canonicalStage:df.stage.value,
  earnedProgress:gained,masteryDegree:depth(rec),
  masteryName:DEGREES[depth(rec)],sourceBound:true,
  elapsedMinutes,elapsedDays:elapsedMinutes/1440,
  practiceSixdays:rec.workSixdays,practiceSessions:rec.workSessions,
  successfulChecks:successful,checks,lastCheck,
  notACanonicalBreakthrough:true,noFreeTechnique:true,
  noAutomaticLicence:true};
}
function bridge(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).some(k=>!['path','skill'].includes(k))||
  !Object.hasOwn(SPEC,p.path))throw Error('Bridge advancement accepts only an actual path and verified personal subject');
 const c=current(s,p.path,p.skill),b=BRIDGES[p.path].find(x=>x.after===c.derived.stage.value);
 if(!b||!c.record||c.level!==9||!c.derived.stage.qualified)
  throw Error('A bridge requires a genuinely mastered current stage at a canonical intermediate crossing');
 if(c.record.bridges.includes(b.name))
  throw Error('The same intermediary mastery stage has already been achieved');
 if(Object.keys(c.record.provenMethods||c.record.methods)
   .filter(x=>(c.record.provenMethods||c.record.methods)[x]>0).length<4)
  throw Error('Four genuinely demonstrated, varied relevant methods are needed for this integration; no number of calendar days substitutes');
 if(s.encounter||s.battle)throw Error('A bridge cannot be claimed during an unresolved encounter');
 if(s.player.stamina<3)throw Error('Physical capacity is required for a real integration trial');
 const old=s.world.minutes,roll=C.check(s,{
  modifier:c.derived.modifier,dc:18+Math.floor(c.derived.stage.value/2),
  label:b.name+' independent integration trial'});
 const witnessHash=hash(s.log.at(-1));
 s.player.stamina=Math.max(0,s.player.stamina-2);
 E.advance(s,120);W.finalizeTime(s,old);U.sync(s,{source:'legacy'});
 c.record.lastCompletedDay=Math.floor(s.world.minutes/1440);
 c.record.workSessions=(c.record.workSessions??c.record.workSixdays)+1;
 c.record.workMinutes=(c.record.workMinutes??(c.record.workSixdays*6*1440))+120;
 c.record.events.push({fromMinute:old,focus:'intermediate-integration',
  earned:0,checkHash:witnessHash,degree:roll.degree});
 if(c.record.events.length>24)c.record.events.shift();
 if(roll.success)c.record.bridges.push(b.name);
 return {path:p.path,subject:p.skill||null,bridge:b.name,
  achieved:roll.success,earnedAtMinute:s.world.minutes,
  elapsedMinutes:120,noCalendarRequirement:true,
  check:roll,sourceWitnessHash:witnessHash,
  noStagePromotion:true,noFreePower:true,notALicence:true};
}
function bonus(s,skill){
 // Within-rank craft mastery may improve basic tested tool quality slightly.
 // It never raises a magic rank, derives extra damage or reduces material cost.
 if(!s?.player?.skills?.[skill])return 0;
 const c=current(s,'profession',skill);
 return c.level>=9?2:c.level>=6?1:0;
}
module.exports={ORIGIN,BRIDGES,DEGREES,FOCI,SPEC,PROFESSION_FACETS,POINTS_PER_DEGREE,MINUTES,
 stage,derived,details,practice,bridge,bonus,depth,current,verify,hash};
