'use strict';
// One bounded, playable guild assessment: real scheduled officials review an
// earlier witnessed Copperwood field report. No free contest dice, arbitrary
// NPC scores, entry dates, grades, prizes or unobserved fieldwork.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),W=require('./world'),
 Health=require('./unified'),Habitat=require('./habitat-survey');
const DAY=1440,OPEN=9*60,CLOSE=15*60,DURATION=120,NOTICE_MINUTES=5;
const ID='field_assessment';
const digest=e=>Crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex');
function canonical(){
 const event=E.COMPETITIONS.find(x=>x.id===ID);
 const official=E.NPCS.elira;
 if(!event||event.venue!=='crossing'||event.category!=='Ecology'||
    event.ranking!=='fieldwork'||event.skill!=='survival'||
    event.attribute!=='wis'||event.dc!==13||event.fee!==5||
    event.reward!==24||official?.location!=='crossing'||
    official.profession!=='Guild registrar')
  throw Error('The independent Copperwood assessment and its registrar are not established in the world table');
 return {event,official};
}
function day(s){return E.day(s);}
function minuteOfDay(s){return s.world.minutes%DAY;}
function upcoming(s){
 const today=day(s),endOfSixday=Math.ceil(today/6)*6;
 return today===endOfSixday&&minuteOfDay(s)>CLOSE
  ?endOfSixday+6:endOfSixday;
}
function requireOnly(p,keys){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>!keys.includes(k))||
    keys.some(k=>!Object.prototype.hasOwnProperty.call(p,k)))
  throw Error('Field assessment accepts only its established request fields, never a chosen date, judge, score or result');
}
// #21: The existing assessment cannot treat a caller-shaped bulletin as
// proof that the public registrar actually published it. Tie its original
// announced terms to the ACTUAL witnessed world event, with an archived
// copy surviving the ordinary 90-entry narrative log rotation.
function verifiedNotice(s,n,event,official,eventDay){
 const text=official.name+' posts the '+event.name+
  ' field-report assessment for Day '+eventDay+
  ', from 09:00 to 15:00 at the crossing.';
 const publicationDay=Math.floor(n?.worldMinute/DAY)+1,
  minute=(n?.worldMinute??0)%DAY;
 const originalClock='Day '+publicationDay+', '+
  String(Math.floor(minute/60)).padStart(2,'0')+':'+
  String(minute%60).padStart(2,'0');
 const correct=ev=>ev?.type==='world'&&ev.text===text&&
  ev.day===publicationDay&&ev.time===originalClock&&
  ev.details?.eventId===ID&&ev.details.eventDay===eventDay&&
  ev.details.venue==='crossing'&&ev.details.official===official.name;
 if(!n||n.eventId!==ID||n.eventDay!==eventDay||
  n.location!=='crossing'||n.official!==official.name||
  n.fee!==event.fee||n.reward!==event.reward||
  n.source!=='Official '+event.name+' bulletin at Morrowfen Crossing, posted by '+
   official.name+' for work-sixday '+eventDay||
  !Number.isInteger(n.worldMinute)||n.worldMinute<0||
  n.worldMinute>s.world.minutes||
  Math.floor(n.worldMinute/DAY)+1>eventDay||
  eventDay-(Math.floor(n.worldMinute/DAY)+1)>6)
  throw Error('An authentic originally witnessed competition notice for the correct date is required');
 const archived=n.originalPublicationEvent,seal=n.publicationEventHash;
 if((archived===undefined)!==(seal===undefined))
  throw Error('The competition notice has lost part of its original publication evidence');
 const live=(s.log||[]).some(ev=>correct(ev)&&
  (!archived||digest(ev)===seal));
 // If the original announcement is STILL identifiable in the active
 // narrative log, altered text or timestamps are corruption, not valid
 // log rotation—even if the log also happens to be at its 90-row limit.
 const contradicted=(s.log||[]).some(ev=>
  ev?.type==='world'&&ev.details?.eventId===ID&&
  ev.details.eventDay===eventDay&&ev.details.venue==='crossing'&&
  ev.details.official===official.name&&
  archived&&digest(ev)!==seal);
 // Unarchived legacy notices can still be used IF their historic
 // publication event is genuinely still present; inventing old-format
 // notice fields without the original event cannot create a contest.
 if(archived===undefined){
  if(!live)throw Error('A legacy competition bulletin requires its actual original public scene');
 }else if(!correct(archived)||typeof seal!=='string'||
  !/^[a-f0-9]{64}$/.test(seal)||digest(archived)!==seal||
  (!live&&(contradicted||s.log.length<90)))
  throw Error('A source-sealed original competition publication is required');
 return n;
}
function safe(s){
 if(s.battle||s.encounter)throw Error('Resolve the present beast encounter or fight before visiting the guild assessment');
 if(s.world?.location!=='crossing')throw Error('The Copperwood Assessment registrar and public notice board are at Morrowfen Crossing');
 const combatant=s.table?.combatants?.player;
 if(s.player.health!==s.player.maxHealth||
   (combatant&&(combatant.status!=='ok'||combatant.wounds?.some(w=>w>0))))
  throw Error('Field competition is not available while the entrant is injured or incapacitated');
}
function notice(s,p={}){
 requireOnly(p,[]);
 safe(s);
 const {event,official}=canonical(),eventDay=upcoming(s);
 const existing=s.table?.competitionNotices?.[ID+'_'+eventDay];
 if(existing)throw Error('The same independent event notice has already been witnessed');
 const old=s.world.minutes;
 E.advance(s,NOTICE_MINUTES);
 W.finalizeTime(s,old);
 Health.sync(s,{source:'legacy'});
 const source='Official '+event.name+' bulletin at Morrowfen Crossing, posted by '+official.name+
  ' for work-sixday '+eventDay;
 const key=ID+'_'+eventDay;
 s.table||={};s.table.competitionNotices||={};
 C.event(s,'world',official.name+' posts the '+event.name+' field-report assessment for Day '+eventDay+
  ', from 09:00 to 15:00 at the crossing.',{eventId:ID,eventDay,venue:'crossing',official:official.name});
 const originalPublicationEvent=structuredClone(s.log.at(-1));
 s.table.competitionNotices[key]={
  eventId:ID,eventDay,location:'crossing',official:official.name,
  source,worldMinute:s.world.minutes,fee:event.fee,reward:event.reward,used:false,
  originalPublicationEvent,
  publicationEventHash:digest(originalPublicationEvent)
 };
 verifiedNotice(s,s.table.competitionNotices[key],event,official,eventDay);
 return {witnessed:true,eventId:ID,eventName:event.name,eventDay,
  open:'09:00',lastEntry:'15:00',fee:event.fee,
  judgedOn:'One independently witnessed and resolved Copperwood Verge habitat survey in this work-sixday',
  official:official.name,elapsedMinutes:NOTICE_MINUTES};
}
function status(s,p={}){
 requireOnly(p,[]);
 const {event}=canonical();
 verifyJudgedHistory(s);
 const eventDay=upcoming(s),key=ID+'_'+eventDay;
 const notice=s.table?.competitionNotices?.[key];
 if(notice)verifiedNotice(s,notice,event,canonical().official,eventDay);
 const results=(s.player?.competitionRecord||[]).filter(x=>
  x.event===ID&&x.origin==='judged-witnessed-habitat-report')
  .map(x=>({eventDay:x.eventDay,result:x.result,points:x.points,reportId:x.sourceCheckId}))
  .slice(-8);
 return {eventId:ID,eventName:event.name,
  // Do not make an unseen future public bulletin appear in remote player knowledge.
  boardAvailable:s.world?.location==='crossing',
  eventDay:notice?notice.eventDay:null,posted:!!notice,
  registeredResult:notice?.used===true,
  open:notice?'09:00':null,lastEntry:notice?'15:00':null,
  fee:notice?event.fee:null,recentResults:results};
}
function proof(s,checkId,eventDay){
 if(typeof checkId!=='string'||!/^[a-z0-9][a-z0-9_-]{4,79}$/.test(checkId))
  throw Error('One previously witnessed Copperwood survey checkId is required');
 const a=s.table?.sceneChecks?.[checkId],
       f=s.table?.habitatSurveyFindings?.[checkId],
       cfg=Habitat.SURVEYS.forest,loc=E.LOCATIONS.forest;
 const start=(eventDay-6)*DAY;
 if(!a||!f||a.checkId!==checkId||a.origin!=='engine-habitat-survey'||
    a.location!=='forest'||a.biome!=='forest'||a.subject!==cfg.subject||
    a.dc!==cfg.dc||a.extra!==0||a.minutes!==15||
    a.attribute!=='wis'||a.skill!=='survival'||a.risky!==true||
    a.label!=='Interpret '+cfg.subject||
    a.source!=='Engine-observed '+cfg.sign.toLowerCase()+' at known '+loc.name||
    !a.used||!Number.isInteger(a.checkedAtMinute)||
    a.checkedAtMinute<start||a.checkedAtMinute>s.world.minutes||
    !Number.isInteger(a.worldMinute)||a.worldMinute<start||
    a.worldMinute>a.checkedAtMinute||
    !Number.isInteger(a.eventIndex)||a.eventIndex<0||a.eventIndex>=s.log.length)
  throw Error('A resolved, same-work-sixday, independently witnessed Copperwood habitat report is required');
 const scene=s.log[a.eventIndex];
 if(scene?.type!=='world'||scene.text!==cfg.sign+' are visible at '+loc.name+'.'||
    scene.details?.checkId!==checkId||scene.details?.location!=='forest'||
    scene.details?.biome!=='forest'||scene.details?.observation!=='terrain-traces'||
    a.eventHash!==digest(scene)||s.table?.sceneCheckEventsUsed?.[a.eventHash]!==checkId)
  throw Error('The original Copperwood terrain witness is missing or inconsistent');
 if(f.checkId!==checkId||f.location!=='forest'||f.biome!=='forest'||
    f.observedSceneHash!==a.eventHash||f.interpretedAtMinute!==a.checkedAtMinute||
    !Number.isInteger(f.rollEventIndex)||f.rollEventIndex<=a.eventIndex||
    f.rollEventIndex>=s.log.length)
  throw Error('The original resolved field report cannot be independently reconstructed');
 const roll=s.log[f.rollEventIndex],r=roll?.details;
 if(roll?.type!=='roll'||digest(roll)!==f.rollEventHash||
    !r||!Number.isInteger(r.roll)||r.roll<1||r.roll>20||
    !Number.isInteger(r.total)||!Number.isInteger(r.margin)||
    r.total-r.dc!==r.margin||r.dc!==a.dc||r.margin!==r.total-a.dc||
    r.success!==f.success||r.degree!==f.degree||
    r.success!==(r.margin>=0)||!roll.text.includes(a.label))
  throw Error('The actual earlier survival die, margin and recorded interpretation must agree');
 return {a,f,r};
}
// A competition's posted notice is not a *judged result*. Keep each
// result tied to the original independently resolved performance and the
// existing player competitionRecord, ranking and receipt. This verifier
// does not award scores, author a prize budget or define an event system.
// Historical pre-source-seal results remain readable, but cannot be
// retroactively claimed to have a new source witness.
function verifyJudgedHistory(s){
 const receipts=s.table?.competitionReceipts||{},
  records=s.player?.competitionRecord||[];
 if(!receipts||typeof receipts!=='object'||Array.isArray(receipts)||
  !Array.isArray(records))
  throw Error('The original competition result history needs reconciliation');
 const {event,official}=canonical(),seen=new Set(),seals=new Set();
 for(const [key,row] of Object.entries(receipts)){
  if(!key.startsWith(ID+'_'))continue;
  const q=row?.source,seal=row?.sourceHash;
  if(q===undefined&&seal===undefined)continue; // real older saves
  const n=s.table?.competitionNotices?.[key],
   a=s.table?.sceneChecks?.[q?.checkId],
   f=s.table?.habitatSurveyFindings?.[q?.checkId],
   roll=f?.rollEvent,details=roll?.details,
   record=records.filter(x=>x?.sourceJudgementHash===seal);
  if(!q||!seal||seal!==digest(q)||seals.has(seal)||
   q.origin!=='original-witnessed-competition-judgement-v1'||
   q.eventId!==ID||key!==ID+'_'+q.eventDay||
   !Number.isInteger(q.eventDay)||q.eventDay<1||
   q.eventDay%6!==0||
   q.official!==official.name||q.entryFee!==event.fee||
   q.reward!== (q.result==='Unplaced'?0:event.reward)||
   !Number.isInteger(q.judgedAtMinute)||
   Math.floor(q.judgedAtMinute/DAY)+1!==q.eventDay||
   q.judgedAtMinute>s.world.minutes-DURATION||
   q.judgedAtMinute%DAY<OPEN||q.judgedAtMinute%DAY>CLOSE||
   !n||n.used!==true||n.submittedCheckId!==q.checkId||
   n.enteredAtMinute!==q.judgedAtMinute||
   q.originalNoticeHash!==n.publicationEventHash||
   !a||!f||a.checkId!==q.checkId||
   a.origin!=='engine-habitat-survey'||a.location!=='forest'||
   !a.used||f.checkId!==q.checkId||
   f.observedSceneHash!==a.eventHash||
   !a.observationEvent||digest(a.observationEvent)!==a.eventHash||
   !roll||digest(roll)!==f.rollEventHash||
   q.originalReportHash!==f.rollEventHash||
   !details||roll.type!=='roll'||!Number.isInteger(details.roll)||
   details.roll<1||details.roll>20||
   !Number.isInteger(details.total)||!Number.isInteger(details.margin)||
   details.margin!==details.total-details.dc||
   details.dc!==a.dc||details.success!==(details.margin>=0)||
   !Number.isInteger(a.worldMinute)||a.worldMinute<n.worldMinute||
   a.worldMinute>q.judgedAtMinute||
   !Number.isInteger(a.checkedAtMinute)||
   a.checkedAtMinute<a.worldMinute||a.checkedAtMinute>q.judgedAtMinute||
   s.table?.sceneCheckEventsUsed?.[a.eventHash]!==q.checkId||
   s.table?.competitionReportsUsed?.[q.checkId]!==q.eventDay||
   seen.has(q.checkId)||record.length!==1)
   throw Error('A source-sealed competition judgement cannot be reconstructed from original events');
  verifiedNotice(s,n,event,official,q.eventDay);
  const margin=details.total-event.dc,
   result=margin>=10?'Distinction':margin>=5?'Merit':
    margin>=0?'Pass':'Unplaced',
   points=margin>=0?Math.max(0,Math.min(30,margin+10)):0,
   earned=margin>=0?event.reward:0,
   credential=margin>=0?event.name+' — '+result:null,
   match=record[0];
  if(q.score!==details.total||q.result!==result||
   q.points!==points||q.reward!==earned||
   q.qualification!==credential||
   !Number.isSafeInteger(q.coinsBefore)||q.coinsBefore<event.fee||
   q.coinsAfter!==q.coinsBefore-event.fee+earned||
   !Number.isInteger(q.pointsBefore)||q.pointsBefore<0||
   q.pointsAfter!==q.pointsBefore+points||
   !Number.isInteger(q.guildReputationBefore)||
   q.guildReputationAfter!==q.guildReputationBefore+(margin>=0?2:0)||
   row.eventDay!==q.eventDay||row.checkId!==q.checkId||
   row.result!==result||row.points!==points||
   row.fee!==event.fee||row.reward!==earned||
   row.official!==official.name||
   match.event!==ID||match.day!==q.eventDay||
   match.eventDay!==q.eventDay||match.result!==result||
   match.points!==points||match.score!==details.total||
   match.sourceCheckId!==q.checkId||
   match.origin!=='judged-witnessed-habitat-report')
   throw Error('The existing competition ranking, award or qualification result was altered');
  seen.add(q.checkId);seals.add(seal);
 }
 if(records.some(x=>x?.sourceJudgementHash!==undefined&&
  x.event===ID&&!seals.has(x.sourceJudgementHash)))
  throw Error('A competition result cannot claim a nonexistent source-sealed judgement');
 return {verified:seals.size};
}
function fieldAssessment(s,p={}){
 requireOnly(p,['checkId']);
 safe(s);
 const {event,official}=canonical();
 verifyJudgedHistory(s);
 const eventDay=day(s),clock=minuteOfDay(s);
 if(eventDay%6!==0||clock<OPEN||clock>CLOSE)
  throw Error('Official Copperwood field-report assessments run only on a scheduled sixth day, 09:00–15:00');
 const key=ID+'_'+eventDay,n=s.table?.competitionNotices?.[key];
 if(!n||n.used||s.table?.competitionReceipts?.[key])
  throw Error('A previously witnessed, unused official guild assessment notice for today is required');
 verifiedNotice(s,n,event,official,eventDay);
 const report=proof(s,p.checkId,eventDay);
 if(report.a.worldMinute<n.worldMinute)
  throw Error('Competition criteria must be actually published before the qualifying work, not retroactively assigned');
 if(s.table?.competitionReportsUsed?.[p.checkId])
  throw Error('This witnessed field report has already been submitted for an official assessment');
 if(!Number.isInteger(s.player.coins)||s.player.coins<event.fee)
  throw Error('A real entry fee of five Talons is required');
 if(!Array.isArray(s.player.competitionRecord)||!s.player.rankings||
    !Number.isInteger(s.player.rankings.fieldwork)||
    !Number.isInteger(s.player.reputation?.guild)||
    !Array.isArray(s.player.qualifications))
  throw Error('Existing character competition, ranking and qualification records must be reconciled');
 const margin=report.r.total-event.dc;
 const result=margin>=10?'Distinction':margin>=5?'Merit':margin>=0?'Pass':'Unplaced';
 const points=margin>=0?Math.max(0,Math.min(30,margin+10)):0;
 const reward=margin>=0?event.reward:0;
 // Preserve the ORIGINAL score, qualification and funds/ranking changes
 // in one existing result receipt. No extra die or external contest.
 const judgedAtMinute=s.world.minutes,
  source={origin:'original-witnessed-competition-judgement-v1',
   eventId:ID,eventDay,official:official.name,checkId:p.checkId,
   originalNoticeHash:n.publicationEventHash,
   originalReportHash:report.f.rollEventHash,
   judgedAtMinute,score:report.r.total,result,points,
   entryFee:event.fee,reward,
   coinsBefore:s.player.coins,
   coinsAfter:s.player.coins-event.fee+reward,
   pointsBefore:s.player.rankings.fieldwork,
   pointsAfter:s.player.rankings.fieldwork+points,
   guildReputationBefore:s.player.reputation.guild,
   guildReputationAfter:s.player.reputation.guild+(margin>=0?2:0),
   qualification:margin>=0?event.name+' — '+result:null},
  sourceHash=digest(source);
 // No second roll. All eligibility checks have completed before spending.
 s.player.coins-=event.fee;
 s.player.coins+=reward;
 s.player.rankings.fieldwork+=points;
 if(margin>=0){
  s.player.reputation.guild+=2;
  const qualification=event.name+' — '+result;
  if(!s.player.qualifications.includes(qualification))
   s.player.qualifications.push(qualification);
 }
 s.player.competitionRecord.push({event:ID,day:eventDay,eventDay,
  result,points,score:report.r.total,sourceCheckId:p.checkId,
  origin:'judged-witnessed-habitat-report',
  sourceJudgementHash:sourceHash});
 n.used=true;n.enteredAtMinute=s.world.minutes;n.submittedCheckId=p.checkId;
 s.table.competitionReceipts||={};s.table.competitionReportsUsed||={};
 s.table.competitionReceipts[key]={eventDay,checkId:p.checkId,
  result,points,fee:event.fee,reward,official:official.name,
  source,sourceHash};
 s.table.competitionReportsUsed[p.checkId]=eventDay;
 verifyJudgedHistory(s);
 const old=s.world.minutes;
 E.advance(s,DURATION);
 W.finalizeTime(s,old);
 Health.sync(s,{source:'legacy'});
 C.event(s,'progress',official.name+' judges a real Copperwood habitat report: '+result+
  ', '+points+' fieldwork points'+(reward?' and '+reward+' Talons prize.':'; no prize.') ,
  {eventId:ID,eventDay,sourceCheckId:p.checkId,points,reward,result});
 return {assessed:true,eventId:ID,eventDay,official:official.name,
  sourceCheckId:p.checkId,result,points,entryFee:event.fee,
  reward,originalFieldRoll:report.r.roll,noSecondRoll:true,
  elapsedMinutes:DURATION};
}
module.exports={notice,status,fieldAssessment};
