'use strict';
// The human player's fourteen independent potential dimensions influence
// learning efficiency and the difficulty of real practice. They are never
// eligibility gates, maximum stages, guaranteed abilities or substitute
// evidence for physiology, resources, consent or a proper breakthrough.
// Existing profiles are immutable seeded facts; this module draws no dice.
const BANDS=Object.freeze(['limited','limited','developing','developing',
 'promising','promising','strong','exceptional','exceptional']);
const DIMENSIONS=Object.freeze([
 'meridianBreadth','gateStability','manaCoreArchitecture','soulDepth',
 'soulResilience','physicalAdaptation','evolutionaryPlasticity',
 'elementalAffinity','bloodlineExpression','lineageCompatibility',
 'traitIntegration','synchronisation','comprehension','techniqueCreativity'
]);
const PRIMARY=Object.freeze({
 meridian:Object.freeze({foundation:'meridianBreadth',awakening:'meridianBreadth',
  gates:'gateStability'}),
 arcane:Object.freeze({core:'manaCoreArchitecture',circle1:'manaCoreArchitecture'}),
 soul:Object.freeze({phase1:'soulDepth'}),
 body:Object.freeze({cycle1:'physicalAdaptation',cycle2:'physicalAdaptation'}),
 rift:Object.freeze({sense:'evolutionaryPlasticity'})
});
const METHODS=Object.freeze({
 meridian:Object.freeze({breath:'meridianBreadth',tissue:'physicalAdaptation',
  circulation:'gateStability'}),
 arcane:Object.freeze({'mana-attunement':'manaCoreArchitecture',
  'core-geometry':'manaCoreArchitecture',formulae:'techniqueCreativity'}),
 soul:Object.freeze({'self-awareness':'soulDepth','identity-ward':'soulResilience',
  resonance:'soulDepth'}),
 body:Object.freeze({muscle:'physicalAdaptation',tendon:'physicalAdaptation',
  recovery:'physicalAdaptation',bone:'physicalAdaptation',marrow:'physicalAdaptation'}),
 rift:Object.freeze({boundaries:'evolutionaryPlasticity',
  orientation:'comprehension','anchor-theory':'comprehension'})
});
const ORIGIN_STEPS=Object.freeze({
 3:'lineageCompatibility',4:'physicalAdaptation',
 5:'traitIntegration',6:'bloodlineExpression',
 7:'evolutionaryPlasticity',8:'bloodlineExpression'
});
const ORIGIN_AXES=Object.freeze({
 physical:'lineageCompatibility',energetic:'traitIntegration',
 spiritual:'soulResilience','trait-conflict':'traitIntegration'
});
function bonus(score){
 if(!Number.isInteger(score)||score<1||score>9)
  throw Error('Invalid saved individual potential; cannot invent aptitude');
 return score<=2?-1:score<=4?0:score<=6?1:2;
}
function read(s,dimension){
 if(!DIMENSIONS.includes(dimension))throw Error('Unknown human potential dimension');
 const r=s?.player?.capabilityProfile?.potential?.[dimension];
 if(!r)return {dimension,score:null,modifier:0,rating:'not recorded',
  available:false,noStageCap:true};
 const score=r.latent;
 return {dimension,score,modifier:bonus(score),rating:BANDS[score-1],
  available:true,noStageCap:true};
}
function discipline(s,system,target,method){
 const dim=(method&&METHODS[system]?.[method])||
  PRIMARY[system]?.[target]||
  (system==='meridian'?'gateStability':
   system==='arcane'?'manaCoreArchitecture':
   system==='soul'?'soulDepth':
   system==='body'?'physicalAdaptation':'comprehension');
 return read(s,dim);
}
function originStep(s,step){
 if(!Object.hasOwn(ORIGIN_STEPS,step))throw Error('Unknown Origin integration step');
 return read(s,ORIGIN_STEPS[step]);
}
function originAxis(s,axis){
 if(!Object.hasOwn(ORIGIN_AXES,axis))throw Error('Unknown Origin compatibility axis');
 return read(s,ORIGIN_AXES[axis]);
}
// Older sealed receipts predate aptitude. Keep them verifiable as their own
// historical checks; a newer receipt is anchored to the owner's saved profile.
function matches(s,record,dimension){
 if(record===undefined)return true;
 if(!record||record.dimension!==dimension)return false;
 const expected=read(s,dimension);
 return record.score===expected.score&&
  record.modifier===expected.modifier&&
  record.rating===expected.rating&&record.noStageCap===true;
}
module.exports={BANDS,DIMENSIONS,PRIMARY,METHODS,ORIGIN_STEPS,
 ORIGIN_AXES,bonus,read,discipline,originStep,originAxis,matches};
