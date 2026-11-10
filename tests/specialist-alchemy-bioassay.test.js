'use strict';
// Master §26: actual independently identified reed specimen, destructive
// bioassay and controlled source-witnessed real poultice variant. The result
// is the established original healing_balm, not a new invented miracle drug.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),C=require('../rules/core'),W=require('../rules/world'),
 Alchemy=require('../rules/specialist-alchemy-bioassay');
const act=(s,op,params={})=>
 R.act(s,{system:'specialist',operation:op,params});
function bench(seed=26165010){
 const s=E.newGame({seed,name:'Disposable original botanical alchemy and medicine lab',background:'fieldworker'});
 R.unified.ensurePlayer(s);
 A.equal(E.dispatch(s,'travel academy').ok,true);
 s.player.attributes.int=30;s.player.skills.crafting.rank=5;
 s.player.skills.medicine.rank=5;
 s.player.inventory.marsh_reed=8;
 s.player.inventory.clean_rations=3;
 return s;
}
function witnessAssay(s,specimenId){
 C.event(s,'story','Independent botanists observe original destructive reed microscopy, actual provenance and clinical contamination countertests at a known clean workbench.',{
  origin:Alchemy.ASSAY,location:s.world.location,
  specimenId,material:'marsh_reed',
  independentMaterialIdentification:'An independently obtained actual regional marsh reed specimen is identified by its true vascular structures and original pharmacognosy markers.',
  actualHabitatAndOwnership:'The wetland specimen was physically possessed through lawful field gathering or handoff and has a recorded non-destructive habitat source.',
  independentAdverseReactionTest:'A separate controlled adulterated-reed specimen exhibits contaminant precipitate and fails the original safe-reaction baseline.',
  chemicalAndEnergyLimits:'This observed plant assay uses finite cellular material, genuine controlled temperature, worktime and existing physical human stamina.',
  disposalAndPatientSafety:'A real waste vessel receives the spent contaminated biological specimen; this assay provides no patient treatment or unearned organ change.',
  sampleMicroscopy:'The visibly consumed independent reed cross-section shows individual plant structures and a chemically measurable nonuniform tissue fraction.',
  measuredContaminationBaseline:'A separate sterile reagent-only sample establishes actual background contamination before the sample is destructively tested.',
  purityRangeAndUncertainty:'The measured regional reed sample has finite purity uncertainty and a documented limit on extrapolation to other habitats or magical biology.',
  requiresTrueDestructiveSample:true,noInventedMedicine:true,
  noUnverifiedHumanTransformation:true});
 return s.log.length-1;
}
function witnessReaction(s,specimenId,assayId){
 C.event(s,'story','Independent clinicians witness the previously assayed original reed reaction and separate non-reactive control before safely preparing a known medical poultice.',{
  origin:Alchemy.REACTION,location:s.world.location,
  specimenId,assayId,material:'marsh_reed',
  output:'healing_balm',inputs:{marsh_reed:2,clean_rations:1},
  independentMaterialIdentification:'The actual previously assayed marsh reed and genuinely owned ration binder are separately identified and weighed before the controlled original reaction.',
  actualHabitatAndOwnership:'All additional reed and ration materials are actually held at the local clean clinic rather than assumed from an assay or an invented trade.',
  independentAdverseReactionTest:'An independent overheated reed sample produces unacceptable residue and must be discarded rather than prescribed to the patient.',
  chemicalAndEnergyLimits:'The actual controlled poultice preparation consumes real botanical biomass, binder, worktime, clean water handling and living human stamina.',
  disposalAndPatientSafety:'The operator discards unsafe precipitates at the real worksite and cannot assume this known balm will repair serious or Critical wounds.',
  measuredReactionTemperature:'A genuinely measured warm preparation window limits the active reed extract before thermal degradation of the original plant chemistry.',
  independentReactionTiming:'The separate reaction observer tracks seventy minutes of real stirring, heating, binder incorporation and cooling.',
  separateInactiveControl:'A matched aliquot without botanical reactant does not form the measurable active fraction, despite using the same clean container.',
  actualTherapeuticMechanism:'The verified ordinary healing balm retains its existing bounded topical effect on one Light wound and no additional healing grade.',
  noInventedMedicine:true,noUnverifiedHumanTransformation:true,
  noExtraHealingStrength:true});
 return s.log.length-1;
}
{
 const s=E.newGame({seed:26165000,name:'Unwitnessed alchemy'});
 const saved=E.exportGame(s),rng=s.rngState;
 A.equal(act(s,'alchemyStatus').assays,0);
 A.throws(()=>act(s,'alchemyAssay',{witnessIndex:0}),/clean human medical bench|witness/i);
 A.equal(E.exportGame(s),saved);A.equal(s.rngState,rng);
}
{
 const s=bench(),original={
  worldLocation:s.world.location,
  humanStage:s.player.humanEvolution.stage,
  originLoad:s.player.origin.load,
  mana:s.player.mana,qi:s.player.qi,
  circles:s.player.arcane.circles};
 const assayed='original_wetland_reed_sample_01';
 const idx=witnessAssay(s,assayed);
 const first=s.player.inventory.marsh_reed,sta=s.player.stamina,
  start=s.world.minutes,rng=s.rngState;
 const old=E.exportGame(s);
 A.throws(()=>act(s,'alchemyAssay',{witnessIndex:idx,
  result:'miracle',dc:1}),/witnessed real reagent assay/);
 A.equal(E.exportGame(s),old);A.equal(s.rngState,rng);
 const assay=act(s,'alchemyAssay',{witnessIndex:idx});
 A.equal(assay.attempted,true);
 A.equal(assay.sourceVerified,assay.check.success);
 A.equal(assay.sourceVerified,true,
  'Independently source-tested skilled assay resolves through genuine original check');
 A.equal(s.player.inventory.marsh_reed,first-1);
 A.equal(s.player.stamina,sta-2);
 A.equal(s.world.minutes,start+35);
 A.notEqual(s.rngState,rng);
 A.equal(act(s,'alchemyStatus').availableProfiles.length,1);
 A.equal(Alchemy.verify(s),true);
 const committed=E.exportGame(s),committedRng=s.rngState;
 A.throws(()=>act(s,'alchemyAssay',{witnessIndex:idx}),
  /already been assayed|actual reagent/i);
 A.equal(E.exportGame(s),committed);A.equal(s.rngState,committedRng);
 const wi=witnessReaction(s,'controlled_original_poultice_trial_01',assayed);
 const priorRefine=E.exportGame(s),priorRng=s.rngState;
 A.throws(()=>act(s,'alchemyRefine',{witnessIndex:wi,
  assayId:'invented_other_specimen',success:true}),
  /assayed reagent/);
 A.equal(E.exportGame(s),priorRefine);A.equal(s.rngState,priorRng);
 const oldReed=s.player.inventory.marsh_reed,
  oldFood=s.player.inventory.clean_rations,
  oldBalm=s.player.inventory.healing_balm||0,
  oldStamina=s.player.stamina,oldMinutes=s.world.minutes;
 const refined=act(s,'alchemyRefine',{witnessIndex:wi,assayId:assayed});
 A.equal(refined.attempted,true);
 A.equal(refined.success,refined.check.success);
 A.equal(refined.success,true,'Original confirmed high-skill controlled reaction can produce a genuine known medicine');
 A.deepEqual(refined.actualOutput,{healing_balm:1});
 A.equal(s.player.inventory.marsh_reed,oldReed-2);
 A.equal(s.player.inventory.clean_rations,oldFood-1);
 A.equal(s.player.inventory.healing_balm,oldBalm+1);
 A.equal(s.player.stamina,oldStamina-3);
 A.equal(s.world.minutes,oldMinutes+70);
 A.equal(refined.assayConsumed,true);
 A.equal(refined.noNewWoundRules,true);
 A.equal(Alchemy.verify(s),true);
 A.equal(act(s,'alchemyStatus').successfulControlledRefinements,1);
 A.equal(act(s,'alchemyStatus').availableProfiles.length,0);
 const completed=E.exportGame(s),completedRng=s.rngState;
 A.throws(()=>act(s,'alchemyRefine',{witnessIndex:wi,assayId:assayed}),
  /unused successful reagent assay/);
 A.equal(E.exportGame(s),completed);A.equal(s.rngState,completedRng);
 A.equal(s.player.humanEvolution.stage,original.humanStage);
 A.equal(s.player.origin.load,original.originLoad);
 A.equal(s.player.arcane.circles,original.circles);
 A.equal(s.player.mana,original.mana);A.equal(s.player.qi,original.qi);
 A.equal(s.world.location,original.worldLocation);
 const loaded=E.importGame(E.exportGame(s));
 A.equal(Alchemy.verify(loaded),true);
 const changed=E.importGame(E.exportGame(s));
 changed.table.specialistAlchemy.assays[0].source.materialUsed=0;
 A.equal(Alchemy.verify(changed),false);
 const fakeMedicine=E.importGame(E.exportGame(s));
 fakeMedicine.table.specialistAlchemy.refinements[0].source.outputAfter+=2;
 A.equal(Alchemy.verify(fakeMedicine),false);
 const falseResult=E.importGame(E.exportGame(s));
 falseResult.table.specialistAlchemy.refinements[0].source.check.roll=20;
 A.equal(Alchemy.verify(falseResult),false);
 // The known ordinary field recipe remains independent: this variant does
 // not impose its extra assay as a compulsory fee or universal gate.
 const conventional=R.act(s,{system:'craft',operation:'fieldPoultice',params:{}});
 A.equal(conventional.recipe,'field_poultice');
 A.equal(conventional.noExtraRoll,true);
 A.equal(Alchemy.verify(s),true);
 for(let n=0;n<110;n++)C.event(s,'story',
  'Independent hospital workers describe unrelated ordinary real medicine and botanical research without inventing past reagent material.',{sequence:n});
 A.equal(s.log.length,90);
 A.equal(Alchemy.verify(E.importGame(E.exportGame(s))),true);
}
{
 const s=bench(26165013);
 s.player.attributes.int=1;s.player.skills.crafting.rank=0;
 s.player.skills.medicine.rank=0;
 const i=witnessAssay(s,'weak_independent_reed_assay_01');
 const before=s.player.inventory.marsh_reed,clock=s.world.minutes,rng=s.rngState;
 const out=act(s,'alchemyAssay',{witnessIndex:i});
 A.equal(out.sourceVerified,out.check.success);
 A.equal(s.player.inventory.marsh_reed,before-1);
 A.equal(s.world.minutes,clock+35);
 A.notEqual(s.rngState,rng);
 A.equal(Alchemy.verify(s),true);
}
console.log('Specialist #16 Alchemy: real destructive original plant bioassay, separate verified controlled reaction, conserved owned stock, exactly one check per stage and original existing bounded medicine output');
