'use strict';
// One authentic physical resource source supports both harvesting and
// returning native plant material. Later world ticks own establishment.
// ALL evidence is from disposable engine saves, not Aerin.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 Turn=require('../scripts/chat-turn.js');
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-native-planting-'));
const file=Path.join(dir,'camp.json');
const write=s=>FS.writeFileSync(file,E.exportGame(s)+'\n'),
 read=()=>FS.readFileSync(file,'utf8'),load=()=>E.importGame(read()),
 act=(id,action)=>Turn.execute(file,{id,mode:'act',action});
function fen(seed){
 const s=E.newGame({name:'Habitat Stewardship Fixture',seed,background:'fieldworker'});
 s.player.attributes.wis=20;s.player.skills.survival.rank=5;
 A.equal(E.dispatch(s,'travel fen').ok,true);
 return s;
}
function hills(seed){
 const s=E.newGame({name:'Upland Stewardship Fixture',seed,background:'fieldworker'});
 s.player.attributes.wis=20;s.player.skills.survival.rank=5;
 A.equal(E.dispatch(s,'travel forest').ok,true);
 A.equal(E.dispatch(s,'travel hills').ok,true);
 const preparation=R.act(s,{system:'world',operation:'habitatSurvey',params:{}});
 const check=R.act(s,{system:'core',operation:'check',
  params:{checkId:preparation.checkId}}).check;
 if(!check.success)return null;
 const gathered=R.act(s,{system:'world',operation:'gatherMaterial',
  params:{item:'ironbloom',checkId:preparation.checkId}});
 A.equal(gathered.quantity,1);
 return s;
}
function choice(factory,item,want){
 for(let i=0;i<220;i++){
  const seed=(961113+Math.imul(i,2654435761))>>>0;
  const s=factory(seed);
  if(!s)continue;
  const outcome=R.act(s,{system:'world',operation:'replantMaterial',params:{item}});
  if(outcome.viabilityVerified===want)return {seed,s,outcome};
 }
 throw Error('Could not witness an authentic '+(want?'viable':'unsuccessful')+' native planting fixture');
}
try{
 const unready=E.newGame({seed:7700,name:'Rejected Nonlocal Planting'});
 let unchanged=E.exportGame(unready),rng=unready.rngState;
 A.throws(()=>R.act(unready,{system:'world',operation:'replantMaterial',
  params:{item:'marsh_reed'}}),/established native plant/);
 A.equal(E.exportGame(unready),unchanged);A.equal(unready.rngState,rng);
 A.throws(()=>R.act(unready,{system:'world',operation:'replantMaterial',
  params:{item:'marsh_reed',quantity:100,success:true}}),
  /exactly one actually owned material name/);
 A.equal(E.exportGame(unready),unchanged);
 const remote=fen(7782);
 unchanged=E.exportGame(remote);rng=remote.rngState;
 A.throws(()=>R.act(remote,{system:'world',operation:'replantMaterial',
  params:{item:'ironbloom'}}),/different habitat/);
 A.throws(()=>R.act(remote,{system:'world',operation:'replantMaterial',
  params:{item:'moss_crystal'}}),/established native plant/);
 A.equal(E.exportGame(remote),unchanged);A.equal(remote.rngState,rng);
 remote.player.inventory.marsh_reed=0;
 unchanged=E.exportGame(remote);
 A.throws(()=>R.act(remote,{system:'world',operation:'replantMaterial',
  params:{item:'marsh_reed'}}),/Insufficient genuinely owned/);
 A.equal(E.exportGame(remote),unchanged);

 const f=choice(fen,'marsh_reed',true);
 // Use an actual valid source-derived seed for a private-file scenario;
 // replay never gets a second draw of its own original check.
 write(fen(f.seed));const prior=load(),wasRng=prior.rngState,
  oldReeds=prior.player.inventory.marsh_reed,
  baseline=R.realm.peek(prior).gatheringSites.fen.stock;
 const planted=act('native_fen_plant_reeds_01','plant reeds');
 A.equal(planted.applied,true);A.equal(planted.output.planting.attempted,true);
 A.equal(planted.output.planting.viabilityVerified,true);
 A.equal(planted.output.planting.elapsedMinutes,40);
 A.equal(planted.output.planting.staminaSpent,3);
 let after=load();
 A.equal(after.player.inventory.marsh_reed,oldReeds-1);
 A.equal(after.world.minutes,prior.world.minutes+40);
 A.equal(after.player.stamina,prior.player.stamina-3);
 A.notEqual(after.rngState,wasRng);
 A.equal(after.table.realm.gatheringSites.fen.stock,baseline,
  'Real planting never grants an immediate newly harvestable plant');
 const pending=after.table.realm.gatheringSites.fen.plantings;
 A.equal(pending.length,1);A.equal(pending[0].status,'pending');
 A.equal(pending[0].source.item,'marsh_reed');
 A.equal(pending[0].source.rollHash,
  R.realm.plantingHash(pending[0].source.rollEvent));
 A.equal(pending[0].sourceHash,R.realm.plantingHash(pending[0].source));
 A.equal(after.table.materialRestorationAttempts.length,1);
 const originalFile=read(),resultRng=after.rngState;
 const same=act('native_fen_plant_reeds_01','plant reeds');
 A.equal(same.duplicate,true);A.equal(same.recovered,true);
 A.equal(read(),originalFile);A.equal(load().rngState,resultRng);
 const seen=act('native_local_plantings_read_001','my plantings');
 A.equal(seen.applied,false);
 A.equal(seen.output.planted.observedPlantings[0].presentState,'pending');
 A.equal(read(),originalFile,'Inspection changes neither ticks nor player memories');

 const next=load();
 const advance=R.world.advance(next,6);
 A.ok(advance.sixdayTicks.length>=1);
 const established=next.table.realm.gatheringSites.fen.plantings[0];
 A.equal(established.status,'established');
 const history=next.table.realm.gatheringSites.fen.history.filter(
  x=>x.kind==='player-native-planting-resolved');
 A.equal(history.length,1);A.equal(history[0].addedStock,1);
 A.ok(next.table.realm.gatheringSites.fen.stock<=next.table.realm.gatheringSites.fen.maxStock);
 A.equal(next.player.inventory.marsh_reed,oldReeds-1);
 const afterTick=E.exportGame(next);
 const afterView=R.act(next,{system:'world',operation:'plantingStatus',params:{}});
 A.equal(afterView.observedPlantings[0].presentState,'established');
 A.equal(E.exportGame(next),afterTick,'No new turn, roll or offsite report for reading planted cuttings');
 R.world.advance(next,6);
 A.equal(next.table.realm.gatheringSites.fen.history.filter(
  x=>x.kind==='player-native-planting-resolved').length,1,
 'A planted item can establish only once across future ticks');

 // An independently unsuccessful attempt actually spends its item and work.
 const failed=choice(fen,'marsh_reed',false);
 A.equal(failed.outcome.quantityUsed,1);
 A.equal(failed.s.table.materialRestorationAttempts.length,1);
 A.equal(failed.s.table.realm.gatheringSites.fen.plantings.length,0);
 A.equal(failed.s.player.inventory.marsh_reed,1);
 A.equal(failed.outcome.awaitingRealGrowth,false);

 // Same action applies to the genuinely source-known upland plant. First
 // collect that specific plant by the already authenticated Survival route.
 const h=choice(hills,'ironbloom',true);
 A.equal(h.outcome.quantityUsed,1);
 A.equal(h.s.player.inventory.ironbloom||0,0);
 A.equal(h.s.table.materialGatherAttempts[0].item,'ironbloom');
 A.equal(h.s.table.materialRestorationAttempts[0].item,'ironbloom');
 A.equal(h.s.table.realm.gatheringSites.hills.plantings.length,1);
 const hillBefore=h.s.table.realm.gatheringSites.hills.stock;
 R.world.advance(h.s,6);
 A.equal(h.s.table.realm.gatheringSites.hills.plantings[0].status,'established');
 A.ok(h.s.table.realm.gatheringSites.hills.stock>=hillBefore);
 A.equal(h.s.player.inventory.ironbloom||0,0);
 // If the living habitat deteriorates before a planted specimen matures,
 // even an earlier high Survival check does not force future growth.
 const spoiled=fen(f.seed);
 const good=R.act(spoiled,{system:'world',operation:'replantMaterial',
  params:{item:'marsh_reed'}});
 A.equal(good.viabilityVerified,true);
 const lostStock=spoiled.table.realm.gatheringSites.fen.stock;
 spoiled.table.realm.ecosystems.whisperfen.quality=0;
 spoiled.table.realm.ecosystems.whisperfen.pressure=100;
 R.world.advance(spoiled,6);
 A.equal(spoiled.table.realm.gatheringSites.fen.plantings[0].status,'failed');
 A.equal(spoiled.table.realm.gatheringSites.fen.history.filter(
  x=>x.kind==='player-native-planting-resolved')[0].addedStock,0);
 A.equal(spoiled.player.inventory.marsh_reed,1);
 A.ok(spoiled.table.realm.gatheringSites.fen.stock>=0);
 A.ok(lostStock<=spoiled.table.realm.gatheringSites.fen.maxStock);
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('One source-backed habitat stock supports actual gathering, independent native propagation and later ecological outcomes');
