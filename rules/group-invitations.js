'use strict';
// A real player can make a freeform offer to an actually local existing NPC.
// The NPC decides separately, and a refusal or hesitation is an actual
// response, not permission for player-authored assent or automatic rank.
const E=require('../engine.js'),C=require('./core'),W=require('./world'),
 Health=require('./unified'),Realm=require('../world/simulation'),
 G=require('../world/emergent-groups'),Agency=require('../world/group-member-agency'),
 People=require('../world/person-presence');
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
module.exports={invitation,status};
