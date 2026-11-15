'use strict';
// A family allowance after real corrected help is not a second commercial
// contract, a free reward, or permission to reroll the original failed task.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine'),R=require('../rules'),Turn=require('../scripts/chat-turn');
const New=require('../scripts/new-campaign'),Realm=require('../world/simulation');
const quote='slowly re-examined the previously sorted harnesses';
const task='Complete ordinary harness upkeep: identify unsafe stitching, sort damaged straps and refit ordinary buckles';
function setup(){
 for(let seed=869110;seed<869200;seed++){
  const s=New.create({seed,slug:'guardian_allowance_fixture',mode:'guided',
    age:10,homeRegion:'morrowfen_basin',originKind:'ordinary',
    startLocation:'crossing'}).state;
  const guardian=Realm.ensure(s).originKin?.people?.kin_1;
  if(!guardian||!/(guardian|parent)/i.test(guardian.relation))continue;
  R.act(s,{system:'world',operation:'establishPlace',params:{
   placeId:'original_family_allowance_home',name:'Guardian Family Cottage',
   kind:'family cottage',sceneType:'settlement',
   regionId:s.campaign.origin.birthRegionId,
   description:'An established, ordinary family cottage with real tools and a harness bench.',
   culture:'Household beast-handling and informal guardian allowances for honest help.'}});
  s.world.location='original_family_allowance_home';
  s.chatRuntime.scene=guardian.name+' is present at the family cottage, demonstrating ordinary harness inspection.';
  const shift=R.act(s,{system:'social',operation:'householdWork',
   params:{npcId:guardian.actorId,purpose:task}});
  if(!shift.accepted||shift.check?.success)continue;
  const before=E.exportGame(s);
  const original=s.table.householdWork.records.at(-1);
  const lost=R.act(s,{system:'discipline',operation:'practice',
   params:{system:'soul',method:'self-awareness',minutes:120,partTime:true}});
  A.equal(lost.elapsedMinutes,120);
  s.chatRuntime.scene='After genuine two-hour additional work at the family bench, the child has '+quote+
    ' while practising bodily awareness. '+guardian.name+
    ' has returned to inspect the straps and has no more work for the child.';
  return {s,guardian,shift,original,before};
 }
 throw Error('Expected an original accepted, actually failed family shift from seeded independent relative');
}
{
 const {s,guardian,shift,original}=setup();
 const before=s.player.coins,available=guardian.funds,minute=s.world.minutes,
   originalRoll=original.proof.originalCheck;
 const invalid=E.exportGame(s);
 A.throws(()=>R.act(s,{system:'social',operation:'settleGuardianAllowance',
   params:{npcId:guardian.actorId,sourceQuote:quote,amount:300}}),/original present guardian/);
 A.equal(E.exportGame(s),invalid);
 A.throws(()=>R.act(s,{system:'social',operation:'settleGuardianAllowance',
   params:{npcId:guardian.actorId,sourceQuote:'imaginary corrected harnesses without source'}}),
   /GM-witnessed correction/);
 A.equal(E.exportGame(s),invalid);
 const result=R.act(s,{system:'social',operation:'settleGuardianAllowance',
   params:{npcId:guardian.actorId,sourceQuote:quote}});
 A.equal(result.settled,true);
 A.equal(result.amountTalons,shift.promisedTalons);
 A.equal(s.player.coins,before+shift.promisedTalons);
 A.equal(guardian.funds,available-shift.promisedTalons);
 A.equal(s.world.minutes,minute);
 A.equal(s.table.householdWork.records.at(-1).hash,original.hash);
 A.deepEqual(s.table.householdWork.records.at(-1).proof.originalCheck,originalRoll,
  'A failed first inspection stays failed; no original die is rewritten');
 A.equal(s.table.householdWork.allowanceSettlements.length,1);
 A.equal(result.originalCheckNotRerolled,true);
 const settled=E.exportGame(s);
 A.throws(()=>R.act(s,{system:'social',operation:'settleGuardianAllowance',
   params:{npcId:guardian.actorId,sourceQuote:quote}}),/already settled/);
 A.equal(E.exportGame(s),settled);
}
{
 const {s,guardian}=setup();
 const snapshot=E.exportGame(s);
 s.table.independentTraining.at(-1).eventHash='tampered';
 A.throws(()=>R.act(s,{system:'social',operation:'settleGuardianAllowance',
  params:{npcId:guardian.actorId,sourceQuote:quote}}),/genuinely elapsed corrective period/);
 const restored=E.importGame(snapshot);
 restored.chatRuntime.scene='No corrective recheck happened. '+guardian.name+' is here.';
 A.throws(()=>R.act(restored,{system:'social',operation:'settleGuardianAllowance',
  params:{npcId:guardian.actorId,sourceQuote:quote}}),/GM-witnessed correction/);
}
{
 const {s,guardian}=setup(),dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'beastbound-guardian-'));
 try{
  const save=Path.join(dir,'save.json');FS.writeFileSync(save,E.exportGame(s)+'\n');
  const request={id:'guardian_allowance_original_869111',mode:'rule',system:'social',
   operation:'settleGuardianAllowance',params:{npcId:guardian.actorId,sourceQuote:quote}};
  const r=Turn.execute(save,request);
  A.equal(r.ok,true);A.equal(r.applied,true);
  A.equal(r.output.rules.amountTalons,2);
  const next=FS.readFileSync(save,'utf8');
  const replay=Turn.execute(save,request);
  A.equal(replay.duplicate,true);
  A.equal(replay.recovered,true);
  A.deepEqual(replay.output,r.output);
  A.equal(FS.readFileSync(save,'utf8'),next);
  A.throws(()=>Turn.execute(save,{...request,id:'guardian_repeated_869111'}),
   /already settled/);
  A.equal(FS.readFileSync(save,'utf8'),next);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Original guardian family allowance follows actually corrected help: conserved coins, no second dice, one settlement and exact replay');
