'use strict';
// Distinct, source-grounded early advancement procedures. The track lengths/DCs
// follow System Additions 18 and the supplied bb_progress.py reference vectors.
// Later stages are explicitly blocked pending their anatomical/ethical rules.
const C=require('./core'),E=require('../engine'),W=require('./world');
const U=require('./unified'),Combat=require('./combat'),Build=require('./build');
const Crypto=require('node:crypto');
const KEYS={
 meridian:{skill:'cultivation',attribute:'wis',focus:['breath','tissue','circulation'],tracks:{foundation:[40,12],awakening:[72,13]}},
 arcane:{skill:'arcana',attribute:'int',focus:['mana-attunement','core-geometry','formulae'],tracks:{core:[40,12],circle1:[100,12]}},
 soul:{skill:'cultivation',attribute:'wis',focus:['self-awareness','identity-ward','resonance'],tracks:{phase1:[100,12]}},
 body:{skill:'survival',attribute:'con',focus:['muscle','tendon','recovery'],tracks:{cycle1:[150,12]}},
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
 const row=ledger?.records?.slice().reverse().find(x=>x.npcId===guideId);
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
  case 'body':return p.body.cycles.length===0?'cycle1':null;
  case 'rift':return p.rift.step===0?'sense':null;
  default:return null;
 }
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
   arcaneTwo=system==='arcane'&&s.player.arcane.coreIgnited===true&&
    s.player.arcane.circles===1,
   gateAvailable=system==='meridian'&&s.player.meridian.stage>=2&&
    s.player.meridian.stage<=3&&gateCount<108,
   nextGate=gateCount+1,
   milestone=gateAvailable&&[36,72,108].includes(nextGate),
   gateDC=gateAvailable?(nextGate<=36?13:nextGate<=72?16:19)+
    (milestone?3:0):null;
  systems[system]={
   target:target||(gateAvailable?'Gate '+nextGate+'/108':arcaneTwo?'Second Circle — Dual Channeling':'advanced stage: procedure not implemented'),
   current:system==='meridian'?s.player.meridian.stage:
    system==='arcane'?(s.player.arcane.coreIgnited?'Core ignited':'No Core')+
     '; '+s.player.arcane.circles+' Circles':
    system==='body'?s.player.body.cycles.length:
    system==='soul'?s.player.soul.phase:s.player.rift.step,
   progress:target?(rec?.target===target?rec.points:0):
    gateAvailable&&s.table?.meridianGateTraining?.gate===nextGate?
     s.table.meridianGateTraining.progress:
    arcaneTwo?s.table?.arcaneCircleRevision?.progress||0:0,
   required:pair?.[0]??(gateAvailable?
    nextGate<=36?3:nextGate<=72?5:8:arcaneTwo?4:null),
   dc:pair?.[1]??(arcaneTwo?17:gateDC),
   availableMethods:target?spec.focus:[],
   nextEligibleDay:rec?.cooldownUntil||0,
   trainingRoutes:target||gateAvailable?['established','independent']:
    arcaneTwo?['independent']:[],
   independentAvailableAtCurrentSite:!!(target||gateAvailable||arcaneTwo)&&
    SELF_SITES[system].includes(s.world.location),
   independentPracticeFeeTalons:0,
   independentPracticeDC:pair?pair[1]+2:arcaneTwo?17:gateDC,
   independentBreakthroughExtraDC:target?3:null,
   ...(target?{practiceSession:{
    minimumMinutes:15,maximumMinutes:480,
    staminaCost:'ceil(minutes / 120)',
    defaultRoute:'independent',noCompulsoryTeacher:true,
    noUniversalTuition:true,noMinimumCalendarDays:true,
    omittedMinutes:'legacy sixday course for existing callers'
   }}:{}),
   ...(arcaneTwo?{circleWork:{
    goal:'Reconfigure the real First Circle for two stable mana channels',
    earnedIntegrityRequired:4,
    sessionMinutes:{minimum:15,default:180,maximum:480},
    manaSpentPerAttempt:2,noCompulsoryTeacher:true,
    optionalWitnessedTheory:true,noFreeSpellOnConstruction:true
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
 if(!spec.focus.includes(method))throw Error('Method does not belong to the chosen discipline');
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
 const profile=Build.meridianProfile(m.stage,{meridians:12,gatesP:P,gatesS:S,gatesF:F});
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
  else if(system==='body'){s.player.body.cycles.push('Muscle-Tendon Cycle');staminaGain(s,2);s.table.combatants.player.offM=Math.max(s.table.combatants.player.offM,1);s.player.attributes.str+=1;if(s.player.capabilityProfile)s.player.capabilityProfile.domains.physical.strength.current=Math.min(20,s.player.capabilityProfile.domains.physical.strength.current+1);change='Completed Cycle I Muscle-Tendon refinement; +2 stamina, Might +1, M1 natural force';}
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
module.exports={KEYS,currentTarget,status,practice,breakthrough,gatePractice,arcaneCircleWork};