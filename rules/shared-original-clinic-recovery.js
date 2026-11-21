'use strict';
// Actor-independent projection of the ALREADY EXISTING paid sixday serious
// wound recovery in rules/clinic-care.js:recover. This module NEVER performs
// care, time advancement, payment, consent, or clinical admission itself.
// A source-verified actual physician, payment and elapsed stay are still
// mandatory in each actor's clinical action owner.
const DAYS=6,COST_SCALES=3000,
 ORIGINAL_OWNER='rules/clinic-care.js:recover';
const integer=(n,min=0,max=100000)=>Number.isInteger(n)&&n>=min&&n<=max;
function project(c){
 if(!c||c.status!=='ok'||!Array.isArray(c.wounds)||
  c.wounds.length!==3||!Array.isArray(c.boxes)||c.boxes.length!==3||
  !c.boxes.every(x=>integer(x,1,20))||
  c.wounds.some((n,i)=>!integer(n,0,c.boxes[i]))||
  c.wounds[1]<1||c.wounds[2]>0||
  !integer(c.maxStamina,0,10000)||!integer(c.stamina,0,c.maxStamina))
  throw Error('Original paid clinic course requires a conscious human with a verified Serious wound, no Critical wound and the real Combat body');
 return {originalOwner:ORIGINAL_OWNER,
  requiredStayDays:DAYS,requiredFeeScales:COST_SCALES,
  seriousBefore:c.wounds[1],lightBefore:c.wounds[0],
  woundsAfter:[0,c.wounds[1]-1,c.wounds[2]],
  staminaAfter:c.maxStamina,recoverUsesAfter:0,
  firstAidedAfter:false,noCriticalWoundTreatment:true,
  noMedicalRoll:true,noTimeOrMoneyChangedByProjection:true};
}
module.exports={DAYS,COST_SCALES,ORIGINAL_OWNER,project};
