'use strict';
// Stage VI Living Intent belongs to the original Stage V Meridian web.
// A witnessed movement principle is not a free technique, mind attack or
// auto-controlled Qi: real practice, physiology, costs and checks remain.
const Crypto=require('node:crypto'),E=require('../engine.js'),C=require('./core'),
 Build=require('./build'),Net=require('./meridian-living-anatomy');
const SOURCE='earned-living-meridian-intent-v1',
 OBSERVE='witnessed-individual-meridian-intent-form-v1',
 PRACTICE='witnessed-individual-intent-repetition-v1',
 EMBODY='witnessed-living-intent-automatic-response-v1';
const h=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const int=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b;
const prose=(x,a=12,b=850)=>typeof x==='string'&&x.trim().length>=a&&x.trim().length<=b;
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{2,75}$/.test(x);
const fields=(x,allowed)=>x&&typeof x==='object'&&!Array.isArray(x)&&
 Object.keys(x).every(k=>allowed.includes(k));
const pointsNeeded=6;
function sourceWitness(s,i,origin,formId,routeId){
 if(!int(i,0,s.log.length-1))throw Error('A genuine original witnessed intent scene is required');
 const e=s.log[i],d=e?.details;
 if(e?.type!=='story'||d?.origin!==origin||
  d.intentId!==formId||d.routeId!==routeId||
  d.location!==s.world.location||
  !prose(e.text,15,900))
  throw Error('An individual original local witnessed circulation scene is required');
 return structuredClone(e);
}
function prerequisite(s,{atStage=5}={}){
 const m=s.player?.meridian,net=s.table?.powerPhysiology?.meridian?.advancedNetwork;
 if(!m||m.stage!==atStage||!net||
  !Net.verify(s)||!net.integrationAttempts?.some(x=>x.source?.formed))
  throw Error('Living Intent requires the genuinely earned source-verified Stage V Meridian Web');
 if(m.stability<55)throw Error('Unstable meridian pressure must be treated before exercising automatic intent');
 if(s.battle||s.encounter)throw Error('Living Intent requires an actual safe physical practice scene');
 return {m,net};
}
function routeReady(net,routeId){
 const route=net.routes?.[routeId];
 if(!route||route.integrity<route.required||
  route.injuries.some(x=>!route.care.some(y=>
   y.source.check.success&&y.source.injuryHash===x.seal)))
  throw Error('The individual original circulation route is not physically healed and integrated');
 if(!route.attempts.some(x=>x.source?.earned>0&&x.source.check.success))
  throw Error('Intent must emerge from an original successfully practised circulation method');
 return route;
}
function verifySource(s){
 const net=s.table?.powerPhysiology?.meridian?.advancedNetwork,
  forms=net?.intentForms,tests=net?.intentTests;
 if(!forms&&!tests)return (s.player?.meridian?.stage||0)<6;
 if(!forms||typeof forms!=='object'||Array.isArray(forms)||
  !Array.isArray(tests))return false;
 let formed=null,unique=new Set();
 for(const [key,form] of Object.entries(forms)){
  const x=form?.source,route=net.routes?.[x?.routeId];
  if(!id(key)||form.id!==key||form.origin!==SOURCE||
   !x||form.seal!==h(x)||x.origin!==SOURCE||x.id!==key||
   !route||x.routeSourceHash!==route.seal||
   !int(x.createdMinute,0,s.world.minutes)||!prose(x.name,3,140)||
   !prose(x.movement)||!prose(x.principle)||!prose(x.automaticSignal)||
   !prose(x.limit)||!prose(x.interference)||
   !x.witness||x.witnessHash!==h(x.witness)||
   x.witness.details?.origin!==OBSERVE||
   x.witness.details?.intentId!==key||
   !Array.isArray(form.practices)||!int(form.points,0,pointsNeeded))
   return false;
  let earned=0,last=x.createdMinute;
  for(const rec of form.practices){
   const a=rec?.source;
   if(rec?.origin!==SOURCE||rec.seal!==h(a)||a?.origin!==SOURCE||
    a.id!==key||a.routeId!==x.routeId||
    !int(a.minute,last,s.world.minutes)||
    !int(a.minutes,15,480)||!int(a.qiSpent,1,20)||
    !int(a.staminaSpent,1,20)||!int(a.roll,1,20)||
    a.check?.roll!==a.roll||
    a.earned!==(a.check?.success?a.check?.progress:0)||
    !a.checkEvent||h(a.checkEvent)!==a.checkEventHash||
    a.checkEvent.type!=='roll'||
    h(a.checkEvent.details)!==h(a.check)||
    !a.witness||h(a.witness)!==a.witnessHash||
    a.witness.details?.origin!==PRACTICE||
    a.witness.details?.intentId!==key||
    a.witness.details?.routeId!==x.routeId||
    unique.has(a.witnessHash)||!int(a.stabilityLost,0,5)||
    a.stabilityLost!==(a.check.degree==='severe failure'?2:0)||
    a.total!==Math.min(pointsNeeded,earned+a.earned))
    return false;
   earned=a.total;last=a.minute+a.minutes;
   unique.add(a.witnessHash);
  }
  if(form.points!==earned)return false;
 }
 for(const rec of tests){
  const a=rec?.source,f=forms[a?.id];
  if(rec?.origin!==SOURCE||rec.seal!==h(a)||a?.origin!==SOURCE||
   a.kind!=='living-intent-embodiment-check'||
   !f||a.routeId!==f.source.routeId||
   !int(a.minute,f.source.createdMinute,s.world.minutes)||
   !int(a.minutes,30,480)||!int(a.qiSpent,1,30)||
   !int(a.staminaSpent,1,20)||!int(a.roll,1,20)||
   a.check?.roll!==a.roll||a.formed!==a.check.success||
   !a.checkEvent||h(a.checkEvent)!==a.checkEventHash||
   h(a.checkEvent.details)!==h(a.check)||
   !a.witness||h(a.witness)!==a.witnessHash||
   a.witness.details?.origin!==EMBODY||
   a.witness.details?.intentId!==a.id||
   a.witness.details?.routeId!==a.routeId||
   !int(a.pointsAtAttempt,pointsNeeded,pointsNeeded)||
   unique.has(a.witnessHash))
   return false;
  unique.add(a.witnessHash);
  if(a.formed){
   if(formed)return false;
   formed=rec;
   const cap=a.capacity,profile=profileAt(s,6,1);
   if(!cap||cap.oldQi-a.qiSpent!==cap.newQi||
    cap.newMax!==Math.max(cap.oldMax,profile.qi)||
    cap.flow!==profile.flow||cap.recovery!==profile.recovery||
    !int(cap.oldMax,0,100000)||!int(cap.oldQi,a.qiSpent,100000))
    return false;
  }else if(a.capacity!==null)return false;
 }
 if((s.player?.meridian?.stage||0)>=6&&!formed)return false;
 if(s.player?.meridian?.stage===5&&formed)return false;
 if(formed&&s.player?.meridian?.stage===6){
  const m=s.player.meridian,cap=formed.source.capacity,
   profile=profileAt(s,6,1);
  if(m.intentDepth!==1||m.stableQiLimit!==profile.qi||
   m.flow!==cap.flow||m.recoveryRate!==cap.recovery||
   s.player.maxQi<cap.newMax)return false;
 }
 return true;
}
function verify(s){return Net.verify(s)&&verifySource(s);}
function ensure(s){
 const {net}=prerequisite(s);
 if(!verifySource(s))throw Error('Previously earned living intent receipt has been altered');
 if(!net.intentForms){net.intentForms={};net.intentTests=[];}
 return net;
}
function map(s,p={}){
 if(!fields(p,['id','routeId','name','movement','principle','automaticSignal',
  'limit','interference','witnessIndex'])||
  !id(p.id)||!id(p.routeId)||!prose(p.name,3,140)||
  !prose(p.movement)||!prose(p.principle)||!prose(p.automaticSignal)||
  !prose(p.limit)||!prose(p.interference))
  throw Error('An original intent form needs physical movement, practiced principle, limits, interference and a witnessed source');
 const {net}=prerequisite(s);const route=routeReady(net,p.routeId);
 const witness=sourceWitness(s,p.witnessIndex,OBSERVE,p.id,p.routeId);
 if(!prose(witness.details.observedResponse,20,800)||
  !prose(witness.details.trainingOrigin,20,800))
  throw Error('Source must show an already experienced bodily response and original training origin');
 if(net.intentForms?.[p.id])
  throw Error('This same intent form already has a preserved individual training history');
 const source={origin:SOURCE,id:p.id,routeId:route.id,
  routeSourceHash:route.seal,createdMinute:s.world.minutes,
  name:p.name.trim(),movement:p.movement.trim(),
  principle:p.principle.trim(),automaticSignal:p.automaticSignal.trim(),
  limit:p.limit.trim(),interference:p.interference.trim(),
  witness,witnessHash:h(witness),noNewTechnique:true};
 const form={origin:SOURCE,id:p.id,source,seal:h(source),
  points:0,practices:[]};
 ensure(s).intentForms[p.id]=form;
 return {mapped:true,id:p.id,routeId:route.id,
  learnedCombatArt:false,automaticallyEmbodied:false};
}
function practice(s,p={}){
 if(!fields(p,['id','witnessIndex','minutes'])||!id(p.id)||
  !int(p.minutes??60,15,480))
  throw Error('Intent practice needs a mapped living route and new witnessed physical repetition');
 const {net}=prerequisite(s),form=net.intentForms?.[p.id];
 if(!form||!verify(s))throw Error('An original unaltered mapped intent form is required');
 const route=routeReady(net,form.source.routeId);
 if(form.points>=pointsNeeded)
  throw Error('This form has earned enough practice for a separate embodiment test');
 const witness=sourceWitness(s,p.witnessIndex,PRACTICE,p.id,route.id);
 if(!prose(witness.details.bodilyFeedback,20,800)||
  !prose(witness.details.voluntaryAction,20,800))
  throw Error('Intent needs actual observed response, not a named mental power');
 const witnessHash=h(witness);
 if(form.practices.some(x=>x.source.witnessHash===witnessHash))
  throw Error('Each distinct real practice scene can only produce one original check');
 const minutes=p.minutes??60,qiCost=2+Math.ceil(route.source.load/2),
  staminaCost=Math.ceil(minutes/90)+1;
 if(!int(s.player.qi,qiCost,100000)||!int(s.player.stamina,staminaCost,100000))
  throw Error('Intent practice requires real Qi and Stamina reserves');
 const start=s.world.minutes,modifier=Math.floor((s.player.attributes.wis-10)/2)+
  2*(s.player.skills?.cultivation?.rank||0)+
  Math.floor(s.player.meridian.stability/25)-2,
  dc=15+route.source.load;
 s.player.qi-=qiCost;s.player.stamina-=staminaCost;
 const check=C.check(s,{modifier,dc,label:'Individual living Meridian intent practice'});
 const checkEvent=structuredClone(s.log.at(-1));
 const gained=check.success?check.progress:0,
  stabilityLost=check.degree==='severe failure'?2:0;
 if(stabilityLost)s.player.meridian.stability=Math.max(1,
  s.player.meridian.stability-stabilityLost);
 form.points=Math.min(pointsNeeded,form.points+gained);
 const source={origin:SOURCE,id:p.id,routeId:route.id,
  minute:start,minutes,qiSpent:qiCost,staminaSpent:staminaCost,
  witness,witnessHash,roll:check.roll,check:structuredClone(check),
  checkEvent,checkEventHash:h(checkEvent),earned:gained,total:form.points,
  stabilityLost};
 form.practices.push({origin:SOURCE,source,seal:h(source)});
 E.advance(s,minutes);require('./world').finalizeTime(s,start);
 if(!verify(s))throw Error('Original intent practice and physical resource receipt failed verification');
 return {practised:true,id:p.id,check,earned:gained,points:form.points,
  needed:pointsNeeded,qiSpent:qiCost,staminaSpent:staminaCost,
  stabilityLost,minutes,stageUnchanged:true,noFreeSkill:true};
}
function profileAt(s,stage,intentDepth){
 const records=s.table.powerPhysiology.meridian.gateRecords,
  net=s.table.powerPhysiology.meridian.advancedNetwork,
  previous=net.transitions.find(x=>x.source?.formed),
  extraordinary=previous?.source?.extraordinary;
 if(!int(extraordinary,1,8))
  throw Error('Real Stage V Extraordinary network coverage receipt is missing');
 return Build.meridianProfile(stage,{meridians:12,
  gatesP:records.filter(x=>x.quality==='Perfect').length,
  gatesS:records.filter(x=>x.quality==='Sound').length,
  gatesF:records.filter(x=>x.quality==='Flawed').length,
  seaRings:s.player.meridian.dantianSea.rings,
  extraordinary,webComplete:true,intentDepth});
}
function embody(s,p={}){
 if(!fields(p,['id','witnessIndex','minutes'])||!id(p.id)||
  !int(p.minutes??90,30,480))
  throw Error('Stage VI Living Intent needs an already trained form, witnessed reflex and real test duration');
 const {net}=prerequisite(s),form=net.intentForms?.[p.id];
 if(!form||!verify(s)||form.points<pointsNeeded)
  throw Error('Stage VI demands originally earned successful physical intent repetition');
 const route=routeReady(net,form.source.routeId),
  witness=sourceWitness(s,p.witnessIndex,EMBODY,p.id,route.id);
 if(!prose(witness.details.responseWithoutPrompt,24,800)||
  !prose(witness.details.controllableStop,24,800)||
  !prose(witness.details.pressureCountertest,24,800))
  throw Error('Source must demonstrate controllable automatic flow, pressure limits and actual stopping ability');
 const witnessHash=h(witness);
 if(net.intentTests.some(x=>x.source.witnessHash===witnessHash))
  throw Error('One embodiment challenge may not be rolled more than once');
 const minutes=p.minutes??90,qiCost=6+route.source.load,
  staminaCost=Math.ceil(minutes/90)+2;
 if(!int(s.player.qi,qiCost,100000)||!int(s.player.stamina,staminaCost,100000))
  throw Error('Human Qi and Stamina must actually sustain the final autonomic circulation test');
 const before=s.world.minutes,oldQi=s.player.qi,oldMax=s.player.maxQi,
  modifier=Math.floor((s.player.attributes.wis-10)/2)+
   2*(s.player.skills?.cultivation?.rank||0)+
   Math.floor(s.player.meridian.stability/25)-2,
  dc=20+route.source.load;
 s.player.qi-=qiCost;s.player.stamina-=staminaCost;
 const check=C.check(s,{modifier,dc,label:'Stage VI Living Intent Embodiment'});
 const checkEvent=structuredClone(s.log.at(-1));
 let capacity=null;
 if(check.success){
  const m=s.player.meridian,profile=profileAt(s,6,1);
  m.stage=6;m.intentDepth=1;m.flow=profile.flow;
  m.recoveryRate=profile.recovery;m.stableQiLimit=profile.qi;
  s.player.maxQi=Math.max(oldMax,profile.qi);
  capacity={oldQi,newQi:s.player.qi,oldMax,newMax:s.player.maxQi,
   flow:profile.flow,recovery:profile.recovery};
 }
 const source={origin:SOURCE,kind:'living-intent-embodiment-check',
  id:p.id,routeId:route.id,minute:before,minutes,
  witness,witnessHash,qiSpent:qiCost,staminaSpent:staminaCost,
  roll:check.roll,check:structuredClone(check),
  checkEvent,checkEventHash:h(checkEvent),formed:check.success,
  pointsAtAttempt:form.points,capacity};
 net.intentTests.push({origin:SOURCE,source,seal:h(source)});
 E.advance(s,minutes);require('./world').finalizeTime(s,before);
 if(!verify(s))throw Error('Stage VI source, physiology or stored Qi did not survive verification');
 return {attempted:true,formed:check.success,check,
  stage:s.player.meridian.stage,qiSpent:qiCost,staminaSpent:staminaCost,
  ...(capacity?{capacity}:{}),minutes,
  controlEstablished:check.success,
  noAutomaticMindAttackOrTechnique:true};
}
function status(s){
 const stage=s.player?.meridian?.stage||0;
 if(stage<5)return {ready:false,stage,
  note:'A real earned Stage V integrated network is required'};
 if(!verify(s))throw Error('Original Living Intent source or Stage V anatomy was altered');
 const net=s.table.powerPhysiology.meridian.advancedNetwork;
 return {ready:stage===5,stage,
  forms:Object.values(net.intentForms||{}).map(f=>({
   id:f.id,name:f.source.name,routeId:f.source.routeId,
   practicePoints:f.points,needed:pointsNeeded,
   limit:f.source.limit})),
  embodied:stage>=6,
  noAutomaticTechniqueOrMindDamage:true};
}
module.exports={SOURCE,OBSERVE,PRACTICE,EMBODY,
 map,practice,embody,status,verify,verifySource};
