'use strict';
const A=require('node:assert/strict'),E=require('../engine'),
 New=require('../scripts/new-campaign'),GmOpening=require('../scripts/gm-campaign-opening'),
 Core=require('../rules/core'),Rules=require('../rules'),Kin=require('../world/origin-relatives');
function rollFrom(seed){
 const obj={rngState:seed};return Core.die(obj);
}
function selectedRoll(wantHigh){
 for(let seed=1;seed<=100000;seed++){
  const roll=rollFrom(seed);
  if(wantHigh?roll===20:roll<=2)return seed;
 }
 throw Error('No deterministic test RNG seed found');
}
function fixture(seed){
 const s=New.create({seed,slug:'household_work_fixture',mode:'guided',
  homeRegion:'morrowfen_basin',originKind:'ordinary',age:10}).state;
 const homeRegion=s.campaign.origin.birthRegionId,
  kin=s.table.realm.originKin.people.kin_1;
 A.ok(Kin.verify(s.table.realm,kin));
 GmOpening.apply(s,{place:{placeId:'test_family_cottage',
  name:'Test Family Cottage',regionId:homeRegion,kind:'family cottage',
  sceneType:'settlement',
  description:'A small, lived-in family dwelling with household tools and a worn outdoor workbench.',
  culture:'Ordinary household duties are shared by negotiation, not presumed obligations.'},
  scene:'At the family cottage, '+kin.name+
   ' actually discusses an ordinary cleaning job and possible payment with the learner.',
  focus:'Consider household work',weather:'Cool clear morning',
  hour:8,minute:0});
 return {s,kin};
}
{
 const {s,kin}=fixture(921111);
 const oldMoney=s.player.coins,oldFunds=kin.funds,oldMinutes=s.world.minutes,
  oldStamina=s.player.stamina;
 A.ok(oldFunds>=4);
 // Deterministic test fixture: NPC independently accepts, then the original
 // source-owned skill check succeeds. Neither die nor NPC response is a request.
 kin.rngState=1;s.rngState=selectedRoll(true);
 const params={npcId:kin.actorId,
  purpose:'Clean and sort the household work harnesses and buckles'};
 const result=Rules.act(s,{system:'social',operation:'householdWork',params});
 A.equal(result.accepted,true);
 A.equal(result.check.success,true);
 A.equal(result.paidTalons,2);
 A.equal(s.player.coins,oldMoney+2);
 A.equal(kin.funds,oldFunds-2);
 A.equal(s.player.stamina,oldStamina-2);
 A.equal(s.table.combatants.player.stamina,s.player.stamina);
 A.equal(s.world.minutes,oldMinutes+120);
 A.equal(Rules.act(s,{system:'social',operation:'householdWorkStatus',params:{}}).
  personallyWitnessedJobs.at(-1).paidTalons,2);
 const receipt=s.table.householdWork.records.at(-1);
 A.ok(receipt.hash&&receipt.proof.originalCheck);
 const saved=E.exportGame(s);
 A.deepEqual(E.importGame(saved).table.householdWork.records,s.table.householdWork.records);
 A.throws(()=>Rules.act(s,{system:'social',operation:'householdWork',params}),
  /already considered/);
 A.equal(E.exportGame(s),saved,'same family member cannot be paid twice in one day');
 A.throws(()=>Rules.act(s,{system:'social',operation:'householdWork',
  params:{...params,paidTalons:999}}),/name a witnessed|practical household task/);
}
{
 const {s,kin}=fixture(921112),oldMoney=s.player.coins,
  oldFunds=kin.funds,oldMinutes=s.world.minutes;
 kin.rngState=selectedRoll(true);
 const result=Rules.act(s,{system:'social',operation:'householdWork',
  params:{npcId:kin.actorId,purpose:'Sort the family work straps and wash their old buckles'}});
 A.equal(result.accepted,false);
 A.equal(result.paidTalons,0);
 A.equal(s.player.coins,oldMoney);
 A.equal(kin.funds,oldFunds);
 A.equal(s.world.minutes,oldMinutes+5);
}
{
 const {s,kin}=fixture(921113);
 s.chatRuntime.scene='No family members were actually witnessed here.';
 A.throws(()=>Rules.act(s,{system:'social',operation:'householdWork',
  params:{npcId:kin.actorId,purpose:'Wash the family harnesses and clean their buckles'}}),
 /actually witnessed/);
}
console.log('Household work: original living kin choice, independently rolled work quality, time and Stamina, conserved wages, persistent receipts, no duplicate pay or forced family consent');
