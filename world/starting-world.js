'use strict';
// The Starting World is the shared ordinary PUBLIC layer of the original
// Beastbound atlas, not a campaign, a second simulation or omniscience.
// Named rulers, money, threats, beasts and powers remain owned by their
// actual independent source records. Reading this never changes a save.
const Atlas=require('./atlas');
const Houses=require('./social-houses');
const Bestiary=require('./bestiary');
const Engine=require('../engine.js');
const Realm=require('./simulation');
const Gov=require('./government-offices');
const LivedPlaces=require('./lived-places');

const SOURCE='established-common-world-knowledge-v1';
const TOPICS=Object.freeze(['overview','continents','polities','families',
 'institutions','systems','beasts','life','history','local']);
const RECOGNISED_POLITIES=Object.freeze([
 'reedmarch','asterwyn','saltleague','red_sultanate',
 'sahri_wells','stair_guilds','whitewake','winter_court',
 'cinder_free','sunforge','tide_assembly','reef_cantons',
 'grassroad','old_tracks','iron_citadel','skyvillage'
]);
const RECOGNISED_FAMILIES=Object.freeze([
 'reedward','fenwake','goldbough','briarhall','stonepath',
 'sailglass','firstcup','pathlight','icewake','emberhand',
 'goldflame','shellsong','longtrail','manytracks'
]);
const RECOGNISED_INSTITUTIONS=Object.freeze([
 'naturalists_guild','lumenfall_annex','marsh_council',
 'orchard_college','gate_monastery','salt_exchange',
 'well_collegium','route_keepers','ice_rescue','forge_university',
 'rift_wardens','tide_assembly_house','reef_consistory',
 'herd_council','beast_parliament'
]);
const FAMILIAR_BEAST_LINEAGES=Object.freeze([
 'reedfox','miregrazer','flinthare','glasswing','echoquill',
 'cinderskin','brineclaw','sunspine','frostantler',
 'skystrider','reefpoly','sporecap','vineheart','moonmoth'
]);

// Knowledge is an open cultural overview, NOT earned expertise in an
// anatomical, casting, bond or evolutionary progression.
const SYSTEMS=Object.freeze([
 {id:'meridian',name:'Meridian Cultivation',
  knownFor:'Breathing, internal circulation, carefully opening the 108 Meridian Gates and developing the three Dantian centres.',
  measures:'anatomy, safe gates, circulation and distinct Meridian stages',
  misconception:'A large gate count alone guarantees neither a technique nor victory.'},
 {id:'arcane',name:'Arcane Circle Architecture',
  knownFor:'Mana cores, constructed circles, formulae, wards and prepared spells.',
  measures:'actual Circle geometry, stability, learned formulae and mana costs',
  misconception:'Owning mana or drawing a symbol does not establish a working spell.'},
 {id:'soul',name:'Soul Cultivation and Soul Engineering',
  knownFor:'Perception, spiritual protection, restorative work and consensual soul resonance.',
  measures:'separate soul phases, witnessed procedures and identity safeguards',
  misconception:'Spiritual study is not mind-reading or a right to bind a sentient being.'},
 {id:'body',name:'Body Refinement',
  knownFor:'Muscle, bone, organ, nerve and blood conditioning over individually completed refinement cycles.',
  measures:'whole-body tissues and safe refinement cycles',
  misconception:'No beast bond or mana circle is required to train the body.'},
 {id:'beast-origin',name:'Beast-Origin and Lineage Arts',
  knownFor:'Researching inherited, donated or deliberately integrated compatible beast traits.',
  measures:'source-proven traits, compatibility, rejection and a distinct integration sequence',
  misconception:'A family name, mythical bloodline claim or sample grants no active trait.'},
 {id:'rift',name:'Rift Practice',
  knownFor:'Studying boundary weaknesses, anchors, protected crossings and unusual spatial conditions.',
  measures:'authentic anchors, spatial stability, sourced progression and danger',
  misconception:'Knowing rifts exist does not confer teleportation or realm travel.'},
 {id:'specialist',name:'Runes, Formations, Alchemy, Healing and Weapon Arts',
  knownFor:'Different expert crafts with their own material, technique, professional and bodily requirements.',
  measures:'source-specific production, safety, equipment, study and independent practice',
  misconception:'These are not cosmetic sub-classes of a single power rank.'},
 {id:'partnership',name:'Beast Partnership and Synchronisation',
  knownFor:'Bonding, co-operation and jointly developed capabilities between independently consenting partners.',
  measures:'each party’s actual agreement, compatibility and earned pair synchronisation',
  misconception:'Taming, possessing an egg, or feeding a beast never proves its loyalty or consent.'}
]);

