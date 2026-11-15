'use strict';
// Independent daily lives for source-established people, not a quest follower
// scheduler or generic magical XP ladder. All activities are individually
// chosen by a persistent per-person RNG. The original Career and discipline
// owners retain exclusive jurisdiction over real jobs, wages, cultivation,
// breakthroughs, qualifications, materials, wounds and consent.
const Crypto=require('node:crypto'),People=require('./emergent-people'),
 Realm=require('./simulation');
const ORIGIN='independent-person-daily-life-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const positive=x=>Number.isInteger(x)&&x>=0;
const token=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{3,69}$/.test(x);
const subject=x=>typeof x==='string'&&x.trim().length>=15&&x.length<=500;
const trackKinds=new Set(['martial','meridian','arcane','soul','body','rift','beast-care','craft','academic','community','livelihood','exploration']);
const ordinaryActions=new Set(['practice','study','local-chores','seek-work','job-preparation','friends','rest','explore','change-focus']);
function ensure(w){
 if(!w.independentPersonLives)w.independentPersonLives={version:1,origin:ORIGIN,people:{}};
 const t=w.independentPersonLives;
 if(t.version!==1||t.origin!==ORIGIN||!t.people||Array.isArray(t.people)||
   typeof t.people!=='object')throw Error('Invalid independent person life registry');
 return t;
}
function rngNext(n){let x=n>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 return (x>>>0)||0x91e10da5;}
function draw(p){p.rngState=rngNext(p.rngState);return p.rngState/4294967296;}
function initialRng(actor,profile){return Crypto.createHash('sha256').update(
 actor.originHash+'|'+hash(profile)+'|daily-independent-life').digest().readUInt32BE(0)||0x91e10da5;}
