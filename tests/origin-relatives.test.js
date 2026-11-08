'use strict';
// Real new campaign fixtures only. No existing player save or trial is touched.
const A=require('node:assert/strict');
const FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const Engine=require('../engine');
const New=require('../scripts/new-campaign');
const Kin=require('../world/origin-relatives');
const Realm=require('../world/simulation');
const Presence=require('../world/person-presence');
const Rules=require('../rules');
const World=require('../rules/world');
const Turn=require('../scripts/chat-turn');
function fresh(seed,opts={}){
 return New.create({seed,slug:'origin_relatives_fixture',...opts}).state;
}
let seenKnown=0,seenLocal=0,distant=0;
for(let seed=1;seed<=100;seed++){
 const a=fresh(seed),b=fresh(seed);
 A.deepEqual(a,b,'Character and world family schedules must be seeded once');
 const s=Engine.importGame(Engine.exportGame(a));
 const w=Realm.peek(s),t=Kin.ensure(w);
 A.ok(t);
 A.equal(t.ownerName,s.player.name);
 A.equal(t.seed,seed);
 A.equal(t.homeRegionId,s.campaign.origin.birthRegionId);
 A.equal(Object.keys(t.people).length,s.player.family.members.length);
 for(const [i,m] of s.player.family.members.entries()){
  const p=t.people['kin_'+(i+1)];
  A.equal(p.name,m.name);
  A.equal(p.relation,m.relation);
  A.equal(Kin.verify(w,p),true);
  A.equal(p.source.noAutomaticInheritance,true);
  A.ok(p.status==='active');
  A.equal(p.history.length,0);
  seenKnown++;
 }
 const saved=Engine.exportGame(s),rng=s.rngState,clock=s.world.minutes;
 const known=Rules.act(s,{system:'social',operation:'originRelativesStatus',params:{}});
 A.equal(known.relatives.length,Object.keys(t.people).length);
 A.equal(s.world.minutes,clock);
 A.equal(s.rngState,rng);
 A.equal(Engine.exportGame(s),saved,'Kin status cannot generate world or hidden NPC knowledge');
 const people=Presence.localStatus(s,w).people.filter(p=>p.npcId.startsWith('origin-kin:'));
 for(const person of people){
  seenLocal++;
  const p=t.people[person.npcId.slice('origin-kin:'.length)];
  A.ok(Kin.presence(w,person.npcId,s.world.location,0));
  A.equal(Presence.proof(w,p.actorId,s.world.location,0,p.shift),true);
  A.equal(person.meetingIsNotAssent,true);
 }
 if(s.campaign.origin.travelBeforePlay){
  distant++;
  A.equal(people.length,0,'A character from a foreign country cannot summon distant kin');
 }
 A.equal(s.player.meridian.stage,0);
 A.equal(s.player.arcane.circles,0);
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(s.player.partnerIds.length>0,s.player.path==='partner');
}
A.ok(seenKnown>80,'Random starting households preserve named individual identities');
A.ok(distant>40,'Independent family origins must cover remote places');
const remote=fresh(400001,{mode:'guided',homeRegion:'forge_basin',
 startLocation:'crossing',originKind:'renowned-family',
 houseId:'emberhand',houseRelation:'birth-branch'});
A.equal(remote.player.family.house.id,'emberhand');
A.equal(Presence.localStatus(remote,Realm.peek(remote)).people.some(x=>
 x.npcId.startsWith('origin-kin:')),false);
A.throws(()=>Kin.talk(remote,{npcId:'origin-kin:kin_1',
 question:'Tell me about our family.'}),/not independently present/);
const knownRemote=Kin.status(remote);
A.ok(knownRemote.relatives.every(x=>x.lastPersonallyHeard===null));
A.equal(remote.player.skills.cultivation.rank,0);
A.equal(remote.player.arcane.circles,0);
A.equal(remote.player.origin.stableTraits.length,0);

