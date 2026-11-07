'use strict';
// No registration of arbitrary branches/potential/conditions by a live rule
// caller. The GM-sealed branch assessment is authoritative at registration.
const C=require('./core'),P=require('./progress'),W=require('./world');
function record(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>!['beastId','branchId'].includes(k)))
  throw Error('Evolution registration takes only beastId and branchId; grade, conditions and form must be precommitted');
 const b=s.beasts?.[p.beastId];
 if(!b||typeof p.branchId!=='string')throw Error('Known beast and authored evolution branch ID required');
 const a=b.evolutionBranchAssessments?.[p.branchId];
 if(!a||a.used||a.beastId!==p.beastId||a.branchId!==p.branchId||
    a.species!==b.species||a.evolutionStage!==b.evolutionStage||
    !Number.isInteger(a.worldMinute)||a.worldMinute<0||a.worldMinute>s.world.minutes||
    typeof a.source!=='string'||a.source.trim().length<18||
    !a.parameters||typeof a.parameters!=='object'||Array.isArray(a.parameters)||
    a.parameters.beastId!==p.beastId||a.parameters.branchId!==p.branchId)
  throw Error('Evolution requires a pre-established source-attributed branch assessment for the current beast and form');
 // A playable branch must already have coherent biological consequences
 // and independently measured physiology. Formula-only empty registration is
 // reserved for offline reference tests, not live evolution opportunities.
 if(!a.parameters.formProfile||!a.parameters.eventStats)
  throw Error('Live evolution registration requires a pre-authored full biological form and physiological profile');
 const original=JSON.stringify(a.parameters);
 const params=JSON.parse(original);
 // A source-bounded authored profile is still checked by the actual
 // evolution rule implementation (conditions, genuine anatomy and Grade).
 const r=P.register(s,params);
 const branch=P.get(s,r.key);
 branch.originAssessment={
  source:a.source.trim().slice(0,180),worldMinute:a.worldMinute,
  species:a.species,evolutionStage:a.evolutionStage};
 a.used=true;
 return {...r,precommitted:true};
}
function advance(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>!['key','days'].includes(k)))
  throw Error('Maturity acceleration inputs are not caller-selectable; provide only an existing branch key and elapsed days');
 const r=P.get(s,p.key),b=s.beasts?.[r.beastId];
 if(!b||!r.originAssessment||typeof r.originAssessment.source!=='string'||
    r.originAssessment.source.trim().length<18||
    r.originAssessment.species!==b.species||r.originAssessment.evolutionStage!==b.evolutionStage)
  throw Error('Unreconciled evolution branch lacks an established source-bound current form');
 if(r.evolved||r.blocked)throw Error('Closed or evolved branches cannot gain Maturity');
 C.int(p.days,'actually elapsed Maturity days',1,6);
 // Only real saved synchronisation and independently precommitted documented
 // branch status may accelerate maturity. Locale, materials and special
 // matched training cannot be claimed as free flags until they have their
 // own actual evidence/consumption procedures.
 const bond=s.table?.bondRecords?.[r.beastId];
 const synced=Number.isInteger(b?.syncStage)&&Number.isInteger(bond?.syncStage)&&
    bond.syncStage===b.syncStage&&s.player.partnerIds?.includes(r.beastId)
  ?C.int(b.syncStage,'verified partner sync stage',0,10):0;
 const verified={syncStage:synced,documented:r.documented===true,
  vaelRich:false,branchResources:false,matchedTraining:false,daysPerYear:365};
 const result=P.maturityAdvance(r,p.days,verified);
 const elapsed=W.advance(s,p.days);
 return {...result,elapsedDays:elapsed.elapsedDays,
  acceleration:{verifiedSyncStage:synced,documented:verified.documented,
   environmentalBonus:0,resourceBonus:0,matchedTrainingBonus:0,daysPerYear:365}};
}
module.exports={record,advance};
