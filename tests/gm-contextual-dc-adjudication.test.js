'use strict';
// Disposable GM discretion test: original witnessed scene only, one die,
// no caller-chosen DC, no free NPC agreement or supernatural progression.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine'),R=require('../rules');
const GM=require('../rules/gm-contextual-dc');
const Turn=require('../scripts/chat-turn');
const New=require('../scripts/new-campaign'),Realm=require('../world/simulation');
const sceneText='The orchard path here is flat, clear, dry and familiar; no obstacles are presently visible.';
function story(s){s.chatRuntime||={revision:0,applied:{},focus:[]};s.chatRuntime.scene=sceneText;return s;}
function assessment(kind='adjust',adjustment=-3){
 return {kind,...(kind==='adjust'?{adjustment}:{}),
  source:'scene',quote:'flat, clear, dry and familiar',
  reason:'The nearby known ground makes the ordinary footing task materially less uncertain.'};
}
{
 const s=story(E.newGame({seed:835217,name:'Scene Judgment Fixture'}));
 const difficulty={baseDC:12,dc:12,factors:[]};
 A.equal(GM.adjust(s,difficulty,assessment()).dc,9);
 A.equal(GM.adjust(s,difficulty,{...assessment(),adjustment:5}).dc,17);
 A.throws(()=>GM.adjust(s,difficulty,{...assessment(),adjustment:-50}),/at most five/);
 A.throws(()=>GM.adjust(s,difficulty,{...assessment(),dc:1}),/specific pre-roll/);
 A.throws(()=>GM.adjust(s,difficulty,{...assessment(),source:'weather'}),/quote the original/);
 A.throws(()=>GM.adjust(s,difficulty,{...assessment(),quote:'unsupported enchanted floor'}),/quote the original/);
 A.throws(()=>GM.adjust(s,difficulty,{...assessment(),kind:'routine',adjustment:undefined}),/only allowed/);
}
{
 const s=story(E.newGame({seed:835218,name:'One Scene Die Fixture'}));
 const prepared=R.act(s,{system:'core',operation:'prepareSceneCheck',
  params:{intent:'Keep my feet steady on this familiar orchard stone',method:'footing'}});
 A.equal(prepared.noRollYet,true);A.ok(Number.isInteger(prepared.baseDC));
 const start=s.world.minutes,original=s.rngState;
 const answer=R.act(s,{system:'core',operation:'check',
  params:{checkId:prepared.checkId,gmRuling:assessment()} }).check;
 A.equal(answer.verifiedSceneCheck,prepared.checkId);
 A.equal(answer.difficulty.baseDC,prepared.baseDC);
 A.equal(answer.difficulty.dc,prepared.baseDC-3);
 A.equal(answer.check,undefined);
 A.equal(answer.roll>=1&&answer.roll<=20,true);
 A.equal(s.world.minutes,start+15);
 A.notEqual(s.rngState,original);
 const after=E.exportGame(s);
 A.throws(()=>R.act(s,{system:'core',operation:'check',
  params:{checkId:prepared.checkId,gmRuling:assessment()} }),/precommitted witnessed challenge/);
 A.equal(E.exportGame(s),after);
}
for(const kind of ['routine','impossible']){
 const s=story(E.newGame({seed:835230+(kind==='routine'?0:1),name:'No Roll Terrain Fixture'}));
 const p=R.act(s,{system:'core',operation:'prepareSceneCheck',
  params:{intent:'Walk safely along the already witnessed ordinary stone path',method:'footing'}});
 const start=s.world.minutes;
 const before=s.player.skills.survival.xp;
 const output=R.act(s,{system:'core',operation:'check',
  params:{checkId:p.checkId,gmRuling:assessment(kind)}}).check;
 A.equal(output.noRoll,true);
 A.equal(output.resolution,kind);
 A.equal(output.success,kind==='routine');
 A.equal(output.practiceAwarded,0);
 A.equal(s.player.skills.survival.xp,before);
 A.equal(s.world.minutes,start+(kind==='routine'?15:0));
 A.equal(s.table.sceneChecks[p.checkId].used,true);
 A.equal(s.table.sceneCheckEventsUsed[s.table.sceneChecks[p.checkId].eventHash],p.checkId);
 A.throws(()=>R.act(s,{system:'core',operation:'check',
  params:{checkId:p.checkId}}),/precommitted witnessed challenge/);
}
{
 const s=story(E.newGame({seed:835237,name:'GM Practice Fixture',path:'soul'}));
 const input={system:'soul',method:'self-awareness',route:'independent',minutes:120};
 const prior=E.exportGame(s),roll=s.rngState;
 const preview=R.act(s,{system:'discipline',operation:'practiceDifficulty',params:input});
 A.equal(preview.computedDC,14);
 A.equal(preview.noRollOccurred,true);
 A.equal(E.exportGame(s),prior);
 A.equal(s.rngState,roll);
 const out=R.act(s,{system:'discipline',operation:'practice',
  params:{...input,gmContext:{...assessment(),adjustment:-2}}});
 A.equal(out.check.dc,12);
 A.equal(out.difficulty.baseDC,12);
 A.equal(out.difficulty.gmContext.adjustment,-2);
 A.equal(out.elapsedMinutes,120);
 A.throws(()=>R.act(story(E.newGame({seed:835238,name:'Forbidden Automatic Soul'})),
  {system:'discipline',operation:'practice',
   params:{...input,gmContext:{...assessment('routine'),kind:'routine'}}}),
  /requires an honest original roll/);
}
function homestead(){
 for(let seed=836100;seed<836160;seed++){
  const s=New.create({seed,slug:'gm_work_context_fixture',mode:'guided',
   age:10,homeRegion:'morrowfen_basin',originKind:'ordinary',
   startLocation:'crossing'}).state;
  const person=Realm.ensure(s).originKin?.people?.kin_1;
  if(!person)continue;
  R.act(s,{system:'world',operation:'establishPlace',params:{
   placeId:'gm_family_worksite',name:'GM Family Worksite',kind:'family cottage',
   regionId:s.campaign.origin.birthRegionId,sceneType:'settlement',
   description:'A dry courtyard with a familiar ordinary family bench and tools.',
   culture:'Ordinary family chores and voluntary wages, with professional safety checks.'}});
  s.world.location='gm_family_worksite';
  s.chatRuntime.scene=sceneText+' '+person.name+' is present here by the harness bench.';
  return {s,person};
 }
 throw Error('No real generated household family fixture found');
}
{
 const {s,person}=homestead();
 const p={npcId:person.actorId,purpose:'Inspect and sort the household harness buckles',approach:'careful'};
 const pre=E.exportGame(s),rng=s.rngState;
 const preview=R.act(s,{system:'social',operation:'householdWorkDifficulty',params:p});
 A.equal(preview.computedDC,10);
 A.equal(preview.noDieRolled,true);
 A.equal(E.exportGame(s),pre);
 A.equal(s.rngState,rng);
 const a=R.act(s,{system:'social',operation:'householdWork',
  params:{...p,gmContext:{...assessment(),adjustment:2}}});
 if(a.accepted){
  A.equal(a.difficulty.dc,12);
  A.equal(a.check.dc,12);
  A.equal(a.difficulty.gmContext.adjustment,2);
  A.deepEqual(s.table.householdWork.records.at(-1).proof.difficulty,a.difficulty);
 }
 const receipt=s.table.householdWork.records.at(-1).proof;
 A.equal(receipt.paidTalons,a.paidTalons);
 const fresh=homestead();
 const old=E.exportGame(fresh.s);
 A.throws(()=>R.act(fresh.s,{system:'social',operation:'householdWork',
  params:{npcId:fresh.person.actorId,purpose:p.purpose,gmContext:assessment('routine')}}),
  /requires an honest original roll/);
 A.equal(E.exportGame(fresh.s),old);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'beastbound-gm-context-'));
 try{
  const s=story(E.newGame({seed:836701,name:'Check Replay With GM'}));
  const p=R.act(s,{system:'core',operation:'prepareSceneCheck',
   params:{intent:'Keep footing on the actual familiar stone',method:'footing'}});
  const path=Path.join(dir,'save.json');FS.writeFileSync(path,E.exportGame(s)+'\n');
  const request={id:'gm_scene_one_roll_836701',mode:'check',
   checkId:p.checkId,gmRuling:assessment()};
  const first=Turn.execute(path,request);
  A.equal(first.ok,true);A.equal(first.applied,true);
  A.equal(first.output.check.difficulty.dc,p.baseDC-3);
  const current=FS.readFileSync(path,'utf8');
  const again=Turn.execute(path,request);
  A.equal(again.duplicate,true);A.equal(again.recovered,true);
  A.deepEqual(again.output,first.output);
  A.equal(FS.readFileSync(path,'utf8'),current);
  A.throws(()=>Turn.execute(path,{...request,id:'gm_fake_difficulty_836701',dc:2}),
   /precommitted checkId/);
  A.equal(FS.readFileSync(path,'utf8'),current);
  const preview={id:'gm_pre_soul_readonly_836701',mode:'rule',
   system:'discipline',operation:'practiceDifficulty',
   params:{system:'soul',method:'self-awareness',minutes:120}};
  const view=Turn.execute(path,preview);
  A.equal(view.applied,false);
  A.equal(view.output.rules.noRollOccurred,true);
  A.equal(FS.readFileSync(path,'utf8'),current);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('GM contextual DC: quoted scene evidence, original source baseline, bounded judgment, no-roll mundane scope, owner authority and replay passed');
