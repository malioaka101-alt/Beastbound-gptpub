'use strict';
// The original Stage V Meridian Web for a genuinely Stage IV independent
// adult. Actual thresholds/resources/structure are owned by the SAME
// rules/meridian-living-anatomy.js formulas via shared original-web.js.
// Unlike a PC's scene witnessed by the GM, an independent person must
// PERSONALLY discover their own human anatomical circuit during a real,
// source-sealed offscreen life day and succeed on a genuine original check.
// Unverified medical harm halts work; there is NO fictional free clinician.
const Crypto=require('node:crypto'),C=require('../rules/core'),
 Combat=require('../rules/combat'),Build=require('../rules/build'),
 Web=require('../rules/meridian-shared-original-web'),
 Gates=require('../rules/meridian-shared-original-gates'),
 Sea=require('./independent-meridian-sea'),
 Night=require('./independent-meridian-night-qi'),
 Meridian=require('./independent-offscreen-meridian'),
 Offscreen=require('./independent-original-power-days');
const ORIGIN='source-owned-independent-existing-meridian-web-v1',
 ATTEMPT='autonomous-original-meridian-web-session-v1';
const H=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const n=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b;
const KINDS=Object.freeze(['extraordinary','major','minor']);
const loadFor=kind=>kind==='extraordinary'?4:kind==='major'?3:2;
function mapNumber(p,kind){
 return 1+parseInt(H({person:p.originHash,kind,origin:ORIGIN}).slice(0,8),16)%Web.SEGMENTS[kind];
}
function newState(p){
 const sea=p.originalMeridianSea;
 return {origin:ORIGIN,seaSourceHash:sea.attempts.at(-1).seal,
  stage:4,energy:structuredClone(sea.energy),
  stability:sea.stability,routes:[],sessions:[],
  completedAtMinute:null,originalStageFiveSourceHash:null};
}
function nextAction(r){
 if(r.stage===5)return null;
 for(const route of r.routes){
  const pending=route.injuries.find(x=>!x.healed);
  if(pending)return {type:'care',routeId:route.id,
   injuryHash:pending.sourceHash};
 }
 if(r.routes.length<3)return {type:'map',kind:KINDS[r.routes.length]};
 const route=r.routes.find(x=>x.integrity<x.required);
 if(route)return {type:'work',routeId:route.id};
 const status=Web.spanning(r.routes,r.stability);
 return status.ready?{type:'integrate',extraordinary:status.extraordinary}:null;
}
function modifier(p,stability,kind,seaPurity){
 const attrs=p.mechanicalFoundation.baselineAttributes;
 return kind==='map'?Math.floor((attrs.wis-10)/2):
  kind==='work'?Math.floor((attrs.wis-10)/2)+(seaPurity>=5?1:0):
  Math.floor((attrs.wis-10)/2)+Math.floor(stability/25)-2;
}
function check(s,p,mod,dc,kind){
 const previous=s.log.slice();
 try{return C.check(s,{modifier:mod,dc,independentRngOwner:p,
  label:'Private original independent Meridian Web '+kind,
  privateDisplay:true});}
 finally{s.log.splice(0,s.log.length,...previous);}
}
function receipt(ctx,r,values){
 const witnessed=Offscreen.opportunityEvidence(ctx,'meridian');
 return {origin:ATTEMPT,system:'meridian',
  actorId:ctx.actor.actorId,individualOriginHash:ctx.actor.originHash,
  originalFoundationSeal:ctx.actor.mechanicalFoundation.seal,
  originalCombatEntrySeal:ctx.body.npcOrigin.seal,
  originalStageFourSeaHash:r.seaSourceHash,
  originalShiftHash:ctx.originalShiftHash,
  originalSceneHash:H(witnessed),offscreenOpportunity:witnessed,
  day:ctx.workDay,startMinute:ctx.workDay*1440+600,
  personalityAtAttempt:ctx.actor.personality,
  fatigueAtAttempt:ctx.actor.fatigue,
  noOtherSystemTechniqueOrStageGranted:true,
  noAdditionalPlayerTime:true,...values};
}
// Recompute the original individual roll and exact physical transitions.
// Receipts alone, or resealing an invented anatomical route, do not grant
// integrity, stage, capacity, technique or a spontaneous human evolution.
function verify(s,p){
 const r=p?.originalMeridianWeb;
 if(r===undefined)return true;
 const sea=p.originalMeridianSea;
 if(!sea||sea.stage!==4||!Sea.verify(s,p)||
  !r||r.origin!==ORIGIN||
  r.seaSourceHash!==sea.attempts.at(-1).seal||
  ![4,5].includes(r.stage)||!n(r.stability,1,100)||
  !Array.isArray(r.routes)||r.routes.length>3||
  !Array.isArray(r.sessions)||r.sessions.length<1||
  r.sessions.length>500||
  !r.energy||!n(r.energy.currentQi)||!n(r.energy.maxQi))
  return false;
 const initial=newState(p),state=structuredClone(initial),
  gates=p.originalMeridianGates.gates,
  seaPurity=sea.sea.purity;
 let lastDay=-1,lastMinute=0,restIndex=0;
 for(const row of r.sessions){
  const prior=Night.replayUntil(s,p,r.rests||[],restIndex,
   row?.source?.startMinute??0,state.energy,lastMinute);
  if(!prior)return false;
  state.energy=prior.energy;restIndex=prior.index;lastMinute=prior.end;
  const q=row?.source;
  if(!q||row.seal!==H(q)||state.stage===5||
   q.origin!==ATTEMPT||q.system!=='meridian'||
   q.actorId!==p.actorId||q.individualOriginHash!==p.originHash||
   q.originalFoundationSeal!==p.mechanicalFoundation.seal||
   q.originalCombatEntrySeal!==
    s.table?.combatants?.['npc_'+p.id]?.npcOrigin?.seal||
   q.originalStageFourSeaHash!==initial.seaSourceHash||
   !Offscreen.verifyEvidence(s,p,q)||
   !n(q.day)||q.day<=lastDay||
   q.day<=sea.attempts.at(-1).source.day||
   !n(q.startMinute)||q.startMinute<lastMinute||
   q.startMinute!==q.day*1440+600||
   !n(q.actualMinutes)||q.startMinute+q.actualMinutes>s.world.minutes||
   !n(q.rngBefore,1,0xffffffff)||!n(q.rngAfter,1,0xffffffff)||
   !n(q.choiceD100,1,100)||
   !['reserved','curious','steady','independent']
    .includes(q.personalityAtAttempt)||
   !n(q.fatigueAtAttempt,0,100)||
   q.choiceChance!==Meridian.chance({personality:q.personalityAtAttempt,
    fatigue:q.fatigueAtAttempt})||
   q.noOtherSystemTechniqueOrStageGranted!==true||
   q.noAdditionalPlayerTime!==true||
   JSON.stringify(q.energyBefore)!==JSON.stringify(state.energy)||
   q.stabilityBefore!==state.stability||
   q.routeCountBefore!==state.routes.length)
   return false;
  if(q.actionType==='care'){
   if(q.originalMedicalSkillRank!==0||
    q.originalPressureInjuryHash===null||
    q.originalPressureInjuryHash===undefined||
    q.selfCareNotPhysicianTreatment!==true||
    q.originalCareSite!==q.offscreenOpportunity?.privatePhysicalSite||
    require('./lived-places').location(s,q.originalCareSite)?.biome!=='settlement')
    return false;
  }else if((q.originalMedicalSkillRank??null)!==null||
    (q.originalPressureInjuryHash??null)!==null||
    (q.originalCareSite??null)!==null||
    (q.selfCareNotPhysicianTreatment??null)!==null)
   return false;
  const expected=nextAction(state),
   roller={rngState:q.rngBefore},
   accepted=C.die(roller,100)<=q.choiceChance;
  if(!expected||q.actionType!==expected.type||
   q.choiceD100!==(() => {
    const f={rngState:q.rngBefore};return C.die(f,100);
   })()||q.accepted!==accepted||
   q.actualMinutes!==(accepted?120:5))
   return false;
  const body=s.table?.combatants?.['npc_'+p.id];
  let expectedCheck=null,route=null,earned=0,injury=null,
   qiSpent=0,staminaSpent=0,mapped=false,completed=false,
   healed=false,recovered=0;
  if(accepted){
   let dc,mod,load=0;
   if(expected.type==='map'){
    load=loadFor(expected.kind);
    dc=13+load;mod=modifier(p,state.stability,'map',seaPurity);
   }else if(expected.type==='care'){
    route=state.routes.find(x=>x.id===expected.routeId);
    const pending=route?.injuries.find(x=>!x.healed);
    if(!pending||q.originalPressureInjuryHash!==pending.sourceHash||
     pending.sourceHash!==expected.injuryHash)return false;
    const plan=Web.care({load:route.load,stabilityLoss:pending.loss,
     minutes:120,medicineRank:0});
    dc=plan.dc;staminaSpent=plan.staminaSpent;
    mod=Math.floor((p.mechanicalFoundation.baselineAttributes.wis-10)/2);
   }else if(expected.type==='work'){
    route=state.routes.find(x=>x.id===expected.routeId);
    const flawed=route.gates.filter(i=>gates[i-1].quality==='Flawed').length;
    const plan=Web.pressure({load:route.load,segments:route.segments.length,
     flawed,seaPurity,minutes:120});
    dc=plan.dc;qiSpent=plan.qiSpent;staminaSpent=plan.staminaSpent;
    mod=modifier(p,state.stability,'work',seaPurity);
   }else{
    const plan=Web.integration({routes:state.routes.length,
     extraordinary:expected.extraordinary,stability:state.stability,
     minutes:120});
    dc=plan.dc;qiSpent=plan.qiSpent;staminaSpent=plan.staminaSpent;
    mod=modifier(p,state.stability,'integrate',seaPurity);
   }
   if(!q.check||q.check.roll!==C.die(roller,20)||
    !n(q.staminaBefore,staminaSpent)||
    q.staminaAfter!==q.staminaBefore-staminaSpent||
    q.maxStaminaAtAttempt<q.staminaBefore||
    state.energy.currentQi<qiSpent)return false;
   const margin=q.check.roll+mod+
    C.naturalAdjustment(q.check.roll)-dc,
    degree=C.degree(margin),success=margin>=0;
   expectedCheck={roll:q.check.roll,modifier:mod,dc,degree,success};
   if(expected.type==='care'){
    const pending=route.injuries.find(x=>!x.healed);
    if(success){
     pending.healed=true;healed=true;
     recovered=Web.care({load:route.load,stabilityLoss:pending.loss,
      minutes:120,medicineRank:0}).stabilityRecoveredOnSuccess;
     state.stability=Math.min(100,state.stability+recovered);
    }
   }else if(expected.type==='map'&&success){
    const kind=expected.kind,number=mapNumber(p,kind);
    route={id:'route_'+kind,load,kind,segments:[{kind,number}],
     gates:[1],required:Web.required(1,load),integrity:0,
     injuries:[],originalMapSourceHash:row.seal};
    state.routes.push(route);mapped=true;
   }else if(expected.type==='work'){
    earned=success?C.progress(degree):0;
    route.integrity=Math.min(route.required,route.integrity+earned);
    if(degree==='severe failure'){
     const loss=1+Math.ceil(route.load/3);
     state.stability=Math.max(1,state.stability-loss);
     injury={sourceHash:row.seal,loss,healed:false};
     route.injuries.push(injury);
    }
   }else if(expected.type==='integrate'&&success){
    const counts=Gates.verifiedGates(gates),
     target=Gates.profile(5,gates,{seaRings:1,
      extraordinary:expected.extraordinary,webComplete:true});
    state.stage=5;state.completedAtMinute=q.startMinute;
    state.originalStageFiveSourceHash=row.seal;completed=true;
    state.energy.maxQi=Math.max(state.energy.maxQi,target.qi);
    state.energy.flow=target.flow;
    state.energy.recovery=target.recovery;
    if(!n(counts.Perfect,0,108))return false;
   }
   state.energy.currentQi-=qiSpent;
  }else if(q.check!==null||q.qiSpent!==0||q.staminaSpent!==0||
   q.staminaBefore!==null||q.staminaAfter!==null||
   q.maxStaminaAtAttempt!==null)return false;
  if(q.routeId!==(['work','care'].includes(expected.type)?expected.routeId:
   expected.type==='map'?'route_'+expected.kind:null)||
   q.routeKind!==(expected.type==='map'?expected.kind:
    ['work','care'].includes(expected.type)&&accepted?route.kind:null)||
   (q.originalPressureInjuryHash??null)!==(expected.type==='care'?
    expected.injuryHash:null)||
   (q.careSucceeded??null)!==(expected.type==='care'?healed:null)||
   (q.careStabilityRecovered??null)!==(expected.type==='care'?recovered:null)||
   q.qiSpent!==qiSpent||q.staminaSpent!==staminaSpent||
   JSON.stringify(q.check)!==JSON.stringify(expectedCheck)||
   q.pointsEarned!==earned||
   q.mapped!==mapped||q.formed!==completed||
   q.pressureInjury!==!!injury||
   q.stageAfter!==state.stage||
   q.stabilityAfter!==state.stability||
   q.routeCountAfter!==state.routes.length||
   JSON.stringify(q.energyAfter)!==JSON.stringify(state.energy)||
   roller.rngState!==q.rngAfter)
   return false;
  lastDay=q.day;lastMinute=q.startMinute+q.actualMinutes;
 }
 const later=Night.replayUntil(s,p,r.rests||[],restIndex,
  Number.POSITIVE_INFINITY,state.energy,lastMinute);
 if(!later||later.index!==(r.rests||[]).length)return false;
 state.energy=later.energy;
 return r.stage===state.stage&&r.stability===state.stability&&
  JSON.stringify(r.energy)===JSON.stringify(state.energy)&&
  JSON.stringify(r.routes)===JSON.stringify(state.routes)&&
  r.completedAtMinute===state.completedAtMinute&&
  r.originalStageFiveSourceHash===state.originalStageFiveSourceHash;
}
function afterDaily(s,ctx){
 const p=ctx.actor,body=ctx.body,sea=p.originalMeridianSea;
 if(!sea||sea.stage!==4||
  body.status!=='ok'||body.stamina<1||
  body.wounds.some(x=>x>0)||
  ctx.workDay<=sea.attempts.at(-1).source.day)return null;
 // When Stage V exists, Web.verify ALREADY fully verifies the Stage IV
 // Sea and all 108 prior Gates. Before Stage V exists, verify Sea once.
 // Both paths retain complete original source replay and tamper detection.
 const valid=p.originalMeridianWeb===undefined?
  Sea.verify(s,p):verify(s,p);
 if(!valid)throw Error('Original Stage IV/Stage V individual evidence cannot be replayed');
 let r=p.originalMeridianWeb||newState(p);
 if(r.stage===5)
  return require('./independent-meridian-advanced').afterDaily(s,ctx);
 const next=nextAction(r);
 if(!next||r.sessions.length>=500)return null;
 // An ordinary source-evidenced independent settlement practice day is
 // necessary for personally chosen, untrained pressure self-care. Never
 // infer consent from an absent professional or a player's scene.
 if(next.type==='care'&&ctx.loc?.biome!=='settlement')return null;
 // A person who lacks real Qi or physical Stamina cannot silently draw
 // an unreplayable private acceptance roll. Check source costs first.
 if(next.type!=='map'){
  const cost=next.type==='care'?Web.care({
   load:r.routes.find(x=>x.id===next.routeId).load,
   stabilityLoss:r.routes.find(x=>x.id===next.routeId).injuries.
    find(x=>!x.healed).loss,minutes:120,medicineRank:0
  }):next.type==='work'?(()=>{
   const route=r.routes.find(x=>x.id===next.routeId);
   const flawed=route.gates.filter(i=>
    p.originalMeridianGates.gates[i-1].quality==='Flawed').length;
   return Web.pressure({load:route.load,segments:route.segments.length,
    flawed,seaPurity:sea.sea.purity,minutes:120});
  })():Web.integration({routes:r.routes.length,
   extraordinary:next.extraordinary,stability:r.stability,minutes:120});
  if(r.energy.currentQi<cost.qiSpent||body.stamina<cost.staminaSpent)
   return null;
 }
 const chance=Meridian.chance(p),rngBefore=p.rngState,
  choiceD100=C.die(p,100),accepted=choiceD100<=chance,
  qiBefore=structuredClone(r.energy),stabilityBefore=r.stability,
  routesBefore=r.routes.length,
  staminaBefore=accepted?body.stamina:null,seaPurity=sea.sea.purity;
 let checkRecord=null,route=null,earned=0,injury=false,
  mapped=false,formed=false,qiSpent=0,staminaSpent=0,
  healed=false,recovered=0,
  routeId=['work','care'].includes(next.type)?next.routeId:
   next.type==='map'?'route_'+next.kind:null,
  routeKind=next.type==='map'?next.kind:null;
 if(accepted){
  let dc,mod;
  if(next.type==='map'){
   dc=13+loadFor(next.kind);
   mod=modifier(p,r.stability,'map',seaPurity);
  }else if(next.type==='care'){
   route=r.routes.find(x=>x.id===next.routeId);
   routeKind=route.kind;
   const pending=route.injuries.find(x=>!x.healed),
    plan=Web.care({load:route.load,stabilityLoss:pending.loss,
     minutes:120,medicineRank:0});
   dc=plan.dc;staminaSpent=plan.staminaSpent;
   mod=Math.floor((p.mechanicalFoundation.baselineAttributes.wis-10)/2);
  }else if(next.type==='work'){
   route=r.routes.find(x=>x.id===next.routeId);
   routeKind=route.kind;
   const flawed=route.gates.filter(i=>
    p.originalMeridianGates.gates[i-1].quality==='Flawed').length,
    plan=Web.pressure({load:route.load,segments:route.segments.length,
     flawed,seaPurity,minutes:120});
   dc=plan.dc;mod=modifier(p,r.stability,'work',seaPurity);
   qiSpent=plan.qiSpent;staminaSpent=plan.staminaSpent;
  }else{
   const plan=Web.integration({routes:r.routes.length,
    extraordinary:next.extraordinary,stability:r.stability,minutes:120});
   dc=plan.dc;mod=modifier(p,r.stability,'integrate',seaPurity);
   qiSpent=plan.qiSpent;staminaSpent=plan.staminaSpent;
  }
  r.energy.currentQi-=qiSpent;body.stamina-=staminaSpent;
  const result=check(s,p,mod,dc,next.type);
  checkRecord={roll:result.roll,modifier:result.modifier,
   dc:result.dc,degree:result.degree,success:result.success};
  if(next.type==='care'){
   const pending=route.injuries.find(x=>!x.healed);
   if(result.success){
    pending.healed=true;healed=true;
    recovered=Web.care({load:route.load,stabilityLoss:pending.loss,
     minutes:120,medicineRank:0}).stabilityRecoveredOnSuccess;
    r.stability=Math.min(100,r.stability+recovered);
   }
  }else if(next.type==='map'&&result.success){
   const kind=next.kind,number=mapNumber(p,kind),load=loadFor(kind);
   route={id:'route_'+kind,load,kind,segments:[{kind,number}],
    gates:[1],required:Web.required(1,load),integrity:0,
    injuries:[],originalMapSourceHash:null};
   r.routes.push(route);mapped=true;
  }else if(next.type==='work'){
   earned=result.success?C.progress(result.degree):0;
   route.integrity=Math.min(route.required,route.integrity+earned);
   if(result.degree==='severe failure'){
    const loss=1+Math.ceil(route.load/3);
    r.stability=Math.max(1,r.stability-loss);
    route.injuries.push({sourceHash:null,loss,healed:false});
    injury=true;
   }
  }else if(next.type==='integrate'&&result.success){
   const target=Gates.profile(5,p.originalMeridianGates.gates,{
    seaRings:1,extraordinary:next.extraordinary,webComplete:true});
   r.stage=5;r.completedAtMinute=ctx.workDay*1440+600;
   r.energy.maxQi=Math.max(r.energy.maxQi,target.qi);
   r.energy.flow=target.flow;r.energy.recovery=target.recovery;
   formed=true;
  }
 }
 const q=receipt(ctx,r,{
  rngBefore,rngAfter:p.rngState,
  choiceD100,choiceChance:chance,accepted,
  actionType:next.type,routeId,routeKind,
  originalPressureInjuryHash:next.type==='care'?next.injuryHash:null,
  originalMedicalSkillRank:next.type==='care'?0:null,
  originalCareSite:next.type==='care'?ctx.site:null,
  selfCareNotPhysicianTreatment:next.type==='care'?true:null,
  careSucceeded:next.type==='care'?healed:null,
  careStabilityRecovered:next.type==='care'?recovered:null,
  actualMinutes:accepted?120:5,
  staminaBefore,staminaAfter:accepted?body.stamina:null,
  maxStaminaAtAttempt:accepted?body.maxStamina:null,
  qiSpent,staminaSpent,check:checkRecord,
  pointsEarned:earned,pressureInjury:injury,
  mapped,formed,stageAfter:r.stage,
  stabilityBefore,stabilityAfter:r.stability,
  routeCountBefore:routesBefore,routeCountAfter:r.routes.length,
  energyBefore:qiBefore,energyAfter:structuredClone(r.energy)});
 const seal=H(q);
 if(mapped)r.routes.at(-1).originalMapSourceHash=seal;
 if(injury)route.injuries.at(-1).sourceHash=seal;
 if(formed)r.originalStageFiveSourceHash=seal;
 r.sessions.push({source:q,seal});
 p.originalMeridianWeb=r;
 if(!verify(s,p))
  throw Error('Independent original Stage V living web failed physiological source replay');
 return {kind:'original-independent-meridian-web',system:'meridian',
  accepted,originalActionType:next.type,formed,
  ...(next.type==='care'?{originalSelfCareSucceeded:healed}:{}),
  privateOriginalEvidenceHash:seal,playerKnowledgeNotGranted:true};
}
module.exports={ORIGIN,ATTEMPT,afterDaily,verify};
