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
  location:s.world.location,away:true,consent:false,
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
 if(!pool.length||selector%7!==0)return null;
 const b=pool[Math.floor(selector/7)%pool.length],life=b.individualLife;
 const before=life.rngState,choice=draw(life),seen=choice<.62;
 life.history.push({day:Math.floor(s.world.minutes/DAY),
  type:'independent-visibility-decision',location:s.world.location,
  before,after:life.rngState,wasSeen:seen,observed:seen});
 if(life.history.length>24)life.history.shift();
 if(!seen)return null;
 // A field glimpse is not an active encounter or continued co-presence.
 b.away=true;b.generatedWild.lastSeenMinute=s.world.minutes;
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
// A chosen *search target* is a previously seen individual, not a chosen
// outcome. A source-owned field check and the animal's own independent RNG
// determine whether the player sees it again. No combat or bond is unlocked.
function track(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
   Object.keys(p).join('|')!=='beastId'||typeof p.beastId!=='string')
  throw Error('Tracking a generated animal requires only an originally witnessed individual ID');
 const b=s.beasts?.[p.beastId];
 if(!b?.generatedWild||!verify(s,b))
  throw Error('Only an original generated wildlife sighting may be tracked');
 if(s.encounter||s.battle||b.owner||b.relationship!=='wild')
  throw Error('The animal is independent and no conflicting encounter may be active');
 if(s.table?.combatants?.player?.status&&
    s.table.combatants.player.status!=='ok')
  throw Error('Incapacitation prevents independent wildlife tracking');
 const C=require('../rules/core'),W=require('../rules/world'),
  U=require('../rules/unified'),site=s.world.location,
  origin=b.generatedWild.source,regionId=Atlas.LOCATION_REGION[site]||
   require('./lived-places').location(s)?.regionId;
 if(!regionId||!Atlas.R[regionId]||Atlas.R[regionId].biome==='settlement')
  throw Error('The remembered animal can only be sought in a genuine outdoor habitat');
 const stamina=C.int(s.player.stamina,'tracking stamina',0,100000),
  other=s.table?.combatants?.player;
 if(stamina<3||(other&&other.stamina<3))
  throw Error('Insufficient actual Stamina to track a remembered beast');
 const at=s.world.minutes;
 C.event(s,'world','A field search begins for the witnessed individual; its whereabouts remain uncertain.',{
  origin:SOURCE,beastId:b.id,site,startMinute:at,
  timeMinutes:45,staminaCost:3,noAssumedAnimalLocation:true});
 Engine.advance(s,45);W.finalizeTime(s,at);
 s.player.stamina-=3;
 if(other){other.stamina=s.player.stamina;U.sync(s,{source:'wounds'});}
 const eco=s.table?.realm?.ecosystems?.[regionId];
 const dc=eco&&(eco.pressure>75||eco.quality<30)?16:14;
 const stat=C.int(s.player.attributes?.wis,'earned tracking Wisdom',1,30),
  skill=C.int(s.player.skills?.survival?.rank,'earned Survival skill',0,5);
 const check=C.check(s,{modifier:Math.floor((stat-10)/2)+2*skill,
  dc,label:'Find the original unclassified field beast',risky:false});
 const atSource=origin.regionId===regionId&&b.location===site;
 const possible=atSource&&fit(s.table.realm,regionId,Bestiary.lookup(b.species));
 const life=b.individualLife;
 const accepted=check.success&&possible&&draw(life)<.58;
 life.history.push({day:Math.floor(s.world.minutes/DAY),
  type:'personal-search-response',location:site,
  observed:accepted,notGuaranteed:true});
 if(life.history.length>24)life.history.shift();
 if(accepted){
  b.generatedWild.lastSeenMinute=s.world.minutes;
  b.generatedWild.encounterCount++;
  life.witnessed.push({day:Math.floor(s.world.minutes/DAY),
   minute:s.world.minutes,location:site,kind:'reencounter-after-tracking',
   sourceHash:b.generatedWild.seal});
  if(life.witnessed.length>24)life.witnessed.shift();
 }
 b.away=true;
 C.event(s,'beast',accepted?
  'The original unclassified animal is seen again at a distance, without any assumed willingness to approach.':
  'The search does not confirm where the remembered animal is; nothing is summoned.',{
  origin:SOURCE,beastId:b.id,found:accepted,
  sourceHash:b.generatedWild.seal,noCombatOrBond:true});
 return {searched:true,found:accepted,beastId:b.id,check,
  minutes:45,staminaSpent:3,distantSightingOnly:true,
  noCombatOrBondEncounter:true,noGuaranteedReturn:true};
}
function sighting(s,w,region,taxon,selector,witness){
 const result=maybeReturn(s,w,region,selector)||
   create(s,w,region,taxon,witness);
 return result;
}
module.exports={SOURCE,verify,create,maybeReturn,sighting,sixday,track};
