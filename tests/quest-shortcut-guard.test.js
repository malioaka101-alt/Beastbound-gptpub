'use strict';
// Only disposable temporary saves; never load or alter a campaign checkpoint.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),Turn=require('../scripts/chat-turn.js');
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-quest-closed-'));
try{
 const file=Path.join(dir,'save.json');
 const s=E.newGame({name:'Quest Guard Fixture',seed:77342});
 FS.writeFileSync(file,E.exportGame(s)+'\n');
 const before=FS.readFileSync(file,'utf8'),rng=s.rngState;
 for(const [id,action] of [
  ['quest_board_guard_001','guild'],
  ['quest_accept_guard_003','quest accept sample'],
  ['quest_accept_guard_004','quest   accept sample'],
  ['quest_submit_guard_005','quest submit sample'],
  ['quest_submit_guard_006','quest   submit sample']
 ]){
  A.throws(()=>Turn.execute(file,{id,mode:'act',action}),/Legacy quest board, acceptance and submission are retired/);
  A.equal(FS.readFileSync(file,'utf8'),before,'rejected quest cannot mutate the save');
  A.equal(E.importGame(FS.readFileSync(file,'utf8')).rngState,rng,'rejected quest cannot roll');
 }
 // 'quest board' is no longer a free-reward shortcut: it now reaches an
 // actually present guild bulletin with real ecological field objectives.
 const request={id:'quest_board_guard_002',mode:'act',action:'quest board'};
 const shown=Turn.execute(file,request);
 A.equal(shown.applied,true);
 A.equal(shown.output.opportunity.read,true);
 A.equal(shown.output.opportunity.newNotices,2);
 A.ok(shown.output.opportunity.knownNotices.every(x=>
  x.reward.includes('No promised currency')));
 A.equal(Turn.execute(file,request).duplicate,true);
 const loaded=E.importGame(FS.readFileSync(file,'utf8'));
 A.equal(loaded.rngState,rng,'Public bulletin reading cannot roll');
 A.equal(loaded.player.coins,s.player.coins,'No payment or prize is invented');
 A.equal(loaded.world.minutes,s.world.minutes+5,'Reading consumes real world time');
 A.equal(loaded.player.quests?.length||0,s.player.quests?.length||0);
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('Legacy quest shortcuts remain fail-closed without an issuer and objective witness');
