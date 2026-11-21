'use strict';
// Real original encounter + independently generated human + two genuine
// personal choice streams; an authored disposable local discussion witness
// is not a predetermined agreement, contract or bond.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine'),R=require('../rules'),C=require('../rules/core'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Atlas=require('../world/atlas'),Person=require('../world/sapient-beast-persons'),
 Bridge=require('../rules/independent-sapient-proposal-discussions'),
 Foundation=require('../world/person-mechanical-foundations'),
 Arrangement=require('../rules/independent-sapient-arrangements'),Time=require('../rules/world');
const Pair=require('../rules/independent-original-bond-pair');
const Follow=require('../rules/independent-sapient-followup'),Presence=require('../world/person-presence');
const Route=require('../rules/independent-sapient-terrestrial-preflight'),TravelLaw=require('../rules/travel-shared-original-law');
const Terrestrial=require('../rules/independent-sapient-terrestrial-proposal');
const Journey=require('../rules/independent-sapient-terrestrial-journey');
const ReturnPreflight=require('../rules/independent-sapient-terrestrial-return-preflight');
const GradePreflight=require('../rules/independent-original-beast-grade-preflight');
const VisitorNight=require('../rules/independent-original-visitor-night-rest');
const VisitorBeastWelfare=require('../rules/independent-sapient-visitor-welfare');
const VisitorFoodTrade=require('../rules/independent-visitor-ration-trade');
const VisitorDiet=require('../rules/independent-visitor-sapient-diet-plan');
const LocalPurchases=require('../world/independent-local-purchases');
const GradeDiscussion=require('../rules/independent-original-grade-diagnostic-discussion');
const Career=require('../world/person-careers'),MerchantTerms=require('../world/merchant-voluntary-work-terms');
const VisitorProposal=require('../rules/independent-sapient-terrestrial-visitor-proposal');
A.deepEqual(TravelLaw.legSpec('crossing'),{minutes:75,stamina:4});
A.deepEqual(TravelLaw.legSpec('academy'),{minutes:75,stamina:4});
A.deepEqual(TravelLaw.legSpec('ruins'),{minutes:145,stamina:4});
const Interact=require('../rules/independent-original-bond-interactions'),Witness=require('../rules/bond-witness');
A.deepEqual(Witness.interactionSpec('gentle',16,0,true,0,3),{event:'gentle_treatment',minutes:15,dc:21,modifier:3});
const Bond=require('../rules/bonds'),Sync=require('../rules/bond-synchronisation');
const OriginalGrade=require('../rules/bond-grade'),
 IndependentGrade=require('../rules/independent-original-beast-grade-exam');
A.deepEqual(OriginalGrade.examSpec(3,16,0),{dc:18,modifier:3,feeTalons:1,feeScales:100,minutes:120,cooldownMinutes:8640});

A.deepEqual(Bond.contractSpec({grade:4,sapience:3,depth:'deep',will:2,contractLore:2,soulDB:3,soulPhase:3,usedCapacity:2}),{
 depth:'deep',load:4,capacity:7,usedCapacity:2,overCapacity:false,dc:20,modifier:7,stability:80,base:70,link:'10 km'});
A.equal(Bond.contractSpec({grade:9,sapience:3,depth:'covenant',will:0,usedCapacity:0}).overCapacity,true);
A.equal(Bond.syncReadiness(Bond.create({human:'h',beast:'b',start:'unfamiliar',sapience:3}),1).numericReady,false);
A.deepEqual(Sync.practiceSpec(1,16,1,35,2),{humanCost:3,fatigueCost:3,energyCost:0,minutes:30,dc:13,modifier:8});
A.deepEqual(Sync.practiceSpec(3,14,0,0,-1),{humanCost:5,fatigueCost:4,energyCost:2,minutes:40,dc:17,modifier:1});

const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
// Pure isolated original examination receipt-shape contract, not an
// earned examination or power in any game.
const isolatedBeast={species:'disposable_species',evolutionStage:'Base',individualGrade:'G3',
 gradeCalibration:{grade:3,worldMinute:80,source:'Disposable original prior individual calibration with provenance',
  species:'disposable_species',evolutionStage:'Base',individualGrade:'G3'},
 gradeExaminations:[{worldMinute:360,facility:'academy',outcome:'verified',
  check:{roll:18,dc:18,degree:'success'}}]};
const source='Individual Grade 3 verified at academy after d20 18 vs DC 18, against prior independent calibration: '+
 isolatedBeast.gradeCalibration.source;
const validExam={grade:3,worldMinute:360,origin:'observed-independent-grade-exam',
 facility:'academy',calibrationMinute:80,examCheck:{roll:18,dc:18},source,
 species:isolatedBeast.species,evolutionStage:isolatedBeast.evolutionStage,
 individualGrade:isolatedBeast.individualGrade};
A.equal(require('../rules/independent-original-bond-contract-law').gradeAt(isolatedBeast,validExam,360).grade,3);
A.equal(require('../rules/independent-original-bond-contract-law').gradeAt(isolatedBeast,{...validExam,source:'A fabricated Grade test'},360),null);
A.equal(require('../rules/independent-original-bond-contract-law').gradeAt({...isolatedBeast,gradeExaminations:[]},validExam,360),null);

const alternateSeed=process.env.BEASTBOUND_SAPIENT_SAMPLE_SEED;
const sampledSeed=alternateSeed===undefined?927801:Number(alternateSeed);
A.ok(Number.isSafeInteger(sampledSeed)&&sampledSeed>0&&sampledSeed<=4294967295);
const s=E.newGame({name:'Disposable independent sapient proposal',seed:sampledSeed,path:'undecided'});
A.equal(E.dispatch(s,'travel forest').ok,true);
let b=null;
for(let n=0;n<260&&!b;n++){
 A.equal(E.dispatch(s,'explore').ok,true);
 const candidate=s.beasts[s.encounter.beastId];
 if(E.SPECIES[candidate.species].intelligence==='sapient'&&!s.encounter.threat&&
  !/hostile|agitated|terrified|panicked|fleeing|desperate/i.test(candidate.mood)){
  const meet=R.act(s,{system:'social',operation:'meetSapientBeast',params:{}});
  if(meet.freelyEngaged){b=candidate;break;}
 }
 if(s.encounter)A.equal(E.dispatch(s,'leave').ok,true);
}
A.ok(b,'Real independently willing sapient encounter required');
A.ok(b.sapientLife.contactReceipts?.length,'An actual encounter produces an enduring original contact receipt');
// Disposable numeric cognition observation only; no pair decision or trust is assigned.
b.sapience=3;
const w=Realm.ensure(s),roster=People.ensure(w),site=s.world.location,
 region=Atlas.R[Atlas.LOCATION_REGION[site]],day=Math.floor(s.world.minutes/1440),
 contact=b.sapientLife.history.find(x=>x.type==='personally-witnessed-contact'&&x.willingness);
