'use strict';
// Distinct, source-grounded early advancement procedures. The track lengths/DCs
// follow System Additions 18 and the supplied bb_progress.py reference vectors.
// Later stages are explicitly blocked pending their anatomical/ethical rules.
const C=require('./core'),E=require('../engine'),W=require('./world');
const U=require('./unified'),Combat=require('./combat'),Build=require('./build');
const Crypto=require('node:crypto');
const SoulThreads=require('./soul-threading');
const RiftAnchors=require('./rift-anchors');
const KEYS={
 meridian:{skill:'cultivation',attribute:'wis',focus:['breath','tissue','circulation'],tracks:{foundation:[40,12],awakening:[72,13]}},
 arcane:{skill:'arcana',attribute:'int',focus:['mana-attunement','core-geometry','formulae'],tracks:{core:[40,12],circle1:[100,12]}},
 soul:{skill:'cultivation',attribute:'wis',focus:['self-awareness','identity-ward','resonance'],tracks:{phase1:[100,12]}},
 body:{skill:'survival',attribute:'con',focus:['muscle','tendon','recovery','bone','marrow'],tracks:{cycle1:[150,12],cycle2:[180,14]}},
 rift:{skill:'arcana',attribute:'int',focus:['boundaries','orientation','anchor-theory'],tracks:{sense:[50,12]}}
};
const permitted=(s,system)=>s.world.location==='academy'||
  (system==='body'&&['forest','hills'].includes(s.world.location))||
  (system==='meridian'&&s.world.location==='forest')||
  (system==='rift'&&s.world.location==='ruins');
const cap=(x,a,b)=>Math.min(b,Math.max(a,x));
// Early personal breathing, introspection, movement and core study require
// the practitioner's own body, not a named institution. Environmental Rift
// sensing, however, genuinely needs a nearby documented spatial anomaly.
const EVERYWHERE=Object.freeze(Object.keys(E.LOCATIONS));
const SELF_SITES=Object.freeze({
 meridian:EVERYWHERE,arcane:EVERYWHERE,
 soul:EVERYWHERE,body:EVERYWHERE,rift:['ruins']
});
function independentSite(s,system,{shortSession=false}={}){
 const site=s.world?.location,loc=E.LOCATIONS[site];
 if(!loc||!SELF_SITES[system]?.includes(site))
  throw Error('This discipline requires a genuinely suitable existing practice environment; choose a different real location');
 if(s.battle||s.encounter)
  throw Error('An unresolved threat cannot be treated as an uneventful independent practice period');
 const c=s.table?.combatants?.player;
 if(c&&c.status!=='ok')
  throw Error('An incapacitated character cannot perform self-directed training');
 if(!shortSession&&s.player?.partnerIds?.length)
  throw Error('Sixday independent practice with animal partners needs real separately funded and witnessed care');
 return {site,name:loc.name,biome:loc.biome};
}
function independentSource(system,method,location){
 const loc=E.LOCATIONS[location];
 return 'Personal '+system+' '+method+' practice using the existing '+loc.name+
  ' environment and the practitioner\'s own recorded anatomy/energy';
}