const CUSTOMS=Object.freeze([
 {name:'Everyday livelihoods',known:'Households trade, farm, forage, carry goods, keep boats, teach, practise medicine, repair tools and maintain shelters. Powerful practitioners are not the whole population.'},
 {name:'Rights and partnerships',known:'People, animals and sapient beasts are not interchangeable. Contracts, membership, capture restrictions and civic standing depend on the actual local law and individual consent.'},
 {name:'Learning and careers',known:'Observation, self-study, apprenticeship, paid work, free advice and scholarship all occur. A teacher, guild, institution or fee is not a universal prerequisite for ordinary advancement.'},
 {name:'Money and work',known:'Talons and Scales pay for genuine goods and service where actually accepted. A family’s reputation, an association budget and a state treasury are separate and cannot conjure personal money.'},
 {name:'Injury and medicine',known:'Light and Serious injuries may recover with proper care, but Critical harm is dangerous. Physicians, beast medics and specialist healers have different proven skills, duties and limits.'},
 {name:'Competition and pride',known:'Communities compare craft, ecological knowledge, martial discipline, rescue, scholarship and teamwork. Local rivalries and festivals coexist with ordinary co-operation; nobody must compete.'},
 {name:'Faith, history and uncertainty',known:'Sacred places, old realms, migration covenants and legendary ancestors appear in folklore. Belief and a public story are not proof of a miracle, inherited power or private history.'}
]);

const checked=(arr,valid,kind)=>{
 for(const id of arr)if(!valid(id))throw Error('Starting World '+kind+' missing from original source: '+id);
};
checked(RECOGNISED_POLITIES,x=>!!Atlas.P[x],'polity');
checked(RECOGNISED_FAMILIES,x=>!!Houses.byId[x],'family');
checked(RECOGNISED_INSTITUTIONS,x=>!!Atlas.I[x],'institution');
checked(FAMILIAR_BEAST_LINEAGES,x=>Bestiary.GROUPS.some(y=>y.id===x),'beast lineage');

