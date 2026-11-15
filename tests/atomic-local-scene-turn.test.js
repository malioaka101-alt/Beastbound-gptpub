'use strict';
// One engine action instead of two GitHub Actions round trips for ordinary
// witnessed local terrain. All worlds and saves below are disposable.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path');
const E=require('../engine'),R=require('../rules'),Turn=require('../scripts/chat-turn');
const scene='The orchard path is flat, clear and familiar, with no fallen branches or hidden obstacles.';
const intent='Test steady footing on the familiar flat orchard path';
const gmRuling={kind:'adjust',adjustment:-2,source:'scene',
 quote:'flat, clear and familiar',
 reason:'The established dry, unobstructed pathway reduces the difficulty of balancing.'};
function game(seed){
 const s=E.newGame({seed,name:'One-Step Local Scene Fixture'});
 s.chatRuntime||={revision:0,applied:{},focus:[]};
 s.chatRuntime.scene=scene;
 return E.importGame(E.exportGame(s));
}
{
 const one=game(963802),split=E.importGame(E.exportGame(one));
 const initial=one.world.minutes,oldRng=one.rngState;
 const once=R.act(one,{system:'core',operation:'localCheck',
  params:{intent,method:'footing',gmRuling}});
 const preparation=R.act(split,{system:'core',operation:'prepareSceneCheck',
  params:{intent,method:'footing'}});
 const twice=R.act(split,{system:'core',operation:'check',
  params:{checkId:preparation.checkId,gmRuling}}).check;
 A.equal(once.oneOriginalWitness,true);
 A.equal(once.oneOriginalResolution,true);
 A.equal(once.check.verifiedSceneCheck,preparation.checkId);
 A.equal(once.prepared.baseDC,preparation.baseDC);
 A.deepEqual(once.check,twice,'One-turn pathway resolves exact original witness and original die');
 A.equal(E.exportGame(one),E.exportGame(split),
  'Single rule action has identical world, dice, practice and source evidence to original two-step operation');
 A.equal(one.world.minutes,initial+15,'No repeated work time');
 A.notEqual(one.rngState,oldRng,'Real engine check consumes the original die');
 A.equal(one.log.filter(x=>x.type==='roll').length,1);
 A.throws(()=>R.act(one,{system:'core',operation:'localCheck',
  params:{intent,method:'footing',gmRuling}}),/identical local attempt/);
}
{
 const s=game(963803),old=E.exportGame(s),rng=s.rngState;
 A.throws(()=>R.act(s,{system:'core',operation:'localCheck',
  params:{intent,method:'footing',dc:2}}),/only its real intent/);
 A.equal(E.exportGame(s),old);
 A.throws(()=>R.act(s,{system:'core',operation:'localCheck',
  params:{intent,method:'footing',gmRuling:{...gmRuling,quote:'invented terrain features'}}}),
  /quote the original saved scene/);
 A.equal(E.exportGame(s),old);
 A.equal(s.rngState,rng);
}
{
 const s=game(963804),start=s.world.minutes,oldRolls=s.log.filter(x=>x.type==='roll').length;
 const result=R.act(s,{system:'core',operation:'localCheck',params:{
  intent,method:'footing',gmRuling:{kind:'routine',source:'scene',
   quote:'flat, clear and familiar',
   reason:'The established ordinary footing is unopposed and needs no actual die.'}}});
 A.equal(result.check.noRoll,true);
 A.equal(result.check.success,true);
 A.equal(result.check.elapsedMinutes,15);
 A.equal(result.check.practiceAwarded,0);
 A.equal(s.world.minutes,start+15);
 A.equal(s.log.filter(x=>x.type==='roll').length,oldRolls);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'beastbound-atomic-local-'));
 try{
  const save=Path.join(dir,'save.json'),s=game(963805);
  FS.writeFileSync(save,E.exportGame(s)+'\n');
  const request={id:'atomic_local_963805',mode:'rule',
   system:'core',operation:'localCheck',
   params:{intent,method:'footing',gmRuling}};
  const first=Turn.execute(save,request);
  A.equal(first.ok,true);A.equal(first.applied,true);
  A.equal(first.output.rules.check.difficulty.gmContext.adjustment,-2);
  A.equal(first.output.rules.oneOriginalResolution,true);
  const current=FS.readFileSync(save,'utf8');
  const replay=Turn.execute(save,request);
  A.equal(replay.duplicate,true);A.equal(replay.recovered,true);
  A.deepEqual(replay.output,first.output);
  A.equal(FS.readFileSync(save,'utf8'),current);
  A.throws(()=>Turn.execute(save,{...request,id:'atomic_local_cheat_963805',
   params:{...request.params,chosenDC:2}}),/only its real intent/);
  A.equal(FS.readFileSync(save,'utf8'),current);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Atomic local check: original witness + one RNG roll + one clock tick in one verified turn, source-bound GM context, no-roll and exact replay PASS');
