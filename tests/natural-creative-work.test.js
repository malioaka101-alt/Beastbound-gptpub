'use strict';
// A genuine authored design and physical tool can be selected by natural
// player intentions. Source checks and exact rolls stay in original modules.
// Disposable saves only; the active Aerin checkpoint never changes.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 H=require('../rules/unified'),Turn=require('../scripts/chat-turn.js');
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-natural-creative-work-')),
 file=Path.join(dir,'campaign.json');
const write=s=>FS.writeFileSync(file,E.exportGame(s)+'\n'),
 read=()=>FS.readFileSync(file,'utf8'),load=()=>E.importGame(read()),
 act=(id,action)=>Turn.execute(file,{id,mode:'act',action});
const title='Common Reed Surface Water Indicator';
const spec=()=>({title,
 purpose:'Help an ordinary ferry worker estimate real accessible nearby water from a hand-built field gauge with no unseen knowledge.',
 medium:'tool',system:'mundane',function:'sense',target:'surface_water',
 magnitude:0,range:'touch',area:'single',duration:'1min',novelty:'variant',
 materials:[{id:'marsh_reed',quantity:2}]});
try{
 // These are genuinely recorded concepts, never player-selected success or
 // a manufactured item created by saying a recipe name.
 const blank=E.newGame({seed:991200,name:'No Design To Invent',background:'fieldworker'});
 write(blank);const empty=read(),rng=load().rngState;
 A.throws(()=>act('fabricate_design_by_name_01','make legendary dragon wings'),
  /No single genuinely recorded design/);
 A.throws(()=>act('fabricate_craft_by_name_01','craft legendary potion'),
  /Unsupported crafting recipe or blueprint/);
 A.throws(()=>act('fabricate_named_id_00001','build design_99999'),
  /No single genuinely recorded design/);
 A.equal(read(),empty);A.equal(load().rngState,rng);
 const glance=act('inspect_empty_designs_0001','inspect designs');
 A.equal(glance.applied,false);A.equal(glance.output.designs.designs.length,0);
 A.equal(read(),empty);

 // Two valid designs may share a human-facing title. Choose the actual ID;
 // never auto-select a favourable precommitted creation die or old work.
 const same=E.newGame({seed:991201,name:'Ambiguous Designs',background:'fieldworker'});
 R.act(same,{system:'creation',operation:'draft',params:spec()});
 R.act(same,{system:'creation',operation:'draft',params:{...spec(),
  purpose:spec().purpose+' A second independent but similarly named arrangement.'}});
 write(same);const ambiguous=read();
 A.throws(()=>act('ambiguous_title_work_01','assemble '+title.toLowerCase()),
  /Several genuinely recorded designs/);
 A.equal(read(),ambiguous);

 let selected=null,failSeen=false;
 for(let n=0;n<110;n++){
  const seed=(991300+Math.imul(n,2654435761))>>>0;
  const s=E.newGame({seed,name:'Truly Authored Prototype Work',
   background:'fieldworker'});
  s.player.attributes.wis=20;s.player.skills.survival.rank=5;
  A.equal(E.dispatch(s,'travel fen').ok,true);
  const d=R.act(s,{system:'creation',operation:'draft',params:spec()});
  A.equal(d.id,'design_1');write(s);
  const initial=read(),current=load().rngState;
  const ideas=act('read_genuine_plans_0001','review my designs');
  A.equal(ideas.applied,false);
  A.equal(ideas.output.designs.designs[0].id,'design_1');
  A.equal(read(),initial);A.equal(load().rngState,current);
  const before=load(),stock=before.player.inventory.marsh_reed;
  const made=act('natural_work_build_0001','build my '+title.toLowerCase());
  A.equal(made.applied,true);
  A.equal(made.output.creation.consumed.marsh_reed,2);
  A.equal(made.output.creation.elapsedMinutes,85);
  A.equal(load().player.inventory.marsh_reed||0,stock-2);
  A.equal(load().world.minutes,before.world.minutes+85);
  A.equal(made.output.creation.check.roll>=1&&made.output.creation.check.roll<=20,true);
  const exact=read(),exactRng=load().rngState;
  A.equal(act('natural_work_build_0001','build my '+title.toLowerCase()).duplicate,true);
  A.equal(read(),exact);A.equal(load().rngState,exactRng);
  if(!made.output.creation.assembled){
   failSeen=true;
   A.equal(load().table.creationDesigns.records.design_1.status,'trial-failed');
   continue;
  }
  const tool=act('inspect_genuine_instruments_01','inspect prototypes');
  A.equal(tool.applied,false);
  A.equal(tool.output.prototypes.prototypes.length,1);
  A.equal(tool.output.prototypes.prototypes[0].status,'unverified');
  const beforeCal=read();
  A.throws(()=>act('premature_use_indicator_01','measure design_1'),
   /successful genuine local calibration/);
  A.equal(read(),beforeCal);
  const calibrated=act('actual_gauge_calibration_01','calibrate design_1');
  A.equal(calibrated.output.creation.elapsedMinutes,15);
  if(calibrated.output.creation.status!=='calibrated')continue;
  // The first authentic Survival roll may still fail for some seeded
  // characters; ignore those as evidence, not as permission to force a roll.
  const prep=act('tool_replacement_survey_0001','survey habitat signs');
  A.equal(prep.output.survey.prepared,true);
  const solved=act('tool_replacement_check_0001','interpret habitat signs');
  if(!solved.output.surveyCheck.success)continue;
  selected={d,calibrated,seed,made};
  break;
 }
 A.ok(failSeen,'Physical construction can fail and consume genuine supplies');
 A.ok(selected,'A genuine built, calibrated design and truthful terrain witness must be possible');
 const physical=load();
 A.equal(physical.table.creationPrototypes.water_indicator_design_1.status,'calibrated');
 const beforeMeasure=read(),oldToolRng=load().rngState;
 const measurement=act('physical_tool_measure_001','measure '+title.toLowerCase());
 A.equal(measurement.applied,true);
 A.equal(measurement.output.creation.prototypeId,'water_indicator_design_1');
 A.equal(measurement.output.creation.elapsedMinutes,8);
 A.ok(['scarce','moderate','abundant','inconclusive']
  .includes(measurement.output.creation.observedCategory));
 A.equal(Object.hasOwn(measurement.output.creation,'actualWaterScore'),false);
 A.notEqual(load().rngState,oldToolRng);
 A.equal(load().player.inventory.marsh_reed||0,0);
 // The only way to replace material is a separate original field survey
 // with its real interpreted evidence and finite ecologically owned stock.
 const noRepair=read();
 A.throws(()=>act('no_spare_reeds_repair_01','repair design_1'),
  /physical field repair needs one actual Marsh Reed/);
 A.equal(read(),noRepair);
 const checkRng=load().rngState;
 const collected=act('actual_replacement_gather_01','gather reeds');
 A.equal(collected.output.harvest.item,'marsh_reed');
 A.equal(collected.output.harvest.quantity,1);
 A.equal(load().rngState,checkRng,'Gathering does not reroll the original terrain interpretation');
 A.equal(load().player.inventory.marsh_reed,1);
 const repairBefore=load(),beforeTime=repairBefore.world.minutes;
 const fixed=act('real_owned_tool_repair_0001','repair water_indicator_design_1');
 A.equal(fixed.applied,true);
 A.equal(fixed.output.creation.materialUsed.marsh_reed,1);
 A.equal(fixed.output.creation.elapsedMinutes,50);
 A.equal(load().world.minutes,beforeTime+50);
 A.equal(load().player.inventory.marsh_reed||0,0);
 A.equal(load().table.creationPrototypes.water_indicator_design_1.repairs.length,1);
 const done=read(),doneRng=load().rngState;
 A.equal(act('real_owned_tool_repair_0001','repair water_indicator_design_1').duplicate,true);
 A.equal(read(),done);A.equal(load().rngState,doneRng);
 const status=act('review_repaired_tool_0001','my instruments');
 A.equal(status.applied,false);A.equal(read(),done);
 A.equal(status.output.prototypes.prototypes[0].id,'water_indicator_design_1');

 // Paper creation concept alone remains powerless. A different known
 // intent is a valid concept but not a supported physical prototype.
 const unsupported=E.newGame({seed:991270,name:'Real Unsupported Scheme',
  background:'fieldworker'});
 A.equal(E.dispatch(unsupported,'travel fen').ok,true);
 R.act(unsupported,{system:'creation',operation:'draft',params:{
  ...spec(),title:'Reed Flood Barrier Concept',function:'ward'}});
 write(unsupported);const unbuilt=read();
 A.throws(()=>act('unsupported_work_adapter_01','build design_1'),
  /No proven physical prototype adapter/);
 A.equal(read(),unbuilt);

 // The same intent pathway reaches an actually owned, source-proven
 // medicinal item without granting a cure for unobserved serious wounds.
 const injured=E.newGame({seed:991400,name:'Known Light Injury'});
 H.ensurePlayer(injured);injured.table.combatants.player.wounds[0]=1;
 write(injured);
 const balmBefore=load(),qty=balmBefore.player.inventory.healing_balm;
 const use=act('owned_balm_use_0001','apply healing balm');
 A.equal(use.output.health.used,'healing_balm');
 A.equal(load().player.inventory.healing_balm||0,qty-1);
 A.equal(load().table.combatants.player.wounds[0],0);
 const afterBalm=read();
 A.equal(act('owned_balm_use_0001','apply healing balm').duplicate,true);
 A.equal(read(),afterBalm);
 A.throws(()=>act('extra_free_wound_0001','use healing balm'),
  /No healing balm in the bag|No Light wound/);
 A.equal(read(),afterBalm);
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('Real recorded creative concepts, physical prototype work, calibration, measurement, repair and Light wound care are playable by natural intent');
