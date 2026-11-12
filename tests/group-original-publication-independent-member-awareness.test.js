'use strict';
// Original world-public group purposes can be independently noticed (or not)
// by real consenting NPCs without creating a fictional meeting, binding vote,
// invented resources, or omniscient player-facing personal revelations.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),W=require('../rules/world'),
 G=require('../world/emergent-groups'),
 Agency=require('../world/group-member-agency');
const form={name:'Open Wetland Crossing Observation and Care Circle',
 kind:'voluntary evidence-sharing local community association',
 purpose:'Share actual marsh habitat observations with freely participating local neighbours while preserving independent consent'};
const invite='Would you voluntarily join this independent local group without any automatic binding duty or need to agree with every later announced change?';
const firstPurpose='Publish responsibly recorded seasonal wetland crossing observations without imposing a duty on independent neighbours';
const reason='The originally witnessed founder makes a real later freeform declaration about the group direction without compelling any other participant';
const discussion='The existing consenting member hears and privately considers the founder’s declared new scope in an authentic local conversation, with no automatic agreement.';
const act=(s,operation,params)=>R.act(s,{system:'social',operation,params});
function setup(seed,withConversation=false){
 const s=E.newGame({seed,name:'Disposable Published Purpose World Test',path:'undecided'}),
  started=act(s,'formGroup',form),w=s.table.realm,
  groupId=started.id,agency=Agency.ensure(w);
 for(const npcId of ['elira','otto']){
  agency.rngState=1; // original autonomous draw yields actual acceptance
  const joined=act(s,'inviteGroupMember',{
   groupId,npcId,proposal:invite});
  A.equal(joined.decision,'accepted');
 }
 const e=G.lookup(w,groupId),first=act(s,'restateGroupPurpose',{
  groupId,purpose:firstPurpose,reason});
 if(withConversation){
  agency.rngState=1;
  const response=act(s,'discussGroupPurpose',{
   groupId,revisionId:first.revisionId,npcId:'elira',discussion});
  A.equal(response.individualResponse,true);
 }
 return {s,w,e,agency,groupId,first};
}
{
 const {s,w,e,agency,groupId,first}=setup(997999);
 const charter=e.charter.duty,playerCoins=s.player.coins,
  origMemberCount=e.members,originalRng=s.rngState,
  rev=e.purposeHistory.at(-1),priorHistoryLength=(e.purposeResponses||[]).length;
 A.equal(priorHistoryLength,0);
 A.equal(G.currentPurpose(e,{day:rev.releaseDay-1}),charter,
  'the earlier founding purpose is what was public before actual release');
 A.equal(G.currentPurpose(e,{day:rev.releaseDay}),firstPurpose);
 W.advance(s,30);
 const rows=e.purposeResponses.filter(x=>
  x.origin===G.PUBLISHED_PURPOSE_RESPONSE);
 A.equal(rows.length,2,
  'each real local consenting member gets one source-bound autonomous public-notice opportunity');
 A.equal(new Set(rows.map(x=>x.memberActorId)).size,2);
 A.ok(rows.every(x=>x.revisionId===first.revisionId&&
  x.source.originalReleaseDay===rev.releaseDay&&
  x.source.revisionSourceHash===rev.sourceHash&&
  x.source.noDirectMeetingInvented===true&&
  x.source.noPlayerSelectedAnswer===true&&
  x.source.noCollectiveObligation===true&&
  x.source.noExtraGroupMoneyOrWork===true&&
  G.verifyPublishedPurposeResponse(e,x)));
 A.ok(rows.every(x=>x.stance==='unaware'||
  ['supported','dissented','undecided'].includes(x.stance)));
 A.equal(G.validate(e),true);
 A.equal(e.members,origMemberCount);
 A.equal(e.charter.duty,charter);
 A.equal(s.player.coins,playerCoins);
 A.equal(s.rngState,originalRng);
 const known=act(s,'groupPurposeResponses',{groupId});
 A.equal(known.responses.length,0,
  'a founder cannot magically know private NPC thoughts from the world tick');
 A.equal(known.noMemberCompulsion,true);
 const before=E.exportGame(s),agencyBefore=agency.rngState;
 const repeated=G.considerPublishedPurpose(w,{
  groupId,npcId:'otto',day:w.lastTickDay});
 A.equal(repeated.reviewed,false);
 A.equal(E.exportGame(s),before,
  'attempts to rerun an original published personal decision must have no state effect');
 A.equal(agency.rngState,agencyBefore);
 const fresh=E.importGame(before),restored=G.lookup(fresh.table.realm,groupId);
 A.equal(E.exportGame(fresh),before);
 A.equal(restored.purposeResponses.length,2);
 A.equal(G.validate(restored),true);
 const copy=structuredClone(e.purposeResponses);
 const replacement=e.purposeResponses[0].stance==='dissented'?
  'supported':'dissented';
 e.purposeResponses[0].stance=replacement;
 A.equal(G.validate(e),false,'a forged stance without source changes fails validation');
 e.purposeResponses=structuredClone(copy);
 e.purposeResponses[0].stance=replacement;
 e.purposeResponses[0].source.stance=replacement;
 e.purposeResponses[0].sourceHash=G.hash(e.purposeResponses[0].source);
 A.equal(G.validate(e),false,
  'resealing a chosen NPC answer cannot rewrite the original independently replayable draws');
 e.purposeResponses=copy;
 A.equal(G.validate(e),true);
 W.advance(s,30);
 A.equal(e.purposeResponses.length,2,
  'a published original change cannot be rerolled indefinitely in later months');
}
{
 const {s,w,e,groupId,first}=setup(997998,true);
 A.equal(e.purposeResponses.length,1);
 A.equal(e.purposeResponses[0].origin,G.PURPOSE_RESPONSE);
 W.advance(s,30);
 const pub=e.purposeResponses.filter(x=>
  x.origin===G.PUBLISHED_PURPOSE_RESPONSE);
 A.equal(pub.length,1,'a previously personally informed member is not redundantly assigned private public-notice opinions');
 A.equal(pub[0].memberActorId,'npc:otto');
 const known=act(s,'groupPurposeResponses',{groupId});
 A.equal(known.responses.length,1,
  'only what the founder personally witnessed is in their readable member history');
 A.equal(known.responses[0].memberActorId,'npc:elira');
 A.equal(G.validate(e),true);
}
console.log('Living original public purpose independently reaches or misses consenting local members on actual world months, preserves private knowledge, individual decisions and authentic draws, forbids reroll, persists saves and rejects forged stance PASS');
