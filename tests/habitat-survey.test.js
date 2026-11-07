'use strict';
// Every file here is disposable. Never author sightings, checks or resources
// in a real campaign checkpoint to make these assertions pass.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
function fresh(seed=312901){
 const s=E.newGame({name:'Habitat Field Survey',seed,path:'undecided'});
 const travel=E.dispatch(s,'travel fen');
 A.equal(travel.ok,true);
 A.equal(s.world.location,'fen');
 return s;
}
const prep=(s,params={})=>R.act(s,{system:'world',operation:'habitatSurvey',params});
const inspect=s=>R.act(s,{system:'world',operation:'habitatSurveyStatus',params:{}});
const solve=(s,id)=>R.act(s,{system:'core',operation:'check',params:{checkId:id}}).check;
{
 const s=E.newGame({name:'Settlement Survey Refusal',seed:312902});
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>prep(s),/Only a recorded open natural habitat/);
 A.throws(()=>prep(s,{dc:2,extra:10,rareBeast:'dragon'}),
  /accepts no caller-selected DC/);
 A.deepEqual(inspect(s),{surveyable:false,pending:[]});
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=fresh(),before=E.exportGame(s),rng=s.rngState;
 for(const p of [{minutes:1},{dc:2},{species:'dreamreed'},{source:'I know the answer'}])
  A.throws(()=>prep(s,p),/accepts no caller-selected DC/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 s.encounter={beastId:'unresolved'};
 A.throws(()=>prep(s),/Finish or leave the active encounter/);
 s.encounter=null;
 s.player.stamina=2;
 A.throws(()=>prep(s),/Insufficient real stamina/);
 s.player.stamina=E.importGame(before).player.stamina;
 s.player.health=30;
 A.throws(()=>prep(s),/Injured or incapacitated/);
 s.player.health=s.player.maxHealth;
 A.equal(E.exportGame(s),before);
 const minute=s.world.minutes,stamina=s.player.stamina;
 const r=prep(s);
 A.equal(r.prepared,true);A.match(r.checkId,/^habitat_fen_[0-9]{5}$/);
 A.equal(r.elapsedMinutes,20);A.equal(r.staminaSpent,2);
 A.equal(s.world.minutes,minute+20);A.equal(s.player.stamina,stamina-2);
 A.equal(s.rngState,rng); // Preparing witness never rolls or picks a result
 A.deepEqual(Object.keys(s.beasts),[]);
 A.equal(s.sightings.length,0);
 A.equal(s.player.inventory.ripening_fruit,undefined);
 A.equal(s.player.inventory.moss_crystal,undefined);
 A.equal(s.player.skills.survival.rank,E.importGame(before).player.skills.survival.rank);
 const a=s.table.sceneChecks[r.checkId];
 A.equal(a.origin,'engine-habitat-survey');A.equal(a.dc,12);
 A.equal(a.attribute,'wis');A.equal(a.skill,'survival');
 A.equal(a.worldMinute,s.world.minutes);
 A.equal(a.extra,0);A.equal(a.minutes,15);
 const known=inspect(s);
 A.equal(known.surveyable,true);
 A.equal(known.preparedToday,true);
 A.equal(known.pending[0].checkId,r.checkId);
 const after=E.exportGame(s);
 A.throws(()=>prep(s),/already prepared here this in-world day/);
 A.equal(E.exportGame(s),after);A.equal(s.rngState,rng);
}
{
 const s=fresh(312903);
 const r=prep(s),before=E.exportGame(s),rng=s.rngState;
 const a=s.table.sceneChecks[r.checkId];
 const priorHash=a.eventHash;
 a.extra=5; // Forging the saved skill check no longer changes biome odds
 A.throws(()=>solve(s,r.checkId),/not consistent with its witnessed local environment/);
 A.equal(s.rngState,rng);
 a.extra=0;
 a.eventHash='falsified';
 A.throws(()=>solve(s,r.checkId),/archived original habitat observation was altered|one-use, correctly bound prior scene witness/);
 a.eventHash=priorHash;
 const preRoll=s.world.minutes,rank=s.player.skills.survival.rank,score=s.player.attributes.wis;
 const rolled=solve(s,r.checkId);
 A.equal(rolled.verifiedSceneCheck,r.checkId);
 A.ok(rolled.roll>=1&&rolled.roll<=20);
 A.equal(rolled.modifier,Math.floor((score-10)/2)+2*rank);
 A.equal(rolled.dc,12);A.equal(rolled.elapsedMinutes,15);
 A.equal(s.world.minutes,preRoll+15);
 A.equal(s.table.habitatSurveyFindings[r.checkId].success,rolled.success);
 A.equal(s.table.habitatSurveyFindings[r.checkId].degree,rolled.degree);
 A.equal(s.table.habitatSurveyFindings[r.checkId].location,'fen');
 A.equal(s.table.habitatSurveyFindings[r.checkId].observedSceneHash,priorHash);
 A.equal(s.sightings.length,0);A.deepEqual(Object.keys(s.beasts),[]);
 A.equal(s.player.inventory.moss_crystal,undefined);
 const final=E.exportGame(s),state=s.rngState;
 A.throws(()=>solve(s,r.checkId),/precommitted witnessed challenge/);
 A.equal(E.exportGame(s),final);A.equal(s.rngState,state);
 A.deepEqual(inspect(s).pending,[]);
 A.throws(()=>prep(s),/already prepared here this in-world day/);
 A.notEqual(E.exportGame(s),before);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-field-survey-'));
 try{
  const file=Path.join(dir,'save.json'),s=fresh(312904);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const saved=FS.readFileSync(file,'utf8');
  const unsupported={id:'survey_cheat_0001',mode:'rule',system:'world',
   operation:'habitatSurvey',params:{dc:2,source:'Already understood'}};
  A.throws(()=>Turn.execute(file,unsupported),/accepts no caller-selected DC/);
  A.equal(FS.readFileSync(file,'utf8'),saved);
  const req={id:'survey_prepare_0001',mode:'rule',system:'world',
   operation:'habitatSurvey',params:{}};
  const ready=Turn.execute(file,req);
  A.equal(ready.applied,true);
  A.equal(ready.output.rules.prepared,true);
  A.equal(Turn.execute(file,req).duplicate,true);
  let state=E.importGame(FS.readFileSync(file,'utf8'));
  const checkId=ready.output.rules.checkId;
  const statusBefore=FS.readFileSync(file,'utf8');
  const inspectTurn=Turn.execute(file,{id:'survey_view_0001',mode:'rule',system:'world',
   operation:'habitatSurveyStatus',params:{}});
  A.equal(inspectTurn.applied,false);
  A.equal(inspectTurn.output.rules.pending[0].checkId,checkId);
  A.equal(FS.readFileSync(file,'utf8'),statusBefore);
  const actual={id:'survey_check_0001',mode:'check',checkId};
  const result=Turn.execute(file,actual);
  A.equal(result.applied,true);
  A.equal(result.output.check.verifiedSceneCheck,checkId);
  A.equal(Turn.execute(file,actual).duplicate,true);
  state=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(state.table.sceneChecks[checkId].used,true);
  A.equal(state.table.habitatSurveyFindings[checkId].observedSceneHash,
   state.table.sceneChecks[checkId].eventHash);
  A.equal(state.sightings.length,0);
  const final=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{...actual,id:'survey_reroll_0002'}),
   /precommitted witnessed challenge/);
  A.equal(FS.readFileSync(file,'utf8'),final);
  A.throws(()=>Turn.execute(file,{...req,id:'survey_reprepare_0002'}),
   /already prepared here this in-world day/);
  A.equal(FS.readFileSync(file,'utf8'),final);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}

