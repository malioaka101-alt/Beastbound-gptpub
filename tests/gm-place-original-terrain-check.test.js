'use strict';
// Original GM-established locations should use the SAME bounded local terrain
// check and one d20 as original hard-coded locations, without fictional DCs.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine'),R=require('../rules'),
 New=require('../scripts/new-campaign'),
 Opening=require('../scripts/gm-campaign-opening'),
 Places=require('../world/lived-places'),Turn=require('../scripts/chat-turn');
const s=New.create({seed:930311,slug:'gm_lived_scene_original_terrain',
 mode:'guided',homeRegion:'morrowfen_basin',age:25}).state;
const originalScene='A real riverside hall with several uneven, visible timber floorboards and a weather-worn threshold at the front entrance.';
Opening.apply(s,{place:{placeId:'timber_reed_hall',name:'Timber Reed Hall',
 regionId:s.campaign.origin.birthRegionId,
 description:originalScene,
 kind:'ordinary public timber gathering hall',sceneType:'settlement',
 culture:'Visitors may walk and inspect the uneven timber floor without being automatically enrolled in a guild or class.'},
 scene:'You stand inside Timber Reed Hall beside the uneven timber floorboards, and the ordinary daylight makes the threshold easy to inspect.',
 focus:'Walking carefully over a real uneven hall threshold',
 weather:'Cool, cloudy riverside morning',hour:10,minute:0});
const original=Places.location(s),id='timber_reed_hall';
A.equal(original.canonical,false);
A.equal(s.world.location,id);
A.ok(!E.LOCATIONS[id]);
A.equal(Places.get(s,id).foundingHash.length,64);
const act=(op,params={})=>R.act(s,{system:'core',operation:op,params});
const firstMinute=s.world.minutes,firstRandom=s.rngState,
 startingStock=JSON.stringify(s.player.inventory);
const params={intent:'I step carefully across the observed uneven timber boards near the threshold.',method:'footing'};
A.throws(()=>act('prepareSceneCheck',{...params,dc:2}),/only a short original intention/);
A.equal(s.world.minutes,firstMinute);A.equal(s.rngState,firstRandom);
const prep=act('prepareSceneCheck',params);
A.equal(prep.prepared,true);A.equal(prep.noRollYet,true);
A.equal(s.world.minutes,firstMinute);A.equal(s.rngState,firstRandom);
const proof=s.table.sceneChecks[prep.checkId];
A.equal(proof.location,id);A.equal(proof.dc,10);
A.ok(proof.source.includes(Places.get(s,id).foundingHash));
A.equal(proof.attribute,'dex');A.equal(proof.skill,'survival');
A.throws(()=>act('prepareSceneCheck',params),/pending local scene check|identical local attempt/);
const forged=E.importGame(E.exportGame(s));
forged.table.realm.livedPlaces.places[id].description='A completely rewritten site that never existed in the actual founding scene.';
A.throws(()=>R.act(forged,{system:'core',operation:'check',params:{checkId:prep.checkId}}),
 /founding|original|Saved authored place/);
const beforeResolution=E.exportGame(s);
const result=act('check',{checkId:prep.checkId}).check;
A.ok(result.roll>=1&&result.roll<=20);
A.equal(result.dc,10);
A.equal(s.world.minutes,firstMinute+15);
A.equal(JSON.stringify(s.player.inventory),startingStock);
A.equal(s.table.sceneChecks[prep.checkId].used,true);
A.equal(s.table.sceneCheckEventsUsed[proof.eventHash],prep.checkId);
A.throws(()=>act('check',{checkId:prep.checkId}),/current precommitted witnessed challenge/);
A.throws(()=>act('prepareSceneCheck',params),/identical local attempt/);
const after=E.importGame(E.exportGame(s));
A.equal(after.table.sceneChecks[prep.checkId].used,true);
A.equal(Places.get(after,id).foundingHash,Places.get(s,id).foundingHash);
// Exactly the same saved GM location must be accessible from the real chat
// freeform GM-judged action path, not merely direct internal function calls.
const tmp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-gm-terrain-'));
try{
 const file=Path.join(tmp,'campaign.json');
 const unplayed=E.importGame(beforeResolution);
 // This is a separately prepared pre-roll state. Use an unrelated intent
 // so the already prepared same-site check is not silently bypassed.
 delete unplayed.table.sceneChecks[prep.checkId];
 unplayed.sequence--;
 unplayed.log.pop();
 FS.writeFileSync(file,E.exportGame(unplayed)+'\n');
 const request={id:'gm_lived_original_terrain_handoff_1',mode:'act',
  action:'I carefully test the uneven timber footing in this hall.',
  gmSceneCheckMethod:'footing'};
 const prepared=Turn.execute(file,request);
 A.equal(prepared.ok,true);
 A.equal(prepared.applied,true);
 A.equal(prepared.output.gmAdjudication.status,'source-check-prepared');
 const checkId=prepared.output.sceneCheckPreparation.checkId;
 A.ok(checkId.startsWith('scene_'));
 const applied=Turn.execute(file,{id:'gm_lived_original_terrain_resolve_2',
  mode:'check',checkId});
 A.equal(applied.ok,true);
 A.equal(applied.applied,true);
 A.equal(applied.output.check.verifiedSceneCheck,checkId);
 const saved=E.importGame(FS.readFileSync(file,'utf8'));
 A.equal(saved.table.sceneChecks[checkId].used,true);
 A.equal(Places.location(saved).canonical,false);
}finally{FS.rmSync(tmp,{recursive:true,force:true});}
console.log('GM established place -> ORIGINAL precommitted physical scene check and unique d20, true founding proof, no new DC, loot, consent or extra roll passed');
