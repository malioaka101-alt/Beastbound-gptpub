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
const MEDIUMS=['technique','device','medicine','ritual','aspect-form','formation','tool','infrastructure','shared-work'];
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
  medium:textField(raw.medium,'proposed medium',3,100),
  system:raw.system,
  function:textField(raw.function,'proposed mechanism',3,120),
  magnitude:raw.magnitude,range:raw.range,area:raw.area,
  duration:raw.duration,novelty:raw.novelty
 };
 if(raw.target!==undefined){
  // Targets are GM-authored proposals, not a fixed list of permissible
  // inventions. Only an actual researched/implemented mechanism can later
  // give an authored target a physical or supernatural effect. This text
  // alone never changes world state or authorises a technique.
  p.target=textField(raw.target,'proposed target',3,160);
 }
 if(!Object.hasOwn(SYSTEMS,p.system)||
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
 const p=input(raw),spec=SYSTEMS[p.system],
  knownMechanism=Object.hasOwn(FUNCTIONS,p.function),
  knownMedium=MEDIUMS.includes(p.medium),
  skill=knownMechanism?FUNCTIONS[p.function]:{
   family:null,meaning:'Original GM-authored unverified mechanism; no working effect, energy budget or capability is established by this proposal.'},
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
 const ordinaryPrototype=knownMechanism&&knownMedium&&
  p.system==='mundane'&&p.magnitude<=1&&
  ['rediscovery','variant'].includes(p.novelty)&&
  ['sense','signal','ward','shape','move','support'].includes(p.function);
 if(!knownMechanism)
  gaps.push('Original mechanism is unverified: establish physical or supernatural causal evidence and an appropriate bounded action before any effect can operate');
 if(!knownMedium)
  gaps.push('Original medium is unverified: its physical form, limits and feasible execution must be established before manufacture, activation or use');
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
  p.medium!=='aspect-form'&&p.materials.length===0)
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
 if(p.system==='arcane'&&knownMechanism){
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
 }else if(p.system==='soul'&&knownMechanism){
  const minimum=p.function==='sense'?1:
   p.function==='signal'?3:p.function==='mend'?4:
   p.function==='ward'?2:4;
  budget={minimumPhaseForThisConcept:minimum};
  if(!status.verified||status.stage<minimum)
   gaps.push('The actual Soul phase does not establish the required spiritual anatomy and engineering basis');
 }else if(p.system==='rift'&&knownMechanism){
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
 // An unfamiliar primitive has no verified cross-discipline scaling or
 // executable budget. The GM can still keep the idea, research it and
 // later establish an original bounded mechanism rather than a fixed menu.
 if(!knownMechanism&&['arcane','meridian','soul','rift'].includes(p.system))
  gaps.push('No proved energy or physiology model yet supports this original mechanism; no spell, technique, stage or cost is inferred');
 if(p.function==='mend'&&p.magnitude>=2)
  gaps.push('This primitive still only supports superficial repair; major healing needs another verified medical mechanism');
 if(p.duration==='permanent')
  gaps.push('Persistent effects need source-backed endurance, maintenance, environmental degradation and failure modes; permanence is not awarded by a word');
 if(p.medium==='aspect-form'){
  gaps.push('A proposed personal transformation requires authenticated anatomy, support and activation fuel, duration, strain, injury, cooldown, mental effects and reversibility before any appearance or trait changes');
  if(p.range!=='self'||p.area!=='single')
   gaps.push('A bodily aspect-form cannot claim to transform other people or a whole area without its own verified separate mechanism');
 }
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
   ...(x.personalDevelopment?{personalExpression:{
    progress:x.personalDevelopment.progress,required:PERSONAL_REQUIRED,
    identityMilestone:x.personalDevelopment.identity?.milestone,
    originalCharacter:x.personalDevelopment.identity?.character,
    completed:(()=>{try{return earnedPersonal(s,x.id).developmentCompleted;}catch{return false;}})(),
    independentlyLearnedForm:false
   }}:{}),
   noItemCreated:!x.prototypeId,noTechniqueLearned:true};
 }),note:'Only your actual recorded unproven inventions; a proposal is not a hidden completed item, spell or verified world fact.'};
}

