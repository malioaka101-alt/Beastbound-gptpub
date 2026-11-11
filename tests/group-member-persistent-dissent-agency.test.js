'use strict';
// #18: actual original independently witnessed group dissent is a possible
// PERSONAL withdrawal reason, not a vote, expulsion, predetermined schism,
// forced role transfer, inheritance or extra member-agency roll.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Rules=require('../rules'),W=require('../rules/world'),
 G=require('../world/emergent-groups'),
 Agency=require('../world/group-member-agency');
const charter={name:'Free Crossing and Wetland Shared Concerns',
 kind:'informal voluntary research and neighbour aid association',
 purpose:'Compare real local flood and travel observations while each member keeps the right to disagree, withdraw and set independent priorities'};
const invite='Please freely join this group to exchange honestly observed river information and discuss disagreements without any obligation or compulsory membership.';
const policy1='Consider voluntarily publishing the original safe ferry crossing observations and preserving community access without any monopolised licences.';
const policy2='Consider directing ordinary independent field discussion toward flooded refuge routes with full attention to wild beast habitat safety.';
const reason='I freely disagree with this specific recorded proposal because the local river information and community use consequences warrant further independent consideration.';
const meeting='The existing physically present local association member hears the actual freeform issue at the crossing and independently forms their own view, without automatic sanctions or a binding group vote.';
const issueMeeting='The real local association member witnesses a completely optional discussion about the proposed work and personally decides whether to support its aims.';
const findSeed=predicate=>{
 for(let n=1;n<1000000;n++){
  const rng={rngState:n},v=Agency.draw(rng);
  if(predicate(v))return n;
 }
 throw Error('Independent original actor test RNG seed unavailable');
};
const findPair=predicate=>{
 for(let n=1;n<1000000;n++){
  const rng={rngState:n},a=Agency.draw(rng),b=Agency.draw(rng);
  if(predicate(a,b))return n;
 }
 throw Error('Independent original two-person RNG sequence unavailable');
};
const act=(s,operation,params)=>Rules.act(s,{system:'social',operation,params});
function setup(seed,howMany=2){
 const s=E.newGame({seed,name:'Disposable Group Member Dissent',path:'undecided'}),
  form=act(s,'formGroup',charter),w=s.table.realm,
  e=G.lookup(w,form.id),agency=Agency.ensure(w);
 for(const id of ['elira','otto']){
  agency.rngState=findSeed(x=>x<.002);
  const joined=act(s,'inviteGroupMember',{groupId:e.id,npcId:id,proposal:invite});
  A.equal(joined.decision,'accepted');
  A.equal(joined.joined,true);
 }
 const day=w.lastTickDay;
 for(let i=0;i<howMany;i++){
  const id='original-real-disagreement-priority-'+(i+1);
  agency.rngState=findSeed(x=>x<.002);
  const proposed=G.deliberateInternalPriority(w,{
   id,groupId:e.id,memberActorId:'npc:elira',
   regionId:'morrowfen_basin',place:'crossing',day,
   proposal:i===0?policy1:policy2,
   budgetRequested:0,meetingWitness:issueMeeting});
  A.equal(proposed.id,id);
  agency.rngState=findSeed(x=>x>.45&&x<.47);
  const position=G.considerInternalPosition(w,{
   id:'original-personal-dissent-'+(i+1),
   groupId:e.id,priorityId:id,memberActorId:'npc:otto',
   day,regionId:'morrowfen_basin',place:'crossing',
   reason,meetingWitness:meeting});
  A.equal(position.stance,'dissented');
 }
 A.equal(e.members,3);
 A.equal(G.validate(e),true);
 W.advance(s,6);
 A.equal(Agency.independentDissentEvidence(e,'npc:otto',w.lastTickDay).length,
  howMany);
 return {s,w,e,agency,day};
}
{
 const {s,w,e,agency,day}=setup(997801,2);
 const sources=Agency.independentDissentEvidence(e,'npc:otto',w.lastTickDay);
 A.equal(sources.length,2);
 A.notEqual(sources[0].priorityId,sources[1].priorityId);
 A.ok(sources.every(x=>x.independentlyDissentedOnDay===day));
 const oldCoins=s.player.coins,oldFunds=e.funds;
 agency.rngState=findPair((first,second)=>first>.95&&second<.09);
 W.advance(s,24);
 A.equal(e.members,2,
  'Only an original individual independent agency decision, after persistent real dissent, may withdraw membership');
 const member=e.additionalMembers.find(x=>x.actorId==='npc:otto');
 A.equal(member.active,false);
 A.equal(member.departure.origin,Agency.DEPART);
 const witness=member.departure.witness.details;
 A.equal(witness.actualPressure,Agency.DISSENT_PRESSURE);
 A.equal(witness.notEnforcedFactionExpulsion,true);
 A.equal(witness.optionalPersonalDecision,true);
 A.equal(witness.noAutomaticOfficeOrFundingTransfer,true);
 A.deepEqual(witness.disagreementEvidence,sources);
 A.equal(member.departure.hash,G.hash(member.departure.witness));
 A.equal(witness.agencyBefore>0,true);
 A.equal(witness.agencyAfter>0,true);
 A.equal(witness.choiceDraw<witness.withdrawalChance,true);
 A.equal(e.funds,oldFunds);
 A.equal(s.player.coins,oldCoins);
 // A real elapsed month independently advances the original WORLD RNG.
 // Only the original membership-agency decision is replayed from the
 // authenticated source, not an implausibly frozen unrelated world state.
 const replay={rngState:witness.agencyBefore};
 A.equal(Agency.draw(replay),witness.choiceDraw);
 A.equal(replay.rngState,witness.agencyAfter);
 A.equal(G.reportedMemberCount(e,w.lastTickDay),3,
  'Original public member departure notice has not yet been released');
 A.equal(G.reportedMemberCount(e,w.lastTickDay+6),2);
 A.equal(G.validate(e),true);
 const save=E.exportGame(s),restored=E.importGame(save);
 A.equal(E.exportGame(restored),save);
 A.equal(G.validate(G.lookup(restored.table.realm,e.id)),true);
 const oldWitnessHash=member.departure.hash;
 witness.disagreementEvidence[0].personalPositionHash='0'.repeat(64);
 A.equal(G.validate(e),false,
  'A fabricated old vote/dissent cannot authorize a fictional individual withdrawal');
 A.equal(member.departure.hash,oldWitnessHash);
}
{
 const {s,w,e,agency}=setup(997802,2);
 agency.rngState=findPair((first,second)=>first>.95&&second>.85);
 W.advance(s,24);
 A.equal(e.members,3,
  'Original independent members retain their right to stay despite real sustained dissent');
 A.equal(e.additionalMembers.find(x=>x.actorId==='npc:otto').active,true);
 A.equal(G.validate(e),true);
}
{
 const {s,w,e,agency}=setup(997803,1);
 A.equal(Agency.independentDissentEvidence(e,'npc:otto',w.lastTickDay).length,1);
 agency.rngState=findPair((first,second)=>first>.95&&second<.02);
 W.advance(s,24);
 A.equal(e.members,3,
  'A lone real disagreement is not synthetic proof of persistent political faction hostility');
 A.equal(G.validate(e),true);
}
{
 const {s,w,e,agency}=setup(997804,2);
 // A person can revise one of their positions: record a REAL independent
 // choice rather than treating old dissent as a permanent, forced faction.
 agency.rngState=findSeed(x=>x<.01);
 const changed=G.considerInternalPosition(w,{
  id:'original-member-independent-policy-reconsideration',
  groupId:e.id,priorityId:'original-real-disagreement-priority-1',
  memberActorId:'npc:otto',day:w.lastTickDay,
  regionId:'morrowfen_basin',place:'crossing',reason,meetingWitness:meeting});
 A.equal(changed.previousStance,'dissented');
 A.equal(changed.stance,'supported');
 A.equal(Agency.independentDissentEvidence(e,'npc:otto',w.lastTickDay).length,1);
 agency.rngState=findPair((first,second)=>first>.95&&second<.02);
 W.advance(s,24);
 A.equal(e.members,3);
 A.equal(G.validate(e),true);
}
console.log('Real individual organisational disagreement: existing sourced open priorities and two real independently dissenting positions can prompt optional persistent member agency withdrawal; genuine stay/reconsider decisions, original notice delay, save replay and historical tamper guards; no faction expulsion or money');
