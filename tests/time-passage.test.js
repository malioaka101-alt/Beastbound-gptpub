'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),Turn=require('../scripts/chat-turn.js'),Passage=require('./time-passage-fixture');
function fresh(seed=19645,days=2){
 const s=E.newGame({name:'Verified Settled Downtime',seed,path:'undecided'});
 s.player.inventory.clean_rations=days;
 return s;
}
const call=(s,p)=>R.act(s,{system:'world',operation:'advance',params:p});
{
 const s=fresh(),initial=E.exportGame(s),rng=s.rngState;
 for(const p of [{days:10000},{days:1,source:'I skip a year'},{}])
  A.throws(()=>call(s,p),/only a precommitted passageId/);
 A.throws(()=>call(s,{passageId:'missing_0001'}),/previously recorded, safe local downtime/);
 A.equal(E.exportGame(s),initial);A.equal(s.rngState,rng);
 const rec=Passage.record(s,'downtime_0001',2);
 rec.days=10000;
 const before=E.exportGame(s);
 A.throws(()=>call(s,{passageId:'downtime_0001'}),/approved actual downtime days/);
 A.equal(E.exportGame(s),before);
 rec.days=2;
 s.player.inventory.clean_rations=1;
 A.throws(()=>call(s,{passageId:'downtime_0001'}),/Insufficient actual clean rations/);
 s.player.inventory.clean_rations=2;
 s.player.partnerIds=['fox'];
 A.throws(()=>call(s,{passageId:'downtime_0001'}),/active beast partners/);
 s.player.partnerIds=[];
 s.encounter={beastId:'wildfox'};
 A.throws(()=>call(s,{passageId:'downtime_0001'}),/Unresolved combat or beast encounters/);
 s.encounter=null;
 s.world.location='fen';
 A.throws(()=>call(s,{passageId:'downtime_0001'}),/previously recorded, safe local downtime/);
 s.world.location='crossing';
 rec.eventHash='invented';
 A.throws(()=>call(s,{passageId:'downtime_0001'}),/unique previously witnessed local downtime plan/);
 A.equal(s.rngState,rng);
}
{
 const s=fresh(19646,2);
 const rec=Passage.record(s,'town_days_0001',2),minutes=s.world.minutes,coins=s.player.coins;
 const response=call(s,{passageId:'town_days_0001'});
 A.equal(response.elapsedDays,2);
 A.equal(response.rationsConsumed,2);
 A.equal(s.world.minutes,minutes+2*1440);
 A.equal(s.player.inventory.clean_rations,undefined);
 A.equal(s.player.coins,coins);
 A.equal(s.table.timePassages.town_days_0001.used,true);
 A.equal(s.table.timePassageEventsUsed[rec.eventHash],'town_days_0001');
 const snapshot=E.exportGame(s),rng=s.rngState;
 A.throws(()=>call(s,{passageId:'town_days_0001'}),/previously recorded, safe local downtime/);
 A.equal(E.exportGame(s),snapshot);A.equal(s.rngState,rng);
}
{
 const s=fresh(19647,2);Passage.record(s,'town_days_0002',2);
 s.player.health=32;
 A.throws(()=>call(s,{passageId:'town_days_0002'}),/injured or incapacitated player/);
 s.player.health=s.player.maxHealth;
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-downtime-check-'));
 try{
  const path=Path.join(dir,'save.json');FS.writeFileSync(path,E.exportGame(s)+'\n');
  const old=FS.readFileSync(path,'utf8');
  const forgery={id:'world_skip_cheat_0001',mode:'rule',system:'world',
   operation:'advance',params:{days:365}};
  A.throws(()=>Turn.execute(path,forgery),/only a precommitted passageId/);
  A.equal(FS.readFileSync(path,'utf8'),old);
  const valid={id:'world_stay_0001',mode:'rule',system:'world',
   operation:'advance',params:{passageId:'town_days_0002'}};
  const result=Turn.execute(path,valid);
  A.equal(result.applied,true);
  A.equal(result.output.rules.precommitted,true);
  A.equal(result.output.rules.rationsConsumed,2);
  A.equal(Turn.execute(path,valid).duplicate,true);
  const after=FS.readFileSync(path,'utf8'),state=E.importGame(after);
  A.equal(state.world.minutes,s.world.minutes+2880);
  A.equal(state.player.inventory.clean_rations,undefined);
  A.equal(state.table.timePassages.town_days_0002.used,true);
  A.throws(()=>Turn.execute(path,{...valid,id:'world_stay_again_0001'}),
   /previously recorded, safe local downtime/);
  A.equal(FS.readFileSync(path,'utf8'),after);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Source-verified, provisioned local downtime prevents unearned time skips');
