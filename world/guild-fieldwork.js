'use strict';
// Guild notices originate in the independently evolving world, not in
// the player's act of reading a public board. Abstract funds are not Talons.
const Crypto=require('node:crypto'),A=require('./atlas'),E=require('../engine.js');
const ORIGIN='independent-naturalists-fieldwork-issue-v1';
const PERIOD=6,ISSUER='naturalists_guild',SITE='crossing';
const SITES=Object.freeze([
 Object.freeze({habitat:'forest',region:'copperwood'}),
 Object.freeze({habitat:'fen',region:'whisperfen'})
]);
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function classification(eco){
 if(!eco||![eco.pressure,eco.quality,eco.water,eco.forage].every(Number.isFinite))
  throw Error('Real regional ecology is required for a Naturalists field request');
 return eco.pressure>=55||eco.quality<=55?'elevated habitat pressure':
  eco.water<50||eco.forage<50?'stressed water or forage':
  'routine seasonal habitat monitoring';
}
function seed(w,day){
 if(!Number.isInteger(day)||day<0)throw Error('A genuine world date is required for fieldwork publication');
 if(!w||!w.institutions||!w.ecosystems)throw Error('An actual simulated guild and ecology are required');
 w.fieldworkNotices||={};
 if(!w.fieldworkNotices||typeof w.fieldworkNotices!=='object'||
    Array.isArray(w.fieldworkNotices))
  throw Error('Invalid independent institution fieldwork ledger');
 const start=day-day%PERIOD,guild=w.institutions[ISSUER];
 if(guild?.status!=='active'||!A.I[ISSUER]||
    A.I[ISSUER].polity!=='reedmarch'||E.NPCS.elira?.location!==SITE||
    E.NPCS.elira?.profession!=='Guild registrar')
  return [];
 const newIds=[];
 for(const site of SITES){
  const loc=E.LOCATIONS[site.habitat],region=A.R[site.region];
  if(!loc?.spawns?.length||region?.polity!=='reedmarch'||
     !region.loc?.includes(site.habitat))
   throw Error('A guild cannot issue fieldwork for a missing real regional route');
  const id='field_'+site.habitat+'_'+start;
  if(w.fieldworkNotices[id])continue;
  const eco=w.ecosystems[site.region],snapshot={
   pressure:eco?.pressure,quality:eco?.quality,
   water:eco?.water,forage:eco?.forage};
  const source={origin:ORIGIN,id,issuer:ISSUER,postedAt:SITE,
   registrar:E.NPCS.elira.name,habitat:site.habitat,region:site.region,
   issueDay:start,deadlineDay:start+PERIOD-1,
   objective:'Personally observe and submit an authentic local '+loc.name+' habitat report',
   condition:classification(snapshot),risks:region.dangers.slice(0,3),
   compensation:'No promised currency or qualification; verified field record only',
   ecologicalSnapshot:snapshot,
   institutionalStatus:guild.status};
  w.fieldworkNotices[id]={...source,worldIssueHash:hash(source)};
  newIds.push(id);
 }
 return newIds;
}
function current(w,day){
 if(!Number.isInteger(day)||day<0)throw Error('Actual world date required');
 const start=day-day%PERIOD,stored=w?.fieldworkNotices||{};
 if(typeof stored!=='object'||Array.isArray(stored))
  throw Error('Invalid world-authored fieldwork ledger');
 return Object.values(stored).filter(x=>x.issueDay===start&&
   x.deadlineDay>=day).map(x=>verify(w,x.id));
}
function verify(w,id){
 const a=w?.fieldworkNotices?.[id];
 if(!a||a.id!==id||a.origin!==ORIGIN||a.issuer!==ISSUER||
    a.postedAt!==SITE||a.institutionalStatus!=='active'||
    !Number.isInteger(a.issueDay)||a.issueDay<0||
    a.issueDay%PERIOD!==0||a.deadlineDay!==a.issueDay+PERIOD-1||
    !SITES.some(x=>x.habitat===a.habitat&&x.region===a.region)||
    typeof a.worldIssueHash!=='string')
  throw Error('The guild notice was not independently issued in actual world history');
 const {worldIssueHash,...source}=a;
 if(hash(source)!==worldIssueHash||
    a.condition!==classification(a.ecologicalSnapshot))
  throw Error('The independently issued guild bulletin was altered');
 return a;
}
// An authorised field inspection is an ACTUAL later visit, not merely a
// label in the guild's private report ledger. The work crew's bounded action
// uses its previously allocated resources and the world-owned random stream.
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function authenticReport(w,report){
 if(!report||!Number.isInteger(report.receivedDay)||
    !Number.isInteger(report.reviewedDay)&&report.reviewedDay!==null||
    !['awaiting-independent-review','field-inspection-authorised',
      'reviewed-without-field-inspection'].includes(report.decision))
  throw Error('The guild needs an actual filed and reviewed report');
 const {origin,reportHash,reviewedDay,decision,inspection,...original}=report;
 if(origin!=='actual-guild-field-report-receipt-v1'||
    hash(original)!==reportHash)
  throw Error('Independent guild fieldwork requires unaltered received evidence');
 const notice=verify(w,report.noticeId);
 if(report.receivedDay<notice.issueDay||
    report.receivedDay>notice.deadlineDay||
    !report.checkId.startsWith('habitat_'+notice.habitat+'_'))
  throw Error('Guild field work must match the actual original issued request');
 return notice;
}
function schedule(report,notice,day){
 const original={origin:'authentic-guild-field-inspection-schedule-v1',
  noticeId:report.noticeId,checkId:report.checkId,
  issueHash:notice.worldIssueHash,reportHash:report.reportHash,
  reviewDay:day,region:notice.region,
  reservedFunds:1,reservedCapacity:1};
 return {...original,scheduleHash:hash(original),status:'scheduled',
  result:null,completedDay:null,ecologyBefore:null,ecologyAfter:null,
  resolutionHash:null};
}
function verifyInspection(report,notice){
 const v=report.inspection;
 if(!v||v.origin!=='authentic-guild-field-inspection-schedule-v1'||
    v.noticeId!==report.noticeId||v.checkId!==report.checkId||
    v.issueHash!==notice.worldIssueHash||v.reportHash!==report.reportHash||
    v.reviewDay!==report.reviewedDay||v.region!==notice.region||
    v.reservedFunds!==1||v.reservedCapacity!==1||
    !Number.isInteger(v.reviewDay)||v.reviewDay<report.receivedDay||
    typeof v.scheduleHash!=='string')
  throw Error('This guild inspection lacks its verified original resource authorisation');
 const {scheduleHash,status,result,completedDay,ecologyBefore,ecologyAfter,
   resolutionHash,...original}=v;
 if(hash(original)!==scheduleHash)
  throw Error('The independently scheduled inspection evidence was altered');
 if(status==='scheduled'){
  if(result!==null||completedDay!==null||ecologyBefore!==null||
     ecologyAfter!==null||resolutionHash!==null)
   throw Error('The unperformed guild visit cannot have fabricated field results');
 }else if(status==='completed'){
  const outcomes=['cancelled-no-active-crew','observed-no-current-repair-needed',
   'small-local-habitat-stabilisation','surveyed-no-effective-stabilisation'];
  if(!outcomes.includes(result)||!Number.isInteger(completedDay)||
     completedDay<=v.reviewDay||!ecologyBefore||!ecologyAfter||
     !['pressure','quality','water','forage'].every(k=>
       Number.isInteger(ecologyBefore[k])&&Number.isInteger(ecologyAfter[k])&&
       ecologyBefore[k]>=0&&ecologyBefore[k]<=100&&
       ecologyAfter[k]>=0&&ecologyAfter[k]<=100)||
     hash({scheduleHash,result,day:completedDay,
      before:ecologyBefore,after:ecologyAfter})!==resolutionHash)
   throw Error('The completed independent field inspection lacks genuine outcome evidence');
  for(const k of ['water','forage'])
   if(ecologyBefore[k]!==ecologyAfter[k])
    throw Error('Guild work cannot fabricate unrelated ecological improvements');
  if(result==='small-local-habitat-stabilisation'){
   if(ecologyAfter.pressure!==clamp(ecologyBefore.pressure-1,0,100)||
      ecologyAfter.quality!==clamp(ecologyBefore.quality+1,0,100))
    throw Error('Naturalists work cannot invent larger-than-funded habitat repair');
  }else if(ecologyAfter.pressure!==ecologyBefore.pressure||
      ecologyAfter.quality!==ecologyBefore.quality)
   throw Error('A failed or cancelled inspection cannot alter habitat conditions');
 }else throw Error('An unauthorised inspection state cannot become world history');
 return v;
}
function inspect(w,day,draw,notify=()=>{}){
 if(!Number.isInteger(day)||day<0||typeof draw!=='function'||
    typeof notify!=='function')
  throw Error('Guild site visits require real world time and an independent world RNG');
 const reports=w?.fieldworkInbox?.reports||{};
 if(!reports||typeof reports!=='object'||Array.isArray(reports))
  throw Error('An invalid guild inbox cannot authorise a field visit');
 let attempted=0,improved=0;
 for(const report of Object.values(reports)){
  if(report?.inspection&&report.decision!=='field-inspection-authorised')
   throw Error('A guild crew cannot exist without the original independent authorisation');
  if(report?.decision!=='field-inspection-authorised'||!report.inspection)
   continue; // Historic saves did not yet schedule tangible crews.
  const notice=authenticReport(w,report),
   job=verifyInspection(report,notice);
  if(job.status==='completed')continue;
  // A crew cannot teleport to a field site in the same sixday it was assigned.
  if(day<=job.reviewDay)continue;
  const eco=w.ecosystems?.[notice.region],guild=w.institutions?.[ISSUER];
  if(!eco||![eco.pressure,eco.quality,eco.water,eco.forage].every(Number.isFinite))
   throw Error('The actual scheduled field site has no measurable ecology');
  const before={pressure:eco.pressure,quality:eco.quality,
   water:eco.water,forage:eco.forage};
  let result;
  if(guild?.status!=='active'){
   // Already allocated money is committed, but no unstaffed expedition occurs.
   result='cancelled-no-active-crew';
  }else if(classification(eco)==='routine seasonal habitat monitoring'){
   result='observed-no-current-repair-needed';
  }else{
   const roll=draw(); // WORLD RNG, never a selected player roll.
   if(typeof roll!=='number'||!Number.isFinite(roll)||roll<0||roll>=1)
    throw Error('Only the genuine world random stream may resolve field conditions');
   // A small crew can clear silt or reinforce one margin, not magic a
   // shattered ecosystem back to health. Harsh sites are less tractable.
   const chance=clamp(0.66-Math.max(0,eco.pressure-45)/160-
     Math.max(0,55-eco.quality)/200,0.15,0.66);
   if(roll<chance&&(eco.pressure>0||eco.quality<100)){
    eco.pressure=clamp(eco.pressure-1,0,100);
    eco.quality=clamp(eco.quality+1,0,100);
    result='small-local-habitat-stabilisation';
    improved++;
   }else result='surveyed-no-effective-stabilisation';
  }
  const after={pressure:eco.pressure,quality:eco.quality,
   water:eco.water,forage:eco.forage};
  job.status='completed';job.result=result;job.completedDay=day;
  job.ecologyBefore=before;job.ecologyAfter=after;
  job.resolutionHash=hash({scheduleHash:job.scheduleHash,result,day,before,after});
  attempted++;
  notify({day,region:notice.region,subject:ISSUER,
   text:result==='small-local-habitat-stabilisation'?
    'Naturalists report a limited physical habitat stabilisation in '+A.R[notice.region].name+'.':
    result==='cancelled-no-active-crew'?
    'Naturalists cancel their scheduled field inspection in '+A.R[notice.region].name+' after a loss of operational support.':
    'Naturalists report a field visit in '+A.R[notice.region].name+' with no confirmed ecological improvement.',
   channel:'field notice',releaseDay:day+2,severity:'routine'});
 }
 return {attempted,improved};
}

