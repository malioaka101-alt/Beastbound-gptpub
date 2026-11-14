'use strict';
// The GM authors a place in prose. The engine only keeps established,
 // player-known scene facts and resolves honest elapsed ordinary journeys.
// This is not an NPC-spawner, a universal encounter table or a lore generator.
const Crypto=require('node:crypto');
const Atlas=require('./atlas');
const SOURCE='gm-authored-campaign-place-v1';
const JOURNEY='gm-judged-campaign-journey-v1';
const hash=v=>Crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const id=v=>typeof v==='string'&&/^[a-z][a-z0-9_-]{3,63}$/.test(v);
const phrase=(v,lo=3,hi=240)=>typeof v==='string'&&
 v.trim().length>=lo&&v.trim().length<=hi;
const keys=(p,required,optional=[])=>{
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).some(k=>![...required,...optional].includes(k))||
  required.some(k=>!Object.hasOwn(p,k)))
  throw Error('The living-place operation accepts only the specified real scene facts, without chosen NPC decisions, player rewards or invented presence');
};
function roster(value,label){
 if(value===undefined)return [];
 if(!Array.isArray(value)||value.length>12)
  throw Error('A place has at most twelve named '+label+' references in one observation');
 const names=new Set();
 return value.map((item)=>{
  if(!item||typeof item!=='object'||Array.isArray(item)||
   Object.keys(item).sort().join('|')!=='context|name'||
   !phrase(item.name,3,80)||!phrase(item.context,10,280)||
   names.has(item.name.toLowerCase()))
    throw Error('An independently introduced '+label+' reference needs a distinct name and factual context');
  names.add(item.name.toLowerCase());
  return {name:item.name.trim(),context:item.context.trim(),
   merelyKnown:true,notProvenPresent:true,noAutomaticConsent:true};
 });
}
function peek(s){return s.table?.realm?.livedPlaces||null;}
function ensure(s){
 const Realm=require('./simulation');
 const w=Realm.ensure(s);
 if(!w.livedPlaces)w.livedPlaces={version:1,source:SOURCE,places:{},journeys:[]};
 const l=w.livedPlaces;
 if(l.version!==1||l.source!==SOURCE||!l.places||
  typeof l.places!=='object'||Array.isArray(l.places)||
  !Array.isArray(l.journeys))throw Error('Invalid saved living-place registry');
 return l;
}
function verifyPlace(p){
 if(!p||p.source!==SOURCE||!id(p.id)||!phrase(p.name,3,100)||
  !Atlas.R[p.regionId]||!phrase(p.kind,3,70)||
  !phrase(p.description,16,900)||!phrase(p.culture,0,600)||
  !Number.isInteger(p.establishedMinute)||p.establishedMinute<0||
  !p.founding||p.foundingHash!==hash(p.founding)||
  p.founding.source!==SOURCE||p.founding.placeId!==p.id||
  p.founding.regionId!==p.regionId||p.founding.worldMinute!==p.establishedMinute||
  p.founding.name!==p.name||p.founding.kind!==p.kind||
  p.founding.sceneType!==p.sceneType||
  !['settlement','wilderness','structure','unknown'].includes(p.sceneType)||
  p.founding.description!==p.description||p.founding.culture!==p.culture||
  p.founding.notablesHash!==hash(p.notables)||
  p.founding.familiesHash!==hash(p.families)||
  p.founding.organisationsHash!==hash(p.organisations)||
  !Array.isArray(p.notables)||!Array.isArray(p.families)||
  !Array.isArray(p.organisations)||!Array.isArray(p.notes)||
  p.notes.length>120||p.notes.some(n=>n?.seal!==hash(n?.source)||
   n.source?.placeId!==p.id||!Number.isInteger(n.source?.minute)))
  return false;
 return true;
}
function get(s,placeId){
 if(typeof placeId!=='string')return null;
 const p=peek(s)?.places?.[placeId];
 if(!p)return null;
 if(!verifyPlace(p))throw Error('Saved authored place has lost its founding source');
 return p;
}
function location(s,placeId=s.world.location){
 const E=require('../engine.js');
 const fixed=E.LOCATIONS[placeId];
 if(fixed)return {id:placeId,...fixed,regionId:Atlas.LOCATION_REGION[placeId],
  canonical:true};
 const place=get(s,placeId);
 if(!place)return null;
 return {id:place.id,name:place.name,description:place.description,
  biome:place.sceneType==='settlement'?'settlement':Atlas.R[place.regionId].biome,
  facilities:[],spawns:[],exits:[],
  regionId:place.regionId,canonical:false,kind:place.kind,
  sceneType:place.sceneType,
  culture:place.culture};
}
function establish(s,p={}){
 keys(p,['placeId','name','regionId','description'],['kind','sceneType','culture','notables','families','organisations','originSeeded']);
 if(p.originSeeded!==undefined&&p.originSeeded!==true)
  throw Error('An origin locality must be explicitly marked as seeded');
 if(p.originSeeded===true&&(!s.campaign||
  s.campaign.oldCampaignImported!==false||
  s.campaign.openingState!=='awaiting-gm'||
  s.chatRuntime?.revision!==0||s.flags?.openingAuthored===true))
  throw Error('A seeded locality may only be recorded before the first played scene');
 const {placeId,regionId}=p;
 if(!id(placeId)||!Atlas.R[regionId]||!phrase(p.name,3,100)||
  !phrase(p.description,16,900)||
  !phrase(p.kind===undefined?'settlement':p.kind,3,70)||
  !['settlement','wilderness','structure','unknown'].includes(p.sceneType||'unknown')||
  !phrase(p.culture===undefined?'':p.culture,0,600))
   throw Error('A GM-authored place needs a real region and a plausible name and visible description');
 const E=require('../engine.js');
 if(Object.hasOwn(E.LOCATIONS,placeId)||get(s,placeId))
  throw Error('An established place or canonical settlement cannot be overwritten by another description');
 const notables=roster(p.notables,'person'),families=roster(p.families,'family'),
  organisations=roster(p.organisations,'organisation');
 const now=s.world.minutes,l=ensure(s);
 if(Object.values(l.places).some(x=>x.name.toLowerCase()===p.name.trim().toLowerCase()&&
  x.regionId===regionId))
  throw Error('That named place is already established in this region');
 const source={source:SOURCE,placeId,regionId,worldMinute:now,
  name:p.name.trim(),kind:(p.kind||'settlement').trim(),
  sceneType:p.sceneType||'unknown',
  description:p.description.trim(),culture:(p.culture||'').trim(),
  notablesHash:hash(notables),familiesHash:hash(families),
  organisationsHash:hash(organisations),
  gmContext:p.originSeeded===true?
   'An ordinary pre-existing locality generated at campaign creation, not a played scene':
   'An in-scene GM-authored place added without rewinding the world',
  ...(p.originSeeded===true?{originSeeded:true}:{}),
  noNPCConsent:true,noExtraPlayerResources:true};
 const place={source:SOURCE,id:placeId,name:p.name.trim(),regionId,
  kind:(p.kind||'settlement').trim(),sceneType:p.sceneType||'unknown',
  description:p.description.trim(),
  culture:(p.culture||'').trim(),establishedMinute:now,
  notables,families,organisations,notes:[],
  founding:source,foundingHash:hash(source)};
 if(!verifyPlace(place))throw Error('New place failed to preserve its authored provenance');
 l.places[placeId]=place;
 const Core=require('../rules/core');
 Core.event(s,'world',(p.originSeeded===true?
   'An existing local settlement enters this new character’s known background: ':
   'A place is established in the lived world: ')+place.name+'.',{
  source:SOURCE,placeId,regionId,establishedMinute:now,
  knownNotables:notables.length,knownFamilies:families.length,
  knownOrganisations:organisations.length,
  notAnNPCSpawn:true,noItemsOrPowersCreated:true});
 return {established:true,place:publicPlace(place),noFreeNPCOrItem:true};
}
function publicPlace(p){
 return {id:p.id,name:p.name,kind:p.kind,sceneType:p.sceneType,
  regionId:p.regionId,region:Atlas.R[p.regionId].name,
  description:p.description,culture:p.culture,
  knownNotables:p.notables.map(x=>({...x})),
  knownFamilies:p.families.map(x=>({...x})),
  knownOrganisations:p.organisations.map(x=>({...x})),
  recordedDetails:p.notes.map(n=>({...n.source,
   source:undefined,placeId:undefined,minute:undefined})),
  note:'Known descriptions and associations are not proof that a person is physically present, agrees to speak, has a resource or belongs to a group.'};
}
function note(s,p={}){
 keys(p,['placeId','category','name','context']);
 const place=get(s,p.placeId),allowed=['notable','family','organisation','culture','history','landmark','route','other'];
 if(!place||!allowed.includes(p.category)||!phrase(p.name,3,100)||
  !phrase(p.context,10,500))
  throw Error('New place details require a real recorded location and a concrete personally established fact');
 if(place.notes.length>=120)throw Error('This bounded local journal needs archival review before further additions');
 const body={source:SOURCE,placeId:p.placeId,minute:s.world.minutes,
  category:p.category,name:p.name.trim(),context:p.context.trim(),
  // The authored note can concern any place. Only genuinely being THERE
  // at the moment of recording establishes the limited in-person-site
  // provenance needed by a later civic inquiry. This proves no offence.
  witnessedAtSite:s.world.location===p.placeId,
  noAutomaticNPCPresence:true,noAutomaticResourceOrOffice:true};
 const seal=hash(body);
 if(place.notes.some(n=>n.seal===seal))return {alreadyKnown:true,noTimeElapsed:true};
 place.notes.push({source:body,seal});
 require('../rules/core').event(s,'world',
  'New established context is recorded for '+place.name+': '+body.name+'.',{
  source:SOURCE,placeId:place.id,category:body.category,
  factSeal:seal,noAutomaticNPCPresence:true});
 return {recorded:true,placeId:place.id,category:body.category,noNPCSpawn:true};
}
function status(s,p={}){
 keys(p,[],['placeId']);
 const l=peek(s);
 if(l&&(l.version!==1||l.source!==SOURCE||
  !l.places||!Array.isArray(l.journeys)))
  throw Error('Invalid saved place registry');
 const records=Object.values(l?.places||{});
 if(records.some(x=>!verifyPlace(x)))
  throw Error('Invalid authored place in saved world');
 if(p.placeId!==undefined){
  const item=get(s,p.placeId);
  if(!item)throw Error('The place has not yet been introduced in this campaign');
  return {place:publicPlace(item),current:s.world.location===item.id};
 }
 return {current:location(s),knownPlaces:records.map(x=>({
  id:x.id,name:x.name,region:Atlas.R[x.regionId].name,kind:x.kind})),
  note:'The GM expands the lived world only as it becomes established in play. A region is not a fixed menu of prepared settlements.'};
}
// An ordinary journey does not require a port, a preauthored graph edge or a
// named vehicle. The GM selects plausible elapsed time using the actual
// narrative route and resources. Unresolved danger must be adjudicated before
// claiming the destination is reached; this never silently resolves hazards.
function travel(s,p={}){
 keys(p,['destinationId','minutes','journey','uncontested'],['means','arrivalWeather']);
 if(typeof p.destinationId!=='string'||!location(s,p.destinationId)||
  p.destinationId===s.world.location||
  !Number.isInteger(p.minutes)||p.minutes<1||p.minutes>365*1440||
  !phrase(p.journey,25,850)||p.uncontested!==true||
  (p.means!==undefined&&!phrase(p.means,3,100))||
  (p.arrivalWeather!==undefined&&!phrase(p.arrivalWeather,3,140)))
   throw Error('Ordinary travel needs an established destination and GM-supported journey, elapsed time and already resolved hazards');
 if(s.battle||s.encounter)
  throw Error('The present conflict or nearby beast encounter must be resolved before departing');
 const c=s.table?.combatants?.player;
 if(c&&c.status&&c.status!=='ok')
  throw Error('An injured or incapacitated traveller needs real care and a supported travel arrangement');
 const from=location(s),to=location(s,p.destinationId);
 if(!from)throw Error('The current saved location has no established physical existence');
 const start=s.world.minutes,fromId=s.world.location,
  beforeRegion=from.regionId,afterRegion=to.regionId,
  witness={source:JOURNEY,from:fromId,to:p.destinationId,
   startMinute:start,elapsedMinutes:p.minutes,
   describedRoute:p.journey.trim(),means:p.means?.trim()||'GM-established travel',
   fromRegion:beforeRegion,toRegion:afterRegion,
   ...(p.arrivalWeather?{observedArrivalWeather:p.arrivalWeather.trim()}:{}),
   hazardsAlreadyResolved:true,
   notAnNPCArrival:true,noAutomaticTreasure:true,
   noUnverifiedFareOrProvisioning:true};
 // No loot, salary, animal agreement, free transport or skill reward.
 // Actual money/food/partner care/hazard consequences require their own
 // established transactions or checks; a route description awards none.
 const E=require('../engine.js');
 s.world.location=p.destinationId;
 if(p.arrivalWeather)s.world.weather=p.arrivalWeather.trim();
 s.flags.visited[p.destinationId]=true;
 E.advance(s,p.minutes);
 const ticks=require('../rules/world').finalizeTime(s,start);
 require('../rules/unified').sync(s,{source:'legacy'});
 const l=ensure(s),record={...witness,endMinute:s.world.minutes};
 l.journeys.push({...record,hash:hash(record)});
 if(l.journeys.length>90)l.journeys.shift();
 require('../rules/core').event(s,'travel',
  'The documented journey from '+from.name+' reaches '+to.name+'.',{
  ...record,arrivalKnown:true,noAutomaticPermission:true});
 return {arrived:true,from:from.name,to:to.name,
  location:p.destinationId,elapsedMinutes:p.minutes,
  clock:E.clock(s),worldTicks:ticks,
  noMoneyOrSuppliesGranted:true,
  noUnresolvedHazardsResolved:true,
  note:'Travel records a GM-judged completed journey. Multi-day food, sleep, exposure, fare, dependents and beast-partner care need established circumstances and relevant mechanisms; this operation does not certify or manufacture them.'};
}
module.exports={SOURCE,JOURNEY,peek,ensure,verifyPlace,get,location,establish,note,status,travel};
