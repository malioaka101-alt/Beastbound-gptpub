'use strict';
// Stage VIII is a bounded, contestable local physical circulation phenomenon,
// not ownership of an area, coercion of people or a free combat power.
const Crypto=require('node:crypto'),E=require('../engine.js'),C=require('./core'),
 Build=require('./build'),Net=require('./meridian-living-anatomy'),
 Phys=require('./meridian-physique-integration');
const SOURCE='earned-individual-living-meridian-domain-v1',
 MAP='witnessed-local-meridian-domain-boundary-v1',
 PRACTICE='witnessed-individual-domain-counterpractice-v1',
 FORM='witnessed-limited-domain-formation-v1',
 PULSE='witnessed-contestable-domain-maintenance-v1';
const H=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const I=(v,a=0,b=1000000000)=>Number.isInteger(v)&&v>=a&&v<=b;
const P=(v,a=12,b=850)=>typeof v==='string'&&v.trim().length>=a&&v.trim().length<=b;
const ID=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{2,75}$/.test(x);
const only=(x,fields)=>x&&typeof x==='object'&&!Array.isArray(x)&&
 Object.keys(x).every(k=>fields.includes(k));
const NEED=6;
function location(s){
 const place=require('../world/lived-places').location(s,s.world.location);
 if(!place?.biome)throw Error('The physical local biome is not established');
 return place;
}
function scene(s,index,origin,id,routeId){
 if(!I(index,0,s.log.length-1))throw Error('A prior witnessed real local domain scene is required');
 const e=s.log[index],d=e?.details;
 if(e?.type!=='story'||d?.origin!==origin||
  d.domainId!==id||d.routeId!==routeId||
  d.location!==s.world.location||!P(e.text,15,900))
  throw Error('The observed local domain and its actual circulation source are missing');
 return structuredClone(e);
}
function prerequisite(s,stage=7){
 const m=s.player?.meridian,net=s.table?.powerPhysiology?.meridian?.advancedNetwork;
 if(m?.stage!==stage||!net||!Net.verify(s)||!Phys.verify(s)||
  !net.tissueTests?.some(x=>x.source?.formed))
  throw Error('A genuine Stage VII individual tissue-integrated Meridian network is necessary');
 if(s.battle||s.encounter||m.stability<55)
  throw Error('Unresolved danger or damaged circulation prevents safe domain training');
 return {m,net,place:location(s)};
}
function route(net,id,tissueId){
 const r=net.routes?.[id],t=net.tissueInterfaces?.[tissueId];
 if(!r||r.integrity<r.required||
  r.injuries.some(x=>!r.care.some(y=>
   y.source.check.success&&y.source.injuryHash===x.seal))||
  !t||t.source?.routeId!==id||t.points<6)
  throw Error('Domain source requires the original healed and physically integrated tissue route');
 return {r,t};
}
function profile(s,stage){
 const gates=s.table.powerPhysiology.meridian.gateRecords,
  formation=s.table.powerPhysiology.meridian.advancedNetwork.transitions.find(x=>x.source?.formed);
 if(!formation)throw Error('No real Stage V network circulation to sustain the domain');
 return Build.meridianProfile(stage,{meridians:12,
  gatesP:gates.filter(x=>x.quality==='Perfect').length,
  gatesS:gates.filter(x=>x.quality==='Sound').length,
  gatesF:gates.filter(x=>x.quality==='Flawed').length,
  seaRings:s.player.meridian.dantianSea.rings,
  extraordinary:formation.source.extraordinary,
  webComplete:true,intentDepth:1});
}
function verifySource(s){
 const net=s.table?.powerPhysiology?.meridian?.advancedNetwork,
  maps=net?.domainPlans,tests=net?.domainTests,pulses=net?.domainPulses;
 if(!maps&&!tests&&!pulses)return (s.player?.meridian?.stage||0)<8;
 if(!maps||typeof maps!=='object'||Array.isArray(maps)||
  !Array.isArray(tests)||!Array.isArray(pulses))return false;
 let formed=null,used=new Set();
 for(const [id,plan] of Object.entries(maps)){
  const z=plan?.source,r=net.routes?.[z?.routeId],t=net.tissueInterfaces?.[z?.tissueId];
  if(!ID(id)||plan.id!==id||plan.origin!==SOURCE||plan.seal!==H(z)||
   z?.origin!==SOURCE||z.id!==id||!r||z.routeHash!==r.seal||
   !t||z.tissueHash!==t.seal||t.source.routeId!==z.routeId||
   !P(z.name,3,140)||!P(z.principle)||!P(z.environment)||
   !P(z.counter)||!P(z.collapse)||!P(z.limit)||
   !I(z.radius,1,1000000)||!I(z.minute,0,s.world.minutes)||
   !z.witness||H(z.witness)!==z.witnessHash||
   z.witness.details?.origin!==MAP||
   z.witness.details?.domainId!==id||
   z.witness.details?.radiusMetres!==z.radius||
   !Array.isArray(plan.attempts)||!I(plan.points,0,NEED))return false;
  let pts=0,last=z.minute;
  for(const attempt of plan.attempts){
   const a=attempt?.source;
   if(attempt?.origin!==SOURCE||attempt.seal!==H(a)||
    a?.origin!==SOURCE||a.id!==id||a.routeId!==z.routeId||
    !I(a.minute,last,s.world.minutes)||!I(a.minutes,15,480)||
    !I(a.qiSpent,1,50)||!I(a.staminaSpent,1,20)||
    !I(a.roll,1,20)||a.check?.roll!==a.roll||
    a.earned!==(a.check.success?a.check.progress:0)||
    a.progress!==Math.min(NEED,pts+a.earned)||
    a.backlash!==(a.check.degree==='severe failure'?2:0)||
    !a.rollEvent||H(a.rollEvent)!==a.rollEventHash||
    H(a.rollEvent.details)!==H(a.check)||
    !a.witness||H(a.witness)!==a.witnessHash||
    a.witness.details?.origin!==PRACTICE||
    a.witness.details?.domainId!==id||used.has(a.witnessHash))
    return false;
   used.add(a.witnessHash);pts=a.progress;last=a.minute+a.minutes;
  }
  if(plan.points!==pts)return false;
 }
 for(const receipt of tests){
  const a=receipt?.source,plan=maps[a?.id];
  if(receipt?.origin!==SOURCE||receipt.seal!==H(a)||
   a?.origin!==SOURCE||a.kind!=='real-bounded-domain-formation'||
   !plan||a.routeId!==plan.source.routeId||
   !I(a.minute,plan.source.minute,s.world.minutes)||
   !I(a.minutes,30,480)||!I(a.qiSpent,1,50)||
   !I(a.staminaSpent,1,20)||!I(a.roll,1,20)||
   a.check?.roll!==a.roll||a.formed!==a.check.success||
   !a.rollEvent||H(a.rollEvent)!==a.rollEventHash||
   H(a.rollEvent.details)!==H(a.check)||
   !a.witness||H(a.witness)!==a.witnessHash||
   a.witness.details?.origin!==FORM||
   a.witness.details?.domainId!==a.id||
   a.witness.details?.radiusMetres!==plan.source.radius||
   a.pointsAtAttempt!==NEED||used.has(a.witnessHash))
   return false;
  used.add(a.witnessHash);
  if(a.formed){
   if(formed)return false;
   formed=receipt;
   const target=profile(s,8),cap=a.capacity;
   if(!cap||cap.newMax!==Math.max(cap.oldMax,target.qi)||
    cap.newQi!==cap.oldQi-a.qiSpent||
    cap.flow!==target.flow||cap.recovery!==target.recovery||
    !I(cap.oldQi,a.qiSpent,100000)||!I(cap.oldMax,0,100000))
    return false;
  }else if(a.capacity!==null)return false;
 }
 for(const receipt of pulses){
  const a=receipt?.source,plan=maps[a?.id];
  if(receipt?.origin!==SOURCE||receipt.seal!==H(a)||
   a?.origin!==SOURCE||a.kind!=='contestable-local-domain-pulse'||
   !formed||!plan||a.id!==formed.source.id||
   !I(a.minute,formed.source.minute,s.world.minutes)||
   !I(a.minutes,5,60)||!I(a.qiSpent,1,100)||
   !I(a.staminaSpent,1,20)||!I(a.roll,1,20)||
   a.check?.roll!==a.roll||a.sustained!==a.check.success||
   !a.rollEvent||H(a.rollEvent)!==a.rollEventHash||
   H(a.rollEvent.details)!==H(a.check)||
   !a.witness||H(a.witness)!==a.witnessHash||
   a.witness.details?.origin!==PULSE||
   a.witness.details?.domainId!==a.id||
   a.radius!==plan.source.radius||
   a.location!==a.witness.details.location||
   (a.location===plan.source.location?
     a.biome!==plan.source.biome:
     (!P(a.witness.details.ambientSupport,24,800)||
      a.witness.details.radiusMetres!==a.radius||
      a.biome!==a.witness.details.biome))||
   a.sustainedUntil!==(a.sustained?a.minute+a.minutes:null)||
   used.has(a.witnessHash))return false;
  used.add(a.witnessHash);
 }
 if((s.player?.meridian?.stage||0)>=8&&!formed)return false;
 if(s.player?.meridian?.stage===7&&formed)return false;
 if(formed&&s.player?.meridian?.stage===8){
  const target=profile(s,8),cap=formed.source.capacity,m=s.player.meridian;
  if(m.domainIntegration!==1||m.stableQiLimit!==target.qi||
   m.flow!==cap.flow||m.recoveryRate!==cap.recovery||
   s.player.maxQi<cap.newMax)return false;
 }
 return true;
}
function verify(s){return Net.verify(s)&&verifySource(s);}
function map(s,p={}){
 if(!only(p,['id','tissueId','routeId','name','principle','environment',
  'counter','collapse','limit','radius','witnessIndex'])||
  !ID(p.id)||!ID(p.tissueId)||!ID(p.routeId)||
  !P(p.name,3,140)||!P(p.principle)||!P(p.environment)||
  !P(p.counter)||!P(p.collapse)||!P(p.limit)||!I(p.radius,1,1000000))
  throw Error('Domain proposal needs measured range, actual environment, physical source, counters and collapse risks');
 const {net,m,place}=prerequisite(s),{r,t}=route(net,p.routeId,p.tissueId);
 const witness=scene(s,p.witnessIndex,MAP,p.id,r.id);
 if(witness.details?.radiusMetres!==p.radius||
  !P(witness.details?.physicalMeasurement,24,800)||
  !P(witness.details?.environmentSupport,24,800)||
  witness.details?.biome!==place.biome||
  p.radius>Math.max(2,Math.floor(m.flow*m.stability/20)))
  throw Error('Range must come from physically measured and locally supported bounded Qi circulation');
 if(net.domainPlans?.[p.id])throw Error('That original bounded domain blueprint is already recorded');
 const source={origin:SOURCE,id:p.id,tissueId:t.id,tissueHash:t.seal,
  routeId:r.id,routeHash:r.seal,name:p.name.trim(),
  principle:p.principle.trim(),environment:p.environment.trim(),
  counter:p.counter.trim(),collapse:p.collapse.trim(),limit:p.limit.trim(),
  radius:p.radius,location:s.world.location,biome:place.biome,
  witness,witnessHash:H(witness),minute:s.world.minutes,
  noControlOfOtherBeings:true};
 const item={origin:SOURCE,id:p.id,source,seal:H(source),
  points:0,attempts:[]};
 if(!net.domainPlans){net.domainPlans={};net.domainTests=[];net.domainPulses=[];}
 net.domainPlans[p.id]=item;
 return {mapped:true,id:p.id,radiusMetres:p.radius,active:false,
  noWorldOrPersonControl:true};
}
function practice(s,p={}){
 if(!only(p,['id','witnessIndex','minutes'])||!ID(p.id)||
  !I(p.minutes??45,15,480))
  throw Error('Domain work needs witnessed physical pressure practice and real time');
 const {net,m}=prerequisite(s),plan=net.domainPlans?.[p.id];
 if(!plan||!verify(s))throw Error('Source-mapped bounded local domain is required');
 route(net,plan.source.routeId,plan.source.tissueId);
 if(s.world.location!==plan.source.location)
  throw Error('That original domain is tied to a real local environment, not remote land');
 if(plan.points>=NEED)throw Error('Source-verified domain practice is ready for its independent formation test');
 const witness=scene(s,p.witnessIndex,PRACTICE,p.id,plan.source.routeId);
 if(!P(witness.details?.counterPressure,24,800)||
  !P(witness.details?.observedCollapse,24,800))
  throw Error('Real environmental resistance and collapse limits must be independently witnessed');
 const proof=H(witness);
 if(plan.attempts.some(x=>x.source.witnessHash===proof))
  throw Error('One domain scene may not be rolled twice');
 const minutes=p.minutes??45,qiSpent=2+Math.ceil(plan.source.radius/4),
  staminaSpent=Math.ceil(minutes/90)+2;
 if(!I(s.player.qi,qiSpent,100000)||
  !I(s.player.stamina,staminaSpent,100000))
  throw Error('The observed domain exercise requires actual Qi and Stamina');
 const before=s.world.minutes;
 s.player.qi-=qiSpent;s.player.stamina-=staminaSpent;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.wis-10)/2)+
  2*(s.player.skills?.cultivation?.rank||0)+Math.floor(m.stability/30)-1,
  dc:17+Math.ceil(plan.source.radius/5),label:'Bounded environmental Meridian domain practice'});
 const rollEvent=structuredClone(s.log.at(-1));
 const earned=check.success?check.progress:0,
  backlash=check.degree==='severe failure'?2:0;
 if(backlash)m.stability=Math.max(1,m.stability-backlash);
 plan.points=Math.min(NEED,plan.points+earned);
 const source={origin:SOURCE,id:plan.id,routeId:plan.source.routeId,
  minute:before,minutes,qiSpent,staminaSpent,
  witness,witnessHash:proof,roll:check.roll,check:structuredClone(check),
  rollEvent,rollEventHash:H(rollEvent),
  earned,progress:plan.points,backlash};
 plan.attempts.push({origin:SOURCE,source,seal:H(source)});
 E.advance(s,minutes);require('./world').finalizeTime(s,before);
 if(!verify(s))throw Error('Domain practice source or original result was altered');
 return {practised:true,check,points:plan.points,needed:NEED,
  qiSpent,staminaSpent,backlash,minutes,
  noPeopleOrCombatControl:true};
}
function form(s,p={}){
 if(!only(p,['id','witnessIndex','minutes'])||!ID(p.id)||
  !I(p.minutes??90,30,480))
  throw Error('A separate witnessed local formation challenge is required');
 const {net,m}=prerequisite(s),plan=net.domainPlans?.[p.id];
 if(!plan||!verify(s)||plan.points<NEED)
  throw Error('Domain formation requires genuinely earned bounded pressure practice');
 const witness=scene(s,p.witnessIndex,FORM,p.id,plan.source.routeId);
 if(witness.details?.radiusMetres!==plan.source.radius||
  !P(witness.details?.environmentCounter,24,850)||
  !P(witness.details?.measuredBoundary,24,850))
  throw Error('A local measured domain with an actual environmental countertest is required');
 if(net.domainTests.some(x=>x.source.witnessHash===H(witness)))
  throw Error('A prior real domain formation check cannot be rerolled');
 const minutes=p.minutes??90,qiSpent=6+Math.ceil(plan.source.radius/3),
  staminaSpent=Math.ceil(minutes/90)+3;
 if(!I(s.player.qi,qiSpent,100000)||!I(s.player.stamina,staminaSpent,100000))
  throw Error('Real energy and tissue recovery are insufficient for domain formation');
 const before=s.world.minutes,oldQi=s.player.qi,oldMax=s.player.maxQi;
 s.player.qi-=qiSpent;s.player.stamina-=staminaSpent;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.wis-10)/2)+
  2*(s.player.skills?.cultivation?.rank||0)+Math.floor(m.stability/30)-1,
  dc:20+Math.ceil(plan.source.radius/5),label:'Stage VIII bounded Living Domain formation'});
 const rollEvent=structuredClone(s.log.at(-1));
 let capacity=null;
 if(check.success){
  const target=profile(s,8);
  m.stage=8;m.domainIntegration=1;m.stableQiLimit=target.qi;
  m.flow=target.flow;m.recoveryRate=target.recovery;
  s.player.maxQi=Math.max(oldMax,target.qi);
  capacity={oldQi,newQi:s.player.qi,oldMax,newMax:s.player.maxQi,
   flow:target.flow,recovery:target.recovery};
 }
 const source={origin:SOURCE,kind:'real-bounded-domain-formation',
  id:plan.id,routeId:plan.source.routeId,minute:before,minutes,
  witness,witnessHash:H(witness),qiSpent,staminaSpent,
  roll:check.roll,check:structuredClone(check),rollEvent,
  rollEventHash:H(rollEvent),formed:check.success,
  pointsAtAttempt:plan.points,capacity};
 net.domainTests.push({origin:SOURCE,source,seal:H(source)});
 E.advance(s,minutes);require('./world').finalizeTime(s,before);
 if(!verify(s))throw Error('Stage VIII original domain formation source or capacity changed');
 return {attempted:true,formed:check.success,check,
  stage:s.player.meridian.stage,qiSpent,staminaSpent,minutes,
  capacity,domainScope:'bounded local personal circulation; no other beings controlled'};
}
function pulse(s,p={}){
 if(!only(p,['id','witnessIndex','minutes'])||!ID(p.id)||
  !I(p.minutes??10,5,60))
  throw Error('Domain maintenance needs a witnessed local environment and bounded duration');
 const net=s.table?.powerPhysiology?.meridian?.advancedNetwork;
 const plan=net?.domainPlans?.[p.id];
 if(!plan||!net.domainTests?.some(x=>x.source.formed&&x.source.id===p.id)||
  s.player?.meridian?.stage<8||!verify(s)||
  s.battle||s.encounter)
  throw Error('A real earned local limited domain without unresolved danger is required');
 const witness=scene(s,p.witnessIndex,PULSE,p.id,plan.source.routeId);
 const place=location(s);
 if(!P(witness.details?.environmentCounter,24,800)||
  !P(witness.details?.independentBoundary,24,800))
  throw Error('Real ambient interference and independent external limits must be observed');
 if(s.world.location!==plan.source.location&&
  (!P(witness.details?.ambientSupport,24,800)||
   witness.details?.biome!==place.biome||
   witness.details?.radiusMetres!==plan.source.radius))
  throw Error('A learned domain can travel only with new locally witnessed physical environmental support and unchanged measured range');
 const wHash=H(witness);
 if(net.domainPulses.some(x=>x.source.witnessHash===wHash))
  throw Error('That environmental domain attempt has already been resolved');
 const minutes=p.minutes??10,qiSpent=2+Math.ceil(minutes/5)+Math.ceil(plan.source.radius/5),
  staminaSpent=1+Math.ceil(minutes/20);
 if(!I(s.player.qi,qiSpent,100000)||!I(s.player.stamina,staminaSpent,100000))
  throw Error('This living field cannot maintain itself without Qi and body effort');
 const before=s.world.minutes;
 s.player.qi-=qiSpent;s.player.stamina-=staminaSpent;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.wis-10)/2)+
  2*(s.player.skills?.cultivation?.rank||0),
  dc:16+Math.ceil(plan.source.radius/5),
  label:'Actually contested local Meridian domain maintenance'});
 const rollEvent=structuredClone(s.log.at(-1));
 const source={origin:SOURCE,kind:'contestable-local-domain-pulse',
  id:plan.id,minute:before,minutes,qiSpent,staminaSpent,
  witness,witnessHash:wHash,roll:check.roll,check:structuredClone(check),
  rollEvent,rollEventHash:H(rollEvent),sustained:check.success,
  sustainedUntil:check.success?before+minutes:null,
  radius:plan.source.radius,location:s.world.location,biome:place.biome};
 net.domainPulses.push({origin:SOURCE,source,seal:H(source)});
 E.advance(s,minutes);require('./world').finalizeTime(s,before);
 if(!verify(s))throw Error('Independent environment counter and actual domain cost verification failed');
 return {attempted:true,sustained:check.success,collapsed:!check.success,
  check,minutes,qiSpent,staminaSpent,radiusMetres:plan.source.radius,
  limitedEffect:'Only personally measured Qi-flow coordination, not area ownership, automatic damage or NPC control'};
}
function status(s){
 const stage=s.player?.meridian?.stage||0;
 if(stage<7)return {stage,available:false,note:'Actual Stage VII tissue-integrated Meridian is required'};
 if(!verify(s))throw Error('Original bounded domain receipts or physiology were altered');
 const net=s.table.powerPhysiology.meridian.advancedNetwork;
 return {stage,available:stage===7,
  domains:Object.values(net.domainPlans||{}).map(d=>({
   id:d.id,name:d.source.name,radiusMetres:d.source.radius,
   biome:d.source.biome,local:d.source.location===s.world.location,
   points:d.points,needed:NEED,limit:d.source.limit})),
  formed:stage>=8,noControlOfOtherPeopleOrRealms:true};
}
module.exports={SOURCE,MAP,PRACTICE,FORM,PULSE,
 map,practice,form,pulse,status,verify,verifySource};