// A witnessed explanation can improve practical understanding without
// implying the speaker has personally mastered the discipline. This is an
// optional contextual aid, NEVER a required teacher, fee, source of stage,
// or client-chosen success or bonus.
// A speaker's ACTUAL author-established profession and public topic are the
// evidence of what the explanation covers. Do not maintain a magic whitelist
// of two teacher names; new naturally encountered experts work if their real
// authored words/subject support the requested theory. An explicitly
// authored breadth list permits a non-practising polymath to know many fields.
const THEORY_TOPICS=Object.freeze({
 meridian:Object.freeze({profession:/\b(?:meridian|qi)\b/i,
  topic:/\b(?:gate|gates|meridian|circulation|qi|primary)\b/i}),
 arcane:Object.freeze({profession:/\b(?:arcane|mana|spell)\b/i,
  topic:/\b(?:mana|circle|circles|formula|formulae|casting)\b/i}),
 soul:Object.freeze({profession:/\b(?:soul|spirit|spiritual)\b/i,
  topic:/\b(?:soul|spirit|identity|resonance)\b/i}),
 body:Object.freeze({profession:/\b(?:body|physique|tissue)\b/i,
  topic:/\b(?:muscle|tendon|bone|marrow|organs|refinement)\b/i}),
 rift:Object.freeze({profession:/\b(?:rift|spatial|boundary)\b/i,
  topic:/\b(?:rift|boundary|anchor|fold|spatial)\b/i})
});
function relevantPublicTheory(npc,system){
 const rule=THEORY_TOPICS[system];
 if(!rule||typeof npc?.profession!=='string'||
    typeof npc?.topic!=='string'||npc.topic.trim().length<15)
  return false;
 const declared=Array.isArray(npc.publicExpertise)&&
  npc.publicExpertise.includes(system);
 return !!(rule.topic.test(npc.topic)&&
  (declared||rule.profession.test(npc.profession)));
}
function witnessedTheory(s,system,guideId){
 if(guideId===undefined)return null;
 const npc=typeof guideId==='string'?E.NPCS[guideId]:null;
 if(!npc||!relevantPublicTheory(npc,system))
  throw Error('No source-backed relevant theoretical knowledge from that person is established');
 const loc=E.LOCATIONS[npc.location];
 // Once genuinely heard, theoretical understanding can travel with the
 // learner. A teacher does not need to remain physically nearby forever.
 const ledger=s.table?.npcConversations;
 // A genuine earlier professional explanation survives later unrelated
 // small talk. The *most recent conversation of any topic* is not proof of
 // teaching, nor may it erase the saved original sourced lesson.
 const row=ledger?.records?.slice().reverse().find(x=>
  x.npcId===guideId&&x.origin==='witnessed-npc-professional-topic'&&
  x.heard===npc.topic);
 const source='Direct in-person professional conversation with '+npc.name+
  ' at '+loc.name;
 if(!row||row.heard!==npc.topic||row.name!==npc.name||
    row.profession!==npc.profession||row.location!==npc.location||
    row.source!==source||row.origin!=='witnessed-npc-professional-topic'||
    !Number.isInteger(row.day)||row.day<1||row.day>E.day(s)||
    !Number.isInteger(row.worldMinute)||row.worldMinute>s.world.minutes||
    typeof row.eventHash!=='string'||
    !/^[a-f0-9]{64}$/.test(row.eventHash)||
    ledger?.visits?.[guideId]?.[String(row.day)]!==row.eventHash)
  throw Error('An actual witnessed relevant professional explanation is required before using its theory');
 const found=s.log?.find(x=>x?.details?.origin==='engine-local-npc-conversation'&&
  x.details.npcId===guideId&&
  x.text===npc.name+', '+npc.profession+', says: “'+npc.topic+'”');
 const memorised=s.npcKnowledge?.[npc.name]?.some(x=>
  x.fact===npc.topic&&x.source===source&&x.day===row.day&&
  x.eventHash===row.eventHash);
 if(!memorised||!Number.isInteger(s.npcMemory?.[npc.name])||
   s.npcMemory[npc.name]<1)
  throw Error('The purported advice is not part of the learner\'s actual witnessed knowledge');
 if(found&&Crypto.createHash('sha256').update(JSON.stringify(found))
  .digest('hex')!==row.eventHash)
  throw Error('The saved theoretical explanation no longer matches its original witnessed dialogue');
 return {sourceId:guideId,kind:'witnessed-relevant-theory',source,
  witnessHash:row.eventHash,bonus:1,practitionerRankClaimed:false,
  aDemonstration:false,automaticLearning:false};
}
const completed=s=>Math.floor(s.world.minutes/1440);
function currentTarget(s,system){
 const p=s.player;
 switch(system){
  case 'meridian':return p.meridian.stage===0?'foundation':p.meridian.stage===1?'awakening':null;
  case 'arcane':return !p.arcane.coreIgnited?'core':p.arcane.circles===0?'circle1':null;
  case 'soul':return p.soul.phase===0?'phase1':null;
  case 'body':return p.body.cycles.length===0?'cycle1':
   p.body.cycles.length===1&&p.body.cycles[0]==='Muscle-Tendon Cycle'?'cycle2':null;
  case 'rift':return p.rift.step===0?'sense':null;
  default:return null;
 }
}
function methodsFor(system,target){
 if(system==='body')return target==='cycle1'?['muscle','tendon','recovery']:
   target==='cycle2'?['bone','marrow','recovery']:[];
 return KEYS[system]?.focus||[];
}
function state(s,system){
 if(!KEYS[system])throw Error('Unsupported discipline');
 s.table ||= {};s.table.disciplineTraining ||= {};
 const stored=s.table.disciplineTraining;
 stored[system] ||= {target:currentTarget(s,system),points:0,weeks:0,methods:{},cooldownUntil:0,complications:[],history:[]};
 if(!stored[system].target)throw Error(`${system} is beyond the current tested discipline ritual; advanced milestones need a distinct sourced procedure`);
 return stored[system];
}
// Arcane II is structural revision of an actually constructed First Circle,
// not a numerical reward for an existing Mana pool. A verbal blueprint is
// intent, not validation or an instant magical effect.
function firstArcaneArchitecture(s){
 const a=s.player?.arcane,history=s.table?.disciplineTraining?.arcane?.history;
 const core=history?.find(x=>x.target==='core'&&
  x.change==='Mana Core ignited, no Circle yet'),
  first=history?.find(x=>x.target==='circle1'&&
   typeof x.change==='string'&&x.change.startsWith('First Circle constructed; '));
 const profile=Build.arcaneProfile(1);
 if(!a||a.coreIgnited!==true||a.circles!==1||
  typeof a.geometry!=='string'||a.geometry.trim().length<10||
  !core||!first||!Number.isInteger(core.day)||core.day<1||
  !Number.isInteger(first.day)||first.day<core.day||
  first.day>E.day(s)||first.change!=='First Circle constructed; '+a.geometry||
  a.structuredMana!==profile.mana||a.channels!==profile.channels||
  a.maxComplexity!==profile.maxComplexity||
  !Number.isInteger(a.coreStability)||a.coreStability<0||
  a.coreStability>100)
  throw Error('Second Circle requires a genuinely earned, source-dated and internally consistent Mana Core and First Circle architecture');
 return {core,first,profile};
}
function arcaneCircleWork(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
  Object.keys(params).some(k=>!['design','minutes','route','guidanceId'].includes(k)))
  throw Error('Circle construction accepts only a genuine freeform design, session time and practice route, not chosen checks, ranks or effects');
 const {design,minutes=180,route='independent',guidanceId}=params;
 if(route!=='independent')throw Error('Second Circle currently supports source-verified independent architecture, not an invented tutor or school clearance');
 if(typeof design!=='string'||design.trim().length<20||design.length>500)
  throw Error('Describe a concrete dual-channel redesign of the existing Circle, not an automatic spell or a blank rank claim');
 C.int(minutes,'actual Arcane construction minutes',15,480);
 const self=independentSite(s,'arcane',{shortSession:true});
 const theory=witnessedTheory(s,'arcane',guidanceId);
 const {first}=firstArcaneArchitecture(s);
 const a=s.player.arcane;
 if(a.coreStability<40)throw Error('The Mana Core is too unstable for a structural redesign without real treatment');
 if(!Number.isInteger(s.player.mana)||s.player.mana<2)
  throw Error('Two units of actual available Mana are required to attempt a dual-channel working');
 const old=s.table?.arcaneCircleRevision;
 if(old&&(old.target!==2||old.originalGeometry!==a.geometry||
  !Array.isArray(old.attempts)||!Number.isInteger(old.progress)||
  old.progress<0||old.progress>3))
  throw Error('The existing Second Circle revision record conflicts with the actual First Circle');
 const startMinute=s.world.minutes,from=a.geometry;
 const work=old||{target:2,originalGeometry:from,progress:0,attempts:[]};
 const designNote=design.trim();
 const result=C.check(s,{modifier:modifier(s,'arcane')+
  (a.coreStability>=85?1:a.coreStability<60?-2:0)+(theory?.bonus||0),
  dc:17,label:'Second Arcane Circle — dual-channel integration'});
 const effort=result.success?(result.degree==='exceptional'?4:
  result.degree==='strong'?3:2):0;
 // Consume actual mana only after all material/anatomical prerequisites were
 // met. The check remains the sole source of success and complications.
 s.player.mana-=2;
 work.progress+=effort;
 let backlash=false;
 if(result.degree==='severe failure'){
  backlash=true;a.coreStability=Math.max(0,a.coreStability-7);
  U.ensurePlayer(s);Combat.harm(s,Combat.get(s,'player'),2);
  U.sync(s,{source:'wounds'});
 }else if(result.success)a.coreStability=Math.min(100,a.coreStability+1);
 const priorIndex=s.log.length-1,
  check=result,
  attempt={startedMinute:startMinute,location:self.site,design:designNote,
   firstGeometry:from,sourceDay:first.day,checkIndex:priorIndex,
   theoreticalGuidance:theory,result:check.degree,
   earnedIntegrity:effort,manaSpent:2,
   stabilityAfter:a.coreStability};
 work.attempts.push(attempt);
 s.table||={};s.table.arcaneCircleRevision=work;
 let constructed=false;
 if(work.progress>=4){
  const next=Build.arcaneProfile(2);
  // Capacity/profile upgrades do not teach new spells, copy beast traits,
  // reset spent mana or change independent Qi, Soul, Body or Rift stages.
  a.circles=2;
  a.structuredMana=next.mana;
  a.channels=next.channels;
  a.maxComplexity=next.maxComplexity;
  a.intake=next.intake;
  a.loadTolerance=next.loadTolerance;
  a.preparedCapacity=next.prepared;
  const oldMaximum=s.player.maxMana;
  s.player.maxMana=Math.max(oldMaximum,next.mana);
  const witness={stage:'Second Circle — Dual Channeling',number:2,
   priorGeometry:from,integratedDesign:designNote,
   developedFromFirstCircleDay:first.day,completedMinute:startMinute+minutes,
   channelCount:next.channels,structuredMana:next.mana,
   originalSource:'first-circle-architecture-revision-v1',
   attemptCount:work.attempts.length,noNewSpellGranted:true};
  s.table.arcaneArchitecture||={};s.table.arcaneArchitecture.circle2=witness;
  s.table.disciplineTraining.arcane.history.push({
   day:E.day(s),target:'circle2',quality:check.degree,
   change:'Second Circle constructed; dual channels integrated from the original First Circle',
   witnessSource:witness.originalSource});
  work.progress=4;work.completed=true;constructed=true;
 }
 E.advance(s,minutes);W.finalizeTime(s,startMinute);
 U.sync(s,{source:'legacy'});
 C.event(s,'progress',constructed?
  'The Second Arcane Circle is structurally integrated into two working channels.':
  backlash?'The Circle revision suffers genuine Arcane backlash.':
   'The original Circle geometry is being tested and revised.',{
   origin:'earned-second-circle-construction-v1',
   originalFirstCircle:from,location:self.site,
   design:designNote,elapsedMinutes:minutes,roll:check.roll,
   theoreticalGuidance:theory,
   earnedIntegrity:effort,integrityProgress:work.progress,
   constructed,backlash,manaSpent:2,
   newSpells:0,noCompulsoryTeacher:true});
 return {system:'arcane',target:'circle2',route,
  constructed,progress:work.progress,required:4,
  check,manaSpent:2,minutes,backlash,coreStability:a.coreStability,
  newChannels:constructed?2:0,newSpellGranted:false,
  noAutomaticTechnique:true,noCompulsoryTeacher:true,tuitionTalons:0,
  theoreticalGuidance:theory};
}
function status(s){
 const systems={};
 for(const [system,spec] of Object.entries(KEYS)){
  const target=currentTarget(s,system),
   rec=s.table?.disciplineTraining?.[system],
   pair=target?spec.tracks[target]:null;
  const gateCount=system==='meridian'?s.player.meridian.gates?.length||0:0,
   seaReady=system==='meridian'&&s.player.meridian.stage===3&&gateCount===108,
   bodyThree=system==='body'&&s.player.body?.cycles?.length===2,
   soulTwo=system==='soul'&&s.player.soul?.phase===1,
   riftTwo=system==='rift'&&s.player.rift?.step===1,
   arcaneThree=system==='arcane'&&s.player.arcane.coreIgnited===true&&
    s.player.arcane.circles===2,
   arcaneTwo=system==='arcane'&&s.player.arcane.coreIgnited===true&&
    s.player.arcane.circles===1,
   gateAvailable=system==='meridian'&&s.player.meridian.stage>=2&&
    s.player.meridian.stage<=3&&gateCount<108,
   nextGate=gateCount+1,
   milestone=gateAvailable&&[36,72,108].includes(nextGate),
   gateDC=gateAvailable?(nextGate<=36?13:nextGate<=72?16:19)+
    (milestone?3:0):null;
  systems[system]={
   target:target||(gateAvailable?'Gate '+nextGate+'/108':seaReady?'Stage IV — Dantian Sea Formation':arcaneTwo?'Second Circle — Dual Channeling':arcaneThree?'Third Circle — Matrix Formation':bodyThree?'Cycle III — Organ Refinement':soulTwo?'Phase II — Soul Threading':riftTwo?'Step II — Anchor Marking':'advanced stage: procedure not implemented'),
   current:system==='meridian'?s.player.meridian.stage:
    system==='arcane'?(s.player.arcane.coreIgnited?'Core ignited':'No Core')+
     '; '+s.player.arcane.circles+' Circles':
    system==='body'?s.player.body.cycles.length:
    system==='soul'?s.player.soul.phase:s.player.rift.step,
   progress:target?(rec?.target===target?rec.points:0):
    gateAvailable&&s.table?.meridianGateTraining?.gate===nextGate?
     s.table.meridianGateTraining.progress:
    seaReady?s.table?.meridianSeaFormation?.points||0:
    arcaneThree?s.table?.arcaneMatrixRevision?.progress||0:
    arcaneTwo?s.table?.arcaneCircleRevision?.progress||0:
    bodyThree?Object.values(s.table?.organCycleWork?.systems||{}).reduce((n,x)=>n+x,0):
    soulTwo?Object.values(s.table?.soulThreadWork?.links||{}).reduce((n,x)=>n+x,0):
    riftTwo?Object.values(s.table?.riftAnchorWork?.axes||{}).reduce((n,x)=>n+x,0):0,
   required:pair?.[0]??(gateAvailable?
    nextGate<=36?3:nextGate<=72?5:8:seaReady?5:arcaneThree?6:arcaneTwo?4:bodyThree?8:soulTwo?6:riftTwo?6:null),
   dc:pair?.[1]??(seaReady?21:arcaneThree?20:arcaneTwo?17:bodyThree?17:soulTwo?16:riftTwo?18:gateDC),
   availableMethods:target?methodsFor(system,target):soulTwo?[...SoulThreads.FOCI]:riftTwo?[...RiftAnchors.FOCI]:[],
   nextEligibleDay:rec?.cooldownUntil||0,
   trainingRoutes:target||gateAvailable?['established','independent']:
    seaReady?['independent']:
    arcaneTwo||arcaneThree||bodyThree||soulTwo||riftTwo?['independent']:[],
   independentAvailableAtCurrentSite:!!(target||gateAvailable||seaReady||arcaneTwo||arcaneThree||bodyThree||soulTwo||riftTwo)&&
    SELF_SITES[system].includes(s.world.location),
   independentPracticeFeeTalons:0,
   independentPracticeDC:pair?pair[1]+2:seaReady?21:arcaneThree?20:arcaneTwo?17:bodyThree?17:soulTwo?16:riftTwo?18:gateDC,
   independentBreakthroughExtraDC:target?3:null,
   ...(target?{practiceSession:{
    minimumMinutes:15,maximumMinutes:480,
    staminaCost:'ceil(minutes / 120)',
    defaultRoute:'independent',noCompulsoryTeacher:true,
    noUniversalTuition:true,noMinimumCalendarDays:true,
    omittedMinutes:'legacy sixday course for existing callers'
   }}:{}),
   ...(riftTwo?{anchorWork:{
    site:'existing personally measured exterior Riftglass wardline',
    methods:[...RiftAnchors.FOCI],
    requiredPerAxis:2,integratedSpatialReference:true,
    sessionMinutes:{minimum:15,default:120,maximum:480},
    noCompulsoryTeacher:true,noFixedCalendarGate:true,
    noInstantTravel:true,noVaultAccess:true
   }}:{}),
   ...(soulTwo?{threadWork:{
    methods:[...SoulThreads.FOCI],
    requiredPerLink:2,integratedSoulBodyWork:true,
    reserveSpentPerAttempt:2,
    sessionMinutes:{minimum:15,default:120,maximum:480},
    noCompulsoryTeacher:true,noFixedCalendarGate:true,
    noFreeMindReadingOrContract:true
   }}:{}),
   ...(bodyThree?{organWork:{
    methods:[...ORGAN_FOCI],tissueIntegrityRequiredPerSystem:2,
    integratedBiologyNeeded:true,
    sessionMinutes:{minimum:15,default:120,maximum:480},
    noCompulsoryTeacher:true,noMandatoryAge:true,noFixedCalendarGate:true,
    noFreeQiManaOrEvolution:true
   }}:{}),
   ...(arcaneThree?{matrixWork:{
    goal:'Build a stable three-Circle resonance matrix, not a free compound spell',
    focusMethods:[...MATRIX_FOCI],requiredIntegrity:6,
    manaSpentPerAttempt:4,
    sessionMinutes:{minimum:15,default:180,maximum:480},
    noCompulsoryTeacher:true,noUniversalTuition:true,
    noFreeSpells:true
   }}:{}),
   ...(arcaneTwo?{circleWork:{
    goal:'Reconfigure the real First Circle for two stable mana channels',
    earnedIntegrityRequired:4,
    sessionMinutes:{minimum:15,default:180,maximum:480},
    manaSpentPerAttempt:2,noCompulsoryTeacher:true,
    optionalWitnessedTheory:true,noFreeSpellOnConstruction:true
   }}:{}),
   ...(seaReady?{dantianSeaWork:{
    methods:[...SEA_METHODS],requiredIntegrity:5,
    sessionMinutes:{minimum:15,default:120,maximum:480},
    qiSpentPerAttempt:8,noCompulsoryTeacher:true,
    noFreeTechnique:true
   }}:{}),
   ...(gateAvailable?{gatePractice:{
    nextGate,structuralTransition:milestone,
    sessionMinutes:{minimum:15,default:180,maximum:480},
    noCompulsoryTeacher:true,noUniversalTuition:true
   }}:{})
  };
 }
 return {systems,note:'Independent earned skills, physical Gates and Arcane Circles are different structures. No teacher, fee, elapsed age or preselected result unlocks a power.'};
}
function modifier(s,system){const sp=KEYS[system];const rank=s.player.skills?.[sp.skill]?.rank||0;return Math.floor((s.player.attributes[sp.attribute]-10)/2)+2*rank;}
function practice(s,{system,method,partTime=false,source,route=source===undefined?'independent':'established',guidanceId,minutes}={}){
 // Legacy callers still choose a sixday course by omitting minutes. A
 // deliberate 15–480-minute attempt is equally real: actual effort, fatigue,
 // proof and engine roll determine progress, not an imposed school calendar.
 const short=minutes!==undefined;
 if(short)C.int(minutes,'actual practice session minutes',15,480);
 const spec=KEYS[system];if(!spec)throw Error('Unknown discipline');
 const chosenTarget=currentTarget(s,system);
 if(!methodsFor(system,chosenTarget).includes(method))
  throw Error('Method does not belong to the current biological or spiritual stage');
 if(!['established','independent'].includes(route))throw Error('Choose an actual supported practice route');
 if(typeof partTime!=='boolean')throw Error('Part-time practice must be explicitly true or false');
 const self=route==='independent'?independentSite(s,system,{shortSession:short}):null;
 if(!self&&!permitted(s,system))throw Error('No established safe practice setting here');
 if(!self&&(typeof source!=='string'||source.trim().length<12))
  throw Error('Record a concrete training situation or instructor');
 if(self&&source!==undefined)
  throw Error('Independent training sources come from the actual local environment, not a caller-authored teacher or manual');
 const theory=witnessedTheory(s,system,guidanceId);
 const fatigue=short?Math.ceil(minutes/120):0;
 if(short&&(!Number.isInteger(s.player.stamina)||
    s.player.stamina<fatigue))
  throw Error('This real practice session requires available Stamina to sustain the effort');
 const record=state(s,system),target=currentTarget(s,system);
 if(record.target!==target)throw Error('Training target does not match current anatomy; finish or reconcile earlier stage');
 if(completed(s)<record.cooldownUntil)throw Error('Physical/spiritual recovery is not yet complete');
 // The old established sixday course retains its known tuition. A brief
 // practice visit or conversation is not automatically a purchased lesson
 // and cannot claim the course's preparatory advantage merely by naming it.
 const [length,dc]=spec.tracks[target],
  fee=self||short?0:(partTime?1:2),
  actualDC=dc+(self||short?2:0);
 if(s.player.coins<fee)throw Error('Cannot pay for the selected instruction and materials');
 const actualMinutes=short?minutes:6*1440;
 const learnedSource=self?independentSource(system,method,self.site):source;
 const startMinute=s.world.minutes;
 if(self){
  C.event(s,'world','The practitioner begins genuine independent '+system+' '+method+' work at '+self.name+'.',{
   origin:'verified-independent-discipline-practice',system,target,method,
   location:self.site,biome:self.biome,source:learnedSource,
   actualDC,feeTalons:0,startMinute,timeDays:actualMinutes/1440,partTime
  });
  s.table||={};s.table.independentTraining||=[];
  s.table.independentTraining.push({
   system,target,method,location:self.site,startMinute,days:actualMinutes/1440,
   ...(short?{minutes:actualMinutes}:{}),
   source:learnedSource,eventIndex:s.log.length-1,
   eventHash:require('node:crypto').createHash('sha256')
    .update(JSON.stringify(s.log[s.log.length-1])).digest('hex')
  });
 }
 s.player.coins-=fee;
 if(short){
  s.player.stamina-=fatigue;
  if(s.table?.combatants?.player)
   s.table.combatants.player.stamina=s.player.stamina;
 }
 const check=C.check(s,{modifier:modifier(s,system)+(theory?.bonus||0),dc:actualDC,label:`${system} ${target} — ${method}`});
 const earned=check.progress*(partTime?0.5:1);record.points=cap(record.points+earned,0,length);
 if(short){
  record.sessions=(record.sessions||0)+1;
  record.sessionMinutes=(record.sessionMinutes||0)+minutes;
 }else record.weeks++;
 record.methods[method]=(record.methods[method]||0)+1;
 if(check.roll===20)s.player.insightPoints=(s.player.insightPoints||0)+1;
 let complication=null;
 if(check.degree==='severe failure'){
  const d=C.die(s),kind=d<=3?'strain injury':d<=5?'overtraining':d<=7?'resource shortage':d<=9?(self?'poor self-correction':'teacher interruption'):d<=13?'bad habit':d<=15?'discipline backlash':d<=17?'beast-related obligation':d<=19?'unexpected insight':'new opportunity';
  complication={roll:d,kind};record.complications.push({day:E.day(s),kind});
  if(d<=3||d===14||d===15){U.ensurePlayer(s);Combat.harm(s,Combat.get(s,'player'),2);U.sync(s,{source:'wounds'});}
  if(d<=5)record.cooldownUntil=completed(s)+6;
  if(d===18||d===19)s.player.insightPoints=(s.player.insightPoints||0)+1;
 }
 if(short){E.advance(s,minutes);W.finalizeTime(s,startMinute);}
 else W.advance(s,6);
 U.sync(s,{source:'legacy'});
 C.event(s,'progress',`${system} practice: ${method}; ${earned} training points.`,{
  system,target,earned,complication,route,source:learnedSource,actualDC,
  theoreticalGuidance:theory,location:s.world.location,
  elapsedMinutes:actualMinutes,staminaSpent:fatigue
 });
 return {system,target,method,check,earned,progress:record.points,required:length,
  complication,timeDays:actualMinutes/1440,elapsedMinutes:actualMinutes,
  staminaSpent:fatigue,feeTalons:fee,route,source:learnedSource,
  theoreticalGuidance:theory};
}
function staminaGain(s,n){
 const c=s.table?.combatants?.player;if(!c)throw Error('Wound model required before changing body stamina');
 s.player.maxStamina+=n;s.player.stamina+=n;c.maxStamina+=n;c.stamina+=n;
}
function meridianQi(s){
 const m=s.player.meridian,phys=s.table?.powerPhysiology?.meridian;
 const grades=phys?.gateRecords||[],P=grades.filter(g=>g.quality==='Perfect').length,
  S=grades.filter(g=>g.quality==='Sound').length,F=grades.filter(g=>g.quality==='Flawed').length;
 const profile=Build.meridianProfile(m.stage,{meridians:12,gatesP:P,gatesS:S,gatesF:F,seaRings:m.dantianSea?.rings||0});
 m.stableQiLimit=profile.qi;m.flow=profile.flow;m.recoveryRate=profile.recovery;
 if(profile.qi>s.player.maxQi){const diff=profile.qi-s.player.maxQi;s.player.maxQi=profile.qi;s.player.qi+=diff;}
 return profile;
}
function breakthrough(s,{system,source,insightSpent=0,geometry=null,route=source===undefined?'independent':'established',guidanceId}={}){
 const spec=KEYS[system];if(!spec)throw Error('Unknown discipline');
 if(!['established','independent'].includes(route))throw Error('Choose an actual supported breakthrough approach');
 const self=route==='independent'?independentSite(s,system):null;
 if(!self&&!permitted(s,system))throw Error('No established safe rite location');
 if(!self&&(typeof source!=='string'||source.trim().length<18))
  throw Error('A witnessed breakthrough rite and its setting are required');
 if(self&&source!==undefined)
  throw Error('Independent breakthrough preparation is based on the real site and anatomy, not caller-written evidence');
 const theory=witnessedTheory(s,system,guidanceId);
 const record=state(s,system),target=currentTarget(s,system);
 if(record.target!==target)throw Error('Stage changed without reconciling the track');
 if(completed(s)<record.cooldownUntil)throw Error('Breakthrough is still on recovery cooldown');
 const [length,dc]=spec.tracks[target];if(record.points<length)throw Error(`Incomplete ${target} training track`);
 if(Object.keys(record.methods).filter(k=>record.methods[k]>0).length<2)throw Error('At least two distinct training methods are needed before this milestone');
 C.int(insightSpent,'Insight spent',0,2);
 if((s.player.insightPoints||0)<insightSpent)throw Error('Not enough earned Insight');
 if(system==='arcane'&&target==='circle1'&&(!geometry||typeof geometry!=='string'||geometry.trim().length<10))throw Error('First Circle requires an established structural geometry');
 if(system==='arcane'&&target==='core'&&s.player.arcane.circles!==0)throw Error('Mana Core condition inconsistent');
 const fee=self?0:(system==='arcane'?5:3);
 if(s.player.coins<fee)throw Error('Selected rite preparations and safeguards not funded');
 const actualDC=dc+2+(self?3:0);
 const riteSource=self?independentSource(system,target,self.site):source;
 if(self){
  C.event(s,'world','A self-directed '+system+' '+target+' breakthrough is attempted at '+self.name+' using the practised anatomy and accumulated training.',{
   origin:'verified-independent-breakthrough',system,target,
   source:riteSource,location:self.site,startMinute:s.world.minutes,
   feeTalons:0,actualDC,insightSpent
  });
 }
 s.player.coins-=fee;s.player.insightPoints-=insightSpent;
 const check=C.check(s,{modifier:modifier(s,system)+2*insightSpent+(theory?.bonus||0),dc:actualDC,
  label:`${system} ${target} breakthrough`});
 let outcome,change=null;
 if(check.success){
  if(system==='meridian'){
   if(target==='foundation'){
    const quality=check.degree==='exceptional'?'Perfect':check.degree==='strong'?'Firm':'Sound';
    s.player.meridian.stage=1;s.player.meridian.foundation=20;staminaGain(s,2);
    (s.table.powerPhysiology ||= {}).meridian={foundationQuality:quality,primaryMapped:0,gateRecords:[],deviationHistory:[]};
    change='Stage I Foundation Tempering; '+quality+' structural foundation';
   }else{
    s.player.meridian.stage=2;s.player.meridian.awareness=12;
    s.table.powerPhysiology ||= {};s.table.powerPhysiology.meridian ||= {gateRecords:[],deviationHistory:[]};
    s.table.powerPhysiology.meridian.primaryMapped=12;meridianQi(s);
    change='Stage II Meridian Awakening; all 12 Primary Meridians consciously mapped';
   }
  }else if(system==='arcane'){
   if(target==='core'){s.player.arcane.coreIgnited=true;s.player.arcane.geometry='seeded core';s.player.arcane.structuredMana=Build.arcaneProfile(0).mana;change='Mana Core ignited, no Circle yet';}
   else{s.player.arcane.circles=1;s.player.arcane.geometry=geometry.trim().slice(0,100);const c=Build.arcaneProfile(1);s.player.arcane.structuredMana=c.mana;s.player.arcane.channels=c.channels;s.player.arcane.maxComplexity=c.maxComplexity;change='First Circle constructed; '+s.player.arcane.geometry;}
  }else if(system==='soul'){s.player.soul.phase=1;const profile=Build.soulProfile(1,{will:Math.floor((s.player.attributes.wis-10)/2)});s.player.soul.reserve=profile.soulReserve;s.player.soul.maxReserve=profile.soulReserve;s.player.soul.perceptionRange=profile.perceptionRangeMetres;change='Phase I Soul Perception; first stable perception';}
  else if(system==='body'){
    U.ensurePlayer(s);
    if(target==='cycle1'){
     s.player.body.cycles.push('Muscle-Tendon Cycle');staminaGain(s,2);
     s.table.combatants.player.offM=Math.max(s.table.combatants.player.offM,1);
     s.player.attributes.str+=1;
     if(s.player.capabilityProfile)s.player.capabilityProfile.domains.physical.strength.current=Math.min(20,s.player.capabilityProfile.domains.physical.strength.current+1);
     change='Completed Cycle I Muscle-Tendon refinement; +2 stamina, Might +1, M1 natural force';
    }else if(target==='cycle2'){
     if(s.player.body.cycles.length!==1||s.player.body.cycles[0]!=='Muscle-Tendon Cycle')
      throw Error('Bone-Marrow refining requires an authentically completed Muscle-Tendon Cycle');
     s.player.body.cycles.push('Bone-Marrow Cycle');
     const c=s.table.combatants.player;
     c.toughness+=1;c.boxes[1]+=1;
     change='Completed Cycle II Bone-Marrow refinement; +1 Toughness, +1 Serious wound box';
    }
   }
  else if(system==='rift'){s.player.rift.step=1;s.player.rift.sense={scope:'boundary weakness and spatial pressure only',requires:'Nearby anomaly or measured weak boundary',notTeleportation:true};change='Step I Rift Sense; bounded sensitivity to anomalies';}
  record.history.push({day:E.day(s),target,quality:check.degree,change});record.points=0;record.methods={};record.target=currentTarget(s,system);
  outcome='breakthrough';
 }else{
  if(check.degree==='setback'){record.cooldownUntil=completed(s)+12;outcome='stalled; two sixdays of recovery';}
  else if(check.degree==='failure'){record.cooldownUntil=completed(s)+24;outcome='stalled; four sixdays of recovery';}
  else{
   record.cooldownUntil=completed(s)+30;record.points=Math.floor(record.points*0.75);outcome='backlash; specialised medical review and a further rite required';
   U.ensurePlayer(s);Combat.harm(s,Combat.get(s,'player'),2);U.sync(s,{source:'wounds'});
   record.complications.push({day:E.day(s),kind:'breakthrough backlash',system,target});
  }
 }
 E.advance(s,180);W.finalizeTime(s,s.world.minutes-180);U.sync(s,{source:'legacy'});
 C.event(s,'progress',`${system} ${target}: ${outcome}${change?'; '+change:''}.`,{
  system,target,outcome,change,route,source:riteSource,actualDC,
  theoreticalGuidance:theory
 });
 return {system,target,outcome,change,check,route,source:riteSource,
  feeTalons:fee,minutes:180,retryAfterDay:record.cooldownUntil||null,
  theoreticalGuidance:theory};
}
// The 108-Gate path remains the same anatomy at every site. A character
// may work alone with their own real meridians; a teacher or tuition is not
// a general prerequisite. Distinct regional materials and actual injuries
// can matter without making an academy the sole progression route.
function gatePractice(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
   Object.keys(params).some(k=>!['force','source','route','metMilestone','minutes','guidanceId'].includes(k))||
   (params.metMilestone!==undefined&&params.metMilestone!==false))
  throw Error('Gate milestones come from verified prior anatomy and engine checks, never a caller-supplied transition rite or result');
 const {force=false,source,route=source===undefined?'independent':'established',minutes=180,guidanceId}=params;
 // This is real, freely chosen work duration, not an unlock clock. A gifted
 // practitioner can make an exceptional advance in one genuine session.
 C.int(minutes,'actual Gate practice minutes',15,480);
 if(typeof force!=='boolean')throw Error('Forced current must be a genuine declared choice');
 if(!['independent','established'].includes(route))
  throw Error('Choose a genuine independent or established practice route');
 const self=route==='independent'?independentSite(s,'meridian',{shortSession:true}):null;
 if(!self&&!permitted(s,'meridian'))throw Error('No established safe meridian practice setting');
 if(!self&&(typeof source!=='string'||source.trim().length<16))
  throw Error('A concrete existing assisted Gate-practice setting is required');
 if(self&&source!==undefined)
  throw Error('Independent Gate work uses real established anatomy and location, not a caller-authored teacher or manual');
 if(!self&&(s.battle||s.encounter||
   (s.table?.combatants?.player?.status&&s.table.combatants.player.status!=='ok')))
  throw Error('Immediate danger or incapacity prevents sixday Meridian practice');
 const p=s.player.meridian;
 if(p.stage<2)throw Error('Must awaken all Primary Meridians before touching the 108 Gates');
 if(p.stage>3)throw Error('Stage IV+ Gate work requires the dedicated advanced Meridian procedure');
 const phys=s.table?.powerPhysiology?.meridian;
 if(!phys||phys.primaryMapped!==12||
    !['Perfect','Firm','Sound','Thin','Cracked'].includes(phys.foundationQuality)||
    !Array.isArray(phys.gateRecords))
  throw Error('Twelve authenticated Primary Meridian routes and a real Foundation record are needed');
 const gates=p.gates||[];
 if(!Array.isArray(gates)||gates.length!==phys.gateRecords.length||
   gates.some((g,i)=>{
    const r=phys.gateRecords[i],band=i<36?'Lower':i<72?'Middle':'High';
    return !r||g.number!==i+1||r.number!==i+1||
     g.band!==band||r.band!==band||
     !['Perfect','Sound','Flawed'].includes(g.quality)||
     r.quality!==g.quality||!Number.isInteger(r.day)||
     r.day<0||r.day>E.day(s);
   }))
  throw Error('A verified sequence of prior Gate openings is required before a transition rite; no claimed Gate count can replace individual evidence');
 const next=gates.length+1;
 if(next>108)throw Error('All 108 Gates are already open');
 const transition=[36,72,108].includes(next);
 const [band,pts,dc]=next<=36?['Lower',3,13]:next<=72?['Middle',5,16]:['High',8,19];
 const gradeBonus=({Perfect:2,Firm:1,Sound:0,Thin:-1,Cracked:-2})[phys.foundationQuality];
 const theory=witnessedTheory(s,'meridian',guidanceId);
 const stage=s.table.meridianGateTraining ||= {gate:next,progress:0,forced:false};
 if(stage.gate!==next||!Number.isInteger(stage.progress)||stage.progress<0||
   typeof stage.forced!=='boolean')
  throw Error('Unreconciled current Gate training');
 const actualSource=self?independentSource('meridian','gate-'+next,self.site):source;
 // The structural boundary is real: its check is harder, but does NOT
 // require a pre-selected true flag, universal price or specific teacher.
 const actualDC=dc+(transition?3:0);
 const roll=C.check(s,{modifier:modifier(s,'meridian')+gradeBonus+(theory?.bonus||0),
  dc:actualDC,label:'Gate '+next+' ('+band+(transition?', structural transition':'')+')'});
 let gain=roll.progress,severe=roll.degree==='severe failure'||(force&&roll.margin<=-5);
 if(force){gain+=roll.success?2:1;stage.forced=true;}
 stage.progress+=gain;
 let deviation=null;
 if(severe){
  const base=band==='Lower'?0:band==='Middle'?1:2;
  const mitigation=C.check(s,{modifier:Math.floor((s.player.attributes.con-10)/2),
   dc:15,label:'Resist Qi deviation, Gate '+next});
  const severity=cap(base+(force&&band==='High'?1:0)-
   (mitigation.success?1:0),0,4);
  deviation=['Mild','Moderate','Severe','Critical','Catastrophic'][severity];
  phys.deviationHistory||=[];
  phys.deviationHistory.push({gate:next,day:E.day(s),severity:deviation});
  if(severity>=2){
   U.ensurePlayer(s);Combat.harm(s,Combat.get(s,'player'),severity>=3?3:2);
   U.sync(s,{source:'wounds'});
   stage.progress=Math.floor(stage.progress*.75);
  }
 }
 let opened=null;
 if(stage.progress>=pts){
  const quality=stage.forced?'Flawed':
   roll.degree==='exceptional'||(roll.degree==='strong'&&
   phys.foundationQuality==='Perfect')?'Perfect':'Sound';
  opened={number:next,band,quality};
  p.gates ||= [];p.gates.push(opened);
  phys.gateRecords.push({...opened,day:E.day(s)});
  if(transition){
   phys.transitions||=[];
   phys.transitions.push({gate:next,day:E.day(s),quality,
    route,source:actualSource});
  }
  p.stage=3;meridianQi(s);
  stage.gate=next+1;stage.progress=0;stage.forced=false;
 }
 const startMinute=s.world.minutes;
 E.advance(s,minutes);W.finalizeTime(s,startMinute);
 U.sync(s,{source:'legacy'});
 C.event(s,'progress',opened?
   'Opened Meridian Gate '+next+' ('+opened.quality+')':
   'Prepared Gate '+next+' ('+stage.progress+'/'+pts+')',{
    gate:next,band,roll:roll.roll,opened,deviation,transition,
    route,source:actualSource,site:s.world.location,actualDC,
    compulsoryTeacher:false,tuitionTalons:0,
    theoreticalGuidance:theory,practiceMinutes:minutes
   });
 return {gate:next,band,points:gain,required:pts,
  progress:opened?pts:stage.progress,opened,deviation,check:roll,
  route,source:actualSource,transition,actualDC,
  minutes,actualElapsedDays:minutes/1440,
  tuitionTalons:0,theoreticalGuidance:theory};
}

