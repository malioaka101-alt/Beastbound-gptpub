'use strict';
// Three genuinely learnt basic combat techniques: an independent, no-tuition
// route exists without inventing a master or bypassing real anatomy, dice,
// day-scale practice, resource cost, and opponent agency.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const Crypto=require('node:crypto');
const E=require('../engine.js'),R=require('../rules'),Self=require('../rules/self-taught-basic-techniques'),
 Turn=require('../scripts/chat-turn.js');
const sha=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const STUDIES={
 arcane_spark:{system:'arcane',operation:'sparkStudy',read:'sparkStatus',intent:'cast',dc:14,energy:'mana',cost:2},
 arcane_ward:{system:'arcane',operation:'wardStudy',read:'wardStatus',intent:'ward',dc:14,energy:'mana',cost:2},
 qi_strike:{system:'meridian',operation:'qiStrikeStudy',read:'qiStrikeStatus',intent:'technique',dc:15,energy:'qi',cost:3}
};
function arcaneReady(seed){
 const s=E.newGame({name:'Independent Arcane Research Fixture',seed,path:'arcane'});
 s.player.arcane.coreIgnited=true;
 s.player.arcane.circles=1;
 s.player.arcane.geometry='Earned stable sixfold Circle geometry';
 s.table||={};s.table.disciplineTraining||={};
 s.table.disciplineTraining.arcane={history:[
  {day:1,target:'core',quality:'strong',change:'Mana Core ignited, no Circle yet'},
  {day:1,target:'circle1',quality:'strong',change:'First Circle constructed; stable measured geometry'}
 ],methods:{},points:0,cooldownUntil:0};
 return s;
}
function meridianReady(seed){
 const s=E.newGame({name:'Independent Meridian Practice Fixture',seed,path:'meridian'});
 A.equal(E.dispatch(s,'travel academy').ok,true);
 s.player.meridian.stage=2;s.player.meridian.gates=[];
 s.table||={};s.table.powerPhysiology||={};
 s.table.powerPhysiology.meridian={foundationQuality:'Sound',primaryMapped:12,
  gateRecords:[],deviationHistory:[]};
 let attempts=0;
 while(s.player.meridian.gates.length===0&&attempts++<20)
  R.act(s,{system:'meridian',operation:'gatePractice',params:{
   source:'Actually repeated Stage-II Lower-Gate anatomy practice at Lumenfall before independent study',
   force:false,metMilestone:false
  }});
 A.equal(s.player.meridian.stage,3);
 A.equal(s.player.meridian.gates[0].number,1);
 A.equal(E.dispatch(s,'travel crossing').ok,true);
 return s;
}
function prepare(id,seed){
 return id==='qi_strike'?meridianReady(seed):arcaneReady(seed);
}
function study(s,id,p={route:'independent'}){
 const t=STUDIES[id];
 return R.act(s,{system:t.system,operation:t.operation,params:p});
}
function known(s,id){
 const t=STUDIES[id];
 return R.act(s,{system:t.system,operation:t.read,params:{}});
}
function enemy(s){
 if(s.world.location==='academy'){
  A.equal(E.dispatch(s,'travel crossing').ok,true);
 }
 if(s.world.location==='crossing')A.equal(E.dispatch(s,'travel forest').ok,true);
 s.beasts.fox={id:'fox',name:'Actual Assessed Lanternfen Animal',
  species:'fenfox',evolutionStage:'Base',sapience:1,
  location:s.world.location,hp:40,maxHp:40};
 s.encounter={beastId:'fox',threat:true,observed:true};
 s.beasts.fox.combatAssessment={
  beastId:'fox',species:'fenfox',evolutionStage:'Base',sapience:1,
  worldMinute:s.world.minutes,
  source:'Independent actual observed anatomy and ecological threat of this individual forest animal',
  behavior:{style:'territorial',nonlethal:true,canCommunicate:false,
   withdrawalDC:15,parleyDC:18,
   source:'Previously recorded independent nonlethal territorial reflex of the actual individual animal'},
  stats:{toughness:35,defense:12,stamina:8,vigor:1,will:1,
   offM:0,durM:0,sapience:1,attack:18,damage:45,boxes:[3,2,1]}
 };
 R.act(s,{system:'combat',operation:'begin',params:{beastId:'fox'}});
}
{
 const s=E.newGame({name:'Not Yet Awakened',seed:344000}),before=E.exportGame(s),rng=s.rngState;
 for(const id of Object.keys(STUDIES)){
  A.throws(()=>study(s,id),/earned Mana Core|genuine first Lower Meridian Gate/);
  A.throws(()=>study(s,id,{route:'independent',teacher:'fake master',dc:1}),
   /accept only route/);
  A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 }
}
const successes={};
for(const id of Object.keys(STUDIES)){
 const cfg=STUDIES[id];
 let didSucceed=false,didFail=false;
 for(let i=1;i<=80;i++){
  const s=prepare(id,(i*2654435761)>>>0),starting=s.world.minutes,
   money=s.player.coins,energy=s.player[cfg.energy];
  A.equal(known(s,id).known,false);
  A.equal(known(s,id).alternateRoute,'independent');
  const attempt=study(s,id);
  A.equal(attempt.route,'independent');
  A.equal(attempt.feeTalons,0);
  A.equal(attempt.studyDays,12);
  A.equal(attempt.check.dc,cfg.dc);
  A.equal(attempt.noExtraRoll,true);
  A.equal(s.player.coins,money);
  A.equal(s.world.minutes,starting+12*1440);
  A.equal(s.player[cfg.energy],energy-cfg.cost);
  A.equal(attempt.resourceSpent,cfg.cost);
  A.equal(attempt.foodConsumed,0);
  A.equal(attempt.learned,attempt.check.success);
  A.equal(known(s,id).known,attempt.learned);
  const info=s.table.selfTaughtBasic.attempts[0];
  A.equal(info.route,'independent');A.equal(info.source,attempt.source);
  A.equal(info.location,s.world.location);
  A.equal(info.tuitionScales,0);
  A.equal(info.dc,cfg.dc);
  A.equal(sha(s.log[info.witnessIndex]),info.witnessHash);
  A.equal(sha(s.log[info.rollIndex]),info.rollHash);
  A.equal(s.log[info.rollIndex].type,'roll');
  if(attempt.learned){
   didSucceed=true;
   const rec=id==='qi_strike'?s.table.meridianTechniques[id]:s.table.arcaneTechniques[id];
   A.equal(rec.route,'independent');
   A.equal(rec.source,attempt.source);
   A.equal(rec.learnedAtMinute,s.world.minutes);
   A.equal(rec.teacher,undefined===rec.teacher?undefined:null); // No invented teacher.
   const approved=Self.profile(s,id);
   A.equal(approved.route,'independent');
   A.equal(approved.source,rec.source);
   if(!successes[id])successes[id]=s;
  }else{
   didFail=true;
   A.equal(id==='qi_strike'?s.table.meridianTechniques?.[id]:s.table.arcaneTechniques?.[id],undefined);
  }
  const saved=E.exportGame(s),rngAfter=s.rngState;
  A.throws(()=>study(s,id),/already been learned|previous failed course|already been mastered|recovery and preparation/);
  A.equal(E.exportGame(s),saved);
  A.equal(s.rngState,rngAfter);
  if(didSucceed&&didFail)break;
 }
 A.ok(didSucceed,'Actual basic independent instruction must sometimes succeed: '+id);
 A.ok(didFail,'Real unaided experimentation must sometimes fail without teaching: '+id);
}
for(const id of Object.keys(successes)){
 const s=successes[id],cfg=STUDIES[id];
 enemy(s);
 const beforeMana=s.player.mana,beforeQi=s.player.qi,minute=s.world.minutes;
 const result=R.act(s,{system:'combat',operation:'exchange',params:{
  intent:cfg.intent,techniqueId:id
 }});
 A.equal(result.ownResult.verifiedTechniqueId,id);
 A.match(result.ownResult.learnedTechniqueSource,/Self-derived/);
 A.equal(s.world.minutes,minute+1);
 if(id==='qi_strike'){
  A.equal(result.ownResult.qiSpent,3);A.equal(s.player.qi,beforeQi-3);
  A.equal(s.player.mana,beforeMana);
 }else{
  A.equal(s.player.mana,beforeMana-result.ownResult.manaSpent);
  A.equal(result.ownResult.manaSpent>=1,true);
  A.equal(s.player.qi,beforeQi);
 }
 A.ok(['attack','hold','retreat'].includes(result.enemyPlan));
}
{
 const s=successes.arcane_spark,entry=s.table.arcaneTechniques.arcane_spark;
 const old=E.exportGame(s);
 entry.source='I paid an imaginary legendary wizard';
 const bad=E.exportGame(s),rng=s.rngState;
 A.throws(()=>Self.profile(s,'arcane_spark'),/No authenticated independently earned/);
 A.equal(E.exportGame(s),bad);A.equal(s.rngState,rng);
 A.notEqual(old,bad);
}
{
 const s=prepare('arcane_spark',344003);
 A.equal(E.dispatch(s,'travel forest').ok,true);
 const bytes=E.exportGame(s),rng=s.rngState;
 A.throws(()=>study(s,'arcane_spark'),/Twelve genuine daily rations/);
 A.equal(E.exportGame(s),bytes);A.equal(s.rngState,rng);
 // Genuine physical provisions allow the same learning opportunity outside
 // town: the environment is not a universal prohibition.
 s.player.inventory.clean_rations=12;
 const stock=s.player.inventory.clean_rations;
 const out=study(s,'arcane_spark');
 A.equal(out.foodConsumed,12);
 A.equal(s.player.inventory.clean_rations||0,stock-12);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-independent-technique-'));
 try{
  const save=Path.join(dir,'character.json'),s=prepare('arcane_ward',344123);
  FS.writeFileSync(save,E.exportGame(s)+'\n');
  const initial=FS.readFileSync(save,'utf8');
  const bad={id:'self_ward_cheat_0001',mode:'rule',system:'arcane',operation:'wardStudy',
    params:{route:'independent',dc:1,fee:0}};
  A.throws(()=>Turn.execute(save,bad),/accept only route/);
  A.equal(FS.readFileSync(save,'utf8'),initial);
  const action={id:'self_ward_real_0001',mode:'rule',system:'arcane',operation:'wardStudy',
   params:{route:'independent'}};
  const earned=Turn.execute(save,action);
  A.equal(earned.applied,true);
  A.equal(earned.output.rules.route,'independent');
  A.equal(Turn.execute(save,action).duplicate,true);
  const processed=FS.readFileSync(save,'utf8'),patient=E.importGame(processed);
  A.equal(patient.world.minutes,s.world.minutes+12*1440);
  A.equal(patient.player.coins,s.player.coins);
  A.equal(patient.table.selfTaughtBasic.attempts.length,1);
  const read=Turn.execute(save,{id:'self_ward_status_0001',mode:'rule',system:'arcane',
   operation:'wardStatus',params:{}});
  A.equal(read.applied,false);
  A.equal(read.output.rules.known,earned.output.rules.learned);
  A.equal(FS.readFileSync(save,'utf8'),processed);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Three basic techniques genuinely support earned self-study and source-backed Mana/Qi combat, without universal academy fees');
