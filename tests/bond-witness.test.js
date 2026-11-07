'use strict';
// A witnessed reaction must be resolved by the engine, not invented by the
// rule caller. No campaign fixture is opened or modified here.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine'),Rules=require('../rules'),Turn=require('../scripts/chat-turn');
const fresh=(seed=9922)=>{
 const s=E.newGame({name:'Witness Fixture',seed,path:'undecided'});
 s.player.attributes.cha=30;
 s.player.skills.beastcraft.rank=5;
 s.beasts.fox={id:'fox',name:'Copper Fox',sapience:1,mood:'relaxed',location:s.world.location,
  needs:{hunger:10,fatigue:0},condition:100,personalityTags:['affiliative']};
 s.player.partnerIds=['fox'];
 Rules.bonds.register(s,{beastId:'fox',start:'unfamiliar'});
 return s;
};
// Invalid claims must not consume RNG or change the source state.
{
 const s=fresh(),rng=s.rngState,minute=s.world.minutes;
 for(const params of [
  {beastId:'fox',approach:'gentle',modifier:100},
  {beastId:'fox',approach:'play',event:'protected_at_risk'},
  {beastId:'missing',approach:'gentle'},
  {beastId:'fox',approach:'voluntary_contract'}
 ])A.throws(()=>Rules.act(s,{system:'bond',operation:'interact',params}));
 A.equal(s.rngState,rng);A.equal(s.world.minutes,minute);
 s.beasts.fox.location='academy';
 A.throws(()=>Rules.act(s,{system:'bond',operation:'interact',params:{beastId:'fox',approach:'play'}}),/present/);
 A.equal(s.rngState,rng);A.equal(s.world.minutes,minute);
}
{
 const s=fresh(9923),rng=s.rngState,minute=s.world.minutes;
 s.player.attributes.cha=1;
 s.player.skills.beastcraft.rank=0;
 s.beasts.fox.sapience=3;
 s.beasts.fox.mood='agitated';
 Rules.bonds.fromSave(s,'fox').sapience=3;
 const response=Rules.act(s,{system:'bond',operation:'interact',params:{beastId:'fox',approach:'play'}});
 A.equal(response.accepted,false);A.equal(response.evidenceId,null);
 A.equal(s.world.minutes,minute+20);
 A.notEqual(s.rngState,rng);
 A.equal(Object.keys(s.table.bondEvidence||{}).length,0);
 A.throws(()=>Rules.act(s,{system:'bond',operation:'interact',params:{beastId:'fox',approach:'play'}}),/already attempted/);
}
// The real turn runner must create an event once, persist it, and allow that
// same event to be consumed once later, never duplicated by retries.
{
 const temp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-witness-'));
 try{
  const file=Path.join(temp,'save.json'),s=fresh(9999),minute=s.world.minutes;
  const startingTrust=Rules.bonds.fromSave(s,'fox').trust;
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const old=FS.readFileSync(file,'utf8');
  const bad={id:'bond_witness_bad_01',mode:'rule',system:'bond',operation:'interact',
   params:{beastId:'fox',approach:'gentle',outcome:'success'}};
  A.throws(()=>Turn.execute(file,bad),/arbitrary event outcomes/);
  A.equal(FS.readFileSync(file,'utf8'),old);
  const req={id:'bond_witness_turn_01',mode:'rule',system:'bond',operation:'interact',
   params:{beastId:'fox',approach:'gentle'}};
  const r=Turn.execute(file,req);
  A.equal(r.ok,true);A.equal(r.applied,true);
  A.equal(r.output.rules.accepted,true);
  A.equal(r.output.rules.event,'gentle_treatment');
  A.ok(r.output.rules.check.roll>=1&&r.output.rules.check.roll<=20);
  const id=r.output.rules.evidenceId;A.match(id,/^bond_witness_\d{6}$/);
  let state=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(state.world.minutes,minute+15);
  A.equal(Rules.bonds.fromSave(state,'fox').trust,startingTrust);
  A.equal(state.table.bondEvidence[id].kind,'event');
  A.equal(state.table.bondEvidence[id].worldMinute,state.world.minutes);
  A.ok(state.table.bondEvidence[id].source.includes('verified d20'));
  A.equal(Turn.execute(file,req).duplicate,true);
  A.throws(()=>Turn.execute(file,{id:'bond_witness_turn_02',mode:'rule',system:'bond',operation:'interact',
   params:{beastId:'fox',approach:'play'}}),/already attempted/);
  const rawBeforeStatus=FS.readFileSync(file,'utf8');
  const status=Turn.execute(file,{id:'bond_witness_status_01',mode:'rule',system:'bond',
   operation:'evidenceStatus',params:{beastId:'fox'}});
  A.equal(status.applied,false);
  A.equal(status.output.rules.pending.length,1);
  A.equal(status.output.rules.pending[0].evidenceId,id);
  A.equal(FS.readFileSync(file,'utf8'),rawBeforeStatus);
  const proofReq={id:'bond_witness_apply_01',mode:'rule',system:'bond',operation:'event',
   params:{beastId:'fox',event:'gentle_treatment',evidenceId:id}};
  const applied=Turn.execute(file,proofReq);
  A.equal(applied.applied,true);
  A.equal(applied.output.rules.changes.trust,2);
  state=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(Rules.bonds.fromSave(state,'fox').trust,startingTrust+2);
  A.equal(state.table.bondEvidence[id].used,true);
  const snapshot=FS.readFileSync(file,'utf8');
  A.equal(Turn.execute(file,proofReq).duplicate,true);
  A.equal(FS.readFileSync(file,'utf8'),snapshot);
  A.throws(()=>Turn.execute(file,{...proofReq,id:'bond_witness_apply_02'}),/No unused matching/);
  A.equal(FS.readFileSync(file,'utf8'),snapshot);
 }finally{FS.rmSync(temp,{recursive:true,force:true});}
}
console.log('Bond witnessed-interaction evidence tests passed');
