'use strict';
// #18: genuinely present independent members of one naturally changing
// organisation respond to a freely authored purpose; no player-chosen NPC
// assent, unanimous group vote, completed work, money or new faction types.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),G=require('../world/emergent-groups'),
 Agency=require('../world/group-member-agency'),W=require('../rules/world');
const founder='Disposable Changing Community Test';
const s=E.newGame({seed:996420,name:founder,path:'undecided'});
const founded=R.act(s,{system:'social',operation:'formGroup',params:{
 name:'Open Rivercraft and Living Habitat Circle',
 kind:'voluntary local study and practical craft cooperative',
 purpose:'Share observed living habitat conditions with consenting neighbours without claiming authority over others'
}});
const w=s.table.realm,groupId=founded.id,agency=Agency.ensure(w);
const invitation='Would you consider joining this circle as a voluntary member? You may disagree with our direction, refuse new duties and withdraw at any time.';
function seedFor(predicate){
 for(let i=1;i<100000;i++){
  const r={rngState:i},draw=Agency.draw(r);
  if(predicate(draw))return i;
 }
 throw Error('No original member agency seed gives the requested test branch');
}
for(const npcId of ['elira','otto']){
 agency.rngState=seedFor(x=>x<.001);
 const answer=R.act(s,{system:'social',operation:'inviteGroupMember',
  params:{groupId,npcId,proposal:invitation}});
 A.equal(answer.decision,'accepted',
  'Only the actual independent member decision can establish membership');
}
const e=G.lookup(w,groupId);
A.equal(e.members,3);
const freshPurpose='Observe seasonal river crossing changes and voluntarily share practical safe-passage evidence with the wider local community';
const revision=R.act(s,{system:'social',operation:'restateGroupPurpose',
 params:{groupId,purpose:freshPurpose,reason:
  'Local real-world concerns give the circle a new practical focus beyond general habitat observation'}});
const revisionId=revision.revisionId;
const foundingPurpose=e.charter.duty,coins=s.player.coins,playerRng=s.rngState,
 groupsRng=w.emergentGroups.rngState,memberCount=e.members;
const discussion='The member hears the actual revised local-purpose statement, considers its practical limits, and freely gives their own opinion without compulsory agreement.';
function ask(npcId,rev=revisionId){
 return R.act(s,{system:'social',operation:'discussGroupPurpose',
  params:{groupId,revisionId:rev,npcId,discussion}});
}
const before=s.world.minutes;
const ghostState=E.exportGame(s),ghostRng=agency.rngState;
A.throws(()=>ask('nonexistent'),/genuine present member/);
A.throws(()=>R.act(s,{system:'social',operation:'discussGroupPurpose',
 params:{groupId,revisionId,npcId:'elira',discussion,stance:'supported'}}),
 /only the real founder|actual contributed work|group action accepts/,
 'the caller may not supply an NPC answer at all');
A.equal(E.exportGame(s),ghostState);
A.equal(agency.rngState,ghostRng,'a nonexistent member may never consume a secret answer');
agency.rngState=seedFor(x=>x<.001);
const elira=ask('elira');
A.equal(elira.stance,'supported');
A.equal(elira.individualResponse,true);
A.equal(elira.noCollectiveApprovalInferred,true);
A.equal(elira.actualMinutes,18);
A.equal(s.world.minutes-before,18);
const afterElira=E.exportGame(s),afterEliraAgency=agency.rngState;
A.throws(()=>ask('elira'),/once per original conversation day/);
A.equal(E.exportGame(s),afterElira,
 'changing request IDs cannot reroll the same member on the same day');
A.equal(agency.rngState,afterEliraAgency);
agency.rngState=seedFor(x=>x>.40&&x<.43);
const otto=ask('otto');
A.equal(otto.stance,'dissented',
 'another autonomous member may disagree on the exact same declared purpose');
