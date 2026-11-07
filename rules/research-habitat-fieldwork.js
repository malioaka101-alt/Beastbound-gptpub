'use strict';
// A deliberately narrow bridge from one real, player-resolved habitat check
// into one independently scoped ecology research fieldwork interval.
// No player-selected scientific truth, subject, grade, relevance or dice.
const Crypto=require('node:crypto'),C=require('./core'),R=require('./research');
const E=require('../engine.js'),Habitat=require('./habitat-survey');
const digest=entry=>Crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex');
const DAY=1440;
function record(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).length!==2||typeof p.id!=='string'||
    typeof p.checkId!=='string')
  throw Error('Habitat research fieldwork accepts only an established project id and witnessed checkId');
 const project=R.get(s,p.id),plan=s.table?.researchPlans?.[p.id];
 if(!plan||!plan.used||plan.id!==p.id||!project.sourceResearchPlan||
    project.sourceResearchPlan!==plan.source||
    project.status!=='researching'||project.surveyed!==true||
    project.kind!=='ecology'||plan.parameters?.kind!=='ecology')
  throw Error('An active, independently precommitted ecology research project is required');
 // A broad 'research' title is insufficient: relevance to PHYSICAL terrain
 // signs must have been fixed in the saved plan before the observation.
 const scope=plan.habitatFieldworkScope;
 const a=s.table?.sceneChecks?.[p.checkId],
       finding=s.table?.habitatSurveyFindings?.[p.checkId];
 const cfg=Habitat.SURVEYS[scope?.biome];
 const loc=E.LOCATIONS[scope?.location];
 if(!scope||scope.kind!=='physical-terrain-observation'||
    scope.projectId!==p.id||scope.location!==a?.location||
    scope.biome!==a?.biome||loc?.biome!==scope.biome||!cfg||
    !loc.spawns?.length||scope.subject!==cfg.subject||
    typeof scope.source!=='string'||scope.source.trim().length<18||
    typeof scope.relevance!=='string'||scope.relevance.trim().length<18||
    !Number.isInteger(scope.worldMinute)||scope.worldMinute<plan.worldMinute||
    !Number.isInteger(a?.worldMinute)||scope.worldMinute>a.worldMinute||
    plan.worldMinute>a.worldMinute)
  throw Error('Ecology fieldwork requires a source-precommitted physical terrain question matching this habitat before the check');
 if(!a.used||a.origin!=='engine-habitat-survey'||a.location!==scope.location||
    a.subject!==cfg.subject||a.skill!=='survival'||a.attribute!=='wis'||
    a.dc!==cfg.dc||a.extra!==0||a.minutes!==15||
    a.label!=='Interpret '+cfg.subject||a.risky!==true||
    typeof a.source!=='string'||a.source!==
      'Engine-observed '+cfg.sign.toLowerCase()+' at known '+loc.name||
    !Number.isInteger(a.checkedAtMinute)||a.checkedAtMinute<a.worldMinute||
    a.checkedAtMinute>s.world.minutes||
    !Number.isInteger(a.eventIndex)||a.eventIndex<0||a.eventIndex>=s.log.length)
  throw Error('Only a resolved, source-authenticated terrain Survey check can count as this fieldwork');
 const physicalScene=s.log[a.eventIndex];
 if(physicalScene?.type!=='world'||
    physicalScene.text!==cfg.sign+' are visible at '+loc.name+'.'||
    physicalScene.details?.checkId!==p.checkId||
    physicalScene.details?.location!==scope.location||
    physicalScene.details?.biome!==scope.biome||
    physicalScene.details?.observation!=='terrain-traces'||
    digest(physicalScene)!==a.eventHash||
    s.table?.sceneCheckEventsUsed?.[a.eventHash]!==p.checkId)
  throw Error('The original physical terrain scene and its real Survey check must be witnessed together');
 if(!finding||finding.checkId!==p.checkId||
    finding.location!==scope.location||finding.biome!==scope.biome||
    finding.observedSceneHash!==a.eventHash||
    finding.interpretedAtMinute!==a.checkedAtMinute||
    !Number.isInteger(finding.rollEventIndex)||
    finding.rollEventIndex<=a.eventIndex||
    finding.rollEventIndex>=s.log.length||
    s.world.minutes-finding.interpretedAtMinute>6*DAY)
  throw Error('Habitat interpretation has no current source-verified original check result');
 const event=s.log[finding.rollEventIndex],hash=digest(event),r=event?.details;
 if(event?.type!=='roll'||finding.rollEventHash!==hash||
    !r||!Number.isInteger(r.roll)||r.roll<1||r.roll>20||
    !Number.isInteger(r.margin)||r.dc!==a.dc||
    r.degree!==finding.degree||r.success!==finding.success||
    !event.text.includes(a.label))
  throw Error('The authentic original Survival dice cannot be reconstructed for habitat fieldwork');
 const currentSixday=Math.floor((E.day(s)-1)/6);
 if(Math.floor((event.day-1)/6)!==currentSixday)
  throw Error('Fieldwork must be credited during the sixday of the actual observation');
 const prior=project.fieldwork||[];
 if(prior.filter(x=>x.sixday===currentSixday).length>=2)
  throw Error('At most two fieldwork intervals can be counted per sixday');
 if(prior.some(x=>x.evidenceId===hash)||
    s.table?.researchFieldEventsUsed?.[hash]||
    s.table?.habitatResearchEvidenceUsed?.[p.checkId]||
    s.table?.researchFieldEvidence?.[p.id]?.[String(finding.rollEventIndex)])
  throw Error('This original habitat observation has already been used for research');
 // All independent scope, current study and original dice guards precede
 // the reference formula's already rolled, no-extra-check fieldwork update.
 const result=R.fieldwork(s,project,{
  eventIndex:finding.rollEventIndex,relevance:scope.relevance});
 s.table||={};s.table.researchFieldEventsUsed||={};
 s.table.habitatResearchEvidenceUsed||={};
 s.table.researchFieldEvidence||={};
 s.table.researchFieldEvidence[p.id]||={};
 s.table.researchFieldEventsUsed[hash]=p.id;
 s.table.habitatResearchEvidenceUsed[p.checkId]={projectId:p.id,
  checkId:p.checkId,rollEventHash:hash,atMinute:s.world.minutes};
 s.table.researchFieldEvidence[p.id][String(finding.rollEventIndex)]={
  projectId:p.id,eventIndex:finding.rollEventIndex,eventHash:hash,
  worldMinute:s.world.minutes,source:scope.source,
  relevance:scope.relevance,origin:'engine-habitat-fieldwork',used:true,
  habitatCheckId:p.checkId};
 return {...result,authenticated:true,verifiedHabitatFieldwork:true,
  habitatCheckId:p.checkId,rollEventIndex:finding.rollEventIndex};
}
module.exports={record};
