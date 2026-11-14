'use strict';
// #25: The GM interprets entirely natural intentions; the engine uses only
// the EXISTING local scene source and the one original precommitted d20 check.
// All saves and physical states in this regression are disposable.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),
 Turn=require('../scripts/chat-turn.js');
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-original-freeform-'));
const file=Path.join(dir,'disposable.json');
const read=()=>FS.readFileSync(file,'utf8');
const load=()=>E.importGame(read());
const act=(id,action,gmSceneCheckMethod,extra={})=>
 Turn.execute(file,{id,mode:'act',action,...(gmSceneCheckMethod?{gmSceneCheckMethod}:{}),...extra});
const check=(id,checkId)=>Turn.execute(file,{id,mode:'check',checkId});
try{
 const s=E.newGame({seed:250025,name:'No Menu GM Intent',background:'fieldworker'});
 FS.writeFileSync(file,E.exportGame(s)+'\n');
 const initial=read(),initialRng=s.rngState;
 const novel='I examine the streamside ground to see whether the soil gives way beneath the reeds';
 const unknown=act('gm_unknown_soil_001',novel);
 A.equal(unknown.applied,false);
 A.equal(unknown.output.gmAdjudication.status,'unresolved');
 A.equal(unknown.output.gmAdjudication.noRollOccurred,true);
 A.equal(read(),initial);
 A.equal(load().rngState,initialRng);
 for(const bad of [
  {id:'gm_fake_dc_001',mode:'act',action:novel,gmSceneCheckMethod:'reading',dc:2},
  {id:'gm_fake_outcome_001',mode:'act',action:novel,gmSceneCheckMethod:'reading',result:'perfect'},
  {id:'gm_fake_method_001',mode:'act',action:novel,gmSceneCheckMethod:'invented'},
  {id:'gm_fake_mode_001',mode:'status',gmSceneCheckMethod:'reading'}
 ]){
  A.throws(()=>Turn.execute(file,bad),/GM terrain handoff/);
  A.equal(read(),initial);A.equal(load().rngState,initialRng);
 }
 A.throws(()=>act('gm_fake_glance_001','look','reading'),/read-only observation/);
 A.equal(read(),initial);
 A.throws(()=>act('gm_fake_travel_001','travel forest','reading'),
  /only for an otherwise unresolved freeform act/);
 A.equal(read(),initial,'ordinary movement cannot hide a bonus scene check');
 // A very different sentence is not categorised by a fixed parser. The GM
 // chooses one of two *previously supported* mechanics; source owns DC,
 // real actor skill, location, one-use event, and the result.
 const prepared=act('gm_read_soil_001',novel,'reading');
 A.equal(prepared.applied,true);
 A.equal(prepared.output.gmAdjudication.status,'source-check-prepared');
 A.equal(prepared.output.gmAdjudication.noRollOccurred,true);
 A.equal(prepared.output.gmAdjudication.noTimeElapsed,true);
 A.equal(prepared.output.gmAdjudication.noOutcomeClaimed,true);
 const first=prepared.output.sceneCheckPreparation;
 A.equal(first.prepared,true);A.equal(first.method,'reading');
 A.ok(/^scene_[0-9]+$/.test(first.checkId));
 const afterPrepare=read(),ready=load(),startMinute=ready.world.minutes;
 A.equal(startMinute,s.world.minutes);A.equal(ready.rngState,initialRng);
 A.equal(ready.table.sceneChecks[first.checkId].dc,10);
 A.equal(ready.table.sceneChecks[first.checkId].skill,'survival');
 A.equal(ready.table.sceneChecks[first.checkId].attribute,'wis');
 A.equal(ready.table.sceneChecks[first.checkId].used,false);
 A.equal(ready.player.coins,s.player.coins);
 A.deepEqual(ready.player.inventory,s.player.inventory);
 A.deepEqual(ready.player.partnerIds,s.player.partnerIds);
 A.equal(Turn.execute(file,{id:'gm_read_soil_001',mode:'act',action:novel,
  gmSceneCheckMethod:'reading'}).duplicate,true);
 A.equal(read(),afterPrepare);
 A.throws(()=>check('gm_check_fake_001','fabricated_id'),
  /precommitted witnessed challenge/);
 A.equal(read(),afterPrepare);
 const resolved=check('gm_soil_roll_001',first.checkId);
 A.equal(resolved.applied,true);
 A.equal(resolved.output.check.verifiedSceneCheck,first.checkId);
 A.equal(resolved.output.check.dc,10);
 A.ok(resolved.output.check.roll>=1&&resolved.output.check.roll<=20);
 A.equal(resolved.output.check.elapsedMinutes,10);
 const rolled=read(),past=load();
 A.equal(past.world.minutes,startMinute+10);
 A.equal(past.table.sceneChecks[first.checkId].used,true);
 A.deepEqual(past.player.inventory,s.player.inventory);
 A.equal(past.player.coins,s.player.coins);
 A.equal(Turn.execute(file,{id:'gm_soil_roll_001',mode:'check',
  checkId:first.checkId}).duplicate,true);
 A.equal(read(),rolled);
 A.throws(()=>check('gm_soil_double_001',first.checkId),
  /precommitted witnessed challenge/);
 A.equal(read(),rolled);
 A.throws(()=>act('gm_soil_rephrase_001',novel,'reading'),
  /identical local attempt already/);
 A.equal(read(),rolled);
 // A second independently grounded action, this time in actual forest
 // terrain and using Dexterity/footing, demonstrates different abilities
 // without a generic GM-selected modifier or prewritten action command.
 const newSite=load();
 A.equal(E.dispatch(newSite,'travel forest').ok,true);
 FS.writeFileSync(file,E.exportGame(newSite)+'\n');
 const forestBefore=read(),forestRng=newSite.rngState;
 const actText='I feel my way around the leaning roots and try to keep my footing across the damp forest floor';
 const footing=act('gm_forest_footing_001',actText,'footing');
 A.equal(footing.applied,true);
 A.equal(footing.output.sceneCheckPreparation.method,'footing');
 A.equal(load().table.sceneChecks[footing.output.sceneCheckPreparation.checkId].dc,12);
 A.equal(load().table.sceneChecks[footing.output.sceneCheckPreparation.checkId].attribute,'dex');
 A.equal(load().rngState,forestRng);
 A.equal(load().world.minutes,newSite.world.minutes);
 const checkId=footing.output.sceneCheckPreparation.checkId;
 const forestRoll=check('gm_forest_roll_001',checkId);
 A.equal(forestRoll.applied,true);
 A.equal(forestRoll.output.check.verifiedSceneCheck,checkId);
 A.equal(forestRoll.output.check.dc,12);
 A.equal(forestRoll.output.check.elapsedMinutes,15);
 A.equal(load().world.minutes,newSite.world.minutes+15);
 const forestSaved=read();
 A.equal(Turn.execute(file,{id:'gm_forest_roll_001',mode:'check',checkId}).duplicate,true);
 A.equal(read(),forestSaved);
 A.equal(load().player.coins,newSite.player.coins);
 A.deepEqual(load().player.inventory,newSite.player.inventory);
 A.equal(load().player.arcane.circles,newSite.player.arcane.circles);
 A.equal(load().player.meridian.stage,newSite.player.meridian.stage);
 // A free novel choice without a legitimate source remains unresolved;
 // it is not an in-world ban or a fake reward.
 const open='I try to invent a new kind of supernatural flight by listening to the clouds';
 const unsupported=act('gm_unproven_flight_001',open);
 A.equal(unsupported.applied,false);
 A.equal(unsupported.output.gmAdjudication.status,'unresolved');
 A.equal(unsupported.output.gmAdjudication.noOutcomeClaimed,true);
 A.equal(read(),forestSaved);
 A.equal(E.exportGame(load()),E.exportGame(E.importGame(read())));
 console.log('GM-first novel intentions -> original source-owned local check -> one verified roll/time; read-only/unresolved actions, anti-forgery, replay and two unlike terrain actions passed');
}finally{FS.rmSync(dir,{recursive:true,force:true});}
