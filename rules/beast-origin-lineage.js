'use strict';
// Master §§18,24. Source-specific original human lineage research. The older
// ecological map is *not* proof of an organ, a material licence or a power.
// GM-authored source registry entries are not created by player rule calls.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),W=require('./world'),U=require('./unified'),
 Potential=require('./potential-mechanics');
const ORIGIN='earned-individual-lineage-evidence-v1',
 SOURCE='gm-attested-specific-origin-pattern-source-v1',
 MAP='witnessed-specific-origin-trait-mapping-v1',
 SCREEN='witnessed-specific-origin-compatibility-v1',
 ARCHIVE='engine-captured-original-origin-witness-v1';
const ROUTES=Object.freeze(['ancestral','lineage-transfer','pattern-imprint',
 'origin-cultivation','relic-inheritance','synthetic-trait']);
const AXES=Object.freeze(['physical','energetic','spiritual','trait-conflict']);
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{3,65}$/.test(x);
const phrase=(x,n=25)=>typeof x==='string'&&x.trim().length>=n&&x.length<=900;
const integer=(x,min=0,max=1000000000)=>Number.isInteger(x)&&x>=min&&x<=max;
const only=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&
 Object.keys(x).every(k=>keys.includes(k));
// Core intentionally rotates its recent log. Only an event present at
// the moment of an original action can enter the persistent source archive.
function witnessed(s,event){
 if(!event||typeof event!=='object')return false;
 const h=hash(event);
 if(s.log?.some(e=>hash(e)===h))return true;
 const row=s.table?.originWitnessArchive?.[h];
 return !!(row?.origin===ARCHIVE&&row.seal===h&&
  row.event?.type==='story'&&hash(row.event)===h);
}
function archive(s,event){
 const h=hash(event);
 const old=s.table?.originWitnessArchive?.[h];
 if(old){
  if(old.origin!==ARCHIVE||old.seal!==h||hash(old.event)!==h)
   throw Error('Original human Origin evidence archive must not be rewritten');
  return; // Historical original was verified when first consumed.
 }
 if(!s.log?.some(e=>hash(e)===h))
  throw Error('Only a genuinely present original scene witness may first enter the archive');
 s.table.originWitnessArchive||={};
 s.table.originWitnessArchive[h]={origin:ARCHIVE,seal:h,
  event:structuredClone(event)};
}
function safe(s){
 const c=s.table?.combatants?.player;
 if(!E.LOCATIONS[s.world?.location]||s.battle||s.encounter||
    !c||c.status!=='ok')
  throw Error('Lineage research requires a present physical scene and a stable conscious human, not an unresolved encounter');
}
function gmSource(s,sourceId){
 if(!id(sourceId))throw Error('An actual GM-registered individual source ID is required');
 const z=s.table?.originTraitSources?.[sourceId],q=z?.source;
 if(!z||z.origin!==SOURCE||z.seal!==hash(q)||!q||
  q.origin!==SOURCE||q.sourceId!==sourceId||
  !ROUTES.includes(q.route)||!phrase(q.traitName,5)||
  !phrase(q.exactObservedMechanism)||!phrase(q.originalBiology)||
  !phrase(q.magicalRequirements)||!phrase(q.spiritualRequirements)||
  !phrase(q.metabolicLimits)||!phrase(q.conflictLimit)||
  !integer(q.integrationLoad,1,100)||
  !q.rights||!['owned-ancestry','documented-donation',
   'licensed-relic','authenticated-self-research','unresolved'].includes(q.rights.mode)||
  typeof q.rights.verified!=='boolean'||
  !phrase(q.rights.originalProvenance)||
  !q.observation||q.observation.type!=='story'||
  q.observationHash!==hash(q.observation)||
  q.observation.details?.origin!==SOURCE||
  q.observation.details?.sourceId!==sourceId||
  !witnessed(s,q.observation)||
  !integer(q.minute,0,s.world.minutes)||
  q.observation.details?.location!==q.location||
  q.location!==q.observation.details.location)
  throw Error('A genuine separately witnessed individual Origin Pattern and its acquisition rights must be registered by the GM');
 // Even an authentic study source with unresolved rights grants no right to
 // acquire or seed its tissue. The executable integration stages are separate.
 return {z,q};
}
function witness(s,index,origin,sourceId,axis=null){
 if(!integer(index,0,s.log.length-1))
  throw Error('A prior witnessed individual lineage experiment is required');
 const e=s.log[index],d=e?.details;
 if(e?.type!=='story'||d?.origin!==origin||
  d.sourceId!==sourceId||d.location!==s.world.location||
  (axis!==null&&d.axis!==axis)||!phrase(e.text,16)||
  !phrase(d.measuredIndividualResponse)||
  !phrase(d.independentFailureLimit))
  throw Error('An independently witnessed local original trait response and countertest must match this specific source');
 return structuredClone(e);
}
function modifier(s,attribute,skill){
 const a=C.int(s.player.attributes?.[attribute],'earned '+attribute,1,30),
 rank=C.int(s.player.skills?.[skill]?.rank??0,'earned '+skill,0,5);
 return Math.floor((a-10)/2)+2*rank;
}
function records(s){return s.table?.originLineageStudies||{}}
function checkIntegrity(c){
 if(!c||c.rollEvent?.type!=='roll'||c.rollEventHash!==hash(c.rollEvent)||
  hash(c.rollEvent.details)!==hash(c.check)||
  c.roll!==c.check.roll||!integer(c.roll,1,20)||
  c.check.naturalBonus!==C.naturalAdjustment(c.roll)||
  c.check.total!==c.roll+c.check.modifier+c.check.naturalBonus||
  c.check.margin!==c.check.total-c.check.dc||
  c.check.degree!==C.degree(c.check.margin,true)||
  c.check.success!==(c.check.margin>=0)||
  c.check.progress!==C.progress(c.check.degree))
  return false;
 return true;
}
function verify(s){
 if(!s.table?.originLineageStudies)return true;
 const used=new Set();
 for(const [sourceId,rec] of Object.entries(records(s))){
  let z;try{z=gmSource(s,sourceId)}catch{return false}
  if(rec.origin!==ORIGIN||rec.sourceSeal!==z.z.seal||
   rec.sourceId!==sourceId||!Array.isArray(rec.mapping)||
   !integer(rec.progress,0,3)||rec.complete!==(rec.progress>=3)||
   !rec.screens||typeof rec.screens!=='object'||
   Object.keys(rec.screens).some(a=>!AXES.includes(a)))
   return false;
  let pts=0,last=z.q.minute;
  for(const a of rec.mapping){
   if(a?.origin!==ORIGIN||a.seal!==hash(a.source))return false;
   const b=a.source;
   if(b.origin!==ORIGIN||b.kind!=='map'||b.sourceId!==sourceId||
    !integer(b.minute,last,s.world.minutes)||
    !integer(b.minutes,15,480)||b.minute+b.minutes>s.world.minutes||
    b.staminaSpent!==Math.ceil(b.minutes/120)||
    !checkIntegrity(b)||
    (b.potentialAptitude!==undefined&&
     !Potential.matches(s,b.potentialAptitude,'bloodlineExpression'))||
    b.check.dc!==15+Math.min(4,z.q.integrationLoad)||
    !b.witness||b.witnessHash!==hash(b.witness)||
    b.witness.details?.origin!==MAP||
    b.witness.details?.sourceId!==sourceId||
    !witnessed(s,b.witness)||
    used.has(b.witnessHash)||
    b.earned!==(b.check.success?b.check.progress:0)||
    b.progressAfter!==Math.min(3,pts+b.earned))return false;
   used.add(b.witnessHash);pts=b.progressAfter;last=b.minute+b.minutes;
  }
  if(pts!==rec.progress)return false;
  for(const [axis,arr] of Object.entries(rec.screens)){
   if(!Array.isArray(arr))return false;
   let prior='unassessed',latest=null;
   for(const a of arr){
    if(a?.origin!==ORIGIN||a.seal!==hash(a.source))return false;
    const b=a.source;
    if(b.origin!==ORIGIN||b.kind!=='screen'||b.axis!==axis||
     b.sourceId!==sourceId||!integer(b.minute,z.q.minute,s.world.minutes)||
     !integer(b.minutes,15,480)||b.minute+b.minutes>s.world.minutes||
     b.staminaSpent!==Math.ceil(b.minutes/120)||
     !checkIntegrity(b)||
     (b.potentialAptitude!==undefined&&
      !Potential.matches(s,b.potentialAptitude,Potential.ORIGIN_AXES[axis]))||
     !b.witness||
     b.witnessHash!==hash(b.witness)||
     b.witness.details?.origin!==SCREEN||
     b.witness.details?.sourceId!==sourceId||
     b.witness.details?.axis!==axis||
     !witnessed(s,b.witness)||
     !Array.isArray(b.risks)||b.risks.some(x=>!phrase(x,8))||
     !['promising','caution','inconclusive'].includes(b.result)||
     b.result!==(b.check.success?
      b.risks.length?'caution':'promising':'inconclusive')||
     prior==='promising'||used.has(b.witnessHash))
      return false;
    used.add(b.witnessHash);prior=b.result;latest=b;
   }
   if(latest?.result!==rec.results?.[axis])return false;
  }
  if(!rec.complete&&Object.values(rec.screens).some(a=>a.length))return false;
  if(rec.integration&&
   !require('./beast-origin-integration').verifyRecord(s,rec,z.q,z.z.seal))
   return false;
 }
 return true;
}
function map(s,p={}){
 if(!only(p,['sourceId','witnessIndex','minutes'])||
  !id(p.sourceId)||!integer(p.minutes??90,15,480))
  throw Error('Map a specifically registered lineage source using witnessed work and actual time');
 safe(s);if(!verify(s))throw Error('Prior saved lineage records failed integrity checks');
 const {z,q}=gmSource(s,p.sourceId),old=records(s)[p.sourceId];
 if(old?.complete)throw Error('The exact original trait map is already complete; later research uses new observations and designs');
 const seen=witness(s,p.witnessIndex,MAP,p.sourceId),wHash=hash(seen);
 if(old?.mapping.some(a=>a.source.witnessHash===wHash))
  throw Error('The original mapping experiment cannot be rerolled');
 const minutes=p.minutes??90,staminaSpent=Math.ceil(minutes/120);
 if(!integer(s.player.stamina,staminaSpent,100000))
  throw Error('Actual physical stamina is needed to study this lineage');
 archive(s,q.observation);archive(s,seen);
 const start=s.world.minutes,aptitude=Potential.read(s,'bloodlineExpression');
 const check=C.check(s,{modifier:modifier(s,'int','research')+aptitude.modifier,
  dc:15+Math.min(4,q.integrationLoad),
  label:'Individual Origin Pattern mapping: '+q.traitName.slice(0,40)});
 const event=structuredClone(s.log.at(-1)),earned=check.success?check.progress:0;
 const r=old||{origin:ORIGIN,sourceId:p.sourceId,sourceSeal:z.seal,
  mapping:[],progress:0,complete:false,screens:{},results:{}};
 r.progress=Math.min(3,r.progress+earned);r.complete=r.progress>=3;
 const src={origin:ORIGIN,kind:'map',sourceId:p.sourceId,minute:start,minutes,
  staminaSpent,witness:seen,witnessHash:wHash,potentialAptitude:aptitude,
  check:structuredClone(check),rollEvent:event,rollEventHash:hash(event),
  roll:check.roll,earned,progressAfter:r.progress};
 r.mapping.push({origin:ORIGIN,source:src,seal:hash(src)});
 s.table.originLineageStudies||={};s.table.originLineageStudies[p.sourceId]=r;
 s.player.stamina-=staminaSpent;
 s.table.combatants.player.stamina=s.player.stamina;
 E.advance(s,minutes);W.finalizeTime(s,start);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Original mapping evidence cannot be reconciled');
 return {sourceId:p.sourceId,trait:q.traitName,
  mapped:r.complete,progress:r.progress,check,staminaSpent,minutes,
  rightsEstablished:q.rights.verified,seeded:false,noTraitOrEvolutionGranted:true};
}
const METHODS=Object.freeze({physical:['wis','medicine'],
 energetic:['int','arcana'],spiritual:['wis','cultivation'],
 'trait-conflict':['int','research']});
