'use strict';
// Canon-compatible NEW fantasy authoring, not facts from either campaign.
// Provides persistent magical ecology, public traditions and sealed phenomena.
// No creature or magic power can be earned by a world tick alone.
const A=require('./atlas');
const REALMS=[
 {id:'mortal',name:'The Living Realm',public:'The ordinary world, threaded by Vael-bearing rivers, roots, weather and living Origin Patterns.'},
 {id:'spirit',name:'The Spirit Veil',public:'Threshold realm of soul echoes, ancestral traces and lingering oaths. Soul rites are not guarantees of resurrection.'},
 {id:'elemental',name:'The Elemental Deep',public:'Great currents of heat, tide, wind, stone and stranger affinities sometimes touch sacred sites.'},
 {id:'liminal',name:'The Rift Between',public:'Unstable seams and pocket realms; anchors, maps and protection are necessary to cross.'},
 {id:'divine',name:'The Far Courts',public:'Traditions describe independent gods and sacred beings; vows and relics cannot command their favour.'}
];
const TRADITIONS=[
 {id:'river_memory',name:'River Memory',region:'morrowfen_basin',practice:'Tide vows, ancestor lanterns and sheltering the living river',dispute:'Whether the remembered current has a guiding intelligence'},
 {id:'ash_covenant',name:'Four Ember Covenant',region:'forge_basin',practice:'Forge vigils, salamander-safe offerings and tempering oaths',dispute:'Whether volcanic spirits are kin, stewards or divine messengers'},
 {id:'star_veil',name:'Unclosed Sky',region:'aurora_veil',practice:'Aurora observances and preserving names of migrating star-beasts',dispute:'Whether the distant lights are a court or a migration path'},
 {id:'first_cup',name:'Oath of the First Cup',region:'well_tableland',practice:'Shared sacred water and healing-rite hospitality',dispute:'Who may protect a miraculous spring during drought'},
 {id:'living_reef',name:'Living Reef Genealogy',region:'living_atoll',practice:'Reef ancestor songs and council rites with consenting beast citizens',dispute:'Whether the coral memory is one spirit or many persons'},
 {id:'wide_horizon',name:'Wide Horizon Paths',region:'grassroad_steppe',practice:'Wind lantern pilgrimages and the recognition of elder herd-spirits',dispute:'Whether the oldest sky beasts deserve worship or diplomatic standing'}
];
const SITES=[
 {id:'mirrorrush_shrine',name:'Mirrorrush Shrine',region:'whisperfen',kind:'sacred grove',public:true,story:'Water lights sometimes echo songs a generation old; naturalists dispute how to distinguish soul echoes from marshlight insects.',tradition:'river_memory',danger:'Flooded chambers and unstable Vael reeds',magic:'Water, ancestral resonance and ward-root ecology',secret:'A forgotten spirit threshold may lie beneath the drowned roots.'},
 {id:'riftglass_vault',name:'Riftglass Lantern Vault',region:'riftglass',kind:'sealed dungeon',public:true,story:'Old ward stones shelter a ruined observatory; access needs Warden permits and actual boundary anchors.',tradition:'river_memory',danger:'Spatial shear, disorientation and foreign Vael',magic:'Rift anchors and ancient inscription arrays',secret:'Its central vault still touches a pocket realm.'},
 {id:'crownspine_aerie',name:'Crownspine Elder Aerie',region:'crownspine_pass',kind:'dragon sanctuary',public:true,story:'Clifffolk leave the upper nesting ledges inviolate; dragon sightings are rare and subject to treaty.',tradition:'star_veil',danger:'High winds and territorial sovereign beasts',magic:'Storm-scale organs and cloud-resonant rock',secret:'An old pact records the passage of a dragon court.'},
 {id:'orchard_starwell',name:'Starwell of the Orchard',region:'orchard_vales',kind:'holy spring',public:true,story:'Pilgrims visit in winter for measured healing rites; no shrine promises a miracle.',tradition:'river_memory',danger:'Contaminated spring channels after heavy rain',magic:'Spring Vael and regenerative root symbionts',secret:'An older nonhuman healer order preceded the orchard houses.'},
 {id:'well_of_two_moons',name:'Well of Two Moons',region:'well_tableland',kind:'divine pilgrimage',public:true,story:'Caravans carry petitions for rain, though every promise to the well requires payment in service, never a guaranteed blessing.',tradition:'first_cup',danger:'Drought and competing water claims',magic:'Mirror-water rites and long-lived well spirits',secret:'The deep vault has a still-active covenant seal.'},
 {id:'saffron_sandcrypt',name:'Saffron Sandcrypt',region:'saffron_exp',kind:'lost temple',public:true,story:'A moving sand temple is described in caravan histories; surviving maps disagree.',tradition:'first_cup',danger:'Glassstorms and unstable entrances',magic:'Sand memory, ancient lens spirits',secret:'Its sanctuary was moved during the old beast wars.'},
 {id:'aurora_ancestor_gate',name:'Ancestor Gate of the Veil',region:'aurora_veil',kind:'spirit crossing',public:true,story:'Silent lights gather above a broken arch during the Longnight; crossing without an anchor is forbidden.',tradition:'star_veil',danger:'Soul-echo confusion and lethal cold',magic:'Soul resonance and auroral Vael',secret:'Some voices there are echoes, not living petitioners.'},
 {id:'winterwood_witness',name:'Winterwood Witness Tree',region:'northwood',kind:'ancient spirit forest',public:true,story:'The old council gathers beneath its roots to hear disputes over nesting paths.',tradition:'star_veil',danger:'Cold, old ward boundaries and protective forest beasts',magic:'Living tree-sigils and root-bound soul records',secret:'A nonhuman court once judged beneath this canopy.'},
 {id:'ashglass_deep',name:'Ashglass Deep',region:'ashglass_rift',kind:'rift labyrinth',public:true,story:'A rift labyrinth sleeps beneath the ash; trained teams sometimes return with impossible maps.',tradition:'ash_covenant',danger:'Changing corridors and contaminated breath',magic:'Pocket-realm geometry and metal memory',secret:'Its oldest passage leads outside ordinary elemental boundaries.'},
 {id:'ember_crown',name:'Ember Crown Forge',region:'forge_basin',kind:'primordial relic forge',public:true,story:'Forge masters guard its cooled altar; forging a relic there consumes materials and may invoke an independent elemental keeper.',tradition:'ash_covenant',danger:'Heat pressure, unstable oath-wards',magic:'Forged star-metal and furnace spirits',secret:'An ancestor forge oath has not yet been fulfilled.'},
 {id:'reef_remembrance',name:'Reef of Remembrance',region:'living_atoll',kind:'spirit reef',public:true,story:'The reef parliament safeguards a coral archive; outsiders need the reef citizens’ invitation.',tradition:'living_reef',danger:'Strong currents and fragile spawning wards',magic:'Coral soul-song and living rune colonies',secret:'A sleeping reef elder guards unspoken lineage memories.'},
 {id:'rainspire_skygate',name:'Rainspire Skygate',region:'rainspire',kind:'storm sanctuary',public:true,story:'Pilgrims glimpse airborne stones between monsoon banks; flight routes close during the great moulting.',tradition:'living_reef',danger:'Cyclones and territorial storm beasts',magic:'Airborne Vael and gravity-sensitive wings',secret:'The stones are the remnants of an older realm passage.'},
 {id:'old_tracks_sanctum',name:'Sanctum of Many Tracks',region:'many_nest',kind:'beast sovereign court',public:true,story:'Ancient beast lineages have their own assembly; humans may petition, not command.',tradition:'wide_horizon',danger:'Trespass violates binding sanctuary law',magic:'Ancestor traces and collective living-pattern rites',secret:'The earliest accord predates human royal histories.'},
 {id:'open_peak_starstairs',name:'Starstairs of Open Peak',region:'open_peak',kind:'cultivation pilgrimage',public:true,story:'Independent cultivators climb stone sigils seeking the discipline of silence; no beast contract is required.',tradition:'wide_horizon',danger:'Thin air and unchecked Qi flow',magic:'Meridian pressure and night-sky resonance',secret:'An ancient passage still registers unfamiliar constellations.'}
];
const keyed=Object.fromEntries(SITES.map(s=>[s.id,s]));
const clamp=(n)=>Math.max(0,Math.min(100,n));
const hash=(text)=>{let h=2166136261;for(const c of String(text)){h=Math.imul(h^c.charCodeAt(0),16777619);}return h>>>0;};
function seed(){return Object.fromEntries(SITES.map(x=>[x.id,{charge:32+hash(x.id)%37,seal:45+hash(x.id+'seal')%43,phase:'quiet',lastChangeDay:0,observations:0}]));}
function ensure(w){if(!w.mythic||typeof w.mythic!=='object')w.mythic=seed();for(const site of SITES)if(!w.mythic[site.id])w.mythic[site.id]=seed()[site.id];return w.mythic;}
function tick(w,day,{phase='sixday',event=()=>{}}={}){
 const sites=ensure(w);let shifts=0;
 for(const site of SITES){
  const x=sites[site.id];const n=hash(`${w.worldSeed}:${site.id}:${day}:${phase}`);
  const eco=w.ecosystems?.[site.region];const stress=eco?eco.pressure:30;
  const d=(n%5)-2;
  const sealChange=phase==='month'?(stress>73?-2:1)+((n>>>4)%3-1):0;
  x.charge=clamp(x.charge+d+(phase==='month'&&stress>80?1:0));
  x.seal=clamp(x.seal+sealChange);
  const prior=x.phase;
  x.phase=x.seal<20?'unstable':x.charge>87?'surging':x.charge<18?'fading':'quiet';
  if(x.phase!==prior){shifts++;x.lastChangeDay=day;
   // Observable distant signs spread by reports; sealed details stay in GM state.
   if(x.phase==='surging'||x.phase==='unstable')event({day,region:site.region,subject:site.id,
     text:`Pilgrims report unusual ${x.phase==='unstable'?'ward fractures':'Vael lights'} near ${site.name}; local authorities are investigating.`,channel:'field notice',publiclyKnown:true,releaseDay:day+3,severity:'important'});
  }
 }
 return {shifts};
}
function publicLore({type='site',id,region=null}={}){
 if(type==='realm'){const r=REALMS.find(z=>z.id===id);if(!r)throw Error('Unknown named realm');return {name:r.name,tradition:r.public,certainty:'Public metaphysical teaching, not verified access to that realm'};}
 if(type==='tradition'){const r=TRADITIONS.find(z=>z.id===id);if(!r)throw Error('Unknown named tradition');return {name:r.name,practice:r.practice,publicDisagreement:r.dispute};}
 if(type==='site'){
  if(id){const s=keyed[id];if(!s||!s.public)throw Error('No publicly recorded site');return {name:s.name,region:A.R[s.region]?.name,kind:s.kind,publicHistory:s.story,danger:s.danger,magicalEcology:s.magic};}
  if(!region||!A.R[region])throw Error('Known region is required for local site list');
  return {sites:SITES.filter(s=>s.public&&s.region===region).map(s=>({name:s.name,kind:s.kind,publicHistory:s.story}))};
 }
 throw Error('Unknown mythic record type');
}
function localStatus(s){const region=A.LOCATION_REGION[s.world.location]||'morrowfen_basin';return {...publicLore({type:'site',region}),note:'Publicly described sites and traditions; no unearned access, relic, blessing or evolution route'};}
function validate(){for(const site of SITES){if(!A.R[site.region])throw Error('Unmapped mythic site '+site.id);if(!TRADITIONS.some(t=>t.id===site.tradition))throw Error('Unmapped faith '+site.id);}return {sites:SITES.length,traditions:TRADITIONS.length,realms:REALMS.length};}
module.exports={REALMS,TRADITIONS,SITES,seed,ensure,tick,publicLore,localStatus,validate};
