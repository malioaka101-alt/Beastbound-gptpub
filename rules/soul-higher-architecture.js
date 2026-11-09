'use strict';
// Unified Master Prompt §22: the remaining soul phases are earned
// structures of the practitioner's own spirit, not spells, a licence to
// enslave sentient souls, a memory-reading shortcut, or resurrection.
const Crypto=require('node:crypto'),E=require('../engine.js'),C=require('./core'),
 Build=require('./build'),Lattice=require('./soul-resonance-lattice'),
 Places=require('../world/lived-places'),W=require('./world'),
 U=require('./unified'),Combat=require('./combat');
const ORIGIN='source-earned-higher-soul-identity-architecture-v1',
 MAP='witnessed-unique-higher-soul-structure-v1',
 PRACTICE='witnessed-safe-higher-soul-repetition-v1',
 TEST='witnessed-independent-higher-soul-identity-countertest-v1',
 REPAIR='witnessed-actual-higher-soul-structural-repair-v1';
const SPEC=Object.freeze({
 4:{name:'Soul Forge',kind:'forge',dc:20,cost:3,
  sources:['nonSentientMatrix','vesselCompatibility'],
  basis:'A witnessed non-sentient compatible spiritual matrix; no seized sentient spirit or invented artificial soul'},
 5:{name:'Inner Sanctuary',kind:'sanctuary',dc:21,cost:4,
  sources:['internalBoundary','identityCountertest'],
  basis:'A personally witnessed interior soul boundary and controlled identity integrity, not permission to copy another memory'},
 6:{name:'Soul Domain',kind:'domain',dc:22,cost:5,
  sources:['measuredRange','independentResistance'],
  basis:'A bounded and contestable personal spiritual field, not territory ownership or default telepathy'},
 7:{name:'Living Soul Architecture',kind:'living',dc:23,cost:6,
  sources:['sustainedFeedback','maintenanceFailure'],
  basis:'An individually observed connected living soul structure with real maintenance and failure thresholds, not resurrection'}
});
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const integer=(x,lo=0,hi=1000000000)=>Number.isInteger(x)&&x>=lo&&x<=hi;
const phrase=(x,lo=12,hi=900)=>typeof x==='string'&&x.trim().length>=lo&&x.trim().length<=hi;
const accepts=(p,allowed)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(k=>allowed.includes(k));
function spec(stage){if(!integer(stage,4,7))throw Error('Only the source-established IV–VII Soul architectures can be studied here');return SPEC[stage];}
function profile(s,stage){
 return Build.soulProfile(stage,{
  will:Math.floor(((s.player.attributes?.wis??10)-10)/2)});
}
function sourceEvent(s,index,origin,stage){
 if(!integer(index,0,s.log.length-1))
  throw Error('An original previously witnessed spiritual scene is required');
 const event=s.log[index],details=event?.details;
 if(event?.type!=='story'||details?.origin!==origin||
  details.phase!==stage||details.location!==s.world.location||
  !phrase(event.text,16,900))
  throw Error('The living individual spiritual structure has no witnessed current local source');
 return structuredClone(event);
}
function precedingSeal(s,stage){
 if(stage===4){
  if(!Lattice.verify(s))throw Error('The actual Phase III personal Soul Lattice evidence was altered');
  const t=s.table?.soulArchitecture?.lattice?.transitions?.find(x=>x.source?.formed);
  if(!t)throw Error('An original completed Soul Resonance Lattice must precede Soul Forge');
  return t.seal;
 }
 const prior=s.table?.soulArchitecture?.higher?.records?.[stage-1];
 if(!prior?.transition?.source?.formed||!verify(s))
  throw Error('The prior Soul Phase is not originally earned and source-verified');
 return prior.transition.seal;
}
function verify(s){
 const soul=s.player?.soul,h=s.table?.soulArchitecture?.higher;
 if(!h)return (soul?.phase||0)<4;
 if(!Lattice.verify(s)||h.origin!==ORIGIN||!h.records||
  typeof h.records!=='object'||Array.isArray(h.records))
  return false;
 let expectedPredecessor=s.table?.soulArchitecture?.lattice?.
  transitions?.find(x=>x.source?.formed)?.seal;
 if(!expectedPredecessor)return false;
 let maxFormed=3;
 for(let stage=4;stage<=7;stage++){
  const rec=h.records[stage];
  if(!rec)continue;
  const x=rec?.source,settings=SPEC[stage];
  if(stage>maxFormed+1||rec.origin!==ORIGIN||
   !x||rec.seal!==digest(x)||x.origin!==ORIGIN||
   x.phase!==stage||x.kind!==settings.kind||
   x.predecessor!==expectedPredecessor||
   !integer(x.minute,0,s.world.minutes)||
   !phrase(x.design,28,900)||!phrase(x.identityBoundary,25,900)||
   !phrase(x.ethicalLimit,25,900)||!phrase(x.interference,25,900)||
   !phrase(x.repairMethod,25,900)||
   !x.witness||x.witnessHash!==digest(x.witness)||
   x.witness.details?.origin!==MAP||
   x.witness.details?.phase!==stage||
   x.witness.details?.kind!==settings.kind||
   !settings.sources.every(k=>phrase(x.witness.details?.[k],25,900))||
   !Array.isArray(rec.attempts)||!Array.isArray(rec.repairs)||
   !Array.isArray(rec.tests)||!integer(rec.points,0,6)||
   !integer(rec.strain,0,100))
   return false;
  if(stage===4&&x.witness.details.nonSentient!==true)return false;
  if(stage===6&&(!integer(x.witness.details.measuredRangeMetres,1,100000)||
    x.measuredRangeMetres!==x.witness.details.measuredRangeMetres))
   return false;
  if(stage===7&&!phrase(x.witness.details?.selfMaintenance,25,900))
   return false;
  let points=0,strain=0,success=null,last=x.minute;
  const seen=new Set(),steps=[
   ...rec.attempts.map(t=>({kind:'practice',t})),
   ...rec.repairs.map(t=>({kind:'repair',t})),
   ...rec.tests.map(t=>({kind:'test',t}))
  ].sort((a,b)=>a.t.source.minute-b.t.source.minute);
  for(const {kind,t} of steps){
   const a=t?.source;
   if(t?.origin!==ORIGIN||t.seal!==digest(a)||
    a?.origin!==ORIGIN||a.kind!==kind||a.phase!==stage||
    !integer(a.minute,last,s.world.minutes)||!integer(a.minutes,15,480)||
    !integer(a.reserveSpent,1,20)||!integer(a.staminaSpent,1,20)||
    !integer(a.roll,1,20)||a.check?.roll!==a.roll||
    !a.checkEvent||a.checkEventHash!==digest(a.checkEvent)||
    a.checkEvent.type!=='roll'||digest(a.checkEvent.details)!==digest(a.check)||
    !a.witness||a.witnessHash!==digest(a.witness)||
    a.witness.details?.origin!==
      (kind==='practice'?PRACTICE:kind==='repair'?REPAIR:TEST)||
    a.witness.details?.phase!==stage||
    seen.has(a.witnessHash))
    return false;
   seen.add(a.witnessHash);
   if(kind==='practice'){
    if(success||a.reserveSpent!==settings.cost||
     a.earned!==(a.check.success?a.check.progress:0)||
     a.points!==Math.min(6,points+a.earned)||
     a.strainAdded!==(a.check.degree==='severe failure'?3:0))
     return false;
    points=a.points;strain=Math.min(100,strain+a.strainAdded);
   }else if(kind==='repair'){
    if(a.reserveSpent!==2||a.strainBefore!==strain||
     a.strainAfter!==(a.check.success?Math.max(0,strain-2):strain))
     return false;
    strain=a.strainAfter;
   }else{
    if(a.pointsAtAttempt!==6||a.strainAtAttempt>2||
     a.reserveSpent!==settings.cost+3||
     a.formed!==a.check.success)
     return false;
    if(a.formed){
     if(success)return false;
     success=t;
     const cap=a.capacity,p=profile(s,stage);
     if(!cap||!integer(cap.oldReserve,a.reserveSpent,100000)||
      !integer(cap.oldMaxReserve,0,100000)||
      cap.newReserve!==cap.oldReserve-a.reserveSpent||
      cap.newMaxReserve!==Math.max(cap.oldMaxReserve,p.soulReserve)||
      cap.perceptionRange!==p.perceptionRangeMetres)
      return false;
    }else if(a.capacity!==null)return false;
   }
   last=a.minute+a.minutes;
  }
  if(rec.points!==points||rec.strain!==strain||
   !!rec.transition!==!!success||
   (rec.transition&&(rec.transition.seal!==success.seal||
    digest(rec.transition.source)!==digest(success.source))))
   return false;
  if(success){maxFormed=stage;expectedPredecessor=success.seal;}
 }
 if((soul?.phase||0)!==maxFormed)return false;
 if(soul.phase>=4){
  const p=profile(s,soul.phase),advanced=h.records[soul.phase];
  if(soul.maxReserve<advanced.transition.source.capacity.newMaxReserve||
   soul.perceptionRange!==p.perceptionRangeMetres||
   soul.higherSoulIdentity!==advanced.source.design)
   return false;
 }
 return true;
}
function prerequisite(s,phase,{care=false}={}){
 const current=spec(phase),soul=s.player?.soul;
 if(!soul||soul.phase!==phase-1||
  !s.table?.soulArchitecture?.lattice||
  !Lattice.verify(s))
  throw Error('This distinct Soul structure requires genuinely earned preceding spiritual anatomy');
 const prev=precedingSeal(s,phase);
 const site=Places.location(s);
 if(!site||s.battle||s.encounter||
  (s.table?.combatants?.player&&s.table.combatants.player.status!=='ok'))
  throw Error('A conscious person and an established safe location are required');
 if(!care&&soul.stability<40)
  throw Error('Dangerously unstable Soul structure must undergo actual protected recovery before proceeding');
 return {current,soul,prev,site};
}
function map(s,p={}){
 if(!accepts(p,['phase','design','identityBoundary','ethicalLimit','interference',
  'repairMethod','witnessIndex'])||!integer(p.phase,4,7)||
  !phrase(p.design,28,900)||!phrase(p.identityBoundary,25,900)||
  !phrase(p.ethicalLimit,25,900)||!phrase(p.interference,25,900)||
  !phrase(p.repairMethod,25,900))
  throw Error('An original Soul Phase needs a real self-structure, identity boundary, ethical limit and observed failure mode');
 const {current,prev}=prerequisite(s,p.phase);
 const root=s.table.soulArchitecture;
 if(root.higher?.records?.[p.phase])
  throw Error('An original personal Soul structure cannot be remapped to erase previous failure');
 const wit=sourceEvent(s,p.witnessIndex,MAP,p.phase);
 if(wit.details.kind!==current.kind||
  !current.sources.every(k=>phrase(wit.details[k],25,900))||
  !phrase(wit.details?.countertest,25,900)||
  (p.phase===4&&wit.details.nonSentient!==true)||
  (p.phase===6&&!integer(wit.details.measuredRangeMetres,1,100000))||
  (p.phase===7&&!phrase(wit.details.selfMaintenance,25,900)))
  throw Error('Real distinct original spiritual structure and independent safety countertest must be witnessed');
 const source={origin:ORIGIN,phase:p.phase,kind:current.kind,
  predecessor:prev,minute:s.world.minutes,
  design:p.design.trim(),identityBoundary:p.identityBoundary.trim(),
  ethicalLimit:p.ethicalLimit.trim(),interference:p.interference.trim(),
  repairMethod:p.repairMethod.trim(),
  ...(p.phase===6?{measuredRangeMetres:wit.details.measuredRangeMetres}:{}),
  witness:wit,witnessHash:digest(wit),noAutomaticExternalEffect:true};
 root.higher||={origin:ORIGIN,records:{}};
 root.higher.records[p.phase]={origin:ORIGIN,source,seal:digest(source),
  points:0,strain:0,attempts:[],repairs:[],tests:[],transition:null};
 return {mapped:true,phase:p.phase,name:current.name,notYetEarned:true,
  noSentientSoulOrOtherPersonControl:true};
}
function practice(s,p={}){
 if(!accepts(p,['phase','witnessIndex','minutes'])||
  !integer(p.phase,4,7)||!integer(p.minutes??60,15,480))
  throw Error('An individually witnessed Soul structure and physical work time are required');
 const {current,soul}=prerequisite(s,p.phase);
 const r=s.table?.soulArchitecture?.higher?.records?.[p.phase];
 if(!r||!verify(s))throw Error('Original higher Soul geometry or prior source is not verified');
 if(r.points>=6)throw Error('Earned Soul structure is ready for a new independent formation trial');
 if(r.strain>=5)throw Error('Unsafe spiritual interference requires source-backed repair');
 const wit=sourceEvent(s,p.witnessIndex,PRACTICE,p.phase);
 if(!phrase(wit.details?.observedResponse,25,900)||
  !phrase(wit.details?.independentBoundary,25,900))
  throw Error('A separately observed self-response and independent identity boundary are required');
 if(r.attempts.some(x=>x.source.witnessHash===digest(wit)))
  throw Error('The same individual spiritual exercise cannot be rerolled');
 const minutes=p.minutes??60,reserveSpent=current.cost,
  staminaSpent=Math.ceil(minutes/120)+1;
 if(!integer(soul.reserve,reserveSpent,100000)||
  !integer(s.player.stamina,staminaSpent,100000))
  throw Error('Existing Soul Reserve and Stamina cannot support this session');
 const before=s.world.minutes;
 soul.reserve-=reserveSpent;s.player.stamina-=staminaSpent;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
 const check=C.check(s,{modifier:Math.floor(((s.player.attributes.wis??10)-10)/2)+
  2*(s.player.skills?.cultivation?.rank||0)+Math.floor(soul.stability/30)-1,
  dc:current.dc,label:'Original Soul '+current.name+' structure practice'});
 const checkEvent=structuredClone(s.log.at(-1));
 const earned=check.success?check.progress:0,
  strainAdded=check.degree==='severe failure'?3:0;
 r.points=Math.min(6,r.points+earned);
 r.strain=Math.min(100,r.strain+strainAdded);
 if(strainAdded){
  soul.stability=Math.max(1,soul.stability-3);
  U.ensurePlayer(s);Combat.harm(s,Combat.get(s,'player'),2);
  U.sync(s,{source:'wounds'});
 }
 const source={origin:ORIGIN,kind:'practice',phase:p.phase,
  minute:before,minutes,reserveSpent,staminaSpent,
  witness:wit,witnessHash:digest(wit),check:structuredClone(check),
  checkEvent,checkEventHash:digest(checkEvent),
  roll:check.roll,earned,points:r.points,strainAdded};
 r.attempts.push({origin:ORIGIN,source,seal:digest(source)});
 E.advance(s,minutes);W.finalizeTime(s,before);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Original higher Soul stage receipts cannot be verified');
 return {practised:true,phase:p.phase,check,earned,
  points:r.points,needed:6,strain:r.strain,reserveSpent,staminaSpent,minutes,
  noAutomaticMindreadingBindingOrMedicalPower:true};
}
function repair(s,p={}){
 if(!accepts(p,['phase','witnessIndex','minutes'])||
  !integer(p.phase,4,7)||!integer(p.minutes??60,15,480))
  throw Error('An observed actual spiritual injury and healing time are required');
 const {soul}=prerequisite(s,p.phase,{care:true});
 const r=s.table?.soulArchitecture?.higher?.records?.[p.phase];
 if(!r||!verify(s)||!r.strain)
  throw Error('No recorded real structural interference exists for repair');
 const wit=sourceEvent(s,p.witnessIndex,REPAIR,p.phase);
 if(!phrase(wit.details?.diagnosis,25,900)||
  !phrase(wit.details?.recoveryMethod,25,900))
  throw Error('A real independent diagnosis and recovery plan must be observed');
 if(r.repairs.some(x=>x.source.witnessHash===digest(wit)))
  throw Error('This original spiritual repair was already attempted');
 const minutes=p.minutes??60,reserveSpent=2,staminaSpent=Math.ceil(minutes/120)+1;
 if(!integer(soul.reserve,reserveSpent,100000)||
  !integer(s.player.stamina,staminaSpent,100000))
  throw Error('Actual Soul Reserve and Stamina are needed for recovery');
 const before=s.world.minutes,old=r.strain;
 soul.reserve-=reserveSpent;s.player.stamina-=staminaSpent;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
 const check=C.check(s,{modifier:Math.floor(((s.player.attributes.wis??10)-10)/2)+
  2*(s.player.skills?.cultivation?.rank||0),
  dc:14,label:'Source-observed original higher Soul structural repair'});
 const checkEvent=structuredClone(s.log.at(-1));
 r.strain=check.success?Math.max(0,old-2):old;
 if(check.success)soul.stability=Math.min(100,soul.stability+2);
 const source={origin:ORIGIN,kind:'repair',phase:p.phase,minute:before,
  minutes,reserveSpent,staminaSpent,witness:wit,witnessHash:digest(wit),
  check:structuredClone(check),checkEvent,checkEventHash:digest(checkEvent),
  roll:check.roll,strainBefore:old,strainAfter:r.strain};
 r.repairs.push({origin:ORIGIN,source,seal:digest(source)});
 E.advance(s,minutes);W.finalizeTime(s,before);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Original witnessed higher Soul repair record changed');
 return {repaired:check.success,check,strain:r.strain,
  reserveSpent,staminaSpent,minutes,noFreeFullSoulHealing:true};
}
function complete(s,p={}){
 if(!accepts(p,['phase','witnessIndex','minutes'])||
  !integer(p.phase,4,7)||!integer(p.minutes??90,30,480))
  throw Error('Higher Soul structure formation needs a separate original test and real time');
 const {current,soul}=prerequisite(s,p.phase);
 const r=s.table?.soulArchitecture?.higher?.records?.[p.phase];
 if(!r||!verify(s)||r.points<6||r.strain>2)
  throw Error('Original higher Soul integration and safe interference control are not complete');
 const wit=sourceEvent(s,p.witnessIndex,TEST,p.phase);
 if(!phrase(wit.details?.actualFunction,25,900)||
  !phrase(wit.details?.failureLimit,25,900)||
  !phrase(wit.details?.identityPreservation,25,900))
  throw Error('Distinct original functioning Soul structure, actual counterexample and retained identity must be witnessed');
 if(r.tests.some(x=>x.source.witnessHash===digest(wit)))
  throw Error('One original Soul formation source cannot be rolled twice');
 const minutes=p.minutes??90,reserveSpent=current.cost+3,
  staminaSpent=2+Math.ceil(minutes/90);
 if(!integer(soul.reserve,reserveSpent,100000)||
  !integer(s.player.stamina,staminaSpent,100000))
  throw Error('The original body lacks actual Soul Reserve or Stamina for final structure formation');
 const before=s.world.minutes,oldReserve=soul.reserve,oldMaxReserve=soul.maxReserve;
 soul.reserve-=reserveSpent;s.player.stamina-=staminaSpent;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
 const check=C.check(s,{modifier:Math.floor(((s.player.attributes.wis??10)-10)/2)+
  2*(s.player.skills?.cultivation?.rank||0)+Math.floor(soul.stability/25)-2,
  dc:current.dc+3,label:'Phase '+p.phase+' '+current.name+' independent identity and structural proof'});
 const checkEvent=structuredClone(s.log.at(-1));let capacity=null;
 if(check.success){
  const next=profile(s,p.phase);
  soul.phase=p.phase;
  soul.maxReserve=Math.max(oldMaxReserve,next.soulReserve);
  soul.perceptionRange=next.perceptionRangeMetres;
  soul.higherSoulIdentity=r.source.design;
  capacity={oldReserve,newReserve:soul.reserve,oldMaxReserve,
   newMaxReserve:soul.maxReserve,perceptionRange:soul.perceptionRange};
 }
 const source={origin:ORIGIN,kind:'test',phase:p.phase,minute:before,
  minutes,reserveSpent,staminaSpent,witness:wit,witnessHash:digest(wit),
  check:structuredClone(check),checkEvent,checkEventHash:digest(checkEvent),
  roll:check.roll,pointsAtAttempt:r.points,strainAtAttempt:r.strain,
  formed:check.success,capacity};
 const receipt={origin:ORIGIN,source,seal:digest(source)};
 r.tests.push(receipt);if(check.success)r.transition=receipt;
 E.advance(s,minutes);W.finalizeTime(s,before);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Original higher Soul transition or physical Soul Reserve proof no longer matches history');
 return {attempted:true,formed:check.success,phase:soul.phase,
  check,reserveSpent,staminaSpent,minutes,capacity,
  noAutomaticSoulCraftMindReadingOrResurrection:true};
}
function status(s){
 const phase=s.player?.soul?.phase||0;
 if(phase<3)return {phase,available:false,
  note:'Genuinely earned Phase III Resonance Lattice must precede advanced Soul structures'};
 if(!verify(s))throw Error('Source-verified higher Soul architecture was altered');
 return {phase,next:phase<7?phase+1:null,
  stages:Object.values(s.table?.soulArchitecture?.higher?.records||{})
   .map(x=>({phase:x.source.phase,name:SPEC[x.source.phase].name,
    points:x.points,required:6,strain:x.strain,formed:!!x.transition,
    identityBoundary:x.source.identityBoundary})),
  noAutomaticMindreadingForcedSoulBindingOrResurrection:true};
}
module.exports={ORIGIN,MAP,PRACTICE,TEST,REPAIR,SPEC,
 map,practice,repair,complete,status,verify};
