'use strict';
// Foundation #21: observed GM-authored public competition invitations are
// historical facts, not mechanically approved events, enrolled entrants,
// adjudicated performances, licensed ranks or funded reward promises.
// Reuse the established competitionNotices source owner, original world clock,
// independent person presence and original player/individual RNG streams.
const Crypto=require('node:crypto'),
 E=require('../engine.js'),Core=require('./core'),Time=require('./world'),
 Health=require('./unified'),Place=require('../world/lived-places'),
 Realm=require('../world/simulation'),People=require('../world/person-presence'),
 Emergent=require('../world/emergent-people'),
 Careers=require('../world/person-careers'),
 Habitat=require('./habitat-survey'),
 Production=require('./physical-production-ledger');
const ORIGIN='gm-observed-local-public-competition-invitation-v1',
 INTEREST='personally-witnessed-voluntary-public-competition-interest-v1',
 WORK='personally-offered-original-public-competition-work-v1',
 ENTRY='personally-witnessed-local-voluntary-original-work-admission-v1',
 PREFIX='public_competition_',DAY=1440;
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const validId=s=>typeof s==='string'&&/^[a-z][a-z0-9_-]{4,55}$/.test(s);
const prose=(s,min=12,max=900)=>typeof s==='string'&&
 s.trim().length>=min&&s.trim().length<=max;
const shape=(p,required,optional=[])=>{
 if(!p||typeof p!=='object'||Array.isArray(p)||
  required.some(k=>!Object.hasOwn(p,k))||
  Object.keys(p).some(k=>![...required,...optional].includes(k)))
  throw Error('A public competition invitation accepts only witnessed local facts, not a chosen score, competitor response, rank or reward');
};
const key=id=>PREFIX+id;
const ADMISSION_OWNERS=Object.freeze(['habitat-survey','physical-production','independent-career-work']);
// Optional, source-limited peer benchmark: no universal scoring ladder.
const validWorkReview=x=>!!(x&&typeof x==='object'&&!Array.isArray(x)&&
 Object.keys(x).sort().join('|')==='benchmark|procedure|professionalDomain'&&
 x.benchmark==='original-completed-work'&&
 prose(x.procedure,25,800)&&
 typeof x.professionalDomain==='string'&&
 /^[a-z][a-z-]{3,39}$/.test(x.professionalDomain));
function validOpenAdmission(x){
 return x&&typeof x==='object'&&!Array.isArray(x)&&
  Object.keys(x).sort().join('|')===
   'acceptedSourceOwners|allowPriorWork|openSelfEntry|procedure|requireSuccess|windowMinutes'&&
  x.openSelfEntry===true&&prose(x.procedure,25,800)&&
  Number.isInteger(x.windowMinutes)&&x.windowMinutes>=15&&
  x.windowMinutes<=10080&&
  typeof x.allowPriorWork==='boolean'&&typeof x.requireSuccess==='boolean'&&
  Array.isArray(x.acceptedSourceOwners)&&x.acceptedSourceOwners.length>0&&
  x.acceptedSourceOwners.length<=ADMISSION_OWNERS.length&&
  new Set(x.acceptedSourceOwners).size===x.acceptedSourceOwners.length&&
  x.acceptedSourceOwners.every(z=>ADMISSION_OWNERS.includes(z));
}
const publishedTerms=a=>({
 title:a.title,description:a.description,criteria:a.criteria,
 eligibility:a.eligibility,judging:a.judging,appeals:a.appeals,
 prizeTerms:a.prizeTerms,season:a.season,
 ...(a.openAdmission!==undefined?{openAdmission:a.openAdmission}:{}),
 ...(a.workReview!==undefined?{workReview:a.workReview}:{})
});

