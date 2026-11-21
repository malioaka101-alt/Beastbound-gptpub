'use strict';
// One immutable Phase II Soul Threading law for original player and NPC.
// Actual personally owned Soul reserve, physical Stamina, mind/body/resonance
// links, structural integration and severe identity backlash are mandatory.
const LINKS=Object.freeze(['mind','body','resonance']);
const FOCI=Object.freeze([...LINKS,'integrated']);
const DC=16,RESERVE_COST=2;
const requiredPerLink=2;
const staminaCost=minutes=>Math.ceil(minutes/120);
const gain=check=>check.degree==='exceptional'?3:
 check.degree==='strong'?2:check.degree==='success'?1:0;
function grow(links,integrated,focus,degree){
 const updated={...links},earned=gain({degree});
 if(earned){
  if(focus==='integrated'){
   integrated=true;
   for(const k of LINKS)updated[k]=Math.min(requiredPerLink,
    updated[k]+(degree==='exceptional'?2:1));
  }else updated[focus]=Math.min(requiredPerLink,updated[focus]+earned);
 }
 return {links:updated,integrated,earned};
}
const stabilityAfter=(before,check)=>check.degree==='severe failure'?
 Math.max(1,before-6):before;
const integrity=margin=>Math.max(40,Math.min(100,65+Math.max(0,margin)*2));
const formed=(links,integrated)=>integrated&&
 LINKS.every(k=>links[k]>=requiredPerLink);
module.exports=Object.freeze({LINKS,FOCI,DC,RESERVE_COST,requiredPerLink,
 staminaCost,gain,grow,stabilityAfter,integrity,formed});
