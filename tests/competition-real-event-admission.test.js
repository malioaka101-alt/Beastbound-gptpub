'use strict';
// Foundation #21: local *admission* is not an invented tournament score.
// All states and saves here are disposable, with original work already done.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),Turn=require('../scripts/chat-turn.js'),
 R=require('../rules'),Clock=require('../rules/world'),
 Core=require('../rules/core'),Realm=require('../world/simulation'),
 Emergent=require('../world/emergent-people');
const act=(s,op,params={})=>R.act(s,{system:'competition',operation:op,params});
const newGame=seed=>E.newGame({name:'Original Admission Source Test',
 seed,background:'fieldworker',path:'undecided'});
const admission=(owners=['physical-production'])=>({
 openSelfEntry:true,
 procedure:'An individual may enter this public exhibition voluntarily at the original venue by presenting personally completed, verifiable work; no registrar or official competitive rank is claimed.',
 acceptedSourceOwners:owners,windowMinutes:210,
 allowPriorWork:true,requireSuccess:false
});
const event=(id,extra={})=>({
 eventId:id,title:'Independent Local Work Exhibition',
 description:'Neighbours voluntarily exhibit personally achieved ecological and technical work without claiming institutional certification.',
 criteria:'Each exhibitor offers their own original verifiable work, with no uniform scoring formula.',
 eligibility:'Voluntary local participation depends on an original witnessed individual work source.',
 judging:'Any scored judgment would require actual separately competent local reviewers.',
 appeals:'No appeal court or competition official is presumed by this local gathering.',
 prizeTerms:'No actual currency, prize fund or ownership transfer is established by this announcement.',
 season:'Neighbourhood seasonal exhibition cycle',
 eventDay:2,startsAtMinuteOfDay:13*60,
 openAdmission:admission(),...extra
});
const stable=s=>JSON.stringify({
 purse:s.player.coins,rank:s.player.rankings,qual:s.player.qualifications,
 record:s.player.competitionRecord,inventory:s.player.inventory,
 reputation:s.player.reputation.guild});
