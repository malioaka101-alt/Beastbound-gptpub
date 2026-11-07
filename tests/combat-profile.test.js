'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
function fresh(seed=72100){
 const s=E.newGame({name:'Combat Source Fixture',seed,path:'undecided'});
 s.beasts.wild={id:'wild',name:'Free Reed Fox',species:'fenfox',
  evolutionStage:'Base',sapience:1,hp:30,maxHp:30,location:'crossing'};
 s.encounter={beastId:'wild',observed:true,approaches:0,threat:true};
 return s;
}
function plan(s){
 s.beasts.wild.combatAssessment={beastId:'wild',species:'fenfox',evolutionStage:'Base',
  sapience:1,worldMinute:s.world.minutes,
  source:'Independent recorded anatomical field appraisal of the individual Reed Fox',
  behavior:{style:'cautious',nonlethal:true,canCommunicate:false,
   withdrawalDC:13,parleyDC:18,
   source:'Observed cautious avoidance and escape behavior in this specific fox'},
  stats:{toughness:6,defense:12,stamina:8,vigor:1,will:1,
   offM:0,durM:0,sapience:1,attack:3,damage:4,boxes:[3,2,1]}};
}
const begin=(s,p={beastId:'wild'})=>R.act(s,{system:'combat',operation:'begin',params:p});
{
 const s=fresh(),before=E.exportGame(s),rng=s.rngState;
 for(const p of [
  {beastId:'wild',source:'I say it is weak'},
  {beastId:'wild',toughness:1,defense:1,damage:100},
  {beastId:'unknown'}
 ])A.throws(()=>begin(s,p),/only an encountered beastId|current unengaged, known beast/);
 A.throws(()=>begin(s),/source-recorded individual beast combat profile/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 plan(s);s.beasts.wild.combatAssessment.stats.damage=1000;
 const damaged=E.exportGame(s);
 A.throws(()=>begin(s),/damage must be an integer/);
 A.equal(E.exportGame(s),damaged);
 s.beasts.wild.combatAssessment.stats.damage=4;
 s.beasts.wild.combatAssessment.evolutionStage='Other';
 const wrong=E.exportGame(s);
 A.throws(()=>begin(s),/source-recorded individual beast combat profile/);
 A.equal(E.exportGame(s),wrong);
}
{
 const temp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-combat-source-'));
 try{
  const file=Path.join(temp,'save.json'),s=fresh(72101);plan(s);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const original=FS.readFileSync(file,'utf8');
  const spoof={id:'combat_spoof_00001',mode:'rule',system:'combat',
   operation:'begin',params:{beastId:'wild',toughness:1,defense:1,damage:0}};
  A.throws(()=>Turn.execute(file,spoof),/only an encountered beastId/);
  A.equal(FS.readFileSync(file,'utf8'),original);
  const req={id:'combat_open_00001',mode:'rule',system:'combat',
   operation:'begin',params:{beastId:'wild'}};
  const response=Turn.execute(file,req);
  A.equal(response.applied,true);A.equal(response.output.rules.started,true);
  A.equal(response.output.rules.verifiedIndividualProfile,true);
  A.equal(Turn.execute(file,req).duplicate,true);
  const save=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(save.table.combatants['beast:wild'].attackModifier,3);
  A.equal(save.table.combatants['beast:wild'].damage,4);
  A.equal(save.table.combatants['beast:wild'].toughness,6);
  A.equal(save.beasts.wild.combatAssessment.used,true);
  A.equal(save.battle.beastId,'wild');
  A.equal(save.encounter,null);
  const after=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{...req,id:'combat_open_00002'}),/current unengaged, known beast/);
  A.equal(FS.readFileSync(file,'utf8'),after);
 }finally{FS.rmSync(temp,{recursive:true,force:true});}
}
console.log('Combat individual-profile provenance tests passed');
