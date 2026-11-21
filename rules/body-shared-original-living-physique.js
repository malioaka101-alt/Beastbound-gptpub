'use strict';
// Exact original Blood V, Adaptive VI and Evolved VII physiological law.
// The original witnessed individual anatomy and genuine source prerequisites
// remain owned by each actor adapter; numerical readiness is not a stage.
const Core=require('./core');
const SPEC=Object.freeze({
 5:{name:'Blood-Essence Cycle',kind:'blood',dc:19,energy:3,bonus:2,
  sources:['circulationMeasurement','metabolicLimit'],
  nature:'Existing blood, tissue oxygenation, nutrition and compatible energy'},
 6:{name:'Adaptive Physique Cycle',kind:'adaptive',dc:20,energy:3,bonus:1,
  sources:['environmentalCondition','reversibleResponse'],
  nature:'Actually observed bounded and reversible biological response'},
 7:{name:'Evolved Physique Cycle',kind:'evolved',dc:22,energy:5,bonus:2,
  sources:['individualConstitution','lifespanBoundary'],
  nature:'Unique coordinated human physique, vulnerable and metabolic'}
});
const GOAL=6,REPAIR_DC=15;
function checkSpec(cycle,kind,con,verifiedSurvivalRank,strain){
 const sp=SPEC[cycle];
 if(!sp||!['work','care','form','repeat'].includes(kind))
  throw Error('Original individual physique procedure required');
 return {dc:kind==='care'?REPAIR_DC:kind==='form'?sp.dc+3:kind==='repeat'?sp.dc+1:sp.dc,
  cost:kind==='care'?2:['form','repeat'].includes(kind)?sp.energy+2:sp.energy,
  modifier:Math.floor((con-10)/2)+2*verifiedSurvivalRank-Math.floor(strain/3)};
}
function workState(points,strain,check){
 const earned=check.success?Core.progress(check.degree):0,
  strainAdded=check.degree==='severe failure'?3:0;
 return {points:Math.min(GOAL,points+earned),
  strain:Math.min(100,strain+strainAdded),earned,strainAdded};
}
const repaired=(strain,check)=>check.success?Math.max(0,strain-2):strain;
const ready=(points,strain)=>points===GOAL&&strain<=2;
module.exports={SPEC,GOAL,REPAIR_DC,checkSpec,workState,repaired,ready};
