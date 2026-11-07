'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),
 Path=require('node:path'),OS=require('node:os'),
 E=require('../engine.js'),G=require('../world/emergent-groups'),
 W=require('../rules/world'),Turn=require('../scripts/chat-turn.js'),
 Agency=require('../world/group-member-agency');
const names={name:'Unchartered Wetland Refuge Circle',
 kind:'informal inclusive multi-profession voluntary community',
 purpose:'Give any willing local residents practical chances to inspect and improve public wetland refuges.'};
const offer='You would be welcome to share expertise while keeping your other obligations and your right to leave.';
const game=seed=>E.newGame({seed,name:'Open Group Member Persistence Test',path:'undecided'});
function seedFor(lo,hi){
 for(let i=1;i<100000;i++){
  const t={rngState:i},x=Agency.draw(t);
  if(x>=lo&&x<hi)return i;
 }
 throw Error('No real persisted independent world RNG source for result');
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-group-membership-live-'));
 try{
  const file=Path.join(dir,'save.json'),s=game(998201);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const baseline=FS.readFileSync(file,'utf8');
  const founder={id:'new_group_with_people_0001',mode:'rule',system:'social',
   operation:'formGroup',params:names};
  const formed=Turn.execute(file,founder);
  A.equal(formed.applied,true);
  A.equal(Turn.execute(file,founder).duplicate,true);
  const id=formed.output.rules.id;
  const snapshot=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(G.lookup(snapshot.table.realm,id).members,1);
  // Reading a personal association status NEVER advances its NPC decisions.
  const read={id:'group_members_view_0001',mode:'rule',system:'social',
   operation:'groupMembersStatus',params:{groupId:id}};
  const frozen=FS.readFileSync(file,'utf8');
  const beforeRead=Turn.execute(file,read);
  A.equal(beforeRead.applied,false);
  A.equal(beforeRead.output.rules.reportedMembers,1);
  A.equal(FS.readFileSync(file,'utf8'),frozen);
  const injected={id:'invent_npc_assent_0001',mode:'rule',system:'social',
   operation:'inviteGroupMember',params:{groupId:id,npcId:'elira',
    proposal:offer,assent:'yes',royalOath:true}};
  A.throws(()=>Turn.execute(file,injected),/only the actual NPC/);
  A.equal(FS.readFileSync(file,'utf8'),frozen);
  // Force the engine's *private* independent RNG on this disposable save:
  // no caller parameter controls a yes/no or re-roll.
  const state=E.importGame(FS.readFileSync(file,'utf8'));
  Agency.ensure(state.table.realm).rngState=seedFor(0,.003);
  FS.writeFileSync(file,E.exportGame(state)+'\n');
  const invite={id:'actual_in_person_invite_0001',mode:'rule',system:'social',
   operation:'inviteGroupMember',
   params:{groupId:id,npcId:'elira',proposal:offer}};
  const yes=Turn.execute(file,invite);
  A.equal(yes.applied,true);
  A.equal(yes.output.rules.decision,'accepted');
  A.equal(yes.output.rules.knownMembers,2);
  A.equal(Turn.execute(file,invite).duplicate,true);
  const final=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(G.lookup(final.table.realm,id).members,2);
  A.equal(G.validate(G.lookup(final.table.realm,id)),true);
  A.equal(final.player.family,null);
  A.equal(final.player.arcane.circles,0);
  A.equal(final.player.coins,s.player.coins);
  const viewBefore=FS.readFileSync(file,'utf8');
  const later=Turn.execute(file,{...read,id:'group_members_view_0002'});
  A.equal(later.applied,false);
  A.equal(later.output.rules.reportedMembers,2);
  A.equal(later.output.rules.knownPeople.length,2);
  A.equal(FS.readFileSync(file,'utf8'),viewBefore);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
{
 // Over multiple genuine world years NPCs keep independent agency, but
 // nobody is mechanically forced to abandon a healthy, funded association.
 const a=game(998205),b=game(998205);
 for(const s of [a,b]){
  const R=require('../rules');
  const form=R.act(s,{system:'social',operation:'formGroup',params:names});
  const g=G.lookup(s.table.realm,form.id);
  g.funds=80;
  const agent=Agency.ensure(s.table.realm);
  agent.rngState=seedFor(0,.003);
  const yes=R.act(s,{system:'social',operation:'inviteGroupMember',
   params:{groupId:form.id,npcId:'elira',proposal:offer}});
  A.equal(yes.joined,true);
 }
 W.advance(a,720);W.advance(b,720);
 A.deepEqual(a.table.realm,b.table.realm);
 const world=a.table.realm,e=Object.values(world.emergentGroups.entries)[0];
 A.equal(e.origin,'player-declaration');
 A.equal(G.validate(e),true);
 A.ok(e.memberServiceMinutes>=0);
 A.ok(e.memberServiceSuccesses>=0||e.memberServiceSuccesses===undefined);
 A.ok(e.memberServiceFailures>=0||e.memberServiceFailures===undefined);
 A.equal(a.player.family,null);
 A.equal(a.player.arcane.circles,0);
 A.equal(a.table.meridianTechniques,undefined);
}
console.log('Private file-backed group member choices are idempotent, witnessed and read-only where required; multi-year NPC contributions are deterministic');
