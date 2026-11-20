'use strict';
// Reconcile the EXISTING player overnight Qi replenishment with an NPC's
// source-evidenced, independently chosen ORIGINAL full-night Combat recovery.
// This is not passive world-time regeneration and does not create a new
// Meridian stage, discipline or substitute source history.
const Crypto=require('node:crypto');
const ORIGIN='original-independent-meridian-verified-night-qi-v1';
const RECOVER=10; // rules/unified.js:sleep: actual eight-hour night
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const good=x=>Number.isInteger(x)&&x>=0;
function active(p){
 if(p.originalMeridianAdvanced)return ['advanced',p.originalMeridianAdvanced];
 if(p.originalMeridianWeb)return ['web',p.originalMeridianWeb];
 if(p.originalMeridianSea)return ['sea',p.originalMeridianSea];
 return null; // Stage II/III have no spent NPC Qi techniques yet.
}
function replayUntil(s,p,rows,index,limit,energy,priorEnd=0){
 if(!Array.isArray(rows)||rows.length>480||
  !good(index)||index>rows.length||!good(priorEnd)||
  !energy||!good(energy.currentQi)||!good(energy.maxQi)||
  energy.currentQi>energy.maxQi)return null;
 let end=priorEnd,now=structuredClone(energy),i=index;
 if(!rows.length)return {energy:now,index:i,end};
 const Night=require('./independent-original-power-days');
 if(!Night.verifyNights(s,p))return null;
 const sourceNights=p.originalOffscreenCombatNights||[];
 for(;i<rows.length;i++){
  const row=rows[i],q=row?.source;
  if(!q||row.seal!==hash(q)||!good(q.completedMinute))
   return null;
  if(q.completedMinute>=limit)break;
  const night=sourceNights.find(x=>x.seal===q.originalNightSeal);
  if(!night||q.origin!==ORIGIN||q.actorId!==p.actorId||
   q.individualOriginHash!==p.originHash||
   q.originalCombatEntrySeal!==
    s.table?.combatants?.['npc_'+p.id]?.npcOrigin?.seal||
   q.completedDay!==night.source.completedDay||
   q.completedMinute!==night.source.endMinute||
   q.completedMinute<=end||q.completedMinute>s.world.minutes||
   night.source.actorId!==p.actorId||
   night.source.noAdditionalPlayerTimeOrFreePower!==true||
   q.originalRecoveryOwner!=='rules/unified.js:sleep'||
   q.noSecondWorldTickOrUnlearnedPower!==true||
   JSON.stringify(q.energyBefore)!==JSON.stringify(now))
   return null;
  const recovered=Math.min(RECOVER,now.maxQi-now.currentQi);
  if(recovered<=0||q.restoredQi!==recovered)return null;
  now.currentQi+=recovered;
  if(JSON.stringify(q.energyAfter)!==JSON.stringify(now))return null;
  end=q.completedMinute;
 }
 return {energy:now,index:i,end};
}
function afterNight(s,p,night){
 const selected=active(p);
 if(!selected)return null;
 const [kind,state]=selected,energy=state.energy;
 if(!energy||!good(energy.maxQi)||!good(energy.currentQi)||
  energy.currentQi>energy.maxQi)
  throw Error('Original independent Meridian Qi capacity is not valid');
 if(energy.currentQi===energy.maxQi)return null;
 if(!night||night.seal!==hash(night.source)||
  night.source.actorId!==p.actorId||
  !require('./independent-original-power-days').verifyNights(s,p))
  throw Error('Only the actor\'s verified personal completed night can restore Qi');
 const owner={
  sea:'./independent-meridian-sea',
  web:'./independent-meridian-web',
  advanced:'./independent-meridian-advanced'}[kind];
 const verify=require(owner).verify;
 if(!verify(s,p))throw Error('Pre-rest Meridian source no longer replays');
 const rows=state.rests||[];
 if(rows.length>=480||rows.some(x=>
   x.source?.originalNightSeal===night.seal))
  throw Error('Duplicate or unreconciled Meridian rest is not permitted');
 const before=structuredClone(energy),after=structuredClone(energy),
  restored=Math.min(RECOVER,energy.maxQi-energy.currentQi);
 after.currentQi+=restored;
 const q={origin:ORIGIN,actorId:p.actorId,
  individualOriginHash:p.originHash,
  originalCombatEntrySeal:
   s.table.combatants['npc_'+p.id].npcOrigin.seal,
  originalNightSeal:night.seal,
  completedDay:night.source.completedDay,
  completedMinute:night.source.endMinute,
  restoredQi:restored,energyBefore:before,energyAfter:after,
  originalRecoveryOwner:'rules/unified.js:sleep',
  noSecondWorldTickOrUnlearnedPower:true};
 rows.push({source:q,seal:hash(q)});
 state.rests=rows;state.energy=after;
 if(!verify(s,p))
  throw Error('Evidenced Meridian night Qi failed exact source replay');
 return {restoredQi:restored,originalNightSeal:night.seal,
  noAdditionalPlayerTime:true,privateToGM:true};
}
module.exports={ORIGIN,RECOVER,active,replayUntil,afterNight};
