'use strict';
// True citizen testimony in scheduled civic sessions; optional real evidence,
// independent house interests, no fabricated noble/royal/political reward.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const Crypto=require('node:crypto'),E=require('../engine.js'),R=require('../rules'),
 W=require('../rules/world'),Realm=require('../world/simulation'),
 Hearings=require('../world/public-hearings'),Turn=require('../scripts/chat-turn.js');
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const act=(s,op,params={})=>R.act(s,{system:'social',operation:op,params});
const first=(seed=561000)=>E.newGame({seed,name:'Independent Reedmarch Resident',path:'undecided'});
const statement='The existing ferry and sanctuary routes should remain accessible to ordinary travellers, including those who cannot pay special tolls.';
function sitting(s){
 W.advance(s,3);
 const old=s.world.minutes,clock=old%1440;
 if(clock<600){E.advance(s,600-clock);W.finalizeTime(s,old);}
 A.equal(E.day(s),4);
 A.ok(s.world.minutes%1440>=600&&s.world.minutes%1440<960);
 A.equal(act(s,'hearingStatus').canAttendNow,true);
}
function fieldReady(){
 for(let i=1;i<90;i++){
  const s=first((i*2654435761)>>>0);
  A.equal(E.dispatch(s,'travel fen').ok,true);
  const survey=R.act(s,{system:'world',operation:'habitatSurvey',params:{}});
  const check=R.act(s,{system:'core',operation:'check',params:{checkId:survey.checkId}}).check;
  if(!check.success)continue;
  A.equal(E.dispatch(s,'travel crossing').ok,true);
  sitting(s);
  return {s,checkId:survey.checkId};
 }
 throw Error('No honest deterministic fen habitat observation succeeded');
}
{
 const s=first(),before=E.exportGame(s),rng=s.rngState;
 const reading=act(s,'hearingStatus');
 A.equal(reading.canAttendNow,false);
 A.equal(reading.publicSession.day,4);
 A.equal(reading.publicSession.atLocalTime,'10:00–16:00');
 A.equal(reading.publicIssues.length,3);
 A.equal(reading.publicIssues.some(x=>x.issueId==='general_business'),true);
 A.equal(reading.publicIssues.find(x=>x.issueId==='river_crossings').registeredHouseholds.length,2);
 A.equal(reading.priorTestimony.length,0);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 A.throws(()=>act(s,'hearing',{issueId:'river_crossings',testimony:statement}),/Workday 4/);
 A.throws(()=>act(s,'hearingStatus',{councilApproved:true}),/read-only and accepts no selected outcome/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=first(561001);sitting(s);
 const money=s.player.coins,mana=s.player.mana,qi=s.player.qi,
  previousRng=s.rngState,started=s.world.minutes;
 for(const params of [
  {issueId:'new_dragon_dynasty',testimony:statement},
  {issueId:'river_crossings',testimony:'too brief'},
  {issueId:'river_crossings',testimony:statement,claimAccepted:true},
  {issueId:'river_crossings',testimony:statement,checkId:'invented_report'},
 ]){
  const snapshot=E.exportGame(s),rng=s.rngState;
  A.throws(()=>act(s,'hearing',params),/only an actually published|12–1400|only an actual issueId|real successful relevant habitat field survey/i);
  A.equal(E.exportGame(s),snapshot);A.equal(s.rngState,rng);
 }
 const entered=act(s,'hearing',{issueId:'river_crossings',testimony:statement});
 A.equal(entered.heard,true);
 A.equal(entered.minutes,35);
 A.equal(entered.noFee,true);
 A.equal(entered.witnessedEvidence,false);
 A.equal(entered.noNewLaw,true);
 A.equal(entered.publicPositions.length,2);
 A.equal(entered.publicPositions[0].name,'House Fenwake');
 A.equal(entered.publicPositions[1].name,'Reedward Ferry Kin');
 A.equal(entered.citizenStatement,statement);
 A.equal(s.world.minutes,started+35);
 A.equal(s.player.coins,money);
 A.equal(s.player.mana,mana);A.equal(s.player.qi,qi);
 A.equal(s.rngState,previousRng);
 const rec=s.table.publicHearings.records[0];
 A.equal(rec.eventHash,digest(s.log[rec.eventIndex]));
 A.equal(Hearings.sourceCheck(s,rec),true);
 const out=act(s,'hearingStatus');
 A.equal(out.priorTestimony[0].status,'awaiting council review');
 A.equal(out.priorTestimony[0].councilDisposition,null);
 const saved=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'hearing',{issueId:'river_crossings',testimony:'A different valid perspective on water crossings and caretaker access.'}),
  /already received this resident/);
 A.equal(E.exportGame(s),saved);A.equal(s.rngState,rng);
 const other=act(s,'hearing',{issueId:'general_business',
  testimony:'I ask for affordable public access to local civic records without mandatory noble or merchant sponsors.'});
 A.equal(other.heard,true);
 A.equal(other.publicPositions.length,0);
 A.equal(s.table.publicHearings.records.length,2);
}
{
 const s=first(561002);sitting(s);
 const entry=act(s,'hearing',{issueId:'reedbed_access',testimony:statement});
 const original=E.exportGame(s);
 W.advance(s,9);
 const reviewed=s.table.publicHearings.records[0];
 A.equal(reviewed.state,'reviewed');
 A.equal(reviewed.reviewSource,Hearings.REVIEW);
 A.ok(['records_review','mediation_invite','defer'].includes(reviewed.disposition));
 A.equal(reviewed.householdResponses.length,2);
 A.equal(s.table.realm.publicHearingReviews.length,1);
 A.equal(s.table.realm.governance.reedmarch.publicHearingDockets.length,1);
 A.equal(s.table.realm.publicHearingReviews[0].sourceEventHash,reviewed.eventHash);
 A.equal(s.table.realm.governance.reedmarch.publicHearingDockets[0].hearingId,entry.hearingId);
 A.equal(act(s,'hearingStatus').priorTestimony[0].councilDisposition,null);
 A.equal(Realm.publicNews(s).items.some(e=>e.text?.includes('public procedural disposition')),false);
 W.advance(s,3);
 const known=act(s,'hearingStatus').priorTestimony[0];
 A.equal(known.councilDisposition,reviewed.disposition);
 A.equal(known.publicResponse,Hearings.DECISIONS[reviewed.disposition]);
 A.equal(known.writtenHouseholdReplies.length,2);
 A.ok(known.writtenHouseholdReplies.every(x=>['requests open records review',
  'urges the council to delay until the obligations are reconciled'].includes(x.response)));
 A.equal(Realm.publicNews(s).items.some(e=>e.text?.includes('public procedural disposition')),true);
 A.equal(s.player.family,null);
 A.equal(s.player.arcane.circles,0);
 A.equal(s.table?.meridianTechniques,undefined);
 A.notEqual(E.exportGame(s),original);
}
{
 const {s,checkId}=fieldReady();
 const rec=s.table.habitatSurveyFindings[checkId];
 A.equal(rec.success,true);
 const prior=s.world.minutes,bank=s.player.coins;
 const hearing=act(s,'hearing',{issueId:'reedbed_access',testimony:statement,checkId});
 A.equal(hearing.witnessedEvidence,true);
 A.equal(s.world.minutes,prior+35);
 A.equal(s.player.coins,bank);
 A.equal(s.table.publicHearings.records[0].evidence.checkId,checkId);
 A.equal(s.table.publicHearings.records[0].evidence.sceneHash,rec.observedSceneHash);
 A.equal(s.table.publicHearings.records[0].evidence.rollHash,rec.rollEventHash);
 W.advance(s,11);
 A.equal(s.table.publicHearings.records[0].state,'reviewed');
 A.equal(s.table.publicHearings.records[0].evidence.checkId,checkId);
 A.equal(s.table.realm.publicHearingReviews.length,1);
 A.equal(s.table.sceneChecks[checkId].used,true);
}
{
 const {s,checkId}=fieldReady();
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'hearing',{issueId:'general_business',testimony:statement,checkId}),
  /An unrelated survey cannot be presented/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 s.table.habitatSurveyFindings[checkId].rollEventHash='fake';
 const forged=E.exportGame(s);
 A.throws(()=>act(s,'hearing',{issueId:'river_crossings',testimony:statement,checkId}),
  /cannot be reconstructed/);
 A.equal(E.exportGame(s),forged);
}
{
 const s=first(561003);sitting(s);
 const h=act(s,'hearing',{issueId:'river_crossings',testimony:statement});
 const record=s.table.publicHearings.records[0];
 record.testimony='I secretly know all noble conspiracies are true.';
 W.advance(s,10);
 A.equal(s.table.publicHearings.records[0].state,'submitted');
 A.equal(s.table.realm.publicHearingReviews?.length||0,0);
 A.equal(s.table.realm.governance.reedmarch.publicHearingDockets?.length||0,0);
 A.equal(s.player.family,null);
 A.equal(h.noGuaranteedFinding,true);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-public-hearing-'));
 try{
  const s=first(561004);sitting(s);
  const file=Path.join(dir,'person.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const original=FS.readFileSync(file,'utf8');
  const read=Turn.execute(file,{id:'civic_hearing_read_00001',mode:'rule',
   system:'social',operation:'hearingStatus',params:{}});
  A.equal(read.applied,false);
  A.equal(read.output.rules.canAttendNow,true);
  A.equal(FS.readFileSync(file,'utf8'),original);
  const malformed={id:'civic_hearing_cheat_00001',mode:'rule',system:'social',
   operation:'hearing',params:{issueId:'river_crossings',testimony:statement,approval:true}};
  A.throws(()=>Turn.execute(file,malformed),/only an actual issueId/);
  A.equal(FS.readFileSync(file,'utf8'),original);
  const actReq={id:'civic_hearing_real_00001',mode:'rule',
   system:'social',operation:'hearing',params:{issueId:'general_business',testimony:statement}};
  const result=Turn.execute(file,actReq);
  A.equal(result.applied,true);
  A.equal(result.output.rules.heard,true);
  A.equal(Turn.execute(file,actReq).duplicate,true);
  const imported=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(imported.table.publicHearings.records.length,1);
  A.equal(imported.world.minutes,s.world.minutes+35);
  A.equal(imported.player.coins,s.player.coins);
  A.equal(imported.table.publicHearings.records[0].testimony,statement);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Open public council hearings: arbitrary citizen testimony, authentic Fen observations, two independent written clan interests, timed procedures and no invented laws');
