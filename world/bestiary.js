'use strict';
// Demand-generated taxonomy. The count is addressable capacity, not a claim that
// hundreds of thousands of individually researched entries have been authored.
const E=require('../engine.js');
const lineages=[
 ['reedfox','Reedfox','Vulpiridae','mammal','omnivore','twilight forager','mist gland','live litters','wetland','forest','taiga','steppe','long-eared','reed-coated','moss-tailed','hollow-footed','silver-snouted','river-eyed','bank runner','den scout','pollen tracker','shoal listener','insect hunter','night stalker','root forager','tide watcher'],
 ['miregrazer','Miregrazer','Paleocervidae','mammal','herbivore','wetland gardener','root-sense organ','live calves','wetland','steppe','oasis','taiga','broad-hoofed','reed-horned','moss-bearded','river-backed','pale-antlered','deep-chested','reed browser','pool grazer','seed disperser','mud mixer','bank guardian','reed cutter','salt finder','night grazer'],
 ['flinthare','Flinthare','Silicologidae','mammal','herbivore','scree seed carrier','springstone tendon','live litters','alpine','forest','steppe','highland','flint-eared','stone-pawed','iron-striped','quartz-whiskered','cliff-backed','spring-tailed','ledge nibbler','grass leaprunner','root gatherer','crevice dweller','scree watcher','seed caster','stone caller','ridge runner'],
 ['glasswing','Glasswing','Luminopteridae','arthropod','nectar','canopy pollinator','prism wing vein','egg clutch','forest','rainforest','island','wetland','rain-veined','prism-spotted','thin-winged','lumen-backed','glass-eyed','lace-crested','orchid visitor','canopy pollinator','moon nectar feeder','flower scout','reed dancer','hollow nester','mist flyer','sun bloom keeper'],
 ['echoquill','Echoquill','Corvidae','bird','omnivore','sound mimic scavenger','resonant throat','egg clutch','forest','taiga','coast','highland','bright-beaked','echo-throated','sable-crested','dusk-spotted','hollow-winged','silver-tongued','seed thief','echo herald','forest sentinel','coastal scavenger','marsh listener','carrion recycler','roost guard','storm caller'],
 ['cinderskin','Cinderskin','Ignisalamandridae','amphibian','insectivore','thermal recycler','heat gland','gel eggs','volcanic','highland','rift','wetland','coal-dotted','warm-bellied','ash-tinged','ember-eyed','glass-skinned','smoke-striped','lava insect eater','spring burrower','ash scavenger','heat recycler','geyser swimmer','warmstone nester','ember grazer','steam watcher'],
 ['brineclaw','Brineclaw','Tidalcaridae','crustacean','scavenger','tidebed cleaner','salt bladder','egg sac','reef','coast','wetland','fjord','shell-keeled','tide-striped','claw-fanned','blue-armoured','silt-specked','pearl-ridged','reef sifter','tide cleaner','salt scavenger','eel guard','kelp cutter','shell digger','sand mender','pool drifter'],
 ['kelpeel','Kelp-Eel','Pelaganguidae','fish','carnivore','shoal regulator','current organ','eggs','reef','coast','fjord','wetland','ribbon-backed','lantern-bellied','kelp-fringed','ice-spotted','long-jawed','deep-striped','shoal stalker','kelp gardener','tidal runner','eel hunter','current listener','reef scout','fry guardian','estuary feeder'],
 ['sunspine','Sunspine','Sauridridae','reptile','insectivore','thermal edge predator','solar chromatophore','shelled eggs','desert','volcanic','steppe','highland','sun-scaled','thorn-tailed','gold-frilled','ash-keeled','broad-footed','flame-crested','stone basker','night insect hunter','heat shadow','dune burrower','ridge sentinel','salt licker','sun tracker','egg guardian'],
 ['frostantler','Frost-Antler','Cervirime','mammal','herbivore','winter browser','ice vascular net','live calves','tundra','taiga','alpine','fjord','ice-antlered','snow-nosed','pale-mantled','frost-hoofed','rime-eyed','cold-bellied','lichen browser','snow trail maker','moss grazer','ice traveller','river crosser','herd scout','root digger','winter guardian'],
 ['sandburrow','Sandburrow','Desertomuridae','mammal','omnivore','desert soil aerator','water condenser','live litters','desert','oasis','steppe','highland','dust-coated','long-whiskered','copper-eared','deep-clawed','salt-spotted','pale-tailed','root digger','scarab eater','seed keeper','well finder','dusk burrower','salt runner','night scout','dune gardener'],
 ['skystrider','Skystrider','Aetheraviidae','bird','carnivore','updraft predator','air bladder lattice','eggs','alpine','highland','island','coast','wide-winged','cloud-crested','hook-taloned','sky-silvered','wind-tailed','broad-chested','cliff hunter','updraft glider','gale watcher','salt fisher','ledge guardian','sky scout','storm tracker','aerie keeper'],
 ['mangrove','Mangrove Walker','Stiltidae','bird','omnivore','root-bed wader','pressure-sensing shank','eggs','wetland','rainforest','island','coast','long-stilted','root-footed','dew-crested','thin-beaked','bronze-washed','tide-winged','mud forager','root watcher','reed picker','crab hunter','tidal messenger','nest protector','fish tracker','seed carrier'],
 ['reefpoly','Reef Polyp','Lithocorallidae','colonial animal','filter feeder','reef builder','bio-luminal calyx','spawning blooms','reef','coast','island','fjord','branch-crowned','pearl-tipped','fan-spread','glass-tubed','blue-ridged','lumen-threaded','reef builder','current filter','fry refuge','tide indicator','silt trap','symbiote host','sand anchor','cavity shelter'],
 ['siltmussel','Silt Mussel','Cavernomollidae','mollusc','filter feeder','water purifier','mineral-sieve organ','broadcast spawning','wetland','reef','fjord','coast','shell-striped','stone-ribbed','salt-veined','blue-lipped','pearl-spotted','glass-backed','mud purifier','larval host','silt trap','reef cleaner','shoal stabiliser','river filter','bank holder','tide sensor'],
 ['abyssquid','Abyssquid','Deepcephalidae','mollusc','carnivore','deep-water predator','photophore network','egg strings','reef','coast','fjord','island','lantern-armed','ink-ribboned','glass-eyed','pale-frilled','reef-crowned','tide-spotted','shoal hunter','deep listener','current dancer','kelp ambusher','reef scout','egg guardian','biolume fisher','sea cave keeper'],
 ['sporecap','Sporecap','Myceliaceae','fungal beast','decomposer','forest recycler','spore-electric lace','spores','forest','taiga','rainforest','wetland','broad-capped','luminous-finned','root-laced','amber-stemmed','cloud-spored','moss-veined','log recycler','rot cleaner','root bridge','scent messenger','insect symbiote','tree gardener','spore spreader','water conserver'],
 ['vineheart','Vineheart','Arborimorpha','plant beast','photosynthetic','canopy support','vael phloem','seeds','forest','rainforest','wetland','oasis','ivy-crowned','deep-rooted','bark-fringed','moss-clad','amber-leafed','tendril-armed','canopy bridge','shade maker','seed guardian','pollinator host','water keeper','root engineer','orchard ally','river stabiliser'],
 ['siltgel','Siltgel','Amorphidae','amorphous beast','detritivore','wetland detritus recycler','colloid core','budding','wetland','oasis','coast','rift','clear-bodied','mud-veined','silver-dotted','reed-flecked','pale-core','salt-tinted','water sifter','oil eater','reed cleaner','pool purifier','algae browser','brackish drifter','mineral collector','rift seep filter'],
 ['emberkin','Emberkin','Thermorganidae','elemental life','thermovore','geothermal heat balancer','thermal heart','crystal splitting','volcanic','rift','desert','highland','spark-veiled','basalt-cored','ember-fringed','ash-rimmed','copper-flared','smoke-circled','heat vent keeper','slag cleaner','forge symbiote','lava guide','thermal recycler','emberscale grazer','fumarole sentinel','warmstone maker'],
 ['siltspirit','Silt Spirit','Hydrospiridae','spirit beast','flow-fed','watercourse keeper','resonance knot','manifested renewal','wetland','coast','fjord','oasis','mist-braided','river-rimmed','silver-streamed','dew-crowned','salt-veiled','deep-reflective','spring watcher','river guide','estuary caller','flood singer','water keeper','fog listener','ice thawer','well sentinel'],
 ['moonmoth','Moonmoth','Noctiluminidae','arthropod','nectar','nocturnal pollinator','soul-reflective scales','eggs','forest','taiga','rainforest','wetland','moon-veined','silver-dusted','shadow-banded','pale-antennaed','moss-winged','star-spotted','night pollinator','mist tracker','moonflower feeder','spore dancer','pollen keeper','reed visitor','roost scout','moonlight forager'],
 ['riftmantis','Rift Mantis','Foldarthridae','arthropod','carnivore','boundary insect predator','fold-sensitive antenna','egg clusters','rift','volcanic','highland','desert','rift-striped','glass-clawed','angle-eyed','veil-winged','seam-legged','hollow-backed','seam hunter','rift nest guardian','ash crawler','boundary scout','echo finder','stone ambusher','void gnawer','fold watcher'],
 ['dawnscale','Dawnscale','Dracovolans','draconic','carnivore','high-sky territorial predator','thermal flight sac','shelled eggs','alpine','volcanic','island','highland','sun-scaled','basalt-backed','long-horned','storm-crested','gold-veined','sail-tailed','cliff hunter','updraft seeker','storm scout','aerie guardian','peak sentinel','cloud fisher','ash traveller','ledge stalker'],
 ['gravebeetle','Gravebeetle','Thanatocoleidae','arthropod','scavenger','funeral ground recycler','miasma-sequestering shell','egg clutch','taiga','tundra','highland','rift','ash-shelled','pale-winged','bone-striped','slate-backed','dim-eyed','lichen-armoured','carcass recycler','grave-soil cleaner','frost detritus eater','rift miasma binder','moss guardian','bone picker','understone nester','night scavenger'],
 ['clockwork','Living Clockwork','Machinavita','constructed life','mineral-consuming','ruin maintenance symbiote','enchanted hinge organ','self-assembly','rift','volcanic','settlement','highland','copper-jointed','glass-pupilled','plate-chested','bronze-framed','stone-spined','hinge-footed','wall keeper','mine cleaner','beacon warden','gear mender','tunnel surveyor','forge helper','archive bearer','gate measurer']
];
const GROUPS=lineages.map(([id,name,family,form,diet,role,mechanism,reproduction,h0,h1,h2,h3,...descriptors])=>({id,name,family,form,diet,role,mechanism,reproduction,habitats:[h0,h1,h2,h3],morphs:descriptors.slice(0,6),strategies:descriptors.slice(6,14)}));
const COUNTS=Object.freeze({lineages:GROUPS.length,radiations:4,genera:36,speciesPerGenus:64,regionalForms:3});
const SPECIES_COUNT=COUNTS.lineages*COUNTS.radiations*COUNTS.genera*COUNTS.speciesPerGenus;
const FORM_COUNT=SPECIES_COUNT*COUNTS.regionalForms;
const gid=([group,radiation,genus,species,form=0])=>`tx:${group}:${radiation}:${genus}:${species}:${form}`;
const parse=id=>{
 if(typeof id!=='string')throw Error('Taxon ID required');
 const m=/^tx:([a-z0-9_-]+):([0-3]):(\d{1,2}):(\d{1,2}):([0-2])$/.exec(id);
 if(!m)throw Error('Invalid taxon ID');
 const g=GROUPS.find(x=>x.id===m[1]),r=+m[2],genus=+m[3],species=+m[4],form=+m[5];
 if(!g||genus>=36||species>=64)throw Error('Taxon outside the catalogue');
 return {g,r,genus,species,form};
};
function hash(input){let h=2166136261;for(let i=0;i<input.length;i++){h=Math.imul(h^input.charCodeAt(i),16777619);}return h>>>0;}
const sizeNames=['Tiny','Small','Medium','Large','Huge'];
const seasonal=['spring-breeding','summer-breeding','autumn-breeding','year-round','wet-season-breeding','long-cycle','dry-season-breeding','cold-season-breeding'];
function lookup(id,{knownBranches=false}={}){
 if(typeof id==='string'&&id.startsWith('authored:')){
  const key=id.slice(9),d=E.SPECIES[key];if(!d)throw Error('Unknown authored species');
  return {id,name:d.name,taxonomy:{family:d.family||'unrecorded',lineage:d.lineage},biome:d.habitat,role:d.role,diet:d.diet,rarity:d.grade,
    mechanism:d.ability?.effect||d.affinity,description:d.biome,conservation:'locally governed',canonical:true,
    knownEvolutionBranches:knownBranches?(d.evolutions||[]).filter(b=>!b.hidden).map(b=>b.to):[]};
 }
 const {g,r,genus,species,form}=parse(id),seed=hash(id);
 const colour=['grey','amber','silver','reed','dusky','pale'][genus%6];
 const morph=g.morphs[Math.floor(genus/6)],strategy=g.strategies[species%8],migration=seasonal[Math.floor(species/8)];
 const names=[`${colour} ${morph} ${g.name}`,`${colour} ${strategy} ${g.name}`,`${morph} ${g.name}`];
 const rarityRoll=hash(`${g.id}:${r}:${genus}:${species}`)%10000;
 const rarity=rarityRoll<5100?'common':rarityRoll<8000?'uncommon':rarityRoll<9300?'rare':rarityRoll<9850?'exotic':rarityRoll<9950?'ancient':rarityRoll<9985?'mythical':rarityRoll<9997?'legendary':'unique';
 const signature=`${g.mechanism}; an adaptation for ${strategy} in ${g.habitats[r]}`;
 const sapience=['reefpoly','siltspirit','clockwork','dawnscale'].includes(g.id)?1+(seed%4):seed%3;
 const grade=1+(hash(`grade:${g.id}:${species}`)%4);
 return {id,name:names[form],canonical:false,form,genus:`${g.name.split(' ')[0]}-genus ${genus+1}`,
   taxonomy:{kingdom:'Beastkind',family:g.family,form:g.form,lineage:g.id,genus:genus+1,species:species+1,regionalForm:form+1},
   biome:[g.habitats[r]],role:`${g.role}; ${strategy}`,diet:g.diet,reproduction:g.reproduction,lifecycle:migration,
   affinity:g.mechanism,mechanism:signature,size:sizeNames[Math.floor((hash('size:'+id)%100)/20)],
   rarity,grade,sapience,conservation:rarityRoll>9849?'potentially protected; check local law':'jurisdiction-dependent',
   ecology:{habitat:g.habitats[r],foraging:g.diet,dependentOn:`${g.role}`,migrationSeason:migration},
   // Existence of a branch is not proof of its known prerequisites.
   knownEvolutionBranches:knownBranches?[gid([g.id,r,genus,(species+1)%64,form])]:[],
   legalNote:sapience>=3?'personhood and informed-consent considerations apply':'rights depend on jurisdiction and cognition'};
}
function localCandidates(biome){return GROUPS.flatMap(g=>g.habitats.flatMap((h,r)=>h===biome?[{group:g.id,radiation:r}]:[]));}
function sample(biome,seed){const candidates=localCandidates(biome);if(!candidates.length)throw Error('No documented ecotypes for this biome');
 // Rejection-sampling makes an everyday survey unlikely to return a legendary beast.
 for(let j=0;j<32;j++){
   const n=hash(`${seed}:${j}`),c=candidates[n%candidates.length];
   const genus=hash(`${seed}:gen:${j}`)%36,species=hash(`${seed}:sp:${j}`)%64;
   const id=gid([c.group,c.radiation,genus,species,hash(`${seed}:form:${j}`)%3]);
   const v=lookup(id);
   if(['common','uncommon'].includes(v.rarity)||(j>22&&v.rarity==='rare'))return v;
 }
 return lookup(gid([candidates[0].group,candidates[0].radiation,0,0,0]));
}
function verify(){if(GROUPS.some(g=>g.habitats.length!==4||g.morphs.length!==6||g.strategies.length!==8))throw Error('Taxonomic schema incomplete');return {groups:GROUPS.length,speciesSlots:SPECIES_COUNT,regionalFormSlots:FORM_COUNT};}

