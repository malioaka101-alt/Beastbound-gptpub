'use strict';
// Disposable, source-bounded First-Circle Arcane combat tests.
// Training milestones below model previously earned engine history in a local
// fixture; tests never modify a real campaign or grant spells in gameplay.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const Crypto=require('node:crypto'),E=require('../engine.js'),
 R=require('../rules'),B=require('../rules/build'),Turn=require('../scripts/chat-turn.js');
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const magic=(s,operation,params={})=>R.act(s,{system:'arcane',operation,params});
const fight=(s,p)=>R.act(s,{system:'combat',operation:'exchange',params:p});
function firstCircle(seed=44123){
 const s=E.newGame({seed,name:'First-Circle Spark Practice',path:'arcane'});
 s.player.arcane.coreIgnited=true;
 s.player.arcane.circles=1;
 s.player.arcane.geometry='stable measured sixfold First Circle';
 s.table||={};
 s.table.disciplineTraining||={};
 s.table.disciplineTraining.arcane={
  target:null,points:0,weeks:0,cooldownUntil:0,methods:{},
  history:[
   {day:1,target:'core',quality:'strong',change:'Mana Core ignited, no Circle yet'},
   {day:1,target:'circle1',quality:'strong',change:'First Circle constructed; stable measured sixfold First Circle'}
  ]
 };
 return s;
}
function academy(seed=44123){
 const s=firstCircle(seed);
 A.equal(E.dispatch(s,'travel academy').ok,true);
 return s;
}
function enemy(s){
 if(s.world.location==='academy'){
  A.equal(E.dispatch(s,'travel crossing').ok,true);
  A.equal(E.dispatch(s,'travel forest').ok,true);
 }
 s.beasts.fox={id:'fox',name:'Independent Assessed Lanternfen Fox',
  species:'fenfox',evolutionStage:'Base',sapience:1,
  location:s.world.location,hp:30,maxHp:30};
 s.encounter={beastId:'fox',observed:true,threat:true};
 s.beasts.fox.combatAssessment={beastId:'fox',species:'fenfox',
  evolutionStage:'Base',sapience:1,worldMinute:s.world.minutes,
  source:'Independently witnessed individual fox combat profile and preexisting nonlethal threat observations',
  behavior:{style:'territorial',nonlethal:true,canCommunicate:false,
   withdrawalDC:15,parleyDC:18,
   source:'Individual witnessed territorial nonlethal defence against a threatening trespasser'},
  stats:{toughness:35,defense:12,stamina:8,vigor:1,will:1,
   offM:0,durM:0,sapience:1,attack:2,damage:0,boxes:[3,2,1]}};
 return R.act(s,{system:'combat',operation:'begin',params:{beastId:'fox'}});
}
{
 const s=E.newGame({name:'No Free First Circle',seed:44120}),
   initial=E.exportGame(s),rng=s.rngState;
 A.equal(magic(s,'sparkStatus').known,false);
 A.throws(()=>magic(s,'sparkStudy'),/earned Mana Core/);
 A.throws(()=>magic(s,'sparkStudy',{dc:1,instant:true}),/no invented spell/);
 A.equal(E.exportGame(s),initial);A.equal(s.rngState,rng);
 const spec=B.spellCost({family:'strike',damage:6,rng:'close',area:'single',
  duration:'instant',magnitude:0,conditions:0,extraTargets:0,speed:'standard'});
 A.equal(spec.minCircle,1);A.equal(spec.mana,2);
 A.equal(spec.castingDC,12);A.equal(spec.load,1);
}
{
 const s=firstCircle(44121),initial=E.exportGame(s),rng=s.rngState;
 A.throws(()=>magic(s,'sparkStudy'),/actual Lumenfall Annex Academy/);
 A.equal(E.exportGame(s),initial);A.equal(s.rngState,rng);
 const noHistory=firstCircle(44122);
 noHistory.table.disciplineTraining.arcane.history=[];
 A.equal(E.dispatch(noHistory,'travel academy').ok,true);
 const saved=E.exportGame(noHistory),roll=noHistory.rngState;
 A.throws(()=>magic(noHistory,'sparkStudy'),/actually earned Mana Core/);
 A.equal(E.exportGame(noHistory),saved);A.equal(noHistory.rngState,roll);
}
{
 let succeed=false,fail=false;
 for(let i=1;i<=120;i++){
  const s=academy((i*2654435761)>>>0),before=s.world.minutes,
    coins=s.player.coins,oldRank=s.player.skills.arcana.rank;
  const result=magic(s,'sparkStudy');
  A.equal(result.techniqueId,'arcane_spark');
  A.equal(result.minimumCircle,1);
  A.equal(result.castingDC,12);A.equal(result.manaCost,2);
  A.equal(result.damage,6);A.equal(result.nonlethal,true);
  A.equal(result.durationDays,6);
  A.equal(s.world.minutes,before+6*1440);
  A.equal(s.player.coins,coins-4);
  A.equal(result.check.success,result.learned);
  A.equal(result.noExtraRoll,true);
  A.ok(s.player.skills.arcana.rank>=oldRank);
  A.equal(s.table.arcaneSparkStudy.attempts.length,1);
  const attempt=s.table.arcaneSparkStudy.attempts[0];
  A.equal(attempt.roll,result.check.roll);
  A.equal(attempt.actualTuitionScales,400);
  A.equal(attempt.success,result.learned);
  A.equal(digest(s.log[attempt.witnessIndex]),attempt.witnessHash);
  A.equal(digest(s.log[attempt.rollIndex]),attempt.rollHash);
  A.equal(s.log[attempt.rollIndex].type,'roll');
  A.equal(magic(s,'sparkStatus').known,result.learned);
  if(result.learned){
   const tech=s.table.arcaneTechniques.arcane_spark;
   A.equal(tech.learnedAtMinute,s.world.minutes);
   A.equal(tech.acquiredAtCircle,1);
   A.equal(tech.damage,6);A.equal(tech.spellCost.mana,2);
   succeed=true;
  }else{
   A.equal(s.table.arcaneTechniques?.arcane_spark,undefined);
   fail=true;
  }
  const final=E.exportGame(s),rng=s.rngState;
  if(result.learned)A.throws(()=>magic(s,'sparkStudy'),/already been learned/);
  else A.throws(()=>magic(s,'sparkStudy'),/full separate sixday recovery/);
  A.equal(E.exportGame(s),final);A.equal(s.rngState,rng);
  if(succeed&&fail)break;
 }
 A.equal(succeed,true);A.equal(fail,true);
}
function taught(){
 for(let i=1;i<=60;i++){
  const s=academy((i*2654435761)>>>0);
  if(magic(s,'sparkStudy').learned)return s;
 }
 throw Error('No successful honest academy lesson in the deterministic test seeds');
}
{
 const s=taught(),saved=E.exportGame(s),rng=s.rngState;
 enemy(s);
 const opened=E.exportGame(s),prior=s.rngState;
 for(const p of [
  {intent:'cast',techniqueId:'magic_sword'},
  {intent:'cast',techniqueId:'arcane_spark',manaCost:0},
  {intent:'cast',techniqueId:'arcane_spark',playerDamage:900},
  {intent:'cast',techniqueId:'arcane_spark',enemyPlan:'hold'},
  {intent:'cast',techniqueId:'arcane_spark',nonlethal:false},
  {intent:'attack',techniqueId:'arcane_spark'}
 ]){
  A.throws(()=>fight(s,p),/genuinely studied Arcane Spark|learned Arcane Spark|Player attack bonuses|Weapon action and nonlethal|Only a real spellcasting|Only an actual spell or Meridian technique|Only a real attack spell, defensive Ward|prepared physical focus and nonlethal strike apply only to an actual attack intent/);
  A.equal(E.exportGame(s),opened);
  A.equal(s.rngState,prior);
 }
 const initialMana=s.player.mana,initialMinutes=s.world.minutes;
 const hit=fight(s,{intent:'cast',techniqueId:'arcane_spark'});
 A.equal(hit.ownResult.verifiedTechniqueId,'arcane_spark');
 A.equal(hit.ownResult.learnedTechniqueSource,
  'Lumenfall Annex Academy self-study using the pre-authored Arcane Spark pattern and First-Circle spell budgets');
 A.equal(hit.ownResult.castingDC,hit.ownResult.fizzle?12:undefined);
 A.ok(hit.ownResult.roll>=1&&hit.ownResult.roll<=20);
 A.ok(hit.ownResult.manaSpent>=1&&hit.ownResult.manaSpent<=2);
 A.equal(s.player.mana,initialMana-hit.ownResult.manaSpent);
 A.equal(s.world.minutes,initialMinutes+1);
 A.ok(['attack','hold','retreat'].includes(hit.enemyPlan));
 A.equal(s.player.arcane.circles,1);
 // Source-gated spell use must not modify the earlier training proof.
 A.equal(s.table.arcaneTechniques.arcane_spark.damage,6);
 A.notEqual(E.exportGame(s),saved);
}
{
 const s=taught();
 enemy(s);
 s.player.mana=0;
 const original=E.exportGame(s),rng=s.rngState;
 A.throws(()=>fight(s,{intent:'cast',techniqueId:'arcane_spark'}),/Insufficient actual Mana/);
 A.equal(E.exportGame(s),original);A.equal(s.rngState,rng);
 s.player.mana=10;
 s.table.arcaneTechniques.arcane_spark.damage=100;
 const changed=E.exportGame(s);
 A.throws(()=>fight(s,{intent:'cast',techniqueId:'arcane_spark'}),/taught First-Circle Arcane Spark profile/);
 A.equal(E.exportGame(s),changed);
}
{
 const s=academy(44126);enemy(s);
 const pre=E.exportGame(s),rng=s.rngState;
 A.throws(()=>fight(s,{intent:'cast',techniqueId:'arcane_spark'}),
  /actual taught First-Circle Arcane Spark/);
 A.equal(E.exportGame(s),pre);A.equal(s.rngState,rng);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-arcane-first-technique-'));
 try{
  const file=Path.join(dir,'save.json'),s=taught();
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const prior=FS.readFileSync(file,'utf8');
  const status=Turn.execute(file,{id:'arcane_spark_status_0001',mode:'rule',
   system:'arcane',operation:'sparkStatus',params:{}});
  A.equal(status.applied,false);
  A.equal(status.output.rules.known,true);
  A.equal(FS.readFileSync(file,'utf8'),prior);
  const req={id:'arcane_spell_fake_0001',mode:'rule',system:'combat',
   operation:'exchange',params:{intent:'cast',techniqueId:'arcane_spark',mana:0}};
  A.throws(()=>Turn.execute(file,req),/No canonical wound-model combat scene is active/);
  A.equal(FS.readFileSync(file,'utf8'),prior);
  // A genuinely assessed enemy and active fight from a disposable fixture.
  enemy(s);FS.writeFileSync(file,E.exportGame(s)+'\n');
  const opened=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{...req,id:'arcane_spell_fake_battle_0001'}),
   /Player attack bonuses/);
  A.equal(FS.readFileSync(file,'utf8'),opened);
  const cast={id:'arcane_spark_cast_0001',mode:'rule',system:'combat',
   operation:'exchange',params:{intent:'cast',techniqueId:'arcane_spark'}};
  const castResult=Turn.execute(file,cast);
  A.equal(castResult.applied,true);
  A.equal(castResult.output.rules.ownResult.verifiedTechniqueId,'arcane_spark');
  A.equal(Turn.execute(file,cast).duplicate,true);
  const after=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(after.player.mana,s.player.mana-castResult.output.rules.ownResult.manaSpent);
  A.equal(after.world.minutes,s.world.minutes+1);
  A.equal(after.player.arcane.circles,1);
  A.notEqual(FS.readFileSync(file,'utf8'),opened);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('A First Circle alone grants no spell; actual sixday Spark tuition enables one-roll real-Mana nonlethal wound combat');
