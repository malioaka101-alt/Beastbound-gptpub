'use strict';
const A=require('node:assert/strict'),E=require('../engine.js'),R=require('../rules'),
 W=require('../rules/world'),C=require('../rules/core'),
 Realm=require('../world/simulation'),G=require('../world/emergent-groups'),
 Agency=require('../world/group-member-agency');
const fresh=seed=>E.newGame({seed,name:'Independent Voluntary Community Founder',path:'undecided'});
const act=(s,operation,params={})=>R.act(s,{system:'social',operation,params});
const newGroup=()=>({name:'Open Fen Study Assembly',
 kind:'ordinary cooperative of independent neighbours',
 purpose:'Exchange practical safe wetland passage notes without family, guild or property privileges.'});
const offer='I invite you to join voluntarily to share practical shelter records and local field knowledge, while keeping your own work and freedom.';
function seedFor(predicate){
 for(let i=1;i<120000;i++){
  const t={rngState:i},x=Agency.draw(t);
  if(predicate(x,t))return i;
 }
 throw Error('No desired independent persisted world decision seed');
}
function setup(seed){
 const s=fresh(seed),grp=act(s,'formGroup',newGroup());
 A.equal(grp.formed,true);
 const w=s.table.realm,e=G.lookup(w,grp.id);
 A.ok(e);A.equal(e.members,1);
 return {s,w,e,id:grp.id};
}
function invite(x,npcId='elira',proposal=offer){
 return act(x.s,'inviteGroupMember',{groupId:x.id,npcId,proposal});
}
function accepted(seed){
 const x=setup(seed);
 Agency.ensure(x.w).rngState=seedFor(r=>r<.001);
 const beforeDice=x.s.rngState,priorTime=x.s.world.minutes;
 const ans=invite(x);
 A.equal(ans.discussed,true);
 A.equal(ans.decision,'accepted');
 A.equal(ans.joined,true);
 A.equal(ans.knownMembers,2);
 A.equal(ans.minutes,18);
 A.equal(x.s.world.minutes,priorTime+18);
 A.equal(x.s.rngState,beforeDice);
 A.equal(ans.noCompulsoryFees,true);
 A.equal(ans.noAutomaticKinship,true);
 A.equal(x.s.player.family,null);
 A.equal(x.s.player.arcane.circles,0);
 A.equal(x.s.table.meridianTechniques,undefined);
 A.equal(x.e.members,2);A.equal(x.e.verifiedMembers,2);
 A.equal(x.e.additionalMembers[0].actorId,'npc:elira');
 A.equal(x.e.additionalMembers[0].name,E.NPCS.elira.name);
 A.equal(x.e.additionalMembers[0].active,true);
 A.equal(x.e.additionalMembers[0].hash,G.hash(x.e.additionalMembers[0].witness));
 A.equal(G.validate(x.e),true);
 A.equal(act(x.s,'groupsStatus').groups[0].memberCount,2);
 const own=act(x.s,'groupMembersStatus',{groupId:x.id});
 A.equal(own.reportedMembers,2);
 A.equal(own.knownPeople.length,2);
 A.equal(own.witnessedInvitations[0].independentAnswer,'accepted');
 return x;
}
{
 const s=fresh(998100),before=E.exportGame(s),oldRng=s.rngState;
 A.throws(()=>act(s,'inviteGroupMember',{
  groupId:'not-established',npcId:'elira',proposal:offer}),
  /Only a genuinely formed player-led group/);
 A.throws(()=>act(s,'groupMembersStatus',{groupId:'not-established'}),
  /Personal membership records belong/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,oldRng);
 const x=setup(998101);
 A.throws(()=>act(x.s,'inviteGroupMember',{
  groupId:x.id,npcId:'elira',proposal:offer,forceConsent:true}),
  /only the actual NPC/);
 A.throws(()=>act(x.s,'inviteGroupMember',{
  groupId:x.id,npcId:'unknown_noble',proposal:offer}),
  /actual established individual/);
 A.throws(()=>act(x.s,'inviteGroupMember',{
  groupId:x.id,npcId:'sera',proposal:offer}),
  /actual established individual/);
 A.equal(x.e.members,1);
 A.equal(x.e.invitations,undefined);
 A.equal(x.s.player.family,null);
}
{
 accepted(998102);
}
{
 const x=setup(998103);
 Agency.ensure(x.w).rngState=seedFor(r=>r>.995);
 const previous=x.s.player.coins;
 const reply=invite(x);
 A.equal(reply.decision,'declined');
 A.equal(reply.joined,false);
 A.equal(x.e.members,1);
 A.equal(x.e.invitations.at(-1).decision,'declined');
 A.equal(x.s.player.coins,previous);
 const frozen=E.exportGame(x.s);
 A.throws(()=>invite(x),/already answered an association invitation today/);
 A.equal(E.exportGame(x.s),frozen);
 A.equal(x.s.rngState,reply.noCompulsoryFees?x.s.rngState:x.s.rngState);
 W.advance(x.s,1);
 A.equal(x.e.members,1);
 // A new real approach is possible later. Refusal is not an eternal ban.
 Agency.ensure(x.w).rngState=seedFor(r=>r<.001);
 const again=invite(x);
 A.equal(again.decision,'accepted');
 A.equal(x.e.members,2);
 A.equal(x.e.invitations.length,2);
}
{
 const x=setup(998104),p=offer+' I will continue the discussion without assuming your agreement.';
 let found=null;
 for(let i=1;i<120000;i++){
  const t={rngState:i},a=Agency.evaluate(x.w,t,x.e,E.NPCS.elira,p,0);
  if(a.decision==='considering'){found=i;break;}
 }
 A.ok(found);
 Agency.ensure(x.w).rngState=found;
 const r=invite(x,'elira',p);
 A.equal(r.decision,'considering');
 A.equal(r.joined,false);
 A.equal(x.e.members,1);
 A.ok(r.heard.includes('have not agreed'));
}
{
 const x=accepted(998105),npc=x.e.additionalMembers[0],
  before=x.e.members,prior=x.s.rngState;
 // A genuine world month lets a known member volunteer real time without
 // taking player coins, employment rights or other residents' money.
 x.w.ticks.months=1;x.e.status='organising';
 Agency.ensure(x.w).rngState=seedFor((r,t)=>r<.005&&
  1+Math.floor(Agency.draw(t)*20)===20);
 const notices=[];
 Agency.month(x.w,30,n=>{x.w.chronicle.push({...n,publiclyKnown:true});notices.push(n);});
 A.equal(x.e.memberServiceMinutes,90);
 A.equal(x.e.memberServiceSuccesses,1);
 A.equal(x.e.memberServiceFailures||0,0);
 A.equal(x.e.members,before);
 A.equal(npc.lastServiceMonth,1);
 A.equal(x.s.rngState,prior);
 A.equal(notices.length,1);
 A.equal(notices[0].releaseDay,36);
 A.ok(notices[0].text.includes(E.NPCS.elira.name));
 const last=x.w.emergentGroups.history.at(-1);
 A.equal(last.kind,'verified-volunteer-work');
 A.equal(last.details.actualWorkMinutes,90);
 A.equal(last.details.roll,20);
 A.equal(last.details.success,true);
 A.equal(last.details.memberId,'npc:elira');
 A.equal(x.s.player.family,null);
 A.equal(x.s.player.arcane.circles,0);
}
{
 const x=accepted(998106);
 x.w.ticks.months=1;x.e.status='organising';
 Agency.ensure(x.w).rngState=seedFor((r,t)=>r<.005&&
  1+Math.floor(Agency.draw(t)*20)===1);
 const notices=[];
 Agency.month(x.w,30,n=>notices.push(n));
 A.equal(x.e.memberServiceMinutes,90);
 A.equal(x.e.memberServiceSuccesses||0,0);
 A.equal(x.e.memberServiceFailures,1);
 A.equal(notices.length,0);
 A.equal(x.e.members,2);
 A.equal(x.w.emergentGroups.history.at(-1).kind,'unsuccessful-volunteer-work');
}
{
 const x=accepted(998107),m=x.e.additionalMembers[0];
 const startHash=m.hash,joinedDay=m.witness.details.day;
 A.equal(m.active,true);
 x.e.status='inactive';x.e.unfundedMonths=5;
 x.w.ticks.months=4;
 Agency.ensure(x.w).rngState=seedFor(r=>r<.001);
 const news=[];
 Agency.month(x.w,120,n=>{x.w.chronicle.push({...n,publiclyKnown:true});news.push(n);});
 A.equal(x.e.members,1);
 A.equal(m.active,false);
 A.equal(m.departure.origin,Agency.DEPART);
 A.equal(m.departure.day,120);
 A.equal(m.departure.hash,G.hash(m.departure.witness));
 A.equal(m.hash,startHash);
 A.equal(G.validate(x.e),true);
 A.equal(news.length,1);
 A.ok(news[0].text.includes('independently stepped back'));
 A.equal(news[0].releaseDay,126);
 A.equal(act(x.s,'groupsStatus').groups[0].memberCount,2,
  'Founder cannot instantly know a private offscreen withdrawal');
 x.s.world.minutes=126*1440;
 A.equal(act(x.s,'groupsStatus').groups[0].memberCount,1);
 A.equal(act(x.s,'groupMembersStatus',{groupId:x.id}).reportedMembers,1);
 // Former individual has no forced permanent ban on coming back, and
 // previous contribution records survive their departure.
 const firstMembership=x.e.additionalMembers[0].witness;
 const prior=G.hash(firstMembership);
 Agency.ensure(x.w).rngState=seedFor(r=>r<.001);
 const back=invite(x);
 A.equal(back.joined,true);
 A.equal(x.e.members,2);
 A.equal(x.e.additionalMembers.length,2);
 A.equal(x.e.additionalMembers[0].hash,prior);
 A.equal(x.e.additionalMembers[0].active,false);
 A.equal(x.e.additionalMembers[1].active,true);
 A.ok(x.e.additionalMembers[1].witness.details.day>joinedDay);
 A.equal(G.validate(x.e),true);
 A.equal(x.s.player.family,null);
}
console.log('Living NPC group membership: in-person freeform consent, refusal, deferral, independent work, hardship departures and genuine later rejoining');
