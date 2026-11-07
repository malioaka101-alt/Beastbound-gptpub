'use strict';
// Source-verified gathering is now one mechanic for different original
// materials/habitats. No new creatures, hidden loot, or active campaign edit.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 Turn=require('../scripts/chat-turn.js');
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-cross-habitat-sources-'));
const file=Path.join(dir,'test.json'),write=s=>FS.writeFileSync(file,E.exportGame(s)+'\n'),
 read=()=>FS.readFileSync(file,'utf8'),load=()=>E.importGame(read()),
 act=(id,action)=>Turn.execute(file,{id,mode:'act',action});
const observe=s=>{
 const ready=R.act(s,{system:'world',operation:'habitatSurvey',params:{}});
 const check=R.act(s,{system:'core',operation:'check',
  params:{checkId:ready.checkId}}).check;
 A.equal(check.success,true,'Only an authentically successful field survey permits gathering');
 return {checkId:ready.checkId,roll:check.roll};
};
try{
 const s=E.newGame({name:'Multiple Actual Habitats',seed:18817});
 s.player.attributes.wis=30;s.player.skills.survival.rank=5;
 A.equal(E.dispatch(s,'travel forest').ok,true);
 A.equal(E.dispatch(s,'travel hills').ok,true);
 write(s);
 const original=read(),rng=load().rngState;
 A.throws(()=>act('no_unobserved_ironbloom_01','harvest ironbloom'),
  /recent, genuinely successful personally witnessed habitat survey/);
 A.equal(read(),original);A.equal(load().rngState,rng);
 A.throws(()=>R.act(load(),{system:'world',operation:'gatherMaterial',
  params:{item:'moss_crystal',checkId:'player_created',quantity:20}}),
  /requires one real material item/);
 A.throws(()=>R.act(load(),{system:'world',operation:'gatherMaterial',
  params:{item:'moss_crystal',checkId:'player_created'}}),
  /no actually established harvestable local source/);
 A.equal(read(),original);
 const prep=act('hills_original_survey_001','inspect habitat signs');
 A.equal(prep.output.survey.prepared,true);
 A.match(prep.output.survey.checkId,/^habitat_hills_\d{5}$/);
 const solved=act('hills_interpret_original_001','interpret habitat signs');
 A.equal(solved.output.surveyCheck.success,true);
 const checked=load(),realWorld=R.realm.peek(checked),
  hills=realWorld.gatheringSites.hills,
  priorStock=hills.stock,priorEcology=realWorld.ecosystems.ashwind,
  oldReed=checked.player.inventory.marsh_reed||0,
  oldIron=checked.player.inventory.ironbloom||0,
  afterCheckRng=checked.rngState;
 A.equal(hills.origin,'original-habitat-resource-source-v1');
 A.equal(hills.region,'ashwind');A.equal(hills.item,'ironbloom');
 A.ok(priorStock>=1&&priorStock<=4);
 const first=act('hills_first_ironbloom_0001','harvest ironbloom');
 A.equal(first.applied,true);
 A.equal(first.output.harvest.item,'ironbloom');
 A.equal(first.output.harvest.quantity,1);
 A.equal(first.output.harvest.attemptNumber,1);
 A.equal(first.output.harvest.originalSurvivalRoll,solved.output.surveyCheck.roll);
 let after=load();
 A.equal(after.player.inventory.ironbloom,oldIron+1);
 A.equal(after.player.inventory.marsh_reed||0,oldReed);
 A.equal(after.table.realm.gatheringSites.hills.stock,priorStock-1);
 A.equal(after.table.realm.ecosystems.ashwind.pressure,priorEcology.pressure+4);
 A.equal(after.player.stamina,checked.player.stamina-5);
 A.equal(after.world.minutes,checked.world.minutes+60);
 A.equal(after.rngState,afterCheckRng);
 A.equal(after.table.materialGatherAttempts[0].item,'ironbloom');
 A.equal(after.table.materialGatherAttempts[0].sourceRollHash,
  checked.table.habitatSurveyFindings[prep.output.survey.checkId].rollEventHash);
 const checkpoint=read(),idRng=after.rngState;
 const again=act('hills_first_ironbloom_0001','harvest ironbloom');
 A.equal(again.duplicate,true);A.equal(again.recovered,true);
 A.deepEqual(again.output,first.output);A.equal(read(),checkpoint);
 A.equal(load().rngState,idRng);
 const status=act('hills_read_existing_notes_01','field notes');
 A.equal(status.applied,false);A.equal(read(),checkpoint);
 // The same mechanic supports genuinely repeated physical labour until
 // this *finite world stock* is exhausted; no dice or items are invented.
 for(let i=1;i<priorStock;i++){
  const out=act('hills_next_distinct_work_'+i,'collect ironbloom');
  A.equal(out.output.harvest.item,'ironbloom');
  A.equal(out.output.harvest.quantity,1);
 }
 after=load();
 A.equal(after.table.realm.gatheringSites.hills.stock,0);
 A.equal(after.player.inventory.ironbloom,oldIron+priorStock);
 A.equal(after.rngState,afterCheckRng);
 const empty=read();
 A.throws(()=>act('hills_fabricate_new_flora_01','pick ironbloom'),
  /actual local material patch is exhausted/);
 A.equal(read(),empty);
 const beforeRecovery=load(),eco=beforeRecovery.table.realm.ecosystems.ashwind;
 // A separate real world sixday tick can replenish one source unit only
 // if regional forage, quality and pressure support it. The player receives
 // no free resource from waiting.
 const world=R.world.advance(beforeRecovery,6);
 A.ok(world.sixdayTicks.length>=1);
 const regrowth=beforeRecovery.table.realm.gatheringSites.hills;
 const canRegrow=eco.forage>=35&&eco.quality>=35&&eco.pressure<75;
 A.equal(regrowth.stock,canRegrow?1:0);
 A.equal(beforeRecovery.player.inventory.ironbloom,oldIron+priorStock);
 A.equal(regrowth.history.at(-1).kind,'independent-habitat-regrowth');

 // A new resource source does not make evidence from another habitat valid.
 const other=E.newGame({name:'Unmixed Habitat Warnings',seed:18818});
 other.player.attributes.wis=30;other.player.skills.survival.rank=5;
 A.equal(E.dispatch(other,'travel fen').ok,true);
 const fenProof=observe(other);
 const fenHistory=E.exportGame(other),beforeOtherRng=other.rngState;
 A.throws(()=>R.act(other,{system:'world',operation:'gatherMaterial',
  params:{item:'ironbloom',checkId:fenProof.checkId}}),
  /established Ashwind Foothills/);
 A.equal(E.exportGame(other),fenHistory);A.equal(other.rngState,beforeOtherRng);
 // Historical marsh-reed API stays valid and the SAME material method can
 // continue the later action without rewriting original legacy receipts.
 const legacy=R.act(other,{system:'world',operation:'harvestReeds',
  params:{checkId:fenProof.checkId}});
 const firstReceipt=JSON.stringify(other.table.fenReedHarvests);
 const shared=R.act(other,{system:'world',operation:'gatherMaterial',
  params:{item:'marsh_reed',checkId:fenProof.checkId}});
 A.equal(legacy.item,'marsh_reed');
 A.equal(shared.item,'marsh_reed');
 A.equal(shared.attemptNumber,2);
 A.equal(other.player.inventory.marsh_reed,2);
 A.equal(JSON.stringify(other.table.fenReedHarvests),firstReceipt);
 A.equal(other.table.fenReedHarvestAttempts.length,2);
 A.equal(other.table.materialGatherAttempts.length,2);
 A.equal(other.rngState,beforeOtherRng);
 // No arbitrary rare-item harvesting even if the real local survey passes.
 const rare=E.exportGame(other);
 A.throws(()=>R.act(other,{system:'world',operation:'gatherMaterial',
  params:{item:'moss_crystal',checkId:fenProof.checkId}}),
  /no actually established harvestable local source/);
 A.equal(E.exportGame(other),rare);
} finally {FS.rmSync(dir,{recursive:true,force:true});}
console.log('Source-authenticated multi-habitat gathering conserves stock, ecology and original Survival evidence without rare loot');
