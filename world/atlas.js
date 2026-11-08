'use strict';
// Original Beastbound Master Prompt defines requirements, not country names.
// These named atlas entries are WORLD-LEVEL NEW AUTHORING, not facts from any past player campaign or a replacement for the original Master Prompt.
const CONTINENTS = [
 {id:'valedryn',name:'Valedryn',land:'Westwind continental shelf',climate:'oceanic west, rain-shadow east',seas:['Mirror Gulf','Saltwater Reach'],barriers:['Crownspine Range','Veilfen watershed'],history:'Canal republics emerged after the Seven Estuary Treaty; upland citadels still contest grazing rights.',ecology:'river wetlands, oakwoods, alpine herbfields, mist rifts'},
 {id:'sahriel',name:'Sahriel',land:'southern sandstone shield',climate:'monsoon coasts, interior deserts',seas:['Glasswind Sea','Pearl Bight'],barriers:['Copper Stair','Saffron Expanse'],history:'Old aquifer compacts preceded the caravan city leagues; wells remain political institutions.',ecology:'salt pans, flood oases, dune gardens, storm-chasing beasts'},
 {id:'threnor',name:'Threnor',land:'northern craton and glacier coast',climate:'subarctic, maritime fjords',seas:['Whitewake Sound','Broken Ice'],barriers:['Rimeback Escarpment','Longfjord Gap'],history:'Longwinter migration covenants recognised migratory beast routes as rights-of-way.',ecology:'taiga, tundra, deep fjords, aurora-touched lichens'},
 {id:'kareth',name:'Kareth',land:'eastern basalt and fault-island continent',climate:'volcanic subtropics to cool heights',seas:['Cinderwake Sea','Stormwake Channel'],barriers:['Ember Crown','Ashglass Rift'],history:'Guild city-states replaced a collapsed volcanic empire after the Ash Years.',ecology:'basalt forests, hot-spring wetlands, sky terraces, cave symbiotes'},
 {id:'islarin',name:'Islarin',land:'equatorial archipelago',climate:'monsoon islands, warm trade currents',seas:['Sapphire Necklace','Breathing Current'],barriers:['Typhoon Belt','Drowned Chain'],history:'Island assemblies negotiate with reef and pelagic beast polities, not only human harbours.',ecology:'coral, mangroves, rainforests, floating kelp cities'},
 {id:'oruvan',name:'Oruvan',land:'south-eastern high plateau and steppe basin',climate:'dry highland, seasonal grassland',seas:['Inner Silver Sea','Eastbound Gulf'],barriers:['Skyline Wall','Roaming Steppe'],history:'Pastoral nations and ancient nonhuman courts signed the Grazing and Passage Accord.',ecology:'alpine meadow, shortgrass steppe, salt lake, sky-bridge fauna'}
];
const CULTURES = [
 {id:'reedfolk',name:'Reedmarch riverfolk',customs:'Shared tide boards mark communal work; ferry crews recite river rights before crossing.',food:'smoked eel substitutes, millet bread, marsh greens',craft:'reed-lattice engineering, low-noise animal harnesses',faith:'River Memory shrines honour living waters, not ownership of them',language:'March Cant, a trade dialect',festival:'Lantern Drifting',conflict:'seasonal fishing restrictions and sanctuary boundaries'},
 {id:'vale',name:'Valedryn vale houses',customs:'Midwinter hearth pledges bind noble houses to crop aid and road care.',food:'apple broth, barley dumplings',craft:'timber wards and orchard husbandry',faith:'Hearth Lantern tradition',language:'Vale Common',festival:'Hearth Concord',conflict:'inheritance versus public rights'},
 {id:'ridge',name:'Crownspine uplanders',customs:'Every apprenticeship ends with a witnessed mountain rescue, not a duel.',food:'rootcakes and sheep-milk cheese',craft:'windrope bridges, stone sigils',faith:'High Silence monasteries',language:'Ridgetongue',festival:'Pass Opening',conflict:'quarrying versus nesting cliffs'},
 {id:'port',name:'Mirror Gulf port communes',customs:'Market contracts are read in three public languages.',food:'sea greens and pickled fruit',craft:'maritime charts and salt alchemy',faith:'Free Wake chapels',language:'Three-Harbour Pidgin',festival:'Fleet Reckoning',conflict:'merchant monopolies and coastal labour'},
 {id:'dune',name:'Sahriel well-keepers',customs:'Well custodians are elected and can veto military requisitions during drought.',food:'date broth and saffron flatbread',craft:'condensing screens and sandglass ceramics',faith:'Oath of the First Cup',language:'Sahri',festival:'First Rain',conflict:'water rights versus extraction'},
 {id:'monsoon',name:'Pearl Bight horticulturalists',customs:'Planting follows migratory pollinator arrivals, with sanctuary orchards protected by oath.',food:'spiced lentils and reef rice',craft:'living shade canopies and medicines',faith:'Garden of Returning',language:'Bight Speech',festival:'Monsoon Welcome',conflict:'plantation land and native forests'},
 {id:'caravan',name:'Copper Stair caravanners',customs:'Caravan elders publish route hazards and repay rescue debts across borders.',food:'dried citrus and grain cakes',craft:'beast-safe saddlery and route beacons',faith:'Waystar vows',language:'Stair Trade',festival:'Dust Moot',conflict:'tolls, tariffs and traffic security'},
 {id:'fjords',name:'Whitewake coast clans',customs:'Clans maintain ice escape refuges open to strangers and migratory beasts alike.',food:'smoked kelp and frostroot',craft:'boat ribs and aurora glass',faith:'Names Beneath the Snow',language:'Wake Speech',festival:'Ice Farewell',conflict:'whaling analogues versus sea-person treaties'},
 {id:'taiga',name:'Threnor forest councils',customs:'Families share winter range maps and settle forest disputes at spring thaw.',food:'pine nut mash and game substitutes',craft:'sap amber healing and snowshoes',faith:'Quiet Bough circles',language:'Northwood',festival:'First Tracks',conflict:'logging and old den routes'},
 {id:'aurora',name:'Northern veil observatories',customs:'Apprentices log auroral shifts alongside migrating star-beasts.',food:'fermented mossbread',craft:'star lenses and sky wards',faith:'The Unclosed Sky',language:'Veil Scholastic',festival:'Longnight Vigil',conflict:'research access versus sacred sky routes'},
 {id:'ember',name:'Kareth forge cities',customs:'Guild seats rotate through master artisans and ordinary labourers.',food:'charred grain and mineral soups',craft:'basalt casting, heat-symbiote glass',faith:'Four Ember chapels',language:'Ashcant',festival:'Cooling Night',conflict:'ore extraction and ash-lung disease'},
 {id:'terrace',name:'Kareth terrace farmers',customs:'Cliff gardens provide free nesting ledges for protective glider species.',food:'pepper roots and terrace beans',craft:'gravity channels and cliff agriculture',faith:'Rising Terrace observances',language:'Terrace Cant',festival:'Sky Harvest',conflict:'landslides and levitation monopoly'},
 {id:'rift',name:'Ashglass border households',customs:'Every dwelling holds an evacuation ledger and a shared rift-shelter key.',food:'salted tubers',craft:'rift anchors and containment ceramics',faith:'Boundary Keepers',language:'Border Sign',festival:'Seal Renewal',conflict:'safety zoning and illegal harvesting'},
 {id:'isles',name:'Islarin island assemblies',customs:'Harbour councils reserve a voice for accredited nonhuman sea envoys.',food:'taro, kelp and coconut fish substitutes',craft:'reef-safe hulls and storm sails',faith:'Current Songs',language:'Island Chain',festival:'Tide Parliament',conflict:'ports, coral preservation and shipping'},
 {id:'reef',name:'Reef-city citizens',customs:'Decisions are relayed through trained signal polyps with consent from sea peoples.',food:'filter gardens and tidal plankton farms',craft:'coral architecture and current shaping',faith:'living reef genealogy',language:'Chimecode and water-sign',festival:'Spawning Quiet',conflict:'deep trawling and surface law'},
 {id:'steppe',name:'Oruvan grassland caravans',customs:'Grazing rights move with seasons and are negotiated with herd-beast leaders.',food:'seed porridge and cultured milk',craft:'wind cloth and lightweight healing tents',faith:'Wide Horizon oaths',language:'Grassroad',festival:'Departure Feast',conflict:'fencing, pasture migration, and border patrols'},
 {id:'plateau',name:'Oruvan sky-village councils',customs:'Cliff-flight rescue is public service; ascetics need not bond beasts.',food:'mountain peas and tea leaf cakes',craft:'sky bridges and atmospheric cultivation',faith:'Open Peak practice',language:'Plateau Speech',festival:'High Wind',conflict:'mineral rights versus protected aerie'},
 {id:'beastcourt',name:'Independent beast courts',customs:'Legal standing attaches to comprehension and community, not species alone.',food:'species-dependent communal provision',craft:'bioarchitectural nests and scent archives',faith:'plural ancestor and habitat rites',language:'multimodal signing and negotiated translation',festival:'Council of Tracks',conflict:'autonomy and recognition by human states'}
];
const C = Object.fromEntries(CULTURES.map(x=>[x.id,x]));
// Compact authored polity records. Forces and pressures are WORLD SEEDS, not hard-coded outcomes.
const RAW_POLITIES = [
 ['reedmarch','Reedmarch Compact','valedryn','reedfolk','council','Morrowfen Crossing','floodplain','grain,reed,water','river sanctuary charter','naturalists_guild','asterwyn','saltleague'],
 ['asterwyn','Asterwyn Crown','valedryn','vale','monarchy','Bright Orchard','orchard','grain,timber,medicine','licensed guardianship','orchard_college','reedmarch','crownspine'],
 ['crownspine','Crownspine Holds','valedryn','ridge','confederation','Stonecairn','alpine','ore,stone,wind','cliff-nesting protections','gate_monastery','asterwyn','saltleague'],
 ['saltleague','Mirror Gulf League','valedryn','port','merchant republic','Saltglass','coast','trade,salt,ships','personhood recognized by port courts','salt_exchange','reedmarch','crownspine'],
 ['sahri_wells','Sahri Well Covenant','sahriel','dune','water council','Isset Wells','desert','water,glass,herbs','wells held in common trust','well_collegium','stair_guilds','red_sultanate'],
 ['red_sultanate','Red Dune Sultanate','sahriel','dune','sultanate','Marqesh','desert','silica,copper,dates','restricted wild capture','dune_guard','stair_guilds','sahri_wells'],
 ['stair_guilds','Copper Stair Charter','sahriel','caravan','guild federation','Stepsend','highland','caravans,beacons,stone','licensed transport partnerships','route_keepers','sahri_wells','red_sultanate'],
 ['pearl_bight','Pearl Bight Republic','sahriel','monsoon','republic','Palmwake','rainforest','medicine,spice,orchards','pollinator sanctuaries','garden_wardens','sahri_wells','saltleague'],
 ['whitewake','Whitewake Jarldoms','threnor','fjords','confederation','Skelvik','fjord','fish,glass,ships','sea-person treaty councils','ice_rescue','winter_court','icehollow'],
 ['icehollow','Icehollow Monastery Lands','threnor','aurora','monastic council','High Lantern','tundra','star-lens,observatories','protected sky migrations','aurora_academy','winter_court','whitewake'],
 ['winter_court','Winterwood Commons','threnor','taiga','commons','Cedarwatch','taiga','timber,amber,furs','forest-run wildlife courts','bough_council','whitewake','icehollow'],
 ['frostmarch','Frostmarch Protectorate','threnor','fjords','protectorate','Coldgate','coast','ore,salt,fish','military emergency permits','north_watch','whitewake','winter_court'],
 ['cinder_free','Free Forges of Kareth','kareth','ember','guild republic','Anvil Harbor','volcanic','ore,glass,craft','regulated beast labour','forge_university','terrace_union','ashglass_march'],
 ['terrace_union','Sky Terrace Union','kareth','terrace','federation','Featherstep','cliff','crops,cliff silk','aerie and glide-route protections','sky_school','cinder_free','ashglass_march'],
 ['ashglass_march','Ashglass March','kareth','rift','military regency','Sealwall','rift','vael,stone,anchors','rift exclusion zones','rift_wardens','cinder_free','terrace_union'],
 ['sunforge','Sunforge Principality','kareth','ember','principality','Goldflame','basalt','weapons,solar ore','state-owned strategic species','sunforgers','cinder_free','ashglass_march'],
 ['tide_assembly','Tide Assembly','islarin','isles','island assembly','Waveroot','island','ships,kelp,fruit','sea envoys at council','tide_assembly_house','reef_cantons','storm_peaks'],
 ['reef_cantons','Reef Cantons','islarin','reef','beast polity','Living Atoll','reef','coral,healing,song','nonhuman citizens hold treaty rights','reef_consistory','tide_assembly','pearl_bight'],
 ['storm_peaks','Stormpeak Freeholds','islarin','isles','freehold','Rainspire','island','storm glass,fruit','protected storm-flyer corridors','storm_school','tide_assembly','saltleague'],
 ['blackcurrent','Blackcurrent Harbours','islarin','port','merchant league','Deep Chain','coast','shipwrights,auctions','contract law under reform','current_exchange','tide_assembly','reef_cantons'],
 ['grassroad','Grassroad Confederacy','oruvan','steppe','confederation','Tallgrass Moot','steppe','herds,grain,cloth','migratory herd sovereignty','herd_council','skyvillage','iron_citadel'],
 ['skyvillage','Skyvillage League','oruvan','plateau','communal republic','Windfall','alpine','tea,glass,wind','independent cultivator rights','open_peak','grassroad','iron_citadel'],
 ['iron_citadel','Iron Citadel Dominion','oruvan','plateau','military oligarchy','Redwall','highland','ore,warindustry','licensed beast use under military law','redwall_warcollege','grassroad','skyvillage'],
 ['old_tracks','Old Tracks Beast Commonwealth','oruvan','beastcourt','beast polity','Many-Nest','steppe','living wood,pollen,salt','cross-species personhood, no forced pacts','beast_parliament','grassroad','iron_citadel']
];
const POLITIES=RAW_POLITIES.map((r,i)=>{
 const [id,name,continent,culture,government,capital,terrain,resources,rights,leadInstitution,ally,rival]=r;
 const c=C[culture];return {id,name,continent,culture,government,capital,terrain,resources:resources.split(','),rights,leadInstitution,ally,rival,
   language:c.language,faith:c.faith,food:c.food,craft:c.craft,festival:c.festival,customs:c.customs,contested:c.conflict,
   institutions:[leadInstitution],populationBand:['small','moderate','moderate','large'][i%4],
   initial:{stability:48+(i*11)%35,prosperity:40+(i*17)%38,legitimacy:45+(i*13)%39,treasury:35+(i*19)%48,military:36+(i*7)%47},
   diplomacy:{[ally]:'cooperation',[rival]:'tension'}};
});
const P=Object.fromEntries(POLITIES.map(x=>[x.id,x]));
const RAW_INSTITUTIONS=[
 ['naturalists_guild','Naturalists Guild','guild','reedmarch','field ecology, survey validation and sanctuary care','public contracts and member dues'],
 ['marsh_council','March Council','civil council','reedmarch','water rights, ferry upkeep and river legislation','levees and river tariffs'],
 ['lumenfall_annex','Lumenfall Annex','academy','reedmarch','meridian anatomy, medicine and comparative ecology','tuition and cooperative grants'],
 ['reed_clan_council','Reed Clan Council','community union','reedmarch','fishing rights and reed-bed stewardship','member offerings'],
 ['river_wardens','River Wardens','rangers','reedmarch','migration corridors and water rescue','public levy'],
 ['sanctuary_of_reeds','Sanctuary of Reeds','sanctuary','reedmarch','wetland beast welfare','donations and public aid'],
 ['orchard_college','Orchard College','academy','asterwyn','orchard biology and medicinal lineages','crown endowment'],
 ['hearth_court','Hearth-Court','civil council','asterwyn','inheritance and commons law','crown levies'],
 ['gate_monastery','Gate Monastery','cultivation school','crownspine','108-gate safety and independent practice','apprentice donations'],
 ['ridge_rescue','Ridge Rescue Compact','rescue guild','crownspine','cliff navigation and weather alerts','pass tolls'],
 ['salt_exchange','Saltglass Exchange','merchant guild','saltleague','shipping arbitration and trade bonds','market dues'],
 ['mirror_academy','Mirror Gulf Institute','academy','saltleague','navigation, current shaping and maritime diplomacy','tuition and patronage'],
 ['well_collegium','Well Collegium','academy','sahri_wells','water alchemy, desert medicine and aquifer law','well trusts'],
 ['cup_guard','First Cup Tribunal','civil court','sahri_wells','enforce water access rights','shared well levies'],
 ['dune_guard','Red Dune Guard','military academy','red_sultanate','desert patrol and storm wards','state treasury'],
 ['saffron_consortium','Saffron Consortium','merchant guild','red_sultanate','caravan insurance and textile markets','merchant shares'],
 ['route_keepers','Route Keepers','travel guild','stair_guilds','beast-safe carriage and route beacons','pass fees'],
 ['stair_institute','Copper Stair Institute','academy','stair_guilds','lineage-compatible saddlery and logistics','guild subscriptions'],
 ['garden_wardens','Garden Wardens','sanctuary','pearl_bight','pollinator protection and medicine','orchard endowment'],
 ['rain_school','Monsoon School','academy','pearl_bight','plant-beast symbiosis and healer training','public subsidies'],
 ['ice_rescue','Ice Rescue Brotherhood','rescue guild','whitewake','ice navigation and nonhuman sea rescue','sea tithe'],
 ['whitewake_court','Treaty of Whitewake Office','diplomacy','whitewake','treaties with marine beast peoples','harbour grants'],
 ['aurora_academy','Aurora Academy','academy','icehollow','sky observation and soul safety','monastery support'],
 ['veil_archive','Veil Archive','research institute','icehollow','celestial migration record keeping','donations'],
 ['bough_council','Quiet Bough Council','civil council','winter_court','shared forest routes and lumber licensing','forest tax'],
 ['north_watch','North Watch','military guild','frostmarch','winter border patrol','military budget'],
 ['forge_university','Forge University','academy','cinder_free','arcane engineering and smithcraft','guild dues'],
 ['glass_workers','Glass Workers Union','labour guild','cinder_free','injury prevention and apprentice rights','member subscriptions'],
 ['sky_school','Sky School','academy','terrace_union','wind cultivation and rescue','public levy'],
 ['ledge_guard','Ledge Guardians','sanctuary','terrace_union','cliff-nesting protections','aerie trusts'],
 ['rift_wardens','Ashglass Rift Wardens','wardens','ashglass_march','rift containment and safety licensing','state funding'],
 ['boundary_lab','Boundary Lab','research institute','ashglass_march','safe observation of rift biology','sealed grants'],
 ['sunforgers','Sunforge Academy','military academy','sunforge','solar warding and heat-tolerant armor','princely treasury'],
 ['tide_assembly_house','Tide Assembly House','civil council','tide_assembly','island law and disaster response','harbour levies'],
 ['coral_healers','Coral Healers College','medical college','tide_assembly','amphibious medicine and reef welfare','clinic fees'],
 ['reef_consistory','Reef Consistory','beast civil service','reef_cantons','marine citizen councils and cross-species translation','reef commons'],
 ['current_singers','Current Singers','religious order','reef_cantons','ancestry and tidal mediation','voluntary offerings'],
 ['storm_school','Storm School','cultivation school','storm_peaks','weather discipline and flight rescue','apprenticeship dues'],
 ['current_exchange','Blackcurrent Exchange','merchant guild','blackcurrent','contracts and maritime cargo','port taxes'],
 ['sea_justice','Open Wake Advocates','rights society','blackcurrent','reform labour and capture law','public subscriptions'],
 ['herd_council','Herd Council','beast-human assembly','grassroad','pasture passages and interspecies negotiation','grazing contributions'],
 ['grassroad_clinic','Grassroad Clinic','medical college','grassroad','migratory herd medicine','cooperative dues'],
 ['open_peak','Open Peak School','independent cultivation','skyvillage','human advancement without forced beast partnership','student service'],
 ['sky_cartographers','Sky Cartographers','exploration guild','skyvillage','seasonal winds and mountain mapping','expedition grants'],
 ['redwall_warcollege','Redwall War College','military academy','iron_citadel','defensive formations and state strategy','military budget'],
 ['iron_law_office','Iron Law Office','ministry','iron_citadel','military licensing and conscription','state budget'],
 ['beast_parliament','Council of Many Tracks','beast government','old_tracks','autonomy and shared habitats','common stores'],
 ['translation_fellowship','Open Tongue Fellowship','diplomacy','old_tracks','reciprocal language and rights education','donations']
];
const INSTITUTIONS=RAW_INSTITUTIONS.map(([id,name,type,polity,specialty,funding],i)=>({id,name,type,polity,specialty,funding,
 roots:`Founded after ${i%3===0?'a regional trade dispute':i%3===1?'a migration crisis':'a medical or educational shortage'}`,
 policy:['conservation-first','professional licensing','independent research','public service'][i%4],
 rival:RAW_INSTITUTIONS[(i+11)%RAW_INSTITUTIONS.length][0],initial:{funds:38+i*13%53,reputation:42+i*11%48,capacity:35+i*17%51}}));
