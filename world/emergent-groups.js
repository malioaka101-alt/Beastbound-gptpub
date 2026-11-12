'use strict';
// A world-owned registry for groups formed DURING PLAY, not a finite catalogue.
// The 28 example houses remain canon; other families, guilds, kin groups,
// study circles, associations and future institutions can emerge later.
// A founding statement does NOT establish other people's consent, property,
// noble recognition, legal power or any hereditary/supernatural ability.
const Crypto=require('node:crypto'),Atlas=require('./atlas');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const SOURCE_PLAYER='Witnessed living-character declaration of an informal new association';
const SOURCE_NPC='Genuinely funded voluntary worker split following two verified vocational trials';
const TYPES=new Set(['player-declaration','worker-spinoff']);
// Future world modules register their OWN genuine origin witnesses and consent
// rules, without adding every possible new kind to a hard-coded catalogue.
const ADAPTERS=new Map();
const MEMBER_ADAPTERS=new Map();
const DEPARTURE_ADAPTERS=new Map();
function registerMemberDepartureAdapter(origin,check){
 if(typeof origin!=='string'||!/^[a-z][a-z0-9_-]{5,79}$/.test(origin)||
  DEPARTURE_ADAPTERS.has(origin)||typeof check!=='function')
  throw Error('A unique source verifier for independently departed members is required');
 DEPARTURE_ADAPTERS.set(origin,check);
}
function registerMemberConsentAdapter(origin,check){
 if(typeof origin!=='string'||!/^[a-z][a-z0-9_-]{5,79}$/.test(origin)||
  MEMBER_ADAPTERS.has(origin)||typeof check!=='function')
  throw Error('A unique verifiable individual consent source is required');
 MEMBER_ADAPTERS.set(origin,check);
}
function registerOriginAdapter(origin,check){
 if(typeof origin!=='string'||!/^[a-z][a-z0-9_-]{5,79}$/.test(origin)||
  TYPES.has(origin)||ADAPTERS.has(origin)||typeof check!=='function')
  throw Error('A unique trusted source-evidence validator is required for a new group origin');
 ADAPTERS.set(origin,check);
}
const clamp=(n,lo=0,hi=100)=>Math.max(lo,Math.min(hi,n));
function seed(w){return {version:1,startedAtMonth:w.ticks.months,
 rngState:((w.worldSeed^0x6e2d96f3)>>>0)||0x4521d639,
 counter:0,entries:{},history:[]};}
function peek(w){const r=w.emergentGroups;return r?.version===1?r:null;}
function ensure(w){
 if(w.emergentGroups===undefined)w.emergentGroups=seed(w);
 const r=w.emergentGroups;
 if(r.version!==1||!r.entries||!Array.isArray(r.history)||!Number.isInteger(r.counter))
  throw Error('Living association registry must preserve actual persistent provenance');
 return r;
}
function draw(t){
 let x=t.rngState>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 t.rngState=(x>>>0)||0x4521d639;return t.rngState/4294967296;
}
/*
 * A group's founding charter is historical evidence, not a frozen list of
 * everything it will ever attempt. Evolving PUBLIC PURPOSE is a separately
 * dated declaration, never a rewritten founding witness, compelled member
 * obligation, new public office, work result or money transfer.
 *
 * A small starting group uses a genuine founder's own scene. Other authored
 * independent institutions can use a trusted, source-checking world adapter.
 * New purposes are free text, not one of a fixed set of guild/faction types.
 */
const PURPOSE_SOURCE='witnessed-original-founder-restates-association-purpose-v1';
const PURPOSE_ADAPTERS=new Map();
function registerPurposeRevisionAdapter(origin,check){
 if(typeof origin!=='string'||!/^[a-z][a-z0-9_-]{5,79}$/.test(origin)||
  origin===PURPOSE_SOURCE||PURPOSE_ADAPTERS.has(origin)||
  typeof check!=='function')
  throw Error('An independent group purpose source requires its own trusted evidence verifier');
 PURPOSE_ADAPTERS.set(origin,check);
}
function verifyPurposeHistory(e){
 if(e.purposeHistory===undefined)return true; // older genuine saves
 if(!Array.isArray(e.purposeHistory))return false;
 let previous=e.charter.duty,priorHash=e.originHash,priorMinute=-1;
 const ids=new Set();
 for(const row of e.purposeHistory){
  const q=row?.source,ev=q?.witness,details=ev?.details;
  if(!q||row.origin!==q.origin||row.sourceHash!==hash(q)||
   row.id!==q.id||ids.has(row.id)||
   q.groupId!==e.id||q.groupOriginHash!==e.originHash||
   q.priorHash!==priorHash||q.priorPurpose!==previous||
   row.purpose!==q.purpose||row.day!==q.day||
   row.minute!==q.minute||row.releaseDay!==q.day+2||
   !Number.isInteger(q.minute)||q.minute<=priorMinute||
   !Number.isInteger(q.day)||q.day<e.foundedDay||
   q.day!==Math.floor(q.minute/1440)||
   typeof q.actorId!=='string'||!q.actorId.trim()||
   typeof q.actorName!=='string'||!q.actorName.trim()||
   typeof q.purpose!=='string'||q.purpose.trim()!==q.purpose||
   q.purpose.length<12||q.purpose.length>750||
   q.purpose===previous||
   typeof q.reason!=='string'||q.reason.trim()!==q.reason||
   q.reason.length<10||q.reason.length>600||
   q.noMembersCompelled!==true||q.noLegalOfficeOrWorkGranted!==true||
   q.noResourceChanges!==true||
   !ev||hash(ev)!==q.witnessHash)
   return false;
  if(q.origin===PURPOSE_SOURCE){
   if(e.origin!=='player-declaration'||
    q.actorId!==e.founder.actorId||q.actorName!==e.founder.name||
    ev.type!=='story'||details?.origin!=='declared-group-purpose-change'||
    details.groupId!==e.id||details.actor!==e.founder.name||
    details.previousPurpose!==previous||
    details.purpose!==q.purpose||details.reason!==q.reason||
    details.minute!==q.minute||details.day!==q.day||
    details.minutes!==25||details.otherMembersBound!==false||
    details.legalAuthorityGranted!==false||
    details.workCompleted!==false||details.moneyTransferred!==false)
    return false;
  }else if(!PURPOSE_ADAPTERS.has(q.origin)||
   PURPOSE_ADAPTERS.get(q.origin)(e,q,ev)!==true){
   return false;
  }
  ids.add(row.id);priorMinute=q.minute;
  priorHash=row.sourceHash;previous=q.purpose;
 }
 return true;
}
function currentPurpose(e,{day=Infinity}={}){
 if(!e||!verifyPurposeHistory(e))throw Error('Group purpose history lacks original verified evidence');
 const rows=(e.purposeHistory||[]).filter(x=>x.releaseDay<=day);
 return rows.length?rows.at(-1).purpose:e.charter.duty;
}
function purposeHistoryStatus(w,groupId,{day}={}){
 const e=lookup(w,groupId),today=day===undefined?w.lastTickDay:day;
 if(!e||!Number.isInteger(today)||today<e.foundedDay)
  throw Error('An existing valid group and observed world day are needed');
 const rows=(e.purposeHistory||[]).filter(x=>x.day<=today);
 return {groupId:e.id,name:e.charter.name,
  foundingPurpose:e.charter.duty,
  founderDeclarationNow:rows.length?rows.at(-1).purpose:e.charter.duty,
  publiclyReleasedPurpose:currentPurpose(e,{day:today}),
  revisions:rows.map(x=>({id:x.id,day:x.day,actor:x.source.actorName,
   declaredPurpose:x.purpose,reason:x.source.reason,
   publicReleaseDay:x.releaseDay,sourceHash:x.sourceHash})),
  notMemberConsensus:true,noNewLegalRights:true,noCompletedWork:true,
  noAdditionalFunds:true};
}
function revisePurposeFromEvidence(w,groupId,{origin,actorId,actorName,
 purpose,reason,minute,witness}={}){
 const e=lookup(w,groupId),r=ensure(w);
 if(!e||!Number.isInteger(minute)||minute<0||
  typeof origin!=='string'||typeof actorId!=='string'||
  typeof actorName!=='string'||!actorName.trim()||
  typeof purpose!=='string'||purpose.trim()!==purpose||
  purpose.length<12||purpose.length>750||
  typeof reason!=='string'||reason.trim()!==reason||
  reason.length<10||reason.length>600||
  !witness||typeof witness!=='object'||
  (origin!==PURPOSE_SOURCE&&!PURPOSE_ADAPTERS.has(origin)))
  throw Error('A real verified original association and new freeform purpose witness are required');
 const rows=e.purposeHistory||[],prior=rows.at(-1),
  priorPurpose=prior?.purpose||e.charter.duty,
  priorHash=prior?.sourceHash||e.originHash,day=Math.floor(minute/1440);
 if(day<e.foundedDay||minute<0||purpose===priorPurpose||
   (prior&&minute<=prior.minute))
  throw Error('An actual later change in the founding group purpose is required');
 const q0={origin,groupId:e.id,groupOriginHash:e.originHash,
  priorHash,priorPurpose,actorId,actorName,
  purpose,reason,day,minute,witness:structuredClone(witness),
  witnessHash:hash(witness),
  noMembersCompelled:true,noLegalOfficeOrWorkGranted:true,
  noResourceChanges:true};
 const id='purpose_'+hash({groupId,priorHash,minute,purpose}).slice(0,24),
  source={...q0,id},
  row={id,origin,purpose,day,minute,releaseDay:day+2,
   source,sourceHash:hash(source)};
 e.purposeHistory||=[];e.purposeHistory.push(row);
 if(!validate(e)){
  e.purposeHistory.pop();
  throw Error('A forged declaration cannot change saved institutional history');
 }
 record(r,e,day,'founder-purpose-declaration-changed',
  {revisionId:id,actorId,originalCharterPreserved:true,
   publicReleaseDay:row.releaseDay,noOtherMembersBound:true},null);
 return {groupId:e.id,revisionId:id,foundingPurpose:e.charter.duty,
  newlyDeclaredPurpose:purpose,publicReleaseDay:row.releaseDay,
  noOtherMembersBound:true,noLegalOfficeOrFundsGranted:true,
  noWorkSuccessClaim:true};
}

/*
 * #18: after an original founder declares a new freeform public purpose,
 * real, separately consenting local members may express their OWN views.
 * This is NOT a binding poll, authority transfer, group work, or a
 * player's right to select an NPC answer. Reuse the original member agency
 * RNG and existing context-sensitive position probabilities.
 */
const PURPOSE_RESPONSE='witnessed-independent-member-group-purpose-view-v1';
function priorPurposeResponse(rows,actorId){
 const last=[...rows].reverse().find(x=>
  x.memberActorId===actorId&&x.stance!=='unaware');
 return last?{stance:last.stance,hash:last.sourceHash,
  minute:last.minute,day:last.day}:
  {stance:'unrecorded',hash:null,minute:-1,day:-1};
}
/*
 * An existing REAL public purpose declaration can be noticed privately by
 * a genuinely consenting local member on the ORIGINAL monthly world tick.
 * No dialogue, physical meeting, founder demand or faction vote is invented.
 * 'unaware' is persisted as a non-opinion to prevent repeat notice draws;
 * it never erases the member's earlier actual views.
 */
const PUBLISHED_PURPOSE_RESPONSE='independent-member-view-after-original-published-group-purpose-v1';
function publishedPurposeNoticeChance(q){
 return Math.min(.65,Math.max(.24,.40+
  (q.localStability>=55?.08:0)+
  (q.groupCompletedEfforts>0?.05:0)));
}
function verifyPublishedPurposeResponse(e,row){
 const q=row?.source,revision=e.purposeHistory?.find(x=>x.id===row?.revisionId);
 if(!q||!revision||!verifyPurposeHistory(e)||
  e.origin!=='player-declaration'||
  q.origin!==PUBLISHED_PURPOSE_RESPONSE||
  row.origin!==PUBLISHED_PURPOSE_RESPONSE||
  row.sourceHash!==hash(q)||row.id!==q.id||
  row.id!=='published_purpose_'+hash({
   groupId:e.id,revisionId:revision.id,
   actorId:q.memberActorId,day:q.day}).slice(0,24)||
  row.revisionId!==q.revisionId||row.stance!==q.stance||
  row.memberActorId!==q.memberActorId||
  row.memberConsentHash!==q.memberConsentHash||
  row.day!==q.day||row.minute!==q.minute||
  q.groupId!==e.id||q.groupOriginHash!==e.originHash||
  q.revisionSourceHash!==revision.sourceHash||
  q.revisionPurpose!==revision.purpose||
  q.originalReleaseDay!==revision.releaseDay||
  !Number.isInteger(q.day)||q.day<revision.releaseDay||
  q.day-revision.releaseDay>=30||
  !Number.isInteger(q.minute)||q.minute!==q.day*1440||
  !Atlas.R[q.membershipRegionId]||
  Atlas.R[q.membershipRegionId].polity!==e.polity||
  q.localPolity!==e.polity||
  typeof q.memberName!=='string'||q.memberName.length<3||
  typeof q.npcId!=='string'||!q.npcId.trim()||
  typeof q.previousResponseHash!=='string'&&q.previousResponseHash!==null||
  typeof q.previousStance!=='string'||
  !['unrecorded','supported','dissented','undecided'].includes(q.previousStance)||
  !Number.isInteger(q.previousResponseMinute)||
  !Number.isInteger(q.previousResponseDay)||
  !Number.isInteger(q.groupCompletedEfforts)||q.groupCompletedEfforts<0||
  !Number.isInteger(q.groupFailedEfforts)||q.groupFailedEfforts<0||
  !Number.isInteger(q.localStability)||q.localStability<0||q.localStability>100||
  !q.worldSnapshot||
  !['pressure','quality','stability','prosperity'].every(k=>
   Number.isFinite(q.worldSnapshot[k])&&
   q.worldSnapshot[k]>=0&&q.worldSnapshot[k]<=100)||
  !Number.isInteger(q.agencyBefore)||q.agencyBefore<1||
  !Number.isInteger(q.agencyAfter)||q.agencyAfter<1||
  typeof q.noticeDraw!=='number'||q.noticeDraw<0||q.noticeDraw>=1||
  q.noticeChance!==publishedPurposeNoticeChance(q)||
  q.noticed!==(q.noticeDraw<q.noticeChance)||
  q.draw!==null&&(typeof q.draw!=='number'||q.draw<0||q.draw>=1)||
  !['supported','dissented','undecided','unaware'].includes(q.stance)||
  q.noDirectMeetingInvented!==true||
  q.noPlayerSelectedAnswer!==true||
  q.noCollectiveObligation!==true||
  q.noExtraGroupMoneyOrWork!==true)
  return false;
 const member=e.additionalMembers?.find(x=>
  x.actorId===q.memberActorId&&x.hash===q.memberConsentHash&&
  x.name===q.memberName&&
  x.witness?.details?.npcId===q.npcId&&
  Atlas.LOCATION_REGION[x.witness?.details?.location]===
   q.membershipRegionId&&
  Number.isInteger(x.witness?.details?.day)&&
  x.witness.details.day<=q.day&&
  (x.active!==false||x.departure?.day>q.day));
 if(!member)return false;
 const Agency=require('./group-member-agency'),rng={rngState:q.agencyBefore},
  noticeDraw=Agency.draw(rng);
 const choices=positionChances({previousStance:q.previousStance,
  groupCompletedEfforts:q.groupCompletedEfforts,
  groupFailedEfforts:q.groupFailedEfforts,
  worldSnapshot:q.worldSnapshot});
 const seen=noticeDraw<q.noticeChance,
  opinionDraw=seen?Agency.draw(rng):null,
  stance=seen?(opinionDraw<choices.support?'supported':
   opinionDraw<choices.support+choices.dissent?'dissented':'undecided'):'unaware';
 return q.noticeDraw===noticeDraw&&q.draw===opinionDraw&&
  q.supportChance===choices.support&&q.dissentChance===choices.dissent&&
  q.noticed===seen&&q.stance===stance&&
  rng.rngState===q.agencyAfter;
}
function considerPublishedPurpose(w,{groupId,npcId,day}={}){
 const e=lookup(w,groupId),revision=e?.purposeHistory?.at(-1),
  member=e?.origin==='player-declaration'?
   e.additionalMembers.find(x=>x.active!==false&&
    x.witness?.details?.npcId===npcId):null;
 const People=require('./person-presence'),Agency=require('./group-member-agency'),
  npc=member?People.identity(w,npcId):null,
  localPolity=npc?.polity||
   Atlas.R[Atlas.LOCATION_REGION[npc?.location]]?.polity,
  regionId=Atlas.LOCATION_REGION[member?.witness?.details?.location],
  eco=w.ecosystems?.[regionId],host=w.countries?.[e?.polity],
  prior=member?priorPurposeResponse(e.purposeResponses||[],member.actorId):null;
 const already=(e?.purposeResponses||[]).some(x=>
  x.memberActorId===member?.actorId&&
  x.revisionId===revision?.id);
 if(!e||!revision||!member||!npc||localPolity!==e.polity||
  !Number.isInteger(day)||day<revision.releaseDay||
  day-revision.releaseDay>=30||already||
  !eco||!host||!regionId)
  return {reviewed:false,reason:'no new locally accessible original publication'};
 if(![eco.pressure,eco.quality,host.stability,host.prosperity].every(x=>
  Number.isFinite(x)&&x>=0&&x<=100))
  throw Error('An original local world must exist before independent publication awareness');
 const t=Agency.ensure(w),before=t.rngState,
  q0={origin:PUBLISHED_PURPOSE_RESPONSE,groupId:e.id,
   groupOriginHash:e.originHash,
   revisionId:revision.id,revisionSourceHash:revision.sourceHash,
   revisionPurpose:revision.purpose,originalReleaseDay:revision.releaseDay,
   memberActorId:member.actorId,memberConsentHash:member.hash,
   memberName:member.name,npcId,membershipRegionId:regionId,
   localPolity,day,minute:day*1440,
   previousStance:prior.stance,previousResponseHash:prior.hash,
   previousResponseMinute:prior.minute,previousResponseDay:prior.day,
   groupCompletedEfforts:e.completedEfforts,
   groupFailedEfforts:e.failedEfforts,localStability:host.stability,
   worldSnapshot:{pressure:eco.pressure,quality:eco.quality,
    stability:host.stability,prosperity:host.prosperity},
   noDirectMeetingInvented:true,noPlayerSelectedAnswer:true,
   noCollectiveObligation:true,noExtraGroupMoneyOrWork:true};
 const noticeChance=publishedPurposeNoticeChance(q0),
  noticeDraw=Agency.draw(t),noticed=noticeDraw<noticeChance,
  chances=positionChances(q0),draw=noticed?Agency.draw(t):null,
  stance=noticed?(draw<chances.support?'supported':
   draw<chances.support+chances.dissent?'dissented':'undecided'):'unaware',
  id='published_purpose_'+hash({groupId:e.id,revisionId:revision.id,
   actorId:member.actorId,day}).slice(0,24),
  q={...q0,id,agencyBefore:before,agencyAfter:t.rngState,
   noticeChance,noticeDraw,noticed,draw,
   supportChance:chances.support,dissentChance:chances.dissent,stance},
  row={id,origin:PUBLISHED_PURPOSE_RESPONSE,revisionId:revision.id,
   memberActorId:member.actorId,memberConsentHash:member.hash,
   day,minute:day*1440,stance,source:q,sourceHash:hash(q)};
 if(!verifyPublishedPurposeResponse(e,row))
  throw Error('Independently noticed public association purpose has no genuine original source');
 e.purposeResponses||=[];e.purposeResponses.push(row);
 if(!validate(e)){
  e.purposeResponses.pop();
  throw Error('An unsourced independent publication cannot enter the original group');
 }
 // Private individual notice processing: a missed notice is not knowledge,
 // and even a noticed member's stance is not a public founder-facing vote.
 return {reviewed:true,noticed,memberActorId:member.actorId,
  revisionId:revision.id,sourceHash:row.sourceHash,
  noFictionalMeeting:true,noPublicMemberDisclosure:true,
  noNewMoneyOrObligation:true};
}

