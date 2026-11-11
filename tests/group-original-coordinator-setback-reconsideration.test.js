'use strict';
// #18 source-valid independent organisational leadership: an ACTUAL group
// setback can prompt its own independently consenting coordinator to
// continue or resign. No invented office, forced vote, new work or coins.
const A=require('node:assert/strict'),
 E=require('../engine.js'),R=require('../rules'),W=require('../rules/world'),
 G=require('../world/emergent-groups'),Agency=require('../world/group-member-agency');
const names={name:'Genuine Wetland Independent Crossing Circle',
 kind:'voluntary open-ended practical research community',
 purpose:'Explore and freely share safer river crossing knowledge with local people, with no compulsory participation, political monopoly or duties forced on members'};
const invite='Please join freely as an independent local member who may decline tasks, voice disagreement, retain personal affairs and leave the association.';
const scope='Volunteer to coordinate only practical crossing observations and truthful public summaries, retaining the right to decline tasks or resign; never take the other members’ funds or grant a legal title.';
const witness='The genuine physically present member hears an in-person invitation to voluntarily coordinate group conversations and choose whether to accept independently, without any demanded work or salary.';
const activity='I freely attempt source-backed crossing safety field notes, knowing the work may fail and the group may spend only its available resources.';
function seedFor(predicate){
 for(let n=1;n<100000;n++){
  const t={rngState:n};
  if(predicate(Agency.draw(t)))return n;
 }
 throw Error('No bounded original individual decision seed');
}
function worldRoll(seed){
 let x=seed>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 return (x>>>0)/4294967296;
}
function worldSeedFor(predicate){
 for(let n=1;n<100000;n++)if(predicate(worldRoll(n)))return n;
 throw Error('No original group work draw seed');
}
const act=(s,operation,params)=>R.act(s,{system:'social',operation,params});
function setup(seed){
 const s=E.newGame({seed,name:'Disposable Independent Coordinator Review',path:'undecided'}),
  formed=act(s,'formGroup',names),w=s.table.realm,e=G.lookup(w,formed.id),
  t=Agency.ensure(w);
 t.rngState=seedFor(x=>x<.001);
 const member=act(s,'inviteGroupMember',{
  groupId:e.id,npcId:'elira',proposal:invite});
 A.equal(member.decision,'accepted');
 A.equal(member.joined,true);
 A.equal(e.members,2);
 const day=w.lastTickDay;
 t.rngState=seedFor(x=>x<.001);
 const mandate=G.offerCoordination(w,{
  id:'original-setback-coordinator-term-001',
  groupId:e.id,memberActorId:'npc:elira',
  regionId:'morrowfen_basin',place:'crossing',
  startDay:day,untilDay:day+120,scope,meetingWitness:witness});
 A.equal(mandate.agreed,true);
 A.equal(G.coordinatorStatus(w,e.id,{day}).actorId,'npc:elira');
 A.equal(G.validate(e),true);
 return {s,w,e,t,day,mandate};
}
function originalWork(s,e,w,success){
 const contribution=act(s,'groupContribute',{groupId:e.id,activity,coins:5});
 A.equal(contribution.spentCoins,5);
 w.emergentGroups.rngState=worldSeedFor(
  success?x=>x<.001:x=>x>.999);
}
{
 const {s,w,e,t,day,mandate}=setup(997701);
 const coins=s.player.coins,bank=e.funds,playerRng=s.rngState;
 const prior=E.exportGame(s);
 A.throws(()=>G.reconsiderCoordinatorOnOriginalFailure(w,{
  groupId:e.id,mandateId:mandate.id,originalReviewId:'forged',day}),
 /(?:no new|false)/i);
 A.equal(E.exportGame(s),prior);
 A.equal(s.rngState,playerRng);
 A.equal(G.coordinationReviewStatus(w,e.id).length,0);
 // NO original failed group effort: mere time, status, inactivity or a
 // person's optional coordinator title cannot invent role resignation.
 t.rngState=seedFor(x=>x<.001);
 W.advance(s,30);
 A.equal(e.coordinationReviews.length,0);
 A.equal(G.coordinatorStatus(w,e.id).actorId,'npc:elira');
 A.equal(s.player.coins,coins);
 A.equal(e.funds,bank);
 A.equal(G.validate(e),true);
}
{
 const {s,w,e,t,day,mandate}=setup(997702);
 const startingPlayerCoins=s.player.coins,
  startingMemberCount=e.members;
 originalWork(s,e,w,false);
 A.equal(s.player.coins,startingPlayerCoins-5);
 t.rngState=seedFor(x=>x<.001);
 W.advance(s,30);
 A.equal(e.failedEfforts,1);
 A.equal(e.completedEfforts,0);
 A.equal(e.coordinationReviews.length,1);
 const event=e.coordinationReviews[0];
 A.equal(event.origin,G.COORDINATION_REVIEW);
 A.equal(event.resigned,true);
 A.equal(event.mandateId,mandate.id);
 A.equal(event.source.originalMandateHash,e.coordinationMandates[0].sourceHash);
 A.equal(event.source.originalReview.kind,'unverified-community-effort');
 A.equal(event.source.originalReviewHash,event.source.originalReview.hash);
 A.equal(event.source.noCashOrLegalOffice,true);
 A.equal(event.source.noOtherMemberBound,true);
 A.equal(event.source.noNewWorkOrInfluence,true);
 A.equal(G.coordinatorStatus(w,e.id,{day}).actorId,'npc:elira',
  'Before the genuine setback the agreed original coordinator remained in office');
 A.equal(G.coordinatorStatus(w,e.id).actorId,'player',
  'Voluntary resignation ends only the individual optional role, not the founding');
 A.equal(G.coordinatorStatus(w,e.id).mandateId,null);
 A.equal(G.coordinationReviewStatus(w,e.id)[0].independentlyResigned,true);
 A.equal(e.coordinationMandates[0].agreed,true,
  'Original consent remains historically genuine');
 A.equal(e.members,startingMemberCount);
 A.equal(s.player.coins,startingPlayerCoins-5);
 A.equal(G.validate(e),true);
 const saved=E.exportGame(s),copy=E.importGame(saved);
 A.equal(E.exportGame(copy),saved);
 A.deepEqual(G.coordinationReviewStatus(copy.table.realm,e.id),
  G.coordinationReviewStatus(w,e.id));
 const oldHash=event.sourceHash;
 event.source.originalReview.details.decisionDraw=0;
 A.equal(G.validate(e),false,'A forged original setback cannot rewrite an independent leader choice');
 A.equal(event.sourceHash,oldHash);
}
{
 const {s,w,e,t,mandate}=setup(997703);
 originalWork(s,e,w,false);
 t.rngState=seedFor(x=>x>.999);
 W.advance(s,30);
 A.equal(e.failedEfforts,1);
 A.equal(e.coordinationReviews.length,1);
 A.equal(e.coordinationReviews[0].resigned,false);
 A.equal(G.coordinatorStatus(w,e.id).actorId,'npc:elira',
  'A failed group experiment does not automatically remove an independent leader');
 A.equal(G.coordinationReviewStatus(w,e.id)[0].independentlyResigned,false);
 A.equal(G.validate(e),true);
 const proof=E.exportGame(s),playerCoins=s.player.coins,
  originalGroupFunds=e.funds,roleHash=e.coordinationMandates[0].sourceHash;
 A.equal(G.reconsiderCoordinatorOnOriginalFailure(w,{
  groupId:e.id,mandateId:mandate.id,
  originalReviewId:e.coordinationReviews[0].source.originalReview.id,
  day:w.lastTickDay}).reconsidered,false,
 'An original failure is not a repeatable independent consent dice source');
 A.equal(E.exportGame(s),proof);
 A.equal(s.player.coins,playerCoins);
 A.equal(e.funds,originalGroupFunds);
 A.equal(e.coordinationMandates[0].sourceHash,roleHash);
}
{
 const {s,w,e,t}=setup(997704);
 originalWork(s,e,w,true);
 t.rngState=seedFor(x=>x<.001);
 W.advance(s,30);
 A.equal(e.completedEfforts,1);
 A.equal(e.failedEfforts,0);
 A.equal(e.coordinationReviews.length,0,
  'Independent successful work is not fabricated as a failure requiring resignation');
 A.equal(G.coordinatorStatus(w,e.id).actorId,'npc:elira');
 A.equal(G.validate(e),true);
}
console.log('Original group leadership agency: real independent coordinator may continue or resign after one real independently failed group effort; unchanged original mandate, no forced office transfer, money or second work roll, honest source replay and durable history');
