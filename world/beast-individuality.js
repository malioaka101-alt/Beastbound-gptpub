'use strict';
// #05: Individual distinctions LIVE IN the existing witnessed beast life,
// never in a generic species-class or an automatically awarded ability menu.
const Crypto=require('node:crypto'),E=require('../engine.js'),Learn=require('./beast-ecological-learning');
const SOURCE='source-witnessed-beast-individuality-v1',HASH=/^[a-f0-9]{64}$/;
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const good=(v,a=8,b=800)=>typeof v==='string'&&v.trim().length>=a&&v.trim().length<=b;
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{2,69}$/.test(x);
const num=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
function foundation(b){
 if(!b||!E.SPECIES[b.species])throw Error('A real previously established beast is required');
 if(b.sapientLife){
  const Person=require('./sapient-beast-persons');
  if(!Person.verify(b))throw Error('Unverified sapient person history');
  return {life:b.sapientLife,kind:'sapient'};
 }
 if(b.individualLife){
  const Wild=require('./wild-lives');
  Wild._debug.ensure({beasts:{[b.id]:b}},b,null);
  if(!Learn.verify(b))throw Error('Unverified independent animal expertise');
  return {life:b.individualLife,kind:'wild'};
 }
 throw Error('An important beast needs an original witnessed individual life or person record');
}
function base(b){
 const {life,kind}=foundation(b);
 const root={source:SOURCE,beastId:b.id,species:b.species,
  lifeKind:kind,lifeSourceHash:life.sourceHash};
 return {version:1,origin:root,originHash:hash(root),headHash:hash(root),entries:[]};
}
function sourceProof(b,receiptHash,skill){
 const {life,kind}=foundation(b);
 if(kind!=='wild'||b.owner||b.relationship!=='wild')
  throw Error('Wild ecological learning cannot be conferred on a partner or independent beast person');
 const rec=life.ecologicalLearning;
 if(!rec||!Learn.verify(b))throw Error('A real previously earned animal practice receipt is required');
 const receipt=rec.receipts.find(x=>x.hash===receiptHash);
 if(!receipt||!receipt.source.success||receipt.source.skill!==skill)
  throw Error('A verified successful individual field action is required, not species potential');
 return receipt;
}
function proofValid(b,proof,expectedSkill){
 if(!proof||proof.hash!==hash(proof.source)||proof.source?.beastId!==b.id||
  proof.source?.species!==b.species||
  proof.source?.individualLifeSourceHash!==b.individualLife?.sourceHash||
  proof.source?.success!==true||proof.source?.skill!==expectedSkill||
  !HASH.test(proof.source.actionWitnessHash))return false;
 return true;
}
function verify(b){
 if(!b?.individualLife?.individuality&&!b?.sapientLife?.individuality)return true;
 const {life,kind}=foundation(b),r=life.individuality;
 if(!r||r.version!==1||r.originHash!==hash(r.origin)||
  r.origin?.source!==SOURCE||r.origin.beastId!==b.id||
  r.origin.species!==b.species||r.origin.lifeKind!==kind||
  r.origin.lifeSourceHash!==life.sourceHash||
  !Array.isArray(r.entries)||r.entries.length>1200)return false;
 let prev=r.originHash,previousMinute=0;
 const methods=new Map(),seen=new Set(),usedProofs=new Set();
 for(const item of r.entries){
  const e=item?.source;
  if(!e||e.source!==SOURCE||e.beastId!==b.id||
   e.lifeSourceHash!==life.sourceHash||e.previous!==prev||
   item.seal!==hash(e)||!num(e.minute,previousMinute,1000000000))return false;
  if(e.type==='observation'){
   if(!id(e.category)||!good(e.description,12,1200)||!good(e.basis)||
    !['observed','gm-only'].includes(e.visibility)||!HASH.test(e.witnessHash))
    return false;
   // Pin the exact witnessed event; original short-term witnessed histories
   // legitimately rotate, but they must not erase established personal facts.
   const evidence=e.witnessRecord;
   if(!evidence||hash(evidence)!==e.witnessHash||
    (kind==='wild'&&(evidence.type!=='witnessed-wildlife-routine'||
      evidence.beastId!==b.id||evidence.location!==e.witnessedLocation))||
    (kind==='sapient'&&(evidence.type!=='personally-witnessed-contact'||
      evidence.location!==e.witnessedLocation))||
    (e.visibility==='observed'&&e.witnessedLocation!==e.currentLocation))
    return false;
  }else if(e.type==='learn'){
   if(kind!=='wild'||!id(e.methodId)||methods.has(e.methodId)||
    !good(e.name,3,120)||!good(e.principle,12,900)||
    !good(e.activation,8,600)||!good(e.limit,12,800)||
    !good(e.counter,8,600)||!good(e.environment,8,600)||
    !['foraging','navigation'].includes(e.application)||
    !num(e.energyCost,1,25)||!num(e.cooldownDays,1,90)||
    !['observed','gm-only'].includes(e.visibility)||
    !proofValid(b,e.proof,e.application)||usedProofs.has(e.proof.hash)||
    (e.visibility==='observed'&&(!e.observedWitnessRecord||
      hash(e.observedWitnessRecord)!==e.proof.source.actionWitnessHash||
      e.observedWitnessRecord.type!=='witnessed-wildlife-routine'||
      e.observedWitnessRecord.beastId!==b.id)))
    return false;
   usedProofs.add(e.proof.hash);
   methods.set(e.methodId,{skill:e.application,proofs:new Set([e.proof.hash]),
    energyCost:e.energyCost,cooldownDays:e.cooldownDays,usedDay:-100000});
  }else if(e.type==='develop'){
   const m=methods.get(e.methodId);
   if(!m||!proofValid(b,e.proof,m.skill)||usedProofs.has(e.proof.hash)||
     !num(e.strengthening,1,3))return false;
   m.proofs.add(e.proof.hash);usedProofs.add(e.proof.hash);
  }else if(e.type==='express'){
   const m=methods.get(e.methodId);
   if(!m||e.day-m.usedDay<m.cooldownDays||!num(e.day,0,10000000)||
    !['independently-foraged','roamed-through-existing-habitat-link',
      'relocated-to-adjacent-compatible-habitat'].includes(e.action)||
    (m.skill==='foraging')!==(e.action==='independently-foraged')||
    !num(e.beforeEnergy,0,100000)||!num(e.afterEnergy,0,100000)||
    e.beforeEnergy-e.afterEnergy!==e.energyCost||
    e.energyCost!==m.energyCost||e.benefit!==2||
    !e.witnessRecord||hash(e.witnessRecord)!==e.witnessHash||
    e.witnessRecord.type!=='offscreen-sixday'||
    e.witnessRecord.day!==e.day||e.witnessRecord.action!==e.action||
    e.minute!==e.day*1440)
    return false;
   m.usedDay=e.day;
  }else return false;
  if(seen.has(item.seal))return false;
  seen.add(item.seal);prev=item.seal;previousMinute=e.minute;
 }
 return prev===r.headHash;
}
function ensure(s,b){
 const {life}=foundation(b);
 if(!life.individuality)life.individuality=base(b);
 if(!verify(b))throw Error('Individual beast experience was modified without an authentic receipt');
 return life.individuality;
}
function append(s,b,entry){
 const r=ensure(s,b),source={source:SOURCE,beastId:b.id,
  lifeSourceHash:r.origin.lifeSourceHash,minute:s.world.minutes,
  ...entry,previous:r.headHash};
 const item={source,seal:hash(source)};
 r.entries.push(item);r.headHash=item.seal;
 if(!verify(b))throw Error('Individual record could not be source verified');
 return item;
}
function observation(s,p={}){
 const allowed=['beastId','category','description','basis','visibility'];
 if(!p||Object.keys(p).some(x=>!allowed.includes(x)))throw Error('Unsupported individual observation fields');
 const b=s.beasts?.[p.beastId],{life,kind}=foundation(b);
 const witness=kind==='wild'?life.witnessed?.at(-1):
  [...(life.history||[])].reverse().find(x=>x.type==='personally-witnessed-contact');
 if(!witness||!id(p.category)||!good(p.description,12,1200)||!good(p.basis)||
  !['observed','gm-only'].includes(p.visibility||'gm-only'))
  throw Error('An original observed individual action is needed before authoring a distinctive fact');
 const visibility=p.visibility||'gm-only',location=witness.location;
 if(visibility==='observed'&&
    (s.world.location!==location||s.encounter?.beastId!==b.id))
  throw Error('Public unique traits require an actual current witnessed encounter');
 const r=ensure(s,b),digest=hash(witness);
 if(r.entries.some(x=>x.source.type==='observation'&&
   x.source.witnessHash===digest&&x.source.category===p.category))
  throw Error('This exact observed trait has already been recorded');
 append(s,b,{type:'observation',category:p.category,description:p.description.trim(),
  basis:p.basis.trim(),visibility,witnessHash:digest,
  witnessRecord:structuredClone(witness),
  witnessedLocation:location,currentLocation:s.world.location});
 return {recorded:true,beastId:b.id,category:p.category,noNewCreatureOrConsent:true};
}
function technique(s,p={}){
 const allowed=['beastId','methodId','name','principle','activation','limit',
  'counter','environment','application','energyCost','cooldownDays','receiptHash','visibility'];
 if(!p||Object.keys(p).some(x=>!allowed.includes(x)))throw Error('Unsupported unique technique fields');
 const b=s.beasts?.[p.beastId],skill=p.application;
 if(!['foraging','navigation'].includes(skill)||!id(p.methodId)||
  !good(p.name,3,120)||!good(p.principle,12,900)||
  !good(p.activation)||!good(p.limit,12,800)||!good(p.counter)||
  !good(p.environment)||!num(p.energyCost,1,25)||
  !num(p.cooldownDays,1,90)||!['observed','gm-only'].includes(p.visibility||'gm-only'))
  throw Error('A unique technique needs functional biology, limits, cost, counter and earned field application');
 const proof=sourceProof(b,p.receiptHash,skill),life=b.individualLife,vis=p.visibility||'gm-only';
 const witnessed=vis==='observed'?life.witnessed?.find(x=>
  hash(x)===proof.source.actionWitnessHash):null;
 if(vis==='observed'&&!witnessed)
  throw Error('Only a personally witnessed original action can establish a player-known technique');
 const reg=ensure(s,b);
 if(reg.entries.some(x=>x.source.type==='learn'&&x.source.methodId===p.methodId))
  throw Error('The individual already learned this unique method');
 if(reg.entries.some(x=>['learn','develop'].includes(x.source.type)&&
   x.source.proof?.hash===proof.hash))
  throw Error('One actual successful action cannot create multiple learned methods');
 append(s,b,{type:'learn',methodId:p.methodId,name:p.name.trim(),
  principle:p.principle.trim(),activation:p.activation.trim(),limit:p.limit.trim(),
  counter:p.counter.trim(),environment:p.environment.trim(),application:skill,
  energyCost:p.energyCost,cooldownDays:p.cooldownDays,visibility:vis,
  observedWitnessRecord:witnessed?structuredClone(witnessed):null,
  proof:structuredClone(proof)});
 return {recorded:true,beastId:b.id,methodId:p.methodId,
  actualCombatOrMagicNotGranted:true,noAutomaticTraining:true};
}
function develop(s,{beastId,methodId,receiptHash}={}){
 const b=s.beasts?.[beastId],r=ensure(s,b);
 const steps=r.entries.filter(x=>x.source.methodId===methodId);
 const root=steps.find(x=>x.source.type==='learn');
 if(!root)throw Error('This particular beast has not learned that method');
 const proof=sourceProof(b,receiptHash,root.source.application);
 if(r.entries.some(x=>['learn','develop'].includes(x.source.type)&&
   x.source.proof?.hash===proof.hash))
  throw Error('An individual action cannot strengthen the same technique twice');
 const strengthening=Math.min(3,1+steps.filter(x=>x.source.type==='develop').length);
 append(s,b,{type:'develop',methodId,proof:structuredClone(proof),strengthening});
 return {recorded:true,beastId,methodId,trainingReceipts:steps.length+1,
  noArtificialLevelGain:true};
}
function express(s,b,action,day){
 if(!b?.individualLife?.individuality||b.owner||b.sapientLife||
  b.sapience>=3||E.SPECIES[b.species]?.intelligence==='sapient'||
  b.relationship!=='wild'||!num(day,0,10000000))return null;
 const reg=ensure(s,b),roots=reg.entries.filter(x=>x.source.type==='learn');
 const current=action==='independently-foraged'?'foraging':
  ['relocated-to-adjacent-compatible-habitat','roamed-through-existing-habitat-link'].includes(action)?'navigation':null;
 if(!current)return null;
 const life=b.individualLife,last=life.history?.at(-1);
 if(!last||last.day!==day||last.action!==action||last.type!=='offscreen-sixday')return null;
 for(const t of roots){
  const method=t.source;
  if(method.application!==current||b.energy<method.energyCost)continue;
  const lastUse=reg.entries.filter(x=>x.source.type==='express'&&x.source.methodId===method.methodId).at(-1);
  if(lastUse&&day-lastUse.source.day<method.cooldownDays)continue;
  // The animal is autonomous: its already committed real field action, health
  // and private independent RNG govern whether it chooses to express this.
  const draw=require('./wild-lives')._debug.draw(life);
  if(draw>=.42)continue;
  const beforeEnergy=b.energy;
  b.energy-=method.energyCost;
  if(current==='foraging')b.needs.hunger=Math.max(0,b.needs.hunger-2);
  else b.needs.fatigue=Math.max(0,b.needs.fatigue-2);
  append(s,b,{type:'express',methodId:method.methodId,day,action,
   minute:day*1440,
   energyCost:method.energyCost,beforeEnergy,afterEnergy:b.energy,
   witnessHash:hash(last),witnessRecord:structuredClone(last),benefit:2});
  return {methodId:method.methodId,energySpent:method.energyCost,
   private:true,noForcedTechnique:true};
 }
 return null;
}
function status(s,{beastId}={}){
 if(typeof beastId!=='string')throw Error('Known beast identity required');
 const b=s.beasts?.[beastId];
 if(!b)return {known:false};
 const {life,kind}=foundation(b),r=life.individuality;
 if(kind==='wild'&&!life.witnessed?.length)
  return {known:false,note:'This animal has no personally witnessed identity'};
 if(!r)return {known:true,observations:[],techniques:[],
  note:'No personally witnessed distinct methods recorded'};
 if(!verify(b))throw Error('Individual beast memory failed source validation');
 const observations=r.entries.filter(x=>x.source.type==='observation'&&
  x.source.visibility==='observed').map(x=>({
  category:x.source.category,description:x.source.description}));
 const techniques=r.entries.filter(x=>x.source.type==='learn'&&
  x.source.visibility==='observed').map(x=>({
  id:x.source.methodId,name:x.source.name,
  observedPurpose:x.source.principle,
  observedLimit:x.source.limit}));
 return {known:true,beastId,observations,techniques,
  note:'Private motives, remote technique practice, unobserved methods and future evolution remain sealed'};
}
module.exports={SOURCE,verify,observation,technique,develop,express,status};
