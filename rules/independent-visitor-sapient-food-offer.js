'use strict';
// A real person's actually held, already source-owned one ration may be
// separately offered to an independent sapient traveller. Two distinct
// original personal choices govern whether ONE ration is consumed. Use the
// SAME original WildLives 8-minutes and 20 hunger points, with no fictional
// beast medicine, free items, new food, bond, Grade or skill rank.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 Core=require('./core'),Time=require('./world'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Person=require('../world/sapient-beast-persons'),Journey=require('./independent-sapient-terrestrial-journey'),
 Arr=require('./independent-sapient-arrangements'),Social=require('./beast-social-arrangements'),
 Agency=require('./beast-agency'),BondCare=require('./bond-care'),
 Handoffs=require('./material-handoffs'),Wild=require('../world/wild-lives');
const ORIGIN='source-original-individual-visiting-sapient-voluntary-ration-offer-v1',
 WITNESS='gm-witnessed-original-individual-visiting-sapient-ration-food-choice-v1',
 CUSTODY='source-independent-original-visiting-sapient-ration-consumption-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 integer=(x,a=0,z=1000000000)=>Number.isInteger(x)&&x>=a&&x<=z,
 prose=x=>typeof x==='string'&&x.trim().length>=25&&x.length<=900;
function structure(b){
 const rows=b?.sapientLife?.originalVisitorRationOffers;
 if(rows===undefined)return true;
 if(!Array.isArray(rows)||rows.length>180)return false;
 let last=-1;const seals=new Set(),days=new Set();
 for(const row of rows){
  const q=row?.source;
  if(!q||row.seal!==hash(q)||q.origin!==ORIGIN||
   q.beastId!==b.id||q.beastHash!==b.sapientLife.sourceHash||
   !integer(q.minute,last+1)||q.day!==Math.floor(q.minute/1440)||
   q.site!=='crossing'||q.item!=='clean_rations'||q.quantity!==1||
   q.elapsedMinutes!==Wild.OFFER_MINUTES||
   q.sourceOriginalSpecies!==b.species||
   q.originalForm!==b.evolutionStage||
   !integer(q.hungerBefore,0,100)||!integer(q.hungerAfter,0,100)||
   !integer(q.heldBefore,1,100000)||!integer(q.heldAfter,0,100000)||
   q.accepted!==Boolean(q.humanChoice?.accepted&&q.beastChoice?.outcome==='accepted')||
   q.heldAfter!==q.heldBefore-(q.accepted?1:0)||
   q.hungerAfter!==Math.max(0,q.hungerBefore-(q.accepted?20:0))||
   q.foodConsumed!==(q.accepted?1:0)||
   q.outcome!==(q.accepted?'independently-ate-one-original-ration':
    !q.humanChoice?.accepted?'human-chose-not-to-offer':
     'beast-refused-or-countered-food-offer')||
   !Arr.verifyHuman(q.humanChoice,q.witnessHash)||
   !integer(q.humanChoice.rngBefore,1,4294967295)||
   !integer(q.witnessIndex,0)||q.witnessHash!==hash(q.witness)||
   !q.safeDietReference||q.safeDietReference.item!=='clean_rations'||
   q.safeDietReference.quantity!==1||
   q.noTransferWithoutTwoOriginalChoices!==true||
   q.noBeastBondRankGradeOrFreeCare!==true||
   seals.has(q.witnessHash)||days.has(q.day)||!prose(q.witness.text))
   return false;
  if(q.humanChoice.accepted){
   if(!q.beastChoice||!integer(q.beastChoice.rngBefore,1,4294967295)||
    !eq(q.beastChoice,Social.sapientChoice({rngState:q.beastChoice.rngBefore},
     q.beastChoice.disposition)))return false;
  }else if(q.beastChoice!==null)return false;
  last=q.minute;seals.add(q.witnessHash);days.add(q.day);
 }
 return true;
}
function actualPair(s,p,b,minute){
 if(!p||!b||!People.verify(Realm.peek(s),p)||!Person.verify(b)||
  !Journey.verify(s,p)||b.owner!==null||b.away===true||
  s.player?.partnerIds?.includes(b.id)||b.location!=='crossing'||
  s.table?.bondRecords?.[b.id]?.contract||b.sapience<3||
  p.status!=='active'||s.battle||s.encounter)
  return null;
 const pos=Journey.position(p,minute),shift=Journey.visitorPresence(p,minute,'crossing');
 if(!pos?.arrived||pos.location!=='crossing'||!shift||
  shift.arrivedBy!==pos.sourceHash||
  !b.sapientLife?.terrestrialJourneyReceipts?.some(x=>x.seal===pos.sourceHash)||
  !b.needs||!Number.isFinite(b.needs.hunger)||b.needs.hunger<1||
  b.needs.hunger>100||b.condition<50||
  b.injuries?.length||b.conditions?.length||
  /terrified|panicked|hostile|fleeing|desperate/i.test(String(b.mood)))
  return null;
 let feeding;
 try{feeding=BondCare.feedingProfile(s,b);}catch{return null;}
 if(feeding.item!=='clean_rations'||feeding.quantity!==1||
  !feeding.locations.includes('crossing')||
  E.SPECIES[b.species]?.diet!=='omnivore')
  return null;
 return {pos,shift,feeding};
}
function witnessed(p,b,q){
 const w=q.witness,d=w?.details;
 return w?.type==='story'&&prose(w.text)&&w.text.includes(p.name)&&
  w.text.includes(b.name)&&
  w.day===q.day+1&&w.time===E.clock({world:{minutes:q.minute}})&&
  d?.origin===WITNESS&&d.actorId===p.actorId&&d.beastId===b.id&&
  d.humanOriginHash===p.originHash&&d.beastPersonHash===b.sapientLife.sourceHash&&
  d.site==='crossing'&&d.minute===q.minute&&
  d.originalSignedVisitHash===q.arrivalSeal&&d.originalVisitorShiftHash===q.shiftHash&&
  d.originalHeldRationBefore===q.heldBefore&&
  d.originalSpeciesDietSource===q.safeDietReference.source&&
  prose(d.understoodSeparateHumanOfferFreedom)&&
  prose(d.understoodSapientBeastChoiceFreedom)&&
  prose(d.originalRationConsumptionOnlyIfBothAgree)&&
  d.noForcedFeedingOrBodilyConsent===true&&
  d.noGrantOfTrustHealthEnergyOrSync===true;
}
function verify(s,p){
 const rows=p?.originalVisitorSapientFoodOffers;
 if(rows===undefined)return true;
 if(!Array.isArray(rows)||rows.length>180||
  !People.verify(Realm.peek(s),p)||!Journey.verify(s,p))return false;
 let last=-1;const days=new Set();
 const w=Realm.peek(s),account=w.materialCustody?.accounts?.[p.actorId];
 if(!account)return false;
 try{Handoffs.validateAccount(account,p.actorId);}catch{return false;}
 for(const row of rows){
  const q=row?.source,b=s.beasts?.[q?.beastId],
   other=b?.sapientLife?.originalVisitorRationOffers?.find(x=>x.seal===row?.seal),
   pos=Journey.position(p,q?.minute),shift=Journey.visitorPresence(p,q?.minute,'crossing'),
   event=s.log?.[q?.witnessIndex],
   spent=account.history?.filter(x=>x.origin===CUSTODY&&x.offerSourceHash===row?.seal);
  if(!q||row.seal!==hash(q)||!b?.sapientLife||!Person.verify(b)||
   !structure(b)||!other||!eq(other,row)||
   q.actorId!==p.actorId||q.humanHash!==p.originHash||
   q.humanChoice.personality!==p.personality||
   !integer(q.minute,last+1,s.world.minutes)||
   q.minute%1440+Wild.OFFER_MINUTES>1440||
   q.minute+q.elapsedMinutes>s.world.minutes||
   !pos?.arrived||pos.location!=='crossing'||pos.sourceHash!==q.arrivalSeal||
   !shift||shift.hash!==q.shiftHash||
   !b.sapientLife.terrestrialJourneyReceipts?.some(x=>x.seal===q.arrivalSeal)||
   !integer(q.witnessIndex,0,s.log.length-1)||
   !eq(q.witness,event)||!witnessed(p,b,q)||
   q.beastChoice&&q.beastChoice.disposition!==Agency.profile(s,b).disposition||
   (q.accepted?
    !spent||spent.length!==1||
    spent[0].actorId!==p.actorId||
    spent[0].beastId!==b.id||
    spent[0].heldBefore!==q.heldBefore||
    spent[0].remainingOwned!==q.heldAfter:
    !!spent?.length)||
   days.has(q.day+':'+q.beastId))
   return false;
  days.add(q.day+':'+q.beastId);last=q.minute;
 }
 return true;
}
function readiness(s,{actorId,beastId,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId)||typeof beastId!=='string')
  throw Error('Only two original individual identities, not chosen food or acceptance');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  b=s.beasts?.[beastId],found=actualPair(s,p,b,s.world.minutes),
  account=w.materialCustody?.accounts?.[actorId];
 let verified=null;
 try{verified=Handoffs.privateHoldingEvidence(w,actorId);}catch{}
 const stored=verified?.verifiedCurrentMaterials?.find(x=>
  x.item==='clean_rations'&&x.quantity>=1);
 const canOffer=!!found&&!!account&&!!stored&&
  stored.fullAcquisitionChain===true;
 return {privateToGM:true,actorId,beastId,canOffer,
  reason:canOffer?null:!found?'not-a-witnessed-healthy-original-visiting-sapient-pair':
   !stored?'no-personally-owned-genuine-original-ration':
   !stored.fullAcquisitionChain?'prior-physical-ration-chain-not-fully-authenticated':
   'no-current-physical-custody',
  actualOwnedUnits:stored?.quantity??null,
  currentSourceVerifiedOwnershipRoot:stored?.sourceHash??null,
  originalSpeciesDietItem:found?.feeding?.item??null,
  independentHumanAndSapientChoicesRequired:true,
  noPlayerInventoryOrWageOrMerchantStockOrBeastHungerChanged:true};
}
function offer(s,{actorId,beastId,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId)||typeof beastId!=='string'||
  !integer(witnessIndex,0,(s.log?.length||0)-1))
  throw Error('Actual human, sapient individual and separate source witness only; no chosen feeding or free food');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  b=s.beasts?.[beastId],minute=s.world.minutes,day=Math.floor(minute/1440),
  ready=readiness(s,{actorId,beastId}),pair=actualPair(s,p,b,minute),
  event=structuredClone(s.log[witnessIndex]),
  acct=w.materialCustody?.accounts?.[actorId],before=acct?.held?.clean_rations;
 if(!ready.canOffer||!pair||!verify(s,p)||!acct||
  minute%1440+Wild.OFFER_MINUTES>1440||
  !s.chatRuntime?.scene?.includes(event.text)||
  p.originalVisitorSapientFoodOffers?.some(x=>x.source.beastId===beastId&&
   x.source.day===day)||!integer(before,1,100000))
  throw Error('A genuinely owned ration, safe original visiting person and unspent witnessed individual food opportunity are required');
 const q={origin:ORIGIN,actorId,humanHash:p.originHash,
  beastId,beastHash:b.sapientLife.sourceHash,
  site:'crossing',minute,day,item:'clean_rations',quantity:1,
  elapsedMinutes:Wild.OFFER_MINUTES,
  arrivalSeal:pair.pos.sourceHash,shiftHash:pair.shift.hash,
  safeDietReference:structuredClone(pair.feeding),
  heldBefore:before,hungerBefore:b.needs.hunger,
  originalForm:b.evolutionStage,sourceOriginalSpecies:b.species,
  witness:event,witnessIndex,witnessHash:hash(event),
  noTransferWithoutTwoOriginalChoices:true,
  noBeastBondRankGradeOrFreeCare:true};
 if(!witnessed(p,b,q))throw Error('A separate truthful food-rights and physically owned ration scene must be witnessed');
 q.humanChoice=Arr.humanChoice(p,q.witnessHash);
 q.beastChoice=q.humanChoice.accepted?
  Social.sapientChoice(b.sapientLife,Agency.profile(s,b).disposition):null;
 q.accepted=!!(q.humanChoice.accepted&&q.beastChoice?.outcome==='accepted');
 q.outcome=q.accepted?'independently-ate-one-original-ration':
  !q.humanChoice.accepted?'human-chose-not-to-offer':'beast-refused-or-countered-food-offer';
 q.foodConsumed=q.accepted?1:0;
 q.heldAfter=before-q.foodConsumed;
 q.hungerAfter=Math.max(0,q.hungerBefore-(q.accepted?20:0));
 const row={source:q,seal:hash(q)};
 p.originalVisitorSapientFoodOffers||=[];
 p.originalVisitorSapientFoodOffers.push(row);
 b.sapientLife.originalVisitorRationOffers||=[];
 b.sapientLife.originalVisitorRationOffers.push(structuredClone(row));
 if(q.accepted){
  // Same original person custody: record a verified SINGLE decrement, no
  // invented transfer, duplicate ration or replacement beast-only stash.
  acct.held.clean_rations=q.heldAfter;
  if(acct.held.clean_rations===0)delete acct.held.clean_rations;
  const used={origin:CUSTODY,actorId,beastId,item:'clean_rations',
   quantity:1,day,worldMinute:minute,offerSourceHash:row.seal,
   heldBefore:before,remainingOwned:q.heldAfter,
   noAutomaticPartnerOrSkillOrMoney:true};
  acct.history.push({...used,hash:hash(used)});
  if(acct.history.length>90)acct.history.shift();
  b.needs.hunger=q.hungerAfter;
 }
 E.advance(s,Wild.OFFER_MINUTES);Time.finalizeTime(s,minute);
 if(!verify(s,p)||!structure(b))
  throw Error('The actually source-owned ration and individual freely chosen feeding did not conserve');
 return {privateToGM:true,actorId,beastId,observedOutcome:q.outcome,
  personallyAccepted:q.accepted,
  originalHumanRationsConsumed:q.foodConsumed,
  originalIndividualHungerReduced:q.hungerBefore-q.hungerAfter,
  originalEightMinutes:Wild.OFFER_MINUTES,
  sourceHash:row.seal,
  noFreeFoodOrAutomaticPartnershipOrMagicOrMedicalTreatment:true};
}
function privateStatus(s,p){
 if(!verify(s,p))throw Error('Source of individual travelling food offers altered');
 return (p.originalVisitorSapientFoodOffers||[]).map(x=>({
  privateToGM:true,actorId:p.actorId,beastId:x.source.beastId,
  day:x.source.day,site:x.source.site,
  outcome:x.source.outcome,originalOwnedFoodConsumed:x.source.foodConsumed,
  actualOriginalHungerImprovement:x.source.hungerBefore-x.source.hungerAfter,
  sourceHash:x.seal,noForcedEatingOrNewAnimalBond:true}));
}
module.exports={ORIGIN,WITNESS,CUSTODY,structure,verify,readiness,offer,privateStatus};
