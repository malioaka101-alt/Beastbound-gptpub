'use strict';
// Disposable saves only. No real Beastbound character is injured or recovered.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),H=require('../rules/unified'),
 Combat=require('../rules/combat'),Agency=require('../rules/combat-agency'),
 Turn=require('../scripts/chat-turn.js');
const clinic=(s,operation,params={})=>R.act(s,{system:'health',operation,params});
function patient(seed=88031){
 const s=E.newGame({name:'Source-Verified Clinical Patient',seed,path:'undecided'});
 A.equal(E.dispatch(s,'travel academy').ok,true);
 H.ensurePlayer(s);
 const c=Combat.get(s,'player');c.wounds=[1,2,0];
 return s;
}
{
 const s=E.newGame({seed:88032,name:'Healthy Patient'});
 const raw=E.exportGame(s),rng=s.rngState;
 A.throws(()=>clinic(s,'clinicIntake'),/actual Lumenfall Annex clinic/);
 A.throws(()=>clinic(s,'clinicIntake',{woundSeverity:'Critical',instantCure:true}),
  /accepts only a witnessed case ID/);
 A.equal(E.exportGame(s),raw);A.equal(s.rngState,rng);
}
{
 const s=patient(),c=Combat.get(s,'player'),before=s.world.minutes,
  bank=s.player.coins,rng=s.rngState;
 const pre=E.exportGame(s);
 A.throws(()=>clinic(s,'clinicRecover',{caseId:'forged_clinic'}),/current unused/);
 A.throws(()=>clinic(s,'clinicIntake',{date:'now',cost:0}),/accepts only/);
 A.equal(E.exportGame(s),pre);A.equal(s.rngState,rng);
 const first=clinic(s,'clinicIntake');
 A.equal(first.admittedForAssessment,true);
 A.match(first.caseId,/^clinic_case_[0-9]{6}$/);
 A.equal(first.feeTalons,30);
 A.equal(s.world.minutes,before+15);
 A.deepEqual(c.wounds,[1,2,0]);A.equal(s.player.coins,bank);
 A.equal(s.rngState,rng);
 const view=clinic(s,'clinicStatus');
 A.equal(view.pendingCaseId,first.caseId);
 A.equal(view.seriousWounds,2);
 const saved=E.exportGame(s),roll=s.rngState;
 A.throws(()=>clinic(s,'clinicIntake'),/already been witnessed today/);
 A.throws(()=>clinic(s,'clinicRecover',{caseId:first.caseId,days:1}),/accepts only/);
 A.equal(E.exportGame(s),saved);A.equal(s.rngState,roll);
 s.player.partnerIds=['some_partner'];
 const withPartner=E.exportGame(s);
 A.throws(()=>clinic(s,'clinicRecover',{caseId:first.caseId}),/partner needs its own sixday/);
 A.equal(E.exportGame(s),withPartner);
 s.player.partnerIds=[];
 const beforeStay=s.world.minutes;
 const result=clinic(s,'clinicRecover',{caseId:first.caseId});
 A.equal(result.recovered,true);A.equal(result.noExtraRoll,true);
 A.equal(result.noCriticalHealing,true);
 A.equal(s.world.minutes,beforeStay+6*1440);
 A.equal(s.player.coins,bank-30);
 A.deepEqual(c.wounds,[0,1,0]);
 A.equal(c.stamina,c.maxStamina);
 A.equal(s.player.stamina,c.maxStamina);
 A.equal(s.table.clinicCare.active.used,true);
 A.equal(s.table.clinicCare.receipts.length,1);
 A.equal(s.table.finances.entries.at(-1).change,-3000);
 const final=E.exportGame(s),rngAfter=s.rngState;
 A.throws(()=>clinic(s,'clinicRecover',{caseId:first.caseId}),/current unused/);
 A.equal(E.exportGame(s),final);A.equal(s.rngState,rngAfter);
 A.equal(clinic(s,'clinicStatus').pendingCaseId,null);
 A.equal(clinic(s,'clinicStatus').recentReceipts.length,1);
}
{
 const s=patient(88033);
 s.table.combatants.player.wounds=[0,1,1];
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>clinic(s,'clinicIntake'),/Critical-wound patients/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 s.table.combatants.player.wounds=[0,1,0];
 s.table.combatants.player.status='incapacitated';
 const injured=E.exportGame(s);
 A.throws(()=>clinic(s,'clinicIntake'),/Unconscious/);
 A.equal(E.exportGame(s),injured);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-clinic-care-'));
 try{
  const file=Path.join(dir,'save.json'),s=patient(88034);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const before=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{id:'clinic_forge_00001',mode:'rule',system:'health',
   operation:'clinicIntake',params:{physician:'my friend',price:0}}),/accepts only/);
  A.equal(FS.readFileSync(file,'utf8'),before);
  const intake={id:'clinic_intake_00001',mode:'rule',system:'health',
   operation:'clinicIntake',params:{}};
  const admission=Turn.execute(file,intake);
  A.equal(admission.applied,true);
  A.equal(Turn.execute(file,intake).duplicate,true);
  const caseId=admission.output.rules.caseId;
  const current=FS.readFileSync(file,'utf8');
  const read=Turn.execute(file,{id:'clinic_read_00001',mode:'rule',system:'health',
   operation:'clinicStatus',params:{}});
  A.equal(read.applied,false);
  A.equal(read.output.rules.pendingCaseId,caseId);
  A.equal(FS.readFileSync(file,'utf8'),current);
  const recover={id:'clinic_recover_00001',mode:'rule',system:'health',
   operation:'clinicRecover',params:{caseId}};
  const completed=Turn.execute(file,recover);
  A.equal(completed.applied,true);
  A.equal(completed.output.rules.seriousAfter,1);
  A.equal(Turn.execute(file,recover).duplicate,true);
  const final=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{...recover,id:'clinic_double_00001'}),/current unused/);
  A.equal(FS.readFileSync(file,'utf8'),final);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