A.equal(People.siteFor(region.id),site);
// Disposable world demand fixture uses actual individual generator.
const eco=w.ecosystems[region.id],country=w.countries[region.polity];
Object.assign(eco,{quality:75,pressure:14,water:80,forage:80});
Object.assign(country,{prosperity:75,stability:80});
const demand=People.sourceDemand(w,region);
A.ok(demand);
let mutual=null,humanRefusal=0,beastRefusal=0,results=[],agreed=null,finalResults=[];
const pairCounts={recorded:0,declined:0};
for(let n=0;n<80;n++){
 const p=People._debug.make(w,roster,day,demand);p.shift=People.shift(p,day,w);
 const terms={beastId:b.id,id:'individual_proposal_'+n,kind:'voluntary habitat conversation',
  purpose:'An offer to explore possible cooperative habitat observations without committing either party.',
  humanDuty:'A proposed human contribution to be discussed before any real commitment or payment.',
  beastDuty:'A proposed contribution that the independent sapient individual may decline entirely.',
  protections:'Both parties retain ordinary welfare protections and the right not to participate.',
  termination:'Neither party is bound and each can end the discussion without a duty.',
  communication:'Supported local signs and clearly explained voluntary terms.',durationDays:7};
 C.event(s,'story',p.name+' considers the sapient person’s publicly offered habitat cooperation proposal in a locally witnessed conversation.',{
  origin:Bridge.WITNESS,actorId:p.actorId,beastId:b.id,location:site,
  minute:s.world.minutes,contactHash:hash(contact),terms,
  comprehension:'A concrete limited proposal was explained with visibly understood specific local signs.',
  communication:'Witnessed shared signs, not telepathy',
  noAssumedSharedLanguage:true,publicInvitationOnly:true});
 const req={actorId:p.actorId,beastId:b.id,witnessIndex:s.log.length-1},
  snapshot=E.exportGame(s),rng=s.rngState,clock=s.world.minutes,
  humanRng=p.rngState,beastRng=b.sapientLife.rngState;
 A.throws(()=>R.act(s,{system:'bond',operation:'npcSapientProposalDiscussion',
  params:{...req,accepted:true}}),/never assigned consent/);
 A.equal(E.exportGame(s),snapshot);
 const result=R.act(s,{system:'bond',operation:'npcSapientProposalDiscussion',params:req}),
  receipt=p.originalSapientProposalDiscussions[0],q=receipt.source;
 A.equal(Bridge.verify(s,p),true);
 A.equal(q.humanChoice.rngBefore,humanRng);
 A.equal(q.humanChoice.rngAfter,p.rngState);
 A.equal(q.beastChoice?.rngBefore??beastRng,beastRng);
 A.equal(q.beastChoice?.rngAfter??beastRng,b.sapientLife.rngState);
 A.equal(s.rngState,rng);A.equal(s.world.minutes,clock);
 A.equal(result.legalDutiesEstablished,false);
 A.equal(result.magicalBondEstablished,false);
 A.equal(s.table?.bondRecords?.[b.id],undefined);
 A.equal(s.player.partnerIds.includes(b.id),false);
 const saved=E.exportGame(s);
 A.throws(()=>R.act(s,{system:'bond',operation:'npcSapientProposalDiscussion',params:req}),
  /do not reroll willingness|fresh, voluntary, comprehended proposal/);
 A.equal(E.exportGame(s),saved);
 const view=Foundation.gmDossier(w,p.actorId,s).earnedEvidence.beastRelationships;
 A.equal(view.verifiedPartners,null);
 A.equal(view.sourceVerifiedProposalDiscussions[0].observedOutcome,result.observedOutcome);
 results.push(result.observedOutcome);
 if(result.mutuallyInterested){
  mutual=p;
  const finalTerms={...terms,kind:'revocable voluntary habitat cooperation',
   purpose:'Both independent participants voluntarily agree to a bounded habitat observation undertaking.',
   humanDuty:'The human offers their own observation notes while retaining the right to withdraw.',
   beastDuty:'The sapient person offers its own observations on terms it freely accepts without compelled labour.',
   termination:'Either person can withdraw; material performance and unsettled duties require separate evidence.'};
  C.event(s,'story',p.name+' considers the separately explained final terms, safeguards and right to refuse.',{
   origin:Arrangement.WITNESS,actorId:p.actorId,beastId:b.id,location:site,
   minute:s.world.minutes,contactHash:hash(contact),proposalHash:receipt.seal,terms:finalTerms,
   comprehension:'The two separate individuals have understood the specific final voluntary terms and duties.',
   communication:'Actual locally witnessed shared signs',
   rightToRefuse:'Both retain their independent right to refuse now and withdraw later without compelled service.',
   noAssumedSharedLanguage:true,noMagicalPromise:true});
  const params={actorId:p.actorId,beastId:b.id,witnessIndex:s.log.length-1},
   before=E.exportGame(s);
  A.throws(()=>R.act(s,{system:'bond',operation:'npcSapientArrangementAccept',
   params:{...params,accepted:true}}),/no assigned consent/);
  A.equal(E.exportGame(s),before);
  const resolved=R.act(s,{system:'bond',operation:'npcSapientArrangementAccept',params});
  const entry=p.originalSapientArrangements[0];
  A.equal(Arrangement.verify(s,p),true);
  A.equal(entry.source.proposalHash,receipt.seal);
  A.notEqual(entry.source.witnessHash,receipt.source.witnessHash);
  A.equal(resolved.mutuallyAccepted,entry.source.outcome==='accepted');
  A.equal(resolved.noMagicOwnershipOrCompelledService,true);
  A.equal(s.table?.bondRecords?.[b.id],undefined);
  finalResults.push(resolved.observedOutcome);
  const after=E.exportGame(s);
  A.throws(()=>R.act(s,{system:'bond',operation:'npcSapientArrangementAccept',params}),
   /already received|Separate current informed final terms|Real co-present willing persons/);
  A.equal(E.exportGame(s),after);
  if(resolved.mutuallyAccepted){
   agreed={p,entry};
   // Explicit disposable authored prior measurements ONLY. Recognition is a
   // separate real bilateral decision, not assigned by the fixture.
   C.event(s,'story',p.name+' and the sapient individual consider retaining their separately measured pair calibration without a contract.',{
    origin:Pair.WITNESS,actorId:p.actorId,beastId:b.id,location:site,
    arrangementHash:entry.seal,arrangementRevision:entry.seal,contactHash:hash(contact),
    measuredSapience:b.sapience,measuredCompatibility:5,measuredResonance:4,
    actualPriorBioSpiritualCalibration:'Disposable measured pair-specific biological and spiritual compatibility assessment.',
    actualPriorEnergyCalibration:'Disposable measured pair-specific energy resonance assessment.',
    independentlyUnderstoodTerms:'Both independently comprehend that this is only a record of prior measurements.',
    rightToDeclineRecord:'Either individual may decline retaining the record without losing any previously accepted social terms.',
    noAssignedAffectionOrWillingness:true,noMagicalContract:true});
   const request={actorId:p.actorId,beastId:b.id,witnessIndex:s.log.length-1},
    savedPair=E.exportGame(s),pc=s.rngState,pr=p.rngState,br=b.sapientLife.rngState;
   A.throws(()=>R.act(s,{system:'bond',operation:'npcPairRecord',params:{...request,trust:100}}),/no assigned affinity or consent/);
   A.equal(E.exportGame(s),savedPair);
   const out=R.act(s,{system:'bond',operation:'npcPairRecord',params:request}),row=p.originalBondPairRecognitions[0];
   A.equal(Pair.verify(s,p),true);A.equal(s.rngState,pc);
   A.equal(row.source.humanChoice.rngBefore,pr);
   A.equal(row.source.beastChoice?.rngBefore??br,br);
   A.equal(out.recorded,row.source.accepted);A.equal(s.table?.bondRecords?.[b.id],undefined);
   A.equal(s.player.partnerIds.includes(b.id),false);
   A.equal(Arrangement.privateStatus(s,p)[0].status,'accepted');
   const beforeRoute=E.exportGame(s),beforeHuman=p.rngState,beforeBeast=b.sapientLife.rngState;
   A.equal(Route.routeStatus(s,p,b,site).reason,'not-one-original-linked-leg');
   A.equal(Route.routeStatus(s,p,b,'academy').reason,'not-one-original-linked-leg');
   A.equal(Route.routeStatus(s,p,b,'crossing').reason,'original-encounter-or-combat-unresolved');
   A.equal(E.exportGame(s),beforeRoute,'A private travel proposal preflight may not manufacture movement, route choice or old combat condition');
   A.equal(p.rngState,beforeHuman);A.equal(b.sapientLife.rngState,beforeBeast);
   if(out.recorded){
    const travel=E.importGame(E.exportGame(s)),tw=Realm.peek(travel),
     traveler=tw.emergentPeople.people[p.id],companion=travel.beasts[b.id];
    if(travel.encounter)A.equal(E.dispatch(travel,'leave').ok,true);
    require('../rules/unified').ensurePlayer(travel);
    travel.chatRuntime||={};
    const actualWitness=traveler.name+' is presently witnessed uninjured, unarmed and unarmoured at the actual forest location, without an imposed travel agreement.';
    travel.chatRuntime.scene=actualWitness;
    let originalBodyLinked=false;
    try{
     R.act(travel,{system:'health',operation:'linkWitnessedHuman',
      params:{npcId:traveler.actorId,witness:actualWitness}});
     originalBodyLinked=true;
    }catch(error){
     if(!/original human stamina formula has no legal baseline/.test(String(error?.message)))throw error;
     A.equal(Route.routeStatus(travel,traveler,companion,'crossing').reason,
      'no-real-uninjured-source-linked-human-combat-body');
     A.equal(travel.table.combatants?.['npc_'+traveler.id],undefined);
     console.log('INDEPENDENT ORIGINAL LINKED TRAVEL REFUSED BY REAL PHYSICAL BASELINE '+JSON.stringify({
      originalHumanBodyNotLegallyEstablished:true,noInventedStaminaOrStat:true}));
    }
    if(originalBodyLinked){
    const before=E.exportGame(travel),humanRng=traveler.rngState,
      beastRng=companion.sapientLife.rngState;
    const route=Route.routeStatus(travel,traveler,companion,'crossing');
    const originalHumanBody=travel.table.combatants['npc_'+traveler.id];
    A.ok(originalHumanBody?.npcOrigin,'Original witnessed physically registered human is required');
    if(originalHumanBody.stamina<TravelLaw.legSpec('crossing').stamina){
     A.equal(route.proposalEligible,false,'The original 4-Stamina journey cannot be undertaken on unearned endurance');
     A.ok(['insufficient-original-human-stamina','original-combat-body-not-fit-for-journey'].includes(route.reason),
      'Zero original Stamina may first be rejected by the original wound owner, before the linked-leg cost check');
     console.log('INDEPENDENT ORIGINAL LINKED TRAVEL REFUSED BY ACTUAL STAMINA '+JSON.stringify({
      existingHumanStamina:originalHumanBody.stamina,required:4,noInventedBodyOrRest:true}));
    }else{
     A.equal(route.proposalEligible,true,'Original linked forest–crossing preflight requires genuine eligibility: '+JSON.stringify(route));
     A.equal(route.from,'forest');A.equal(route.to,'crossing');
     A.equal(route.minutes,75);A.equal(route.stamina,4);A.equal(route.crossesRegion,true);
     A.equal(route.requiresIndependentlyVerifiedArrivalAndNewLocationProof,true);
     console.log('INDEPENDENT ORIGINAL LINKED CROSS-REGION TRAVEL PREFLIGHT PASS '+JSON.stringify({
      from:route.from,to:route.to,minutes:route.minutes,stamina:route.stamina,
      noAssignedConsentOrMovement:true}));
    }
    A.equal(Route.routeStatus(travel,traveler,companion,'academy').reason,'not-one-original-linked-leg');
    A.equal(E.exportGame(travel),before,'Actual route preflight is private and purely read-only');
    A.equal(traveler.rngState,humanRng);A.equal(companion.sapientLife.rngState,beastRng);
    if(route.proposalEligible){
     const actualScene=traveler.name+' and '+companion.name+
      ' independently review the genuinely linked forest to crossing route while remaining physically in the forest.';
     travel.chatRuntime.scene=actualScene;
     C.event(travel,'story',actualScene,{
      origin:Terrestrial.WITNESS,actorId:traveler.actorId,beastId:companion.id,
      from:'forest',to:'crossing',arrangementSeal:entry.seal,
      recognisedPairSeal:row.seal,originalHumanCombatSeal:originalHumanBody.npcOrigin.seal,
      originalLinkedLegMinutes:75,originalHumanStaminaCost:4,
      separateInformedHumanAndBeastChoices:true,noCompelledDepartureOrReturn:true,
      noGuaranteedArrivingBeastOrHazardClearance:true,
      actualInformedDestinationAndPurpose:'Both understand the genuine canal crossing is one original linked route away from their current shared forest.',
      actualKnownRouteRisks:'The real route has ordinary fatigue, natural weather, possible hazards and no guaranteed safe arrival.',
      individualRightToDecline:'Both people can decline travel now or reconsider separately without losing their recognised relationship.',
      originalAvailableTravelMeans:'Existing ordinary terrestrial walking route, not any inferred flying transport, portal or compelled mount.'});
     const parameters={actorId:traveler.actorId,beastId:companion.id,
       destination:'crossing',witnessIndex:travel.log.length-1},
      beforeProposal=E.exportGame(travel),pastWorldRng=travel.rngState,
      beforeHumanRng=traveler.rngState,beforeBeastRng=companion.sapientLife.rngState,
      presentStamina=originalHumanBody.stamina,oldMinute=travel.world.minutes;
     A.throws(()=>R.act(travel,{system:'bond',operation:'npcTerrestrialProposal',
       params:{...parameters,accepted:true}}),/no chosen consent, cost or movement/);
     A.equal(E.exportGame(travel),beforeProposal);
     const chosen=R.act(travel,{system:'bond',operation:'npcTerrestrialProposal',
      params:parameters}),receipt=traveler.originalSapientTerrestrialProposals[0],
      source=receipt.source;
     A.equal(chosen.bothSeparatelyInterested,source.mutuallyInterested);
     A.equal(Terrestrial.verify(travel,traveler),true);
     A.equal(travel.rngState,pastWorldRng);A.equal(travel.world.minutes,oldMinute);
     A.equal(originalHumanBody.stamina,presentStamina);A.equal(traveler.regionId,p.regionId);
     A.equal(companion.location,site);A.equal(companion.owner,null);
     A.equal(travel.player.partnerIds.includes(companion.id),false);
     A.equal(source.humanChoice.rngBefore,beforeHumanRng);
     A.equal(source.beastChoice?.rngBefore??beforeBeastRng,beforeBeastRng);
     A.equal(Terrestrial.privateStatus(travel,traveler)[0].outcome,chosen.outcome);
     const chosenSave=E.exportGame(travel),saved=E.importGame(chosenSave),
      savedPerson=Realm.peek(saved).emergentPeople.people[traveler.id];
     A.equal(Terrestrial.verify(saved,savedPerson),true);
     A.throws(()=>R.act(travel,{system:'bond',operation:'npcTerrestrialProposal',params:parameters}),
      /Distinct explicitly witnessed original linked-leg proposal|real uninjured independently co-present/);
     A.equal(E.exportGame(travel),chosenSave);
     const f=E.importGame(chosenSave),fp=Realm.peek(f).emergentPeople.people[traveler.id],
      forged=fp.originalSapientTerrestrialProposals[0];
     forged.source.outcome=source.outcome==='human-refused'?'both-consider-leg':'human-refused';
     forged.seal=hash(forged.source);
     A.equal(Terrestrial.verify(f,fp),false,'A rehashed falsely agreed route proposal cannot produce consent');
     if(chosen.bothSeparatelyInterested){
      const js=E.importGame(chosenSave),jw=Realm.peek(js),
       jp=jw.emergentPeople.people[traveler.id],jb=js.beasts[companion.id],
       physicallyBefore=E.exportGame(js),initialHour=js.world.minutes,
       humanBody=js.table.combatants['npc_'+traveler.id],
       humanStamina=humanBody.stamina,worldRng=js.rngState,playerSite=js.world.location,
       originalVisitorDay=Math.floor(js.world.minutes/1440);
      const departureScene=jp.name+' and '+jb.name+' remain separately able to refuse, or to set out on their previously considered physical forest-to-crossing path.';
      js.chatRuntime||={};js.chatRuntime.scene=departureScene;
      C.event(js,'story',departureScene,{
       origin:Journey.WITNESS,actorId:jp.actorId,beastId:jb.id,
       proposalSeal:receipt.seal,from:'forest',to:'crossing',
       actualFreshDepartureDecision:true,noAssumedFutureConsentOrOwnedBeast:true,
       originalRouteMinutes:75,originalHumanStaminaCost:4,
       currentInformedDepartureAndReturnFreedom:'Either participant is free to remain in the forest, or to stop consenting to further linked legs or a future return.',
       originalRouteConditionsAndKnownHazards:'They have an original connected walking route and know travel may involve variable weather, fatigue and ordinary dangers.',
       actualIndividualBeastMovementAbility:'The sapient person is actually mobile and present, with no invented flight, portal, ownership or saddled transport.',
       noCompelledUnsafeWeatherOrHazardBypass:true});
      const actual={actorId:jp.actorId,beastId:jb.id,
       proposalSeal:receipt.seal,witnessIndex:js.log.length-1},
       beforeDeparture=E.exportGame(js);
      A.throws(()=>R.act(js,{system:'bond',operation:'npcTerrestrialJourney',
       params:{...actual,arrival:'academy'}}),/no chosen assent, arrival, stamina or location/);
      A.equal(E.exportGame(js),beforeDeparture);
      if(initialHour%1440+75>1440){
       A.throws(()=>R.act(js,{system:'bond',operation:'npcTerrestrialJourney',
        params:actual}),/finish within its own original calendar day/);
       A.equal(E.exportGame(js),beforeDeparture);
       console.log('INDEPENDENT ORIGINAL TERRESTRIAL TRAVEL DEFERRED BY REAL DAYLIGHT '+JSON.stringify({
        originalMinute:initialHour,requiredMinutes:75,noInventedOvernightPassage:true}));
      }else{
      const journey=R.act(js,{system:'bond',operation:'npcTerrestrialJourney',
       params:actual}),e=jp.originalSapientTerrestrialJourneys[0].source;
      A.equal(journey.departureConsent,e.departed);
      A.equal(Journey.verify(js,jp),true);
      A.equal(Person.verify(jb),true);
      A.equal(js.rngState,worldRng);
      A.equal(js.world.location,playerSite);
      A.equal(js.player.partnerIds.includes(jb.id),false);
      A.equal(journey.actualHumanStaminaPaid,e.departed?4:0);
      A.equal(js.world.minutes,initialHour+(e.departed?75:0));
      A.equal(humanBody.stamina,humanStamina-(e.departed?4:0));
      if(e.departed){
       A.equal(jb.location,'crossing');
       A.equal(Journey.position(jp,js.world.minutes).location,'crossing');
       A.equal(Presence.resolve(Realm.peek(js),jp.actorId,'forest',originalVisitorDay,js.world.minutes%1440),null);
       A.ok(Presence.resolve(Realm.peek(js),jp.actorId,'crossing',originalVisitorDay,js.world.minutes%1440)?.presence,
        'Actual independently visited crossing location is exclusively visible in source-backed individual presence');
       // This GM-private examination gate reads the actual independent
       // visitor's signed CROSSING presence, although the player remains in
       // the FOREST. A genuine arrival does not create a personal 100-Scale
       // fee, independent numeric calibration, examiner or either assent.
       const preGradeCopy=E.exportGame(js),
        gradeReady=R.act(js,{system:'bond',operation:'npcGradeReadiness',
         params:{actorId:jp.actorId,beastId:jb.id}});
       A.equal(gradeReady.privateToGM,true);
       A.equal(gradeReady.noMoneyTimeRngConsentOrGrade,true);
       A.equal(gradeReady.assessmentEligible,false);
       A.ok(!['no-real-accredited-original-facility-arrival',
        'absent-original-individual-visitor-presence',
        'no-real-safe-independent-sapient-at-facility'].includes(gradeReady.reason),
        'A real completed crossing visit cannot be confused with the player staying at the forest');
       A.equal(E.exportGame(js),preGradeCopy,
        'Read-only examination readiness never spends the original fee or draws consent');
       A.throws(()=>R.act(js,{system:'bond',operation:'npcGradeReadiness',
        params:{actorId:jp.actorId,beastId:jb.id,grade:9}}),
        /only actual actorId and beastId/);
       A.equal(E.exportGame(js),preGradeCopy);
       console.log('INDEPENDENT ORIGINAL REAL VISITOR GRADE READINESS '+JSON.stringify({
        realFacility:'crossing',playerRemains:js.world.location,
        eligible:gradeReady.assessmentEligible,reason:gradeReady.reason,
        noAutomaticGradeOrFee:true}));
       const diagWorld=E.importGame(E.exportGame(js)),
        diagPerson=Realm.peek(diagWorld).emergentPeople.people[jp.id],
        diagBeast=diagWorld.beasts[jb.id];
       // Actual first crossing arrival can support a fresh OPTIONAL
       // discussion, not an accredited assay or a future consent waiver.
       const diagScene=diagPerson.name+' and '+diagBeast.name+
        ' are separately deciding whether to ask about a possible future Grade diagnostic at the crossing; no actual examiner or measured method has yet been established.';
       C.event(diagWorld,'story',diagScene,{
        origin:GradeDiscussion.WITNESS,actorId:diagPerson.actorId,beastId:diagBeast.id,
        location:'crossing',minute:diagWorld.world.minutes,
        pairSeal:diagPerson.originalBondPairRecognitions.find(x=>
         x.source.accepted&&x.source.beastId===diagBeast.id)?.seal,
        arrangementHash:entry.seal,
        originalSignedVisitorHash:Journey.position(diagPerson,diagWorld.world.minutes).sourceHash,
        originalSapientLifeHash:diagBeast.sapientLife.sourceHash,
        explainedFutureMethodAndExamAreNotYetEstablished:
         'There is presently no verified individual measurement rubric, method or accredited specialist on offer.',
        separateUnconditionalRightToDecline:
         'Both participants can refuse discussing any future measurement without penalty or loss of their voluntary arrangement.',
        futureDiagnosticRequiresEntirelyFreshPermission:
         'A later specified assay or examination needs completely fresh informed consent by both people and its original costs and risks.',
        noGradeRubricOrMeasurementNow:true,noOwnerContractOrSync:true,privateToGM:true});
       const diaArgs={actorId:diagPerson.actorId,beastId:diagBeast.id,witnessIndex:diagWorld.log.length-1},
        diaBefore=E.exportGame(diagWorld),diaMinute=diagWorld.world.minutes,
        diaCoins=diagWorld.player.coins,diaWorldRng=diagWorld.rngState,
        diaHumanRng=diagPerson.rngState,diaBeastRng=diagBeast.sapientLife.rngState;
       A.throws(()=>R.act(diagWorld,{system:'bond',
        operation:'npcGradeDiagnosticDiscussion',
        params:{...diaArgs,grade:9}}),/no selected grade, interest, roll or assay/);
       A.equal(E.exportGame(diagWorld),diaBefore);
       const conversation=R.act(diagWorld,{system:'bond',
        operation:'npcGradeDiagnosticDiscussion',params:diaArgs});
       A.equal(conversation.privateToGM,true);
       A.equal(conversation.actualDiagnostic,null);
       A.equal(conversation.noCurrentOrFutureAssayConsent,true);
       A.equal(conversation.noGradeFeeOrTimeOrPartnership,true);
       A.equal(diagWorld.world.minutes,diaMinute);
       A.equal(diagWorld.player.coins,diaCoins);
       A.equal(diagWorld.rngState,diaWorldRng);
       A.notEqual(diagPerson.rngState,diaHumanRng,
        'The independent human owns a fresh original choice draw');
       A.equal(diagBeast.sapientLife.rngState!==diaBeastRng,
        diagPerson.originalIndependentGradeDiagnosticDiscussions[0].source.humanChoice.accepted,
        'The beast personal stream is used only when the human wishes to discuss');
       A.equal(GradeDiscussion.verify(diagWorld,diagPerson),true);
       A.equal(diagPerson.originalIndependentGradeDiagnosticDiscussions.length,1);
       A.equal(diagBeast.sapientLife.originalGradeDiagnosticDiscussions.length,1);
       A.equal(diagBeast.gradeCalibration,undefined);
       A.equal(diagBeast.contractGradeAssessment,undefined);
       const diaSave=E.exportGame(diagWorld),diaCopy=E.importGame(diaSave),
        diaPerson=Realm.peek(diaCopy).emergentPeople.people[diagPerson.id];
       A.equal(GradeDiscussion.verify(diaCopy,diaPerson),true);
       A.equal(E.exportGame(diaCopy),diaSave);
       const forgedDia=E.importGame(diaSave),
        fDiaP=Realm.peek(forgedDia).emergentPeople.people[diagPerson.id],
        fDiaRow=fDiaP.originalIndependentGradeDiagnosticDiscussions[0];
       fDiaRow.source.mutualInterest=!fDiaRow.source.mutualInterest;
       fDiaRow.seal=hash(fDiaRow.source);
       A.equal(GradeDiscussion.verify(forgedDia,fDiaP),false,
        'Rehashed fake interest fails the original participant choices and reciprocal beast archive');
       A.throws(()=>R.act(diagWorld,{system:'bond',
        operation:'npcGradeDiagnosticDiscussion',params:diaArgs}),
        /Fresh truthful individual discussion witness and unused pair day/);
       A.equal(E.exportGame(diagWorld),diaSave);
       console.log('INDEPENDENT ORIGINAL OPTIONAL GRADE DIAGNOSTIC DISCUSSION '+JSON.stringify({
        location:'crossing',outcome:conversation.outcome,
        mutuallyInterested:conversation.mutualInterest,
        bothIndividualRecords:true,noAssayNoGradeOrExamConsent:true}));
       // A distinctly witnessed real visiting adult may CHOOSE the
       // SAME original eight-hour human Combat night as an ordinary
       // local, without the player leaving the forest. The existing
       // travel/merchant sample is kept on its original independent fork.
       const nightWorld=E.importGame(E.exportGame(js)),
        nightPerson=Realm.peek(nightWorld).emergentPeople.people[jp.id],
        nightCombat=nightWorld.table.combatants['npc_'+jp.id],
        nightSite='crossing',nightStart=nightWorld.world.minutes;
       let evening=Math.floor(nightStart/1440)*1440+16*60+30;
       if(evening<nightStart)evening+=1440;
       E.advance(nightWorld,evening-nightStart);
       Time.finalizeTime(nightWorld,nightStart);
       const sleepVisit=Journey.position(nightPerson,nightWorld.world.minutes),
        sleepShift=Journey.visitorPresence(nightPerson,nightWorld.world.minutes,nightSite),
        roomScene=nightPerson.name+
         ' is directly seen entering an existing safe room at the original Morrowfen Crossing settlement for an optional eight-hour sleep, with no claimed payment or bed for the sapient companion.';
       nightWorld.chatRuntime||={};
       nightWorld.chatRuntime.scene=roomScene;
       C.event(nightWorld,'story',roomScene,{
        origin:VisitorNight.WITNESS,
        actorId:nightPerson.actorId,personOriginHash:nightPerson.originHash,
        site:nightSite,minute:nightWorld.world.minutes,
        originalArrivalSeal:sleepVisit.sourceHash,
        originalVisitorPresenceHash:sleepShift.hash,
        directlyWitnessedRoomAndSafeAccess:
         'The individual living human has just been physically observed using an actually accessible, secure ordinary room in this original settlement.',
        noAssumedPaymentOrPermission:
         'An independently witnessed actual room does not imply another person paid lodging, supplied medical treatment or consented to companionship.',
        notAGuaranteedInnOrFreeSupplies:true,noForcedHumanRestOrBeastRest:true});
       const nightArgs={actorId:nightPerson.actorId,
        witnessIndex:nightWorld.log.length-1},
        beforeNight=E.exportGame(nightWorld),
        humanBefore=nightPerson.rngState,
        staminaBeforeNight=nightCombat.stamina,
        woundsBeforeNight=[...nightCombat.wounds],
        playerBeforeNight=structuredClone(nightWorld.player),
        playerPositionBeforeNight=nightWorld.world.location;
       A.throws(()=>R.act(nightWorld,{system:'health',
        operation:'npcVisitorNightSleep',params:{...nightArgs,accepted:true}}),
        /no chosen rest, healing or venue/);
       A.equal(E.exportGame(nightWorld),beforeNight);
       const nightResult=R.act(nightWorld,{system:'health',
        operation:'npcVisitorNightSleep',params:nightArgs});
       A.equal(nightResult.privateToGM,true);
       A.equal(nightResult.actualVisitorSite,nightSite);
       A.equal(nightResult.noAssumedShelterContractBeastRestOrHealing,true);
       A.equal(nightResult.noSecondNightOrAutomaticHumanOrBeastPower,true);
       A.equal(nightPerson.rngState!==humanBefore,true);
       A.equal(nightResult.elapsedMinutes,nightResult.freelyAccepted?480:5);
       A.equal(nightWorld.world.minutes,evening+nightResult.elapsedMinutes);
       A.equal(nightWorld.world.location,playerPositionBeforeNight);
       // Original midnight world ticks can legitimately recover the PLAYER's
       // ordinary +5 daily Stamina; the remote sleeper never adds a second
       // recovery. Compare an IDENTICAL world-time-only progression.
       const noVisitorRest=E.importGame(beforeNight);
       E.advance(noVisitorRest,nightResult.elapsedMinutes);
       Time.finalizeTime(noVisitorRest,evening);
       A.deepEqual(nightWorld.player,noVisitorRest.player,
        'Remote human sleep does not change the player beyond the real original passing world time');
       A.equal(VisitorNight.verify(nightWorld,nightPerson),true);
       A.equal(Journey.verify(nightWorld,nightPerson),true);
       const privateNight=R.act(nightWorld,{system:'health',
        operation:'npcVisitorNightStatus',params:{actorId:nightPerson.actorId}});
       A.equal(privateNight.privateToGM,true);
       A.equal(privateNight.originalNightHistoryCount,1);
       A.equal(privateNight.lastOriginalNight.individuallyAccepted,nightResult.freelyAccepted);
       A.equal(privateNight.lastOriginalNight.site,'crossing');
       A.equal(privateNight.lastOriginalNight.originalHumanNightMinutes,
        nightResult.elapsedMinutes);
       A.equal(privateNight.noTimeOrRngOrWoundOrStaminaOrFeeChanged,true);
       A.equal(privateNight.noBeastSleepOrMedicalCareOrMagicGranted,true);
       A.equal(nightPerson.originalVisitorNightRestReceipts.length,1);
       A.equal(nightPerson.originalOvernightRestDecisions.length,1);
       A.equal(nightCombat.stamina,
        nightResult.freelyAccepted?nightCombat.maxStamina:staminaBeforeNight);
       A.equal(nightCombat.wounds[0],nightResult.freelyAccepted?
        Math.max(0,woundsBeforeNight[0]-1):woundsBeforeNight[0]);
       const nightSaved=E.exportGame(nightWorld),
        nightRestored=E.importGame(nightSaved),
        nightReloaded=Realm.peek(nightRestored).emergentPeople.people[jp.id];
       A.equal(VisitorNight.verify(nightRestored,nightReloaded),true);
       A.equal(Journey.verify(nightRestored,nightReloaded),true);
       A.equal(E.exportGame(nightRestored),nightSaved);
       const forgery=E.importGame(nightSaved),
        forgeryPerson=Realm.peek(forgery).emergentPeople.people[jp.id],
        forgedReceipt=forgeryPerson.originalVisitorNightRestReceipts[0];
       forgedReceipt.source.site='academy';forgedReceipt.seal=hash(forgedReceipt.source);
       A.equal(VisitorNight.verify(forgery,forgeryPerson),false,
        'A resealed false visitor room cannot count as the original physical night');
       console.log('INDEPENDENT ORIGINAL VISITOR ACTUAL SAFE ROOM AND COMBAT NIGHT '+JSON.stringify({
        realOriginArrival:true,freelyAccepted:nightResult.freelyAccepted,
        originalMinutes:nightResult.elapsedMinutes,
        preservedOriginalJourney:true,restoredHumanStamina:nightCombat.stamina,
        noUnverifiedInnCostBeastRestOrMagicalPower:true}));
       // An independently travelling sapient beast remains a PERSON.
       // Separate refuge and personal choice, never an inferred bed, meal,
       // or human-granted bodily permission. Run on a genuine arrived fork.
       const welfareWorld=E.importGame(E.exportGame(js)),
        welfarePerson=Realm.peek(welfareWorld).emergentPeople.people[jp.id],
        welfareBeast=welfareWorld.beasts[jb.id],
        welfareArrival=Journey.position(welfarePerson,welfareWorld.world.minutes);
       const priorWelfareMinute=welfareWorld.world.minutes;
       let welfareEvening=Math.floor(priorWelfareMinute/1440)*1440+16*60+30;
       if(welfareEvening<priorWelfareMinute)welfareEvening+=1440;
       E.advance(welfareWorld,welfareEvening-priorWelfareMinute);
       Time.finalizeTime(welfareWorld,priorWelfareMinute);
       const welfareShift=Journey.visitorPresence(welfarePerson,
        welfareWorld.world.minutes,'crossing');
       const welfareScene=welfarePerson.name+' and '+welfareBeast.name+
        ' are observed at the true crossing: the sapient individual separately considers resting in personally accessible safe sheltered cover, without a promised room, food, medicine or compulsory stay.';
       welfareWorld.chatRuntime||={};welfareWorld.chatRuntime.scene=welfareScene;
       C.event(welfareWorld,'story',welfareScene,{
        origin:VisitorBeastWelfare.WITNESS,actorId:welfarePerson.actorId,
        beastId:welfareBeast.id,humanOriginHash:welfarePerson.originHash,
        beastPersonSourceHash:welfareBeast.sapientLife.sourceHash,
        site:'crossing',minute:welfareWorld.world.minutes,
        physicalOriginalJourneySeal:Journey.position(welfarePerson,welfareWorld.world.minutes).sourceHash,
        physicalOriginalVisitorPresenceHash:welfareShift.hash,
        individualSafeRefugeObserved:
         'The original sapient individual is physically observed beside separate sheltered cover in the crossing area with legitimate safe personal access to pause.',
        beastPersonalFreedomAndCommunication:
         'The individual sapient being personally understands that this is an optional independent rest and may choose not to use this shelter.',
        noGuaranteeOfHumanOrBeastAccommodation:
         'This observed cover is not a provisioned room, approved veterinary station or evidence of accommodation rights for someone else.',
        noSpeciesDietOrFoodSourceInferred:true,
        noMedicalTreatmentOrMagicalBond:true,
        noHumanSleepOrCompelledBeastRest:true,
        privateToGM:true});
       const welfareArgs={actorId:welfarePerson.actorId,beastId:welfareBeast.id,
        witnessIndex:welfareWorld.log.length-1},
        priorBeastWelfare=welfareBeast.needs.fatigue,
        priorBeastFood=welfareBeast.needs.hunger,
        priorBeastRng=welfareBeast.sapientLife.rngState,
        priorHumanRng=welfarePerson.rngState,
        priorHumanStamina=welfareWorld.table.combatants['npc_'+welfarePerson.id].stamina,
        playerBeforeWelfare=structuredClone(welfareWorld.player),
        beforeWelfare=E.exportGame(welfareWorld);
       A.throws(()=>R.act(welfareWorld,{system:'bond',operation:'npcVisitorBeastRefuge',
        params:{...welfareArgs,freelyRested:true}}),
        /no caller choice, fatigue, care supplies or site/);
       A.equal(E.exportGame(welfareWorld),beforeWelfare);
       const beastRespite=R.act(welfareWorld,{system:'bond',
        operation:'npcVisitorBeastRefuge',params:welfareArgs});
       A.equal(beastRespite.privateToGM,true);
       A.equal(beastRespite.noHumanRestOrStaminaOrBeastFoodOrOtherTreatment,true);
       A.equal(beastRespite.noContractSyncGradeOrAssumedShelter,true);
       A.equal(beastRespite.elapsedMinutes,beastRespite.freelyRested?480:5);
       A.equal(welfareBeast.sapientLife.rngState!==priorBeastRng,true);
       A.equal(welfarePerson.rngState,priorHumanRng);
       A.equal(welfareWorld.table.combatants['npc_'+welfarePerson.id].stamina,
        priorHumanStamina);
       A.equal(welfareBeast.needs.fatigue,
        beastRespite.freelyRested?Math.max(0,priorBeastWelfare-8):priorBeastWelfare);
       A.equal(welfareBeast.needs.hunger,priorBeastFood);
       A.equal(VisitorBeastWelfare.verify(welfareWorld,welfarePerson),true);
       const welfareView=R.act(welfareWorld,{system:'bond',
        operation:'npcVisitorBeastWelfareStatus',
        params:{beastId:welfareBeast.id}});
       A.equal(welfareView.privateToGM,true);
       A.equal(welfareView.sourceHistoryCount,1);
       A.equal(welfareView.currentIndividualFatigue,welfareBeast.needs.fatigue);
       A.equal(welfareView.sourceVerifiedIndependentVisitorRestHistory[0].outcome,
        beastRespite.observedChoice);
       A.equal(welfareView.noNewChoicesOrTimeOrMedicalTreatmentOrNutritionOrGrade,true);
       A.equal(Person.verify(welfareBeast),true);
       A.equal(Journey.verify(welfareWorld,welfarePerson),true);
       A.equal(welfarePerson.originalSapientVisitorRefugeChoices.length,1);
       A.equal(welfareBeast.sapientLife.originalVisitorRefugeChoices.length,1);
       const worldTimeOnly=E.importGame(beforeWelfare);
       E.advance(worldTimeOnly,beastRespite.elapsedMinutes);
       Time.finalizeTime(worldTimeOnly,welfareEvening);
       A.deepEqual(welfareWorld.player,worldTimeOnly.player,
        'The visiting beast cannot grant human benefits except ordinary world-time effects');
       const welfareSave=E.exportGame(welfareWorld),
        welfareReload=E.importGame(welfareSave),
        restoredPerson=Realm.peek(welfareReload).emergentPeople.people[jp.id];
       A.equal(VisitorBeastWelfare.verify(welfareReload,restoredPerson),true);
       A.equal(E.exportGame(welfareReload),welfareSave);
       const welfareTamper=E.importGame(welfareSave),
        welfareTamperPerson=Realm.peek(welfareTamper).emergentPeople.people[jp.id],
        welfareRow=welfareTamperPerson.originalSapientVisitorRefugeChoices[0];
       welfareRow.source.accepted=!welfareRow.source.accepted;
       welfareRow.seal=hash(welfareRow.source);
       A.equal(VisitorBeastWelfare.verify(welfareTamper,welfareTamperPerson),false,
        'Even a resealed invented beast choice cannot replace the saved individual RNG proof');
       console.log('INDEPENDENT VISITING SAPIENT PERSONAL REFUGE '+JSON.stringify({
        trueArrival:welfareArrival.location,individualChoice:beastRespite.observedChoice,
        sourceFatigueReduction:beastRespite.sourceOwnedFatigueReduction,
        noAddedHumanBeastSocialContractOrFood:true}));
       // The ORIGINAL native Nightcorvid is canonically an omnivore,
       // but only the personally witnessed existing provisioner may give
       // THIS individual a one-serving plan, freely considered by both
       // independent people. A plan is not a free ration or feeding assent.
       const dietWorld=E.importGame(E.exportGame(js)),
        dietPerson=Realm.peek(dietWorld).emergentPeople.people[jp.id],
        dietBeast=dietWorld.beasts[jb.id],
        dietMinute=dietWorld.world.minutes,
        dietDay=Math.floor(dietMinute/1440);
       let dietServiceDay=dietDay*1440+12*60;
       if(dietServiceDay<dietMinute)dietServiceDay+=1440;
       E.advance(dietWorld,dietServiceDay-dietMinute);
       Time.finalizeTime(dietWorld,dietMinute);
       const dietAt=Journey.position(dietPerson,dietWorld.world.minutes),
        dietShift=Journey.visitorPresence(dietPerson,dietWorld.world.minutes,'crossing'),
        dietScene=dietPerson.name+' and '+dietBeast.name+
         ' are actually present with Orrin Vale at the existing crossing beast provisioner; he personally observes this actual sapient omnivore and explains a single documented one-ration serving as an optional future feeding plan, without selling or offering it now.';
       dietWorld.chatRuntime.scene=dietScene;
       C.event(dietWorld,'story',dietScene,{
        origin:VisitorDiet.WITNESS,actorId:dietPerson.actorId,
        beastId:dietBeast.id,
        humanOriginHash:dietPerson.originHash,
        beastPersonHash:dietBeast.sapientLife.sourceHash,
        site:'crossing',minute:dietWorld.world.minutes,
        originalJourneyArrivalSeal:dietAt.sourceHash,
        originalVisitorPresenceHash:dietShift.hash,
        originalSellerId:'otto',sellerName:'Orrin Vale',
        observedOriginalSpecies:dietBeast.species,
        originalSpeciesDiet:E.SPECIES[dietBeast.species].diet,
        originalCurrentForm:dietBeast.evolutionStage,
        exactObservedServingQuantity:1,
        originalCompatibleFood:'clean_rations',
        currentIndividualObservedServingAndSeparateRights:
         'The genuine original person and source-present beast provisioner observe this exact individual's form, omnivore biology and suitable single clean-ration serving, with no compulsory health or feeding intervention.',
        notAnExamOrPresumedMedicalTreatment:
         'This ordinary species-serving consultation is not a diagnostic medical examination, historical accredited Grade reading or forced bodily procedure.',
        followUpEatingRequiresNewConsentAndRealStock:
         'The human and sapient individual each retain a fresh independent right to refuse every later real owned ration, and no provisions are supplied today.',
        noAssumedGuaranteedFoodForAnySpecies:true,
        noNumericalGradeOrMedicalResult:true,
        privateToGM:true});
       const dietArgs={actorId:dietPerson.actorId,beastId:dietBeast.id,
        witnessIndex:dietWorld.log.length-1},
        dietBefore=E.exportGame(dietWorld),
        dietHumanRng=dietPerson.rngState,
        dietBeastRng=dietBeast.sapientLife.rngState,
        dietInitialHunger=dietBeast.needs.hunger;
       const dietPossible=R.act(dietWorld,{system:'bond',
        operation:'npcVisitorDietReadiness',params:{
         actorId:dietPerson.actorId,beastId:dietBeast.id}});
       A.equal(dietPossible.privateToGM,true);
       A.equal(dietPossible.actualCanonicalDiet,'omnivore');
       A.equal(dietPossible.actualSourceVisitorAndNamedProvisionerPresent,true);
       A.equal(E.exportGame(dietWorld),dietBefore);
       A.throws(()=>R.act(dietWorld,{system:'bond',
        operation:'npcVisitorDietDiscussion',
        params:{...dietArgs,quantity:9}}),
        /no caller diet, portion, plan or consent/);
       A.equal(E.exportGame(dietWorld),dietBefore);
       const chosenDiet=R.act(dietWorld,{system:'bond',
        operation:'npcVisitorDietDiscussion',params:dietArgs});
       A.equal(chosenDiet.privateToGM,true);
       A.equal(chosenDiet.noRationBoughtOrFedAndNoGradeOrContract,true);
       A.equal(dietWorld.world.minutes,dietServiceDay+VisitorDiet.MINUTES);
       A.equal(dietPerson.rngState!==dietHumanRng,true);
       A.equal(dietBeast.sapientLife.rngState!==dietBeastRng,
        dietPerson.originalSapientVisitorDietDiscussions[0].source.humanChoice.accepted);
       A.equal(dietBeast.needs.hunger,dietInitialHunger);
       A.equal(VisitorDiet.verify(dietWorld,dietPerson),true);
       A.equal(Person.verify(dietBeast),true);
       A.equal(Journey.verify(dietWorld,dietPerson),true);
       A.equal(chosenDiet.freelyBothAgreedToPlan,!!dietBeast.welfareCarePlan);
       if(chosenDiet.freelyBothAgreedToPlan){
        A.equal(VisitorDiet.planVerified(dietWorld,dietBeast,dietBeast.welfareCarePlan),true);
        const afterDiet=R.act(dietWorld,{system:'bond',
         operation:'npcVisitorFoodReadiness',params:{
          actorId:dietPerson.actorId,beastId:dietBeast.id}});
        A.equal(afterDiet.canOffer,false,
         'A documented diet plan never creates a real personally owned food portion');
        A.equal(afterDiet.reason,'no-personally-owned-genuine-original-ration');
        A.equal(VisitorDiet.planVerified(dietWorld,dietBeast,
         {...dietBeast.welfareCarePlan,quantity:9}),false,
         'A caller-increased ration amount is not the actual witnessed individual plan');
       }
       const dietSave=E.exportGame(dietWorld),
        restoredDiet=E.importGame(dietSave),
        restoredDietPerson=Realm.peek(restoredDiet).emergentPeople.people[jp.id];
       A.equal(VisitorDiet.verify(restoredDiet,restoredDietPerson),true);
       A.equal(E.exportGame(restoredDiet),dietSave);
       const falselyCertified=E.importGame(dietSave),
        falsifiedPerson=Realm.peek(falselyCertified).emergentPeople.people[jp.id],
        falsifiedPlan=falsifiedPerson.originalSapientVisitorDietDiscussions[0];
       falsifiedPlan.source.accepted=!falsifiedPlan.source.accepted;
       falsifiedPlan.seal=hash(falsifiedPlan.source);
       A.equal(VisitorDiet.verify(falselyCertified,falsifiedPerson),false,
        'A resealed forged individual nutrition consent fails source-person replay and reciprocal sapient records');
       // Independently establish physical nutrition on a disposable
       // TRUE arrived world: the PLAYER must actually walk the original
       // linked forest->crossing route, and only a real saved player ration
       // may be personally offered to the signed visiting human. The
       // human has a separate original custody RNG and may decline.
       // After that, a fresh TWO-PERSON food decision may still decline.
       // No successful gift, plan or eating decision is assigned by tests.
       if(chosenDiet.freelyBothAgreedToPlan){
        const giftWorld=E.importGame(dietSave),
         giftPerson=Realm.peek(giftWorld).emergentPeople.people[jp.id],
         giftBeast=giftWorld.beasts[jb.id],
         originalPlayerRations=giftWorld.player.inventory?.clean_rations??0;
        A.ok(originalPlayerRations>=1,
         'The actual original player already owns a ration; none is minted');
        A.equal(giftWorld.world.location,'forest');
        A.equal(E.dispatch(giftWorld,'travel crossing').ok,true,
         'The player must REALLY travel along an original physical route to give away their own ration');
        A.equal(giftWorld.world.location,'crossing');
        const originalNPCFood=Realm.peek(giftWorld).materialCustody?.
         accounts?.[giftPerson.actorId]?.held?.clean_rations??0,
         gift=R.act(giftWorld,{system:'social',operation:'materialHandoff',
          params:{npcId:giftPerson.actorId,item:'clean_rations'}});
        A.equal(gift.offered,true);
        A.equal(gift.noAutomaticRelationship,true);
        A.equal(gift.quantityMoved,gift.accepted?1:0);
        A.equal(giftWorld.player.inventory.clean_rations,
         originalPlayerRations-(gift.accepted?1:0));
        const giftAccount=Realm.peek(giftWorld).materialCustody?.
         accounts?.[giftPerson.actorId];
        A.equal(giftAccount?.held?.clean_rations??0,
         originalNPCFood+(gift.accepted?1:0));
        const beforeBeastOfferHunger=giftBeast.needs.hunger;
        const realFoodReady=R.act(giftWorld,{system:'bond',
         operation:'npcVisitorFoodReadiness',params:{
          actorId:giftPerson.actorId,beastId:giftBeast.id}});
        A.equal(realFoodReady.canOffer,gift.accepted,
         'Only a real source-accepted original player-to-human gift creates privately owned provisions');
        A.equal(realFoodReady.noPlayerInventoryOrWageOrMerchantStockOrBeastHungerChanged,true);
        if(gift.accepted){
         A.equal(realFoodReady.actualOwnedUnits,originalNPCFood+1);
         const giftFoodScene=giftPerson.name+' and '+giftBeast.name+
          ' are physically observed at the genuine crossing. The human independently considers offering one previously and voluntarily accepted original player-owned clean ration, and the sapient individual may freely refuse, counter or eat it.';
         giftWorld.chatRuntime.scene=giftFoodScene;
         const giftShift=Journey.visitorPresence(giftPerson,
          giftWorld.world.minutes,'crossing'),
          foodProfile=require('../rules/bond-care').feedingProfile(giftWorld,giftBeast);
         C.event(giftWorld,'story',giftFoodScene,{
          origin:require('../rules/independent-visitor-sapient-food-offer').WITNESS,
          actorId:giftPerson.actorId,beastId:giftBeast.id,
          humanOriginHash:giftPerson.originHash,
          beastPersonHash:giftBeast.sapientLife.sourceHash,
          site:'crossing',minute:giftWorld.world.minutes,
          originalSignedVisitHash:Journey.position(giftPerson,giftWorld.world.minutes).sourceHash,
          originalVisitorShiftHash:giftShift.hash,
          originalHeldRationBefore:giftAccount.held.clean_rations,
          originalSpeciesDietSource:foodProfile.source,
          understoodSeparateHumanOfferFreedom:
           'The human has this original one-unit owned ration and personally understands that offering it is optional even when the beast is hungry.',
          understoodSapientBeastChoiceFreedom:
           'The independent sapient individual can personally decline, counter or take this precisely observed compatible one-serving ration.',
          originalRationConsumptionOnlyIfBothAgree:
           'No original owned ration is consumed, transferred or applied to any hunger condition unless both separate persons choose acceptance.',
          noForcedFeedingOrBodilyConsent:true,
          noGrantOfTrustHealthEnergyOrSync:true,
          privateToGM:true});
         const foodArgs={actorId:giftPerson.actorId,beastId:giftBeast.id,
          witnessIndex:giftWorld.log.length-1},
          beforeFood=E.exportGame(giftWorld),
          humanRngBeforeGift=giftPerson.rngState,
          beastRngBeforeGift=giftBeast.sapientLife.rngState,
          ownedBeforeFood=giftAccount.held.clean_rations,
          foodMinute=giftWorld.world.minutes;
         A.throws(()=>R.act(giftWorld,{system:'bond',
          operation:'npcVisitorFoodOffer',params:{...foodArgs,accepted:true}}),
          /no chosen feeding or free food/);
         A.equal(E.exportGame(giftWorld),beforeFood);
         const foodEvent=R.act(giftWorld,{system:'bond',
          operation:'npcVisitorFoodOffer',params:foodArgs});
         A.equal(foodEvent.privateToGM,true);
         A.equal(foodEvent.originalEightMinutes,8);
         A.equal(foodEvent.noFreeFoodOrAutomaticPartnershipOrMagicOrMedicalTreatment,true);
         A.equal(giftPerson.rngState!==humanRngBeforeGift,true);
         A.equal(giftBeast.sapientLife.rngState!==beastRngBeforeGift,
          giftPerson.originalVisitorSapientFoodOffers[0].source.humanChoice.accepted);
         A.equal(giftWorld.world.minutes,foodMinute+8);
         A.equal(foodEvent.originalHumanRationsConsumed,
          foodEvent.personallyAccepted?1:0);
         A.equal(giftAccount.held.clean_rations??0,
          ownedBeforeFood-(foodEvent.personallyAccepted?1:0));
         A.equal(giftBeast.needs.hunger,
          Math.max(0,beforeBeastOfferHunger-
           (foodEvent.personallyAccepted?20:0)));
         A.equal(require('../rules/independent-visitor-sapient-food-offer').
          verify(giftWorld,giftPerson),true);
         A.equal(require('../rules/material-handoffs').
          validateAccount(giftAccount,giftPerson.actorId),undefined);
         A.equal(require('../world/independent-local-purchases').
          verify(Realm.peek(giftWorld)),true);
         A.equal(Person.verify(giftBeast),true);
         A.equal(Journey.verify(giftWorld,giftPerson),true);
         const savedGift=E.exportGame(giftWorld),
          restoredGift=E.importGame(savedGift),
          restoredGiftPerson=Realm.peek(restoredGift).emergentPeople.people[jp.id];
         A.equal(require('../rules/independent-visitor-sapient-food-offer').
          verify(restoredGift,restoredGiftPerson),true);
         A.equal(E.exportGame(restoredGift),savedGift);
         const fabricatedFeeding=E.importGame(savedGift),
          falseFoodPerson=Realm.peek(fabricatedFeeding).emergentPeople.people[jp.id],
          falseFoodRow=falseFoodPerson.originalVisitorSapientFoodOffers[0];
         falseFoodRow.source.accepted=!falseFoodRow.source.accepted;
         falseFoodRow.seal=hash(falseFoodRow.source);
         A.equal(require('../rules/independent-visitor-sapient-food-offer').
          verify(fabricatedFeeding,falseFoodPerson),false);
         console.log('ACTUAL PERSON-OWNED ORIGINAL VISITOR SAPIENT RATION HANDOFF '+JSON.stringify({
          originalPlayerRouteAndRation:true,
          humanFreelyAcceptedMaterialGift:gift.accepted,
          bothFreelyAcceptedLaterFood:foodEvent.personallyAccepted,
          realOwnedUnitsConsumed:foodEvent.originalHumanRationsConsumed,
          originalSapientHungerReduction:foodEvent.originalIndividualHungerReduced,
          noImaginaryMerchantDiscountOrNewFood:true}));
        }else{
         A.equal(giftBeast.needs.hunger,beforeBeastOfferHunger);
         console.log('REAL ORIGINAL PLAYER RATION GIFT DECLINED BY INDEPENDENT HUMAN');
        }
       }
       console.log('INDEPENDENT ORIGINAL INDIVIDUAL SAPIENT NUTRITION PLAN '+JSON.stringify({
        authenticSeller:'otto',actualNativeDiet:E.SPECIES[dietBeast.species].diet,
        independentlyAgreed:chosenDiet.freelyBothAgreedToPlan,
        noFreeRationOrEatingConsent:true}));
       // An original crossing arrival does not create food or
       // imply that the native sapient individual eats human rations.
       const noFoodBefore=E.exportGame(js),
        unprovided=R.act(js,{system:'bond',
         operation:'npcVisitorFoodReadiness',params:{
          actorId:jp.actorId,beastId:jb.id}});
       A.equal(unprovided.privateToGM,true);
       A.equal(unprovided.noPlayerInventoryOrWageOrMerchantStockOrBeastHungerChanged,true);
       A.equal(unprovided.independentHumanAndSapientChoicesRequired,true);
       A.equal(unprovided.canOffer,false,
        'Original visiting person does not automatically own a suitable ration or establish an individual diet plan');
       A.equal(E.exportGame(js),noFoodBefore);
       A.throws(()=>R.act(js,{system:'bond',
         operation:'npcVisitorFoodReadiness',params:{
          actorId:jp.actorId,beastId:jb.id,food:'clean_rations'}}),
         /Only two original individual identities, not chosen food or acceptance/);
       A.equal(E.exportGame(js),noFoodBefore);
       // A distinct real-world disposable visitor can DISCUSS a genuinely
       // funded market service with the original independent merchant.
       // Signed crossing arrival proves the worker is present without
       // rewriting their home polity, physical body or former career.
       // An authored duty is NOT employment, a successful roll or a wage;
       // both merchant and worker retain independent saved RNG decisions.
       const marketplace=E.importGame(E.exportGame(js)),
        priorMarketDay=Math.floor(marketplace.world.minutes/1440),
        nextOriginalTick=6*Math.ceil((priorMarketDay+1)/6);
       // The original merchant's confirmed service ledger uses a source-
       // consistent world tick, not a chosen fictional next-day employer.
       Time.advance(marketplace,nextOriginalTick-priorMarketDay);
       const mw=Realm.peek(marketplace),
        mp=mw.emergentPeople.people[jp.id],
        mb=marketplace.beasts[jb.id],
        merchant=mw.localProvisioner,
        marketDay=Math.floor(marketplace.world.minutes/1440),
        marketMinute=marketplace.world.minutes,
        marketArrival=Journey.position(mp,marketMinute),
        dutyId='visitor-trade-service-'+mp.id,
        merchantOfferId='visitor-merchant-service-'+mp.id,
        dutyRole='Independently witnessed real crossing stock-care service',
        dutyWitness=mp.name+' and '+merchant.seller+
         ' are actually present at the original crossing market; caring for finite physical provisions is proposed, not yet hired or performed.';
       A.equal(mw.lastTickDay,marketDay,
        'The existing merchant consent ledger must have reached the true original sixday market date');
       A.equal(marketArrival.location,'crossing');
       A.equal(mb.location,'crossing');
       A.equal(marketplace.world.location,playerSite);
       A.equal(mp.cashScales,0);
       const beforeBadVisitor=E.exportGame(marketplace);
       A.throws(()=>Career.authorDuty(mw,mp,{
        id:dutyId,role:dutyRole,method:'shop-stock-service',
        goal:'Witness real finite provisioner stock and identify storage handling risks',
        domain:'trade',day:marketDay,witness:dutyWitness,
        visitorSite:'crossing',
        visitorMinute:jp.originalSapientTerrestrialJourneys[0].source.arrivalMinute-1},marketplace),
        /Only a truly signed and presently situated individual visitor/);
       A.equal(E.exportGame(marketplace),beforeBadVisitor);
       const addedDuty=Career.authorDuty(mw,mp,{
        id:dutyId,role:dutyRole,method:'shop-stock-service',
        goal:'Witness real finite provisioner stock and identify storage handling risks',
        domain:'trade',day:marketDay,witness:dutyWitness,
        visitorSite:'crossing',visitorMinute:marketMinute},marketplace);
       A.equal(addedDuty.available,true);
       A.equal(Career.verify(mp),true);
       A.equal(mp.regionId,jp.regionId,
        'Foreign merchant work cannot rewrite the individual home region');
       A.equal(mp.cashScales,0);
       const proposal={id:merchantOfferId,day:marketDay,
        dutyId,scope:dutyRole+
         ' preserving the existing seller stock without implied ownership or guaranteed wages.',
        throughDay:marketDay+2,amountScales:137,
        witness:merchant.seller+' and '+mp.name+
         ' are both here at the original crossing market discussing a finite genuine stock-care service that either may refuse.'};
       const beforeTerms=E.exportGame(marketplace),
        merchantRng=merchant.serviceTermsRngState,
        visitorRng=mp.rngState,
        negotiated=MerchantTerms.negotiate(mw,mp,proposal);
       A.equal(negotiated.offered,true);
       A.equal(negotiated.noFundsTransferred,true);
       A.equal(negotiated.noWorkCredited,true);
       A.equal(negotiated.noGuaranteedOutcome,true);
       A.equal(negotiated.accepted,
        negotiated.merchantAccepted&&negotiated.workerAccepted);
       A.equal(mp.cashScales,0);
       A.equal(Career.verify(mp),true);
       A.equal(MerchantTerms.verify(mw),true);
       A.equal(marketplace.world.minutes,marketMinute);
       A.equal(marketplace.world.location,playerSite);
       A.equal(mb.location,'crossing');
       A.equal(mw.localProvisioner.fundsScales,merchant.fundsScales);
       A.equal(GradePreflight.routeStatus(marketplace,mp,mb).assessmentEligible,false);
       A.equal(E.exportGame(E.importGame(E.exportGame(marketplace))),
        E.exportGame(marketplace));
       const forged=E.importGame(E.exportGame(marketplace));
       const fakeWorker=Realm.peek(forged).emergentPeople.people[mp.id];
       fakeWorker.career.authoredDuties.at(-1).source.visitorArrivalSeal='f'.repeat(64);
       fakeWorker.career.authoredDuties.at(-1).sourceHash=
        hash(fakeWorker.career.authoredDuties.at(-1).source);
       A.equal(Career.verify(fakeWorker),false,
        'Re-sealing an invented visitor arrival cannot authorize foreign market employment');
       console.log('INDEPENDENT ORIGINAL VISITOR MERCHANT WORK TERMS '+JSON.stringify({
        reachedActualMarket:true,merchantAccepted:negotiated.merchantAccepted,
        visitorAccepted:negotiated.workerAccepted,mutuallyAccepted:negotiated.accepted,
        homeRegionPreserved:true,merchantFundsNotMinted:true,
        wagePaid:0,notYetPerformedWork:true,noAutomaticGrade:true}));
       // Each accepted deal still needs a genuinely new worker-owned
       // decision to DO the particular already agreed real stock-care job.
       // A work choice is not a chosen d20 success; a completed check
       // is not money. Its original source receipt must be paid only if
       // genuinely successful, by the same existing merchant.
       const earning=E.importGame(E.exportGame(marketplace)),
        earnedWorld=Realm.peek(earning),earnedWorker=earnedWorld.emergentPeople.people[mp.id],
        earnedBeast=earning.beasts[mb.id],earnedSeller=earnedWorld.localProvisioner;
       let paidVisitor=false;
       let originalOffer=negotiated;
       let currentAgreementId=merchantOfferId;
       for(let offerIndex=0;offerIndex<8;offerIndex++){
        if(offerIndex>0){
         const currentDay=Math.floor(earning.world.minutes/1440),
          nextRealMerchantTick=6*Math.ceil((currentDay+1)/6);
         Time.advance(earning,nextRealMerchantTick-currentDay);
         const newDay=Math.floor(earning.world.minutes/1440);
         A.equal(earnedWorld.lastTickDay,newDay);
         if(!Journey.position(earnedWorker,earning.world.minutes)?.arrived||
          Journey.position(earnedWorker,earning.world.minutes).location!=='crossing'||
          earnedSeller.fundsScales<137){
          console.log('INDEPENDENT ORIGINAL VISITOR MERCHANT SERVICE DEFERRED '+JSON.stringify({
           reason:'actual-visitor-left-or-real-merchant-no-longer-funded',unforced:true}));
          break;
         }
         currentAgreementId=merchantOfferId+'-day-'+newDay;
         const fresh={...proposal,id:currentAgreementId,day:newDay,
          throughDay:newDay+2,witness:earnedSeller.seller+' and '+earnedWorker.name+
          ' genuinely reconsider separate fresh visitor stock-service terms on an actual later market sixday, free to decline without pay.'};
         originalOffer=MerchantTerms.negotiate(earnedWorld,earnedWorker,fresh);
         A.equal(MerchantTerms.verify(earnedWorld),true);
         A.equal(earnedWorker.cashScales,0,'No late offer may assign physical merchant cash');
         console.log('INDEPENDENT ORIGINAL VISITOR LATER MERCHANT OFFER '+JSON.stringify({
          offerIndex,day:newDay,merchantAccepted:originalOffer.merchantAccepted,
          workerAccepted:originalOffer.workerAccepted,
          mutuallyAccepted:originalOffer.accepted,noForcedEmployment:true}));
        }
        if(!originalOffer.accepted)continue;
        // This agreement is valid over a bounded original multi-day window,
        // NOT compulsory labour on the day it was signed. Every later
        // opportunity advances actual global time and draws the SAME
        // independent person's next unassigned work choice only ONCE per
        // actual day. A closed market never causes a fake work roll.
        const merchantTerm=earnedSeller.serviceTerms.find(x=>x.id===currentAgreementId);
        for(let workDayIndex=0;workDayIndex<3;workDayIndex++){
         if(workDayIndex>0){
          const prior=earning.world.minutes,
           dayNow=Math.floor(prior/1440),
           nextOpen=(dayNow+1)*1440+9*60;
          if(dayNow+1>merchantTerm.source.throughDay)break;
          E.advance(earning,nextOpen-prior);
          Time.finalizeTime(earning,prior);
          A.equal(earning.world.minutes,nextOpen);
          A.equal(earnedWorker.cashScales,0,
           'A later real market day has no gifted wage or stamina recovery');
          A.equal(earnedBeast.location,'crossing');
         }
        const action={actorId:earnedWorker.actorId,agreementId:currentAgreementId},
         beforeDoing=E.exportGame(earning),
         workReadiness=R.act(earning,{system:'bond',operation:'npcVisitorMerchantReadiness',
          params:action}),beforeCoins=earning.player.coins,
         beforeSeller=earnedSeller.fundsScales,workerBefore=earnedWorker.cashScales;
        A.equal(workReadiness.noWorkDecisionOrOriginalRollOrFeeOrClock,true);
        A.equal(E.exportGame(earning),beforeDoing,
         'Checking source market hours, physical visitor and individual health cannot change the game');
        if(!workReadiness.eligible){
         console.log('INDEPENDENT ORIGINAL VISITOR WORK LEGAL DEFERRED '+JSON.stringify({
          reason:workReadiness.reason,
          noCompelledWorkOrMoney:true}));
         continue;
        }
        A.throws(()=>R.act(earning,{system:'bond',operation:'npcVisitorMerchantWork',
         params:{...action,success:true}}),
         /only their original accepted current market-service agreement/);
        A.equal(E.exportGame(earning),beforeDoing,'The engine must reject chosen visitor-work success before rolling');
        const workerDecision=R.act(earning,{system:'bond',
         operation:'npcVisitorMerchantWork',params:action}),
         actualRow=earnedSeller.serviceTerms.find(x=>x.id===currentAgreementId),
         effort=actualRow.visitorAttempts?.at(-1);
        A.ok(effort,'One original source-sealed independent worker choice must be recorded');
        A.equal(!!effort.source.accepted,workerDecision.independentlyAcceptedWork);
        A.equal(workerDecision.workAttempted,!!effort.source.work);
        A.equal(earnedSeller.fundsScales,beforeSeller);
        A.equal(earnedWorker.cashScales,workerBefore);
        A.equal(earning.player.coins,beforeCoins);
        A.equal(Career.verify(earnedWorker),true);
        A.equal(MerchantTerms.verify(earnedWorld),true);
        A.equal(Journey.verify(earning,earnedWorker),true);
        A.equal(E.exportGame(E.importGame(E.exportGame(earning))),
         E.exportGame(earning));
        console.log('INDEPENDENT ORIGINAL VISITOR WORK CHOICE '+JSON.stringify({
         independentlyAccepted:workerDecision.independentlyAcceptedWork,
         realWorkRoll:workerDecision.workAttempted,
         realWorkSuccess:workerDecision.workSuccess,
         noCompelledPerformance:true,noPrematureWages:true}));
        if(!workerDecision.workSuccess)continue;
        const payRequest={actorId:earnedWorker.actorId,
         agreementId:currentAgreementId,workHash:workerDecision.workHash},
         beforePay=E.exportGame(earning);
        A.throws(()=>R.act(earning,{system:'bond',
         operation:'npcVisitorMerchantSettle',params:{...payRequest,amountScales:99999}}),
         /not a chosen amount or success/);
        A.equal(E.exportGame(earning),beforePay);
        const payment=R.act(earning,{system:'bond',
         operation:'npcVisitorMerchantSettle',params:payRequest});
        A.equal(payment.paidScales,137);
        A.equal(earnedWorker.cashScales,workerBefore+137);
        A.equal(earnedSeller.fundsScales,beforeSeller-137);
        A.equal(earnedWorker.cashScales+earnedSeller.fundsScales,
         workerBefore+beforeSeller,'Original 137 Scales changed owners exactly once');
        // A legitimately paid crossing visitor must still meet the
        // existing original market's independently quoted FOOD price.
        // A 137-Scale wage is not a licence to invent 800+ Scales or food.
        const savedBeforeRations=E.exportGame(earning),
         foodReadiness=R.act(earning,{system:'bond',
          operation:'npcVisitorRationReadiness',params:{
           actorId:earnedWorker.actorId,beastId:earnedBeast.id}});
        A.equal(foodReadiness.privateToGM,true);
        A.equal(foodReadiness.noPurchaseOrAnimalFeedingOrFundsCreated,true);
        A.equal(E.exportGame(earning),savedBeforeRations);
        A.throws(()=>R.act(earning,{system:'bond',
         operation:'npcVisitorRationReadiness',params:{
          actorId:earnedWorker.actorId,beastId:earnedBeast.id,priceScales:1}}),
         /no chosen price, funds, grade, outcome or inventory/);
        A.equal(E.exportGame(earning),savedBeforeRations);
        A.equal(LocalPurchases.verify(Realm.peek(earning)),true);
        if(foodReadiness.reason==='insufficient-actual-individually-earned-scales'){
         A.ok(foodReadiness.priceScales>earnedWorker.cashScales,
          'The real existing original price may exceed a legitimately earned wage');
         A.equal(foodReadiness.canOffer,false);
        }
        console.log('INDEPENDENT ORIGINAL VISITOR REAL FUNDED FOOD MARKET PREFLIGHT '+JSON.stringify({
         currentRealBuyerScales:earnedWorker.cashScales,
         actualOriginalSellerQuoteScales:foodReadiness.priceScales??null,
         canActuallyPay:foodReadiness.canOffer,
         noFakeFreeFoodOrFunds:true}));
        const beforeGradeFunding=E.exportGame(earning),
         actualSourceFunding=R.act(earning,{system:'bond',
          operation:'npcGradeFunding',
          params:{actorId:earnedWorker.actorId,beastId:earnedBeast.id}});
        A.equal(actualSourceFunding.privateToGM,true);
        A.equal(actualSourceFunding.sourceFinancialHistoryVerified,true);
        A.equal(actualSourceFunding.individuallyFunded,true);
        A.equal(actualSourceFunding.originalPersonalBalanceScales,137);
        A.equal(actualSourceFunding.genuineSourcePaidMerchantWagesScales,137);
        A.equal(actualSourceFunding.originalWageReceipts.length,1);
        A.equal(actualSourceFunding.actualOriginalAccreditedFacilityPresence,true);
        A.equal(actualSourceFunding.originalGradeReadinessCurrentlyEligible,false);
        A.equal(actualSourceFunding.numericGradeNotInferredFromWageOrRarity,true);
        const evidence=R.act(earning,{system:'bond',
         operation:'npcGradeSpecimenEvidence',
         params:{actorId:earnedWorker.actorId,beastId:earnedBeast.id}});
        A.equal(evidence.privateToGM,true);
        A.equal(evidence.sourceSpecimenFactsKnown,true);
        A.equal(evidence.site,'crossing');
        A.equal(evidence.originalIndividualSapientPersonHash,earnedBeast.sapientLife.sourceHash);
        A.equal(evidence.currentEngineFactsOnly.beastId,earnedBeast.id);
        A.equal(evidence.currentEngineFactsOnly.species,earnedBeast.species);
        A.equal(evidence.currentEngineFactsOnly.evolutionStage,earnedBeast.evolutionStage);
        A.equal(evidence.currentEngineFactsOnly.hpMaximum,earnedBeast.maxHp);
        A.equal(evidence.currentEngineFactsOnly.energyMaximum,earnedBeast.maxEnergy);
        A.equal(evidence.notAnAccreditedPhysicalMeasurement,true);
        A.equal(evidence.noNumericalGradeRubricOrCertification,true);
        A.equal(evidence.noDiagnosticAssentOrValidatedIndividualNumericGrade,true);
        A.equal(evidence.noTimeFeeRngConsentOrPartnershipChanged,true);
        A.equal(E.exportGame(earning),beforeGradeFunding,
         'Original individual bodily source inventory cannot spend or award anything');
        A.throws(()=>R.act(earning,{system:'bond',
         operation:'npcGradeSpecimenEvidence',
         params:{actorId:earnedWorker.actorId,beastId:earnedBeast.id,grade:9}}),
         /no chosen readings, numeric Grade, outcome, or examiner/);
        const falseGradeBeast=structuredClone(earnedBeast);
        falseGradeBeast.gradeCalibration={grade:9,worldMinute:earning.world.minutes-1,
         species:falseGradeBeast.species,
         evolutionStage:falseGradeBeast.evolutionStage,
         individualGrade:falseGradeBeast.individualGrade,
         source:'Fabricated original Grade IX numerical specimen reading without accredited method'};
        A.throws(()=>OriginalGrade.gradeReference(earning,falseGradeBeast),
         /verified original individual measurement and accredited rubric/,
         'A convincing numeric source string must never certify a real sapient Grade');
        A.equal(E.exportGame(earning),beforeGradeFunding,
         'A fabricated numerical calibration rejected without changes to real live worlds');
        const assaySite=R.act(earning,{system:'bond',
         operation:'npcGradeCalibrationReadiness',
         params:{actorId:earnedWorker.actorId,beastId:earnedBeast.id}});
        A.equal(assaySite.privateToGM,true);
        // Paid work proves funds and presence, NOT a still-current voluntary
        // relationship. The original agreement may have expired before the
        // worker earned their first 137 Scales. That legitimate refusal
        // cannot be overcome by a new assay-readiness convenience route.
        A.equal(typeof assaySite.calibrationSiteEligible,'boolean');
        if(assaySite.calibrationSiteEligible){
         A.equal(assaySite.site,'crossing');
         A.equal(assaySite.genuinePriorCalibrationStillMissing,true);
        }else{
         A.ok(['no-current-mutually-revocable-examination-relationship',
          'no-pre-established-numeric-individual-grade-calibration'].includes(assaySite.reason),
          'An assay-site refusal must retain the actual relationship or prior-calibration source: '+assaySite.reason);
        }
        A.equal(assaySite.noNumericGradeOrAssayCreated,true);
        A.equal(assaySite.noTimeRngFeeOrConsentSpent,true);
        A.equal(assaySite.requiresSeparateActualIndividualAssaySource,true);
        A.equal(assaySite.requiresIndependentInformedHumanAndSapientAssayChoice,true);
        A.equal(E.exportGame(earning),beforeGradeFunding,
         'An assay-site preflight must never invent the individual numerical Grade');
        A.throws(()=>R.act(earning,{system:'bond',
         operation:'npcGradeCalibrationReadiness',
         params:{actorId:earnedWorker.actorId,beastId:earnedBeast.id,grade:9}}),
         /no caller Grade, assay result, fee, or consent/);
        A.equal(E.exportGame(earning),beforeGradeFunding);
        A.equal(actualSourceFunding.noFeeDebitedOrGradeAssignedOrExamChoice,true);
        A.equal(E.exportGame(earning),beforeGradeFunding,
         'Original independently earned Grade funding inspection must not spend time, source Scales or RNG');
        A.throws(()=>R.act(earning,{system:'bond',
         operation:'npcGradeFunding',
         params:{actorId:earnedWorker.actorId,beastId:earnedBeast.id,grade:9}}),
         /no chosen Grade, money, exam success or consent/);
        A.equal(E.exportGame(earning),beforeGradeFunding);
        console.log('INDEPENDENT ORIGINAL ACTUAL EARNED GRADE FEE FUNDING '+JSON.stringify({
         individuallyEarnedScales:actualSourceFunding.originalPersonalBalanceScales,
         originalMerchantPaidScales:actualSourceFunding.genuineSourcePaidMerchantWagesScales,
         individualRealWageReceipts:actualSourceFunding.originalWageReceipts.length,
         actualJointFacility:actualSourceFunding.actualOriginalAccreditedFacilityPresence,
         numericGradeStillUnestablished:!earnedBeast.gradeCalibration,
         noExamOrContractOrForcedAssent:true}));
        A.equal(earning.player.coins,beforeCoins);
        A.equal(MerchantTerms.verify(earnedWorld),true);
        A.equal(Career.verify(earnedWorker),true);
        A.equal(GradePreflight.routeStatus(earning,earnedWorker,earnedBeast).assessmentEligible,false,
         'Real earned Grade-fee money cannot create an earlier individual numerical calibration or exam consent');
        const afterPayment=E.exportGame(earning);
        A.throws(()=>R.act(earning,{system:'bond',
         operation:'npcVisitorMerchantSettle',params:payRequest}),
         /Only one authentic|real visiting worker|settled|previously|genuine/i);
        A.equal(E.exportGame(earning),afterPayment,
         'Duplicate visitor merchant payment may not debit the same real owner twice');
        const restored=E.importGame(afterPayment),
         restoredWorld=Realm.peek(restored),restoredWorker=restoredWorld.emergentPeople.people[earnedWorker.id];
        A.equal(Career.verify(restoredWorker),true);
        A.equal(MerchantTerms.verify(restoredWorld),true);
        A.equal(Journey.verify(restored,restoredWorker),true);
        A.equal(E.exportGame(restored),afterPayment);
        restoredWorker.cashScales++;
        A.equal(Career.verify(restoredWorker),false,'The original worker cannot invent one Scale after a verified payout');
        paidVisitor=true;
        console.log('INDEPENDENT ORIGINAL VISITOR REAL FUNDED MERCHANT WAGE '+JSON.stringify({
         workerPersonallyEarnedScales:137,sellerPersonallySpentScales:137,
         sameOriginalWorkHash:workerDecision.workHash,
         actualIndependentChoice:true,actualOriginalSuccessfulD20:true,
         noPlayerPurseChange:true,stillNoIndividualNumericGradeOrExam:true}));
        break;
        } // End separate real per-day work choices for this one voluntary term.
        if(paidVisitor)break;
       }
       if(!paidVisitor)
        console.log('INDEPENDENT ORIGINAL VISITOR NO FUNDED WAGE '+JSON.stringify({
         authenticRejectionsAndFailedWork:true,
         notFabricating100ScalesOrAnExam:true}));



       A.equal(Journey.awayDuring(jp,initialHour,js.world.minutes),true);
       A.equal(js.table.combatants['npc_'+traveler.id].npcOrigin.location,'forest',
        'Original combat source entry never falsely claims it was created at the destination');
       // A return-leg preflight reads the REAL visitor's crossing position,
       // never the player's unchanged forest location. No second consent,
       // return receipt, time cost or movement is manufactured by inspection.
       const beforeReturn=E.exportGame(js),
        homeward=ReturnPreflight.routeStatus(js,jp,jb,'forest');
       A.equal(homeward.noMovementOrConsentOrGrade,true);
       A.equal(ReturnPreflight.routeStatus(js,jp,jb,'ruins').reason,
        'not-one-original-linked-leg','No fictional direct crossing-to-ruins exit');
       A.equal(E.exportGame(js),beforeReturn,'No eligibility inspection may roll, replenish, relocate or consent');
       if(homeward.proposalEligible){
        A.equal(homeward.from,'crossing');
        A.equal(homeward.to,'forest');
        A.equal(homeward.minutes,75);
        A.equal(homeward.stamina,4);
        A.equal(homeward.sourceArrivalHash,jp.originalSapientTerrestrialJourneys[0].seal);
        A.equal(homeward.requiresNewSeparateWitnessAndIndependentDecisions,true);
        // Genuine independently arrived visitor, original physically open
        // crossing→forest edge, existing social terms. A NEW source-witnessed
        // route proposal draws TWO new individual choices; older forest
        // choices and first departure never carry over. Neither party is
        // told by the test what to decide.
        const visitorScene=jp.name+' and '+jb.name+
         ' separately consider whether to travel from their real crossing visit to the original linked forest and may each refuse.';
        js.chatRuntime.scene=visitorScene;
        C.event(js,'story',visitorScene,{
         origin:VisitorProposal.WITNESS,actorId:jp.actorId,beastId:jb.id,
         arrivalSeal:homeward.sourceArrivalHash,from:'crossing',to:'forest',
         arrangementSeal:entry.seal,pairSeal:row.seal,
         combatSeal:humanBody.npcOrigin.seal,
         originalLinkedMinutes:75,originalHumanStamina:4,
         separateNewHumanAndSapientChoices:true,
         noInheritedReturnConsentOrGuaranteedJourney:true,
         actualVisitorSitePurposeAndDestination:'Both actually consider the source-linked forest from their verified canal crossing visit, with no commitment to return.',
         currentRouteRisksAndWeather:'The original connected forest path is physical and may have weather, fatigue, encounters or delayed passage.',
         freshRightOfEachPersonToRefuse:'Either independent person may refuse the trip now or decline any separate eventual departure.',
         originalTerrestrialMeansNotTeleportOrMount:'Only the existing walkable crossing-to-forest exit is proposed, without transport invention or ownership.'});
        const nextParams={actorId:jp.actorId,beastId:jb.id,
         destination:'forest',witnessIndex:js.log.length-1},
         beforeProposal=E.exportGame(js),beforeHuman=jp.rngState,
         beforeBeast=jb.sapientLife.rngState,beforeWorld=js.rngState,
         originalStamina=humanBody.stamina,originalMinute=js.world.minutes;
        A.throws(()=>R.act(js,{system:'bond',operation:'npcVisitorTerrestrialProposal',
         params:{...nextParams,accepted:true}}),/no caller chosen consent or movement/);
        A.equal(E.exportGame(js),beforeProposal);
        const considered=R.act(js,{system:'bond',operation:'npcVisitorTerrestrialProposal',
         params:nextParams}),nextSource=jp.originalSapientVisitorLegProposals.at(-1).source,
         nextSeal=jp.originalSapientVisitorLegProposals.at(-1).seal;
        A.equal(VisitorProposal.verify(js,jp),true);
        A.equal(Journey.verify(js,jp),true);
        A.equal(nextSource.humanChoice.rngBefore,beforeHuman);
        A.equal(nextSource.beastChoice?.rngBefore??beforeBeast,beforeBeast);
        A.equal(js.rngState,beforeWorld);
        A.equal(js.world.minutes,originalMinute);
        A.equal(humanBody.stamina,originalStamina);
        A.equal(jb.location,'crossing');
        A.equal(considered.mutuallyInterested,nextSource.mutuallyInterested);
        A.equal(considered.noArrivalOrAdditionalConsent,true);
        A.equal(E.exportGame(E.importGame(E.exportGame(js))),E.exportGame(js));
        const afterPropose=E.exportGame(js);
        A.throws(()=>R.act(js,{system:'bond',operation:'npcVisitorTerrestrialProposal',
         params:nextParams}),/distinct originally witnessed informed visitor-leg discussion/i);
        A.equal(E.exportGame(js),afterPropose);
        console.log('INDEPENDENT ORIGINAL VISITOR SECOND PROPOSAL '+JSON.stringify({
         result:considered.outcome,newChoices:true,noMovement:true}));
        // A real refusal is not the end of an individual's life. On a
        // separate disposable copy, allow the existing WORLD to pass
        // ordinarily, then offer a freshly witnessed opportunity ONLY
        // while the original still-revocable arrangement, physical health,
        // separate real positions and genuine daytime route allow it.
        // Never select, repeat on the same day, re-seed or alter an outcome.
        // Keep the original arrived copy for the sixday visitor audit.
        if(!considered.mutuallyInterested){
         const dated=E.importGame(E.exportGame(js)),
          dw=Realm.peek(dated),dp=dw.emergentPeople.people[jp.id],
          db=dated.beasts[jb.id],dBody=dated.table.combatants['npc_'+jp.id];
         for(let laterDay=1;laterDay<=6;laterDay++){
          const beforeDate=dated.world.minutes;
          Time.advance(dated,1);
          const newRoute=ReturnPreflight.routeStatus(dated,dp,db,'forest');
          if(!newRoute.proposalEligible){
           console.log('INDEPENDENT ORIGINAL VISITOR LATER-DAY DEFERRED '+JSON.stringify({
            laterDay,reason:newRoute.reason,unforced:true}));
           break;
          }
          A.equal(Journey.position(dp,dated.world.minutes).location,'crossing');
          A.equal(db.location,'crossing');
          A.equal(dated.world.location,playerSite);
          A.equal(newRoute.sourceArrivalHash,jp.originalSapientTerrestrialJourneys[0].seal);
          const dayScene=dp.name+' and '+db.name+
           ' freely revisit the possibility of the connected crossing-to-forest route on a later actual day, with neither travel nor continued cooperation assumed.';
          dated.chatRuntime.scene=dayScene;
          C.event(dated,'story',dayScene,{
           origin:VisitorProposal.WITNESS,actorId:dp.actorId,beastId:db.id,
           arrivalSeal:newRoute.sourceArrivalHash,from:'crossing',to:'forest',
           arrangementSeal:entry.seal,pairSeal:row.seal,
           combatSeal:dBody.npcOrigin.seal,
           originalLinkedMinutes:75,originalHumanStamina:4,
           separateNewHumanAndSapientChoices:true,
           noInheritedReturnConsentOrGuaranteedJourney:true,
           actualVisitorSitePurposeAndDestination:'This is a new, truly dated invitation to consider a short return along the established linked route from the crossing; no consent carries across days.',
           currentRouteRisksAndWeather:'Actual world conditions: '+String(dated.world.weather)+
            '. The originally linked walking route still has ordinary hazards, welfare and daylight restrictions.',
           freshRightOfEachPersonToRefuse:'Either independently living traveller may decline consideration now, withdraw later or refuse to depart after a proposal.',
           originalTerrestrialMeansNotTeleportOrMount:'No fictional portal, imposed ride or newly invented connection; the original linked forest exit must be walked.'});
          const dayRequest={actorId:dp.actorId,beastId:db.id,
           destination:'forest',witnessIndex:dated.log.length-1},
           prior=E.exportGame(dated),humanBefore=dp.rngState,
           beastBefore=db.sapientLife.rngState,worldBefore=dated.rngState;
          const offered=R.act(dated,{system:'bond',
           operation:'npcVisitorTerrestrialProposal',params:dayRequest}),
           q=dp.originalSapientVisitorLegProposals.at(-1).source,
           freshSeal=dp.originalSapientVisitorLegProposals.at(-1).seal;
          A.equal(offered.mutuallyInterested,q.mutuallyInterested);
          A.equal(q.humanChoice.rngBefore,humanBefore);
          A.equal(q.beastChoice?.rngBefore??beastBefore,beastBefore);
          A.equal(dated.rngState,worldBefore);
          A.equal(dated.world.minutes,beforeDate+1440);
          A.equal(Journey.verify(dated,dp),true);
          A.equal(VisitorProposal.verify(dated,dp),true);
          console.log('INDEPENDENT ORIGINAL LATER-DAY VISITOR PROPOSAL '+JSON.stringify({
           laterDay,result:offered.outcome,originalElapsedDays:laterDay,
           noAssignedConsent:true}));
          if(!offered.mutuallyInterested)continue;
          if(dated.world.minutes%1440+76>1440){
           console.log('INDEPENDENT ORIGINAL LATER-DAY DEPARTURE DEFERRED '+JSON.stringify({
            laterDay,reason:'original-daylight-limit'}));
           continue;
          }
          const consideredMinute=dated.world.minutes;
          E.advance(dated,1);Time.finalizeTime(dated,consideredMinute);
          const departureScene=dp.name+' and '+db.name+
           ' separately consider whether to start the actual later-day crossing-to-forest foot journey; either remains able to refuse.';
          dated.chatRuntime.scene=departureScene;
          C.event(dated,'story',departureScene,{
           origin:Journey.WITNESS,actorId:dp.actorId,beastId:db.id,
           proposalSeal:freshSeal,from:'crossing',to:'forest',
           actualFreshDepartureDecision:true,
           noAssumedFutureConsentOrOwnedBeast:true,
           originalRouteMinutes:75,originalHumanStaminaCost:4,
           currentInformedDepartureAndReturnFreedom:'Neither traveller is obliged to set off despite their independent agreement to consider this later-day proposal.',
           originalRouteConditionsAndKnownHazards:'A genuinely linked walking exit still requires the original 75-minute passage, actual human Stamina and suitable weather without free bypass.',
           actualIndividualBeastMovementAbility:'The original mobile sapient individual may walk, refuse or change plans without being made a mount or controlled property.',
           noCompelledUnsafeWeatherOrHazardBypass:true});
          const secondBefore=dated.world.minutes,staminaBefore=dBody.stamina,
           actual=R.act(dated,{system:'bond',operation:'npcVisitorTerrestrialJourney',
            params:{actorId:dp.actorId,beastId:db.id,
             proposalSeal:freshSeal,witnessIndex:dated.log.length-1}}),
           leg=dp.originalSapientTerrestrialJourneys.at(-1).source;
          A.equal(Journey.verify(dated,dp),true);
          A.equal(Person.verify(db),true);
          A.equal(dated.world.minutes,secondBefore+(leg.departed?75:0));
          A.equal(dBody.stamina,staminaBefore-(leg.departed?4:0));
          A.equal(actual.departureConsent,leg.departed);
          A.equal(dated.world.location,playerSite);
          A.equal(db.location,leg.departed?'forest':'crossing');
          A.equal(Journey.position(dp,dated.world.minutes).location,
           leg.departed?'forest':'crossing');
          console.log('INDEPENDENT ORIGINAL LATER-DAY SECOND JOURNEY '+JSON.stringify({
           laterDay,departed:leg.departed,
           humanStaminaPaid:actual.actualHumanStaminaPaid,
           minutes:actual.actualMinutes,unforced:true}));
          if(!leg.departed)continue;
          // A genuine second-leg homecoming may resume only FUTURE
          // source-owned life. No retroactive home wages or automatic rest.
          const homeDay=Math.floor(dated.world.minutes/1440),homeCash=dp.cashScales;
          A.equal(Journey.awayDuring(dp,(homeDay+1)*1440,
           (homeDay+2)*1440),false);
          A.equal(Presence.resolve(Realm.peek(dated),dp.actorId,'forest',homeDay,
           dated.world.minutes%1440)?.presence?.source,Journey.VISITOR);
          const arrived=E.importGame(E.exportGame(dated)),
           ap=Realm.peek(arrived).emergentPeople.people[dp.id];
          Time.advance(arrived,2);
          A.equal(Journey.verify(arrived,ap),true);
          A.equal(Journey.position(ap,arrived.world.minutes).location,'forest');
          A.equal(Presence.resolve(Realm.peek(arrived),ap.actorId,'crossing',
           Math.floor(arrived.world.minutes/1440),arrived.world.minutes%1440),null);
          A.equal(GradePreflight.routeStatus(arrived,ap,arrived.beasts[db.id]).reason,
           'no-real-accredited-original-facility-arrival',
           'A physically returned person cannot retain phantom remote facility Grade eligibility');
          A.equal(Presence.resolve(Realm.peek(arrived),ap.actorId,'forest',
           Math.floor(arrived.world.minutes/1440),arrived.world.minutes%1440)?.presence?.source,
           People.SHIFT);
          A.ok(ap.cashScales>=homeCash);
          A.equal(E.exportGame(E.importGame(E.exportGame(arrived))),
           E.exportGame(arrived));
          // Exact sealed two-sided source is not rewritten to make a return
          // succeed. Attempting to re-seal an alternative departure after
          // the genuine earned history must fail independent source replay.
          const tampered=E.importGame(E.exportGame(dated)),
           tp=Realm.peek(tampered).emergentPeople.people[dp.id],
           falsified=tp.originalSapientTerrestrialJourneys.at(-1);
          falsified.source.departed=false;
          falsified.seal=hash(falsified.source);
          A.equal(Journey.verify(tampered,tp),false,
           'An invented re-sealed refusal cannot rewrite a genuinely independently agreed and paid return');
          console.log('INDEPENDENT ORIGINAL LATER-DAY VERIFIED HOMECOMING '+JSON.stringify({
           laterDay,actualSecondJourney:true,restoredHomeShiftOnlyAfterArrival:true,
           noFreeWagesOrGrade:true}));
          break;
         }
        }

        if(considered.mutuallyInterested&&originalMinute%1440+76<=1440){
         // Actual one minute elapses before the separate *departure*
         // decision: an instantly copied proposal witness cannot serve as
         // the independent second-person departure witness.
         E.advance(js,1);Time.finalizeTime(js,originalMinute);
         const departScene=jp.name+' and '+jb.name+
          ' independently reconsider the real crossing to forest departure with full freedom to remain at the crossing.';
         js.chatRuntime.scene=departScene;
         C.event(js,'story',departScene,{
          origin:Journey.WITNESS,actorId:jp.actorId,beastId:jb.id,
          proposalSeal:nextSeal,from:'crossing',to:'forest',
          actualFreshDepartureDecision:true,noAssumedFutureConsentOrOwnedBeast:true,
          originalRouteMinutes:75,originalHumanStaminaCost:4,
          currentInformedDepartureAndReturnFreedom:'The two individual travellers may independently refuse this second physical departure despite having agreed to consider it.',
          originalRouteConditionsAndKnownHazards:'The actual original 75-minute physical connected forest exit remains subject to weather, ordinary hazards, fatigue and no guaranteed arrival.',
          actualIndividualBeastMovementAbility:'The original source-present sapient being can physically traverse the real footpath without an assigned mount, portal or coerced service.',
          noCompelledUnsafeWeatherOrHazardBypass:true});
         const more={actorId:jp.actorId,beastId:jb.id,
          proposalSeal:nextSeal,witnessIndex:js.log.length-1},
          beforeNewDeparture=E.exportGame(js),atMinute=js.world.minutes,
          atStamina=humanBody.stamina;
         A.throws(()=>R.act(js,{system:'bond',operation:'npcVisitorTerrestrialJourney',
          params:{...more,departed:true}}),/no chosen assent, arrival, stamina or location/);
         A.equal(E.exportGame(js),beforeNewDeparture);
         const second=R.act(js,{system:'bond',operation:'npcVisitorTerrestrialJourney',params:more}),
          q2=jp.originalSapientTerrestrialJourneys.at(-1).source;
         A.equal(second.departureConsent,q2.departed);
         A.equal(Journey.verify(js,jp),true);
         A.equal(VisitorProposal.verify(js,jp),true);
         A.equal(Person.verify(jb),true);
         A.equal(js.world.location,playerSite);
         A.equal(js.player.partnerIds.includes(jb.id),false);
         A.equal(humanBody.stamina,atStamina-(q2.departed?4:0));
         A.equal(js.world.minutes,atMinute+(q2.departed?75:0));
         A.equal(jb.location,q2.departed?'forest':'crossing');
         A.equal(Journey.position(jp,js.world.minutes).location,q2.departed?'forest':'crossing');
         if(q2.departed){
          A.equal(Presence.resolve(Realm.peek(js),jp.actorId,'crossing',
           Math.floor(js.world.minutes/1440),js.world.minutes%1440),null);
          A.ok(Presence.resolve(Realm.peek(js),jp.actorId,'forest',
           Math.floor(js.world.minutes/1440),js.world.minutes%1440)?.presence,
           'Return means actual original hometown location, NOT automatic resumed paid work');
          A.equal(jp.cashScales,p.cashScales,
           'The journey itself does not invent a salary, Grade or exam');
          const sameReturnDay=Math.floor(js.world.minutes/1440),
           noReturnWork=E.importGame(E.exportGame(js)),
           returnedPerson=Realm.peek(noReturnWork).emergentPeople.people[jp.id],
           returnedBeast=noReturnWork.beasts[jb.id],
           noWorkCash=returnedPerson.cashScales,
           trueReturnMinute=noReturnWork.world.minutes,
           homeShift=returnedPerson.shift;
          A.equal(Journey.awayDuring(returnedPerson,trueReturnMinute-75,
           trueReturnMinute),true,
           'The real return transit is still part of time away from home');
          A.equal(Journey.awayDuring(returnedPerson,(sameReturnDay+1)*1440,
           (sameReturnDay+2)*1440),false,
           'Later whole days are no longer a second overseas absence after real return');
          A.equal(Presence.resolve(Realm.peek(noReturnWork),returnedPerson.actorId,
           'forest',sameReturnDay,trueReturnMinute%1440)?.presence?.source,
           Journey.VISITOR,'Actual homecoming day is a visitor, not a free completed work shift');
          Time.advance(noReturnWork,2);
          const laterReturnDay=Math.floor(noReturnWork.world.minutes/1440),
           laterReturnMinute=noReturnWork.world.minutes%1440,
           homePresent=Presence.resolve(Realm.peek(noReturnWork),
            returnedPerson.actorId,'forest',laterReturnDay,laterReturnMinute);
          A.equal(Journey.verify(noReturnWork,returnedPerson),true);
          A.equal(Person.verify(returnedBeast),true);
          A.equal(Journey.position(returnedPerson,noReturnWork.world.minutes).location,
           'forest');
          A.equal(homePresent?.presence?.source,People.SHIFT,
           'Only later originally scheduled human home attendance resumes');
          A.equal(Presence.resolve(Realm.peek(noReturnWork),returnedPerson.actorId,
           'crossing',laterReturnDay,laterReturnMinute),null);
          A.ok(returnedPerson.cashScales>=noWorkCash,
           'Later original wages may be earned, but not a retroactive journey reward');
          A.equal(noReturnWork.world.location,playerSite);
          A.equal(E.exportGame(E.importGame(E.exportGame(noReturnWork))),
           E.exportGame(noReturnWork));
          console.log('INDEPENDENT ORIGINAL RETURN HOME TWO-DAY CONTINUITY '+JSON.stringify({
           homeShiftRestoredOnLaterDay:true,noReturnDaySalary:true,
           actualTransitStaminaPaid:4,noSecondBody:true}));

         }
         const secondCopy=E.importGame(E.exportGame(js)),
          scp=Realm.peek(secondCopy).emergentPeople.people[jp.id];
         A.equal(Journey.verify(secondCopy,scp),true);
         scp.originalSapientTerrestrialJourneys[1].source.arrivalMinute+=1;
         scp.originalSapientTerrestrialJourneys[1].seal=
          hash(scp.originalSapientTerrestrialJourneys[1].source);
         A.equal(Journey.verify(secondCopy,scp),false,
          'Resealing a falsely altered second actual arrival is rejected');
         console.log('INDEPENDENT ORIGINAL ACTUAL SECOND PHYSICAL TERRESTRIAL LEG '+JSON.stringify({
          departed:q2.departed,from:'crossing',to:q2.departed?'forest':null,
          staminaPaid:second.actualHumanStaminaPaid,minutes:second.actualMinutes,
          noInferredHomeWageOrContract:true}));
        }

       }else{
        A.ok(['insufficient-original-human-stamina',
         'no-current-revocable-mutual-travel-arrangement',
         'original-linked-leg-must-finish-in-current-day',
         'independent-sapient-person-not-currently-present-and-fit'].includes(homeward.reason),
         'A genuine initial arrival may be unable to consider a new route only for explicit actual source limitations: '+homeward.reason);
       }
       console.log('INDEPENDENT ORIGINAL VISITOR RETURN PREFLIGHT '+JSON.stringify({
        eligible:homeward.proposalEligible,reason:homeward.reason??null,
        genuineStart:'crossing',nextOriginalEdge:'forest',
        noNewDepartureOrConsent:true}));

       // Longitudinal owner acceptance: actual sixday world ticks on a
       // disposable copy of this genuinely self-decided physical arrival.
       // No second hometown body, unsourced salary or native forest foraging.
       const later=E.importGame(E.exportGame(js)),lw=Realm.peek(later),
        lp=lw.emergentPeople.people[jp.id],lb=later.beasts[jb.id],
        priorCash=lp.cashScales,
        priorHabitatPractice=JSON.stringify(lb.sapientLife.practice),
        priorPlayerLocation=later.world.location,
        oldDay=Math.floor(later.world.minutes/1440);
       Time.advance(later,6);
       const futureDay=Math.floor(later.world.minutes/1440),
        futureMinute=later.world.minutes%1440;
       A.equal(futureDay,oldDay+6,'Exactly six real world days advance');
       A.equal(Journey.verify(later,lp),true,
        'Actual visitor source provenance must survive six original world days');
       A.equal(Person.verify(lb),true,
        'Original sapient identity must survive non-native visitor world ticks');
       A.equal(Journey.position(lp,later.world.minutes).location,'crossing',
        'A world tick cannot automatically invent a return journey');
       A.ok(Presence.resolve(lw,lp.actorId,'crossing',futureDay,futureMinute)?.presence,
        'Actual arrived individual retains authentic destination visitor presence');
       A.equal(Presence.resolve(lw,lp.actorId,'forest',futureDay,futureMinute),null,
        'A visitor cannot simultaneously be at the original hometown shift');
       A.equal(lp.cashScales,priorCash,
        'Absent independent worker cannot gain an invented hometown wage');
       A.equal(JSON.stringify(lb.sapientLife.practice),priorHabitatPractice,
        'No native-forest study or forage progression at an accredited visitor facility');
       A.equal(later.world.location,priorPlayerLocation,
        'Independent visitor history never moves the player');
       A.equal(E.exportGame(E.importGame(E.exportGame(later))),E.exportGame(later),
        'Sixday visitor records must remain exact save/import stable');
       console.log('INDEPENDENT ORIGINAL TERRESTRIAL VISITOR SIXDAY '+JSON.stringify({
        originalArrival:'crossing',elapsedDays:6,homeWorkAbsent:true,
        retainedActualVisitor:true,noFacilityForage:true,playerUnmoved:true}));

      }else{
       A.equal(jb.location,'forest');A.equal(Journey.position(jp,js.world.minutes),null);
       A.equal(js.world.minutes,initialHour);
      }
      const savedTrip=E.exportGame(js),tripCopy=E.importGame(savedTrip),
       tripPerson=Realm.peek(tripCopy).emergentPeople.people[jp.id];
      A.equal(Journey.verify(tripCopy,tripPerson),true);
      const fakeTrip=tripPerson.originalSapientTerrestrialJourneys[0];
      fakeTrip.source.departed=!e.departed;
      fakeTrip.seal=hash(fakeTrip.source);
      A.equal(Journey.verify(tripCopy,tripPerson),false,'Resealed fabricated travel cannot bypass two current personal choices');
      console.log('INDEPENDENT ORIGINAL ACTUAL TERRESTRIAL JOURNEY '+JSON.stringify({
       departed:e.departed,arrival:e.departed?'crossing':null,
       actualMinutes:journey.actualMinutes,staminaPaid:journey.actualHumanStaminaPaid,
       playerLocationUnchanged:true,noAutomaticBondOrGrade:true}));
      }
     }
     console.log('INDEPENDENT ORIGINAL TERRESTRIAL PROPOSAL '+JSON.stringify({
      result:chosen.outcome,originalMinutes:75,humanStaminaCostIfTraveled:4,
      humanChoice:source.humanChoice.accepted,beastChoice:source.beastChoice?.outcome??null,
      actualMovement:false,noPlayerWorldRoll:true}));
    }
    }
   }


   // An actual recognised but unfamiliar pair cannot bypass earned
   // willingness by presenting a fresh magical offer or a caller outcome.
   const ss=E.importGame(E.exportGame(s)),sp=Realm.peek(ss).emergentPeople.people[p.id],sb=ss.beasts[b.id];
   const grade={grade:3,worldMinute:ss.world.minutes,species:sb.species,evolutionStage:sb.evolutionStage,
    individualGrade:sb.individualGrade,source:'Explicit disposable prior numeric individual assessment, not rarity or transformation.'};
   sb.contractGradeAssessment=grade;
   const ContractLaw=require('../rules/independent-original-bond-contract-law');
   A.deepEqual(ContractLaw.soulAt(ss,sp,ss.world.minutes),{phase:0,sourceSeal:null});
   const contractInput=ContractLaw.inputs(ss,sp,sb,ss.world.minutes,grade,'light',0);
   A.equal(contractInput,null,'An arbitrary numeric grade field cannot replace the original paid Grade exam');
   C.event(ss,'story',sp.name+' considers the exact separately explained magical terms without implying readiness to accept.',{
    origin:Interact.SEAL,actorId:sp.actorId,beastId:sb.id,pairSeal:row.seal,
    arrangementHash:entry.seal,arrangementRevision:entry.seal,contactHash:hash(contact),
    location:site,approach:'seal',depth:'light',gradeAssessmentHash:hash(grade),
    independentConcreteOpportunity:'Actual separately explained exact light magical connection offer without compelled service.',
    actualCommunication:'Original local comprehended form of communication.',
    unconditionalRightToRefuse:'Each independent person may refuse any magical contract.',
    noCompelledInteraction:true,independentlyUnderstood:true,noOwnershipOrForcedObedience:true,
    exactContractBenefits:'Finite link with no automatic learned ability or physical ownership.',
    exactContractObligations:'Both must be free to accept or refuse any proposed collaborative activity.',
    exactContractLimits:'Original measured light depth, not an unlimited command or storage mechanic.',
    independentWithdrawalTerms:'Either independently may withdraw from further continuation.'});
   const sr={actorId:sp.actorId,beastId:sb.id,witnessIndex:ss.log.length-1},sbefore=E.exportGame(ss);
   A.throws(()=>R.act(ss,{system:'bond',operation:'npcPairSeal',params:{...sr,sealed:true}}),/no outcome or affinity/);
   A.equal(E.exportGame(ss),sbefore);
   if(out.recorded){
    A.throws(()=>R.act(ss,{system:'bond',operation:'npcPairSeal',params:sr}),/willingness at least 50/);
    A.throws(()=>R.act(ss,{system:'bond',operation:'npcPairReview',params:sr}),/Current actual original magical contract/);
    A.throws(()=>R.act(ss,{system:'bond',operation:'npcSyncPractice',params:sr}),/Actual existing original independent magical contract/);
    A.throws(()=>R.act(ss,{system:'bond',operation:'npcSyncPractice',params:{...sr,targetStage:10}}),/no outcome or affinity/);
   }else A.throws(()=>R.act(ss,{system:'bond',operation:'npcPairSeal',params:sr}),/recognised pair/);
   A.equal(E.exportGame(ss),sbefore);A.equal(Interact.activeForBeast(ss,sb.id),null);
   const noMoney={actorId:sp.actorId,beastId:sb.id,witnessIndex:ss.log.length-1},gradeBefore=E.exportGame(ss);
   A.throws(()=>R.act(ss,{system:'bond',operation:'npcGradeExamine',params:{...noMoney,grade:9}}),
    /no selected grade, consent or success/);
   A.equal(E.exportGame(ss),gradeBefore);
   A.throws(()=>R.act(ss,{system:'bond',operation:'npcGradeExamine',params:noMoney}),
    /original examination facility, funds, verified pair/);
   A.equal(E.exportGame(ss),gradeBefore);
   // This is an isolated private assessment visibility fixture, NOT an
   // awarded examination. It must never leak through the player Grade pane.
   const oldGrade=sb.contractGradeAssessment,oldExams=sb.gradeExaminations;
   sb.contractGradeAssessment={...grade,origin:IndependentGrade.ORIGIN};
   sb.gradeExaminations=[{origin:IndependentGrade.ORIGIN,outcome:'verified',worldMinute:ss.world.minutes}];
   A.deepEqual(OriginalGrade.status(ss,{beastId:sb.id}),{assessed:false,examAttempts:0});
   sb.contractGradeAssessment=oldGrade;sb.gradeExaminations=oldExams;
   A.equal(IndependentGrade.verify(ss,sp),true);
   A.equal(IndependentGrade.paidSource(ss,sp,sb,{source:{origin:IndependentGrade.ORIGIN,accepted:true},seal:'forged'}),false);


   if(out.recorded){
    pairCounts.recorded++;
    A.equal(row.bond.compatibility,5);A.equal(row.bond.resonance,4);
    for(const k of ['trust','familiarity','affection','respect','loyalty','communication','coordination','willingness','syncStage','syncPoints'])
     A.equal(row.bond[k],0);
    A.equal(row.bond.contract,null);
    const v=Foundation.gmDossier(w,p.actorId,s).earnedEvidence.beastRelationships;
    A.equal(v.verifiedPartners,null);A.equal(v.sourceVerifiedUncommittedPairs.length,1);
    // A different disposable copy moves the ORIGINAL world by one real day.
    // The sapient person is never teleported or presumed available. The
    // new opportunity exists only if both source histories still show them
    // genuinely present and safe; both draw NEW private choices.
    const fs=E.importGame(E.exportGame(s)),first=fs.world.minutes;
    Time.advance(fs,1);
    const fw=Realm.peek(fs),fp=fw.emergentPeople.people[p.id],fb=fs.beasts[b.id],
     fday=Math.floor(fs.world.minutes/1440),
     fhere=Presence.resolve(fw,fp.actorId,site,fday,fs.world.minutes%1440);
    if(fhere?.presence&&fb.away===false&&fb.location===site&&fb.condition>=55&&
       Arrangement.privateStatus(fs,fp)[0].status==='accepted'){
     const scene=fp.name+' and '+fb.name+
       ' are both visibly present for a genuinely new, nonbinding local conversation in their established habitat.';
     fs.chatRuntime||={};fs.chatRuntime.scene=scene;
     C.event(fs,'story',scene,{origin:Follow.WITNESS,actorId:fp.actorId,beastId:fb.id,
      location:site,pairSeal:row.seal,arrangementHash:entry.seal,
      actualRenewedCoPresence:true,noAssignedBeastConsentOrOwnership:true,
      unconditionalRefusalAndCommunication:'Both individuals can refuse this entirely new conversation with no imposed obligation.',
      currentRealSharedActivity:'The previously known pair physically meet again during the actual next daily local opportunity.',
      contactStatus:'new-independent-choices'});
     const request={actorId:fp.actorId,beastId:fb.id,witnessIndex:fs.log.length-1},
      originalWorldRng=fs.rngState,prepared=E.exportGame(fs);
     A.throws(()=>R.act(fs,{system:'bond',operation:'npcSapientFollowupContact',params:{...request,accepted:true}}),
      /no chosen consent or outcome/);
     A.equal(E.exportGame(fs),prepared);
     const fresh=R.act(fs,{system:'bond',operation:'npcSapientFollowupContact',params:request}),
      recent=fp.originalSapientRenewedContacts[0],raw=fb.sapientLife.contactReceipts.at(-1);
     A.equal(Follow.verify(fs,fp),true);A.equal(Person.verify(fb),true);A.equal(Pair.verify(fs,fp),true);
     A.equal(fresh.newContact,raw.source.contact.willingness);
     A.equal(fs.world.minutes-first,1440+fresh.minutes);
     A.equal(fs.rngState,originalWorldRng);
     A.equal(raw.source.encounterHash,hash(raw.source.witness));
     A.equal(raw.source.contact.meetingHash,raw.source.witnessHash);
     A.equal(Person.contactProof(fb,raw.source.contact),true);
     const after=E.exportGame(fs);
     A.throws(()=>R.act(fs,{system:'bond',operation:'npcSapientFollowupContact',params:request}),
      /unused renewed contact day|fresh local follow-up scene|Genuine known/);
     A.equal(E.exportGame(fs),after);
     const fc=E.importGame(after),fpc=Realm.peek(fc).emergentPeople.people[p.id],
      fbc=fc.beasts[b.id];
     A.equal(Follow.verify(fc,fpc),true);
     fbc.sapientLife.contactReceipts.at(-1).source.contact.willingness=!fresh.newContact;
     fbc.sapientLife.contactReceipts.at(-1).seal=hash(fbc.sapientLife.contactReceipts.at(-1).source);
     fbc.sapientLife.contactHead=fbc.sapientLife.contactReceipts.at(-1).seal;
     A.equal(Person.verify(fbc),false,'Rehashed fake renewed assent cannot pass the original individual beast RNG');

     // A refused meeting cannot be recycled as consent. Advance at most
     // four additional REAL days before the first original civil sixday,
     // when the independent beast may depart on its own ecology tick.
     let tried=1,renewedYes=0,actualInteraction=null,actualInteractions=[];
     if(fresh.newContact)renewedYes++;
     for(let nextDay=fday+1;nextDay<=5;nextDay++){
      Time.advance(fs,1);
      const living=Realm.peek(fs),witnessedPerson=living.emergentPeople.people[p.id],
       nowDay=Math.floor(fs.world.minutes/1440),nowMinute=fs.world.minutes,
       presentAgain=Presence.resolve(living,witnessedPerson.actorId,site,nowDay,nowMinute%1440);
      if(!presentAgain?.presence||fb.away||fb.location!==site||fb.owner!==null||
       !Arrangement.safe(fb)||Arrangement.statusAt(entry,nowMinute)!=='accepted')break;
      const nextScene=witnessedPerson.name+' and '+fb.name+' independently encounter one another again in their real shared native habitat.';
      fs.chatRuntime||={};fs.chatRuntime.scene=nextScene;
      C.event(fs,'story',nextScene,{origin:Follow.WITNESS,actorId:witnessedPerson.actorId,
       beastId:fb.id,location:site,pairSeal:row.seal,arrangementHash:entry.seal,
       actualRenewedCoPresence:true,noAssignedBeastConsentOrOwnership:true,
       unconditionalRefusalAndCommunication:'These two separately living people may refuse new communication without any earlier agreement binding them.',
       currentRealSharedActivity:'The same independently scheduled human and non-departed beast actually meet at a later original world hour.',
       contactStatus:'new-independent-choices'});
      const freshRequest={actorId:witnessedPerson.actorId,beastId:fb.id,witnessIndex:fs.log.length-1},
       newContact=R.act(fs,{system:'bond',operation:'npcSapientFollowupContact',params:freshRequest});
      tried++;
      A.equal(Follow.verify(fs,witnessedPerson),true);
      A.equal(Person.verify(fb),true);
      if(!newContact.newContact)continue;
      renewedYes++;
      const latest=fb.sapientLife.history.filter(x=>x.type==='personally-witnessed-contact'&&x.willingness).at(-1);
      A.ok(latest&&fs.world.minutes-latest.minute<=60);
      const interactionScene=witnessedPerson.name+' approaches '+fb.name+' gently, and both are explicitly free to refuse this separate exchange.';
      fs.chatRuntime.scene=interactionScene;
      C.event(fs,'story',interactionScene,{origin:Interact.WITNESS,actorId:witnessedPerson.actorId,
       beastId:fb.id,pairSeal:row.seal,arrangementHash:entry.seal,
       arrangementRevision:entry.seal,contactHash:hash(latest),location:site,
       approach:'gentle',
       independentConcreteOpportunity:'This new actual conversation provides an unforced moment for genuine gentle treatment in the observed habitat.',
       actualCommunication:'The individual human and sapient beast are observed exchanging a fresh and separate non-coercive greeting.',
       unconditionalRightToRefuse:'Both participants retain the right to refuse this treatment without any forced continuation or obligation.',
       noCompelledInteraction:true});
      const beforeEvent=E.exportGame(fs),originalRng=fs.rngState,
       requestEvent={actorId:witnessedPerson.actorId,beastId:fb.id,witnessIndex:fs.log.length-1};
      A.throws(()=>R.act(fs,{system:'bond',operation:'npcPairInteract',
       params:{...requestEvent,affection:100}}),/no outcome or affinity/);
      A.equal(E.exportGame(fs),beforeEvent);
      if(fs.world.minutes%1440+15>1440){
       A.throws(()=>R.act(fs,{system:'bond',operation:'npcPairInteract',params:requestEvent}),
        /Complete original interaction within the witnessed day/);
       A.equal(E.exportGame(fs),beforeEvent);
       console.log('INDEPENDENT ORIGINAL FRIENDLY INTERACTION DEFERRED BY REAL DAYLIGHT');
       continue;
      }
      const exchange=R.act(fs,{system:'bond',operation:'npcPairInteract',params:requestEvent}),
       actualReceipt=witnessedPerson.originalBondInteractions.at(-1).source;
      A.equal(Interact.verify(fs,witnessedPerson),true);
      A.equal(Follow.verify(fs,witnessedPerson),true);
      A.equal(fs.rngState,originalRng);
      A.equal(actualReceipt.event?.event??null,exchange.observedEvent);
      A.equal(actualReceipt.after.contract,null);
      A.equal(actualReceipt.after.syncStage,0);
      A.equal(fs.player.partnerIds.includes(fb.id),false);
      const lived=E.importGame(E.exportGame(fs)),
       savedPerson=Realm.peek(lived).emergentPeople.people[p.id];
      A.equal(Interact.verify(lived,savedPerson),true);
      A.equal(Follow.verify(lived,savedPerson),true);
      const observed={freshlyAccepted:true,humanInitiated:exchange.independentlyInitiated,
       receivedByBeast:exchange.accepted,checkSucceeded:exchange.successful,
       event:exchange.observedEvent??null,day:nowDay};
      actualInteraction||=observed;
      actualInteractions.push(observed);
      const rows=witnessedPerson.originalBondInteractions;
      if(rows.length>1){
       A.equal(rows.at(-1).source.previous,rows.at(-2).seal);
       A.deepEqual(rows.at(-1).source.before,rows.at(-2).source.after);
      }
     }
     console.log('INDEPENDENT EXTENDED REAL PAIR PROGRESSION '+JSON.stringify({
      actualDaysTried:tried,freelyRenewed:renewedYes,actualInteraction,
      actualInteractions,originalEarnedEventCount:actualInteractions.filter(x=>x.event!==null).length,
      noInferredContractOrSync:true}));
     console.log('INDEPENDENT RENEWED REAL SAPient CONTACT '+JSON.stringify({freelyAccepted:fresh.newContact,minute:recent.source.minute,actualDay:fday}));
    }else{
     A.equal(Follow.verify(fs,fp),true);
     console.log('INDEPENDENT RENEWED SAPient CONTACT NOT ASSUMED: individual not source-present on the actual next day');
    }
    // Branch a disposable copy: the other social fixtures retain their
    // original moment and personal RNGs. No favourable response assigned.
    const cs=E.importGame(E.exportGame(s)),cp=Realm.peek(cs).emergentPeople.people[p.id],cb=cs.beasts[b.id];
    C.event(cs,'story',cp.name+' offers a gentle voluntary conversation and gives the sapient person space to refuse.',{
     origin:Interact.WITNESS,actorId:cp.actorId,beastId:cb.id,pairSeal:row.seal,
     arrangementHash:entry.seal,arrangementRevision:entry.seal,contactHash:hash(contact),
     location:site,approach:'gentle',
     independentConcreteOpportunity:'Actual gentle approach to discuss shared observations without forcing any contact.',
     actualCommunication:'Previously witnessed local communication and opportunity to decline.',
     unconditionalRightToRefuse:'Both participants retain space to refuse without any coercion or obligation.',
     noCompelledInteraction:true});
    const iw=structuredClone(cs.log.at(-1)),drill={...iw.details,approach:'drill',
     actualJointTimingAndSignalDrill:'The proposed concrete safe timing and signal exercise requires both actual physical bodies.',noMagicOrSyncExercise:true};
    C.event(cs,'story',iw.text,drill);
    const badDrill={actorId:cp.actorId,beastId:cb.id,witnessIndex:cs.log.length-1},noBody=E.exportGame(cs);
    A.throws(()=>R.act(cs,{system:'bond',operation:'npcPairInteract',params:badDrill}),/actual original physical bodies|Complete original interaction within the witnessed day/i);
    A.equal(E.exportGame(cs),noBody);
    C.event(cs,'story',iw.text,iw.details);
    const ir={actorId:cp.actorId,beastId:cb.id,witnessIndex:cs.log.length-1},isave=E.exportGame(cs),irng=cs.rngState;
    A.throws(()=>R.act(cs,{system:'bond',operation:'npcPairInteract',params:{...ir,event:'respected_refusal'}}),/no outcome or affinity/);
    A.equal(E.exportGame(cs),isave);
    const interaction=R.act(cs,{system:'bond',operation:'npcPairInteract',params:ir}),
     receipt=cp.originalBondInteractions[0],q=receipt.source;
    A.equal(Interact.verify(cs,cp),true);A.equal(Pair.verify(cs,cp),true);
    A.equal(cs.rngState,irng);A.equal(interaction.elapsedMinutes,15);
    A.equal(q.before.trust,0);A.equal(q.after.contract,null);A.equal(q.after.syncStage,0);
    const derived=structuredClone(q.before);
    if(q.event)Bond.applyEvent(derived,q.event.event,1);
    A.deepEqual(q.after,derived);
    if(q.event?.event==='respected_refusal'){A.equal(q.after.willingness,3);A.equal(q.check,null);}
    const after=E.exportGame(cs);
    const freshIdx=cs.log.findIndex(x=>hash(x)===q.witnessHash);
    if(freshIdx>=0){
     A.throws(()=>R.act(cs,{system:'bond',operation:'npcPairInteract',params:{...ir,witnessIndex:freshIdx}}),/unused independent pair day/);
     A.equal(E.exportGame(cs),after);
    }
    const ci=E.importGame(after),ic=Realm.peek(ci).emergentPeople.people[p.id];
    A.equal(Interact.verify(ci,ic),true);
    ic.originalBondInteractions[0].source.after.trust=100;
    ic.originalBondInteractions[0].seal=hash(ic.originalBondInteractions[0].source);
    A.equal(Interact.verify(ci,ic),false);
    console.log('INDEPENDENT ORIGINAL PAIR INTERACTION '+JSON.stringify({event:q.event?.event??null,accepted:interaction.accepted,success:interaction.successful}));

   }else{pairCounts.declined++;A.equal(row.bond,null);}
   const afterPair=E.exportGame(s);
   A.throws(()=>R.act(s,{system:'bond',operation:'npcPairRecord',params:request}),/no repeated decision|current voluntary arrangement required/);
   A.equal(E.exportGame(s),afterPair);
   const pairCopy=E.importGame(afterPair),pairP=Realm.peek(pairCopy).emergentPeople.people[p.id];
   A.equal(Pair.verify(pairCopy,pairP),true);
   const fake=pairP.originalBondPairRecognitions[0];
   if(fake.bond)fake.bond.trust=100;else{fake.source.accepted=true;fake.seal=hash(fake.source);}
   A.equal(Pair.verify(pairCopy,pairP),false,'Recognition never establishes manufactured affection or assent');
  }
 }
 if(result.observedOutcome==='human-declined')humanRefusal++;
 if(['beast-declined','beast-proposed-changes'].includes(result.observedOutcome))beastRefusal++;
 if(mutual&&humanRefusal&&beastRefusal&&agreed&&pairCounts.recorded&&pairCounts.declined)break;
}
A.ok(mutual,'At least one genuinely mutually interested disposable pair');
A.ok(humanRefusal>0,'A human must be free to refuse; beast draw not consumed');
A.ok(beastRefusal>0,'The sapient person may refuse or request alternatives');
A.ok(agreed,'Distinct natural participants should genuinely agree to final terms in this bounded sample');
A.ok(pairCounts.recorded>0&&pairCounts.declined>0,'Distinct pairs must genuinely accept and decline separately measured pair recognition');
console.log('INDEPENDENT ORIGINAL UNCOMMITTED PAIR RECORD PASS '+JSON.stringify(pairCounts));
const arrView=Foundation.gmDossier(w,agreed.p.actorId,s).earnedEvidence.beastRelationships;
A.equal(arrView.verifiedPartners,null);
A.equal(arrView.sourceVerifiedSocialArrangements[0].status,'accepted');
const save=E.exportGame(s),copy=E.importGame(save),cp=Realm.peek(copy).emergentPeople.people[mutual.id];
const acceptedPerson=Realm.peek(copy).emergentPeople.people[agreed.p.id];
A.equal(Arrangement.verify(copy,acceptedPerson),true);
const older=E.importGame(save),olderPerson=Realm.peek(older).emergentPeople.people[agreed.p.id],olderBeast=older.beasts[b.id];
// Isolated rolling-memory eviction fixture, NOT a new encounter, elapsed
// life event or retroactively assigned consent. Exact actual archive remains.
olderBeast.sapientLife.history=[];olderBeast.sapientLife.triedEncounters=[];
A.equal(Person.verify(olderBeast),true);
A.equal(Person.contactProof(olderBeast,contact),true);
A.equal(Arrangement.verify(older,olderPerson),true);
A.equal(Pair.verify(older,olderPerson),true);
const archived=olderBeast.sapientLife.contactReceipts.find(x=>x.source.encounterHash===contact.meetingHash);
archived.source.contact.willingness=false;archived.seal=hash(archived.source);olderBeast.sapientLife.contactHead=archived.seal;
A.equal(Person.verify(olderBeast),false,'A resealed falsified original first-contact decision is rejected');
const weeklyWorld=E.newGame({name:'Disposable sixday proof law',seed:87167}),
 week={pairSeal:'pure_law_fixture',day:5,approach:'drill'};
