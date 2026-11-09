'use strict';
// Stage IX: a specific source-witnessed human physiology changes within the
// one Meridian/body ledger; no free human-evolution rank, immortality, lineage
// trait, regeneration, invulnerability or unbounded energy is created.
const Crypto=require('node:crypto'),E=require('../engine.js'),C=require('./core'),
 Build=require('./build'),Net=require('./meridian-living-anatomy'),
 Domain=require('./meridian-living-domain');
const SOURCE='source-earned-individual-meridian-constitution-v1',
 OBSERVE='witnessed-human-constitutional-tissue-examination-v1',
 PRACTICE='witnessed-original-constitutional-adaptation-v1',
 FORM='witnessed-individual-transcendent-constitution-integration-v1',
 CARE='witnessed-constitution-metabolic-maintenance-v1';
const H=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const I=(n,a=0,b=1000000000)=>Number.isInteger(n)&&n>=a&&n<=b;
const P=(x,a=12,b=900)=>typeof x==='string'&&x.trim().length>=a&&x.trim().length<=b;
const ID=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{2,75}$/.test(x);
const only=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&
 Object.keys(x).every(k=>keys.includes(k));
const NEED=8;
function scene(s,index,origin,id){
 if(!I(index,0,s.log.length-1))throw Error('Original bodily source must be witnessed before constitutional work');
 const e=s.log[index],d=e?.details;
 if(e?.type!=='story'||d?.origin!==origin||
  d.constitutionId!==id||d.location!==s.world.location||
  !P(e.text,15,900))
  throw Error('A source-witnessed examination of the same actual body is missing');
 return structuredClone(e);
}
function premise(s,stage=8){
 const net=s.table?.powerPhysiology?.meridian?.advancedNetwork,m=s.player?.meridian;
 if(m?.stage!==stage||!net||!Net.verify(s)||!Domain.verify(s)||
  !net.domainTests?.some(x=>x.source?.formed))
  throw Error('Stage IX needs a genuine previously earned Stage VIII limited Living Domain');
 if(s.battle||s.encounter||m.stability<55)
  throw Error('Original body integration needs safe conditions and adequate measured Meridian stability');
 return {m,net};
}
function existing(net,domainId,tissueId){
 const d=net.domainPlans?.[domainId],t=net.tissueInterfaces?.[tissueId];
 if(!d||!t||d.source.tissueId!==tissueId||
  !net.domainTests?.some(x=>x.source.formed&&x.source.id===domainId)||
  !net.tissueTests?.some(x=>x.source.formed&&x.source.id===tissueId))
  throw Error('Constitution must arise from the same actual previously integrated human tissue and physical domain');
 return {d,t};
}
function profile(s,stage){
 const gates=s.table.powerPhysiology.meridian.gateRecords,
  formed=s.table.powerPhysiology.meridian.advancedNetwork.transitions.find(x=>x.source?.formed);
 if(!formed)throw Error('Actual fully integrated Meridian network source missing');
 return Build.meridianProfile(stage,{meridians:12,
  gatesP:gates.filter(x=>x.quality==='Perfect').length,
  gatesS:gates.filter(x=>x.quality==='Sound').length,
  gatesF:gates.filter(x=>x.quality==='Flawed').length,
  seaRings:s.player.meridian.dantianSea.rings,
  extraordinary:formed.source.extraordinary,
  webComplete:true,intentDepth:1});
}
function verifySource(s){
 const net=s.table?.powerPhysiology?.meridian?.advancedNetwork,
  forms=net?.constitutions,tests=net?.constitutionTests,care=net?.constitutionCare;
 if(!forms&&!tests&&!care)return (s.player?.meridian?.stage||0)<9;
 if(!forms||typeof forms!=='object'||Array.isArray(forms)||
  !Array.isArray(tests)||!Array.isArray(care))return false;
 const witnesses=new Set();let formed=null;
 for(const [id,record] of Object.entries(forms)){
  const z=record?.source,d=net.domainPlans?.[z?.domainId],
   t=net.tissueInterfaces?.[z?.tissueId];
  if(!ID(id)||record.id!==id||record.origin!==SOURCE||record.seal!==H(z)||
   z?.origin!==SOURCE||z.id!==id||!d||!t||
   d.source.tissueId!==z.tissueId||
   z.domainHash!==d.seal||z.tissueHash!==t.seal||
   !I(z.minute,0,s.world.minutes)||
   !P(z.name,3,140)||!P(z.physicalTransformation)||
   !P(z.metabolicLimit)||!P(z.maintenance)||!P(z.injuryBoundary)||
   !P(z.individualConsequence)||!P(z.lifespanLimit)||
   !z.witness||H(z.witness)!==z.witnessHash||
   z.witness.details?.origin!==OBSERVE||
   z.witness.details?.constitutionId!==id||
   !Array.isArray(record.attempts)||!I(record.points,0,NEED))
   return false;
  let pts=0,last=z.minute;
  for(const rec of record.attempts){
   const a=rec?.source;
   if(rec?.origin!==SOURCE||rec.seal!==H(a)||
    a?.origin!==SOURCE||a.id!==id||
    !I(a.minute,last,s.world.minutes)||!I(a.minutes,15,480)||
    !I(a.qiSpent,1,100)||!I(a.staminaSpent,1,20)||
    !I(a.roll,1,20)||a.check?.roll!==a.roll||
    a.earned!==(a.check.success?a.check.progress:0)||
    a.progress!==Math.min(NEED,pts+a.earned)||
    a.stabilityLoss!==(a.check.degree==='severe failure'?2:0)||
    !a.rollEvent||H(a.rollEvent)!==a.rollEventHash||
    H(a.rollEvent.details)!==H(a.check)||
    !a.witness||H(a.witness)!==a.witnessHash||
    a.witness.details?.origin!==PRACTICE||
    a.witness.details?.constitutionId!==id||
    witnesses.has(a.witnessHash))return false;
   witnesses.add(a.witnessHash);pts=a.progress;last=a.minute+a.minutes;
  }
  if(record.points!==pts)return false;
 }
 for(const rec of tests){
  const a=rec?.source,f=forms[a?.id];
  if(rec?.origin!==SOURCE||rec.seal!==H(a)||
   a?.origin!==SOURCE||a.kind!=='original-human-constitution-transformation'||
   !f||a.domainId!==f.source.domainId||
   !I(a.minute,f.source.minute,s.world.minutes)||
   !I(a.minutes,30,480)||!I(a.qiSpent,1,100)||
   !I(a.staminaSpent,1,30)||!I(a.roll,1,20)||
   a.check?.roll!==a.roll||a.formed!==a.check.success||
   !a.rollEvent||H(a.rollEvent)!==a.rollEventHash||
   H(a.rollEvent.details)!==H(a.check)||
   !a.witness||H(a.witness)!==a.witnessHash||
   a.witness.details?.origin!==FORM||
   a.witness.details?.constitutionId!==a.id||
   a.pointsAtAttempt!==NEED||witnesses.has(a.witnessHash))return false;
  witnesses.add(a.witnessHash);
  if(a.formed){
   if(formed)return false;
   formed=rec;
   const target=profile(s,9),cap=a.capacity;
   if(!cap||cap.newMax!==Math.max(cap.oldMax,target.qi)||
    cap.newQi!==cap.oldQi-a.qiSpent||
    cap.flow!==target.flow||cap.recovery!==target.recovery||
    !I(cap.oldQi,a.qiSpent,100000)||!I(cap.oldMax,0,100000))
    return false;
  }else if(a.capacity!==null)return false;
 }
 let burden=0;
 for(const rec of care){
  const a=rec?.source;
  if(rec?.origin!==SOURCE||rec.seal!==H(a)||
   a?.origin!==SOURCE||a.kind!=='original-individual-metabolic-maintenance'||
   !formed||a.id!==formed.source.id||
   !I(a.minute,formed.source.minute,s.world.minutes)||
   !I(a.minutes,15,480)||!I(a.qiSpent,1,30)||
   !I(a.staminaSpent,1,20)||!I(a.roll,1,20)||
   a.check?.roll!==a.roll||
   !a.rollEvent||H(a.rollEvent)!==a.rollEventHash||
   H(a.rollEvent.details)!==H(a.check)||
   !a.witness||H(a.witness)!==a.witnessHash||
   a.witness.details?.origin!==CARE||
   a.witness.details?.constitutionId!==a.id||
   witnesses.has(a.witnessHash)||
   a.burdenBefore!==burden||
   a.burdenAfter!==(a.check.success?Math.max(0,burden-1):Math.min(10,burden+2))||
   a.stabilityLoss!==(a.check.degree==='severe failure'?2:0))
   return false;
  witnesses.add(a.witnessHash);burden=a.burdenAfter;
 }
 if((s.player?.meridian?.stage||0)>=9&&!formed)return false;
 if(s.player?.meridian?.stage===8&&formed)return false;
 if(formed&&s.player?.meridian?.stage===9){
  const m=s.player.meridian,target=profile(s,9),cap=formed.source.capacity;
  if(m.constitutionIntegration!==1||
   m.constitutionId!==formed.source.id||
   m.constitutionBurden!==burden||
   m.stableQiLimit!==target.qi||m.flow!==cap.flow||
   m.recoveryRate!==cap.recovery||
   s.player.maxQi<cap.newMax)return false;
 }
 return true;
}
function verify(s){return Net.verify(s)&&verifySource(s);}
function map(s,p={}){
 if(!only(p,['id','domainId','tissueId','name','physicalTransformation',
  'metabolicLimit','maintenance','injuryBoundary','individualConsequence',
  'lifespanLimit','witnessIndex'])||
  !ID(p.id)||!ID(p.domainId)||!ID(p.tissueId)||
  !P(p.name,3,140)||!P(p.physicalTransformation)||
  !P(p.metabolicLimit)||!P(p.maintenance)||!P(p.injuryBoundary)||
  !P(p.individualConsequence)||!P(p.lifespanLimit))
  throw Error('Actual individual physiology, observed change, metabolic maintenance and non-immortality limits are required');
 const {net}=premise(s),{d,t}=existing(net,p.domainId,p.tissueId),
  witness=scene(s,p.witnessIndex,OBSERVE,p.id);
 if(!P(witness.details?.examinedAlteration,24,850)||
  !P(witness.details?.independentLimit,24,850)||
  !P(witness.details?.metabolicBurden,24,850)||
  witness.details?.automaticImmortality===true)
  throw Error('A named constitutional power is not a real individually examined bodily transformation');
 if(net.constitutions?.[p.id])throw Error('This exact source-backed constitution is already recorded');
 const source={origin:SOURCE,id:p.id,domainId:d.id,domainHash:d.seal,
  tissueId:t.id,tissueHash:t.seal,minute:s.world.minutes,
  name:p.name.trim(),physicalTransformation:p.physicalTransformation.trim(),
  metabolicLimit:p.metabolicLimit.trim(),maintenance:p.maintenance.trim(),
  injuryBoundary:p.injuryBoundary.trim(),
  individualConsequence:p.individualConsequence.trim(),
  lifespanLimit:p.lifespanLimit.trim(),witness,witnessHash:H(witness),
  noFreeHumanEvolution:true};
 const record={origin:SOURCE,id:p.id,source,seal:H(source),points:0,attempts:[]};
 if(!net.constitutions){net.constitutions={};net.constitutionTests=[];net.constitutionCare=[];}
 net.constitutions[p.id]=record;
 return {mapped:true,id:p.id,transformed:false,noLongevityOrEvolutionAward:true};
}
function practice(s,p={}){
 if(!only(p,['id','witnessIndex','minutes'])||!ID(p.id)||
  !I(p.minutes??45,15,480))
  throw Error('A source-witnessed real metabolic adaptation and practice time are required');
 const {net,m}=premise(s),record=net.constitutions?.[p.id];
 if(!record||!verify(s))throw Error('Original constitution anatomy source or history is missing');
 if(record.points>=NEED)throw Error('Actual source-earned constitutional adaptation is ready for independent proof');
 const witness=scene(s,p.witnessIndex,PRACTICE,p.id);
 if(!P(witness.details?.tissueChange,24,850)||
  !P(witness.details?.metabolicCost,24,850))
  throw Error('Individual physical tissue change must be tested with observed metabolism');
 const witnessHash=H(witness);
 if(record.attempts.some(x=>x.source.witnessHash===witnessHash))
  throw Error('The original constitutional adaptation was already resolved');
 const minutes=p.minutes??45,qiSpent=4+Math.ceil(minutes/90),
  staminaSpent=3+Math.ceil(minutes/90);
 if(!I(s.player.qi,qiSpent,100000)||!I(s.player.stamina,staminaSpent,100000))
  throw Error('Actual human Qi and Stamina are insufficient for constitutional adaptation');
 const before=s.world.minutes;
 s.player.qi-=qiSpent;s.player.stamina-=staminaSpent;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.con-10)/2)+
  2*(s.player.skills?.cultivation?.rank||0)+Math.floor(m.stability/30)-1,
  dc:21,label:'Original Stage IX individual bodily metabolism adaptation'});
 const rollEvent=structuredClone(s.log.at(-1));
 const earned=check.success?check.progress:0,
  stabilityLoss=check.degree==='severe failure'?2:0;
 if(stabilityLoss)m.stability=Math.max(1,m.stability-stabilityLoss);
 record.points=Math.min(NEED,record.points+earned);
 const source={origin:SOURCE,id:record.id,minute:before,minutes,
  qiSpent,staminaSpent,witness,witnessHash,
  roll:check.roll,check:structuredClone(check),
  rollEvent,rollEventHash:H(rollEvent),earned,progress:record.points,
  stabilityLoss};
 record.attempts.push({origin:SOURCE,source,seal:H(source)});
 E.advance(s,minutes);require('./world').finalizeTime(s,before);
 if(!verify(s))throw Error('Source-proven metabolic adaptation no longer matches saved physical state');
 return {practised:true,check,points:record.points,needed:NEED,
  qiSpent,staminaSpent,stabilityLoss,minutes,
  noInstantConstitutionOrImmortality:true};
}
function form(s,p={}){
 if(!only(p,['id','witnessIndex','minutes'])||!ID(p.id)||
  !I(p.minutes??90,30,480))
  throw Error('Stage IX requires a distinct original bodily formation trial');
 const {net,m}=premise(s),record=net.constitutions?.[p.id];
 if(!record||!verify(s)||record.points<NEED)
  throw Error('Stage IX needs physically earned original constitutional adaptation');
 const witness=scene(s,p.witnessIndex,FORM,p.id);
 if(!P(witness.details?.sustainedPhysiology,24,850)||
  !P(witness.details?.counterEvidence,24,850)||
  !P(witness.details?.observedTradeoff,24,850))
  throw Error('An individual functioning body, independently observed limitation and material tradeoff are required');
 const proof=H(witness);
 if(net.constitutionTests.some(x=>x.source.witnessHash===proof))
  throw Error('The original bodily transition trial was already rolled');
 const minutes=p.minutes??90,qiSpent=10,staminaSpent=Math.ceil(minutes/90)+4;
 if(!I(s.player.qi,qiSpent,100000)||!I(s.player.stamina,staminaSpent,100000))
  throw Error('Real original bodily Qi and energy are insufficient for constitutional conversion');
 const before=s.world.minutes,oldQi=s.player.qi,oldMax=s.player.maxQi;
 s.player.qi-=qiSpent;s.player.stamina-=staminaSpent;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.con-10)/2)+
  2*(s.player.skills?.cultivation?.rank||0)+Math.floor(m.stability/30)-1,
  dc:24,label:'Stage IX unique individual constitutional conversion'});
 const rollEvent=structuredClone(s.log.at(-1));
 let capacity=null;
 if(check.success){
  const target=profile(s,9);
  m.stage=9;m.constitutionIntegration=1;
  m.constitutionId=record.id;m.constitutionBurden=0;
  m.stableQiLimit=target.qi;m.flow=target.flow;
  m.recoveryRate=target.recovery;
  s.player.maxQi=Math.max(oldMax,target.qi);
  capacity={oldQi,newQi:s.player.qi,oldMax,newMax:s.player.maxQi,
   flow:target.flow,recovery:target.recovery};
 }
 const source={origin:SOURCE,kind:'original-human-constitution-transformation',
  id:record.id,domainId:record.source.domainId,
  minute:before,minutes,witness,witnessHash:proof,
  qiSpent,staminaSpent,roll:check.roll,check:structuredClone(check),
  rollEvent,rollEventHash:H(rollEvent),pointsAtAttempt:record.points,
  formed:check.success,capacity};
 net.constitutionTests.push({origin:SOURCE,source,seal:H(source)});
 E.advance(s,minutes);require('./world').finalizeTime(s,before);
 if(!verify(s))throw Error('Real Stage IX individual constitutional source or conserved Qi invalid');
 return {attempted:true,formed:check.success,check,
  stage:s.player.meridian.stage,qiSpent,staminaSpent,minutes,
  noImmortalityOrUnlearnedPower:true,capacity};
}
function care(s,p={}){
 if(!only(p,['id','witnessIndex','minutes'])||!ID(p.id)||
  !I(p.minutes??45,15,480))
  throw Error('Actual individually witnessed constitution maintenance is required');
 const net=s.table?.powerPhysiology?.meridian?.advancedNetwork,
  record=net?.constitutions?.[p.id],m=s.player?.meridian;
 if(m?.stage!==9||m.constitutionId!==p.id||
  !record||!verify(s)||s.battle||s.encounter)
  throw Error('Only a real Stage IX individual body can undergo its own constitutional maintenance');
 const witness=scene(s,p.witnessIndex,CARE,p.id);
 if(!P(witness.details?.physicalMaintenance,24,850)||
  !P(witness.details?.observedLimit,24,850))
  throw Error('Metabolic burden and real physical limiting conditions must be observed');
 const w=H(witness);
 if(net.constitutionCare.some(x=>x.source.witnessHash===w))
  throw Error('The individual maintenance work already received one original check');
 const minutes=p.minutes??45,qiSpent=3,staminaSpent=2+Math.ceil(minutes/120);
 if(!I(s.player.qi,qiSpent,100000)||!I(s.player.stamina,staminaSpent,100000))
  throw Error('The changed body has real continuing metabolic Qi and Stamina costs');
 const before=s.world.minutes,burdenBefore=m.constitutionBurden;
 s.player.qi-=qiSpent;s.player.stamina-=staminaSpent;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.con-10)/2)+
  2*(s.player.skills?.cultivation?.rank||0),
  dc:19,label:'Real Stage IX physical metabolic maintenance'});
 const rollEvent=structuredClone(s.log.at(-1));
 const burdenAfter=check.success?Math.max(0,burdenBefore-1):Math.min(10,burdenBefore+2),
  stabilityLoss=check.degree==='severe failure'?2:0;
 m.constitutionBurden=burdenAfter;
 if(stabilityLoss)m.stability=Math.max(1,m.stability-stabilityLoss);
 const source={origin:SOURCE,kind:'original-individual-metabolic-maintenance',
  id:p.id,minute:before,minutes,qiSpent,staminaSpent,roll:check.roll,
  check:structuredClone(check),rollEvent,rollEventHash:H(rollEvent),
  witness,witnessHash:w,burdenBefore,burdenAfter,stabilityLoss};
 net.constitutionCare.push({origin:SOURCE,source,seal:H(source)});
 E.advance(s,minutes);require('./world').finalizeTime(s,before);
 if(!verify(s))throw Error('Maintenance or biological burden history was altered');
 return {maintained:check.success,check,burden:burdenAfter,
  qiSpent,staminaSpent,minutes,stabilityLoss,
  note:'Biological upkeep only; no free healing, immortality, origin trait or combat power'};
}
function status(s){
 const stage=s.player?.meridian?.stage||0;
 if(stage<8)return {stage,available:false,
  note:'Source-earned Stage VIII bounded Living Domain is required'};
 if(!verify(s))throw Error('Individual constitution origin or physiological receipts were changed');
 const net=s.table.powerPhysiology.meridian.advancedNetwork;
 return {stage,available:stage===8,
  constitutions:Object.values(net.constitutions||{}).map(x=>({
   id:x.id,name:x.source.name,points:x.points,required:NEED,
   upkeep:x.source.maintenance,metabolicLimit:x.source.metabolicLimit})),
  formed:stage===9,burden:s.player.meridian.constitutionBurden||0,
  separateHumanEvolution:s.player.humanEvolution?.stage||0,
  noUniversalFinalFormOrImmortality:true};
}
module.exports={SOURCE,OBSERVE,PRACTICE,FORM,CARE,
 map,practice,form,care,status,verify,verifySource};
