'use strict';
// Actual source-validated Gate 1 practice and earned Qi Strike study.
// Stage II itself is a disposable fixture representing previously earned
// Foundation/Awakening; real Gate 1 is opened through the engine's own dice.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const Crypto=require('node:crypto'),E=require('../engine.js'),R=require('../rules'),
 Build=require('../rules/build'),Turn=require('../scripts/chat-turn.js');
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const qi=(s,operation,params={})=>R.act(s,{system:'meridian',operation,params});
const fight=(s,p)=>R.act(s,{system:'combat',operation:'exchange',params:p});
function awake(seed=55101){
 const s=E.newGame({seed,name:'First Lower Gate Student',path:'meridian'});
 A.equal(E.dispatch(s,'travel academy').ok,true);
 s.player.meridian.stage=2;s.player.meridian.gates=[];
 s.table||={};s.table.powerPhysiology||={};
 s.table.powerPhysiology.meridian={
  foundationQuality:'Sound',primaryMapped:12,
  gateRecords:[],deviationHistory:[]
 };
 return s;
}
function opened(seed=55101){
 const s=awake(seed);
 for(let i=0;i<12&&s.player.meridian.gates.length===0;i++)
  R.act(s,{system:'meridian',operation:'gatePractice',params:{
   source:'Actual repeated Sera-supervised safe primary meridian mapping and first Lower Gate anatomy',
   force:false,metMilestone:false}});
 if(s.player.meridian.gates.length!==1)throw Error('No genuine first Gate was opened within safe test course');
 A.equal(s.player.meridian.stage,3);
 A.equal(s.player.meridian.gates[0].number,1);
 A.equal(s.table.powerPhysiology.meridian.gateRecords[0].number,1);
 return s;
}
function enemy(s){
 A.equal(E.dispatch(s,'travel crossing').ok,true);
 A.equal(E.dispatch(s,'travel forest').ok,true);
 s.beasts.fox={id:'fox',name:'Real Examined Forest Beast',species:'fenfox',
  evolutionStage:'Base',sapience:1,location:'forest',hp:35,maxHp:35};
 s.encounter={beastId:'fox',observed:true,threat:true};
 s.beasts.fox.combatAssessment={
  beastId:'fox',species:'fenfox',evolutionStage:'Base',sapience:1,
  worldMinute:s.world.minutes,source:'Source-observed individual anatomical and combat risk assessment of a forest beast',
  behavior:{style:'territorial',nonlethal:true,canCommunicate:false,
   withdrawalDC:15,parleyDC:18,
   source:'Actually observed territorial but generally nonlethal defence of this individual beast'},
  stats:{toughness:35,defense:12,stamina:8,vigor:1,will:1,offM:0,durM:0,
   sapience:1,attack:1,damage:0,boxes:[3,2,1]}
 };
 const started=R.act(s,{system:'combat',operation:'begin',params:{beastId:'fox'}});
 A.equal(started.verifiedIndividualProfile,true);
 return started;
}
{
 const s=E.newGame({seed:55001,name:'No First Gate'}),
  before=E.exportGame(s),rng=s.rngState;
 A.equal(qi(s,'qiStrikeStatus').known,false);
 A.equal(qi(s,'qiStrikeStatus').qiCost,3);
 A.equal(Build.qiTechniqueCost({damage:8,rng:'close',area:'single',projectionM:0,riders:0}),3);
 A.throws(()=>qi(s,'qiStrikeStudy'),/genuine first Lower Meridian Gate/);
 A.throws(()=>qi(s,'qiStrikeStudy',{bonus:100}),/no chosen Gate/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=awake(55002);
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>qi(s,'qiStrikeStudy'),/genuine first Lower Meridian Gate/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 let win=false,lose=false;
 for(let i=1;i<=70;i++){
  const s=opened((i*2654435761)>>>0),
   minute=s.world.minutes,coins=s.player.coins,originalQi=s.player.qi;
  const outcome=qi(s,'qiStrikeStudy');
  A.equal(outcome.techniqueId,'qi_strike');A.equal(outcome.qiCost,3);
  A.equal(outcome.damage,8);A.equal(outcome.nonlethal,true);
  A.equal(outcome.studyDays,6);A.equal(outcome.check.dc,13);
  A.equal(outcome.noExtraRoll,true);
  A.equal(s.world.minutes,minute+6*1440);
  A.equal(s.player.coins,coins-3);
  A.equal(s.player.qi,originalQi);
  A.equal(outcome.learned,outcome.check.success);
  const attempt=s.table.meridianQiStrikeStudy.attempts[0];
  A.equal(attempt.success,outcome.learned);
  A.equal(attempt.gate,1);
  A.equal(attempt.gateQuality,s.player.meridian.gates[0].quality);
  A.equal(digest(s.log[attempt.witnessIndex]),attempt.witnessHash);
  A.equal(digest(s.log[attempt.rollIndex]),attempt.rollHash);
  A.equal(qi(s,'qiStrikeStatus').known,outcome.learned);
  if(outcome.learned){
   const technique=s.table.meridianTechniques.qi_strike;
   A.equal(technique.qiCost,3);A.equal(technique.damage,8);
   A.equal(technique.learnedAtMinute,s.world.minutes);
   win=true;
  }else{
   A.equal(s.table.meridianTechniques?.qi_strike,undefined);lose=true;
  }
  const snap=E.exportGame(s),rng=s.rngState;
  if(outcome.learned)A.throws(()=>qi(s,'qiStrikeStudy'),/already been mastered/);
  else A.throws(()=>qi(s,'qiStrikeStudy'),/fresh full sixday preparation/);
  A.equal(E.exportGame(s),snap);A.equal(s.rngState,rng);
  if(win&&lose)break;
 }
 A.equal(win,true);A.equal(lose,true);
}
function taught(){
 for(let i=1;i<=70;i++){
  const s=opened((i*2654435761)>>>0);
  if(qi(s,'qiStrikeStudy').learned)return s;
 }
 throw Error('No genuinely earned successful first-gate technique course');
}
{
 const s=taught();enemy(s);
 const proof=s.table.meridianTechniques.qi_strike;
 const pre=E.exportGame(s),rng=s.rngState;
 for(const p of [
  {intent:'technique',techniqueId:'qi_strike',qiCost:0},
  {intent:'technique',techniqueId:'qi_strike',damage:100},
  {intent:'technique',techniqueId:'qi_strike',enemyPlan:'hold'},
  {intent:'technique',techniqueId:'qi_strike',nonlethal:false},
  {intent:'technique',techniqueId:'invented_sword'},
  {intent:'defend',techniqueId:'qi_strike'}
 ]){A.throws(()=>fight(s,p),
   /Player attack bonuses|Weapon action and nonlethal|genuinely taught First-Gate|Only an actual spell or Meridian technique|Only a real attack spell, defensive Ward/);
   A.equal(E.exportGame(s),pre);A.equal(s.rngState,rng);
 }
 const initialQi=s.player.qi,minute=s.world.minutes;
 const exchange=fight(s,{intent:'technique',techniqueId:'qi_strike'});
 A.equal(exchange.ownResult.verifiedTechniqueId,'qi_strike');
 A.equal(exchange.ownResult.qiSpent,3);
 A.ok(exchange.ownResult.roll>=1&&exchange.ownResult.roll<=20);
 A.equal(s.player.qi,initialQi-3);
 A.equal(s.world.minutes,minute+1);
 A.equal(exchange.ownResult.manaSpent,undefined);
 A.equal(proof.damage,8);
 A.ok(['attack','hold','retreat'].includes(exchange.enemyPlan));
}
{
 const s=taught();enemy(s);s.player.qi=0;
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>fight(s,{intent:'technique',techniqueId:'qi_strike'}),/Insufficient real Qi/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 s.player.qi=14;s.table.meridianTechniques.qi_strike.damage=999;
 const bogus=E.exportGame(s);
 A.throws(()=>fight(s,{intent:'technique',techniqueId:'qi_strike'}),/No consistent taught First-Gate/);
 A.equal(E.exportGame(s),bogus);
}
{
 const s=opened(55109);enemy(s);
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>fight(s,{intent:'technique',techniqueId:'qi_strike'}),/No consistent taught First-Gate/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-earned-qi-strike-'));
 try{
  const file=Path.join(dir,'save.json'),s=taught();
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const snap=FS.readFileSync(file,'utf8');
  const status=Turn.execute(file,{id:'qi_strike_status_0001',mode:'rule',
   system:'meridian',operation:'qiStrikeStatus',params:{}});
  A.equal(status.applied,false);A.equal(status.output.rules.known,true);
  A.equal(FS.readFileSync(file,'utf8'),snap);
  enemy(s);FS.writeFileSync(file,E.exportGame(s)+'\n');
  const withEnemy=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{id:'qi_strike_cheat_0001',mode:'rule',
   system:'combat',operation:'exchange',
   params:{intent:'technique',techniqueId:'qi_strike',damage:999}}),/Player attack bonuses/);
  A.equal(FS.readFileSync(file,'utf8'),withEnemy);
  const attack={id:'qi_strike_legal_0001',mode:'rule',system:'combat',
   operation:'exchange',params:{intent:'technique',techniqueId:'qi_strike'}};
  const result=Turn.execute(file,attack);
  A.equal(result.applied,true);A.equal(result.output.rules.ownResult.qiSpent,3);
  A.equal(Turn.execute(file,attack).duplicate,true);
  const played=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(played.player.qi,s.player.qi-3);
  A.equal(played.player.arcane.circles,s.player.arcane.circles);
  A.equal(played.table.meridianTechniques.qi_strike.damage,8);
  A.equal(played.world.minutes,s.world.minutes+1);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Genuine Gate 1, named Professor Sera tuition and real-Qi one-die nonlethal Meridian Strike passed');
