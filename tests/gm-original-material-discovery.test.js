'use strict';
// GM-first identification of one actually owned resource variant.
// One original appraisal roll, original item debit, no minted new material,
// no unearned ability/recipe, honest release and source-backed design lookup.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine'),New=require('../scripts/new-campaign'),
 R=require('../rules'),Material=require('../rules/material-discovery'),
 Turn=require('../scripts/chat-turn');
const name='Silver-Striped Ration';
const s=New.create({seed:921559,slug:'ordinary_novel_material_integration',
 mode:'gm',age:16,gmOpening:{locationId:'crossing',
 scene:'On a clean table, a Silver-Striped Ration shows a distinctive bright streak in its ordinary grain casing.\nThe inventor examines it without claiming any magical effect.',
 focus:'An ordinary physical material examination',
 weather:'Cool riverside morning air',hour:10,minute:0}}).state;
const social=(operation,params={})=>R.act(s,{system:'social',operation,params});
const creation=(operation,params={})=>R.act(s,{system:'creation',operation,params});
const primary=social('documentOwnedMaterial',{ownerId:'player',
 item:'clean_rations',quantity:1,
 description:'One actually carried ration has a visibly silver-striped grain casing and slightly different ordinary texture.'});
A.equal(primary.documented,true);
const inputs={assetId:primary.id,materialId:'silver_striped_ration',
 name,visibleBasis:'The original owned ration casing contains a visible thin silver stripe and unusual but ordinary grain texture.'};
const proposal={title:'Silver-Striped Grain Feeler',
 purpose:'Test whether this genuinely identified physical ration variant can mechanically support a simple nonmagical hand-held gauge.',
 system:'mundane',medium:'tool',function:'sense',
 magnitude:0,range:'touch',area:'single',duration:'1min',
 novelty:'variant',materials:[{id:inputs.materialId,quantity:1}],
 target:'grain_moisture'};
const before=creation('evaluate',proposal);
A.equal(before.prerequisites.missingMaterials.length,1);
A.ok(before.gaps.some(x=>x.includes('Novel material identities')));
const stock=s.player.inventory.clean_rations,coins=s.player.coins,
 beforeMinute=s.world.minutes,originalPlayerRoll=s.rngState;
A.throws(()=>creation('appraiseSourcedMaterial',{...inputs,verified:true}),/Appraise an identified/);
A.throws(()=>creation('appraiseSourcedMaterial',{...inputs,assetId:'fake_asset'}),/genuinely held/);
A.throws(()=>creation('appraiseSourcedMaterial',{...inputs,name:'Invisible Unknown Crystal'}),/already be visible/);
A.equal(s.player.inventory.clean_rations,stock);
A.equal(s.world.minutes,beforeMinute);
A.equal(s.rngState,originalPlayerRoll);
// Disposable deterministic first attempt, not a player-controlled success input.
s.rngState=0xabcdef01;
const assessed=creation('appraiseSourcedMaterial',inputs);
A.equal(assessed.appraised,true);
A.equal(assessed.identified,true);
A.equal(assessed.noNewStock,true);
A.equal(assessed.noVerifiedSpecialAbility,true);
A.equal(assessed.elapsedMinutes,45);
A.equal(s.world.minutes,beforeMinute+45);
A.equal(s.player.inventory.clean_rations,stock-1);
A.equal(s.player.coins,coins);
A.equal(Material.verify(s),true);
A.equal(Material.count(s,inputs.materialId),1);
const known=creation('evaluate',proposal);
A.equal(known.prerequisites.missingMaterials.length,0);
A.equal(known.gaps.some(x=>x.includes('Novel material identities')),false);
A.equal(known.noItemCreated,true);
A.equal(known.noTechniqueLearned,true);
A.ok(known.gaps.some(x=>x.includes('physical prototype')));
A.throws(()=>creation('prototype',{id:'design_1'}),
 /genuine originally sealed invention|preexisting design/);
