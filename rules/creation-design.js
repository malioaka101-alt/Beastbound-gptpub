'use strict';
// Verifiable compositional DESIGN ENVELOPES, not permission to cast, craft,
// sell or deploy a new effect. Master Prompt §§9,19-26,32-36,43,54.
// Free choice of purpose, no preset item/technique roster; mechanical outputs
// stay strictly bounded by the effect primitive, actual skill and source.
const Crypto=require('node:crypto');
const E=require('../engine.js'),B=require('./build'),
 R=require('./research'),C=require('./core'),W=require('./world'),
 H=require('./unified');
const ORIGIN='bounded-creation-concept-v1',MINUTES=35,STAMINA=1;
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
// These are mechanism envelopes, NOT all possible reasons to invent things.
// Unlisted effects need grounded research and an explicit new bounded adapter.
const FUNCTIONS=Object.freeze({
 sense:{family:'sense',meaning:'Observe one physically accessible signature or local signal; no thoughts, secrets or remote omniscience.'},
 signal:{family:'link',meaning:'Carry a bounded signal between established reachable endpoints; no instant universal communication.'},
 ward:{family:'ward',meaning:'Reduce one specified environmental or physical hazard, not absolute invulnerability.'},
 shape:{family:'shape',meaning:'Reshape present accessible material; does not create matter, organs or a living soul.'},
 move:{family:'move',meaning:'Assist controlled local motion of a known subject; no teleportation or unverified rift paths.'},
 mend:{family:'mend_light',meaning:'Support bounded superficial repair with material and biological needs; no resurrection, limb regeneration or serious-wound cure.'},
 support:{family:'utility',meaning:'Improve one named ordinary work process only; no open-ended automation or extra powers.'},
 strike:{family:'strike',meaning:'One bounded harmful effect under genuine combat/energy rules, not automatic hits or instant kills.'}
});
const SYSTEMS=Object.freeze({
 mundane:{skill:'crafting',key:'mundane',name:'ordinary materials and engineering'},
 arcane:{skill:'arcana',key:'arcane',name:'Mana Core and Arcane Circle architecture'},
 meridian:{skill:'cultivation',key:'meridian',name:'authenticated meridian circulation and Qi'},
 soul:{skill:'cultivation',key:'soul',name:'spiritual anatomy, reserve and stable soul patterns'},
 body:{skill:'survival',key:'body',name:'physical anatomy and refinement cycles'},
 rift:{skill:'arcana',key:'rift',name:'spatial boundaries and witnessed anchors'},
 origin:{skill:'medicine',key:'origin',name:'recorded Origin Pattern, biological load and compatibility'},
 runes:{skill:'crafting',key:'runes',name:'learned symbols, inscription and compatible materials'},
 formations:{skill:'crafting',key:'formations',name:'grounded energy nodes, geometry and stability'},
 alchemy:{skill:'crafting',key:'alchemy',name:'identified substances, controlled reactions and safety'},
 healing:{skill:'medicine',key:'healing',name:'diagnosis, anatomy and medicine'},
 partnership:{skill:'beastcraft',key:'sync',name:'independent consenting beast with shared coordination'}
});
const MEDIUMS=['technique','device','medicine','ritual','formation','tool','infrastructure','shared-work'];
const NOVELTY=['rediscovery','variant','novel','breakthrough'];
const RANGE=['self','touch','close','medium','long','extreme'],
 AREA=['single','3m','10m','25m','100m'],
 DURATION=['instant','round','1min','10min','1hour','1day','permanent'];
