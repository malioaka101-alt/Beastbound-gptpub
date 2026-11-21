'use strict';
// Canonically sourced Phase III RESONANCE LATTICE physical/check law shared
// by original personal-soul-resonance-lattice.js and independent NPCs.
// NOT a learned art, contract, other mind, pact, summon, regeneration,
// universal rank system or a substitute for observed identity boundaries.
const Core=require('./core');
const GOAL=5,MAX_STRAIN=100,
 PRACTICE_DC=17,REPAIR_DC=14,FORMATION_DC=21,
 PRACTICE_RESERVE=2,REPAIR_RESERVE=1,FORMATION_RESERVE=4,
 FORMATION_INTEGRITY=1;
const practiceStamina=minutes=>1+Math.ceil(minutes/120);
const repairStamina=minutes=>1+Math.ceil(minutes/120);
const formationStamina=minutes=>2+Math.ceil(minutes/90);
const earned=check=>check.success?Core.progress(check.degree):0;
const practiceState=(points,strain,check)=>({
 points:Math.min(GOAL,points+earned(check)),
 strain:Math.min(MAX_STRAIN,strain+(check.degree==='severe failure'?3:0)),
 stabilityLost:check.degree==='severe failure'?3:0
});
const repairState=(strain,stability,check)=>({
 strain:check.success?Math.max(0,strain-2):strain,
 stability:check.success?Math.min(100,stability+2):stability
});
const formationModifier=(will,cultivationRank,stability)=>
 will+2*cultivationRank+Math.floor(stability/25)-2;
const formationReady=(points,strain)=>points>=GOAL&&strain<=2;
module.exports=Object.freeze({GOAL,MAX_STRAIN,PRACTICE_DC,REPAIR_DC,
 FORMATION_DC,PRACTICE_RESERVE,REPAIR_RESERVE,FORMATION_RESERVE,
 FORMATION_INTEGRITY,practiceStamina,repairStamina,formationStamina,
 earned,practiceState,repairState,formationModifier,formationReady});
