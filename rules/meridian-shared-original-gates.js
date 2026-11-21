'use strict';
// Shared immutable ORIGINAL Meridian laws extracted from the existing PC
// 108-Gate implementation, not a second ladder. The original source-owner
// rites/checks and individual physical evidence remain authoritative.
const Build=require('./build');
const validNumber=n=>Number.isInteger(n)&&n>=1&&n<=108;
function gateSpec(number){
 if(!validNumber(number))throw Error('Original Meridian Gate must be 1–108');
 const transition=number===36||number===72||number===108;
 const [band,points,baseDC]=number<=36?['Lower',3,13]:
  number<=72?['Middle',5,16]:['High',8,19];
 return {number,band,points,baseDC,
  transition,actualDC:baseDC+(transition?3:0),
  source:'rules/disciplines.js:gatePractice'};
}
function foundationBonus(quality){
 const bonuses={Perfect:2,Firm:1,Sound:0,Thin:-1,Cracked:-2};
 if(!Object.hasOwn(bonuses,quality))
  throw Error('Only an actually earned original Foundation quality is valid');
 return bonuses[quality];
}
function gateQuality(degree,foundation,forced=false){
 foundationBonus(foundation);
 if(typeof forced!=='boolean')throw Error('Original forced-circulation choice must be real');
 if(forced)return 'Flawed';
 if(degree==='exceptional'||degree==='strong'&&foundation==='Perfect')
  return 'Perfect';
 if(['strong','success','setback','failure','severe failure'].includes(degree))
  return 'Sound';
 throw Error('The original Core degree is required for gate quality');
}
function verifiedGates(gates){
 if(!Array.isArray(gates)||gates.length>108)
  throw Error('Only an actual ordered original 108-Gate record is valid');
 const counts={Perfect:0,Sound:0,Flawed:0};
 gates.forEach((g,i)=>{
  const spec=gateSpec(i+1);
  if(g?.number!==spec.number||g.band!==spec.band||
   !Object.hasOwn(counts,g.quality))
   throw Error('Original Meridian Gates require their individually recorded order, band and quality');
  counts[g.quality]++;
 });
 return counts;
}
function profile(stage,gates=[],extra={}){
 const counts=verifiedGates(gates);
 return Build.meridianProfile(stage,{meridians:12,gatesP:counts.Perfect,
  gatesS:counts.Sound,gatesF:counts.Flawed,...extra});
}
module.exports={gateSpec,foundationBonus,gateQuality,verifiedGates,profile};
