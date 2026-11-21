'use strict';
// Restricted original native self-rite, separate from human-assisted evolution.
// Same-species forms only: retain the actual individual's ecological and
// learned history. Protected/sapient, genetic species changes and medical
// transfer of wounds require separate original owners.
const Crypto=require('node:crypto'),E=require('../engine'),C=require('./core'),
 P=require('./progress'),B=require('./bonds'),Branch=require('./evolution-branch-web'),
 M=require('./independent-original-beast-maturity'),Agency=require('./beast-agency'),
 Wild=require('../world/wild-lives'),W=require('./world');
const ORIGIN='source-earned-native-individual-self-evolution-v1',
 WITNESS='gm-observed-native-independent-self-rite-opportunity-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 int=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b,
 prose=x=>typeof x==='string'&&x.trim().length>=25&&x.length<=900;
const contexts=new WeakMap();
// Same bounded opportunity-selection propensity used by actual native
// autonomous technique expression; it is NOT a biological success bonus,
// human persuasion or consent to any human contract.
const CHANCE=.42;
function acceptedContext(s,r,b,source){
 const a=contexts.get(r);
 return !!a&&a.s===s&&a.b===b&&a.source===source&&a.q.accepted===true;
}
function plan(s,r,b){
 const a=b.evolutionBranchAssessments?.[r.branchId];
 if(!a||!r.branching||!r.independentMaturity||!M.verify(s,r,b))return null;
 let z;try{z=Branch.validated(a,b)}catch{return null;}
 const q=z.source,k=q.parameters;
 if(z.seal!==r.branching.seal||q.sourceSpecies!==b.species||
  k.kind!=='normal'&&k.kind!=='standard'&&k.kind!=='environmental'&&k.kind!=='dietary'||
  !eq(k.conditions,r.conditions)||r.conditions.some(x=>!x.met)||
  !eq(k.formProfile,r.formProfile)||r.formProfile.species!==b.species||
  r.formProfile.formName===q.sourceStage||
  r.formProfile.maxEnergy<q.ecology.riteEnergy||
  k.grade!==r.grade||k.kind!==r.kind||k.potential!==r.potential||
  k.gradeCeiling!==r.gradeCeiling||k.documented!==r.documented||
  k.specialConditionsMet!==r.specialConditionsMet||
  k.eventStats.vigor!==r.eventStats?.vigor||k.eventStats.will!==r.eventStats?.will||
  !int(k.eventStats.vigor,-10,20)||!int(k.eventStats.will,-10,20))return null;
 return q;
}
function witnessValid(w,b,r,q){
 const d=w?.details;
 return w?.type==='story'&&prose(w.text)&&w.text.includes(b.name)&&
  w.day===Math.floor(q.minute/1440)+1&&w.time===E.clock({world:{minutes:q.minute}})&&
  d?.origin===WITNESS&&d.beastId===b.id&&d.branchId===r.branchId&&
  d.species===q.species&&d.form===q.formBefore&&d.targetForm===r.formProfile.formName&&
  d.location===q.location&&d.measuredSapience===q.sapience&&
  d.selfInitiatedOpportunity===true&&d.noExternalHandlerOrCatalyst===true&&
  prose(d.observedBehaviour)&&prose(d.physiologicalOpportunity)&&prose(d.independentLimit);
}
function snapshot(b){
 return {species:b.species,form:b.evolutionStage,energy:b.energy,maxEnergy:b.maxEnergy,
  hp:b.hp,maxHp:b.maxHp,condition:b.condition};
}
function gateAt(r,years){
 return P.status({...r,years,blocked:false});
}
function resultFrom(r,years,rng){
 const synthetic={...r,years,blocked:false},sp=P.evolutionTrialSpec(synthetic,0),
  gate=gateAt(r,years),rolls=[];
 for(let i=0;i<sp.trials;i++){
  const roll=C.die(rng),total=roll+sp.modifier+C.naturalAdjustment(roll);
  rolls.push({roll,total,degree:C.degree(total-sp.dc)});
 }
 const successes=rolls.filter(x=>x.total>=sp.dc).length,
  severe=rolls.some(x=>x.degree==='severe failure');
 let outcome,complication=null;
 // All non-time requirements are independently established and immutable
 // for this restricted route; unknown-condition forms stay with the PC owner.
 if(gate.unknownUnmet)return null;
 if(successes>=sp.needed)outcome=successes===sp.trials&&rolls.some(x=>x.degree==='exceptional')?'evolved with bonus pending':'evolved';
 else if(!severe)outcome='stalled until next season';
 else{
  const roll=C.die(rng),condition=roll<=6?'illness':roll<=10?'lost technique':roll<=13?'malformation':roll<=16?'permanent branch closure':roll<=19?'twisted branch':'critical collapse';
  complication={roll,condition,requiresAdjudication:condition!=='permanent branch closure'};
  outcome='failed evolution: '+condition;
 }
 return {outcome,dc:sp.dc,successes,needed:sp.needed,rolls,complication};
}
function verify(s,r,b){
 if(r?.nativeSelfRite===undefined)return true;
 try{
  const z=plan(s,r,b),l=r.nativeSelfRite;
  if(!z||l.origin!==ORIGIN||l.branchSeal!==r.branching.seal||
   l.lifeSeal!==b.individualLife.sourceHash||!Array.isArray(l.rows)||!l.rows.length||l.rows.length>480)return false;
  let last=-1,head=l.lifeSeal,formed=false,latestAccepted=null,stalledUntil=0,terminal=false;
  const used=new Set();
  for(const row of l.rows){
   const q=row?.source;
   if(!q||row.seal!==hash(q)||q.origin!==ORIGIN||q.previous!==head||
    q.beastId!==b.id||q.branchSeal!==l.branchSeal||q.lifeSeal!==l.lifeSeal||formed||terminal||
    !int(q.minute,last+1,s.world.minutes)||q.minute%1440+180>1440||
    Math.floor(q.minute/1440)+1<stalledUntil||
    q.species!==z.sourceSpecies||q.formBefore!==z.sourceStage||!int(q.sapience,0,1)||q.sapience!==b.sapience||
    !E.LOCATIONS[q.location]?.spawns?.includes(q.species)||!witnessValid(q.witness,b,r,q)||
    q.witnessHash!==hash(q.witness)||used.has(q.witnessHash)||q.noHumanConsentOrResources!==true||
    !int(q.rngBefore,1,4294967295)||q.chance!==CHANCE||
    !Number.isFinite(q.years)||q.years<0||q.years>r.requiredYears||q.years>r.years||
    !int(q.before?.energy,z.ecology.riteEnergy,q.before?.maxEnergy)||
    !int(q.before.condition,60+z.ecology.riteCondition,100)||
    !int(q.before.hp,1,q.before.maxHp)||q.before.species!==q.species||q.before.form!==q.formBefore||
    q.ecology?.regionId!==z.ecology.regionId||
    !['forage','water','quality','pressure'].every(k=>int(q.ecology[k],0,100))||
    q.ecology.forage<z.ecology.minForage||q.ecology.water<z.ecology.minWater||
    q.ecology.quality<z.ecology.minQuality||q.ecology.pressure>z.ecology.maxPressure)return false;
   // Maturity at the original moment, never later training added retroactively.
   const matured=r.independentMaturity.rows.filter(x=>x.source.day*1440<=q.minute).at(-1);
   if(q.years!==(matured?.source.after??0))return false;
   const rng={rngState:q.rngBefore},choice=Wild._debug.draw(rng);
   if(q.choice!==choice||q.accepted!==(choice<CHANCE))return false;
   const result=q.accepted?resultFrom(r,q.years,rng):null;
   if(q.rngAfter!==rng.rngState||!eq(q.result,result)||
    q.minutes!==(q.accepted?180:5)||q.minute+q.minutes>s.world.minutes)return false;
   const expected={...q.before};
   if(q.accepted){
    latestAccepted=q;
    formed=result.outcome==='evolved'||result.outcome==='evolved with bonus pending';
    if(formed){
     expected.form=r.formProfile.formName;expected.maxHp=r.formProfile.maxHp;expected.maxEnergy=r.formProfile.maxEnergy;
     expected.hp=Math.min(expected.maxHp,expected.hp);expected.energy=Math.min(expected.maxEnergy,expected.energy);
    }else if(result.complication){
     if(result.complication.condition==='illness')expected.condition=Math.max(0,expected.condition-20);
     // Any unresolved severe case requires its own genuine treatment owner.
     terminal=true;
    }else stalledUntil=Math.floor(q.minute/1440)+1+90;
    expected.energy-=z.ecology.riteEnergy;expected.condition-=z.ecology.riteCondition;
    const a=q.ecologicalReceipt;
    if(!a||a.origin!==Branch.ECO||a.branchId!==r.branchId||a.sourceSeal!==l.branchSeal||
     a.worldMinute!==q.minute||a.attempt!==result.outcome||
     a.energySpent!==z.ecology.riteEnergy||a.conditionSpent!==z.ecology.riteCondition||
     a.afterEnergy!==expected.energy||a.afterCondition!==expected.condition||
     !eq(a.originalEcology,q.ecology)||a.seal!==hash(Object.fromEntries(Object.entries(a).filter(([k])=>k!=='seal'))))return false;
   }else if(q.ecologicalReceipt!==null)return false;
   if(!eq(q.after,expected))return false;
   head=row.seal;last=q.minute+q.minutes-1;used.add(q.witnessHash);
  }
  if(l.head!==head||!!r.evolved!==formed)return false;
  if(latestAccepted&&(!eq(r.branchAttemptOutcome,latestAccepted.ecologicalReceipt)||
    r.lastEvent?.outcome!==latestAccepted.result.outcome||!eq(r.lastEvent?.complication,latestAccepted.result.complication)))return false;
  if(formed){
   const h=b.evolutionHistory?.find(x=>x.branchId===r.branchId);
   if(!h||h.old.species!==z.sourceSpecies||h.old.evolutionStage!==z.sourceStage||
    h.form!==r.formProfile.formName||h.branchWorldSource!==latestAccepted.ecologicalReceipt.seal||
    b.evolutionStage!==h.form||!Branch.ecoVerify(s,b))return false;
  }
  return true;
 }catch{return false;}
}
function attempt(s,{key,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof key!=='string'||!int(witnessIndex,0,s.log.length-1))
  throw Error('Only the registered native evolutionary branch and fresh self-rite witness are accepted');
 const r=P.get(s,key),b=s.beasts?.[r.beastId],z=b&&plan(s,r,b),minute=s.world.minutes,
  life=b?.individualLife,witness=structuredClone(s.log[witnessIndex]);
 if(!z||!life||b.gmWild||b.generatedWild||b.sapientLife||!int(b.sapience,0,1)||
  E.SPECIES[b.species]?.intelligence==='sapient'||b.owner!==null||b.relationship!=='wild'||
  b.consent===true||s.player.partnerIds?.includes(b.id)||s.table?.bondRecords?.[b.id]?.contract||
  b.away===true||b.location!==s.world.location||!E.LOCATIONS[b.location]?.spawns?.includes(b.species)||
  s.battle||s.encounter||r.evolved||r.blocked||r.pendingTransformation||
  r.stalledUntilDay&&E.day(s)<r.stalledUntilDay||
  b.evolutionStage!==z.sourceStage||!int(b.hp,1,b.maxHp)||
  b.condition<60||!int(b.needs?.hunger,0,69)||!int(b.needs?.fatigue,0,69)||
  b.injuries?.length||b.conditions?.length||
  /hostile|terrified|panicked|fleeing|desperate/i.test(String(b.mood))||
  b.agencyBoundaries?.avoid?.includes('evolution_rite')||
  minute%1440+180>1440||!verify(s,r,b)||
  (r.nativeSelfRite?.rows||[]).some(x=>x.source.result?.complication||
   Math.floor(x.source.minute/1440)===Math.floor(minute/1440)))
  throw Error('Actual healthy present uncontracted native animal, measured S0/S1, original viable same-species branch and unused rite day required');
 const combat=s.table?.combatants?.['beast:'+b.id];
 if(combat&&(combat.status!=='ok'||combat.wounds?.some(x=>x!==0)))
  throw Error('Native transformation requiring wound transfer is not yet supported');
 const context=Branch.beforeEvent(s,r,b);
 const l=r.nativeSelfRite||{origin:ORIGIN,branchSeal:r.branching.seal,lifeSeal:life.sourceHash,rows:[],head:life.sourceHash};
 const q={origin:ORIGIN,previous:l.head,beastId:b.id,branchSeal:l.branchSeal,lifeSeal:l.lifeSeal,
  minute,location:b.location,species:b.species,formBefore:b.evolutionStage,sapience:b.sapience,
  witness,witnessHash:hash(witness),years:r.years,ecology:structuredClone(context.ecologicalSnapshot),
  before:snapshot(b),chance:CHANCE,noHumanConsentOrResources:true};
 if(l.rows.length>=480||l.rows.some(x=>x.source.witnessHash===q.witnessHash)||!witnessValid(witness,b,r,q))
  throw Error('Fresh actual individually observed voluntary native self-rite opportunity required');
 q.rngBefore=life.rngState;q.choice=Wild._debug.draw(life);q.accepted=q.choice<CHANCE;
 q.result=null;q.ecologicalReceipt=null;q.minutes=q.accepted?180:5;
 if(q.accepted){
  const source='Individually witnessed native self-rite '+q.witnessHash;
  contexts.set(r,{s,b,source,q});
  let out;
  try{out=P.nativeEvolutionEvent(s,r,source,life);}finally{contexts.delete(r);}
  Branch.afterEvent(s,r,b,out,context);
  q.result={outcome:out.outcome,dc:out.dc,successes:out.successes,needed:out.needed,rolls:out.rolls,complication:out.complication};
  q.ecologicalReceipt=structuredClone(r.branchAttemptOutcome);
 }
 q.rngAfter=life.rngState;q.after=snapshot(b);
 const seal=hash(q);l.rows.push({source:q,seal});l.head=seal;r.nativeSelfRite=l;
 E.advance(s,q.minutes);W.finalizeTime(s,minute);
 if(!verify(s,r,b))throw Error('Original independent native self-evolution source failed replay');
 return {independentlyAccepted:q.accepted,elapsedMinutes:q.minutes,
  observedOutcome:q.result?.outcome??'declined',noHumanConsentOrResources:true};
}
module.exports={ORIGIN,WITNESS,acceptedContext,attempt,verify};
