'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),Combat=require('../rules/combat'),
 Core=require('../rules/core'),Turn=require('../scripts/chat-turn.js');
const s=E.newGame({name:'Contest Evidence Fixture',seed:34571});
const raw=E.exportGame(s),rng=s.rngState;
for(const [operation,params,error] of [
 ['opposed',{a:{modifier:100,adv:1},b:{modifier:-100,adv:-1}},/Direct opposed rolls/],
 ['contestForce',{a:{modifier:60,magnitude:10},b:{modifier:-60,magnitude:0}},/Direct force contests/]
 ]){
 A.throws(()=>R.act(s,{system:'core',operation,params}),error);
 A.equal(E.exportGame(s),raw);A.equal(s.rngState,rng);
}
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-contest-guard-'));
try{
 const file=Path.join(dir,'save.json');FS.writeFileSync(file,raw+'\n');
 const saved=FS.readFileSync(file,'utf8');
 for(const [index,operation,params] of [
  [1,'opposed',{a:{modifier:100},b:{modifier:-100}}],
  [2,'contestForce',{a:{modifier:100,magnitude:10},b:{modifier:-100,magnitude:0}}]
 ]){
  A.throws(()=>Turn.execute(file,{id:'contest_bypass_'+String(index).padStart(4,'0'),
   mode:'rule',system:'core',operation,params}),
   /Direct opposed rolls|Direct force contests/);
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }
 const unchanged=E.importGame(saved);A.equal(unchanged.rngState,rng);
 // The mathematical reference procedures are still useful to trusted
 // combat and isolated test vectors; only *playable* free rolls are blocked.
 const a=E.newGame({seed:34572}),b=E.newGame({seed:34573});
 const contest=Core.opposed(a,{modifier:2},{modifier:1});
 A.ok(['a','b'].includes(contest.winner));
 const force=Combat.contestForce(b,{a:{modifier:2,magnitude:2},b:{modifier:4,magnitude:1}});
 A.ok(['a','b'].includes(force.winner));
 A.equal(FS.readFileSync(file,'utf8'),saved);
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('Raw opposed and force contest dice cannot be selected in playable turns');