function verifyPurposeResponse(e,row){
 if(row?.origin===PUBLISHED_PURPOSE_RESPONSE)
  return verifyPublishedPurposeResponse(e,row);
 const q=row?.source,ev=q?.witness,d=ev?.details,
  revision=e.purposeHistory?.find(x=>x.id===row?.revisionId);
 if(!q||!revision||!verifyPurposeHistory(e)||
  e.origin!=='player-declaration'||
  row.origin!==PURPOSE_RESPONSE||q.origin!==PURPOSE_RESPONSE||
  row.sourceHash!==hash(q)||row.id!==q.id||
  row.revisionId!==q.revisionId||row.stance!==q.stance||
  row.memberActorId!==q.memberActorId||
  row.memberConsentHash!==q.memberConsentHash||
  row.minute!==q.minute||row.day!==q.day||
  q.groupId!==e.id||q.groupOriginHash!==e.originHash||
  q.revisionSourceHash!==revision.sourceHash||
  q.revisionPurpose!==revision.purpose||
  q.minute<revision.minute||q.day!==Math.floor(q.minute/1440)||
  !Number.isInteger(q.minute)||!Number.isInteger(q.day)||
  q.day<e.foundedDay||
  row.id!=='purpose_response_'+hash({groupId:e.id,
   revisionId:revision.id,actorId:q.memberActorId,
   minute:q.minute}).slice(0,24)||
  typeof q.memberName!=='string'||q.memberName.length<3||
  !Atlas.R[q.regionId]||Atlas.R[q.regionId].polity!==e.polity||
  Atlas.LOCATION_REGION[q.place]!==q.regionId||
  typeof q.discussion!=='string'||q.discussion.trim()!==q.discussion||
  q.discussion.length<30||q.discussion.length>750||
  typeof q.presenceHash!=='string'&&q.presenceHash!==null||
  !['supported','dissented','undecided','unrecorded'].includes(q.previousStance)||
  typeof q.previousResponseHash!=='string'&&q.previousResponseHash!==null||
  !Number.isInteger(q.previousResponseMinute)||
  !Number.isInteger(q.previousResponseDay)||
  !Number.isInteger(q.groupCompletedEfforts)||q.groupCompletedEfforts<0||
  !Number.isInteger(q.groupFailedEfforts)||q.groupFailedEfforts<0||
  !q.worldSnapshot||
  !['pressure','quality','stability','prosperity'].every(k=>
   Number.isFinite(q.worldSnapshot[k])&&
   q.worldSnapshot[k]>=0&&q.worldSnapshot[k]<=100)||
  !Number.isInteger(q.agencyBefore)||q.agencyBefore<1||
  !Number.isInteger(q.agencyAfter)||q.agencyAfter<1||
  typeof q.draw!=='number'||q.draw<0||q.draw>=1||
  !['supported','dissented','undecided'].includes(row.stance)||
  q.noMembersCompelled!==true||q.noLegalMandateOrWork!==true||
  q.noFinancialChanges!==true||
  !ev||hash(ev)!==q.witnessHash||
  ev.type!=='story'||
  d?.origin!=='witnessed-group-purpose-member-discussion'||
  d.groupId!==e.id||d.revisionId!==revision.id||
  d.revisionSourceHash!==revision.sourceHash||
  d.purpose!==revision.purpose||
  d.founder!==e.founder.name||
  d.memberActorId!==row.memberActorId||d.memberName!==q.memberName||
  d.place!==q.place||d.regionId!==q.regionId||
  d.day!==q.day||d.minute!==q.minute||
  d.minutes!==18||d.discussion!==q.discussion||
  d.presenceHash!==q.presenceHash||
  d.noSelectedResponse!==true||
  d.noObligationOrMandate!==true||
  d.noFundsOrWorkGranted!==true)
  return false;
 const member=e.additionalMembers?.find(x=>
  x.actorId===q.memberActorId&&
  x.hash===q.memberConsentHash&&x.name===q.memberName&&
  Number.isInteger(x.witness?.details?.day)&&
  x.witness.details.day<=q.day&&
  (x.active!==false||x.departure?.day>q.day));
 if(!member)return false;
 const c=positionChances({previousStance:q.previousStance,
  groupCompletedEfforts:q.groupCompletedEfforts,
  groupFailedEfforts:q.groupFailedEfforts,
  worldSnapshot:q.worldSnapshot});
 const stance=q.draw<c.support?'supported':
  q.draw<c.support+c.dissent?'dissented':'undecided';
 if(q.supportChance!==c.support||q.dissentChance!==c.dissent||
  q.stance!==stance)return false;
 const Agency=require('./group-member-agency'),t={rngState:q.agencyBefore};
 return Agency.draw(t)===q.draw&&t.rngState===q.agencyAfter;
}
function verifyPurposeResponsesHistory(e){
 if(e.purposeResponses===undefined)return true;
 if(!Array.isArray(e.purposeResponses))return false;
 const seen=[],ids=new Set();
 let previousMinute=-1;
 for(const row of e.purposeResponses){
  const q=row?.source;
  if(!q||!verifyPurposeResponse(e,row)||ids.has(row.id)||
   row.minute<previousMinute)return false;
  const prev=priorPurposeResponse(seen,row.memberActorId);
  if(q.previousStance!==prev.stance||
   q.previousResponseHash!==prev.hash||
   q.previousResponseMinute!==prev.minute||
   q.previousResponseDay!==prev.day||
   row.minute<=prev.minute||
   seen.some(x=>x.memberActorId===row.memberActorId&&
    x.revisionId===row.revisionId&&x.day===row.day&&
    x.stance!=='unaware'&&row.stance!=='unaware'))
   return false;
  ids.add(row.id);seen.push(row);previousMinute=row.minute;
 }
 return true;
}
function considerPurposeRevision(w,{groupId,revisionId,npcId,
 place,minute,discussion,witness}={}){
 const e=lookup(w,groupId),
  revision=e?.purposeHistory?.at(-1),
  member=e?.origin==='player-declaration'?
   e.additionalMembers.find(x=>x.active!==false&&
    x.witness?.details?.npcId===npcId):null,
  day=Math.floor(minute/1440),regionId=Atlas.LOCATION_REGION[place],
  eco=w.ecosystems?.[regionId],host=w.countries?.[e?.polity],
  People=require('./person-presence'),Agency=require('./group-member-agency'),
  person=member?People.resolve(w,npcId,place,day):null;
 const responses=e?.purposeResponses||[],
  previous=member?priorPurposeResponse(responses,member.actorId):null,
  presenceHash=person?.presence?hash(person.presence):null;
 if(!e||!revision||revision.id!==revisionId||
  !member||!person||person.actorId!==member.actorId||
  person.name!==member.name||
  !Number.isInteger(minute)||minute<revision.minute||
  !regionId||!Atlas.R[regionId]||
  Atlas.R[regionId].polity!==e.polity||
  !eco||!host||!previous||
  responses.some(x=>x.memberActorId===member.actorId&&
   x.revisionId===revisionId&&x.day===day&&
   x.stance!=='unaware')||
  typeof discussion!=='string'||discussion.trim()!==discussion||
  discussion.length<30||discussion.length>750||
  !witness||witness.type!=='story'||
  ![eco.pressure,eco.quality,host.stability,host.prosperity]
   .every(x=>Number.isFinite(x)&&x>=0&&x<=100))
  throw Error('A new source-witnessed purpose discussion needs a genuinely present, independently consenting member');
 const q0={origin:PURPOSE_RESPONSE,
  groupId:e.id,groupOriginHash:e.originHash,
  revisionId:revision.id,revisionSourceHash:revision.sourceHash,
  revisionPurpose:revision.purpose,
  memberActorId:member.actorId,memberConsentHash:member.hash,
  memberName:member.name,place,regionId,day,minute,discussion,
  presenceHash,previousStance:previous.stance,
  previousResponseHash:previous.hash,
  previousResponseMinute:previous.minute,
  previousResponseDay:previous.day,
  groupCompletedEfforts:e.completedEfforts,
  groupFailedEfforts:e.failedEfforts,
  worldSnapshot:{pressure:eco.pressure,quality:eco.quality,
   stability:host.stability,prosperity:host.prosperity},
  witness:structuredClone(witness),witnessHash:hash(witness),
  noMembersCompelled:true,noLegalMandateOrWork:true,
  noFinancialChanges:true};
 const agency=Agency.ensure(w),agencyBefore=agency.rngState,
  id='purpose_response_'+hash({groupId:e.id,revisionId:revision.id,
   actorId:member.actorId,minute}).slice(0,24),
  chances=positionChances(q0),draw=Agency.draw(agency),
  stance=draw<chances.support?'supported':
   draw<chances.support+chances.dissent?'dissented':'undecided',
  source={...q0,id,agencyBefore,agencyAfter:agency.rngState,
   supportChance:chances.support,dissentChance:chances.dissent,draw,stance},
  row={id,origin:PURPOSE_RESPONSE,revisionId:revision.id,
   memberActorId:member.actorId,memberConsentHash:member.hash,
   day,minute,stance,source,sourceHash:hash(source)};
 if(!verifyPurposeResponse(e,row))
  throw Error('The real member response and original purpose revision evidence disagree');
 e.purposeResponses||=[];e.purposeResponses.push(row);
 if(!validate(e)){
  e.purposeResponses.pop();
  throw Error('The independent original group view cannot rewrite its history');
 }
 record(ensure(w),e,day,'individual-independent-response-to-purpose',
  {revisionId:revision.id,memberActorId:member.actorId,
   responseHash:row.sourceHash,noBindingVote:true,
   originalFoundingUnchanged:true,noSpentMoney:true},null);
 return {groupId:e.id,revisionId:revision.id,
  memberActorId:member.actorId,memberName:member.name,
  stance,previousStance:previous.stance,
  individualResponse:true,noCollectiveApprovalInferred:true,
  noCompulsoryWorkOrAuthority:true,noGroupFundsChanged:true};
}
function purposeResponseStatus(w,groupId,{day}={}){
 const e=lookup(w,groupId),today=day===undefined?w.lastTickDay:day;
 if(!e||!Number.isInteger(today)||today<e.foundedDay)
  throw Error('Only true locally witnessed group member views can be inspected');
 return {groupId:e.id,foundingPurpose:e.charter.duty,
  responses:(e.purposeResponses||[]).filter(x=>
   x.day<=today&&x.origin===PURPOSE_RESPONSE).map(x=>({
   revisionId:x.revisionId,day:x.day,
   memberActorId:x.memberActorId,memberName:x.source.memberName,
   stance:x.stance,previousStance:x.source.previousStance,
   recordedSourceHash:x.sourceHash})),
  notLegalOrGroupWideVotes:true,
  noMemberCompulsion:true,noMoneyOrCompletedWork:true};
}

function validate(e){
 if(!e||!(TYPES.has(e.origin)||ADAPTERS.has(e.origin))||!Atlas.P[e.polity]||
  !e.charter||e.charter.id!==e.id||e.charter.polity!==e.polity||
  !e.witness||hash(e.witness)!==e.originHash||
  !Number.isInteger(e.foundedDay)||e.foundedDay<0)return false;
 if(!verifyPurposeHistory(e)||!verifyPurposeResponsesHistory(e))return false;
 if(e.treasuryAudit!==undefined&&!verifyTreasuryAudit(e))return false;
 if(e.voluntaryTasks!==undefined&&
  (!Array.isArray(e.voluntaryTasks)||
   e.voluntaryTasks.some(row=>!verifyVoluntaryTask(e,row))||
   new Set(e.voluntaryTasks.map(row=>row.id)).size!==e.voluntaryTasks.length))
  return false;
 if(e.taskServices!==undefined&&
  (!Array.isArray(e.taskServices)||
   e.taskServices.some(row=>!verifyTaskService(e,row))||
   new Set(e.taskServices.map(row=>row.taskId)).size!==e.taskServices.length))
  return false;
 if(e.internalPriorities!==undefined&&
   (!Array.isArray(e.internalPriorities)||
    e.internalPriorities.some(x=>!verifyInternalPriority(e,x))||
    new Set(e.internalPriorities.map(x=>x.id)).size!==e.internalPriorities.length))
  return false;
 if(e.internalPositions!==undefined&&
  (!Array.isArray(e.internalPositions)||
   !verifyInternalPositionHistory(e)))return false;
 if(e.internalRoles!==undefined&&
   (!Array.isArray(e.internalRoles)||
    e.internalRoles.some(x=>!verifyInternalRole(e,x))||
    new Set(e.internalRoles.map(x=>x.id)).size!==e.internalRoles.length))
  return false;
 if(e.priorityWork!==undefined&&
   (!Array.isArray(e.priorityWork)||
    e.priorityWork.some(x=>!verifyPriorityWork(e,x))||
    new Set(e.priorityWork.map(x=>x.originalActionHash)).size!==e.priorityWork.length))
  return false;
 if(e.coordinationReviews!==undefined&&!verifyCoordinationReviewHistory(e))
  return false;
 if(e.coordinationMandates!==undefined&&
  (!Array.isArray(e.coordinationMandates)||
   e.coordinationMandates.some(x=>!verifyCoordinationMandate(e,x))||
   new Set(e.coordinationMandates.map(x=>x.id)).size!==e.coordinationMandates.length))
  return false;
 if(e.origin==='player-declaration'){
  const d=e.witness.details;
  if(e.witness.type!=='story'||d?.origin!=='informal-player-group-founding'||
   d?.id!==e.id||d?.name!==e.charter.name||
   d?.kind!==e.charter.kind||d?.purpose!==e.charter.duty||
   d?.polity!==e.polity||d?.founder!==e.founder.name||
   d?.otherMembersConfirmed!==false||
   e.founder.actorId!=='player'||!Array.isArray(e.additionalMembers)||
   e.members!==1+e.additionalMembers.filter(m=>m?.active!==false).length||
   e.verifiedMembers!==e.members)return false;
  const currentlyActive=new Set(['player']),lastExit={};
  for(const m of e.additionalMembers){
   if(!m||!m.actorId||m.actorId==='player'||
    !m.name||!m.witness||hash(m.witness)!==m.hash||
    !MEMBER_ADAPTERS.has(m.origin)||
    MEMBER_ADAPTERS.get(m.origin)(e,m,m.witness)!==true)return false;
   const joinedDay=Number(m.witness?.details?.day);
   if(lastExit[m.actorId]!==undefined&&
    (!Number.isInteger(joinedDay)||joinedDay<=lastExit[m.actorId]))return false;
   if(m.active===false){
    if(!m.departure||!DEPARTURE_ADAPTERS.has(m.departure.origin)||
     hash(m.departure.witness)!==m.departure.hash||
     DEPARTURE_ADAPTERS.get(m.departure.origin)(e,m,m.departure.witness)!==true)
     return false;
    lastExit[m.actorId]=m.departure.day;
    currentlyActive.delete(m.actorId);
   }else{
    if(currentlyActive.has(m.actorId)||m.departure)return false;
    currentlyActive.add(m.actorId);
   }
  }
 }else if(e.origin==='worker-spinoff'){
  const d=e.witness;
  if(d.kind!=='new-organisation'||d.actorId!==e.founder.actorId||
   d.polity!==e.polity||d.context?.to!==e.id||
   d.context?.workerTransfers<2||
   e.charter.name!==e.knownName||e.founder.actorId==='player')return false;
 }else{
  if(!e.founder?.name||!e.founder?.actorId||
   !Number.isInteger(e.members)||e.members<1||
   !Number.isInteger(e.verifiedMembers)||e.verifiedMembers<1||
   e.members!==e.verifiedMembers||
   !Number.isInteger(e.releaseDay)||e.releaseDay<e.foundedDay||
   typeof e.charter.name!=='string'||typeof e.charter.kind!=='string'||
   typeof e.charter.duty!=='string')return false;
  // A newly authored origin is never accepted by default.
  return ADAPTERS.get(e.origin)(e,e.witness)===true;
 }
 return true;
}
function all(w,{publishedOnly=false,day=Infinity}={}){
 const saved=peek(w);
 return saved?Object.values(saved.entries).filter(e=>
  validate(e)&&(!publishedOnly||e.releaseDay<=day)):[];
}
function lookup(w,id,opts){
 const r=peek(w),e=r?.entries?.[id];
 if(!e||!validate(e))return null;
 if(opts?.publishedOnly&&e.releaseDay>opts.day)return null;
 return e;
}
function record(r,e,day,kind,details,emit,notice=null){
 const id='association_'+(++r.counter);
 const body={id,day,groupId:e.id,polity:e.polity,kind,
  originHash:e.originHash,details};
 const row={...body,hash:hash(body),notice,
  releaseDay:notice?day+6:null};
 r.history.push(row);if(r.history.length>240)r.history.splice(0,r.history.length-240);
 if(notice&&typeof emit==='function')emit({day,region:e.polity,
  subject:'association:'+id,text:notice,channel:'public notice',
  releaseDay:row.releaseDay,severity:'routine'});
 return row;
}

