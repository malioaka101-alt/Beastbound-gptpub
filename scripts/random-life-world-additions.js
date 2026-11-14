'use strict';
// A fresh RANDOM life may draw on established atlas ecology and also add
// ordinary local history to its own saved world. Nothing edits the global Atlas,
// creates a beast individual, transfers a power or settles another person's will.
const Crypto=require('node:crypto');
const Atlas=require('../world/atlas');
const Bestiary=require('../world/bestiary');
const Places=require('../world/lived-places');
const Origins=require('./campaign-origins');
const SOURCE='seeded-random-life-world-additions-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const pick=(seed,tag,values)=>values[Origins.number(seed,tag)%values.length];
const STEMS=Object.freeze({
 valedryn:['Ashen','Briar','Dun','Fallow','Reed','Willow'],
 sahriel:['Isari','Maru','Qasir','Sahen','Tahir','Zamir'],
 threnor:['Eik','Hrafn','Rime','Skel','Vann','Yrsa'],
 kareth:['Arden','Cindar','Korr','Sovar','Tarn','Vek'],
 islarin:['Iria','Kava','Nacre','Tala','Veyra','Waver'],
 oruvan:['Arun','Eren','Kora','Sava','Talan','Veyun']
});
const ENDS=Object.freeze({
 valedryn:['Ford','Grove','Reach','Hollow'],
 sahriel:['Rest','Spring','Well','Crossing'],
 threnor:['Haven','Watch','Hold','Fjord'],
 kareth:['Step','Forge','Shelter','Gate'],
 islarin:['Quay','Cove','Landing','Reach'],
 oruvan:['Moot','Rest','Fold','Crossing']
});
function verify(s){
 const record=s?.campaign?.origin?.worldAdditions;
 if(!record)return false;
 const {seal,...body}=record;
 if(record.source!==SOURCE||record.version!==1||
  record.seed!==s.campaign.startSeed||
  record.regionId!==s.campaign.origin.birthRegionId||
  seal!==hash(body)||!Atlas.R[record.regionId]||
  !record.locale||!['existing','created'].includes(record.locale.source)||
  !record.custom?.description||
  !record.noAutomaticBenefits)return false;
 if(JSON.stringify(s.player.startingContext?.worldAdditions)!==
  JSON.stringify(record))return false;
 if(record.locale.source==='created'){
  const place=Places.get(s,record.locale.id);
  if(!place||place.regionId!==record.regionId||
   place.name!==record.locale.name||
   place.founding.originSeeded!==true)return false;
 }
 if(record.localEcology){
  const b=Bestiary.lookup(record.localEcology.taxonId);
  if(b.name!==record.localEcology.name||
   !b.biome.includes(Atlas.R[record.regionId].biome))return false;
 }
 return true;
}
function install(s){
 if(!s?.campaign||s.campaign.oldCampaignImported!==false||
  s.campaign.openingState!=='awaiting-gm'||
  s.chatRuntime?.revision!==0||
  s.campaign.origin?.worldAdditions||
  !s.player?.startingContext||
  s.player.startingContext.birthRegionId!==s.campaign.origin?.birthRegionId)
  throw Error('Random-life additions require a fresh unmodified campaign origin');
 const seed=s.campaign.startSeed,region=Atlas.R[s.campaign.origin.birthRegionId];
 const polity=region&&Atlas.P[region.polity];
 if(!seed||!region||!polity||!STEMS[region.continent])
  throw Error('New starting context must belong to a real established human homeland');
 const newPlace=Origins.number(seed,'world-additions:new-place')%100<45;
 let locale;
 if(newPlace){
  const name=pick(seed,'world-additions:place-stem',STEMS[region.continent])+' '+
   pick(seed,'world-additions:place-ending',ENDS[region.continent]);
  const id='origin_'+hash({seed,slug:s.campaign.slug,region:region.id}).slice(0,24);
  const type=['rift','volcanic'].includes(region.biome)?'sheltered outpost':'hamlet';
  const description=name+' is a modest '+type+' within '+region.name+
   ', near '+region.traits[0]+'. Local livelihoods depend on '+
   (region.goods[0]||'ordinary trade')+'; '+(region.dangers[0]||'seasonal conditions')+
   ' can interrupt everyday work.';
  Places.establish(s,{placeId:id,name,regionId:region.id,description,
   kind:type,sceneType:'settlement',originSeeded:true,
   culture:'This locality sits within '+polity.name+
    ' and follows its surrounding civic traditions; it has no newly granted independent sovereignty.'});
  locale={source:'created',id,name,regionId:region.id,
   noGuaranteedPhysicalOpening:true};
 }else{
  const canonicalId=(region.loc||[]).find(loc=>
   Atlas.LOCATION_REGION[loc]===region.id)||null;
  locale={source:'existing',id:canonicalId,
   name:region.site||region.name,regionId:region.id,
   noGuaranteedPhysicalOpening:true};
 }
 const description='Some households around '+region.name+' keep a '+
  pick(seed,'world-additions:custom',[
   'shared seasonal work tally','neighbourhood repair ledger',
   'migration-safe route record','community water-and-weather record'])+
  ' when coordinating '+(region.goods[0]||'daily work')+
  '. This local habit creates no office, law, membership or duty for a named person.';
 const custom={name:'Local working custom',description,
  householdTraditionNotUniversalLaw:true};
 const candidate=Bestiary.localCandidates(region.biome).length?
  Bestiary.sample(region.biome,seed+'|'+region.id+'|origin-field-guide'):null;
 const localEcology=candidate?{taxonId:candidate.id,name:candidate.name,
  family:candidate.taxonomy.family,habitat:region.biome,
  recordType:'known regional field-guide possibility',
  noEncounter:true,noContract:true,noVerifiedIndividual:true,
  noPowerGranted:true}:null;
 const body={version:1,source:SOURCE,seed,regionId:region.id,
  polityId:region.polity,locale,custom,localEcology,
  integratedWith:'original atlas, place registry, and demand-generated taxonomy',
  noAutomaticBenefits:true,noNewNpcConsent:true,noLineagePowerGranted:true,
  noEditedGlobalAtlas:true};
 const record={...body,seal:hash(body)};
 s.campaign.origin.worldAdditions=structuredClone(record);
 s.player.startingContext.worldAdditions=structuredClone(record);
 s.player.history.localCustom=custom.description;
 if(!verify(s))throw Error('Seeded origin additions lost their saved-world evidence');
 return record;
}
module.exports={SOURCE,install,verify};