// Master Prompt §47: actual public institution + changing ecology + recorded
// source event + one existing field check; no invented wages, rank or second roll.
const opportunity=(s,operation,params={})=>
 R.act(s,{system:'opportunity',operation,params});
{
 const s=E.newGame({name:'World Opportunity Study',seed:785311}),
  initial=E.exportGame(s),rng=s.rngState;
 A.deepEqual(opportunity(s,'status').knownNotices,[]);
 A.equal(E.exportGame(s),initial);A.equal(s.rngState,rng);
 A.throws(()=>opportunity(s,'board',{reward:10000}),/exactly the real witnessed notice/);
 A.throws(()=>opportunity(s,'interest',{noticeId:'field_forest_0',choice:'follow'}),
  /authentic personally witnessed/);
 A.throws(()=>opportunity(s,'file',{noticeId:'field_forest_0',checkId:'habitat_forest_0'}),
  /authentic personally witnessed/);
 A.equal(E.exportGame(s),initial);A.equal(s.rngState,rng);
 const view=opportunity(s,'board');
 A.equal(view.read,true);
 A.equal(view.minutes,5);A.equal(view.newNotices,2);
 A.deepEqual(view.knownNotices.map(x=>x.habitat).sort(),['fen','forest']);
 A.ok(view.knownNotices.every(x=>x.issuer==='Naturalists Guild'));
 A.ok(view.knownNotices.every(x=>x.reward.includes('No promised currency')));
 A.equal(s.player.coins,85);
 A.equal(s.rngState,rng,'An official public notice is not a player dice roll');
 const local=opportunity(s,'status').knownNotices;
 A.equal(local.length,2);
 const n=local.find(x=>x.habitat==='forest');
 A.equal(n.noticeId,'field_forest_0');
 A.equal(n.state,'unmarked');
 const mark=opportunity(s,'interest',{noticeId:n.noticeId,choice:'follow'});
 A.equal(mark.interest,'following');
 A.equal(opportunity(s,'status').knownNotices.find(x=>x.noticeId===n.noticeId).state,'following');
 A.equal(s.player.coins,85);
 const again=opportunity(s,'board');
 A.equal(again.newNotices,0);
 A.equal(opportunity(s,'status').knownNotices.length,2);
 A.equal(s.rngState,rng);
 const snapshot=E.exportGame(s),frozen=s.rngState;
 A.throws(()=>opportunity(s,'interest',{noticeId:n.noticeId,choice:'compel'}),
  /can be followed, ignored or released/);
 A.equal(E.exportGame(s),snapshot);A.equal(s.rngState,frozen);
 A.equal(E.dispatch(s,'travel forest').ok,true);
 const forestSaved=E.exportGame(s);
 A.throws(()=>opportunity(s,'board'),/at Morrowfen Crossing/);
 A.equal(E.exportGame(s),forestSaved);
 const ready=prep(s),out=solve(s,ready.checkId);
 A.equal(out.verifiedSceneCheck,ready.checkId);
 const rolled=s.rngState;
 const cannot=E.exportGame(s);
 A.throws(()=>opportunity(s,'file',{noticeId:n.noticeId,checkId:ready.checkId}),
  /at Morrowfen Crossing/);
 A.equal(E.exportGame(s),cannot);A.equal(s.rngState,rolled);
 A.equal(E.dispatch(s,'travel crossing').ok,true);
 const filed=opportunity(s,'file',{noticeId:n.noticeId,checkId:ready.checkId});
 A.equal(filed.filed,true);A.equal(filed.originalRoll,out.roll);
 A.ok(['interpreted','inconclusive'].includes(filed.result));
 A.equal(filed.noSecondRoll,true);
 A.equal(s.player.coins,85,'A field report must not mint a payerless Talon reward');
 A.equal(opportunity(s,'status').knownNotices.find(x=>x.noticeId===n.noticeId).state,'filed');
 const receipt=s.table.publicFieldNotices.notices[n.noticeId].submitted;
 A.equal(receipt.checkId,ready.checkId);
 A.equal(receipt.source.originalRoll,out.roll);
 const closed=E.exportGame(s),finalRng=s.rngState;
 A.throws(()=>opportunity(s,'file',{noticeId:n.noticeId,checkId:ready.checkId}),
  /already been filed/);
 A.equal(E.exportGame(s),closed);A.equal(s.rngState,finalRng);
 const reloaded=E.importGame(closed);
 A.deepEqual(opportunity(reloaded,'status'),opportunity(s,'status'));
}
{
 const s=E.newGame({name:'Authentic Notice Tamper Check',seed:785312});
 const issue=opportunity(s,'board').knownNotices.find(x=>x.habitat==='fen');
 const notice=s.table.publicFieldNotices.notices[issue.noticeId];
 notice.compensation='10000 Talons promised';
 const saved=E.exportGame(s),rng=s.rngState;
 A.throws(()=>opportunity(s,'interest',{noticeId:issue.noticeId,choice:'follow'}),
  /terms have been altered/);
 A.equal(E.exportGame(s),saved);A.equal(s.rngState,rng);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-source-opportunities-'));
 try{
  const file=Path.join(dir,'save.json'),
   s=E.newGame({name:'Notice Replay',seed:785313});
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const first={id:'field_notices_0001',mode:'act',action:'quest board'};
  const read=Turn.execute(file,first);
  A.equal(read.applied,true);
  A.equal(read.output.opportunity.knownNotices.length,2);
  A.equal(Turn.execute(file,first).duplicate,true);
  const checkpoint=FS.readFileSync(file,'utf8');
  const known=Turn.execute(file,{id:'field_status_0001',mode:'rule',
   system:'opportunity',operation:'status',params:{}});
  A.equal(known.applied,false);
  A.equal(known.output.rules.knownNotices.length,2);
  A.equal(FS.readFileSync(file,'utf8'),checkpoint);
  const follow={id:'field_follow_0001',mode:'act',
   action:'follow field notice field_fen_0'};
  const tracked=Turn.execute(file,follow);
  A.equal(tracked.applied,true);
  A.equal(tracked.output.opportunity.interest,'following');
  A.equal(Turn.execute(file,follow).duplicate,true);
  const saved=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{id:'field_forged_0001',mode:'rule',
   system:'opportunity',operation:'file',params:{
    noticeId:'field_fen_0',checkId:'habitat_fen_0',reward:5000}}),
   /exactly the real witnessed notice/);
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}


