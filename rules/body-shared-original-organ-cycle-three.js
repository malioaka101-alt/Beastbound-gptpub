'use strict';
// Original Cycle III: verified integrated heart/lungs/liver/kidneys.
// No generic body XP, mandatory elapsed stage days, Qi or spell grant.
const Core=require('./core');
const ORGANS=Object.freeze(['heart','lungs','liver','kidneys']);
const FOCI=Object.freeze([...ORGANS,'integrated']);
const DC=17,REQUIRED_PER_ORGAN=2,
 STAMINA_GAIN=2,TOUGHNESS_GAIN=1,CRITICAL_BOX_GAIN=1;
const staminaCost=minutes=>Math.ceil(minutes/120);
const gain=degree=>Core.progress(degree);
const empty=()=>({heart:0,lungs:0,liver:0,kidneys:0});
function grow(organLevels,integrated,focus,degree){
 if(!FOCI.includes(focus))throw Error('A real original organ focus is required');
 const next={...organLevels},earned=gain(degree);
 if(earned){
  if(focus==='integrated'){
   integrated=true;
   for(const organ of ORGANS)next[organ]=Math.min(REQUIRED_PER_ORGAN,
    next[organ]+(degree==='exceptional'?2:1));
  }else next[focus]=Math.min(REQUIRED_PER_ORGAN,next[focus]+earned);
 }
 return {organs:next,integrated,earned};
}
const formed=(organs,integrated)=>integrated&&
 ORGANS.every(k=>organs[k]>=REQUIRED_PER_ORGAN);
module.exports=Object.freeze({ORGANS,FOCI,DC,REQUIRED_PER_ORGAN,STAMINA_GAIN,
 TOUGHNESS_GAIN,CRITICAL_BOX_GAIN,staminaCost,gain,empty,grow,formed});
