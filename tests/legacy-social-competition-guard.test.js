'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),Turn=require('../scripts/chat-turn.js');
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-legacy-social-rank-'));
try{
 const file=Path.join(dir,'save.json');
 const s=E.newGame({name:'Welfare and Competition Fixture',seed:73621});
 FS.writeFileSync(file,E.exportGame(s)+'\n');
 const saved=FS.readFileSync(file,'utf8'),rng=s.rngState;
 const banned=[
  ['approach',/A present animal encounter is required/],
  ['approach slowly',/A present animal encounter is required/],
  ['befriend',/Legacy automatic befriending/],
  // Real food offers are now legal only with an actual observed wild animal,
  // real compatible food, independent animal consent and no forced bond.
  ['offer food',/truly witnessed, present, unowned local animal/],
  ['feed',/truly witnessed, present, unowned local animal/],
  ['offer rations',/truly witnessed, present, unowned local animal/],
  ['compete field_assessment',/Unscheduled prototype competitions/],
  ['compete precision_trials',/Unscheduled prototype competitions/],
  ['compete',/Unscheduled prototype competitions/],
  ['competitions',/Unscheduled prototype competitions/],
  ['tournaments',/Unscheduled prototype competitions/],
  ['events',/Unscheduled prototype competitions/]
 ];
 for(let i=0;i<banned.length;i++){
  const [action,error]=banned[i];
  A.throws(()=>Turn.execute(file,{id:'blocked_action_'+String(i).padStart(5,'0'),
   mode:'act',action}),error);
  A.equal(FS.readFileSync(file,'utf8'),saved,'blocked action did not checkpoint: '+action);
  A.equal(E.importGame(saved).rngState,rng,'blocked action did not consume RNG');
 }
 // Normal harmless play remains available: no blanket ban on natural actions.
 const look=Turn.execute(file,{id:'safe_look_00001',mode:'act',action:'look'});
 A.equal(look.ok,true);
 A.equal(look.applied,false); // A harmless glance must never evict real story/roll evidence.
 A.equal(look.output.scene.location,s.world.location);
 A.equal(FS.readFileSync(file,'utf8'),saved);
 const seen=E.importGame(FS.readFileSync(file,'utf8'));
 A.equal(seen.rngState,rng);
 A.equal(seen.world.minutes,s.world.minutes);
 A.equal(seen.log.length,s.log.length);
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('Legacy forced-social and unscheduled reward shortcuts blocked in private turns');
