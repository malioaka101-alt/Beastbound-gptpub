'use strict';
// A self-directed wilderness rest site is found through real local terrain,
// one honest Survival check and finite exertion/time. No GM-created camp,
// arbitrary teacher, purchased permit, guaranteed safety, or magic is implied.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),Time=require('./world'),
 Unified=require('./unified'),Practice=require('./earned-practice');
const ORIGIN='actually-scouted-wilderness-rest-site-v1',MINUTES=45,STAMINA=3;
const SITES=Object.freeze({
 forest:Object.freeze({description:'a raised root hollow sheltered under the woodland canopy',dc:11}),
 fen:Object.freeze({description:'an elevated, sheltered reedbank beyond the wet waterline',dc:14}),
 hills:Object.freeze({description:'a dry wind-shadow ledge away from loose scree',dc:15})
});
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function preflight(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Scout a genuine local campsite; callers cannot choose its safety, DC, shelter ID, result or resources');
 if(s.battle||s.encounter)
  throw Error('A present encounter or battle must be resolved before scouting a rest site');
 const loc=E.LOCATIONS[s.world?.location],cfg=SITES[loc?.biome];
 if(!loc||!cfg||!Array.isArray(loc.spawns)||!loc.spawns.length)
  throw Error('This procedure requires actual nearby open woodland, wetland or upland terrain; other places need their own witnessed local shelter');
 const status=s.table?.combatants?.player?.status;
 if(['incapacitated','knocked_out','rehabilitating','dying','dead'].includes(status))
  throw Error('An incapacitated character cannot independently scout a campsite');
 const stamina=C.int(s.player.stamina,'available actual stamina',0,100000),
  rank=C.int(s.player.skills?.survival?.rank,'earned Survival skill rank',0,5),
  pp=C.int(s.player.skills?.survival?.xp,'current Survival practice record',0,10000000),
  score=C.int(s.player.attributes?.wis,'current Wisdom',1,30);
 if(stamina<STAMINA)throw Error('Insufficient real stamina to scout a safe resting place');
 const existing=s.table?.sleepShelters;
 if(existing&&(Array.isArray(existing)||typeof existing!=='object'))
  throw Error('The saved campsite ledger is invalid');
 const expectedId='fieldcamp_'+s.world.location+'_'+(s.world.minutes+MINUTES);
 if(existing?.[expectedId])
  throw Error('An existing witnessed campsite cannot be overwritten');
 if(s.table?.combatants?.player&&s.table.combatants.player.stamina!==stamina)
  throw Error('The character stamina must match the actual wound model before scouting');
 const elemental=require('./specialist-elemental-wetland').support(s);
 const weather=String(s.world.weather||'Fair').slice(0,120);
 const hard=/storm|gale|flood|downpour|blizzard|whiteout/i.test(weather);
 const penalty=hard?3:/rain|mist|fog|sleet/i.test(weather)?1:0;
 return {loc,cfg,weather,stamina,elemental,
  modifier:Math.floor((score-10)/2)+2*rank,
  dc:cfg.dc+penalty-elemental.mitigation};
}
function find(s,p={}){
 const {loc,cfg,weather,modifier,dc,elemental}=preflight(s,p);
 const old=s.world.minutes,location=s.world.location;
 const check=C.check(s,{modifier,dc,label:'Find safe overnight ground at '+loc.name,risky:true});
 const rollEvent=structuredClone(s.log.at(-1)),rollHash=hash(rollEvent);
 // Ordinary survival effort, successful or not, spends actual resources.
 s.player.stamina-=STAMINA;
 const practice=Practice.award(s,{skill:'survival',check,risky:true});
 E.advance(s,MINUTES);Time.finalizeTime(s,old);Unified.sync(s,{source:'legacy'});
 let shelterId=null;
 if(check.success){
  shelterId='fieldcamp_'+location+'_'+s.world.minutes;
  const witness={origin:ORIGIN,shelterId,location,biome:loc.biome,
   checkedAtMinute:s.world.minutes,weather,terrain:cfg.description,
   dc,rollHash,roll:check.roll,degree:check.degree,
   elementalMitigation:elemental.mitigation,
   elementalSeal:elemental.sourceSeal};
  C.event(s,'world','A workable resting place is identified at '+loc.name+
   ': '+cfg.description+'.',witness);
  const event=structuredClone(s.log.at(-1));
  s.table||={};s.table.sleepShelters||={};
  if(s.table.sleepShelters[shelterId])
   throw Error('An existing witnessed campsite cannot be overwritten');
  s.table.sleepShelters[shelterId]={
   id:shelterId,name:'Scouted '+loc.name+' resting place',
   location,knownToPlayer:true,safe:true,
   worldMinute:s.world.minutes,
   validUntilMinute:s.world.minutes+18*60,
   source:'Personally scouted '+cfg.description+' at '+loc.name+
    ' using one honestly resolved Survival check',
   origin:ORIGIN,biome:loc.biome,terrain:cfg.description,
   weather,dc,checkedRoll:check.roll,degree:check.degree,
   elementalMitigation:elemental.mitigation,
   elementalSeal:elemental.sourceSeal,
   rollEvent,rollHash,sourceEvent:event,sourceEventHash:hash(event)};
 }else{
  C.event(s,'world','The search at '+loc.name+
   ' has not verified ground dry and sheltered enough for an unattended night.',{
    origin:'unsuccessful-local-shelter-search-v1',location,
    attemptMinute:s.world.minutes,rollHash,degree:check.degree});
 }
 return {searched:true,found:check.success,shelterId,
  personallyEarnedElementalWetlandSupport:elemental.mitigation,
  description:check.success?cfg.description:null,
  roll:check.roll,dc,degree:check.degree,margin:check.margin,
  elapsedMinutes:MINUTES,staminaSpent:STAMINA,
  practiceSkill:practice.practiceSkill,ppAwarded:practice.ppAwarded,
  noGuaranteedShelter:true,noInventedSupplies:true,
  message:check.success?
   'You identify a defensible, genuinely surveyed sleeping place for a temporary night of rest.':
   'You have not confirmed a safe sleeping place here; another plausible approach remains possible, but this attempt cost time and effort.'};
}
function valid(s,site){
 if(!site||site.origin!==ORIGIN||!/^fieldcamp_(forest|fen|hills)_[0-9]+$/.test(site.id)||
    site.location!==s.world.location||site.biome!==E.LOCATIONS[site.location]?.biome||
    site.terrain!==SITES[site.biome]?.description||
    site.knownToPlayer!==true||site.safe!==true||
    !Number.isInteger(site.worldMinute)||site.worldMinute<0||
    site.worldMinute>s.world.minutes||
    !site.sourceEvent||typeof site.sourceEvent!=='object'||
    !site.rollEvent||typeof site.rollEvent!=='object'||
    site.sourceEventHash!==hash(site.sourceEvent)||
    site.rollHash!==hash(site.rollEvent)||
    site.sourceEvent?.type!=='world'||
    site.sourceEvent?.details?.origin!==ORIGIN||
    site.sourceEvent.details.shelterId!==site.id||
    site.sourceEvent.details.location!==site.location||
    site.sourceEvent.details.biome!==site.biome||
    site.sourceEvent.details.terrain!==site.terrain||
    site.sourceEvent.details.weather!==site.weather||
    site.sourceEvent.details.checkedAtMinute!==site.worldMinute||
    site.sourceEvent.details.rollHash!==site.rollHash||
    site.sourceEvent.details.roll!==site.checkedRoll||
    site.sourceEvent.details.dc!==site.dc||
    site.sourceEvent.details.degree!==site.degree||
    (site.elementalMitigation!==undefined&&(
      ![0,1].includes(site.elementalMitigation)||
      site.sourceEvent.details.elementalMitigation!==site.elementalMitigation||
      site.sourceEvent.details.elementalSeal!==site.elementalSeal||
      (site.elementalMitigation===0&&site.elementalSeal!=null)||
      (site.elementalMitigation===1&&
       !require('./specialist-elemental-wetland').supportProof(
        s,site.elementalSeal,site.worldMinute-MINUTES))))||
    site.rollEvent?.type!=='roll'||
    site.rollEvent.details?.roll!==site.checkedRoll||
    site.rollEvent.details?.dc!==site.dc||
    site.rollEvent.details?.degree!==site.degree||
    site.rollEvent.details?.success!==true||
    !Number.isInteger(site.rollEvent.details?.margin)||
    site.rollEvent.details.margin<0)
  throw Error('This purported campsite lacks its original authentic successful terrain and Survival witnesses');
 // A later *actually established* storm can invalidate an earlier fair-
 // weather survey. Ordinary weather changes alone are not arbitrary gates.
 const nowWeather=String(s.world.weather||'Fair').slice(0,120);
 if(/storm|gale|flood|downpour|blizzard|whiteout/i.test(nowWeather)&&
    nowWeather!==site.weather)
  throw Error('A newly documented severe weather event calls for renewed shelter verification');
 return site;
}
module.exports={ORIGIN,SITES,MINUTES,STAMINA,find,valid};
