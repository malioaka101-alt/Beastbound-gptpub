'use strict';
// Master §26: a physically owned mineral and independently measured
// vocabulary/layers produce one genuine bounded local signal, NOT a universal
// spell, compulsory tutor, remote spy or infinite renewable magic supply.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),C=require('../rules/core'),W=require('../rules/world'),
 Sigils=require('../rules/specialist-rune-sigils'),
 Circle=require('../rules/arcane-spark');
const {previouslyEarned}=require('./cross-discipline-qi-mana-coherence.test.js');
const act=(s,operation,params={})=>
 R.act(s,{system:'specialist',operation,params});
function observation(s,sigilId='outer_stone_light_sigil_01'){
 C.event(s,'story',
 'Independent human mineral specialists observe an actual two-layer rune inscription, its visible light effect and a deliberately tested unstable layer.',{
  origin:Sigils.OBS,location:s.world.location,sigilId,
  substrate:'moss_crystal_ironbloom',effect:'short_local_visible_light',
  originalSymbolVocabulary:'An individually observed runic mark vocabulary distinguishes the original energy conductor, return closure and finite optical response.',
  firstBindingLayer:'The first independently measured physically etched ironbloom layer binds the original moss-crystal substrate without changing its material identity.',
  secondActivationLayer:'The second real concentric rune closes the individually observed Mana excitation into a limited local visible photonic signal.',
  substrateCompatibility:'An actually examined source-owned moss crystal and ironbloom respond in a narrow stable harmonic window to this exact layered inscription.',
  measuredPhysicalEmission:'Visible local light illuminates only the actually present physical sigil for a short measured interval after genuine successful excitation.',
  independentFailedLayerCountertest:'A separate reversed inscription layer fails to hold the Mana phase and produces heat, loss and real bodily risk rather than a magical bonus.',
  activationAndDischargeLogic:'Each independently tested activation consumes real original Mana and living Stamina, and exhausts one of the observed finite mineral discharge cycles.',
  materialProvenanceAndRights:'The original two minerals were already held by the actual maker with no theft, unconsenting donor or free item creation from names.',
  heatAndStabilityLimits:'The observed medium has finite discharge cycles and may fail, heat or stop glowing under overload; there is no permanent illumination.',
  oneLocalInscribedObject:true,noRemoteSensing:true,
  noUnlearnedSpell:true,noFreeEnergy:true});
 return s.log.length-1;
}
{
 const s=E.newGame({seed:26163000,name:'No Rune Source'});
 R.unified.ensurePlayer(s);
 const saved=E.exportGame(s),rng=s.rngState;
 A.equal(act(s,'sigilStatus').runicArtefacts.length,0);
 A.throws(()=>act(s,'sigilInscribe',{witnessIndex:0}),/witnessed|observed|symbol/i);
 A.equal(E.exportGame(s),saved);A.equal(s.rngState,rng);
}
{
 const s=previouslyEarned(26163002);
 R.unified.ensurePlayer(s);
 s.player.skills.crafting.rank=5;
 A.equal(Circle.curriculum(s).minCircle,1);
 const original={
  name:s.player.name,firstGate:s.player.meridian.gates[0].number,
  arcaneCircles:s.player.arcane.circles,
  humanStage:s.player.humanEvolution.stage,
  originLoad:s.player.origin.load,
  spellRecords:structuredClone(s.table.arcaneTechniques||{})};
 const first=observation(s);
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'sigilInscribe',{witnessIndex:first,dc:1,guarantee:true}),
  /Only an originally witnessed/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 A.throws(()=>act(s,'sigilInscribe',{witnessIndex:first}),
  /Insufficient genuinely owned/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 // Disposable established inventory handoff: the sigil action consumes
 // existing stock and never creates a mineral.
 s.player.inventory.moss_crystal=3;
 s.player.inventory.ironbloom=3;
 const crystal=s.player.inventory.moss_crystal,
  iron=s.player.inventory.ironbloom,
  stamina=s.player.stamina,minute=s.world.minutes,
  rngBefore=s.rngState;
 const firstResult=act(s,'sigilInscribe',{witnessIndex:first});
 A.equal(firstResult.attempted,true);
 A.equal(firstResult.constructed,firstResult.check.success);
 A.equal(firstResult.constructed,true,
  'Original high-skill inscription must resolve through its actual check');
 A.equal(firstResult.materialsSpent.moss_crystal,1);
 A.equal(firstResult.materialsSpent.ironbloom,1);
 A.equal(firstResult.noFreeSpell,true);
 A.equal(s.player.inventory.moss_crystal,crystal-1);
 A.equal(s.player.inventory.ironbloom,iron-1);
 A.equal(s.world.minutes,minute+60);
 A.equal(s.player.stamina,stamina-3);
 A.notEqual(s.rngState,rngBefore);
 A.equal(Sigils.verify(s),true);
 A.equal(act(s,'sigilStatus').runicArtefacts.length,1);
 const source=act(s,'sigilStatus').runicArtefacts[0];
 A.equal(source.activationsRemaining,3);
 A.equal(source.physicallyPresent,true);
 A.equal(source.currentlyEmittingVisibleLight,false);
 const unchanged=E.exportGame(s),stillRng=s.rngState;
 A.throws(()=>act(s,'sigilInscribe',{witnessIndex:first}),
  /observed|rerolled|symbol/i);
 A.equal(E.exportGame(s),unchanged);
 A.equal(s.rngState,stillRng);
 let emitCount=0;
 for(let i=0;i<3;i++){
  const priorMana=s.player.mana,priorStamina=s.player.stamina,
   priorMinute=s.world.minutes,priorRng=s.rngState;
  const result=act(s,'sigilActivate',{sigilId:source.id});
  A.equal(result.attempted,true);
  A.equal(result.emittedVisibleLight,result.check.success);
  A.equal(result.noRemoteInformation,true);
  A.equal(result.noAdditionalSpellLearned,true);
  A.equal(s.player.mana,priorMana-1);
  A.equal(s.player.stamina,priorStamina-1);
  A.equal(s.world.minutes,priorMinute+5);
  A.notEqual(s.rngState,priorRng);
  A.equal(result.activationsRemaining,2-i);
  A.equal(Sigils.verify(s),true);
  if(result.emittedVisibleLight)emitCount++;
 }
 A.ok(emitCount>0,'A source-measured rune can genuinely emit local light after an actual original check');
 A.equal(act(s,'sigilStatus').runicArtefacts[0].activationsRemaining,0);
 const saved=E.exportGame(s),savedRng=s.rngState;
 A.throws(()=>act(s,'sigilActivate',{sigilId:source.id}),
  /unused mineral activations/);
 A.equal(E.exportGame(s),saved);
 A.equal(s.rngState,savedRng);
 A.equal(s.player.name,original.name);
 A.equal(s.player.meridian.gates[0].number,original.firstGate);
 A.equal(s.player.arcane.circles,original.arcaneCircles);
 A.equal(s.player.humanEvolution.stage,original.humanStage);
 A.equal(s.player.origin.load,original.originLoad);
 A.deepEqual(s.table.arcaneTechniques||{},original.spellRecords);
 // Interleaved new construction must not invalidate earlier lawful activations.
 const second=observation(s,'other_sourced_visible_sigil_02');
 const secondResult=act(s,'sigilInscribe',{witnessIndex:second});
 A.equal(secondResult.constructed,true);
 A.equal(act(s,'sigilStatus').runicArtefacts.length,2);
 A.equal(Sigils.verify(s),true);
 const loaded=E.importGame(E.exportGame(s));
 A.equal(Sigils.verify(loaded),true);
 const forged=E.importGame(E.exportGame(s));
 forged.table.specialistSigils.activations[0].source.manaSpent=0;
 A.equal(Sigils.verify(forged),false);
 const duplicate=E.importGame(E.exportGame(s));
 duplicate.table.specialistSigils.activations.push(
  structuredClone(duplicate.table.specialistSigils.activations[0]));
 A.equal(Sigils.verify(duplicate),false);
 const fabricated=E.importGame(E.exportGame(s));
 fabricated.table.specialistSigils.inscriptions[0].source.materialBefore.moss_crystal=99;
 A.equal(Sigils.verify(fabricated),false);
 const existing=s.world.minutes;
 E.advance(s,60);W.finalizeTime(s,existing);
 A.equal(act(s,'sigilStatus').runicArtefacts.every(x=>
  !x.currentlyEmittingVisibleLight),true,
  'Actual finite local emissions expire with independently passing world time');
 for(let n=0;n<110;n++)C.event(s,'story',
  'Independent ordinary people continue unrelated city life while the original layered mineral sigils remain actual physical objects.',{unrelated:n});
 A.equal(s.log.length,90);
 A.equal(Sigils.verify(E.importGame(E.exportGame(s))),true,
  'Original observed rune grammar and real material/activation receipts persist beyond the 90-event journal');
}
console.log('Specialist #16 Runic Sigils: original witnessed two-layer inscription, actual owned mineral stock and source work roll, finite original Mana activations, local visible light and tamper-proof persistent physical objects');
