'use strict';
// #06: A sourced GM-authored branching plan ATTACHES to the existing
// individual evolution assessment and original progress/event resolver.
// It never rolls, changes species, gives consent or creates a beast.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 P=require('./progress'),Atlas=require('../world/atlas');
const ORIGIN='gm-authored-original-beast-branch-v1',ECO='verified-individual-evolution-ecology-v1';
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const integer=(x,lo,hi)=>Number.isInteger(x)&&x>=lo&&x<=hi;
const words=(x,min=12,max=700)=>typeof x==='string'&&x.trim().length>=min&&x.trim().length<=max;
const validId=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{1,40}$/.test(x);
const allowed=['beastId','branchId','parameters','ecology','incompatibleWith','source'];
function branch(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).some(x=>!allowed.includes(x)))
  throw Error('Author a specific sourced branch without selecting outcome, dice, permission or instant form');
 const b=s.beasts?.[p.beastId],q=p.parameters,eco=p.ecology;
 if(!b||b.id!==p.beastId||!E.SPECIES[b.species]||
  typeof b.evolutionStage!=='string'||!validId(p.branchId)||
  !q||typeof q!=='object'||Array.isArray(q)||
  q.beastId!==p.beastId||q.branchId!==p.branchId||
  !words(p.source,24,1000))
  throw Error('Branch authorship requires a particular pre-existing creature and a traceable current-form origin');
 if(b.evolutionBranchAssessments?.[p.branchId]||
    s.table?.evolution?.[p.beastId+'/'+p.branchId])
  throw Error('This original individual already has a branch assessment');
 // The existing progress resolver remains the ONLY authority for what
 // constitutes a full form, qualitative Grade and committed prerequisites.
 if(!words(q.name,3,100)||!['normal','standard','environmental','dietary','bond-born',
    'rare','hidden','legendary'].includes(q.kind)||
  !integer(q.grade,1,9)||!integer(q.requiredYears,0,10000)||
  !integer(q.potential,0,5)||!integer(q.gradeCeiling,0,9)||
  !Array.isArray(q.conditions)||q.conditions.length===0||
  q.conditions.some(x=>!x||!words(x.label,5,300)||
    typeof x.met!=='boolean'||typeof x.known!=='boolean')||
  typeof q.documented!=='boolean'||typeof q.specialConditionsMet!=='boolean')
  throw Error('A possible form needs authentic biological maturity, potential and source-authored prerequisite assessments');
 const form=P.validateFormProfile(q.formProfile,q.grade);
 if(!q.eventStats||!words(q.eventStats.basis,18,200)||
    !integer(q.eventStats.vigor,-10,20)||!integer(q.eventStats.will,-10,20))
  throw Error('An original measured individual Vigor/Will record is required before a possible transformation');
 // A target can be any coherent original species or form. It does NOT need
 // to appear in a tiny enumerated evolution tree.
 if(!eco||!Atlas.R[eco.regionId]||
  !integer(eco.minForage,0,100)||!integer(eco.minWater,0,100)||
  !integer(eco.minQuality,0,100)||!integer(eco.maxPressure,0,100)||
  !integer(eco.riteEnergy,0,100000)||!integer(eco.riteCondition,0,25)||
  !words(eco.basis,18,800))
  throw Error('Transformation needs GM-authored regional physiological fit and genuine energetic/metabolic costs');
 if(!Array.isArray(p.incompatibleWith)||p.incompatibleWith.length>40||
    p.incompatibleWith.some(x=>!validId(x)||x===p.branchId)||
    new Set(p.incompatibleWith).size!==p.incompatibleWith.length)
  throw Error('Incompatible routes must cite other possible original branch IDs');
 const source={origin:ORIGIN,beastId:b.id,sourceSpecies:b.species,
  sourceStage:b.evolutionStage,branchId:p.branchId,
  minute:s.world.minutes,source:p.source.trim(),
  parameters:structuredClone({...q,formProfile:form}),
  ecology:structuredClone(eco),incompatibleWith:[...p.incompatibleWith]};
 // Establish this real world ecology in the existing realm before we attach
 // a future possibility; authoring never advances time or rolls for a beast.
 require('../world/simulation').ensure(s);
 // Persist the pre-existing authoritative assessment, not an alternate
 // form registry, eligibility formula or world ecology.
 const existing=b.evolutionBranchAssessments||(b.evolutionBranchAssessments={});
 existing[p.branchId]={beastId:b.id,branchId:p.branchId,
  species:b.species,evolutionStage:b.evolutionStage,
  worldMinute:s.world.minutes,source:p.source.trim(),
  parameters:structuredClone(source.parameters),
  branching:{source,seal:digest(source)}};
 return {authored:true,beastId:b.id,branchId:p.branchId,
  noCreatureOrEvolutionCreated:true,notDiscoveredByPlayer:true};
}
function validated(a,b){
 const plan=a?.branching,s=plan?.source;
 if(!plan||!s||s.origin!==ORIGIN||plan.seal!==digest(s)||
  s.beastId!==b.id||s.branchId!==a.branchId||
  s.sourceSpecies!==a.species||s.sourceStage!==a.evolutionStage||
  s.minute!==a.worldMinute||s.source!==a.source||
  digest(s.parameters)!==digest(a.parameters)||
  !words(s.source,24,1000)||!Atlas.R[s.ecology?.regionId]||
  !integer(s.ecology?.minForage,0,100)||
  !integer(s.ecology?.minWater,0,100)||
  !integer(s.ecology?.minQuality,0,100)||
  !integer(s.ecology?.maxPressure,0,100)||
  !integer(s.ecology?.riteEnergy,0,100000)||
  !integer(s.ecology?.riteCondition,0,25)||
  !words(s.ecology?.basis,18,800)||!Array.isArray(s.incompatibleWith)||
  s.incompatibleWith.some(x=>!validId(x)||x===s.branchId))
  throw Error('Recorded branching path differs from original GM-authored biological provenance');
 P.validateFormProfile(s.parameters.formProfile,s.parameters.grade);
 return plan;
}
function preRegister(s,b,a){
 if(!a.branching)return null; // Existing authentic pre-#06 branches still work.
 const plan=validated(a,b);
 if(plan.source.sourceSpecies!==b.species||
    plan.source.sourceStage!==b.evolutionStage)
  throw Error('The authored branch belongs to an earlier biological form');
 return plan;
}
function postRegister(s,b,assessment,record){
 if(!assessment.branching)return;
 const plan=preRegister(s,b,assessment),r=P.get(s,record.key);
 r.branching={source:structuredClone(plan.source),seal:plan.seal};
 r.originAssessment.branchSeal=plan.seal;
}
function current(s,r,b){
 if(!r.branching)return null; // Never break existing legitimate branches.
 const a=b.evolutionBranchAssessments?.[r.branchId];
 if(!a||r.branching.seal!==r.originAssessment?.branchSeal||
   r.branching.seal!==digest(r.branching.source)||
   r.branching.seal!==validated(a,b).seal)
  throw Error('Evolution candidate cannot proceed after its source assessment was altered');
 return r.branching.source;
}
function beforeEvent(s,r,b){
 const plan=current(s,r,b);
 if(!plan)return null;
 if(s.world.minutes<plan.minute||b.species!==plan.sourceSpecies||
  b.evolutionStage!==plan.sourceStage)
  throw Error('Evolution branch no longer matches this individual current form');
 const siblings=s.table?.evolution||{};
 if(Object.values(siblings).some(x=>x.beastId===b.id&&
   x.branchId!==r.branchId&&x.evolved&&x.originAssessment?.evolutionStage===plan.sourceStage))
  throw Error('A competing transformation has already changed this beast original form');
 const eco=s.table?.realm?.ecosystems?.[plan.ecology.regionId];
 const where=Atlas.LOCATION_REGION[s.world.location]||
  require('../world/lived-places').get(s,s.world.location)?.regionId;
 if(b.location!==s.world.location)
  throw Error('The evolving individual must genuinely occupy its witnessed present location');
 if(where!==plan.ecology.regionId||!eco)
  throw Error('Evolution must occur in its original documented compatible regional ecology');
 if(eco.forage<plan.ecology.minForage||
   eco.water<plan.ecology.minWater||eco.quality<plan.ecology.minQuality||
   eco.pressure>plan.ecology.maxPressure)
  throw Error('Real local ecosystem no longer supports this exact transformation');
 if(!integer(b.energy,0,1000000)||b.energy<plan.ecology.riteEnergy||
    !integer(b.condition,0,100)||b.condition-plan.ecology.riteCondition<60)
  throw Error('The beast cannot afford its independently authored biological transformation cost');
 return {plan,ecologicalSnapshot:{regionId:where,forage:eco.forage,
  water:eco.water,quality:eco.quality,pressure:eco.pressure}};
}
function afterEvent(s,r,b,outcome,context){
 if(!context||!Array.isArray(outcome.rolls)||!outcome.rolls.length)return;
 const {plan,ecologicalSnapshot}=context,c=plan.ecology;
 // A real attempted transformation, successful or failed, consumes actual
 // metabolic energy/condition. No resource is paid for a denied/no-roll rite.
 b.energy-=c.riteEnergy;b.condition-=c.riteCondition;
 const receipt={origin:ECO,branchId:r.branchId,sourceSeal:r.branching.seal,
  worldMinute:s.world.minutes,attempt:outcome.outcome,
  energySpent:c.riteEnergy,conditionSpent:c.riteCondition,
  originalEcology:ecologicalSnapshot,afterEnergy:b.energy,afterCondition:b.condition};
 receipt.seal=digest(receipt);
 r.branchAttemptOutcome=receipt;
 if(!r.evolved)return;
 // Physical ecology follows the ONE existing beast, not an invented
 // population migration or a taxonomically automatic new wild individual.
 b.evolutionEcology={origin:{origin:ECO,beastId:b.id,branchId:r.branchId,
   oldSpecies:plan.sourceSpecies,newSpecies:b.species,form:b.evolutionStage,
   branchSeal:r.branching.seal,minute:s.world.minutes,
   needs:structuredClone(c),initialEcology:ecologicalSnapshot},
  history:[],anchorHash:null,lastDay:Math.floor(s.world.minutes/1440),
  effectCount:0};
 b.evolutionEcology.anchorHash=digest(b.evolutionEcology.origin);
 b.evolutionEcology.headHash=b.evolutionEcology.anchorHash;
 for(const other of Object.values(s.table?.evolution||{})){
  if(other===r||other.beastId!==b.id||other.evolved||
    other.originAssessment?.evolutionStage!==plan.sourceStage)continue;
  other.blocked=true;other.closedBy=r.beastId+'/'+r.branchId;
  other.branchClosureSource=r.branching.seal;
 }
 // The actual existing evolution history already holds transformed anatomy,
 // organ, energy, abilities and needs; only append the environmental receipt.
 b.evolutionHistory.at(-1).branchWorldSource=receipt.seal;
}
function ecoVerify(s,b){
 const e=b?.evolutionEcology;
 if(!e)return true;
 const o=e.origin,r=s.table?.evolution?.[b.id+'/'+o.branchId];
 if(!o||o.origin!==ECO||o.beastId!==b.id||
  o.newSpecies!==b.species||o.form!==b.evolutionStage||
  !r?.evolved||r.branching?.seal!==o.branchSeal||
  !Array.isArray(e.history)||e.history.length>120||
  !integer(e.lastDay,0,10000000)||!integer(e.effectCount,0,10000000))
  return false;
 let previous=e.anchorHash;
 if(typeof previous!=='string'||!/^[a-f0-9]{64}$/.test(previous))return false;
 for(const row of e.history){
  if(row.previous!==previous||row.seal!==digest(row.source)||
    row.source.origin!==ECO||row.source.beastId!==b.id||
    !integer(row.source.day,0,10000000)||
    !integer(row.source.conditionLoss,1,3)||!integer(row.source.fatigueIncrease,0,10))
   return false;
  previous=row.seal;
 }
 return previous===e.headHash;
}
function sixday(s,days){
 if(!days.length)return {beastsStressed:0};
 let stressed=0;
 for(const b of Object.values(s.beasts||{})){
  const e=b?.evolutionEcology;if(!e)continue;
  if(!ecoVerify(s,b))throw Error('An evolved individual's ecological adaptation receipt was changed');
  const needs=e.origin.needs;
  for(const day of days){
   if(day<=e.lastDay)continue;
   e.lastDay=day;
   const where=Atlas.LOCATION_REGION[b.location]||
    require('../world/lived-places').get(s,b.location)?.regionId;
   const env=s.table?.realm?.ecosystems?.[where];
   const viable=!!env&&where===needs.regionId&&
    env.forage>=needs.minForage&&env.water>=needs.minWater&&
    env.quality>=needs.minQuality&&env.pressure<=needs.maxPressure;
   if(viable||b.condition<=0)continue;
   const change=Math.min(2,b.condition);
   b.condition-=change;
   if(b.needs&&integer(b.needs.fatigue,0,100))
    b.needs.fatigue=Math.min(100,b.needs.fatigue+3);
   const source={origin:ECO,beastId:b.id,day,
    regionId:where||null,conditionLoss:change,
    fatigueIncrease:b.needs?3:0,previous:e.headHash};
   const row={source,previous:e.headHash,seal:digest(source)};
   e.history.push(row);e.headHash=row.seal;
   if(e.history.length>100){
    const retired=e.history.splice(0,40);
    e.anchorHash=retired.at(-1).seal;
   }
   e.effectCount++;stressed++;
  }
  if(!ecoVerify(s,b))throw Error('Individual ecological consequences failed saved history verification');
 }
 return {beastsStressed:stressed}; // hidden world result, no remote locator.
}
function observed(s,r,proof,sceneHash){
 if(!r.branching)return;
 const b=s.beasts?.[r.beastId];current(s,r,b);
 const key=r.beastId+'/'+r.branchId;
 if(s.table?.evolutionDiscoveries?.[key]?.revealedToPlayer)return;
 s.table||={};s.table.evolutionDiscoveries||={};
 s.table.evolutionDiscoveries[key]={key,beastId:b.id,
  species:b.species,evolutionStage:b.evolutionStage,
  worldMinute:s.world.minutes,
  source:'Original recognised physical signs, source scene '+sceneHash,
  revealedToPlayer:true};
}
function status(s,p={}){
 if(!p||Object.keys(p).some(x=>x!=='beastId')||typeof p.beastId!=='string')
  throw Error('Branch status needs only an actual beast identity');
 const known=[];
 for(const [key,record] of Object.entries(s.table?.evolution||{})){
  if(record.beastId!==p.beastId||
     s.table.evolutionDiscoveries?.[key]?.revealedToPlayer!==true)
    continue;
  known.push({key,name:record.name,
   closed:!!record.blocked,evolved:!!record.evolved});
 }
 return {known,notAnEvolutionGrant:true,
  note:'Only personally discovered possibilities are shown, not secret branches, private readiness, unvisited biology or guaranteed transformation'};
}
module.exports={ORIGIN,ECO,branch,preRegister,postRegister,beforeEvent,afterEvent,sixday,ecoVerify,observed,status};
