'use strict';
// All research experiments use disposable state. No campaign files or real
// scientific truth are created or backfilled by this regression suite.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),Rules=require('../rules'),
 Turn=require('../scripts/chat-turn.js');
function plan(s,id='wetland_trace'){
 s.table||={};s.table.researchPlans||={};
 s.table.researchPlans[id]={
  id,source:'Independent documented field protocol and sealed habitat research truth at the academy',
  worldMinute:s.world.minutes,
  habitatFieldworkScope:{
   kind:'physical-terrain-observation',projectId:id,
   location:'fen',biome:'fen',subject:'wetland margin signs',
   worldMinute:s.world.minutes,
   source:'Signed independent marsh habitat ecologist protocol for tracking wetland terrain shifts',
   relevance:'The observed reed-waterline and surface mud directly bear on wetland margin trace changes'
  },
  parameters:{
   id,title:'Visible wetland margin trace study',kind:'ecology',
   skill:'research',grade:1,novelty:'variant',
   truth:{feasibility:'possible',
    requirements:['Wetland surface traces change with seasonal waterline movement'],
    acceptedHypotheses:['Waterline movement alters soft shoreline impressions']}
  }
 };
}
function fresh(seed=908101){
 const s=E.newGame({name:'Independent Ecology Field Study',seed,path:'undecided'});
 s.player.attributes.int=30;s.player.attributes.wis=30;
 s.player.skills.research.rank=5;s.player.skills.survival.rank=5;
 s.player.coins=250;s.player.insightPoints=5;
 plan(s);
 return s;
}
const rule=(s,system,operation,params={})=>Rules.act(s,{system,operation,params});
function study(s,id='wetland_trace'){
 rule(s,'research','start',{id});
 rule(s,'research','survey',{id});
}
function field(s){
 A.equal(E.dispatch(s,'travel fen').ok,true);
 const p=rule(s,'world','habitatSurvey',{});
 const c=rule(s,'core','check',{checkId:p.checkId}).check;
 return {id:p.checkId,check:c};
}
const attach=(s,id='wetland_trace',checkId)=>rule(s,'research','habitatFieldwork',{id,checkId});
{
 const s=fresh(),before=E.exportGame(s),rng=s.rngState;
 for(const p of [
  {id:'wetland_trace',checkId:'foo',modifier:99},
  {id:'wetland_trace',checkId:'foo',relevance:'I decide this supports my theory'},
  {id:'wetland_trace',eventIndex:5},
  {}
 ])A.throws(()=>rule(s,'research','habitatFieldwork',p),/accepts only an established project id and witnessed checkId/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 study(s);
 const seen=field(s);
 const old=s.rngState,minutes=s.world.minutes,project=s.table.research.wetland_trace;
 const finding=s.table.habitatSurveyFindings[seen.id];
 A.equal(finding.rollEventIndex>=0,true);
 A.equal(s.log[finding.rollEventIndex].type,'roll');
 A.equal(typeof finding.rollEventHash,'string');
 const expected=seen.check.margin>=10?3:seen.check.margin>=5?2:seen.check.margin>=0?1:0;
 const proof=attach(s,'wetland_trace',seen.id);
 A.equal(proof.authenticated,true);A.equal(proof.verifiedHabitatFieldwork,true);
 A.equal(proof.noNewRoll,true);A.equal(proof.points,expected);
 A.equal(proof.rollEventIndex,finding.rollEventIndex);
 A.equal(project.progress,expected);
 A.equal(s.rngState,old);A.equal(s.world.minutes,minutes);
 A.equal(s.table.habitatResearchEvidenceUsed[seen.id].projectId,'wetland_trace');
 const doc=s.table.researchFieldEvidence.wetland_trace[String(finding.rollEventIndex)];
 A.equal(doc.origin,'engine-habitat-fieldwork');
 A.equal(doc.used,true);A.equal(doc.eventHash,finding.rollEventHash);
 A.equal(s.table.researchFieldEventsUsed[finding.rollEventHash],'wetland_trace');
 const after=E.exportGame(s);
 A.throws(()=>attach(s,'wetland_trace',seen.id),/already been used for research/);
 A.equal(E.exportGame(s),after);A.equal(s.rngState,old);
}
{
 const s=fresh(908102);study(s);const seen=field(s);
 const original=E.exportGame(s),rng=s.rngState;
 const scope=s.table.researchPlans.wetland_trace.habitatFieldworkScope;
 scope.location='hills';
 A.throws(()=>attach(s,'wetland_trace',seen.id),/source-precommitted physical terrain question/);
 scope.location='fen';
 scope.worldMinute=s.table.sceneChecks[seen.id].worldMinute+1;
 A.throws(()=>attach(s,'wetland_trace',seen.id),/source-precommitted physical terrain question/);
 scope.worldMinute=s.table.researchPlans.wetland_trace.worldMinute;
 scope.subject='rare evolutionary magic';
 A.throws(()=>attach(s,'wetland_trace',seen.id),/source-precommitted physical terrain question/);
 scope.subject='wetland margin signs';
 const finding=s.table.habitatSurveyFindings[seen.id];
 const rollHash=finding.rollEventHash;
 finding.rollEventHash='forged';
 A.throws(()=>attach(s,'wetland_trace',seen.id),/authentic original Survival dice/);
 finding.rollEventHash=rollHash;
 A.equal(E.exportGame(s),original);A.equal(s.rngState,rng);
 const late=E.importGame(original);
 late.table.researchPlans.wetland_trace.habitatFieldworkScope.worldMinute=
  late.table.sceneChecks[seen.id].worldMinute+10;
 const snapshot=E.exportGame(late);
 A.throws(()=>attach(late,'wetland_trace',seen.id),/source-precommitted physical terrain question/);
 A.equal(E.exportGame(late),snapshot);
 const unscoped=E.importGame(original);
 delete unscoped.table.researchPlans.wetland_trace.habitatFieldworkScope;
 A.throws(()=>attach(unscoped,'wetland_trace',seen.id),/source-precommitted physical terrain question/);
 const wrong=E.importGame(original);
 wrong.table.research.wetland_trace.kind='evolution';
 A.throws(()=>attach(wrong,'wetland_trace',seen.id),/active, independently precommitted ecology research project/);
}
{
 const s=fresh(908103);
 plan(s,'second_trace');
 study(s,'wetland_trace');study(s,'second_trace');
 const seen=field(s);attach(s,'wetland_trace',seen.id);
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>attach(s,'second_trace',seen.id),/already been used for research/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-ecology-fieldwork-'));
 try{
  const file=Path.join(dir,'save.json'),s=fresh(908104);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const send=(id,system,operation,params)=>Turn.execute(file,{
   id,mode:'rule',system,operation,params});
  A.equal(send('ecology_start_0001','research','start',{id:'wetland_trace'}).applied,true);
  A.equal(send('ecology_survey_0001','research','survey',{id:'wetland_trace'}).applied,true);
  const moved=Turn.execute(file,{id:'ecology_travel_0001',
   mode:'act',action:'travel fen'});
  A.equal(moved.applied,true);
  const p=send('ecology_prepare_0001','world','habitatSurvey',{});
  A.equal(p.applied,true);
  const id=p.output.rules.checkId;
  const chk=Turn.execute(file,{id:'ecology_check_0001',mode:'check',checkId:id});
  A.equal(chk.applied,true);
  const stored=FS.readFileSync(file,'utf8');
  const beforeRng=E.importGame(stored).rngState;
  A.throws(()=>send('ecology_cheat_0001','research','habitatFieldwork',{
   id:'wetland_trace',checkId:id,points:3,relevance:'Free scientific proof'}),
   /accepts only an established project id and witnessed checkId/);
  A.equal(FS.readFileSync(file,'utf8'),stored);
  const requestId='ecology_fieldwork_0001';
  const req={id:requestId,mode:'rule',system:'research',
   operation:'habitatFieldwork',params:{id:'wetland_trace',checkId:id}};
  const result=Turn.execute(file,req);
  A.equal(result.applied,true);
  A.equal(result.output.rules.noNewRoll,true);
  A.equal(result.output.rules.verifiedHabitatFieldwork,true);
  A.equal(Turn.execute(file,req).duplicate,true);
  const output=FS.readFileSync(file,'utf8'),loaded=E.importGame(output);
  A.equal(loaded.rngState,beforeRng);
  A.equal(loaded.table.research.wetland_trace.fieldwork.length,1);
  A.equal(loaded.table.habitatResearchEvidenceUsed[id].projectId,'wetland_trace');
  A.equal(loaded.table.researchFieldEvidence.wetland_trace[
   String(loaded.table.habitatSurveyFindings[id].rollEventIndex)].used,true);
  A.throws(()=>send('ecology_repeat_0002','research','habitatFieldwork',{
   id:'wetland_trace',checkId:id}),/already been used for research/);
  A.equal(FS.readFileSync(file,'utf8'),output);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Original witnessed habitat roll can support one pre-scoped honest ecology fieldwork interval');
