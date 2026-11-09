'use strict';
// #11, first earned bridge: 3-Circle Matrix -> 4-Circle Dynamic Architecture.
// Reuses the original Core, Circle I/II/III proof and Build.arcaneProfile.
// Neither a user-written geometry nor a rank counter licenses a spell.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),Build=require('./build'),D=require('./disciplines'),
 W=require('./world');
const ORIGIN='source-earned-arcane-dynamic-architecture-v1',
 MAP='witnessed-real-four-circle-dynamic-geometry-v1',
 WORK='witnessed-dynamic-arcane-channel-training-v1',
 TRIAL='witnessed-independent-dynamic-circle-feedback-test-v1',
 REPAIR='witnessed-arcane-core-structural-repair-v1';
const H=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const integer=(v,min=0,max=1000000000)=>Number.isInteger(v)&&v>=min&&v<=max;
const prose=(v,min=15,max=900)=>typeof v==='string'&&v.trim().length>=min&&v.trim().length<=max;
const ID=v=>typeof v==='string'&&/^[a-z][a-z0-9_-]{2,75}$/.test(v);
const only=(p,keys)=>p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).every(k=>keys.includes(k));
const REQUIRED=6;
function third(s){
 const a=s.player?.arcane;
 if(!a||a.circles<3)throw Error('The genuine original Third Circle is needed before dynamic architecture');
 if(a.circles===3)return D.verifyThirdCircle(s);
 const p=Build.arcaneProfile(3),
  shadow={...s,player:{...s.player,arcane:{
   ...a,circles:3,channels:p.channels,structuredMana:p.mana,
   maxComplexity:p.maxComplexity,intake:p.intake,
   loadTolerance:p.loadTolerance,preparedCapacity:p.prepared
  }}};
 return D.verifyThirdCircle(shadow);
}
function witness(s,index,origin,id){
 if(!integer(index,0,s.log.length-1))throw Error('A prior original Arcane observation is required');
 const e=s.log[index];
 if(e?.type!=='story'||e.details?.origin!==origin||
   e.details?.planId!==id||e.details?.location!==s.world.location||
   !prose(e.text,18,900))
  throw Error('There is no genuinely witnessed current local Arcane architecture source');
 return structuredClone(e);
}
function allowed(s){
 if(s.battle||s.encounter||
  s.table?.combatants?.player?.status&&s.table.combatants.player.status!=='ok')
  throw Error('Dynamic Circle architecture requires a real safe working environment');
}
function source(s){
 const net=s.table?.arcaneArchitecture?.dynamic;
 if(!net)return null;
 if(!net||net.origin!==ORIGIN||!net.plans||typeof net.plans!=='object'||
  Array.isArray(net.plans)||!Array.isArray(net.history)||
  !Array.isArray(net.repairs)||!Array.isArray(net.transitions))return false;
 const thirdProof=H(third(s).proof);
 let completed=null;
 const seen=new Set();
 for(const [id,plan] of Object.entries(net.plans)){
  const z=plan?.source;
  if(!ID(id)||plan.id!==id||plan.origin!==ORIGIN||plan.seal!==H(z)||
   z?.origin!==ORIGIN||z.id!==id||z.thirdHash!==thirdProof||
   !prose(z.name,3,150)||!prose(z.geometry,35,900)||
   !prose(z.switching)||!prose(z.returnFeedback)||
   !prose(z.interference)||!prose(z.failureMode)||
   !prose(z.limits)||!integer(z.load,1,9)||
   !integer(z.minute,0,s.world.minutes)||
   z.witnessHash!==H(z.witness)||z.witness?.details?.origin!==MAP||
   z.witness.details?.planId!==id||
   !Array.isArray(plan.attempts)||!integer(plan.points,0,REQUIRED))
   return false;
  let count=0,last=z.minute;
  for(const attempt of plan.attempts){
   const a=attempt?.source;
   if(attempt?.origin!==ORIGIN||attempt.seal!==H(a)||
    a?.origin!==ORIGIN||a.id!==id||
    !integer(a.minute,last,s.world.minutes)||
    !integer(a.minutes,15,480)||
    !integer(a.manaSpent,1,40)||!integer(a.staminaSpent,1,12)||
    !integer(a.roll,1,20)||a.check?.roll!==a.roll||
    a.earned!==(a.check?.success?a.check?.progress:0)||
    a.points!==Math.min(REQUIRED,count+a.earned)||
    a.coreStrain!==(a.check?.degree==='severe failure'?6:0)||
    a.matrixStrain!==(a.check?.degree==='severe failure'?2:0)||
    a.witnessHash!==H(a.witness)||
    a.witness?.details?.origin!==WORK||
    a.witness.details.planId!==id||
    !a.rollEvent||a.rollEventHash!==H(a.rollEvent)||
    a.rollEvent.type!=='roll'||H(a.rollEvent.details)!==H(a.check)||
    seen.has(a.witnessHash))return false;
   seen.add(a.witnessHash);count=a.points;last=a.minute+a.minutes;
  }
  if(plan.points!==count)return false;
 }
 for(const receipt of net.history){
  const a=receipt?.source,plan=net.plans?.[a?.id];
  if(receipt?.origin!==ORIGIN||receipt.seal!==H(a)||
   a?.origin!==ORIGIN||a.kind!=='independently-tested-dynamic-architecture'||
   !plan||a.planHash!==plan.seal||
   a.pointsAtTrial!==REQUIRED||
   !integer(a.minute,plan.source.minute,s.world.minutes)||
   !integer(a.minutes,30,480)||
   !integer(a.manaSpent,1,50)||!integer(a.staminaSpent,1,12)||
   !integer(a.roll,1,20)||a.check?.roll!==a.roll||
   a.formed!==a.check.success||
   a.witnessHash!==H(a.witness)||a.witness?.details?.origin!==TRIAL||
   a.witness.details.planId!==a.id||
   !a.rollEvent||a.rollEventHash!==H(a.rollEvent)||
   a.rollEvent.type!=='roll'||H(a.rollEvent.details)!==H(a.check)||
   seen.has(a.witnessHash))return false;
  seen.add(a.witnessHash);
  if(a.formed){
   if(completed)return false;
   completed=receipt;
   const p=Build.arcaneProfile(4),cap=a.capacity;
   if(!cap||cap.oldMana-a.manaSpent!==cap.newMana||
    cap.newMax!==Math.max(cap.oldMax,p.mana)||
    cap.channels!==p.channels||cap.maxComplexity!==p.maxComplexity||
    cap.intake!==p.intake||cap.preparedCapacity!==p.prepared||
    cap.loadTolerance!==p.loadTolerance||
    !integer(cap.oldMana,a.manaSpent,100000)||
    !integer(cap.oldMax,0,100000)||
    a.integrity!==Math.max(40,Math.min(100,60+Math.max(0,a.check.margin))))
    return false;
  }else if(a.capacity!==null||a.integrity!==null)return false;
 }
 for(const repair of net.repairs){
  const a=repair?.source;
  if(repair?.origin!==REPAIR||repair.seal!==H(a)||
   a?.origin!==REPAIR||!integer(a.minute,0,s.world.minutes)||
   !integer(a.minutes,30,480)||!integer(a.manaSpent,1,30)||
   !integer(a.staminaSpent,1,12)||
   !integer(a.roll,1,20)||a.check?.roll!==a.roll||
   a.coreRestored!==(a.check.success?3:0)||
   a.stressRestored!==(a.check.success?Math.min(2,a.stressBefore):0)||
   !integer(a.stressBefore,0,100000)||
   a.witnessHash!==H(a.witness)||a.witness?.details?.origin!==REPAIR||
   !a.rollEvent||a.rollEventHash!==H(a.rollEvent)||
   a.rollEvent.type!=='roll'||H(a.rollEvent.details)!==H(a.check)||
   seen.has(a.witnessHash))return false;
  seen.add(a.witnessHash);
 }
 const recordedStress=Object.values(net.plans).reduce((n,p)=>
  n+p.attempts.reduce((k,x)=>k+x.source.matrixStrain,0),0);
 const healedStress=net.repairs.reduce((n,x)=>n+x.source.stressRestored,0);
 if((s.player.arcane.dynamicStress||0)!==Math.max(0,recordedStress-healedStress))
  return false;
 if(net.transitions.length!==(completed?1:0)||
  (completed&&(
   net.transitions[0].seal!==completed.seal||
   H(net.transitions[0].source)!==H(completed.source))))
  return false;
 if(s.player.arcane.circles>=4&&!completed)return false;
 if(s.player.arcane.circles===3&&completed)return false;
 if(completed&&s.player.arcane.circles===4){
  const a=s.player.arcane,p=Build.arcaneProfile(4),
   cap=completed.source.capacity;
  if(a.dynamicIntegrity!==completed.source.integrity||
   a.channels!==p.channels||a.structuredMana!==p.mana||
   a.maxComplexity!==p.maxComplexity||a.intake!==p.intake||
   a.loadTolerance!==p.loadTolerance||
   a.preparedCapacity!==p.prepared||s.player.maxMana<cap.newMax)
   return false;
 }
 return true;
}
function verify(s){
 try{third(s);return source(s)!==false&&
  (s.player.arcane.circles===3||s.player.arcane.circles===4&&!!s.table?.arcaneArchitecture?.dynamic);}
 catch{return false;}
}
function ensure(s){
 third(s);
 if(!verify(s))throw Error('Original Arcane Circle source or saved architecture was altered');
 s.table.arcaneArchitecture||={};
 s.table.arcaneArchitecture.dynamic||={
  origin:ORIGIN,plans:{},history:[],repairs:[],transitions:[]
 };
 return s.table.arcaneArchitecture.dynamic;
}
function map(s,p={}){
 if(!only(p,['id','name','geometry','switching','returnFeedback','interference',
  'failureMode','limits','load','witnessIndex'])||
  !ID(p.id)||!prose(p.name,3,150)||!prose(p.geometry,35,900)||
  !prose(p.switching)||!prose(p.returnFeedback)||
  !prose(p.interference)||!prose(p.failureMode)||
  !prose(p.limits)||!integer(p.load,1,9))
  throw Error('Fourth Circle map needs an original three-Circle geometry redesign, switching, feedback, load, limits and interference');
 if(s.player.arcane?.circles!==3)
  throw Error('The next dynamic architecture must genuinely follow an earned Third Circle');
 const base=third(s);allowed(s);
 if(!verify(s))throw Error('Existing original Arcane source is inconsistent');
 const event=witness(s,p.witnessIndex,MAP,p.id);
 if(!prose(event.details?.measuredSwitching,24,850)||
  !prose(event.details?.independentCountertest,24,850))
  throw Error('A real measured dynamic switching mechanism and independent countertest are required');
 const net=s.table?.arcaneArchitecture?.dynamic;
 if(net?.plans[p.id])throw Error('Original dynamic geometry already exists');
 const z={origin:ORIGIN,id:p.id,name:p.name.trim(),
  geometry:p.geometry.trim(),switching:p.switching.trim(),
  returnFeedback:p.returnFeedback.trim(),interference:p.interference.trim(),
  failureMode:p.failureMode.trim(),limits:p.limits.trim(),
  load:p.load,minute:s.world.minutes,thirdHash:H(base.proof),
  witness:event,witnessHash:H(event),notASpell:true};
 ensure(s).plans[p.id]={origin:ORIGIN,id:p.id,source:z,seal:H(z),
  attempts:[],points:0};
 return {mapped:true,id:p.id,existingCorePreserved:true,
  noNewCircleOrSpell:true,requiredIntegrity:REQUIRED};
}
function work(s,p={}){
 if(!only(p,['id','witnessIndex','minutes'])||!ID(p.id)||
  !integer(p.minutes??90,15,480))
  throw Error('Use a mapped dynamic Circle and a separate witnessed working interval');
 if(s.player.arcane?.circles!==3)throw Error('Fourth Circle must follow the genuinely earned Third Circle');
 allowed(s);const net=ensure(s),plan=net.plans[p.id];
 if(!plan||!verify(s))throw Error('Original dynamic architecture map or source was altered');
 if(plan.points>=REQUIRED)throw Error('The mapped Circle is ready for a separate dynamic test');
 const event=witness(s,p.witnessIndex,WORK,p.id);
 if(!prose(event.details?.observedRouting,24,850)||
  !prose(event.details?.observedInterference,24,850))
  throw Error('A genuinely witnessed route-switch and interference observation are required');
 const witnessHash=H(event);
 if(plan.attempts.some(x=>x.source.witnessHash===witnessHash))
  throw Error('One original dynamic working cannot be rerolled');
 const minutes=p.minutes??90,manaSpent=3+Math.ceil(plan.source.load/2),
  staminaSpent=Math.ceil(minutes/120);
 if(!integer(s.player.mana,manaSpent,100000)||
    !integer(s.player.stamina,staminaSpent,100000))
  throw Error('Fourth Circle construction requires actual Mana and Stamina');
 const before=s.world.minutes,a=s.player.arcane,
  modifier=Math.floor((s.player.attributes.int-10)/2)+
    2*(s.player.skills?.arcana?.rank||0)+
    (a.coreStability>=85?1:a.coreStability<60?-2:0),
  dc=17+plan.source.load;
 s.player.mana-=manaSpent;s.player.stamina-=staminaSpent;
 const check=C.check(s,{modifier,dc,label:'Original Fourth Circle dynamic switching'});
 const rollEvent=structuredClone(s.log.at(-1)),
  earned=check.success?check.progress:0,
  coreStrain=check.degree==='severe failure'?6:0,
  matrixStrain=check.degree==='severe failure'?2:0;
 a.coreStability=Math.max(0,a.coreStability-coreStrain);
 a.dynamicStress=(a.dynamicStress||0)+matrixStrain;
 plan.points=Math.min(REQUIRED,plan.points+earned);
 const receipt={origin:ORIGIN,id:p.id,minute:before,
  minutes,manaSpent,staminaSpent,roll:check.roll,
  check:structuredClone(check),rollEvent,rollEventHash:H(rollEvent),
  witness:event,witnessHash,
  coreStrain,matrixStrain,earned,points:plan.points};
 plan.attempts.push({origin:ORIGIN,source:receipt,seal:H(receipt)});
 E.advance(s,minutes);W.finalizeTime(s,before);
 if(!verify(s))throw Error('Earned dynamic Circle receipt was changed after the actual original check');
 return {practised:true,id:p.id,check,progress:plan.points,
  required:REQUIRED,earned,manaSpent,staminaSpent,minutes,
  coreStrain,matrixStrain,noAutomaticSpell:true};
}
function form(s,p={}){
 if(!only(p,['id','witnessIndex','minutes'])||!ID(p.id)||
  !integer(p.minutes??90,30,480))
  throw Error('A previously earned dynamic architecture requires its own independently observed resonance test');
 if(s.player.arcane?.circles!==3)throw Error('Original Third Circle must precede the new architecture');
 allowed(s);const net=ensure(s),plan=net.plans[p.id];
 if(!plan||!verify(s)||plan.points<REQUIRED)
  throw Error('The same original design must be physically integrated before a distinct Fourth Circle test');
 const event=witness(s,p.witnessIndex,TRIAL,p.id);
 if(!prose(event.details?.changedCircuit,24,850)||
  !prose(event.details?.failureResponse,24,850))
  throw Error('A genuine dynamic adjustment and failure-response test are required');
 const witnessHash=H(event);
 if(net.history.some(x=>x.source.witnessHash===witnessHash))
  throw Error('The same independent Fourth Circle attempt cannot be rerolled');
 const minutes=p.minutes??90,manaSpent=6+plan.source.load,
  staminaSpent=2+Math.ceil(minutes/120);
 if(!integer(s.player.mana,manaSpent,100000)||
  !integer(s.player.stamina,staminaSpent,100000))
  throw Error('Original fourth-Circle trial needs real Mana and Stamina');
 const a=s.player.arcane,start=s.world.minutes,
  beforeMana=s.player.mana,oldMax=s.player.maxMana;
 s.player.mana-=manaSpent;s.player.stamina-=staminaSpent;
 const modifier=Math.floor((s.player.attributes.int-10)/2)+
  2*(s.player.skills?.arcana?.rank||0)+
  (a.coreStability>=85?1:a.coreStability<60?-2:0);
 const check=C.check(s,{modifier,dc:20+plan.source.load,
  label:'Fourth Circle Dynamic Architecture independent resonance trial'});
 const rollEvent=structuredClone(s.log.at(-1));
 let capacity=null,integrity=null;
 if(check.success){
  const b=Build.arcaneProfile(4);
  a.circles=4;a.channels=b.channels;a.structuredMana=b.mana;
  a.maxComplexity=b.maxComplexity;a.intake=b.intake;
  a.loadTolerance=b.loadTolerance;a.preparedCapacity=b.prepared;
  s.player.maxMana=Math.max(oldMax,b.mana);
  integrity=Math.max(40,Math.min(100,60+Math.max(0,check.margin)));
  a.dynamicIntegrity=integrity;
  capacity={oldMana:beforeMana,newMana:s.player.mana,
   oldMax,newMax:s.player.maxMana,channels:b.channels,
   maxComplexity:b.maxComplexity,intake:b.intake,
   loadTolerance:b.loadTolerance,preparedCapacity:b.prepared};
 }
 const receipt={origin:ORIGIN,kind:'independently-tested-dynamic-architecture',
  id:p.id,planHash:plan.seal,minute:start,minutes,manaSpent,staminaSpent,
  roll:check.roll,check:structuredClone(check),
  rollEvent,rollEventHash:H(rollEvent),witness:event,
  witnessHash,pointsAtTrial:plan.points,
  formed:check.success,integrity,capacity};
 net.history.push({origin:ORIGIN,source:receipt,seal:H(receipt)});
 if(check.success)net.transitions.push({origin:ORIGIN,source:receipt,seal:H(receipt)});
 E.advance(s,minutes);W.finalizeTime(s,start);
 if(!verify(s))throw Error('Original dynamic Circle transition failed proof verification');
 return {attempted:true,formed:check.success,check,
  circle:s.player.arcane.circles,progress:plan.points,
  manaSpent,staminaSpent,minutes,capacity,
  noNewSpellGranted:true};
}
function repair(s,p={}){
 if(!only(p,['witnessIndex','minutes'])||!integer(p.minutes??90,30,480))
  throw Error('Arcane structural recovery needs a witnessed repair and real time');
 const a=s.player.arcane;
 if(a?.circles<3)throw Error('A genuine original matrix is needed for Arcane repair');
 allowed(s);const net=ensure(s);
 if(a.coreStability>=100)throw Error('The Mana Core has no measured structural instability to repair');
 const event=witness(s,p.witnessIndex,REPAIR,'arcane_core');
 if(!prose(event.details?.diagnosis,24,850)||
  !prose(event.details?.repairWork,24,850))
  throw Error('A witnessed diagnosis and actual corrective geometry work are required');
 const proof=H(event);
 if(net.repairs.some(x=>x.source.witnessHash===proof))
  throw Error('A single witnessed repair cannot produce repeated rolls');
 const minutes=p.minutes??90,manaSpent=2,
  staminaSpent=Math.ceil(minutes/120);
 if(!integer(s.player.mana,manaSpent,100000)||
  !integer(s.player.stamina,staminaSpent,100000))
  throw Error('Repair work requires actual Mana and Stamina');
 const start=s.world.minutes;s.player.mana-=manaSpent;s.player.stamina-=staminaSpent;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.int-10)/2)+
  2*(s.player.skills?.arcana?.rank||0),
  dc:14,label:'Source-witnessed Arcane core structural correction'});
 const rollEvent=structuredClone(s.log.at(-1)),restored=check.success?3:0,
  stressBefore=a.dynamicStress||0,stressRestored=check.success?Math.min(2,stressBefore):0;
 a.coreStability=Math.min(100,a.coreStability+restored);
 a.dynamicStress=Math.max(0,stressBefore-stressRestored);
 const receipt={origin:REPAIR,minute:start,minutes,manaSpent,staminaSpent,
  stressBefore,stressRestored,
  roll:check.roll,check:structuredClone(check),
  rollEvent,rollEventHash:H(rollEvent),
  witness:event,witnessHash:proof,coreRestored:restored};
 net.repairs.push({origin:REPAIR,source:receipt,seal:H(receipt)});
 E.advance(s,minutes);W.finalizeTime(s,start);
 if(!verify(s))throw Error('Real Arcane repair result does not match source');
 return {attempted:true,restored,check,coreStability:a.coreStability,
  manaSpent,staminaSpent,minutes,noFreeNewMagic:true};
}
function status(s){
 const a=s.player?.arcane||{};
 if(a.circles<3)return {available:false,circles:a.circles||0,
  note:'Genuinely earned Mana Core and three existing Circle sources are required'};
 if(!verify(s))return {available:false,circles:a.circles,
  reason:'Existing Circle III or advanced source evidence is inconsistent'};
 const net=s.table?.arcaneArchitecture?.dynamic;
 return {available:a.circles===3,circles:a.circles,
  dynamicArchitecture:a.circles>=4?'formed':'not yet formed',
  plans:Object.values(net?.plans||{}).map(x=>({
   id:x.id,name:x.source.name,progress:x.points,required:REQUIRED,
   load:x.source.load})),
  coreStability:a.coreStability,
  inheritedMatrixIntegrity:a.matrixIntegrity,
  noAutomaticSpellOrTeacher:true};
}
module.exports={ORIGIN,MAP,WORK,TRIAL,REPAIR,
 verify,third,map,work,form,repair,status};
