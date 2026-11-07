'use strict';
// Bounded independent social ecology among genuinely witnessed wild animals.
// Contact occurs off-screen only when two existing, unowned, non-sapient
// individuals actually share a playable species-compatible habitat.
// An association is NOT parentage, mating, a contract, kinship or evolution.
const Crypto=require('node:crypto');
const E=require('../engine.js');
const Wild=require('./wild-lives');
const Agency=require('../rules/beast-agency');
const Atlas=require('./atlas');
const digest=v=>Crypto.createHash('sha256').update(String(v)).digest();
const random01=v=>digest(v).readUInt32BE(0)/4294967296;
const clamp=n=>Math.max(0,Math.min(100,n));
const RULE='witnessed-wild-neighbour-v1';
function alive(s,b){
 // A genuine birth is sufficient physical provenance: offspring do NOT
 // need the player to discover them before leading independent lives.
 const birth=b?.wildBirth;
 const sourcedBirth=birth?.origin==='independent-mammal-birth-v1'&&
  birth.source?.beastId===b?.id&&birth.source?.species===b?.species&&
  birth.birthHash===Wild._debug.hash(birth.source)&&
  b?.individualLife?.source?.origin===birth.origin&&
  b.individualLife.source.birthHash===birth.birthHash;
 if(!b||!b.individualLife||(!b.individualLife.witnessed?.length&&!sourcedBirth)||
   !E.SPECIES[b.species]||E.SPECIES[b.species].intelligence==='sapient'||
   (Number.isInteger(b.sapience)&&b.sapience>=3)||
   b.owner||s.player.partnerIds?.includes(b.id)||
   b.relationship!=='wild'||s.encounter?.beastId===b.id||
   b.away!==true)return false;
 const loc=E.LOCATIONS[b.location];
 if(!loc?.spawns?.includes(b.species)||
   !Number.isFinite(b.condition)||b.condition<35||
   !b.needs||!Number.isFinite(b.needs.hunger)||
   !Number.isFinite(b.needs.fatigue)||
   b.needs.hunger<0||b.needs.hunger>100||
   b.needs.fatigue<0||b.needs.fatigue>100)return false;
 Wild._debug.ensure(s,b,null);
 return true;
}
function ecologicalStatus(w,locId){
 const region=Atlas.LOCATION_REGION[locId],e=w.ecosystems?.[region];
 if(!region||!e||!['forage','water','quality','pressure'].every(k=>
   Number.isFinite(e[k])&&e[k]>=0&&e[k]<=100))
  throw Error('Social wildlife requires actual local ecological conditions');
 return e;
}
function pairKey(a,b){return [a.id,b.id].sort().join('|');}
function validatePair(w,record,a,b){
 if(!record)return;
 if(record.rule!==RULE||record.key!==pairKey(a,b)||
   !Array.isArray(record.sourceHashes)||record.sourceHashes.length!==2||
   record.sourceHashes[0]!==a.individualLife.sourceHash||
   record.sourceHashes[1]!==b.individualLife.sourceHash||
   !Number.isInteger(record.firstDay)||!Number.isInteger(record.lastDay)||
   record.lastDay<record.firstDay||
   !Array.isArray(record.history)||record.history.length>18||
   !['coexistence','avoidance','resource-competition','parallel-foraging'].includes(record.relation)||
   !Number.isInteger(record.meetings)||record.meetings<1)
  throw Error('Unverified independent wildlife relationship record');
}
function contact(s,w,day,a,b){
 const key=pairKey(a,b),older=a.id<b.id?a:b,younger=a.id<b.id?b:a,
  ledger=w.wildRelations||(w.wildRelations={});
 const prior=ledger[key];
 validatePair(w,prior,older,younger);
 if(prior&&prior.lastDay>=day)return false;
 // Individuals in the same wide habitat do not necessarily meet. One
 // encounter opportunity per paired sixday, never a forced association.
 const chance=random01([w.worldSeed,key,day,'contact',RULE].join('|'));
 const e=ecologicalStatus(w,a.location);
 const uncertainty=e.quality<35||e.pressure>80;
 const dA=Agency.profile(s,older).disposition,
  dB=Agency.profile(s,younger).disposition,
  solitary=dA==='independent'||dB==='independent';
 const meetingLikelihood=uncertainty?.30:solitary?.34:.52;
 if(chance>=meetingLikelihood)return false;
 const p=random01([w.worldSeed,key,day,'reaction',RULE].join('|'));
 const scarce=e.forage<35||e.water<30;
 let relation;
 if(scarce&&p<.54)relation='resource-competition';
 else if(solitary&&p<.68)relation='avoidance';
 else if(p<.22)relation='avoidance';
 else if(!scarce&&e.forage>=50&&e.water>=45&&p<.76)
  relation='parallel-foraging';
 else relation='coexistence';
 // Social consequences are bounded physical needs, not inferred affection.
 if(relation==='resource-competition'){
  for(const x of [a,b])x.needs.fatigue=clamp(x.needs.fatigue+4);
 }else if(relation==='parallel-foraging'){
  for(const x of [a,b])x.needs.hunger=clamp(x.needs.hunger-5);
 }
 const report={day,location:a.location,relation,
  observed:false,source:'independently co-located witnessed wildlife',
  noAssumedKinship:true,noBirth:true};
 const record=prior||{rule:RULE,key,beastIds:[older.id,younger.id],
  sourceHashes:[older.individualLife.sourceHash,younger.individualLife.sourceHash],
  firstDay:day,lastDay:day,relation,meetings:0,history:[]};
 record.lastDay=day;record.relation=relation;record.meetings++;
 record.history.push(report);record.history=record.history.slice(-18);
 ledger[key]=record;
 for(const x of [a,b]){
  const m=x.individualLife.history||(x.individualLife.history=[]);
  m.push({type:'offscreen-neighbour-contact',day,location:a.location,
   relation,peerId:x.id===a.id?b.id:a.id,observed:false,
   sourceKey:key});
  if(m.length>24)m.shift();
 }
 return true;
}
function sixday(s,day){
 if(!Number.isInteger(day)||day<0)throw Error('A real completed sixday is required');
 const w=s.table?.realm;
 if(!w)return {meetings:0};
 const buckets=new Map();
 for(const b of Object.values(s.beasts||{})){
  if(!alive(s,b))continue;
  const key=b.location+'|'+b.species;
  if(!buckets.has(key))buckets.set(key,[]);
  buckets.get(key).push(b);
 }
 let meetings=0;
 // There is no species, pair, population, or age quota. Each animal simply
 // has room for at most one substantive neighbour encounter in a sixday.
 for(const [bucket,list] of buckets){
  if(list.length<2)continue;
  list.sort((a,b)=>a.id.localeCompare(b.id));
  const offset=digest([w.worldSeed,bucket,day,'pair-rotation'].join('|'))
   .readUInt32BE(0)%list.length;
  const ordered=list.slice(offset).concat(list.slice(0,offset));
  for(let i=0;i+1<ordered.length;i+=2){
   const a=ordered[i],b=ordered[i+1];
   if(a.location!==b.location||a.species!==b.species)
    throw Error('Wildlife cannot meet across habitats or incompatible species');
   if(contact(s,w,day,a,b))meetings++;
  }
 }
 return {meetings};
}
module.exports={RULE,sixday,_debug:{alive,ecologicalStatus,pairKey,contact,validatePair}};
