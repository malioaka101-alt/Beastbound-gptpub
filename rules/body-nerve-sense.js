'use strict';
// #13 first vertical slice: original Nerve–Sense bodily refinement, after the
// currently source-earned Organ Cycle route. No copied beast sense, free
// technique, immutable age gate, universal tutor, or independent power ladder.
// Other culturally grounded body-cycle orders can use additional verified
// anatomical source routes; cycle IV is not a magical permission from a name.
const Crypto=require('node:crypto'),E=require('../engine.js'),C=require('./core'),
 D=require('./disciplines'),U=require('./unified'),Combat=require('./combat'),
 World=require('./world'),Places=require('../world/lived-places');
const SOURCE='earned-neural-physique-refinement-v1',
 MAP='witnessed-original-human-neural-anatomy-v1',
 PRACTICE='witnessed-original-neural-function-adaptation-v1',
 FORM='witnessed-original-whole-body-neural-integration-v1',
 REPAIR='witnessed-original-nerve-adaptation-injury-treatment-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const int=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b;
const phrase=(x,a=12,b=850)=>typeof x==='string'&&x.trim().length>=a&&x.trim().length<=b;
const key=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{2,60}$/.test(x);
const only=(p,k)=>p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).every(x=>k.includes(x));
function context(s){
 const p=s.player,body=p?.body,combatant=s.table?.combatants?.player;
 if(!body||!Array.isArray(body.cycles)||body.cycles.length<3||
  body.cycles[2]!=='Organ Cycle'||!s.table?.organCycleWork?.completed)
  throw Error('This integrated original neural route needs a genuinely earned full-body organ foundation');
 D.organEarned(s);
 const loc=Places.location(s);
 if(!loc||s.battle||s.encounter||!combatant||combatant.status!=='ok')
  throw Error('Neural refinement requires real conscious tissue, stable health and a safe present location');
 return {p,body,combatant,loc,organHash:hash(body.organAdaptation)};
}
function witness(s,index,origin){
 if(!int(index,0,s.log.length-1))throw Error('A prior actual witnessed neural observation is needed');
 const e=s.log[index];
 if(e?.type!=='story'||e.details?.origin!==origin||
  e.details?.location!==s.world.location||!phrase(e.text,16,900))
  throw Error('The individual neural source is not an actual locally witnessed observation');
 return structuredClone(e);
}
function verify(s){
 const b=s.player?.body,net=s.table?.bodyRefinement?.neural;
 if(!net)return !b?.cycles?.includes('Nerve-Sense Cycle');
 const z=net?.source;
 if(net.origin!==SOURCE||net.seal!==hash(z)||
  z?.origin!==SOURCE||z.organHash!==hash(b?.organAdaptation)||
  !phrase(z.name,3,140)||!phrase(z.metabolicLimit,25,900)||
  !phrase(z.injuryLimit,25,900)||!phrase(z.recovery,25,900)||
  !int(z.minute,0,s.world.minutes)||
  !Array.isArray(z.systems)||z.systems.length<2||
  z.systems.some(x=>!key(x.id)||!phrase(x.tissue,25,900)||
   !phrase(x.actualFunction,25,900))||
  new Set(z.systems.map(x=>x.id)).size!==z.systems.length||
  !z.witness||z.witnessHash!==hash(z.witness)||
  z.witness.details?.origin!==MAP||
  !Array.isArray(net.extensions)||!Array.isArray(net.attempts)||!Array.isArray(net.repairs)||
  !Array.isArray(net.tests)||
  !net.progress||typeof net.progress!=='object'||
  !int(net.strain,0,100))return false;
 const progress=Object.fromEntries(z.systems.map(x=>[x.id,0]));
 let integrated=false,strain=0,success=null,last=z.minute;
 const used=new Set([z.witnessHash]),history=[
  ...net.extensions.map(x=>({kind:'extend',r:x})),
  ...net.attempts.map(x=>({kind:'practice',r:x})),
  ...net.repairs.map(x=>({kind:'repair',r:x})),
  ...net.tests.map(x=>({kind:'test',r:x}))
 ].sort((a,b)=>a.r.source.minute-b.r.source.minute);
 for(const {kind,r} of history){
  const a=r?.source;
  // A later GM-witnessed anatomical discovery develops the same physiology,
  // without replacing earlier earned evidence or inventing a new cycle.
  if(kind==='extend'){
   if(r?.origin!==SOURCE||r.seal!==hash(a)||
    a?.origin!==SOURCE||a.kind!=='extend'||
    !int(a.minute,last,s.world.minutes)||success||
    !Array.isArray(a.systems)||a.systems.length<1||
    a.systems.some(x=>!key(x.id)||!phrase(x.tissue,25,900)||
     !phrase(x.actualFunction,25,900))||
    !a.witness||a.witnessHash!==hash(a.witness)||
    a.witness.details?.origin!==MAP||
    a.witness.details?.location!==z.witness.details.location||
    !phrase(a.witness.details?.clinicalObservation,25,900)||
    !phrase(a.witness.details?.independentCountertest,25,900)||
    used.has(a.witnessHash))return false;
   const ids=a.systems.map(x=>x.id);
   if(new Set(ids).size!==ids.length||
    ids.some(id=>Object.hasOwn(progress,id)))return false;
   for(const id of ids)progress[id]=0;
   used.add(a.witnessHash);
   last=a.minute;
   continue;
  }
  if(r?.origin!==SOURCE||r.seal!==hash(a)||
   a?.origin!==SOURCE||a.kind!==kind||
   !int(a.minute,last,s.world.minutes)||!int(a.minutes,15,480)||
   !int(a.staminaSpent,1,20)||!int(a.roll,1,20)||
   a.check?.roll!==a.roll||
   !a.checkEvent||a.checkEventHash!==hash(a.checkEvent)||
   a.checkEvent.type!=='roll'||hash(a.checkEvent.details)!==hash(a.check)||
   !a.witness||a.witnessHash!==hash(a.witness)||
   a.witness.details?.origin!==(kind==='practice'?PRACTICE:kind==='repair'?REPAIR:FORM)||
   used.has(a.witnessHash))return false;
  used.add(a.witnessHash);
  if(kind==='practice'){
   if(success||!key(a.focus)||!(a.focus==='integrated'||Object.hasOwn(progress,a.focus))||
    a.earned!==(a.check.success?a.check.progress:0)||
    a.strainAdded!==(a.check.degree==='severe failure'?3:0)||
    !a.after||typeof a.after!=='object')return false;
   if(a.focus==='integrated'&&a.earned)integrated=true;
   if(a.earned){
    for(const id of Object.keys(progress))
     if(a.focus===id||a.focus==='integrated')
      progress[id]=Math.min(2,progress[id]+(a.focus==='integrated'?
       (a.check.degree==='exceptional'?2:1):a.earned));
   }
   if(hash(a.after)!==hash(progress))return false;
   strain=Math.min(100,strain+a.strainAdded);
  }else if(kind==='repair'){
   if(a.strainBefore!==strain||
    a.strainAfter!==(a.check.success?Math.max(0,strain-2):strain))
    return false;
   strain=a.strainAfter;
  }else{
   if(a.formed!==a.check.success||!integrated||
    Object.values(progress).some(x=>x!==2)||
    a.strainAtAttempt>2)return false;
   if(a.formed){
    if(success)return false;
    success=r;
    if(a.capacity?.oldMaxStamina===undefined||
     a.capacity.newMaxStamina!==a.capacity.oldMaxStamina+1||
     a.capacity.newStamina!==a.capacity.oldStamina-a.staminaSpent||
     !int(a.capacity.oldStamina,a.staminaSpent,100000))
     return false;
   }else if(a.capacity!==null)return false;
  }
  last=a.minute+a.minutes;
 }
 if(hash(net.progress)!==hash(progress)||net.integrated!==integrated||net.strain!==strain||
  !!net.transition!==!!success||
  (success&&(net.transition.seal!==success.seal||
   hash(net.transition.source)!==hash(success.source))))return false;
 if(!!success!==b.cycles.includes('Nerve-Sense Cycle'))return false;
 if(success){
  if(b.nerveSenseProof?.source!==SOURCE||
   b.nerveSenseProof?.transitionHash!==success.seal||
   b.nerveSenseProof?.integrationMinute!==success.source.minute+success.source.minutes||
   !int(s.player.maxStamina,success.source.capacity.newMaxStamina,100000))
   return false;
 }
 return true;
}
function map(s,p={}){
 if(!only(p,['name','systems','metabolicLimit','injuryLimit','recovery','witnessIndex'])||
  !phrase(p.name,3,140)||!Array.isArray(p.systems)||p.systems.length<2||
  p.systems.some(x=>!only(x,['id','tissue','actualFunction'])||
   !key(x.id)||!phrase(x.tissue,25,900)||!phrase(x.actualFunction,25,900))||
  new Set(p.systems.map(x=>x.id)).size!==p.systems.length||
  !phrase(p.metabolicLimit,25,900)||!phrase(p.injuryLimit,25,900)||
  !phrase(p.recovery,25,900))
  throw Error('Original observed neural regions, actual tissue functions and metabolism need a genuine authored mapping');
 const {body,organHash}=context(s);
 if(s.table.bodyRefinement?.neural)throw Error('Existing physical neural refinement cannot be overwritten');
 const e=witness(s,p.witnessIndex,MAP);
 if(!phrase(e.details?.clinicalObservation,25,900)||
  !phrase(e.details?.independentCountertest,25,900))
  throw Error('Physical neural tissue and an independent sensory/functional countertest must be observed');
 const z={origin:SOURCE,organHash,minute:s.world.minutes,
  name:p.name.trim(),systems:p.systems.map(x=>({
   id:x.id,tissue:x.tissue.trim(),actualFunction:x.actualFunction.trim()})),
  metabolicLimit:p.metabolicLimit.trim(),injuryLimit:p.injuryLimit.trim(),
  recovery:p.recovery.trim(),witness:e,witnessHash:hash(e)};
 const rec={origin:SOURCE,source:z,seal:hash(z),
  progress:Object.fromEntries(z.systems.map(x=>[x.id,0])),
  integrated:false,strain:0,extensions:[],attempts:[],repairs:[],tests:[],transition:null};
 s.table.bodyRefinement||={};s.table.bodyRefinement.neural=rec;
 return {mapped:true,systems:z.systems.map(x=>x.id),cycleCompleted:false,
  noAutomaticNewSensesOrBeastTraits:true};
}
function extend(s,p={}){
 if(!only(p,['systems','witnessIndex'])||
  !Array.isArray(p.systems)||p.systems.length<1||
  p.systems.some(x=>!only(x,['id','tissue','actualFunction'])||
   !key(x.id)||!phrase(x.tissue,25,900)||!phrase(x.actualFunction,25,900)))
  throw Error('Newly discovered neural tissue needs individually observed original anatomy and functions');
 context(s);
 const r=s.table.bodyRefinement?.neural;
 if(!r||!verify(s))throw Error('The original neural map and its prior physical receipts must verify');
 if(r.transition)throw Error('A completed cycle cannot be rewritten by a later mapping; further refinement needs its own genuine evidence');
 const seen=new Set([...r.source.systems,...r.extensions.flatMap(x=>x.source.systems)].map(x=>x.id));
 const ids=p.systems.map(x=>x.id);
 if(new Set(ids).size!==ids.length||ids.some(id=>seen.has(id)))
  throw Error('The new neural region must have its own unique individual tissue identity');
 const e=witness(s,p.witnessIndex,MAP);
 if(!phrase(e.details?.clinicalObservation,25,900)||
  !phrase(e.details?.independentCountertest,25,900)||
  e.details.location!==r.source.witness.details.location)
  throw Error('A distinct measured anatomical source and independent functional countertest are required');
 const witnessHash=hash(e);
 if(witnessHash===r.source.witnessHash||
  r.extensions.some(x=>x.source.witnessHash===witnessHash))
  throw Error('The same original observation cannot be reused to author more physical regions');
 const systems=p.systems.map(x=>({
  id:x.id,tissue:x.tissue.trim(),actualFunction:x.actualFunction.trim()}));
 const source={origin:SOURCE,kind:'extend',minute:s.world.minutes,
  systems,witness:e,witnessHash};
 r.extensions.push({origin:SOURCE,source,seal:hash(source)});
 for(const x of systems)r.progress[x.id]=0;
 if(!verify(s))throw Error('The later individual tissue discovery could not be verified against original work');
 return {extended:true,addedSystems:ids,
  systems:structuredClone(r.progress),cycleCompleted:false,
  noAutomaticAbilitiesOrRefinementRank:true};
}
function practice(s,p={}){
 if(!only(p,['focus','witnessIndex','minutes'])||!key(p.focus)||
  !int(p.minutes??60,15,480))
  throw Error('Real individual neural training needs observed focus and physical exertion time');
 const {p:player}=context(s),r=s.table.bodyRefinement?.neural;
 if(!r||!verify(s))throw Error('Original bodily nerve map or earned source history is invalid');
 if(!Object.hasOwn(r.progress,p.focus)&&p.focus!=='integrated')
  throw Error('Neural adaptation must involve an established actual observed tissue region');
 if(r.transition||Object.values(r.progress).every(x=>x===2)&&r.integrated)
  throw Error('Neural refinement already has sufficient whole-body work for a separate integration trial');
 if(r.strain>=5)throw Error('Real observed nerve strain needs restorative work');
 const e=witness(s,p.witnessIndex,PRACTICE);
 if(!phrase(e.details?.measuredResponse,25,900)||
  !phrase(e.details?.fatigueLimit,25,900))
  throw Error('Neural adaptation needs measured reaction and a genuine fatigue threshold');
 if(r.attempts.some(x=>x.source.witnessHash===hash(e)))
  throw Error('The original neural training event cannot be rolled twice');
 const minutes=p.minutes??60,staminaSpent=Math.ceil(minutes/90)+1;
 if(!int(player.stamina,staminaSpent,100000))
  throw Error('Physical neural training requires real current Stamina');
 const minute=s.world.minutes;
 player.stamina-=staminaSpent;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=player.stamina;
 const check=C.check(s,{modifier:Math.floor(((player.attributes?.con??10)-10)/2)+
  2*(player.skills?.survival?.rank||0),dc:18,
  label:'Physically observed Nerve–Sense integration'});
 const rollEvent=structuredClone(s.log.at(-1));
 const earned=check.success?check.progress:0,
  strainAdded=check.degree==='severe failure'?3:0;
 if(earned){
  if(p.focus==='integrated')r.integrated=true;
  for(const id of Object.keys(r.progress))
   if(id===p.focus||p.focus==='integrated')
    r.progress[id]=Math.min(2,r.progress[id]+(p.focus==='integrated'?
      (check.degree==='exceptional'?2:1):earned));
 }
 r.strain=Math.min(100,r.strain+strainAdded);
 if(strainAdded){
  U.ensurePlayer(s);Combat.harm(s,Combat.get(s,'player'),2);
  U.sync(s,{source:'wounds'});
 }
 const source={origin:SOURCE,kind:'practice',focus:p.focus,minute,minutes,
  staminaSpent,check:structuredClone(check),
  checkEvent:rollEvent,checkEventHash:hash(rollEvent),roll:check.roll,
  earned,strainAdded,after:structuredClone(r.progress),
  witness:e,witnessHash:hash(e)};
 r.attempts.push({origin:SOURCE,source,seal:hash(source)});
 E.advance(s,minutes);World.finalizeTime(s,minute);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Real observed neural work or prior whole-body physiology no longer verifies');
 return {practised:true,check,earned,systems:structuredClone(r.progress),
  integrated:r.integrated,strain:r.strain,staminaSpent,minutes,
  noAutomaticSensoryArt:true};
}
function repair(s,p={}){
 if(!only(p,['witnessIndex','minutes'])||!int(p.minutes??60,15,480))
  throw Error('Clinical nerve-restoration practice needs a witnessed original diagnosis and real time');
 const {p:player}=context(s),r=s.table.bodyRefinement?.neural;
 if(!r||!verify(s)||!r.strain)throw Error('No actual registered neural strain is present');
 const e=witness(s,p.witnessIndex,REPAIR);
 if(!phrase(e.details?.observedDamage,25,900)||
  !phrase(e.details?.restorativeMethod,25,900))
  throw Error('Original nerve injury and credible physical restoration need an independent witness');
 if(r.repairs.some(x=>x.source.witnessHash===hash(e)))
  throw Error('One neural injury treatment may not be rolled twice');
 const minutes=p.minutes??60,staminaSpent=Math.ceil(minutes/120)+1;
 if(!int(player.stamina,staminaSpent,100000))
  throw Error('Nerve recovery requires real physical Stamina');
 const minute=s.world.minutes,old=r.strain;
 player.stamina-=staminaSpent;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=player.stamina;
 const check=C.check(s,{modifier:Math.floor(((player.attributes?.con??10)-10)/2)+
  2*(player.skills?.survival?.rank||0),dc:15,
  label:'Source-observed neural and metabolic injury therapy'});
 const rollEvent=structuredClone(s.log.at(-1));
 r.strain=check.success?Math.max(0,r.strain-2):r.strain;
 const source={origin:SOURCE,kind:'repair',minute,minutes,staminaSpent,
  check:structuredClone(check),checkEvent:rollEvent,
  checkEventHash:hash(rollEvent),roll:check.roll,
  witness:e,witnessHash:hash(e),strainBefore:old,strainAfter:r.strain};
 r.repairs.push({origin:SOURCE,source,seal:hash(source)});
 E.advance(s,minutes);World.finalizeTime(s,minute);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Original clinical nerve treatment source was altered');
 return {attempted:true,treated:check.success,check,
  strain:r.strain,staminaSpent,minutes,noInstantMajorWoundHealing:true};
}
function finish(s,p={}){
 if(!only(p,['witnessIndex','minutes'])||!int(p.minutes??90,30,480))
  throw Error('Whole-body neural integration requires a separate observed physical trial');
 const {p:player,body}=context(s),r=s.table.bodyRefinement?.neural;
 if(!r||!verify(s)||!r.integrated||
  Object.values(r.progress).some(x=>x!==2)||r.strain>2)
  throw Error('The original observed nerve regions must all be physically integrated without unresolved overload');
 const e=witness(s,p.witnessIndex,FORM);
 if(!phrase(e.details?.fullBodyResponse,25,900)||
  !phrase(e.details?.independentFailureLimit,25,900))
  throw Error('An independently tested whole-body neural response and actual functional limit must be witnessed');
 if(r.tests.some(x=>x.source.witnessHash===hash(e)))
  throw Error('One original nerve breakthrough trial cannot be rerolled');
 const minutes=p.minutes??90,staminaSpent=3+Math.ceil(minutes/90);
 if(!int(player.stamina,staminaSpent,100000))
  throw Error('Real stamina is needed to sustain a whole-body nervous system trial');
 const minute=s.world.minutes,oldStamina=player.stamina,oldMaxStamina=player.maxStamina;
 player.stamina-=staminaSpent;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=player.stamina;
 const check=C.check(s,{modifier:Math.floor(((player.attributes?.con??10)-10)/2)+
  2*(player.skills?.survival?.rank||0),dc:21,
  label:'Independent full-body Nerve–Sense Cycle integration'});
 const rollEvent=structuredClone(s.log.at(-1));let capacity=null;
 if(check.success){
  body.cycles.push('Nerve-Sense Cycle');
  player.maxStamina+=1;
  if(s.table?.combatants?.player)s.table.combatants.player.maxStamina=player.maxStamina;
  capacity={oldStamina,newStamina:player.stamina,
   oldMaxStamina,newMaxStamina:player.maxStamina};
 }
 const source={origin:SOURCE,kind:'test',minute,minutes,staminaSpent,
  check:structuredClone(check),checkEvent:rollEvent,
  checkEventHash:hash(rollEvent),roll:check.roll,
  witness:e,witnessHash:hash(e),strainAtAttempt:r.strain,
  formed:check.success,capacity};
 const receipt={origin:SOURCE,source,seal:hash(source)};
 r.tests.push(receipt);
 if(check.success){
  r.transition=receipt;
  body.nerveSenseProof={source:SOURCE,transitionHash:receipt.seal,
   integrationMinute:minute+minutes,perceptualArtGranted:false};
 }
 E.advance(s,minutes);World.finalizeTime(s,minute);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Individual Nerve–Sense formation or source-proven resource conservation changed');
 return {attempted:true,formed:check.success,check,
  staminaSpent,minutes,capacity,cycle:'Nerve-Sense Cycle',
  noAutomaticCombatReactionsOrNewBeastSense:true};
}
function status(s){
 const rec=s.table?.bodyRefinement?.neural;
 if(rec&&!verify(s))throw Error('Recorded advanced neural anatomy or original earned receipts are inconsistent');
 if(!rec){
  let reason=null;try{context(s)}catch(e){reason=e.message}
  return {ready:!reason,mapped:false,completed:false,
   ...(reason?{reason}:{}),note:'A witnessed original neural map is needed; no new sensory ability is awarded by title'};
 }
 return {ready:!rec.transition,mapped:true,completed:!!rec.transition,
  systems:structuredClone(rec.progress),integrated:rec.integrated,
  strain:rec.strain,staminaRecoveryRequired:true,
  noFreeBeastSensesOrMindreading:true};
}
module.exports={SOURCE,MAP,PRACTICE,FORM,REPAIR,map,extend,practice,repair,finish,status,verify};
