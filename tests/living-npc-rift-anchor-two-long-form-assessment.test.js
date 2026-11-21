'use strict';
// #177 720 genuine world days EACH across 14 independently acting Rift I
// persons; all REAL original environmental sensing, personal Survival
// scouted shelter, separately chosen sleep, Combat recover/stamina and
// three-axis Anchor II work have the source owner. No future roll, actor
// action, shelter, stage, technique, known route or outcome is assigned.
// Fixture's already replayed *pre-Rift-I preparation* is explicitly synthetic
// and must never be represented as a source-born training history.
const A=require('node:assert/strict'),E=require('../engine'),
 Rules=require('../rules'),World=require('../rules/world'),
 Realm=require('../world/simulation'),Lives=require('../world/independent-person-lives'),
 Early=require('../rules/independent-original-discipline-preparation'),
 Sense=require('../rules/independent-original-rift-sense-observation'),
 Anchor=require('../rules/independent-original-rift-exterior-anchor-two'),
 Field=require('../rules/independent-riftglass-field-refuge'),
 Recover=require('../rules/independent-original-riftglass-one-recover'),
 Offscreen=require('../world/independent-original-power-days'),
 Foundation=require('../world/person-mechanical-foundations'),
 Law=require('../rules/rift-shared-original-anchor-law');
const {fixture}=require('./living-npc-original-soul-body-rift-first-milestones.test.js');
const reports=[];let actualAnchors=0,originalSuccessfulAxes=0,
 acceptedNightCount=0,acceptedAnchorChecks=0,originalSurveyChecks=0,
 sourceNightResetRecoverRenewals=0,
 trulyCompleted=0,prime=null;
