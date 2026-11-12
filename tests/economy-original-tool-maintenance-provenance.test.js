'use strict';
// Foundation #19: maintain an actual already-owned authored instrument,
// through original finite inputs, the one original Crafting roll, and
// append-only source-attested repair witnesses. Never mint a second tool.
// All saved states and supplies here are disposable regression fixtures.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine.js'),R=require('../rules'),
 Prototype=require('../rules/creation-prototype'),
 Production=require('../rules/physical-production-ledger');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const act=(s,operation,params={})=>R.act(s,{system:'creation',operation,params});
const spec=()=>({title:'Original Hand-Crafted Wetland Gauge',
 purpose:'Build a modest physically researched sensor for local wetland depth conditions, without claiming remote or magical knowledge.',
 medium:'tool',system:'mundane',function:'sense',target:'surface_water',
 magnitude:0,range:'touch',area:'single',duration:'1min',novelty:'variant',
 materials:[{id:'marsh_reed',quantity:2}]});
function sourceBuilt(){
 for(let i=0;i<90;i++){
  const seed=(771101+Math.imul(i,2654435761))>>>0;
  const s=E.newGame({name:'Disposable Tool Maintenance',seed,
   background:'fieldworker',path:'undecided'});
  A.equal(E.dispatch(s,'travel fen').ok,true);
  s.player.inventory.marsh_reed=16; // Test-only finite source stock.
  const d=act(s,'draft',spec());
  const built=act(s,'prototype',{id:d.id});
  if(built.assembled)return {s,id:d.id,tool:built.prototypeId};
 }
 throw Error('No honestly assembled test instrument was found');
}
const {s,id,tool}=sourceBuilt();
const item=s.table.creationPrototypes[tool];
A.equal(item.repairs,undefined);
A.equal(Production.verify(s),true);
const originalProduct=s.table.physicalProductionHistory[0].sourceHash;
const initialMoney=structuredClone(s.player.money);
const initialCount=Object.keys(s.table.creationPrototypes).length;
const calibration=act(s,'calibrate',{id});
A.equal(calibration.elapsedMinutes,15);
A.ok(item.durability<5,'a real calibration consumes physical wear');
const beforeWork=E.exportGame(s),beforeTime=s.world.minutes,
 beforeStamina=s.player.stamina,beforeReeds=s.player.inventory.marsh_reed,
 beforeRng=s.rngState,beforeDurability=item.durability,
 beforeStatus=item.status;
const result=act(s,'repair',{id});
A.equal(result.elapsedMinutes,50);
A.equal(result.materialUsed.marsh_reed,1);
A.equal(s.player.inventory.marsh_reed,beforeReeds-1);
A.equal(s.player.stamina,beforeStamina-2);
A.equal(s.world.minutes,beforeTime+50);
A.notEqual(s.rngState,beforeRng,'only original real work resolution rolled');
A.equal(item.repairs.length,1);
const receipt=item.repairs[0];
A.equal(receipt.success,result.repaired);
A.equal(receipt.toolId,tool);
A.equal(receipt.fromMinute,beforeTime);
A.equal(receipt.finishMinute,s.world.minutes);
A.equal(receipt.durabilityBefore,beforeDurability);
A.equal(receipt.statusBefore,beforeStatus);
A.equal(receipt.durabilityAfter,result.durabilityRemaining);
A.equal(receipt.durabilityAfter,result.repaired?
 Math.min(5,beforeDurability+2):beforeDurability);
A.equal(receipt.statusAfter,result.repaired?'unverified':beforeStatus);
A.equal(receipt.sourceHash,hash(Object.fromEntries(
 Object.entries(receipt).filter(([key])=>key!=='sourceHash'))));
A.equal(hash(receipt.originalWorkbench),receipt.workHash);
A.equal(hash(receipt.originalRoll),receipt.rollHash);
A.equal(receipt.originalWorkbench.details.prototypeId,tool);
A.equal(receipt.originalRoll.details.success,receipt.success);
A.equal(receipt.noNewItemOrGrade,true);
A.equal(Prototype._debug.genuineRepair(receipt,tool),true);
A.equal(s.table.physicalProductionHistory[0].sourceHash,originalProduct);
A.equal(Production.verify(s),true);
A.equal(Object.keys(s.table.creationPrototypes).length,initialCount);
A.deepEqual(s.player.money,initialMoney);
const saved=E.exportGame(s),copy=E.importGame(saved);
A.equal(E.exportGame(copy),saved);
A.deepEqual(copy.table.creationPrototypes[tool].repairs,item.repairs);
const rng=s.rngState;
const overview=act(s,'prototypeStatus');
A.equal(overview.prototypes[0].repairHistory.length,1);
A.equal(overview.prototypes[0].repairHistory[0].originalSourceVerified,true);
A.equal(overview.prototypes[0].repairHistory[0].sourceHash,receipt.sourceHash);
A.equal(E.exportGame(s),saved,'observing maintenance never executes another repair');
A.equal(s.rngState,rng);
// Re-sealing altered outcomes does not defeat the original physical witness.
const intact=structuredClone(receipt);
receipt.durabilityAfter=5;
receipt.sourceHash=hash(Object.fromEntries(
 Object.entries(receipt).filter(([key])=>key!=='sourceHash')));
A.throws(()=>act(s,'prototypeStatus'),/source-verified owned physical invention/);
item.repairs[0]=structuredClone(intact);
A.equal(E.exportGame(s),saved);
item.repairs[0].originalRoll.details.roll=99;
item.repairs[0].sourceHash=hash(Object.fromEntries(
 Object.entries(item.repairs[0]).filter(([key])=>key!=='sourceHash')));
A.throws(()=>act(s,'prototypeStatus'),/source-verified owned physical invention/);
item.repairs[0]=intact;
A.equal(E.exportGame(s),saved);
// Genuine pre-upgrade records retain their original status, are not
// retrospectively given missing mechanical proof or invented old rolls.
const legacy=E.importGame(saved);
const older=legacy.table.creationPrototypes[tool].repairs[0];
legacy.table.creationPrototypes[tool].repairs=[{
 fromMinute:older.fromMinute,finishMinute:older.finishMinute,
 location:older.location,workHash:older.workHash,
 rollHash:older.rollHash,success:older.success,
 replacement:{marsh_reed:1}}];
const history=act(legacy,'prototypeStatus').prototypes[0].repairHistory;
A.equal(history.length,1);
A.equal(history[0].originalSourceVerified,false);
A.equal(Production.verify(legacy),true);
A.notEqual(E.exportGame(s),beforeWork,'honest time and repair changed only real state');
console.log('Existing GM-authored tool can wear and be repaired using genuine original work; permanent provenance survives save/reload, tampering is rejected, and legacy repairs are not falsely certified PASS');
