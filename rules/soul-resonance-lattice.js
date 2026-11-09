'use strict';
// Foundation #12: canon §22 Phase III Resonance Lattice. Source-earned
// structure of the practitioner's OWN soul, never readout of another mind,
// a binding of a sentient soul or automatic authority for contracts.
const Crypto=require('node:crypto'),E=require('../engine.js'),C=require('./core'),
 Build=require('./build'),Thread=require('./soul-threading'),
 W=require('./world'),U=require('./unified'),Combat=require('./combat'),
 Places=require('../world/lived-places');
const ORIGIN='earned-personal-soul-resonance-lattice-v1',
 MAP='witnessed-personal-soul-lattice-design-v1',
 PRACTICE='witnessed-personal-soul-resonance-repetition-v1',
 FORM='witnessed-independent-resonance-lattice-formation-v1',
 REPAIR='witnessed-soul-lattice-interference-repair-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const integer=(x,lo=0,hi=1000000000)=>Number.isInteger(x)&&x>=lo&&x<=hi;
const phrase=(x,lo=12,hi=900)=>typeof x==='string'&&x.trim().length>=lo&&x.trim().length<=hi;
const only=(p,allowed)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(k=>allowed.includes(k));
const GOAL=5;
function current(s){
 const p=s.player?.soul;
 if(!p||p.phase!==2)throw Error('Phase III Resonance Lattice needs a genuinely earned Phase II Soul Threading foundation');
 const original=Thread.earned(s);
 if(!original?.noMindreading)throw Error('The original protected mind–soul–body thread proof is missing');
 const loc=Places.location(s);
 if(!loc||s.battle||s.encounter||s.table?.combatants?.player?.status!=='ok'&&s.table?.combatants?.player)
  throw Error('Independent soul restructuring requires an established safe location and a conscious practitioner');
 return {p,loc,threadHash:hash(p.threadProof)};
}
function event(s,index,origin){
 if(!integer(index,0,s.log.length-1))throw Error('A genuine earlier witnessed individual soul practice is required');
 const x=s.log[index];
 if(x?.type!=='story'||x.details?.origin!==origin||
  x.details.location!==s.world.location||!phrase(x.text,16,900))
  throw Error('An actual personally witnessed local soul structure event is required');
 return structuredClone(x);
}
function profile(s){
 return Build.soulProfile(3,{
  will:Math.floor(((s.player.attributes?.wis??10)-10)/2)});
}
function verify(s){
 const soul=s.player?.soul,root=s.table?.soulArchitecture,record=root?.lattice;
 if(!record)return (soul?.phase||0)<3;
 const z=record.source,p=soul?.threadProof;
 if(!soul||!p||!root||root.origin!==ORIGIN||
  record.origin!==ORIGIN||record.seal!==hash(z)||
  !z||z.origin!==ORIGIN||z.threadHash!==hash(p)||
  !integer(z.minute,0,s.world.minutes)||
  !phrase(z.name,3,140)||!phrase(z.resonancePattern,20,900)||
  !phrase(z.identityBoundary,20,900)||
  !phrase(z.communicationLimit,20,900)||
  !phrase(z.interference,20,900)||!phrase(z.repairMethod,20,900)||
  !z.witness||z.witnessHash!==hash(z.witness)||
  z.witness.details?.origin!==MAP||
  !Array.isArray(record.attempts)||!Array.isArray(record.repairs)||
  !Array.isArray(record.transitions)||!integer(record.points,0,GOAL)||
  !integer(record.strain,0,100))return false;
 if(!p.workHash||p.source!==Thread.ORIGIN||
  !s.table?.soulThreadWork?.completed||
  p.workHash!==hash(s.table.soulThreadWork.attempts)||
  !s.table?.disciplineTraining?.soul?.history?.some(x=>
   x.target==='phase2'&&x.witnessSource===Thread.ORIGIN))
  return false;
 let pts=0,strain=0,success=null,last=z.minute;
 const witnessed=new Set(),steps=[
  ...record.attempts.map(x=>({kind:'practice',receipt:x})),
  ...record.repairs.map(x=>({kind:'repair',receipt:x})),
  ...record.transitions.map(x=>({kind:'form',receipt:x}))
 ].sort((a,b)=>a.receipt.source.minute-b.receipt.source.minute);
 for(const {kind,receipt} of steps){
  const a=receipt?.source;
  if(receipt?.origin!==ORIGIN||receipt.seal!==hash(a)||
   a?.origin!==ORIGIN||a.kind!==kind||
   !integer(a.minute,last,s.world.minutes)||
   !integer(a.minutes,15,480)||
   !integer(a.reserveSpent,1,10)||
   !integer(a.staminaSpent,1,20)||
   !integer(a.roll,1,20)||a.check?.roll!==a.roll||
   !a.checkEvent||a.checkEventHash!==hash(a.checkEvent)||
   a.checkEvent.type!=='roll'||
   hash(a.checkEvent.details)!==hash(a.check)||
   !a.witness||a.witnessHash!==hash(a.witness)||
   a.witness.details?.origin!==
    (kind==='practice'?PRACTICE:kind==='repair'?REPAIR:FORM)||
   witnessed.has(a.witnessHash))
   return false;
  witnessed.add(a.witnessHash);
  if(kind==='practice'){
   if(success||a.reserveSpent!==2||
    a.earned!==(a.check.success?a.check.progress:0)||
    a.total!==Math.min(GOAL,pts+a.earned)||
    a.strainAdded!==(a.check.degree==='severe failure'?3:0))
    return false;
   pts=a.total;strain=Math.min(100,strain+a.strainAdded);
  }else if(kind==='repair'){
   if(a.reserveSpent!==1||a.strainBefore!==strain||
    a.strainAfter!==(a.check.success?Math.max(0,strain-2):strain))
    return false;
   strain=a.strainAfter;
  }else{
   if(a.reserveSpent!==4||a.pointsAtAttempt!==GOAL||
    a.strainAtAttempt>2||a.formed!==a.check.success)
    return false;
   if(a.formed){
    if(success)return false;
    success=receipt;
    const capacity=a.capacity,expected=profile(s);
    if(!capacity||
     !integer(capacity.oldReserve,a.reserveSpent,10000)||
     !integer(capacity.oldMaxReserve,0,10000)||
     capacity.newReserve!==capacity.oldReserve-a.reserveSpent||
     capacity.newMaxReserve!==Math.max(capacity.oldMaxReserve,expected.soulReserve)||
     capacity.perceptionRange!==expected.perceptionRangeMetres)
     return false;
   }else if(a.capacity!==null)return false;
  }
  last=a.minute+a.minutes;
 }
 if(pts!==record.points||strain!==record.strain)return false;
 if((soul.phase||0)>=3&&!success)return false;
 if(soul.phase===2&&success)return false;
 if(success&&soul.phase===3){
  const capacity=success.source.capacity,expected=profile(s);
  if(soul.maxReserve<capacity.newMaxReserve||
   soul.perceptionRange!==expected.perceptionRangeMetres||
   soul.resonanceLatticeIntegrity!==1)return false;
 }
 return true;
}
function plan(s,p={}){
 if(!only(p,['name','resonancePattern','identityBoundary',
  'communicationLimit','interference','repairMethod','witnessIndex'])||
  !phrase(p.name,3,140)||!phrase(p.resonancePattern,20,900)||
  !phrase(p.identityBoundary,20,900)||
  !phrase(p.communicationLimit,20,900)||
  !phrase(p.interference,20,900)||!phrase(p.repairMethod,20,900))
  throw Error('Soul lattice design needs an original observed self-pattern, identity safeguards, limitations and a repair method');
 const {threadHash}=current(s);
 if(s.table?.soulArchitecture?.lattice)throw Error('An existing personally mapped Soul Lattice cannot be replaced to erase learned work');
 const wit=event(s,p.witnessIndex,MAP);
 if(!phrase(wit.details?.observedSelfResonance,24,900)||
  !phrase(wit.details?.identityCountertest,24,900)||
  wit.details?.otherPersonConsent===false)
  throw Error('Resonance design requires a real original self-observation, identity boundary and no assertion of another person’s consent');
 const source={origin:ORIGIN,minute:s.world.minutes,threadHash,
  name:p.name.trim(),resonancePattern:p.resonancePattern.trim(),
  identityBoundary:p.identityBoundary.trim(),
  communicationLimit:p.communicationLimit.trim(),
  interference:p.interference.trim(),repairMethod:p.repairMethod.trim(),
  witness:wit,witnessHash:hash(wit),noOtherSoulOrAutomaticArt:true};
 s.table.soulArchitecture={origin:ORIGIN,lattice:{
  origin:ORIGIN,source,seal:hash(source),points:0,
  strain:0,attempts:[],repairs:[],transitions:[]}};
 return {mapped:true,formed:false,phase:s.player.soul.phase,
  noOtherMindRead:true,noContractOrSoulArtefactGranted:true};
}
function practice(s,p={}){
 if(!only(p,['witnessIndex','minutes'])||
  !integer(p.minutes??60,15,480))
  throw Error('Soul lattice practice needs original evidence and actual effort time');
 const {p:so}=current(s),r=s.table?.soulArchitecture?.lattice;
 if(!r||!verify(s))throw Error('Source-verified Phase III personal Soul Lattice design is missing');
 if(r.strain>=5)throw Error('An unstable personal lattice needs source-supported recovery before more practice');
 if(r.points>=GOAL)throw Error('The genuinely practised lattice is ready for its separate formation trial');
 const wit=event(s,p.witnessIndex,PRACTICE);
 if(!phrase(wit.details?.observedFeedback,24,900)||
  !phrase(wit.details?.voluntaryStop,24,900))
  throw Error('The observed practice must actually show reversible self-resonance and stopping control');
 const witnessHash=hash(wit);
 if(r.attempts.some(x=>x.source.witnessHash===witnessHash))
  throw Error('The same original soul practice witness cannot be rolled twice');
 const minutes=p.minutes??60,reserveSpent=2,staminaSpent=1+Math.ceil(minutes/120);
 if(!integer(so.reserve,reserveSpent,10000)||
  !integer(s.player.stamina,staminaSpent,100000))
  throw Error('Actual Soul reserve and physical Stamina are insufficient for independent practice');
 const at=s.world.minutes;
 so.reserve-=reserveSpent;s.player.stamina-=staminaSpent;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
 const check=C.check(s,{modifier:Math.floor(((s.player.attributes.wis??10)-10)/2)+
  2*(s.player.skills?.cultivation?.rank||0),dc:17,
  label:'Personal Soul Phase III Resonance Lattice practice'});
 const checkEvent=structuredClone(s.log.at(-1));
 const earned=check.success?check.progress:0,
  strainAdded=check.degree==='severe failure'?3:0;
 r.points=Math.min(GOAL,r.points+earned);
 r.strain=Math.min(100,r.strain+strainAdded);
 if(strainAdded){
  so.stability=Math.max(1,so.stability-3);
  U.ensurePlayer(s);Combat.harm(s,Combat.get(s,'player'),2);
  U.sync(s,{source:'wounds'});
 }
 const source={origin:ORIGIN,kind:'practice',minute:at,minutes,
  reserveSpent,staminaSpent,witness:wit,witnessHash,
  check:structuredClone(check),checkEvent,checkEventHash:hash(checkEvent),
  roll:check.roll,earned,total:r.points,strainAdded};
 r.attempts.push({origin:ORIGIN,source,seal:hash(source)});
 E.advance(s,minutes);W.finalizeTime(s,at);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Original personal resonance practice source or cost failed verification');
 return {practised:true,phase:so.phase,check,earned,
  progress:r.points,needed:GOAL,strain:r.strain,
  reserveSpent,staminaSpent,minutes,noMindreadingOrBondAward:true};
}
function repair(s,p={}){
 if(!only(p,['witnessIndex','minutes'])||!integer(p.minutes??60,15,480))
  throw Error('Spiritually observed real lattice repair requires time and a new clinical witness');
 const {p:so}=current(s),r=s.table?.soulArchitecture?.lattice;
 if(!r||!verify(s)||!r.strain)throw Error('No authentic individual lattice strain exists to repair');
 const wit=event(s,p.witnessIndex,REPAIR);
 if(!phrase(wit.details?.diagnosis,24,900)||
  !phrase(wit.details?.selfCorrection,24,900))
  throw Error('Repair must demonstrate an actual measured interference and a real self-correction method');
 if(r.repairs.some(x=>x.source.witnessHash===hash(wit)))
  throw Error('One original soul repair cannot be rerolled');
 const minutes=p.minutes??60,reserveSpent=1,staminaSpent=1+Math.ceil(minutes/120);
 if(!integer(so.reserve,reserveSpent,10000)||
  !integer(s.player.stamina,staminaSpent,100000))
  throw Error('Actual Soul reserve and Stamina are insufficient for repair');
 const at=s.world.minutes,oldStrain=r.strain;
 so.reserve-=reserveSpent;s.player.stamina-=staminaSpent;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
 const check=C.check(s,{modifier:Math.floor(((s.player.attributes.wis??10)-10)/2)+
  2*(s.player.skills?.cultivation?.rank||0),dc:14,
  label:'Observed personal Soul Resonance Lattice restoration'});
 const checkEvent=structuredClone(s.log.at(-1));
 r.strain=check.success?Math.max(0,oldStrain-2):oldStrain;
 if(check.success)so.stability=Math.min(100,so.stability+2);
 const source={origin:ORIGIN,kind:'repair',minute:at,minutes,
  reserveSpent,staminaSpent,witness:wit,witnessHash:hash(wit),
  check:structuredClone(check),checkEvent,checkEventHash:hash(checkEvent),
  roll:check.roll,strainBefore:oldStrain,strainAfter:r.strain};
 r.repairs.push({origin:ORIGIN,source,seal:hash(source)});
 E.advance(s,minutes);W.finalizeTime(s,at);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Individually witnessed lattice restoration has no original source check');
 return {repaired:check.success,check,strain:r.strain,
  reserveSpent,staminaSpent,minutes,noAutomaticSoulHealing:true};
}
function complete(s,p={}){
 if(!only(p,['witnessIndex','minutes'])||!integer(p.minutes??90,30,480))
  throw Error('A real independent Soul Lattice formation test and time are required');
 const {p:so}=current(s),r=s.table?.soulArchitecture?.lattice;
 if(!r||!verify(s)||r.points<GOAL||r.strain>2)
  throw Error('The observed original Soul Lattice practice or interference control is incomplete');
 const wit=event(s,p.witnessIndex,FORM);
 if(!phrase(wit.details?.independentResponse,24,900)||
  !phrase(wit.details?.identityBoundaryProof,24,900))
  throw Error('Real stable personal soul resonance and a successful identity boundary countertest must be witnessed');
 if(r.transitions.some(x=>x.source.witnessHash===hash(wit)))
  throw Error('This actual original formation demonstration was already resolved');
 const minutes=p.minutes??90,reserveSpent=4,staminaSpent=2+Math.ceil(minutes/90);
 if(!integer(so.reserve,reserveSpent,10000)||
  !integer(s.player.stamina,staminaSpent,100000))
  throw Error('Soul lattice formation requires actually available Soul reserve and Stamina');
 const at=s.world.minutes,oldReserve=so.reserve,oldMaxReserve=so.maxReserve;
 so.reserve-=reserveSpent;s.player.stamina-=staminaSpent;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
 const check=C.check(s,{modifier:Math.floor(((s.player.attributes.wis??10)-10)/2)+
  2*(s.player.skills?.cultivation?.rank||0)+Math.floor(so.stability/25)-2,
  dc:21,label:'Soul Phase III Resonance Lattice independent identity boundary trial'});
 const checkEvent=structuredClone(s.log.at(-1));let capacity=null;
 if(check.success){
  const next=profile(s);
  so.phase=3;so.maxReserve=Math.max(oldMaxReserve,next.soulReserve);
  so.perceptionRange=next.perceptionRangeMetres;
  so.resonanceLatticeIntegrity=1;
  capacity={oldReserve,newReserve:so.reserve,
   oldMaxReserve,newMaxReserve:so.maxReserve,
   perceptionRange:so.perceptionRange};
 }
 const source={origin:ORIGIN,kind:'form',minute:at,minutes,
  reserveSpent,staminaSpent,witness:wit,witnessHash:hash(wit),
  check:structuredClone(check),checkEvent,checkEventHash:hash(checkEvent),
  roll:check.roll,pointsAtAttempt:r.points,strainAtAttempt:r.strain,
  formed:check.success,capacity};
 r.transitions.push({origin:ORIGIN,source,seal:hash(source)});
 E.advance(s,minutes);W.finalizeTime(s,at);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Source-earned Soul Phase III physical structure or capacity changed');
 return {attempted:true,formed:check.success,check,
  phase:so.phase,reserveSpent,staminaSpent,minutes,capacity,
  noAutomaticContractCommunicationOrMindreading:true};
}
function status(s){
 const so=s.player?.soul,r=s.table?.soulArchitecture?.lattice;
 if((so?.phase||0)<2)return {phase:so?.phase||0,ready:false,
  note:'An original earned Soul Phase II mind–body thread is required'};
 if(!verify(s))throw Error('Source-confirmed individual Soul Lattice was changed');
 return {phase:so.phase,ready:so.phase===2,formed:so.phase>=3,
  name:r?.source?.name||null,progress:r?.points||0,required:GOAL,
  strain:r?.strain||0,identityBoundary:r?.source?.identityBoundary||null,
  separateContracts:true,noOtherMindReadingOrSoulBinding:true};
}
module.exports={ORIGIN,MAP,PRACTICE,FORM,REPAIR,plan,practice,repair,complete,status,verify};
