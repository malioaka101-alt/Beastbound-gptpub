'use strict';
// A real player-authored design can yield a sealed research plan when an
// already implemented, non-magical physical mechanism supplies its truth.
// This does not turn arbitrary prose into discovered spells or approved cures.
const Crypto=require('node:crypto'),Atlas=require('../world/atlas'),
 Realm=require('../world/simulation'),Design=require('./creation-design');
const ORIGIN='witnessed-design-physical-research-plan-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const only=(p,keys)=>{
 if(!p||typeof p!=='object'||Array.isArray(p)||
   Object.keys(p).some(k=>!keys.includes(k)))
  throw Error('Only an authentic recorded design ID may select a research plan');
};
function design(s,id){
 if(typeof id!=='string'||!/^design_[1-9][0-9]*$/.test(id))
  throw Error('Use an original recorded design ID');
 const d=s.table?.creationDesigns?.records?.[id];
 if(!d||d.id!==id||d.origin!==Design.ORIGIN||
  d.source?.origin!==Design.ORIGIN||d.source?.id!==id||
  d.source.creator!==s.player.name||
  d.sourceHash!==hash(d.source)||d.proposalHash!==hash(d.proposal)||
  d.source.proposalHash!==d.proposalHash||
  d.source.scopeHash!==d.scopeHash||d.implementedEffect!==false||
  !['unproven-concept','prototyped','trial-failed'].includes(d.status))
  throw Error('Research needs an authenticated, personally authored technical dossier');
 const actual=Design.analysis(s,d.proposal);
 if(actual.scopeHash!==d.scopeHash||
    actual.envelope.effectGrade!==d.envelope.effectGrade)
  throw Error('The original invention mechanism and its actual grade do not match');
 return d;
}
function sourceEligible(s,d){
 const p=d.proposal,e=d.envelope;
 // Source-bound physical sensor is an *implemented* adapter; other concepts
 // are still welcome as drafts, but may not invent their own research truth.
 if(p.system!=='mundane'||p.medium!=='tool'||
    p.function!=='sense'||p.target!=='surface_water'||
    p.magnitude!==0||p.range!=='touch'||p.area!=='single'||
    p.duration!=='1min'||p.novelty!=='variant'||
    e.effectGrade!==1)
  throw Error('This design has no independently established testable physical mechanism yet; do not fabricate feasibility for magical or unsupported creations');
 const reg=Atlas.R[Atlas.LOCATION_REGION[s.world.location]];
 const w=Realm.peek(s),eco=w.ecosystems?.[reg?.id];
 if(!reg||!eco||!Number.isFinite(eco.water)||
  !['wetland','coast','forest','reef'].includes(reg.biome))
  throw Error('A real accessible local water habitat is required for this physical research proposal');
 return {regionId:reg.id,polity:reg.polity,localBiome:reg.biome,
  groundedEnvironmentalSource:'Atlas habitat and persistent water conditions, not caller-supplied truth'};
}
function verifyPlan(s,plan){
 if(!plan||plan.origin!==ORIGIN||typeof plan.id!=='string'||
  plan.id!=='study_'+plan.designId||plan.parameters?.id!==plan.id||
  plan.sourceHash!==hash({origin:plan.origin,id:plan.id,
   designId:plan.designId,designSourceHash:plan.designSourceHash,
   designScopeHash:plan.designScopeHash,parameters:plan.parameters,
   localSource:plan.localSource,worldMinute:plan.worldMinute})||
  plan.source!==ORIGIN+':'+plan.sourceHash||
  !Number.isInteger(plan.worldMinute)||plan.worldMinute<0||
  plan.worldMinute>s.world.minutes)return false;
 try{
  const d=design(s,plan.designId),p=plan.parameters;
  return d.sourceHash===plan.designSourceHash&&
    d.scopeHash===plan.designScopeHash&&
    p.creationScopeHash===d.scopeHash&&
    p.grade===1&&p.novelty==='variant'&&p.skill==='research'&&
    p.kind==='invention'&&p.theory===false&&
    p.truth?.feasibility==='catch'&&
    Array.isArray(p.truth.requirements)&&
    p.truth.requirements.length===3&&
    plan.localSource?.polity===Atlas.R[plan.localSource.regionId]?.polity;
 }catch{return false;}
}
function prepare(s,p={}){
 only(p,['designId']);
 const d=design(s,p.designId),src=sourceEligible(s,d),id='study_'+d.id;
 s.table||={};s.table.researchPlans||={};
 if(s.table.researchPlans[id]){
  const old=s.table.researchPlans[id];
  if(!verifyPlan(s,old))throw Error('Previously sealed design research truth has been altered');
  return {id,designId:d.id,alreadyPrepared:true,sourceBound:true,
   noTimeElapsed:true,noResearchAwarded:true,noTechniqueLearned:true};
 }
 const plan={id,designId:d.id,origin:ORIGIN,
  designSourceHash:d.sourceHash,designScopeHash:d.scopeHash,
  localSource:src,worldMinute:s.world.minutes,used:false,
  parameters:{id,title:d.proposal.title,kind:'invention',skill:'research',
   grade:1,novelty:'variant',theory:false,
   creationScopeHash:d.scopeHash,
   truth:{feasibility:'catch',requirements:[
    'Physically calibrate the sensor against accessible local surface water',
    'Show repeated readings agree with independently observed changes',
    'Identify material limitations and non-magical false readings'
   ],acceptedHypotheses:[
    'The material response corresponds to a limited local surface-water condition'
   ]}}};
 plan.sourceHash=hash({origin:plan.origin,id:plan.id,
   designId:plan.designId,designSourceHash:plan.designSourceHash,
   designScopeHash:plan.designScopeHash,parameters:plan.parameters,
   localSource:plan.localSource,worldMinute:plan.worldMinute});
 plan.source=ORIGIN+':'+plan.sourceHash;
 if(!verifyPlan(s,plan))throw Error('Cannot seal an inconsistent physical research source');
 s.table.researchPlans[id]=plan;
 return {id,designId:d.id,sourceBound:true,precommitted:true,
  mechanism:'limited real surface-water observation',
  leadSkill:'research',requiredGrade:1,novelty:'variant',
  noTimeElapsed:true,noResearchAwarded:true,noTechniqueLearned:true,
  note:'Research must still start, survey, consume actual weeks and resources, prove and be independently replicated. This does not craft or calibrate the instrument.'};
}
function status(s,p={}){
 only(p,['designId']);
 const plans=Object.values(s.table?.researchPlans||{})
  .filter(x=>x?.origin===ORIGIN&&
   (p.designId===undefined||x.designId===p.designId));
 return {plans:plans.map(x=>{
  if(!verifyPlan(s,x))throw Error('An authenticated research plan has been altered');
  return {id:x.id,designId:x.designId,
   title:x.parameters.title,sourceBound:true,registered:!!x.used,
   status:s.table?.research?.[x.id]?.status||'prepared',
   completedReplications:s.table?.research?.[x.id]?.replications||0,
   noAutomaticTechnique:true};
 }),note:'Player-known project identity only; feasibility details stay sealed until research actually reveals them.'};
}
module.exports={ORIGIN,prepare,status,verifyPlan};
