/* Beastbound Realms — simulation kernel v0.1
 * Deterministic, dependency-free, serialisable, with bounded rules and event logging.
 * Canonical source: Beastbound_Realms_Unified_Master_Prompt.md
 * Exported through CommonJS (Node tests) and globalThis.BeastboundEngine (offline browser).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BeastboundEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = '0.3.0';
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const copy = x => JSON.parse(JSON.stringify(x));
  const mod = n => Math.floor((n - 10) / 2);
  const STAGES = ['Baseline Human','Awakened Human','Refined Human','Transformed Human','Ascendant Human','Transcendent Human','Higher Evolved Existence'];
  const MERIDIAN_STAGES = ['Foundation Tempering','Meridian Awakening','108 Gate Opening','Dantian Sea Formation','Meridian Web Integration','Living Intent Embodiment','Physique-Meridian Integration','Living Domain','Transcendent Constitution'];
  const SYNCHRONISATION = ['Basic Coordination','Energy Recognition','Energy Synchronisation','Resonant Circulation','Shared Technique Development','Combined Manifestation','Beast-Aspect Integration','Dual-State Combat','Symbiotic Evolution','Unique Partnership Transcendence'];
  const SOUL_PHASES = ['Uninitiated','Soul Perception','Soul Threading','Resonance Lattice','Soul Forge','Inner Sanctuary','Soul Domain','Living Soul Architecture'];
  const BODY_CYCLES = ['Muscle-Tendon','Bone-Marrow','Organ','Nerve-Sense','Blood-Essence','Adaptive Physique','Evolved Physique'];
  const RIFT_STEPS = ['Uninitiated','Rift Sense','Anchor Marking','Fold Step','Boundary Weaving','Pocket Architecture','Rift Adaptation','Realm Walking','Boundary Domain'];
  const ORIGIN_STEPS = ['Pattern Mapping','Compatibility Testing','Trait Seeding','Rejection Window','Stabilisation','Expression','Adaptation','Personal Evolution'];
  const SPECIES = {
    fenfox: { name:'Lanternfen Fox', family:'Vulpiridae', habitat:['fen','forest'], biome:'wetland edge', diet:'omnivore', role:'crepuscular forager', grade:'Common', lineage:'Marshlight', affinity:'mist', intelligence:'animal-cunning',
      hp:31, energy:18, attack:3, guard:12, temperament:'curious', ability:{name:'Glimmer Veil',cost:5,power:4,effect:'mist'},
      evolutions:[{to:'reedshade', level:4, trust:42, resource:'moss_crystal', environment:'fen', choice:'stealth', description:'Pale reed-fur and vapor pockets develop along the flanks.'},{to:'emberbrush',level:5, trust:50, resource:'sun_shard',environment:'hills',choice:'heat',description:'The coat turns copper and heat glands crystallise.'},{to:'dreamreed',level:6,trust:70,resource:'vael_water',environment:'fen',kind:'hidden',hidden:true,grade:3,potential:5,maturityYears:2,specialConditions:[{label:'Master Glimmer Veil',type:'technique',value:'Glimmer Veil'},{label:'Resonance through Sync 3',type:'sync',value:3}],description:'A second lunar outline knits through the reeds; a new voice of mist blooms around its coat.'}] },
    dreamreed: {name:'Dreamreed Fox',family:'Vulpiridae',habitat:['fen'],biome:'Vael-suffused reed basin',diet:'omnivore',role:'nocturnal resonance guardian',grade:'Rare',lineage:'Marshlight',affinity:'mist-soul',intelligence:'animal-cunning',hp:78,energy:55,attack:9,guard:16,temperament:'contemplative',ability:{name:'Reeddream Chorus',cost:12,power:11,effect:'mist-soul'},evolutions:[]},
    reedshade: { name:'Reedshade Fox', family:'Vulpiridae',habitat:['fen'],biome:'mistmarsh', diet:'omnivore',role:'mist-edge predator',grade:'Uncommon',lineage:'Marshlight',affinity:'mist',intelligence:'animal-cunning',hp:49,energy:32,attack:6,guard:14,temperament:'watchful',ability:{name:'Fogstep',cost:7,power:7,effect:'mist'},evolutions:[]},
    emberbrush:{name:'Emberbrush Fox',family:'Vulpiridae',habitat:['hills','forest'],biome:'sun-dry thicket',diet:'omnivore',role:'brushland predator',grade:'Uncommon',lineage:'Marshlight',affinity:'heat',intelligence:'animal-cunning',hp:54,energy:30,attack:7,guard:13,temperament:'bold',ability:{name:'Cinder Rush',cost:7,power:8,effect:'heat'},evolutions:[]},
    stonehare:{name:'Flint-Ear Hare',family:'Leporidae',habitat:['hills','forest'],biome:'scree and grass',diet:'herbivore',role:'prey and seed-carrier',grade:'Common',lineage:'Flintbone',affinity:'earth',intelligence:'instinctive',hp:26,energy:13,attack:2,guard:13,temperament:'flighty',ability:{name:'Stonebound Leap',cost:4,power:3,effect:'earth'},evolutions:[{to:'cragrunner',level:4,trust:30,resource:'ironbloom',environment:'hills',choice:'speed',description:'Limb tendons lithify into elastic stone fibres.'}]},
    cragrunner:{name:'Cragrunner Hare',family:'Leporidae',habitat:['hills'],biome:'cliff trail',diet:'herbivore',role:'alpine disperser',grade:'Uncommon',lineage:'Flintbone',affinity:'earth',intelligence:'instinctive',hp:43,energy:21,attack:5,guard:16,temperament:'alert',ability:{name:'Cliffbreaker Bound',cost:6,power:6,effect:'earth'},evolutions:[]},
    glasswing:{name:'Glasswing Skimmer',family:'Luminopteridae',habitat:['fen','forest'],biome:'pond and canopy',diet:'nectar-feeder',role:'pollinator',grade:'Common',lineage:'Lumenwing',affinity:'light',intelligence:'instinctive',hp:22,energy:24,attack:2,guard:15,temperament:'skittish',ability:{name:'Prism Flicker',cost:5,power:4,effect:'light'},evolutions:[{to:'sunweaver',level:5,trust:50,resource:'sun_shard',environment:'forest',choice:'light',description:'Wing veins refract sunlight into protective lattices.'}]},
    sunweaver:{name:'Sunweaver Skimmer',family:'Luminopteridae',habitat:['forest'],biome:'sunlit canopy',diet:'nectar-feeder',role:'canopy pollinator',grade:'Uncommon',lineage:'Lumenwing',affinity:'light',intelligence:'animal-cunning',hp:36,energy:42,attack:5,guard:16,temperament:'sociable',ability:{name:'Lightweave',cost:8,power:8,effect:'light'},evolutions:[]},
    mirehorn:{name:'Mirehorn Grazer',family:'Paleocervidae',habitat:['fen','hills'],biome:'wet grazing plain',diet:'herbivore',role:'wetland grazer',grade:'Common',lineage:'Marrowroot',affinity:'water',intelligence:'animal-cunning',hp:52,energy:15,attack:4,guard:11,temperament:'cautious',ability:{name:'Rooted Charge',cost:5,power:6,effect:'impact'},evolutions:[]},
    nightcorvid:{name:'Sablecall Corvid',family:'Corvidae',habitat:['forest','ruins'],biome:'old forest and ruins',diet:'omnivore',role:'scavenger and mimic',grade:'Uncommon',lineage:'Echoquill',affinity:'sound',intelligence:'sapient',hp:32,energy:28,attack:5,guard:14,temperament:'calculating',ability:{name:'Echo Confound',cost:6,power:5,effect:'sound'},evolutions:[]},
    ashnewt:{name:'Cinderskin Newt',family:'Ignisalamandridae',habitat:['hills','ruins'],biome:'ashstone crevice',diet:'insectivore',role:'heat recycler',grade:'Common',lineage:'Embermolt',affinity:'heat',intelligence:'instinctive',hp:35,energy:19,attack:4,guard:12,temperament:'territorial',ability:{name:'Spark Spit',cost:5,power:6,effect:'heat'},evolutions:[]}
  };
  const LOCATIONS = {
    crossing: {name:'Morrowfen Crossing',biome:'settlement',description:'A canal market built where two beast-migration routes meet. Lanterns sway over busy boardwalks.', exits:['forest','fen','academy'],facilities:['market','guild','infirmary'], spawns:[]},
    forest: {name:'Copperwood Verge',biome:'forest',description:'Copper-barked trees crowd the path. Pollen glows faintly in the afternoon air.',exits:['crossing','hills','fen'],facilities:[],spawns:['fenfox','stonehare','glasswing','nightcorvid']},
    fen: {name:'Whisperfen Wetlands',biome:'fen',description:'Black water, floating reed islands, and the low singing of night insects.',exits:['crossing','forest','ruins'],facilities:[],spawns:['fenfox','glasswing','mirehorn']},
    hills: {name:'Ashwind Foothills',biome:'hills',description:'A bare ridge carries warm volcanic winds and the scent of ironbloom.',exits:['forest','ruins'],facilities:[],spawns:['stonehare','ashnewt','mirehorn']},
    academy: {name:'Lumenfall Annex',biome:'settlement',description:'A teaching annex where beast physicians, cultivators and artificers share laboratories.',exits:['crossing'],facilities:['academy','clinic'],spawns:[]},
    ruins: {name:'Riftglass Outpost',biome:'ruins',description:'Ward stones encircle an old breach. Surveyors mark each change in the distant distortion.',exits:['fen','hills'],facilities:['riftsurvey'],spawns:['ashnewt','nightcorvid']}
  };
  const RESOURCES = { marsh_reed:{name:'Marsh Reed',value:3},moss_crystal:{name:'Moss Crystal',value:25},sun_shard:{name:'Sun Shard',value:32},ironbloom:{name:'Ironbloom',value:20},clean_rations:{name:'Clean Rations',value:8},healing_balm:{name:'Healing Balm',value:20},origin_sample:{name:'Ethically Sourced Pattern Sample',value:55},ripening_fruit:{name:'Vael-Grove Ripening Fruit',value:10},vael_water:{name:'Vael-Charged Water',value:18} };
  const QUESTS = [
    {id:'wetland_census', title:'Wetland Census', origin:'Naturalists Guild',objective:'Record three independent beast sightings in the Whisperfen and nearby forest.',reward:48,deadlineDays:8,metric:'sightings',target:3},
    {id:'moss_crystal', title:'Stable Moss for the Infirmary',origin:'Infirmary Cooperative',objective:'Deliver two moss crystals for stabilising overworked meridians.',reward:60,deadlineDays:12,metric:'moss_crystal',target:2},
    {id:'rift_report',title:'Riftglass Watch',origin:'Lumenfall Surveyors',objective:'Visit the Riftglass Outpost and deliver a noninvasive observational report.',reward:75,deadlineDays:10,metric:'visit_ruins',target:1}
  ];
  const COMPETITIONS = [
    {id:'field_assessment',name:'Copperwood Field Assessment',venue:'crossing',category:'Ecology',skill:'survival',attribute:'wis',dc:13,fee:5,reward:24,requirement:'No prerequisite',ranking:'fieldwork'},
    {id:'precision_trials',name:'Meridian Precision Trials',venue:'academy',category:'Meridian cultivation',skill:'cultivation',attribute:'wis',dc:15,fee:8,reward:42,requirement:'At least one opened Meridian Gate',ranking:'meridian'},
    {id:'circle_exhibition',name:'Lumenfall Circle Exhibition',venue:'academy',category:'Arcane architecture',skill:'arcana',attribute:'int',dc:16,fee:10,reward:46,requirement:'First Arcane Circle constructed',ranking:'arcane'},
    {id:'partnership_trials',name:'Reciprocal Partnership Trials',venue:'crossing',category:'Human-beast partnership',skill:'beastcraft',attribute:'wis',dc:15,fee:7,reward:40,requirement:'Consenting partner; Basic Coordination achieved',ranking:'partnership'}
  ];
  const NPCS = {
    elira:{name:'Elira Moss', location:'crossing', profession:'Guild registrar',temperament:'precise, patient but hard to impress',goal:'keep seasonal records accurate',topic:'The guild verifies field observations. Sightings are worth more when habitat notes are sound.'},
    otto:{name:'Orrin Vale',location:'crossing',profession:'Beast provisioner',temperament:'businesslike and affectionate toward strays',goal:'source food without overharvesting',topic:'A beast accepts food when it wants to. That does not make it yours.'},
    sera:{name:'Professor Sera',location:'academy',profession:'Meridian anatomist',temperament:'incisive and cautious',goal:'prevent gate scarring among apprentices',topic:'Twelve primary, eight extraordinary, thirty-six major branches, seventy-two minor networks—and the one hundred eight gates. You must protect the network.'},
    vale:{name:'Dr Vael',location:'academy',profession:'Origin-pattern physician',temperament:'warm but professionally uncompromising',goal:'improve lineage compatibility diagnostics',topic:'Consent and compatibility come before trait seeding. Even a perfect match has a rejection window.'},
    iskra:{name:'Iskra Fen',location:'ruins',profession:'Rift surveyor',temperament:'dry-humoured and methodical',goal:'stabilise the next field reading',topic:'A weak boundary is not an invitation. We mark anchors before we cross.'}
  };
  function rand(s) { let x = s.rngState >>> 0; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; s.rngState = (x >>> 0) || 2463534242; return s.rngState / 4294967296; }
  function dice(s, sides=20) { return 1 + Math.floor(rand(s) * sides); }
  function randomFrom(s, arr){return arr[Math.floor(rand(s)*arr.length)];}
  function log(s,type,text,details=null){s.log.push({day:Math.floor(s.world.minutes/1440)+1,time:clock(s),type,text,details});if(s.log.length>90)s.log=s.log.slice(-90);}
  function clock(s){const m=s.world.minutes%1440;return `Day ${1+Math.floor(s.world.minutes/1440)}, ${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;}
  function day(s){return 1+Math.floor(s.world.minutes/1440);}
  function id(s,prefix){s.sequence++;return prefix+'_'+s.sequence;}
  // Table Rules PP costs: ranks 0..5; higher ranks require mastery trials.
  const SKILL_PP_COST={1:10,2:25,3:50,4:100,5:200};
  function skillGain(s,key,amount){
    const v=s.player.skills[key];if(!v)return;
    // Reject an invalid proposed reward before mutating any state.
    if(!Number.isInteger(amount)||amount<0||amount>10)
      throw Error('Actual independently resolved practice must award 0–10 PP');
    const sixday=Math.floor((day(s)-1)/6);
    if(v.ppPeriod!==sixday){v.ppPeriod=sixday;v.ppThisSixday=0;}
    // Period fields are reporting counters, NEVER a proficiency timer.
    // Only a genuinely resolved action calls skillGain; actual outcomes and
    // separately assessed major trials determine advancement.
    // Idling through a calendar period does not create skill points.
    const award=amount;
    v.ppThisSixday+=award; // observed this period; never an advancement ceiling
    v.xp+=award; // Legacy field name retained for save compatibility; now PP.
    while(v.rank<5){
      const next=v.rank+1,need=SKILL_PP_COST[next];
      if(v.xp<need)break;
      if(next>=4&&!v['trial_'+next]){
        if(!v.pendingTrialLogged){log(s,'progress',`${key} has enough practice for rank ${next}, but must pass a Mastery or Grand Trial.`);v.pendingTrialLogged=true;}
        break;
      }
      v.xp-=need;v.rank++;v.pendingTrialLogged=false;
      log(s,'progress',`${key} training reaches rank ${v.rank}.`);
    }
  }
  function check(s,{attribute='wis',skill='survival',dc=12,extra=0,risky=true,description='Check'}){
    const roll=dice(s,20),a=mod(s.player.attributes[attribute]||10),k=Math.min(5,s.player.skills[skill]?.rank||0)*2;
    const natural=roll===20?5:roll===1?-5:0;
    const total=roll+a+k+extra+natural; const margin=total-dc;
    const result={roll,naturalBonus:natural,total,dc,margin,degree:margin>=10?'exceptional success':margin>=5?'strong success':margin>=0?'success':margin>=-4?'setback':margin>=-9?'failure':'severe failure'};
    log(s,'roll',`${description}: d20(${roll}) + ${a} attribute + ${k} skill + ${extra} context + ${natural} natural = ${total} vs DC ${dc} (${result.degree}).`,result);
    if(risky)skillGain(s,skill,margin>=0?2:1);
    return result;
  }
  function advance(s,mins){const previousDay=day(s);s.world.minutes+=mins;for(let d=previousDay;d<day(s);d++){maturityTick(s,1);daily(s,d);}}
  function daily(s,d){
    // The legacy local bulletin cadence follows the same 365-day calendar
    // as the independent world simulation. A dated anchor, when established,
    // determines month and Hearthday; festival days have no work-sixday tick.
    const anchor=s.table?.realm?.calendarAnchor;
    const base=anchor?(anchor.date.month-1)*30+anchor.date.day:1;
    const completed=d-1-(anchor?.atCompletedDay||0);
    const cycleDay=((base+completed-1)%365+365)%365+1;
    const weekEnds=cycleDay<=360&&cycleDay%6===0;
    const monthEnds=cycleDay<=360&&cycleDay%30===0;
    s.world.marketIndex=clamp(s.world.marketIndex+(rand(s)>.5?1:-1),-3,3);
    s.world.fenPressure=clamp(s.world.fenPressure+(rand(s)>.53?1:-1),0,9);
    s.world.guildActivity=(s.world.guildActivity+1)%5;
    s.player.stamina=clamp(s.player.stamina+5,0,s.player.maxStamina);
    for(const b of Object.values(s.beasts)){if(b.ripeningWeakness && s.world.minutes>=b.ripeningWeakness.untilMinutes){b.condition=Math.min(100,(b.condition??100)+10);b.conditions=(b.conditions||[]).filter(c=>c.type!=='ripening-weakness');delete b.ripeningWeakness;log(s,'world',`The temporary ripening weakness passes for ${b.name}.`);}}
    for(const q of Object.values(s.quests))if(q.status==='active'&&d>q.deadlineDay){q.status='expired';log(s,'world',`${q.title} passed its deadline; the guild reassigned the work.`);}
    if(weekEnds){const tension=s.world.fenPressure>=6?'heightened':'manageable';s.world.politics.reedClans=tension==='heightened'?'challenging new fishing restrictions':'negotiating fishing rights';s.world.faction.naturalists+=tension==='heightened'?1:0;log(s,'world',`March Council and reed-clan delegates meet. River-rights tension is ${tension}; their decisions are not controlled by the player.`);}
    if(monthEnds)log(s,'world',`The month closes; trade agreements and faction business continue independently.`);
    if(d%3===0)log(s,'world',`The market bulletin reports ${s.world.marketIndex>0?'rising':'stable or easing'} prices; wetland pressure is ${s.world.fenPressure}/9.`);
  }
  function beast(s,speciesKey,opts={}){
    const def=SPECIES[speciesKey];if(!def)throw Error('Unknown species '+speciesKey);
    const level=opts.level||1; const b={id:id(s,'beast'),name:opts.name||def.name,species:speciesKey,sex:'unrecorded',age:'young adult',appearance:`Typical ${def.name.toLowerCase()} with distinctive pale flecks.`,level,xp:0,speciesGrade:def.grade,individualGrade:opts.grade||def.grade,evolutionStage:'Base',lineage:def.lineage,lineageQuality:55+Math.floor(rand(s)*31),potential:{growth:40+Math.floor(rand(s)*50),evolution:40+Math.floor(rand(s)*50),intelligence:30+Math.floor(rand(s)*60),bondCompatibility:35+Math.floor(rand(s)*60),adaptability:35+Math.floor(rand(s)*60)},hp:def.hp+(level-1)*5,maxHp:def.hp+(level-1)*5,energy:def.energy,maxEnergy:def.energy,trust:opts.trust??12,respect:opts.respect??8,communication:opts.communication??9,resonance:opts.resonance??32,coordination:opts.coordination??4,consent:opts.consent||false,relationship:opts.relationship||'wild',syncStage:0,syncPractice:0,needs:{hunger:10,fatigue:0},mood:opts.mood||def.temperament,injuries:[],techniques:[def.ability.name],habitatExposure:{},bondHistory:[],memory:[],owner:null,branchMaturity:{},ripeningBySeason:{},patternEchoByStage:{},condition:100};s.beasts[b.id]=b;return b;
  }
  // Roll initial identity independently of the simulation RNG.
  // The same seed gives the same starting character without consuming in-game dice.
  function randomCharacter(seed){
    let x=(Number(seed)>>>0)||271828183;
    function pick(items){ x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return items[(x>>>0)%items.length]; }
    const given=pick(['Aerin','Bran','Cerys','Dara','Eris','Fen','Iona','Kael','Liora','Maren','Neris','Orin','Rhea','Sable','Tarin','Vale','Wren','Ysolde']);
    const family=pick(['Ash','Briar','Dawn','Fen','Graves','Hollow','Marsh','Reed','Stone','Thorne','Vale','Wick']);
    return {seed:(Number(seed)>>>0)||271828183,name:given+' '+family,
      age:18+((x>>>0)%24),
      background:pick(['apprentice','fieldworker','scholar','healer']),
      path:pick(['undecided','meridian','arcane','origin','partner']),randomStart:true,
      family: {household:pick(['two guardians','single guardian','extended family','independent household','foster household']),siblings:pick([0,1,2,3]),ties:pick(['close and supportive','cordial but distant','complicated','estranged','in regular correspondence']),homeTrade:pick(['ferrymen','farmers','guild clerks','market traders','beast handlers','craftspeople'])}};
  }
  function newGame(options={}){
    const seed=(Number(options.seed)>>>0)||271828183;
    const path=String(options.path||'undecided').toLowerCase();
    const background=String(options.background||'apprentice').toLowerCase();
    const s={schemaVersion:1,engineVersion:VERSION,seed,rngState:seed,sequence:0,log:[],world:{minutes:8*60,location:'crossing',marketIndex:0,fenPressure:3,guildActivity:0,faction:{naturalists:0,academy:0,wardens:0},seen:{},politics:{marchCouncil:'stable',reedClans:'negotiating fishing rights'},season:{dayLength:28,competitionCycle:7},weather:'cool, with drifting mist'},player:{name:(options.name||'Wanderer').trim().slice(0,40),age:options.age??19,background,path,health:64,maxHealth:64,stamina:52,maxStamina:52,mana:24,maxMana:24,qi:14,maxQi:14,coins:85,attributes:{str:11,dex:12,con:11,int:13,wis:13,cha:11},skills:{survival:{rank:1,xp:0},beastcraft:{rank:1,xp:0},diplomacy:{rank:1,xp:0},cultivation:{rank:0,xp:0},arcana:{rank:0,xp:0},medicine:{rank:0,xp:0},crafting:{rank:0,xp:0},combat:{rank:0,xp:0},research:{rank:0,xp:0}},humanEvolution:{stage:0,stability:100,traits:[],progress:0},meridian:{stage:0,gates:[],foundation:0,awareness:0,dantianDensity:0,stability:95,discipline:'unawakened'},arcane:{circles:0,coreStability:90,insight:0,geometry:'none',field:false},soul:{phase:0,insight:0,stability:95},body:{cycles:[],practice:0},rift:{step:0,insight:0,anchors:[]},origin:{phase:0,load:0,capacity:3,stableTraits:[],candidate:null,rejectionRisk:0},inventory:{clean_rations:2,healing_balm:1},qualifications:[],reputation:{guild:0,academy:0,local:0},rankings:{fieldwork:0,meridian:0,arcane:0,partnership:0},competitionRecord:[],partnerIds:[],conditions:[],injuries:[]},beasts:{},questCatalog:copy(QUESTS),quests:{},npcMemory:{},sightings:[],encounter:null,battle:null,flags:{visited:{crossing:true},readIntro:false,freeSourceSample:false}};
    if(path==='meridian'){s.player.meridian.foundation=20;s.player.skills.cultivation.rank=1;s.player.meridian.discipline='foundation student';}
    if(path==='arcane'){s.player.arcane.insight=15;s.player.skills.arcana.rank=1;s.player.arcane.geometry='core blueprint';}
    if(path==='origin'){s.player.origin.capacity=4;s.player.skills.medicine.rank=1;}
    if(background==='fieldworker'){s.player.skills.survival.rank++;s.player.inventory.marsh_reed=2;}
    if(background==='scholar'){s.player.skills.research.rank++;s.player.attributes.int++;}
    if(background==='healer'){s.player.skills.medicine.rank++;s.player.inventory.healing_balm++;}
    if(path==='partner'){
      const b=beast(s,'fenfox',{name:options.beastName||'Wisp',level:2,trust:69,respect:56,communication:54,resonance:58,coordination:45,consent:true,relationship:'mutual partner'});
      b.syncStage=1;b.owner=s.player.name;s.player.partnerIds.push(b.id);b.bondHistory.push('Years of careful partnership prior to Day 1.');
    }
    log(s,'story',`You arrive at Morrowfen Crossing, a trade town where beastkind shape everyday life. You are not expected by prophecy or handed a legendary companion.`);
    log(s,'story',`Guild registrar Elira Moss has pinned three ordinary contracts to the public board. A lanternfen fox watches the traffic from a distant roof.`);
    if(options.randomStart){
      s.player.family=options.family||randomCharacter(seed).family;
      const hooks=[
        'A damp field notice asks for volunteers to survey a damaged reed bank. Nobody has signed it yet.',
        'An argument breaks out over the price of marsh lantern oil, and the market clerk begins taking statements.',
        'A courier drops a sealed survey packet near the bridge. Its owner has not noticed.',
        'A travelling healer asks the guild for help locating a nonviolent beast-habitat passage.',
        'A survey bell sounds from the forest route: officials are checking the bridge, not declaring an emergency.',
        'A family of canal boatmen debates whether to hire a guide before the evening mist.'
      ];
      s.flags.openingHook=randomFrom(s,hooks);
      log(s,'world',s.flags.openingHook);
    }
    return integrateState(s);
  }
  function localPlace(s,id=s.world.location){
    return LOCATIONS[id]||require('./world/lived-places').location(s,id);
  }
  function travel(s,target){
    if(s.battle)return fail(s,'You cannot travel mid-combat; retreat or resolve it first.');
    if(s.encounter)return fail(s,'Resolve or leave the nearby beast encounter before travelling.');
    target=resolveLocation(target);const here=LOCATIONS[s.world.location];
    if(!here)return fail(s,'Newly established places require the GM-judged world.travelTo operation; no legacy route or free transfer is implied.');
    if(!target||!here.exits.includes(target))return fail(s,`Travel must follow a linked route. From here: ${here.exits.map(x=>LOCATIONS[x].name).join(', ')}.`);
    const old=s.world.location;s.world.location=target;s.flags.visited[target]=true;advance(s, target==='ruins'?145:75);
    s.player.stamina=clamp(s.player.stamina-4,0,s.player.maxStamina);
    log(s,'travel',`You travel from ${LOCATIONS[old].name} to ${LOCATIONS[target].name}. ${LOCATIONS[target].description}`);
    for(const q of Object.values(s.quests))if(q.status==='active'&&q.metric==='visit_ruins'&&target==='ruins'){q.progress=1;log(s,'quest','Riftglass Watch: field observations recorded, ready for guild submission.');}
    return success(s);
  }
  function fail(s,message){log(s,'notice',message);return {ok:false,message,state:s};}
  function success(s,message){if(message)log(s,'story',message);return {ok:true,message:message||'',state:s};}
  function resolveLocation(text){const t=String(text||'').toLowerCase().trim();return (LOCATIONS[t]?t:null)||Object.keys(LOCATIONS).find(k=>LOCATIONS[k].name.toLowerCase()===t)||(()=>{const matches=Object.keys(LOCATIONS).filter(k=>LOCATIONS[k].name.toLowerCase().includes(t));return matches.length===1?matches[0]:null;})();}
  function observe(s){
    if(!s.encounter)return fail(s,'No beast is currently nearby. Explore a habitat first.');
    const b=s.beasts[s.encounter.beastId];const sp=SPECIES[b.species];
    advance(s,5);s.encounter.observed=true;
    const checkResult=check(s,{attribute:'wis',skill:'beastcraft',dc:10,description:'Noninvasive beast observation'});
    if(checkResult.margin>=0){if(!s.sightings.some(x=>x.beastId===b.id))s.sightings.push({day:day(s),location:s.world.location,species:b.species,beastId:b.id});
      for(const q of Object.values(s.quests))if(q.status==='active'&&q.metric==='sightings')q.progress=clamp(s.sightings.length,0,q.target);
      log(s,'beast',`You identify a ${sp.name}: ${sp.role}, ${sp.diet}, ${sp.affinity}-affinity. Its posture reads ${b.mood}.`);
    } else log(s,'beast',`It is difficult to distinguish the creature's markings. You keep a respectful distance.`);
    return success(s);
  }
  function explore(s){
    if(s.battle)return fail(s,'Finish the combat before exploring.');
    if(s.encounter)return fail(s,'A nearby beast still has your attention. Observe, approach, or leave.');
    const site=LOCATIONS[s.world.location];if(!site.spawns.length)return fail(s,'This is a settled area. Travel to a habitat to observe wild beasts.');
    advance(s,40);s.player.stamina=clamp(s.player.stamina-5,0,s.player.maxStamina);
    // An actually born, independently living youngster may be met through
    // ordinary exploration. It is not created by the player's request and
    // never implies a bond, knowledge of its parents or automatic capture.
    const born=Object.values(s.beasts).filter(b=>b.wildBirth?.origin==='independent-mammal-birth-v1'&&
      b.wildBirth.source?.beastId===b.id&&
      b.wildBirth.source?.species===b.species&&
      b.individualLife?.source?.origin==='independent-mammal-birth-v1'&&
      b.individualLife.witnessed?.length===0&&
      b.away===true&&b.location===s.world.location&&
      site.spawns.includes(b.species)&&b.owner===null&&
      b.relationship==='wild'&&b.condition>=35);
    const returning=born.length&&rand(s)<.22;
    const b=returning?born[Math.floor(rand(s)*born.length)]:
      beast(s,randomFrom(s,site.spawns),{level:1+Math.floor(rand(s)*3)});
    const k=b.species;
    b.habitatExposure[s.world.location]=1;
    const danger=rand(s),mood=danger>.82?'agitated':danger>.63?'wary':SPECIES[k].temperament;
    b.mood=mood;b.away=false;b.location=s.world.location;
    // Independently generate a concrete separation in the actual encounter.
    // Distances are not user-provided, and a Phase I 10 m soul sense must
    // never treat an arbitrary whole forest or city as within range.
    const distanceMetres=2+Math.floor(rand(s)*16);
    s.encounter={beastId:b.id,observed:false,approaches:0,threat:danger>.82,distanceMetres};
    log(s,'encounter',`You find a wild ${SPECIES[k].name} near ${site.name}. It appears ${mood}. It has not agreed to approach or partner with you.`,{beastId:b.id,species:k,location:s.world.location,mood,distanceMetres,
      independentlyBorn:!!returning,origin:'engine-local-wildlife-encounter'});
    return success(s);
  }
  function forage(s){
    if(s.encounter||s.battle)return fail(s,'Finish the active encounter first.');
    const biome=LOCATIONS[s.world.location].biome;if(biome==='settlement')return fail(s,'Foraging is not permitted in town without an assigned plot.');
    advance(s,55);s.player.stamina=clamp(s.player.stamina-7,0,s.player.maxStamina);
    const r=check(s,{attribute:'wis',skill:'survival',dc:biome==='ruins'?17:12,description:'Sustainable foraging'});
    if(r.margin<0)return success(s,'You find signs of fragile growth but take nothing; damaging the habitat is not worth it.');
    const type=biome==='fen'?'moss_crystal':biome==='hills'?'ironbloom':biome==='forest'?'sun_shard':'marsh_reed';
    const amount=r.margin>=10?2:1;s.player.inventory[type]=(s.player.inventory[type]||0)+amount;
    if(biome==='fen')s.world.fenPressure=clamp(s.world.fenPressure+amount,0,9);
    return success(s,`You collect ${amount} ${RESOURCES[type].name} through careful fieldwork.`);
  }
  function approach(s,kind='soft'){
    if(!s.encounter)return fail(s,'There is no unpartnered beast in reach.');
    const b=s.beasts[s.encounter.beastId];
    const dc=s.encounter.threat?18:12;
    advance(s,12);const r=check(s,{attribute:'cha',skill:'beastcraft',dc,extra:kind==='food'?2:0,description:'Respectful approach'});
    s.encounter.approaches++;
    if(kind==='food'){
      if(!take(s,'clean_rations',1))return fail(s,'No clean rations available.');
      b.needs.hunger=clamp(b.needs.hunger-30,0,100);
    }
    if(r.margin>=0){b.trust=clamp(b.trust+(kind==='food'?14:10)+Math.floor(r.margin/3),0,100);b.respect=clamp(b.respect+3,0,100);if(SPECIES[b.species].intelligence==='sapient')b.communication=clamp(b.communication+6,0,100);b.mood='attentive';s.encounter.threat=false;log(s,'beast',`${b.name} stays nearby voluntarily. Trust ${b.trust}/100; it has not promised companionship.`);}
    else {b.trust=clamp(b.trust-4,0,100);b.mood='uneasy';if(r.margin<=-8)s.encounter.threat=true;log(s,'beast',`${b.name} edges away. Pressuring it would worsen the situation.`);}
    return success(s);
  }
  function invite(s){
    if(!s.encounter)return fail(s,'There is no beast to invite.');
    const b=s.beasts[s.encounter.beastId];const sp=SPECIES[b.species];
    if(s.player.partnerIds.length>=3)return fail(s,'You already have three active partners in this prototype. Negotiate support roles before another commitment.');
    if(b.trust<55||b.respect<15)return fail(s,`${b.name} has insufficient trust or respect for a partnership discussion (needs trust 55 and respect 15).`);
    if(sp.intelligence==='sapient'&&b.communication<35)return fail(s,'Meaningful communication is required to negotiate terms with this sapient beast.');
    const r=check(s,{attribute:'cha',skill:'diplomacy',dc:12,extra:Math.floor((b.trust-55)/10),description:'Voluntary partnership offer'});
    advance(s,30);
    if(r.margin<0){b.trust=clamp(b.trust-3,0,100);return success(s,`${b.name} refuses the offer for now. Respecting that decision avoids a forced contract.`);}
    b.consent=true;b.relationship='mutual partner';b.owner=s.player.name;b.syncStage=0;b.trust=clamp(b.trust+9,0,100);b.bondHistory.push(`Day ${day(s)}: accepted a voluntary partnership after negotiation.`);
    s.player.partnerIds.push(b.id);s.encounter=null;
    return success(s,`${b.name} agrees to travel with you, with a reciprocal right to refuse tasks. A partnership begins; synchronisation is still untrained.`);
  }
  function leave(s){if(s.battle)return fail(s,'Use retreat during combat.');if(!s.encounter)return fail(s,'There is no active encounter.');const b=s.beasts[s.encounter.beastId];advance(s,5);s.encounter=null;return success(s,`You leave ${b.name} undisturbed.`);}
  function take(s,key,n){if((s.player.inventory[key]||0)<n)return false;s.player.inventory[key]-=n;if(s.player.inventory[key]===0)delete s.player.inventory[key];return true;}
  function buy(s,key,count=1){if(s.world.location!=='crossing')return fail(s,'The provisioner trades at Morrowfen Crossing.');if(!RESOURCES[key])return fail(s,'The provisioner does not stock that item.');const cost=Math.max(1,(RESOURCES[key].value+s.world.marketIndex*2))*count;if(s.player.coins<cost)return fail(s,`You need ${cost} Talons; currently ${s.player.coins}.`);s.player.coins-=cost;s.player.inventory[key]=(s.player.inventory[key]||0)+count;advance(s,10);return success(s,`Purchased ${count} ${RESOURCES[key].name} for ${cost} Talons.`);}
  function rest(s){if(s.battle||s.encounter)return fail(s,'Rest after resolving your immediate situation.');advance(s,8*60);s.player.health=clamp(s.player.health+24,0,s.player.maxHealth);s.player.stamina=s.player.maxStamina;s.player.qi=clamp(s.player.qi+10,0,s.player.maxQi);s.player.mana=clamp(s.player.mana+12,0,s.player.maxMana);for(const id of s.player.partnerIds){const b=s.beasts[id];b.hp=clamp(b.hp+Math.floor(b.maxHp*.5),0,b.maxHp);b.energy=b.maxEnergy;b.needs.fatigue=0;}return success(s,'You spend eight hours resting; injuries settle slowly, and all partners have time to eat and recover.');}
  function heal(s){if(s.battle)return fail(s,'You cannot use the balm in the middle of a charged exchange; defend first.');if(!take(s,'healing_balm',1))return fail(s,'No healing balm in inventory.');s.player.health=clamp(s.player.health+26,0,s.player.maxHealth);advance(s,10);return success(s,'A measured dose of balm closes superficial wounds. Serious injuries still need treatment.');}
  function startQuest(s,qid){if(s.world.location!=='crossing')return fail(s,'Register field contracts at the Morrowfen guild board.');const def=QUESTS.find(x=>x.id===qid);if(!def)return fail(s,'No such contract is on the board.');if(s.quests[qid])return fail(s,'This contract is already in your ledger.');s.quests[qid]={...copy(def),status:'active',progress:0,deadlineDay:day(s)+def.deadlineDays};advance(s,10);return success(s,`Registered ${def.title}; deadline Day ${s.quests[qid].deadlineDay}.`);}
  function submitQuest(s,qid){const q=s.quests[qid];if(!q||q.status!=='active')return fail(s,'That contract is not active.');if(s.world.location!=='crossing')return fail(s,'Deliver the signed contract at the guild hall in Morrowfen Crossing.');if(q.metric==='moss_crystal'){
    if((s.player.inventory.moss_crystal||0)<q.target)return fail(s,`Still need ${q.target} moss crystals for delivery.`);
    take(s,'moss_crystal',q.target);q.progress=q.target;
  }
  if(q.progress<q.target)return fail(s,`Contract progress ${q.progress}/${q.target}; not ready for submission.`);
  q.status='complete';s.player.coins+=q.reward;s.player.reputation.guild+=4;s.world.faction.naturalists+=2;advance(s,30);return success(s,`Completed ${q.title}; the guild pays ${q.reward} Talons and records a verified contribution.`);}
  function train(s,discipline){
    if(s.battle||s.encounter)return fail(s,'Training requires a safe and settled location.');
    const k=String(discipline||'').toLowerCase().trim();const p=s.player;const isAnnex=s.world.location==='academy';
    const teaching=['arcane','soul','rift','origin'].includes(k);
    if(teaching&&!isAnnex)return fail(s,'This specialist practice requires the facilities at Lumenfall Annex.');
    if(p.stamina<8)return fail(s,'You are too fatigued to train safely. Rest first.');
    advance(s,90);p.stamina-=8;
    if(k==='meridian'){
      const m=p.meridian;const r=check(s,{attribute:'wis',skill:'cultivation',dc:10+Math.floor(m.gates.length/18),description:'Meridian practice'});
      const gain=4+(r.margin>=0?5:1);if(m.stage===0){m.foundation+=gain;if(m.foundation>=40){m.stage=1;log(s,'progress','Foundation Tempering complete. Meridian Awakening is available through deliberate sensing practice.');}}
      else if(m.stage===1){m.awareness+=gain;if(m.awareness>=30){m.stage=2;log(s,'progress','Twelve Primary Meridians stabilised. The 108 Gate Opening stage begins.');}}
      else if(m.stage===2){m.awareness+=gain;const threshold=20+Math.floor(m.gates.length/12)*6;
        if(m.awareness>=threshold&&m.gates.length<108){m.awareness-=threshold;const gateNumber=m.gates.length+1;
          const safe=r.margin>=0&&m.stability>=55;if(safe){m.gates.push({number:gateNumber,quality:clamp(65+Math.floor(r.margin/2),55,100),scarred:false});p.maxQi+=1;p.qi=clamp(p.qi+1,0,p.maxQi);log(s,'progress',`Meridian Gate ${gateNumber}/108 opened safely (${gateNumber<=36?'Lower':gateNumber<=72?'Middle':'High'} band).`);}
          else {m.stability=clamp(m.stability-5,0,100);p.health=clamp(p.health-2,0,p.maxHealth);log(s,'injury',`The circulation pressure cannot open Gate ${gateNumber} safely. Meridian stability drops to ${m.stability}.`);}
          if(m.gates.length===108){m.stage=3;log(s,'progress','108 gates opened; Dantian Sea Formation becomes the next distinct breakthrough.');}
        }
      } else {m.dantianDensity+=gain;if(m.dantianDensity>=70&&m.stage<8){m.stage++;m.dantianDensity=0;log(s,'progress',`Meridian stage advances to ${MERIDIAN_STAGES[m.stage]}.`);}}
      p.qi=clamp(p.qi-2,0,p.maxQi);return success(s,`Meridian training concludes. Stage: ${MERIDIAN_STAGES[m.stage]}, gates ${m.gates.length}/108, stability ${m.stability}.`);
    }
    if(k==='arcane'){
      const a=p.arcane;const r=check(s,{attribute:'int',skill:'arcana',dc:12+a.circles*2,description:'Circle matrix engineering'});a.insight+=3+(r.margin>=0?6:1);
      const req=25+a.circles*15;
      if(a.insight>=req&&a.circles<9){if(a.coreStability<65)return success(s,'Your calculations are ready, but the Mana Core is too unstable to construct another circle.');a.insight-=req;a.circles++;a.geometry=['none','ignition spiral','dual-channel braid','triangular matrix','dynamic helix','field lattice','living lattice','astral geometry','bounded law lattice','world circuit'][a.circles];p.maxMana+=7;p.mana=clamp(p.mana+7,0,p.maxMana);log(s,'progress',`Arcane Circle ${a.circles}/9 constructed, with redesigned matrix geometry.`);}
      a.coreStability=clamp(a.coreStability+(r.margin>=0?1:-2),0,100);return success(s,`Arcane study: ${a.circles} circles, insight ${a.insight}/${25+a.circles*15}, core stability ${a.coreStability}.`);
    }
    if(k==='soul'){const q=p.soul;const r=check(s,{attribute:'wis',skill:'research',dc:13+q.phase*2,description:'Soul resonance study'});q.insight+=r.margin>=0?9:3;if(q.insight>=35+q.phase*15&&q.phase<7){q.insight=0;q.phase++;log(s,'progress',`Soul development: ${SOUL_PHASES[q.phase]}.`);}return success(s,`Soul phase ${SOUL_PHASES[q.phase]}, stability ${q.stability}.`);}
    if(k==='body'){const b=p.body;const r=check(s,{attribute:'con',skill:'survival',dc:12+b.cycles.length,description:'Physique refinement'});b.practice+=r.margin>=0?9:4;if(b.practice>=28+b.cycles.length*12&&b.cycles.length<7){b.practice=0;b.cycles.push(BODY_CYCLES[b.cycles.length]);p.maxHealth+=6;log(s,'progress',`Completed ${b.cycles[b.cycles.length-1]} refinement cycle.`);}return success(s,`Body refinement cycles ${b.cycles.length}/7, progress ${b.practice}.`);}
    if(k==='rift'){const r=p.rift;if(!s.flags.visited.ruins)return fail(s,'Map a rift anomaly before studying dimensional mechanics.');const test=check(s,{attribute:'int',skill:'research',dc:15+r.step*2,description:'Rift boundary analysis'});r.insight+=test.margin>=0?8:3;if(r.insight>=35+r.step*16&&r.step<8){r.insight=0;r.step++;log(s,'progress',`Rift practice: ${RIFT_STEPS[r.step]}.`);}return success(s,`Rift discipline ${RIFT_STEPS[r.step]}.`);}
    if(k==='beast'||k==='bond'){
      if(p.partnerIds.length===0)return fail(s,'Shared training requires at least one willing partner.');
      const b=s.beasts[p.partnerIds[0]];if(!b.consent)return fail(s,`${b.name} has not agreed to shared practice.`);
      const r=check(s,{attribute:'wis',skill:'beastcraft',dc:12+b.syncStage*2,description:'Reciprocal beast training'});
      const gain=r.margin>=0?9:3;b.syncPractice+=gain;b.trust=clamp(b.trust+2,0,100);b.communication=clamp(b.communication+4,0,100);b.coordination=clamp(b.coordination+4,0,100);b.resonance=clamp(b.resonance+2,0,100);b.xp+=5;b.needs.fatigue+=9;
      const required=32+b.syncStage*14;
      const capable=b.trust>=40+b.syncStage*4&&b.communication>=20+b.syncStage*5&&b.coordination>=20+b.syncStage*5&&b.resonance>=30+b.syncStage*4;
      if(b.syncPractice>=required&&b.syncStage<10&&capable){b.syncPractice=0;b.syncStage++;log(s,'progress',`${b.name} and ${p.name} reach ${SYNCHRONISATION[b.syncStage-1]}. Both participants improved through shared training.`);}
      progressBeast(s,b);return success(s,`Shared training: trust ${b.trust}, communication ${b.communication}, coordination ${b.coordination}; synchronisation ${b.syncStage}/10.`);
    }
    if(k==='origin')return originPractice(s);
    return fail(s,'Practice one of: meridian, arcane, soul, body, rift, origin, beast.');
  }
  function progressBeast(s,b){const threshold=15+b.level*9+(b.species==='fenfox'?0:4);if(b.xp>=threshold&&b.level<80){b.xp-=threshold;b.level++;b.maxHp+=5;b.hp=clamp(b.hp+5,0,b.maxHp);b.maxEnergy+=3;b.energy+=3;log(s,'progress',`${b.name} develops to species level ${b.level}, independent of human cultivation.`);}}
  function evolveHuman(s){
    if(s.battle||s.encounter)return fail(s,'Evolution requires a safe clinical environment, not immediate danger.');
    if(s.world.location!=='academy')return fail(s,'A safe human evolution attempt requires Lumenfall Annex medical supervision.');
    const p=s.player,h=p.humanEvolution,n=h.stage;
    if(n>=2)return fail(s,'The prototype implements Baseline → Awakened → Refined. Later, personalised forms require an expanded evolution design.');
    const evidence=n===0?(p.meridian.gates.length>=1||p.arcane.circles>=1||p.body.cycles.length>=1||p.soul.phase>=1||p.origin.stableTraits.length>=1):
      (p.meridian.gates.length>=18||p.arcane.circles>=3||p.body.cycles.length>=3||p.origin.stableTraits.length>=2);
    if(!evidence)return fail(s,`Human evolution to ${STAGES[n+1]} requires independently demonstrated physiological change: ${n===0?'one opened Gate, one Arcane Circle, a body refinement cycle, Soul Perception or a stable Origin trait':'18 Gates, 3 Arcane Circles, 3 complete body cycles or 2 stable Origin traits'}.`);
    if(p.health<p.maxHealth*.75||h.stability<65)return fail(s,'Recovery and evolutionary stability must be sufficient for safe transformation.');
    if(!take(s,'moss_crystal',1))return fail(s,'The clinical transformation requires one Moss Crystal for stabilisation.');
    advance(s,300);const r=check(s,{attribute:'con',skill:'medicine',dc:12+n*5,extra:Math.floor(h.stability/30),description:'Deliberate human evolutionary transition'});
    if(r.margin<0){h.stability=clamp(h.stability-7,0,100);p.health=clamp(p.health-6,1,p.maxHealth);return success(s,`The attempt cannot safely complete. It is paused at stability ${h.stability}; the preparatory material is spent.`);}
    h.stage++;h.stability=clamp(h.stability-3,0,100);p.maxHealth+=10;p.maxStamina+=5;
    return success(s,`After supervised adaptation, your human evolutionary stage becomes ${STAGES[h.stage]}. This is a biological transformation separate from every discipline rank.`);
  }
  function evolve(s){
    if(s.battle||s.encounter)return fail(s,'Evolution must be considered outside an immediate threat.');
    if(!s.player.partnerIds.length)return fail(s,'No partnered beast available; wild beasts follow their own choices.');
    const b=s.beasts[s.player.partnerIds[0]],old=SPECIES[b.species];const possibilities=old.evolutions;
    if(!possibilities.length)return fail(s,`${b.name} has no catalogued next branch at this stage; researchers may discover more later.`);
    const activeBranches=branchesFor(s,b).filter(x=>!x.hidden||x.documented);
    if(!activeBranches.length)return fail(s,`No documented branch is known for ${b.name}. Study myths and lineages first.`);
    const available=possibilities.filter(x=>{const status=activeBranches.find(z=>z.to===x.to);return status&&status.potentialOK&&b.level>=x.level&&b.trust>=x.trust&&status.maturity>=status.requiredMaturity;});
    if(!available.length)return fail(s,`Evolution readiness for ${b.name}: ${activeBranches.map(x=>`${x.name}, ${x.maturity.toFixed(2)}/${x.requiredMaturity} maturity years; ${x.potentialOK?'potential compatible':'potential-gated'}`).join(' OR ')}. Use branches for all requirements.`);
    const e=available.find(x=>s.world.location===x.environment&&(s.player.inventory[x.resource]||0)>=1);
    if(!e)return fail(s,`Evolution needs a suitable environment and resource: ${available.map(x=>`${LOCATIONS[x.environment]?.name||x.environment} + ${RESOURCES[x.resource].name}`).join(' or ')}.`);
    if(!b.consent||b.needs.fatigue>40)return fail(s,`${b.name} is not willing or recovered enough for an irreversible change.`);
    const branchStatus=activeBranches.find(x=>x.to===e.to);
    if(branchStatus.unknownUnmet)return fail(s,'An undiscovered special condition prevents the Origin Pattern from completing. Research may identify the missing requirement.');
    take(s,e.resource,1);advance(s,180);
    const r=check(s,{attribute:'wis',skill:'beastcraft',dc:16+(branchStatus?.knownUnmet||0)*2+(e.kind==='hidden'&&!branchStatus.documented?4:e.kind==='hidden'||e.kind==='rare'?2:0),extra:Math.floor(b.resonance/20)+(b.syncStage>=7?2:b.syncStage>=4?1:0)+(b.trust>=60?1:0),description:'Supported biological evolution'});
    if(r.margin<-4){b.hp=clamp(b.hp-12,1,b.maxHp);b.injuries.push('evolutionary strain');return success(s,`${b.name}'s evolution destabilises and stops without transforming. The material is spent; recovery is required.`);}
    const d=SPECIES[e.to];b.species=e.to;b.name=b.name===old.name?d.name:b.name;b.evolutionStage=d.name;b.speciesGrade=d.grade;b.lineage=d.lineage;b.maxHp+=16;b.hp+=16;b.maxEnergy+=12;b.energy+=12;b.techniques=[d.ability.name];b.mood='adapted';b.bondHistory.push(`Day ${day(s)}: chose ${d.name} evolution.`);
    const details={from:old.name,to:d.name,grade:d.grade,size:d.role,abilities:[d.ability.name],needs:[d.diet]};
    log(s,'evolution',`EVOLUTION · ${old.name} → ${d.name} · ${d.grade} · ${d.ability.name} · new needs: ${d.diet}`,details);
    return success(s,`${b.name} has evolved into ${d.name}. ${e.description} Its Origin Pattern rewrites itself in a luminous cocoon. The change brings new biology, abilities and needs.`);
  }
  function originPractice(s){
    const o=s.player.origin;const phase=o.phase;
    if(phase===0){if(!take(s,'origin_sample',1))return fail(s,'Pattern mapping requires an ethically sourced sample from the Morrowfen market.');o.candidate='Dusk-Sight adaptation';o.phase=1;return success(s,'Pattern mapping completed: Dusk-Sight adaptation, a reversible low-light sensory trait. Source provenance recorded.');}
    const r=check(s,{attribute:'int',skill:'medicine',dc:12+phase,description:`Origin integration: ${ORIGIN_STEPS[phase]}`});
    if(r.margin<0){o.rejectionRisk=clamp(o.rejectionRisk+7,0,100);if(phase===3){s.player.health=clamp(s.player.health-5,0,s.player.maxHealth);log(s,'injury','Mild rejection signs; integration paused.');}return success(s,`Stage ${ORIGIN_STEPS[phase]} could not safely advance. Rejection risk ${o.rejectionRisk}%.`);}
    if(phase===2&&o.load+1>o.capacity)return fail(s,'Biological integration load would exceed capacity.');
    if(phase===2)o.load++;
    if(phase===7){o.stableTraits.push(o.candidate);s.player.humanEvolution.traits.push(o.candidate);o.phase=0;o.candidate=null;o.rejectionRisk=0;
      if(s.player.humanEvolution.stage===0){s.player.humanEvolution.stage=1;log(s,'progress','Biological change supports Awakened Human development.');}
      return success(s,'Dusk-Sight adaptation stabilised as a uniquely human sensory trait. It consumes origin load capacity and does not copy a whole beast ability.');}
    o.phase++;return success(s,`Origin integration progresses to ${ORIGIN_STEPS[o.phase]}; biological load ${o.load}/${o.capacity}.`);
  }
  function openCombat(s){if(s.battle)return fail(s,'Combat is already underway.');if(!s.encounter)return fail(s,'There is no encountered opponent.');const b=s.beasts[s.encounter.beastId];s.battle={enemyId:b.id,round:1,playerDefending:false,range:2,terrain:LOCATIONS[s.world.location].biome,objective:'survive or peacefully disengage'};s.encounter=null;log(s,'combat',`Combat begins against a ${SPECIES[b.species].name}. Violence is not required for every encounter.`);return success(s);}
  function enemyTurn(s){const c=s.battle;if(!c)return;const b=s.beasts[c.enemyId];if(b.hp<=0)return;
    if(b.hp<=b.maxHp*.22&&rand(s)>.35){log(s,'combat',`${b.name} flees rather than fight to the death.`);s.battle=null;return;}
    const sp=SPECIES[b.species];const roll=dice(s),attack=roll+sp.attack+Math.floor(b.level/3),dc=11+mod(s.player.attributes.dex)+(c.playerDefending?4:0);
    if(attack>=dc){let damage=3+dice(s,5)+Math.floor(b.level/2);if(c.playerDefending)damage=Math.ceil(damage/2);s.player.health=clamp(s.player.health-damage,0,s.player.maxHealth);log(s,'combat',`${b.name} attacks: d20(${roll}) + ${sp.attack} vs guard ${dc}, causing ${damage} damage.`);}
    else log(s,'combat',`${b.name} attacks: d20(${roll}) + ${sp.attack} vs guard ${dc}, misses.`);
    if(s.player.health<=0){s.player.health=12;s.player.coins=Math.max(0,s.player.coins-10);s.world.location='crossing';s.player.injuries.push('recent concussion');s.battle=null;advance(s,300);log(s,'injury','Rescuers bring you to Morrowfen infirmary. You survive, with injury and a treatment fee.');}
    else {c.round++;c.playerDefending=false;}
  }
  function playerCombat(s,action){if(!s.battle)return fail(s,'You are not in combat.');const c=s.battle,b=s.beasts[c.enemyId];if(!b)return fail(s,'The opponent record is unavailable.');
    let attacked=false;
    if(action==='retreat'){
      const r=check(s,{attribute:'dex',skill:'survival',dc:12+b.level,description:'Tactical retreat'});advance(s,2);
      if(r.margin>=0){s.battle=null;return success(s,`You disengage without forcing further conflict. ${b.name} keeps its territory.`);}enemyTurn(s);return success(s,'Retreat attempt fails; the beast presses the advantage.');
    }
    if(action==='defend'){c.playerDefending=true;log(s,'combat','You take cover, improve your guard and reduce incoming harm.');}
    else if(action==='soothe'){
      const r=check(s,{attribute:'cha',skill:'beastcraft',dc:16+(b.hp<b.maxHp?2:0),description:'De-escalation under threat'});
      if(r.margin>=0){s.battle=null;b.trust=clamp(b.trust+1,0,100);return success(s,`${b.name} backs away, allowing both sides to withdraw.`);}log(s,'combat','The creature remains frightened and does not disengage yet.');
    }
    else if(action==='qi strike'){
      if(s.player.meridian.stage<2||s.player.meridian.gates.length<1)return fail(s,'A controlled Qi strike requires at least one safely opened gate.');
      if(s.player.qi<4)return fail(s,'Insufficient Qi for a controlled strike.');s.player.qi-=4;attacked=true;
    }
    else if(action==='arcane spark'){
      if(s.player.arcane.circles<1)return fail(s,'A spell requires the First Arcane Circle; insight alone is not spellcasting.');
      if(s.player.mana<5)return fail(s,'Insufficient mana.');s.player.mana-=5;attacked=true;
    }
    else if(action==='attack'){attacked=true;s.player.stamina=clamp(s.player.stamina-4,0,s.player.maxStamina);}
    else return fail(s,'Combat actions: attack, defend, soothe, retreat, qi strike, arcane spark.');
    if(attacked){
      const roll=dice(s),bonus=mod(s.player.attributes.dex)+(s.player.skills.combat?.rank||0)+(action==='qi strike'?4:action==='arcane spark'?3:0),dc=SPECIES[b.species].guard;
      if(roll+bonus>=dc){const damage=(action==='qi strike'?8:action==='arcane spark'?7:4)+dice(s,5);b.hp=clamp(b.hp-damage,0,b.maxHp);log(s,'combat',`${action}: d20(${roll}) + ${bonus} vs guard ${dc}; ${damage} nonlethal damage (${b.hp}/${b.maxHp}).`);}else log(s,'combat',`${action}: d20(${roll}) + ${bonus} vs guard ${dc}; misses.`);
      skillGain(s,'combat',2);
    }
    advance(s,1);
    // Independent partner action: a willing companion can assist, with its own energy and limits.
    const allies=s.player.partnerIds.map(x=>s.beasts[x]).filter(x=>x.consent&&x.hp>0&&x.energy>=3&&x.needs.fatigue<80);
    if(allies.length&&b.hp>0){const ally=allies[0];const def=SPECIES[ally.species];const droll=dice(s),total=droll+def.attack+Math.floor(ally.coordination/25);ally.energy-=3;ally.needs.fatigue+=3;if(total>=SPECIES[b.species].guard){const dmg=3+Math.floor(ally.level/2)+dice(s,4);b.hp=clamp(b.hp-dmg,0,b.maxHp);log(s,'combat',`${ally.name} chooses to assist: d20(${droll}) + ${def.attack} and coordination. ${dmg} damage.`);ally.xp+=4;progressBeast(s,ally);}else log(s,'combat',`${ally.name} assists but its attack misses.`);}
    if(b.hp<=0){s.battle=null;log(s,'combat',`${b.name} is incapacitated, not killed. You leave space for its recovery and local ecological consequences.`);s.player.reputation.local-=1;return success(s);}
    enemyTurn(s);return success(s);
  }
  function talk(s,npc){if(s.battle)return fail(s,'Conversation must wait until combat ends.');const needle=String(npc||'').toLowerCase();const cands=Object.values(NPCS).filter(n=>n.location===s.world.location);const n=cands.find(x=>x.name.toLowerCase().includes(needle)||x.profession.toLowerCase().includes(needle))||cands[0];if(!n)return fail(s,'There is no local NPC available to speak with at this moment.');advance(s,12);    s.npcMemory[n.name]=(s.npcMemory[n.name]||0)+1;addKnown(s,n.name,'Met '+s.player.name+' at '+LOCATIONS[s.world.location].name,'direct conversation');return success(s,`${n.name}, ${n.profession} (${n.temperament}), says: “${n.topic}”`);}
  function compete(s,id){
    if(s.battle||s.encounter)return fail(s,'The event organisers require participants to resolve active dangers first.');
    const e=COMPETITIONS.find(c=>c.id===String(id||'').trim());if(!e)return fail(s,'Unknown event. Try competitions for a list.');
    if(s.world.location!==e.venue)return fail(s,`This event is held at ${LOCATIONS[e.venue].name}.`);
    if(e.ranking==='meridian'&&s.player.meridian.gates.length<1)return fail(s,e.requirement);
    if(e.ranking==='arcane'&&s.player.arcane.circles<1)return fail(s,e.requirement);
    const b=e.ranking==='partnership'?s.beasts[s.player.partnerIds[0]]:null;
    if(e.ranking==='partnership'&&(!b||!b.consent||b.syncStage<1))return fail(s,e.requirement);
    if(s.player.coins<e.fee)return fail(s,`Entry fee ${e.fee} Talons. You have ${s.player.coins}.`);
    s.player.coins-=e.fee;advance(s,120);
    const r=check(s,{attribute:e.attribute,skill:e.skill,dc:e.dc,extra:b?Math.floor((b.coordination+b.communication)/45):0,description:e.name});
    const points=clamp(r.total-e.dc+10,0,30);s.player.rankings[e.ranking]+=points;
    const earned=r.margin>=0?e.reward:0;if(earned)s.player.coins+=earned;
    const result=r.margin>=10?'Distinction':r.margin>=5?'Merit':r.margin>=0?'Pass':'Unplaced';
    s.player.competitionRecord.push({event:e.id,day:day(s),result,points,score:r.total});
    if(r.margin>=0&&!s.player.qualifications.includes(e.name+' — '+result))s.player.qualifications.push(e.name+' — '+result);
    s.player.reputation.guild+=r.margin>=0?2:0;
    return success(s,`${e.name}: ${result}. Separate ${e.ranking} ranking earns ${points} season points.${earned?' Prize: '+earned+' Talons.':' No cash prize.'}`);
  }
  function craft(s,recipe){
    if(s.battle||s.encounter)return fail(s,'Use a safe workspace before crafting.');
    if(String(recipe||'').trim()!=='field_poultice')return fail(s,'Known recipe: craft field_poultice (2 Marsh Reed + 1 Clean Rations -> 1 Healing Balm).');
    if((s.player.inventory.marsh_reed||0)<2||(s.player.inventory.clean_rations||0)<1)return fail(s,'Requires 2 Marsh Reed and 1 Clean Rations.');
    advance(s,70);take(s,'marsh_reed',2);take(s,'clean_rations',1);
    const r=check(s,{attribute:'int',skill:'crafting',dc:12,description:'Field poultice preparation'});
    if(r.margin<0)return success(s,'The mixture separates. The materials are spent and the product is unsafe to use.');
    s.player.inventory.healing_balm=(s.player.inventory.healing_balm||0)+1;return success(s,'Crafted one Healing Balm with controlled ingredients and a clean field kit.');
  }
  function status(s){return {time:clock(s),location:localPlace(s).name,player:copy(s.player),partners:s.player.partnerIds.map(x=>copy(s.beasts[x])),encounter:s.encounter?copy(s.beasts[s.encounter.beastId]):null,battle:s.battle?copy(s.battle):null,quests:copy(s.quests),world:copy(s.world)};}
  function help(s){return success(s,'Commands: branches, ripening, pattern echo, research, research start Title | kind | Grade | novelty, research survey <id>, research week <id>, research fieldwork <id>, research hypothesis <id> | claim, research proof <id>, research validate <id>, knows <NPC>, hud, recap; plus look, travel <place>, explore, observe, approach, offer food, invite, leave, forage, talk <person>, guild, quest accept <id>, quest submit <id>, train meridian|arcane|soul|body|rift|origin|beast, buy <item>, craft field_poultice, competitions, compete <id>, rest, heal, evolve, evolve human, attack, defend, soothe, retreat, qi strike, arcane spark, status, inventory, help.');}
  function dispatch(s,phrase){
    if(!s||s.schemaVersion!==1)throw Error('Invalid or unsupported save state.');
    const raw=String(phrase||'').trim();const x=raw.toLowerCase();
    if(!x)return fail(s,'Enter an action. Type help for example commands.');
    if(s.table?.healthModel==='wounds-v1' && ['fight','start combat','confront','attack','defend','soothe','retreat','qi strike','arcane spark','rest','sleep','heal','use balm','invite','propose partnership','form bond','evolve','evolve partner'].includes(x))
      return fail(s,'Legacy combat, healing, partnership and automatic evolution are retired after wound migration. Use the private chat rule runner.');
    if(/^(look|where am i|scene|surroundings)$/.test(x)){
      const here=localPlace(s);
      return success(s,`${here.name}: ${here.description} ${here.exits?.length?'Routes: '+here.exits.map(k=>LOCATIONS[k]?.name||k).join(', ')+'.':'Other journeys depend on the established world and GM-adjudicated travel.'}`);
    }
    if(x==='help'||x==='commands')return help(s);
    if(x==='hud')return success(s,coreHud(s));
    if(x==='recap')return success(s,recap(s));
    if(x.startsWith('knows '))return knows(s,x.slice(6).trim());
    if(x==='branches'||x==='branch status')return branchList(s);
    if(x==='ripening')return ripening(s);
    if(x==='pattern echo')return patternEcho(s);
    if(x==='research'||x==='projects')return researchList(s);
    if(x.startsWith('research start '))return researchStart(s,raw.slice(15));
    if(x.startsWith('research survey '))return researchSurvey(s,x.slice(16));
    if(x.startsWith('research week '))return researchWeek(s,x.slice(14));
    if(x.startsWith('research fieldwork '))return researchFieldwork(s,x.slice(19));
    if(x.startsWith('research hypothesis ')){const parts=raw.slice(20).split('|');return researchHypothesis(s,(parts[0]||'').trim().toLowerCase(),(parts[1]||'').trim());}
    if(x.startsWith('research proof '))return researchProof(s,x.slice(15));
    if(x.startsWith('research validate '))return researchValidate(s,x.slice(18));
    if(x==='status'||x==='stats'||x==='character'||x==='beasts'||x==='inventory'||x==='journal')return success(s,`Status refreshed. Inspect the character, beast, inventory and journal panels.`);
    if(x.startsWith('travel ')||x.startsWith('go to ')||x.startsWith('move to '))return travel(s,raw.replace(/^(travel |go to |move to )/i,''));
    if(x==='explore'||x==='search area'||x==='look for beasts'||x==='scout')return explore(s);
    if(x==='observe'||x==='inspect beast'||x==='watch beast')return observe(s);
    if(x==='approach'||x==='approach slowly'||x==='befriend')return approach(s,'soft');
    if(x==='offer food'||x==='feed'||x==='offer rations')return approach(s,'food');
    if(x==='invite'||x==='propose partnership'||x==='form bond')return invite(s);
    if(x==='leave'||x==='leave beast')return leave(s);
    if(x==='forage'||x==='gather')return forage(s);
    if(x.startsWith('talk'))return talk(s,raw.replace(/^talk( to)?\s*/i,''));
    if(x==='guild'||x==='quest board')return success(s,`Guild board: ${QUESTS.map(q=>`${q.id} — ${q.title} (${q.reward} Talons)`).join('; ')}. Use quest accept <id>.`);
    if(x.startsWith('quest accept '))return startQuest(s,x.slice(13).trim().replace(/\s+/g,'_'));
    if(x.startsWith('quest submit '))return submitQuest(s,x.slice(13).trim().replace(/\s+/g,'_'));
    if(x.startsWith('train ')||x.startsWith('study '))return train(s,x.replace(/^(train |study )/,'').trim());
    if(x==='evolve human'||x==='human evolution')return evolveHuman(s);
    if(x==='evolve'||x==='evolve partner')return evolve(s);
    if(x==='competitions'||x==='tournaments'||x==='events')return success(s,`Events: ${COMPETITIONS.map(c=>`${c.id} — ${c.name} (${c.fee} Talons, ${LOCATIONS[c.venue].name}, ${c.requirement})`).join('; ')}. Enter with compete <id>.`);
    if(x.startsWith('compete '))return compete(s,x.slice(8).trim().replace(/\s+/g,'_'));
    if(x.startsWith('craft '))return craft(s,x.slice(6).trim().replace(/\s+/g,'_'));
    if(x==='rest'||x==='sleep')return rest(s);
    if(x==='heal'||x==='use balm')return heal(s);
    if(x.startsWith('buy ')){let key=x.slice(4).trim().replace(/\s+/g,'_');if(key==='rations')key='clean_rations';if(key==='sample')key='origin_sample';return buy(s,key);}
    if(x==='fight'||x==='start combat'||x==='confront')return openCombat(s);
    if(['attack','defend','soothe','retreat','qi strike','arcane spark'].includes(x))return playerCombat(s,x);
    return fail(s,`I could not map “${raw}” to an engine action. This offline client supports explicit commands; for unrestricted natural-language roleplay, use the project chat narrator with the same canon.`);
  }
  function verify(s){
    if(!s||s.schemaVersion!==1||!s.player||!s.world||!s.beasts)throw Error('Invalid save data.');
    if(s.player.meridian.gates.length>108||s.player.arcane.circles>9||s.player.origin.load>s.player.origin.capacity)throw Error('Save data violates progression constraints.');
    if(!localPlace(s))throw Error('Save location is invalid.');
    return true;
  }
  function exportGame(s){integrateState(s);verify(s);return JSON.stringify(s,null,2);}
  function importGame(json){const s=typeof json==='string'?JSON.parse(json):copy(json);verify(s);return integrateState(s);}
  function proceduralSpecies(seedKey){
    // Provisional, reproducible ecology-consistent field taxa, not instant fully researched beasts.
    // 12 lineages * 3 plausible habitats * 3 niches * 3 affinities * 6 morphologies
    // * 16 root names * 10 regional variants => 311,040 addressable taxon records.
    const families=[
      {name:'Vulpiridae',body:'fox',diet:'omnivore',habitats:['forest','fen','steppe'],roles:['small predator','forager','scavenger'],affinities:['mist','earth','sound']},
      {name:'Leporidae',body:'hare',diet:'herbivore',habitats:['forest','hills','steppe'],roles:['seed carrier','burrower','grazer'],affinities:['earth','light','wind']},
      {name:'Paleocervidae',body:'antlered grazer',diet:'herbivore',habitats:['fen','forest','steppe'],roles:['grazer','seed disperser','herd sentinel'],affinities:['water','earth','light']},
      {name:'Luminopteridae',body:'winged pollinator',diet:'nectar-feeder',habitats:['fen','forest','river'],roles:['pollinator','nectar feeder','canopy migrant'],affinities:['light','mist','wind']},
      {name:'Corvidae',body:'corvid',diet:'omnivore',habitats:['forest','hills','ruins'],roles:['scavenger','mimic','object retriever'],affinities:['sound','wind','light']},
      {name:'Ignisalamandridae',body:'salamander',diet:'insectivore',habitats:['hills','cavern','ruins'],roles:['insect hunter','heat recycler','crevice dweller'],affinities:['heat','earth','ash']},
      {name:'Mycophoridae',body:'fungal organism',diet:'decomposer',habitats:['forest','fen','cavern'],roles:['decomposer','root symbiont','spore spreader'],affinities:['spore','earth','mist']},
      {name:'Pelagomorpha',body:'aquatic drifter',diet:'planktivore',habitats:['coast','river','fen'],roles:['filter feeder','shoal drifter','reef cleaner'],affinities:['water','current','mist']},
      {name:'Scutobovidae',body:'armoured grazer',diet:'herbivore',habitats:['hills','steppe','forest'],roles:['grazer','soil churner','herd guardian'],affinities:['earth','heat','wind']},
      {name:'Serpentidae',body:'serpent',diet:'carnivore',habitats:['fen','forest','cavern'],roles:['ambush predator','nest guard','rodent hunter'],affinities:['mist','earth','sound']},
      {name:'Lithocoleoptera',body:'burrowing beetle',diet:'detritivore',habitats:['cavern','hills','steppe'],roles:['detritivore','soil aerator','mineral recycler'],affinities:['earth','heat','ash']},
      {name:'Umbraspiridae',body:'spirit-form',diet:'aetherivore',habitats:['ruins','cavern','forest'],roles:['boundary custodian','ambient-energy feeder','memory echo'],affinities:['sound','mist','light']}
    ];
    const tags=['dawn','dusk','amber','silver','reed','thorn','copper','glass','moss','ash','lumen','crag','hollow','cloud','ember','stone'];
    const regional=['lowland','upland','riverborn','salt-edge','winter','spring','nocturnal','dayward','old-growth','migrant'];
    const morphs=['long-tailed','ridge-backed','small-horned','glass-eyed','silken','broad-footed'];
    let n=typeof seedKey==='string'?([...seedKey].reduce((a,c)=>(Math.imul(a,31)+c.charCodeAt(0))>>>0,0)):(Number(seedKey)>>>0);
    const f=families[n%families.length];n=Math.floor(n/families.length);
    const role=f.roles[n%3];n=Math.floor(n/3);
    const habitat=f.habitats[n%3];n=Math.floor(n/3);
    const element=f.affinities[n%3];n=Math.floor(n/3);
    const morphology=morphs[n%6];n=Math.floor(n/6);
    const tag=tags[n%16];n=Math.floor(n/16);
    const variant=regional[n%10];
    return {taxonomy:{family:f.name,bodyPlan:f.body,species:`${tag}-${morphology}-${role.replaceAll(' ','-')}`,variant},name:`${tag[0].toUpperCase()+tag.slice(1)} ${f.body}`,habitat,affinity:element,ecology:{diet:f.diet,niche:role,behaviour:`${morphology}, locally adapted to ${habitat}`,region:variant},abilities:[`Provisional ${element} adaptation`],grade:'Unassessed',levelSystem:'species-specific; research required',evolutionPaths:'not yet studied',dataQuality:'generated field hypothesis requiring in-world verification'};
  }

  // === Source-informed additions, November 2026. ===
  // Implements a bounded playable subset of the house rules. Full Python file-18
  // engine is a separate codebase and is NOT silently emulated here.
  const RESEARCH_NOVELTY={
    rediscovery:{dc:0,base:5,ip:0,fame:5},
    variant:{dc:1,base:10,ip:0,fame:5},
    novel:{dc:3,base:20,ip:1,fame:10},
    breakthrough:{dc:6,base:40,ip:3,fame:20}
  };
  const RESEARCH_KINDS={
    medicine:'medicine',device:'crafting',rune:'arcana',formation:'arcana',
    technique:'cultivation',manual:'cultivation',architecture:'arcana',
    method:'beastcraft',evolution:'beastcraft',human_evolution:'medicine',
    lineage:'medicine',contract:'diplomacy',sync:'beastcraft',
    sacred:'research',rift:'research',discipline:'research',discovery:'research',other:'research'
  };
  const RESEARCH_COST=[0,.5,1,3,8,20,50,150,400,1000];
  const RESEARCH_COMPLICATIONS=[
    'Lab accident: an assistant or researcher suffers a Light wound.',
    'Toxic exposure: Residue rises by 2.',
    'Materials spoiled; replacements must be purchased.',
    'Test subject shows distress. Stop and address welfare before further work.',
    'Dead end: ten percent of the research track is lost.',
    'Sponsor or funding becomes uncertain.',
    'A rival starts work on the same subject.',
    'Someone attempts to copy the notes.',
    'A licensing inspection pauses the experiment.',
    'An assistant or mentor withdraws.',
    'An unethical shortcut is offered and must be refused or formally addressed.',
    'A plausible false clue appears; it is not validated.',
    'Exhaustion imposes a penalty on the next Research Week.',
    'A subject reacts unexpectedly; a new scene is needed.',
    'A related side discovery appears.',
    'A fresh line of insight emerges.',
    'A patron offers support with conditions.',
    'Serendipity provides useful observations.'
  ];
  function money(t){
    let scales=Math.round(Math.max(0,Number(t)||0)*100);
    const talons=Math.floor(scales/100);scales%=100;
    const fangs=Math.floor(scales/10);scales%=10;
    return [talons?talons+' T':'',fangs?fangs+' F':'',scales?scales+' S':''].filter(Boolean).join(' ')||'0 S';
  }
  function integrateState(s){
    s.researchProjects||={};s.documentedBranches||={};s.npcKnowledge||={};
    s.player.insightPoints??=0;s.player.fame??=0;s.player.family??=null;
    for(const b of Object.values(s.beasts)){
      b.branchMaturity||={};b.ripeningBySeason||={};b.patternEchoByStage||={};
      b.condition??=100;
    }
    return s;
  }
  function maturityRate(s,b,branch){
    const current=LOCATIONS[s.world.location];
    const vaelRich=['ruins','academy'].includes(s.world.location);
    const hasResources=(s.player.inventory[branch.resource]||0)>0;
    const sync=b.syncStage||0;
    const aligned=(b.techniques||[]).length>0&&b.level>=Math.max(1,(branch.level||1)-1);
    const documented=!!s.documentedBranches[b.species+'>'+branch.to];
    return clamp(1+(vaelRich?2:0)+(hasResources?1:0)+(sync>=6?2:sync>=3?1:0)+(aligned?1:0)+(documented?1:0),1,10);
  }
  function maturityRecord(s,b,branch){
    b.branchMaturity||={};
    const k=branch.to;
    if(!b.branchMaturity[k])b.branchMaturity[k]={years:0,required:branch.maturityYears||0};
    return b.branchMaturity[k];
  }
  function maturityTick(s,days){
    integrateState(s);
    for(const id of s.player.partnerIds){
      const b=s.beasts[id];if(!b)continue;
      const def=SPECIES[b.species];if(!def)continue;
      for(const branch of def.evolutions){
        const tr=maturityRecord(s,b,branch);
        if(tr.required>0)tr.years=Math.min(tr.required,tr.years+(days/365)*maturityRate(s,b,branch));
      }
      if(b.conditionUntil&&day(s)>b.conditionUntil){b.condition=100;delete b.conditionUntil;}
    }
  }
  function branchesFor(s,b){
    integrateState(s);
    const sp=SPECIES[b.species];if(!sp)return [];
    return sp.evolutions.map(br=>{
      const mat=maturityRecord(s,b,br),doc=!!s.documentedBranches[b.species+'>'+br.to];
      const details=[{label:'Level '+(br.level||1),met:b.level>=(br.level||1)},
        {label:'Trust '+(br.trust||0),met:b.trust>=(br.trust||0)},
        {label:'Location: '+(LOCATIONS[br.environment]?.name||br.environment),met:s.world.location===br.environment},
        {label:'Catalyst: '+(RESOURCES[br.resource]?.name||br.resource),met:(s.player.inventory[br.resource]||0)>=1},
        {label:'Maturity '+mat.years.toFixed(2)+'/'+mat.required+' years',met:mat.years>=mat.required}];
      if(br.specialConditions)details.push(...br.specialConditions.map(c=>({label:c.label,met:c.type==='technique'?b.techniques.includes(c.value):c.type==='sync'?b.syncStage>=c.value:!!c.met,sealed:!doc})));
      const neededPotential=br.potential||0;
      const ceiling=1+Math.floor((b.potential.evolution||40)/20);
      const potentialOK=neededPotential===0||ceiling>=neededPotential||(doc&&details.filter(c=>c.sealed||br.specialConditions?.some(sc=>sc.label===c.label)).every(c=>c.met));
      return {to:br.to,name:SPECIES[br.to]?.name||br.to,kind:br.kind||'common',hidden:!!br.hidden,documented:doc,
        grade:br.grade||null,requirements:details,met:details.every(c=>c.met)&&potentialOK,
        maturity:mat.years,requiredMaturity:mat.required,rate:maturityRate(s,b,br),potentialOK,
        unknownUnmet:details.some(c=>!c.met&&c.sealed),knownUnmet:details.filter(c=>!c.met&&!c.sealed).length};
    });
  }
  function branchList(s){
    const b=s.player.partnerIds.length?s.beasts[s.player.partnerIds[0]]:null;
    if(!b)return fail(s,'No partner is available to assess.');
    const list=branchesFor(s,b).filter(x=>!x.hidden||x.documented);
    if(!list.length)return success(s,`No documented routes for ${b.name}; myths and field research may reveal one.`);
    return success(s,list.map(x=>`${x.name} [${x.kind}]: maturity ${x.maturity.toFixed(2)}/${x.requiredMaturity} years (x${x.rate}); ${x.met?'window open':x.requirements.filter(r=>!r.met&&!r.sealed).map(r=>r.label).join(', ')||'special conditions unknown'}`).join(' | '));
  }
  function ripening(s){
    integrateState(s);const b=s.player.partnerIds.length&&s.beasts[s.player.partnerIds[0]];
    if(!b)return fail(s,'No partnered beast is present.');
    if(!b.consent)return fail(s,`${b.name} has not agreed to this treatment.`);
    const season=Math.floor((day(s)-1)/90);
    if(b.ripeningBySeason[season])return fail(s,'Ripening has already been used on this partner this season.');
    const branch=SPECIES[b.species].evolutions.find(br=>(br.maturityYears||0)>0);
    if(!branch)return fail(s,'No researched time-based branch is available for ripening.');
    if((s.player.inventory.ripening_fruit||0)<1)return fail(s,'You need a Vael-grove ripening fruit.');
    take(s,'ripening_fruit',1);b.ripeningBySeason[season]=true;
    const tr=maturityRecord(s,b,branch);tr.years=Math.min(tr.required,tr.years+1);
    const vigor=check(s,{attribute:'con',skill:'medicine',dc:12,risky:false,description:`${b.name} Ripening vigor test`});
    if(vigor.margin<0){b.condition=clamp(b.condition-10,0,100);b.conditionUntil=day(s)+6;}
    advance(s,30);
    return success(s,`Ripening advances ${b.name}'s ${SPECIES[branch.to].name} pattern by one maturity year.${vigor.margin<0?' Condition falls by 10 for a sixday.':''}`);
  }
  function patternEcho(s){
    integrateState(s);const b=s.player.partnerIds.length&&s.beasts[s.player.partnerIds[0]];
    if(!b||!b.consent)return fail(s,'Pattern Echo requires a consenting partner.');
    if(s.world.location!=='ruins')return fail(s,'A Pattern Echo requires a confirmed form-linked relic or sacred ruin. The prototype research site is Riftglass Outpost.');
    const branch=SPECIES[b.species].evolutions.find(x=>(x.maturityYears||0)>0);
    if(!branch)return fail(s,'There is no time-based branch on record for this partner.');
    if(b.patternEchoByStage[b.evolutionStage])return fail(s,'A Pattern Echo has already been attempted in this form.');
    const doc=!!s.documentedBranches[b.species+'>'+branch.to];
    if(!doc)return fail(s,'The relevant branch must first be documented through research.');
    b.patternEchoByStage[b.evolutionStage]=true;
    const r=check(s,{attribute:'wis',skill:'research',dc:15,description:'Form-linked Pattern Echo rite'});
    advance(s,60);
    if(r.margin<0)return success(s,'The relic gives no stable echo this stage; the rite closes without a maturity gain.');
    const gain=r.margin>=10?Math.max(5,branch.maturityYears/2):r.margin>=5?5:3;
    const tr=maturityRecord(s,b,branch);tr.years=Math.min(tr.required,tr.years+gain);
    return success(s,`A remembered form flares through ${b.name}'s Origin Pattern: +${gain.toFixed(1)} maturity years toward ${SPECIES[branch.to].name}.`);
  }
  function researchNameId(s,name){
    const slug=name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,30)||'project';
    let id=slug,n=1;while(s.researchProjects[id])id=slug+'_'+(++n);return id;
  }
  function researchProject(s,id){integrateState(s);return s.researchProjects[id.toLowerCase().trim().replace(/\s+/g,'_')];}
  function researchStart(s,info){
    integrateState(s);
    if(s.battle||s.encounter)return fail(s,'Resolve the immediate situation before proposing research.');
    const parts=info.split('|').map(x=>x.trim());
    if(parts.length!==4)return fail(s,'Use: research start Title | kind | Grade (1–9) | rediscovery/variant/novel/breakthrough.');
    const [name,kindInput,gradeInput,novelty]=parts;
    const kind=kindInput.toLowerCase().replace(/\s+/g,'_');const grade=Number(gradeInput);
    if(!name||name.length>70||!RESEARCH_KINDS[kind]||!RESEARCH_NOVELTY[novelty]||!Number.isInteger(grade)||grade<1||grade>9)
      return fail(s,'Invalid research specification. Choose an approved kind, Grade I–IX and novelty.');
    if(novelty==='rediscovery'&&s.world.location!=='ruins'&&s.sightings.length===0)return fail(s,'Rediscovery needs an actual source: visit documented ruins or record a field specimen before beginning.');
    if(kind==='evolution'&&!Object.values(SPECIES).some(d=>d.name.toLowerCase()===name.toLowerCase()||d.evolutions.some(e=>SPECIES[e.to]?.name.toLowerCase()===name.toLowerCase())))
      return fail(s,'Evolution research must name an existing known or source-supported beast form in this prototype.');
    if(['lineage','human_evolution'].includes(kind)&&s.world.location!=='academy')return fail(s,'Biological research needs a licensed, staffed facility at the Annex.');
    const rank=s.player.skills[RESEARCH_KINDS[kind]]?.rank||0;
    if(novelty==='novel'&&rank<2)return fail(s,'Novel research requires at least Trained proficiency (rank 2) in its governing skill.');
    if(novelty==='breakthrough'&&rank<4)return fail(s,'Breakthrough research requires Expert proficiency (rank 4) in its governing skill.');
    const policy=RESEARCH_NOVELTY[novelty],id=researchNameId(s,name),truthRoll=dice(s,20);
    const feasibility=truthRoll<=4?'not_as_framed':truthRoll<=14?'possible':truthRoll<=19?'catch':'better';
    const p={id,name,kind,grade,novelty,skill:RESEARCH_KINDS[kind],dc:10+2*grade+policy.dc,
      track:policy.base+5*grade,progress:0,preparation:0,ipRequired:policy.ip,fame:policy.fame,
      status:'proposed',weeks:0,fieldwork:[],milestones:[],clues:[],surveyed:false,replications:0,
      createdDay:day(s),sealed:{feasibility,requirements:[`Grade ${grade} materials or equivalent evidence`,
        `Controlled ${kind.replaceAll('_',' ')} procedure`,`Independent replication by a qualified practitioner`],falseLead:null},
      truthVersion:1};
    s.researchProjects[id]=p;
    log(s,'research',`New ${novelty} ${kind.replaceAll('_',' ')} project: ${name}. Grade ${grade}; DC ${p.dc}; track ${p.track}. Feasibility is fixed before the first study roll.`);
    return success(s,`Project ${id} created. Survey it first; evidence and correct hypotheses determine what can be proved.`);
  }
  function researchClues(s,p){
    for(const level of [25,50,75]){
      if(p.progress>=Math.ceil(p.track*level/100)&&!p.milestones.includes(level)){
        p.milestones.push(level);
        const clue=p.sealed.requirements[p.milestones.length-1]||'The practical evidence narrows the possible designs.';
        p.clues.push(clue);
        log(s,'research',`${p.name} reaches ${level}%: verified clue — ${clue}`);
      }
    }
  }
  function researchPoints(s,p,r,fieldwork=false){
    const gain=r.margin>=10?3:r.margin>=5?2:r.margin>=0?1:r.margin<=-10&&!fieldwork?-1:0;
    p.progress=clamp(p.progress+gain,0,p.track);
    if(r.roll===20){s.player.insightPoints++;log(s,'progress','A natural 20 yields +1 Insight Point.');}
    researchClues(s,p);
    if(gain<0)researchComplication(s,p);
    return gain;
  }
  function researchComplication(s,p){
    const die=dice(s,20);let line;
    if(die<=2){line=RESEARCH_COMPLICATIONS[0];s.player.health=Math.max(1,s.player.health-(p.grade>=5?10:4));}
    else if(die===3){line=RESEARCH_COMPLICATIONS[1];}
    else if(die<=5){line=RESEARCH_COMPLICATIONS[2];}
    else line=RESEARCH_COMPLICATIONS[Math.min(RESEARCH_COMPLICATIONS.length-1,die-3)];
    if(die===7)p.progress=Math.floor(p.progress*.9);
    if(die===18)s.player.insightPoints++;
    if(die===20)p.progress=Math.min(p.track,p.progress+3);
    log(s,'research',`Research complication d20(${die}): ${line}`);
    return die;
  }
  function researchSurvey(s,id){
    const p=researchProject(s,id);if(!p)return fail(s,'Unknown research project.');
    if(p.surveyed&&p.status!=='needs_source')return fail(s,'The initial survey can only be performed once.');
    if(p.status==='needs_source'&&s.world.location!=='ruins'&&s.sightings.length===0)return fail(s,'Find a new credible source before re-surveying a lost route.');
    p.surveyed=true;advance(s,60);
    const r=check(s,{attribute:'int',skill:p.skill,dc:10+2*p.grade,description:`Survey ${p.name}`});
    p.preparation=r.margin>=10?3:r.margin>=5?2:r.margin>=0?1:0;
    if(r.margin>=5)p.clues.push(p.sealed.requirements[0]);
    if(r.margin<=-10)p.sealed.falseLead='A promising unverified source may be misleading.';
    p.status=(p.novelty==='rediscovery'&&r.margin<0)?'needs_source':'researching';
    return success(s,`Survey complete: preparation +${p.preparation}.${r.margin>=5?' A true lead was found.':''}`);
  }
  function researchWeek(s,id){
    const p=researchProject(s,id);if(!p)return fail(s,'Unknown research project.');
    if(!p.surveyed||p.status!=='researching')return fail(s,'Survey an active project before research weeks.');
    if(p.progress>=p.track)return fail(s,'The track is full. Attempt Proof.');
    if(s.battle||s.encounter)return fail(s,'Resolve the immediate scene first.');
    if(p.grade>=3&&s.world.location!=='academy')return fail(s,'Grade III+ research requires at least a qualified workshop or laboratory; travel to the Annex.');
    const cost=RESEARCH_COST[p.grade];if(s.player.coins<cost)return fail(s,`Research materials cost ${money(cost)} per sixday; current purse ${money(s.player.coins)}.`);
    s.player.coins=Number((s.player.coins-cost).toFixed(2));
    const facility=s.world.location==='academy'?1:s.world.location==='crossing'?0:-1;
    const totalExtra=p.preparation+facility;
    const r=check(s,{attribute:'int',skill:p.skill,dc:p.dc,extra:totalExtra,description:`${p.name} Research Week`});
    p.weeks++;const gain=researchPoints(s,p,r);
    advance(s,6*1440);
    return success(s,`${p.name}: ${gain>=0?'+':''}${gain} research points; ${p.progress}/${p.track}; sixday ${p.weeks}.`);
  }
  function researchFieldwork(s,id){
    const p=researchProject(s,id);if(!p)return fail(s,'Unknown research project.');
    if(!p.surveyed||p.status!=='researching')return fail(s,'A surveyed active project is required.');
    const week=Math.floor((day(s)-1)/6),used=p.fieldwork.filter(x=>x.week===week);
    if(used.length>=2)return fail(s,'At most two fieldwork intervals count per sixday.');
    const evidence=s.sightings.find(x=>!p.fieldwork.some(e=>e.sightingId===x.beastId));
    if(!evidence)return fail(s,'Fieldwork requires a new, observed beast sighting. Ordinary repeating this command is not evidence.');
    if(!['evolution','discovery','method','medicine','sync'].includes(p.kind))return fail(s,'This field observation does not directly bear on the project kind.');
    const r=check(s,{attribute:'wis',skill:p.skill,dc:p.dc,extra:p.preparation,description:`Fieldwork: ${p.name}`});
    p.fieldwork.push({week,sightingId:evidence.beastId});const gain=researchPoints(s,p,r,true);
    advance(s,70);
    return success(s,`A genuine field observation contributes ${gain} research points to ${p.name}.`);
  }
  function researchHypothesis(s,id,hypothesis){
    const p=researchProject(s,id);if(!p)return fail(s,'Unknown research project.');
    if(!hypothesis||p.progress<p.track*.25)return fail(s,'State a hypothesis after reaching 25% of the project track.');
    if(p.status!=='researching')return fail(s,'This project is not in its research stage.');
    if(s.player.coins<RESEARCH_COST[p.grade])return fail(s,'A hypothesis test requires one Research Week of materials.');
    s.player.coins=Number((s.player.coins-RESEARCH_COST[p.grade]).toFixed(2));
    const r=check(s,{attribute:'int',skill:p.skill,dc:p.dc,extra:p.preparation,description:`Hypothesis test: ${p.name}`});
    advance(s,6*1440);p.weeks++;
    if(r.margin<0)return success(s,'The test is inconclusive; the hypothesis stays unproven.');
    const tokens=hypothesis.toLowerCase().split(/\W+/).filter(x=>x.length>4);
    const relevant=p.sealed.requirements.some(req=>tokens.some(t=>req.toLowerCase().includes(t)));
    if(relevant){p.progress=Math.min(p.track,p.progress+2);researchClues(s,p);return success(s,'The hypothesis is supported by this test: +2 research points.');}
    skillGain(s,p.skill,1);return success(s,'The hypothesis is refuted by the evidence; +1 practice point in the governing skill.');
  }
  function researchProof(s,id){
    const p=researchProject(s,id);if(!p)return fail(s,'Unknown research project.');
    if(p.status!=='researching'||p.progress<p.track)return fail(s,'Proof requires a complete research track.');
    if(s.player.insightPoints<p.ipRequired)return fail(s,`Proof requires ${p.ipRequired} Insight Point(s); currently ${s.player.insightPoints}.`);
    s.player.insightPoints-=p.ipRequired;
    const r=check(s,{attribute:'int',skill:p.skill,dc:p.dc,extra:p.preparation,description:`Proof: ${p.name}`});
    advance(s,6*1440);p.weeks++;
    if(r.margin<=-10){p.progress=Math.floor(p.track*.5);researchComplication(s,p);return success(s,'Proof suffered a severe accident; the project must be rebuilt.');}
    if(r.margin<=-5){p.progress=Math.floor(p.track*.75);skillGain(s,p.skill,1);return success(s,'Proof fails but reveals the error. A quarter of the track must be repeated.');}
    if(p.sealed.feasibility==='not_as_framed'){p.status='lesser_result';return success(s,`Proof shows ${p.name} cannot work as framed. A lesser related result is documented instead; research does not rewrite reality.`);}
    p.status=r.margin<0?'flawed':'proven';p.refinement=r.margin>=10?'exceptional improvement':null;
    if(r.margin>=10)s.player.insightPoints++;
    if(p.kind==='evolution'&&p.status==='proven'){
      const match=Object.entries(SPECIES).find(([key,d])=>d.name.toLowerCase()===p.name.toLowerCase());
      if(match){for(const [from,fromDef] of Object.entries(SPECIES))for(const branch of fromDef.evolutions)if(branch.to===match[0])s.documentedBranches[from+'>'+branch.to]=true;}
    }
    return success(s,p.status==='proven'?`Proof succeeds. ${p.name} is now a tested ${p.kind.replaceAll('_',' ')} result. ${p.refinement||''}`:`Proof works with a flaw; fix it with a Variant project before reliability can be assumed.`);
  }
  function researchValidate(s,id){
    const p=researchProject(s,id);if(!p)return fail(s,'Unknown research project.');
    if(!['proven','flawed','lesser_result'].includes(p.status))return fail(s,'Only a proved result can be validated.');
    if(p.status==='flawed')return fail(s,'An unreliable result must be repaired before recognition.');
    const cost=RESEARCH_COST[p.grade];if(s.player.coins<cost)return fail(s,'Each replication requires materials for one Research Week.');
    s.player.coins=Number((s.player.coins-cost).toFixed(2));
    const r=check(s,{attribute:'int',skill:p.skill,dc:Math.max(5,p.dc-2),extra:p.preparation,description:`Replication: ${p.name}`});
    advance(s,6*1440);
    if(r.margin>=0)p.replications++;
    if(p.replications>=2){p.status='recognised';s.player.fame+=p.fame;s.player.reputation.academy++;return success(s,`${p.name} is independently recognised. +${p.fame} Fame and +1 Academy standing.`);}
    return success(s,`Replication ${r.margin>=0?'accepted':'inconclusive'} (${p.replications}/2 required).`);
  }
  function researchList(s){
    integrateState(s);const ps=Object.values(s.researchProjects);
    return success(s,ps.length?ps.map(p=>`${p.id}: ${p.name} G${p.grade} ${p.novelty}, DC${p.dc}, ${p.progress}/${p.track}, ${p.status}`).join(' | '):'No research projects. Start one with research start Title | kind | Grade | novelty.');
  }
  function knows(s,name){
    integrateState(s);const names=Object.keys(NPCS).map(k=>NPCS[k].name);
    const who=names.find(n=>n.toLowerCase().includes(name.toLowerCase()));
    if(!who)return fail(s,'No known NPC by that name.');
    const facts=s.npcKnowledge[who]||[];
    return success(s,`${who}: public trade and local gossip are available; personally witnessed or told: ${facts.length?facts.map(f=>f.fact+' ['+f.source+']').join('; '):'no player-specific facts recorded'}. Sealed GM notes are not NPC knowledge.`);
  }
  function addKnown(s,name,fact,source){
    integrateState(s);const list=s.npcKnowledge[name]||(s.npcKnowledge[name]=[]);
    if(!list.some(x=>x.fact===fact))list.push({fact,source,day:day(s)});
  }
  function coreHud(s){
    integrateState(s);
    const truncate=v=>String(v).slice(0,28);
    const line=v=>'║ '+truncate(v).padEnd(30,' ')+' ║';
    const outer='╔'+'═'.repeat(32)+'╗';
    const lower='╚'+'═'.repeat(32)+'╝';
    const p=s.player;
    const focus=s.encounter?`Wild ${s.beasts[s.encounter.beastId]?.name||'beast'} nearby`:s.battle?'In combat':'Free to act';
    return [outer,line(p.name.toUpperCase()+' · '+clock(s)),line(localPlace(s).name+' · '+money(p.coins)),
      line('STA '+p.stamina+'/'+p.maxStamina+' · HP '+p.health+'/'+p.maxHealth),
      line('SOUL '+p.soul.phase+' · Qi '+p.qi+'/'+p.maxQi),line('NOW: '+focus),lower].join('\n');
  }
  function recap(s){
    integrateState(s);
    return ['CAMPAIGN: '+s.player.name+' (seed '+s.seed+')','SCENE: '+localPlace(s).name+', '+clock(s),
      'PC: '+s.player.background+', '+s.player.path+'; '+money(s.player.coins),
      'JOURNAL: '+(s.log.filter(x=>!['roll','notice'].includes(x.type)).slice(-3).map(x=>x.text).join(' | ')||'No journal entries'),
      'CURRENT: '+(s.flags.openingHook||'No opening hook')].join('\n');
  }

  return {VERSION,MERIDIAN_STAGES,SYNCHRONISATION,SOUL_PHASES,BODY_CYCLES,RIFT_STEPS,STAGES,SPECIES,LOCATIONS,RESOURCES,QUESTS,COMPETITIONS,NPCS,RESEARCH_KINDS,RESEARCH_NOVELTY,newGame,randomCharacter,dispatch,status,clock,day,advance,skillGain,exportGame,importGame,check,proceduralSpecies,money,coreHud,recap,branchesFor,integrateState};
});