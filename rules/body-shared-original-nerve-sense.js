'use strict';
// Original Nerve–Sense mechanics, not a new or simplified rank ladder.
// The map is individually witnessed and open-ended; these functions
// never create anatomical regions or observation witnesses.
const Core=require('./core');
const PRACTICE_DC=18,REPAIR_DC=15,FORMATION_DC=21,
 REQUIRED_PER_REGION=2,STAMINA_GAIN=1;
const practiceStamina=m=>Math.ceil(m/90)+1;
const repairStamina=m=>Math.ceil(m/120)+1;
const formationStamina=m=>3+Math.ceil(m/90);
function grow(progress,integrated,focus,check){
 const after={...progress},earned=check.success?Core.progress(check.degree):0,
  strainAdded=check.degree==='severe failure'?3:0;
 if(earned){
  if(focus==='integrated')integrated=true;
  for(const id of Object.keys(after))
   if(id===focus||focus==='integrated')
    after[id]=Math.min(REQUIRED_PER_REGION,after[id]+
     (focus==='integrated'?(check.degree==='exceptional'?2:1):earned));
 }
 return {progress:after,integrated,earned,strainAdded};
}
const repaired=(strain,check)=>check.success?Math.max(0,strain-2):strain;
const ready=(progress,integrated,strain)=>integrated&&
 Object.keys(progress).length>=2&&Object.values(progress).every(x=>x===REQUIRED_PER_REGION)&&strain<=2;
module.exports=Object.freeze({PRACTICE_DC,REPAIR_DC,FORMATION_DC,REQUIRED_PER_REGION,
 STAMINA_GAIN,practiceStamina,repairStamina,formationStamina,grow,repaired,ready});