let local=null,actor=null;
for(let seed=1;seed<=80;seed++){
 const s=fresh(500000+seed,{mode:'guided',
  homeRegion:'morrowfen_basin',startLocation:'crossing',
  originKind:'ordinary'});
 const person=Presence.localStatus(s,Realm.peek(s)).people.find(x=>
  x.npcId.startsWith('origin-kin:'));
 if(person){local=s;actor=person;break;}
}
A.ok(local&&actor,'Some independently scheduled family members are genuinely in the local opening');
const w=Realm.peek(local),person=w.originKin.people[actor.npcId.slice('origin-kin:'.length)];
A.equal(Kin.verify(w,person),true);
A.equal(Presence.identity(w,actor.npcId).name,actor.name);
const initialMinutes=local.world.minutes;
const q={npcId:actor.npcId,question:'What is the work of our household?'};
const response=Rules.act(local,{system:'social',operation:'speakOriginRelative',params:q});
A.equal(local.world.minutes,initialMinutes+response.minutes);
A.equal(response.noAutomaticBenefits,true);
A.equal(local.player.meridian.stage,0);
A.equal(local.player.arcane.circles,0);
A.equal(local.player.coins,85);
A.equal(Kin.status(local).relatives.find(r=>r.npcId===actor.npcId).
 lastPersonallyHeard,response.heard);
const previousClock=local.world.minutes,prevRng=person.rngState;
const repeated=Rules.act(local,{system:'social',operation:'speakOriginRelative',params:q});
A.equal(repeated.alreadyAsked,true);
A.equal(local.world.minutes,previousClock);
A.equal(person.rngState,prevRng,'Repeated question cannot reroll a relative');
const inspect=Kin.status(local);
A.ok(inspect.relatives.find(x=>x.npcId===actor.npcId).lastPersonallyHeard);
A.throws(()=>Kin.talk(local,{...q,agreed:true}),/without supplying their response/);
A.throws(()=>Kin.talk(local,{...q,coins:9000}),/without supplying their response/);

const oldSave=Engine.exportGame(local);
const next=Engine.importGame(oldSave);
const prior=next.player.coins;
World.advance(next,13);
const tw=Realm.peek(next),register=Kin.ensure(tw);
A.ok(register.lastSixday>=6);
A.ok(Object.values(register.people).every(p=>Kin.verify(tw,p)));
A.ok(Object.values(register.people).some(p=>p.history.length>=1));
A.equal(next.player.coins,prior,'Relatives independent earnings are not player income');
A.equal(next.player.meridian.stage,0);
const anchor=Object.values(register.people)[0],copy=structuredClone(anchor.source);
anchor.source.relation='unproven forged relation';
A.equal(Kin.verify(tw,anchor),false);
A.throws(()=>Kin.sixday(tw,register.lastSixday+7),/lost their founding source/);
anchor.source=copy;
A.equal(Kin.verify(tw,anchor),true);
A.equal(Kin.sixday(tw,register.lastSixday).duplicate,true);

const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-origin-kin-'));
try{
 const file=Path.join(dir,'save.json');
 const start=fresh(500999,{mode:'guided',homeRegion:'morrowfen_basin',
  startLocation:'crossing'});
 FS.writeFileSync(file,Engine.exportGame(start)+'\n');
 const original=FS.readFileSync(file,'utf8');
 const status=Turn.execute(file,{id:'origin_kin_status_001',mode:'rule',
  system:'social',operation:'originRelativesStatus',params:{}});
 A.equal(status.ok,true);
 A.equal(status.applied,false,'Family status is a read-only real turn');
 A.equal(FS.readFileSync(file,'utf8'),original,'Read-only origin status cannot rewrite a save');
 const peer=Presence.localStatus(start,Realm.peek(start)).people.find(p=>
  p.npcId.startsWith('origin-kin:'));
 if(peer){
  const req={id:'origin_kin_converse_001',mode:'act',
   action:'talk to '+peer.name+' about our family'};
  const talk=Turn.execute(file,req);
  A.equal(talk.ok,true);
  A.equal(talk.applied,true);
  A.equal(talk.output.npc.noAutomaticBenefits,true);
  const saved=FS.readFileSync(file,'utf8');
  const second=Turn.execute(file,req);
  A.equal(second.duplicate,true);
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('Starting kin: independent source-backed relatives, scheduled local presence, real civil world ticks, witnessed dialogue/refusal, honest read-only status, seed replay and no automatic family benefits');
