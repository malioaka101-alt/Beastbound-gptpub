'use strict';
// An actually conscious survivor of a Critical wound can make an ordinary
// source-witnessed clinic visit, without claiming an emergency rescue
// occurred. Only an original injury event from a legal wound exchange can
// authorise the later separate intensive-care course.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),W=require('./world'),H=require('./unified');
const CLINIC='academy',DOCTOR='vale',DAY=1440,CONSULT=15;
const hash=e=>Crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex');
function only(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Critical clinic referral accepts no chosen severity, source, diagnosis, doctor or event result');
}
function local(s){
 const c=s.table?.combatants?.player,npc=E.NPCS[DOCTOR],loc=E.LOCATIONS[CLINIC];
 if(!npc||npc.location!==CLINIC||npc.profession!=='Origin-pattern physician'||
    !loc?.facilities?.includes('clinic')||s.world?.location!==CLINIC)
  throw Error('The actual Lumenfall clinic and Dr Vael must be present for this specialist referral');
 if(s.battle||s.encounter)
  throw Error('A Critical-wound clinic visit cannot occur during active combat or wildlife danger');
 if(s.table?.healthModel!=='wounds-v1'||!c||c.status!=='ok'||
    !Array.isArray(c.wounds)||c.wounds[2]!==1||
    !Array.isArray(c.boxes)||c.boxes[2]!==1)
  throw Error('Only an actually conscious patient with one witnessed Critical wound can request this referral');
 if(s.player.health!==s.table.legacyHealth?.current||
    s.player.maxHealth!==s.table.legacyHealth?.max)
  throw Error('Conflicting legacy health and wound records require a real reconciliation');
 return {c,npc};
}
function observed(s,c){
 let chosen=null,index=-1;
 for(let i=s.log.length-1;i>=0;i--){
  const e=s.log[i],p=e?.details,w=p?.criticalWitness;
  if(e?.type!=='combat'||w?.origin!=='verified-conscious-critical-combat-hit')continue;
  if(w.targetId!=='player'||w.source!==
      'Real wound combat exchange with independently profiled opponent and successful Critical Vigor save'||
     typeof w.enemyId!=='string'||!s.table?.combatants?.[w.enemyId]||
     typeof w.location!=='string'||!['forest','fen','hills','ruins'].includes(w.location)||
     !Number.isInteger(w.worldMinute)||w.worldMinute>s.world.minutes||
     s.world.minutes-w.worldMinute>DAY||
     p.hit!==true||p.status!=='ok'||p.wound?.result!=='Critical wound'||
     p.wound?.criticalSave?.success!==true||p.wound?.wounds?.[2]!==1||
     !Array.isArray(p.wound.wounds)||p.wound.wounds.length!==3||
     JSON.stringify(p.wound.wounds)!==JSON.stringify(c.wounds)||
     typeof e.text!=='string'||!e.text.startsWith('⚔️ '+s.player.name+': d20 ')){
    throw Error('The observed Critical combat injury no longer matches its original physical evidence');
  }
  chosen=e;index=i;break;
 }
 if(!chosen)throw Error('A recent genuine survived Critical wound from canonical combat is required');
 return {event:chosen,index,hash:hash(chosen)};
}
function prepare(s,p={}){
 only(p);
 const {c,npc}=local(s);
 const minute=s.world.minutes%DAY;
 if(minute<8*60||minute+CONSULT>17*60)
  throw Error('Dr Vael must actually be present during the named clinic daytime appointment window');
 const seen=observed(s,c),other=s.table?.criticalConsciousReferral;
 if(other&&!other.used)
  throw Error('An earlier Critical referral is already awaiting the actual inpatient course');
 if(s.table?.criticalConsciousReferralsUsed?.[seen.hash])
  throw Error('This exact Critical wound already received specialist referral and may not be re-used');
 if(s.table?.clinicalCritical&&s.table.clinicalCritical.phase!=='completed')
  throw Error('An earlier course of Critical care is still active');
 const started=s.world.minutes,oldRng=s.rngState;
 E.advance(s,CONSULT);W.finalizeTime(s,started);H.sync(s,{source:'legacy'});
 const source='Dr Vael in-person specialist examination of an actually survived canon wound-combat Critical hit at Lumenfall Annex';
 const referralId='critical_referral_'+seen.hash.slice(0,16);
 C.event(s,'injury',npc.name+' observes the actual previous Critical combat injury and offers a limited non-surgical recovery course.',{
  origin:'verified-conscious-critical-clinic-referral',referralId,
  doctor:npc.name,location:CLINIC,sourceEventHash:seen.hash,
  actualWounds:[...c.wounds],minutes:CONSULT
 });
 const clinicalEventIndex=s.log.length-1,clinicalEvent=s.log[clinicalEventIndex];
 s.table||={};s.table.criticalConsciousReferral={
  referralId,used:false,patient:s.player.name,doctor:npc.name,location:CLINIC,
  source,originalAttackEventIndex:seen.index,originalAttackHash:seen.hash,
  consultEventIndex:clinicalEventIndex,consultHash:hash(clinicalEvent),
  observedWounds:[...c.wounds],consultAtMinute:s.world.minutes
 };
 if(s.rngState!==oldRng)
  throw Error('A simple observed doctor referral cannot introduce a new medical die');
 return {referred:true,referralId,physician:npc.name,sourceWoundHash:seen.hash,
  elapsedMinutes:CONSULT,
  criticalWounds:c.wounds[2],woundsHealed:0,
  nextStep:'health.criticalCare, if the actual patient can fund and undergo the full period'};
}
function verify(s,c,doc){
 const r=s.table?.criticalConsciousReferral;
 if(!r||r.used||r.patient!==s.player.name||r.doctor!==doc.name||
    r.location!==CLINIC||
    typeof r.source!=='string'||r.source.length<20||
    typeof r.originalAttackHash!=='string'||r.originalAttackHash.length!==64||
    !Number.isInteger(r.consultAtMinute)||r.consultAtMinute<0||
    r.consultAtMinute>s.world.minutes||
    s.world.minutes-r.consultAtMinute>DAY||
    !Array.isArray(r.observedWounds)||r.observedWounds.length!==3||
    JSON.stringify(r.observedWounds)!==JSON.stringify(c.wounds)||
    !Number.isInteger(r.originalAttackEventIndex)||r.originalAttackEventIndex<0||
    !Number.isInteger(r.consultEventIndex)||r.consultEventIndex<0||
    r.originalAttackEventIndex>=s.log.length||r.consultEventIndex>=s.log.length||
    s.table?.criticalConsciousReferralsUsed?.[r.originalAttackHash])
  throw Error('A current, unused real Dr Vael Critical-injury referral with unchanged wounds is required');
 const injury=s.log[r.originalAttackEventIndex],visit=s.log[r.consultEventIndex];
 const w=injury?.details?.criticalWitness;
 if(injury?.type!=='combat'||w?.origin!=='verified-conscious-critical-combat-hit'||
    w.targetId!=='player'||injury.details?.wound?.result!=='Critical wound'||
    injury.details?.wound?.criticalSave?.success!==true||
    !['forest','fen','hills','ruins'].includes(w.location)||
    !Number.isInteger(w.worldMinute)||w.worldMinute>r.consultAtMinute||
    r.consultAtMinute-w.worldMinute>DAY||
    hash(injury)!==r.originalAttackHash||
    visit?.type!=='injury'||visit.details?.origin!=='verified-conscious-critical-clinic-referral'||
    visit.details?.referralId!==r.referralId||
    visit.details?.sourceEventHash!==r.originalAttackHash||
    visit.details?.doctor!==doc.name||visit.details?.location!==CLINIC||
    JSON.stringify(visit.details?.actualWounds)!==JSON.stringify(c.wounds)||
    hash(visit)!==r.consultHash)
  throw Error('The original Critical attack and actual in-person clinic consultation cannot be authenticated');
 return {sourceHash:r.originalAttackHash,consultHash:r.consultHash,referral:r};
}
module.exports={prepare,verify};