function textField(v,name,min=5,max=250){
 if(typeof v!=='string'||v.trim().length<min||v.length>max||
  /[\u0000-\u001f]/.test(v))throw Error('A readable original '+name+' is required');
 return v.trim();
}
function input(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||
  Object.keys(raw).some(k=>!['title','purpose','medium','system','function',
  'magnitude','range','area','duration','novelty','materials','researchId','target'].includes(k)))
  throw Error('Creation accepts only a proposed purpose and bounded mechanism, never invented rank, item stats, resources, DC or result');
 const p={
  title:textField(raw.title,'invention title',4,100),
  purpose:textField(raw.purpose,'practical cultural or technical purpose',12,700),
  medium:raw.medium,system:raw.system,function:raw.function,
  magnitude:raw.magnitude,range:raw.range,area:raw.area,
  duration:raw.duration,novelty:raw.novelty
 };
 if(raw.target!==undefined){
  if(!['surface_water'].includes(raw.target))
   throw Error('An effect target must be established by a real supported physical or supernatural mechanism');
  p.target=raw.target;
 }
 if(!MEDIUMS.includes(p.medium)||!Object.hasOwn(SYSTEMS,p.system)||
   !Object.hasOwn(FUNCTIONS,p.function)||
   !RANGE.includes(p.range)||!AREA.includes(p.area)||
   !DURATION.includes(p.duration)||!NOVELTY.includes(p.novelty))
  throw Error('An actual medium, technique mechanism, scale and creation novelty are required');
 C.int(p.magnitude,'bounded proposed Magnitude',0,7);
 if(raw.researchId!==undefined){
  if(typeof raw.researchId!=='string'||!/^[a-z][a-z0-9_-]{1,48}$/.test(raw.researchId))
   throw Error('A valid previously completed research ID is required');
  p.researchId=raw.researchId;
 }
 if(raw.materials!==undefined){
  if(!Array.isArray(raw.materials)||raw.materials.length>12||
    raw.materials.some(m=>!m||typeof m!=='object'||Array.isArray(m)||
    Object.keys(m).sort().join('|')!=='id|quantity'||
    typeof m.id!=='string'||!/^[a-z][a-z0-9_]{2,60}$/.test(m.id)||
    !Number.isInteger(m.quantity)||m.quantity<1||m.quantity>10000))
   throw Error('Only named, bounded proposed material quantities are accepted; no claimed grade, rarity or free material');
  const ids=raw.materials.map(m=>m.id);
  if(new Set(ids).size!==ids.length)throw Error('Duplicate proposed material entries');
  p.materials=raw.materials.map(x=>({id:x.id,quantity:x.quantity}));
 }else p.materials=[];
 return p;
}
function attained(s,key){
 const p=s.player||{},h=s.table?.disciplineTraining?.[key]?.history||[];
 if(key==='mundane')return {stage:0,verified:true};
 if(key==='arcane')return {stage:p.arcane?.circles||0,
  verified:!!(p.arcane?.coreIgnited&&p.arcane?.circles>=1&&
   h.some(x=>x.target==='circle1'&&String(x.change).includes('First Circle constructed')))};
 if(key==='meridian')return {stage:p.meridian?.stage||0,
  verified:!!(p.meridian?.stage>=3&&p.meridian.gates?.some(x=>x.number===1)&&
   s.table?.powerPhysiology?.meridian?.gateRecords?.some(x=>x.number===1))};
 if(key==='soul')return {stage:p.soul?.phase||0,
  verified:!!(p.soul?.phase>=1&&h.some(x=>x.target==='phase1'&&x.quality))};
 if(key==='body')return {stage:p.body?.cycles?.length||0,
  verified:!!(p.body?.cycles?.length&&h.some(x=>x.target==='cycle1'&&x.quality))};
 if(key==='rift')return {stage:p.rift?.step||0,
  verified:!!(p.rift?.step>=1&&h.some(x=>x.target==='sense'&&x.quality))};
 if(key==='origin')return {stage:p.origin?.phase||0,
  verified:!!(p.origin?.phase>=1&&p.origin?.stableTraits?.length)};
 return {stage:null,verified:false};
}
function arcaneBudget(p){
 if(p.magnitude>6)return {unsupportedMagnitude:true,
  note:'Magnitude VII lies outside the currently verified Arcane spell-cost equations'};
 const skill=FUNCTIONS[p.function],family=skill.family;
 const shape={family,rng:p.range,area:p.area,duration:p.duration,
  magnitude:p.magnitude,speed:p.duration==='permanent'?'ritual':'standard'};
 // Harm is the ONLY primitive allowed to add explicit damage. Power is
 // calculated from the fixed magnitude, not a user-submitted damage number.
 if(family==='strike')shape.damage=4+2*p.magnitude;
 return B.spellCost(shape);
}
function sealedResearch(s,p,grade){
 const id=p.researchId;
 if(!id)return {documented:false};
 const rec=s.table?.research?.[id],plan=s.table?.researchPlans?.[id];
 // A title or a completed unrelated academic project never certifies a new
 // spell or item; exact scope, authorship and source must all correspond.
 const target={medium:p.medium,system:p.system,function:p.function,
  magnitude:p.magnitude,range:p.range,area:p.area,duration:p.duration,
  ...(p.target?{target:p.target}:{})};
 const legitimate=rec&&plan&&rec.id===id&&
  rec.status==='recognised'&&rec.replications>=2&&rec.grade>=grade&&
  rec.sourceResearchPlan===plan.source&&
  plan.parameters?.creationScopeHash===hash(target)&&
  rec.truth?.feasibility!=='not_as_framed';
 return {documented:!!legitimate};
}
function analysis(s,raw){
 const p=input(raw),spec=SYSTEMS[p.system],skill=FUNCTIONS[p.function],
  rank=C.int(s.player?.skills?.[spec.skill]?.rank??0,
   'earned '+spec.skill+' skill',0,5),
  researchRank=C.int(s.player?.skills?.research?.rank??0,'earned research rank',0,5),
  novelty=R.NOVELTY[p.novelty],effectGrade=B.effectGrade(p.magnitude,
   {trivial:p.magnitude===0}),
  status=attained(s,p.system),gaps=[];
 const known=sealedResearch(s,p,effectGrade);
 // A basic mundane tool should not require an academic degree or paid
 // researcher. Its real materials, physical trial and skill check will decide
 // if it works. Advanced, supernatural and genuinely novel effects do need
 // independent knowledge and proof.
 const ordinaryPrototype=p.system==='mundane'&&p.magnitude<=1&&
  ['rediscovery','variant'].includes(p.novelty)&&
  ['sense','signal','ward','shape','move','support'].includes(p.function);
 const requiredSkill=ordinaryPrototype?0:novelty.rank;
 if(rank<requiredSkill)gaps.push('Earn genuine '+spec.skill+' skill rank '+requiredSkill+' or credible independently supported collaboration');
 if(!ordinaryPrototype&&p.novelty!=='rediscovery'&&
  researchRank<novelty.rank)
  gaps.push('Obtain suitable documented research competence or an independently validated research team');
 if(ordinaryPrototype){
  gaps.push('A physical prototype and appropriately checked ordinary trial are still required before this tool can work');
 }else if(!known.documented)
  gaps.push('No independently replicated, scope-matching technical proof has yet established this precise effect');
 if(p.novelty==='rediscovery'&&!known.documented)
  gaps.push('Rediscovery needs an actual existing source; a self-declared tradition is not a source');
 if(p.medium!=='technique'&&p.medium!=='ritual'&&
  p.materials.length===0)
  gaps.push('A tangible design needs a real bill of materials or explicitly established reusable facility');
 const missingMaterials=p.materials.filter(m=>
  !Number.isInteger(s.player.inventory?.[m.id])||s.player.inventory[m.id]<m.quantity)
  .map(m=>({id:m.id,need:m.quantity,recorded:s.player.inventory?.[m.id]||0}));
 if(missingMaterials.length)gaps.push('Proposed inputs are not fully held or sourced; item material qualities are not inferred from their name or cost');
 const hasUnverifiedMaterials=p.materials.some(m=>
  !Object.hasOwn(E.RESOURCES,m.id)&&
  !s.table?.materialRecords?.[m.id]?.verified);
 if(hasUnverifiedMaterials)gaps.push('Novel material identities and grades require authenticated discovery and appraisal');
 let budget=null;
 if(p.system==='arcane'){
  budget=arcaneBudget(p);
  if(budget.unsupportedMagnitude||budget.minCircle===null||
     !status.verified||status.stage<Math.max(1,budget.minCircle??10))
   gaps.push('An actually constructed compatible Arcane Circle cannot presently support this formula');
  if(!budget.unsupportedMagnitude&&budget.minCircle!==null){
   const cap=B.arcaneProfile(Math.max(0,Math.min(9,status.stage)),{
    ignited:!!s.player.arcane?.coreIgnited});
   if(cap.maxComplexity===undefined||
      cap.maxComplexity<budget.complexity||
      cap.loadTolerance<budget.load)
    gaps.push('Verified Circle geometry and casting load cannot yet support the proposed formula');
   if((s.player.mana??0)<budget.mana)
    gaps.push('Actual available Mana is below the calculated activation cost');
  }
 }else if(p.system==='meridian'){
  if(!status.verified)gaps.push('A genuine mapped Meridian route and at least one actual Lower Gate are not yet established');
  if(p.function==='strike'&&
    !['self','touch','close','medium','long'].includes(p.range))
   gaps.push('The proposed projection has no valid Meridian range model');
  if(p.magnitude>=2&&status.stage<4)
   gaps.push('Advanced circulation and safely opened relevant gates require separate source proof');
  if(p.function==='strike'&&p.magnitude<=5&&
   ['single','3m','10m'].includes(p.area)&&
   ['self','touch','close','medium','long'].includes(p.range)){
   budget={qi:B.qiTechniqueCost({damage:6+2*p.magnitude,
    rng:p.range==='self'?'touch':p.range,area:p.area,
    projectionM:p.magnitude}),kind:'provisional physical technique budget'};
  }
 }else if(p.system==='soul'){
  const minimum=p.function==='sense'?1:
   p.function==='signal'?3:p.function==='mend'?4:
   p.function==='ward'?2:4;
  budget={minimumPhaseForThisConcept:minimum};
  if(!status.verified||status.stage<minimum)
   gaps.push('The actual Soul phase does not establish the required spiritual anatomy and engineering basis');
 }else if(p.system==='rift'){
  const min=p.function==='sense'?1:p.function==='signal'?2:
   p.function==='move'?3:p.function==='ward'?4:5;
  budget={minimumRiftStepForThisConcept:min};
  if(!status.verified||status.stage<min)
   gaps.push('A real Rift practice milestone, spatial boundary witness and compatible anchor are required');
 }else if(p.system==='body'){
  if(!status.verified)gaps.push('No genuinely completed Body refinement cycle has established the anatomical basis');
 }else if(p.system==='origin'){
  if(!status.verified)gaps.push('Source-backed Origin Pattern, physical capacity and stable integrated traits are not established');
 }else if(p.system==='partnership'){
  if(!s.player.partnerIds?.length)
   gaps.push('No real willing partner, bilateral contract and witnessed synchronisation history exists');
  gaps.push('Two independently authenticated capabilities and mutual consent must be assessed; beast abilities cannot simply be copied');
 }else if(['runes','formations','alchemy','healing'].includes(p.system)){
  gaps.push('Specialist progress, material and stability standards require source-backed individual records; ordinary Crafting rank alone cannot grant supernatural effects');
 }
 if(p.function==='mend'&&p.magnitude>=2)
  gaps.push('This primitive still only supports superficial repair; major healing needs another verified medical mechanism');
 if(p.duration==='permanent')
  gaps.push('Persistent effects need source-backed endurance, maintenance, environmental degradation and failure modes; permanence is not awarded by a word');
 if(['device','medicine','formation','infrastructure','tool'].includes(p.medium)&&
  p.system!=='mundane')
  gaps.push('A real worksite, compatible substrate and commissioned build procedure must be witnessed');
 if(p.medium==='shared-work'||p.system==='partnership')
  gaps.push('Named beast or human participants must agree to each trial and retain independent rights');
 // Even when a source happens to match, a paper appraisal NEVER mints a
 // working effect, grants a technique or writes an item into inventory.
 const scope={medium:p.medium,system:p.system,function:p.function,
  magnitude:p.magnitude,range:p.range,area:p.area,duration:p.duration,
  ...(p.target?{target:p.target}:{})};
 const researchBudget={grade:effectGrade,
  theoreticalDC:10+2*effectGrade+novelty.dc,
  progressionTrack:novelty.base+5*effectGrade,
  nominalMaterialsPerSixdayTalons:R.COST[effectGrade],
  researchLeadRank:novelty.rank,
  interpretation:'Provisional canon research maths, not an accepted project, paid materials or proof of feasibility'};
 const deviceMaterialGrade=(p.medium==='device'||p.medium==='formation'||
  p.medium==='infrastructure')&&p.system!=='mundane'?
  effectGrade:null;
 if(deviceMaterialGrade!==null)
  gaps.push('No authenticated material grade and stable compatible substrate certify the proposed powered structure');
 return {proposal:p,scopeHash:hash(scope),
  envelope:{function:p.function,meaning:skill.meaning,
   magnitude:p.magnitude,effectGrade,range:p.range,area:p.area,
   duration:p.duration,novelty:p.novelty,medium:p.medium,
   system:p.system,
   // A material cost cannot be minted from provenance-free inventory.
   provisionalArcaneOrQiBudget:budget,
   researchBudget:{...researchBudget,ordinaryPrototypeRoute:ordinaryPrototype},
   requiredAuthenticatedMaterialGrade:deviceMaterialGrade,
   notACopyOfParentOrBeastPower:true},
  prerequisites:{skill:spec.skill,earnedRank:rank,
   noveltyLeadRankRequired:requiredSkill,earnedResearchRank:researchRank,
   disciplineStage:status.stage,stageVerified:status.verified,
   matchingReplicatedEvidence:known.documented,missingMaterials},
  gaps:[...new Set(gaps)],
  stage:'idea-under-evaluation',
  noTechniqueLearned:true,noItemCreated:true,noPractisedPowerGranted:true,
  note:'This is a mechanical effect envelope and research proposal, NOT a proved recipe, certified technique, usable artefact or general spell licence. The freeform name/purpose cannot expand the envelope.'};
}
function evaluate(s,p={}){return analysis(s,p);}
function draft(s,p={}){
 const v=analysis(s,p);
 if(s.battle||s.encounter)
  throw Error('A dangerous active encounter prevents a settled technical-design session');
 const combat=s.table?.combatants?.player;
 if(combat&&combat.status!=='ok')
  throw Error('An incapacitated researcher cannot independently draft a technical plan');
 const sta=C.int(s.player.stamina,'actual remaining design stamina',0,100000);
 if(sta<STAMINA+1)throw Error('Insufficient Stamina for even a careful technical design session');
 const old=s.world.minutes;
 s.player.stamina-=STAMINA;
 E.advance(s,MINUTES);W.finalizeTime(s,old);H.sync(s,{source:'legacy'});
 s.table||={};s.table.creationDesigns||={counter:0,records:{}};
 const ledger=s.table.creationDesigns;
 if(!Number.isInteger(ledger.counter)||ledger.counter<0||!ledger.records||
  typeof ledger.records!=='object')throw Error('Unverified invention design ledger');
 const id='design_'+(++ledger.counter),source={
  origin:ORIGIN,id,creator:s.player.name,
  authoredAtMinute:old,finishedAtMinute:s.world.minutes,
  location:s.world.location,proposalHash:hash(v.proposal),skill:v.prerequisites.skill,
  earnedRank:v.prerequisites.earnedRank,scopeHash:v.scopeHash};
 const entry={id,origin:ORIGIN,source,sourceHash:hash(source),
  proposalHash:hash(v.proposal),
  proposal:v.proposal,scopeHash:v.scopeHash,envelope:v.envelope,
  prerequisites:v.prerequisites,gaps:v.gaps,
  status:'unproven-concept',implementedEffect:false,
  privatelyKnownToPlayer:true};
 ledger.records[id]=entry;
 C.event(s,'research','A technical invention concept is recorded, not built or proven.',{
  origin:ORIGIN,id,sourceHash:entry.sourceHash,scopeHash:v.scopeHash,
  noFreeItem:true,noFreeTechnique:true,minutes:MINUTES,
  staminaSpent:STAMINA});
 return {id,recorded:true,elapsedMinutes:MINUTES,staminaSpent:STAMINA,
  ...v,requiresIndependentProof:true};
}
function status(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).some(k=>k!=='id')||
  (p.id!==undefined&&(typeof p.id!=='string'||!/^[a-z][a-z0-9_]{3,60}$/.test(p.id))))
  throw Error('Creation status is read-only and cannot supply material grade, design results or new records');
 const ledger=s.table?.creationDesigns,items=ledger?.records||{};
 const rows=p.id?[items[p.id]].filter(Boolean):Object.values(items);
 return {designs:rows.slice(-35).map(x=>{
  if(x.origin!==ORIGIN||x.sourceHash!==hash(x.source)||
    x.source.id!==x.id||x.scopeHash!==x.source.scopeHash||
    (x.proposalHash!==undefined&&
     (x.proposalHash!==hash(x.proposal)||x.source.proposalHash!==x.proposalHash))||
    !['unproven-concept','prototyped','trial-failed'].includes(x.status)||
   x.implementedEffect!==false)
   throw Error('An invention dossier is not source verified');
  return {id:x.id,title:x.proposal.title,purpose:x.proposal.purpose,
   medium:x.envelope.medium,system:x.envelope.system,
   boundMechanism:x.envelope.function,effectGrade:x.envelope.effectGrade,
   gaps:x.gaps.slice(),status:x.status,prototypeId:x.prototypeId||null,
   noItemCreated:!x.prototypeId,noTechniqueLearned:true};
 }),note:'Only your actual recorded unproven inventions; a proposal is not a hidden completed item, spell or verified world fact.'};
}
module.exports={ORIGIN,FUNCTIONS,SYSTEMS,input,analysis,evaluate,draft,status,
 _debug:{hash,attained,arcaneBudget,sealedResearch}};
