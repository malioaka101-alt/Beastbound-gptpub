'use strict';
// Master §§19,26,29: one individually measured physical Meridian + Arcane
// energy overlap. These prior stage records are disposable *earned-history
// fixtures*, never awards from the trial or edits to campaign saves.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),C=require('../rules/core'),
 Link=require('../rules/cross-discipline-coherence'),
 Gate=require('../rules/meridian-qi-strike'),
 Circle=require('../rules/arcane-spark');
const act=(s,operation,params={})=>
 R.act(s,{system:'cross',operation,params});
const GEOMETRY='Measured original first Arcane Circle with stable sixfold Core return loops and individually witnessed prior construction';
function previouslyEarned(seed=26160001,high=true){
 const s=E.newGame({seed,name:'Disposable individually earned Meridian and Arcane practitioner',path:'meridian'});
 R.unified.ensurePlayer(s);
 // Previously earned source-dated milestones; the live action must validate
 // exactly those original existing Gate and First Circle records.
 s.player.meridian.stage=3;
 s.player.meridian.gates=[{number:1,band:'Lower',quality:'Sound'}];
 s.table.powerPhysiology||={};s.table.powerPhysiology.meridian={
  primaryMapped:12,gateRecords:[{number:1,band:'Lower',quality:'Sound',
   day:1}],deviationHistory:[]};
 s.player.arcane.coreIgnited=true;s.player.arcane.circles=1;
 s.player.arcane.geometry=GEOMETRY;
 s.table.disciplineTraining||={};
 s.table.disciplineTraining.arcane={history:[
  {day:1,target:'core',quality:'strong',
   change:'Mana Core ignited, no Circle yet'},
  {day:1,target:'circle1',quality:'strong',
   change:'First Circle constructed; '+GEOMETRY}]};
 if(high){
  s.player.attributes.int=30;s.player.attributes.wis=30;
  s.player.skills.arcana.rank=5;s.player.skills.cultivation.rank=5;
 }
 A.equal(Gate.gate(s).opened.number,1);
 A.equal(Circle.curriculum(s).minCircle,1);
 return s;
}
function observe(s,interfaceId='first_gate_first_circle_coupling_01',
 mode='coherent'){
 C.event(s,'story','An independent anatomist and arcane researcher measure the actual human first-gate circulation against the original learned first Mana Circle with a separate control.',{
  origin:Link.OBS,location:s.world.location,
  interfaceId,firstGateNumber:1,measuredCircleGeometry:GEOMETRY,
  observedMode:mode,
  existingMeridianRoute:'The original first Lower Meridian Gate and existing twelve Primary Meridians conduct measurable individual Qi flow.',
  existingManaCorePath:'The actually established first Arcane Circle and current Mana Core independently conduct mana along their original measured sixfold geometry.',
  independentBaseline:'Separate Qi-only and Mana-only source measurements are recorded before any overlapping circulation.',
  interferenceCountertest:'An independently observed cross-phase reversal exposes risk of circulation competition, heat and collapse rather than guaranteeing synergy.',
  metabolicAndEnergyCost:'Real original Stamina, Qi, Mana, time, oxygen and circulation capacity are expended while both individual structures are tested.',
  heatAndTissueLimits:'The original human living tissue cannot safely support arbitrary pressure, unlimited channel throughput or free conversion.',
  safetyAndRecovery:'A separate original cooldown and pressure assessment are required if an adverse reaction causes lasting interference strain.',
  noFreeEnergy:true,noUnlearnedSpell:true,noAutomaticTierGain:true});
 return s.log.length-1;
}
{
 const s=E.newGame({seed:26160000,name:'No genuine dual architecture'});
 R.unified.ensurePlayer(s);
 const before=E.exportGame(s),rng=s.rngState;
 A.equal(act(s,'qiManaStatus').trialCount,0);
 A.throws(()=>act(s,'qiManaExperiment',{witnessIndex:0}),/first Lower Meridian|genuine|original/i);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=previouslyEarned(),first=observe(s),initialMinute=s.world.minutes,
  initialQi=s.player.qi,initialMana=s.player.mana,
  initialSta=s.player.stamina,rng=s.rngState;
 const before=E.exportGame(s);
 A.throws(()=>act(s,'qiManaExperiment',{witnessIndex:first,guaranteed:true,dc:1,bonus:10}),
  /Only one original independently witnessed/i);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const a=act(s,'qiManaExperiment',{witnessIndex:first});
 A.equal(a.attempted,true);
 A.equal(a.success,a.check.success);
 A.equal(a.observedInterference,'coherent');
 A.equal(a.physicalCoherence,a.success);
 A.equal(a.qiSpent,3);A.equal(a.manaSpent,3);
 A.equal(a.staminaSpent,2);A.equal(a.elapsedMinutes,30);
 A.equal(s.world.minutes,initialMinute+30);
 A.equal(s.player.qi,initialQi-3);
 A.equal(s.player.mana,initialMana-3);
 A.equal(s.player.stamina,initialSta-2);
 A.notEqual(s.rngState,rng);
 A.equal(Link.verify(s),true);
 A.equal(s.player.meridian.stage,3);
 A.equal(s.player.arcane.circles,1);
 A.equal(s.player.origin.load,0);
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(a.noFreeSpell,true);A.equal(a.noRankGain,true);
 const snapshot=E.exportGame(s),afterRng=s.rngState;
 A.throws(()=>act(s,'qiManaExperiment',{witnessIndex:first}),
  /rerolled|physically witnessed|original/i);
 A.equal(E.exportGame(s),snapshot);A.equal(s.rngState,afterRng);
 const second=observe(s,'first_gate_first_circle_coupling_02','interfering');
 const b=act(s,'qiManaExperiment',{witnessIndex:second});
 A.equal(b.observedInterference,'interfering');
 A.equal(b.physicalCoherence,false,
  'An individually observed interfering interaction cannot become a free coherent field merely by rolling well');
 A.equal(Link.verify(s),true);
 A.equal(act(s,'qiManaStatus').trialCount,2);
 const reloaded=E.importGame(E.exportGame(s));
 A.equal(Link.verify(reloaded),true);
 const fake=E.importGame(E.exportGame(s));
 fake.table.crossDiscipline.qiMana.trials[0].source.manaSpent=0;
 A.equal(Link.verify(fake),false);
 const tampered=E.importGame(E.exportGame(s));
 tampered.table.crossDiscipline.qiMana.trials[0].source.check.roll=20;
 A.equal(Link.verify(tampered),false);
 const beforeAdvance=s.world.minutes;
 E.advance(s,120);require('../rules/world').finalizeTime(s,beforeAdvance);
 A.equal(act(s,'qiManaStatus').currentlyObservedCoherentFields.length,0);
 for(let j=0;j<110;j++)C.event(s,'story',
  'Independent ordinary students discuss unrelated events without rewriting the actual original Qi–Mana physiology and observed interference.',{unrelated:j});
 A.equal(s.log.length,90);
 A.equal(Link.verify(E.importGame(E.exportGame(s))),true);
}
{
 const s=previouslyEarned(26160003,false);
 const wi=observe(s,'modest_actual_energetic_coupling_01','unsafe');
 const out=act(s,'qiManaExperiment',{witnessIndex:wi});
 A.equal(out.success,out.check.success);
 A.equal(out.physicalCoherence,false);
 A.equal(out.qiSpent,3);
 A.equal(out.manaSpent,3);
 A.equal(Link.verify(s),true);
}
console.log('Cross #16 first slice: genuine previously earned Gate/Circle, separate Qi/Mana/Stamina cost, witnessed individual interference, one original d20, no free spell or stage');
