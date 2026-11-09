'use strict';
// Stage VII Physique–Meridian Integration: a specific actual human tissue
// becomes an earned responsive part of the same existing living Qi network.
// Describing a rare organ, origin trait or body shape cannot create one.
const Crypto=require('node:crypto'),E=require('../engine.js'),C=require('./core'),
 Build=require('./build'),Net=require('./meridian-living-anatomy'),
 Intent=require('./meridian-living-intent');
const SOURCE='individually-earned-physique-meridian-integration-v1',
 OBSERVE='witnessed-existing-human-tissue-source-v1',
 PRACTICE='witnessed-tissue-circulation-adaptation-v1',
 EMBODY='witnessed-whole-body-physique-network-integration-v1';
const H=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const I=(n,a=0,b=1000000000)=>Number.isInteger(n)&&n>=a&&n<=b;
const P=(x,a=12,b=900)=>typeof x==='string'&&x.trim().length>=a&&x.trim().length<=b;
const ID=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{2,75}$/.test(x);
const keys=(x,k)=>x&&typeof x==='object'&&!Array.isArray(x)&&
 Object.keys(x).every(y=>k.includes(y));
const TARGET=6;
function scene(s,index,origin,id,routeId){
 if(!I(index,0,s.log.length-1))throw Error('An original individually witnessed tissue response is required');
 const e=s.log[index],d=e?.details;
 if(e?.type!=='story'||d?.origin!==origin||
  d.interfaceId!==id||d.routeId!==routeId||
  d.location!==s.world.location||!P(e.text,15,900))
  throw Error('There is no witnessed original physical tissue evidence for this precise route');
 return structuredClone(e);
}
function premise(s){
 const net=s.table?.powerPhysiology?.meridian?.advancedNetwork,m=s.player?.meridian;
 if(m?.stage!==6||!net||!Net.verify(s)||!Intent.verify(s)||
  !net.intentTests?.some(x=>x.source?.formed))
  throw Error('Stage VII physical integration requires an original source-earned Stage VI Living Intent');
 if(m.stability<55||s.battle||s.encounter)
  throw Error('Tissue and circulation cannot undergo forced integration while unstable or in immediate danger');
 return {net,m};
}
function currentRoute(net,id,intentId){
 const r=net.routes?.[id],i=net.intentForms?.[intentId];
 if(!r||r.integrity<r.required||!i||
  i.source?.routeId!==r.id||i.points<6||
  r.injuries.some(injury=>!r.care.some(x=>
   x.source.check.success&&x.source.injuryHash===injury.seal)))
  throw Error('The chosen tissue must belong to a genuinely practised, healed and intent-integrated circulation route');
 return r;
}
function profile(s,stage){
 const record=s.table.powerPhysiology.meridian.gateRecords,
  source=s.table.powerPhysiology.meridian.advancedNetwork.transitions
   .find(x=>x.source?.formed);
 if(!source)throw Error('Original Stage V Meridian network source is missing');
 return Build.meridianProfile(stage,{meridians:12,
  gatesP:record.filter(x=>x.quality==='Perfect').length,
  gatesS:record.filter(x=>x.quality==='Sound').length,
  gatesF:record.filter(x=>x.quality==='Flawed').length,
  seaRings:s.player.meridian.dantianSea.rings,
  extraordinary:source.source.extraordinary,
  webComplete:true,intentDepth:1});
}
function verifySource(s){
 const net=s.table?.powerPhysiology?.meridian?.advancedNetwork,
  maps=net?.tissueInterfaces,tests=net?.tissueTests;
 if(!maps&&!tests)return (s.player?.meridian?.stage||0)<7;
 if(!maps||typeof maps!=='object'||Array.isArray(maps)||!Array.isArray(tests))
  return false;
 let formed=null;const used=new Set();
 for(const [id,x] of Object.entries(maps)){
  const z=x?.source,r=net.routes?.[z?.routeId],
   intent=net.intentForms?.[z?.intentId];
  if(!ID(id)||x?.id!==id||x.origin!==SOURCE||x.seal!==H(z)||
   z?.origin!==SOURCE||z.id!==id||
   !r||z.routeHash!==r.seal||!intent||
   z.intentHash!==intent.seal||z.intentId!==intent.id||
   !P(z.tissue,4,180)||!P(z.existingAnatomy,20,900)||
   !P(z.organResponse)||!P(z.adaptationMethod)||!P(z.metabolicCost)||
   !P(z.injuryRisk)||!P(z.limit)||!I(z.minute,0,s.world.minutes)||
   !z.witness||H(z.witness)!==z.witnessHash||
   z.witness.details?.origin!==OBSERVE||
   z.witness.details?.interfaceId!==id||
   !Array.isArray(x.attempts)||!I(x.points,0,TARGET))
   return false;
  let progress=0,last=z.minute;
  for(const attempt of x.attempts){
   const a=attempt?.source;
   if(attempt?.origin!==SOURCE||attempt.seal!==H(a)||
    a?.origin!==SOURCE||a.id!==id||a.routeId!==z.routeId||
    !I(a.minute,last,s.world.minutes)||!I(a.minutes,15,480)||
    !I(a.qiSpent,1,50)||!I(a.staminaSpent,1,20)||
    !I(a.roll,1,20)||a.check?.roll!==a.roll||
    a.earned!==(a.check.success?a.check.progress:0)||
    !a.rollEvent||H(a.rollEvent)!==a.rollEventHash||
    a.rollEvent.type!=='roll'||H(a.rollEvent.details)!==H(a.check)||
    !a.witness||H(a.witness)!==a.witnessHash||
    a.witness.details?.origin!==PRACTICE||
    a.witness.details?.interfaceId!==id||
    used.has(a.witnessHash)||
    a.progress!==Math.min(TARGET,progress+a.earned)||
    a.stabilityLoss!==(a.check.degree==='severe failure'?2:0))
    return false;
   last=a.minute+a.minutes;progress=a.progress;used.add(a.witnessHash);
  }
  if(x.points!==progress)return false;
 }
 for(const receipt of tests){
  const a=receipt?.source,f=maps[a?.id];
  if(receipt?.origin!==SOURCE||receipt.seal!==H(a)||
   a?.origin!==SOURCE||a.kind!=='whole-body-physique-integration'||
   !f||a.routeId!==f.source.routeId||
   !I(a.minute,f.source.minute,s.world.minutes)||
   !I(a.minutes,30,480)||!I(a.roll,1,20)||
   !I(a.qiSpent,1,40)||!I(a.staminaSpent,1,20)||
   !a.witness||H(a.witness)!==a.witnessHash||
   a.witness.details?.origin!==EMBODY||
   a.witness.details?.interfaceId!==a.id||
   !a.rollEvent||H(a.rollEvent)!==a.rollEventHash||
   H(a.rollEvent.details)!==H(a.check)||
   a.check?.roll!==a.roll||a.formed!==a.check.success||
   !I(a.pointsAtAttempt,TARGET,TARGET)||used.has(a.witnessHash))
   return false;
  used.add(a.witnessHash);
  if(a.formed){
   if(formed)return false;
   formed=receipt;
   const cap=a.capacity,target=profile(s,7);
   if(!cap||cap.newMax!==Math.max(cap.oldMax,target.qi)||
    cap.newQi!==cap.oldQi-a.qiSpent||
    cap.flow!==target.flow||cap.recovery!==target.recovery||
    !I(cap.oldQi,a.qiSpent,100000)||!I(cap.oldMax,0,100000))
    return false;
  }else if(a.capacity!==null)return false;
 }
 if((s.player?.meridian?.stage||0)>=7&&!formed)return false;
 if(s.player?.meridian?.stage===6&&formed)return false;
 if(formed&&s.player?.meridian?.stage===7){
  const m=s.player.meridian,cap=formed.source.capacity,
   target=profile(s,7);
  if(m.physiqueIntegration!==1||m.stableQiLimit!==target.qi||
   m.flow!==cap.flow||m.recoveryRate!==cap.recovery||
   s.player.maxQi<cap.newMax)return false;
 }
 return true;
}
function verify(s){return Net.verify(s)&&Intent.verify(s)&&verifySource(s);}
function register(s,p={}){
 if(!keys(p,['id','routeId','intentId','tissue','existingAnatomy',
  'organResponse','adaptationMethod','metabolicCost','injuryRisk','limit','witnessIndex'])||
  !ID(p.id)||!ID(p.routeId)||!ID(p.intentId)||!P(p.tissue,4,180)||
  !P(p.existingAnatomy,20,900)||!P(p.organResponse)||
  !P(p.adaptationMethod)||!P(p.metabolicCost)||!P(p.injuryRisk)||
  !P(p.limit))
  throw Error('An original tissue interface must identify existing physical anatomy, method, metabolism, risk and limits');
 const {net}=premise(s),r=currentRoute(net,p.routeId,p.intentId),
  witness=scene(s,p.witnessIndex,OBSERVE,p.id,r.id);
 if(!P(witness.details.examination,25,800)||
  !P(witness.details.tissueResponse,20,800)||
  witness.details.evolvedPowerClaim===true)
  throw Error('The independently examined ordinary living tissue cannot be invented into a rare lineage organ');
 if(net.tissueInterfaces?.[p.id])
  throw Error('This existing individual tissue interface is already recorded');
 const source={origin:SOURCE,id:p.id,routeId:r.id,
  routeHash:r.seal,intentId:p.intentId,
  intentHash:net.intentForms[p.intentId].seal,
  minute:s.world.minutes,tissue:p.tissue.trim(),
  existingAnatomy:p.existingAnatomy.trim(),organResponse:p.organResponse.trim(),
  adaptationMethod:p.adaptationMethod.trim(),
  metabolicCost:p.metabolicCost.trim(),injuryRisk:p.injuryRisk.trim(),
  limit:p.limit.trim(),witness,witnessHash:H(witness),
  noSpecialLineageOrganGranted:true};
 const x={origin:SOURCE,id:p.id,source,seal:H(source),points:0,attempts:[]};
 if(!net.tissueInterfaces){net.tissueInterfaces={};net.tissueTests=[];}
 net.tissueInterfaces[p.id]=x;
 return {registered:true,id:p.id,noCreatedOrganOrAbility:true};
}
function work(s,p={}){
 if(!keys(p,['id','witnessIndex','minutes'])||!ID(p.id)||
  !I(p.minutes??60,15,480))
  throw Error('Physique interface practice requires one earned tissue, a genuine scene and time');
 const {net,m}=premise(s),x=net.tissueInterfaces?.[p.id];
 if(!x||!verify(s))throw Error('The source-verified individually studied tissue interface is missing');
 const r=currentRoute(net,x.source.routeId,x.source.intentId);
 if(x.points>=TARGET)throw Error('This tissue is ready for a distinct whole-body integration challenge');
 const witness=scene(s,p.witnessIndex,PRACTICE,x.id,r.id);
 if(!P(witness.details.adaptation,20,800)||
  !P(witness.details.welfareCountertest,20,800))
  throw Error('A practiced real tissue adaptation needs observed response and safe physical limits');
 const witnessHash=H(witness);
 if(x.attempts.some(y=>y.source.witnessHash===witnessHash))
  throw Error('A recorded tissue practice cannot produce repeated checks');
 const minutes=p.minutes??60,qiCost=3+Math.ceil(r.source.load/2),
  staminaCost=Math.ceil(minutes/90)+2;
 if(!I(s.player.qi,qiCost,100000)||!I(s.player.stamina,staminaCost,100000))
  throw Error('Actual physical and Qi reserves cannot support tissue adaptation');
 const start=s.world.minutes;
 s.player.qi-=qiCost;s.player.stamina-=staminaCost;
 const modifier=Math.floor((s.player.attributes.con-10)/2)+
  2*(s.player.skills?.cultivation?.rank||0)+
  Math.floor(m.stability/30)-1;
 const check=C.check(s,{modifier,dc:17+r.source.load,
  label:'Living physique–meridian tissue integration'});
 const rollEvent=structuredClone(s.log.at(-1)),
  earned=check.success?check.progress:0,
  stabilityLoss=check.degree==='severe failure'?2:0;
 if(stabilityLoss)m.stability=Math.max(1,m.stability-stabilityLoss);
 x.points=Math.min(TARGET,x.points+earned);
 const source={origin:SOURCE,id:x.id,routeId:r.id,minute:start,minutes,
  qiSpent:qiCost,staminaSpent:staminaCost,
  witness,witnessHash,roll:check.roll,
  check:structuredClone(check),rollEvent,rollEventHash:H(rollEvent),
  earned,progress:x.points,stabilityLoss};
 x.attempts.push({origin:SOURCE,source,seal:H(source)});
 E.advance(s,minutes);require('./world').finalizeTime(s,start);
 if(!verify(s))throw Error('Original earned tissue adaptation changed after resolution');
 return {trained:true,id:x.id,check,earned,points:x.points,
  needed:TARGET,qiSpent:qiCost,staminaSpent:staminaCost,
  stabilityLoss,minutes,noInstantPhysiqueOrOriginTrait:true};
}
function finish(s,p={}){
 if(!keys(p,['id','witnessIndex','minutes'])||!ID(p.id)||
  !I(p.minutes??90,30,480))
  throw Error('Actual whole-body physique integration requires a prepared interface and witnessed physical countertest');
 const {net,m}=premise(s),x=net.tissueInterfaces?.[p.id];
 if(!x||!verify(s)||x.points<TARGET)
  throw Error('The actual original tissue interface has not completed its earned adaptation');
 const route=currentRoute(net,x.source.routeId,x.source.intentId),
  witness=scene(s,p.witnessIndex,EMBODY,x.id,route.id);
 if(!P(witness.details.crossBodyResponse,24,900)||
  !P(witness.details.materialCost,24,900)||
  !P(witness.details.failureBoundary,24,900))
  throw Error('Stage VII needs a credible whole-body tissue network, sustained load and failure boundary');
 const witnessHash=H(witness);
 if(net.tissueTests.some(a=>a.source.witnessHash===witnessHash))
  throw Error('One whole-body tissue source cannot create multiple resolution rolls');
 const minutes=p.minutes??90,qiCost=8+route.source.load,
  staminaCost=Math.ceil(minutes/90)+3;
 if(!I(s.player.qi,qiCost,100000)||!I(s.player.stamina,staminaCost,100000))
  throw Error('Earned integration needs real available body and Meridian energy');
 const start=s.world.minutes,oldQi=s.player.qi,oldMax=s.player.maxQi;
 s.player.qi-=qiCost;s.player.stamina-=staminaCost;
 const modifier=Math.floor((s.player.attributes.con-10)/2)+
   2*(s.player.skills?.cultivation?.rank||0)+Math.floor(m.stability/30)-1;
 const check=C.check(s,{modifier,dc:21+route.source.load,
  label:'Stage VII living tissue–Meridian physiological integration'}),
  rollEvent=structuredClone(s.log.at(-1));
 let capacity=null;
 if(check.success){
  const target=profile(s,7);
  m.stage=7;m.physiqueIntegration=1;
  m.stableQiLimit=target.qi;m.flow=target.flow;
  m.recoveryRate=target.recovery;
  s.player.maxQi=Math.max(oldMax,target.qi);
  capacity={oldQi,newQi:s.player.qi,oldMax,newMax:s.player.maxQi,
   flow:target.flow,recovery:target.recovery};
 }
 const source={origin:SOURCE,kind:'whole-body-physique-integration',
  id:x.id,routeId:route.id,minute:start,minutes,
  witness,witnessHash,qiSpent:qiCost,staminaSpent:staminaCost,
  check:structuredClone(check),roll:check.roll,
  rollEvent,rollEventHash:H(rollEvent),pointsAtAttempt:x.points,
  formed:check.success,capacity};
 net.tissueTests.push({origin:SOURCE,source,seal:H(source)});
 E.advance(s,minutes);require('./world').finalizeTime(s,start);
 if(!verify(s))throw Error('Stage VII anatomical or energy capacity source failed verification');
 return {attempted:true,formed:check.success,check,
  stage:s.player.meridian.stage,qiSpent:qiCost,staminaSpent:staminaCost,
  minutes,capacity,originalTissueIntegrated:check.success,
  noHumanEvolutionOrRareOrganGranted:true};
}
function status(s){
 const stage=s.player?.meridian?.stage||0;
 if(stage<6)return {stage,available:false,
  note:'Verified Stage VI real Living Intent must precede tissue integration'};
 if(!verify(s))throw Error('Saved actual tissue–Meridian sources were altered');
 const net=s.table.powerPhysiology.meridian.advancedNetwork;
 return {stage,available:stage===6,
  interfaces:Object.values(net.tissueInterfaces||{}).map(x=>({
   id:x.id,tissue:x.source.tissue,points:x.points,required:TARGET,
   physicalLimit:x.source.limit})),
  integrated:stage>=7,
  noNewBiologicalLineageOrAutomaticTechnique:true};
}
module.exports={SOURCE,OBSERVE,PRACTICE,EMBODY,register,work,finish,
 status,verify,verifySource};
