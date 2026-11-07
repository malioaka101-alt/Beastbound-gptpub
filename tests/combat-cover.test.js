'use strict';
// Wound combat stays authoritative: real terrain, independent enemy behaviour,
// player-owned action economy and source-derived—not caller-selected—cover.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),Agency=require('../rules/combat-agency'),
 P=require('../panels.js'),Turn=require('../scripts/chat-turn.js');
const rule=(s,operation,params={})=>R.act(s,{system:'combat',operation,params});
function fresh(seed=78321,location='forest'){
 const s=E.newGame({name:'Verified Position Fixture',seed,path:'undecided'});
 if(location==='forest')A.equal(E.dispatch(s,'travel forest').ok,true);
 if(location==='ruins'){s.world.location='ruins';} // Disposable location fixture only.
 s.beasts.fox={id:'fox',name:'Wild Lanternfen Fox',species:'fenfox',
  evolutionStage:'Base',sapience:1,hp:30,maxHp:30,location:s.world.location};
 s.encounter={beastId:'fox',observed:true,approaches:0,threat:true};
 s.beasts.fox.combatAssessment={
  beastId:'fox',species:'fenfox',evolutionStage:'Base',sapience:1,
  worldMinute:s.world.minutes,
  source:'Independently witnessed anatomical assessment of a specific local fox before the dangerous encounter',
  behavior:{style:'predatory',nonlethal:true,canCommunicate:false,
   withdrawalDC:15,parleyDC:19,
   source:'Pre-observed individual predator acts aggressively but avoids lethal escalation'},
  stats:{toughness:60,defense:12,stamina:8,vigor:1,will:1,
   offM:0,durM:0,sapience:1,attack:2,damage:0,boxes:[3,2,1]}
 };
 s.player.skills.combat.rank=1;
 s.player.inventory.training_staff=1;s.player.equippedWeapon='training_staff';
 s.player.combatActions={staff_strike:{
  id:'staff_strike',kind:'mundane',item:'training_staff',
  attribute:'str',damage:3,offM:0,attackBonus:0,canNonlethal:true,
  worldMinute:s.world.minutes,
  source:'Guild training staff with independently verified equipment and ordinary combat action'
 }};
 return s;
}
function suitable(location='forest'){
 for(let seed=78321;seed<78500;seed++){
  const s=fresh(seed,location);rule(s,'begin',{beastId:'fox'});
  const expected=[];
  for(const round of [1,2,3]){
   s.battle.round=round;
   expected.push(Agency.choose(s).plan);
  }
  s.battle.round=1;
  if(expected.every(x=>x==='attack'))return s;
 }
 throw Error('Cannot find a witnessed test-only seed with three opponent attack intentions');
}
{
 const s=fresh(78422,'crossing');
 rule(s,'begin',{beastId:'fox'});
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>rule(s,'exchange',{intent:'take_cover'}),/no verified solid cover/);
 for(const p of [{intent:'take_cover',coverBonus:50},
  {intent:'take_cover',cover:'unbreakable tower'},
  {intent:'take_cover',enemyPlan:'hold'}])
  A.throws(()=>rule(s,'exchange',p),/Player attack bonuses/);
 A.equal(s.rngState,rng);A.equal(E.exportGame(s),before);
 A.equal(rule(s,'sceneStatus').availableCover,null);
 A.equal(E.exportGame(s),before);
}
{
 const s=suitable(),base=R.combat.get(s,'player').defense,firstMinute=s.world.minutes;
 const view=rule(s,'sceneStatus');
 A.equal(view.cover,null);A.equal(view.availableCover,'copperwood trunks');
 const old=E.exportGame(s),rng=s.rngState;
 A.throws(()=>rule(s,'sceneStatus',{boost:99}),/read-only view/);
 A.equal(E.exportGame(s),old);A.equal(s.rngState,rng);
 const into=rule(s,'exchange',{intent:'take_cover'});
 A.equal(into.enemyPlan,'attack');
 A.equal(into.ownResult.cover,'copperwood trunks');
 A.equal(into.enemyResult.defense,base+2);
 A.equal(s.world.minutes,firstMinute+1);
 A.equal(s.battle.round,2);
 A.equal(rule(s,'sceneStatus').coverBonus,2);
 A.match(P.core(s),/Behind copperwood trunks/);
 const beforeRest=E.exportGame(s),rolled=s.rngState;
 A.throws(()=>rule(s,'exchange',{intent:'take_cover'}),/already occupying/);
 A.equal(E.exportGame(s),beforeRest);A.equal(s.rngState,rolled);
 const braced=rule(s,'exchange',{intent:'defend',playerBrace:false});
 A.equal(braced.enemyPlan,'attack');
 A.equal(braced.enemyResult.defense,base+5);
 A.equal(rule(s,'sceneStatus').cover,'copperwood trunks');
 const exiting=rule(s,'exchange',{intent:'attack',attackId:'staff_strike'});
 A.equal(exiting.enemyPlan,'attack');
 A.equal(exiting.enemyResult.defense,base);
 A.equal(exiting.ownResult.verifiedActionId,'staff_strike');
 if(s.battle)A.equal(rule(s,'sceneStatus').cover,null);
 A.equal(s.world.minutes,firstMinute+3);
}
{
 const s=suitable();
 rule(s,'exchange',{intent:'take_cover'});
 A.ok(s.battle);
 s.battle.playerCover.kind='impossible fortress';
 const bad=E.exportGame(s),rng=s.rngState;
 A.throws(()=>rule(s,'sceneStatus'),/source-established obstacle/);
 A.throws(()=>rule(s,'exchange',{intent:'defend'}),/source-established obstacle/);
 A.equal(E.exportGame(s),bad);A.equal(s.rngState,rng);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-wound-cover-'));
 try{
  const file=Path.join(dir,'save.json'),s=suitable();
  // Source-aware battle begin already established on test-only state.
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const saved=FS.readFileSync(file,'utf8');
  const bad={id:'cover_cheat_00001',mode:'rule',system:'combat',
   operation:'exchange',params:{intent:'take_cover',coverBonus:100}};
  A.throws(()=>Turn.execute(file,bad),/Player attack bonuses/);
  A.equal(FS.readFileSync(file,'utf8'),saved);
  const action={id:'cover_move_00001',mode:'rule',system:'combat',
   operation:'exchange',params:{intent:'take_cover'}};
  const moved=Turn.execute(file,action);
  A.equal(moved.applied,true);
  A.equal(moved.output.rules.ownResult.coverBonus,2);
  A.equal(Turn.execute(file,action).duplicate,true);
  const checkpoint=FS.readFileSync(file,'utf8');
  const view=Turn.execute(file,{id:'cover_status_00001',mode:'rule',
   system:'combat',operation:'sceneStatus',params:{}});
  A.equal(view.applied,false);A.equal(view.output.rules.coverBonus,2);
  A.equal(FS.readFileSync(file,'utf8'),checkpoint);
  A.throws(()=>Turn.execute(file,{id:'cover_repeat_00001',mode:'rule',
   system:'combat',operation:'exchange',params:{intent:'take_cover'}}),/already occupying/);
  A.equal(FS.readFileSync(file,'utf8'),checkpoint);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Real forest cover takes an exchange, protects wounds and cannot be fabricated or rerolled');