A.equal(otto.noGroupFundsChanged,true);
A.equal(e.members,memberCount);
A.equal(s.player.coins,coins);
A.equal(s.rngState,playerRng);
A.equal(w.emergentGroups.rngState,groupsRng);
A.equal(e.charter.duty,foundingPurpose);
A.equal(G.currentPurpose(e),freshPurpose);
A.equal(G.validate(e),true);
const snapshot=R.act(s,{system:'social',operation:'groupPurposeResponses',
 params:{groupId}});
A.equal(snapshot.responses.length,2);
A.equal(snapshot.responses[0].stance,'supported');
A.equal(snapshot.responses[1].stance,'dissented');
A.equal(snapshot.notLegalOrGroupWideVotes,true);
A.equal(snapshot.noMoneyOrCompletedWork,true);
// A new genuinely authored direction supports a new discussion, while
// the older differing positions remain fixed historical evidence.
const nextPurpose='Continue independent observations while carefully studying river repair materials from honest local field evidence';
const next=R.act(s,{system:'social',operation:'restateGroupPurpose',
 params:{groupId,purpose:nextPurpose,
  reason:'A later discussion legitimately shifts what the founder wishes the voluntary circle to study'}});
agency.rngState=seedFor(x=>x>.99);
const revised=ask('elira',next.revisionId);
A.equal(revised.previousStance,'supported');
A.equal(revised.stance,'undecided',
 'a previously supportive member can independently become uncertain');
A.equal(G.currentPurpose(e),nextPurpose);
A.equal(e.charter.duty,foundingPurpose);
A.equal(e.purposeResponses.length,3);
A.equal(G.validate(e),true);
// A later real day can also permit the SAME member to reconsider a STILL
// current statement; the prohibition is duplicate answers, not a forever gate.
W.advance(s,6);
const beforeNewDay=Math.floor(s.world.minutes/1440);
A.ok(beforeNewDay>e.purposeResponses.at(-1).day,
 'ordinary world time makes a later personally witnessed discussion possible');
const laterRevId=next.revisionId;
agency.rngState=seedFor(x=>x>.40&&x<.44);
const later=ask('elira',laterRevId);
A.equal(later.previousStance,'undecided');
A.equal(later.individualResponse,true);
A.equal(e.purposeResponses.length,4);
const sameLaterDay=E.exportGame(s),sameLaterRng=agency.rngState;
A.throws(()=>ask('elira',laterRevId),/once per original conversation day/);
A.equal(E.exportGame(s),sameLaterDay);
A.equal(agency.rngState,sameLaterRng);
const original=structuredClone(e.purposeResponses);
e.purposeResponses[1].stance='supported';
A.equal(G.validate(e),false,'a reported individual answer cannot be altered');
e.purposeResponses=structuredClone(original);
e.purposeResponses[1].stance='supported';
e.purposeResponses[1].source.stance='supported';
e.purposeResponses[1].sourceHash=G.hash(e.purposeResponses[1].source);
A.equal(G.validate(e),false,
 're-sealing a false answer cannot change the ORIGINAL independent RNG replay');
e.purposeResponses=structuredClone(original);
A.equal(G.validate(e),true);
const saved=E.exportGame(s),replayed=E.importGame(saved);
const actual=G.lookup(replayed.table.realm,groupId);
A.ok(actual);
A.equal(actual.purposeResponses.length,4);
A.equal(actual.charter.duty,foundingPurpose);
A.equal(G.currentPurpose(actual),nextPurpose);
const visible=R.act(replayed,{system:'social',operation:'groupPurposeResponses',
 params:{groupId}});
A.equal(visible.responses.length,4);
A.equal(visible.responses[1].stance,'dissented');
A.equal(visible.noMemberCompulsion,true);
console.log('Living organisation member purpose response: real individual assent/dissent/uncertainty, changing opinions, original scene + agency replay, duplicate prevention, no new resources/votes and persistent save PASS');