const five=Array.from({length:5},(_,day)=>({seal:'isolated_'+day,source:{pairSeal:week.pairSeal,day,approach:'drill',check:{success:true}}}));
A.deepEqual(Interact.completedTrainingSixday(weeklyWorld,week,five),five.map(x=>x.seal));
A.deepEqual(Interact.completedTrainingSixday(weeklyWorld,week,five.slice(1)),[]);
A.deepEqual(Interact.completedTrainingSixday(weeklyWorld,{...week,day:6},five),[]);
// Isolated counting-law rows convey no actual progress to any actor.
A.equal(Object.keys(weeklyWorld.table?.realm?.emergentPeople?.people||{}).length,0);

const bad=E.importGame(save),bp=Realm.peek(bad).emergentPeople.people[agreed.p.id],
 fake=bp.originalSapientArrangements[0];
fake.source.humanChoice.accepted=false;fake.seal=hash(fake.source);
A.equal(Arrangement.verify(bad,bp),false,'Rehashed false human assent cannot create a cooperative arrangement');
const expired=E.importGame(save);
Time.advance(expired,8);
A.equal(Arrangement.privateStatus(expired,Realm.peek(expired).emergentPeople.people[agreed.p.id])[0].status,'expired');
const welfare=E.importGame(save),wp=Realm.peek(welfare).emergentPeople.people[agreed.p.id];
welfare.beasts[b.id].condition=34;
// Real original sixday welfare owner (disposable condition fixture).
Arrangement.sixday(welfare,[Math.floor(welfare.world.minutes/1440)]);
A.equal(Arrangement.privateStatus(welfare,wp)[0].status,'paused');
A.equal(Arrangement.verify(welfare,wp),true);
// Disposable recovery fixture: not an in-game medical treatment or consent.
welfare.beasts[b.id].condition=copy.beasts[b.id].condition;
const wr=wp.originalSapientArrangements[0],wb=welfare.beasts[b.id],
 reviewRng=wp.rngState,reviewBeastRng=wb.sapientLife.rngState,
 reviewWorldRng=welfare.rngState,reviewMinute=welfare.world.minutes;