// Stage IV begins after the actual 108-Gate anatomy, not after a claimed
// count, player-written teacher statement, chosen DC or generic power rank.
// Existing Stage III sources retain their original history; no migration
// guesses old completed gates or awards a higher stage from stored Qi.
function seaPrerequisites(s){
 const p=s.player?.meridian,phys=s.table?.powerPhysiology?.meridian;
 if(!p||p.stage!==3)throw Error('Dantian Sea formation requires genuine Stage III completion');
 if(!phys||phys.primaryMapped!==12||
    !['Perfect','Firm','Sound','Thin','Cracked'].includes(phys.foundationQuality)||
    !Array.isArray(phys.gateRecords)||!Array.isArray(p.gates)||
    phys.gateRecords.length!==108||p.gates.length!==108)
  throw Error('All 108 individually recorded, anatomically consistent Meridian Gates are required');
 const history=s.table?.disciplineTraining?.meridian?.history||[];
 if(!history.some(h=>h.target==='foundation'&&
      typeof h.change==='string'&&h.change.startsWith('Stage I Foundation Tempering; ')&&
      Number.isInteger(h.day)&&h.day>=1&&h.day<=E.day(s))||
    !history.some(h=>h.target==='awakening'&&
      typeof h.change==='string'&&h.change.startsWith('Stage II Meridian Awakening; ')&&
      Number.isInteger(h.day)&&h.day>=1&&h.day<=E.day(s)))
   throw Error('The original earned Foundation and Primary Awakening records must exist');
 let perfect=0,flawed=0,lastDay=0;
 for(let i=0;i<108;i++){
  const a=p.gates[i],b=phys.gateRecords[i],
    band=i<36?'Lower':i<72?'Middle':'High';
  if(!a||!b||a.number!==i+1||b.number!==i+1||
     a.band!==band||b.band!==band||
     !['Perfect','Sound','Flawed'].includes(a.quality)||
     b.quality!==a.quality||
     !Number.isInteger(b.day)||b.day<1||
     b.day<lastDay||b.day>E.day(s))
   throw Error('Meridian Gate provenance is missing, unordered or incompatible with the current anatomy');
  lastDay=b.day;
  if(a.quality==='Perfect')perfect++;
  if(a.quality==='Flawed')flawed++;
 }
 for(const gate of [36,72,108]){
  const receipt=phys.transitions?.find(t=>t.gate===gate);
  const actual=phys.gateRecords[gate-1];
  if(!receipt||receipt.day!==actual.day||
     receipt.quality!==actual.quality||
     !['independent','established'].includes(receipt.route)||
     typeof receipt.source!=='string'||receipt.source.length<16)
   throw Error('The Lower, Middle and High Gate transitions require their original saved source receipts');
 }
 if(!Number.isInteger(p.stability)||p.stability<1||p.stability>100)
  throw Error('Dantian Sea work requires a recorded, viable circulation stability');
 if(s.battle||s.encounter||s.table?.combatants?.player?.status&&
    s.table.combatants.player.status!=='ok')
  throw Error('No high-pressure Dantian formation during combat, immediate danger or incapacity');
 return {perfect,flawed,foundationQuality:phys.foundationQuality};
}
const SEA_METHODS=Object.freeze(['compression','circulation','stabilisation','integrated']);
function seaStatus(s){
 const m=s.player.meridian,sea=m.dantianSea;
 if(m.stage>=4)return {stage:m.stage,formed:!!sea,
  sea:sea?{rings:sea.rings,density:sea.density,purity:sea.purity,
    stability:sea.stability,source:sea.source}:null,
  note:'Structural Dantian capacity is not a free learned technique, human evolution or another discipline'};
 let readiness=false,reason=null,quality=null;
 try{quality=seaPrerequisites(s);readiness=true;}catch(e){reason=e.message;}
 const work=s.table?.meridianSeaFormation;
 return {stage:m.stage,formed:false,ready:readiness,
  ...(reason?{reason}:{}),progress:work?.points||0,required:5,
  availableMethods:[...SEA_METHODS],
  noCompulsoryTeacher:true,noMinimumCalendarDays:true,
  earned108Gates:readiness?108:m.gates?.length||0,
  ...(readiness?{foundationQuality:quality.foundationQuality}:{}),
  note:'One attempted Stage IV formation is earned through a genuine independent check, with paid Qi/Stamina/time and setbacks. No free technique'};
}
function seaWork(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
    Object.keys(params).some(k=>!['method','minutes','guidanceId','approach'].includes(k)))
  throw Error('Dantian formation accepts only an actual method, duration, optional witnessed theory and descriptive approach; no chosen stage, dice, bonus or result');
 const {method,minutes=120,guidanceId,approach}=params;
 if(!SEA_METHODS.includes(method))throw Error('Choose a physically credible Dantian compression, circulation, stabilisation or integrated method');
 C.int(minutes,'actual Dantian formation minutes',15,480);
 if(approach!==undefined&&
    (typeof approach!=='string'||approach.trim().length<8||approach.length>240))
  throw Error('An optional Dantian approach must describe an actual attempt, not a claimed result');
 const quality=seaPrerequisites(s);
 const self=independentSite(s,'meridian',{shortSession:true});
 const theory=witnessedTheory(s,'meridian',guidanceId);
 const energySpent=8,staminaSpent=Math.ceil(minutes/120);
 if(s.player.qi<energySpent||s.player.stamina<staminaSpent)
  throw Error('Dantian Sea formation requires eight available Qi and real Stamina');
 const record=s.table.meridianSeaFormation ||= {
  points:0,attempts:[],formedAtMinute:null
 };
 if(record.formedAtMinute!==null||s.player.meridian.dantianSea)
  throw Error('Dantian Sea already exists; the same formation cannot be awarded twice');
 if(!Number.isInteger(record.points)||record.points<0||record.points>5||
    !Array.isArray(record.attempts)||record.attempts.length>500)
  throw Error('Invalid Stage IV work ledger; no roll may be made');
 const now=s.world.minutes,oldCurrentQi=s.player.qi,
  baseMod=modifier(s,'meridian'),flaws=quality.flawed,
  foundationBonus=quality.foundationQuality==='Perfect'?2:
    quality.foundationQuality==='Firm'?1:0,
  gateBonus=Math.min(2,Math.floor(quality.perfect/36)),
  dc=21+Math.floor(flaws/18)+
    (s.player.meridian.stability<70?2:0);
 // The user's wording names how they attempt the work but cannot set DC,
 // talent, output, difficulty, quality or another character's permission.
 s.player.qi-=energySpent;
 s.player.stamina-=staminaSpent;
 if(s.table?.combatants?.player)
  s.table.combatants.player.stamina=s.player.stamina;
 const check=C.check(s,{modifier:baseMod+foundationBonus+gateBonus+
   (theory?.bonus||0),dc,label:'Stage IV Dantian Sea '+method});
 const earned=check.degree==='exceptional'?5:check.progress;
 record.points=Math.min(5,record.points+earned);
 let backlash=null;
 if(check.degree==='severe failure'){
  backlash='Qi pressure injury';
  s.player.meridian.stability=Math.max(1,s.player.meridian.stability-4);
  U.ensurePlayer(s);
  Combat.harm(s,Combat.get(s,'player'),2);
  U.sync(s,{source:'wounds'});
 }
 let formed=false,profile=null;
 if(record.points>=5){
  const purity=Math.max(1,Math.min(9,3+Math.floor(quality.perfect/36)-
    Math.floor(flaws/27)));
  const density=Math.max(1,Math.min(9,3+Math.floor(quality.perfect/27)-
    Math.floor(flaws/36)));
  s.player.meridian.stage=4;
  s.player.meridian.dantianSea={
   rings:1,density,purity,stability:s.player.meridian.stability,
   source:'Self-directed formation from 108 saved Gates, three witnessed transitions and an original Dantian check',
   formedAtMinute:now
  };
  s.player.meridian.dantianDensity=density;
  const spentCurrent=s.player.qi;
  profile=meridianQi(s);
  // Newly earned storage capacity must not conjure an instantly full sea.
  s.player.qi=spentCurrent;
  record.formedAtMinute=now;
  formed=true;
 }
 const result={minute:now,method,source:independentSource('meridian','dantian-sea',self.site),
  roll:check.roll,degree:check.degree,earned,
  ...(approach?{approach:approach.trim().slice(0,240)}:{}),
  progress:record.points,formed};
 record.attempts.push(result);
 E.advance(s,minutes);W.finalizeTime(s,now);
 U.sync(s,{source:'legacy'});
 C.event(s,'progress',formed?
  'Stage IV Dantian Sea formed; a single structural sea ring now exists.':
  'Stage IV Dantian Sea work '+record.points+'/5',{
   origin:'stage-iv-earned-dantian-sea-v1',
   method,originalCheck:check,record:result,formed,
   qiSpent:oldCurrentQi-s.player.qi,staminaSpent,
   ...(formed?{sea:s.player.meridian.dantianSea,
    capacity:s.player.maxQi,
    learnedTechnique:false,humanEvolutionAwarded:false}:{}),
   backlash
  });
 return {system:'meridian',stage:s.player.meridian.stage,
  target:'Dantian Sea Formation',method,check,earned,
  progress:record.points,required:5,formed,
  qiSpent:energySpent,staminaSpent,minutes,
  route:'independent',feeTalons:0,backlash,
  ...(profile?{profile:{qiCapacity:s.player.maxQi,flow:profile.flow,
    recovery:profile.recovery,seaRings:1,learnedTechnique:false}}:{})
 };
}


