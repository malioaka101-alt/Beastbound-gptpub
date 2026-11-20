'use strict';
// #177: original-source early discipline preparation for independently
// living adults. This is an NPC adapter to the SAME original discipline
// targets, difficulty, potential, body and check owners as the PC. It is
// not an alternate magical rank, energy, awakening or progress system.
const Crypto=require('node:crypto'),
 Core=require('./core'),Combat=require('./combat'),
 E=require('../engine'),W=require('./world'),
 Disc=require('./disciplines'),Potential=require('./potential-mechanics'),
 Difficulty=require('./dynamic-difficulty');
const ORIGIN='source-owned-independent-early-discipline-practice-v1';
const ARCANE_RITE='original-source-independent-arcane-mana-core-ignition-v1';
const ARCANE_CIRCLE='source-earned-original-independent-arcane-first-circle-v1';
const FIRST_OTHER_RITE='source-owned-independent-original-first-milestone-v1';
const TARGETS=Object.freeze({arcane:'core',soul:'phase1',body:'cycle1',rift:'sense'});
const METHODS=Object.freeze({
 arcane:Object.freeze(['mana-attunement','core-geometry','formulae']),
 soul:Object.freeze(['self-awareness','identity-ward','resonance']),
 body:Object.freeze(['muscle','tendon','recovery']),
 rift:Object.freeze(['boundaries','orientation','anchor-theory'])
});
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const cap=(x,hi)=>Math.min(hi,Math.max(0,x));
function chance(p){
 const base={curious:66,steady:59,independent:51,reserved:39}[p.personality];
 if(!Number.isInteger(base)||!Number.isFinite(p.fatigue)||p.fatigue<0||p.fatigue>100)
  throw Error('Unverified original independent person choice condition');
 return base-(p.fatigue>=55?15:0);
}
function trainingSpec(system,target=TARGETS[system]){
 if(!Object.hasOwn(TARGETS,system)||
  (target!==TARGETS[system]&&!(system==='arcane'&&target==='circle1')))
  throw Error('Only original early discipline and First Circle are supported');
 const original=Disc.KEYS[system]?.tracks?.[target];
 if(!original||original.length!==2)throw Error('Missing original power-system training source');
 return {target,methods:METHODS[system],required:original[0],baseDC:original[1]};
}
function verify(s,p){
 if(!p?.originalEarlyDisciplinePreparation)return p?.originalArcaneCore===undefined&&
  p?.originalFirstPowerMilestones===undefined;
 const w=s.table?.realm,entries=p.originalEarlyDisciplinePreparation;
 if(!w||!p.actorId||!require('../world/emergent-people').verify(w,p)||
  !require('../world/person-mechanical-foundations').verify(w,p)||
  !entries||typeof entries!=='object'||Array.isArray(entries)||
  Object.keys(entries).some(x=>!Object.hasOwn(TARGETS,x)))return false;
 const condition=require('./unified').currentNpcWoundCondition(s,p.actorId),
  body=condition?Combat.get(s,condition.combatantId):null;
 if(!body?.npcOrigin?.seal)return false;
 for(const [system,r] of Object.entries(entries)){
  const spec=trainingSpec(system),track=Disc.KEYS[system];
  if(!r||r.origin!==ORIGIN||
    !(r.target===spec.target||
     (system==='arcane'&&['circle1','circle-one-earned'].includes(r.target))||
     (system!=='arcane'&&r.target==='earned-first-milestone'))||
    !Array.isArray(r.sessions)||r.sessions.length>480||
    !Number.isInteger(r.lastAttemptDay)||r.lastAttemptDay<0||
    !Number.isInteger(r.cooldownUntil)||r.cooldownUntil<0||
    !Number.isInteger(r.points)||r.points<0||r.points>(system==='arcane'?Disc.KEYS.arcane.tracks.circle1[0]:spec.required)||
    !r.methods||typeof r.methods!=='object'||Array.isArray(r.methods))
   return false;
  let points=0,methods={},lastDay=-1,cooldown=0,previousEnd=0,
   ignited=false,coreSourceHash=null,circleOne=false,circleSourceHash=null,
   otherMilestone=false,
   otherSourceHash=null,otherEffect=null;
  const prior=[];
  for(const row of r.sessions){
   const q=row?.source,
    active=trainingSpec(system,system==='arcane'&&ignited?'circle1':spec.target);
   if(!q||row.seal!==hash(q)||
    ![ORIGIN,ARCANE_RITE,ARCANE_CIRCLE,FIRST_OTHER_RITE].includes(q.origin)||
    q.actorId!==p.actorId||q.system!==system||q.target!==active.target||
    q.individualOriginHash!==p.originHash||
    q.originalFoundationSeal!==p.mechanicalFoundation.seal||
    q.originalCombatEntrySeal!==body.npcOrigin.seal||
    !/^[a-f0-9]{64}$/.test(q.originalShiftHash||'')||
    !/^[a-f0-9]{64}$/.test(q.originalSceneHash||'')||
    !Number.isInteger(q.startMinute)||q.startMinute<previousEnd||
    !Number.isInteger(q.day)||q.day!==Math.floor(q.startMinute/1440)||
    q.day<=lastDay||q.startMinute>s.world.minutes||
    !Number.isInteger(q.rngBefore)||q.rngBefore<1||
    !Number.isInteger(q.rngAfter)||q.rngAfter<1||
    !Number.isInteger(q.choiceD100)||q.choiceD100<1||q.choiceD100>100||
    !Number.isInteger(q.choiceChance)||q.choiceChance<1||q.choiceChance>100||
    !['curious','steady','reserved','independent'].includes(q.personalityAtAttempt)||
    !Number.isInteger(q.fatigueAtAttempt)||q.fatigueAtAttempt<0||q.fatigueAtAttempt>100||
    q.choiceChance!==chance({personality:q.personalityAtAttempt,
     fatigue:q.fatigueAtAttempt})||
    q.pointsBefore!==points||q.cooldownBefore!==cooldown||
    (q.origin===ORIGIN&&q.noAutomaticStageOrTechnique!==true)||
    q.originalSkillRankBonus!==0||typeof q.accepted!=='boolean')
    return false;
   if(circleOne||otherMilestone)return false;
   // Neither a successful original Core ignition nor a completed distinct
   // Soul/Body/Rift milestone may be followed by more same-target prep.
   // Ordinary off-screen life can only open an ORIGINAL check if its
   // independently chosen day is genuinely source-replayed. Nearby PC
   // presence is neither required nor falsely claimed for that history.
   if(q.offscreenOpportunity!==undefined&&
    !require('../world/independent-original-power-days')
     .verifyEvidence(s,p,q))return false;
   const roller={rngState:q.rngBefore};
   if(q.origin===ARCANE_RITE){
    if(system!=='arcane'||ignited)return false;
    const rite=require('./independent-original-arcane-core').replay(
     s,p,q,roller,{points,methods,cooldown,body,priorSuccess:ignited});
    if(!rite)return false;
    points=rite.points;methods=rite.methods;cooldown=rite.cooldown;
    if(rite.ignited){ignited=true;coreSourceHash=rite.coreSourceHash;
     prior.length=0;}
    lastDay=q.day;previousEnd=q.startMinute+q.actualMinutes;
    continue;
   }
   if(q.origin===ARCANE_CIRCLE){
    if(system!=='arcane'||!ignited)return false;
    const rite=require('./independent-original-arcane-core').replayCircle(
     s,p,q,roller,{points,methods,cooldown,body,coreSourceHash,
      priorSuccess:circleOne});
    if(!rite)return false;
    points=rite.points;methods=rite.methods;cooldown=rite.cooldown;
    if(rite.formed){circleOne=true;circleSourceHash=rite.circleSourceHash;}
    lastDay=q.day;previousEnd=q.startMinute+q.actualMinutes;
    continue;
   }
   if(q.origin===FIRST_OTHER_RITE){
    if(system==='arcane')return false;
    const rite=require('./independent-original-first-milestones').replay(
     s,p,q,roller,{points,methods,cooldown,body,priorSuccess:otherMilestone});
    if(!rite)return false;
    points=rite.points;methods=rite.methods;cooldown=rite.cooldown;
    if(rite.attained){
     otherMilestone=true;otherSourceHash=rite.ownerSourceHash;
     otherEffect=rite.effect;
    }
    lastDay=q.day;previousEnd=q.startMinute+q.actualMinutes;
    continue;
   }
   if(Core.die(roller,100)!==q.choiceD100||
    q.accepted!==(q.choiceD100<=q.choiceChance))return false;
   if(q.accepted){
    if(q.day<cooldown||q.actualMinutes!==120||q.staminaCost!==1||
     !Number.isInteger(q.staminaBefore)||q.staminaBefore<1||
     !Number.isInteger(q.maxStaminaAtAttempt)||q.maxStaminaAtAttempt<1||
     q.staminaBefore>q.maxStaminaAtAttempt||
     q.staminaAfter!==q.staminaBefore-1||
     q.methodNumber!==Core.die(roller,active.methods.length)||
     q.method!==active.methods[q.methodNumber-1]||!q.check||
     q.check.roll!==Core.die(roller,20)||
     !Number.isInteger(q.check.earned)||q.check.earned<0)
     return false;
    const expectedDC=Difficulty.disciplinePractice(s,{
     system,method:q.method,record:{target:active.target,methods},
     baseDC:active.baseDC,independent:true,short:true,
     originalPhysicalOwner:{stamina:q.staminaBefore,
      maxStamina:q.maxStaminaAtAttempt},originalTrainingWitnesses:prior
    }).dc;
    const attr=p.mechanicalFoundation.baselineAttributes[track.attribute],
     apt=Potential.bonus(p.mechanicalFoundation.unassessedPotential[
      Potential.METHODS[system][q.method]]),
     mod=Math.floor((attr-10)/2)+apt,
     margin=q.check.roll+mod+Core.naturalAdjustment(q.check.roll)-expectedDC,
     degree=Core.degree(margin),
     earned=Core.progress(degree)+(margin>=0?Math.max(0,apt):0);
    if(q.check.dc!==expectedDC||q.check.modifier!==mod||
     q.check.degree!==degree||q.check.success!==(margin>=0)||
     q.check.earned!==earned||
     q.pointsAfter!==cap(points+earned,active.required))return false;
    if(degree==='severe failure'){
     if(q.complicationRoll!==Core.die(roller,20)||
      q.cooldownUntil!==(q.complicationRoll<=5?q.day+6:cooldown)||
      q.originalPhysicalInjury!==(q.complicationRoll<=3||
       q.complicationRoll===14||q.complicationRoll===15))
      return false;
    }else if(q.complicationRoll!==null||q.originalPhysicalInjury!==false||
     q.cooldownUntil!==cooldown)return false;
    points=q.pointsAfter;methods[q.method]=(methods[q.method]||0)+1;
    prior.push({system,target:active.target,method:q.method,minutes:120,
     startMinute:q.startMinute,eventHash:row.seal});
   }else{
    if(q.actualMinutes!==5||q.staminaCost!==0||
     q.method!==null||q.methodNumber!==null||q.check!==null||
     q.complicationRoll!==null||q.originalPhysicalInjury!==false||
     q.staminaBefore!==null||q.staminaAfter!==null||
     q.maxStaminaAtAttempt!==null||q.cooldownUntil!==cooldown||
     q.pointsAfter!==points)return false;
   }
   if(roller.rngState!==q.rngAfter)return false;
   cooldown=q.cooldownUntil;lastDay=q.day;
   previousEnd=q.startMinute+q.actualMinutes;
  }
  if(r.sessions.length===0||r.lastAttemptDay!==lastDay||
   r.points!==points||r.cooldownUntil!==cooldown||
   r.target!==(circleOne?'circle-one-earned':ignited?'circle1':
    otherMilestone?'earned-first-milestone':spec.target)||
   JSON.stringify(r.methods)!==JSON.stringify(methods))
   return false;
  if(system!=='arcane'){
   const milestone=p.originalFirstPowerMilestones?.[system];
   if(otherMilestone){
    const expected={originalSourceHash:otherSourceHash,...otherEffect};
    if(JSON.stringify(milestone)!==JSON.stringify(expected))
     return false;
   }else if(milestone!==undefined)return false;
  }
  if(system==='arcane'){
   if(ignited){
    const Build=require('./build'),owner=require('./independent-original-arcane-core'),
     profile=Build.arcaneProfile(circleOne?1:0),
     expected={coreIgnited:true,circles:circleOne?1:0,
      geometry:circleOne?owner.circleGeometry(p):'seeded core',
      structuredMana:profile.mana,originalSourceHash:coreSourceHash,
      noLearnedSpells:true};
    if(circleOne){expected.originalCircleOneSourceHash=circleSourceHash;
     expected.channels=profile.channels;expected.maxComplexity=profile.maxComplexity;}
    if(JSON.stringify(p.originalArcaneCore)!==JSON.stringify(expected))
     return false;
   }else if(p.originalArcaneCore!==undefined)return false;
  }
 }
 if(!entries.arcane&&p.originalArcaneCore!==undefined)return false;
 const next=p.originalFirstPowerMilestones;
 if(next!==undefined){
  if(!next||Array.isArray(next)||typeof next!=='object'||
   Object.keys(next).length===0||
   Object.keys(next).some(x=>!['soul','body','rift'].includes(x)||
    !entries[x]||entries[x].target!=='earned-first-milestone'))
   return false;
 }
 return true;
}
function privateStatus(s,actorId){
 if(typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId))
  throw Error('Original private actor identity required');
 const w=require('../world/simulation').peek(s),
  p=w?.emergentPeople?.people?.[actorId.slice('emergent:'.length)];
 if(!p||p.actorId!==actorId||!require('../world/emergent-people').verify(w,p)||
  !verify(s,p))throw Error('Unverified original NPC discipline preparation');
 return {actorId,privateToGM:true,
  originalOwner:'rules/disciplines.js',
  actualPreparations:Object.fromEntries(Object.entries(p.originalEarlyDisciplinePreparation||{})
   .map(([system,r])=>[system,{target:r.target,earnedPreparationPoints:r.points,
    genuineSessionCount:r.sessions.filter(x=>x.source.origin===ORIGIN&&x.source.accepted).length,
    realMilestoneAttemptCount:r.sessions.filter(x=>[ARCANE_RITE,FIRST_OTHER_RITE]
     .includes(x.source.origin)).length,
    distinctSourceMethods:Object.keys(r.methods).length,
    originalTrainingThreshold:trainingSpec(system,system==='arcane'&&
      r.target!=='core'?'circle1':TARGETS[system]).required,
    milestoneAwarded:(system==='arcane'&&
      ['circle1','circle-one-earned'].includes(r.target))||
      r.target==='earned-first-milestone',
    physicalAndEthicalMilestoneStillRequired:!['circle1','circle-one-earned'].includes(r.target)&&
      r.target!=='earned-first-milestone'}])),
  verifiedArcaneCoreIgnition:!!p.originalArcaneCore?.coreIgnited,
   verifiedArcaneFirstCircle:p.originalArcaneCore?.circles===1,
  originalSourceEarnedFirstMilestones:structuredClone(
   p.originalFirstPowerMilestones||{}),
  noArcaneCircleOrUnearnedOtherStageOrTechnique:p.originalArcaneCore?.circles!==1,
   noFreeSpellOrTechniqueByCircle:true};
}
function practice(s,{actorId,system,...untrusted}={}){
 if(Object.keys(untrusted).length||
  typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId))
  throw Error('Original independent NPC practice accepts actorId and discipline only; no chosen method, result, dice or costs');
 const spec=trainingSpec(system);
 // An original already-made personal decision cannot be disguised as a new
 // attempt just because that decision itself inflicted a real wound.
 // Verify the stored original source FIRST, then enforce no reroll before
 // the shared current physical capability/presence gate.
 const preliminary=require('../world/simulation').peek(s)
  ?.emergentPeople?.people?.[actorId.slice('emergent:'.length)];
 const today=Math.floor(s.world.minutes/1440);
 if(preliminary?.actorId===actorId){
  if(preliminary.originalEarlyDisciplinePreparation&&!verify(s,preliminary))
   throw Error('Original individual early discipline proof was altered');
  const history=preliminary.originalEarlyDisciplinePreparation||{};
  if(Object.values(history).some(r=>r.lastAttemptDay>=today)||
   preliminary.meridianTraining?.lastAttemptDay>=today)
   throw Error('This original person already chose whether to train today');
 }
 const ctx=Disc.originalActorSessionContext(s,{actorId,system,target:spec.target}),
  {person:p,combatant:body,day,minute,presence:present}=ctx;
 if(!verify(s,p))throw Error('Original individual early discipline proof was altered');
 if(p.originalArcaneCore?.coreIgnited&&system==='arcane')
  throw Error('The original individual has already earned their Mana Core; separate Circle I practice requires its own source owner');
 if(p.originalFirstPowerMilestones?.[system])
  throw Error('The original individual has completed this first power-system milestone; next stage needs a separate source owner');
 const records=p.originalEarlyDisciplinePreparation||{};
 if(Object.values(records).some(r=>r.lastAttemptDay>=day)||
  p.meridianTraining?.lastAttemptDay>=day)
  throw Error('This original person already chose whether to train today');
 const old=records[system];
 if(old?.points>=spec.required)
  throw Error('Original stage preparation complete; the distinct real milestone is still required');
 if(old&&day<old.cooldownUntil)
  throw Error('Existing original physical training cooldown has not finished');
 if(body.stamina<1||body.status!=='ok')
  throw Error('An original living person requires real available Stamina to practise');
 if(minute<8*60||minute+120>18*60)
  throw Error('A complete original 120-minute daylight practice window is required');
 const record=old||{origin:ORIGIN,target:spec.target,points:0,methods:{},
  sessions:[],lastAttemptDay:-1,cooldownUntil:0};
 if(record.sessions.length>=480)
  throw Error('Original chronological training journal needs review');
 const start=s.world.minutes,initialRng=p.rngState,startingStamina=body.stamina,
  choiceChance=chance(p),choiceD100=Core.die(p,100),
  accepted=choiceD100<=choiceChance;
 let method=null,methodNumber=null,check=null,complicationRoll=null,
  injury=false,spent=0,minutes=5,cooldown=record.cooldownUntil;
 if(accepted){
  methodNumber=Core.die(p,spec.methods.length);
  method=spec.methods[methodNumber-1];
  const prior=record.sessions.filter(x=>x.source.accepted).map(row=>({
   system,target:spec.target,method:row.source.method,
   minutes:120,startMinute:row.source.startMinute,eventHash:row.seal}));
  const dc=Difficulty.disciplinePractice(s,{system,method,record,
   baseDC:spec.baseDC,independent:true,short:true,
   originalPhysicalOwner:body,originalTrainingWitnesses:prior}).dc;
  const training=Disc.originalActorTrainingProfile(s,{
   actorId,system,target:spec.target,method});
  spent=1;minutes=120;body.stamina-=1;
  const actual=Core.check(s,{modifier:training.modifier,dc,
   label:p.name+' independent '+system+' '+spec.target+' '+method,
   independentRngOwner:p,privateDisplay:true});
  const earned=actual.progress+(actual.success?
   Math.max(0,training.potential.modifier):0);
  check={roll:actual.roll,modifier:actual.modifier,dc:actual.dc,
   degree:actual.degree,success:actual.success,earned};
  record.points=cap(record.points+earned,spec.required);
  record.methods[method]=(record.methods[method]||0)+1;
  if(actual.degree==='severe failure'){
   complicationRoll=Core.die(p,20);
   injury=complicationRoll<=3||complicationRoll===14||complicationRoll===15;
   if(injury)Combat.harm(s,body,2);
   if(complicationRoll<=5)cooldown=day+6;
  }
 }
 const proof={origin:ORIGIN,actorId,system,target:spec.target,
  individualOriginHash:p.originHash,
  originalFoundationSeal:p.mechanicalFoundation.seal,
  originalCombatEntrySeal:body.npcOrigin.seal,
  originalShiftHash:present.presence.hash,
  originalSceneHash:hash(s.chatRuntime.scene),
  day,startMinute:start,actualMinutes:minutes,
  rngBefore:initialRng,rngAfter:p.rngState,
  personalityAtAttempt:p.personality,fatigueAtAttempt:p.fatigue,
  choiceD100,choiceChance,accepted,
  method,methodNumber,check,complicationRoll,
  originalPhysicalInjury:injury,
  staminaCost:spent,staminaBefore:accepted?startingStamina:null,
  maxStaminaAtAttempt:accepted?body.maxStamina:null,
  staminaAfter:accepted?startingStamina-spent:null,
  pointsBefore:old?.points||0,pointsAfter:record.points,
  cooldownBefore:old?.cooldownUntil||0,cooldownUntil:cooldown,
  originalSkillRankBonus:0,noAutomaticStageOrTechnique:true};
 const row={source:proof,seal:hash(proof)};
 record.sessions.push(row);record.cooldownUntil=cooldown;
 record.lastAttemptDay=day;
 p.originalEarlyDisciplinePreparation={...records,[system]:record};
 if(!verify(s,p))
  throw Error('Original independent discipline preparation failed exact source replay');
 E.advance(s,minutes);W.finalizeTime(s,start);
 Core.event(s,'progress',accepted?
  p.name+' undertakes an independent '+system+' preparation session.':
  p.name+' chooses not to undertake '+system+' preparation today.',{
  origin:ORIGIN,actorId,system,accepted,sourceHash:row.seal,
  noRankManaCorePhaseCycleRiftStepOrTechniqueAwarded:true,
  privateTrainingNumbersNotDisclosed:true});
 return {actorId,system,independentChoice:accepted?'practised':'declined',
  elapsedMinutes:minutes,actualOriginalCheck:accepted,
  stageOrTechniqueEarned:false,privateProgressNotDisclosed:true};
}
module.exports={ORIGIN,TARGETS,METHODS,chance,hash,verify,privateStatus,practice};
