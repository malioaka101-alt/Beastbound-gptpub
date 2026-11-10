'use strict';
// Original Master §26: separate specimen identification, material assay and
// controlled medicinal reaction. FIRST specific researched poultice variant:
// use actual shared physical work, existing human medicine and owned stock;
// never conjure novel potions, mutate bodies or introduce a second health pool.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),W=require('./world'),U=require('./unified'),
 Combat=require('./combat'),Work=require('./physical-work');
const SOURCE='individual-alchemical-bioassay-and-refinement-v1',
 ASSAY='gm-observed-original-marsh-reed-bioassay-v1',
 REACTION='gm-observed-original-controlled-poultice-reaction-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const integer=(n,a=0,b=100000000)=>Number.isInteger(n)&&n>=a&&n<=b;
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{3,65}$/.test(x);
const prose=x=>typeof x==='string'&&x.trim().length>=25&&x.length<=900;
const only=(p,keys)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(k=>keys.includes(k));
const REAGENT='marsh_reed',PRODUCT='healing_balm',
 RECIPE=Object.freeze({marsh_reed:2,clean_rations:1}),
 ASSAY_MINUTES=35,REACTION_MINUTES=70;
function ledger(s){return s.table?.specialistAlchemy||null;}
function cleanBench(s){
 const site=s.world?.location,place=E.LOCATIONS[site],
  good=(site==='academy'&&place?.facilities?.includes('clinic'))||
   (site==='crossing'&&place?.facilities?.includes('infirmary'));
 if(!good||s.battle||s.encounter||
  (s.world?.planeId&&s.world.planeId!=='mortal')||
  s.table?.combatants?.player?.status!=='ok')
  throw Error('An actually present stable clean human medical bench is needed for this original reagent experiment');
 if(!E.RESOURCES[REAGENT]||!E.RESOURCES.clean_rations||
  !E.RESOURCES[PRODUCT])
  throw Error('Actual previously established source ingredient and poultice stock must exist');
 return site;
}
function observed(s,index,type){
 if(!integer(index,0,(s.log?.length||0)-1))
  throw Error('A presently witnessed and independently measured alchemical experiment is required');
 const e=s.log[index],d=e?.details;
 const common=e?.type==='story'&&prose(e.text)&&
  d?.origin===type&&d.location===s.world.location&&
  id(d.specimenId)&&d.material===REAGENT&&
  prose(d.independentMaterialIdentification)&&
  prose(d.actualHabitatAndOwnership)&&
  prose(d.independentAdverseReactionTest)&&
  prose(d.chemicalAndEnergyLimits)&&
  prose(d.disposalAndPatientSafety)&&
  d.noInventedMedicine===true&&d.noUnverifiedHumanTransformation===true;
 if(!common)throw Error('An actually identified original physical reagent, source provenance, adverse test and patient safety limits are required');
 if(type===ASSAY){
  if(!prose(d.sampleMicroscopy)||!prose(d.measuredContaminationBaseline)||
   !prose(d.purityRangeAndUncertainty)||
   d.requiresTrueDestructiveSample!==true)
   throw Error('An independently witnessed destructive microscopic sample and contamination countertest are required');
 }else if(type===REACTION){
  if(!id(d.assayId)||!prose(d.measuredReactionTemperature)||
   !prose(d.independentReactionTiming)||
   !prose(d.separateInactiveControl)||
   !prose(d.actualTherapeuticMechanism)||
   d.output!==PRODUCT||
   hash(d.inputs)!==hash(RECIPE)||
   d.noExtraHealingStrength!==true)
   throw Error('The controlled reaction must cite an authentic assay, real material proportions and unchanged original balm effect');
 }
 return structuredClone(e);
}
function rollValid(a){
 const c=a?.check,e=a?.rollEvent;
 return !!(c&&e?.type==='roll'&&a.rollHash===hash(e)&&
  hash(e.details)===hash(c)&&integer(a.roll,1,20)&&
  a.roll===c.roll&&a.dc===c.dc&&a.modifier===c.modifier&&
  c.naturalBonus===C.naturalAdjustment(a.roll)&&
  c.total===a.roll+c.modifier+c.naturalBonus&&
  c.margin===c.total-c.dc&&c.success===(c.margin>=0)&&
  c.degree===C.degree(c.margin,true)&&
  c.progress===C.progress(c.degree));
}
function actualWork(a,required){
 return !!(a.workbench&&a.workbench.type==='research'&&
  a.workbenchHash===hash(a.workbench)&&
  a.workbench.details?.origin===SOURCE&&
  a.workbench.details?.operation===a.kind&&
  a.workbench.details?.specimenId===a.specimenId&&
  a.workbench.details?.sourceWitnessHash===a.witnessHash&&
  hash(a.workbench.details?.materials)===hash(required));
}
function verify(s){
 const l=ledger(s);
 if(!l)return true;
 if(l.origin!==SOURCE||!Array.isArray(l.assays)||
  !Array.isArray(l.refinements)||!l.assays.length||
  !l.profiles||typeof l.profiles!=='object'||Array.isArray(l.profiles))
  return false;
 const profiles={},assays=new Map(),witnesses=new Set(),ids=new Set();
 let previous=-1;
 for(const row of l.assays){
  const a=row?.source,d=a?.witness?.details;
  if(row?.origin!==SOURCE||!a||row.seal!==hash(a)||
   a.origin!==SOURCE||a.kind!=='destructive-reagent-bioassay'||
   !id(a.specimenId)||!E.LOCATIONS[a.location]||
   !integer(a.minute,previous,s.world.minutes)||
   a.minutes!==ASSAY_MINUTES||
   a.minute+a.minutes>s.world.minutes||
   a.staminaSpent!==2||a.dc!==12||
   a.materialUsed!==1||
   !integer(a.materialBefore,1,100000)||
   a.materialAfter!==a.materialBefore-1||
   !integer(a.intScore,1,30)||!integer(a.craftRank,0,5)||
   !integer(a.medicineRank,0,5)||
   a.modifier!==Math.floor((a.intScore-10)/2)+
    2*Math.min(a.craftRank,a.medicineRank)||
   !rollValid(a)||a.success!==a.check.success||
   !a.witness||a.witness.type!=='story'||
   a.witnessHash!==hash(a.witness)||
   d?.origin!==ASSAY||d.location!==a.location||
   d.specimenId!==a.specimenId||d.material!==REAGENT||
   !prose(d.independentMaterialIdentification)||
   !prose(d.actualHabitatAndOwnership)||
   !prose(d.independentAdverseReactionTest)||
   !prose(d.chemicalAndEnergyLimits)||
   !prose(d.disposalAndPatientSafety)||
   !prose(d.sampleMicroscopy)||!prose(d.measuredContaminationBaseline)||
   !prose(d.purityRangeAndUncertainty)||
   d.requiresTrueDestructiveSample!==true||
   d.noInventedMedicine!==true||
   d.noUnverifiedHumanTransformation!==true||
   !actualWork(a,{marsh_reed:1})||
   ids.has(a.specimenId)||witnesses.has(a.witnessHash))
   return false;
  witnesses.add(a.witnessHash);ids.add(a.specimenId);
  assays.set(a.specimenId,{source:a,seal:row.seal});
  if(a.success)profiles[a.specimenId]={origin:SOURCE,
   specimenId:a.specimenId,assaySeal:row.seal,
   sourceLocation:a.location,readyMinute:a.minute+a.minutes,
   usedBy:null,material:'marsh_reed',
   result:'independently measured limited purity and compatibility'};
  previous=a.minute+a.minutes;
 }
 previous=-1;
 for(const row of l.refinements){
  const a=row?.source,d=a?.witness?.details,assay=assays.get(a?.assayId),
   profile=profiles[a?.assayId];
  if(row?.origin!==SOURCE||!a||row.seal!==hash(a)||
   a.origin!==SOURCE||a.kind!=='controlled-poultice-refinement'||
   !id(a.specimenId)||!id(a.assayId)||
   !assay?.source.success||!profile||profile.usedBy!==null||
   !integer(a.minute,Math.max(previous,profile.readyMinute),s.world.minutes)||
   a.minutes!==REACTION_MINUTES||
   a.minute+a.minutes>s.world.minutes||
   a.staminaSpent!==3||a.dc!==12||
   !integer(a.intScore,1,30)||!integer(a.craftRank,0,5)||
   !integer(a.medicineRank,0,5)||
   a.modifier!==Math.floor((a.intScore-10)/2)+
    2*Math.min(a.craftRank,a.medicineRank)||
   !rollValid(a)||a.success!==a.check.success||
   a.assaySeal!==assay.seal||
   !a.inputBefore||!a.inputAfter||
   Object.entries(RECIPE).some(([k,q])=>
    !integer(a.inputBefore[k],q,100000)||
    a.inputAfter[k]!==a.inputBefore[k]-q)||
   !integer(a.outputBefore,0,100000)||
   a.outputAfter!==a.outputBefore+(a.success?1:0)||
   !a.witness||a.witness.type!=='story'||
   a.witnessHash!==hash(a.witness)||
   d?.origin!==REACTION||
   d.location!==a.location||d.specimenId!==a.specimenId||
   d.assayId!==a.assayId||d.material!==REAGENT||
   d.output!==PRODUCT||hash(d.inputs)!==hash(RECIPE)||
   !prose(d.independentMaterialIdentification)||
   !prose(d.actualHabitatAndOwnership)||
   !prose(d.independentAdverseReactionTest)||
   !prose(d.chemicalAndEnergyLimits)||
   !prose(d.disposalAndPatientSafety)||
   !prose(d.measuredReactionTemperature)||
   !prose(d.independentReactionTiming)||
   !prose(d.separateInactiveControl)||
   !prose(d.actualTherapeuticMechanism)||
   d.noInventedMedicine!==true||
   d.noUnverifiedHumanTransformation!==true||
   d.noExtraHealingStrength!==true||
   !actualWork(a,RECIPE)||
   witnesses.has(a.witnessHash))
   return false;
  profile.usedBy=row.seal;witnesses.add(a.witnessHash);
  previous=a.minute+a.minutes;
 }
 return hash(profiles)===hash(l.profiles);
}
function status(s){
 if(!verify(s))throw Error('The original material assay or alchemical reaction has lost source integrity');
 const l=ledger(s);
 return {assays:l?.assays.length||0,
  successfulControlledRefinements:(l?.refinements||[]).filter(r=>
   r.source.success).length,
  availableProfiles:Object.values(l?.profiles||{}).filter(p=>
   p.usedBy===null).map(p=>({specimenId:p.specimenId,
    material:p.material,sourceLocation:p.sourceLocation})),
  alreadyKnownOrdinaryPoulticeUnchanged:true,
  noMutagenicEffect:true,noSuperHealing:true,
  note:'This individually observed bioassay and reaction variant uses real plant samples, existing clean medical benches and the same original healing_balm item; it does not gate other lawful formulations'};
}
function assay(s,p={}){
 if(!only(p,['witnessIndex'])||
  !integer(p.witnessIndex,0,(s.log?.length||0)-1))
  throw Error('One witnessed real reagent assay is required');
 cleanBench(s);
 const witness=observed(s,p.witnessIndex,ASSAY);
 if(!verify(s))throw Error('Prior individual original reagent profiles cannot be verified');
 const d=witness.details,l=ledger(s),wHash=hash(witness);
 if(l?.assays.some(x=>x.source.specimenId===d.specimenId||
  x.source.witnessHash===wHash))
  throw Error('This individual reagent specimen or original observation has already been assayed');
 const intScore=C.int(s.player.attributes.int,'original Intelligence',1,30),
  craft=C.int(s.player.skills.crafting.rank,'actual Crafting',0,5),
  medicine=C.int(s.player.skills.medicine.rank,'actual Medicine',0,5),
  modifier=Math.floor((intScore-10)/2)+2*Math.min(craft,medicine),
  before=s.player.inventory?.marsh_reed||0;
 const work=Work.plan(s,{inputs:{marsh_reed:1},
  stamina:2,minutes:ASSAY_MINUTES,dc:12,modifier,
  label:'Independently assay one genuinely owned marsh-reed specimen',
  event:{type:'research',text:'A controlled original physical reed specimen assay is performed at the actual clean medical bench.',
   details:{origin:SOURCE,operation:'destructive-reagent-bioassay',
    specimenId:d.specimenId,sourceWitnessHash:wHash,
    materials:{marsh_reed:1}}}});
 const done=Work.perform(s,work),check=done.check;
 const a={origin:SOURCE,kind:'destructive-reagent-bioassay',
  specimenId:d.specimenId,location:s.world.location,
  minute:done.startedAtMinute,minutes:ASSAY_MINUTES,
  staminaSpent:2,materialUsed:1,materialBefore:before,
  materialAfter:before-1,dc:12,intScore,craftRank:craft,
  medicineRank:medicine,modifier,check:structuredClone(check),
  roll:check.roll,success:check.success,
  rollEvent:done.originalRoll,rollHash:done.rollHash,
  workbench:done.originalWorkbench,workbenchHash:done.witnessHash,
  witness,witnessHash:wHash};
 const row={origin:SOURCE,source:a,seal:hash(a)};
 s.table.specialistAlchemy||={origin:SOURCE,assays:[],
  refinements:[],profiles:{}};
 const r=s.table.specialistAlchemy;
 r.assays.push(row);
 if(check.success)r.profiles[d.specimenId]={
  origin:SOURCE,specimenId:d.specimenId,assaySeal:row.seal,
  sourceLocation:s.world.location,readyMinute:done.finishedAtMinute,
  usedBy:null,material:'marsh_reed',
  result:'independently measured limited purity and compatibility'};
 if(!verify(s))throw Error('The actual consumed original reagent specimen lacks assay integrity');
 return {attempted:true,sourceVerified:check.success,check,
  specimenId:d.specimenId,staminaSpent:2,marshReedConsumed:1,
  minutes:ASSAY_MINUTES,
  noFreeMedicine:true,noHumanBiologyChanged:true};
}
function refine(s,p={}){
 if(!only(p,['witnessIndex','assayId'])||
  !integer(p.witnessIndex,0,(s.log?.length||0)-1)||
  !id(p.assayId))
  throw Error('A real independently assayed reagent and separately witnessed controlled reaction are required');
 cleanBench(s);
 const witness=observed(s,p.witnessIndex,REACTION),
  d=witness.details,l=ledger(s);
 if(d.assayId!==p.assayId||!l?.profiles?.[p.assayId]||
  l.profiles[p.assayId].usedBy!==null)
  throw Error('An individual genuine unused successful reagent assay must support this measured reaction');
 if(!verify(s))throw Error('Historical original material assays and reactions cannot be verified');
 const wHash=hash(witness);
 if(l.refinements.some(x=>x.source.witnessHash===wHash))
  throw Error('The same physical original chemical reaction cannot be rerolled');
 // Existing healing balm remains the unchanged medicine economy and wound
 // effect. Output capacity is checked before ANY reagents or dice move.
 const outputBefore=C.int(s.player.inventory?.healing_balm||0,
  'actual existing healing balm',0,100000);
 if(outputBefore>=100000)
  throw Error('There is no verified physical space for an additional existing healing balm');
 const intScore=C.int(s.player.attributes.int,'actual Intelligence',1,30),
  craft=C.int(s.player.skills.crafting.rank,'actual Crafting',0,5),
  medicine=C.int(s.player.skills.medicine.rank,'actual Medicine',0,5),
  modifier=Math.floor((intScore-10)/2)+2*Math.min(craft,medicine),
  before=Object.fromEntries(Object.keys(RECIPE).map(k=>
   [k,s.player.inventory?.[k]||0])),
  after=Object.fromEntries(Object.entries(RECIPE).map(([k,q])=>[k,before[k]-q]));
 const work=Work.plan(s,{inputs:RECIPE,
  stamina:3,minutes:REACTION_MINUTES,dc:12,modifier,
  label:'Control a source-tested reed poultice alchemical reaction at the real infirmary',
  event:{type:'research',text:'The separately witnessed original reed-reaction stages are controlled on the actual clean medical workbench.',
   details:{origin:SOURCE,operation:'controlled-poultice-refinement',
    specimenId:d.specimenId,sourceWitnessHash:wHash,
    materials:{...RECIPE}}}});
 const done=Work.perform(s,work),check=done.check;
 if(check.success)U.applyItems(s,U.planItems(s,{healing_balm:1}));
 const a={origin:SOURCE,kind:'controlled-poultice-refinement',
  specimenId:d.specimenId,assayId:p.assayId,
  assaySeal:l.assays.find(x=>x.source.specimenId===p.assayId)?.seal,
  location:s.world.location,
  minute:done.startedAtMinute,minutes:REACTION_MINUTES,
  staminaSpent:3,inputBefore:before,inputAfter:after,
  outputBefore,outputAfter:outputBefore+(check.success?1:0),
  dc:12,intScore,craftRank:craft,medicineRank:medicine,modifier,
  check:structuredClone(check),roll:check.roll,success:check.success,
  rollEvent:done.originalRoll,rollHash:done.rollHash,
  workbench:done.originalWorkbench,workbenchHash:done.witnessHash,
  witness,witnessHash:wHash};
 const row={origin:SOURCE,source:a,seal:hash(a)};
 l.refinements.push(row);
 l.profiles[p.assayId].usedBy=row.seal;
 if(!verify(s))throw Error('Original controlled alchemical conversion did not conserve the prior assayed source');
 return {attempted:true,success:check.success,check,
  existingMedicineOnly:PRODUCT,
  actualOutput:check.success?{healing_balm:1}:{},
  materialsConsumed:{...RECIPE},staminaSpent:3,
  minutes:REACTION_MINUTES,assayConsumed:true,
  noNewWoundRules:true,noUnmeasuredMutagen:true};
}
module.exports={SOURCE,ASSAY,REACTION,verify,status,assay,refine};
