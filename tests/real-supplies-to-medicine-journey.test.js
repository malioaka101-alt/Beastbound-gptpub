'use strict';
// Finish Line A: authentic local merchant -> purchased rations -> witnessed
// fen survey -> independent reed-gathering periods -> original fixed medicine.
// These are disposable test saves, NEVER live Aerin progress.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-reeds-to-medicine-'));
const file=Path.join(dir,'save.json');
const write=s=>FS.writeFileSync(file,E.exportGame(s)+'\n');
const read=()=>FS.readFileSync(file,'utf8');
const load=()=>E.importGame(read());
const act=(id,action)=>Turn.execute(file,{id,mode:'act',action});
try{
 const s=E.newGame({seed:991714,name:'Authentic Wetland Medicine Journey',background:'fieldworker'});
 // Exceptional real skill in this disposable fixture; no claimed chosen die.
 s.player.attributes.wis=30;
 s.player.skills.survival.rank=5;
 s.player.inventory.marsh_reed=0;
 write(s);
 const began=read();
 A.throws(()=>act('no_free_common_reed_0001','harvest reeds'),
  /Common marsh reeds grow in the recorded wetland/);
 A.equal(read(),began);
 const quote=act('buying_original_orrin_0001','ask orrin about supplies');
 A.equal(quote.output.gear.seller,E.NPCS.otto.name);
 A.equal(quote.output.gear.quoted,true);
 const buy=act('buying_local_rations_0001','buy clean rations');
 A.equal(buy.output.gear.purchased,true);
 A.equal(buy.output.gear.paidScales,quote.output.gear.priceScales);
 A.equal(load().player.coins,85-quote.output.gear.priceScales/100);
 A.equal(load().player.inventory.clean_rations,3);
 const physical=load().table.realm.localProvisioner.stock;
 A.equal(physical,quote.output.gear.stock-1);
 A.equal(act('travel_actual_fen_0001','travel fen').ok,true);
 A.equal(load().world.location,'fen');
 const seen=act('fen_original_observation_0001','inspect habitat signs');
 A.equal(seen.output.survey.prepared,true);
 const checkId=seen.output.survey.checkId;
 const interpretation=act('fen_original_check_0001','interpret habitat signs');
 A.equal(interpretation.output.surveyCheck.verifiedSceneCheck,checkId);
 A.equal(interpretation.output.surveyCheck.success,true);
 const before=load(),rng=before.rngState,originalRoll=interpretation.output.surveyCheck.roll;
 A.equal(before.player.inventory.marsh_reed,0);
 const first=act('fen_original_harvest_0001','gather reeds');
 A.equal(first.output.harvest.checkId,checkId);
 A.equal(first.output.harvest.attemptNumber,1);
 A.equal(first.output.harvest.originalSurvivalRoll,originalRoll);
 A.equal(load().rngState,rng);
 const firstSave=read(),firstRecord=load().table.fenReedHarvests[Math.floor(before.world.minutes/1440)];
 const replay=act('fen_original_harvest_0001','gather reeds');
 A.equal(replay.duplicate,true);A.equal(replay.recovered,true);
 A.deepEqual(replay.output,first.output);
 A.equal(read(),firstSave);
 const second=act('fen_second_real_harvest_0001','gather reeds');
 A.equal(second.applied,true);
 A.equal(second.output.harvest.attemptNumber,2);
 A.equal(second.output.harvest.originalSurvivalRoll,originalRoll);
 const gathered=load();
 A.equal(gathered.player.inventory.marsh_reed,2);
 A.equal(gathered.rngState,rng,'Only the original Survival check consumes player RNG');
 A.equal(gathered.world.fenPressure,before.world.fenPressure+2);
 A.equal(gathered.world.minutes,before.world.minutes+90);
 A.equal(gathered.player.stamina,before.player.stamina-8);
 A.deepEqual(gathered.table.fenReedHarvests[Math.floor(before.world.minutes/1440)],firstRecord,
  'No later attempt may overwrite the historical first harvest');
 A.equal(gathered.table.fenReedHarvestAttempts.length,2);
 A.equal(gathered.table.habitatSurveyFindings[checkId].harvestCount,2);
 const notes=act('fen_witnessed_harvest_notes_01','field notes');
 A.equal(notes.applied,false);
 A.equal(notes.output.findings.at(-1).harvestCount,2);
 const held=read();A.equal(read(),held);
 A.equal(act('leave_real_fen_0001','travel crossing').ok,true);
 A.equal(act('reach_real_laboratory_0001','travel academy').ok,true);
 A.equal(load().world.location,'academy');
 const reagents=load().player.inventory,startingBalm=reagents.healing_balm||0;
 const craft=act('genuine_common_poultice_001','craft field poultice');
 A.equal(craft.applied,true);
 A.equal(craft.output.craft.usedMaterials.marsh_reed,2);
 A.equal(craft.output.craft.usedMaterials.clean_rations,1);
 A.ok(craft.output.craft.check.roll>=1&&craft.output.craft.check.roll<=20);
 A.equal(craft.output.craft.check.success,craft.output.craft.succeeded);
 const final=load();
 A.equal(final.player.inventory.marsh_reed||0,0);
 A.equal(final.player.inventory.clean_rations,2);
 A.equal(final.player.inventory.healing_balm||0,startingBalm+(craft.output.craft.succeeded?1:0));
 A.equal(final.table.fenReedHarvestAttempts.length,2);
 A.equal(final.table.fieldCraftAttempts.length,1);
 A.equal(final.table.realm.localProvisioner.stock,physical,
  'The player uses owned rations; they do not refund or create merchant stock');
 const finished=read();
 A.equal(act('genuine_common_poultice_001','craft field poultice').duplicate,true);
 A.equal(read(),finished);

 // Legacy saves with a first-of-day witnessed receipt remain able to gather
 // again under real material constraints, without falsifying the old first.
 const ancient=E.newGame({seed:991715,name:'Older Reed History Fixture'});
 A.equal(E.dispatch(ancient,'travel fen').ok,true);
 ancient.player.attributes.wis=30;
 ancient.player.skills.survival.rank=5;
 const prepare=R.act(ancient,{system:'world',operation:'habitatSurvey',params:{}});
 const original=R.act(ancient,{system:'core',operation:'check',
  params:{checkId:prepare.checkId}}).check;
 A.equal(original.success,true);
 R.act(ancient,{system:'world',operation:'harvestReeds',params:{checkId:prepare.checkId}});
 const historical=JSON.stringify(ancient.table.fenReedHarvests);
 delete ancient.table.fenReedHarvestAttempts;
 delete ancient.table.habitatSurveyFindings[prepare.checkId].harvestCount;
 const continued=R.act(ancient,{system:'world',operation:'harvestReeds',
  params:{checkId:prepare.checkId}});
 A.equal(continued.attemptNumber,2);
 A.equal(JSON.stringify(ancient.table.fenReedHarvests),historical);
 A.equal(ancient.table.fenReedHarvestAttempts.length,1);

 // No resource duplication from a fabricated used observation with no old
 // source receipt; refusal consumes neither real inventory nor RNG.
 const falseLedger=E.newGame({seed:991716,name:'Unproven Historic Harvest'});
 A.equal(E.dispatch(falseLedger,'travel fen').ok,true);
 falseLedger.player.attributes.wis=30;
 falseLedger.player.skills.survival.rank=5;
 const witness=R.act(falseLedger,{system:'world',operation:'habitatSurvey',params:{}});
 R.act(falseLedger,{system:'core',operation:'check',params:{checkId:witness.checkId}});
 falseLedger.table.habitatSurveyFindings[witness.checkId].harvested=true;
 const untouched=E.exportGame(falseLedger),untouchedRng=falseLedger.rngState;
 A.throws(()=>R.act(falseLedger,{system:'world',operation:'harvestReeds',
  params:{checkId:witness.checkId}}),/Original first reed harvest record is missing/);
 A.equal(E.exportGame(falseLedger),untouched);
 A.equal(falseLedger.rngState,untouchedRng);
} finally {FS.rmSync(dir,{recursive:true,force:true});}
console.log('Verified purchased food, repeated ecologically constrained field gathering and real medicine craft');
