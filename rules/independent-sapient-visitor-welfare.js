'use strict';
// Individual sapient-person welfare while PHYSICALLY visiting an original
// non-native facility. Reuses the original sapient self-directed recovery
// fatigue effect (world/sapient-beast-persons.js:sixday: -8) and original
// personal RNG/social choice, not a fabricated free beast partner night.
// A genuinely present safe independent refuge must be witnessed. No food,
// habitat forage, medicine, ownership, magic or human rest is inferred.
const Crypto=require('node:crypto'),E=require('../engine'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Person=require('../world/sapient-beast-persons'),Visit=require('./independent-sapient-terrestrial-journey'),
 Presence=require('../world/person-presence'),Agency=require('./beast-agency'),
 Social=require('./beast-social-arrangements'),World=require('./world');
const ORIGIN='original-sapient-individual-visiting-refuge-choice-v1',
 WITNESS='gm-witnessed-independent-visiting-sapient-safe-refuge-v1',
 RECOVERY_OWNER='world/sapient-beast-persons.js:sixday',
 RECOVERY_FATIGUE=8,REST_MINUTES=480,REFUSAL_MINUTES=5,
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 num=(x,a=0,z=1000000000)=>Number.isInteger(x)&&x>=a&&x<=z,
 prose=(x,min=25)=>typeof x==='string'&&x.trim().length>=min&&x.length<=900;
function sourcePosition(s,p,b,minute){
 if(!p||!b||!People.verify(Realm.peek(s),p)||!Visit.verify(s,p)||
  !Person.verify(b)||!b.sapientLife||b.owner!==null||
  s.player?.partnerIds?.includes(b.id)||s.table?.bondRecords?.[b.id]?.contract)
  return null;
 const pos=Visit.position(p,minute),
  site=pos?.arrived?pos.location:null,
  shift=site&&Presence.resolve(Realm.peek(s),p.actorId,site,
   Math.floor(minute/1440),minute%1440)?.presence,
  original=site&&Visit.visitorPresence(p,minute,site);
 if(!['crossing','academy'].includes(site)||b.location!==site||b.away===true||
  !shift||!original||!equal(shift,original)||
  shift.source!==Visit.VISITOR||shift.arrivedBy!==pos.sourceHash||
  !b.sapientLife.terrestrialJourneyReceipts?.some(x=>x.seal===pos.sourceHash))
  return null;
 return {site,pos,shift:original};
}
function safe(b){
 return !!b?.sapientLife&&b.condition>=55&&b.needs&&
  Number.isFinite(b.needs.fatigue)&&b.needs.fatigue>=0&&b.needs.fatigue<=100&&
  Number.isFinite(b.needs.hunger)&&b.needs.hunger>=0&&b.needs.hunger<75&&
  !b.injuries?.length&&!b.conditions?.length&&
  !['captured','coerced','imprisoned','forced'].includes(String(b.relationship).toLowerCase())&&
  !/hostile|terrified|panicked|fleeing|desperate/i.test(String(b.mood));
}
function witnessValid(p,b,q){
 const w=q?.witness,d=w?.details;
 return w?.type==='story'&&prose(w.text)&&
  w.text.includes(p.name)&&w.text.includes(b.name)&&
  w.day===q.day+1&&w.time===E.clock({world:{minutes:q.minute}})&&
  d?.origin===WITNESS&&d.actorId===p.actorId&&d.beastId===b.id&&
  d.humanOriginHash===p.originHash&&d.beastPersonSourceHash===b.sapientLife.sourceHash&&
  d.site===q.site&&d.minute===q.minute&&
  d.physicalOriginalJourneySeal===q.arrivalSeal&&
  d.physicalOriginalVisitorPresenceHash===q.shiftHash&&
  prose(d.individualSafeRefugeObserved)&&prose(d.beastPersonalFreedomAndCommunication)&&
  prose(d.noGuaranteeOfHumanOrBeastAccommodation)&&
  d.noSpeciesDietOrFoodSourceInferred===true&&
  d.noMedicalTreatmentOrMagicalBond===true&&
  d.noHumanSleepOrCompelledBeastRest===true;
}
// Standalone structural proof: safe for the original sapient person verifier
// without calling it recursively or rechecking the whole world.
function structure(b){
 const rows=b?.sapientLife?.originalVisitorRefugeChoices;
 if(rows===undefined)return true;
 if(!Array.isArray(rows)||rows.length>90)return false;
 let last=-1;const seen=new Set(),days=new Set();
 for(const row of rows){
  const q=row?.source;
  if(!q||row.seal!==hash(q)||q.origin!==ORIGIN||
   q.beastId!==b.id||q.beastHash!==b.sapientLife.sourceHash||
   !num(q.minute,last+1)||q.day!==Math.floor(q.minute/1440)||
   !['crossing','academy'].includes(q.site)||
   !num(q.endMinute,q.minute)||q.endMinute!==q.minute+
    (q.accepted?REST_MINUTES:REFUSAL_MINUTES)||
   q.originalBiologicalOwner!==RECOVERY_OWNER||
   q.fatigueRecoveryRule!==RECOVERY_FATIGUE||
   !q.before||!q.after||
   ![q.before.hunger,q.before.fatigue,q.before.condition,
     q.before.energy,q.before.hp].every(v=>Number.isFinite(v)&&v>=0&&v<=10000)||
   !num(q.before.fatigue,0,100)||!num(q.before.hunger,0,100)||
   !num(q.after.fatigue,0,100)||!num(q.after.hunger,0,100)||
   q.after.fatigue!==Math.max(0,q.before.fatigue-
    (q.accepted?RECOVERY_FATIGUE:0))||
   q.after.hunger!==q.before.hunger||
   q.after.condition!==q.before.condition||
   q.after.energy!==q.before.energy||q.after.hp!==q.before.hp||
   !q.choice||!num(q.choice.rngBefore,1,4294967295)||
   !equal(q.choice,Social.sapientChoice({rngState:q.choice.rngBefore},q.choice.disposition))||
   q.accepted!==(q.choice.outcome==='accepted')||
   q.outcome!==(q.accepted?'freely-rested':'freely-declined-or-countered')||
   !prose(q.witness?.text)||q.witnessHash!==hash(q.witness)||
   q.noHumanStaminaOrBeastFoodOrMagicalResult!==true||
   seen.has(q.witnessHash)||days.has(q.day)||q.day<0)return false;
  last=q.minute;seen.add(q.witnessHash);days.add(q.day);
 }
 return true;
}
function verify(s,p){
 if(!p||!People.verify(Realm.peek(s),p)||!Visit.verify(s,p))return false;
 const rows=p.originalSapientVisitorRefugeChoices;
 if(rows===undefined)return true;
 if(!Array.isArray(rows)||rows.length>90)return false;
 let last=-1;const seen=new Set();
 for(const row of rows){
  const q=row?.source,b=s.beasts?.[q?.beastId],
   pos=Visit.position(p,q?.minute),
   shift=Visit.visitorPresence(p,q?.minute,q?.site),
   onBeast=b?.sapientLife?.originalVisitorRefugeChoices?.find(x=>x.seal===row.seal),
   event=s.log?.[q?.witnessIndex];
  if(!q||!b?.sapientLife||!Person.verify(b)||!structure(b)||
   !onBeast||!equal(onBeast,row)||row.seal!==hash(q)||
   q.actorId!==p.actorId||q.humanHash!==p.originHash||
   !num(q.minute,last+1,s.world.minutes)||
   q.endMinute>s.world.minutes||
   !pos?.arrived||pos.location!==q.site||
   pos.sourceHash!==q.arrivalSeal||!shift||shift.hash!==q.shiftHash||
   !b.sapientLife.terrestrialJourneyReceipts?.some(x=>x.seal===q.arrivalSeal)||
   !num(q.witnessIndex,0,s.log.length-1)||hash(event)!==q.witnessHash||
   !witnessValid(p,b,q)||
   q.choice.disposition!==Agency.profile(s,b).disposition||
   seen.has(q.witnessHash))return false;
  seen.add(q.witnessHash);last=q.minute;
 }
 return true;
}
function rest(s,{actorId,beastId,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId)||typeof beastId!=='string'||
  !num(witnessIndex,0,(s.log?.length||0)-1))
  throw Error('Only two genuine individual IDs and a separate witnessed safe space; no caller choice, fatigue, care supplies or site');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  b=s.beasts?.[beastId],minute=s.world.minutes,day=Math.floor(minute/1440),
  presence=sourcePosition(s,p,b,minute),witness=structuredClone(s.log[witnessIndex]);
 if(!presence||!p||!b||!safe(b)||s.battle||s.encounter?.threat||
  minute%1440<16*60||minute%1440>17*60+30||
  !verify(s,p))
  throw Error('Real safe independent sapient individual and original visiting body in witnessed evening refuge required');
 const q={origin:ORIGIN,actorId,humanHash:p.originHash,beastId,
  beastHash:b.sapientLife.sourceHash,site:presence.site,minute,day,
  arrivalSeal:presence.pos.sourceHash,shiftHash:presence.shift.hash,
  witness,witnessHash:hash(witness),witnessIndex,
  originalBiologicalOwner:RECOVERY_OWNER,fatigueRecoveryRule:RECOVERY_FATIGUE,
  before:{hunger:b.needs.hunger,fatigue:b.needs.fatigue,
   condition:b.condition,energy:b.energy,hp:b.hp},
  noHumanStaminaOrBeastFoodOrMagicalResult:true};
 if(!witnessValid(p,b,q)||p.originalSapientVisitorRefugeChoices?.some(x=>
   x.source.day===day&&x.source.beastId===beastId)||
  b.sapientLife.originalVisitorRefugeChoices?.some(x=>x.source.day===day)||
  (p.originalSapientVisitorRefugeChoices||[]).length>=90)
  throw Error('Real separate beast refuge scene and one personal evening opportunity per day required');
 q.choice=Social.sapientChoice(b.sapientLife,Agency.profile(s,b).disposition);
 q.accepted=q.choice.outcome==='accepted';
 q.outcome=q.accepted?'freely-rested':'freely-declined-or-countered';
 q.endMinute=minute+(q.accepted?REST_MINUTES:REFUSAL_MINUTES);
 if(q.accepted)b.needs.fatigue=Math.max(0,b.needs.fatigue-RECOVERY_FATIGUE);
 q.after={hunger:b.needs.hunger,fatigue:b.needs.fatigue,
  condition:b.condition,energy:b.energy,hp:b.hp};
 const row={source:q,seal:hash(q)};
 p.originalSapientVisitorRefugeChoices||=[];
 p.originalSapientVisitorRefugeChoices.push(row);
 b.sapientLife.originalVisitorRefugeChoices||=[];
 b.sapientLife.originalVisitorRefugeChoices.push(structuredClone(row));
 E.advance(s,q.endMinute-minute);World.finalizeTime(s,minute);
 if(!verify(s,p))throw Error('A genuine individual visiting beast recovery failed historical source replay');
 return {privateToGM:true,actorId,beastId,site:q.site,
  freelyRested:q.accepted,observedChoice:q.outcome,
  elapsedMinutes:q.endMinute-minute,sourceHash:row.seal,
  sourceOwnedFatigueReduction:q.before.fatigue-q.after.fatigue,
  noHumanRestOrStaminaOrBeastFoodOrOtherTreatment:true,
  noContractSyncGradeOrAssumedShelter:true};
}
function privateStatus(s,p){
 if(!verify(s,p))throw Error('Original independent visiting beast welfare history altered');
 return (p.originalSapientVisitorRefugeChoices||[]).map(row=>({
  privateToGM:true,actorId:p.actorId,beastId:row.source.beastId,
  site:row.source.site,day:row.source.day,
  freelyRested:row.source.accepted,
  originalFatigueBefore:row.source.before.fatigue,
  originalFatigueAfter:row.source.after.fatigue,
  elapsedMinutes:row.source.endMinute-row.source.minute,
  originalPhysicalJourneyHash:row.source.arrivalSeal,
  originalSourceHash:row.seal,noForcedFoodHealingOrMagicalPartner:true}));
}
function beastStatus(s,{beastId,...extra}={}){
 if(Object.keys(extra).length||typeof beastId!=='string'||!beastId)
  throw Error('Only the exact established independent sapient ID, not chosen health, grade, or rest');
 const b=s.beasts?.[beastId];
 if(!b?.sapientLife||!Person.verify(b))
  throw Error('Real source-established living sapient person is required');
 const rows=b.sapientLife.originalVisitorRefugeChoices||[],
  w=Realm.peek(s);
 const history=rows.map(row=>{
  const q=row.source,p=w?.emergentPeople?.people?.[q.actorId.slice(9)];
  if(!p||!verify(s,p))
   throw Error('Beast welfare source lacks the exact original co-travelling human and reciprocal evidence');
  return {privateToGM:true,beastId,observerActorId:q.actorId,
   site:q.site,originalArrivalSeal:q.arrivalSeal,
   minute:q.minute,endedMinute:q.endMinute,
   outcome:q.outcome,
   originalIndividualFatigueBefore:q.before.fatigue,
   originalIndividualFatigueAfter:q.after.fatigue,
   actualSourceOwnedRecovery:q.before.fatigue-q.after.fatigue,
   originalIndependentDecisionSourceHash:row.seal,
   noInferredFoodEnergyHealingOrConsent:true};
 });
 return {privateToGM:true,beastId,
  actualBeastLocation:b.location??null,
  currentIndividualCondition:b.condition,
  currentIndividualHunger:b.needs?.hunger??null,
  currentIndividualFatigue:b.needs?.fatigue??null,
  sourceVerifiedIndependentVisitorRestHistory:history,
  sourceHistoryCount:history.length,
  actualUnprovenDietAndShelterForFutureDays:true,
  noNewChoicesOrTimeOrMedicalTreatmentOrNutritionOrGrade:true};
}
module.exports={ORIGIN,WITNESS,RECOVERY_OWNER,RECOVERY_FATIGUE,
 structure,verify,rest,privateStatus,beastStatus};
