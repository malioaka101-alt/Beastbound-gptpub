'use strict';
// Identifying a genuinely encountered animal is different from generating an
// arbitrary taxon by player-supplied time/source. No tame/Grade/loot/ability.
const Crypto=require('node:crypto'),E=require('../engine.js');
const C=require('./core'),W=require('./world'),Health=require('./unified'),Practice=require('./earned-practice'),SoulSense=require('./first-stage-senses');
const digest=e=>Crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex');
const OBSERVATION_MINUTES=5;
function observe(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('A real wildlife observation accepts no chosen species, minutes, difficulty or source');
 if(s.battle)throw Error('A beast cannot be surveyed through a general wildlife check during combat');
 const encounter=s.encounter,id=encounter?.beastId,b=s.beasts?.[id];
 const loc=E.LOCATIONS[s.world?.location],species=b&&E.SPECIES[b.species];
 if(!id||!b||!species||!Array.isArray(loc?.spawns)||
    !loc.spawns.includes(b.species)||
    !b.habitatExposure||b.habitatExposure[s.world.location]!==1||
    b.away===true||(b.location&&b.location!==s.world.location))
  throw Error('A living, actually encountered local wild beast is required for observation');
 if(s.player.partnerIds?.includes(id)||b.owner)
  throw Error('Partner and owned-beast care are not wild habitat encounters');
 if((Number.isInteger(b.sapience)&&b.sapience>=3)||
    species.intelligence==='sapient')
  throw Error('Sapient individuals require a distinct person-aware interaction, not an animal survey check');
 if(encounter.threat===true)
  throw Error('A directly threatening animal requires a safety decision, not a free close-up examination');
 if(encounter.observed===true)
  throw Error('This individual beast has already been inspected during the encounter');
 const day=Math.floor(s.world.minutes/1440);
 if(s.table?.wildlifeObservationAttempts?.[id]!==undefined)
  throw Error('The animal was already examined; the same subject cannot be rerolled');
 const wis=C.int(s.player.attributes?.wis,'recorded Wisdom attribute',1,30);
 const skill=C.int(s.player.skills?.beastcraft?.rank,'earned Beastcraft rank',0,5);
 // A real successful nearby Soul Perception can sharpen ONE ordinary
 // noninvasive observation by +1, never auto-identify species or grade.
 const focus=SoulSense.focusBonus(s,id);
 const modifier=Math.floor((wis-10)/2)+skill*2+focus;
 // Source's legacy observation DC and time retained; the subject comes from
 // an actual independent biome-compatible encounter rather than a request.
 const checked=C.check(s,{modifier,dc:10,
  label:'Noninvasive observation of a present wild beast'});
 const rollIndex=s.log.length-1,roll=s.log[rollIndex];
 if(roll?.type!=='roll'||roll.details?.roll!==checked.roll)
  throw Error('A recorded honest wildlife observation roll is required');
 s.table||={};s.table.wildlifeObservationAttempts||={};
 s.table.wildlifeObservationEvidence||={};
 s.table.wildlifeObservationAttempts[id]=day;
 if(focus&&!SoulSense.useFocus(s,id))
  throw Error('A claimed Soul perception aid lacks its original witnessed field evidence');
 encounter.observed=true;
 const identified=checked.success;
 const source='Engine-witnessed '+loc.name+' encounter and real noninvasive Beastcraft check';
 s.table.wildlifeObservationEvidence[id]={
  beastId:id,location:s.world.location,biome:loc.biome,
  observedMinute:s.world.minutes,species:b.species,identified,
  source,rollEventIndex:rollIndex,rollEventHash:digest(roll),
  degree:checked.degree,checkMargin:checked.margin,
  verifiedSoulFocusBonus:focus,used:false
 };
 if(identified){
  s.sightings||=[];
  if(!s.sightings.some(x=>x.beastId===id))
   s.sightings.push({day:E.day(s),location:s.world.location,
    species:b.species,beastId:id,source:'verified-present-wildlife-observation'});
  // Old unsourced prototype sightings do not magically become verified
  // guild census entries just because one later real animal was identified.
  const verified=s.sightings.filter(x=>
    x.source==='verified-present-wildlife-observation'&&
    s.beasts[x.beastId]?.species===x.species&&
    E.LOCATIONS[x.location]?.spawns?.includes(x.species)).length;
  for(const q of Object.values(s.quests||{})){
   if(q.status==='active'&&q.metric==='sightings'&&Number.isInteger(q.target)&&q.target>=1)
    q.progress=Math.min(q.target,verified);
  }
 }
 const old=s.world.minutes;
 E.advance(s,OBSERVATION_MINUTES);
 W.finalizeTime(s,old);
 Health.sync(s,{source:'legacy'});
 const description=identified?
  'The observed markings identify a '+species.name+
    '. Its recorded habitat role is '+species.role+
    '; its Grade and hidden abilities remain unmeasured.':
  'The animal is visible, but its markings cannot yet be identified reliably.';
 C.event(s,'beast',description,{beastId:id,identified,
  degree:checked.degree,source:'witnessed-wildlife-observation'});
 const practice=Practice.award(s,{skill:'beastcraft',check:checked,risky:true});
 return {...practice,observed:true,identified,beastId:id,
  species:identified?b.species:undefined,
  name:identified?species.name:undefined,
  check:checked,elapsedMinutes:OBSERVATION_MINUTES,
  verifiedSoulFocusBonus:focus,
  evidenceOrigin:'engine-present-wildlife-observation',
  message:description,unmeasuredTraitsRemainHidden:true};
}
function status(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Wildlife sightings status is a read-only known-facts view');
 return {knownSightings:(s.sightings||[]).filter(x=>
   x&&typeof x.beastId==='string'&&typeof x.species==='string'&&
   x.source==='verified-present-wildlife-observation'&&
   s.table?.wildlifeObservationEvidence?.[x.beastId]?.identified===true&&
   s.beasts?.[x.beastId]?.species===x.species&&
   E.LOCATIONS[x.location]?.spawns?.includes(x.species)&&
   Object.prototype.hasOwnProperty.call(E.SPECIES,x.species))
  .map(x=>({beastId:x.beastId,species:x.species,
    name:E.SPECIES[x.species].name,location:x.location,day:x.day}))
  .slice(-30)};
}
module.exports={observe,status};
