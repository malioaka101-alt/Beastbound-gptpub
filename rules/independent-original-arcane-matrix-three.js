'use strict';
// #177: original player Third Circle resonant matrix, genuinely attempted by
// independently living humans after their REAL source-verified Second Circle.
// Distinct source stages; no gifted spell, mentor, school clearance or PC time.
const Crypto=require('node:crypto'),Core=require('./core'),
 Combat=require('./combat'),Build=require('./build'),
 Early=require('./independent-original-discipline-preparation'),
 Second=require('./independent-original-arcane-circle-two'),
 Law=require('./arcane-shared-original-matrix');
const ORIGIN='source-earned-independent-original-arcane-matrix-three-v1';
const RECOVERY='source-earned-independent-original-matrix-rested-mana-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const FOCI=Object.freeze({curious:'formula-feedback',steady:'integrated',
 independent:'cross-coupling',reserved:'resonance'});
const RESTORED_MANA_PER_ORIGINAL_NIGHT=12;
const finalSecondReceipt=p=>p.originalArcaneCircleTwo?.sessions.find(x=>
 x.source?.origin===Second.ORIGIN&&x.source?.stageAfter===2);
const design=p=>{
 const second=finalSecondReceipt(p);
 return 'Three Circle resonant matrix integrating '+p.originalArcaneCore.geometry+
  ' and '+second.source.originalDesign+' with '+FOCI[p.personality]+
  ' feedback across three earned channels';
};
function verify(s,p){
 const r=p?.originalArcaneMatrix;
 if(r===undefined)return true;
 if(!Second.verify(s,p)||!Early.verify(s,p)||
  !p.originalArcaneCircleTwo?.completed||!r||r.origin!==ORIGIN||
  !Array.isArray(r.sessions)||r.sessions.length<1||r.sessions.length>480)
  return false;
 const secondProof=finalSecondReceipt(p),body=s.table?.combatants?.['npc_'+p.id];
 if(!secondProof||!body?.npcOrigin?.seal||
  r.originalSecondCircleSourceHash!==secondProof.seal)return false;
 // The handoff is after all genuine Second Circle activity, including
 // a later paid/verified Mana restoration. Never spend a night twice.
 const lastSecond=p.originalArcaneCircleTwo.sessions.at(-1)?.source;
 if(!lastSecond)return false;
 const inheritedEnd=lastSecond.endMinute??(lastSecond.startMinute+lastSecond.actualMinutes);
 if(!Number.isInteger(inheritedEnd))return false;
 let mana=p.originalArcaneCircleTwo.manaRemaining,
  stability=p.originalArcaneCircleTwo.coreStability,
  points=0,completed=false,matrixIntegrity=null,priorDay=-1,
  previousEnd=inheritedEnd,attempts=0;
 const nights=new Set(p.originalArcaneCircleTwo.sessions.filter(x=>
  x.source.origin===Second.RECOVERY).map(x=>x.source.originalNightSourceHash)),
  Offscreen=require('../world/independent-original-power-days');
 for(const row of r.sessions){
  const q=row?.source;
  const External=require('./independent-arcane-external-mana');
  if(q?.origin===External.ORIGIN){
   const stage=completed?3:2,capacity=Build.arcaneProfile(stage).mana;
   if(!External.validRow(s,p,row,'matrix',stage,mana,capacity,previousEnd))return false;
   mana=q.manaAfter;previousEnd=q.endMinute;continue;
  }
  if(q?.origin===RECOVERY){
   const night=q.originalNight,capacity=Build.arcaneProfile(completed?3:2).mana;
   if(row.seal!==hash(q)||!night||q.actorId!==p.actorId||
    q.system!=='arcane'||q.originalSecondCircleSourceHash!==secondProof.seal||
    nights.has(night.seal)||q.originalNightSourceHash!==night.seal||
    q.endMinute!==night.source?.endMinute||q.endMinute<=previousEnd||
    q.endMinute>s.world.minutes||
    !Offscreen.verifyNights(s,p,[night])||
    q.manaBefore!==mana||q.manaCapacity!==capacity||
    q.manaAfter!==Math.min(capacity,mana+RESTORED_MANA_PER_ORIGINAL_NIGHT)||
    q.noExtraPlayerTimeOrSpells!==true)return false;
   nights.add(night.seal);mana=q.manaAfter;previousEnd=q.endMinute;
   continue;
  }
  if(!q||row.seal!==hash(q)||completed||q.origin!==ORIGIN||
   q.system!=='arcane'||q.target!=='circle3'||
   q.actorId!==p.actorId||q.individualOriginHash!==p.originHash||
   q.originalFoundationSeal!==p.mechanicalFoundation?.seal||
   q.originalCombatEntrySeal!==body.npcOrigin.seal||
   q.originalSecondCircleSourceHash!==secondProof.seal||
   q.originalMatrixDesign!==design(p)||q.focus!==FOCI[p.personality]||
   q.noSpellOrTechniqueGranted!==true||
   !Number.isInteger(q.day)||q.day<=priorDay||
   q.startMinute!==q.day*1440+600||q.startMinute<previousEnd||
   q.startMinute+q.actualMinutes>s.world.minutes||
   !Offscreen.verifyEvidence(s,p,q)||
   q.manaBefore!==mana||q.staminaSpent!==(q.accepted?2:0)||
   q.coreStabilityBefore!==stability||
   q.integrityBefore!==points||q.stageBefore!==2||
   !Number.isInteger(q.rngBefore)||q.rngBefore<1||
   !['curious','steady','reserved','independent'].includes(q.personalityAtDecision)||
   !Number.isInteger(q.fatigueAtDecision)||
   q.fatigueAtDecision<0||q.fatigueAtDecision>100||
   q.choiceChance!==Early.chance({personality:q.personalityAtDecision,
    fatigue:q.fatigueAtDecision}))
   return false;
  const roller={rngState:q.rngBefore};
  if(q.choiceD100!==Core.die(roller,100)||
   q.accepted!==(q.choiceD100<=q.choiceChance))
   return false;
  if(!q.accepted){
   if(q.actualMinutes!==5||q.check!==null||q.manaSpent!==0||
    q.staminaBefore!==null||q.staminaAfter!==null||
    q.woundsBefore!==null||q.woundsAfter!==null||
    q.originalPhysicalBacklash!==false||
    q.earnedMatrixIntegrity!==0)return false;
  }else{
   if(q.actualMinutes!==180||mana<Law.MANA_COST||
    q.manaSpent!==Law.MANA_COST||
    !Number.isInteger(q.staminaBefore)||q.staminaBefore<2||
    q.staminaAfter!==q.staminaBefore-Law.staminaCost(180)||
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
    q.earnedMatrixIntegrity!==earned||
    q.originalPhysicalBacklash!==severe||
    JSON.stringify(q.woundsAfter)!==JSON.stringify(severe?[1,0,0]:[0,0,0]))
    return false;
   mana-=Law.MANA_COST;attempts++;
   stability=Law.stabilityAfter(stability,actual);
   points=Math.min(Law.REQUIRED,points+earned);
   if(points===Law.REQUIRED){
    completed=true;
    matrixIntegrity=Law.integrity(margin,attempts,stability);
   }
  }
  if(q.manaAfter!==mana||q.coreStabilityAfter!==stability||
   q.integrityAfter!==points||q.stageAfter!==(completed?3:2)||
   q.matrixIntegrityAfter!==matrixIntegrity||
   q.rngAfter!==roller.rngState)return false;
  previousEnd=q.startMinute+q.actualMinutes;priorDay=q.day;
 }
 return r.progress===points&&r.manaRemaining===mana&&
  r.coreStability===stability&&r.completed===completed&&
  r.matrixIntegrity===matrixIntegrity&&r.lastAttemptDay===priorDay;
}
function privateStatus(s,p){
 if(!Second.verify(s,p)||!verify(s,p))
  throw Error('Independent Third Circle matrix source was altered');
 const r=p.originalArcaneMatrix;
 return {privateToGM:true,originalOwner:'rules/disciplines.js:matrixWork',
  verifiedArcaneCircle:r?.completed?3:2,
  originalMatrixProgress:r?.progress||0,originalMatrixIntegrity:r?.matrixIntegrity??null,
  currentMana:r?.manaRemaining??null,coreStability:r?.coreStability??null,
  sourceVerifiedThirdCircle:r?.completed===true,automaticSpellGranted:false};
}
function afterDaily(s,ctx){
 const p=ctx.actor,body=ctx.body,second=p.originalArcaneCircleTwo;
 if(!second?.completed||p.originalArcaneMatrix?.completed||
  !Second.verify(s,p)||!verify(s,p)||
  body.status!=='ok'||body.wounds.some(x=>x!==0))
  return null;
 const prior=p.originalArcaneMatrix;
 if(second.lastAttemptDay>=ctx.workDay||prior?.lastAttemptDay>=ctx.workDay||
  Object.values(p.originalEarlyDisciplinePreparation||{}).
   some(x=>x.lastAttemptDay>=ctx.workDay)||
  p.meridianTraining?.lastAttemptDay>=ctx.workDay)return null;
 const secondProof=finalSecondReceipt(p);
 if(!secondProof)throw Error('Original Second Circle success source missing');
 const r=prior||{origin:ORIGIN,originalSecondCircleSourceHash:secondProof.seal,
  sessions:[],progress:0,manaRemaining:second.manaRemaining,
  coreStability:second.coreStability,matrixIntegrity:null,
  completed:false,lastAttemptDay:-1};
 if(r.sessions.length>=480||r.manaRemaining<Law.MANA_COST||
  r.coreStability<45||body.stamina<Law.staminaCost(180))return null;
 const start=ctx.workDay*1440+600,oldLog=s.log.slice(),
  before=p.rngState,choiceChance=Early.chance(p),
  choiceD100=Core.die(p,100),accepted=choiceD100<=choiceChance,
  woundsBefore=accepted?[...body.wounds]:null,
  manaBefore=r.manaRemaining,stabilityBefore=r.coreStability,
  integrityBefore=r.progress;
 let check=null,earned=0,injury=false;
 if(accepted){
  const modifier=Math.floor((p.mechanicalFoundation.baselineAttributes.int-10)/2)+
   Law.stabilityBonus(r.coreStability);
  try{
   const actual=Core.check(s,{modifier,dc:Law.DC,
    label:'Independent original Third Arcane Circle matrix',
    independentRngOwner:p,privateDisplay:true});
   check={roll:actual.roll,modifier:actual.modifier,dc:actual.dc,
    degree:actual.degree,success:actual.success,margin:actual.margin};
   earned=Law.earned(actual);
   injury=actual.degree==='severe failure';
   r.coreStability=Law.stabilityAfter(r.coreStability,actual);
   r.manaRemaining-=Law.MANA_COST;
   body.stamina-=Law.staminaCost(180);
   if(injury)Combat.harm(s,body,2);
   r.progress=Math.min(Law.REQUIRED,r.progress+earned);
   if(r.progress===Law.REQUIRED){
    r.completed=true;
    r.matrixIntegrity=Law.integrity(actual.margin,
     r.sessions.filter(x=>x.source.origin===ORIGIN&&x.source.accepted).length+1,
     r.coreStability);
   }
  }finally{s.log.splice(0,s.log.length,...oldLog);}
 }
 const Offscreen=require('../world/independent-original-power-days');
 const source={origin:ORIGIN,actorId:p.actorId,system:'arcane',
  target:'circle3',individualOriginHash:p.originHash,
  originalFoundationSeal:p.mechanicalFoundation.seal,
  originalCombatEntrySeal:body.npcOrigin.seal,
  originalSecondCircleSourceHash:secondProof.seal,
  originalShiftHash:ctx.originalShiftHash,
  originalSceneHash:hash(Offscreen.opportunityEvidence(ctx,'arcane')),
  offscreenOpportunity:Offscreen.opportunityEvidence(ctx,'arcane'),
  day:ctx.workDay,startMinute:start,actualMinutes:accepted?180:5,
  rngBefore:before,rngAfter:p.rngState,
  personalityAtDecision:p.personality,fatigueAtDecision:p.fatigue,
  choiceD100,choiceChance,accepted,
  originalMatrixDesign:design(p),focus:FOCI[p.personality],
  manaBefore,manaSpent:accepted?Law.MANA_COST:0,
  manaAfter:r.manaRemaining,
  staminaBefore:accepted?body.stamina+Law.staminaCost(180):null,
  staminaSpent:accepted?Law.staminaCost(180):0,
  staminaAfter:accepted?body.stamina:null,
  coreStabilityBefore:stabilityBefore,coreStabilityAfter:r.coreStability,
  integrityBefore,earnedMatrixIntegrity:earned,integrityAfter:r.progress,
  stageBefore:2,stageAfter:r.completed?3:2,
  matrixIntegrityAfter:r.matrixIntegrity,
  check,originalPhysicalBacklash:injury,
  woundsBefore,woundsAfter:accepted?[...body.wounds]:null,
  noSpellOrTechniqueGranted:true};
 r.sessions.push({source,seal:hash(source)});
 r.lastAttemptDay=ctx.workDay;
 p.originalArcaneMatrix=r;
 if(!verify(s,p))throw Error('Original independent Third Circle source replay failed');
 return {kind:'arcane-architecture',target:'circle3',
  actualOriginalCheck:accepted,originalSourceHash:hash(source),
  earnedMatrixProgress:earned,progress:r.progress,completed:r.completed,
  realManaSpent:accepted?Law.MANA_COST:0,
  realBodyStaminaSpent:accepted?Law.staminaCost(180):0,
  realBacklash:injury,noNewSpell:true,noPlayerKnowledge:true};
}
function afterNight(s,p,nightRow){
 const r=p?.originalArcaneMatrix;
 if(!r)return null;
 if(!verify(s,p))throw Error('Original Arcane matrix recovery source was altered');
 const Offscreen=require('../world/independent-original-power-days');
 if(!nightRow||!Offscreen.verifyNights(s,p,[nightRow])||
  r.sessions.length>=480||r.sessions.some(x=>x.source?.origin===RECOVERY&&
   x.source.originalNightSourceHash===nightRow.seal))return null;
 const capacity=Build.arcaneProfile(r.completed?3:2).mana,
  before=r.manaRemaining,after=Math.min(capacity,before+RESTORED_MANA_PER_ORIGINAL_NIGHT);
 if(after===before)return null;
 const source={origin:RECOVERY,system:'arcane',actorId:p.actorId,
   originalSecondCircleSourceHash:r.originalSecondCircleSourceHash,
   originalNight:structuredClone(nightRow),originalNightSourceHash:nightRow.seal,
   endMinute:nightRow.source.endMinute,manaBefore:before,
   manaAfter:after,manaCapacity:capacity,noExtraPlayerTimeOrSpells:true};
 r.sessions.push({source,seal:hash(source)});
 r.manaRemaining=after;
 if(!verify(s,p))throw Error('Original Arcane matrix Mana recovery replay failed');
 return {actualOriginalManaRestored:after-before,noFreeReplenishment:true};
}
module.exports={ORIGIN,RECOVERY,verify,privateStatus,afterDaily,afterNight};
