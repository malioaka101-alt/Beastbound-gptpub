'use strict';
// Live source-backed gates for 04 §6.6 Maturity bypasses. The raw rules in
// progress.js remain mathematical references, not public evidence authors.
const E=require('../engine.js'),C=require('./core'),P=require('./progress'),W=require('./world');
const PORTABLE=new Set(['relic','fossil','remains']);
const RITUAL_SITES=new Set(['ruin','sacred_site']);
function season(s){
 const anchor=s.table?.realm?.calendarAnchor;
 if(!anchor||!anchor.date||!Number.isInteger(anchor.atCompletedDay))
  throw Error('A source-anchored in-world calendar is required before a seasonal ripening dose');
 const days=Math.floor(s.world.minutes/1440)-anchor.atCompletedDay;
 if(days<0)throw Error('Calendar precedes its established date');
 const date=W.addDate(anchor.date,days);
 const type=date.month<=2||date.month>=11?'winter':date.month<=4?'spring':date.month<=7?'summer':'autumn';
 const cycleYear=type==='winter'&&date.month<=2?date.year-1:date.year;
 return cycleYear+':'+type;
}
function current(s,key){
 const r=P.get(s,key),b=s.beasts?.[r.beastId];
 if(!b||!r.originAssessment||r.evolved||r.blocked||
    r.originAssessment.species!==b.species||r.originAssessment.evolutionStage!==b.evolutionStage)
  throw Error('Evolution shortcut requires a current, authenticated precommitted beast branch');
 if(s.battle)throw Error('Cannot conduct Maturity rites during combat');
 if(b.away===true||(b.location&&b.location!==s.world.location)||
    (s.encounter?.beastId!==b.id&&!s.player.partnerIds?.includes(b.id)))
  throw Error('The beast must be physically present for its Maturity rite');
 if(!Number.isInteger(b.sapience)||b.sapience>1)
  throw Error('Protected or sapient beasts require a separately verified rite and independent consent');
 if(b.consent!==true||(b.condition!==undefined&&b.condition<60))
  throw Error('Rite requires prior recorded voluntary willingness and sufficient health');
 return {r,b};
}
function input(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).some(k=>k!=='key'))
  throw Error('Maturity bypass takes only an existing branch key; season, modifier and source cannot be supplied by the caller');
 if(typeof p.key!=='string')throw Error('Established evolution branch key required');
}
function ripening(s,p={}){
 input(p);const {r,b}=current(s,p.key),cycle=season(s);
 const proof=b.ripeningDoseAssessments?.[r.branchId];
 if(!proof||proof.used||proof.beastId!==b.id||proof.branchId!==r.branchId||
    proof.species!==b.species||proof.evolutionStage!==b.evolutionStage||
    proof.seasonKey!==cycle||proof.item!=='ripening_fruit'||proof.beastWilling!==true||
    !Number.isInteger(proof.worldMinute)||proof.worldMinute<0||proof.worldMinute>s.world.minutes||
    typeof proof.source!=='string'||proof.source.trim().length<18)
  throw Error('A previously recorded, season-specific lawful Ripening source and willing beast are required');
 if(!Number.isInteger(s.player.inventory?.ripening_fruit)||s.player.inventory.ripening_fruit<1)
  throw Error('A real independently sourced Ripening fruit must be in inventory');
 s.table||={};const used=s.table.beastRipeningSeasons||{};
 if(used[b.id]?.[cycle]||r.ripeningSeasons.includes(cycle))
  throw Error('This individual beast already received its one seasonal Ripening dose');
 const vigor=r.eventStats?.vigor;
 C.int(vigor,'verified beast Vigor',-10,20);
 const result=P.ripening(s,r,{season:cycle,available:true,modifier:vigor});
 s.table.beastRipeningSeasons||={};
 s.table.beastRipeningSeasons[b.id]||={};
 s.table.beastRipeningSeasons[b.id][cycle]=r.branchId;
 proof.used=true;proof.usedAtMinute=s.world.minutes;
 const old=s.world.minutes;E.advance(s,60);W.finalizeTime(s,old);
 C.event(s,'progress','An independently sourced seasonal Ripening dose was administered to '+b.name+'.',
  {beastId:b.id,branchId:r.branchId,season:cycle,condition:b.condition});
 return {...result,season:cycle,minutes:60,source:'precommitted seasonal fruit',vigorSource:r.eventStats.basis};
}
function patternEcho(s,p={}){
 input(p);const {r,b}=current(s,p.key),stage=b.evolutionStage||'Base';
 const proof=b.patternEchoAssessments?.[r.branchId];
 if(!proof||proof.used||proof.beastId!==b.id||proof.branchId!==r.branchId||
    proof.species!==b.species||proof.evolutionStage!==stage||
    proof.lineage!==b.lineage||proof.location!==s.world.location||
    !Number.isInteger(proof.worldMinute)||proof.worldMinute<0||proof.worldMinute>s.world.minutes||
    typeof proof.source!=='string'||proof.source.trim().length<18||
    !PORTABLE.has(proof.kind)&&!RITUAL_SITES.has(proof.kind))
  throw Error('Pattern Echo requires an earlier lineage-matched, source-recorded relic or site observation');
 if(PORTABLE.has(proof.kind)&&
    (typeof proof.item!=='string'||!Number.isInteger(s.player.inventory?.[proof.item])||
     s.player.inventory[proof.item]<1))
  throw Error('The established lineage-matched physical relic is not actually present');
 s.table||={};const used=s.table.beastPatternEchoStages||{};
 if(used[b.id]?.[stage]||r.echoStages.includes(stage))
  throw Error('This beast already attempted its one Pattern Echo for this evolutionary stage');
 const wis=C.int(s.player.attributes?.wis,'recorded Wisdom',1,30);
 const rank=Math.max(C.int(s.player.skills?.beastlore?.rank??0,'Beastlore rank',0,5),
  C.int(s.player.skills?.faithCosmology?.rank??0,'Faith & Cosmology rank',0,5));
 const modifier=Math.floor((wis-10)/2)+2*rank;
 const result=P.patternEcho(s,r,{modifier,source:proof.source});
 s.table.beastPatternEchoStages||={};s.table.beastPatternEchoStages[b.id]||={};
 s.table.beastPatternEchoStages[b.id][stage]=r.branchId;
 proof.used=true;proof.usedAtMinute=s.world.minutes;
 const old=s.world.minutes;E.advance(s,120);W.finalizeTime(s,old);
 C.event(s,'progress','The witnessed Pattern Echo rite concludes for '+b.name+'.',
  {beastId:b.id,branchId:r.branchId,stage,kind:proof.kind,degree:result.degree});
 return {...result,stage,minutes:120,sourceKind:proof.kind,modifierSource:'recorded Wisdom and earned Beastlore/Faith & Cosmology'};
}
module.exports={season,ripening,patternEcho};
