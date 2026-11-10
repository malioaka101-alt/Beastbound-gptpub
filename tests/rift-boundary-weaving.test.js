'use strict';
// Master §25: Boundary Weaving IV makes a real temporary local spatial patch.
// No chosen portals, closed-vault entry, arbitrarily awarded ward power or
// unverified global realm-state changes.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),C=require('../rules/core'),W=require('../rules/world'),
 Cosmos=require('../world/cosmology-ledger'),
 Fold=require('../rules/rift-fold-step'),Weave=require('../rules/rift-boundary-weaving'),
 Anchor=require('../rules/rift-anchors');
const act=(s,system,operation,params={})=>R.act(s,{system,operation,params});
const APPROACH='Measure the existing exterior Riftglass wardline using independent visible original bearings, orientation and real time';
const FIRST='At the personally surveyed southern wardline marker outside the sealed vault';
const NEXT='At the nearby physically open eastern wardline marker along the same safe exterior public path';
const LAST='At a third visibly reachable exterior stone marker along that physically open wardline path';
const SEGMENT='exterior_wardstone_span_01';
function earned(seed=25154001){
 const s=E.newGame({seed,name:'Disposable Rift Boundary Weaving practitioner'});
 R.unified.ensurePlayer(s);
 s.player.attributes.int=30;s.player.skills.arcana.rank=5;
 A.equal(E.dispatch(s,'travel fen').ok,true);
 A.equal(E.dispatch(s,'travel ruins').ok,true);
 let attempts=0;
 while(act(s,'discipline','status').systems.rift.progress<50){
  A.ok(++attempts<50);
  act(s,'discipline','practice',{system:'rift',method:attempts%2?'boundaries':'orientation',
   route:'independent',minutes:15});
 }
 A.equal(act(s,'discipline','breakthrough',{system:'rift',route:'independent'}).outcome,'breakthrough');
 A.equal(act(s,'rift','sense').success,true);
 let formed=false;
 for(let n=0;n<15&&!formed;n++){
  formed=act(s,'rift','anchorWork',{focus:'integrated',minutes:15,
   approach:APPROACH}).formed;
 }
 A.equal(formed,true);
 A.equal(Anchor.earned(s).id,Anchor.SITE);
 let moved=false;
 for(let i=0;i<10&&!moved;i++){
  const from=s.table.riftFoldSteps?.currentPosition||FIRST;
  const index=foldWitness(s,from,NEXT);
  moved=act(s,'rift','foldStep',{witnessIndex:index}).success;
 }
 A.equal(moved,true,'Genuine local Fold Step must be earned before Boundary Weaving');
 A.equal(s.player.rift.step,3);
 A.equal(Fold.verify(s),true);
 return s;
}
function foldWitness(s,from,to,segmentId){
 C.event(s,'story','The independent field survey confirms measured free local geometry and personally witnessed source-specific physical limits to human folding.',{
  origin:Fold.WITNESS,anchorId:Anchor.SITE,location:s.world.location,
  fromObservedPosition:from,toObservedPosition:to,
  measuredDistanceMetres:3,safeRangeMetres:5,
  lineOfEffectClear:true,crossesSealedBoundary:false,
  crossesWorldLocation:false,
  lineOfEffectMeasurement:'An actual directly visible unobstructed measured line between exterior stones is confirmed before this original local displacement.',
  independentObstructionTest:'An independent solid-stone obstruction and known vault wardline countertest show movement cannot pass through the sealed wall.',
  energyAndPhysicalLimit:'Actual living Stamina, finite spatial acuity and risk of shear constrain the short individual local displacement.',
  measuredPressureCountertest:'An original survey tests how independently changing Riftglass boundary pressure may overpower the fold.',
  ...(segmentId?{segmentId}:{})});
 return s.log.length-1;
}
function witness(s,mode='reinforce',segmentId=SEGMENT){
 C.event(s,'story','An independently measured local physical boundary segment responds to a genuine temporary spatial weaving experiment at the open exterior wardline.',{
  origin:Weave.WITNESS,boundaryId:'riftglass_wardline',
  segmentId,mode,location:s.world.location,areaSquareMetres:4,
  supportMinutes:180,
  originalSpatialFabric:'The precise public exterior micro-boundary is observed and surveyed separately from the locked Riftglass vault and the full realm boundary.',
  observedLocalChange:'One measured outer wardstone span briefly develops a real local reinforcement or directional spatial contour under the practitioner\'s effort.',
  independentPressureCountertest:'A separate high-pressure exterior stone response exposes finite spatial reinforcement failure rather than granting protected portal access.',
  actualEnergyLimit:'Original living Stamina, measured Arcana, bodily strain and ordinary passing world time constrain the temporary physical boundary layer.',
  crossesBoundary:false,opensPortal:false,globalSealChanged:false});
 return s.log.length-1;
}
{
 const s=E.newGame({seed:25154999,name:'Not actually an earned Rift weaver'});
 const saved=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'rift','weaveBoundary',{witnessIndex:0}),/Fold Step|witness|real/i);
 A.equal(E.exportGame(s),saved);A.equal(s.rngState,rng);
}
{
 const s=earned();
 A.equal(act(s,'rift','weaveStatus').earned,false);
 const initial=s.player.rift.step,originalLocation=s.world.location;
 let formed=null;
 for(let n=0;n<10&&!formed;n++){
  const i=witness(s),clock=s.world.minutes,
   stamina=s.player.stamina;
  const a=act(s,'rift','weaveBoundary',{witnessIndex:i,minutes:60});
  A.equal(a.success,a.check.success);
  A.equal(a.noPortalOpened,true);A.equal(a.noGlobalWorldSealChanged,true);
  A.equal(s.world.minutes,clock+60);
  A.equal(s.player.stamina,stamina-4);
  A.equal(s.world.location,originalLocation);
  A.equal(Weave.verify(s),true);
  formed=a.success?a:null;
 }
 A.ok(formed,'Earned Rift Anchor III allows a genuinely checked local boundary microstructure');
 A.equal(initial,3);A.equal(s.player.rift.step,4);
 A.equal(formed.mode,'reinforce');A.equal(formed.segmentId,SEGMENT);
 A.equal(Weave.support(s,SEGMENT).mitigation,1);
 A.equal(act(s,'rift','weaveStatus').localLayers.length,1);
 A.equal((Cosmos.peek(s)||Cosmos.seed()).boundaries.riftglass_wardline.noProvenPassage,true);
 A.equal(s.table.realm.mythic.riftglass_vault.seal>=0,true);
 const usedWitness=witness(s),before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'rift','weaveBoundary',{witnessIndex:usedWitness,mode:'open-portal',result:true}),
  /real witnessed/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const nextIndex=foldWitness(s,NEXT,LAST,SEGMENT),
  prior=s.table.riftFoldSteps.currentPosition;
 const result=act(s,'rift','foldStep',{witnessIndex:nextIndex});
 A.equal(result.localBoundarySupport,1,
  'Actually woven and currently active matching boundary protects one genuine later local Fold Step');
 A.equal(result.check.dc,
  16+Math.ceil(result.meters/4)+
  s.table.riftFoldSteps.attempts.at(-1).source.riskAdjustment-
  1+Math.floor(s.table.riftFoldSteps.attempts.at(-1).source.strainBefore/12));
 A.equal(result.from,prior);
 A.equal(Fold.verify(s),true);
 A.equal(Weave.verify(s),true);
 const old=E.importGame(E.exportGame(s));
 A.equal(Fold.verify(old),true);
 A.equal(Weave.verify(old),true);
 const altered=E.importGame(E.exportGame(s));
 altered.table.realm.boundaryWeaves.attempts[0].source.area=99;
 A.equal(Weave.verify(altered),false);
 const forged=E.importGame(E.exportGame(s));
 forged.table.riftFoldSteps.attempts.at(-1).source.weaveMitigation=4;
 A.equal(Fold.verify(forged),false);
 const from=s.world.minutes;
 E.advance(s,400);W.finalizeTime(s,from);
 A.equal(act(s,'rift','weaveStatus').localLayers.length,0,
  'World time naturally expires the real small physical reinforcement');
 A.equal(Weave.support(s,SEGMENT).mitigation,0);
 A.equal(Fold.verify(s),true,'Previously earned local Fold Step retains original temporary protection source after expiry');
 A.equal(Weave.verify(s),true);
 for(let j=0;j<110;j++)C.event(s,'story',
  'Independent public workers continue making unrelated ordinary observations near the exterior road.',{sequence:j});
 A.equal(s.log.length,90);
 A.equal(Weave.verify(E.importGame(E.exportGame(s))),true);
}
console.log('Rift IV: genuine temporary local Boundary Weaving with earned Fold III, source-measured segment, real roll/time/Stamina and matched short Fold support');
