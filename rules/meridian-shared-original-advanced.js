'use strict';
// Shared original Stage VI–IX Meridian physical operation laws extracted from
// rules/meridian-living-{intent,domain}.js,
// rules/meridian-physique-integration.js and
// rules/meridian-transcendent-constitution.js.
// The existing fully implemented player owners remain authoritative. This
// exposes only their immutable measured Qi/Stamina/DC/stability economics
// for independent actors, never a substitute player controller or ladder.
const POINTS=Object.freeze({6:6,7:6,8:6,9:8});
const SYSTEM=Object.freeze({6:'intent',7:'physique',
 8:'domain',9:'constitution'});
const SOURCE=Object.freeze({
 6:'rules/meridian-living-intent.js',
 7:'rules/meridian-physique-integration.js',
 8:'rules/meridian-living-domain.js',
 9:'rules/meridian-transcendent-constitution.js'
});
const integral=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b;
function law(stage,{kind='practice',load=1,radius=3,
 stability=95,minutes=60}={}){
 if(!integral(stage,6,9)||!['practice','form'].includes(kind)||
  !integral(load,1,9)||!integral(radius,1,1000000)||
  !integral(stability,1,100)||
  !integral(minutes,kind==='practice'?15:30,480))
  throw Error('Only the original source-evidenced advanced Meridian stage, route, local radius and bodily time are supported');
 const practice=kind==='practice',t=Math.ceil(minutes/90);
 let qiSpent,staminaSpent,dc,attribute,stabilityModifier;
 if(stage===6){
  qiSpent=practice?2+Math.ceil(load/2):6+load;
  staminaSpent=t+(practice?1:2);
  dc=(practice?15:20)+load;attribute='wis';
  stabilityModifier=Math.floor(stability/25)-2;
 }else if(stage===7){
  qiSpent=practice?3+Math.ceil(load/2):8+load;
  staminaSpent=t+(practice?2:3);
  dc=(practice?17:21)+load;attribute='con';
  stabilityModifier=Math.floor(stability/30)-1;
 }else if(stage===8){
  qiSpent=practice?2+Math.ceil(radius/4):6+Math.ceil(radius/3);
  staminaSpent=t+(practice?2:3);
  dc=(practice?17:20)+Math.ceil(radius/5);attribute='wis';
  stabilityModifier=Math.floor(stability/30)-1;
 }else{
  qiSpent=practice?4+t:10;
  staminaSpent=t+(practice?3:4);
  dc=practice?21:24;attribute='con';
  stabilityModifier=Math.floor(stability/30)-1;
 }
 return {stage,kind,system:SYSTEM[stage],sourceOwner:SOURCE[stage],
  pointsNeeded:POINTS[stage],qiSpent,staminaSpent,dc,attribute,
  stabilityModifier,
  severePracticeStabilityLoss:practice?2:0,
  mayGrantRankOnlyAfterSeparateSuccessfulFormation:true};
}
// Stage IX stays biological and finite. This is the ORIGINAL separate
// Constitution.care source, not an automatic day-tick benefit or healing.
function maintenance({minutes=45}={}){
 if(!integral(minutes,15,480))
  throw Error('Real Stage IX personal metabolic maintenance time required');
 return {qiSpent:3,staminaSpent:2+Math.ceil(minutes/120),
  dc:19,attribute:'con',stabilityModifier:0,
  severeStabilityLoss:2,minutes,
  sourceOwner:SOURCE[9]+':care',
  noImmortalityOrAutomaticBiologicalUpkeep:true};
}
module.exports={POINTS,SYSTEM,SOURCE,law,maintenance};
