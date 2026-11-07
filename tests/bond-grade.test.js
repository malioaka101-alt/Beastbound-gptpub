'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
function fixture(seed=25101,{grade=2,sapience=1}={}){
 const s=E.newGame({name:'Individual Grade Exam',seed,path:'undecided'});
 s.player.attributes.cha=30;s.player.attributes.wis=30;
 s.player.skills.beastcraft.rank=5;s.player.skills.contractLore={rank:5,xp:0};
 s.beasts.fox={id:'fox',name:'Copper Fox',species:'fenfox',evolutionStage:'Base',
  individualGrade:'Common',sapience,location:'crossing',mood:'attentive',
  needs:{hunger:10,fatigue:0},condition:100,personalityTags:['affiliative'],
  relationship:'mutual partner',gradeCalibration:{
   grade,worldMinute:s.world.minutes,species:'fenfox',evolutionStage:'Base',
   individualGrade:'Common',source:'Independent laboratory-vetted individual Grade reading before field examination'
  }};
 s.player.partnerIds=['fox'];
 R.bonds.register(s,{beastId:'fox',start:'unfamiliar'});
 const b=R.bonds.fromSave(s,'fox');
 b.trust=65;b.willingness=70;b.respect=60;
 return s;
}
const call=(s,op,p={beastId:'fox'})=>R.act(s,{system:'bond',operation:op,params:p});
{
 const s=fixture(25101),before=E.exportGame(s),rng=s.rngState;
 for(const p of [{beastId:'fox',grade:1},{beastId:'fox',checkBonus:50},{beastId:'missing'}])
  A.throws(()=>call(s,'gradeExamine',p),/Only the beastId|Unknown individual/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const unknown=fixture(25102);
 delete unknown.beasts.fox.gradeCalibration;
 const original=E.exportGame(unknown);
 A.throws(()=>call(unknown,'gradeExamine'),/pre-established independent numeric Grade calibration/);
 A.equal(E.exportGame(unknown),original);
 const view=call(unknown,'gradeStatus');A.equal(view.assessed,false);
 A.equal(JSON.stringify(view).includes('grade'),false);
 const incompatible=fixture(25103,{sapience:3});
 A.throws(()=>call(incompatible,'gradeExamine'),/guardian or informed examination consent/);
}
{
 const s=fixture(25104,{grade:9});
 s.player.attributes.wis=10;s.player.skills.beastcraft.rank=0;
 s.rngState=1; // known low throw in an isolated deterministic test fixture
 const beforeCoins=s.player.coins,beforeMinute=s.world.minutes;
 const fail=call(s,'gradeExamine');
 A.equal(fail.completed,true);A.equal(fail.verified,false);
 A.equal(fail.grade,null);A.equal(fail.check.roll,1);
 A.equal(s.player.coins,beforeCoins-1);A.equal(s.world.minutes,beforeMinute+120);
 A.equal(s.beasts.fox.contractGradeAssessment,undefined);
 A.equal(call(s,'gradeStatus').assessed,false);
 const savedRng=s.rngState;
 A.throws(()=>call(s,'gradeExamine'),/cannot be repeated until another sixday/);
 A.equal(s.rngState,savedRng);
}
{
 const temp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-grade-exam-'));
 try{
  const file=Path.join(temp,'save.json'),s=fixture(25105,{grade:2});
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const start=FS.readFileSync(file,'utf8');
  const p={beastId:'fox'};
  const unexamined=Turn.execute(file,{id:'grade_status_before_01',mode:'rule',system:'bond',operation:'gradeStatus',params:p});
  A.equal(unexamined.applied,false);A.equal(unexamined.output.rules.assessed,false);
  A.equal(FS.readFileSync(file,'utf8'),start);
  const req={id:'grade_examine_0001',mode:'rule',system:'bond',operation:'gradeExamine',params:p};
  const result=Turn.execute(file,req);
  A.equal(result.applied,true);A.equal(result.output.rules.verified,true);
  A.equal(result.output.rules.grade,2);
  A.equal(result.output.rules.notSpeciesRarity,true);
  A.ok(result.output.rules.check.roll>=1&&result.output.rules.check.roll<=20);
  let st=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(st.beasts.fox.individualGrade,'Common');
  A.equal(st.beasts.fox.contractGradeAssessment.grade,2);
  A.equal(st.beasts.fox.contractGradeAssessment.origin,'observed-independent-grade-exam');
  A.equal(st.world.minutes,s.world.minutes+120);
  A.equal(st.player.coins,s.player.coins-1);
  A.equal(Turn.execute(file,req).duplicate,true);
  const status=Turn.execute(file,{id:'grade_status_after_01',mode:'rule',system:'bond',operation:'gradeStatus',params:p});
  A.equal(status.applied,false);A.equal(status.output.rules.grade,2);
  const after=FS.readFileSync(file,'utf8');
  A.equal(FS.readFileSync(file,'utf8'),after);
  A.throws(()=>Turn.execute(file,{...req,id:'grade_examine_0002'}),/already has a current numeric Grade/);
  A.equal(FS.readFileSync(file,'utf8'),after);
  const proposal=Turn.execute(file,{id:'grade_offer_0001',mode:'rule',system:'bond',operation:'consentOffer',
   params:{beastId:'fox',depth:'light'}});
  A.equal(proposal.output.rules.accepted,true);
  const contract=Turn.execute(file,{id:'grade_seal_0001',mode:'rule',system:'bond',operation:'seal',
   params:{beastId:'fox',depth:'light'}});
  A.equal(contract.output.rules.sealed,true);
  st=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(st.table.bondRecords.fox.contract.depth,'light');
  A.equal(st.beasts.fox.contractGradeAssessment.grade,2);
 }finally{FS.rmSync(temp,{recursive:true,force:true});}
}
console.log('Calibrated individual Grade examination tests passed');
