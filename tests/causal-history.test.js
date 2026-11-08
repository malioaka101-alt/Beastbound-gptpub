
'use strict';
// GM decides historical truth; the original Atlas and world clock hold the
// events. The engine records causes, disputed interpretations and surviving
// effects, without inventing past powers or changing an office automatically.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine'),New=require('../scripts/new-campaign'),Rules=require('../rules');
const World=require('../world/simulation'),History=require('../world/causal-history');
const Atlas=require('../world/atlas'),Turn=require('../scripts/chat-turn');
const fresh=()=>New.create({seed:953166,slug:'history_fixture_campaign',
 mode:'gm',age:34,gmOpening:{locationId:'crossing',
 scene:'The canal market opens while the clerks check ferry rights recorded after the old Estuary Wars.',
 focus:'The ferry rights ledger',weather:'calm morning',hour:9,minute:30}}).state;
const s=fresh(),original=E.exportGame(s),rng=s.rngState,coin=s.player.coins;
const status=Rules.act(s,{system:'world',operation:'historyStatus',params:{}});
A.equal(status.events.length,Atlas.history.length);
A.equal(status.events.find(e=>e.id==='estuary_wars').era,'Estuary Wars');
A.equal(status.events.find(e=>e.id==='ash_years').era,'Ash Years');
A.equal(History.validate(World.peek(s).causalHistory),true);
A.equal(E.exportGame(s),original,'A past history read does not rewrite the world');
A.equal(s.rngState,rng);
const rights=Rules.act(s,{system:'world',operation:'historyStatus',
 params:{targetType:'region',targetId:'morrowfen_basin'}});
A.equal(rights.effects.length,1);
A.equal(rights.effects[0].eventId,'estuary_wars');
const atlas=Rules.act(s,{system:'world',operation:'atlas',params:{type:'region',id:'morrowfen_basin'}});
A.equal(atlas.historicalInfluences.length,1);
const forge=Rules.act(s,{system:'world',operation:'atlas',params:{type:'polity',id:'cinder_free'}});
A.equal(forge.historicalInfluences[0].eventId,'ash_years');
const prior=E.importGame(E.exportGame(s));
delete prior.table.realm.causalHistory;
const beforeOld=E.exportGame(prior);
A.equal(History.status(prior,{}).events.length,5);
A.equal(E.exportGame(prior),beforeOld,'Legacy saves show original eras without a mutation');
const hidden={eventId:'secret_refuge_covenant',
 era:'The Hidden River Accord',period:'A generation after the Estuary Wars',
 account:'A private unpublished pact described previously unknown refuge obligations.',
 basis:'The GM establishes this as an underlying historical event; its public existence has not been witnessed.',
 scopeType:'region',scopeId:'morrowfen_basin',causes:['estuary_wars'],visibility:'gm-only'};
const created=Rules.act(s,{system:'world',operation:'historyRecordEvent',params:hidden});
A.equal(created.recorded,true);
A.equal(Rules.act(s,{system:'world',operation:'historyStatus',params:{}}).events.length,5);
A.equal(Rules.act(s,{system:'world',operation:'historyStatus',
 params:{eventId:hidden.eventId}}).known,false);
A.ok(!s.log.some(x=>x.text?.includes('Hidden River Accord')));
A.throws(()=>Rules.act(s,{system:'world',operation:'historyRecordEvent',params:hidden}),/rewritten/);
const later={eventId:'canal_bridge_compact',
 era:'Reconstruction of the North Canal',period:'Years after the old Estuary Wars',
 account:'Communities later negotiated a maintenance compact for the river paths after the first treaty.',
 basis:'A GM-authored historic maintenance agreement backed by surviving witness accounts.',
 scopeType:'region',scopeId:'morrowfen_basin',
 causes:['estuary_wars','secret_refuge_covenant'],visibility:'public'};
A.equal(Rules.act(s,{system:'world',operation:'historyRecordEvent',params:later}).recorded,true);
const publicLater=Rules.act(s,{system:'world',operation:'historyStatus',params:{eventId:later.eventId}});
A.equal(publicLater.known,true);
A.deepEqual(publicLater.event.causes,['estuary_wars'],
 'A GM-secret cause is not revealed by a later publicly known consequence');
const first={eventId:later.eventId,accountId:'charter_clerks_report',
 speaker:'North Canal Public Clerks',
 claim:'The agreement followed open town meetings and was supported by public maintenance accounts.',
 basis:'A publicly authored municipal interpretation of the recorded North Canal compact.'};
