'use strict';
// Private GM-side mechanical foundation for individually source-sealed people.
// Deliberately NOT a second cultivation, profession, combat or beast-bond owner.
// Natural attributes/potential are individually seeded; earned capabilities
// remain exclusively with the original source-owned rules and event histories.
const Crypto=require('node:crypto');
const ORIGIN='independent-person-mechanical-foundation-v1';
// Rebuilding twenty SHA-256 derivations for each verify() in long-running
// independent-world ticks is needlessly expensive. Cache only deterministic
// EXPECTED source results, never the person's mutable presented profile.
// Every inspection still compares the entire live source-sealed record.
const EXPECTED_CACHE=new Map(),EXPECTED_CACHE_LIMIT=4096;
const ATTRIBUTES=Object.freeze(['str','dex','con','int','wis','cha']);
const POTENTIAL=Object.freeze([
 'meridianBreadth','gateStability','manaCoreArchitecture','soulDepth',
 'soulResilience','physicalAdaptation','evolutionaryPlasticity',
 'elementalAffinity','bloodlineExpression','lineageCompatibility',
 'traitIntegration','synchronisation','comprehension','techniqueCreativity']);
const hash=v=>Crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
function bytes(w,actor,field){
 return Crypto.createHash('sha256').update(
  ORIGIN+'|'+w.worldSeed+'|'+actor.actorId+'|'+actor.originHash+'|'+field).digest();
}
function expectedFoundation(w,actor){
 if(!w||w.worldSeed===undefined||!actor||
    !/^emergent:person_[0-9]+$/.test(actor.actorId||'')||
    !/^[a-f0-9]{64}$/.test(actor.originHash||''))
  throw Error('An original source-sealed independent individual is required');
 const key=JSON.stringify([w.worldSeed,actor.actorId,actor.originHash]);
 if(EXPECTED_CACHE.has(key))return EXPECTED_CACHE.get(key);
 const attributes={};
 for(const key of ATTRIBUTES){
  const h=bytes(w,actor,'attribute:'+key);
  // Human-style natural aptitude on the existing 3..18 six-attribute scale.
  // Aged condition, injuries, techniques and actual current combat numbers
  // are separate, and MUST NOT be inferred from these baseline scores.
  attributes[key]=3+(h[0]%6)+(h[1]%6)+(h[2]%6);
 }
 const potential={};
 for(const key of POTENTIAL){
  const h=bytes(w,actor,'potential:'+key);
  potential[key]=1+h[0]%9;
 }
 const source={origin:ORIGIN,version:1,actorId:actor.actorId,
  individualOriginHash:actor.originHash,
  worldSeedHash:hash(String(w.worldSeed)),
  baselineAttributes:attributes,unassessedPotential:potential,
  baselineNotLiveCombat:true,
  noAutomaticCultivationStage:true,
  noEarnedTechniqueOrBeastBond:true,
  originalOwnersRetainCurrentSkillsPowersWoundsAndConsent:true};
 const expected={...source,seal:hash(source)};
 if(EXPECTED_CACHE.size>=EXPECTED_CACHE_LIMIT)
  EXPECTED_CACHE.delete(EXPECTED_CACHE.keys().next().value);
 EXPECTED_CACHE.set(key,expected);
 return expected;
}
function build(w,actor){
 // Callers may amend a draft profile; that MUST NOT alter the expected
 // canonical source for later verification or for another game/replay.
 return structuredClone(expectedFoundation(w,actor));
}
function verify(w,actor){
 if(!actor?.mechanicalFoundation)return false;
 try{return JSON.stringify(actor.mechanicalFoundation)===
  JSON.stringify(expectedFoundation(w,actor));}
 catch{return false;}
}
// Internal-only dossier: NEVER expose via an ordinary player-facing rule
// operation. All unrevealed attributes, study and potential are GM-private.
/**
 * Stage 2A: source-owned, read-only evidence projection. This is NOT a
 * second progression system: only the career/life/notable owners may award
 * their existing outcomes. Null means *not established*, never stage zero.
 * This function is GM-private; no player-facing Rules operation calls it.
 */