// Third Arcane Circle: a true three-Circle resonant matrix is a redesign of
// two earned channels, NOT a renamed Meridian Gate, a purchased school rank,
// or automatic access to compound spells. Preserve the original Core, first
// geometry and all earlier known formulae.
const MATRIX_SOURCE='earned-third-circle-matrix-formation-v1';
const MATRIX_FOCI=Object.freeze([
 'resonance','cross-coupling','formula-feedback','integrated'
]);
const matrixHash=x=>Crypto.createHash('sha256')
 .update(JSON.stringify(x)).digest('hex');
function secondCircleEvidence(s){
 const a=s.player?.arcane,profile=Build.arcaneProfile(2);
 const history=s.table?.disciplineTraining?.arcane?.history||[];
 const core=history.find(h=>h.target==='core'&&
  h.change==='Mana Core ignited, no Circle yet');
 const first=history.find(h=>h.target==='circle1'&&
  typeof h.change==='string'&&h.change.startsWith('First Circle constructed; '));
 const second=history.find(h=>h.target==='circle2'&&
  h.change==='Second Circle constructed; dual channels integrated from the original First Circle');
 const work=s.table?.arcaneCircleRevision,proof=s.table?.arcaneArchitecture?.circle2;
 const attempts=work?.attempts;
 const last=Array.isArray(attempts)?attempts.at(-1):null;
 if(!a||a.coreIgnited!==true||
    typeof a.geometry!=='string'||a.geometry.trim().length<10||
    !Number.isInteger(a.coreStability)||a.coreStability<0||a.coreStability>100||
    !core||!first||!second||
    ![core,first,second].every(h=>Number.isInteger(h.day)&&h.day>=1&&h.day<=E.day(s))||
    !(core.day<=first.day&&first.day<=second.day)||
    first.change!=='First Circle constructed; '+a.geometry||
    second.witnessSource!=='first-circle-architecture-revision-v1'||
    work?.target!==2||work.originalGeometry!==a.geometry||
    work.progress!==4||work.completed!==true||
    !Array.isArray(attempts)||attempts.length<1||
    proof?.stage!=='Second Circle — Dual Channeling'||proof.number!==2||
    proof.priorGeometry!==a.geometry||
    proof.integratedDesign!==last?.design||
    proof.developedFromFirstCircleDay!==first.day||
    proof.originalSource!=='first-circle-architecture-revision-v1'||
    proof.noNewSpellGranted!==true||proof.channelCount!==2||
    proof.structuredMana!==profile.mana||
    proof.attemptCount!==attempts.length||
    !Number.isInteger(proof.completedMinute)||
    proof.completedMinute>s.world.minutes||
    proof.completedMinute-last.startedMinute<15||
    proof.completedMinute-last.startedMinute>480||
    second.quality!==last.result||
    attempts.some(x=>!Number.isInteger(x.startedMinute)||
      x.startedMinute<0||x.startedMinute>s.world.minutes||
      x.manaSpent!==2||x.sourceDay!==first.day||
      x.firstGeometry!==a.geometry||
      !['success','strong','exceptional','setback','failure','severe failure'].includes(x.result)||
      x.earnedIntegrity!==(x.result==='exceptional'?4:
       x.result==='strong'?3:x.result==='success'?2:0))||
    attempts.reduce((n,x)=>n+x.earnedIntegrity,0)<4)
  throw Error('The Third Circle needs the genuinely earned First/Second Circle source chain and original dual-channel design');
 return {a,profile,first,second,work,proof};
}
function thirdPrerequisites(s){
 const chain=secondCircleEvidence(s),a=chain.a,p=chain.profile;
 if(a.circles!==2||a.channels!==p.channels||
    a.structuredMana!==p.mana||
    a.maxComplexity!==p.maxComplexity||
    a.intake!==p.intake||
    a.loadTolerance!==p.loadTolerance||
    a.preparedCapacity!==p.prepared)
  throw Error('Matrix work needs a currently intact Second Circle, not a claimed higher Circle or legacy Mana reserve');
 if(a.coreStability<45)
  throw Error('The existing Mana Core is too unstable for a three-Circle matrix');
 if(s.table?.arcaneArchitecture?.circle3||a.matrixGeometry)
  throw Error('An existing Third Circle cannot be duplicated');
 return chain;
}
function verifyThirdCircle(s){
 const chain=secondCircleEvidence(s),a=chain.a;
 const p=Build.arcaneProfile(3);
 const work=s.table?.arcaneMatrixRevision,proof=s.table?.arcaneArchitecture?.circle3;
 const attempts=work?.attempts,last=Array.isArray(attempts)?attempts.at(-1):null;
 if(a.circles!==3||a.channels!==p.channels||a.structuredMana!==p.mana||
    a.maxComplexity!==p.maxComplexity||a.intake!==p.intake||
    a.loadTolerance!==p.loadTolerance||a.preparedCapacity!==p.prepared||
    !Number.isInteger(a.matrixIntegrity)||a.matrixIntegrity<40||
    a.matrixIntegrity>100||
    work?.target!==3||work.progress!==6||work.completed!==true||
    work.secondCircleHash!==matrixHash(chain.proof)||
    !Array.isArray(attempts)||attempts.length===0||
    attempts.some(x=>!Number.isInteger(x.startedMinute)||
      x.startedMinute<0||x.startedMinute>s.world.minutes||
      x.manaSpent!==4||x.staminaSpent<1||
      !MATRIX_FOCI.includes(x.focus)||
      !['success','strong','exceptional','setback','failure','severe failure'].includes(x.degree)||
      x.earned!==(x.degree==='exceptional'?6:
       x.degree==='strong'?3:x.degree==='success'?2:0))||
    attempts.reduce((n,x)=>n+x.earned,0)<6||
    proof?.stage!=='Third Circle — Matrix Formation'||
    proof.number!==3||proof.source!==MATRIX_SOURCE||
    proof.secondCircleHash!==work.secondCircleHash||
    proof.matrixGeometry!==a.matrixGeometry||
    proof.matrixGeometry!==last?.design||
    proof.integrity!==a.matrixIntegrity||
    proof.channels!==p.channels||proof.structuredMana!==p.mana||
    proof.noAutomaticSpells!==true||proof.earnedFromSecondCircleDay!==chain.second.day||
    !Number.isInteger(proof.completedMinute)||
    proof.completedMinute>s.world.minutes||
    proof.completedMinute-last.startedMinute<15||
    proof.completedMinute-last.startedMinute>480)
  throw Error('Third Circle Matrix Formation lacks consistent original earned structural evidence');
 return {stage:proof.stage,number:3,channels:p.channels,integrity:a.matrixIntegrity,
  first:chain.first,second:chain.second,proof};
}
function matrixStatus(s){
 const a=s.player?.arcane||{},work=s.table?.arcaneMatrixRevision;
 if(a.circles>=3){
  try{const verified=verifyThirdCircle(s);return {
   formed:true,verified:true,stage:verified.stage,
   integrity:verified.integrity,channels:verified.channels,
   noAutomaticSpells:true};}
  catch(e){return {formed:false,verified:false,reason:e.message,
   noAutomaticSpells:true};}
 }
 let available=true,reason=null;
 try{thirdPrerequisites(s);}catch(e){available=false;reason=e.message;}
 return {formed:false,ready:available,progress:work?.progress||0,required:6,
  focusMethods:[...MATRIX_FOCI],noMandatoryTeacher:true,noAutomaticSpells:true,
  ...(reason?{reason}:{}),
  note:'Earn a stable third resonance layer; no compound spell or formula is granted by rank alone'};
}
function matrixWork(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
    Object.keys(params).some(k=>!['design','focus','minutes','guidanceId','route'].includes(k)))
  throw Error('Matrix work accepts only genuine geometry design, focus, duration, optional witnessed theory and route; not chosen checks, ranks or spells');
 const {design,focus='integrated',minutes=180,route='independent',guidanceId}=params;
 if(route!=='independent')
  throw Error('The Third Circle currently has only a verified self-directed architecture route; no invented compulsory academy');
 if(!MATRIX_FOCI.includes(focus))
  throw Error('The Circle matrix needs real resonance, cross-coupling, formula feedback or integrated work');
 if(typeof design!=='string'||design.trim().length<30||design.length>500)
  throw Error('Describe the three interacting Circle geometries and feedback, not a rank declaration');
 C.int(minutes,'actual matrix construction minutes',15,480);
 const self=independentSite(s,'arcane',{shortSession:true});
 const chain=thirdPrerequisites(s);
 const theory=witnessedTheory(s,'arcane',guidanceId);
 const a=chain.a,manaSpent=4,staminaSpent=Math.ceil(minutes/120);
 if(!Number.isInteger(s.player.mana)||s.player.mana<manaSpent||
    !Number.isInteger(s.player.stamina)||s.player.stamina<staminaSpent)
  throw Error('Matrix work requires four real Mana and physical Stamina');
 const previous=s.table?.arcaneMatrixRevision;
 const secondCircleHash=matrixHash(chain.proof);
 if(previous&&(previous.target!==3||previous.secondCircleHash!==secondCircleHash||
    !Number.isInteger(previous.progress)||previous.progress<0||
    previous.progress>6||previous.completed===true||
    !Array.isArray(previous.attempts)||previous.attempts.length>500))
  throw Error('Third Circle work must extend the same witnessed Second Circle, never replace its source');
 const record=previous||{target:3,secondCircleHash,progress:0,
  attempts:[],completed:false};
 const start=s.world.minutes,designNote=design.trim();
 const coreMod=a.coreStability>=85?1:a.coreStability<60?-2:0;
 const check=C.check(s,{modifier:modifier(s,'arcane')+coreMod+(theory?.bonus||0),
  dc:20,label:'Third Circle — resonant matrix '+focus});
 const earned=check.degree==='exceptional'?6:check.degree==='strong'?3:
  check.degree==='success'?2:0;
 s.player.mana-=manaSpent;s.player.stamina-=staminaSpent;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
 let backlash=false;
 if(check.degree==='severe failure'){
  backlash=true;a.coreStability=Math.max(0,a.coreStability-9);
  U.ensurePlayer(s);Combat.harm(s,Combat.get(s,'player'),2);
  U.sync(s,{source:'wounds'});
 }else if(check.success)a.coreStability=Math.min(100,a.coreStability+1);
 record.progress=Math.min(6,record.progress+earned);
 const entry={startedMinute:start,location:self.site,focus,design:designNote,
  degree:check.degree,roll:check.roll,earned,manaSpent,staminaSpent};
 record.attempts.push(entry);
 s.table.arcaneMatrixRevision=record;
 let formed=false;
 if(record.progress>=6){
  const next=Build.arcaneProfile(3);
  const integrity=Math.min(100,Math.max(40,
   58+Math.max(0,check.margin)*2+Math.min(12,record.attempts.length*2)-
   Math.max(0,80-a.coreStability)));
  a.circles=3;a.channels=next.channels;a.structuredMana=next.mana;
  a.maxComplexity=next.maxComplexity;a.intake=next.intake;
  a.loadTolerance=next.loadTolerance;a.preparedCapacity=next.prepared;
  a.matrixGeometry=designNote;a.matrixIntegrity=integrity;
  s.player.maxMana=Math.max(s.player.maxMana,next.mana);
  const proof={stage:'Third Circle — Matrix Formation',number:3,
   source:MATRIX_SOURCE,secondCircleHash,
   earnedFromSecondCircleDay:chain.second.day,
   matrixGeometry:designNote,integrity,channels:next.channels,
   structuredMana:next.mana,completedMinute:start+minutes,
   noAutomaticSpells:true};
  s.table.arcaneArchitecture.circle3=proof;
  s.table.disciplineTraining.arcane.history.push({
   day:E.day(s),target:'circle3',quality:check.degree,
   change:'Third Circle constructed; the three-Circle resonance matrix is stable',
   witnessSource:MATRIX_SOURCE});
  record.progress=6;record.completed=true;formed=true;
 }
 E.advance(s,minutes);W.finalizeTime(s,start);U.sync(s,{source:'legacy'});
 C.event(s,'progress',formed?
  'The third Mana Circle settles into a verified stable resonance matrix.':
  backlash?'Unstable matrix feedback strains the Mana Core.':
  'Three-Circle resonance work continues.',{
   source:MATRIX_SOURCE,design:designNote,focus,site:self.site,
   originalCheck:check,earned,progress:record.progress,formed,backlash,
   manaSpent,staminaSpent,minutes,noAutomaticSpell:true,
   ...(formed?{matrixIntegrity:a.matrixIntegrity,channels:a.channels}: {})
 });
 return {system:'arcane',target:'circle3',formed,progress:record.progress,
  required:6,focus,check,backlash,minutes,manaSpent,staminaSpent,
  route,feeTalons:0,coreStability:a.coreStability,
  ...(formed?{matrixIntegrity:a.matrixIntegrity,channels:a.channels}:{}),
  noAutomaticSpell:true,independent:true};
}


