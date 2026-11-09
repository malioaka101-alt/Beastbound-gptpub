'use strict';
// #11: open-ended original formulae inside the existing Arcane architecture.
// A designed formula != a learned spell != a successful real cast. Only a
// bounded noncombat sensory/structural demonstration is currently executable.
const Crypto=require('node:crypto'),E=require('../engine.js'),C=require('./core'),
 Build=require('./build'),D=require('./disciplines'),Dynamic=require('./arcane-dynamic-architecture');
const ORIGIN='source-earned-individual-arcane-spell-grammar-v1',
 MAP='witnessed-original-individual-spell-grammar-v1',
 STUDY='witnessed-individual-arcane-formula-study-v1',
 CAST='witnessed-limited-original-arcane-formula-demonstration-v1',
 REPAIR='witnessed-source-specific-spell-interference-repair-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{2,75}$/.test(x);
const int=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b;
const prose=(x,a=12,b=900)=>typeof x==='string'&&x.trim().length>=a&&x.trim().length<=b;
const only=(x,k)=>x&&typeof x==='object'&&!Array.isArray(x)&&
 Object.keys(x).every(key=>k.includes(key));
const PLAN_KEYS=['family','damage','rng','area','duration','magnitude',
 'conditions','stunned','extraTargets','speed','analogueTier','specialised','worldCircuit'];
