'use strict';
// A real player can make a freeform offer to an actually local existing NPC.
// The NPC decides separately, and a refusal or hesitation is an actual
// response, not permission for player-authored assent or automatic rank.
const E=require('../engine.js'),C=require('./core'),W=require('./world'),
 Health=require('./unified'),Realm=require('../world/simulation'),
 G=require('../world/emergent-groups'),Agency=require('../world/group-member-agency'),
 People=require('../world/person-presence'),A=require('../world/atlas');
const MINUTES=18;
function fields(p,allowed,needed=allowed){
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).some(k=>!allowed.includes(k))||
  needed.some(k=>!Object.hasOwn(p,k)))
  throw Error('A personal membership conversation accepts only the actual NPC, group, and player-authored proposal; NPC decisions cannot be supplied');
}
function phrase(s){
 if(typeof s!=='string'||s.trim().length<10||s.length>900||
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(s))
  throw Error('A genuine personal offer needs a readable freeform proposal');
 return s.trim();
}
function invitation(s,p={}){
 fields(p,['groupId','npcId','proposal']);
 const original=Realm.peek(s),day=Math.floor(s.world.minutes/1440),
  npc=People.resolve(original,p.npcId,s.world.location,day),
  proposal=phrase(p.proposal);
 if(!npc||npc.location!==s.world.location)
  throw Error('An actual established individual must be present in the same real scene to hear the proposal');
 if(s.battle||s.encounter)
  throw Error('Resolve the actual urgent encounter before a considered social invitation');
 if(s.table?.combatants?.player?.status&&
  s.table.combatants.player.status!=='ok')
  throw Error('An incapacitated character cannot complete a considered in-person invitation');
 const existing=G.lookup(original,p.groupId);
 if(!existing||existing.origin!=='player-declaration'||
  existing.founder.name!==s.player.name)
  throw Error('Only a genuinely formed player-led group can invite an independent participant through this conversation');
 if(existing.additionalMembers.some(m=>m.actorId===npc.actorId&&m.active!==false))
  throw Error('This person is already independently recorded as a member');
 if((existing.invitations||[]).some(x=>x.npcId===p.npcId&&x.day===day))
  throw Error('This individual has already answered an association invitation today; a different real discussion can continue without rerolling assent');
 const old=s.world.minutes;
 if(!People.resolve(original,p.npcId,s.world.location,
    Math.floor((old+MINUTES)/1440)))
  throw Error('The real person cannot remain physically available for the full proposed conversation');
 E.advance(s,MINUTES);W.finalizeTime(s,old);
 Health.sync(s,{source:'legacy'});
 const w=Realm.ensure(s),e=G.lookup(w,p.groupId),
  agency=Agency.ensure(w);
 if(!e||e.founder.name!==s.player.name)
  throw Error('The invited group must still genuinely exist after elapsed time');
 const decision=Agency.evaluate(w,agency,e,npc,proposal,
  Number(s.npcMemory?.[npc.name]||0));
 const answer=decision.decision==='accepted'?
  'I agree to join as a voluntary participant, while keeping my own professional and personal responsibilities.':
  decision.decision==='considering'?
   'I will consider the idea, but I have not agreed to become a member.':
   'I do not agree to join this organisation at present.';
 const now=Math.floor(s.world.minutes/1440),
  details={origin:'witnessed-independent-group-membership',
   groupId:e.id,groupOriginHash:e.originHash,founder:e.founder.name,
   npcId:p.npcId,npcName:npc.name,actorId:npc.actorId,
   presence:npc.presence,
   location:s.world.location,day:now,minutes:MINUTES,
   proposal,decision:decision.decision,
   personallyConsenting:decision.decision==='accepted',
   membershipScope:'nonexclusive voluntary membership',
   inheritedPowerGranted:false,formalOfficeGranted:false,
   response:answer};
 C.event(s,'story',s.player.name+' offers '+npc.name+
  ' a freely described place in '+e.charter.name+
  '. '+npc.name+' replies: “'+answer+'”',details);
 const witness=structuredClone(s.log[s.log.length-1]),
  witnessHash=G.hash(witness);
 e.invitations||=[];
 e.invitations.push({day:now,npcId:p.npcId,actorId:npc.actorId,npcName:npc.name,
  proposal,decision:decision.decision,response:answer,
  witnessHash,source:'independent in-person NPC response'});
 const recordId=Agency._debug.logDecision(w,agency,e,now,p.npcId,
  decision.decision,{witnessHash,realOffer:true,
   independentlyDecided:true,context:{
    priorDeclines:decision.previousDeclines,
    localStability:decision.actualCountryStability,
    sourceNpcGoal:npc.goal}});
 let joined=false;
 if(decision.decision==='accepted'){
  const accepted=G.admitMemberFromEvidence(w,e.id,{
   actorId:npc.actorId,name:npc.name,origin:Agency.ORIGIN,witness});
  joined=accepted.joined;
  e.additionalMembers.find(x=>x.actorId===npc.actorId).joinedDay=now;
 }
 return {discussed:true,groupId:e.id,npcId:p.npcId,npcName:npc.name,
  proposal,heard:answer,decision:decision.decision,
  joined,knownMembers:e.members,minutes:MINUTES,
  eventId:recordId,
  noCompulsoryFees:true,noCompulsoryGuild:true,
  noAutomaticKinship:true,noLegallyBindingOffice:true,
  noSecretTechniqueGranted:true};
}
function status(s,p={}){
 fields(p,['groupId']);
 if(typeof p.groupId!=='string')throw Error('An actual group ID is required');
 return Agency.privateStatus(s,Realm.peek(s),p.groupId);
}

