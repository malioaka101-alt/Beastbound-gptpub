'use strict';
// A small playable observation path that itself creates a witnessed challenge
// from established local geography. No player-selected DC, source, skill,
// rare specimen, research finding, or automatic beast encounter.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),W=require('./world'),Health=require('./unified');
const SURVEYS=Object.freeze({
 forest:{dc:12,sign:'Disturbed leaf litter and copperwood root tracks',subject:'copperwood edge signs'},
 fen:{dc:12,sign:'A changing reed-waterline and soft mud impressions',subject:'wetland margin signs'},
 hills:{dc:12,sign:'Loose scree and broken grass along the exposed ridge',subject:'foothill passage signs'},
 ruins:{dc:17,sign:'Disturbed rubble and the ward-stone approach surface',subject:'outpost approach signs'}
});
const digest=e=>Crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex');
const DAY=1440,PREP_MINUTES=20,STA_COST=2,CHECK_MINUTES=15;
function context(s){
 if(s.battle||s.encounter)throw Error('Finish or leave the active encounter before surveying habitat traces');
 const loc=E.LOCATIONS[s.world?.location],cfg=SURVEYS[loc?.biome];
 if(!cfg||!Array.isArray(loc.spawns)||!loc.spawns.length)
  throw Error('Only a recorded open natural habitat can support this provisional trace survey');
 const person=s.table?.combatants?.player;
 if(s.player.health!==s.player.maxHealth||
    (person&&(person.status!=='ok'||person.wounds?.some(w=>w>0))))
  throw Error('Injured or incapacitated characters need a separate safe survey procedure');
 const stamina=C.int(s.player.stamina,'recorded field stamina',0,100000);
 if(stamina<STA_COST+2)throw Error('Insufficient real stamina for a careful habitat trace survey');
 return {loc,cfg};
}
function prepare(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Habitat survey preparation accepts no caller-selected DC, rare finds, time or scene source');
 const {loc,cfg}=context(s),location=s.world.location;
 const completedDay=Math.floor(s.world.minutes/DAY);
 // One ecological assessment per actual habitat per local day. Do not let
 // repeated visits or different turn IDs fish for a favorable field check.
 const last=s.table?.habitatSurveyDaily?.[location];
 if(Number.isInteger(last)&&last===completedDay)
  throw Error('A habitat survey was already prepared here this in-world day');
 if(Object.values(s.table?.sceneChecks||{}).some(a=>
    a.origin==='engine-habitat-survey'&&!a.used&&a.location===location&&
    Number.isInteger(a.worldMinute)&&a.worldMinute<=s.world.minutes&&
    s.world.minutes-a.worldMinute<=DAY))
  throw Error('Complete or let the existing witnessed habitat survey expire before preparing another');
 const checkId='habitat_'+location+'_'+String(completedDay).padStart(5,'0');
 if(s.table?.sceneChecks?.[checkId])
  throw Error('A habitat check already exists for this location and day');
 const old=s.world.minutes;
 s.player.stamina-=STA_COST;
 E.advance(s,PREP_MINUTES);
 W.finalizeTime(s,old);
 Health.sync(s,{source:'legacy'});
 // This scene is observable terrain evidence, not an identified creature or
 // a claim that rare biological samples can be harvested.
 const label='Interpret '+cfg.subject;
 C.event(s,'world',cfg.sign+' are visible at '+loc.name+'.',
  {checkId,location,biome:loc.biome,observation:'terrain-traces'});
 const eventIndex=s.log.length-1,event=s.log[eventIndex];
 s.table||={};s.table.sceneChecks||={};s.table.habitatSurveyDaily||={};
 s.table.sceneChecks[checkId]={
  checkId,origin:'engine-habitat-survey',
  attribute:'wis',skill:'survival',dc:cfg.dc,extra:0,minutes:CHECK_MINUTES,
  label,risky:true,location,worldMinute:s.world.minutes,
  source:'Engine-observed '+cfg.sign.toLowerCase()+' at known '+loc.name,
  eventIndex,eventHash:digest(event),
  // This actually observed scene is a permanent hash-matched witness;
  // the 90-line narrative history is allowed to rotate independently.
  observationEvent:structuredClone(event),
  biome:loc.biome,subject:cfg.subject
 };
 s.table.habitatSurveyDaily[location]=completedDay;
 return {prepared:true,checkId,challenge:label,elapsedMinutes:PREP_MINUTES,
  staminaSpent:STA_COST,observed:cfg.sign,
  nextAction:'Use the witnessed checkId in a genuine skill check',
  note:'No beast, loot, rarity, research conclusion or guaranteed success is created'};
}
function status(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Habitat survey status is read-only and accepts no inputs');
 const location=s.world.location,loc=E.LOCATIONS[location],cfg=SURVEYS[loc?.biome];
 if(!cfg||!loc.spawns?.length)return {surveyable:false,pending:[]};
 const pending=Object.values(s.table?.sceneChecks||{}).filter(a=>
  a.origin==='engine-habitat-survey'&&!a.used&&a.location===location&&
  typeof a.checkId==='string'&&Number.isInteger(a.eventIndex)&&
  Number.isInteger(a.worldMinute)&&a.worldMinute<=s.world.minutes&&
  s.world.minutes-a.worldMinute<=DAY&&
  ((a.observationEvent&&digest(a.observationEvent)===a.eventHash&&
    a.observationEvent.details?.checkId===a.checkId)||
   (s.log[a.eventIndex]?.details?.checkId===a.checkId&&
    a.eventHash===digest(s.log[a.eventIndex])))).map(a=>({
    checkId:a.checkId,challenge:a.label,preparedAtMinute:a.worldMinute
  })).slice(-5);
 const last=s.table?.habitatSurveyDaily?.[location];
 return {surveyable:true,pending,
  preparedToday:last===Math.floor(s.world.minutes/DAY)};
}

