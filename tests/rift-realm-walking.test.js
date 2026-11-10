'use strict';
// Master §25: real selected Rift Realm Walking VII with independent physical
// opening/coordinates/rights and a separately checked return. Disposable
// genuinely earned I–VI character; no campaign save or protected vault edited.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine.js'),R=require('../rules'),C=require('../rules/core'),
 Realm=require('../world/simulation'),
 Walk=require('../rules/rift-realm-walking');
const {freshSourceEarnedAdaptedGame}=
 require('./rift-adaptation.test.js');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const act=(s,op,p={})=>R.act(s,{system:'rift',operation:op,params:p});
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
{
 const s=E.newGame({seed:25157999,name:'Untrained Rift visitor'});
 const before=E.exportGame(s),rng=s.rngState;
 A.equal(act(s,'realmStatus').inside,false);
 A.throws(()=>act(s,'realmPrepare',{routeId:'unseen_outer_landing',minutes:90}),
  /earned|actual safe|Riftglass|source|real/i);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=freshSourceEarnedAdaptedGame(),id='liminal_measured_approach_01',
  original={location:s.world.location,stamina:s.player.stamina,
   humanStage:s.player.humanEvolution.stage,
   evolution:s.player.origin.load};
 A.equal(s.player.rift.step,6);
 A.equal(act(s,'realmStatus').inside,false);
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'realmPrepare',{routeId:id,minutes:90}),
  /independently|route|evidence/i);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng,
  'A rank alone cannot create an actual open route or consume a roll');
 const q=establish(s,id);
 const baseline=E.exportGame(s),baselineRng=s.rngState;
 A.throws(()=>act(s,'realmPrepare',{routeId:id,minutes:90,portal:true}),
  /original measured|planning time/i);
 A.equal(E.exportGame(s),baseline);A.equal(s.rngState,baselineRng);
 let prepared=false;
 for(let n=0;n<8&&!prepared;n++){
  const prior=s.world.minutes,sta=s.player.stamina;
  const out=act(s,'realmPrepare',{routeId:id,minutes:90});
  A.equal(out.noPassageYet,true);
  A.equal(out.prepared,out.check.success);
  A.equal(s.world.minutes,prior+90);
  A.equal(s.player.stamina,sta-4);
  A.equal(Walk.verify(s),true);
  prepared=out.prepared;
 }
 A.equal(prepared,true,'Actual high-skill preparation has an independently decided original roll');
 A.equal(s.world.planeId||'mortal','mortal');
 A.equal(act(s,'realmStatus').prepared,true);
 let inside=false;
 for(let n=0;n<6&&!inside;n++){
  const prev=s.world.minutes,sta=s.player.stamina;
  const out=act(s,'realmEnter',{routeId:id});
  A.equal(out.crossed,out.check.success);
  A.equal(s.world.minutes,prev+10);
  A.equal(s.player.stamina,sta-5);
  A.equal(Walk.verify(s),true);
  inside=out.crossed;
 }
 A.equal(inside,true,'An independently prepared actual open passage must permit a real checked realm crossing');
 A.equal(s.world.planeId,'liminal');
 A.equal(s.player.rift.step,7);
 A.equal(s.world.location,original.location,
  'The mortal anchor remains saved, but the player is physically in the recorded other plane');
 A.equal(act(s,'realmStatus').inside,true);
 A.equal(act(s,'realmStatus').observedLanding,q.arrivalCoordinate);
 A.equal(act(s,'realmStatus').returnRouteId,id);
 const foreign=E.exportGame(s),foreignRng=s.rngState;
 A.throws(()=>R.act(s,{system:'world',operation:'wait',params:{minutes:10}}),
  /foreign plane|mortal-world/i);
 A.throws(()=>E.dispatch(s,'travel fen'),/foreign plane|mortal-world/i);
 A.throws(()=>act(s,'realmEnter',{routeId:id}),
  /foreign plane|mortal-world/i);
 A.equal(E.exportGame(s),foreign);
 A.equal(s.rngState,foreignRng,'A blocked false mortal scene cannot consume original dice');
 A.equal(Walk.verify(E.importGame(E.exportGame(s))),true);
 let returned=false;
 for(let n=0;n<6&&!returned;n++){
  const before=s.world.minutes,sta=s.player.stamina;
  const out=act(s,'realmReturn',{routeId:id});
  A.equal(out.returned,out.check.success);
  A.equal(s.world.minutes,before+10);
  A.equal(s.player.stamina,sta-4);
  A.equal(Walk.verify(s),true);
  returned=out.returned;
 }
 A.equal(returned,true,'Actual human returning through the correctly surveyed route is separately checked, never a free command');
 A.equal(s.world.planeId,'mortal');
 A.equal(s.world.location,original.location);
 A.equal(s.player.rift.step,7);
 A.equal(s.player.origin.load,original.evolution);
 A.equal(s.player.humanEvolution.stage,original.humanStage);
 A.equal(act(s,'realmStatus').inside,false);
 const after=E.exportGame(s),afterRng=s.rngState;
 A.throws(()=>act(s,'realmReturn',{routeId:id}),/actually entered/i);
 A.equal(E.exportGame(s),after);A.equal(s.rngState,afterRng);
 const tampered=E.importGame(E.exportGame(s));
 tampered.table.realm.riftWalk.attempts[0].source.check.roll=20;
 A.equal(Walk.verify(tampered),false);
 const falseOpening=E.importGame(E.exportGame(s));
 falseOpening.table.realm.riftRouteSources[id].source.independentReturnSurvey='invented';
 A.equal(Walk.verify(falseOpening),false);
 for(let n=0;n<110;n++)C.event(s,'story',
  'Independent ordinary workers carry on unrelated mortal settlement and wardline observation while historical realm evidence remains recorded.',{unrelated:n});
 A.equal(s.log.length,90);
 A.equal(Walk.verify(E.importGame(E.exportGame(s))),true,
  'Original source-witnessed route and return receipts survive normal 90-event journal rollover');
}
console.log('Rift VII: actual selected GM-witnessed temporary route, measured arrival/return, one original d20 each, physical other-plane presence, mortal action lock and genuine return');