// Canon §23: Organ Cycle is a biological transformation, not Meridian Stage III,
// a universal character rank, or mere elapsed training. The functional
// systems represented here are heart, lungs, liver and kidneys; integrated
// work includes their coordination with other organs. Exceptional integrated
// practice can advance several tissues in the SAME genuine check.
const ORGAN_NAMES=Object.freeze(['heart','lungs','liver','kidneys']);
const ORGAN_FOCI=Object.freeze([...ORGAN_NAMES,'integrated']);
const ORGAN_ORIGIN='earned-body-organ-cycle-iii-v1';
const organDigest=x=>Crypto.createHash('sha256')
 .update(JSON.stringify(x)).digest('hex');
const organPoints=()=>({heart:0,lungs:0,liver:0,kidneys:0});
function organPrerequisites(s){
 const p=s.player,body=p?.body,h=s.table?.disciplineTraining?.body?.history||[];
 if(!body||!Array.isArray(body.cycles)||body.cycles.length!==2||
    body.cycles[0]!=='Muscle-Tendon Cycle'||body.cycles[1]!=='Bone-Marrow Cycle')
  throw Error('Organ Cycle needs genuinely completed Muscle-Tendon and Bone-Marrow physiology');
 const first=h.find(x=>x?.target==='cycle1'&&
   x.change==='Completed Cycle I Muscle-Tendon refinement; +2 stamina, Might +1, M1 natural force');
 const second=h.find(x=>x?.target==='cycle2'&&
   x.change==='Completed Cycle II Bone-Marrow refinement; +1 Toughness, +1 Serious wound box');
 if(!first||!second||!Number.isInteger(first.day)||!Number.isInteger(second.day)||
    first.day<1||second.day<first.day||second.day>E.day(s))
  throw Error('Earlier Body refinement requires its original earned, dated Cycle I and II records');
 const c=s.table?.combatants?.player;
 if(!c||s.table.healthModel!=='wounds-v1'||!Number.isInteger(c.toughness)||
    !Array.isArray(c.boxes)||c.boxes.length!==3)
  throw Error('Organ stress requires a consistent existing wound-model physiology');
 if(s.battle||s.encounter||c.status!=='ok')
  throw Error('Organ remodelling cannot proceed during immediate danger or incapacity');
 return {first,second};
}
function organEarned(s){
 const body=s.player?.body,work=s.table?.organCycleWork,
  proof=body?.organAdaptation,
  h=s.table?.disciplineTraining?.body?.history||[],
  final=h.find(x=>x?.target==='cycle3'&&
    x.change==='Completed Cycle III Organ refinement; integrated heart, lungs, liver and kidneys');
 if(!body||body.cycles?.[2]!=='Organ Cycle'||
    body.cycles.length<3||!work?.completed||!proof||!final||
    final.witnessSource!==ORGAN_ORIGIN||
    !Array.isArray(work.attempts)||work.attempts.length<1||
    !Number.isInteger(final.day)||final.day<1||final.day>E.day(s)||
    proof.originalSource!==ORGAN_ORIGIN||
    proof.attemptsHash!==organDigest(work.attempts)||
    !Number.isInteger(proof.completedMinute)||
    proof.completedMinute>s.world.minutes)
  throw Error('The Organ Cycle needs its original verified tissue-work history');
 const reconstructed=organPoints();
 let integrated=false;
 for(const x of work.attempts){
  if(!ORGAN_FOCI.includes(x.focus)||!Number.isInteger(x.minute)||
     x.minute<0||x.minute>s.world.minutes||
     !Number.isInteger(x.minutes)||x.minutes<15||x.minutes>480||
     !['success','strong','exceptional','setback','failure','severe failure'].includes(x.degree)||
     x.earned!==(x.degree==='exceptional'?3:
      x.degree==='strong'?2:x.degree==='success'?1:0))
   throw Error('Invalid earned organ refinement attempt');
  if(x.earned){
   if(x.focus==='integrated'){
    integrated=true;
    for(const organ of ORGAN_NAMES)
     reconstructed[organ]=Math.min(2,reconstructed[organ]+
      (x.degree==='exceptional'?2:1));
   }else reconstructed[x.focus]=Math.min(2,
      reconstructed[x.focus]+x.earned);
  }
 }
 if(!integrated||ORGAN_NAMES.some(k=>reconstructed[k]<2)||
    ORGAN_NAMES.some(k=>proof.systems?.[k]!==reconstructed[k])||
    proof.completedMinute<work.attempts.at(-1).minute+
      work.attempts.at(-1).minutes)
  throw Error('Organ Cycle is not an integrated, witnessed full-body transformation');
 return {cycle:3,systems:structuredClone(reconstructed),source:ORGAN_ORIGIN};
}
function organStatus(s){
 if(s.player?.body?.cycles?.includes('Organ Cycle')){
  try{return {earned:true,...organEarned(s)};}
  catch(e){return {earned:false,reason:e.message};}
 }
 let ready=true,reason=null;
 try{organPrerequisites(s);}catch(e){ready=false;reason=e.message;}
 const work=s.table?.organCycleWork,systems=work?.systems||organPoints();
 return {earned:false,ready,focusMethods:[...ORGAN_FOCI],
  systems:Object.fromEntries(ORGAN_NAMES.map(k=>[k,systems[k]||0])),
  requiredPerSystem:2,
  integratedMethodNeeded:true,
  noCompulsoryTeacher:true,noMinimumCalendarDays:true,
  ...(reason?{reason}:{}),
  note:'Whole-body Organ Cycle, not a single organ skill or a Meridian rank'};
}
function organWork(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
    Object.keys(params).some(k=>!['focus','minutes','approach','guidanceId'].includes(k)))
  throw Error('Organ refinement accepts genuine organ focus, duration, descriptive approach and witnessed optional theory; not chosen anatomy, bonuses or outcomes');
 const {focus='integrated',minutes=120,approach,guidanceId}=params;
 if(!ORGAN_FOCI.includes(focus))
  throw Error('Select heart, lungs, liver, kidneys or integrated organ work');
 C.int(minutes,'actual organ work minutes',15,480);
 if(approach!==undefined&&(typeof approach!=='string'||
   approach.trim().length<8||approach.length>240))
  throw Error('Describe actual tissue work, not an awarded constitution');
 organPrerequisites(s);
 const self=independentSite(s,'body',{shortSession:true});
 const theory=witnessedTheory(s,'body',guidanceId);
 const fatigue=Math.ceil(minutes/120),p=s.player;
 if(!Number.isInteger(p.stamina)||p.stamina<fatigue)
  throw Error('Organ adaptation requires available Stamina for real exertion');
 const old=s.table?.organCycleWork;
 if(old&&(old.completed||!old.systems||!Array.isArray(old.attempts)||
   old.attempts.length>500||ORGAN_NAMES.some(k=>
    !Number.isInteger(old.systems[k])||old.systems[k]<0||old.systems[k]>2)||
   typeof old.integrated!=='boolean'))
  throw Error('Existing Organ Cycle work is inconsistent with recorded tissue adaptation');
 const work=old||{systems:organPoints(),integrated:false,attempts:[],completed:false};
 const start=s.world.minutes;
 p.stamina-=fatigue;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=p.stamina;
 const check=C.check(s,{modifier:modifier(s,'body')+
  (theory?.bonus||0),dc:17,
  label:'Organ Cycle III — '+focus+' adaptation'});
 const earned=check.progress;
 if(earned){
  if(focus==='integrated'){
   work.integrated=true;
   for(const organ of ORGAN_NAMES)
    work.systems[organ]=Math.min(2,work.systems[organ]+
     (check.degree==='exceptional'?2:1));
  }else work.systems[focus]=Math.min(2,work.systems[focus]+earned);
 }
 let setback=null;
 if(check.degree==='severe failure'){
  setback='organ strain';
  U.ensurePlayer(s);
  Combat.harm(s,Combat.get(s,'player'),2);
  U.sync(s,{source:'wounds'});
 }
 const record={minute:start,minutes,focus,degree:check.degree,
  originalRoll:check.roll,earned,
  site:self.site,
  ...(approach?{approach:approach.trim()}:{}),
  source:independentSource('body','organ-'+focus,self.site)};
 work.attempts.push(record);
 s.table.organCycleWork=work;
 let completedCycle=false;
 if(work.integrated&&ORGAN_NAMES.every(k=>work.systems[k]>=2)){
  const c=s.table.combatants.player;
  p.body.cycles.push('Organ Cycle');
  staminaGain(s,2);
  c.toughness+=1;c.boxes[2]+=1;
  p.body.organAdaptation={
   systems:structuredClone(work.systems),originalSource:ORGAN_ORIGIN,
   completedMinute:start+minutes,attemptsHash:organDigest(work.attempts)};
  s.table.disciplineTraining.body.history.push({
   day:E.day(s),target:'cycle3',quality:check.degree,
   change:'Completed Cycle III Organ refinement; integrated heart, lungs, liver and kidneys',
   witnessSource:ORGAN_ORIGIN});
  work.completed=true;completedCycle=true;
 }
 E.advance(s,minutes);W.finalizeTime(s,start);U.sync(s,{source:'legacy'});
 C.event(s,'progress',completedCycle?
  'Body Organ Cycle III integrated across heart, lungs, liver and kidneys.':
  'Body Organ Cycle III '+focus+' work tested.',{
   origin:ORGAN_ORIGIN,record,originalCheck:check,
   tissueProgress:structuredClone(work.systems),integrated:work.integrated,
   completedCycle,staminaSpent:fatigue,setback,
   ...(completedCycle?{staminaCapacityAdded:2,toughnessAdded:1,
    criticalWoundBoxAdded:1,noQiOrManaUnlock:true}:{})
  });
 return {system:'body',target:'cycle3',focus,check,earned,
  systems:structuredClone(work.systems),integrated:work.integrated,
  completed:completedCycle,staminaSpent:fatigue,minutes,
  feeTalons:0,route:'independent',setback,
  noMandatoryTeacher:true,noAutomaticOtherPower:true};
}

module.exports={KEYS,currentTarget,status,practice,breakthrough,gatePractice,arcaneCircleWork,seaStatus,seaWork,matrixStatus,matrixWork,verifyThirdCircle,organStatus,organWork,organEarned};