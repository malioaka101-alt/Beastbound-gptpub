'use strict';
// First *actual* off-screen natural births, with defensible source lineage.
// Prototype physiology profiles apply only to two authored mammal taxa.
// Not a general conception command, breeding licence or age-based evolution gate.
const Crypto=require('node:crypto');
const E=require('../engine.js'),Atlas=require('./atlas'),Wild=require('./wild-lives'),Heritage=require('./origin-heredity');
const Species=Object.freeze({
 fenfox:Object.freeze({family:'Vulpiridae',mode:'live litter',gestationDays:42,
  dependentDays:72,juvenileDays:180,adultDays:365,
  minimumForage:55,minimumWater:50,minimumQuality:60,maxPressure:60,
  maxLitter:3,conceptionChance:.18}),
 stonehare:Object.freeze({family:'Leporidae',mode:'live litter',gestationDays:36,
  dependentDays:54,juvenileDays:145,adultDays:280,
  minimumForage:62,minimumWater:45,minimumQuality:55,maxPressure:65,
  maxLitter:3,conceptionChance:.23})
});
const ORIGIN='independent-mammal-birth-v1',GESTATION='independent-mammal-gestation-v1';
const hash=v=>Crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const random=v=>Crypto.createHash('sha256').update(String(v)).digest().readUInt32BE(0)/4294967296;
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
function profile(b){
 const p=Species[b?.species];
 if(!p||E.SPECIES[b.species]?.family!==p.family||
  E.SPECIES[b.species]?.intelligence==='sapient')
  return null;
 return p;
}
function lifeProof(s,b,day=Math.floor(s.world.minutes/1440)){
 const p=profile(b),life=b?.individualLife;
 if(!p||!life||b.owner||b.relationship!=='wild'||
   s.player.partnerIds?.includes(b.id)||
   b.away!==true||s.encounter?.beastId===b.id||
   !E.LOCATIONS[b.location]?.spawns?.includes(b.species)||
   b.condition<70||!Number.isFinite(b.condition)||
   !b.needs||!Number.isFinite(b.needs.hunger)||!Number.isFinite(b.needs.fatigue)||
   b.needs.hunger>55||b.needs.fatigue>65||
   b.injuries?.length||b.conditions?.length||
   /hostile|panicked|terrified|fleeing|desperate/i.test(String(b.mood||'')))
  return false;
 Wild._debug.ensure(s,b,null);
 if(life.source.origin===ORIGIN){
  const birth=b.wildBirth;
  if(!birth||birth.origin!==ORIGIN||birth.birthHash!==hash(birth.source)||
   birth.source.beastId!==b.id||birth.source.species!==b.species||
   birth.source.bornDay>day)
   throw Error('Unverified native-born individual provenance');
  if(life.daysSinceFirstWitness!==undefined&&!life.witnessed.length)
   throw Error('Unwitnessed offspring cannot have invented personal sightings');
  return day-birth.source.bornDay>=p.adultDays;
 }
 // Older witnessed animals have a real pre-existing broad 'young adult'
 // designation, not a fabricated exact birthday.
 return life.witnessed.length>0&&b.age==='young adult';
}
function role(s,b,day){
 if(!lifeProof(s,b,day))return null;
 const life=b.individualLife;
 // Role is independently fixed by identity *before pairing*, not assigned
 // by the player's request or an observed behaviour. It is sealed biological
 // simulation detail, not a social gender declaration or player-known fact.
 return random([s.seed,b.id,life.sourceHash,'gamete-role-v1'].join('|'))<.5?
  'gestational':'non-gestational';
}
function habitat(w,loc,p){
 const reg=Atlas.LOCATION_REGION[loc],eco=w.ecosystems?.[reg];
 if(!reg||!eco||!['forage','water','quality','pressure'].every(k=>
   Number.isFinite(eco[k])&&eco[k]>=0&&eco[k]<=100))
  throw Error('No real source-backed ecological conditions for natural breeding');
 return eco.forage>=p.minimumForage&&eco.water>=p.minimumWater&&
  eco.quality>=p.minimumQuality&&eco.pressure<=p.maxPressure;
}
function unborn(s,gestation){
 const id=gestation.carrierId,parent=s.beasts[id],other=s.beasts[gestation.otherParentId],
  p=profile(parent);
 if(!p||!parent||!other||parent.species!==other.species)
  throw Error('Gestation ancestry must refer to one actual compatible species');
 const parentIds=[id,other.id].sort(),w=s.table.realm;
 if(gestation.origin!==GESTATION||gestation.species!==parent.species||
  gestation.parentIds?.join('|')!==parentIds.join('|')||
  gestation.parentSourceHashes?.join('|')!==
   parentIds.map(v=>s.beasts[v]?.individualLife?.sourceHash).join('|')||
  !Number.isInteger(gestation.conceivedDay)||!Number.isInteger(gestation.dueDay)||
  gestation.sourceSnapshotHash!==hash({origin:gestation.origin,
   contactHash:gestation.contactHash,parentIds:gestation.parentIds,
   sourceHashes:gestation.parentSourceHashes,conceivedAt:gestation.conceivedAt,
   conceivedDay:gestation.conceivedDay,dueDay:gestation.dueDay,
   species:gestation.species})||
  gestation.dueDay!==gestation.conceivedDay+p.gestationDays||
  typeof gestation.contactHash!=='string'||gestation.contactHash.length!==64||
  !w.wildRelations?.[gestation.relationKey]||
  !w.wildRelations[gestation.relationKey].history.some(x=>
   x.day===gestation.conceivedDay&&
   x.location===gestation.conceivedAt&&hash(x)===gestation.contactHash)||
  !['gestating','born','failed'].includes(gestation.outcome))
  throw Error('Unverifiable natural gestation and original co-location record');
 return {parent,other,p,w,parentIds};
}
function child(s,gestation,day,ordinal){
 const {parent,other,p,parentIds}=unborn(s,gestation);
 const spec=E.SPECIES[parent.species];
 if(parent.location!==gestation.conceivedAt &&
    !E.LOCATIONS[parent.location]?.spawns?.includes(parent.species))
  throw Error('Natural birth requires a real compatible habitat');
 const id='beast_'+(++s.sequence),bornAt=parent.location;
 if(s.beasts[id])throw Error('Individual birth identity already exists');
 const source={origin:ORIGIN,beastId:id,species:parent.species,
  parentIds,sourceHashes:parentIds.map(v=>s.beasts[v].individualLife.sourceHash),
  conceivedDay:gestation.conceivedDay,bornDay:day,
  gestationHash:gestation.sourceSnapshotHash,birthplace:bornAt,ordinal};
 const birthHash=hash(source);
 // Biological constitution, the Origin Pattern and dormant/expressed
 // bloodline inheritance follow genuine parent IDs and source witnesses.
 const originPattern=Heritage.inherit({kind:'beast',source,
  parents:parentIds.map(v=>Heritage.fromBeast(s.beasts[v]))});
 const measure=(field,min,max)=>{
  const a=parent.potential?.[field],b=other.potential?.[field];
  if(!Number.isFinite(a)||!Number.isFinite(b))throw Error('No original parent potential to inherit');
  return clamp(Math.round((a+b)/2+(random(birthHash+field)-.5)*18),min,max);
 };
 const potential={growth:measure('growth',0,100),evolution:measure('evolution',0,100),
  intelligence:measure('intelligence',0,100),
  bondCompatibility:measure('bondCompatibility',0,100),
  adaptability:measure('adaptability',0,100)};
 const quality=clamp(Math.round((parent.lineageQuality+other.lineageQuality)/2+
  (random(birthHash+'lineage')-.5)*12),0,100);
 const innateResilience=Math.round((originPattern.physical.resilience-50)/10),
  innateConduction=Math.round((originPattern.physical.energyConduction-50)/10),
  youngHp=Math.max(1,Math.floor(spec.hp/3)+innateResilience),
  youngEnergy=Math.max(1,Math.floor(spec.energy/3)+innateConduction);
 const lifetime={version:1,beastId:id,species:parent.species,
  source:{origin:ORIGIN,beastId:id,species:parent.species,
   birthHash,initialDay:day},rngState:0,
  sourceHash:null,lastTickDay:day,lastWatchMinute:-60,
  history:[],witnessed:[]};
 lifetime.sourceHash=hash(lifetime.source);
 lifetime.rngState=(Crypto.createHash('sha256').update(birthHash+'life')
  .digest().readUInt32BE(0))||0x91e10da5;
 const young={id,name:spec.name,species:parent.species,
  sex:'unrecorded',age:'newborn',appearance:'Small newborn '+spec.name.toLowerCase()+
   ' with individually distinctive markings.',level:1,xp:0,
  speciesGrade:spec.grade,individualGrade:spec.grade,
  evolutionStage:'Base',lineage:spec.lineage,lineageQuality:quality,
  potential,hp:youngHp,maxHp:youngHp,energy:youngEnergy,maxEnergy:youngEnergy,
  trust:0,respect:0,communication:0,resonance:0,coordination:0,
  consent:false,relationship:'wild',syncStage:0,syncPractice:0,
  needs:{hunger:25,fatigue:15},mood:'dependent',injuries:[],
  techniques:[],habitatExposure:{},bondHistory:[],memory:[],
  owner:null,branchMaturity:{},ripeningBySeason:{},patternEchoByStage:{},
  condition:90,location:bornAt,away:true,
  wildBirth:{origin:ORIGIN,source,birthHash},individualLife:lifetime,
  originPattern};
 s.beasts[id]=young;return id;
}
function updateAge(s,day){
 let updated=0;
 for(const b of Object.values(s.beasts||{})){
  if(b.wildBirth?.origin!==ORIGIN)continue;
  const r=b.wildBirth,p=profile(b);
  if(!p||r.birthHash!==hash(r.source)||
   r.source.beastId!==b.id||r.source.species!==b.species||
   !Number.isInteger(r.source.bornDay)||r.source.bornDay>day||
   b.originPattern?.origin!=='source-bound-Origin-inheritance-v1'||
   b.originPattern.birthSourceHash!==r.birthHash||
   b.originPattern.parentIds?.join('|')!==r.source.parentIds.join('|'))
   throw Error('Unverified native-born biological birthday or Origin Pattern inheritance');
  Heritage.origin({...b.originPattern,id:b.id,originSourceHash:r.birthHash});
  const days=day-r.source.bornDay,stage=days<p.dependentDays?'newborn':
   days<p.juvenileDays?'juvenile':days<p.adultDays?'adolescent':'young adult';
  if(b.age!==stage){b.age=stage;updated++;}
  // Changes in body size change physiological reserves. Preserve the
  // existing health/energy fraction; growth is not an instant injury cure.
  const spec=E.SPECIES[b.species],factor=stage==='newborn'?1/3:
   stage==='juvenile'?.55:stage==='adolescent'?.8:1;
  const newHP=Math.max(1,Math.floor(spec.hp*factor)+
   Math.round((b.originPattern.physical.resilience-50)/10));
  const newEnergy=Math.max(1,Math.floor(spec.energy*factor)+
   Math.round((b.originPattern.physical.energyConduction-50)/10));
  const hpRatio=b.maxHp>0?clamp(b.hp/b.maxHp,0,1):1,
   energyRatio=b.maxEnergy>0?clamp(b.energy/b.maxEnergy,0,1):1;
  b.maxHp=newHP;b.hp=Math.round(newHP*hpRatio);
  b.maxEnergy=newEnergy;b.energy=Math.round(newEnergy*energyRatio);
  b.wildAgeDays=days;
 }
 return updated;
}
function sixday(s,day){
 if(!Number.isInteger(day)||day<0)throw Error('Authentic completed world sixday required for breeding');
 const w=s.table?.realm;if(!w)return {conceptions:0,births:0};
 w.wildGestations||={};
 if(w.wildReproductionLastDay!==undefined&&day<=w.wildReproductionLastDay)
  return {conceptions:0,births:0};
 let births=0,conceptions=0;
 // Gestations already existed before today's meetings. A bearer can move
 // between compatible habitats; local survival conditions determine outcome.
 for(const [id,g] of Object.entries(w.wildGestations)){
  if(g.outcome!=='gestating'||day<g.dueDay)continue;
  const {parent,p}=unborn(s,g);
  const canBear=parent.condition>=58&&
   parent.owner===null&&parent.relationship==='wild'&&
   E.LOCATIONS[parent.location]?.spawns?.includes(parent.species)&&
   habitat(w,parent.location,p);
  const live=canBear&&random([w.worldSeed,g.contactHash,day,'birth'].join('|'))<.75;
  if(live){
   const count=1+Math.floor(random([w.worldSeed,g.contactHash,'litter'].join('|'))*p.maxLitter);
   g.birthIds=[];
   for(let n=0;n<count;n++)g.birthIds.push(child(s,g,day,n));
   // Birth record is stable even if gestation status changes afterwards.
   g.outcome='born';g.completedDay=day;g.offspringCount=count;births+=count;
  }else{g.outcome='failed';g.completedDay=day;g.offspringCount=0;}
 }
 // Only an actual, independently resolved, non-kin social meeting may
 // create an opportunity. Same species and closeness alone aren't mating.
 for(const [key,record] of Object.entries(w.wildRelations||{})){
  if(record.lastDay!==day||
     !['coexistence','parallel-foraging'].includes(record.relation)||
     record.history.at(-1)?.day!==day)continue;
  const [aId,bId]=record.beastIds||[],
   a=s.beasts[aId],b=s.beasts[bId];
  if(!a||!b||!profile(a)||a.species!==b.species||a.location!==b.location||
    !lifeProof(s,a,day)||!lifeProof(s,b,day))continue;
  const [ra,rb]=[role(s,a,day),role(s,b,day)];
  if(ra===rb)continue;
  const p=profile(a);
  const mother=ra==='gestational'?a:b,other=mother===a?b:a;
  const prior=w.wildGestations[mother.id];
  if(prior?.outcome==='gestating'||
    (prior?.outcome==='born'&&
     (!Number.isInteger(prior.completedDay)||
      day-prior.completedDay<p.dependentDays)))continue;
  const parents=[a,b];
  if(parents.some(x=>x.wildBirth?.source?.parentIds?.includes(
     x.id===a.id?b.id:a.id)))continue; // no parent-offspring pairing
  if(a.wildBirth&&b.wildBirth&&
     a.wildBirth.source.parentIds.some(id=>b.wildBirth.source.parentIds.includes(id)))
    continue; // no sibling pair
  if(!habitat(w,a.location,p))continue;
  const decision=random([w.worldSeed,key,day,'natural-conception-v1'].join('|'));
  if(decision>=p.conceptionChance)continue;
  const parentIds=[aId,bId].sort(),entry=record.history.at(-1);
  w.wildGestations[mother.id]={origin:GESTATION,species:a.species,
   carrierId:mother.id,otherParentId:other.id,
   parentIds,parentSourceHashes:parentIds.map(id=>s.beasts[id].individualLife.sourceHash),
   relationKey:key,contactHash:hash(entry),
   conceivedAt:a.location,conceivedDay:day,
   dueDay:day+p.gestationDays,outcome:'gestating'};
  const gest=w.wildGestations[mother.id];
  gest.sourceSnapshotHash=hash({origin:gest.origin,contactHash:gest.contactHash,
   parentIds:gest.parentIds,sourceHashes:gest.parentSourceHashes,
   conceivedAt:gest.conceivedAt,conceivedDay:gest.conceivedDay,
   dueDay:gest.dueDay,species:gest.species});
  conceptions++;
 }
 updateAge(s,day);
 w.wildReproductionLastDay=day;
 return {conceptions,births}; // private, not a player observation.
}
module.exports={Species,ORIGIN,GESTATION,sixday,updateAge,
 _debug:{role,lifeProof,habitat,unborn,child,hash}};