C.event(welfare,'story',wp.name+' and the sapient person consider whether to continue their original voluntary arrangement after the welfare pause.',{
 origin:Arrangement.REVIEW,actorId:wp.actorId,beastId:b.id,location:site,
 minute:reviewMinute,contactHash:hash(contact),proposalHash:wr.source.proposalHash,
 arrangementHash:wr.seal,terms:wr.source.terms,
 comprehension:'Both separate people understood the unchanged terms and the option to end the arrangement.',
 communication:'Actually witnessed shared local signs',
 rightToRefuse:'Each individual can independently refuse further cooperation without compelled service.',
 noAssumedSharedLanguage:true,noMagicalPromise:true});
const reviewParams={actorId:wp.actorId,beastId:b.id,witnessIndex:welfare.log.length-1},
 beforeReview=E.exportGame(welfare);
A.throws(()=>R.act(welfare,{system:'bond',operation:'npcSapientArrangementReview',
 params:{...reviewParams,accepted:true}}),/no assigned consent/);
A.equal(E.exportGame(welfare),beforeReview);
const reviewed=R.act(welfare,{system:'bond',operation:'npcSapientArrangementReview',params:reviewParams}),
 rv=wr.events.at(-1).source;
A.equal(rv.kind,'review');A.equal(rv.previous,wr.events[0].seal);
A.equal(rv.humanChoice.rngBefore,reviewRng);
A.equal(rv.humanChoice.rngAfter,wp.rngState);
A.equal(rv.beastChoice?.rngBefore??reviewBeastRng,reviewBeastRng);
A.equal(rv.beastChoice?.rngAfter??reviewBeastRng,wb.sapientLife.rngState);
A.equal(welfare.rngState,reviewWorldRng);A.equal(welfare.world.minutes,reviewMinute);
A.equal(reviewed.mutuallyAccepted,rv.outcome==='resumed');
A.ok(['resumed','paused','withdrawn-by-human','withdrawn-by-beast'].includes(rv.outcome));
A.equal(Arrangement.privateStatus(welfare,wp)[0].status,rv.outcome==='resumed'?'accepted':rv.outcome);
A.equal(Arrangement.verify(welfare,wp),true);
A.equal(welfare.table?.bondRecords?.[b.id],undefined);
A.equal(welfare.player.partnerIds.includes(b.id),false);
const reviewedSave=E.exportGame(welfare);
A.throws(()=>R.act(welfare,{system:'bond',operation:'npcSapientArrangementReview',params:reviewParams}),
 /open same-terms arrangement and unused review day|Separate current informed final terms|Real co-present willing persons/);