/*
 * #18: existing original association operating funds have ONE balance.
 * Record only real incoming PERSONAL Talons (the original rule debits the
 * actual player's purse), the original independent group-work expense and
 * the real original monthly upkeep. The audit is not another wallet,
 * additional income, tax, voting power or authority over anyone's property.
 *
 * Old saves without these receipts receive a truthful opening balance at
 * the next genuine transaction, NOT a fictional reconstructed history.
 */
const TREASURY_AUDIT='original-association-actual-balance-evidence-v1';
function treasuryReference(q){
 const p=q?.proof;
 if(q.kind==='personal-original-contribution')
  return p?.originalEventHash||null;
 if(q.kind==='original-independent-work-cost')
  return p?.originalReviewHash||null;
 if(q.kind==='original-monthly-upkeep')
  return Number.isInteger(p?.month)?'original-month-'+p.month:null;
 return null;
}
function verifyTreasuryProof(e,q){
 const p=q.proof;
 if(q.kind==='personal-original-contribution'){
  const ev=p?.originalEvent,details=ev?.details;
  return !!ev&&ev.type==='story'&&
   hash(ev)===p.originalEventHash&&
   details?.origin==='actually-attempted-voluntary-group-work'&&
   details.groupId===e.id&&details.actor===e.founder.name&&
   details.coins===q.amount&&details.minutes===45&&
   Number.isFinite(p.playerCoinsBefore)&&
   Number.isFinite(p.playerCoinsAfter)&&
   Math.round((p.playerCoinsBefore-p.playerCoinsAfter)*100)===q.amount*100;
 }
 if(q.kind==='original-independent-work-cost'){
  const rev=p?.originalReview;
  if(!rev||rev.hash!==p.originalReviewHash||
   !['verified-limited-community-work','unverified-community-effort'].includes(rev.kind)||
   rev.groupId!==e.id||rev.originHash!==e.originHash||
   rev.day!==q.day||rev.details?.actualFundsSpent!==q.amount)
   return false;
  const {hash:seal,notice,releaseDay,...body}=rev;
  return hash(body)===seal;
 }
 if(q.kind==='original-monthly-upkeep'){
  return !!p&&Number.isInteger(p.month)&&p.month>=0&&
   Number.isInteger(p.membersAtTick)&&p.membersAtTick>0&&
   p.worldSource==='original-emergent-group-monthly-upkeep'&&
   q.amount===Math.max(1,Math.ceil(p.membersAtTick/8));
 }
 return false;
}
function verifyTreasuryAudit(e,expectedFunds=e.funds){
 const ledger=e?.treasuryAudit;
 if(ledger===undefined)return true;
 const a=ledger?.anchor?.source;
 if(!ledger||ledger.version!==1||
  !a||ledger.anchor.hash!==hash(a)||
  a.origin!==TREASURY_AUDIT||a.groupId!==e.id||
  a.originalGroupHash!==e.originHash||
  a.originalFounder!==e.founder?.name||
  !Number.isInteger(a.day)||a.day<e.foundedDay||
  !Number.isSafeInteger(a.balance)||a.balance<0||
  a.noImaginedEarlierTransactions!==true||
  !Array.isArray(ledger.receipts))return false;
 let balance=a.balance,lastDay=a.day;
 const keys=new Set();
 for(const row of ledger.receipts){
  const q=row?.source,reference=treasuryReference(q);
  if(!q||row.sourceHash!==hash(q)||q.origin!==TREASURY_AUDIT||
   q.groupId!==e.id||q.originalGroupHash!==e.originHash||
   q.day<lastDay||!Number.isInteger(q.day)||
   !Number.isSafeInteger(q.amount)||q.amount<=0||
   q.reference!==reference||typeof reference!=='string'||
   q.id!=='groupfund_'+hash({groupId:e.id,kind:q.kind,reference}).slice(0,22)||
   row.id!==q.id||row.kind!==q.kind||
   keys.has(q.kind+':'+reference)||
   q.before!==balance||
   q.after!==(q.kind==='personal-original-contribution'?
    balance+q.amount:balance-q.amount)||
   !Number.isSafeInteger(q.after)||q.after<0||
   !verifyTreasuryProof(e,q))return false;
  keys.add(q.kind+':'+reference);
  balance=q.after;lastDay=q.day;
 }
 return Number.isSafeInteger(expectedFunds)&&expectedFunds===balance;
}
function openTreasuryAudit(e,day){
 if(e.origin!=='player-declaration'||!Number.isInteger(day)||
  day<e.foundedDay||!Number.isSafeInteger(e.funds)||e.funds<0)
  throw Error('Only original real voluntary association funds can be reconciled');
 if(e.treasuryAudit===undefined){
  const q={origin:TREASURY_AUDIT,groupId:e.id,
   originalGroupHash:e.originHash,originalFounder:e.founder.name,
   day,balance:e.funds,noImaginedEarlierTransactions:true,
   note:'Exact existing opening balance; earlier movements not reconstructed if this is a migrated save'};
  e.treasuryAudit={version:1,anchor:{source:q,hash:hash(q)},receipts:[]};
 }
 if(!verifyTreasuryAudit(e))
  throw Error('Original association treasury does not reconcile with actual recorded funds');
 return e.treasuryAudit;
}
function addTreasuryReceipt(e,{kind,day,amount,before,proof}={}){
 // Called by original rule/world modules AFTER the real balance changes.
 // The caller cannot provide desired outcome, new funds or member assent.
 if(!e?.treasuryAudit||!verifyTreasuryAudit(e,before)||
  !Number.isInteger(day)||day<e.treasuryAudit.anchor.source.day||
  !Number.isSafeInteger(amount)||amount<=0||
  !Number.isSafeInteger(before)||before<0||
  !proof||typeof proof!=='object')
  throw Error('A matching original cash movement and prior verified balance are required');
 const reference=treasuryReference({kind,proof}),
  q={origin:TREASURY_AUDIT,groupId:e.id,
   originalGroupHash:e.originHash,kind,day,amount,before,
   after:e.funds,reference,proof:structuredClone(proof)};
 q.id='groupfund_'+hash({groupId:e.id,kind,reference}).slice(0,22);
 const row={id:q.id,kind,source:q,sourceHash:hash(q)};
 if(e.treasuryAudit.receipts.some(x=>x.id===q.id))
  throw Error('An original source cannot be spent or received twice');
 e.treasuryAudit.receipts.push(row);
 if(!verifyTreasuryAudit(e)){
  e.treasuryAudit.receipts.pop();
  throw Error('Original treasury source does not match real payer or world expenditure');
 }
 return row;
}
function treasuryAuditStatus(w,groupId){
 const e=lookup(w,groupId);
 if(!e||e.origin!=='player-declaration')
  throw Error('Only real player-founded association funds have this original wallet receipt');
 const journal=e.treasuryAudit;
 return {groupId:e.id,originalFounder:e.founder.name,
  currentOperatingFunds:e.funds,
  noIndependentNewMoney:true,noAutomaticMemberSpendingPermission:true,
  auditedSinceDay:journal?.anchor.source.day??null,
  openingBalance:journal?.anchor.source.balance??e.funds,
  earlierMovementsUnreconstructed:!journal||journal.anchor.source.balance>0,
  knownMovements:(journal?.receipts||[]).map(x=>({
   id:x.id,day:x.source.day,kind:x.kind,
   amount:x.source.amount,balanceAfter:x.source.after,
   sourceHash:x.sourceHash})),
  note:'Original association operating funds, not another treasury account, different currency, free revenue or grant of legal title.'};
}


/*
 * Original organisational command has human limits: a witnessed member
 * may independently accept or decline an open-ended work invitation.
 * This is not a legal appointment, binding order, fee, payroll, work
 * accomplishment or any compulsory use of another person's time.
 *
 * A later actual ordinary member service, if it happens independently,
 * may reference the accepted task without creating one extra work check.
 */
const VOLUNTARY_TASK='original-witnessed-voluntary-member-task-request-v1';
const COORDINATOR_TASK='original-witnessed-independent-coordinator-member-task-invitation-v1';
const TASK_SERVICE='original-monthly-member-work-task-link-v1';
const taskClamp=x=>Math.max(.15,Math.min(.78,x));
function voluntaryTaskChance(q){
 return taskClamp(.42+(q.groupStatusAtOffer==='inactive'?-.12:.07)+
  (q.groupCompletedEfforts>q.groupFailedEfforts?.07:0));
}
/*
 * #18: the same genuinely elected/consented operational coordinator may
 * decide INDEPENDENTLY whether to request a specific voluntary task from
 * another already-consenting actual member. This is no legal command,
 * automatic attendance, wage, treasury permission, or new work roll.
 *
 * Keep the existing voluntaryTasks ledger and original sixday/month
 * actual-work attribution. The GM can freely author an appropriate
 * opportunity: it is not a predefined profession or task catalogue.
 */
function coordinatorTaskOfferChance(q){
 return taskClamp(.36+
  Math.min(4,q.scopeOverlap)*.065+
  (q.groupStatusAtOffer==='inactive'?-.13:.05)+
  (q.groupCompletedEfforts>q.groupFailedEfforts?.05:0));
}
function verifyCoordinatorTask(e,row){
 const ev=row?.witness,q=ev?.details,
  role=e.coordinationMandates?.find(x=>x.id===q?.mandateId),
  issuer=e.additionalMembers?.find(x=>
   x.actorId===q?.issuerActorId&&x.hash===q?.issuerMembershipHash),
  recipient=e.additionalMembers?.find(x=>
   x.actorId===q?.memberActorId&&x.hash===q?.memberConsentHash);
 if(!q||!role||!issuer||!recipient||
  e.origin!=='player-declaration'||
  row.origin!==COORDINATOR_TASK||q.origin!==COORDINATOR_TASK||
  row.witnessHash!==hash(ev)||ev.type!=='story'||
  row.id!==q.id||row.day!==q.day||row.untilDay!==q.untilDay||
  row.task!==q.task||row.decision!==q.decision||
  row.memberActorId!==q.memberActorId||
  row.memberConsentHash!==q.memberConsentHash||
  row.npcId!==q.npcId||
  q.groupId!==e.id||q.groupOriginHash!==e.originHash||
  q.originalFounder!==e.founder.name||
  q.mandateSourceHash!==role.sourceHash||
  q.issuerActorId!==role.memberActorId||
  q.issuerMembershipHash!==role.originalMembershipHash||
  q.issuerName!==issuer.name||q.memberName!==recipient.name||
  q.issuerNpcId!==issuer.witness?.details?.npcId||
  q.npcId!==recipient.witness?.details?.npcId||
  q.issuerActorId===q.memberActorId||
  !role.agreed||!verifyCoordinationMandate(e,role)||
  q.roleScope!==role.scope||
  q.day<role.startDay||q.day>role.untilDay||
  (issuer.active===false&&issuer.departure?.day<=q.day)||
  (recipient.active===false&&recipient.departure?.day<=q.day)||
  e.coordinationReviews?.some(x=>
   x.mandateId===role.id&&x.resigned&&x.day<=q.day)||
  !Number.isInteger(q.minute)||q.minute<0||
  !Number.isInteger(q.day)||q.day!==Math.floor(q.minute/1440)||
  q.day<e.foundedDay||
  !Number.isInteger(q.untilDay)||q.untilDay<q.day||
  q.untilDay>10000000||
  typeof q.task!=='string'||q.task.trim()!==q.task||
  q.task.length<30||q.task.length>750||
  q.minutes!==20||q.founderWasPresent!==true||
  q.issuerWasPresent!==true||q.recipientWasPresent!==true||
  typeof q.scopeOverlap!=='number'||!Number.isInteger(q.scopeOverlap)||
  q.scopeOverlap<0||q.scopeOverlap>4||
  !Atlas.R[q.regionId]||Atlas.R[q.regionId].polity!==e.polity||
  Atlas.LOCATION_REGION[q.place]!==q.regionId||
  typeof q.issuerPresenceHash!=='string'&&q.issuerPresenceHash!==null||
  typeof q.recipientPresenceHash!=='string'&&q.recipientPresenceHash!==null||
  !['organising','inactive','active','operating'].includes(q.groupStatusAtOffer)||
  !Number.isInteger(q.groupCompletedEfforts)||q.groupCompletedEfforts<0||
  !Number.isInteger(q.groupFailedEfforts)||q.groupFailedEfforts<0||
  !Number.isInteger(q.agencyBefore)||q.agencyBefore<1||
  !Number.isInteger(q.agencyAfter)||q.agencyAfter<1||
  typeof q.issuerDraw!=='number'||q.issuerDraw<0||q.issuerDraw>=1||
  q.issuerChance!==coordinatorTaskOfferChance(q)||
  q.issuerAgreed!==(q.issuerDraw<q.issuerChance)||
  !['accepted','declined','considering','not-offered'].includes(row.decision)||
  q.noCompulsoryWork!==true||q.noAutomaticPayOrStatus!==true||
  q.noNewWorkResult!==true||q.noNewGroupFundsSpent!==true||
  q.noPublicOfficeOrTreasuryPower!==true||
  q.noPlayerSelectedNpcAnswers!==true||
  !/^[a-z][a-z0-9_-]{5,80}$/.test(row.id)||
  row.id!=='group_coordtask_'+hash({groupId:e.id,mandateId:role.id,
   recipientActorId:recipient.actorId,minute:q.minute,task:q.task}).slice(0,23))
  return false;
 const Agency=require('./group-member-agency'),rng={rngState:q.agencyBefore},
  originalOverlap=Math.min(4,Agency._debug.common(role.scope,q.task));
 if(q.scopeOverlap!==originalOverlap||
  Agency.draw(rng)!==q.issuerDraw)return false;
 if(q.issuerAgreed){
  if(typeof q.recipientDraw!=='number'||q.recipientDraw<0||
   q.recipientDraw>=1||q.recipientChance!==voluntaryTaskChance(q)||
   Agency.draw(rng)!==q.recipientDraw)return false;
  const response=q.recipientDraw<q.recipientChance?'accepted':
   q.recipientDraw<Math.min(.92,q.recipientChance+.25)?
    'considering':'declined';
  if(q.decision!==response)return false;
 }else if(q.recipientDraw!==null||q.recipientChance!==null||
  q.decision!=='not-offered')return false;
 return rng.rngState===q.agencyAfter;
}
function verifyVoluntaryTask(e,row){
 if(row?.origin===COORDINATOR_TASK)return verifyCoordinatorTask(e,row);
 const ev=row?.witness,q=ev?.details;
 if(!q||e.origin!=='player-declaration'||
  row.origin!==VOLUNTARY_TASK||
  row.witnessHash!==hash(ev)||
  ev.type!=='story'||q.origin!==VOLUNTARY_TASK||
  q.id!==row.id||q.groupId!==e.id||
  q.groupOriginHash!==e.originHash||
  q.founder!==e.founder.name||
  q.memberActorId!==row.memberActorId||
  q.memberConsentHash!==row.memberConsentHash||
  q.decision!==row.decision||
  !/^[a-z][a-z0-9_-]{5,80}$/.test(row.id)||
  !Number.isInteger(q.day)||q.day<e.foundedDay||
  q.day!==row.day||q.untilDay!==row.untilDay||
  !Number.isInteger(q.untilDay)||q.untilDay<q.day||q.untilDay>10000000||
  typeof q.task!=='string'||q.task.trim().length<30||
  q.task.length>750||q.task!==row.task||
  q.minutes!==18||q.issuerActorId!=='player'||
  q.issuerWasPresent!==true||
  q.noCompulsoryWork!==true||q.noAutomaticPayOrStatus!==true||
  q.noNewWorkResult!==true||q.noNewGroupFundsSpent!==true||
  !Atlas.R[q.regionId]||Atlas.R[q.regionId].polity!==e.polity||
  Atlas.LOCATION_REGION[q.place]!==q.regionId||
  q.npcId!==row.npcId||
  typeof q.memberName!=='string'||q.memberName.length<3||
  !Number.isInteger(q.agencyBefore)||q.agencyBefore<1||
  !Number.isInteger(q.agencyAfter)||q.agencyAfter<1||
  typeof q.draw!=='number'||q.draw<0||q.draw>=1||
  !['accepted','declined','considering'].includes(row.decision)||
  !['organising','inactive','active','operating'].includes(q.groupStatusAtOffer)||
  !Number.isInteger(q.groupCompletedEfforts)||q.groupCompletedEfforts<0||
  !Number.isInteger(q.groupFailedEfforts)||q.groupFailedEfforts<0||
  q.acceptChance!==voluntaryTaskChance(q))
  return false;
 const member=e.additionalMembers?.find(m=>
  m.actorId===row.memberActorId&&
  m.hash===row.memberConsentHash&&m.name===q.memberName&&
  m.witness?.details?.npcId===q.npcId&&
  m.witness.details.day<=q.day&&
  (m.active!==false||m.departure?.day>q.day));
 if(!member)return false;
 const Agency=require('./group-member-agency'),test={rngState:q.agencyBefore},
  x=Agency.draw(test),answer=x<q.acceptChance?'accepted':
   x<Math.min(.92,q.acceptChance+.25)?'considering':'declined';
 return x===q.draw&&test.rngState===q.agencyAfter&&
  answer===row.decision;
}
function recordVoluntaryTask(w,groupId,event){
 const e=lookup(w,groupId),q=event?.details;
 if(!e||!q||q.groupId!==groupId)
  throw Error('Only a real witnessed task request inside an original association can be registered');
 const row={id:q.id,origin:q.origin===COORDINATOR_TASK?
   COORDINATOR_TASK:VOLUNTARY_TASK,
  memberActorId:q.memberActorId,
  memberConsentHash:q.memberConsentHash,npcId:q.npcId,
  day:q.day,untilDay:q.untilDay,task:q.task,
  decision:q.decision,witness:structuredClone(event),
  witnessHash:hash(event)};
 if(!verifyVoluntaryTask(e,row)||
  (e.voluntaryTasks||[]).some(x=>x.id===row.id||
   x.memberActorId===row.memberActorId&&x.day===row.day))
  throw Error('The real member has already responded today or this proposed work lacks personal independent consent');
 e.voluntaryTasks||=[];e.voluntaryTasks.push(row);
 if(!validate(e))throw Error('An unsourced volunteer task must not change real group activity');
 record(ensure(w),e,row.day,
  row.origin===COORDINATOR_TASK?
   'independently-considered-coordinator-volunteer-request':
   'personally-offered-voluntary-group-task',
  {taskId:row.id,memberActorId:row.memberActorId,
   independentlyAnswered:row.decision,
   witnessHash:row.witnessHash,
   noAutomaticWorkOrFee:true},null);
 return {taskId:row.id,decision:row.decision,
  accepted:row.decision==='accepted',
  noGuaranteedWork:true,noGroupFundsSpent:true,
  noBindingCommand:true};
}
function eligibleVoluntaryTask(e,memberActorId,day){
 if(!Number.isInteger(day))return null;
 return (e.voluntaryTasks||[]).find(row=>
  row.decision==='accepted'&&
  row.memberActorId===memberActorId&&
  day>row.day&&day<=row.untilDay&&
  !(e.taskServices||[]).some(x=>x.taskId===row.id))||null;
}
function verifyTaskService(e,row){
 const q=row?.source,task=e.voluntaryTasks?.find(t=>t.id===row?.taskId),
  work=q?.originalWork;
 if(!q||!task||task.decision!=='accepted'||
  row.origin!==TASK_SERVICE||
  row.sourceHash!==hash(q)||q.origin!==TASK_SERVICE||
  q.groupId!==e.id||q.groupOriginHash!==e.originHash||
  row.taskId!==q.taskId||q.taskId!==task.id||
  row.memberActorId!==task.memberActorId||
  q.memberConsentHash!==task.memberConsentHash||
  q.taskWitnessHash!==task.witnessHash||
  !work||work.groupId!==e.id||
  !['verified-volunteer-work','unsuccessful-volunteer-work'].includes(work.kind)||
  work.day<=task.day||work.day>task.untilDay||
  work.details?.memberId!==task.memberActorId||
  work.details?.priorAcceptanceHash!==task.memberConsentHash||
  work.details?.voluntaryTaskId!==task.id||
  work.details?.voluntaryTaskWitnessHash!==task.witnessHash||
  work.details?.actualWorkMinutes!==90||
  work.details?.dc!==14||
  !Number.isInteger(work.details?.roll)||work.details.roll<1||
  work.details.roll>20||
  typeof work.details?.success!=='boolean'||
  work.details?.success!==(work.kind==='verified-volunteer-work')||
  q.actualWorkHash!==work.hash||
  q.noSecondWorkOrPay!==true||
  q.taskSpecificCompletionNotEstablished!==true)
  return false;
 const {hash:sourceHash,notice,releaseDay,...body}=work;
 return hash(body)===sourceHash;
}
function retainOriginalTaskService(e,taskId,actualGroupEvent){
 const task=e.voluntaryTasks?.find(x=>x.id===taskId);
 if(!task||!verifyVoluntaryTask(e,task)||
  task.decision!=='accepted'||!actualGroupEvent||
  (e.taskServices||[]).some(x=>x.taskId===taskId))
  throw Error('Only the original independently completed volunteer service may be linked once');
 const q={origin:TASK_SERVICE,groupId:e.id,groupOriginHash:e.originHash,
  taskId,memberConsentHash:task.memberConsentHash,
  taskWitnessHash:task.witnessHash,
  actualWorkHash:actualGroupEvent.hash,
  originalWork:structuredClone(actualGroupEvent),
  noSecondWorkOrPay:true,
  taskSpecificCompletionNotEstablished:true};
 const row={origin:TASK_SERVICE,taskId,
  memberActorId:task.memberActorId,source:q,sourceHash:hash(q)};
 if(!verifyTaskService(e,row))
  throw Error('Only a source-corroborated original world service can be linked to a group invitation');
 e.taskServices||=[];e.taskServices.push(row);
 if(!validate(e))throw Error('Group task linked to non-original member work');
 return row;
}
function voluntaryTaskStatus(w,groupId,{day}={}){
 const e=lookup(w,groupId);
 if(!e||e.origin!=='player-declaration')
  throw Error('Original witnessed private group tasks are required');
 const today=day===undefined?w.lastTickDay:day;
 if(!Number.isInteger(today)||today<e.foundedDay||today>w.lastTickDay)
  throw Error('Original elapsed world day required for task history');
 return (e.voluntaryTasks||[]).filter(x=>x.day<=today).map(x=>{
  const result=(e.taskServices||[]).find(z=>z.taskId===x.id&&
   z.source.originalWork.day<=today);
  const m=e.additionalMembers?.find(z=>z.actorId===x.memberActorId&&
   z.hash===x.memberConsentHash);
  const departed=m?.active===false&&m.departure?.day<=today;
  return {taskId:x.id,memberActorId:x.memberActorId,
   task:x.task,individualDecision:x.decision,
   issuerActorId:x.origin===COORDINATOR_TASK?
    x.witness.details.issuerActorId:'player',
   noCoordinatorCommandPower:true,
   untilDay:x.untilDay,
   status:result?
    result.source.originalWork.details.success?
     'original-member-work-recorded-task-not-verified':
     'original-member-work-failed-task-not-verified':
    x.decision!=='accepted'?x.decision:
    departed?'ended-after-member-departure':
    today>x.untilDay?'expired-without-recorded-work':
    'freely-accepted-not-guaranteed',
   originalServiceHash:result?.source.actualWorkHash||null,
   originalMinutes:result?.source.originalWork.details.actualWorkMinutes||0,
   specificTaskCompletionVerified:false,
   noCompulsoryService:true,noNewWorkOrMoney:true};
 });
}

