'use strict';
// #177: the EXISTING original Stage IV Dantian Sea after a truly earned
// 108-Gate network. Reuses rules/disciplines.js:seaWork arithmetic through
// rules/meridian-shared-original-sea.js, preserving the SAME PC source law.
// The individual and their proven physical Combat owner bear every cost.
// No synthesized 108-Gate anatomy, NPC scene, Qi, status or second world tick.
const Crypto=require('node:crypto'),C=require('../rules/core'),
 Combat=require('../rules/combat'),Gates=require('./independent-meridian-gates'),
 Shared=require('../rules/meridian-shared-original-sea'),
 Foundation=require('../rules/meridian-shared-original-gates'),
 Night=require('./independent-meridian-night-qi'),
 Meridian=require('./independent-offscreen-meridian'),
 Offscreen=require('./independent-original-power-days');
const ORIGIN='original-independent-meridian-dantian-sea-v1',
 ATTEMPT='source-owned-independent-dantian-sea-attempt-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const n=(x,min=0,max=1e9)=>Number.isInteger(x)&&x>=min&&x<=max;
function stageThree(s,p){
 const r=p?.originalMeridianGates;
 if(!r||r.gates?.length!==108||r.stage!==3||
  !Gates.verify(s,p))return null;
 const qualities=Shared.qualities(r.gates);
 if(![36,72,108].every(i=>r.gates[i-1]?.number===i&&
  r.gates[i-1].sourceHash))return null;
 return {gates:r,qualities,gateFinal:r.gates[107].sourceHash};
}
function start(s,p,preverifiedStageThree=null){
 const ready=preverifiedStageThree||stageThree(s,p);
 if(!ready)throw Error('Real source-evidenced individual 108-Gate anatomy is required');
 return {origin:ORIGIN,gateFinalSourceHash:ready.gateFinal,
  originalStageThreeSourceHash:ready.gates.originalAwakeningSourceHash,
  originalCirculationBaseline:'engine.js:newGame:meridian.stability',
  originalBaselineStability:Shared.originalBaselineStability,
  stability:Shared.originalBaselineStability,
  points:0,attempts:[],lastAttemptDay:-1,
  energy:structuredClone(ready.gates.energy),
  stage:3,sea:null,completedAtMinute:null};
}
function independentCheck(s,p,modifier,dc,method){
 const originalLog=s.log.slice();
 try{return C.check(s,{modifier,dc,
  label:'Private original individual Dantian Sea '+method,
  independentRngOwner:p,privateDisplay:true});}
 finally{s.log.splice(0,s.log.length,...originalLog);}
}
function proof(ctx,r,details){
 const witnessed=Offscreen.opportunityEvidence(ctx,'meridian');
 return {origin:ATTEMPT,system:'meridian',
  actorId:ctx.actor.actorId,
  individualOriginHash:ctx.actor.originHash,
  originalFoundationSeal:ctx.actor.mechanicalFoundation.seal,
  originalCombatEntrySeal:ctx.body.npcOrigin.seal,
  originalStageThreeGateHash:r.gateFinalSourceHash,
  originalShiftHash:ctx.originalShiftHash,
  originalSceneHash:hash(witnessed),offscreenOpportunity:witnessed,
  day:ctx.workDay,startMinute:ctx.workDay*1440+600,
  personalityAtAttempt:ctx.actor.personality,
  fatigueAtAttempt:ctx.actor.fatigue,
  noInventedTechniqueOrStage:true,
  noAdditionalWorldTime:true,...details};
}
function verifyReady(s,p,ready){
 const r=p?.originalMeridianSea;
 if(r===undefined)return true;
 if(!ready||!r||r.origin!==ORIGIN||
  r.gateFinalSourceHash!==ready.gateFinal||
  r.originalStageThreeSourceHash!==
   ready.gates.originalAwakeningSourceHash||
  r.originalCirculationBaseline!=='engine.js:newGame:meridian.stability'||
  r.originalBaselineStability!==Shared.originalBaselineStability||
  ![3,4].includes(r.stage)||
  !n(r.points,0,5)||!n(r.stability,1,100)||
  !Array.isArray(r.attempts)||r.attempts.length<1||
  r.attempts.length>500||
  !Number.isInteger(r.lastAttemptDay)||r.lastAttemptDay<0)
  return false;
 let points=0,stability=Shared.originalBaselineStability,
  energy=structuredClone(ready.gates.energy),sea=null,
  stage=3,lastDay=-1,lastEnd=0,completedAtMinute=null;
 const personFoundation=p.mechanicalFoundation;
 let restIndex=0;
 for(const row of r.attempts){
  const prior=Night.replayUntil(s,p,r.rests||[],restIndex,
   row?.source?.startMinute??0,energy,lastEnd);
  if(!prior)return false;
  energy=prior.energy;restIndex=prior.index;lastEnd=prior.end;
  const q=row?.source;
  if(!q||row.seal!==hash(q)||stage!==3||
   q.origin!==ATTEMPT||q.system!=='meridian'||
   q.actorId!==p.actorId||
   q.individualOriginHash!==p.originHash||
   q.originalFoundationSeal!==personFoundation.seal||
   q.originalCombatEntrySeal!==
    s.table?.combatants?.['npc_'+p.id]?.npcOrigin?.seal||
   q.originalStageThreeGateHash!==ready.gateFinal||
   !Offscreen.verifyEvidence(s,p,q)||
   !n(q.day)||q.day<=lastDay||
   q.day<=ready.gates.sessions.at(-1)?.source?.day||
   !n(q.startMinute)||q.startMinute<lastEnd||
   q.startMinute!==q.day*1440+600||
   q.startMinute+q.actualMinutes>s.world.minutes||
   !n(q.rngBefore,1,0xffffffff)||!n(q.rngAfter,1,0xffffffff)||
   !n(q.choiceD100,1,100)||
   !['reserved','curious','steady','independent']
    .includes(q.personalityAtAttempt)||
   !n(q.fatigueAtAttempt,0,100)||
   q.choiceChance!==Meridian.chance({personality:q.personalityAtAttempt,
    fatigue:q.fatigueAtAttempt})||
   q.pointsBefore!==points||
   q.stabilityBefore!==stability||
   JSON.stringify(q.energyBefore)!==JSON.stringify(energy)||
   q.noInventedTechniqueOrStage!==true||
   q.noAdditionalWorldTime!==true)
   return false;
  const roller={rngState:q.rngBefore},
   choice=C.die(roller,100),accepted=choice<=q.choiceChance;
  if(q.choiceD100!==choice||q.accepted!==accepted)return false;
  const law=Shared.working({...ready.qualities,
   foundationQuality:p.meridianTraining.foundationQuality,
   stability,minutes:120}),
   originalWIS=Math.floor((personFoundation.baselineAttributes.wis-10)/2);
  let quality=null,pointsEarned=0,check=null,
   energyAfter=structuredClone(energy),stabilityAfter=stability,
   stageAfter=3,formedSea=null,woundSteps=0;
  if(accepted){
   if(q.actualMinutes!==120||
    q.methodNumber!==C.die(roller,Shared.METHODS.length)||
    q.method!==Shared.METHODS[q.methodNumber-1]||
    q.staminaBefore<law.staminaSpent||
    q.staminaAfter!==q.staminaBefore-law.staminaSpent||
    q.staminaBefore>q.maxStaminaAtAttempt||
    energy.currentQi<law.qiSpent||
    q.qiSpent!==law.qiSpent||
    q.staminaSpent!==law.staminaSpent||
    !q.check||q.check.roll!==C.die(roller,20))
    return false;
   const mod=originalWIS+law.foundationBonus+law.gateBonus,
    margin=q.check.roll+mod+
     C.naturalAdjustment(q.check.roll)-law.actualDC,
    degree=C.degree(margin);
   check={roll:q.check.roll,modifier:mod,dc:law.actualDC,
    degree,success:margin>=0};
   pointsEarned=Shared.progress(degree,C.progress(degree));
   points=Math.min(5,points+pointsEarned);
   energyAfter.currentQi-=law.qiSpent;
   if(degree==='severe failure'){
    stabilityAfter=Math.max(1,stability-4);
    woundSteps=2;
   }
   if(points===5){
    const made=Shared.formation({...ready.qualities,
     stability:stabilityAfter});
    stageAfter=4;
    formedSea={rings:1,density:made.density,purity:made.purity,
     stability:stabilityAfter,formedAtMinute:q.startMinute,
     originalSource:'rules/disciplines.js:seaWork'};
    energyAfter={maxQi:Math.max(energyAfter.maxQi,made.profile.qi),
     currentQi:energyAfter.currentQi,
     flow:made.profile.flow,recovery:made.profile.recovery,
     originalCapacityOwner:'rules/build.js:meridianProfile'};
    quality=made;
   }
   if(q.originalWoundSteps!==woundSteps||
    q.check.modifier!==check.modifier||
    q.check.dc!==check.dc||q.check.degree!==check.degree||
    q.check.success!==check.success||
    q.check.earned!==pointsEarned||
    JSON.stringify(q.woundsBefore)!==JSON.stringify([0,0,0])||
    JSON.stringify(q.woundsAfter)!==JSON.stringify(
      woundSteps===2?[1,0,0]:[0,0,0]))
    return false;
  }else if(q.actualMinutes!==5||q.method!==null||
   q.methodNumber!==null||q.check!==null||
   q.qiSpent!==0||q.staminaSpent!==0||
   q.staminaBefore!==null||q.staminaAfter!==null||
   q.maxStaminaAtAttempt!==null||q.woundsBefore!==null||
   q.woundsAfter!==null||q.originalWoundSteps!==0)
   return false;
  if(q.pointsEarned!==pointsEarned||
   q.pointsAfter!==points||
   q.stabilityAfter!==stabilityAfter||
   q.stageAfter!==stageAfter||
   JSON.stringify(q.energyAfter)!==JSON.stringify(energyAfter)||
   JSON.stringify(q.seaAfter)!==JSON.stringify(formedSea)||
   q.formed!==!!formedSea||roller.rngState!==q.rngAfter)
   return false;
  energy=energyAfter;stability=stabilityAfter;stage=stageAfter;
  if(formedSea){sea=formedSea;completedAtMinute=q.startMinute;}
  lastDay=q.day;lastEnd=q.startMinute+q.actualMinutes;
 }
 const later=Night.replayUntil(s,p,r.rests||[],restIndex,
  Number.POSITIVE_INFINITY,energy,lastEnd);
 if(!later||later.index!==(r.rests||[]).length)return false;
 energy=later.energy;
 return r.stage===stage&&r.points===points&&
  r.stability===stability&&r.lastAttemptDay===lastDay&&
  JSON.stringify(r.energy)===JSON.stringify(energy)&&
  JSON.stringify(r.sea)===JSON.stringify(sea)&&
  r.completedAtMinute===completedAtMinute;
}
function verify(s,p){
 return p?.originalMeridianSea===undefined?true:
  verifyReady(s,p,stageThree(s,p));
}
function afterDaily(s,ctx){
 const p=ctx.actor,body=ctx.body,ready=stageThree(s,p);
 if(!ready||body.status!=='ok'||body.stamina<1||
  body.wounds.some(x=>x>0)||
  ctx.workDay<=ready.gates.sessions.at(-1)?.source?.day)
  return null;
 // 'ready' just replayed all 108 source-earned Gates. Reuse that exact
 // attestation within this single synchronous turn, rather than doing
 // the 108-Gate replay TWO more times before today's action.
 if(!verifyReady(s,p,ready))
  throw Error('A private Dantian Sea record cannot be replayed');
 let r=p.originalMeridianSea||start(s,p,ready);
 if(r.stage===4)
  return require('./independent-meridian-web').afterDaily(s,ctx);
 if(r.attempts.length>=500||r.energy.currentQi<8)return null;
 const chance=Meridian.chance(p),rngBefore=p.rngState,
  chosen=C.die(p,100),accepted=chosen<=chance,
  qiBefore=structuredClone(r.energy),
  plan=Shared.working({...ready.qualities,
   foundationQuality:p.meridianTraining.foundationQuality,
   stability:r.stability,minutes:120});
 let methodNumber=null,method=null,check=null,
  earned=0,injury=0,stabilityAfter=r.stability,formation=null,
  staminaBefore=accepted?body.stamina:null,
  woundsBefore=accepted?[...body.wounds]:null,
  pointsBefore=r.points,stabilityBefore=r.stability,
  minutes=accepted?120:5,qiSpent=0,
  staminaSpent=0;
 if(accepted){
  methodNumber=C.die(p,Shared.METHODS.length);
  method=Shared.METHODS[methodNumber-1];
  qiSpent=plan.qiSpent;staminaSpent=plan.staminaSpent;
  body.stamina-=staminaSpent;
  r.energy.currentQi-=qiSpent;
  const wis=Math.floor((p.mechanicalFoundation.baselineAttributes.wis-10)/2),
   result=independentCheck(s,p,
    wis+plan.foundationBonus+plan.gateBonus,plan.actualDC,method);
  check={roll:result.roll,modifier:result.modifier,dc:result.dc,
   degree:result.degree,success:result.success,
   earned:Shared.progress(result.degree,result.progress)};
  earned=check.earned;r.points=Math.min(5,r.points+earned);
  if(result.degree==='severe failure'){
   injury=2;r.stability=Math.max(1,r.stability-4);
   Combat.harm(s,body,injury);
  }
  if(r.points===5){
   const made=Shared.formation({...ready.qualities,
    stability:r.stability});
   formation={rings:1,density:made.density,purity:made.purity,
    stability:r.stability,formedAtMinute:ctx.workDay*1440+600,
    originalSource:'rules/disciplines.js:seaWork'};
   r.stage=4;r.sea=formation;
   r.energy.maxQi=Math.max(r.energy.maxQi,made.profile.qi);
   r.energy.flow=made.profile.flow;
   r.energy.recovery=made.profile.recovery;
   r.completedAtMinute=formation.formedAtMinute;
  }
 }
 const q=proof(ctx,r,{
  rngBefore,rngAfter:p.rngState,
  choiceD100:chosen,choiceChance:chance,accepted,
  method,methodNumber,actualMinutes:minutes,
  staminaBefore,staminaAfter:accepted?body.stamina:null,
  maxStaminaAtAttempt:accepted?body.maxStamina:null,
  qiSpent,staminaSpent,woundsBefore,
  woundsAfter:accepted?[...body.wounds]:null,
  originalWoundSteps:injury,
  check,pointsBefore,pointsEarned:earned,pointsAfter:r.points,
  stabilityBefore,
  stabilityAfter:r.stability,
  energyBefore:qiBefore,energyAfter:structuredClone(r.energy),
  stageAfter:r.stage,formed:!!formation,seaAfter:formation});
 r.attempts.push({source:q,seal:hash(q)});
 r.lastAttemptDay=ctx.workDay;p.originalMeridianSea=r;
 if(!verify(s,p))
  throw Error('The original individual Dantian Sea check failed source replay');
 return {kind:'original-meridian-dantian-sea',system:'meridian',
  attempted:accepted,formed:!!formation,noPlayerKnowledge:true,
  originalSourceHash:hash(q)};
}
module.exports={ORIGIN,ATTEMPT,afterDaily,verify};
