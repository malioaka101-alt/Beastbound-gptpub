'use strict';
// Original Master §26: Formation Mastery needs independent measured MULTI-NODE
// architecture, actual material assembly, phase failure countertests and
// finite physical effects. This is ONE original local rune-stabilising array,
// not a universal formation recipe, auto-granted school or free spell.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),W=require('./world'),U=require('./unified'),
 Combat=require('./combat'),Work=require('./physical-work'),
 Circle=require('./arcane-spark');
const SOURCE='gm-sourced-three-node-sigil-formation-v1',
 WITNESS='gm-witnessed-actual-three-node-formation-layout-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const int=(x,min=0,max=1000000000)=>Number.isInteger(x)&&x>=min&&x<=max;
const prose=x=>typeof x==='string'&&x.trim().length>=25&&x.length<=900;
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{3,65}$/.test(x);
const only=(p,keys)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(x=>keys.includes(x));
const MATERIALS=Object.freeze({ironbloom:2,moss_crystal:1});
const MINUTES=90,STAMINA=4,MANA=3,DC=17,FIELD_MINUTES=120;
function ledger(s){return s.table?.specialistFormations||null;}
function scene(s){
 if(!E.LOCATIONS[s.world?.location]||s.battle||s.encounter||
  s.table?.combatants?.player?.status!=='ok'||
  s.world?.planeId&&s.world.planeId!=='mortal')
  throw Error('An actually safe present mortal location is needed for physical multi-node construction');
 return s.world.location;
}
function observed(s,index){
 if(!int(index,0,(s.log?.length||0)-1))
  throw Error('An independently observed existing three-node source is required');
 const w=s.log[index],d=w?.details;
 if(w?.type!=='story'||!prose(w.text)||
  d?.origin!==WITNESS||d.location!==s.world.location||
  !id(d.formationId)||!Array.isArray(d.nodes)||
  d.nodes.length!==3||d.nodes.some(x=>!prose(x))||
  new Set(d.nodes).size!==3||
  !prose(d.originalNodeGeometry)||
  !prose(d.independentPhaseCountertest)||
  !prose(d.actualSubstrateConduction)||
  !prose(d.measuredRunicFieldInteraction)||
  !prose(d.physicalDisruptionAndEndOfLife)||
  !prose(d.independentBaseline)||
  !prose(d.ownershipAndPlacementRights)||
  !prose(d.energyAndLivingSafetyLimits)||
  d.nodeMaterial!=='ironbloom_moss_crystal'||
  d.measuredCompatibleSigil!=='moss_crystal_ironbloom'||
  d.measuredEffect!=='stabilise_one_local_visible_sigil_activation'||
  d.noForeignRealmLink!==true||
  d.noAutomaticSpell!==true||d.noUnobservedAmplification!==true)
  throw Error('Three distinct observed real nodes, original symbol interaction, independent phase countertest and material rights must be established');
 return structuredClone(w);
}
function validRoll(a){
 const c=a?.check,e=a?.rollEvent;
 return !!(e?.type==='roll'&&a.rollHash===hash(e)&&
  hash(e.details)===hash(c)&&int(a.roll,1,20)&&a.roll===c.roll&&
  c.dc===a.dc&&c.modifier===a.modifier&&
  c.naturalBonus===C.naturalAdjustment(a.roll)&&
  c.total===a.roll+a.modifier+c.naturalBonus&&
  c.margin===c.total-c.dc&&c.success===(c.margin>=0)&&
  c.degree===C.degree(c.margin,true)&&
  c.progress===C.progress(c.degree));
}
function verify(s){
 const l=ledger(s);
 if(!l)return true;
 if(l.origin!==SOURCE||!Array.isArray(l.forms)||
  !Array.isArray(l.uses)||!l.forms.length)return false;
 const forms=new Map(),witnesses=new Set(),identities=new Set();
 let lastForm=-1;
 for(const row of l.forms){
  const a=row?.source,d=a?.witness?.details;
  if(row?.origin!==SOURCE||!a||row.seal!==hash(a)||
   a.origin!==SOURCE||a.kind!=='physical-three-node-formation'||
   !id(a.formationId)||!E.LOCATIONS[a.location]||
   !int(a.minute,lastForm,s.world.minutes)||
   a.minutes!==MINUTES||a.minute+MINUTES>s.world.minutes||
   a.staminaSpent!==STAMINA||a.manaSpent!==MANA||
   !int(a.intScore,1,30)||
   !int(a.craftingRank,0,5)||!int(a.arcanaRank,0,5)||
   a.modifier!==Math.floor((a.intScore-10)/2)+
     2*Math.min(a.craftingRank,a.arcanaRank)||
   a.dc!==DC||!validRoll(a)||a.success!==a.check.success||
   a.wounded!==(a.check.degree==='severe failure')||
   a.opened!==(a.success?a.minute+MINUTES:null)||
   a.expires!==(a.success?a.opened+FIELD_MINUTES:null)||
   !a.materialBefore||!a.materialAfter||
   Object.entries(MATERIALS).some(([k,v])=>
    !int(a.materialBefore[k],v,1000000)||
    a.materialAfter[k]!==a.materialBefore[k]-v)||
   !a.witness||a.witness.type!=='story'||
   a.witnessHash!==hash(a.witness)||
   d?.origin!==WITNESS||d.location!==a.location||
   d.formationId!==a.formationId||
   !Array.isArray(d.nodes)||d.nodes.length!==3||
   d.nodes.some(x=>!prose(x))||new Set(d.nodes).size!==3||
   hash(d.nodes)!==hash(a.nodePositions)||
   !prose(d.originalNodeGeometry)||
   !prose(d.independentPhaseCountertest)||
   !prose(d.actualSubstrateConduction)||
   !prose(d.measuredRunicFieldInteraction)||
   !prose(d.physicalDisruptionAndEndOfLife)||
   !prose(d.independentBaseline)||
   !prose(d.ownershipAndPlacementRights)||
   !prose(d.energyAndLivingSafetyLimits)||
   d.nodeMaterial!=='ironbloom_moss_crystal'||
   d.measuredCompatibleSigil!=='moss_crystal_ironbloom'||
   d.measuredEffect!=='stabilise_one_local_visible_sigil_activation'||
   d.noForeignRealmLink!==true||
   d.noAutomaticSpell!==true||
   d.noUnobservedAmplification!==true||
   !a.workbench||a.workbenchHash!==hash(a.workbench)||
   a.workbench.type!=='research'||
   a.workbench.details?.origin!==SOURCE||
   a.workbench.details?.formationId!==a.formationId||
   a.workbench.details?.sourceWitnessHash!==a.witnessHash||
   a.workbench.details?.location!==a.location||
   hash(a.workbench.details?.materials)!==hash(MATERIALS)||
   witnesses.has(a.witnessHash)||identities.has(a.formationId))
   return false;
  witnesses.add(a.witnessHash);identities.add(a.formationId);
  if(a.success)forms.set(row.seal,a);
  lastForm=a.minute+MINUTES;
 }
 const used=new Set();let lastUse=-1;
 for(const row of l.uses){
  const t=row?.source,formation=forms.get(t?.formationSeal);
  const sigil=(s.table?.specialistSigils?.activations||[])
   .find(x=>x.seal===t?.sigilActivationSeal);
  const action=sigil?.source;
  if(row?.origin!==SOURCE||row.seal!==hash(t)||
   t?.origin!==SOURCE||t.kind!=='consumed-formation-sigil-stabilisation'||
   !formation||used.has(t.formationSeal)||
   !id(t.sigilId)||!int(t.minute,lastUse,s.world.minutes)||
   !int(t.minute,formation.opened,formation.expires-1)||
   t.location!==formation.location||t.bonus!==1||
   !sigil||sigil.origin!=='earned-individual-rune-sigil-inscription-v1'||
   sigil.seal!==hash(action)||
   action.kind!=='physical-sigil-light-activation'||
   action.sigilId!==t.sigilId||
   action.location!==formation.location||
   action.minute!==t.minute||
   action.formationSeal!==t.formationSeal||
   action.formationMitigation!==1||
   action.dc!==11)
   return false;
  used.add(t.formationSeal);lastUse=t.minute;
 }
 return true;
}
function status(s){
 if(!verify(s))throw Error('Original measured formation or actual linked sigil proof is inconsistent');
 const l=ledger(s),used=new Set((l?.uses||[]).map(u=>u.source.formationSeal));
 const now=s.world.minutes;
 return {formed:l?.forms.length||0,
  activeUnspent:(l?.forms||[]).filter(x=>x.source.success&&
   x.source.opened<=now&&x.source.expires>now&&
   x.source.location===s.world.location&&!used.has(x.seal))
   .map(x=>({formationId:x.source.formationId,
    expiresAtWorldMinute:x.source.expires,sourceSeal:x.seal,
    compatibleSubstrate:'moss_crystal_ironbloom',
    physicalEffect:'one later genuine local visible-sigil activation check -1',
    noPortal:true})),
  consumedAssists:l?.uses.length||0,
  note:'Three individually witnessed, physically built nodes; independent geometry, finite field and one genuinely measured runic support, not universal formation power'};
}
function supportProof(s,seal,site,minute){
 if(!verify(s))return false;
 const a=ledger(s)?.forms.find(x=>x.seal===seal)?.source;
 return !!(a?.success&&a.location===site&&
  int(minute,a.opened,a.expires-1));
}
function support(s,object){
 if(!object||object.material!=='moss_crystal_ironbloom'||
  object.location!==s.world.location||!verify(s))
  return {mitigation:0,sourceSeal:null};
 const l=ledger(s),now=s.world.minutes;
 const used=new Set((l?.uses||[]).map(u=>u.source.formationSeal));
 const x=(l?.forms||[]).filter(y=>y.source.success&&
   y.source.location===s.world.location&&
   y.source.opened<=now&&now<y.source.expires&&
   !used.has(y.seal)).at(-1);
 return x?{mitigation:1,sourceSeal:x.seal}:
  {mitigation:0,sourceSeal:null};
}
function consume(s,{formationSeal,sigilActivationSeal,sigilId,minute}={}){
 if(!verify(s)||!supportProof(s,formationSeal,s.world.location,minute))
  throw Error('A proven currently active original formation is required for this specific existing rune');
 const l=ledger(s);
 if(l.uses.some(x=>x.source.formationSeal===formationSeal))
  throw Error('An original finite formation cannot stabilise a second sigil activation');
 const sigil=(s.table?.specialistSigils?.activations||[])
  .find(x=>x.seal===sigilActivationSeal)?.source;
 if(!sigil||sigil.minute!==minute||sigil.sigilId!==sigilId||
  sigil.formationSeal!==formationSeal||
  sigil.formationMitigation!==1)
  throw Error('Only an actually completed independently checked local sigil activation can use original formation support');
 const a={origin:SOURCE,kind:'consumed-formation-sigil-stabilisation',
  formationSeal,sigilActivationSeal,sigilId,minute,
  location:s.world.location,bonus:1};
 l.uses.push({origin:SOURCE,source:a,seal:hash(a)});
 if(!verify(s))
  throw Error('Original finite three-node formation use failed historical integrity');
}
function form(s,p={}){
 if(!only(p,['witnessIndex'])||
  !int(p.witnessIndex,0,(s.log?.length||0)-1))
  throw Error('Only an independent witnessed exact three-node plan can establish this particular physical formation');
 scene(s);
 const w=observed(s,p.witnessIndex);
 Circle.curriculum(s);
 if(!verify(s))throw Error('Previous original formation architecture cannot be verified');
 const l=ledger(s),d=w.details,h=hash(w);
 if(l?.forms.some(x=>x.source.formationId===d.formationId||
   x.source.witnessHash===h))
  throw Error('An established physical formation identity or observed layout cannot be rerolled');
 if(!int(s.player.mana,MANA,100000))
  throw Error('A real original Mana supply is required to excite the measured nodes');
 const intScore=C.int(s.player.attributes.int,'earned Intelligence',1,30),
  crafting=C.int(s.player.skills.crafting.rank,'existing Crafting',0,5),
  arcana=C.int(s.player.skills.arcana.rank,'existing Arcana',0,5),
  modifier=Math.floor((intScore-10)/2)+2*Math.min(crafting,arcana);
 const before=Object.fromEntries(Object.keys(MATERIALS).map(k=>
  [k,s.player.inventory?.[k]||0]));
 const after=Object.fromEntries(Object.entries(MATERIALS).map(([k,v])=>
  [k,before[k]-v]));
 const job=Work.plan(s,{inputs:MATERIALS,minutes:MINUTES,
  stamina:STAMINA,modifier,dc:DC,
  label:'Construct independently surveyed physical three-node Arcane formation',
  event:{type:'research',text:'An authentic measured three-node formation is physically assembled from separately owned minerals on the present terrain.',details:{
   origin:SOURCE,formationId:d.formationId,
   location:s.world.location,sourceWitnessHash:h,materials:{...MATERIALS}}}});
 // The saved energy is spent IN the real construction, not created later
 // by successful narration. The source-work executor owns its one d20.
 s.player.mana-=MANA;
 const executed=Work.perform(s,job),check=executed.check;
 const a={origin:SOURCE,kind:'physical-three-node-formation',
  formationId:d.formationId,location:s.world.location,
  nodePositions:structuredClone(d.nodes),
  minute:executed.startedAtMinute,minutes:MINUTES,
  staminaSpent:STAMINA,manaSpent:MANA,dc:DC,modifier,
  intScore,craftingRank:crafting,arcanaRank:arcana,
  materialBefore:before,materialAfter:after,
  check:structuredClone(check),roll:check.roll,
  rollEvent:executed.originalRoll,rollHash:executed.rollHash,
  success:check.success,wounded:check.degree==='severe failure',
  opened:check.success?executed.startedAtMinute+MINUTES:null,
  expires:check.success?executed.startedAtMinute+MINUTES+FIELD_MINUTES:null,
  witness:w,witnessHash:h,workbench:executed.originalWorkbench,
  workbenchHash:executed.witnessHash};
 if(a.wounded){
  Combat.harm(s,Combat.get(s,'player'),2);
  U.sync(s,{source:'wounds'});
 }
 const receipt={origin:SOURCE,source:a,seal:hash(a)};
 const record=l||{origin:SOURCE,forms:[],uses:[]};
 record.forms.push(receipt);
 s.table.specialistFormations=record;
 if(!verify(s))throw Error('Original actual three-node formation source did not reconcile after construction');
 return {attempted:true,formed:check.success,check,
  formationId:d.formationId,materialsSpent:{...MATERIALS},
  staminaSpent:STAMINA,manaSpent:MANA,elapsedMinutes:MINUTES,
  observedNodes:3,
  activeUntil:a.expires,
  oneOriginalLaterSigilCheckAid:check.success?1:0,
  noFreeSigils:true,noPortal:true,noRankGranted:true};
}
module.exports={SOURCE,WITNESS,MATERIALS,status,verify,supportProof,support,consume,form};