// A filed observation actually reaches the institution's own private ledger.
// It is an information source, not a cash voucher or guaranteed ecological
// repair. The guild's later autonomous review may allocate real staff/funds.
function verifyReceipt(w,p={}){
 const keys=['noticeId','checkId','rollHash','result','receivedDay'];
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).sort().join('|')!==keys.sort().join('|')||
    typeof p.checkId!=='string'||!/^habitat_(?:forest|fen)_[0-9]+$/.test(p.checkId)||
    typeof p.rollHash!=='string'||!/^[a-f0-9]{64}$/.test(p.rollHash)||
    !['interpreted','inconclusive'].includes(p.result)||
    !Number.isInteger(p.receivedDay)||p.receivedDay<0)
  throw Error('Guild report receipt requires original authentic field evidence');
 const noticed=verify(w,p.noticeId);
 if(p.receivedDay<noticed.issueDay||p.receivedDay>noticed.deadlineDay||
    !p.checkId.startsWith('habitat_'+noticed.habitat+'_'))
  throw Error('The report does not belong to this actually published guild request');
 const reports=w.fieldworkInbox?.reports;
 if(reports!==undefined&&(!reports||typeof reports!=='object'||
    Array.isArray(reports)))
  throw Error('Invalid guild report inbox');
 if(reports?.[p.checkId])
  throw Error('The guild has already received this original survey report');
 return noticed;
}
function receive(w,p={}){
 verifyReceipt(w,p);
 w.fieldworkInbox||={reports:{}};
 const rec={...p,origin:'actual-guild-field-report-receipt-v1',
  reportHash:hash(p),reviewedDay:null,decision:'awaiting-independent-review'};
 w.fieldworkInbox.reports[p.checkId]=rec;
 return rec;
}
function review(w,day,notify=()=>{}){
 if(!Number.isInteger(day)||day<0)throw Error('The guild needs an actual world date');
 const reports=w.fieldworkInbox?.reports||{},guild=w.institutions?.[ISSUER];
 let evaluated=0,inspections=0;
 for(const report of Object.values(reports)){
  if(report.reviewedDay!==null||report.receivedDay>=day)continue;
  const {origin,reportHash,reviewedDay,decision,...original}=report;
  if(origin!=='actual-guild-field-report-receipt-v1'||
     hash(original)!==reportHash)
   throw Error('Independent guild review requires the original authenticated received report');
  // Only the next actual independent sixday can review work already filed.
  const source=verify(w,report.noticeId);
  const stressed=classification(w.ecosystems[source.region])!==
   'routine seasonal habitat monitoring';
  const canInspect=report.result==='interpreted'&&stressed&&
   guild?.status==='active'&&Number.isFinite(guild.funds)&&guild.funds>=10&&
   Number.isFinite(guild.capacity)&&guild.capacity>=10;
  if(canInspect){
   guild.funds--;guild.capacity--;
   report.decision='field-inspection-authorised';
   report.inspection=schedule(report,source,day);
   inspections++;
   notify({day,region:'reedmarch',subject:ISSUER,
    text:'Naturalists Guild staff allocate a limited field inspection in '+
      A.R[source.region].name+' following a received habitat report.',
    channel:'guild report',releaseDay:day+1,severity:'routine'});
  }else report.decision='reviewed-without-field-inspection';
  report.reviewedDay=day;
  evaluated++;
 }
 return {evaluated,inspections};
}
module.exports={PERIOD,ISSUER,SITE,SITES,ORIGIN,seed,current,verify,verifyReceipt,receive,review,inspect};
