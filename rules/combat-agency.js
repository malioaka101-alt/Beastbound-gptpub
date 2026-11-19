'use strict';
// An enemy combat action is chosen from previously sourced individual combat
// behaviour, never from the player's request or a GM reaction to the attack die.
// A deterministic, encounter-scoped draw does not consume the combat RNG.
const Crypto=require('node:crypto'),C=require('./core'),Combat=require('./combat');
const STYLES={
 territorial:[60,25,15],
 defensive:[35,35,30],
 cautious:[25,25,50],
 predatory:[75,20,5]
};
const ACTIONS=['attack','hold','retreat'];
function verify(assessment){
 const b=assessment?.behavior;
 if(!b||!Object.prototype.hasOwnProperty.call(STYLES,b.style)||
    typeof b.source!=='string'||b.source.trim().length<18||
    typeof b.nonlethal!=='boolean'||typeof b.canCommunicate!=='boolean')
  throw Error('Independent source-recorded beast combat behaviour is required before opening a fight');
 C.int(b.withdrawalDC,'sourced withdrawal DC',5,40);
 C.int(b.parleyDC,'sourced parley DC',5,40);
 return {style:b.style,nonlethal:b.nonlethal,
   canCommunicate:b.canCommunicate,withdrawalDC:b.withdrawalDC,
   parleyDC:b.parleyDC,source:b.source.trim().slice(0,180)};
}
function choose(s){
 const battle=s.battle;
 if(!battle||battle.mode!=='wounds-v1'||!battle.enemyBehavior)
  throw Error('No established independent enemy combat behaviour for this encounter');
 const profile=battle.enemyBehavior;
 if(!Object.prototype.hasOwnProperty.call(STYLES,profile.style))
  throw Error('Unreconciled enemy combat temperament');
 const opponent=Combat.get(s,battle.enemyId);
 C.int(battle.round,'combat round',1,100000);
 const bytes=Crypto.createHash('sha256').update([
  s.seed,battle.beastId,battle.round,battle.startedAt,
  'independent-combat-decision-v1'].join('|')).digest();
 const roll=bytes.readUInt32BE(0)%100;
 let weights=[...STYLES[profile.style]];
 if(opponent.wounds[2]>0||opponent.status==='fled'){
  weights=[10,10,80];
 }else if(opponent.wounds[1]>0){
  weights=[Math.max(10,weights[0]-30),weights[1],weights[2]+30];
 }
 const total=weights.reduce((a,b)=>a+b,0);
 const scaled=roll*total/100;
 let cumulative=0,plan=ACTIONS[ACTIONS.length-1];
 for(let i=0;i<ACTIONS.length;i++){cumulative+=weights[i];if(scaled<cumulative){plan=ACTIONS[i];break;}}
 return {plan,nonlethal:profile.nonlethal,
  canCommunicate:profile.canCommunicate,
  withdrawalDC:profile.withdrawalDC,parleyDC:profile.parleyDC};
}
// A source-witnessed independent adult may freely protect the player from
// an ALREADY committed wild-beast attack. This is neither ally recruitment
// nor a new human attack/damage scheme. Actual intervention has the original
// beast roll target this person's real wound-model combatant instead.
function chooseHumanInterposition(s,beastPlan,excludedActorId=null){
 if(beastPlan!=='attack')return null;
 const f=s.battle;
 if(!f||f.mode!=='wounds-v1'||!f.beastId||
  f.enemyId!=='beast:'+f.beastId)return null;
 const people=require('../world/emergent-people'),
  realm=require('../world/simulation').peek(s),
  presence=require('../world/person-presence'),
  health=require('./unified'),
  day=Math.floor(s.world.minutes/1440),
  minute=s.world.minutes%1440;
 const eligibles=[];
 for(const [id,combatant] of Object.entries(s.table?.combatants||{})){
  if(!/^npc_person_[0-9]+$/.test(id)||!combatant.npcOrigin)
   continue;
  const actorId=combatant.npcOrigin.actorId;
  if(actorId===excludedActorId)continue; // One personal response per actual round.
  if(typeof actorId!=='string'||id!=='npc_'+actorId.slice('emergent:'.length))
   throw Error('Registered combatant is not the original individual person');
  const condition=health.currentNpcWoundCondition(s,actorId),
   p=realm?.emergentPeople?.people?.[actorId.slice('emergent:'.length)];
  if(!p||!condition||
   condition.workAndOrdinaryPracticeBlocked||
   p.status!=='active'||p.fatigue>75||
   p.ageBand!=='adult, exact birthday not established'||
   !s.chatRuntime?.scene?.includes(p.name+' stands beside the player'))
   continue;
  const here=presence.resolve(realm,actorId,s.world.location,day,minute);
  if(!here?.presence||here.presence.hash!==p.shift?.hash||
   here.presence.originHash!==p.originHash||
   combatant.npcOrigin.location!==s.world.location)
   continue;
  eligibles.push({actorId,entryMinute:combatant.npcOrigin.worldMinute});
 }
 if(!eligibles.length)return null;
 // A bounded single protective reaction avoids granting a crowd free extra
 // turns. Rank by original witnessed entry and identity, not by any caller's
 // desired winner, stat, roll or actor ID.
 eligibles.sort((a,b)=>a.entryMinute-b.entryMinute||
  a.actorId.localeCompare(b.actorId));
 return people.chooseEmergencyInterposition(s,eligibles[0].actorId);
}
// Reuse the actual source-established paid equipment owner, this same
// original registered human combatant and the SAME personal RNG. No weapon
// is assumed from title or occupation; no player-picked strike probability.
function chooseArmedHumanStrike(s,beastPlan){
 if(beastPlan==='retreat')return null;
 const battle=s.battle;
 if(!battle||battle.mode!=='wounds-v1'||!battle.beastId||
  battle.enemyId!=='beast:'+battle.beastId)return null;
 const realm=require('../world/simulation').peek(s),
  People=require('../world/emergent-people'),
  Gear=require('./equipment'),
  Health=require('./unified'),
  Presence=require('../world/person-presence'),
  day=Math.floor(s.world.minutes/1440),
  minute=s.world.minutes%1440,eligible=[];
 for(const [id,c] of Object.entries(s.table?.combatants||{})){
  if(!/^npc_person_[0-9]+$/.test(id)||!c.npcOrigin)continue;
  const actorId=c.npcOrigin.actorId;
  const condition=Health.currentNpcWoundCondition(s,actorId),
   p=realm?.emergentPeople?.people?.[actorId?.slice('emergent:'.length)];
  if(!p||!condition||condition.workAndOrdinaryPracticeBlocked||
   p.status!=='active'||p.fatigue>75||
   p.ageBand!=='adult, exact birthday not established')continue;
  const weapon=Gear.verifiedIndependentWeapon(s,actorId);
  if(!weapon)continue;
  const present=Presence.resolve(realm,actorId,s.world.location,day,minute);
  if(!present?.presence||present.presence.hash!==p.shift?.hash||
   present.presence.originHash!==p.originHash||
   c.npcOrigin.location!==s.world.location||
   !s.chatRuntime?.scene?.includes(
     p.name+' holds the '+weapon.item.replace(/_/g,' ')+
     ' ready beside the player'))continue;
  eligible.push({actorId,entryMinute:c.npcOrigin.worldMinute});
 }
 if(!eligible.length)return null;
 // Only one independently acting armed bystander per exchange. This limit
 // does not invent a combat party or grant universal cooperative attacks.
 eligible.sort((a,b)=>a.entryMinute-b.entryMinute||
  a.actorId.localeCompare(b.actorId));
 return People.chooseOriginalArmedBeastStrike(s,eligible[0].actorId);
}
module.exports={verify,choose,chooseHumanInterposition,chooseArmedHumanStrike};
