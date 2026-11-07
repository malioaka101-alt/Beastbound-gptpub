'use strict';
// Actual animal learning from sourced ecological achievements, not days,
// species Grade, power rank, forced handler training or player-selected rolls.
// All campaign states below are disposable and no active saves are touched.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),
 Time=require('../rules/world'),Learn=require('../world/beast-ecological-learning'),
 Wild=require('../world/wild-lives'),Turn=require('../scripts/chat-turn.js');
const newGame=seed=>E.newGame({name:'Wild Learning Fixture',seed,path:'undecided'});
const world=(s,op)=>R.act(s,{system:'world',operation:op,params:{}});
function meet(seed,place='forest'){
 const s=newGame(seed);
 A.equal(E.dispatch(s,'travel '+place).ok,true);
 for(let i=0;i<90;i++){
  A.equal(E.dispatch(s,'explore').ok,true);
  const b=s.beasts[s.encounter.beastId],info=E.SPECIES[b.species];
  if(!s.encounter.threat&&info.intelligence!=='sapient'&&
   !(Number.isInteger(b.sapience)&&b.sapience>=3)&&
   !/terrified|panicked|hostile|fleeing/i.test(b.mood))return s;
  A.equal(E.dispatch(s,'leave').ok,true);
 }
 throw Error('No genuinely discovered peaceful independent wildlife');
}
function source(s){
 const id=s.encounter.beastId,b=s.beasts[id],
  observed=world(s,'watchWildBeast');
 if(s.encounter)A.equal(E.dispatch(s,'leave').ok,true);
 return {s,b,id,observed};
}
{
 const s=newGame(949001),saved=E.exportGame(s),
  originalBeastcraftRank=s.player.skills.beastcraft.rank,
  parallel=E.importGame(saved);
 Time.advance(s,365);Time.advance(parallel,365);
 A.equal(Object.values(s.beasts).some(x=>x.individualLife?.ecologicalLearning),false,
  'a calendar year without observed or independently existing animal achievement creates no wildlife expertise');
 A.equal(s.player.skills.beastcraft.rank,originalBeastcraftRank);
 A.equal(s.player.partnerIds.length,0);
 A.equal(s.rngState,parallel.rngState,
  'identical real world ticks preserve the same checkpoint-based die sequence');
 A.notEqual(E.exportGame(s),saved);
}
{
 const {s,b,id}=source(meet(949002));
 A.equal(b.owner,null);A.equal(b.relationship,'wild');
 A.equal(Learn.verify(b),true);
 A.equal(s.player.partnerIds.length,0);
 A.equal(b.evolutionStage,'Base');
 A.ok(b.level>=1);
 const originalLevel=b.level,
  originalBeastcraftRank=s.player.skills.beastcraft.rank,
  grade=b.individualGrade,potential=JSON.stringify(b.potential),
  abilities=JSON.stringify(b.techniques),original=E.exportGame(s);
 const copy=E.importGame(original);
 Time.advance(s,360);Time.advance(copy,360);
 A.deepEqual(s.beasts[id],copy.beasts[id]);
 A.equal(s.rngState,copy.rngState);
 const learn=b.individualLife.ecologicalLearning;
 A.ok(learn,'an independently sourced animal can accumulate actual ecological skills');
 A.equal(learn.sourceHash,Learn._debug.digest(learn.source));
 A.equal(learn.source.individualLifeSourceHash,b.individualLife.sourceHash);
 A.equal(Learn.verify(b),true);
 A.ok(learn.attempts>0);
 A.ok(learn.receipts.length<=24);
 A.ok(learn.receipts.every(x=>
  x.source.beastId===id&&x.source.individualLifeSourceHash===b.individualLife.sourceHash));
 A.ok(learn.receipts.some(x=>x.source.action==='independently-foraged'||
  /relocated|roamed/.test(x.source.action)));
 A.ok(learn.receipts.every(x=>['navigation','foraging'].includes(x.source.skill)));
 A.ok(learn.receipts.every(x=>x.source.roll>=1&&x.source.roll<=20));
 A.ok(learn.receipts.every(x=>x.source.success?
  x.source.earned>0:x.source.earned===0));
 A.equal(JSON.stringify(b.potential),potential);
 A.equal(JSON.stringify(b.techniques),abilities);
 A.equal(b.individualGrade,grade);
 A.equal(b.level,originalLevel);
 A.equal(b.evolutionStage,'Base');
 A.equal(b.owner,null);A.equal(b.consent,false);
 A.equal(s.player.partnerIds.length,0);
 A.equal(s.table?.bondRecords?.[id],undefined);
 A.equal(s.player.skills.beastcraft.rank,originalBeastcraftRank);
 A.equal(s.player.arcane.circles,0);
 A.equal(s.player.soul.phase,0);
 const personal=world(s,'wildMemoriesStatus');
 A.equal(JSON.stringify(personal).includes('ecologicalLearning'),false);
 A.equal(JSON.stringify(personal).includes('aptitude'),false);
 A.equal(JSON.stringify(personal).includes('privateCompetence'),false);
 const frozen=E.exportGame(s),hidden=s.rngState;
 A.deepEqual(world(s,'wildMemoriesStatus'),personal);
 A.equal(E.exportGame(s),frozen);A.equal(s.rngState,hidden);
 const changed=structuredClone(b.individualLife.ecologicalLearning);
 b.individualLife.ecologicalLearning.skills.foraging=499;
 A.equal(Learn.verify(b),false,
  'an asserted unearned animal skill score cannot impersonate real sourced practice');
 b.individualLife.ecologicalLearning=changed;
 A.equal(Learn.verify(b),true);
 // A later lawful bond or increase in personhood must never erase a
 // creature's genuine past experience. It does stop the wild-only trainer.
 const onceWild=E.importGame(E.exportGame(s)).beasts[id];
 onceWild.owner='another-person';onceWild.relationship='partner';
 A.equal(Learn.verify(onceWild),true);
 A.equal(Learn.bonus(s,onceWild),0);
 A.throws(()=>Learn.ensure(s,onceWild),/independent non-sapient wild/);
}
{
 // Real biology and individual aptitude influence which talents develop.
 const {s,b}=source(meet(949003));
 const actual=Learn._debug.innate(b);
 A.equal(actual.foraging,Math.round((b.potential.growth+
  b.potential.adaptability+b.potential.adaptability)/3));
 A.equal(Learn.bonus(s,b),0);
 A.equal(Learn.verify(b),true);
 const snapshot=E.exportGame(s);
 A.throws(()=>Learn.learn(s,b,{kind:'forage',action:'independently-foraged',
  day:99999,before:95,after:2}),/No actual source-backed biological action/);
 A.equal(E.exportGame(s),snapshot,
  'imaginary distant-day forage must not produce a skill receipt');
}
{
 const {s,b,id}=source(meet(949004));
 const history=b.individualLife.history.at(-1),orig=E.exportGame(s);
 if(history.action==='forage'){
  A.throws(()=>Learn.learn(s,b,{kind:'forage',
   action:'forage',day:history.day,before:100,after:0}),
   /twice|actual source-backed/);
  A.equal(E.exportGame(s),orig);
 }else{
  A.throws(()=>Learn.learn(s,b,{kind:'forage',
   action:'forage',day:history.day,before:100,after:0}),
   /No actual source-backed biological action/);
 }
 A.equal(Learn.verify(b),true);
 const copy=E.importGame(E.exportGame(s)),actual=copy.beasts[id];
 A.equal(Learn.verify(actual),true);
}
{
 // Watching can never elevate a confirmed sapient person's skills as if
 // they were an animal being trained or inspected. Their separate consent,
 // society, physical culture and rights need the personhood module.
 const s=newGame(949005),sample=E.SPECIES;
 const species=Object.keys(sample).find(k=>sample[k].intelligence==='sapient');
 A.ok(species,'existing canonical sapient beast species must not be erased');
 const b={id:'never_forced',species,relationship:'wild',
  individualLife:{sourceHash:'a'.repeat(64)}};
 const frozen=E.exportGame(s);
 A.equal(Learn.learn(s,b,{kind:'forage',action:'forage',day:3,before:50,after:0}),null);
 A.throws(()=>Learn.ensure(s,b),/non-sapient wild individual/);
 A.equal(E.exportGame(s),frozen);
}
{
 // Source-backed wildlife learned scores have no right to create
 // unlimited nourishment, spell damage, magical rank or free items.
 const {s,b}=source(meet(949006));
 Time.advance(s,90);
 if(b.individualLife.ecologicalLearning){
  const prior=structuredClone(b.individualLife.ecologicalLearning);
  const actual=Learn.bonus(s,b);
  A.ok(actual>=0&&actual<=4);
  A.equal(actual,Learn._debug.tier(prior.skills.foraging));
  A.equal(Learn.verify(b),true);
  b.individualLife.ecologicalLearning.receipts.at(-1).hash='0'.repeat(64);
  A.equal(Learn.verify(b),false);
  A.throws(()=>Learn.bonus(s,b),/Unverified/);
  b.individualLife.ecologicalLearning=prior;
  A.equal(Learn.verify(b),true);
 }
}
{
 const {s,b,id}=source(meet(949007));
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-beast-achieve-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const pre=FS.readFileSync(file,'utf8');
  const status={id:'wild_skill_private_journal_001',
   mode:'rule',system:'world',operation:'wildMemoriesStatus',params:{}};
  A.equal(Turn.execute(file,status).applied,false);
  A.equal(FS.readFileSync(file,'utf8'),pre);
  const original=E.importGame(pre);
  A.equal(original.beasts[id].owner,null);
  A.equal(original.player.partnerIds.length,0);
  const replay=E.importGame(pre);
  Time.advance(original,36);
  Time.advance(replay,36);
  A.deepEqual(original.beasts[id].individualLife.ecologicalLearning,
   replay.beasts[id].individualLife.ecologicalLearning);
  const read=Turn.execute(file,status);
  A.equal(read.applied,false);
  A.equal(FS.readFileSync(file,'utf8'),pre);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Individual wild beast foraging and navigation learning requires authentic actions, biological aptitude and ecology, never time, Grade, contract or player power');
