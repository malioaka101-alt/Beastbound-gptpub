'use strict';
// #13: Body IV–VII extends the original verified Organ Cycle, the same
// human tissue, stamina and wound records. IV–VI may be specialised in any
// order; a unique VII constitution needs the preceding body systems to work
// together. Names do not import species traits or automatically heal wounds.
const Crypto=require('node:crypto'),E=require('../engine.js'),C=require('./core'),
 D=require('./disciplines'),U=require('./unified'),Combat=require('./combat'),
 W=require('./world'),Places=require('../world/lived-places');
const ORIGIN='source-earned-individual-living-physique-v1',
 MAP='witnessed-original-whole-body-refinement-design-v1',
 WORK='witnessed-individual-tissue-adaptation-v1',
 FORM='witnessed-whole-body-refinement-countertest-v1',
 CARE='witnessed-physique-pressure-injury-recovery-v1';
const SPEC=Object.freeze({
 4:{name:'Nerve-Sense Cycle',kind:'nerve',dc:18,energy:2,bonus:1,
  sources:['existingNerves','sensoryCounter'],
  nature:'Actual nerves, perception, proprioception and pain response'},
 5:{name:'Blood-Essence Cycle',kind:'blood',dc:19,energy:3,bonus:2,
  sources:['circulationMeasurement','metabolicLimit'],
  nature:'Existing blood, tissue oxygenation, nutrition and compatible energy'},
 6:{name:'Adaptive Physique Cycle',kind:'adaptive',dc:20,energy:3,bonus:1,
  sources:['environmentalCondition','reversibleResponse'],
  nature:'Actually observed bounded and reversible biological response'},
 7:{name:'Evolved Physique Cycle',kind:'evolved',dc:22,energy:5,bonus:2,
  sources:['individualConstitution','lifespanBoundary'],
  nature:'Unique coordinated human physique, vulnerable and metabolic'}
});
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const I=(x,a=0,b=100000000)=>Number.isInteger(x)&&x>=a&&x<=b;
const S=(x,a=12,b=900)=>typeof x==='string'&&x.trim().length>=a&&x.trim().length<=b;
const ID=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{2,75}$/.test(x);
const only=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&
 Object.keys(x).every(k=>keys.includes(k));
