'use strict';
// Foundation #18: real open-ended proposals acquire independently changing
// personal views without inventing a fixed faction roster, legal votes,
// treasury authority, compulsion or new political rolls.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),W=require('../rules/world'),
 G=require('../world/emergent-groups'),Agency=require('../world/group-member-agency');
const names={name:'Independent River Crossing Neighbours',
 kind:'informal freeform independent mutual aid association',
 purpose:'Share honestly observed river crossing and flood-safety information without claiming authority over independent residents'};
const proposal='The members should consider careful local river-crossing records and safer practical observation of the actual wetland banks without compulsory work or restrictions on other people.';
const witness='In a genuine physical meeting a previously consenting member hears this specific river safety proposal and independently considers support, dissent or uncertainty, without any obligation to act.';
const reason='The named member has heard new practical discussion of wetland crossing needs, local pressures and the association\'s actual record of success or failure; their view is their own.';
const conversation='A witnessed voluntary conversation at Morrowfen Crossing with the same independently present member; no other person is represented and no power or treasury permission is offered.';
const inviteText='Would you freely join this neighbours group to compare real crossing observations? You may disagree, withdraw, and keep every other personal obligation.';
function seedFor(predicate){
 for(let i=1;i<100000;i++){
  const v={rngState:i};
  if(predicate(Agency.draw(v)))return i;
 }
 throw Error('Could not find legitimate independent test draw');
}
const s=E.newGame({seed:998901,name:'Living Views Disposable Campaign',path:'undecided'});
const formed=R.act(s,{system:'social',operation:'formGroup',params:names});
const w=s.table.realm,e=G.lookup(w,formed.id),agency=Agency.ensure(w);
A.ok(e);
for(const npcId of ['elira','otto']){
 agency.rngState=seedFor(x=>x<.001);
 const response=R.act(s,{system:'social',operation:'inviteGroupMember',
  params:{groupId:e.id,npcId,proposal:inviteText}});
 A.equal(response.decision,'accepted');
}
A.equal(e.members,3);
agency.rngState=seedFor(x=>x<.001);
const day=w.lastTickDay;
const approved=G.deliberateInternalPriority(w,{
 id:'community-priority-open-river-01',groupId:e.id,
 memberActorId:'npc:elira',regionId:'morrowfen_basin',
 place:'crossing',day,proposal,budgetRequested:0,meetingWitness:witness});
A.equal(approved.outcome,'supported');
A.equal(G.validate(e),true);
const initial=G.internalPositionStatus(w,e.id);
A.equal(initial.length,1);
A.equal(initial[0].positions.length,1);
A.equal(initial[0].positions[0].stance,'supported');

function discussion(id,actor,atDay){
 return {id,groupId:e.id,priorityId:approved.id,
  memberActorId:actor,day:atDay,
  regionId:'morrowfen_basin',place:'crossing',
  reason,meetingWitness:conversation};
}
const p1=discussion('river-view-otto-first-0001','npc:otto',day);
const unchanged=E.exportGame(s),originalCoins=s.player.coins,
 originalMemberRng=agency.rngState,originalWorldRng=w.emergentGroups.rngState;
A.throws(()=>G.considerInternalPosition(w,{...p1,stance:'supported'}),
 /cannot be dictated/);
A.throws(()=>G.considerInternalPosition(w,{...p1,place:'ruins'}),
 /later, witnessed local conversation/);
A.throws(()=>G.considerInternalPosition(w,{...p1,memberActorId:'npc:imaginary'}),
 /later, witnessed local conversation/);
A.equal(E.exportGame(s),unchanged);
A.equal(agency.rngState,originalMemberRng);
agency.rngState=seedFor(x=>x>.40&&x<.45);
const contested=G.considerInternalPosition(w,p1);
A.equal(contested.stance,'dissented',
 'A second genuinely consenting member can independently disagree at the first meeting');
A.equal(contested.previousStance,'unrecorded');
A.equal(contested.noGroupMandate,true);
A.equal(e.members,3);
A.equal(e.funds,0);
A.equal(s.player.coins,originalCoins);
A.equal(w.emergentGroups.rngState,originalWorldRng);
A.equal(G.validate(e),true);
const snapshot=E.exportGame(s),afterDraw=agency.rngState;
A.throws(()=>G.considerInternalPosition(w,{
 ...p1,id:'different-id-same-question-0002'}),
 /later, witnessed local conversation/);
A.throws(()=>G.considerInternalPosition(w,
 discussion('river-same-day-author-reroll-0001','npc:elira',day)),
 /later, witnessed local conversation/);
A.equal(E.exportGame(s),snapshot);
A.equal(agency.rngState,afterDraw);
W.advance(s,6); // Original sixday tick progresses the recorded realm day; no automatic NPC vote.
const next=w.lastTickDay;
A.ok(next>day);
agency.rngState=seedFor(x=>x>.999);
const reconsidered=G.considerInternalPosition(w,
 discussion('river-elira-reconsider-0001','npc:elira',next));
A.equal(reconsidered.previousStance,'supported');
A.equal(reconsidered.stance,'undecided');
agency.rngState=seedFor(x=>x<.001);
const revised=G.considerInternalPosition(w,
 discussion('river-otto-reconsider-0001','npc:otto',next));
A.equal(revised.previousStance,'dissented');
A.equal(revised.stance,'supported');
A.equal(e.internalPriorities[0].outcome,'supported',
 'Original distinct personal historical answers cannot be rewritten');
const evolving=G.internalPositionStatus(w,e.id);
const people=Object.fromEntries(evolving[0].positions.map(x=>[x.memberActorId,x]));
A.equal(people['npc:elira'].stance,'undecided');
A.equal(people['npc:otto'].stance,'supported');
A.equal(people['npc:otto'].historyCount,2);
A.equal(people['npc:otto'].memberStillParticipating,true);
A.equal(people['npc:otto'].historicalOpinionDoesNotConferMembership,true);
A.equal(evolving[0].noMajorityOrCompulsoryMandateInferred,true);
A.equal(G.internalPositionStatus(w,e.id,{day})[0].positions.find(x=>
 x.memberActorId==='npc:otto').stance,'dissented');
A.equal(G.validate(e),true);
const saved=E.exportGame(s),copy=E.importGame(saved);
A.equal(G.validate(G.lookup(copy.table.realm,e.id)),true);
A.deepEqual(G.internalPositionStatus(copy.table.realm,e.id),evolving);
A.equal(E.exportGame(copy),saved);
const originalHash=e.internalPositions.at(-1).sourceHash;
e.internalPositions.at(-1).source.previousStance='supported';
A.equal(G.validate(e),false,
 'Changing a previously dissented source into a counterfeit mandate must fail');
A.equal(e.internalPositions.at(-1).sourceHash,originalHash);
console.log('Original living association priorities: multiple witnessed real individuals can disagree, reconsider and become undecided over elapsed days; original evidence, independent RNG, funds, labour, membership, save replay and history remain consistent');
