'use strict';
// Original witnessed association membership and individual agency grant only
// voluntary internal responsibilities, never sovereign power or forced work.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Rules=require('../rules'),Groups=require('../world/emergent-groups'),
 Agency=require('../world/group-member-agency');
const names={name:'Open River Safety Learning Collective',
 kind:'informal voluntary neighbourhood study association',
 purpose:'Share witnessed safe wetland routes and basic shelter information without assuming monopoly or office'};
const invitation='Please consider joining our cooperative voluntarily to exchange actual river-route knowledge and keep full freedom to leave.';
const witness='At the real crossing, an independently consenting member hears an optional proposal to help record practical river shelter and safe-crossing observations. The founder makes no claim of compulsory service or public appointment.';
const scope='Assist with personally witnessed crossing observations when freely available, without coercion, exclusive office, custody of property, required duties, or automatic payment.';
function seedChoice(pred){
 for(let n=1;n<100000;n++){const p={rngState:n};if(pred(Agency.draw(p)))return n;}
 throw Error('No independent RNG seed for the chosen test branch');
}
function setup(seed,willAgree){
 const s=E.newGame({seed,name:'Independent Association Duties Test',path:'undecided'});
 const f=Rules.act(s,{system:'social',operation:'formGroup',params:names});
 const w=s.table.realm,g=Groups.lookup(w,f.id),t=Agency.ensure(w);
 A.equal(g.members,1);
 t.rngState=seedChoice(x=>x<.001);
 const joined=Rules.act(s,{system:'social',operation:'inviteGroupMember',
  params:{groupId:g.id,npcId:'elira',proposal:invitation}});
 A.equal(joined.decision,'accepted');
 A.equal(g.members,2);
 A.equal(Groups.validate(g),true);
 t.rngState=seedChoice(willAgree?x=>x<.001:x=>x>.999);
 return {s,w,g,t,day:w.lastTickDay};
}
function params(x){
 return {id:'local-crossing-duty-offer-0001',groupId:x.g.id,
  memberActorId:'npc:elira',title:'Volunteer crossing-route review steward',
  scope,regionId:'morrowfen_basin',place:'crossing',
  startDay:x.day,untilDay:x.day+5,witness};
}
for(const [seed,willAgree] of [[997001,true],[997002,false]]){
 const x=setup(seed,willAgree),input=params(x),rng=x.t.rngState;
 const frozen=E.exportGame(x.s),money=x.s.player.coins,
  priorFunds=x.g.funds,priorMembers=x.g.members,playerRng=x.s.rngState;
 A.throws(()=>Groups.proposeVoluntaryRole(x.w,{...input,agreed:true,publicOffice:true}),
  /cannot specify consent/);
 A.throws(()=>Groups.proposeVoluntaryRole(x.w,{...input,scope:'Be my servant.'}),
  /personally present, consenting/);
 A.equal(x.t.rngState,rng);
 A.equal(E.exportGame(x.s),frozen,'Invalid proposals cannot mutate the world');
 const result=Groups.proposeVoluntaryRole(x.w,input);
 A.equal(result.agreed,willAgree);
 A.equal(result.noPublicOffice,true);
 A.equal(result.noCompulsoryDuty,true);
 A.equal(result.noAutomaticWage,true);
 A.equal(x.g.funds,priorFunds,'A role cannot invent or spend original group money');
 A.equal(x.g.members,priorMembers,'A role cannot invent a new member');
 A.equal(x.s.player.coins,money);
 A.equal(x.s.rngState,playerRng,'Private member RNG does not roll player checks');
 A.equal(x.g.internalRoles.length,1);
 A.equal(Groups.validate(x.g),true);
 const state=Groups.voluntaryRoleStatus(x.w,x.g.id,{day:x.day});
 A.equal(state[0].status,willAgree?'voluntarily-serving':'declined');
 A.equal(state[0].noLegalOrHereditaryAuthority,true);
 A.equal(state[0].noCompulsoryCooperation,true);
 A.throws(()=>Groups.proposeVoluntaryRole(x.w,{
  ...input,id:'same-role-reroll-new-id-0002'}),
  /distinct, genuine local responsibility/);
 const after=E.exportGame(x.s),copy=E.importGame(after);
 A.equal(Groups.validate(Groups.lookup(copy.table.realm,x.g.id)),true);
 A.deepEqual(Groups.voluntaryRoleStatus(copy.table.realm,x.g.id,{day:x.day}),state);
 A.equal(E.exportGame(copy),after);
 A.equal(Groups.voluntaryRoleStatus(x.w,x.g.id,{day:x.day+6})[0].status,
  willAgree?'term-ended':'declined');
 const oldSource=x.g.internalRoles[0].sourceHash;
 x.g.internalRoles[0].source.scope='The organisation may command all nations and compel wild beasts.';
 A.equal(Groups.validate(x.g),false,'Witnessed role scope cannot be rewritten as sovereign power');
 A.equal(x.g.internalRoles[0].sourceHash,oldSource);
}
console.log('Independent association work roles: real personally consenting member, own RNG accepts or declines, reusable freely authored title and scope, bounded terms, no forced duties/power/pay, persisted original source');
