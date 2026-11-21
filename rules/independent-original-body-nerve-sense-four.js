'use strict';
// #177 original witnessed Nerve–Sense IV for a real independent adult.
// The GM supplies ACTUAL locally witnessed tissue/function observations
// exactly as the original player owner requires. No ordinary offscreen
// day is accepted as a clinical observation; no caller-selected die or
// consent, no invented organs, fixed catalogue or automatic skill.
const Crypto=require('node:crypto'),E=require('../engine'),Core=require('./core'),
 Combat=require('./combat'),World=require('./world'),Health=require('./unified'),
 PC=require('./body-nerve-sense'),Law=require('./body-shared-original-nerve-sense'),
 Three=require('./independent-original-body-organ-cycle-three'),
 Early=require('./independent-original-discipline-preparation'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Lives=require('../world/independent-person-lives'),Presence=require('../world/person-presence'),
 Places=require('../world/lived-places');
const ORIGIN='source-earned-witnessed-independent-nerve-sense-four-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const int=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b;
const phrase=(v,min=25,max=900)=>typeof v==='string'&&v.trim().length>=min&&v.trim().length<=max;
const key=v=>typeof v==='string'&&/^[a-z][a-z0-9_-]{2,60}$/.test(v)&&v!=='integrated';
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const previous=p=>p?.originalBodyOrganCycleThree?.completed?
 p.originalBodyOrganCycleThree.originalCycleThreeSourceHash:null;
function mode(w,mapped){
 return w?.details?.origin===PC.MAP?(mapped?'extend':'map'):
  w?.details?.origin===PC.PRACTICE?'practice':
  w?.details?.origin===PC.REPAIR?'repair':
  w?.details?.origin===PC.FORM?'form':null;
}
function systemsValid(systems,min){
 return Array.isArray(systems)&&systems.length>=min&&
 systems.every(x=>x&&Object.keys(x).length===3&&
  key(x.id)&&phrase(x.tissue,25)&&phrase(x.actualFunction,25))&&
 new Set(systems.map(x=>x.id)).size===systems.length;
}
function witnessValid(w,p,kind,site,plan){
 const d=w?.details;
 if(w?.type!=='story'||!phrase(w.text,16)||d?.actorId!==p.actorId||
  d.location!==site||mode(w,!!plan)!==kind||!w.text.includes(p.name))return false;
 if(kind==='map'||kind==='extend'){
  if(!phrase(d.clinicalObservation)||!phrase(d.independentCountertest)||
   !systemsValid(d.systems,kind==='map'?2:1))return false;
  if(kind==='extend')return plan.location===site&&
   d.systems.every(x=>!plan.systems.some(y=>y.id===x.id));
  return phrase(d.name,3,140)&&phrase(d.metabolicLimit)&&
   phrase(d.injuryLimit)&&phrase(d.recovery);
 }
 if(!plan||plan.location!==site)return false;
 if(kind==='practice')return phrase(d.measuredResponse)&&phrase(d.fatigueLimit)&&
  (d.focus==='integrated'||plan.systems.some(x=>x.id===d.focus));
 if(kind==='repair')return phrase(d.observedDamage)&&phrase(d.restorativeMethod);
 return kind==='form'&&phrase(d.fullBodyResponse)&&phrase(d.independentFailureLimit);
}
function planFrom(w){
 const d=w.details;
 return {location:d.location,name:d.name,systems:structuredClone(d.systems),
  metabolicLimit:d.metabolicLimit,injuryLimit:d.injuryLimit,recovery:d.recovery};
}
function spec(kind,minutes,will){
 return kind==='practice'?{dc:Law.PRACTICE_DC,modifier:will,cost:Law.practiceStamina(minutes)}:
  kind==='repair'?{dc:Law.REPAIR_DC,modifier:will,cost:Law.repairStamina(minutes)}:
  kind==='form'?{dc:Law.FORMATION_DC,modifier:will,cost:Law.formationStamina(minutes)}:
  {dc:null,modifier:will,cost:0};
}
function eligible(kind,r,w){
 if(r.completed)return false;
 if(kind==='map')return !r.plan;
 if(!r.plan)return false;
 if(kind==='extend')return w.details.systems.every(x=>!Object.hasOwn(r.progress,x.id));
 if(kind==='repair')return r.strain>0;
 if(kind==='form')return Law.ready(r.progress,r.integrated,r.strain);
 return kind==='practice'&&r.strain<5&&
  !(r.integrated&&Object.values(r.progress).every(x=>x===2));
}
function blank(){return {plan:null,progress:{},integrated:false,strain:0,completed:false};}
function apply(r,kind,w,check){
 let injury=false;
 if(kind==='map'){
  r.plan=planFrom(w);
  r.progress=Object.fromEntries(r.plan.systems.map(x=>[x.id,0]));
 }else if(kind==='extend'){
  r.plan.systems.push(...structuredClone(w.details.systems));
  for(const x of w.details.systems)r.progress[x.id]=0;
 }else if(kind==='practice'){
  const g=Law.grow(r.progress,r.integrated,w.details.focus,check);
  r.progress=g.progress;r.integrated=g.integrated;
  r.strain=Math.min(100,r.strain+g.strainAdded);injury=g.strainAdded>0;
 }else if(kind==='repair')r.strain=Law.repaired(r.strain,check);
 else if(check.success)r.completed=true;
 return injury;
}
function checkRecord(roll,sp){
 const margin=roll+sp.modifier+Core.naturalAdjustment(roll)-sp.dc,
  degree=Core.degree(margin);
 return {roll,dc:sp.dc,modifier:sp.modifier,margin,degree,success:margin>=0};
}
function state(r){return {plan:structuredClone(r.plan),progress:{...r.progress},
 integrated:r.integrated,strain:r.strain,completed:r.completed};}
function verify(s,p){
 const r=p?.originalBodyNerveSenseFour;if(r===undefined)return true;
 const prior=previous(p),body=s.table?.combatants?.['npc_'+p.id],
  w=Realm.peek(s),life=w?.independentPersonLives?.people?.[p.id];
 if(!prior||!Three.verify(s,p)||!Early.verify(s,p)||
  !body?.npcOrigin?.seal||!life||!Lives.verifyEntry(w,life)||
  !r||r.origin!==ORIGIN||r.originalOrganSourceHash!==prior||
  !Array.isArray(r.sessions)||r.sessions.length<1||r.sessions.length>480)return false;
 const sim=blank(),used=new Set(),
  modifier=Math.floor((p.mechanicalFoundation.baselineAttributes.con-10)/2);
 let lastDay=-1,lastEnd=0,completionSeal=null;
 for(const row of r.sessions){
  const q=row?.source,sh=q?.shift;
  if(!q||row.seal!==hash(q)||q.origin!==ORIGIN||
   q.actorId!==p.actorId||q.identityOriginHash!==p.originHash||
   q.foundationSeal!==p.mechanicalFoundation.seal||
   q.combatSeal!==body.npcOrigin.seal||q.organSourceHash!==prior||
   !int(q.day)||q.day<=lastDay||q.day<=p.originalBodyOrganCycleThree.lastAttemptDay||
   !int(q.minute,lastEnd,s.world.minutes)||Math.floor(q.minute/1440)!==q.day||
   !sh||sh.hash!==hash(Object.fromEntries(Object.entries(sh).filter(([k])=>k!=='hash')))||
   sh.actorId!==p.actorId||sh.originHash!==p.originHash||sh.location!==q.site||
   sh.fromDay>q.day||sh.throughDay<q.day||
   q.witnessHash!==hash(q.witness)||used.has(q.witnessHash)||
   !witnessValid(q.witness,p,q.kind,q.site,sim.plan)||
   !eligible(q.kind,sim,q.witness)||
   !equal(q.before,state(sim))||
   !int(q.rngBefore,1,4294967295)||q.personality!==p.personality||
   q.chance!==Early.chance({personality:q.personality,fatigue:q.fatigue})||
   !int(q.staminaBefore,1)||!int(q.maxBefore,q.staminaBefore)||
   !equal(q.woundsBefore,[0,0,0])||
   q.noFreeCombatReactionBeastSenseOrTechnique!==true)return false;
  const roller={rngState:q.rngBefore};
  if(q.choice!==Core.die(roller,100)||q.accepted!==(q.choice<=q.chance))return false;
  const anatomical=['map','extend'].includes(q.kind),min=q.kind==='form'?30:15;
  if(anatomical?q.plannedMinutes!==0:!int(q.plannedMinutes,min,480))return false;
  const sp=spec(q.kind,q.plannedMinutes,modifier);
  let check=null,injury=false,spent=0,gain=0;
  if(q.accepted){
   if(!anatomical){spent=sp.cost;check=checkRecord(Core.die(roller,20),sp);}
   injury=apply(sim,q.kind,q.witness,check);
   if(sim.completed){gain=Law.STAMINA_GAIN;completionSeal=row.seal;}
  }
  if(q.actualMinutes!==(q.accepted?q.plannedMinutes:5)||
   q.minute+q.actualMinutes>s.world.minutes||
   !equal(check,q.check)||q.rngAfter!==roller.rngState||
   q.staminaSpent!==spent||q.staminaBefore<spent||
   q.staminaAfter!==q.staminaBefore-spent||
   q.maxAfter!==q.maxBefore+gain||
   !equal(q.woundsAfter,injury?[1,0,0]:[0,0,0])||
   !equal(q.after,state(sim)))return false;
  lastDay=q.day;lastEnd=q.minute+q.actualMinutes;used.add(q.witnessHash);
 }
 return equal(state(r),state(sim))&&r.lastAttemptDay===lastDay&&
 r.completionSourceHash===completionSeal;
}
function work(s,{actorId,witnessIndex,minutes,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId))
  throw Error('Witnessed original independent nerve work accepts actorId, prior witnessIndex and time only');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  life=w?.independentPersonLives?.people?.[p?.id],
  body=s.table?.combatants?.['npc_'+p?.id],day=Math.floor(s.world.minutes/1440),
  minute=s.world.minutes%1440,site=s.world.location,
  present=p&&Presence.resolve(w,actorId,site,day,minute);
 if(!p||!People.verify(w,p)||!life||!Lives.verifyEntry(w,life)||
  !life.interests.includes('body')||p.status!=='active'||
  p.ageBand!=='adult, exact birthday not established'||
  !previous(p)||!Three.verify(s,p)||!verify(s,p)||
  !present?.presence||present.presence.hash!==p.shift?.hash||
  body?.npcOrigin?.location!==site||
  !Places.location(s)||s.battle||s.encounter||body.status!=='ok'||
  body.stamina<1||body.wounds.some(x=>x!==0)||
  typeof s.chatRuntime?.scene!=='string'||!s.chatRuntime.scene.includes(p.name))
  throw Error('A genuinely present independent uninjured Organ III adult and original anatomical witness are required');
 const r=p.originalBodyNerveSenseFour||{...blank(),origin:ORIGIN,
  originalOrganSourceHash:previous(p),sessions:[],lastAttemptDay:-1,completionSourceHash:null};
 if(r.lastAttemptDay>=day||p.originalBodyOrganCycleThree.lastAttemptDay>=day||
  p.meridianTraining?.lastAttemptDay>=day||
  Object.values(p.originalEarlyDisciplinePreparation||{}).some(x=>x.lastAttemptDay>=day)||
  r.sessions.length>=480)throw Error('Another original personal discipline decision already occupies this day');
 if(!int(witnessIndex,0,s.log.length-1))throw Error('Actual current neural witness required');
 const wit=structuredClone(s.log[witnessIndex]),kind=mode(wit,!!r.plan),
  witnessHash=hash(wit),anatomical=['map','extend'].includes(kind),
  planned=anatomical?0:(minutes??(kind==='form'?90:60));
 if(wit.day!==E.day(s)||wit.time!==E.clock(s)||
  !witnessValid(wit,p,kind,site,r.plan)||!eligible(kind,r,wit)||
  r.sessions.some(x=>x.source.witnessHash===witnessHash)||
  (anatomical?minutes!==undefined&&!int(minutes,0,0):!int(planned,kind==='form'?30:15,480))||
  minute<8*60||minute+Math.max(5,planned)>18*60)
  throw Error('Fresh current local neural observation, actual tissue/functions and original practice/therapy/whole-body witness are required');
 const start=s.world.minutes,sp=spec(kind,planned,
  Math.floor((p.mechanicalFoundation.baselineAttributes.con-10)/2));
 if(body.stamina<sp.cost)throw Error('Original neural procedure needs actual available Combat Stamina');
 const rngBefore=p.rngState,chance=Early.chance(p),choice=Core.die(p,100),
  accepted=choice<=chance,before=state(r),staminaBefore=body.stamina,
  maxBefore=body.maxStamina,woundsBefore=[...body.wounds];
 let check=null,spent=0;
 if(accepted){
  if(!anatomical){
   const rolled=Core.check(s,{modifier:sp.modifier,dc:sp.dc,
    independentRngOwner:p,privateDisplay:true,label:p.name+' original neural '+kind});
   check=checkRecord(rolled.roll,sp);spent=sp.cost;body.stamina-=spent;
  }
  const injury=apply(r,kind,wit,check);
  if(injury)Combat.harm(s,body,2);
  if(r.completed)body.maxStamina+=Law.STAMINA_GAIN;
 }
 const q={origin:ORIGIN,actorId,identityOriginHash:p.originHash,
  foundationSeal:p.mechanicalFoundation.seal,combatSeal:body.npcOrigin.seal,
  organSourceHash:r.originalOrganSourceHash,site,shift:structuredClone(present.presence),
  kind,witness:wit,witnessHash,day,minute:start,plannedMinutes:planned,
  actualMinutes:accepted?planned:5,rngBefore,rngAfter:p.rngState,
  personality:p.personality,fatigue:p.fatigue,chance,choice,accepted,check,
  before,after:state(r),staminaBefore,staminaSpent:spent,staminaAfter:body.stamina,
  maxBefore,maxAfter:body.maxStamina,woundsBefore,woundsAfter:[...body.wounds],
  noFreeCombatReactionBeastSenseOrTechnique:true};
 const seal=hash(q);r.sessions.push({source:q,seal});r.lastAttemptDay=day;
 if(r.completed)r.completionSourceHash=seal;
 p.originalBodyNerveSenseFour=r;
 E.advance(s,q.actualMinutes);World.finalizeTime(s,start);
 if(!verify(s,p))throw Error('Original independent neural evidence failed replay');
 return {actorId,independentlyAccepted:accepted,observedAction:kind,
  formed:r.completed,elapsedMinutes:q.actualMinutes,
  noFreeCombatReactionBeastSenseOrTechnique:true,exactPrivatePowerNotDisclosed:true};
}
function privateStatus(s,p){
 if(!verify(s,p)||!previous(p))throw Error('Original private Nerve-Sense evidence was altered');
 const r=p.originalBodyNerveSenseFour;
 return {privateToGM:true,originalSourceOwner:'rules/body-nerve-sense.js',
  personallyMappedNeuralRegions:r?.plan?structuredClone(r.plan.systems):[],
  regionProgress:r?{...r.progress}:null,integrated:r?.integrated||false,
  strain:r?.strain||0,earnedNerveSenseCycle:r?.completed||false,
  sourceVerifiedStaminaCapacityGain:r?.completed?Law.STAMINA_GAIN:0,
  actualWitnessedDecisions:r?.sessions.length||0,
  noFreeCombatReactionBeastSenseOrTechnique:true};
}
module.exports={ORIGIN,verify,work,privateStatus};
