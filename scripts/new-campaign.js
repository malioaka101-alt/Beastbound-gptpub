'use strict';
// Creates an independent seed-reproducible campaign from the actual Beastbound
// engine. Cosmetic identity and opening scene rolls do NOT consume combat dice.
const fs=require('node:fs');
const crypto=require('node:crypto');
const E=require('../engine');
const Unified=require('../rules/unified');
const Realm=require('../world/simulation');
const Character=require('../rules/character');

const SURNAME_ALTERNATES=['Ash','Briar','Dawn','Fen','Graves','Hollow','Reed','Stone','Thorne','Vale','Wick'];
const PARTNER_NAMES=['Mote','Tallow','Pip','Flicker','Cinder','Nacre','Lilt','Thimble'];
const MALE_GIVEN=['Bran','Kael','Orin','Tarin','Fen','Darian','Soren','Corren','Ewan','Rowan','Ivar','Merric'];
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
 const given=pick(MALE_GIVEN,((n>>>8)^n)>>>0);
 let surname=base.name.split(' ').slice(1).join(' ');
 // The new default must not accidentally appear to be Aerin's family sequel.
 if(surname==='Marsh')surname=pick(SURNAME_ALTERNATES,((n>>>13)^n)>>>0);
 const name=given+' '+surname;
 // Use the actual original engine to derive character sheet, background and path.
 const state=E.newGame({...base,seed:n,name,randomStart:false,beastName:pick(PARTNER_NAMES,((n>>>9)^(n>>>18))>>>0)});
 state.player.gender='male';
 state.player.family=base.family;
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
  identity:'independent male protagonist',oldCampaignImported:false};
 Unified.ensurePlayer(state);
 Character.ensure(state);
 Realm.ensure(state);
 const date=startingDate(n);
 // The public civil almanac fixes this campaign's date at creation; its
 // original opening scene/time is unchanged, and no world ticks are spent.
 const dateView=Realm.anchorCalendar(state,{date,source:'Public civil almanac at the opening settlement, established at campaign creation'});
 state.campaign.startDate=date;
 state.log.push({day:1,time:E.clock(state),type:'world',text:`The public civil almanac dates the morning ${dateView.absoluteDate}.`,details:null});
 return {state,summary:{seed:n,slug,location:start.location,name,age:state.player.age,background:state.player.background,path:state.player.path,clock:E.clock(state),date:dateView.absoluteDate,focus:start.focus,scene:start.scene}};
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