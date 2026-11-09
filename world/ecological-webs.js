'use strict';
// Original Master Prompt §11. Extends actual world.ecosystems[region] values:
// no parallel geography, no invented encounter/spawn, no second world clock.
// GM authors ecological relationships; independent world ticks update indices.
// Population indices are regional *signals*, not exact counts or named animals.
const Crypto=require('node:crypto'),A=require('./atlas'),B=require('./bestiary'),E=require('../engine');
const SOURCE='living-food-web-ecology-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{3,79}$/.test(x);
const desc=(x,min=12,max=700)=>typeof x==='string'&&x.trim().length>=min&&x.trim().length<=max;
const amount=(n,a=0,b=200)=>Number.isInteger(n)&&n>=a&&n<=b;
const visibility=['public','gm-only'];
const minmax=(v,a=0,b=200)=>Math.max(a,Math.min(b,v));
const check=(p,required,optional=[])=>{
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).some(k=>![...required,...optional].includes(k))||
  required.some(k=>!Object.hasOwn(p,k)))
  throw Error('Ecological facts must be GM-authored, source-backed and connected to existing world records');
};
function biological(w,speciesId){
 const ledger=w.speciesBiology||B.bioDefaultSeed();
 B.bioValidate(ledger);
 return ledger.species[speciesId]||null;
}
function regionWeb(w,regionId){
 const eco=w.ecosystems?.[regionId];
 if(!eco||!A.R[regionId])throw Error('Ecological webs require an actual established Atlas habitat');
 return eco;
}
const original=(raw,children={})=>({...raw,originHash:hash(raw),...children});
function entity(raw,origin='gm-established'){
 return original({...raw,source:SOURCE,origin},{currentIndex:raw.initialIndex,
  lastDay:raw.recordedDay,history:[],stateSeal:null});
}
function liveSeal(p){
 const {stateSeal,...other}=p;
 return hash({id:other.id,currentIndex:other.currentIndex,lastDay:other.lastDay,history:other.history});
}
function sealLive(p){p.stateSeal=liveSeal(p);return p;}
function ensureRegion(w,regionId){
 const eco=regionWeb(w,regionId);
 if(!eco.web)eco.web={source:SOURCE,version:1,regionId,species:{},relations:{},
  lastSixday:0,lastMonth:0};
 return eco.web;
}
function seedRegion(w,regionId,day=0){
 const web=ensureRegion(w,regionId);
 // Two starting examples use physical animals already in the real forest
 // encounter table, with matching original physiology and native habitat.
 // These are regional relative-abundance indices, NOT newborns.
 if(regionId==='copperwood'&&E.LOCATIONS.forest?.spawns?.includes('fenfox')&&
    E.LOCATIONS.forest?.spawns?.includes('stonehare')){
  for(const key of ['fenfox','stonehare']){
   const speciesId='authored:'+key,profile=biological(w,speciesId);
   if(!profile||!profile.habitatRegions.includes(regionId))
    throw Error('Starting ecology would contradict an existing canonical native habitat');
   const group=B.GROUPS.find(x=>x.family===E.SPECIES[key].family);
   const family=w.ecosystems[regionId].indicators[group?.id]||null;
   const n=minmax(Math.round((family?.population??w.ecosystems[regionId].forage)/3),4,70);
   const root={id:speciesId,regionId,initialIndex:n,capacityIndex:Math.max(45,n+15),
    basis:'Established Copperwood Verge local wild spawns and extant sampled habitat family indices',
    visibility:'gm-only',recordedDay:day,parentRegion:null,provenance:'existing-sampled-habitat'};
   web.species[speciesId]=sealLive(entity(root,'existing-native-encounter-and-biological-source'));
  }
  const root={id:'copperwood_fox_hare_foodweb',regionId,
   from:'authored:fenfox',to:'authored:stonehare',kind:'predation',strength:1,
   description:'The ordinary omnivorous fox is a local small prey predator and may hunt hares in shared woodland habitat.',
   basis:'Existing engine.SPECIES roles, regional native spawns and canonical diet',
   visibility:'gm-only',recordedDay:day};
  web.relations[root.id]=original({...root,source:SOURCE},{mechanism:'predation'});
 }
 return web;
}
function seed(w,day=0){
 for(const r of A.regions)seedRegion(w,r.id,day);
}
function parentRoot(p){
 const {originHash,currentIndex,lastDay,history,stateSeal,...old}=p;
 return old;
}
function validate(w){
 for(const r of A.regions){
  const web=w.ecosystems[r.id]?.web;
  if(!web)continue; // Support read-only migration for pre-foundation saves.
  if(web.source!==SOURCE||web.version!==1||web.regionId!==r.id||
    !web.species||!web.relations||Array.isArray(web.species)||
    Array.isArray(web.relations)||!amount(web.lastSixday,0,1e9)||
    !amount(web.lastMonth,0,1e9))
   throw Error('Invalid saved regional ecological food web');
  for(const [sid,p] of Object.entries(web.species)){
   if(sid!==p.id||p.regionId!==r.id||!biological(w,sid)||
    !amount(p.initialIndex)||!amount(p.capacityIndex,1)||
    p.initialIndex>p.capacityIndex||!amount(p.currentIndex)||
    !amount(p.lastDay,0,1e9)||!amount(p.recordedDay,0,1e9)||
    !desc(p.basis)||!visibility.includes(p.visibility)||
    !['existing-native-encounter-and-biological-source','gm-established','verified-neighbour-migration'].includes(p.origin)||
    !['existing-sampled-habitat','gm-established','conserved-migration'].includes(p.provenance)||
    !Array.isArray(p.history)||p.history.length>32||
    p.history.some(h=>!amount(h.day,0,1e9)||!amount(h.before)||!amount(h.after)||
      !desc(h.reason,4,250))||
    hash(parentRoot(p))!==p.originHash||liveSeal(p)!==p.stateSeal)
    throw Error('A source-backed animal population or its actual tick history was forged');
  }
  for(const [key,e] of Object.entries(web.relations)){
   if(key!==e.id||e.regionId!==r.id||
    !web.species[e.from]||!web.species[e.to]||e.from===e.to||
    !id(e.id)||!id(e.kind)||!amount(e.strength,1,3)||
    !desc(e.description,16,900)||!desc(e.basis)||!visibility.includes(e.visibility)||
    !amount(e.recordedDay,0,1e9))
    throw Error('A named food-web relationship needs two actual established local populations');
   const {originHash,mechanism,...root}=e;
   if(root.source!==SOURCE||hash(root)!==originHash)
    throw Error('A historical predator, prey or symbiosis link was silently changed');
  }
 }
 return true;
}
function scientificBasis(w,regionId,speciesId){
 const species=biological(w,speciesId);
 if(!species)throw Error('Ecological population needs an established real biological taxon');
 if(!species.habitatRegions.includes(regionId))
  throw Error('Ecological population cannot be established outside its documented actual habitat');
 return species;
}
function establish(s,p={}){
 check(p,['regionId','speciesId','populationIndex','capacityIndex','basis'],['visibility']);
 if(!A.R[p.regionId]||!amount(p.populationIndex)||!amount(p.capacityIndex,1)||
  p.populationIndex>p.capacityIndex||!desc(p.basis,20,700)||
  !visibility.includes(p.visibility||'gm-only'))
  throw Error('Starting population needs a real habitat, relative index, carrying capacity and independent biological source');
 const w=require('./simulation').ensure(s);
 const biologicalRecord=scientificBasis(w,p.regionId,p.speciesId);
 if(p.visibility==='public'&&biologicalRecord.visibility==='gm-only')
  throw Error('An undiscovered species cannot become publicly known through a hidden population ledger');
 const web=ensureRegion(w,p.regionId);
 if(web.species[p.speciesId])throw Error('Existing species population cannot be reset or duplicated');
 const day=Math.floor(s.world.minutes/1440);
 const root={id:p.speciesId,regionId:p.regionId,initialIndex:p.populationIndex,
  capacityIndex:p.capacityIndex,basis:p.basis.trim(),
  visibility:p.visibility||'gm-only',recordedDay:day,parentRegion:null,
  provenance:'gm-established'};
 web.species[p.speciesId]=sealLive(entity(root));
 return {established:true,regionId:p.regionId,speciesId:p.speciesId,
  noIndividualCreated:true,noGameplayReward:true};
}
const MECHANISMS=['predation','competition','symbiosis','parasitism','grazing','resource-dependence'];
function link(s,p={}){
 check(p,['regionId','linkId','from','to','kind','description','basis'],
  ['strength','visibility']);
 if(!A.R[p.regionId]||!id(p.linkId)||!id(p.kind)||p.from===p.to||
  !desc(p.description,16,900)||!desc(p.basis,12,700)||
  !amount(p.strength??1,1,3)||!visibility.includes(p.visibility||'gm-only'))
  throw Error('An ecological interaction requires plausible participants, observed relation and intensity');
 const w=require('./simulation').ensure(s),web=ensureRegion(w,p.regionId);
 if(!web.species[p.from]||!web.species[p.to])
  throw Error('Both interacting populations must have already existed in the same real region');
 if(web.relations[p.linkId])throw Error('An established ecological relationship cannot be silently redefined');
 if(p.visibility==='public'&&
  (web.species[p.from].visibility==='gm-only'||web.species[p.to].visibility==='gm-only'))
  throw Error('Hidden population identities cannot be revealed through a public link');
 if(p.kind==='predation'){
  const predator=biological(w,p.from),diet=predator.diet.toLowerCase();
  if(!/carniv|omniv|insect|meat|prey|scaveng|fish/.test(diet))
   throw Error('A biological predator needs a carnivorous or omnivorous diet, not an invented hunting trait');
 }
 const root={source:SOURCE,id:p.linkId,regionId:p.regionId,from:p.from,to:p.to,
  kind:p.kind,strength:p.strength??1,description:p.description.trim(),
  basis:p.basis.trim(),visibility:p.visibility||'gm-only',
  recordedDay:Math.floor(s.world.minutes/1440)};
 web.relations[p.linkId]=original(root,{mechanism:MECHANISMS.includes(p.kind)?p.kind:'documented-only'});
 return {recorded:true,mechanism:web.relations[p.linkId].mechanism,
  noCreatureActionForced:true};
}
function change(p,delta,day,reason){
 const before=p.currentIndex,after=minmax(before+delta,0,p.capacityIndex);
 if(after===before)return false;
 p.currentIndex=after;p.lastDay=day;
 p.history.push({day,before,after,reason});
 if(p.history.length>32)p.history.splice(0,p.history.length-32);
 sealLive(p);
 return true;
}
function suitable(w,r,record){
 const species=biological(w,record.id),eco=w.ecosystems[r];
 if(!species||!eco||!species.habitatRegions.includes(r))return false;
 if(!species.needs)return null; // Unknown thresholds do not prove suitability.
 return eco.forage>=species.needs.minForage&&
  eco.water>=species.needs.minWater&&
  eco.quality>=species.needs.minQuality&&
  eco.pressure<=species.needs.maxPressure;
}
function season(w,day){
 if(!w.calendarAnchor)return null;
 const W=require('../rules/world');
 const d=W.addDate(w.calendarAnchor.date,day-w.calendarAnchor.atCompletedDay);
 return d.month<=2||d.month>=11?'winter':d.month<=4?'spring':d.month<=7?'summer':'autumn';
}
function sixday(w,day){
 if(!amount(day,0,1e9))throw Error('Food web must follow an actual completed world sixday');
 for(const r of A.regions){
  const web=w.ecosystems[r.id]?.web;if(!web||web.lastSixday>=day)continue;
  const eco=w.ecosystems[r.id],cycle=season(w,day);
  for(const p of Object.values(web.species)){
   const species=biological(w,p.id),fit=suitable(w,r.id,p);
   let shift=0;
   if(fit===false)shift=eco.quality<30||eco.pressure>80?-2:-1;
   else if(fit===true){
    // Coarse relative recruitment, NOT a birth, fertilisation, or creation
    // of any individual. Strong reproductive evidence and a real season help.
    const reproductiveAge=Number.isInteger(species.reproduction.adultDays);
    const room=p.currentIndex<p.capacityIndex&&eco.forage>=40;
    if(reproductiveAge&&room&&
      (cycle==='spring'||cycle==='summer'||cycle===null)&&day%12===0)
     shift=1;
   }
   if(shift)change(p,shift,day,shift<0?
    'Existing habitat constraints reduce the local population signal':
    'Good habitat and real reproductive life history support slow population recovery');
  }
  for(const relation of Object.values(web.relations)){
   const a=web.species[relation.from],b=web.species[relation.to];
   if(!a.currentIndex||!b.currentIndex)continue;
   const scarce=eco.forage<40||eco.water<35;
   if(relation.mechanism==='predation'&&day%12===0){
    change(b,-relation.strength,day,'Existing prey population experiences documented predation pressure');
    if(suitable(w,r.id,a)===true&&a.currentIndex<a.capacityIndex)
     change(a,1,day,'Known prey availability supports the established predator population');
   }else if(relation.mechanism==='competition'&&scarce){
    const weaker=a.currentIndex<=b.currentIndex?a:b;
    change(weaker,-1,day,'Competing documented species face shared real scarcity');
   }else if(relation.mechanism==='parasitism'&&day%12===0){
    change(b,-1,day,'Recorded parasitism lowers host population recovery');
   }else if(relation.mechanism==='symbiosis'&&
      suitable(w,r.id,a)===true&&suitable(w,r.id,b)===true&&day%24===0){
    change(a,1,day,'Documented ecological partner supports recovery');
    change(b,1,day,'Documented ecological partner supports recovery');
   }else if(relation.mechanism==='grazing'&&eco.forage<35&&day%12===0){
    change(a,-1,day,'Low real forage limits the established grazer');
   }
  }
  web.lastSixday=day;
 }
}
function month(w,day){
 if(!amount(day,0,1e9))throw Error('Species migration requires the existing completed world month');
 const tasks=[];
 for(const reg of A.regions){
  const src=w.ecosystems[reg.id]?.web;if(!src||src.lastMonth>=day)continue;
  for(const id of reg.neighbors||[]){
   const target=w.ecosystems[id]?.web;
   if(!target||!A.R[id]||reg.id===id)continue;
   for(const pop of Object.values(src.species)){
    if(pop.currentIndex<22||!scientificBasis(w,id,pop.id))continue;
    const srcEco=w.ecosystems[reg.id],dstEco=w.ecosystems[id];
    if(dstEco.quality<30||dstEco.forage<srcEco.forage+8||
      dstEco.pressure>70)continue;
    // One source-to-target transfer, never an instant distant spawn.
    tasks.push({from:reg.id,to:id,speciesId:pop.id,units:Math.min(2,Math.floor(pop.currentIndex/12))});
   }
  }
 }
 // Prevent the destination from re-exporting received index in this month.
 const received=new Set();
 for(const t of tasks.sort((a,b)=>(a.from+a.to+a.speciesId).localeCompare(b.from+b.to+b.speciesId))){
  if(!t.units||received.has(t.from+':'+t.speciesId))continue;
  const src=w.ecosystems[t.from].web,dst=w.ecosystems[t.to].web,
   a=src.species[t.speciesId];
  if(a.currentIndex<=t.units+12)continue;
  let b=dst.species[t.speciesId];
  if(!b){
   const root={id:t.speciesId,regionId:t.to,initialIndex:t.units,
    capacityIndex:Math.max(t.units+18,Math.round(a.capacityIndex*.65)),
    basis:'Conserved migration from adjacent native habitat '+t.from+
     ' along the actual Atlas region-neighbour connection',
    visibility:a.visibility,recordedDay:day,parentRegion:t.from,
    provenance:'conserved-migration'};
   b=dst.species[t.speciesId]=sealLive(entity(root,'verified-neighbour-migration'));
  }else change(b,t.units,day,'Conserved monthly movement from documented adjacent habitat');
  change(a,-t.units,day,'Conserved monthly migration along established Atlas neighbour link');
  received.add(t.to+':'+t.speciesId);
 }
 for(const r of A.regions)if(w.ecosystems[r.id]?.web)w.ecosystems[r.id].web.lastMonth=day;
}
function status(s,p={}){
 check(p,[],['regionId','speciesId']);
 const w=require('./simulation').peek(s);
 validate(w);
 const regionId=p.regionId||require('./simulation').locationRegion(s);
 if(!A.R[regionId])throw Error('A known actual region is required to inspect its living food web');
 const web=w.ecosystems[regionId]?.web;
 if(!web)return {regionId,knownSpecies:[],knownInteractions:[],
  note:'Legacy save has no recorded species-level ecological relationships'};
 const visible=Object.values(web.species).filter(x=>x.visibility==='public');
 const named=visible.filter(x=>!p.speciesId||x.id===p.speciesId);
 return {regionId,knownSpecies:named.map(x=>({
  speciesId:x.id,name:biological(w,x.id)?.name,
  note:'Historical recorded population presence, not a current count or an encounter'})),
  knownInteractions:Object.values(web.relations)
    .filter(x=>x.visibility==='public'&&named.some(p=>p.id===x.from)&&
      visible.some(p=>p.id===x.to))
    .map(x=>({linkId:x.id,kind:x.kind,from:x.from,to:x.to,description:x.description})),
  note:'Current private regional population, predator success and migration numbers are not revealed by a catalogue lookup'};
}
module.exports={SOURCE,seed,seedRegion,ensureRegion,validate,
 establish,link,sixday,month,status,_debug:{suitable,change,season}};
