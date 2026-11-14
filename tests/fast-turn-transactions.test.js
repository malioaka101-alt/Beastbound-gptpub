'use strict';
// Disposable saves only: real sequential checks, one final write and no rerolls.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path');
const E=require('../engine'),R=require('../rules'),Turn=require('../scripts/chat-turn'),
 Preflight=require('../scripts/turn-preflight');
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-batch-regression-'));
try{
 const file=Path.join(dir,'save.json');
 const s=E.newGame({seed:761005,name:'Sequential Fixture',path:'soul'});
 R.unified.ensurePlayer(s);
 // This disposable fixture has sufficient skill to avoid a random dangerous
 // interruption; the separate partial-stop case tests interruption directly.
 s.player.attributes.wis=30;s.player.skills.cultivation.rank=5;
 FS.writeFileSync(file,E.exportGame(s)+'\n');
 const old=FS.readFileSync(file,'utf8');
 const original=E.importGame(old);
 const req={id:'sequence_practice_sleep_761005',mode:'sequence',
  expectedHash:Turn.hash(old),
  steps:[
   {mode:'rule',system:'discipline',operation:'practice',
    params:{system:'soul',method:'self-awareness',minutes:60}},
   {mode:'rule',system:'health',operation:'sleep',params:{hours:8}}
  ],
  scene:'The next morning at an established shelter, after a personal Soul session and ordinary sleep.',
  summary:'An original independently practised hour and one verified night of rest completed.',
  focus:['Next morning']};
 A.equal(Preflight.validate(req),req);
 const result=Turn.execute(file,req);
 A.equal(result.ok,true);
 A.equal(result.applied,true);
 A.equal(result.output.sequence.completed,true);
 A.equal(result.output.sequence.steps.length,2);
 const step=result.output.sequence.steps[0];
 A.ok(step.output.rules.check.roll>=1);
 A.equal(step.output.rules.staminaSpent,1);
 const done=E.importGame(FS.readFileSync(file,'utf8'));
 A.equal(done.world.minutes,original.world.minutes+60+8*60);
 A.equal(done.player.stamina,done.player.maxStamina);
 A.equal(done.table.disciplineTraining.soul.sessions,1);
 A.equal(done.chatRuntime.scene,req.scene);
 A.equal(done.chatRuntime.journal.at(-1).text,req.summary);
 A.equal(done.chatRuntime.applied[req.id].receipt.output.sequence.steps[0].output.rules.check.roll,
  step.output.rules.check.roll);
 const final=FS.readFileSync(file,'utf8'),rng=done.rngState;
 const replay=Turn.execute(file,req);
 A.equal(replay.duplicate,true);A.equal(replay.recovered,true);
 A.deepEqual(replay.output,result.output);
 A.equal(FS.readFileSync(file,'utf8'),final);
 A.equal(E.importGame(final).rngState,rng);
 const stale={...req,id:'sequence_stale_761005',expectedHash:Turn.hash(old)};
 const refusal=Turn.execute(file,stale);
 A.equal(refusal.applied,false);
 A.match(refusal.error,/Stale/);
 A.equal(FS.readFileSync(file,'utf8'),final);
 A.throws(()=>Turn.execute(file,{...req,id:'sequence_invalid_761005',
  steps:[req.steps[0],{mode:'rule',system:'combat',operation:'exchange',params:{}}]}),
 /not a supported source-owned/);
 A.throws(()=>Turn.execute(file,{...req,id:'sequence_nested_761005',
  steps:[req.steps[0],{mode:'sequence',steps:req.steps}]}),
 /not a supported source-owned/);
 A.equal(FS.readFileSync(file,'utf8'),final);
 // Source-owned step two rejects an invalid elapsed time AFTER an actual
 // first step: the successful prefix survives once; no rerolled practice.
 const stopped={id:'sequence_stop_761005',mode:'sequence',
  steps:[
   {mode:'rule',system:'health',operation:'sleep',params:{hours:8}},
   {mode:'rule',system:'world',operation:'wait',params:{minutes:0}}
  ],scene:'This must not overwrite the scene if the planned second step fails.'};
 const partial=Turn.execute(file,stopped);
 A.equal(partial.ok,true);
 A.equal(partial.applied,true);
 A.equal(partial.output.sequence.completed,false);
 A.equal(partial.output.sequence.steps.length,1);
 A.equal(partial.output.sequence.stopped.beforeStep,2);
 const afterStop=FS.readFileSync(file,'utf8');
 const stopState=E.importGame(afterStop);
 A.equal(stopState.world.minutes,done.world.minutes+480);
 A.equal(stopState.chatRuntime.scene,req.scene);
 A.equal(Turn.execute(file,stopped).duplicate,true);
 A.equal(FS.readFileSync(file,'utf8'),afterStop);
 // A normal rule can commit its new pickup scene without a second checkpoint.
 const next={id:'inline_scene_761005',mode:'rule',system:'world',
  operation:'wait',params:{minutes:5},
  scene:'A new quiet, witnessed pickup point after five genuine minutes.',
  summary:'Five minutes passed without an invented income or award.'};
 const inline=Turn.execute(file,next);
 A.equal(inline.ok,true);A.equal(inline.applied,true);
 const afterInline=E.importGame(FS.readFileSync(file,'utf8'));
 A.equal(afterInline.chatRuntime.scene,next.scene);
 A.equal(afterInline.chatRuntime.journal.at(-1).text,next.summary);
 A.equal(afterInline.chatRuntime.applied[next.id].mode,'rule');
 A.throws(()=>Preflight.validate({...next,id:'bad_scene_00001',scene:'x'.repeat(451)}),
  /Scene must/);
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('Bounded sequence: original one-roll practice, sleep, interruption, stale hash, exact replay and inline scene verified');
