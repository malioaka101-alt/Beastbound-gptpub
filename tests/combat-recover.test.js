'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),Combat=require('../rules/combat'),H=require('../rules/unified'),Turn=require('../scripts/chat-turn.js');
function fixture(seed=74711){
 const s=E.newGame({name:'Recovery Combat Fixture',seed,path:'undecided'});
 s.beasts.fox={id:'fox',name:'Wild Fox',species:'fenfox',evolutionStage:'Base',
  sapience:1,hp:30,maxHp:30};
 s.encounter={beastId:'fox',observed:true,approaches:0,threat:true};
 s.beasts.fox.combatAssessment={beastId:'fox',species:'fenfox',evolutionStage:'Base',
  sapience:1,worldMinute:s.world.minutes,
  source:'Independent anatomical and tactical field report before a forest ambush',
  behavior:{style:'predatory',nonlethal:true,canCommunicate:false,
   withdrawalDC:15,parleyDC:18,
   source:'Recorded independent pursuit and retreat tendencies for this wild fox'},
  stats:{toughness:6,defense:12,stamina:8,vigor:1,will:1,
   offM:0,durM:0,sapience:1,attack:3,damage:4,boxes:[3,2,1]}};
 return s;
}
const begin=s=>R.act(s,{system:'combat',operation:'begin',params:{beastId:'fox'}});
const exchange=(s,params)=>R.act(s,{system:'combat',operation:'exchange',params});
{
 const s=fixture(),minute=s.world.minutes;begin(s);
 const c=Combat.get(s,'player');
 c.stamina=c.maxStamina-10;H.sync(s,{source:'wounds'});
 const original=E.exportGame(s),rng=s.rngState;
 for(const p of [
  {intent:'recover',attackId:'staff_strike'},
  {intent:'recover',nonlethal:true},
  {intent:'recover',enduranceTrained:true},
  {intent:'recover',gained:99},
  {intent:'recover',enemyPlan:'hold'}
 ])A.throws(()=>exchange(s,p),/Player attack bonuses|Weapon action and nonlethal strike/);
 A.equal(E.exportGame(s),original);A.equal(s.rngState,rng);
 const own=exchange(s,{intent:'recover'});
 A.equal(own.ownResult.recovering,true);
 A.equal(own.ownResult.uses,1);A.equal(own.ownResult.gained,2+c.vigor);
 A.equal(c.recoverUses,1);A.equal(own.elapsedMinutes,1);
 A.equal(s.world.minutes,minute+1);
 A.ok(['attack','hold','retreat'].includes(own.enemyPlan));
 A.equal(s.player.stamina,c.stamina);
 if(s.battle){
  const x=exchange(s,{intent:'recover'});
  A.equal(x.ownResult.gained,0);A.equal(x.ownResult.uses,1);
  A.equal(c.recoverUses,1);
 }
}
{
 const s=fixture(74712);begin(s);
 A.throws(()=>R.act(s,{system:'combat',operation:'recover',params:{id:'player'}}),/Direct combat recovery/);
 A.throws(()=>H.sleep(s,{hours:8}),/unresolved encounter/);
 s.battle=null; // disposable test scenario after an adjudicated disengagement
 const c=Combat.get(s,'player');
 c.recoverUses=1;c.stamina=c.maxStamina-8;H.sync(s,{source:'wounds'});
 const before=E.exportGame(s),minute=s.world.minutes;
 A.throws(()=>H.sleep(s,{hours:1}),/sleep hours must be an integer/);
 A.equal(E.exportGame(s),before);
 const night=H.sleep(s,{hours:8});
 A.equal(night.sleptHours,8);A.equal(s.world.minutes,minute+480);
 A.equal(c.recoverUses,0);A.equal(c.stamina,c.maxStamina);
 A.equal(s.player.stamina,c.stamina);
 A.equal(c.firstAided,false);
 // Never lose Stamina just because Vigor is very low.
 const isolated=E.newGame({name:'Pure Recovery Check',seed:74713});
 Combat.register(isolated,{id:'dummy',name:'Exhausted Fighter',
  toughness:5,defense:12,stamina:10,vigor:-5});
 const d=Combat.get(isolated,'dummy');d.stamina=5;
 const math=Combat.recover(isolated,{id:'dummy',enduranceTrained:false});
 A.equal(math.gained,0);A.equal(d.stamina,5);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-round-recover-'));
 try{
  const file=Path.join(dir,'save.json'),s=fixture(74714);begin(s);
  const c=Combat.get(s,'player');
  c.stamina=c.maxStamina-6;H.sync(s,{source:'wounds'});
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const before=FS.readFileSync(file,'utf8');
  const cheat={id:'recover_cheat_00001',mode:'rule',system:'combat',
   operation:'recover',params:{id:'player',enduranceTrained:true}};
  A.throws(()=>Turn.execute(file,cheat),/Direct combat recovery/);
  A.equal(FS.readFileSync(file,'utf8'),before);
  const req={id:'recover_exchange_00001',mode:'rule',system:'combat',
   operation:'exchange',params:{intent:'recover'}};
  const got=Turn.execute(file,req);
  A.equal(got.applied,true);A.equal(got.output.rules.ownResult.recovering,true);
  A.equal(got.output.rules.ownResult.uses,1);
  A.equal(Turn.execute(file,req).duplicate,true);
  const after=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(after.world.minutes,s.world.minutes+1);
  A.equal(after.table.combatants.player.recoverUses,1);
  A.equal(after.player.stamina,after.table.combatants.player.stamina);
  const stable=FS.readFileSync(file,'utf8');
  A.equal(FS.readFileSync(file,'utf8'),stable);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Verified in-combat Recover and full-night rest regression passed');