// Personal expressions are a DEVELOPMENT PATH inside the same creation
// dossier, not another universal cultivation ladder.  A name, proposed form
// and school rank remain insufficient to wield any unverified mechanism.
// The engine gathers only actually earned, player-known personal sources.
const PERSONAL_ORIGIN='character-authored-creation-expression-v1';
const PERSONAL_REQUIRED=3;
const PERSONAL_MEDIA=Object.freeze(['technique','ritual','aspect-form']);
const PERSONAL_SOURCE=Object.freeze({
 soul:Object.freeze({name:'Soul Threading',skill:'cultivation',attribute:'wis',resource:'soul'}),
 arcane:Object.freeze({name:'Third Circle Resonance Matrix',skill:'arcana',attribute:'int',resource:'mana'}),
 meridian:Object.freeze({name:'Dantian Sea Formation',skill:'cultivation',attribute:'wis',resource:'qi'}),
 body:Object.freeze({name:'Organ Cycle Refinement',skill:'survival',attribute:'con',resource:'stamina'}),
 rift:Object.freeze({name:'Rift Anchor Marking',skill:'arcana',attribute:'int',resource:'stamina'})
});
function actualPersonalSource(s,system){
 const spec=PERSONAL_SOURCE[system],p=s.player;
 if(!spec)throw Error('This path has no verified personal manifestation anatomy yet; a draft may be saved, but a power cannot be invented from an unmeasured structure');
 let source;
 if(system==='soul'){
  const Thread=require('./soul-threading');
  const achieved=Thread.earned(s);
  if(achieved.phase!==2)throw Error('Genuinely earned Soul Threading is required');
  source={kind:'soul-threading',proof:hash(p.soul.threadProof),
   integrity:achieved.integrity,links:achieved.links};
 }else if(system==='rift'){
  const Anchors=require('./rift-anchors'),a=Anchors.earned(s);
  if(p.rift.step!==2)throw Error('Earn an actual spatial reference before developing personal Rift expressions');
  source={kind:'rift-anchor',proof:hash(p.rift.anchorProof),
   location:a.location,integrity:a.integrity};
 }else if(system==='body'){
  const Disc=require('./disciplines'),a=Disc.organEarned(s);
  source={kind:'organ-refinement',proof:hash(p.body.organAdaptation),
   cycles:a.cycle,systems:a.systems};
 }else if(system==='arcane'){
  const Disc=require('./disciplines'),a=Disc.verifyThirdCircle(s);
  source={kind:'arcane-matrix',proof:hash(p.arcane.matrixGeometry),
   proofSource:hash(s.table.arcaneArchitecture.circle3),
   channels:a.channels,integrity:a.integrity};
 }else if(system==='meridian'){
  const Disc=require('./disciplines'),a=Disc.seaStatus(s),w=s.table?.meridianSeaFormation;
  const phys=s.table?.powerPhysiology?.meridian,last=w?.attempts?.at(-1);
  if(p.meridian?.stage!==4||!a.formed||
     !p.meridian.dantianSea||p.meridian.dantianSea.rings!==1||
     w?.points!==5||!Number.isInteger(w?.formedAtMinute)||
     w.formedAtMinute!==p.meridian.dantianSea.formedAtMinute||
     !Array.isArray(w.attempts)||!w.attempts.length||
     !last?.formed||last.progress!==5||
     last.minute!==w.formedAtMinute||
     !Number.isInteger(last.roll)||last.roll<1||last.roll>20||
     !Array.isArray(phys?.gateRecords)||phys.gateRecords.length!==108||
     !Array.isArray(p.meridian.gates)||p.meridian.gates.length!==108||
     ![36,72,108].every(gate=>phys.transitions?.some(t=>
       t.gate===gate&&t.day===phys.gateRecords[gate-1]?.day))||
     !phys.gateRecords.every((g,i)=>g.number===i+1&&
       p.meridian.gates[i]?.number===g.number&&
       p.meridian.gates[i]?.quality===g.quality&&
       Number.isInteger(g.day)&&g.day>=1&&g.day<=E.day(s)))
   throw Error('A genuinely developed, recorded Stage IV Dantian Sea is required');
  source={kind:'meridian-sea',proof:hash(p.meridian.dantianSea),
   stage:4,rings:p.meridian.dantianSea.rings};
 }
 return {spec,source};
}
function originalDesign(s,id){
 if(typeof id!=='string'||!/^design_[1-9][0-9]*$/.test(id))
  throw Error('A genuine existing invention dossier ID is required');
 const d=s.table?.creationDesigns?.records?.[id];
 if(!d||d.origin!==ORIGIN||d.id!==id||d.source?.id!==id||
    d.source.creator!==s.player.name||d.source.origin!==ORIGIN||
    d.sourceHash!==hash(d.source)||
    d.proposalHash!==hash(d.proposal)||
    d.source.proposalHash!==d.proposalHash||
    d.scopeHash!==d.source.scopeHash||
    !['unproven-concept','trial-failed','prototyped'].includes(d.status)||
    d.implementedEffect!==false)
  throw Error('A personal expression must extend the original source-verified creation.draft, not an invented design');
 const p=input(d.proposal);
 if(!PERSONAL_MEDIA.includes(p.medium)||!PERSONAL_SOURCE[p.system])
  throw Error('An earned personal expression needs a genuine discipline technique, ritual or aspect-form design and a real verified power foundation');
 if(d.prototypeId)throw Error('A previously prototyped device cannot be relabelled as a learned personal manifestation');
 return {d,p};
}
function personalIdentity(s,system){
 const {spec,source}=actualPersonalSource(s,system),p=s.player;
 const attrs=Object.entries(p.attributes).filter(([k,v])=>
  ['str','dex','con','int','wis','cha'].includes(k)&&
  Number.isInteger(v)&&v>=1&&v<=30)
  .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
 const skills=Object.entries(p.skills||{}).filter(([,v])=>
  Number.isInteger(v?.rank)&&v.rank>=0&&v.rank<=5)
  .sort((a,b)=>b[1].rank-a[1].rank||a[0].localeCompare(b[0]));
 const history=(s.table?.disciplineTraining?.[system]?.history||[])
  .filter(x=>x&&Number.isInteger(x.day)&&x.day>=1&&
   x.day<=E.day(s)&&typeof x.change==='string')
  .slice(-4).map(x=>({day:x.day,earned:x.change.slice(0,180)}));
 return {source,sourceHash:hash(source),milestone:spec.name,
  character:p.name,background:String(p.background||'unknown').slice(0,80),
  chosenPath:String(p.path||'undecided').slice(0,80),
  trainedSpecialties:skills.slice(0,3).map(([skill,v])=>({skill,rank:v.rank})),
  strongestFacets:attrs.slice(0,2).map(([attribute,value])=>({attribute,value})),
  personallyEarnedHistory:history};
}
function earnedPersonal(s,id){
 const {d,p}=originalDesign(s,id),rec=d.personalDevelopment;
 if(!rec||rec.origin!==PERSONAL_ORIGIN||rec.designId!==id||
    rec.proposalHash!==d.proposalHash||!rec.identity||
    rec.identityHash!==hash(rec.identity)||
    rec.identity.character!==s.player.name||
    !Array.isArray(rec.attempts)||rec.attempts.length<1||
    !Number.isInteger(rec.progress)||rec.progress!==PERSONAL_REQUIRED||
    !rec.completed||!Number.isInteger(rec.completedMinute)||
    rec.completedMinute>s.world.minutes||
    rec.attemptsHash!==hash(rec.attempts))
  throw Error('The claimed individual technique has no authentic completed creation-development record');
 const identity=personalIdentity(s,p.system);
 if(identity.sourceHash!==rec.identity.sourceHash)
  throw Error('The personal technique has lost its original verified physical, arcane or spiritual source');
 let counted=0;
 for(const a of rec.attempts){
  if(!a||!Number.isInteger(a.startedMinute)||a.startedMinute<d.source.finishedAtMinute||
     !Number.isInteger(a.minutes)||a.minutes<15||a.minutes>480||
     a.startedMinute+a.minutes>s.world.minutes||
     a.originalCheck?.type!=='roll'||
     a.rollHash!==hash(a.originalCheck)||
     !['success','strong','exceptional','setback','failure','severe failure'].includes(a.degree)||
     a.earned!==({'exceptional':3,'strong':2,'success':1}[a.degree]||0)||
     a.originalCheck.details?.degree!==a.degree||
     !Number.isInteger(a.staminaSpent)||a.staminaSpent<1||
     !Number.isInteger(a.energySpent)||a.energySpent<0)
   throw Error('The personal technique work needs real recorded effort and original skill checks');
  counted=Math.min(PERSONAL_REQUIRED,counted+a.earned);
 }
 if(counted!==PERSONAL_REQUIRED||rec.completedMinute!==
    rec.attempts.at(-1).startedMinute+rec.attempts.at(-1).minutes)
  throw Error('The personal technique was not genuinely developed to a completed result');
 const soulUse=p.system==='soul'&&p.medium==='technique'&&
  p.function==='sense'&&p.magnitude===0&&p.range==='self'&&
  p.area==='single'&&p.duration==='instant';
 const combatUse=['arcane','meridian'].includes(p.system)&&
  p.medium==='technique'&&p.function==='strike'&&p.magnitude===0&&
  p.range==='close'&&p.area==='single'&&p.duration==='instant';
 // A completed personal Body Ward aspect may manifest actual already
 // refined human organs. No beast traits, wings or extra new tissues.
 // Its specific defensive anatomy still derives from the individual's
 // source-verified constitution recorded in this same design dossier.
 const bodyAspect=p.system==='body'&&p.medium==='aspect-form'&&
  p.function==='ward'&&p.magnitude===0&&p.range==='self'&&
  p.area==='single'&&['round','1min','10min'].includes(p.duration);
 const use=soulUse?'soul-perception-personal-precision':
  combatUse?p.system==='arcane'?'arcane-spark-personal-variation':
   'meridian-qi-strike-personal-variation':
  bodyAspect?'body-organ-personal-aspect':null;
 // A genuinely strong physical constitution develops controlled impact,
 // while perception and coordination favour precision. Based on the
 // character's strongest facet at the first experiment, not a preset
 // school technique or caller-supplied roll modifier.
 const dominant=rec.identity.strongestFacets?.[0]?.attribute;
 const signatureMode=combatUse?
  ['str','con'].includes(dominant)?'impact':'precision':null;
 const aspectMode=bodyAspect?
  ['str','con'].includes(dominant)?'fortitude':'balance':null;
 return {id,name:p.title,system:p.system,medium:p.medium,
  mechanism:p.function,characterBasis:rec.identity,
  developmentCompleted:true,earnedVariation:!!use,usableAdapter:use,
  ...(signatureMode?{signatureMode,
    signatureBasis:rec.identity.strongestFacets[0]}:{}),
  ...(aspectMode?{aspectMode,
    aspectBasis:rec.identity.strongestFacets[0],
    boundedToExistingOrgans:true,reversible:true}:{}),
  notAnAutomaticTransformation:!bodyAspect,
  missingMechanism:use?null:'The chosen manifestation still needs an authenticated exact execution adapter, costs, physical limits and counterplay'};
}
function personalStatus(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>k!=='id'))
  throw Error('Personal creation status cannot provide a claimed stage, effect or check');
 const ledger=s.table?.creationDesigns?.records||{};
 const rows=p.id?[ledger[p.id]].filter(Boolean):Object.values(ledger)
  .filter(x=>x?.personalDevelopment);
 return {expressions:rows.slice(-35).map(d=>{
  const {p:design}=originalDesign(s,d.id),r=d.personalDevelopment;
  if(!r)return {id:d.id,started:false,completed:false};
  let earned=null,reason=null;
  if(r.completed)try{earned=earnedPersonal(s,d.id);}catch(e){reason=e.message;}
  return {id:d.id,name:design.title,system:design.system,
   medium:design.medium,progress:r.progress||0,required:PERSONAL_REQUIRED,
   completed:!!earned,characterBasis:r.identity?.character,
   milestone:r.identity?.milestone,
   trainedSpecialties:r.identity?.trainedSpecialties||[],
   strongestFacets:r.identity?.strongestFacets||[],
   personallyEarnedHistory:r.identity?.personallyEarnedHistory||[],
   usableAdapter:earned?.usableAdapter||null,
   signatureMode:earned?.signatureMode||null,
   aspectMode:earned?.aspectMode||null,
   ...(!earned&&r.completed?{reason}:{}),
   noFreeTransformation:true,noFreeNewSpell:true};
 }),source:'Existing creation.draft dossiers shaped by actual recorded personal anatomy, skill and lived work'};
}
function developPersonal(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>!['id','minutes','approach'].includes(k)))
  throw Error('Only a real existing design, actual practice duration and personal method may be supplied');
 const {id,minutes=120,approach}=p;
 const {d,p:design}=originalDesign(s,id);
 C.int(minutes,'actual personal technique development minutes',15,480);
 if(typeof approach!=='string'||approach.trim().length<12||
    approach.length>500||/[\u0000-\u001f]/.test(approach))
  throw Error('Describe your actual experimental approach; declaring a rank or automatic form is not practice');
 if(s.battle||s.encounter)
  throw Error('An unresolved encounter cannot be skipped for an independent creative training period');
 if(!E.LOCATIONS[s.world.location]||
    s.table?.combatants?.player?.status&&
    s.table.combatants.player.status!=='ok')
  throw Error('A real safe scene and a conscious practitioner are required');
 const identity=personalIdentity(s,design.system),spec=PERSONAL_SOURCE[design.system];
 // Developing a personal strike means refining an EXISTING individually
 // mastered combat technique, not receiving a spell from Circle level.
 const combatVariation=['arcane','meridian'].includes(design.system)&&
  design.medium==='technique'&&design.function==='strike'&&
  design.magnitude===0&&design.range==='close'&&
  design.area==='single'&&design.duration==='instant';
 if(combatVariation){
  if(design.system==='arcane')
   require('./arcane-spark').attackProfile(s,'arcane_spark');
  else require('./meridian-qi-strike').attackProfile(s,'qi_strike');
 }
 const rec=d.personalDevelopment;
 if(rec&&(rec.completed||rec.origin!==PERSONAL_ORIGIN||
    rec.designId!==id||rec.proposalHash!==d.proposalHash||
    rec.identityHash!==hash(rec.identity)||
    rec.identity.sourceHash!==identity.sourceHash||
    !Array.isArray(rec.attempts)||
    !Number.isInteger(rec.progress)||rec.progress<0||
    rec.progress>=PERSONAL_REQUIRED))
  throw Error('Continue the same previously witnessed individual practice; never replace it with a favourable new design');
 const staminaSpent=Math.ceil(minutes/120);
 const energySpent=design.system==='soul'?1:
  ['arcane','meridian'].includes(design.system)?2:0;
 const pchar=s.player;
 if(!Number.isInteger(pchar.stamina)||pchar.stamina<staminaSpent||
    s.table?.combatants?.player&&
    s.table.combatants.player.stamina<staminaSpent)
  throw Error('Actual physical stamina is required for personal creative practice');
 const energy=spec.resource==='soul'?pchar.soul.reserve:
  spec.resource==='mana'?pchar.mana:spec.resource==='qi'?pchar.qi:pchar.stamina;
 if(!Number.isInteger(energy)||energy<energySpent)
  throw Error('An actual available discipline energy source is required');
 const start=s.world.minutes,rank=C.int(pchar.skills?.[spec.skill]?.rank??0,
  'earned personal practice skill',0,5),attribute=C.int(pchar.attributes?.[spec.attribute],
  'practised attribute',1,30);
 const budget=B.effectGrade(design.magnitude,{trivial:design.magnitude===0});
 const dc=15+Math.min(6,budget);
 const check=C.check(s,{modifier:Math.floor((attribute-10)/2)+2*rank,
  dc,label:spec.name+' — '+design.title.slice(0,42)+' personal experiment'});
 pchar.stamina-=staminaSpent;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=pchar.stamina;
 if(design.system==='soul')pchar.soul.reserve-=energySpent;
 if(design.system==='arcane')pchar.mana-=energySpent;
 if(design.system==='meridian')pchar.qi-=energySpent;
 const record=rec||{origin:PERSONAL_ORIGIN,designId:id,
  proposalHash:d.proposalHash,identity,
  identityHash:hash(identity),progress:0,completed:false,attempts:[]};
 record.progress=Math.min(PERSONAL_REQUIRED,record.progress+check.progress);
 const originalCheck=structuredClone(s.log.at(-1));
 const entry={startedMinute:start,minutes,approach:approach.trim(),
  originalCheck,rollHash:hash(originalCheck),degree:check.degree,
  earned:check.progress,staminaSpent,energySpent};
 record.attempts.push(entry);
 let completed=false;
 if(record.progress>=PERSONAL_REQUIRED){
  record.completed=true;record.completedMinute=start+minutes;
  record.attemptsHash=hash(record.attempts);completed=true;
 }
 d.personalDevelopment=record;
 E.advance(s,minutes);W.finalizeTime(s,start);H.sync(s,{source:'legacy'});
 C.event(s,'research',completed?
  'This practitioner has developed an individual expression of the recorded design, subject to its original physical and technique limits.':
  'An original experimental personal technique is refined from the practitioner’s actual abilities.',{
  origin:PERSONAL_ORIGIN,id,identityHash:record.identityHash,
  originalCheck:check,progress:record.progress,
  staminaSpent,energySpent,minutes,completed,
  noAutomaticTransformation:true,noInventedTechnique:true});
 const applied=completed?earnedPersonal(s,id):null;
 return {id,name:design.title,system:design.system,check,
  progress:record.progress,required:PERSONAL_REQUIRED,
  developed:completed,staminaSpent,energySpent,elapsedMinutes:minutes,
  characterBasis:record.identity,usableAdapter:applied?.usableAdapter||null,
  signatureMode:applied?.signatureMode||null,
  aspectMode:applied?.aspectMode||null,
  noFreeTransformation:true,noInventedPower:true,
  note:applied?.missingMechanism||'Develop the original design through real effort before a supported ability can be exercised'};
}
function personalForUse(s,id){
 const e=earnedPersonal(s,id);
 if(e.usableAdapter!=='soul-perception-personal-precision')
  throw Error('This individual form has no established runnable effect; it needs documented physiological or spell adaptation before activation');
 return e;
}
function usePersonal(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).sort().join('|')!=='id')
  throw Error('Use only an already earned personal design ID; no chosen success, grade, secret target, energy or bonus');
 const e=earnedPersonal(s,p.id);
 if(e.usableAdapter==='body-organ-personal-aspect')
  return require('./personal-aspect').activate(s,p.id,{combat:false});
 if(e.usableAdapter!=='soul-perception-personal-precision')
  throw Error('This individual form has no established runnable effect; it needs documented physiological or spell adaptation before activation');
 // Reuse the very same bounded Soul Perception action, original single die,
 // ecology, personal presence, and privacy protections. The optional style
 // is read-only source-verified before the real action consumes resources.
 const result=require('./first-stage-senses').perceive(s,{},p.id);
 return {...result,expression:{id:e.id,name:e.name,
  sourceMilestone:e.characterBasis.milestone,
  personallyDeveloped:true,noExtraPowerCopied:true}};
}


