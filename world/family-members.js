'use strict';
// Living households: 28 existing elders and their *named* relatives or chosen
// kin have distinct choices, budgets and earned public-service standing.
// A relative is not an automatic heir, blood relation where not established,
// magical bloodline recipient, or loyal subordinate.
const Crypto=require('node:crypto'),A=require('./atlas'),H=require('./social-houses');
const SOURCE='Two distinct previously chartered household people independently address their real public obligations';
const sha=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
function seed(w){
 const houses={};
 for(const h of H.houses){
  if(!w.houses?.[h.id]||!w.countries?.[h.polity])
   throw Error('Household relations require an actually chartered established household and country');
  houses[h.id]={
   houseId:h.id,polity:h.polity,elderName:h.elder,relativeName:h.relative,
   acknowledgedRelationship:h.relation,publicDuty:h.duty,publicDispute:h.dispute,
   // These are NEW limited public-work funds/wage allowances, not title,
   // personal bank assets, inheritance or state treasury ownership.
   dutyFund:10+Math.floor(w.houses[h.id].influence/6),
   people:{
    elder:{name:h.elder,role:'elder',merit:0,successes:0,failures:0,personalFund:0},
    relative:{name:h.relative,role:'relative',merit:0,successes:0,failures:0,personalFund:6}
   },
   dutyCoordinator:'elder',jointWork:0,disagreements:0,
   trustFromWork:0,tensionFromChoices:0,projects:[],
   // Different households do not all convene a scripted global meeting.
   lastCouncilMonth:w.ticks.months-(parseInt(sha(h.id).slice(0,2),16)%3),
   lastLeadershipReviewMonth:null,lastRecordedEvent:null,history:[],
   mandates:[],activeMandate:null,lastMandateEndSuccesses:null
  };
 }
 return {version:1,seededAtMonth:w.ticks.months,
  rngState:((w.worldSeed^0x54a1cbb7)>>>0)||0x251b789e,
  houses,records:[],counter:0};
}
function ensure(w){
 if(w.familyMembers===undefined)w.familyMembers=seed(w);
 const t=w.familyMembers;
 if(!t||t.version!==1||!t.houses||!Array.isArray(t.records)||
  !Number.isInteger(t.counter))
  throw Error('Individual household history needs an actual persistent ledger');
 return t;
}
function random(t){
 let x=t.rngState>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 t.rngState=(x>>>0)||0x251b789e;
 return t.rngState/4294967296;
}
function receipt(w,t,f,day,kind,details,notice,emit){
 const id='family_people_'+(++t.counter),h=H.byId[f.houseId];
 if(!h)throw Error('A household event requires a known charter');
 const body={id,day,month:w.ticks.months,houseId:h.id,
  houseName:h.name,polity:h.polity,elder:h.elder,relative:h.relative,
  relationship:h.relation,kind,source:SOURCE,details};
 const row={...body,hash:sha(body),notice:notice||null,
  releaseDay:notice?day+8:null};
 t.records.push(row);if(t.records.length>260)t.records.splice(0,t.records.length-260);
 f.history.push({id,day,kind,hash:row.hash});
 if(f.history.length>20)f.history.splice(0,f.history.length-20);
 if(notice&&typeof emit==='function')
  emit({day,region:h.polity,subject:'family-people:'+id,
   text:notice,channel:'public notice',releaseDay:row.releaseDay,severity:'routine'});
 f.lastRecordedEvent=id;
 return row;
}
function fund(f,host){
 // A *small household public-duty contribution*, derived from the local
 // livelihood climate. It does NOT remove coins from state or the player.
 const income=host.prosperity>=65?4:host.prosperity>=40?2:1,
  upkeep=2+(host.stability<30?1:0);
 f.dutyFund=clamp(f.dutyFund+income-upkeep,0,80);
 f.people.relative.personalFund=clamp(
  f.people.relative.personalFund+(host.prosperity>=48?1:0),0,18);
 return {income,upkeep};
}
function choice(t,f,h,standing,host){
 const pressure=standing.publicPressure,condition=host.stability,
  personal=f.people.relative.personalFund;
 const x=random(t),y=random(t);
 const elder=pressure>=65?
   (x<.76?'duty_service':'guard_reserves'):
   pressure>=40?(x<.56?'duty_service':'guard_reserves'):
   (x<.35?'duty_service':'guard_reserves');
 // A younger or chosen relative can dissent. There is no compulsory
 // family obedience, automatic inner affection or invented accusation.
 const relative=pressure>=55?
   (y<.54?'independent_review':y<.82?'duty_service':'other_priorities'):
   condition<38?
    (y<.58?'independent_review':y<.80?'duty_service':'other_priorities'):
   (y<.35?'independent_review':y<.66?'duty_service':'other_priorities');
 return {elder,relative,publicPressure:pressure,stability:condition,
  relativeOwnFunds:personal,individualDraws:[x,y]};
}
function propose(w,t,f,day,emit){
 const h=H.byId[f.houseId],host=w.countries[h.polity],
  standing=w.houses[h.id];
 if(!h||!host||!standing)throw Error('Independent family choices need real existing civic conditions');
 if(f.projects.length||w.ticks.months-f.lastCouncilMonth<3)return false;
 const decisions=choice(t,f,h,standing,host);
 f.lastCouncilMonth=w.ticks.months;
 const align=decisions.elder==='duty_service'&&
   decisions.relative==='duty_service';
 if(align){
  f.projects.push({kind:'joint_duty',workers:['elder','relative'],
   fund:'dutyFund',startedMonth:w.ticks.months,work:0,
   spent:0,blocked:0,initialPressure:standing.publicPressure});
  f.tensionFromChoices=Math.max(0,f.tensionFromChoices-1);
 }else{
  if(decisions.elder==='duty_service')
   f.projects.push({kind:'elder_duty',workers:['elder'],
    fund:'dutyFund',startedMonth:w.ticks.months,work:0,
    spent:0,blocked:0,initialPressure:standing.publicPressure});
  if(decisions.relative==='independent_review'||
      decisions.relative==='duty_service')
   f.projects.push({kind:decisions.relative==='independent_review'?
     'relative_public_review':'relative_duty',
    workers:['relative'],
    // A verified, consenting public-work coordinator may direct the small
    // designated public-duty reserve; a non-coordinator funds own initiatives.
    fund:decisions.relative==='duty_service'&&
      f.dutyCoordinator==='relative'&&f.activeMandate?.active===true?
      'dutyFund':'personalFund',
    startedMonth:w.ticks.months,work:0,spent:0,blocked:0,
    initialPressure:standing.publicPressure});
  if(decisions.elder!==decisions.relative&&
     decisions.relative!=='other_priorities'){
   f.disagreements++;
   f.tensionFromChoices=clamp(f.tensionFromChoices+1,0,8);
  }
 }
 receipt(w,t,f,day,'distinct-household-choices',{
  choices:decisions,combinedWork:align,projects:f.projects.map(p=>p.kind),
  originalDuty:h.duty,realDispute:h.dispute,
  notAutomaticConsent:true},null,emit);
 return true;
}
function progress(w,t,f,p,day,emit){
 const h=H.byId[f.houseId],standing=w.houses[h.id],
  host=w.countries[h.polity],joint=p.kind==='joint_duty',
  cost=joint?4:p.fund==='dutyFund'?3:2,
  available=p.fund==='dutyFund'?f.dutyFund:f.people.relative.personalFund;
 if(available<cost){
  p.blocked++;
  if(p.blocked>=2&&p.work>0){p.work--;p.blocked=1;}
  if(p.blocked>=4){
   receipt(w,t,f,day,'family-work-abandoned',{
    project:p.kind,actualSpent:p.spent,
    unfinishedSessions:p.work,
    cause:'real shortage in the designated household or individual work allowance',
    people:p.workers.map(k=>f.people[k].name)},null,emit);
   return 'finished';
  }
  return 'blocked';
 }
 p.blocked=0;
 if(p.fund==='dutyFund')f.dutyFund-=cost;
 else f.people.relative.personalFund-=cost;
 p.spent+=cost;p.work++;
 if(p.work<2)return 'working';
 const roll=1+Math.floor(random(t)*20),
  earned=p.workers.reduce((sum,k)=>sum+f.people[k].merit,0),
  mod=2+Math.floor(standing.influence/30)+Math.min(3,earned)+
   (host.stability>=55?1:0),
  dc=p.kind==='relative_public_review'?15:14,
  passed=roll===20||(roll!==1&&roll+mod>=dc),
  before={influence:standing.influence,pressure:standing.publicPressure},
  peopleBefore=p.workers.map(k=>({name:f.people[k].name,merit:f.people[k].merit}));
 if(passed){
  // An actual limited *public duty* contribution, NOT proof of claims,
  // judicial authority, contract fulfilment or changes to family law.
  standing.publicPressure=clamp(standing.publicPressure-
   (p.kind==='relative_public_review'?2:3));
  standing.influence=clamp(standing.influence+1);
  for(const k of p.workers){
   f.people[k].merit+=2;f.people[k].successes++;
  }
  if(joint){f.jointWork++;f.trustFromWork=clamp(f.trustFromWork+1,0,8);}
 }else{
  for(const k of p.workers)f.people[k].failures++;
  // A failed practical project does not create a proven scandal.
 }
 // Actual subsequent service, not elapsed time or a rival's accusation,
 // determines whether a voluntary limited mandate should be reviewed.
 if(f.activeMandate?.active===true&&p.workers.includes('relative')){
  f.activeMandate.completedProjects++;
  if(passed)f.activeMandate.verifiedProjects++;
  else f.activeMandate.failedProjects++;
 }
 const details={kind:p.kind,participants:p.workers.map(k=>f.people[k].name),
  separateFunding:p.fund,originalPublicDuty:h.duty,
  initialPressure:p.initialPressure,
  actualSpent:p.spent,completedSessions:p.work,
  roll,mod,dc,passed,before,
  after:{influence:standing.influence,pressure:standing.publicPressure},
  peopleBefore,peopleAfter:p.workers.map(k=>({
   name:f.people[k].name,merit:f.people[k].merit}))};
 const message=passed?
  h.name+': '+p.workers.map(k=>f.people[k].name).join(' and ')+
  ' completes a limited funded public-duty initiative concerning '+h.duty+
  '. The public work is documented; no inheritance or verdict follows.':
  h.name+': '+p.workers.map(k=>f.people[k].name).join(' and ')+
  ' reports that the funded attempt concerning '+h.duty+
  ' did not pass practical review.';
 const documented=receipt(w,t,f,day,passed?'verified-family-duty':'failed-family-duty',
  details,passed?message:(f.people.relative.failures+f.people.elder.failures)%2===0?message:null,emit);
 if(passed){
  // Rolling event/news arrays eventually trim: genuine family achievements
  // need a durable original witness for later accurate household reports.
  const witness={id:documented.id,day:documented.day,month:documented.month,
   houseId:documented.houseId,houseName:documented.houseName,
   polity:documented.polity,elder:documented.elder,
   relative:documented.relative,relationship:documented.relationship,
   kind:documented.kind,source:documented.source,details:documented.details};
  f.latestVerifiedDuty={day,id:documented.id,hash:documented.hash,witness};
 }
 return 'finished';
}
function coordinator(w,t,f,day,emit){
 const elder=f.people.elder,relative=f.people.relative;
 // This is *only* a voluntary leader of public-duty work. The legal elder,
 // lineage, house property and the existing royal offices NEVER change.
 if(f.dutyCoordinator==='elder'&&relative.successes>=2&&
    relative.merit>=elder.merit+3&&f.projects.length===0&&
    (f.lastMandateEndSuccesses===null||
     relative.successes>f.lastMandateEndSuccesses)&&
    (!Number.isInteger(f.lastLeadershipReviewMonth)||
      w.ticks.months-f.lastLeadershipReviewMonth>=6)){
  f.lastLeadershipReviewMonth=w.ticks.months;
  // A successful relative is an eligible candidate, not an automatic heir.
  const agreeElder=random(t)<.68,agreeRelative=random(t)<.82;
  receipt(w,t,f,day,'working-leadership-review',{
   elderName:elder.name,relativeName:relative.name,
   memberMerit:{elder:elder.merit,relative:relative.merit},
   separateChoices:{elder:agreeElder,relative:agreeRelative},
   noLegalSuccession:true},null,emit);
  if(agreeElder&&agreeRelative){
   f.dutyCoordinator='relative';
   const proof=receipt(w,t,f,day,'working-coordinator-changed',{
    previous:elder.name,current:relative.name,
    post:'voluntary coordinator of public-duty efforts only',
    actualRelativeSuccessfulProjects:relative.successes,
    separatelyConsenting:true},
    H.byId[f.houseId].name+' names '+relative.name+
    ' as voluntary coordinator of its public-duty projects after documented work and separate agreement. '+elder.name+
    ' remains its established elder; no title or inheritance transfers.',emit);
   // Durable evidence survives trimming old public news/rolling event logs.
   // A tenure cannot become baseless decades after an actual verified vote.
   f.coordinatorTransfer={id:proof.id,day:proof.day,
    priorElder:elder.name,coordinator:relative.name,
    source:SOURCE,proofHash:proof.hash,
    witness:{id:proof.id,day:proof.day,month:proof.month,
     houseId:proof.houseId,houseName:proof.houseName,polity:proof.polity,
     elder:proof.elder,relative:proof.relative,
     relationship:proof.relationship,kind:proof.kind,
     source:proof.source,details:proof.details}};
   f.activeMandate={
    initialReceiptId:proof.id,initialReceiptHash:proof.hash,
    beganMonth:w.ticks.months,beganDay:day,active:true,
    completedProjects:0,verifiedProjects:0,failedProjects:0,
    lastReviewMonth:w.ticks.months,reviewedProjects:0,
    reviews:[],conclusion:null
   };
   f.mandates.push(f.activeMandate);
  }
 }
}
function reviewMandate(w,t,f,day,emit){
 const m=f.activeMandate;
 if(f.dutyCoordinator!=='relative'||!m||m.active!==true)return false;
 const standing=w.houses?.[f.houseId],host=w.countries?.[f.polity];
 if(!standing||!host)throw Error('A family public-duty mandate needs real household and polity conditions');
 // Review follows actual work, not arbitrary annual elections; a severe
 // funding/pressure crisis can also legitimately trigger accountability.
 const enoughWork=m.completedProjects-m.reviewedProjects>=2;
 const realCrisis=standing.publicPressure>=75&&f.dutyFund<12;
 if(!enoughWork&&!realCrisis)return false;
 if(w.ticks.months-m.lastReviewMonth<4)return false;
 const elder=f.people.elder,relative=f.people.relative;
 const net=m.verifiedProjects-m.failedProjects;
 const elderChance=clamp(.65+net*.07-
   (realCrisis?.24:0)-f.tensionFromChoices*.025,.12,.93);
 const relativeChance=clamp(.81+net*.04-
   (realCrisis?.18:0)-m.failedProjects*.025,.20,.94);
 const elderDraw=random(t),relativeDraw=random(t);
 const elderContinues=elderDraw<elderChance,
  relativeContinues=relativeDraw<relativeChance,
  renewed=elderContinues&&relativeContinues;
 m.lastReviewMonth=w.ticks.months;
 m.reviewedProjects=m.completedProjects;
 const reason=realCrisis?'documented public-duty pressure and constrained work reserves':
   'subsequent actually attempted public-duty projects';
 const proof=receipt(w,t,f,day,'working-mandate-accountability',{
  sourceCoordinatorHash:m.initialReceiptHash,
  coordinator:relative.name,establishedElder:elder.name,
  originalDuties:H.byId[f.houseId].duty,
  demonstratedWork:{completed:m.completedProjects,
   verified:m.verifiedProjects,failed:m.failedProjects},
  actualConditions:{publicPressure:standing.publicPressure,
   dutyFund:f.dutyFund,localStability:host.stability},
  reviewReason:reason,independentChoices:{
   elderContinues,relativeContinues,elderDraw,relativeDraw},
  renewed,noLegalSuccession:true
 },null,emit);
 m.reviews.push({id:proof.id,day,hash:proof.hash,
  renewed,elderContinues,relativeContinues});
 if(renewed){
  f.tensionFromChoices=Math.max(0,f.tensionFromChoices-1);
  return true;
 }
 // Either party can withdraw an explicitly voluntary, bounded delegation.
 // Neither side may erase the other's earlier individual achievements.
 f.dutyCoordinator='elder';
 m.active=false;
 f.lastMandateEndSuccesses=relative.successes;
 f.lastLeadershipReviewMonth=w.ticks.months;
 const final=receipt(w,t,f,day,'working-mandate-ended',{
  previousCoordinator:relative.name,restoredPublicWorkCoordinator:elder.name,
  sourceCoordinatorHash:m.initialReceiptHash,
  accountabilityReceiptHash:proof.hash,
  elderContinues,relativeContinues,
  demonstratedWork:{completed:m.completedProjects,
   verified:m.verifiedProjects,failed:m.failedProjects},
  noLegalSuccession:true,noLossOfMembership:true,
  allPastMeritRetained:true
 },H.byId[f.houseId].name+' records the conclusion of '+relative.name+
   "'s voluntary public-duty coordination following a review of actual work. "+
   elder.name+' resumes coordination of the limited public projects; the established household head, legal rights and kinship have not changed.',emit);
 m.conclusion={id:final.id,day,hash:final.hash,
  witness:{id:final.id,day:final.day,month:final.month,houseId:final.houseId,
   houseName:final.houseName,polity:final.polity,elder:final.elder,
   relative:final.relative,relationship:final.relationship,
   kind:final.kind,source:final.source,details:final.details}};
 f.activeMandate=null;
 return true;
}
function month(w,day,emit){
 const t=ensure(w);
 for(const f of Object.values(t.houses)){
  const host=w.countries[f.polity];if(!host)continue;
  fund(f,host);
  // Existing commitments progress before new deliberations. Separate people
  // may fund different efforts even if they disagree in the same household.
  const remaining=[];
  for(const p of f.projects){
   const status=progress(w,t,f,p,day,emit);
   if(status!=='finished')remaining.push(p);
  }
  f.projects=remaining;
  if(!f.projects.length)reviewMandate(w,t,f,day,emit);
  if(!f.projects.length)coordinator(w,t,f,day,emit);
  if(!f.projects.length)propose(w,t,f,day,emit);
 }
 return t;
}
function publicStatus(s,w){
 const local=A.R[A.LOCATION_REGION[s.world.location]]?.polity,
  today=Math.floor(s.world.minutes/1440),t=w.familyMembers;
 if(!local||!t)return {polity:A.P[local]?.name||null,knownFamilyEvents:[],
  note:'Private household votes, reserve funds and disputes are not revealed until a real public report.'};
 const found=t.records.filter(r=>r.polity===local&&r.notice&&
  r.releaseDay<=today&&
  r.hash===sha({id:r.id,day:r.day,month:r.month,houseId:r.houseId,
   houseName:r.houseName,polity:r.polity,elder:r.elder,
   relative:r.relative,relationship:r.relationship,
   kind:r.kind,source:r.source,details:r.details})&&
  w.chronicle?.some(e=>e.subject==='family-people:'+r.id&&
   e.day===r.day&&e.region===local&&e.releaseDay===r.releaseDay&&
   e.channel==='public notice'&&e.text===r.notice))
  .slice(-15).map(r=>({day:r.day,house:r.houseName,
   people:r.details?.participants||
    (r.kind==='working-coordinator-changed'?[r.details.current]:[]),
   kind:r.kind,notice:r.notice}));
 return {polity:A.P[local].name,knownFamilyEvents:found,
  note:'Only genuinely published family members’ public work, not private disagreements, salaries, secret heritage or unconsented succession.'};
}
module.exports={SOURCE,seed,ensure,month,publicStatus,
 _debug:{random,choice,propose,progress,coordinator,reviewMandate,receipt,fund}};
