
'use strict';
// Historical truth, interpretation and causal effects remain separate.
// The GM authors facts; this is an existing-Atlas/world-ledger adapter.
const Crypto=require('node:crypto'),A=require('./atlas'),Houses=require('./social-houses');
const SOURCE='gm-causal-atlas-history-v1',sha=o=>Crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex');
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{3,79}$/.test(x);
const phrase=(x,a=8,b=900)=>typeof x==='string'&&x.trim().length>=a&&x.trim().length<=b;
const visibility=['public','gm-only'];
const keys=(p,required,optional=[])=>{
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).some(x=>![...required,...optional].includes(x))||required.some(x=>!Object.hasOwn(p,x)))
 throw Error('History accepts only the established GM-authored event, cause, interpretation or effect fields');
};
const ANCHORS=[['age_first_paths','Age of First Paths'],['estuary_wars','Estuary Wars'],['ash_years','Ash Years'],['longwinter_covenant','Longwinter Covenant'],['current_century','Current Century']];
function entity(type,value){
 if(!id(value))return null;
 if(type==='region')return A.R[value]?.name||null;
 if(type==='polity')return A.P[value]?.name||null;
 if(type==='institution')return A.I[value]?.name||null;
 if(type==='house')return Houses.byId[value]?.name||null;
 if(type==='culture')return A.C[value]?.name||null;
 if(type==='mythic-site')return require('./mythic').SITES.find(x=>x.id===value)?.name||null;
 return null;
}
function sealed(x,parts){return {...x,sourceHash:sha(x),...parts};}
function example(eraId,era){
 const a=A.history.find(e=>e.era===era);
 if(!a)throw Error('Missing original Atlas historical era');
 const origin={source:SOURCE,id:eraId,era,period:a.period,account:a.event,year:null,
  scopeType:null,scopeId:null,causes:[],visibility:'public',recordedMinute:0,
  basis:'Original Atlas.history before campaign creation',originType:'atlas'};
 return sealed(origin,{interpretations:[],effects:[]});
}
function exampleEffect(e,targetType,targetId,dimension,change,continuity){
 const record={source:SOURCE,id:e.id+'_'+dimension,eventId:e.id,targetType,targetId,
  targetName:entity(targetType,targetId),dimension,change,continuity,precededBy:null,
  basis:'Original Atlas.history and its region, polity or institution roots',
  visibility:'public',recordedMinute:0};
 return {...record,seal:sha(record)};
}
function seed(){
 const events=Object.fromEntries(ANCHORS.map(([id,era])=>[id,example(id,era)]));
 events.estuary_wars.effects.push(exampleEffect(events.estuary_wars,'region','morrowfen_basin','passage-rights',
  'The Seven Estuary Treaty established enforceable passage rights after the wars.',
  'Modern passage rights and river disputes reflect that historical settlement.'));
 events.ash_years.effects.push(exampleEffect(events.ash_years,'polity','cinder_free','political-reorganisation',
  'A failed volcanic empire gave way to guild republics in Kareth.',
  'Guild charters and workshops are part of the modern government.'));
 events.longwinter_covenant.effects.push(exampleEffect(events.longwinter_covenant,'polity','whitewake','winter-refuge',
  'The covenant admitted migratory nonhuman communities to rescue networks.',
  'Modern winter refuge obligations include people of other species.'));
 return {source:SOURCE,version:1,events};
}
function peek(s){return s.table?.realm?.causalHistory||null;}
function inspect(s){return peek(s)||seed();}
function originValid(e){
 if(!e||!id(e.id)||!phrase(e.era,4,120)||!phrase(e.period,4,150)||
  !phrase(e.account,16,1200)||!phrase(e.basis,12,800)||
  !visibility.includes(e.visibility)||!Number.isInteger(e.recordedMinute)||e.recordedMinute<0||
  !(e.year===null||Number.isInteger(e.year)&&e.year>=-100000&&e.year<=100000)||
  !['atlas','gm'].includes(e.originType)||!Array.isArray(e.causes)||e.causes.length>16)return false;
 const {sourceHash,interpretations,effects,...before}=e;
 return before.source===SOURCE&&sourceHash===sha(before);
}
function childValid(r,eventId){
 if(!r||r.source!==SOURCE||r.eventId!==eventId||!id(r.id)||!visibility.includes(r.visibility)||
  !Number.isInteger(r.recordedMinute)||r.recordedMinute<0)return false;
 const {seal,...value}=r;return seal===sha(value);
}
function validate(h){
 if(!h||h.source!==SOURCE||h.version!==1||!h.events||Array.isArray(h.events))throw Error('Invalid saved historical state');
 for(const [k,e] of Object.entries(h.events)){
  if(k!==e?.id||!originValid(e)||e.scopeType!==null&&!entity(e.scopeType,e.scopeId)||
   !Array.isArray(e.interpretations)||!Array.isArray(e.effects)||
   e.interpretations.length>200||e.effects.length>200||
   e.interpretations.some(r=>!childValid(r,k)||!phrase(r.speaker,3,160)||!phrase(r.claim,15,900)||!phrase(r.basis,12,600))||
   e.effects.some(r=>!childValid(r,k)||!entity(r.targetType,r.targetId)||!id(r.dimension)||
    !phrase(r.change,15,900)||!phrase(r.continuity,12,850)||!phrase(r.basis,12,650))||
   e.causes.some(x=>!h.events[x]||x===k)||
   new Set(e.causes).size!==e.causes.length)throw Error('Historical source, cause, testimony or lasting effect has been altered');
  const impacts=new Set();
  for(const r of e.effects){
   if(impacts.has(r.id)||r.precededBy&&!impacts.has(r.precededBy))throw Error('Historical effect succession is inconsistent');
   impacts.add(r.id);
  }
  for(const x of e.causes)if(e.year!==null&&h.events[x].year!==null&&h.events[x].year>e.year)
   throw Error('Historical consequence predates its established cause');
 }
 const done=new Set(),active=new Set();
 function walk(k){
  if(active.has(k))throw Error('Circular historical causality is impossible');
  if(done.has(k))return;
  active.add(k);for(const c of h.events[k].causes)walk(c);
  active.delete(k);done.add(k);
 }
 for(const k of Object.keys(h.events))walk(k);
 return true;
}
function ensure(s){
 const w=require('./simulation').ensure(s);
 w.causalHistory||=seed();
 validate(w.causalHistory);
 return w.causalHistory;
}
function publicEvent(e){
 return {id:e.id,era:e.era,period:e.period,account:e.account,causes:e.causes,
  interpretations:e.interpretations.filter(x=>x.visibility==='public').map(x=>({id:x.id,speaker:x.speaker,claim:x.claim,basis:x.basis})),
  effects:e.effects.filter(x=>x.visibility==='public').map(x=>({id:x.id,targetType:x.targetType,targetId:x.targetId,dimension:x.dimension,change:x.change,continuity:x.continuity,precededBy:x.precededBy}))};
}
function status(s,p={}){
 keys(p,[],['eventId','targetType','targetId']);
 const h=inspect(s);validate(h);
 if(p.eventId!==undefined){
  const e=h.events[p.eventId];
  return e?.visibility==='public'?{known:true,event:publicEvent(e)}:{known:false};
 }
 if(p.targetType!==undefined||p.targetId!==undefined){
  if(!entity(p.targetType,p.targetId))throw Error('An actual existing atlas subject is required for historical context');
  const effects=Object.values(h.events).filter(e=>e.visibility==='public')
   .flatMap(e=>e.effects.filter(x=>x.visibility==='public'&&x.targetType===p.targetType&&x.targetId===p.targetId)
    .map(x=>({eventId:e.id,era:e.era,dimension:x.dimension,change:x.change,continuity:x.continuity,precededBy:x.precededBy})));
  return {targetType:p.targetType,targetId:p.targetId,name:entity(p.targetType,p.targetId),effects};
 }
 return {events:Object.values(h.events).filter(e=>e.visibility==='public').map(publicEvent)};
}
function recordEvent(s,p={}){
 keys(p,['eventId','era','period','account','basis'],['year','scopeType','scopeId','causes','visibility']);
 if(!id(p.eventId)||!phrase(p.era,4,120)||!phrase(p.period,4,150)||
  !phrase(p.account,16,1200)||!phrase(p.basis,12,800)||!visibility.includes(p.visibility||'public')||
  !(p.year===undefined||Number.isInteger(p.year)&&p.year>=-100000&&p.year<=100000)||
  p.scopeType!==undefined&&!entity(p.scopeType,p.scopeId)||
  p.scopeId!==undefined&&p.scopeType===undefined)
  throw Error('A GM-authored event needs an established time, genuine context and source account');
 const causes=p.causes??[],h=ensure(s);
 if(!Array.isArray(causes)||causes.length>16||new Set(causes).size!==causes.length||
  causes.some(c=>!h.events[c]))throw Error('Historical causes must already exist and be independent');
 if(h.events[p.eventId])throw Error('A witnessed history cannot be silently rewritten');
 const year=p.year??null;
 if(year!==null&&causes.some(c=>h.events[c].year!==null&&h.events[c].year>year))
  throw Error('An established historical cause cannot happen later than its effect');
 const current=require('./simulation').calendar(s);
 if(year!==null&&current.absoluteDate&&year>current.date?.year)
  throw Error('A historical past event cannot be invented in the campaign future');
 const base={source:SOURCE,id:p.eventId,era:p.era.trim(),period:p.period.trim(),
  account:p.account.trim(),basis:p.basis.trim(),year,scopeType:p.scopeType??null,
  scopeId:p.scopeId??null,causes:[...causes],visibility:p.visibility||'public',
  recordedMinute:s.world.minutes,originType:'gm'};
 h.events[p.eventId]=sealed(base,{interpretations:[],effects:[]});
 return {recorded:true,eventId:p.eventId,causes:causes.length,noResourcesAwarded:true};
}
function interpret(s,p={}){
 keys(p,['eventId','accountId','speaker','claim','basis'],['visibility']);
 if(!id(p.accountId)||!phrase(p.speaker,3,160)||!phrase(p.claim,15,900)||
  !phrase(p.basis,12,600)||!visibility.includes(p.visibility||'public'))
  throw Error('A historical interpretation needs a real attributed source and claim');
 const h=ensure(s),e=h.events[p.eventId];if(!e)throw Error('Unknown historical event');
 if(p.visibility==='public'&&e.visibility==='gm-only')throw Error('Cannot reveal a hidden historical event');
 if(e.interpretations.some(x=>x.id===p.accountId))throw Error('Original testimony cannot be overwritten');
 const r={source:SOURCE,id:p.accountId,eventId:e.id,speaker:p.speaker.trim(),claim:p.claim.trim(),
  basis:p.basis.trim(),visibility:p.visibility||'public',recordedMinute:s.world.minutes};
 e.interpretations.push({...r,seal:sha(r)});
 return {recorded:true,eventId:e.id,notAnObjectiveFact:true};
}
function effect(s,p={}){
 keys(p,['eventId','effectId','targetType','targetId','dimension','change','continuity','basis'],['visibility','precededBy']);
 if(!id(p.effectId)||!id(p.dimension)||!entity(p.targetType,p.targetId)||
  !phrase(p.change,15,900)||!phrase(p.continuity,12,850)||!phrase(p.basis,12,650)||
  !visibility.includes(p.visibility||'public'))throw Error('An effect needs a real existing place, institution, family, culture or polity and source');
 const h=ensure(s),e=h.events[p.eventId];if(!e)throw Error('Historical consequence needs an established actual cause');
 if(p.visibility==='public'&&e.visibility==='gm-only')throw Error('Hidden cause cannot become public through an effect');
 if(e.effects.some(x=>x.id===p.effectId))throw Error('Original historical influence cannot be replaced');
 if(p.precededBy!==undefined&&!e.effects.some(x=>x.id===p.precededBy))
  throw Error('Changing an influence needs the previous saved effect');
 const r={source:SOURCE,id:p.effectId,eventId:e.id,targetType:p.targetType,targetId:p.targetId,
  targetName:entity(p.targetType,p.targetId),dimension:p.dimension,change:p.change.trim(),
  continuity:p.continuity.trim(),basis:p.basis.trim(),precededBy:p.precededBy??null,
  visibility:p.visibility||'public',recordedMinute:s.world.minutes};
 e.effects.push({...r,seal:sha(r)});
 return {recorded:true,effectId:p.effectId,recordedContextOnly:true,
  noAutomaticOfficeTransfer:true,noAutomaticMaterialReward:true};
}
module.exports={SOURCE,ANCHORS,seed,peek,ensure,validate,status,recordEvent,interpret,effect};