/*
 * Existing founder can ask an ACTUALLY present consenting group member
 * about one freely described real work opportunity. The original member
 * decides independently; acceptance does not produce instant work.
 * A later original monthly member-work result may be associated with it.
 */
function taskRequest(s,p={}){
 fields(p,['groupId','npcId','task','untilDay']);
 const task=phrase(p.task),w0=Realm.peek(s),
  startDay=Math.floor(s.world.minutes/1440),
  npc=People.resolve(w0,p.npcId,s.world.location,startDay),
  e0=G.lookup(w0,p.groupId),
  m0=e0?.additionalMembers?.find(x=>x.actorId===npc?.actorId&&x.active!==false);
 if(!e0||e0.origin!=='player-declaration'||
  e0.founder.name!==s.player?.name||
  !m0||!npc||npc.name!==m0.name||
  npc.location!==s.world.location)
  throw Error('A real group founder must actually speak to a presently consenting member before proposing their own work');
 if(typeof p.task!=='string'||p.task.trim().length<30||p.task.length>750)
  throw Error('A work invitation must describe a real open-ended task, not force a preselected duty');
 if(!Number.isInteger(p.untilDay)||p.untilDay<startDay||
  p.untilDay>10000000)
  throw Error('A real nonretroactive task expiry day is required, without inventing a permanent compulsory obligation');
 if(s.battle||s.encounter||
  s.table?.combatants?.player?.status&&
   s.table.combatants.player.status!=='ok')
  throw Error('An immediate encounter or incapacitation prevents a considered voluntary work conversation');
 if((e0.voluntaryTasks||[]).some(x=>x.memberActorId===m0.actorId&&x.day===startDay))
  throw Error('A real member already considered a group task today; no repeated consent roll');
 const oldMinute=s.world.minutes;
 if(!People.resolve(w0,p.npcId,s.world.location,
  Math.floor((oldMinute+MINUTES)/1440)))
  throw Error('The original real person must remain present for the conversation');
 E.advance(s,MINUTES);W.finalizeTime(s,oldMinute);
 Health.sync(s,{source:'legacy'});
 const w=Realm.ensure(s),e=G.lookup(w,p.groupId),
  now=Math.floor(s.world.minutes/1440),
  member=e?.additionalMembers?.find(x=>
   x.actorId===m0.actorId&&x.hash===m0.hash&&x.active!==false),
  regionId=require('../world/atlas').LOCATION_REGION[s.world.location];
 if(!e||!member||!regionId||
  require('../world/atlas').R[regionId]?.polity!==e.polity||
  p.untilDay<now||
  (e.voluntaryTasks||[]).some(x=>x.memberActorId===m0.actorId&&x.day===now))
  throw Error('The original local voluntary membership is not available for this work conversation');
 const t=Agency.ensure(w),before=t.rngState,
  id='group_task_'+G.hash({
   groupId:e.id,npcId:p.npcId,task,
   minute:s.world.minutes,logIndex:s.log.length}).slice(0,22);
 const partial={groupStatusAtOffer:e.status,
  groupCompletedEfforts:e.completedEfforts,
  groupFailedEfforts:e.failedEfforts},
  acceptChance=G.voluntaryTaskChance(partial),
  draw=Agency.draw(t),
  decision=draw<acceptChance?'accepted':
   draw<Math.min(.92,acceptChance+.25)?'considering':'declined';
 const note=decision==='accepted'?
  'I can try to help with that work, but I make no promise that it will be done or succeed.':
  decision==='considering'?
  'I need to consider that work; do not count me as having agreed.':
  'I decline that task. My membership does not oblige me to do it.';
 const details={origin:G.VOLUNTARY_TASK,id,
  groupId:e.id,groupOriginHash:e.originHash,
  founder:e.founder.name,issuerActorId:'player',issuerWasPresent:true,
  memberActorId:member.actorId,memberConsentHash:member.hash,
  memberName:member.name,npcId:p.npcId,
  place:s.world.location,regionId,day:now,
  untilDay:p.untilDay,task,minutes:MINUTES,
  ...partial,acceptChance,draw,
  agencyBefore:before,agencyAfter:t.rngState,decision,
  noCompulsoryWork:true,noAutomaticPayOrStatus:true,
  noNewWorkResult:true,noNewGroupFundsSpent:true};
 C.event(s,'story',s.player.name+' asks '+npc.name+
  ' about voluntary association work. '+npc.name+
  ' decides independently: “'+note+'”',details);
 const result=G.recordVoluntaryTask(w,e.id,
  structuredClone(s.log[s.log.length-1]));
 Agency._debug.logDecision(w,t,e,now,p.npcId,decision,{
  taskId:result.taskId,originalWitnessHash:
   G.hash(s.log[s.log.length-1]),noForcedMemberDuty:true});
 return {discussed:true,groupId:e.id,npcId:p.npcId,
  taskId:result.taskId,task,
  decision,heard:note,minutes:MINUTES,
  untilDay:p.untilDay,
  noAutomaticWork:true,noGuaranteedSuccess:true,
  noForcedDuty:true,noMemberFees:true,
  noNewMoneyOrLegalOffice:true};
}

