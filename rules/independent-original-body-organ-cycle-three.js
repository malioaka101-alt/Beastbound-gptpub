'use strict';
// #177: Source-earned ORIGINAL Body Cycle III Organ Integration after a
// genuinely replayed independent Cycle II Bone-Marrow breakthrough.
// Four separate heart/lungs/liver/kidneys tissue axes, a real integrated
// method, one Core check from the person's own saved RNG and actual Combat
// Stamina/wounds. No generic XP, automatic attack, Qi, Mana or human form.
const Crypto=require('node:crypto'),Core=require('./core'),
 Combat=require('./combat'),
 Early=require('./independent-original-discipline-preparation'),
 Second=require('./independent-original-body-cycle-two'),
 Law=require('./body-shared-original-organ-cycle-three');
const ORIGIN='source-earned-independent-original-body-organ-cycle-three-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function previous(p){
 const r=p?.originalBodyCycleTwo;
 return r?.completed===true&&
  /^[a-f0-9]{64}$/.test(r.originalCycleTwoSourceHash||'')?
  r.originalCycleTwoSourceHash:null;
}
function focusFor(p,organs,integrated){
 // These are only individual preferences between original viable methods,
 // never a GM chosen outcome or a compulsory organ training order.
 const profile={
  curious:['integrated','heart','lungs','liver','kidneys'],
  steady:['integrated','lungs','heart','kidneys','liver'],
  independent:['heart','integrated','lungs','liver','kidneys'],
  reserved:['kidneys','integrated','heart','lungs','liver']
 }[p.personality];
 if(!profile)throw Error('Original individual organ preference requires actual personality');
 if(!integrated&&profile[0]==='integrated')return 'integrated';
 if(!integrated&&organs[profile[0]]<1)return profile[0];
 if(!integrated)return 'integrated';
 return profile.find(k=>k==='integrated'||
  organs[k]<Law.REQUIRED_PER_ORGAN)||'integrated';
}
function verify(s,p){
 const r=p?.originalBodyOrganCycleThree;
 if(r===undefined)return true;
 if(!previous(p)||!Second.verify(s,p)||!Early.verify(s,p)||
  !r||r.origin!==ORIGIN||
  r.originalCycleTwoSourceHash!==previous(p)||
  !Array.isArray(r.sessions)||r.sessions.length<1||r.sessions.length>480||
  !Number.isInteger(r.lastAttemptDay)||r.lastAttemptDay<0||
  !r.organs||!Law.ORGANS.every(k=>Number.isInteger(r.organs[k])&&
   r.organs[k]>=0&&r.organs[k]<=Law.REQUIRED_PER_ORGAN))
  return false;
 const body=s.table?.combatants?.['npc_'+p.id],
  Offscreen=require('../world/independent-original-power-days');
 if(!body?.npcOrigin?.seal)return false;
 let organs=Law.empty(),integrated=false,completed=false,
  completionSeal=null,lastDay=-1,previousEnd=0;
 for(const row of r.sessions){
  const q=row?.source;
  if(!q||row.seal!==hash(q)||completed||
   q.origin!==ORIGIN||q.actorId!==p.actorId||q.system!=='body'||
   q.target!=='cycle3-integrated-organs'||
   q.individualOriginHash!==p.originHash||
   q.originalFoundationSeal!==p.mechanicalFoundation.seal||
   q.originalCombatEntrySeal!==body.npcOrigin.seal||
   q.originalCycleTwoSourceHash!==r.originalCycleTwoSourceHash||
   q.noExtraTimeTechniqueOrOtherDiscipline!==true||
   !Number.isInteger(q.day)||q.day<=lastDay||
   q.startMinute!==q.day*1440+600||
   q.startMinute<previousEnd||
   q.startMinute+q.actualMinutes>s.world.minutes||
   !Offscreen.verifyEvidence(s,p,q)||
   q.choiceChance!==Early.chance({
    personality:q.personalityAtDecision,
    fatigue:q.fatigueAtDecision})||
   q.personalityAtDecision!==p.personality||
   !Number.isInteger(q.rngBefore)||q.rngBefore<1||
   q.integratedBefore!==integrated||
   JSON.stringify(q.organsBefore)!==JSON.stringify(organs)||
   !Number.isInteger(q.staminaBefore)||q.staminaBefore<1||
   !Number.isInteger(q.maxStaminaBefore)||
   q.maxStaminaBefore<q.staminaBefore||
   !Number.isInteger(q.toughnessBefore)||q.toughnessBefore<0||
   !Number.isInteger(q.criticalBoxBefore)||q.criticalBoxBefore<1||
   JSON.stringify(q.woundsBefore)!=='[0,0,0]'||
   !Array.isArray(q.woundsAfter)||q.woundsAfter.length!==3)
   return false;
  const roller={rngState:q.rngBefore};
  if(q.choiceD100!==Core.die(roller,100)||
   q.accepted!==(q.choiceD100<=q.choiceChance)||
   q.focus!==(q.accepted?focusFor(p,organs,integrated):null))
   return false;
  let injury=false,gain=0,staminaSpent=0,staminaAdded=0;
  if(!q.accepted){
   if(q.actualMinutes!==5||q.check!==null||
    q.earned!==0||q.staminaSpent!==0||
    q.originalPhysicalBacklash!==false)return false;
  }else{
   const dc=Law.DC,
    mod=Math.floor((p.mechanicalFoundation.baselineAttributes.con-10)/2),
    roll=Core.die(roller,20),
    margin=roll+mod+Core.naturalAdjustment(roll)-dc,
    degree=Core.degree(margin),success=margin>=0,
    grown=Law.grow(organs,integrated,q.focus,degree);
   injury=degree==='severe failure';
   gain=grown.earned;staminaSpent=Law.staminaCost(120);
   if(q.actualMinutes!==120||q.staminaBefore<staminaSpent||
    !q.check||q.check.roll!==roll||q.check.modifier!==mod||
    q.check.dc!==dc||q.check.margin!==margin||
    q.check.degree!==degree||q.check.success!==success||
    q.earned!==gain||q.staminaSpent!==staminaSpent||
    q.originalPhysicalBacklash!==injury)return false;
   organs=grown.organs;integrated=grown.integrated;
   if(Law.formed(organs,integrated)){
    completed=true;completionSeal=row.seal;
    staminaAdded=Law.STAMINA_GAIN;
   }
  }
  if(JSON.stringify(q.woundsAfter)!==JSON.stringify(injury?[1,0,0]:[0,0,0])||
   q.staminaAfter!==q.staminaBefore-staminaSpent+staminaAdded||
   q.maxStaminaAfter!==q.maxStaminaBefore+staminaAdded||
   q.toughnessAfter!==q.toughnessBefore+
    (completed?Law.TOUGHNESS_GAIN:0)||
   q.criticalBoxAfter!==q.criticalBoxBefore+
    (completed?Law.CRITICAL_BOX_GAIN:0)||
   JSON.stringify(q.organsAfter)!==JSON.stringify(organs)||
   q.integratedAfter!==integrated||
   q.completedAfter!==completed||
   q.rngAfter!==roller.rngState)return false;
  lastDay=q.day;previousEnd=q.startMinute+q.actualMinutes;
 }
 return r.lastAttemptDay===lastDay&&
  JSON.stringify(r.organs)===JSON.stringify(organs)&&
  r.integrated===integrated&&r.completed===completed&&
  r.originalCycleThreeSourceHash===completionSeal;
}
function ensureLedger(s,p){
 const prior=previous(p);
 if(!prior||!Early.verify(s,p)||!Second.verify(s,p))
  throw Error('Only originally earned source-verified Bone-Marrow Cycle II unlocks Organ Cycle III');
 if(p.originalBodyOrganCycleThree!==undefined){
  if(!verify(s,p))throw Error('Existing NPC Organ Cycle III source failed replay');
  return p.originalBodyOrganCycleThree;
 }
 p.originalBodyOrganCycleThree={origin:ORIGIN,
  originalCycleTwoSourceHash:prior,sessions:[],
  organs:Law.empty(),integrated:false,completed:false,
  lastAttemptDay:-1,originalCycleThreeSourceHash:null};
 return p.originalBodyOrganCycleThree;
}
function privateStatus(s,p){
 if(!Second.verify(s,p)||!Early.verify(s,p)||!verify(s,p))
  throw Error('Original individual Organ Cycle III physical evidence was altered');
 const r=p.originalBodyOrganCycleThree;
 return {privateToGM:true,
  originalSourceOwner:'rules/disciplines.js:organWork',
  verifiedOriginalBodyCycles:r?.completed?
   ['Muscle-Tendon Cycle','Bone-Marrow Cycle','Organ Cycle']:
   ['Muscle-Tendon Cycle','Bone-Marrow Cycle'],
  organIntegration:r?{...r.organs}:null,
  personallyIntegrated:r?.integrated||false,
  earnedOrganCycle:r?.completed||false,
  sourceVerifiedStaminaCapacityGain:r?.completed?Law.STAMINA_GAIN:0,
  sourceVerifiedToughnessGain:r?.completed?Law.TOUGHNESS_GAIN:0,
  sourceVerifiedCriticalWoundBoxGain:r?.completed?Law.CRITICAL_BOX_GAIN:0,
  noAutomaticQiManaOrLearnedTechnique:true};
}
function safeCheck(s,args){
 const earlier=s.log.slice();
 try{return Core.check(s,{...args,privateDisplay:true});}
 finally{s.log.splice(0,s.log.length,...earlier);}
}
function afterDaily(s,ctx){
 const p=ctx.actor,body=ctx.body;
 if(!previous(p)||!Early.verify(s,p)||!Second.verify(s,p)||
  !verify(s,p)||p.originalBodyOrganCycleThree?.completed||
  body.status!=='ok'||body.wounds.some(x=>x!==0)||
  body.stamina<Law.staminaCost(120))
  return null;
 const r=ensureLedger(s,p);
 if(r.sessions.length>=480||r.lastAttemptDay>=ctx.workDay||
  Object.values(p.originalEarlyDisciplinePreparation||{}).
   some(x=>x.lastAttemptDay>=ctx.workDay)||
  p.meridianTraining?.lastAttemptDay>=ctx.workDay)return null;
 const initialRng=p.rngState,choiceChance=Early.chance(p),
  choice=Core.die(p,100),accepted=choice<=choiceChance,
  focus=focusFor(p,r.organs,r.integrated),
  priorOrgans={...r.organs},priorIntegrated=r.integrated,
  staminaBefore=body.stamina,maxStaminaBefore=body.maxStamina,
  toughnessBefore=body.toughness,criticalBoxBefore=body.boxes[2],
  originalWounds=[...body.wounds];
 let check=null,gain=0,backlash=false,spent=0;
 if(accepted){
  const mod=Math.floor((p.mechanicalFoundation.baselineAttributes.con-10)/2),
   result=safeCheck(s,{modifier:mod,dc:Law.DC,
    label:'Original independent Cycle III integrated organ physiology',
    independentRngOwner:p}),
   grown=Law.grow(r.organs,r.integrated,focus,result.degree);
  check={roll:result.roll,modifier:result.modifier,dc:result.dc,
   margin:result.margin,degree:result.degree,success:result.success};
  gain=grown.earned;r.organs=grown.organs;r.integrated=grown.integrated;
  spent=Law.staminaCost(120);body.stamina-=spent;
  backlash=result.degree==='severe failure';
  if(backlash)Combat.harm(s,body,2);
  if(Law.formed(r.organs,r.integrated)){
   r.completed=true;
   body.stamina+=Law.STAMINA_GAIN;
   body.maxStamina+=Law.STAMINA_GAIN;
   body.toughness+=Law.TOUGHNESS_GAIN;
   body.boxes[2]+=Law.CRITICAL_BOX_GAIN;
  }
 }
 const Offscreen=require('../world/independent-original-power-days');
 const witness=Offscreen.opportunityEvidence(ctx,'body'),
  source={origin:ORIGIN,actorId:p.actorId,system:'body',
   target:'cycle3-integrated-organs',
   individualOriginHash:p.originHash,
   originalFoundationSeal:p.mechanicalFoundation.seal,
   originalCombatEntrySeal:body.npcOrigin.seal,
   originalCycleTwoSourceHash:r.originalCycleTwoSourceHash,
   originalShiftHash:ctx.originalShiftHash,
   originalSceneHash:hash(witness),offscreenOpportunity:witness,
   day:ctx.workDay,startMinute:ctx.workDay*1440+600,
   actualMinutes:accepted?120:5,
   rngBefore:initialRng,rngAfter:p.rngState,
   personalityAtDecision:p.personality,fatigueAtDecision:p.fatigue,
   choiceChance,choiceD100:choice,accepted,
   focus:accepted?focus:null,check,earned:gain,
   organsBefore:priorOrgans,organsAfter:{...r.organs},
   integratedBefore:priorIntegrated,integratedAfter:r.integrated,
   staminaBefore,staminaSpent:spent,staminaAfter:body.stamina,
   maxStaminaBefore,maxStaminaAfter:body.maxStamina,
   toughnessBefore,toughnessAfter:body.toughness,
   criticalBoxBefore,criticalBoxAfter:body.boxes[2],
   woundsBefore:originalWounds,woundsAfter:[...body.wounds],
   originalPhysicalBacklash:backlash,completedAfter:r.completed,
   noExtraTimeTechniqueOrOtherDiscipline:true};
 const seal=hash(source);
 r.sessions.push({source,seal});
 if(r.completed)r.originalCycleThreeSourceHash=seal;
 r.lastAttemptDay=ctx.workDay;
 if(!verify(s,p))throw Error('Original independent Organ Cycle III failed source replay');
 return {kind:'original-body-organ-cycle-three',accepted,
  originalIntegratedOrganProgress:gain,
  personallyAdaptedOrgans:{...r.organs},
  completed:r.completed,realBodyStaminaSpent:spent,
  physicalBacklash:backlash,sourceHash:seal,
  noFreeOtherDisciplineTechniqueOrSpeciesTrait:true,privateToGM:true};
}
module.exports={ORIGIN,verify,ensureLedger,focusFor,privateStatus,afterDaily};
