'use strict';
// Master §26 Runes and Sigils: a FIRST source-attested physical inscription,
// not a free spell, fixed magical menu or substitute for a genuine material
// object. This observed two-layer example makes a bounded local visible
// light signal. New runes need their own witnessed symbol physics and effects.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),W=require('./world'),U=require('./unified'),
 Combat=require('./combat'),Work=require('./physical-work'),
 Circle=require('./arcane-spark');
const SOURCE='earned-individual-rune-sigil-inscription-v1',
 OBS='gm-observed-original-layered-resonance-sigil-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const int=(x,low=0,high=100000000)=>Number.isInteger(x)&&x>=low&&x<=high;
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{3,65}$/.test(x);
const prose=(x,min=25)=>typeof x==='string'&&x.trim().length>=min&&x.trim().length<=900;
const only=(p,k)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(n=>k.includes(n));
const MATERIALS=Object.freeze({moss_crystal:1,ironbloom:1}),
 BUILD_MINUTES=60,BUILD_STAMINA=3,BUILD_DC=15,
 MAX_ACTIVATIONS=3,ACTIVATE_MINUTES=5,ACTIVATE_MANA=1,
 ACTIVATE_STAMINA=1,ACTIVATE_DC=12,LIGHT_MINUTES=10;
function ledger(s){return s.table?.specialistSigils||null;}
function safe(s){
 const location=s.world?.location;
 if(!E.LOCATIONS[location]||s.battle||s.encounter||
  s.world?.planeId&&s.world.planeId!=='mortal'||
  s.table?.combatants?.player?.status!=='ok')
  throw Error('Inscription needs a genuinely accessible safe physical workbench and human presence');
 return location;
}
function source(s,index){
 if(!int(index,0,(s.log?.length||0)-1))
  throw Error('A genuinely observed original symbol and substrate trial is required');
 const event=s.log[index],d=event?.details;
 if(event?.type!=='story'||!prose(event.text,18)||
  d?.origin!==OBS||d.location!==s.world.location||
  !id(d.sigilId)||!prose(d.originalSymbolVocabulary)||
  !prose(d.firstBindingLayer)||!prose(d.secondActivationLayer)||
  !prose(d.substrateCompatibility)||
  !prose(d.measuredPhysicalEmission)||
  !prose(d.independentFailedLayerCountertest)||
  !prose(d.activationAndDischargeLogic)||
  !prose(d.materialProvenanceAndRights)||
  !prose(d.heatAndStabilityLimits)||
  d.substrate!=='moss_crystal_ironbloom'||
  d.effect!=='short_local_visible_light'||
  d.oneLocalInscribedObject!==true||
  d.noRemoteSensing!==true||d.noUnlearnedSpell!==true||
  d.noFreeEnergy!==true)
  throw Error('Real observed layered symbolic vocabulary, mineral compatibility, independent failure response and bounded visible activation are required');
 return structuredClone(event);
}
function rollValid(a){
 const e=a?.rollEvent,c=a?.check;
 return !!(c&&e?.type==='roll'&&a.rollHash===hash(e)&&
  hash(e.details)===hash(c)&&int(a.roll,1,20)&&
  a.roll===c.roll&&a.dc===c.dc&&a.modifier===c.modifier&&
  c.naturalBonus===C.naturalAdjustment(a.roll)&&
  c.total===a.roll+c.modifier+c.naturalBonus&&
  c.margin===c.total-c.dc&&c.success===(c.margin>=0)&&
  c.degree===C.degree(c.margin,true)&&
  c.progress===C.progress(c.degree));
}
function verify(s){
 const l=ledger(s);
 if(!l)return true;
 if(l.origin!==SOURCE||!Array.isArray(l.inscriptions)||
  !Array.isArray(l.activations)||!l.inscriptions.length||
  !l.objects||typeof l.objects!=='object'||Array.isArray(l.objects))
  return false;
 const objects={},used=new Set(),watch=new Set();
 let previous=-1;
 for(const row of l.inscriptions){
  const a=row?.source,d=a?.witness?.details;
  if(row?.origin!==SOURCE||!a||row.seal!==hash(a)||
   a.origin!==SOURCE||a.kind!=='two-layer-physical-rune-inscription'||
   !id(a.sigilId)||!E.LOCATIONS[a.location]||
   !int(a.minute,previous,s.world.minutes)||
   a.minutes!==BUILD_MINUTES||
   a.minute+BUILD_MINUTES>s.world.minutes||
   a.staminaSpent!==BUILD_STAMINA||
   a.dc!==BUILD_DC||
   !int(a.intScore,1,30)||!int(a.craftingRank,0,5)||
   !int(a.arcanaRank,0,5)||
   a.modifier!==Math.floor((a.intScore-10)/2)+
    2*Math.min(a.craftingRank,a.arcanaRank)||
   !rollValid(a)||a.success!==a.check.success||
   a.wounded!==(a.check.degree==='severe failure')||
   !a.workbench||a.workbenchHash!==hash(a.workbench)||
   a.workbench.type!=='research'||
   a.workbench.details?.origin!==SOURCE||
   a.workbench.details?.sigilId!==a.sigilId||
   a.workbench.details?.location!==a.location||
   a.workbench.details?.observedSourceHash!==a.witnessHash||
   hash(a.workbench.details?.materials)!==hash(MATERIALS)||
   !a.materialBefore||!a.materialAfter||
   Object.entries(MATERIALS).some(([k,v])=>
    !int(a.materialBefore[k],v,1000000)||
    a.materialAfter[k]!==a.materialBefore[k]-v)||
   !a.witness||a.witness.type!=='story'||
   a.witnessHash!==hash(a.witness)||
   d?.origin!==OBS||d.location!==a.location||
   d.sigilId!==a.sigilId||
   !prose(d.originalSymbolVocabulary)||
   !prose(d.firstBindingLayer)||!prose(d.secondActivationLayer)||
   !prose(d.substrateCompatibility)||!prose(d.measuredPhysicalEmission)||
   !prose(d.independentFailedLayerCountertest)||
   !prose(d.activationAndDischargeLogic)||
   !prose(d.materialProvenanceAndRights)||
   !prose(d.heatAndStabilityLimits)||
   d.substrate!=='moss_crystal_ironbloom'||
   d.effect!=='short_local_visible_light'||
   d.oneLocalInscribedObject!==true||
   d.noRemoteSensing!==true||d.noUnlearnedSpell!==true||
   d.noFreeEnergy!==true||
   used.has(a.sigilId)||watch.has(a.witnessHash))
   return false;
  used.add(a.sigilId);watch.add(a.witnessHash);
  if(a.success){
   objects[a.sigilId]={origin:SOURCE,id:a.sigilId,
    location:a.location,seal:row.seal,
    formedMinute:a.minute+BUILD_MINUTES,
    effect:'short_local_visible_light',usedActivations:0,
    lastEmissionUntil:null,material:'moss_crystal_ironbloom'};
  }
  previous=a.minute+BUILD_MINUTES;
 }
 previous=-1;
 for(const row of l.activations){
  const a=row?.source,obj=objects[a?.sigilId];
  if(row?.origin!==SOURCE||!a||row.seal!==hash(a)||
   a.origin!==SOURCE||a.kind!=='physical-sigil-light-activation'||
   !obj||a.location!==obj.location||
   !int(a.minute,Math.max(previous,obj.formedMinute),s.world.minutes)||
   a.minutes!==ACTIVATE_MINUTES||
   a.minute+ACTIVATE_MINUTES>s.world.minutes||
   a.staminaSpent!==ACTIVATE_STAMINA||
   a.manaSpent!==ACTIVATE_MANA||
   a.dc!==ACTIVATE_DC-(a.formationMitigation||0)||
   ![0,1].includes(a.formationMitigation||0)||
   (a.formationMitigation===1&&(
    !a.formationSeal||
    !require('./specialist-formation-mastery').supportProof(
     s,a.formationSeal,a.location,a.minute)))||
   (a.formationMitigation!==1&&a.formationSeal!=null)||
   !int(a.intScore,1,30)||!int(a.arcanaRank,0,5)||
   a.modifier!==Math.floor((a.intScore-10)/2)+2*a.arcanaRank||
   a.activationBefore!==obj.usedActivations||
   !int(a.activationBefore,0,MAX_ACTIVATIONS-1)||
   a.activationAfter!==a.activationBefore+1||
   !rollValid(a)||a.success!==a.check.success||
   a.emissionUntil!==(a.success?
     a.minute+ACTIVATE_MINUTES+LIGHT_MINUTES:null))
   return false;
  obj.usedActivations++;
  if(a.success)obj.lastEmissionUntil=a.emissionUntil;
  previous=a.minute+ACTIVATE_MINUTES;
 }
 return hash(objects)===hash(l.objects);
}
function status(s){
 if(!verify(s))throw Error('Physical runic source or actual mineral object integrity failed');
 const now=s.world.minutes;
 return {runicArtefacts:Object.values(ledger(s)?.objects||{}).map(o=>({
  id:o.id,location:o.location,
  activationsRemaining:MAX_ACTIVATIONS-o.usedActivations,
  physicallyPresent:s.world.location===o.location,
  currentlyEmittingVisibleLight:o.lastEmissionUntil!==null&&
    o.lastEmissionUntil>now,
  emissionUntilWorldMinute:o.lastEmissionUntil,
  effect:o.effect,noRemoteSensing:true
 })),
 note:'Only genuinely constructed material sigils from observed individual symbol vocabulary, layered inscription and activation conditions; no universal runes or learned spells granted'};
}
function inscribe(s,p={}){
 if(!only(p,['witnessIndex'])||
  !int(p.witnessIndex,0,(s.log?.length||0)-1))
  throw Error('Only an originally witnessed actual runic material/inscription experiment can be constructed');
 safe(s);
 const witness=source(s,p.witnessIndex);
 if(!verify(s))throw Error('Prior original inscribed artefacts cannot be reconciled');
 // This particular independently observed two-layer resonance grammar
 // uses an existing Mana Core. Other original sigil energy routes can be
 // supported by future source-specific adapters, not a universal ban.
 Circle.curriculum(s);
 const d=witness.details,l=ledger(s),h=hash(witness);
 if(l?.inscriptions.some(x=>x.source.sigilId===d.sigilId||
  x.source.witnessHash===h))
  throw Error('The original physical sigil identity and observed construction cannot be rerolled');
 const crafting=C.int(s.player.skills.crafting.rank,'earned physical Crafting',0,5),
  arcana=C.int(s.player.skills.arcana.rank,'earned rune energy interpretation',0,5),
  intellect=C.int(s.player.attributes.int,'original Intelligence',1,30),
  modifier=Math.floor((intellect-10)/2)+2*Math.min(crafting,arcana),
  before=Object.fromEntries(Object.keys(MATERIALS).map(k=>
    [k,s.player.inventory?.[k]||0])),
  after=Object.fromEntries(Object.entries(MATERIALS).map(([k,v])=>
    [k,before[k]-v]));
 const job=Work.plan(s,{inputs:MATERIALS,minutes:BUILD_MINUTES,
  stamina:BUILD_STAMINA,modifier,dc:BUILD_DC,
  label:'Construct a genuinely witnessed layered mineral light sigil',
  event:{type:'research',
   text:'The physically measured runic inscription is formed on its original binding substrate by actual skilled work.',
   details:{origin:SOURCE,sigilId:d.sigilId,location:s.world.location,
    observedSourceHash:h,materials:{...MATERIALS}}}});
 const executed=Work.perform(s,job),
  check=executed.check,
  a={origin:SOURCE,kind:'two-layer-physical-rune-inscription',
   sigilId:d.sigilId,location:s.world.location,
   minute:executed.startedAtMinute,minutes:BUILD_MINUTES,
   staminaSpent:BUILD_STAMINA,dc:BUILD_DC,modifier,
   intScore:intellect,craftingRank:crafting,arcanaRank:arcana,
   materialBefore:before,materialAfter:after,
   check:structuredClone(check),
   roll:check.roll,rollEvent:executed.originalRoll,
   rollHash:executed.rollHash,success:check.success,
   wounded:check.degree==='severe failure',
   witness,witnessHash:h,
   workbench:executed.originalWorkbench,
   workbenchHash:executed.witnessHash};
 if(a.wounded){
  Combat.harm(s,Combat.get(s,'player'),2);
  U.sync(s,{source:'wounds'});
 }
 const receipt={origin:SOURCE,source:a,seal:hash(a)},
  record=l||{origin:SOURCE,inscriptions:[],activations:[],objects:{}};
 record.inscriptions.push(receipt);
 if(a.success){
  record.objects[a.sigilId]={
   origin:SOURCE,id:a.sigilId,location:a.location,seal:receipt.seal,
   formedMinute:a.minute+BUILD_MINUTES,
   effect:'short_local_visible_light',usedActivations:0,
   lastEmissionUntil:null,material:'moss_crystal_ironbloom'};
 }
 s.table.specialistSigils=record;
 if(!verify(s))throw Error('Actual original mineral rune construction receipt failed source integrity');
 return {attempted:true,constructed:check.success,check,
  sigilId:a.sigilId,materialsSpent:{...MATERIALS},
  staminaSpent:BUILD_STAMINA,minutes:BUILD_MINUTES,
  originalPhysicalLightSignalOnly:true,
  noFreeSpell:true,noPowerRank:true,noRemoteKnowledge:true};
}
function activate(s,p={}){
 if(!only(p,['sigilId'])||!id(p.sigilId))
  throw Error('Only a verified pre-existing original inscribed sigil ID may be activated');
 safe(s);
 if(!verify(s))throw Error('The physical runic object has lost its original source');
 const object=ledger(s)?.objects?.[p.sigilId],now=s.world.minutes;
 if(!object||object.location!==s.world.location||
  object.usedActivations>=MAX_ACTIVATIONS)
  throw Error('The actually inscribed finite sigil must be physically present with unused mineral activations');
 Circle.curriculum(s);
 if(s.player.mana<ACTIVATE_MANA||
  s.player.stamina<ACTIVATE_STAMINA||
  s.table.combatants.player.stamina<ACTIVATE_STAMINA)
  throw Error('Actual current Mana and living Stamina are required for this physically observed sigil activation');
 // Genuine historical formation aid adjusts THIS original activation only.
 // A measured array never makes another spell, charge, Mana or free roll.
 const field=require('./specialist-formation-mastery').support(s,object);
 const dc=ACTIVATE_DC-field.mitigation;
 const intScore=C.int(s.player.attributes.int,'actual original Intelligence',1,30),
  rank=C.int(s.player.skills.arcana.rank,'earned Arcana energy control',0,5),
  modifier=Math.floor((intScore-10)/2)+2*rank,
  check=C.check(s,{modifier,dc,
   label:'Activate an original visible-light layered mineral sigil'}),
  rollEvent=structuredClone(s.log.at(-1));
 s.player.mana-=ACTIVATE_MANA;
 s.player.stamina-=ACTIVATE_STAMINA;
 s.table.combatants.player.stamina=s.player.stamina;
 const a={origin:SOURCE,kind:'physical-sigil-light-activation',
  sigilId:object.id,location:object.location,
  minute:now,minutes:ACTIVATE_MINUTES,
  staminaSpent:ACTIVATE_STAMINA,manaSpent:ACTIVATE_MANA,
  intScore,arcanaRank:rank,modifier,dc,
  formationMitigation:field.mitigation,formationSeal:field.sourceSeal,
  roll:check.roll,check:structuredClone(check),
  rollEvent,rollHash:hash(rollEvent),success:check.success,
  activationBefore:object.usedActivations,
  activationAfter:object.usedActivations+1,
  emissionUntil:check.success?now+ACTIVATE_MINUTES+LIGHT_MINUTES:null};
 const receipt={origin:SOURCE,source:a,seal:hash(a)};
 object.usedActivations++;
 if(a.success)object.lastEmissionUntil=a.emissionUntil;
 ledger(s).activations.push(receipt);
 if(field.sourceSeal)require('./specialist-formation-mastery').consume(s,{
  formationSeal:field.sourceSeal,sigilActivationSeal:receipt.seal,
  sigilId:object.id,minute:now});
 E.advance(s,ACTIVATE_MINUTES);W.finalizeTime(s,now);
 U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('An original light-emitting sigil must preserve its consumed Mana, symbol proof and material identity');
 return {attempted:true,emittedVisibleLight:check.success,check,
  sigilId:object.id,
  emissionUntilWorldMinute:a.emissionUntil,
  activationsRemaining:MAX_ACTIVATIONS-object.usedActivations,
  manaSpent:ACTIVATE_MANA,staminaSpent:ACTIVATE_STAMINA,
  minutes:ACTIVATE_MINUTES,
  originalPhysicalFormationSupport:field.mitigation,
  consumedFormationSeal:field.sourceSeal,
  physicalLocalSignal:true,noRemoteInformation:true,
  noAdditionalSpellLearned:true};
}
module.exports={SOURCE,OBS,MATERIALS,verify,status,inscribe,activate};
