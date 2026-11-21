'use strict';
// Exactly the source-established Riftglass exterior original Rift Sense
// law, shared by player and independently acting living human sources.
// Sensory measurement is not an Anchor, Fold, portal, location permit,
// spatial travel or spell. It requires a LIVE observed original site.
const Crypto=require('node:crypto');
const SITE_ID='riftglass_vault',LOCATION='ruins',READ_MINUTES=12,STAMINA_COST=2;
const VALID_PHASES=Object.freeze(['quiet','fading','surging','unstable']);
const OBSERVATIONS=Object.freeze({
 unstable:'Strongly irregular boundary pressure; maintaining distance from the sealed vault is prudent.',
 elevated:'Elevated, shifting spatial pressure along the known exterior wards.',
 contained:'The existing exterior ward line feels comparatively contained at this moment.',
 failure:'The surrounding spatial pressure cannot be interpreted reliably.'
});
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function snapshot(w,day){
 const site=w?.mythic?.riftglass_vault,eco=w?.ecosystems?.riftglass;
 if(!site||!eco||!VALID_PHASES.includes(site.phase)||
  !Number.isInteger(site.charge)||site.charge<0||site.charge>100||
  !Number.isInteger(site.seal)||site.seal<0||site.seal>100||
  !Number.isInteger(eco.pressure)||eco.pressure<0||eco.pressure>100||
  !Number.isInteger(w.worldSeed)||!Number.isInteger(day)||day<0)
  throw Error('A source-established living Riftglass exterior spatial reading is required');
 return {siteId:SITE_ID,phase:site.phase,charge:site.charge,
  seal:site.seal,ecosystemPressure:eco.pressure,
  worldSeed:w.worldSeed,day};
}
function risk(v){
 if(!v||v.siteId!==SITE_ID||!VALID_PHASES.includes(v.phase)||
  !Number.isInteger(v.charge)||v.charge<0||v.charge>100||
  !Number.isInteger(v.seal)||v.seal<0||v.seal>100||
  !Number.isInteger(v.ecosystemPressure)||
  v.ecosystemPressure<0||v.ecosystemPressure>100||
  !Number.isInteger(v.worldSeed)||!Number.isInteger(v.day)||v.day<0)
  throw Error('Source-sealed Riftglass pressure snapshot is invalid');
 return v.phase==='unstable'||v.seal<35?'unstable':
  v.phase==='surging'||v.charge>72||v.ecosystemPressure>73?'elevated':'contained';
}
const dc=v=>({unstable:17,elevated:15,contained:13})[risk(v)];
const observation=(v,success)=>success?OBSERVATIONS[risk(v)]:OBSERVATIONS.failure;
module.exports=Object.freeze({SITE_ID,LOCATION,READ_MINUTES,STAMINA_COST,
 VALID_PHASES,OBSERVATIONS,digest,snapshot,risk,dc,observation});
