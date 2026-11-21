'use strict';
// Rift Anchor Marking Step II source law shared with the original PC owner.
// A real prior original successful Rift Sense measurement plus changing
// measured pressure is required. Anchor is a bounded reference, never a
// Fold, vault entry, portal or spatial travel permit.
const Core=require('./core'),Sense=require('./rift-shared-original-exterior-sense');
const SITE='riftglass_exterior_wardline';
const AXES=Object.freeze(['bearing','resonance','stability']);
const FOCI=Object.freeze([...AXES,'integrated']);
const required=2;
const staminaCost=minutes=>2+Math.ceil(minutes/120);
const dc=snapshot=>({unstable:22,elevated:20,contained:18})[Sense.risk(snapshot)];
const gain=degree=>Core.progress(degree);
function grow(axes,integrated,focus,degree){
 if(!FOCI.includes(focus))throw Error('Original physical Rift anchor focus is invalid');
 const next={...axes},earned=gain(degree);
 if(earned){
  if(focus==='integrated'){
   integrated=true;
   for(const k of AXES)next[k]=Math.min(required,next[k]+
    (degree==='exceptional'?2:1));
  }else next[focus]=Math.min(required,next[focus]+earned);
 }
 return {axes:next,integrated,earned};
}
const formed=(axes,integrated)=>integrated&&AXES.every(k=>axes[k]>=required);
const strainAfter=(before,degree,success)=>
 degree==='severe failure'?Math.min(100,before+8):
 success?Math.max(0,before-2):before;
const integrity=(margin,strain)=>Math.max(40,Math.min(100,
 60+Math.max(0,margin)*2-strain));
module.exports=Object.freeze({SITE,AXES,FOCI,required,staminaCost,dc,gain,
 grow,formed,strainAfter,integrity});
