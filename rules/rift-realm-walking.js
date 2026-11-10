'use strict';
// Master §25 Realm Walking VII: an actual separately witnessed selected
// opening, prepared coordinates and real return, never a generic portal.
// world.location is the retained mortal anchor while world.planeId and the
// active excursion record the character's actual foreign-plane presence.
// Central rule and legacy command dispatch must guard that distinction.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),W=require('./world'),U=require('./unified'),
 Combat=require('./combat'),Realm=require('../world/simulation'),
 Cosmos=require('../world/cosmology-ledger'),Anchor=require('./rift-anchors'),
 Fold=require('./rift-fold-step'),Weave=require('./rift-boundary-weaving'),
 Pocket=require('./rift-pocket-architecture'),Adapt=require('./rift-adaptation');
const SOURCE='earned-selected-realm-walking-vii-v1',
 ROUTE='gm-witnessed-actual-realm-passage-and-return-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const int=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b;
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{3,65}$/.test(x);
const prose=x=>typeof x==='string'&&x.trim().length>=25&&x.length<=900;
const only=(p,keys)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(k=>keys.includes(k));
function ledger(s){return s.table?.realm?.riftWalk||null;}
function isInside(s){return !!(ledger(s)?.active&&s.world?.planeId&&s.world.planeId!=='mortal');}
function pressure(s){
 const w=Realm.peek(s),m=w?.mythic?.riftglass_vault,e=w?.ecosystems?.riftglass;
 if(!m||!e||!int(m.charge,0,100)||!int(m.seal,0,100)||
  !int(e.pressure,0,100)||!['quiet','fading','surging','unstable'].includes(m.phase))
  throw Error('Original independent outer spatial pressure is required');
 return {risk:m.phase==='unstable'||m.seal<35?6:
  m.phase==='surging'||m.charge>72||e.pressure>73?3:0,
  seal:hash({phase:m.phase,charge:m.charge,seal:m.seal,
   pressure:e.pressure,day:Math.floor(s.world.minutes/1440),seed:w.worldSeed})};
}
function route(s,routeId,fresh=false){
 if(!id(routeId))throw Error('A specific independently recorded real route is required');
 const rec=s.table?.realm?.riftRouteSources?.[routeId],q=rec?.source,
  w=q?.witness,d=w?.details,v=Cosmos.registry(s);
 Cosmos.validate(v,s);
 const b=v.boundaries?.[q?.boundaryId];
 if(!rec||rec.origin!==ROUTE||rec.seal!==hash(q)||
  q.origin!==ROUTE||q.routeId!==routeId||
  !b||b.siteId!=='riftglass_vault'||b.noProvenPassage!==true||
  b.visibility!=='public'||b.planeId!==q.planeId||
  !v.planes?.[q.planeId]||q.planeId==='mortal'||
  v.planes[q.planeId].visibility!=='public'||
  q.entryLocation!=='ruins'||
  !prose(q.entryCoordinate)||!prose(q.arrivalCoordinate)||
  !prose(q.returnCoordinate)||!prose(q.originalPhysicalOpening)||
  !prose(q.independentArrivalSurvey)||!prose(q.independentReturnSurvey)||
  !prose(q.legalProtectionAuthority)||!prose(q.energyAndShearProtections)||
  !prose(q.foreignRealmPressureLimits)||
  !int(q.openMinute,0,s.world.minutes)||
  !int(q.closesMinute,q.openMinute+60,s.world.minutes+10080)||
  w?.type!=='story'||q.witnessHash!==hash(w)||
  d?.origin!==ROUTE||d.routeId!==routeId||
  d.location!=='ruins'||d.boundaryId!==q.boundaryId||
  d.planeId!==q.planeId||d.actualOpeningWitnessed!==true||
  d.arrivalMeasured!==true||d.returnPassageMeasured!==true||
  d.protectedVaultEntry!==false||d.noUniversalPortal!==true)
  throw Error('Independent GM evidence for an actually open, rights-checked, individually measured route and return is required');
 const inLog=s.log?.some(e=>hash(e)===q.witnessHash);
 const archived=ledger(s)?.witnessArchive?.[q.witnessHash];
 if((fresh&&!inLog)||(!inLog&&
  !(archived?.origin===ROUTE&&archived.seal===q.witnessHash&&
    hash(archived.event)===q.witnessHash)))
  throw Error('Original realm opening must have been actually witnessed before being used or archived');
 return {rec,q};
}
function entryScene(s){
 if(isInside(s)||s.world?.planeId&&s.world.planeId!=='mortal')
  throw Error('Already physically in a foreign plane: return along the authentic route first');
 if(s.world?.location!=='ruins'||s.battle||s.encounter||
  s.table?.combatants?.player?.status!=='ok')
  throw Error('An actual safe physical Riftglass exterior scene is required');
 if(s.player?.rift?.step<6||!s.player.rift.adaptationProof||
  !Fold.verify(s)||!Weave.verify(s)||!Pocket.verify(s)||!Adapt.verify(s))
  throw Error('Genuinely earned original Rift I–VI is required; a high unverified rank grants no portal');
 Anchor.earned(s);
}
function rollValid(a){
 const c=a?.check,e=a?.rollEvent;
 return !!(c&&e?.type==='roll'&&a.rollEventHash===hash(e)&&
  hash(e.details)===hash(c)&&int(a.roll,1,20)&&a.roll===c.roll&&
  c.dc===a.dc&&c.modifier===a.modifier&&
  c.naturalBonus===C.naturalAdjustment(a.roll)&&
  c.total===a.roll+c.modifier+c.naturalBonus&&
  c.margin===c.total-c.dc&&c.success===(c.margin>=0)&&
  c.degree===C.degree(c.margin,true)&&c.progress===C.progress(c.degree));
}
function verify(s){
 const t=ledger(s);
 if(!t)return !s.player?.rift?.realmWalkingProof&&
  (!s.world?.planeId||s.world.planeId==='mortal');
 if(t.origin!==SOURCE||!id(t.routeId)||!Array.isArray(t.attempts)||
  !t.attempts.length||!t.witnessArchive||
  t.routeSeal!==s.table?.realm?.riftRouteSources?.[t.routeId]?.seal)
  return false;
 let q;
 try{q=route(s,t.routeId).q}catch{return false}
 let prep=null,active=null,first=null,last=-1;
 for(const receipt of t.attempts){
  const a=receipt?.source;
  if(receipt?.origin!==SOURCE||!a||receipt.seal!==hash(a)||
   a.origin!==SOURCE||a.routeId!==t.routeId||
   !['prepare','enter','return'].includes(a.kind)||
   !int(a.minute,last,s.world.minutes)||
   !int(a.minutes,a.kind==='prepare'?45:5,
    a.kind==='prepare'?240:30)||
   a.minute+a.minutes>s.world.minutes||
   ![0,3,6].includes(a.riskAdjustment)||
   a.staminaSpent!==(a.kind==='prepare'?4:a.kind==='enter'?5:4)||
   !int(a.attributeScore,1,30)||!int(a.skillRank,0,5)||
   a.modifier!==Math.floor((a.attributeScore-10)/2)+2*a.skillRank||
   a.dc!==(a.kind==='prepare'?18:a.kind==='enter'?19:18)+a.riskAdjustment||
   !rollValid(a)||a.success!==a.check.success||
   a.wounded!==(a.check.degree==='severe failure')||
   a.woundSeverity!==(a.wounded?2:0))
   return false;
  if(a.kind==='prepare'){
   if(active||prep?.success)return false;
   prep=a;
  }else if(a.kind==='enter'){
   if(!prep?.success||active||!int(a.minute,
    prep.minute+prep.minutes,q.closesMinute-1))return false;
   if(a.success){
    first||=receipt.seal;
    active={routeId:q.routeId,planeId:q.planeId,
     arrivalCoordinate:q.arrivalCoordinate,mortalAnchor:'ruins',
     enteredMinute:a.minute+a.minutes,entrySeal:receipt.seal};
   }
  }else{
   if(!active||a.minute<active.enteredMinute)return false;
   if(a.success)active=null;
  }
  last=a.minute+a.minutes;
 }
 if(hash(prep)!==hash(t.preparation)||hash(active)!==hash(t.active)||
  (!!first)!==!!s.player?.rift?.realmWalkingProof||
  (first&&(s.player.rift.step<7||
   s.player.rift.realmWalkingProof?.source!==SOURCE||
   s.player.rift.realmWalkingProof?.firstEntrySeal!==first))||
  (active&&s.world.planeId!==q.planeId)||
  (!active&&s.world.planeId&&s.world.planeId!=='mortal'))
  return false;
 return true;
}
function check(s,q,kind,minutes,baseDc,cost){
 if(!int(s.player.stamina,cost,100000)||
  !int(s.table?.combatants?.player?.stamina,cost,100000))
  throw Error('Real physical Stamina and living human capacity are required for this dangerous route');
 const start=s.world.minutes,attr=C.int(s.player.attributes.int,'earned Int',1,30),
  rank=C.int(s.player.skills.arcana.rank,'earned Arcana',0,5),
  modifier=Math.floor((attr-10)/2)+2*rank,r=pressure(s),
  dc=baseDc+r.risk;
 const outcome=C.check(s,{modifier,dc,label:'Real chosen realm passage — '+kind});
 const event=structuredClone(s.log.at(-1)),
  wounded=outcome.degree==='severe failure';
 if(wounded){Combat.harm(s,Combat.get(s,'player'),2);U.sync(s,{source:'wounds'});}
 s.player.stamina-=cost;s.table.combatants.player.stamina=s.player.stamina;
 return {origin:SOURCE,kind,routeId:q.routeId,minute:start,minutes,
  staminaSpent:cost,attributeScore:attr,skillRank:rank,modifier,
  riskAdjustment:r.risk,riskSourceHash:r.seal,dc,
  check:structuredClone(outcome),rollEvent:event,
  rollEventHash:hash(event),roll:outcome.roll,success:outcome.success,
  wounded,woundSeverity:wounded?2:0};
}
function prepare(s,p={}){
 if(!only(p,['routeId','minutes'])||!id(p.routeId)||
  !int(p.minutes??90,45,240))
  throw Error('Only an original measured route identity and actual planning time are accepted');
 entryScene(s);
 const old=ledger(s);
 if(old&&(old.routeId!==p.routeId||old.preparation?.success||old.active))
  throw Error('Conflicting original route or an already earned preparation cannot be replaced');
 if(old&&!verify(s))throw Error('Earlier original route receipts are inconsistent');
 const {q,rec}=route(s,p.routeId,!old),minutes=p.minutes??90;
 if(s.world.minutes<q.openMinute||s.world.minutes+minutes>=q.closesMinute)
  throw Error('Actually witnessed route will not remain open throughout genuine preparation');
 const a=check(s,q,'prepare',minutes,18,4),
  t=old||{origin:SOURCE,routeId:q.routeId,routeSeal:rec.seal,
   preparation:null,active:null,attempts:[],
   witnessArchive:{[q.witnessHash]:{origin:ROUTE,seal:q.witnessHash,
    event:structuredClone(q.witness)}}};
 t.preparation=a;
 t.attempts.push({origin:SOURCE,source:a,seal:hash(a)});
 Realm.ensure(s).riftWalk=t;
 E.advance(s,minutes);W.finalizeTime(s,a.minute);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Original prepared real realm coordinates failed source verification');
 return {prepared:a.success,check:a.check,routeId:q.routeId,
  targetPlaneId:q.planeId,staminaSpent:4,minutes,
  noPassageYet:true,noPortalCreated:true};
}
function enter(s,p={}){
 if(!only(p,['routeId'])||!id(p.routeId))
  throw Error('Only the already measured and personally prepared route may be entered');
 entryScene(s);
 if(!verify(s))throw Error('Original selected-route record is inconsistent');
 const t=ledger(s),pre=t?.preparation;
 if(!pre?.success||t.routeId!==p.routeId||t.active)
  throw Error('A genuinely successful and independently witnessed route preparation is required');
 const {q}=route(s,p.routeId);
 if(s.world.minutes<q.openMinute||s.world.minutes+10>=q.closesMinute)
  throw Error('Previously observed selected portal opening is now closed');
 const a=check(s,q,'enter',10,19,5),
  receipt={origin:SOURCE,source:a,seal:hash(a)};
 t.attempts.push(receipt);
 if(a.success){
  t.active={routeId:q.routeId,planeId:q.planeId,
   arrivalCoordinate:q.arrivalCoordinate,mortalAnchor:'ruins',
   enteredMinute:a.minute+a.minutes,entrySeal:receipt.seal};
  s.world.planeId=q.planeId;
  if(s.player.rift.step===6)s.player.rift.step=7;
  s.player.rift.realmWalkingProof||={source:SOURCE,
   firstEntrySeal:receipt.seal,earnedMinute:a.minute+a.minutes,
   notUniversalPortal:true};
 }
 E.advance(s,10);W.finalizeTime(s,a.minute);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Actual selected-route realm entry failed source integrity');
 return {attempted:true,crossed:a.success,check:a.check,
  currentPlaneId:s.world.planeId||'mortal',
  originalMortalAnchor:'ruins',
  landingCoordinate:a.success?q.arrivalCoordinate:null,
  staminaSpent:5,minutes:10,
  returnNotGuaranteed:true,noVaultEntry:true,noUniversalTravel:true};
}
function returnToAnchor(s,p={}){
 if(!only(p,['routeId'])||!id(p.routeId))
  throw Error('Original selected return identity is required');
 if(!isInside(s)||!verify(s))
  throw Error('An actually entered and verified foreign plane is required');
 const t=ledger(s),a=t.active,{q}=route(s,p.routeId);
 if(a.routeId!==q.routeId||a.planeId!==q.planeId)
  throw Error('A guessed alternative plane or return coordinate cannot become a safe route');
 if(s.world.minutes+10>=q.closesMinute)
  throw Error('Original return opening is closed; new separately witnessed emergency route mechanics are needed');
 if(s.battle||s.encounter||s.table?.combatants?.player?.status!=='ok')
  throw Error('Foreign-realm injury or active conflict cannot be skipped by calling safe return');
 const result=check(s,q,'return',10,18,4),
  receipt={origin:SOURCE,source:result,seal:hash(result)};
 t.attempts.push(receipt);
 if(result.success){t.active=null;s.world.planeId='mortal';}
 E.advance(s,10);W.finalizeTime(s,result.minute);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('The original return did not preserve genuine realm position evidence');
 return {attempted:true,returned:result.success,check:result.check,
  currentPlaneId:s.world.planeId,
  lastMortalAnchor:s.world.location,staminaSpent:4,minutes:10,
  noUnverifiedPassage:true};
}
function status(s){
 if(!verify(s))throw Error('Original realm traversal source or position is inconsistent');
 const t=ledger(s),a=t?.active;
 return {earned:!!s.player?.rift?.realmWalkingProof,
  step:s.player?.rift?.step||0,prepared:!!t?.preparation?.success,
  inside:!!a,planeId:a?.planeId||'mortal',
  observedLanding:a?.arrivalCoordinate||null,
  returnRouteId:a?.routeId||null,
  lastMortalAnchor:a?.mortalAnchor||null,
  requiresRealReturn:true,noUniversalPortal:true,
  note:'Only an individually witnessed specific open route allows real foreign-plane presence; no other location or portal is inferred'};
}
module.exports={SOURCE,ROUTE,verify,status,prepare,enter,returnToAnchor,isInside};
