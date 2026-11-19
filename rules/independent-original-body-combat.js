'use strict';
// Shared ORIGINAL first Muscle–Tendon Cycle combat law for an independently
// acting adult using their ACTUALLY purchased and ready mundane weapon.
// The player source is rules/player-combat-action.js:profile:
//   effective Strength includes genuinely earned +1 and M1 natural force
//   applies ONLY to Strength-based attacks, via Math.max(weapon M,1).
// Never create a second attack roll, weapon, combat rank or bonus damage.
const Combat=require('./combat'),
 People=require('../world/emergent-people'),
 Foundation=require('../world/person-mechanical-foundations'),
 Early=require('./independent-original-discipline-preparation'),
 Realm=require('../world/simulation');
const ORIGIN='shared-original-independent-body-cycle-one-weapon-profile-v1';
function profile(s,{actorId,combatantId,action}={}){
 if(typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId)||
  typeof combatantId!=='string'||
  combatantId!=='npc_'+actorId.slice('emergent:'.length)||
  !action||!['str','dex'].includes(action.attribute))
  throw Error('Original independent Body weapon profile requires the existing real adult and the approved action');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice('emergent:'.length)],
  combatant=Combat.get(s,combatantId);
 if(!p||p.actorId!==actorId||!People.verify(w,p)||
  !Foundation.verify(w,p)||combatant.npcOrigin?.actorId!==actorId||
  combatant.npcOrigin?.individualOriginHash!==p.originHash||
  combatant.npcOrigin?.foundationSeal!==p.mechanicalFoundation.seal)
  throw Error('Original independent physical actor or paid combatant evidence not verified');
 const base=p.mechanicalFoundation.baselineAttributes[action.attribute];
 if(!Number.isInteger(base)||base<1||base>30||
  !Number.isInteger(action.attackBonus)||action.attackBonus< -2||
  action.attackBonus>4||!Number.isInteger(action.offM)||
  action.offM<0||action.offM>10)
  throw Error('The original individual attack must use a verified birth attribute and paid weapon magnitude');
 const earned=p.originalFirstPowerMilestones?.body;
 let bodyStrength=0,bodyForceM=0;
 if(earned!==undefined){
  if(!Early.verify(s,p)||earned?.kind!=='body-muscle-tendon-cycle-one'||
   earned.completedCycle!=='Muscle-Tendon Cycle'||
   earned.originalBirthAttributesRemainImmutable!==true||
   earned.naturalStrengthIncrease!==1||
   earned.maxStaminaAfter!==combatant.maxStamina||
   !Number.isInteger(combatant.offM)||combatant.offM<1||
   earned.offMAfter!==combatant.offM||
   earned.maxStaminaAfter!==earned.maxStaminaBefore+2)
   throw Error('The original earned independent Body Cycle combat evidence is not replayable against actual current human anatomy');
  if(action.attribute==='str'){
   bodyStrength=earned.naturalStrengthIncrease;
   bodyForceM=1;
  }
 }
 return {modifier:Math.floor((base+bodyStrength-10)/2)+action.attackBonus,
  offM:Math.max(action.offM,bodyForceM),
  originalSource:'rules/player-combat-action.js:profile',
  extraDice:0,noFreeCombatRank:true,
  noWeaponScaleStacking:true,privateEarnedBodyForceM:bodyForceM};
}
module.exports={ORIGIN,profile};
