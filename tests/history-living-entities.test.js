'use strict';
// Integration proof: the ORIGINAL causal-history engine may refer to actual
// GM-founded places, living citizens, and self-declared associations without
// creating another history store or giving those actors fabricated rights.
const A=require('node:assert/strict'),E=require('../engine'),
 New=require('../scripts/new-campaign'),Rules=require('../rules'),
 History=require('../world/causal-history'),World=require('../world/simulation'),
 People=require('../world/emergent-people'),Groups=require('../world/emergent-groups'),
 Places=require('../world/lived-places'),Turn=require('../scripts/chat-turn'),
 FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const s=New.create({seed:4820105,slug:'living_history_entities_test',mode:'gm',age:24,
 gmOpening:{locationId:'crossing',
 scene:'Talia Marren is visible beside the river path, comparing old ferry markers near the crossing.',
 focus:'Historical changes at the river path',weather:'cool clear morning',
 hour:10,minute:5}}).state;
const rule=(system,operation,params={})=>Rules.act(s,{system,operation,params});
const resident=rule('social','introduceWitnessedPerson',{
 name:'Talia Marren',profession:'Independent river-route surveyor',
 purpose:'Study bridge markers and record the river settlements changing across generations.',
 personality:'Observant, deliberate, and protective of the accuracy of local accounts.',
 background:'A roaming worker who surveys waterways and collects civic oral histories without holding public office.',
 witness:'The GM directly witnessed Talia Marren examining old markers while the player stood beside the crossing.'});
const residentId=resident.npcId;
A.ok(residentId.startsWith('emergent:person_'));
const created=rule('world','establishPlace',{
 placeId:'river_watch_hamlet',name:'River Watch Hamlet',regionId:'morrowfen_basin',
 kind:'small settled hamlet',sceneType:'settlement',
 description:'A cluster of occupied riverside homes and an ordinary repaired footbridge overlooking a shallow ford.',
 culture:'Local residents compare remembered floods and volunteer to check damaged bank markers.'});
A.equal(created.established,true);
const group=rule('social','formGroup',{
 name:'River Lantern Local History Circle',kind:'self-declared civic study association',
 purpose:'Preserve the changing river ferry records and share truthful public notices without claiming a school charter.'});
const groupId=group.id,w=s.table.realm,person=w.emergentPeople.people[residentId.slice('emergent:'.length)],
 g=Groups.lookup(w,groupId),place=Places.get(s,'river_watch_hamlet');
A.ok(g&&place&&People.verify(w,person));
A.equal(g.funds,0,'The authored group has no invented treasury');
A.equal(person.cashScales,0,'The authored person has no invented income');
// An arbitrary guessed ID cannot query private records through history
// before any genuinely public historical source identifies that subject.
for(const [type,id] of [
 ['person',residentId],['group',groupId],['place',place.id]]){
 const unknown=rule('world','historyStatus',{targetType:type,targetId:id});
 A.equal(unknown.known,false);
 A.equal(unknown.name,undefined);
 A.deepEqual(unknown.effects,[]);
 const nonexistent=rule('world','historyStatus',{
  targetType:type,targetId:type==='person'?'emergent:person_99999':
   type==='group'?'association_not_real':'unknown_unfounded_place'});
 A.deepEqual(nonexistent,
  {targetType:type,targetId:nonexistent.targetId,known:false,effects:[]},
  'A nonexistent and a currently unpublished GM subject reveal the same amount');
}
const beforeCoins=s.player.coins,beforeRng=s.rngState,beforeMinutes=s.world.minutes;
const event={
 eventId:'river_path_inspection_remembered',
 era:'Living River Records',period:'The present generation',
 account:'A changing oral history of the crossing and its neighbouring settled river path.',
 basis:'The GM has established a real person and an actual known region without promising wages or legal effects.',
 scopeType:'person',scopeId:residentId,visibility:'public'};
