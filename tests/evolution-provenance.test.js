'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine'),R=require('../rules'),P=require('../rules/progress'),Turn=require('../scripts/chat-turn');
const form={
 species:'fenfox_warden',formName:'Marshwarden Fox',speciesGrade:'Uncommon',individualGrade:'Uncommon',size:'Small',
 anatomy:['Expanded salt-filtering muzzle','Resonant reed-grown tail fan'],magicalOrgans:['Veil-diffusion sac'],
 abilities:[{name:'Mist Shield',effect:'Dense mist in an adjacent space',cost:'3 Essence',
  limit:'Requires wet air',source:'Verified wetland evolution ecology'}],
 needs:{diet:'Fresh shellfish',habitat:'Wet marsh edge',care:'Shallow-water mist-bath rest'},
 levelCap:30,maxHp:40,maxEnergy:28
};
function fresh(seed=36101){
 const s=E.newGame({name:'Evolution Provenance Fixture',seed,path:'undecided'});
 s.beasts.fox={id:'fox',name:'River Fox',species:'fenfox',evolutionStage:'Base',
  sapience:1,consent:true,syncStage:4,condition:100,level:10,trust:80,
  maxHp:30,hp:30,maxEnergy:18,energy:18,techniques:[]};
 s.player.partnerIds=['fox'];
 return s;
}
function branch(s){
 const p={beastId:'fox',branchId:'marshward',name:'Marshwarden',kind:'rare',grade:2,
  requiredYears:2,conditions:[{label:'Documented marsh catalyst',known:true,met:true}],
  potential:5,gradeCeiling:5,documented:true,specialConditionsMet:false,
  formProfile:form,eventStats:{vigor:3,will:3,basis:'Measured and independently witnessed beast physiology at the ward clinic'}};
 s.beasts.fox.evolutionBranchAssessments={marshward:{
  beastId:'fox',branchId:'marshward',species:'fenfox',evolutionStage:'Base',
  worldMinute:s.world.minutes,source:'Pre-established independent evolutionary anatomy and catalyst investigation',
  parameters:p}};
 return p;
}
const run=(s,operation,params)=>R.act(s,{system:'evolution',operation,params});
{
 const s=fresh(),initial=E.exportGame(s);
 const wrong=[
  {beastId:'fox',branchId:'marshward',grade:9},
  {beastId:'fox',branchId:'marshward',conditions:[{met:true}]},
  {beastId:'fox',branchId:'marshward',potential:5},
  {beastId:'fox',branchId:'marshward',requiredYears:0}
 ];
 for(const x of wrong)
  A.throws(()=>run(s,'register',x),/only beastId and branchId/);
 A.throws(()=>run(s,'register',{beastId:'fox',branchId:'marshward'}),/pre-established source-attributed branch assessment/);
 A.equal(E.exportGame(s),initial);
 branch(s);
 s.beasts.fox.evolutionBranchAssessments.marshward.parameters.formProfile=null;
 const unqualified=E.exportGame(s);
 A.throws(()=>run(s,'register',{beastId:'fox',branchId:'marshward'}),/pre-authored full biological form/);
 A.equal(E.exportGame(s),unqualified);
 branch(s);
 s.beasts.fox.evolutionStage='Other';
 A.throws(()=>run(s,'register',{beastId:'fox',branchId:'marshward'}),/pre-established source-attributed branch assessment/);
}
{
 const s=fresh(36102),p=branch(s),rng=s.rngState,start=s.world.minutes;
 const r=run(s,'register',{beastId:'fox',branchId:'marshward'});
 A.equal(r.registered,true);A.equal(r.precommitted,true);
 const stored=P.get(s,r.key);
 A.equal(stored.grade,p.grade);A.equal(stored.potential,p.potential);
 A.equal(stored.requiredYears,2);A.equal(stored.originAssessment.species,'fenfox');
 A.equal(s.rngState,rng);A.equal(s.world.minutes,start);
 A.equal(s.beasts.fox.evolutionBranchAssessments.marshward.used,true);
 A.throws(()=>run(s,'register',{beastId:'fox',branchId:'marshward'}),/pre-established source-attributed branch assessment/);
 const before=E.exportGame(s);
 for(const extra of [
  {days:6,vaelRich:true},{days:6,matchedTraining:true},
  {days:6,branchResources:true},{days:6,syncStage:10},{days:6,daysPerYear:300},
  {days:7},{days:365}
 ])A.throws(()=>run(s,'advance',{key:r.key,...extra}));
 A.equal(E.exportGame(s),before);
 // Spoofing beast.syncStage without a matching earned bond record grants no
 // synchonisation multiplier. The documented branch factor still applies.
 const pass=run(s,'advance',{key:r.key,days:6});
 A.equal(pass.acceleration.verifiedSyncStage,0);
 A.equal(pass.rate,2);
 A.ok(Math.abs(pass.years-12/365)<1e-9);
 A.equal(s.world.minutes,start+8640);
 A.equal(s.rngState!==rng,true); // world advances independently
 const oldMinutes=s.world.minutes;
 s.beasts.fox.evolutionStage='Other';
 A.throws(()=>run(s,'advance',{key:r.key,days:6}),/source-bound current form/);
 A.equal(s.world.minutes,oldMinutes);
}
{
 const s=fresh(36103);
 const p=branch(s);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-evolution-proof-'));
 try{
  const path=Path.join(dir,'save.json');FS.writeFileSync(path,E.exportGame(s)+'\n');
  const first=FS.readFileSync(path,'utf8');
  const denied={id:'evo_arbitrary_00001',mode:'rule',system:'evolution',
   operation:'register',params:{beastId:'fox',branchId:'marshward',potential:5}};
  A.throws(()=>Turn.execute(path,denied),/only beastId and branchId/);
  A.equal(FS.readFileSync(path,'utf8'),first);
  const reg={id:'evo_register_00001',mode:'rule',system:'evolution',
   operation:'register',params:{beastId:'fox',branchId:'marshward'}};
  const approved=Turn.execute(path,reg);
  A.equal(approved.applied,true);A.equal(approved.output.rules.registered,true);
  A.equal(Turn.execute(path,reg).duplicate,true);
  const old=FS.readFileSync(path,'utf8');
  A.throws(()=>Turn.execute(path,{id:'evo_rate_fake_0001',mode:'rule',system:'evolution',
   operation:'advance',params:{key:'fox/marshward',days:6,vaelRich:true}}),/not caller-selectable/);
  A.equal(FS.readFileSync(path,'utf8'),old);
  const advance={id:'evo_advance_00001',mode:'rule',system:'evolution',
   operation:'advance',params:{key:'fox/marshward',days:6}};
  const advanced=Turn.execute(path,advance);
  A.equal(advanced.applied,true);A.equal(advanced.output.rules.elapsedDays,6);
  A.equal(Turn.execute(path,advance).duplicate,true);
  const loaded=E.importGame(FS.readFileSync(path,'utf8'));
  A.equal(P.get(loaded,'fox/marshward').originAssessment.evolutionStage,'Base');
  A.equal(loaded.table.evolution['fox/marshward'].years,12/365);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
{
 const s=fresh(36104),p=branch(s);
 // A legacy prototype branch, even with all requirements marked true, is
 // not a proven current-form opportunity and cannot earn extra Maturity.
 P.register(s,p);
 const rng=s.rngState,minute=s.world.minutes;
 A.throws(()=>run(s,'advance',{key:'fox/marshward',days:6}),/source-bound current form/);
 A.equal(s.rngState,rng);A.equal(s.world.minutes,minute);
}
// In legacy saves two absent sync fields were accidentally compared as equal.
// Missing stage is not a synchronisation bonus, and must not crash maturity.
{
 const s=fresh(36105);
 delete s.beasts.fox.syncStage;
 branch(s);
 run(s,'register',{beastId:'fox',branchId:'marshward'});
 const result=run(s,'advance',{key:'fox/marshward',days:6});
 A.equal(result.acceleration.verifiedSyncStage,0);
 A.equal(result.rate,2);
}
console.log('Protected evolution branch and Maturity provenance tests passed');
