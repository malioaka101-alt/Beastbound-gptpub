'use strict';
// Authored spell geometry is NOT an ability award. The existing spellCost
// calculates complexity, mana, load and Circle; the distinct source-backed
// experimental formula must first be learned and independently checked.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),B=require('./build'),W=require('./world'),
 Higher=require('./arcane-higher-architecture');
const ORIGIN='original-source-earned-arcane-formula-grammar-v1',
 MAP='witnessed-arcane-formula-principle-v1',
 WORK='witnessed-real-arcane-formula-repetition-v1',
 PROBE='witnessed-independent-arcane-formula-countertest-v1',
 REPAIR='witnessed-arcane-formula-interference-repair-v1';
const H=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const integer=(v,min=0,max=1000000000)=>Number.isInteger(v)&&v>=min&&v<=max;
const prose=(v,min=12,max=950)=>typeof v==='string'&&v.trim().length>=min&&v.trim().length<=max;
const ID=v=>typeof v==='string'&&/^[a-z][a-z0-9_-]{2,75}$/.test(v);
const only=(p,keys)=>p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).every(x=>keys.includes(x));
const GRAMMAR=['family','damage','rng','area','duration','magnitude',
 'conditions','extraTargets','speed','analogueTier','specialised','worldCircuit'];
function scene(s,index,origin,id){
 if(!integer(index,0,s.log.length-1))throw Error('An original witnessed spell experiment is required');
 const e=s.log[index];
 if(e?.type!=='story'||e.details?.origin!==origin||
  e.details?.formulaId!==id||e.details?.location!==s.world.location||
  !prose(e.text,18,900))
  throw Error('This specific original formula was not demonstrated or countertested locally');
 return structuredClone(e);
}
function pre(s){
 const a=s.player?.arcane;
 if(!a||a.circles<3||!Higher.verify(s))
  throw Error('Genuine earned Mana Core and Third Circle original geometry are required');
 if(s.battle||s.encounter||
  s.table?.combatants?.player?.status&&s.table.combatants.player.status!=='ok')
  throw Error('Experimental spell construction requires a safe real working environment');
 return {a,thirdHash:H(Higher.third(s).proof)};
}
function spell(s,g){
 if(!g||typeof g!=='object'||Array.isArray(g)||
    Object.keys(g).some(x=>!GRAMMAR.includes(x)))
  throw Error('Use the original Arcane spell grammar, not a chosen arbitrary effect or complexity');
 const spec=B.spellCost(g),profile=B.arcaneProfile(s.player.arcane.circles);
 if(!integer(spec.minCircle,0,9)||spec.minCircle>s.player.arcane.circles||
   spec.complexity>profile.maxComplexity||
   spec.load>profile.loadTolerance||
   spec.mana>s.player.maxMana)
  throw Error('The proposed formula exceeds the actual earned Circle, core load or Mana capacity');
 if(g.worldCircuit&&!s.table?.arcaneArchitecture?.circle9)
  throw Error('A World Circuit cannot be assumed without its source-earned Ninth Circle');
 return spec;
}
function verify(s){
 const data=s.table?.arcaneFormulas;
 if(!data)return true;
 try{Higher.third(s);}catch{return false;}
 if(data.origin!==ORIGIN||!data.items||typeof data.items!=='object'||
  Array.isArray(data.items))return false;
 const thirdHash=H(Higher.third(s).proof),used=new Set();
 for(const [id,entry] of Object.entries(data.items)){
  const z=entry?.source;
  if(!ID(id)||entry.id!==id||entry.origin!==ORIGIN||
   entry.seal!==H(z)||z?.origin!==ORIGIN||z.id!==id||
   z.thirdHash!==thirdHash||!prose(z.name,3,140)||
   !prose(z.geometry,28,850)||!prose(z.method)||
   !prose(z.observedEffect)||!prose(z.interference)||
   !prose(z.counter)||!prose(z.failureBoundary)||
   !integer(z.minute,0,s.world.minutes)||
   !integer(z.circleAtDesign,3,s.player.arcane.circles)||
   !Array.isArray(z.channels)||z.channels.length<1||
   z.channels.length>z.circleAtDesign||
   new Set(z.channels).size!==z.channels.length||
   z.channels.some(n=>!integer(n,1,z.circleAtDesign))||
   z.witnessHash!==H(z.witness)||
   z.witness?.details?.origin!==MAP||
   z.witness.details?.formulaId!==id||
   !Array.isArray(entry.attempts)||!Array.isArray(entry.probes)||
   !Array.isArray(entry.repairs)||!integer(entry.points,0,30))
   return false;
  let cost;
  try{cost=B.spellCost(z.grammar);}catch{return false;}
  if(H(cost)!==H(z.cost)||!integer(z.required,5,30)||
   z.required!==5+Math.ceil(cost.complexity/5)||
   entry.points>z.required)return false;
  let points=0,last=z.minute,formed=false,issues=0;
  for(const attempt of entry.attempts){
   const a=attempt?.source;
   if(attempt?.origin!==ORIGIN||attempt.seal!==H(a)||
    a?.origin!==ORIGIN||a.id!==id||
    !integer(a.minute,last,s.world.minutes)||
    !integer(a.minutes,15,480)||
    !integer(a.manaSpent,1,50)||!integer(a.staminaSpent,1,12)||
    !integer(a.roll,1,20)||a.check?.roll!==a.roll||
    a.earned!==(a.check.success?a.check.progress:0)||
    a.points!==Math.min(z.required,points+a.earned)||
    a.interference!==(a.check.degree==='severe failure'?2:0)||
    a.witnessHash!==H(a.witness)||
    a.witness?.details?.origin!==WORK||
    a.witness.details?.formulaId!==id||
    !a.rollEvent||a.rollEventHash!==H(a.rollEvent)||
    a.rollEvent.type!=='roll'||H(a.rollEvent.details)!==H(a.check)||
    used.has(a.witnessHash))return false;
   used.add(a.witnessHash);points=a.points;last=a.minute+a.minutes;
   issues+=a.interference;
  }
  if(points!==entry.points)return false;
  for(const receipt of entry.probes){
   const a=receipt?.source;
   if(receipt?.origin!==ORIGIN||receipt.seal!==H(a)||
    a?.origin!==ORIGIN||a.kind!=='independently-probed-original-spell-formula'||
    a.id!==id||a.pointsAtProbe!==z.required||
    !integer(a.minute,z.minute,s.world.minutes)||
    !integer(a.minutes,15,480)||
    a.manaSpent!==cost.mana||
    !integer(a.staminaSpent,1,12)||
    !integer(a.roll,1,20)||a.check?.roll!==a.roll||
    a.proven!==a.check.success||
    a.witnessHash!==H(a.witness)||
    a.witness?.details?.origin!==PROBE||
    a.witness.details?.formulaId!==id||
    !a.rollEvent||a.rollEventHash!==H(a.rollEvent)||
    a.rollEvent.type!=='roll'||H(a.rollEvent.details)!==H(a.check)||
    used.has(a.witnessHash))return false;
   used.add(a.witnessHash);formed=formed||a.proven;
   issues+=a.proven?0:1;
  }
  for(const receipt of entry.repairs){
   const a=receipt?.source;
   if(receipt?.origin!==REPAIR||receipt.seal!==H(a)||
    a?.origin!==REPAIR||a.id!==id||
    !integer(a.minute,z.minute,s.world.minutes)||
    !integer(a.minutes,15,480)||
    !integer(a.manaSpent,1,30)||!integer(a.staminaSpent,1,12)||
    !integer(a.roll,1,20)||a.check?.roll!==a.roll||
    a.issuesBefore!==issues||
    a.recovered!==(a.check.success?Math.min(2,issues):0)||
    a.witnessHash!==H(a.witness)||
    a.witness?.details?.origin!==REPAIR||
    a.witness.details?.formulaId!==id||
    !a.rollEvent||a.rollEventHash!==H(a.rollEvent)||
    a.rollEvent.type!=='roll'||H(a.rollEvent.details)!==H(a.check)||
    used.has(a.witnessHash))return false;
   used.add(a.witnessHash);issues-=a.recovered;
  }
  if(entry.proven!==formed||entry.interference!==issues)return false;
 }
 return true;
}
function map(s,p={}){
 if(!only(p,['id','name','geometry','method','observedEffect',
  'interference','counter','failureBoundary','grammar','channels','witnessIndex'])||
  !ID(p.id)||!prose(p.name,3,140)||
  !prose(p.geometry,28,850)||!prose(p.method)||
  !prose(p.observedEffect)||!prose(p.interference)||
  !prose(p.counter)||!prose(p.failureBoundary)||
  !Array.isArray(p.channels)||!p.channels.length||
  p.channels.some(n=>!integer(n,1,9)))
  throw Error('An original formula needs genuine geometry, observed principle, channels, interference, counter and failure limit');
 const {a,thirdHash}=pre(s),spec=spell(s,p.grammar);
 if(new Set(p.channels).size!==p.channels.length||
  p.channels.length>a.channels||p.channels.some(n=>n>a.channels))
  throw Error('The proposed independent formula exceeds the earned physical Mana channels');
 const event=scene(s,p.witnessIndex,MAP,p.id);
 if(!prose(event.details?.experiment,24,850)||
  !prose(event.details?.independentCountertest,24,850))
  throw Error('An actual distinct witnessed experimental principle and countertest are required');
 const current=s.table?.arcaneFormulas;
 if(current&&!verify(s))throw Error('The saved Arcane formula history was changed');
 if(current?.items[p.id])throw Error('That original spell formula already has an authored design');
 const z={origin:ORIGIN,id:p.id,minute:s.world.minutes,
  name:p.name.trim(),geometry:p.geometry.trim(),method:p.method.trim(),
  observedEffect:p.observedEffect.trim(),interference:p.interference.trim(),
  counter:p.counter.trim(),failureBoundary:p.failureBoundary.trim(),
  grammar:structuredClone(p.grammar),cost:spec,required:5+Math.ceil(spec.complexity/5),
  channels:[...p.channels],circleAtDesign:a.circles,thirdHash,
  witness:event,witnessHash:H(event),noFreeSpellEffect:true};
 s.table.arcaneFormulas||={origin:ORIGIN,items:{}};
 s.table.arcaneFormulas.items[p.id]={origin:ORIGIN,id:p.id,
  source:z,seal:H(z),attempts:[],probes:[],repairs:[],
  points:0,proven:false,interference:0};
 return {authored:true,id:p.id,complexity:spec.complexity,
  manaCost:spec.mana,castingDC:spec.castingDC,load:spec.load,
  minimumCircle:spec.minCircle,required:z.required,
  automaticallyLearned:false};
}
function work(s,p={}){
 if(!only(p,['id','witnessIndex','minutes'])||!ID(p.id)||
  !integer(p.minutes??90,15,480))
  throw Error('An original saved formula requires real witnessed study and physical time');
 const {a}=pre(s),entry=s.table?.arcaneFormulas?.items[p.id];
 if(!entry||!verify(s))throw Error('No valid original personally authored formula history');
 if(entry.points>=entry.source.required)
  throw Error('This original formula is ready for an independent countertest');
 const event=scene(s,p.witnessIndex,WORK,p.id);
 if(!prose(event.details?.measuredFeedback,24,850)||
  !prose(event.details?.failureComparison,24,850))
  throw Error('Real spell formula work needs observed feedback and a countermeasurement');
 const digest=H(event);
 if(entry.attempts.some(x=>x.source.witnessHash===digest))
  throw Error('The same original formula experiment may not be rolled twice');
 const cost=entry.source.cost,
  manaSpent=2+Math.ceil(cost.mana/4),
  minutes=p.minutes??90,staminaSpent=Math.ceil(minutes/120);
 if(!integer(s.player.mana,manaSpent,100000)||
  !integer(s.player.stamina,staminaSpent,100000))
  throw Error('Real Mana and Stamina must sustain this spell experiment');
 const start=s.world.minutes;
 s.player.mana-=manaSpent;s.player.stamina-=staminaSpent;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.int-10)/2)+
  2*(s.player.skills?.arcana?.rank||0)+(a.coreStability>=85?1:0),
  dc:12+Math.ceil(cost.complexity/2)+entry.interference,
  label:'Actually observed Arcane formula experiment'});
 const rollEvent=structuredClone(s.log.at(-1)),
  earned=check.success?check.progress:0,
  interference=check.degree==='severe failure'?2:0;
 entry.interference+=interference;
 entry.points=Math.min(entry.source.required,entry.points+earned);
 const source={origin:ORIGIN,id:p.id,minute:start,minutes,
  manaSpent,staminaSpent,roll:check.roll,check:structuredClone(check),
  rollEvent,rollEventHash:H(rollEvent),witness:event,witnessHash:digest,
  earned,points:entry.points,interference};
 entry.attempts.push({origin:ORIGIN,source,seal:H(source)});
 E.advance(s,minutes);W.finalizeTime(s,start);
 if(!verify(s))throw Error('Original formula progress cannot be reconciled with real work');
 return {practised:true,id:p.id,check,earned,
  progress:entry.points,required:entry.source.required,
  interference:entry.interference,manaSpent,staminaSpent,minutes,
  noAutomaticCastingEffect:true};
}
function probe(s,p={}){
 if(!only(p,['id','witnessIndex','minutes'])||!ID(p.id)||
  !integer(p.minutes??90,15,480))
  throw Error('A test-cast needs an original witnessed independent countertest');
 const {a}=pre(s),entry=s.table?.arcaneFormulas?.items[p.id];
 if(!entry||!verify(s)||entry.points<entry.source.required)
  throw Error('A genuinely learned original formula is needed before an independent test-cast');
 const event=scene(s,p.witnessIndex,PROBE,p.id);
 if(!prose(event.details?.observedStability,24,850)||
  !prose(event.details?.observedCounter,24,850))
  throw Error('The original casting countertest must document stability and real interference');
 const digest=H(event);
 if(entry.probes.some(x=>x.source.witnessHash===digest))
  throw Error('A spell experiment cannot reroll a previous original witness');
 const {mana:manaSpent,castingDC,load}=entry.source.cost,
  minutes=p.minutes??90,staminaSpent=Math.ceil(minutes/120);
 if(!integer(s.player.mana,manaSpent,100000)||
  !integer(s.player.stamina,staminaSpent,100000))
  throw Error('A real spell test requires its entire grammar-derived Mana cost');
 if(load> a.loadTolerance)
  throw Error('The current Mana Core cannot sustain the original formula load');
 const start=s.world.minutes;s.player.mana-=manaSpent;s.player.stamina-=staminaSpent;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.int-10)/2)+
  2*(s.player.skills?.arcana?.rank||0)+(a.coreStability>=85?1:0),
  dc:castingDC+entry.interference,
  label:'Original limited formula test-cast (effect adapter separate)'});
 const rollEvent=structuredClone(s.log.at(-1));
 entry.proven=entry.proven||check.success;
 if(!check.success)entry.interference++;
 const source={origin:ORIGIN,kind:'independently-probed-original-spell-formula',
  id:p.id,minute:start,minutes,manaSpent,staminaSpent,
  roll:check.roll,check:structuredClone(check),
  rollEvent,rollEventHash:H(rollEvent),witness:event,witnessHash:digest,
  pointsAtProbe:entry.points,proven:check.success};
 entry.probes.push({origin:ORIGIN,source,seal:H(source)});
 E.advance(s,minutes);W.finalizeTime(s,start);
 if(!verify(s))throw Error('Original Mana spell test or source was altered');
 return {probed:true,check,proven:entry.proven,
  manaSpent,staminaSpent,minutes,
  experimentallyValidatedFormula:entry.proven,
  noAutomaticCombatSpellOrUnverifiedTargetEffect:true};
}
function repair(s,p={}){
 if(!only(p,['id','witnessIndex','minutes'])||!ID(p.id)||
  !integer(p.minutes??60,15,480))
  throw Error('Real interference recovery needs a witnessed corrected formula and physical time');
 pre(s);const entry=s.table?.arcaneFormulas?.items[p.id];
 if(!entry||!verify(s)||entry.interference<=0)
  throw Error('There is no genuine unresolved original formula interference');
 const event=scene(s,p.witnessIndex,REPAIR,p.id);
 if(!prose(event.details?.diagnosis,24,850)||
  !prose(event.details?.correction,24,850))
  throw Error('Arcane interference recovery needs source-witnessed diagnosis and correction');
 const witnessHash=H(event);
 if(entry.repairs.some(x=>x.source.witnessHash===witnessHash))
  throw Error('This same original corrective experiment is already resolved');
 const minutes=p.minutes??60,manaSpent=2,staminaSpent=Math.ceil(minutes/120);
 if(!integer(s.player.mana,manaSpent,100000)||
  !integer(s.player.stamina,staminaSpent,100000))
  throw Error('Source-based correction needs real Mana and body effort');
 const start=s.world.minutes,issuesBefore=entry.interference;
 s.player.mana-=manaSpent;s.player.stamina-=staminaSpent;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.int-10)/2)+
  2*(s.player.skills?.arcana?.rank||0),dc:14+issuesBefore,
  label:'Real spell geometry interference correction'});
 const rollEvent=structuredClone(s.log.at(-1)),recovered=check.success?Math.min(2,issuesBefore):0;
 entry.interference-=recovered;
 const source={origin:REPAIR,id:p.id,minute:start,minutes,
  manaSpent,staminaSpent,roll:check.roll,
  check:structuredClone(check),rollEvent,rollEventHash:H(rollEvent),
  witness:event,witnessHash,issuesBefore,recovered};
 entry.repairs.push({origin:REPAIR,source,seal:H(source)});
 E.advance(s,minutes);W.finalizeTime(s,start);
 if(!verify(s))throw Error('Original spell correction does not match the saved independent experiment');
 return {corrected:check.success,interference:entry.interference,
  check,manaSpent,staminaSpent,minutes,noFreeMagic:true};
}
function status(s){
 const n=s.player?.arcane?.circles||0;
 if(n<3)return {available:false,circles:n,
  note:'This experimental high-circle grammar is implemented atop a verified Third Circle'};
 if(!Higher.verify(s)||!verify(s))
  throw Error('Saved original high Arcane architecture or spell formula evidence changed');
 return {available:true,circles:n,
  formulas:Object.values(s.table?.arcaneFormulas?.items||{}).map(x=>({
   id:x.id,name:x.source.name,complexity:x.source.cost.complexity,
   manaCost:x.source.cost.mana,minimumCircle:x.source.cost.minCircle,
   progress:x.points,needed:x.source.required,proven:x.proven,
   interference:x.interference,
   effectRequiresOriginalAdapter:true})),
  note:'A genuinely tested formula is not an invented damage effect, bypassed enemy defence, generated item, creature command or magical ability before a source-specific action adapter exists'};
}
module.exports={ORIGIN,MAP,WORK,PROBE,REPAIR,
 verify,map,work,probe,repair,status};
