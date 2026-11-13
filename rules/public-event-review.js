'use strict';
// Only a recorded entrant's authentic original work can receive this optional
// local technical benchmark. The GM authors the event and the scene; this
// source adapter cannot invent a judge, choose a winner, pay prizes, award
// cultivation progress, or create an official competition qualification.
const Crypto=require('node:crypto'),
 E=require('../engine.js'),Core=require('./core'),Clock=require('./world'),
 Health=require('./unified'),Realm=require('../world/simulation'),
 People=require('../world/person-presence'),Emergent=require('../world/emergent-people'),
 Careers=require('../world/person-careers');
const ORIGIN='source-witnessed-independent-original-work-review-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const Public=()=>require('./public-competitions'),DAY=1440;
const sealedShift=shift=>!!(shift&&shift.source===Emergent.SHIFT&&
 Number.isInteger(shift.fromDay)&&Number.isInteger(shift.throughDay)&&
 shift.hash===hash(Object.fromEntries(Object.entries(shift)
  .filter(([k])=>k!=='hash'))));
function reviewer(s,id){
 if(typeof id!=='string'||!id.startsWith('emergent:'))
  throw Error('A real independently living professional must be named');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[id.slice(9)];
 if(!p||p.actorId!==id||!Emergent.verify(w,p)||!Careers.verify(p))
  throw Error('The named reviewer lacks a verified independent professional life');
 return {w,p};
}
function professionalProof(p,domain,old=null){
 const receipts=p.career?.workReceipts||[];
 const r=receipts.find(x=>x.sourceHash===old?.sourceHash)||
  (old===null?receipts.find(x=>
   x.source?.task?.domain===domain&&x.source?.outcome?.success===true):old);
 const q=r?.source;
 if(!r||r.origin!==Careers.WORK||r.sourceHash!==hash(q)||
  q?.origin!==Careers.WORK||q.personId!==p.id||
  q.personOriginHash!==p.originHash||
  q.task?.domain!==domain||q.outcome?.success!==true||
  !Number.isInteger(q.day)||q.day<0)return null;
 return r;
}
function verify(s,row,item){
 const policy=row.source.workReview,q=item?.source,ev=item?.originalEvent,
  entry=row.entrants?.find(x=>x.sourceHash===q?.entrySourceHash),
  day=Math.floor(q?.reviewMinute/DAY),
  clock='Day '+(day+1)+', '+
   String(Math.floor((q?.reviewMinute%DAY)/60)).padStart(2,'0')+':'+
   String(q?.reviewMinute%60).padStart(2,'0');
 if(!Public().validWorkReview(policy)||!q||!entry||
  !entry.source.registered||q.actorId!==entry.source.actorId||
  !item||item.origin!==ORIGIN||q.origin!==ORIGIN||
  item.sourceHash!==hash(q)||q.eventId!==row.id||
  q.originalNoticeHash!==row.sourceHash||
  q.entrySourceHash!==entry.sourceHash||
  q.originalWorkHash!==hash(entry.source.originalWork)||
  q.reviewerId===q.actorId||
  !Number.isInteger(q.reviewMinute)||
  q.reviewMinute<row.source.scheduledAtMinute||
  q.reviewMinute>row.source.scheduledAtMinute+row.source.openAdmission.windowMinutes||
  q.reviewMinute>s.world.minutes||
  q.reviewerDomain!==policy.professionalDomain||
  q.reviewRequestHash!==hash({notice:row.sourceHash,entry:entry.sourceHash,
   reviewer:q.reviewerId,domain:policy.professionalDomain})||
  !sealedShift(q.originalPresence)||
  q.originalPresence.actorId!==q.reviewerId||
  q.originalPresence.location!==row.venue||
  q.originalPresence.fromDay>day||q.originalPresence.throughDay<day||
  !Emergent.verifyPublicWorkReviewChoice(q.independentDecision)||
  q.independentDecision.personOriginHash!==q.reviewerOriginHash||
  q.independentDecision.reviewRequestHash!==q.reviewRequestHash||
  q.willing!==q.independentDecision.willing||
  q.benchmarkMet!==(q.willing?entry.source.originalWork.successful===true:null)||
  q.noOfficialScoreRankOrReward!==true||
  !item.originalEvent||item.eventHash!==hash(ev)||
  ev.type!=='story'||ev.day!==day+1||ev.time!==clock||
  ev.text!=='A real local professional independently considered original work at the published exhibition.'||
  ev.details?.origin!==ORIGIN||ev.details?.eventId!==row.id||
  ev.details?.reviewerId!==q.reviewerId||
  ev.details?.entrySourceHash!==entry.sourceHash||
  ev.details?.willing!==q.willing||
  ev.details?.benchmarkMet!==q.benchmarkMet||
  ev.details?.noOfficialAwards!==true)return false;
 let person;
 try{person=reviewer(s,q.reviewerId).p}catch{return false}
 const original=professionalProof(person,policy.professionalDomain,q.originalCareerReceipt);
 if(!original||hash(original)!==hash(q.originalCareerReceipt)||
  q.reviewerOriginHash!==person.originHash)return false;
 const live=(s.log||[]).filter(x=>x.details?.origin===ORIGIN&&
  x.details?.eventId===row.id&&x.details?.entrySourceHash===entry.sourceHash&&
  x.details?.reviewerId===q.reviewerId);
 if(live.some(x=>hash(x)!==item.eventHash)||
  (!live.some(x=>hash(x)===item.eventHash)&&s.log.length<90))
  return false;
 return true;
}
function review(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).sort().join('|')!=='actorId|eventId|reviewerId')
  throw Error('Original local review takes only the event, admitted actor and real independent reviewer');
 const row=s.table?.competitionNotices?.['public_competition_'+p.eventId];
 if(!row)throw Error('The original published local event is not established');
 Public().verify(s,row);
 const policy=row.source.workReview;
 if(!Public().validWorkReview(policy))
  throw Error('The event published no source-checkable professional benchmark');
 if(s.battle||s.encounter||s.world.location!==row.venue)
  throw Error('The local technical review requires an actual safe encounter at its original venue');
 if(s.world.minutes<row.source.scheduledAtMinute||
  s.world.minutes+5>row.source.scheduledAtMinute+row.source.openAdmission.windowMinutes)
  throw Error('The original published local review window has not been met');
 const entry=row.entrants?.find(x=>x.source.actorId===p.actorId&&x.source.registered);
 if(!entry||p.actorId===p.reviewerId)
  throw Error('Only a genuinely admitted entrant may be reviewed by a distinct person');
 if(row.reviews?.some(x=>x.source.entrySourceHash===entry.sourceHash&&
  x.source.reviewerId===p.reviewerId))
  throw Error('The same person has already made this original review decision');
 const {w,p:person}=reviewer(s,p.reviewerId),
  proof=professionalProof(person,policy.professionalDomain);
 if(!proof)throw Error('The proposed professional has not demonstrated original successful work in this published domain');
 const day=Math.floor(s.world.minutes/DAY),
  shift=People.resolve(w,p.reviewerId,row.venue,day)?.presence;
 if(!shift||!People.proof(w,p.reviewerId,row.venue,day,shift))
  throw Error('A reviewer must genuinely be present, not listed remotely by job or reputation');
 const reviewRequestHash=hash({notice:row.sourceHash,entry:entry.sourceHash,
  reviewer:p.reviewerId,domain:policy.professionalDomain});
 // A local independent professional decides once using their existing
 // personal life RNG, not the player die or a caller-provided judgement.
 const choice=Emergent.considerPublicWorkReview(w,person,reviewRequestHash);
 const old=s.world.minutes;
 E.advance(s,5);Clock.finalizeTime(s,old);Health.sync(s,{source:'legacy'});
 const source={origin:ORIGIN,eventId:row.id,originalNoticeHash:row.sourceHash,
  entrySourceHash:entry.sourceHash,originalWorkHash:hash(entry.source.originalWork),
  actorId:p.actorId,reviewerId:p.reviewerId,reviewerOriginHash:person.originHash,
  reviewerDomain:policy.professionalDomain,originalCareerReceipt:structuredClone(proof),
  originalPresence:structuredClone(shift),reviewRequestHash,
  independentDecision:choice.source,reviewMinute:s.world.minutes,
  willing:choice.willing,
  benchmarkMet:choice.willing?entry.source.originalWork.successful===true:null,
  noOfficialScoreRankOrReward:true};
 Core.event(s,'story',
  'A real local professional independently considered original work at the published exhibition.',
  {origin:ORIGIN,eventId:row.id,reviewerId:p.reviewerId,
   entrySourceHash:entry.sourceHash,willing:source.willing,
   benchmarkMet:source.benchmarkMet,noOfficialAwards:true});
 const ev=structuredClone(s.log.at(-1));
 const item={origin:ORIGIN,source,sourceHash:hash(source),
  originalEvent:ev,eventHash:hash(ev)};
 row.reviews||=[];row.reviews.push(item);
 if(!verify(s,row,item))throw Error('Original local peer assessment was not source-verified');
 return {eventId:row.id,actorId:p.actorId,reviewerId:p.reviewerId,
  voluntarilyReviewed:choice.willing,originalWorkBenchmarkMet:source.benchmarkMet,
  noSecondPerformanceRoll:true,noOfficialRankPrizeOrQualification:true,
  noPlayerRngUsed:true,elapsedMinutes:5};
}
module.exports={ORIGIN,review,verify};
