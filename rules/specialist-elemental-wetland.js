'use strict';
// Master §26 Elemental Ascendancy: first true independently measured water-
// environment physiological attunement, not an instant elemental body,
// universal rank, weather control, free Qi or travel across water.
// Individual source-witnessed marsh exposure + existing first Meridian Gate
// can improve ONLY an authentic subsequent local fen shelter assessment.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),W=require('./world'),U=require('./unified'),
 Combat=require('./combat'),Gate=require('./meridian-qi-strike');
const SOURCE='individually-observed-wetland-elemental-attunement-v1',
 WITNESS='gm-witnessed-physical-wetland-water-adaptation-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const int=(x,min=0,max=100000000)=>Number.isInteger(x)&&x>=min&&x<=max;
const prose=x=>typeof x==='string'&&x.trim().length>=25&&x.trim().length<=900;
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{3,65}$/.test(x);
const only=(p,keys)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(k=>keys.includes(k));
const QI=2,STAMINA=3,MINUTES=60,BASE_DC=17;
function ledger(s){return s.table?.specialistWetlandAttunement||null;}
function weatherRisk(weather){
 return /storm|gale|flood|downpour|blizzard|whiteout/i.test(weather)?3:
  /rain|mist|fog|sleet/i.test(weather)?1:0;
}
function observed(s,index,gate){
 if(!int(index,0,(s.log?.length||0)-1))
  throw Error('An actual independent bodily wetland exposure observation is required');
 const e=s.log[index],d=e?.details;
 if(e?.type!=='story'||!prose(e.text)||
  d?.origin!==WITNESS||d.location!=='fen'||
  !id(d.exposureId)||d.elementalEnvironment!=='wetland_water_humidity'||
  d.firstGateNumber!==gate.opened.number||
  d.measuredWeather!==String(s.world.weather||'Fair').slice(0,120)||
  !prose(d.realSourceWaterAndHabitat)||
  !prose(d.originalHumanFluidAndTissueResponse)||
  !prose(d.existingQiWaterRegulationRoute)||
  !prose(d.independentUnaidedSurvivalBaseline)||
  !prose(d.independentOpposingOsmoticCountertest)||
  !prose(d.oxygenAndMetabolicConstraints)||
  !prose(d.warmthAndRecoveryMethods)||
  !prose(d.habitatAndEcologicalRights)||
  d.selfConsentedExposure!==true||
  d.noElementalTransformationClaim!==true||
  d.noWeatherControl!==true||d.noOtherRealmImmunity!==true)
  throw Error('A genuine original local water/humidity source, living human fluid response, independent adverse osmotic test, ecology and energy boundaries are required');
 return structuredClone(e);
}
function validRoll(a){
 const c=a?.check,e=a?.rollEvent;
 return !!(c&&e?.type==='roll'&&a.rollHash===hash(e)&&
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
 if(l.origin!==SOURCE||!Array.isArray(l.trials)||
  !l.trials.length||!int(l.strain,0,100)||
  l.earned!==!!l.secondSuccessSeal)return false;
 let last=-1,strain=0,successes=0,second=null;
 const ids=new Set(),witnesses=new Set();
 let originalGate;
 try{originalGate=Gate.gate(s)}catch{return false}
 for(const row of l.trials){
  const a=row?.source,d=a?.witness?.details;
  if(row?.origin!==SOURCE||!a||row.seal!==hash(a)||
   a.origin!==SOURCE||a.kind!=='personally-measured-wetland-water-exposure'||
   a.location!=='fen'||!id(a.exposureId)||
   !int(a.minute,last,s.world.minutes)||
   a.minutes!==MINUTES||a.minute+MINUTES>s.world.minutes||
   a.qiSpent!==QI||a.staminaSpent!==STAMINA||
   a.gateNumber!==originalGate.opened.number||
   a.gateQuality!==originalGate.opened.quality||
   a.gateRecordHash!==hash(originalGate.record)||
   !int(a.wisdomScore,1,30)||!int(a.cultivationRank,0,5)||
   !int(a.survivalRank,0,5)||
   a.modifier!==Math.floor((a.wisdomScore-10)/2)+
    2*Math.min(a.cultivationRank,a.survivalRank)||
   a.weatherRisk!==weatherRisk(a.weather)||
   a.dc!==BASE_DC+a.weatherRisk+Math.floor(strain/8)||
   !validRoll(a)||a.success!==a.check.success||
   a.strainBefore!==strain||
   a.strainAdded!==(a.check.degree==='severe failure'?5:
    a.success?0:2)||
   a.strainAfter!==Math.min(100,strain+a.strainAdded)||
   a.wounded!==(a.check.degree==='severe failure')||
   !a.witness||a.witness.type!=='story'||
   a.witnessHash!==hash(a.witness)||
   d?.origin!==WITNESS||d.location!==a.location||
   d.exposureId!==a.exposureId||
   d.elementalEnvironment!=='wetland_water_humidity'||
   d.firstGateNumber!==a.gateNumber||
   d.measuredWeather!==a.weather||
   !prose(d.realSourceWaterAndHabitat)||
   !prose(d.originalHumanFluidAndTissueResponse)||
   !prose(d.existingQiWaterRegulationRoute)||
   !prose(d.independentUnaidedSurvivalBaseline)||
   !prose(d.independentOpposingOsmoticCountertest)||
   !prose(d.oxygenAndMetabolicConstraints)||
   !prose(d.warmthAndRecoveryMethods)||
   !prose(d.habitatAndEcologicalRights)||
   d.selfConsentedExposure!==true||
   d.noElementalTransformationClaim!==true||
   d.noWeatherControl!==true||
   d.noOtherRealmImmunity!==true||
   ids.has(a.exposureId)||witnesses.has(a.witnessHash))
   return false;
  ids.add(a.exposureId);witnesses.add(a.witnessHash);
  strain=a.strainAfter;last=a.minute+MINUTES;
  if(a.success&&++successes===2)second=row.seal;
 }
 return strain===l.strain&&
   second===l.secondSuccessSeal&&
   l.earned===(successes>=2)&&
   (l.earned?l.earnedMinute===
    l.trials.find(r=>r.seal===second).source.minute+MINUTES:
    l.earnedMinute===null);
}
function supportProof(s,seal,minute){
 const l=ledger(s);
 return !!(l&&verify(s)&&l.earned&&l.secondSuccessSeal===seal&&
  int(minute,l.earnedMinute,s.world.minutes));
}
function support(s){
 const l=ledger(s);
 if(!l)return {mitigation:0,sourceSeal:null};
 if(!verify(s))throw Error('The actual wetland bodily attunement source is not valid');
 if(s.world?.location!=='fen'||!l.earned||
  s.table?.combatants?.player?.status!=='ok')
  return {mitigation:0,sourceSeal:null};
 return {mitigation:1,sourceSeal:l.secondSuccessSeal};
}
function status(s){
 if(!verify(s))throw Error('Original living wetland attunement evidence is inconsistent');
 const l=ledger(s);
 return {actualWetlandExposureTrials:l?.trials.length||0,
  independentlyObservedSuccessfulExposures:(l?.trials||[]).filter(r=>r.source.success).length,
  earnedSpecificWetlandAcclimation:!!l?.earned,
  livingWetlandShelterSupport:support(s).mitigation,
  strain:l?.strain||0,
  noWeatherControl:true,noEvolutionStageAward:true,
  noAutomaticOtherElements:true,
  note:'A specifically observed human water/humidity acclimation can ease a real fen shelter-survival check by one without changing its original die, real environmental danger or ordinary material requirements'};
}
function exposure(s,p={}){
 if(!only(p,['witnessIndex'])||
  !int(p.witnessIndex,0,(s.log?.length||0)-1))
  throw Error('A truly independently witnessed individual water-element exposure is required');
 if(s.world?.location!=='fen'||E.LOCATIONS.fen?.biome!=='fen'||
  s.battle||s.encounter||
  s.table?.combatants?.player?.status!=='ok'||
  s.world?.planeId&&s.world.planeId!=='mortal')
  throw Error('Actual living human must be physically at the existing public Whisperfen wetland without active danger');
 const gate=Gate.gate(s),w=observed(s,p.witnessIndex,gate),
  d=w.details,l=ledger(s),witnessHash=hash(w);
 if(!verify(s))throw Error('Historical original elemental wetland acclimation proof is inconsistent');
 if(l?.trials.some(x=>x.source.exposureId===d.exposureId||
  x.source.witnessHash===witnessHash))
  throw Error('One personally witnessed actual wetland exposure cannot be rerolled');
 if((l?.strain||0)>=16)
  throw Error('Persistent individual water-tissue strain requires genuine recovery');
 if(!int(s.player.qi,QI,100000)||
  !int(s.player.stamina,STAMINA,100000)||
  !int(s.table.combatants.player.stamina,STAMINA,100000))
  throw Error('Actual original living Qi and Stamina are needed for this individual wetland exposure');
 const wisdom=C.int(s.player.attributes.wis,'original living Wisdom',1,30),
  cultivation=C.int(s.player.skills.cultivation.rank,'learned Cultivation',0,5),
  survival=C.int(s.player.skills.survival.rank,'experienced Survival',0,5),
  modifier=Math.floor((wisdom-10)/2)+
   2*Math.min(cultivation,survival),
  weather=String(s.world.weather||'Fair').slice(0,120),
  risk=weatherRisk(weather),dc=BASE_DC+risk+Math.floor((l?.strain||0)/8),
  minute=s.world.minutes;
 const check=C.check(s,{modifier,dc,
  label:'Personally observed original wetland water-element physiology'});
 const rollEvent=structuredClone(s.log.at(-1)),
  wounded=check.degree==='severe failure',
  strainAdded=wounded?5:check.success?0:2;
 s.player.qi-=QI;s.player.stamina-=STAMINA;
 s.table.combatants.player.stamina=s.player.stamina;
 if(wounded){Combat.harm(s,Combat.get(s,'player'),2);U.sync(s,{source:'wounds'});}
 const a={origin:SOURCE,kind:'personally-measured-wetland-water-exposure',
  exposureId:d.exposureId,location:'fen',
  minute,minutes:MINUTES,qiSpent:QI,staminaSpent:STAMINA,
  wisdomScore:wisdom,cultivationRank:cultivation,survivalRank:survival,
  modifier,weather,weatherRisk:risk,dc,
  gateNumber:gate.opened.number,gateQuality:gate.opened.quality,
  gateRecordHash:hash(gate.record),
  roll:check.roll,check:structuredClone(check),
  rollEvent,rollHash:hash(rollEvent),success:check.success,
  strainBefore:l?.strain||0,strainAdded,
  strainAfter:Math.min(100,(l?.strain||0)+strainAdded),
  wounded,witness:w,witnessHash};
 const row={origin:SOURCE,source:a,seal:hash(a)};
 const record=l||{origin:SOURCE,trials:[],strain:0,
  earned:false,secondSuccessSeal:null,earnedMinute:null};
 record.trials.push(row);record.strain=a.strainAfter;
 if(check.success&&record.trials.filter(t=>t.source.success).length===2){
  record.earned=true;record.secondSuccessSeal=row.seal;
  record.earnedMinute=minute+MINUTES;
 }
 s.table.specialistWetlandAttunement=record;
 E.advance(s,MINUTES);W.finalizeTime(s,minute);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('The original individual water-element tissue response did not preserve its source evidence');
 return {attempted:true,success:check.success,check,
  observedElement:'wetland_water_humidity',
  earnedSpecificWetlandAcclimation:record.earned,
  qiSpent:QI,staminaSpent:STAMINA,minutes:MINUTES,
  strainAdded,noAutomaticEvolution:true,noRemoteWaterControl:true,
  noUniversalElementalImmunity:true};
}
module.exports={SOURCE,WITNESS,verify,status,support,supportProof,exposure};
