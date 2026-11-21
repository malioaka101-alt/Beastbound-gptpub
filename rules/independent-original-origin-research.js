'use strict';
// Original exact Beast-Origin Pattern Mapping, not ecological inference,
// clinical compatibility, consent, seeding or a new inherited trait.
const E=require('../engine'),Core=require('./core'),Lineage=require('./beast-origin-lineage'),
 Potential=require('./potential-mechanics'),Early=require('./independent-original-discipline-preparation'),
 Higher=require('./independent-original-higher-architectures'),Health=require('./unified'),
 World=require('./world'),Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Lives=require('../world/independent-person-lives'),Presence=require('../world/person-presence');
const ORIGIN='source-earned-independent-exact-origin-pattern-map-v1',
 hash=Lineage.hash,eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 int=(v,a=0,b=1000000000)=>Number.isInteger(v)&&v>=a&&v<=b,
 text=(v,n=25)=>typeof v==='string'&&v.trim().length>=n&&v.length<=900;
function source(s,p,id){
 try{
  const {z,q}=Lineage.gmSource(s,id);
  // No source registered for the player or another subject is assumed to
  // establish this person's biological pattern or consent.
  if(q.observation.details?.actorId!==p.actorId)return null;
  return {z,q};
 }catch{return null;}
}
function witnessValid(w,p,id,site,minute){
 const d=w?.details;
 return w?.type==='story'&&text(w.text,16)&&w.text.includes(p.name)&&
  w.day===Math.floor(minute/1440)+1&&w.time===E.clock({world:{minutes:minute}})&&
  d?.origin===Lineage.MAP&&d.actorId===p.actorId&&d.sourceId===id&&
  d.location===site&&text(d.measuredIndividualResponse)&&text(d.independentFailureLimit);
}
function mode(p,q,minutes){
 const score=p.mechanicalFoundation.unassessedPotential.bloodlineExpression;
 return Lineage.mappingSpec(q.integrationLoad,minutes,p.mechanicalFoundation.baselineAttributes.int,0,Potential.bonus(score));
}
function checkRecord(roll,sp){
 const margin=roll+sp.modifier+Core.naturalAdjustment(roll)-sp.dc;
 return {roll,modifier:sp.modifier,dc:sp.dc,margin,degree:Core.degree(margin),success:margin>=0};
}
function replay(s,p){
 const ledger=p?.originalOriginPatternResearch;
 if(ledger===undefined)return {};
 const body=s.table?.combatants?.['npc_'+p?.id],w=Realm.peek(s),life=w?.independentPersonLives?.people?.[p?.id];
 if(!body?.npcOrigin?.seal||!life||!People.verify(w,p)||!Lives.verifyEntry(w,life)||
  ledger?.origin!==ORIGIN||!Array.isArray(ledger.sessions)||!ledger.sessions.length||
  ledger.sessions.length>480)return null;
 const used=new Set(),state={};let lastDay=-1,lastEnd=0;
 for(const row of ledger.sessions){
  const q=row?.source,info=q&&source(s,p,q.sourceId),sh=q?.shift;
  if(!q||!info||q.origin!==ORIGIN||row.seal!==hash(q)||q.actorId!==p.actorId||
   q.actorOriginHash!==p.originHash||q.foundationSeal!==p.mechanicalFoundation.seal||
   q.combatSeal!==body.npcOrigin.seal||q.sourceSeal!==info.z.seal||
   !int(q.minute,Math.max(lastEnd,info.q.minute),s.world.minutes)||!int(q.day,lastDay+1)||
   q.day!==Math.floor(q.minute/1440)||!int(q.plannedMinutes,15,480)||
   q.minute%1440<480||q.minute%1440+q.plannedMinutes>1080||
   !sh||sh.hash!==hash(Object.fromEntries(Object.entries(sh).filter(([k])=>k!=='hash')))||
   sh.actorId!==p.actorId||sh.originHash!==p.originHash||sh.location!==q.site||
   sh.fromDay>q.day||sh.throughDay<q.day||sh.throughDay-sh.fromDay!==5||sh.scheduledAtDay!==sh.fromDay||
   !witnessValid(q.witness,p,q.sourceId,q.site,q.minute)||q.witnessHash!==hash(q.witness)||
   !Lineage.witnessed(s,q.witness)||used.has(q.witnessHash)||
   !int(q.rngBefore,1,4294967295)||q.personality!==p.personality||!int(q.fatigue,0,100)||
   q.chance!==Early.chance({personality:q.personality,fatigue:q.fatigue})||
   q.aptitude!==p.mechanicalFoundation.unassessedPotential.bloodlineExpression||
   !int(q.staminaBefore,1)||!int(q.maxBefore,q.staminaBefore)||
   q.noRightsTransferOrClinicalCompatibilityOrTrait!==true)return null;
  const rec=state[q.sourceId]||{progress:0,sourceSeal:info.z.seal};
  if(rec.progress>=3||q.progressBefore!==rec.progress||rec.sourceSeal!==q.sourceSeal)return null;
  const rng={rngState:q.rngBefore},spec=mode(p,info.q,q.plannedMinutes);
  if(q.staminaBefore<spec.stamina||q.choice!==Core.die(rng,100)||q.accepted!==(q.choice<=q.chance))return null;
  const check=q.accepted?checkRecord(Core.die(rng,20),spec):null,
   earned=check?.success?Core.progress(check.degree):0,spent=q.accepted?spec.stamina:0;
  rec.progress=Math.min(3,rec.progress+earned);state[q.sourceId]=rec;
  if(!eq(q.check,check)||q.rngAfter!==rng.rngState||q.earned!==earned||
   q.progressAfter!==rec.progress||q.staminaSpent!==spent||q.staminaAfter!==q.staminaBefore-spent||
   q.actualMinutes!==(q.accepted?q.plannedMinutes:5)||q.minute+q.actualMinutes>s.world.minutes)return null;
  used.add(q.witnessHash);lastDay=q.day;lastEnd=q.minute+q.actualMinutes;
 }
 return ledger.lastAttemptDay===lastDay?state:null;
}
function verify(s,p){try{return replay(s,p)!==null;}catch{return false;}}
function work(s,{actorId,sourceId,witnessIndex,minutes=90,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId)||
  !int(witnessIndex,0,s.log.length-1)||!int(minutes,15,480))
  throw Error('Actual actor, registered exact Origin source, fresh witnessed map and duration only');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  body=s.table?.combatants?.['npc_'+p?.id],life=w?.independentPersonLives?.people?.[p?.id],
  minute=s.world.minutes,day=Math.floor(minute/1440),site=s.world.location,
  present=p&&Presence.resolve(w,actorId,site,day,minute%1440),
  wit=structuredClone(s.log[witnessIndex]),info=p&&source(s,p,sourceId);
 if(!p||!People.verify(w,p)||!life||!Lives.verifyEntry(w,life)||!info||
  p.status!=='active'||p.ageBand!=='adult, exact birthday not established'||!present?.presence||
  body?.npcOrigin?.location!==site||!E.LOCATIONS[site]||s.battle||s.encounter||
  !Health.currentNpcWoundCondition(s,actorId)||body.status!=='ok'||body.wounds.some(x=>x!==0)||
  !s.chatRuntime?.scene?.includes(p.name)||!witnessValid(wit,p,sourceId,site,minute))
  throw Error('A present original adult and their own GM-registered exact individual Origin source are required');
 const state=replay(s,p);if(state===null)throw Error('Original independent Origin research history was altered');
 const r=p.originalOriginPatternResearch||{origin:ORIGIN,sessions:[],lastAttemptDay:-1},
  prior=state[sourceId]?.progress||0,spec=mode(p,info.q,minutes),witnessHash=hash(wit);
 if(prior>=3||r.sessions.length>=480||r.lastAttemptDay>=day||Higher.usedDay(p,day)||
  r.sessions.some(x=>x.source.witnessHash===witnessHash)||minute<info.q.minute||
  minute%1440<480||minute%1440+minutes>1080||body.stamina<spec.stamina)
  throw Error('A fresh paid independent mapping session and unused personal discipline day are required');
 Lineage.archive(s,info.q.observation);Lineage.archive(s,wit);
 const rngBefore=p.rngState,chance=Early.chance(p),choice=Core.die(p,100),accepted=choice<=chance,
  staminaBefore=body.stamina,maxBefore=body.maxStamina;
 let check=null,spent=0,earned=0;
 if(accepted){
  const c=Core.check(s,{modifier:spec.modifier,dc:spec.dc,independentRngOwner:p,privateDisplay:true,
   label:p.name+' exact original individual Origin mapping'});
  check=checkRecord(c.roll,spec);spent=spec.stamina;body.stamina-=spent;
  earned=check.success?Core.progress(check.degree):0;
 }
 const q={origin:ORIGIN,actorId,actorOriginHash:p.originHash,foundationSeal:p.mechanicalFoundation.seal,
  combatSeal:body.npcOrigin.seal,sourceId,sourceSeal:info.z.seal,minute,day,site,
  shift:structuredClone(present.presence),witness:wit,witnessHash,plannedMinutes:minutes,
  actualMinutes:accepted?minutes:5,rngBefore,rngAfter:p.rngState,personality:p.personality,
  fatigue:p.fatigue,chance,choice,accepted,check,aptitude:p.mechanicalFoundation.unassessedPotential.bloodlineExpression,
  staminaBefore,maxBefore,staminaSpent:spent,staminaAfter:body.stamina,earned,
  progressBefore:prior,progressAfter:Math.min(3,prior+earned),noRightsTransferOrClinicalCompatibilityOrTrait:true};
 r.sessions.push({source:q,seal:hash(q)});r.lastAttemptDay=day;p.originalOriginPatternResearch=r;
 E.advance(s,q.actualMinutes);World.finalizeTime(s,minute);
 if(!verify(s,p))throw Error('Original independent Origin map evidence failed replay');
 return {actorId,independentlyAccepted:accepted,mapped:q.progressAfter===3,
  elapsedMinutes:q.actualMinutes,noRightsTransferOrClinicalCompatibilityOrTrait:true};
}
function privateStatus(s,p){
 if(!p?.originalOriginPatternResearch)return null;
 const state=replay(s,p);if(!state)throw Error('Original independent Origin research invalid');
 return {privateToGM:true,patterns:Object.entries(state).map(([sourceId,r])=>({
  sourceId,sourceHash:r.sourceSeal,progress:r.progress,personallyMapped:r.progress===3})),
  noRightsTransferOrClinicalCompatibilityOrTrait:true};
}
module.exports={ORIGIN,verify,work,privateStatus};