function screen(s,p={}){
 if(!only(p,['sourceId','axis','witnessIndex','minutes'])||
  !id(p.sourceId)||!AXES.includes(p.axis)||
  !integer(p.minutes??90,15,480))
  throw Error('Select one actual lineage-specific bodily, energetic, spiritual or conflict assessment');
 safe(s);if(!verify(s))throw Error('Prior saved lineage records failed integrity checks');
 const {q}=gmSource(s,p.sourceId),r=records(s)[p.sourceId];
 if(!r?.complete)throw Error('The exact observed individual trait must be mapped before compatibility assessments');
 if(r.results[p.axis]==='promising')
  throw Error('That actual trait-specific compatibility axis was already demonstrated; new circumstances require a new source');
 const seen=witness(s,p.witnessIndex,SCREEN,p.sourceId,p.axis),wHash=hash(seen);
 if(Object.values(r.screens).flat().some(a=>a.source.witnessHash===wHash))
  throw Error('An original clinical compatibility observation cannot be rolled twice');
 const risk=[],pchar=s.player,o=pchar.origin;
 if(!o||!integer(o.capacity,0,100)||!integer(o.load,0,100)||
  !Array.isArray(o.stableTraits)||o.load>o.capacity)
  throw Error('Existing human Origin load or inherited anatomy is inconsistent');
 if(o.load+q.integrationLoad>o.capacity)
  risk.push('Original human biological Origin capacity is already insufficient');
 if(p.axis==='physical'&&(pchar.humanEvolution?.stability??0)<60)
  risk.push('Actually recorded human evolutionary stability requires recovery');
 if(p.axis==='spiritual'&&(pchar.soul?.stability??0)<65)
  risk.push('Original individual soul integrity needs observed care');
 if(p.axis==='trait-conflict'&&o.stableTraits.length&&
    !seen.details?.measuredExistingTraitInteractions)
  risk.push('Existing integrated trait interactions have not been independently examined');
 if(p.axis==='energetic'&&q.energyMode!=='metabolic'&&
   !pchar.arcane?.coreIgnited&&!pchar.meridian?.stage)
  risk.push('No established external magical or meridian energy throughput');
 // That last finding is a contextual caution, never a blanket requirement
 // that ordinary inherited biological traits have a Mana Core or a teacher.
 const minutes=p.minutes??90,staminaSpent=Math.ceil(minutes/120);
 if(!integer(pchar.stamina,staminaSpent,100000))
  throw Error('Actual stamina is needed for lineage compatibility measurement');
 archive(s,q.observation);archive(s,seen);
 const method=METHODS[p.axis],start=s.world.minutes,
  aptitude=Potential.originAxis(s,p.axis);
 const check=C.check(s,{modifier:modifier(s,method[0],method[1])+aptitude.modifier,
  dc:15+Math.min(4,q.integrationLoad)+Math.min(3,risk.length),
  label:'Original individual Origin '+p.axis+' compatibility'});
 const rollEvent=structuredClone(s.log.at(-1));
 const result=check.success?(risk.length?'caution':'promising'):'inconclusive';
 const src={origin:ORIGIN,kind:'screen',axis:p.axis,
  sourceId:p.sourceId,minute:start,minutes,staminaSpent,witness:seen,
  witnessHash:wHash,potentialAptitude:aptitude,
  check:structuredClone(check),rollEvent,
  rollEventHash:hash(rollEvent),roll:check.roll,risks:risk,result};
 r.screens[p.axis]||=[];r.screens[p.axis].push({
  origin:ORIGIN,source:src,seal:hash(src)});
 r.results[p.axis]=result;
 pchar.stamina-=staminaSpent;s.table.combatants.player.stamina=pchar.stamina;
 E.advance(s,minutes);W.finalizeTime(s,start);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Actual compatibility screen and saved source have diverged');
 return {sourceId:p.sourceId,axis:p.axis,result,risks:structuredClone(risk),
  check,staminaSpent,minutes,
  screeningOnly:true,seedingApproved:false,noNewTrait:true};
}
function status(s){
 if(!verify(s))throw Error('Saved source-specific Origin Pattern records failed verification');
 return {individualSources:Object.entries(records(s)).map(([id,r])=>{
  const {q}=gmSource(s,id);
  return {id,route:q.route,trait:q.traitName,mapped:r.complete,
   mappingProgress:r.progress,compatibility:AXES.map(axis=>({
    axis,result:r.results[axis]||'unassessed'})),
   rightsDocumented:q.rights.verified,sourceKnown:true,
   seedingApproved:false,expressed:!!r.integration?.attempts?.some(x=>
   x.source.step===6&&x.source.success),
   integrated:!!r.integration?.complete,
   humanAdaptedLoad:r.integration?.reservedLoad||0};
 }),notProvisionalEcology:'Exact biological, magical and spiritual source required',
  noAutomaticOriginTraitOrHumanEvolution:true};
}
module.exports={ORIGIN,SOURCE,MAP,SCREEN,ROUTES,AXES,
 hash,gmSource,witness,records,checkIntegrity,witnessed,archive,
 map,screen,status,verify};
