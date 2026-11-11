'use strict';
// Actual individuals can decide whether to affiliate with a player-founded
// association. This initial physically grounded witness provider uses the
// five existing local NPCs, but the group ledger and consent adapter are NOT
// tied to those five people or to fixed kinds of family/clan/sect/guild.
const E=require('../engine.js'),A=require('./atlas'),G=require('./emergent-groups'),People=require('./person-presence');
const SOURCE='Independent in-person NPC choice on a player-founded voluntary association';
const ORIGIN='npc_local_group_assent';
const DEPART='npc_independent_group_departure';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
G.registerMemberConsentAdapter(ORIGIN,(e,m,ev)=>{
 const d=ev?.details,npc=E.NPCS[d?.npcId];
 const scheduled=typeof d?.npcId==='string'&&
  (d.npcId.startsWith('notable:')||d.npcId.startsWith('emergent:'));
 const checkScheduled=()=>{
  const shift=d?.presence;
  const emergent=shift?.source===People.EMERGENT_SOURCE;
  if(!shift||![People.SOURCE,People.EMERGENT_SOURCE].includes(shift.source)||
   shift.npcId!==d.npcId||shift.actorId!==d.actorId||
   shift.name!==m.name||shift.location!==d.location||
   shift.fromDay>d.day||shift.throughDay<d.day||
   (emergent?(shift.fromDay!==shift.scheduledAtDay||
     shift.throughDay-shift.fromDay!==5||
     shift.personId!==d.npcId.slice('emergent:'.length)||
     typeof shift.originHash!=='string'||shift.originHash.length!==64):
    (shift.fromDay<=shift.scheduledAtDay||
     shift.throughDay-shift.fromDay>6))||
   A.R[A.LOCATION_REGION[d.location]]?.polity!==shift.polity)return false;
  const {hash:originalHash,...body}=shift;
  return originalHash===People.hash(body);
 };
 return ev?.type==='story'&&
  d?.origin==='witnessed-independent-group-membership'&&
  d?.decision==='accepted'&&d?.personallyConsenting===true&&
  d?.groupId===e.id&&d?.groupOriginHash===e.originHash&&
  d?.founder===e.founder.name&&d?.npcName===m.name&&
  d?.actorId===m.actorId&&m.actorId===(scheduled?d?.npcId:'npc:'+d?.npcId)&&
  (scheduled?checkScheduled():d?.location===npc?.location)&&
  d?.npcName===m.name&&(!npc||d?.npcName===npc.name)&&
  d?.minutes===18&&d?.membershipScope==='nonexclusive voluntary membership'&&
  Number.isInteger(d?.day)&&d.day>=e.foundedDay&&
  typeof d?.proposal==='string'&&d.proposal.trim().length>=10&&
  d?.inheritedPowerGranted===false&&d?.formalOfficeGranted===false;
});

/*
 * #18: Members form their own opinions on existing freely authored
 * issues. Sustained independently recorded dissent MAY become a reason
 * to decide whether to leave. This neither invents factions nor lets
 * founders declare a dissenting NPC expelled. Two actual distinct open
 * priorities and their last SOURCE-SEALED personal opinions are required.
 */
const DISSENT_PRESSURE='sustained independently documented disagreement with group priorities';
function independentDissentEvidence(e,actorId,day){
 if(!e||e.origin!=='player-declaration'||!Number.isInteger(day)||day<0)
  return [];
 return (e.internalPriorities||[]).flatMap(priority=>{
  const positions=(e.internalPositions||[]).filter(x=>
   x.priorityId===priority.id&&x.memberActorId===actorId&&
   Number.isInteger(x.day)&&x.day<=day);
  const last=positions.at(-1);
  if(!last||last.stance!=='dissented'||
   day-last.day<6||day-last.day>180||
   priority.sourceHash!==G.hash(priority.source)||
   last.sourceHash!==G.hash(last.source)||
   last.source?.prioritySourceHash!==priority.sourceHash||
   last.source?.memberActorId!==actorId||
   last.source?.memberConsentHash!==
    e.additionalMembers.find(m=>m.actorId===actorId)?.hash)
   return [];
  return [{priorityId:priority.id,
   prioritySourceHash:priority.sourceHash,
   personalPositionId:last.id,
   personalPositionHash:last.sourceHash,
   independentlyDissentedOnDay:last.day}];
 }).sort((a,b)=>a.priorityId.localeCompare(b.priorityId));
}
function verifyIndependentDissentWithdrawal(e,m,d){
 if(d?.actualPressure!==DISSENT_PRESSURE)return true;
 const evidence=independentDissentEvidence(e,m.actorId,d.day);
 if(evidence.length<2||
  !Array.isArray(d.disagreementEvidence)||
  JSON.stringify(d.disagreementEvidence)!==JSON.stringify(evidence)||
  !Number.isInteger(d.unfundedMonthsAtDecision)||
  d.unfundedMonthsAtDecision<0||
  !Number.isFinite(d.localStabilityAtDecision)||
  d.localStabilityAtDecision<0||d.localStabilityAtDecision>100||
  !Number.isInteger(d.agencyBefore)||d.agencyBefore<1||
  !Number.isInteger(d.agencyAfter)||d.agencyAfter<1||
  d.optionalPersonalDecision!==true||
  d.notEnforcedFactionExpulsion!==true||
  d.noAutomaticOfficeOrFundingTransfer!==true)
  return false;
 const chance=clamp(.18+
  (d.unfundedMonthsAtDecision>=6?.16:0)+
  (d.localStabilityAtDecision<25?.14:0)+.07,.12,.55),
  rng={rngState:d.agencyBefore},actual=draw(rng);
 return d.withdrawalChance===chance&&
  d.choiceDraw===actual&&actual<chance&&
  d.agencyAfter===rng.rngState;
}

