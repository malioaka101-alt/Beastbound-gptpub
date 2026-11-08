'use strict';
// Creates an independent seed-reproducible campaign from the actual Beastbound
// engine. Cosmetic identity and opening scene rolls do NOT consume combat dice.
const fs=require('node:fs');
const crypto=require('node:crypto');
const E=require('../engine');
const Unified=require('../rules/unified');
const Realm=require('../world/simulation');
const Character=require('../rules/character');
const Origins=require('./campaign-origins');

// Seeded cultural-name pools: identity is independent of the opening location.
// Keep personal/family names plausible rather than automatically naming a PC
// after the nearest biome or repeating the short legacy Aerin/Marsh pools.
const GIVEN_NAMES=['Aldren','Bastian','Bennet','Caelan','Cedric','Cyran','Darric','Davin','Eamon','Edrin','Emric','Farren','Galen','Gerrit','Hadren','Hollis','Ilan','Iver','Joren','Joric','Kellan','Kerrin','Leoric','Lucan','Maddoc','Merren','Nolan','Oren','Perrin','Roric','Savin','Sethren','Tavren','Tomas','Varen','Weylan','Yoren'];
const FAMILY_NAMES=['Aldwyne','Beller','Caddis','Carrow','Dalmere','Dennet','Ellery','Farrow','Fellin','Garrick','Gell','Harker','Hollan','Kestrel','Larkin','Lennox','Maddren','Merrit','Norrin','Orwell','Pell','Rennet','Sayer','Selwick','Tollen','Varrick','Vell','Warran','Weller','Wyst'];
const RELATIVE_GIVEN=['Adela','Alys','Beren','Corvin','Della','Emmen','Etta','Fenna','Garren','Hedra','Hestin','Iona','Jerrit','Kessa','Lorra','Merren','Nessa','Orlan','Ressa','Selda','Tolan','Vera'];
const BACKGROUND_LIFE={
 apprentice:'Learned by assisting working hands and keeping track of tasks that others rarely noticed.',
 fieldworker:'Spent seasons travelling practical routes and noting where soil, water and animals changed the work.',
 scholar:'Spent years reading, copying and comparing records; much of the world remains untested outside books.',
 healer:'Worked among ordinary injuries and recovery, learning that patients rarely fit a tidy lesson.'
};
const TRADE_LIFE={
 ferrymen:'Boats and their timetables shaped the household.',
 farmers:'Planting, harvest and weather shaped the household.',
 'guild clerks':'Ledgers, public requests and working hours shaped the household.',
 'market traders':'Prices, arrivals and customers shaped the household.',
 'beast handlers':'The feeding and care of working beasts shaped the household.',
 craftspeople:'Workshop orders, tools and repairs shaped the household.'
};
function generatedIdentity(seed,base){
 // This is identity generation only. It does not consume game RNG or
 // make hidden predictions about relatives, resources or future consent.
 const u=Number(seed)>>>0;
 const h=(n)=>{let x=(u^(n*0x9e3779b9))>>>0;
  x=Math.imul(x^(x>>>16),0x7feb352d);
  x=Math.imul(x^(x>>>15),0x846ca68b);
  return (x^(x>>>16))>>>0;};
 const surname=pick(FAMILY_NAMES,h(2)),given=pick(GIVEN_NAMES,h(1));
 const family=structuredClone(base.family);
 const members=[],n=family.household==='two guardians'?2:
  family.household==='independent household'?0:1;
 for(let i=0;i<n;i++)members.push({
  relation:i===0?'guardian':'second guardian',
  name:pick(RELATIVE_GIVEN,h(10+i*7))+' '+surname
 });
 if(family.household==='extended family')members.push({
  relation:'older relative',name:pick(RELATIVE_GIVEN,h(32))+' '+surname
 });
 for(let i=0;i<family.siblings;i++){
  let person=pick(RELATIVE_GIVEN,h(50+i*11));
  if(members.some(x=>x.name===person+' '+surname))
   person=pick(RELATIVE_GIVEN,h(55+i*13));
  members.push({relation:'sibling',name:person+' '+surname});
 }
 // Do not silently assign two different known relatives the same full name.
 const seen=new Set();
 for(const member of members){
  let i=0;
  while(seen.has(member.name)&&i<RELATIVE_GIVEN.length){
   const next=pick(RELATIVE_GIVEN,(h(70+i*19)+i)%RELATIVE_GIVEN.length);
   member.name=next+' '+surname;i++;
  }
  if(seen.has(member.name))throw Error('Unable to make distinct relative names');
  seen.add(member.name);
 }
 family.members=members;
 const history={
  upbringing:TRADE_LIFE[family.homeTrade],
  earlyWork:BACKGROUND_LIFE[base.background],
  familySituation:family.household+'; '+family.ties,
  note:'These are the character’s known beginnings, not private motives, binding occupations, finances or future relationships.'
 };
 return {name:given+' '+surname,family,history};
}
const PARTNER_NAMES=['Mote','Tallow','Pip','Flicker','Cinder','Nacre','Lilt','Thimble'];
const OPENINGS=[
 {location:'crossing',hour:8,minute:15,weather:'cool canal breeze',focus:'A working river morning',
  scene:'On the Morrowfen boardwalk, ferry crews measure the water against old public marks. A ledger clerk speaks with a porter while traders arrange their stalls; nobody has yet asked you for anything.',
  hook:'A fresh public tide reading leaves local workers comparing the river against last season’s marks.'},
 {location:'forest',hour:7,minute:20,weather:'cool, with silver pollen',focus:'The copperwood waystone',
  scene:'A copper-bark waystone hums beside the trail. A pathwarden has chained a second, smaller marker to it, though the chain does not touch the earth. A winged shimmer passes above the roots, out of reach.',
  hook:'The waystone is floating a finger-width above its foundation. A pathwarden asks for witnesses, not guesses.'},
 {location:'fen',hour:6,minute:40,weather:'low mist, cool air',focus:'A bell beneath the water',
  scene:'At the Whisperfen crossing a ferrywoman is pulling her boat ashore. A bell keeps sounding from below the black water, although the shrine bell above it hangs still. She has refused two passengers.',
  hook:'An underwater bell is sounding beside a silent ferry shrine. The ferrywoman has halted crossings.'},
 {location:'hills',hour:9,minute:10,weather:'warm, with ashwind gusts',focus:'The hillside fireglow',
  scene:'On the Ashwind track, a crevice spits blue sparks into the morning wind. A ridgewalker waits beside a broken warning slate while a tiny cinderskin newt warms itself on the far side of the stone.',
  hook:'A hillside fissure is sending out blue sparks. The ridgewalker asks travellers to keep clear until the cause is known.'},
 {location:'academy',hour:8,minute:30,weather:'bright, thin cloud',focus:'The silent healing ward',
  scene:'The bell over Lumenfall Annex rings without sound. A healer presses two fingers to the warded glass and watches a hairline crack glow gold. A student waits with a stack of unused bandages.',
  hook:'A soundless bell and a cracked ward have interrupted morning lessons at Lumenfall Annex.'},
 {location:'ruins',hour:7,minute:55,weather:'cold, unsettled mist',focus:'The outpost boundary',
  scene:'At Riftglass Outpost, a containment stone sheds flakes of violet light into the dust. Two surveyors argue over the line of safe ground. Beyond the posts, the air appears to fold around a dead tree.',
  hook:'One containment stone has begun shedding violet light. Surveyors will not let anyone cross the ward line.'}
];
const pick=(arr,n)=>arr[n%arr.length];
// The campaign clock starts on an actual civil date, not an unanchored "Day 1".
// Calendar selection is deterministic from the campaign seed and uses no dice.
function startingDate(seed){
 const n=Number(seed)>>>0;
 if(!n)throw Error('A nonzero unsigned seed is required');
 return {year:1140+((n>>>6)%31),month:1+((n>>>11)%12),day:1+((n>>>17)%30)};
}
function create(options={}){
 if(!options||typeof options!=='object'||Array.isArray(options))
  throw Error('Campaign creation expects one options object');
 const {seed,slug}=options,n=Number(seed)>>>0;
 if(!n)throw Error('A nonzero unsigned seed is required');
 if(!/^[a-z0-9][a-z0-9_-]{4,79}$/.test(slug||''))
  throw Error('Valid unique campaign slug required');
 const mode=options.mode??'random';
 if(!['random','guided'].includes(mode))
  throw Error('Campaign generation must be random or guided');
 const base=E.randomCharacter(n);
 const mechanicalBackground=options.background===undefined?
  (mode==='guided'?'apprentice':base.background):
  String(options.background).trim().toLowerCase();
 if(!/^[a-z][a-z -]{1,59}$/.test(mechanicalBackground))
  throw Error('Background must be a plausible, clearly named past occupation');
 const path=options.path===undefined?
  (mode==='guided'?'undecided':base.path):
  String(options.path).trim().toLowerCase();
 if(!['undecided','meridian','arcane','origin','partner',
   'soul','body','rift','specialist','independent'].includes(path))
  throw Error('Starting path is an interest or supported preparation, not an invented stage');
 base.background=mechanicalBackground;base.path=path;
 const age=options.age===undefined?base.age:options.age;
 if(!Number.isInteger(age)||age<13||age>110)
  throw Error('Choose a plausible age between 13 and 110 for the current human engine');
 const gender=options.gender===undefined?
  (mode==='guided'?'unspecified':
   pick(['male','female','nonbinary'],Origins.number(n,'gender'))):
  String(options.gender).trim().toLowerCase();
 if(!['male','female','nonbinary','unspecified','other'].includes(gender))
  throw Error('Unsupported gender descriptor; use a simple starting identity and describe more naturally in play');
 const originalIdentity=generatedIdentity(n,base);
 if(options.name!==undefined&&typeof options.name==='string'&&
   /^[\p{L}\p{M}][\p{L}\p{M}' .-]{2,39}$/u.test(options.name.trim())){
  // A fully chosen identity names its own ordinary household, rather
  // than retaining the surname of a separately rolled example person.
  const oldSurname=originalIdentity.name.split(/\s+/).at(-1);
  const newSurname=options.name.trim().split(/\s+/).at(-1);
  originalIdentity.name=options.name.trim();
  originalIdentity.family.members=originalIdentity.family.members.map(m=>
   ({...m,name:m.name.endsWith(' '+oldSurname)?
     m.name.slice(0,-oldSurname.length)+newSurname:m.name}));
 }
 // Preserve the known five-site seed mapping for historical starts
 // while adding the working Crossing as an occasional genuine new start.
 const establishedOpening=pick(OPENINGS.filter(o=>o.location!=='crossing'),
  ((n>>>16)^(n>>>3))>>>0);
 const chosenOpening=options.startLocation?
  OPENINGS.find(o=>o.location===options.startLocation):
  Origins.number(n,'working-crossing-start')%11===0?
   OPENINGS.find(o=>o.location==='crossing'):establishedOpening;
 if(!chosenOpening)throw Error('Start location must be one of the currently executable world sites');
 const plan=Origins.prepare(n,base,originalIdentity,{...options,slug,mode},chosenOpening.location);
 const alternate={female:['Adela','Alys','Cerys','Della','Elen','Fenna','Iona','Kessa','Liora','Mira','Nessa','Rhea','Selda','Tavira','Vera','Ysolde'],
  nonbinary:['Aven','Cairn','Eris','Hollis','Ilan','Kerrin','Lark','Maren','Neris','Oren','Perrin','Sable','Tarin','Vale','Wren','Yoren']};
 let name=plan.name;
 if(options.name!==undefined){
  if(typeof options.name!=='string'||!/^[\p{L}\p{M}][\p{L}\p{M}' .-]{2,39}$/u.test(options.name.trim()))
   throw Error('A character name must be a plausible name within the engine’s 40-character storage limit');
  name=options.name.trim();
 }else if(alternate[gender]){
  const given=pick(alternate[gender],Origins.number(n,'chosen-given-name'));
  name=given+' '+plan.name.trim().split(/\s+/).at(-1);
 }
 if(name.length>40)throw Error('Generated name exceeds the original character storage limit');
 const state=E.newGame({...base,seed:n,name,age,randomStart:false,
  beastName:pick(PARTNER_NAMES,((n>>>9)^(n>>>18))>>>0)});
 state.player.gender=gender;
 // Seeded ordinary starting variation is independent of social prestige.
 // The original six d20 attributes remain within plausible human bounds;
 // separate latent potential is still sealed by rules/character.js.
 for(const key of ['str','dex','con','int','wis','cha']){
  const starting=state.player.attributes[key];
  state.player.attributes[key]=Math.max(8,Math.min(17,
   starting+(Origins.number(n,'ordinary-attribute:'+key)%7)-3));
 }
 const appearance=options.appearance===undefined?
  (pick(['short','tall','average-height','compact','lean','broad-shouldered'],
    Origins.number(n,'appearance-build'))+'; '+
   pick(['dark','light','silver-streaked','copper-toned','brown','auburn'],
    Origins.number(n,'appearance-hair'))+' hair; '+
   pick(['dark','hazel','grey','green','blue','amber'],
    Origins.number(n,'appearance-eyes'))+' eyes'):
  String(options.appearance).trim();
 if(appearance.length<6||appearance.length>240)
  throw Error('Appearance should be a short description, not an acquired power');
 state.player.appearance=appearance;
 if(options.pronouns!==undefined){
  if(typeof options.pronouns!=='string'||options.pronouns.trim().length<2||
    options.pronouns.trim().length>40)
   throw Error('Pronoun preference must be concise');
  state.player.pronouns=options.pronouns.trim();
 }
 const start=chosenOpening;
 state.world.location=start.location;
 state.world.minutes=start.hour*60+start.minute;
 state.world.weather=start.weather;
 state.flags.visited={[start.location]:true};
 state.flags.openingHook=start.hook;
 state.log=[];state.sequence=0;
 state.log.push({day:1,time:E.clock(state),type:'story',text:start.scene,details:null});
 state.log.push({day:1,time:E.clock(state),type:'world',text:start.hook,details:null});
 state.chatRuntime={revision:0,applied:{},focus:[start.focus],scene:start.scene};
 state.campaign={slug,version:2,startSeed:n,
  characterSource:'engine.randomCharacter + engine.newGame + source-grounded seeded origins',
  rolledBackground:base.background,rolledPath:base.path,
  startingLocation:start.location,
  identity:'independently generated human character',
  identityGeneration:'seeded and user-adjustable across names, origins, professions and family histories',
  oldCampaignImported:false};
 Unified.ensurePlayer(state);
 Character.ensure(state);
 Realm.ensure(state);
 const origin=Origins.install(state,plan);
 const date=startingDate(n);
 // Civil time and the one world clock remain the only in-world calendar.
 const dateView=Realm.anchorCalendar(state,{date,source:'Public civil almanac at campaign creation'});
 state.campaign.startDate=date;
 state.log.push({day:1,time:E.clock(state),type:'world',
  text:'The public civil almanac dates the morning '+dateView.absoluteDate+'.',details:null});
 return {state,summary:{seed:n,slug,name,age,gender,
  appearance:state.player.appearance,
  attributes:{...state.player.attributes},
  background:state.player.background,path:state.player.path,
  location:start.location,family:state.player.family,
  history:state.player.history,origin,
  clock:E.clock(state),date:dateView.absoluteDate,
  focus:start.focus,scene:start.scene}};
}
function secureSeed(){return crypto.randomBytes(4).readUInt32BE(0)||1;}
if(require.main===module){
 const out=process.argv[2],slug=process.argv[3],arg=process.argv[4],
  optionsFile=process.argv[5]||(arg&&arg.endsWith('.json')?arg:null),
  seed=arg&&!arg.endsWith('.json')?Number(arg):secureSeed();
 if(!out||!slug)
  throw Error('Usage: node scripts/new-campaign.js <save.json> <campaign_slug> [seed] [options.json]');
 if(fs.existsSync(out))throw Error('Campaign already exists; will not overwrite an old save');
 const extra=optionsFile?JSON.parse(fs.readFileSync(optionsFile,'utf8')):{};
 const {state,summary}=create({...extra,seed,slug});
 fs.writeFileSync(out,E.exportGame(state)+'\n',{flag:'wx'});
 process.stdout.write(JSON.stringify(summary,null,2)+'\n');
}
module.exports={create,secureSeed,startingDate,OPENINGS};