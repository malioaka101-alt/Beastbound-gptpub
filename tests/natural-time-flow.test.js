'use strict';
// Fewer arbitrary minute charges without undermining actual elapsed time.
// One world clock, source-backed waiting, no invisible reward, replay-safe.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),E=require('../engine.js'),
 R=require('../rules'),Turn=require('../scripts/chat-turn.js');
const call=(s,system,operation,params={})=>
 R.act(s,{system,operation,params});
const fresh=seed=>E.newGame({name:'Natural Time Verification',seed,path:'undecided'});
{
 const s=fresh(981501),original=E.exportGame(s),rng=s.rngState;
 for(const params of [
  {},{minutes:0},{minutes:361},{minutes:-1},{minutes:30.5},
  {minutes:60,earnedSkill:'arcana'},{minutes:30,forcedEvent:true},
  {minutes:'60'}
 ]){
  A.throws(()=>call(s,'world','wait',params),/accepts only 1–360/);
  A.equal(E.exportGame(s),original);A.equal(s.rngState,rng);
 }
 const before=s.world.minutes,purse=s.player.coins,
  inventory=JSON.stringify(s.player.inventory),
  skills=JSON.stringify(s.player.skills);
 const result=call(s,'world','wait',{minutes:75});
 A.equal(result.waited,true);
 A.equal(result.elapsedMinutes,75);
 A.equal(s.world.minutes,before+75);
 A.equal(s.player.coins,purse);
 A.equal(JSON.stringify(s.player.inventory),inventory);
 A.equal(JSON.stringify(s.player.skills),skills);
 A.equal(s.player.stamina,s.player.maxStamina);
 A.equal(s.player.qi,s.player.maxQi);
 A.equal(s.player.partnerIds.length,0);
 A.equal(s.encounter,null);
 A.equal(s.log.at(-1).details.origin,'ordinary-safe-local-wait');
 A.equal(s.log.at(-1).details.elapsedMinutes,75);
 // Waiting cannot create a bedtime-free skip or bypass risk of encounters.
 const resultBytes=E.exportGame(s),afterRng=s.rngState;
 s.encounter={beastId:'someone'};
 A.throws(()=>call(s,'world','wait',{minutes:5}),/Unresolved beast encounter/);
 s.encounter=null;
 A.equal(E.exportGame(s),resultBytes);A.equal(s.rngState,afterRng);
 const location=s.world.location;
 s.world.location='fen';
 A.throws(()=>call(s,'world','wait',{minutes:5}),/genuinely safe, established settlement/);
 s.world.location=location;
 A.equal(E.exportGame(s),resultBytes);
 // The historical provisioned DAYS route remains protected.
 A.throws(()=>call(s,'world','advance',{days:2}),/only a precommitted passageId/);
 A.equal(E.exportGame(s),resultBytes);
}
{
 const s=fresh(981502);
 s.world.minutes=23*60+55;
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>call(s,'world','wait',{minutes:5}),/Overnight passage/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const local=call(s,'world','wait',{minutes:3});
 A.equal(local.waited,true);
 A.equal(s.world.minutes,23*60+58);
}
{
 // A first reading produces actual time and source-witnessed postings.
 // Subsequent rereads of the exact same board are ordinary observation.
 const s=fresh(981503),start=s.world.minutes;
 const first=call(s,'opportunity','board');
 A.equal(first.read,true);A.ok(first.newNotices>0);
 A.equal(first.minutes,5);A.equal(s.world.minutes,start+5);
 const known=first.knownNotices;
 const unchanged=E.exportGame(s),rng=s.rngState;
 const again=call(s,'opportunity','board');
 A.equal(again.read,true);A.equal(again.minutes,0);
 A.equal(again.alreadyKnown,true);A.equal(again.newNotices,0);
 A.deepEqual(again.knownNotices,known);
 A.equal(E.exportGame(s),unchanged);A.equal(s.rngState,rng);
 // The same repeat read also works through the actual file-backed runner.
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-natural-time-'));
 const file=Path.join(dir,'save.json');
 const read=()=>FS.readFileSync(file,'utf8'),
  state=()=>E.importGame(read());
 try{
  FS.writeFileSync(file,E.exportGame(fresh(981504))+'\n');
  const firstTurn={id:'natural_first_board_001',mode:'act',action:'read guild field notices'};
  const opened=Turn.execute(file,firstTurn);
  A.equal(opened.ok,true);A.equal(opened.applied,true);
  A.equal(opened.output.opportunity.minutes,5);
  const afterBoard=read(),revision=state().chatRuntime.revision,
   oldRng=state().rngState;
  const repeat=Turn.execute(file,{id:'natural_revisit_board_001',
   mode:'act',action:'read guild field notices'});
  A.equal(repeat.ok,true);A.equal(repeat.applied,false);
  A.equal(repeat.output.opportunity.minutes,0);
  A.equal(repeat.output.opportunity.alreadyKnown,true);
  A.equal(read(),afterBoard);A.equal(state().chatRuntime.revision,revision);
  A.equal(state().rngState,oldRng);
  const wait={id:'natural_wait_to_noon_001',mode:'rule',system:'world',
   operation:'wait',params:{minutes:235},expectedHash:Turn.hash(read())};
  const spent=Turn.execute(file,wait);
  A.equal(spent.ok,true);A.equal(spent.applied,true);
  A.equal(spent.output.rules.elapsedMinutes,235);
  A.equal(state().world.minutes,12*60);
  A.equal(state().chatRuntime.revision,revision+1);
  A.equal(state().rngState,oldRng);
  const saved=read(),postRng=state().rngState;
  const duplicate=Turn.execute(file,wait);
  A.equal(duplicate.duplicate,true);
  A.equal(duplicate.recovered,true);
  A.equal(duplicate.output.rules.elapsedMinutes,235);
  A.equal(read(),saved);A.equal(state().rngState,postRng);
  const stale=Turn.execute(file,{id:'natural_stale_wait_001',
   mode:'rule',system:'world',operation:'wait',params:{minutes:60},
   expectedHash:'previous-day'});
  A.equal(stale.ok,false);A.equal(stale.applied,false);
  A.match(stale.error,/Stale checkpoint/);
  A.equal(read(),saved);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
{
// The base engine advances minutes/daily conditions exactly once; the world
// finalizer observes the elapsed period and must not process the same
// independent sixday/month event a second time when the turn runner checks.
 const s=fresh(981505),old=s.world.minutes;
 E.advance(s,6*1440);
 const World=require('../rules/world');
 const once=World.finalizeTime(s,old);
 A.ok(once.sixdayTicks.length>=1);
 const after=E.exportGame(s),rng=s.rngState;
 const repeat=World.finalizeTime(s,old);
 A.deepEqual(repeat.sixdayTicks,[]);
 A.deepEqual(repeat.monthTicks,[]);
 A.equal(E.exportGame(s),after);
 A.equal(s.rngState,rng);
}
console.log('Natural time-flow checks passed: free rereads, bounded real safe waiting, protected overnight and world passage, one original saved turn, replay and stale safety');