function createPlayer(w,{id,name,kind,purpose,founder,place,day,event}){
 const r=ensure(w),polity=Atlas.R[Atlas.LOCATION_REGION[place]||
  (Atlas.R[place]?place:w.livedPlaces?.places?.[place]?.regionId)]?.polity;
 if(!polity||!name||!kind||!purpose||!founder||!event||r.entries[id])
  throw Error('An actual local founder and unique witnessed group declaration are required');
 if(Object.prototype.hasOwnProperty.call(w.houses||{},id))
  throw Error('An existing household identity cannot be overwritten');
 const charter={id,polity,name,kind,role:purpose,duty:purpose,
  elder:founder,relative:null,relation:null,dispute:null,
  heritage:'unverified; no supernatural or hereditary trait established',
  politicalStatus:'informal, self-described; no official recognition',
  membershipRule:'individual consent, not a surname or declaration by someone else',
  authorityRule:'no government or legal house office follows from this founding',
  source:SOURCE_PLAYER};
 const e={id,polity,origin:'player-declaration',charter,
  founder:{actorId:'player',name:founder},members:1,verifiedMembers:1,
  additionalMembers:[],voluntaryTasks:[],taskServices:[],internalPriorities:[],internalPositions:[],internalRoles:[],priorityWork:[],coordinationMandates:[],coordinationReviews:[],
  funds:0,activity:[],workSessions:0,completedEfforts:0,failedEfforts:0,
  status:'organising',unfundedMonths:0,foundedDay:day,
  releaseDay:day+2,originHash:hash(event),witness:structuredClone(event)};
 if(!validate(e))throw Error('This founding lacks an original witnessed declaration');
 r.entries[id]=e;
 w.houses||={};w.houses[id]={influence:1,publicPressure:45,
  projectProgress:0,cycles:0,lastChangeDay:day,
  publicMilestones:[],lastUpdated:day};
 record(r,e,day,'formed',{
  founder,place,purpose,kind,onlyKnownConsentingMembers:1,
  noLegalOrBloodlineRecognition:true},null);
 return e;
}
function registerFromEvidence(w,{id,polity,name,kind,purpose,
 founderName,founderId,memberCount=1,funds=0,foundedDay,releaseDay,
 origin,witness}){
 // Server/world-rule modules only: an adapter must have independently
 // checked the original source and every claimed consenting membership.
 // This is intentionally NOT an unrestricted user-origin rule operation.
 const checker=ADAPTERS.get(origin),r=ensure(w);
 if(!checker||!w.countries?.[polity]||
  typeof id!=='string'||!/^[a-z][a-z0-9_-]{6,100}$/.test(id)||
  r.entries[id]||w.houses?.[id]||
  typeof name!=='string'||name.trim().length<3||
  typeof kind!=='string'||kind.trim().length<3||
  typeof purpose!=='string'||purpose.trim().length<8||
  typeof founderName!=='string'||!founderName.trim()||
  typeof founderId!=='string'||!founderId.trim()||
  !Number.isInteger(memberCount)||memberCount<1||
  !Number.isInteger(funds)||funds<0||
  !Number.isInteger(foundedDay)||foundedDay<0||
  !Number.isInteger(releaseDay)||releaseDay<foundedDay||
  !witness||typeof witness!=='object')
  throw Error('A real witnessed origin and locally valid people are required; new groups are not catalogue entries');
 const charter={id,polity,name:name.trim(),kind:kind.trim(),
  role:purpose.trim(),duty:purpose.trim(),
  elder:founderName.trim(),relative:null,relation:null,
  dispute:null,heritage:null,
  politicalStatus:'status remains unverified pending actual local law',
  membershipRule:'only actually attested consenting people count',
  authorityRule:'no inherited title, public office or power from group creation',
  source:'Runtime entity with a separately registered real-world origin attestation'};
 const e={id,polity,origin,charter,
  founder:{actorId:founderId,name:founderName.trim()},
  members:memberCount,verifiedMembers:memberCount,
  funds,activity:[],workSessions:0,completedEfforts:0,failedEfforts:0,
  status:'organising',unfundedMonths:0,foundedDay,releaseDay,
  originHash:hash(witness),witness:structuredClone(witness)};
 if(!validate(e))throw Error('Unverified original scene or individual consent cannot found a new world entity');
 r.entries[id]=e;
 w.houses||={};w.houses[id]={influence:1,
  publicPressure:45,projectProgress:0,cycles:0,lastChangeDay:foundedDay,
  publicMilestones:[],lastUpdated:foundedDay};
 record(r,e,foundedDay,'source-attested-formation',{
  sourceOrigin:origin,memberCount,founderId,
  noInferredKinship:true,noAutomaticLegalRights:true},null);
 return e;
}
function admitMemberFromEvidence(w,groupId,{actorId,name,origin,witness}){
 // A future NPC dialogue/relationship module may register *real*
 // independently witnessed assent. The public player rule API does not
 // allow the founder to select a favourable NPC answer.
 const e=lookup(w,groupId),r=ensure(w);
 if(!e||e.origin!=='player-declaration'||!MEMBER_ADAPTERS.has(origin)||
  typeof actorId!=='string'||actorId==='player'||!actorId.trim()||
  typeof name!=='string'||!name.trim()||!witness||
  e.additionalMembers.some(m=>m.actorId===actorId&&m.active!==false))
  throw Error('Only a separately identified, independently consenting new participant can join');
 const latest=e.additionalMembers.filter(m=>m.actorId===actorId).at(-1);
 if(latest&&(!latest.departure||
  !Number.isInteger(witness?.details?.day)||
  witness.details.day<=latest.departure.day))
  throw Error('A returning former participant needs a new, later personally witnessed choice');
 const m={actorId,name:name.trim(),origin,active:true,
  hash:hash(witness),witness:structuredClone(witness)};
 if(MEMBER_ADAPTERS.get(origin)(e,m,m.witness)!==true)
  throw Error('No genuine personally witnessed acceptance supports membership');
 const previous=e.members;
 e.additionalMembers.push(m);
 e.members++;e.verifiedMembers=e.members;
 if(!validate(e)){
  e.additionalMembers.pop();e.members=previous;e.verifiedMembers=previous;
  throw Error('The new membership would invalidate the original independent founding');
 }
 record(r,e,Math.max(e.foundedDay,Number(m.witness.day)||0),
  'personally-consented-member',{
   actorId,memberWitnessHash:m.hash,
   noInferredFamilyAncestry:true,noInheritedAbility:true},null);
 return {joined:true,groupId:e.id,actorId,verifiedMembers:e.members,
  noInferredKinship:true,noLegalTitle:true};
}
function departMemberFromEvidence(w,groupId,{actorId,origin,witness,day,emit}){
 // An independently determined departure, not player-selected removal.
 const e=lookup(w,groupId),r=ensure(w);
 const m=e?.origin==='player-declaration'?
  e.additionalMembers.find(x=>x.actorId===actorId&&x.active!==false):null;
 if(!m||!DEPARTURE_ADAPTERS.has(origin)||!witness||
  !Number.isInteger(day)||day<e.foundedDay)
  throw Error('A real independent member must freely and verifiably choose to leave');
 const departure={origin,hash:hash(witness),witness:structuredClone(witness),
  day,releaseDay:day+6};
 if(DEPARTURE_ADAPTERS.get(origin)(e,{...m,departure},departure.witness)!==true)
  throw Error('An independently witnessed departure is required; the founder cannot dismiss people by claim');
 m.active=false;m.departure=departure;e.members--;e.verifiedMembers=e.members;
 if(!validate(e)){
  m.active=true;m.departure=null;e.members++;e.verifiedMembers=e.members;
  throw Error('The asserted departure would contradict the saved membership evidence');
 }
 record(r,e,day,'independent-member-departure',
  {actorId,memberAcceptanceHash:m.hash,departureWitnessHash:departure.hash,
   memberConsentWithdrawn:true,noAutomaticDisinheritance:true},emit,
  m.name+' has independently stepped back from active participation in '+
   e.charter.name+'. Previous contributions remain in the record; no family or legal status changes.');
 return {left:true,groupId,actorId,activeMembers:e.members};
}
function reportedMemberCount(e,day){
 if(e.origin!=='player-declaration')return e.members;
 return 1+e.additionalMembers.filter(m=>
  m.active!==false||m.departure?.releaseDay>day).length;
}
function syncWorkerFounders(w,day,emit){
 const t=w.agentInitiatives,r=ensure(w);
 if(!t?.entrants)return 0;
 let added=0;
 for(const entrant of Object.values(t.entrants)){
  const id=entrant.id;
  if(r.entries[id])continue;
  const n=w.notables?.[entrant.founderId],
   project=t.projects?.[entrant.founderId];
  const origin=t.records?.find(x=>x.kind==='new-organisation'&&
   x.context?.to===id&&x.actorId===entrant.founderId);
  // Existing positive worker split: actual colleagues moved, the founder
  // has verified work, and no other people are invented or enrolled.
  if(!n||!project||project.successes<2||!origin||
   origin.hash!==hash({id:origin.id,day:origin.day,month:origin.month,
    actorId:origin.actorId,actorName:origin.actorName,
    polity:origin.polity,kind:origin.kind,
    source:origin.source,method:origin.method,context:origin.context})||
   entrant.members<2||entrant.founderId!==n.id||
   entrant.polity!==n.polity)continue;
  const charter={id,polity:n.polity,name:entrant.name,
   kind:'independent vocational collective',role:entrant.independentWork,
   duty:entrant.independentWork,elder:n.name,
   relative:null,relation:null,dispute:null,heritage:null,
   politicalStatus:'independent worker circle; not a noble house',
   membershipRule:'real existing voluntary worker transfers only',
   authorityRule:'no guild monopoly, title, lineage or public office granted',
   source:SOURCE_NPC};
  const e={id,polity:n.polity,origin:'worker-spinoff',charter,
   founder:{actorId:n.id,name:n.name},knownName:entrant.name,
   members:entrant.members,verifiedMembers:entrant.members,
   funds:entrant.funds,status:entrant.status,
   activity:[],workSessions:0,completedEfforts:0,failedEfforts:0,
   unfundedMonths:0,foundedDay:entrant.foundedDay,
   releaseDay:origin.releaseDay,originHash:hash(origin),
   witness:structuredClone(origin)};
  if(!validate(e))continue;
  r.entries[id]=e;
  // The worker circle has a separate active *institution* in agentInitiatives.
  // Do not add the same members or money twice; house standing is visibility,
  // NOT another account that may spend the founding workers' funds.
  w.houses||={};w.houses[id]={influence:Math.max(1,Math.floor(entrant.reputation/8)),
   publicPressure:40,projectProgress:0,cycles:0,
   lastChangeDay:day,publicMilestones:[],lastUpdated:day};
  record(r,e,day,'worker-origin-linked',{originId:origin.id,
   genuineTransfers:entrant.members,realFounder:n.name,
   independentlyFunded:true},null);
  added++;
 }
 return added;
}
function month(w,day,emit){
 const r=ensure(w);
 for(const e of all(w)){
  const standing=w.houses[e.id],host=w.countries[e.polity];
  if(!standing||!host)continue;
  if(e.origin==='worker-spinoff'){
   const actual=w.agentInitiatives?.entrants?.[e.id];
   if(!actual)continue;
   e.members=actual.members;e.funds=actual.funds;e.status=actual.status;
   standing.influence=clamp(Math.floor(actual.reputation/7)+
      Math.floor(actual.members/15));
   standing.lastUpdated=day;
   continue;
  }
  // Informal, even self-described family/kin names, are not assumed to
  // contain consenting relatives. There is no automatic spouse/worker spawn.
  if(e.activity.length){
   // Every contribution is the original witnessed player action, not
   // manually inserted narrative, free funds, or unperformed work.
   if(!e.activity.every(a=>a.witness?.type==='story'&&
    a.witness.details?.origin==='actually-attempted-voluntary-group-work'&&
    a.witness.details?.groupId===e.id&&
    a.witness.details?.actor===e.founder.name&&
    a.witness.details?.minutes===45&&
    a.witness.details?.coins===a.amount&&
    a.witness.details?.activity===a.activity&&
    a.minutes===45&&a.amount>=0&&
    hash(a.witness)===a.hash&&
    (a.priorityId===undefined||
      a.witness.details?.priorityId===a.priorityId&&
      e.internalPriorities?.some(p=>
        p.id===a.priorityId&&p.supported&&
        p.day<=a.day))))
    throw Error('Unverified group work or unsupported priority link cannot create historical progress');
   const attempts=e.activity.splice(0);
   const available=e.funds,effort=attempts.reduce((v,a)=>v+a.minutes,0),
    cost=Math.min(available,Math.max(1,Math.ceil(effort/90)));
   if(cost>0)openTreasuryAudit(e,day);
   e.funds-=cost;
   const chance=clamp(.21+effort/240+(host.stability>=55?.08:0)+
      Math.min(available,12)*.012,.12,.76);
   const x=draw(r),success=x<chance;
   e.workSessions+=attempts.length;
   if(success){
    e.completedEfforts++;
    standing.influence=clamp(standing.influence+1);
    standing.publicPressure=clamp(standing.publicPressure-2);
   }else e.failedEfforts++;
   const independentReview=record(r,e,day,
    success?'verified-limited-community-work':'unverified-community-effort',
    {actualEffortMinutes:effort,actualFundsSpent:cost,
     result:success?'limited shared work, not the truth of every proposal':'no independently verified result',
     decisionDraw:x,chance,
     originalActionHashes:attempts.map(a=>a.hash)},
    emit,success?
     e.charter.name+' reports limited independently checked local work supported by actual witnessed effort' +
      '. No family rank, inherited power or legal office follows.':null);
   if(cost>0)addTreasuryReceipt(e,{
    kind:'original-independent-work-cost',day,amount:cost,
    before:available,
    proof:{originalReview:structuredClone(independentReview),
     originalReviewHash:independentReview.hash}});
   for(const work of attempts){
    if(work.priorityId===undefined)continue;
    const priority=e.internalPriorities.find(p=>p.id===work.priorityId);
    if(!priority?.supported)throw Error('A dissenting member cannot be made to sponsor a priority');
    const witness={
     origin:PRIORITY_WORK,groupId:e.id,
     groupOriginHash:e.originHash,
     priorityId:priority.id,prioritySourceHash:priority.sourceHash,
     independentMemberActorId:priority.memberActorId,
     originalActionHash:work.hash,originalAction:structuredClone(work),
     independentReviewHash:independentReview.hash,
     independentReview:structuredClone(independentReview),
     day,groupReviewCost:cost,
     originalGroupBalanceBeforeReview:available,
     noExtraCostOrFreeProgress:true,
     noCompulsoryMemberParticipation:true};
    const row={priorityId:priority.id,origin:PRIORITY_WORK,
     originalActionHash:work.hash,
     independentReviewHash:independentReview.hash,
     source:witness,sourceHash:hash(witness)};
    e.priorityWork||=[];
    if(!verifyPriorityWork(e,row))throw Error('The new work evidence does not match the original independent result');
    e.priorityWork.push(row);
   }
  }
  const upkeep=e.members>0?Math.max(1,Math.ceil(e.members/8)):0;
  if(e.funds>=upkeep&&upkeep){
   openTreasuryAudit(e,day);
   const balanceBeforeUpkeep=e.funds;
   e.funds-=upkeep;
   addTreasuryReceipt(e,{
    kind:'original-monthly-upkeep',day,amount:upkeep,
    before:balanceBeforeUpkeep,
    proof:{month:w.ticks.months,membersAtTick:e.members,
     worldSource:'original-emergent-group-monthly-upkeep'}});
   e.unfundedMonths=0;e.status='organising';
  }
  else{e.unfundedMonths++;e.status='inactive';}
  // Inactivity means no sustained operations, NOT forced loss of a surname,
  // kinship, accumulated history or legal dissolution.
  standing.lastUpdated=day;
 }
 return r;
}

