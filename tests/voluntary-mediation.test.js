'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),W=require('../rules/world'),
 Med=require('../world/voluntary-mediation'),Realm=require('../world/simulation'),
 H=require('../world/public-hearings'),Turn=require('../scripts/chat-turn.js');
const act=(s,op,params={})=>R.act(s,{system:'social',operation:op,params});
const raw='Please discuss an openly recorded shared crossing inspection before deciding whether any additional ferry tariffs are justified.';
const speaking='I ask each side to consider a public inspection of the river crossing while respecting the ordinary workers and living sanctuary routes.';
const make=(seed)=>{
 const s=E.newGame({seed,name:'Independent Family Mediation Citizen',path:'undecided'});
 W.advance(s,3);
 const clock=s.world.minutes%1440;
 if(clock<600){const t=s.world.minutes;E.advance(s,600-clock);W.finalizeTime(s,t);}
 const hearing=act(s,'hearing',{issueId:'river_crossings',
  testimony:'The crossing belongs in public discussion; do not assume toll revenue outranks emergency access.'});
 W.advance(s,12);
 A.equal(s.table.publicHearings.records[0].state,'reviewed');
 if(s.table.publicHearings.records[0].disposition!=='mediation_invite')return null;
 A.equal(s.table.publicHearings.records[0].hearingId,hearing.hearingId);
 const res=act(s,'mediationOffer',{hearingId:hearing.hearingId,proposal:raw});
 A.equal(res.invited,true);
 A.equal(res.noGuaranteedAttendance,true);
 A.equal(res.noGrantedOffice,true);
 A.equal(res.publicElders.length,2);
 return {s,hearing,res};
};
function after(seed){
 const item=make(seed);
 if(!item)return null;
 W.advance(item.s,12);
 const rec=item.s.table.voluntaryMediation.offers[0];
 A.equal(rec.state,'answered');
 A.equal(rec.replySource,Med.REPLY_SOURCE);
 A.equal(item.s.table.realm.mediationReplies.length,1);
 A.deepEqual(rec.individualReplies.map(x=>x.elder),['Ilyen Fenwake','Mara Reedward']);
 A.ok(rec.individualReplies.every(x=>['willing','seeks_revision','declines'].includes(x.decision)));
 Med.replyProof(item.s,item.s.table.realm,rec);
 return {...item,rec};
}
function seek(which,begin=1,max=250){
 for(let i=begin;i<=max;i++){
  const t=after((i*2654435761)>>>0);
  if(t&&(which==='either'||(which==='ready'&&t.rec.meetingPossible)||
   (which==='refusal'&&!t.rec.meetingPossible)))return t;
 }
 throw Error('No independently witnessed '+which+' family mediation response found in deterministic seeds');
}
{
 const s=E.newGame({seed:70101,name:'No Pretend Noble Title'}),before=E.exportGame(s),rng=s.rngState;
 const view=act(s,'mediationStatus');
 A.equal(view.offers.length,0);
 A.equal(view.noAutomaticAgreement,true);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 A.throws(()=>act(s,'mediationOffer',{hearingId:'fake',proposal:raw}),/genuinely witnessed, published/);
 A.throws(()=>act(s,'mediationOffer',{hearingId:'fake',proposal:raw,accepted:true}),/accepts only/);
 A.throws(()=>act(s,'mediationStatus',{secretHousePlan:true}),/accepts only/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const {s,hearing,res}=seek('either');
 A.equal(s.player.family,null);
 A.equal(s.player.coins,85);
 A.equal(s.table.publicHearings.records[0].disposition,'mediation_invite');
 const first=s.table.voluntaryMediation.offers[0];
 A.equal(first.hearingId,hearing.hearingId);
 A.equal(first.proposal,raw);
 A.equal(first.source,Med.SOURCE);
 A.equal(Med.offerProof(s,s.table.realm,first).h.hearingId,hearing.hearingId);
 A.equal(first.state,'answered');
 A.equal(first.meetingPossible,first.individualReplies.every(x=>x.decision==='willing'));
 A.equal(act(s,'mediationStatus').offers[0].publicReplies?.length,2);
 A.equal(s.rngState!==s.table.realm.rngState,true);
 const saved=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'mediationOffer',{hearingId:hearing.hearingId,proposal:'We should discuss a second proposal right now and immediately agree.'}),
  /separate sixday of reflection/);
 A.equal(E.exportGame(s),saved);A.equal(s.rngState,rng);
 A.equal(res.noGuaranteedSettlement,true);
}
{
 const t=seek('refusal',8);
 const {s,res,rec}=t;
 A.equal(rec.meetingPossible,false);
 const origin=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'mediationBook',{mediationId:res.mediationId}),/Every invited elder must actually volunteer/);
 A.equal(E.exportGame(s),origin);A.equal(s.rngState,rng);
 // A free person can return after further time with revised words: a
 // refusal does not blacklist them, destroy a family or create a feud.
 W.advance(s,6);
 const revised=act(s,'mediationOffer',{hearingId:t.hearing.hearingId,
  proposal:'Could we instead inspect the safety conditions together, without assuming anyone will concede their land title?'});
 A.equal(revised.invited,true);
 A.equal(s.player.family,null);
 const canceled=act(s,'mediationWithdraw',{mediationId:revised.mediationId});
 A.equal(canceled.withdrawn,true);
 A.equal(canceled.independentRepliesRemainHistorical,true);
 A.equal(s.table.voluntaryMediation.offers.at(-1).state,'withdrawn');
 const saved=E.exportGame(s),rngAfterWithdrawal=s.rngState;
 A.throws(()=>act(s,'mediationOffer',{hearingId:t.hearing.hearingId,
  proposal:'A hurried attempt to farm the same household reply immediately after cancellation.'}),
  /fresh invitation cannot immediately farm/);
 A.equal(E.exportGame(s),saved);A.equal(s.rngState,rngAfterWithdrawal);
}
{
 const {s,res,rec}=seek('ready');
 A.equal(rec.meetingPossible,true);
 A.equal(rec.individualReplies.every(x=>x.decision==='willing'),true);
 const previous=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'mediationMeet',{mediationId:res.mediationId,statement:speaking}),/actually booked/);
 A.throws(()=>act(s,'mediationBook',{mediationId:res.mediationId,preferredDay:999}),/real Workday 4/);
 A.throws(()=>act(s,'mediationBook',{mediationId:res.mediationId,meetingGuaranteed:true}),/accepts only/);
 A.equal(E.exportGame(s),previous);A.equal(s.rngState,rng);
 const room=act(s,'mediationBook',{mediationId:res.mediationId});
 A.equal(room.booked,true);A.equal(room.noForcedContract,true);
 A.equal(room.attendees.length,2);
 const w=s.table.realm;
 A.equal(room.scheduledDay,rec.meetingDay+1);
 A.equal(rec.state,'scheduled');
 A.equal(act(s,'mediationStatus').offers[0].meetingDay,rec.meetingDay);
 const before=E.exportGame(s),rng2=s.rngState;
 A.throws(()=>act(s,'mediationMeet',{mediationId:res.mediationId,statement:speaking}),/actually booked public sitting day/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng2);
 const delay=rec.meetingDay-Math.floor(s.world.minutes/1440);
 A.ok(delay>=2&&delay<=30);
 W.advance(s,delay);
 const qiBefore=s.player.qi,manaBefore=s.player.mana,rollBefore=s.rngState;
 const out=act(s,'mediationMeet',{mediationId:res.mediationId,statement:speaking});
 A.equal(out.met,true);A.equal(out.minutes,45);
 A.equal(out.namedParticipants.length,2);
 A.equal(out.freelySpoken,speaking);
 A.equal(out.noGuaranteedSettlement,undefined);
 A.equal(out.signedAgreement,false);
 A.equal(out.enactedLaw,false);
 A.equal(out.familyMembership,false);
 A.equal(out.feeTalons,0);
 A.equal(out.inspectionPerformed,false);
 A.equal(out.independentReplies.length,2);
 A.ok(out.independentReplies.every(x=>['supports_joint_inspection','asks_for_more_detail',
  'will_not_commit'].includes(x.decision)));
 A.equal(s.table.voluntaryMediation.offers[0].state,'met');
 A.equal(act(s,'mediationStatus').offers[0].completedMeeting.length,2);
 A.equal(require('../rules/voluntary-mediation').sessionProof(s,w,rec).jointInspectionProposed,
  out.jointInspectionProposed);
 const originalElder=rec.session.responses[0].elder;
 rec.session.responses[0].elder='Invented noble personally in attendance';
 A.throws(()=>require('../rules/voluntary-mediation').sessionProof(s,w,rec),
  /No unmodified actually witnessed session/);
 A.equal(act(s,'mediationStatus').offers[0].completedMeeting,null);
 rec.session.responses[0].elder=originalElder;
 A.equal(act(s,'mediationStatus').offers[0].completedMeeting.length,2);
 A.equal(s.player.family,null);
 A.equal(s.player.arcane.circles,0);
 A.equal(w.governance.reedmarch.holder,'Iria Highwater');
 A.equal(s.player.coins,85);
 A.equal(s.player.qi,qiBefore);
 A.equal(s.player.mana,manaBefore);
 A.equal(s.rngState,rollBefore);
 A.equal(!!w.civicJointInspections?.length,out.jointInspectionProposed);
 if(out.jointInspectionProposed){
  A.equal(w.civicJointInspections[0].performed,false);
  A.equal(w.civicJointInspections[0].legallyBinding,false);
 }
 const final=E.exportGame(s);
 A.throws(()=>act(s,'mediationMeet',{mediationId:res.mediationId,statement:speaking}),
  /actually booked public sitting day/);
 A.equal(E.exportGame(s),final);
}
{
 const t=seek('ready',15);
 const {s,res}=t;
 act(s,'mediationBook',{mediationId:res.mediationId});
 const before=s.player.coins;
 const canceled=act(s,'mediationWithdraw',{mediationId:res.mediationId});
 A.equal(canceled.withdrawn,true);
 A.equal(s.table.voluntaryMediation.offers[0].state,'withdrawn');
 A.equal(act(s,'mediationStatus').offers[0].stage,'withdrawn by the resident');
 A.equal(s.player.coins,before);
 const old=E.exportGame(s);
 A.throws(()=>act(s,'mediationMeet',{mediationId:res.mediationId,statement:speaking}),
  /actually booked public sitting day/);
 A.equal(E.exportGame(s),old);
}
{
 const t=seek('ready',19);
 const {s,res,rec}=t;
 rec.individualReplies[0].decision='willing';
 rec.individualReplies[1].decision='willing';
 rec.individualReplies[0].elder='A made-up royal heir';
 const corrupt=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'mediationBook',{mediationId:res.mediationId}),/Individual family elder consent cannot be forged/);
 A.equal(E.exportGame(s),corrupt);A.equal(s.rngState,rng);
}
{
 const t=seek('ready',25);
 const {s,res,rec}=t;
 const old=E.exportGame(s);
 rec.eventHash='faked archived noble invitation';
 const forged=E.exportGame(s);
 A.throws(()=>act(s,'mediationBook',{mediationId:res.mediationId}),/original witnessed hearing and resident proposal/);
 A.equal(E.exportGame(s),forged);
 A.notEqual(old,forged);
}
{
 const s=E.newGame({seed:70105,name:'Unaffiliated Public Resident'});
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-mediation-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const original=FS.readFileSync(file,'utf8');
  const read=Turn.execute(file,{id:'mediation_status_00001',mode:'rule',
   system:'social',operation:'mediationStatus',params:{}});
  A.equal(read.applied,false);A.equal(read.output.rules.offers.length,0);
  A.equal(FS.readFileSync(file,'utf8'),original);
  const ready=seek('ready',31),start=ready.s;
  FS.writeFileSync(file,E.exportGame(start)+'\n');
  const current=FS.readFileSync(file,'utf8');
  const request={id:'mediation_book_00001',mode:'rule',system:'social',
   operation:'mediationBook',params:{mediationId:ready.res.mediationId}};
  const booked=Turn.execute(file,request);
  A.equal(booked.applied,true);A.equal(booked.output.rules.booked,true);
  A.equal(Turn.execute(file,request).duplicate,true);
  const saved=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(saved.table.voluntaryMediation.offers[0].state,'scheduled');
  A.equal(saved.table.voluntaryMediation.offers[0].meetingDay,
   booked.output.rules.scheduledDay-1);
  A.notEqual(FS.readFileSync(file,'utf8'),current);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Verified local voluntary family mediation, independent named elder consent, re-proposal after refusal, calendar bookings and genuinely nonbinding discussion');
