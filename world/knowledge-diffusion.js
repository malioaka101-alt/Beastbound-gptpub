'use strict';
// Verified mundane methods move along REAL cross-border routes: first a
// published field trial, then trade contact, local funded reproduction,
// independent failure/success, and eventual loss or recovery of adoption.
// Not universal magical tuition, secret knowledge or instant technologies.
const Crypto=require('node:crypto'),A=require('./atlas'),I=require('./agent-initiatives');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const clamp=(x,min=0,max=100)=>Math.max(min,Math.min(max,x));
const CHANNEL='published foreign vocational method reproduced by an existing local practitioner';
const PATHS=Object.freeze([
 Object.freeze({id:'reed_to_gulf',source:'reedmarch_field',destination:'saltleague',
   institution:'mirror_academy',reader:'saltleague_field',routeId:'trade_2',
   adaptation:'adapt wetland-crossing field inspections to coastal canal safety'}),
 Object.freeze({id:'gulf_to_reed',source:'saltleague_field',destination:'reedmarch',
   institution:'marsh_council',reader:'reedmarch_civic',routeId:'trade_2',
   adaptation:'adapt multilingual shipping accounts to public ferry tariffs'}),
 Object.freeze({id:'pass_to_vale',source:'crownspine_field',destination:'asterwyn',
   institution:'orchard_college',reader:'asterwyn_field',routeId:'trade_3',
   adaptation:'adapt mountain refuge checklists to upland orchard field evacuation'})
]);
const PATH=Object.freeze(Object.fromEntries(PATHS.map(x=>[x.id,x])));
function validatePath(spec){
 const route=A.tradeRoutes.find(x=>x.id===spec.routeId),source=I.SOURCES[spec.source];
 if(!route||!source||!A.P[spec.destination]||
   ![route.a,route.b].includes(spec.destination)||
   ![route.a,route.b].includes(source.polity)||
   source.polity===spec.destination||
   A.I[spec.institution]?.polity!==spec.destination||
   !spec.adaptation||!spec.reader)
  throw Error('Knowledge transfer requires a real adjacent nation, trade passage and distinct existing institution');
}
for(const spec of PATHS)validatePath(spec);
function seed(w){
 const slots={};
 for(const spec of PATHS){
  if(w.notables?.[spec.reader]?.polity!==spec.destination)
   throw Error('A documented local professional is needed to attempt adaptation');
  slots[spec.id]={id:spec.id,state:'unaware',
   sourceAttestation:null,work:0,spent:0,attempts:0,
   successes:0,failures:0,decayMonths:0,
   activeBonus:false,lastDecision:null,history:[]};
 }
 return {version:1,seededAtMonth:w.ticks.months,
  rngState:((w.worldSeed^0x621fc057)>>>0)||0x39c5bd12,
  slots,records:[],counter:0};
}
function ensure(w){
 if(w.knowledgeDiffusion===undefined)w.knowledgeDiffusion=seed(w);
 const t=w.knowledgeDiffusion;
 if(t.version!==1||!t.slots||!Array.isArray(t.records))
  throw Error('Historical knowledge-transfer ledger is not well formed');
 return t;
}
function random(t){
 let x=t.rngState>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 t.rngState=(x>>>0)||0x39c5bd12;
 return t.rngState/4294967296;
}
function sourceEventHash(r){
 return hash({id:r.id,day:r.day,month:r.month,
  actorId:r.actorId,actorName:r.actorName,polity:r.polity,
  kind:r.kind,source:r.source,method:r.method,context:r.context});
}
function genuinePublished(w,spec,day){
 const t=w.agentInitiatives;
 if(!t||!Array.isArray(t.records))return null;
 const p=t.projects?.[spec.source],original=I.SOURCES[spec.source];
 if(!p||!original||p.polity!==original.polity)return null;
 return t.records.find(r=>r.actorId===spec.source&&r.kind==='tested-method'&&
  r.method===p.method&&r.polity===p.polity&&
  r.source===I.SOURCE&&r.context?.success===true&&
  Number.isInteger(r.context.roll)&&r.context.roll>=1&&r.context.roll<=20&&
  Number.isInteger(r.context.dc)&&Number.isFinite(r.context.modifier)&&
  (r.context.roll===20||
    (r.context.roll!==1&&r.context.roll+r.context.modifier>=r.context.dc))&&
  r.hash===sourceEventHash(r)&&r.releaseDay<=day&&
  w.chronicle?.some(x=>x.subject==='agent-work:'+r.id&&
    x.region===r.polity&&x.day===r.day&&x.releaseDay===r.releaseDay&&
    x.text===r.publicText));
}
function attestation(slot){
 const a=slot.sourceAttestation;
 return !!(a&&a.id&&a.hash&&a.method&&a.sourcePolity&&
   slot.sourceAttestationHash===hash(a));
}
function record(w,t,slot,spec,day,kind,details,message,emit){
 const id='diffusion_'+(++t.counter),n=w.notables[spec.reader],
  row={id,kind,day,month:w.ticks.months,source:CHANNEL,
   originId:spec.source,originPolity:I.SOURCES[spec.source].polity,
   destination:spec.destination,readerId:spec.reader,
   readerName:n.name,routeId:spec.routeId,
   institutionId:spec.institution,sourceAttestationHash:slot.sourceAttestationHash,
   details};
 row.hash=hash(row);
 row.publicText=message||null;
 row.releaseDay=message?day+8:null;
 t.records.push(row);
 if(t.records.length>200)t.records.splice(0,t.records.length-200);
 slot.history.push({id,day,kind,hash:row.hash});
 if(slot.history.length>20)slot.history.splice(0,slot.history.length-20);
 if(message&&typeof emit==='function')
  emit({day,region:spec.destination,subject:'diffusion:'+id,
   text:message,channel:'guild report',releaseDay:row.releaseDay,severity:'routine'});
 return row;
}
function monthSlot(w,t,slot,spec,day,emit){
 const route=w.routes?.[spec.routeId],org=w.institutions?.[spec.institution],
  reader=w.notables?.[spec.reader],nation=w.countries?.[spec.destination];
 if(!route||!org||!reader||!nation)
  throw Error('A trade route, existing teacher, institution and polity must really exist');
 const open=!route.disrupted&&route.flow>=32&&route.risk<80;
 if(!attestation(slot)){
  if(slot.state!=='unaware')throw Error('A claimed imported method lacks its original source witness');
  const origin=genuinePublished(w,spec,day);
  if(!origin||!open)return;
  const source={id:origin.id,day:origin.day,method:origin.method,
   sourcePolity:origin.polity,hash:origin.hash,
   publishedOn:origin.releaseDay};
  slot.sourceAttestation=source;
  slot.sourceAttestationHash=hash(source);
  slot.state='heard';
  record(w,t,slot,spec,day,'courier-arrival',
   {routeFlow:route.flow,routeRisk:route.risk,
    genuineOriginEventHash:source.hash,sourcePublicationDay:source.publishedOn},
   null,emit);
  // Hearing a report does not automatically reproduce the method.
  return;
 }
 if(slot.state==='adopted'){
  // Actual lost access, closure or severe budget strain stops a practice.
  // Locally replicated knowledge can survive a foreign route closure while
  // its own teachers and materials remain adequately supported.
  const trouble=org.status!=='active'||org.funds<12||(!open&&org.funds<25);
  slot.decayMonths=trouble?slot.decayMonths+1:0;
  if(slot.decayMonths>=2){
   const before=org.capacity;
   if(slot.activeBonus){org.capacity=clamp(org.capacity-1);slot.activeBonus=false;}
   slot.state='lapsed';slot.work=0;slot.decayMonths=0;
   slot.lastDecision='local adoption suspended after sustained real disruption';
   record(w,t,slot,spec,day,'adoption-lapsed',
    {routeDisrupted:!open,institutionActive:org.status==='active',
     availableFunds:org.funds,capacityBefore:before,capacityAfter:org.capacity},
    reader.name+' reports that '+A.I[spec.institution].name+
    ' has suspended its adapted '+slot.sourceAttestation.method+
    ' practice following sustained practical disruption.',emit);
  }
  return;
 }
 if(!open||org.status!=='active'||reader.injuryMonths>0||org.funds<16){
  // An unadopted project can stall or lose momentum, not simply auto-complete.
  slot.decayMonths++;
  if(slot.decayMonths>=3&&slot.work>0){
   slot.work=Math.max(0,slot.work-1);
   slot.lastDecision='local trial delayed by trade, work or financial constraints';
  }
  return;
 }
 slot.decayMonths=0;
 // Existing local sponsor pays tangible resources to adapt foreign knowledge.
 const cost=org.funds>=40?3:2;
 org.funds-=cost;slot.spent+=cost;slot.work++;
 if(slot.work<3)return;
 slot.work=0;slot.attempts++;
 const roll=1+Math.floor(random(t)*20);
 const modifier=reader.professional.rank*2+
  (org.capacity>=60?2:0)+(route.flow>=55?1:0)+
  (nation.stability>=55?1:0)-(org.funds<20?2:0);
 const dc=15,success=roll===20||(roll!==1&&roll+modifier>=dc);
 const info={roll,modifier,dc,success,
  fundedBy:spec.institution,capacityBefore:org.capacity,
  costPerMonth:cost,totalSpent:slot.spent,
  practice:spec.adaptation,
  routeFlow:route.flow,routeRisk:route.risk};
 if(success){
  slot.successes++;slot.state='adopted';slot.lastDecision='locally reproduced after an actual professional trial';
  if(!slot.activeBonus){org.capacity=clamp(org.capacity+1);slot.activeBonus=true;}
  record(w,t,slot,spec,day,'method-adopted',
   {...info,capacityAfter:org.capacity,edition:slot.successes},
   reader.name+' demonstrates a locally tested adaptation of the '+slot.sourceAttestation.method+
   ' at '+A.I[spec.institution].name+
   '. The work travelled through a real trade route; it confers no supernatural technique.',emit);
 }else{
  slot.failures++;slot.state='reworking';
  slot.lastDecision='local replication failed; paid materials were spent';
  record(w,t,slot,spec,day,'replication-failed',info,
   slot.failures%2===0?
    reader.name+' reports a failed local reproduction attempt at '+
    A.I[spec.institution].name+'; the original method remains unproven in this region.':null,emit);
 }
}
function month(w,day,emit){
 const t=ensure(w);
 for(const spec of PATHS)monthSlot(w,t,t.slots[spec.id],spec,day,emit);
 return t;
}
function visible(s,w){
 const local=A.R[A.LOCATION_REGION[s.world.location]]?.polity,
  t=w.knowledgeDiffusion,now=Math.floor(s.world.minutes/1440);
 if(!local||!t)return {polity:A.P[local]?.name||null,
  publishedAdoptions:[],
  note:'Foreign work is not known simply because it happened elsewhere.'};
 const published=t.records.filter(r=>r.destination===local&&r.publicText&&
  r.releaseDay<=now&&w.chronicle?.some(x=>x.subject==='diffusion:'+r.id&&
   x.region===local&&x.day===r.day&&x.releaseDay===r.releaseDay&&
   x.text===r.publicText)&&
  r.hash===hash({id:r.id,kind:r.kind,day:r.day,month:r.month,
   source:r.source,originId:r.originId,originPolity:r.originPolity,
   destination:r.destination,readerId:r.readerId,readerName:r.readerName,
   routeId:r.routeId,institutionId:r.institutionId,
   sourceAttestationHash:r.sourceAttestationHash,details:r.details,
   })).slice(-10).map(r=>({
    day:r.day,researcher:r.readerName,event:r.kind,
    description:r.publicText,destination:A.P[r.destination].name}));
 return {polity:A.P[local].name,publishedAdoptions:published,
  note:'Published locally verified adaptations, failures or withdrawals only; unreleased foreign research and institutional budgets remain private.'};
}
module.exports={PATHS,CHANNEL,seed,ensure,sourceEventHash,genuinePublished,attestation,month,visible,
 _debug:{random,monthSlot,record}};
