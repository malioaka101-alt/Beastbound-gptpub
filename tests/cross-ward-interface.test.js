'use strict';
// Master §§19,26: actual Meridian distribution assists only the ORIGINAL
// separately learned Arcane Ward through a separately witnessed countertest.
// No free spell, extra casting roll, extra Mana, Ward magnitude or stage.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),C=require('../rules/core'),
 Cross=require('../rules/cross-discipline-coherence'),
 Hybrid=require('../rules/cross-ward-interface'),
 Ward=require('../rules/arcane-ward');
const {previouslyEarned,observe}=require('./cross-discipline-qi-mana-coherence.test.js');
const act=(s,system,operation,params={})=>R.act(s,{system,operation,params});
function field(s){
 const wi=observe(s,'individually_measured_qi_ward_seed','coherent');
 const r=act(s,'cross','qiManaExperiment',{witnessIndex:wi});
 A.equal(r.success,true,'Earned strong independent Qi and Arcane channels must still pass the actual check');
 A.equal(r.physicalCoherence,true);
 return s.table.crossDiscipline.qiMana.trials.at(-1).seal;
}
function wardObservation(s,coherenceSeal){
 C.event(s,'story',
  'Independent anatomists and Ward practitioners measure an actual previously learned Arcane Ward sustained by separate human Meridian Qi circulation, including an adverse-phase reversal.',{
   origin:Hybrid.WITNESS,location:s.world.location,
   techniqueId:'arcane_ward',measuredWardGeometry:s.player.arcane.geometry,
   coherenceSeal,
   originalWardFormula:'The actually learned original First-Circle Arcane Ward formula is independently reproduced with unchanged structure and real Mana demand.',
   originalMeridianDistribution:'Actual already-earned Lower Gate Qi is physically observed distributing the original Mana Core output without adding new Mana.',
   independentWardOnlyBaseline:'The same genuine already learned Ward casting matrix is independently measured without a simultaneous Meridian flow for comparison.',
   independentAdversePhaseCountertest:'A deliberately phase-shifted separate test demonstrates that Meridian interference can destabilise an otherwise sound Ward.',
   realSourceEnergyCost:'Independent Qi, Mana, living Stamina and the original Ward Mana cost are all paid separately with actual elapsed world time.',
   tissueAndCoreLimit:'Original human tissues and the unchanged First-Circle Mana Core limit the physical coherence and prevent a universal secondary Ward.',
   singleCastingOnlyLimit:'One observed stabilised Ward cast exhausts this specific original Qi-to-Ward adjustment even if the casting check fails.',
   oneRealWardRollOnly:true,noNewWardFormula:true,
   noAddedWardMagnitude:true});
 return s.log.length-1;
}
function trained(seed=26162005){
 const s=previouslyEarned(seed);
 A.equal(E.dispatch(s,'travel academy').ok,true);
 const learned=act(s,'arcane','wardStudy');
 A.equal(learned.learned,true,'A genuinely learned original Ward must preexist any hybrid stabilisation');
 A.equal(Ward.profile(s,'arcane_ward').techniqueId,'arcane_ward');
 A.equal(E.dispatch(s,'travel crossing').ok,true);
 A.equal(E.dispatch(s,'travel forest').ok,true);
 return s;
}
function foe(s){
 s.beasts.fox={id:'fox',name:'Independent living territorial fenfox',
  species:'fenfox',evolutionStage:'Base',sapience:1,
  location:s.world.location,hp:35,maxHp:35};
 s.encounter={beastId:'fox',observed:true,threat:true};
 s.beasts.fox.combatAssessment={
  beastId:'fox',species:'fenfox',evolutionStage:'Base',sapience:1,
  worldMinute:s.world.minutes,
  source:'Original independent observed living forest creature threat',
  behavior:{style:'territorial',nonlethal:true,
   canCommunicate:false,withdrawalDC:15,parleyDC:18,
   source:'Actually witnessed territorial defence without automatic violent intentions'},
  stats:{toughness:35,defense:12,stamina:8,vigor:1,will:1,
   offM:0,durM:0,sapience:1,attack:0,damage:0,boxes:[3,2,1]}
 };
 A.equal(act(s,'combat','begin',{beastId:'fox'}).verifiedIndividualProfile,true);
}
{
 const s=previouslyEarned(26162000);
 const seal=field(s),wi=wardObservation(s,seal),
  before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'cross','wardCalibrate',{witnessIndex:wi}),
  /genuinely taught|learned|Ward/i,
  'Qi–Mana coherence cannot teach or impersonate an Arcane Ward');
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=trained(),seal=field(s),wi=wardObservation(s,seal),
  initial=E.exportGame(s),rng=s.rngState;
 A.equal(act(s,'cross','wardInterfaceStatus').calibrated,0);
 A.throws(()=>act(s,'cross','wardCalibrate',
  {witnessIndex:wi,bonus:99,freeSpell:true}),
  /Only a fresh independently witnessed/);
 A.equal(E.exportGame(s),initial);A.equal(s.rngState,rng);
 const qi=s.player.qi,mana=s.player.mana,sta=s.player.stamina,
  minute=s.world.minutes;
 const out=act(s,'cross','wardCalibrate',{witnessIndex:wi});
 A.equal(out.attempted,true);A.equal(out.success,out.check.success);
 A.equal(out.success,true);
 A.equal(s.player.qi,qi-1);
 A.equal(s.player.mana,mana-1);
 A.equal(s.player.stamina,sta-1);
 A.equal(s.world.minutes,minute+10);
 A.equal(Hybrid.verify(s),true);
 A.equal(Hybrid.support(s).bonus,1);
 A.equal(act(s,'cross','wardInterfaceStatus').activeReady.length,1);
 const snapshot=E.exportGame(s),stillRng=s.rngState;
 A.throws(()=>act(s,'cross','wardCalibrate',{witnessIndex:wi}),
  /reroll|witnessed|same source/i);
 A.equal(E.exportGame(s),snapshot);A.equal(s.rngState,stillRng);
 foe(s);
 const spell=Ward.profile(s,'arcane_ward'),
  manaBefore=s.player.mana;
 const outcome=act(s,'combat','exchange',
  {intent:'ward',techniqueId:'arcane_ward'});
 const actual=outcome.ownResult;
 A.equal(actual.verifiedTechniqueId,'arcane_ward');
 A.equal(actual.sourceVerifiedQiManaWardBonus,1);
 A.equal(actual.check.modifier,spell.modifier+1);
 A.equal(actual.check.dc,spell.castingDC);
 A.equal(actual.noExtraRoll,true);
 A.equal(actual.consumedCalibrationSeal,out.calibrationSeal);
 A.equal(s.player.mana,manaBefore-actual.manaSpent,
  'The actually learned Ward separately pays its original Mana');
 A.equal(Hybrid.verify(s),true);
 A.equal(Hybrid.support(s).bonus,0,
  'The independently observed interface can affect only one actual Ward casting');
 A.equal(act(s,'cross','wardInterfaceStatus').alreadyAppliedWardCasts,1);
 const loaded=E.importGame(E.exportGame(s));
 A.equal(Hybrid.verify(loaded),true);
 A.equal(Hybrid.support(loaded).bonus,0);
 const altered=E.importGame(E.exportGame(s));
 altered.table.crossDiscipline.wardInterface.calibrations[0].source.qiSpent=0;
 A.equal(Hybrid.verify(altered),false);
 const forged=E.importGame(E.exportGame(s));
 forged.table.crossDiscipline.wardInterface.uses[0].source.bonus=50;
 A.equal(Hybrid.verify(forged),false);
 const replay=E.importGame(E.exportGame(s));
 replay.table.crossDiscipline.wardInterface.uses.push(
  structuredClone(replay.table.crossDiscipline.wardInterface.uses[0]));
 A.equal(Hybrid.verify(replay),false);
 const past=s.world.minutes;
 E.advance(s,90);require('../rules/world').finalizeTime(s,past);
 A.equal(act(s,'cross','wardInterfaceStatus').activeReady.length,0);
 A.equal(Hybrid.verify(s),true);
 for(let i=0;i<110;i++)C.event(s,'story',
  'Other independent citizens continue ordinary events while the actual witnessed Qi-to-Ward evidence remains intact.',{unrelated:i});
 A.equal(s.log.length,90);
 A.equal(Hybrid.verify(E.importGame(E.exportGame(s))),true);
}
console.log('Cross #16 Ward interface: actually earned Qi–Mana plus separately learned Ward, independently measured one-use stabilisation, real costs and single Ward roll');
