'use strict';
// #19: actual original physical work, not a recipe-picker or product mint.
// One scarce-medicine process and one personally invented mechanism are
// source-sealed with paid inputs, original RNG, failure losses and physical
// output only on actual success. All fixtures are disposable.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),P=require('../rules/physical-production-ledger'),
 Work=require('../rules/physical-work'),
 Crypto=require('node:crypto');
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const report=s=>R.act(s,{system:'craft',operation:'productionHistory',params:{}});
const craft=s=>R.act(s,{system:'craft',operation:'fieldPoultice',params:{}});
const create=(s,operation,params)=>R.act(s,{system:'creation',operation,params});
const spec=()=>({title:'Original Wetland Reed Depth Gauge',
 purpose:'Make an independently researched small physical tool to estimate rough accessible surface water for ferry workers without magic or invisible information.',
 medium:'tool',system:'mundane',function:'sense',target:'surface_water',
 magnitude:0,range:'touch',area:'single',duration:'1min',novelty:'variant',
 materials:[{id:'marsh_reed',quantity:2}]});
function fresh(seed){return E.newGame({name:'Disposable Source Production',seed,
 background:'fieldworker',path:'undecided'});}
{
 const s=fresh(993311),old=E.exportGame(s),oldRng=s.rngState;
 const initial=report(s);
 A.equal(initial.personallyDocumentedProduction.length,0);
 A.equal(E.exportGame(s),old);
 A.equal(s.rngState,oldRng);
 A.throws(()=>R.act(s,{system:'craft',operation:'productionHistory',
  params:{item:'healing_balm',grant:500}}),/accepts no fabricated/);
 A.equal(E.exportGame(s),old);
 A.equal(P.verify(s),true);
}
{
 let won=false,lost=false;
 for(let i=0;i<90;i++){
  const seed=(993321+Math.imul(i,2654435761))>>>0;
  const s=fresh(seed),previous={...s.player.inventory},
   minute=s.world.minutes,stamina=s.player.stamina;
  const result=craft(s);
  const rows=report(s).personallyDocumentedProduction;
  A.equal(rows.length,1);
  const q=rows[0],orig=s.table.fieldCraftAttempts[0];
  A.equal(q.kind,'existing-field-medicine');
  A.equal(q.originalOutcome,result.succeeded?
   'completed-product':'failed-materials-spent');
  A.deepEqual(q.consumed,{marsh_reed:2,clean_rations:1});
  A.deepEqual(q.createdOnlyOnActualSuccess,
   result.succeeded?{healing_balm:1}:{});
  A.deepEqual(q.recoveredByproducts,{});
  A.equal(q.unknownByproductsNotInvented,true);
  A.equal(result.noExtraRoll,true);
  A.equal(s.world.minutes,minute+70);
  A.equal(s.player.stamina,stamina-3);
  A.equal(s.player.inventory.marsh_reed||0,previous.marsh_reed-2);
  A.equal(s.player.inventory.clean_rations||0,previous.clean_rations-1);
  A.equal(s.player.inventory.healing_balm||0,
   (previous.healing_balm||0)+(result.succeeded?1:0));
  A.equal(Work.verifyReceipt({
   originalWorkbench:orig.originalWorkbench,originalRoll:orig.originalRoll,
   witnessHash:orig.witnessHash,rollHash:orig.rollHash,
   inputs:orig.usedMaterials,inputKey:'inputs',
   startedAtMinute:orig.preparedMinute,finishedAtMinute:orig.finishedMinute,
   minutes:70
  }),true);
  const displaced=structuredClone(orig.originalWorkbench);
  displaced.time='Day 999, 00:00';
  const displacedHash=digest(displaced);
  A.equal(Work.verifyReceipt({
   originalWorkbench:displaced,originalRoll:{
    ...orig.originalRoll,time:displaced.time
   },
   witnessHash:displacedHash,
   rollHash:digest({...orig.originalRoll,time:displaced.time}),
   inputs:orig.usedMaterials,inputKey:'inputs',
   startedAtMinute:orig.preparedMinute,finishedAtMinute:orig.finishedMinute,
   minutes:70
  }),false,'resealed original events cannot be moved to a different world minute');
  const fabricated=structuredClone(orig.originalRoll);
  fabricated.details.modifier++;
  A.equal(Work.verifyReceipt({
   originalWorkbench:orig.originalWorkbench,originalRoll:fabricated,
   witnessHash:orig.witnessHash,rollHash:digest(fabricated),
   inputs:orig.usedMaterials,inputKey:'inputs',
   startedAtMinute:orig.preparedMinute,finishedAtMinute:orig.finishedMinute,
   minutes:70
  }),false,'resealing an impossible check does not make its roll arithmetic true');
  A.equal(orig.rollHash,digest(orig.originalRoll));
  A.equal(orig.witnessHash,digest(orig.originalWorkbench));
  A.equal(P.verify(s),true);
  const saved=E.exportGame(s),copy=E.importGame(saved);
  A.equal(E.exportGame(copy),saved);
  A.equal(P.verify(copy),true);
  A.equal(report(copy).personallyDocumentedProduction[0].sourceHash,q.sourceHash);
  if(result.succeeded)won=true;else lost=true;
  if(won&&lost)break;
 }
 A.equal(won,true);
 A.equal(lost,true);
}
{
 // Genuine new design and original physical assembly work share the same
 // audited material ledger but NEVER turn a concept into automatic output.
 let assembled=null,spent=null;
 for(let i=0;i<150;i++){
  const seed=(993510+Math.imul(i,2654435761))>>>0;
  const s=fresh(seed);
  A.equal(E.dispatch(s,'travel fen').ok,true);
  s.player.inventory.marsh_reed=6; // disposable test supplies only
  const design=create(s,'draft',spec());
  A.equal(design.id,'design_1');
  const before=s.player.inventory.marsh_reed,
   minute=s.world.minutes,rng=s.rngState;
  const outcome=create(s,'prototype',{id:design.id});
  A.equal(s.world.minutes,minute+85);
  A.equal(s.player.inventory.marsh_reed,before-2);
  A.notEqual(s.rngState,rng,'exactly the original physical work check rolls');
  A.equal(outcome.consumed.marsh_reed,2);
  const originalTrial=s.table.creationDesigns.records[design.id].attempts.at(-1);
  A.equal(Work.verifyReceipt({
   originalWorkbench:originalTrial.originalWorkbench,
   originalRoll:originalTrial.originalRoll,
   witnessHash:originalTrial.witnessHash,
   rollHash:originalTrial.checkWitnessHash,
   inputs:originalTrial.resources,inputKey:'input',
   startedAtMinute:originalTrial.startMinute,
   finishedAtMinute:originalTrial.finishMinute,minutes:85
  }),true,'newly completed original builds retain their true common witnesses');
  const falseRoll=structuredClone(originalTrial.originalRoll);
  falseRoll.details.total++;
  A.equal(Work.verifyReceipt({
   originalWorkbench:originalTrial.originalWorkbench,
   originalRoll:falseRoll,witnessHash:originalTrial.witnessHash,
   rollHash:digest(falseRoll),inputs:originalTrial.resources,inputKey:'input',
   startedAtMinute:originalTrial.startMinute,
   finishedAtMinute:originalTrial.finishMinute,minutes:85
  }),false);
  const reportRows=report(s).personallyDocumentedProduction;
  A.equal(reportRows.length,1);
  A.equal(reportRows[0].kind,'existing-authored-tool-trial');
  A.deepEqual(reportRows[0].consumed,{marsh_reed:2});
  A.deepEqual(reportRows[0].createdOnlyOnActualSuccess,
   outcome.assembled?{'water_indicator_design_1':1}:{});
  A.equal(reportRows[0].originalOutcome,outcome.assembled?
   'completed-product':'failed-materials-spent');
  A.equal(P.verify(s),true);
  const snapshot=E.exportGame(s);
  A.equal(P.verify(E.importGame(snapshot)),true);
  A.equal(E.exportGame(s),snapshot,'readonly report never modifies original work');
  if(outcome.assembled&&!assembled)assembled={s,design};
  if(!outcome.assembled&&!spent)spent={s,design};
  if(assembled&&spent)break;
 }
 A.ok(assembled,'a real researched tool can be constructed successfully');
 A.ok(spent,'failed original prototype trials spend real ingredients');
 const s=spent.s;
 s.player.inventory.marsh_reed=6; // synthetic second try only
 const before=s.table.physicalProductionHistory[0].sourceHash;
 const more=create(s,'prototype',{id:spent.design.id});
 A.equal(s.table.physicalProductionHistory.length,2);
 A.equal(P.verify(s),true);
 A.equal(s.table.physicalProductionHistory[0].sourceHash,before);
 A.equal(s.table.creationDesigns.records.design_1.attempts.length,2);
 A.equal(more.consumed.marsh_reed,2);
 const saved=E.exportGame(s),copy=E.importGame(saved);
 A.equal(E.exportGame(copy),saved);
 A.equal(P.verify(copy),true);
}
{
 // Resealing the newest journal can never fabricate a successful output.
 const s=fresh(993700);craft(s);
 A.equal(P.verify(s),true);
 const saved=E.exportGame(s);
 const row=s.table.physicalProductionHistory[0],old=structuredClone(row);
 row.source.physicalOutputs={healing_balm:1000};
 row.sourceHash=digest(row.source);
 A.equal(P.verify(s),false);
 const after=E.exportGame(s);
 A.throws(()=>craft(s),/production work history needs reconciliation/);
 A.equal(E.exportGame(s),after,'invalid historic production cannot spend new materials or roll');
 s.table.physicalProductionHistory[0]=old;
 A.equal(P.verify(s),true);
 A.equal(E.exportGame(s),saved);
 // The original material source itself is also independently checked.
 s.table.fieldCraftAttempts[0].usedMaterials.marsh_reed=999;
 A.equal(P.verify(s),false);
}
{
 // A real legacy checkpoint kept the first day's authentic field-craft
 // witness while deleting the newer per-attempt array. That source is
 // still proof: do not invalidate it or invent the historical dice anew.
 const s=fresh(993701);
 s.player.inventory.marsh_reed=4;
 s.player.inventory.clean_rations=2; // disposable physical supplies
 const first=craft(s),original=E.exportGame(s),
  oldHash=s.table.physicalProductionHistory[0].sourceHash;
 A.equal(P.verify(s),true);
 delete s.table.fieldCraftAttempts;
 A.equal(P.verify(s),true,
  'authenticated legacy daily-first-attempt proof still backs its original production');
 const second=craft(s);
 A.equal(P.verify(s),true);
 A.equal(s.table.fieldCraftAttempts.length,1,
  'the newer modern list honestly contains only this second attempt');
 A.equal(s.table.physicalProductionHistory.length,2);
 A.equal(s.table.physicalProductionHistory[0].sourceHash,oldHash);
 A.notEqual(s.table.physicalProductionHistory[1].sourceHash,oldHash);
 A.equal(second.attemptNumberToday,2);
 const reloaded=E.importGame(E.exportGame(s));
 A.equal(P.verify(reloaded),true);
 A.equal(report(reloaded).personallyDocumentedProduction.length,2);
 A.equal(first.noExtraRoll,true);
 A.notEqual(E.exportGame(s),original,'second separate attempt actually spent materials');
}
console.log('Source-backed #19 historical production conserves genuine field-medicine and individually designed tool inputs; original failures consume stock, no output on failure, saved history survives, no replay/double-award and forged production is rejected PASS');
