'use strict';
// Shared original source: GM-established place -> actually present independent
// GM person -> player-founded association -> independent membership decision ->
// optional work proposal at the SAME lived place. No new social engine.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine'),R=require('../rules'),
 New=require('../scripts/new-campaign'),Opening=require('../scripts/gm-campaign-opening'),
 Places=require('../world/lived-places'),People=require('../world/emergent-people'),
 Presence=require('../world/person-presence'),Realm=require('../world/simulation'),
 G=require('../world/emergent-groups'),Agency=require('../world/group-member-agency'),
 Turn=require('../scripts/chat-turn');
const s=New.create({seed:802341,slug:'gm_place_voluntary_group_test',
 mode:'guided',homeRegion:'morrowfen_basin',age:24}).state;
const gmPlaceId='orchard_watch_home';
const actorName='Talia Meadow';
Opening.apply(s,{place:{placeId:gmPlaceId,
 name:'Orchard Watch Hall',regionId:s.campaign.origin.birthRegionId,
 description:'An inhabited small riverside hall with a stone threshold and a covered bench for ordinary record keeping.',
 kind:'small community hall',sceneType:'settlement',
 culture:'Neighbours preserve flood stories, but nobody automatically owes them money, work or authority.'},
 scene:'Talia Meadow is standing beside the bench at Orchard Watch Hall, checking river flood notes while the player observes.',
 focus:'Meet a working river surveyor',weather:'Clear cool river air',hour:10,minute:5});
const act=(system,operation,params={})=>R.act(s,{system,operation,params});
const witness='The GM personally witnessed Talia Meadow surveying the hall records while the player stood beside the bench.';
const created=act('social','introduceWitnessedPerson',{
 name:actorName,profession:'Independent riverbank notes surveyor',
 purpose:'Keep genuine observations of local river flooding and record the paths used by nearby workers.',
 personality:'Careful, inquisitive and reluctant to accept unproven claims.',
 background:'A travelling surveyor who lives by ordinary locally grounded work and decides individually whether to join activities.',
 witness});
const npcId=created.npcId;
const w=s.table.realm,person=w.emergentPeople.people[npcId.slice('emergent:'.length)];
A.equal(People.verify(w,person),true);
A.equal(Presence.resolve(w,npcId,gmPlaceId,0)?.name,actorName);
const source=Places.originalSiteProof(s);
A.equal(source.placeId,gmPlaceId);
A.equal(source.regionId,s.campaign.origin.birthRegionId);
A.equal(Places.verifiedSiteRegion(gmPlaceId,source),source.regionId);
A.equal(Places.verifiedSiteRegion(gmPlaceId,undefined),null);
A.equal(Places.verifiedSiteRegion(gmPlaceId,{...source,regionId:'fake'}),null);
A.equal(Places.verifiedSiteRegion('crossing',null),'morrowfen_basin');
A.equal(Places.verifiedSiteRegion('crossing',source),null,
 'Forged GM provenance cannot override a fixed canonical site');
const formed=act('social','formGroup',{
 name:'Orchard River Memory Society',
 kind:'ordinary voluntary local knowledge association',
 purpose:'Maintain true public flood and river crossing notes without claiming legal office, guaranteed work or any hereditary ability.'});
A.equal(formed.formed,true);
const group=G.lookup(w,formed.id);
A.equal(G.validate(group),true);
A.equal(group.members,1);
A.equal(group.funds,0);
A.equal(act('social','groupsStatus').groups.some(x=>x.id===formed.id),true,
 'The genuine local association must be visible while standing at the GM site');
const allAt=Presence.localStatus(s,w).people;
A.ok(allAt.some(p=>p.npcId===npcId));
const invitation='Would you voluntarily join our river notes circle? You may refuse, keep your own work and leave whenever you wish.';
let low=0;
for(let i=1;i<20000;i++){
 const t={rngState:i};
 if(Agency.draw(t)<.015){low=i;break;}
}
A.ok(low);
Agency.ensure(w).rngState=low;
const playerRng=s.rngState,playerCoins=s.player.coins;
const minutesBefore=s.world.minutes;
const reply=act('social','inviteGroupMember',{
 groupId:formed.id,npcId,proposal:invitation});
