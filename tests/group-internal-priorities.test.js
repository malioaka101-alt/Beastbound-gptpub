'use strict';
// The first #18 organisation-depth connection: actual existing volunteer
// associations, genuine individually consenting NPCs, one original member
// agency choice, and a sourced internal proposal (not a public office).
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),G=require('../world/emergent-groups'),
 Agency=require('../world/group-member-agency');
const names={name:'Independent River Learning Circle',
 kind:'ordinary voluntary cooperative and local civic association',
 purpose:'Share witnessed river safety knowledge and support community research without compulsory service'};
const proposal='Consider a practical safe-crossing record and better shelter notes informed by the actual local environmental pressure rather than claiming a monopoly.';
const witness='In the genuine local meeting, the founder presented the recorded physical river-path need to a personally consenting independent participant, explicitly inviting support or disagreement without inventing the participant choice.';
function rngFor(predicate){
 for(let i=1;i<100000;i++){
  const t={rngState:i},x=Agency.draw(t);
  if(predicate(x))return i;
 }
 throw Error('Could not source an independent deterministic participant decision');
}
function fixture(seed,reviewSeed){
 const s=E.newGame({seed,name:'Organisation Internal Priority Test',path:'undecided'});
 const form=R.act(s,{system:'social',operation:'formGroup',params:names});
 A.equal(form.formed,true);
 const w=s.table.realm,e=G.lookup(w,form.id);
 A.ok(e);
 A.equal(e.members,1);
 const t=Agency.ensure(w);
 t.rngState=rngFor(x=>x<.001);
 const invitation=R.act(s,{system:'social',operation:'inviteGroupMember',
  params:{groupId:e.id,npcId:'elira',
   proposal:'Please join this strictly voluntary circle to share already personally observed safety notes with full independence.'}});
 A.equal(invitation.decision,'accepted');
 A.equal(e.members,2);
 A.equal(e.additionalMembers[0].active,true);
 const contribute=R.act(s,{system:'social',operation:'groupContribute',
  params:{groupId:e.id,activity:'Contribute actual modest resources toward reviewing the existing river-route reports.',coins:5}});
 A.equal(contribute.workRecorded,true);
 A.equal(e.funds,5);
 A.equal(G.validate(e),true);
 const day=w.lastTickDay,groupFund=e.funds,memberHash=e.additionalMembers[0].hash;
 const originalPlayerRoll=s.rngState,originalMoney=s.player.coins;
 t.rngState=rngFor(reviewSeed);
 return {s,w,e,t,day,groupFund,memberHash,originalPlayerRoll,originalMoney};
}
function reviewParams(x){
 return {id:'proposed-community-priority-0001',
  groupId:x.e.id,memberActorId:'npc:elira',
  regionId:'morrowfen_basin',place:'crossing',day:x.day,
  proposal,budgetRequested:2,meetingWitness:witness};
}
for(const [seed,accepted] of [[986101,true],[986102,false]]){
 const x=fixture(seed,accepted?draw=>draw<.01:draw=>draw>.99);
 const before=E.exportGame(x.s),oldNpc=x.t.rngState;
 A.throws(()=>G.deliberateInternalPriority(x.w,{
  ...reviewParams(x),supported:true,legalAuthority:'public ministry'}),
  /cannot be ordered/);
 A.equal(x.t.rngState,oldNpc);
 A.equal(E.exportGame(x.s),before);
 A.throws(()=>G.deliberateInternalPriority(x.w,{
  ...reviewParams(x),budgetRequested:100000}),
  /witnessed real local member/);
 A.equal(x.t.rngState,oldNpc);
 A.equal(E.exportGame(x.s),before);
 const originalGroupRng=x.w.emergentGroups.rngState;
 const result=G.deliberateInternalPriority(x.w,reviewParams(x));
 A.equal(result.outcome,accepted?'supported':'dissented');
 A.equal(result.budgetActuallySpent,0);
 A.equal(x.e.funds,x.groupFund,
  'An advisory decision cannot fabricate a financial transfer or complete work');
 A.equal(x.e.members,2,'The first independent reviewer cannot compel another participant');
 A.equal(x.e.additionalMembers[0].hash,x.memberHash);
 A.equal(x.s.rngState,x.originalPlayerRoll);
 A.equal(x.s.player.coins,x.originalMoney);
 A.equal(x.w.emergentGroups.rngState,originalGroupRng,
  'Member decision used the existing individual-association agency, not second group progress dice');
 A.equal(G.validate(x.e),true);
 const visible=G.internalPriorityStatus(x.w,x.e.id);
 A.equal(visible.length,1);
 A.equal(visible[0].independentMemberResponse,result.outcome);
 A.equal(visible[0].budgetActuallySpent,0);
 A.equal(visible[0].noPublicOfficeGranted,true);
 A.throws(()=>G.deliberateInternalPriority(x.w,{
  ...reviewParams(x),id:'reroll-same-issue-0001'}),
  /distinct truthful issue/);
 const saved=E.exportGame(x.s),copy=E.importGame(saved);
 A.equal(G.validate(G.lookup(copy.table.realm,x.e.id)),true);
 A.deepEqual(G.internalPriorityStatus(copy.table.realm,x.e.id),visible);
 A.equal(E.exportGame(copy),saved);
 const proof=x.e.internalPriorities[0].sourceHash;
 x.e.internalPriorities[0].proposal='The member supposedly endorses unrestricted public rule.';
 A.equal(G.validate(x.e),false,
  'Cannot rewrite independent dissent into a political mandate');
 A.equal(x.e.internalPriorities[0].sourceHash,proof);
}
console.log('Original group internal governance: real independently accepted member, source-local proposal, independently supported/dissented review, bounded non-spending budget consideration, unforced membership, saved evidence and no public authority');