function verify(s,row){
 const a=row?.source,ev=row?.publicationEvent,created=row?.sourceHash,
  seal=row?.publicationEventHash;
 if(!a||!row||row.origin!==ORIGIN||!validId(a.eventId)||
  row.id!==a.eventId||row.sourceHash!==hash(a)||row.sourceHash!==created||
  a.origin!==ORIGIN||a.venue!==row.venue||
  a.publishedMinute!==row.publishedMinute||
  a.eventDay!==row.eventDay||
  a.scheduledAtMinute!==(a.eventDay-1)*DAY+a.startsAtMinuteOfDay||
  !Number.isInteger(a.startsAtMinuteOfDay)||
  a.startsAtMinuteOfDay<0||a.startsAtMinuteOfDay>=DAY||
  !Number.isInteger(a.publishedMinute)||a.publishedMinute<0||
  a.publishedMinute>s.world.minutes||
  a.playerNameAtPublication!==row.playerNameAtFirstNotice||
  !Number.isInteger(a.eventDay)||a.eventDay<1||
  a.scheduledAtMinute<=a.publishedMinute||
  !Place.location(s,a.venue)||
  a.regionId!==Place.location(s,a.venue)?.regionId||
  !prose(a.title,5,110)||!prose(a.description,20,900)||
  !prose(a.criteria,16,900)||!prose(a.eligibility,10,900)||
  !prose(a.judging,10,900)||!prose(a.appeals,10,900)||
  !prose(a.prizeTerms,8,900)||!prose(a.season,3,120)||
  a.noAutomaticInstitutionalAuthority!==true||
  a.noAutomaticEntrantsOrConsent!==true||
  a.noAutomaticScoreRankOrReward!==true||
  (a.openAdmission!==undefined&&!validOpenAdmission(a.openAdmission))||
  (a.workReview!==undefined&&(!validWorkReview(a.workReview)||
   !validOpenAdmission(a.openAdmission)))||
  !ev||seal!==hash(ev)||
  ev.type!=='world'||
  ev.text!=='A public local competition invitation is witnessed: '+a.title+'.'||
  ev.day!==Math.floor(a.publishedMinute/DAY)+1||
  ev.time!=='Day '+(Math.floor(a.publishedMinute/DAY)+1)+', '+
   String(Math.floor((a.publishedMinute%DAY)/60)).padStart(2,'0')+':'+
   String(a.publishedMinute%60).padStart(2,'0')||
  ev.details?.origin!==ORIGIN||
  ev.details?.eventId!==a.eventId||ev.details?.venue!==a.venue||
  ev.details?.publishedMinute!==a.publishedMinute||
  ev.details?.eventDay!==a.eventDay||
  ev.details?.scheduledAtMinute!==a.scheduledAtMinute||
  ev.details?.termsHash!==hash(publishedTerms(a))||
  !Array.isArray(row.interests)||row.interests.length>100||
  row.interests.some((x,i)=>!verifyInterest(row,x)||
   row.interests.findIndex(y=>y.actorId===x.actorId)!==i)||
  (row.submissions!==undefined&&
   (!Array.isArray(row.submissions)||row.submissions.length>100||
    row.submissions.some((x,i)=>!verifySubmittedWork(s,row,x)||
     row.submissions.findIndex(y=>y.source?.originalWork?.sourceOwner===
       x.source.originalWork.sourceOwner&&
      y.source.originalWork.sourceId===x.source.originalWork.sourceId)!==i)))||
  (row.entrants!==undefined&&
   (!Array.isArray(row.entrants)||row.entrants.length>100||
    row.entrants.some((e,i)=>!verifyAdmission(s,row,e)||
     row.entrants.findIndex(y=>y.source.actorId===e.source.actorId)!==i)))||
  (row.reviews!==undefined&&
   (!Array.isArray(row.reviews)||row.reviews.length>100||
    row.reviews.some((e,i)=>!verifyWorkReview(s,row,e)||
     row.reviews.findIndex(y=>y.source.entrySourceHash===e.source.entrySourceHash&&
       y.source.reviewerId===e.source.reviewerId)!==i))))
  throw Error('The locally observed competition invitation or voluntary responses have lost their original source');
 // An original still-present event cannot be silently replaced by an
 // archived copy. After ordinary journal rotation the archived true event
 // remains source-sealed without manufacturing a later public announcement.
 const live=(s.log||[]).filter(x=>x.details?.origin===ORIGIN&&
  x.details.eventId===a.eventId);
 if(live.some(x=>hash(x)!==seal)||
  (!live.some(x=>hash(x)===seal)&&s.log.length<90))
  throw Error('The original locally observed public competition notice was altered or never witnessed');
 return a;
}
function verifyInterest(row,x){
 const q=x?.source;
 if(!q||x.origin!==INTEREST||x.actorId!==q.actorId||
  x.hash!==hash(q)||q.origin!==INTEREST||
  q.eventId!==row.id||q.invitationHash!==row.sourceHash||
  !Number.isInteger(q.worldMinute)||q.worldMinute<row.publishedMinute||
  !Number.isInteger(q.worldMinute)||q.worldMinute>=row.source.scheduledAtMinute||
  q.venue!==row.venue||q.noAutomaticEntryOrQualification!==true)
  return false;
 if(q.actorId==='player')
  return q.playerName===row.source.playerNameAtPublication&&
   q.voluntarilyInterested===true&&q.noNPCChoice===true;
 if(!q.actorId.startsWith('emergent:')||
  typeof q.personOriginHash!=='string'||!/^[a-f0-9]{64}$/.test(q.personOriginHash)||
  q.noNPCChoice!==false||typeof q.voluntarilyInterested!=='boolean'||
  !q.independentDecision||typeof q.independentDecision!=='object'||
  q.independentDecision.personOriginHash!==q.personOriginHash||
  q.independentDecision.activityHash!==row.sourceHash||
  !q.originalPresence||q.originalPresence.source!==Emergent.SHIFT||
  q.originalPresence.actorId!==q.actorId||
  q.originalPresence.npcId!==q.actorId||
  q.originalPresence.originHash!==q.personOriginHash||
  q.originalPresence.location!==q.venue||
  q.originalPresence.fromDay>Math.floor(q.worldMinute/DAY)||
  q.originalPresence.throughDay<Math.floor(q.worldMinute/DAY)||
  q.originalPresence.throughDay-q.originalPresence.fromDay!==5||
  q.originalPresence.scheduledAtDay!==q.originalPresence.fromDay||
  !/^[a-f0-9]{64}$/.test(q.originalPresence.hash||'')||
  hash(Object.fromEntries(Object.entries(q.originalPresence)
   .filter(([k])=>k!=='hash')))!==q.originalPresence.hash)
  return false;
 return Emergent.verifyPublicInvitationChoice(q.independentDecision);
}
// A source-specific OWNER validates an actual earlier physical achievement.
// This bridge does not convert two different kinds of labour into one score.
// Other authentic disciplines can expose their own witness only when proven;
// arbitrary caller-supplied performance numbers are not accepted.
function originalWork(s,sourceOwner,sourceId){
 if(typeof sourceId!=='string'||sourceId.length>100)
  throw Error('A real original work reference must be given, not claimed performance points');
 if(sourceOwner==='habitat-survey'){
  const q=Habitat.historical(s,sourceId);
  return {sourceOwner,sourceId,completedAtMinute:q.interpretedAtMinute,
   originalObservationHash:q.observationHash,
   originalResultHash:q.rollHash,
   originalOutcome:q.success?'interpreted':'unresolved-traces'};
 }
 if(sourceOwner==='physical-production'){
  if(!Production.verify(s))
   throw Error('The original material production ledger does not reconcile');
  const record=s.table?.physicalProductionHistory?.find(x=>x.id===sourceId);
  if(!record||record.source?.finishMinute>s.world.minutes)
   throw Error('An actual previously completed physical work receipt is required');
  return {sourceOwner,sourceId,
   completedAtMinute:record.source.finishMinute,
   originalResultHash:record.sourceHash,
   originalOutcome:record.source.originalOutcome};
 }
 throw Error('Competition evidence needs a real source owner, never a caller-authored score or outcome');
}
function verifySubmittedWork(s,row,item){
 const q=item?.source,o=q?.originalWork,ev=item?.submissionEvent,
  seal=item?.submissionEventHash;
 if(!q||!o||item.origin!==WORK||q.origin!==WORK||
  item.sourceHash!==hash(q)||
  q.eventId!==row.id||q.invitationHash!==row.sourceHash||
  q.actorId!=='player'||q.playerName!==row.source.playerNameAtPublication||
  q.venue!==row.venue||
  !Number.isInteger(q.submittedAtMinute)||
  q.submittedAtMinute<row.publishedMinute||
  q.submittedAtMinute>s.world.minutes||
  !Number.isInteger(o.completedAtMinute)||
  o.completedAtMinute<0||o.completedAtMinute>q.submittedAtMinute||
  q.preannouncedWork!==(o.completedAtMinute>=row.publishedMinute)||
  q.noAcceptedEntryOrEligibility!==true||
  q.noJudgeScoreRankOrReward!==true||
  !ev||seal!==hash(ev)||ev.type!=='story'||
  ev.text!=='You offer original completed work for the announced public gathering; no judge has accepted it.'||
  ev.day!==Math.floor(q.submittedAtMinute/DAY)+1||
  ev.time!=='Day '+(Math.floor(q.submittedAtMinute/DAY)+1)+', '+
   String(Math.floor((q.submittedAtMinute%DAY)/60)).padStart(2,'0')+':'+
   String(q.submittedAtMinute%60).padStart(2,'0')||
  ev.details?.origin!==WORK||ev.details?.eventId!==row.id||
  ev.details?.actorId!=='player'||
  ev.details?.originalSourceHash!==hash(o)||
  ev.details?.noAdjudication!==true)
  return false;
 // The actual archived original work source is independently reverified
 // every time: one cannot reseal a production history to claim extra items.
 let expected;
 try{expected=originalWork(s,o.sourceOwner,o.sourceId)}catch{return false;}
 if(JSON.stringify(o)!==JSON.stringify(expected))return false;
 const live=(s.log||[]).filter(x=>x.details?.origin===WORK&&
  x.details.eventId===row.id&&
  x.details.originalSourceHash===hash(o));
 if(live.some(x=>hash(x)!==seal)||
  (!live.some(x=>hash(x)===seal)&&s.log.length<90))return false;
 return true;
}
function announce(s,p={}){
 shape(p,['eventId','title','description','criteria','eligibility','judging','appeals','prizeTerms','season','eventDay','startsAtMinuteOfDay'],['openAdmission','workReview']);
 if(!validId(p.eventId)||!prose(p.title,5,110)||
  !['description','criteria','eligibility','judging','appeals','prizeTerms'].every(k=>
    prose(p[k],k==='description'?20:k==='criteria'?16:k==='prizeTerms'?8:10,900))||
  !prose(p.season,3,120)||
  (p.openAdmission!==undefined&&!validOpenAdmission(p.openAdmission))||
  (p.workReview!==undefined&&(!validWorkReview(p.workReview)||
   !validOpenAdmission(p.openAdmission)))||
  !Number.isInteger(p.eventDay)||
  p.eventDay<1||p.eventDay>20000000||
  !Number.isInteger(p.startsAtMinuteOfDay)||
  p.startsAtMinuteOfDay<0||p.startsAtMinuteOfDay>=DAY||
  (p.eventDay-1)*DAY+p.startsAtMinuteOfDay<=s.world.minutes+5)
  throw Error('A real, future, locally witnessed public event must have GM-authored cultural terms and a dated schedule');
 if(s.battle||s.encounter)throw Error('Cannot publish an unrelated public event during an unresolved encounter');
 const venue=Place.location(s),old=s.world.minutes;
 if(!venue)throw Error('Only an established currently witnessed real place may have a public competition announcement');
 const ledger=s.table?.competitionNotices||{};
 if(ledger[key(p.eventId)])
  throw Error('This event invitation has already been observed; editing announced criteria retrospectively is not allowed');
 const title=p.title.trim(),description=p.description.trim(),
  criteria=p.criteria.trim(),eligibility=p.eligibility.trim(),
  judging=p.judging.trim(),appeals=p.appeals.trim(),
  prizeTerms=p.prizeTerms.trim(),season=p.season.trim();
 const source={origin:ORIGIN,eventId:p.eventId,venue:venue.id,
  regionId:venue.regionId,publishedMinute:old+5,eventDay:p.eventDay,
  startsAtMinuteOfDay:p.startsAtMinuteOfDay,
  scheduledAtMinute:(p.eventDay-1)*DAY+p.startsAtMinuteOfDay,
  playerNameAtPublication:s.player.name,
  title,description,criteria,eligibility,judging,appeals,prizeTerms,season,
  ...(p.openAdmission!==undefined?
   {openAdmission:structuredClone(p.openAdmission)}:{}),
  ...(p.workReview!==undefined?
   {workReview:structuredClone(p.workReview)}:{}),
  noAutomaticInstitutionalAuthority:true,noAutomaticEntrantsOrConsent:true,
  noAutomaticScoreRankOrReward:true};
 // Establish GM-visible and reader-known observation in the original world.
 E.advance(s,5);Time.finalizeTime(s,old);Health.sync(s,{source:'legacy'});
 Core.event(s,'world','A public local competition invitation is witnessed: '+title+'.',
  {origin:ORIGIN,eventId:p.eventId,venue:venue.id,
   publishedMinute:s.world.minutes,eventDay:p.eventDay,
   scheduledAtMinute:source.scheduledAtMinute,
   termsHash:hash(publishedTerms(source)),
   noticeNotOfficialPermission:true,noAutomaticRewards:true});
 const publicationEvent=structuredClone(s.log.at(-1));
 s.table||={};s.table.competitionNotices||={};
 const record={origin:ORIGIN,id:p.eventId,venue:venue.id,
  publishedMinute:s.world.minutes,eventDay:p.eventDay,
  source,sourceHash:hash(source),
  publicationEvent,publicationEventHash:hash(publicationEvent),
  playerNameAtFirstNotice:s.player.name,interests:[],submissions:[],entrants:[],reviews:[]};
 s.table.competitionNotices[key(p.eventId)]=record;
 verify(s,record);
 return {observed:true,eventId:p.eventId,title,venue:venue.name,
  eventDay:p.eventDay,startsAtMinuteOfDay:p.startsAtMinuteOfDay,
  season,announcedCriteria:criteria,
  registrationNotAutomatic:true,hasPublishedOpenAdmission:!!source.openAdmission,
  hasOriginalWorkBenchmark:!!source.workReview,
  rankAndPrizesNotGranted:true,elapsedMinutes:5};
}
function record(s,row,choice){
 const q={origin:INTEREST,eventId:row.id,invitationHash:row.sourceHash,
  actorId:choice.actorId,worldMinute:s.world.minutes,venue:row.venue,
  voluntarilyInterested:choice.interested,
  noAutomaticEntryOrQualification:true,
  noNPCChoice:choice.actorId==='player',
  ...(choice.actorId==='player'?{playerName:s.player.name}:{
    personOriginHash:choice.originHash,
    originalPresence:choice.presence,
    independentDecision:choice.decision})};
 row.interests.push({origin:INTEREST,actorId:choice.actorId,
  source:q,hash:hash(q)});
}
function interest(s,p={}){
 shape(p,['eventId'],['npcId']);
 const row=s.table?.competitionNotices?.[key(p.eventId)];
 if(!row)throw Error('Only a personally observed and still recorded public invitation can receive an interest response');
 verify(s,row);
 if(s.world.location!==row.venue||s.world.minutes>=row.source.scheduledAtMinute)
  throw Error('A genuine future event and presence at the original local public notice are required');
 if(s.battle||s.encounter)
  throw Error('Immediate danger prevents a considered in-person competition invitation');
 const actor=p.npcId||'player';
 if(actor!=='player'&&(typeof actor!=='string'||!actor.startsWith('emergent:')))
  throw Error('An individual independent person—not a chosen NPC agreement or invented entrant—is required');
 if(row.interests.some(x=>x.actorId===actor))
  throw Error('The same invitation has already received this individual response; no reroll');
 const old=s.world.minutes;
 if(actor==='player'){
  record(s,row,{actorId:'player',interested:true});
  Core.event(s,'story','You express interest in the locally announced public event; the organiser has not yet accepted entry.',
   {origin:INTEREST,eventId:row.id,actorId:'player',
    noAutomaticRegistration:true});
  verify(s,row);
  return {interested:true,actorId:'player',notRegistered:true,
   noRankOrPrize:true,elapsedMinutes:0};
 }
 const w=Realm.peek(s),identity=People.resolve(w,actor,s.world.location,Math.floor(old/DAY));
 const person=w.emergentPeople?.people?.[actor.slice('emergent:'.length)],
  shift=identity?.presence;
 if(!person||!shift||!Emergent.verify(w,person)||
  !People.proof(w,actor,s.world.location,Math.floor(old/DAY),shift))
  throw Error('Only a genuinely present and independent living person may consider this invitation');
 const choice=Emergent.considerPublicInvitation(w,person,row.sourceHash);
 record(s,row,{actorId:actor,interested:choice.interested,
  originHash:person.originHash,presence:structuredClone(shift),
  decision:choice.source});
 Core.event(s,'story',person.name+(choice.interested?
  ' expresses interest in the announced event; this is not accepted entry.':
  ' declines the invitation to take interest in this event.'),
  {origin:INTEREST,eventId:row.id,actorId:actor,interested:choice.interested,
   originalPersonSourceHash:person.originHash,noAutomaticRegistration:true});
 verify(s,row);
 return {actorId:actor,name:person.name,interested:choice.interested,
  independentlyDecided:true,notRegistered:true,noRankOrPrize:true,
  noPlayerRngConsumed:true,elapsedMinutes:0};
}
// This is an evidence *offer*, not entry, eligibility determination or
// competition judgment. Both proof classes are actual earlier original
// engine actions, checked by their own authoritative modules.
function submitWork(s,p={}){
 shape(p,['eventId','sourceOwner','sourceId']);
 const row=s.table?.competitionNotices?.[key(p.eventId)];
 if(!row)throw Error('A real already published public gathering is necessary to offer work');
 verify(s,row);
 if(s.battle||s.encounter||s.world.location!==row.venue)
  throw Error('Original personal work may be offered only at this witnessed local public gathering');
 if(!row.interests.some(x=>x.actorId==='player'&&
  x.source?.voluntarilyInterested===true))
  throw Error('Only the original willing person may submit their own work after expressing interest');
 const proof=originalWork(s,p.sourceOwner,p.sourceId);
 if((row.submissions||[]).some(x=>x.source?.originalWork?.sourceOwner===p.sourceOwner&&
  x.source.originalWork.sourceId===p.sourceId))
  throw Error('The same original completed work has already been offered to this event');
 if((row.submissions||[]).length>=100)
  throw Error('This public record cannot accept more personal work witnesses');
 // No universal event deadline: the original announced terms may permit
 // archive presentations, live contests or retrospective review.
 // This still confers ZERO mechanical eligibility or scored result.
 const old=s.world.minutes;
 E.advance(s,5);Time.finalizeTime(s,old);Health.sync(s,{source:'legacy'});
 const source={origin:WORK,eventId:row.id,invitationHash:row.sourceHash,
  actorId:'player',playerName:s.player.name,venue:row.venue,
  submittedAtMinute:s.world.minutes,originalWork:proof,
  preannouncedWork:proof.completedAtMinute>=row.publishedMinute,
  noAcceptedEntryOrEligibility:true,noJudgeScoreRankOrReward:true};
 Core.event(s,'story',
  'You offer original completed work for the announced public gathering; no judge has accepted it.',
  {origin:WORK,eventId:row.id,actorId:'player',
   originalSourceHash:hash(proof),noAdjudication:true});
 const submissionEvent=structuredClone(s.log.at(-1));
 const item={origin:WORK,source,sourceHash:hash(source),
  submissionEvent,submissionEventHash:hash(submissionEvent)};
 row.submissions||=[];
 row.submissions.push(item);
 if(!verifySubmittedWork(s,row,item))
  throw Error('Original work did not produce a valid source-attested public submission');
 return {offered:true,eventId:row.id,
  sourceOwner:p.sourceOwner,sourceId:p.sourceId,
  originalOutcome:proof.originalOutcome,
  preannouncedWork:source.preannouncedWork,
  notAcceptedOrJudged:true,notRankedOrRewarded:true,
  noSecondPerformanceRoll:true,elapsedMinutes:5};
}
function verifyAdmission(s,row,item){
 return require('./public-event-admission').verify(s,row,item);
}
function enter(s,p={}){
 return require('./public-event-admission').enter(s,p);
}
function verifyWorkReview(s,row,item){
 return require('./public-event-review').verify(s,row,item);
}
function reviewWork(s,p={}){
 return require('./public-event-review').review(s,p);
}
function status(s,p={}){
 shape(p,[],['eventId']);
 if(p.eventId!==undefined&&!validId(p.eventId))
  throw Error('A genuine public competition event identifier is required');
 const notices=Object.values(s.table?.competitionNotices||{})
  .filter(x=>x?.origin===ORIGIN&&
   (p.eventId===undefined||x.id===p.eventId));
 return {events:notices.map(row=>{
  const a=verify(s,row);
  return {eventId:a.eventId,title:a.title,venue:a.venue,
   eventDay:a.eventDay,startsAtMinuteOfDay:a.startsAtMinuteOfDay,
   season:a.season,description:a.description,
   announcedCriteria:a.criteria,eligibility:a.eligibility,
   judging:a.judging,appeals:a.appeals,prizeTerms:a.prizeTerms,
   witnessedInterests:row.interests.map(x=>({
    actorId:x.actorId,interested:x.source.voluntarilyInterested})),
   actualOpenEntrants:(row.entrants||[]).map(x=>({
    actorId:x.source.actorId,registered:x.source.registered,
    localOpenEntryOnly:true,noJudgeOrOfficialRank:true})),
   independentlyReviewedWork:(row.reviews||[]).map(x=>({
    actorId:x.source.actorId,reviewerId:x.source.reviewerId,
    reviewerWilling:x.source.willing,
    objectiveBenchmarkMet:x.source.benchmarkMet,
    noInstitutionalScoreOrReward:true})),
   playerOfferedWork:(row.submissions||[]).map(x=>({
    sourceOwner:x.source.originalWork.sourceOwner,
    sourceId:x.source.originalWork.sourceId,
    originalOutcome:x.source.originalWork.originalOutcome,
    preannouncedWork:x.source.preannouncedWork,
    noEligibilityOrJudgeDecision:true})),
   noConfirmedEntrants:!(row.entrants||[]).some(x=>x.source.registered),
   noJudgedResults:!(row.reviews||[]).some(x=>x.source.willing),
   noCreditedRankOrRewards:true};
 }),note:'Observed local public invitations only. Described prizes, public rules and willingness do not establish competent officials, funded payouts, proven eligibility, actual performance or scored competition.'};
}
module.exports={ORIGIN,INTEREST,WORK,ENTRY,validOpenAdmission,validWorkReview,originalWork,announce,interest,submitWork,enter,reviewWork,status,verify};