const spec=i=>{if(!SPEC[i])throw Error('Individual body Cycle IV–VII is required');return SPEC[i]};
function originalOrgan(s){
 const b=s.player?.body,proof=b?.organAdaptation,w=s.table?.organCycleWork,
  hist=s.table?.disciplineTraining?.body?.history||[];
 if(!b?.cycles?.includes('Organ Cycle')||!proof||!w?.completed||
  !Array.isArray(w.attempts)||!w.attempts.length||
  proof.originalSource!=='earned-body-organ-cycle-iii-v1'||
  proof.attemptsHash!==digest(w.attempts)||
  !hist.some(h=>h.target==='cycle3'&&h.witnessSource===proof.originalSource))
  throw Error('The actual full-body Organ Cycle III and earned tissue sources are required');
 if(b.cycles.length===3)D.organEarned(s);
 return {organHash:digest(proof),workHash:proof.attemptsHash};
}
function safe(s){
 const p=Places.location(s),c=s.table?.combatants?.player;
 if(!p||s.battle||s.encounter||c&&c.status!=='ok'||
  !c||s.table.healthModel!=='wounds-v1')
  throw Error('Source-supported tissue practice requires a conscious practitioner and original consistent wound physiology');
 return p;
}
function scene(s,index,origin,cycle){
 if(!I(index,0,s.log.length-1))throw Error('An original witnessed tissue source is needed before a body change');
 const e=s.log[index];
 if(e?.type!=='story'||e.details?.origin!==origin||
  e.details?.cycle!==cycle||e.details?.location!==s.world.location||
  !S(e.text,16,900))
  throw Error('Original individual physically examined body and local conditions have not been witnessed');
 return structuredClone(e);
}
function verify(s){
 const b=s.player?.body,r=s.table?.bodyRefinement;
 if(!r){
  if(!b?.cycles||b.cycles.length>3)return false;
  try{originalOrgan(s);return true}catch{return false}
 }
 if(!r?.cycles||r.origin!==ORIGIN||Array.isArray(r.cycles)||
  typeof r.cycles!=='object')return false;
 let organ;
 try{organ=originalOrgan(s)}catch{return false}
 if(r.organHash!==organ.organHash||r.originalOrganWorkHash!==organ.workHash)
  return false;
 const formed=new Set(),allWitnesses=new Set();
 for(const [key,rec] of Object.entries(r.cycles)){
  const cycle=Number(key),z=rec?.source,sp=SPEC[cycle];
  if(!sp||String(cycle)!==key||rec.origin!==ORIGIN||
   !z||z.origin!==ORIGIN||rec.seal!==digest(z)||
   z.cycle!==cycle||z.kind!==sp.kind||z.organHash!==organ.organHash||
   !ID(z.id)||!S(z.method,25,900)||!S(z.actualTissues,25,900)||
   !S(z.metabolicSupport,25,900)||!S(z.failureLimit,25,900)||
   !S(z.reversion,25,900)||!I(z.minute,0,s.world.minutes)||
   !z.witness||z.witnessHash!==digest(z.witness)||
   z.witness.details?.origin!==MAP||
   z.witness.details?.cycle!==cycle||
   !sp.sources.every(f=>S(z.witness.details?.[f],25,900))||
   !Array.isArray(rec.attempts)||!Array.isArray(rec.repairs)||
   !Array.isArray(rec.tests)||!I(rec.points,0,6)||!I(rec.strain,0,100))
   return false;
  if(cycle===7&&!z.supportingCycles?.every(i=>[4,5,6].includes(i))||
   cycle===7&&z.supportingCycles?.length!==3)
   return false;
  const ordered=[...rec.attempts.map(t=>({kind:'work',t})),
   ...rec.repairs.map(t=>({kind:'care',t})),
   ...rec.tests.map(t=>({kind:'form',t}))]
   .sort((a,b)=>a.t?.source?.minute-b.t?.source?.minute);
  let pts=0,strain=0,winning=null,last=z.minute;
  for(const {kind,t} of ordered){
   const a=t?.source;
   if(t?.origin!==ORIGIN||t.seal!==digest(a)||
    a?.origin!==ORIGIN||a.kind!==kind||a.cycle!==cycle||
    !I(a.minute,last,s.world.minutes)||!I(a.minutes,15,480)||
    !I(a.staminaSpent,1,30)||!I(a.roll,1,20)||
    a.check?.roll!==a.roll||!a.checkEvent||
    a.checkEventHash!==digest(a.checkEvent)||
    a.checkEvent.type!=='roll'||
    digest(a.checkEvent.details)!==digest(a.check)||
    !a.witness||a.witnessHash!==digest(a.witness)||
    a.witness.details?.origin!==
     (kind==='work'?WORK:kind==='care'?CARE:FORM)||
    a.witness.details?.cycle!==cycle||allWitnesses.has(a.witnessHash))
    return false;
   allWitnesses.add(a.witnessHash);
   if(kind==='work'){
    if(winning||a.staminaSpent!==sp.energy||
     a.earned!==(a.check.success?a.check.progress:0)||
     a.total!==Math.min(6,pts+a.earned)||
     a.strainAdded!==(a.check.degree==='severe failure'?3:0))
     return false;
    pts=a.total;strain=Math.min(100,strain+a.strainAdded);
   }else if(kind==='care'){
    if(a.staminaSpent!==2||a.before!==strain||
     a.after!==(a.check.success?Math.max(0,strain-2):strain))
     return false;
    strain=a.after;
   }else{
    if(a.staminaSpent!==sp.energy+2||a.pointsAtAttempt!==6||
     a.strainAtAttempt>2||a.formed!==a.check.success)
     return false;
    if(a.formed){
     if(winning)return false;
     winning=t;
     const cap=a.capacity;
     if(!cap||!I(cap.oldMax,0,100000)||!I(cap.oldStamina,0,100000)||
      cap.newMax!==cap.oldMax+sp.bonus||
      cap.newStamina!==cap.oldStamina-a.staminaSpent||
      cap.added!==sp.bonus)return false;
    }else if(a.capacity!==null)return false;
   }
   last=a.minute+a.minutes;
  }
  if(pts!==rec.points||strain!==rec.strain||
   !!rec.transition!==!!winning||
   (rec.transition&&rec.transition.seal!==winning.seal))
   return false;
  if(winning)formed.add(cycle);
 }
 if(formed.has(7)&&![4,5,6].every(c=>formed.has(c)))return false;
 const expected=['Muscle-Tendon Cycle','Bone-Marrow Cycle','Organ Cycle'];
 for(const item of b.cycles.slice(3)){
  const cycle=Object.keys(SPEC).map(Number).find(i=>SPEC[i].name===item);
  if(!cycle||!formed.has(cycle)||expected.includes(item))
   return false;
  expected.push(item);
 }
 if(expected.length!==b.cycles.length||formed.size!==b.cycles.length-3)
  return false;
 const total=Object.values(r.cycles).filter(x=>x.transition).reduce((n,x)=>n+SPEC[x.source.cycle].bonus,0);
 if(!I(b.physiqueIntegration,0,15)||b.physiqueIntegration!==total)return false;
 const baseline=r.initialMaxStamina;
 if(!I(baseline,0,100000)||s.player.maxStamina!==baseline+total||
  s.table.combatants?.player?.maxStamina!==s.player.maxStamina)
  return false;
 return true;
}
function prerequisite(s,cycle){
 const sp=spec(cycle),org=originalOrgan(s),p=safe(s);
 const b=s.player.body;
 if(b.cycles.includes(sp.name))throw Error('That genuine whole-body Cycle has already been earned');
 if(cycle===7&&![4,5,6].every(c=>b.cycles.includes(SPEC[c].name)))
  throw Error('A unique fully integrated Cycle VII constitution requires authentically working nerve, blood and adaptive systems');
 if(s.table?.bodyRefinement&&!verify(s))
  throw Error('Existing individual body refinement original sources are inconsistent');
 return {sp,org,p};
}
function map(s,p={}){
 if(!only(p,['cycle','id','method','actualTissues','metabolicSupport',
  'failureLimit','reversion','witnessIndex'])||
  !I(p.cycle,4,7)||!ID(p.id)||
  !S(p.method,25,900)||!S(p.actualTissues,25,900)||
  !S(p.metabolicSupport,25,900)||!S(p.failureLimit,25,900)||
  !S(p.reversion,25,900))
  throw Error('A body-cycle design needs its own real tissues, physical mechanism, metabolism and plausible reversion limit');
 const {sp,org}=prerequisite(s,p.cycle);
 if(s.table.bodyRefinement?.cycles?.[p.cycle])
  throw Error('Already documented individual body-cycle origins cannot be rewritten');
 const witness=scene(s,p.witnessIndex,MAP,p.cycle);
 if(!sp.sources.every(f=>S(witness.details?.[f],25,900))||
  !S(witness.details?.independentCountertest,25,900))
  throw Error('A separately witnessed original bodily observation and failure countertest are required');
 const source={origin:ORIGIN,cycle:p.cycle,kind:sp.kind,id:p.id,
  method:p.method.trim(),actualTissues:p.actualTissues.trim(),
  metabolicSupport:p.metabolicSupport.trim(),
  failureLimit:p.failureLimit.trim(),reversion:p.reversion.trim(),
  organHash:org.organHash,minute:s.world.minutes,
  ...(p.cycle===7?{supportingCycles:[4,5,6]}:{}),
  witness,witnessHash:digest(witness),noFreeBeastTraits:true};
 const root=s.table.bodyRefinement||={origin:ORIGIN,cycles:{},
  organHash:org.organHash,originalOrganWorkHash:org.workHash,
  initialMaxStamina:s.player.maxStamina};
 root.cycles[p.cycle]={origin:ORIGIN,source,seal:digest(source),
  points:0,strain:0,attempts:[],repairs:[],tests:[],transition:null};
 s.table.bodyRefinement=root;
 s.player.body.physiqueIntegration??=0;
 return {mapped:true,cycle:p.cycle,name:sp.name,
  noFreeTraitsOrSpeciesChange:true,notYetEarned:true};
}
function attempt(s,p={},kind='work'){
 if(!only(p,['cycle','witnessIndex','minutes'])||
  !I(p.cycle,4,7)||!I(p.minutes??60,15,480))
  throw Error('Original physical body work needs an existing cycle, witness and exertion time');
 const {sp}=prerequisite(s,p.cycle);
 const r=s.table?.bodyRefinement?.cycles?.[p.cycle];
 if(!r||!verify(s))throw Error('No source-confirmed physical tissue design exists');
 if(kind==='work'&&r.points>=6)
  throw Error('Original refined tissues are ready for a separate physiological integration trial');
 if(kind==='work'&&r.strain>=5)
  throw Error('Actual tissue pressure damage needs observed recovery before further work');
 if(kind==='care'&&!r.strain)throw Error('No genuine recorded individual tissue strain requires this repair');
 const origin=kind==='care'?CARE:WORK;
 const witness=scene(s,p.witnessIndex,origin,p.cycle);
 if(!S(witness.details?.observedBodyResponse,25,900)||
  !S(witness.details?.physicalLimit,25,900))
  throw Error('Observed actual tissue adaptation, independent body limit and repair evidence are required');
 if([...r.attempts,...r.repairs].some(x=>x.source.witnessHash===digest(witness)))
  throw Error('The original bodily experiment cannot be rerolled');
 const minutes=p.minutes??60,spent=kind==='care'?2:sp.energy;
 if(!I(s.player.stamina,spent,100000))
  throw Error('Existing physical Stamina cannot sustain this body treatment');
 const start=s.world.minutes,old=r.strain;
 s.player.stamina-=spent;
 s.table.combatants.player.stamina=s.player.stamina;
 const check=C.check(s,{modifier:Math.floor(((s.player.attributes.con??10)-10)/2)+
  2*(s.player.skills?.survival?.rank||0)-Math.floor(r.strain/3),
  dc:(kind==='care'?15:sp.dc),label:'Personally observed '+sp.name+' '+(kind==='care'?'clinical physical correction':'tissue training')});
 const e=structuredClone(s.log.at(-1)),earned=check.success?check.progress:0,
  damage=check.degree==='severe failure'?3:0;
 if(kind==='work'){
  r.points=Math.min(6,r.points+earned);
  r.strain=Math.min(100,r.strain+damage);
  if(damage){Combat.harm(s,Combat.get(s,'player'),2);U.sync(s,{source:'wounds'});}
 }else if(check.success)r.strain=Math.max(0,r.strain-2);
 const src={origin:ORIGIN,kind,cycle:p.cycle,minute:start,minutes,
  staminaSpent:spent,witness,witnessHash:digest(witness),
  check:structuredClone(check),checkEvent:e,checkEventHash:digest(e),
  roll:check.roll,
  ...(kind==='work'?{earned,total:r.points,strainAdded:damage}:{before:old,after:r.strain})};
 const receipt={origin:ORIGIN,source:src,seal:digest(src)};
 (kind==='work'?r.attempts:r.repairs).push(receipt);
 E.advance(s,minutes);W.finalizeTime(s,start);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Original body tissue receipt failed biological source integrity');
 return {attempted:true,cycle:p.cycle,check,
  ...(kind==='work'?{points:r.points,required:6}:{}),
  strain:r.strain,staminaSpent:spent,minutes,
  noInstantStrengthOrOtherPower:true};
}
function complete(s,p={}){
 if(!only(p,['cycle','witnessIndex','minutes'])||
  !I(p.cycle,4,7)||!I(p.minutes??90,30,480))
  throw Error('Actual source-earned whole-body integration requires real time and an independent test');
 const {sp}=prerequisite(s,p.cycle);
 const r=s.table?.bodyRefinement?.cycles?.[p.cycle];
 if(!r||!verify(s)||r.points<6||r.strain>2)
  throw Error('Source-earned tissue refinement and proper physical pressure recovery must precede completion');
 const witness=scene(s,p.witnessIndex,FORM,p.cycle);
 if(!S(witness.details?.integratedFunction,25,900)||
  !S(witness.details?.failureCounter,25,900)||
  !S(witness.details?.metabolicTradeoff,25,900))
  throw Error('Whole-body function, independent collapse and biological metabolic tradeoff must be witnessed');
 if(r.tests.some(x=>x.source.witnessHash===digest(witness)))
  throw Error('That original physical cycle formation was already rolled');
 const minutes=p.minutes??90,spent=sp.energy+2;
 if(!I(s.player.stamina,spent,100000))throw Error('Real body Stamina insufficient for whole-body integration');
 const before=s.world.minutes,old=s.player.stamina,oldMax=s.player.maxStamina;
 s.player.stamina-=spent;s.table.combatants.player.stamina=s.player.stamina;
 const check=C.check(s,{modifier:Math.floor(((s.player.attributes.con??10)-10)/2)+
  2*(s.player.skills?.survival?.rank||0)-Math.floor(r.strain/3),
  dc:sp.dc+3,label:sp.name+' independent biological integration'});
 const e=structuredClone(s.log.at(-1));let cap=null;
 if(check.success){
  s.player.body.cycles.push(sp.name);
  s.player.body.physiqueIntegration=(s.player.body.physiqueIntegration||0)+sp.bonus;
  s.player.maxStamina=oldMax+sp.bonus;
  s.table.combatants.player.maxStamina=s.player.maxStamina;
  cap={oldStamina:old,newStamina:s.player.stamina,
   oldMax,newMax:s.player.maxStamina,added:sp.bonus};
 }
 const src={origin:ORIGIN,kind:'form',cycle:p.cycle,minute:before,
  minutes,staminaSpent:spent,witness,witnessHash:digest(witness),
  check:structuredClone(check),checkEvent:e,checkEventHash:digest(e),
  roll:check.roll,pointsAtAttempt:r.points,strainAtAttempt:r.strain,
  formed:check.success,capacity:cap};
 const receipt={origin:ORIGIN,source:src,seal:digest(src)};
 r.tests.push(receipt);if(check.success)r.transition=receipt;
 E.advance(s,minutes);W.finalizeTime(s,before);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Original integrated human body and conserved Stamina receipts failed verification');
 return {attempted:true,formed:check.success,cycle:p.cycle,
  check,staminaSpent:spent,minutes,capacity:cap,
  noAutomaticSpeciesTraitOrImmunity:true};
}
function status(s){
 if(!s.player?.body?.cycles?.includes('Organ Cycle'))
  return {available:false,note:'Actual original organ anatomy is necessary'};
 if(!verify(s))throw Error('Individual human body source or physical records changed');
 const r=s.table?.bodyRefinement;
 return {available:true,completed:s.player.body.cycles.slice(3),
  specialisations:Object.values(r?.cycles||{}).map(x=>({
   cycle:x.source.cycle,name:SPEC[x.source.cycle].name,
   method:x.source.method,progress:x.points,needed:6,
   strain:x.strain,formed:!!x.transition})),
  orderFreedom:'Cycles IV–VI may be earned in individual school-specific order',
  noFreeBeastTraitOrAutomaticMedicine:true};
}
module.exports={ORIGIN,MAP,WORK,FORM,CARE,SPEC,
 map,work:(s,p)=>attempt(s,p,'work'),care:(s,p)=>attempt(s,p,'care'),
 complete,status,verify};
