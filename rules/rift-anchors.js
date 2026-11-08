'use strict';
// Master Prompt §25: Rift Anchor Marking is a measured spatial reference,
// NOT teleportation, vault access, portal control or a selectable secret map.
// This first witnessed local site is the existing Riftglass exterior wardline.
// Other genuinely established spatial sites can be added without inventing
// protected-site coordinates or turning every locale into a rift.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),W=require('./world'),
 U=require('./unified'),Combat=require('./combat'),
 Realm=require('../world/simulation'),Atlas=require('../world/atlas');
const ORIGIN='earned-rift-anchor-marking-step-ii-v1';
const SITE='riftglass_exterior_wardline';
const FOCI=Object.freeze(['bearing','resonance','stability','integrated']);
const AXES=Object.freeze(['bearing','resonance','stability']);
const SOURCE_OBS=Object.freeze([
 'Strongly irregular boundary pressure; maintaining distance from the sealed vault is prudent.',
 'Elevated, shifting spatial pressure along the known exterior wards.',
 'The existing exterior ward line feels comparatively contained at this moment.'
]);
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const initialAxes=()=>({bearing:0,resonance:0,stability:0});
function validScene(s){
 const loc=s.world?.location,c=s.table?.combatants?.player;
 if(loc!=='ruins'||Atlas.LOCATION_REGION[loc]!=='riftglass')
  throw Error('No authentic measurable Riftglass exterior ward reference exists at this location');
 if(s.battle||s.encounter)throw Error('Rift anchor work requires a safe real scene without unresolved combat or beasts');
 if(c&&c.status!=='ok')throw Error('An incapacitated person cannot mark a spatial anchor');
}
function firstProof(s){
 const r=s.player?.rift,h=s.table?.disciplineTraining?.rift?.history||[];
 const witness=h.find(x=>x?.target==='sense'&&
   x.change==='Step I Rift Sense; bounded sensitivity to anomalies'&&
   Number.isInteger(x.day)&&x.day>=1&&x.day<=E.day(s));
 if(!r||r.step<1||!witness||
    r.sense?.notTeleportation!==true||
    r.sense?.requires!=='Nearby anomaly or measured weak boundary')
  throw Error('Anchor Marking requires authentically earned Rift Sense and its original safety limits');
 return witness;
}
function validReading(s,x){
 return !!(x?.origin==='earned-rift-sense-exterior'&&x.success===true&&
  ['success','strong','exceptional'].includes(x.degree)&&
  x.location==='ruins'&&x.siteId==='riftglass_vault'&&
  x.staminaSpent===2&&x.minutes===12&&
  typeof x.sourceSnapshotHash==='string'&&/^[a-f0-9]{64}$/.test(x.sourceSnapshotHash)&&
  typeof x.witnessHash==='string'&&/^[a-f0-9]{64}$/.test(x.witnessHash)&&
  typeof x.rollHash==='string'&&/^[a-f0-9]{64}$/.test(x.rollHash)&&
  SOURCE_OBS.includes(x.publicObservation)&&
  Number.isInteger(x.worldMinute)&&x.worldMinute>=0&&
  x.worldMinute<=s.world.minutes&&
  Number.isInteger(x.day)&&x.day>=1&&x.day<=E.day(s));
}
function readings(s){
 const h=s.table?.perceptionPractice?.riftAttempts;
 return (Array.isArray(h)?h:[]).filter(x=>validReading(s,x));
}
function reading(s){
 const matches=readings(s);
 if(!matches.length)throw Error('A genuinely successful personally measured Riftglass exterior field reading is required');
 return matches.at(-1);
}
function environment(s){
 validScene(s);
 const w=Realm.peek(s),site=w.mythic?.riftglass_vault,
  eco=w.ecosystems?.riftglass;
 if(!site||!eco||
    !['quiet','fading','surging','unstable'].includes(site.phase)||
    !Number.isInteger(site.charge)||site.charge<0||site.charge>100||
    !Number.isInteger(site.seal)||site.seal<0||site.seal>100||
    !Number.isInteger(eco.pressure)||eco.pressure<0||eco.pressure>100)
   throw Error('No authenticated local boundary measurements are available');
 // Keep all raw world pressures and vault condition private. The public
 // observation is the only player-reported site assessment.
 const v={siteId:'riftglass_vault',phase:site.phase,
  charge:site.charge,seal:site.seal,ecosystemPressure:eco.pressure,
  worldSeed:w.worldSeed,day:Math.floor(s.world.minutes/1440)};
 const risk=site.phase==='unstable'||site.seal<35?'unstable':
  site.phase==='surging'||site.charge>72||eco.pressure>73?'elevated':'contained';
 return {v,hash:digest(v),risk};
}
function modifier(s){
 const p=s.player,attr=C.int(p.attributes?.int,'earned Intelligence',1,30),
  rank=C.int(p.skills?.arcana?.rank,'earned Arcana rank',0,5);
 return Math.floor((attr-10)/2)+2*rank;
}
function prerequisites(s){
 firstProof(s);validScene(s);
 if(s.player.rift.step!==1)
  throw Error('Marking a new Step II anchor requires genuinely completed Step I, not a claimed higher rank');
 if(s.player.rift.anchorProof||
    (s.player.rift.anchors||[]).some(x=>x?.id===SITE))
  throw Error('The exterior Riftglass anchor has already been established');
 const old=s.table?.riftAnchorWork;
 // Preserve a once witnessed local reading as the anchor's original source
 // even if later ordinary sensing or rolling journal compaction evicts its
 // older entry. Another new observation must not erase earned work.
 const previous=old?old.originalObservation:reading(s);
 if(!validReading(s,previous)||
    old&&digest(previous)!==old.readingHash)
  throw Error('Existing anchor work has lost or altered its original observed boundary source');
 return {previous,readingHash:digest(previous),environment:environment(s)};
}
function earned(s){
 firstProof(s);
 const r=s.player.rift,work=s.table?.riftAnchorWork,
  proof=r.anchorProof,anchors=r.anchors,
  history=s.table?.disciplineTraining?.rift?.history||[],
  final=history.find(x=>x?.target==='anchor'&&
   x.change==='Step II Anchor Marking; witnessed exterior spatial reference established');
 if(r.step<2||!proof||!work?.completed||!final||
   final.witnessSource!==ORIGIN||
   !Number.isInteger(final.day)||final.day<1||final.day>E.day(s)||
   !Array.isArray(anchors)||anchors.length!==1||
   !Array.isArray(work.attempts)||!work.attempts.length||
   proof.source!==ORIGIN||proof.siteId!==SITE||
   proof.readingHash!==work.readingHash||
   proof.attemptsHash!==digest(work.attempts)||
   !Number.isInteger(proof.completedMinute)||
   proof.completedMinute>s.world.minutes||
   proof.completedMinute<work.attempts.at(-1).minute+
     work.attempts.at(-1).minutes)
  throw Error('Rift Anchor Marking lacks its original earned geographic witness');
 // The first authentic measurement is deliberately checkpointed inside
 // the earned work receipt, because the ordinary perception journal keeps
 // just the latest 50 observations. Expiring a display buffer never erases
 // a real established spatial anchor.
 const evidence=work.originalObservation;
 if(!validReading(s,evidence)||digest(evidence)!==proof.readingHash)
  throw Error('The saved anchor references a missing or altered original Rift Sense measurement');
 const axes=initialAxes();let integrated=false;
 for(const x of work.attempts){
  if(!x||!FOCI.includes(x.focus)||!Number.isInteger(x.minute)||
     x.minute<evidence.worldMinute||x.minute>s.world.minutes||
     !Number.isInteger(x.minutes)||x.minutes<15||x.minutes>480||
     x.staminaSpent<1||!Number.isInteger(x.staminaSpent)||
     !['exceptional','strong','success','setback','failure','severe failure'].includes(x.degree)||
     x.gained!==(x.degree==='exceptional'?3:
       x.degree==='strong'?2:x.degree==='success'?1:0))
   throw Error('Rift Anchor history is not consistent with authentic measured practice');
  if(x.gained){
   if(x.focus==='integrated'){
    integrated=true;
    for(const a of AXES)axes[a]=Math.min(2,axes[a]+
       (x.degree==='exceptional'?2:1));
   }else axes[x.focus]=Math.min(2,axes[x.focus]+x.gained);
  }
 }
 const a=anchors[0];
 if(!integrated||AXES.some(k=>axes[k]!==2||
    work.axes?.[k]!==axes[k]||proof.axes?.[k]!==axes[k])||
    a?.id!==SITE||a.location!=='ruins'||a.siteId!=='riftglass_vault'||
    a.name!=='Exterior Riftglass wardline'||a.source!==ORIGIN||
    a.completedMinute!==proof.completedMinute||
    a.readingHash!==proof.readingHash||
    a.integrity!==proof.integrity||
    !Number.isInteger(a.integrity)||a.integrity<40||a.integrity>100)
  throw Error('A claimed Rift anchor is not a complete, witnessed stable spatial reference');
 return {id:a.id,name:a.name,siteId:a.siteId,location:a.location,
  integrity:a.integrity,source:a.source,
  completedMinute:a.completedMinute,readingHash:a.readingHash};
}
function status(s){
 if(s.player?.rift?.step>=2){
  try{const a=earned(s);return {earned:true,step:s.player.rift.step,
    anchor:{id:a.id,name:a.name,location:a.location,integrity:a.integrity},
    noTeleportation:true,noVaultEntry:true};}
  catch(e){return {earned:false,reason:e.message};}
 }
 let ready=true,reason=null;
 try{prerequisites(s);}catch(e){ready=false;reason=e.message;}
 const w=s.table?.riftAnchorWork;
 return {earned:false,ready,step:s.player?.rift?.step||0,
  axes:{...initialAxes(),...(w?.axes||{})},
  requiredPerAxis:2,integratedReferenceRequired:true,
  availableFoci:[...FOCI],site:'known Riftglass exterior wardline',
  noMandatoryTeacher:true,noFixedCalendarDays:true,
  ...(reason?{reason}:{}),
  note:'Measured exterior reference only: no Fold Step, hidden coordinates, protected-site access or portal control'};
}
function mark(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
   Object.keys(params).some(k=>!['focus','minutes','approach'].includes(k)))
  throw Error('Anchor Marking accepts actual focus, time and descriptive technique, not target coordinates, claims, DC or outcomes');
 const {focus='integrated',minutes=120,approach}=params;
 if(!FOCI.includes(focus))throw Error('Choose actual bearing, resonance, stability or integrated spatial work');
 C.int(minutes,'actual Rift anchor minutes',15,480);
 if(approach!==undefined&&(typeof approach!=='string'||
   approach.trim().length<8||approach.length>240))
   throw Error('Describe real boundary reference work, not a claimed portal or guaranteed result');
 const {previous,readingHash,environment:env}=prerequisites(s);
 const old=s.table?.riftAnchorWork;
 if(old&&(old.completed||old.readingHash!==readingHash||
   !old.axes||!Array.isArray(old.attempts)||old.attempts.length>500||
   typeof old.integrated!=='boolean'||
   AXES.some(k=>!Number.isInteger(old.axes[k])||old.axes[k]<0||old.axes[k]>2)))
  throw Error('Unreconciled earlier spatial-reference history cannot be silently rewritten');
 const work=old||{axes:initialAxes(),integrated:false,attempts:[],
  readingHash,originalObservation:structuredClone(previous),completed:false};
 const cost=2+Math.ceil(minutes/120);
 if(!Number.isInteger(s.player.stamina)||s.player.stamina<cost||
   s.table?.combatants?.player&&s.table.combatants.player.stamina<cost)
  throw Error('This Rift anchor session requires actual remaining Stamina');
 const start=s.world.minutes,risk=env.risk,dc=risk==='unstable'?22:risk==='elevated'?20:18;
 const strain=s.player.rift.anchorStrain||0;
 C.int(strain,'recorded spatial strain',0,100);
 const check=C.check(s,{modifier:modifier(s)-Math.floor(strain/12),
  dc,label:'Rift Anchor II — '+focus+' spatial reference'});
 s.player.stamina-=cost;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
 const gained=check.progress;
 if(gained){
  if(focus==='integrated'){
   work.integrated=true;
   for(const k of AXES)work.axes[k]=Math.min(2,work.axes[k]+
     (check.degree==='exceptional'?2:1));
  }else work.axes[focus]=Math.min(2,work.axes[focus]+gained);
 }
 let backlash=null;
 if(check.degree==='severe failure'){
  backlash='spatial vertigo and shear strain';
  s.player.rift.anchorStrain=Math.min(100,strain+8);
  U.ensurePlayer(s);Combat.harm(s,Combat.get(s,'player'),2);
  U.sync(s,{source:'wounds'});
 }else if(check.success)
  s.player.rift.anchorStrain=Math.max(0,strain-2);
 const attempt={minute:start,minutes,focus,degree:check.degree,
  gained,staminaSpent:cost,roll:check.roll,
  readingHash,siteId:'riftglass_vault',
  source:'Personally measured exterior Riftglass ward geometry',
  ...(approach?{approach:approach.trim()}: {})};
 work.attempts.push(attempt);
 s.table||={};s.table.riftAnchorWork=work;
 let formed=false,integrity=null;
 if(work.integrated&&AXES.every(k=>work.axes[k]>=2)){
  integrity=Math.max(40,Math.min(100,
   60+Math.max(0,check.margin)*2-
   (s.player.rift.anchorStrain||0)));
  const completedMinute=start+minutes;
  const proof={source:ORIGIN,siteId:SITE,readingHash,
   attemptsHash:digest(work.attempts),completedMinute,
   axes:{...work.axes},integrity};
  s.player.rift.step=2;s.player.rift.anchorProof=proof;
  s.player.rift.anchors=[{id:SITE,siteId:'riftglass_vault',
   name:'Exterior Riftglass wardline',location:'ruins',
   source:ORIGIN,completedMinute,readingHash,integrity}];
  s.table.disciplineTraining.rift.history.push({
   day:E.day(s),target:'anchor',quality:check.degree,
   change:'Step II Anchor Marking; witnessed exterior spatial reference established',
   witnessSource:ORIGIN});
  work.completed=true;formed=true;
 }
 E.advance(s,minutes);W.finalizeTime(s,start);U.sync(s,{source:'legacy'});
 C.event(s,'progress',formed?
  'The measured exterior wardline settles into a dependable personal spatial reference.':
  backlash?'Unstable pressure strains the attempt to map the exterior wardline.':
  'The exterior Riftglass spatial reference is being measured and refined.',{
  origin:ORIGIN,attempt,originalCheck:check,axes:{...work.axes},
  formed,backlash,staminaSpent:cost,
  noTeleportation:true,noVaultEntry:true,
  ...(formed?{integrity,referenceId:SITE}: {})
 });
 return {system:'rift',target:'anchor',focus,check,
  axes:{...work.axes},formed,minutes,
  staminaSpent:cost,backlash,route:'independent',feeTalons:0,
  noTeleportation:true,noVaultEntry:true,
  ...(formed?{anchorId:SITE,integrity}: {})};
}
function orient(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||Object.keys(params).length)
  throw Error('Rift anchor orientation uses the earned present reference, not selected secret coordinates, bonus, safety or result');
 validScene(s);const a=earned(s),env=environment(s);
 if(s.player.rift.step!==2)
  throw Error('This verified orientation currently supports the earned Anchor Marking stage');
 const cost=1,minutes=10;
 if(!Number.isInteger(s.player.stamina)||s.player.stamina<cost||
    s.table?.combatants?.player&&s.table.combatants.player.stamina<cost)
  throw Error('Real stamina is required for spatial reorientation');
 const start=s.world.minutes,dc=env.risk==='unstable'?18:
   env.risk==='elevated'?15:12;
 const check=C.check(s,{modifier:modifier(s),dc,
  label:'Rift II — anchor reorientation at exterior wardline'});
 s.player.stamina-=cost;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
 let backlash=null;
 if(check.degree==='severe failure'){
  backlash='disorienting feedback';
  U.ensurePlayer(s);Combat.harm(s,Combat.get(s,'player'),2);
  U.sync(s,{source:'wounds'});
 }
 E.advance(s,minutes);W.finalizeTime(s,start);U.sync(s,{source:'legacy'});
 const updated=environment(s);
 const token=check.success?{
  source:ORIGIN,anchorId:a.id,anchorHash:digest(s.player.rift.anchorProof),
  boundarySampleHash:updated.hash,
  location:'ruins',establishedMinute:s.world.minutes,
  expiresMinute:s.world.minutes+60,used:false
 }:null;
 s.table.riftOrientation=token;
 C.event(s,'progress',check.success?
   'The established exterior anchor provides a short-lived verified spatial bearing.':
   'The exterior bearing remains uncertain; no protected route is established.',{
    origin:'earned-rift-anchor-orientation-v1',referenceId:a.id,
    originalCheck:check,staminaSpent:cost,minutes,backlash,
    orientationReady:!!token,noTeleportation:true,noVaultEntry:true
   });
 return {performed:true,success:check.success,check,minutes,
  staminaSpent:cost,orientationReady:!!token,
  warning:'The reference is local, time-limited and does not permit Fold Step or access to sealed sites',
  backlash,noTeleportation:true,noVaultEntry:true};
}
// Read-only. The actual Rift Sense action must consume a verified token
// before rolling, and must check its exact world pressure snapshot itself.
function orientationBonus(s,currentBoundaryHash){
 let a;try{a=earned(s);}catch{return 0;}
 const o=s.table?.riftOrientation;
 if(!o||o.used||o.source!==ORIGIN||o.anchorId!==a.id||
  o.anchorHash!==digest(s.player.rift.anchorProof)||
  o.boundarySampleHash!==currentBoundaryHash||
  o.location!==s.world.location||
  !Number.isInteger(o.establishedMinute)||!Number.isInteger(o.expiresMinute)||
  o.expiresMinute-o.establishedMinute!==60||
  s.world.minutes<o.establishedMinute||
  s.world.minutes>o.expiresMinute)return 0;
 return 2;
}
function consumeOrientation(s,currentBoundaryHash){
 const bonus=orientationBonus(s,currentBoundaryHash);
 if(bonus)s.table.riftOrientation.used=true;
 return bonus;
}
module.exports={ORIGIN,SITE,FOCI,AXES,status,mark,orient,earned,
 orientationBonus,consumeOrientation};
