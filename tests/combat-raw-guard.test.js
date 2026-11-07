'use strict';
// A playable private turn must never create invented combatants, arbitrarily
// wound someone, skip rounds, or rest weeks without real scene context.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),Rules=require('../rules'),Combat=require('../rules/combat'),Turn=require('../scripts/chat-turn.js');
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-no-raw-combat-'));
try{
 const filename=Path.join(dir,'save.json'),s=E.newGame({name:'Wound Integrity',seed:61237});
 FS.writeFileSync(filename,E.exportGame(s)+'\n');
 const before=FS.readFileSync(filename,'utf8');
 const attempts=[
  ['combat','register',{id:'dummy',name:'Weak target',defense:1,toughness:1}],
  ['combat','attack',{targetId:'player',modifier:100,damage:100}],
  ['combat','attack',{targetId:'player',castingDC:2,manaCost:0,modifier:100,damage:100}],
  ['combat','newRound',{ids:['player']}],
  ['combat','recover',{id:'player'}],
  ['combat','rest',{id:'player',nights:365,weeks:52}],
  ['health','linkBeast',{beastId:'fake',toughness:1,defense:1,stamina:1}]
 ];
 for(let i=0;i<attempts.length;i++){
  const [system,operation,params]=attempts[i];
  const req={id:'unsafe_combat_'+String(i+1).padStart(4,'0'),
   mode:'rule',system,operation,params};
  A.throws(()=>Turn.execute(filename,req),/Raw combatant|Direct attack|Spell attacks|Round advancement|Direct combat recovery|Direct wound rest|combatant measurements/);
  A.equal(FS.readFileSync(filename,'utf8'),before);
 }
 A.equal(E.importGame(before).rngState,s.rngState);
 A.equal(E.importGame(before).world.minutes,s.world.minutes);
 // Pure reference calculations remain possible on an isolated test object;
 // they have no executable role in the campaign's legal action interface.
 const isolated=E.newGame({name:'Combat Formula Only',seed:61238});
 Combat.register(isolated,{id:'dummy',name:'Ward Dummy',toughness:5,defense:1,ward:{steps:6,magnitude:2}});
 const attack=Combat.attack(isolated,{targetId:'dummy',modifier:50,damage:15,brace:false});
 A.equal(attack.hit,true);
 A.equal(FS.readFileSync(filename,'utf8'),before);
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('No raw combat bypass operations in playable rule turns');
