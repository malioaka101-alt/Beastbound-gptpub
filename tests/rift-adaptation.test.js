'use strict';
// §25 original personal Rift VI: real external spatial-pressure acclimatisation
// affects the *same* living human's energy and biology, not copied organs,
// portal entry or universal immunity. Entire fixture is disposable.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),C=require('../rules/core'),W=require('../rules/world'),
 Anchor=require('../rules/rift-anchors'),Fold=require('../rules/rift-fold-step'),
 Weave=require('../rules/rift-boundary-weaving'),
 Pocket=require('../rules/rift-pocket-architecture'),
 Adapt=require('../rules/rift-adaptation');
const act=(s,system,op,p={})=>R.act(s,{system,operation:op,params:p});
let independentlyEarnedAdaptedSnapshot=null;
const FROM='At an actual previously measured original open outer Riftglass wardstone';
const TO='At a separately measured nearby public exterior path stone on the same side of the wards';
const SEG='adaptation_ward_span_01',POCKET_ID='adaptation_pocket_one';
const APPROACH='Careful independent physical surveying measures only original exterior coordinates and spatial pressure, never vault entry';
function witnessFold(s,from){
 C.event(s,'story','Independent visible stone geometry is surveyed at the actual existing exterior Riftglass anchor with a separate wall obstruction check.',{
  origin:Fold.WITNESS,location:s.world.location,anchorId:Anchor.SITE,
  fromObservedPosition:from,toObservedPosition:TO,
  measuredDistanceMetres:3,safeRangeMetres:5,
  lineOfEffectClear:true,crossesSealedBoundary:false,
  crossesWorldLocation:false,
  lineOfEffectMeasurement:'The original outer terrain contains a measured directly visible unobstructed three-metre stone pathway.',
  independentObstructionTest:'Separately surveyed vault walls and an actual wardline block any unearned movement through solid stone.',
  energyAndPhysicalLimit:'Living stamina, body shear resistance and original arcane spatial precision constrain this ordinary human.',
  measuredPressureCountertest:'An independent actual environmental reading confirms external pressure can disrupt the local Fold Step.'});
 return s.log.length-1;
}
function witnessWeave(s){
 C.event(s,'story','Separate original field observers measure an external stable patch with limited real physical duration and a realistic failure countertest.',{
  origin:Weave.WITNESS,location:s.world.location,
  boundaryId:'riftglass_wardline',segmentId:SEG,mode:'reinforce',
  areaSquareMetres:3,supportMinutes:360,
  originalSpatialFabric:'A small independent outer wardstone patch is physically observed rather than an assumed open rift.',
  observedLocalChange:'Ordinary existing exterior spatial pressure responds locally to actual temporary reinforcement.',
  independentPressureCountertest:'A different observed shear angle can collapse the local patch without releasing the full vault wards.',
  actualEnergyLimit:'Genuine arcane precision, original bodily stamina and passing world time limit the physical reinforcement.',
  crossesBoundary:false,opensPortal:false,globalSealChanged:false});
 return s.log.length-1;
}
function witnessPocket(s){
 C.event(s,'story','Independent researchers measure an original small inert-item space, the real finite stability of its anchor and materials already owned.',{
  origin:Pocket.WITNESS,location:s.world.location,
  boundaryId:'riftglass_wardline',segmentId:SEG,
  pocketId:POCKET_ID,capacityUnits:2,lifetimeHours:24,
  materials:{ironbloom:1,moss_crystal:1},
  originalSpatialVolume:'A measured finite two-unit inert-item void remains tied to a known outward-facing physical stone anchor.',
  originalStableAnchoring:'A real still-reinforced external wardstone controls only this small separately surveyed spatial storage cavity.',
  independentCollapseCountertest:'Independent interference and time checks predict actual disappearance of the cavity, leaving unretrieved items trapped.',
  measuredEnergyAndMetabolicDemand:'Existing metal, crystals, original living stamina, arcane handling and original world time must be paid.',
  ownershipAndMaterialProvenance:'Two separately physically possessed components were truly obtained before the construction action.',
  accessAndRetrievalLimit:'Only small inert stock is accessible at this actual exterior location; nobody can enter another realm.',
  noLivingStorage:true,noPortalTransit:true,noRealmEntry:true});
 return s.log.length-1;
}
function observe(s){
 C.event(s,'story','Original independent human physiological and energetic response to real Riftglass spatial pressure is measured against a baseline and countertest.',{
  origin:Adapt.WITNESS,location:s.world.location,
  boundaryId:'riftglass_wardline',environment:'spatial-pressure',
  measuredIndividualHumanResponse:'The actual human heart rate, vestibular reflex and connective-tissue strain change measurably during spatial pressure exposure.',
  observedEnergyRegulation:'The individual original human nervous and arcane-energy pathways adjust measurable throughput under the existing spatial pressure.',
  actualMetabolicSupply:'Real oxygen, blood, food, finite stamina and rest bound the original human adaptation without creating magical energy.',
  independentUnaidedBaseline:'A separately recorded ordinary human baseline under the same terrain shows greater disorientation without prior exposure.',
  independentShearCountertest:'A separate sharper spatial shear pressure countertest still overwhelms tissue and can cause real harmful disorientation.',
  recoveryObservation:'After exposure the human body needs actual rest, perfusion and ordinary tissue repair before the next source-specific trial.',
  noSpeciesConversion:true,noPortalAccess:true,
  cannotNegateExtremePressure:true});
 return s.log.length-1;
}
function trained(seed=25156051){
 const s=E.newGame({seed,name:'Disposable individual original Rift pressure adaptation'});
 R.unified.ensurePlayer(s);
 s.player.attributes.int=30;s.player.attributes.con=30;
 s.player.skills.arcana.rank=5;
 A.equal(E.dispatch(s,'travel fen').ok,true);
 A.equal(E.dispatch(s,'travel ruins').ok,true);
 let n=0;
 while(act(s,'discipline','status').systems.rift.progress<50){
  A.ok(++n<50,'Real independent Rift Sense I work required');
  act(s,'discipline','practice',{system:'rift',route:'independent',
   method:n%2?'boundaries':'orientation',minutes:15});
 }
 A.equal(act(s,'discipline','breakthrough',{system:'rift',route:'independent'}).outcome,'breakthrough');
 A.equal(act(s,'rift','sense').success,true);
 let anchored=false;
 for(let i=0;i<15&&!anchored;i++)
  anchored=act(s,'rift','anchorWork',{focus:'integrated',minutes:15,approach:APPROACH}).formed;
 A.equal(anchored,true);
 let folded=false;
 for(let i=0;i<15&&!folded;i++){
  const from=s.table.riftFoldSteps?.currentPosition||FROM;
  folded=act(s,'rift','foldStep',{witnessIndex:witnessFold(s,from)}).success;
 }
 A.equal(folded,true);
 let woven=false;
 for(let i=0;i<12&&!woven;i++)
  woven=act(s,'rift','weaveBoundary',{witnessIndex:witnessWeave(s),minutes:60}).success;
 A.equal(woven,true);
 A.equal(Weave.support(s,SEG).mitigation,1);
 // This is an explicit disposable pre-existing owned material fixture,
 // never a free gift from Rift Practice.
 s.player.inventory.ironbloom=1;s.player.inventory.moss_crystal=1;
 A.equal(act(s,'rift','pocketBuild',{witnessIndex:witnessPocket(s),minutes:180}).success,true);
 A.equal(s.player.rift.step,5);
 A.equal(Pocket.verify(s),true);
 return s;
}
{
 const none=E.newGame({seed:25156999,name:'No Rift pressure expertise'});
 const old=E.exportGame(none),rng=none.rngState;
 A.equal(act(none,'rift','adaptationStatus').earned,false);
 A.throws(()=>act(none,'rift','adaptExposure',{witnessIndex:0}),/physically present|anchor|Rift|witness/i);
 A.equal(E.exportGame(none),old);A.equal(none.rngState,rng);
}
{
 const s=trained(),original={
  location:s.world.location,originLoad:s.player.origin.load,
  humanStage:s.player.humanEvolution.stage,
  bodyCycles:structuredClone(s.player.body.cycles)};
 const i=observe(s),snapshot=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'rift','adaptExposure',{witnessIndex:i,success:true,portal:true}),
  /Only a current independently observed/);
 A.equal(E.exportGame(s),snapshot);A.equal(s.rngState,rng);
 let successes=0;
 for(let a=0;a<12&&successes<2;a++){
  const wi=observe(s),clock=s.world.minutes,sta=s.player.stamina;
  const out=act(s,'rift','adaptExposure',{witnessIndex:wi,minutes:60});
  A.equal(out.attempted,true);A.equal(out.success,out.check.success);
  A.equal(s.world.minutes,clock+60);
  A.equal(s.player.stamina,Math.min(s.player.maxStamina,
   sta-4+5*(Math.floor(s.world.minutes/1440)-Math.floor(clock/1440))),
   'Original Stamina cost remains real while the existing world day may independently restore it');
  A.equal(out.noOtherRealmImmunity,true);
  A.equal(out.noPortalTravel,true);
  A.equal(Adapt.verify(s),true);
  if(out.success)successes++;
  const state=E.exportGame(s),afterRng=s.rngState;
  A.throws(()=>act(s,'rift','adaptExposure',{witnessIndex:wi,minutes:60}),
   /cannot reroll/);
  A.equal(E.exportGame(s),state);A.equal(s.rngState,afterRng);
 }
 A.equal(successes,2,'Two genuinely independent successful physiological exposures establish this original human adaptation');
 A.equal(s.player.rift.step,6);
 A.equal(act(s,'rift','adaptationStatus').earned,true);
 A.equal(act(s,'rift','adaptationStatus').observedHumanPressureTolerance,1);
 A.equal(Adapt.pressureTolerance(s),1);
 A.equal(s.world.location,original.location);
 A.equal(s.player.origin.load,original.originLoad);
 A.equal(s.player.humanEvolution.stage,original.humanStage);
 A.deepEqual(s.player.body.cycles,original.bodyCycles);
 // Recover actual original human exertion through real physical travel and
 // a full settlement night's sleep, never a unit-test stamina gift.
 if(s.player.stamina<4){
  A.equal(E.dispatch(s,'travel fen').ok,true);
  A.equal(E.dispatch(s,'travel crossing').ok,true);
  A.equal(act(s,'health','sleep',{hours:8}).sleptHours,8);
  A.equal(E.dispatch(s,'travel fen').ok,true);
  A.equal(E.dispatch(s,'travel ruins').ok,true);
 }
 const wi=observe(s),before=s.world.minutes;
 const after=act(s,'rift','adaptExposure',{witnessIndex:wi,minutes:60});
 A.equal(s.world.minutes,before+60);
 A.equal(after.check.dc,18+
  s.table.realm.riftAdaptation.attempts.at(-1).source.riskAdjustment+
  Math.floor(s.table.realm.riftAdaptation.attempts.at(-1).source.strainBefore/12)-1,
  'The genuinely adapted human earns only a narrow bounded pressure adjustment on later independently observed exposure');
 A.equal(s.player.rift.step,6);
 A.equal(Adapt.verify(s),true);
 const intact=E.importGame(E.exportGame(s));
 A.equal(Adapt.verify(intact),true);
 const forged=E.importGame(E.exportGame(s));
 forged.table.realm.riftAdaptation.attempts[0].source.progressAfter=2;
 A.equal(Adapt.verify(forged),false,'A forged human pressure tolerance stage cannot bypass observed source checks');
 const fakeRoll=E.importGame(E.exportGame(s));
 fakeRoll.table.realm.riftAdaptation.attempts[0].source.check.roll=20;
 A.equal(Adapt.verify(fakeRoll),false);
 for(let j=0;j<110;j++)C.event(s,'story',
  'Other observers continue ordinary independent public stonework and surveying over a long later history.',{unrelated:j});
 A.equal(s.log.length,90);
 A.equal(Adapt.verify(E.importGame(E.exportGame(s))),true);
 independentlyEarnedAdaptedSnapshot=E.exportGame(s);
}
module.exports={freshSourceEarnedAdaptedGame:()=>
 E.importGame(independentlyEarnedAdaptedSnapshot)};
console.log('Rift VI: genuinely witnessed individual human biological/energetic pressure adaptation after earned V, real time/stamina/d20/injury and narrow one-point tolerance');