/*
 * First #18 bridge: internally witnessed organisational priorities and
 * independent member assent/dissent, recorded INSIDE an existing group.
 * This is an advisory operational review, not a government election,
 * a compulsory vote, a legal office, a treasury payment or completed work.
 */
const INTERNAL_PRIORITY='source-witnessed-group-internal-priority-v1';
function reviewChance(q){
 return clamp(.42+(q.completedEfforts>q.failedEfforts?.10:0)+
   (q.worldSnapshot.pressure>60?.05:0)-
   (q.budgetRequested>q.groupFundsAtReview/2?.08:0),.15,.78);
}
function verifyInternalPriority(e,entry){
 const q=entry?.source;
 if(!q||e.origin!=='player-declaration'||
   entry.origin!==INTERNAL_PRIORITY||
   entry.sourceHash!==hash(q)||q.origin!==INTERNAL_PRIORITY||
   q.id!==entry.id||q.groupId!==e.id||
   q.groupOriginHash!==e.originHash||
   q.memberActorId!==entry.memberActorId||
   q.memberConsentHash!==entry.memberConsentHash||
   q.regionId!==entry.regionId||
   q.proposal!==entry.proposal||
   q.day!==entry.day||
   entry.supported!==q.supported||
   !/^[a-z][a-z0-9_-]{5,80}$/.test(entry.id)||
   !Number.isInteger(entry.day)||entry.day<e.foundedDay||
   !Atlas.R[entry.regionId]||
   Atlas.R[entry.regionId].polity!==e.polity||
   typeof entry.proposal!=='string'||
   entry.proposal.trim().length<30||entry.proposal.length>450||
   typeof q.meetingWitness!=='string'||
   q.meetingWitness.trim().length<35||
   q.meetingWitness.length>540||
   typeof q.place!=='string'||q.place.length<2||
   Atlas.LOCATION_REGION[q.place]!==entry.regionId||
   typeof q.memberName!=='string'||q.memberName.length<3||
   q.fundingUnit!=='group-operating-capacity-not-Scales'||
   !Number.isInteger(q.groupFundsAtReview)||q.groupFundsAtReview<0||
   !Number.isInteger(q.budgetRequested)||q.budgetRequested<0||
   q.budgetRequested>q.groupFundsAtReview||
   !Number.isInteger(q.completedEfforts)||q.completedEfforts<0||
   !Number.isInteger(q.failedEfforts)||q.failedEfforts<0||
   !q.worldSnapshot||!['pressure','quality','stability','prosperity'].every(k=>
    Number.isFinite(q.worldSnapshot[k])&&
     q.worldSnapshot[k]>=0&&q.worldSnapshot[k]<=100)||
   !Number.isInteger(q.agencyBefore)||q.agencyBefore<1||
   !Number.isInteger(q.agencyAfter)||q.agencyAfter<1||
   !Number.isFinite(q.individualDraw)||q.individualDraw<0||
   q.individualDraw>=1||
   q.reviewChance!==reviewChance(q)||
   typeof entry.supported!=='boolean'||
   entry.supported!==(q.individualDraw<q.reviewChance)||
   entry.outcome!==(entry.supported?'supported':'dissented')||
   q.outcome!==entry.outcome||
   typeof q.memberPresenceHash!=='string'&&q.memberPresenceHash!==null)
  return false;
 const m=e.additionalMembers?.find(x=>x.actorId===entry.memberActorId&&
   x.hash===entry.memberConsentHash&&x.name===q.memberName&&
   Number.isInteger(x.witness?.details?.day)&&
   x.witness.details.day<=entry.day&&
   (x.active!==false||x.departure?.day>entry.day));
 if(!m)return false;
 const agency=require('./group-member-agency'),proof={rngState:q.agencyBefore};
 const x=agency.draw(proof);
 return x===q.individualDraw&&proof.rngState===q.agencyAfter;
}
function deliberateInternalPriority(w,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
  Object.keys(params).some(k=>!['id','groupId','memberActorId',
   'regionId','place','proposal','budgetRequested','day',
   'meetingWitness'].includes(k)))
  throw Error('An internal consultation cannot be ordered with a chosen member vote, legal office or payout');
 const {id,groupId,memberActorId,regionId,place,proposal,
  budgetRequested,day,meetingWitness}=params;
 const e=lookup(w,groupId),reg=Atlas.R[regionId],
  eco=w?.ecosystems?.[regionId],host=w?.countries?.[e?.polity];
 const m=e?.origin==='player-declaration'?
  e.additionalMembers.find(x=>x.actorId===memberActorId&&x.active!==false):null;
 const Agency=require('./group-member-agency'),
  Presence=require('./person-presence');
 const npcId=m?.witness?.details?.npcId,
  person=typeof npcId==='string'?Presence.resolve(w,npcId,place,day):null;
 if(!e||!m||!person||person.actorId!==memberActorId||
  person.name!==m.name||!reg||reg.polity!==e.polity||
  Atlas.LOCATION_REGION[place]!==regionId||
  !eco||!host||
  !Number.isInteger(day)||day<e.foundedDay||day>w.lastTickDay||
  !/^[a-z][a-z0-9_-]{5,80}$/.test(id)||
  typeof proposal!=='string'||proposal.trim().length<30||
  proposal.length>450||
  typeof meetingWitness!=='string'||meetingWitness.trim().length<35||
  meetingWitness.length>540||
  !Number.isInteger(budgetRequested)||budgetRequested<0||
  !Number.isInteger(e.funds)||budgetRequested>e.funds||
  ![eco.pressure,eco.quality,host.stability,host.prosperity]
   .every(x=>Number.isFinite(x)&&x>=0&&x<=100)||
  (e.internalPriorities||[]).some(x=>x.id===id||
    x.memberActorId===memberActorId&&x.day===day&&
    x.proposal===proposal))
  throw Error('A witnessed real local member, actual existing group budget and distinct truthful issue are required');
 // All preflight is complete before the real existing association member
 // agency consumes exactly one independent, persistent decision draw.
 const t=Agency.ensure(w),agencyBefore=t.rngState;
 const partial={id,origin:INTERNAL_PRIORITY,groupId:e.id,
  groupOriginHash:e.originHash,memberActorId,
  memberConsentHash:m.hash,memberName:m.name,
  regionId,place,proposal,budgetRequested,day,meetingWitness,
  fundingUnit:'group-operating-capacity-not-Scales',
  groupFundsAtReview:e.funds,completedEfforts:e.completedEfforts,
  failedEfforts:e.failedEfforts,
  worldSnapshot:{pressure:eco.pressure,quality:eco.quality,
   stability:host.stability,prosperity:host.prosperity},
  memberPresenceHash:person.presence?hash(person.presence):null};
 const probability=reviewChance(partial),
  individualDraw=Agency.draw(t),supported=individualDraw<probability,
  outcome=supported?'supported':'dissented';
 const q={...partial,agencyBefore,agencyAfter:t.rngState,
  individualDraw,reviewChance:probability,supported,outcome};
 const entry={id,origin:INTERNAL_PRIORITY,memberActorId,
  memberConsentHash:m.hash,regionId,proposal,day,supported,outcome,
  source:q,sourceHash:hash(q)};
 if(!verifyInternalPriority(e,entry))
  throw Error('An independent internal consultation failed its original source proof');
 e.internalPriorities||=[];
 e.internalPriorities.push(entry);
 if(!validate(e))throw Error('The group cannot create an invalid historical internal choice');
 record(ensure(w),e,day,'source-backed-internal-priority-review',
  {priorityId:id,reviewerActorId:memberActorId,
   sourceHash:entry.sourceHash,outcome,
   budgetProposedNotSpent:budgetRequested,
   noCompulsoryOtherMembers:true,noPublicOfficeGranted:true},null);
 return {id,groupId,reviewerActorId:memberActorId,outcome,
  budgetProposed:budgetRequested,budgetActuallySpent:0,
  noCompulsoryMemberAction:true,noLegalRankOrOffice:true,
  noExternalProjectCompletion:true};
}
function internalPriorityStatus(w,groupId){
 const e=lookup(w,groupId);
 if(!e)throw Error('An existing independently sourced association is required');
 return (e.internalPriorities||[]).map(x=>({
  id:x.id,day:x.day,proposal:x.proposal,regionId:x.regionId,
  independentMemberResponse:x.outcome,
  reviewerActorId:x.memberActorId,
  budgetConsidered:x.source.budgetRequested,
  budgetActuallySpent:0,
  doesNotBindOtherMembers:true,noPublicOfficeGranted:true
 }));
}


/*
 * #18 — changing personal positions on existing, open-ended priorities.
 *
 * This is NOT a fixed roster of factions or a second voting system. The
 * proposal already lives in this group's own internalPriorities; any real
 * consenting local member can independently express, change or withhold a
 * personal view after an actually witnessed discussion. All earlier views
 * are immutable history. No position grants authority, work, budget or veto.
 */
const INTERNAL_POSITION='existing-association-independent-member-position-v1';
const INDEPENDENT_WORK_POSITION='original-published-work-independent-member-reappraisal-v1';
function positionBefore(e,priority,actorId,rows){
 const previous=[...rows].reverse().find(x=>
  x.priorityId===priority.id&&x.memberActorId===actorId);
 return previous?
  {stance:previous.stance,hash:previous.sourceHash,day:previous.day}:
  priority.memberActorId===actorId?
   {stance:priority.outcome,hash:priority.sourceHash,day:priority.day}:
   {stance:'unrecorded',hash:null,day:priority.day};
}
function positionChances(q){
 const old=q.previousStance;
 const support=clamp(.39+
  (old==='supported'?.13:old==='dissented'?-.10:0)+
  (q.groupCompletedEfforts>q.groupFailedEfforts?.08:-.04)-
  (q.worldSnapshot.pressure>65?.07:0),.11,.72);
 const dissent=clamp(.25+
  (old==='dissented'?.12:old==='supported'?-.06:0)+
  (q.worldSnapshot.pressure>65?.10:0)+
  (q.groupFailedEfforts>q.groupCompletedEfforts?.06:0),.10,.62);
 return {support,dissent};
}
function verifyInternalPosition(e,row){
 if(row?.origin===INDEPENDENT_WORK_POSITION)
  return verifyPublishedWorkPosition(e,row);
 const q=row?.source,p=e.internalPriorities?.find(x=>x.id===row?.priorityId);
 if(!p||!q||e.origin!=='player-declaration'||
  row.origin!==INTERNAL_POSITION||
  row.sourceHash!==hash(q)||q.origin!==INTERNAL_POSITION||
  q.id!==row.id||q.groupId!==e.id||
  q.groupOriginHash!==e.originHash||
  q.priorityId!==p.id||q.prioritySourceHash!==p.sourceHash||
  q.memberActorId!==row.memberActorId||
  q.memberConsentHash!==row.memberConsentHash||
  q.day!==row.day||q.stance!==row.stance||
  !/^[a-z][a-z0-9_-]{5,80}$/.test(row.id)||
  !Number.isInteger(row.day)||row.day<p.day||
  !Atlas.R[q.regionId]||Atlas.R[q.regionId].polity!==e.polity||
  Atlas.LOCATION_REGION[q.place]!==q.regionId||
  typeof q.memberName!=='string'||q.memberName.length<3||
  typeof q.reason!=='string'||q.reason.trim().length<35||
  q.reason.length>540||
  typeof q.meetingWitness!=='string'||q.meetingWitness.trim().length<45||
  q.meetingWitness.length>610||
  (typeof q.presenceHash!=='string'&&q.presenceHash!==null)||
  !['supported','dissented','undecided','unrecorded'].includes(q.previousStance)||
  (typeof q.previousPositionHash!=='string'&&q.previousPositionHash!==null)||
  !Number.isInteger(q.previousPositionDay)||q.previousPositionDay>q.day||
  !Number.isInteger(q.groupCompletedEfforts)||q.groupCompletedEfforts<0||
  !Number.isInteger(q.groupFailedEfforts)||q.groupFailedEfforts<0||
  !q.worldSnapshot||
  !['pressure','quality','stability','prosperity'].every(k=>
   Number.isFinite(q.worldSnapshot[k])&&
   q.worldSnapshot[k]>=0&&q.worldSnapshot[k]<=100)||
  !Number.isInteger(q.agencyBefore)||q.agencyBefore<1||
  !Number.isInteger(q.agencyAfter)||q.agencyAfter<1||
  typeof q.draw!=='number'||q.draw<0||q.draw>=1||
  !['supported','dissented','undecided'].includes(row.stance))
  return false;
 const member=e.additionalMembers?.find(x=>
  x.actorId===row.memberActorId&&x.hash===row.memberConsentHash&&
  x.name===q.memberName&&
  Number.isInteger(x.witness?.details?.day)&&
  x.witness.details.day<=row.day&&
  (x.active!==false||x.departure?.day>row.day));
 if(!member)return false;
 const chances=positionChances(q),
  verdict=q.draw<chances.support?'supported':
   q.draw<chances.support+chances.dissent?'dissented':'undecided';
 if(q.supportChance!==chances.support||
  q.dissentChance!==chances.dissent||
  verdict!==row.stance)return false;
 const Agency=require('./group-member-agency'),rng={rngState:q.agencyBefore};
 return Agency.draw(rng)===q.draw&&rng.rngState===q.agencyAfter;
}

