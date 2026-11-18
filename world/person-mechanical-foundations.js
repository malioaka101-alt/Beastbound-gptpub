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
function gmDossier(w,actorId){
 if(typeof actorId!=='string')throw Error('An established individual ID is required');
 if(actorId.startsWith('emergent:')){
  const actor=w?.emergentPeople?.people?.[actorId.slice('emergent:'.length)];
  if(!actor||actor.actorId!==actorId)return {known:false};
  if(!actor.mechanicalFoundation)return {known:true,actorId,legacy:true,
   source:'Older witnessed individual: foundation has not been backfilled',
   unverified:['baseline attributes','latent potential'],
   noRetroactiveRanks:true};
  if(!verify(w,actor))throw Error('Tampered private NPC mechanical foundation');
  const foundation=actor.mechanicalFoundation;
  return {known:true,kind:'independent-person',actorId,name:actor.name,
   baselineAttributes:{...foundation.baselineAttributes},
   latentPotential:{...foundation.unassessedPotential},
   profession:actor.profession,professionCompetence:actor.career?.competenceRank??null,
   practicedDisciplines:structuredClone(actor.practicedDisciplines||[]),
   knownTechniques:structuredClone(actor.knownTechniques||[]),
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
   actualCultivationAndCombatProfile:'Preparatory stage and actual earned breakthrough are not interchangeable',
   baselineAttributes:null,latentPotential:null,
   noRetrospectiveAttributeOrPowerCreation:true,privateToGM:true};
 }
 return {known:false};
}
module.exports={ORIGIN,ATTRIBUTES,POTENTIAL,build,verify,gmDossier};
