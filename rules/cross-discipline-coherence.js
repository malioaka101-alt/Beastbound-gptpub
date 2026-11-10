'use strict';
// Original Master §§19,26,29. Real independently observed Meridian + Arcane
// energy overlap. This first experiment proves an individual's temporary
// Qi-to-Mana distribution pattern; it does NOT convert Qi to free Mana,
// impart a spell, upgrade a stage or create an all-purpose hybrid bonus.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),W=require('./world'),
 U=require('./unified'),Combat=require('./combat'),
 FirstGate=require('./meridian-qi-strike'),
 FirstCircle=require('./arcane-spark');
const SOURCE='actual-original-meridian-arcane-coherence-v1';
const OBS='gm-witnessed-individual-qi-mana-interference-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const int=(x,lo=0,hi=100000000)=>Number.isInteger(x)&&x>=lo&&x<=hi;
const prose=x=>typeof x==='string'&&x.trim().length>=25&&x.trim().length<=900;
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{3,65}$/.test(x);
const only=(p,k)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(x=>k.includes(x));
const QI=3,MANA=3,STA=2,MINUTES=30;
const EFFECT_MINUTES=60;
const MODES=Object.freeze(['coherent','interfering','unsafe']);
function proven(s){
 const gate=FirstGate.gate(s);
 FirstCircle.curriculum(s);
 const m=s.player.meridian,a=s.player.arcane;
 if(!gate?.record||!int(a.coreStability,1,100)||
  !int(s.player.skills.cultivation.rank,0,5)||
  !int(s.player.skills.arcana.rank,0,5))
  throw Error('Original independent Meridian and Arcane structures need genuine source records');
 return {gateQuality:gate.opened.quality,
  gateNumber:gate.opened.number,geometry:a.geometry,
  coreStability:a.coreStability};
}
function scene(s){
 if(s.battle||s.encounter||
  s.table?.combatants?.player?.status!=='ok'||
  s.world?.planeId&&s.world.planeId!=='mortal')
  throw Error('A real safe bodily scene in the actual mortal location is required');
 const place=require('../world/lived-places').location(s);
 if(!place||!prose(place.description))
  throw Error('The individual measured experiment needs an original physical place');
}
function witness(s,p={}){
 if(!only(p,['witnessIndex'])||
  !int(p.witnessIndex,0,(s.log?.length||0)-1))
  throw Error('Only one original independently witnessed human Qi–Mana interference experiment may be selected');
 const e=s.log[p.witnessIndex],d=e?.details;
 const proof=proven(s);
 if(e?.type!=='story'||!prose(e.text)||
  d?.origin!==OBS||d.location!==s.world.location||
  !id(d.interfaceId)||
  d.firstGateNumber!==proof.gateNumber||
  d.measuredCircleGeometry!==proof.geometry||
  !MODES.includes(d.observedMode)||
  !prose(d.existingMeridianRoute)||
  !prose(d.existingManaCorePath)||
  !prose(d.independentBaseline)||
  !prose(d.interferenceCountertest)||
  !prose(d.metabolicAndEnergyCost)||
  !prose(d.heatAndTissueLimits)||
  !prose(d.safetyAndRecovery)||
  d.noFreeEnergy!==true||d.noUnlearnedSpell!==true||
  d.noAutomaticTierGain!==true)
  throw Error('An independently witnessed existing gate, Circle, energetic cross-test, personal observed interference and realistic limits are required');
 return {event:structuredClone(e),proof};
}
function check(a){
 const c=a.check,e=a.rollEvent;
 return !!(c&&e?.type==='roll'&&a.rollHash===hash(e)&&
  hash(e.details)===hash(c)&&int(a.roll,1,20)&&
  a.roll===c.roll&&c.dc===a.dc&&c.modifier===a.modifier&&
  c.naturalBonus===C.naturalAdjustment(a.roll)&&
  c.total===a.roll+a.modifier+c.naturalBonus&&
  c.margin===c.total-c.dc&&c.success===(c.margin>=0)&&
  c.degree===C.degree(c.margin,true)&&
  c.progress===C.progress(c.degree));
}
function verify(s){
 const l=s.table?.crossDiscipline?.qiMana;
 if(!l)return true;
 if(l.origin!==SOURCE||!Array.isArray(l.trials)||
  !int(l.strain,0,100)||!l.trials.length)return false;
 let strain=0,last=-1;const used=new Set();
 for(const r of l.trials){
  const a=r?.source,d=a?.witness?.details;
  if(r?.origin!==SOURCE||!a||r.seal!==hash(a)||
   a.origin!==SOURCE||a.kind!=='human-qi-mana-coupling'||
   !id(a.interfaceId)||a.location!==d?.location||
   !int(a.minute,last,s.world.minutes)||
   a.elapsedMinutes!==MINUTES||
   a.minute+MINUTES>s.world.minutes||
   a.qiSpent!==QI||a.manaSpent!==MANA||
   a.staminaSpent!==STA||
   !int(a.gateNumber,1,108)||!prose(a.circleGeometry)||
   !['Sound','Perfect','Flawed'].includes(a.gateQuality)||
   !int(a.coreStabilityAtTrial,1,100)||
   !MODES.includes(a.observedMode)||
   !int(a.cultivationSkill,0,5)||!int(a.arcanaSkill,0,5)||
   !int(a.wisdomScore,1,30)||!int(a.intelligenceScore,1,30)||
   a.modifier!==Math.floor((Math.min(a.wisdomScore,a.intelligenceScore)-10)/2)+
    2*Math.min(a.cultivationSkill,a.arcanaSkill)||
   a.riskAdjustment!==(a.gateQuality==='Flawed'?3:0)-
    0+(a.coreStabilityAtTrial<60?3:0)+
    (a.observedMode==='interfering'?2:
     a.observedMode==='unsafe'?4:0)||
   a.dc!==15+a.riskAdjustment+Math.floor(strain/8)||
   !check(a)||a.success!==a.check.success||
   a.strainBefore!==strain||
   a.strainAdded!==(a.success?0:
    a.check.degree==='severe failure'?6:3)||
   a.strainAfter!==Math.min(100,strain+a.strainAdded)||
   a.wounded!==(a.check.degree==='severe failure')||
   a.fieldEmerged!==(a.success&&a.observedMode==='coherent')||
   a.activeUntil!==(a.fieldEmerged?a.minute+MINUTES+EFFECT_MINUTES:null)||
   !a.witness||a.witness.type!=='story'||
   a.witnessHash!==hash(a.witness)||
   d?.origin!==OBS||d.location!==a.location||
   d.interfaceId!==a.interfaceId||
   d.firstGateNumber!==a.gateNumber||
   d.measuredCircleGeometry!==a.circleGeometry||
   d.observedMode!==a.observedMode||
   !prose(d.existingMeridianRoute)||
   !prose(d.existingManaCorePath)||
   !prose(d.independentBaseline)||
   !prose(d.interferenceCountertest)||
   !prose(d.metabolicAndEnergyCost)||
   !prose(d.heatAndTissueLimits)||
   !prose(d.safetyAndRecovery)||
   d.noFreeEnergy!==true||d.noUnlearnedSpell!==true||
   d.noAutomaticTierGain!==true||
   used.has(a.witnessHash))
   return false;
  used.add(a.witnessHash);strain=a.strainAfter;
  last=a.minute+MINUTES;
 }
 return strain===l.strain;
}
function status(s){
 if(!verify(s))throw Error('Original Qi–Mana intersystem evidence has lost source integrity');
 const l=s.table?.crossDiscipline?.qiMana,now=s.world.minutes;
 return {tested:!!l,trialCount:l?.trials.length||0,
  strain:l?.strain||0,
  currentlyObservedCoherentFields:(l?.trials||[]).filter(r=>
   r.source.fieldEmerged&&r.source.activeUntil>now).map(r=>({
    interfaceId:r.source.interfaceId,untilWorldMinute:r.source.activeUntil,
    observedMode:r.source.observedMode,
    sourceSeal:r.seal,
    noAutomaticBonus:true})),
  noFreeMana:true,noUnlearnedSpell:true,
  note:'This source-grounded first experiment measures actual Meridian and Arcane overlap. A physical field is not automatically a castable technique: new effects need their own independently verified adapter'};
}
function experiment(s,p={}){
 scene(s);
 const {event,proof}=witness(s,p);
 if(!verify(s))throw Error('The saved original source-specific Qi–Mana trials are inconsistent');
 const l=s.table?.crossDiscipline?.qiMana;
 const h=hash(event),d=event.details;
 if(l?.trials.some(t=>t.source.witnessHash===h))
  throw Error('The same physically witnessed Meridian–Arcane coupling cannot be rerolled');
 if((l?.strain||0)>=20)
  throw Error('Actual unresolved combined-circulation strain requires bodily recovery');
 if(s.player.qi<QI||s.player.mana<MANA||
  s.player.stamina<STA||s.table.combatants.player.stamina<STA)
  throw Error('Real Qi, Mana and human Stamina must support this measured experiment');
 const cul=C.int(s.player.skills.cultivation.rank,'original Cultivation skill',0,5),
  arc=C.int(s.player.skills.arcana.rank,'original Arcana skill',0,5),
  wis=C.int(s.player.attributes.wis,'existing Wisdom',1,30),
  intelligence=C.int(s.player.attributes.int,'existing Intelligence',1,30),
  modifier=Math.floor((Math.min(wis,intelligence)-10)/2)+2*Math.min(cul,arc),
  risk=(proof.gateQuality==='Flawed'?3:0)+
   (proof.coreStability<60?3:0)+
   (d.observedMode==='interfering'?2:d.observedMode==='unsafe'?4:0),
  dc=15+risk+Math.floor((l?.strain||0)/8),
  minute=s.world.minutes;
 const rolled=C.check(s,{modifier,dc,label:'Source-measured human Meridian–Arcane interference'});
 const rollEvent=structuredClone(s.log.at(-1)),
  strainAdded=rolled.success?0:
   rolled.degree==='severe failure'?6:3;
 if(rolled.degree==='severe failure'){
  Combat.harm(s,Combat.get(s,'player'),2);
  U.sync(s,{source:'wounds'});
 }
 s.player.qi-=QI;s.player.mana-=MANA;
 s.player.stamina-=STA;s.table.combatants.player.stamina=s.player.stamina;
 const fieldEmerged=rolled.success&&d.observedMode==='coherent';
 const a={origin:SOURCE,kind:'human-qi-mana-coupling',
  interfaceId:d.interfaceId,location:s.world.location,
  minute,elapsedMinutes:MINUTES,
  gateNumber:proof.gateNumber,gateQuality:proof.gateQuality,
  circleGeometry:proof.geometry,coreStabilityAtTrial:proof.coreStability,
  observedMode:d.observedMode,cultivationSkill:cul,arcanaSkill:arc,
  wisdomScore:wis,intelligenceScore:intelligence,modifier,dc,riskAdjustment:risk,
  qiSpent:QI,manaSpent:MANA,staminaSpent:STA,
  roll:rolled.roll,check:structuredClone(rolled),
  rollEvent,rollHash:hash(rollEvent),success:rolled.success,
  strainBefore:l?.strain||0,strainAdded,
  strainAfter:Math.min(100,(l?.strain||0)+strainAdded),
  wounded:rolled.degree==='severe failure',fieldEmerged,
  activeUntil:fieldEmerged?minute+MINUTES+EFFECT_MINUTES:null,
  witness:event,witnessHash:h};
 const receipt={origin:SOURCE,source:a,seal:hash(a)};
 s.table.crossDiscipline||={};
 const record=l||{origin:SOURCE,trials:[],strain:0};
 record.trials.push(receipt);record.strain=a.strainAfter;
 s.table.crossDiscipline.qiMana=record;
 E.advance(s,MINUTES);W.finalizeTime(s,minute);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('An original Meridian–Arcane coupling receipt no longer reconciles with the actual trial');
 return {attempted:true,success:rolled.success,check:rolled,
  observedInterference:d.observedMode,physicalCoherence:fieldEmerged,
  activeUntil:a.activeUntil,qiSpent:QI,manaSpent:MANA,
  staminaSpent:STA,elapsedMinutes:MINUTES,strainAdded,
  noFreeSpell:true,noRankGain:true,noAutomaticCombatBonus:true};
}
module.exports={SOURCE,OBS,verify,status,experiment};
