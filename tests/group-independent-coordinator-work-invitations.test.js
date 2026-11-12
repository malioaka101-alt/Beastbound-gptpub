'use strict';
// #18: an actually consenting local coordinator may independently OFFER
// optional freeform work to another actually consenting member. The
// recipient also independently chooses. This uses the original group task
// ledger, original NPC agency RNG and original real scene time; it creates
// neither work nor compulsory political/economic authority.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Rules=require('../rules'),W=require('../rules/world'),
 Groups=require('../world/emergent-groups'),
 Agency=require('../world/group-member-agency');
const invite='Please freely join our original community circle for practical local observation, without any mandatory tasks or need to agree to every proposal.';
const scope='Organise optional shared river crossing surveys, report practical safety observations to consenting members and coordinate freely requested field notes without compulsory tasks.';
const opportunity='Voluntarily help compare witnessed river crossing surveys with original low-impact field observations and note practical safety limitations for neighbours.';
const meeting='The originally present local member listens to an open-ended operational coordination invitation, independently accepts or rejects it and assumes no legal office, salary or powers over others.';
const act=(s,operation,params)=>Rules.act(s,{system:'social',operation,params});
function seedOne(predicate){
 for(let i=1;i<100000;i++){
  const a={rngState:i},v=Agency.draw(a);
  if(predicate(v))return i;
 }
 throw Error('No original actor draw matched the test');
}
function seedTwo(predicate){
 for(let i=1;i<100000;i++){
  const a={rngState:i},first=Agency.draw(a),second=Agency.draw(a);
  if(predicate(first,second))return i;
 }
 throw Error('No original pair of separate actor choices matched the test');
}
function setup(seed,{acceptRole=true}={}){
 const s=E.newGame({seed,name:'Disposable Independent Operational Coordinator',path:'undecided'}),
  formed=act(s,'formGroup',{
   name:'Open Marsh Crossing Practical Observation Circle',
   kind:'voluntary local field study association',
   purpose:'Share original local evidence of ordinary river crossings and independent ecological concerns without ownership of others'
  }),w=s.table.realm,e=Groups.lookup(w,formed.id),
  agency=Agency.ensure(w);
 for(const id of ['elira','otto']){
  agency.rngState=seedOne(x=>x<.001);
  const answer=act(s,'inviteGroupMember',{
   groupId:e.id,npcId:id,proposal:invite});
  A.equal(answer.decision,'accepted');
  A.equal(answer.joined,true);
 }
 const day=w.lastTickDay,coins=s.player.coins,funds=e.funds,
  members=e.members,originalCharter=e.charter.duty;
 agency.rngState=seedOne(acceptRole?x=>x<.001:x=>x>.99);
 const role=Groups.offerCoordination(w,{
  id:'original-voluntary-coordinate-river-observation-01',
  groupId:e.id,memberActorId:'npc:elira',
  regionId:'morrowfen_basin',place:'crossing',
  startDay:day,untilDay:day+120,scope,meetingWitness:meeting});
 A.equal(role.agreed,acceptRole);
 A.equal(e.members,3);
 A.equal(Groups.validate(e),true);
 return {s,w,e,agency,role,day,coins,funds,members,originalCharter};
}
function ask(t,task=opportunity){
 return act(t.s,'coordinatorTaskRequest',{
  groupId:t.e.id,coordinatorNpcId:'elira',
  memberNpcId:'otto',task,untilDay:t.day+35});
}
{
 const t=setup(998921);
 const x={scopeOverlap:Math.min(4,Agency._debug.common(scope,opportunity)),
  groupStatusAtOffer:t.e.status,
  groupCompletedEfforts:t.e.completedEfforts,
  groupFailedEfforts:t.e.failedEfforts};
 const issuerChance=Groups.coordinatorTaskOfferChance(x),
  memberChance=Groups.voluntaryTaskChance(x);
 const saved=E.exportGame(t.s),beforeRng=t.agency.rngState,
  oldMinute=t.s.world.minutes,oldPlayerRng=t.s.rngState;
 A.throws(()=>act(t.s,'coordinatorTaskRequest',{
  groupId:t.e.id,coordinatorNpcId:'otto',
  memberNpcId:'elira',task:opportunity,untilDay:t.day+35}),
 /genuine currently serving voluntary coordinator/);
 A.throws(()=>act(t.s,'coordinatorTaskRequest',{
  groupId:t.e.id,coordinatorNpcId:'elira',
  memberNpcId:'unknown-person',task:opportunity,untilDay:t.day+35}),
 /genuine currently serving voluntary coordinator/);
 A.throws(()=>act(t.s,'coordinatorTaskRequest',{
  groupId:t.e.id,coordinatorNpcId:'elira',
  memberNpcId:'otto',task:opportunity,untilDay:t.day+35,
  forceMemberAgreement:true}),/accepts only|only the actual|cannot/);
 A.equal(E.exportGame(t.s),saved);
 A.equal(t.agency.rngState,beforeRng);
 t.agency.rngState=seedTwo((a,b)=>
  a<issuerChance&&b<memberChance);
 const result=ask(t);
 A.equal(result.issuerAgreed,true);
 A.equal(result.decision,'accepted');
 A.equal(result.memberAccepted,true);
 A.equal(result.noCompulsoryWork,true);
 A.equal(result.minutes,20);
 A.equal(t.s.world.minutes-oldMinute,20);
 A.equal(t.s.rngState,oldPlayerRng);
 A.equal(t.s.player.coins,t.coins);
 A.equal(t.e.funds,t.funds);
 A.equal(t.e.members,t.members);
 A.equal(t.e.charter.duty,t.originalCharter);
 const task=t.e.voluntaryTasks.at(-1);
 A.equal(task.origin,Groups.COORDINATOR_TASK);
 A.equal(task.witness.details.issuerActorId,'npc:elira');
 A.equal(task.witness.details.memberActorId,'npc:otto');
 A.equal(task.witness.details.mandateSourceHash,
  t.e.coordinationMandates[0].sourceHash);
 A.equal(task.witness.details.scopeOverlap,x.scopeOverlap);
 A.equal(Groups.verifyVoluntaryTask(t.e,task),true);
 A.equal(Groups.validate(t.e),true);
 A.equal(Groups.eligibleVoluntaryTask(t.e,'npc:otto',t.day),null,
  'a task suggestion never counts as completed work in the same instant');
 A.equal(Groups.eligibleVoluntaryTask(t.e,'npc:otto',t.day+1)?.id,task.id);
 const reported=act(t.s,'groupTasksStatus',{groupId:t.e.id});
 A.equal(reported.tasks.length,1);
 A.equal(reported.tasks[0].issuerActorId,'npc:elira');
 A.equal(reported.tasks[0].specificTaskCompletionVerified,false);
 const post=E.exportGame(t.s),decisionRng=t.agency.rngState;
 A.throws(()=>ask(t),/already considered/);
 A.equal(E.exportGame(t.s),post);
 A.equal(t.agency.rngState,decisionRng);
 const restored=E.importGame(post),
  copied=Groups.lookup(restored.table.realm,t.e.id);
 A.equal(E.exportGame(restored),post);
 A.equal(Groups.validate(copied),true);
 A.equal(copied.voluntaryTasks[0].origin,Groups.COORDINATOR_TASK);
 const original=structuredClone(task);
 task.witness.details.decision='declined';
 A.equal(Groups.validate(t.e),false);
 t.e.voluntaryTasks[0]=structuredClone(original);
 t.e.voluntaryTasks[0].witness.details.decision='declined';
 t.e.voluntaryTasks[0].decision='declined';
 t.e.voluntaryTasks[0].witnessHash=
  Groups.hash(t.e.voluntaryTasks[0].witness);
 A.equal(Groups.validate(t.e),false,
  're-sealing a dictated NPC answer fails original two-person RNG replay');
 t.e.voluntaryTasks[0]=original;
 A.equal(Groups.validate(t.e),true);
}
{
 const t=setup(998922);
 t.agency.rngState=seedOne(x=>x>.97);
 const before=t.s.world.minutes,coins=t.s.player.coins;
 const result=ask(t);
 A.equal(result.issuerAgreed,false,
  'previously accepting coordinator role never compels this specific request');
 A.equal(result.decision,'not-offered');
 A.equal(result.memberAccepted,false);
 A.equal(t.s.world.minutes-before,20);
 A.equal(t.e.voluntaryTasks[0].origin,Groups.COORDINATOR_TASK);
 A.equal(t.e.voluntaryTasks[0].witness.details.recipientDraw,null);
 A.equal(Groups.eligibleVoluntaryTask(t.e,'npc:otto',t.day+1),null);
 A.equal(t.s.player.coins,coins);
 A.equal(Groups.validate(t.e),true);
}
{
 const t=setup(998923);
 const context={scopeOverlap:Math.min(4,Agency._debug.common(scope,opportunity)),
  groupStatusAtOffer:t.e.status,
  groupCompletedEfforts:t.e.completedEfforts,
  groupFailedEfforts:t.e.failedEfforts};
 const issuer=Groups.coordinatorTaskOfferChance(context),
  recipient=Groups.voluntaryTaskChance(context);
 t.agency.rngState=seedTwo((x,y)=>
  x<issuer&&y>Math.min(.92,recipient+.25));
 const result=ask(t);
 A.equal(result.issuerAgreed,true);
 A.equal(result.decision,'declined');
 A.equal(result.memberAccepted,false);
 A.equal(Groups.eligibleVoluntaryTask(t.e,'npc:otto',t.day+1),null);
 A.equal(Groups.validate(t.e),true);
}
{
 const t=setup(998924,{acceptRole:false}),before=E.exportGame(t.s);
 A.throws(()=>ask(t),/genuine currently serving voluntary coordinator/);
 A.equal(E.exportGame(t.s),before,
  'an independently declined mandate cannot act as real authority');
 const accepted=setup(998925);
 W.advance(accepted.s,121);
 const old=E.exportGame(accepted.s),rng=accepted.agency.rngState;
 A.throws(()=>ask(accepted),/genuine currently serving voluntary coordinator/);
 A.equal(E.exportGame(accepted.s),old);
 A.equal(accepted.agency.rngState,rng);
}
console.log('Genuinely accepting optional coordinator may independently request original freeform work; recipient independently agrees or refuses, source-sealed two draws, real time, no compelled work/pay/titles, actual subsequent task eligibility and durable save PASS');
