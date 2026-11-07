'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path');
const E=require('../engine.js'),Rules=require('../rules'),
 Turn=require('../scripts/chat-turn.js'),Practice=require('../rules/earned-practice');
const fresh=(seed=34901)=>E.newGame({name:'Earned Practice Fixture',seed,path:'undecided'});
{
 const s=fresh(),skill=s.player.skills.survival;
 A.equal(typeof E.skillGain,'function');
 A.equal(skill.rank,1);
 skill.xp=24; // Rank 2 costs 25 cumulative practice from rank 1.
 const r=Practice.award(s,{skill:'survival',check:{success:true},risky:true});
 A.equal(r.ppAwarded,2);A.equal(r.skillRankBefore,1);A.equal(r.skillRankAfter,2);
 A.equal(skill.rank,2);A.equal(skill.xp,1);
 A.equal(skill.ppThisSixday,2);A.equal(skill.ppPeriod,0);
 A.equal(r.noExtraRoll,true);
}
{
 const s=fresh(34902),skill=s.player.skills.survival,rng=s.rngState;
 const a=Practice.award(s,{skill:'survival',check:{success:true}});
 const b=Practice.award(s,{skill:'survival',check:{success:true}});
 const c=Practice.award(s,{skill:'survival',check:{success:true}});
 const d=Practice.award(s,{skill:'survival',check:{success:false}});
 A.deepEqual([a.ppAwarded,b.ppAwarded,c.ppAwarded,d.ppAwarded],[2,2,2,1]);
 A.equal(skill.xp,7);A.equal(skill.ppThisSixday,7);
 A.equal(skill.ppPeriod,0,
  'period counters remain reporting metadata, not a training ceiling');
 A.equal(s.rngState,rng);
 const prior=E.exportGame(s);
 const no=Practice.award(s,{skill:'survival',check:{success:true},risky:false});
 A.equal(no.ppAwarded,0);A.equal(E.exportGame(s),prior);
}
{
 const s=fresh(34903),skill=s.player.skills.survival,rng=s.rngState;
 skill.rank=3;skill.xp=99;
 const held=Practice.award(s,{skill:'survival',check:{success:true}});
 A.equal(held.ppAwarded,2);
 A.equal(skill.rank,3);A.equal(skill.xp,101);
 A.equal(skill.pendingTrialLogged,true);
 // A legitimate recorded Mastery trial is a separate prerequisite.
 skill.trial_4=true;
 E.advance(s,6*1440);
 const earned=Practice.award(s,{skill:'survival',check:{success:true}});
 A.equal(earned.skillRankAfter,4);A.equal(skill.xp,3);
 A.equal(s.rngState!==rng,true); // independent world daily ticks, not practice dice
}
{
 const s=fresh(34904),initial=s.player.skills.survival.xp;
 A.equal(E.dispatch(s,'travel fen').ok,true);
 const prepared=Rules.act(s,{system:'world',operation:'habitatSurvey',params:{}});
 const rolled=Rules.act(s,{system:'core',operation:'check',
  params:{checkId:prepared.checkId}}).check;
 A.equal(rolled.ppAwarded,rolled.success?2:1);
 A.equal(s.player.skills.survival.xp,initial+rolled.ppAwarded);
 const finding=s.table.habitatSurveyFindings[prepared.checkId];
 A.equal(s.log[finding.rollEventIndex].type,'roll');
 const written=E.exportGame(s),rng=s.rngState;
 A.throws(()=>Rules.act(s,{system:'core',operation:'check',
  params:{checkId:prepared.checkId}}),/precommitted witnessed challenge/);
 A.equal(E.exportGame(s),written);A.equal(s.rngState,rng);
}
{
 const s=fresh(34905),initial=s.player.skills.beastcraft.xp;
 A.equal(E.dispatch(s,'travel fen').ok,true);
 A.equal(E.dispatch(s,'explore').ok,true);
 s.encounter.threat=false;
 const witnessed=Rules.act(s,{system:'world',operation:'observe',params:{}});
 A.equal(witnessed.ppAwarded,witnessed.check.success?2:1);
 A.equal(s.player.skills.beastcraft.xp,initial+witnessed.ppAwarded);
 const proof=s.table.wildlifeObservationEvidence[s.encounter.beastId];
 A.equal(s.log[proof.rollEventIndex].type,'roll');
 A.throws(()=>Rules.act(s,{system:'world',operation:'observe',params:{}}),
  /already been inspected/);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-earned-pp-'));
 try{
  const file=Path.join(dir,'save.json'),s=fresh(34906);
  A.equal(E.dispatch(s,'travel fen').ok,true);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const prep={id:'pp_field_prep_0001',mode:'rule',system:'world',
   operation:'habitatSurvey',params:{}};
  const started=Turn.execute(file,prep);
  A.equal(started.applied,true);
  const checkId=started.output.rules.checkId;
  const old=E.importGame(FS.readFileSync(file,'utf8'));
  const req={id:'pp_real_field_0001',mode:'check',checkId};
  const result=Turn.execute(file,req);
  A.equal(result.applied,true);
  A.equal(result.output.check.ppAwarded,result.output.check.success?2:1);
  A.equal(Turn.execute(file,req).duplicate,true);
  const saved=FS.readFileSync(file,'utf8'),loaded=E.importGame(saved);
  A.equal(loaded.player.skills.survival.xp,
   old.player.skills.survival.xp+result.output.check.ppAwarded);
  A.equal(loaded.player.skills.survival.ppThisSixday,
   result.output.check.ppAwarded);
  A.throws(()=>Turn.execute(file,{...req,id:'pp_reroll_0001'}),
   /precommitted witnessed challenge/);
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
{
 // The exact same independent effort, resolved in one local sixday,
 // may now earn the next professional rank without calendar waiting.
 const s=fresh(34907),skill=s.player.skills.survival;
 skill.xp=18;
 for(let k=0;k<4;k++)Practice.award(s,{skill:'survival',
  check:{success:true},risky:true});
 A.equal(skill.rank,2);
 A.equal(skill.xp,1);
 A.equal(skill.ppPeriod,0);
 A.equal(skill.ppThisSixday,8);
 A.throws(()=>E.skillGain(s,'survival',1000),
  /Actual independently resolved practice/);
 const prior=skill.xp;E.advance(s,2*1440);
 A.equal(skill.xp,prior,
  'idle calendar passage cannot create a new qualification');
}
console.log('Genuine field and wildlife skill practice earns outcome-based PP without elapsed-sixday caps or duplicated turn rewards');
