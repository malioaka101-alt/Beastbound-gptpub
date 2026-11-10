'use strict';
// Original Master §§20,26: first individually observed Meridian-supported
// clinical healing intent. This is not universal regeneration, Soul therapy,
// an invented drug, a second HP pool, a new Gate or automatic recovery.
// An actual self-consenting injured human at a real clinic spends existing
// medicine, Qi, Stamina and time to try converting one Serious wound into
// a residual Light wound through the canonical physical wound boxes.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),W=require('./world'),U=require('./unified'),
 Combat=require('./combat'),Gate=require('./meridian-qi-strike');
const SOURCE='original-clinical-meridian-healing-intent-v1';
const WITNESS='gm-witnessed-individual-clinical-meridian-repair-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const integer=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b;
const prose=x=>typeof x==='string'&&x.trim().length>=25&&x.trim().length<=900;
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{3,65}$/.test(x);
const only=(p,keys)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(x=>keys.includes(x));
const QI=3,STAMINA=4,MINUTES=90,DC=18;
const ITEM='healing_balm';
function ledger(s){return s.table?.specialistHealingIntent||null;}
function clinic(s){
 const location=s.world?.location,place=E.LOCATIONS[location],
  valid=(location==='academy'&&place?.facilities?.includes('clinic'))||
    (location==='crossing'&&place?.facilities?.includes('infirmary'));
 if(!valid||s.battle||s.encounter||
  (s.world?.planeId&&s.world.planeId!=='mortal')||
  s.table?.combatants?.player?.status!=='ok')
  throw Error('Actual living patient must be in a clean known clinic, conscious, out of danger and physically present');
 return location;
}
function woundState(s){
 const c=Combat.get(s,'player'),w=c.wounds;
 if(!Array.isArray(w)||w.length!==3||
  !Array.isArray(c.boxes)||c.boxes.length!==3||
  w.some((n,i)=>!integer(n,0,c.boxes[i]))||
  w[1]===0||w[0]>=c.boxes[0])
  throw Error('A real current Serious wound and spare Light-wound recovery capacity are required for this limited treatment');
 return {c,w:[...w]};
}
function observed(s,index,current){
 if(!integer(index,0,(s.log?.length||0)-1))
  throw Error('An independently witnessed original serious-injury assessment is required');
 const e=s.log[index],d=e?.details;
 if(e?.type!=='story'||!prose(e.text)||
  d?.origin!==WITNESS||d.location!==s.world.location||
  !id(d.treatmentId)||
  !Array.isArray(d.observedWoundBoxes)||d.observedWoundBoxes.length!==3||
  JSON.stringify(d.observedWoundBoxes)!==JSON.stringify(current)||
  d.firstMeridianGate!==1||
  !prose(d.originalTissueAnatomy)||
  !prose(d.realMeridianRepairRoute)||
  !prose(d.independentOrdinaryHealingBaseline)||
  !prose(d.separatelyObservedQiResponse)||
  !prose(d.independentAdverseCirculationTest)||
  !prose(d.balmProvenanceAndUse)||
  !prose(d.cleanClinicControl)||
  !prose(d.finiteTissueRecoveryAndAftercare)||
  d.actualPatientSelfConsent!==true||
  d.noGuaranteedRegeneration!==true||
  d.noLegacyHpRestoration!==true||
  d.noNewOrganOrSpeciesChange!==true)
  throw Error('A separately observed actual Serious wound, consenting human tissue response, first-gate route, adverse countertest and existing medicine are required');
 return structuredClone(e);
}
function check(a){
 const c=a?.check,e=a?.rollEvent;
 return !!(c&&e?.type==='roll'&&a.rollHash===hash(e)&&
  hash(e.details)===hash(c)&&integer(a.roll,1,20)&&a.roll===c.roll&&
  c.dc===a.dc&&c.modifier===a.modifier&&
  c.naturalBonus===C.naturalAdjustment(a.roll)&&
  c.total===a.roll+c.modifier+c.naturalBonus&&
  c.margin===c.total-c.dc&&
  c.success===(c.margin>=0)&&
  c.degree===C.degree(c.margin,true)&&
  c.progress===C.progress(c.degree));
}
function verify(s){
 const l=ledger(s);
 if(!l)return true;
 if(l.origin!==SOURCE||!Array.isArray(l.attempts)||
  !l.attempts.length)return false;
 let last=-1;const ids=new Set(),witnesses=new Set();
 for(const row of l.attempts){
  const a=row?.source,d=a?.witness?.details;
  if(row?.origin!==SOURCE||!a||row.seal!==hash(a)||
   a.origin!==SOURCE||a.kind!=='self-consenting-serious-to-light-repair'||
   !id(a.treatmentId)||
   !['academy','crossing'].includes(a.location)||
   !integer(a.minute,last,s.world.minutes)||
   a.minutes!==MINUTES||a.minute+MINUTES>s.world.minutes||
   a.qiSpent!==QI||a.staminaSpent!==STAMINA||
   a.balmSpent!==1||a.dc!==DC||
   !integer(a.wisScore,1,30)||
   !integer(a.medicineRank,0,5)||!integer(a.cultivationRank,0,5)||
   a.modifier!==Math.floor((a.wisScore-10)/2)+
    2*Math.min(a.medicineRank,a.cultivationRank)||
   a.gateNumber!==1||
   !['Sound','Perfect','Flawed'].includes(a.gateQuality)||
   !check(a)||a.success!==a.check.success||
   !Array.isArray(a.woundsBefore)||a.woundsBefore.length!==3||
   a.woundsBefore.some((x)=>!integer(x,0,100))||
   a.woundsBefore[1]<1||
   !Array.isArray(a.woundsAfter)||a.woundsAfter.length!==3||
   a.woundsAfter.some(x=>!integer(x,0,100))||
   a.woundsAfter[0]!==a.woundsBefore[0]+
    (a.success||a.wounded?1:0)||
   a.woundsAfter[1]!==a.woundsBefore[1]-(a.success?1:0)||
   a.woundsAfter[2]!==a.woundsBefore[2]||
   a.wounded!==(a.check.degree==='severe failure')||
   a.seriousChanged!==(a.success?1:0)||
   !a.witness||a.witness.type!=='story'||
   a.witnessHash!==hash(a.witness)||
   d?.origin!==WITNESS||d.location!==a.location||
   d.treatmentId!==a.treatmentId||
   JSON.stringify(d.observedWoundBoxes)!==JSON.stringify(a.woundsBefore)||
   d.firstMeridianGate!==1||
   !prose(d.originalTissueAnatomy)||
   !prose(d.realMeridianRepairRoute)||
   !prose(d.independentOrdinaryHealingBaseline)||
   !prose(d.separatelyObservedQiResponse)||
   !prose(d.independentAdverseCirculationTest)||
   !prose(d.balmProvenanceAndUse)||
   !prose(d.cleanClinicControl)||
   !prose(d.finiteTissueRecoveryAndAftercare)||
   d.actualPatientSelfConsent!==true||
   d.noGuaranteedRegeneration!==true||
   d.noLegacyHpRestoration!==true||
   d.noNewOrganOrSpeciesChange!==true||
   ids.has(a.treatmentId)||witnesses.has(a.witnessHash))
   return false;
  ids.add(a.treatmentId);witnesses.add(a.witnessHash);
  last=a.minute+MINUTES;
 }
 return true;
}
function status(s){
 if(!verify(s))throw Error('Original individually witnessed clinical repair receipts failed verification');
 const l=ledger(s);
 return {trials:l?.attempts.length||0,
  succeeded:(l?.attempts||[]).filter(x=>x.source.success).length,
  existingWoundModelOnly:true,noFreeRegeneration:true,
  noUniversalFirstGateHealingLaw:true,
  note:'A specific source-measured optional self-treatment at a real clinic can reduce one current Serious wound to a residual Light wound when a genuine check succeeds; ordinary medical care remains independent'};
}
function treat(s,p={}){
 if(!only(p,['witnessIndex'])||
  !integer(p.witnessIndex,0,(s.log?.length||0)-1))
  throw Error('Only a witnessed independently assessed serious-wound treatment is accepted');
 clinic(s);
 const gate=Gate.gate(s),{c,w:before}=woundState(s);
 if(!verify(s))throw Error('Earlier original individual healing evidence cannot be reconciled');
 const witness=observed(s,p.witnessIndex,before),
  details=witness.details,l=ledger(s),wHash=hash(witness);
 if(l?.attempts.some(x=>x.source.treatmentId===details.treatmentId||
   x.source.witnessHash===wHash))
  throw Error('This original observed injury and personal repair attempt cannot be rerolled');
 if(!integer(s.player.qi,QI,100000)||
  !integer(s.player.stamina,STAMINA,100000)||
  !integer(c.stamina,STAMINA,100000))
  throw Error('The real human patient needs sufficient original Qi and living Stamina');
 const itemPlan=U.planItems(s,{[ITEM]:-1});
 const medicine=C.int(s.player.skills.medicine.rank,'existing Medicine skill',0,5),
  cultivation=C.int(s.player.skills.cultivation.rank,'existing Cultivation skill',0,5),
  wisdom=C.int(s.player.attributes.wis,'existing Wisdom',1,30),
  modifier=Math.floor((wisdom-10)/2)+2*Math.min(medicine,cultivation),
  minute=s.world.minutes;
 const outcome=C.check(s,{modifier,dc:DC,
  label:'Source-witnessed first-gate tissue healing and serious-injury care'});
 const event=structuredClone(s.log.at(-1));
 U.applyItems(s,itemPlan);
 s.player.qi-=QI;s.player.stamina-=STAMINA;
 c.stamina=s.player.stamina;
 const failureWound=outcome.degree==='severe failure';
 if(outcome.success){c.wounds[1]--;c.wounds[0]++;}
 else if(failureWound)Combat.harm(s,c,2);
 const a={origin:SOURCE,kind:'self-consenting-serious-to-light-repair',
  treatmentId:details.treatmentId,location:s.world.location,
  minute,minutes:MINUTES,qiSpent:QI,staminaSpent:STAMINA,
  balmSpent:1,gateNumber:gate.opened.number,
  gateQuality:gate.opened.quality,
  medicineRank:medicine,cultivationRank:cultivation,
  wisScore:wisdom,modifier,dc:DC,
  roll:outcome.roll,check:structuredClone(outcome),
  rollEvent:event,rollHash:hash(event),success:outcome.success,
  wounded:failureWound,seriousChanged:outcome.success?1:0,
  woundsBefore:before,woundsAfter:[...c.wounds],
  witness,witnessHash:wHash};
 const row={origin:SOURCE,source:a,seal:hash(a)};
 s.table.specialistHealingIntent||={origin:SOURCE,attempts:[]};
 s.table.specialistHealingIntent.attempts.push(row);
 E.advance(s,MINUTES);W.finalizeTime(s,minute);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Original serious-wound healing source or canonical injury boxes lost integrity');
 return {attempted:true,success:outcome.success,check:outcome,
  usedExistingHealingBalm:1,qiSpent:QI,staminaSpent:STAMINA,
  elapsedMinutes:MINUTES,seriousWoundsReduced:outcome.success?1:0,
  residualLightWounds:outcome.success?1:0,
  adverseAdditionalLightWound:failureWound,
  canonicalWounds:[...c.wounds],noLegacyHpGain:true,
  noNewEvolutionOrTechniqueGranted:true};
}
module.exports={SOURCE,WITNESS,verify,status,treat};
