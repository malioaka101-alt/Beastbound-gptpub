'use strict';
// Only a source-recorded, genuinely carried and equipped mundane weapon may
// enter the played wound attack resolver. No free Damage, Offense M or Qi.
const E=require('../engine.js'),C=require('./core');
const ATTRS=new Set(['str','dex']);
const FIELDS=new Set(['id','kind','item','attribute','damage','offM','attackBonus',
 'canNonlethal','worldMinute','source']);
// Shared pure validation: a merchant's recorded examination can create an
// action record; a live attack separately requires carrying/equipping it.
function validateSpec(s,id,a){
 if(typeof id!=='string'||!/^[a-z][a-z0-9_-]{2,50}$/.test(id))
  throw Error('A previously recorded, equipped mundane combat action ID is required');
 if(!a||typeof a!=='object'||Array.isArray(a)||
    Object.keys(a).some(k=>!FIELDS.has(k))||
    a.id!==id||a.kind!=='mundane'||!ATTRS.has(a.attribute)||
    typeof a.source!=='string'||a.source.trim().length<18||
    !Number.isInteger(a.worldMinute)||a.worldMinute<0||a.worldMinute>s.world.minutes||
    typeof a.item!=='string'||!/^[a-z_]{3,60}$/.test(a.item)||
    typeof a.canNonlethal!=='boolean')
  throw Error('A valid source-recorded equipped mundane weapon action is required; unlearned supernatural attacks are disabled');
 C.int(a.damage,'recorded weapon damage',0,100);
 C.int(a.offM,'recorded weapon Offense magnitude',0,10);
 C.int(a.attackBonus,'recorded weapon attack bonus',-2,4);
 return a;
}
// First Muscle-Tendon Cycle already establishes M1 natural force. It is a
// physical capacity, not a free weapon, spell or additive new magnitude tier.
// Preserve the mundane attack if a legacy/forged body claim cannot be proven.
function earnedBodyForce(s){
 const cycles=s.player?.body?.cycles,combatant=s.table?.combatants?.player,
  history=s.table?.disciplineTraining?.body?.history;
 if(!Array.isArray(cycles)||!cycles.includes('Muscle-Tendon Cycle')||
   !Array.isArray(history)||!combatant||
   !Number.isInteger(combatant.offM)||combatant.offM<1)
  return 0;
 const entry=history.find(x=>x.target==='cycle1'&&
   x.change==='Completed Cycle I Muscle-Tendon refinement; +2 stamina, Might +1, M1 natural force'&&
   ['success','strong','exceptional'].includes(x.quality)&&
   Number.isInteger(x.day)&&x.day>=1&&x.day<=E.day(s));
 return entry?1:0;
}
function profile(s,id){
 const a=validateSpec(s,id,s.player?.combatActions?.[id]);
 if(s.player.equippedWeapon!==a.item||
    !Number.isInteger(s.player.inventory?.[a.item])||s.player.inventory[a.item]<1)
  throw Error('The approved mundane weapon must actually be equipped and in inventory');
 const score=C.int(s.player.attributes?.[a.attribute],'recorded '+a.attribute,1,30);
 const rank=C.int(s.player.skills?.combat?.rank,'recorded Combat rank',0,5);
 // Only force-based attacks can express the earned tissue force profile.
 // Magnitudes identify scale: M1 never stacks into a fictitious M2 weapon.
 const bodyRefinementM=a.attribute==='str'?earnedBodyForce(s):0;
 return {actionId:id,modifier:Math.floor((score-10)/2)+2*rank+a.attackBonus,
  damage:a.damage,offM:Math.max(a.offM,bodyRefinementM),
  bodyRefinementM,canNonlethal:a.canNonlethal};
}
module.exports={profile,validateSpec};
