'use strict';
// #10. One original Meridian circulation. Authored anatomical routes do not
// open Gates, grant spells, generate Qi or override injury care.
const Crypto=require('node:crypto'),E=require('../engine.js'),C=require('./core'),Build=require('./build');
const ORIGIN='meridian-living-web-original-route-v1',
 MAP='personally-observed-meridian-route-mapping-v1',
 TREAT='witnessed-meridian-clinical-repair-v1',
 TRANSITION='personally-witnessed-integrated-meridian-web-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const prose=(v,min=12,max=950)=>typeof v==='string'&&v.trim().length>=min&&v.trim().length<=max;
const integer=(v,min=0,max=1000000000)=>Number.isInteger(v)&&v>=min&&v<=max;
const ident=v=>typeof v==='string'&&/^[a-z][a-z0-9_-]{2,75}$/.test(v);
const segments={extraordinary:8,major:36,minor:72};
const keep=(p,fields)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(x=>fields.includes(x));
function prior(s){
 const m=s.player?.meridian,phys=s.table?.powerPhysiology?.meridian,
  sea=m?.dantianSea,work=s.table?.meridianSeaFormation,
  gates=m?.gates,records=phys?.gateRecords,
  h=s.table?.disciplineTraining?.meridian?.history||[];
 if(!m||m.stage<4||!phys||phys.primaryMapped!==12||
  !Array.isArray(gates)||gates.length!==108||
  !Array.isArray(records)||records.length!==108||
  !Array.isArray(phys.transitions)||!sea||sea.rings<1||
  !integer(sea.formedAtMinute,0,s.world.minutes)||
  !prose(sea.source,16,600)||
  work?.formedAtMinute!==sea.formedAtMinute||work.points!==5||
  !Array.isArray(work.attempts)||work.attempts.length<1||
  !work.attempts.some(a=>a.formed===true&&
   a.minute===work.formedAtMinute&&a.progress===5)||
  !h.some(a=>a.target==='foundation'&&String(a.change).startsWith('Stage I Foundation Tempering;'))||
  !h.some(a=>a.target==='awakening'&&String(a.change).startsWith('Stage II Meridian Awakening;')))
  throw Error('Stage IV requires its actual original 108-Gate structure and Dantian Sea formation evidence');
 for(let i=0;i<108;i++){
  const p=gates[i],a=records[i],band=i<36?'Lower':i<72?'Middle':'High';
  if(!p||!a||p.number!==i+1||a.number!==i+1||
    p.band!==band||a.band!==band||p.quality!==a.quality||
    !['Perfect','Sound','Flawed'].includes(a.quality)||
    !integer(a.day,1,E.day(s)))
   throw Error('Meridian source anatomy has a missing, altered or out-of-order Gate');
 }
 for(const n of [36,72,108]){
  const t=phys.transitions.find(x=>x.gate===n);
  if(!t||t.day!==records[n-1].day||t.quality!==records[n-1].quality||
   !prose(t.source,16,700))throw Error('Original Gate band transition proof missing');
 }
 return {m,phys,sea};
}
function sourceEvent(s,index,origin){
 if(!integer(index,0,s.log.length-1))throw Error('A prior original witnessed anatomy event is required');
 const e=s.log[index];
 if(e?.type!=='story'||e.details?.origin!==origin||
   e.details?.location!==s.world.location||
   !prose(e.text,12,900))
  throw Error('The original local anatomical source cannot be inferred from a description alone');
 return e;
}
function checkRoute(r){
 const z=r?.source;
 if(!z||r.origin!==ORIGIN||r.seal!==hash(z)||
  z.origin!==ORIGIN||z.routeId!==r.id||!ident(r.id)||
  !prose(z.name,3,160)||!prose(z.principle)||
  !prose(z.interference)||!prose(z.pressureRisk)||!prose(z.treatmentPath)||
  !integer(z.load,1,9)||!Array.isArray(z.segments)||
  !z.segments.length||z.segments.length>12||
  z.segments.some(x=>!x||!Object.hasOwn(segments,x.kind)||
    !integer(x.number,1,segments[x.kind]))||
  new Set(z.segments.map(x=>x.kind+':'+x.number)).size!==z.segments.length||
  !Array.isArray(z.gates)||z.gates.length<1||z.gates.length>24||
  new Set(z.gates).size!==z.gates.length||
  z.gates.some(n=>!integer(n,1,108))||
  !['lower','middle','upper'].includes(z.dantian)||
  !z.witness||z.witnessHash!==hash(z.witness)||
  z.witness.details?.origin!==MAP||
  z.witness.details?.routeId!==r.id||
  !integer(r.integrity,0,20)||!integer(r.required,1,20)||
  !Array.isArray(r.attempts)||!Array.isArray(r.injuries)||
  !Array.isArray(r.care))return false;
 const required=Math.max(2,Math.ceil(z.segments.length/3)+z.load-2);
 if(r.required!==required||r.integrity>r.required)return false;
 let earnedIntegrity=0,lastMinute=z.createdMinute;
 for(const attempt of r.attempts){
  const a=attempt?.source;
  if(!a||attempt.origin!==ORIGIN||attempt.seal!==hash(a)||
   attempt.routeId!==r.id||a.origin!==ORIGIN||a.routeId!==r.id||
   !integer(a.startedMinute,lastMinute)||!integer(a.minutes,15,480)||
   !integer(a.roll,1,20)||!integer(a.qiSpent,1,50)||
   !integer(a.staminaSpent,1,12)||!integer(a.earned,0,3)||
   a.check?.roll!==a.roll||
   a.earned!==(a.check.success?a.check.progress:0)||
   a.newIntegrity!==Math.min(r.required,earnedIntegrity+a.earned))
   return false;
  earnedIntegrity=a.newIntegrity;
  lastMinute=a.startedMinute+a.minutes;
 }
 if(r.integrity!==earnedIntegrity)return false;
 for(const injury of r.injuries){
  const a=injury?.source;
  if(injury.origin!==ORIGIN||injury.seal!==hash(a)||
   a?.routeId!==r.id||!integer(a.stabilityLoss,1,10)||
   !integer(a.startedMinute))return false;
 }
 const caredFor=new Set(),sources=new Set();
 for(const entry of r.care){
  const a=entry?.source;
  if(entry?.origin!==TREAT||entry.seal!==hash(a)||a?.origin!==TREAT||
   a.routeId!==r.id||!r.injuries.some(x=>x.seal===a.injuryHash)||
   a.witnessHash!==hash(a.witness)||a.witness?.details?.origin!==TREAT||
   a.witness.details.routeId!==r.id||
   !integer(a.startedMinute)||!integer(a.minutes,15,480)||
   !integer(a.staminaSpent,1,12)||!integer(a.roll,1,20)||
   a.check?.roll!==a.roll||
   a.stabilityRecovered!==(a.check.success?Math.min(2,a.originalLoss):0)||
   !integer(a.originalLoss,1,10)||
   sources.has(a.witnessHash)||
   (a.check.success&&caredFor.has(a.injuryHash)))
   return false;
  sources.add(a.witnessHash);
  if(a.check.success)caredFor.add(a.injuryHash);
 }
 return true;
}
function verify(s){
 const net=s.table?.powerPhysiology?.meridian?.advancedNetwork;
 if(!net)return true;
 try{prior(s);}catch{return false;}
 if(net.origin!==ORIGIN||!net.routes||typeof net.routes!=='object'||
  Array.isArray(net.routes)||!Array.isArray(net.history)||
  net.history.some(x=>x?.origin!==ORIGIN||x.seal!==hash(x.source))||
  !Array.isArray(net.integrationAttempts)||!Array.isArray(net.transitions))
  return false;
 const registered=new Set();
 for(const [id,r] of Object.entries(net.routes)){
  if(id!==r.id||!checkRoute(r))return false;
  for(const x of r.source.segments){
   const key=x.kind+':'+x.number;
   if(registered.has(key))return false;
   registered.add(key);
  }
 }
 const witnesses=new Set();
 let success=null;
 for(const receipt of net.integrationAttempts){
  const a=receipt?.source;
  if(receipt?.origin!==ORIGIN||receipt.seal!==hash(a)||
   a?.origin!==ORIGIN||a.kind!=='stage-v-integrated-network-test'||
   !a.witness||a.witnessHash!==hash(a.witness)||
   a.witness.type!=='story'||a.witness.details?.origin!==TRANSITION||
   !Array.isArray(a.witness.details?.routeIds)||
   !Array.isArray(a.routes)||!a.routes.length||
   a.routeHash!==hash(a.routes)||
   !integer(a.startedMinute,0,s.world.minutes)||
   !integer(a.minutes,30,480)||
   !integer(a.qiSpent,8,100)||!integer(a.staminaSpent,1,20)||
   !integer(a.extraordinary,1,8)||a.stageBefore!==4||
   a.stageAfter!==(a.formed?5:4)||
   !a.checkEvent||a.checkEventHash!==hash(a.checkEvent)||
   a.checkEvent.type!=='roll'||hash(a.checkEvent.details)!==hash(a.check)||
   a.check?.roll!==a.roll||!integer(a.roll,1,20)||
   a.formed!==a.check.success||
   witnesses.has(a.witnessHash))
   return false;
  witnesses.add(a.witnessHash);
  const ids=a.routes.map(x=>x.id);
  if(ids.join('|')!==a.witness.details.routeIds.join('|')||
   a.routes.some(x=>{
    const present=net.routes[x.id];
    return !present||x.sourceHash!==present.seal||
     !integer(x.integrated,x.required,20)||
     x.integrated>present.integrity||
     x.required!==present.required||x.unresolved!==0;
   }))
   return false;
  const kinds=new Set(a.routes.flatMap(x=>
   net.routes[x.id].source.segments.map(y=>y.kind)));
  if(Object.keys(segments).some(x=>!kinds.has(x)))return false;
  const extra=new Set(a.routes.flatMap(x=>net.routes[x.id].source.segments)
   .filter(x=>x.kind==='extraordinary').map(x=>x.number));
  if(extra.size!==a.extraordinary||a.qiSpent!==8+a.extraordinary)return false;
  if(a.formed){
   if(success)return false;
   success=receipt;
   const capacity=a.capacity,profile=meridianProfile(s,5,a.extraordinary);
   if(!capacity||
    capacity.newMax!==Math.max(capacity.oldMax,profile.qi)||
    capacity.newQi!==capacity.oldQi-a.qiSpent||
    capacity.flow!==profile.flow||
    capacity.recovery!==profile.recovery||
    !integer(capacity.oldQi,a.qiSpent,100000)||
    !integer(capacity.oldMax,0,100000))
    return false;
  }else if(a.capacity!==null)return false;
 }
 if(net.transitions.length!==(success?1:0)||
  (success&&(
   net.transitions[0].seal!==success.seal||
   hash(net.transitions[0].source)!==hash(success.source))))
  return false;
 if(s.player.meridian.stage>=5&&!success)return false;
 if(s.player.meridian.stage===4&&success)return false;
 if(success&&s.player.meridian.stage===5){
  const cap=success.source.capacity,
   profile=meridianProfile(s,5,success.source.extraordinary);
  if(s.player.maxQi<cap.newMax||
   s.player.meridian.stableQiLimit!==profile.qi||
   s.player.meridian.flow!==cap.flow||
   s.player.meridian.recoveryRate!==cap.recovery)return false;
 }
 return true;
}
function ensure(s){
 const {phys}=prior(s);
 if(!phys.advancedNetwork)phys.advancedNetwork={origin:ORIGIN,routes:{},history:[],integrationAttempts:[],transitions:[]};
 if(!verify(s))throw Error('Previously mapped Meridian route source was altered');
 return phys.advancedNetwork;
}
function available(s,{forCare=false}={}){
 if(s.battle||s.encounter||
  s.table?.combatants?.player?.status&&s.table.combatants.player.status!=='ok')
  throw Error('Living meridian training requires actual safety, not combat or incapacity');
 if(!forCare&&s.player.meridian.stability<35)
  throw Error('Unstable meridians need clinical recovery before high-pressure practice');
}
function mapRoute(s,p={}){
 if(!keep(p,['id','name','principle','interference','pressureRisk',
   'treatmentPath','load','segments','gates','dantian','witnessIndex'])||
  !ident(p.id)||!prose(p.name,3,160)||!prose(p.principle)||
  !prose(p.interference)||!prose(p.pressureRisk)||
  !prose(p.treatmentPath)||!integer(p.load,1,9)||
  !Array.isArray(p.segments)||!p.segments.length||p.segments.length>12||
  !Array.isArray(p.gates)||!p.gates.length||p.gates.length>24||
  !['lower','middle','upper'].includes(p.dantian))
  throw Error('An original circulation map needs real branch anatomy, Dantian, Gate route, physical risks and clinical source');
 prior(s);
 if(s.player.meridian.stage<4)
  throw Error('Meridian web mapping requires at least an earned Stage IV Dantian Sea');
 const event=sourceEvent(s,p.witnessIndex,MAP);
 if(event.details?.routeId!==p.id||
  event.details?.subject!=='original-individual-meridian-anatomy')
  throw Error('An original route map needs a specific personally witnessed individual-anatomy scene');
 const draft={origin:ORIGIN,routeId:p.id,name:p.name.trim(),
  principle:p.principle.trim(),interference:p.interference.trim(),
  pressureRisk:p.pressureRisk.trim(),treatmentPath:p.treatmentPath.trim(),
  load:p.load,segments:structuredClone(p.segments),gates:[...p.gates],
  dantian:p.dantian,witness:structuredClone(event),
  witnessHash:hash(event),createdMinute:s.world.minutes};
 const required=Math.max(2,Math.ceil(draft.segments.length/3)+draft.load-2);
 const route={id:p.id,origin:ORIGIN,source:draft,seal:hash(draft),
  integrity:0,required,attempts:[],injuries:[],care:[]};
 if(!checkRoute(route))throw Error('Route references nonexistent or duplicate anatomical structures');
 const existing=s.table.powerPhysiology.meridian.advancedNetwork;
 if(existing&&!verify(s))throw Error('Original Meridian route ledger was altered');
 if(existing?.routes[p.id])throw Error('Already mapped this specific anatomical route');
 const occupied=new Set(Object.values(existing?.routes||{}).flatMap(x=>
  x.source.segments.map(y=>y.kind+':'+y.number)));
 if(draft.segments.some(x=>occupied.has(x.kind+':'+x.number)))
  throw Error('One real channel segment cannot be allocated to conflicting routes');
 ensure(s).routes[p.id]=route;
 return {mapped:true,id:p.id,segments:draft.segments.length,
  pressureLoad:p.load,requiredIntegrity:required,
  sourceBased:true,noGateOpenedOrStageAwarded:true};
}
function work(s,p={}){
 if(!keep(p,['routeId','minutes','approach'])||!ident(p.routeId)||
   !integer(p.minutes??120,15,480)||
   (p.approach!==undefined&&!prose(p.approach,8,400)))
  throw Error('Only a mapped original route, real time and optional descriptive technique are supported');
 const net=s.table?.powerPhysiology?.meridian?.advancedNetwork;
 const route=net?.routes?.[p.routeId];
 if(!route||!verify(s)||s.player.meridian.stage<4)
  throw Error('Real source-mapped Stage IV anatomy is required before web integration work');
 available(s);
 if(route.integrity>=route.required)
  throw Error('This individually mapped circuit is already structurally integrated');
 const qiCost=2+route.source.load,minutes=p.minutes??120,
  staminaCost=Math.ceil(minutes/120)+Math.ceil(route.source.load/3);
 if(!integer(s.player.qi,qiCost,100000)||
    !integer(s.player.stamina,staminaCost,100000))
  throw Error('Actual available Qi and Stamina cannot support the route pressure');
 const previous=s.world.minutes;
 s.player.qi-=qiCost;s.player.stamina-=staminaCost;
 if(s.table?.combatants?.player)
  s.table.combatants.player.stamina=s.player.stamina;
 const n=route.source.segments.length,
   flawed=route.source.gates.filter(x=>
    s.player.meridian.gates[x-1].quality==='Flawed').length,
   modifier=Math.floor((s.player.attributes.wis-10)/2)+
    2*(s.player.skills?.cultivation?.rank||0)+
    (s.player.meridian.dantianSea.purity>=5?1:0),
   dc=13+route.source.load+Math.ceil(n/4)+2*flawed;
 const check=C.check(s,{modifier,dc,label:'Stage V living circuit '+route.source.name});
 const earned=check.success?C.progress(check.degree):0;
 route.integrity=Math.min(route.required,route.integrity+earned);
 let setback=null;
 if(check.degree==='severe failure'){
  const loss=1+Math.ceil(route.source.load/3);
  s.player.meridian.stability=Math.max(1,s.player.meridian.stability-loss);
  const injurySource={origin:ORIGIN,routeId:route.id,
   startedMinute:previous,stabilityLoss:loss,
   category:'route-pressure-deviation',
   basis:'Actual severe Meridian pressure check, no invented permanent organ failure',
   checkHash:hash(check)};
  const injury={origin:ORIGIN,source:injurySource,seal:hash(injurySource)};
  route.injuries.push(injury);
  (s.table.powerPhysiology.meridian.deviationHistory||=[]).push({
   source:'original-meridian-living-route-pressure-v1',
   routeId:route.id,minute:previous,stabilityLoss:loss,
   receiptHash:injury.seal});
  setback={type:'route-pressure-deviation',stabilityLoss:loss,
   needsGenuineClinicalRecovery:true};
 }
 const source={origin:ORIGIN,routeId:route.id,startedMinute:previous,
  minutes,approach:p.approach?.trim()||null,qiSpent:qiCost,staminaSpent:staminaCost,
  roll:check.roll,check:structuredClone(check),earned,
  newIntegrity:route.integrity,setback,checkEventHash:hash(s.log.at(-1))};
 const result={origin:ORIGIN,routeId:route.id,source,seal:hash(source)};
 route.attempts.push(result);
 E.advance(s,minutes);require('./world').finalizeTime(s,previous);
 if(!verify(s))throw Error('Meridian work source cannot be reconciled after real-world time');
 return {routeId:route.id,check,earned,
  integrity:route.integrity,required:route.required,
  completed:route.integrity>=route.required,
  qiSpent:qiCost,staminaSpent:staminaCost,minutes,setback,
  noAutomaticTechniqueOrEvolution:true};
}
function treat(s,p={}){
 if(!keep(p,['routeId','witnessIndex','minutes'])||
  !ident(p.routeId)||!integer(p.minutes??120,15,480))
  throw Error('A specific mapped circulation injury, witnessed care scene and real treatment time are required');
 const net=s.table?.powerPhysiology?.meridian?.advancedNetwork,
  route=net?.routes?.[p.routeId];
 if(!route||!verify(s))throw Error('No original damaged Meridian route or verified clinical history');
 available(s,{forCare:true});
 const injury=pending(route)[0];
 if(!injury)throw Error('No unrecovered original pressure deviation remains here');
 const witness=sourceEvent(s,p.witnessIndex,TREAT);
 if(witness.details.routeId!==route.id||
  witness.details.injuryHash!==injury.seal||
  !prose(witness.details.diagnosis,18,700)||
  !prose(witness.details.treatment,18,700))
  throw Error('The original specific injured route and clinical treatment plan must be personally witnessed');
 const witnessHash=hash(witness);
 if(route.care.some(x=>x.source.witnessHash===witnessHash))
  throw Error('One treatment scene cannot create multiple separate healing checks');
 const minutes=p.minutes??120,staminaCost=Math.ceil(minutes/120);
 if(!integer(s.player.stamina,staminaCost,100000))
  throw Error('Clinical pressure recovery needs actual available Stamina');
 const before=s.world.minutes;
 s.player.stamina-=staminaCost;
 const modifier=Math.floor((s.player.attributes.wis-10)/2)+
   2*(s.player.skills?.medicine?.rank||0);
 const check=C.check(s,{modifier,dc:12+route.source.load+
  injury.source.stabilityLoss,label:'Original Meridian pressure recovery'});
 const restored=check.success?Math.min(2,injury.source.stabilityLoss):0;
 if(restored)s.player.meridian.stability=Math.min(100,s.player.meridian.stability+restored);
 const source={origin:TREAT,routeId:route.id,
  injuryHash:injury.seal,originalLoss:injury.source.stabilityLoss,
  startedMinute:before,minutes,staminaSpent:staminaCost,
  witness:structuredClone(witness),witnessHash,
  roll:check.roll,check:structuredClone(check),
  stabilityRecovered:restored,originalCheckHash:hash(s.log.at(-1))};
 route.care.push({origin:TREAT,source,seal:hash(source)});
 E.advance(s,minutes);require('./world').finalizeTime(s,before);
 if(!verify(s))throw Error('Meridian clinical injury or treatment receipt changed');
 return {careAttempted:true,routeId:route.id,check,
  clinicalRecovery:check.success,stabilityRecovered:restored,
  unresolvedDeviations:pending(route).length,
  staminaSpent:staminaCost,minutes,
  noInstantRepairWithoutOriginalCheck:true};
}
function pending(route){
 const recovered=new Set(route.care.filter(x=>x.source.check.success)
  .map(x=>x.source.injuryHash));
 return route.injuries.filter(x=>!recovered.has(x.seal));
}
function coverage(s){
 const net=s.table?.powerPhysiology?.meridian?.advancedNetwork;
 const done={extraordinary:new Set(),major:new Set(),minor:new Set()};
 if(net&&!verify(s))throw Error('Meridian source history changed');
 for(const r of Object.values(net?.routes||{})){
  if(r.integrity<r.required||pending(r).length)continue;
  for(const x of r.source.segments)done[x.kind].add(x.number);
 }
 return {integrated:{extraordinary:done.extraordinary.size,major:done.major.size,
  minor:done.minor.size},needed:{...segments},
  complete:Object.keys(segments).every(k=>done[k].size===segments[k])};
}
// This is a functional web, not a fixed generic list of 116 study lessons.
// Original primary anatomy is already mapped. Individually authored branch
// routes must be healthy, responsive and connected through actual opened Gates.
function spanning(s){
 const phys=s.table?.powerPhysiology?.meridian,net=phys?.advancedNetwork;
 if(!net||!verify(s))throw Error('A genuine source-verified physical Meridian network is required');
 const list=Object.values(net.routes),types=new Set(),visited=new Set(),stack=[];
 if(!list.length)return {ready:false,reason:'No actual individual route integrated'};
 for(const r of list){
  if(r.integrity<r.required||pending(r).length)
   return {ready:false,reason:'An original mapped route is incomplete or has unresolved pressure injury'};
  for(const x of r.source.segments)types.add(x.kind);
 }
 if(Object.keys(segments).some(k=>!types.has(k)))
  return {ready:false,reason:'No demonstrated Extraordinary, Major and Minor branch circulation together'};
 stack.push(list[0].id);visited.add(list[0].id);
 while(stack.length){
  const current=net.routes[stack.pop()];
  for(const r of list){
   if(visited.has(r.id))continue;
   if(r.source.gates.some(g=>current.source.gates.includes(g))){
    visited.add(r.id);stack.push(r.id);
   }
  }
 }
 if(visited.size!==list.length)
  return {ready:false,reason:'The separately mapped routes have no physically connected Gate-to-Gate web'};
 const q=s.player.meridian.stability;
 if(!integer(q,0,100)||q<60)
  return {ready:false,reason:'Real Meridian Stability is insufficient to integrate this pressured living web'};
 return {ready:true,ids:list.map(x=>x.id).sort(),
  extraordinary:[...new Set(list.flatMap(r=>r.source.segments)
   .filter(x=>x.kind==='extraordinary').map(x=>x.number))].length,
  blueprint:list.map(r=>({id:r.id,sourceHash:r.seal,
   integrated:r.integrity,required:r.required,unresolved:pending(r).length}))
   .sort((a,b)=>a.id.localeCompare(b.id))};
}
function meridianProfile(s,stage,extraordinary){
 const gates=s.table.powerPhysiology.meridian.gateRecords,
  perfect=gates.filter(x=>x.quality==='Perfect').length,
  sound=gates.filter(x=>x.quality==='Sound').length,
  flawed=gates.filter(x=>x.quality==='Flawed').length;
 return Build.meridianProfile(stage,{meridians:12,gatesP:perfect,
  gatesS:sound,gatesF:flawed,
  seaRings:s.player.meridian.dantianSea.rings,
  extraordinary,webComplete:stage>=5});
}
function completeWeb(s,p={}){
 if(!keep(p,['witnessIndex','minutes'])||!integer(p.minutes??90,30,480))
  throw Error('Stage V functional integration requires a real prior witnessed web test and physical practice time');
 if(s.player?.meridian?.stage!==4)
  throw Error('The original Stage IV Dantian Sea must precede the Stage V integration');
 prior(s);available(s);
 const state=spanning(s);
 if(!state.ready)throw Error(state.reason);
 const witness=sourceEvent(s,p.witnessIndex,TRANSITION),d=witness.details;
 if(!Array.isArray(d.routeIds)||d.routeIds.join('|')!==state.ids.join('|')||
  !prose(d.returnFlow,24,850)||!prose(d.stressResponse,24,850)||
  !prose(d.physicalBasis,24,850))
  throw Error('Stage V requires a personally witnessed integrated return flow through exactly the source-mapped living web');
 const net=s.table.powerPhysiology.meridian.advancedNetwork;
 const witnessHash=hash(witness);
 if(net.integrationAttempts.some(x=>x.source.witnessHash===witnessHash))
  throw Error('The same original living-web demonstration cannot be rolled twice');
 const minutes=p.minutes??90,qiCost=8+state.extraordinary,
  staminaCost=Math.ceil(minutes/90)+2;
 if(!integer(s.player.qi,qiCost,100000)||
    !integer(s.player.stamina,staminaCost,100000))
  throw Error('The real pair of Qi and Stamina reservoirs cannot sustain a living network test');
 const before=s.world.minutes,oldQi=s.player.qi,oldMax=s.player.maxQi;
 s.player.qi-=qiCost;s.player.stamina-=staminaCost;
 if(s.table?.combatants?.player)
  s.table.combatants.player.stamina=s.player.stamina;
 const modifier=Math.floor((s.player.attributes.wis-10)/2)+
  2*(s.player.skills?.cultivation?.rank||0)+
  Math.floor(s.player.meridian.stability/25)-2,
  dc=19+Math.ceil(state.ids.length/4);
 const check=C.check(s,{modifier,dc,
  label:'Stage V physically integrated responsive Meridian Web'});
 const checkEvent=structuredClone(s.log.at(-1));
 let newlyFormed=false,newCapacity=null;
 if(check.success){
  const m=s.player.meridian,profile=meridianProfile(s,5,state.extraordinary);
  m.stage=5;m.flow=profile.flow;m.recoveryRate=profile.recovery;
  m.stableQiLimit=profile.qi;
  s.player.maxQi=Math.max(oldMax,profile.qi);
  s.player.qi=Math.min(s.player.qi,s.player.maxQi);
  newlyFormed=true;newCapacity={oldMax,newMax:s.player.maxQi,
   oldQi,newQi:s.player.qi,flow:profile.flow,recovery:profile.recovery};
 }
 const source={origin:ORIGIN,kind:'stage-v-integrated-network-test',
  witness:structuredClone(witness),witnessHash,
  routes:state.blueprint,routeHash:hash(state.blueprint),
  extraordinary:state.extraordinary,startedMinute:before,
  minutes,qiSpent:qiCost,staminaSpent:staminaCost,
  roll:check.roll,check:structuredClone(check),checkEvent,
  checkEventHash:hash(checkEvent),formed:newlyFormed,
  capacity:newCapacity,stageBefore:4,stageAfter:s.player.meridian.stage};
 const receipt={origin:ORIGIN,source,seal:hash(source)};
 net.integrationAttempts.push(receipt);
 if(newlyFormed){
  net.transitions.push({origin:ORIGIN,source,seal:hash(source)});
 }
 E.advance(s,minutes);require('./world').finalizeTime(s,before);
 if(!verify(s))throw Error('Stage V anatomical completion or capacity ledger failed source verification');
 return {attempted:true,formed:newlyFormed,
  stage:s.player.meridian.stage,check,qiSpent:qiCost,
  staminaSpent:staminaCost,minutes,
  ...(newCapacity?{capacity:newCapacity}:{}),
  originalWebIntegrated:newlyFormed,automaticTechnique:false,
  noHumanEvolutionOrOtherDisciplineAward:true};
}
function status(s){
 const m=s.player?.meridian;
 if(!m||m.stage<4)return {stage:m?.stage||0,
  available:false,note:'A genuinely formed Stage IV Dantian Sea is needed'};
 const evidence=coverage(s);
 const net=s.table?.powerPhysiology?.meridian?.advancedNetwork;
 return {stage:m.stage,available:true,
  routes:Object.values(net?.routes||{}).map(r=>({
   id:r.id,name:r.source.name,segments:r.source.segments.length,
   integrity:r.integrity,required:r.required,
   pressureLoad:r.source.load,unrecoveredDeviations:pending(r).length})),
  coverage:evidence,realIndividualAnatomy:true,
  note:'Mapped channels and earned physical integration are distinct; a route name does not produce an ability, Dantian Sea ring, Stage or Qi. Later Stage VI–IX anatomy needs separate original evidence and mechanical adapters'};
}
module.exports={ORIGIN,MAP,TREAT,TRANSITION,prior,verify,mapRoute,work,treat,completeWeb,spanning,coverage,status};
