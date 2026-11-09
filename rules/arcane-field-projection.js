'use strict';
// Arcane V projects the actual Fourth Circle matrix into a measured local
// mana environment. The geometry is personally earned; effects are separate
// learned formulas, and a field does not control an occupied area or its lives.
const Crypto=require('node:crypto'),E=require('../engine.js'),C=require('./core'),
 B=require('./build'),W=require('./world'),Higher=require('./arcane-higher-architecture');
const SOURCE='source-earned-fifth-arcane-field-projection-v1',
 MAP='witnessed-local-ambient-arcane-projection-v1',
 PRACTICE='witnessed-arcane-field-counterpractice-v1',
 FORM='witnessed-independent-arcane-field-formation-v1',
 PULSE='witnessed-contestable-ambient-arcane-field-pulse-v1';
const H=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const I=(v,a=0,b=1000000000)=>Number.isInteger(v)&&v>=a&&v<=b;
const P=(v,a=12,b=900)=>typeof v==='string'&&v.trim().length>=a&&v.trim().length<=b;
const ID=v=>typeof v==='string'&&/^[a-z][a-z0-9_-]{2,75}$/.test(v);
const only=(p,keys)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(x=>keys.includes(x));
const NEEDED=6;
function fourth(s){
 const a=s.player?.arcane;
 if(!a||a.circles<4)throw Error('A genuine original Fourth Arcane Circle is required');
 if(a.circles===4){
  if(!Higher.verify(s))throw Error('Original Circle IV proof is inconsistent');
  return s.table.arcaneArchitecture.dynamic.transitions[0];
 }
 const p=B.arcaneProfile(4),
  shadow={...s,player:{...s.player,arcane:{
   ...a,circles:4,channels:p.channels,structuredMana:p.mana,
   maxComplexity:p.maxComplexity,intake:p.intake,
   loadTolerance:p.loadTolerance,preparedCapacity:p.prepared
  }}};
 if(!Higher.verify(shadow))throw Error('Higher Circle lost its original Fourth Circle source');
 return s.table.arcaneArchitecture.dynamic.transitions[0];
}
function witness(s,i,origin,id){
 if(!I(i,0,s.log.length-1))throw Error('An original local field measurement is required');
 const e=s.log[i];
 if(e?.type!=='story'||e.details?.origin!==origin||
  e.details?.fieldId!==id||e.details?.location!==s.world.location||
  !P(e.text,16,900))
  throw Error('Actual ambient field source was not personally witnessed in this location');
 return structuredClone(e);
}
function place(s){
 const p=require('../world/lived-places').location(s,s.world.location);
 if(!p?.biome)throw Error('A real current environment is needed for projected mana');
 return p;
}
function safe(s){
 if(s.battle||s.encounter||s.table?.combatants?.player?.status&&
  s.table.combatants.player.status!=='ok')
  throw Error('Uncontested construction requires safe conditions and an intact body');
 if(s.player.arcane.coreStability<45)
  throw Error('Real Mana Core damage requires diagnosis and repair before field projection');
}
function verifySource(s){
 const obj=s.table?.arcaneArchitecture?.field,
  n=s.player?.arcane?.circles||0;
 if(!obj)return n<5;
 if(obj.origin!==SOURCE||!obj.plans||typeof obj.plans!=='object'||
  Array.isArray(obj.plans)||!Array.isArray(obj.tests)||
  !Array.isArray(obj.pulses))return false;
 let sourceHash;
 try{sourceHash=H(fourth(s).source);}catch{return false;}
 let formation=null;
 const used=new Set();
 for(const [id,plan]of Object.entries(obj.plans)){
  const z=plan?.source;
  if(!ID(id)||plan.id!==id||plan.origin!==SOURCE||
   plan.seal!==H(z)||z?.origin!==SOURCE||z.id!==id||
   z.previousHash!==sourceHash||!I(z.minute,0,s.world.minutes)||
   !P(z.name,3,150)||!P(z.geometry,28,900)||
   !P(z.environment)||!P(z.resistance)||!P(z.collapse)||
   !P(z.limit)||!I(z.radius,1,1000000)||
   !P(z.biome,3,80)||!P(z.location,2,140)||
   z.witnessHash!==H(z.witness)||
   z.witness?.details?.origin!==MAP||
   z.witness.details.fieldId!==id||
   z.witness.details.radiusMetres!==z.radius||
   !Array.isArray(plan.attempts)||!I(plan.progress,0,NEEDED))return false;
  let points=0,last=z.minute;
  for(const record of plan.attempts){
   const a=record?.source;
   if(record?.origin!==SOURCE||record.seal!==H(a)||
    a?.origin!==SOURCE||a.id!==id||
    !I(a.minute,last,s.world.minutes)||!I(a.minutes,15,480)||
    !I(a.manaSpent,1,50)||!I(a.staminaSpent,1,12)||
    !I(a.roll,1,20)||a.check?.roll!==a.roll||
    a.earned!==(a.check.success?a.check.progress:0)||
    a.progress!==Math.min(NEEDED,points+a.earned)||
    a.strain!==(a.check.degree==='severe failure'?4:0)||
    a.witnessHash!==H(a.witness)||
    a.witness?.details?.origin!==PRACTICE||
    a.witness.details.fieldId!==id||
    !a.rollEvent||a.rollEventHash!==H(a.rollEvent)||
    a.rollEvent.type!=='roll'||H(a.rollEvent.details)!==H(a.check)||
    used.has(a.witnessHash))return false;
   used.add(a.witnessHash);points=a.progress;last=a.minute+a.minutes;
  }
  if(points!==plan.progress)return false;
 }
 for(const record of obj.tests){
  const a=record?.source,plan=obj.plans?.[a?.id];
  if(record?.origin!==SOURCE||record.seal!==H(a)||
   a?.origin!==SOURCE||a.kind!=='fifth-circle-ambient-projection'||
   !plan||a.planHash!==plan.seal||
   a.progressAtTrial!==NEEDED||
   !I(a.minute,plan.source.minute,s.world.minutes)||
   !I(a.minutes,30,480)||!I(a.manaSpent,1,100)||
   !I(a.staminaSpent,1,12)||!I(a.roll,1,20)||
   a.check?.roll!==a.roll||a.formed!==a.check.success||
   a.witnessHash!==H(a.witness)||
   a.witness?.details?.origin!==FORM||
   a.witness.details.fieldId!==a.id||
   !a.rollEvent||a.rollEventHash!==H(a.rollEvent)||
   a.rollEvent.type!=='roll'||H(a.rollEvent.details)!==H(a.check)||
   used.has(a.witnessHash))return false;
  used.add(a.witnessHash);
  if(a.formed){
   if(formation)return false;formation=record;
   const capacity=a.capacity,p=B.arcaneProfile(5);
   if(!capacity||capacity.newMax!==Math.max(capacity.oldMax,p.mana)||
    capacity.newMana!==capacity.oldMana-a.manaSpent||
    capacity.channels!==p.channels||capacity.intake!==p.intake||
    capacity.loadTolerance!==p.loadTolerance||
    capacity.maxComplexity!==p.maxComplexity||
    capacity.preparedCapacity!==p.prepared||
    !I(capacity.oldMana,a.manaSpent,100000)||!I(capacity.oldMax,0,100000))
    return false;
  }else if(a.capacity!==null)return false;
 }
 for(const record of obj.pulses){
  const a=record?.source,plan=obj.plans?.[a?.id];
  if(record?.origin!==SOURCE||record.seal!==H(a)||
   a?.origin!==SOURCE||a.kind!=='bounded-environmental-mana-pulse'||
   !formation||a.id!==formation.source.id||!plan||
   !I(a.minute,formation.source.minute,s.world.minutes)||
   !I(a.minutes,5,60)||!I(a.manaSpent,1,200)||
   !I(a.staminaSpent,1,12)||!I(a.roll,1,20)||
   a.check?.roll!==a.roll||a.sustained!==a.check.success||
   a.witnessHash!==H(a.witness)||
   a.witness?.details?.origin!==PULSE||
   a.witness.details.fieldId!==a.id||
   a.location!==a.witness.details.location||
   !P(a.biome,3,80)||!I(a.radius,1,1000000)||
   a.radius!==plan.source.radius||
   !a.rollEvent||a.rollEventHash!==H(a.rollEvent)||
   H(a.rollEvent.details)!==H(a.check)||
   used.has(a.witnessHash))return false;
  used.add(a.witnessHash);
 }
 if(n>=5&&!formation)return false;
 if(n===4&&formation)return false;
 if(formation&&n===5){
  const a=s.player.arcane,p=B.arcaneProfile(5),cap=formation.source.capacity;
  if(a.fieldIntegration!==1||
   a.channels!==p.channels||a.intake!==p.intake||
   a.structuredMana!==p.mana||
   a.maxComplexity!==p.maxComplexity||
   a.loadTolerance!==p.loadTolerance||
   a.preparedCapacity!==p.prepared||
   s.player.maxMana<cap.newMax)return false;
 }
 return true;
}
function verify(s){
 try{fourth(s);return verifySource(s);}
 catch{return false;}
}
function ensure(s){
 fourth(s);if(!verify(s))throw Error('Original Fourth Circle or Arcane field proof was changed');
 s.table.arcaneArchitecture.field||={origin:SOURCE,plans:{},tests:[],pulses:[]};
 return s.table.arcaneArchitecture.field;
}
function map(s,p={}){
 if(!only(p,['id','name','geometry','environment','resistance',
  'collapse','limit','radius','witnessIndex'])||
  !ID(p.id)||!P(p.name,3,150)||!P(p.geometry,28,900)||
  !P(p.environment)||!P(p.resistance)||!P(p.collapse)||
  !P(p.limit)||!I(p.radius,1,1000000))
  throw Error('Original Arcane Field mapping needs credible geometry, measured area, real environment, resistance and collapse');
 if(s.player.arcane?.circles!==4)
  throw Error('Earn the verified Fourth Circle before beginning Fifth Circle field architecture');
 safe(s);const previous=fourth(s),local=place(s),
  event=witness(s,p.witnessIndex,MAP,p.id);
 if(event.details?.radiusMetres!==p.radius||
  event.details?.biome!==local.biome||
  !P(event.details?.ambientMeasurement,24,850)||
  !P(event.details?.counterPressure,24,850)||
  p.radius>Math.max(1,Math.floor(s.player.arcane.intake*s.player.arcane.coreStability/15)))
  throw Error('The field radius must fit real Mana intake, core stability and independently measured local environment');
 const net=s.table.arcaneArchitecture?.field;
 if(net?.plans[p.id])throw Error('That individual Arcane Field is already mapped');
 const z={origin:SOURCE,id:p.id,minute:s.world.minutes,
  previousHash:H(previous.source),name:p.name.trim(),
  geometry:p.geometry.trim(),environment:p.environment.trim(),
  resistance:p.resistance.trim(),collapse:p.collapse.trim(),
  limit:p.limit.trim(),radius:p.radius,biome:local.biome,
  location:s.world.location,witness:event,witnessHash:H(event)};
 ensure(s).plans[p.id]={id:p.id,origin:SOURCE,source:z,seal:H(z),
  attempts:[],progress:0};
 return {mapped:true,id:p.id,radiusMetres:p.radius,
  noFreeAreaEffect:true};
}
function work(s,p={}){
 if(!only(p,['id','witnessIndex','minutes'])||
  !ID(p.id)||!I(p.minutes??60,15,480))
  throw Error('Field construction requires a recorded physical projection and real practice time');
 if(s.player.arcane?.circles!==4)throw Error('Fifth Circle field practice needs the previous original Fourth Circle');
 safe(s);const net=ensure(s),plan=net.plans[p.id];
 if(!plan||!verify(s))throw Error('Original field source missing');
 if(plan.progress>=NEEDED)throw Error('This original field is ready for an independent formation test');
 const event=witness(s,p.witnessIndex,PRACTICE,p.id);
 if(!P(event.details?.observedResistance,24,850)||
  !P(event.details?.observedCollapse,24,850))
  throw Error('An original field exercise needs independent environmental resistance and collapse');
 const digest=H(event);
 if(plan.attempts.some(x=>x.source.witnessHash===digest))
  throw Error('One witnessed field exercise cannot be rolled more than once');
 const minutes=p.minutes??60,manaSpent=3+Math.ceil(plan.source.radius/5),
  staminaSpent=Math.ceil(minutes/120)+1;
 if(!I(s.player.mana,manaSpent,100000)||!I(s.player.stamina,staminaSpent,100000))
  throw Error('Arcane Field geometry cannot be trained without actual Mana and Stamina');
 const start=s.world.minutes,a=s.player.arcane;
 s.player.mana-=manaSpent;s.player.stamina-=staminaSpent;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.int-10)/2)+
  2*(s.player.skills?.arcana?.rank||0)+(a.coreStability>=85?1:0),
  dc:17+Math.ceil(plan.source.radius/5),
  label:'Actual Fifth Circle ambient field practice'});
 const rollEvent=structuredClone(s.log.at(-1)),earned=check.success?check.progress:0,
  strain=check.degree==='severe failure'?4:0;
 a.coreStability=Math.max(0,a.coreStability-strain);
 plan.progress=Math.min(NEEDED,plan.progress+earned);
 const src={origin:SOURCE,id:p.id,minute:start,minutes,manaSpent,staminaSpent,
  witness:event,witnessHash:digest,roll:check.roll,check:structuredClone(check),
  rollEvent,rollEventHash:H(rollEvent),earned,progress:plan.progress,strain};
 plan.attempts.push({origin:SOURCE,source:src,seal:H(src)});
 E.advance(s,minutes);W.finalizeTime(s,start);
 if(!verify(s))throw Error('Actual Arcane Field check evidence did not reconcile');
 return {practised:true,id:p.id,check,progress:plan.progress,
  required:NEEDED,manaSpent,staminaSpent,strain,minutes,
  noAutomaticAreaSpell:true};
}
function form(s,p={}){
 if(!only(p,['id','witnessIndex','minutes'])||
  !ID(p.id)||!I(p.minutes??90,30,480))
  throw Error('Field Formation needs a separately witnessed projection test');
 if(s.player.arcane?.circles!==4)
  throw Error('Original Fourth Circle must precede the projected Fifth Circle');
 safe(s);const net=ensure(s),plan=net.plans[p.id];
 if(!plan||!verify(s)||plan.progress<NEEDED)
  throw Error('Actual original ambient field practice must be complete');
 const event=witness(s,p.witnessIndex,FORM,p.id);
 if(!P(event.details?.measuredReturn,24,850)||
   !P(event.details?.independentCounter,24,850))
  throw Error('An independent local field and environmental countertest are needed');
 const digest=H(event);
 if(net.tests.some(x=>x.source.witnessHash===digest))
  throw Error('The same actual field formation cannot be rerolled');
 const minutes=p.minutes??90,manaSpent=8+Math.ceil(plan.source.radius/5),
  staminaSpent=Math.ceil(minutes/90)+2;
 if(!I(s.player.mana,manaSpent,100000)||!I(s.player.stamina,staminaSpent,100000))
  throw Error('The Mana Core cannot sustain a real field formation without resources');
 const start=s.world.minutes,oldMana=s.player.mana,oldMax=s.player.maxMana,
  a=s.player.arcane;s.player.mana-=manaSpent;s.player.stamina-=staminaSpent;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.int-10)/2)+
  2*(s.player.skills?.arcana?.rank||0)+(a.coreStability>=85?1:0),
  dc:20+Math.ceil(plan.source.radius/5),
  label:'Fifth Circle measured Mana Field independent formation'});
 const rollEvent=structuredClone(s.log.at(-1));let capacity=null;
 if(check.success){
  const p=B.arcaneProfile(5);a.circles=5;a.fieldIntegration=1;
  a.channels=p.channels;a.structuredMana=p.mana;a.intake=p.intake;
  a.loadTolerance=p.loadTolerance;a.maxComplexity=p.maxComplexity;
  a.preparedCapacity=p.prepared;
  s.player.maxMana=Math.max(oldMax,p.mana);
  capacity={oldMana,newMana:s.player.mana,oldMax,newMax:s.player.maxMana,
   channels:p.channels,intake:p.intake,loadTolerance:p.loadTolerance,
   maxComplexity:p.maxComplexity,preparedCapacity:p.prepared};
 }
 const src={origin:SOURCE,kind:'fifth-circle-ambient-projection',
  id:p.id,planHash:plan.seal,minute:start,minutes,manaSpent,staminaSpent,
  witness:event,witnessHash:digest,roll:check.roll,check:structuredClone(check),
  rollEvent,rollEventHash:H(rollEvent),progressAtTrial:plan.progress,
  formed:check.success,capacity};
 net.tests.push({origin:SOURCE,source:src,seal:H(src)});
 E.advance(s,minutes);W.finalizeTime(s,start);
 if(!verify(s))throw Error('Fifth Circle architectural source or preserved Mana capacity invalid');
 return {attempted:true,formed:check.success,circle:s.player.arcane.circles,
  check,manaSpent,staminaSpent,minutes,capacity,
  noAutomaticFieldSpellOrTerritoryClaim:true};
}
function pulse(s,p={}){
 if(!only(p,['id','witnessIndex','minutes'])||
  !ID(p.id)||!I(p.minutes??10,5,60))
  throw Error('Real projected Arcane Fields require measured upkeep time and environmental witnesses');
 const net=s.table?.arcaneArchitecture?.field,plan=net?.plans?.[p.id];
 if(!plan||s.player.arcane?.circles<5||
  !net.tests.some(x=>x.source.formed&&x.source.id===p.id)||
  !verify(s)||s.battle||s.encounter)
  throw Error('Earn a genuine measured Fifth Circle field before maintenance');
 const event=witness(s,p.witnessIndex,PULSE,p.id),pLocal=place(s);
 if(!P(event.details?.ambientSupport,24,850)||
  !P(event.details?.independentResistance,24,850)||
  event.details?.biome!==pLocal.biome||
  event.details?.radiusMetres!==plan.source.radius)
  throw Error('A travelling field needs genuine local Mana support, range and opposing conditions');
 const digest=H(event);
 if(net.pulses.some(x=>x.source.witnessHash===digest))
  throw Error('The same witnessed projected field cannot be pulsed twice');
 const minutes=p.minutes??10,manaSpent=3+Math.ceil(minutes/5)+
  Math.ceil(plan.source.radius/5),
  staminaSpent=1+Math.ceil(minutes/20);
 if(!I(s.player.mana,manaSpent,100000)||!I(s.player.stamina,staminaSpent,100000))
  throw Error('Environmental Arcane Field upkeep requires real Mana and body effort');
 const start=s.world.minutes;
 s.player.mana-=manaSpent;s.player.stamina-=staminaSpent;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.int-10)/2)+
  2*(s.player.skills?.arcana?.rank||0),
  dc:16+Math.ceil(plan.source.radius/5),
  label:'Actual contested ambient Arcane Field maintenance'});
 const rollEvent=structuredClone(s.log.at(-1));
 const src={origin:SOURCE,kind:'bounded-environmental-mana-pulse',
  id:p.id,minute:start,minutes,manaSpent,staminaSpent,
  witness:event,witnessHash:digest,roll:check.roll,check:structuredClone(check),
  rollEvent,rollEventHash:H(rollEvent),sustained:check.success,
  radius:plan.source.radius,location:s.world.location,biome:pLocal.biome};
 net.pulses.push({origin:SOURCE,source:src,seal:H(src)});
 E.advance(s,minutes);W.finalizeTime(s,start);
 if(!verify(s))throw Error('Environmental Mana Field maintenance evidence cannot be reconciled');
 return {attempted:true,sustained:check.success,collapsed:!check.success,
  radiusMetres:plan.source.radius,check,manaSpent,staminaSpent,minutes,
  noAutomaticHarmOrNPCControl:true};
}
function status(s){
 const n=s.player?.arcane?.circles||0;
 if(n<4)return {available:false,circles:n,
  note:'Original independently earned Dynamic Fourth Circle is required'};
 if(!verify(s))throw Error('Source-verified Fifth Circle field ancestry changed');
 const net=s.table?.arcaneArchitecture?.field;
 return {available:n===4,circles:n,
  plans:Object.values(net?.plans||{}).map(x=>({
   id:x.id,name:x.source.name,radiusMetres:x.source.radius,
   progress:x.progress,required:NEEDED,local:s.world.location===x.source.location})),
  formed:n>=5,
  note:'Field projection measures own Mana, not ownership of area, automatic spell effects or coercion of beings'};
}
module.exports={SOURCE,MAP,PRACTICE,FORM,PULSE,fourth,verify,verifySource,
 map,work,form,pulse,status};
