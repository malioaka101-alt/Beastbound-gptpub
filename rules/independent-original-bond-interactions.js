'use strict';
// Original relationship event arithmetic, earned by actual independent
// co-present interactions, not merely an accepted social arrangement.
// The pair foundation remains immutable; replay returns the one current
// original bond record. No magical contract or Sync awarded here.
const Crypto=require('node:crypto'),E=require('../engine'),C=require('./core'),B=require('./bonds'),
 Original=require('./bond-witness'),Pair=require('./independent-original-bond-pair'),
 Arr=require('./independent-sapient-arrangements'),Social=require('./beast-social-arrangements'),
 Agency=require('./beast-agency'),Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Presence=require('../world/person-presence'),Person=require('../world/sapient-beast-persons'),W=require('./world');
const ContractLaw=require('./independent-original-bond-contract-law'),Sync=require('./bond-synchronisation'),Potential=require('./potential-mechanics'),Health=require('./unified'),Higher=require('./independent-original-higher-architectures');
const ORIGIN='source-earned-independent-original-pair-interaction-v1',
 WITNESS='gm-witnessed-independent-original-pair-friendly-opportunity-v1',
 SEAL='gm-witnessed-independent-original-exact-magical-contract-terms-v1',
 REVIEW='gm-witnessed-independent-original-magical-continuation-review-v1',
 SYNC='gm-witnessed-independent-original-pair-synchronisation-exercise-v1',
 ENERGY='gm-witnessed-independent-original-pair-energy-recognition-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 int=(v,a=0,b=1000000000)=>Number.isInteger(v)&&v>=a&&v<=b,
 prose=x=>typeof x==='string'&&x.trim().length>=25&&x.length<=900;
