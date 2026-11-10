'use strict';
// §25 first true Step III short Fold Step: GM-witnessed local line-of-effect,
// no selected hidden map, sealed boundary crossing or unearned portal.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),C=require('../rules/core'),
 Fold=require('../rules/rift-fold-step'),Anchors=require('../rules/rift-anchors');
const act=(s,system,op,params={})=>R.act(s,{system,operation:op,params});
const APPR='Measure visible original exterior Riftglass wardline bearings with independent physiological equilibrium and local geometric sources';
function earnedAnchor(seed=25151001){
 const s=E.newGame({seed,name:'Disposable genuine Rift Fold cartographer',path:'undecided'});
 R.unified.ensurePlayer(s);
 s.player.attributes.int=30;s.player.skills.arcana.rank=5;
 A.equal(E.dispatch(s,'travel fen').ok,true);
 A.equal(E.dispatch(s,'travel ruins').ok,true);
 let tries=0;
 while(act(s,'discipline','status').systems.rift.progress<50){
  A.ok(++tries<50,'Original Rift Sense needs its genuine independent earned practice');
  act(s,'discipline','practice',{system:'rift',route:'independent',
   method:tries%2?'boundaries':'orientation',minutes:15});
 }
 A.equal(act(s,'discipline','breakthrough',{system:'rift',route:'independent'}).outcome,'breakthrough');
 A.equal(s.player.rift.step,1);
 const sense=act(s,'rift','sense');
 A.equal(sense.success,true);
 let ready=false;
 for(let n=0;n<15&&!ready;n++){
  const attempt=act(s,'rift','anchorWork',{focus:'integrated',
   minutes:15,approach:APPR});
  ready=attempt.formed;
 }
 A.equal(ready,true,'Original personally earned Rift Anchor Marking must be formed');
 A.equal(Anchors.earned(s).id,Anchors.SITE);
 A.equal(s.player.rift.step,2);
 return s;
}
function observe(s,from,to,metres=4){
 C.event(s,'story','A real local geometric surveyor witnesses the original human Fold Step line-of-effect and the independent physical countertest.',{
  origin:Fold.WITNESS,location:s.world.location,
  anchorId:Anchors.SITE,fromObservedPosition:from,
  toObservedPosition:to,measuredDistanceMetres:metres,
  safeRangeMetres:Math.min(12,metres+1),
  lineOfEffectClear:true,crossesSealedBoundary:false,
  crossesWorldLocation:false,
  lineOfEffectMeasurement:'The physically present exterior stone path remains visibly unobstructed between these two measured short-distance positions.',
  independentObstructionTest:'A separate wall-side sightline and existing physical ward test would interrupt the fold before sealed or blocked geometry.',
  energyAndPhysicalLimit:'Original Stamina, Arcane handling, spatial orientation and severe shear risk constrain this actual human displacement.',
  measuredPressureCountertest:'Independent survey shows actual changing ward pressure could overwhelm safe local folding without permitting portal travel.'});
 return s.log.length-1;
}
{
 const s=E.newGame({seed:25151009,name:'Rift Fold without anchor',path:'undecided'});
 const data=E.exportGame(s),rng=s.rngState;
 A.equal(act(s,'rift','foldStatus').ready,false);
 A.throws(()=>act(s,'rift','foldStep',{witnessIndex:0}),/earned original Step II|observed|witness/i);
 A.equal(E.exportGame(s),data);A.equal(s.rngState,rng);
}
{
 const s=earnedAnchor(),origin='At the surveyed south exterior milestone beside the Riftglass wardline',
 destination='At the nearby unobstructed north exterior milestone on the same safe public path';
 A.equal(act(s,'rift','foldStatus').ready,true);
 const data=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'rift','foldStep',{witnessIndex:0,destination:'secret gate',dc:2}),
  /witness|real prior/);
 A.equal(E.exportGame(s),data);A.equal(s.rngState,rng);
 let succeeded=false;
 for(let n=0;n<10&&!succeeded;n++){
  const from=s.table.riftFoldSteps?.currentPosition||origin;
  const wi=observe(s,from,destination,4),beforeClock=s.world.minutes,
   stamina=s.player.stamina,previousRng=s.rngState,
   loc=s.world.location;
  const result=act(s,'rift','foldStep',{witnessIndex:wi});
  A.equal(result.attempted,true);
  A.equal(result.success,result.check.success);
  A.equal(result.meters,4);
  A.equal(result.staminaSpent,2);
  A.equal(result.elapsedMinutes,5);
  A.equal(s.world.minutes,beforeClock+5);
  A.equal(s.player.stamina,stamina-2);
  A.equal(s.world.location,loc,'No hidden portal or cross-location travel is awarded');
  A.notEqual(s.rngState,previousRng,'The original actual d20 decided movement');
  A.equal(Fold.verify(s),true);
  const saved=E.exportGame(s),remainingRng=s.rngState;
  A.throws(()=>act(s,'rift','foldStep',{witnessIndex:wi}),
   /rerolled|original|same local/i);
  A.equal(E.exportGame(s),saved);
  A.equal(s.rngState,remainingRng);
  succeeded=result.success;
 }
 A.equal(succeeded,true,'The original skilled anchored spatial researcher must be capable of real short movement');
 A.equal(s.player.rift.step,3);
 A.equal(s.table.riftFoldSteps.currentPosition,destination);
 A.equal(s.table.riftFoldSteps.formedPositions.length,1);
 A.equal(Fold.verify(s),true);
 const loaded=E.importGame(E.exportGame(s));
 A.equal(Fold.verify(loaded),true);
 const previous=E.exportGame(s),prevRng=s.rngState;
 const wrongStart=observe(s,'A different unrelated hidden vaulted chamber',
  'A destination that was never actually reachable from the original public path',4);
 const state=E.exportGame(s),stateRng=s.rngState;
 A.throws(()=>act(s,'rift','foldStep',{witnessIndex:wrongStart}),
  /starting position disagrees/);
 A.equal(E.exportGame(s),state);A.equal(s.rngState,stateRng);
 const secondDest='At another measured unobstructed cairn on the same surveyed exterior footpath';
 const second=observe(s,destination,secondDest,3);
 const secondResult=act(s,'rift','foldStep',{witnessIndex:second});
 A.equal(secondResult.from,destination);
 A.equal(Fold.verify(s),true);
 if(secondResult.success)
  A.equal(s.table.riftFoldSteps.currentPosition,secondDest);
 A.equal(s.player.rift.step,3);
 const fake=E.importGame(E.exportGame(s));
 fake.table.riftFoldSteps.attempts[0].source.distance=90;
 A.equal(Fold.verify(fake),false);
 const forged=E.importGame(E.exportGame(s));
 forged.table.riftFoldSteps.formedPositions[0].description='secret vault accessed';
 A.equal(Fold.verify(forged),false);
 const rotated=E.importGame(E.exportGame(s));
 for(let i=0;i<110;i++)C.event(rotated,'story',
  'Independent nearby people record ordinary unrelated public stonework details without recreating an old Fold Step trial.',{unrelated:i});
 A.equal(rotated.log.length,90);
 A.equal(Fold.verify(rotated),true,'Earlier original witnessed spatial movement persists beyond a short narrative history');
 A.equal(E.exportGame(E.importGame(E.exportGame(rotated))),E.exportGame(rotated));
 A.notEqual(previous,E.exportGame(s));A.equal(typeof prevRng,'number');
}
console.log('Rift #15 first Fold Step III: true source-observed local movement, earned Anchor II, original d20, stamina/time/shear and immutable local-position proofs');
