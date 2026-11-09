'use strict';
// #13: Blood V, Adaptive VI, Evolved VII extend the original body anatomy
// alongside the already verified, separately earned Nerve-Sense IV.
// V and VI may develop before IV; no second body rank track is created.
const Crypto=require('node:crypto'),E=require('../engine.js'),C=require('./core'),
 D=require('./disciplines'),U=require('./unified'),Combat=require('./combat'),
 W=require('./world'),Places=require('../world/lived-places');
const ORIGIN='source-earned-individual-living-physique-v1',
 MAP='witnessed-original-whole-body-refinement-design-v1',
 WORK='witnessed-individual-tissue-adaptation-v1',
 FORM='witnessed-whole-body-refinement-countertest-v1',
 CARE='witnessed-physique-pressure-injury-recovery-v1',
 ASSUME='witnessed-living-adaptive-physique-environmental-assumption-v1',
 RELEASE='witnessed-living-adaptive-physique-safe-reversion-v1',
 SUSTAIN='witnessed-unique-physique-metabolic-maintenance-v1',
 TISSUE='witnessed-individual-living-physique-tissue-discovery-v1',
 TISSUE_WORK='witnessed-individual-living-physique-tissue-practice-v1',
 TISSUE_CARE='witnessed-individual-living-physique-tissue-care-v1',
 TISSUE_FOOTING='witnessed-physique-tissue-ground-contact-v1';
