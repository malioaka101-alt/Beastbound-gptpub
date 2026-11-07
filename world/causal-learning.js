'use strict';
// Actor-neutral evidence bridge: independently sourced teaching, observing,
// reading and discovery may lead to an individual's OWN practiced learning.
// The trusted world adapter is responsible for actual access, free choices,
// comprehensible communication, materials, anatomy, time and native rolls.
// This module never grants powers, ranks, titles, spells or a teacher's skill.
const Practice=require('./earned-individual-practice');
const ORIGIN='causally-sourced-individual-learning-v1', LIMIT=24;
const hash=Practice.hash;
const goodHash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const plain=x=>typeof x==='string'&&/^[a-z][a-z0-9-]{2,48}$/.test(x);
const exactly=(x,keys)=>obj(x)&&Object.keys(x).every(k=>keys.includes(k));
function make(actorId,actorOriginHash){
 if(typeof actorId!=='string'||!actorId.length||!goodHash(actorOriginHash))
  throw Error('A sourced individual identity is required');
 const source={origin:ORIGIN,actorId,actorOriginHash},h=hash(source);
 return {version:1,origin:ORIGIN,source,sourceHash:h,
  anchorHash:h,headHash:h,anchorAttempts:0,attempts:0,receipts:[]};
}
function verify(ledger,actorId,actorOriginHash){
 if(!obj(ledger)||ledger.version!==1||ledger.origin!==ORIGIN||
  !goodHash(actorOriginHash)||ledger.sourceHash!==hash(ledger.source)||
  ledger.source?.origin!==ORIGIN||ledger.source?.actorId!==actorId||
  ledger.source?.actorOriginHash!==actorOriginHash||
  !Number.isInteger(ledger.attempts)||ledger.attempts<0||
  !Number.isInteger(ledger.anchorAttempts)||ledger.anchorAttempts<0||
  !Array.isArray(ledger.receipts)||ledger.receipts.length>LIMIT||
  ledger.attempts!==ledger.anchorAttempts+ledger.receipts.length||
  !goodHash(ledger.anchorHash)||!goodHash(ledger.headHash))return false;
 let prev=ledger.anchorHash;
 for(const r of ledger.receipts){
  const e=r?.source;
  if(!obj(e)||r.hash!==hash(e)||e.previous!==prev||
   e.origin!==ORIGIN||e.actorId!==actorId||
   e.actorOriginHash!==actorOriginHash||!plain(e.route)||
   !goodHash(e.accessHash)||!goodHash(e.activityHash)||
   !(e.sourceHash===null||goodHash(e.sourceHash))||
   !goodHash(e.practiceReceiptHash)||
   !Number.isInteger(e.day)||e.day<0||
   typeof e.success!=='boolean'||
   !Number.isInteger(e.earned)||e.earned<0||e.earned>100||
   !plain(e.domain)||!plain(e.method)||
   Object.keys(e).sort().join('|')!==[
    'accessHash','activityHash','actorId','actorOriginHash','day',
    'domain','earned','method','origin','practiceReceiptHash',
    'previous','route','sourceHash','success'].sort().join('|'))return false;
  prev=r.hash;
 }
 return prev===ledger.headHash;
}
// A person may have an actual, successful demonstration of a method, but
// their rank cannot be passed on. Receipts must be independently earned.
function provenDemonstration(person){
 if(!exactly(person,['actorId','actorOriginHash','aptitudes','practice','receiptHash'])||
  typeof person.actorId!=='string'||!goodHash(person.actorOriginHash)||
  !goodHash(person.receiptHash)||
  !Practice.verify(person.practice,person.actorId,
   person.actorOriginHash,person.aptitudes))
  throw Error('Unverified independently earned source demonstration');
 const receipt=person.practice.receipts.find(x=>
  x.hash===person.receiptHash&&x.source.result?.success===true);
 if(!receipt)throw Error('Sharing requires an actual successful, retained source demonstration');
 const e=receipt.source;
 const attestation={origin:ORIGIN,actorId:person.actorId,
  actorOriginHash:person.actorOriginHash,receiptHash:receipt.hash,
  domain:e.domain,method:e.method,activityHash:e.activityHash};
 return {hash:hash(attestation),attestation};
}
// An access record is an adapter-authenticated real event: dialogue freely
// offered, public observation, a genuine document, original experiment, etc.
// Neither a player's asserted consent nor a fee is sufficient evidence.
// 'authorise' MUST be a private trusted adapter, never a player API callback.
function resolve({ledger,learner,route,accessHash,source=null,task,authorise}={}){
 if(!obj(learner)||!exactly(learner,
  ['actorId','actorOriginHash','aptitudes','practice'])||
  !Practice.verify(learner.practice,learner.actorId,
   learner.actorOriginHash,learner.aptitudes)||
  !verify(ledger,learner.actorId,learner.actorOriginHash))
  throw Error('A sourced learner and unchanged learning history are required');
 if(!plain(route)||!goodHash(accessHash)||typeof authorise!=='function'||
  !obj(task))throw Error('A genuine, independently checked access and work event is required');
 let sourceHash=null;
 if(source!==null){
  if(exactly(source,['recordHash'])&&goodHash(source.recordHash)){
   // A written/public/previously witnessed record still needs a real
   // provenance check by the adapter; its hash alone proves no access.
   sourceHash=source.recordHash;
  }else{
   const proof=provenDemonstration(source);
   if(source.actorId===learner.actorId&&
    source.actorOriginHash===learner.actorOriginHash)
    throw Error('Own demonstration is independent practice, not borrowed teaching');
   sourceHash=proof.hash;
  }
 }
 if(ledger.receipts.some(r=>r.source.activityHash===task.activityHash))
  throw Error('The same actual learning attempt cannot be replayed');
 const opportunity={learnerId:learner.actorId,
  learnerOriginHash:learner.actorOriginHash,route,accessHash,
  sourceHash,domain:task.domain,method:task.method,
  activityHash:task.activityHash,day:task.day};
 // Only an engine adapter can attest the REAL scene or study opportunity:
 // location, access, understanding, personal choice, resources, capacity,
 // non-coercion (when needed), and an actual independently resolved roll.
 if(authorise(opportunity)!==true)
  throw Error('No verified, feasible, voluntarily accessible learning event');
 const practice=structuredClone(learner.practice),next=structuredClone(ledger);
 const achieved=Practice.record(practice,learner.actorId,
  learner.actorOriginHash,learner.aptitudes,task);
 const e={origin:ORIGIN,actorId:learner.actorId,
  actorOriginHash:learner.actorOriginHash,
  route,accessHash,sourceHash,activityHash:task.activityHash,
  day:task.day,domain:task.domain,method:task.method,
  practiceReceiptHash:achieved.receiptHash,
  success:achieved.success,earned:achieved.earned,previous:next.headHash};
 const r={source:e,hash:hash(e)};
 next.receipts.push(r);next.headHash=r.hash;next.attempts++;
 if(next.receipts.length>LIMIT){
  next.anchorHash=next.receipts.shift().hash;next.anchorAttempts++;
 }
 if(!verify(next,learner.actorId,learner.actorOriginHash)||
  !Practice.verify(practice,learner.actorId,
   learner.actorOriginHash,learner.aptitudes))
  throw Error('The individual learning trace failed internal verification');
 Object.assign(learner.practice,practice);Object.assign(ledger,next);
 return {receiptHash:r.hash,practiceReceiptHash:achieved.receiptHash,
  success:achieved.success,earned:achieved.earned,
  demonstratedDepth:achieved.demonstratedDepth,
  route,sourceHash,noTransferredRank:true,noAutomaticTechnique:true,
  noCompulsoryTeacher:true};
}
module.exports={ORIGIN,LIMIT,make,verify,provenDemonstration,resolve};
