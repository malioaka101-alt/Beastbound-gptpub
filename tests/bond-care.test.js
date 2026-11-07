'use strict';
// A sixday of welfare is supported by six real, resource-backed attendance
// records and actual elapsed world time, not by writing "met" in a request.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine'),Rules=require('../rules'),Turn=require('../scripts/chat-turn');
const fresh=()=>{
 const s=E.newGame({name:'Sixday Care Fixture',seed:20261106,path:'undecided'});
 s.beasts.fox={id:'fox',name:'Copper Fox',species:'fenfox',evolutionStage:'Base',sapience:1,
  location:'crossing',needs:{hunger:10,fatigue:0},injuries:[],condition:100};
 s.player.partnerIds=['fox'];
 Rules.bonds.register(s,{beastId:'fox',start:'unfamiliar'});
 s.player.inventory.clean_rations=6;
 return s;
};
const call=(s,operation,params={beastId:'fox'})=>Rules.act(s,{system:'bond',operation,params});
{
 const s=fresh(),before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>call(s,'careReview'),/No unreviewed/);
 A.throws(()=>call(s,'careAttend',{beastId:'fox',needs:'met'}),/only an existing beastId/);
 A.throws(()=>call(s,'careAttend',{beastId:'fox',days:6}),/only an existing beastId/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 s.beasts.fox.species='nightcorvid';A.throws(()=>call(s,'careAttend'),/species-appropriate welfare feeding plan/);
 s.beasts.fox.species='dreamreed';s.beasts.fox.evolutionStage='Dreamreed';
 A.throws(()=>call(s,'careAttend'),/species-appropriate welfare feeding plan/);
 s.beasts.fox.species='fenfox';s.beasts.fox.evolutionStage='Base';s.world.location='ruins';s.beasts.fox.location='ruins';
 A.throws(()=>call(s,'careAttend'),/Shelter and clean-water/);
 s.world.location='crossing';s.beasts.fox.location='crossing';s.beasts.fox.needs.fatigue=75;
 A.throws(()=>call(s,'careAttend'),/tailored care/);
 A.equal(s.player.inventory.clean_rations,6);
}
{
 const s=fresh(),start=s.world.minutes,initial=Rules.bonds.fromSave(s,'fox').trust;
 const proofIds=new Set();
 for(let i=0;i<6;i++){
  const oldRations=s.player.inventory.clean_rations;
  const receipt=call(s,'careAttend');
  A.equal(receipt.attended,true);
  A.equal(receipt.daysRecorded,i+1);
  A.equal(receipt.elapsedMinutes,30);
  A.equal(s.player.inventory.clean_rations||0,oldRations-1);
  A.equal(Rules.bonds.fromSave(s,'fox').trust,initial);
  A.throws(()=>call(s,'careAttend'),/already been recorded|Complete and review/);
  if(i<5)E.advance(s,1440);
 }
 A.throws(()=>call(s,'careReview'),/Six full in-world days/);
 E.advance(s,1440);
 const reviewed=call(s,'careReview');
 A.equal(reviewed.recorded,true);
 A.equal(reviewed.needs,'met');
 A.equal(reviewed.startMinute,0);
 A.equal(reviewed.endMinute,8640);
 proofIds.add(reviewed.evidenceId);
 A.equal(proofIds.size,1);
 A.throws(()=>call(s,'careReview'),/No unreviewed/);
 const ev=s.table.bondEvidence[reviewed.evidenceId];
 A.equal(ev.kind,'care');A.equal(ev.origin,'completed-provisioning-ledger');
 A.deepEqual(ev.attendanceDays,[0,1,2,3,4,5]);
 A.equal(ev.foodUnits,6);A.ok(ev.source.length>=18);
 A.equal(Rules.bonds.fromSave(s,'fox').trust,initial);
 const r=call(s,'care',{beastId:'fox',needs:'met',evidenceId:reviewed.evidenceId});
 A.equal(r.care,'met');
 A.equal(Rules.bonds.fromSave(s,'fox').trust,initial+1);
 A.equal(s.table.bondEvidence[reviewed.evidenceId].used,true);
 A.equal(s.table.bondCareEnd.fox,8640);
 A.throws(()=>call(s,'care',{beastId:'fox',needs:'met',evidenceId:reviewed.evidenceId}),/No unused matching/);
 const status=call(s,'careStatus');
 A.equal(status.completed,true);A.equal(status.evidenceId,reviewed.evidenceId);
 A.ok(s.world.minutes>=start+6*1440);
}
{
 const s=fresh();
 for(let i=0;i<3;i++){call(s,'careAttend');E.advance(s,1440);}
 // A missed day breaks the sixday streak, rather than filling it silently.
 E.advance(s,1440);
 const receipt=call(s,'careAttend');
 A.equal(receipt.daysRecorded,1);
 A.throws(()=>call(s,'careReview'),/Six full in-world days|No unreviewed|consecutive/);
}
{
 const s=fresh();
 s.player.inventory.clean_rations=0;
 const temp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-provision-'));
 try{
  const filename=Path.join(temp,'save.json');
  FS.writeFileSync(filename,E.exportGame(s)+'\n');
  const old=FS.readFileSync(filename,'utf8');
  A.throws(()=>Turn.execute(filename,{id:'no_food_00001',mode:'rule',system:'bond',
   operation:'careAttend',params:{beastId:'fox'}}),/One clean ration/);
  A.equal(FS.readFileSync(filename,'utf8'),old);
  const viewed=Turn.execute(filename,{id:'care_status_00001',mode:'rule',system:'bond',
   operation:'careStatus',params:{beastId:'fox'}});
  A.equal(viewed.applied,false);
  A.equal(viewed.output.rules.daysRecorded,0);
  A.equal(FS.readFileSync(filename,'utf8'),old);
 }finally{FS.rmSync(temp,{recursive:true,force:true});}
}
// The verified calendar, review and care award also survive an actual
// file-backed Project turn, with duplicate protection at each boundary.
{
 const temp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-care-ledger-'));
 try{
  const file=Path.join(temp,'save.json'),s=fresh();
  for(let i=0;i<6;i++){call(s,'careAttend');E.advance(s,1440);}
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const reviewReq={id:'care_review_00001',mode:'rule',system:'bond',
   operation:'careReview',params:{beastId:'fox'}};
  const reviewed=Turn.execute(file,reviewReq);
  A.equal(reviewed.applied,true);
  A.equal(reviewed.output.rules.recorded,true);
  const id=reviewed.output.rules.evidenceId;
  A.equal(Turn.execute(file,reviewReq).duplicate,true);
  const before=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(Rules.bonds.fromSave(before,'fox').trust,0);
  const careReq={id:'care_apply_00001',mode:'rule',system:'bond',
   operation:'care',params:{beastId:'fox',needs:'met',evidenceId:id}};
  const applied=Turn.execute(file,careReq);
  A.equal(applied.applied,true);
  const after=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(Rules.bonds.fromSave(after,'fox').trust,1);
  A.equal(after.table.bondEvidence[id].used,true);
  const snapshot=FS.readFileSync(file,'utf8');
  A.equal(Turn.execute(file,careReq).duplicate,true);
  A.equal(FS.readFileSync(file,'utf8'),snapshot);
  A.throws(()=>Turn.execute(file,{...careReq,id:'care_apply_00002'}),/No unused matching/);
  A.equal(FS.readFileSync(file,'utf8'),snapshot);
 }finally{FS.rmSync(temp,{recursive:true,force:true});}
}
console.log('Verified sixday beast-care tests passed');
