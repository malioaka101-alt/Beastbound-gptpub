'use strict';
// #177 — autonomous, source-earned Phase II Soul Threading. The PC source
// owner remains rules/soul-threading.js. An actual independent person with
// earned Soul Perception may strengthen THEIR OWN mind/body/resonance links
// using the exact original Soul/Stamina/DC/check/wound mechanics. No
// thought-reading, learned art, spiritual bond, world-clock duplication,
// chosen result or claimed occupation can create a Soul phase.
const Crypto=require('node:crypto'),
 Core=require('./core'),Combat=require('./combat'),Build=require('./build'),
 Early=require('./independent-original-discipline-preparation'),
 Law=require('./soul-shared-original-threading');
const ORIGIN='source-earned-independent-original-soul-threading-phase-two-v1',
 NIGHT='source-earned-independent-original-soul-night-recovery-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const freshLinks=()=>({mind:0,body:0,resonance:0});
const originalFirst=p=>p?.originalFirstPowerMilestones?.soul;
function foundation(p){
 const one=originalFirst(p);
 if(one?.kind!=='soul-phase-one'||one.phase!==1||
  !/^[a-f0-9]{64}$/.test(one.originalSourceHash||'')||
  !p?.mechanicalFoundation?.seal)return null;
 const will=Math.floor((p.mechanicalFoundation.baselineAttributes.wis-10)/2),
  expected=Build.soulProfile(1,{will});
 if(one.soulReserve!==expected.soulReserve||
  one.maxSoulReserve!==expected.soulReserve||
  one.perceptionRangeMetres!==expected.perceptionRangeMetres)return null;
 return {hash:one.originalSourceHash,will,initialReserve:expected.soulReserve};
}
// Initial individual Soul stability follows the original human player
// foundation stability (95) before real private Soul backlash receipts.
// It is not an earned Phase II grant or a player's hidden Soul technique.
const ORIGINAL_HUMAN_SOUL_STABILITY=95;
const chance=Early.chance;
function verify(s,p){
 const r=p?.originalSoulThreadTwo;
 if(r===undefined)return true;
 const base=foundation(p);
 if(!base||!Early.verify(s,p)||!r||r.origin!==ORIGIN||
  r.originalSoulPerceptionSourceHash!==base.hash||
  !Array.isArray(r.sessions)||r.sessions.length>480||
  !r.links||!Law.LINKS.every(k=>Number.isInteger(r.links[k])&&r.links[k]>=0&&r.links[k]<=2))
  return false;
 const combat=s.table?.combatants?.['npc_'+p.id];
 if(!combat?.npcOrigin?.seal)return false;
 const Offscreen=require('../world/independent-original-power-days');
 let reserve=base.initialReserve,maximum=base.initialReserve,
  stability=ORIGINAL_HUMAN_SOUL_STABILITY,links=freshLinks(),
  integrated=false,completed=false,integrity=null,
  lastDay=-1,lastEnd=0;
 const nights=new Set();
 for(const row of r.sessions){
  const q=row?.source;
  if(q?.origin===NIGHT){
   const original=q.originalNight,capacity=maximum;
   if(row.seal!==hash(q)||!original||
    q.actorId!==p.actorId||q.system!=='soul'||
    q.originalSoulPerceptionSourceHash!==base.hash||
    nights.has(original.seal)||
    q.originalNightSourceHash!==original.seal||
    q.endMinute!==original.source?.endMinute||
    q.endMinute<=lastEnd||q.endMinute>s.world.minutes||
    !Offscreen.verifyNights(s,p,[original])||
    q.reserveBefore!==reserve||q.reserveCapacity!==capacity||
    q.reserveAfter!==Math.min(capacity,reserve+3)||
    q.noFreeSpiritualReserveOrAdditionalDay!==true)return false;
   nights.add(original.seal);
   reserve=q.reserveAfter;lastEnd=q.endMinute;
   continue;
  }
  if(!q||row.seal!==hash(q)||completed||
   q.origin!==ORIGIN||q.actorId!==p.actorId||
   q.system!=='soul'||q.target!=='phase2-threading'||
   q.individualOriginHash!==p.originHash||
   q.originalFoundationSeal!==p.mechanicalFoundation.seal||
   q.originalCombatEntrySeal!==combat.npcOrigin.seal||
   q.originalSoulPerceptionSourceHash!==base.hash||
   q.noThoughtReadingSoulArtOrForcedBond!==true||
   !Number.isInteger(q.day)||q.day<=lastDay||
   q.startMinute!==q.day*1440+600||
   q.startMinute<lastEnd||
   q.startMinute+q.actualMinutes>s.world.minutes||
   !Offscreen.verifyEvidence(s,p,q)||
   q.reserveBefore!==reserve||q.maxReserveBefore!==maximum||
   q.stabilityBefore!==stability||
   JSON.stringify(q.linksBefore)!==JSON.stringify(links)||
   q.integratedBefore!==integrated||
   !Number.isInteger(q.rngBefore)||q.rngBefore<1||
   !['curious','steady','independent','reserved'].includes(q.personalityAtDecision)||
   !Number.isInteger(q.fatigueAtDecision)||
   q.fatigueAtDecision<0||q.fatigueAtDecision>100||
   q.choiceChance!==chance({personality:q.personalityAtDecision,
    fatigue:q.fatigueAtDecision})||
   !Array.isArray(q.woundsBefore)||q.woundsBefore.length!==3||
   !Array.isArray(q.woundsAfter)||q.woundsAfter.length!==3||
   q.woundsBefore.some(x=>x!==0)||
   !Number.isInteger(q.staminaBefore)||q.staminaBefore<1||
   !Number.isInteger(q.maxStaminaAtAttempt)||
   q.maxStaminaAtAttempt<q.staminaBefore)
   return false;
  const roller={rngState:q.rngBefore};
  if(q.choiceD100!==Core.die(roller,100)||
   q.accepted!==(q.choiceD100<=q.choiceChance))return false;
  let earned=0,injury=false;
  if(!q.accepted){
   if(q.actualMinutes!==5||q.check!==null||
    q.focus!==null||q.earned!==0||q.reserveSpent!==0||
    q.staminaSpent!==0||q.staminaAfter!==q.staminaBefore||
    q.originalSoulBacklash!==false)return false;
  }else{
   if(q.actualMinutes!==120||reserve<Law.RESERVE_COST||
    q.staminaBefore<Law.staminaCost(120)||
    q.reserveSpent!==Law.RESERVE_COST||
    q.staminaSpent!==Law.staminaCost(120)||
    q.staminaAfter!==q.staminaBefore-Law.staminaCost(120)||
    !Law.FOCI.includes(q.focus)||!q.check)return false;
   const roll=Core.die(roller,20),
    modifier=base.will,margin=roll+modifier+
     Core.naturalAdjustment(roll)-Law.DC,
    degree=Core.degree(margin),success=margin>=0,
    result={degree,success},formed=Law.grow(links,integrated,q.focus,degree);
   earned=formed.earned;injury=degree==='severe failure';
   if(q.check.roll!==roll||q.check.modifier!==modifier||
    q.check.dc!==Law.DC||q.check.degree!==degree||
    q.check.success!==success||q.check.margin!==margin||
    q.earned!==earned||q.originalSoulBacklash!==injury)return false;
   reserve-=Law.RESERVE_COST;
   stability=Law.stabilityAfter(stability,result);
   links=formed.links;integrated=formed.integrated;
   if(Law.formed(links,integrated)){
    completed=true;integrity=Law.integrity(margin);
    maximum=Build.soulProfile(2,{will:base.will}).soulReserve;
   }
  }
  if(JSON.stringify(q.woundsAfter)!==JSON.stringify(injury?[1,0,0]:[0,0,0])||
   q.reserveAfter!==reserve||q.maxReserveAfter!==maximum||
   q.stabilityAfter!==stability||
   JSON.stringify(q.linksAfter)!==JSON.stringify(links)||
   q.integratedAfter!==integrated||
   q.completedAfter!==completed||
   q.threadIntegrityAfter!==integrity||
   q.rngAfter!==roller.rngState)return false;
  lastDay=q.day;lastEnd=q.startMinute+q.actualMinutes;
 }
 return r.reserveRemaining===reserve&&r.maxReserve===maximum&&
  r.soulStability===stability&&
  JSON.stringify(r.links)===JSON.stringify(links)&&
  r.integrated===integrated&&r.completed===completed&&
  r.threadIntegrity===integrity&&r.lastAttemptDay===lastDay;
}
function ensureLedger(s,p){
 const base=foundation(p);
 if(!base||!Early.verify(s,p))
  throw Error('Only a truly source-earned Soul Phase I can begin Threading');
 if(p.originalSoulThreadTwo!==undefined){
  if(!verify(s,p))throw Error('Existing Soul Threading source failed replay');
  return p.originalSoulThreadTwo;
 }
 const record={origin:ORIGIN,
  originalSoulPerceptionSourceHash:base.hash,
  sessions:[],reserveRemaining:base.initialReserve,
  maxReserve:base.initialReserve,
  soulStability:ORIGINAL_HUMAN_SOUL_STABILITY,
  links:freshLinks(),integrated:false,
  threadIntegrity:null,completed:false,lastAttemptDay:-1};
 p.originalSoulThreadTwo=record;
 if(!verify(s,p))throw Error('Original Soul Perception cannot initialise an unsupported Phase II ledger');
 return record;
}
function privateStatus(s,p){
 if(!Early.verify(s,p)||!verify(s,p))
  throw Error('Source-verified Soul Threading is required for GM-only evidence');
 const r=p.originalSoulThreadTwo;
 return {privateToGM:true,sourceOwner:'rules/soul-threading.js',
  verifiedSoulPhase:r?.completed?2:originalFirst(p)?.phase||0,
  mindBodyResonanceLinks:r?{...r.links}:null,
  integratedWorkWitnessed:r?.integrated||false,
  currentSoulReserve:r?.reserveRemaining??null,
  maxSoulReserve:r?.maxReserve??null,
  earnedThreadIntegrity:r?.threadIntegrity??null,
  soulStability:r?.soulStability??null,
  noMindReadingOrFreeSoulArt:true};
}
function safeCheck(s,params){
 const previous=s.log.slice();
 try{return Core.check(s,{...params,privateDisplay:true});}
 finally{s.log.splice(0,s.log.length,...previous);}
}
function afterDaily(s,ctx){
 const p=ctx.actor,body=ctx.body;
 if(!foundation(p)||!Early.verify(s,p)||!verify(s,p)||
  p.originalSoulThreadTwo?.completed||
  body.status!=='ok'||body.wounds.some(x=>x!==0)||
  body.stamina<Law.staminaCost(120))return null;
 const r=ensureLedger(s,p);
 if(r.sessions.length>=480||r.lastAttemptDay>=ctx.workDay||
  r.reserveRemaining<Law.RESERVE_COST||
  Object.values(p.originalEarlyDisciplinePreparation||{}).
   some(x=>x.lastAttemptDay>=ctx.workDay)||
  p.meridianTraining?.lastAttemptDay>=ctx.workDay)return null;
 const start=ctx.workDay*1440+600,before=p.rngState,
  chanceValue=chance(p),choiceD100=Core.die(p,100),
  accepted=choiceD100<=chanceValue,focus='integrated',
  reserveBefore=r.reserveRemaining,maximumBefore=r.maxReserve,
  stabilityBefore=r.soulStability,linksBefore={...r.links},
  integratedBefore=r.integrated,staminaBefore=body.stamina,
  originalWounds=[...body.wounds];
 let check=null,earned=0,injury=false;
 if(accepted){
  const modifier=Math.floor((p.mechanicalFoundation.baselineAttributes.wis-10)/2);
  const actual=safeCheck(s,{modifier,dc:Law.DC,
   label:'Private original Soul Phase II mind-body-resonance threading',
   independentRngOwner:p});
  check={roll:actual.roll,modifier:actual.modifier,dc:actual.dc,
   degree:actual.degree,success:actual.success,margin:actual.margin};
  earned=Law.gain(actual);
  r.reserveRemaining-=Law.RESERVE_COST;
  body.stamina-=Law.staminaCost(120);
  r.soulStability=Law.stabilityAfter(r.soulStability,actual);
  injury=actual.degree==='severe failure';
  if(injury)Combat.harm(s,body,2);
  const after=Law.grow(r.links,r.integrated,focus,actual.degree);
  r.links=after.links;r.integrated=after.integrated;
  if(Law.formed(r.links,r.integrated)){
   const will=modifier;
   r.completed=true;r.threadIntegrity=Law.integrity(actual.margin);
   r.maxReserve=Build.soulProfile(2,{will}).soulReserve;
  }
 }
 const Offscreen=require('../world/independent-original-power-days');
 const source={origin:ORIGIN,actorId:p.actorId,system:'soul',
  target:'phase2-threading',individualOriginHash:p.originHash,
  originalFoundationSeal:p.mechanicalFoundation.seal,
  originalCombatEntrySeal:body.npcOrigin.seal,
  originalSoulPerceptionSourceHash:r.originalSoulPerceptionSourceHash,
  offscreenOpportunity:Offscreen.opportunityEvidence(ctx,'soul'),
  day:ctx.workDay,startMinute:start,actualMinutes:accepted?120:5,
  rngBefore:before,rngAfter:p.rngState,
  personalityAtDecision:p.personality,fatigueAtDecision:p.fatigue,
  choiceD100,choiceChance:chanceValue,accepted,
  focus:accepted?focus:null,check,earned,
  reserveBefore,reserveSpent:accepted?Law.RESERVE_COST:0,
  reserveAfter:r.reserveRemaining,
  maxReserveBefore:maximumBefore,maxReserveAfter:r.maxReserve,
  stabilityBefore,stabilityAfter:r.soulStability,
  linksBefore,linksAfter:{...r.links},
  integratedBefore,integratedAfter:r.integrated,
  staminaBefore,staminaSpent:accepted?Law.staminaCost(120):0,
  staminaAfter:body.stamina,maxStaminaAtAttempt:body.maxStamina,
  woundsBefore:originalWounds,woundsAfter:[...body.wounds],
  originalSoulBacklash:injury,
  completedAfter:r.completed,threadIntegrityAfter:r.threadIntegrity,
  noThoughtReadingSoulArtOrForcedBond:true};
 r.sessions.push({source,seal:hash(source)});
 r.lastAttemptDay=ctx.workDay;
 if(!verify(s,p))throw Error('Independent original Soul Threading replay rejected result');
 return {kind:'soul-threading',target:'phase2',accepted,
  earnedThreadProgress:earned,links:{...r.links},
  formed:r.completed,originalSoulReserveSpent:accepted?Law.RESERVE_COST:0,
  originalBodyStaminaSpent:accepted?Law.staminaCost(120):0,
  sourceHash:hash(source),privateToGM:true,
  noAutomaticArtOrMindreading:true};
}
function afterNight(s,p,nightRow){
 if(!foundation(p)||p.originalSoulThreadTwo?.completed&&
  p.originalSoulLattice!==undefined)return null;
 const r=ensureLedger(s,p);
 const Offscreen=require('../world/independent-original-power-days');
 if(!nightRow||!Offscreen.verifyNights(s,p,[nightRow])||
  r.sessions.length>=480||
  r.sessions.some(x=>x.source?.origin===NIGHT&&
   x.source.originalNightSourceHash===nightRow.seal))
  return null;
 const before=r.reserveRemaining,
  after=Math.min(r.maxReserve,before+3),
  source={origin:NIGHT,actorId:p.actorId,system:'soul',
   originalSoulPerceptionSourceHash:r.originalSoulPerceptionSourceHash,
   originalNight:structuredClone(nightRow),
   originalNightSourceHash:nightRow.seal,
   endMinute:nightRow.source.endMinute,
   reserveBefore:before,reserveCapacity:r.maxReserve,
   reserveAfter:after,noFreeSpiritualReserveOrAdditionalDay:true};
 r.sessions.push({source,seal:hash(source)});
 r.reserveRemaining=after;
 if(!verify(s,p))throw Error('Actual Soul reserve night recovery failed source replay');
 return {originalSoulReserveRestored:after-before,
  independentOriginalSoulNight:true};
}
module.exports={ORIGIN,NIGHT,verify,ensureLedger,privateStatus,afterDaily,afterNight};
