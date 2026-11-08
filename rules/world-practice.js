'use strict';
// Text-RPG GM bridge: public history, locally relevant cultural professions,
// known COMMON methods vs restricted family teaching vs individual creations.
// A description never becomes a learned spell, professional licence, marriage,
// heritage, employment or source proof. Genuine work calls Core.check and
// advances actual physical world time; outside reports are independently read.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),W=require('./world'),
 H=require('./unified'),Combat=require('./combat'),Atlas=require('../world/atlas'),
 Houses=require('../world/social-houses'),Mythic=require('../world/mythic'),
 Lore=require('../world/renown-and-practice'),Realm=require('../world/simulation');
const SOURCE='public-civic-discipline-practicum-v1';
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const ALLOWED_TYPES=Object.freeze(['local','overview','history','legend','renown','common','school','restricted','profession']);
function only(params,keys){
 if(!params||typeof params!=='object'||Array.isArray(params)||
    Object.keys(params).some(k=>!keys.includes(k)))
  throw Error('Only a public world-history or original professional practice lookup is allowed; no chosen secret, prestige, rank, licence, power or outcome');
}
function place(s){
 const location=s.world?.location,region=Atlas.LOCATION_REGION[location];
 if(!E.LOCATIONS[location]||!Atlas.R[region])
  throw Error('World cultural context requires a genuine currently established place');
 return {location,region,polity:Atlas.R[region].polity};
}
function institutionPublic(id){
 const r=Atlas.I[id];
 return {id:r.id,name:r.name,kind:r.type,
  polity:Atlas.P[r.polity].name,specialty:r.specialty,
  fundingSource:r.funding,
  note:'Education, association and professional recognition are earned independently of this entry'};
}
function housePublic(id){
 const h=Houses.byId[id];
 return {id:h.id,name:h.name,kind:h.kind,polity:Atlas.P[h.polity].name,
  publicOccupation:h.role,publicObligation:h.duty,
  publicDispute:h.dispute,knownTradition:h.heritage,
  elder:h.elder,relationToHouse:'names and kinship recorded in public charter only',
  noHereditaryPowerAwarded:true};
}
function legacy(x){
 const epoch=Atlas.history.find(z=>z.era===x.era);
 return {id:x.id,name:x.name,era:x.era,
  establishedHistoricalContext:epoch?.event||null,
  polity:Atlas.P[x.polity].name,
  linkedInstitution:institutionPublic(x.institution).name,
  associatedHouse:housePublic(x.house).name,
  chronology:x.history,publicStanding:x.renown,
  evidenceLimits:x.status,
  serviceTradition:x.dailyLegacy,defensiveTradition:x.combatLegacy,
  ...(x.site?{publiclyDescribedSite:Mythic.publicLore({type:'site',id:x.site}).name}:{}),
  noVerifiedPersonalPowerRank:true,noLivingNPCInvented:true};
}
function renowned(s,x){
 const h=housePublic(x.house),i=institutionPublic(x.institution),
  localState=place(s).polity===x.polity?
   Realm.peek(s).institutions?.[x.institution]?.status:
   'remote current operating status not locally confirmed';
 return {id:x.id,name:i.name,standing:x.standing,
  locallyVerifiedOperatingStatus:localState||'no current office report',
  polity:Atlas.P[x.polity].name,region:Atlas.R[x.region].name,
  house:h.name,publicHouseObligation:h.publicObligation,
  foundingContext:Atlas.history.find(e=>e.era===x.era)?.event||null,
  knownHistory:x.history,culturalPaths:[...x.paths],
  civilianUse:x.publicService,defensiveUse:x.defenseUse,
  currentPublicDispute:x.division,limit:x.tradeoff,
  associatedSharedMethods:Lore.PUBLIC_METHODS.filter(m=>m.institution===x.institution)
   .map(m=>({id:m.id,name:m.name,path:m.path})),
  associatedSchoolTeachings:Lore.SCHOOL_TRADITIONS.filter(m=>m.institution===x.institution)
   .map(m=>({id:m.id,name:m.name,commonMethod:m.common})),
  originalProfessionalWork:Lore.CIVIC_APPLICATIONS.filter(j=>
    Lore.M[j.method]?.institution===x.institution)
   .map(j=>({id:j.id,site:E.LOCATIONS[j.location].name,method:j.method})),
  ...(x.site?{relatedPublicSite:Mythic.publicLore({type:'site',id:x.site})}:{}),
  regionalInfluenceNotCombatPower:true,
  schoolAttendanceNotMembership:true};
}
function publicMethod(x){
 const institution=Atlas.I[x.institution];
 return {id:x.id,name:x.name,path:x.path,knowledgeKind:x.kind,
  publiclyTaughtAt:institution.name,recognisedCivilianUse:x.civilian,
  potentialDefensiveOrCombatUse:x.combat,learningEvidence:x.learning,
  ...(x.actualRule?{existingEngineProcedure:x.actualRule}:
    {implementation:'socially known theory; no runnable supernatural effect implemented'}),
  sourceLimit:x.note,publicKnowledgeDoesNotTeachIt:true,
  personallyDevelopedTechniquesRemainDistinct:true,
  identifiableSchoolTeachings:Lore.SCHOOL_TRADITIONS.filter(t=>t.common===x.id)
   .map(t=>({id:t.id,name:t.name,institution:Atlas.I[t.institution].name,
    family:Houses.byId[t.house].name,learningNotGranted:true}))};
}
function school(s,x){
 const common=Lore.M[x.common],institution=Atlas.I[x.institution];
 return {id:x.id,name:x.name,
  organisation:institutionPublic(x.institution),associatedHouse:housePublic(x.house),
  background:x.lineage,existingCommonFoundation:publicMethod(common),
  civilianUse:x.civilian,defensiveOrCombatUse:x.combat,
  availableWaysToInvestigate:x.access,sourceLimit:x.limit,
  locallyVerifiedOperatingStatus:place(s).polity===institution.polity?
   Realm.peek(s).institutions?.[x.institution]?.status||'unconfirmed locally':
   'current remote operating status unverified',
  status:'publicly identified syllabus; actual formulas and personal mastery require original sources',
  notAnInheritedSkill:true,notPersonallyEarnedFromReading:true,
  notAFreeGuildMembership:true};
}
function restricted(x){
 return {id:x.id,name:x.label,
  knownHouse:housePublic(x.house).name,
  associatedInstitution:institutionPublic(x.institution).name,
  publiclyKnownStatus:x.status,
  civilianCulturalRole:x.civilRole,accessConstraint:x.boundary,
  privateFormula:'not supplied by public history',
  noLineageRightsOrLearnedSkillGranted:true};
}
function application(x){
 const site=E.LOCATIONS[x.location],method=Lore.M[x.method];
 return {id:x.id,name:x.name,site:site.name,
  region:Atlas.R[x.region].name,relatedCommonMethod:method.name,
  powerPath:method.path,actualWork:x.knownWork,
  establishedConsequence:x.actualEffect,
  actualMinutesAtLeast:x.minutes,requiredResources:x.energy?
   {staminaAtLeast:x.stamina,energy:x.energy,energyCost:x.energyCost}:
   {staminaAtLeast:x.stamina},
  noCompulsorySchoolOrEmployer:true,
  requiresActualSourceWork:true,temporaryEmploymentNotGranted:true};
}
function publicLore(s,params={}){
 only(params,['type','id','polity','path']);
 const {region,polity}=place(s),{type='local',id,path}=params;
 if(!ALLOWED_TYPES.includes(type))throw Error('Unknown public cultural knowledge category');
 if(id!==undefined&&(typeof id!=='string'||id.length>100))
  throw Error('A real named public historical entry is required');
 if(params.polity!==undefined&&!Atlas.P[params.polity])
  throw Error('A real atlas polity is required');
 if(path!==undefined&&!['meridian','arcane','soul','body','rift','beast-origin','partnership','specialist','mundane'].includes(path))
  throw Error('Power paths are distinct; unknown routes cannot be invented');
 if(id!==undefined&&['local','overview'].includes(type))
  throw Error('Choose a particular public historical, school or practice entry');
 const selectedPolity=params.polity;
 const filter=(items)=>items.filter(x=>{
  const home=x.polity||Atlas.I[x.institution]?.polity||
    Atlas.R[x.region]?.polity||
    Houses.byId[x.house]?.polity;
  return (id===undefined||x.id===id)&&
   (selectedPolity===undefined||home===selectedPolity)&&
   (path===undefined||x.path===path||x.paths?.includes(path)||
    x.common&&Lore.M[x.common]?.path===path||
    x.method&&Lore.M[x.method]?.path===path);
 });
 const list=(items,render)=>{
  const filtered=filter(items);
  if(id!==undefined&&!filtered.length)
   throw Error('This named entry is not in the public historical catalogue');
  return filtered.map(render);
 };
 if(type==='history')
  return {category:'established world history',records:Atlas.history.
   filter(e=>id===undefined||e.era===id).map(e=>({...e})),
   note:'Published eras predate the player; precise individual deeds require credible evidence'};
 if(type==='legend')return {category:'historical renown',
  entries:list(Lore.HISTORICAL_LEGACIES,legacy),
  note:'Attributed public legacies are not mechanically verified living NPCs or peak-stage rankings'};
 if(type==='renown')return {category:'selective world-renowned institutions and their households',
  entries:list(Lore.RENOWNED,x=>renowned(s,x)),
  note:'Fame, academic reputation, political standing, family position and supernatural stages are separate'};
 if(type==='common')return {category:'publicly recognised shared methods',
  entries:list(Lore.PUBLIC_METHODS,publicMethod),
  note:'A named generic technique remains separate from original personal creations and from restricted house teachings'};
 if(type==='school')return {category:'recognisable institutional teaching traditions',
  entries:list(Lore.SCHOOL_TRADITIONS,x=>school(s,x)),
  note:'School-specific methods sit between public foundational practice, private household formulas and individually created arts. Real skill, source, instruction or independent discovery remain necessary'};
 if(type==='restricted')return {category:'publicly named restricted traditions',
  entries:list(Lore.RESTRICTED_METHODS,restricted),
  note:'Their actual formulas, secrets, hereditary markers and present owners remain unknown'};
 if(type==='profession')return {category:'genuine physical professional applications',
  entries:list(Lore.CIVIC_APPLICATIONS,application),
  note:'Examples of possible in-world work, not occupation classes, guaranteed job offers or an exhaustive ability menu'};
 if(type==='overview')return {
  category:'selected great histories and known traditions',
  eraSummaries:Atlas.history.map(x=>({era:x.era,event:x.event})),
  renowned:Lore.RENOWNED.filter(x=>!selectedPolity||x.polity===selectedPolity).
    map(x=>({id:x.id,institution:Atlas.I[x.institution].name,polity:Atlas.P[x.polity].name,
     knownFor:x.publicService})),
  historicalLegends:Lore.HISTORICAL_LEGACIES.filter(x=>!selectedPolity||x.polity===selectedPolity).
    map(x=>({id:x.id,name:x.name,knownFor:x.renown})),
  institutionalTeachingTraditions:Lore.SCHOOL_TRADITIONS.filter(x=>
    !selectedPolity||Atlas.I[x.institution]?.polity===selectedPolity)
    .map(x=>({id:x.id,name:x.name,
      organisation:Atlas.I[x.institution].name,commonMethod:x.common})),
  pathsRepresented:[...new Set(Lore.PUBLIC_METHODS.map(x=>x.path))],
  caveat:'Only a selective public reputation layer; no universal strongest-person ranking or guaranteed mythic powers'};
 const r=Atlas.R[region],pol=Atlas.P[polity];
 const local=Lore.RENOWNED.filter(x=>x.region===region||x.polity===polity);
 const jobs=Lore.CIVIC_APPLICATIONS.filter(x=>x.location===s.world.location);
 return {category:'local living-world culture',localPlace:E.LOCATIONS[s.world.location].name,
  region:r.name,polity:pol.name,language:pol.language,
  knownCulturalObligations:pol.customs,
  localKnownLegacies:local.slice(0,6).map(x=>({name:Atlas.I[x.institution].name,
   publiclyKnownFor:x.publicService,house:Houses.byId[x.house].name})),
  localProfessionalWork:jobs.map(application),
  sharedPublicMethods:Lore.PUBLIC_METHODS.filter(x=>
    local.some(y=>y.institution===x.institution)).slice(0,10).map(x=>
      ({name:x.name,path:x.path,learningEvidence:x.learning})),
  identifiedLocalSchoolTeachings:Lore.SCHOOL_TRADITIONS.filter(x=>
    Atlas.I[x.institution]?.polity===polity).slice(0,6)
    .map(x=>({id:x.id,name:x.name,
      institution:Atlas.I[x.institution].name,
      generalPractice:Lore.M[x.common].name,
      noLearnedSkillFromAssociation:true})),
  noNewSocialRankOrPowerFromReading:true};
}
function actualSource(s,job){
 switch(job.source){
  case 'ordinary':return {type:'trained human field practice',
   physicalSite:s.world.location};
  case 'specialist-observation':return {
   type:'ordinary supervised-clinic source assessment',
   physicalSite:s.world.location,
   noImaginaryPatient:true,noMagicalItemCreated:true};
  case 'willing-partnership':{
   const partner=(s.player?.partnerIds||[]).map(id=>s.beasts?.[id])
    .find(b=>b&&b.owner===s.player.name&&
     b.away!==true&&(!b.location||b.location===s.world.location)&&
     b.consent===true&&b.relationship==='mutual partner'&&
     Number.isInteger(b.trust)&&b.trust>=40&&
     Number.isInteger(b.respect)&&b.respect>=30&&
     Array.isArray(b.bondHistory)&&b.bondHistory.some(h=>
      typeof h==='string'&&h.includes('Years of careful partnership prior to Day 1.'))&&
     (b.needs?.hunger||0)<80&&
     (b.needs?.fatigue||0)<80&&
     !(b.injuries||[]).length);
   if(!partner)
    throw Error('Actual present mutual beast cooperation with a witnessed starting bond, ongoing willingness, welfare and original consent is needed; a claim or surname cannot speak for a beast');
   return {type:'original witnessed reciprocal human-beast relationship',
    individualId:partner.id,species:partner.species,
    source:'Existing voluntary starting partnership recorded in this actual engine save',
    currentWillingness:true,noCommandedBeast:true};
  }
  case 'meridian-gate':{
   const g=require('./meridian-qi-strike').gate(s);
   return {type:'original opened first Meridian Gate',
    band:g.opened.band,number:g.opened.number,
    quality:g.opened.quality,day:g.record.day};}
  case 'arcane-matrix':{
   const a=require('./disciplines').verifyThirdCircle(s);
   return {type:'authenticated Third Arcane Circle Matrix',
    originalMatrix:structuredClone(a)};}
  case 'soul-thread':{
   const a=require('./soul-threading').earned(s);
   return {type:'authenticated independent Soul Threading Phase II',
    originalSource:a.source,links:a.links,integrity:a.integrity};}
  case 'body-organ':{
   const a=require('./disciplines').organEarned(s);
   return {type:'original full-body Organ Cycle III',
    source:a.source,systems:a.systems};}
  case 'rift-anchor':{
   const a=require('./rift-anchors').earned(s);
   return {type:'original witnessed Rift Anchor Marking',
    proof:a,site:s.world.location};}
  case 'origin-map':{
   const maps=Object.values(s.table?.originPatternStudies||{}).filter(x=>
     x?.completed===true&&x.originalObservation?.location===s.world.location);
   for(const m of maps){try{
    const v=require('./beast-origin-foundations').verifiedMap(s,m);
    return {type:'original noninvasive mapped ecology',
     candidateId:v.candidateId,species:v.species,
     sourceLocation:s.world.location,publicFact:v.publicFact};
   }catch{}}
   throw Error('An actual independent source-verified local noninvasive beast-pattern map is required');
  }
  default:throw Error('Unknown mechanical source, not a new public technique');
 }
}
// A publicly named school curriculum can be independently reconstructed
// through source-verified *ordinary* practice. It is not an organisation
// membership test, permission to read private folios or a generic mastery
// currency. The existing professional reports are its only evidence.
const SCHOOL_SOURCE='independent-public-school-method-application-v1';
function methodsAtJob(job){
 return Lore.SCHOOL_TRADITIONS.filter(t=>t.common===job.method);
}
function originalWorkWitness(report,job,creator,now){
 return !!(report&&report.origin===SOURCE&&
  report.jobId===job.id&&report.creator===creator&&
  report.receipt?.school===undefined&&
  report.published===true&&
  Number.isInteger(report.receipt?.startedMinute)&&
  report.receipt.startedMinute+report.receipt.minutes<=now&&
  verifyReport(report));
}
function supportingWork(s,job){
 const records=s.table?.realm?.culturalPractice?.reports||[];
 const witnessed=records.filter(r=>originalWorkWitness(r,job,s.player.name,s.world.minutes))
  .sort((a,b)=>a.receipt.startedMinute-b.receipt.startedMinute);
 const strong=witnessed.filter(x=>['strong','exceptional'].includes(x.receipt.check.degree));
 const selected=strong.length?[strong.at(-1)]:witnessed.slice(-2);
 if(!strong.length&&selected.length<2)return [];
 return selected.map(r=>({
  id:r.id,origin:r.origin,creator:r.creator,jobId:r.jobId,
  receipt:structuredClone(r.receipt),receiptHash:r.receiptHash,
  published:r.published
 }));
}
function eligibleSchool(s,job,schoolId){
 const school=Lore.T[schoolId];
 if(!school||school.common!==job.method)
  throw Error('A historical school method must have this same genuine original professional foundation, not an invented affinity or prestige');
 const records=supportingWork(s,job);
 if(!records.length)
  throw Error('Independent public-syllabus experimentation needs one strongly verified or two successful ordinary previous work reports at the actual workplace');
 return {school,records};
}
function schoolWitnessValid(r){
 const sch=r?.receipt?.school;
 if(!sch)return true; // historic plain cultural practice receipts
 if(sch.origin!==SCHOOL_SOURCE||sch.traditionId!==sch.publicId||
    !Lore.T[sch.traditionId]||Lore.T[sch.traditionId].common!==
    Lore.J[r.jobId]?.method||
    sch.bonus!==1||sch.extraStamina!==1||sch.extraMinutes!==15||
    sch.privateTeachingClaimed!==false||
    !Array.isArray(sch.witnesses)||![1,2].includes(sch.witnesses.length))
  return false;
 const prior=sch.witnesses;
 if(prior.length===2&&
    (prior[0].id===prior[1].id||
     prior.some(x=>!x.receipt?.check?.success)))
  return false;
 if(prior.length===1&&!['strong','exceptional'].includes(prior[0].receipt?.check?.degree))
  return false;
 return prior.every(x=>
  x.receipt?.school===undefined&&
  x.origin===SOURCE&&x.creator===r.creator&&
  x.jobId===r.jobId&&x.published===true&&
  x.receipt?.startedMinute+x.receipt?.minutes<=r.receipt.startedMinute&&
  verifyReport(x));
}
// Player-known evidence that the player has actually applied a publicly
// identified school method, distinct from reading its lore, being kin or
// possessing a high stage. The first engine-backed combat bridge uses this
// in the ORIGINAL Recover action; it never awards a new combat turn.
function earnedSchoolApplication(s,schoolId){
 const school=Lore.T[schoolId];if(!school)return false;
 const reports=s.table?.realm?.culturalPractice?.reports||[];
 return reports.some(r=>
  r.origin===SOURCE&&r.creator===s.player?.name&&
  r.receipt?.school?.traditionId===schoolId&&
  r.receipt?.check?.success===true&&verifyReport(r));
}
function workStatus(s,params={}){
 only(params,['id']);
 const {location}=place(s),jobs=Lore.CIVIC_APPLICATIONS.filter(x=>
  x.location===location&&(params.id===undefined||params.id===x.id));
 if(params.id&&!jobs.length)throw Error('The requested public professional application does not take place here');
 const ledger=s.table?.realm?.culturalPractice?.reports||[];
 return {site:E.LOCATIONS[location].name,
  possibleWork:jobs.map(x=>({
   ...application(x),
   publiclyIdentifiedSchoolApplications:methodsAtJob(x).map(t=>({
    id:t.id,name:t.name,
    mode:'independent equivalent study from public school account',
    realPriorWorkEvidence:supportingWork(s,x).length>0,
    personallyApplied:earnedSchoolApplication(s,t.id),
    noGuildMembershipOrPrivateFormula:true
   }))
  })),
  knownPersonalReports:ledger.filter(x=>x.origin===SOURCE&&x.creator===s.player.name)
   .slice(-20).map(x=>({id:x.id,method:Lore.J[x.jobId]?.name||'previous work',
    success:x.receipt?.check?.success===true,
    outcome:x.response||'not yet independently reviewed',
    day:x.receipt?.day,site:Atlas.R[x.receipt?.region]?.name})),
  noAutomaticEmployment:true,noMasteryOrPromotion:true};
}
function practice(s,params={}){
 only(params,['id','minutes','approach','schoolId']);
 const {id,minutes,approach,schoolId}=params,{location,region}=place(s);
 const job=Lore.J[id];
 if(!job||job.location!==location||job.region!==region)
  throw Error('Practice an actually established local profession, not a remote fictional worksite');
 if(s.battle||s.encounter)
  throw Error('Resolve immediate creature danger before an uninterrupted professional work session');
 const p=s.player,combatant=s.table?.combatants?.player;
 if(combatant&&combatant.status!=='ok')
  throw Error('An incapacitated character cannot perform independent fieldwork');
 if(!Number.isInteger(minutes)||minutes<job.minutes+(schoolId?15:0)||minutes>480)
  throw Error('Actual fieldwork needs its site-appropriate full duration, not an instant paper qualification');
 if(typeof approach!=='string'||approach.trim().length<14||approach.length>350||
    /[\u0000-\u001f]/.test(approach))
  throw Error('Describe your real physical or professional method, without a chosen effect or result');
 const source=actualSource(s,job);
 const school=schoolId===undefined?null:eligibleSchool(s,job,schoolId);
 const stamina=Math.max(job.stamina,Math.ceil(minutes/60))+(school?1:0);
 const energy=job.energy==='soul'?p.soul?.reserve:job.energy?p[job.energy]:null;
 if(!Number.isInteger(p.stamina)||p.stamina<stamina||
    combatant&&combatant.stamina<stamina)
  throw Error('Actual available Stamina is required for this physical fieldwork');
 if(job.energy&&(!Number.isInteger(energy)||energy<job.energyCost))
  throw Error('The verified discipline must have enough actual current '+job.energy+' for fieldwork');
 const skill=C.int(p.skills?.[job.skill]?.rank??0,
  'actual practising '+job.skill,0,5);
 const attr=C.int(p.attributes?.[job.attribute],
  'actual practising '+job.attribute,1,30);
 const start=s.world.minutes,sourceHash=digest(source);
 const woundPenalty=combatant?Combat.penalty(combatant):0;
 const check=C.check(s,{
  modifier:Math.floor((attr-10)/2)+2*skill-woundPenalty+(school?1:0),
  dc:job.dc,label:'Civilian '+job.name+(school?' — independently studied '+school.school.name:'')});
 p.stamina-=stamina;
 if(combatant)combatant.stamina=p.stamina;
 if(job.energy==='soul')p.soul.reserve-=job.energyCost;
 else if(job.energy)p[job.energy]-=job.energyCost;
 const originalRollEvent=structuredClone(s.log.at(-1));
 const receipt={
  ...(school?{school:{
   origin:SCHOOL_SOURCE,traditionId:school.school.id,
   publicId:school.school.id,
   bonus:1,extraStamina:1,extraMinutes:15,
   privateTeachingClaimed:false,
   witnesses:school.records
  }}:{}),
  source:SOURCE,jobId:job.id,methodId:job.method,creator:p.name,
  location,region,startedMinute:start,day:Math.floor(start/1440),
  minutes,staminaSpent:stamina,
  energy:job.energy,energySpent:job.energyCost,
  approach:approach.trim(),sourceProofHash:sourceHash,
  originalRollEvent,rollEventHash:digest(originalRollEvent),
  check:{roll:check.roll,modifier:check.modifier,dc:check.dc,
   degree:check.degree,success:check.success,margin:check.margin}
 };
 const w=Realm.ensure(s);
 w.culturalPractice||={counter:0,reports:[]};
 const ledger=w.culturalPractice;
 if(!Number.isInteger(ledger.counter)||!Array.isArray(ledger.reports))
  throw Error('Original civic practice reports need reconciliation before more work');
 const idWork='civic_'+(++ledger.counter);
 const saved={id:idWork,origin:SOURCE,creator:p.name,jobId:job.id,
  receipt,receiptHash:digest(receipt),
  published:check.success,releaseDay:Math.floor((start+minutes)/1440)+1,
  response:null,reviewedDay:null};
 ledger.reports.push(saved);if(ledger.reports.length>140)ledger.reports.shift();
 E.advance(s,minutes);W.finalizeTime(s,start);
 H.sync(s,{source:'legacy'});
 if(check.success){
  w.chronicle.push({day:Math.floor(s.world.minutes/1440),
   region,subject:'civic:'+idWork,
   text:'A field note records '+job.name.toLowerCase()+
    ' at '+E.LOCATIONS[location].name+
    '; follow-up work and independent institutional judgement remain necessary.',
   channel:'field notice',publiclyKnown:true,
   releaseDay:saved.releaseDay,severity:'routine'});
  if(w.chronicle.length>200)w.chronicle.splice(0,w.chronicle.length-200);
 }
 C.event(s,'progress',check.success?
  'Actual '+job.name.toLowerCase()+' produces a dated, reviewable local report.':
  'The attempted '+job.name.toLowerCase()+' is inconclusive; time and physical energy were spent.',{
  source:SOURCE,workId:idWork,originalCheck:check,
  sourceProofHash:sourceHash,minutes,staminaSpent:stamina,
  energySpent:job.energyCost,reported:check.success,
  ...(school?{originalPublicTradition:school.school.name,schoolBonus:1,
   independentReconstruction:true,noPrivateFamilyKnowledge:true}:{}),
  noFreeSpell:true,noFreeMembership:true,noAutomaticSocialPromotion:true
 });
 return {id:idWork,job:job.name,
  method:Lore.M[job.method].name,check,
  success:check.success,minutes,
  staminaSpent:stamina,energySpent:job.energyCost,
  ...(job.energy?{energy:job.energy}:{}),
  publiclyReviewable:check.success,
  ...(school?{originalPublicTradition:school.school.name,
    schoolBonusApplied:1,personallyPractisedMethod:check.success,
    noInstitutionalTeachingOrMembership:true}:{}),
  actualResult:check.success?job.actualEffect:'inconclusive observation; no new world claim',
  noFreeProfessionalRank:true,noTechniqueLearned:true,
  noEmployingInstitutionAssigned:true,noGuaranteedOrganisationalReaction:true};
}
function verifyReport(r){
 if(!r||r.origin!==SOURCE||r.receipt?.source!==SOURCE||
    r.receiptHash!==digest(r.receipt)||
    r.creator!==r.receipt.creator||r.jobId!==r.receipt.jobId||
    !Lore.J[r.jobId]||r.receipt.methodId!==Lore.J[r.jobId].method||
    r.receipt.region!==Lore.J[r.jobId].region||
    r.receipt.location!==Lore.J[r.jobId].location||
    r.receipt.originalRollEvent?.type!=='roll'||
    r.receipt.rollEventHash!==digest(r.receipt.originalRollEvent)||
    r.receipt.originalRollEvent.details?.roll!==r.receipt.check?.roll||
    r.receipt.originalRollEvent.details?.modifier!==r.receipt.check?.modifier||
    r.receipt.originalRollEvent.details?.dc!==r.receipt.check?.dc||
    r.receipt.originalRollEvent.details?.degree!==r.receipt.check?.degree||
    r.receipt.originalRollEvent.details?.success!==r.receipt.check?.success||
    !Number.isInteger(r.receipt.startedMinute)||
    !Number.isInteger(r.receipt.minutes)||r.receipt.minutes<Lore.J[r.jobId].minutes||
    r.receipt.minutes>480||
    !Number.isInteger(r.receipt.staminaSpent)||
    r.receipt.staminaSpent<Math.max(Lore.J[r.jobId].stamina,Math.ceil(r.receipt.minutes/60))||
    r.receipt.energySpent!==Lore.J[r.jobId].energyCost||
    r.receipt.energy!==Lore.J[r.jobId].energy||
    !/^[0-9a-f]{64}$/.test(r.receipt.sourceProofHash||'')||
    r.receipt.check.dc!==Lore.J[r.jobId].dc||
    r.receipt.check.success!==r.published||
    !schoolWitnessValid(r)||
    (r.receipt.school&&(
     r.receipt.staminaSpent<Math.max(Lore.J[r.jobId].stamina,
       Math.ceil(r.receipt.minutes/60))+1||
     r.receipt.minutes<Lore.J[r.jobId].minutes+15
    ))||
    r.receipt.check.margin!==r.receipt.originalRollEvent.details?.margin||
    r.receipt.check.success!==(r.receipt.check.margin>=0))
  return false;
 return true;
}
module.exports={SOURCE,SCHOOL_SOURCE,publicLore,workStatus,practice,
 verifyReport,earnedSchoolApplication};