const I=Object.fromEntries(INSTITUTIONS.map(x=>[x.id,x]));
const REGIONS=[
 {id:'morrowfen_basin',name:'Morrowfen Basin',continent:'valedryn',polity:'reedmarch',biome:'wetland',traits:['canal market','river rights','marsh reed'],loc:['crossing'],neighbors:['whisperfen','copperwood','ashwind'],goods:['grain','feed','herbs'],dangers:['flood','reedbank collapse'],site:'Morrowfen Crossing'},
 {id:'whisperfen',name:'Whisperfen Wetlands',continent:'valedryn',polity:'reedmarch',biome:'wetland',traits:['reed islands','mist foragers','migratory grazer'],loc:['fen'],neighbors:['morrowfen_basin','copperwood'],goods:['herbs','feed'],dangers:['erosion','pollution'],site:'Wetland paths'},
 {id:'copperwood',name:'Copperwood Verge',continent:'valedryn',polity:'reedmarch',biome:'forest',traits:['copper-bark','canopy pollinators','forest dens'],loc:['forest'],neighbors:['morrowfen_basin','ashwind'],goods:['timber','herbs'],dangers:['logging','nesting loss'],site:'Copperwood Verge'},
 {id:'ashwind',name:'Ashwind Foothills',continent:'valedryn',polity:'reedmarch',biome:'alpine',traits:['ironbloom','dry volcanic winds'],loc:['hills'],neighbors:['morrowfen_basin','copperwood','riftglass'],goods:['ore','glass'],dangers:['rockfall','overmining'],site:'Ashwind Foothills'},
 {id:'lumenfall',name:'Lumenfall Annex District',continent:'valedryn',polity:'reedmarch',biome:'settlement',traits:['academy','clinic','research gardens'],loc:['academy'],neighbors:['morrowfen_basin'],goods:['knowledge','medicine'],dangers:['funding disputes'],site:'Lumenfall Annex'},
 {id:'riftglass',name:'Riftglass Outpost',continent:'valedryn',polity:'reedmarch',biome:'rift',traits:['containment stones','survey anchors'],loc:['ruins'],neighbors:['ashwind','whisperfen'],goods:['vael','stone'],dangers:['rift exposure'],site:'Riftglass Outpost'},
 {id:'orchard_vales',name:'Orchard Vales',continent:'valedryn',polity:'asterwyn',biome:'forest',traits:['orchard hospitals','grain barge routes'],neighbors:['morrowfen_basin'],goods:['grain','herbs'],dangers:['crop blight']},
 {id:'crownspine_pass',name:'Crownspine Pass',continent:'valedryn',polity:'crownspine',biome:'alpine',traits:['mountain rescue','cliff nesting'],neighbors:['orchard_vales'],goods:['ore','stone'],dangers:['avalanches']},
 {id:'mirror_gulf',name:'Mirror Gulf',continent:'valedryn',polity:'saltleague',biome:'coast',traits:['deep ports','salt trade'],neighbors:['morrowfen_basin'],goods:['salt','trade'],dangers:['storm surges']},
 {id:'saffron_exp',name:'Saffron Expanse',continent:'sahriel',polity:'red_sultanate',biome:'desert',traits:['dune aquifers','storm hunting'],neighbors:['well_tableland'],goods:['glass','ore'],dangers:['drought']},
 {id:'well_tableland',name:'Well Tableland',continent:'sahriel',polity:'sahri_wells',biome:'oasis',traits:['public cisterns','water gardens'],neighbors:['saffron_exp','copper_stair'],goods:['water','herbs'],dangers:['aquifer depletion']},
 {id:'copper_stair',name:'Copper Stair',continent:'sahriel',polity:'stair_guilds',biome:'highland',traits:['caravan steps','route beacons'],neighbors:['well_tableland'],goods:['ore','trade'],dangers:['rockfalls']},
 {id:'pearl_gardens',name:'Pearl Gardens',continent:'sahriel',polity:'pearl_bight',biome:'rainforest',traits:['orchard symbiosis','monsoon clinics'],neighbors:['copper_stair'],goods:['herbs','grain'],dangers:['monsoon flood']},
 {id:'skelvik_fjords',name:'Skelvik Fjords',continent:'threnor',polity:'whitewake',biome:'fjord',traits:['ice refuges','sea-person treaties'],neighbors:['northwood'],goods:['salt','trade'],dangers:['ice collapse']},
 {id:'northwood',name:'Winterwood',continent:'threnor',polity:'winter_court',biome:'taiga',traits:['amber medicine','forest commons'],neighbors:['skelvik_fjords','coldgate'],goods:['timber','herbs'],dangers:['logging']},
 {id:'aurora_veil',name:'Aurora Veil',continent:'threnor',polity:'icehollow',biome:'tundra',traits:['star-beast migration','cold observatories'],neighbors:['coldgate'],goods:['glass','vael'],dangers:['sky rifts']},
 {id:'coldgate',name:'Coldgate Ice Road',continent:'threnor',polity:'frostmarch',biome:'tundra',traits:['border fortress','migrant passage'],neighbors:['aurora_veil','northwood'],goods:['ore','salt'],dangers:['blizzard']},
 {id:'forge_basin',name:'Forge Basin',continent:'kareth',polity:'cinder_free',biome:'volcanic',traits:['heat workshops','basalt foundries'],neighbors:['skyterraces'],goods:['ore','glass'],dangers:['toxic ash']},
 {id:'skyterraces',name:'Sky Terraces',continent:'kareth',polity:'terrace_union',biome:'alpine',traits:['hanging gardens','glider corridors'],neighbors:['forge_basin'],goods:['grain','herbs'],dangers:['ledge collapse']},
 {id:'ashglass_rift',name:'Ashglass Rift',continent:'kareth',polity:'ashglass_march',biome:'rift',traits:['red boundary','anchored passes'],neighbors:['forge_basin'],goods:['vael','stone'],dangers:['rift instability']},
 {id:'sunforge_flats',name:'Sunforge Flats',continent:'kareth',polity:'sunforge',biome:'volcanic',traits:['solar mines','ward towns'],neighbors:['forge_basin'],goods:['ore','glass'],dangers:['overheating']},
 {id:'waveroot_isles',name:'Waveroot Isles',continent:'islarin',polity:'tide_assembly',biome:'island',traits:['island parliament','reef-safe sail'],neighbors:['living_atoll'],goods:['trade','herbs'],dangers:['typhoon']},
 {id:'living_atoll',name:'Living Atoll',continent:'islarin',polity:'reef_cantons',biome:'reef',traits:['beast citizens','tidal signal'],neighbors:['waveroot_isles'],goods:['medicine','salt'],dangers:['bleaching']},
 {id:'rainspire',name:'Rainspire Peaks',continent:'islarin',polity:'storm_peaks',biome:'island',traits:['storm gliders','cloud forests'],neighbors:['waveroot_isles'],goods:['glass','fruit'],dangers:['storm surge']},
 {id:'deep_chain',name:'Deep Chain Ports',continent:'islarin',polity:'blackcurrent',biome:'coast',traits:['merchant harbour','trade court'],neighbors:['waveroot_isles'],goods:['trade','ships'],dangers:['piracy']},
 {id:'grassroad_steppe',name:'Grassroad Steppe',continent:'oruvan',polity:'grassroad',biome:'steppe',traits:['herd passages','nomad moots'],neighbors:['open_peak','many_nest'],goods:['feed','grain'],dangers:['drought']},
 {id:'open_peak',name:'Open Peak Highlands',continent:'oruvan',polity:'skyvillage',biome:'alpine',traits:['wind cultivation','sky bridges'],neighbors:['grassroad_steppe','redwall'],goods:['glass','herbs'],dangers:['windstorms']},
 {id:'redwall',name:'Redwall Ironfields',continent:'oruvan',polity:'iron_citadel',biome:'highland',traits:['mines','military roads'],neighbors:['open_peak','grassroad_steppe'],goods:['ore','stone'],dangers:['forced extraction']},
 {id:'many_nest',name:'Many-Nest Commons',continent:'oruvan',polity:'old_tracks',biome:'steppe',traits:['interspecies courts','seasonal dens'],neighbors:['grassroad_steppe'],goods:['medicine','feed'],dangers:['land claims']}
];
const R=Object.fromEntries(REGIONS.map(x=>[x.id,x]));
const LOCATION_REGION={crossing:'morrowfen_basin',fen:'whisperfen',forest:'copperwood',hills:'ashwind',academy:'lumenfall',ruins:'riftglass'};
const TRADE_ROUTES=[
 ['reedmarch','asterwyn','waterway','grain','herbs'],['reedmarch','saltleague','coastal canal','salt','feed'],['asterwyn','crownspine','mountain pass','grain','ore'],['saltleague','pearl_bight','sea lane','herbs','trade'],
 ['sahri_wells','stair_guilds','caravan stair','water','glass'],['stair_guilds','red_sultanate','dune road','ore','grain'],['pearl_bight','tide_assembly','monsoon sea lane','herbs','trade'],
 ['whitewake','winter_court','fjord road','salt','timber'],['whitewake','icehollow','ice convoy','trade','glass'],['winter_court','frostmarch','snow pass','timber','ore'],
 ['cinder_free','terrace_union','cliff ropeway','ore','grain'],['cinder_free','ashglass_march','warded rail','glass','vael'],['cinder_free','sunforge','basalt road','ore','weapons'],
 ['tide_assembly','reef_cantons','tidal channel','food','medicine'],['tide_assembly','blackcurrent','shipping lane','trade','ships'],['tide_assembly','storm_peaks','storm path','fruit','glass'],
 ['grassroad','skyvillage','sky pass','feed','herbs'],['grassroad','old_tracks','grazing treaty','feed','medicine'],['grassroad','iron_citadel','disputed road','ore','feed']
].map(([a,b,mode,exportA,exportB],i)=>({id:`trade_${i+1}`,a,b,mode,exportA,exportB,capacity:45+i*7%35,risk:10+i*13%48}));
const FESTIVALS=[{id:'lantern_drifting',culture:'reedfolk',name:'Lantern Drifting',season:'autumn',purpose:'Remember drowned crossings and audit the river refuges'},{id:'first_rain',culture:'dune',name:'First Rain',season:'spring',purpose:'Water access resets before the caravan season'},{id:'ice_farewell',culture:'fjords',name:'Ice Farewell',season:'spring',purpose:'Reopen rescue routes and begin the safe sail period'},{id:'tide_parliament',culture:'isles',name:'Tide Parliament',season:'summer',purpose:'Renew harbour accords with sea-person delegates'},{id:'high_wind',culture:'plateau',name:'High Wind',season:'summer',purpose:'Cross-school independent cultivation demonstrations'},{id:'council_of_tracks',culture:'beastcourt',name:'Council of Tracks',season:'autumn',purpose:'Negotiate passages with autonomous species'},{id:'cooling_night',culture:'ember',name:'Cooling Night',season:'winter',purpose:'Close the great forges for repairs and public memorials'}];
const HISTORY=[
 {era:'Age of First Paths',period:'ancient',event:'Rifts and migratory beasts shaped the earliest roads long before national borders.'},
 {era:'Estuary Wars',period:'several centuries ago',event:'Riverside city-states fought over levees; the Seven Estuary Treaty created enforceable passage rights.'},
 {era:'Ash Years',period:'several generations ago',event:'A failed volcanic empire triggered Kareth guild republics and permanent rift licensing.'},
 {era:'Longwinter Covenant',period:'several generations ago',event:'Threnor households admitted migratory nonhuman communities to ice rescue networks.'},
 {era:'Current Century',period:'modern',event:'Trade charters, species-personhood disputes and research academies reshape diplomacy.'}
];
const ATLAS={continents:CONTINENTS,polities:POLITIES,cultures:CULTURES,institutions:INSTITUTIONS,regions:REGIONS,tradeRoutes:TRADE_ROUTES,festivals:FESTIVALS,history:HISTORY};
function safeLookup(type,id){const arrays={continent:CONTINENTS,polity:POLITIES,institution:INSTITUTIONS,region:REGIONS,culture:CULTURES,festival:FESTIVALS};const arr=arrays[type];if(!arr)throw Error('Unknown atlas category');return arr.find(x=>x.id===id)||null;}
module.exports={...ATLAS,P,I,R,C,LOCATION_REGION,safeLookup};