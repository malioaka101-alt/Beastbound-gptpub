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
module.exports={verify,choose};
