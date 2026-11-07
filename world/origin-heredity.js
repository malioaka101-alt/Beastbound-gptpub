'use strict';
// Shared biological Origin Pattern inheritance, suitable for both humans and
// beasts when their biological parentage is ACTUALLY sourced. Heredity is not
// the automatic transfer of ranks, mastered arts, property or political office.
// Not a public API: caller must have a genuine independently verified birth.
const Crypto=require('node:crypto');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const rand=k=>Crypto.createHash('sha256').update(String(k)).digest().readUInt32BE(0)/4294967296;
const clamp=(n,lo=0,hi=100)=>Math.max(lo,Math.min(hi,n));
const PHYSICAL=['resilience','energyConduction','recovery','senses'];
const SYSTEMS=['meridian','arcane','soul','body','origin','rift'];
const KIND={'beast':'independent-mammal-birth-v1','human':'recorded-human-birth-v1'};
function finite(v,label){if(!Number.isFinite(v)||v<0||v>100)throw Error('Invalid inherited '+label);return v;}
function origin(parent){
 if(!parent||typeof parent.id!=='string'||!parent.id||
  typeof parent.originSourceHash!=='string'||!/^[0-9a-f]{64}$/.test(parent.originSourceHash)||
  !parent.physical||!parent.systemAptitude||!parent.bloodline)
  throw Error('A sourced biological parent Origin Pattern is required');
 for(const name of PHYSICAL)finite(parent.physical[name],name);
 for(const name of SYSTEMS)finite(parent.systemAptitude[name],name);
 const b=parent.bloodline;
 if(typeof b.id!=='string'||b.id.length<3||b.id.length>80||
  !Number.isFinite(b.strength)||b.strength<0||b.strength>100||
  !['expressed','dormant','absent'].includes(b.expression))
  throw Error('A real parental bloodline must include individual expression and strength');
 return parent;
}
// Parent-owned innate traits may differ sharply from practiced techniques.
// In the absence of a certified magical trait, the only source is the
// real species's own established biological lineage / background.
function fromBeast(b){
 const sourceHash=b?.individualLife?.sourceHash;
 if(!b||typeof sourceHash!=='string'||!/^[0-9a-f]{64}$/.test(sourceHash)||
  !b.potential||!Number.isFinite(b.lineageQuality)||
  b.lineageQuality<0||b.lineageQuality>100||!b.lineage)
  throw Error('A genuinely recorded biological beast origin is required');
 const q=b.lineageQuality,p=b.potential,
  measure=(v,n)=>finite(v,n),
  physical={
   resilience:clamp(q*.6+measure(p.growth,'growth')*.4),
   energyConduction:clamp(q*.4+measure(p.evolution,'evolution')*.6),
   recovery:clamp(measure(p.adaptability,'adaptability')*.65+q*.35),
   senses:clamp(measure(p.intelligence,'intelligence')*.6+q*.4)
  },
  systemAptitude={
   meridian:clamp(q*.45+measure(p.growth,'growth')*.55),
   arcane:clamp(q*.35+measure(p.evolution,'evolution')*.65),
   soul:clamp(q*.5+measure(p.intelligence,'intelligence')*.5),
   body:clamp(q*.5+measure(p.growth,'growth')*.5),
   origin:clamp(q*.45+measure(p.adaptability,'adaptability')*.55),
   rift:clamp(q*.45+measure(p.evolution,'evolution')*.55)
  };
 // If the beast already came from actual sourced biological parents,
 // its birth pattern is itself the foundation for later generations.
 if(b.wildBirth?.origin==='independent-mammal-birth-v1'&&
  b.originPattern?.origin==='source-bound-Origin-inheritance-v1'&&
  b.originPattern.birthSourceHash===b.wildBirth.birthHash){
  for(const k of PHYSICAL)physical[k]=b.originPattern.physical[k];
  for(const k of SYSTEMS)systemAptitude[k]=b.originPattern.systemAptitude[k];
 }
 const prev=b.originPattern?.bloodline;
 const bloodline=prev&&b.originPattern?.birthSourceHash===b.wildBirth?.birthHash?
  {id:prev.id,strength:prev.strength,expression:prev.expression}:
  {id:'lineage:'+b.lineage.toLowerCase(),strength:q,
   expression:q>=78?'expressed':'dormant'};
 return origin({id:b.id,originSourceHash:sourceHash,physical,systemAptitude,bloodline});
}
function inherit({kind,source,parents}){
 const required=KIND[kind];
 if(!required||!source||source.origin!==required||
  typeof source.beastId!=='string'&&typeof source.childId!=='string'||
  !Array.isArray(source.parentIds)||source.parentIds.length!==2||
  new Set(source.parentIds).size!==2||
  !Array.isArray(source.sourceHashes)||source.sourceHashes.length!==2||
  !Array.isArray(parents)||parents.length!==2)
  throw Error('Origin inheritance requires an actual named child and two recorded biological parents');
 const donors=parents.slice().sort((a,b)=>a.id.localeCompare(b.id));
 if(source.parentIds.join('|')!==donors.map(x=>x.id).join('|')||
  source.sourceHashes.join('|')!==donors.map(x=>x.originSourceHash).join('|'))
  throw Error('Offspring cannot claim invented biological parents or tamper with their source evidence');
 donors.forEach(origin);
 const birthSourceHash=hash(source);
 const mix=(key,a,b)=>{
  const weighted=rand(birthSourceHash+'|'+key+'|dominance')<.2?
   Math.max(a,b)*.65+Math.min(a,b)*.35:
   (a+b)/2;
  // Each child develops independently. Even celebrated ancestors can
  // have ordinary children, and ordinary ancestors can carry rare variants.
  return clamp(Math.round(weighted+(rand(birthSourceHash+'|'+key+'|variance')-.5)*24));
 };
 const physical=Object.fromEntries(PHYSICAL.map(k=>[k,mix('phys:'+k,
  donors[0].physical[k],donors[1].physical[k])]));
 const systemAptitude=Object.fromEntries(SYSTEMS.map(k=>[k,mix('sys:'+k,
  donors[0].systemAptitude[k],donors[1].systemAptitude[k])]));
 const l=donors.map(x=>x.bloodline),
  same=l[0].id===l[1].id,
  base=same?mix('bloodline',l[0].strength,l[1].strength):
   clamp(Math.round(Math.max(l[0].strength,l[1].strength)*.72));
 const bloodlineId=same?l[0].id:l[rand(birthSourceHash+'|origin-donor')<.5?0:1].id;
 const bloodlineStrength=clamp(base+(rand(birthSourceHash+'|bloodline-expression')-.5)*12);
 const activated=bloodlineStrength>=77&&
  rand(birthSourceHash+'|bloodline-activation')<
    Math.min(.9,.18+(bloodlineStrength-70)/55);
 return {origin:'source-bound-Origin-inheritance-v1',kind,
  birthSourceHash,parentIds:source.parentIds.slice(),
  parentalSourceHashes:source.sourceHashes.slice(),
  physical,systemAptitude,
  bloodline:{id:bloodlineId,strength:Math.round(bloodlineStrength),
   expression:activated?'expressed':'dormant',
   sourcedVia:'biological Origin Pattern inheritance'},
  note:'Innate constitution, possible dormant or expressed affinity, and predisposition only. No copied ranks, techniques, contracts, titles, assets or loyalty.'};
}
module.exports={PHYSICAL,SYSTEMS,fromBeast,inherit,origin,hash};
