'use strict';
// Master §25: Pocket Architecture V builds a small authentic original anchored
// finite storage structure. It is NOT a portal, free inventory, traversable
// dimension, free beast pen or remote-teleportation action.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),C=require('../rules/core'),
 Fold=require('../rules/rift-fold-step'),Weave=require('../rules/rift-boundary-weaving'),
 Pocket=require('../rules/rift-pocket-architecture'),
 Anchors=require('../rules/rift-anchors');
const act=(s,system,operation,params={})=>
 R.act(s,{system,operation,params});
const BEGIN='At the documented southern public exterior wardline milestone';
const END='At the measured northeastern public exterior wardline marker';
const SEGMENT='pocket_stable_exterior_span_01';
const APPROACH='Independently measure physical exterior bearings with real landscape, spatial reference and no sealed-vault entry';
function rollWitness(s,from,to){
 C.event(s,'story','An independent spatial surveyor witnesses the genuine local short Fold Step along visible unobstructed exterior stonework.',{
  origin:Fold.WITNESS,anchorId:Anchors.SITE,
  location:s.world.location,fromObservedPosition:from,
  toObservedPosition:to,measuredDistanceMetres:4,safeRangeMetres:5,
  lineOfEffectClear:true,crossesSealedBoundary:false,
  crossesWorldLocation:false,
  lineOfEffectMeasurement:'An actual locally measured unobstructed path between public exterior milestone stones is independently verified.',
  independentObstructionTest:'The enclosed vault ward and solid stone would defeat this exact line-of-effect; the attempt stays outside.',
  energyAndPhysicalLimit:'Real original stamina and bodily shear resistance constrain the ability to move even four measured metres.',
  measuredPressureCountertest:'An independent exterior stone pressure survey detects real spatial shear risk that can defeat the fold.'});
 return s.log.length-1;
}
function weaveWitness(s){
 C.event(s,'story','An independent survey establishes a physically stable small external Riftglass boundary segment before active reinforcement.',{
  origin:Weave.WITNESS,location:s.world.location,
  boundaryId:'riftglass_wardline',segmentId:SEGMENT,mode:'reinforce',
  areaSquareMetres:4,supportMinutes:360,
  originalSpatialFabric:'A measured outer wardstone span has original spatial structure and no observed safe portal or hidden vault access.',
  observedLocalChange:'A real local reinforcement stabilises the exterior small spatial segment for a finite measured period.',
  independentPressureCountertest:'An observed high-pressure shift can collapse the woven local segment without changing the protected vault seal.',
  actualEnergyLimit:'Genuine original Stamina, time and measured Arcana are required to maintain this finite temporary reinforcement.',
  crossesBoundary:false,opensPortal:false,globalSealChanged:false});
 return s.log.length-1;
}
function buildWitness(s,pocketId){
 C.event(s,'story','A separately observed original spatial architect measures a physically finite anchor cavity and authentic existing construction materials.',{
  origin:Pocket.WITNESS,location:s.world.location,
  boundaryId:'riftglass_wardline',segmentId:SEGMENT,pocketId,
  capacityUnits:3,lifetimeHours:24,materials:{moss_crystal:1,ironbloom:1},
  originalSpatialVolume:'A small strictly bounded isolated inert-storage cavity is measured against known exterior anchor geometry, not a traversable realm.',
  originalStableAnchoring:'The separately observed reinforced exterior segment and actual mineral frame physically hold a finite cavity stable.',
  independentCollapseCountertest:'A separate discontinuity test establishes that after finite expiry the stored contents remain trapped, not returned by wish or duplicated.',
  measuredEnergyAndMetabolicDemand:'Genuine long construction work, costly existing mineral stock, physical stamina, energy and real temporal stability are required.',
  ownershipAndMaterialProvenance:'One physically possessed mineral and one existing moss-crystal are recorded as independently owned existing items, not made by the technique.',
  accessAndRetrievalLimit:'Only this physically present exterior human architect can reach ordinary inert items through the same personal measured spatial aperture.',
  noLivingStorage:true,noPortalTransit:true,noRealmEntry:true});
 return s.log.length-1;
}
function trained(seed=25155007){
 const s=E.newGame({seed,name:'Disposable source-observed original Rift V architect'});
 R.unified.ensurePlayer(s);
 s.player.attributes.int=30;s.player.skills.arcana.rank=5;
 A.equal(E.dispatch(s,'travel fen').ok,true);
 A.equal(E.dispatch(s,'travel ruins').ok,true);
 let attempts=0;
 while(act(s,'discipline','status').systems.rift.progress<50){
  A.ok(++attempts<50,'Actual independent Rift Sense I work must be completed');
  act(s,'discipline','practice',{system:'rift',route:'independent',
   method:attempts%2?'boundaries':'orientation',minutes:15});
 }
 A.equal(act(s,'discipline','breakthrough',
  {system:'rift',route:'independent'}).outcome,'breakthrough');
 A.equal(act(s,'rift','sense').success,true);
 let formed=false;
 for(let n=0;n<15&&!formed;n++)
  formed=act(s,'rift','anchorWork',{focus:'integrated',
   minutes:15,approach:APPROACH}).formed;
 A.equal(formed,true);
 let moved=false;
 for(let i=0;i<12&&!moved;i++){
  const origin=s.table?.riftFoldSteps?.currentPosition||BEGIN;
  moved=act(s,'rift','foldStep',{
   witnessIndex:rollWitness(s,origin,END)}).success;
 }
 A.equal(moved,true);
 A.equal(s.player.rift.step,3);
 A.equal(Fold.verify(s),true);
 let reinforced=false;
 for(let i=0;i<10&&!reinforced;i++){
  const witnessIndex=weaveWitness(s);
  reinforced=act(s,'rift','weaveBoundary',{witnessIndex,minutes:60}).success;
 }
 A.equal(reinforced,true);
 A.equal(s.player.rift.step,4);
 A.equal(Weave.support(s,SEGMENT).mitigation,1);
 A.equal(Weave.verify(s),true);
 return s;
}
{
 const unearned=E.newGame({seed:25155999,name:'No actual spatial architect'});
 const previous=E.exportGame(unearned),rng=unearned.rngState;
 A.equal(act(unearned,'rift','pocketStatus').earned,false);
 A.throws(()=>act(unearned,'rift','pocketBuild',{witnessIndex:0}),/observed|witness|Boundary|real|physically present|exterior scene/i);
 A.equal(E.exportGame(unearned),previous);
 A.equal(unearned.rngState,rng);
}
{
 const s=trained();
 const baseline={riftStep:s.player.rift.step,worldLocation:s.world.location,
  originLoad:s.player.origin.load,humanStage:s.player.humanEvolution.stage};
 const wi=buildWitness(s,'individual_stone_pocket_one');
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'rift','pocketBuild',{witnessIndex:wi,portal:'yes',dc:1}),
  /Only a real witnessed|elapsed work/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 A.throws(()=>act(s,'rift','pocketBuild',{witnessIndex:wi,minutes:180}),
  /Insufficient genuinely owned/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 // Disposable prior lawful handoff fixture: never created by the pocket.
 // The original inventory transaction engine still requires existing stock.
 s.player.inventory.moss_crystal=1;s.player.inventory.ironbloom=1;
 const beforeClock=s.world.minutes,beforeStamina=s.player.stamina;
 const built=act(s,'rift','pocketBuild',{witnessIndex:wi,minutes:180});
 A.equal(built.success,true,'Original high-skill first documented source should form a real finite pocket');
 A.equal(built.check.success,true);
 A.equal(s.player.inventory.moss_crystal||0,0);
 A.equal(s.player.inventory.ironbloom||0,0);
 A.equal(s.world.minutes,beforeClock+180);
 A.equal(s.player.stamina,beforeStamina-6);
 A.equal(s.player.rift.step,5);
 A.equal(Pocket.verify(s),true);
 A.equal(s.world.location,baseline.worldLocation);
 A.equal(s.player.origin.load,baseline.originLoad);
 A.equal(s.player.humanEvolution.stage,baseline.humanStage);
 const pocket=act(s,'rift','pocketStatus').pockets[0];
 A.equal(pocket.capacityUnits,3);
 A.equal(pocket.usedUnits,0);
 A.equal(pocket.accessible,true);
 A.equal(pocket.noPortalTransit,true);
 const state=E.exportGame(s),stateRng=s.rngState;
 A.throws(()=>act(s,'rift','pocketBuild',{witnessIndex:wi,minutes:180}),
  /reroll|original|identity/);
 A.equal(E.exportGame(s),state);A.equal(s.rngState,stateRng);
 A.throws(()=>act(s,'rift','pocketTransfer',{pocketId:pocket.id,
  item:'moss_crystal',direction:'retrieve',units:1}),/cannot contain|cannot supply|actual/i);
 s.player.inventory.clean_rations=2;
 const clock=s.world.minutes,sta=s.player.stamina;
 const store=act(s,'rift','pocketTransfer',{
  pocketId:pocket.id,item:'clean_rations',direction:'store',units:2});
 A.equal(store.success,true);
 A.equal(s.player.inventory.clean_rations||0,0);
 A.equal(s.world.minutes,clock+5);
 A.equal(s.player.stamina,sta-1);
 A.equal(act(s,'rift','pocketStatus').pockets[0].usedUnits,2);
 A.equal(Pocket.verify(s),true);
 const beforeCapacity=E.exportGame(s),beforeCapacityRng=s.rngState;
 A.throws(()=>act(s,'rift','pocketTransfer',{pocketId:pocket.id,
  item:'clean_rations',direction:'store',units:2}),/Insufficient|capacity|material/i);
 A.equal(E.exportGame(s),beforeCapacity);A.equal(s.rngState,beforeCapacityRng);
 const out=act(s,'rift','pocketTransfer',{pocketId:pocket.id,
  item:'clean_rations',direction:'retrieve',units:1});
 A.equal(out.success,true);
 A.equal(s.player.inventory.clean_rations,1);
 A.equal(act(s,'rift','pocketStatus').pockets[0].actualContents.clean_rations,1);
 A.equal(Pocket.verify(s),true);
 const same=E.importGame(E.exportGame(s));
 A.equal(Pocket.verify(same),true);
 const forged=E.importGame(E.exportGame(s));
 forged.table.realm.riftPockets.spaces[pocket.id].contents.clean_rations=99;
 A.equal(Pocket.verify(forged),false,'Original material ledger rejects invented storage');
 const tampered=E.importGame(E.exportGame(s));
 tampered.table.realm.riftPockets.attempts[0].source.materialBefore.ironbloom=100;
 A.equal(Pocket.verify(tampered),false);
 const beforeExpire=s.world.minutes;
 E.advance(s,24*60);require('../rules/world').finalizeTime(s,beforeExpire);
 A.equal(act(s,'rift','pocketStatus').pockets[0].accessible,false);
 A.equal(act(s,'rift','pocketStatus').pockets[0].physicallyTrappedAfterCollapse,true);
 A.equal(act(s,'rift','pocketStatus').pockets[0].actualContents.clean_rations,1,
  'After collapse the original item remains conserved and trapped, not cloned or recovered for free');
 const savedAfter=E.exportGame(s),laterRng=s.rngState;
 A.throws(()=>act(s,'rift','pocketTransfer',{pocketId:pocket.id,
  item:'clean_rations',direction:'retrieve',units:1}),/accessible|expired/i);
 A.equal(E.exportGame(s),savedAfter);A.equal(s.rngState,laterRng);
 for(let i=0;i<110;i++)C.event(s,'story',
  'Independent villagers discuss unrelated local repairs while the earlier pocket evidence remains retained in its original source record.',{unrelated:i});
 A.equal(s.log.length,90);
 A.equal(Pocket.verify(E.importGame(E.exportGame(s))),true);
}
console.log('Rift V: real source-witnessed finite storage, earned III/IV, consumed existing materials, world-time expiry and conserved item transfers; never a portal');
