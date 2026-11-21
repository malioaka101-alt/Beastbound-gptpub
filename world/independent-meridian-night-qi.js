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
 // Recheck the immutable complete night ledger ONCE per synchronous replay,
 // not for every individual Qi receipt. Never persist this across turns:
 // a later world day or edited history must receive a fresh full audit.
 const checkedHistory={offscreen:false,witnessed:false};
 if(!rows.length)return {energy:now,index:i,end};
 // Each receipt must have an original independent source: either an
 // actually witnessed safe eight-hour sleep or the already source-sealed
 // original off-screen personal night. Merely advancing time grants none.
 for(;i<rows.length;i++){
  const row=rows[i],q=row?.source;
  if(!q||row.seal!==hash(q)||!good(q.completedMinute)||
   (i>0&&q.completedDay<=rows[i-1]?.source?.completedDay))
   return null;
  if(q.completedMinute>=limit)break;
  if(q.origin!==ORIGIN||q.actorId!==p.actorId||
   q.individualOriginHash!==p.originHash||
   q.originalCombatEntrySeal!==
    s.table?.combatants?.['npc_'+p.id]?.npcOrigin?.seal||
   !verifiedNight(s,p,q,checkedHistory)||
   q.completedMinute<=end||q.completedMinute>s.world.minutes||
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
function verifiedNight(s,p,q,checkedHistory=null){
 if(!q||!['offscreen','witnessed'].includes(q.sourceKind)||
  typeof q.originalNightSeal!=='string'||q.originalNightSeal.length!==64||
  !good(q.completedDay)||!good(q.completedMinute)||
  (q.sourceKind==='offscreen'&&
   q.completedMinute!==q.completedDay*1440)||
  (q.sourceKind==='witnessed'&&
   (q.completedMinute<q.completedDay*1440||
    q.completedMinute>q.completedDay*1440+90)))return false;
 try{
  if(q.sourceKind==='offscreen'){
   const Offscreen=require('./independent-original-power-days');
   if(!checkedHistory?.offscreen){
    if(!Offscreen.verifyNights(s,p))return false;
    if(checkedHistory)checkedHistory.offscreen=true;
   }
   const row=(p.originalOffscreenCombatNights||[]).find(x=>
    x.seal===q.originalNightSeal);
   // The original physical-night owner retains a rolling 480-night ledger.
   // A Qi restoration must survive that ledger ageing out only when its
   // complete ORIGINAL night source was retained in the restoration receipt
   // and still passes the same original verified-night rules.
   if(q.originalNightSource!==undefined&&
    hash(q.originalNightSource)!==q.originalNightSeal)return false;
   if(!row&&!q.originalNightSource)return false;
   if(!row&&!Offscreen.verifyNights(s,p,[{
    source:q.originalNightSource,seal:q.originalNightSeal
   }]))return false;
   const source=row?.source||q.originalNightSource;
   return !!source&&hash(source)===q.originalNightSeal&&
    source.actorId===p.actorId&&
    source.completedDay===q.completedDay&&
    source.endMinute===q.completedMinute&&
    source.noAdditionalPlayerTimeOrFreePower===true;
  }
  const Health=require('../rules/unified');
  if(!checkedHistory?.witnessed){
   if(!Health.verifyNpcNightHistory(s,p.actorId))return false;
   if(checkedHistory)checkedHistory.witnessed=true;
  }
  const row=(p.originalOvernightRestDecisions||[]).find(x=>
   x.sourceHash===q.originalNightSeal);
  return !!row&&row.sourceHash===hash(row.source)&&
   row.source.actorId===p.actorId&&
   row.source.accepted===true&&row.result?.accepted===true&&
   row.result.elapsedMinutes===480&&
   row.result.endedMinute===q.completedMinute&&
   row.result.originalCombatEntrySeal===q.originalCombatEntrySeal;
 }catch{return false;}
}
function recover(s,p,night,sourceKind){
 const selected=active(p);
 if(!selected)return null;
 const [kind,state]=selected,energy=state.energy;
 if(!energy||!good(energy.maxQi)||!good(energy.currentQi)||
  energy.currentQi>energy.maxQi)
  throw Error('Original independent Meridian Qi capacity is not valid');
 if(energy.currentQi===energy.maxQi)return null;
 const stamp=sourceKind==='offscreen'?{
  originalCombatEntrySeal:s.table.combatants['npc_'+p.id].npcOrigin.seal,
  sourceKind,originalNightSeal:night?.seal,
  completedDay:night?.source?.completedDay,
  completedMinute:night?.source?.endMinute
 }:sourceKind==='witnessed'?{
  originalCombatEntrySeal:s.table.combatants['npc_'+p.id].npcOrigin.seal,
  sourceKind,originalNightSeal:night?.sourceHash,
  completedDay:Math.floor((night?.result?.endedMinute??-1)/1440),
  completedMinute:night?.result?.endedMinute
 }:null;
 if(!verifiedNight(s,p,stamp))
  throw Error('Only the actor\'s verified personal completed night can restore Qi');
 const owner={
  sea:'./independent-meridian-sea',
  web:'./independent-meridian-web',
  advanced:'./independent-meridian-advanced'}[kind];
 const verify=require(owner).verify;
 if(!verify(s,p))throw Error('Pre-rest Meridian source no longer replays');
 const rows=state.rests||[];
 if(rows.length>=480||rows.some(x=>
   x.source?.originalNightSeal===stamp.originalNightSeal||
   x.source?.completedMinute===stamp.completedMinute||
   x.source?.completedDay===stamp.completedDay))
  throw Error('Duplicate or unreconciled Meridian rest is not permitted');
 const before=structuredClone(energy),after=structuredClone(energy),
  restored=Math.min(RECOVER,energy.maxQi-energy.currentQi);
 after.currentQi+=restored;
 const q={origin:ORIGIN,actorId:p.actorId,
  individualOriginHash:p.originHash,
  originalCombatEntrySeal:
   s.table.combatants['npc_'+p.id].npcOrigin.seal,
  sourceKind:stamp.sourceKind,
  originalNightSeal:stamp.originalNightSeal,
  ...(sourceKind==='offscreen'?{
   originalNightSource:structuredClone(night.source)}:{}),
  completedDay:stamp.completedDay,
  completedMinute:stamp.completedMinute,
  restoredQi:restored,energyBefore:before,energyAfter:after,
  originalRecoveryOwner:'rules/unified.js:sleep',
  noSecondWorldTickOrUnlearnedPower:true};
 rows.push({source:q,seal:hash(q)});
 state.rests=rows;state.energy=after;
 if(!verify(s,p))
  throw Error('Evidenced Meridian night Qi failed exact source replay');
 return {restoredQi:restored,originalNightSeal:stamp.originalNightSeal,
  noAdditionalPlayerTime:true,privateToGM:true};
}
function afterNight(s,p,night){return recover(s,p,night,'offscreen');}
function afterWitnessedNight(s,p,night){
 return recover(s,p,night,'witnessed');
}
module.exports={ORIGIN,RECOVER,active,replayUntil,afterNight,
 afterWitnessedNight};