const NONCOMBAT=['shape','sense','utility','veil','ward','link'];
function scene(s,index,origin,formulaId){
 if(!int(index,0,s.log.length-1))throw Error('An existing individual witnessed formula scene is required');
 const e=s.log[index];
 if(e?.type!=='story'||e.details?.origin!==origin||
  e.details?.formulaId!==formulaId||
  e.details?.location!==s.world.location||!prose(e.text,15,900))
  throw Error('That independent local formula activity has not been witnessed');
 return structuredClone(e);
}
function foundation(s){
 const a=s.player?.arcane;
 if(!a?.coreIgnited||a.circles<3||!s.table?.arcaneArchitecture?.circle3)
  throw Error('An actual earned Third Circle and Mana Core are required');
 if(a.circles===3)D.verifyThirdCircle(s);
 else if(a.circles===4&&!Dynamic.verify(s))
  throw Error('Existing Fourth Circle geometry was not genuinely source-earned');
 else if(a.circles>4)
  throw Error('Higher Arcane Circle effects need separate source-specific stage verification');
 if(s.battle||s.encounter)throw Error('Unaudited arcane research cannot be conflated with a live combat exchange');
 return a;
}
function rawCost(form){
 if(!form||!only(form,PLAN_KEYS)||!GATE.includes(form.family)||
  form.damage!==undefined||form.stunned===true||
  form.extraTargets!==undefined&&form.extraTargets!==0||
  form.analogueTier!==undefined||form.worldCircuit===true)
  throw Error('A bounded noncombat formula needs an original physical spell family, not combat effects or external beast analogues');
 const spell=Build.spellCost(form);
 if(!int(spell.complexity,1,30)||!int(spell.mana,1,100)||
  !int(spell.load,1,30)||spell.minCircle===null)
  throw Error('The original Arcane spell grammar exceeds supported known complexity');
 return spell;
}
function sealValid(s){
 const l=s.table?.arcaneArchitecture?.formulae;
 if(!l)return true;
 if(l.origin!==ORIGIN||!l.records||typeof l.records!=='object'||
  Array.isArray(l.records))return false;
 for(const [name,rec] of Object.entries(l.records)){
  const x=rec?.source;
  if(!id(name)||rec.id!==name||rec.origin!==ORIGIN||
   rec.seal!==hash(x)||x?.origin!==ORIGIN||x.id!==name||
   !x.form||x.cost?.mana!==rawCost(x.form).mana||
   x.cost.complexity!==rawCost(x.form).complexity||
   !prose(x.mechanism,20,900)||!prose(x.limit,20,900)||
   !prose(x.interferenceSource,20,900)||
   !Array.isArray(x.channels)||!x.channels.length||
   !x.channels.every(n=>int(n,1,12))||
   new Set(x.channels).size!==x.channels.length||
   x.channels.length>Math.max(1,s.player.arcane.channels)||
   !x.witness||x.witnessHash!==hash(x.witness)||
   x.witness.details?.origin!==MAP||
   !Array.isArray(rec.study)||!Array.isArray(rec.casts)||
   !Array.isArray(rec.repairs)||!int(rec.points,0,5)||
   !int(rec.interference,0,100)||typeof rec.learned!=='boolean')
   return false;
  let points=0,interference=0,learned=false;
  const used=new Set(),steps=[
   ...rec.study.map(r=>({kind:'study',r})),
   ...rec.casts.map(r=>({kind:'cast',r})),
   ...rec.repairs.map(r=>({kind:'repair',r}))
  ].sort((a,b)=>a.r.source.minute-b.r.source.minute);
  let last=x.minute;
  for(const step of steps){
   const a=step.r?.source,k=step.kind;
   if(step.r?.origin!==ORIGIN||step.r.seal!==hash(a)||
    a?.origin!==ORIGIN||a.kind!==k||
    a.id!==name||!int(a.minute,last,s.world.minutes)||
    !int(a.minutes,5,480)||!int(a.manaSpent,1,100)||
    !int(a.staminaSpent,1,20)||
    !int(a.roll,1,20)||a.check?.roll!==a.roll||
    !a.checkEvent||hash(a.checkEvent)!==a.checkEventHash||
    a.checkEvent.type!=='roll'||hash(a.checkEvent.details)!==hash(a.check)||
    !a.witness||hash(a.witness)!==a.witnessHash||
    a.witness.details?.origin!==
      (k==='study'?STUDY:k==='cast'?CAST:REPAIR)||
    used.has(a.witnessHash))
    return false;
   used.add(a.witnessHash);
   if(k==='study'){
    if(a.earned!==(a.check.success?a.check.progress:0)||
     a.points!==Math.min(5,points+a.earned))return false;
    points=a.points;learned=points>=5;
   }else if(k==='cast'){
    if(!learned||a.interferenceAdded!==(a.check.degree==='severe failure'?2:0)||
     a.interferenceBefore!==interference||
     a.interferenceAfter!==Math.min(100,interference+a.interferenceAdded)||
     a.manaSpent!==(a.check.success?x.cost.mana:
      a.check.degree==='setback'?Math.floor(x.cost.mana/2):x.cost.mana)||
     a.demonstrated!==a.check.success)
     return false;
    interference=a.interferenceAfter;
   }else{
    if(a.interferenceBefore!==interference||
     a.interferenceAfter!==(a.check.success?Math.max(0,interference-2):interference))
     return false;
    interference=a.interferenceAfter;
   }
   last=a.minute+a.minutes;
  }
  if(rec.points!==points||rec.learned!==learned||
    rec.interference!==interference)return false;
 }
 return true;
}
function ensure(s){
 s.table.arcaneArchitecture.formulae||={origin:ORIGIN,records:{}};
 if(!sealValid(s))throw Error('Original authored spell grammar ledger was changed');
 return s.table.arcaneArchitecture.formulae;
}
function map(s,p={}){
 if(!only(p,['id','name','form','channels','mechanism','limit',
  'interferenceSource','witnessIndex'])||!id(p.id)||
  !prose(p.name,3,140)||!prose(p.mechanism,20,900)||
  !prose(p.limit,20,900)||!prose(p.interferenceSource,20,900)||
  !Array.isArray(p.channels))
  throw Error('Original spell grammar requires identity, actual channels, principle and limits');
 const a=foundation(s),cost=rawCost(p.form),chs=p.channels;
 if(cost.minCircle>a.circles||cost.complexity>a.maxComplexity||
  cost.load>a.loadTolerance||chs.length<1||
  chs.length>a.channels||chs.some(n=>!int(n,1,a.channels))||
  new Set(chs).size!==chs.length)
  throw Error('Original real Circle geometry and Mana architecture cannot support this formula');
 const e=scene(s,p.witnessIndex,MAP,p.id);
 if(!prose(e.details.observedGeometry,25,900)||
  !prose(e.details.knownFailure,25,900))
  throw Error('Independent original geometric observation and interference risk must be witnessed');
 if(s.table.arcaneArchitecture.formulae?.records[p.id])
  throw Error('One formula cannot be remapped to erase its previous study');
 const x={origin:ORIGIN,id:p.id,minute:s.world.minutes,
  name:p.name.trim(),form:structuredClone(p.form),cost,
  channels:[...chs],mechanism:p.mechanism.trim(),
  limit:p.limit.trim(),interferenceSource:p.interferenceSource.trim(),
  witness:e,witnessHash:hash(e),
  allowedEffect:'bounded noncombat geometry/sensing demonstration only'};
 const r={origin:ORIGIN,id:p.id,source:x,seal:hash(x),
  points:0,learned:false,interference:0,study:[],casts:[],repairs:[]};
 ensure(s).records[p.id]=r;
 return {mapped:true,formulaId:p.id,minimumCircle:cost.minCircle,
  manaCost:cost.mana,complexity:cost.complexity,
  learned:false,noAutomaticEffect:true};
}
function learn(s,p={}){
 if(!only(p,['id','witnessIndex','minutes'])||!id(p.id)||
  !int(p.minutes??60,15,480))throw Error('Formula learning needs actual study time and an original witnessed test');
 const a=foundation(s),r=s.table.arcaneArchitecture.formulae?.records[p.id];
 if(!r||!sealValid(s)||r.learned)throw Error('An unlearned, unchanged individually authored formula is required');
 const e=scene(s,p.witnessIndex,STUDY,p.id);
 if(!prose(e.details.practicalTest,25,900)||!prose(e.details.interference,25,900))
  throw Error('An independently witnessed original practical formula trial is required');
 const proof=hash(e);
 if(r.study.some(x=>x.source.witnessHash===proof))
  throw Error('One original formula experiment cannot be rolled twice');
 const minutes=p.minutes??60,spent=Math.max(2,Math.ceil(r.source.cost.mana/2)),
  stamina=Math.ceil(minutes/120)+1;
 if(!int(s.player.mana,spent,100000)||!int(s.player.stamina,stamina,100000))
  throw Error('Actual Mana and physical effort are needed to learn the designed spell');
 const before=s.world.minutes;
 s.player.mana-=spent;s.player.stamina-=stamina;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.int-10)/2)+
   2*(s.player.skills.arcana?.rank||0),
   dc:13+r.source.cost.complexity,label:'Learn source-authored Arcane spell grammar'});
 const event=structuredClone(s.log.at(-1));
 const earned=check.success?check.progress:0;
 r.points=Math.min(5,r.points+earned);r.learned=r.points>=5;
 const source={origin:ORIGIN,id:p.id,kind:'study',minute:before,
  minutes,staminaSpent:stamina,manaSpent:spent,roll:check.roll,
  witness:e,witnessHash:proof,check:structuredClone(check),
  checkEvent:event,checkEventHash:hash(event),
  earned,points:r.points};
 r.study.push({origin:ORIGIN,source,seal:hash(source)});
 if(r.learned){
  s.table.arcaneTechniques||={};
  s.table.arcaneTechniques[p.id]={techniqueId:p.id,source:ORIGIN,
   originalSpellGrammarHash:r.seal,learnedAtMinute:before+minutes,
   acquiredAtCircle:a.circles,spellCost:{...r.source.cost},
   permittedEffect:'noncombat-source-bounded'};
 }
 E.advance(s,minutes);require('./world').finalizeTime(s,before);
 if(!sealValid(s))throw Error('Real learned spell proof failed original check verification');
 return {studied:true,learned:r.learned,check,earned,points:r.points,
  manaSpent:spent,staminaSpent:stamina,minutes,
  noInstantSpellEffect:true};
}
function cast(s,p={}){
 if(!only(p,['id','witnessIndex'])||!id(p.id))
  throw Error('A real previously learned spell and local witnessed demonstration are required');
 const a=foundation(s),r=s.table.arcaneArchitecture.formulae?.records[p.id];
 const earned=s.table?.arcaneTechniques?.[p.id];
 if(!r?.learned||!sealValid(s)||!earned||
  earned.source!==ORIGIN||earned.originalSpellGrammarHash!==r.seal||
  earned.techniqueId!==p.id||
  earned.spellCost?.mana!==r.source.cost.mana||
  earned.acquiredAtCircle>a.circles)
  throw Error('Original independently learned source-spell is not authentically recorded');
 if(r.interference>=4)throw Error('Spell-specific structural interference needs genuine repair first');
 const e=scene(s,p.witnessIndex,CAST,p.id);
 if(!prose(e.details.physicalObservation,25,900)||
  !prose(e.details.environmentalCounter,25,900))
  throw Error('A bounded original spell demonstration and environmental counter must actually be witnessed');
 const w=hash(e);
 if(r.casts.some(x=>x.source.witnessHash===w))throw Error('One original spell demonstration cannot be rolled twice');
 const spell=r.source.cost,minutes=5,stamina=1;
 if(!int(s.player.mana,spell.mana,100000)||
  !int(s.player.stamina,stamina,100000))
  throw Error('Real available Mana and Stamina do not support the prepared spell');
 const before=s.world.minutes;
 s.player.mana-=spell.mana;s.player.stamina-=stamina;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.int-10)/2)+
   2*(s.player.skills.arcana?.rank||0)-r.interference,
   dc:spell.castingDC,label:'Noncombat original learned spell structural demonstration'});
 const event=structuredClone(s.log.at(-1)),added=check.degree==='severe failure'?2:0,
  interferenceBefore=r.interference;
 r.interference=Math.min(100,r.interference+added);
 // Original spell fizzle returns half Mana ONLY on a setback, as in the
 // base casting grammar. No paid magical effect is invented on any roll.
 const spent=check.success?spell.mana:
  check.degree==='setback'?Math.floor(spell.mana/2):spell.mana;
 if(spent<spell.mana)s.player.mana+=spell.mana-spent;
 const source={origin:ORIGIN,id:p.id,kind:'cast',minute:before,minutes,
  staminaSpent:stamina,manaSpent:spent,roll:check.roll,
  witness:e,witnessHash:w,check:structuredClone(check),
  checkEvent:event,checkEventHash:hash(event),
  demonstrated:check.success,interferenceAdded:added,
  interferenceBefore,interferenceAfter:r.interference};
 r.casts.push({origin:ORIGIN,source,seal:hash(source)});
 E.advance(s,minutes);require('./world').finalizeTime(s,before);
 if(!sealValid(s))throw Error('Actual limited spell check or interference receipt changed');
 return {demonstrated:check.success,check,manaSpent:spent,
  staminaSpent:stamina,minutes,interference:r.interference,
  limitedEffect:'Source-witnessed noncombat Mana pattern only; no automatic strike, ward, healing, coercion or external creature control'};
}
function repair(s,p={}){
 if(!only(p,['id','witnessIndex','minutes'])||!id(p.id)||
  !int(p.minutes??45,15,480))
  throw Error('Spell interference repair needs original evidence and actual physical time');
 const a=foundation(s),r=s.table.arcaneArchitecture.formulae?.records[p.id];
 if(!r||!sealValid(s)||!r.interference)
  throw Error('No source-confirmed ongoing spell interference exists here');
 const e=scene(s,p.witnessIndex,REPAIR,p.id);
 if(!prose(e.details.interferenceDiagnosis,25,900)||
  !prose(e.details.physicalRepair,25,900))
  throw Error('A genuine observed formula failure and source-specific repair are required');
 const w=hash(e);
 if(r.repairs.some(x=>x.source.witnessHash===w))throw Error('The original formula repair already occurred');
 const minutes=p.minutes??45,spent=2,stamina=2;
 if(!int(s.player.mana,spent,100000)||!int(s.player.stamina,stamina,100000))
  throw Error('Formula repair consumes actual Mana and Stamina');
 const before=s.world.minutes;
 s.player.mana-=spent;s.player.stamina-=stamina;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.int-10)/2)+
  2*(s.player.skills.arcana?.rank||0),dc:15,
  label:'Original structural spell interference correction'});
 const event=structuredClone(s.log.at(-1)),prior=r.interference;
 r.interference=check.success?Math.max(0,prior-2):prior;
 const source={origin:ORIGIN,id:p.id,kind:'repair',minute:before,minutes,
  manaSpent:spent,staminaSpent:stamina,roll:check.roll,
  witness:e,witnessHash:w,check:structuredClone(check),
  checkEvent:event,checkEventHash:hash(event),
  interferenceBefore:prior,interferenceAfter:r.interference};
 r.repairs.push({origin:ORIGIN,source,seal:hash(source)});
 E.advance(s,minutes);require('./world').finalizeTime(s,before);
 if(!sealValid(s))throw Error('Original formula repair receipt was changed');
 return {repaired:check.success,check,interference:r.interference,
  manaSpent:spent,staminaSpent:stamina,minutes,noFreePower:true};
}
function status(s){
 const a=s.player?.arcane,l=s.table?.arcaneArchitecture?.formulae;
 if(!l)return {circles:a?.circles||0,formulae:[],known:0};
 if(!sealValid(s))throw Error('Known spell architecture was altered');
 const rows=Object.values(l.records).map(x=>({
  id:x.id,name:x.source.name,channels:x.source.channels,
  manaCost:x.source.cost.mana,minimumCircle:x.source.cost.minCircle,
  progress:x.points,learned:x.learned,interference:x.interference,
  limitedEffect:x.source.allowedEffect}));
 return {circles:a?.circles||0,formulae:rows,known:rows.filter(x=>x.learned).length,
  noAutomaticSpellEffects:true};
}
module.exports={ORIGIN,MAP,STUDY,CAST,REPAIR,
 map,learn,cast,repair,status,verify:sealValid};
