'use strict';
// Master §26: an observed three-node formation is actually constructed,
// remains source-limited, and stabilises ONE later genuine mineral sigil
// activation check. No free runes, automatic radius powers or second die.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),C=require('../rules/core'),W=require('../rules/world'),
 Formation=require('../rules/specialist-formation-mastery'),
 Sigil=require('../rules/specialist-rune-sigils');
const {previouslyEarned}=require('./cross-discipline-qi-mana-coherence.test.js');
const act=(s,system,operation,params={})=>
 R.act(s,{system,operation,params});
function sigilWitness(s,id){
 C.event(s,'story','An independently measured mineral rune is etched in two real layers with a physically observed light activation and failed-phase countertest.',{
  origin:Sigil.OBS,location:s.world.location,sigilId:id,
  substrate:'moss_crystal_ironbloom',
  effect:'short_local_visible_light',
  originalSymbolVocabulary:'Original separate conductor, activation and discharge symbols follow independently verified local symbolic forms.',
  firstBindingLayer:'The actual ironbloom trace binds the existing moss crystal into a physically stable first inscription layer.',
  secondActivationLayer:'The distinct outer ring closes the finite Mana-driven optical emission on the same real mineral substrate.',
  substrateCompatibility:'Independent mineral tests confirm the actual present owned crystal and ironbloom conduct the same bounded local light effect.',
  measuredPhysicalEmission:'The visibly present inscribed mineral may radiate local light only while actively and successfully excited.',
  independentFailedLayerCountertest:'A separate deliberate phase reversal collapses the light effect and produces measurable heat without invisible sensing.',
  activationAndDischargeLogic:'Actual Mana and Stamina are expended per independently checked excitation with limited mineral discharge cycles.',
  materialProvenanceAndRights:'The physical maker already owns the two mineral components and does not get a free material or an unwilling donor.',
  heatAndStabilityLimits:'The actual material has finite cycles and a separately measured thermal limit that can defeat an activation.',
  oneLocalInscribedObject:true,noRemoteSensing:true,
  noUnlearnedSpell:true,noFreeEnergy:true});
 return s.log.length-1;
}
function formationWitness(s,id){
 C.event(s,'story','Original field practitioners measure three separately placed actual mineral nodes, their spatial phase response and a failed-link countertest before forming an array.',{
  origin:Formation.WITNESS,location:s.world.location,
  formationId:id,
  nodes:[
   'The separately measured first ironbloom conductor on the north outer standing stone',
   'The separate westward real ironbloom return node with directly observed ground stability',
   'The individually measured central moss-crystal phase equaliser on the eastern public stone'
  ],
  nodeMaterial:'ironbloom_moss_crystal',
  measuredCompatibleSigil:'moss_crystal_ironbloom',
  measuredEffect:'stabilise_one_local_visible_sigil_activation',
  originalNodeGeometry:'The three physically surveyed nodes form a bounded energy return triangle around one pre-existing locally inscribed mineral light sigil.',
  independentPhaseCountertest:'An opposite-phase node orientation demonstrably loses the optical stabilising effect while the mineral conductor remains physically present.',
  actualSubstrateConduction:'Independent tests confirm the actual ironbloom conductors and moss crystal attenuate only local visible-sigil excitation interference.',
  measuredRunicFieldInteraction:'A separate measured test shows one original runic visible-light activation needs slightly less phase correction inside this exact three-node field.',
  physicalDisruptionAndEndOfLife:'An actual broken wire, changed stone orientation, phase reversal or elapsed mineral stability collapses the field without generating other magic.',
  independentBaseline:'A separately observed unaided original rune activation has a one-point higher calibration difficulty under the same local conditions.',
  ownershipAndPlacementRights:'All three public exterior placements and physically owned mineral components have individually checked local lawful access.',
  energyAndLivingSafetyLimits:'The real human supplies three original Mana and bodily construction Stamina over ninety minutes, with overload and wound risks.',
  noForeignRealmLink:true,noAutomaticSpell:true,
  noUnobservedAmplification:true});
 return s.log.length-1;
}
{
 const s=E.newGame({name:'No prewritten formation skill',seed:26164000});
 R.unified.ensurePlayer(s);
 const prior=E.exportGame(s),rng=s.rngState;
 A.equal(act(s,'specialist','formationStatus').formed,0);
 A.throws(()=>act(s,'specialist','formationBuild',{witnessIndex:0}),
  /observed|source|three-node/i);
 A.equal(E.exportGame(s),prior);A.equal(s.rngState,rng);
}
{
 const s=previouslyEarned(26164002);
 R.unified.ensurePlayer(s);
 s.player.skills.crafting.rank=5;
 s.player.inventory.ironbloom=5;s.player.inventory.moss_crystal=4;
 let n=0;
 for(const id of ['original_sigil_node_01','independently_sourced_node_02']){
  const wi=sigilWitness(s,id);
  const r=act(s,'specialist','sigilInscribe',{witnessIndex:wi});
  A.equal(r.constructed,true,'Independent real source-backed inscriptions form through actual one-roll material work');
  n++;
 }
 A.equal(n,2);
 A.equal(Sigil.verify(s),true);
 const originalM= s.player.mana, originalS=s.player.stamina,
  originalWorld=s.world.location;
 const i=formationWitness(s,'original_three_node_formation_01');
 const snap=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'specialist','formationBuild',
  {witnessIndex:i,bonus:10,freeSpell:true,dc:1}),
  /independent witnessed exact three-node/i);
 A.equal(E.exportGame(s),snap);A.equal(s.rngState,rng);
 const start=s.world.minutes,ir=s.player.inventory.ironbloom,
  cr=s.player.inventory.moss_crystal,sta=s.player.stamina,
  mana=s.player.mana;
 const built=act(s,'specialist','formationBuild',{witnessIndex:i});
 A.equal(built.attempted,true);A.equal(built.formed,built.check.success);
 A.equal(built.formed,true,'An actual high-skill source-observed safe three-node formation can form');
 A.equal(built.observedNodes,3);
 A.equal(built.manaSpent,3);A.equal(built.staminaSpent,4);
 A.equal(s.player.inventory.ironbloom,ir-2);
 A.equal(s.player.inventory.moss_crystal,cr-1);
 A.equal(s.world.minutes,start+90);
 A.equal(s.player.mana,mana-3);
 A.equal(s.player.stamina,sta-4);
 A.equal(Formation.verify(s),true);
 A.equal(Sigil.verify(s),true);
 A.equal(act(s,'specialist','formationStatus').activeUnspent.length,1);
 A.equal(s.player.arcane.circles,1);
 const formationSeal=act(s,'specialist','formationStatus').activeUnspent[0].sourceSeal;
 const initial=E.exportGame(s),rngAfter=s.rngState;
 A.throws(()=>act(s,'specialist','formationBuild',{witnessIndex:i}),
  /rerolled|observed|identity/i);
 A.equal(E.exportGame(s),initial);A.equal(s.rngState,rngAfter);
 const runicObjects=act(s,'specialist','sigilStatus').runicArtefacts;
 A.equal(runicObjects.length,2);
 const beforeMana=s.player.mana,beforeTime=s.world.minutes;
 const first=act(s,'specialist','sigilActivate',{sigilId:runicObjects[0].id});
 A.equal(first.originalPhysicalFormationSupport,1);
 A.equal(first.check.dc,11,'Only the witnessed real same-site physical array adjusts the original rune check');
 A.equal(first.consumedFormationSeal,formationSeal);
 A.equal(s.player.mana,beforeMana-1);
 A.equal(s.world.minutes,beforeTime+5);
 A.equal(act(s,'specialist','formationStatus').consumedAssists,1);
 A.equal(act(s,'specialist','formationStatus').activeUnspent.length,0);
 A.equal(Formation.verify(s),true);A.equal(Sigil.verify(s),true);
 const second=act(s,'specialist','sigilActivate',{sigilId:runicObjects[1].id});
 A.equal(second.originalPhysicalFormationSupport,0,
  'The finite already consumed physical array cannot provide an additional unearned bonus');
 A.equal(second.check.dc,12);
 A.equal(second.consumedFormationSeal,null);
 A.equal(s.world.location,originalWorld);
 A.equal(Formation.verify(s),true);A.equal(Sigil.verify(s),true);
 const imported=E.importGame(E.exportGame(s));
 A.equal(Formation.verify(imported),true);A.equal(Sigil.verify(imported),true);
 const falseBoost=E.importGame(E.exportGame(s));
 falseBoost.table.specialistSigils.activations[0].source.formationMitigation=5;
 A.equal(Sigil.verify(falseBoost),false);
 const falseReceipt=E.importGame(E.exportGame(s));
 falseReceipt.table.specialistFormations.uses[0].source.bonus=100;
 A.equal(Formation.verify(falseReceipt),false);
 const fakeNode=E.importGame(E.exportGame(s));
 fakeNode.table.specialistFormations.forms[0].source.nodePositions[1]='An invented remote portal beacon outside the actual observed physical locality';
 A.equal(Formation.verify(fakeNode),false);
 const t=s.world.minutes;E.advance(s,200);W.finalizeTime(s,t);
 A.equal(act(s,'specialist','formationStatus').activeUnspent.length,0);
 A.equal(Formation.verify(s),true);
 A.equal(Sigil.verify(s),true,'Historical original formation support survives lawful subsequent world time');
 for(let k=0;k<110;k++)C.event(s,'story',
  'Separate villagers observe ordinary local changes while the actual previously formed mineral triangle remains an original past fact.',{unrelated:k});
 A.equal(s.log.length,90);
 A.equal(Formation.verify(E.importGame(E.exportGame(s))),true);
 A.equal(Sigil.verify(E.importGame(E.exportGame(s))),true);
 A.ok(originalM>0&&originalS>0);
}
console.log('Specialist #16 Formation Mastery: three original spatially surveyed nodes, true physical mineral/Mana costs, one-roll construction and precisely one later source-linked sigil light check');