function earnedEvidence(w,actorId,s=null){
 if(typeof actorId!=='string')throw Error('An established individual ID is required');
 const emptyMilestones=()=>({
  meridian:{stage:null,openedGates:null},
  arcane:{coreIgnited:null,circles:null},
  soul:{phase:null},body:{completedCycles:null},
  rift:{step:null},beastOrigin:{integrations:null},
  humanEvolution:{stage:null},partnership:{synchronisation:null}
 });
 // Original starting relatives already have their own independent living
 // actors. Read that exact original source; a guardian/household label alone
 // is NOT a biological relationship or permission to claim family powers.
 if(actorId.startsWith('origin-kin:')){
  if(!s||s.table?.realm!==w)
   throw Error('Matching original game state required for starting kin evidence');
  const Kin=require('./origin-relatives'),
   t=Kin.ensure(w),
   p=t?.people?.[actorId.slice('origin-kin:'.length)];
  if(!p||p.actorId!==actorId)return {known:false};
  if(!Kin.verify(w,p))
   throw Error('Unverified original independent relative identity or history');
  // The original public family-status owner alone interprets saved player
  // corrections: its confirmed personal statement overrides vague roles
  // without rewriting the sealed founding document.
  const original=Kin.status(s),
   remembered=original.relatives.find(x=>x.npcId===actorId);
  if(!remembered)throw Error('Original independent kin is not this campaign family');
  return {known:true,actorId,privateToGM:true,
   evidenceOwners:['world/origin-relatives.js','scripts/scene-continuity.js'],
   originalIdentityHash:p.sourceHash,
   name:p.name,originalHomeRegion:p.source.regionId,
   familyRelationship:{
    foundingHouseholdRole:p.relation,
    explicitlyRecordedKinship:p.kinship||null,
    playerConfirmedRelationship:remembered.confirmedRelationship,
    originalHouseholdHouseId:p.source.houseId,
    biologicalLineageNotInferred:true,
    noInheritedPowersByKinship:true
   },
   autonomousOrdinaryLife:{
    owner:'world/origin-relatives.js',
    status:p.status,currentFatigue:p.fatigue,
    currentPersonalFunds:p.funds,lastIndependentSixday:p.lastSixday,
    recentOriginalReceipts:p.history.map(e=>({
     sourceHash:e.hash,day:e.source.day,
     choice:e.source.decision,
     observedOrdinaryFundsBefore:e.source.before?.funds??null,
     observedOrdinaryFundsAfter:e.source.after?.funds??null,
     observedFatigueBefore:e.source.before?.fatigue??null,
     observedFatigueAfter:e.source.after?.fatigue??null
    }))
   },
   currentLocalPresence:null,consentToSpeak:null,
   ageAndLiveCombatAttributes:null,clinicalWounds:null,
   supernaturalDisciplineMilestones:null,
   personalLearnedTechniques:null,
   noRetrospectiveTrainingOrProficiency:true,
   noPresenceOrConsentByFamilyRole:true};
 }
 // Sapient beasts are already independently evidenced by their ORIGINAL
 // personhood and per-activity competence owners. They do not acquire human
 // six-attribute baselines, professional ranks or cultivation by this bridge.
 if(actorId.startsWith('sapient:')){
  // Beast individuals live in game.beasts, not the realm's human-person table.
  // Require the EXACT matching live world so a caller cannot mix campaigns.
  if(!s||s.table?.realm!==w)
   throw Error('A matching original game state is required for this sapient person');
  const beastId=actorId.slice('sapient:'.length),
   b=s.beasts?.[beastId];
  if(!b?.sapientLife)return {known:false};
  const Sapient=require('./sapient-beast-persons');
  if(!Sapient.verify(b))
   throw Error('Unverified original sapient-person and earned-work evidence');
  const life=b.sapientLife,practice=life.practice;
  return {known:true,actorId,privateToGM:true,
   evidenceOwners:['world/sapient-beast-persons.js',
    'world/earned-individual-practice.js'],
   individualOriginHash:life.sourceHash,
   witnessedEncounterHash:life.source.encounterHash,
   originalSpecies:life.source.species,
   autonomousEarnedWork:{
    sourceHash:practice.sourceHash,
    completedAttempts:practice.attempts,
    domains:Object.entries(practice.points).map(([domain,points])=>({
     domain,earnedPracticalPoints:points,
     demonstratedMethods:{...practice.successfulMethods[domain]}
    })),
    recentOriginalReceipts:practice.receipts.map(r=>({
     sourceHash:r.hash,day:r.source.day,
     domain:r.source.domain,method:r.source.method,
     success:r.source.result.success,
     earned:r.source.result.earned
    })),
    onlyGenuineIndependentlyChosenActivities:true
   },
   humanDisciplineProgression:null,
   speciesEvolutionMilestones:null,
   actualLearnedTechniqueEvents:null,
   partnerConsentEvidence:null,
   ordinaryProfessionalCareer:null,
   noHumanSkillOrRankConversion:true,
   noFreeSpellEvolutionOrBond:true,
   originalBeastDevelopmentOwnersUnchanged:true};
 }
 if(actorId.startsWith('emergent:')){
  const actor=w?.emergentPeople?.people?.[actorId.slice('emergent:'.length)];
  if(!actor||actor.actorId!==actorId)return {known:false};
  // Verify both the birth identity and the ORIGINAL earned work ledger.
  // The independent-life ledger is separate: its metrics never grant
  // actual magical techniques, Circles, Gates or professional certificates.
  const People=require('./emergent-people'),
   Careers=require('./person-careers'),
   Lives=require('./independent-person-lives'),
   Custody=require('../rules/material-handoffs');
  if(!People.verify(w,actor)||!Careers.verify(actor))
   throw Error('Unverified original living NPC identity or career evidence');
  const life=w.independentPersonLives?.people?.[actor.id]||null;
  if(life&&!Lives.verifyEntry(w,life))
   throw Error('Unverified original independent-person life evidence');
  // The original consent-backed household owner is the ONLY source of
  // chosen co-residence. No invented marriage, bloodline, children, heirs,
  // shared inventory, permanent romance or authority follows from it.
  const Homes=require('./emergent-households'),
   home=actor.family?
    w.emergentHouseholds?.households?.[actor.family]:null;
  if(actor.family&&(!home||!Homes.valid(w,home)||
   !home.source.founders.some(f=>f.actorId===actorId&&
    f.originHash===actor.originHash)))
   throw Error('Unverified original voluntarily chosen household membership');
  const chosenHousehold=home?{
   originalOwner:'world/emergent-households.js',
   householdId:home.id,sourceHash:home.sourceHash,
   formedOnDay:home.source.foundedDay,
   mutuallyConsentingFounders:home.source.founders.map(f=>({
    actorId:f.actorId,originHash:f.originHash,name:f.name
   })),
   originalFoundingContactHash:home.source.contactReceiptHash,
   originalRecordedCurrentArrangement:home.status,
   originalLifeTransitionHashes:home.lifeHistory?
    home.lifeHistory.receipts.map(r=>r.hash):null,
   statusDoesNotProvePresentCoLocation:true,
   noMarriageBloodlineHeirsOrInheritedPower:true,
   privateToGM:true
  }:null;
  const career=actor.career||null;
  // The ORIGINAL discipline owner alone knows whether a personal practice
  // history culminated in a genuinely earned Stage I rite. Ordinary study,
  // career prestige or a raw legacy array remain incapable of awarding it.
  const verifiedMeridian=s?.table?.realm===w&&actor.meridianTraining?
   require('../rules/disciplines').npcMeridianPrivateStatus(s,actorId):null;
  // Genuine independent early preparation is NOT an earned magical stage.
  // Keep all separate systems' milestones unknown until their own original
  // source-owned ignition, refinement or awakening events actually occur.
  const verifiedOtherPreparation=s?.table?.realm===w&&
   actor.originalEarlyDisciplinePreparation?
   require('../rules/independent-original-discipline-preparation')
    .privateStatus(s,actorId):null;
  const originalMilestones=emptyMilestones();
  // The actual original Arcane Core (no Circle, spell or casting formula)
  // is only known after its source-replayed individual ignition rite.
  if(verifiedOtherPreparation?.verifiedArcaneCoreIgnition===true){
   originalMilestones.arcane.coreIgnited=true;
   originalMilestones.arcane.circles=0;
  }
  // Only independently earned, fully replayed ORIGINAL individual milestones
  // can establish Phase I, Cycle I or Rift Sense. The same calculation does
  // NOT claim later phases, cycles, spatial steps or learned techniques.
  const earnedOther=verifiedOtherPreparation?.originalSourceEarnedFirstMilestones||{};
  if(earnedOther.soul?.phase===1){
   originalMilestones.soul.phase=1;
   originalMilestones.soul.soulReserve=earnedOther.soul.soulReserve;
   originalMilestones.soul.perceptionRangeMetres=earnedOther.soul.perceptionRangeMetres;
  }
  if(earnedOther.body?.completedCycle==='Muscle-Tendon Cycle'){
   originalMilestones.body.completedCycles=['Muscle-Tendon Cycle'];
   originalMilestones.body.originalCurrentStrengthBonus=1;
   originalMilestones.body.realCombatBodyStaminaBonus=2;
  }
  if(earnedOther.rift?.step===1){
   originalMilestones.rift.step=1;
   originalMilestones.rift.originalLimitedSense=structuredClone(earnedOther.rift.sense);
  }
  if([1,2,3,4,5].includes(verifiedMeridian?.originalMeridianStageEarned)){
   originalMilestones.meridian.stage=verifiedMeridian.originalMeridianStageEarned;
   originalMilestones.meridian.openedGates=0;
   originalMilestones.meridian.foundationQuality=
    verifiedMeridian.originalStageOneFoundationQuality;
   originalMilestones.meridian.foundationIntegrity=
    verifiedMeridian.originalFoundationIntegrity;
   if(verifiedMeridian.originalMeridianStageEarned>=2){
    originalMilestones.meridian.primaryMeridiansMapped=
     verifiedMeridian.originalStageTwoPrimaryMeridians;
    originalMilestones.meridian.originalQiCapacityProfile=
     structuredClone(verifiedMeridian.originalStageTwoQiProfile);
    if(verifiedMeridian.originalMeridianStageEarned>=3){
     originalMilestones.meridian.openedGates=
      verifiedMeridian.originalStageThreeOpenedGates;
     originalMilestones.meridian.originalVerifiedGateRecords=
      structuredClone(verifiedMeridian.originalStageThreeIndividualGates);
     if(verifiedMeridian.originalMeridianStageEarned>=4)
      originalMilestones.meridian.originalDantianSea=
       structuredClone(verifiedMeridian.originalStageFourSea);
     if(verifiedMeridian.originalMeridianStageEarned===5)
      originalMilestones.meridian.originalLivingWebRoutes=
       structuredClone(verifiedMeridian.originalStageFiveWebRoutes);
    }
   }
  }
  return {known:true,actorId,privateToGM:true,
   evidenceOwners:['world/emergent-people.js','world/person-careers.js',
    'world/independent-person-lives.js'],
   // Physical condition is an independent source-owned snapshot. Past
   // original workplace incidents are real, but no clinical diagnosis,
   // combat wound boxes or age-adjusted abilities can be deduced from them.
   physicalCondition:{ageBand:actor.ageBand,status:actor.status,
    fatigue:actor.fatigue,currentAttributes:null,wounds:null,
    workplaceIncidentEvidence:Careers.workplaceSafetyStatus(actor)
     .map((incident,i)=>({...incident,
      originalSourceHash:actor.career.safetyIncidents[i].sourceHash})),
    originalCareerWorkBlockedByRecoveryStatus:actor.status==='recovering',
    recoveryStatusNotClinicalWoundDiagnosis:true,
    woundDetailsNotEstablished:true},
   profession:career?{
    competenceRank:career.competenceRank,skillPoints:career.skillPoints,
    completedWorkChecks:career.workCount,successfulWorkChecks:career.successes,
    demonstratedMethods:{...career.demonstratedMethods},
    verifiedWorkReceipts:career.workReceipts.map(r=>({
     sourceHash:r.sourceHash,day:r.source.day,
     method:r.source.task.method,degree:r.source.outcome.degree,
     success:r.source.outcome.success
    })),
    awardedLicence:career.recognizedLicence,
    attestationCount:(career.attestations||[]).length
   }:null,
   // True CURRENT ordinary work readiness comes from the original career
   // formula, never a model-invented all-purpose NPC ability score.
   currentMundaneWork:Careers.currentCapability(actor),
   chosenHousehold,
   // Source-verified real co-present contacts are personal evidence, not
   // friendship, magical teaching or the player's knowledge.
   ordinaryIndependentContacts:
    require('./independent-contacts').privateIndividualEvidence(w,actorId),
   ordinaryIndependentLife:life?{
    sourceHash:life.sourceHash,asOfDay:life.lastDay,
    focus:life.focus,familiarity:{...life.metrics},
    recentActivities:life.history.slice(-8).map(e=>({
     sourceHash:e.seal,day:e.source.day,
     action:e.source.action,focus:e.source.focus,
     familiarityGained:e.source.improved
    })),notSupernaturalAdvancement:true
   }:null,
   // No owner has yet bound emergent persons to actual source-verified
   // personal discipline events or a technique catalogue. Raw legacy
   // arrays are NOT evidence of power and must not be laundered as such.
   originalPowerMilestones:originalMilestones,
   originalMeridianPreparation:verifiedMeridian,
   // Actual original practice receipts, but NO core ignition, Soul phase,
   // Body cycle, Rift step, free mana or learned technique.
   originalOtherDisciplinePreparation:verifiedOtherPreparation,
   verifiedLearnedTechniques:[],
   unverifiedLegacyClaims:{
    disciplineEntries:Array.isArray(actor.practicedDisciplines)?
     actor.practicedDisciplines.length:0,
    techniqueEntries:Array.isArray(actor.knownTechniques)?
     actor.knownTechniques.length:0
   },
   // Ordinary finite goods are read from the ORIGINAL consent-and-custody
   // source. Clothing, tools, weapons and actual worn gear remain unresolved.
   physicalMaterialCustody:Custody.privateHoldingEvidence(w,actorId),
   equipment:{verifiedItems:null,
    reason:'Verified materials are not proof of equipped tools, weapons or armor'},
   beastRelationships:{verifiedPartners:null,reason:'Original consent and bond bridge not yet established'},
   sourceStatus:verifiedMeridian?.originalMeridianStageEarned>=1?
    'Real original Stage '+verifiedMeridian.originalMeridianStageEarned+
     ' Meridian anatomy, actual source-owned practice and individual daily/work evidence verified; other powers unresolved':
    'Earned ordinary work and daily familiarity verified; unearned supernatural stages remain unresolved',
   noAbilityByTitle:true,noRetrospectivePower:true};
 }
 if(actorId.startsWith('notable:')){
  const n=w?.notables?.[actorId.slice('notable:'.length)];
  if(!n)return {known:false};
  return {known:true,actorId,privateToGM:true,
   evidenceOwners:['world/notables.js'],
   physicalCondition:{ageBand:n.life?.ageBand??null,
    recoveryMonths:n.injuryMonths,currentAttributes:null,wounds:null},
   profession:{competenceRank:n.professional?.rank??null,
    practicePoints:n.professional?.pp??null},
   ordinaryIndependentLife:null,
   disciplinePreparation:n.discipline?{
    path:n.discipline.path,nextTrial:n.discipline.next,
    preparationPoints:n.discipline.trainingPoints,
    trialReady:n.discipline.ready,monthsStudied:n.discipline.trainingMonths,
    actualBreakthroughNotGranted:true
   }:null,
   originalPowerMilestones:emptyMilestones(),
   verifiedLearnedTechniques:[],
   equipment:{verifiedItems:null},
   beastRelationships:{verifiedPartners:null},
   sourceStatus:'Professional progress and discipline preparation only; current power/combat record not established',
   noPowerByProfession:true,noRetroactivePower:true};
 }
 return {known:false};
}

