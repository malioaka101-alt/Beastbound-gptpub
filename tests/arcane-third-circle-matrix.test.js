'use strict';
// Third Arcane Circle: source-authenticated geometry and original checks, not
// a free spell, teacher gate, rank conversion or campaign save migration.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine'),R=require('../rules'),
 D=require('../rules/disciplines'),P=require('../rules/power-overview'),
 Dual=require('../rules/arcane-dual-channel'),
 Turn=require('../scripts/chat-turn');
const FIRST='Measured First Circle built from a stable sixfold Mana Core return geometry';
const SECOND='Counter-rotating paired Circle return loops preserving the original formula anchor and a stable second channel';
const THIRD='Three independent Circle paths are cross-coupled through a stable return matrix, with a measured resonance counterloop and self-correcting formula feedback across all three channels.';
function first(seed=613331){
 const s=E.newGame({seed,name:'Third Circle disposable mage',path:'arcane'});
 R.unified.ensurePlayer(s);
 s.world.location='academy';
 s.player.attributes.int=20;s.player.skills.arcana.rank=5;
 const a=s.player.arcane,p=R.build.arcaneProfile(1);
 a.coreIgnited=true;a.circles=1;a.geometry=FIRST;
 a.structuredMana=p.mana;a.channels=p.channels;a.maxComplexity=p.maxComplexity;
 s.table.disciplineTraining||={};
 s.table.disciplineTraining.arcane={target:null,points:0,weeks:0,methods:{},
  cooldownUntil:0,complications:[],history:[
   {day:1,target:'core',quality:'strong',change:'Mana Core ignited, no Circle yet'},
   {day:1,target:'circle1',quality:'strong',change:'First Circle constructed; '+FIRST}
  ]};
 return s;
}
function earnedSecond(seed){
 const s=first(seed);
 for(let i=0;i<10&&s.player.arcane.circles===1;i++){
  const r=R.act(s,{system:'arcane',operation:'circleWork',
   params:{design:SECOND,minutes:15}});
  A.equal(r.newSpellGranted,false);
 }
 A.equal(s.player.arcane.circles,2,'This disposable source must earn, not claim, the Second Circle');
 A.equal(Dual.verify(s).channels,2);
 return s;
}
const matrix=(s,p)=>R.act(s,{system:'arcane',operation:'matrixWork',params:p});
{
 const novice=first(),baseline=E.exportGame(novice),rng=novice.rngState;
 const st=R.act(novice,{system:'arcane',operation:'matrixStatus',params:{}});
 A.equal(st.ready,false);
 A.match(st.reason,/genuinely earned/);
 A.throws(()=>matrix(novice,{design:THIRD,focus:'integrated'}),/genuinely earned/);
 A.equal(E.exportGame(novice),baseline);A.equal(novice.rngState,rng);
}
{
 const s=earnedSecond(613331);
 const initial=E.exportGame(s),rng=s.rngState;
 const before=R.act(s,{system:'arcane',operation:'matrixStatus',params:{}});
 A.equal(before.ready,true);A.equal(before.progress,0);
 const disc=R.act(s,{system:'discipline',operation:'status',params:{}});
 A.equal(disc.systems.arcane.target,'Third Circle — Matrix Formation');
 A.equal(disc.systems.arcane.matrixWork.requiredIntegrity,6);
 A.equal(disc.systems.arcane.matrixWork.manaSpentPerAttempt,4);
 A.equal(disc.systems.arcane.matrixWork.noFreeSpells,true);
 const power=P.read(s);A.equal(power.arcane.circles,2);
 A.equal(power.arcane.matrix.ready,true);
 A.equal(E.exportGame(s),initial);A.equal(s.rngState,rng,
  'Structural status and power panels must not roll or mutate');
 for(const params of [
  {design:THIRD,focus:'integrated',newCircle:9},
  {design:THIRD,focus:'integrated',dc:2},
  {design:THIRD,focus:'integrated',spell:'infinite beam'},
  {design:THIRD,focus:'integrated',route:'established'},
  {design:THIRD,focus:'unsupported'},
  {design:'Third Circle unlocked',focus:'integrated'},
  {design:THIRD,focus:'integrated',minutes:0}
 ]){
  A.throws(()=>matrix(s,params));
  A.equal(E.exportGame(s),initial);
  A.equal(s.rngState,rng);
 }
 const low=E.importGame(initial);low.player.mana=3;
 const pre=E.exportGame(low),beforeRng=low.rngState;
 A.throws(()=>matrix(low,{design:THIRD,focus:'integrated'}),/four real Mana/);
 A.equal(E.exportGame(low),pre);A.equal(low.rngState,beforeRng);
 const originalGeometry=s.player.arcane.geometry;
 const learned=structuredClone(s.table.arcaneTechniques||{});
 let formed=null,totalSpent=0,totalMinutes=0,totalStamina=0;
 for(let i=0;i<8&&!formed;i++){
  const minutes=i===0?15:60,
    previousMinutes=s.world.minutes,previousMana=s.player.mana,
    previousStamina=s.player.stamina;
  const result=matrix(s,{design:THIRD,
   focus:i%2===0?'integrated':'formula-feedback',minutes});
  A.ok(Number.isInteger(result.check.roll));
  A.equal(result.check.dc,20);
  A.equal(result.manaSpent,4);
  A.equal(result.feeTalons,0);
  A.equal(result.noAutomaticSpell,true);
  A.equal(s.player.mana,previousMana-4);
  A.equal(s.world.minutes,previousMinutes+minutes);
  A.equal(s.player.stamina,previousStamina-Math.ceil(minutes/120));
  totalSpent+=4;totalMinutes+=minutes;totalStamina+=Math.ceil(minutes/120);
  formed=result.formed?result:null;
 }
 A.ok(formed,'A well-prepared mage can earn Circle III through actual checks');
 A.equal(s.player.arcane.circles,3);
 A.equal(s.player.arcane.channels,3);
 A.equal(s.player.arcane.structuredMana,R.build.arcaneProfile(3).mana);
 A.equal(s.player.arcane.maxComplexity,R.build.arcaneProfile(3).maxComplexity);
 A.equal(s.player.arcane.geometry,originalGeometry,
  'Matrix geometry does not overwrite the original First Circle');
 A.equal(s.player.arcane.matrixGeometry,THIRD);
 A.ok(s.player.arcane.matrixIntegrity>=40);
 A.equal(s.player.mana,24-
  (s.table.arcaneCircleRevision.attempts.length*2)-totalSpent);
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(s.player.meridian.stage,0);
 A.equal(s.player.soul.phase,0);
 A.deepEqual(s.player.body.cycles,[]);
 A.equal(s.player.rift.step,0);
 A.deepEqual(s.table.arcaneTechniques||{},learned);
 A.equal(s.table.arcaneArchitecture.circle3.noAutomaticSpells,true);
 A.equal(s.table.arcaneArchitecture.circle3.matrixGeometry,THIRD);
 A.equal(D.verifyThirdCircle(s).number,3);
 A.equal(Dual.verify(s).channels,2,
  'A verified newer Circle retains the original earned dual spell routing');
 A.equal(Dual.verify(s).provenThirdMatrix,true);
 A.equal(P.read(s).arcane.matrix.verified,true);
 A.equal(P.read(s).arcane.circleName,'Third Circle — Matrix Formation');
 A.equal(E.importGame(E.exportGame(s)).player.arcane.matrixGeometry,THIRD);
 const snapshot=E.exportGame(s),readyRng=s.rngState;
 A.throws(()=>matrix(s,{design:THIRD,focus:'integrated'}),/genuinely earned|Third Circle|Second Circle/);
 A.equal(E.exportGame(s),snapshot);A.equal(s.rngState,readyRng);
 // An edited counter without the actual matrix witness must not enable
 // existing second-Circle abilities through a pretend Third Circle.
 const counterfeit=earnedSecond(613335);
 counterfeit.player.arcane.circles=3;
 A.throws(()=>Dual.verify(counterfeit),/consistent original earned structural evidence/);
}
{
 // One actual private turn file and receipt; duplicate IDs are a replay,
 // not a new attempt and never a second Arcane check.
 const s=earnedSecond(613333);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-matrix3-'));
 try{
  const save=Path.join(dir,'disposable.json');
  FS.writeFileSync(save,E.exportGame(s)+'\n');
  const req={id:'matrix3_original_613333',mode:'rule',system:'arcane',
   operation:'matrixWork',params:{design:THIRD,focus:'integrated',minutes:15}};
  const firstTurn=Turn.execute(save,req);
  A.equal(firstTurn.ok,true);A.equal(firstTurn.applied,true);
  A.ok(Number.isInteger(firstTurn.output.rules.check.roll));
  const written=FS.readFileSync(save,'utf8'),
   r2=Turn.execute(save,req);
  A.equal(r2.duplicate,true);A.equal(r2.applied,false);
  A.equal(FS.readFileSync(save,'utf8'),written);
  A.equal(E.importGame(written).world.minutes,s.world.minutes+15);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Third Arcane Circle: verified earned Second Circle, three-channel matrix, real Mana/Stamina/time/checks, no free magic, preserved dual casting and private replay');
