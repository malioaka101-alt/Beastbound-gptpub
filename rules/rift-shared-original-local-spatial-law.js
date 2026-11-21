'use strict';
// Original spatial physics, shared without inventing a realm passage.
const Exterior=require('./rift-shared-original-exterior-sense');
const pressureAdjust=snapshot=>({unstable:6,elevated:3,contained:0})[Exterior.risk(snapshot)];
function pressureIdentity(v){
 return Exterior.digest({phase:v.phase,charge:v.charge,seal:v.seal,
  pressure:v.ecosystemPressure,worldSeed:v.worldSeed,day:v.day});
}
function foldSpec(distance,strain,pressure,attribute,rank,weave=0,domain=0){
 return {dc:16+Math.ceil(distance/4)+pressure+Math.floor(strain/12)-Math.max(weave,domain),
  modifier:Math.floor((attribute-10)/2)+2*rank,stamina:2,minutes:5};
}
function weaveSpec(area,minutes,strain,pressure,attribute,rank){
 return {dc:18+Math.ceil(area/4)+pressure+Math.floor(strain/12),
  modifier:Math.floor((attribute-10)/2)+2*rank,stamina:3+Math.ceil(minutes/120),minutes};
}
const strainAdded=check=>check.degree==='severe failure'?6:0;
function pocketSpec(capacity,minutes,strain,pressure,attribute,rank){
 return {dc:19+Math.ceil(capacity/2)+pressure+Math.floor(strain/12),
  modifier:Math.floor((attribute-10)/2)+2*rank,stamina:5+Math.ceil(minutes/180),minutes};
}
function adaptationSpec(progress,minutes,strain,pressure,attribute,rank){
 return {dc:18+pressure+Math.floor(strain/12)-(progress===2?1:0),
  modifier:Math.floor((attribute-10)/2)+2*rank,stamina:3+Math.ceil(minutes/90),minutes};
}
const pocketStrainAdded=check=>check.degree==='severe failure'?8:0;
function walkSpec(kind,minutes,risk,attribute,rank){
 if(!['prepare','enter','return'].includes(kind))throw Error('Original selected realm action required');
 return {dc:(kind==='enter'?19:18)+risk,
  modifier:Math.floor((attribute-10)/2)+2*rank,stamina:kind==='enter'?5:4,minutes};
}

module.exports=Object.freeze({pressureAdjust,pressureIdentity,foldSpec,weaveSpec,pocketSpec,adaptationSpec,walkSpec,strainAdded,pocketStrainAdded});
