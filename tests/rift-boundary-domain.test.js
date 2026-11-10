'use strict';
// Master §25: the FIRST real bounded Boundary Domain VIII. A single verified
// local framework is not a free universal spatial domain, rank or portal.
// All materials, preparation and actors here are disposable tests, not saves.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),C=require('../rules/core'),W=require('../rules/world'),
 D=require('../rules/rift-boundary-domain'),
 Fold=require('../rules/rift-fold-step'),Walk=require('../rules/rift-realm-walking');
const {freshEarnedReturnedRiftVII}=
 require('./rift-realm-walking.test.js');
const act=(s,op,p={})=>R.act(s,{system:'rift',operation:op,params:p});
const SEG='individual_outer_domain_span_01';
const FIRST='At the original physically measured human position along the public exterior wardline';
const NEXT='At the nearby directly visible independent standing stone within the same open exterior segment';
function witness(s,id){
 C.event(s,'story',
  'Two independent boundary surveyors observe a truly measured and bounded original human spatial domain with a real countermeasure.',{
  origin:D.WITNESS,location:s.world.location,
  boundaryId:'riftglass_wardline',domainId:id,segmentId:SEG,
  mode:'reinforce',areaSquareMetres:4,durationMinutes:180,
  independentlyMeasuredFramework:'A visibly measured four-square-metre local exterior spatial framework briefly resists boundary shear but cannot open a portal.',
  verifiedSourceEnergyPath:'The personally established original human Arcana and independently measured spatial-pressure adaptation supply a finite bounded domain.',
  realMetabolicSupport:'Actual living oxygenation, genuine physical stamina, existing mana and real mineral stock all constrain the effort.',
  countermeasureAndDisruption:'A separately observed adverse pressure angle and substantial counterweaving can overwhelm this individual short-lived local framework.',
  independentRealmPressureLimit:'A different extreme Riftglass pressure condition defeats this framework without changing the protected vault seal.',
  localAccessRights:'Independently verified public outer wardstone survey permission covers this one measured segment but not any protected threshold.',
  noRealmLawOverride:true,noProtectedBoundaryCrossing:true,
  noRemoteTravel:true,noUnboundedEffect:true});
 return s.log.length-1;
}
function foldWitness(s){
 const current=s.table?.riftFoldSteps?.currentPosition||FIRST;
 C.event(s,'story',
  'Independent local surveyors witness a new genuine short unobstructed exterior Fold Step through the already measured protected framework.',{
  origin:Fold.WITNESS,location:s.world.location,
  anchorId:require('../rules/rift-anchors').SITE,segmentId:SEG,
  fromObservedPosition:current,toObservedPosition:NEXT,
  measuredDistanceMetres:3,safeRangeMetres:5,
  lineOfEffectClear:true,crossesSealedBoundary:false,
  crossesWorldLocation:false,
  lineOfEffectMeasurement:'The visible exterior stone path remains a physically unobstructed measured three-metre line of effect.',
  independentObstructionTest:'A separate real wall survey verifies the protected Riftglass vault remains inaccessible despite this external framework.',
  energyAndPhysicalLimit:'Finite living stamina, independent real pressure and genuine spatial shear remain possible on this actual short movement.',
  measuredPressureCountertest:'A separate source survey confirms the local framework cannot negate an extreme exterior spatial-pressure shift.'});
 return s.log.length-1;
}
function actualRest(s){
 if(s.player.mana>=18&&s.player.stamina>=13)return;
 A.equal(E.dispatch(s,'travel fen').ok,true);
 A.equal(E.dispatch(s,'travel crossing').ok,true);
 let nights=0;
 while(s.player.mana<18||s.player.stamina<22){
  A.ok(++nights<=4,'A genuine settlement night must restore original bodily/Mana resources');
  A.equal(R.act(s,{system:'health',operation:'sleep',
   params:{hours:8}}).sleptHours,8);
 }
 A.equal(E.dispatch(s,'travel fen').ok,true);
 A.equal(E.dispatch(s,'travel ruins').ok,true);
 A.ok(s.player.stamina>=13);
 A.ok(s.player.mana>=18);
}
{
 const s=E.newGame({seed:25158998,name:'Untrained cannot invent a Rift Domain'});
 const old=E.exportGame(s),rng=s.rngState;
 A.equal(act(s,'domainStatus').earned,false);
 A.throws(()=>act(s,'domainForm',{witnessIndex:0}),
  /actually witnessed|Riftglass|safe living|observed/i);
 A.equal(E.exportGame(s),old);A.equal(s.rngState,rng);
}
{
 const s=freshEarnedReturnedRiftVII();
 A.equal(s.player.rift.step,7);
 A.equal(Walk.verify(s),true);
 A.equal(act(s,'realmStatus').inside,false);
 const original={location:s.world.location,
  humanEvolution:s.player.humanEvolution.stage,
  originLoad:s.player.origin.load,
  actualMortalPlane:s.world.planeId};
 const missing=E.exportGame(s),missingRng=s.rngState;
 A.throws(()=>act(s,'domainForm',{witnessIndex:0}),
  /actually witnessed|measured|original/i);
 A.equal(E.exportGame(s),missing);A.equal(s.rngState,missingRng);
 const i=witness(s,'measured_domain_01');
 const before=E.exportGame(s),beforeRng=s.rngState;
 A.throws(()=>act(s,'domainForm',{witnessIndex:i,outcome:'guaranteed',dc:1}),
  /actually witnessed/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,beforeRng);
 A.throws(()=>act(s,'domainForm',{witnessIndex:i}),
  /Insufficient genuinely owned/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,beforeRng);
 // Independent prior physical handoff in disposable fixture, not a domain
 // result. Source executor requires actual existing stock on every attempt.
 s.player.inventory.moss_crystal=12;
 s.player.inventory.ironbloom=6;
 let earned=false,attempts=0,actual=null;
 for(let tries=0;tries<6&&!earned;tries++){
  actualRest(s);
  const index=tries===0?i:witness(s,'measured_domain_'+String(tries+1).padStart(2,'0'));
  const previousMinute=s.world.minutes,sta=s.player.stamina,
   mana=s.player.mana,crystal=s.player.inventory.moss_crystal,
   metal=s.player.inventory.ironbloom,rng=s.rngState;
  const out=act(s,'domainForm',{witnessIndex:index});
  A.equal(out.attempted,true);
  A.equal(out.success,out.check.success);
  A.equal(out.manaSpent,18);A.equal(out.staminaSpent,13);
  A.equal(s.player.mana,mana-18,'Real source Mana is spent even on failure');
  A.equal(s.player.inventory.moss_crystal,crystal-2);
  A.equal(s.player.inventory.ironbloom,metal-1);
  A.equal(s.world.minutes,previousMinute+120);
  A.equal(s.player.stamina,Math.min(s.player.maxStamina,
   sta-13+5*(Math.floor(s.world.minutes/1440)-Math.floor(previousMinute/1440))));
  A.notEqual(s.rngState,rng,'The one actual source-bound check rolls exactly once');
  A.equal(D.verify(s),true);
  const saved=E.exportGame(s),afterRng=s.rngState;
  A.throws(()=>act(s,'domainForm',{witnessIndex:index}),
   /rerolled|observed original domain|identity|truly measured finite spatial field/i);
  A.equal(E.exportGame(s),saved);A.equal(s.rngState,afterRng);
  attempts++;earned=out.success;actual=out;
 }
 A.equal(earned,true,'Independently measured original high-skill human spatial domains can physically form');
 A.equal(s.player.rift.step,8);
 A.equal(actual.noPortal,true);
 A.equal(actual.noGlobalRealmRewrite,true);
 A.equal(s.world.location,original.location);
 A.equal(s.world.planeId,original.actualMortalPlane);
 A.equal(s.player.humanEvolution.stage,original.humanEvolution);
 A.equal(s.player.origin.load,original.originLoad);
 A.equal(act(s,'domainStatus').earned,true);
 A.equal(act(s,'domainStatus').activeDomains.length,1);
 A.equal(D.support(s,SEG).mitigation,2);
 const past=s.table.riftDomains; // Actual pocket state lives under shared realm.
 A.equal(past,undefined);
 A.equal(s.table.realm.riftDomains.attempts.length,attempts);
 A.equal(s.table.realm.cosmology?.boundaries?.riftglass_wardline?.noProvenPassage??true,true);
 const source=act(s,'domainStatus').activeDomains[0];
 A.equal(source.noPortal,true);
 const wi=foldWitness(s),foldMinute=s.world.minutes;
 const result=act(s,'foldStep',{witnessIndex:wi});
 A.equal(result.step,8,'A lower real Rift art cannot erase earned Boundary Domain VIII');
 A.equal(result.actuallyEarnedDomainSupport,2);
 A.equal(result.localBoundarySupport,2);
 A.equal(s.world.location,original.location);
 A.equal(s.world.minutes,foldMinute+5);
 A.equal(Fold.verify(s),true);
 A.equal(D.verify(s),true);
 const full=E.importGame(E.exportGame(s));
 A.equal(D.verify(full),true);
 A.equal(Fold.verify(full),true);
 const damaged=E.importGame(E.exportGame(s));
 damaged.table.realm.riftDomains.attempts[0].source.manaSpent=0;
 A.equal(D.verify(damaged),false,'False free energy cannot replace original costly domain');
 const forged=E.importGame(E.exportGame(s));
 forged.table.riftFoldSteps.attempts.at(-1).source.domainMitigation=5;
 A.equal(Fold.verify(forged),false,'A domain cannot invent extra numerical spatial support');
 const pre=s.world.minutes;
 E.advance(s,230);W.finalizeTime(s,pre);
 A.equal(act(s,'domainStatus').activeDomains.length,0);
 A.equal(D.support(s,SEG).mitigation,0);
 A.equal(D.verify(s),true);
 A.equal(Fold.verify(s),true,
  'An authentic previous spatial support receipt survives physical domain expiration');
 for(let j=0;j<110;j++)C.event(s,'story',
  'Independent local wardens record unrelated ordinary exterior stone survey events as the original space becomes quiet again.',{unrelated:j});
 A.equal(s.log.length,90);
 A.equal(D.verify(E.importGame(E.exportGame(s))),true);
}
console.log('Rift VIII: actual costly bounded original human spatial domain, independent counters, 1-roll nonstacking physical Fold effect, real energy/materials, expiry and no portal');
