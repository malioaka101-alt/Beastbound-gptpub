'use strict';
// #177. Apply the EXISTING original 108-Gate law to a genuine independent
// Meridian Stage II human. Not a copy of the Gate ladder: actual bands,
// per-gate requirements, boundary DC, qualities and source capacities all
// come from rules/meridian-shared-original-gates.js, used by the PC owner.
const Crypto=require('node:crypto'),
 Core=require('../rules/core'),Combat=require('../rules/combat'),
 Gate=require('../rules/meridian-shared-original-gates'),
 Potential=require('../rules/potential-mechanics'),
 Meridian=require('./independent-offscreen-meridian'),
 Ladder=require('./independent-meridian-ladder'),
 Offscreen=require('./independent-original-power-days');
const ORIGIN='original-independent-108-meridian-gate-history-v1',
 PRACTICE='source-owned-autonomous-meridian-gate-practice-v1';
const H=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const integer=x=>Number.isInteger(x)&&x>=0;
const severityName=['Mild','Moderate','Severe','Critical','Catastrophic'];
function openState(p){
 return {origin:ORIGIN,originalAwakeningSourceHash:
   p.originalMeridianLadder.originalStageTwoSourceHash,
  stage:2,gates:[],sessions:[],
  gateWork:{number:1,progress:0,forced:false},
  energy:structuredClone(p.originalMeridianLadder.energy)};
}
function modifier(p){
 const scores=p.mechanicalFoundation.baselineAttributes,
  aptitude=Potential.bonus(
   p.mechanicalFoundation.unassessedPotential.gateStability),
  quality=p.meridianTraining.foundationQuality;
 return {attribute:Math.floor((scores.wis-10)/2),
  aptitude,foundation:Gate.foundationBonus(quality),
  originalRankBonus:0};
}
function privateCheck(s,p,mod,dc){
 const old=s.log.slice();
 try{return Core.check(s,{modifier:mod,dc,
  label:'Private independently practised original Meridian Gate',
  independentRngOwner:p,privateDisplay:true});}
 finally{s.log.splice(0,s.log.length,...old);}
}
function source(ctx,state,detail){
 const witness=Offscreen.opportunityEvidence(ctx,'meridian');
 return {origin:PRACTICE,system:'meridian',
  actorId:ctx.actor.actorId,
  individualOriginHash:ctx.actor.originHash,
  originalFoundationSeal:ctx.actor.mechanicalFoundation.seal,
  originalCombatEntrySeal:ctx.body.npcOrigin.seal,
  originalStageTwoSourceHash:state.originalAwakeningSourceHash,
  originalShiftHash:ctx.originalShiftHash,
  originalSceneHash:H(witness),
  offscreenOpportunity:witness,
  day:ctx.workDay,startMinute:ctx.workDay*1440+600,
  personalityAtAttempt:ctx.actor.personality,
  fatigueAtAttempt:ctx.actor.fatigue,
  originalSkillRankBonus:0,noInventedTechniqueOrOtherStage:true,
  ...detail};
}
function verify(s,p){
 const state=p?.originalMeridianGates;
 if(state===undefined)return true;
 const previous=p.originalMeridianLadder;
 if(!previous||previous.stage!==2||
  !Ladder.verify(s,p)||
  !state||state.origin!==ORIGIN||
  state.originalAwakeningSourceHash!==previous.originalStageTwoSourceHash||
  ![2,3].includes(state.stage)||
  !Array.isArray(state.gates)||state.gates.length>108||
  !Array.isArray(state.sessions)||state.sessions.length<1||
  state.sessions.length>3000||
  !state.gateWork||!integer(state.gateWork.number)||
  !integer(state.gateWork.progress)||
  state.gateWork.forced!==false||
  !state.energy)return false;
 try{Gate.verifiedGates(state.gates);}catch{return false;}
 let gates=[],work={number:1,progress:0,forced:false},
  current=structuredClone(previous.energy),lastDay=-1,lastEnd=-1,
  expectedStage=2;
 const orig=modifier(p),m=orig.attribute+orig.aptitude+orig.foundation;
 for(const entry of state.sessions){
  const q=entry?.source,ref=entry?.seal;
  if(!q||ref!==H(q)||q.origin!==PRACTICE||
   q.actorId!==p.actorId||q.individualOriginHash!==p.originHash||
   q.originalFoundationSeal!==p.mechanicalFoundation.seal||
   q.originalCombatEntrySeal!==
    s.table?.combatants?.['npc_'+p.id]?.npcOrigin?.seal||
   q.originalStageTwoSourceHash!==state.originalAwakeningSourceHash||
   q.system!=='meridian'||
   q.originalSkillRankBonus!==0||q.noInventedTechniqueOrOtherStage!==true||
   !integer(q.day)||q.day<=lastDay||
   !integer(q.startMinute)||q.startMinute<lastEnd||
   q.startMinute+q.actualMinutes>s.world.minutes||
   q.day!==Math.floor(q.startMinute/1440)||
   q.day<=previous.awakening.lastAttemptDay||
   !Offscreen.verifyEvidence(s,p,q)||
   q.gateNumber!==work.number||q.pointsBefore!==work.progress||
   q.gatesBefore!==gates.length||
   !integer(q.rngBefore)||q.rngBefore<1||
   !integer(q.rngAfter)||q.rngAfter<1||
   !integer(q.choiceD100)||q.choiceD100<1||q.choiceD100>100||
   !['reserved','curious','steady','independent']
     .includes(q.personalityAtAttempt)||
   !integer(q.fatigueAtAttempt)||q.fatigueAtAttempt>100||
   q.choiceChance!==Meridian.chance({personality:q.personalityAtAttempt,
    fatigue:q.fatigueAtAttempt})||
   typeof q.accepted!=='boolean'||
   q.originalForceChoice!==false||
   q.staminaSpent!==0||
   JSON.stringify(q.energyBefore)!==JSON.stringify(current))
   return false;
  if(work.number<1||work.number>108)return false;
  const spec=Gate.gateSpec(work.number),random={rngState:q.rngBefore};
  if(q.gateBand!==spec.band||
   q.transition!==spec.transition||
   q.actualDC!==spec.actualDC||
   q.requiredPoints!==spec.points||
   Core.die(random,100)!==q.choiceD100||
   q.accepted!==(q.choiceD100<=q.choiceChance))
   return false;
  let earned=0,mitigationRoll=null,deviation=null,opened=null,
   progress=work.progress,after=structuredClone(current);
  if(q.accepted){
   if(q.actualMinutes!==180||!q.check||
    q.check.roll!==Core.die(random,20)||
    q.check.dc!==spec.actualDC||
    q.check.modifier!==m||
    q.staminaBefore<1||q.staminaAfter!==q.staminaBefore||
    q.maxStaminaAtAttempt<q.staminaBefore||
    !Array.isArray(q.woundsBefore)||q.woundsBefore.length!==3||
    q.woundsBefore.some(v=>v!==0))return false;
   const margin=q.check.roll+m+
     Core.naturalAdjustment(q.check.roll)-spec.actualDC,
    degree=Core.degree(margin),
    bonus=margin>=0?Math.max(0,orig.aptitude):0;
   earned=Core.progress(degree)+bonus;
   progress+=earned;
   if(q.check.degree!==degree||q.check.success!==(margin>=0)||
    q.check.earned!==earned)return false;
   let woundSteps=0;
   if(degree==='severe failure'){
    mitigationRoll=Core.die(random,20);
    const reduction=mitigationRoll+
      Math.floor((p.mechanicalFoundation.baselineAttributes.con-10)/2)+
      Core.naturalAdjustment(mitigationRoll)>=15?1:0,
     sev=Math.min(4,Math.max(0,
      (spec.band==='Lower'?0:spec.band==='Middle'?1:2)-reduction));
    deviation=severityName[sev];
    if(sev>=2){
     woundSteps=sev>=3?3:2;
     progress=Math.floor(progress*.75);
    }
   }
   if(q.mitigationRoll!==mitigationRoll||
    q.deviation!==deviation||
    q.originalWoundSteps!==woundSteps||
    JSON.stringify(q.woundsAfter)!==JSON.stringify(
     woundSteps===2?[1,0,0]:woundSteps===3?[0,1,0]:[0,0,0]))
    return false;
   if(progress>=spec.points){
    const quality=Gate.gateQuality(degree,p.meridianTraining.foundationQuality);
    opened={number:spec.number,band:spec.band,quality,
     day:q.day,sourceHash:ref};
    gates.push(opened);
    const cap=Gate.profile(3,gates);
    after={maxQi:Math.max(current.maxQi,cap.qi),
     currentQi:Math.min(Math.max(current.maxQi,cap.qi),
      current.currentQi+Math.max(0,cap.qi-current.maxQi)),
     flow:cap.flow,recovery:cap.recovery,
     originalCapacityOwner:'rules/build.js:meridianProfile'};
    expectedStage=3;
    work={number:spec.number+1,progress:0,forced:false};
   }else work={number:spec.number,progress,forced:false};
  }else{
   if(q.actualMinutes!==5||q.check!==null||
    q.staminaBefore!==null||q.staminaAfter!==null||
    q.maxStaminaAtAttempt!==null||q.woundsBefore!==null||
    q.woundsAfter!==null||
    q.mitigationRoll!==null||q.deviation!==null||
    q.originalWoundSteps!==0)return false;
  }
  if(q.gateOpened!==!!opened||
   q.openedQuality!==(opened?.quality||null)||
   q.earnedPoints!==earned||
   q.pointsAfter!==work.progress||
   q.gatesAfter!==gates.length||
   q.stageAfter!==expectedStage||
   JSON.stringify(q.energyAfter)!==JSON.stringify(after)||
   random.rngState!==q.rngAfter)return false;
  current=after;
  lastDay=q.day;lastEnd=q.startMinute+q.actualMinutes;
 }
 return state.stage===expectedStage&&
  state.gates.length===gates.length&&
  state.gates.every((x,i)=>JSON.stringify(x)===JSON.stringify(gates[i]))&&
  state.gateWork.number===work.number&&
  state.gateWork.progress===work.progress&&
  state.energy.maxQi===current.maxQi&&
  JSON.stringify(state.energy)===JSON.stringify(current);
}
function afterDaily(s,ctx){
 const p=ctx.actor,body=ctx.body,
  base=p.originalMeridianLadder;
 if(!base||base.stage!==2||
  ctx.workDay<=base.awakening.lastAttemptDay||
  body.status!=='ok'||body.stamina<1||
  body.wounds.some(x=>x!==0))return null;
 if(!Ladder.verify(s,p)||!verify(s,p))
  throw Error('Original Stage II/Gate receipts have been altered');
 const state=p.originalMeridianGates||openState(p);
 if(state.gates.length===108)
  return require('./independent-meridian-sea').afterDaily(s,ctx);
 if(state.sessions.length>=3000)return null;
 const spec=Gate.gateSpec(state.gateWork.number),
  sourceRng=p.rngState,choiceChance=Meridian.chance(p),
  choiceD100=Core.die(p,100),accepted=choiceD100<=choiceChance,
  beforeEnergy=structuredClone(state.energy),
  oldStamina=body.stamina,oldWounds=accepted?[...body.wounds]:null,
  baseMod=modifier(p),m=baseMod.attribute+
   baseMod.aptitude+baseMod.foundation,
  workBefore=state.gateWork.progress;
 let earn=0,receipt=null,mitigationRoll=null,deviation=null,steps=0,
  opened=null,minutes=accepted?180:5,progress=state.gateWork.progress;
 if(accepted){
  const roll=privateCheck(s,p,m,spec.actualDC);
  earn=roll.progress+(roll.success?Math.max(0,baseMod.aptitude):0);
  progress+=earn;
  receipt={roll:roll.roll,modifier:roll.modifier,dc:roll.dc,
   degree:roll.degree,success:roll.success,earned:earn};
  if(roll.degree==='severe failure'){
   const mitigating=privateCheck(s,p,
    Math.floor((p.mechanicalFoundation.baselineAttributes.con-10)/2),15);
   mitigationRoll=mitigating.roll;
   const sev=Math.min(4,Math.max(0,
    (spec.band==='Lower'?0:spec.band==='Middle'?1:2)-
    (mitigating.success?1:0)));
   deviation=severityName[sev];
   if(sev>=2){
    steps=sev>=3?3:2;
    Combat.harm(s,body,steps);
    progress=Math.floor(progress*.75);
   }
  }
  if(progress>=spec.points){
   const quality=Gate.gateQuality(roll.degree,
    p.meridianTraining.foundationQuality,false);
   opened={number:spec.number,band:spec.band,quality,
    day:ctx.workDay};
   const nextGates=[...state.gates,{...opened,sourceHash:null}],
    profile=Gate.profile(3,nextGates);
   state.energy={maxQi:Math.max(state.energy.maxQi,profile.qi),
    currentQi:Math.min(Math.max(state.energy.maxQi,profile.qi),
     state.energy.currentQi+Math.max(0,profile.qi-state.energy.maxQi)),
    flow:profile.flow,recovery:profile.recovery,
    originalCapacityOwner:'rules/build.js:meridianProfile'};
   state.stage=3;
   state.gateWork={number:spec.number+1,progress:0,forced:false};
  }else state.gateWork.progress=progress;
 }
 const q=source(ctx,state,{
  rngBefore:sourceRng,rngAfter:p.rngState,
  choiceChance,choiceD100,accepted,actualMinutes:minutes,
  gateNumber:spec.number,gateBand:spec.band,
  transition:spec.transition,requiredPoints:spec.points,
  actualDC:spec.actualDC,originalForceChoice:false,
  pointsBefore:workBefore,
  pointsAfter:state.gateWork.progress,
  gatesBefore:state.gates.length,gatesAfter:state.gates.length+(opened?1:0),
  staminaSpent:0,staminaBefore:accepted?oldStamina:null,
  staminaAfter:accepted?oldStamina:null,
  maxStaminaAtAttempt:accepted?body.maxStamina:null,
  woundsBefore:oldWounds,woundsAfter:accepted?[...body.wounds]:null,
  check:receipt,mitigationRoll,deviation,originalWoundSteps:steps,
  gateOpened:!!opened,openedQuality:opened?.quality||null,
  earnedPoints:earn,stageAfter:state.stage,
  energyBefore:beforeEnergy,energyAfter:structuredClone(state.energy)
 });
 const seal=H(q);
 if(opened)state.gates.push({...opened,sourceHash:seal});
 state.sessions.push({source:q,seal});
 p.originalMeridianGates=state;
 if(!verify(s,p))throw Error('Autonomous original 108-Gate receipt failed exact source replay');
 return {kind:'original-meridian-gate-practice',system:'meridian',
  accepted,gateNumber:spec.number,gateOpened:!!opened,
  originalSourceHash:seal,privateToGM:true,noPlayerKnowledge:true};
}
module.exports={ORIGIN,PRACTICE,afterDaily,verify};
