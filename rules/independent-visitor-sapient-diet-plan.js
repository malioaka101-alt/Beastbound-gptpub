'use strict';
// A source-witnessed, purely individual DAILY food serving assessment at
// the ORIGINAL Morrowfen beast provisioner. This documents a named native
// sapient omnivore's one-ration serving ONLY after separately lawful human
// and sapient discussion choices, current body, canonical omnivore dietary
// compatibility, actual witnessed expert conversation and exact saved site.
// It is NOT an accredited numeric Grade, medical examination, an arbitrary
// general nutrient formula, a ration purchase or a beast's willingness to eat.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Person=require('../world/sapient-beast-persons'),
 Journey=require('./independent-sapient-terrestrial-journey'),
 Arr=require('./independent-sapient-arrangements'),
 Agency=require('./beast-agency'),Social=require('./beast-social-arrangements'),
 BondCare=require('./bond-care'),Time=require('./world'),Presence=require('../world/person-presence');
const ORIGIN='source-witnessed-independent-sapient-individual-diet-serving-plan-v1',
 WITNESS='gm-witnessed-original-morrowfen-independent-sapient-diet-observation-v1',
 MINUTES=12,
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 int=(v,a=0,z=1000000000)=>Number.isInteger(v)&&v>=a&&v<=z,
 words=v=>typeof v==='string'&&v.trim().length>=25&&v.length<=900;