// Source-verified combat variation for the EXISTING exchange resolver.
// The native learned technique remains the underlying action and the
// opponent still independently chooses its response before the one roll.
function revertPersonal(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
    Object.keys(params).length)
  throw Error('Releasing an active aspect takes one real physical action; no chosen instant cooldown or free form reversion');
 return require('./personal-aspect').revert(s,{combat:false});
}
function combatPersonal(s,id,intent,nativeProfile){
 if(!['cast','technique'].includes(intent))
  throw Error('Only a genuinely learned Arcane Spark or Qi Strike can carry this personal combat expression');
 const e=earnedPersonal(s,id);
 const wanted=intent==='cast'?'arcane-spark-personal-variation':
  'meridian-qi-strike-personal-variation';
 const technique=intent==='cast'?'arcane_spark':'qi_strike';
 if(e.usableAdapter!==wanted||nativeProfile?.techniqueId!==technique)
  throw Error('The developed expression does not match this exact learned action');
 const resource=intent==='cast'?'mana':'qi',extra=intent==='cast'?1:2;
 const base=intent==='cast'?nativeProfile.manaCost:nativeProfile.qiCost;
 const p=s.player;
 if(!Number.isInteger(p[resource])||p[resource]<base+extra)
  throw Error('The personal expression needs the original learned technique cost plus additional real '+resource);
 if(!Number.isInteger(p.stamina)||p.stamina<1||
    s.table?.combatants?.player&&s.table.combatants.player.stamina<1)
  throw Error('The individual combat expression also consumes one real Stamina');
 const mode=e.signatureMode;
 if(!['precision','impact'].includes(mode))
  throw Error('No genuine character-derived precision or physical force was recorded');
 return {id:e.id,name:e.name,mode,
  sourceMilestone:e.characterBasis.milestone,
  sourceFacet:e.signatureBasis,
  resource,extraEnergy:extra,extraStamina:1,
  profile:{...nativeProfile,
   modifier:nativeProfile.modifier+(mode==='precision'?1:0),
   damage:nativeProfile.damage+(mode==='impact'?1:0),
   ...(intent==='cast'?{manaCost:base+extra}:{qiCost:base+extra})
  },
  noSecondRoll:true,noAutomaticEvolution:true,noFreeForm:true};
}

module.exports={ORIGIN,PERSONAL_ORIGIN,FUNCTIONS,SYSTEMS,input,analysis,evaluate,draft,status,
 personalStatus,developPersonal,earnedPersonal,personalForUse,usePersonal,revertPersonal,combatPersonal,
 _debug:{hash,attained,arcaneBudget,sealedResearch}};