const second={...first,accountId:'river_elders_report',
 speaker:'River Elders Accounts',
 claim:'Some river households argued the council omitted earlier private rescue promises from its official account.',
 basis:'A separately preserved account; the GM does not make it the underlying original event.'};
A.equal(Rules.act(s,{system:'world',operation:'historyInterpret',params:first}).recorded,true);
A.equal(Rules.act(s,{system:'world',operation:'historyInterpret',params:second}).recorded,true);
A.equal(Rules.act(s,{system:'world',operation:'historyStatus',
 params:{eventId:later.eventId}}).event.interpretations.length,2);
A.throws(()=>Rules.act(s,{system:'world',operation:'historyInterpret',params:first}),/overwritten/);
const impact={eventId:later.eventId,effectId:'north_canal_repair_custom',
 targetType:'region',targetId:'morrowfen_basin',dimension:'civic-maintenance',
 change:'The maintenance compact put an ongoing duty to inspect the river bridges into local customs.',
 continuity:'Present river households still refer to the compact when organising bridge repairs.',
 basis:'A GM-authored pregame maintenance custom attached to the actual Morrowfen Basin.'};
A.equal(Rules.act(s,{system:'world',operation:'historyEffect',params:impact}).recorded,true);
A.equal(Rules.act(s,{system:'world',operation:'historyStatus',
 params:{targetType:'region',targetId:'morrowfen_basin'}}).effects.length,2);
A.equal(Rules.act(s,{system:'world',operation:'historyEffect',params:{
 ...impact,effectId:'revised_repair_custom',
 precededBy:'north_canal_repair_custom',
 change:'A later council interpretation narrowed inspection obligations to community bridges.',
 continuity:'Bridge crews use the revised public custom but older testimony remains recorded.'
 }}).recorded,true);
A.equal(s.player.coins,coin);A.equal(s.player.meridian.stage,0);
A.throws(()=>Rules.act(s,{system:'world',operation:'historyEffect',params:{
 ...impact,effectId:'instant_free_treasury',targetId:'imaginary_polity'}}),/real existing/);
A.throws(()=>Rules.act(s,{system:'world',operation:'historyRecordEvent',params:{
 ...later,eventId:'future_unearned_event',year:999999}}),/event needs/);
A.throws(()=>Rules.act(s,{system:'world',operation:'historyRecordEvent',params:{
 ...later,eventId:'impossible_cause',causes:['nonexistent_history']}}),/already exist/);
const saved=E.importGame(E.exportGame(s));
A.equal(History.validate(saved.table.realm.causalHistory),true);
const tamper=E.importGame(E.exportGame(s));
tamper.table.realm.causalHistory.events.canal_bridge_compact.account='Invented false history';
A.throws(()=>History.status(tamper,{}),/altered/);
const tamper2=E.importGame(E.exportGame(s));
tamper2.table.realm.causalHistory.events.canal_bridge_compact.effects[0].continuity='Changed for free';
A.throws(()=>History.status(tamper2,{}),/altered/);
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-historical-causes-'));
try{
 const file=Path.join(dir,'save.json'),f=fresh();
 FS.writeFileSync(file,E.exportGame(f)+'\n');
 const before=FS.readFileSync(file,'utf8');
 const q=Turn.execute(file,{id:'history_read_0001',mode:'rule',
  system:'world',operation:'historyStatus',params:{}});
 A.equal(q.ok,true);A.equal(q.applied,false);
 A.equal(FS.readFileSync(file,'utf8'),before);
 const request={id:'history_write_0001',mode:'rule',system:'world',
  operation:'historyRecordEvent',params:{
   eventId:'older_ferry_compact',era:'Ferry Compact Renewal',period:'Before the present',
   account:'A previous generation renewed witness duties around the ferry trade.',
   basis:'An established GM-authored historic civic event in Morrowfen.',
   causes:['estuary_wars'],scopeType:'region',scopeId:'morrowfen_basin'}};
 A.equal(Turn.execute(file,request).applied,true);
 const after=FS.readFileSync(file,'utf8');
 A.equal(Turn.execute(file,request).duplicate,true);
 A.equal(FS.readFileSync(file,'utf8'),after);
 A.equal(E.importGame(after).table.realm.causalHistory.events.older_ferry_compact.id,'older_ferry_compact');
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('Historical causality: original Atlas eras, GM-authored source-linked events, conflicting accounts, enduring present-day influences, hidden causes, immutable origin and exact save replay.');
