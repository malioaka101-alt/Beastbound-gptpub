'use strict';
// Genuine local conversation tests use only disposable states and saves.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),P=require('../panels.js'),Turn=require('../scripts/chat-turn.js');
const npc=(s,operation,params={})=>R.act(s,{system:'npc',operation,params});
const fresh=()=>E.newGame({name:'Witnessed Conversation Fixture',seed:734421,path:'undecided'});
{
 const s=fresh(),before=E.exportGame(s),rng=s.rngState;
 A.deepEqual(npc(s,'status'),{knownConversations:[]});
 for(const invalid of [
   {npcId:'nobody'}, {npcId:'sera'}, {npcId:'elira',freeTrust:100},
   {npcId:'elira',quote:'I owe you one hundred coins'},
   {npcId:'elira',claim:'The council already approved my contract'}]){
  const pattern=invalid.npcId==='nobody'?/real, established local character/:
   invalid.npcId==='sera'?/not independently established as present/:
   /accepts only a real local person and optional open question/;
  A.throws(()=>npc(s,'converse',invalid),pattern);
  A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 }
 s.encounter={beastId:'unresolved'};
 A.throws(()=>npc(s,'converse',{npcId:'elira'}),/Resolve active combat/);
 s.encounter=null;
 A.equal(E.exportGame(s),before);
 const raw=s.rngState;
 const greeting=npc(s,'converse',{npcId:'elira'});
 A.equal(greeting.met,true);
 A.equal(greeting.npcId,'elira');A.equal(greeting.elapsedMinutes,12);
 A.equal(greeting.noRoll,true);
 A.equal(s.rngState,raw);
 A.equal(s.world.minutes,8*60+12);
 A.equal(s.npcMemory['Elira Moss'],1);
 A.equal(s.npcKnowledge['Elira Moss'][0].fact,E.NPCS.elira.topic);
 A.equal(npc(s,'status').knownConversations[0].heard,E.NPCS.elira.topic);
 A.equal(npc(s,'status').knownConversations[0].source,
  'Direct in-person professional conversation with Elira Moss at Morrowfen Crossing');
 const event=s.log.at(-1),record=s.table.npcConversations.records.at(-1);
 A.equal(event.details.origin,'engine-local-npc-conversation');
 A.equal(event.details.npcId,'elira');
 A.equal(record.eventHash.length,64);
 A.equal(record.heard,E.NPCS.elira.topic);
 A.equal(P.full(s,'people').split('\n').every(x=>Array.from(x).length===34),true);
 A.match(P.full(s,'people'),/CONVERSATIONS/);
 A.match(P.full(s,'people'),/Elira Moss/);
 const snap=E.exportGame(s);
 const again=npc(s,'converse',{npcId:'elira'});
 A.equal(again.alreadyMetToday,true);A.equal(again.elapsedMinutes,0);
 A.equal(E.exportGame(s),snap);A.equal(s.rngState,raw);
 const second=npc(s,'converse',{npcId:'otto'});
 A.equal(second.name,'Orrin Vale');
 A.equal(s.npcMemory['Elira Moss'],1);
 A.equal(s.npcMemory['Orrin Vale'],1);
 A.equal(npc(s,'status').knownConversations.length,2);
}
{
 // Fixed daytime professionals cannot truthfully be described as on duty
 // through the night. This is source-consistent with the actual conversation
 // operation's existing 08:00-18:00 working window.
 const s=fresh();
 const read=()=>R.act(s,{system:'social',operation:'localPeopleStatus',params:{}});
 A.ok(read().people.some(p=>p.name==='Elira Moss'));
 s.world.minutes=22*60;
 const before=E.exportGame(s),rng=s.rngState;
 A.ok(!read().people.some(p=>p.name==='Elira Moss'));
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=fresh(),rng=s.rngState;
 s.world.minutes=20*60;
 const original=E.exportGame(s);
 A.throws(()=>npc(s,'converse',{npcId:'elira'}),/not independently available at this scene and time/);
 A.equal(E.exportGame(s),original);A.equal(s.rngState,rng);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-npc-convo-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(fresh())+'\n');
  const baseline=FS.readFileSync(file,'utf8');
  for(const [id,action,pattern] of [
    ['npc_wrong_00001','talk',/Name the specific person/],
    ['npc_wrong_00002','talk to nobody',/single established NPC name/],
    ['npc_wrong_00003','talk to Professor Sera',/not independently established as present/],
    ['npc_wrong_00004','talk to Elira Moss and demand a fake reward',/single established NPC name/]]){
   A.throws(()=>Turn.execute(file,{id,mode:'act',action}),pattern);
   A.equal(FS.readFileSync(file,'utf8'),baseline);
  }
  const req={id:'npc_real_00001',mode:'act',action:'Talk to Elira Moss'};
  const first=Turn.execute(file,req);
  A.equal(first.applied,true);A.equal(first.output.npc.npcId,'elira');
  A.equal(first.output.npc.noInventedPromise,true);
  A.equal(Turn.execute(file,req).duplicate,true);
  const played=FS.readFileSync(file,'utf8'),state=E.importGame(played);
  A.equal(state.npcMemory['Elira Moss'],1);
  A.equal(state.table.npcConversations.records.length,1);
  const raw=state.rngState;
  const known=Turn.execute(file,{id:'npc_status_00001',mode:'rule',system:'npc',
   operation:'status',params:{}});
  A.equal(known.applied,false);
  A.equal(known.output.rules.knownConversations.length,1);
  A.equal(FS.readFileSync(file,'utf8'),played);
  const repeat=Turn.execute(file,{id:'npc_repeat_00001',mode:'act',action:'talk Elira'});
  A.equal(repeat.applied,false);A.equal(repeat.output.npc.alreadyMetToday,true);
  A.equal(FS.readFileSync(file,'utf8'),played);
  const second=Turn.execute(file,{id:'npc_real_00002',mode:'act',action:'talk to Orrin Vale'});
  A.equal(second.applied,true);A.equal(second.output.npc.name,'Orrin Vale');
  A.equal(E.importGame(FS.readFileSync(file,'utf8')).rngState,raw);
  A.equal(E.importGame(FS.readFileSync(file,'utf8')).table.npcConversations.records.length,2);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
{
 // Natural questions must resolve the actual named speaker, not interpret
 // "about the reeds" as part of an NPC's name or fabricate a novel reply.
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-topic-talk-'));
 try{
  const file=Path.join(dir,'saved.json'),s=fresh();
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const req={id:'npc_topic_00001',mode:'act',
   action:'Talk to Elira Moss about the reeds'};
  const out=Turn.execute(file,req);
  A.equal(out.applied,true);
  A.equal(out.output.npc.npcId,'elira');
  A.match(out.output.message,/do not establish an answer/);
  A.equal(out.output.npc.answerKind,'unverified');
  A.match(out.output.message,/about the reeds/);
  A.equal(out.output.npc.spoken,null);
  const saved=FS.readFileSync(file,'utf8'),t=E.importGame(saved);
  A.equal(t.table.npcConversations.records.length,1);
  A.equal(t.table.npcConversations.records[0].heard,null);
  A.equal(t.table.npcConversations.records[0].question,'the reeds');
  A.equal(t.rngState,s.rngState);
  A.equal(t.world.minutes,s.world.minutes+12);
  A.equal(Turn.execute(file,req).duplicate,true);
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Local witnessed NPC talks preserve named speaker, profession, dialogue, time and private player knowledge');
