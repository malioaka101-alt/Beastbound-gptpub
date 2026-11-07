'use strict';
// Beast combat statistics come from previously witnessed individual assessment
// with actual anatomical provenance, not from a live player's requested damage.
const C=require('./core'),Encounter=require('./encounter'),Agency=require('./combat-agency');
const ALLOWED=['beastId'];
function begin(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).some(k=>!ALLOWED.includes(k)))
  throw Error('Combat begin accepts only an encountered beastId; combat stats must be independently pre-established');
 const id=p.beastId,b=s.beasts?.[id];
 if(typeof id!=='string'||!b||s.encounter?.beastId!==id||s.battle)
  throw Error('A current unengaged, known beast encounter is required');
 const a=b.combatAssessment;
 if(!a||a.used||a.beastId!==id||a.species!==b.species||
    a.evolutionStage!==b.evolutionStage||a.sapience!==b.sapience||
    typeof a.source!=='string'||a.source.trim().length<18||
    !Number.isInteger(a.worldMinute)||a.worldMinute<0||a.worldMinute>s.world.minutes||
    !a.stats||typeof a.stats!=='object'||Array.isArray(a.stats))
  throw Error('Combat requires a source-recorded individual beast combat profile with current form');
 const stats=a.stats;
 for(const [k,lo,hi] of [
  ['toughness',0,100],['defense',1,100],['stamina',0,10000],
  ['vigor',-10,50],['will',-10,50],['offM',0,10],['durM',0,10],
  ['sapience',0,5],['attack',-20,50],['damage',0,100]
 ])C.int(stats[k],k,lo,hi);
 if(stats.sapience!==b.sapience)throw Error('Measured combat sapience conflicts with real beast record');
 if(!Array.isArray(stats.boxes)||stats.boxes.length!==3||
    stats.boxes.some(x=>!Number.isInteger(x)||x<1||x>20))
  throw Error('Individual beast wound box profile is not verified');
 if(Object.keys(stats).some(k=>![
  'toughness','defense','stamina','vigor','will','offM','durM',
  'sapience','attack','damage','boxes'
 ].includes(k)))
  throw Error('Unverified extra combat profile overrides are not permitted');
 const behavior=Agency.verify(a);
 // Sapience 0–2 is not a spoken-language channel. A bare caller-supplied
 // canCommunicate flag is not evidence of a trained gesture vocabulary or
 // mutually understood signals. Keep parley fail-closed until an independently
 // witnessed nonverbal channel has its own source-verification procedure.
 if(b.sapience<=2&&behavior.canCommunicate)
  throw Error('Non-sapient animal communication requires a separately witnessed, verified signal channel; an assessment flag alone cannot enable parley');
 const result=Encounter.begin(s,{beastId:id,...stats,source:a.source.trim()});
 s.battle.enemyBehavior=behavior;
 a.used=true;a.usedAtMinute=s.world.minutes;
 return {...result,verifiedIndividualProfile:true,independentEnemyBehavior:true};
}
module.exports={begin};