/*
 * One original, locally published work outcome can give an active,
 * genuinely consenting member a reason to reassess the same open issue.
 * No invisible committee vote, remote knowledge, fabricated meeting,
 * second group work or forced member attendance is created.
 */
function publishedWorkChances(q){
 const support=clamp(.43+
  (q.previousStance==='supported'?.13:q.previousStance==='dissented'?-.10:0)+
  (q.completedEfforts>q.failedEfforts?.08:0),.15,.71);
 const dissent=clamp(.20+
  (q.previousStance==='dissented'?.12:0)+
  (q.stability<35?.07:0),.10,.42);
 return {support,dissent};
}
function verifyPublishedWorkPosition(e,row){
 const q=row?.source,priority=e.internalPriorities?.find(p=>p.id===row?.priorityId),
  work=e.priorityWork?.find(x=>
   x.priorityId===row?.priorityId&&x.originalActionHash===q?.workActionHash&&
   x.independentReviewHash===q?.reviewHash),
  review=work?.source?.independentReview;
 if(!q||!priority||!work||!review||
  e.origin!=='player-declaration'||
  row.origin!==INDEPENDENT_WORK_POSITION||
  row.sourceHash!==hash(q)||q.origin!==INDEPENDENT_WORK_POSITION||
  q.id!==row.id||q.groupId!==e.id||q.groupOriginHash!==e.originHash||
  q.priorityId!==priority.id||q.prioritySourceHash!==priority.sourceHash||
  q.memberActorId!==row.memberActorId||
  q.memberConsentHash!==row.memberConsentHash||
  q.day!==row.day||q.stance!==row.stance||
  !/^[a-z][a-z0-9_-]{5,80}$/.test(row.id)||
  !Number.isInteger(row.day)||row.day<priority.day||
  !verifyPriorityWork(e,work)||
  q.workActionHash!==work.originalActionHash||
  q.reviewHash!==work.independentReviewHash||
  review.kind!=='verified-limited-community-work'||
  review.day!==work.source.day||
  review.releaseDay!==review.day+6||
  typeof review.notice!=='string'||review.notice.length<15||
  q.publishedOn!==review.releaseDay||
  q.day<q.publishedOn||q.day-q.publishedOn>40||
  q.day<=review.day||
  typeof q.memberName!=='string'||q.memberName.length<3||
  !['supported','dissented','undecided','unrecorded'].includes(q.previousStance)||
  (typeof q.previousPositionHash!=='string'&&q.previousPositionHash!==null)||
  !Number.isInteger(q.previousPositionDay)||q.previousPositionDay>q.day||
  !Number.isInteger(q.completedEfforts)||q.completedEfforts<0||
  !Number.isInteger(q.failedEfforts)||q.failedEfforts<0||
  !Number.isInteger(q.stability)||q.stability<0||q.stability>100||
  !Number.isInteger(q.agencyBefore)||q.agencyBefore<1||
  !Number.isInteger(q.agencyAfter)||q.agencyAfter<1||
  typeof q.draw!=='number'||q.draw<0||q.draw>=1||
  !['supported','dissented','undecided'].includes(row.stance)||
  q.noMandateOrAdditionalWork!==true)return false;
 const member=e.additionalMembers?.find(x=>
  x.actorId===row.memberActorId&&x.hash===row.memberConsentHash&&
  x.name===q.memberName&&
  x.witness?.details?.day<=row.day&&
  (x.active!==false||x.departure?.day>row.day));
 if(!member)return false;
 const chances=publishedWorkChances(q),
  stance=q.draw<chances.support?'supported':
   q.draw<chances.support+chances.dissent?'dissented':'undecided';
 if(q.supportChance!==chances.support||
  q.dissentChance!==chances.dissent||stance!==row.stance)return false;
 const Agency=require('./group-member-agency'),rng={rngState:q.agencyBefore};
 return Agency.draw(rng)===q.draw&&rng.rngState===q.agencyAfter;
}
function reassessPublishedWork(w,{groupId,memberActorId,workActionHash,day}={}){
 // World-owned method, called only after the ORIGINAL sixday/month clock
 // makes a source-valid local notice available; accepts no desired stance.
 const e=lookup(w,groupId),
  member=e?.origin==='player-declaration'?
   e.additionalMembers.find(x=>x.actorId===memberActorId&&x.active!==false):null,
  work=e?.priorityWork?.find(x=>x.originalActionHash===workActionHash),
  priority=e?.internalPriorities?.find(x=>x.id===work?.priorityId),
  rev=work?.source?.independentReview;
 const before=member&&priority?positionBefore(e,priority,memberActorId,
  e.internalPositions||[]):null;
 if(!e||!member||!work||!priority||!rev||
  !verifyPriorityWork(e,work)||
  rev.kind!=='verified-limited-community-work'||
  rev.releaseDay!==rev.day+6||
  typeof rev.notice!=='string'||rev.notice.length<15||
  !Number.isInteger(day)||day<rev.releaseDay||day-rev.releaseDay>40||
  !before||day<=before.day||
  (e.internalPositions||[]).some(x=>
   x.origin===INDEPENDENT_WORK_POSITION&&
   x.memberActorId===memberActorId&&
   x.source.workActionHash===workActionHash))
  return {reassessed:false,reason:'no new individually accessible original published work'};
 const host=w.countries?.[e.polity],Agency=require('./group-member-agency');
 if(!host||!Number.isInteger(host.stability)||host.stability<0||host.stability>100)
  throw Error('A sourced original polity is required for a member to reconsider its work');
 const t=Agency.ensure(w),agencyBefore=t.rngState;
 const id='group_work_view_'+hash({groupId,memberActorId,workActionHash}).slice(0,24);
 const partial={origin:INDEPENDENT_WORK_POSITION,id,
  groupId:e.id,groupOriginHash:e.originHash,
  priorityId:priority.id,prioritySourceHash:priority.sourceHash,
  memberActorId,memberConsentHash:member.hash,memberName:member.name,
  workActionHash,reviewHash:work.independentReviewHash,
  publishedOn:rev.releaseDay,day,
  previousStance:before.stance,
  previousPositionHash:before.hash,previousPositionDay:before.day,
  completedEfforts:e.completedEfforts,failedEfforts:e.failedEfforts,
  stability:host.stability,noMandateOrAdditionalWork:true};
 const chances=publishedWorkChances(partial),draw=Agency.draw(t),
  stance=draw<chances.support?'supported':
   draw<chances.support+chances.dissent?'dissented':'undecided';
 const source={...partial,agencyBefore,agencyAfter:t.rngState,
  supportChance:chances.support,dissentChance:chances.dissent,draw,stance};
 const row={id,origin:INDEPENDENT_WORK_POSITION,
  priorityId:priority.id,memberActorId,memberConsentHash:member.hash,
  day,stance,source,sourceHash:hash(source)};
 if(!verifyPublishedWorkPosition(e,row))
  throw Error('A member opinion without its original locally published work source is invalid');
 e.internalPositions||=[];e.internalPositions.push(row);
 if(!validate(e))
  throw Error('Original member position history cannot accept a repeated or unsourced reassessment');
 record(ensure(w),e,day,'independent-response-to-published-real-work',
  {priorityId:priority.id,memberActorId,
   originalWorkHash:workActionHash,viewHash:row.sourceHash,
   noNewWorkOrVote:true},null);
 return {reassessed:true,memberActorId,priorityId:priority.id,
  previousStance:before.stance,stance,
  groundedInPublishedOriginalReview:work.independentReviewHash,
  noGroupMandate:true,noNewWorkOrSpending:true};
}

function verifyInternalPositionHistory(e){
 const seen=[],ids=new Set();
 for(const row of e.internalPositions){
  if(ids.has(row?.id)||!verifyInternalPosition(e,row))return false;
  const p=e.internalPriorities.find(x=>x.id===row.priorityId),
   before=positionBefore(e,p,row.memberActorId,seen),q=row.source;
  // Another real member may respond at the original meeting on its day.
  // The same member may not reroll their own first answer on that day.
  if(row.day<before.day||
   (row.day===before.day&&before.hash!==null)||
   q.previousStance!==before.stance||
   q.previousPositionHash!==before.hash||
   q.previousPositionDay!==before.day)return false;
  seen.push(row);ids.add(row.id);
 }
 return true;
}
function considerInternalPosition(w,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
  Object.keys(params).some(k=>!['id','groupId','priorityId',
   'memberActorId','day','regionId','place','reason',
   'meetingWitness'].includes(k)))
  throw Error('A member position cannot be dictated, fabricated or made into a binding faction order');
 const {id,groupId,priorityId,memberActorId,day,regionId,place,
  reason,meetingWitness}=params;
 const e=lookup(w,groupId),
  priority=e?.internalPriorities?.find(x=>x.id===priorityId),
  member=e?.origin==='player-declaration'?
   e.additionalMembers.find(x=>x.actorId===memberActorId&&x.active!==false):null,
  reg=Atlas.R[regionId],eco=w?.ecosystems?.[regionId],
  host=w?.countries?.[e?.polity];
 const People=require('./person-presence'),
  Agency=require('./group-member-agency');
 const npcId=member?.witness?.details?.npcId,
  person=typeof npcId==='string'?People.resolve(w,npcId,place,day):null;
 const entries=e?.internalPositions||[],
  previous=priority&&member?
   positionBefore(e,priority,memberActorId,entries):null;
 if(!e||!priority||!member||!person||
  person.actorId!==memberActorId||person.name!==member.name||
  !reg||reg.polity!==e.polity||
  Atlas.LOCATION_REGION[place]!==regionId||
  !eco||!host||!Number.isInteger(day)||day>w.lastTickDay||
  !previous||(day<previous.day||
   (day===previous.day&&previous.hash!==null))||
  !/^[a-z][a-z0-9_-]{5,80}$/.test(id)||
  typeof reason!=='string'||reason.trim().length<35||reason.length>540||
  typeof meetingWitness!=='string'||
  meetingWitness.trim().length<45||meetingWitness.length>610||
  entries.some(x=>x.id===id||
   x.priorityId===priorityId&&x.memberActorId===memberActorId&&
   x.day===day)||
  ![eco.pressure,eco.quality,host.stability,host.prosperity]
   .every(v=>Number.isFinite(v)&&v>=0&&v<=100))
  throw Error('Only a later, witnessed local conversation with a real consenting member can produce their independent evolving position');
 const agency=Agency.ensure(w),agencyBefore=agency.rngState;
 const partial={origin:INTERNAL_POSITION,id,groupId:e.id,
  groupOriginHash:e.originHash,priorityId:priority.id,
  prioritySourceHash:priority.sourceHash,
  memberActorId,memberConsentHash:member.hash,memberName:member.name,
  day,regionId,place,reason,meetingWitness,
  presenceHash:person.presence?hash(person.presence):null,
  previousStance:previous.stance,
  previousPositionHash:previous.hash,previousPositionDay:previous.day,
  groupCompletedEfforts:e.completedEfforts,
  groupFailedEfforts:e.failedEfforts,
  worldSnapshot:{pressure:eco.pressure,quality:eco.quality,
   stability:host.stability,prosperity:host.prosperity}};
 const chances=positionChances(partial),draw=Agency.draw(agency),
  stance=draw<chances.support?'supported':
   draw<chances.support+chances.dissent?'dissented':'undecided';
 const source={...partial,agencyBefore,agencyAfter:agency.rngState,
  supportChance:chances.support,dissentChance:chances.dissent,
  draw,stance};
 const row={id,origin:INTERNAL_POSITION,priorityId:priority.id,
  memberActorId,memberConsentHash:member.hash,day,stance,
  source,sourceHash:hash(source)};
 if(!verifyInternalPosition(e,row))
  throw Error('An independently sourced association position failed verification');
 e.internalPositions||=[];e.internalPositions.push(row);
 if(!validate(e))throw Error('Saved group positions must form an unbroken historical chain');
 record(ensure(w),e,day,'independent-existing-priority-position',{
  priorityId:priority.id,memberActorId,stance,
  positionSourceHash:row.sourceHash,
  noBindingGroupVote:true,noForcedLabour:true,
  noGroupFundsTransferred:true,noCivicOffice:true},null);
 return {id,groupId:e.id,priorityId:priority.id,
  memberActorId,stance,
  previousStance:previous.stance,
  noGroupMandate:true,noAutomaticFundsOrWork:true,
  noBindingOtherMembers:true};
}
function internalPositionStatus(w,groupId,{day}={}){
 const e=lookup(w,groupId);
 if(!e)throw Error('Original association and source-valid positions required');
 const asOf=day===undefined?w.lastTickDay:day;
 if(!Number.isInteger(asOf)||asOf<e.foundedDay||
  asOf>w.lastTickDay)throw Error('Only real elapsed world days have group positions');
 return (e.internalPriorities||[]).filter(p=>p.day<=asOf).map(p=>{
  const memberIds=new Set([p.memberActorId,
   ...(e.internalPositions||[]).filter(x=>
    x.priorityId===p.id&&x.day<=asOf).map(x=>x.memberActorId)]);
  return {priorityId:p.id,proposal:p.proposal,
   positions:[...memberIds].map(actorId=>{
    const rows=(e.internalPositions||[]).filter(x=>
     x.priorityId===p.id&&x.memberActorId===actorId&&x.day<=asOf);
    const last=positionBefore(e,p,actorId,rows),
     membership=e.additionalMembers.filter(x=>
      x.actorId===actorId&&x.witness?.details?.day<=asOf).at(-1),
     stillParticipating=!!membership&&
      (membership.active!==false||membership.departure?.day>asOf);
    return {memberActorId:actorId,stance:last.stance,
     lastEvidenceHash:last.hash,day:last.day,
     historyCount:rows.length,
     memberStillParticipating:stillParticipating,
     historicalOpinionDoesNotConferMembership:true};
   }),
   noMajorityOrCompulsoryMandateInferred:true};
 });
}


/*
 * Existing volunteer members can choose real, deliberately limited work
 * responsibilities. This records the member's independent willingness, not
 * an invented government appointment, hereditary title, salary, achievement,
 * or an exclusive command over other members or beasts.
 */
