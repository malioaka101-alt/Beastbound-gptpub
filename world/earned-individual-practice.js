'use strict';
// Reusable, private earned-achievement evidence for independently sourced
// individuals. No actor type, fixed career, birthday, spell, species grade,
// compulsory teacher, or universal power ladder is encoded here.
// An adapter must FIRST prove an actual individual action, then give its
// natural check roll and real task context to record().
const Crypto=require('node:crypto');
const ORIGIN='individual-achievement-evidence-v1',LIMIT=24;
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const validHash=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const isRecord=x=>x&&typeof x==='object'&&!Array.isArray(x);
const name=x=>typeof x==='string'&&/^[a-z][a-z0-9-]{2,44}$/.test(x);
const clamp=n=>Math.max(0,Math.min(100000,n));
function degree(points){
 if(!Number.isInteger(points)||points<0||points>100000)
  throw Error('Invalid earned achievement depth');
 return points>=130?4:points>=70?3:points>=30?2:points>=10?1:0;
}
function make(actorId,actorOriginHash,aptitudes){
 if(typeof actorId!=='string'||!actorId.length||
  !validHash(actorOriginHash)||!isRecord(aptitudes)||
  !Object.keys(aptitudes).length||
  Object.entries(aptitudes).some(([k,v])=>!name(k)||
   !Number.isInteger(v)||v<0||v>100))
  throw Error('Real identity, identity source and individual aptitudes are needed');
 const source={origin:ORIGIN,actorId,actorOriginHash,aptitudes:{...aptitudes}};
 const sourceHash=hash(source),empty=Object.fromEntries(
  Object.keys(aptitudes).map(k=>[k,0]));
 const methods=Object.fromEntries(Object.keys(aptitudes).map(k=>[k,{}]));
 return {version:1,origin:ORIGIN,source,sourceHash,
  points:{...empty},successfulMethods:structuredClone(methods),
  anchorPoints:{...empty},anchorMethods:structuredClone(methods),
  attempts:0,anchorAttempts:0,receipts:[],
  anchorHash:sourceHash,headHash:sourceHash};
}
function evaluate(e,apt,points){
 const depth=degree(points),dc=e.challenge+depth*2,
  mod=e.modifier+Math.floor((apt-50)/12)+depth,
  total=e.roll+mod+(e.roll===20?5:e.roll===1?-5:0),
  margin=total-dc,success=margin>=0,
  earned=success?(margin>=10?7:margin>=5?4:2)*
   (apt>=90?3:apt>=75?2:1):0;
 return {depth,dc,mod,total,margin,success,earned};
}
function verify(ledger,actorId,actorOriginHash,aptitudes){
 if(!isRecord(ledger)||ledger.version!==1||ledger.origin!==ORIGIN||
  !validHash(actorOriginHash)||!isRecord(aptitudes)||
  ledger.sourceHash!==hash(ledger.source)||
  ledger.source?.origin!==ORIGIN||
  ledger.source?.actorId!==actorId||
  ledger.source?.actorOriginHash!==actorOriginHash||
  JSON.stringify(ledger.source?.aptitudes)!==JSON.stringify(aptitudes)||
  !Number.isInteger(ledger.attempts)||ledger.attempts<0||
  !Number.isInteger(ledger.anchorAttempts)||ledger.anchorAttempts<0||
  !Array.isArray(ledger.receipts)||ledger.receipts.length>LIMIT||
  ledger.attempts!==ledger.anchorAttempts+ledger.receipts.length||
  !validHash(ledger.anchorHash)||!validHash(ledger.headHash))
  return false;
 const scores={},methods={};
 for(const k of Object.keys(aptitudes)){
  if(!name(k)||!Number.isInteger(aptitudes[k])||
   aptitudes[k]<0||aptitudes[k]>100||
   !Number.isInteger(ledger.anchorPoints?.[k])||
   ledger.anchorPoints[k]<0||ledger.anchorPoints[k]>100000||
   !isRecord(ledger.anchorMethods?.[k])||
   Object.entries(ledger.anchorMethods[k]).some(([method,n])=>
    !name(method)||!Number.isInteger(n)||n<1))
   return false;
  scores[k]=ledger.anchorPoints[k];
  methods[k]={...ledger.anchorMethods[k]};
 }
 if(Object.keys(ledger.points||{}).sort().join('|')!==
   Object.keys(aptitudes).sort().join('|')||
  Object.keys(ledger.successfulMethods||{}).sort().join('|')!==
   Object.keys(aptitudes).sort().join('|'))return false;
 let prev=ledger.anchorHash;
 const seen=new Set();
 for(const r of ledger.receipts){
  const e=r?.source;
  if(!isRecord(e)||r.hash!==hash(e)||e.previous!==prev||
   e.origin!==ORIGIN||e.actorId!==actorId||
   e.actorOriginHash!==actorOriginHash||
   !Object.hasOwn(aptitudes,e.domain)||!name(e.method)||
   !validHash(e.activityHash)||!validHash(e.contextHash)||
   !Number.isInteger(e.day)||e.day<0||
   !Number.isInteger(e.roll)||e.roll<1||e.roll>20||
   !Number.isInteger(e.challenge)||e.challenge<8||e.challenge>30||
   !Number.isInteger(e.modifier)||e.modifier<-10||e.modifier>15||
   seen.has(e.activityHash))return false;
  seen.add(e.activityHash);
  const result=evaluate(e,aptitudes[e.domain],scores[e.domain]);
  if(JSON.stringify(result)!==JSON.stringify(e.result))return false;
  if(result.success){
   scores[e.domain]=clamp(scores[e.domain]+result.earned);
   methods[e.domain][e.method]=(methods[e.domain][e.method]||0)+1;
  }
  prev=r.hash;
 }
 return prev===ledger.headHash&&Object.keys(aptitudes).every(k=>
  scores[k]===ledger.points[k]&&
  JSON.stringify(methods[k])===JSON.stringify(ledger.successfulMethods[k]));
}
function record(ledger,actorId,actorOriginHash,aptitudes,task){
 if(!verify(ledger,actorId,actorOriginHash,aptitudes))
  throw Error('The individual achievement evidence is not source-verified');
 if(!isRecord(task)||!Object.hasOwn(aptitudes,task.domain)||
  !name(task.method)||!validHash(task.activityHash)||
  !validHash(task.contextHash)||
  !Number.isInteger(task.day)||task.day<0||
  !Number.isInteger(task.roll)||task.roll<1||task.roll>20||
  !Number.isInteger(task.challenge)||task.challenge<8||task.challenge>30||
  !Number.isInteger(task.modifier)||task.modifier<-10||task.modifier>15||
  Object.keys(task).some(k=>!['domain','method','activityHash','contextHash',
   'day','roll','challenge','modifier'].includes(k)))
  throw Error('An actual sourced work task with independent roll and context is required; success, ranks and rewards are never caller-selected');
 if(ledger.receipts.some(r=>r.source.activityHash===task.activityHash))
  throw Error('A single real accomplishment can be credited only once');
 const result=evaluate(task,aptitudes[task.domain],ledger.points[task.domain]);
 const source={origin:ORIGIN,actorId,actorOriginHash,
  ...task,previous:ledger.headHash,result};
 const receipt={source,hash:hash(source)};
 ledger.headHash=receipt.hash;
 ledger.receipts.push(receipt);ledger.attempts++;
 if(result.success){
  ledger.points[task.domain]=clamp(ledger.points[task.domain]+result.earned);
  const methods=ledger.successfulMethods[task.domain];
  methods[task.method]=(methods[task.method]||0)+1;
 }
 if(ledger.receipts.length>LIMIT){
  const retired=ledger.receipts.shift(),e=retired.source;
  ledger.anchorHash=retired.hash;ledger.anchorAttempts++;
  if(e.result.success){
   ledger.anchorPoints[e.domain]=clamp(ledger.anchorPoints[e.domain]+e.result.earned);
   const m=ledger.anchorMethods[e.domain];
   m[e.method]=(m[e.method]||0)+1;
  }
 }
 if(!verify(ledger,actorId,actorOriginHash,aptitudes))
  throw Error('Real work failed to create internally coherent competence evidence');
 return {domain:task.domain,method:task.method,
  success:result.success,earned:result.earned,
  demonstratedDepth:degree(ledger.points[task.domain]),
  receiptHash:receipt.hash,freeRank:false,freeTechnique:false};
}
module.exports={ORIGIN,LIMIT,hash,make,verify,record,degree};
