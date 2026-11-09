'use strict';
// #11 — Arcane V–IX built on the ONE original Mana Core and Circle profile.
// Stage is earned architecture, not a spell, borrowed beast organ, mindreading,
// universal physical law, obedient population or an instant network connection.
const Crypto=require('node:crypto'),E=require('../engine.js'),C=require('./core'),
 Build=require('./build'),Dynamic=require('./arcane-dynamic-architecture'),
 Cosmology=require('../world/cosmology-ledger'),Places=require('../world/lived-places');
const ORIGIN='source-earned-advanced-arcane-circles-v1',
 MAP='witnessed-individual-higher-arcane-architecture-v1',
 PRACTICE='witnessed-higher-arcane-physical-calibration-v1',
 TEST='witnessed-higher-arcane-independent-countertest-v1',
 REPAIR='witnessed-higher-arcane-overload-recovery-v1';
const SPEC=Object.freeze({
 5:{name:'Field Projection',kind:'field',dc:21,minuteCost:5,
  basis:'A real observed local output field with measured range, ambient support and independently contestable interference',
  sourceFields:['measuredRadius','ambientCounter']},
 6:{name:'Living Lattice',kind:'tissue',dc:22,minuteCost:6,
  basis:'Existing individually examined biological nerve or magical tissue architecture, no invented organ',
  sourceFields:['existingTissue','nerveResponse']},
 7:{name:'Astral Architecture',kind:'astral',dc:23,minuteCost:7,
  basis:'Independently observed spiritual or astral-layer interference and an intact individual identity boundary',
  sourceFields:['layerMeasurement','identityProtection']},
 8:{name:'Law Interpretation',kind:'law',dc:24,minuteCost:8,
  basis:'A real established and locally measured supernatural law, not a hypothesis promoted to cosmic truth',
  sourceFields:['lawManifestation','observedLawLimit']},
 9:{name:'World Circuit',kind:'network',dc:25,minuteCost:9,
  basis:'An individually observed local physical Mana network with isolation and actual feedback failure bounds',
  sourceFields:['physicalNetwork','feedbackIsolation']}
});
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const int=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b;
const prose=(x,a=12,b=900)=>typeof x==='string'&&x.trim().length>=a&&x.trim().length<=b;
const only=(p,ks)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(k=>ks.includes(k));
const required=c=>{if(!SPEC[c])throw Error('Only the original Fifth–Ninth Arcane Circle structures can be developed here');return SPEC[c];};
function worldPlace(s){const p=Places.location(s);if(!p)throw Error('An established physical site is needed for honest Arcane work');return p;}
function scene(s,index,origin,circle){
 if(!int(index,0,s.log.length-1))throw Error('An earlier original local Arcane examination is required');
 const event=s.log[index],d=event?.details;
 if(event?.type!=='story'||d?.origin!==origin||
  d.circle!==circle||d.location!==s.world.location||
  !prose(event.text,15,900))
  throw Error('An independent witnessed physical Arcane source at this actual place is missing');
 return structuredClone(event);
}
function originalLaw(s,ref){
 if(!ref||!only(ref,['planeId','domain'])||
  !prose(ref.planeId,3,80)||!prose(ref.domain,3,100))
  throw Error('Law Interpretation requires a real identified previously established cosmological law');
 const reg=Cosmology.peek(s)||Cosmology.seed();
 Cosmology.validate(reg,s);
 const f=reg.planes?.[ref.planeId]?.facts?.find(x=>
  x.domain===ref.domain&&x.kind==='law');
 if(!f)return null;
 return {planeId:ref.planeId,domain:ref.domain,
  statement:f.statement,seal:f.seal,kind:f.kind};
}
function entryFor(s,stage){
 return s.table?.arcaneArchitecture?.higherCircles?.circles?.[stage];
}
function previous(s,stage){
 const a=s.player?.arcane;
 if(!a||a.circles!==stage-1||!a.coreIgnited||s.battle||s.encounter)
  throw Error('An actually earned previous Arcane Circle, intact Mana Core and a safe practice setting are required');
 if(stage===5){
  if(!Dynamic.verify(s)||!s.table?.arcaneArchitecture?.dynamicFourth?.transitions?.some(x=>x.source?.formed))
   throw Error('The previously constructed Fourth Dynamic Circle lacks original genuine source evidence');
  return s.table.arcaneArchitecture.dynamicFourth.transitions.find(x=>x.source.formed).seal;
 }
 if(!verify(s))throw Error('The saved prior higher Circle source and its structural receipts were altered');
 const e=entryFor(s,stage-1);
 if(!e?.transition?.source?.formed)
  throw Error('The preceding Circle is not a genuinely earned structural transformation');
 return e.transition.seal;
}
function verify(s){
 const a=s.player?.arcane,ledger=s.table?.arcaneArchitecture?.higherCircles;
 if(!ledger)return (a?.circles||0)<5;
 if(ledger.origin!==ORIGIN||!ledger.circles||
  Array.isArray(ledger.circles)||typeof ledger.circles!=='object')
  return false;
 let predecessor=s.table?.arcaneArchitecture?.dynamicFourth?.transitions?.find(x=>x.source?.formed)?.seal;
 if(!predecessor||!Dynamic.verify(s))return false;
 let maxFormed=4,seenStop=false;
 for(let stage=5;stage<=9;stage++){
  const z=ledger.circles[stage];
  if(!z)continue;
  const x=z?.source,spec=SPEC[stage];
  if(stage>maxFormed+1||z.origin!==ORIGIN||
   !x||z.seal!==hash(x)||x.origin!==ORIGIN||
   x.stage!==stage||x.kind!==spec.kind||
   x.predecessor!==predecessor||
   !prose(x.design,30,900)||!prose(x.channelModel,25,900)||
   !prose(x.interference,25,900)||!prose(x.safety,25,900)||
   !int(x.minute,0,s.world.minutes)||!x.witness||
   x.witnessHash!==hash(x.witness)||
   x.witness.details?.origin!==MAP||
   x.witness.details?.circle!==stage||
   x.witness.details?.kind!==spec.kind||
   !spec.sourceFields.every(f=>prose(x.witness.details?.[f],24,900))||
   !Array.isArray(z.attempts)||!Array.isArray(z.repairs)||
   !Array.isArray(z.tests)||!int(z.points,0,6)||
   !int(z.strain,0,100))
   return false;
  if(stage===8){
   const l=originalLaw(s,x.lawRef);
   if(!l||x.lawHash!==hash(l))return false;
  }
  if(stage===9&&(!x.placeId||!x.siteName||
   !prose(x.witness.details?.networkIsolation,24,900)))
   return false;
  const used=new Set(),ordered=[
   ...z.attempts.map(r=>({kind:'practice',r})),
   ...z.repairs.map(r=>({kind:'repair',r})),
   ...z.tests.map(r=>({kind:'test',r}))
  ].sort((u,v)=>u.r.source.minute-v.r.source.minute);
  let points=0,strain=0,completed=null,last=x.minute;
  for(const {kind,r} of ordered){
   const t=r?.source;
   if(r?.origin!==ORIGIN||!t||r.seal!==hash(t)||
    t.origin!==ORIGIN||t.kind!==kind||t.stage!==stage||
    !int(t.minute,last,s.world.minutes)||!int(t.minutes,15,480)||
    !int(t.manaSpent,1,100)||!int(t.staminaSpent,1,20)||
    !int(t.roll,1,20)||t.check?.roll!==t.roll||
    !t.checkEvent||t.checkEventHash!==hash(t.checkEvent)||
    t.checkEvent.type!=='roll'||hash(t.checkEvent.details)!==hash(t.check)||
    !t.witness||t.witnessHash!==hash(t.witness)||
    t.witness.details?.circle!==stage||
    t.witness.details?.origin!==
      (kind==='practice'?PRACTICE:kind==='repair'?REPAIR:TEST)||
    used.has(t.witnessHash))
    return false;
   used.add(t.witnessHash);
   if(kind==='practice'){
    if(completed||t.manaSpent!==spec.minuteCost||
     t.earned!==(t.check.success?t.check.progress:0)||
     t.points!==Math.min(6,points+t.earned)||
     t.strainAdded!==(t.check.degree==='severe failure'?3:0))
     return false;
    points=t.points;strain=Math.min(100,strain+t.strainAdded);
   }else if(kind==='repair'){
    if(t.strainBefore!==strain||
     t.strainAfter!==(t.check.success?Math.max(0,strain-2):strain))
     return false;
    strain=t.strainAfter;
   }else{
    if(t.pointsAtAttempt!==6||t.strainAtAttempt>2||
     t.manaSpent!==spec.minuteCost+4||
     t.formed!==t.check.success)
     return false;
    if(t.formed){
     if(completed)return false;
     completed=r;
     const p=Build.arcaneProfile(stage),cap=t.capacity;
     if(!cap||!int(cap.oldMana,t.manaSpent,100000)||
      !int(cap.oldMax,0,100000)||
      cap.newMana!==cap.oldMana-t.manaSpent||
      cap.newMax!==Math.max(cap.oldMax,p.mana)||
      cap.channels!==p.channels||cap.intake!==p.intake||
      cap.prepared!==p.prepared||
      cap.complexity!==p.maxComplexity)
      return false;
    }else if(t.capacity!==null)return false;
   }
   last=t.minute+t.minutes;
  }
  if(z.points!==points||z.strain!==strain||
   !!z.transition!==!!completed||
   (z.transition&&(z.transition.seal!==completed.seal||
    hash(z.transition.source)!==hash(completed.source))))
   return false;
  if(completed){maxFormed=stage;predecessor=completed.seal;}
 }
 if((a?.circles||0)!==maxFormed)return false;
 if(a.circles>=5){
  const p=Build.arcaneProfile(a.circles);
  if(a.channels!==p.channels||a.structuredMana!==p.mana||
   a.maxComplexity!==p.maxComplexity||a.preparedCapacity!==p.prepared||
   a.intake!==p.intake||a.loadTolerance!==p.loadTolerance||
   a.higherGeometry!==entryFor(s,a.circles).source.design||
   s.player.maxMana<entryFor(s,a.circles).transition.source.capacity.newMax)
   return false;
 }
 return true;
}
function prerequisite(s,stage,{care=false}={}){
 const spec=required(stage),prior=previous(s,stage);
 const a=s.player.arcane;
 if(a.coreStability<35&&!care)throw Error('Actual unstable Mana Core needs individual repair before advanced work');
 if(!care&&s.table?.combatants?.player&&s.table.combatants.player.status!=='ok')
  throw Error('Incapacitated people cannot safely conduct independent Arcane architecture work');
 worldPlace(s);
 return {spec,prior,a};
}
function map(s,p={}){
 if(!only(p,['stage','design','channelModel','interference','safety',
   'lawRef','witnessIndex'])||
  !int(p.stage,5,9)||!prose(p.design,30,900)||
  !prose(p.channelModel,25,900)||
  !prose(p.interference,25,900)||!prose(p.safety,25,900))
  throw Error('Higher Circle plan needs its actual stage, physical channel design, interference and failure precautions');
 const {spec,prior,a}=prerequisite(s,p.stage);
 if(entryFor(s,p.stage))throw Error('The prior individual plan cannot be rewritten to erase its history');
 const e=scene(s,p.witnessIndex,MAP,p.stage),d=e.details;
 if(d.kind!==spec.kind||
  !spec.sourceFields.every(f=>prose(d[f],24,900))||
  !prose(d.countertest,24,900)||
  d.existingChannels!==a.channels)
  throw Error('Original local source must demonstrate this distinct Circle mechanism and the existing true channels');
 let lawRef=null,lawHash=null;
 if(p.stage===8){
  const law=originalLaw(s,p.lawRef);
  if(!law||d.lawSeal!==law.seal)
   throw Error('The named local supernatural law must exist as a source-backed true law and have an actual witnessed physical manifestation');
  lawRef={planeId:law.planeId,domain:law.domain};lawHash=hash(law);
 }else if(p.lawRef!==undefined)
  throw Error('A cosmic-law source cannot replace this stage physical evidence');
 const loc=worldPlace(s);
 const source={origin:ORIGIN,stage:p.stage,kind:spec.kind,
  predecessor:prior,minute:s.world.minutes,
  design:p.design.trim(),channelModel:p.channelModel.trim(),
  interference:p.interference.trim(),safety:p.safety.trim(),
  location:s.world.location,biome:loc.biome,
  witness:e,witnessHash:hash(e),lawRef,lawHash,
  ...(p.stage===9?{placeId:loc.id,siteName:loc.name}:{}),
  grantsNoSpell:true};
 s.table.arcaneArchitecture.higherCircles||={origin:ORIGIN,circles:{}};
 s.table.arcaneArchitecture.higherCircles.circles[p.stage]={
  origin:ORIGIN,source,seal:hash(source),points:0,
  strain:0,attempts:[],repairs:[],tests:[],transition:null};
 return {mapped:true,stage:p.stage,circleName:spec.name,
  noAutomaticSpellOrEnvironmentalControl:true};
}
function work(s,p={}){
 if(!only(p,['stage','witnessIndex','minutes'])||
  !int(p.stage,5,9)||!int(p.minutes??60,15,480))
  throw Error('Actual individual Arcane work needs a witnessed technique, stage and real minutes');
 const {spec,a}=prerequisite(s,p.stage),r=entryFor(s,p.stage);
 if(!r||!verify(s))throw Error('Genuine mapped and unchanged Arcane structural proof is required');
 if(r.points>=6)throw Error('The studied structure is ready for an independent live countertest');
 if(r.strain>=5)throw Error('An actual overloaded Mana structure needs repair before more practice');
 const e=scene(s,p.witnessIndex,PRACTICE,p.stage);
 if(!prose(e.details.measuredResponse,24,900)||
  !prose(e.details.resistance,24,900))
  throw Error('Actual geometry response and independent resistance must be witnessed');
 if(r.attempts.some(t=>t.source.witnessHash===hash(e)))
  throw Error('The witnessed Arcane practice cannot be rolled twice');
 const minutes=p.minutes??60,mana=spec.minuteCost,
  stamina=Math.ceil(minutes/120)+1;
 if(!int(s.player.mana,mana,100000)||
  !int(s.player.stamina,stamina,100000))
  throw Error('The original Core lacks actual available Mana or Stamina for this work');
 const start=s.world.minutes;s.player.mana-=mana;s.player.stamina-=stamina;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.int-10)/2)+
   2*(s.player.skills.arcana?.rank||0)+Math.floor(a.coreStability/30)-2,
  dc:spec.dc,label:'Earned Arcane '+spec.name+' physical calibration'});
 const ev=structuredClone(s.log.at(-1)),earned=check.success?check.progress:0,
  strainAdded=check.degree==='severe failure'?3:0;
 if(strainAdded)a.coreStability=Math.max(1,a.coreStability-3);
 r.points=Math.min(6,r.points+earned);
 r.strain=Math.min(100,r.strain+strainAdded);
 const source={origin:ORIGIN,kind:'practice',stage:p.stage,minute:start,
  minutes,manaSpent:mana,staminaSpent:stamina,
  roll:check.roll,check:structuredClone(check),checkEvent:ev,
  checkEventHash:hash(ev),witness:e,witnessHash:hash(e),
  earned,points:r.points,strainAdded};
 r.attempts.push({origin:ORIGIN,source,seal:hash(source)});
 E.advance(s,minutes);require('./world').finalizeTime(s,start);
 if(!verify(s))throw Error('Source-backed physical Arcane calibration or receipt was altered');
 return {practised:true,stage:p.stage,check,earned,points:r.points,
  required:6,strain:r.strain,manaSpent:mana,
  staminaSpent:stamina,minutes,noFreeSpell:true};
}
function repair(s,p={}){
 if(!only(p,['stage','witnessIndex','minutes'])||
  !int(p.stage,5,9)||!int(p.minutes??60,15,480))
  throw Error('Actual Arcane interference repair requires time, clinical source and stage');
 const {a}=prerequisite(s,p.stage,{care:true}),r=entryFor(s,p.stage);
 if(!r||!verify(s)||!r.strain)
  throw Error('No actual original Circle strain exists to repair');
 const e=scene(s,p.witnessIndex,REPAIR,p.stage);
 if(!prose(e.details.examinedFailure,24,900)||
  !prose(e.details.restorativeGeometry,24,900))
  throw Error('Observed structural injury and a credible restoration are required');
 if(r.repairs.some(t=>t.source.witnessHash===hash(e)))
  throw Error('This exact original Arcane structural repair has already been resolved');
 const mana=2,minutes=p.minutes??60,stamina=1+Math.ceil(minutes/120);
 if(!int(s.player.mana,mana,100000)||!int(s.player.stamina,stamina,100000))
  throw Error('Repair needs genuine Mana and physical effort');
 const start=s.world.minutes,prior=r.strain;
 s.player.mana-=mana;s.player.stamina-=stamina;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.int-10)/2)+
   2*(s.player.skills.arcana?.rank||0),
  dc:14,label:'Actual physical Arcane '+p.stage+' Circle interference repair'});
 const ev=structuredClone(s.log.at(-1));
 r.strain=check.success?Math.max(0,prior-2):prior;
 if(check.success)a.coreStability=Math.min(100,a.coreStability+1);
 const source={origin:ORIGIN,kind:'repair',stage:p.stage,minute:start,
  minutes,manaSpent:mana,staminaSpent:stamina,
  roll:check.roll,check:structuredClone(check),checkEvent:ev,
  checkEventHash:hash(ev),witness:e,witnessHash:hash(e),
  strainBefore:prior,strainAfter:r.strain};
 r.repairs.push({origin:ORIGIN,source,seal:hash(source)});
 E.advance(s,minutes);require('./world').finalizeTime(s,start);
 if(!verify(s))throw Error('Physical source-backed Arcane structural repair cannot be verified');
 return {repaired:check.success,check,strain:r.strain,
  manaSpent:mana,staminaSpent:stamina,minutes};
}
function complete(s,p={}){
 if(!only(p,['stage','witnessIndex','minutes'])||
  !int(p.stage,5,9)||!int(p.minutes??90,30,480))
  throw Error('High Circle completion requires an independent original witnessed structural test');
 const {spec,a}=prerequisite(s,p.stage),r=entryFor(s,p.stage);
 if(!r||!verify(s)||r.points<6||r.strain>2)
  throw Error('Actually earned advanced Circle work and safe interference control must precede formation');
 const e=scene(s,p.witnessIndex,TEST,p.stage);
 if(!prose(e.details.independentCountertest,24,900)||
  !prose(e.details.limitObserved,24,900))
  throw Error('A new independent live test of the actual original Circle and its physical limit is missing');
 if(r.tests.some(t=>t.source.witnessHash===hash(e)))
  throw Error('One structural breakthrough witness may not receive a second roll');
 const minutes=p.minutes??90,mana=spec.minuteCost+4,
  stamina=Math.ceil(minutes/90)+2;
 if(!int(s.player.mana,mana,100000)||
  !int(s.player.stamina,stamina,100000))
  throw Error('Real existing Mana and Stamina must fund a structural breakthrough');
 const start=s.world.minutes,oldMana=s.player.mana,oldMax=s.player.maxMana;
 s.player.mana-=mana;s.player.stamina-=stamina;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.int-10)/2)+
   2*(s.player.skills.arcana?.rank||0)+Math.floor(a.coreStability/30)-2,
  dc:spec.dc+3,label:'Arcane '+spec.name+' independent physical integration'});
 const ev=structuredClone(s.log.at(-1));let cap=null;
 if(check.success){
  const next=Build.arcaneProfile(p.stage);
  a.circles=p.stage;a.channels=next.channels;
  a.structuredMana=next.mana;a.intake=next.intake;
  a.maxComplexity=next.maxComplexity;
  a.preparedCapacity=next.prepared;a.loadTolerance=next.loadTolerance;
  a.higherGeometry=r.source.design;
  s.player.maxMana=Math.max(oldMax,next.mana);
  cap={oldMana,newMana:s.player.mana,oldMax,newMax:s.player.maxMana,
   channels:next.channels,intake:next.intake,prepared:next.prepared,
   complexity:next.maxComplexity};
 }
 const source={origin:ORIGIN,kind:'test',stage:p.stage,
  minute:start,minutes,manaSpent:mana,staminaSpent:stamina,
  witness:e,witnessHash:hash(e),roll:check.roll,
  check:structuredClone(check),checkEvent:ev,checkEventHash:hash(ev),
  formed:check.success,pointsAtAttempt:r.points,strainAtAttempt:r.strain,
  capacity:cap};
 const receipt={origin:ORIGIN,source,seal:hash(source)};
 r.tests.push(receipt);if(check.success)r.transition=receipt;
 E.advance(s,minutes);require('./world').finalizeTime(s,start);
 if(!verify(s))throw Error('Advanced Arcane Circle evidence or original Mana capacity failed verification');
 return {attempted:true,formed:check.success,stage:a.circles,
  check,manaSpent:mana,staminaSpent:stamina,minutes,
  capacity:cap,noAutomaticSpellOrOverriddenWorldLaw:true};
}
function status(s){
 const current=s.player?.arcane?.circles||0;
 if(current<4)return {circles:current,ready:false,
  note:'Genuinely source-earned Fourth Circle geometry must precede advanced designs'};
 if(!verify(s))throw Error('Saved higher-circle original geometry or structural receipts failed verification');
 const l=s.table?.arcaneArchitecture?.higherCircles;
 return {circles:current,next:current<9?current+1:null,
  stages:Object.values(l?.circles||{}).map(r=>({
   circle:r.source.stage,name:SPEC[r.source.stage].name,
   structuralProgress:r.points,needed:6,strain:r.strain,
   formed:!!r.transition,individualBasis:r.source.kind})),
  abilityBoundary:'Higher Circles extend real architecture only; each spell, spiritual influence and environmental effect requires a distinct learned source'};
}
module.exports={ORIGIN,MAP,PRACTICE,TEST,REPAIR,SPEC,
 map,work,repair,complete,status,verify};