for(let i=0;i<14;i++){
 const seed=973800+i*17,{s,p,day}=fixture('rift','breakthrough',seed);
 // Explicit disposable PC-side material fixture, NOT NPC property, a gift,
 // successful construction or historical acquisition claim. The same
 // NPC must voluntarily receive actual stock and perform all original work.
 s.player.inventory.moss_crystal=2;
 const first=Rules.act(s,{system:'discipline',operation:'npcOriginalFirstMilestone',
  params:{actorId:p.actorId,system:'rift'}});
 A.equal(first.observedOutcome,'breakthrough');
 const w=Realm.peek(s),life=w.independentPersonLives.people[p.id];
 life.lastDay=day;A.equal(Lives.verifyEntry(w,life),true);
 const start=s.world.minutes;
 // This is exactly the SAME original per-person day scheduler, not a
 // newly selected player-controlled practice action or extra calendar.
 E.advance(s,720*1440);World.finalizeTime(s,start);
 A.equal(Lives.verifyEntry(Realm.peek(s),life),true);
 for(const source of [Early,Sense,Anchor,Field,Recover])
  A.equal(source.verify(s,p),true,'Original '+seed+' historical source rejected');
 A.equal(Offscreen.verifyNights(s,p),true);
 const anchors=p.originalRiftExteriorAnchor?.attempts||[],
  camps=p.originalRiftglassFieldRest?.attempts||[],
  nights=(p.originalOffscreenCombatNights||[]).filter(x=>
   x.source.site==='ruins'&&x.source.originalFieldSurveyHash),
  accepted=anchors.filter(x=>x.source.accepted),
  gained=accepted.filter(x=>x.source.progressEarned>0),
  completed=p.originalRiftExteriorAnchor?.completed===true,
  earnedRecoverRenewals=p.originalRiftglassRecover?.renewals||[],
  body=s.table.combatants['npc_'+p.id];
 actualAnchors+=anchors.length;
 acceptedAnchorChecks+=accepted.length;
 originalSuccessfulAxes+=gained.length;
 originalSurveyChecks+=camps.length;
 acceptedNightCount+=nights.length;
 sourceNightResetRecoverRenewals+=earnedRecoverRenewals.length;
 A.ok(earnedRecoverRenewals.length<=nights.length,
  'A fully witnessed Combat night can reset the original Recover allowance ONCE, but an ordinary rest day cannot');
 for(const row of earnedRecoverRenewals){
  const proof=row.source.originalCombatNight;
  A.equal(Offscreen.verifyNights(s,p,[proof]),true,
   'Every renewed Recover requires an already completed, authentic original wilderness night');
  A.equal(row.source.recoverUsesBefore,0);
  A.equal(row.source.recoverUsesAfter,1);
 }
 if(completed)trulyCompleted++;
 for(const night of nights)
  A.equal(Field.verifiedNight(s,p,night.source),true,
   'No Riftglass sleeping without original DC20+ survey and independent consent');
 if(completed){
  A.deepEqual(p.originalRiftExteriorAnchor.axes,
   {bearing:2,resonance:2,stability:2});
  A.equal(p.originalRiftExteriorAnchor.integrated,true);
  A.equal(p.originalRiftExteriorAnchor.anchor.noFoldStepVaultEntryOrPortalGranted,true);
 }else A.equal(p.originalRiftExteriorAnchor?.anchor??null,null);
 A.deepEqual(p.knownTechniques,[]);
 const d=Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence;
 A.equal(d.originalPowerMilestones.rift.step,completed?2:1);
 if(camps.length)A.equal(d.originalRiftglassFieldRefuge.personallyAcceptedOriginalFieldNights,nights.length);
 const score=accepted.length+gained.length*5+nights.length*2+
  (completed?100:0);
 if(!prime||score>prime.score)
  prime={score,seed,s,p,completed};
 // Only the original completed II actor receives this disposable observed
 // local geometry opportunity. Never award II or an extra rest for the test.
 let localSpatial=null;
 if(completed&&body.status==='ok'&&body.wounds.every(x=>x===0)&&body.stamina>=2){
  const Local=require('../rules/independent-original-rift-local-spatial'),
   Fold=require('../rules/rift-fold-step'),Weave=require('../rules/rift-boundary-weaving'),
   PCAnchor=require('../rules/rift-anchors'),Core=require('../rules/core'),
   Presence=require('../world/person-presence'),now=s.world.minutes,dayNow=Math.floor(now/1440);
  if(Presence.resolve(Realm.peek(s),p.actorId,'ruins',dayNow,now%1440)?.presence){
   const description='A bounded original exterior spatial geometry is explicitly observed in this disposable test witness, with no claim of passage or hidden power.',
    from='At the actual surveyed exterior path marker of this disposable test scene.',
    to='At a separately measured unobstructed marker three metres along the same exterior path.';
   s.chatRuntime.scene=p.name+' examines two actual local exterior positions and their failure boundary.';
   Core.event(s,'story',s.chatRuntime.scene,{origin:Fold.WITNESS,actorId:p.actorId,location:'ruins',anchorId:PCAnchor.SITE,
    fromObservedPosition:from,toObservedPosition:to,lineOfEffectMeasurement:description,
    independentObstructionTest:description,energyAndPhysicalLimit:description,measuredPressureCountertest:description,
    measuredDistanceMetres:3,safeRangeMetres:3,lineOfEffectClear:true,crossesSealedBoundary:false,crossesWorldLocation:false});
   const first=Rules.act(s,{system:'rift',operation:'npcFoldStep',params:{actorId:p.actorId,witnessIndex:s.log.length-1}});
   A.equal(Local.verify(s,p),true);
   const row=p.originalRiftLocalSpatial.sessions.at(-1).source;
   A.equal(row.staminaSpent,row.accepted?2:0);
   A.equal(row.after.step,first.success?3:2);
   if(first.success&&body.status==='ok'&&body.wounds.every(x=>x===0)&&body.stamina>=4){
    s.chatRuntime.scene=p.name+' examines an original small local boundary segment, without opening any portal.';
    Core.event(s,'story',s.chatRuntime.scene,{origin:Weave.WITNESS,location:'ruins',actorId:p.actorId,
     boundaryId:'riftglass_wardline',segmentId:'individual_local_exterior_segment',mode:'reinforce',areaSquareMetres:3,supportMinutes:360,
     originalSpatialFabric:description,observedLocalChange:description,independentPressureCountertest:description,actualEnergyLimit:description,
     crossesBoundary:false,opensPortal:false,globalSealChanged:false});
    const second=Rules.act(s,{system:'rift',operation:'npcWeaveBoundary',params:{actorId:p.actorId,witnessIndex:s.log.length-1,minutes:60}});
    A.equal(Local.verify(s,p),true);A.equal(Local.privateStatus(s,p).earnedStep,second.success?4:3);
    // A genuinely formed IV is not itself a pocket. Custody is acquired
    // through the original voluntary material gift from finite test stock.
    const Custody=require('../rules/independent-material-custody'),
     Pocket=require('../rules/rift-pocket-architecture'),Adapt=require('../rules/rift-adaptation'),
     here=()=>!!Presence.resolve(Realm.peek(s),p.actorId,'ruins',Math.floor(s.world.minutes/1440),s.world.minutes%1440)?.presence,
     fit=cost=>here()&&body.status==='ok'&&body.wounds.every(x=>x===0)&&body.stamina>=cost;
    function offer(item,units){
     s.chatRuntime.scene=p.name+' considers actual offered '+item+' material without obligation.';
     Core.event(s,'story',s.chatRuntime.scene,{origin:Custody.OFFER,actorId:p.actorId,location:'ruins',items:{[item]:units}});
     return Rules.act(s,{system:'material',operation:'offerToPerson',params:{actorId:p.actorId,witnessIndex:s.log.length-1}});
    }
    if(second.success&&fit(6)&&(s.player.inventory.moss_crystal||0)>=2&&offer('moss_crystal',2).accepted&&fit(6)){
     s.chatRuntime.scene=p.name+' examines actual bounded pocket geometry and its personally held anchoring crystals.';
     Core.event(s,'story',s.chatRuntime.scene,{origin:Pocket.WITNESS,actorId:p.actorId,location:'ruins',
      boundaryId:'riftglass_wardline',segmentId:'individual_local_exterior_segment',pocketId:'individual_original_pocket',
      capacityUnits:2,lifetimeHours:24,originalSpatialVolume:description,originalStableAnchoring:description,
      independentCollapseCountertest:description,measuredEnergyAndMetabolicDemand:description,
      ownershipAndMaterialProvenance:description,accessAndRetrievalLimit:description,
      noLivingStorage:true,noPortalTransit:true,noRealmEntry:true,materials:{moss_crystal:2}});
     const beforeCrystal=Custody.held(s,p).moss_crystal,pcCrystal=s.player.inventory.moss_crystal||0,
      formedPocket=Rules.act(s,{system:'rift',operation:'npcPocketBuild',
       params:{actorId:p.actorId,witnessIndex:s.log.length-1,minutes:180}});
     A.equal(Local.verify(s,p),true);A.equal(Custody.verify(s,p),true);
     A.equal(Custody.held(s,p).moss_crystal||0,beforeCrystal-(formedPocket.independentlyAccepted?2:0));
     A.equal(s.player.inventory.moss_crystal||0,pcCrystal);
     A.equal(Local.privateStatus(s,p).earnedStep,formedPocket.success?5:4);
     if(formedPocket.success){
      const pocketId='individual_original_pocket';
      if(fit(1)&&s.player.inventory.clean_rations&&offer('clean_rations',1).accepted&&fit(1)){
       for(const direction of ['store','retrieve']){
        if(!fit(1))break;
        const beforeCarried=Custody.held(s,p).clean_rations||0,
         beforeInside=Custody.pocketContents(s,p,pocketId).clean_rations||0;
        if(direction==='store'&&!beforeCarried||direction==='retrieve'&&!beforeInside)break;
        s.chatRuntime.scene=p.name+' considers moving one real ration '+direction+' through the finite local pocket.';
        Core.event(s,'story',s.chatRuntime.scene,{origin:Custody.POCKET_TRANSFER,actorId:p.actorId,location:'ruins',
         pocketId,direction,item:'clean_rations',units:1});
        const transfer=Rules.act(s,{system:'rift',operation:'npcPocketTransfer',
         params:{actorId:p.actorId,witnessIndex:s.log.length-1}});
        A.equal(Local.verify(s,p),true);A.equal(Custody.verify(s,p),true);
        const moved=transfer.transferred?1:0,delta=direction==='store'?-moved:moved;
        A.equal(Custody.held(s,p).clean_rations||0,beforeCarried+delta);
        A.equal(Custody.pocketContents(s,p,pocketId).clean_rations||0,beforeInside-delta);
       }
      }
      for(let k=0;k<2&&fit(4);k++){
       s.chatRuntime.scene=p.name+' considers measured personal physiological exposure to original exterior pressure.';
       Core.event(s,'story',s.chatRuntime.scene,{origin:Adapt.WITNESS,actorId:p.actorId,location:'ruins',
        boundaryId:'riftglass_wardline',environment:'spatial-pressure',measuredIndividualHumanResponse:description,
        observedEnergyRegulation:description,actualMetabolicSupply:description,independentUnaidedBaseline:description,
        independentShearCountertest:description,recoveryObservation:description,noSpeciesConversion:true,noPortalAccess:true,
        cannotNegateExtremePressure:true});
       const exposure=Rules.act(s,{system:'rift',operation:'npcAdaptExposure',params:{actorId:p.actorId,witnessIndex:s.log.length-1,minutes:45}});
       A.equal(Local.verify(s,p),true);
       const after=Local.privateStatus(s,p);
       A.ok(after.observedSpatialPressureExposures>=0&&after.observedSpatialPressureExposures<=2);
       A.equal(after.earnedStep,after.observedSpatialPressureExposures===2?6:5);
      }
      const state=Local.privateStatus(s,p),opened=state.constructedPockets.find(x=>x.pocketId===pocketId);
      const beforeExpiry=E.exportGame(s),copy=E.importGame(beforeExpiry),cp=Realm.peek(copy).emergentPeople.people[p.id];
      A.equal(Local.verify(copy,cp),true);A.equal(Custody.verify(copy,cp),true);
      const t=copy.world.minutes;
      E.advance(copy,Math.max(1,opened.expiresAt-t));World.finalizeTime(copy,t);
      const expired=Local.privateStatus(copy,cp).constructedPockets.find(x=>x.pocketId===pocketId);
      A.equal(expired.active,false);A.equal(expired.expiredContentsInaccessible,true);
      A.deepEqual(expired.contents,opened.contents);
     }
    }

   }
   const saved=E.exportGame(s),copy=E.importGame(saved),cp=Realm.peek(copy).emergentPeople.people[p.id];
   A.equal(Local.verify(copy,cp),true);
   const bad=cp.originalRiftLocalSpatial.sessions[0];
   bad.source.after.step=9;bad.seal=require('node:crypto').createHash('sha256').update(JSON.stringify(bad.source)).digest('hex');
   A.equal(Local.verify(copy,cp),false);
   localSpatial=Local.privateStatus(s,p);
  }
 }
 reports.push({seed,localSpatial,originalRiftReading:!!p.originalRiftMeasuredSense?.successfulReading,
  firstSenseAttempts:p.originalRiftMeasuredSense?.attempts?.length||0,
  measuredAnchorChecks:accepted.length,axisGrowth:gained.length,
  axes:p.originalRiftExteriorAnchor?.axes||null,
  integrated:p.originalRiftExteriorAnchor?.integrated||false,
  actualFieldSurveys:camps.length,actualFullFieldNights:nights.length,
  physicalStaminaRemaining:body.stamina,
  originalNightResetCombatRecovers:earnedRecoverRenewals.length,
  originalAnchorCompleted:completed});
}
A.ok(originalSurveyChecks>=1,
 'One ordinary real long-running Riftglass explorer must actually choose original Survival surveying');
