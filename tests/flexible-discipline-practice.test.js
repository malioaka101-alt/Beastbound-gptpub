'use strict';
// Player time is not a compulsory school calendar. Contextual help should
// improve a real short practice session, never award a power or fake a tutor.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),Turn=require('../scripts/chat-turn'),
 FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const practise=(s,params)=>R.act(s,{system:'discipline',operation:'practice',params});
function fresh(seed=781500,site='crossing'){
 const s=E.newGame({seed,name:'Flexible Learning Fixture',path:'meridian'});
 R.unified.ensurePlayer(s);s.world.location=site;
 return s;
}
{
 const s=fresh(),initial=s.world.minutes,coins=s.player.coins,
  stamina=s.player.stamina,rng=s.rngState;
 const readBefore=E.exportGame(s);
 const status=R.act(s,{system:'discipline',operation:'status',params:{}});
 A.equal(status.systems.meridian.practiceSession.defaultRoute,'independent');
 A.equal(status.systems.meridian.practiceSession.minimumMinutes,15);
 A.equal(status.systems.meridian.practiceSession.maximumMinutes,480);
 A.equal(status.systems.meridian.practiceSession.noMinimumCalendarDays,true);
 A.equal(E.exportGame(s),readBefore,'menu must not spend time or create ability');
 const r=practise(s,{system:'meridian',method:'breath',minutes:15});
 A.equal(r.route,'independent','no teacher or institution should be required by default');
 A.equal(r.elapsedMinutes,15);A.equal(r.staminaSpent,1);
 A.equal(r.feeTalons,0);A.equal(r.check.dc,14);
 A.equal(s.world.minutes,initial+15);
 A.equal(s.player.coins,coins);A.equal(s.player.stamina,stamina-1);
 A.notEqual(s.rngState,rng);
 A.equal(s.player.meridian.stage,0,'practice does not gift a breakthrough');
 A.equal(s.table.disciplineTraining.meridian.weeks,0,
  'short work cannot be misreported as sixday training');
 A.equal(s.table.disciplineTraining.meridian.sessions,1);
 A.equal(s.table.disciplineTraining.meridian.sessionMinutes,15);
 A.equal(s.table.independentTraining.at(-1).minutes,15);
 A.equal(s.table.independentTraining.at(-1).days,15/1440);
 const restored=E.importGame(E.exportGame(s));
 A.deepEqual(restored.table.independentTraining,s.table.independentTraining);
}
{
 const a=fresh(781501,'academy'),b=fresh(781501,'academy');
 for(const s of [a,b]){
  const heard=R.act(s,{system:'npc',operation:'converse',params:{npcId:'sera'}});
  A.equal(heard.noRoll,true);
 }
 const params={system:'meridian',method:'circulation',minutes:60};
 const instructed=practise(a,{...params,guidanceId:'sera'}),
  independent=practise(b,params);
 A.equal(instructed.check.roll,independent.check.roll);
 A.equal(instructed.check.modifier,independent.check.modifier+1);
 A.equal(instructed.elapsedMinutes,independent.elapsedMinutes);
 A.equal(instructed.staminaSpent,independent.staminaSpent);
 A.equal(instructed.feeTalons,0);
 A.equal(instructed.theoreticalGuidance.practitionerRankClaimed,false);
 A.equal(instructed.route,'independent');
 A.equal(a.world.minutes,b.world.minutes);
}
{
 const s=fresh(781502),before=E.exportGame(s),rng=s.rngState;
 for(const bad of [0,14,481,-10,1.5,'minutes']){
  A.throws(()=>practise(s,{system:'meridian',method:'breath',minutes:bad}),
   /practice session minutes/);
  A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 }
 s.player.stamina=0;
 const stopped=E.exportGame(s),still=s.rngState;
 A.throws(()=>practise(s,{system:'meridian',method:'breath',minutes:15}),
  /available Stamina/);
 A.equal(E.exportGame(s),stopped,'failed fatigue preflight must not create training records');
 A.equal(s.rngState,still);
}
{
 const s=fresh(781503,'academy'),coins=s.player.coins;
 const out=practise(s,{system:'arcane',method:'formulae',minutes:35,
  source:'Existing academy formula desk and openly described independent diagram work'});
 A.equal(out.route,'established');
 A.equal(out.feeTalons,0,'brief contextual practice has no invented default tuition');
 A.equal(out.check.dc,14,'unverified assistance cannot claim a full paid-course modifier');
 A.equal(out.elapsedMinutes,35);
 A.equal(s.player.coins,coins);
 A.equal(s.table.disciplineTraining.arcane.sessions,1);
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>practise(s,{system:'arcane',method:'formulae',minutes:15,
  route:'established'}),/concrete training situation/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=fresh(781504),start=s.world.minutes;
 const out=practise(s,{system:'meridian',method:'tissue'});
 A.equal(out.route,'independent');
 A.equal(out.timeDays,6);
 A.equal(s.world.minutes,start+6*1440);
 A.equal(s.table.disciplineTraining.meridian.weeks,1);
 A.equal(out.feeTalons,0);
}
{
 const s=fresh(781505),dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-flexible-practice-'));
 try{
  const file=Path.join(dir,'private-save.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const req={id:'earned_short_session_781505',mode:'rule',system:'discipline',
   operation:'practice',params:{system:'meridian',method:'breath',minutes:45}};
  const done=Turn.execute(file,req);
  A.equal(done.applied,true);
  A.equal(done.output.rules.elapsedMinutes,45);
  const data=FS.readFileSync(file,'utf8');
  A.equal(Turn.execute(file,req).duplicate,true);
  A.equal(FS.readFileSync(file,'utf8'),data);
  const saved=E.importGame(data);
  A.equal(saved.world.minutes,s.world.minutes+45);
  A.equal(saved.table.disciplineTraining.meridian.sessions,1);
  A.equal(saved.table.disciplineTraining.meridian.weeks,0);
  const cheat={...req,id:'invent_teacher_781505',
   params:{system:'meridian',method:'breath',minutes:30,
    guidanceId:'invisible_guru',route:'independent'}};
  A.throws(()=>Turn.execute(file,cheat),/source-backed/);
  A.equal(FS.readFileSync(file,'utf8'),data);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Short individual practice uses real time and fatigue, preserves old sixday calls, accepts witnessed theory and never needs a compulsory tutor');
