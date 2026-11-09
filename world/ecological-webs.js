'use strict';
// Foundation #04: species ecology INSIDE the existing regional ecosystem ledger.
// Indexes are coarse regional abundance indicators, not individual beasts.
// The GM establishes a witnessed ecological fact; the engine runs the consequences.
const Crypto=require('node:crypto'),Atlas=require('./atlas'),Bestiary=require('./bestiary'),Engine=require('../engine');
const SOURCE='world-region-species-web-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const clamp=(x,lo=0,hi=200)=>Math.max(lo,Math.min(hi,x));
const int=(x,lo,hi)=>Number.isInteger(x)&&x>=lo&&x<=hi;
const text=(x,min=12,max=600)=>typeof x==='string'&&x.trim().length>=min&&x.trim().length<=max;
const localRegion=s=>Atlas.LOCATION_REGION[s.world.location]||
 require('./lived-places').get(s,s.world.location)?.regionId||null;
const sourceBody=(record)=>{const {seal,...body}=record;return body;};
function web(eco){return eco.speciesWeb||{source:SOURCE,populations:{},links:[]};}
function validate(w){
 Bestiary.bioValidate(w.speciesBiology||Bestiary.bioDefaultSeed());
 for(const [regionId,eco] of Object.entries(w.ecosystems||{})){
  if(!Atlas.R[regionId])throw Error('Unknown ecological region');
  const v=web(eco);
  if(v.source!==SOURCE||!v.populations||Array.isArray(v.populations)||!Array.isArray(v.links))
   throw Error('Invalid regional food web');
  for(const [id,p] of Object.entries(v.populations)){
   if(!p||id!==p.origin?.speciesId||p.origin.regionId!==regionId||
      p.origin.source!==SOURCE||p.originHash!==hash(p.origin)||
      !text(p.origin.basis)||!['public','gm-only'].includes(p.origin.visibility)||
      !int(p.origin.startIndex,0,200)||!int(p.origin.capacity,1,200)||
      !int(p.origin.foundedDay,0,10000000)||!int(p.index,0,200)||
      !Array.isArray(p.history)||p.history.length>200)
    throw Error('Regional species population source was changed');
   const known=w.speciesBiology?.species[id];
   if(!known||!known.habitatRegions.includes(regionId))
    throw Error('Regional species population contradicts established biology');
   let previous=p.origin.startIndex,seal=p.originHash,day=p.origin.foundedDay;
   if(p.archive){
    const a=p.archive,root={originHash:p.originHash,index:a.index,day:a.day,lastSeal:a.lastSeal};
    if(!int(a.index,0,200)||!int(a.day,p.origin.foundedDay,10000000)||
       typeof a.lastSeal!=='string'||a.checksum!==hash(root))
     throw Error('Archived population history checkpoint was altered');
    previous=a.index;seal=a.lastSeal;day=a.day;
   }
   for(const h of p.history){
    if(!int(h.day,day,10000000)||h.before!==previous||
       !int(h.after,0,200)||typeof h.reason!=='string'||
       h.previous!==seal||h.seal!==hash(sourceBody(h)))
     throw Error('Regional population history was rewritten');
    previous=h.after;seal=h.seal;day=h.day;
   }
   if(previous!==p.index)throw Error('Regional population index does not match its history');
  }
  const seen=new Set();
  for(const l of v.links){
   if(l.source!==SOURCE||l.regionId!==regionId||
      !['preys-on','feeds-on-forage','pollinates-habitat'].includes(l.kind)||
      !text(l.basis)||!['public','gm-only'].includes(l.visibility)||
      l.seal!==hash(sourceBody(l))||
      !v.populations[l.fromSpeciesId]||
      (l.kind==='preys-on'&&!v.populations[l.toSpeciesId])||
      (l.kind!=='preys-on'&&l.toSpeciesId!=='habitat:forage')||
      (l.kind==='preys-on'&&l.fromSpeciesId===l.toSpeciesId))
    throw Error('Food-web link lacks an authentic source and actual local taxa');
   const key=l.kind+'|'+l.fromSpeciesId+'|'+l.toSpeciesId;
   if(seen.has(key))throw Error('Duplicate food-web source relation');
   seen.add(key);
  }
 }
 return true;
}
function ensure(s){
 const w=require('./simulation').ensure(s);
 if(!w.speciesBiology)w.speciesBiology=Bestiary.bioDefaultSeed();
 validate(w);
 return w;
}
function createPresence(w,{regionId,speciesId,index,capacity,basis,visibility='gm-only',day=0}){
 const eco=w.ecosystems[regionId],bio=w.speciesBiology?.species[speciesId];
 if(!eco||!bio||!bio.habitatRegions.includes(regionId))
  throw Error('Population must belong to a real established species habitat');
 if(!int(index,0,200)||!int(capacity,1,200)||!text(basis)||
    !['public','gm-only'].includes(visibility))
  throw Error('A region population needs an evidenced abundance index and visibility');
 eco.speciesWeb||={source:SOURCE,populations:{},links:[]};
 if(eco.speciesWeb.populations[speciesId])throw Error('Population already established in this region');
 const origin={source:SOURCE,regionId,speciesId,startIndex:index,capacity,basis:basis.trim(),
  visibility,foundedDay:day};
 eco.speciesWeb.populations[speciesId]={origin,originHash:hash(origin),index,history:[]};
 return eco.speciesWeb.populations[speciesId];
}
function seed(w){
 // Two pre-existing authored animals share an actual source-backed Copperwood
 // spawn habitat; the numbers are abundance INDICES, never animal headcounts.
 createPresence(w,{regionId:'copperwood',speciesId:'authored:fenfox',index:24,
  capacity:75,visibility:'public',
  basis:'Existing Copperwood engine spawn habitat and canonical Fenfox biology; starting regional abundance indicator.'});
 createPresence(w,{regionId:'copperwood',speciesId:'authored:stonehare',index:46,
  capacity:95,visibility:'public',
  basis:'Existing Copperwood engine spawn habitat and canonical Flint-Ear Hare biology; starting regional abundance indicator.'});
 linkInto(w,{regionId:'copperwood',fromSpeciesId:'authored:stonehare',
  toSpeciesId:'habitat:forage',kind:'feeds-on-forage',visibility:'public',
  basis:'Canonical herbivore and seed-carrier consuming actual forest-edge vegetation.'});
 linkInto(w,{regionId:'copperwood',fromSpeciesId:'authored:fenfox',
  toSpeciesId:'authored:stonehare',kind:'preys-on',visibility:'public',
  basis:'GM-established illustrative forest-edge predator-prey relationship; not a guarantee of an individual hunt.'});
}
function authorPopulation(s,p={}){
 const allowed=['regionId','speciesId','index','capacity','basis','visibility'];
 if(!p||Object.keys(p).some(k=>!allowed.includes(k)))throw Error('Unsupported population command');
 const w=ensure(s),record=createPresence(w,{...p,day:Math.floor(s.world.minutes/1440)});
 return {recorded:true,regionId:p.regionId,speciesId:p.speciesId,index:record.index,
  noEncounterOrAnimalCreated:true};
}
function linkInto(w,{regionId,fromSpeciesId,toSpeciesId,kind,basis,visibility='gm-only'}){
 const eco=w.ecosystems[regionId],v=eco&&web(eco);
 if(!eco||!v.populations[fromSpeciesId]||
    !['preys-on','feeds-on-forage','pollinates-habitat'].includes(kind)||
    (kind==='preys-on'&&(!v.populations[toSpeciesId]||fromSpeciesId===toSpeciesId))||
    (kind!=='preys-on'&&toSpeciesId!=='habitat:forage')||
    !text(basis)||!['public','gm-only'].includes(visibility))
  throw Error('Food link requires documented local species, ecological resource and source');
 if(kind==='pollinates-habitat'){
  const b=w.speciesBiology.species[fromSpeciesId];
  if(!/pollinat|nectar/i.test(b.ecologicalRole+' '+b.diet))
   throw Error('Pollination must be grounded in recorded species biology');
 }
 const root={source:SOURCE,regionId,fromSpeciesId,toSpeciesId,kind,basis:basis.trim(),visibility};
 const seal=hash(root);
 if(v.links.some(l=>l.kind===kind&&l.fromSpeciesId===fromSpeciesId&&l.toSpeciesId===toSpeciesId))
  throw Error('Food web relationship already exists');
 const link={...root,seal};
 eco.speciesWeb||={source:SOURCE,populations:{},links:[]};
 eco.speciesWeb.links.push(link);
 return link;
}
function authorLink(s,p={}){
 const allowed=['regionId','fromSpeciesId','toSpeciesId','kind','basis','visibility'];
 if(!p||Object.keys(p).some(k=>!allowed.includes(k)))throw Error('Unsupported food-web command');
 const w=ensure(s),entry=linkInto(w,p);
 return {recorded:true,regionId:entry.regionId,kind:entry.kind,noCompelledIndividualBehaviour:true};
}
function append(p,day,after,reason){
 if(after===p.index)return;
 const row={day,before:p.index,after,reason,previous:p.history.length?
  p.history[p.history.length-1].seal:(p.archive?.lastSeal||p.originHash)};
 row.seal=hash(row);
 p.history.push(row);p.index=after;
 if(p.history.length>180){
  // Preserve recent facts and source-linked archive receipts through decades.
  const retired=p.history.splice(0,60),last=retired[retired.length-1];
  const root={originHash:p.originHash,index:last.after,day:last.day,lastSeal:last.seal};
  p.archive={...root,checksum:hash(root)};
 }
}
function suitable(b,eco){const n=b.needs;
 return !!n&&eco.forage>=n.minForage&&eco.water>=n.minWater&&
  eco.quality>=n.minQuality&&eco.pressure<=n.maxPressure;
}
function sixday(w,day){
 validate(w);
 for(const [regionId,eco] of Object.entries(w.ecosystems)){
  const v=web(eco),delta={},snapshot={};
  for(const [id,p] of Object.entries(v.populations)){
   snapshot[id]=p.index;
   const biology=w.speciesBiology.species[id];
   const fit=suitable(biology,eco);
   const breed=fit&&biology.reproduction.adultDays!==null&&
    biology.reproduction.juvenileDays!==null;
   delta[id]=p.index===0?0:!fit?-2:
    p.index>=p.origin.capacity?-1:breed?Math.max(1,Math.min(2,Math.floor(p.index/35))):0;
  }
  for(const l of v.links){
   const from=snapshot[l.fromSpeciesId];
   if(!from)continue;
   if(l.kind==='preys-on'){
    const prey=snapshot[l.toSpeciesId];
    if(prey>=2){delta[l.toSpeciesId]-=Math.min(2,Math.floor(from/25)+1);}
    else delta[l.fromSpeciesId]-=1;
   } else if(l.kind==='feeds-on-forage'&&eco.forage<30){
    delta[l.fromSpeciesId]-=1;
   } else if(l.kind==='pollinates-habitat'&&from>=20&&eco.quality>=40&&eco.water>=35)
    eco.forage=Math.min(100,eco.forage+1);
  }
  for(const [id,p] of Object.entries(v.populations)){
   const after=clamp(p.index+delta[id],0,p.origin.capacity);
   append(p,day,after,'Independent sixday habitat, food and reproduction pressures');
  }
 }
}
function month(w,day){
 validate(w);
 // Migration transfers existing abundance only between ALREADY recorded
 // populations in genuinely adjacent, physiologically suitable regions.
 for(const region of Atlas.regions){
  const source=w.ecosystems[region.id];
  for(const neighborId of region.neighbors||[]){
   if(region.id>=neighborId)continue;
   const dest=w.ecosystems[neighborId];
   if(!dest)continue;
   const left=web(source),right=web(dest);
   for(const [id,p] of Object.entries(left.populations)){
    const q=right.populations[id],bio=w.speciesBiology.species[id];
    if(!q||!suitable(bio,source)||!suitable(bio,dest))continue;
    const gap=source.forage-dest.forage;
    if(Math.abs(gap)<12)continue;
    const donor=gap<0?p:q,recipient=gap<0?q:p;
    const moved=Math.min(2,donor.index,recipient.origin.capacity-recipient.index);
    if(moved<=0)continue;
    append(donor,day,donor.index-moved,'Actual neighbouring-habitat migration');
    append(recipient,day,recipient.index+moved,'Actual neighbouring-habitat migration');
   }
  }
 }
}
function status(s,{regionId}={}){
 const id=regionId||localRegion(s);
 if(!Atlas.R[id])throw Error('Unknown requested ecological region');
 if(id!==localRegion(s))return {known:false,regionId:id,
  note:'Remote ecological population records require a genuine public report or encounter'};
 const w=require('./simulation').peek(s);
 validate(w);
 const v=web(w.ecosystems[id]);
 const visible=Object.values(v.populations).filter(p=>p.origin.visibility==='public');
 const ids=new Set(visible.map(p=>p.origin.speciesId));
 return {known:true,regionId:id,
  note:'Only locally published ecological records; raw habitat measurements require actual field evidence',
  populations:visible.map(p=>({speciesId:p.origin.speciesId,
   speciesName:w.speciesBiology.species[p.origin.speciesId].name,
   abundanceIndex:p.index,capacityIndex:p.origin.capacity,
   recordedChanges:p.history.length})),
  links:v.links.filter(l=>l.visibility==='public'&&ids.has(l.fromSpeciesId)&&
   (l.toSpeciesId==='habitat:forage'||ids.has(l.toSpeciesId)))
    .map(l=>({fromSpeciesId:l.fromSpeciesId,toSpeciesId:l.toSpeciesId,kind:l.kind})),
  noGuaranteeOfSightingsBirthsOrIndividualHunts:true};
}
module.exports={SOURCE,seed,validate,authorPopulation,authorLink,status,sixday,month};
