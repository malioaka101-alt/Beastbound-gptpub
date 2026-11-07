'use strict';
// A single internal physical-work executor serves distinct *real* activities:
// common medicine in either authored clean venue, invention assembly and
// repairing an owned worn tool. Disposable saves only; no active Aerin edits.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 Work=require('../rules/physical-work'),Turn=require('../scripts/chat-turn.js');
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-cross-craft-work-')),
 file=Path.join(dir,'save.json');
const write=s=>FS.writeFileSync(file,E.exportGame(s)+'\n');
const read=()=>FS.readFileSync(file,'utf8'),load=()=>E.importGame(read());
const act=(id,action)=>Turn.execute(file,{id,mode:'act',action});
const spec=()=>({
 title:'Reed Gauge for Ordinary Surface Water',
 purpose:'Help ordinary ferry crews estimate accessible nearby surface water by a narrow physical reed indicator, without magical scanning.',
 medium:'tool',system:'mundane',function:'sense',target:'surface_water',
 magnitude:0,range:'touch',area:'single',duration:'1min',novelty:'variant',
 materials:[{id:'marsh_reed',quantity:2}]
});
try{
 const s=E.newGame({seed:991915,name:'Open Clean Clinic Craft Journey',
  background:'fieldworker'});
 s.player.attributes.wis=20;s.player.skills.survival.rank=5;
 s.player.inventory.marsh_reed=0; // test genuinely gathers what the craft uses
 write(s);
 const quote=act('infirmary_supplier_quote_001','ask orrin about supplies');
 A.equal(quote.output.gear.quoted,true);
 const bought=act('infirmary_supplier_purchase_01','buy clean rations');
 A.equal(bought.output.gear.purchased,true);
 A.equal(load().player.inventory.clean_rations,3);
 A.equal(act('infirmary_travel_fen_0001','travel fen').ok,true);
 const witness=act('infirmary_habitat_survey_001','survey habitat signs');
 A.equal(witness.output.survey.prepared,true);
 const interpretation=act('infirmary_original_survival_01','interpret habitat signs');
 A.equal(interpretation.output.surveyCheck.success,true);
 const rng=load().rngState;
 const harvestOne=act('infirmary_reed_gather_0001','gather reeds');
 const harvestTwo=act('infirmary_reed_gather_0002','gather reeds');
 A.equal(harvestOne.output.harvest.item,'marsh_reed');
 A.equal(harvestTwo.output.harvest.item,'marsh_reed');
 A.equal(harvestTwo.output.harvest.attemptNumber,2);
 A.equal(load().player.inventory.marsh_reed,2);
 A.equal(load().rngState,rng);
 A.equal(act('infirmary_return_crossing_1','travel crossing').ok,true);
 const before=load(),minute=before.world.minutes,
  oldFood=before.player.inventory.clean_rations,
  oldBalm=before.player.inventory.healing_balm||0;
 const make=act('infirmary_make_actual_balm_001','craft field poultice');
 A.equal(make.applied,true);
 A.equal(make.output.craft.worksite,'Morrowfen Crossing');
 A.equal(make.output.craft.usedMaterials.marsh_reed,2);
 A.equal(make.output.craft.usedMaterials.clean_rations,1);
 A.equal(make.output.craft.check.success,make.output.craft.succeeded);
 const after=load();
 A.equal(after.player.inventory.marsh_reed||0,0);
 A.equal(after.player.inventory.clean_rations,oldFood-1);
 A.equal(after.player.inventory.healing_balm||0,
  oldBalm+(make.output.craft.succeeded?1:0));
 A.equal(after.world.minutes,minute+70);
 A.equal(after.table.fieldCraftAttempts.at(-1).site,'crossing');
 A.equal(after.table.fieldCraftAttempts.at(-1).originalRoll.type,'roll');
 A.equal(after.table.fieldCraftAttempts.at(-1).originalWorkbench.type,'world');
 A.equal(after.table.materialGatherAttempts.length,2);
 const saved=read(),draw=load().rngState;
 const replay=act('infirmary_make_actual_balm_001','craft field poultice');
 A.equal(replay.duplicate,true);A.equal(replay.recovered,true);
 A.equal(read(),saved);A.equal(load().rngState,draw);

 // A physically different original design uses the SAME real input work,
 // check evidence and stamina/time conservation without becoming a recipe
 // for freely generated magic or a manufactured inventory weapon.
 let found;
 for(let attempt=0;attempt<80;attempt++){
  const seed=(88400+Math.imul(attempt,2654435761))>>>0;
  const trial=E.newGame({seed,name:'Real Field Invention Trial',
   background:'fieldworker'});
  A.equal(E.dispatch(trial,'travel fen').ok,true);
  const d=R.act(trial,{system:'creation',operation:'draft',params:spec()});
  const beforePrototype=trial.world.minutes,stamina=trial.player.stamina,
   materials=trial.player.inventory.marsh_reed;
  const assembled=R.act(trial,{system:'creation',operation:'prototype',
   params:{id:d.id}});
  A.equal(assembled.consumed.marsh_reed,2);
  A.equal(trial.player.inventory.marsh_reed||0,materials-2);
  A.equal(trial.player.stamina,stamina-4);
  A.equal(trial.world.minutes,beforePrototype+85);
  A.equal(assembled.check.roll>=1&&assembled.check.roll<=20,true);
  if(assembled.assembled){found={trial,d,assembled};break;}
 }
 A.ok(found,'Actual novice invention assembly must be able to succeed without universal tuition');
 const {trial,d,assembled}=found;
 A.equal(trial.player.inventory.marsh_reed||0,0);
 A.equal(trial.table.creationPrototypes[assembled.prototypeId].durability,5);
 const reading=R.act(trial,{system:'creation',operation:'calibrate',
  params:{id:d.id}});
 A.equal(reading.durabilityRemaining,4);
 const noResource=E.exportGame(trial),originalRng=trial.rngState;
 A.throws(()=>R.act(trial,{system:'creation',operation:'repair',
   params:{id:d.id}}),/physical field repair needs one actual Marsh Reed/);
 A.equal(E.exportGame(trial),noResource);
 A.equal(trial.rngState,originalRng);
 trial.player.attributes.wis=20;trial.player.skills.survival.rank=5;
 const survey=R.act(trial,{system:'world',operation:'habitatSurvey',params:{}});
 const solved=R.act(trial,{system:'core',operation:'check',
  params:{checkId:survey.checkId}}).check;
 A.equal(solved.success,true);
 const harvested=R.act(trial,{system:'world',operation:'gatherMaterial',
  params:{item:'marsh_reed',checkId:survey.checkId}});
 A.equal(harvested.quantity,1);
 A.equal(trial.player.inventory.marsh_reed,1);
 const beforeRepair=trial.world.minutes,stam=trial.player.stamina,
  origRng=trial.rngState;
 const repair=R.act(trial,{system:'creation',operation:'repair',
  params:{id:d.id}});
 A.equal(repair.materialUsed.marsh_reed,1);
 A.equal(trial.player.inventory.marsh_reed||0,0);
 A.equal(repair.elapsedMinutes,50);A.equal(trial.world.minutes,beforeRepair+50);
 A.equal(trial.player.stamina,stam-2);
 A.notEqual(trial.rngState,origRng);
 A.equal(trial.table.creationPrototypes[assembled.prototypeId].repairs.length,1);
 A.equal(trial.table.creationPrototypes[assembled.prototypeId].repairs[0].success,repair.repaired);
 A.equal(trial.player.arcane.circles,0);
 A.equal(trial.player.partnerIds.length,0);

 // Only the authenticated activity can call this internal executor: no
 // player-facing raw craft/result path and no arbitrary material mint.
 const forbidden=E.exportGame(trial);
 A.throws(()=>R.act(trial,{system:'craft',operation:'perform',
  params:{inputs:{ironbloom:100},success:true}}),/Unsupported rule operation/);
 A.equal(E.exportGame(trial),forbidden);
 const state=E.newGame({seed:88347,name:'Material Preflight Fixture',
  background:'fieldworker'});
 const source=()=>({type:'world',
  text:'One bounded test of prepared materials with no real-world crafted output.',
  details:{origin:'test-preflight-no-product'}});
 const valid=()=>({inputs:{marsh_reed:1},stamina:2,
  minutes:30,dc:12,modifier:2,
  label:'Prepare a bounded common handwork demonstration',event:source()});
 const initial=E.exportGame(state);
 A.throws(()=>Work.plan(state,{...valid(),dc:1}),/source-established Crafting difficulty/);
 A.throws(()=>Work.plan(state,{...valid(),inputs:{marsh_reed:99}}),/Insufficient genuinely owned/);
 A.equal(E.exportGame(state),initial);
 const planned=Work.plan(state,valid());
 A.equal(E.exportGame(state),initial,'Planning must never spend any resource');
 state.player.inventory.marsh_reed=0;
 const stale=E.exportGame(state),staleRng=state.rngState;
 A.throws(()=>Work.perform(state,planned),/Saved material stock changed after its original verification/);
 A.equal(E.exportGame(state),stale);
 A.equal(state.rngState,staleRng,'An invalid plan must not roll');
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('One real physical work process handles true clinic medicine, invention assembly and field repair with honest rolls');