// A witnessed nonlethal knock-out ends combat instead of trapping the player
// in an exchange they can no longer perform, while preserving the injury.
function threatened(seed){
 const s=E.newGame({seed,name:'Independent Defeat Fixture',path:'undecided'});
 s.beasts.fox={id:'fox',name:'Wild Fox',species:'fenfox',evolutionStage:'Base',
  sapience:1,hp:30,maxHp:30};
 s.encounter={beastId:'fox',threat:true,observed:true};
 s.beasts.fox.combatAssessment={
  beastId:'fox',species:'fenfox',evolutionStage:'Base',sapience:1,
  worldMinute:s.world.minutes,
  source:'Recorded individual threatening animal anatomical and combat field observations',
  behavior:{style:'predatory',nonlethal:true,canCommunicate:false,
   withdrawalDC:16,parleyDC:19,
   source:'Independently observed direct threatening animal attack behaviour'},
  stats:{toughness:6,defense:12,stamina:8,vigor:1,will:1,offM:0,
   durM:0,sapience:1,attack:30,damage:60,boxes:[3,2,1]}
 };
 R.act(s,{system:'combat',operation:'begin',params:{beastId:'fox'}});
 const c=Combat.get(s,'player');c.wounds=[...c.boxes];c.stamina=0;
 H.sync(s,{source:'wounds'});
 return s;
}
let selected=null;
for(let seed=88100;seed<88200;seed++){
 const candidate=threatened(seed);
 if(Agency.choose(candidate).plan!=='attack')continue;
 const result=R.act(candidate,{system:'combat',operation:'exchange',
  params:{intent:'defend',playerBrace:false}});
 if(result.player.status==='knocked_out'){selected=candidate;break;}
}
A.ok(selected,'An independently attacking animal must be able to incapacitate a fully wounded character');
A.equal(selected.battle,null);
A.equal(selected.table.combatDefeats.length,1);
A.equal(selected.table.combatDefeats[0].status,'knocked_out');
A.equal(selected.table.combatants.player.status,'knocked_out');
A.equal(selected.player.health,selected.player.maxHealth); // legacy HP untouched
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-unconscious-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(selected)+'\n');
  const saved=FS.readFileSync(file,'utf8');
  for(const req of [
   {id:'no_unconscious_travel',mode:'act',action:'travel forest'},
   {id:'no_unconscious_skill',mode:'check',checkId:'unwitnessed_skill'},
   {id:'no_unconscious_trade',mode:'rule',system:'gear',operation:'purchase',params:{}},
   {id:'no_unconscious_heal',mode:'act',action:'heal'}
  ]){
   A.throws(()=>Turn.execute(file,req),/no conscious movement, combat, craft, rolls or self-treatment/);
   A.equal(FS.readFileSync(file,'utf8'),saved);
  }
  const readonly=Turn.execute(file,{id:'unconscious_status_001',mode:'rule',
   system:'health',operation:'status',params:{}});
  A.equal(readonly.applied,false);
  A.equal(readonly.output.rules.status,'knocked_out');
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Verified clinic sixday Serious wound treatment and honest incapacitation aftermath passed');
