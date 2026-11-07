'use strict';
// No user campaign save is loaded. Source-linked rescue and convalescence use
// only independently resolved, disposable combat fixtures.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),Combat=require('../rules/combat'),
 H=require('../rules/unified'),W=require('../rules/world'),
 Agency=require('../rules/combat-agency'),Turn=require('../scripts/chat-turn.js');
const medical=(s,operation,params={})=>R.act(s,{system:'health',operation,params});
function encounter(seed,style='cautious'){
 const s=E.newGame({seed,name:'Real Clinical Rehabilitation Fixture',path:'undecided'});
 A.equal(E.dispatch(s,'travel academy').ok,true);
 s.beasts.fox={id:'fox',name:'Individually Examined Fox',
  species:'fenfox',evolutionStage:'Base',sapience:1,location:'academy',hp:30,maxHp:30};
 s.encounter={beastId:'fox',observed:true,threat:true};
 s.beasts.fox.combatAssessment={
  beastId:'fox',species:'fenfox',evolutionStage:'Base',sapience:1,worldMinute:s.world.minutes,
  source:'Previously witnessed individual nonlethal beast anatomy and danger profile for a disposable scene',
  behavior:{style,nonlethal:true,canCommunicate:false,
   withdrawalDC:15,parleyDC:19,
   source:'Recorded previous independent cautious nonlethal behavioural examination of this fox'},
  stats:{toughness:7,defense:12,stamina:8,vigor:1,will:1,offM:0,durM:0,
   sapience:1,attack:30,damage:60,boxes:[3,2,1]}};
 R.act(s,{system:'combat',operation:'begin',params:{beastId:'fox'}});
 const c=Combat.get(s,'player');
 c.wounds=[...c.boxes];c.stamina=0;
 H.sync(s,{source:'wounds'});
 return s;
}
function genuinelyRescued(){
 for(let seed=93111;seed<93611;seed++){
  const s=encounter(seed);
  if(Agency.choose(s).plan!=='attack')continue;
  const r=R.act(s,{system:'combat',operation:'exchange',
    params:{intent:'defend',playerBrace:false}});
  if(r.player.status!=='knocked_out'||s.table.combatDefeats.at(-1)?.dangerCleared!==true)
   continue;
  medical(s,'physicianRescue');
  A.equal(s.table.combatants.player.status,'incapacitated');
  A.equal(s.table.physicianRescue.receipts.length,1);
  return s;
 }
 throw Error('No deterministic genuinely witnessed source-safe physician rescue scenario');
}
{
 const s=E.newGame({seed:93108,name:'Not Injured'});
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>medical(s,'criticalCare',{days:1,price:0}),/takes no caller-selected/);
 A.throws(()=>medical(s,'criticalCare'),/off-site clinic/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=genuinelyRescued(),c=Combat.get(s,'player');
 const legacy=s.player.health,pre=E.exportGame(s),initial=s.world.minutes,bank=s.player.coins;
 const status=medical(s,'criticalStatus');
 A.equal(status.patientStatus,'incapacitated');
 A.equal(status.hasRecordedEmergencyObservation,true);
 A.equal(status.criticalWounds,1);
 A.equal(E.exportGame(s),pre);
 for(const p of [
  {days:1},{fee:0},{doctor:'a conjured archmage'},{result:'perfect permanent recovery'}
 ]){
  A.throws(()=>medical(s,'criticalCare',p),/takes no caller-selected/);
  A.equal(E.exportGame(s),pre);
 }
 s.player.partnerIds.push('unprovided_partner');
 const partner=E.exportGame(s);
 A.throws(()=>medical(s,'criticalCare'),/partner welfare/);
 A.equal(E.exportGame(s),partner);
 s.player.partnerIds=[];
 s.player.coins=59;
 const poor=E.exportGame(s);
 A.throws(()=>medical(s,'criticalCare'),/funds of 60 Talons/);
 A.equal(E.exportGame(s),poor);
 s.player.coins=bank;
 const care=medical(s,'criticalCare');
 A.equal(care.careCompleted,true);
 A.equal(care.feeTalons,60);
 A.equal(care.careDays,18);
 A.equal(care.rehabilitationStillRequired,true);
 A.equal(care.noExtraRoll,true);
 A.equal(care.sourceDefeatHash,s.table.combatDefeats.at(-1).eventHash);
 A.equal(s.world.minutes,initial+18*1440);
 A.equal(s.player.coins,bank-60);
 A.equal(s.player.health,legacy);
 A.deepEqual(c.wounds,[0,0,0]);
 A.equal(c.status,'rehabilitating');
 A.equal(c.lingeringPenalty,1);
 A.equal(Combat.penalty(c),1);
 A.ok(c.conditions.includes('post_critical_rehabilitation'));
 A.equal(s.table.finances.entries.at(-1).change,-6000);
 A.equal(s.table.clinicalCritical.phase,'in_rehabilitation');
 const after=E.exportGame(s),rng=s.rngState;
 A.throws(()=>medical(s,'criticalCare'),/one verified Critical wound/);
 A.throws(()=>medical(s,'criticalRehab',{skipDays:true}),/takes no caller-selected/);
 A.equal(E.exportGame(s),after);A.equal(s.rngState,rng);
 const rehab=medical(s,'criticalRehab');
 A.equal(rehab.discharged,true);
 A.equal(rehab.elapsedDays,6);
 A.equal(rehab.status,'ok');
 A.equal(rehab.lingeringCombatPenalty,1);
 A.equal(s.world.minutes,initial+24*1440);
 A.equal(s.player.health,legacy);
 A.deepEqual(c.wounds,[0,0,0]);
 A.equal(c.status,'ok');A.equal(c.stamina,c.maxStamina);
 A.ok(c.conditions.includes('post_critical_fatigue'));
 A.equal(Combat.penalty(c),1);
 A.equal(s.table.clinicalCritical.phase,'discharged');
 A.equal(s.table.clinicalCritical.fatigueUntilMinute,
  s.world.minutes+12*1440);
 const dis=E.exportGame(s);
 A.throws(()=>medical(s,'criticalRehab'),/previously completed and unchanged/);
 A.throws(()=>medical(s,'criticalFollowup'),/full 12 days/);
 A.equal(E.exportGame(s),dis);
 const beforeWait=s.world.minutes;
 E.advance(s,12*1440);W.finalizeTime(s,beforeWait);
 H.sync(s,{source:'legacy'});
 const follow=medical(s,'criticalFollowup');
 A.equal(follow.fullyRehabilitated,true);
 A.equal(follow.lingeringPenalty,0);
 A.equal(follow.clinicalHistoryPreserved,true);
 A.equal(Combat.penalty(c),0);
 A.equal(s.table.clinicalCritical.phase,'completed');
 A.equal(s.table.clinicalInjuryHistory.length,1);
 A.equal(s.table.clinicalInjuryHistory[0].permanentAbilityLost,false);
 A.equal(s.player.health,legacy);
 const finished=E.exportGame(s),finalRng=s.rngState;
 A.throws(()=>medical(s,'criticalFollowup'),/full 12 days/);
 A.equal(E.exportGame(s),finished);A.equal(s.rngState,finalRng);
}
{
 const s=genuinelyRescued();
 s.table.physicianRescue.receipts[0].source='My invented best healer treated me';
 const invalid=E.exportGame(s),rng=s.rngState;
 A.throws(()=>medical(s,'criticalCare'),/genuinely witnessed and completed Dr Vael rescue/);
 A.equal(E.exportGame(s),invalid);A.equal(s.rngState,rng);
}
{
 const s=genuinelyRescued();
 const bad=s.table.clinicalCritical;A.equal(bad,undefined);
 s.table.combatDefeats[0].eventHash='not_source_attested';
 const original=E.exportGame(s);
 A.throws(()=>medical(s,'criticalCare'),/genuinely witnessed and completed Dr Vael rescue/);
 A.equal(E.exportGame(s),original);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-clinical-rehabilitation-'));
 try{
  const file=Path.join(dir,'save.json'),s=genuinelyRescued();
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const pre=FS.readFileSync(file,'utf8');
  const view=Turn.execute(file,{id:'critical_read_0001',mode:'rule',
   system:'health',operation:'criticalStatus',params:{}});
  A.equal(view.applied,false);A.equal(view.output.rules.criticalWounds,1);
  A.equal(FS.readFileSync(file,'utf8'),pre);
  for(const req of [
   {id:'critical_cheat_0001',mode:'rule',system:'health',
    operation:'criticalCare',params:{healedWounds:99}},
   {id:'critical_walk_0001',mode:'act',action:'travel crossing'}
  ]){
   A.throws(()=>Turn.execute(file,req),
    /takes no caller-selected|no conscious movement/);
   A.equal(FS.readFileSync(file,'utf8'),pre);
  }
  const admission={id:'critical_course_0001',mode:'rule',system:'health',
   operation:'criticalCare',params:{}};
  const r=Turn.execute(file,admission);
  A.equal(r.applied,true);A.equal(r.output.rules.careCompleted,true);
  A.equal(Turn.execute(file,admission).duplicate,true);
  const after=FS.readFileSync(file,'utf8'),patient=E.importGame(after);
  A.equal(patient.table.combatants.player.status,'rehabilitating');
  A.equal(patient.table.clinicalCritical.phase,'in_rehabilitation');
  A.throws(()=>Turn.execute(file,{id:'critical_rehab_cheat_0001',mode:'act',
   action:'heal'}),/no conscious movement/);
  A.equal(FS.readFileSync(file,'utf8'),after);
  const therapy={id:'critical_rehab_0001',mode:'rule',system:'health',
   operation:'criticalRehab',params:{}};
  const r2=Turn.execute(file,therapy);
  A.equal(r2.applied,true);A.equal(r2.output.rules.discharged,true);
  A.equal(Turn.execute(file,therapy).duplicate,true);
  const recovered=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(recovered.table.combatants.player.status,'ok');
  A.equal(Combat.penalty(recovered.table.combatants.player),1);
  const look=Turn.execute(file,{id:'post_rehab_look_0001',mode:'act',action:'look'});
  A.equal(look.ok,true);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Source-witnessed 18-day Critical convalescence, 6-day rehab, 12-day fatigue follow-up and restored ordinary play');
