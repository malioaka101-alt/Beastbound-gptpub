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
function validate(e){
 if(!e||!(TYPES.has(e.origin)||ADAPTERS.has(e.origin))||!Atlas.P[e.polity]||
  !e.charter||e.charter.id!==e.id||e.charter.polity!==e.polity||
  !e.witness||hash(e.witness)!==e.originHash||
  !Number.isInteger(e.foundedDay)||e.foundedDay<0)return false;
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
  additionalMembers:[],internalPriorities:[],internalPositions:[],internalRoles:[],priorityWork:[],coordinationMandates:[],
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
     e.charter.name+' reports a limited, independently checked contribution toward '+e.charter.duty+
      '. No family rank, inherited power or legal office follows.':null);
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
  if(e.funds>=upkeep&&upkeep){e.funds-=upkeep;e.unfundedMonths=0;
   e.status='organising';}
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
  return row.agreed&&d>=row.startDay&&d<=row.untilDay&&!departed;
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
  founder:e.founder.name,purpose:e.charter.duty,
  memberCount:e.origin==='worker-spinoff'?e.members:
   e.founder.name===s.player?.name?reportedMemberCount(e,day):null,
  status:e.status,
  publiclyAnnounced:e.releaseDay<=day,
  selfDeclaredNotLegallyRecognised:e.origin==='player-declaration',
  noInheritedAbility:true})),
  note:'A charter is not automatically a noble family or a verified bloodline. Other named members require real individual consent; future groups are not limited to the initial atlas.'};
}
module.exports={SOURCE_PLAYER,SOURCE_NPC,hash,seed,peek,ensure,validate,all,lookup,
 registerOriginAdapter,registerFromEvidence,registerMemberConsentAdapter,
 registerMemberDepartureAdapter,admitMemberFromEvidence,departMemberFromEvidence,
 reportedMemberCount,createPlayer,syncWorkerFounders,month,visible,record,
 INTERNAL_PRIORITY,deliberateInternalPriority,internalPriorityStatus,
 INTERNAL_POSITION,considerInternalPosition,internalPositionStatus,
 INTERNAL_ROLE,proposeVoluntaryRole,voluntaryRoleStatus,
 PRIORITY_WORK,priorityWorkStatus,
 COORDINATION,offerCoordination,coordinatorStatus};
