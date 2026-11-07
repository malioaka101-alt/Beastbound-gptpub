'use strict';
// Source-backed public opportunities. An actual guild, changing ecological
// conditions and original habitat-survey rolls cause every accepted report.
// Never mint Talons, success rolls, guild rank, or invisible NPC agreement.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),
 Time=require('./world'),Health=require('./unified'),
 Realm=require('../world/simulation'),Atlas=require('../world/atlas'),
 Habitat=require('./habitat-survey'),Field=require('../world/guild-fieldwork');
const DAY=1440,READ=5,FILE=10,PERIOD=6,ORIGIN='naturalists-guild-field-bulletin-v1';
const SITE='crossing',ISSUER='naturalists_guild';
const SITES=Object.freeze([
 Object.freeze({habitat:'forest',region:'copperwood'}),
 Object.freeze({habitat:'fen',region:'whisperfen'})
]);
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function only(p,keys=[]){
 if(!p||typeof p!=='object'||Array.isArray(p)||
   Object.keys(p).some(x=>!keys.includes(x))||
   keys.some(x=>!Object.hasOwn(p,x)))
  throw Error('Public fieldwork requires exactly the real witnessed notice and evidence identifiers; outcomes, rewards and dates cannot be supplied');
}
function safe(s,{office=false}={}){
 if(s.battle||s.encounter)
  throw Error('An unresolved beast encounter or battle prevents a considered guild appointment');
 if(s.table?.combatants?.player?.status&&s.table.combatants.player.status!=='ok')
  throw Error('An incapacitated character cannot independently conduct this appointment');
 if(s.world?.location!==SITE||E.NPCS.elira?.location!==SITE||
   E.NPCS.elira?.profession!=='Guild registrar')
  throw Error('The established Naturalists Guild field bulletin is at Morrowfen Crossing');
 if(office){
  const minute=s.world.minutes%DAY;
  if(minute<8*60||minute+FILE>18*60)
   throw Error('The registrar can accept reports only during her established actual work shift');
 }
}
function conditions(s){
 const w=Realm.peek(s),guild=w.institutions?.[ISSUER];
 if(!guild||guild.status!=='active'||!Atlas.I[ISSUER]||
   Atlas.I[ISSUER].polity!=='reedmarch')
  throw Error('The actual Naturalists Guild must be operating to publish new field notices');
 return {w,guild};
}
function window(s){
 const day=Math.floor(s.world.minutes/DAY),start=day-day%PERIOD;
 return {day,start,through:start+PERIOD-1};
}
function prepared(s){
 const {w}=conditions(s),period=window(s);
 // These notices already exist in the independently simulated guild.
 // Reading copies current public terms into *player-known* memory only.
 return Field.current(w,period.day).map(issued=>{
  const {origin:worldOrigin,ecologicalSnapshot,institutionalStatus,
   worldIssueHash,...published}=issued;
  if(worldOrigin!==Field.ORIGIN)
   throw Error('This public notice does not originate from a real guild publication');
  const terms={origin:ORIGIN,...published,worldIssueHash};
  return {...terms,termsHash:hash(terms)};
 });
}
function board(s,p={}){
 only(p);safe(s);
 const notices=prepared(s),ledger=s.table?.publicFieldNotices;
 if(ledger&&(!ledger.notices||typeof ledger.notices!=='object'||
    Array.isArray(ledger.notices)||!ledger.usedReports||
    typeof ledger.usedReports!=='object'||Array.isArray(ledger.usedReports)))
  throw Error('An invalid existing bulletin record cannot be overwritten');
 const unrecorded=notices.filter(n=>!ledger?.notices?.[n.id]);
 const old=s.world.minutes;
 E.advance(s,READ);Time.finalizeTime(s,old);Health.sync(s,{source:'legacy'});
 s.table||={};s.table.publicFieldNotices||={notices:{},usedReports:{}};
 for(const n of unrecorded){
  C.event(s,'world','A Naturalists Guild notice at Morrowfen Crossing requests '+n.habitat+
   ' field observations for a current public habitat concern.',{
    origin:ORIGIN,noticeId:n.id,issuer:n.issuer,habitat:n.habitat,
    region:n.region,termsHash:n.termsHash,issueDay:n.issueDay,
    deadlineDay:n.deadlineDay,postedAt:SITE,
    observedAtMinute:s.world.minutes});
  s.table.publicFieldNotices.notices[n.id]={
   ...n,sourceEvent:structuredClone(s.log.at(-1)),
   sourceEventHash:hash(s.log.at(-1)),seenAtMinute:s.world.minutes,
   interest:'unmarked',submitted:null};
 }
 return {read:true,minutes:READ,newNotices:unrecorded.length,
  knownNotices:publicStatus(s).knownNotices,
  note:'The public board is an invitation, not a guarantee of an NPC contract, wages, professional rank, outcome or private animal discovery'};
}
function publicStatus(s,p={}){
 only(p);
 const l=s.table?.publicFieldNotices?.notices||{};
 if(!l||typeof l!=='object'||Array.isArray(l))
  throw Error('Invalid personal field bulletin history');
 const day=Math.floor(s.world.minutes/DAY);
 return {knownNotices:Object.values(l).slice(-40).map(n=>({
  noticeId:n.id,issuer:'Naturalists Guild',habitat:n.habitat,
  place:E.LOCATIONS[n.habitat]?.name||n.habitat,
  objective:n.objective,condition:n.condition,risks:[...n.risks],
  issueDay:n.issueDay,deadlineDay:n.deadlineDay,
  state:n.submitted?'filed':day>n.deadlineDay?'expired':n.interest,
  reward:n.compensation
 })),note:'Only personally read public postings appear. Off-screen institutional plans and private decisions remain unknown.'};
}
function recorded(s,id){
 const n=s.table?.publicFieldNotices?.notices?.[id];
 if(!n||n.id!==id||n.origin!==ORIGIN||
    n.issuer!==ISSUER||n.postedAt!==SITE||
    !SITES.some(t=>t.habitat===n.habitat&&t.region===n.region)||
    typeof n.termsHash!=='string'||!Number.isInteger(n.issueDay)||
    n.issueDay<0||n.issueDay%PERIOD!==0||
    n.deadlineDay!==n.issueDay+PERIOD-1||
    !Number.isInteger(n.seenAtMinute)||n.seenAtMinute>s.world.minutes)
  throw Error('An authentic personally witnessed public guild notice is required');
 const {termsHash,sourceEventHash,sourceEvent,seenAtMinute,interest,submitted,...terms}=n;
 if(termsHash!==hash(terms))throw Error('The recorded opportunity terms have been altered');
 // New notices must remain grounded in the private *world* bulletin, not
 // merely in player-visible descriptions or a self-consistent forged record.
 // Historical pre-migration notices keep their original separate witness.
 if(n.worldIssueHash!==undefined){
  const w=Realm.peek(s),issued=Field.verify(w,id);
  if(issued.worldIssueHash!==n.worldIssueHash||
     issued.condition!==n.condition||
     issued.issuer!==n.issuer||issued.issueDay!==n.issueDay||
     issued.deadlineDay!==n.deadlineDay||
     JSON.stringify(issued.risks)!==JSON.stringify(n.risks))
   throw Error('The witnessed fieldwork differs from the independently issued institution request');
 }
 const witnessed=s.log.find(e=>e.details?.origin===ORIGIN&&e.details.noticeId===id)||sourceEvent;
 if(!witnessed||hash(witnessed)!==sourceEventHash||
    (sourceEvent&&hash(sourceEvent)!==sourceEventHash)||
    witnessed.details.termsHash!==termsHash||
    witnessed.details.issuer!==ISSUER||
    witnessed.details.postedAt!==SITE||
    witnessed.details.habitat!==n.habitat||
    witnessed.details.region!==n.region||
    witnessed.details.deadlineDay!==n.deadlineDay||
    witnessed.details.issueDay!==n.issueDay||
    witnessed.details.observedAtMinute!==n.seenAtMinute)
  throw Error('The original actual notice witness cannot be verified');
 return n;
}
function interest(s,p={}){
 only(p,['noticeId','choice']);
 if(!['follow','ignore','release'].includes(p.choice))
  throw Error('A notice can be followed, ignored or released, never forcibly accepted by its issuer');
 const n=recorded(s,p.noticeId),day=Math.floor(s.world.minutes/DAY);
 if(n.submitted)throw Error('A completed field report cannot be retroactively renegotiated');
 if(day>n.deadlineDay)throw Error('This published field request has already reached its deadline');
 const next=p.choice==='follow'?'following':p.choice==='ignore'?'ignored':'unmarked';
 n.interest=next; // Player's own notes, not a message to or promise from the guild.
 C.event(s,'story','You mark your own interest in the known '+n.habitat+
  ' guild fieldwork posting as '+next+'.',{
  origin:'player-fieldwork-intention-v1',noticeId:n.id,interest:next,
  noInstitutionalAcceptanceImplied:true});
 return {noticeId:n.id,interest:next,
  noContract:true,noPenaltyForIgnoring:true};
}
function evidence(s,checkId,n){
 const a=s.table?.sceneChecks?.[checkId],
  f=s.table?.habitatSurveyFindings?.[checkId],
  loc=E.LOCATIONS[n.habitat],cfg=Habitat.SURVEYS[loc?.biome];
 if(!a||!f||!cfg||!a.used||
   a.origin!=='engine-habitat-survey'||a.checkId!==checkId||
   a.location!==n.habitat||a.biome!==loc.biome||
   a.attribute!=='wis'||a.skill!=='survival'||a.dc!==cfg.dc||
   a.extra!==0||a.minutes!==15||a.risky!==true||
   a.label!=='Interpret '+cfg.subject||a.subject!==cfg.subject||
   a.source!=='Engine-observed '+cfg.sign.toLowerCase()+' at known '+loc.name||
   !Number.isInteger(a.worldMinute)||a.worldMinute<n.issueDay*DAY||
   !Number.isInteger(a.checkedAtMinute)||a.checkedAtMinute<a.worldMinute||
   a.checkedAtMinute>s.world.minutes||
   !Number.isInteger(a.eventIndex)||a.eventIndex<0||
   f.checkId!==checkId||f.location!==n.habitat||
   f.biome!==loc.biome||f.observedSceneHash!==a.eventHash||
   f.interpretedAtMinute!==a.checkedAtMinute||
   // Narrative log positions are not absolute time. They can recycle when
   // the 90-line history rotates; the independently sealed event hashes,
   // original check timing and one-use identity establish causality.
   !Number.isInteger(f.rollEventIndex)||f.rollEventIndex<0||
   typeof f.success!=='boolean'||s.table?.sceneCheckEventsUsed?.[a.eventHash]!==checkId)
  throw Error('A real previously resolved relevant habitat survey, not a fabricated finding, is required');
 // Read the originally sealed observation and casting die even after
 // the game's short narrative log rotates. Archived mismatches fail closed.
 if((a.observationEvent&&hash(a.observationEvent)!==a.eventHash)||
    (f.rollEvent&&hash(f.rollEvent)!==f.rollEventHash))
  throw Error('The archived field evidence has been altered');
 const liveObservation=s.log[a.eventIndex],liveRoll=s.log[f.rollEventIndex],
  observation=liveObservation&&hash(liveObservation)===a.eventHash?
    liveObservation:a.observationEvent,
  roll=liveRoll&&hash(liveRoll)===f.rollEventHash?
    liveRoll:f.rollEvent,
  r=roll?.details;
 if(!observation||hash(observation)!==a.eventHash||
   observation.type!=='world'||
   observation.text!==cfg.sign+' are visible at '+loc.name+'.'||
   observation.details?.checkId!==checkId||
   observation.details?.location!==n.habitat||
   observation.details?.observation!=='terrain-traces'||
   !r||roll?.type!=='roll'||hash(roll)!==f.rollEventHash||
   !Number.isInteger(r.roll)||r.roll<1||r.roll>20||
   r.dc!==cfg.dc||!Number.isInteger(r.total)||
   r.margin!==r.total-r.dc||r.success!==(r.margin>=0)||
   r.success!==f.success||r.degree!==f.degree||
   !roll.text.includes(a.label))
  throw Error('The original terrain witness and genuine skill dice do not support this field report');
 return {sceneHash:a.eventHash,rollHash:f.rollEventHash,
  result:r.success?'interpreted':'inconclusive',degree:r.degree,
  originalRoll:r.roll};
}
function file(s,p={}){
 only(p,['noticeId','checkId']);safe(s,{office:true});
 const n=recorded(s,p.noticeId),day=Math.floor(s.world.minutes/DAY);
 if(n.submitted||s.table?.publicFieldNotices?.usedReports?.[p.checkId])
  throw Error('This field report or witness has already been filed');
 if(day>n.deadlineDay)
  throw Error('The public report deadline passed; old findings cannot invent an active offer');
 if(typeof p.checkId!=='string')
  throw Error('A real resolved habitat check ID is required');
 const source=evidence(s,p.checkId,n);
 const receiptParams={noticeId:n.id,checkId:p.checkId,
  rollHash:source.rollHash,result:source.result,
  receivedDay:Math.floor(s.world.minutes/DAY)};
 if(n.worldIssueHash)Field.verifyReceipt(Realm.peek(s),receiptParams);
 const old=s.world.minutes;
 E.advance(s,FILE);Time.finalizeTime(s,old);Health.sync(s,{source:'legacy'});
 C.event(s,'story','The Morrowfen guild registrar files the actual '+n.habitat+
  ' habitat observation, noting its '+source.result+' finding.',{
  origin:'witnessed-guild-fieldwork-filing-v1',noticeId:n.id,
  checkId:p.checkId,issuer:ISSUER,registrar:E.NPCS.elira.name,
  terrainHash:source.sceneHash,rollHash:source.rollHash,
  observedResult:source.result,degree:source.degree,
  originalRoll:source.originalRoll,minutes:FILE,
  noCashOrGuildRankGranted:true});
 // The person physically presents the original report to the actual
 // institution. Source-backed new notices enter its PRIVATE inbox; legacy
 // notices retain their honest personal filing without retroactive claims.
 const guildReceipt=n.worldIssueHash?
  Field.receive(Realm.ensure(s),receiptParams):null;
 const filed={checkId:p.checkId,source,
  minute:s.world.minutes,receiptHash:hash(s.log.at(-1)),
  guildInboxReceived:!!guildReceipt};
 n.submitted=filed;s.table.publicFieldNotices.usedReports[p.checkId]=n.id;
 return {filed:true,noticeId:n.id,checkId:p.checkId,
  registrar:E.NPCS.elira.name,result:source.result,
  originalRoll:source.originalRoll,elapsedMinutes:FILE,
  reward:'Documented authentic fieldwork only; no unverified currency or promotion',
  guildInboxReceived:!!guildReceipt,
  noSecondRoll:true,noAutoRank:true};
}
module.exports={ORIGIN,board,publicStatus,interest,file};