function gmDossier(w,actorId,s=null){
 if(typeof actorId!=='string')throw Error('An established individual ID is required');
 if(actorId.startsWith('origin-kin:')){
  const evidence=earnedEvidence(w,actorId,s);
  if(!evidence.known)return evidence;
  return {known:true,kind:'original-independent-origin-relative',
   actorId,name:evidence.name,privateToGM:true,
   earnedEvidence:evidence,
   baselineAttributes:null,latentPotential:null,
   noAssumedBiologicalKinshipFromRole:true,
   noAutomaticProfessionPowerOrAttendance:true};
 }
 if(actorId.startsWith('sapient:')){
  const evidence=earnedEvidence(w,actorId,s);
  if(!evidence.known)return evidence;
  return {known:true,kind:'independent-sapient-beast-person',actorId,
   species:evidence.originalSpecies,privateToGM:true,
   earnedEvidence:evidence,
   humanBaselineAttributes:null,humanLatentPotential:null,
   independentPersonalWorkNotBeastLevel:true,
   noAssumedHumanProfessionOrSystemStages:true,
   noAssumedPartnershipOrPlayerKnowledge:true};
 }
 if(actorId.startsWith('emergent:')){
  const actor=w?.emergentPeople?.people?.[actorId.slice('emergent:'.length)];
  if(!actor||actor.actorId!==actorId)return {known:false};
  if(!actor.mechanicalFoundation)return {known:true,actorId,legacy:true,
   earnedEvidence:earnedEvidence(w,actorId,s),
   source:'Older witnessed individual: foundation has not been backfilled',
   unverified:['baseline attributes','latent potential'],
   noRetroactiveRanks:true};
  if(!verify(w,actor))throw Error('Tampered private NPC mechanical foundation');
  const foundation=actor.mechanicalFoundation;
  return {known:true,kind:'independent-person',actorId,name:actor.name,
   baselineAttributes:{...foundation.baselineAttributes},
   latentPotential:{...foundation.unassessedPotential},
   profession:actor.profession,professionCompetence:actor.career?.competenceRank??null,
   practicedDisciplines:[],knownTechniques:[],
   earnedEvidence:earnedEvidence(w,actorId,s),
   ageBand:actor.ageBand,
   actualCultivationAndCombatProfile:'Original earned source required; not deduced from social status, profession or baseline',
   beastRelationships:'Unestablished unless verified in original bond sources',
   privateToGM:true,noFreePowerOrRanks:true};
 }
 if(actorId.startsWith('notable:')){
  const n=w?.notables?.[actorId.slice('notable:'.length)];
  if(!n)return {known:false};
  return {known:true,kind:'established-notable',actorId,
   name:n.name,profession:n.profession,professionRank:n.professional?.rank??null,
   originalDiscipline:structuredClone(n.discipline||null),
   earnedEvidence:earnedEvidence(w,actorId,s),
   actualCultivationAndCombatProfile:'Preparatory stage and actual earned breakthrough are not interchangeable',
   baselineAttributes:null,latentPotential:null,
   noRetrospectiveAttributeOrPowerCreation:true,privateToGM:true};
 }
 return {known:false};
}
module.exports={ORIGIN,ATTRIBUTES,POTENTIAL,build,verify,earnedEvidence,gmDossier};
