'use strict';
const A=require('node:assert/strict'),Crypto=require('node:crypto'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),C=require('../rules/core'),
 P=require('../rules/progress'),Turn=require('../scripts/chat-turn.js');
const digest=e=>Crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex');
function fresh(seed=79041){
 const s=E.newGame({name:'Evolution Scene Provenance Fixture',seed,path:'undecided'});
 s.player.attributes.wis=20;s.player.skills.beastlore={rank:2,xp:0};
 s.beasts.fox={id:'fox',name:'Rill Fox',species:'fenfox',evolutionStage:'Base',
  sapience:1,location:'crossing',condition:100};
 s.player.partnerIds=['fox'];
 const form={species:'marshwarden_fox',formName:'Marshwarden Fox',
  speciesGrade:'Uncommon',individualGrade:'Uncommon',size:'Small',
  anatomy:['Hollow resonant reed bones','Transparent water-sensing whiskers'],
  magicalOrgans:['Bogwater filtration sac'],
  abilities:[{name:'Reed Mist',effect:'Condenses a low bank of damp fog',
   cost:'3 Essence',limit:'Only beside water',
   source:'Independently recorded marsh evolution ecology'}],
  needs:{diet:'Insects',habitat:'Wetland',care:'Clean water and cool shade'},
  levelCap:30,maxHp:40,maxEnergy:25};
 const params={beastId:'fox',branchId:'marshward',name:'Marshwarden',kind:'normal',
  grade:2,requiredYears:8,conditions:[
   {label:'The known marsh catalyst is present',known:true,met:true},
   {label:'Secret oracle fragment',known:false,met:false}],
  potential:5,gradeCeiling:5,documented:true,
  eventStats:{vigor:2,will:3,basis:'Independent physiological measurements at the marsh veterinary college'},
  formProfile:form};
 s.beasts.fox.evolutionBranchAssessments={marshward:{
  beastId:'fox',branchId:'marshward',species:'fenfox',evolutionStage:'Base',
  worldMinute:s.world.minutes,source:'Previously established full evolution anatomy and ecology',
  parameters:params}};
 R.act(s,{system:'evolution',operation:'register',
  params:{beastId:'fox',branchId:'marshward'}});
 return s;
}
const action=(s,op,p)=>R.act(s,{system:'evolution',operation:op,params:p});
function seen(s,type='story'){
 C.event(s,type,'Rill Fox survived a dangerous wetland rescue against flooding.',
  {beastId:'fox'});
 return s.log.length-1;
}
function record(s,index,years=2){
 const e=s.log[index];
 s.beasts.fox.crucibleAssessments={marshward:{[String(index)]:{
  beastId:'fox',branchId:'marshward',species:'fenfox',evolutionStage:'Base',
  eventIndex:index,eventHash:digest(e),worldMinute:s.world.minutes,years,
  source:'Independent GM adjudication of a dangerous flood rescue affecting this individual'
 }}};
}
function sign(s,index){
 s.beasts.fox.evolutionSignObservations={marshward:{
  beastId:'fox',branchId:'marshward',species:'fenfox',evolutionStage:'Base',
  eventIndex:index,eventHash:digest(s.log[index]),worldMinute:s.world.minutes,
  location:'crossing',dc:15,distance:8,
  source:'Recorded physical luminous whisker changes witnessed during the marsh examination'
 }};
}
{
 const s=fresh(),idx=seen(s),before=E.exportGame(s),rng=s.rngState;
 for(const q of [
  {key:'fox/marshward',eventIndex:idx,years:3},
  {key:'fox/marshward',eventIndex:idx,source:'I say it counts'},
  {key:'fox/marshward',eventIndex:idx,modifier:90}
 ])A.throws(()=>action(s,'crucible',q),/cannot be supplied by the caller/);
 A.throws(()=>action(s,'crucible',{key:'fox/marshward',eventIndex:idx}),
  /prior source-dated/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 record(s,idx);
 s.beasts.fox.crucibleAssessments.marshward[String(idx)].years=4;
 const bad=E.exportGame(s);
 A.throws(()=>action(s,'crucible',{key:'fox/marshward',eventIndex:idx}),
  /independently adjudicated Crucible years/);
 A.equal(E.exportGame(s),bad);
 s.beasts.fox.crucibleAssessments.marshward[String(idx)].years=2;
 const result=action(s,'crucible',{key:'fox/marshward',eventIndex:idx});
 A.equal(result.maturityGained,2);A.equal(result.witnessed,true);
 A.equal(result.noNewRoll,true);A.equal(s.rngState,rng);
 A.equal(P.get(s,'fox/marshward').years,2);
 A.equal(s.beasts.fox.crucibleAssessments.marshward[String(idx)].used,true);
 A.throws(()=>action(s,'crucible',{key:'fox/marshward',eventIndex:idx}),/prior source-dated/);
}
{
 const s=fresh(79042),idx=seen(s,'beast');
 const initial=E.exportGame(s),rng=s.rngState;
 A.throws(()=>action(s,'signs',{key:'fox/marshward',modifier:100,
  source:'I saw a secret vision'}),/only the established branch key/);
 A.throws(()=>action(s,'signs',{key:'fox/marshward'}),
  /recent source-recorded observation/);
 A.equal(E.exportGame(s),initial);A.equal(s.rngState,rng);
 sign(s,idx);
 s.beasts.fox.evolutionSignObservations.marshward.eventHash='fake';
 A.throws(()=>action(s,'signs',{key:'fox/marshward'}),/does not match the actual earlier beast scene/);
 s.beasts.fox.evolutionSignObservations.marshward.eventHash=digest(s.log[idx]);
 // A fake high sync on the beast without a corroborating contract never
 // grants advanced pattern revelation.
 s.beasts.fox.syncStage=10;
 const reading=action(s,'signs',{key:'fox/marshward'});
 A.equal(reading.noHiddenRequirementsDisclosed,true);
 A.equal(reading.partnerFeltWindow,false);
 A.equal(reading.elapsedMinutes,10);
 A.ok(!JSON.stringify(reading).includes('Secret oracle fragment'));
 A.equal(s.world.minutes,initial?E.importGame(initial).world.minutes+10:0);
 A.equal(s.beasts.fox.evolutionSignObservations.marshward.used,true);
 A.throws(()=>action(s,'signs',{key:'fox/marshward'}),/prior source-dated|already supported/);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-evolution-scenes-'));
 try{
  const file=Path.join(dir,'save.json'),s=fresh(79043);
  const idx=seen(s);
  record(s,idx,3);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const old=FS.readFileSync(file,'utf8');
  const forgery={id:'evolution_fake_crucible_01',mode:'rule',system:'evolution',
   operation:'crucible',params:{key:'fox/marshward',eventIndex:idx,years:3}};
  A.throws(()=>Turn.execute(file,forgery),/cannot be supplied by the caller/);
  A.equal(FS.readFileSync(file,'utf8'),old);
  const approved={id:'evolution_true_crucible_01',mode:'rule',system:'evolution',
   operation:'crucible',params:{key:'fox/marshward',eventIndex:idx}};
  const got=Turn.execute(file,approved);
  A.equal(got.applied,true);A.equal(got.output.rules.maturityGained,3);
  A.equal(Turn.execute(file,approved).duplicate,true);
  let after=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(P.get(after,'fox/marshward').years,3);
  A.equal(after.beasts.fox.crucibleAssessments.marshward[String(idx)].used,true);
  const save=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{...approved,id:'evolution_repeat_crucible_02'}),
   /prior source-dated/);
  A.equal(FS.readFileSync(file,'utf8'),save);
  const signIdx=seen(after,'beast');
  sign(after,signIdx);
  FS.writeFileSync(file,E.exportGame(after)+'\n');
  const request={id:'evolution_sign_read_0001',mode:'rule',system:'evolution',
   operation:'signs',params:{key:'fox/marshward'}};
  const signTurn=Turn.execute(file,request);
  A.equal(signTurn.applied,true);A.equal(signTurn.output.rules.elapsedMinutes,10);
  A.equal(Turn.execute(file,request).duplicate,true);
  const confirmed=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(confirmed.table.evolutionSignScenesUsed['fox:'+digest(after.log[signIdx])],'marshward');
  A.equal(confirmed.beasts.fox.evolutionSignObservations.marshward.used,true);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Witnessed evolution Crucible and sign observation tests passed');
