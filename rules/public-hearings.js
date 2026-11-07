'use strict';
// Any resident can testify on scheduled public days. The two known family
// disputes have real published charter positions; unrelated testimony can
// enter general business without pretending a powerful house was involved.
const E=require('../engine.js'),C=require('./core'),W=require('./world'),
 H=require('./unified'),Atlas=require('../world/atlas'),
 Realm=require('../world/simulation'),Gov=require('../world/government-offices'),
 Hearings=require('../world/public-hearings'),SocialService=require('./social-service');
const START=10*60,END=16*60,MINUTES=35;
function workday(s,index){
 const anchor=s.table?.realm?.calendarAnchor;
 if(anchor){
  if(!Number.isInteger(index)||index<anchor.atCompletedDay)
   throw Error('Hearing calendar cannot precede its documented historical anchor');
  const d=W.addDate(anchor.date,index-anchor.atCompletedDay);
  return d.month===13?null:((d.day-1)%6)+1;
 }
 const cycle=(index%365)+1;
 if(cycle>360)return null;
 return ((cycle-1)%30)%6+1;
}
function next(s){
 const now=Math.floor(s.world.minutes/1440),clock=s.world.minutes%1440;
 for(let i=0;i<=13;i++){
  const day=now+i;
  if(workday(s,day)===4&&(i>0||clock<END))
   return {day:day+1,atLocalTime:'10:00–16:00',
    isSittingNow:i===0&&clock>=START&&clock<END};
 }
 throw Error('No documented public sitting appears within the expected council schedule');
}
function civic(s,mins){
 if(s.world?.location!=='crossing'||
   Atlas.LOCATION_REGION.crossing!=='morrowfen_basin'||
   Atlas.I.marsh_council?.type!=='civil council')
  throw Error('The first open civic hearing is held at the actual Morrowfen Crossing March Council');
 if(s.encounter||s.battle)
  throw Error('An unresolved battle or animal encounter cannot be converted into council testimony');
 const state=s.table?.combatants?.player;
 if(state&&state.status!=='ok')
  throw Error('An incapacitated resident cannot give normal unsupervised council testimony');
 const t=s.world.minutes%1440;
 if(workday(s,Math.floor(s.world.minutes/1440))!==4||
    t<START||t+mins>END)
  throw Error('The March Council hears residents on Workday 4 between 10:00 and 16:00; its actual calendar cannot be ignored');
 const w=Realm.peek(s);
 if(w.institutions?.marsh_council?.status!=='active')
  throw Error('The actual council institution is not presently able to hold an ordinary public session');
 return w;
}
function list(s){
 const records=s.table?.publicHearings?.records||[];
 if(!Array.isArray(records))throw Error('A damaged civic hearing record must be reconciled, not silently replaced');
 return records;
}
function status(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Hearing status is read-only and accepts no selected outcome, false attendance or secret proceedings');
 const calendar=next(s),here=s.world?.location==='crossing',
  now=Math.floor(s.world.minutes/1440)+1;
 return {venue:'Morrowfen Crossing March Council public chamber',
  publicSession:calendar,canAttendNow:here&&calendar.isSittingNow,
  publicIssues:Object.keys(Hearings.ISSUES).map(id=>{
   const {label,question,positions}=Hearings.issue(id);
   return {issueId:id,label,publicQuestion:question,
    registeredHouseholds:positions.map(x=>({name:x.name,
     publicDuty:x.publicDuty,declaredDispute:x.declaredDispute}))};
  }),
  priorTestimony:list(s).slice(-25).map(r=>{
   const know=here&&r.state==='reviewed'&&Number.isInteger(r.releaseDay)&&now>=r.releaseDay;
   return {hearingId:r.hearingId,issueId:r.issueId,
    testimony:r.testimony,day:r.day,
    evidenceCheckId:r.evidence?.checkId||null,
    status:know?'public decision posted':r.state==='reviewed'?'awaiting local public notice':'awaiting council review',
    councilDisposition:know?r.disposition:null,
    publicResponse:know?r.publicResponse:null,
    writtenHouseholdReplies:know?r.householdResponses:null};
  }),
  limits:'No high birth, kinship, trade licence, gifted ability, family registration or tuition is required to speak. The council and households remain independent.'};
}
function testify(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).some(k=>!['issueId','testimony','checkId'].includes(k))||
  !Object.hasOwn(p,'issueId')||!Object.hasOwn(p,'testimony'))
  throw Error('Open hearing testimony accepts only an actual issueId, a free citizen statement and an optional witnessed checkId');
 const {issueId,testimony,checkId}=p;
 if(typeof issueId!=='string')throw Error('A real existing public council topic is required');
 const issue=Hearings.issue(issueId);
 if(typeof testimony!=='string'||testimony.trim().length<12||
  testimony.length>1400||/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(testimony))
  throw Error('Real council testimony must be a readable 12–1400 character statement supplied by the resident');
 if(checkId!==undefined&&(typeof checkId!=='string'||
     !/^[a-z0-9][a-z0-9_-]{4,79}$/.test(checkId)))
  throw Error('Only a real earlier witnessed checkId can be presented as council evidence');
 civic(s,MINUTES);
 const start=s.world.minutes,day=E.day(s),already=list(s);
 if(already.some(x=>x.issueId===issueId&&x.day===day))
  throw Error('That issue has already received this resident’s testimony at the same public sitting; a later session remains open');
 let evidence=null;
 if(checkId!==undefined){
  if(!issue.habitats.length)
   throw Error('An unrelated survey cannot be presented as proof of an arbitrary general-business allegation');
  const {a,f,rollHash}=SocialService.proof(s,checkId,'fenwake');
  if(!issue.habitats.includes(a.location))
   throw Error('Only an actually relevant observed habitat is evidence for this published wetland issue');
  evidence={checkId,location:a.location,sceneHash:a.eventHash,
   rollHash,degree:f.degree};
 }
 const chair=Gov.local(s,Realm.peek(s)),statement=testimony.trim();
 E.advance(s,MINUTES);W.finalizeTime(s,start);H.sync(s,{source:'legacy'});
 const hearingId='public_hearing_'+issueId+'_'+start;
 C.event(s,'story','An ordinary resident speaks at the public March Council sitting; the submitted claims have not been verified.',{
  origin:'witnessed-public-civic-hearing',source:Hearings.SOURCE,
  hearingId,issueId,location:'crossing',minutes:MINUTES,
  testimony:statement,publicHouseholds:issue.positions.map(x=>x.houseId),
  originalTerrainHash:evidence?.sceneHash||null,
  originalCheckHash:evidence?.rollHash||null,
  chairOffice:chair.office,governingBody:chair.governingBody
 });
 const eventIndex=s.log.length-1,eventHash=Hearings.issue(issueId)&&
  require('node:crypto').createHash('sha256').update(JSON.stringify(s.log[eventIndex])).digest('hex');
 s.table||={};s.table.publicHearings||={records:[]};
 const entries=s.table.publicHearings.records;
 if(!Array.isArray(entries))throw Error('The existing public hearing ledger is corrupt');
 entries.push({hearingId,issueId,testimony:statement,day,
  worldMinute:start,earliestReviewDay:Math.floor(start/1440)+6,
  evidence,eventIndex,eventHash,state:'submitted',
  source:Hearings.SOURCE,
  writtenPositions:issue.positions.map(x=>({houseId:x.houseId,
   name:x.name,publicDuty:x.publicDuty,declaredDispute:x.declaredDispute}))});
 if(entries.length>80)entries.shift();
 return {heard:true,hearingId,issueId,minutes:MINUTES,
  witnessedEvidence:!!evidence,
  publicPositions:issue.positions.map(x=>({houseId:x.houseId,
   name:x.name,publicDuty:x.publicDuty,declaredDispute:x.declaredDispute})),
  citizenStatement:statement,
  reviewed:false,noGuaranteedFinding:true,noNewLaw:true,
  noFamilyMembership:true,noFee:true,
  note:'Household written positions are registered charters, not proof of relatives appearing in person; council review follows its own calendar.'};
}
module.exports={status,testify,workday,next};