function planFrom(q){
 return {species:q.beastSpecies,evolutionStage:q.beastForm,
  diet:'omnivore',foodItem:'clean_rations',quantity:1,
  shelterLocations:['crossing'],
  source:'Separately witnessed original Morrowfen individual omnivore nutrition and one-serving judgement '+q.witnessHash,
  worldMinute:q.minute};
}
function structure(b){
 const rows=b?.sapientLife?.originalIndividualDietPlans;
 if(rows===undefined)return true;
 if(!Array.isArray(rows)||rows.length>90)return false;
 let previous=-1;const seen=new Set(),acceptedForms=new Set(),days=new Set();
 for(const row of rows){
  const q=row?.source,def=E.SPECIES[q?.beastSpecies];
  if(!q||row.seal!==hash(q)||q.origin!==ORIGIN||
   q.beastId!==b.id||q.beastHash!==b.sapientLife.sourceHash||
   !def||def.diet!=='omnivore'||q.beastForm!=='Base'||
   q.item!=='clean_rations'||q.quantity!==1||
   q.officialNamedSellerId!=='otto'||
   !int(q.minute,previous+1)||q.day!==Math.floor(q.minute/1440)||
   q.minute%1440<480||q.minute%1440+MINUTES>1080||
   q.elapsedMinutes!==MINUTES||q.site!=='crossing'||
   q.witnessHash!==hash(q.witness)||!words(q.witness.text)||
   !Arr.verifyHuman(q.humanChoice,q.witnessHash)||
   !int(q.humanChoice?.rngBefore,1,4294967295)||
   q.accepted!==Boolean(q.humanChoice.accepted&&q.beastChoice?.outcome==='accepted')||
   q.outcome!==(q.accepted?'separate-individual-one-serving-diet-plan':
    !q.humanChoice.accepted?'human-declined-individual-plan':
     'sapient-person-declined-or-countered-individual-plan')||
   (q.accepted?!equal(q.plan,planFrom(q)):q.plan!==null)||
   q.noFundsFoodBiologicalGradeOrTreatmentCreated!==true||
   q.futureEatingRequiresSeparateRealOwnerAndConsent!==true||
   seen.has(q.witnessHash)||days.has(q.day)||(
    q.accepted&&acceptedForms.has(q.beastSpecies+':'+q.beastForm)))
   return false;
  if(q.humanChoice.accepted){
   if(!q.beastChoice||!int(q.beastChoice.rngBefore,1,4294967295)||
    !equal(q.beastChoice,Social.sapientChoice({rngState:q.beastChoice.rngBefore},
      q.beastChoice.disposition)))return false;
  }else if(q.beastChoice!==null)return false;
  previous=q.minute;seen.add(q.witnessHash);days.add(q.day);
  if(q.accepted)acceptedForms.add(q.beastSpecies+':'+q.beastForm);
 }
 const accepted=rows.filter(x=>x.source.accepted);
 if(accepted.length&&
  !equal(b.welfareCarePlan,accepted.at(-1).source.plan))return false;
 return true;
}
function witnessValid(p,b,q){
 const w=q.witness,d=w?.details;
 return w?.type==='story'&&words(w.text)&&
  w.text.includes(p.name)&&w.text.includes(b.name)&&
  w.text.includes(E.NPCS.otto.name)&&
  w.day===q.day+1&&w.time===E.clock({world:{minutes:q.minute}})&&
  d?.origin===WITNESS&&d.actorId===p.actorId&&d.beastId===b.id&&
  d.humanOriginHash===p.originHash&&
  d.beastPersonHash===b.sapientLife.sourceHash&&
  d.site==='crossing'&&d.minute===q.minute&&
  d.originalJourneyArrivalSeal===q.arrivalSeal&&
  d.originalVisitorPresenceHash===q.shiftHash&&
  d.originalSellerId==='otto'&&d.sellerName===E.NPCS.otto.name&&
  d.observedOriginalSpecies===q.beastSpecies&&
  d.originalSpeciesDiet==='omnivore'&&
  d.originalCurrentForm===q.beastForm&&
  d.exactObservedServingQuantity===1&&
  d.originalCompatibleFood==='clean_rations'&&
  words(d.currentIndividualObservedServingAndSeparateRights)&&
  words(d.notAnExamOrPresumedMedicalTreatment)&&
  words(d.followUpEatingRequiresNewConsentAndRealStock)&&
  d.noAssumedGuaranteedFoodForAnySpecies===true&&
  d.noNumericalGradeOrMedicalResult===true;
}
function current(s,p,b,minute=s.world.minutes){
 const w=Realm.peek(s),pos=p&&Journey.position(p,minute),
  at=pos?.arrived?pos.location:null,
  shift=at&&Journey.visitorPresence(p,minute,at),
  local=Presence.resolve(w,'otto','crossing',
   Math.floor(minute/1440),minute%1440);
 if(!p||!b||!People.verify(w,p)||!Person.verify(b)||
  !Journey.verify(s,p)||p.status!=='active'||b.owner!==null||
  s.player?.partnerIds?.includes(b.id)||s.table?.bondRecords?.[b.id]?.contract||
  b.away===true||b.location!=='crossing'||!b.sapientLife||
  !pos?.arrived||at!=='crossing'||!shift||
  shift.arrivedBy!==pos.sourceHash||shift.actorId!==p.actorId||
  !b.sapientLife.terrestrialJourneyReceipts?.some(x=>x.seal===pos.sourceHash)||
  E.SPECIES[b.species]?.diet!=='omnivore'||b.evolutionStage!=='Base'||
  !BondCare.FEED_BY_DIET.omnivore.includes('clean_rations')||
  !local||local.location!=='crossing'||
  E.NPCS.otto.profession!=='Beast provisioner'||
  minute%1440<480||minute%1440+MINUTES>1080||
  b.condition<55||b.injuries?.length||b.conditions?.length||
  b.needs?.hunger>75||b.needs?.fatigue>75||s.battle||s.encounter)
  return null;
 return {pos,shift,site:'crossing'};
}
function verify(s,p){
 const rows=p?.originalSapientVisitorDietDiscussions;
 if(rows===undefined)return true;
 if(!Array.isArray(rows)||rows.length>90||
  !People.verify(Realm.peek(s),p)||!Journey.verify(s,p))return false;
 let last=-1;const seen=new Set();
 for(const row of rows){
  const q=row?.source,b=s.beasts?.[q?.beastId],
   pos=Journey.position(p,q?.minute),
   shift=Journey.visitorPresence(p,q?.minute,q?.site),
   event=s.log?.[q?.witnessIndex],
   other=b?.sapientLife?.originalIndividualDietPlans?.find(x=>x.seal===row?.seal);
  if(!q||row.seal!==hash(q)||!b?.sapientLife||!Person.verify(b)||
   !structure(b)||!other||!equal(other,row)||
   q.actorId!==p.actorId||q.humanHash!==p.originHash||
   q.humanChoice.personality!==p.personality||
   !int(q.minute,last+1,s.world.minutes)||
   q.minute+MINUTES>s.world.minutes||
   !pos?.arrived||pos.location!=='crossing'||pos.sourceHash!==q.arrivalSeal||
   !shift||shift.hash!==q.shiftHash||
   !int(q.witnessIndex,0,(s.log?.length||0)-1)||
   !equal(event,q.witness)||!witnessValid(p,b,q)||
   q.beastChoice&&q.beastChoice.disposition!==Agency.profile(s,b).disposition||
   seen.has(q.witnessHash))return false;
  last=q.minute;seen.add(q.witnessHash);
 }
 return true;
}
function planVerified(s,b,plan){
 if(!b?.sapientLife||!Person.verify(b)||!plan||!structure(b))return false;
 const row=b.sapientLife.originalIndividualDietPlans?.find(x=>
  x.source.accepted&&equal(x.source.plan,plan));
 // The original bond-care provider returns a read-only FEEDING PROFILE
 // {item,quantity,locations,source}. The original individual witnessed
 // PLAN is stored with different but equivalent fields plus species/form
 // and witnessed time. Compare exact projections, never caller text alone.
 const fromOriginal=row?.source?.plan;
 if(!row||!fromOriginal||!equal(b.welfareCarePlan,fromOriginal)||
  fromOriginal.species!==b.species||
  fromOriginal.evolutionStage!==b.evolutionStage||
  fromOriginal.diet!==E.SPECIES[b.species]?.diet||
  fromOriginal.quantity!==1||
  !Array.isArray(fromOriginal.shelterLocations)||
  !fromOriginal.shelterLocations.includes('crossing'))return false;
 const profile={item:fromOriginal.foodItem,quantity:fromOriginal.quantity,
  locations:fromOriginal.shelterLocations,source:fromOriginal.source};
 if(!equal(plan,fromOriginal)&&!equal(plan,profile))return false;
 const p=Realm.peek(s)?.emergentPeople?.people?.[row.source.actorId?.slice(9)];
 return !!p&&verify(s,p);
}
function readiness(s,{actorId,beastId,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId)||typeof beastId!=='string')
  throw Error('Exact original individual human and sapient being only; no chosen plan, portion or diet');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  b=s.beasts?.[beastId],at=current(s,p,b);
 return {privateToGM:true,actorId,beastId,
  actualSourceVisitorAndNamedProvisionerPresent:!!at,
  canDiscuss:!!at&&!b.welfareCarePlan,
  actualCanonicalDiet:b&&E.SPECIES[b.species]?.diet??null,
  actualSpecies:b?.species??null,
  requiresSeparateActualExpertObservationAndBothIndividualChoices:true,
  noFoodOrPlanPurchasedOrGuaranteed:true,
  noGradeExamOrMedicalTreatmentGranted:true};
}
function discuss(s,{actorId,beastId,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId)||typeof beastId!=='string'||
  !int(witnessIndex,0,(s.log?.length||0)-1))
  throw Error('Exact genuine human, sapient being and witnessed individual serving discussion only; no caller diet, portion, plan or consent');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  b=s.beasts?.[beastId],now=s.world.minutes,day=Math.floor(now/1440),
  at=current(s,p,b,now),event=structuredClone(s.log[witnessIndex]);
 if(!at||!verify(s,p)||b.welfareCarePlan||
  p.originalSapientVisitorDietDiscussions?.some(x=>
   x.source.beastId===beastId&&(
    x.source.day===day||
    x.source.beastSpecies===b.species&&x.source.accepted))||
  !s.chatRuntime?.scene?.includes(event.text))
  throw Error('Real original named provisioner, unauthorised individual diet and separate observed serving conversation required');
 const q={origin:ORIGIN,actorId,humanHash:p.originHash,
  beastId,beastHash:b.sapientLife.sourceHash,
  beastSpecies:b.species,beastForm:b.evolutionStage,
  site:'crossing',minute:now,day,
  arrivalSeal:at.pos.sourceHash,shiftHash:at.shift.hash,
  officialNamedSellerId:'otto',item:'clean_rations',quantity:1,
  elapsedMinutes:MINUTES,
  witness:event,witnessHash:hash(event),witnessIndex,
  noFundsFoodBiologicalGradeOrTreatmentCreated:true,
  futureEatingRequiresSeparateRealOwnerAndConsent:true};
 if(!witnessValid(p,b,q))
  throw Error('An actual source-observed named individual nutritional serving and rights must be evidenced first');
 q.humanChoice=Arr.humanChoice(p,q.witnessHash);
 q.beastChoice=q.humanChoice.accepted?
  Social.sapientChoice(b.sapientLife,Agency.profile(s,b).disposition):null;
 q.accepted=!!(q.humanChoice.accepted&&q.beastChoice?.outcome==='accepted');
 q.outcome=q.accepted?'separate-individual-one-serving-diet-plan':
  !q.humanChoice.accepted?'human-declined-individual-plan':
   'sapient-person-declined-or-countered-individual-plan';
 q.plan=q.accepted?planFrom(q):null;
 const row={source:q,seal:hash(q)};
 p.originalSapientVisitorDietDiscussions||=[];
 p.originalSapientVisitorDietDiscussions.push(row);
 b.sapientLife.originalIndividualDietPlans||=[];
 b.sapientLife.originalIndividualDietPlans.push(structuredClone(row));
 if(q.accepted)b.welfareCarePlan=structuredClone(q.plan);
 E.advance(s,MINUTES);Time.finalizeTime(s,now);
 if(!verify(s,p)||q.accepted&&!planVerified(s,b,b.welfareCarePlan))
  throw Error('Original independently witnessed individual species diet failed source replay');
 return {privateToGM:true,actorId,beastId,
  freelyBothAgreedToPlan:q.accepted,outcome:q.outcome,
  planSourceHash:row.seal,actualMinutes:MINUTES,
  sourceVerifiedIndividualPlan:q.accepted?structuredClone(q.plan):null,
  noRationBoughtOrFedAndNoGradeOrContract:true};
}
function privateStatus(s,p){
 if(!verify(s,p))throw Error('Original dietary advice and two independent source choices were altered');
 return (p.originalSapientVisitorDietDiscussions||[]).map(x=>({
  privateToGM:true,beastId:x.source.beastId,
  originalSpecies:x.source.beastSpecies,
  actualSite:'crossing',freelyBothAgreed:x.source.accepted,
  outcome:x.source.outcome,sourceHash:x.seal,
  futureFoodSupplyAndEatingStillUnestablished:true}));
}
module.exports={ORIGIN,WITNESS,MINUTES,structure,verify,planVerified,
 readiness,discuss,privateStatus};