// Time moves independently: an ignored public posting expires, while a
// later period's real local conditions can generate a different notice.
{
 const s=E.newGame({name:'World Moves Without Player',seed:785314});
 const listing=opportunity(s,'board'),id=listing.knownNotices[0].noticeId;
 const started=s.world.minutes;
 R.world.advance(s,6);
 A.equal(s.world.minutes,started+6*1440);
 A.equal(opportunity(s,'status').knownNotices.find(x=>x.noticeId===id).state,'expired');
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>opportunity(s,'interest',{noticeId:id,choice:'follow'}),
  /reached its deadline/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const future=opportunity(s,'board');
 A.equal(future.newNotices,2);
 A.equal(future.knownNotices.length,4);
 A.ok(future.knownNotices.some(n=>n.noticeId==='field_forest_6'));
}
{
 const s=E.newGame({name:'Archived Notice Witness',seed:785315});
 const listing=opportunity(s,'board'),id=listing.knownNotices[0].noticeId;
 // The engine's rolling narrative log is allowed to trim old lines; the
 // witness sealed on the bulletin keeps the public terms independently.
 const C=R.core;
 for(let k=0;k<99;k++)C.event(s,'story','Ordinary unrelated witnessed activity '+k);
 A.equal(s.log.some(e=>e.details?.noticeId===id),false);
 const before=E.exportGame(s),rng=s.rngState;
 A.equal(opportunity(s,'status').knownNotices.length,2);
 const follow=opportunity(s,'interest',{noticeId:id,choice:'follow'});
 A.equal(follow.interest,'following');
 A.equal(s.rngState,rng);
 A.notEqual(E.exportGame(s),before);
}