const INTERNAL_ROLE='group-member-voluntary-practical-responsibility-v1';
function responsibilityChance(q){
 return clamp(.50+(q.groupSuccesses>q.groupFailures?.09:0)-
   (q.groupStatus==='inactive'?.16:0),.18,.76);
}
function verifyInternalRole(e,entry){
 const q=entry?.source;
 if(!q||entry.origin!==INTERNAL_ROLE||
  entry.sourceHash!==hash(q)||q.origin!==INTERNAL_ROLE||
  q.id!==entry.id||q.groupId!==e.id||
  q.groupOriginHash!==e.originHash||
  q.memberActorId!==entry.memberActorId||
  q.memberConsentHash!==entry.memberConsentHash||
  q.title!==entry.title||q.scope!==entry.scope||
  q.startDay!==entry.startDay||q.untilDay!==entry.untilDay||
  q.agreed!==entry.agreed||
  entry.status!==(q.agreed?'agreed':'declined')||
  !/^[a-z][a-z0-9_-]{5,80}$/.test(entry.id)||
  typeof entry.title!=='string'||entry.title.trim().length<7||
  entry.title.length>110||
  typeof entry.scope!=='string'||entry.scope.trim().length<35||
  entry.scope.length>530||
  !Number.isInteger(entry.startDay)||entry.startDay<e.foundedDay||
  !Number.isInteger(entry.untilDay)||entry.untilDay<entry.startDay||
  entry.untilDay>10000000||
  !Atlas.R[q.regionId]||Atlas.R[q.regionId].polity!==e.polity||
  Atlas.LOCATION_REGION[q.place]!==q.regionId||
  typeof q.witness!=='string'||q.witness.trim().length<40||
  q.witness.length>590||
  q.requestingFounder!==e.founder.name||
  typeof q.memberName!=='string'||q.memberName.length<3||
  typeof q.presentProof!=='string'&&q.presentProof!==null||
  !Number.isInteger(q.groupSuccesses)||q.groupSuccesses<0||
  !Number.isInteger(q.groupFailures)||q.groupFailures<0||
  !['organising','inactive','active','operating'].includes(q.groupStatus)||
  !Number.isInteger(q.agencyBefore)||q.agencyBefore<1||
  !Number.isInteger(q.agencyAfter)||q.agencyAfter<1||
  typeof q.draw!=='number'||q.draw<0||q.draw>=1||
  q.agreeChance!==responsibilityChance(q)||
  q.agreed!==(q.draw<q.agreeChance))
  return false;
 const member=e.additionalMembers?.find(m=>
  m.actorId===entry.memberActorId&&m.hash===entry.memberConsentHash&&
  m.name===q.memberName&&
  Number.isInteger(m.witness?.details?.day)&&
  m.witness.details.day<=entry.startDay&&
  (m.active!==false||m.departure?.day>entry.startDay));
 if(!member)return false;
 const Agency=require('./group-member-agency'),rng={rngState:q.agencyBefore};
 const next=Agency.draw(rng);
 return next===q.draw&&rng.rngState===q.agencyAfter;
}
function proposeVoluntaryRole(w,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
   Object.keys(params).some(k=>!['id','groupId','memberActorId','title',
    'scope','startDay','untilDay','regionId','place','witness'].includes(k)))
  throw Error('A practical group responsibility cannot specify consent, command power, compulsory service or pay');
 const {id,groupId,memberActorId,title,scope,startDay,untilDay,
  regionId,place,witness}=params;
 const e=lookup(w,groupId),reg=Atlas.R[regionId],
  member=e?.origin==='player-declaration'?
   e.additionalMembers.find(m=>m.actorId===memberActorId&&m.active!==false):null;
 const People=require('./person-presence'),Agency=require('./group-member-agency');
 const person=typeof member?.witness?.details?.npcId==='string'?
  People.resolve(w,member.witness.details.npcId,place,startDay):null;
 if(!e||!member||!person||person.actorId!==memberActorId||
  person.name!==member.name||!reg||reg.polity!==e.polity||
  Atlas.LOCATION_REGION[place]!==regionId||
  !Number.isInteger(startDay)||startDay<e.foundedDay||
  startDay>w.lastTickDay||
  !Number.isInteger(untilDay)||untilDay<startDay||
  untilDay>10000000||
  !/^[a-z][a-z0-9_-]{5,80}$/.test(id)||
  typeof title!=='string'||title.trim().length<7||title.length>110||
  typeof scope!=='string'||scope.trim().length<35||scope.length>530||
  typeof witness!=='string'||witness.trim().length<40||witness.length>590||
  (e.internalRoles||[]).some(x=>x.id===id||
   x.memberActorId===memberActorId&&x.title===title&&
   x.startDay===startDay))
  throw Error('Only a personally present, consenting group member may independently consider a distinct, genuine local responsibility');
 const t=Agency.ensure(w),agencyBefore=t.rngState;
 const q0={origin:INTERNAL_ROLE,id,groupId:e.id,groupOriginHash:e.originHash,
  memberActorId,memberConsentHash:member.hash,
  memberName:member.name,requestingFounder:e.founder.name,
  title,scope,startDay,untilDay,regionId,place,witness,
  presentProof:person.presence?hash(person.presence):null,
  groupStatus:e.status,groupSuccesses:e.completedEfforts,
  groupFailures:e.failedEfforts};
 const agreeChance=responsibilityChance(q0),draw=Agency.draw(t),
  agreed=draw<agreeChance;
 const q={...q0,agencyBefore,agencyAfter:t.rngState,
  agreeChance,draw,agreed};
 const entry={id,origin:INTERNAL_ROLE,memberActorId,
  memberConsentHash:member.hash,title,scope,startDay,untilDay,
  agreed,status:agreed?'agreed':'declined',source:q,sourceHash:hash(q)};
 if(!verifyInternalRole(e,entry))
  throw Error('A voluntary practical role failed its real independent choice proof');
 e.internalRoles||=[];
 e.internalRoles.push(entry);
 if(!validate(e))throw Error('An organisation cannot record false role consent');
 record(ensure(w),e,startDay,'independent-practical-role-response',{
  sourceHash:entry.sourceHash,memberActorId,
  agreed,roleTitle:title,
  noGroupFundsSpent:true,noGovernmentOffice:true,
  noForcedMemberAction:true},null);
 return {id,groupId,memberActorId,agreed,
  status:agreed?'accepted':'declined',
  noPublicOffice:true,noCompulsoryDuty:true,
  noAutomaticWage:true,noInventedProjectCompletion:true};
}
function voluntaryRoleStatus(w,groupId,{day}={}){
 const e=lookup(w,groupId);
 if(!e)throw Error('Real original organisation source and membership are required');
 const d=day===undefined?w.lastTickDay:day;
 if(!Number.isInteger(d)||d<e.foundedDay)
  throw Error('A valid original world day is needed for role history');
 return (e.internalRoles||[]).map(entry=>{
  const member=e.additionalMembers.find(x=>x.actorId===entry.memberActorId&&
   x.hash===entry.memberConsentHash);
  const departed=member?.active===false&&member.departure?.day<=d;
  const status=!entry.agreed?'declined':
   d<entry.startDay?'not-started':
   departed?'ended-after-independent-departure':
   d>entry.untilDay?'term-ended':'voluntarily-serving';
  return {id:entry.id,memberActorId:entry.memberActorId,
   title:entry.title,scope:entry.scope,status,
   startDay:entry.startDay,untilDay:entry.untilDay,
   noLegalOrHereditaryAuthority:true,noCompulsoryCooperation:true,
   noAutomaticPay:true};
 });
}


/*
 * #18: optional advisory-priority attribution to ACTUAL original group work.
 * This does not award extra money, bind dissenters or resolve a second roll.
 * The original independent month work and its existing funds cost are the
 * ONLY mechanical output; a separately copied source keeps the causal link
 * readable even when the short group-history journal prunes old entries.
 */
const PRIORITY_WORK='original-reviewed-association-priority-work-v1';
function verifyPriorityWork(e,row){
 const q=row?.source,p=e.internalPriorities?.find(x=>x.id===row?.priorityId);
 const a=q?.originalAction,rev=q?.independentReview;
 if(!p?.supported||!q||row.origin!==PRIORITY_WORK||
  row.sourceHash!==hash(q)||q.origin!==PRIORITY_WORK||
  q.groupId!==e.id||q.groupOriginHash!==e.originHash||
  q.priorityId!==p.id||q.prioritySourceHash!==p.sourceHash||
  q.independentMemberActorId!==p.memberActorId||
  row.originalActionHash!==q.originalActionHash||
  row.independentReviewHash!==q.independentReviewHash||
  !Number.isInteger(q.day)||q.day<p.day||
  !a||a.priorityId!==p.id||
  q.originalActionHash!==hash(a.witness)||
  q.originalActionHash!==a.hash||
  a.witness?.type!=='story'||
  a.witness.details?.origin!=='actually-attempted-voluntary-group-work'||
  a.witness.details?.groupId!==e.id||
  a.witness.details?.priorityId!==p.id||
  a.witness.details?.actor!==e.founder.name||
  a.witness.details?.coins!==a.amount||
  a.witness.details?.activity!==a.activity||
  a.witness.details?.minutes!==a.minutes||
  !Number.isInteger(a.day)||a.day<p.day||a.day>q.day||
  !Number.isInteger(a.amount)||a.amount<0||
  !rev||rev.hash!==q.independentReviewHash||
  rev.groupId!==e.id||rev.originHash!==e.originHash||
  rev.day!==q.day||
  !['verified-limited-community-work','unverified-community-effort'].includes(rev.kind)||
  !Array.isArray(rev.details?.originalActionHashes)||
  !rev.details.originalActionHashes.includes(a.hash)||
  !Number.isInteger(rev.details.actualFundsSpent)||
  q.groupReviewCost!==rev.details.actualFundsSpent||
  !Number.isInteger(q.originalGroupBalanceBeforeReview)||
  q.originalGroupBalanceBeforeReview<q.groupReviewCost||
  q.noExtraCostOrFreeProgress!==true||
  q.noCompulsoryMemberParticipation!==true)
  return false;
 const {hash:seal,notice,releaseDay,...body}=rev;
 return hash(body)===seal;
}
function priorityWorkStatus(w,groupId){
 const e=lookup(w,groupId);
 if(!e)throw Error('An original valid association with known source is required');
 return (e.priorityWork||[]).map(row=>({
  priorityId:row.priorityId,
  originalActionHash:row.originalActionHash,
  dayOfActualIndependentReview:row.source.day,
  originalResult:row.source.independentReview.kind,
  groupWideOriginalReviewCost:row.source.groupReviewCost,
  additionalCostForLink:0,
  noInferredSharedMemberConsent:true,
  noNewWorkResultOrMoney:true
 }));
}


/*
 * Voluntary operational coordination is not transfer of sovereign office,
 * founding authorship, access to somebody else's money, or power over peers.
 * The group can name a time-limited coordinator without changing its
 * immutable original founder or implied voting rights for other people.
 */
const COORDINATION='independently-agreed-group-operational-coordinator-v1';
function coordinationChance(q){
 return clamp(.52+
  (q.originalGroupCompletedEfforts>q.originalGroupFailedEfforts?.07:0)-
  (q.groupStatusAtOffer==='inactive'?.15:0),.18,.76);
}
function verifyCoordinationMandate(e,row){
 const q=row?.source;
 if(!q||e.origin!=='player-declaration'||
  row.origin!==COORDINATION||row.sourceHash!==hash(q)||
  q.origin!==COORDINATION||q.id!==row.id||
  q.groupId!==e.id||q.groupOriginHash!==e.originHash||
  q.memberActorId!==row.memberActorId||
  q.originalMembershipHash!==row.originalMembershipHash||
  q.memberName!==row.memberName||
  q.startDay!==row.startDay||q.untilDay!==row.untilDay||
  q.scope!==row.scope||q.agreed!==row.agreed||
  row.status!==(row.agreed?'accepted':'declined')||
  !/^[a-z][a-z0-9_-]{5,80}$/.test(row.id)||
  !Number.isInteger(row.startDay)||row.startDay<e.foundedDay||
  !Number.isInteger(row.untilDay)||row.untilDay<row.startDay||
  row.untilDay>10000000||
  typeof row.scope!=='string'||row.scope.trim().length<38||
  row.scope.length>520||
  q.originalFounder!==e.founder.name||
  !Atlas.R[q.regionId]||Atlas.R[q.regionId].polity!==e.polity||
  Atlas.LOCATION_REGION[q.place]!==q.regionId||
  typeof q.meetingWitness!=='string'||q.meetingWitness.trim().length<45||
  q.meetingWitness.length>600||
  typeof q.presenceHash!=='string'&&q.presenceHash!==null||
  !['organising','inactive','active','operating'].includes(q.groupStatusAtOffer)||
  !Number.isInteger(q.originalGroupCompletedEfforts)||q.originalGroupCompletedEfforts<0||
  !Number.isInteger(q.originalGroupFailedEfforts)||q.originalGroupFailedEfforts<0||
  !Number.isInteger(q.agencyBefore)||q.agencyBefore<1||
  !Number.isInteger(q.agencyAfter)||q.agencyAfter<1||
  typeof q.decisionDraw!=='number'||q.decisionDraw<0||
  q.decisionDraw>=1||q.independentChance!==coordinationChance(q)||
  q.agreed!==(q.decisionDraw<q.independentChance)||
  typeof q.previousCoordinator!=='string'||
  !['founder','member'].includes(q.previousCoordinatorKind))
  return false;
 const person=e.additionalMembers?.find(x=>
  x.actorId===row.memberActorId&&x.hash===row.originalMembershipHash&&
  x.name===row.memberName&&
  Number.isInteger(x.witness?.details?.day)&&
  x.witness.details.day<=row.startDay&&
  (x.active!==false||x.departure?.day>row.startDay));
 if(!person)return false;
 const agency=require('./group-member-agency'),rng={rngState:q.agencyBefore};
 const choice=agency.draw(rng);
 return choice===q.decisionDraw&&rng.rngState===q.agencyAfter;
}

/*
 * #18: only an actual originally agreed limited coordinator can choose
 * independently whether to continue that role after a GENUINE original
 * failed group-work review. An earlier answer and a real setback are
 * evidence; neither creates an automatic removal, an election, a successor,
 * a salary, a second project roll, or command authority over members.
 */
const COORDINATION_REVIEW='original-member-coordinator-independent-setback-reconsideration-v1';
function coordinationReviewChance(q){
 return clamp(.27+
  (q.failedEffortsAtDecision>q.completedEffortsAtDecision?.08:0)+
  (q.groupStatus==='inactive'?.09:0),.13,.55);
}
function verifiedOriginalFailedWork(e,rev){
 if(!rev||rev.groupId!==e.id||rev.polity!==e.polity||
  rev.originHash!==e.originHash||
  rev.kind!=='unverified-community-effort'||
  !Number.isInteger(rev.day)||rev.day<e.foundedDay||
  !rev.details||rev.details.result!=='no independently verified result'||
  !Number.isInteger(rev.details.actualEffortMinutes)||
  rev.details.actualEffortMinutes<=0||
  !Number.isInteger(rev.details.actualFundsSpent)||
  rev.details.actualFundsSpent<0||
  !Number.isFinite(rev.details.decisionDraw)||
  rev.details.decisionDraw<0||rev.details.decisionDraw>=1||
  !Number.isFinite(rev.details.chance)||
  rev.details.chance<.12||rev.details.chance>.76||
  rev.details.decisionDraw<rev.details.chance||
  !Array.isArray(rev.details.originalActionHashes)||
  rev.details.originalActionHashes.length<1||
  !rev.details.originalActionHashes.every(h=>
   typeof h==='string'&&/^[0-9a-f]{64}$/.test(h))||
  rev.notice!==null||rev.releaseDay!==null||
  typeof rev.hash!=='string')return false;
 const {hash:seal,notice,releaseDay,...body}=rev;
 return hash(body)===seal;
}

/*
 * Source-grounded later personal dissent can prompt an existing consenting
 * coordinator to reconsider only their OPTIONAL operational responsibility.
 * Actual membership and previous work are not undone. A separate genuine
 * member-agency draw decides; the founder cannot choose a resignation.
 */
const COORDINATION_PURPOSE_REVIEW='original-member-independent-purpose-coordinator-reconsideration-v1';
function purposeCoordinatorChance(q){
 return clamp(.27+(q.groupStatus==='inactive'?.11:0)+
  (q.failedEffortsAtDecision>q.completedEffortsAtDecision?.08:0),.14,.55);
}
function verifyPurposeCoordinatorReview(e,row){
 const q=row?.source,role=e?.coordinationMandates?.find(x=>x.id===row?.mandateId),
  response=e?.purposeResponses?.find(x=>x.id===q?.responseId),
  revision=e?.purposeHistory?.find(x=>x.id===q?.revisionId),
  latest=e?.purposeResponses?.filter(x=>
   x.memberActorId===q?.memberActorId&&x.stance!=='unaware'&&
   x.minute<=q?.day*1440).at(-1),
  current=e?.purposeHistory?.filter(x=>x.minute<=q?.day*1440).at(-1);
 if(!q||!role||!response||!revision||!current||
  e.origin!=='player-declaration'||
  row.origin!==COORDINATION_PURPOSE_REVIEW||
  q.origin!==COORDINATION_PURPOSE_REVIEW||
  row.sourceHash!==hash(q)||row.id!==q.id||
  q.id!=='coord_purpose_'+hash({groupId:e.id,mandateId:role.id,
   responseHash:response.sourceHash}).slice(0,24)||
  row.mandateId!==role.id||q.mandateId!==role.id||
  row.memberActorId!==role.memberActorId||
  q.memberActorId!==role.memberActorId||
  q.groupId!==e.id||q.groupOriginHash!==e.originHash||
  q.originalMandateHash!==role.sourceHash||
  q.originalMembershipHash!==role.originalMembershipHash||
  !role.agreed||!verifyCoordinationMandate(e,role)||
  q.responseId!==response.id||q.responseHash!==response.sourceHash||
  response.memberActorId!==role.memberActorId||
  response.stance!=='dissented'||latest?.id!==response.id||
  response.revisionId!==revision.id||q.revisionId!==revision.id||
  revision.sourceHash!==q.revisionSourceHash||
  current.id!==revision.id||
  !verifyPurposeHistory(e)||!verifyPurposeResponsesHistory(e)||
  !Number.isInteger(q.day)||q.day!==row.day||
  q.day<role.startDay||q.day>role.untilDay||
  q.day-response.day<6||q.day-response.day>180||
  response.minute>q.day*1440||
  q.responseDay!==response.day||
  q.originalRoleScope!==role.scope||
  !['organising','inactive','active','operating'].includes(q.groupStatus)||
  !Number.isInteger(q.completedEffortsAtDecision)||
  q.completedEffortsAtDecision<0||
  !Number.isInteger(q.failedEffortsAtDecision)||
  q.failedEffortsAtDecision<0||
  !Number.isInteger(q.agencyBefore)||q.agencyBefore<1||
  !Number.isInteger(q.agencyAfter)||q.agencyAfter<1||
  typeof q.draw!=='number'||q.draw<0||q.draw>=1||
  q.resignChance!==purposeCoordinatorChance(q)||
  q.resigned!==(q.draw<q.resignChance)||
  row.resigned!==q.resigned||
  q.noMemberDismissal!==true||
  q.noWorkOrTreasuryChange!==true||
  q.noForcedReplacementOrLegalOffice!==true)return false;
 const member=e.additionalMembers?.find(m=>
  m.actorId===role.memberActorId&&m.hash===role.originalMembershipHash&&
  m.witness?.details?.day<=row.day&&
  (m.active!==false||m.departure?.day>row.day));
 if(!member)return false;
 const Agency=require('./group-member-agency'),rng={rngState:q.agencyBefore};
 return Agency.draw(rng)===q.draw&&rng.rngState===q.agencyAfter;
}
function reconsiderCoordinatorOnPurposeDissent(w,{
 groupId,mandateId,responseId,day}={}){
 const e=lookup(w,groupId),
  role=e?.coordinationMandates?.find(x=>x.id===mandateId),
  response=e?.purposeResponses?.find(x=>x.id===responseId),
  latest=e?.purposeResponses?.filter(x=>
   x.memberActorId===role?.memberActorId&&x.stance!=='unaware'&&
   x.minute<=day*1440).at(-1),
  revision=e?.purposeHistory?.filter(x=>x.minute<=day*1440).at(-1),
  holder=e&&Number.isInteger(day)?coordinatorStatus(w,e.id,{day}):null;
 if(!e||!role||!role.agreed||!response||
  !Number.isInteger(day)||day<=w.lastTickDay||
  holder?.mandateId!==role.id||
  latest?.id!==response.id||response.stance!=='dissented'||
  revision?.id!==response.revisionId||
  day-response.day<6||day-response.day>180||
  !verifyPurposeHistory(e)||!verifyPurposeResponsesHistory(e)||
  (e.coordinationReviews||[]).some(x=>
   x.mandateId===role.id&&(x.resigned||x.day===day||
    x.source.responseId===response.id)))
  return {reconsidered:false,reason:'no new independently held source-backed disagreement while serving'};
 const Agency=require('./group-member-agency'),t=Agency.ensure(w),
  before=t.rngState,
  q0={origin:COORDINATION_PURPOSE_REVIEW,
   id:'coord_purpose_'+hash({groupId:e.id,mandateId:role.id,
    responseHash:response.sourceHash}).slice(0,24),
   groupId:e.id,groupOriginHash:e.originHash,
   mandateId:role.id,originalMandateHash:role.sourceHash,
   memberActorId:role.memberActorId,
   originalMembershipHash:role.originalMembershipHash,
   responseId:response.id,responseHash:response.sourceHash,
   responseDay:response.day,revisionId:revision.id,
   revisionSourceHash:revision.sourceHash,
   originalRoleScope:role.scope,day,groupStatus:e.status,
   completedEffortsAtDecision:e.completedEfforts,
   failedEffortsAtDecision:e.failedEfforts,
   noMemberDismissal:true,noWorkOrTreasuryChange:true,
   noForcedReplacementOrLegalOffice:true},
  resignChance=purposeCoordinatorChance(q0),
  draw=Agency.draw(t),resigned=draw<resignChance,
  q={...q0,agencyBefore:before,agencyAfter:t.rngState,
   resignChance,draw,resigned},
  row={id:q.id,origin:COORDINATION_PURPOSE_REVIEW,
   mandateId:role.id,memberActorId:role.memberActorId,
   day,resigned,source:q,sourceHash:hash(q)};
 if(!verifyPurposeCoordinatorReview(e,row))
  throw Error('Independent role reconsideration lacked the original source');
 e.coordinationReviews||=[];e.coordinationReviews.push(row);
 if(!validate(e)){e.coordinationReviews.pop();
  throw Error('Personal role reconsideration contradicted prior role history');}
 record(ensure(w),e,day,
  resigned?'coordinator-independently-relieved-own-limited-duty':
   'coordinator-independently-kept-own-limited-duty',{
   mandateId:role.id,memberActorId:role.memberActorId,
   responseHash:response.sourceHash,reviewHash:row.sourceHash,
   resigned,memberStillFree:true,noWorkOrTreasuryChange:true,
   noForcedReplacement:true},null);
 return {reconsidered:true,independentlyResigned:resigned,
  mandateId:role.id,responseSourceHash:response.sourceHash,
  noMemberDismissalOrPayment:true};
}

