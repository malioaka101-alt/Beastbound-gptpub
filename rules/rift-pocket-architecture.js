'use strict';
// Master §25 Pocket Architecture V: a genuine, source-observed, finite
// extra-dimensional *storage structure* fixed to the already existing
// Riftglass exterior anchor. No creatures, free material, remote access,
// hidden vault entry or implied traversable portal.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),W=require('./world'),U=require('./unified'),
 Combat=require('./combat'),Realm=require('../world/simulation'),
 Anchor=require('./rift-anchors'),Fold=require('./rift-fold-step'),
 Weave=require('./rift-boundary-weaving'),
 Cosmos=require('../world/cosmology-ledger');
const SOURCE='earned-rift-pocket-architecture-v-v1',
 WITNESS='gm-observed-anchored-rift-pocket-v-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const int=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b;
const slug=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{3,65}$/.test(x);
const prose=(x,min=25)=>typeof x==='string'&&x.trim().length>=min&&x.length<=900;
const only=(p,keys)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(k=>keys.includes(k));
function ledger(s){return s.table?.realm?.riftPockets||null;}
function site(s){
 const c=s.table?.combatants?.player;
 if(s.world?.location!=='ruins'||s.battle||s.encounter||c?.status!=='ok')
  throw Error('A stable physically present Riftglass exterior scene is required');
 const cosmos=Cosmos.peek(s)||Cosmos.seed();
 Cosmos.validate(cosmos,s);
 if(cosmos.boundaries?.riftglass_wardline?.noProvenPassage!==true)
  throw Error('A measured external boundary is not an open portal');
 Anchor.earned(s);
}
function requirements(s){
 site(s);
 if(s.player?.rift?.step<4||!s.player?.rift?.weaveProof||
  !Fold.verify(s)||!Weave.verify(s))
  throw Error('An actually earned Rift Boundary Weaving IV, prior Fold III and original anchor are required');
}
function witness(s,index){
 if(!int(index,0,(s.log?.length||0)-1))
  throw Error('A present GM-witnessed original storage geometry and material proof is required');
 const e=s.log[index],d=e?.details;
 if(e?.type!=='story'||d?.origin!==WITNESS||
  !prose(e.text,18)||d.location!==s.world.location||
  d.boundaryId!=='riftglass_wardline'||!slug(d.segmentId)||
  !slug(d.pocketId)||!int(d.capacityUnits,1,8)||
  !int(d.lifetimeHours,24,336)||
  !prose(d.originalSpatialVolume)||
  !prose(d.originalStableAnchoring)||
  !prose(d.independentCollapseCountertest)||
  !prose(d.measuredEnergyAndMetabolicDemand)||
  !prose(d.ownershipAndMaterialProvenance)||
  !prose(d.accessAndRetrievalLimit)||
  d.noLivingStorage!==true||d.noPortalTransit!==true||
  d.noRealmEntry!==true||
  !d.materials||typeof d.materials!=='object'||
  Array.isArray(d.materials)||Object.keys(d.materials).length<1||
  Object.keys(d.materials).length>8||
  Object.entries(d.materials).some(([item,qty])=>
   !Object.hasOwn(E.RESOURCES,item)||!int(qty,1,10))||
  Object.values(d.materials).reduce((n,q)=>n+q,0)<2)
  throw Error('Original real anchor, capacity, duration, substantial owned materials and independent collapse limits must be observed');
 return structuredClone(e);
}
function rollProof(a){
 const c=a.check;
 return !!(a.rollEvent?.type==='roll'&&a.rollEventHash===hash(a.rollEvent)&&
  hash(a.rollEvent.details)===hash(c)&&
  int(a.roll,1,20)&&a.roll===c.roll&&
  c.dc===a.dc&&c.modifier===a.modifier&&
  c.naturalBonus===C.naturalAdjustment(a.roll)&&
  c.total===a.roll+c.modifier+c.naturalBonus&&
  c.margin===c.total-c.dc&&
  c.degree===C.degree(c.margin,true)&&
  c.success===(c.margin>=0)&&c.progress===C.progress(c.degree));
}
function verify(s){
 const r=ledger(s);
 if(!r)return !s.player?.rift?.pocketProof;
 if(r.origin!==SOURCE||!Array.isArray(r.attempts)||
  !r.attempts.length||!Array.isArray(r.transfers)||
  !r.spaces||typeof r.spaces!=='object'||Array.isArray(r.spaces)||
  r.anchorHash!==hash(s.player?.rift?.anchorProof)||
  r.weaveProofHash!==hash(s.player?.rift?.weaveProof)||
  !int(r.strain,0,100))return false;
 let step=4,strain=0,last=-1,firstSuccess=null;
 const actual={},seen=new Set();
 for(const receipt of r.attempts){
  const a=receipt?.source,d=a?.witness?.details;
  if(receipt?.origin!==SOURCE||receipt.seal!==hash(a)||
   a?.origin!==SOURCE||a.kind!=='pocket-construction'||
   a.location!=='ruins'||a.boundaryId!=='riftglass_wardline'||
   !slug(a.pocketId)||!slug(a.segmentId)||
   !int(a.capacity,1,8)||!int(a.lifetime,24,336)||
   !int(a.minute,last,s.world.minutes)||
   !int(a.minutes,180,480)||a.minute+a.minutes>s.world.minutes||
   a.staminaSpent!==5+Math.ceil(a.minutes/180)||
   !int(a.attributeScore,1,30)||!int(a.skillRank,0,5)||
   a.modifier!==Math.floor((a.attributeScore-10)/2)+2*a.skillRank||
   ![0,3,6].includes(a.riskAdjustment)||
   a.dc!==19+Math.ceil(a.capacity/2)+a.riskAdjustment+
    Math.floor(strain/12)||
   !rollProof(a)||a.success!==a.check.success||
   a.strainBefore!==strain||
   a.strainAdded!==(a.check.degree==='severe failure'?8:0)||
   a.strainAfter!==Math.min(100,strain+a.strainAdded)||
   a.wounded!==(a.strainAdded>0)||
   a.stepBefore!==step||
   a.stepAfter!==(a.success?Math.max(step,5):step)||
   !a.weaveSourceSeal||
   !Weave.supportProof(s,a.weaveSourceSeal,a.segmentId,a.minute+a.minutes-1)||
   !a.witness||a.witness.type!=='story'||
   a.witnessHash!==hash(a.witness)||
   d?.origin!==WITNESS||d.location!==a.location||
   d.boundaryId!==a.boundaryId||
   d.segmentId!==a.segmentId||d.pocketId!==a.pocketId||
   d.capacityUnits!==a.capacity||d.lifetimeHours!==a.lifetime||
   !prose(d.originalSpatialVolume)||!prose(d.originalStableAnchoring)||
   !prose(d.independentCollapseCountertest)||
   !prose(d.measuredEnergyAndMetabolicDemand)||
   !prose(d.ownershipAndMaterialProvenance)||
   !prose(d.accessAndRetrievalLimit)||
   d.noLivingStorage!==true||d.noPortalTransit!==true||
   d.noRealmEntry!==true||
   hash(d.materials)!==hash(a.materials)||
   !a.materialBefore||!a.materialAfter||
   Object.keys(a.materials).some(item=>
    !Object.hasOwn(E.RESOURCES,item)||!int(a.materials[item],1,10)||
    !int(a.materialBefore[item],a.materials[item],1000000)||
    a.materialAfter[item]!==a.materialBefore[item]-a.materials[item])||
   seen.has(a.witnessHash)||
   (a.success&&actual[a.pocketId]))
   return false;
  seen.add(a.witnessHash);
  if(a.success){
   const opened=a.minute+a.minutes;
   if(a.expiresAt!==opened+a.lifetime*60)return false;
   actual[a.pocketId]={origin:SOURCE,id:a.pocketId,seal:receipt.seal,
    location:a.location,segmentId:a.segmentId,capacity:a.capacity,
    opened,expiresAt:a.expiresAt,contents:{}};
   firstSuccess||=receipt.seal;
  }else if(a.expiresAt!==null)return false;
  strain=a.strainAfter;step=a.stepAfter;last=a.minute+a.minutes;
 }
 const movesUsed=new Set();
 for(const rec of r.transfers){
  const t=rec?.source,space=actual[t?.pocketId];
  if(rec?.origin!==SOURCE||rec.seal!==hash(t)||
   t?.origin!==SOURCE||t.kind!=='pocket-material-transfer'||
   !space||t.location!==space.location||
   !int(t.minute,space.opened,Math.min(space.expiresAt-1,s.world.minutes))||
   !int(t.minutes,5,20)||t.minute+t.minutes>space.expiresAt||
   t.staminaSpent!==1||!Object.hasOwn(E.RESOURCES,t.item)||
   !int(t.units,1,8)||
   !['store','retrieve'].includes(t.direction)||
   !int(t.pocketBefore,0,space.capacity)||
   !int(t.inventoryBefore,0,1000000)||
   t.pocketBefore!==(space.contents[t.item]||0)||
   t.pocketAfter!==(t.direction==='store'?
    t.pocketBefore+t.units:t.pocketBefore-t.units)||
   t.inventoryAfter!==(t.direction==='store'?
    t.inventoryBefore-t.units:t.inventoryBefore+t.units)||
   t.pocketAfter<0||t.inventoryAfter<0||
   Object.values(space.contents).reduce((n,v)=>n+v,0)+
    (t.direction==='store'?t.units:-t.units)>space.capacity||
   movesUsed.has(rec.seal))
   return false;
  movesUsed.add(rec.seal);
  if(t.pocketAfter===0)delete space.contents[t.item];
  else space.contents[t.item]=t.pocketAfter;
 }
 if(strain!==r.strain||
  hash(actual)!==hash(r.spaces)||
  !!firstSuccess!==!!s.player?.rift?.pocketProof||
  (firstSuccess&&(s.player.rift.step<5||
   s.player.rift.pocketProof?.source!==SOURCE||
   s.player.rift.pocketProof?.firstSuccessSeal!==firstSuccess)))
  return false;
 return true;
}
function status(s){
 if(!verify(s))throw Error('Real source-backed Rift Pocket Architecture evidence failed verification');
 const r=ledger(s),now=s.world.minutes;
 return {earned:!!s.player?.rift?.pocketProof,step:s.player?.rift?.step||0,
  attempts:r?.attempts.length||0,
  pockets:Object.values(r?.spaces||{}).map(x=>({
   id:x.id,segmentId:x.segmentId,capacityUnits:x.capacity,
   usedUnits:Object.values(x.contents).reduce((n,v)=>n+v,0),
   actualContents:{...x.contents},
   expiresAtWorldMinute:x.expiresAt,
   accessible:now<x.expiresAt&&s.world.location===x.location,
   physicallyTrappedAfterCollapse:now>=x.expiresAt,
   noPortalTransit:true})),
  note:'Finite, source-established human-accessible storage only at the known physical anchor. Unretrieved items remain recorded, not granted back when a temporary structure collapses'};
}
function pressure(s){
 const w=Realm.peek(s),site=w?.mythic?.riftglass_vault,
  ec=w?.ecosystems?.riftglass;
 if(!site||!ec||!int(site.charge,0,100)||!int(site.seal,0,100)||
  !int(ec.pressure,0,100)||
  !['quiet','fading','surging','unstable'].includes(site.phase))
  throw Error('Original independently changing spatial pressure is required');
 return {risk:site.phase==='unstable'||site.seal<35?6:
  site.phase==='surging'||site.charge>72||ec.pressure>73?3:0};
}
function build(s,p={}){
 if(!only(p,['witnessIndex','minutes'])||
  !int(p.witnessIndex,0,(s.log?.length||0)-1)||
  !int(p.minutes??180,180,480))
  throw Error('Only a real witnessed specific spatial pocket construction and elapsed work are accepted');
 requirements(s);
 if(!verify(s))throw Error('Earlier pocket architecture receipts do not reconcile');
 const e=witness(s,p.witnessIndex),d=e.details,
  wHash=hash(e),start=s.world.minutes,minutes=p.minutes??180,
  existing=ledger(s);
 if(existing?.attempts.some(x=>x.source.witnessHash===wHash))
  throw Error('A pocket structure cannot reroll the same original observed geometry');
 if(existing?.spaces[d.pocketId]||
    existing?.attempts.some(x=>x.source.pocketId===d.pocketId))
  throw Error('This original pocket identity was already attempted; another construction needs an independent surveyed identity');
 const weave=Weave.support(s,d.segmentId);
 if(!weave.sourceSeal||!
  Weave.supportProof(s,weave.sourceSeal,d.segmentId,start+minutes-1))
  throw Error('A genuine source-witnessed reinforced physical segment must remain stable throughout construction');
 const strain=existing?.strain||0;
 if(strain>=30)throw Error('Original spatial strain requires actual recovery before construction');
 const staminaSpent=5+Math.ceil(minutes/180);
 if(!int(s.player.stamina,staminaSpent,100000)||
  !int(s.table?.combatants?.player?.stamina,staminaSpent,100000))
  throw Error('Actual living Stamina is required for original dimensional construction');
 const materials=structuredClone(d.materials);
 const changes=Object.fromEntries(Object.entries(materials).map(([k,v])=>[k,-v]));
 const plan=U.planItems(s,changes),
  materialBefore=Object.fromEntries(Object.keys(materials).map(k=>[k,s.player.inventory[k]||0])),
  materialAfter=Object.fromEntries(Object.keys(materials).map(k=>[k,materialBefore[k]-materials[k]]));
 const attr=C.int(s.player.attributes.int,'earned Int',1,30),
  rank=C.int(s.player.skills.arcana.rank,'earned Arcana',0,5),
  modifier=Math.floor((attr-10)/2)+rank*2,
  risk=pressure(s).risk,dc=19+Math.ceil(d.capacityUnits/2)+risk+
   Math.floor(strain/12);
 const check=C.check(s,{modifier,dc,label:'Source-measured Rift Pocket Architecture V'});
 const rollEvent=structuredClone(s.log.at(-1)),
  added=check.degree==='severe failure'?8:0;
 U.applyItems(s,plan);
 if(added){Combat.harm(s,Combat.get(s,'player'),2);U.sync(s,{source:'wounds'});}
 s.player.stamina-=staminaSpent;s.table.combatants.player.stamina=s.player.stamina;
 const oldStep=s.player.rift.step;
 if(check.success&&oldStep===4)s.player.rift.step=5;
 const expiresAt=check.success?start+minutes+d.lifetimeHours*60:null;
 const src={origin:SOURCE,kind:'pocket-construction',
  location:s.world.location,boundaryId:d.boundaryId,
  segmentId:d.segmentId,pocketId:d.pocketId,
  capacity:d.capacityUnits,lifetime:d.lifetimeHours,
  materialBefore,materialAfter,materials,
  weaveSourceSeal:weave.sourceSeal,minute:start,minutes,staminaSpent,
  attributeScore:attr,skillRank:rank,modifier,dc,riskAdjustment:risk,
  check:structuredClone(check),rollEvent,rollEventHash:hash(rollEvent),
  roll:check.roll,success:check.success,
  stepBefore:oldStep,stepAfter:s.player.rift.step,
  strainBefore:strain,strainAdded:added,
  strainAfter:Math.min(100,strain+added),wounded:added>0,
  expiresAt,witness:e,witnessHash:wHash};
 const receipt={origin:SOURCE,source:src,seal:hash(src)},
  r=existing||{origin:SOURCE,
   anchorHash:hash(s.player.rift.anchorProof),
   weaveProofHash:hash(s.player.rift.weaveProof),
   strain:0,attempts:[],spaces:{},transfers:[]};
 r.attempts.push(receipt);r.strain=src.strainAfter;
 if(check.success){
  r.spaces[d.pocketId]={origin:SOURCE,id:d.pocketId,seal:receipt.seal,
   location:src.location,segmentId:src.segmentId,capacity:src.capacity,
   opened:start+minutes,expiresAt,contents:{}};
  if(!s.player.rift.pocketProof)s.player.rift.pocketProof={
   source:SOURCE,firstSuccessSeal:receipt.seal,
   earnedMinute:start+minutes,noRealmAccess:true};
 }
 Realm.ensure(s).riftPockets=r;
 E.advance(s,minutes);W.finalizeTime(s,start);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Original anchored human Pocket Architecture material or spatial source failed verification');
 return {attempted:true,success:check.success,check,
  pocketId:d.pocketId,capacityUnits:check.success?d.capacityUnits:0,
  durationHours:check.success?d.lifetimeHours:0,
  materialsSpent:materials,staminaSpent,minutes,
  spatialShearWound:added>0,
  currentStep:s.player.rift.step,noRealmTransit:true,noLivingStorage:true};
}
function transfer(s,p={}){
 if(!only(p,['pocketId','direction','item','units'])||
  !slug(p.pocketId)||!['store','retrieve'].includes(p.direction)||
  !Object.hasOwn(E.RESOURCES,p.item)||!int(p.units,1,8))
  throw Error('An original named owned physical item and an existing local pocket are required');
 requirements(s);
 if(!verify(s))throw Error('The physical pocket material accounting failed verification');
 const r=ledger(s),space=r?.spaces[p.pocketId],now=s.world.minutes;
 if(!space||now<space.opened||now+5>space.expiresAt)
  throw Error('The personally constructed temporary pocket must still be physically accessible; expired contents remain inaccessible');
 if(!int(s.player.stamina,1,100000)||
  !int(s.table.combatants.player.stamina,1,100000))
  throw Error('An actual Stamina point is needed to hold the original access fold');
 const before=space.contents[p.item]||0,
  inventoryBefore=s.player.inventory?.[p.item]||0,
  delta=p.direction==='store'?-p.units:p.units,
  pocketAfter=before-delta;
 if(pocketAfter<0||Object.values(space.contents).reduce((n,v)=>n+v,0)-delta>space.capacity)
  throw Error('The measured temporary pocket cannot contain or supply material beyond its actual source volume');
 const plan=U.planItems(s,{[p.item]:delta});
 U.applyItems(s,plan);
 if(pocketAfter===0)delete space.contents[p.item];
 else space.contents[p.item]=pocketAfter;
 s.player.stamina-=1;s.table.combatants.player.stamina=s.player.stamina;
 const src={origin:SOURCE,kind:'pocket-material-transfer',
  pocketId:p.pocketId,location:s.world.location,
  minute:now,minutes:5,staminaSpent:1,
  direction:p.direction,item:p.item,units:p.units,
  pocketBefore:before,pocketAfter,
  inventoryBefore,inventoryAfter:inventoryBefore+delta};
 r.transfers.push({origin:SOURCE,source:src,seal:hash(src)});
 E.advance(s,5);W.finalizeTime(s,now);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Original pocket storage and carried stock receipts do not reconcile');
 return {success:true,pocketId:p.pocketId,direction:p.direction,
  item:p.item,units:p.units,pocketContents:{...space.contents},
  staminaSpent:1,minutes:5,noDuplication:true,noPortal:true};
}
module.exports={SOURCE,WITNESS,build,transfer,status,verify};
