'use strict';
// Immutable original Third Circle matrix law shared by the established
// player Disciplines.matrixWork and fully source-replayed independent NPC.
// This does not grant spells, other systems, school ranks or free Mana.
const DC=20,MANA_COST=4,REQUIRED=6;
const staminaCost=minutes=>Math.ceil(minutes/120);
const stabilityBonus=stability=>stability>=85?1:stability<60?-2:0;
const earned=check=>check.degree==='exceptional'?6:
 check.degree==='strong'?3:check.degree==='success'?2:0;
const stabilityAfter=(before,check)=>check.degree==='severe failure'?
 Math.max(0,before-9):check.success?Math.min(100,before+1):before;
const integrity=(margin,attemptCount,stability)=>Math.min(100,Math.max(40,
 58+Math.max(0,margin)*2+Math.min(12,attemptCount*2)-
 Math.max(0,80-stability)));
module.exports=Object.freeze({DC,MANA_COST,REQUIRED,staminaCost,stabilityBonus,
 earned,stabilityAfter,integrity});