A.equal(E.exportGame(welfare),reviewedSave);
const reviewCopy=E.importGame(reviewedSave),
 reviewPerson=Realm.peek(reviewCopy).emergentPeople.people[agreed.p.id];
A.equal(Arrangement.verify(reviewCopy,reviewPerson),true);
const re=reviewPerson.originalSapientArrangements[0].events.at(-1);
re.source.humanChoice.accepted=!re.source.humanChoice.accepted;re.seal=hash(re.source);
A.equal(Arrangement.verify(reviewCopy,reviewPerson),false,'Rehashed false continuation assent rejected');
console.log('INDEPENDENT SAPIENT CONTINUATION REVIEW '+JSON.stringify({outcome:rv.outcome,mutual:reviewed.mutuallyAccepted,noBond:true}));
console.log('INDEPENDENT SAPient FINAL TERMS PASS '+JSON.stringify({finalResults,accepted:true,expiry:true,welfarePause:true}));
A.equal(Bridge.verify(copy,cp),true);
const forged=cp.originalSapientProposalDiscussions[0];
forged.source.beastChoice.rngAfter=1;forged.seal=hash(forged.source);
A.equal(Bridge.verify(copy,cp),false,'Rehashed fake beast decision is not genuine willingness');
console.log('INDEPENDENT HUMAN–SAPIENT PROPOSAL DISCUSSION PASS '+JSON.stringify({results,humanRefusal,beastRefusal,mutual:true,noBond:true}));
