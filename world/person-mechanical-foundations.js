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
function earnedEvidence(w,actorId){
 const emptyMilestones=()=>({
  meridian:{stage:null,openedGates:null},
  arcane:{coreIgnited:null,circles:null},
  soul:{phase:null},body:{completedCycles:null},
  rift:{step:null},beastOrigin:{integrations:null},
  humanEvolution:{stage:null},partnership:{synchronisation:null}
 });
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
  const career=actor.career||null;
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
   originalPowerMilestones:emptyMilestones(),
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
   sourceStatus:'Earned ordinary work and daily familiarity verified; supernatural and combat milestones unresolved',
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

function gmDossier(w,actorId){
 if(typeof actorId!=='string')throw Error('An established individual ID is required');
 if(actorId.startsWith('emergent:')){
  const actor=w?.emergentPeople?.people?.[actorId.slice('emergent:'.length)];
  if(!actor||actor.actorId!==actorId)return {known:false};
  if(!actor.mechanicalFoundation)return {known:true,actorId,legacy:true,
   earnedEvidence:earnedEvidence(w,actorId),
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
   earnedEvidence:earnedEvidence(w,actorId),
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
   earnedEvidence:earnedEvidence(w,actorId),
   actualCultivationAndCombatProfile:'Preparatory stage and actual earned breakthrough are not interchangeable',
   baselineAttributes:null,latentPotential:null,
   noRetrospectiveAttributeOrPowerCreation:true,privateToGM:true};
 }
 return {known:false};
}
module.exports={ORIGIN,ATTRIBUTES,POTENTIAL,build,verify,earnedEvidence,gmDossier};
