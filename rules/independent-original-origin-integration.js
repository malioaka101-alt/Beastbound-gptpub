'use strict';
// Original human Beast-Origin biological stages III–VIII; first adapter
// deliberately handles only actually witnessed endogenous self-cultivation.
// A donor's tissue, a purchased relic or a synthetic sample is NOT inferred
// from an ordinary item count. No automatic new active beast ability.
const E=require('../engine'),Core=require('./core'),Combat=require('./combat'),
 Health=require('./unified'),World=require('./world'),Lineage=require('./beast-origin-lineage'),
 PC=require('./beast-origin-integration'),Research=require('./independent-original-origin-research'),
 Potential=require('./potential-mechanics'),Early=require('./independent-original-discipline-preparation'),
 Higher=require('./independent-original-higher-architectures'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),Lives=require('../world/independent-person-lives'),
 Presence=require('../world/person-presence');
const ORIGIN='source-earned-independent-original-endogenous-origin-integration-v1',
 hash=Lineage.hash,eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 int=(v,a=0,b=1000000000)=>Number.isInteger(v)&&v>=a&&v<=b,
 text=(v,a=25)=>typeof v==='string'&&v.trim().length>=a&&v.length<=900;
function prerequisite(s,p,id){
 const {z,q}=Lineage.gmSource(s,id,p.actorId),proof=Research.integrationProof(s,p,id);
 if(!proof||!q.rights?.verified||q.energyMode!=='metabolic'||
  !text(q.humanExpression)||!text(q.independentAdaptationLimit)||
  (q.effectAdapter!=null&&q.effectAdapter!=='local-footing'))return null;
 const auth=PC.authorisation(s,id,z.seal,q,p.actorId);
 if(auth.source.mode!=='self-endogenous'||auth.source.material.mode!=='endogenous'||
  !['owned-ancestry','authenticated-self-research'].includes(q.rights.mode)||
  auth.source.witness.details.actorId!==p.actorId)return null;
 // All actual verified observations must precede any physiological work.
 const researchRows=p.originalOriginPatternResearch.sessions.filter(x=>
  [proof.mappingSeal,...Object.values(proof.screens)].includes(x.seal));
 if(researchRows.length!==5)return null;
 const end=Math.max(q.minute,auth.source.minute,...researchRows.map(x=>x.source.minute+x.source.actualMinutes));
 return {q,proof,auth,end};
}
function blank(base){
 return {next:3,capacity:E.HUMAN_ORIGIN_BASELINE.capacity,load:0,rejectionRisk:0,
  strain:0,candidate:null,stableTraits:[],seededAt:null,lastEnd:base.end,lastDay:-1,firstCompletion:null,
  expressionSeal:null};
}
function view(state){
 return {next:state.next,capacity:state.capacity,load:state.load,rejectionRisk:state.rejectionRisk,
 strain:state.strain,candidate:state.candidate,stableTraits:[...state.stableTraits],seededAt:state.seededAt};
}
function mode(p,q,step){
 const rule=step==='care'?{attribute:'wis'}:PC.RULES[step],
  dimension=step==='care'?null:Potential.ORIGIN_STEPS[step],
  aptitude=dimension===null?0:Potential.bonus(p.mechanicalFoundation.unassessedPotential[dimension]),
  attr=p.mechanicalFoundation.baselineAttributes[rule.attribute];
 return {dimension,aptitude,...(step==='care'?
  {dc:15,modifier:Math.floor((attr-10)/2),cost:2,minimum:45}:
  PC.stageSpec(step,q.integrationLoad,attr,0,aptitude))};
}
function witnessValid(s,p,a){
 const w=a.witness,d=w?.details;
 if(w?.type!=='story'||!text(w.text,16)||!w.text.includes(p.name)||
  w.day!==a.day+1||w.time!==E.clock({world:{minutes:a.minute}})||
  d?.actorId!==p.actorId||d.location!==a.site||d.sourceId!==a.sourceId||
  !text(d.independentIndividualEndogenousRights)||d.actualSelfOwnedMechanism!==true)return false;
 try{return eq(PC.stageWitness({...s,world:{...s.world,location:a.site},log:[w]},0,a.sourceId,a.step),w);}
 catch{return false;}
}
function allowed(state,step,minute,load){
 if(step==='care')return state.strain>0;
 return step===state.next&&state.next<=8&&state.strain<5&&
  (step===3?state.candidate===null&&state.load+load<=state.capacity:state.candidate!==null)&&
  (step!==4||minute>=state.seededAt+90);
}
function checkRecord(roll,sp){
 const margin=roll+sp.modifier+Core.naturalAdjustment(roll)-sp.dc;
 return {roll,modifier:sp.modifier,dc:sp.dc,margin,degree:Core.degree(margin),success:margin>=0};
}
function apply(state,a,q,check,seal){
 if(!a.accepted)return false;
 if(a.step==='care'){
  if(check.success)state.strain=Math.max(0,state.strain-2);
  return false;
 }
 const result=PC.stageConsequence(a.step,q.integrationLoad,check);
 state.strain=Math.min(100,state.strain+result.strainAdded);
 state.rejectionRisk=Math.min(100,state.rejectionRisk+result.riskAdded);
 if(check.success){
  if(a.step===3){state.load+=result.loadAdded;state.candidate=a.sourceId;state.seededAt=a.minute;}
  if(a.step===6)state.expressionSeal=seal;
  if(a.step===8){
   state.stableTraits.push('human_origin_'+a.sourceId);state.candidate=null;state.firstCompletion=seal;
  }
  state.next++;
 }
 return result.strainAdded>0;
}
function replay(s,p){
 const l=p?.originalOriginIntegrations;
 if(l===undefined)return null;
 const w=Realm.peek(s),body=s.table?.combatants?.['npc_'+p?.id],life=w?.independentPersonLives?.people?.[p?.id];
 if(!body?.npcOrigin?.seal||!life||!People.verify(w,p)||!Lives.verifyEntry(w,life)||
  l.origin!==ORIGIN||!Array.isArray(l.rows)||!l.rows.length||l.rows.length>480)return null;
 const base=prerequisite(s,p,l.sourceId);
 if(!base||l.sourceSeal!==base.proof.sourceSeal||l.authSeal!==base.auth.seal||
  !eq(l.clinicalProof,base.proof))return null;
 const state=blank(base),used=new Set();
 for(const row of l.rows){
  const a=row?.source,sh=a?.shift;
  if(!a||row.seal!==hash(a)||a.origin!==ORIGIN||a.actorId!==p.actorId||
   a.identityOriginHash!==p.originHash||a.foundationSeal!==p.mechanicalFoundation.seal||
   a.combatSeal!==body.npcOrigin.seal||a.sourceId!==l.sourceId||a.sourceSeal!==l.sourceSeal||
   a.authSeal!==l.authSeal||!eq(a.clinicalProof,base.proof)||
   !int(a.minute,state.lastEnd,s.world.minutes)||!int(a.day,state.lastDay+1)||
   a.day!==Math.floor(a.minute/1440)||!allowed(state,a.step,a.minute,base.q.integrationLoad)||
   !eq(a.before,view(state))||!witnessValid(s,p,a)||a.witnessHash!==hash(a.witness)||
   !Lineage.witnessed(s,a.witness)||used.has(a.witnessHash)||
   !sh||sh.hash!==hash(Object.fromEntries(Object.entries(sh).filter(([k])=>k!=='hash')))||
   sh.actorId!==p.actorId||sh.originHash!==p.originHash||sh.location!==a.site||
   sh.fromDay>a.day||sh.throughDay<a.day||sh.throughDay-sh.fromDay!==5||sh.scheduledAtDay!==sh.fromDay||
   !int(a.rngBefore,1,4294967295)||a.personality!==p.personality||!int(a.fatigue,0,100)||
   a.chance!==Early.chance({personality:a.personality,fatigue:a.fatigue})||
   !int(a.staminaBefore,1)||!int(a.maxBefore,a.staminaBefore)||a.maxAfter!==a.maxBefore||
   !eq(a.woundsBefore,[0,0,0])||a.noSpeciesAbilityOrAutomaticHumanStage!==true)return null;
  const sp=mode(p,base.q,a.step),rng={rngState:a.rngBefore};
  if(!eq(a.law,sp)||!int(a.plannedMinutes,sp.minimum,480)||a.minute%1440<480||
   a.minute%1440+a.plannedMinutes>1080||a.staminaBefore<sp.cost||
   a.choice!==Core.die(rng,100)||a.accepted!==(a.choice<=a.chance))return null;
  const check=a.accepted?checkRecord(Core.die(rng,20),sp):null,
   wounded=apply(state,a,base.q,check,row.seal),spent=a.accepted?sp.cost:0;
  if(!eq(a.check,check)||a.rngAfter!==rng.rngState||a.staminaSpent!==spent||
   a.staminaAfter!==a.staminaBefore-spent||!eq(a.woundsAfter,wounded?[1,0,0]:[0,0,0])||
   a.actualMinutes!==(a.accepted?a.plannedMinutes:5)||a.minute+a.actualMinutes>s.world.minutes||
   !eq(a.after,view(state)))return null;
  if(a.accepted&&a.step===3){
   if(!eq(a.material,{mode:'endogenous',originIdentityHash:base.auth.seal}))return null;
  }else if(!eq(a.material,{mode:'none'}))return null;
  used.add(a.witnessHash);state.lastEnd=a.minute+a.actualMinutes;state.lastDay=a.day;
 }
 return l.lastAttemptDay===state.lastDay?state:null;
}
function verify(s,p){if(p?.originalOriginIntegrations===undefined)return true;try{return replay(s,p)!==null;}catch{return false;}}
function work(s,{actorId,sourceId,witnessIndex,minutes,...extra}={},care=false){
 if(Object.keys(extra).length||typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId)||
  !int(witnessIndex,0,s.log.length-1)||typeof sourceId!=='string')
  throw Error('Original individual, exact source, fresh biological witness and duration only');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  body=s.table?.combatants?.['npc_'+p?.id],life=w?.independentPersonLives?.people?.[p?.id],
  minute=s.world.minutes,day=Math.floor(minute/1440),site=s.world.location,
  present=p&&Presence.resolve(w,actorId,site,day,minute%1440),witness=structuredClone(s.log[witnessIndex]);
 if(!p||!People.verify(w,p)||!life||!Lives.verifyEntry(w,life)||p.status!=='active'||
  p.ageBand!=='adult, exact birthday not established'||!present?.presence||body?.npcOrigin?.location!==site||
  !E.LOCATIONS[site]||s.battle||s.encounter||!Health.currentNpcWoundCondition(s,actorId)||
  body.status!=='ok'||body.wounds.some(x=>x!==0)||!s.chatRuntime?.scene?.includes(p.name))
  throw Error('Actual present uninjured independent human required for original biological integration');
 const base=prerequisite(s,p,sourceId),old=p.originalOriginIntegrations;
 if(!base||old&&old.sourceId!==sourceId||p.originalHumanEvolution)
  throw Error('Actual completed mapping and four clinical sources, original self-endogenous rights and unchanged human anatomy required');
 const state=old?replay(s,p):blank(base);
 if(!state)throw Error('Original independent biological integration history altered');
 const step=care?'care':state.next;
 if(!allowed(state,step,minute,base.q.integrationLoad))
  throw Error('Original next biological stage, occupied capacity, rejection window or care prerequisite not satisfied');
 const sp=mode(p,base.q,step),planned=minutes??(care?60:Math.max(90,sp.minimum)),
  l=old||{origin:ORIGIN,sourceId,sourceSeal:base.proof.sourceSeal,authSeal:base.auth.seal,
   clinicalProof:base.proof,rows:[],lastAttemptDay:-1};
 const a={origin:ORIGIN,actorId,identityOriginHash:p.originHash,foundationSeal:p.mechanicalFoundation.seal,
  combatSeal:body.npcOrigin.seal,sourceId,sourceSeal:l.sourceSeal,authSeal:l.authSeal,clinicalProof:base.proof,
  step,site,day,minute,shift:structuredClone(present.presence),witness,witnessHash:hash(witness),
  law:sp,plannedMinutes:planned,before:view(state),noSpeciesAbilityOrAutomaticHumanStage:true};
 if(!witnessValid(s,p,a)||!int(planned,sp.minimum,480)||minute<state.lastEnd||state.lastDay>=day||
  Higher.usedDay(p,day)||minute%1440<480||minute%1440+planned>1080||body.stamina<sp.cost||
  l.rows.length>=480||l.rows.some(x=>x.source.witnessHash===a.witnessHash))
  throw Error('Fresh paid original biological evidence and safe unused personal discipline day required');
 Lineage.archive(s,base.auth.source.witness);Lineage.archive(s,witness);
 const rngBefore=p.rngState,chance=Early.chance(p),choice=Core.die(p,100),accepted=choice<=chance,
  staminaBefore=body.stamina,maxBefore=body.maxStamina,woundsBefore=[...body.wounds];
 let check=null,material={mode:'none'};
 if(accepted){
  const actual=Core.check(s,{modifier:sp.modifier,dc:sp.dc,independentRngOwner:p,privateDisplay:true,
   label:p.name+' original endogenous Origin '+(care?'clinical care':PC.STEPS[step])});
  check=checkRecord(actual.roll,sp);body.stamina-=sp.cost;
  if(step===3)material={mode:'endogenous',originIdentityHash:base.auth.seal};
  if(apply(state,{...a,accepted},base.q,check,null))Combat.harm(s,body,2);
 }
 Object.assign(a,{rngBefore,rngAfter:p.rngState,personality:p.personality,fatigue:p.fatigue,chance,choice,
  accepted,check,material,actualMinutes:accepted?planned:5,staminaBefore,
  staminaSpent:accepted?sp.cost:0,staminaAfter:body.stamina,maxBefore,maxAfter:body.maxStamina,
  woundsBefore,woundsAfter:[...body.wounds],after:view(state)});
 l.rows.push({source:a,seal:hash(a)});l.lastAttemptDay=day;p.originalOriginIntegrations=l;
 E.advance(s,a.actualMinutes);World.finalizeTime(s,minute);
 if(!verify(s,p))throw Error('Original independent endogenous human integration failed replay');
 return {actorId,independentlyAccepted:accepted,elapsedMinutes:a.actualMinutes,
  noSpeciesAbilityOrAutomaticHumanStage:true,privateToGM:true};
}
function privateStatus(s,p){
 if(!p?.originalOriginIntegrations)return null;
 const state=replay(s,p);if(!state)throw Error('Original independent endogenous Origin history altered');
 return {privateToGM:true,sourceId:p.originalOriginIntegrations.sourceId,...view(state),
  actualHumanExpressionSource:state.expressionSeal,completedIndividualTraitSource:state.firstCompletion,
  noSpeciesAbilityOrAutomaticHumanStage:true};
}
module.exports={ORIGIN,verify,privateStatus,work,care:(s,p)=>work(s,p,true)};
