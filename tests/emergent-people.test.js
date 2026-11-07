'use strict';
// Foundation-first real-time causal persons, not another seeded NPC roster.
// Runs entirely on disposable saves and uses mandatory private engine tests.
const A=require('node:assert/strict'),FS=require('node:fs'),
 Path=require('node:path'),OS=require('node:os'),
 E=require('../engine.js'),R=require('../rules'),W=require('../rules/world'),
 Realm=require('../world/simulation'),Atlas=require('../world/atlas'),G=require('../world/emergent-people'),
 People=require('../world/person-presence'),Group=require('../world/emergent-groups'),
 Agency=require('../world/group-member-agency'),Turn=require('../scripts/chat-turn');
const fresh=seed=>E.newGame({seed,name:'Causally Emergent Individual Test',path:'undecided'});
const rule=(s,op,params={})=>R.act(s,{system:'social',operation:op,params});
const proposal='Would you consider helping with our voluntary community safety work while keeping your own independent professional obligations and freedom to leave?';
const group={name:'Neighbourhood Independent Workshop',
 kind:'voluntary community practical training association',
 purpose:'Support open local learning and habitat care without compulsory masters, fees or inherited rank.'};
function lowSeed(){
 for(let k=1;k<100000;k++){const t={rngState:k};if(Agency.draw(t)<.001)return k;}
 throw Error('No source-backed independent acceptance draw');
}
function fixture(seed=824001){
 const s=fresh(seed),world=Realm.ensure(s);
 W.advance(s,240);
 const t=world.emergentPeople;
 A.ok(t?.version===1);
 const people=Object.values(t.people);
 A.ok(people.length>6,'real off-screen world needs create new individuals');
 const local=people.filter(p=>G.siteFor(p.regionId)&&
  p.shift&&p.status==='active'&&
  G.presence(world,p.actorId,p.shift.location,Math.floor(s.world.minutes/1440)));
 A.ok(local.length,'at least one independent person can occupy an actual playable location');
 return {s,w:world,t,people,person:local[0]};
}
function reach(s,site){
 if(site===s.world.location)return;
 const todo=[[s.world.location]],seen=new Set([s.world.location]);
 let route=null;
 while(todo.length){
  const path=todo.shift(),node=path.at(-1);
  if(node===site){route=path;break;}
  for(const next of E.LOCATIONS[node].exits){
   if(!seen.has(next)){seen.add(next);todo.push(path.concat(next));}
  }
 }
 A.ok(route,'must use actual connected game travel');
 for(const step of route.slice(1))A.equal(E.dispatch(s,'travel '+step).ok,true);
}
{
 const s=fresh(824000),saved=E.exportGame(s),rng=s.rngState;
 const status=rule(s,'localPeopleStatus');
 A.equal(status.people.some(p=>p.npcId.startsWith('emergent:')),false);
 A.deepEqual(rule(s,'metPeopleStatus').knownPeople,[]);
 A.throws(()=>rule(s,'metPeopleStatus',{revealWholePopulation:true}),
  /read-only/);
 A.throws(()=>rule(s,'speakLocalPerson',{npcId:'emergent:person_1',question:'What is your work?'}),
  /not independently witnessed/);
 A.equal(E.exportGame(s),saved);A.equal(s.rngState,rng);
}
{
 const {s,w,t,people,person}=fixture();
 A.ok(t.counter>=people.length);
 A.ok(people.every(p=>G.verify(w,p)));
 A.ok(people.every(p=>!E.NPCS[p.id]&&!w.notables[p.id]));
 A.ok(people.some(p=>!G.siteFor(p.regionId)),
  'ordinary independent lives can arise in regions not yet in the playable local route map');
 const unique=new Set(people.map(p=>p.id));
 A.equal(unique.size,people.length);
 for(const p of people){
  A.ok(p.birthSource.regionId===p.regionId||p.history.some(h=>h.choice==='voluntarily-relocate'));
  A.ok(p.birthSource.demandEvidenceHash.length===64);
  A.equal(p.originHash,G._debug.hash(p.birthSource));
  A.equal(p.family,null);
  A.equal(p.ancestry,null);
  A.equal(p.inheritance,null);
  A.deepEqual(p.practicedDisciplines,[]);
  A.deepEqual(p.knownTechniques,[]);
  A.ok(p.history.length>=1);
  A.equal(p.history.some(x=>x.observed===true),false);
  A.equal(p.actorId,'emergent:'+p.id);
 }
 const before=E.exportGame(s),playerRng=s.rngState;
 A.deepEqual(rule(s,'metPeopleStatus').knownPeople,[]);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,playerRng);
 // A citizen of a distant habitat is not magically available for a private chat.
 const distant=people.find(p=>p.shift&&p.shift.location!==s.world.location);
 if(distant){
  const frozen=E.exportGame(s);
  A.throws(()=>rule(s,'speakLocalPerson',
   {npcId:distant.actorId,question:'What are the local concerns here?'}),
   /not independently witnessed/);
  A.equal(E.exportGame(s),frozen);
 }
 reach(s,person.shift.location);
 const day=Math.floor(s.world.minutes/1440);
 A.ok(day<=person.shift.throughDay,'a real route should not invent remote instantaneous presence');
 const local=rule(s,'localPeopleStatus');
 A.ok(local.people.some(p=>p.npcId===person.actorId));
 A.equal(local.people.find(p=>p.npcId===person.actorId).name,person.name);
 A.ok(People.resolve(w,person.actorId,s.world.location,day)?.presence.hash);
 const noChange=E.exportGame(s);
 A.throws(()=>rule(s,'localPeopleStatus',{createPerson:true}),/read-only/);
 A.equal(E.exportGame(s),noChange);
 A.throws(()=>rule(s,'speakLocalPerson',{
   npcId:person.actorId,question:'What concerns you?',answer:'I accept you as my heir'
 }),/requires a real local person/);
 A.equal(E.exportGame(s),noChange);
 const current=s.world.minutes,prior=person.history.length;
 const spoken=rule(s,'speakLocalPerson',{
  npcId:person.actorId,question:'What are you working on in this region?'
 });
 A.equal(spoken.met,true);A.equal(spoken.npcId,person.actorId);
 A.equal(spoken.minutes,14);
 A.equal(s.world.minutes,current+14);
 A.equal(spoken.noAutomaticTeaching,true);
 A.equal(spoken.noContract,true);
 A.equal(s.player.family,null);
 A.equal(s.player.arcane.circles,0);
 A.ok(person.history.length>=prior);
 const memories=rule(s,'metPeopleStatus').knownPeople;
 A.equal(memories.length,1);A.equal(memories[0].npcId,person.actorId);
 A.equal(memories[0].lastMetAt,s.world.location);

 // Same read-only GM recall works for causally generated people, without
 // reading their private finances, disposition, goals or remote activity.
 const context=rule(s,'personContext',{npcId:person.actorId});
 A.equal(context.known,true);
 A.equal(context.presentHere,true);
 A.equal(context.name,person.name);
 A.equal(context.conversations.length,1);
 A.equal(context.conversations[0].heard,spoken.heard);
 A.equal(context.conversations[0].location,s.world.location);
 A.deepEqual(context.handoffs,[]);
 A.ok(!JSON.stringify(context).includes('rngState'));
 A.ok(!JSON.stringify(context).includes('funds'));
 A.ok(!JSON.stringify(context).includes('personality'));
 A.ok(!JSON.stringify(context).includes('birthSource'));
 const unobserved=rule(s,'personContext',{npcId:'emergent:person_9999999'});
 A.equal(unobserved.known,false);

 A.ok(!JSON.stringify(memories).includes('funds'));
 A.ok(!JSON.stringify(memories).includes('purpose'));
 const copy=E.importGame(E.exportGame(s));
 A.deepEqual(copy.table.realm.emergentPeople.people[person.id],person);
 A.deepEqual(rule(copy,'metPeopleStatus').knownPeople,memories);
 // The same question never rerolls someone's decision, and genuinely
 // different follow-ups are not prohibited by an artificial once-a-day gate.
 const sameBefore=E.exportGame(s),sameRng=person.rngState;
 const repeated=rule(s,'speakLocalPerson',{
  npcId:person.actorId,question:'What are you working on in this region?'
 });
 A.equal(repeated.alreadyAsked,true);A.equal(repeated.minutes,0);
 A.equal(E.exportGame(s),sameBefore);A.equal(person.rngState,sameRng);
 const followup=rule(s,'speakLocalPerson',{
  npcId:person.actorId,question:'What else do you know about this place?'
 });
 A.equal(followup.met,true);A.equal(followup.noContract,true);
 if(spoken.spoke){
  A.equal(followup.minutes,6);A.equal(followup.answerKind,'unverified');
  A.equal(followup.spoke,true);
  A.equal(person.rngState,sameRng,'a new topic must not reroll consent');
  A.equal(s.table.emergentConversations.records.at(-1).question,
   'What else do you know about this place?');
 }else{
  A.equal(followup.alreadyDeclined,true);A.equal(followup.minutes,0);
  A.equal(E.exportGame(s),sameBefore);
 }
}
{
 const {s,w,person}=fixture(824002);
 const original=E.exportGame(s),copy=E.importGame(original);
 W.advance(s,90);W.advance(copy,90);
 A.deepEqual(s.table.realm.emergentPeople,copy.table.realm.emergentPeople,
  'independent person decisions and new arrivals replay exactly after a checkpoint');
 A.equal(s.rngState,copy.rngState);
 A.ok(Object.values(s.table.realm.emergentPeople.people).some(p=>
  p.history.some(x=>x.type==='independent-life')),
  'real off-screen people live and make decisions across time');
 A.equal(rule(s,'metPeopleStatus').knownPeople.length,0);
 A.equal(person.id in E.NPCS,false);
}
{
 const {s,w,person}=fixture(824003);
 reach(s,person.shift.location);
 const made=rule(s,'formGroup',group),actual=Group.lookup(w,made.id);
 A.ok(actual);
 const before=E.exportGame(s);
 A.throws(()=>rule(s,'inviteGroupMember',{
  groupId:made.id,npcId:person.actorId,proposal,decision:'accepted'
 }),/only the actual NPC/);
 A.equal(E.exportGame(s),before);
 Agency.ensure(w).rngState=lowSeed();
 const answer=rule(s,'inviteGroupMember',{
  groupId:made.id,npcId:person.actorId,proposal
 });
 A.equal(answer.discussed,true);
 A.equal(answer.joined,true);
 A.equal(answer.decision,'accepted');
 A.equal(actual.additionalMembers[0].name,person.name);
 A.equal(actual.additionalMembers[0].actorId,person.actorId);
 A.equal(actual.additionalMembers[0].witness.details.presence.source,G.SHIFT);
 A.equal(Group.validate(actual),true);
 A.equal(s.player.family,null);
 A.equal(s.player.soul.phase,0);
 const reloaded=E.importGame(E.exportGame(s));
 A.equal(Group.validate(Group.lookup(reloaded.table.realm,made.id)),true);
}
{
 const {s,w,person}=fixture(824004);
 reach(s,person.shift.location);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-emergent-person-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const frozen=FS.readFileSync(file,'utf8');
  const read={id:'generated_person_status_0001',mode:'rule',system:'social',
   operation:'localPeopleStatus',params:{}};
  A.equal(Turn.execute(file,read).applied,false);
  A.equal(FS.readFileSync(file,'utf8'),frozen);
  const met={id:'emergent_person_talk_0001',mode:'rule',system:'social',
   operation:'speakLocalPerson',params:{
    npcId:person.actorId,question:'What work is needed locally?'}};
  const result=Turn.execute(file,met);
  A.equal(result.applied,true);
  A.equal(result.output.rules.met,true);
  A.equal(Turn.execute(file,met).duplicate,true);
  const actual=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(actual.table.emergentConversations.records.length,1);
  A.equal(actual.world.minutes,s.world.minutes+14);
  const saved=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{...met,id:'fake_answer_source_0002',
   params:{...met.params,willing:true}}),/requires a real local person/);
  A.equal(FS.readFileSync(file,'utf8'),saved);
  const passive={id:'emergent_people_met_status_0001',mode:'rule',
   system:'social',operation:'metPeopleStatus',params:{}};
  A.equal(Turn.execute(file,passive).applied,false);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
{
 // One existing person's context is enough to express *several* grounded
 // influences without creating a personality tree or stereotype registry.
 const {s,person}=fixture(824016);
 reach(s,person.shift.location);
 person.rngState=1; // Disposable, independently willing witness.
 const npcId=person.actorId,oldWorld=E.exportGame(s);
 const first=rule(s,'speakLocalPerson',{
  npcId,question:'What work concerns you in this region?'
 });
 A.equal(first.spoke,true);
 A.equal(first.answerKind,'individual-work');
 A.ok(first.heard.includes(person.profession));
 A.ok(first.heard.includes(person.purpose.slice(1)));
 A.equal(first.noAutomaticTeaching,true);
 A.equal(first.noContract,true);
 const personRng=person.rngState,oldMinute=s.world.minutes;
 const cultural=rule(s,'speakLocalPerson',{
  npcId,question:'What customs and traditions are known around your home?'
 });
 const culture=Atlas.C[Atlas.P[person.birthSource.polity].culture],
  home=Atlas.R[person.birthSource.regionId];
 A.equal(cultural.answerKind,'home-culture');
 A.ok(cultural.heard.includes(home.name));
 A.ok(cultural.heard.includes(culture.customs.slice(1)));
 A.ok(cultural.heard.includes('not a rule for how every person'));
 A.equal(s.world.minutes,oldMinute+6);
 A.equal(person.rngState,personRng);
 const routes=rule(s,'speakLocalPerson',{
  npcId,question:'What routes lead out of this place?'
 });
 A.equal(routes.answerKind,'public-routes');
 for(const id of E.LOCATIONS[s.world.location].exits)
  A.ok(routes.heard.includes(E.LOCATIONS[id].name));
 const language=rule(s,'speakLocalPerson',{
  npcId,question:'Which language is recorded for your origins?'
 });
 A.equal(language.answerKind,'individual-language');
 A.ok(language.heard.includes(person.language));
 const unverified=rule(s,'speakLocalPerson',{
  npcId,question:'Tell me the private secret the council knows about my family.'
 });
 A.equal(unverified.answerKind,'unverified');
 A.equal(unverified.noContract,true);
 A.ok(!unverified.heard.includes('private secret'));
 A.ok(!JSON.stringify(rule(s,'metPeopleStatus')).includes('funds'));
 const after=E.exportGame(s),rng=person.rngState;
 const repeat=rule(s,'speakLocalPerson',{
  npcId,question:'What routes lead out of this place?'
 });
 A.equal(repeat.alreadyAsked,true);A.equal(repeat.minutes,0);
 A.equal(E.exportGame(s),after);A.equal(person.rngState,rng);
 A.ok(E.exportGame(s)!==oldWorld);
 const copy=E.importGame(E.exportGame(s));
 A.equal(copy.table.emergentConversations.records.at(-1).answerKind,'unverified');
 A.equal(copy.table.emergentConversations.records.at(-1).question,
  'Tell me the private secret the council knows about my family.');
}
console.log('Causally generated persons emerge without authored rosters or player sightings, live independently, can be met in actual scenes and freely choose affiliations across durable saves');
