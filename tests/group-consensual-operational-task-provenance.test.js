'use strict';
// #18 open-ended operational instructions preserve ORIGINAL member
// agency, real presence, time and natural monthly voluntary work.
// A request is never a conscription, payment, or extra work check.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 W=require('../rules/world'),G=require('../world/emergent-groups'),
 Agency=require('../world/group-member-agency'),
 Turn=require('../scripts/chat-turn.js');
const act=(s,operation,params={})=>R.act(s,{system:'social',operation,params});
const fresh=seed=>E.newGame({seed,name:'Disposable Voluntary Member Task',path:'undecided'});
const charter={name:'Open Source River Safety Circle',
 kind:'informal member-led cooperative safety group',
 purpose:'Share genuinely witnessed river observations with willing travellers without compulsory work, exclusive mandates or beast exploitation'};
const invite='Please join our open river safety group as a voluntary individual, free to decline requests and to leave without a mandatory wage or office.';
const task='If you freely choose, survey the accessible river path and record practical safety observations for neighbouring travellers without any forced commitment.';
const pickDraw=test=>{
 for(let n=1;n<200000;n++){
  const t={rngState:n};
  if(test(Agency.draw(t)))return n;
 }
 throw Error('No deterministic original person-agency seed');
};
function founded(seed){
 const s=fresh(seed),f=act(s,'formGroup',charter),
  w=s.table.realm,e=G.lookup(w,f.id),
  t=Agency.ensure(w);
 t.rngState=pickDraw(x=>x<.005);
 const member=act(s,'inviteGroupMember',{groupId:e.id,npcId:'elira',proposal:invite});
 A.equal(member.decision,'accepted');
 A.equal(member.joined,true);
 A.equal(e.members,2);
 return {s,w,e,t};
}
{
 const {s,w,e,t}=founded(997110),funds=e.funds,
  coins=s.player.coins,minutes=s.world.minutes;
 let invalid=E.exportGame(s);
 A.throws(()=>act(s,'groupTaskRequest',{
  groupId:e.id,npcId:'elira',task,untilDay:-1}),/real nonretroactive/);
 A.throws(()=>act(s,'groupTaskRequest',{
  groupId:e.id,npcId:'elira',task,untilDay:30,decision:'accepted'}),
 /personal membership conversation accepts only/);
 A.equal(E.exportGame(s),invalid);
 const untilDay=Math.floor(minutes/1440)+70;
 t.rngState=pickDraw(x=>x<.001);
 const asked=act(s,'groupTaskRequest',{
  groupId:e.id,npcId:'elira',task,untilDay});
 A.equal(asked.decision,'accepted');
 A.equal(asked.noAutomaticWork,true);
 A.equal(asked.minutes,18);
 A.equal(s.world.minutes,minutes+18);
 A.equal(s.player.coins,coins);
 A.equal(e.funds,funds);
 A.equal(e.members,2);
 A.equal(e.voluntaryTasks.length,1);
 A.equal(e.taskServices.length,0);
 A.equal(G.validate(e),true);
 const source=e.voluntaryTasks[0].witness.details;
 A.equal(source.memberConsentHash,e.additionalMembers[0].hash);
 A.equal(source.draw<source.acceptChance,true);
 A.equal(source.noCompulsoryWork,true);
 A.equal(source.noNewWorkResult,true);
 let status=act(s,'groupTasksStatus',{groupId:e.id});
 A.equal(status.tasks.length,1);
 A.equal(status.tasks[0].status,'freely-accepted-not-guaranteed');
 A.equal(status.tasks[0].originalServiceHash,null);
 const saved=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'groupTaskRequest',{
  groupId:e.id,npcId:'elira',task:task+' again',untilDay}),
 /already considered/);
 A.equal(E.exportGame(s),saved);
 A.equal(s.rngState,rng);
 t.rngState=pickDraw(x=>x<.001);
 W.advance(s,30);
 A.equal(e.taskServices.length,1,
  'Only an actual original monthly member volunteer event satisfies a voluntary invitation');
 A.equal(e.taskServices[0].taskId,asked.taskId);
 const q=e.taskServices[0].source,work=q.originalWork;
 A.ok(['verified-volunteer-work','unsuccessful-volunteer-work'].includes(work.kind));
 A.equal(work.details.actualWorkMinutes,90);
 A.equal(work.details.voluntaryTaskId,asked.taskId);
 A.equal(work.details.voluntaryTaskWitnessHash,e.voluntaryTasks[0].witnessHash);
 A.equal(q.noSecondWorkOrPay,true);
 A.equal(e.memberServiceMinutes,90);
 A.equal(e.members,2);A.equal(e.funds,0);
 A.equal(s.player.coins,coins);
 A.equal(G.validate(e),true);
 status=act(s,'groupTasksStatus',{groupId:e.id});
 A.ok(['original-member-work-recorded-task-not-verified',
  'original-member-work-failed-task-not-verified'].includes(status.tasks[0].status));
 A.equal(status.tasks[0].specificTaskCompletionVerified,false,
  'A real general volunteer-work result does not prove completion of the exact proposed task');
 A.equal(e.taskServices[0].source.taskSpecificCompletionNotEstablished,true);
 A.equal(status.tasks[0].originalMinutes,90);
 A.equal(G.eligibleVoluntaryTask(e,e.additionalMembers[0].actorId,w.lastTickDay),null);
 const before=E.exportGame(s),clone=E.importGame(before);
 A.equal(E.exportGame(clone),before);
 A.deepEqual(act(clone,'groupTasksStatus',{groupId:e.id}),status);
 W.advance(s,30);
 A.equal(e.taskServices.length,1,'One original member service cannot be double-attributed');
 A.equal(G.validate(e),true);
 const evidenceHash=e.taskServices[0].sourceHash;
 e.taskServices[0].source.originalWork.details.actualWorkMinutes=9999;
 A.equal(G.validate(e),false);
 A.equal(e.taskServices[0].sourceHash,evidenceHash);
}
{
 const {s,w,e,t}=founded(997114);
 t.rngState=pickDraw(x=>x<.001);
 const expected=act(s,'groupTaskRequest',{groupId:e.id,npcId:'elira',
  task,untilDay:Math.floor(s.world.minutes/1440)+60});
 A.equal(expected.decision,'accepted');
 const beforeWork=e.memberServiceMinutes||0,
  coins=s.player.coins,bank=e.funds;
 // A real independent member can still decline to volunteer this month,
 // despite accepting a prior request. NO fictional duty or completion.
 t.rngState=pickDraw(x=>x>.99);
 W.advance(s,30);
 A.equal(e.memberServiceMinutes||0,beforeWork);
 A.equal(e.taskServices.length,0);
 A.equal(act(s,'groupTasksStatus',{groupId:e.id}).tasks[0].status,
  'freely-accepted-not-guaranteed');
 A.equal(e.funds,bank);
 A.equal(s.player.coins,coins);
 A.equal(G.validate(e),true);
}
{
 const {s,w,e,t}=founded(997115);
 t.rngState=pickDraw(x=>x<.001);
 act(s,'groupTaskRequest',{groupId:e.id,npcId:'elira',
  task,untilDay:Math.floor(s.world.minutes/1440)+35});
 // A fabricated remote location is NOT a real local social witness.
 // The read-only private member task view must not leak its contents.
 const actualPlace=s.world.location;
 s.world.location='unsupported_remote_mandate';
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'groupTasksStatus',{groupId:e.id}),
  /Only the actual local founder/);
 A.equal(E.exportGame(s),before);
 A.equal(s.rngState,rng);
 s.world.location=actualPlace;
 A.equal(act(s,'groupTasksStatus',{groupId:e.id}).tasks.length,1);
}
{
 const {s,w,e,t}=founded(997111);
 t.rngState=pickDraw(x=>x>.96);
 const day=Math.floor(s.world.minutes/1440);
 const response=act(s,'groupTaskRequest',{groupId:e.id,npcId:'elira',
  task,untilDay:day+90});
 A.equal(response.decision,'declined');
 A.equal(e.voluntaryTasks[0].decision,'declined');
 A.equal(G.eligibleVoluntaryTask(e,'npc:elira',day+31),null);
 t.rngState=pickDraw(x=>x<.001);
 W.advance(s,30);
 A.equal(e.taskServices.length,0,
  'An original monthly independent volunteer does not imply an older declined request became accepted');
 A.equal(G.validate(e),true);
}
{
 const {s,w,e,t}=founded(997112),day=Math.floor(s.world.minutes/1440);
 t.rngState=pickDraw(x=>x<.001);
 const response=act(s,'groupTaskRequest',{
  groupId:e.id,npcId:'elira',task,untilDay:day});
 A.equal(response.decision,'accepted');
 A.equal(G.eligibleVoluntaryTask(e,'npc:elira',day+30),null);
 t.rngState=pickDraw(x=>x<.001);
 W.advance(s,30);
 A.equal(e.taskServices.length,0,
  'Expired requests are never interpreted as obligatory task outcomes');
 A.equal(G.validate(e),true);
}
{
 const {s,w,e,t}=founded(997113);
 t.rngState=pickDraw(x=>x<.001);
 act(s,'groupTaskRequest',{groupId:e.id,npcId:'elira',task,
  untilDay:Math.floor(s.world.minutes/1440)+45});
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-member-task-'));
 try{
  const file=Path.join(dir,'person.json'),original=E.exportGame(s)+'\n';
  FS.writeFileSync(file,original);
  const read=Turn.execute(file,{id:'group_task_status_001',
   mode:'rule',system:'social',operation:'groupTasksStatus',
   params:{groupId:e.id}});
  A.equal(read.applied,false);
  A.equal(read.output.rules.tasks.length,1);
  A.equal(FS.readFileSync(file,'utf8'),original);
  A.throws(()=>Turn.execute(file,{id:'group_task_fake_001',
   mode:'rule',system:'social',operation:'groupTasksStatus',
   params:{groupId:e.id,forceAccepted:true}}),
  /personal membership conversation accepts only/);
  A.equal(FS.readFileSync(file,'utf8'),original);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Open original-world member tasks: witnessed founder request, independently consenting/refusing real members, genuine natural monthly general volunteer work WITHOUT invented specific task completion, expiry, no double-roll or money, durable save evidence and read-only status');
