'use strict';
// Simulate a workflow crash after the atomic save but before results/<id>.json.
// The original d20 receipt must be recoverable, never rolled a second time.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path');
const E=require('../engine.js'),Turn=require('../scripts/chat-turn.js');

const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-turn-receipt-'));
try {
 const file=Path.join(dir,'save.json');
 const s=E.newGame({name:'Original Turn Receipt Fixture',seed:998741,path:'undecided'});
 A.equal(E.dispatch(s,'travel fen').ok,true);
 FS.writeFileSync(file,E.exportGame(s)+'\n');

 const survey={id:'receipt_survey_00001',mode:'rule',system:'world',
  operation:'habitatSurvey',params:{}};
 const prepared=Turn.execute(file,survey);
 A.equal(prepared.applied,true);
 A.equal(prepared.output.rules.prepared,true);
 const checkId=prepared.output.rules.checkId;
 const req={id:'receipt_original_check_00001',mode:'check',checkId};
 const rolled=Turn.execute(file,req);
 A.equal(rolled.applied,true);
 A.ok(rolled.output.check.roll>=1 && rolled.output.check.roll<=20);
 A.ok(rolled.events.some(e=>e.type==='roll'));
 const after=FS.readFileSync(file,'utf8');
 const original=E.importGame(after),rng=original.rngState;
 A.equal(original.table.sceneChecks[checkId].used,true);
 const stored=original.chatRuntime.applied[req.id];
 A.equal(stored.receipt.output.check.roll,rolled.output.check.roll);
 A.deepEqual(stored.receipt.events,rolled.events);
 A.deepEqual(stored.receipt.clock,rolled.clock);
 A.equal(stored.receipt.ok,true);

 // No output file was ever made. The same request is all the pending
 // processor can recover, even if new turns have since advanced the world.
 const replay=Turn.execute(file,req);
 A.equal(replay.duplicate,true);
 A.equal(replay.recovered,true);
 A.equal(replay.applied,false);
 A.equal(replay.originalRevision,rolled.revision);
 A.deepEqual(replay.output,rolled.output);
 A.deepEqual(replay.events,rolled.events);
 A.deepEqual(replay.clock,rolled.clock);
 A.equal(replay.stateHash,rolled.stateHash);
 A.equal(FS.readFileSync(file,'utf8'),after);
 A.equal(E.importGame(FS.readFileSync(file,'utf8')).rngState,rng);

 const newer={id:'receipt_scene_checkpoint_0001',mode:'checkpoint',
  scene:'A private read-only pickup after field observation.',
  summary:'The original field interpretation already happened.'};
 A.equal(Turn.execute(file,newer).applied,true);
 const advanced=FS.readFileSync(file,'utf8');
 const later=Turn.execute(file,req);
 A.equal(later.duplicate,true);
 A.equal(later.recovered,true);
 A.equal(later.originalRevision,rolled.revision);
 A.deepEqual(later.output,rolled.output);
 A.deepEqual(later.events,rolled.events);
 A.notEqual(later.stateHash,rolled.stateHash);
 A.equal(FS.readFileSync(file,'utf8'),advanced);

 const collision=Turn.execute(file,{...req,checkId:'habitat_fen_99999'});
 A.equal(collision.ok,false);
 A.match(collision.error,/already used/);
 A.equal(FS.readFileSync(file,'utf8'),advanced);

 // Legacy applied-turn ledgers have no receipt; keep their safe duplicate
 // behavior and never re-enter the used core.check.
 const legacy=E.importGame(advanced);
 delete legacy.chatRuntime.applied[req.id].receipt;
 FS.writeFileSync(file,E.exportGame(legacy)+'\n');
 const beforeLegacy=FS.readFileSync(file,'utf8');
 const oldReplay=Turn.execute(file,req);
 A.equal(oldReplay.duplicate,true);
 A.equal(oldReplay.recovered,undefined);
 A.equal(oldReplay.output,undefined);
 A.equal(FS.readFileSync(file,'utf8'),beforeLegacy);

 // Read-only inspection still has no turn receipt, revision, roll or tick.
 const inspect={id:'receipt_look_00001',mode:'act',action:'look'};
 const prior=FS.readFileSync(file,'utf8');
 const look=Turn.execute(file,inspect);
 A.equal(look.applied,false);
 A.equal(look.output.scene.location,'fen');
 A.equal(FS.readFileSync(file,'utf8'),prior);
 A.equal(E.importGame(prior).chatRuntime.applied[inspect.id],undefined);
} finally {
 FS.rmSync(dir,{recursive:true,force:true});
}
console.log('Original private turn receipts survive missing result files without rerolls');
