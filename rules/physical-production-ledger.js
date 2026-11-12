'use strict';
// #19: a source-sealed conservation ledger, NOT another recipe or skill menu.
// Only actual completed original physical-work mechanisms contribute rows:
// real field medicine and genuine individually researched tool assembly.
// It observes, but never rerolls or grants output, items, money, titles,
// permissions, engineering successes, or knowledge of private citizens.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),
  Prototype=require('./creation-prototype');
const ORIGIN='original-real-physical-production-conservation-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function fieldSource(s,index,originalReceiptHash=null){
 // Some authentic older checkpoints retain the historical first attempt
 // solely in fieldCraftDaily after the newer attempt list was removed.
 // Match the EXACT original immutable receipt, never assume a result.
 const current=s.table?.fieldCraftAttempts?.[index];
 const h=originalReceiptHash&&(!current||hash(current)!==originalReceiptHash)?
  Object.values(s.table?.fieldCraftDaily||{}).find(x=>
   hash(x)===originalReceiptHash):current;
 if(!h||h.recipe!=='field_poultice'||
  !['crossing','academy'].includes(h.site)||
  !h.originalWorkbench||!h.originalRoll||
  hash(h.originalWorkbench)!==h.witnessHash||
  hash(h.originalRoll)!==h.rollHash||
  h.originalWorkbench.type!=='world'||
  h.originalWorkbench.details?.origin!=='verified-common-poultice-workbench'||
  h.originalWorkbench.details.location!==h.site||
  h.originalWorkbench.details.output!=='healing_balm'||
  h.originalRoll.type!=='roll'||
  h.originalRoll.details?.success!==h.success||
  h.originalRoll.details?.roll!==h.check?.roll||
  h.originalRoll.details?.dc!==h.check?.dc||
  h.originalRoll.details?.margin!==h.check?.margin||
  !Number.isInteger(h.day)||h.day<0||
  !Number.isInteger(h.preparedMinute)||h.preparedMinute<0||
  h.finishedMinute-h.preparedMinute!==70||
  h.day!==Math.floor(h.preparedMinute/1440)||
  JSON.stringify(h.usedMaterials)!==JSON.stringify({marsh_reed:2,clean_rations:1})||
  JSON.stringify(h.originalWorkbench.details.inputs)!==
   JSON.stringify(h.usedMaterials)||
  JSON.stringify(h.output)!==
   JSON.stringify(h.success?{healing_balm:1}:{}))
  throw Error('No honest original consumed-input medicine work exists for this production receipt');
 return {origin:ORIGIN,kind:'existing-field-medicine',
  originalIndex:index,originalReceiptHash:hash(h),
  startMinute:h.preparedMinute,finishMinute:h.finishedMinute,day:h.day,
  location:h.site,originalWorkWitnessHash:h.witnessHash,
  originalRollWitnessHash:h.rollHash,
  materialsUsed:{...h.usedMaterials},physicalOutputs:{...h.output},
  originalOutcome:h.success?'completed-product':'failed-materials-spent',
  measuredRecoveredByproducts:{},
  noUnobservedWasteCompositionClaimed:true,
  actualPhysicalInventoryWasChangedByOriginalWork:true,
  noSecondCraftRollOrNewItems:true};
}
function prototypeSource(s,designId,index){
 const d=s.table?.creationDesigns?.records?.[designId];
 if(!d||d.id!==designId||!d.source||
  d.sourceHash!==hash(d.source)||!Array.isArray(d.attempts))
  throw Error('Only a genuinely sourced existing authored physical design can have production evidence');
 const h=d.attempts[index];
 if(!h||!Number.isInteger(h.startMinute)||h.startMinute<0||
  h.finishMinute-h.startMinute!==85||
  typeof h.location!=='string'||!E.LOCATIONS[h.location]||
  JSON.stringify(h.resources)!==JSON.stringify({marsh_reed:2})||
  !Number.isInteger(h.check?.roll)||h.check.roll<1||h.check.roll>20||
  h.check.dc!==12||!Number.isInteger(h.check.margin)||
  typeof h.witnessHash!=='string'||h.witnessHash.length!==64||
  typeof h.checkWitnessHash!=='string'||h.checkWitnessHash.length!==64||
  typeof h.success!=='boolean'||h.success!==(h.check.margin>=0))
  throw Error('A manufactured item cannot be inferred without the genuine original material-consuming design trial');
 const itemId='water_indicator_'+designId,item=s.table?.creationPrototypes?.[itemId];
 if(h.success){
  // A successful individual design has a single existing persistent tool;
  // other unsuccessful attempts are real spent inputs, not free output.
  if(!item||item.origin!==Prototype.ORIGIN||
   item.designId!==designId||item.id!==itemId||
   item.owner!==s.player.name||
   item.sourceHash!==hash(item.source)||
   item.source.prototypeId!==itemId||
   item.source.trialIndex!==index+1||
   item.source.checkWitnessHash!==h.checkWitnessHash||
   d.prototypeId!==itemId)
   throw Error('The original successful assembly is not a real sourced owned tool');
 }else if(d.prototypeId===itemId&&
  item?.source.trialIndex===index+1)
  throw Error('A failed material trial cannot also create the originally successful tool');
 return {origin:ORIGIN,kind:'existing-authored-tool-trial',
  designId,originalIndex:index,originalReceiptHash:hash(h),
  originalDesignSourceHash:d.sourceHash,
  startMinute:h.startMinute,finishMinute:h.finishMinute,
  day:Math.floor(h.startMinute/1440),
  location:h.location,originalWorkWitnessHash:h.witnessHash,
  originalRollWitnessHash:h.checkWitnessHash,
  materialsUsed:{marsh_reed:2},
  physicalOutputs:h.success?{[itemId]:1}:{},
  originalOutcome:h.success?'completed-product':'failed-materials-spent',
  measuredRecoveredByproducts:{},
  noUnobservedWasteCompositionClaimed:true,
  actualPhysicalInventoryWasChangedByOriginalWork:true,
  noSecondCraftRollOrNewItems:true};
}
function derived(s,q){
 if(q?.kind==='existing-field-medicine')
  return fieldSource(s,q.originalIndex,q.originalReceiptHash);
 if(q?.kind==='existing-authored-tool-trial')
  return prototypeSource(s,q.designId,q.originalIndex);
 throw Error('There is no original finished physical work matching this production type');
}
function idFor(q){
 return 'production_'+hash({kind:q.kind,originalIndex:q.originalIndex,
  designId:q.designId||null,receipt:q.originalReceiptHash}).slice(0,32);
}
function verify(s){
 const rows=s.table?.physicalProductionHistory;
 if(rows===undefined)return true; // Honest older saves had no later ledger.
 if(!Array.isArray(rows)||rows.length>10000)return false;
 const seen=new Set();let previous=-1;
 for(const row of rows){
  if(!row||row.origin!==ORIGIN||
   row.id!==idFor(row.source)||
   row.sourceHash!==hash(row.source)||
   row.id!==row.source?.id||
   seen.has(row.id))return false;
  let expectation;
  try{expectation=derived(s,row.source)}catch{return false;}
  expectation.id=idFor(expectation);
  if(JSON.stringify(row.source)!==JSON.stringify(expectation)||
   !Number.isInteger(row.source.finishMinute)||
   row.source.finishMinute<previous)return false;
  for(const [item,quantity] of Object.entries(row.source.materialsUsed||{}))
   if(!Object.hasOwn(E.RESOURCES,item)||!Number.isInteger(quantity)||quantity<1)
    return false;
  const outcome=row.source.originalOutcome;
  if(!['completed-product','failed-materials-spent'].includes(outcome)||
   (outcome==='failed-materials-spent'&&
    Object.keys(row.source.physicalOutputs).length>0))
   return false;
  previous=row.source.finishMinute;seen.add(row.id);
 }
 return true;
}
function record(s,{kind,designId,index}){
 if(!verify(s))throw Error('Existing physically completed production history has been rewritten');
 let q=kind==='field'?fieldSource(s,index):
  kind==='prototype'?prototypeSource(s,designId,index):null;
 if(!q)throw Error('Only a completed original physical work result may be recorded');
 q.id=idFor(q);
 if((s.table?.physicalProductionHistory||[]).some(x=>x.id===q.id))
  throw Error('One original material-consuming work attempt may be recorded only once');
 const row={id:q.id,origin:ORIGIN,source:q,sourceHash:hash(q)};
 s.table||={};s.table.physicalProductionHistory||=[];
 s.table.physicalProductionHistory.push(row);
 if(!verify(s)){
  s.table.physicalProductionHistory.pop();
  throw Error('The source-verifiable material production ledger failed reconciliation');
 }
 return {id:row.id,sourceHash:row.sourceHash,originalOutcome:q.originalOutcome,
  materialsUsed:structuredClone(q.materialsUsed),
  physicalOutputs:structuredClone(q.physicalOutputs),
  noNewMaterialsOrExtraWork:true};
}
function status(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Personal original material production history accepts no fabricated recipes or outside private work');
 if(!verify(s))throw Error('Original physical production evidence is inconsistent');
 return {personallyDocumentedProduction:(s.table?.physicalProductionHistory||[])
  .slice(-50).map(({id,sourceHash,source:q})=>({
   id,sourceHash,day:q.day,worksite:q.location,
   kind:q.kind,originalOutcome:q.originalOutcome,
   consumed:q.materialsUsed,createdOnlyOnActualSuccess:q.physicalOutputs,
   recoveredByproducts:q.measuredRecoveredByproducts,
   unknownByproductsNotInvented:true,
   noCurrentStockOrFutureProfitInferred:true})),
  note:'These are historically witnessed original physical tasks, not offers to craft arbitrary goods. Inputs were actually spent by the original work check. Only previously completed outputs exist. An unsuccessful attempt loses its real inputs; unmeasured waste and automatic wages are not invented.'};
}
module.exports={ORIGIN,verify,record,status};
