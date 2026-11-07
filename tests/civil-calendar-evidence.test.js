'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),Crypto=require('node:crypto');
const E=require('../engine.js'),Rules=require('../rules'),C=require('../rules/core'),
 Realm=require('../world/simulation'),Turn=require('../scripts/chat-turn.js');
function fresh(seed=29104){return E.newGame({name:'Civil Date Witness',seed,path:'undecided'});}
function proof(s,id='civil_register_001'){
 C.event(s,'story','The council registrar displays an independently verified official date on the board.',
  {calendarEvidenceId:id});
 const index=s.log.length-1,event=s.log[index];
 s.table||={};s.table.calendarEvidence||={};
 s.table.calendarEvidence[id]={
  evidenceId:id,origin:'witnessed-civil-register',
  worldMinute:s.world.minutes,location:s.world.location,
  date:{year:1153,month:10,day:5},register:'Morrowfen council civil register',
  source:'Dated council office calendar cross-checked with independently recorded market notices',
  eventIndex:index,
  eventHash:Crypto.createHash('sha256').update(JSON.stringify(event)).digest('hex')
 };
}
const anchor=(s,p)=>Rules.act(s,{system:'world',operation:'setCalendar',params:p});
{
 const s=fresh(),before=E.exportGame(s),rng=s.rngState;
 for(const p of [{date:{year:999,month:7,day:1},source:'I say the season is summer'},
   {date:{year:1153,month:10,day:5}},{source:'A date I choose now'},{}])
  A.throws(()=>anchor(s,p),/only a precommitted civil date evidenceId/);
 A.throws(()=>anchor(s,{evidenceId:'missing_calendar_01'}),/prior source-dated local civil register/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 proof(s);
 s.table.calendarEvidence.civil_register_001.date.day=31;
 const invalid=E.exportGame(s);
 A.throws(()=>anchor(s,{evidenceId:'civil_register_001'}),/must be an integer|Invalid/);
 A.equal(E.exportGame(s),invalid);
 s.table.calendarEvidence.civil_register_001.date.day=5;
 s.table.calendarEvidence.civil_register_001.eventHash='invented';
 A.throws(()=>anchor(s,{evidenceId:'civil_register_001'}),/must match an actual earlier witnessed scene/);
 s.table.calendarEvidence.civil_register_001.eventHash=Crypto.createHash('sha256')
  .update(JSON.stringify(s.log[s.table.calendarEvidence.civil_register_001.eventIndex])).digest('hex');
 s.world.location='fen';
 A.throws(()=>anchor(s,{evidenceId:'civil_register_001'}),/prior source-dated local civil register/);
 s.world.location='crossing';
 s.table.calendarEvidence.civil_register_001.worldMinute+=1;
 A.throws(()=>anchor(s,{evidenceId:'civil_register_001'}),/prior source-dated local civil register/);
}
{
 const s=fresh(29105);proof(s);
 const before=s.world.minutes,rng=s.rngState;
 const r=anchor(s,{evidenceId:'civil_register_001'});
 A.equal(r.absoluteDate,'5 Leaffall 1153 AC');
 A.equal(r.fromRecordedRegister,true);
 A.equal(s.table.calendarEvidence.civil_register_001.used,true);
 A.equal(s.table.realm.calendarAnchor.date.year,1153);
 A.equal(s.world.minutes,before);A.equal(s.rngState,rng);
 const saved=E.exportGame(s);
 A.throws(()=>anchor(s,{evidenceId:'civil_register_001'}),/already established/);
 A.equal(E.exportGame(s),saved);
 const later=E.importGame(saved);
 Rules.world.advance(later,2);
 A.equal(Realm.calendar(later).absoluteDate,'7 Leaffall 1153 AC');
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-civil-date-'));
 try{
  const file=Path.join(dir,'save.json'),s=fresh(29106);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const initial=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{id:'civil_fake_date_0001',mode:'rule',
   system:'world',operation:'setCalendar',
   params:{date:{year:9999,month:7,day:1},source:'Invented false summer'}}),
   /only a precommitted civil date evidenceId/);
  A.equal(FS.readFileSync(file,'utf8'),initial);
  proof(s);FS.writeFileSync(file,E.exportGame(s)+'\n');
  const saved=FS.readFileSync(file,'utf8');
  const req={id:'civil_anchor_0001',mode:'rule',system:'world',
   operation:'setCalendar',params:{evidenceId:'civil_register_001'}};
  const done=Turn.execute(file,req);
  A.equal(done.applied,true);A.equal(done.output.rules.fromRecordedRegister,true);
  A.equal(Turn.execute(file,req).duplicate,true);
  const persisted=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(persisted.table.realm.calendarAnchor.date.month,10);
  A.equal(persisted.table.calendarEvidence.civil_register_001.used,true);
  const after=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{...req,id:'civil_anchor_again_0002'}),/already established/);
  A.equal(FS.readFileSync(file,'utf8'),after);
  A.notEqual(FS.readFileSync(file,'utf8'),saved);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Witnessed and immutable civil calendar anchor tests passed');