// Master Prompt §§5/11/44/47: the guild independently issues a notice
// from actually simulated ecology. Looking at the board only learns it.
{
 const s=E.newGame({name:'Independent Guild Bulletin',seed:785320});
 const origin=E.exportGame(s),rng=s.rngState;
 const w=R.world.realm.peek(s),Field=require('../world/guild-fieldwork');
 const issues=Field.current(w,0);
 A.equal(issues.length,2);
 A.deepEqual(issues.map(x=>x.habitat).sort(),['fen','forest']);
 A.equal(issues[0].origin,Field.ORIGIN);
 A.ok(issues.every(x=>x.issueDay===0&&x.deadlineDay===5&&
   x.worldIssueHash.length===64));
 A.equal(issues.find(x=>x.region==='copperwood').ecologicalSnapshot.quality,
   w.ecosystems.copperwood.quality);
 A.equal(opportunity(s,'status').knownNotices.length,0,
   'Unseen guild notices are not player-known just because the world published them');
 A.equal(E.exportGame(s),origin);A.equal(s.rngState,rng);
 // The simulation's *persistent* offscreen guild ledger is now inspected.
 R.world.realm.ensure(s);
 const personallySeen=opportunity(s,'board').knownNotices;
 A.equal(personallySeen.length,2);
 A.equal(personallySeen[0].state,'unmarked');
 const n=s.table.publicFieldNotices.notices[personallySeen[0].noticeId];
 A.equal(n.worldIssueHash,issues.find(x=>x.id===n.id).worldIssueHash);
 A.equal(n.termsHash.length,64);
 const before=E.exportGame(s),afterRng=s.rngState;
 const worldHistory=R.world.realm.peek(s).fieldworkNotices;
 const altered=structuredClone(worldHistory[n.id]);
 worldHistory[n.id].condition='fabricated condition chosen by reader';
 A.throws(()=>opportunity(s,'interest',{noticeId:n.id,choice:'follow'}),
   /independently issued guild bulletin was altered/);
 A.equal(s.rngState,afterRng);
 A.notEqual(E.exportGame(s),before);
 worldHistory[n.id]=altered;
 const followed=opportunity(s,'interest',{noticeId:n.id,choice:'follow'});
 A.equal(followed.interest,'following');
}
{
 const s=E.newGame({name:'Offscreen Guild Renewal',seed:785321});
 const base=R.world.realm.peek(s),Field=require('../world/guild-fieldwork');
 const first=Field.current(base,0);
 A.equal(first.length,2);
 A.equal(opportunity(s,'status').knownNotices.length,0);
 R.world.advance(s,6);
 const tickRng=s.rngState;
 const after=R.world.realm.peek(s),newIssues=Field.current(after,6);
 A.equal(newIssues.length,2);
 A.ok(newIssues.every(x=>x.issueDay===6&&x.deadlineDay===11));
 A.ok(newIssues.every(x=>x.worldIssueHash.length===64));
 A.ok(newIssues.some(x=>x.id==='field_forest_6'));
 A.equal(after.fieldworkNotices.field_forest_0.worldIssueHash,
   base.fieldworkNotices.field_forest_0.worldIssueHash);
 A.equal(opportunity(s,'status').knownNotices.length,0,
  'Offscreen ecological and guild publishing do not create player knowledge');
 A.ok(newIssues.every(x=>x.ecologicalSnapshot.quality===
   after.ecosystems[x.region].quality));
 A.equal(opportunity(s,'board').knownNotices.length,2);
 A.equal(s.rngState,tickRng,
  'Reading independently published notices cannot roll the player dice');
}
{
 const s=E.newGame({name:'Durable Field Report Witnesses',seed:785322});
 const n=opportunity(s,'board').knownNotices.find(x=>x.habitat==='forest');
 A.ok(n);
 A.equal(E.dispatch(s,'travel forest').ok,true);
 const prepared=prep(s);
 const a=s.table.sceneChecks[prepared.checkId];
 A.equal(a.observationEvent.details.checkId,prepared.checkId);
 for(let i=0;i<105;i++)
  R.core.event(s,'story','Unrelated ordinary field conversation '+i);
 A.equal(s.log.some(e=>e.details?.checkId===prepared.checkId),false);
 A.equal(inspect(s).pending[0].checkId,prepared.checkId,
  'Previously witnessed pending survey remains visible after old narration rotates');
 const resolved=solve(s,prepared.checkId);
 A.equal(resolved.verifiedSceneCheck,prepared.checkId);
 A.equal(s.table.habitatSurveyFindings[prepared.checkId].rollEvent.details.roll,
  resolved.roll);
 for(let i=0;i<105;i++)
  R.core.event(s,'story','Subsequent actual work and conversations '+i);
 A.equal(s.log.some(e=>e.details?.checkId===prepared.checkId),false);
 A.equal(E.dispatch(s,'travel crossing').ok,true);
 const before=s.world.minutes,frozen=s.rngState;
 const filed=opportunity(s,'file',{noticeId:n.noticeId,checkId:prepared.checkId});
 A.equal(filed.filed,true);
 A.equal(filed.originalRoll,resolved.roll);
 A.equal(s.world.minutes,before+10);
 A.equal(s.rngState,frozen,'The original genuine field check is filed without another roll');
 A.equal(opportunity(s,'status').knownNotices.find(x=>x.noticeId===n.noticeId).state,'filed');
 A.equal(filed.guildInboxReceived,true);
 const inbox=R.world.realm.peek(s).fieldworkInbox.reports;
 A.equal(inbox[prepared.checkId].result,
   resolved.success?'interpreted':'inconclusive');
 A.equal(inbox[prepared.checkId].decision,'awaiting-independent-review');
 const money=s.player.coins;
 R.world.advance(s,6);
 const reviewed=R.world.realm.peek(s).fieldworkInbox.reports[prepared.checkId];
 A.equal(reviewed.reviewedDay,6);
 A.ok(['field-inspection-authorised','reviewed-without-field-inspection'].includes(reviewed.decision));
 A.equal(s.player.coins,money,
  'The guild decision cannot invent cash payments for the player');
 A.equal(opportunity(s,'status').knownNotices.find(x=>x.noticeId===n.noticeId).state,'filed');
 const archived=E.importGame(E.exportGame(s));
 A.equal(archived.table.publicFieldNotices.notices[n.noticeId].submitted.source.originalRoll,
  resolved.roll);
}
{
 const s=E.newGame({name:'Tamper-Proof Archived Field Evidence',seed:785323});
 const n=opportunity(s,'board').knownNotices.find(x=>x.habitat==='fen');
 A.equal(E.dispatch(s,'travel fen').ok,true);
 const prepared=prep(s),id=prepared.checkId;
 const done=solve(s,id);
 for(let i=0;i<105;i++)R.core.event(s,'story','Ordinary scene record '+i);
 A.equal(E.dispatch(s,'travel crossing').ok,true);
 const forgedRoll=s.table.habitatSurveyFindings[id].rollEvent.details;
 forgedRoll.roll=forgedRoll.roll===20?19:20;
 const frozen=E.exportGame(s),rng=s.rngState;
 A.throws(()=>opportunity(s,'file',{noticeId:n.noticeId,checkId:id}),
  /archived field evidence has been altered/);
 A.equal(E.exportGame(s),frozen);A.equal(s.rngState,rng);
 A.equal(s.table.publicFieldNotices.notices[n.noticeId].submitted,null);
}


