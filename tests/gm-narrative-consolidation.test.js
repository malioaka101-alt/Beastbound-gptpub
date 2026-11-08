'use strict';
// GM/engine boundary regression: narration belongs to the GM; dice,
// clocks and saves belong to one real source-verified engine execution.
// Disposable character only: NEVER a live campaign checkpoint.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),
 Panels=require('../panels.js'),Turn=require('../scripts/chat-turn.js');
const doc=FS.readFileSync(Path.join(__dirname,
 '../docs/GM_NARRATIVE_AND_ENGINE_BOUNDARY.md'),'utf8');
A.match(doc,/GM|Game Master/i);
A.match(doc,/narrat|prose/i);
A.match(doc,/engine|dice|roll/i);
A.match(doc,/player|choice|agency/i);
A.match(doc,/world|npc|beast/i);
const instr=FS.readFileSync(Path.join(__dirname,
 '../docs/PROJECT_CHAT_INSTRUCTIONS.md'),'utf8');
A.match(instr,/GM_NARRATIVE_AND_ENGINE_BOUNDARY/);
const s=E.newGame({seed:202611081,name:'Disposable World Reader',
 path:'undecided',background:'fieldworker'});
R.unified.ensurePlayer(s);
const raw=E.exportGame(s),rng=s.rngState;
const lore=R.act(s,{system:'world',operation:'heritage',params:{type:'overview'}});
A.ok(lore.historicalLegends.length>0);
A.ok(lore.institutionalTeachingTraditions.length>0);
const local=R.act(s,{system:'world',operation:'heritage',params:{}});
A.ok(local.localProfessionalWork.some(x=>x.id==='ferry_route_survey'));
const hud=Panels.hudData(s);
A.ok(hud&&typeof hud==='object');
A.equal(E.exportGame(s),raw,'Public lore and HUD must not consume time, dice or world events');
A.equal(s.rngState,rng,'Reading history does not cause a random world outcome');
s.player.attributes.int=24;
s.player.skills.research.rank=5;
const ready=E.exportGame(s),before=s.world.minutes,
 stamina=s.player.stamina;
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-gm-boundary-'));
try{
 const file=Path.join(dir,'disposable.json');
 FS.writeFileSync(file,ready+'\n');
 const request={id:'gm_boundary_professional_202611081',
  mode:'rule',system:'world',operation:'culturalPractice',
  params:{id:'ferry_route_survey',minutes:60,
   approach:'Inspect the real ferry path and public water-rights marks, compare observed erosion against written measurements, and report only what is witnessed'}};
 const first=Turn.execute(file,request);
 A.equal(first.ok,true);
 A.equal(first.applied,true);
 A.ok(Number.isInteger(first.output.rules.check.roll));
 const saved=FS.readFileSync(file,'utf8');
 const current=E.importGame(saved);
 A.equal(current.world.minutes,before+60,
  'Natural-language professional work gets exactly one engine time charge');
 A.equal(current.player.stamina,stamina-2,
  'Real fieldwork spends resources exactly once');
 A.equal(current.player.arcane.circles,0);
 A.equal(current.player.meridian.stage,0);
 A.equal(current.player.humanEvolution.stage,0);
 A.ok(current.table?.realm?.culturalPractice?.reports?.length>0);
 const again=Turn.execute(file,request);
 A.equal(again.duplicate,true);
 A.equal(again.applied,false);
 A.equal(FS.readFileSync(file,'utf8'),saved,
  'Replaying GM narration cannot create a second roll or a new outcome');
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('GM source-of-truth contract passed: imaginative narration remains GM-owned, lore/HUD are read-only, one real fieldwork resolution and replay-safe checkpoint');