function verifyEntry(w,q){
 if(!q||q.origin!==ORIGIN||!token(q.id)||q.actorId!=='emergent:'+q.id||
   q.identityHash!==q.foundationHash||!Array.isArray(q.interests)||!q.interests.length||
   q.interests.length>6||!q.interests.every(x=>trackKinds.has(x))||
   !q.interests.includes(q.focus)||!positive(q.introducedDay)||
   !positive(q.lastDay)||q.lastDay<q.introducedDay||
   !positive(q.rngState)||!q.rngState||!positive(q.fatigue)||q.fatigue>100||
   !q.source||q.sourceHash!==hash(q.source)||q.source.origin!==ORIGIN||
   q.source.actorId!==q.actorId||q.source.identityHash!==q.identityHash||
   q.source.interests.join('|')!==q.interestsAtIntroduction?.join('|')||
   q.source.startedDay!==q.introducedDay||!subject(q.source.witness)||
   !subject(q.source.motivation)||!Array.isArray(q.history)||q.history.length>80||
   !q.metrics||typeof q.metrics!=='object'||Array.isArray(q.metrics)||
   Object.keys(q.metrics).some(k=>!trackKinds.has(k)||!positive(q.metrics[k]))||
   q.history.some(e=>!e||e.seal!==hash(e.source)||
    e.source.origin!==ORIGIN||e.source.actorId!==q.actorId||
    !positive(e.source.day)||e.source.day<=q.introducedDay||
    e.source.day>q.lastDay||!ordinaryActions.has(e.source.action)||
    !trackKinds.has(e.source.focus)||e.source.identityHash!==q.identityHash||
    !positive(e.source.rngBefore)||!e.source.rngBefore||
    e.source.rngAfter!==rngNext(rngNext(rngNext(e.source.rngBefore)))))
   return false;
 const actor=w.emergentPeople?.people?.[q.id];
 return !!actor&&People.verify(w,actor)&&actor.originHash===q.identityHash;
}
function record(q,body){
 const source={origin:ORIGIN,actorId:q.actorId,identityHash:q.identityHash,...body};
 const e={source,seal:hash(source)};
 q.history.push(e);if(q.history.length>80)q.history.shift();
 return e;
}
function enroll(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).sort().join('|')!=='actorId|interests|motivation|witness')
  throw Error('Personal life needs an existing actor, independent motivations, evidenced interests and original scene witness');
 const w=Realm.ensure(s),t=ensure(w),id=p.actorId?.startsWith('emergent:')?p.actorId.slice(9):'';
 const actor=w.emergentPeople?.people?.[id],now=Math.floor(s.world.minutes/1440);
 if(!actor||!People.verify(w,actor)||t.people[id]||
  !Array.isArray(p.interests)||!p.interests.length||p.interests.length>6||
  p.interests.some(x=>!trackKinds.has(x))||
  new Set(p.interests).size!==p.interests.length||
  !subject(p.motivation)||!subject(p.witness)||
  !(s.chatRuntime?.scene?.includes(p.witness)||
    s.chatRuntime?.summary?.includes(p.witness)||
    s.chatRuntime?.journal?.some(e=>e.text.includes(p.witness))))
  throw Error('A real earlier witnessed person with independently grounded interests is required; do not invent prior practice or skills');
 const source={origin:ORIGIN,actorId:actor.actorId,
  identityHash:actor.originHash,startedDay:now,
  interests:p.interests.slice(),motivation:p.motivation.trim(),witness:p.witness.trim(),
  noPreexistingTrainingAward:true,noAutomaticWorkContract:true};
 const q={origin:ORIGIN,id:actor.id,actorId:actor.actorId,
  identityHash:actor.originHash,foundationHash:actor.originHash,
  interests:p.interests.slice(),interestsAtIntroduction:p.interests.slice(),
  focus:p.interests[0],introducedDay:now,lastDay:now,metrics:{},
  fatigue:0,history:[],source,sourceHash:hash(source),
  rngState:initialRng(actor,source)};
 if(!verifyEntry(w,q))throw Error('Independent character foundation failed source integrity');
 t.people[id]=q;
 return {established:true,actorId:q.actorId,name:actor.name,interests:q.interests,
  focus:q.focus,day:now,noAutomaticRankOrJob:true,noHistoricalProgressInvented:true};
}
function daily(w,q,day){
 if(!verifyEntry(w,q)||day<=q.lastDay)return null;
 // Every interval is evaluated once. No query or GM/player search may reroll.
 const before=q.rngState,a=draw(q),b=draw(q),c=draw(q);
 const actor=w.emergentPeople.people[q.id],candidates=q.interests;
 const work=actor.career?.authoredDuties?.some(d=>d.status==='available')||false;
 const offered=actor.career?.workOffers?.some(o=>o.status==='accepted')||false;
 const needsRest=q.fatigue>=62||actor.status!=='active';
 // People sometimes genuinely redirect their focus rather than always
 // training the first art they ever mentioned. All interests remain options.
 let action,focus=q.focus,improved=0,reason;
 if(needsRest||a<.16){action='rest';q.fatigue=Math.max(0,q.fatigue-16);reason='personal recovery';}
 else if(a<.25){action='friends';q.fatigue=Math.max(0,q.fatigue-5);reason='personal relationships or private interests';}
 else if(a<.34){action='explore';q.fatigue=Math.min(100,q.fatigue+2);reason='curiosity and ordinary errands';}
 else if(a<.43){action='local-chores';q.fatigue=Math.min(100,q.fatigue+3);reason='ordinary household and community responsibilities';}
 else if(a<.53){
  if(b<.38){action='seek-work';focus='livelihood';
   reason='independently seeking ordinary work or an apprenticeship, with no accepted offer or earnings presumed';}
  else {action='change-focus';focus=candidates[Math.floor(b*candidates.length)];
   q.focus=focus;reason='changing personal priorities';}
 }
 else if((work||offered)&&a<.67){action='job-preparation';focus='livelihood';
   reason='preparing for a genuinely recorded work opportunity, not assuming paid employment';}
 else if(a<.62&&b<.42){action='seek-work';focus='livelihood';
   reason='independently considering local chores, apprenticeships or paid work without assuming any offer or wage';}
 else {
  focus=candidates[Math.floor(b*candidates.length)];
  if(c<.38){action='study';reason='private theory and preparation';}
  else {action='practice';reason='ordinary independent physical or intellectual practice';}
  // Technical familiarity is not an original power-system rank, learned
  // technique, arcane Circle, Meridian Gate, licence or earning.
  const effective=actor.status==='active'&&q.fatigue<75;
  improved=effective&&(c>.21)?1:0;
  if(improved)q.metrics[focus]=(q.metrics[focus]||0)+1;
  q.fatigue=Math.min(100,q.fatigue+(action==='practice'?8:3));
 }
 const source={day,action,focus,reason,improved,rngBefore:before,
  rngAfter:q.rngState,fatigueAfter:q.fatigue,
  noMagicProgress:true,noProfessionalCertification:true,
  noUnpaidToPaidConversion:true,noForcedOtherPerson:true};
 const e=record(q,source);q.lastDay=day;
 if(!verifyEntry(w,q))throw Error('Unverified independent day: original character history rejected');
 return {actorId:q.actorId,day,action,focus,improved,eventHash:e.seal};
}
function tick(s,fromDay,toDay){
 const w=Realm.ensure(s),t=ensure(w);
 if(!positive(fromDay)||!positive(toDay)||toDay<fromDay||
  toDay-fromDay>10000)throw Error('Independent person dates require the real completed calendar days');
 let activities=0,people=0;
 for(const q of Object.values(t.people)){
  if(!verifyEntry(w,q))throw Error('Independent person original ledger failed verification');
  if(q.lastDay>=toDay)continue;
  people++;
  for(let day=Math.max(fromDay+1,q.lastDay+1);day<=toDay;day++){
   if(daily(w,q,day))activities++;
  }
 }
 return {individualsAdvanced:people,privateDailyActivities:activities,
  noGuaranteedPowerJobsOrMeetings:true};
}
function status(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
   Object.keys(p).some(k=>k!=='actorId'))throw Error('Only a registered person may be inspected');
 const w=Realm.peek(s),all=Object.values(w?.independentPersonLives?.people||{})
  .filter(q=>p.actorId===undefined||q.actorId===p.actorId);
 return {people:all.map(q=>{
  if(!verifyEntry(w,q))throw Error('Independent actor failed integrity verification');
  const person=w.emergentPeople.people[q.id];
  return {actorId:q.actorId,name:person.name,interests:q.interests,
   focus:q.focus,asOfDay:q.lastDay,ordinaryPracticeIndicators:{...q.metrics},
   recentActivities:q.history.slice(-8).map(r=>({day:r.source.day,
    activity:r.source.action,focus:r.source.focus,technicalFamiliarity:r.source.improved})),
   actualCultivationUnverified:true,noAutomaticEarningsOrContract:true,
   privateUnlessPersonallyLearned:true};
 }),note:'These are independent off-screen private lives. The player character does not automatically know them, and familiarity is never a source-owned cultivation level, skill award, qualification or income.'};
}
module.exports={ORIGIN,ensure,verifyEntry,enroll,daily,tick,status,_debug:{rngNext}};
