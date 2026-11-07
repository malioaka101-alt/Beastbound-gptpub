'use strict';
// All test states and saves are disposable. No canonical player's checkpoint is altered.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
const DAY=1440;
const rule=(s,operation,params={})=>R.act(s,{system:'competition',operation,params});
const fresh=(seed=87213)=>E.newGame({seed,name:'Assessment Fixture',path:'undecided'});
function sixthDay(s){E.advance(s,5*DAY);A.equal(E.day(s),6);}
function realReport(s){
 A.equal(E.dispatch(s,'travel forest').ok,true);
 const prep=R.act(s,{system:'world',operation:'habitatSurvey',params:{}});
 const result=R.act(s,{system:'core',operation:'check',
  params:{checkId:prep.checkId}}).check;
 A.equal(E.dispatch(s,'travel crossing').ok,true);
 return {checkId:prep.checkId,result};
}
{
 const s=fresh(87214),raw=E.exportGame(s),rng=s.rngState;
 A.throws(()=>rule(s,'fieldAssessment',{checkId:'invented_field_00001'}),/scheduled sixth day/);
 A.throws(()=>rule(s,'notice',{eventDay:6}),/accepts only its established request fields/);
 A.throws(()=>rule(s,'fieldAssessment',{checkId:'bad',score:999}),/accepts only its established request fields/);
 A.equal(E.exportGame(s),raw);A.equal(s.rngState,rng);
 const peek=rule(s,'status');
 A.equal(peek.posted,false);A.equal(peek.eventDay,null);
 A.equal(E.exportGame(s),raw);
 s.encounter={beastId:'unknown'};
 A.throws(()=>rule(s,'notice'),/Resolve the present beast encounter/);
 s.encounter=null;
 A.equal(E.exportGame(s),raw);
}
{
 const s=fresh(87215);
 sixthDay(s);
 const prev=s.rngState,seen=rule(s,'notice');
 A.equal(seen.witnessed,true);A.equal(seen.eventDay,6);
 A.equal(seen.fee,5);A.equal(s.rngState,prev);
 A.equal(s.table.competitionNotices.field_assessment_6.used,false);
 A.throws(()=>rule(s,'notice'),/already been witnessed/);
 A.throws(()=>rule(s,'fieldAssessment',{checkId:'fictitious'}),/09:00–15:00/);
 // A genuine field survey from the documented landscape, not a claimed roll.
 const {checkId,result}=realReport(s);
 const view=rule(s,'status');
 A.equal(view.posted,true);A.equal(view.eventDay,6);
 const saved=E.exportGame(s),rng=s.rngState,minute=s.world.minutes;
 A.throws(()=>rule(s,'fieldAssessment',{checkId:'invented_field_00001'}),
  /resolved, same-work-sixday/);
 A.equal(E.exportGame(s),saved);A.equal(s.rngState,rng);
 const beforeCoins=s.player.coins,beforePoints=s.player.rankings.fieldwork;
 const report=rule(s,'fieldAssessment',{checkId});
 const expected=result.total-13;
 A.equal(report.result,expected>=10?'Distinction':expected>=5?'Merit':expected>=0?'Pass':'Unplaced');
 A.equal(report.points,expected>=0?Math.max(0,Math.min(30,10+expected)):0);
 A.equal(report.reward,expected>=0?24:0);
 A.equal(report.entryFee,5);
 A.equal(report.noSecondRoll,true);
 A.equal(report.originalFieldRoll,result.roll);
 A.equal(s.rngState,rng);
 A.equal(s.player.coins,beforeCoins-5+report.reward);
 A.equal(s.player.rankings.fieldwork,beforePoints+report.points);
 A.equal(s.world.minutes,minute+120);
 A.equal(s.table.competitionNotices.field_assessment_6.used,true);
 A.equal(s.table.competitionReportsUsed[checkId],6);
 A.equal(s.player.competitionRecord.at(-1).sourceCheckId,checkId);
 const after=E.exportGame(s);
 A.throws(()=>rule(s,'fieldAssessment',{checkId}),/previously witnessed, unused official/);
 A.equal(E.exportGame(s),after);A.equal(s.rngState,rng);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-real-competition-'));
 try{
  const file=Path.join(dir,'save.json');
  const s=fresh(87216);sixthDay(s);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  let before=FS.readFileSync(file,'utf8');
  const forged={id:'contest_fake_00001',mode:'rule',system:'competition',
   operation:'fieldAssessment',params:{checkId:'fictitious_field',judgeScore:100}};
  A.throws(()=>Turn.execute(file,forged),/accepts only its established request fields/);
  A.equal(FS.readFileSync(file,'utf8'),before);
  let notice=Turn.execute(file,{id:'contest_notice_00001',mode:'rule',
   system:'competition',operation:'notice',params:{}});
  A.equal(notice.applied,true);
  let state=E.importGame(FS.readFileSync(file,'utf8'));
  const report=realReport(state);
  FS.writeFileSync(file,E.exportGame(state)+'\n');
  before=FS.readFileSync(file,'utf8');
  const view=Turn.execute(file,{id:'contest_status_00001',mode:'rule',
   system:'competition',operation:'status',params:{}});
  A.equal(view.applied,false);
  A.equal(view.output.rules.posted,true);
  A.equal(FS.readFileSync(file,'utf8'),before);
  const request={id:'contest_real_00001',mode:'rule',system:'competition',
   operation:'fieldAssessment',params:{checkId:report.checkId}};
  const resolved=Turn.execute(file,request);
  A.equal(resolved.applied,true);
  A.equal(resolved.output.rules.originalFieldRoll,report.result.roll);
  A.equal(Turn.execute(file,request).duplicate,true);
  const final=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{...request,id:'contest_reroll_00001'}),
   /previously witnessed, unused official/);
  A.equal(FS.readFileSync(file,'utf8'),final);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Scheduled witnessed Copperwood field assessment: authenticated report, single award, no second die');
