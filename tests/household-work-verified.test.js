'use strict';
// Household labour is an original local family exchange, never a name-only
// wage generator. All people and saves below belong to disposable campaigns.
const A=require('node:assert/strict'),E=require('../engine'),
 R=require('../rules'),New=require('../scripts/new-campaign'),
 Kin=require('../world/origin-relatives'),Realm=require('../world/simulation'),
 Turn=require('../scripts/chat-turn'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path');
function fixture(start=700800){
 for(let seed=start;seed<start+60;seed++){
  const s=New.create({seed,slug:'household_work_fixture',mode:'guided',
   age:10,homeRegion:'morrowfen_basin',originKind:'ordinary',
   startLocation:'crossing'}).state;
  const w=Realm.ensure(s),person=w.originKin?.people?.kin_1;
  if(!person)continue;
  const region=s.campaign.origin.birthRegionId;
  R.act(s,{system:'world',operation:'establishPlace',params:{
   placeId:'fictional_family_cottage',name:'Fictional Family Cottage',
   regionId:region,kind:'family cottage',sceneType:'settlement',
   description:'A source-authored fictional household where one relative is present for a modest cleaning and sorting job.',
   culture:'Ordinary family duties and consensual household work.'}});
  s.world.location='fictional_family_cottage';
  s.chatRuntime.scene='At the fictional family cottage, '+person.name+
   ' is actually here inspecting the workbench and may independently choose to offer a household chore.';
  s.player.attributes.dex=30;s.player.skills.crafting.rank=5;
  return {s,person};
 }
 throw Error('No suitable disposable known family fixture generated');
}
const {s,person}=fixture(),original=E.exportGame(s),
 begin=s.world.minutes,coins=s.player.coins,funds=person.funds;
const purpose='Clean and sort the actual dusty family harnesses on the workbench';
for(const extra of [{payTalons:999},{accepted:true},{chosenDC:2},{minutes:5}]){
 A.throws(()=>R.act(s,{system:'social',operation:'householdWork',
  params:{npcId:person.actorId,purpose,...extra}}),/witnessed family member/);
 A.equal(E.exportGame(s),original);
}
A.throws(()=>R.act(s,{system:'social',operation:'householdWork',
 params:{npcId:person.actorId,purpose:'Tame and capture an unwilling dangerous wild beast'}}),
 /Dangerous or specialist/);
A.equal(E.exportGame(s),original);
const outcome=R.act(s,{system:'social',operation:'householdWork',
 params:{npcId:person.actorId,purpose}});
A.equal(outcome.noUnverifiedMoney,true);
A.equal(outcome.noAutomaticAgreement,true);
if(outcome.accepted)A.notEqual(s.rngState,JSON.parse(original).rngState,
 'The actual player Crafting check consumes exactly its original die');
else A.equal(s.rngState,JSON.parse(original).rngState,
 'An independent employer refusal must not roll a player die');
if(outcome.accepted){
 A.ok(outcome.check.roll>=1&&outcome.check.roll<=20);
 A.equal(outcome.check.success,true,'High saved practical skill makes this routine task reliable');
 A.equal(outcome.paidTalons,2);
 A.equal(s.player.coins,coins+2);
 A.equal(person.funds,funds-2);
 A.equal(outcome.minutes,120);
 A.equal(outcome.staminaSpent,2);
 A.equal(s.player.stamina,JSON.parse(original).player.stamina-2);
 A.equal(s.world.minutes,begin+120);
}else{
 A.equal(outcome.paidTalons,0);
 A.equal(s.player.coins,coins);
 A.equal(person.funds,funds);
 A.equal(s.world.minutes,begin+5);
}
A.equal(Kin.verify(Realm.peek(s),person),true);
const receipt=s.table.householdWork.records.at(-1);
A.equal(receipt.proof.employerFundsBefore-receipt.proof.employerFundsAfter,
 receipt.proof.playerTalonsAfter-receipt.proof.playerTalonsBefore);
A.equal(receipt.proof.actorId,person.actorId);
A.equal(R.act(s,{system:'social',operation:'householdWorkStatus',params:{}}).
 personallyWitnessedJobs.at(-1).paidTalons,outcome.paidTalons);
A.throws(()=>R.act(s,{system:'social',operation:'householdWork',
 params:{npcId:person.actorId,purpose}}),/already considered/);
{
 const {s:decline,person:relative}=fixture(701000);
 relative.fatigue=100;
 const old=decline.world.minutes,money=decline.player.coins;
 const refused=R.act(decline,{system:'social',operation:'householdWork',
  params:{npcId:relative.actorId,purpose}});
 A.equal(refused.accepted,false);
 A.equal(refused.paidTalons,0);
 A.equal(decline.world.minutes,old+5);
 A.equal(decline.player.coins,money);
 A.equal(Kin.verify(Realm.peek(decline),relative),true);
}
{
 const {s:missing,person:absent}=fixture(701100);
 missing.chatRuntime.scene='A family house without any verified present relative.';
 const snapshot=E.exportGame(missing);
 A.throws(()=>R.act(missing,{system:'social',operation:'householdWork',
  params:{npcId:absent.actorId,purpose}}),/actually witnessed/);
 A.equal(E.exportGame(missing),snapshot);
}
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-household-source-'));
try{
 const {s:unit,person:employer}=fixture(701200);
 const save=Path.join(dir,'save.json');
 FS.writeFileSync(save,E.exportGame(unit)+'\n');
 const req={id:'household_source_work_701200',mode:'rule',
  system:'social',operation:'householdWork',
  params:{npcId:employer.actorId,purpose}};
 const result=Turn.execute(save,req);
 A.equal(result.ok,true);A.equal(result.applied,true);
 const state=FS.readFileSync(save,'utf8');
 const replay=Turn.execute(save,req);
 A.equal(replay.duplicate,true);A.equal(replay.recovered,true);
 A.deepEqual(replay.output,result.output);
 A.equal(FS.readFileSync(save,'utf8'),state);
 const readOnly=Turn.execute(save,{id:'household_readonly_701200',mode:'rule',
  system:'social',operation:'householdWorkStatus',params:{}});
 A.equal(readOnly.applied,false);
 A.equal(FS.readFileSync(save,'utf8'),state);
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('Household work: genuine kin, own refusal, source-linked money conservation, work time/effort, immutable receipts and replay');
