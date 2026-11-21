'use strict';
// Original independent spatial movement and bounded local weaving.
// Only a genuine original personal exterior Anchor II can supply the
// coordinate reference. No vault access, long-range travel or opened rift.
const E=require('../engine'),Core=require('./core'),Combat=require('./combat'),
 Health=require('./unified'),World=require('./world'),
 Anchor=require('./independent-original-rift-exterior-anchor-two'),
 Fold=require('./rift-fold-step'),Weave=require('./rift-boundary-weaving'),
 Exterior=require('./rift-shared-original-exterior-sense'),
 Law=require('./rift-shared-original-local-spatial-law'),
 Early=require('./independent-original-discipline-preparation'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Lives=require('../world/independent-person-lives'),Presence=require('../world/person-presence'),
 Cosmos=require('../world/cosmology-ledger');
const Pocket=require('./rift-pocket-architecture'),Adapt=require('./rift-adaptation'),Custody=require('./independent-material-custody');
const ORIGIN='source-earned-independent-original-local-spatial-action-v1',
 hash=Exterior.digest,eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 int=(v,a=0,b=1000000000)=>Number.isInteger(v)&&v>=a&&v<=b;
function proof(s,p){
 const r=p?.originalRiftExteriorAnchor;
 if(!r?.completed||!Anchor.verify(s,p)||r.anchor?.location!=='ruins')return null;
 const win=r.attempts.find(x=>x.source.completedAfter);
 return win?{seal:win.seal,anchorHash:hash(r.anchor),
  endMinute:win.source.startMinute+win.source.actualMinutes}:null;
}
function boundary(s){
 const c=Cosmos.peek(s)||Cosmos.seed(),b=c.boundaries?.riftglass_wardline;
 return !!b&&b.siteId==='riftglass_vault'&&b.visibility==='public'&&
  b.noProvenPassage===true&&Cosmos.validate(c,s);
}
function witnessValid(s,p,q){
 const w=q.witness;
 if(w?.details?.actorId!==p.actorId||!w.text?.includes(p.name)||
  w.day!==q.day+1||w.time!==E.clock({world:{minutes:q.minute}}))return false;
 // Original player owners validate the exact same physical measurement
 // fields; the read-only historical view supplies only that saved event.
 try{
  const view={...s,world:{...s.world,location:'ruins'},log:[w]};
  return eq(q.kind==='fold'?Fold.evidence(view,0):q.kind==='weave'?Weave.observed(view,0):
   q.kind==='pocket'?Pocket.witness(view,0):Adapt.witness(view,0),w);
 }catch{return false;}
}
function blank(base){return {step:2,position:null,foldStrain:0,weaveStrain:0,
 firstFold:null,firstWeave:null,weaves:[],end:base.endMinute,
 pocketStrain:0,adaptationStrain:0,adaptationProgress:0,attemptedPockets:[],pockets:[],firstPocket:null,firstAdaptation:null};}
function activeWeave(state,segment,minute){
 return state.weaves.filter(x=>x.segmentId===segment&&x.activeFrom<=minute&&minute<x.activeUntil).at(-1)||null;
}
function mode(p,state,q){
 const d=q.witness.details,risk=Law.pressureAdjust(q.pressure),
  attribute=p.mechanicalFoundation.baselineAttributes.int;
 if(q.kind==='fold'){
  const patch=activeWeave(state,d.segmentId,q.minute);
  const mitigation=patch?.mode==='reinforce'?1:0;
  return {...Law.foldSpec(d.measuredDistanceMetres,state.foldStrain,risk,attribute,0,mitigation,0),
   supportSeal:mitigation?patch.sourceSeal:null,mitigation};
 }
 if(q.kind==='pocket'){
  const patch=activeWeave(state,d.segmentId,q.minute);
  return {...Law.pocketSpec(d.capacityUnits,q.plannedMinutes,state.pocketStrain,risk,attribute,0),supportSeal:patch?.sourceSeal??null,mitigation:0};
 }
 if(q.kind==='adaptation')return {...Law.adaptationSpec(state.adaptationProgress,q.plannedMinutes,state.adaptationStrain,risk,p.mechanicalFoundation.baselineAttributes.con,0),supportSeal:null,mitigation:0};
 return {...Law.weaveSpec(d.areaSquareMetres,q.plannedMinutes,state.weaveStrain,risk,attribute,0),
  supportSeal:null,mitigation:0};
}
function eligible(state,q){
 const d=q.witness.details;
 if(q.kind==='fold')return state.foldStrain<30&&
  (state.position===null||state.position===d.fromObservedPosition);
 if(q.kind==='pocket'){
  const patch=activeWeave(state,d.segmentId,q.minute);
  return state.step>=4&&state.pocketStrain<30&&!state.attemptedPockets.includes(d.pocketId)&&
   patch?.mode==='reinforce'&&patch.activeUntil>=q.minute+q.plannedMinutes;
 }
 if(q.kind==='adaptation')return state.step>=5&&state.adaptationStrain<24;
 return state.step>=3&&state.weaveStrain<30&&!activeWeave(state,d.segmentId,q.minute);
}
function checkRecord(roll,sp){
 const margin=roll+sp.modifier+Core.naturalAdjustment(roll)-sp.dc;
 return {roll,modifier:sp.modifier,dc:sp.dc,margin,degree:Core.degree(margin),success:margin>=0};
}
function snapshot(state){
 return {step:state.step,position:state.position,foldStrain:state.foldStrain,weaveStrain:state.weaveStrain};
}
const advancedKind=k=>k==='pocket'||k==='adaptation';
const validDuration=(k,m)=>k==='fold'?m===5:k==='weave'?int(m,45,240):k==='pocket'?int(m,180,480):k==='adaptation'&&int(m,45,180);
function advancedSnapshot(state){return {pocketStrain:state.pocketStrain,adaptationStrain:state.adaptationStrain,
 adaptationProgress:state.adaptationProgress,attemptedPockets:[...state.attemptedPockets],
 pockets:state.pockets.map(({sourceSeal,...p})=>p)};}
function apply(state,q,check,seal){
 if(!q.accepted)return false;
 const d=q.witness.details,added=q.kind==='pocket'?Law.pocketStrainAdded(check):Law.strainAdded(check);
 if(q.kind==='fold'){
  state.position=check.success?d.toObservedPosition:d.fromObservedPosition;
  state.foldStrain=Math.min(100,state.foldStrain+added);
  if(check.success&&state.step===2){state.step=3;state.firstFold=seal;}
 }else if(q.kind==='pocket'){
  state.pocketStrain=Math.min(100,state.pocketStrain+added);state.attemptedPockets.push(d.pocketId);
  if(check.success){
   if(state.step===4){state.step=5;state.firstPocket=seal;}
   state.pockets.push({sourceSeal:seal,pocketId:d.pocketId,segmentId:d.segmentId,
    capacity:d.capacityUnits,opened:q.minute+q.plannedMinutes,expiresAt:q.minute+q.plannedMinutes+d.lifetimeHours*60});
  }
 }else if(q.kind==='adaptation'){
  state.adaptationStrain=Math.min(100,state.adaptationStrain+added);
  state.adaptationProgress=Math.min(2,state.adaptationProgress+(check.success?1:0));
  if(state.adaptationProgress===2&&state.step===5){state.step=6;state.firstAdaptation=seal;}
 }else{
  state.weaveStrain=Math.min(100,state.weaveStrain+added);
  if(check.success){
   if(state.step===3){state.step=4;state.firstWeave=seal;}
   state.weaves.push({sourceSeal:seal,segmentId:d.segmentId,mode:d.mode,
    area:d.areaSquareMetres,activeFrom:q.minute+q.plannedMinutes,
    activeUntil:q.minute+q.plannedMinutes+d.supportMinutes});
  }
 }
 return added>0;
}
function replay(s,p,base){
 const l=p?.originalRiftLocalSpatial,body=s.table?.combatants?.['npc_'+p?.id],
  w=Realm.peek(s);
 if(!base||!int(base.endMinute)||!body?.npcOrigin?.seal||!boundary(s))return null;
 const state=blank(base);
 if(l===undefined)return state;
 if(l?.origin!==ORIGIN||l.anchorSeal!==base.seal||l.anchorHash!==base.anchorHash||
  !Array.isArray(l.sessions)||!l.sessions.length||l.sessions.length>480)return null;
 const used=new Set();
 for(const row of l.sessions){
  const q=row?.source,sh=q?.shift;
  if(!q||row.seal!==hash(q)||q.origin!==ORIGIN||q.actorId!==p.actorId||
   q.identityOriginHash!==p.originHash||q.foundationSeal!==p.mechanicalFoundation.seal||
   q.combatSeal!==body.npcOrigin.seal||q.anchorSeal!==base.seal||q.anchorHash!==base.anchorHash||
   !['fold','weave','pocket','adaptation'].includes(q.kind)||q.site!=='ruins'||
   !int(q.minute,state.end,s.world.minutes)||q.day!==Math.floor(q.minute/1440)||
   !sh||sh.hash!==hash(Object.fromEntries(Object.entries(sh).filter(([k])=>k!=='hash')))||
   sh.actorId!==p.actorId||sh.originHash!==p.originHash||sh.location!==q.site||
   sh.fromDay>q.day||sh.throughDay<q.day||sh.throughDay-sh.fromDay!==5||sh.scheduledAtDay!==sh.fromDay||
   !witnessValid(s,p,q)||q.witnessHash!==hash(q.witness)||used.has(q.witnessHash)||
   q.pressure?.day!==q.day||q.pressure.worldSeed!==w.worldSeed||
   q.pressureHash!==hash(q.pressure)||q.pressureIdentity!==Law.pressureIdentity(q.pressure)||
   !eligible(state,q)||!eq(q.before,snapshot(state))||
   !validDuration(q.kind,q.plannedMinutes)||
   (advancedKind(q.kind)&&!eq(q.advancedBefore,advancedSnapshot(state)))||
   !int(q.rngBefore,1,4294967295)||q.personality!==p.personality||!int(q.fatigue,0,100)||
   q.chance!==Early.chance({personality:q.personality,fatigue:q.fatigue})||
   !int(q.staminaBefore,1)||!int(q.maxBefore,q.staminaBefore)||!eq(q.woundsBefore,[0,0,0])||
   q.noRealmTransitGlobalSealOrPortal!==true)return null;
  const rng={rngState:q.rngBefore},sp=mode(p,state,q);
  if(q.choice!==Core.die(rng,100)||q.accepted!==(q.choice<=q.chance)||
   q.riskAdjustment!==Law.pressureAdjust(q.pressure)||q.supportSeal!==sp.supportSeal||
   q.mitigation!==sp.mitigation||q.staminaBefore<sp.stamina)return null;
  const check=q.accepted?checkRecord(Core.die(rng,20),sp):null,
   spent=q.accepted?sp.stamina:0,injury=apply(state,q,check,row.seal);
  if(q.kind==='pocket'&&(q.accepted?!Custody.debitProof(s,p,q.materialDebitSeal,q.witness.details.materials,'rift-pocket-build',q.witnessHash,q.minute):q.materialDebitSeal!==null))return null;
  if(advancedKind(q.kind)&&!eq(q.advancedAfter,advancedSnapshot(state)))return null;
  if(!eq(q.check,check)||q.rngAfter!==rng.rngState||q.staminaSpent!==spent||
   q.staminaAfter!==q.staminaBefore-spent||q.maxAfter!==q.maxBefore||
   !eq(q.woundsAfter,injury?[1,0,0]:[0,0,0])||!eq(q.after,snapshot(state))||
   q.actualMinutes!==(q.accepted?q.plannedMinutes:5)||
   q.minute+q.actualMinutes>s.world.minutes)return null;
  if(p.originalRiftRealmJourney&&require('./independent-original-rift-realm-walking').awayDuring(p,q.minute,q.minute+q.actualMinutes))return null;
  state.end=q.minute+q.actualMinutes;used.add(q.witnessHash);
 }
 if(!verifyTransfers(s,p,l,state,body))return null;
 return state;
}
function transferWitness(s,p,q,space){
 const w=q.witness,d=w?.details;
 return w?.type==='story'&&typeof w.text==='string'&&w.text.includes(p.name)&&
  w.day===q.day+1&&w.time===E.clock({world:{minutes:q.minute}})&&
  d?.origin===Custody.POCKET_TRANSFER&&d.actorId===p.actorId&&d.location==='ruins'&&
  d.pocketId===space.pocketId&&['store','retrieve'].includes(d.direction)&&
  Object.hasOwn(E.RESOURCES,d.item)&&int(d.units,1,8)&&
  q.minute>=space.opened&&q.minute+5<=space.expiresAt&&q.pocketSeal===space.sourceSeal;
}
function verifyTransfers(s,p,l,state,body){
 const rows=l.transfers===undefined?[]:l.transfers;
 if(!Array.isArray(rows)||rows.length>480)return false;
 const used=new Set(l.sessions.map(x=>x.source.witnessHash)),movements=new Set();
 let last=0;
 for(const row of rows){
  const q=row?.source,sh=q?.shift,space=state.pockets.find(x=>x.sourceSeal===q?.pocketSeal);
  if(!q||row.seal!==hash(q)||q.origin!==ORIGIN||q.kind!=='pocket-transfer'||
   q.actorId!==p.actorId||q.identityOriginHash!==p.originHash||q.combatSeal!==body.npcOrigin.seal||
   q.site!=='ruins'||!int(q.minute,last,s.world.minutes-5)||q.day!==Math.floor(q.minute/1440)||
   l.sessions.some(x=>x.source.minute<q.minute+5&&x.source.minute+x.source.actualMinutes>q.minute)||
   !sh||sh.hash!==hash(Object.fromEntries(Object.entries(sh).filter(([k])=>k!=='hash')))||
   sh.actorId!==p.actorId||sh.originHash!==p.originHash||sh.location!==q.site||
   sh.fromDay>q.day||sh.throughDay<q.day||sh.throughDay-sh.fromDay!==5||sh.scheduledAtDay!==sh.fromDay||
   !space||!transferWitness(s,p,q,space)||q.witnessHash!==hash(q.witness)||used.has(q.witnessHash)||
   !int(q.rngBefore,1,4294967295)||q.personality!==p.personality||!int(q.fatigue,0,100)||
   q.chance!==Early.chance({personality:q.personality,fatigue:q.fatigue})||
   !int(q.staminaBefore,1)||!int(q.maxBefore,q.staminaBefore)||q.maxAfter!==q.maxBefore||
   !eq(q.woundsBefore,[0,0,0])||!eq(q.woundsAfter,q.woundsBefore)||q.noItemCreationOrRealmTransit!==true)return false;
  const rng={rngState:q.rngBefore};
  if(q.choice!==Core.die(rng,100)||q.accepted!==(q.choice<=q.chance)||q.rngAfter!==rng.rngState||
   q.staminaSpent!==(q.accepted?1:0)||q.staminaAfter!==q.staminaBefore-q.staminaSpent)return false;
  if(q.accepted){
   if(movements.has(q.custodySeal)||!Custody.pocketTransferProof(s,p,q.custodySeal,q.pocketSeal,q.witnessHash,q.minute))return false;
   movements.add(q.custodySeal);
  }else if(q.custodySeal!==null)return false;
  if(p.originalRiftRealmJourney&&require('./independent-original-rift-realm-walking').awayDuring(p,q.minute,q.minute+5))return false;
  used.add(q.witnessHash);last=q.minute+5;
 }
 if((p.originalMaterialCustody?.rows||[]).some(x=>x.source.kind==='pocket-transfer'&&!movements.has(x.seal)))return false;
 state.end=Math.max(state.end,last);
 return true;
}
function transfer(s,{actorId,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId)||
  !int(witnessIndex,0,s.log.length-1))throw Error('Only an actual actor and fresh original pocket material movement witness required');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  body=s.table?.combatants?.['npc_'+p?.id],life=w?.independentPersonLives?.people?.[p?.id],
  minute=s.world.minutes,day=Math.floor(minute/1440),site=s.world.location,
  present=p&&Presence.resolve(w,actorId,site,day,minute%1440),
  witness=structuredClone(s.log[witnessIndex]),d=witness?.details;
 if(!p||!People.verify(w,p)||!life||!Lives.verifyEntry(w,life)||
  p.status!=='active'||p.ageBand!=='adult, exact birthday not established'||
  !present?.presence||site!=='ruins'||body?.npcOrigin?.location!==site||s.battle||s.encounter||
  !Health.currentNpcWoundCondition(s,actorId)||body.status!=='ok'||body.wounds.some(x=>x!==0)||
  !s.chatRuntime?.scene?.includes(p.name)||body.stamina<1)
  throw Error('Actual present independent uninjured original spatial practitioner required');
 const base=proof(s,p),state=base&&replay(s,p,base),l=p.originalRiftLocalSpatial,
  space=state?.pockets.find(x=>x.pocketId===d?.pocketId);
 if(!state||!space||minute<state.end||state.step<5)
  throw Error('Actual personally constructed original Pocket V required');
 const q={origin:ORIGIN,kind:'pocket-transfer',actorId,identityOriginHash:p.originHash,
  combatSeal:body.npcOrigin.seal,site,minute,day,shift:structuredClone(present.presence),
  witness,witnessHash:hash(witness),pocketSeal:space.sourceSeal,noItemCreationOrRealmTransit:true};
 const rows=l.transfers||[];
 if(rows.length>=480||[...rows,...l.sessions].some(x=>x.source.witnessHash===q.witnessHash)||
  !transferWitness(s,p,q,space)||!Custody.canMovePocket(s,p,space,d))
  throw Error('Actual accessible original pocket, held or stored material and fresh movement witness required');
 const rngBefore=p.rngState,chance=Early.chance(p),choice=Core.die(p,100),accepted=choice<=chance,
  staminaBefore=body.stamina,maxBefore=body.maxStamina,woundsBefore=[...body.wounds];
 let custodySeal=null;
 if(accepted){custodySeal=Custody.movePocket(s,p,space,witness);body.stamina--;}
 Object.assign(q,{rngBefore,rngAfter:p.rngState,personality:p.personality,fatigue:p.fatigue,
  chance,choice,accepted,staminaBefore,staminaSpent:accepted?1:0,staminaAfter:body.stamina,
  maxBefore,maxAfter:body.maxStamina,woundsBefore,woundsAfter:[...body.wounds],custodySeal});
 rows.push({source:q,seal:hash(q)});l.transfers=rows;
 E.advance(s,5);World.finalizeTime(s,minute);
 if(!verify(s,p))throw Error('Original independent pocket transfer and material receipts failed replay');
 return {actorId,independentlyAccepted:accepted,transferred:accepted,elapsedMinutes:5,
  noItemCreationOrRealmTransit:true};
}
function verify(s,p){
 if(p?.originalRiftLocalSpatial===undefined)return true;
 try{return replay(s,p,proof(s,p))!==null;}catch{return false;}
}
function work(s,{actorId,witnessIndex,minutes,...extra}={},kind){
 if(Object.keys(extra).length||typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId)||
  !int(witnessIndex,0,s.log.length-1)||!['fold','weave','pocket','adaptation'].includes(kind)||
  (kind==='fold'?minutes!==undefined:!validDuration(kind,minutes??(kind==='pocket'?180:60))))
  throw Error('Original independent measured local geometry, actor and witness only');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],
  body=s.table?.combatants?.['npc_'+p?.id],life=w?.independentPersonLives?.people?.[p?.id],
  minute=s.world.minutes,day=Math.floor(minute/1440),site=s.world.location,
  present=p&&Presence.resolve(w,actorId,site,day,minute%1440),
  witness=structuredClone(s.log[witnessIndex]);
 if(!p||!People.verify(w,p)||!life||!Lives.verifyEntry(w,life)||
  p.status!=='active'||p.ageBand!=='adult, exact birthday not established'||
  !present?.presence||site!=='ruins'||body?.npcOrigin?.location!==site||
  s.battle||s.encounter||!Health.currentNpcWoundCondition(s,actorId)||
  body.status!=='ok'||body.wounds.some(x=>x!==0)||!s.chatRuntime?.scene?.includes(p.name))
  throw Error('Actual present uninjured independent exterior Rift practitioner required');
 const base=proof(s,p),state=base&&replay(s,p,base);
 if(!state)throw Error('Genuinely earned and source-verified original personal exterior Anchor II required');
 const l=p.originalRiftLocalSpatial||{origin:ORIGIN,anchorSeal:base.seal,anchorHash:base.anchorHash,sessions:[]},
  pressure=Exterior.snapshot(w,day),plannedMinutes=kind==='fold'?5:minutes??(kind==='pocket'?180:60),
  q={origin:ORIGIN,kind,actorId,identityOriginHash:p.originHash,foundationSeal:p.mechanicalFoundation.seal,
   combatSeal:body.npcOrigin.seal,anchorSeal:base.seal,anchorHash:base.anchorHash,
   site,minute,day,shift:structuredClone(present.presence),witness,witnessHash:hash(witness),
   pressure,pressureHash:hash(pressure),pressureIdentity:Law.pressureIdentity(pressure),
   riskAdjustment:Law.pressureAdjust(pressure),plannedMinutes,before:snapshot(state),
   ...(advancedKind(kind)?{advancedBefore:advancedSnapshot(state)}:{}),
   noRealmTransitGlobalSealOrPortal:true};
 if(!witnessValid(s,p,q)||!eligible(state,q)||l.sessions.length>=480||
  l.sessions.some(x=>x.source.witnessHash===q.witnessHash)||minute<state.end)
  throw Error('Fresh bounded local geometry, exact previous personal position and valid original spatial prerequisite required');
 const sp=mode(p,state,q);
 if(body.stamina<sp.stamina)throw Error('Real original Combat Stamina required for spatial action');
 if(kind==='pocket'&&!Custody.canConsume(s,p,witness.details.materials))throw Error('Actually held compatible physical pocket construction materials required');
 const rngBefore=p.rngState,chance=Early.chance(p),choice=Core.die(p,100),accepted=choice<=chance,
  staminaBefore=body.stamina,maxBefore=body.maxStamina,woundsBefore=[...body.wounds];
 let check=null,spent=0,materialDebitSeal=null;
 if(accepted){
  if(kind==='pocket')materialDebitSeal=Custody.consume(s,p,witness.details.materials,'rift-pocket-build',witness);
  const roll=Core.check(s,{modifier:sp.modifier,dc:sp.dc,independentRngOwner:p,privateDisplay:true,
   label:p.name+' original local Rift '+kind});
  check=checkRecord(roll.roll,sp);spent=sp.stamina;body.stamina-=spent;
  if(apply(state,{...q,accepted},check,null))Combat.harm(s,body,2);
 }
 Object.assign(q,{rngBefore,rngAfter:p.rngState,personality:p.personality,fatigue:p.fatigue,chance,choice,
  accepted,check,actualMinutes:accepted?plannedMinutes:5,supportSeal:sp.supportSeal,mitigation:sp.mitigation,
  staminaBefore,staminaSpent:spent,staminaAfter:body.stamina,maxBefore,maxAfter:body.maxStamina,
  woundsBefore,woundsAfter:[...body.wounds],after:snapshot(state),
  ...(kind==='pocket'?{materialDebitSeal}:{}),...(advancedKind(kind)?{advancedAfter:advancedSnapshot(state)}:{})});
 l.sessions.push({source:q,seal:hash(q)});p.originalRiftLocalSpatial=l;
 E.advance(s,q.actualMinutes);World.finalizeTime(s,minute);
 if(!verify(s,p))throw Error('Original independent local spatial action failed source replay');
 return {actorId,independentlyAccepted:accepted,success:!!check?.success,
  elapsedMinutes:q.actualMinutes,noRealmTransitGlobalSealOrPortal:true};
}
function privateStatus(s,p){
 if(!p?.originalRiftLocalSpatial)return null;
 const state=replay(s,p,proof(s,p));if(!state)throw Error('Original independent spatial source altered');
 return {privateToGM:true,earnedStep:state.step,localPosition:state.position,
  originalFoldSource:state.firstFold,originalWeaveSource:state.firstWeave,
  foldStrain:state.foldStrain,weaveStrain:state.weaveStrain,
  activeWeaves:state.weaves.filter(x=>x.activeFrom<=s.world.minutes&&s.world.minutes<x.activeUntil),
  ...(state.pockets.length?{constructedPockets:state.pockets.map(x=>({...x,active:x.opened<=s.world.minutes&&s.world.minutes<x.expiresAt,contents:Custody.pocketContents(s,p,x.pocketId),expiredContentsInaccessible:s.world.minutes>=x.expiresAt})),originalPocketSource:state.firstPocket}:{}),
  ...(state.step>=5?{originalAdaptationSource:state.firstAdaptation,observedSpatialPressureExposures:state.adaptationProgress,originalLocalPressureTolerance:state.adaptationProgress===2?1:0,otherRealmImmunity:false}:{}),
  noRealmTransitGlobalSealOrPortal:true};
}
module.exports={ORIGIN,verify,privateStatus,transfer,fold:(s,p)=>work(s,p,'fold'),weave:(s,p)=>work(s,p,'weave'),
 pocket:(s,p)=>work(s,p,'pocket'),adaptation:(s,p)=>work(s,p,'adaptation')};
