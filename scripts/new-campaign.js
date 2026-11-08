'use strict';
// Creates an independent seed-reproducible campaign from the actual Beastbound
// engine. Cosmetic identity and opening scene rolls do NOT consume combat dice.
const fs=require('node:fs');
const crypto=require('node:crypto');
const E=require('../engine');
const Unified=require('../rules/unified');
const Realm=require('../world/simulation');
const Character=require('../rules/character');

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
function create({seed,slug,gender='male'}={}){
 const n=Number(seed)>>>0;if(!n)throw Error('A nonzero unsigned seed is required');
 if(!/^[a-z0-9][a-z0-9_-]{4,79}$/.test(slug||''))throw Error('Valid unique campaign slug required');
 if(gender!=='male')throw Error('This starting generator is currently configured for the requested male lead');
 const base=E.randomCharacter(n);
 const identity=generatedIdentity(n,base);
 const name=identity.name;
 // Use the actual original engine to derive character sheet, background and path.
 const state=E.newGame({...base,seed:n,name,randomStart:false,beastName:pick(PARTNER_NAMES,((n>>>9)^(n>>>18))>>>0)});
 state.player.gender='male';
 state.player.family=identity.family;
 state.player.history=identity.history;
 const start=pick(OPENINGS,((n>>>16)^(n>>>3))>>>0);
 state.world.location=start.location;
 state.world.minutes=start.hour*60+start.minute;
 state.world.weather=start.weather;
 state.flags.visited={[start.location]:true};
 state.flags.openingHook=start.hook;
 state.log=[];state.sequence=0;
 state.log.push({day:1,time:E.clock(state),type:'story',text:start.scene,details:null});
 state.log.push({day:1,time:E.clock(state),type:'world',text:start.hook,details:null});
 state.chatRuntime={revision:0,applied:{},focus:[start.focus],scene:start.scene};
 state.campaign={slug,version:1,startSeed:n,characterSource:'engine.randomCharacter + engine.newGame',
  rolledBackground:base.background,rolledPath:base.path,startingLocation:start.location,
  identity:'independent male protagonist',identityGeneration:'seeded culturally plausible personal-and-family names, independent of destination',oldCampaignImported:false};
 Unified.ensurePlayer(state);
 Character.ensure(state);
 Realm.ensure(state);
 const date=startingDate(n);
 // The public civil almanac fixes this campaign's date at creation; its
 // original opening scene/time is unchanged, and no world ticks are spent.
 const dateView=Realm.anchorCalendar(state,{date,source:'Public civil almanac at the opening settlement, established at campaign creation'});
 state.campaign.startDate=date;
 state.log.push({day:1,time:E.clock(state),type:'world',text:`The public civil almanac dates the morning ${dateView.absoluteDate}.`,details:null});
 return {state,summary:{seed:n,slug,location:start.location,name,age:state.player.age,background:state.player.background,path:state.player.path,family:identity.family,history:identity.history,clock:E.clock(state),date:dateView.absoluteDate,focus:start.focus,scene:start.scene}};
}
function secureSeed(){return crypto.randomBytes(4).readUInt32BE(0)||1;}
if(require.main===module){
 const out=process.argv[2],slug=process.argv[3],seed=process.argv[4]?Number(process.argv[4]):secureSeed();
 if(!out||!slug)throw Error('Usage: node scripts/new-campaign.js <save.json> <campaign_slug> [seed]');
 if(fs.existsSync(out))throw Error('Campaign already exists; will not overwrite an old save');
 const {state,summary}=create({seed,slug});fs.writeFileSync(out,E.exportGame(state)+'\n',{flag:'wx'});
 process.stdout.write(JSON.stringify(summary,null,2)+'\n');
}
module.exports={create,secureSeed,startingDate,OPENINGS};