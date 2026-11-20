'use strict';
// #177: Second Arcane Circle for genuinely autonomous, already First-Circle
// independent people. This is the ORIGINAL Disciplines.arcaneCircleWork law,
// never a universal NPC stage, a gifted formula or a player scene witnessed
// at a distance. Each decision/check is privately replayed using personal RNG.
const Crypto=require('node:crypto'),
 Core=require('./core'),Combat=require('./combat'),Build=require('./build'),
 Early=require('./independent-original-discipline-preparation'),
 Law=require('./arcane-shared-original-circle-two');
const ORIGIN='source-earned-independent-original-arcane-circle-two-v1';
const RECOVERY='source-earned-independent-original-arcane-rested-mana-v1';
const ORIGINAL_EIGHT_HOUR_MANA_RECOVERY=12;
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const pattern=p=>'Dual channel revision of '+p.originalArcaneCore.geometry+
 ' using independently measured core feedback and coupled circulation';
// Structured capacity is NOT a paid, currently filled Mana pool. With no
// proven previous Arcane recharge, spendable energy conservatively starts 0.
const initialMana=()=>0;
const initialStability=90; // Original starting player Mana Core stability.
function verify(s,p){
 const r=p?.originalArcaneCircleTwo;
 if(r===undefined)return true;
 if(!p?.originalArcaneCore||p.originalArcaneCore.circles!==1||
  !Early.verify(s,p)||!r||r.origin!==ORIGIN||
  r.originalFirstCircleSourceHash!==p.originalArcaneCore.originalCircleOneSourceHash||
  !Array.isArray(r.sessions)||r.sessions.length>480)
  return false;
 let mana=initialMana(),stability=initialStability,progress=0,
  completed=false,prevDay=-1,previousEnd=0;
 const priorNights=new Set();
 const body=s.table?.combatants?.['npc_'+p.id];
 if(!body?.npcOrigin?.seal)return false;
 const Offscreen=require('../world/independent-original-power-days');
 for(const row of r.sessions){
  const q=row?.source;
  if(q?.origin===RECOVERY){
   const originalNight=q.originalNight,
    originalHash=originalNight?.seal;
   const capacity=Build.arcaneProfile(completed?2:1).mana;
   if(row.seal!==hash(q)||
    q.actorId!==p.actorId||q.system!=='arcane'||
    q.originalFirstCircleSourceHash!==r.originalFirstCircleSourceHash||
    !originalHash||priorNights.has(originalHash)||
    q.originalNightSourceHash!==originalHash||
    q.endMinute!==originalNight.source?.endMinute||
    q.endMinute<=previousEnd||q.endMinute>s.world.minutes||
    !Offscreen.verifyNights(s,p,[originalNight])||
    q.manaBefore!==mana||q.manaCapacity!==capacity||
    q.manaAfter!==Math.min(capacity,mana+ORIGINAL_EIGHT_HOUR_MANA_RECOVERY)||
    q.noAdditionalTimeOrManaWithoutRealRest!==true)return false;
   priorNights.add(originalHash);
   mana=q.manaAfter;previousEnd=q.endMinute;
   continue;
  }
  if(!q||row.seal!==hash(q)||completed||
   q.origin!==ORIGIN||q.system!=='arcane'||q.target!=='circle2'||
   q.actorId!==p.actorId||q.individualOriginHash!==p.originHash||
   q.originalFirstCircleSourceHash!==r.originalFirstCircleSourceHash||
   q.originalCombatEntrySeal!==body.npcOrigin.seal||
   q.originalFoundationSeal!==p.mechanicalFoundation?.seal||
   q.noSpellOrTechniqueGranted!==true||
   !Number.isInteger(q.day)||q.day<=prevDay||
   q.startMinute!==q.day*1440+600||q.startMinute<previousEnd||
   q.startMinute+q.actualMinutes>s.world.minutes||
   !Offscreen.verifyEvidence(s,p,q)||
   q.manaBefore!==mana||q.coreStabilityBefore!==stability||
   q.integrityBefore!==progress||q.stageBefore!==1||
   q.rngBefore<1||!Number.isInteger(q.rngBefore)||
   q.choiceChance!==Early.chance({
    personality:q.personalityAtDecision,fatigue:q.fatigueAtDecision})||
   !['curious','steady','reserved','independent'].includes(q.personalityAtDecision)||
   !Number.isInteger(q.fatigueAtDecision)||
   q.fatigueAtDecision<0||q.fatigueAtDecision>100||
   q.originalDesign!==pattern(p))
   return false;
  const roller={rngState:q.rngBefore};
  if(q.choiceD100!==Core.die(roller,100)||
   q.accepted!==(q.choiceD100<=q.choiceChance))
   return false;
  if(!q.accepted){
   if(q.actualMinutes!==5||q.check!==null||
    q.manaSpent!==0||q.originalPhysicalBacklash!==false||
    q.woundsBefore!==null||q.woundsAfter!==null)return false;
  }else{
   if(q.actualMinutes!==180||mana<Law.MANA_COST||
    !q.check||!Array.isArray(q.woundsBefore)||
    q.woundsBefore.length!==3||q.woundsBefore.some(x=>x!==0)||
    !Array.isArray(q.woundsAfter)||q.woundsAfter.length!==3)
    return false;
   const modifier=Math.floor((p.mechanicalFoundation.baselineAttributes.int-10)/2)+
    Law.stabilityBonus(stability),
    roll=Core.die(roller,20),
    margin=roll+modifier+Core.naturalAdjustment(roll)-Law.DC,
    degree=Core.degree(margin),success=margin>=0,
    actual={degree,success},earned=Law.earned(actual),
    severe=degree==='severe failure';
   if(q.check.roll!==roll||q.check.modifier!==modifier||
    q.check.dc!==Law.DC||q.check.degree!==degree||
    q.check.success!==success||q.check.margin!==margin||
    q.earnedIntegrity!==earned||q.manaSpent!==Law.MANA_COST||
    q.originalPhysicalBacklash!==severe||
    JSON.stringify(q.woundsAfter)!==JSON.stringify(severe?[1,0,0]:[0,0,0]))
    return false;
   mana-=Law.MANA_COST;
   stability=Law.stabilityAfter(stability,actual);
   progress=Math.min(Law.REQUIRED,progress+earned);
   if(progress===Law.REQUIRED)completed=true;
  }
  if(q.integrityAfter!==progress||q.manaAfter!==mana||
   q.coreStabilityAfter!==stability||
   q.stageAfter!==(completed?2:1)||
   q.rngAfter!==roller.rngState)return false;
  prevDay=q.day;previousEnd=q.startMinute+q.actualMinutes;
 }
 return r.integrity===progress&&r.manaRemaining===mana&&
  r.coreStability===stability&&r.completed===completed&&
  r.lastAttemptDay===prevDay&&
  r.originalFirstCircleSourceHash===p.originalArcaneCore.originalCircleOneSourceHash;
}
function ensureLedger(s,p){
 if(p?.originalArcaneCore?.circles!==1)return null;
 if(!Early.verify(s,p))
  throw Error('An actual source-earned First Circle is mandatory before Arcane Mana accounting');
 if(p.originalArcaneCircleTwo!==undefined){
  if(!verify(s,p))throw Error('Existing Second Circle resource evidence was altered');
  return p.originalArcaneCircleTwo;
 }
 const r={origin:ORIGIN,
  originalFirstCircleSourceHash:p.originalArcaneCore.originalCircleOneSourceHash,
  sessions:[],integrity:0,manaRemaining:initialMana(),
  coreStability:initialStability,completed:false,lastAttemptDay:-1};
 p.originalArcaneCircleTwo=r;
 if(!verify(s,p))throw Error('Original First Circle cannot initialise an unsupported Mana reserve');
 return r;
}
function privateStatus(s,p){
 if(!Early.verify(s,p)||!verify(s,p))
  throw Error('Independent Second Arcane Circle source was altered');
 const r=p.originalArcaneCircleTwo;
 return {privateToGM:true,
  originalOwner:'rules/disciplines.js:arcaneCircleWork',
  verifiedArcaneCircle:r?.completed?2:p.originalArcaneCore?.circles||0,
  secondCircleIntegrity:r?.integrity||0,
  currentMana:r?.manaRemaining??null,
  coreStability:r?.coreStability??null,
  sourceVerifiedSecondCircle:r?.completed===true,
  automaticSpellGranted:false};
}
function afterDaily(s,ctx){
 const p=ctx.actor,body=ctx.body;
 if(p.originalArcaneCore?.circles!==1||
  p.originalArcaneCircleTwo?.completed||
  !Early.verify(s,p)||!verify(s,p)||
  body.status!=='ok'||body.wounds.some(x=>x!==0))
  return null;
 const prior=ensureLedger(s,p);
 if(prior?.lastAttemptDay>=ctx.workDay||
  Object.values(p.originalEarlyDisciplinePreparation||{})
   .some(x=>x.lastAttemptDay>=ctx.workDay)||
  p.meridianTraining?.lastAttemptDay>=ctx.workDay)return null;
 // First-Circle source owns the structured Mana reservoir. There have
 // been no licensed spells or earlier verified Circle expenses; initialise
 // once. No per-day free refill is permitted.
 const r=prior;
 if(r.sessions.length>=480||r.manaRemaining<Law.MANA_COST||
  r.coreStability<40)return null;
 const start=ctx.workDay*1440+600,oldLog=s.log.slice(),
  before=p.rngState,choiceChance=Early.chance(p),
  choiceD100=Core.die(p,100),accepted=choiceD100<=choiceChance,
  woundsBefore=accepted?[...body.wounds]:null,
  manaBefore=r.manaRemaining,stabilityBefore=r.coreStability,
  integrityBefore=r.integrity;
 let check=null,earned=0,injury=false;
 if(accepted){
  const modifier=Math.floor((p.mechanicalFoundation.baselineAttributes.int-10)/2)+
   Law.stabilityBonus(r.coreStability);
  try{
   const actual=Core.check(s,{modifier,dc:Law.DC,
    label:'Independent original Second Arcane Circle construction',
    independentRngOwner:p,privateDisplay:true});
   check={roll:actual.roll,modifier:actual.modifier,dc:actual.dc,
    degree:actual.degree,success:actual.success,margin:actual.margin};
   earned=Law.earned(actual);
   injury=actual.degree==='severe failure';
   r.coreStability=Law.stabilityAfter(r.coreStability,actual);
   if(injury)Combat.harm(s,body,2);
   r.integrity=Math.min(Law.REQUIRED,r.integrity+earned);
   r.manaRemaining-=Law.MANA_COST;
  }finally{s.log.splice(0,s.log.length,...oldLog);}
 }
 const Offscreen=require('../world/independent-original-power-days');
 const source={origin:ORIGIN,actorId:p.actorId,system:'arcane',
  target:'circle2',individualOriginHash:p.originHash,
  originalFoundationSeal:p.mechanicalFoundation.seal,
  originalCombatEntrySeal:body.npcOrigin.seal,
  originalFirstCircleSourceHash:r.originalFirstCircleSourceHash,
  offscreenOpportunity:Offscreen.opportunityEvidence(ctx,'arcane'),
  day:ctx.workDay,startMinute:start,actualMinutes:accepted?180:5,
  rngBefore:before,rngAfter:p.rngState,
  personalityAtDecision:p.personality,fatigueAtDecision:p.fatigue,
  choiceD100,choiceChance,accepted,originalDesign:pattern(p),
  manaBefore,manaSpent:accepted?Law.MANA_COST:0,
  manaAfter:r.manaRemaining,
  coreStabilityBefore:stabilityBefore,coreStabilityAfter:r.coreStability,
  integrityBefore,earnedIntegrity:earned,integrityAfter:r.integrity,
  stageBefore:1,stageAfter:r.integrity===Law.REQUIRED?2:1,
  check,originalPhysicalBacklash:injury,
  woundsBefore,woundsAfter:accepted?[...body.wounds]:null,
  noSpellOrTechniqueGranted:true};
 r.sessions.push({source,seal:hash(source)});
 r.completed=r.integrity===Law.REQUIRED;
 r.lastAttemptDay=ctx.workDay;
 p.originalArcaneCircleTwo=r;
 if(!verify(s,p))
  throw Error('Original Second Circle independent source replay failed');
 return {kind:'arcane-architecture',target:'circle2',
  actualOriginalCheck:accepted,originalSourceHash:hash(source),
  earnedIntegrity:earned,integrity:r.integrity,completed:r.completed,
  actualManaSpent:accepted?Law.MANA_COST:0,
  originalPhysicalBacklash:injury,noNewSpell:true,noPlayerKnowledge:true};
}
// Only a real existing independent eight-hour safe sleep restores the
// ORIGINAL 12 Mana. No companion sleep, narrative rest, clock increment or
// claimed location may replenish the recorded energy budget.
function afterNight(s,p,nightRow){
 const r=p?.originalArcaneMatrix!==undefined?null:ensureLedger(s,p);
 // Once the matrix owner starts, the SAME stored Mana moves forward to
 // that distinct source ledger. Never restore both records on one night.
 if(!r||p.originalArcaneMatrix!==undefined)return null;
 if(!verify(s,p))throw Error('Arcane Mana recovery requires verified prior structural history');
 const Offscreen=require('../world/independent-original-power-days');
 if(!nightRow||!Offscreen.verifyNights(s,p,[nightRow])||
  r.sessions.length>=480||r.sessions.some(x=>x.source?.origin===RECOVERY&&
   x.source.originalNightSourceHash===nightRow.seal))return null;
 const capacity=Build.arcaneProfile(r.completed?2:1).mana,
  before=r.manaRemaining,after=Math.min(capacity,before+ORIGINAL_EIGHT_HOUR_MANA_RECOVERY);
 const source={origin:RECOVERY,system:'arcane',actorId:p.actorId,
  originalFirstCircleSourceHash:r.originalFirstCircleSourceHash,
  originalNight:structuredClone(nightRow),originalNightSourceHash:nightRow.seal,
  endMinute:nightRow.source.endMinute,manaBefore:before,
  manaAfter:after,manaCapacity:capacity,
  noAdditionalTimeOrManaWithoutRealRest:true};
 r.sessions.push({source,seal:hash(source)});
 r.manaRemaining=after;
 if(!verify(s,p))throw Error('Original Arcane rested Mana source replay failed');
 return {actualOriginalManaRestored:after-before,noFreeReplenishment:true};
}
module.exports={ORIGIN,RECOVERY,verify,privateStatus,ensureLedger,afterDaily,afterNight};
