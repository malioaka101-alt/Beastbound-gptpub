'use strict';
// Form a living, informal family/kin group, trade circle, society or other
// voluntary association using the CHARACTER'S OWN FREE WORDS. Registration
// documents a founding claim, NOT other people's consent or legal nobility.
const E=require('../engine.js'),C=require('./core'),
 W=require('./world'),Health=require('./unified'),
 Realm=require('../world/simulation'),Atlas=require('../world/atlas'),
 Groups=require('../world/emergent-groups');
const FOUNDTIME=25,WORKTIME=45;
function fields(p,allowed,needed=allowed){
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).some(x=>!allowed.includes(x))||
  needed.some(x=>!Object.hasOwn(p,x)))
  throw Error('A group action accepts only the real founder’s own freeform identity, purpose, and actual contributed work');
}
function words(s,min,max,name){
 if(typeof s!=='string'||s.trim().length<min||s.length>max||
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(s))
  throw Error(name+' requires a readable '+min+'–'+max+' character description');
 return s.trim();
}
function locale(s,minutes){
 if(!s.player||typeof s.player.name!=='string'||!s.player.name.trim())
  throw Error('An actually identified and consenting founding character is required');
 const pol=Atlas.R[Atlas.LOCATION_REGION[s.world?.location]]?.polity;
 if(!pol)throw Error('The association must begin in a real visited place');
 if(s.battle||s.encounter)throw Error('An active immediate danger cannot be replaced with a witnessed quiet organisational action');
 const health=s.table?.combatants?.player;
 if(health&&health.status!=='ok')
  throw Error('An incapacitated founder cannot complete this unsupported organisation scene');
 // Founding and voluntary work may cross midnight; the real world clock
 // and its ordinary monthly/sixday ticks handle that without a fake curfew.
 return pol;
}
function form(s,p={}){
 fields(p,['name','kind','purpose']);
 const name=words(p.name,3,110,'Group name'),
  kind=words(p.kind,3,100,'Group kind'),
  purpose=words(p.purpose,12,750,'Group purpose');
 const polity=locale(s,FOUNDTIME),founder=s.player.name;
 const w=Realm.ensure(s),registry=Groups.ensure(w),
  oldMinute=s.world.minutes;
 const id='emergent_'+Groups.hash({
  worldSeed:w.worldSeed,founder,name,polity,
  minute:oldMinute,counter:registry.counter
 }).slice(0,20);
 if(registry.entries[id]||w.houses[id])
  throw Error('An earlier real association record has this identity');
 E.advance(s,FOUNDTIME);W.finalizeTime(s,oldMinute);
 Health.sync(s,{source:'legacy'});
 C.event(s,'story',founder+' publicly declares the beginning of an informal voluntary '+kind+
  ' named '+name+' without asserting anyone else has agreed to join.',{
  origin:'informal-player-group-founding',id,name,kind,purpose,
  founder,polity,location:s.world.location,
  otherMembersConfirmed:false,legalAuthorityGranted:false,
  inheritedAbilitiesGranted:false,minutes:FOUNDTIME
 });
 const original=s.log[s.log.length-1],
  entry=Groups.createPlayer(w,{
   id,name,kind,purpose,founder,
   place:s.world.location,day:Math.floor(s.world.minutes/1440),
   event:original});
 return {formed:true,id:entry.id,name:entry.charter.name,
  kind:entry.charter.kind,founder,
  purpose:entry.charter.duty,minutes:FOUNDTIME,
  knownConsentingMembers:1,publicNoticeDay:entry.releaseDay+1,
  legalStatus:'informal self-declared, not automatically legally recognised',
  noNobleRank:true,noInventedMembers:true,noInheritedPower:true,
  noRequiredTutorOrRegistrationFee:true};
}
function contribute(s,p={}){
 fields(p,['groupId','activity','coins','priorityId'],['groupId','activity']);
 if(typeof p.groupId!=='string')throw Error('An actual previously formed group ID is required');
 const activity=words(p.activity,10,700,'Own freely described practical activity');
 const money=p.coins===undefined?0:C.int(p.coins,'optional real contributed Talons',0,1000000);
 locale(s,WORKTIME);
 const w=Realm.ensure(s),e=Groups.lookup(w,p.groupId);
 if(!e||e.origin!=='player-declaration'||e.founder.name!==s.player.name)
  throw Error('Only a genuinely founded, consented group that this character leads can accept their contribution');
 if(!Number.isInteger(s.player.coins)||s.player.coins<money)
  throw Error('The character does not own the proposed real funds');
 const priorityId=p.priorityId;
 if(priorityId!==undefined&&
   (typeof priorityId!=='string'||
    !e.internalPriorities?.some(x=>x.id===priorityId&&x.supported&&
      x.day<=Math.floor(s.world.minutes/1440))))
  throw Error('A priority link needs a real earlier source-supported member review; dissent is not a binding work order');
 const old=s.world.minutes;
 E.advance(s,WORKTIME);W.finalizeTime(s,old);Health.sync(s,{source:'legacy'});
 const priorPlayerCoins=s.player.coins,priorGroupFunds=e.funds,
  fundingDay=Math.floor(s.world.minutes/1440);
 if(money>0)Groups.openTreasuryAudit(e,fundingDay);
 s.player.coins-=money;e.funds+=money;
 C.event(s,'story',s.player.name+' devotes actual time'+(money?' and personal funds':'')+
  ' to a self-directed association task. The outcome remains unverified.',{
  origin:'actually-attempted-voluntary-group-work',
  groupId:e.id,activity,coins:money,minutes:WORKTIME,
  actor:s.player.name,location:s.world.location,
  ...(priorityId!==undefined?{priorityId}:{}),
  successClaimAccepted:false,noAutomaticFollowers:true
 });
 const ev=structuredClone(s.log[s.log.length-1]);
 if(money>0)Groups.addTreasuryReceipt(e,{
  kind:'personal-original-contribution',day:fundingDay,
  amount:money,before:priorGroupFunds,
  proof:{originalEvent:structuredClone(ev),
   originalEventHash:Groups.hash(ev),
   playerCoinsBefore:priorPlayerCoins,
   playerCoinsAfter:s.player.coins}});
 e.activity.push({day:Math.floor(s.world.minutes/1440),
  minutes:WORKTIME,amount:money,activity,hash:Groups.hash(ev),witness:ev,
  ...(priorityId!==undefined?{priorityId}:{})});
 return {workRecorded:true,groupId:e.id,actualMinutes:WORKTIME,
  spentCoins:money,treasury:e.funds,
  verifiedResult:false,nextIndependentWorldReview:true,
  ...(priorityId!==undefined?{originalPriorityLink:priorityId}:{}),
  noAutomaticNewMembers:true,noPowerOrStatusGranted:true};
}
function restatePurpose(s,p={}){
 fields(p,['groupId','purpose','reason']);
 if(typeof p.groupId!=='string')throw Error('An existing real association is needed');
 const purpose=words(p.purpose,12,750,'New declared purpose'),
  reason=words(p.reason,10,600,'Explanation of this real change');
 locale(s,FOUNDTIME);
 const w=Realm.ensure(s),e=Groups.lookup(w,p.groupId);
 if(!e||e.origin!=='player-declaration'||
  e.founder.actorId!=='player'||e.founder.name!==s.player.name||
  e.polity!==Atlas.R[Atlas.LOCATION_REGION[s.world.location]]?.polity)
  throw Error('Only the actual locally present founder may change their own public declaration');
 const previous=Groups.currentPurpose(e);
 if(purpose===previous)
  throw Error('The declared purpose has not changed; no time or turn is spent');
 const oldMinute=s.world.minutes;
 E.advance(s,FOUNDTIME);W.finalizeTime(s,oldMinute);
 Health.sync(s,{source:'legacy'});
 const minute=s.world.minutes,day=Math.floor(minute/1440);
 C.event(s,'story',s.player.name+' publicly revises the stated purpose of '+
  e.charter.name+'. Other members retain their own voice and obligations.',{
   origin:'declared-group-purpose-change',groupId:e.id,
   actor:s.player.name,previousPurpose:previous,purpose,reason,
   minute,day,minutes:FOUNDTIME,
   otherMembersBound:false,legalAuthorityGranted:false,
   workCompleted:false,moneyTransferred:false
 });
 const witness=structuredClone(s.log.at(-1));
 return {...Groups.revisePurposeFromEvidence(w,e.id,{
  origin:Groups.PURPOSE_SOURCE,actorId:'player',actorName:s.player.name,
  purpose,reason,minute,witness}),actualMinutes:FOUNDTIME};
}
function purposeHistory(s,p={}){
 fields(p,['groupId']);
 if(typeof p.groupId!=='string')throw Error('A real group identity is required');
 const w=Realm.peek(s),e=Groups.lookup(w,p.groupId);
 if(!e||e.origin!=='player-declaration'||
  e.founder.name!==s.player?.name||
  e.polity!==Atlas.R[Atlas.LOCATION_REGION[s.world?.location]]?.polity)
  throw Error('An actual local founder may inspect their own declaration history');
 return Groups.purposeHistoryStatus(w,e.id,{
  day:Math.floor(s.world.minutes/1440)});
}
function discussPurpose(s,p={}){
 fields(p,['groupId','revisionId','npcId','discussion']);
 if(typeof p.groupId!=='string'||typeof p.revisionId!=='string'||
  typeof p.npcId!=='string')
  throw Error('A real earlier purpose declaration and personally identifiable member are needed');
 const discussion=words(p.discussion,30,750,'Voluntary purpose discussion');
 const polity=locale(s,18),w=Realm.peek(s),
  e=Groups.lookup(w,p.groupId),revision=e?.purposeHistory?.at(-1);
 const People=require('../world/person-presence');
 const currentDay=Math.floor(s.world.minutes/1440),
  member=e?.additionalMembers?.find(x=>x.active!==false&&
   x.witness?.details?.npcId===p.npcId),
  person=member?People.resolve(w,p.npcId,s.world.location,currentDay):null;
 if(!e||e.origin!=='player-declaration'||
  e.founder.name!==s.player.name||e.polity!==polity||
  !revision||revision.id!==p.revisionId||
  !member||!person||person.actorId!==member.actorId||
  person.name!==member.name||
  (e.purposeResponses||[]).some(x=>
   x.memberActorId===member.actorId&&
   x.revisionId===revision.id&&x.day===currentDay&&
   x.stance!=='unaware'))
  throw Error('A genuine present member may individually discuss a real current declaration once per original conversation day');
 const oldMinute=s.world.minutes,place=s.world.location,
  endDay=Math.floor((oldMinute+18)/1440);
 if(!People.resolve(w,p.npcId,place,endDay))
  throw Error('The person cannot actually remain for the proposed local conversation');
 E.advance(s,18);W.finalizeTime(s,oldMinute);
 Health.sync(s,{source:'legacy'});
 const next=Realm.ensure(s),minute=s.world.minutes,day=Math.floor(minute/1440),
  available=People.resolve(next,p.npcId,place,day),
  after=Groups.lookup(next,p.groupId);
 if(!available||!after||!after.additionalMembers.some(x=>
   x.actorId===member.actorId&&x.active!==false))
  throw Error('The conversation needs the same independently available participant');
 const regionId=Atlas.LOCATION_REGION[place],
  presenceHash=available.presence?Groups.hash(available.presence):null;
 C.event(s,'story',s.player.name+' discusses the new stated direction of '+
  after.charter.name+' with '+member.name+
  '. Their personal view is not yet assumed.',{
   origin:'witnessed-group-purpose-member-discussion',
   groupId:after.id,revisionId:revision.id,
   revisionSourceHash:revision.sourceHash,
   purpose:revision.purpose,founder:s.player.name,
   memberActorId:member.actorId,memberName:member.name,
   place,regionId,day,minute,minutes:18,discussion,presenceHash,
   noSelectedResponse:true,noObligationOrMandate:true,
   noFundsOrWorkGranted:true
  });
 return {...Groups.considerPurposeRevision(next,{
  groupId:after.id,revisionId:revision.id,npcId:p.npcId,
  place,minute,discussion,witness:structuredClone(s.log.at(-1))}),
  actualMinutes:18};
}
function purposeResponses(s,p={}){
 fields(p,['groupId']);
 if(typeof p.groupId!=='string')throw Error('A true group ID is necessary');
 const w=Realm.peek(s),e=Groups.lookup(w,p.groupId),
  polity=Atlas.R[Atlas.LOCATION_REGION[s.world?.location]]?.polity;
 if(!e||e.origin!=='player-declaration'||
  e.founder.name!==s.player?.name||e.polity!==polity)
  throw Error('Only the actual local founder knows their own personally witnessed discussion records');
 return Groups.purposeResponseStatus(w,e.id,{
  day:Math.floor(s.world.minutes/1440)});
}
function treasuryStatus(s,p={}){
 fields(p,['groupId']);
 if(typeof p.groupId!=='string')
  throw Error('An existing voluntarily founded group ID is required for real fund records');
 const w=Realm.peek(s),e=Groups.lookup(w,p.groupId),
  local=Atlas.R[Atlas.LOCATION_REGION[s.world?.location]]?.polity;
 if(!e||e.origin!=='player-declaration'||
  e.founder.name!==s.player?.name||e.polity!==local)
  throw Error('Original association treasury records are private to its actual local founder');
 return Groups.treasuryAuditStatus(w,e.id);
}
function status(s,p={}){
 fields(p,[],[]);
 return Realm.publicEmergentGroups(s);
}
module.exports={form,contribute,restatePurpose,purposeHistory,discussPurpose,purposeResponses,status,treasuryStatus};
