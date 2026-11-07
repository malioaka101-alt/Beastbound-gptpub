'use strict';
// A historical HP-to-wound adjudication is an observed, previously committed
// checkpoint fact, not a free choice of zero wounds or a fresh invented reason.
const C=require('./core'),U=require('./unified');
function migrate(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length!==0)
  throw Error('Legacy wound migration accepts no chosen wound boxes or narration; require a prior witnessed adjudication');
 if(s.battle||s.encounter)
  throw Error('Legacy wounds must be reconciled outside an unresolved encounter');
 if(s.table?.combatants?.player)
  throw Error('Wound combatant already exists; do not convert the same injury twice');
 const health=C.int(s.player?.health,'current legacy HP',0,100000);
 const max=C.int(s.player?.maxHealth,'recorded legacy maximum HP',1,100000);
 if(health>=max)throw Error('No historical HP deficit needs wound adjudication; use health.ensurePlayer');
 const r=s.table?.legacyWoundAdjudication;
 if(!r||r.used||r.origin!=='prior-independent-injury-ruling'||
    !Number.isInteger(r.worldMinute)||r.worldMinute<0||r.worldMinute>s.world.minutes||
    !Number.isInteger(r.hp)||r.hp!==health||!Number.isInteger(r.maxHp)||r.maxHp!==max||
    typeof r.source!=='string'||r.source.trim().length<18||
    typeof r.reason!=='string'||r.reason.trim().length<12||
    typeof r.adjudicatedBy!=='string'||r.adjudicatedBy.trim().length<6||
    !Array.isArray(r.wounds)||r.wounds.length!==3||
    r.wounds.some(x=>!Number.isInteger(x)||x<0)||
    r.wounds.every(x=>x===0))
  throw Error('A source-recorded prior injury adjudication matching exact legacy HP is required');
 // The actual wound model checks that the adjudicated boxes fit human
 // anatomy; an over-capacity ruling cannot be silently clipped to fit.
 const result=U.migrateLegacy(s,{wounds:[...r.wounds],reason:r.reason});
 r.used=true;r.migratedAtMinute=s.world.minutes;
 return {...result,previouslyAdjudicated:true,source:r.source,adjudicatedBy:r.adjudicatedBy};
}
module.exports={migrate};