A.ok(acceptedNightCount>=1,
 'Real Riftglass safe overnight decisions should not be assumed; require naturally successful surveyed night in sample');
A.ok(acceptedAnchorChecks>=1,
 'A real long world must retain original independent Anchor II checks');
const checkpoint=E.exportGame(prime.s),copy=E.importGame(checkpoint),
 restored=Realm.peek(copy).emergentPeople.people[prime.p.id];
for(const source of [Early,Sense,Anchor,Field,Recover])
 A.equal(source.verify(copy,restored),true);
A.equal(Offscreen.verifyNights(copy,restored),true);
A.deepEqual(restored.originalRiftExteriorAnchor,prime.p.originalRiftExteriorAnchor);
console.log('ORIGINAL RIFT II LONG AUTONOMOUS SOURCE ASSESSMENT PASS: '+
 JSON.stringify({daysPerIndividual:720,individuals:reports.length,
  originalSurveyChecks,acceptedNightCount,
  sourceNightResetRecoverRenewals,
  acceptedAnchorChecks,originalSuccessfulAxes,trulyCompleted,reports}));
console.log(trulyCompleted?
 'AUTHENTIC ORIGINAL RIFT II formation exists: three axes and integrated field geometry, no vault Fold or teleport.':
 'Full Rift II formation NOT YET EARNED in this exact 14-life sample; the source-owning RNG, outdoor refuge, real rest and wound rules were never overridden.');
