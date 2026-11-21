'use strict';
// A single actor-owned bridge to the EXISTING Stage VI–IX Meridian laws.
// Original Intent, Physique, bounded Domain and Constitution physics and
// costs are in rules/meridian-{living-intent,physique-integration,
// living-domain,transcendent-constitution}.js, shared without rewriting
// the original player actions by meridian-shared-original-advanced.js.
// Each person's own actual day, source body, Qi, verified earlier anatomy,
// acceptance and ONE original Core check remain mandatory.
const Crypto=require('node:crypto'),C=require('../rules/core'),
 Web=require('./independent-meridian-web'),
 Night=require('./independent-meridian-night-qi'),
 Meridian=require('./independent-offscreen-meridian'),
 Offscreen=require('./independent-original-power-days'),
 Gates=require('../rules/meridian-shared-original-gates'),
 Law=require('../rules/meridian-shared-original-advanced'),
 Places=require('./lived-places');
const ORIGIN='original-independent-source-owned-meridian-advanced-v1',
 SESSION='original-independent-meridian-advanced-physical-session-v1',
 H=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const number=(x,min=0,max=1e9)=>Number.isInteger(x)&&x>=min&&x<=max;
function initial(p){
 const w=p.originalMeridianWeb;
 return {origin:ORIGIN,originalWebSourceHash:w.originalStageFiveSourceHash,
  stage:5,energy:structuredClone(w.energy),stability:w.stability,
  track:{target:6,mapped:false,points:0,mapSourceHash:null,site:null},
  achieved:{},sessions:[],
  originalConstitutionBurden:null,
  noInheritedImmortalityOrUnlearnedTechnique:true};
}
function action(state){
 if(state.stage===9)return 'care';
 if(state.track.target!==state.stage+1)return null;
 return !state.track.mapped?'map':
  state.track.points<Law.POINTS[state.track.target]?'practice':'form';
}
function params(p,web,state,site,s){
 const target=state.track.target,route=web.routes.find(x=>
  x.integrity>=x.required&&!x.injuries.some(v=>!v.healed));
 if(!route)return null;
 const loc=Places.location(s,site),
  measuredRadius=Math.min(3,
   Math.max(2,Math.floor(state.energy.flow*state.stability/20))),
  radius=target===8&&state.track.mapped?
   state.track.radius:measuredRadius;
 if(target===8&&(!loc?.biome||state.track.site&&state.track.site!==site||
  state.track.mapped&&(!number(radius,1,100)||
   radius>Math.max(2,Math.floor(state.energy.flow*state.stability/20)))))
  return null;
 const originalProof=state.stage===9?
  state.achieved[9]?.originalSourceHash:
  target===6?web.originalStageFiveSourceHash:
  state.achieved[target-1]?.originalSourceHash;
 if(!originalProof)return null;
 return {target,load:route.load,radius,sourceLocation:site,
  originalProof,originalRouteSourceHash:route.originalMapSourceHash,
  existingHumanTissue:target>=7?'ordinary living fascia':null,
  environmentBiome:target===8?loc.biome:null,
  noInheritedBiologicalTrait:true,
  noPeopleOrTerritoryControlled:true};
}
function plan(p,state,x,kind){
 if(kind==='care'){
  const law=Law.maintenance({minutes:45});
  return {law,qiSpent:law.qiSpent,staminaSpent:law.staminaSpent,
   modifier:Math.floor((p.mechanicalFoundation.baselineAttributes.con-10)/2),
   dc:law.dc,minutes:45};
 }
 const law=Law.law(x.target,{kind:kind==='form'?'form':'practice',
  load:x.load,radius:x.radius,stability:state.stability,
  minutes:kind==='form'?90:60});
 return {law,qiSpent:kind==='map'?0:law.qiSpent,
  staminaSpent:kind==='map'?0:law.staminaSpent,
  modifier:Math.floor((p.mechanicalFoundation.baselineAttributes[
   law.attribute]-10)/2)+(kind==='map'?0:law.stabilityModifier),
  dc:law.dc,minutes:kind==='form'?90:60};
}
function check(s,p,modifier,dc,target,activity){
 const events=s.log.slice();
 try{return C.check(s,{modifier,dc,
  label:'Private original independent Meridian Stage '+target+' '+activity,
  privateDisplay:true,independentRngOwner:p});}
 finally{s.log.splice(0,s.log.length,...events);}
}
function source(ctx,r,details){
 const daily=Offscreen.opportunityEvidence(ctx,'meridian');
 return {origin:SESSION,system:'meridian',
  actorId:ctx.actor.actorId,
  individualOriginHash:ctx.actor.originHash,
  originalFoundationSeal:ctx.actor.mechanicalFoundation.seal,
  originalCombatEntrySeal:ctx.body.npcOrigin.seal,
  originalStageFiveWebHash:r.originalWebSourceHash,
  originalShiftHash:ctx.originalShiftHash,
  originalSceneHash:H(daily),offscreenOpportunity:daily,
  day:ctx.workDay,startMinute:ctx.workDay*1440+600,
  personalityAtAttempt:ctx.actor.personality,
  fatigueAtAttempt:ctx.actor.fatigue,
  noPlayerWitnessInferred:true,
  noFreeHumanEvolutionBloodlineOrBeastAbility:true,
  noAutomaticTechniqueOrMindControl:true,...details};
}
function compute(s,p,web,state,q,sourceHash){
 const next=action(state);
 if(!next||!number(q.target,6,9)||q.target!==state.track.target||
  q.action!==next||q.stageBefore!==state.stage||
  q.pointsBefore!==state.track.points||
  q.originalStagePriorHash!==(next==='care'?
   state.achieved[9]?.originalSourceHash:
   state.track.mapSourceHash||
   state.achieved[q.target-1]?.originalSourceHash||
   web.originalStageFiveSourceHash))
  return null;
 const x=params(p,web,state,q.offscreenOpportunity.privatePhysicalSite,s);
 if(!x||x.originalProof!==q.originalEarlierStageHash||
  x.originalRouteSourceHash!==q.originalRouteHash||
  x.existingHumanTissue!==q.existingHumanTissue||
  x.environmentBiome!==q.environmentBiome||
  x.radius!==q.radiusMetres||
  x.noInheritedBiologicalTrait!==q.noInheritedBiologicalTrait||
  x.noPeopleOrTerritoryControlled!==q.noPeopleOrTerritoryControlled)
  return null;
 const policy=plan(p,state,x,next),
  roller={rngState:q.rngBefore},
  chosen=C.die(roller,100),
  accepted=chosen<=q.choiceChance,
  originalChance=Meridian.chance({personality:q.personalityAtAttempt,
   fatigue:q.fatigueAtAttempt});
 if(q.choiceChance!==originalChance||
  q.choiceD100!==chosen||q.accepted!==accepted||
  q.actualMinutes!==(accepted?policy.minutes:5)||
  q.qiSpent!==(accepted?policy.qiSpent:0)||
  q.staminaSpent!==(accepted?policy.staminaSpent:0)||
  JSON.stringify(q.energyBefore)!==JSON.stringify(state.energy)||
  q.stabilityBefore!==state.stability||
  q.burdenBefore!==state.originalConstitutionBurden)
  return null;
 const after=structuredClone(state);
 let mapped=false,formed=false,earned=0,stabilityLost=0;
 if(accepted){
  if(state.energy.currentQi<policy.qiSpent||
   !number(q.staminaBefore,policy.staminaSpent,100000)||
   q.staminaBefore>q.maxStaminaAtAttempt||
   q.staminaAfter!==q.staminaBefore-policy.staminaSpent||
   !q.check||q.check.roll!==C.die(roller,20))
   return null;
  const margin=q.check.roll+policy.modifier+
   C.naturalAdjustment(q.check.roll)-policy.dc,
   degree=C.degree(margin),success=margin>=0;
  if(q.check.modifier!==policy.modifier||q.check.dc!==policy.dc||
   q.check.degree!==degree||q.check.success!==success)
   return null;
  after.energy.currentQi-=policy.qiSpent;
  if(next==='map'&&success){
   after.track.mapped=true;
   after.track.mapSourceHash=sourceHash;
   after.track.site=q.target===8?x.sourceLocation:null;
   if(q.target===8){
    after.track.radius=x.radius;
    after.track.environmentBiome=x.environmentBiome;
   }
   mapped=true;
  }else if(next==='practice'){
   earned=success?C.progress(degree):0;
   after.track.points=Math.min(Law.POINTS[q.target],
    after.track.points+earned);
   if(degree==='severe failure'){
    stabilityLost=policy.law.severePracticeStabilityLoss;
    after.stability=Math.max(1,after.stability-stabilityLost);
   }
  }else if(next==='care'){
   after.originalConstitutionBurden=success?
    Math.max(0,state.originalConstitutionBurden-1):
    Math.min(10,state.originalConstitutionBurden+2);
   if(degree==='severe failure'){
    stabilityLost=policy.law.severeStabilityLoss;
    after.stability=Math.max(1,after.stability-stabilityLost);
   }
  }else if(next==='form'&&success){
   const extraordinary=new Set(web.routes.flatMap(y=>y.segments)
    .filter(y=>y.kind==='extraordinary').map(y=>y.number)).size,
    profile=Gates.profile(q.target,p.originalMeridianGates.gates,{
     seaRings:1,extraordinary,webComplete:true,intentDepth:1});
   after.stage=q.target;
   after.energy.maxQi=Math.max(after.energy.maxQi,profile.qi);
   after.energy.flow=profile.flow;
   after.energy.recovery=profile.recovery;
   after.achieved[q.target]={
    originalSourceHash:sourceHash,
    originalMapSourceHash:after.track.mapSourceHash,
    originalPreviousStageHash:x.originalProof,
    originalRouteHash:x.originalRouteSourceHash,
    originalTissue:targetTissue(q.target),
    ...(q.target>=8?{physicalSite:x.sourceLocation,
     environmentalBiome:x.environmentBiome,
     radiusMetres:x.radius}:{}),
    noFreeHumanEvolutionOrUnlearnedTechnique:true};
   if(q.target===9){
    after.originalConstitutionBurden=0;
   }else{
    after.track={target:q.target+1,mapped:false,points:0,
     mapSourceHash:null,site:null};
   }
   formed=true;
  }
 }else if(q.check!==null||q.staminaBefore!==null||
  q.staminaAfter!==null||q.maxStaminaAtAttempt!==null)
  return null;
 if(q.earnedPoints!==earned||q.mapped!==mapped||
  q.formed!==formed||q.stabilityLoss!==stabilityLost||
  q.stageAfter!==after.stage||
  q.pointsAfter!==after.track.points||
  JSON.stringify(q.energyAfter)!==JSON.stringify(after.energy)||
  q.stabilityAfter!==after.stability||
  q.burdenAfter!==after.originalConstitutionBurden||
  roller.rngState!==q.rngAfter)
  return null;
 return after;
}
function targetTissue(stage){
 return stage===7?'ordinary living fascia':
  stage===9?'individual bounded metabolic adaptation':null;
}
function verify(s,p){
 const r=p?.originalMeridianAdvanced;
 if(r===undefined)return true;
 const web=p.originalMeridianWeb;
 if(!web||web.stage!==5||!Web.verify(s,p)||
  !r||r.origin!==ORIGIN||
  r.originalWebSourceHash!==web.originalStageFiveSourceHash||
  !number(r.stage,5,9)||!number(r.stability,1,100)||
  !r.energy||!r.track||!r.achieved||
  !Array.isArray(r.sessions)||r.sessions.length<1||
  r.sessions.length>500||
  r.noInheritedImmortalityOrUnlearnedTechnique!==true)
  return false;
 const current=initial(p);
 let t=current,last=-1,lastEnd=0,restIndex=0;
 for(const row of r.sessions){
  const prior=Night.replayUntil(s,p,r.rests||[],restIndex,
   row?.source?.startMinute??0,t.energy,lastEnd);
  if(!prior)return false;
  t.energy=prior.energy;restIndex=prior.index;lastEnd=prior.end;
  const q=row?.source,seal=row?.seal;
  if(!q||seal!==H(q)||q.origin!==SESSION||
   q.system!=='meridian'||q.actorId!==p.actorId||
   q.individualOriginHash!==p.originHash||
   q.originalFoundationSeal!==p.mechanicalFoundation.seal||
   q.originalCombatEntrySeal!==
    s.table?.combatants?.['npc_'+p.id]?.npcOrigin?.seal||
   q.originalStageFiveWebHash!==web.originalStageFiveSourceHash||
   !Offscreen.verifyEvidence(s,p,q)||
   !number(q.day)||q.day<=last||
   q.day<=web.sessions.at(-1)?.source.day||
   !number(q.startMinute)||q.startMinute!==q.day*1440+600||
   q.startMinute<lastEnd||
   !number(q.actualMinutes)||q.startMinute+q.actualMinutes>s.world.minutes||
   !number(q.rngBefore,1,0xffffffff)||!number(q.rngAfter,1,0xffffffff)||
   !number(q.choiceD100,1,100)||
   !['reserved','curious','steady','independent']
    .includes(q.personalityAtAttempt)||
   !number(q.fatigueAtAttempt,0,100)||
   q.noPlayerWitnessInferred!==true||
   q.noFreeHumanEvolutionBloodlineOrBeastAbility!==true||
   q.noAutomaticTechniqueOrMindControl!==true)
   return false;
  t=compute(s,p,web,t,q,seal);
  if(!t)return false;
  last=q.day;lastEnd=q.startMinute+q.actualMinutes;
 }
 const later=Night.replayUntil(s,p,r.rests||[],restIndex,
  Number.POSITIVE_INFINITY,t.energy,lastEnd);
 if(!later||later.index!==(r.rests||[]).length)return false;
 t.energy=later.energy;
 return JSON.stringify({
  stage:t.stage,track:t.track,achieved:t.achieved,energy:t.energy,
  stability:t.stability,
  originalConstitutionBurden:t.originalConstitutionBurden
 })===JSON.stringify({
  stage:r.stage,track:r.track,achieved:r.achieved,energy:r.energy,
  stability:r.stability,
  originalConstitutionBurden:r.originalConstitutionBurden
 });
}
function afterDaily(s,ctx){
 const p=ctx.actor,body=ctx.body,web=p.originalMeridianWeb;
 if(!web||web.stage!==5||body.status!=='ok'||
  body.wounds.some(x=>x>0)||body.stamina<1||
  ctx.workDay<=web.sessions.at(-1)?.source.day)return null;
 if(!verify(s,p))throw Error('Original advanced independent Meridian source no longer verifies');
 let r=p.originalMeridianAdvanced||initial(p);
 // The ORIGINAL advanced Intent/Physique/Domain/Constitution modules each
 // refuse a new high-pressure Stage while circulation stability <55.
 // Clinical maintenance after already earning Stage IX remains separately
 // permitted, but no free source-unsupported stabilization is granted.
 if(r.stage<9&&r.stability<55)return null;
 const next=action(r);
 if(!next||r.sessions.length>=500)return null;
 const target=r.track.target,
  x=params(p,web,r,ctx.site,s);
 if(!x)return null;
 const policy=plan(p,r,x,next);
 // No unrecorded decision/die when this human lacks the energy/body
 // necessary to undertake an accepted session.
 if(r.energy.currentQi<policy.qiSpent||
  body.stamina<policy.staminaSpent)return null;
 const chance=Meridian.chance(p),rngBefore=p.rngState,
  choiceD100=C.die(p,100),accepted=choiceD100<=chance,
  beforeQi=structuredClone(r.energy),stabilityBefore=r.stability,
  beforeStamina=accepted?body.stamina:null;
 let receiptCheck=null;
 if(accepted){
  const actual=check(s,p,policy.modifier,policy.dc,target,next);
  receiptCheck={roll:actual.roll,modifier:actual.modifier,
   dc:actual.dc,degree:actual.degree,success:actual.success};
 }
 const q=source(ctx,r,{
  target,action:next,stageBefore:r.stage,
  stageAfter:null,pointsBefore:r.track.points,pointsAfter:null,
  originalStagePriorHash:next==='care'?
   r.achieved[9]?.originalSourceHash:
   r.track.mapSourceHash||
   r.achieved[target-1]?.originalSourceHash||
   web.originalStageFiveSourceHash,
  originalEarlierStageHash:x.originalProof,
  originalRouteHash:x.originalRouteSourceHash,
  existingHumanTissue:x.existingHumanTissue,
  environmentBiome:x.environmentBiome,radiusMetres:x.radius,
  noInheritedBiologicalTrait:true,
  noPeopleOrTerritoryControlled:true,
  rngBefore,rngAfter:p.rngState,
  choiceD100,choiceChance:chance,accepted,
  actualMinutes:accepted?policy.minutes:5,
  check:receiptCheck,
  qiSpent:accepted?policy.qiSpent:0,
  staminaSpent:accepted?policy.staminaSpent:0,
  staminaBefore:beforeStamina,
  staminaAfter:accepted?body.stamina-policy.staminaSpent:null,
  maxStaminaAtAttempt:accepted?body.maxStamina:null,
  energyBefore:beforeQi,energyAfter:null,
  stabilityBefore,stabilityAfter:null,
  burdenBefore:r.originalConstitutionBurden,burdenAfter:null,
  earnedPoints:null,stabilityLoss:null,mapped:null,formed:null
 });
 // Fill only the mechanical fields computed from this ONE actual check,
 // without rolling again or allowing the caller to choose a Stage outcome.
 // The engine's original Core result and this source-law projection MUST
 // agree before any save record is persisted.
 const temp=structuredClone(r);
 const result=accepted?C.degree(receiptCheck.roll+policy.modifier+
  C.naturalAdjustment(receiptCheck.roll)-policy.dc):null,
  success=accepted&&receiptCheck.success;
 let earned=0,stabilityLoss=0,mapped=false,formed=false;
 if(accepted){
  temp.energy.currentQi-=policy.qiSpent;
  if(next==='map'&&success){
   mapped=true;temp.track.mapped=true;
  }else if(next==='practice'){
   earned=success?C.progress(result):0;
   temp.track.points=Math.min(Law.POINTS[target],temp.track.points+earned);
   if(result==='severe failure'){
    stabilityLoss=policy.law.severePracticeStabilityLoss;
    temp.stability=Math.max(1,temp.stability-stabilityLoss);
   }
  }else if(next==='care'){
   temp.originalConstitutionBurden=success?
    Math.max(0,r.originalConstitutionBurden-1):
    Math.min(10,r.originalConstitutionBurden+2);
   if(result==='severe failure'){
    stabilityLoss=policy.law.severeStabilityLoss;
    temp.stability=Math.max(1,temp.stability-stabilityLoss);
   }
  }else if(next==='form'&&success){
   formed=true;temp.stage=target;
   const extraordinary=new Set(web.routes.flatMap(y=>y.segments)
    .filter(y=>y.kind==='extraordinary').map(y=>y.number)).size,
    profile=Gates.profile(target,p.originalMeridianGates.gates,{
     seaRings:1,extraordinary,webComplete:true,intentDepth:1});
   temp.energy.maxQi=Math.max(temp.energy.maxQi,profile.qi);
   temp.energy.flow=profile.flow;temp.energy.recovery=profile.recovery;
   if(target===9){
    // A genuinely formed constitution starts with zero original metabolic
    // burden. The source verifier, receipt and live individual must agree.
    temp.originalConstitutionBurden=0;
   }else temp.track={target:target+1,mapped:false,
    points:0,mapSourceHash:null,site:null};
  }
 }
 q.stageAfter=temp.stage;q.pointsAfter=temp.track.points;
 q.energyAfter=structuredClone(temp.energy);
 q.stabilityAfter=temp.stability;
 q.burdenAfter=temp.originalConstitutionBurden;
 q.earnedPoints=earned;
 q.stabilityLoss=stabilityLoss;q.mapped=mapped;q.formed=formed;
 const seal=H(q),applied=compute(s,p,web,r,q,seal);
 if(!applied)throw Error('The actual original advanced Meridian check disagreed with its source owner');
 if(accepted)body.stamina-=policy.staminaSpent;
 p.originalMeridianAdvanced=applied;
 p.originalMeridianAdvanced.sessions.push({source:q,seal});
 if(!verify(s,p))
  throw Error('The original Stage VI–IX individual physical record did not replay');
 return {kind:'original-independent-meridian-stage-'+target,
  actualOriginalCheck:accepted,originalAction:next,
  formed,sourceHash:seal,noPlayerKnowledge:true};
}
module.exports={ORIGIN,SESSION,afterDaily,verify};