function exactMagicTerms(w){const d=w?.details;return [d?.exactContractBenefits,d?.exactContractObligations,d?.exactContractLimits,d?.independentWithdrawalTerms];}
function checkRecord(roll,sp){
 const margin=roll+sp.modifier+C.naturalAdjustment(roll)-sp.dc;
 return {roll,modifier:sp.modifier,dc:sp.dc,margin,degree:C.degree(margin),success:margin>=0};
}
function welfare(b){
 return {mood:String(b.mood),condition:b.condition,needs:{hunger:b.needs.hunger,fatigue:b.needs.fatigue},
 relationship:b.relationship,injuries:structuredClone(b.injuries||[]),conditions:structuredClone(b.conditions||[]),
 agencyBoundaries:structuredClone(b.agencyBoundaries??null)};
}
function opportunity(s,b,r,q){
 const actor={...b,...q.welfare};
 if(actor.agencyBoundaries===null)delete actor.agencyBoundaries;
 return Agency.evaluate({...s,world:{...s.world,minutes:q.minute}},actor,r,['drill','sync'].includes(q.approach)?'sync_practice':q.approach==='seal'?'light_contract':q.approach).possible;
}
function witnessValid(p,b,q){
 const w=q.witness,d=w?.details,magic=['seal','review'].includes(q.approach);
 return w?.type==='story'&&prose(w.text)&&w.text.includes(p.name)&&
  w.day===q.day+1&&w.time===E.clock({world:{minutes:q.minute}})&&
  d?.origin===(q.approach==='seal'?SEAL:q.approach==='review'?REVIEW:q.approach==='sync'?SYNC:WITNESS)&&d.actorId===p.actorId&&d.beastId===b.id&&
  d.pairSeal===q.pairSeal&&d.arrangementHash===q.arrangementHash&&d.arrangementRevision===q.arrangementRevision&&
  d.location===q.site&&d.contactHash===hash(q.contact)&&d.approach===q.approach&&
  prose(d.independentConcreteOpportunity)&&prose(d.actualCommunication)&&
  prose(d.unconditionalRightToRefuse)&&d.noCompelledInteraction===true&&
  (q.approach!=='drill'||prose(d.actualJointTimingAndSignalDrill)&&d.noMagicOrSyncExercise===true)&&
  (!magic||prose(d.exactContractBenefits)&&prose(d.exactContractObligations)&&prose(d.exactContractLimits)&&
   prose(d.independentWithdrawalTerms)&&d.noOwnershipOrForcedObedience===true&&d.independentlyUnderstood===true)&&
  (q.approach!=='seal'||d.depth===q.depth&&d.gradeAssessmentHash===hash(q.gradeAssessment))&&
  (q.approach!=='review'||d.contractReceipt===q.contractReceipt)&&
  (q.approach!=='sync'||d.contractReceipt===q.contractReceipt&&d.targetStage===q.target&&d.focus===q.focus&&
   prose(d.actualPairExercise)&&prose(d.independentFeedbackLimit)&&d.noTechniqueOrCompelledPower===true);
}
function mode(p,b,r,q){
 if(q.approach==='seal')return {...q.contractInputs.spec,minutes:0};
 if(q.approach==='review')return {minutes:0};
 if(['drill','sync'].includes(q.approach)){
  const dex=p.mechanicalFoundation.baselineAttributes.dex,
   aptitude=Potential.bonus(p.mechanicalFoundation.unassessedPotential.synchronisation);
  return {...Sync.practiceSpec(q.approach==='sync'?q.target:1,dex,0,r.coordination,aptitude),event:q.approach==='drill'?'training_week':null};
 }
 return Original.interactionSpec(q.approach,p.mechanicalFoundation.baselineAttributes.cha,0,
  /wary|uneasy|agitated|fear|hostile|territorial/i.test(q.welfare.mood),r.willingness,b.sapience);
}
function completedTrainingSixday(s,q,prior){
 // Strict conservative proof: six actual successful daily drills of this
 // exact pair, within one original civil sixday. No elapsed-time award.
 if(q.day<5||!W.calendarTicks(q.day,1,Realm.peek(s)?.calendarAnchor||null).sixdays.includes(q.day+1))return [];
 const rows=prior.filter(x=>x.source.pairSeal===q.pairSeal&&x.source.approach==='drill'&&x.source.check?.success&&
  x.source.day>=q.day-5&&x.source.day<q.day);
 return rows.length===5&&new Set(rows.map(x=>x.source.day)).size===5?rows.map(x=>x.seal):[];
}
function syncEnergyProof(s,p,b,q){
 if(q.energyProof===null)return q.witness?.details?.energyProofHash===undefined?null:false;
 if(hash(q.energyProof)!==q.witness?.details?.energyProofHash)return false;
 const w=q.energyProof,d=w?.details,soul=ContractLaw.soulAt(s,p,q.minute);
 if(!soul||soul.phase<1||!soul.sourceSeal||w?.type!=='story'||!prose(w.text)||!w.text.includes(p.name)||
  w.day!==q.day+1||w.time!==E.clock({world:{minutes:q.minute}})||d?.origin!==ENERGY||
  d.actorId!==p.actorId||d.beastId!==b.id||d.pairSeal!==q.pairSeal||d.contractReceipt!==q.contractReceipt||
  d.location!==q.site||d.soulSourceSeal!==soul.sourceSeal||!prose(d.actualMutuallyObservedSignature)||
  !prose(d.independentBeastRecognition)||!prose(d.measuredInterferenceLimit)||d.noSharedTechniqueOrMindReading!==true)return false;
 return soul;
}
function syncConsequence(r,q,check,energy){
 if(!check)return {pointsEarned:0,promoted:false};
 const points=check.success?C.progress(check.degree):0;
 if(q.focus==='refine'){
  r.syncMasteryPoints=Math.min(1000000,(r.syncMasteryPoints||0)+points);
  if(r.syncMasteryPoints>=14)r.syncState='mastered';
  else if(r.syncMasteryPoints>=6)r.syncState='stable';
  return {pointsEarned:points,promoted:false,stage:r.syncStage,state:r.syncState};
 }
 r.syncPoints=Math.min(1000000,r.syncPoints+points);
 const ready=B.syncReadiness(r,q.target),promoted=check.success&&ready.numericReady&&
  r.syncPoints>=ready.trainingPoints&&(q.target===1||!!energy);
 if(promoted){r.syncStage=q.target;r.syncState='novice';r.syncMasteryPoints=0;r.syncPoints-=ready.trainingPoints;}
 return {pointsEarned:points,promoted,stage:r.syncStage,state:r.syncState};
}
function consequence(r,q,check,week,energy){
 if(q.approach==='sync')return syncConsequence(r,q,check,energy);
 if(q.approach==='seal')return check?B.applyContractCheck(r,q.contractInputs.spec,check):null;
 if(q.approach==='review'){
  if(!q.humanChoice.accepted||q.beastChoice?.outcome!=='accepted'){
   r.contract=null;r.contractStability=0;return {ended:true};
  }
  return {ended:false};
 }
 // A respected real refusal is distinct from failure of an accepted
 // interaction, or the human declining to initiate. It grants only the
 // original respected_refusal event.
 if(!q.humanChoice.accepted)return null;
 if(!q.possible||q.beastChoice.outcome!=='accepted')return B.applyEvent(r,'respected_refusal',1);
 return check.success&&(q.approach!=='drill'||week.length===5)?B.applyEvent(r,q.law.event,1):null;
}
function replay(s,p){
 if(!Pair.verify(s,p))return null;
 const foundations=(p.originalBondPairRecognitions||[]).filter(x=>x.source.accepted),
  pairs=new Map(foundations.map(x=>[x.seal,{base:x,bond:structuredClone(x.bond),head:x.seal,last:x.source.minute,contractReceipt:null}]));
 const rows=p.originalBondInteractions;
 if(rows===undefined)return pairs;
 if(!Array.isArray(rows)||rows.length>960)return null;
 const seen=new Set(),days=new Set(),prior=[];let previousMinute=0;
 for(const row of rows){
  const q=row?.source,pair=pairs.get(q?.pairSeal),b=s.beasts?.[q?.beastId],
   arr=p.originalSapientArrangements?.find(x=>x.seal===q?.arrangementHash),sh=q?.shift;
  if(!q||!pair||!b?.sapientLife||!Person.verify(b)||
   row.seal!==hash(q)||q.origin!==ORIGIN||q.previous!==pair.head||
   q.actorId!==p.actorId||q.humanSeal!==p.originHash||
   q.beastId!==pair.base.source.beastId||q.beastSeal!==b.sapientLife.sourceHash||
   (q.approach!=='review'&&(arr?.source.beastId!==q.beastId||!Pair.revision(arr,q.minute,q.arrangementRevision)))||
   !int(q.minute,Math.max(pair.last,previousMinute),s.world.minutes)||q.day!==Math.floor(q.minute/1440)||
   !['gentle','play','drill','seal','review','sync'].includes(q.approach)||!witnessValid(p,b,q)||
   q.witnessHash!==hash(q.witness)||seen.has(q.witnessHash)||days.has(q.pairSeal+':'+q.day)||
   q.contact?.type!=='personally-witnessed-contact'||q.contact.willingness!==true||q.contact.location!==q.site||
   !int(q.contact.minute,Math.max(0,q.minute-60),q.minute)||
   !Person.contactProof(b,q.contact)||
   !sh||sh.hash!==hash(Object.fromEntries(Object.entries(sh).filter(([k])=>k!=='hash')))||
   sh.actorId!==p.actorId||sh.originHash!==p.originHash||sh.location!==q.site||
   sh.fromDay>q.day||sh.throughDay<q.day||sh.throughDay-sh.fromDay!==5||sh.scheduledAtDay!==sh.fromDay||
   !Arr.safe({...b,...q.welfare})||!eq(q.before,pair.bond)||
   !Arr.verifyHuman(q.humanChoice,q.witnessHash)||q.humanChoice.personality!==p.personality||
   q.noMagicOrSync!==(!['seal','review','sync'].includes(q.approach)))return null;
  if(q.approach==='seal'){
   if(pair.bond.contract||pair.bond.fractured||pair.bond.willingness<50||!['light','standard','deep','covenant'].includes(q.depth))return null;
   const usedCapacity=[...pairs.values()].reduce((n,x)=>n+(x.bond.contract?.load||0),0),
    inputs=ContractLaw.inputs(s,p,b,q.minute,q.gradeAssessment,q.depth,usedCapacity);
   if(!inputs||!eq(inputs,q.contractInputs)||inputs.spec.overCapacity)return null;
  }else if(q.approach==='review'){
   const sealed=prior.find(x=>x.seal===pair.contractReceipt);
   if(!pair.bond.contract||q.contractReceipt!==pair.contractReceipt||!sealed||!eq(exactMagicTerms(q.witness),exactMagicTerms(sealed.source.witness)))return null;
  }else if(q.approach==='sync'){
   if(!pair.bond.contract||pair.bond.fractured||q.contractReceipt!==pair.contractReceipt||
    !['advance','refine'].includes(q.focus)||!int(q.target,1,2)||
    q.target!==(q.focus==='refine'?pair.bond.syncStage:pair.bond.syncStage+1)||
    q.focus==='refine'&&q.energyProof!==null)return null;
  }else if(q.contractInputs!==undefined||q.gradeAssessment!==undefined)return null;
  const energy=q.approach==='sync'?syncEnergyProof(s,p,b,q):null;
  if(energy===false||energy&&q.target!==2)return null;
  const sp=mode(p,b,pair.bond,q),possible=q.approach==='review'?true:opportunity(s,b,pair.bond,q);
  if(q.approach==='seal'&&!possible)return null;
  if(!eq(q.law,sp)||q.possible!==possible||q.minute+sp.minutes>s.world.minutes)return null;
  if(q.humanChoice.accepted&&possible){
   const d=q.beastChoice;
   if(!d||d.disposition!==Agency.profile(s,b).disposition||!int(d.rngBefore,1,4294967295)||
    !eq(d,Social.sapientChoice({rngState:d.rngBefore},d.disposition)))return null;
  }else if(q.beastChoice!==null)return null;
  const rng={rngState:q.humanChoice.rngAfter},accepted=q.humanChoice.accepted&&possible&&q.beastChoice.outcome==='accepted',
   check=accepted&&q.approach!=='review'?checkRecord(C.die(rng,20),sp):null;
  if(!eq(q.check,check)||q.humanRngAfter!==rng.rngState)return null;
  const week=q.approach==='drill'&&check?.success?completedTrainingSixday(s,q,prior):[];
  if(['drill','sync'].includes(q.approach)){
   const body=s.table?.combatants?.['npc_'+p.id],v=q.physical;
   if(!body?.npcOrigin?.seal||v?.combatSeal!==body.npcOrigin.seal||
    !int(v.staminaBefore,sp.humanCost,v.maxStamina)||v.staminaAfter!==v.staminaBefore-(q.humanChoice.accepted?sp.humanCost:0)||
    !int(v.beastFatigueBefore,0,69)||v.beastFatigueBefore!==q.welfare.needs.fatigue||
    v.beastFatigueAfter!==v.beastFatigueBefore+(accepted?sp.fatigueCost:0)||
    !eq(v.wounds,[0,0,0])||q.minute%1440<480||q.minute%1440+sp.minutes>1080||!eq(q.trainingPredecessors,week))return null;
  }else if(q.physical!==undefined||q.trainingPredecessors!==undefined)return null;
  const event=consequence(pair.bond,q,check,week,energy);
  if(!eq(q.event,event)||!eq(q.after,pair.bond))return null;
  if(q.approach==='seal'&&pair.bond.contract)pair.contractReceipt=row.seal;
  if(q.approach==='review'&&!pair.bond.contract)pair.contractReceipt=null;
  prior.push(row);
  pair.head=row.seal;pair.last=q.minute+sp.minutes;previousMinute=q.minute;seen.add(q.witnessHash);days.add(q.pairSeal+':'+q.day);
 }
 return pairs;
}
function verify(s,p){try{return replay(s,p)!==null;}catch{return false;}}
function current(s,p,seal){const map=replay(s,p);if(!map)throw Error('Original independent pair interaction history altered');return map.get(seal)||null;}
function interact(s,{actorId,beastId,witnessIndex,...extra}={},kind='friendly'){
 if(Object.keys(extra).length||typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId)||
  typeof beastId!=='string'||!int(witnessIndex,0,s.log.length-1))
  throw Error('Original independent participants and fresh friendly opportunity only, no outcome or affinity supplied');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],b=s.beasts?.[beastId],
  minute=s.world.minutes,day=Math.floor(minute/1440),site=s.world.location,
  present=p&&Presence.resolve(w,actorId,site,day,minute%1440),witness=structuredClone(s.log[witnessIndex]),d=witness?.details,
  pair=p&&current(s,p,d?.pairSeal),arr=p?.originalSapientArrangements?.find(x=>x.seal===d?.arrangementHash),
  contact=b?.sapientLife?.history?.filter(x=>x.type==='personally-witnessed-contact'&&x.willingness&&
   x.location===site&&int(x.minute,Math.max(0,minute-60),minute)).at(-1);
 if(!p||!People.verify(w,p)||!present?.presence||p.status!=='active'||
  p.ageBand!=='adult, exact birthday not established'||!pair||pair.base.source.beastId!==beastId||
  !b?.sapientLife||!Person.verify(b)||!Arr.safe(b)||b.location!==site||b.away===true||
  b.owner!==null||s.player.partnerIds?.includes(beastId)||s.battle||s.encounter?.threat||
  s.encounter?.beastId!==beastId||!contact||kind!=='review'&&(arr?.source.beastId!==beastId||Arr.statusAt(arr,minute)!=='accepted'))
  throw Error('Actual present independent recognised pair and current voluntary cooperation required');
 const rows=p.originalBondInteractions||[],rev=arr?.events.at(-1)?.seal||arr?.seal||null,
  q={origin:ORIGIN,previous:pair.head,actorId,humanSeal:p.originHash,beastId,beastSeal:b.sapientLife.sourceHash,
   pairSeal:pair.base.seal,arrangementHash:arr?.seal??null,arrangementRevision:rev,site,minute,day,
   contact:structuredClone(contact),shift:structuredClone(present.presence),witness,witnessHash:hash(witness),
   approach:d?.approach,welfare:welfare(b),before:structuredClone(pair.bond),noMagicOrSync:kind==='friendly'};
 if(kind==='seal'){
  if(pair.bond.contract||pair.bond.fractured||pair.bond.willingness<50||activeForBeast(s,beastId)||s.table?.bondRecords?.[beastId]?.contract)
   throw Error('Actual original willingness at least 50, no fracture and no existing magical contract required');
  if(!['light','standard','deep','covenant'].includes(d?.depth))throw Error('Exact original contract depth required');
  q.depth=d.depth;q.gradeAssessment=structuredClone(b.contractGradeAssessment||null);
  const usedCapacity=privateStatus(s,p).reduce((n,x)=>n+(x.bond.contract?.load||0),0);
  q.contractInputs=ContractLaw.inputs(s,p,b,minute,q.gradeAssessment,q.depth,usedCapacity);
  if(!q.contractInputs||q.contractInputs.spec.overCapacity)throw Error('Genuine current individual Grade, earned Soul capacity and available original contract load required');
 }else if(kind==='sync'){
  if(!pair.bond.contract||!pair.contractReceipt||pair.bond.fractured||!['advance','refine'].includes(d?.focus))
   throw Error('Actual existing original independent magical contract required for supported synchronisation practice');
  q.contractReceipt=pair.contractReceipt;q.focus=d.focus;
  q.target=q.focus==='refine'?pair.bond.syncStage:pair.bond.syncStage+1;
  if(!int(q.target,1,2))throw Error('Only original earned Basic Coordination and Energy Recognition practice are currently connected');
  q.energyProof=null;
  if(q.target===2&&q.focus==='advance'&&d.energyProofHash!==undefined){
   const evidence=s.log.find(x=>hash(x)===d.energyProofHash);
   if(!evidence)throw Error('Fresh separate pair-specific energy recognition evidence required');
   q.energyProof=structuredClone(evidence);
  }
  const energy=syncEnergyProof(s,p,b,q);
  if(energy===false)throw Error('Actual individual Soul perception and separate reciprocal energy recognition source required');
 }else if(kind==='review'){
  const sealed=rows.find(x=>x.seal===pair.contractReceipt);
  if(!pair.bond.contract||!pair.contractReceipt||!sealed||!eq(exactMagicTerms(witness),exactMagicTerms(sealed.source.witness)))throw Error('Current actual original magical contract and unchanged exact terms required for independent continuation review');
  q.contractReceipt=pair.contractReceipt;
 }
 if(!(kind==='friendly'?['gentle','play','drill'].includes(q.approach):q.approach===kind)||!witnessValid(p,b,q)||kind!=='review'&&!Pair.revision(arr,minute,rev)||
  minute<pair.last||rows.length>=960||rows.some(x=>x.source.witnessHash===q.witnessHash||
   x.source.pairSeal===q.pairSeal&&x.source.day===day))
  throw Error('Fresh original pair opportunity or exact contract terms and unused independent pair day required');
 q.law=mode(p,b,pair.bond,q);q.possible=kind==='review'?true:opportunity(s,b,pair.bond,q);
 if(kind==='seal'&&!q.possible)throw Error('Actual individual boundary or physical welfare prevents magical sealing');
 if(minute%1440+q.law.minutes>1440)throw Error('Complete original interaction within the witnessed day');
 let body=null;
 if(['drill','sync'].includes(q.approach)){
  body=s.table?.combatants?.['npc_'+p.id];
  if(!body||!Health.currentNpcWoundCondition(s,p.actorId)||body.npcOrigin.location!==site||body.status!=='ok'||
   body.wounds.some(x=>x!==0)||body.stamina<q.law.humanCost||
   !int(b.needs.fatigue,0,69)||Higher.usedDay(p,day)||minute%1440<480||minute%1440+q.law.minutes>1080)
   throw Error('Actual original physical bodies and unused safe discipline day required for cooperative drill');
  q.physical={combatSeal:body.npcOrigin.seal,staminaBefore:body.stamina,maxStamina:body.maxStamina,
   beastFatigueBefore:b.needs.fatigue,wounds:[...body.wounds]};
 }
 q.humanChoice=Arr.humanChoice(p,q.witnessHash);
 q.beastChoice=q.humanChoice.accepted&&q.possible?Social.sapientChoice(b.sapientLife,Agency.profile(s,b).disposition):null;
 q.check=null;
 if(q.humanChoice.accepted&&q.possible&&q.beastChoice.outcome==='accepted'&&kind!=='review'){
  const actual=C.check(s,{modifier:q.law.modifier,dc:q.law.dc,privateDisplay:true,independentRngOwner:p,label:p.name+' original freely accepted pair interaction'});
  q.check=checkRecord(actual.roll,q.law);
 }
 q.humanRngAfter=p.rngState;
 let week=[];
 if(body){
  if(q.humanChoice.accepted)body.stamina-=q.law.humanCost;
  if(q.check)b.needs.fatigue+=q.law.fatigueCost;
  q.physical.staminaAfter=body.stamina;q.physical.beastFatigueAfter=b.needs.fatigue;
  week=q.approach==='drill'&&q.check?.success?completedTrainingSixday(s,q,rows):[];q.trainingPredecessors=week;
 }
 q.event=consequence(pair.bond,q,q.check,week,kind==='sync'?syncEnergyProof(s,p,b,q):null);q.after=structuredClone(pair.bond);
 const seal=hash(q);rows.push({source:q,seal});p.originalBondInteractions=rows;
 if(q.law.minutes){E.advance(s,q.law.minutes);W.finalizeTime(s,minute);}
 if(!verify(s,p))throw Error('Original independent pair interaction failed replay');
 return {independentlyInitiated:q.humanChoice.accepted,accepted:!!q.check,
  successful:!!q.check?.success,observedEvent:q.event?.event??null,elapsedMinutes:q.law.minutes,
  ...(kind==='seal'?{sealed:!!pair.bond.contract,noPlayerOwnershipOrConsent:true}:kind==='review'?{ended:!pair.bond.contract,noCompelledContinuation:true}:kind==='sync'?{syncPractice:true,stage:pair.bond.syncStage,promoted:q.event.promoted,pointsEarned:q.event.pointsEarned,noAutomaticTechnique:true}:{noMagicOrSync:true})};
}
function privateStatus(s,p){
 const map=replay(s,p);if(!map)throw Error('Original independent pair interactions cannot be verified');
 return [...map.values()].map(x=>({beastId:x.base.source.beastId,sourceHash:x.base.seal,head:x.head,
  bond:structuredClone(x.bond),contractReceipt:x.contractReceipt,noAutomaticTechnique:true,privateToGM:true}));
}
function activeForBeast(s,beastId){
 const active=[];
 for(const p of Object.values(Realm.peek(s)?.emergentPeople?.people||{})){
  if(!p.originalBondInteractions?.some(x=>x.source.approach==='seal'&&x.source.beastId===beastId))continue;
  for(const row of privateStatus(s,p))if(row.beastId===beastId&&row.bond.contract)
   active.push({actorId:p.actorId,pairSeal:row.sourceHash,receipt:row.contractReceipt,contract:row.bond.contract});
 }
 if(active.length>1)throw Error('Conflicting original independent magical contracts for the same individual');
 return active[0]||null;
}
module.exports={ORIGIN,WITNESS,SEAL,REVIEW,SYNC,ENERGY,verify,current,interact,privateStatus,completedTrainingSixday,activeForBeast,
 seal:(s,p)=>interact(s,p,'seal'),review:(s,p)=>interact(s,p,'review'),sync:(s,p)=>interact(s,p,'sync')};
