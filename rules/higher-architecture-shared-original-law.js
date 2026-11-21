'use strict';
// Numerical laws of the original player architecture owners. Actor choice,
// identity, evidence, resources and actual check remain separate concerns.
const Core=require('./core');
function arcaneFourth(kind,minutes,intelligence,rank,stability){
 const mod=Math.floor((intelligence-10)/2)+2*rank;
 if(kind==='practice')return {dc:21,energy:3,stamina:Math.ceil(minutes/120)+1,modifier:mod+Math.floor(stability/25)-2};
 if(kind==='repair')return {dc:14,energy:2,stamina:Math.ceil(minutes/120)+1,modifier:mod};
 if(kind==='form')return {dc:24,energy:8,stamina:Math.ceil(minutes/90)+2,modifier:mod+Math.floor(stability/25)-2};
 throw Error('Original Fourth Circle activity required');
}
function arcaneHigher(spec,kind,minutes,intelligence,rank,stability){
 const mod=Math.floor((intelligence-10)/2)+2*rank;
 if(kind==='practice')return {dc:spec.dc,energy:spec.minuteCost,stamina:Math.ceil(minutes/120)+1,modifier:mod+Math.floor(stability/30)-2};
 if(kind==='repair')return {dc:14,energy:2,stamina:Math.ceil(minutes/120)+1,modifier:mod};
 if(kind==='form')return {dc:spec.dc+3,energy:spec.minuteCost+4,stamina:Math.ceil(minutes/90)+2,modifier:mod+Math.floor(stability/30)-2};
 throw Error('Original advanced Arcane activity required');
}
function soulHigher(spec,kind,minutes,wisdom,rank,stability){
 const mod=Math.floor((wisdom-10)/2)+2*rank;
 if(kind==='practice')return {dc:spec.dc,energy:spec.cost,stamina:Math.ceil(minutes/120)+1,modifier:mod+Math.floor(stability/30)-1};
 if(kind==='repair')return {dc:14,energy:2,stamina:Math.ceil(minutes/120)+1,modifier:mod};
 if(kind==='form')return {dc:spec.dc+3,energy:spec.cost+3,stamina:Math.ceil(minutes/90)+2,modifier:mod+Math.floor(stability/25)-2};
 throw Error('Original higher Soul activity required');
}
function arcaneState(stage,kind,points,strain,stability,check){
 const damage=kind==='practice'&&check.degree==='severe failure'?3:0;
 return {points:kind==='practice'&&check.success?Math.min(6,points+Core.progress(check.degree)):points,
  strain:kind==='repair'&&check.success?Math.max(0,strain-2):Math.min(100,strain+damage),
  stability:damage?Math.max(1,stability-damage*(stage===4?2:1)):
   kind==='repair'&&check.success?Math.min(100,stability+(stage===4?2:1)):stability,
  wound:false};
}
function soulState(kind,points,strain,stability,check){
 const damage=kind==='practice'&&check.degree==='severe failure'?3:0;
 return {points:kind==='practice'&&check.success?Math.min(6,points+Core.progress(check.degree)):points,
  strain:kind==='repair'&&check.success?Math.max(0,strain-2):Math.min(100,strain+damage),
  stability:damage?Math.max(1,stability-damage):
   kind==='repair'&&check.success?Math.min(100,stability+2):stability,
  wound:damage>0};
}
module.exports=Object.freeze({arcaneFourth,arcaneHigher,soulHigher,arcaneState,soulState});
