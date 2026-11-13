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
 Emergent=require('../world/emergent-people');
const ORIGIN='gm-observed-local-public-competition-invitation-v1',
 INTEREST='personally-witnessed-voluntary-public-competition-interest-v1',
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
function verify(s,row){
 const a=row?.source,ev=row?.publicationEvent,created=row?.sourceHash,
  seal=row?.publicationEventHash;
 if(!a||!row||row.origin!==ORIGIN||!validId(a.eventId)||
  row.id!==a.eventId||row.sourceHash!==hash(a)||row.sourceHash!==created||
  a.origin!==ORIGIN||a.venue!==row.venue||
  a.publishedMinute!==row.publishedMinute||
  a.eventDay!==row.eventDay||
  !Number.isInteger(a.publishedMinute)||a.publishedMinute<0||
  a.publishedMinute>s.world.minutes||
  a.playerNameAtPublication!==row.playerNameAtFirstNotice||
  !Number.isInteger(a.eventDay)||a.eventDay<=Math.floor(a.publishedMinute/DAY)||
  !Place.location(s,a.venue)||
  a.regionId!==Place.location(s,a.venue)?.regionId||
  !prose(a.title,5,110)||!prose(a.description,20,900)||
  !prose(a.criteria,16,900)||!prose(a.eligibility,10,900)||
  !prose(a.judging,10,900)||!prose(a.appeals,10,900)||
  !prose(a.prizeTerms,8,900)||!prose(a.season,3,120)||
  a.noAutomaticInstitutionalAuthority!==true||
  a.noAutomaticEntrantsOrConsent!==true||
  a.noAutomaticScoreRankOrReward!==true||
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
  ev.details?.termsHash!==hash({
   title:a.title,description:a.description,criteria:a.criteria,
   eligibility:a.eligibility,judging:a.judging,appeals:a.appeals,
   prizeTerms:a.prizeTerms,season:a.season})||
  !Array.isArray(row.interests)||row.interests.length>100||
  row.interests.some((x,i)=>!verifyInterest(row,x)||
   row.interests.findIndex(y=>y.actorId===x.actorId)!==i))
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
  !Number.isInteger(q.worldMinute)||q.worldMinute>=row.eventDay*DAY||
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
  q.independentDecision.activityHash!==row.sourceHash)
  return false;
 return Emergent.verifyPublicInvitationChoice(q.independentDecision);
}
function announce(s,p={}){
 shape(p,['eventId','title','description','criteria','eligibility','judging','appeals','prizeTerms','season','eventDay']);
 if(!validId(p.eventId)||!prose(p.title,5,110)||
  !['description','criteria','eligibility','judging','appeals','prizeTerms'].every(k=>
    prose(p[k],k==='description'?20:k==='criteria'?16:k==='prizeTerms'?8:10,900))||
  !prose(p.season,3,120)||!Number.isInteger(p.eventDay)||
  p.eventDay<=Math.floor((s.world.minutes+5)/DAY)||
  p.eventDay>20000000)
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
  playerNameAtPublication:s.player.name,
  title,description,criteria,eligibility,judging,appeals,prizeTerms,season,
  noAutomaticInstitutionalAuthority:true,noAutomaticEntrantsOrConsent:true,
  noAutomaticScoreRankOrReward:true};
 // Establish GM-visible and reader-known observation in the original world.
 E.advance(s,5);Time.finalizeTime(s,old);Health.sync(s,{source:'legacy'});
 Core.event(s,'world','A public local competition invitation is witnessed: '+title+'.',
  {origin:ORIGIN,eventId:p.eventId,venue:venue.id,
   publishedMinute:s.world.minutes,eventDay:p.eventDay,
   termsHash:hash({title,description,criteria,eligibility,
    judging,appeals,prizeTerms,season}),
   noticeNotOfficialPermission:true,noAutomaticRewards:true});
 const publicationEvent=structuredClone(s.log.at(-1));
 s.table||={};s.table.competitionNotices||={};
 const record={origin:ORIGIN,id:p.eventId,venue:venue.id,
  publishedMinute:s.world.minutes,eventDay:p.eventDay,
  source,sourceHash:hash(source),
  publicationEvent,publicationEventHash:hash(publicationEvent),
  playerNameAtFirstNotice:s.player.name,interests:[]};
 s.table.competitionNotices[key(p.eventId)]=record;
 verify(s,record);
 return {observed:true,eventId:p.eventId,title,venue:venue.name,
  eventDay:p.eventDay,season,announcedCriteria:criteria,
  registrationNotAutomatic:true,rankAndPrizesNotGranted:true,elapsedMinutes:5};
}
function record(s,row,choice){
 const q={origin:INTEREST,eventId:row.id,invitationHash:row.sourceHash,
  actorId:choice.actorId,worldMinute:s.world.minutes,venue:row.venue,
  voluntarilyInterested:choice.interested,
  noAutomaticEntryOrQualification:true,
  noNPCChoice:choice.actorId==='player',
  ...(choice.actorId==='player'?{playerName:s.player.name}:{
    personOriginHash:choice.originHash,
    independentDecision:choice.decision})};
 row.interests.push({origin:INTEREST,actorId:choice.actorId,
  source:q,hash:hash(q)});
}
function interest(s,p={}){
 shape(p,['eventId'],['npcId']);
 const row=s.table?.competitionNotices?.[key(p.eventId)];
 if(!row)throw Error('Only a personally observed and still recorded public invitation can receive an interest response');
 verify(s,row);
 if(s.world.location!==row.venue||s.world.minutes>=row.eventDay*DAY)
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
  originHash:person.originHash,decision:choice.source});
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
   eventDay:a.eventDay,season:a.season,description:a.description,
   announcedCriteria:a.criteria,eligibility:a.eligibility,
   judging:a.judging,appeals:a.appeals,prizeTerms:a.prizeTerms,
   witnessedInterests:row.interests.map(x=>({
    actorId:x.actorId,interested:x.source.voluntarilyInterested})),
   noConfirmedEntrants:true,noJudgedResults:true,
   noCreditedRankOrRewards:true};
 }),note:'Observed local public invitations only. Described prizes, public rules and willingness do not establish competent officials, funded payouts, proven eligibility, actual performance or scored competition.'};
}
module.exports={ORIGIN,INTEREST,announce,interest,status,verify};
