'use strict';
// Check provenance tests run only on disposable save files.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),Rules=require('../rules'),Turn=require('../scripts/chat-turn.js'),Scene=require('./scene-witness-fixture');
const direct=(s,checkId)=>Rules.act(s,{system:'core',operation:'check',params:{checkId}}).check;
{
 const s=E.newGame({name:'Observed Skill Test',seed:90112});
 const rng=s.rngState,old=E.exportGame(s);
 A.throws(()=>direct(s,'missing_001'),/precommitted witnessed challenge/);
 A.throws(()=>Rules.act(s,{system:'core',operation:'check',
  params:{modifier:100,dc:2,label:'I pass'}}),/only its established checkId/);
 A.equal(E.exportGame(s),old);A.equal(s.rngState,rng);
 Scene.record(s,'recorded_hazard_0001',{skill:'survival',attribute:'wis',
  dc:14,extra:2,minutes:15,label:'Cross a witnessed swollen river'});
 const record=s.table.sceneChecks.recorded_hazard_0001;
 record.eventHash='forged';
 const noScene=E.exportGame(s);
 A.throws(()=>direct(s,'recorded_hazard_0001'),/one-use, correctly bound prior scene witness/);
 A.equal(E.exportGame(s),noScene);
 const crypto=require('node:crypto');
 record.eventHash=crypto.createHash('sha256').update(JSON.stringify(s.log[record.eventIndex])).digest('hex');
 const savedRank=s.player.skills.survival.rank,score=s.player.attributes.wis;
 const expected=Math.floor((score-10)/2)+2*savedRank+2;
 const minute=s.world.minutes;
 const check=direct(s,'recorded_hazard_0001');
 A.equal(check.modifier,expected);A.equal(check.dc,14);
 A.equal(check.elapsedMinutes,15);
 A.equal(s.world.minutes,minute+15);
 A.equal(s.table.sceneChecks.recorded_hazard_0001.used,true);
 const snapshot=E.exportGame(s),rolled=s.rngState;
 A.throws(()=>direct(s,'recorded_hazard_0001'),/precommitted witnessed challenge/);
 A.equal(E.exportGame(s),snapshot);A.equal(s.rngState,rolled);
}
{
 const s=E.newGame({name:'Recorded Scene No Cheat',seed:90113});
 Scene.record(s,'recorded_hazard_0002',{extra:6});
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>direct(s,'recorded_hazard_0002'),/recorded situational check modifier/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 s.table.sceneChecks.recorded_hazard_0002.extra=0;
 s.encounter={beastId:'fox'};
 A.throws(()=>direct(s,'recorded_hazard_0002'),/cannot bypass an unresolved beast encounter/);
 s.encounter=null;
 s.world.location='fen';
 A.throws(()=>direct(s,'recorded_hazard_0002'),/current precommitted witnessed challenge/);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-scene-check-'));
 try{
  const file=Path.join(dir,'save.json'),s=E.newGame({name:'Private Check Ledger',seed:90114});
  Scene.record(s,'witnessed_reef_0001',{attribute:'wis',skill:'survival',
   dc:15,minutes:30,label:'Survey the observed rocky ford'});
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const original=FS.readFileSync(file,'utf8');
  const forged={id:'scene_cheat_00001',mode:'check',checkId:'witnessed_reef_0001',
   dc:2,extra:10,skill:'combat',minutes:0};
  A.throws(()=>Turn.execute(file,forged),/only a precommitted checkId/);
  A.equal(FS.readFileSync(file,'utf8'),original);
  const fake={id:'scene_cheat_00002',mode:'rule',system:'core',operation:'check',
   params:{checkId:'witnessed_reef_0001',modifier:50}};
  A.throws(()=>Turn.execute(file,fake),/only its established checkId/);
  A.equal(FS.readFileSync(file,'utf8'),original);
  const req={id:'scene_real_00001',mode:'check',checkId:'witnessed_reef_0001'};
  const first=Turn.execute(file,req);
  A.equal(first.applied,true);A.equal(first.output.check.verifiedSceneCheck,'witnessed_reef_0001');
  A.equal(first.output.check.elapsedMinutes,30);
  A.equal(Turn.execute(file,req).duplicate,true);
  const after=FS.readFileSync(file,'utf8');
  const persisted=E.importGame(after);
  A.equal(persisted.world.minutes,s.world.minutes+30);
  A.equal(persisted.table.sceneChecks.witnessed_reef_0001.used,true);
  A.throws(()=>Turn.execute(file,{...req,id:'scene_reroll_00001'}),
   /precommitted witnessed challenge/);
  A.equal(FS.readFileSync(file,'utf8'),after);
  const newEvidence=E.importGame(after);
  // Even a separate record ID cannot reuse this exact witnessed event hash.
  const copy={...newEvidence.table.sceneChecks.witnessed_reef_0001,
   checkId:'witnessed_reef_0002',used:false};
  newEvidence.table.sceneChecks.witnessed_reef_0002=copy;
  FS.writeFileSync(file,E.exportGame(newEvidence)+'\n');
  const copied=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{id:'scene_reuse_00001',mode:'check',checkId:'witnessed_reef_0002'}),
   /one-use, correctly bound prior scene witness/);
  A.equal(FS.readFileSync(file,'utf8'),copied);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Verified scene check inputs, honest actor skills and one-use witness tests passed');