const originalDetails=creation('materialStatus',{materialId:inputs.materialId});
A.equal(originalDetails.samples[0].currentStatus,'reserved');
A.equal(originalDetails.samples[0].physicallyHeldUnits,1);
A.equal(originalDetails.samples[0].noAutomaticRecipeOrPrice,true);
const dossier=creation('draft',proposal);
A.equal(dossier.recorded,true);
const ownedDossier=creation('status',{id:dossier.id}).designs[0];
A.equal(ownedDossier.currentMaterials[0].heldNow,1);
A.equal(ownedDossier.currentMaterials[0].identifiedOriginalMaterial,true);
A.equal(ownedDossier.noItemCreated,true);
const serial=E.importGame(E.exportGame(s));
A.equal(Material.verify(serial),true);
A.equal(Material.count(serial,inputs.materialId),1);
const forged=E.importGame(E.exportGame(s));
forged.table.materialRecords[inputs.materialId].source.visibleBasis='Some rewritten magical power';
A.equal(Material.verify(forged),false);
A.throws(()=>R.act(forged,{system:'creation',operation:'evaluate',params:proposal}),/source|reconciliation/i);
const forgedInventory=E.importGame(E.exportGame(s));
forgedInventory.table.materialRecords['fake_material']={verified:true,status:'reserved',id:'fake_material'};
A.equal(Material.verify(forgedInventory),false);
A.throws(()=>R.act(forgedInventory,{system:'creation',operation:'evaluate',params:{
 ...proposal,materials:[{id:'fake_material',quantity:1}]}}),/reconciliation|source/i);
A.throws(()=>creation('appraiseSourcedMaterial',inputs),/appraised twice/);
const beforeRelease=s.world.minutes;
const returned=creation('releaseSourcedMaterial',{materialId:inputs.materialId});
A.equal(returned.released,true);
A.equal(returned.quantityReturned,1);
A.equal(s.player.inventory.clean_rations,stock);
A.equal(s.world.minutes,beforeRelease+5);
A.equal(Material.count(s,inputs.materialId),0);
A.equal(Material.verify(s),true);
A.equal(creation('status',{id:dossier.id}).designs[0].currentMaterials[0].heldNow,0,
 'Historical invention source survives, but released material is no longer held');
const noStock=creation('evaluate',proposal);
A.equal(noStock.prerequisites.missingMaterials.length,1);
A.throws(()=>creation('releaseSourcedMaterial',{materialId:inputs.materialId}),/still-reserved/);
const second=social('documentOwnedMaterial',{ownerId:'player',
 item:'clean_rations',quantity:1,
 description:'A distinct physically owned ration remains available for a second unrelated ordinary visible-grain hypothesis.'});
s.rngState=0xffffffff;
const failed=creation('appraiseSourcedMaterial',{
 assetId:second.id,materialId:'unproved_grain_variant',
 name,visibleBasis:'A second ordinary ration appears superficially comparable but its special material identity has not been established.'});
A.equal(failed.identified,false);
A.equal(s.player.inventory.clean_rations,stock);
A.equal(Material.verify(s),true);
A.throws(()=>creation('appraiseSourcedMaterial',{
 assetId:second.id,materialId:'unproved_grain_variant',
 name,visibleBasis:'An attempted reroll on an unchanged physical item would not constitute fresh source evidence.'}),/appraised twice/);
const tmp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-novel-material-'));
try{
 const path=Path.join(tmp,'save.json'),saved=E.exportGame(s)+'\n';
 FS.writeFileSync(path,saved);
 const out=Turn.execute(path,{id:'gm_material_status_read_01',
  mode:'rule',system:'creation',operation:'materialStatus',params:{}});
 A.equal(out.ok,true);
 A.equal(out.applied,false);
 A.equal(FS.readFileSync(path,'utf8'),saved);
}finally{FS.rmSync(tmp,{recursive:true,force:true});}
console.log('GM physical material identification: real owned asset, one d20, exact 1-unit stock reservation, design evidence only, no ability or recipe, release and failure replay protections passed');