G.registerMemberDepartureAdapter(DEPART,(e,m,ev)=>{
 const d=ev?.details,npc=E.NPCS[d?.npcId];
 return ev?.type==='world-member-decision'&&
  d?.origin===DEPART&&d?.groupId===e.id&&
  d?.actorId===m.actorId&&d?.npcName===m.name&&
  d?.priorAcceptanceHash===m.hash&&
  d?.voluntaryWithdrawal===true&&
  d?.founderCannotCompelStay===true&&
  d?.legalKinshipChanged===false&&
  d?.npcId===m.witness?.details?.npcId&&
  d?.npcName===m.name&&m.actorId===m.witness?.details?.actorId&&
  Number.isInteger(d?.day)&&d.day>=m.witness?.details?.day&&
  typeof d?.actualPressure==='string'&&d.actualPressure.length>8&&
  typeof d?.choiceDraw==='number'&&d.choiceDraw>=0&&d.choiceDraw<1&&
  verifyIndependentDissentWithdrawal(e,m,d);
});
function ensure(w){
 if(w.groupMemberAgency===undefined)w.groupMemberAgency={
  version:1,rngState:((w.worldSeed^0x17bc49ea)>>>0)||0x913dab27,
  events:[],counter:0
 };
 const t=w.groupMemberAgency;
 if(t.version!==1||!Array.isArray(t.events)||!Number.isInteger(t.counter))
  throw Error('Private individual affiliation decisions need real persisted agency');
 return t;
}
function draw(t){
 let x=t.rngState>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 t.rngState=(x>>>0)||0x913dab27;
 return t.rngState/4294967296;
}
function vocabulary(s){
 return new Set(String(s).toLowerCase().replace(/[^a-z0-9 ]/g,' ')
  .split(/\s+/).filter(w=>w.length>=5));
}
function common(a,b){
 const aa=vocabulary(a),bb=vocabulary(b);
 return [...aa].filter(x=>bb.has(x)).length;
}
function evaluate(w,t,e,npc,proposal,meetings=0){
 const host=w.countries[e.polity];
 const alignment=Math.min(3,common(e.charter.duty+' '+proposal,
  npc.goal+' '+npc.topic+' '+npc.profession));
 const npcId=npc.id||Object.keys(E.NPCS).find(k=>E.NPCS[k]===npc);
 const previous=(e.invitations||[]).filter(x=>x.npcId===npcId);
 const declines=previous.filter(x=>x.decision==='declined').length,
  trust=Math.min(3,Math.max(0,meetings)),
  competence=Math.min(2,e.completedEfforts),
  difficulty=host.stability<30?.10:0;
 // Positive outcomes are possible even without a guild, mentor, fee,
 // profession match, wealth or pre-authorised menu choice. No proposal
 // guarantees membership and repeated pressure can worsen willingness.
 const willingness=clamp(.29+alignment*.075+trust*.045+
  competence*.035-difficulty-Math.min(5,declines)*.035,.12,.69);
 const wait=Math.min(.25,Math.max(.12,.20+(host.stability<38?.05:0)));
 const x=draw(t),decision=x<willingness?'accepted':
  x<willingness+wait?'considering':'declined';
 return {decision,draw:x,willingness,
  alignment,previousDeclines:declines,actualCountryStability:host.stability};
}
function logDecision(w,t,e,day,npcId,decision,details){
 const id='group_people_'+(++t.counter);
 const event={id,day,groupId:e.id,npcId,decision,
  originHash:e.originHash,details};
 t.events.push(event);
 if(t.events.length>180)t.events.splice(0,t.events.length-180);
 return id;
}
function month(w,day,emit){
 const t=ensure(w),r=G.peek(w);
 if(!r)return t;
 for(const e of G.all(w)){
  if(e.origin!=='player-declaration')continue;
  const host=w.countries[e.polity],standing=w.houses?.[e.id];
  if(!host||!standing)continue;
  for(const m of e.additionalMembers){
   if(m.active===false||m.origin!==ORIGIN)continue;
   const npcId=m.witness?.details?.npcId,
    npc=People.identity(w,npcId);
   if(!npc)continue;
   // A real independent member in the same polity may hear a PUBLISHED
   // original success after its normal notice delay. This is a new
   // personal view, not an imagined meeting, vote, contract or project.
   // No notice, no local source or no new actual work means no new draw.
   const localPolity=npc.polity||
    A.R[A.LOCATION_REGION[npc.location]]?.polity;
   if(localPolity===e.polity){
    for(const work of e.priorityWork||[]){
     const review=work.source?.independentReview;
     if(review?.kind!=='verified-limited-community-work'||
      !Number.isInteger(review.releaseDay)||
      review.releaseDay>day||day-review.releaseDay>40)continue;
     const considered=G.reassessPublishedWork(w,{
      groupId:e.id,memberActorId:m.actorId,
      workActionHash:work.originalActionHash,day});
     if(considered.reassessed)
      logDecision(w,t,e,day,npcId,'reconsidered-published-work',{
       priorityId:considered.priorityId,
       previousStance:considered.previousStance,
       stance:considered.stance,
       actualReviewHash:considered.groundedInPublishedOriginalReview,
       noCompulsoryPoliticalAffiliation:true});
    }
   }
   // Independently accepted, still-serving group coordinators may
   // privately reconsider ONLY after an ORIGINAL failed group work review
   // recorded on THIS actual month tick. This is their own choice, not
   // the founder's command, a forced election or a repeat of the work roll.
   if(localPolity===e.polity){
    const coordinator=G.coordinatorStatus(w,e.id,{day});
    if(coordinator.mandateId&&coordinator.actorId===m.actorId){
     const failed=r.history.find(x=>x.groupId===e.id&&x.day===day&&
      x.kind==='unverified-community-effort');
     if(failed){
      const decision=G.reconsiderCoordinatorOnOriginalFailure(w,{
       groupId:e.id,mandateId:coordinator.mandateId,
       originalReviewId:failed.id,day});
      if(decision.reconsidered)
       logDecision(w,t,e,day,npcId,
        decision.independentlyResigned?
         'independent-coordinator-stepped-down':
         'independent-coordinator-continued',{
         mandateId:coordinator.mandateId,
         originalFailedWorkHash:decision.originalFailedWorkHash,
         noNewProjectOrMoney:true,
         noOtherMemberCompelled:true});
     }
    }
   }
   // A review is prompted by genuinely adverse, continuing circumstances.
   // Successful groups do not lose members merely because time passes.
   const politicalEvidence=localPolity===e.polity?
    independentDissentEvidence(e,m.actorId,day):[];
   const isPoliticalDissent=politicalEvidence.length>=2;
   const hardship=e.status==='inactive'&&e.unfundedMonths>=3?
    'sustained inactivity with little practical support':
    e.failedEfforts>=e.completedEfforts+3?
     'repeated genuinely failed group efforts':
    host.stability<25?'severe observed regional instability':
    isPoliticalDissent?DISSENT_PRESSURE:null;
   if(hardship&&day-m.witness.details.day>=30&&
      (!m.lastReviewDay||day-m.lastReviewDay>=60)){
    const dissentReason=hardship===DISSENT_PRESSURE;
    const chance=clamp(.18+(e.unfundedMonths>=6?.16:0)+
      (host.stability<25?.14:0)+(dissentReason?.07:0),.12,.55);
    const agencyBefore=t.rngState,pick=draw(t);
    m.lastReviewDay=day;
    if(pick<chance){
     const witness={type:'world-member-decision',details:{
      origin:DEPART,groupId:e.id,npcId,actorId:m.actorId,
      npcName:npc.name,priorAcceptanceHash:m.hash,day,
      actualPressure:hardship,choiceDraw:pick,voluntaryWithdrawal:true,
      founderCannotCompelStay:true,legalKinshipChanged:false,
      ...(dissentReason?{
       disagreementEvidence:structuredClone(politicalEvidence),
       unfundedMonthsAtDecision:e.unfundedMonths,
       localStabilityAtDecision:host.stability,
       agencyBefore,agencyAfter:t.rngState,
       withdrawalChance:chance,optionalPersonalDecision:true,
       notEnforcedFactionExpulsion:true,
       noAutomaticOfficeOrFundingTransfer:true
      }:{})
     }};
     const result=G.departMemberFromEvidence(w,e.id,{
      actorId:m.actorId,origin:DEPART,witness,day,emit});
     logDecision(w,t,e,day,npcId,'departed',{
      reason:hardship,voluntary:true,witnessHash:G.hash(witness)});
     if(!result.left)throw Error('Unrecorded member departure must not change membership');
     continue;
    }
   }
   // Independent individuals sometimes volunteer actual time in the
   // same area. No imaginary transfer of salaries, magical techniques,
   // employment contracts or ancestry occurs.
   const local=npc.polity||A.R[A.LOCATION_REGION[npc.location]]?.polity;
   if(local!==e.polity||
      (npc.institution&&w.institutions?.[npc.institution]?.status!=='active')||
      m.lastServiceMonth===w.ticks.months)continue;
   m.lastServiceMonth=w.ticks.months;
   const chance=e.status==='inactive'?.17:.38;
   if(draw(t)>=chance)continue;
   const roll=1+Math.floor(draw(t)*20),
    alignment=Math.min(2,common(e.charter.duty,npc.goal+' '+npc.topic)),
    modifier=2+alignment+(host.stability>=55?1:0),
    dc=14,success=roll===20||(roll!==1&&roll+modifier>=dc);
   e.memberServiceMinutes=(e.memberServiceMinutes||0)+90;
   if(success){
    e.memberServiceSuccesses=(e.memberServiceSuccesses||0)+1;
    standing.influence=clamp(standing.influence+1,0,100);
    standing.publicPressure=clamp(standing.publicPressure-1,0,100);
   }else e.memberServiceFailures=(e.memberServiceFailures||0)+1;
   // A previous independently accepted optional task only ATTRIBUTES
   // this ORIGINAL volunteer result. No extra roll, wages, time,
   // financial expense, command authority or service obligation.
   const task=G.eligibleVoluntaryTask(e,m.actorId,day);
   const actual=G.record(r,e,day,success?'verified-volunteer-work':'unsuccessful-volunteer-work',{
    npcId,memberId:m.actorId,priorAcceptanceHash:m.hash,
    actualWorkMinutes:90,roll,modifier,dc,success,
    localInstitutionalPermissionNotImplied:true,
    changedInfluence:success?1:0,
    ...(task?{voluntaryTaskId:task.id,
     voluntaryTaskWitnessHash:task.witnessHash}:{})
   },emit,success?
    npc.name+' independently contributes documented practical voluntary work to '+
     e.charter.name+'. This does not establish any familial inheritance or grant a special technique.':null);
   if(task)G.retainOriginalTaskService(e,task.id,actual);
  }
 }
 return t;
}
function privateStatus(s,w,groupId){
 const e=G.lookup(w,groupId),day=Math.floor(s.world.minutes/1440);
 if(!e||e.origin!=='player-declaration'||e.founder.name!==s.player.name)
  throw Error('Personal membership records belong to an actually founded group, not an unrelated society');
 const local=A.R[A.LOCATION_REGION[s.world.location]]?.polity,
  canHear=local===e.polity;
 return {groupId:e.id,groupName:e.charter.name,
  reportedMembers:1+e.additionalMembers.filter(m=>
   m.active!==false||!canHear||m.departure.releaseDay>day).length,
  knownPeople:[{actorId:'player',name:e.founder.name,
   role:'founder, not hereditary ruler'}].concat(e.additionalMembers.filter(m=>
    m.active!==false||!canHear||m.departure.releaseDay>day)
   .map(m=>({actorId:m.actorId,name:m.name,
    role:'voluntary participant, not assumed relative'}))),
  witnessedInvitations:(e.invitations||[]).slice(-20).map(x=>({
   day:x.day,npcName:x.npcName,proposal:x.proposal,
   independentAnswer:x.decision})),
  note:'Invitations are personally witnessed. Independent later departure can become known after a local notice; distant events are not instantly shared. Membership is not marriage, lineage, employment or automatic power.'};
}
module.exports={ORIGIN,DEPART,SOURCE,ensure,draw,evaluate,month,privateStatus,
 DISSENT_PRESSURE,independentDissentEvidence,
 _debug:{common,logDecision}};
