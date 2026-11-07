'use strict';
// Player-chosen independent learning at actual authored world sites, without
// universal academy attendance or magical compulsory tuition.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const Crypto=require('node:crypto'),E=require('../engine.js'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const rule=(s,operation,p)=>R.act(s,{system:'discipline',operation,params:p});
const fresh=(seed=223343)=>E.newGame({name:'Open-World Learning Fixture',seed,path:'undecided'});
const methods={meridian:'breath',arcane:'mana-attunement',soul:'self-awareness',body:'muscle'};
for(const [system,method] of Object.entries(methods)){
 const s=fresh(),initial=s.world.minutes,bank=s.player.coins,rng=s.rngState;
 const seen=rule(s,'status',{}).systems[system];
 A.equal(seen.independentAvailableAtCurrentSite,true);
 A.equal(seen.independentPracticeFeeTalons,0);
 A.equal(seen.independentPracticeDC,seen.dc+2);
 A.equal(s.player.coins,bank);A.equal(s.rngState,rng);
 const practice=rule(s,'practice',{system,method,route:'independent'});
 A.equal(practice.route,'independent');A.equal(practice.feeTalons,0);
 A.equal(practice.check.dc,seen.dc+2);
 A.equal(practice.timeDays,6);
 A.equal(s.player.coins,bank);
 A.equal(s.world.minutes,initial+6*1440);
 A.equal(practice.source.includes('Morrowfen Crossing'),true);
 const witness=s.table.independentTraining[0];
 A.equal(witness.location,'crossing');
 A.equal(witness.system,system);A.equal(witness.target,seen.target);
 A.equal(hash(s.log[witness.eventIndex]),witness.eventHash);
 A.equal(witness.source,practice.source);
 const change=s.table.disciplineTraining[system];
 A.equal(change.weeks,1);
 A.equal(change.methods[method],1);
 A.ok(change.points>=0);
 const before=E.exportGame(s),rngAfter=s.rngState;
 A.throws(()=>rule(s,'practice',{system,method,route:'independent',
  source:'A fictitious headmaster gave a scholarship'}),/sources come from the actual local environment/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rngAfter);
}
{
 const s=fresh(223344),before=E.exportGame(s),rng=s.rngState;
 for(const req of [
  {system:'meridian',method:'breath',route:'teacher-made-free'},
  {system:'meridian',method:'all-methods',route:'independent'},
  {system:'meridian',method:'breath',route:'independent',partTime:'free'},
 ]){
  A.throws(()=>rule(s,'practice',req),/supported practice route|Method does not belong|Part-time practice/);
  A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 }
 s.encounter={beastId:'unresolved'};
 const active=E.exportGame(s);
 A.throws(()=>rule(s,'practice',{system:'meridian',method:'breath',route:'independent'}),/unresolved threat/);
 A.equal(E.exportGame(s),active);
}
{
 const s=fresh(223345),before=E.exportGame(s);
 A.equal(rule(s,'status',{}).systems.rift.independentAvailableAtCurrentSite,false);
 A.throws(()=>rule(s,'practice',{system:'rift',method:'boundaries',route:'independent'}),/genuinely suitable/);
 A.equal(E.exportGame(s),before);
 // The world has an actual rift outpost with recorded ward stones; don't
 // invent a remote portal or turn a village into a rift site.
 A.equal(E.dispatch(s,'travel fen').ok,true);
 A.equal(E.dispatch(s,'travel ruins').ok,true);
 const now=s.world.minutes,bank=s.player.coins;
 const result=rule(s,'practice',{system:'rift',method:'boundaries',route:'independent'});
 A.equal(result.check.dc,14);A.equal(result.feeTalons,0);
 A.equal(s.player.coins,bank);
 A.equal(s.world.minutes,now+6*1440);
 A.equal(s.table.independentTraining[0].location,'ruins');
}
{
 const s=fresh(223346);
 A.equal(E.dispatch(s,'travel academy').ok,true);
 const coins=s.player.coins,initial=s.world.minutes;
 const existing=rule(s,'practice',{system:'meridian',method:'breath',
  source:'Documented supported Meridian training at the actual Lumenfall Annex'});
 A.equal(existing.feeTalons,2);
 A.equal(existing.check.dc,12);
 A.equal(s.player.coins,coins-2);
 A.equal(s.world.minutes,initial+6*1440);
}
let achieved=null,attempted=0;
for(let seed=223400;seed<223500&&!achieved;seed++){
 const s=fresh(seed);
 const originalCoins=s.player.coins;
 for(let i=0;i<90;i++){
  const record=s.table?.disciplineTraining?.meridian;
  if(record?.points>=40)break;
  const method=i%2?'tissue':'breath';
  if(s.table?.combatants?.player?.status&&s.table.combatants.player.status!=='ok')break;
  try{rule(s,'practice',{system:'meridian',method,route:'independent'});}
  catch(e){if(/recovery|incapacitated/.test(e.message))break;throw e;}
 }
 const training=s.table?.disciplineTraining?.meridian;
 if(!training||training.points<40||Object.keys(training.methods).length<2||
   (training.cooldownUntil||0)>Math.floor(s.world.minutes/1440))continue;
 const before=s.world.minutes,bank=s.player.coins;
 const result=rule(s,'breakthrough',{system:'meridian',route:'independent'});
 attempted++;
 A.equal(result.feeTalons,0);A.equal(result.route,'independent');
 A.equal(result.check.dc,17);
 A.equal(s.player.coins,bank);A.equal(bank,originalCoins);
 A.equal(s.world.minutes,before+180);
 A.match(result.source,/Morrowfen Crossing/);
 A.ok(['breakthrough','stalled; two sixdays of recovery',
   'stalled; four sixdays of recovery',
   'backlash; specialised medical review and a further rite required'].includes(result.outcome));
 if(result.outcome==='breakthrough'){
  A.equal(s.player.meridian.stage,1);
  A.equal(training.history.at(-1).target,'foundation');
  achieved=s;
 }
}
A.ok(attempted>0,'A genuinely earned independent foundation rite must be attempted');
A.ok(achieved,'Independent no-tuition training must be able to achieve a real Meridian foundation breakthrough');
{
 const s=fresh(223448),start=E.exportGame(s),rng=s.rngState;
 for(const req of [
  {system:'meridian',route:'independent',source:'I have already secretly mastered this'},
  {system:'meridian',route:'miracle'},
 ]) {
  A.throws(()=>rule(s,'breakthrough',req),/based on the real site and anatomy|supported breakthrough approach/);
  A.equal(E.exportGame(s),start);A.equal(s.rngState,rng);
 }
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-open-learning-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(fresh(223455))+'\n');
  const old=FS.readFileSync(file,'utf8');
  const reading=Turn.execute(file,{id:'open_learning_read_0001',mode:'rule',system:'discipline',
   operation:'status',params:{}});
  A.equal(reading.applied,false);
  A.equal(reading.output.rules.systems.arcane.independentAvailableAtCurrentSite,true);
  A.equal(FS.readFileSync(file,'utf8'),old);
  const bad={id:'open_learning_fake_0001',mode:'rule',system:'discipline',
   operation:'practice',params:{system:'arcane',method:'formulae',
   route:'independent',source:'A paid tutor gave me 100 levels'}};
  A.throws(()=>Turn.execute(file,bad),/sources come from the actual local environment/);
  A.equal(FS.readFileSync(file,'utf8'),old);
  const p={id:'open_learning_actual_0001',mode:'rule',system:'discipline',
   operation:'practice',params:{system:'arcane',method:'formulae',route:'independent'}};
  const result=Turn.execute(file,p);
  A.equal(result.applied,true);A.equal(result.output.rules.feeTalons,0);
  A.equal(Turn.execute(file,p).duplicate,true);
  const saved=FS.readFileSync(file,'utf8'),grown=E.importGame(saved);
  A.equal(grown.table.independentTraining.length,1);
  A.equal(grown.table.independentTraining[0].source.includes('Morrowfen Crossing'),true);
  A.equal(grown.table.disciplineTraining.arcane.weeks,1);
  A.equal(grown.world.minutes,8*60+6*1440);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Real independent discipline progression is free of compulsory tuition and tied to physical practice, risk, time and honest breakthroughs');
