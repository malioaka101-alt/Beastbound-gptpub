'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine'),R=require('../rules'),P=require('../rules/progress'),Turn=require('../scripts/chat-turn');
function fresh(seed=58241){
 const s=E.newGame({name:'Seasonal Evolution Proof',seed,path:'undecided'});
 s.beasts.fox={id:'fox',name:'Rill Fox',species:'fenfox',evolutionStage:'Base',
  lineage:'Marshlight',sapience:1,consent:true,condition:100,location:'crossing',
  level:10,trust:75,syncStage:0};
 s.player.partnerIds=['fox'];s.player.inventory.ripening_fruit=1;
 s.player.inventory.echo_relic=1;s.player.attributes.wis=30;s.player.skills.beastlore={rank:5,xp:0};
 const form={species:'fenfox_warden',formName:'Reedkeeper Fox',size:'Small',
  speciesGrade:'Uncommon',individualGrade:'Uncommon',
  anatomy:['Broadened salt-tolerant muzzle','Resonant reeds inside the forelegs'],
  magicalOrgans:['Marsh-diffusion gland'],
  abilities:[{name:'Reed Haze',effect:'Mists the banks for a brief moment',cost:'4 Essence',
   limit:'Only by wetland water',source:'Recorded wetland lineage investigation'}],
  needs:{diet:'Water insects',habitat:'Reed-marsh',care:'Clean water and shade'},
  levelCap:30,maxHp:40,maxEnergy:25};
 const p={beastId:'fox',branchId:'marshward',name:'Marshward',kind:'rare',
  grade:2,requiredYears:10,potential:5,gradeCeiling:5,documented:true,
  conditions:[{label:'Documented heritage',met:true,known:true}],
  formProfile:form,eventStats:{vigor:-10,will:4,basis:'Recorded full physiological examination of the individual fox'}};
 s.beasts.fox.evolutionBranchAssessments={marshward:{beastId:'fox',branchId:'marshward',
  species:'fenfox',evolutionStage:'Base',worldMinute:s.world.minutes,
  source:'Independent lineage examination and documented marsh catalyst',
  parameters:p}};
 R.act(s,{system:'evolution',operation:'register',params:{beastId:'fox',branchId:'marshward'}});
 return s;
}
const call=(s,op,params={key:'fox/marshward'})=>R.act(s,{system:'evolution',operation:op,params});
function anchored(s){
 R.realm.anchorCalendar(s,{date:{year:1153,month:10,day:5},
  source:'The registered civil calendar displayed in the crossing town hall'});
}
function ripeningProof(s){
 s.beasts.fox.ripeningDoseAssessments={marshward:{
  beastId:'fox',branchId:'marshward',species:'fenfox',evolutionStage:'Base',
  seasonKey:'1153:autumn',item:'ripening_fruit',beastWilling:true,
  worldMinute:s.world.minutes,
  source:'Authenticated seasonal Ripening fruit from a Vael-rich grove for the willing fox'
 }};
}
function echoProof(s){
 s.beasts.fox.patternEchoAssessments={marshward:{
  beastId:'fox',branchId:'marshward',species:'fenfox',evolutionStage:'Base',
  lineage:'Marshlight',location:'crossing',kind:'relic',item:'echo_relic',
  worldMinute:s.world.minutes,
  source:'An established Marshlight relic from the evolved lineage, physically witnessed'
 }};
}
{
 const s=fresh(),before=E.exportGame(s);
 for(const params of [{key:'fox/marshward',season:'Leaffall'},
  {key:'fox/marshward',modifier:90},{key:'fox/marshward',available:true}])
  A.throws(()=>call(s,'ripening',params),/only an existing branch key/);
 A.throws(()=>call(s,'ripening'),/source-anchored in-world calendar/);
 A.equal(E.exportGame(s),before);
 anchored(s);
 A.throws(()=>call(s,'ripening'),/season-specific lawful Ripening source/);
 ripeningProof(s);
 s.beasts.fox.ripeningDoseAssessments.marshward.seasonKey='1153:summer';
 A.throws(()=>call(s,'ripening'),/season-specific lawful Ripening source/);
 s.beasts.fox.ripeningDoseAssessments.marshward.seasonKey='1153:autumn';
 s.player.inventory.ripening_fruit=0;
 const noFruit=E.exportGame(s);
 A.throws(()=>call(s,'ripening'),/real independently sourced Ripening fruit/);
 A.equal(E.exportGame(s),noFruit);
}
{
 const s=fresh(58242);anchored(s);ripeningProof(s);
 const beforeMinutes=s.world.minutes,prior=P.get(s,'fox/marshward').years;
 s.rngState=1; // deterministic severe-failure fixture, never a player reroll
 const r=call(s,'ripening');
 A.equal(r.season,'1153:autumn');A.equal(r.minutes,60);
 A.equal(r.success,false);A.equal(s.beasts.fox.condition,90);
 A.equal(P.get(s,'fox/marshward').years,prior+1);
 A.equal(s.player.inventory.ripening_fruit,0);
 A.equal(s.world.minutes,beforeMinutes+60);
 A.equal(s.beasts.fox.ripeningDoseAssessments.marshward.used,true);
 A.equal(s.table.beastRipeningSeasons.fox['1153:autumn'],'marshward');
 const snapshot=E.exportGame(s),rng=s.rngState;
 A.throws(()=>call(s,'ripening'),/season-specific lawful Ripening source|one seasonal/);
 A.equal(E.exportGame(s),snapshot);A.equal(s.rngState,rng);
}
{
 const s=fresh(58243);echoProof(s);
 const before=E.exportGame(s);
 for(const params of [{key:'fox/marshward',modifier:80},
   {key:'fox/marshward',source:'I saw the relic'}])
  A.throws(()=>call(s,'patternEcho',params),/only an existing branch key/);
 A.equal(E.exportGame(s),before);
 s.beasts.fox.patternEchoAssessments.marshward.lineage='Other Lineage';
 A.throws(()=>call(s,'patternEcho'),/lineage-matched/);
 s.beasts.fox.patternEchoAssessments.marshward.lineage='Marshlight';
 s.player.inventory.echo_relic=0;
 A.throws(()=>call(s,'patternEcho'),/physical relic is not actually present/);
 s.player.inventory.echo_relic=1;
 const initial=s.world.minutes,old=P.get(s,'fox/marshward').years;
 const result=call(s,'patternEcho');
 A.equal(result.minutes,120);A.equal(result.sourceKind,'relic');
 A.ok(result.gain>=0);A.equal(s.world.minutes,initial+120);
 A.ok(P.get(s,'fox/marshward').years>=old);
 A.equal(s.table.beastPatternEchoStages.fox.Base,'marshward');
 A.equal(s.beasts.fox.patternEchoAssessments.marshward.used,true);
 const rng=s.rngState,now=E.exportGame(s);
 A.throws(()=>call(s,'patternEcho'),/lineage-matched|one Pattern Echo/);
 A.equal(s.rngState,rng);A.equal(E.exportGame(s),now);
}
{
 const s=fresh(58244);anchored(s);ripeningProof(s);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-season-proof-'));
 try{
  const save=Path.join(dir,'save.json');
  FS.writeFileSync(save,E.exportGame(s)+'\n');
  const first=FS.readFileSync(save,'utf8');
  const spoof={id:'evolution_dose_spoof_01',mode:'rule',system:'evolution',
   operation:'ripening',params:{key:'fox/marshward',modifier:99}};
  A.throws(()=>Turn.execute(save,spoof),/only an existing branch key/);
  A.equal(FS.readFileSync(save,'utf8'),first);
  const req={id:'evolution_dose_00001',mode:'rule',system:'evolution',
   operation:'ripening',params:{key:'fox/marshward'}};
  const r=Turn.execute(save,req);
  A.equal(r.applied,true);A.equal(r.output.rules.season,'1153:autumn');
  A.equal(Turn.execute(save,req).duplicate,true);
  const written=E.importGame(FS.readFileSync(save,'utf8'));
  A.equal(written.player.inventory.ripening_fruit,0);
  A.equal(written.beasts.fox.ripeningDoseAssessments.marshward.used,true);
  const again=FS.readFileSync(save,'utf8');
  A.throws(()=>Turn.execute(save,{...req,id:'evolution_dose_00002'}),/season-specific lawful Ripening source/);
  A.equal(FS.readFileSync(save,'utf8'),again);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Evolution Ripening and Pattern Echo provenance tests passed');