// The institution can inspect information only after the actual filing,
// on its own independent world clock. A tampered received roll does not
// become staff authority, publication, money or a second player check.
{
 const Field=require('../world/guild-fieldwork'),s=E.newGame({seed:785324,
  name:'Independent Received Report Safeguard'});
 const n=opportunity(s,'board').knownNotices.find(x=>x.habitat==='fen');
 A.equal(E.dispatch(s,'travel fen').ok,true);
 const ready=prep(s),r=solve(s,ready.checkId);
 A.equal(E.dispatch(s,'travel crossing').ok,true);
 const file=opportunity(s,'file',{noticeId:n.noticeId,checkId:ready.checkId});
 A.equal(file.originalRoll,r.roll);
 const world=structuredClone(R.world.realm.peek(s));
 const received=world.fieldworkInbox.reports[ready.checkId];
 received.result=received.result==='interpreted'?'inconclusive':'interpreted';
 const stamp=E.exportGame(s),rng=s.rngState;
 A.throws(()=>Field.review(world,6),/original authenticated received report/);
 A.equal(E.exportGame(s),stamp);A.equal(s.rngState,rng);
}


// Invalid guild inbox state is rejected *before* filing takes time or
// mutates the original source-backed player observation.
{
 const s=E.newGame({seed:785325,name:'Guild Receipt Collision Preflight'});
 const n=opportunity(s,'board').knownNotices.find(x=>x.habitat==='forest');
 A.equal(E.dispatch(s,'travel forest').ok,true);
 const prepared=prep(s),resolved=solve(s,prepared.checkId);
 A.equal(E.dispatch(s,'travel crossing').ok,true);
 const w=R.world.realm.ensure(s);
 w.fieldworkInbox={reports:{[prepared.checkId]:{untrusted:true}}};
 const before=E.exportGame(s),rng=s.rngState,minutes=s.world.minutes;
 A.throws(()=>opportunity(s,'file',{noticeId:n.noticeId,
  checkId:prepared.checkId}),/already received this original survey/);
 A.equal(E.exportGame(s),before);
 A.equal(s.world.minutes,minutes);A.equal(s.rngState,rng);
 A.equal(opportunity(s,'status').knownNotices[0].state,'unmarked');
}