A.equal(reply.decision,'accepted','Fixture chooses independent world RNG; game API cannot choose the decision');
A.equal(reply.joined,true);
A.equal(reply.minutes,18);
A.equal(s.world.minutes,minutesBefore+18);
A.equal(s.rngState,playerRng);
A.equal(s.player.coins,playerCoins);
A.equal(G.validate(group),true);
A.equal(group.members,2);
A.equal(group.additionalMembers[0].actorId,npcId);
A.equal(group.additionalMembers[0].witness.details.placeProof.foundingHash,source.foundingHash);
A.equal(act('social','groupMembersStatus',{groupId:formed.id}).reportedMembers,2);
const groupBeforeTask=E.exportGame(s);
const tmp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-gm-local-group-'));
try{
 const file=Path.join(tmp,'save.json');
 FS.writeFileSync(file,groupBeforeTask+'\n');
 const read=()=>FS.readFileSync(file,'utf8');
 const initial=read();
 const request={id:'gm_site_voluntary_task_802341',mode:'rule',system:'social',
  operation:'groupTaskRequest',params:{
   groupId:formed.id,npcId,
   task:'Would you consider independently checking the current flood notes and comparing what you actually saw at the river?',
   untilDay:5}};
 const t=Turn.execute(file,request);
 A.equal(t.ok,true);A.equal(t.applied,true);
 A.equal(t.output.rules.discussed,true);
 A.ok(['accepted','considering','declined'].includes(t.output.rules.decision));
 A.equal(t.output.rules.noAutomaticWork,true);
 const actual=E.importGame(read()),realm=Realm.peek(actual),
  g=G.lookup(realm,formed.id),job=g.voluntaryTasks[0];
 A.ok(job&&job.witness.details.placeProof);
 A.equal(Places.verifiedSiteRegion(job.witness.details.place,job.witness.details.placeProof),
  source.regionId);
 A.equal(G.verifyVoluntaryTask(g,job),true);
 A.equal(G.validate(g),true);
 A.equal(actual.player.coins,playerCoins);
 A.equal(actual.rngState,playerRng,'Independent social decisions do not consume player d20 RNG');
 A.equal(actual.player.partnerIds.length,s.player.partnerIds.length,
  'Creating a voluntary group does not affect real beast partnerships');
 A.equal(job.witness.details.noNewWorkResult,true,
  'Offering work does not manufacture completion');
 const saved=read(),replay=Turn.execute(file,request);
 A.equal(replay.duplicate,true);A.equal(replay.applied,false);
 A.equal(read(),saved,'A replay cannot ask the member to decide twice');
 const view=Turn.execute(file,{id:'gm_site_group_status_802341',mode:'rule',
  system:'social',operation:'groupTasksStatus',params:{groupId:formed.id}});
 A.equal(view.applied,false);A.equal(read(),saved);
 const tampered=E.importGame(saved);
 tampered.table.realm.emergentGroups.entries[formed.id].voluntaryTasks[0]
  .witness.details.placeProof.founding.regionId='imaginary';
 A.equal(G.validate(tampered.table.realm.emergentGroups.entries[formed.id]),false,
  'Forged founding region cannot survive group evidence verification');
 const tamperedMember=E.importGame(groupBeforeTask);
 const e=tamperedMember.table.realm.emergentGroups.entries[formed.id];
 e.additionalMembers[0].witness.details.placeProof.foundingHash='0'.repeat(64);
 A.equal(G.validate(e),false);
 const unsafe=Places.verifiedSiteRegion(gmPlaceId,
  {...source,foundingHash:'f'.repeat(64)});
 A.equal(unsafe,null);
 A.equal(Places.verifiedSiteRegion('not_a_real_site',null),null);
 A.equal(PersonSourceIsStillReal(realm,npcId),true);
 function PersonSourceIsStillReal(realm,id){
  const p=realm.emergentPeople?.people?.[id.slice('emergent:'.length)];
  return People.verify(realm,p);
 }
 A.equal(read()!==initial,true);
}finally{FS.rmSync(tmp,{recursive:true,force:true});}
console.log('GM-established locations support original player-founded voluntary association, independently consenting GM person, same owned optional-work proposal, verified founding identity, no forced answers/fees/work, exact turn replay and altered-origin refusal');
