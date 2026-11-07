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
 const r=ensure(w),polity=Atlas.R[Atlas.LOCATION_REGION[place]]?.polity;
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
  additionalMembers:[],
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
    hash(a.witness)===a.hash))
    throw Error('Unverified group work cannot create historical progress');
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
   record(r,e,day,success?'verified-limited-community-work':'unverified-community-effort',
    {actualEffortMinutes:effort,actualFundsSpent:cost,
     result:success?'limited shared work, not the truth of every proposal':'no independently verified result',
     decisionDraw:x,chance,
     originalActionHashes:attempts.map(a=>a.hash)},
    emit,success?
     e.charter.name+' reports a limited, independently checked contribution toward '+e.charter.duty+
      '. No family rank, inherited power or legal office follows.':null);
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
 reportedMemberCount,createPlayer,syncWorkerFounders,month,visible,record};