function until(s,day,time=13*60){
 const target=(day-1)*1440+time,old=s.world.minutes;
 A.ok(target>old,'original future event time');
 E.advance(s,target-old);Clock.finalizeTime(s,old);
}
{
 const s=newGame(818010),begin=E.exportGame(s),rng=s.rngState;
 const bad={...event('open_works_forum_01'),
  openAdmission:{...admission(),acceptedSourceOwners:['imagined-legendary-dragons']}};
 A.throws(()=>act(s,'announceLocal',bad),
   /real, future|locally witnessed|public event|competition invitation/);
 A.equal(E.exportGame(s),begin);A.equal(s.rngState,rng);
 const p=event('open_works_forum_01');
 const published=act(s,'announceLocal',p);
 A.equal(published.hasPublishedOpenAdmission,true);
 const row=s.table.competitionNotices.public_competition_open_works_forum_01;
 A.deepEqual(row.source.openAdmission,admission());
 A.equal(row.sourceHash.length,64);
 act(s,'expressInterest',{eventId:p.eventId});
 const made=R.act(s,{system:'craft',operation:'fieldPoultice',params:{}});
 A.equal(made.noExtraRoll,true);
 const work=s.table.physicalProductionHistory[0];
 act(s,'submitWork',{eventId:p.eventId,
  sourceOwner:'physical-production',sourceId:work.id});
 const still=E.exportGame(s),oldRng=s.rngState;
 A.throws(()=>act(s,'enter',{eventId:p.eventId,
  sourceOwner:'physical-production',sourceId:work.id}),
  /originally announced event window/);
 A.equal(E.exportGame(s),still);A.equal(s.rngState,oldRng);
 until(s,p.eventDay);
 const claims=stable(s),entryRng=s.rngState,at=s.world.minutes;
 const entered=act(s,'enter',{eventId:p.eventId,
  sourceOwner:'physical-production',sourceId:work.id});
 A.equal(entered.registered,true);
 A.equal(entered.noJudgedScoreRankOrReward,true);
 A.equal(entered.elapsedMinutes,5);
 A.equal(s.world.minutes,at+5);
 A.equal(s.rngState,entryRng);
 A.equal(stable(s),claims);
 const reg=row.entrants[0],oldProof=structuredClone(reg);
 A.equal(reg.source.originalWork.sourceId,work.id);
 A.equal(act(s,'publicEvents').events[0].actualOpenEntrants.length,1);
 A.equal(act(s,'publicEvents').events[0].noJudgedResults,true);
 A.equal(act(s,'publicEvents').events[0].noCreditedRankOrRewards,true);
 const saved=E.exportGame(s);
 A.equal(act(E.importGame(saved),'publicEvents').events[0].actualOpenEntrants[0].registered,true);
 A.throws(()=>act(s,'enter',{eventId:p.eventId,
  sourceOwner:'physical-production',sourceId:work.id}),/already had one/);
 A.equal(E.exportGame(s),saved);
 reg.source.registered=false;
 const tampered=E.exportGame(s);
 A.throws(()=>act(s,'publicEvents'),/lost their original source/);
 A.equal(E.exportGame(s),tampered);
 row.entrants[0]=oldProof;
 A.equal(E.exportGame(s),saved);
 for(let i=0;i<105;i++)Core.event(s,'world','Ordinary scenes rotate after the event '+i,{i});
 A.equal(act(E.importGame(E.exportGame(s)),'publicEvents').events[0].actualOpenEntrants.length,1);
}
{
 // The private chat executor must preserve a real entry once and reject
 // a second turn ID trying to obtain another decision or free status change.
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'beastbound-entry-'));
 try{
  const file=Path.join(dir,'save.json'),s=newGame(818012),
   e=event('verified_source_entry_chat_04');
  act(s,'announceLocal',e);
  act(s,'expressInterest',{eventId:e.eventId});
  R.act(s,{system:'craft',operation:'fieldPoultice',params:{}});
  const id=s.table.physicalProductionHistory[0].id;
  act(s,'submitWork',{eventId:e.eventId,
   sourceOwner:'physical-production',sourceId:id});
  until(s,e.eventDay);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const request={id:'witnessed_entry_first_818012',mode:'rule',
   system:'competition',operation:'enter',params:{
    eventId:e.eventId,sourceOwner:'physical-production',sourceId:id}};
  const first=Turn.execute(file,request);
  A.equal(first.applied,true);
  A.equal(first.output.rules.registered,true);
  A.equal(first.output.rules.noJudgedScoreRankOrReward,true);
  A.equal(Turn.execute(file,request).duplicate,true);
  const final=FS.readFileSync(file,'utf8');
  const status=Turn.execute(file,{id:'witnessed_entry_status_818012',
   mode:'rule',system:'competition',operation:'publicEvents',
   params:{eventId:e.eventId}});
  A.equal(status.applied,false);
  A.equal(status.output.rules.events[0].actualOpenEntrants.length,1);
  A.equal(FS.readFileSync(file,'utf8'),final);
  A.throws(()=>Turn.execute(file,{...request,
   id:'witnessed_entry_illicit_repeat_818012'}),/already had one/);
  A.equal(FS.readFileSync(file,'utf8'),final);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
{
 // Previously published words alone do not grant procedural permission;
 // old invitations without an open source-checked entry rule remain old.
 const s=newGame(818011),v=event('no_implicit_entry_02');
 delete v.openAdmission;
 const announced=act(s,'announceLocal',v);
 act(s,'expressInterest',{eventId:announced.eventId});
 R.act(s,{system:'craft',operation:'fieldPoultice',params:{}});
 const id=s.table.physicalProductionHistory[0].id;
 act(s,'submitWork',{eventId:v.eventId,
  sourceOwner:'physical-production',sourceId:id});
 until(s,v.eventDay);
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'enter',{eventId:v.eventId,
  sourceOwner:'physical-production',sourceId:id}),
  /did not publish an open/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 A.equal(act(s,'publicEvents').events[0].noConfirmedEntrants,true);
}
{
 // A genuinely living independent person must first WANT to consider
 // the event and actually be present at event time. They decide entry
 // separately using their OWN original life RNG, not the player dice.
 const s=newGame(912003),w=Realm.ensure(s);
 Clock.advance(s,240);
 const people=Object.values(w.emergentPeople.people).filter(x=>
  x.status==='active'&&x.shift&&x.career?.workReceipts?.length&&
  Emergent.presence(w,x.actorId,x.shift.location,
   Math.floor(s.world.minutes/1440)));
 A.ok(people.length,'actual independently living workers exist');
 const place=people[0].shift.location;
 if(s.world.location!==place){
  const steps=[[s.world.location]],seen=new Set([s.world.location]);let path=null;
  while(steps.length&&!path){
   const q=steps.shift(),id=q.at(-1);
   if(id===place){path=q;break}
   for(const e of E.LOCATIONS[id].exits)if(!seen.has(e)){
    seen.add(e);steps.push([...q,e]);
   }
  }
  A.ok(path);
  for(const id of path.slice(1))A.equal(E.dispatch(s,'travel '+id).ok,true);
 }
 const y=E.day(s),e=event('source_person_forum_03',{
  eventDay:y+2,openAdmission:admission(['independent-career-work'])});
 act(s,'announceLocal',e);
 const interested=[];
 for(const p of people.filter(x=>x.shift.location===place).slice(0,12)){
  const choice=act(s,'expressInterest',{eventId:e.eventId,npcId:p.actorId});
  if(choice.interested)interested.push(p);
 }
 A.ok(interested.length,'an original worker independently expressed interest');
 const attendee=interested[0],receipt=attendee.career.workReceipts[0];
 const forbidden=E.exportGame(s),playerRng=s.rngState;
 A.throws(()=>act(s,'enter',{eventId:e.eventId,
  sourceOwner:'independent-career-work',sourceId:receipt.sourceHash,
  npcId:attendee.actorId}),/originally announced event window/);
 A.equal(E.exportGame(s),forbidden);A.equal(s.rngState,playerRng);
 until(s,e.eventDay);
 const before=stable(s),rng=s.rngState,privateRng=attendee.rngState;
 const result=act(s,'enter',{eventId:e.eventId,
  npcId:attendee.actorId,sourceOwner:'independent-career-work',
  sourceId:receipt.sourceHash});
 A.equal(result.independentlyChose,true);
 A.equal(result.noCompulsoryNPCParticipation,true);
 A.equal(s.rngState,rng);
 A.notEqual(attendee.rngState,privateRng);
 A.equal(stable(s),before);
 const record=s.table.competitionNotices.public_competition_source_person_forum_03.entrants[0];
 A.equal(record.source.registered,result.registered);
 A.equal(Emergent.verifyPublicEventEntryChoice(record.source.independentDecision),true);
 A.equal(act(s,'publicEvents').events[0].actualOpenEntrants[0].registered,result.registered);
 const frozen=E.exportGame(s);
 A.throws(()=>act(s,'enter',{eventId:e.eventId,
  npcId:attendee.actorId,sourceOwner:'independent-career-work',
  sourceId:receipt.sourceHash}),/already had one/);
 A.equal(E.exportGame(s),frozen);
 const prior=structuredClone(record);
 record.source.independentDecision.consentsToEnter=!record.source.independentDecision.consentsToEnter;
 A.throws(()=>act(s,'publicEvents'),/lost their original source/);
 s.table.competitionNotices.public_competition_source_person_forum_03.entrants[0]=prior;
 A.equal(act(E.importGame(E.exportGame(s)),'publicEvents').events[0].actualOpenEntrants.length,1);
}
console.log('Verified source-open event admission: authentic publication, original player work, an actual event-time voluntary choice by independently living workers, no automatic rank, judge, prize, power or reroll');
