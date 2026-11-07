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
module.exports={GROUPS,COUNTS,SPECIES_COUNT,FORM_COUNT,lookup,sample,localCandidates,verify,hash};