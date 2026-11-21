'use strict';
// Existing Combat.rest({weeks:1}) law applied after six ALREADY elapsed
// independent rest DAYS. The original NPC owns every individual decision;
// a sixday is NOT a calendar shortcut, a one-night cure, a clinic fee
// waiver, or a cure for Critical wounds. A previously personally witnessed
// safe sleeping place is mandatory for each of the six actual nights.
const Crypto=require('node:crypto'),Combat=require('../rules/combat'),
 Nights=require('../world/independent-original-power-days');
const ORIGIN='source-owned-independent-sixday-serious-convalescence-v1';
const H=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const validSeal=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function eligibleNights(p,body){
 const list=p?.originalOffscreenCombatNights;
 if(!Array.isArray(list)||list.length<6||body.status!=='ok'||
  body.wounds[1]<1||body.wounds[2]!==0)return null;
 const six=list.slice(-6),first=six[0]?.source,serious=body.wounds[1],
  site=first?.site,shelter=first?.originalWitnessedShelterHash;
 if(!site||!validSeal(shelter))return null;
 const previous=p.originalSeriousConvalescence?.at(-1)?.source;
 if(previous&&first.completedDay<=previous.completedDay)return null;
 for(let i=0;i<6;i++){
  const q=six[i]?.source;
  if(six[i].seal!==H(q)||!q||
   q.actorId!==p.actorId||q.site!==site||
   q.originalWitnessedShelterHash!==shelter||
   q.completedDay!==first.completedDay+i||
   q.before?.wounds?.[1]!==serious||
   q.after?.wounds?.[1]!==serious||
   q.before.wounds[2]!==0||q.after.wounds[2]!==0||
   q.before.status!=='ok'||q.after.status!=='ok')
   return null;
 }
 return six;
}
function verify(s,p){
 const rows=p?.originalSeriousConvalescence;
 if(rows===undefined)return true;
 if(!Array.isArray(rows)||rows.length>128)return false;
 const body=s.table?.combatants?.['npc_'+p.id];
 if(!body?.npcOrigin)return false;
 let completedDay=-1,priorSourceHash=null;
 for(const row of rows){
  const q=row?.source;
  if(!q||row.seal!==H(q)||q.origin!==ORIGIN||
   q.actorId!==p.actorId||q.personOriginHash!==p.originHash||
   q.originalCombatEntrySeal!==body.npcOrigin.seal||
   !Number.isInteger(q.startedDay)||q.startedDay<0||
   q.startedDay<=completedDay||
   q.completedDay!==q.startedDay+5||
   q.endMinute!==q.completedDay*1440||
   q.endMinute>s.world.minutes||
   !validSeal(q.originalShelterHash)||
   !Array.isArray(q.originalSixNights)||q.originalSixNights.length!==6||
   !Array.isArray(q.before?.wounds)||!Array.isArray(q.after?.wounds)||
   q.before.wounds.length!==3||q.after.wounds.length!==3||
   q.before.status!=='ok'||q.after.status!=='ok'||
   !Number.isInteger(q.before.wounds[1])||q.before.wounds[1]<1||
   q.before.wounds[2]!==0||q.after.wounds[2]!==0||
   q.after.wounds[1]!==q.before.wounds[1]-1||
   q.after.wounds[0]!==0||
   q.after.stamina!==q.before.stamina||
   q.after.maxStamina!==q.before.maxStamina||
   q.noExtraWorldTickOrMedicalRoll!==true||
   q.noCriticalHealingOrFreeClinicCare!==true||
   q.previousConvalescenceHash!==priorSourceHash)
   return false;
  let site=null;
  for(let i=0;i<6;i++){
   const n=q.originalSixNights[i],ns=n?.source;
   if(!ns||n.seal!==H(ns)||
    ns.actorId!==p.actorId||ns.physicalEntrySeal!==q.originalCombatEntrySeal||
    ns.completedDay!==q.startedDay+i||
    ns.originalWitnessedShelterHash!==q.originalShelterHash||
    (site!==null&&ns.site!==site)||
    ns.before?.wounds?.[1]!==q.before.wounds[1]||
    ns.after?.wounds?.[1]!==q.before.wounds[1]||
    ns.before.wounds[2]!==0||ns.after.wounds[2]!==0||
    ns.before.status!=='ok'||ns.after.status!=='ok')
    return false;
   site=ns.site;
  }
  if(site!==q.originalSite||
   !Nights.verifyNights(s,p,q.originalSixNights))
   return false;
  completedDay=q.completedDay;priorSourceHash=row.seal;
 }
 return true;
}
function afterNight(s,ctx){
 const {actor:p,body}=ctx;
 const six=eligibleNights(p,body);
 if(!six)return null;
 // Each night was already independently chosen, source-sealed and
 // physically applied. Recheck the ORIGINAL ledger before touching wounds.
 if(!Nights.verifyNights(s,p)||!verify(s,p))
  throw Error('Original sixday individual convalescence history failed');
 const before={wounds:[...body.wounds],stamina:body.stamina,
  maxStamina:body.maxStamina,status:body.status};
 const old=s.world.minutes,done=Combat.completedWeek(s,'npc_'+p.id),
  after={wounds:[...body.wounds],stamina:body.stamina,
   maxStamina:body.maxStamina,status:body.status};
 if(s.world.minutes!==old||done.additionalTimeAdvanced!==false||
  after.wounds[1]!==before.wounds[1]-1||
  after.wounds[2]!==before.wounds[2]||
  after.wounds[0]!==0)
  throw Error('Original completed sixday physical recovery violated Combat law');
 const last=p.originalSeriousConvalescence?.at(-1)||null,
  source={origin:ORIGIN,actorId:p.actorId,personOriginHash:p.originHash,
   originalCombatEntrySeal:body.npcOrigin.seal,
   startedDay:six[0].source.completedDay,
   completedDay:six[5].source.completedDay,
   endMinute:old,originalSite:six[0].source.site,
   originalShelterHash:six[0].source.originalWitnessedShelterHash,
   originalSixNights:structuredClone(six),before,after,
   previousConvalescenceHash:last?.seal||null,
   noExtraWorldTickOrMedicalRoll:true,
   noCriticalHealingOrFreeClinicCare:true};
 // Already paid clinic courses are separate; this was six consecutive
 // individually sourced rest days in a real safe bed, not invented surgery.
 const row={source,seal:H(source)};
 p.originalSeriousConvalescence||=[];
 if(p.originalSeriousConvalescence.length>=128)
  throw Error('Independent serious convalescence source ledger is full; no unverified further cure');
 p.originalSeriousConvalescence.push(row);
 if(!verify(s,p))throw Error('Real original Combat sixday recovery failed source replay');
 return {kind:'sixday-serious-convalescence',
  seriousWoundsRecovered:1,originalSourceHash:row.seal,
  noAdditionalWorldTime:true,noCriticalHealing:true,
  noPlayerKnowledge:true};
}
module.exports={ORIGIN,eligibleNights,afterNight,verify};