// A read-only shared proof for existing habitat consumers. This is the
// original recorded scene and check, not a fresh resource roll or a second
// XP track. The 90-line narrative log can rotate; original sealed witnesses
// are retained separately for genuinely executed modern checks.
// All original habitat evidence consumers use this one witness proof.
// Historical consultation does NOT demand that the player still occupies
// the original habitat; resource gathering retains its existing local gate.
function sourceProof(s,id,{habitat,mustSucceed=false,maxAgeMinutes=null,requireLocal=true}={}){
 if(typeof id!=='string'||!/^habitat_(forest|fen|hills|ruins)_[0-9]{5}$/.test(id)||
   (requireLocal&&habitat!==s.world.location)||!E.LOCATIONS[habitat])
  throw Error('Only a personally witnessed actual current local habitat check can support material gathering');
 if(maxAgeMinutes!==null&&
    (!Number.isInteger(maxAgeMinutes)||maxAgeMinutes<0||maxAgeMinutes>100000))
  throw Error('Invalid resource-evidence freshness requirement');
 const cfg=SURVEYS[E.LOCATIONS[habitat].biome],loc=E.LOCATIONS[habitat],
  a=s.table?.sceneChecks?.[id],f=s.table?.habitatSurveyFindings?.[id];
 if(!cfg||!loc.spawns?.length||!a||!f||!a.used||
   a.origin!=='engine-habitat-survey'||a.checkId!==id||
   a.location!==habitat||a.biome!==loc.biome||
   a.attribute!=='wis'||a.skill!=='survival'||
   a.dc!==cfg.dc||a.extra!==0||a.minutes!==CHECK_MINUTES||
   a.risky!==true||a.label!=='Interpret '+cfg.subject||
   a.subject!==cfg.subject||
   a.source!=='Engine-observed '+cfg.sign.toLowerCase()+' at known '+loc.name||
   !Number.isInteger(a.eventIndex)||a.eventIndex<0||
   !Number.isInteger(a.worldMinute)||a.worldMinute<0||
   !Number.isInteger(a.checkedAtMinute)||a.checkedAtMinute<a.worldMinute||
   a.checkedAtMinute>s.world.minutes||
   f.checkId!==id||f.location!==habitat||f.biome!==loc.biome||
   f.observedSceneHash!==a.eventHash||
   f.interpretedAtMinute!==a.checkedAtMinute||
   !Number.isInteger(f.rollEventIndex)||f.rollEventIndex<0||
   typeof f.success!=='boolean'||typeof f.degree!=='string'||
   s.table?.sceneCheckEventsUsed?.[a.eventHash]!==id||
   (maxAgeMinutes!==null&&s.world.minutes-a.checkedAtMinute>maxAgeMinutes))
  throw Error('A recent resolved source-authentic habitat observation and genuine check are required');
 const observationLive=s.log[a.eventIndex],rollLive=s.log[f.rollEventIndex];
 if((a.observationEvent&&digest(a.observationEvent)!==a.eventHash)||
    (f.rollEvent&&digest(f.rollEvent)!==f.rollEventHash))
  throw Error('Original habitat field evidence has been altered');
 const observation=observationLive&&digest(observationLive)===a.eventHash?
   observationLive:a.observationEvent,
  roll=rollLive&&digest(rollLive)===f.rollEventHash?
   rollLive:f.rollEvent,
  r=roll?.details;
 if(!observation||digest(observation)!==a.eventHash||
   observation.type!=='world'||
   observation.text!==cfg.sign+' are visible at '+loc.name+'.'||
   observation.details?.checkId!==id||
   observation.details?.location!==habitat||
   observation.details?.biome!==loc.biome||
   observation.details?.observation!=='terrain-traces'||
   !roll||digest(roll)!==f.rollEventHash||roll.type!=='roll'||
   !roll.text.includes(a.label)||
   !r||!Array.isArray(r.dice)||r.dice.length!==1||
   !Number.isInteger(r.roll)||r.roll<1||r.roll>20||
   r.dice[0]!==r.roll||r.dc!==cfg.dc||
   !Number.isInteger(r.modifier)||
   r.naturalBonus!==C.naturalAdjustment(r.roll)||
   !Number.isInteger(r.total)||
   r.total!==r.roll+r.modifier+r.naturalBonus||
   r.margin!==r.total-r.dc||
   r.success!==(r.margin>=0)||
   r.degree!==C.degree(r.margin,true)||
   f.success!==r.success||f.degree!==r.degree||
   f.finding!==(r.success?
    'Habitat traces interpreted; no species identity independently confirmed':
    'The available trace cannot be interpreted reliably'))
  throw Error('The actual original terrain witness and engine-owned Survival roll cannot support this harvest');
 if(mustSucceed&&!r.success)
  throw Error('Only a truly successful interpreted local habitat survey permits this gathering');
 return {checkId:id,location:habitat,success:r.success,degree:r.degree,
  originalRoll:r.roll,observationHash:a.eventHash,rollHash:f.rollEventHash,
  interpretedAtMinute:f.interpretedAtMinute};
}

function interpreted(s,id,{habitat=s.world.location,mustSucceed=false,maxAgeMinutes=null}={}){
 return sourceProof(s,id,{habitat,mustSucceed,maxAgeMinutes,requireLocal:true});
}
// Read-only, personally completed historical work evidence. It cannot
// permit harvesting remotely or give another skill roll, XP or findings.
function historical(s,id){
 const habitat=s.table?.sceneChecks?.[id]?.location;
 return sourceProof(s,id,{habitat,requireLocal:false});
}
module.exports={prepare,status,interpreted,historical,SURVEYS};
