'use strict';
// Actual wound attacks plus ordinary travel to a named clinic. No live save,
// invented lab, caller-authored injury or forged successful medical roll.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),H=require('../rules/unified'),
 Agency=require('../rules/combat-agency'),Combat=require('../rules/combat'),
 Turn=require('../scripts/chat-turn.js');
const act=(s,name,p={})=>R.act(s,{system:'health',operation:name,params:p});
function faceWild(seed){
 const s=E.newGame({seed,name:'Conscious Critical Referral Fixture',path:'undecided'});
 A.equal(E.dispatch(s,'travel forest').ok,true);
 s.beasts.fox={id:'fox',name:'Individually Observed Wild Fox',species:'fenfox',
  evolutionStage:'Base',sapience:1,location:'forest',hp:30,maxHp:30};
 s.encounter={beastId:'fox',observed:true,threat:true};
 s.beasts.fox.combatAssessment={
  beastId:'fox',species:'fenfox',evolutionStage:'Base',sapience:1,
  worldMinute:s.world.minutes,
  source:'Individually authenticated field assessment of a wild forest fox before dangerous engagement',
  behavior:{style:'predatory',nonlethal:true,canCommunicate:false,
   withdrawalDC:8,parleyDC:19,
   source:'Previously observed aggressive nonlethal field combat and field withdrawal behaviour'},
  stats:{toughness:7,defense:12,stamina:8,vigor:1,will:1,offM:0,durM:0,
   sapience:1,attack:30,damage:30,boxes:[3,2,1]}
 };
 R.act(s,{system:'combat',operation:'begin',params:{beastId:'fox'}});
 return s;
}
function actualCriticalSurvivor(){
 for(let seed=93901;seed<94901;seed++){
  const s=faceWild(seed);
  if(Agency.choose(s).plan!=='attack')continue;
  const hit=R.act(s,{system:'combat',operation:'exchange',
   params:{intent:'defend',playerBrace:false}});
  const c=Combat.get(s,'player');
  if(hit.player.status!=='ok'||c.wounds[2]!==1||!s.battle)continue;
  const wound=s.log.find(x=>x.type==='combat'&&
   x.details?.criticalWitness?.origin==='verified-conscious-critical-combat-hit');
  A.ok(wound,'One genuine survived Critical attack must have been logged');
  const escape=R.act(s,{system:'combat',operation:'exchange',
   params:{intent:'withdraw'}});
  if(!escape.ended||escape.reason!=='Withdrawal succeeded'||c.status!=='ok')continue;
  A.equal(E.dispatch(s,'travel crossing').ok,true);
  A.equal(E.dispatch(s,'travel academy').ok,true);
  H.sync(s,{source:'legacy'});
  A.equal(s.table?.combatDefeats?.length||0,0);
  A.equal(s.table.combatants.player.wounds[2],1);
  return s;
 }
 throw Error('No independent witnessed survivor with a Critical Vigor save and actual field retreat was found');
}
{
 const s=E.newGame({name:'No Invented Critical Referral',seed:94902});
 A.equal(E.dispatch(s,'travel academy').ok,true);
 H.ensurePlayer(s);
 const c=Combat.get(s,'player');
 c.wounds[2]=1; // disposable negative test: forged wound has no combat event
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'criticalReferral'),/recent genuine survived Critical wound/);
 A.throws(()=>act(s,'criticalReferral',{doctor:'unearned celebrity healer'}),
  /accepts no chosen severity/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=actualCriticalSurvivor(),c=Combat.get(s,'player'),
  clock=s.world.minutes,bank=s.player.coins,oldRng=s.rngState;
 const source=s.log.find(x=>x.details?.criticalWitness);
 A.equal(source.details.criticalWitness.location,'forest');
 A.equal(source.details.wound.result,'Critical wound');
 A.equal(source.details.wound.criticalSave.success,true);
 A.equal(source.details.status,'ok');
 A.equal(s.world.location,'academy');
 const prior=E.exportGame(s);
 for(const p of [{result:'successful cure'}, {source:'my word'}, {wounds:[0,0,0]}]){
  A.throws(()=>act(s,'criticalReferral',p),/accepts no chosen severity/);
  A.equal(E.exportGame(s),prior);
 }
 const consult=act(s,'criticalReferral');
 A.equal(consult.referred,true);
 A.equal(consult.elapsedMinutes,15);
 A.equal(consult.woundsHealed,0);
 A.equal(consult.physician,'Dr Vael');
 A.equal(s.world.minutes,clock+15);
 A.equal(s.rngState,oldRng);
 A.equal(s.player.coins,bank);
 A.deepEqual(c.wounds,[0,0,1]);
 A.equal(c.status,'ok');
 A.equal(s.table.criticalConsciousReferral.used,false);
 A.equal(s.table.criticalConsciousReferral.originalAttackHash,consult.sourceWoundHash);
 A.equal(act(s,'criticalStatus').hasWitnessedConsciousReferral,true);
 const known=E.exportGame(s);
 A.throws(()=>act(s,'criticalReferral'),/already awaiting/);
 A.equal(E.exportGame(s),known);
 const result=act(s,'criticalCare');
 A.equal(result.careCompleted,true);
 A.equal(result.clinicalEntryRoute,'conscious-witnessed-field-injury');
 A.equal(result.sourceDefeatHash,null);
 A.equal(result.sourceInjuryHash,consult.sourceWoundHash);
 A.equal(s.table.clinicalCritical.sourceDefeatHash,null);
 A.equal(s.table.clinicalCritical.sourceInjuryHash,consult.sourceWoundHash);
 A.equal(s.table.criticalConsciousReferral.used,true);
 A.equal(s.table.criticalConsciousReferralsUsed[consult.sourceWoundHash],clock+15);
 A.equal(s.player.coins,bank-60);
 A.equal(c.status,'rehabilitating');
 A.deepEqual(c.wounds,[0,0,0]);
 A.equal(act(s,'criticalStatus').hasWitnessedConsciousReferral,false);
 const stay=E.exportGame(s);
 A.throws(()=>act(s,'criticalReferral'),/conscious patient/);
 A.equal(E.exportGame(s),stay);
 const r=act(s,'criticalRehab');
 A.equal(r.discharged,true);A.equal(c.status,'ok');
 A.equal(Combat.penalty(c),1);
 A.equal(s.table.clinicalCritical.phase,'discharged');
}
{
 const s=actualCriticalSurvivor();
 act(s,'criticalReferral');
 s.table.criticalConsciousReferral.consultHash='faked';
 const invalid=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'criticalCare'),/cannot be authenticated/);
 A.equal(E.exportGame(s),invalid);A.equal(s.rngState,rng);
}
{
 const s=actualCriticalSurvivor();
 act(s,'criticalReferral');
 s.table.criticalConsciousReferral.originalAttackHash='faked';
 const invalid=E.exportGame(s);
 A.throws(()=>act(s,'criticalCare'),/current, unused real Dr Vael Critical-injury referral/);
 A.equal(E.exportGame(s),invalid);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-conscious-critical-'));
 try{
  const file=Path.join(dir,'save.json'),s=actualCriticalSurvivor();
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const original=FS.readFileSync(file,'utf8');
  const invalid={id:'field_referral_forge_0001',mode:'rule',system:'health',
   operation:'criticalReferral',params:{quality:'perfect'}};
  A.throws(()=>Turn.execute(file,invalid),/accepts no chosen severity/);
  A.equal(FS.readFileSync(file,'utf8'),original);
  const consultation={id:'field_referral_real_0001',mode:'rule',system:'health',
   operation:'criticalReferral',params:{}};
  const got=Turn.execute(file,consultation);
  A.equal(got.applied,true);
  A.equal(got.output.rules.referred,true);
  A.equal(Turn.execute(file,consultation).duplicate,true);
  const beforeTreatment=FS.readFileSync(file,'utf8');
  const status=Turn.execute(file,{id:'field_referral_status_0001',mode:'rule',
   system:'health',operation:'criticalStatus',params:{}});
  A.equal(status.applied,false);
  A.equal(status.output.rules.hasWitnessedConsciousReferral,true);
  A.equal(FS.readFileSync(file,'utf8'),beforeTreatment);
  const care={id:'field_critical_care_0001',mode:'rule',system:'health',
   operation:'criticalCare',params:{}};
  const treated=Turn.execute(file,care);
  A.equal(treated.applied,true);
  A.equal(treated.output.rules.sourceInjuryHash,got.output.rules.sourceWoundHash);
  A.equal(Turn.execute(file,care).duplicate,true);
  const patient=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(patient.table.combatants.player.status,'rehabilitating');
  A.equal(patient.table.criticalConsciousReferral.used,true);
  const rehab={id:'field_critical_rehab_0001',mode:'rule',system:'health',
   operation:'criticalRehab',params:{}};
  const rehabilitated=Turn.execute(file,rehab);
  A.equal(rehabilitated.applied,true);
  const result=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(result.table.combatants.player.status,'ok');
  A.equal(result.table.clinicalCritical.sourceDefeatHash,null);
  A.equal(result.table.clinicalCritical.clinicalEntryRoute,'conscious-witnessed-field-injury');
  const after=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{id:'field_repeat_care_0001',
   mode:'rule',system:'health',operation:'criticalCare',params:{}}),
   /one verified Critical wound/);
  A.equal(FS.readFileSync(file,'utf8'),after);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Actual witnessed conscious forest Critical hit, retreat, clinic consultation and full non-surgical recovery');
