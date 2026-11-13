'use strict';
// The original GM-authored competition notice is the sole persisted owner.
// This module only validates its open-entry records; no parallel registries,
// universal rank formula, judge, official licence, prize or NPC obedience.
const Crypto=require('node:crypto');
const E=require('../engine.js'),Core=require('./core'),Clock=require('./world'),
 Health=require('./unified'),Realm=require('../world/simulation'),
 People=require('../world/person-presence'),Emergent=require('../world/emergent-people'),
 Careers=require('../world/person-careers');
const DAY=1440;
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const Public=()=>require('./public-competitions');
const actorPerson=(s,id)=>{
 const w=Realm.peek(s),p=w.emergentPeople?.people?.[id?.slice(9)];
 if(!id?.startsWith('emergent:')||!p||p.actorId!==id||
  !Emergent.verify(w,p)||!Careers.verify(p))
  throw Error('Only a genuinely source-verified independent individual can enter');
 return {w,p};
};
function careerWork(s,id,receiptHash,archived=null){
 if(typeof receiptHash!=='string'||!/^[a-f0-9]{64}$/.test(receiptHash))
  throw Error('A real independent career work receipt is required');
 const {p}=actorPerson(s,id),existing=p.career.workReceipts.find(r=>
  r.sourceHash===receiptHash);
 // When the finite personal work journal rotates, the original witnessed
 // entry retains an archived, immutable original work receipt.
 const receipt=existing||archived?.originalReceipt,src=receipt?.source;
 if(!src||receipt.origin!==Careers.WORK||
  src.origin!==Careers.WORK||
  receipt.sourceHash!==receiptHash||receipt.sourceHash!==hash(src)||
  src.personId!==p.id||src.personOriginHash!==p.originHash||
  !Number.isInteger(src.day)||src.day<0||
  src.day>Math.floor(s.world.minutes/DAY)||
  !Number.isInteger(src.roll)||src.roll<1||src.roll>20||
  !Number.isInteger(src.modifier)||!Number.isInteger(src.dc)||
  src.total!==src.roll+src.modifier+(src.roll===20?5:src.roll===1?-5:0)||
  src.margin!==src.total-src.dc||
  typeof src.outcome?.success!=='boolean'||
  src.outcome.success!==(src.margin>=0))
  throw Error('The original independently earned work outcome cannot be authenticated');
 return {sourceOwner:'independent-career-work',sourceId:receiptHash,
  actorId:id,personOriginHash:p.originHash,
  completedDay:src.day,
  originalOutcome:src.outcome.success?'completed':'unsuccessful-attempt',
  originalReceipt:structuredClone(receipt),
  successful:src.outcome.success};
}
function workFor(s,row,actor,owner,sourceId,archived=null){
 const pub=Public();
 if(actor==='player'){
  if(owner==='independent-career-work')
   throw Error('The private work of another person is not the player work');
  const proof=pub.originalWork(s,owner,sourceId);
  const offer=(row.submissions||[]).find(x=>
   x.source?.originalWork?.sourceOwner===owner&&
   x.source.originalWork.sourceId===sourceId);
  if(!offer||JSON.stringify(offer.source.originalWork)!==JSON.stringify(proof))
   throw Error('This player never genuinely offered that original work');
  return {...proof,successful:
   ['interpreted','completed-product'].includes(proof.originalOutcome)};
 }
 if(owner!=='independent-career-work')
  throw Error('Independent entrants cannot be assigned the player work');
 return careerWork(s,actor,sourceId,archived);
}
function qualifies(row,work){
 const a=row.source.openAdmission;
 if(!Public().validOpenAdmission(a)||!a.acceptedSourceOwners.includes(work.sourceOwner)||
  (a.requireSuccess&&!work.successful))return false;
 if(a.allowPriorWork)return true;
 if(Number.isInteger(work.completedAtMinute))
  return work.completedAtMinute>=row.publishedMinute;
 if(Number.isInteger(work.completedDay))
  return work.completedDay>Math.floor(row.publishedMinute/DAY);
 return false;
}
function verify(s,row,item){
 const pub=Public(),q=item?.source,o=q?.originalWork,
  ev=item?.entryEvent,a=row.source.openAdmission,
  d=ev?.details,choice=q?.independentDecision,sh=q?.originalPresence;
 if(!pub.validOpenAdmission(a)||!q||!o||item.origin!==pub.ENTRY||
  q.origin!==pub.ENTRY||item.sourceHash!==hash(q)||
  q.eventId!==row.id||q.originalNoticeHash!==row.sourceHash||
  q.venue!==row.venue||
  !Number.isInteger(q.entryMinute)||
  q.entryMinute<row.source.scheduledAtMinute||
  q.entryMinute>row.source.scheduledAtMinute+a.windowMinutes||
  q.entryMinute>s.world.minutes||
  !row.interests.some(x=>x.actorId===q.actorId&&
   x.source?.voluntarilyInterested===true)||
  !qualifies(row,o)||
  typeof q.registered!=='boolean'||
  q.noJudgementOrReward!==true||
  q.noOfficialInstitutionalRecognition!==true||
  q.eligibilitySourceHash!==hash(o)||
  !ev||item.entryEventHash!==hash(ev)||ev.type!=='story'||
  ev.text!=='A voluntary local open-event entry decision is witnessed; no competition has been judged.'||
  ev.day!==Math.floor(q.entryMinute/DAY)+1||
  ev.time!=='Day '+(Math.floor(q.entryMinute/DAY)+1)+', '+
   String(Math.floor((q.entryMinute%DAY)/60)).padStart(2,'0')+':'+
   String(q.entryMinute%60).padStart(2,'0')||
  d?.origin!==pub.ENTRY||d?.eventId!==row.id||
  d?.actorId!==q.actorId||d?.registered!==q.registered||
  d?.workHash!==hash(o)||d?.originalNoticeHash!==row.sourceHash||
  d?.noJudgedResult!==true)return false;
 if(q.actorId==='player'){
  if(!q.registered||q.playerName!==row.source.playerNameAtPublication||
   choice!==null||sh!==null)return false;
  const offer=row.submissions.find(x=>
   x.source?.originalWork?.sourceOwner===o.sourceOwner&&
   x.source?.originalWork?.sourceId===o.sourceId);
  if(!offer||offer.source.submittedAtMinute>q.entryMinute)return false;
 }else{
  if(!q.actorId?.startsWith('emergent:')||!choice||!sh||
   q.actorOriginHash!==choice.personOriginHash||
   choice.eventAdmissionHash!==hash({notice:row.sourceHash,policy:a})||
   q.actorOriginHash!==o.personOriginHash||
   q.registered!==choice.consentsToEnter||
   !Emergent.verifyPublicEventEntryChoice(choice)||
   sh.source!==Emergent.SHIFT||sh.actorId!==q.actorId||
   sh.npcId!==q.actorId||sh.originHash!==q.actorOriginHash||
   sh.location!==row.venue||
   sh.fromDay>Math.floor(q.entryMinute/DAY)||
   sh.throughDay<Math.floor(q.entryMinute/DAY)||
   sh.hash!==hash(Object.fromEntries(Object.entries(sh)
    .filter(([k])=>k!=='hash'))))
   return false;
 }
 let actual;
 try{actual=workFor(s,row,q.actorId,o.sourceOwner,o.sourceId,o)}
 catch{return false}
 if(JSON.stringify(actual)!==JSON.stringify(o))return false;
 const live=(s.log||[]).filter(x=>x.details?.origin===pub.ENTRY&&
  x.details?.eventId===row.id&&x.details.actorId===q.actorId);
 if(live.some(x=>hash(x)!==item.entryEventHash)||
  (!live.some(x=>hash(x)===item.entryEventHash)&&s.log.length<90))
  return false;
 return true;
}
function enter(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).some(k=>!['eventId','sourceOwner','sourceId','npcId'].includes(k))||
  !['eventId','sourceOwner','sourceId'].every(k=>Object.hasOwn(p,k)))
  throw Error('Open event entry accepts only original event, actor and real work evidence, never a chosen decision or score');
 const pub=Public(),row=s.table?.competitionNotices?.['public_competition_'+p.eventId];
 if(!row)throw Error('Only a genuinely observed original public event may enroll someone');
 pub.verify(s,row);
 const a=row.source.openAdmission;
 if(!pub.validOpenAdmission(a))
  throw Error('The original event did not publish an open individual registration procedure');
 if(s.battle||s.encounter||s.world.location!==row.venue)
  throw Error('The individual must really attend this event venue without unresolved danger');
 if(s.world.minutes<row.source.scheduledAtMinute||
  s.world.minutes+5>row.source.scheduledAtMinute+a.windowMinutes)
  throw Error('Actual admission requires the originally announced event window');
 const actor=p.npcId||'player';
 if(actor!=='player'&&(typeof actor!=='string'||!actor.startsWith('emergent:')))
  throw Error('The player cannot enroll an invented person or an unconsenting beast');
 if((row.entrants||[]).some(x=>x.source.actorId===actor))
  throw Error('This individual already had one original event entry decision, and may not reroll consent');
 if(!row.interests.some(x=>x.actorId===actor&&
  x.source?.voluntarilyInterested===true))
  throw Error('A genuinely voluntary earlier interest is required, not presumed NPC enrollment');
 const work=workFor(s,row,actor,p.sourceOwner,p.sourceId);
 if(!qualifies(row,work))
  throw Error('The original public eligibility conditions do not accept this personally earned work');
 const person=actor==='player'?null:actorPerson(s,actor);
 const shift=person?People.resolve(person.w,actor,row.venue,
  Math.floor(s.world.minutes/DAY))?.presence:null;
 if(person&&(!shift||!People.proof(person.w,actor,row.venue,
  Math.floor(s.world.minutes/DAY),shift)))
  throw Error('The independent person is not actually present at the scheduled event');
 // This is the actual later individual decision, using only the person's
 // existing life RNG. Being interested earlier did not authorize enrollment.
 const choice=person?Emergent.considerPublicEventEntry(person.w,person.p,
  hash({notice:row.sourceHash,policy:a})):null;
 const registered=person?choice.consentsToEnter:true;
 const old=s.world.minutes;
 E.advance(s,5);Clock.finalizeTime(s,old);Health.sync(s,{source:'legacy'});
 const q={origin:pub.ENTRY,eventId:row.id,
  originalNoticeHash:row.sourceHash,venue:row.venue,
  actorId:actor,entryMinute:s.world.minutes,
  originalWork:work,eligibilitySourceHash:hash(work),registered,
  playerName:person?null:s.player.name,
  actorOriginHash:person?person.p.originHash:null,
  originalPresence:shift?structuredClone(shift):null,
  independentDecision:choice?choice.source:null,
  noJudgementOrReward:true,noOfficialInstitutionalRecognition:true};
 Core.event(s,'story',
  'A voluntary local open-event entry decision is witnessed; no competition has been judged.',
  {origin:pub.ENTRY,eventId:row.id,actorId:actor,registered,
   workHash:hash(work),originalNoticeHash:row.sourceHash,
   noJudgedResult:true});
 const ev=structuredClone(s.log.at(-1)),
  item={origin:pub.ENTRY,source:q,sourceHash:hash(q),
   entryEvent:ev,entryEventHash:hash(ev)};
 row.entrants||=[];row.entrants.push(item);
 if(!verify(s,row,item))
  throw Error('The actual public event entry failed original source reconciliation');
 return {eventId:row.id,actorId:actor,registered,
  independentlyChose:!!person,
  noCompulsoryNPCParticipation:true,
  originalWorkOwner:work.sourceOwner,originalWorkId:work.sourceId,
  noJudgedScoreRankOrReward:true,noOfficialPrestige:true,
  elapsedMinutes:5};
}
module.exports={verify,enter};
