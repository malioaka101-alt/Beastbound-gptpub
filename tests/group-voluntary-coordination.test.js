'use strict';
// A real association can delegate limited operational coordination to one
// independently consenting original member. Founding history remains true.
// No sovereignty, coerced work, property transfer or automatic salary.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Rules=require('../rules'),Groups=require('../world/emergent-groups'),
 Agency=require('../world/group-member-agency');
const names={name:'Free Wetland Community Study Circle',
 kind:'voluntary local field observation and support association',
 purpose:'Maintain truthful crossing notes with people who freely agree to local fieldwork while protecting independent community rights'};
const witness='During a genuine witnessed in-person meeting the founding character asks a consenting participant whether they will voluntarily coordinate the next practical study conversations with freedom to decline, without any public office.';
const scope='Temporarily organise only freely chosen river-crossing observations, announce meeting invitations, and share existing notes without authority to compel people, direct wild beasts, or spend the association treasury.';
const invite='Please independently join our voluntary wetland study circle to share actual river crossing safety knowledge; your agreement creates no forced duties.';
function privateSeed(predicate){
 for(let seed=1;seed<99999;seed++){
  const x={rngState:seed};
  if(predicate(Agency.draw(x)))return seed;
 }
 throw Error('Could not find valid personally independent decision seed');
}
function setup(seed,yes){
 const s=E.newGame({seed,name:'Actual Limited Coordinator Test',path:'undecided'});
 const f=Rules.act(s,{system:'social',operation:'formGroup',params:names});
 const w=s.table.realm,e=Groups.lookup(w,f.id),t=Agency.ensure(w);
 t.rngState=privateSeed(x=>x<.001);
 const entered=Rules.act(s,{system:'social',operation:'inviteGroupMember',
  params:{groupId:e.id,npcId:'elira',proposal:invite}});
 A.equal(entered.decision,'accepted');
 A.equal(e.members,2);
 A.equal(Groups.validate(e),true);
 t.rngState=privateSeed(yes?x=>x<.001:x=>x>.999);
 return {s,w,e,t,day:w.lastTickDay};
}
function p(x){
 return {id:'person-local-coordinator-mandate-001',groupId:x.e.id,
  memberActorId:'npc:elira',regionId:'morrowfen_basin',
  place:'crossing',startDay:x.day,untilDay:x.day+10,
  scope,meetingWitness:witness};
}
for(const [seed,yes] of [[998501,true],[998502,false]]){
 const x=setup(seed,yes);
 const prior=Groups.coordinatorStatus(x.w,x.e.id,{day:x.day});
 A.equal(prior.actorId,'player');
 A.equal(prior.mandateId,null);
 const saved=E.exportGame(x.s),originalMemberRng=x.t.rngState,
  priorPlayerRoll=x.s.rngState,priorCoins=x.s.player.coins,
  previousGroupFunds=x.e.funds,previousMembers=x.e.members;
 A.throws(()=>Groups.offerCoordination(x.w,{...p(x),
  accepted:true,royalPower:true}),/cannot be appointed/);
 A.throws(()=>Groups.offerCoordination(x.w,{...p(x),
  untilDay:x.day-1}),/independently present voluntary member/);
 A.equal(E.exportGame(x.s),saved);
 A.equal(x.t.rngState,originalMemberRng);
 const result=Groups.offerCoordination(x.w,p(x));
 A.equal(result.agreed,yes);
 A.equal(result.originalFounderPreserved,true);
 A.equal(result.noOfficeOrSalaryGranted,true);
 A.equal(result.noRightToCompelOtherMembers,true);
 A.equal(result.noTreasuryAccess,true);
 A.equal(x.e.members,previousMembers);
 A.equal(x.e.funds,previousGroupFunds);
 A.equal(x.e.founder.actorId,'player');
 A.equal(x.e.charter.elder,x.s.player.name);
 A.equal(x.s.player.coins,priorCoins);
 A.equal(x.s.rngState,priorPlayerRoll);
 A.equal(Groups.validate(x.e),true);
 const current=Groups.coordinatorStatus(x.w,x.e.id,{day:x.day});
 A.equal(current.actorId,yes?'npc:elira':'player');
 A.equal(current.mandateId,yes?result.id:null);
 A.equal(current.noGovernmentOffice,true);
 A.equal(current.noTreasuryPower,true);
 A.equal(Groups.coordinatorStatus(x.w,x.e.id,{day:x.day+11}).actorId,
  'player','The honest bounded term eventually ends without recreating the founding');
 const after=E.exportGame(x.s);
 A.throws(()=>Groups.offerCoordination(x.w,{
  ...p(x),id:'changed-id-to-retry-same-day-002'}),
  /unoccupied limited coordination term/);
 A.equal(E.exportGame(x.s),after);
 const copy=E.importGame(after),restored=copy.table.realm;
 A.equal(Groups.validate(Groups.lookup(restored,x.e.id)),true);
 A.deepEqual(Groups.coordinatorStatus(restored,x.e.id,{day:x.day}),current);
 A.equal(E.exportGame(copy),after);
 const originalHash=x.e.coordinationMandates[0].sourceHash;
 x.e.coordinationMandates[0].source.agreed=!yes;
 A.equal(Groups.validate(x.e),false,
  'Voluntary consent cannot be rewritten as obedience or opposition');
 A.equal(x.e.coordinationMandates[0].sourceHash,originalHash);
}
console.log('Living group internal coordinator: genuine personally agreeing/declining member, bounded term, original founding history, independent RNG and source provenance, no forced public office, work, treasury or magic');
