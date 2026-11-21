'use strict';
// Explicit disposable GM-authored route opportunity, following the original
// player route fixture. No independent stage, choice, check or entry assigned.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine'),R=require('../rules'),C=require('../rules/core'),
 Realm=require('../world/simulation'),World=require('../rules/world'),
 Presence=require('../world/person-presence'),Combat=require('../rules/combat'),
 Walk=require('../rules/rift-realm-walking'),NPC=require('../rules/independent-original-rift-realm-walking'),
 Local=require('../rules/independent-original-rift-local-spatial');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function establish(s,routeId){
 C.event(s,'story','Independent Rift surveyors witness a real momentarily traversable selected outer opening, its actual local access rights and physically measured safe return coordinates.',{
  origin:Walk.ROUTE,routeId,location:s.world.location,
  boundaryId:'riftglass_wardline',planeId:'liminal',
  actualOpeningWitnessed:true,arrivalMeasured:true,
  returnPassageMeasured:true,protectedVaultEntry:false,
  noUniversalPortal:true});
 const w=structuredClone(s.log.at(-1)),openMinute=s.world.minutes;
 const q={origin:Walk.ROUTE,routeId,
  boundaryId:'riftglass_wardline',planeId:'liminal',
  entryLocation:s.world.location,openMinute,
  closesMinute:openMinute+480,
  entryCoordinate:'The independently surveyed outside eastern seam at the actually witnessed physical Riftglass exterior wardline',
  arrivalCoordinate:'The separately measured sheltered near-threshold liminal landing with observed independent footing and no inferred distant geography',
  returnCoordinate:'The original independently tested matching return frequency and anchor into the public exterior wardline',
  originalPhysicalOpening:'Independent pressure and phase measurements confirm an actually present temporary selected aperture, not a permanently opened realm gate.',
  independentArrivalSurvey:'A separate physical observation established the near-threshold landing and its actual environmental limits before any entry.',
  independentReturnSurvey:'An independent test from the other side measured an attainable but fallible return to the actual original outer anchor.',
  legalProtectionAuthority:'The individually observed approach has specific verified survey rights and ward permission without protected vault or sapient-person trespass.',
  energyAndShearProtections:'Verified human pressure adaptation, personal anchors and real limiting shear protection remain necessary on both passes.',
  foreignRealmPressureLimits:'The short known landing has observed unfamiliar boundary pressure and severe instability still capable of harming an unprotected body.',
  witness:w,witnessHash:hash(w)};
 Realm.ensure(s).riftRouteSources||={};
 Realm.ensure(s).riftRouteSources[routeId]={
  origin:Walk.ROUTE,source:q,seal:hash(q)};
 return q;
}
function assess(s,p){
 A.equal(Local.privateStatus(s,p).earnedStep,6);
 const body=Combat.get(s,'npc_'+p.id),fit=cost=>body.status==='ok'&&body.wounds.every(x=>x===0)&&body.stamina>=cost,
  here=()=>!!Presence.resolve(Realm.peek(s),p.actorId,'ruins',Math.floor(s.world.minutes/1440),s.world.minutes%1440)?.presence;
 if(!here()||!fit(4)||s.world.location!=='ruins')return null;
 const id='disposable_individual_selected_realm',route=establish(s,id),originalPlane=s.world.planeId??'mortal',
  description='Explicit disposable survey observation of the real bounded current approach, individual permissions, physical conditions, and fallible return.';
 function attempt(kind,operation){
  const start=s.world.minutes,before=body.stamina;
  s.chatRuntime.scene=p.name+' considers an individually measured and permitted '+kind+' action in a disposable original route scene.';
  C.event(s,'story',s.chatRuntime.scene,{origin:NPC.WITNESS,actorId:p.actorId,routeId:id,kind,location:'ruins',
   planeId:route.planeId,fromPlaneId:kind==='return'?route.planeId:'mortal',
   entryCoordinate:route.entryCoordinate,arrivalCoordinate:route.arrivalCoordinate,returnCoordinate:route.returnCoordinate,
   actualIndividualLegalPermission:description,observedIndividualProtections:description,measuredIndividualPosition:description,
   independentlyObservedForeignReturnApproach:description,privateToGM:true,noUniversalPortal:true,noProtectedVaultEntry:true});
  const params={actorId:p.actorId,routeId:id,witnessIndex:s.log.length-1,...(kind==='prepare'?{minutes:45}:{})},
   save=E.exportGame(s);
  A.throws(()=>R.act(s,{system:'rift',operation,params:{...params,crossed:true}}),/fresh action witness/);
  A.equal(E.exportGame(s),save);
  const result=R.act(s,{system:'rift',operation,params}),q=p.originalRiftRealmJourney.rows.at(-1).source;
  A.equal(NPC.verify(s,p),true);A.equal(s.world.planeId??'mortal',originalPlane);A.equal(s.world.location,'ruins');
  A.equal(result.independentlyAccepted,q.accepted);A.equal(result.success,!!q.check?.success);
  A.equal(body.stamina,before-(q.accepted?(kind==='enter'?5:4):0));
  A.equal(s.world.minutes-start,result.elapsedMinutes);
  return result;
 }
 const prepare=attempt('prepare','npcRealmPrepare');let entered=false,returned=false;
 if(prepare.success&&fit(5)&&here()){
  entered=attempt('enter','npcRealmEnter').success;
  if(entered){
   A.equal(NPC.awayAt(p,s.world.minutes),true);A.equal(here(),false);
   A.equal(NPC.privateStatus(s,p).earnedStep,7);
   const saved=E.exportGame(s),copy=E.importGame(saved),cp=Realm.peek(copy).emergentPeople.people[p.id];
   A.equal(NPC.verify(copy,cp),true);
   const before=copy.world.minutes;
   E.advance(copy,Math.max(1,route.closesMinute+1-before));World.finalizeTime(copy,before);
   A.equal(NPC.awayAt(cp,copy.world.minutes),true);
   A.equal(NPC.privateStatus(copy,cp).planeId,route.planeId);
   A.equal(Presence.resolve(Realm.peek(copy),cp.actorId,'ruins',Math.floor(copy.world.minutes/1440),copy.world.minutes%1440),null);
   if(fit(4)&&s.world.minutes+10<route.closesMinute){
    returned=attempt('return','npcRealmReturn').success;
    A.equal(NPC.awayAt(p,s.world.minutes),!returned);
   }
  }
 }
 const copy=E.importGame(E.exportGame(s)),cp=Realm.peek(copy).emergentPeople.people[p.id];
 A.equal(NPC.verify(copy,cp),true);
 const row=cp.originalRiftRealmJourney.rows[0];row.source.routeSeal='0'.repeat(64);row.seal=hash(row.source);
 A.equal(NPC.verify(copy,cp),false);
 return {prepared:prepare.success,entered,returned,actual: NPC.privateStatus(s,p)};
}
module.exports={assess};
