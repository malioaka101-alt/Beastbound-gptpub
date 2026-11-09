'use strict';
// #09 attaches genuine pairwork to the ONE original bond record.
const Crypto=require('node:crypto'),E=require('../engine.js'),C=require('./core'),
 Bonds=require('./bonds'),Agency=require('./beast-agency'),
 Sapient=require('../world/sapient-beast-persons');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const SOURCE='actual-earned-partnership-synchronisation-v1',
 SCENE='witnessed-partner-practical-coordination-v1',
 PROOF='witnessed-partner-specific-breakthrough-v1',
 METHOD='original-earned-dual-technique-v1';
const NAMES=['Basic Coordination','Energy Recognition','Energy Synchronisation',
 'Resonant Circulation','Shared Technique Development','Combined Manifestation',
 'Beast-Aspect Integration','Dual-State Combat','Symbiotic Evolution',
 'Unique Partnership Transcendence'];
const special={2:'energy-perception',4:'compatible-resonance-medium',
 7:'safe-soul-stability',9:'genuine-mutual-evolution',10:'unique-earned-event'};
const integer=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b;
const prose=(x,a=12,b=900)=>typeof x==='string'&&x.trim().length>=a&&x.trim().length<=b;
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{2,75}$/.test(x);
function fields(p,names){
 return p&&typeof p==='object'&&!Array.isArray(p)&&
  Object.keys(p).every(x=>names.includes(x));
}
function pair(s,id,{here=false}={}){
 const b=s.beasts?.[id],r=s.table?.bondRecords?.[id];
 if(!b||!r||!s.player.partnerIds?.includes(id)||
  !['mutual partner','reciprocal partner'].includes(b.relationship)||
  b.consent!==true||r.fractured||r.beast!==b.name||r.sapience!==b.sapience)
  throw Error('Synchronisation needs one existing willing reciprocal partner and real bond ledger');
 if(here&&(s.battle||b.away===true||
  (b.location&&b.location!==s.world.location)||
  /hostile|terrified|panicked|fleeing/i.test(String(b.mood))||
  !b.needs||!integer(b.needs.hunger,0,100)||!integer(b.needs.fatigue,0,100)||
  !integer(b.condition,0,100)||b.condition<60||
  b.needs.hunger>=70||b.needs.fatigue>=70||
  b.injuries?.length||b.conditions?.length))
  throw Error('Both individuals need genuine local presence, physical welfare and freedom to practise');
 return {b,r};
}
function foundation(s,b,r){
 return {source:SOURCE,beastId:b.id,species:b.species,
  name:b.name,human:s.player.name,sapience:b.sapience,
  bondHash:hash({human:r.human,beast:r.beast,sapience:r.sapience,
   compatibility:r.compatibility,resonance:r.resonance,
   personality:r.personality}),created:s.world.minutes};
}
function verify(s,b,r){
 const l=r?.syncPractice;if(!l)return true;
 const x=foundation(s,b,r);
 if(l.sourceHash!==hash(l.source)||l.source.source!==SOURCE||
  l.source.beastId!==x.beastId||l.source.species!==x.species||
  l.source.name!==x.name||l.source.human!==x.human||
  l.source.bondHash!==x.bondHash||l.source.sapience!==x.sapience||
  !Array.isArray(l.history)||!l.methods||typeof l.methods!=='object'||
  !integer(r.syncStage,0,10)||!integer(r.syncPoints,0,1000000)||
  !integer(r.syncMasteryPoints??0,0,1000000))
  return false;
 let previous=l.archive?.head||l.sourceHash,
  minute=l.archive?.minute??l.source.created;
 if(!integer(minute,l.source.created))return false;
 for(const e of l.history){
  const v=e?.source;
  if(!v||v.source!==SOURCE||v.beastId!==b.id||
   v.previous!==previous||e.seal!==hash(v)||
   !integer(v.minute,minute)||!['exercise','stage','refinement','design','demonstration'].includes(v.kind))
   return false;
  if(v.kind==='exercise'){
   if(!integer(v.target,1,10)||!v.witness||
    hash(v.witness)!==v.witnessHash||
    v.witness.details?.origin!==SCENE||
    v.witness.details?.beastId!==b.id||
    v.witness.details?.targetStage!==v.target||
    !['accepted','declined'].includes(v.decision)||
    !integer(v.humanCost,1,20)||!integer(v.fatigueCost,1,20)||
    !integer(v.energyCost,0,20)||
    (v.decision==='declined'&&
     (v.roll!==null||v.points!==0||v.energyCost!==0||
      v.feedback!==null||v.checkEvent!==null))||
    (v.decision==='accepted'&&
     (!v.checkEvent||hash(v.checkEvent)!==v.checkHash||
      v.checkEvent.type!=='roll'||v.checkEvent.details?.roll!==v.roll||
      !integer(v.roll,1,20)||
      v.checkEvent.details?.success!==(v.points>0)||
      v.points!==(v.checkEvent.details.success?v.checkEvent.details.progress:0)||
      (v.target<3&&v.feedback!==null)||
      (v.target>=3&&v.checkEvent.details.success&&v.feedback!==null)||
      (v.target>=3&&!v.checkEvent.details.success&&
       (!v.feedback||v.feedback.origin!=='actual-bounded-pair-feedback-v1'||
        !integer(v.feedback.humanStaminaLoss,0,2)||
        !integer(v.feedback.beastFatigueIncrease,0,2))))))
    return false;
  }
  if(v.kind==='stage'&&(!integer(v.stage,1,10)||!v.proof||
   hash(v.proof)!==v.proofHash||!integer(v.pointsSpent,1,100)))
   return false;
  if(v.kind==='refinement'&&(!integer(v.stage,1,10)||
   !['novice','stable','mastered'].includes(v.toState)||
   !integer(v.earned,1,3)))return false;
  if(v.kind==='design'&&(!id(v.methodId)||!v.method||hash(v.method)!==v.methodHash))
   return false;
  if(v.kind==='demonstration'&&(!id(v.methodId)||!v.witness||
    hash(v.witness)!==v.witnessHash||!integer(v.humanCost,0,30)||
    !integer(v.beastEnergyCost,0,30)||
    (v.refused===true&&(v.humanCost!==0||v.beastEnergyCost!==0))))return false;
  previous=e.seal;minute=v.minute;
 }
 if(l.head!==previous)return false;
 for(const [key,m] of Object.entries(l.methods)){
  if(!id(key)||m.id!==key||m.seal!==hash(m.source)||
   m.source.source!==METHOD||m.source.beastId!==b.id||
   m.source.methodId!==key||!integer(m.attempts)||!integer(m.successes)||
   m.successes>m.attempts)return false;
 }
 return true;
}
function ensure(s,b,r){
 if(!r.syncPractice){
  const source=foundation(s,b,r);
  r.syncPractice={source,sourceHash:hash(source),head:hash(source),
   archive:null,history:[],methods:{}};
 }
 if(!verify(s,b,r))throw Error('Original pair identity or earned sync proof was changed');
 return r.syncPractice;
}
function append(s,b,r,kind,detail){
 const l=ensure(s,b,r),source={source:SOURCE,beastId:b.id,minute:s.world.minutes,
  kind,...detail,previous:l.head},e={source,seal:hash(source)};
 l.history.push(e);l.head=e.seal;
 if(l.history.length>250){
  const retired=l.history.splice(0,90).at(-1);
  l.archive={head:retired.seal,minute:retired.source.minute};
 }
 if(!verify(s,b,r))throw Error('Earned pair receipt did not survive source verification');
 return e;
}
function witnessed(s,b,index,target,type=SCENE){
 if(!integer(index,0,s.log.length-1))
  throw Error('An actual previously witnessed pairwork scene is required');
 const e=s.log[index],d=e?.details;
 if(e.type!=='story'||d?.origin!==type||d.beastId!==b.id||
  d.location!==s.world.location||
  (type===SCENE&&d.targetStage!==target)||
  !prose(e.text)||!prose(d.humanAction)||!prose(d.beastAction)||
  !prose(d.safety))
  throw Error('Both actual participants and specific safe local joint activity must be witnessed');
 return {event:e,digest:hash(e)};
}
function choice(s,b,r,sceneHash){
 const agency=Agency.evaluate(s,b,r,'sync_practice');
 if(!agency.possible)return {yes:false,basis:'observed-individual-boundary'};
 if(b.sapience>=3){
  const c=b.contractConsentEvidence;
  if(!b.sapientLife||!Sapient.verify(b)||!c?.beastWilling||
   !c.informedConsent||c.beastId!==b.id)
   throw Error('Sapient partner requires real independent personhood and informed consent');
  const x=Sapient._debug.draw(b.sapientLife);
  return {yes:x<Math.min(.9,.26+r.willingness/180),
   basis:'separate-sapient-person-choice'};
 }
 if(b.sapience===2){
  const c=b.contractConsentEvidence;
  if(!c?.beastWilling||!c.guardianConsent||c.beastId!==b.id)
   throw Error('Protected Mind needs independent preference and guardian consent');
 }
 const disposition=Agency.profile(s,b).disposition;
 const n=Crypto.createHash('sha256').update(String(s.seed)+'|'+b.id+
  '|'+sceneHash+'|pair-choice').digest().readUInt32BE(0)/4294967296;
 const threshold=Math.min(.9,Math.max(.18,r.willingness/150+
  (disposition==='independent'?-.16:disposition==='reserved'?-.08:.10)));
 return {yes:n<threshold,basis:'individually-consistent-animal-choice'};
}
function validMedium(s,b){
 const m=b.resonanceMediumAssessment;
 if(!m)return false;
 if(m.origin!=='verified-specific-compatible-pair-medium-v1'||
  m.beastId!==b.id||m.species!==b.species||
  m.location!==s.world.location||
  !integer(m.minute,0,s.world.minutes)||
  !prose(m.source,24,900)||!integer(m.witnessIndex,0,s.log.length-1))
  throw Error('Alternate resonance medium has no original source-verified physical presence');
 const ev=s.log[m.witnessIndex];
 if(hash(ev)!==m.witnessHash||ev?.type!=='story'||
  ev.details?.origin!=='original-source-verified-pair-medium-v1'||
  ev.details?.beastId!==b.id||ev.details?.location!==m.location)
  throw Error('Alternate resonance medium is not present in the original witnessed source');
 return true;
}
function breakthrough(s,b,r,target){
 const tag=special[target];
 if(!tag)return {ready:true,proof:null};
 const event=[...s.log].reverse().find(x=>x.type==='story'&&
  x.details?.origin===PROOF&&x.details.beastId===b.id&&
  x.details.stage===target&&x.details.kind===tag&&
  x.details.location===s.world.location&&prose(x.details.basis,24,900));
 if(!event)return {ready:false,reason:'No witnessed '+tag+' in this original pair'};
 if(target===4&&!r.contract&&!validMedium(s,b))
  return {ready:false,reason:'No actual compatible bond or documented resonance medium'};
 if(target===7&&(!integer(s.player.soul?.stability,0,100)||
  s.player.soul.stability<65))
  return {ready:false,reason:'Human Soul Stability is insufficient for safe aspect feedback'};
 if(target===9&&(!b.evolutionHistory?.length||!(s.player.humanEvolution?.stage>0)))
  return {ready:false,reason:'No individually earned biological evolution supports the joint event'};
 if(target===10&&!Object.keys(r.syncPractice?.methods||{}).length)
  return {ready:false,reason:'An exceptional bond needs a genuinely designed unique shared method'};
 return {ready:true,proof:event};
}
function train(s,p={}){
 if(!fields(p,['beastId','witnessIndex','focus'])||typeof p.beastId!=='string')
  throw Error('Pair practice accepts only an existing partner and witnessed scene, never selected rolls or consent');
 const {b,r}=pair(s,p.beastId,{here:true});
 const current=r.syncStage||0,focus=p.focus||'advance';
 if(!['advance','refine'].includes(focus)||focus==='refine'&&current===0||
   focus==='advance'&&current===10)
  throw Error('Practise a real subsequent stage, or refine the already earned current stage');
 const target=focus==='refine'?current:current+1,
  proof=witnessed(s,b,p.witnessIndex,target),life=r.syncPractice;
 if(life&&!verify(s,b,r))
  throw Error('Previously earned pair evidence was altered');
 if(life?.history.some(x=>x.source.kind==='exercise'&&x.source.witnessHash===proof.digest))
  throw Error('One witnessed attempt cannot be rolled again');
 const humanCost=2+target,fatigueCost=2+Math.ceil(target/2),
  energyCost=target>=3?Math.ceil(target/2):0;
 if(!integer(s.player.stamina,humanCost,100000)||
  b.needs.fatigue+fatigueCost>95||
  (energyCost&&(!integer(b.energy,energyCost,100000))))
  throw Error('Both individuals must have sufficient real exertion and energy for pairwork');
 if(target>=3&&!r.contract&&!validMedium(s,b))
  throw Error('Energy synchronisation requires a real mutual contract or documented compatible medium');
 const decision=choice(s,b,r,proof.digest),started=s.world.minutes;
 s.player.stamina-=humanCost;b.needs.fatigue+=fatigueCost;
 if(decision.yes&&energyCost)b.energy-=energyCost;
 const minutes=25+5*target;
 E.advance(s,minutes);require('./world').finalizeTime(s,started);
 if(!decision.yes){
  append(s,b,r,'exercise',{target,witness:structuredClone(proof.event),
   witnessHash:proof.digest,decision:'declined',choiceBasis:decision.basis,
   humanCost,fatigueCost,energyCost:0,roll:null,
   checkEvent:null,feedback:null,points:0,minutes});
  return {practised:false,beastDeclined:true,noRoll:true,
   humanStaminaSpent:humanCost,beastFatigueIncreased:fatigueCost,
   beastEnergySpent:0,minutes};
 }
 const dex=C.int(s.player.attributes.dex,'Dexterity',1,30),
  rank=C.int(s.player.skills?.beastcraft?.rank??0,'Beastcraft',0,5);
 const modifier=Math.floor((dex-10)/2)+2*rank+
  Math.floor((r.coordination||0)/35);
 const check=C.check(s,{modifier,dc:11+2*target,
  label:'Independent pairwork '+NAMES[target-1]});
 const checkEvent=structuredClone(s.log.at(-1));
 const checkHash=hash(checkEvent);
 const points=check.success?C.progress(check.degree):0;
 // Real failed shared energy work causes bounded physical strain.
 // Do not invent wounds or permanent soul damage without medical proof.
 let feedback=null;
 if(!check.success&&target>=3){
  const penalty=check.degree==='severe failure'?2:1;
  const humanStaminaLoss=Math.min(penalty,s.player.stamina);
  const beastFatigueIncrease=Math.min(penalty,100-b.needs.fatigue);
  s.player.stamina-=humanStaminaLoss;
  b.needs.fatigue+=beastFatigueIncrease;
  feedback={origin:'actual-bounded-pair-feedback-v1',
   humanStaminaLoss,beastFatigueIncrease,
   reason:'Failed joint energy flow strains both bodies without inventing an injury'};
 }
 if(focus==='advance')r.syncPoints=Math.min(1000000,r.syncPoints+points);
 else r.syncMasteryPoints=Math.min(1000000,(r.syncMasteryPoints||0)+points);
 append(s,b,r,'exercise',{target,witness:structuredClone(proof.event),
  witnessHash:proof.digest,decision:'accepted',choiceBasis:decision.basis,focus,
  humanCost,fatigueCost,energyCost,roll:check.roll,
  checkEvent,checkHash,feedback,points,minutes});
 const readiness=Bonds.syncReadiness(r,target);
 // Canonical Stage 9/10 have no numerical threshold: the original bond
 // deliberately requires a personally witnessed exceptional milestone.
 // They still spend actual earned experience from this pair's practice.
 const exceptional=readiness.trainingPoints===null;
 const promotionCost=exceptional?r.syncPoints:readiness.trainingPoints;
 let promoted=false,missingSource=null;
 if(focus==='refine'&&points){
  const previous=r.syncState||'novice',earned=r.syncMasteryPoints;
  if(earned>=14)r.syncState='mastered';
  else if(earned>=6)r.syncState='stable';
  if(previous!==r.syncState)
   append(s,b,r,'refinement',{stage:current,fromState:previous,
    toState:r.syncState,earned:points,sceneHash:proof.digest});
 }
 if(focus==='advance'&&check.success&&readiness.numericReady&&
  Number.isInteger(promotionCost)&&promotionCost>0&&
  r.syncPoints>=promotionCost){
  const milestone=breakthrough(s,b,r,target);
  if(milestone.ready){
   r.syncStage=target;r.syncState='novice';r.syncMasteryPoints=0;
   r.syncPoints-=promotionCost;b.syncStage=target;
   const evidence=milestone.proof||proof.event;
   append(s,b,r,'stage',{stage:target,pointsSpent:promotionCost,
    proof:structuredClone(evidence),proofHash:hash(evidence),
    sceneHash:proof.digest});
   promoted=true;
  }else missingSource=milestone.reason;
 }
 return {practised:true,check,focus,pointsEarned:points,promoted,
  currentSyncStage:r.syncStage,stageName:NAMES[r.syncStage-1]||null,
  ...(missingSource?{missingSource}:{}),
  humanStaminaSpent:humanCost+(feedback?.humanStaminaLoss||0),
  beastFatigueIncreased:fatigueCost+(feedback?.beastFatigueIncrease||0),
  beastEnergySpent:energyCost,feedback,minutes,
  noHumanLevelOrAutomaticPower:true};
}
function design(s,p={}){
 if(!fields(p,['beastId','methodId','name','principle','limits',
  'humanTechniqueId','beastAbility','witnessIndex'])||
  !id(p.methodId)||!prose(p.name,3,140)||
  !prose(p.principle,20,900)||!prose(p.limits,20,900)||
  typeof p.humanTechniqueId!=='string'||typeof p.beastAbility!=='string')
  throw Error('Original pair design must include an earned real human technique and actual current beast anatomy');
 const {b,r}=pair(s,p.beastId,{here:true});
 if(r.syncStage<5)throw Error('Original shared method development requires truly earned sync Stage 5');
 const existing=r.syncPractice;
 if(existing&&!verify(s,b,r))
  throw Error('Original pair technique history was changed');
 if(existing?.methods[p.methodId])
  throw Error('This pair already recorded that named original method');
 const human=s.table?.meridianTechniques?.[p.humanTechniqueId]||
  s.table?.arcaneTechniques?.[p.humanTechniqueId];
 if(!human||human.techniqueId!==p.humanTechniqueId||!human.rollHash)
  throw Error('The specific human source technique has not genuinely been learned');
 if(human?.route==='independent')
  require('./self-taught-basic-techniques').profile(s,p.humanTechniqueId);
 else if(p.humanTechniqueId==='qi_strike')
  require('./meridian-qi-strike').attackProfile(s,p.humanTechniqueId);
 else if(p.humanTechniqueId==='arcane_spark')
  require('./arcane-spark').attackProfile(s,p.humanTechniqueId);
 else throw Error('No existing original earned-technique verifier can authenticate this shared design');
 if(!human||human.techniqueId!==p.humanTechniqueId||!human.rollHash)
  throw Error('The specific human source technique has not genuinely been learned');
 const ability=E.SPECIES[b.species]?.ability;
 if(!ability||p.beastAbility!==ability.name||
  !prose(String(ability.effect||''),3,300))
  throw Error('The current species has no verified corresponding innate ability');
 const witness=witnessed(s,b,p.witnessIndex,5);
 if(Object.values(existing?.methods||{}).some(m=>m.source.witnessHash===witness.digest))
  throw Error('One pairwork scene cannot invent multiple original methods');
 const life=ensure(s,b,r);
 const source={source:METHOD,beastId:b.id,methodId:p.methodId,
  name:p.name.trim(),principle:p.principle.trim(),limits:p.limits.trim(),
  species:b.species,humanTechniqueId:p.humanTechniqueId,
  humanHash:hash(human),beastAbility:p.beastAbility,abilityHash:hash(ability),
  witness:structuredClone(witness.event),witnessHash:witness.digest,
  created:s.world.minutes,
  usableScope:'non-combat limited demonstration only, no damage or technique copying'};
 life.methods[p.methodId]={id:p.methodId,source,seal:hash(source),
  attempts:0,successes:0};
 append(s,b,r,'design',{methodId:p.methodId,method:structuredClone(source),
  methodHash:hash(source)});
 return {designed:true,methodId:p.methodId,noUnlearnedPowerOrCombatBonus:true};
}
function demonstration(s,p={}){
 if(!fields(p,['beastId','methodId','witnessIndex'])||
  typeof p.beastId!=='string')throw Error('A real designed shared method and witnessed demonstration are required');
 const {b,r}=pair(s,p.beastId,{here:true}),life=ensure(s,b,r),
  m=life.methods[p.methodId];
 if(!m||r.syncStage<5)throw Error('No truly learned individual pair design exists');
 const human=s.table?.meridianTechniques?.[m.source.humanTechniqueId]||
  s.table?.arcaneTechniques?.[m.source.humanTechniqueId];
 if(!human||human.techniqueId!==m.source.humanTechniqueId)
  throw Error('Underlying earned human method is no longer recorded');
 if(human?.route==='independent')
  require('./self-taught-basic-techniques').profile(s,m.source.humanTechniqueId);
 else if(m.source.humanTechniqueId==='qi_strike')
  require('./meridian-qi-strike').attackProfile(s,m.source.humanTechniqueId);
 else if(m.source.humanTechniqueId==='arcane_spark')
  require('./arcane-spark').attackProfile(s,m.source.humanTechniqueId);
 else throw Error('The designed original technique lacks a current earned source verifier');
 if(!human||hash(human)!==m.source.humanHash||
  hash(E.SPECIES[b.species]?.ability)!==m.source.abilityHash)
  throw Error('Original earned human or beast capability changed');
 const witness=witnessed(s,b,p.witnessIndex,5,METHOD);
 if(witness.event.details?.methodId!==m.id||
  witness.event.details?.methodHash!==m.seal)
  throw Error('Witnessed demonstration is not this original shared method');
 if(life.history.some(x=>x.source.kind==='demonstration'&&
  x.source.witnessHash===witness.digest))
  throw Error('This particular pair demonstration already received its only roll');
 if(!integer(s.player.stamina,4,100000)||
  !integer(b.energy,3,100000)||b.needs.fatigue>90)
  throw Error('Separate human and beast resources are required for manifestation');
 const consent=choice(s,b,r,witness.digest);
 if(!consent.yes){
  const before=s.world.minutes;
  E.advance(s,10);require('./world').finalizeTime(s,before);
  append(s,b,r,'demonstration',{methodId:m.id,
   witness:structuredClone(witness.event),witnessHash:witness.digest,
   humanCost:0,beastEnergyCost:0,refused:true,checkHash:null});
  return {demonstrated:false,beastDeclined:true,noRoll:true,
   minutes:10,noResourceOrPowerGrant:true};
 }
 const before=s.world.minutes;
 s.player.stamina-=4;b.energy-=3;b.needs.fatigue+=2;
 E.advance(s,15);require('./world').finalizeTime(s,before);
 const modifier=Math.floor((s.player.attributes.dex-10)/2)+
  2*(s.player.skills?.beastcraft?.rank||0)+Math.floor(r.coordination/35);
 const check=C.check(s,{modifier,dc:18,label:'Limited source-earned dual method demonstration'});
 m.attempts++;if(check.success)m.successes++;
 append(s,b,r,'demonstration',{methodId:m.id,
  witness:structuredClone(witness.event),witnessHash:witness.digest,
  humanCost:4,beastEnergyCost:3,checkHash:hash(s.log.at(-1)),
  success:check.success});
 return {demonstrated:true,worked:check.success,check,
  staminaSpent:4,beastEnergySpent:3,beastFatigueIncreased:2,minutes:15,
  limitedEffect:'Physical pair coordination only; no new damage, healing, copying or supernatural effect'};
}
function status(s,p={}){
 if(!fields(p,['beastId'])||typeof p.beastId!=='string')
  throw Error('Pair synchronisation view needs only a currently established partner');
 const b=s.beasts?.[p.beastId],r=s.table?.bondRecords?.[p.beastId];
 if(!b||!r||!s.player.partnerIds?.includes(p.beastId))return {known:false};
 if(!verify(s,b,r))throw Error('Source-backed pair records were altered');
 const current=r.syncStage||0,target=Math.min(10,current+1),
  ready=Bonds.syncReadiness(r,target);
 return {known:true,beast:b.name,stage:current,stageName:current?NAMES[current-1]:null,
  state:r.syncState||null,earnedMasteryPoints:r.syncMasteryPoints||0,targetStage:target,
  targetName:NAMES[target-1],earnedPoints:r.syncPoints||0,
  requiredPoints:ready.trainingPoints,
  numericReady:ready.numericReady,missing:ready.missing,
  specialEvidence:ready.extraRequirement,
  methods:Object.values(r.syncPractice?.methods||{}).map(m=>({
   methodId:m.id,name:m.source.name,limits:m.source.limits,
   witnessedSuccesses:m.successes})),
  note:'Original pair stage only; not human Level, beast Level, magical ownership or guaranteed shared powers'};
}
module.exports={SOURCE,SCENE,PROOF,METHOD,train,design,demonstration,status,verify};
