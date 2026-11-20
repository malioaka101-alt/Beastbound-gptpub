'use strict';
// Exact immutable law factored out of Disciplines.arcaneCircleWork.
// NPC and player share the ORIGINAL Second Circle dual-channel work:
// 2 real Mana, DC17, 4 verified integrity, degree-specific gains and
// severe failure -7 Core stability plus original Combat.harm(2).
// This is NOT a new rank table, spell unlock or free resource generator.
const DC=17,MANA_COST=2,REQUIRED=4;
const stabilityBonus=stability=>stability>=85?1:stability<60?-2:0;
const earned=check=>check.success?
 check.degree==='exceptional'?4:check.degree==='strong'?3:2:0;
const stabilityAfter=(before,check)=>check.degree==='severe failure'?
 Math.max(0,before-7):check.success?Math.min(100,before+1):before;
module.exports=Object.freeze({DC,MANA_COST,REQUIRED,stabilityBonus,earned,stabilityAfter});
