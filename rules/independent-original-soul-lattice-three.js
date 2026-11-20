'use strict';
// #177: Original independent Soul Phase III RESONANCE LATTICE. This is
// the individual's own personality-driven, personally observed structural
// self-pattern, never a claim to know another mind, enslave a soul, gain a
// learned art, or skip Phase II. All work runs only on a REAL independent
// completed personal Soul-practice day with original opportunity evidence.
// Real individually owned Soul reserve, original Combat Stamina/wounds,
// separate design, practice, strain repair and formation trial. Exact player
// Phase III costs, checks, structural effects and safety from shared law.
const Crypto=require('node:crypto'),Core=require('./core'),
 Combat=require('./combat'),Build=require('./build'),
 Early=require('./independent-original-discipline-preparation'),
 Thread=require('./independent-original-soul-thread-two'),
 Law=require('./soul-shared-original-resonance-lattice');
const ORIGIN='source-earned-independent-original-soul-lattice-three-v1',
 NIGHT='source-earned-independent-original-soul-lattice-three-night-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function secondSource(p){
 const r=p?.originalSoulThreadTwo;
 if(!r?.completed)return null;
 const row=r.sessions?.find(x=>x?.source?.origin===Thread.ORIGIN&&
  x.source.completedAfter===true);
 return row?.seal||null;
}
function blueprint(p){
 const root=secondSource(p),r=p.originalSoulThreadTwo;
 if(!root)return null;
 return {kind:'personally-observed-own-soul-resonance',
  originalEarnedPhaseTwoSourceHash:root,
  originalMindBodyResonanceLinks:{...r.links},
  originalThreadIntegrity:r.threadIntegrity,
  individualIdentityOriginHash:p.originHash,
  identityBoundary:'Own separately verified soul structure only',
  communicationLimit:'No access to other living persons inner thoughts',
  interferenceCountertest:'Original independent identity stability and backlash checks',
  repairMethod:'Original personally checked independent resonance re-tuning',
  noOtherPersonConsentPresumed:true,noLearnedArtOrSpiritContract:true};
}
function initial(p){
 const r=p?.originalSoulThreadTwo;
 const source=secondSource(p);
 if(!source)return null;
 return {source,reserve:r.reserveRemaining,max:r.maxReserve,
  stability:r.soulStability,
  will:Math.floor((p.mechanicalFoundation.baselineAttributes.wis-10)/2)};
}
function safeCheck(s,params){
 const previous=s.log.slice();
 try{return Core.check(s,{...params,privateDisplay:true});}
 finally{s.log.splice(0,s.log.length,...previous);}
}
function verify(s,p){
 const r=p?.originalSoulLatticeThree;
 if(r===undefined)return true;
 const base=initial(p),Offscreen=require('../world/independent-original-power-days');
 if(!base||!Thread.verify(s,p)||!Early.verify(s,p)||
  !r||r.origin!==ORIGIN||r.originalThreadSourceHash!==base.source||
  !Array.isArray(r.sessions)||r.sessions.length<1||r.sessions.length>480||
  !Number.isInteger(r.lastAttemptDay)||r.lastAttemptDay<0)
  return false;
 const body=s.table?.combatants?.['npc_'+p.id];
 if(!body?.npcOrigin?.seal)return false;
 let reserve=base.reserve,maximum=base.max,stability=base.stability,
  points=0,strain=0,mapped=false,formed=false,plan=null,
  completedSeal=null,lastDay=-1,lastEnd=0;
 const processedNights=new Set();
 for(const row of r.sessions){
  const q=row?.source;
  if(q?.origin===NIGHT){
   const night=q.originalNight;
   if(row.seal!==hash(q)||!night||processedNights.has(night.seal)||
    q.actorId!==p.actorId||q.system!=='soul'||
    q.originalThreadSourceHash!==base.source||
    q.originalNightSourceHash!==night.seal||
    q.endMinute!==night.source?.endMinute||
    q.endMinute<=lastEnd||q.endMinute>s.world.minutes||
    !Offscreen.verifyNights(s,p,[night])||
    q.reserveBefore!==reserve||q.reserveCapacity!==maximum||
    q.reserveAfter!==Math.min(maximum,reserve+3)||
    q.noExtraDayOrSoulArt===false||
    q.noExtraDayOrSoulArt!==true)return false;
   reserve=q.reserveAfter;lastEnd=q.endMinute;processedNights.add(night.seal);
   continue;
  }
  if(!q||row.seal!==hash(q)||formed||q.origin!==ORIGIN||
   q.actorId!==p.actorId||q.system!=='soul'||
   q.individualOriginHash!==p.originHash||
   q.originalFoundationSeal!==p.mechanicalFoundation.seal||
   q.originalCombatEntrySeal!==body.npcOrigin.seal||
   q.originalThreadSourceHash!==base.source||
   q.noOtherMindReadingOrUnlearnedArt!==true||
   !Number.isInteger(q.day)||q.day<=lastDay||
   q.startMinute!==q.day*1440+600||q.startMinute<lastEnd||
   q.startMinute+q.actualMinutes>s.world.minutes||
   !Offscreen.verifyEvidence(s,p,q)||
   q.reserveBefore!==reserve||q.maxReserveBefore!==maximum||
   q.stabilityBefore!==stability||q.pointsBefore!==points||
   q.strainBefore!==strain||q.mappedBefore!==mapped||
   q.formedBefore!==formed||
   q.choiceChance!==Early.chance({
    personality:q.personalityAtDecision,
    fatigue:q.fatigueAtDecision})||
   q.personalityAtDecision!==p.personality||
   !Number.isInteger(q.rngBefore)||q.rngBefore<1||
   !Number.isInteger(q.staminaBefore)||q.staminaBefore<1||
   !Number.isInteger(q.maxStaminaAtAttempt)||
   q.staminaBefore>q.maxStaminaAtAttempt||
   JSON.stringify(q.woundsBefore)!=='[0,0,0]'||
   !Array.isArray(q.woundsAfter)||q.woundsAfter.length!==3)
   return false;
  const expectedKind=!mapped?'design':
   strain>=5||points>=Law.GOAL&&strain>2?'repair':
   points>=Law.GOAL?'form':'practice';
  if(q.kind!==expectedKind)return false;
  const roller={rngState:q.rngBefore};
  if(q.choiceD100!==Core.die(roller,100)||
   q.accepted!==(q.choiceD100<=q.choiceChance))return false;
  let minutes=5,cost=0,physicalCost=0,injury=false,
   progressEarned=0,check=null;
  if(q.accepted){
   if(q.kind==='design'){
    minutes=45;mapped=true;plan=blueprint(p);
    if(!plan||JSON.stringify(q.personalBlueprint)!==
     JSON.stringify(plan))return false;
   }else{
    minutes=q.kind==='form'?90:120;
    cost=q.kind==='form'?Law.FORMATION_RESERVE:
     q.kind==='repair'?Law.REPAIR_RESERVE:Law.PRACTICE_RESERVE;
    physicalCost=q.kind==='form'?Law.formationStamina(minutes):
     q.kind==='repair'?Law.repairStamina(minutes):
      Law.practiceStamina(minutes);
    if(reserve<cost||q.staminaBefore<physicalCost||
     q.personalBlueprint!==null)return false;
    const dc=q.kind==='form'?Law.FORMATION_DC:
     q.kind==='repair'?Law.REPAIR_DC:Law.PRACTICE_DC,
     mod=q.kind==='form'?
      Law.formationModifier(base.will,0,stability):base.will,
     roll=Core.die(roller,20),
     margin=roll+mod+Core.naturalAdjustment(roll)-dc,
     degree=Core.degree(margin),success=margin>=0;
    check={roll,dc,modifier:mod,margin,degree,success};
    if(JSON.stringify(q.check)!==JSON.stringify(check))return false;
    reserve-=cost;
    if(q.kind==='practice'){
     const changed=Law.practiceState(points,strain,check);
     progressEarned=Law.earned(check);
     points=changed.points;strain=changed.strain;
     if(changed.stabilityLost){
      stability=Math.max(1,stability-changed.stabilityLost);
      injury=true;
     }
    }else if(q.kind==='repair'){
     if(strain===0)return false;
     const changed=Law.repairState(strain,stability,check);
     strain=changed.strain;stability=changed.stability;
    }else{
     if(!Law.formationReady(points,strain))return false;
     if(success){
      formed=true;completedSeal=row.seal;
      maximum=Math.max(maximum,Build.soulProfile(3,{will:base.will}).soulReserve);
     }
    }
   }
   if(q.kind==='design'&&q.check!==null)return false;
  }else if(q.check!==null||q.personalBlueprint!==null)return false;
  if(q.actualMinutes!==minutes||q.reserveSpent!==cost||
   q.staminaSpent!==physicalCost||
   q.staminaAfter!==q.staminaBefore-physicalCost||
   q.originalPhysicalBacklash!==injury||
   q.progressEarned!==progressEarned||
   JSON.stringify(q.woundsAfter)!==
    JSON.stringify(injury?[1,0,0]:[0,0,0])||
   q.reserveAfter!==reserve||q.maxReserveAfter!==maximum||
   q.stabilityAfter!==stability||q.pointsAfter!==points||
   q.strainAfter!==strain||q.mappedAfter!==mapped||
   q.formedAfter!==formed||q.rngAfter!==roller.rngState)
   return false;
  lastDay=q.day;lastEnd=q.startMinute+minutes;
 }
 const expectedProof=formed?{source:ORIGIN,
  originalThreadSourceHash:base.source,formationSourceHash:completedSeal,
  latticeIntegrity:Law.FORMATION_INTEGRITY,
  perceptionRangeMetres:Build.soulProfile(3,{will:base.will}).perceptionRangeMetres,
  noMindreadingContractOrLearnedArt:true}:null;
 return r.lastAttemptDay===lastDay&&r.reserveRemaining===reserve&&
  r.maxReserve===maximum&&r.soulStability===stability&&
  r.points===points&&r.strain===strain&&r.mapped===mapped&&
  JSON.stringify(r.personalBlueprint)===JSON.stringify(plan)&&
  r.formed===formed&&r.originalFormationSourceHash===completedSeal&&
  JSON.stringify(r.earnedProof)===JSON.stringify(expectedProof);
}
function ensureLedger(s,p){
 const base=initial(p);
 if(!base||!Thread.verify(s,p)||!Early.verify(s,p))
  throw Error('A truly source-earned own-soul Phase II thread is required before Phase III');
 if(p.originalSoulLatticeThree!==undefined){
  if(!verify(s,p))throw Error('Existing Phase III lattice history failed replay');
  return p.originalSoulLatticeThree;
 }
 p.originalSoulLatticeThree={origin:ORIGIN,
  originalThreadSourceHash:base.source,
  sessions:[],lastAttemptDay:-1,reserveRemaining:base.reserve,
  maxReserve:base.max,soulStability:base.stability,
  points:0,strain:0,mapped:false,formed:false,
  personalBlueprint:null,originalFormationSourceHash:null,earnedProof:null};
 return p.originalSoulLatticeThree;
}
function privateStatus(s,p){
 if(!Thread.verify(s,p)||!Early.verify(s,p)||!verify(s,p))
  throw Error('Original private Soul Phase III lattice evidence was altered');
 const r=p.originalSoulLatticeThree;
 return {privateToGM:true,
  originalOwner:'rules/soul-resonance-lattice.js',
  verifiedSoulPhase:r?.formed?3:2,
  actuallyMappedPersonalLattice:r?.mapped||false,
  latticeProgress:r?.points||0,requiredStructuralProgress:Law.GOAL,
  sourceObservedInterference:r?.strain||0,
  currentSoulReserve:r?.reserveRemaining??null,
  maxSoulReserve:r?.maxReserve??null,
  actuallyFormedLattice:r?.earnedProof?structuredClone(r.earnedProof):null,
  noMindReadingContractsOrFreeSoulArt:true};
}
function afterDaily(s,ctx){
 const p=ctx.actor,body=ctx.body,base=initial(p);
 if(!base||!Thread.verify(s,p)||!Early.verify(s,p)||!verify(s,p)||
  p.originalSoulLatticeThree?.formed||
  body.status!=='ok'||body.wounds.some(x=>x!==0))return null;
 const r=ensureLedger(s,p);
 if(r.sessions.length>=480||r.lastAttemptDay>=ctx.workDay||
  Object.values(p.originalEarlyDisciplinePreparation||{}).
   some(x=>x.lastAttemptDay>=ctx.workDay)||
  p.meridianTraining?.lastAttemptDay>=ctx.workDay)return null;
 const kind=!r.mapped?'design':
  r.strain>=5||r.points>=Law.GOAL&&r.strain>2?'repair':
  r.points>=Law.GOAL?'form':'practice';
 // The ORIGINAL Phase III repair owner requires a NEW personally
 // witnessed clinical identity-interference diagnosis and correction.
 // Existing independent practice plus a numeric strain value is NOT a
 // diagnosis, a clinician or treatment. Until that specific evidence owner
 // is integrated, do not silently invent a restorative Soul intervention.
 if(kind==='repair')return null;
 const cost=kind==='design'?0:
  kind==='form'?Law.FORMATION_RESERVE:
  kind==='repair'?Law.REPAIR_RESERVE:Law.PRACTICE_RESERVE;
 const physicalCost=kind==='design'?0:
  kind==='form'?Law.formationStamina(90):
  kind==='repair'?Law.repairStamina(120):Law.practiceStamina(120);
 if(r.reserveRemaining<cost||body.stamina<physicalCost)return null;
 const choiceChance=Early.chance(p),rngBefore=p.rngState,
  choiceD100=Core.die(p,100),accepted=choiceD100<=choiceChance,
  beforeReserve=r.reserveRemaining,beforeMax=r.maxReserve,
  beforeStability=r.soulStability,beforePoints=r.points,
  beforeStrain=r.strain,beforeMapped=r.mapped,
  beforeFormed=r.formed,
  staminaBefore=body.stamina,woundsBefore=[...body.wounds];
 let check=null,gain=0,injury=false,personalBlueprint=null;
 if(accepted){
  if(kind==='design'){
   personalBlueprint=blueprint(p);
   r.personalBlueprint=personalBlueprint;r.mapped=true;
  }else{
   const dc=kind==='form'?Law.FORMATION_DC:
    kind==='repair'?Law.REPAIR_DC:Law.PRACTICE_DC,
    mod=kind==='form'?
     Law.formationModifier(base.will,0,r.soulStability):base.will,
    result=safeCheck(s,{modifier:mod,dc,
     label:'Independent original Phase III own-soul resonance '+kind,
     independentRngOwner:p});
   check={roll:result.roll,dc:result.dc,modifier:result.modifier,
    margin:result.margin,degree:result.degree,success:result.success};
   r.reserveRemaining-=cost;body.stamina-=physicalCost;
   if(kind==='practice'){
    const changed=Law.practiceState(r.points,r.strain,result);
    gain=Law.earned(result);r.points=changed.points;r.strain=changed.strain;
    if(changed.stabilityLost){
     r.soulStability=Math.max(1,r.soulStability-changed.stabilityLost);
     injury=true;Combat.harm(s,body,2);
    }
   }else if(kind==='repair'){
    const changed=Law.repairState(r.strain,r.soulStability,result);
    r.strain=changed.strain;r.soulStability=changed.stability;
   }else if(result.success){
    r.formed=true;
    r.maxReserve=Math.max(r.maxReserve,
     Build.soulProfile(3,{will:base.will}).soulReserve);
   }
  }
 }
 const Offscreen=require('../world/independent-original-power-days'),
  witness=Offscreen.opportunityEvidence(ctx,'soul'),
  source={origin:ORIGIN,actorId:p.actorId,system:'soul',kind,
   individualOriginHash:p.originHash,
   originalFoundationSeal:p.mechanicalFoundation.seal,
   originalCombatEntrySeal:body.npcOrigin.seal,
   originalThreadSourceHash:r.originalThreadSourceHash,
   originalShiftHash:ctx.originalShiftHash,
   originalSceneHash:hash(witness),offscreenOpportunity:witness,
   day:ctx.workDay,startMinute:ctx.workDay*1440+600,
   actualMinutes:accepted?(kind==='design'?45:kind==='form'?90:120):5,
   rngBefore,rngAfter:p.rngState,
   personalityAtDecision:p.personality,fatigueAtDecision:p.fatigue,
   choiceChance,choiceD100,accepted,
   personalBlueprint,check,progressEarned:gain,
   reserveBefore:beforeReserve,reserveSpent:accepted?cost:0,
   reserveAfter:r.reserveRemaining,
   maxReserveBefore:beforeMax,maxReserveAfter:r.maxReserve,
   stabilityBefore:beforeStability,stabilityAfter:r.soulStability,
   pointsBefore:beforePoints,pointsAfter:r.points,
   strainBefore:beforeStrain,strainAfter:r.strain,
   mappedBefore:beforeMapped,mappedAfter:r.mapped,
   formedBefore:beforeFormed,formedAfter:r.formed,
   staminaBefore,staminaSpent:accepted?physicalCost:0,
   staminaAfter:body.stamina,maxStaminaAtAttempt:body.maxStamina,
   woundsBefore,woundsAfter:[...body.wounds],
   originalPhysicalBacklash:injury,
   noOtherMindReadingOrUnlearnedArt:true};
 const seal=hash(source);r.sessions.push({source,seal});
 r.lastAttemptDay=ctx.workDay;
 if(r.formed){
  r.originalFormationSourceHash=seal;
  r.earnedProof={source:ORIGIN,
   originalThreadSourceHash:r.originalThreadSourceHash,
   formationSourceHash:seal,
   latticeIntegrity:Law.FORMATION_INTEGRITY,
   perceptionRangeMetres:
    Build.soulProfile(3,{will:base.will}).perceptionRangeMetres,
   noMindreadingContractOrLearnedArt:true};
 }
 if(!verify(s,p))throw Error('Independent Phase III resonance lattice failed original source replay');
 return {kind:'original-soul-resonance-lattice-three',stage:3,
  independentlyAccepted:accepted,action:kind,
  genuinelyEarned:r.formed,structuralPoints:r.points,
  originalReserveSpent:accepted?cost:0,
  originalStaminaSpent:accepted?physicalCost:0,
  soulBacklash:injury,sourceHash:seal,
  noUnlearnedSoulArtOrOtherMindReading:true,privateToGM:true};
}
function afterNight(s,p,nightRow){
 const r=p?.originalSoulLatticeThree;
 if(!r)return null;
 if(!verify(s,p))throw Error('Original Phase III nightly Soul source failed replay');
 const Offscreen=require('../world/independent-original-power-days');
 if(!nightRow||!Offscreen.verifyNights(s,p,[nightRow])||
  r.sessions.length>=480||
  r.sessions.some(x=>x.source?.origin===NIGHT&&
   x.source.originalNightSourceHash===nightRow.seal))return null;
 const before=r.reserveRemaining,
  after=Math.min(r.maxReserve,before+3),
  source={origin:NIGHT,actorId:p.actorId,system:'soul',
   originalThreadSourceHash:r.originalThreadSourceHash,
   originalNight:structuredClone(nightRow),
   originalNightSourceHash:nightRow.seal,
   endMinute:nightRow.source.endMinute,
   reserveBefore:before,reserveCapacity:r.maxReserve,
   reserveAfter:after,noExtraDayOrSoulArt:true};
 r.sessions.push({source,seal:hash(source)});
 r.reserveRemaining=after;
 if(!verify(s,p))throw Error('Original Phase III Soul reserve recovery was not actually witnessed');
 return {originalSoulReserveRestored:after-before,
  independentOriginalSoulNight:true};
}
module.exports={ORIGIN,NIGHT,verify,ensureLedger,privateStatus,afterDaily,afterNight};