const popularPolities=()=>RECOGNISED_POLITIES.map(id=>{
 const p=Atlas.P[id];
 return {id,name:p.name,formOfGovernment:p.government,
  continent:Atlas.continents.find(c=>c.id===p.continent).name,
  capital:p.capital,knownFor:p.rights,
  commonAssociations:p.resources.slice(0,3),
  notCurrentPoliticalIntelligence:true};
});
const polityNames=()=>Atlas.polities.map(p=>({
 id:p.id,name:p.name,continent:Atlas.continents.find(c=>c.id===p.continent).name,
 capital:p.capital,formOfGovernment:p.government,
 publicCulture:Atlas.C[p.culture].name,publicLawTheme:p.rights,
 typicalTrade:p.resources.slice(0,3),
 note:'A named country and its public institutions do not reveal present private diplomacy or actual travel access.'
}));
const familyView=(h,regional=false)=>({
 id:h.id,name:h.name,polity:Atlas.P[h.polity].name,kind:h.kind,
 publicWork:h.role,knownCivicDuty:h.duty,
 ...(regional?{publicElder:h.elder,publicDispute:h.dispute}:{}),
 note:'Public reputation only; no proof of kinship, inherited power, private loyalty or lawful office.'
});
const institutionView=i=>({
 id:i.id,name:i.name,polity:Atlas.P[i.polity].name,
 kind:i.type,knownSpecialty:i.specialty,
 generalFundingTradition:i.funding,
 note:'Knowing an institution does not establish membership, tuition terms, staff availability or training access.'
});
const beastLineageView=id=>{
 const x=Bestiary.GROUPS.find(b=>b.id===id);
 return {id,name:x.name,broadForm:x.form,
  familiarDiet:x.diet,ecologicalWork:x.role,
  generallyAssociatedHabitats:[...x.habitats],
  note:'A known beast family is not an identified species, an active encounter, proven ability or tame individual.'};
};
const publicTrade=()=>Atlas.tradeRoutes.map(t=>({
 between:[Atlas.P[t.a].name,Atlas.P[t.b].name],
 traditionalRoute:t.mode,usualTradeThemes:[t.exportA,t.exportB],
 noCurrentSafetyOrStockGuaranteed:true
}));
const history=()=>Atlas.history.map(x=>({
 era:x.era,publicText:x.event,period:x.period,
 interpretation:'A commonly taught chronology; witness-level details and differing cultural accounts require their original historical source.'
}));
const continents=()=>Atlas.continents.map(c=>({
 id:c.id,name:c.name,land:c.land,climate:c.climate,
 publicHistoricSummary:c.history,knownEcology:c.ecology
}));
const familiarSpecies=()=>Object.entries(Engine.SPECIES).filter(([,b])=>
 b.grade==='Common').map(([id,b])=>({
 id,name:b.name,folkGrade:b.grade,usualHabitats:[...b.habitat],
 generalEcologicalRole:b.role,diet:b.diet,
 noIndividualSightingOrAbilityIdentified:true
}));
function local(s){
 // During an un-authored new-campaign opening, the engine's temporary
 // technical location is NOT an in-world place personally known to the PC.
 if(s.campaign?.requiresGmOpening&&s.campaign.openingState!=='authored')
  return {placed:false,reason:'The GM has not yet authored a real opening place; no region or resident is inferred.'};
 const location=s.world?.location;
 const regionId=Atlas.LOCATION_REGION[location]||
  LivedPlaces.get(s,location)?.regionId;
 const region=Atlas.R[regionId];
 if(!region)return {placed:false,reason:'No verified public region yet; the GM must establish the actual location.'};
 const p=Atlas.P[region.polity];
 const w=Realm.peek(s),office=Gov.report(w,p.id);
 const institutionIds=Atlas.institutions.filter(x=>x.polity===p.id).map(x=>x.id);
 const houses=Houses.houses.filter(x=>x.polity===p.id);
 const lineages=Bestiary.GROUPS.filter(x=>x.habitats.includes(region.biome)).slice(0,9);
 return {placed:true,locationId:location,regionId:region.id,
  region:region.name,polity:p.name,continent:Atlas.continents.find(x=>x.id===region.continent).name,
  regionTraits:[...region.traits],traditionalGoods:[...region.goods],
  ordinaryRecognisedHazards:[...region.dangers],
  culture:{name:Atlas.C[p.culture].name,publicCustom:Atlas.C[p.culture].customs,
   language:Atlas.C[p.culture].language,festival:Atlas.C[p.culture].festival},
  localPublicGovernment:{office:office.office,officeholder:office.officeholder,
   governingBody:office.governingBody,
   notAnAppointmentOrGuaranteeOfAccess:true},
  locallyKnownFamilies:houses.map(h=>familyView(h,true)),
  locallyKnownInstitutions:institutionIds.map(id=>institutionView(Atlas.I[id])),
  familiarRegionalBeastFamilies:lineages.map(x=>beastLineageView(x.id)),
  note:'These are public regional facts and typical life, not a sighting, guaranteed NPC presence, local stock, issued licence, accessible institution or witnessed private activity.'};
}
function status(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).some(x=>x!=='topic'))
  throw Error('Starting World knowledge accepts only a public topic, never a player-selected secret, encounter or outcome');
 const topic=p.topic===undefined?'overview':p.topic;
 if(!TOPICS.includes(topic))throw Error('Unknown Starting World topic; use a public known category');
 const head={
  source:SOURCE,topic,
  foundation:'Original Master Prompt and existing Beastbound atlas, household, government, economy, bestiary and power-system owners',
  knowledgeLevel:'public cultural familiarity, not direct witness or specialist certification',
  currentWorldUnchanged:true,
  neverGrants:'species identification, powers, contracts, NPC consent, travel, property, jobs, titles, secrets, prizes or rolls'
 };
 const result=topic==='overview'?{
  premise:'Six continents share a world shaped by supernatural beastkind, evolving humans, ordinary trades, independent beast peoples, multiple laws and distinct power traditions.',
  continents:continents().map(({id,name,climate})=>({id,name,climate})),
  wellKnownStates:popularPolities(),
  familiarHouseNames:RECOGNISED_FAMILIES.map(id=>({
   name:Houses.byId[id].name,polity:Atlas.P[Houses.byId[id].polity].name})),
  commonBeastNames:familiarSpecies().map(x=>x.name),
  recognisedPaths:SYSTEMS.map(x=>x.name),
  familiarTopics:[...TOPICS],
  caution:'Fame and elementary knowledge vary by culture and upbringing. A world primer cannot impart every remote law, secret evolution, hidden creature, current ruler’s intentions or witnessed local event.'
 }:topic==='continents'?{continents:continents()}:
 topic==='polities'?{polities:polityNames(),mostDiscussed:popularPolities(),trade:publicTrade()}:
 topic==='families'?{wellKnownHouses:RECOGNISED_FAMILIES.map(id=>familyView(Houses.byId[id])),
  note:'Other households and freely founded associations exist. One famous charter is not a binding power, job, marriage, bloodline or automatic player connection.'}:
 topic==='institutions'?{familiarInstitutions:RECOGNISED_INSTITUTIONS.map(id=>institutionView(Atlas.I[id])),
  note:'Many other institutions exist; named examples are not an exhaustive career or school catalogue.'}:
 topic==='systems'?{disciplines:SYSTEMS.map(x=>({...x})),
  independentHumanEvolution:'Changes to the human body, soul and Origin Pattern are distinct from discipline level, technical mastery and inherited traits.',
  beastGrades:'Beast grades and potential are distinct from human cultivation, actual individual development and pair synchronisation.',
  noUnifiedRankLadder:true}:
 topic==='beasts'?{familiarLineages:FAMILIAR_BEAST_LINEAGES.map(beastLineageView),
  familiarLocalExamples:familiarSpecies(),
  note:'Knowing species archetypes does not reveal hidden evolution branches, abilities, population numbers, individual animals, locations or possible contracts.'}:
 topic==='life'?{ordinaryCustoms:CUSTOMS.map(x=>({...x})),
  publicFestivals:Atlas.festivals.map(x=>({name:x.name,
   culture:Atlas.C[x.culture]?.name||x.culture,
   typicalSeason:x.season,publicPurpose:x.purpose})),
  note:'Seasons and traditional festivals are common culture, not an automatically scheduled current scene or compulsory event.'}:
 topic==='history'?{commonHistory:history(),
  note:'The broad eras are familiar; causes, viewpoints and disputed memories vary. No hidden causal-history entry is exposed.'}:
 {local:local(s)};
 return {...head,...result};
}
module.exports={SOURCE,TOPICS,status};