const SPEC=Object.freeze({
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
 const b=s.player?.body,r=s.table?.bodyRefinement?.living;
 if(!r){
  if(!b?.cycles||b.cycles.slice(3).some(x=>x!=='Nerve-Sense Cycle'))return false;
  try{originalOrgan(s);return !s.table?.bodyRefinement?.neural||
    require('./body-nerve-sense').verify(s)}catch{return false}
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
  if(allWitnesses.has(z.witnessHash))return false;
  allWitnesses.add(z.witnessHash);
  if(cycle===7&&(!z.supportingCycles?.every(i=>[4,5,6].includes(i))||
   z.supportingCycles?.length!==3||
   z.supportingProof?.nerve!==s.table?.bodyRefinement?.neural?.transition?.seal||
   z.supportingProof?.blood!==r.cycles[5]?.transition?.seal||
   z.supportingProof?.adaptive!==r.cycles[6]?.transition?.seal))
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
   (rec.transition&&(rec.transition.seal!==winning.seal||
    rec.transition.seal!==digest(rec.transition.source)||
    digest(rec.transition.source)!==digest(winning.source))))
   return false;
  if(winning)formed.add(cycle);
  if(cycle===7){
   if(rec.upkeep!==undefined&&!Array.isArray(rec.upkeep))return false;
   let previous=z.minute;
   const upkeep=rec.upkeep||[]; // early draft snapshots stay readable
   for(const item of upkeep){
    const a=item?.source;
    if(item?.origin!==ORIGIN||item.seal!==digest(a)||
     a?.origin!==ORIGIN||a.kind!=='sustain'||a.cycle!==7||
     !winning||!I(a.minute,previous,s.world.minutes)||
     !I(a.minutes,15,480)||a.staminaSpent!==2||
     a.foodItem!=='clean_rations'||a.foodQuantity!==1||
     !I(a.foodBefore,1,100000)||a.foodAfter!==a.foodBefore-1||
     !I(a.roll,1,20)||a.check?.roll!==a.roll||
     !a.checkEvent||a.checkEventHash!==digest(a.checkEvent)||
     a.checkEvent.type!=='roll'||
     digest(a.checkEvent.details)!==digest(a.check)||
     !a.witness||a.witnessHash!==digest(a.witness)||
     a.witness.details?.origin!==SUSTAIN||
     a.witness.details?.cycle!==7||
     !S(a.witness.details?.actualMetabolicDemand,25,900)||
     !S(a.witness.details?.independentFailureLimit,25,900)||
     !S(a.witness.details?.observedFoodCompatibility,25,900)||
     !I(a.witness.details?.supportedMinutes,1,1000000)||
     a.supportedMinutes!==a.witness.details.supportedMinutes||
     a.maintainedUntil!==(a.check.success?
      a.minute+a.minutes+a.supportedMinutes:null)||
     a.factuallySupported!==a.check.success||
     allWitnesses.has(a.witnessHash))return false;
    allWitnesses.add(a.witnessHash);
    previous=a.minute+a.minutes;
   }
  }
  if(cycle===6){
   if(!Array.isArray(rec.expressions))return false;
   let last=null;
   const releases=new Set();
   for(const item of rec.expressions){
    const a=item?.source;
    if(item?.origin!==ORIGIN||item.seal!==digest(a)||
     a?.origin!==ORIGIN||
     !['assume','release'].includes(a.kind)||
     !I(a.minute,z.minute,s.world.minutes)||
     !a.witness||a.witnessHash!==digest(a.witness)||
     
     allWitnesses.has(a.witnessHash))return false;
    allWitnesses.add(a.witnessHash);
    if(a.kind==='assume'){
     if(!winning||a.witness.details?.origin!==ASSUME||
      !S(a.witness.details?.environmentObserved,25,900)||
      !S(a.witness.details?.safeReversionCounter,25,900)||
      !I(a.duration,1,1000000)||
      a.witness.details?.safeMinutes!==a.duration||
      !I(a.staminaSpent,1,100000)||
      a.staminaSpent!==Math.ceil(a.duration/60)+1||
      !I(a.roll,1,20)||a.check?.roll!==a.roll||
      !a.checkEvent||a.checkEventHash!==digest(a.checkEvent)||
      a.checkEvent.type!=='roll'||
      digest(a.checkEvent.details)!==digest(a.check)||
      a.formed!==a.check.success||
      a.activeFrom!==a.minute+1||
      a.activeUntil!==(a.formed?a.activeFrom+a.duration:null)||
      last&&(last.source.activeUntil>a.minute&&!releases.has(last.seal)))
      return false;
     last=item;
    }else{
     if(!last||!last.source.formed||
      releases.has(last.seal)||
      a.witness.details?.origin!==RELEASE||
      !S(a.witness.details?.observedReturn,25,900)||
      !S(a.witness.details?.independentFailureLimit,25,900)||
      a.activationSeal!==last.seal||
      a.minute<last.source.activeFrom||
      a.minute>=last.source.activeUntil)return false;
     releases.add(last.seal);
    }
   }
  }
  // Authored physical tissues are not an enumerated class list. Each
  // discovery is individually sourced and each subsequent observation
  // continues its own unbounded evidence history without a free bonus.
  if(!Array.isArray(rec.tissues??[]))return false;
  const tissueNames=new Set();
  for(const t of rec.tissues||[]){
   const q=t?.source;
   if(t?.origin!==ORIGIN||!q||t.seal!==digest(q)||
    q.origin!==ORIGIN||q.kind!=='tissue-map'||q.cycle!==cycle||
    q.parentMapSeal!==rec.seal||!ID(q.id)||tissueNames.has(q.id)||
    !S(q.tissue,25,900)||!S(q.realFunction,25,900)||
    !S(q.metabolicTradeoff,25,900)||!S(q.failureLimit,25,900)||
    !I(q.minute,z.minute,s.world.minutes)||!q.witness||
    q.witnessHash!==digest(q.witness)||
    q.witness.details?.origin!==TISSUE||
    q.witness.details?.cycle!==cycle||
    q.witness.details?.tissueId!==q.id||
    !S(q.witness.details?.observedTissue,25,900)||
    !S(q.witness.details?.independentCountertest,25,900)||
    allWitnesses.has(q.witnessHash)||
    !Array.isArray(t.practice)||!I(t.points,0,100000000)||
    !I(t.strain,0,100))return false;
   tissueNames.add(q.id);allWitnesses.add(q.witnessHash);
   let points=0,strain=0,last=q.minute;
   for(const row of t.practice){
    const a=row?.source;
    if(row?.origin!==ORIGIN||!a||row.seal!==digest(a)||
     a.origin!==ORIGIN||!['tissue-work','tissue-care'].includes(a.kind)||
     a.cycle!==cycle||a.tissueId!==q.id||
     a.parentTissueSeal!==t.seal||
     !I(a.minute,last,s.world.minutes)||!I(a.minutes,15,480)||
     a.staminaSpent!==(a.kind==='tissue-care'?2:sp.energy)||
     !I(a.roll,1,20)||a.check?.roll!==a.roll||
     !a.checkEvent||a.checkEventHash!==digest(a.checkEvent)||
     a.checkEvent.type!=='roll'||
     digest(a.checkEvent.details)!==digest(a.check)||
     !a.witness||a.witnessHash!==digest(a.witness)||
     a.witness.details?.origin!==
      (a.kind==='tissue-work'?TISSUE_WORK:TISSUE_CARE)||
     a.witness.details?.cycle!==cycle||
     a.witness.details?.tissueId!==q.id||
     !S(a.witness.details?.observedResponse,25,900)||
     !S(a.witness.details?.physicalLimit,25,900)||
     allWitnesses.has(a.witnessHash))return false;
    allWitnesses.add(a.witnessHash);
    if(a.kind==='tissue-work'){
     const earned=a.check.success?a.check.progress:0;
     const added=a.check.degree==='severe failure'?3:0;
     if(a.beforeStrain!==strain||a.earned!==earned||
      a.pointsAfter!==points+earned||a.strainAfter!==Math.min(100,strain+added)||
      a.woundRiskRecorded!==(added>0))return false;
     points=a.pointsAfter;strain=a.strainAfter;
    }else{
     const after=a.check.success?Math.max(0,strain-2):strain;
     if(a.beforeStrain!==strain||a.earned!==0||
      a.pointsAfter!==points||a.strainAfter!==after||
      a.woundRiskRecorded!==false)return false;
     strain=after;
    }
    last=a.minute+a.minutes;
   }
   if(t.points!==points||t.strain!==strain)return false;
   if(!Array.isArray(t.sceneSupports??[]))return false;
   for(const receipt of t.sceneSupports||[]){
    const a=receipt?.source,sc=s.table?.sceneChecks?.[a?.checkId];
    if(receipt?.origin!==ORIGIN||!a||receipt.seal!==digest(a)||
     a.origin!==ORIGIN||a.kind!=='footing-scene-support'||
     a.cycle!==cycle||a.tissueId!==q.id||
     a.parentTissueSeal!==t.seal||
     a.method!=='footing'||a.bonus!==1||a.staminaCost!==1||
     !I(a.minute,q.minute,s.world.minutes)||
     !a.witness||a.witnessHash!==digest(a.witness)||
     a.witness.details?.origin!==TISSUE_FOOTING||
     a.witness.details?.cycle!==cycle||
     a.witness.details?.tissueId!==q.id||
     a.witness.details?.checkId!==a.checkId||
     a.witness.details?.method!=='footing'||
     !S(a.witness.details?.observedMechanicalRole,25,900)||
     !S(a.witness.details?.failureCountertest,25,900)||
     allWitnesses.has(a.witnessHash)||
     !sc||sc.checkId!==a.checkId||
     sc.origin!=='engine-local-scene'||
     sc.method!=='footing'||sc.location!==a.location||
     sc.eventHash!==a.sceneEventHash||
     sc.worldMinute!==a.sceneMinute||
     a.location!==a.witness.details?.location)
     return false;
    allWitnesses.add(a.witnessHash);
    if(receipt.used===null){
     if(sc.used)return false;
    }else{
     const u=receipt.used;
     if(!sc.used||!u||u.staminaSpent!==1||
      u.usedMinute!==sc.checkedAtMinute||
      !I(u.usedMinute,a.minute,s.world.minutes)||
      u.checkId!==a.checkId||
      !u.check||!u.rollEvent||u.rollEvent.type!=='roll'||
      u.rollEventHash!==digest(u.rollEvent)||
      digest(u.rollEvent.details)!==digest(u.check)||
      u.check.roll!==u.rollEvent.details.roll||
      u.check.modifier!==u.baseModifier+1||
      !I(u.baseModifier,-100,99))
      return false;
    }
   }
  }
 }
 const neural=s.table?.bodyRefinement?.neural;
 const neuralEarned=!!neural?.transition;
 if(neural&&!require('./body-nerve-sense').verify(s))return false;
 if(formed.has(7)&&(!neuralEarned||![5,6].every(c=>formed.has(c))))return false;
 const expected=['Muscle-Tendon Cycle','Bone-Marrow Cycle','Organ Cycle'];
 for(const item of b.cycles.slice(3)){
  if(item==='Nerve-Sense Cycle'){
   if(!neuralEarned||expected.includes(item))return false;
   expected.push(item);continue;
  }
  const cycle=Object.keys(SPEC).map(Number).find(i=>SPEC[i].name===item);
  if(!cycle||!formed.has(cycle)||expected.includes(item))return false;
  expected.push(item);
 }
 if(expected.length!==b.cycles.length||
   formed.size!==b.cycles.slice(3).filter(x=>x!=='Nerve-Sense Cycle').length)return false;
 const total=Object.values(r.cycles).filter(x=>x.transition).reduce((n,x)=>n+SPEC[x.source.cycle].bonus,0);
 if(!I(b.physiqueIntegration,0,15)||b.physiqueIntegration!==total)return false;
 const baseline=r.initialMaxStamina;
 const deltaNeural=neuralEarned&&!r.neuralAtMap?1:0;
 if(typeof r.neuralAtMap!=='boolean'||!I(baseline,0,100000)||
   s.player.maxStamina!==baseline+total+deltaNeural||
   s.table.combatants?.player?.maxStamina!==s.player.maxStamina)
  return false;
 return true;
}
function prerequisite(s,cycle){
 const sp=spec(cycle),org=originalOrgan(s),p=safe(s);
 const b=s.player.body;
 if(b.cycles.includes(sp.name))throw Error('That genuine whole-body Cycle has already been earned');
 if(cycle===7&&(!s.table?.bodyRefinement?.neural?.transition||
  !require('./body-nerve-sense').verify(s)||
  ![5,6].every(c=>b.cycles.includes(SPEC[c].name))))
  throw Error('A unique evolved constitution requires independently earned neural, blood and adaptive anatomy');
 if(!verify(s))throw Error('Existing individual body refinement sources are inconsistent');
 return {sp,org,p};
}
function map(s,p={}){
 if(!only(p,['cycle','id','method','actualTissues','metabolicSupport',
  'failureLimit','reversion','witnessIndex'])||
  !I(p.cycle,5,7)||!ID(p.id)||
  !S(p.method,25,900)||!S(p.actualTissues,25,900)||
  !S(p.metabolicSupport,25,900)||!S(p.failureLimit,25,900)||
  !S(p.reversion,25,900))
  throw Error('A body-cycle design needs its own real tissues, physical mechanism, metabolism and plausible reversion limit');
 const {sp,org}=prerequisite(s,p.cycle);
 if(s.table.bodyRefinement?.living?.cycles?.[p.cycle])
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
  ...(p.cycle===7?{supportingCycles:[4,5,6],
   supportingProof:{
    nerve:s.table.bodyRefinement.neural.transition.seal,
    blood:s.table.bodyRefinement.living.cycles[5].transition.seal,
    adaptive:s.table.bodyRefinement.living.cycles[6].transition.seal
   }}:{}),
  witness,witnessHash:digest(witness),noFreeBeastTraits:true};
 const bodyRoot=s.table.bodyRefinement||={};
 const root=bodyRoot.living||={origin:ORIGIN,cycles:{},
  organHash:org.organHash,originalOrganWorkHash:org.workHash,
  initialMaxStamina:s.player.maxStamina,
  neuralAtMap:!!bodyRoot.neural?.transition};
 root.cycles[p.cycle]={origin:ORIGIN,source,seal:digest(source),
  points:0,strain:0,attempts:[],repairs:[],tests:[],transition:null,
  ...(p.cycle===6?{expressions:[]}:{}) ,
  ...(p.cycle===7?{upkeep:[]}:{}) ,
  tissues:[]};
 bodyRoot.living=root;s.table.bodyRefinement=bodyRoot;
 s.player.body.physiqueIntegration??=0;
 return {mapped:true,cycle:p.cycle,name:sp.name,
  noFreeTraitsOrSpeciesChange:true,notYetEarned:true};
}
function attempt(s,p={},kind='work'){
 if(!only(p,['cycle','witnessIndex','minutes'])||
  !I(p.cycle,5,7)||!I(p.minutes??60,15,480))
  throw Error('Original physical body work needs an existing cycle, witness and exertion time');
 const {sp}=prerequisite(s,p.cycle);
 const r=s.table?.bodyRefinement?.living?.cycles?.[p.cycle];
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
  !I(p.cycle,5,7)||!I(p.minutes??90,30,480))
  throw Error('Actual source-earned whole-body integration requires real time and an independent test');
 const {sp}=prerequisite(s,p.cycle);
 const r=s.table?.bodyRefinement?.living?.cycles?.[p.cycle];
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
function adaptiveState(s){
 const rec=s.table?.bodyRefinement?.living?.cycles?.[6];
 const states=rec?.expressions||[];
 let last=null,released=false;
 for(const event of states){
  if(event.source.kind==='assume'){last=event;released=false;}
  else if(last&&event.source.activationSeal===last.seal)released=true;
 }
 return {active:!!(last?.source.formed&&!released&&
   s.world.minutes>=last.source.activeFrom&&
   s.world.minutes<last.source.activeUntil),
  ...(last?.source.formed?{expiresAtMinute:last.source.activeUntil,
   naturallyExpired:s.world.minutes>=last.source.activeUntil}:{}),
  noAutomaticResistanceOrImmunity:true};
}
// Temporary physiological expression is not a new trait or a new power tree.
// Costs are paid up front for the independently observed safe duration.
// Time expiration is derived from the original world clock, not a separate tick.
function assume(s,p={}){
 if(!only(p,['witnessIndex','minutes'])||
  !I(p.minutes,1,1000000))
  throw Error('A source-observed bounded adaptive duration and original environment are required');
 safe(s);originalOrgan(s);
 if(!verify(s))throw Error('Stored original body physiology is inconsistent');
 const r=s.table?.bodyRefinement?.living?.cycles?.[6];
 if(!r?.transition)throw Error('A completed real Adaptive Physique Cycle is required');
 if(adaptiveState(s).active)throw Error('An original bodily adaptation is already active');
 const witness=scene(s,p.witnessIndex,ASSUME,6);
 if(!S(witness.details?.environmentObserved,25,900)||
  !S(witness.details?.safeReversionCounter,25,900)||
  witness.details.safeMinutes!==p.minutes)
  throw Error('A witnessed actual local environment, tested body limit and safe duration are required');
 const wHash=digest(witness);
 if(r.expressions.some(x=>x.source.witnessHash===wHash))
  throw Error('The same original adaptive experiment may not be repeated as a new attempt');
 const spent=Math.ceil(p.minutes/60)+1;
 if(!I(s.player.stamina,spent,100000))
  throw Error('The original stamina pool cannot support that measured adaptive duration');
 const start=s.world.minutes;s.player.stamina-=spent;
 s.table.combatants.player.stamina=s.player.stamina;
 const check=C.check(s,{modifier:Math.floor(((s.player.attributes.con??10)-10)/2)+
  2*(s.player.skills?.survival?.rank||0)-Math.floor(r.strain/3),
  dc:18,label:'Original verified living adaptive physiology under present conditions'});
 const event=structuredClone(s.log.at(-1));
 const src={origin:ORIGIN,kind:'assume',minute:start,
  duration:p.minutes,staminaSpent:spent,
  witness,witnessHash:wHash,check:structuredClone(check),
  checkEvent:event,checkEventHash:digest(event),roll:check.roll,
  formed:check.success,activeFrom:start+1,
  activeUntil:check.success?start+1+p.minutes:null};
 const receipt={origin:ORIGIN,source:src,seal:digest(src)};
 r.expressions.push(receipt);
 E.advance(s,1);W.finalizeTime(s,start);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Original temporary adaptive expression failed source verification');
 return {attempted:true,formed:check.success,check,
  minutes:p.minutes,staminaSpent:spent,...adaptiveState(s),
  noAutomaticElementalDefenceOrBeastTrait:true};
}
function release(s,p={}){
 if(!only(p,['witnessIndex']))throw Error('Voluntary physical reversion needs its own observed return witness');
 safe(s);
 if(!verify(s))throw Error('Original adaptive physiologic record is not verified');
 const r=s.table?.bodyRefinement?.living?.cycles?.[6];
 const curr=adaptiveState(s);
 if(!curr.active)throw Error('No currently active recorded adaptive physiological response to release');
 const last=[...r.expressions].reverse().find(x=>x.source.kind==='assume');
 const witness=scene(s,p.witnessIndex,RELEASE,6);
 if(!S(witness.details?.observedReturn,25,900)||
  !S(witness.details?.independentFailureLimit,25,900))
  throw Error('The actual original baseline return and independent failure limit must be observed');
 const wHash=digest(witness);
 if(r.expressions.some(x=>x.source.witnessHash===wHash))
  throw Error('This specific reversion witness has already been used');
 const start=s.world.minutes;
 const src={origin:ORIGIN,kind:'release',minute:start,
  activationSeal:last.seal,witness,witnessHash:wHash};
 r.expressions.push({origin:ORIGIN,source:src,seal:digest(src)});
 E.advance(s,1);W.finalizeTime(s,start);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Voluntary physical return or original evidence no longer verifies');
 return {released:true,elapsedMinutes:1,...adaptiveState(s),
  noStaminaRefundNoInstantWoundHealing:true};
}
// First bounded live effect adapter. GM-witnessed personally earned body
// coordination can support an EXISTING local footing check; its DC, terrain,
// skill, one-use identity and original d20 still belong to scene-check.
// Other physical effects need their own real contextual adapter; the GM
// description is not permission to choose a modifier, immunity or damage.
function sceneSupport(s,checkId){
 const ledger=s.table?.bodyRefinement?.living?.cycles;
 if(!ledger)return {bonus:0};
 if(!verify(s))throw Error('Existing body source and tissue receipts must verify before a supported scene check');
 let found=null;
 for(const rec of Object.values(ledger))for(const tissue of rec.tissues||[])
  for(const support of tissue.sceneSupports||[]){
   if(support.source.checkId!==checkId)continue;
   if(found)throw Error('Multiple physiology sources cannot stack for one physical scene check');
   found=support;
  }
 if(!found)return {bonus:0};
 const a=found.source,sc=s.table?.sceneChecks?.[checkId];
 if(found.used!==null||!sc||sc.used||
  sc.method!=='footing'||sc.location!==s.world.location||
  sc.worldMinute!==a.sceneMinute||
  sc.eventHash!==a.sceneEventHash||
  !I(s.player?.stamina,1,100000)||
  !I(s.table?.combatants?.player?.stamina,1,100000))
  throw Error('The already committed tissue-supported physical check is no longer valid');
 return {bonus:1,staminaCost:1,tissueId:a.tissueId,cycle:a.cycle,
  evidenceSeal:found.seal};
}
function recordSceneSupport(s,checkId,check,baseModifier){
 const ledger=s.table?.bodyRefinement?.living?.cycles||{};
 const entries=Object.values(ledger).flatMap(rec=>
  (rec.tissues||[]).flatMap(t=>t.sceneSupports||[]));
 const uses=entries.filter(x=>x.source.checkId===checkId);
 if(uses.length!==1)throw Error('Exactly one original tissue source must be committed for this physical check');
 const receipt=uses[0],a=receipt.source,sc=s.table?.sceneChecks?.[checkId];
 if(receipt.used!==null||!sc?.used||
  sc.checkedAtMinute!==s.world.minutes||
  check.modifier!==baseModifier+1||
  check.roll!==s.log.at(-1)?.details?.roll||
  !I(s.player.stamina,1,100000))
  throw Error('The original physical action was not resolved with its promised physiological support');
 const rollEvent=structuredClone(s.log.at(-1));
 receipt.used={checkId,usedMinute:s.world.minutes,staminaSpent:1,
  baseModifier,check:structuredClone(check),rollEvent,
  rollEventHash:digest(rollEvent)};
 s.player.stamina-=1;s.table.combatants.player.stamina=s.player.stamina;
 if(!verify(s))throw Error('The real physical check or physiology receipt failed saved integrity');
 return {tissueId:a.tissueId,cycle:a.cycle,bonus:1,staminaSpent:1,
  onlyThisVerifiedPhysicalAction:true};
}
function tissueFooting(s,p={}){
 if(!only(p,['cycle','id','checkId','witnessIndex'])||
  !I(p.cycle,5,7)||!ID(p.id)||
  typeof p.checkId!=='string'||!/^[a-z0-9][a-z0-9_-]{4,79}$/.test(p.checkId))
  throw Error('The exact existing local check and individually practised original tissue are required');
 safe(s);originalOrgan(s);
 if(!verify(s))throw Error('Original tissue and body cycle evidence does not verify');
 const r=s.table?.bodyRefinement?.living?.cycles?.[p.cycle],
  t=r?.tissues?.find(t=>t.source.id===p.id),
  sc=s.table?.sceneChecks?.[p.checkId];
 if(!t||t.points<2||t.strain>=5||
  !sc||sc.used||sc.origin!=='engine-local-scene'||
  sc.method!=='footing'||sc.location!==s.world.location||
  !I(sc.worldMinute,0,s.world.minutes)||
  s.world.minutes-sc.worldMinute>1440)
  throw Error('An actual independently practised healthy tissue and prepared local footing challenge are required');
 const existing=Object.values(s.table.bodyRefinement.living.cycles).some(rec=>
  (rec.tissues||[]).some(t=>(t.sceneSupports||[]).some(x=>
   x.source.checkId===p.checkId)));
 if(existing)throw Error('A pending original physical scene cannot be stacked with a second anatomical bonus');
 const witness=scene(s,p.witnessIndex,TISSUE_FOOTING,p.cycle);
 if(witness.details?.tissueId!==p.id||
  witness.details?.checkId!==p.checkId||
  witness.details?.method!=='footing'||
  !S(witness.details?.observedMechanicalRole,25,900)||
  !S(witness.details?.failureCountertest,25,900))
  throw Error('The individual current tissue contribution and independent failure test must match the exact scene');
 if(tissueKnownWitness(s,digest(witness)))
  throw Error('A previously witnessed tissue experiment cannot be used for another advantage');
 if(!I(s.player.stamina,1,100000)||
  !I(s.table?.combatants?.player?.stamina,1,100000))
  throw Error('Real available Stamina is required for the supported physical effort');
 const source={origin:ORIGIN,kind:'footing-scene-support',
  cycle:p.cycle,tissueId:p.id,parentTissueSeal:t.seal,
  checkId:p.checkId,method:'footing',bonus:1,staminaCost:1,
  minute:s.world.minutes,location:s.world.location,
  sceneMinute:sc.worldMinute,sceneEventHash:sc.eventHash,
  witness,witnessHash:digest(witness)};
 t.sceneSupports||=[];t.sceneSupports.push({
  origin:ORIGIN,source,seal:digest(source),used:null});
 if(!verify(s))throw Error('The original physical tissue scene witness is inconsistent');
 return {prepared:true,checkId:p.checkId,tissueId:p.id,
  boundedBonus:1,staminaCostWhenResolved:1,noRollYet:true,
  noBonusUnlessOriginalFootingCheckResolves:true};
}
function tissueKnownWitness(s,hash){
 const cycles=s.table?.bodyRefinement?.living?.cycles||{};
 return Object.values(cycles).some(r=>
  r.source?.witnessHash===hash||
  [...r.attempts,...r.repairs,...r.tests,...(r.upkeep||[]),
   ...(r.expressions||[])].some(x=>x.source?.witnessHash===hash)||
  (r.tissues||[]).some(t=>t.source.witnessHash===hash||
   t.practice.some(x=>x.source?.witnessHash===hash)||
   (t.sceneSupports||[]).some(x=>x.source?.witnessHash===hash)));
}
function tissueMap(s,p={}){
 if(!only(p,['cycle','id','tissue','realFunction','metabolicTradeoff',
  'failureLimit','witnessIndex'])||!I(p.cycle,5,7)||!ID(p.id)||
  !S(p.tissue,25,900)||!S(p.realFunction,25,900)||
  !S(p.metabolicTradeoff,25,900)||!S(p.failureLimit,25,900))
  throw Error('An individual original tissue needs distinct anatomy, observed function, metabolism and failure limits');
 safe(s);originalOrgan(s);
 if(!verify(s))throw Error('Existing original whole-body tissue sources do not verify');
 const r=s.table?.bodyRefinement?.living?.cycles?.[p.cycle];
 if(!r)throw Error('First establish the existing whole-body cycle design before mapping individual variations');
 if((r.tissues||[]).some(x=>x.source.id===p.id))
  throw Error('A previously identified individual tissue may not be silently replaced');
 const witness=scene(s,p.witnessIndex,TISSUE,p.cycle);
 if(witness.details?.tissueId!==p.id||
  !S(witness.details?.observedTissue,25,900)||
  !S(witness.details?.independentCountertest,25,900))
  throw Error('Independent real anatomical observations and countertest must be witnessed');
 const hash=digest(witness);
 if(tissueKnownWitness(s,hash))throw Error('An original tissue witness was already used');
 const source={origin:ORIGIN,kind:'tissue-map',cycle:p.cycle,id:p.id,
  tissue:p.tissue.trim(),realFunction:p.realFunction.trim(),
  metabolicTradeoff:p.metabolicTradeoff.trim(),
  failureLimit:p.failureLimit.trim(),parentMapSeal:r.seal,
  minute:s.world.minutes,witness,witnessHash:hash};
 const t={origin:ORIGIN,source,seal:digest(source),
  points:0,strain:0,practice:[],sceneSupports:[]};
 r.tissues||=[];r.tissues.push(t);
 if(!verify(s))throw Error('Original individual anatomy did not pass the continuity check');
 return {mapped:true,cycle:p.cycle,id:p.id,originalFunction:source.realFunction,
  noAutomaticallyGrantedResistanceOrAbility:true};
}
function tissuePractice(s,p={},kind='tissue-work'){
 if(!only(p,['cycle','id','witnessIndex','minutes'])||
  !I(p.cycle,5,7)||!ID(p.id)||!I(p.minutes??60,15,480))
  throw Error('A witnessed original tissue requires a valid focus and real physical work time');
 safe(s);originalOrgan(s);
 if(!verify(s))throw Error('Existing original physiological records failed verification');
 const r=s.table?.bodyRefinement?.living?.cycles?.[p.cycle];
 const t=r?.tissues?.find(t=>t.source.id===p.id);
 if(!t)throw Error('That individually observed physical tissue has not been established');
 if(kind==='tissue-work'&&t.strain>=5)
  throw Error('Significant real tissue strain needs witnessed care before renewed exertion');
 if(kind==='tissue-care'&&!t.strain)
  throw Error('No original tissue strain exists requiring this observed care');
 const witness=scene(s,p.witnessIndex,
  kind==='tissue-work'?TISSUE_WORK:TISSUE_CARE,p.cycle);
 if(witness.details?.tissueId!==p.id||
  !S(witness.details?.observedResponse,25,900)||
  !S(witness.details?.physicalLimit,25,900))
  throw Error('Independent witnessed original tissue function and physical limit must match this individual anatomy');
 const hash=digest(witness);
 if(tissueKnownWitness(s,hash))throw Error('An individual tissue experiment cannot be rolled twice');
 const spent=kind==='tissue-care'?2:SPEC[p.cycle].energy;
 if(!I(s.player.stamina,spent,100000))
  throw Error('The original body has insufficient real Stamina for this work');
 const start=s.world.minutes,minutes=p.minutes??60,before=t.strain;
 s.player.stamina-=spent;s.table.combatants.player.stamina=s.player.stamina;
 const check=C.check(s,{modifier:Math.floor(((s.player.attributes?.con??10)-10)/2)+
  2*(s.player.skills?.survival?.rank||0)-Math.floor(t.strain/3),
  dc:kind==='tissue-care'?15:SPEC[p.cycle].dc,
  label:'Personally witnessed '+SPEC[p.cycle].name+' individual '+p.id+' '+kind});
 const event=structuredClone(s.log.at(-1)),earned=
  kind==='tissue-work'&&check.success?check.progress:0;
 if(kind==='tissue-work'){
  t.points+=earned;
  if(check.degree==='severe failure'){
   t.strain=Math.min(100,t.strain+3);
   Combat.harm(s,Combat.get(s,'player'),2);U.sync(s,{source:'wounds'});
  }
 }else if(check.success)t.strain=Math.max(0,t.strain-2);
 const source={origin:ORIGIN,kind,cycle:p.cycle,tissueId:p.id,
  parentTissueSeal:t.seal,minute:start,minutes,staminaSpent:spent,
  witness,witnessHash:hash,check:structuredClone(check),
  checkEvent:event,checkEventHash:digest(event),roll:check.roll,
  beforeStrain:before,earned,pointsAfter:t.points,strainAfter:t.strain,
  woundRiskRecorded:kind==='tissue-work'&&check.degree==='severe failure'};
 t.practice.push({origin:ORIGIN,source,seal:digest(source)});
 E.advance(s,minutes);W.finalizeTime(s,start);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Individual tissue evidence or physical cost failed integrity verification');
 return {attempted:true,cycle:p.cycle,id:p.id,kind,check,
  observedAccumulatedProgress:t.points,strain:t.strain,
  staminaSpent:spent,minutes,
  noFreeEvolutionStageOrAutomaticNewAbility:true};
}
function maintenanceState(s){
 const rec=s.table?.bodyRefinement?.living?.cycles?.[7];
 if(!rec?.transition)return {earned:false,currentlyObserved:false,
  note:'No personally integrated evolved constitution has yet been earned'};
 const successful=(rec.upkeep||[]).filter(x=>x.source?.factuallySupported);
 const last=successful.at(-1)?.source;
 const now=s.world.minutes;
 return {earned:true,permanentConstitution:true,
  currentlyObserved:!!last&&now<=last.maintainedUntil,
  ...(last?{lastSupportedMinute:last.minute+last.minutes,
   observedSupportUntil:last.maintainedUntil}:{}),
  noAutoLossOfEarnedAnatomy:true,
  note:last&&now>last.maintainedUntil?
   'Current maintenance needs fresh individual physiological evidence; established anatomy is not erased by the calendar':
   'Actual maintained condition requires witnessed bodily function, not a fixed automatic buff'};
}
// One example of actual nourishing maintenance. A verified living human can
// replenish from source-confirmed ordinary provisions, but this is NOT a
// universal ration gate for other possible metabolisms or biological schools.
// Other diets require genuine matching existing material sources and adapters.
function sustain(s,p={}){
 if(!only(p,['witnessIndex','minutes'])||!I(p.minutes??60,15,480))
  throw Error('Living constitutional care needs a genuine observed session and real elapsed time');
 safe(s);originalOrgan(s);
 if(!verify(s))throw Error('Existing unique living constitution evidence does not verify');
 const r=s.table?.bodyRefinement?.living?.cycles?.[7];
 if(!r?.transition)throw Error('A genuinely earned unique Evolved Physique is required');
 const witness=scene(s,p.witnessIndex,SUSTAIN,7);
 if(!S(witness.details?.actualMetabolicDemand,25,900)||
  !S(witness.details?.independentFailureLimit,25,900)||
  !S(witness.details?.observedFoodCompatibility,25,900)||
  !I(witness.details?.supportedMinutes,1,1000000))
  throw Error('Observed original tissue demand, compatible nourishment, finite support and failure conditions must be witnessed');
 const wHash=digest(witness);
 if((r.upkeep||[]).some(x=>x.source.witnessHash===wHash))
  throw Error('A prior genuine constitutional care episode cannot be rerolled');
 const minutes=p.minutes??60,spent=2;
 if(!I(s.player.stamina,spent,100000))
  throw Error('The original body lacks stamina for this actual self-care');
 // Physical stock is conserved through the SAME executor as gathering,
 // trading, partner provisions, and clinical crafting. This does not grant food.
 const foodBefore=s.player.inventory?.clean_rations||0;
 const foodPlan=U.planItems(s,{clean_rations:-1});
 const start=s.world.minutes;
 U.applyItems(s,foodPlan);
 s.player.stamina-=spent;s.table.combatants.player.stamina=s.player.stamina;
 const check=C.check(s,{modifier:Math.floor(((s.player.attributes?.con??10)-10)/2)+
  2*(s.player.skills?.survival?.rank||0)-Math.floor(r.strain/3),
  dc:18,label:'Individually observed Evolved Physique metabolic maintenance'});
 const rollEvent=structuredClone(s.log.at(-1));
 const supportedMinutes=witness.details.supportedMinutes;
 const src={origin:ORIGIN,kind:'sustain',cycle:7,minute:start,minutes,
  staminaSpent:spent,foodItem:'clean_rations',foodQuantity:1,
  foodBefore,foodAfter:foodBefore-1,
  witness,witnessHash:wHash,check:structuredClone(check),
  checkEvent:rollEvent,checkEventHash:digest(rollEvent),roll:check.roll,
  supportedMinutes,factuallySupported:check.success,
  maintainedUntil:check.success?start+minutes+supportedMinutes:null};
 r.upkeep||=[];r.upkeep.push({origin:ORIGIN,source:src,seal:digest(src)});
 E.advance(s,minutes);W.finalizeTime(s,start);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Saved metabolic care or original body resources cannot be reconciled');
 return {attempted:true,confirmed:check.success,check,
  realFoodConsumed:{item:'clean_rations',quantity:1},
  staminaSpent:spent,minutes,maintenance:maintenanceState(s),
  noNewTraitsOrInstantWoundHealing:true};
}
function status(s){
 if(!s.player?.body?.cycles?.includes('Organ Cycle'))
  return {available:false,note:'Actual original organ anatomy is necessary'};
 if(!verify(s))throw Error('Individual human body source or physical records changed');
 const r=s.table?.bodyRefinement?.living;
 return {available:true,completed:s.player.body.cycles.slice(3),
  specialisations:Object.values(r?.cycles||{}).map(x=>({
   cycle:x.source.cycle,name:SPEC[x.source.cycle].name,
   method:x.source.method,progress:x.points,needed:6,
   strain:x.strain,formed:!!x.transition,
   individuallyObservedTissues:(x.tissues||[]).map(t=>({
    id:t.source.id,tissue:t.source.tissue,
    observedFunction:t.source.realFunction,
    cumulativeObservedPractice:t.points,
    strain:t.strain,practicedSessions:t.practice.length
   }))})),
  orderFreedom:'Blood V and Adaptive VI may form before or after independently earned Nerve IV',
  ...(r?.cycles?.[6]?.transition?{currentAdaptiveExpression:adaptiveState(s)}:{}),
  ...(r?.cycles?.[7]?.transition?{constitutionMaintenance:maintenanceState(s)}:{}),
  noFreeBeastTraitOrAutomaticMedicine:true};
}
module.exports={ORIGIN,MAP,WORK,FORM,CARE,ASSUME,RELEASE,SUSTAIN,
 TISSUE,TISSUE_WORK,TISSUE_CARE,TISSUE_FOOTING,SPEC,
 map,work:(s,p)=>attempt(s,p,'work'),care:(s,p)=>attempt(s,p,'care'),
 complete,assume,release,sustain,tissueMap,tissueFooting,
 sceneSupport,recordSceneSupport,
 tissueWork:(s,p)=>tissuePractice(s,p,'tissue-work'),
 tissueCare:(s,p)=>tissuePractice(s,p,'tissue-care'),status,verify};
