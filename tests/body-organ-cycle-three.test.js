'use strict';
// Body Cycle III belongs to real organic adaptation, not the Qi or Mana
// ladders. Every test state is disposable; no campaign checkpoint is touched.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path'),
 E=require('../engine'),Rules=require('../rules'),D=require('../rules/disciplines'),
 Combat=require('../rules/combat'),Power=require('../rules/power-overview'),
 Turn=require('../scripts/chat-turn');
const f=(seed=723551)=>{
 const s=E.newGame({seed,name:'Disposable Organ Refiner',path:'undecided',background:'fieldworker'});
 Rules.unified.ensurePlayer(s);
 const p=s.player,c=s.table.combatants.player;
 p.body.cycles=['Muscle-Tendon Cycle','Bone-Marrow Cycle'];
 p.attributes.con=20;p.skills.survival.rank=5;
 p.maxStamina+=2;p.stamina+=2;c.maxStamina+=2;c.stamina+=2;
 c.toughness+=1;c.boxes[1]+=1;
 s.table.disciplineTraining||={};
 s.table.disciplineTraining.body={
  target:null,points:0,methods:{},weeks:0,cooldownUntil:0,complications:[],
  history:[
   {day:1,target:'cycle1',quality:'strong',
    change:'Completed Cycle I Muscle-Tendon refinement; +2 stamina, Might +1, M1 natural force'},
   {day:1,target:'cycle2',quality:'strong',
    change:'Completed Cycle II Bone-Marrow refinement; +1 Toughness, +1 Serious wound box'}
  ]
 };
 return s;
};
const act=(s,params)=>Rules.act(s,{system:'body',operation:'organWork',params});
{
 const original=f(),before=E.exportGame(original),rng=original.rngState;
 const ready=Rules.act(original,{system:'body',operation:'organStatus',params:{}});
 A.equal(ready.ready,true);
 A.equal(ready.requiredPerSystem,2);
 A.deepEqual(ready.focusMethods,['heart','lungs','liver','kidneys','integrated']);
 A.equal(Rules.act(original,{system:'discipline',operation:'status',params:{}})
  .systems.body.target,'Cycle III — Organ Refinement');
 A.equal(Power.read(original).body.organCycle.ready,true);
 A.equal(E.exportGame(original),before);A.equal(original.rngState,rng);
 const unearned=f(723552);
 unearned.player.body.cycles=['Muscle-Tendon Cycle'];
 const old=E.exportGame(unearned);
 A.throws(()=>act(unearned,{focus:'integrated'}),/genuinely completed/);
 A.equal(E.exportGame(unearned),old);
 const altered=f(723553);delete altered.table.disciplineTraining.body.history[1];
 const noEvidence=E.exportGame(altered);
 A.throws(()=>act(altered,{focus:'integrated'}),/original earned, dated/);
 A.equal(E.exportGame(altered),noEvidence);
 for(const args of [
  {focus:'integrated',minutes:15,awardedCycle:7},
  {focus:'heart',minutes:0},
  {focus:'brain',minutes:15},
  {focus:'integrated',approach:'win'},
  {focus:'integrated',source:'imaginary priest'},
  {focus:'integrated',bonus:999}
 ]){
  A.throws(()=>act(original,args));
  A.equal(E.exportGame(original),before);A.equal(original.rngState,rng);
 }
}
{
 const s=f(723554),p=s.player,c=s.table.combatants.player;
 const before={stamina:p.stamina,tough:c.toughness,critical:c.boxes[2],coins:p.coins,minutes:s.world.minutes};
 let completed=false,spent=0,minutes=0,last=null;
 for(let n=0;n<12&&!completed;n++){
  const duration=n===0?15:120,oldTime=s.world.minutes;
  last=act(s,{focus:n===0?'heart':'integrated',minutes:duration,
   approach:'Condition circulation through heart, lungs, liver, kidneys and supporting organs'});
  A.ok(Number.isInteger(last.check.roll));
  A.equal(last.check.dc,17);
  A.equal(last.staminaSpent,Math.ceil(duration/120));
  A.equal(last.feeTalons,0);
  A.equal(last.route,'independent');
  A.equal(s.world.minutes,oldTime+duration);
  spent+=last.staminaSpent;minutes+=duration;
  completed=last.completed;
 }
 A.equal(completed,true,'A well-prepared refiner can earn real full-body integration');
 A.deepEqual(s.player.body.cycles,['Muscle-Tendon Cycle','Bone-Marrow Cycle','Organ Cycle']);
 A.deepEqual(s.table.organCycleWork.systems,{heart:2,lungs:2,liver:2,kidneys:2});
 A.equal(s.table.organCycleWork.integrated,true);
 A.equal(s.table.organCycleWork.completed,true);
 A.equal(c.toughness,before.tough+1);
 A.equal(c.boxes[2],before.critical+1);
 A.equal(p.maxStamina,before.stamina+2);
 A.equal(p.stamina,before.stamina-spent+2);
 A.equal(p.coins,before.coins);
 A.equal(s.world.minutes,before.minutes+minutes);
 A.equal(p.meridian.stage,0);A.equal(p.arcane.circles,0);
 A.equal(p.soul.phase,0);A.equal(p.humanEvolution.stage,0);
 A.equal(D.organEarned(s).cycle,3);
 A.equal(Power.read(s).body.completedCycles,3);
 A.equal(Power.read(s).body.organCycle.earned,true);
 A.equal(D.organStatus(s).earned,true);
 const restored=E.importGame(E.exportGame(s));
 A.deepEqual(restored.player.body.organAdaptation,p.body.organAdaptation);
 A.equal(D.organEarned(restored).cycle,3);
 // Actual combat Recover retains its one legal action; organ adaptation
 // improves stamina restored without granting a second turn or healing.
 c.stamina-=10;p.stamina=c.stamina;c.recoverUses=0;
 const beforeRec=c.stamina,oldUses=c.recoverUses;
 const result=Combat.recover(s,{id:'player'});
 A.equal(result.gained,Math.min(10,Math.max(0,3+c.vigor)));
 A.equal(c.recoverUses,oldUses+1);
 A.equal(c.stamina,beforeRec+result.gained);
 const second=Combat.recover(s,{id:'player'});
 A.equal(second.gained,0,'Organ work cannot reset encounter recovery uses');
 const forged=f(723555);
 forged.player.body.cycles.push('Organ Cycle');
 forged.table.combatants.player.stamina-=10;
 const fprev=forged.table.combatants.player.stamina;
 const noBonus=Combat.recover(forged,{id:'player'});
 A.equal(noBonus.gained,Math.min(10,Math.max(0,2+forged.table.combatants.player.vigor)));
 A.equal(forged.table.combatants.player.stamina,fprev+noBonus.gained);
 const snapshot=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,{focus:'integrated',minutes:15}),/genuinely completed/);
 A.equal(E.exportGame(s),snapshot);A.equal(s.rngState,rng);
}
// Truly independent seeds can suffer a physical setback. Do not reroll any
// live decision; each fixture is an unrelated disposable game.
{
 let seen=false;
 for(let seed=810001;seed<810080&&!seen;seed++){
  const s=f(seed);s.player.attributes.con=10;s.player.skills.survival.rank=0;
  const r=act(s,{focus:'integrated',minutes:15});
  if(r.check.degree==='severe failure'){
   seen=true;A.equal(r.setback,'organ strain');
   A.ok(s.table.combatants.player.wounds.some(n=>n>0));
   A.equal(s.player.body.cycles.length,2);
  }
 }
 A.equal(seen,true,'Severe failure should be a real, independently rolled possibility');
}
{
 const s=f(723556),dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-organ3-'));
 try{
  const save=Path.join(dir,'only-test.json');
  FS.writeFileSync(save,E.exportGame(s)+'\n');
  const request={id:'organ_cycle_723556',mode:'rule',
   system:'body',operation:'organWork',
   params:{focus:'integrated',minutes:15}};
  const executed=Turn.execute(save,request);
  A.equal(executed.ok,true);
  A.equal(executed.applied,true);
  A.ok(Number.isInteger(executed.output.rules.check.roll));
  const written=FS.readFileSync(save,'utf8');
  const duplicate=Turn.execute(save,request);
  A.equal(duplicate.duplicate,true);A.equal(duplicate.applied,false);
  A.equal(FS.readFileSync(save,'utf8'),written);
  A.equal(E.importGame(written).world.minutes,s.world.minutes+15);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Body Cycle III: whole-organ anatomical work, honest injury/cost, actual earned Recover advantage, older-stage evidence, no other powers, exact private replay');
