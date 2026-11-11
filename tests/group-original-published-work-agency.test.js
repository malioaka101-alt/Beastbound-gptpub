'use strict';
// Foundation #18: independent existing member responses to ORIGINAL local,
// published association work. No invented contact, vote, group work or coins.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),W=require('../rules/world'),
 G=require('../world/emergent-groups'),Agency=require('../world/group-member-agency');
const names={name:'Source-Checked Crossing Cooperative',
 kind:'voluntary local observation society with members free to differ',
 purpose:'Collect independently witnessed river crossing safety records without assuming power over neighbours or protected beasts'};
const proposal='Consider real river route observations and safe crossing records for people who freely choose to use them, while leaving independent neighbours free to disagree.';
const meeting='A personally present independently consenting member discusses the genuine local river safety priority without allowing the founder to claim the member\'s answer.';
const invite='Please voluntarily take part in the crossing observations circle; your free choice is not an order and requires no exclusive allegiance.';
const activity='I personally attempt source-checked river route observations as voluntary group work, with no guarantee of success or forced participation.';
const seedDraw=predicate=>{
 for(let n=1;n<100000;n++){
  const t={rngState:n};
  if(predicate(Agency.draw(t)))return n;
 }
 throw Error('No deterministic independent member fixture');
};
function originalGroupSeed(predicate){
 for(let n=1;n<100000;n++){
  const t={rngState:n};
  let x=t.rngState>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
  const draw=((x>>>0)||0x4521d639)/4294967296;
  if(predicate(draw))return n;
 }
 throw Error('No original group outcome seed');
}
function run(seed,successful){
 const s=E.newGame({seed,name:'Disposable Published Group Work Agency',path:'undecided'}),
  formed=R.act(s,{system:'social',operation:'formGroup',params:names}),
  w=s.table.realm,g=G.lookup(w,formed.id),agency=Agency.ensure(w);
 agency.rngState=seedDraw(x=>x<.001);
 const joined=R.act(s,{system:'social',operation:'inviteGroupMember',
  params:{groupId:g.id,npcId:'elira',proposal:invite}});
 A.equal(joined.decision,'accepted');
 A.equal(g.members,2);
 R.act(s,{system:'social',operation:'groupContribute',
  params:{groupId:g.id,activity:'Contribute five already owned personal coins and a short real source-recording work session.',coins:5}});
 const day=w.lastTickDay;
 agency.rngState=seedDraw(x=>x<.001);
 const pri=G.deliberateInternalPriority(w,{
  id:'original-published-group-priority-001',groupId:g.id,memberActorId:'npc:elira',
  regionId:'morrowfen_basin',place:'crossing',day,
  proposal,budgetRequested:2,meetingWitness:meeting});
 A.equal(pri.outcome,'supported');
 R.act(s,{system:'social',operation:'groupContribute',
  params:{groupId:g.id,activity,priorityId:pri.id}});
 const originalCoins=s.player.coins,originalMembers=g.members;
 w.emergentGroups.rngState=originalGroupSeed(successful?x=>x<.001:x=>x>.999);
 W.advance(s,30);
 A.equal(g.priorityWork.length,1);
 const work=g.priorityWork[0],review=work.source.independentReview;
 A.equal(review.kind,successful?'verified-limited-community-work':'unverified-community-effort');
 A.equal(g.internalPositions.length,0,
  'Original result cannot become instantly known before the actual notice delay');
 A.equal(G.validate(g),true);
 const before=E.exportGame(s),beforeAgency=agency.rngState;
 const fake=G.reassessPublishedWork(w,{
  groupId:g.id,memberActorId:'npc:elira',
  workActionHash:'made-up-action',day:w.lastTickDay});
 A.equal(fake.reassessed,false);
 A.equal(E.exportGame(s),before);
 A.equal(agency.rngState,beforeAgency);
 W.advance(s,30);
 const positions=g.internalPositions.filter(x=>x.origin===G.INDEPENDENT_WORK_POSITION);
 A.equal(positions.length,successful?1:0,
  'Only actually published source-proved work can provoke an independent later reassessment');
 A.equal(g.members,originalMembers);
 A.equal(s.player.coins,originalCoins);
 A.equal(G.validate(g),true);
 if(successful){
  const row=positions[0],q=row.source;
  A.equal(q.workActionHash,work.originalActionHash);
  A.equal(q.reviewHash,work.independentReviewHash);
  A.equal(q.publishedOn,review.day+6);
  A.ok(row.day>=q.publishedOn);
  A.equal(q.agencyBefore===q.agencyAfter,false);
  A.equal(q.noMandateOrAdditionalWork,true);
  A.equal(q.memberActorId,'npc:elira');
  A.equal(q.previousStance,'supported');
  A.equal(q.previousPositionHash,g.internalPriorities[0].sourceHash);
  A.equal(q.stance,row.stance);
  A.ok(['supported','dissented','undecided'].includes(row.stance));
  A.equal(G.internalPositionStatus(w,g.id,{day:review.day})[0].positions[0].stance,
   'supported','Old position remains real at the older date');
  const beforeRepeat=E.exportGame(s),priorAgency=agency.rngState;
  const again=G.reassessPublishedWork(w,{
   groupId:g.id,memberActorId:'npc:elira',
   workActionHash:work.originalActionHash,day:w.lastTickDay});
  A.equal(again.reassessed,false);
  A.equal(E.exportGame(s),beforeRepeat);
  A.equal(agency.rngState,priorAgency);
 }
 const snapshot=E.exportGame(s),copy=E.importGame(snapshot);
 A.equal(G.validate(G.lookup(copy.table.realm,g.id)),true);
 A.deepEqual(G.internalPositionStatus(copy.table.realm,g.id),
  G.internalPositionStatus(w,g.id));
 A.equal(E.exportGame(copy),snapshot);
 if(successful){
  const originalHash=positions[0].sourceHash;
  positions[0].source.reviewHash='false-public-work';
  A.equal(G.validate(g),false,'Fabricated work news cannot rewrite member decisions');
  A.equal(positions[0].sourceHash,originalHash);
 }
}
run(987811,true);
run(987812,false);
console.log('Living organisations: actual original group work may become local published news; independently consenting members then reconsider using original agency, while failures, private facts, artificial votes, additional spend, duplicate views and save tampering remain blocked');
