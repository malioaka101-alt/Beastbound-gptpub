'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),Rules=require('../rules'),Turn=require('../scripts/chat-turn.js');
function fresh(seed=93812){
 const s=E.newGame({name:'Historical Injury Witness',seed,path:'undecided'});
 s.player.health=50; // An explicit legacy injury, not full health.
 return s;
}
function record(s){
 s.table||={};s.table.legacyWoundAdjudication={
  origin:'prior-independent-injury-ruling',hp:s.player.health,maxHp:s.player.maxHealth,
  worldMinute:s.world.minutes,
  source:'Archived on-scene shoulder laceration assessment by the village medic',
  adjudicatedBy:'Village Medic',
  reason:'Previous checkpoint specifically recorded a Light shoulder wound',
  wounds:[1,0,0]
 };
}
const migrate=(s,p={})=>Rules.act(s,{system:'health',operation:'migrateLegacy',params:p});
{
 const s=fresh(),initial=E.exportGame(s),rng=s.rngState;
 for(const p of [{wounds:[0,0,0],reason:'Nothing happened'},{wounds:[1,0,0]},{
  source:'I say the injury is gone',reason:'I am fully healed'}])
  A.throws(()=>migrate(s,p),/accepts no chosen wound boxes or narration/);
 A.throws(()=>migrate(s),/source-recorded prior injury adjudication/);
 A.equal(E.exportGame(s),initial);A.equal(s.rngState,rng);
 record(s);
 s.table.legacyWoundAdjudication.wounds=[0,0,0];
 A.throws(()=>migrate(s),/source-recorded prior injury adjudication/);
 s.table.legacyWoundAdjudication.wounds=[1,0,0];
 s.player.health=49;
 const stale=E.exportGame(s);
 A.throws(()=>migrate(s),/matching exact legacy HP/);
 A.equal(E.exportGame(s),stale);
}
{
 const s=fresh(93813);record(s);
 s.table.legacyWoundAdjudication.wounds=[99,0,0];
 const before=E.exportGame(s);
 A.throws(()=>migrate(s),/exceeds wound box capacities/);
 // The rule executor in a real turn rolls back failed in-memory edits.
 // Here no injury proof can be spent despite the invalid recorded anatomy.
 A.equal(s.table.legacyWoundAdjudication.used,undefined);
 A.equal(s.player.health,50);
 A.equal(s.rngState,93813);
 const good=E.importGame(before);
 good.table.legacyWoundAdjudication.wounds=[1,0,0];
 const r=migrate(good);
 A.equal(r.migrated,true);A.equal(r.previouslyAdjudicated,true);
 A.deepEqual(r.wounds,[1,0,0]);
 A.equal(good.table.legacyWoundAdjudication.used,true);
 A.equal(good.player.health,50);
 A.equal(good.table.combatants.player.wounds[0],1);
 A.throws(()=>migrate(good),/Wound combatant already exists/);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-injury-migration-'));
 try{
  const file=Path.join(dir,'save.json'),s=fresh(93814);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const initial=FS.readFileSync(file,'utf8');
  const p={id:'injury_migrate_00001',mode:'rule',system:'health',
   operation:'migrateLegacy',params:{wounds:[0,0,0],
    reason:'Retcon my old wounds away by request'}};
  A.throws(()=>Turn.execute(file,p),/accepts no chosen wound boxes or narration/);
  A.equal(FS.readFileSync(file,'utf8'),initial);
  A.throws(()=>Turn.execute(file,{...p,id:'injury_migrate_00002',params:{}}),
   /source-recorded prior injury adjudication/);
  A.equal(FS.readFileSync(file,'utf8'),initial);
  record(s);FS.writeFileSync(file,E.exportGame(s)+'\n');
  const legal={id:'injury_migrate_00003',mode:'rule',system:'health',
   operation:'migrateLegacy',params:{}};
  const done=Turn.execute(file,legal);
  A.equal(done.applied,true);
  A.equal(done.output.rules.migrated,true);
  A.equal(done.output.rules.previouslyAdjudicated,true);
  A.equal(Turn.execute(file,legal).duplicate,true);
  const after=FS.readFileSync(file,'utf8');
  const loaded=E.importGame(after);
  A.equal(loaded.table.combatants.player.wounds[0],1);
  A.equal(loaded.table.legacyWoundAdjudication.used,true);
  A.equal(loaded.player.health,50);
  A.throws(()=>Turn.execute(file,{...legal,id:'injury_migrate_00004'}),
   /Wound combatant already exists/);
  A.equal(FS.readFileSync(file,'utf8'),after);
 }finally{FS.rmSync(dir,{force:true,recursive:true});}
}
console.log('Legacy wound adjudication provenance tests passed');
