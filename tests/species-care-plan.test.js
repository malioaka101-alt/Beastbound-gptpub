'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
function fresh(seed=73101){
 const s=E.newGame({name:'Mirehorn Care Fixture',seed,path:'undecided'});
 s.beasts.grazer={id:'grazer',name:'Patient Mirehorn',species:'mirehorn',
  evolutionStage:'Base',sapience:1,location:'crossing',relationship:'mutual partner',
  mood:'calm',needs:{hunger:12,fatigue:0},injuries:[],condition:100};
 s.player.partnerIds=['grazer'];R.bonds.register(s,{beastId:'grazer',start:'unfamiliar'});
 s.player.inventory.marsh_reed=12;
 return s;
}
function plan(s){
 s.beasts.grazer.welfareCarePlan={species:'mirehorn',evolutionStage:'Base',
  diet:'herbivore',foodItem:'marsh_reed',quantity:2,
  shelterLocations:['crossing'],worldMinute:s.world.minutes,
  source:'Named mirehorn keeper confirms two bundles of marsh reed daily with secure water and shelter'};
}
const run=(s,op)=>R.act(s,{system:'bond',operation:op,params:{beastId:'grazer'}});
{
 const s=fresh(),rng=s.rngState,raw=E.exportGame(s);
 A.throws(()=>run(s,'careAttend'),/individual source-documented/);
 A.equal(E.exportGame(s),raw);A.equal(s.rngState,rng);
 plan(s);
 s.beasts.grazer.welfareCarePlan.foodItem='healing_balm';
 const improper=E.exportGame(s);
 A.throws(()=>run(s,'careAttend'),/stale, unsupported/);
 A.equal(E.exportGame(s),improper);
 s.beasts.grazer.welfareCarePlan.foodItem='marsh_reed';
 s.beasts.grazer.welfareCarePlan.quantity=0;
 A.throws(()=>run(s,'careAttend'),/documented daily food quantity/);
 s.beasts.grazer.welfareCarePlan.quantity=2;
 s.beasts.grazer.agencyBoundaries={avoid:['daily_care'],worldMinute:0,
  source:'Witnessed voluntary refusal of direct handling during daily care'};
 const bounded=E.exportGame(s);
 A.throws(()=>run(s,'careAttend'),/does not willingly accept routine handling/);
 A.equal(E.exportGame(s),bounded);
 delete s.beasts.grazer.agencyBoundaries;
 s.player.inventory.marsh_reed=1;
 const lacking=E.exportGame(s);
 A.throws(()=>run(s,'careAttend'),/Insufficient documented marsh_reed feed/);
 A.equal(E.exportGame(s),lacking);
}
{
 const s=fresh(73102);plan(s);
 const starting=R.bonds.fromSave(s,'grazer').trust;
 for(let i=0;i<6;i++){
  const prev=s.player.inventory.marsh_reed;
  const r=run(s,'careAttend');
  A.equal(r.attended,true);A.equal(r.daysRecorded,i+1);
  A.deepEqual(r.foodConsumed,{item:'marsh_reed',quantity:2});
  A.equal(s.player.inventory.marsh_reed||0,prev-2);
  A.equal(R.bonds.fromSave(s,'grazer').trust,starting);
  A.throws(()=>run(s,'careAttend'),/already been recorded|Complete and review/);
  E.advance(s,1440);
 }
 const cert=run(s,'careReview');
 A.equal(cert.recorded,true);
 const e=s.table.bondEvidence[cert.evidenceId];
 A.equal(e.foodItem,'marsh_reed');A.equal(e.foodUnits,12);
 A.ok(e.carePlanSource.includes('Named mirehorn keeper'));
 A.equal(e.attendanceDays.length,6);
 const credited=R.act(s,{system:'bond',operation:'care',
  params:{beastId:'grazer',needs:'met',evidenceId:cert.evidenceId}});
 A.equal(credited.care,'met');
 A.equal(R.bonds.fromSave(s,'grazer').trust,starting+1);
 A.equal(e.used,true);
}
{
 const s=fresh(73103);plan(s);
 run(s,'careAttend');
 E.advance(s,1440);
 s.beasts.grazer.welfareCarePlan.quantity=1;
 const prev=s.player.inventory.marsh_reed,raw=E.exportGame(s),rng=s.rngState;
 A.throws(()=>run(s,'careAttend'),/food quantity and shelter must remain stable/);
 A.equal(s.player.inventory.marsh_reed,prev);
 A.equal(s.rngState,rng);A.equal(E.exportGame(s),raw);
}
{
 const s=fresh(73104);plan(s);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-grazer-care-'));
 try{
  const save=Path.join(dir,'save.json');FS.writeFileSync(save,E.exportGame(s)+'\n');
  const req={id:'grazer_attend_00001',mode:'rule',system:'bond',
   operation:'careAttend',params:{beastId:'grazer'}};
  const v=Turn.execute(save,req);
  A.equal(v.applied,true);A.equal(v.output.rules.daysRecorded,1);
  A.deepEqual(v.output.rules.foodConsumed,{item:'marsh_reed',quantity:2});
  A.equal(Turn.execute(save,req).duplicate,true);
  const st=E.importGame(FS.readFileSync(save,'utf8'));
  A.equal(st.player.inventory.marsh_reed,10);
  const snapshot=FS.readFileSync(save,'utf8');
  A.throws(()=>Turn.execute(save,{...req,id:'grazer_attend_00002'}),/already been recorded/);
  A.equal(FS.readFileSync(save,'utf8'),snapshot);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Documented species-specific beast care plans passed');