// GM-authored species biology extends THIS bestiary instead of creating a
// separate species catalogue. Source: Unified Master Prompt §§6-9 and 18.
// Details survive in realm.speciesBiology; raw species slots remain stable.
const BioCrypto=require('node:crypto'),BioAtlas=require('./atlas');
const BIO_SOURCE='gm-established-species-biology-v1';
const bioHash=x=>BioCrypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const bioId=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{3,79}$/.test(x);
const bioText=(x,lo=4,hi=600)=>typeof x==='string'&&x.trim().length>=lo&&x.trim().length<=hi;
const BIO_VIS=['public','gm-only'];
const bioFields=(p,required,optional=[])=>{
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).some(k=>![...required,...optional].includes(k))||
  required.some(k=>!Object.hasOwn(p,k)))
  throw Error('Species biology requires concrete established biological facts, not free evolutionary powers or creature spawning');
};
const bioTaxonomyKeys=['kingdom','phylum','class','order','family','genus','species'];
const bioInt=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b;
function bioReproduction(r){
 return !!r&&bioText(r.mode,3,120)&&
  (r.gestationDays===null||bioInt(r.gestationDays,1,25000))&&
  (r.juvenileDays===null||bioInt(r.juvenileDays,1,300000))&&
  (r.adultDays===null||bioInt(r.adultDays,2,300000))&&
  (r.lifespanDays===null||bioInt(r.lifespanDays,3,500000))&&
  (r.juvenileDays===null||r.adultDays===null||r.juvenileDays<r.adultDays)&&
  (r.adultDays===null||r.lifespanDays===null||r.adultDays<r.lifespanDays);
}
function bioNeeds(n){
 return n===null||!!n&&['minForage','minWater','minQuality','maxPressure']
  .every(k=>bioInt(n[k],0,100));
}
function bioOrgans(a){
 return Array.isArray(a)&&a.length<=12&&a.every(o=>o&&
  typeof o==='object'&&!Array.isArray(o)&&
  Object.keys(o).every(k=>['name','function','limit','energy'].includes(k))&&
  bioText(o.name,3,100)&&bioText(o.function,10,480)&&
  bioText(o.limit,10,480)&&bioText(o.energy,4,150));
}
function originBio(x,notes=[]){return {...x,originHash:bioHash(x),observations:notes};}
function bioDefaultSeed(){
 const generations=require('./wild-generations').Species;
 const examples=[
  {key:'fenfox',family:'Vulpiridae',genus:'Paludovulpes',
   class:'Mammalia',order:'Carnivora',phylum:'Vertebrata',
   bodyPlan:'Quadrupedal small mammalian carnivoran with a furred torso, tail and mist-adapted sensory organs.',
   habitatRegions:['whisperfen','copperwood'],
   originPattern:'A mammalian Marshlight lineage with inherited mist-affinity structures; potential is not guaranteed by species identity.',
   organs:[{name:'Mist gland',function:'Supports the documented fog-related Glimmer Veil behaviour through the animal’s own energy reserve.',
    limit:'Cannot prove a human can copy this anatomy or grant unconditional invisibility.',
    energy:'Existing Glimmer Veil ability pays its original cost.'}]},
  {key:'stonehare',family:'Leporidae',genus:'Siliculepus',
   class:'Mammalia',order:'Lagomorpha',phylum:'Vertebrata',
   bodyPlan:'Small quadrupedal grazing mammal with long hind limbs and mineral-responsive landing tendons.',
   habitatRegions:['copperwood','ashwind'],
   originPattern:'A Flintbone lineage whose earth-aligned tendons support species-specific movement, not hereditary player powers.',
   organs:[{name:'Stone-responsive tendon',function:'Supports the existing Stonebound Leap by storing and releasing muscular elastic force.',
    limit:'The animal must still respect terrain, fatigue and the ordinary energy cost.',
    energy:'Existing Stonebound Leap ability pays its original cost.'}]}
 ];
 const species={};
 for(const e of examples){
  const def=E.SPECIES[e.key],g=generations[e.key];
  if(!def||!g||def.family!==e.family||g.family!==e.family)
   throw Error('Starting biology example contradicts actual authored beast or wild reproduction source');
  const root={source:BIO_SOURCE,id:'authored:'+e.key,name:def.name,
   taxonomy:{kingdom:'Beastkind',phylum:e.phylum,class:e.class,order:e.order,
    family:e.family,genus:e.genus,species:e.key},
   parentSpeciesId:null,variantDescription:null,
   bodyPlan:e.bodyPlan,habitatRegions:e.habitatRegions,realmId:null,
   ecologicalRole:def.role,diet:def.diet,
   reproduction:{mode:g.mode,gestationDays:g.gestationDays,
    juvenileDays:g.juvenileDays,adultDays:g.adultDays,lifespanDays:null},
   needs:{minForage:g.minimumForage,minWater:g.minimumWater,
    minQuality:g.minimumQuality,maxPressure:g.maxPressure},
   organs:e.organs,originPattern:e.originPattern,affinity:def.affinity,
   visibility:'public',basis:'Existing engine.SPECIES and world/wild-generations.Species; illustrative GM anatomy',
   recordedMinute:0,provenance:'canonical-existing-wildlife'};
  species[root.id]=originBio(root);
 }
 return {version:1,source:BIO_SOURCE,species};
}
function bioPeek(s){return s.table?.realm?.speciesBiology||null;}
function bioView(s){return bioPeek(s)||bioDefaultSeed();}
function bioValidate(reg){
 if(!reg||reg.version!==1||reg.source!==BIO_SOURCE||
  !reg.species||Array.isArray(reg.species))
  throw Error('Invalid saved living-bestiary biology registry');
 for(const [key,e] of Object.entries(reg.species)){
  if(key!==e?.id||!bioText(e.name,3,150)||
   !e.taxonomy||bioTaxonomyKeys.some(k=>!bioText(e.taxonomy[k],2,110))||
   !bioText(e.bodyPlan,15,1100)||!bioText(e.ecologicalRole,8,600)||
   !bioText(e.diet,3,300)||!bioText(e.originPattern,15,1200)||
   !bioText(e.affinity,3,200)||!bioText(e.basis,12,600)||
   !BIO_VIS.includes(e.visibility)||!Array.isArray(e.habitatRegions)||
   e.habitatRegions.length>30||e.habitatRegions.some(x=>!BioAtlas.R[x])||
   (e.realmId!==null&&!bioId(e.realmId))||
   !bioReproduction(e.reproduction)||!bioNeeds(e.needs)||
   !bioOrgans(e.organs)||!bioInt(e.recordedMinute,0,1000000000)||
   !['canonical-existing-wildlife','gm-established'].includes(e.provenance)||
   !Array.isArray(e.observations)||e.observations.length>200)
   throw Error('Saved species profile contains unsupported anatomy or biological conditions');
  const {originHash,observations,...root}=e;
  if(root.source!==BIO_SOURCE||bioHash(root)!==originHash)
   throw Error('The GM-established source biology was silently rewritten');
  if(e.parentSpeciesId!==null){
   const parent=reg.species[e.parentSpeciesId];
   if(parent){
    if(parent.id===e.id||parent.taxonomy.family!==e.taxonomy.family)
     throw Error('Species variant has inconsistent founded family ancestry');
   }else{
    let prior;
    try{prior=lookup(e.parentSpeciesId);}catch(_){throw Error('Species lineage refers to an unknown earlier taxon');}
    if(prior.taxonomy?.family!==e.taxonomy.family)
     throw Error('Species variant has no coherent parent family');
   }
  }
  for(const o of observations){
   if(o?.source!==BIO_SOURCE||o.speciesId!==e.id||
    !bioText(o.category,4,80)||!bioText(o.observation,12,750)||
    !bioText(o.basis,12,600)||!BIO_VIS.includes(o.visibility)||
    !bioInt(o.recordedMinute,0,1000000000))
    throw Error('Unverified biological observation');
   const {seal,...body}=o;if(seal!==bioHash(body))
    throw Error('Biology observation was rewritten rather than evidenced');
  }
 }
 return true;
}
function bioEnsure(s){
 const w=require('./simulation').ensure(s);
 w.speciesBiology||=bioDefaultSeed();
 bioValidate(w.speciesBiology);
 return w.speciesBiology;
}
function bioParent(s,id){
 const reg=bioView(s);
 if(reg.species[id])return reg.species[id];
 return lookup(id);
}
function bioAuthor(s,p={}){
 bioFields(p,['speciesId','name','taxonomy','bodyPlan','habitatRegions','ecologicalRole',
  'diet','reproduction','needs','organs','originPattern','affinity','basis'],
  ['visibility','parentSpeciesId','variantDescription','realmId']);
 if(typeof p.speciesId!=='string'||!(/^(gm:[a-z][a-z0-9_-]{3,79}|tx:[a-z0-9_-]+:[0-3]:\d{1,2}:\d{1,2}:[0-2]|authored:[a-z0-9_-]+)$/.test(p.speciesId))||
  !bioText(p.name,3,150)||!p.taxonomy||bioTaxonomyKeys.some(k=>!bioText(p.taxonomy[k],2,110))||
  !bioText(p.bodyPlan,15,1100)||!bioText(p.ecologicalRole,8,600)||
  !bioText(p.diet,3,300)||!bioText(p.originPattern,15,1200)||
  !bioText(p.affinity,3,200)||!bioText(p.basis,12,600)||
  !Array.isArray(p.habitatRegions)||p.habitatRegions.length>30||
  p.habitatRegions.some(x=>!BioAtlas.R[x])||!bioReproduction(p.reproduction)||
  !bioNeeds(p.needs)||!bioOrgans(p.organs)||
  !BIO_VIS.includes(p.visibility||'gm-only'))
  throw Error('GM biology needs concrete taxonomic ancestry, ecology, developmental limits and sourced organs');
 const r=bioEnsure(s);
 if(r.species[p.speciesId])throw Error('Already established species cannot be silently replaced');
 if(p.parentSpeciesId!==undefined){
  if(typeof p.parentSpeciesId!=='string'||p.parentSpeciesId===p.speciesId||
   !bioText(p.variantDescription,14,500))
   throw Error('A related species needs a real parent and independently described inherited difference');
  const parent=bioParent(s,p.parentSpeciesId);
  if(parent.taxonomy.family!==p.taxonomy.family)
   throw Error('New variant cannot silently change its established ancestral family');
 }else if(p.variantDescription!==undefined){
  throw Error('A variant description needs an actual parent species');
 }
 if(p.speciesId.startsWith('gm:')){
  if(!p.habitatRegions.length&&p.realmId===undefined)
   throw Error('A new species needs a real habitat or previously established supernatural realm');
 }else{
  const canonical=lookup(p.speciesId);
  if(canonical.taxonomy?.family!==p.taxonomy.family)
   throw Error('An authored biology profile cannot rewrite an existing species family');
 }
 if(p.realmId!==undefined){
  const cosmos=require('./cosmology-ledger').peek(s)||
   require('./cosmology-ledger').seed();
  if(!cosmos.planes[p.realmId])throw Error('Species planar habitat needs an actual established cosmological realm');
 }
 const base={source:BIO_SOURCE,id:p.speciesId,name:p.name.trim(),
  taxonomy:Object.fromEntries(bioTaxonomyKeys.map(k=>[k,p.taxonomy[k].trim()])),
  parentSpeciesId:p.parentSpeciesId??null,
  variantDescription:p.variantDescription?.trim()??null,
  bodyPlan:p.bodyPlan.trim(),habitatRegions:[...p.habitatRegions],
  realmId:p.realmId??null,ecologicalRole:p.ecologicalRole.trim(),
  diet:p.diet.trim(),reproduction:structuredClone(p.reproduction),
  needs:p.needs===null?null:structuredClone(p.needs),
  organs:structuredClone(p.organs),originPattern:p.originPattern.trim(),
  affinity:p.affinity.trim(),visibility:p.visibility||'gm-only',
  basis:p.basis.trim(),recordedMinute:s.world.minutes,
  provenance:'gm-established'};
 r.species[base.id]=originBio(base);
 return {recorded:true,speciesId:base.id,biologicalProfile:true,
  noAnimalInstantiated:true,noAbilitiesGranted:true,noBreedingResult:true};
}
function bioNote(s,p={}){
 bioFields(p,['speciesId','category','observation','basis'],['visibility']);
 if(!bioText(p.category,4,80)||!bioText(p.observation,12,750)||
  !bioText(p.basis,12,600)||!BIO_VIS.includes(p.visibility||'gm-only'))
  throw Error('A species observation needs genuine biological context and evidence');
 const r=bioEnsure(s),e=r.species[p.speciesId];
 if(!e)throw Error('The GM must establish the actual species profile first');
 if(e.visibility==='gm-only'&&p.visibility==='public')
  throw Error('A hidden species cannot be revealed by unlinked public biological notes');
 const note={source:BIO_SOURCE,speciesId:e.id,category:p.category,
  observation:p.observation.trim(),basis:p.basis.trim(),
  visibility:p.visibility||'gm-only',recordedMinute:s.world.minutes};
 const seal=bioHash(note);
 if(e.observations.some(x=>x.seal===seal))return {alreadyRecorded:true,applied:false};
 e.observations.push({...note,seal});
 return {recorded:true,speciesId:e.id,notAnAutomaticSpeciesEvolution:true};
}
function bioAge(s,{speciesId,ageDays}={}){
 if(!bioInt(ageDays,0,500000))throw Error('A biological development calculation needs an actual measured age in days');
 const reg=bioView(s);bioValidate(reg);
 const e=reg.species[speciesId];if(!e)return {profileKnown:false};
 const cycle=e.reproduction;
 const lifeStage=cycle.juvenileDays===null||cycle.adultDays===null?'unresolved':
  ageDays<cycle.juvenileDays?'dependent':
  ageDays<cycle.adultDays?'juvenile':'adult-or-later';
 return {speciesId,ageDays,lifeStage,reproductiveMode:cycle.mode,
  ageAloneDoesNotGuaranteeBreeding:true,
  noAutomaticEvolution:true};
}
function bioFit(s,{speciesId,regionId}={}){
 const reg=bioView(s);bioValidate(reg);
 const e=reg.species[speciesId];
 if(!e||e.visibility==='gm-only')
  return {known:false,habitatSuitability:'not-publicly-established'};
 if(!BioAtlas.R[regionId])throw Error('A real Atlas region is required to evaluate biological habitat');
 const establishedRegion=e.habitatRegions.includes(regionId);
 const eco=require('./simulation').peek(s).ecosystems[regionId];
 const needs=e.needs;
 if(!needs||!eco)return {known:true,regionId,listedHabitat:establishedRegion,
  suitability:'unknown',note:'No source-backed numeric physiology and local ecological state supports an assertion'};
 const limits={forage:eco.forage>=needs.minForage,
  water:eco.water>=needs.minWater,quality:eco.quality>=needs.minQuality,
  pressure:eco.pressure<=needs.maxPressure};
 return {known:true,regionId,listedHabitat:establishedRegion,
  limits,suitability:establishedRegion&&Object.values(limits).every(Boolean)?
   'compatible-with-recorded-basic-needs':'outside-some-established-conditions',
  noGuaranteedPresence:true,noAutomaticConception:true};
}
function bioStatus(s,{speciesId}={}){
 const reg=bioView(s);bioValidate(reg);
 const publicProfile=e=>({id:e.id,name:e.name,taxonomy:structuredClone(e.taxonomy),
  bodyPlan:e.bodyPlan,habitatRegions:[...e.habitatRegions],realmId:e.realmId,
  diet:e.diet,ecologicalRole:e.ecologicalRole,
  reproduction:structuredClone(e.reproduction),
  organs:e.organs.map(o=>({...o})),affinity:e.affinity,
  originPattern:e.originPattern,needs:e.needs?{...e.needs}:null,
  parentSpeciesId:e.parentSpeciesId,
  variantDescription:e.variantDescription,
  observations:e.observations.filter(o=>o.visibility==='public').map(o=>({
   category:o.category,observation:o.observation,basis:o.basis})),
  noSpeciesCreationOrPresentEncounter:true});
 if(speciesId!==undefined){
  const e=reg.species[speciesId];
  return e?.visibility==='public'?{known:true,species:publicProfile(e)}:
   {known:false,note:'No player-known specialist biology is established for this species'};
 }
 return {species:Object.values(reg.species).filter(e=>e.visibility==='public')
  .map(e=>({id:e.id,name:e.name,family:e.taxonomy.family,
   knownHabitats:e.habitatRegions})),
  note:'Existing public biology is not a sighting, a licence, a learned power or an encounter'};
}

module.exports={GROUPS,COUNTS,SPECIES_COUNT,FORM_COUNT,lookup,sample,localCandidates,verify,hash,
 BIO_SOURCE,bioDefaultSeed,bioPeek,bioView,bioEnsure,bioValidate,bioAuthor,bioNote,bioAge,bioFit,bioStatus};