// Master Prompt §§5/11/44/47: inspection approval is not a magical repair.
// Independent crews act at a LATER world boundary with previously allocated
// real capacity and funds; the player cannot select their hidden outcome.
const Guild=require('../world/guild-fieldwork');
function authenticFieldCrew(seedStart=785330){
 for(let seed=seedStart;seed<seedStart+60;seed++){
  const s=E.newGame({name:'Naturalists Crew',seed,path:'undecided'});
  const n=opportunity(s,'board').knownNotices.find(v=>v.habitat==='forest');
  A.ok(n);
  A.equal(E.dispatch(s,'travel forest').ok,true);
  const observed=prep(s),rolled=solve(s,observed.checkId);
  if(!rolled.success)continue; // Authentic observed check, no chosen success.
  A.equal(E.dispatch(s,'travel crossing').ok,true);
  const filed=opportunity(s,'file',{noticeId:n.noticeId,
    checkId:observed.checkId});
  A.equal(filed.guildInboxReceived,true);
  const w=R.world.realm.ensure(s),r=w.fieldworkInbox.reports[observed.checkId];
  A.equal(r.result,'interpreted');
  // A test-only, actual measurable stressed site and funded institution.
  // Neither value can be selected through any player-facing operation.
  w.ecosystems.copperwood.pressure=82;
  w.ecosystems.copperwood.quality=36;
  w.institutions.naturalists_guild.funds=75;
  w.institutions.naturalists_guild.capacity=75;
  return {s,w,record:r,notice:n,checkId:observed.checkId,roll:rolled.roll};
 }
 throw Error('No genuine interpretation obtained by independent Survey checks');
}
{
 const {s,w,record,checkId,roll}=authenticFieldCrew();
 const money=s.player.coins,playerRng=s.rngState;
 R.world.advance(s,6);
 A.equal(record.decision,'field-inspection-authorised');
 A.equal(record.reviewedDay,6);
 A.equal(record.inspection.status,'scheduled');
 A.equal(record.inspection.reviewDay,6);
 A.equal(record.inspection.reservedFunds,1);
 A.equal(record.inspection.reservedCapacity,1);
 A.equal(w.fieldworkInbox.reports[checkId].reportHash,record.reportHash);
 A.equal(w.fieldworkInbox.reports[checkId].checkId,checkId);
 const snap=structuredClone(w.ecosystems.copperwood),funds=w.institutions.naturalists_guild.funds,
  capacity=w.institutions.naturalists_guild.capacity;
 const atAuthorisation=E.exportGame(s),tickRng=s.rngState;
 const premature=Guild.inspect(w,6,()=>{throw Error('No same-day crew draw');});
 A.deepEqual(premature,{attempted:0,improved:0});
 A.equal(E.exportGame(s),atAuthorisation);A.equal(s.rngState,tickRng);
 const news=[];
 const visited=Guild.inspect(w,12,()=>0,e=>news.push(e));
 A.deepEqual(visited,{attempted:1,improved:1});
 A.equal(record.inspection.status,'completed');
 A.equal(record.inspection.result,'small-local-habitat-stabilisation');
 A.equal(record.inspection.completedDay,12);
 A.equal(record.inspection.ecologyBefore.pressure,snap.pressure);
 A.equal(record.inspection.ecologyAfter.pressure,Math.max(0,snap.pressure-1));
 A.equal(record.inspection.ecologyAfter.quality,Math.min(100,snap.quality+1));
 A.equal(w.ecosystems.copperwood.pressure,snap.pressure-1);
 A.equal(w.ecosystems.copperwood.quality,snap.quality+1);
 A.equal(w.institutions.naturalists_guild.funds,funds);
 A.equal(w.institutions.naturalists_guild.capacity,capacity);
 A.equal(news.length,1);A.equal(news[0].region,'copperwood');
 A.equal(news[0].releaseDay,14);
 A.equal(s.player.coins,money);A.equal(s.rngState,tickRng);
 A.equal(record.inspection.resolutionHash.length,64);
 const after=E.exportGame(s);
 A.deepEqual(Guild.inspect(w,18,()=>{throw Error('No duplicate draw');}),
  {attempted:0,improved:0});
 A.equal(E.exportGame(s),after);
 const loaded=E.importGame(after);
 A.equal(loaded.table.realm.fieldworkInbox.reports[checkId].inspection.result,
  'small-local-habitat-stabilisation');
 A.equal(loaded.table.habitatSurveyFindings[checkId].rollEvent.details.roll,roll);
 A.equal(playerRng!==undefined,true);
}
{
 const {s,w,record}=authenticFieldCrew(785390);
 R.world.advance(s,6);
 A.equal(record.inspection.status,'scheduled');
 const frozen=structuredClone(w),before=structuredClone(w.ecosystems.copperwood);
 const info=[];
 const none=Guild.inspect(w,12,()=>0.99,e=>info.push(e));
 A.deepEqual(none,{attempted:1,improved:0});
 A.equal(record.inspection.result,'surveyed-no-effective-stabilisation');
 A.deepEqual(w.ecosystems.copperwood,before);
 A.equal(info.length,1);
 // An altered completed outcome cannot be used as authentic world history.
 const resolved=E.exportGame(s),rng=s.rngState;
 record.inspection.ecologyAfter.quality++;
 A.throws(()=>Guild.inspect(w,18,()=>0),
  /completed independent field inspection lacks genuine outcome evidence/);
 A.equal(s.rngState,rng);
 A.notEqual(E.exportGame(s),resolved);
 const original=frozen.fieldworkInbox.reports[record.checkId];
 A.equal(original.inspection.status,'scheduled');
}
{
 const {s,w,record}=authenticFieldCrew(785450);
 R.world.advance(s,6);
 A.equal(record.inspection.status,'scheduled');
 const previous=structuredClone(w.ecosystems.copperwood),rng=s.rngState;
 w.institutions.naturalists_guild.status='suspended';
 const events=[],out=Guild.inspect(w,12,()=>{throw Error('No crew RNG on closure');},
  e=>events.push(e));
 A.deepEqual(out,{attempted:1,improved:0});
 A.equal(record.inspection.result,'cancelled-no-active-crew');
 A.deepEqual(w.ecosystems.copperwood,previous);
 A.ok(events[0].text.includes('cancel'));
 A.equal(s.rngState,rng);
}
{
 const {s,w,record}=authenticFieldCrew(785510);
 R.world.advance(s,6);
 const b=E.exportGame(s),rng=s.rngState;
 record.inspection.issueHash='0'.repeat(64);
 A.throws(()=>Guild.inspect(w,12,()=>0),/verified original resource authorisation/);
 A.equal(s.rngState,rng);
 A.notEqual(E.exportGame(s),b);
}
{
 // Integration through the real multi-day independent world tick: the
 // subsequent visit resolves on day 12, not during authorisation on day 6.
 const {s,w,record,checkId}=authenticFieldCrew(785570);
 const coins=s.player.coins;
 R.world.advance(s,12);
 A.equal(record.reviewedDay,6);
 A.equal(record.inspection.completedDay,12);
 A.equal(record.inspection.status,'completed');
 A.ok(['small-local-habitat-stabilisation',
  'surveyed-no-effective-stabilisation','observed-no-current-repair-needed',
  'cancelled-no-active-crew'].includes(record.inspection.result));
 A.equal(s.player.coins,coins);
 A.equal(R.act(s,{system:'opportunity',operation:'status',params:{}})
   .knownNotices.find(x=>x.noticeId===record.noticeId).state,'filed');
 A.equal(record.checkId,checkId);
 const completed=E.exportGame(s);
 R.world.advance(s,6);
 A.equal(record.inspection.completedDay,12);
 A.notEqual(E.exportGame(s),completed,'World time continues without replaying guild work');
}


