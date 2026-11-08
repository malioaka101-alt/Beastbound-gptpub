'use strict';
// Foundation regression: the old playable trial is not needed. Test only
// disposable synthetic campaigns and source-backed distinct advancement.
const A=require('node:assert/strict'),
 E=require('../engine.js'),
 Rules=require('../rules'),
 P=require('../panels.js'),
 U=require('../rules/unified'),
 D=require('../rules/disciplines'),
 Power=require('../rules/power-overview');
{
 const s=E.newGame({seed:27182818,name:'Independent Power Fixture',
  path:'meridian',background:'fieldworker'});
 const old=E.exportGame(s),rng=s.rngState;
 const v=Rules.act(s,{system:'power',operation:'status',params:{}});
 A.equal(v.meridian.stage,0);
 A.match(v.meridian.stageName,/Stage I not yet attained/);
 A.equal(v.meridian.gatesOpened,0);
 A.equal(v.meridian.cultivationSkillRank,1);
 A.equal(v.meridian.training.target,'foundation');
 A.equal(v.meridian.training.progress,0);
 A.equal(v.meridian.legacyPreparatoryFoundation,20);
 A.match(v.meridian.warning,/not verified/);
 A.equal(v.arcane.circles,0);
 A.equal(v.arcane.coreIgnited,false);
 A.equal(v.arcane.manaCoreEstablished,false);
 A.equal(v.soul.phase,0);A.equal(v.body.completedCycles,0);
 A.equal(v.rift.step,0);A.equal(v.humanEvolution.stage,0);
 A.equal(v.meridian.training.independentAvailable,true);
 A.equal(E.exportGame(s),old);
 A.equal(s.rngState,rng);
 const panel=P.full(s,'power');
 A.match(panel,/POWER/);
 A.match(panel,/CULTIVATION|Cultivation/);
 A.match(panel,/Not verified track progress/);
 for(const line of panel.split('\n'))A.equal(Array.from(line).length,34);
 A.equal(P.full(s,'menu').includes('Power'),true);
}
{
 // Body Cycle II is not Gate Stage II, Soul Phase II or "level 2".
 const s=E.newGame({seed:8112525,name:'Bone-Marrow Fixture',
  path:'undecided',background:'fieldworker'});
 U.ensurePlayer(s);
 // The test fixture represents an actually completed first cycle. No player
 // save can set this up by conversation or an input parameter.
 s.player.body.cycles=['Muscle-Tendon Cycle'];
 const pre=P.full(s,'power');
 A.match(pre,/Body: 1\/7 cycles/);
 const st=D.status(s).systems.body;
 A.equal(st.target,'cycle2');
 A.deepEqual(st.availableMethods,['bone','marrow','recovery']);
 A.equal(st.required,180);
 A.equal(st.trainingRoutes.includes('independent'),true);
 const before=s.world.minutes,sta=s.player.stamina,coin=s.player.coins;
 A.throws(()=>D.practice(s,{system:'body',method:'muscle',minutes:60}),
  /current biological or spiritual stage/);
 A.equal(s.world.minutes,before);A.equal(s.player.coins,coin);
 const step=D.practice(s,{system:'body',method:'marrow',minutes:60});
 A.equal(step.system,'body');A.equal(step.target,'cycle2');
 A.equal(step.elapsedMinutes,60);A.equal(step.staminaSpent,1);
 A.equal(s.world.minutes,before+60);A.equal(s.player.stamina,sta-1);
 A.equal(s.player.coins,coin);A.equal(s.player.body.cycles.length,1);
 A.ok(step.check&&Number.isInteger(step.check.roll));
 const rec=s.table.disciplineTraining.body;
 A.equal(rec.methods.marrow,1);
 // Synthetic readiness is local test setup, not a user-accessible rule.
 rec.points=180;rec.methods.bone=1;rec.methods.recovery=1;
 let changed=false;
 for(let seed=0;seed<25;seed++){
  const sample=E.importGame(E.exportGame(s));
  // Separate disposable worlds, never a reroll of one live outcome.
  sample.rngState=(seed+1)*100001+17;
  const beforeCombat=sample.table.combatants.player,
   oldToughness=beforeCombat.toughness,oldBoxes=beforeCombat.boxes[1];
  const result=D.breakthrough(sample,{system:'body'});
  A.ok(result.check&&Number.isInteger(result.check.roll));
  if(result.outcome==='breakthrough'){
   changed=true;
   A.deepEqual(sample.player.body.cycles,
    ['Muscle-Tendon Cycle','Bone-Marrow Cycle']);
   A.equal(sample.table.combatants.player.toughness,oldToughness+1);
   A.equal(sample.table.combatants.player.boxes[1],oldBoxes+1);
   A.equal(D.status(sample).systems.body.target,
    'Cycle III — Organ Refinement');
   A.equal(Power.read(sample).body.nextCycle,'Organ Cycle');
   // This deliberately synthetic fixture manually inserted Cycle I and
   // therefore cannot prove the two original earned anatomical histories.
   A.equal(Power.read(sample).body.organCycle.ready,false);
   A.match(Power.read(sample).body.organCycle.reason,/original earned/);
   A.match(P.full(sample,'power'),/Body: 2\/7 cycles/);
   break;
  }else{
   A.equal(sample.player.body.cycles.length,1);
   A.equal(sample.table.combatants.player.toughness,oldToughness);
   A.equal(sample.table.combatants.player.boxes[1],oldBoxes);
  }
 }
 A.ok(changed,'At least one independently seeded disposable breakthrough must succeed');
}
{
 const s=E.newGame({seed:318271,name:'Other Systems Fixture',path:'arcane'});
 const out=Power.read(s);
 A.equal(out.arcane.coreIgnited,false);
 A.equal(out.arcane.circles,0);
 A.equal(out.arcane.training.target,'core');
 A.equal(out.meridian.cultivationSkillRank,0);
 A.equal(out.humanEvolution.stageName,'Baseline Human');
 const old=E.exportGame(s);
 A.deepEqual(Power.read(s),Power.read(E.importGame(old)));
 A.equal(E.exportGame(s),old);
}
console.log('Power foundation checks passed: separate named stages, accurate legacy preparation, source-based Bone-Marrow Cycle II earned result and pure power panel');
