'use strict';
// An independently agreeing coordinator can personally reconsider only their
// optional responsibility after actual source-witnessed disagreement with a
// newer founder purpose. This reuses the original coordination review ledger
// and existing member agency; no founder-chosen abdication or expulsion.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Rules=require('../rules'),W=require('../rules/world'),
 G=require('../world/emergent-groups'),
 Agency=require('../world/group-member-agency');
const act=(s,operation,params)=>Rules.act(s,{system:'social',operation,params});
const invitation='Please voluntarily join our locally observed river stewardship discussions, with full freedom to disagree, decline work and leave at your own choice.';
const scope='Coordinate entirely optional river-crossing surveys and field note conversations without any legal power, fees, compelled member labour or authority over personal property.';
const talk='The genuinely present member hears the locally revised original founder purpose and gives a personal independent view, not a binding collective vote or coerced declaration.';
const witness='At an actual original local meeting, this member considers a limited voluntary coordination responsibility and decides independently without rights to direct compulsory tasks.';
const original={
 name:'Open Wetland Refuge and River Observation Circle',
 kind:'voluntary small local environment and public safety collective',
 purpose:'Share independently observed practical river conditions with freely consenting community volunteers while retaining individual duties and choices'};
const revised='Pursue practical flood-refuge maintenance observations with freely shared field notes rather than the earlier general river survey directions';
function seedFor(check){
 for(let n=1;n<100000;n++){const t={rngState:n},x=Agency.draw(t);
  if(check(x))return n;}
 throw Error('Original independent agency cannot match a tested decision');
}
function setup(seed,{term=120,opinion='dissented'}={}){
 const s=E.newGame({seed,name:'Disposable Independent Responsibility Review',path:'undecided'}),
  form=act(s,'formGroup',original),w=s.table.realm,e=G.lookup(w,form.id),
  agency=Agency.ensure(w);
 agency.rngState=seedFor(x=>x<.001);
 const joined=act(s,'inviteGroupMember',{groupId:e.id,npcId:'elira',
  proposal:invitation});
 A.equal(joined.decision,'accepted');
 const day=w.lastTickDay;
 agency.rngState=seedFor(x=>x<.001);
 const role=G.offerCoordination(w,{
  id:'source-real-limited-coordinator-term-0001',
  groupId:e.id,memberActorId:'npc:elira',
  place:'crossing',regionId:'morrowfen_basin',
  startDay:day,untilDay:day+term,
  scope,meetingWitness:witness});
 A.equal(role.agreed,true);
 const revision=act(s,'restateGroupPurpose',{
  groupId:e.id,purpose:revised,
  reason:'The founder now seeks a different freely chosen community focus that may not suit every existing participant'});
 agency.rngState=seedFor(opinion==='dissented'?
  x=>x>.40&&x<.43:x=>x<.001);
 const answer=act(s,'discussGroupPurpose',{
  groupId:e.id,revisionId:revision.revisionId,
  npcId:'elira',discussion:talk});
 A.equal(answer.stance,opinion);
 A.equal(G.validate(e),true);
 return {s,w,e,agency,role,revision,answer,day};
}
{
 const x=setup(998961);
 const initialMembers=x.e.members,initialCharter=x.e.charter.duty,
  originalRole=x.e.coordinationMandates[0].sourceHash,
  personal=x.e.purposeResponses.at(-1);
 x.agency.rngState=seedFor(t=>t<.01);
 W.advance(x.s,30);
 A.equal(x.e.coordinationReviews.length,1,
  'one original personal purpose difference may produce one optional role reconsideration');
 const review=x.e.coordinationReviews[0],q=review.source;
 A.equal(review.origin,G.COORDINATION_PURPOSE_REVIEW);
 A.equal(review.resigned,true);
 A.equal(q.originalMandateHash,originalRole);
 A.equal(q.responseId,personal.id);
 A.equal(q.responseHash,personal.sourceHash);
 A.equal(q.revisionSourceHash,x.e.purposeHistory[0].sourceHash);
 A.equal(q.noMemberDismissal,true);
 A.equal(q.noWorkOrTreasuryChange,true);
 A.equal(q.noForcedReplacementOrLegalOffice,true);
 A.equal(q.day-personal.day,30);
 A.equal(q.draw<q.resignChance,true);
 const rng={rngState:q.agencyBefore};
 A.equal(Agency.draw(rng),q.draw);
 A.equal(rng.rngState,q.agencyAfter);
 A.equal(G.verifyPurposeCoordinatorReview(x.e,review),true);
 A.equal(G.validate(x.e),true);
 A.equal(x.e.members,initialMembers);
 A.equal(x.e.additionalMembers.find(m=>m.actorId==='npc:elira').active,true,
  'the person has ended only coordination, not voluntary membership');
 A.equal(x.e.charter.duty,initialCharter);
 A.equal(G.coordinatorStatus(x.w,x.e.id,{day:x.w.lastTickDay}).mandateId,null);
 const history=G.coordinationReviewStatus(x.w,x.e.id,{day:x.w.lastTickDay});
 A.equal(history[0].originalPurposeResponseHash,personal.sourceHash);
 A.equal(history[0].voluntaryPurposeResponsibilityReview,true);
 const saved=E.exportGame(x.s),copy=E.importGame(saved),
  restored=G.lookup(copy.table.realm,x.e.id);
 A.equal(E.exportGame(copy),saved);
 A.equal(G.validate(restored),true);
 A.equal(restored.coordinationReviews[0].resigned,true);
 const before=x.e.coordinationReviews.map(r=>structuredClone(r));
 review.resigned=false;
 A.equal(G.validate(x.e),false,
  'falsely changing the NPC withdrawal answer fails source validation');
 x.e.coordinationReviews=structuredClone(before);
 x.e.coordinationReviews[0].resigned=false;
 x.e.coordinationReviews[0].source.resigned=false;
 x.e.coordinationReviews[0].sourceHash=
  G.hash(x.e.coordinationReviews[0].source);
 A.equal(G.validate(x.e),false,
  'resealing a desired choice fails the original agency draw replay');
 x.e.coordinationReviews=before;
 A.equal(G.validate(x.e),true);
}
{
 const x=setup(998962);
 x.agency.rngState=seedFor(t=>t>.98);
 W.advance(x.s,30);
 A.equal(x.e.coordinationReviews.length,1);
 A.equal(x.e.coordinationReviews[0].resigned,false,
  'genuine opposition does not force giving up freely assumed responsibilities');
 A.equal(G.coordinatorStatus(x.w,x.e.id,{day:x.w.lastTickDay}).actorId,'npc:elira');
 W.advance(x.s,30);
 A.equal(x.e.coordinationReviews.length,1,
  'a single original disagreement is not rolled again at every later month');
 A.equal(G.validate(x.e),true);
}
{
 const x=setup(998963);
 W.advance(x.s,6);
 x.agency.rngState=seedFor(t=>t<.001);
 const changed=act(x.s,'discussGroupPurpose',{
  groupId:x.e.id,revisionId:x.revision.revisionId,
  npcId:'elira',discussion:talk});
 A.equal(changed.previousStance,'dissented');
 A.equal(changed.stance,'supported');
 x.agency.rngState=seedFor(t=>t<.001);
 W.advance(x.s,24);
 A.equal(x.e.coordinationReviews.length,0,
  'an individually changed actual view cancels the earlier current dissent');
 A.equal(G.coordinatorStatus(x.w,x.e.id,{day:x.w.lastTickDay}).actorId,'npc:elira');
 A.equal(G.validate(x.e),true);
}
{
 const y=setup(998964,{opinion:'supported'});
 y.agency.rngState=seedFor(t=>t<.001);
 W.advance(y.s,30);
 A.equal(y.e.coordinationReviews.length,0);
 A.equal(G.validate(y.e),true);
 const z=setup(998965,{term:10});
 z.agency.rngState=seedFor(t=>t<.001);
 W.advance(z.s,30);
 A.equal(z.e.coordinationReviews.length,0,
  'an expired operational mandate cannot generate a fictional later resignation');
 A.equal(G.validate(z.e),true);
}
console.log('Original limited group leadership: real independent dissent can prompt optional personal coordinator duty review; genuine resign/stay/reconcile, source and RNG replay, durable save and refusal of forged consent, no expulsion, pay, law or forced successor PASS');