// A crew arriving after environmental recovery does not perform or
// fabricate repairs merely to satisfy its earlier authorisation.
{
 const {s,w,record}=authenticFieldCrew(785640);
 R.world.advance(s,6);
 A.equal(record.inspection.status,'scheduled');
 Object.assign(w.ecosystems.copperwood,{pressure:24,quality:89,water:86,forage:90});
 const before=structuredClone(w.ecosystems.copperwood),coins=s.player.coins;
 const result=Guild.inspect(w,12,()=>{throw Error('No RNG required for recovered site');});
 A.deepEqual(result,{attempted:1,improved:0});
 A.equal(record.inspection.result,'observed-no-current-repair-needed');
 A.deepEqual(w.ecosystems.copperwood,before);
 A.equal(s.player.coins,coins);
}
{
 const {s,w,record}=authenticFieldCrew(785700);
 R.world.advance(s,6);
 A.equal(record.inspection.status,'scheduled');
 const before=E.exportGame(s),rng=s.rngState;
 record.decision='reviewed-without-field-inspection';
 A.throws(()=>Guild.inspect(w,12,()=>0),
  /cannot exist without the original independent authorisation/);
 A.equal(s.rngState,rng);
 A.notEqual(E.exportGame(s),before);
}
{
 const {s,w,record}=authenticFieldCrew(785760);
 R.world.advance(s,6);
 // Old completed campaign saves could have a legitimately authorised
 // inspection before this feature existed. They cannot inherit a newly
 // invented crew or an undocumented repair.
 delete record.inspection;
 const before=E.exportGame(s),rng=s.rngState;
 A.deepEqual(Guild.inspect(w,12,()=>{throw Error('No retroactive roll');}),
  {attempted:0,improved:0});
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}