A.equal(rule('world','historyRecordEvent',event).recorded,true);
const source=w.causalHistory.events[event.eventId];
A.equal(source.scopeOriginHash,person.originHash);
A.equal(History.validate(w.causalHistory,w),true);
const impacts=[
 {effectId:'hamlet_repair_notice',targetType:'place',targetId:place.id,
  dimension:'local-history',change:'The visible footbridge is remembered in an ordinary public account of river repairs.',
  continuity:'Local residents can refer to the record without acquiring new buildings or resources.',
  basis:'The original scene-established place was founded with verifiable location and place-source witnesses.'},
 {effectId:'local_study_account',targetType:'group',targetId:groupId,
  dimension:'public-memory',change:'The voluntary circle is named in the local history of changing ferry practices.',
  continuity:'The circle remains a self-declared association without automatic government or school standing.',
  basis:'The exact player-founded association and original voluntary declaration were already recorded.'},
 {effectId:'surveyor_account',targetType:'person',targetId:residentId,
  dimension:'personal-history',change:'Talia Marren is associated with remembered survey discussions at the crossing.',
  continuity:'Her personal livelihood, independent presence and consent remain subject to her own records.',
  basis:'The original witnessed civilian identity and source-bound independent-life history already exist.'}
];
for(const p of impacts){
 const result=rule('world','historyEffect',{eventId:event.eventId,...p});
 A.equal(result.recorded,true);A.equal(result.recordedContextOnly,true);
}
const [placeEffect,groupEffect,personEffect]=w.causalHistory.events[event.eventId].effects;
A.equal(placeEffect.targetOriginHash,place.foundingHash);
A.equal(groupEffect.targetOriginHash,g.originHash);
A.equal(personEffect.targetOriginHash,person.originHash);
for(const [type,id,name] of [
 ['place',place.id,place.name],['group',groupId,g.charter.name],
 ['person',residentId,person.name]]){
 const report=rule('world','historyStatus',{targetType:type,targetId:id});
 A.equal(report.name,name);
 A.equal(report.effects.length,1);
 A.equal(report.effects[0].eventId,event.eventId);
}
A.equal(History.validate(w.causalHistory,w),true);
A.equal(s.player.coins,beforeCoins);
A.equal(s.rngState,beforeRng);
A.equal(s.world.minutes,beforeMinutes);
A.equal(s.player.partnerIds.length,0);
// A new *association* does not become an Atlas institution or accredited
// school merely because a historical account talks about its work.
const unchanged=E.exportGame(s);
A.throws(()=>rule('world','historyEffect',{eventId:event.eventId,
 ...impacts[1],effectId:'fictitious_academy_license',
 targetType:'institution'}),/real existing/);
A.equal(E.exportGame(s),unchanged);
for(const [type,id] of [
 ['person','emergent:person_99999'],['place','not_registered_place'],
 ['group','association_not_real']]){
 A.throws(()=>rule('world','historyEffect',{eventId:event.eventId,
  ...impacts[0],effectId:'fabricated_'+type,targetType:type,targetId:id}),
  /real existing/);
 A.equal(E.exportGame(s),unchanged);
}
// Independent world changes do not erase history because a worker travels
// or an unfunded association becomes inactive.
const saved=E.importGame(E.exportGame(s));
const w2=saved.table.realm;
A.equal(History.validate(w2.causalHistory,w2),true);
for(const field of ['person','group','place']){
 const altered=E.importGame(E.exportGame(saved)),ww=altered.table.realm;
 if(field==='person')ww.emergentPeople.people[person.id].birthSource.name='A forged replacement';
 if(field==='group')ww.emergentGroups.entries[groupId].originHash='invalid';
 if(field==='place')ww.livedPlaces.places[place.id].founding.name='A falsified hamlet';
 A.throws(()=>History.status(altered,{targetType:'region',targetId:'morrowfen_basin'}),
  /historical|altered|saved|invalid|source/i,
  'A broken founding source cannot be accepted as a historical subject');
}
// Original preset influences and older saves retain exactly their original
// existing Atlas resolver and seed behaviour.
A.ok(rule('world','historyStatus',{targetType:'region',targetId:'morrowfen_basin'})
 .effects.some(x=>x.eventId==='estuary_wars'));
const untouched=E.newGame({name:'Legacy History Test',seed:129443});
A.equal(History.validate(History.seed()),true);
A.equal(History.status(untouched,{targetType:'region',targetId:'morrowfen_basin'}).effects.length,1);
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-living-history-'));
try{
 const path=Path.join(dir,'save.json');
 FS.writeFileSync(path,E.exportGame(saved)+'\n');
 const body=FS.readFileSync(path,'utf8');
 const view=Turn.execute(path,{id:'living_history_view_0001',mode:'rule',
  system:'world',operation:'historyStatus',
  params:{targetType:'group',targetId:groupId}});
 A.equal(view.applied,false);A.equal(view.output.rules.effects.length,1);
 A.equal(FS.readFileSync(path,'utf8'),body);
 const request={id:'living_history_next_0001',mode:'rule',
  system:'world',operation:'historyRecordEvent',params:{
   eventId:'river_record_followup',
   era:'Continuing River Accounts',period:'A later conversation',
   account:'Local witnesses spoke of their continuing attempts to repair and explain earlier ferry markers.',
   basis:'A new original GM historical source with the same established organisation as its subject.',
   scopeType:'group',scopeId:groupId,causes:[event.eventId]}};
 const done=Turn.execute(path,request);
 A.equal(done.applied,true);
 const committed=FS.readFileSync(path,'utf8');
 A.equal(Turn.execute(path,request).duplicate,true);
 A.equal(FS.readFileSync(path,'utf8'),committed);
 const latest=E.importGame(committed),h=latest.table.realm.causalHistory;
 A.equal(History.validate(h,latest.table.realm),true);
 A.equal(h.events.river_record_followup.scopeOriginHash,g.originHash);
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('Original historical causality recognises witnessed living people, saved GM locations and voluntary associations with immutable founding references, authentic source checks and no free institution, money, rights, rolls or powers');