/*
 * A founder can initiate one real local conversation, but cannot select
 * either independent NPC's answer. The already accepted volunteer coordinator
 * first freely decides whether to issue an open-ended invitation; only then
 * can the second actual member freely consider it. Neither decision creates
 * completed work, a salary, a government office or treasury control.
 */
function coordinatorTaskRequest(s,p={}){
 fields(p,['groupId','coordinatorNpcId','memberNpcId','task','untilDay']);
 const task=phrase(p.task),w0=Realm.peek(s),
  startDay=Math.floor(s.world.minutes/1440),
  place=s.world.location,
  e0=G.lookup(w0,p.groupId),
  coordinator=e0?G.coordinatorStatus(w0,e0.id,{day:startDay}):null,
  issuer=People.resolve(w0,p.coordinatorNpcId,place,startDay),
  recipient=People.resolve(w0,p.memberNpcId,place,startDay),
  issuerMember=e0?.additionalMembers?.find(x=>
   x.active!==false&&x.actorId===issuer?.actorId),
  recipientMember=e0?.additionalMembers?.find(x=>
   x.active!==false&&x.actorId===recipient?.actorId),
  role=e0?.coordinationMandates?.find(x=>x.id===coordinator?.mandateId);
 if(!e0||e0.origin!=='player-declaration'||
  e0.founder.name!==s.player?.name||
  !role||!role.agreed||
  coordinator.actorId!==issuerMember?.actorId||
  !issuer||!recipient||!issuerMember||!recipientMember||
  issuerMember.actorId===recipientMember.actorId||
  ![issuer,recipient].every(x=>x.location===place))
  throw Error('A genuine currently serving voluntary coordinator and a different consenting member must both actually be present');
 if(typeof p.task!=='string'||p.task.trim().length<30||p.task.length>750)
  throw Error('A real freely described work opportunity is needed, not a fixed mandated task');
 if(!Number.isInteger(p.untilDay)||p.untilDay<startDay||
  p.untilDay>10000000)
  throw Error('The proposed optional opportunity needs an actual later expiry day');
 if(s.battle||s.encounter||
  s.table?.combatants?.player?.status&&
   s.table.combatants.player.status!=='ok')
  throw Error('An urgent encounter prevents this considered voluntary group discussion');
 if((e0.voluntaryTasks||[]).some(x=>
  x.memberActorId===recipientMember.actorId&&x.day===startDay))
  throw Error('This person has already considered an optional association work request today');
 const endDay=Math.floor((s.world.minutes+20)/1440);
 if(role.untilDay<endDay||p.untilDay<endDay||
  !People.resolve(w0,p.coordinatorNpcId,place,endDay)||
  !People.resolve(w0,p.memberNpcId,place,endDay))
  throw Error('Both actual members and their voluntarily accepted coordination must last through the conversation');
 const beforeMinute=s.world.minutes;
 E.advance(s,20);W.finalizeTime(s,beforeMinute);
 Health.sync(s,{source:'legacy'});
 const w=Realm.ensure(s),e=G.lookup(w,p.groupId),
  day=Math.floor(s.world.minutes/1440),minute=s.world.minutes,
  actualIssuer=People.resolve(w,p.coordinatorNpcId,place,day),
  actualRecipient=People.resolve(w,p.memberNpcId,place,day),
  active=e?G.coordinatorStatus(w,e.id,{day}):null,
  actualRole=e?.coordinationMandates?.find(x=>x.id===role.id);
 if(!e||!actualIssuer||!actualRecipient||
  active.mandateId!==role.id||
  actualRole?.sourceHash!==role.sourceHash||
  !e.additionalMembers.some(x=>
   x.active!==false&&x.actorId===issuerMember.actorId&&
   x.hash===issuerMember.hash)||
  !e.additionalMembers.some(x=>
   x.active!==false&&x.actorId===recipientMember.actorId&&
   x.hash===recipientMember.hash))
  throw Error('The original limited mandate and both distinct actual consenting people must remain present');
 const t=Agency.ensure(w),agencyBefore=t.rngState,
  scopeOverlap=Math.min(4,Agency._debug.common(actualRole.scope,task)),
  context={scopeOverlap,groupStatusAtOffer:e.status,
   groupCompletedEfforts:e.completedEfforts,
   groupFailedEfforts:e.failedEfforts},
  issuerChance=G.coordinatorTaskOfferChance(context),
  issuerDraw=Agency.draw(t),issuerAgreed=issuerDraw<issuerChance,
  recipientChance=issuerAgreed?G.voluntaryTaskChance(context):null,
  recipientDraw=issuerAgreed?Agency.draw(t):null,
  decision=!issuerAgreed?'not-offered':
   recipientDraw<recipientChance?'accepted':
   recipientDraw<Math.min(.92,recipientChance+.25)?
    'considering':'declined';
 const id='group_coordtask_'+G.hash({
  groupId:e.id,mandateId:role.id,
  recipientActorId:recipientMember.actorId,minute,task}).slice(0,23);
 const regionId=A.LOCATION_REGION[place];
 if(!A.R[regionId]||A.R[regionId].polity!==e.polity)
  throw Error('A local jurisdiction cannot be inferred from a fictional place');
 const details={origin:G.COORDINATOR_TASK,id,
  groupId:e.id,groupOriginHash:e.originHash,
  originalFounder:e.founder.name,
  mandateId:role.id,mandateSourceHash:role.sourceHash,
  issuerActorId:issuerMember.actorId,
  issuerMembershipHash:issuerMember.hash,
  issuerName:issuerMember.name,issuerNpcId:p.coordinatorNpcId,
  memberActorId:recipientMember.actorId,
  memberConsentHash:recipientMember.hash,
  memberName:recipientMember.name,npcId:p.memberNpcId,
  issuerPresenceHash:actualIssuer.presence?
   G.hash(actualIssuer.presence):null,
  recipientPresenceHash:actualRecipient.presence?
   G.hash(actualRecipient.presence):null,
  issuerWasPresent:true,recipientWasPresent:true,founderWasPresent:true,
  place,regionId,day,minute,minutes:20,
  untilDay:p.untilDay,roleScope:role.scope,task,...context,
  issuerChance,issuerDraw,issuerAgreed,
  recipientChance,recipientDraw,decision,
  agencyBefore,agencyAfter:t.rngState,
  noCompulsoryWork:true,noAutomaticPayOrStatus:true,
  noNewWorkResult:true,noNewGroupFundsSpent:true,
  noPublicOfficeOrTreasuryPower:true,
  noPlayerSelectedNpcAnswers:true};
 C.event(s,'story',
  s.player.name+' asks whether the existing volunteer coordinator '+
  issuerMember.name+' wishes to discuss a possible task with '+
  recipientMember.name+'. The coordinator independently '+
  (issuerAgreed?'makes the optional request':'does not offer the task')+
  (issuerAgreed?'; the other member independently responds '+decision+'.':'.'),
  details);
 const result=G.recordVoluntaryTask(w,e.id,
  structuredClone(s.log.at(-1)));
 Agency._debug.logDecision(w,t,e,day,p.memberNpcId,decision,{
  source:'witnessed-original-independent-coordinator-work-request',
  coordinatorActorId:issuerMember.actorId,
  issuerAgreed,taskId:result.taskId,
  sourceHash:G.hash(s.log.at(-1)),
  noCompelledWorkOrNewGroupMoney:true});
 return {discussed:true,groupId:e.id,
  coordinatorActorId:issuerMember.actorId,
  memberActorId:recipientMember.actorId,
  taskId:result.taskId,task,issuerAgreed,
  decision,memberAccepted:result.accepted,
  minutes:20,untilDay:p.untilDay,
  noCompulsoryWork:true,noGuaranteedWork:true,
  noInventedFundsOrPower:true};
}

function taskStatus(s,p={}){
 fields(p,['groupId']);
 if(typeof p.groupId!=='string')
  throw Error('A real founded group ID is required for historical member tasks');
 const w=Realm.peek(s),e=G.lookup(w,p.groupId),
  regionId=require('../world/atlas').LOCATION_REGION[s.world?.location],
  here=require('../world/atlas').R[regionId]?.polity;
 if(!e||e.origin!=='player-declaration'||
  e.founder.name!==s.player?.name||
  here!==e.polity)
  throw Error('Only the actual local founder can see the group members’ privately witnessed work answers');
 return {groupId:e.id,
  tasks:G.voluntaryTaskStatus(w,e.id,{day:Math.floor(s.world.minutes/1440)}),
  note:'Independent member responses are real; a request cannot force labor, funds, a task outcome, an office or a contract.'};
}

module.exports={invitation,status,taskRequest,coordinatorTaskRequest,taskStatus};