// Master Prompt §§11/45/50: material extraction uses the same original
// recorded terrain and single engine-owned Survival roll. A self-edited
// success flag, moved source scene or forged dice cannot mint inventory.
function authenticReedSurvey(seed=758100){
 const s=fresh(seed);
 s.player.attributes.wis=30;s.player.skills.survival.rank=5;
 const ready=prep(s),result=solve(s,ready.checkId);
 A.equal(result.success,true,'Actual high-skill fieldworker still rolls honestly');
 return {s,id:ready.checkId,roll:result.roll};
}
const harvestReed=(s,id)=>R.act(s,{system:'world',operation:'harvestReeds',
 params:{checkId:id}});
{
 const {s,id,roll}=authenticReedSurvey();
 const evidence=require('../rules/habitat-survey').interpreted(s,id,{
  habitat:'fen',mustSucceed:true,maxAgeMinutes:1440});
 A.equal(evidence.originalRoll,roll);
 A.equal(evidence.success,true);
 A.equal(s.table.habitatSurveyFindings[id].rollEvent.details.roll,roll);
 const rng=s.rngState,minute=s.world.minutes,pressure=s.world.fenPressure;
 for(let i=0;i<103;i++)R.core.event(s,'story','Independent ordinary events '+i);
 A.equal(s.log.some(e=>e.details?.checkId===id),false);
 const harvested=harvestReed(s,id);
 A.equal(harvested.quantity,1);
 A.equal(harvested.originalSurvivalRoll,roll);
 A.equal(harvested.sourceRollHash,evidence.rollHash);
 A.equal(s.table.fenReedHarvests[Math.floor(minute/1440)].sourceRollHash,
  evidence.rollHash);
 A.equal(s.rngState,rng,'Original Survival evidence must not draw a second die');
 A.equal(s.world.minutes,minute+45);
 A.equal(s.world.fenPressure,pressure+1);
 A.equal(s.player.inventory.marsh_reed,1);
 A.equal(E.importGame(E.exportGame(s)).table.fenReedHarvests[Math.floor(minute/1440)].originalSurvivalRoll,roll);
}
{
 const base=authenticReedSurvey(758101),original=E.exportGame(base.s);
 for(const corrupt of [
  s=>{s.table.habitatSurveyFindings[base.id].rollEvent.details.roll=99;},
  s=>{s.table.habitatSurveyFindings[base.id].success=false;},
  s=>{const finding=s.table.habitatSurveyFindings[base.id];
   finding.degree=finding.degree==='exceptional'?'failure':'exceptional';},
  s=>{s.table.sceneChecks[base.id].observationEvent.text='An imaginary rare resource appears';},
  s=>{s.table.sceneCheckEventsUsed[s.table.sceneChecks[base.id].eventHash]='other_check';},
  s=>{s.table.habitatSurveyFindings[base.id].finding='I discovered a dragon';},
  s=>{s.table.habitatSurveyFindings[base.id].rollEventHash='0'.repeat(64);}
 ]){
  const s=E.importGame(original);corrupt(s);
  const before=E.exportGame(s),rng=s.rngState,clock=s.world.minutes;
  A.throws(()=>harvestReed(s,base.id),
   /Original habitat field evidence has been altered|actual original terrain witness|source-authentic habitat observation and genuine check|recent successful authentic fen survey/);
  A.equal(E.exportGame(s),before);
  A.equal(s.rngState,rng);
  A.equal(s.world.minutes,clock);
  A.equal(s.player.inventory.marsh_reed||0,0);
 }
}
{
 const {s,id,roll}=authenticReedSurvey(758102);
 // An older checkpoint without the newer event copies can still use its
 // original live narrative proof, but never forge replacements.
 delete s.table.sceneChecks[id].observationEvent;
 delete s.table.habitatSurveyFindings[id].rollEvent;
 A.equal(harvestReed(s,id).originalSurvivalRoll,roll);
}
{
 const {s,id}=authenticReedSurvey(758103);
 delete s.table.sceneChecks[id].observationEvent;
 delete s.table.habitatSurveyFindings[id].rollEvent;
 for(let i=0;i<103;i++)R.core.event(s,'story','Later local work '+i);
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>harvestReed(s,id),/actual original terrain witness/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}

console.log('Engine-authored habitat evidence produces one honest local skill check, without invented fauna or rewards');
