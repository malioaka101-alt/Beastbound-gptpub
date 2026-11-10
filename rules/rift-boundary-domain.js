'use strict';
// Original Master §25: Boundary Domain VIII. A real, finite and expensive
// locally witnessed spatial framework with observed counters. It cannot
// rewrite global realm laws, grant portal entry or move anyone by assertion.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),W=require('./world'),U=require('./unified'),
 Combat=require('./combat'),Realm=require('../world/simulation'),
 Cosmos=require('../world/cosmology-ledger'),Anchor=require('./rift-anchors'),
 Walk=require('./rift-realm-walking'),Adapt=require('./rift-adaptation'),
 Weave=require('./rift-boundary-weaving');
const SOURCE='earned-bounded-spatial-domain-viii-v1',
 WITNESS='gm-observed-original-spatial-domain-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const int=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b;
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{3,65}$/.test(x);
const prose=x=>typeof x==='string'&&x.trim().length>=25&&x.length<=900;
const only=(p,k)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(x=>k.includes(x));
const MODES=Object.freeze(['reinforce','redirect','contour']);
const MANA=18,STAMINA=13,MINUTES=120;
const MATERIALS=Object.freeze({moss_crystal:2,ironbloom:1});
function ledger(s){return s.table?.realm?.riftDomains||null;}
function pressure(s){
 const w=Realm.peek(s),site=w?.mythic?.riftglass_vault,ec=w?.ecosystems?.riftglass;
 if(!site||!ec||!int(site.charge,0,100)||!int(site.seal,0,100)||
  !int(ec.pressure,0,100)||
  !['quiet','fading','surging','unstable'].includes(site.phase))
  throw Error('An actual independently changing Riftglass spatial environment is needed');
 return {danger:site.phase==='unstable'||site.seal<35?6:
  site.phase==='surging'||site.charge>72||ec.pressure>73?3:0,
  sourceHash:hash({phase:site.phase,charge:site.charge,seal:site.seal,
   pressure:ec.pressure,worldSeed:w.worldSeed,
   day:Math.floor(s.world.minutes/1440)})};
}
function evidence(s,index){
 if(!int(index,0,(s.log?.length||0)-1))
  throw Error('The domain needs an actually witnessed new local geometric experiment');
 const w=s.log[index],d=w?.details;
 if(w?.type!=='story'||!prose(w.text,18)||
  d?.origin!==WITNESS||d.location!==s.world?.location||
  d.boundaryId!=='riftglass_wardline'||!id(d.domainId)||
  !id(d.segmentId)||!MODES.includes(d.mode)||
  !int(d.areaSquareMetres,1,12)||
  !int(d.durationMinutes,60,240)||
  !prose(d.independentlyMeasuredFramework)||
  !prose(d.verifiedSourceEnergyPath)||
  !prose(d.realMetabolicSupport)||
  !prose(d.countermeasureAndDisruption)||
  !prose(d.independentRealmPressureLimit)||
  !prose(d.localAccessRights)||
  d.noRealmLawOverride!==true||
  d.noProtectedBoundaryCrossing!==true||
  d.noRemoteTravel!==true||
  d.noUnboundedEffect!==true)
  throw Error('A truly measured finite spatial field, independent counter, lawful local rights and actual energy route are required');
 return structuredClone(w);
}
function validRoll(a){
 const c=a?.check,e=a?.rollEvent;
 return !!(e?.type==='roll'&&a.rollEventHash===hash(e)&&
  hash(e.details)===hash(c)&&int(a.roll,1,20)&&a.roll===c.roll&&
  c.dc===a.dc&&c.modifier===a.modifier&&
  c.naturalBonus===C.naturalAdjustment(a.roll)&&
  c.total===a.roll+c.modifier+c.naturalBonus&&
  c.margin===c.total-c.dc&&
  c.success===(c.margin>=0)&&
  c.degree===C.degree(c.margin,true)&&
  c.progress===C.progress(c.degree));
}
function verify(s){
 const l=ledger(s);
 if(!l)return !s.player?.rift?.domainProof;
 if(l.origin!==SOURCE||!Array.isArray(l.attempts)||
  !l.attempts.length||!l.domains||
  l.walkProofHash!==hash(s.player?.rift?.realmWalkingProof)||
  !int(l.strain,0,100))return false;
 let step=7,strain=0,first=null,last=-1;
 const reconstructed={},witnesses=new Set();
 for(const receipt of l.attempts){
  const a=receipt?.source,d=a?.witness?.details;
  if(receipt?.origin!==SOURCE||!a||receipt.seal!==hash(a)||
   a.origin!==SOURCE||a.kind!=='bounded-spatial-domain'||
   a.location!=='ruins'||a.boundaryId!=='riftglass_wardline'||
   !id(a.domainId)||!id(a.segmentId)||!MODES.includes(a.mode)||
   !int(a.area,1,12)||!int(a.duration,60,240)||
   !int(a.minute,last,s.world.minutes)||a.minutes!==MINUTES||
   a.minute+a.minutes>s.world.minutes||
   a.staminaSpent!==STAMINA||a.manaSpent!==MANA||
   !int(a.attributeScore,1,30)||!int(a.skillRank,0,5)||
   a.modifier!==Math.floor((a.attributeScore-10)/2)+2*a.skillRank||
   ![0,3,6].includes(a.riskAdjustment)||
   a.dc!==23+Math.ceil(a.area/4)+a.riskAdjustment+
    Math.floor(strain/12)-a.pressureTolerance||
   a.pressureTolerance!==1||
   !validRoll(a)||a.success!==a.check.success||
   a.stepBefore!==step||
   a.stepAfter!==(a.success?8:step)||
   a.strainBefore!==strain||
   a.strainAdded!==(a.check.degree==='severe failure'?8:0)||
   a.strainAfter!==Math.min(100,strain+a.strainAdded)||
   a.wounded!==(a.strainAdded>0)||
   a.activeFrom!==(a.success?a.minute+MINUTES:null)||
   a.activeUntil!==(a.success?a.activeFrom+a.duration:null)||
   !a.materialBefore||!a.materialAfter||
   Object.entries(MATERIALS).some(([item,qty])=>
    a.materialBefore[item]<qty||
    a.materialAfter[item]!==a.materialBefore[item]-qty)||
   !a.witness||a.witness.type!=='story'||
   a.witnessHash!==hash(a.witness)||
   d?.origin!==WITNESS||d.location!==a.location||
   d.boundaryId!==a.boundaryId||
   d.domainId!==a.domainId||d.segmentId!==a.segmentId||
   d.mode!==a.mode||d.areaSquareMetres!==a.area||
   d.durationMinutes!==a.duration||
   !prose(d.independentlyMeasuredFramework)||
   !prose(d.verifiedSourceEnergyPath)||
   !prose(d.realMetabolicSupport)||
   !prose(d.countermeasureAndDisruption)||
   !prose(d.independentRealmPressureLimit)||
   !prose(d.localAccessRights)||
   d.noRealmLawOverride!==true||
   d.noProtectedBoundaryCrossing!==true||
   d.noRemoteTravel!==true||
   d.noUnboundedEffect!==true||
   witnesses.has(a.witnessHash)||
   (a.success&&reconstructed[a.domainId]))
   return false;
  witnesses.add(a.witnessHash);
  strain=a.strainAfter;step=a.stepAfter;last=a.minute+MINUTES;
  if(a.success){
   reconstructed[a.domainId]={
    origin:SOURCE,id:a.domainId,segmentId:a.segmentId,
    mode:a.mode,area:a.area,location:a.location,
    opened:a.activeFrom,expires:a.activeUntil,
    sourceSeal:receipt.seal,nonTraversable:true};
   first||=receipt.seal;
  }
 }
 if(hash(reconstructed)!==hash(l.domains)||l.strain!==strain||
  (!!first)!==!!s.player?.rift?.domainProof||
  (first&&(s.player.rift.step<8||
   s.player.rift.domainProof?.source!==SOURCE||
   s.player.rift.domainProof?.firstSuccessSeal!==first||
   s.player.rift.domainProof?.earnedMinute!==
    reconstructed[l.attempts.find(x=>x.seal===first).source.domainId]?.opened)))
  return false;
 return true;
}
function earnedAt(s,minute){
 const l=ledger(s);
 return !!(l&&verify(s)&&l.attempts.some(x=>x.source.success&&
  x.source.activeFrom<=minute));
}
function supportProof(s,seal,segment,minute){
 const l=ledger(s);
 if(!l||!verify(s))return false;
 const a=l.attempts.find(x=>x.seal===seal)?.source;
 return !!(a?.success&&a.mode==='reinforce'&&a.segmentId===segment&&
  int(minute,a.activeFrom,a.activeUntil-1));
}
function support(s,segment){
 if(!id(segment)||!verify(s))return {mitigation:0,sourceSeal:null};
 const now=s.world?.minutes;
 const matches=Object.values(ledger(s)?.domains||{}).filter(x=>
  x.mode==='reinforce'&&x.segmentId===segment&&
  x.opened<=now&&now<x.expires);
 if(!matches.length)return {mitigation:0,sourceSeal:null};
 const last=matches.at(-1);
 return {mitigation:2,sourceSeal:last.sourceSeal};
}
function status(s){
 if(!verify(s))throw Error('Original spatial Domain VIII receipts do not verify');
 const l=ledger(s),now=s.world.minutes;
 return {step:s.player.rift.step,earned:!!s.player.rift.domainProof,
  attempts:l?.attempts.length||0,strain:l?.strain||0,
  activeDomains:Object.values(l?.domains||{})
   .filter(x=>x.opened<=now&&now<x.expires).map(x=>({
    id:x.id,segmentId:x.segmentId,mode:x.mode,
    areaSquareMetres:x.area,expiresAtWorldMinute:x.expires,
    noPortal:true})),
  noRealmEntry:true,noGlobalWorldStateRewrite:true,
  note:'Only locally measured finite framework with genuine shear and countermeasures; other source-valid kinds need their own action adapters'};
}
function form(s,p={}){
 if(!only(p,['witnessIndex'])||
  !int(p.witnessIndex,0,(s.log?.length||0)-1))
  throw Error('One actually witnessed bounded local spatial framework is required');
 if(s.world?.location!=='ruins'||Walk.isInside(s)||
  (s.world?.planeId&&s.world.planeId!=='mortal')||
  s.battle||s.encounter||
  s.table?.combatants?.player?.status!=='ok')
  throw Error('A verified safe living human must be physically at the original Riftglass exterior');
 if(s.player?.rift?.step<7||!s.player.rift.realmWalkingProof||
  !Walk.verify(s)||!Adapt.verify(s))
  throw Error('The original selected Realm Walking VII and observed human Rift adaptation VI must be earned');
 Anchor.earned(s);
 const cosm=Cosmos.peek(s)||Cosmos.seed();
 Cosmos.validate(cosm,s);
 if(cosm.boundaries?.riftglass_wardline?.noProvenPassage!==true)
  throw Error('A globally opened portal cannot be inferred from observed domain geometry');
 if(!verify(s))throw Error('Previous bounded Domain VIII sources lost integrity');
 const w=evidence(s,p.witnessIndex),d=w.details,
  h=hash(w),r=ledger(s),minute=s.world.minutes;
 if(r?.attempts.some(x=>x.source.witnessHash===h))
  throw Error('One observed original domain geometry cannot be rerolled');
 if(r?.domains?.[d.domainId]||r?.attempts.some(x=>x.source.domainId===d.domainId))
  throw Error('An independently surveyed domain identity cannot be replaced');
 if(r?.strain>=24)
  throw Error('Severe individual spatial strain needs genuine recovery first');
 if(r&&Object.values(r.domains).some(x=>x.opened<=minute&&minute<x.expires&&
   x.segmentId===d.segmentId))
  throw Error('An existing active physical field occupies that exact locally surveyed segment');
 const plan=U.planItems(s,Object.fromEntries(
  Object.entries(MATERIALS).map(([k,v])=>[k,-v])));
 if(!int(s.player.stamina,STAMINA,100000)||
  !int(s.table.combatants.player.stamina,STAMINA,100000)||
  !int(s.player.mana,MANA,100000))
  throw Error('A bounded actual Domain requires substantial original Stamina and existing Mana, not an invented energy reservoir');
 const before=Object.fromEntries(Object.keys(MATERIALS).map(k=>[k,s.player.inventory?.[k]||0])),
  after=Object.fromEntries(Object.keys(MATERIALS).map(k=>[k,before[k]-MATERIALS[k]]));
 const pres=pressure(s);
 const attr=C.int(s.player.attributes.int,'earned Int',1,30),
  rank=C.int(s.player.skills.arcana.rank,'earned Arcana',0,5),
  modifier=Math.floor((attr-10)/2)+2*rank,
  tolerance=Adapt.pressureTolerance(s);
 if(tolerance!==1)
  throw Error('A genuinely observed biological pressure adaptation is necessary for this particular living domain construction');
 const dc=23+Math.ceil(d.areaSquareMetres/4)+pres.danger+
  Math.floor((r?.strain||0)/12)-tolerance;
 const check=C.check(s,{modifier,dc,
  label:'Original limited Rift Boundary Domain VIII'});
 const rollEvent=structuredClone(s.log.at(-1)),
  wound=check.degree==='severe failure';
 U.applyItems(s,plan);
 if(wound){Combat.harm(s,Combat.get(s,'player'),2);U.sync(s,{source:'wounds'});}
 s.player.mana-=MANA;s.player.stamina-=STAMINA;
 s.table.combatants.player.stamina=s.player.stamina;
 const oldStep=s.player.rift.step,afterStep=check.success?Math.max(8,oldStep):oldStep,
  opened=check.success?minute+MINUTES:null,
  expires=check.success?opened+d.durationMinutes:null;
 if(check.success&&oldStep===7)s.player.rift.step=8;
 const a={origin:SOURCE,kind:'bounded-spatial-domain',
  location:s.world.location,boundaryId:d.boundaryId,
  domainId:d.domainId,segmentId:d.segmentId,mode:d.mode,
  area:d.areaSquareMetres,duration:d.durationMinutes,
  minute,minutes:MINUTES,staminaSpent:STAMINA,manaSpent:MANA,
  materialBefore:before,materialAfter:after,
  attributeScore:attr,skillRank:rank,modifier,dc,
  riskAdjustment:pres.danger,riskSourceHash:pres.sourceHash,
  pressureTolerance:tolerance,
  check:structuredClone(check),rollEvent,rollEventHash:hash(rollEvent),
  roll:check.roll,success:check.success,
  stepBefore:oldStep,stepAfter:afterStep,
  strainBefore:r?.strain||0,strainAdded:wound?8:0,
  strainAfter:Math.min(100,(r?.strain||0)+(wound?8:0)),wounded:wound,
  activeFrom:opened,activeUntil:expires,
  witness:w,witnessHash:h};
 const receipt={origin:SOURCE,source:a,seal:hash(a)};
 const l=r||{origin:SOURCE,
  walkProofHash:hash(s.player.rift.realmWalkingProof),
  attempts:[],domains:{},strain:0};
 l.attempts.push(receipt);l.strain=a.strainAfter;
 if(check.success){
  l.domains[d.domainId]={origin:SOURCE,id:d.domainId,
   segmentId:d.segmentId,mode:d.mode,area:d.areaSquareMetres,
   location:s.world.location,opened,expires,sourceSeal:receipt.seal,
   nonTraversable:true};
  s.player.rift.domainProof||={source:SOURCE,
   firstSuccessSeal:receipt.seal,earnedMinute:opened,
   boundedToActualEnvironment:true,noPortal:true};
 }
 Realm.ensure(s).riftDomains=l;
 E.advance(s,MINUTES);W.finalizeTime(s,minute);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Original Boundary Domain VIII source, material or physical field receipts failed verification');
 return {attempted:true,success:check.success,check,
  domainId:d.domainId,mode:d.mode,segmentId:d.segmentId,
  areaSquareMetres:check.success?d.areaSquareMetres:0,
  activeUntil:expires,staminaSpent:STAMINA,manaSpent:MANA,
  ownedMaterialsSpent:{...MATERIALS},minutes:MINUTES,
  wounded:wound,step:s.player.rift.step,
  noPortal:true,noGlobalRealmRewrite:true,
  actualLocalFoldMitigation:check.success&&d.mode==='reinforce'?2:0};
}
module.exports={SOURCE,WITNESS,MATERIALS,verify,earnedAt,
 supportProof,support,status,form};
