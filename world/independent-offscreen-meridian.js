'use strict';
// #177. Autonomous MERIDIAN Foundation preparation and Stage I are separate
// from Arcane, Soul, Body, Rift. Existing original Meridian stage arithmetic,
// personally accrued method familiarity, foundation quality, integrity and
// original +Stamina anatomy remain exclusive to rules/disciplines.js.
// The individual makes the decisions. No GM-selected roll or elapsed time.
const Crypto=require('node:crypto'),Core=require('../rules/core'),
 Combat=require('../rules/combat'),Disc=require('../rules/disciplines'),
 Build=require('../rules/build'),Potential=require('../rules/potential-mechanics'),
 Difficulty=require('../rules/dynamic-difficulty'),
 Offscreen=require('./independent-original-power-days');
const PRACTICE='original-independent-meridian-foundation-practice-v1',
 RITE='original-independent-meridian-foundation-stage-one-rite-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 METHODS=Disc.KEYS.meridian.focus;
function chance(p){
 const base={curious:66,steady:59,independent:51,reserved:39}[p?.personality];
 if(!Number.isInteger(base)||!Number.isInteger(p?.fatigue)||
  p.fatigue<0||p.fatigue>100)
  throw Error('Original Meridian independent personality and fatigue must exist');
 return Math.max(10,base-(p.fatigue>=55?15:0));
}
function originalCheck(s,ctx,modifier,dc){
 // Private remote checks use the same original check and a single dice roll.
 // Preserve even a full, bounded player-facing log, not just its length.
 const log=s.log.slice();
 try{return Core.check(s,{modifier,dc,
  label:'Private independently chosen original Meridian Foundation',
  independentRngOwner:ctx.actor,privateDisplay:true});}
 finally{s.log.splice(0,s.log.length,...log);}
}
function source(ctx,base,additional){
 const witness=Offscreen.opportunityEvidence(ctx,'meridian');
 return {origin:base,actorId:ctx.actor.actorId,
  individualOriginHash:ctx.actor.originHash,
  originalCombatEntrySeal:ctx.body.npcOrigin.seal,
  originalFoundationSeal:ctx.actor.mechanicalFoundation.seal,
  originalShiftHash:ctx.originalShiftHash,
  originalSceneHash:hash(witness),offscreenOpportunity:witness,
  target:'foundation',originalSkillRankBonus:0,
  startMinute:ctx.workDay*1440+600,day:ctx.workDay,...additional};
}
function ready(s,ctx){
 const p=ctx.actor,b=ctx.body,existing=p.meridianTraining;
 // Other systems do not automatically grant or bar genuine Meridian practice.
 // One independently chosen original discipline action per real day, even
 // after refusal or a backlash; no cross-discipline double practice.
 if(Object.values(p.originalEarlyDisciplinePreparation||{}).
    some(x=>x.lastAttemptDay>=ctx.workDay)||
   (existing?.sessions||[]).some(x=>x.source.day>=ctx.workDay)||
   existing?.lastAttemptDay>=ctx.workDay||
   b.status!=='ok'||b.wounds.some(x=>x>0)||b.stamina<1||
   (existing&&ctx.workDay<existing.cooldownUntil)||
   existing?.earnedStage===1||existing?.target==='awakening'||
   existing?.sessions?.length>=480)return false;
 if(!Disc.verifyNpcMeridian(s,p))
  throw Error('Independent original Meridian source has been altered');
 return true;
}
function practice(s,ctx){
 if(!ready(s,ctx))return null;
 const p=ctx.actor,body=ctx.body,existing=p.meridianTraining;
 const required=Disc.KEYS.meridian.tracks.foundation[0];
 if(existing?.points>=required)return rite(s,ctx);
 const rec=existing||{origin:PRACTICE,target:'foundation',stageAtStart:0,
  points:0,methods:{},sessions:[],lastAttemptDay:-1,cooldownUntil:0};
 const before=p.rngState,stamina=body.stamina,choiceChance=chance(p),
  choice=Core.die(p,100),accepted=choice<=choiceChance,
  pointsBefore=rec.points,minutes=accepted?120:5;
 let method=null,methodNumber=null,check=null,complicationRoll=null,
  cooldown=rec.cooldownUntil,spent=0;
 if(accepted){
  methodNumber=Core.die(p,METHODS.length);
  method=METHODS[methodNumber-1];
  const prior=rec.sessions.filter(x=>x.source.origin===PRACTICE&&
   x.source.accepted).map(x=>({
    system:'meridian',target:'foundation',method:x.source.method,
    minutes:120,startMinute:x.source.startMinute,eventHash:x.seal})),
   dc=Difficulty.disciplinePractice(s,{system:'meridian',method,
    record:rec,baseDC:Disc.KEYS.meridian.tracks.foundation[1],
    independent:true,short:true,originalPhysicalOwner:body,
    originalTrainingWitnesses:prior}).dc,
   training=Disc.originalActorTrainingProfile(s,{
    actorId:p.actorId,system:'meridian',target:'foundation',method});
  spent=1;body.stamina-=1;
  const result=originalCheck(s,ctx,training.modifier,dc);
  const earned=result.progress+
   (result.success?Math.max(0,training.potential.modifier):0);
  check={roll:result.roll,modifier:result.modifier,dc:result.dc,
   degree:result.degree,success:result.success,earned};
  if(result.degree==='severe failure'){
   complicationRoll=Core.die(p,20);
   if(complicationRoll<=3||complicationRoll===14||complicationRoll===15)
    Combat.harm(s,body,2);
   if(complicationRoll<=5)cooldown=ctx.workDay+6;
  }
  rec.points=Math.min(required,rec.points+earned);
  rec.methods[method]=(rec.methods[method]||0)+1;
 }
 const q=source(ctx,PRACTICE,{
  rngBefore:before,rngAfter:p.rngState,
  choiceD100:choice,choiceChance,accepted,
  personalityAtAttempt:p.personality,fatigueAtAttempt:p.fatigue,
  actualMinutes:minutes,method,methodNumber,
  staminaCost:spent,
  staminaBefore:accepted?stamina:null,
  maxStaminaAtAttempt:accepted?body.maxStamina:null,
  staminaAfter:accepted?stamina-1:null,
  check,complicationRoll,pointsBefore,pointsAfter:rec.points,
  cooldownUntil:cooldown,noAutomaticRankOrStage:true});
 rec.sessions.push({source:q,seal:hash(q)});
 rec.lastAttemptDay=ctx.workDay;rec.cooldownUntil=cooldown;
 p.meridianTraining=rec;
 if(!Disc.verifyNpcMeridian(s,p))
  throw Error('Actual private Meridian practice did not pass original source replay');
 return {kind:'original-meridian-practice',system:'meridian',
  actualOriginalCheck:accepted,sourceHash:hash(q),noPlayerKnowledge:true};
}
function rite(s,ctx){
 if(!ready(s,ctx))return null;
 const p=ctx.actor,body=ctx.body,rec=p.meridianTraining,
  target=Disc.KEYS.meridian.tracks.foundation[0];
 if(!rec||rec.points!==target||
  Object.keys(rec.methods).filter(k=>rec.methods[k]>0).length<2)return null;
 const before=p.rngState,stamina=body.stamina,
  maximum=body.maxStamina,initialWounds=[...body.wounds],
  choiceChance=chance(p),choice=Core.die(p,100),
  accepted=choice<=choiceChance,dc=Disc.KEYS.meridian.tracks.foundation[1]+5,
  training=Disc.originalActorTrainingProfile(s,{
   actorId:p.actorId,system:'meridian',target:'foundation'}),
  apt=training.potential.modifier,
  oldCooldown=rec.cooldownUntil,pointsBefore=rec.points,
  distinct=Object.keys(rec.methods).length;
 let minutes=5,quality=null,integrity=null,check=null,
  outcome='declined',cooldown=oldCooldown;
 if(accepted){
  minutes=180;
  const roll=originalCheck(s,ctx,training.modifier,dc);
  check={roll:roll.roll,modifier:roll.modifier,dc:roll.dc,
   degree:roll.degree,success:roll.success};
  if(roll.success){
   quality=roll.degree==='exceptional'?'Perfect':
    roll.degree==='strong'?'Firm':'Sound';
   integrity=20;
   const bonus=Build.meridianProfile(1).bonuses.stamina;
   body.maxStamina+=bonus;body.stamina+=bonus;
   rec.target='awakening';rec.points=0;rec.methods={};
   rec.earnedStage=1;rec.foundationQuality=quality;
   rec.foundationIntegrity=integrity;outcome='breakthrough';
  }else if(roll.degree==='setback'){
   cooldown=ctx.workDay+12;outcome='stalled';
  }else if(roll.degree==='failure'){
   cooldown=ctx.workDay+24;outcome='stalled';
  }else{
   cooldown=ctx.workDay+30;rec.points=Math.floor(rec.points*.75);
   Combat.harm(s,body,2);outcome='backlash';
  }
 }
 const q=source(ctx,RITE,{
  originalAptitudeDimension:training.potential.dimension,
  originalAptitudeBonus:apt,originalRiteDC:dc,
  pointsBefore,pointsAfter:rec.points,distinctMethodsBefore:distinct,
  rngBefore:before,rngAfter:p.rngState,
  choiceD100:choice,choiceChance,accepted,
  personalityAtAttempt:p.personality,fatigueAtAttempt:p.fatigue,
  actualMinutes:minutes,check,outcome,cooldownBefore:oldCooldown,
  cooldownUntil:cooldown,earnedStageAfter:rec.earnedStage===1?1:0,
  foundationQuality:quality,foundationIntegrityAfter:integrity,
  staminaCost:0,
  staminaBefore:accepted?stamina:null,
  staminaAfter:accepted?body.stamina:null,
  maxStaminaBefore:accepted?maximum:null,
  maxStaminaAfter:accepted?body.maxStamina:null,
  woundsBefore:accepted?initialWounds:null,
  woundsAfter:accepted?[...body.wounds]:null,
  feeTalons:0,insightSpent:0,
  noInventedTrainingRank:true,noFreeQiOrLearnedTechnique:true});
 rec.cooldownUntil=cooldown;
 rec.sessions.push({source:q,seal:hash(q)});
 if(!Disc.verifyNpcMeridian(s,p))
  throw Error('Actual private Meridian Stage I rite did not pass original source replay');
 return {kind:'original-meridian-stage-one-rite',system:'meridian',
  actualOriginalCheck:accepted,outcome,sourceHash:hash(q),
  noPlayerKnowledge:true};
}
module.exports={PRACTICE,RITE,practice,rite,chance};
