'use strict';
// Shared original actor-source calculus for the PC and a disposable genuinely
// generated person. These are five DISTINCT original discipline tracks, not
// a generic level, technique award or implied NPC eligibility to practice.
const A=require('node:assert/strict'),Engine=require('../engine.js'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Mechanics=require('../world/person-mechanical-foundations'),
 Atlas=require('../world/atlas'),Disc=require('../rules/disciplines'),
 Potential=require('../rules/potential-mechanics'),Rules=require('../rules');
const s=Engine.newGame({seed:946101,name:'Disposable shared actual human power-system sources'}),
 w=Realm.ensure(s),roster=People.ensure(w),
 region=Atlas.regions.find(r=>People.siteFor(r.id));
A.ok(region);
const eco=w.ecosystems[region.id],country=w.countries[region.polity];
eco.quality=75;eco.pressure=15;eco.water=75;eco.forage=80;
country.prosperity=75;country.stability=78;
const demand=People.sourceDemand(w,region);
A.ok(demand);
const p=People._debug.make(w,roster,0,demand);
A.ok(p);
A.equal(Mechanics.verify(w,p),true);
A.equal(People.verify(w,p),true);
const initial=Engine.exportGame(s),worldRng=s.rngState,
 npcRng=p.rngState;
const paths=[
 ['meridian','foundation','breath','wis','meridianBreadth'],
 ['meridian','foundation','circulation','wis','gateStability'],
 ['arcane','core','mana-attunement','int','manaCoreArchitecture'],
 ['arcane','core','formulae','int','techniqueCreativity'],
 ['soul','phase1','identity-ward','wis','soulResilience'],
 ['body','cycle1','recovery','con','physicalAdaptation'],
 ['body','cycle2','bone','con','physicalAdaptation'],
 ['rift','sense','orientation','int','comprehension']
];
// The same original 14 facets also cover beast-origin and partnership
// preparation, but a latent compatibility score is NOT an earned integration,
// evolution, bond, beast rank or synchronisation achievement.
for(const dimension of Potential.DIMENSIONS){
 const local=Potential.readForActor(s,dimension,p.actorId),
  score=p.mechanicalFoundation.unassessedPotential[dimension];
 A.equal(local.score,score);
 A.equal(local.modifier,Potential.bonus(score));
 A.equal(local.rating,Potential.BANDS[score-1]);
 A.equal(local.privateToGM,true);
 A.equal(local.originalUnassessedPotentialOnly,true);
 A.equal(local.earnedStageOrTechnique,null);
 A.equal(local.noStageCap,true);
}
for(const [system,target,method,attribute,dim] of paths){
 const human=Disc.originalActorTrainingProfile(s,{actorId:p.actorId,system,target,method}),
  player=Disc.originalActorTrainingProfile(s,{system,target,method}),
  source=p.mechanicalFoundation;
 A.equal(human.actorId,p.actorId);
 A.equal(human.system,system);
 A.equal(human.target,target);
 A.equal(human.method,method);
 A.equal(human.privateToGM,true);
 A.equal(human.originalRuleOwner,'rules/disciplines.js');
 A.equal(human.originalAttribute,attribute);
 A.equal(human.potential.dimension,dim);
 A.equal(human.potential.score,source.unassessedPotential[dim]);
 A.equal(human.potential.modifier,
  Potential.bonus(source.unassessedPotential[dim]));
 A.equal(human.potential.available,true);
 A.equal(human.potential.noStageCap,true);
 A.equal(human.potential.originalUnassessedPotentialOnly,true);
 A.equal(human.naturalModifier,
  Math.floor((source.baselineAttributes[attribute]-10)/2));
 A.equal(human.modifier,human.naturalModifier+human.potential.modifier);
 A.equal(human.earnedSkillRankBonus,0);
 A.equal(human.earnedSkillRankEstablished,false);
 A.equal(human.unverifiedNpcSkillNotInferred,true);
 A.equal(human.noStageOrTechniqueAwarded,true);
 A.equal(Object.hasOwn(human,'stage'),false);
 A.equal(Object.hasOwn(human,'rank'),false);
 A.equal(Object.hasOwn(human,'techniques'),false);
 A.deepEqual(Potential.discipline(s,system,target,method,p.actorId),
  human.potential);
 // The original PC method, stage target and skill owner retain their
 // exact existing natural modifier, formal rank and 14-facet aptitude.
 const original=Potential.discipline(s,system,target,method),
  skill=s.player.skills?.[Disc.KEYS[system].skill]?.rank||0,
  originalNatural=Math.floor((s.player.attributes[attribute]-10)/2);
 A.deepEqual(player.potential,original);
 A.equal(player.modifier,originalNatural+2*skill+original.modifier);
 A.equal(player.earnedSkillRankEstablished,true);
 A.equal(player.privateToGM,undefined);
 A.equal(player.noStageOrTechniqueAwarded,true);
 A.equal(Potential.readForActor(s,dim,'player').modifier,
  Potential.read(s,dim).modifier);
}
for(const bad of [
 {actorId:'emergent:person_99999',system:'arcane',target:'core',method:'formulae'},
 {actorId:'origin-kin:mother',system:'body',target:'cycle1',method:'recovery'},
 {actorId:p.actorId,system:'universal',target:'foundation',method:'breath'},
 {actorId:p.actorId,system:'arcane',target:'phase1',method:'mana-attunement'},
 {actorId:p.actorId,system:'rift',target:'sense',method:'mana-attunement'},
 {actorId:p.actorId,system:'body',target:'cycle1',method:'bone'}
]){
 A.throws(()=>Disc.originalActorTrainingProfile(s,bad),
  /original|verified|stage|method|real source/i);
}
A.equal(Engine.exportGame(s),initial,
 'All original five-power-system actor calculations are pure, with no NPC creation or hidden levels');
A.equal(s.rngState,worldRng);
A.equal(p.rngState,npcRng);
const tampered=Engine.importGame(initial),
 tp=Realm.peek(tampered).emergentPeople.people[p.id];
tp.mechanicalFoundation.unassessedPotential.soulDepth=
 tp.mechanicalFoundation.unassessedPotential.soulDepth===9?1:9;
A.throws(()=>Potential.discipline(tampered,'soul','phase1',
 'self-awareness',p.actorId),/source is not verified/);
A.throws(()=>Disc.originalActorTrainingProfile(tampered,{
 actorId:p.actorId,system:'soul',target:'phase1',method:'self-awareness'}),
 /source is not verified/);
const replay=Engine.importGame(initial),rp=Realm.peek(replay).emergentPeople.people[p.id];
A.deepEqual(Disc.originalActorTrainingProfile(replay,{
 actorId:rp.actorId,system:'arcane',target:'core',method:'core-geometry'}),
 Disc.originalActorTrainingProfile(s,{
 actorId:p.actorId,system:'arcane',target:'core',method:'core-geometry'}));
A.equal(Engine.exportGame(replay),initial);
// A user may not access GM-private original aptitude by submitting a
// made-up rule operation. The original public dispatcher retains its gates.
A.throws(()=>Rules.act(s,{system:'discipline',operation:'originalActorTrainingProfile',
 params:{actorId:p.actorId,system:'arcane',target:'core'}}),
 /Unsupported|Unknown|No rule|operation/i);
console.log('Shared original actor power-law sources: PC parity and independent verified human aptitude for Meridian, Arcane, Soul, Body and Rift; exact stage-specific methods; no rank/ability grants, caller leakage, rolls or save mutation; tamper rejection PASS');
