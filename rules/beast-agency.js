'use strict';
// A beast is an independent individual: social checks never override bodily
// distress, an observed boundary, or a persistent individual inclination.
// These are *preconditions* to a human skill check, not bonuses supplied by it.
const crypto=require('node:crypto');
const CHOICES=['affiliative','curious','reserved','independent'];
const ACTIVITIES=['gentle','play','light_contract','grade_exam','daily_care','evolution_rite'];
function profile(s,b){
 const existing=b.agencyProfile;
 if(existing!==undefined){
  if(!existing||!CHOICES.includes(existing.disposition)||
     existing.origin!=='individual-behaviour-v1')
   throw Error('Unreconciled individual beast agency record');
  return existing;
 }
 const tags=Array.isArray(b.personalityTags)?b.personalityTags.map(x=>String(x).toLowerCase()):[];
 const disposition=tags.includes('solitary')||tags.includes('independent')?'independent':
   tags.includes('timid')||tags.includes('shy')?'reserved':
   tags.includes('playful')||tags.includes('affiliative')||tags.includes('sociable')?'affiliative':
   CHOICES[crypto.createHash('sha256').update(String(s.seed)+'|'+String(b.id)+'|agency-v1').digest()[0]%CHOICES.length];
 return {disposition,origin:'individual-behaviour-v1'};
}
// Reactions are calculated purely. Persist the unique animal's predisposition
// only in a verified, committed turn, never when checking invalid prerequisites.
function remember(s,b){
 const p=profile(s,b);
 if(!b.agencyProfile)b.agencyProfile=p;
 return p;
}
function evaluate(s,b,bond,activity){
 if(!ACTIVITIES.includes(activity))throw Error('Unknown individual beast activity');
 if(!b||!bond)throw Error('Beast and established relationship required for agency decision');
 const p=profile(s,b);
 const observed=b.agencyBoundaries;
 if(observed!==undefined){
  if(!observed||!Array.isArray(observed.avoid)||observed.avoid.some(x=>!ACTIVITIES.includes(x))||
     typeof observed.source!=='string'||observed.source.trim().length<18||
     !Number.isInteger(observed.worldMinute)||observed.worldMinute<0||
     observed.worldMinute>s.world.minutes)
   throw Error('Unverified recorded individual behavioural boundary');
  if(observed.avoid.includes(activity))
   return {possible:false,reason:'The beast maintains a previously observed refusal'};
 }
 const mood=String(b.mood||'').toLowerCase();
 if(/terrified|panicked|hostile|fleeing|desperate/.test(mood)||
    ['captured','forced','coerced','imprisoned'].includes(String(b.relationship||'').toLowerCase()))
  return {possible:false,reason:'The beast does not freely engage in this state'};
 const needs=b.needs;
 if(!needs||!Number.isFinite(needs.hunger)||!Number.isFinite(needs.fatigue)||
    needs.hunger<0||needs.hunger>100||needs.fatigue<0||needs.fatigue>100||
    (b.condition!==undefined&&(!Number.isFinite(b.condition)||b.condition<0||b.condition>100)))
  return {possible:false,reason:'The beast welfare condition is not established'};
 if(needs.hunger>=70||needs.fatigue>=70||
    (b.condition!==undefined&&b.condition<60)||
    (Array.isArray(b.injuries)&&b.injuries.length>0)||
    (Array.isArray(b.conditions)&&b.conditions.length>0))
  return {possible:false,reason:'The beast requires space, rest or care rather than a social demand'};
 // Persistent, individual preference, independent of Charisma, dice and action
 // order. A later bond can change willingness but not rewrite the individual.
 const trust=bond.trust,respect=bond.respect;
 if(!Number.isFinite(trust)||trust<0||trust>100||
    !Number.isFinite(respect)||respect<0||respect>100)
  throw Error('Invalid recorded beast relationship bounds');
 if((activity==='play'&&((p.disposition==='reserved'&&trust<50)||
      (p.disposition==='independent'&&trust<75)))||
    (activity==='gentle'&&p.disposition==='independent'&&trust<5)||
    (activity==='light_contract'&&((p.disposition==='independent'&&trust<80)||
       (p.disposition==='reserved'&&respect<55)))||
    (activity==='grade_exam'&&p.disposition==='independent'&&trust<70)||
    (activity==='evolution_rite'&&((p.disposition==='independent'&&trust<85)||
      (p.disposition==='reserved'&&trust<65))))
  return {possible:false,reason:'The beast declines this interaction on its own terms'};
 return {possible:true};
}
module.exports={evaluate,profile,remember};
