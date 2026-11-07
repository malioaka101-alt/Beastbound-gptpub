'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),
 Path=require('node:path'),OS=require('node:os'),
 E=require('../engine.js'),Rules=require('../rules'),
 W=require('../rules/world'),Realm=require('../world/simulation'),
 People=require('../world/person-presence'),
 Groups=require('../world/emergent-groups'),
 Agency=require('../world/group-member-agency'),
 Turn=require('../scripts/chat-turn');
const fresh=seed=>E.newGame({seed,name:'Public Encounter Witness Test',path:'undecided'});
const act=(s,operation,params={})=>Rules.act(s,{system:'social',operation,params});
const group={name:'Open Neighbourhood Field Library',kind:'free voluntary practical study community',
 purpose:'Work together on independently checked local safety notes without requiring guild membership or inherited standing.'};
const proposal='Would you like to join our independent local field-library group voluntarily while keeping your own professional work, privacy and right to leave?';
function lowSeed(){
 for(let i=1;i<100000;i++){
  const t={rngState:i};
  if(Agency.draw(t)<.001)return i;
 }
 throw Error('Cannot source an independently drawn acceptance');
}
function candidate(){
 for(let seed=510001;seed<510200;seed++){
  const s=fresh(seed),w=Realm.ensure(s);
  const shift=Object.values(w.personPresence.roster)
   .find(x=>x.location==='crossing');
  if(shift)return {s,w,shift};
 }
 throw Error('An independent local duty schedule was never realised');
}
{
 const {s,w,shift}=candidate();
 const id=shift.npcId;
 A.equal(Object.keys(w.notables).length,48);
 A.equal(People.verified(w,shift),true);
 A.equal(People.resolve(w,id,'academy',shift.fromDay),null);
 A.equal(People.resolve(w,id,'crossing',shift.fromDay-1),null);
 const before=E.exportGame(s);
 const beforeLocal=act(s,'localPeopleStatus');
 A.equal(E.exportGame(s),before);
 A.ok(beforeLocal.people.some(x=>x.npcId==='elira'));
 A.equal(beforeLocal.people.some(x=>x.npcId===id),false);
 A.throws(()=>act(s,'localPeopleStatus',{name:shift.name,forcePresence:true}),
  /read-only/);
 A.equal(E.exportGame(s),before);
 W.advance(s,shift.fromDay);
 const alive=act(s,'localPeopleStatus');
 A.ok(alive.people.some(x=>x.npcId===id));
 A.equal(alive.people.find(x=>x.npcId===id).name,shift.name);
 const read=E.exportGame(s);
 A.deepEqual(act(s,'localPeopleStatus'),alive);
 A.equal(E.exportGame(s),read);
 const made=act(s,'formGroup',group);
 const e=Groups.lookup(w,made.id);
 A.equal(e.members,1);
 A.throws(()=>act(s,'inviteGroupMember',{groupId:e.id,
   npcId:id,proposal,forceYes:true}),/only the actual NPC/);
 A.equal(e.members,1);
 Agency.ensure(w).rngState=lowSeed();
 const rngBefore=s.rngState,joined=act(s,'inviteGroupMember',{
  groupId:e.id,npcId:id,proposal
 });
 A.equal(joined.decision,'accepted');
 A.equal(joined.joined,true);
 A.equal(joined.knownMembers,2);
 A.equal(joined.minutes,18);
 A.equal(s.rngState,rngBefore);
 A.equal(e.additionalMembers[0].actorId,id);
 A.equal(e.additionalMembers[0].name,shift.name);
 A.equal(e.additionalMembers[0].witness.details.presence.hash,shift.hash);
 A.equal(Groups.validate(e),true);
 A.equal(act(s,'groupMembersStatus',{groupId:e.id}).reportedMembers,2);
 A.equal(s.player.family,null);
 A.equal(s.player.arcane.circles,0);
 A.equal(s.table.meridianTechniques,undefined);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-person-presence-'));
 try{
  const save=Path.join(dir,'save.json');
  FS.writeFileSync(save,E.exportGame(s)+'\n');
  const frozen=FS.readFileSync(save,'utf8');
  const q={id:'local_people_read_0001',mode:'rule',system:'social',
   operation:'localPeopleStatus',params:{}};
  const result=Turn.execute(save,q);
  A.equal(result.applied,false);
  A.ok(result.output.rules.people.some(x=>x.npcId===id));
  A.equal(FS.readFileSync(save,'utf8'),frozen);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
 W.advance(s,35);
 A.equal(Groups.validate(e),true);
 A.equal(People.resolve(w,id,'crossing',Math.floor(s.world.minutes/1440))?.presence?.hash===shift.hash,false);
 A.equal(e.additionalMembers[0].active!==false||!!e.additionalMembers[0].departure,true);
 A.equal(e.additionalMembers[0].witness.details.presence.hash,shift.hash);
}
{
 // A professional directory and a public name never magically make an
 // absent person locally available; no arbitrary foreign citizen is invited.
 const s=fresh(510400),w=Realm.ensure(s);
 const id='notable:reef_cantons_civic';
 A.ok(w.notables.reef_cantons_civic);
 A.equal(People.resolve(w,id,'crossing',0),null);
 const made=act(s,'formGroup',group);
 const before=E.exportGame(s);
 A.throws(()=>act(s,'inviteGroupMember',
  {groupId:made.id,npcId:id,proposal}),/actual established individual/);
 A.equal(E.exportGame(s),before);
}
console.log('Source-attested real local professionals can freely decide, persist membership and keep private status read-only without fabricated people or presence');
