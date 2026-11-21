'use strict';
// Original selected Realm Walking VII for an independent person. The
// player's world.location / planeId are never used as this person's position.
// No route discovery, universal portals, forced movement or automatic return.
const E=require('../engine'),Core=require('./core'),Combat=require('./combat'),
 Health=require('./unified'),World=require('./world'),Walk=require('./rift-realm-walking'),
 Local=require('./independent-original-rift-local-spatial'),Exterior=require('./rift-shared-original-exterior-sense'),
 Law=require('./rift-shared-original-local-spatial-law'),Early=require('./independent-original-discipline-preparation'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Lives=require('../world/independent-person-lives'),Presence=require('../world/person-presence');
const ORIGIN='source-earned-independent-original-selected-realm-walk-v1',
 WITNESS='gm-witnessed-independent-selected-realm-walk-action-v1',
 hash=Exterior.digest,eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 int=(v,a=0,b=1000000000)=>Number.isInteger(v)&&v>=a&&v<=b,
 text=(v,n=25)=>typeof v==='string'&&v.trim().length>=n&&v.length<=900;
function prerequisite(s,p){
 const view=Local.privateStatus(s,p);
 if(view?.earnedStep!==6||!view.originalAdaptationSource)return null;
 const row=p.originalRiftLocalSpatial.sessions.find(x=>x.seal===view.originalAdaptationSource);
 return row?{seal:row.seal,minute:row.source.minute+row.source.actualMinutes}:null;
}
function duration(kind,minutes){return kind==='prepare'?int(minutes,45,240):minutes===10;}
function witnessValid(p,a,q){
 const w=a.witness,d=w?.details;
 return w?.type==='story'&&text(w.text,16)&&w.text.includes(p.name)&&
  w.day===a.day+1&&w.time===E.clock({world:{minutes:a.minute}})&&
  d?.origin===WITNESS&&d.actorId===p.actorId&&d.routeId===q.routeId&&
  d.kind===a.kind&&d.location==='ruins'&&d.planeId===q.planeId&&
  d.fromPlaneId===(a.kind==='return'?q.planeId:'mortal')&&
  d.entryCoordinate===q.entryCoordinate&&d.arrivalCoordinate===q.arrivalCoordinate&&
  d.returnCoordinate===q.returnCoordinate&&
  text(d.actualIndividualLegalPermission)&&text(d.observedIndividualProtections)&&
  text(d.measuredIndividualPosition)&&d.privateToGM===true&&
  d.noUniversalPortal===true&&d.noProtectedVaultEntry===true&&
  (a.kind!=='return'||text(d.independentlyObservedForeignReturnApproach));
}
const activeView=(q,minute)=>({routeId:q.routeId,planeId:q.planeId,
 arrivalCoordinate:q.arrivalCoordinate,mortalAnchor:'ruins',enteredMinute:minute});
function checkRecord(roll,sp){
 const margin=roll+sp.modifier+Core.naturalAdjustment(roll)-sp.dc;
 return {roll,modifier:sp.modifier,dc:sp.dc,margin,degree:Core.degree(margin),success:margin>=0};
}
// Conservative local scheduling read. It does not award VII or validate a
// route; the actual owner below must validate that before taking any action.
// A source envelope with inconsistent history fails closed rather than
// making an absent person available at a mortal site.
function intervals(p){
 const r=p?.originalRiftRealmJourney;
 if(r===undefined)return [];
 if(r.origin!==ORIGIN||!Array.isArray(r.rows)||!r.rows.length||r.rows.length>480)
  throw Error('Unverified independent realm location history');
 let open=null,last=0;const spans=[];
 for(const row of r.rows){
  const q=row?.source;
  if(!q||row.seal!==hash(q)||q.origin!==ORIGIN||q.actorId!==p.actorId||
   q.identityOriginHash!==p.originHash||!['prepare','enter','return'].includes(q.kind)||
   !int(q.minute,last)||!int(q.actualMinutes,5,240))throw Error('Unverified independent realm location receipt');
  last=q.minute+q.actualMinutes;
  if(!q.accepted||!q.check?.success)continue;
  if(q.kind==='enter'){
   if(open!==null)throw Error('Duplicate independent realm entry');
   open=last;
  }
  if(q.kind==='return'){
   if(open===null)throw Error('Independent realm return lacks entry');
   spans.push({from:open,until:last});open=null;
  }
 }
 if(open!==null)spans.push({from:open,until:null});
 return spans;
}
function awayAt(p,minute){
 return intervals(p).some(x=>x.from<=minute&&(x.until===null||minute<x.until));
}
function awayDuring(p,from,to){
 return intervals(p).some(x=>x.from<to&&(x.until===null||x.until>from));
}
function replay(s,p){
 const r=p?.originalRiftRealmJourney;if(r===undefined)return {first:null,active:null,prepared:null,end:0};
 const base=prerequisite(s,p),body=s.table?.combatants?.['npc_'+p?.id],w=Realm.peek(s);
 if(!base||!body?.npcOrigin?.seal||!People.verify(w,p)||
  r.origin!==ORIGIN||!Array.isArray(r.rows)||!r.rows.length||r.rows.length>480||
  r.adaptationSourceSeal!==base.seal)return null;
 let source;try{source=Walk.route(s,r.routeId,false,r.routeArchive)}catch{return null;}
 const {q,rec}=source;
 if(r.routeSeal!==rec.seal)return null;
 let prepared=null,active=null,first=null,last=base.minute;
 const used=new Set();
 for(const row of r.rows){
  const a=row?.source,sh=a?.shift;
  if(!a||row.seal!==hash(a)||a.origin!==ORIGIN||a.actorId!==p.actorId||
   a.identityOriginHash!==p.originHash||a.foundationSeal!==p.mechanicalFoundation.seal||
   a.combatSeal!==body.npcOrigin.seal||a.adaptationSourceSeal!==base.seal||
   a.routeId!==q.routeId||a.routeSeal!==rec.seal||
   !['prepare','enter','return'].includes(a.kind)||!int(a.minute,last,s.world.minutes)||
   a.day!==Math.floor(a.minute/1440)||!duration(a.kind,a.plannedMinutes)||
   a.minute<q.openMinute||a.minute+a.plannedMinutes>=q.closesMinute||
   a.site!=='ruins'||!witnessValid(p,a,q)||a.witnessHash!==hash(a.witness)||used.has(a.witnessHash)||
   a.pressure?.day!==a.day||a.pressure.worldSeed!==w.worldSeed||a.pressureHash!==hash(a.pressure)||
   a.riskAdjustment!==Law.pressureAdjust(a.pressure)||
   !eq(a.activeBefore,active)||a.preparedBefore!==(prepared?.seal??null)||
   !int(a.rngBefore,1,4294967295)||a.personality!==p.personality||!int(a.fatigue,0,100)||
   a.chance!==Early.chance({personality:a.personality,fatigue:a.fatigue})||
   !int(a.staminaBefore,1)||!int(a.maxBefore,a.staminaBefore)||a.maxAfter!==a.maxBefore||
   !eq(a.woundsBefore,[0,0,0])||a.noUniversalPortalOrPlayerTransport!==true)return null;
  if(a.kind==='return'){
   if(!active||sh!==null||a.minute<active.enteredMinute)return null;
  }else{
   if(active||!sh||sh.hash!==hash(Object.fromEntries(Object.entries(sh).filter(([k])=>k!=='hash')))||
    sh.actorId!==p.actorId||sh.originHash!==p.originHash||sh.location!==a.site||
    sh.fromDay>a.day||sh.throughDay<a.day||sh.throughDay-sh.fromDay!==5||sh.scheduledAtDay!==sh.fromDay||
    (a.kind==='prepare'?!!prepared:!prepared))return null;
  }
  const rng={rngState:a.rngBefore},sp=Law.walkSpec(a.kind,a.plannedMinutes,a.riskAdjustment,p.mechanicalFoundation.baselineAttributes.int,0);
  if(a.staminaBefore<sp.stamina||a.choice!==Core.die(rng,100)||a.accepted!==(a.choice<=a.chance))return null;
  const check=a.accepted?checkRecord(Core.die(rng,20),sp):null,
   spent=a.accepted?sp.stamina:0,wounded=check?.degree==='severe failure';
  if(!eq(a.check,check)||a.rngAfter!==rng.rngState||a.staminaSpent!==spent||
   a.staminaAfter!==a.staminaBefore-spent||!eq(a.woundsAfter,wounded?[1,0,0]:[0,0,0])||
   a.actualMinutes!==(a.accepted?a.plannedMinutes:5)||a.minute+a.actualMinutes>s.world.minutes)return null;
  last=a.minute+a.actualMinutes;
  if(check?.success){
   if(a.kind==='prepare')prepared=row;
   else if(a.kind==='enter'){active=activeView(q,last);first||=row.seal;}
   else active=null;
  }
  if(!eq(a.activeAfter,active))return null;
  used.add(a.witnessHash);
 }
 return {prepared:prepared?.seal??null,active,first,end:last,routeId:q.routeId};
}
function verify(s,p){try{return replay(s,p)!==null;}catch{return false;}}
function work(s,{actorId,routeId,witnessIndex,minutes,...extra}={},kind){
 if(Object.keys(extra).length||typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId)||
  !int(witnessIndex,0,s.log.length-1)||!duration(kind,minutes??(kind==='prepare'?90:10))||
  kind!=='prepare'&&minutes!==undefined)
  throw Error('Actual independent actor, registered selected route, fresh action witness and original duration only');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  body=s.table?.combatants?.['npc_'+p?.id],life=w?.independentPersonLives?.people?.[p?.id],
  minute=s.world.minutes,day=Math.floor(minute/1440),
  witness=structuredClone(s.log[witnessIndex]),site='ruins';
 if(!p||!People.verify(w,p)||!life||!Lives.verifyEntry(w,life)||
  p.status!=='active'||p.ageBand!=='adult, exact birthday not established'||
  body?.npcOrigin?.location!==site||!Health.currentNpcWoundCondition(s,actorId)||
  body.status!=='ok'||body.wounds.some(x=>x!==0)||s.battle||s.encounter||
  !s.chatRuntime?.scene?.includes(p.name))throw Error('Actual independent conscious uninjured original exterior human required');
 const base=prerequisite(s,p),old=p.originalRiftRealmJourney,
  state=base&&replay(s,p);
 if(!state)throw Error('Genuinely earned original Rift Adaptation VI and consistent realm history required');
 const present=kind==='return'?null:Presence.resolve(w,actorId,site,day,minute%1440),
  {rec,q}=Walk.route(s,routeId,!old,old?.routeArchive??null),
  plannedMinutes=minutes??(kind==='prepare'?90:10);
 if(old&&old.routeId!==routeId||minute<base.minute||minute<state.end||
  minute<q.openMinute||minute+plannedMinutes>=q.closesMinute||
  (kind==='return'?(!state.active||state.active.planeId!==q.planeId):
   (state.active||s.world.location!==site||!present?.presence||
    (kind==='prepare'?!!state.prepared:!state.prepared))))
  throw Error('Actual selected preparation, present position and still open measured return route required');
 const r=old||{origin:ORIGIN,routeId,routeSeal:rec.seal,adaptationSourceSeal:base.seal,
  routeArchive:{[q.witnessHash]:{origin:Walk.ROUTE,seal:q.witnessHash,event:structuredClone(q.witness)}},rows:[]},
  pressure=Exterior.snapshot(w,day),riskAdjustment=Law.pressureAdjust(pressure),
  a={origin:ORIGIN,kind,actorId,identityOriginHash:p.originHash,foundationSeal:p.mechanicalFoundation.seal,
   combatSeal:body.npcOrigin.seal,adaptationSourceSeal:base.seal,routeId,routeSeal:rec.seal,
   site,day,minute,witness,witnessHash:hash(witness),shift:present?structuredClone(present.presence):null,
   pressure,pressureHash:hash(pressure),riskAdjustment,plannedMinutes,
   activeBefore:state.active,preparedBefore:state.prepared,noUniversalPortalOrPlayerTransport:true};
 if(r.rows.length>=480||r.rows.some(x=>x.source.witnessHash===a.witnessHash)||
  !witnessValid(p,a,q))throw Error('Fresh private independently witnessed actual individual geometry, rights and matching route required');
 const sp=Law.walkSpec(kind,plannedMinutes,riskAdjustment,p.mechanicalFoundation.baselineAttributes.int,0);
 if(body.stamina<sp.stamina)throw Error('Actual physical Stamina required for original individual realm action');
 const rngBefore=p.rngState,chance=Early.chance(p),choice=Core.die(p,100),accepted=choice<=chance,
  staminaBefore=body.stamina,maxBefore=body.maxStamina,woundsBefore=[...body.wounds];
 let check=null,spent=0,activeAfter=state.active;
 if(accepted){
  const roll=Core.check(s,{modifier:sp.modifier,dc:sp.dc,independentRngOwner:p,privateDisplay:true,label:p.name+' original selected realm '+kind});
  check=checkRecord(roll.roll,sp);spent=sp.stamina;body.stamina-=spent;
  if(check.degree==='severe failure')Combat.harm(s,body,2);
  if(check.success&&kind==='enter')activeAfter=activeView(q,minute+plannedMinutes);
  if(check.success&&kind==='return')activeAfter=null;
 }
 Object.assign(a,{rngBefore,rngAfter:p.rngState,personality:p.personality,fatigue:p.fatigue,chance,choice,accepted,check,
  actualMinutes:accepted?plannedMinutes:5,staminaBefore,staminaSpent:spent,staminaAfter:body.stamina,
  maxBefore,maxAfter:body.maxStamina,woundsBefore,woundsAfter:[...body.wounds],activeAfter});
 r.rows.push({source:a,seal:hash(a)});p.originalRiftRealmJourney=r;
 E.advance(s,a.actualMinutes);World.finalizeTime(s,minute);
 if(!verify(s,p))throw Error('Original independent realm action failed replay');
 return {actorId,privateToGM:true,independentlyAccepted:accepted,success:!!check?.success,
  elapsedMinutes:a.actualMinutes,noUniversalPortalOrPlayerTransport:true};
}
function privateStatus(s,p){
 if(!p?.originalRiftRealmJourney)return null;
 const state=replay(s,p);if(!state)throw Error('Original independent realm journey altered');
 return {privateToGM:true,earnedStep:state.first?7:6,originalFirstEntrySeal:state.first,
  prepared:!!state.prepared,active:state.active,planeId:state.active?.planeId??'mortal',
  returnNotGuaranteed:true,noUniversalPortal:true};
}
module.exports={ORIGIN,WITNESS,verify,awayAt,awayDuring,privateStatus,
 prepare:(s,p)=>work(s,p,'prepare'),enter:(s,p)=>work(s,p,'enter'),returnToAnchor:(s,p)=>work(s,p,'return')};
