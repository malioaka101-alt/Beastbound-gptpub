'use strict';
// On-demand field individuals from the canonical generative taxonomy.
// This is a first visible SIGHTING, not a measured beast/combat profile,
// guaranteed species identification, bond, capture, power or new population.
// One record per actually observed individual; no full bestiary materialisation.
const Crypto=require('node:crypto'),Bestiary=require('./bestiary'),
 Atlas=require('./atlas'),Engine=require('../engine.js');
const SOURCE='field-witnessed-generated-wild-taxon-v1',DAY=1440;
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const next=n=>{let x=n>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 return (x>>>0)||0x91e10da5;};
const draw=life=>{life.rngState=next(life.rngState);return life.rngState/4294967296;};
const fingerprint=t=>hash({id:t.id,name:t.name,taxonomy:t.taxonomy,
 biome:t.biome,role:t.role,diet:t.diet});
function fit(w,regionId,taxon){
 const region=Atlas.R[regionId],eco=w.ecosystems?.[regionId];
 return !!(region&&eco&&taxon?.id?.startsWith('tx:')&&
   taxon.biome?.includes(region.biome)&&eco.water>=25&&
   eco.forage>=25&&eco.quality>=25&&eco.pressure<=90);
}
function verify(s,b){
 const q=b?.generatedWild,root=q?.source,life=b?.individualLife,
  w=s.table?.realm,reg=Atlas.R[root?.regionId];
 if(!q||!root||root.origin!==SOURCE||
    root.id!==b.id||root.taxonId!==b.species||b.name!==root.name||
    !root.taxonId.startsWith('tx:')||q.seal!==hash(root)||
    !reg||!w?.ecosystems?.[root.regionId]||
    !Number.isInteger(root.minute)||root.minute<0||
    !Number.isInteger(root.firstDay)||root.firstDay!==Math.floor(root.minute/DAY)||
    typeof root.location!=='string'||typeof root.witness!=='string'||
    root.witness.length<12||
    b.evolutionStage!=='Unclassified'||b.relationship!=='wild'||
    b.owner!==null||b.consent===true||b.combatAssessment!==undefined||
    b.hp!==undefined||b.sapience!==undefined||
    !Number.isInteger(q.lastSeenMinute)||q.lastSeenMinute<root.minute||
    !Number.isInteger(q.encounterCount)||q.encounterCount<1||
    !life||life.version!==1||life.beastId!==b.id||life.species!==b.species||
    life.source?.origin!==SOURCE||life.source.beastId!==b.id||
    life.source.species!==b.species||life.source.witnessHash!==q.seal||
    life.source.initialDay!==root.firstDay||
    life.sourceHash!==hash(life.source)||
    !Number.isInteger(life.rngState)||life.rngState<1||
    !Number.isInteger(life.lastTickDay)||life.lastTickDay<root.firstDay||
    !Array.isArray(life.history)||life.history.length>24||
    !Array.isArray(life.witnessed)||life.witnessed.length>24)return false;
 try {
  const taxon=Bestiary.lookup(root.taxonId);
  if(!taxon.biome.includes(reg.biome)||fingerprint(taxon)!==root.taxonHash||
     root.name!==taxon.name)return false;
 }catch(_){return false;}
 return true;
}
function create(s,w,region,taxon,witness){
 if(!fit(w,region.id,taxon)||typeof witness!=='string'||witness.length<12)
  return null;
 let id;
 do{id='beast_'+(++s.sequence);}while(s.beasts?.[id]);
 const root={origin:SOURCE,id,taxonId:taxon.id,name:taxon.name,
  taxonHash:fingerprint(taxon),regionId:region.id,
  location:s.world.location,minute:s.world.minutes,
  firstDay:Math.floor(s.world.minutes/DAY),witness:witness.slice(0,220),
  noCombatOrAbilityProfile:true,noConsentOrRank:true};
 const seal=hash(root),source={origin:SOURCE,beastId:id,
  species:taxon.id,witnessHash:seal,initialDay:root.firstDay};
 const seed=Crypto.createHash('sha256').update(
  String(s.seed)+'|'+id+'|'+seal+'|field-life-v1').digest()
  .readUInt32BE(0)||0x91e10da5;
 const b={id,name:taxon.name,species:taxon.id,
  evolutionStage:'Unclassified',relationship:'wild',owner:null,
  location:s.world.location,away:false,consent:false,
  generatedWild:{source:root,seal,lastSeenMinute:s.world.minutes,encounterCount:1},
  individualLife:{version:1,beastId:id,species:taxon.id,
   source,sourceHash:hash(source),rngState:seed,
   lastTickDay:root.firstDay,lastWatchMinute:-60,
   history:[],witnessed:[{day:root.firstDay,
    minute:root.minute,location:root.location,
    kind:'non-invasive-first-sighting',sourceHash:seal}]}};
 s.beasts||={};s.beasts[id]=b;
 if(!verify(s,b))throw Error('Generated wildlife individual failed provenance verification');
 return {beastId:id,firstSighting:true,previouslyWitnessed:false,
   noCombatBondOrRank:true};
}
function maybeReturn(s,w,region,selector){
 const pool=Object.values(s.beasts||{}).filter(b=>
  b?.generatedWild&&b.location===s.world.location&&
  b.owner===null&&b.relationship==='wild'&&b.away===true&&
  s.world.minutes-b.generatedWild.lastSeenMinute>=60&&
  verify(s,b)&&fit(w,region.id,Bestiary.lookup(b.species)))
  .sort((a,b)=>a.id.localeCompare(b.id));
 if(!pool.length||selector%5!==0)return null;
 const b=pool[Math.floor(selector/5)%pool.length],life=b.individualLife;
 const before=life.rngState,choice=draw(life),seen=choice<.62;
 life.history.push({day:Math.floor(s.world.minutes/DAY),
  type:'independent-visibility-decision',location:s.world.location,
  before,after:life.rngState,wasSeen:seen,observed:seen});
 if(life.history.length>24)life.history.shift();
 if(!seen)return null;
 b.away=false;b.generatedWild.lastSeenMinute=s.world.minutes;
 b.generatedWild.encounterCount++;
 life.witnessed.push({day:Math.floor(s.world.minutes/DAY),
  minute:s.world.minutes,location:s.world.location,
  kind:'same-individual-return',sourceHash:b.generatedWild.seal});
 if(life.witnessed.length>24)life.witnessed.shift();
 return {beastId:b.id,firstSighting:false,previouslyWitnessed:true,
  noCombatBondOrRank:true};
}
function sixday(s,days){
 const w=s.table?.realm;if(!w)return {updated:0};
 let updated=0;
 for(const day of days){
  for(const b of Object.values(s.beasts||{})){
   if(!b?.generatedWild)continue;
   if(!verify(s,b))throw Error('Generated individual wildlife source was altered');
   const life=b.individualLife;
   if(day<=life.lastTickDay)continue;
   const eco=w.ecosystems[b.generatedWild.source.regionId];
   const choice=draw(life),shortage=eco.forage<35||eco.water<30;
   const action=shortage?'searching-for-local-sustenance':
    choice<.35?'independent-foraging':
    choice<.65?'sheltering':'local-territorial-routine';
   life.history.push({day,type:'offscreen-sixday',action,
    regionId:b.generatedWild.source.regionId,observed:false,
    noPowerOrWagesAward:true});
   if(life.history.length>24)life.history.shift();
   b.away=true;life.lastTickDay=day;updated++;
  }
 }
 return {updated};
}
function sighting(s,w,region,taxon,selector,witness){
 const result=maybeReturn(s,w,region,selector)||
   create(s,w,region,taxon,witness);
 return result;
}
module.exports={SOURCE,verify,create,maybeReturn,sighting,sixday};
