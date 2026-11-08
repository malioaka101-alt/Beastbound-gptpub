'use strict';
// An opening is a GM-authored scene, not a table of prepared hooks. The player
// may choose age alone; the GM owns context, location, prose and initial focus.
const E=require('../engine'),A=require('../world/atlas');
const Places=require('../world/lived-places'),Realm=require('../world/simulation');
const SOURCE='gm-authored-opening-scene-v1';
const phrase=(x,lo,hi)=>typeof x==='string'&&x.trim().length>=lo&&x.trim().length<=hi;
function verify(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).some(x=>!['locationId','place','scene','focus','weather','hour','minute'].includes(x))||
  !!p.place===!!p.locationId||
  !phrase(p.scene,35,1200)||!phrase(p.focus,3,100)||
  !phrase(p.weather,3,140)||!Number.isInteger(p.hour)||
  p.hour<0||p.hour>23||!Number.isInteger(p.minute)||
  p.minute<0||p.minute>59)
  throw Error('The GM must author one real opening place, scene, focus and witnessed local time/weather; no pre-written hooks or chosen outcomes');
 if(p.locationId){
  if(typeof p.locationId!=='string'||!E.LOCATIONS[p.locationId])
   throw Error('Existing opening site must be an actual canon location');
 }else{
  if(!p.place||typeof p.place!=='object'||Array.isArray(p.place)||
   !phrase(p.place.placeId,4,64)||!A.R[p.place.regionId])
   throw Error('New opening requires a GM-authored place in a genuine world region');
 }
 return {siteId:p.locationId||p.place.placeId,
  regionId:p.locationId?A.LOCATION_REGION[p.locationId]:p.place.regionId};
}
function apply(s,p){
 const {siteId,regionId}=verify(p);
 if(s.campaign?.openingState!=='awaiting-gm'||
  s.chatRuntime?.revision!==0||
  s.flags?.openingAuthored===true||
  s.battle||s.encounter||
  !s.campaign?.slug||!s.campaign.origin||
  s.world.minutes>=1440)
  throw Error('An opening can only be authored once for a fresh untouched campaign');
 const oldDate=Realm.calendar(s);
 if(!oldDate.absoluteDate)throw Error('Opening requires the campaign civil calendar established first');
 // The first sighting and the first scene share one honest recorded time;
 // otherwise the place could appear founded after the alleged opening.
 s.world.minutes=p.hour*60+p.minute;
 if(p.place)Places.establish(s,p.place);
 s.world.location=siteId;
 s.world.weather=p.weather.trim();
 s.flags.visited={[siteId]:true};
 delete s.flags.openingHook;
 s.flags.openingAuthored=true;
 s.chatRuntime.scene=p.scene.trim();
 s.chatRuntime.focus=[p.focus.trim()];
 const birthplace=A.R[s.campaign.origin.birthRegionId];
 const away=birthplace.polity!==A.R[regionId].polity;
 s.player.startingContext.openingRegionId=regionId;
 s.player.startingContext.openingSite=siteId;
 s.player.startingContext.travelBeforePlay=away;
 s.campaign.origin.openingRegionId=regionId;
 s.campaign.origin.openingSite=siteId;
 s.campaign.origin.travelBeforePlay=away;
 s.campaign.startingLocation=siteId;
 s.campaign.openingState='authored';
 require('../rules/core').event(s,'story',p.scene.trim(),{
  source:SOURCE,openingId:siteId,regionId,
  focus:p.focus.trim(),observedWeather:p.weather.trim(),
  civilTime:p.hour*60+p.minute,age:s.player.age,
  noImposedPersonality:true,noChosenFate:true,
  noFreeNPCAgreement:true,noNewPlayerAssets:true,
  firstSceneWrittenByGM:true});
 return {opened:true,location:siteId,regionId,
  scene:p.scene.trim(),focus:p.focus.trim(),
  noForcedOpening:true,noAutomaticBenefits:true};
}
module.exports={SOURCE,verify,apply};
