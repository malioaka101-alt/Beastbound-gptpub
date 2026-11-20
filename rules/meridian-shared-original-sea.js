'use strict';
// Shared ORIGINAL Stage IV Dantian Sea arithmetic from the existing
// rules/disciplines.js:seaWork, NOT a second Meridian ladder.
// Both the actual player and each source-verified independent human use the
// same 108-Gate record, per-attempt DC, costs, growth and mature sea profile.
const Build=require('./build');
const METHODS=Object.freeze(['compression','circulation','stabilisation','integrated']);
const originalBaselineStability=95; // engine.js:newGame player Meridian baseline
const int=(x,min,max)=>Number.isInteger(x)&&x>=min&&x<=max;
function qualities(gates){
 const {verifiedGates}=require('./meridian-shared-original-gates');
 const x=verifiedGates(gates);
 if(gates.length!==108)
  throw Error('Actual original 108 individually opened Gates are required for Stage IV');
 return {perfect:x.Perfect,sound:x.Sound,flawed:x.Flawed};
}
function working({perfect,flawed,foundationQuality,stability,minutes=120}={}){
 if(!int(perfect,0,108)||!int(flawed,0,108)||
  perfect+flawed>108||!['Perfect','Firm','Sound','Thin','Cracked']
   .includes(foundationQuality)||
  !int(stability,1,100)||!int(minutes,15,480))
  throw Error('Only an original verified Gate/physiology profile can attempt the Dantian Sea');
 const actualDC=21+Math.floor(flawed/18)+(stability<70?2:0),
  foundationBonus=foundationQuality==='Perfect'?2:
   foundationQuality==='Firm'?1:0,
  gateBonus=Math.min(2,Math.floor(perfect/36));
 return {actualDC,foundationBonus,gateBonus,qiSpent:8,
  staminaSpent:Math.ceil(minutes/120),
  requiredPoints:5,minutes,source:'rules/disciplines.js:seaWork'};
}
function progress(degree,coreProgress){
 if(!int(coreProgress,0,100))throw Error('Actual original Core check progress required');
 return degree==='exceptional'?5:coreProgress;
}
function formation({perfect,flawed,stability,profileExtra}={}){
 if(!int(perfect,0,108)||!int(flawed,0,108)||perfect+flawed>108||
  !int(stability,1,100))
  throw Error('Actual original Gate qualities and current circulation stability required');
 const purity=Math.max(1,Math.min(9,3+Math.floor(perfect/36)-
  Math.floor(flawed/27))),
  density=Math.max(1,Math.min(9,3+Math.floor(perfect/27)-
  Math.floor(flawed/36))),
  gatesSound=108-perfect-flawed,
  profile=Build.meridianProfile(4,{meridians:12,gatesP:perfect,
   gatesS:gatesSound,gatesF:flawed,seaRings:1,
   ...(profileExtra||{})});
 return {purity,density,profile,
  originalSource:'rules/disciplines.js:seaWork'};
}
module.exports={METHODS,originalBaselineStability,qualities,working,progress,formation};
