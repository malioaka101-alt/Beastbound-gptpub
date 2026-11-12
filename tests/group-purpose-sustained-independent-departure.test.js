'use strict';
// An existing group's witnessed changing freeform purposes can create
// individual sustained dissent and an OPTIONAL real later departure using
// only the original independent member agency/world tick and group ledger.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),W=require('../rules/world'),
 G=require('../world/emergent-groups'),Agency=require('../world/group-member-agency');
const act=(s,operation,params)=>R.act(s,{system:'social',operation,params});
const invite='Would you freely join our local circle and independently decide whether you agree with its direction, knowing you may later leave without permission or penalty?';
const discussion='The real consenting member hears the new publicly declared original direction and privately weighs its consequences without having a stance imposed by the founder.';
const purpose1='Observe seasonal crossings and share freely obtained practical river-safety field notes with neighbours';
const purpose2='Study ordinary low-impact refuge repair techniques with independent local environmental evidence';
const reason='The founder genuinely revises the voluntary group objective after seeing a new community interest and the need for careful practical attention.';
function seedFor(fn){
 for(let n=1;n<100000;n++){
  const rng={rngState:n},v=Agency.draw(rng);
  if(fn(v))return n;
 }
 throw Error('No original agency draw matched this fixture');
}
function pairFor(fn){
 for(let n=1;n<100000;n++){
  const rng={rngState:n},a=Agency.draw(rng),b=Agency.draw(rng);
  if(fn(a,b))return n;
 }
 throw Error('No original agency double draw matched this fixture');
}
function setup(seed,num=2){
 const s=E.newGame({seed,name:'Disposable Source-Verified Living Group',path:'undecided'});
 const original=act(s,'formGroup',{name:'Free Wetland Maintenance and River Observation Circle',
 kind:'voluntary independent community working and research cooperative',
 purpose:'Share real local river observations without binding independent participants to any future founder decision'});
 const w=s.table.realm,e=G.lookup(w,original.id),agency=Agency.ensure(w);
 for(const npcId of ['elira','otto']){
  agency.rngState=seedFor(x=>x<.002);
  const joined=act(s,'inviteGroupMember',{groupId:e.id,npcId,proposal:invite});
  A.equal(joined.decision,'accepted');
 }
 const initial=e.charter.duty,oldFunds=e.funds;
 const views=[];
 for(let i=0;i<num;i++){
  const changed=act(s,'restateGroupPurpose',{
   groupId:e.id,purpose:i===0?purpose1:purpose2,reason});
  agency.rngState=seedFor(x=>x>.43&&x<.47);
  const result=act(s,'discussGroupPurpose',{
   groupId:e.id,revisionId:changed.revisionId,npcId:'otto',discussion});
  A.equal(result.stance,'dissented');
  views.push({revisionId:changed.revisionId,
   personalResponseHash:e.purposeResponses.at(-1).sourceHash});
 }
 A.equal(e.members,3);
 A.equal(e.charter.duty,initial);
 A.equal(G.validate(e),true);
 W.advance(s,6);
 return {s,w,e,agency,initial,oldFunds,views};
}
{
 const {s,w,e,agency,views}=setup(997851,2);
 const day=w.lastTickDay,
  sources=Agency.independentPurposeDissentEvidence(e,'npc:otto',day);
 A.equal(sources.length,2);
 A.equal(new Set(sources.map(x=>x.revisionId)).size,2,
  'independent tensions are distinct actual original freeform changes');
 A.deepEqual(new Set(sources.map(x=>x.personalResponseHash)),
  new Set(views.map(x=>x.personalResponseHash)));
 A.equal(Agency.independentPurposeDissentEvidence(e,'npc:elira',day).length,0);
 const noFake=E.exportGame(s),coins=s.player.coins,groupBalance=e.funds;
 agency.rngState=pairFor((a,b)=>a>.95&&b<.09);
 W.advance(s,24);
 const member=e.additionalMembers.find(x=>x.actorId==='npc:otto');
 A.equal(e.members,2,'a personal decision after actual tension changes real group membership');
 A.equal(member.active,false);
 A.equal(member.departure.origin,Agency.DEPART);
 const d=member.departure.witness.details;
 A.equal(d.actualPressure,Agency.PURPOSE_DISSENT_PRESSURE);
 A.equal(d.voluntaryWithdrawal,true);
 A.equal(d.optionalPersonalDecision,true);
 A.equal(d.notEnforcedFactionExpulsion,true);
 A.equal(d.noAutomaticOfficeOrFundingTransfer,true);
 A.deepEqual(d.disagreementEvidence,sources);
 A.equal(d.choiceDraw<d.withdrawalChance,true);
 const replay={rngState:d.agencyBefore};
 A.equal(Agency.draw(replay),d.choiceDraw);
 A.equal(replay.rngState,d.agencyAfter);
 A.equal(s.player.coins,coins);
 A.ok(e.funds<=groupBalance,
  'member departure did not mint previously nonexistent group money');
 A.equal(G.reportedMemberCount(e,w.lastTickDay),3);
 A.equal(G.reportedMemberCount(e,w.lastTickDay+6),2);
 A.equal(G.validate(e),true);
 const saved=E.exportGame(s),restored=E.importGame(saved),
  rr=G.lookup(restored.table.realm,e.id);
 A.equal(E.exportGame(restored),saved);
 A.equal(rr.additionalMembers.find(x=>x.actorId==='npc:otto').active,false);
 A.equal(G.validate(rr),true);
 const untouched=structuredClone(member.departure);
 member.departure.witness.details.disagreementEvidence[0].personalResponseHash='0'.repeat(64);
 A.equal(G.validate(e),false,'rewriting original dissent cannot justify an invented exit');
 member.departure=untouched;
 A.equal(G.validate(e),true);
}
{
 const {s,w,e,agency}=setup(997852,2);
 A.equal(Agency.independentPurposeDissentEvidence(e,'npc:otto',w.lastTickDay).length,2);
 agency.rngState=pairFor((a,b)=>a>.95&&b>.91);
 W.advance(s,24);
 A.equal(e.members,3,'the individual can independently decide to stay despite genuine tension');
 A.equal(e.additionalMembers.find(x=>x.actorId==='npc:otto').active,true);
 A.equal(G.validate(e),true);
}
{
 const {s,w,e,agency}=setup(997853,1);
 A.equal(Agency.independentPurposeDissentEvidence(e,'npc:otto',w.lastTickDay).length,1);
 agency.rngState=pairFor((a,b)=>a>.95&&b<.02);
 W.advance(s,24);
 A.equal(e.members,3,'a single change does not become presumed sustained public conflict');
 A.equal(G.validate(e),true);
}
{
 const {s,w,e,agency,views}=setup(997854,2);
 const mostRecent=views.at(-1).revisionId;
 agency.rngState=seedFor(x=>x<.001);
 const changed=act(s,'discussGroupPurpose',{groupId:e.id,
  revisionId:mostRecent,npcId:'otto',discussion});
 A.equal(changed.previousStance,'dissented');
 A.equal(changed.stance,'supported');
 A.equal(Agency.independentPurposeDissentEvidence(e,'npc:otto',w.lastTickDay).length,0,
  'an independently changed positive view removes current continuing purpose dissent');
 agency.rngState=pairFor((a,b)=>a>.95&&b<.02);
 W.advance(s,24);
 A.equal(e.members,3,'prior dissent is not permanent forced political enmity');
 A.equal(G.validate(e),true);
}
console.log('Living group changing purpose has original individually witnessed sustained disagreement, optional original agency exit, right to stay or later reconcile, exact source/draw replay, conservation and durable save PASS');