function verifyCoordinationReview(e,row){
 if(row?.origin===COORDINATION_PURPOSE_REVIEW)
  return verifyPurposeCoordinatorReview(e,row);
 const q=row?.source,role=e?.coordinationMandates?.find(x=>x.id===row?.mandateId),
  rev=q?.originalReview;
 if(!role||!role.agreed||!q||e.origin!=='player-declaration'||
  row.origin!==COORDINATION_REVIEW||
  row.sourceHash!==hash(q)||q.origin!==COORDINATION_REVIEW||
  row.id!==q.id||
  q.id!=='coord_review_'+hash({groupId:e.id,mandateId:role.id,
   originalReviewHash:q.originalReviewHash}).slice(0,24)||
  row.mandateId!==q.mandateId||q.mandateId!==role.id||
  q.originalMandateHash!==role.sourceHash||
  q.groupId!==e.id||q.groupOriginHash!==e.originHash||
  row.memberActorId!==q.memberActorId||
  q.memberActorId!==role.memberActorId||
  q.originalMembershipHash!==role.originalMembershipHash||
  row.day!==q.day||q.day!==rev?.day||
  row.day<role.startDay||row.day>role.untilDay||
  !verifiedOriginalFailedWork(e,rev)||
  rev.hash!==q.originalReviewHash||
  !['organising','inactive','active','operating'].includes(q.groupStatus)||
  !Number.isInteger(q.failedEffortsAtDecision)||
  q.failedEffortsAtDecision<1||
  !Number.isInteger(q.completedEffortsAtDecision)||
  q.completedEffortsAtDecision<0||
  !Number.isInteger(q.agencyBefore)||q.agencyBefore<1||
  !Number.isInteger(q.agencyAfter)||q.agencyAfter<1||
  !Number.isFinite(q.decisionDraw)||q.decisionDraw<0||
  q.decisionDraw>=1||
  q.resignChance!==coordinationReviewChance(q)||
  row.resigned!==q.resigned||
  row.resigned!==(q.decisionDraw<q.resignChance)||
  q.noNewWorkOrInfluence!==true||
  q.noOtherMemberBound!==true||
  q.noCashOrLegalOffice!==true)
  return false;
 const member=e.additionalMembers?.find(m=>
  m.actorId===role.memberActorId&&
  m.hash===role.originalMembershipHash&&
  m.witness?.details?.day<=row.day&&
  (m.active!==false||m.departure?.day>row.day));
 if(!member)return false;
 const Agency=require('./group-member-agency'),rng={rngState:q.agencyBefore};
 return Agency.draw(rng)===q.decisionDraw&&
  rng.rngState===q.agencyAfter;
}
function verifyCoordinationReviewHistory(e){
 if(!Array.isArray(e.coordinationReviews))return false;
 const ids=new Set(),reviewed=new Set(),resigned=new Set();
 let day=-1;
 for(const row of e.coordinationReviews){
  if(ids.has(row?.id)||!verifyCoordinationReview(e,row)||
   row.day<day||
   resigned.has(row.mandateId)||
   reviewed.has(row.mandateId+':'+
    (row.source.originalReviewHash||row.source.responseHash)))
   return false;
  ids.add(row.id);reviewed.add(row.mandateId+':'+
   (row.source.originalReviewHash||row.source.responseHash));
  if(row.resigned)resigned.add(row.mandateId);
  day=row.day;
 }
 return true;
}
function reconsiderCoordinatorOnOriginalFailure(w,{
 groupId,mandateId,originalReviewId,day}={}){
 const e=lookup(w,groupId),original=peek(w)?.history?.find(x=>
  x.id===originalReviewId&&x.groupId===groupId&&x.day===day),
  incumbent=e&&coordinatorStatus(w,e.id,{day}),
  role=e?.coordinationMandates?.find(x=>x.id===mandateId);
 if(!e||!role||!original||
  !verifiedOriginalFailedWork(e,original)||
  !role.agreed||incumbent.mandateId!==role.id||
  !Number.isInteger(day)||day<=w.lastTickDay||
  e.failedEfforts<=0||
  (e.coordinationReviews||[]).some(x=>
   x.mandateId===role.id&&
   (x.resigned||x.source.originalReviewHash===original.hash)))
  return {reconsidered:false,
   reason:'no new genuine original failed work while personally serving'};
 const Agency=require('./group-member-agency'),
  t=Agency.ensure(w),agencyBefore=t.rngState,
  q0={origin:COORDINATION_REVIEW,
   id:'coord_review_'+hash({groupId:e.id,mandateId:role.id,
    originalReviewHash:original.hash}).slice(0,24),
   groupId:e.id,groupOriginHash:e.originHash,
   mandateId:role.id,originalMandateHash:role.sourceHash,
   memberActorId:role.memberActorId,
   originalMembershipHash:role.originalMembershipHash,
   originalReview:structuredClone(original),
   originalReviewHash:original.hash,
   day,groupStatus:e.status,
   completedEffortsAtDecision:e.completedEfforts,
   failedEffortsAtDecision:e.failedEfforts,
   noNewWorkOrInfluence:true,noOtherMemberBound:true,
   noCashOrLegalOffice:true};
 const resignChance=coordinationReviewChance(q0),
  decisionDraw=Agency.draw(t),resigned=decisionDraw<resignChance,
  q={...q0,agencyBefore,agencyAfter:t.rngState,
   resignChance,decisionDraw,resigned},
  row={id:q.id,origin:COORDINATION_REVIEW,
   mandateId:role.id,memberActorId:role.memberActorId,
   day,resigned,source:q,sourceHash:hash(q)};
 if(!verifyCoordinationReview(e,row))
  throw Error('Original group setback and independently considered coordinator mandate must match');
 e.coordinationReviews||=[];e.coordinationReviews.push(row);
 if(!validate(e))
  throw Error('Historical independent coordinator decision is not source-valid');
 record(ensure(w),e,day,
  resigned?'independent-coordinator-step-down':'coordinator-independent-continuation',
  {mandateId:role.id,memberActorId:role.memberActorId,
   originalFailedWorkHash:original.hash,reviewSourceHash:row.sourceHash,
   voluntary:resigned,noFundsOrWorkAdded:true,
   noReplacementAppointed:true},null);
 return {reconsidered:true,mandateId:role.id,
  originalFailedWorkHash:original.hash,
  independentlyResigned:resigned,
  status:resigned?'voluntarily-stepped-down':'voluntarily-continued',
  noNewWorkOrTreasuryAuthority:true,noChosenSuccessor:true};
}
function coordinationReviewStatus(w,groupId,{day}={}){
 const e=lookup(w,groupId),today=day===undefined?w.lastTickDay:day;
 if(!e||!Number.isInteger(today)||today<e.foundedDay||
  today>w.lastTickDay)
  throw Error('Only real local original association leader history can be read');
 return (e.coordinationReviews||[]).filter(x=>x.day<=today).map(x=>({
  id:x.id,mandateId:x.mandateId,
  memberActorId:x.memberActorId,day:x.day,
  independentlyResigned:x.resigned,
  ...(x.origin===COORDINATION_PURPOSE_REVIEW?
   {originalPurposeResponseHash:x.source.responseHash,
    voluntaryPurposeResponsibilityReview:true}:
   {originalFailedWorkHash:x.source.originalReviewHash}),
  noOtherMembersBound:true,noNewWorkOrMoney:true}));
}

function coordinatorStatus(w,groupId,{day}={}){
 const e=lookup(w,groupId);
 if(!e)throw Error('A real valid association must exist before coordination can be inspected');
 const d=day===undefined?w.lastTickDay:day;
 if(!Number.isInteger(d)||d<e.foundedDay)
  throw Error('A real current or historical day is necessary');
 const live=(e.coordinationMandates||[]).filter(row=>{
  const member=e.additionalMembers?.find(x=>
    x.actorId===row.memberActorId&&x.hash===row.originalMembershipHash);
  const departed=member?.active===false&&member.departure?.day<=d;
  const resignation=(e.coordinationReviews||[]).some(x=>
   x.mandateId===row.id&&x.resigned&&x.day<=d);
  return row.agreed&&d>=row.startDay&&d<=row.untilDay&&
   !departed&&!resignation;
 }).slice(-1)[0];
 return live?
  {groupId:e.id,actorId:live.memberActorId,name:live.memberName,
   role:'voluntary limited operational coordinator',
   foundingCharterUnchanged:true,mandateId:live.id,expiresDay:live.untilDay,
   noGovernmentOffice:true,noTreasuryPower:true,noCommandOverMembers:true}:
  {groupId:e.id,actorId:e.founder.actorId,name:e.founder.name,
   role:'original founder, no current delegated coordinator',
   foundingCharterUnchanged:true,mandateId:null,expiresDay:null,
   noGovernmentOffice:true,noTreasuryPower:true,noCommandOverMembers:true};
}
function offerCoordination(w,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
   Object.keys(params).some(k=>!['id','groupId','memberActorId','regionId',
    'place','startDay','untilDay','scope','meetingWitness'].includes(k)))
  throw Error('The coordinator cannot be appointed by claimed consent, title, payroll, law or compulsory order');
 const {id,groupId,memberActorId,regionId,place,
  startDay,untilDay,scope,meetingWitness}=params;
 const e=lookup(w,groupId),reg=Atlas.R[regionId],
  member=e?.origin==='player-declaration'?
   e.additionalMembers.find(x=>x.actorId===memberActorId&&x.active!==false):null;
 const Presence=require('./person-presence'),Agency=require('./group-member-agency');
 const local=typeof member?.witness?.details?.npcId==='string'?
  Presence.resolve(w,member.witness.details.npcId,place,startDay):null;
 if(!e||!member||!local||local.actorId!==memberActorId||
  local.name!==member.name||!reg||reg.polity!==e.polity||
  Atlas.LOCATION_REGION[place]!==regionId||
  !Number.isInteger(startDay)||startDay<e.foundedDay||
  startDay>w.lastTickDay||
  !Number.isInteger(untilDay)||untilDay<startDay||untilDay>10000000||
  !/^[a-z][a-z0-9_-]{5,80}$/.test(id)||
  typeof scope!=='string'||scope.trim().length<38||scope.length>520||
  typeof meetingWitness!=='string'||meetingWitness.trim().length<45||
  meetingWitness.length>600||
  (e.coordinationMandates||[]).some(x=>x.id===id||
   x.memberActorId===memberActorId&&x.startDay===startDay)||
  coordinatorStatus(w,e.id,{day:startDay}).mandateId!==null)
  throw Error('A real independently present voluntary member and unoccupied limited coordination term are required');
 const agency=Agency.ensure(w),agencyBefore=agency.rngState,
  prior=coordinatorStatus(w,e.id,{day:startDay});
 const partially={
  origin:COORDINATION,id,groupId:e.id,groupOriginHash:e.originHash,
  memberActorId,originalMembershipHash:member.hash,memberName:member.name,
  originalFounder:e.founder.name,regionId,place,startDay,untilDay,scope,
  meetingWitness,presenceHash:local.presence?hash(local.presence):null,
  groupStatusAtOffer:e.status,
  originalGroupCompletedEfforts:e.completedEfforts,
  originalGroupFailedEfforts:e.failedEfforts,
  previousCoordinator:prior.name,
  previousCoordinatorKind:prior.mandateId?'member':'founder'};
 const independentChance=coordinationChance(partially),
  decisionDraw=Agency.draw(agency),agreed=decisionDraw<independentChance;
 const source={...partially,agencyBefore,agencyAfter:agency.rngState,
  independentChance,decisionDraw,agreed};
 const row={id,origin:COORDINATION,memberActorId,memberName:member.name,
  originalMembershipHash:member.hash,startDay,untilDay,scope,
  agreed,status:agreed?'accepted':'declined',
  source,sourceHash:hash(source)};
 if(!verifyCoordinationMandate(e,row))
  throw Error('Only the original independently consenting member may agree to a bounded role');
 e.coordinationMandates||=[];
 e.coordinationMandates.push(row);
 if(!validate(e))throw Error('An invalid internal coordination cannot rewrite the founding');
 record(ensure(w),e,startDay,'voluntary-operational-coordination-response',
  {sourceHash:row.sourceHash,candidate:memberActorId,agreed,
   firstFounderRemainsHistorical:true,noLegalOffice:true,
   noGroupTreasuryTransfer:true,noBoundPeers:true},null);
 return {groupId,id,candidate:memberActorId,agreed,
  limitedCoordinationAccepted:agreed,termEndDay:untilDay,
  originalFounderPreserved:true,noOfficeOrSalaryGranted:true,
  noRightToCompelOtherMembers:true,noTreasuryAccess:true};
}

function visible(s,w){
 const id=Atlas.R[Atlas.LOCATION_REGION[s.world?.location]]?.polity,
  day=Math.floor((s.world?.minutes||0)/1440),r=peek(w);
 const entries=all(w).filter(e=>e.polity===id&&
  (e.releaseDay<=day||e.origin==='player-declaration'&&
   e.founder.name===s.player?.name));
 return {polity:Atlas.P[id]?.name||null,groups:entries.map(e=>({
  id:e.id,name:e.charter.name,kind:e.charter.kind,
  founder:e.founder.name,purpose:currentPurpose(e,{day:
   e.origin==='player-declaration'&&e.founder.name===s.player?.name?Infinity:day}),
  memberCount:e.origin==='worker-spinoff'?e.members:
   e.founder.name===s.player?.name?reportedMemberCount(e,day):null,
  status:e.status,
  publiclyAnnounced:e.releaseDay<=day,
  selfDeclaredNotLegallyRecognised:e.origin==='player-declaration',
  noInheritedAbility:true})),
  note:'A charter is not automatically a noble family or a verified bloodline. Other named members require real individual consent; future groups are not limited to the initial atlas.'};
}
module.exports={SOURCE_PLAYER,SOURCE_NPC,hash,seed,peek,ensure,validate,all,lookup,
 PURPOSE_SOURCE,registerPurposeRevisionAdapter,verifyPurposeHistory,
 currentPurpose,purposeHistoryStatus,revisePurposeFromEvidence,
 PURPOSE_RESPONSE,verifyPurposeResponsesHistory,considerPurposeRevision,purposeResponseStatus,
 PUBLISHED_PURPOSE_RESPONSE,verifyPublishedPurposeResponse,considerPublishedPurpose,
 registerOriginAdapter,registerFromEvidence,registerMemberConsentAdapter,
 registerMemberDepartureAdapter,admitMemberFromEvidence,departMemberFromEvidence,
 reportedMemberCount,createPlayer,syncWorkerFounders,month,visible,record,
 INTERNAL_PRIORITY,deliberateInternalPriority,internalPriorityStatus,
 INTERNAL_POSITION,considerInternalPosition,internalPositionStatus,
 INDEPENDENT_WORK_POSITION,reassessPublishedWork,
 INTERNAL_ROLE,proposeVoluntaryRole,voluntaryRoleStatus,
 PRIORITY_WORK,priorityWorkStatus,
 COORDINATION,offerCoordination,coordinatorStatus,
 COORDINATION_REVIEW,COORDINATION_PURPOSE_REVIEW,
 verifyCoordinationReview,verifyPurposeCoordinatorReview,
 reconsiderCoordinatorOnOriginalFailure,
 reconsiderCoordinatorOnPurposeDissent,coordinationReviewStatus,
 VOLUNTARY_TASK,TASK_SERVICE,COORDINATOR_TASK,
 voluntaryTaskChance,coordinatorTaskOfferChance,verifyVoluntaryTask,
 recordVoluntaryTask,eligibleVoluntaryTask,retainOriginalTaskService,
 voluntaryTaskStatus,
 TREASURY_AUDIT,verifyTreasuryAudit,openTreasuryAudit,addTreasuryReceipt,
 treasuryAuditStatus};
