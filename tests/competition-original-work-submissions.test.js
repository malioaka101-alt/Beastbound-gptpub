'use strict';
// Every state and file here is disposable; real campaign saves stay untouched.
// An authentic report or manufactured item does not become an event result.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 Core=require('../rules/core'),Turn=require('../scripts/chat-turn.js'),
 Habitat=require('../rules/habitat-survey'),
 Production=require('../rules/physical-production-ledger');
const fresh=seed=>E.newGame({name:'Original Competition Work Test',seed,
 background:'fieldworker',path:'undecided'});
const act=(s,op,params={})=>R.act(s,{system:'competition',operation:op,params});
const event=(id,override={})=>({
 eventId:id,title:'Independent Seasonal Work Forum',
 description:'People share original ecological observations, physical construction and practical accomplishments.',
 criteria:'Witnessed work may be discussed, with suitability determined by the announced local tradition.',
 eligibility:'Public interest does not establish admission, competency or professional licences.',
 judging:'Any later judgment needs a separate actual capable judge and original source-specific criteria.',
 appeals:'Future objections depend on the actual local organiser and no invented universal appeal route.',
 prizeTerms:'These statements do not certify any deposited prize money or payment obligation.',
 season:'Local seasonal fieldwork and craft exchange',
 eventDay:2,startsAtMinuteOfDay:13*60,...override
});
function report(s){
 A.equal(E.dispatch(s,'travel forest').ok,true);
 const staged=R.act(s,{system:'world',operation:'habitatSurvey',params:{}});
 const resolved=R.act(s,{system:'core',operation:'check',params:{checkId:staged.checkId}}).check;
 A.equal(E.dispatch(s,'travel crossing').ok,true);
 return {checkId:staged.checkId,result:resolved};
}
function claims(s){return JSON.stringify({
 coins:s.player.coins,rankings:s.player.rankings,
 qualifications:s.player.qualifications,record:s.player.competitionRecord,
 guild:s.player.reputation.guild,inventory:s.player.inventory});}
{
 const s=fresh(951401),rng=s.rngState,before=E.exportGame(s);
 A.throws(()=>act(s,'submitWork',{eventId:'unknown',sourceOwner:'habitat-survey',
  sourceId:'habitat_forest_00000'}),/real already published/);
 A.equal(E.exportGame(s),before);
 const notice=act(s,'announceLocal',event('unlike_public_work_01'));
 A.equal(notice.observed,true);
 A.throws(()=>act(s,'submitWork',{eventId:notice.eventId,
   sourceOwner:'physical-production',sourceId:'production_fake'}),
   /original willing person/);
 const interest=act(s,'expressInterest',{eventId:notice.eventId});
 A.equal(interest.interested,true);
 const beforeWork=E.exportGame(s);
 A.throws(()=>act(s,'submitWork',{eventId:notice.eventId,
  sourceOwner:'claimed-legendary-victory',sourceId:'invented'}),
  /real source owner/);
 A.throws(()=>act(s,'submitWork',{eventId:notice.eventId,
  sourceOwner:'physical-production',sourceId:'invented'}),
  /previously completed physical work receipt/);
 A.equal(E.exportGame(s),beforeWork);
 A.equal(s.rngState,rng);
 const performed=R.act(s,{system:'craft',operation:'fieldPoultice',params:{}});
 A.equal(performed.noExtraRoll,true);
 A.equal(Production.verify(s),true);
 const physical=s.table.physicalProductionHistory.at(-1);
 A.ok(physical.id.startsWith('production_'));
 const frozenClaims=claims(s),afterWorkRng=s.rngState;
 const originalMinute=s.world.minutes;
 const offered=act(s,'submitWork',{eventId:notice.eventId,
  sourceOwner:'physical-production',sourceId:physical.id});
 A.equal(offered.offered,true);
 A.equal(offered.originalOutcome,physical.source.originalOutcome);
 A.equal(offered.preannouncedWork,true);
 A.equal(offered.notAcceptedOrJudged,true);
 A.equal(offered.noSecondPerformanceRoll,true);
 A.equal(s.world.minutes,originalMinute+5);
 A.equal(s.rngState,afterWorkRng);
 A.equal(claims(s),frozenClaims,'no purse, inventory, qualification or rating changes');
 const entry=s.table.competitionNotices.public_competition_unlike_public_work_01;
 A.equal(entry.submissions.length,1);
 A.equal(entry.submissions[0].source.originalWork.originalResultHash,physical.sourceHash);
 const view=act(s,'publicEvents');
 A.equal(view.events[0].playerOfferedWork.length,1);
 A.equal(view.events[0].noJudgedResults,true);
 A.equal(view.events[0].noCreditedRankOrRewards,true);
 const copied=E.exportGame(s);
 A.equal(act(E.importGame(copied),'publicEvents').events[0].playerOfferedWork.length,1);
 A.throws(()=>act(s,'submitWork',{eventId:notice.eventId,
  sourceOwner:'physical-production',sourceId:physical.id}),
  /already been offered/);
 A.equal(E.exportGame(s),copied);
 A.equal(s.rngState,afterWorkRng);
 const originalSource=structuredClone(entry.submissions[0]);
 entry.submissions[0].source.originalWork.originalOutcome='prize-worthy';
 const corrupt=E.exportGame(s);
 A.throws(()=>act(s,'publicEvents'),/lost their original source/);
 A.equal(E.exportGame(s),corrupt);
 entry.submissions[0]=originalSource;
 A.equal(E.exportGame(s),copied);
 const originalMaterial=physical.source.materialsUsed.marsh_reed;
 physical.source.materialsUsed.marsh_reed+=5;
 A.throws(()=>act(s,'publicEvents'),/lost their original source/);
 physical.source.materialsUsed.marsh_reed=originalMaterial;
 A.equal(E.exportGame(s),copied);
 for(let i=0;i<100;i++)Core.event(s,'world','Unrelated public scene history entry '+i,{i});
 A.equal(s.log.length,90);
 A.equal(act(E.importGame(E.exportGame(s)),'publicEvents').events[0].playerOfferedWork.length,1);
}
{
 const s=fresh(951402);
 const announced=act(s,'announceLocal',event('field_traces_forum_02',{
  title:'Forest Signs Presentation',
  description:'Residents listen to actual wetland or forest signs rather than claimed unseen species.',
  criteria:'Speakers present their original witnessed local field reports without assuming a monster identity.',
  season:'Regional ecological observations early-season'}));
 act(s,'expressInterest',{eventId:announced.eventId});
 const {checkId,result}=report(s);
 A.ok(typeof result.roll==='number');
 const originalProof=Habitat.historical(s,checkId);
 A.equal(originalProof.checkId,checkId);
 A.throws(()=>Habitat.interpreted(s,checkId,{habitat:'forest'}),
  /only a personally witnessed actual current local habitat/);
 const before=claims(s),priorRng=s.rngState;
 const submitted=act(s,'submitWork',{eventId:announced.eventId,
  sourceOwner:'habitat-survey',sourceId:checkId});
 A.equal(submitted.offered,true);
 A.equal(submitted.originalOutcome,result.margin>=0?'interpreted':'unresolved-traces');
 A.equal(submitted.preannouncedWork,true);
 A.equal(claims(s),before);A.equal(s.rngState,priorRng);
 const read=act(s,'publicEvents',{eventId:announced.eventId});
 A.equal(read.events[0].playerOfferedWork[0].sourceId,checkId);
 A.equal(read.events[0].noConfirmedEntrants,true);
 const frozen=E.exportGame(s),records=s.table.competitionNotices.public_competition_field_traces_forum_02.submissions;
 records[0].source.originalWork.originalResultHash='0'.repeat(64);
 const changed=E.exportGame(s);
 A.throws(()=>act(s,'publicEvents'),/lost their original source/);
 A.equal(E.exportGame(s),changed);
 records[0].source.originalWork.originalResultHash=originalProof.rollHash;
 A.equal(E.exportGame(s),frozen);
}
{
 // Original work that predates the GM announcement is honest portfolio
 // evidence, but cannot be misrepresented as preannounced competition work.
 const s=fresh(951403);
 const worked=R.act(s,{system:'craft',operation:'fieldPoultice',params:{}});
 A.ok(worked.noExtraRoll);
 const row=s.table.physicalProductionHistory[0],time=row.source.finishMinute;
 const eventId='retrospective_craft_03';
 act(s,'announceLocal',event(eventId,{
  title:'Historical Artisans Exhibition',
  description:'Craft guild members publicly discuss earlier documented efforts without promising new titles.',
  criteria:'Older works can be discussed, but published competition conditions never apply retroactively.',
  season:'Local reflective artisans session'}));
 act(s,'expressInterest',{eventId});
 const viewed=act(s,'submitWork',{eventId,
  sourceOwner:'physical-production',sourceId:row.id});
 A.equal(viewed.offered,true);A.equal(viewed.preannouncedWork,false);
 const record=s.table.competitionNotices.public_competition_retrospective_craft_03.submissions[0];
 A.equal(record.source.originalWork.completedAtMinute,time);
 A.equal(act(s,'publicEvents').events[0].noJudgedResults,true);
}
{
 // Chat turns use the existing immutable IDs and real saved original work.
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-work-evidence-'));
 try{
  const file=Path.join(dir,'save.json'),s=fresh(951404);
  const id='work_evidence_replay_04';
  act(s,'announceLocal',event(id));
  act(s,'expressInterest',{eventId:id});
  R.act(s,{system:'craft',operation:'fieldPoultice',params:{}});
  const evidenceId=s.table.physicalProductionHistory[0].id;
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const req={id:'competition_verified_work_951404',mode:'rule',
   system:'competition',operation:'submitWork',
   params:{eventId:id,sourceOwner:'physical-production',sourceId:evidenceId}};
  const response=Turn.execute(file,req);
  A.equal(response.applied,true);
  A.equal(response.output.rules.noSecondPerformanceRoll,true);
  A.equal(Turn.execute(file,req).duplicate,true);
  const final=FS.readFileSync(file,'utf8');
  const view=Turn.execute(file,{id:'competition_work_view_951404',
   mode:'rule',system:'competition',operation:'publicEvents',params:{eventId:id}});
  A.equal(view.applied,false);
  A.equal(view.output.rules.events[0].playerOfferedWork.length,1);
  A.equal(FS.readFileSync(file,'utf8'),final);
  A.throws(()=>Turn.execute(file,{...req,id:'competition_repeat_work_951404'}),
   /already been offered/);
  A.equal(FS.readFileSync(file,'utf8'),final);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Two genuinely unlike historical source owners provide original performance evidence to GM-authored public competitions with no arbitrary judging, second roll, duplicate work, earned rank, unfinanced prize or coerced entry');
