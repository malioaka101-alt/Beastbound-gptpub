'use strict';
// All characters, new invitations and eventual independent people here are
// disposable fixtures. No actual Beastbound campaign file is touched.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),W=require('../rules/world'),
 Realm=require('../world/simulation'),People=require('../world/person-presence'),
 Emergent=require('../world/emergent-people'),
 Core=require('../rules/core'),Turn=require('../scripts/chat-turn');
const fresh=seed=>E.newGame({seed,name:'Cultural Competition Source Test'});
const act=(s,op,params={})=>R.act(s,{system:'competition',operation:op,params});
const event=(eventId,props={})=>({
 eventId,title:'Open Field Researchers Gathering',
 description:'Local visitors exchange independent field reports and practical ecological observations.',
 criteria:'Only personally completed field observations may be described to the audience.',
 eligibility:'Participation is voluntary and does not convey a licence or school title.',
 judging:'Local review procedures have not yet been mechanically authenticated.',
 appeals:'Questions and objections may be raised; no statutory appeal is automatically granted.',
 prizeTerms:'No prizes have been deposited or verified in any real fund.',
 season:'Public work-season gathering',
 eventDay:2,startsAtMinuteOfDay:12*60,...props
});
function reach(s,site){
 if(s.world.location===site)return;
 const queue=[[s.world.location]],seen=new Set([s.world.location]);
 let route;
 while(queue.length){
  const path=queue.shift(),loc=path.at(-1);
  if(loc===site){route=path;break;}
  for(const next of E.LOCATIONS[loc].exits){
   if(!seen.has(next)){queue.push([...path,next]);seen.add(next);}
  }
 }
 A.ok(route,'real connected route required');
 for(const step of route.slice(1))
  A.equal(E.dispatch(s,'travel '+step).ok,true);
}
{
 const s=fresh(912001),before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'announceLocal',{
   ...event('original_field_meet'),score:999}),/only witnessed local facts/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 A.throws(()=>act(s,'announceLocal',{
   ...event('original_field_meet'),eventDay:1,startsAtMinuteOfDay:7*60}),
   /real, future, locally witnessed/);
 A.equal(E.exportGame(s),before);
 const rank=JSON.stringify(s.player.rankings),cash=s.player.coins,
  recordCount=s.player.competitionRecord.length;
 const announced=act(s,'announceLocal',event('original_field_meet'));
 A.equal(announced.observed,true);
 A.equal(announced.rankAndPrizesNotGranted,true);
 A.equal(announced.elapsedMinutes,5);
 A.equal(s.rngState,rng);A.equal(s.player.coins,cash);
 A.equal(JSON.stringify(s.player.rankings),rank);
 A.equal(s.player.competitionRecord.length,recordCount);
 const row=s.table.competitionNotices.public_competition_original_field_meet;
 A.equal(row.source.venue,'crossing');
 A.equal(row.publicationEventHash,CoreHash(row.publicationEvent));
 A.equal(act(s,'publicEvents').events.length,1);
 A.equal(act(s,'publicEvents',{eventId:'original_field_meet'}).events[0].noConfirmedEntrants,true);
 A.equal(act(s,'publicEvents').events[0].noCreditedRankOrRewards,true);
 const frozen=E.exportGame(s);
 A.throws(()=>act(s,'announceLocal',event('original_field_meet')),/already been observed/);
 A.equal(E.exportGame(s),frozen);
 A.throws(()=>act(s,'expressInterest',{eventId:'original_field_meet',npcId:'npc:elira',agree:true}),
   /only witnessed local facts/);
 A.equal(E.exportGame(s),frozen);
 const player=act(s,'expressInterest',{eventId:'original_field_meet'});
 A.equal(player.interested,true);
 A.equal(player.notRegistered,true);
 A.equal(s.rngState,rng);A.equal(s.player.coins,cash);
 A.equal(s.player.competitionRecord.length,recordCount);
 A.equal(s.table.competitionNotices.public_competition_original_field_meet.interests.length,1);
 const after=E.exportGame(s);
 A.throws(()=>act(s,'expressInterest',{eventId:'original_field_meet'}),/already received/);
 A.equal(E.exportGame(s),after);A.equal(s.rngState,rng);
 A.equal(act(E.importGame(after),'publicEvents').events[0].witnessedInterests[0].actorId,'player');
 const source=row.sourceHash;
 row.sourceHash='0'.repeat(64);
 const corrupted=E.exportGame(s);
 A.throws(()=>act(s,'publicEvents'),/lost their original source/);
 A.equal(E.exportGame(s),corrupted);
 row.sourceHash=source;
 const scene=s.log.find(x=>x.details?.eventId==='original_field_meet');
 A.ok(scene);
 const original=scene.text;
 scene.text='Changed publicly announced contest after the notice was witnessed';
 A.throws(()=>act(s,'publicEvents'),/altered or never witnessed/);
 scene.text=original;
 A.equal(act(s,'publicEvents').events.length,1);
 for(let i=0;i<95;i++)Core.event(s,'world','Unrelated public work and seasonal observations.',{i});
 A.equal(s.log.length,90);
 A.equal(act(E.importGame(E.exportGame(s)),'publicEvents').events[0].eventId,'original_field_meet');
}
{
 // Two unlike public cultural formats and different real venues are
 // authored WITHOUT modifying COMPETITIONS, awarding a generic score or
 // inventing a single compulsory judge. The surrounding world remains free.
 const s=fresh(912002);
 const today=E.day(s);
 const first=act(s,'announceLocal',event('local_exploration_display',{
  title:'Morrowfen Travellers Night',
  description:'Residents gather to recount routes, dangers and seasonal paths in person.',
  criteria:'Only witnessed journeys and observed landscapes are suitable for an exhibition.',
  season:'Early waterways observation cycle',eventDay:today+2
 }));
 A.equal(first.eventDay,today+2);
 reach(s,'academy');
 const second=act(s,'announceLocal',event('individual_formations_forum',{
  title:'Independent Formation Designers Forum',
  description:'Local workers share their verifiable craft demonstrations and distinct arcane constructions.',
  criteria:'Demonstrations must be original, physically accomplished and independently verified.',
  judging:'Published witness-based appraisal applies only if a competent local source is established.',
  season:'Study-circle exchange cycle',eventDay:E.day(s)+3
 }));
 A.equal(second.observed,true);
 const list=act(s,'publicEvents').events;
 A.equal(list.length,2);
 A.notEqual(list[0].venue,list[1].venue);
 A.notEqual(list[0].judging,list[1].judging);
 A.equal(s.player.competitionRecord.length,0);
 A.equal(s.player.qualifications.length,0);
 A.deepEqual(s.player.rankings,{fieldwork:0,meridian:0,arcane:0,partnership:0});
 A.equal(act(s,'publicEvents',{eventId:'local_exploration_display'}).events.length,1);
}
{
 // The independent citizen cannot be summoned, commanded to join or given
 // a chosen score. Their own original life RNG resolves only INTEREST.
 const s=fresh(912003),w=Realm.ensure(s);
 W.advance(s,240);
 const person=Object.values(w.emergentPeople.people).find(p=>
   p.status==='active'&&p.shift&&Emergent.siteFor(p.regionId)&&
   Emergent.presence(w,p.actorId,p.shift.location,Math.floor(s.world.minutes/1440)));
 A.ok(person,'actual independent local person should exist after world ticks');
 reach(s,person.shift.location);
 const day=E.day(s),ev=event('person_local_open_forum',{
  title:'Free Local Skills and Knowledge Exhibition',
  description:'A public invitation welcomes any volunteer with a real demonstration of personal work.',
  criteria:'Participants may freely propose distinct sources of personally earned work without a compulsory team.',
  eventDay:day+3
 });
 act(s,'announceLocal',ev);
 const prevRng=person.rngState,playerRng=s.rngState;
 const choice=act(s,'expressInterest',{
  eventId:'person_local_open_forum',npcId:person.actorId
 });
 A.equal(choice.independentlyDecided,true);
 A.equal(choice.notRegistered,true);
 A.equal(choice.noPlayerRngConsumed,true);
 A.equal(s.rngState,playerRng);
 A.notEqual(person.rngState,prevRng);
 const row=s.table.competitionNotices.public_competition_person_local_open_forum;
 const witness=row.interests[0].source;
 A.equal(witness.actorId,person.actorId);
 A.equal(witness.personOriginHash,person.originHash);
 A.equal(Emergent.verifyPublicInvitationChoice(witness.independentDecision),true);
 A.equal(witness.originalPresence.hash,
   Emergent._debug.hash(Object.fromEntries(Object.entries(witness.originalPresence)
    .filter(([key])=>key!=='hash'))));
 A.equal(act(s,'publicEvents').events[0].witnessedInterests[0].interested,choice.interested);
 const safe=E.exportGame(s),individualRng=person.rngState;
 const presenceHash=witness.originalPresence.hash;
 witness.originalPresence.hash='0'.repeat(64);
 const corruptPresence=E.exportGame(s);
 A.throws(()=>act(s,'publicEvents'),/lost their original source/);
 A.equal(E.exportGame(s),corruptPresence);
 witness.originalPresence.hash=presenceHash;
 A.equal(E.exportGame(s),safe);
 A.throws(()=>act(s,'expressInterest',{eventId:'person_local_open_forum',npcId:person.actorId}),
   /already received/);
 A.equal(E.exportGame(s),safe);
 A.equal(person.rngState,individualRng);
 const copy=E.importGame(safe);
 A.equal(act(copy,'publicEvents').events[0].witnessedInterests.length,1);
 // False consent and source edits are not allowed as read-only original facts.
 witness.independentDecision.interested=!witness.independentDecision.interested;
 const forged=E.exportGame(s);
 A.throws(()=>act(s,'publicEvents'),/lost their original source/);
 A.equal(E.exportGame(s),forged);
}
{
 // A private chat request can record the observed public local event only
 // once; the exact immutable turn id cannot silently reroll NPC consent.
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-cultural-event-'));
 try{
  const file=Path.join(dir,'save.json'),s=fresh(912004);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const request={id:'cultural_event_notice_912004',mode:'rule',system:'competition',
   operation:'announceLocal',params:event('public_travellers_exhibition')};
  const result=Turn.execute(file,request);
  A.equal(result.applied,true);
  A.equal(result.output.rules.observed,true);
  A.equal(Turn.execute(file,request).duplicate,true);
  const after=FS.readFileSync(file,'utf8');
  const view=Turn.execute(file,{id:'cultural_event_status_912004',
    mode:'rule',system:'competition',operation:'publicEvents',params:{}});
  A.equal(view.applied,false);
  A.equal(view.output.rules.events.length,1);
  A.equal(FS.readFileSync(file,'utf8'),after);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
function CoreHash(x){return require('node:crypto').createHash('sha256').update(JSON.stringify(x)).digest('hex');}
console.log('GM-authored public event invitations use original local places and real clocks; different formats remain open, person interest is independently chosen, no entry/rank/prize fabricated, and save replay preserves witnesses');
