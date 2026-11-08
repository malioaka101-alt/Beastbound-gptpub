'use strict';
// The GM controls scene-duration judgements. The engine records elapsed
// time and original world changes, not an extra action timer or free rewards.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),
 World=require('../rules/world'),Turn=require('../scripts/chat-turn.js');
const fresh=seed=>E.newGame({name:'GM-Judged Time Test',seed,path:'undecided'});
const rule=(s,system,operation,params={})=>
 R.act(s,{system,operation,params});
{
 const s=fresh(981501),original=E.exportGame(s),rng=s.rngState;
 for(const params of [
   {},{minutes:0},{minutes:-1},{minutes:30.5},
   {minutes:365*1440+1},{minutes:'60'},
   {minutes:30,forcedOutcome:true},{minutes:30,grantXP:100}
 ]){
  A.throws(()=>rule(s,'world','wait',params),
    /positive integer of minutes/);
  A.equal(E.exportGame(s),original);
  A.equal(s.rngState,rng);
 }
 const originalCoins=s.player.coins,inventory=JSON.stringify(s.player.inventory),
  skills=JSON.stringify(s.player.skills),start=s.world.minutes;
 const result=rule(s,'world','wait',{minutes:75});
 A.equal(result.waited,true);
 A.equal(result.elapsedMinutes,75);
 A.equal(result.daysPassed,0);
 A.equal(s.world.minutes,start+75);
 A.equal(s.player.coins,originalCoins);
 A.equal(JSON.stringify(s.player.inventory),inventory);
 A.equal(JSON.stringify(s.player.skills),skills);
 A.equal(s.player.partnerIds.length,0);
 A.equal(s.log.at(-1).details.origin,'gm-judged-ordinary-time');
 A.equal(s.log.at(-1).details.lifeNeedsRequireActualContext,true);
 const before=E.exportGame(s),stateRng=s.rngState;
 s.encounter={beastId:'actual_beast_needs_resolving'};
 A.throws(()=>rule(s,'world','wait',{minutes:10}),
   /unresolved beast encounter/);
 s.encounter=null;
 A.equal(E.exportGame(s),before);A.equal(s.rngState,stateRng);
 s.world.location='fen';
 A.throws(()=>rule(s,'world','wait',{minutes:10}),/safe settlement/);
 s.world.location='crossing';
 A.equal(E.exportGame(s),before);
 A.throws(()=>rule(s,'world','advance',{days:2}),
   /only a precommitted passageId/);
 A.equal(E.exportGame(s),before);
}
{
 // Crossing midnight is ordinary chronology, not an automatic blocker:
 // the GM judges the interval, while daily/weekly/monthly changes persist.
 const left=fresh(981502),right=fresh(981502);
 const interval=62*1440+83,initial=left.world.minutes;
 const startingMoney=left.player.coins,
   startingInventory=JSON.stringify(left.player.inventory),
   startingSkills=JSON.stringify(left.player.skills);
 const a=rule(left,'world','wait',{minutes:interval});
 const b=rule(right,'world','wait',{minutes:interval});
 A.deepEqual(a,b);
 A.equal(a.elapsedMinutes,interval);
 A.equal(a.daysPassed,62);
 A.ok(a.sixdayTicks.length>=8);
 A.ok(a.monthTicks.length>=2);
 A.equal(left.world.minutes,initial+interval);
 A.equal(left.player.coins,startingMoney);
 A.equal(JSON.stringify(left.player.inventory),startingInventory);
 A.equal(JSON.stringify(left.player.skills),startingSkills);
 A.equal(left.player.partnerIds.length,0);
 A.equal(a.lifeNeedsNotCertified,true);
 A.equal(a.noTrainingOrResearchAward,true);
 A.equal(a.noAutomaticWagesOrContracts,true);
 A.equal(E.exportGame(left),E.exportGame(right),
   'Two identical old checkpoints must produce the same world and RNG');
 const after=E.exportGame(left),afterRng=left.rngState;
 const duplicate=World.finalizeTime(left,initial);
 A.deepEqual(duplicate.sixdayTicks,[]);
 A.deepEqual(duplicate.monthTicks,[]);
 A.equal(E.exportGame(left),after);
 A.equal(left.rngState,afterRng);
}
{
 const s=fresh(981503),start=s.world.minutes;
 const first=rule(s,'opportunity','board');
 A.equal(first.read,true);A.ok(first.newNotices>0);
 A.equal(first.minutes,5);A.equal(s.world.minutes,start+5);
 const known=first.knownNotices;
 const unchanged=E.exportGame(s),rng=s.rngState;
 const again=rule(s,'opportunity','board');
 A.equal(again.read,true);A.equal(again.minutes,0);
 A.equal(again.alreadyKnown,true);A.equal(again.newNotices,0);
 A.deepEqual(again.knownNotices,known);
 A.equal(E.exportGame(s),unchanged);
 A.equal(s.rngState,rng);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-natural-time-')),
  file=Path.join(dir,'save.json');
 const read=()=>FS.readFileSync(file,'utf8'),
  load=()=>E.importGame(read());
 try{
  FS.writeFileSync(file,E.exportGame(fresh(981504))+'\n');
  const opened=Turn.execute(file,{id:'gm_time_first_board_001',
   mode:'act',action:'read guild field notices'});
  A.equal(opened.ok,true);A.equal(opened.applied,true);
  A.equal(opened.output.opportunity.minutes,5);
  const known=read(),rev=load().chatRuntime.revision,oldRng=load().rngState;
  const repeat=Turn.execute(file,{id:'gm_time_reread_001',
   mode:'act',action:'read guild field notices'});
  A.equal(repeat.ok,true);A.equal(repeat.applied,false);
  A.equal(repeat.output.opportunity.minutes,0);
  A.equal(repeat.output.opportunity.alreadyKnown,true);
  A.equal(read(),known);A.equal(load().chatRuntime.revision,rev);
  A.equal(load().rngState,oldRng);
  const req={id:'gm_time_months_001',mode:'rule',system:'world',
   operation:'wait',params:{minutes:35*1440+20},expectedHash:Turn.hash(read())};
  const passage=Turn.execute(file,req);
  A.equal(passage.ok,true);A.equal(passage.applied,true);
  A.equal(passage.output.rules.elapsedMinutes,35*1440+20);
  A.equal(passage.output.rules.daysPassed,35);
  A.equal(load().world.minutes,485+35*1440+20);
  A.equal(load().chatRuntime.revision,rev+1);
  const persisted=read(),rng=load().rngState;
  const replay=Turn.execute(file,req);
  A.equal(replay.duplicate,true);A.equal(replay.recovered,true);
  A.equal(replay.output.rules.elapsedMinutes,passage.output.rules.elapsedMinutes);
  A.equal(read(),persisted);A.equal(load().rngState,rng);
  const stale=Turn.execute(file,{id:'gm_time_stale_001',
   mode:'rule',system:'world',operation:'wait',params:{minutes:12},
   expectedHash:'obsolete-checkpoint'});
  A.equal(stale.ok,false);A.equal(stale.applied,false);
  A.match(stale.error,/Stale checkpoint/);
  A.equal(read(),persisted);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('GM-controlled time passed: no extra reread charge, minutes through multi-month intervals, real independent calendar ticks, no unearned research or income, saved replay and stale protection');
