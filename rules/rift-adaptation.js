'use strict';
// Master §25 Rift Adaptation VI. Genuine source-specific human exposure,
// biological and energetic adjustment, not free immunity to rift physics.
// The first measured adapter is external Riftglass spatial pressure; other
// environments need their own independently witnessed physical mechanisms.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),W=require('./world'),U=require('./unified'),
 Combat=require('./combat'),Realm=require('../world/simulation'),
 Anchor=require('./rift-anchors'),Fold=require('./rift-fold-step'),
 Weave=require('./rift-boundary-weaving'),
 Pocket=require('./rift-pocket-architecture'),
 Cosmos=require('../world/cosmology-ledger');
const SOURCE='earned-rift-spatial-pressure-adaptation-vi-v1',
 WITNESS='gm-measured-human-rift-pressure-adaptation-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const int=(x,min=0,max=1000000000)=>Number.isInteger(x)&&x>=min&&x<=max;
const prose=(x,min=25)=>typeof x==='string'&&x.trim().length>=min&&x.length<=900;
const only=(p,keys)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(x=>keys.includes(x));
function ledger(s){return s.table?.realm?.riftAdaptation||null;}
function risk(s){
 const w=Realm.peek(s),site=w?.mythic?.riftglass_vault,
  ec=w?.ecosystems?.riftglass;
 if(!site||!ec||!int(site.charge,0,100)||!int(site.seal,0,100)||
  !int(ec.pressure,0,100)||
  !['quiet','fading','surging','unstable'].includes(site.phase))
  throw Error('Independently changing original Riftglass site pressure is required');
 const severity=site.phase==='unstable'||site.seal<35?6:
  site.phase==='surging'||site.charge>72||ec.pressure>73?3:0;
 return {severity,sourceHash:hash({
  phase:site.phase,charge:site.charge,seal:site.seal,
  pressure:ec.pressure,worldSeed:w.worldSeed,
  day:Math.floor(s.world.minutes/1440)})};
}
function requirements(s){
 if(s.world?.location!=='ruins'||s.battle||s.encounter||
  s.table?.combatants?.player?.status!=='ok')
  throw Error('Original bodily spatial acclimatisation requires a physically present safe exterior boundary scene');
 const cosmos=Cosmos.peek(s)||Cosmos.seed();
 Cosmos.validate(cosmos,s);
 if(cosmos.boundaries?.riftglass_wardline?.noProvenPassage!==true)
  throw Error('The original sealed realm boundary does not establish safe physical transit');
 if(s.player?.rift?.step<5||!s.player.rift.pocketProof||
  !Fold.verify(s)||!Weave.verify(s)||!Pocket.verify(s))
  throw Error('Personal Rift Anchor II, Fold III, Weave IV and Pocket V must have genuinely been earned');
 Anchor.earned(s);
 return risk(s);
}
function witness(s,index){
 if(!int(index,0,(s.log?.length||0)-1))
  throw Error('A fresh independently measured original physiological rift-exposure witness is required');
 const e=s.log[index],d=e?.details;
 if(e?.type!=='story'||!prose(e.text,18)||
  d?.origin!==WITNESS||d.location!==s.world.location||
  d.boundaryId!=='riftglass_wardline'||
  d.environment!=='spatial-pressure'||
  !prose(d.measuredIndividualHumanResponse)||
  !prose(d.observedEnergyRegulation)||
  !prose(d.actualMetabolicSupply)||
  !prose(d.independentUnaidedBaseline)||
  !prose(d.independentShearCountertest)||
  !prose(d.recoveryObservation)||
  d.noSpeciesConversion!==true||
  d.noPortalAccess!==true||
  d.cannotNegateExtremePressure!==true)
  throw Error('A personally measured human energetic/biological pressure response, baseline, countertest and real recovery must be observed');
 return structuredClone(e);
}
function rollValid(a){
 const c=a.check;
 return !!(a.rollEvent?.type==='roll'&&
  a.rollEventHash===hash(a.rollEvent)&&
  hash(a.rollEvent.details)===hash(c)&&
  int(a.roll,1,20)&&a.roll===c.roll&&
  c.dc===a.dc&&c.modifier===a.modifier&&
  c.naturalBonus===C.naturalAdjustment(a.roll)&&
  c.total===a.roll+a.modifier+c.naturalBonus&&
  c.margin===c.total-c.dc&&
  c.success===(c.margin>=0)&&
  c.degree===C.degree(c.margin,true)&&
  c.progress===C.progress(c.degree));
}
function verify(s){
 const r=ledger(s);
 if(!r)return !s.player?.rift?.adaptationProof;
 if(r.origin!==SOURCE||!Array.isArray(r.attempts)||
  !r.attempts.length||
  r.pocketProofHash!==hash(s.player?.rift?.pocketProof)||
  !int(r.strain,0,100)||!int(r.progress,0,2))
  return false;
 let attempts=0,progress=0,strain=0,last=-1,firstComplete=null;
 const witnesses=new Set();
 for(const receipt of r.attempts){
  const a=receipt?.source,d=a?.witness?.details;
  if(receipt?.origin!==SOURCE||receipt.seal!==hash(a)||
   a?.origin!==SOURCE||a.kind!=='human-pressure-exposure'||
   a.location!=='ruins'||a.boundaryId!=='riftglass_wardline'||
   a.environment!=='spatial-pressure'||
   !int(a.minute,last,s.world.minutes)||
   !int(a.minutes,45,180)||a.minute+a.minutes>s.world.minutes||
   a.staminaSpent!==3+Math.ceil(a.minutes/90)||
   !int(a.attributeScore,1,30)||!int(a.skillRank,0,5)||
   a.modifier!==Math.floor((a.attributeScore-10)/2)+
     2*a.skillRank||
   ![0,3,6].includes(a.riskAdjustment)||
   a.dc!==18+a.riskAdjustment+Math.floor(strain/12)-
    (progress===2?1:0)||
   a.pressureAdaptationBonus!==(progress===2?1:0)||
   !rollValid(a)||a.success!==a.check.success||
   a.progressBefore!==progress||
   a.progressAfter!==Math.min(2,progress+(a.success?1:0))||
   a.strainBefore!==strain||
   a.strainAdded!==(a.check.degree==='severe failure'?6:0)||
   a.strainAfter!==Math.min(100,strain+a.strainAdded)||
   a.wounded!==(a.strainAdded>0)||
   a.stepBefore!==(progress===2?6:5)||
   a.stepAfter!==(a.success&&progress===1?6:a.stepBefore)||
   !a.witness||a.witness.type!=='story'||
   a.witnessHash!==hash(a.witness)||
   d?.origin!==WITNESS||d.location!==a.location||
   d.boundaryId!==a.boundaryId||
   d.environment!==a.environment||
   !prose(d.measuredIndividualHumanResponse)||
   !prose(d.observedEnergyRegulation)||
   !prose(d.actualMetabolicSupply)||
   !prose(d.independentUnaidedBaseline)||
   !prose(d.independentShearCountertest)||
   !prose(d.recoveryObservation)||
   d.noSpeciesConversion!==true||
   d.noPortalAccess!==true||
   d.cannotNegateExtremePressure!==true||
   witnesses.has(a.witnessHash))
   return false;
  witnesses.add(a.witnessHash);
  progress=a.progressAfter;strain=a.strainAfter;
  last=a.minute+a.minutes;attempts++;
  if(progress===2&&!firstComplete)firstComplete=receipt.seal;
 }
 if(r.progress!==progress||r.strain!==strain||
  (!!firstComplete)!==!!s.player?.rift?.adaptationProof||
  (firstComplete&&(s.player.rift.step<6||
   s.player.rift.adaptationProof?.source!==SOURCE||
   s.player.rift.adaptationProof?.firstCompletionSeal!==firstComplete||
   s.player.rift.adaptationProof?.observedPressureTolerance!==1)))
  return false;
 return true;
}
function pressureTolerance(s){
 const proof=s.player?.rift?.adaptationProof;
 if(!proof)return 0;
 if(!verify(s))throw Error('Personal Rift pressure adaptation proof is inconsistent');
 return proof.observedPressureTolerance;
}
function status(s){
 if(!verify(s))throw Error('Source-measured human Rift adaptation evidence cannot be verified');
 const r=ledger(s);
 return {earned:!!s.player?.rift?.adaptationProof,
  step:s.player?.rift?.step||0,
  independentlySuccessfulExposures:r?.progress||0,
  observedHumanPressureTolerance:pressureTolerance(s),
  currentShearStrain:r?.strain||0,
  trialCount:r?.attempts.length||0,
  noExtremePressureImmunity:true,noPortalTravel:true,
  note:'Individual original human energy and bodily tolerance to measured exterior spatial pressure only; no automatic adaptation to gravity, time or other realms'};
}
function expose(s,p={}){
 if(!only(p,['witnessIndex','minutes'])||
  !int(p.witnessIndex,0,(s.log?.length||0)-1)||
  !int(p.minutes??60,45,180))
  throw Error('Only a current independently observed real human spatial exposure and actual elapsed time are accepted');
 const environment=requirements(s);
 if(!verify(s))throw Error('Earlier real Rift Adaptation exposure receipts failed integrity');
 const w=witness(s,p.witnessIndex),hashWitness=hash(w),
  old=ledger(s),progress=old?.progress||0,
  strain=old?.strain||0,minutes=p.minutes??60,start=s.world.minutes;
 if(old?.attempts.some(x=>x.source.witnessHash===hashWitness))
  throw Error('One independently witnessed human exposure cannot reroll a prior result');
 if(strain>=24)throw Error('Actual severe bodily spatial strain requires clinical recovery first');
 const cost=3+Math.ceil(minutes/90);
 if(!int(s.player.stamina,cost,100000)||
  !int(s.table.combatants.player.stamina,cost,100000))
  throw Error('Real living human Stamina cannot support this individual measured exposure');
 const attributeScore=C.int(s.player.attributes.con,
  'actual original Constitution',1,30),
  skillRank=C.int(s.player.skills.arcana.rank,
  'original spatial energy regulation skill',0,5),
  modifier=Math.floor((attributeScore-10)/2)+2*skillRank,
  tolerance=progress===2?1:0,
  dc=18+environment.severity+Math.floor(strain/12)-tolerance;
 const check=C.check(s,{modifier,dc,
  label:'Original individual human Rift pressure adaptation'});
 const rollEvent=structuredClone(s.log.at(-1));
 const added=check.degree==='severe failure'?6:0;
 if(added){Combat.harm(s,Combat.get(s,'player'),2);U.sync(s,{source:'wounds'});}
 s.player.stamina-=cost;s.table.combatants.player.stamina=s.player.stamina;
 const beforeStep=s.player.rift.step,
  newProgress=Math.min(2,progress+(check.success?1:0));
 if(newProgress===2&&beforeStep===5)s.player.rift.step=6;
 const src={origin:SOURCE,kind:'human-pressure-exposure',
  location:s.world.location,boundaryId:'riftglass_wardline',
  environment:'spatial-pressure',minute:start,minutes,
  staminaSpent:cost,attributeScore,skillRank,modifier,dc,
  pressureAdaptationBonus:tolerance,riskAdjustment:environment.severity,
  riskSourceHash:environment.sourceHash,
  roll:check.roll,check:structuredClone(check),rollEvent,
  rollEventHash:hash(rollEvent),success:check.success,
  progressBefore:progress,progressAfter:newProgress,
  strainBefore:strain,strainAdded:added,
  strainAfter:Math.min(100,strain+added),wounded:added>0,
  stepBefore:beforeStep,stepAfter:s.player.rift.step,
  witness:w,witnessHash:hashWitness};
 const receipt={origin:SOURCE,source:src,seal:hash(src)},
  r=old||{origin:SOURCE,pocketProofHash:hash(s.player.rift.pocketProof),
   progress:0,strain:0,attempts:[]};
 r.attempts.push(receipt);
 r.progress=newProgress;r.strain=src.strainAfter;
 if(newProgress===2&&!s.player.rift.adaptationProof)
  s.player.rift.adaptationProof={source:SOURCE,
   firstCompletionSeal:receipt.seal,observedPressureTolerance:1,
   originalHumanBodyOnly:true,earnedMinute:start+minutes};
 Realm.ensure(s).riftAdaptation=r;
 E.advance(s,minutes);W.finalizeTime(s,start);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Original independent human Rift physiological adaptation source failed validation');
 return {attempted:true,success:check.success,check,
  independentlyEarnedExposures:newProgress,
  realHumanPressureTolerance:newProgress===2?1:0,
  staminaSpent:cost,minutes,spatialWound:added>0,
  step:s.player.rift.step,
  noOtherRealmImmunity:true,noAutomaticOriginTrait:true,
  noPortalTravel:true};
}
module.exports={SOURCE,WITNESS,verify,status,expose,pressureTolerance};
