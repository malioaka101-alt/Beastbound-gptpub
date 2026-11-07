'use strict';
// Distinct Second Circle Dual Channeling is earned structural capacity.
// Only individually verified, already learned Arcane Spark and Ward can
// use two channels together; no extra spell, NPC submission or free damage.
const E=require('../engine.js'),B=require('./build'),C=require('./core'),
 Combat=require('./combat'),Ward=require('./arcane-ward'),Spark=require('./arcane-spark');
function verify(s){
 const a=s.player?.arcane,profile=B.arcaneProfile(2),
  history=s.table?.disciplineTraining?.arcane?.history,
  original=history?.find(x=>x.target==='circle1'&&
   typeof x.change==='string'&&x.change.startsWith('First Circle constructed; ')),
  second=history?.find(x=>x.target==='circle2'&&
   x.change==='Second Circle constructed; dual channels integrated from the original First Circle'),
  work=s.table?.arcaneCircleRevision,
  proof=s.table?.arcaneArchitecture?.circle2,
  attempts=work?.attempts,last=Array.isArray(attempts)?attempts.at(-1):null;
 if(!a||a.coreIgnited!==true||a.circles!==2||
   a.channels!==profile.channels||a.structuredMana!==profile.mana||
   a.maxComplexity!==profile.maxComplexity||
   a.intake!==profile.intake||a.loadTolerance!==profile.loadTolerance||
   a.preparedCapacity!==profile.prepared||
   !Number.isInteger(a.coreStability)||a.coreStability<40||a.coreStability>100||
   !original||!Number.isInteger(original.day)||original.day<1||
   original.change!=='First Circle constructed; '+a.geometry||
   !second||!Number.isInteger(second.day)||second.day<original.day||
   second.day>E.day(s)||
   second.witnessSource!=='first-circle-architecture-revision-v1'||
   work?.target!==2||work.originalGeometry!==a.geometry||
   work.progress!==4||work.completed!==true||
   !Array.isArray(attempts)||!attempts.length||
   proof?.stage!=='Second Circle — Dual Channeling'||proof.number!==2||
   proof.priorGeometry!==a.geometry||proof.developedFromFirstCircleDay!==original.day||
   proof.channelCount!==2||proof.structuredMana!==profile.mana||
   proof.originalSource!=='first-circle-architecture-revision-v1'||
   proof.noNewSpellGranted!==true||proof.attemptCount!==attempts.length||
   !Number.isInteger(proof.completedMinute)||
   proof.completedMinute>s.world.minutes||
   proof.integratedDesign!==last?.design||
   proof.completedMinute-last.startedMinute<15||
   proof.completedMinute-last.startedMinute>480||
   second.quality!==last.result||
   attempts.some(x=>!Number.isInteger(x.startedMinute)||x.startedMinute<0||
    x.startedMinute>s.world.minutes||x.sourceDay!==original.day||
    x.firstGeometry!==a.geometry||x.manaSpent!==2||
    !['success','strong','exceptional','setback','failure','severe failure'].includes(x.result)||
    x.earnedIntegrity!==(x.result==='exceptional'?4:
     x.result==='strong'?3:x.result==='success'?2:0))||
   attempts.reduce((sum,x)=>sum+x.earnedIntegrity,0)<4)
  throw Error('Dual casting needs a genuinely earned, stable Second Arcane Circle with verified structural history');
 return {circles:2,channels:2,stage:proof.stage};
}
function cast(s,player,atkOpts,wardProfile,spell,dual){
 if(dual?.channels!==2||wardProfile?.techniqueId!=='arcane_ward'||
    spell?.techniqueId!=='arcane_spark')
  throw Error('Both separately learned basic formulas are needed for real dual channeling');
 const mana=C.int(s.player.mana,'real available Mana',0,100000);
 if(mana<wardProfile.manaCost+spell.manaCost)
  throw Error('Two genuine simultaneous spells require their combined real Mana cost');
 // The independent enemy plan was already committed before either roll.
 const protection=Ward.cast(s,player,wardProfile);
 const strike=Combat.attack(s,{...atkOpts,modifier:spell.modifier,
  damage:spell.damage,offM:spell.offM,brace:false,
  nonlethal:spell.nonlethal,castingDC:spell.castingDC,
  manaCost:spell.manaCost});
 const result={dualChannel:true,earnedSecondCircle:dual.stage,
  channels:2,verifiedTechniques:['arcane_ward','arcane_spark'],
  ward:protection,spark:strike,manaSpent:protection.manaSpent+strike.manaSpent,
  oneIndependentEnemyPlan:true,noFreeSpell:true};
 C.event(s,'combat','The earned Second Circle routes genuine Ward and Spark formulae through two channels.',{
  origin:'verified-second-circle-dual-combat',channels:2,
  manaSpent:result.manaSpent,wardRoll:protection.check.roll,
  sparkRoll:strike.roll,wardCast:protection.cast,sparkHit:strike.hit,
  noAdditionalEnemyPlan:true});
 return result;
}
function status(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Dual Arcane channel status is read-only; no spell, Mana, DC or enemy plan may be chosen');
 let architectureEarned=false,sparkCurrentlyCastable=false,wardCurrentlyCastable=false;
 try{verify(s);architectureEarned=true;}catch{}
 if(architectureEarned){
  try{sparkCurrentlyCastable=Spark.attackProfile(s,'arcane_spark').techniqueId==='arcane_spark';}catch{}
  try{wardCurrentlyCastable=Ward.profile(s,'arcane_ward').techniqueId==='arcane_ward';}catch{}
 }
 const combinedManaCost=4,availableMana=s.player?.mana??0;
 return {ability:'Second Circle — Dual Channeling (Ward + Spark)',
  architectureEarned,sparkCurrentlyCastable,wardCurrentlyCastable,
  combinedManaCost,availableMana,
  inActualCombat:!!s.battle,
  ready:architectureEarned&&sparkCurrentlyCastable&&wardCurrentlyCastable&&
    Number.isInteger(availableMana)&&availableMana>=combinedManaCost&&
    !!s.battle&&!(s.table?.combatants?.player?.ward?.steps>0),
  note:'Both spells must be learned independently. No automatic spell, instant free Ward, extra opponent action or higher Circle powers.'};
}
module.exports={verify,cast,status};
