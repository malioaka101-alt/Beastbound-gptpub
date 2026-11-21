'use strict';
// Witnessed independent extensions of the ORIGINAL Arcane and Soul owners.
// Shared receipt plumbing is not a shared rank ladder. Each owner retains
// separate geometry, prerequisites, check law, resource and injury outcomes.
const Crypto=require('node:crypto'),E=require('../engine'),Core=require('./core'),
 Build=require('./build'),Combat=require('./combat'),Health=require('./unified'),
 World=require('./world'),Early=require('./independent-original-discipline-preparation'),
 Matrix=require('./independent-original-arcane-matrix-three'),
 Lattice=require('./independent-original-soul-lattice-three'),
 Dynamic=require('./arcane-dynamic-architecture'),Arcane=require('./arcane-higher-circles'),
 Soul=require('./soul-higher-architecture'),Law=require('./higher-architecture-shared-original-law'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Lives=require('../world/independent-person-lives'),Presence=require('../world/person-presence'),
 Places=require('../world/lived-places');
const ORIGIN='source-earned-independent-original-higher-architecture-v1',
 NIGHT='source-earned-independent-higher-architecture-night-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 int=(v,a=0,b=1000000000)=>Number.isInteger(v)&&v>=a&&v<=b,
 prose=(v,a=25)=>typeof v==='string'&&v.trim().length>=a&&v.length<=900;
const keys={arcane:'originalArcaneHigherArchitecture',soul:'originalSoulHigherArchitecture'};
function prior(s,p,system){
 if(system==='arcane'){
  const r=p?.originalArcaneMatrix;
  if(!r?.completed||!Matrix.verify(s,p))return null;
  const win=r.sessions.find(x=>x.source.origin===Matrix.ORIGIN&&x.source.stageAfter===3);
  if(!win)return null;
  return {seal:win.seal,energy:r.manaRemaining,capacity:Build.arcaneProfile(3).mana,
   stability:r.coreStability,history:r.sessions,stage:3};
 }
 if(system==='soul'){
  const r=p?.originalSoulLatticeThree;
  if(!r?.formed||!Lattice.verify(s,p))return null;
  const win=r.sessions.find(x=>x.seal===r.originalFormationSourceHash);
  if(!win)return null;
  return {seal:win.seal,energy:r.reserveRemaining,capacity:r.maxReserve,
   stability:r.soulStability,history:r.sessions,stage:3};
 }
 return null;
}
const endOf=q=>q.endMinute??(q.startMinute+q.actualMinutes);
function owner(system,stage){return system==='soul'?Soul:stage===4?Dynamic:Arcane;}
function operation(system,stage,origin){
 const o=owner(system,stage);
 return origin===o.MAP?'map':origin===o.PRACTICE?'practice':
  origin===o.REPAIR?'repair':origin===(o.BREAKTHROUGH||o.TEST)?'form':null;
}
function witnessValid(s,p,q){
 const w=q.witness,d=w?.details,system=q.system,stage=q.stage,
  kind=q.kind,site=Places.location(s,q.site);
 if(!site||w?.type!=='story'||!prose(w.text,18)||!w.text.includes(p.name)||
  w.day!==q.day+1||w.time!==E.clock({world:{minutes:q.minute}})||
  d?.actorId!==p.actorId||d.location!==q.site||
  (system==='arcane'?d.circle!==stage:d.phase!==stage)||
  operation(system,stage,d.origin)!==kind)return false;
 if(system==='arcane'&&stage===4){
  if(kind==='map')return d.existingChannels===3&&prose(d.design,30)&&
   ['channelInteraction','interference','safety','observedChannelResponse','knownCountertest'].every(k=>prose(d[k]));
  if(kind==='practice')return prose(d.channelTest,20)&&prose(d.failureLimit,20);
  if(kind==='repair')return prose(d.actualDamage)&&prose(d.method);
  return kind==='form'&&prose(d.changedDuringCasting)&&prose(d.interferenceCounter);
 }
 if(system==='arcane'){
  const sp=Arcane.SPEC[stage];if(!sp)return false;
  if(kind==='map'){
   if(d.kind!==sp.kind||d.existingChannels!==Build.arcaneProfile(stage-1).channels||
    !prose(d.design,30)||!['channelModel','interference','safety'].every(k=>prose(d[k]))||
    ![...sp.sourceFields,'countertest'].every(k=>prose(d[k],24)))return false;
   if(stage===8){
    try{const law=Arcane.originalLaw(s,d.lawRef);return !!law&&d.lawSeal===law.seal&&q.lawHash===hash(law);}
    catch{return false;}
   }
   return d.lawRef===undefined&&q.lawHash===null;
  }
  if(kind==='practice')return prose(d.measuredResponse,24)&&prose(d.resistance,24);
  if(kind==='repair')return prose(d.examinedFailure,24)&&prose(d.restorativeGeometry,24);
  return kind==='form'&&prose(d.independentCountertest,24)&&prose(d.limitObserved,24);
 }
 const sp=Soul.SPEC[stage];if(!sp)return false;
 if(kind==='map')return d.kind===sp.kind&&prose(d.design,28)&&
  ['identityBoundary','ethicalLimit','interference','repairMethod',...sp.sources,'countertest'].every(k=>prose(d[k]))&&
  (stage!==4||d.nonSentient===true)&&(stage!==6||int(d.measuredRangeMetres,1,100000))&&
  (stage!==7||prose(d.selfMaintenance));
 if(kind==='practice')return prose(d.observedResponse)&&prose(d.independentBoundary);
 if(kind==='repair')return prose(d.diagnosis)&&prose(d.recoveryMethod);
 return kind==='form'&&['actualFunction','failureLimit','identityPreservation'].every(k=>prose(d[k]));
}
function mode(p,system,stage,kind,minutes,stability){
 if(kind==='map')return {dc:null,energy:0,stamina:0,modifier:0};
 const a=p.mechanicalFoundation.baselineAttributes;
 return system==='arcane'?(stage===4?Law.arcaneFourth(kind,minutes,a.int,0,stability):
  Law.arcaneHigher(Arcane.SPEC[stage],kind,minutes,a.int,0,stability)):
  Law.soulHigher(Soul.SPEC[stage],kind,minutes,a.wis,0,stability);
}
function checkRecord(roll,sp){
 const margin=roll+sp.modifier+Core.naturalAdjustment(roll)-sp.dc;
 return {roll,modifier:sp.modifier,dc:sp.dc,margin,degree:Core.degree(margin),success:margin>=0};
}
function eligible(system,state,stage,kind){
 if(stage!==state.stage+1||stage>(system==='arcane'?9:7))return false;
 const r=state.stages[stage],limit=system==='soul'?40:stage===4?45:35;
 if(state.stability<limit&&(kind!=='repair'||system==='arcane'&&stage===4))return false;
 if(kind==='map')return !r;
 if(!r)return false;
 if(kind==='practice')return r.points<6&&r.strain<5;
 if(kind==='repair')return r.strain>0;
 return kind==='form'&&r.points===6&&r.strain<=2;
}
function snapshot(state,stage){const r=state.stages[stage];return {
 stage:state.stage,energy:state.energy,capacity:state.capacity,stability:state.stability,
 points:r?.points??null,strain:r?.strain??null};}
function advanceState(p,system,state,q,check,seal){
 if(!q.accepted)return false;
 if(q.kind==='map'){state.stages[q.stage]={points:0,strain:0,mapSeal:seal,formationSeal:null};return false;}
 const r=state.stages[q.stage],sp=mode(p,system,q.stage,q.kind,q.plannedMinutes,state.stability);
 state.energy-=sp.energy;
 const changed=system==='arcane'?Law.arcaneState(q.stage,q.kind,r.points,r.strain,state.stability,check):
  Law.soulState(q.kind,r.points,r.strain,state.stability,check);
 r.points=changed.points;r.strain=changed.strain;state.stability=changed.stability;
 if(q.kind==='form'&&check.success){
  state.stage=q.stage;r.formationSeal=seal;state.predecessor=seal;
  const cap=system==='arcane'?Build.arcaneProfile(q.stage).mana:
   Build.soulProfile(q.stage,{will:Math.floor((p.mechanicalFoundation.baselineAttributes.wis-10)/2)}).soulReserve;
  state.capacity=Math.max(state.capacity,cap);
 }
 return changed.wound;
}
function replay(s,p,system,base){
 const r=p?.[keys[system]],body=s.table?.combatants?.['npc_'+p?.id];
 if(!base||!body?.npcOrigin?.seal)return null;
 const state={stage:base.stage,energy:base.energy,capacity:base.capacity,
  stability:base.stability,predecessor:base.seal,stages:{},lastDay:-1,lastEnd:endOf(base.history.at(-1).source)};
 if(!int(state.lastEnd)||state.energy>state.capacity)return null;
 if(r===undefined)return state;
 if(r?.origin!==ORIGIN||r.system!==system||r.priorSeal!==base.seal||
  !Array.isArray(r.sessions)||!r.sessions.length||r.sessions.length>960)return null;
 const used=new Set(),nights=new Set(base.history.filter(x=>x.source.originalNightSourceHash).map(x=>x.source.originalNightSourceHash));
 const Offscreen=require('../world/independent-original-power-days');
 for(const row of r.sessions){
  const q=row?.source;
  if(!q||row.seal!==hash(q)||q.actorId!==p.actorId||q.system!==system||
   q.identityOriginHash!==p.originHash||q.combatSeal!==body.npcOrigin.seal)return null;
  if(q.origin===NIGHT){
   const night=q.originalNight;
   if(!night||nights.has(night.seal)||q.originalNightSourceHash!==night.seal||
    q.endMinute!==night.source?.endMinute||!int(q.endMinute,state.lastEnd+1,s.world.minutes)||
    !Offscreen.verifyNights(s,p,[night])||q.energyBefore!==state.energy||
    q.capacity!==state.capacity||q.energyAfter!==Math.min(state.capacity,state.energy+(system==='arcane'?12:3))||
    q.energyAfter<=state.energy)return null;
   nights.add(night.seal);state.energy=q.energyAfter;state.lastEnd=q.endMinute;continue;
  }
  const sh=q.shift;
  if(q.origin!==ORIGIN||q.noAutomaticArtOrExternalPower!==true||
   !int(q.stage,4,system==='arcane'?9:7)||!int(q.minute,state.lastEnd,s.world.minutes)||
   !int(q.day,state.lastDay+1)||q.day!==Math.floor(q.minute/1440)||
   q.predecessor!==state.predecessor||q.mapSeal!==(state.stages[q.stage]?.mapSeal??null)||
   !eligible(system,state,q.stage,q.kind)||!eq(q.before,snapshot(state,q.stage))||
   !sh||sh.hash!==hash(Object.fromEntries(Object.entries(sh).filter(([k])=>k!=='hash')))||
   sh.actorId!==p.actorId||sh.originHash!==p.originHash||sh.location!==q.site||
   sh.fromDay>q.day||sh.throughDay<q.day||sh.throughDay-sh.fromDay!==5||sh.scheduledAtDay!==sh.fromDay||
   !witnessValid(s,p,q)||q.witnessHash!==hash(q.witness)||used.has(q.witnessHash)||
   !int(q.rngBefore,1,4294967295)||q.personality!==p.personality||!int(q.fatigue,0,100)||
   q.chance!==Early.chance({personality:q.personality,fatigue:q.fatigue})||
   (q.kind==='map'?q.plannedMinutes!==0:!int(q.plannedMinutes,q.kind==='form'?30:15,480))||
   q.minute%1440<480||q.minute%1440+Math.max(5,q.plannedMinutes)>1080||
   !int(q.staminaBefore,1)||!int(q.maxBefore,q.staminaBefore)||q.maxAfter!==q.maxBefore||
   !eq(q.woundsBefore,[0,0,0]))return null;
  const rng={rngState:q.rngBefore},sp=mode(p,system,q.stage,q.kind,q.plannedMinutes,state.stability);
  if(q.choice!==Core.die(rng,100)||q.accepted!==(q.choice<=q.chance)||
   state.energy<sp.energy||q.staminaBefore<sp.stamina)return null;
  const check=q.accepted&&q.kind!=='map'?checkRecord(Core.die(rng,20),sp):null,
   spent=q.accepted?sp.stamina:0,injury=advanceState(p,system,state,q,check,row.seal);
  if(!eq(q.check,check)||q.rngAfter!==rng.rngState||q.staminaSpent!==spent||
   q.energySpent!==(q.accepted?sp.energy:0)||q.staminaAfter!==q.staminaBefore-spent||
   !eq(q.woundsAfter,injury?[1,0,0]:[0,0,0])||!eq(q.after,snapshot(state,q.stage))||
   q.actualMinutes!==(q.accepted?q.plannedMinutes:5)||q.minute+q.actualMinutes>s.world.minutes)return null;
  state.lastDay=q.day;state.lastEnd=q.minute+q.actualMinutes;used.add(q.witnessHash);
 }
 return state;
}
function verify(s,p,system){
 if(!keys[system])return false;
 if(p?.[keys[system]]===undefined)return true;
 try{return replay(s,p,system,prior(s,p,system))!==null;}catch{return false;}
}
function usedDay(p,day){
 return [p.meridianTraining,p.originalMeridianLadder?.awakening,p.originalMeridianGates,
  p.originalMeridianSea,p.originalMeridianWeb,p.originalMeridianAdvanced,
  p.originalArcaneCircleTwo,p.originalArcaneMatrix,p.originalSoulThreadTwo,p.originalSoulLatticeThree,
  p.originalBodyCycleTwo,p.originalBodyOrganCycleThree,p.originalBodyNerveSenseFour,p.originalBodyLivingPhysiques,
  p.originalRiftMeasuredSense,p.originalRiftExteriorAnchor,...Object.values(p.originalEarlyDisciplinePreparation||{})]
  .some(r=>r?.lastAttemptDay>=day)||
  Object.values(keys).some(k=>p[k]?.sessions?.some(x=>x.source.origin===ORIGIN&&x.source.day>=day));
}
function work(s,{actorId,witnessIndex,minutes,...extra}={},system){
 if(Object.keys(extra).length||!keys[system]||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId)||!int(witnessIndex,0,s.log.length-1))
  throw Error('Only actual independent actor, fresh architecture witness and duration are accepted');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  body=s.table?.combatants?.['npc_'+p?.id],life=w?.independentPersonLives?.people?.[p?.id],
  start=s.world.minutes,day=Math.floor(start/1440),site=s.world.location,
  present=p&&Presence.resolve(w,actorId,site,day,start%1440),
  witness=structuredClone(s.log[witnessIndex]),stage=system==='arcane'?witness.details?.circle:witness.details?.phase;
 if(!p||!People.verify(w,p)||!life||!Lives.verifyEntry(w,life)||!life.interests.includes(system)||
  p.status!=='active'||p.ageBand!=='adult, exact birthday not established'||!present?.presence||
  body?.npcOrigin?.location!==site||!Health.currentNpcWoundCondition(s,actorId)||
  body.status!=='ok'||body.wounds.some(x=>x!==0)||body.stamina<1||s.battle||s.encounter||
  !s.chatRuntime?.scene?.includes(p.name)||!int(stage,4,system==='arcane'?9:7))
  throw Error('Present independent uninjured adult and actual architecture observation required');
 const base=prior(s,p,system),state=base&&replay(s,p,system,base);
 if(!state)throw Error('Genuinely formed and source-verified original Third architecture required');
 const kind=operation(system,stage,witness.details?.origin),
  planned=kind==='map'?0:minutes??(kind==='form'?90:60),
  r=p[keys[system]]||{origin:ORIGIN,system,priorSeal:base.seal,sessions:[]},
  witnessHash=hash(witness);
 let lawHash=null;
 if(system==='arcane'&&stage===8&&kind==='map'){
  const law=Arcane.originalLaw(s,witness.details.lawRef);lawHash=law?hash(law):null;
 }
 const q={origin:ORIGIN,system,stage,kind,actorId,identityOriginHash:p.originHash,
  combatSeal:body.npcOrigin.seal,minute:start,day,site,shift:structuredClone(present.presence),
  predecessor:state.predecessor,mapSeal:state.stages[stage]?.mapSeal??null,
  witness,witnessHash,lawHash,plannedMinutes:planned,before:snapshot(state,stage),
  noAutomaticArtOrExternalPower:true};
 if(!eligible(system,state,stage,kind)||!witnessValid(s,p,q)||
  usedDay(p,day)||state.lastEnd>start||r.sessions.length>=960||
  r.sessions.some(x=>x.source.witnessHash===witnessHash)||
  (kind==='map'?minutes!==undefined&&minutes!==0:!int(planned,kind==='form'?30:15,480))||
  start%1440<480||start%1440+Math.max(5,planned)>1080)
  throw Error('Original predecessor, fresh witnessed architecture and unused safe personal discipline day required');
 const sp=mode(p,system,stage,kind,planned,state.stability);
 if(state.energy<sp.energy||body.stamina<sp.stamina)throw Error('Actual original energy and Combat Stamina required');
 const rngBefore=p.rngState,chance=Early.chance(p),choice=Core.die(p,100),accepted=choice<=chance,
  staminaBefore=body.stamina,maxBefore=body.maxStamina,woundsBefore=[...body.wounds];
 let check=null;
 if(accepted&&kind!=='map'){
  const c=Core.check(s,{modifier:sp.modifier,dc:sp.dc,independentRngOwner:p,privateDisplay:true,
   label:p.name+' original '+system+' '+stage+' '+kind});
  check=checkRecord(c.roll,sp);body.stamina-=sp.stamina;
 }
 Object.assign(q,{rngBefore,rngAfter:p.rngState,personality:p.personality,fatigue:p.fatigue,
  chance,choice,accepted,check,actualMinutes:accepted?planned:5,staminaBefore,staminaSpent:accepted?sp.stamina:0,
  energySpent:accepted?sp.energy:0,staminaAfter:body.stamina,maxBefore,maxAfter:body.maxStamina,woundsBefore});
 // Receipt seal is referenced only by future actions, never by its own snapshot.
 const injury=advanceState(p,system,state,q,check,null);
 if(injury)Combat.harm(s,body,2);
 q.woundsAfter=[...body.wounds];q.after=snapshot(state,stage);
 r.sessions.push({source:q,seal:hash(q)});p[keys[system]]=r;
 E.advance(s,q.actualMinutes);World.finalizeTime(s,start);
 if(!verify(s,p,system))throw Error('Original independent higher architecture failed replay');
 return {actorId,system,attemptedStage:stage,independentlyAccepted:accepted,
  formed:kind==='form'&&!!check?.success,elapsedMinutes:q.actualMinutes,noAutomaticArtOrExternalPower:true};
}
function afterNight(s,p,night,system){
 const r=p?.[keys[system]];if(!r)return null;
 const state=replay(s,p,system,prior(s,p,system)),
  body=s.table?.combatants?.['npc_'+p.id],Offscreen=require('../world/independent-original-power-days');
 if(!state)throw Error('Original higher architecture source failed replay');
 if(!night||!Offscreen.verifyNights(s,p,[night])||r.sessions.length>=960||
  night.source.endMinute<=state.lastEnd||state.energy>=state.capacity)return null;
 const source={origin:NIGHT,system,actorId:p.actorId,identityOriginHash:p.originHash,
  combatSeal:body.npcOrigin.seal,originalNight:structuredClone(night),originalNightSourceHash:night.seal,
  endMinute:night.source.endMinute,energyBefore:state.energy,capacity:state.capacity,
  energyAfter:Math.min(state.capacity,state.energy+(system==='arcane'?12:3))};
 r.sessions.push({source,seal:hash(source)});
 if(!verify(s,p,system))throw Error('Original higher architecture recovery failed replay');
 const restored=source.energyAfter-source.energyBefore;
 return {actualOriginalEnergyRestored:restored,system,
  ...(system==='arcane'?{actualOriginalManaRestored:restored}:{originalSoulReserveRestored:restored}),
  noFreeReplenishment:true};
}
function privateStatus(s,p,system){
 if(!p?.[keys[system]])return null;
 const state=replay(s,p,system,prior(s,p,system));
 if(!state)throw Error('Original higher architecture source altered');
 return {privateToGM:true,system,earnedStage:state.stage,currentEnergy:state.energy,capacity:state.capacity,
  stability:state.stability,stages:Object.entries(state.stages).map(([stage,r])=>({
   stage:Number(stage),name:system==='arcane'?Number(stage)===4?'Dynamic Architecture':Arcane.SPEC[stage].name:Soul.SPEC[stage].name,
   points:r.points,strain:r.strain,formed:!!r.formationSeal,sourceHash:r.formationSeal})),noAutomaticArtOrExternalPower:true};
}
module.exports={ORIGIN,NIGHT,verify,work,afterNight,privateStatus,usedDay};
