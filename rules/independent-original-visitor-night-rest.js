'use strict';
// Reuse the ORIGINAL individual human Combat eight-hour night, not a new
// healing, shelter, money, energy, or default NPC sleep law. A verified
// terrestrial visitor must be actually observed at a safe room and decide
// personally; the sapient travelling companion retains independent welfare.
const Crypto=require('node:crypto'),E=require('../engine'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Visit=require('./independent-sapient-terrestrial-journey'),
 Presence=require('../world/person-presence'),
 Health=require('./unified'),LivedPlaces=require('../world/lived-places');
const ORIGIN='original-source-witnessed-independent-visitor-eight-hour-night-v1',
 WITNESS='gm-witnessed-independent-original-visitor-safe-sleep-room-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 int=(n,min=0,max=1000000000)=>Number.isInteger(n)&&n>=min&&n<=max,
 prose=(x,min=30)=>typeof x==='string'&&x.trim().length>=min&&x.length<=900;
// A read-only ORIGINAL signed visitor and Combat-body gate. No actor can
// pick a destination or confer an inn. The safe room is a distinct later
// observed GM fact, not inferred from 'settlement' or from arrival itself.
function context(s,actorId,minute=s.world.minutes){
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId?.slice(9)],
  pos=p&&Visit.position(p,minute),site=pos?.arrived?pos.location:null,
  siteDef=site&&LivedPlaces.location(s,site),
  resident=site&&p&&Presence.resolve(w,actorId,site,
   Math.floor(minute/1440),minute%1440)?.presence,
  signed=site&&p&&Visit.visitorPresence(p,minute,site),
  body=s.table?.combatants?.['npc_'+p?.id];
 if(!p||p.actorId!==actorId||!People.verify(w,p)||
  !Visit.verify(s,p)||p.status!=='active'||
  p.ageBand!=='adult, exact birthday not established'||
  !pos?.arrived||!['crossing','academy'].includes(site)||
  siteDef?.biome!=='settlement'||!resident||!signed||
  !eq(resident,signed)||resident.source!==Visit.VISITOR||
  resident.arrivedBy!==pos.sourceHash||
  body?.npcOrigin?.actorId!==actorId||body.status!=='ok')
  return null;
 return {p,site,pos,presence:signed,body};
}
function witnessedRoom(s,p,site,pos,presence,wit,minute){
 const d=wit?.details;
 return wit?.type==='story'&&prose(wit.text)&&
  wit.text.includes(p.name)&&
  wit.day===Math.floor(minute/1440)+1&&
  wit.time===E.clock({world:{minutes:minute}})&&
  d?.origin===WITNESS&&d.actorId===p.actorId&&
  d.personOriginHash===p.originHash&&d.site===site&&
  d.minute===minute&&d.originalArrivalSeal===pos.sourceHash&&
  d.originalVisitorPresenceHash===presence.hash&&
  prose(d.directlyWitnessedRoomAndSafeAccess)&&
  prose(d.noAssumedPaymentOrPermission)&&
  d.notAGuaranteedInnOrFreeSupplies===true&&
  d.noForcedHumanRestOrBeastRest===true;
}
function verify(s,p){
 const rows=p?.originalVisitorNightRestReceipts;
 if(rows===undefined)return true;
 if(!Array.isArray(rows)||rows.length>90||
  !Visit.structure(p)||!Health.verifyNpcNightHistory(s,p.actorId))return false;
 let last=-1;const witnessSet=new Set(),nightSet=new Set();
 for(const row of rows){
  const q=row?.source,
   original=p.originalOvernightRestDecisions?.find(x=>
    x.sourceHash===q?.originalHumanNightSourceHash),
   pos=Visit.position(p,q?.startMinute),
   pres=Visit.visitorPresence(p,q?.startMinute,q?.site),
   event=s.log?.[q?.witnessIndex];
  if(!q||row.seal!==hash(q)||q.origin!==ORIGIN||
   q.actorId!==p.actorId||q.humanOriginHash!==p.originHash||
   !int(q.startMinute,last+1,s.world.minutes)||
   !int(q.endMinute,q.startMinute,s.world.minutes)||
   q.startMinute%1440<16*60||q.startMinute%1440>17*60+30||
   !pos?.arrived||!['crossing','academy'].includes(q.site)||
   pos.location!==q.site||pos.sourceHash!==q.originalArrivalSeal||
   !pres||pres.hash!==q.originalVisitorPresenceHash||
   !int(q.witnessIndex,0,(s.log?.length||0)-1)||
   hash(event)!==q.witnessHash||
   !witnessedRoom(s,p,q.site,pos,pres,event,q.startMinute)||
   !original||original.source?.actorId!==p.actorId||
   original.source?.startMinute!==q.startMinute||
   original.source?.location!==q.site||
   original.source?.sourceShiftHash!==q.originalVisitorPresenceHash||
   original.source?.sceneWitnessHash!==hash(event.text)||
   original.source?.originalCombatEntrySeal!==q.originalCombatEntrySeal||
   original.result?.endedMinute!==q.endMinute||
   q.accepted!==original.source.accepted||
   original.result?.accepted!==q.accepted||
   q.endMinute!==q.startMinute+(q.accepted?480:5)||
   q.originalCombatEntrySeal!==
    s.table?.combatants?.['npc_'+p.id]?.npcOrigin?.seal||
   q.noAdditionalHumanOrBeastNightOrMedicalTreatment!==true||
   witnessSet.has(q.witnessHash)||nightSet.has(q.originalHumanNightSourceHash))
   return false;
  last=q.startMinute;witnessSet.add(q.witnessHash);
  nightSet.add(q.originalHumanNightSourceHash);
 }
 return true;
}
// Called only from the original Unified nightly owner, once the original
// result exists and before inherited Meridian Qi recovery is considered.
function record(s,p,night,originalVisitor){
 const {site,arrivalSeal,presenceHash,witnessIndex}=originalVisitor,
  event=s.log?.[witnessIndex],minute=night?.source?.startMinute,
  pos=Visit.position(p,minute),signed=Visit.visitorPresence(p,minute,site);
 if(!event||!pos?.arrived||pos.location!==site||
  pos.sourceHash!==arrivalSeal||signed?.hash!==presenceHash||
  !witnessedRoom(s,p,site,pos,signed,event,minute)||
  night.source.sourceShiftHash!==presenceHash||
  night.source.sceneWitnessHash!==hash(event.text))
  throw Error('Original person sleep cannot inherit a fabricated visitor room');
 const q={origin:ORIGIN,actorId:p.actorId,humanOriginHash:p.originHash,
  site,startMinute:minute,endMinute:night.result.endedMinute,
  originalArrivalSeal:arrivalSeal,originalVisitorPresenceHash:presenceHash,
  witnessIndex,witnessHash:hash(event),
  originalCombatEntrySeal:night.source.originalCombatEntrySeal,
  originalHumanNightSourceHash:night.sourceHash,accepted:night.source.accepted,
  noAdditionalHumanOrBeastNightOrMedicalTreatment:true};
 const rows=p.originalVisitorNightRestReceipts||[];
 if(rows.length>=90||rows.some(x=>x.source.startMinute===minute))
  throw Error('An actual original visitor cannot have two night receipts');
 p.originalVisitorNightRestReceipts=[...rows,{source:q,seal:hash(q)}];
 if(!verify(s,p))throw Error('Original independent visiting night failed saved source replay');
}
function rest(s,{actorId,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId)||
  !int(witnessIndex,0,(s.log?.length||0)-1))
  throw Error('Exact original travelling person and authentic safe room witness only; no chosen rest, healing or venue');
 const minute=s.world.minutes,found=context(s,actorId,minute),
  event=s.log[witnessIndex];
 if(!found)throw Error('Original current visitor, Combat body and signed settlement presence required');
 if(!witnessedRoom(s,found.p,found.site,found.pos,found.presence,event,minute)||
  !s.chatRuntime?.scene?.includes(event.text))
  throw Error('A distinctly witnessed safe room and individual person are required before any personal rest decision');
 if(!verify(s,found.p))throw Error('Existing original visitor rest source is altered');
 const original=Health.witnessedNpcNightSleep(s,{
  actorId,witness:event.text
 },{site:found.site,arrivalSeal:found.pos.sourceHash,
  presenceHash:found.presence.hash,witnessIndex});
 if(!verify(s,found.p))throw Error('Completed original visitor rest failed reciprocal source audit');
 return {privateToGM:true,actorId,actualVisitorSite:found.site,
  freelyAccepted:original.freelyAccepted,
  elapsedMinutes:original.elapsedMinutes,
  completedOriginalNight:original.completedOriginalNight,
  originalCombatResult:original.observedPhysicalState,
  originalSourceBoundQiRestored:original.originalSourceBoundQiRestored,
  noAssumedShelterContractBeastRestOrHealing:true,
  noSecondNightOrAutomaticHumanOrBeastPower:true};
}
function latestAcceptedAfter(s,p,journey){
 if(!verify(s,p))return null;
 const rows=p.originalVisitorNightRestReceipts||[],
  selected=rows.filter(x=>x.source.accepted&&
    x.source.originalArrivalSeal===journey.seal&&
    x.source.site===journey.source.to&&
    x.source.startMinute>=journey.source.arrivalMinute&&
    x.source.endMinute<=s.world.minutes).at(-1);
 if(!selected)return null;
 return p.originalOvernightRestDecisions.find(x=>
  x.sourceHash===selected.source.originalHumanNightSourceHash)||null;
}
function privateStatus(s,p){
 if(!verify(s,p))throw Error('The original visiting person's independently chosen nights failed source audit');
 return (p.originalVisitorNightRestReceipts||[]).map(row=>{
  const q=row.source,physical=p.originalOvernightRestDecisions.find(x=>
   x.sourceHash===q.originalHumanNightSourceHash)?.result;
  return {privateToGM:true,actorId:p.actorId,site:q.site,
   startMinute:q.startMinute,endedMinute:q.endMinute,
   individuallyAccepted:q.accepted,originalHumanNightMinutes:q.endMinute-q.startMinute,
   originalCombatLightWoundsBefore:physical?.woundsBefore?.[0]??null,
   originalCombatLightWoundsAfter:physical?.woundsAfter?.[0]??null,
   originalHumanStaminaBefore:physical?.staminaBefore??null,
   originalHumanStaminaAfter:physical?.staminaAfter??null,
   originalArrivalSourceHash:q.originalArrivalSeal,
   realRoomWitnessHash:q.witnessHash,sourceHash:row.seal,
   noPresumedPaidRoomOrRestForSapientCompanion:true};
 });
}
function status(s,{actorId,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId))
  throw Error('Only an authenticated independent human source ID, not a chosen room or recovery');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)];
 if(!p||p.actorId!==actorId||!People.verify(w,p))
  throw Error('A real original independent human is required');
 const rows=privateStatus(s,p),current=context(s,actorId);
 return {privateToGM:true,actorId,
  actualSourceVerifiedVisitingSite:current?.site??null,
  originalPersonallyChosenNights:rows,
  originalNightHistoryCount:rows.length,
  lastOriginalNight:rows.at(-1)??null,
  currentSafeRoomNotInferredFromTownOrPastHistory:true,
  newWitnessAndFreshIndividualNightChoiceRequired:true,
  noTimeOrRngOrWoundOrStaminaOrFeeChanged:true,
  noBeastSleepOrMedicalCareOrMagicGranted:true};
}
module.exports={ORIGIN,WITNESS,context,verify,record,rest,latestAcceptedAfter,privateStatus,status};
