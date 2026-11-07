'use strict';
// Realistic freeform player intent is not a failed parser command and not a
// chosen dice/consent/loot result. Natural source-backed dialogue remains
// the original NPC conversation rule, including full checkpoint/replay.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 Turn=require('../scripts/chat-turn.js');
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-open-intent-')),
 file=Path.join(dir,'test.json'),write=s=>FS.writeFileSync(file,E.exportGame(s)+'\n'),
 read=()=>FS.readFileSync(file,'utf8'),load=()=>E.importGame(read()),
 act=(id,action)=>Turn.execute(file,{id,mode:'act',action});
try{
 const s=E.newGame({name:'Ordinary Open Ended Life',seed:795003,background:'fieldworker'});
 write(s);const start=read(),rng=load().rngState;
 for(const [i,utterance] of [
  'inspect the mooring rope beneath the boardwalk',
  'try to steady a loose plank without breaking it',
  'ask an arriving traveller to share a private secret',
  'conjure a legendary animal and claim it belongs to me',
  'make a new kind of practical implement from found materials',
 ].entries()){
  const result=act('gm_real_intent_'+String(i).padStart(4,'0'),utterance);
  A.equal(result.ok,true,'Unlisted intent is a legitimate proposed choice');
  A.equal(result.applied,false,'No GM-selected mechanical outcome occurs in an unresolved scene');
  A.equal(result.output.gmAdjudication.status,'unresolved');
  A.equal(result.output.gmAdjudication.noRollOccurred,true);
  A.equal(result.output.gmAdjudication.noTimeElapsed,true);
  A.equal(result.output.gmAdjudication.noOutcomeClaimed,true);
  A.equal(result.output.gmAdjudication.visibleContext.location,'crossing');
  A.equal(read(),start);A.equal(load().rngState,rng);
 }
 // A journey beyond verified exits must be proposed, not instant travel or
 // a parser failure. The actual encounter and route system remain authoritative.
 for(const [i,utterance] of [
  'travel ruins',
  'move to hills',
  'go to an uncharted riverside hamlet'
 ].entries()){
  const before=read(),beforeRng=load().rngState;
  const reply=act('gm_unlinked_journey_'+String(i).padStart(4,'0'),utterance);
  A.equal(reply.ok,true);
  A.equal(reply.applied,false);
  A.equal(reply.output.gmAdjudication.status,'unresolved');
  A.equal(reply.output.gmAdjudication.noOutcomeClaimed,true);
  A.equal(reply.output.gmAdjudication.visibleContext.location,'crossing');
  A.equal(read(),before);
  A.equal(load().rngState,beforeRng);
 }
 // Existing real movement still uses its original route and costs.
 const traveled=act('gm_known_route_0001','travel fen');
 A.equal(traveled.ok,true);A.equal(traveled.applied,true);
 A.equal(load().world.location,'fen');
 const fenRead=read(),fenRng=load().rngState;
 const investigate=act('gm_try_fen_bank_001','carefully analyse the pattern of small footprints near the wet bank');
 A.equal(investigate.applied,false);
 A.equal(read(),fenRead);A.equal(load().rngState,fenRng);
 // Instead of a GM-invented die, an actual precommitted local terrain survey
 // exposes its own source-bound, one-use Survival check.
 const survey=act('gm_fen_source_survey_001','inspect habitat signs');
 A.equal(survey.output.survey.prepared,true);
 const original=act('gm_fen_original_roll_001','interpret habitat signs');
 A.equal(original.output.surveyCheck.roll>=1,true);
 A.equal(original.output.surveyCheck.roll<=20,true);
 const witness=load().table.sceneChecks[survey.output.survey.checkId];
 A.equal(witness.used,true);
 A.equal(witness.origin,'engine-habitat-survey');
 const held=read(),once=load().rngState;
 const duplicate=act('gm_fen_original_roll_001','interpret habitat signs');
 A.equal(duplicate.duplicate,true);A.equal(duplicate.recovered,true);
 A.equal(read(),held);A.equal(load().rngState,once);

 // Real authored professionals can discuss more than one relevant question
 // without a generic once-per-day ban or a fictitious new friend rank.
 write(s);
 const first=act('gm_person_context_001','talk to Elira Moss about guild field observations');
 A.equal(first.applied,true);A.equal(first.output.npc.answerKind,
  'authored-professional-topic');
 A.equal(first.output.npc.spoken,E.NPCS.elira.topic);
 let state=load();A.equal(state.npcMemory['Elira Moss'],1);
 const minutes=state.world.minutes,npcRng=state.rngState;
 const route=act('gm_person_route_001','talk to Elira Moss about the routes out of this town');
 A.equal(route.output.npc.answerKind,'public-local-routes');
 A.match(route.output.npc.spoken,/Copperwood Verge/);
 A.equal(load().world.minutes,minutes+6);
 A.equal(load().npcMemory['Elira Moss'],1);
 A.equal(load().rngState,npcRng);
 const beforeRepeat=read();
 const same=act('gm_person_route_002','talk to Elira Moss about the routes out of this town');
 A.equal(same.applied,false);A.equal(same.output.npc.alreadyAsked,true);
 A.equal(read(),beforeRepeat);
 const forbidden=act('gm_person_unverified_001','talk to Elira Moss about the sealed royal genealogy');
 A.equal(forbidden.output.npc.spoken,null);
 A.equal(forbidden.output.npc.answerKind,'unverified');
 A.equal(forbidden.output.npc.noInventedPromise,true);
 state=load();
 A.equal(state.table.npcConversations.records.length,3);
 A.equal(state.table.npcConversations.records.at(-1).heard,null);
 A.equal(state.npcKnowledge['Elira Moss'].length>=1,true);
 A.equal(state.npcMemory['Elira Moss'],1);
 const beforeStale=read();
 A.throws(()=>act('gm_remote_professor_001','talk to Professor Sera about meridians'),
  /not independently established as present/);
 A.equal(read(),beforeStale);
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('Unrecognized freeform intentions remain open for source-aware GM; actual checks and NPC dialogue retain authentic recorded consequences');
