'use strict';
// All transactions below use disposable synthetic saves. Real campaign
// inventories, world pressures and prior roll outcomes are never modified.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
function start(seed=41313){
 const s=E.newGame({name:'Sustainable Foraging Fixture',seed,path:'undecided'});
 A.equal(E.dispatch(s,'travel fen').ok,true);
 // A known highly trained synthetic fieldworker establishes a successful
 // ordinary check even on a natural 1 (no forced reroll or chosen DC).
 s.player.attributes.wis=30;
 s.player.skills.survival.rank=5;
 return s;
}
const prepare=s=>R.act(s,{system:'world',operation:'habitatSurvey',params:{}});
const check=(s,id)=>R.act(s,{system:'core',operation:'check',params:{checkId:id}}).check;
const gather=(s,p)=>R.act(s,{system:'world',operation:'harvestReeds',params:p});
{
 const s=start(),initial=E.exportGame(s),rng=s.rngState;
 for(const p of [{}, {quantity:100,checkId:'fake'}, {item:'moss_crystal',checkId:'fake'}])
  A.throws(()=>gather(s,p),/only a previously successful witnessed checkId/);
 A.throws(()=>gather(s,{checkId:'fake'}),/recent successful authentic fen survey/);
 A.equal(E.exportGame(s),initial);A.equal(s.rngState,rng);
 const prep=prepare(s);
 const id=prep.checkId,roll=check(s,id);
 A.equal(roll.success,true);
 const before=s.world.minutes,stamina=s.player.stamina,pressure=s.world.fenPressure;
 const beforeRng=s.rngState,reed=s.player.inventory.marsh_reed??0;
 const result=gather(s,{checkId:id});
 A.equal(result.quantity,1);A.equal(result.item,'marsh_reed');
 A.equal(result.harvestKind,'witnessed-common-wetland-flora');
 A.equal(result.rareResourcesAwarded,0);
 A.equal(result.elapsedMinutes,45);A.equal(result.staminaSpent,4);
 A.equal(s.world.minutes,before+45);
 A.equal(s.player.stamina,stamina-4);
 A.equal(s.player.inventory.marsh_reed,reed+1);
 A.equal(s.world.fenPressure,pressure+1);
 A.equal(s.rngState,beforeRng); // Do not reroll for resource quantities
 A.equal(s.player.inventory.moss_crystal,undefined);
 A.equal(s.player.inventory.sun_shard,undefined);
 A.equal(s.table.habitatSurveyFindings[id].harvested,true);
 A.equal(s.table.fenReedHarvests[Math.floor(before/1440)].checkId,id);
 const originalFirst=JSON.stringify(s.table.fenReedHarvests[Math.floor(before/1440)]);
 const second=gather(s,{checkId:id});
 A.equal(second.quantity,1);A.equal(second.attemptNumber,2);
 A.equal(s.rngState,beforeRng,'A second real harvest reuses the original observed check, not a fresh die');
 A.equal(s.player.inventory.marsh_reed,reed+2);
 A.equal(s.world.fenPressure,pressure+2);
 A.equal(s.table.fenReedHarvestAttempts.length,2);
 A.equal(s.table.habitatSurveyFindings[id].harvestCount,2);
 A.equal(JSON.stringify(s.table.fenReedHarvests[Math.floor(before/1440)]),originalFirst);
 // Continue only while the actual measured habitat tolerates gathering.
 A.equal(gather(s,{checkId:id}).attemptNumber,3);
 A.equal(gather(s,{checkId:id}).attemptNumber,4);
 A.equal(s.world.fenPressure,7);
 const exhausted=E.exportGame(s),doneRng=s.rngState;
 A.throws(()=>gather(s,{checkId:id}),/too disturbed/);
 A.equal(E.exportGame(s),exhausted);A.equal(s.rngState,doneRng);
}
{
 const s=start(41314);
 const id=prepare(s).checkId;check(s,id);
 const now=E.exportGame(s),rng=s.rngState;
 s.world.location='forest';
 A.throws(()=>gather(s,{checkId:id}),/only be harvested in their established wetland habitat/);
 s.world.location='fen';
 s.player.stamina=1;
 A.throws(()=>gather(s,{checkId:id}),/Insufficient Stamina/);
 s.player.stamina=E.importGame(now).player.stamina;
 s.world.fenPressure=7;
 A.throws(()=>gather(s,{checkId:id}),/too disturbed/);
 s.world.fenPressure=E.importGame(now).world.fenPressure;
 s.player.health=12;
 A.throws(()=>gather(s,{checkId:id}),/Injured gatherers/);
 s.player.health=s.player.maxHealth;
 A.equal(E.exportGame(s),now);A.equal(s.rngState,rng);
 s.world.minutes+=1441;
 A.throws(()=>gather(s,{checkId:id}),/recent successful authentic fen survey/);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-reed-harvest-'));
 try{
  const file=Path.join(dir,'save.json'),s=start(41315);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const original=FS.readFileSync(file,'utf8');
  for(const action of ['forage','gather']){
   const request={id:'legacy_'+action+'_0001',mode:'act',action};
   A.throws(()=>Turn.execute(file,request),/Prototype foraging cannot mint minerals/);
   A.equal(FS.readFileSync(file,'utf8'),original);
  }
  const p={id:'real_survey_0001',mode:'rule',system:'world',
   operation:'habitatSurvey',params:{}};
  const prepared=Turn.execute(file,p);
  A.equal(prepared.applied,true);
  const checkId=prepared.output.rules.checkId;
  A.equal(Turn.execute(file,p).duplicate,true);
  const chk={id:'real_fen_check_0001',mode:'check',checkId};
  const interpreted=Turn.execute(file,chk);
  A.equal(interpreted.applied,true);
  A.equal(interpreted.output.check.success,true);
  A.equal(Turn.execute(file,chk).duplicate,true);
  const before=FS.readFileSync(file,'utf8'),rng=E.importGame(before).rngState;
  const fake={id:'fake_harvest_0001',mode:'rule',system:'world',
   operation:'harvestReeds',params:{checkId,quantity:90}};
  A.throws(()=>Turn.execute(file,fake),/only a previously successful witnessed checkId/);
  A.equal(FS.readFileSync(file,'utf8'),before);
  const real={id:'real_reed_harvest_0001',mode:'rule',system:'world',
   operation:'harvestReeds',params:{checkId}};
  const result=Turn.execute(file,real);
  A.equal(result.applied,true);A.equal(result.output.rules.quantity,1);
  A.equal(Turn.execute(file,real).duplicate,true);
  const final=FS.readFileSync(file,'utf8'),loaded=E.importGame(final);
  A.equal(loaded.player.inventory.marsh_reed,1);
  A.equal(loaded.table.habitatSurveyFindings[checkId].harvested,true);
  A.equal(loaded.rngState,rng);
  A.equal(loaded.player.inventory.moss_crystal,undefined);
  A.equal(loaded.player.inventory.sun_shard,undefined);
  // Reusing the same real source is legitimate ONLY for an entirely new,
  // separately time- and stamina-funded field harvest, never a reroll.
  const second={...real,id:'reed_second_work_0001'};
  const secondResult=Turn.execute(file,second);
  A.equal(secondResult.applied,true);
  A.equal(secondResult.output.rules.attemptNumber,2);
  A.equal(secondResult.output.rules.quantity,1);
  A.equal(Turn.execute(file,second).duplicate,true);
  const both=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(both.player.inventory.marsh_reed,2);
  A.equal(both.rngState,rng);
  A.equal(both.table.fenReedHarvestAttempts.length,2);
  A.equal(both.table.fenReedHarvests[Math.floor(both.world.minutes/1440)].checkId,checkId);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}

// Natural-language routing now exposes the ORIGINAL three separate
// source-verified steps, never an invented one-roll foraging shortcut.
// The very same independently witnessed dice, resources, ecology, time
// and replay restrictions still govern the journey.
{
 const s=start(41321);
 s.player.inventory.marsh_reed=0; // Disposable character starts without reeds.
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-natural-fieldwork-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const original=FS.readFileSync(file,'utf8');
  const notes={id:'field_notes_001',mode:'act',action:'field notes'};
  const firstNotes=Turn.execute(file,notes);
  A.equal(firstNotes.applied,false);
  A.equal(firstNotes.output.survey.surveyable,true);
  A.equal(firstNotes.output.survey.pending.length,0);
  A.equal(FS.readFileSync(file,'utf8'),original);
  const missing={id:'no_survey_001',mode:'act',action:'interpret habitat signs'};
  A.throws(()=>Turn.execute(file,missing),/one genuine, still-current personally witnessed habitat survey/);
  A.equal(FS.readFileSync(file,'utf8'),original);
  const gatherBefore={id:'no_reeds_001',mode:'act',action:'gather reeds'};
  A.throws(()=>Turn.execute(file,gatherBefore),/recent, genuinely successful/);
  A.equal(FS.readFileSync(file,'utf8'),original);
  const prep={id:'field_survey_001',mode:'act',action:'survey the fen'};
  const prepared=Turn.execute(file,prep);
  A.equal(prepared.applied,true);
  const id=prepared.output.survey.checkId;
  A.match(id,/^habitat_fen_[0-9]{5}$/);
  A.equal(Turn.execute(file,prep).duplicate,true);
  const saved=FS.readFileSync(file,'utf8');
  const look=Turn.execute(file,{id:'field_notes_002',mode:'act',action:'survey notes'});
  A.equal(look.applied,false);
  A.equal(look.output.survey.pending[0].checkId,id);
  A.equal(FS.readFileSync(file,'utf8'),saved);
  const interpret={id:'field_check_001',mode:'act',action:'interpret habitat signs'};
  const checked=Turn.execute(file,interpret);
  A.equal(checked.applied,true);
  A.equal(checked.output.surveyCheck.verifiedSceneCheck,id);
  A.equal(checked.output.surveyCheck.success,true);
  A.ok(checked.output.surveyCheck.roll>=1&&checked.output.surveyCheck.roll<=20);
  A.equal(Turn.execute(file,interpret).duplicate,true);
  const afterRoll=FS.readFileSync(file,'utf8'),
   actual=E.importGame(afterRoll),rng=actual.rngState;
  A.equal(actual.table.habitatSurveyFindings[id].success,true);
  A.throws(()=>Turn.execute(file,{id:'field_check_repeat_001',mode:'act',
   action:'interpret habitat signs'}),/one genuine, still-current personally witnessed habitat survey/);
  A.equal(FS.readFileSync(file,'utf8'),afterRoll);
  const gather={id:'field_reeds_001',mode:'act',action:'harvest reeds'};
  const gathered=Turn.execute(file,gather);
  A.equal(gathered.applied,true);
  A.equal(gathered.output.harvest.checkId,id);
  A.equal(gathered.output.harvest.quantity,1);
  A.equal(Turn.execute(file,gather).duplicate,true);
  const kept=FS.readFileSync(file,'utf8'),reloaded=E.importGame(kept);
  A.equal(reloaded.player.inventory.marsh_reed,1);
  A.equal(reloaded.rngState,rng);
  A.equal(reloaded.world.fenPressure,actual.world.fenPressure+1);
  A.equal(reloaded.player.inventory.moss_crystal,undefined);
  const repeat=Turn.execute(file,{id:'field_reeds_repeat_001',mode:'act',
    action:'harvest reeds'});
  A.equal(repeat.applied,true);
  A.equal(repeat.output.harvest.attemptNumber,2);
  A.equal(repeat.output.harvest.quantity,1);
  A.equal(Turn.execute(file,{id:'field_reeds_repeat_001',mode:'act',
    action:'harvest reeds'}).duplicate,true);
  const afterRepeat=FS.readFileSync(file,'utf8');
  const twice=E.importGame(afterRepeat);
  A.equal(twice.player.inventory.marsh_reed,2);
  A.equal(twice.world.fenPressure,reloaded.world.fenPressure+1);
  A.equal(twice.rngState,rng);
  A.equal(twice.table.fenReedHarvestAttempts.length,2);
  const noteAgain=Turn.execute(file,{id:'field_notes_003',mode:'act',action:'field notes'});
  A.equal(noteAgain.applied,false);
  A.equal(noteAgain.output.findings.at(-1).harvested,true);
  A.equal(noteAgain.output.findings.at(-1).harvestCount,2);
  A.equal(FS.readFileSync(file,'utf8'),afterRepeat);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
// More than one genuine day can lead to two legitimate local harvests, and
// then the EXISTING recipe decides whether the actual supplies become balm.
// A craft failure still spends all input materials; no guarantee or reroll.
{
 const s=start(41322);
 s.player.inventory.marsh_reed=0;
 for(let day=0;day<2;day++){
  const originalPressure=s.world.fenPressure,minute=s.world.minutes;
  const survey=prepare(s),checked=check(s,survey.checkId);
  A.equal(checked.success,true);
  const gathered=gather(s,{checkId:survey.checkId});
  A.equal(gathered.quantity,1);
  A.equal(s.world.fenPressure,originalPressure+1);
  A.ok(s.world.minutes>=minute+20+15+45);
  if(day===0)R.world.advance(s,1);
 }
 A.equal(s.player.inventory.marsh_reed,2);
 A.equal(E.dispatch(s,'travel crossing').ok,true);
 A.equal(E.dispatch(s,'travel academy').ok,true);
 const before=s.world.minutes,oldReeds=s.player.inventory.marsh_reed,
  oldRations=s.player.inventory.clean_rations,
  oldBalm=s.player.inventory.healing_balm;
 const result=R.act(s,{system:'craft',operation:'fieldPoultice',params:{}});
 A.equal(result.recipe,'field_poultice');
 A.equal(result.check.dc,12);
 A.ok(result.check.roll>=1&&result.check.roll<=20);
 A.equal(s.world.minutes,before+70);
 A.equal(s.player.inventory.marsh_reed||0,oldReeds-2);
 A.equal(s.player.inventory.clean_rations||0,oldRations-1);
 A.equal(s.player.inventory.healing_balm,oldBalm+(result.succeeded?1:0));
 A.equal(s.player.inventory.moss_crystal,undefined);
 A.equal(s.player.inventory.sun_shard,undefined);
 A.equal(E.importGame(E.exportGame(s)).table.fieldCraftDaily[String(Math.floor(before/1440))].success,
   result.succeeded);
}

console.log('Witnessed sustainable marsh reed foraging and legacy rare-resource bypass tests passed');
