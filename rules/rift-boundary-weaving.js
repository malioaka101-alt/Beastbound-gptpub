'use strict';
// Original Master §25: real small local Boundary Weaving IV.
// Source-led micro-boundary fields live alongside the existing cosmology and
// world pressure; an active patch is neither a portal nor a world-state rewrite.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),W=require('./world'),U=require('./unified'),
 Combat=require('./combat'),Anchor=require('./rift-anchors'),
 Fold=require('./rift-fold-step'),Cosmos=require('../world/cosmology-ledger'),
 Realm=require('../world/simulation');
const SOURCE='earned-local-boundary-weaving-iv-v1',
 WITNESS='gm-observed-local-spatial-boundary-weave-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const int=(n,a=0,b=1000000000)=>Number.isInteger(n)&&n>=a&&n<=b;
const slug=s=>typeof s==='string'&&/^[a-z][a-z0-9_-]{3,65}$/.test(s);
const prose=(x,min=25)=>typeof x==='string'&&x.trim().length>=min&&x.length<=900;
const modes=Object.freeze(['reinforce','redirect','reshape']);
const only=(p,keys)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(k=>keys.includes(k));
function current(s){
 const r=s.table?.realm;return r?.boundaryWeaves||null;
}
function location(s){
 const c=s.table?.combatants?.player;
 if(s.world?.location!=='ruins'||s.battle||s.encounter||c?.status!=='ok')
  throw Error('An actual stable Riftglass exterior site is required for a measured local weave');
 const cosm=Cosmos.peek(s)||Cosmos.seed();
 Cosmos.validate(cosm,s);
 const b=cosm.boundaries?.riftglass_wardline;
 if(!b||b.siteId!=='riftglass_vault'||b.visibility!=='public'||
    b.noProvenPassage!==true)
  throw Error('The actual observed exterior realm boundary must exist without claiming an opened threshold');
 return b;
}
function pressure(s){
 const world=Realm.peek(s),m=world?.mythic?.riftglass_vault,
  ecology=world?.ecosystems?.riftglass;
 if(!m||!ecology||!int(m.charge,0,100)||!int(m.seal,0,100)||
  !int(ecology.pressure,0,100)||
  !['quiet','fading','surging','unstable'].includes(m.phase))
  throw Error('Existing independently changing Riftglass pressure is required');
 const danger=m.phase==='unstable'||m.seal<35?6:
  m.phase==='surging'||m.charge>72||ecology.pressure>73?3:0;
 return {danger,sourceHash:hash({phase:m.phase,charge:m.charge,
  seal:m.seal,pressure:ecology.pressure,worldSeed:world.worldSeed,
  day:Math.floor(s.world.minutes/1440)})};
}
function observed(s,index){
 if(!int(index,0,(s.log?.length||0)-1))
  throw Error('An actual prior locally witnessed physical boundary experiment is required');
 const e=s.log[index],d=e?.details;
 if(e?.type!=='story'||!prose(e.text,16)||
  d?.origin!==WITNESS||d.location!==s.world.location||
  d.boundaryId!=='riftglass_wardline'||
  !slug(d.segmentId)||!modes.includes(d.mode)||
  !int(d.areaSquareMetres,1,12)||
  !int(d.supportMinutes,30,360)||
  !prose(d.originalSpatialFabric)||
  !prose(d.observedLocalChange)||
  !prose(d.independentPressureCountertest)||
  !prose(d.actualEnergyLimit)||
  d.crossesBoundary!==false||d.opensPortal!==false||
  d.globalSealChanged!==false)
  throw Error('A source-measured small original boundary segment, physical response and independent countertest are required');
 return structuredClone(e);
}
function validCheck(a){
 const c=a.check;
 return a.rollEvent?.type==='roll'&&
  a.rollEventHash===hash(a.rollEvent)&&
  hash(a.rollEvent.details)===hash(c)&&
  int(a.roll,1,20)&&a.roll===c.roll&&
  c.modifier===a.modifier&&c.dc===a.dc&&
  c.naturalBonus===C.naturalAdjustment(a.roll)&&
  c.total===a.roll+a.modifier+c.naturalBonus&&
  c.margin===c.total-c.dc&&
  c.degree===C.degree(c.margin,true)&&
  c.success===(c.margin>=0)&&c.progress===C.progress(c.degree);
}
function verify(s){
 const r=current(s);
 if(!r)return !s.player?.rift?.weaveProof;
 if(r.origin!==SOURCE||!Array.isArray(r.attempts)||
  !r.attempts.length||r.anchorHash!==hash(s.player?.rift?.anchorProof)||
  r.foldHash!==hash(s.player?.rift?.foldProof)||
  !int(r.strain,0,100))
  return false;
 let strain=0,step=3,first=null,last=-1;
 const used=new Set();
 const occupied=new Map();
 for(const item of r.attempts){
  const a=item?.source,d=a?.witness?.details;
  if(item?.origin!==SOURCE||item.seal!==hash(a)||
   a.origin!==SOURCE||a.kind!=='boundary-weave'||
   a.boundaryId!=='riftglass_wardline'||
   a.location!=='ruins'||!slug(a.segmentId)||
   !modes.includes(a.mode)||!int(a.area,1,12)||
   !int(a.startMinute,last,s.world.minutes)||
   !int(a.minutes,45,240)||
   a.startMinute+a.minutes>s.world.minutes||
   !int(a.duration,30,360)||
   a.staminaSpent!==3+Math.ceil(a.minutes/120)||
   !int(a.attributeScore,1,30)||!int(a.skillRank,0,5)||
   a.modifier!==Math.floor((a.attributeScore-10)/2)+2*a.skillRank||
   ![0,3,6].includes(a.riskAdjustment)||
   a.dc!==18+Math.ceil(a.area/4)+a.riskAdjustment+
    Math.floor(strain/12)||
   !validCheck(a)||a.success!==a.check.success||
   a.strainBefore!==strain||
   a.strainAdded!==(a.check.degree==='severe failure'?6:0)||
   a.strainAfter!==Math.min(100,strain+a.strainAdded)||
   a.wounded!==(a.strainAdded>0)||
   a.stepBefore!==step||
   a.stepAfter!==(a.success?4:step)||
   a.activeFrom!==(a.success?a.startMinute+a.minutes:null)||
   a.activeUntil!==(a.success?a.activeFrom+a.duration:null)||
   !a.witness||a.witness.type!=='story'||
   a.witnessHash!==hash(a.witness)||
   d?.origin!==WITNESS||d.location!==a.location||
   d.boundaryId!==a.boundaryId||d.segmentId!==a.segmentId||
   d.mode!==a.mode||d.areaSquareMetres!==a.area||
   d.supportMinutes!==a.duration||
   !prose(d.originalSpatialFabric)||
   !prose(d.observedLocalChange)||
   !prose(d.independentPressureCountertest)||
   !prose(d.actualEnergyLimit)||
   d.crossesBoundary!==false||d.opensPortal!==false||
   d.globalSealChanged!==false||
   used.has(a.witnessHash))
   return false;
  used.add(a.witnessHash);
  const key=a.boundaryId+'/'+a.segmentId;
  if(occupied.get(key)>a.startMinute)return false;
  if(a.success){
   occupied.set(key,a.activeUntil);
   if(!first)first=item.seal;
  }
  strain=a.strainAfter;step=a.stepAfter;
  last=a.startMinute+a.minutes;
 }
 if(strain!==r.strain||
  !!first!==!!s.player.rift.weaveProof||
  (first&&(s.player.rift.step<4||
   s.player.rift.weaveProof?.source!==SOURCE||
   s.player.rift.weaveProof?.firstSuccessSeal!==first)))
  return false;
 return true;
}
function status(s){
 if(!verify(s))throw Error('Original recorded local Boundary Weaving evidence is inconsistent');
 const r=current(s),now=s.world.minutes;
 return {step:s.player.rift.step,earned:!!s.player.rift.weaveProof,
  originalAttempts:r?.attempts.length||0,strain:r?.strain||0,
  localLayers:(r?.attempts||[]).filter(x=>x.source.success)
   .map(x=>x.source).filter(x=>x.activeUntil>now).map(x=>({
    segmentId:x.segmentId,mode:x.mode,
    expiresAtWorldMinute:x.activeUntil,areaSquareMetres:x.area,
    noPassage:true})),
  note:'Temporary independently witnessed boundary microstructures; no sealed-site entry, global pressure override or realm transit'};
}
function supportProof(s,seal,segmentId,minute){
 const r=current(s);
 if(!r||!verify(s))return false;
 const x=r.attempts.find(y=>y.seal===seal)?.source;
 return !!(x?.success&&x.mode==='reinforce'&&x.segmentId===segmentId&&
  int(minute,x.activeFrom,x.activeUntil-1));
}
function support(s,segmentId){
 if(!slug(segmentId)||!verify(s))return {mitigation:0,sourceSeal:null};
 const now=s.world.minutes,r=current(s);
 const candidates=(r?.attempts||[]).filter(y=>{
  const x=y.source;
  return x.success&&x.mode==='reinforce'&&x.segmentId===segmentId&&
   x.activeFrom<=now&&x.activeUntil>now;
 });
 if(!candidates.length)return {mitigation:0,sourceSeal:null};
 const best=candidates.at(-1);
 return {mitigation:1,sourceSeal:best.seal};
}
function weave(s,p={}){
 if(!only(p,['witnessIndex','minutes'])||
  !int(p.witnessIndex,0,(s.log?.length||0)-1)||
  !int(p.minutes??60,45,240))
  throw Error('A real witnessed short boundary-weave experiment with elapsed time is required');
 if(s.player?.rift?.step<3||!s.player?.rift?.foldProof||
  !Fold.verify(s))throw Error('A genuine personally earned local Fold Step III is required');
 Anchor.earned(s);location(s);
 if(!verify(s))throw Error('Existing Boundary Weaving source history cannot be reconciled');
 const witness=observed(s,p.witnessIndex),d=witness.details,
  now=s.world.minutes,hashWitness=hash(witness),
  existing=current(s),time=p.minutes??60;
 if(existing?.attempts.some(x=>x.source.witnessHash===hashWitness))
  throw Error('The same original local boundary witness cannot be rerolled');
 if(existing?.attempts.some(x=>{
  const a=x.source;
  return a.success&&a.segmentId===d.segmentId&&a.activeUntil>now;
 }))throw Error('An already active physical boundary layer occupies this measured segment');
 const strain=existing?.strain||0;
 if(strain>=30)throw Error('Severe spatial shear strain needs genuine treatment before further weaving');
 const cost=3+Math.ceil(time/120);
 if(!int(s.player.stamina,cost,100000)||
  !int(s.table.combatants.player.stamina,cost,100000))
  throw Error('Actual human Stamina is needed for a bounded boundary microstructure');
 const risk=pressure(s),attributeScore=C.int(s.player.attributes.int,
   'earned Intelligence',1,30),
  skillRank=C.int(s.player.skills.arcana.rank,'earned Arcana',0,5),
  modifier=Math.floor((attributeScore-10)/2)+2*skillRank,
  dc=18+Math.ceil(d.areaSquareMetres/4)+risk.danger+
   Math.floor(strain/12);
 const c=C.check(s,{modifier,dc,label:'Genuinely witnessed local Rift Boundary Weaving IV'});
 const rollEvent=structuredClone(s.log.at(-1)),
  strainAdded=c.degree==='severe failure'?6:0;
 if(strainAdded){Combat.harm(s,Combat.get(s,'player'),2);U.sync(s,{source:'wounds'});}
 s.player.stamina-=cost;s.table.combatants.player.stamina=s.player.stamina;
 const stepBefore=s.player.rift.step;
 if(c.success&&stepBefore===3)s.player.rift.step=4;
 const src={origin:SOURCE,kind:'boundary-weave',
  location:s.world.location,boundaryId:d.boundaryId,
  segmentId:d.segmentId,mode:d.mode,area:d.areaSquareMetres,
  startMinute:now,minutes:time,duration:d.supportMinutes,
  staminaSpent:cost,riskAdjustment:risk.danger,riskSourceHash:risk.sourceHash,
  attributeScore,skillRank,modifier,dc,roll:c.roll,
  check:structuredClone(c),rollEvent,rollEventHash:hash(rollEvent),
  success:c.success,stepBefore,stepAfter:s.player.rift.step,
  strainBefore:strain,strainAdded,
  strainAfter:Math.min(100,strain+strainAdded),
  wounded:strainAdded>0,
  activeFrom:c.success?now+time:null,
  activeUntil:c.success?now+time+d.supportMinutes:null,
  witness,witnessHash:hashWitness};
 const receipt={origin:SOURCE,source:src,seal:hash(src)};
 const ledger=existing||{origin:SOURCE,
  anchorHash:hash(s.player.rift.anchorProof),
  foldHash:hash(s.player.rift.foldProof),strain:0,attempts:[]};
 ledger.attempts.push(receipt);ledger.strain=src.strainAfter;
 Realm.ensure(s).boundaryWeaves=ledger;
 if(c.success&&!s.player.rift.weaveProof)s.player.rift.weaveProof={
  source:SOURCE,firstSuccessSeal:receipt.seal,formedMinute:now+time,
  noPortalTravel:true};
 E.advance(s,time);W.finalizeTime(s,now);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Original local boundary physical microstructure source cannot be verified');
 return {attempted:true,success:c.success,check:c,mode:d.mode,
  segmentId:d.segmentId,activeUntil:src.activeUntil,
  strength:c.success?'source-verified local spatial microstructure':null,
  staminaSpent:cost,minutes:time,wounded:strainAdded>0,
  currentStep:s.player.rift.step,noPortalOpened:true,noGlobalWorldSealChanged:true};
}
module.exports={SOURCE,WITNESS,status,weave,verify,support,supportProof};
