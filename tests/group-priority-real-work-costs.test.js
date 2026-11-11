'use strict';
// #18 original organisation treasury and work accountability. An independently
// supported priority is a historical interpretation, NOT extra work or funds.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),W=require('../rules/world'),
 G=require('../world/emergent-groups'),Agency=require('../world/group-member-agency');
const names={name:'River Safety Volunteer Workshop',
 kind:'open and independently chosen practical association',
 purpose:'Offer factual source-checked river-crossing safety observations and practical community work without exclusive rights'};
const issue='Consider collecting first-hand observations about safe river crossing conditions and documenting available shelter maintenance needs without compelling anyone to help.';
const witness='A physically present previously consenting community member personally hears this real local proposal, may support or dissent, and acknowledges no office or salary follows.';
const activity='I independently document the existing river footpath crossings and attempt useful shelter safety notes as a real voluntary contribution; success remains for the world to determine.';
const choice=predicate=>{
 for(let n=1;n<90000;n++){
  const t={rngState:n};
  if(predicate(Agency.draw(t)))return n;
 }
 throw Error('Missing private individual RNG fixture source');
};
const s=E.newGame({seed:996202,name:'Actual Group Work and Accountable Costs',path:'undecided'});
const f=R.act(s,{system:'social',operation:'formGroup',params:names});
const w=s.table.realm,g=G.lookup(w,f.id),t=Agency.ensure(w);
A.equal(G.validate(g),true);
t.rngState=choice(x=>x<.001);
const invite=R.act(s,{system:'social',operation:'inviteGroupMember',
 params:{groupId:g.id,npcId:'elira',
  proposal:'Please join the safe-river workshop freely to discuss real crossing observations without mandatory membership fees or obligations.'}});
A.equal(invite.decision,'accepted');
A.equal(g.members,2);
const oldPlayerCoins=s.player.coins;
const funding=R.act(s,{system:'social',operation:'groupContribute',
 params:{groupId:g.id,activity:'I contribute five real Talons and time toward the river-crossing workshop by my own voluntary choice.',coins:5}});
A.equal(funding.spentCoins,5);
A.equal(g.funds,5);
A.equal(s.player.coins,oldPlayerCoins-5);
t.rngState=choice(x=>x<.001);
const day=w.lastTickDay;
const priority=G.deliberateInternalPriority(w,{
 id:'community-route-priority-001',groupId:g.id,memberActorId:'npc:elira',
 regionId:'morrowfen_basin',place:'crossing',proposal:issue,
 budgetRequested:2,day,meetingWitness:witness});
A.equal(priority.outcome,'supported');
A.equal(G.priorityWorkStatus(w,g.id).length,0);
const before=E.exportGame(s),rng=t.rngState;
A.throws(()=>R.act(s,{system:'social',operation:'groupContribute',
 params:{groupId:g.id,activity,priorityId:'imaginary-funded-order'}}),
 /priority link needs a real earlier source-supported member review/);
A.equal(t.rngState,rng);
A.equal(E.exportGame(s),before,
 'Invalid work linkage must never advance time, create currency or reroll member assent');
const submitted=R.act(s,{system:'social',operation:'groupContribute',
 params:{groupId:g.id,activity,priorityId:priority.id}});
A.equal(submitted.workRecorded,true);
A.equal(submitted.verifiedResult,false);
A.equal(submitted.originalPriorityLink,priority.id);
A.equal(submitted.spentCoins,0);
A.equal(G.priorityWorkStatus(w,g.id).length,0,
 'A linked discussion cannot pretend the unreviewed work succeeded');
const beforeReviewTreasury=g.funds,coinsAfterContribution=s.player.coins;
const originalIndependentWorldRng=w.emergentGroups.rngState;
W.advance(s,30);
A.ok(w.emergentGroups.rngState!==originalIndependentWorldRng,
 'The existing independent month work draws the original single group check');
A.equal(s.player.coins,coinsAfterContribution,
 'A later world review cannot charge the player again');
A.ok(g.funds<=beforeReviewTreasury,
 'Original reviewed work and existing upkeep debit the same existing group balance');
A.equal(G.validate(g),true);
const found=G.priorityWorkStatus(w,g.id);
A.equal(found.length,1,'Only a real originally reviewed action can be attributed');
A.equal(found[0].priorityId,priority.id);
A.equal(found[0].additionalCostForLink,0);
A.equal(found[0].noNewWorkResultOrMoney,true);
const proof=g.priorityWork[0],review=proof.source.independentReview;
A.equal(proof.originalActionHash,proof.source.originalAction.hash);
A.ok(['verified-limited-community-work','unverified-community-effort'].includes(review.kind));
A.equal(proof.source.groupReviewCost,review.details.actualFundsSpent);
A.ok(review.details.originalActionHashes.includes(proof.originalActionHash));
A.ok(review.details.actualFundsSpent>=0);
A.equal(found[0].groupWideOriginalReviewCost,review.details.actualFundsSpent);
A.equal(proof.source.noCompulsoryMemberParticipation,true);
A.equal(g.internalPriorities[0].outcome,'supported');
A.equal(g.members,2);
const frozen=E.exportGame(s),reloaded=E.importGame(frozen),
 gw=G.lookup(reloaded.table.realm,g.id);
A.ok(gw);
A.equal(G.validate(gw),true);
A.deepEqual(G.priorityWorkStatus(reloaded.table.realm,g.id),found);
A.equal(E.exportGame(reloaded),frozen);
const oldSource=proof.sourceHash;
proof.source.originalAction.witness.details.priorityId='A MADE-UP GOVERNMENT AUTHORISATION';
A.equal(G.validate(g),false,'Cannot rewrite the original personally executed activity or falsely cite a priority');
A.equal(proof.sourceHash,oldSource);
console.log('Original association work to advisory priority: existing group effort, actual original month dice, budget and upkeep cost, no duplicate spend, private member assent, replay and tamper evidence');
