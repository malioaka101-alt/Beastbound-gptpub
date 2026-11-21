'use strict';
// Multiple genuinely independent disposable universes. Each child invokes
// the unchanged full native-contact + individually generated human source
// chain; no preassigned rolls, emotions, attendance or proposed outcome.
// Explicitly report failures to establish an ACTUAL source, and never count
// a fabricated fixture as a positive relationship.
const A=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const source=path.join(__dirname,'living-npc-sapient-bilateral-proposal-discussion.test.js');
const worldCount=process.env.BEASTBOUND_SAPIENT_SAMPLE_WORLD_COUNT===undefined?24:Number(process.env.BEASTBOUND_SAPIENT_SAMPLE_WORLD_COUNT);
A.ok(Number.isInteger(worldCount)&&worldCount>=24&&worldCount<=192,'Bounded, independent original world count required');
const summary={genuineWorlds:0,sourceUnavailable:0,genuinelyAcceptedRenewals:0,
 actualPairInteractions:0,pairsWithRepeatedInteractions:0,successfulPairChecks:0,earnedOriginalEvents:0,
 legallyEligibleTerrestrialPreflights:0,refusedByActualStamina:0,refusedByIllegalPhysicalBaseline:0,
 witnessedTerrestrialProposals:0,mutuallyConsideredOriginalLegs:0,humanTravelRefusals:0,beastTravelRefusals:0,
 originalPhysicalDepartures:0,originalPhysicalDepartureRefusals:0,originalOvernightDeferrals:0,
 actualVisitorNextLegProposals:0,mutuallyConsideredVisitorNextLegs:0,
 visitorNextLegHumanRefusals:0,visitorNextLegBeastRefusals:0,
 actualSecondLegDepartures:0,actualSecondLegRefusals:0,
 realFacilityReadinessProbes:0,unfundedGradeReadiness:0,
 noInferredNumericGradeOrExam:0,realReturnHomeContinuity:0,
 originalVisitorMarketOffers:0,originalVisitorMarketMutualOffers:0,
 originalVisitorMerchantRefusals:0,originalVisitorWorkerRefusals:0,
 originalVisitorMarketUnpaidProposals:0,
 originalVisitorLaterOffers:0,originalVisitorMarketWorkDeferrals:0,
 originalVisitorAfterHoursWorkDeferrals:0,originalVisitorWorkDecisions:0,
 originalVisitorWorkRefusals:0,originalVisitorRealWorkChecks:0,
 originalVisitorSuccessfulWorkChecks:0,originalVisitorEarnedPayments:0,
 originalSameVisitorGradeFeeFunded:0,
 originalVisitorUnavailableWages:0,
 laterDayOffers:0,laterDayMutualOffers:0,laterDayHumanRefusals:0,
 laterDayBeastRefusals:0,laterDaySecondDepartures:0,
 laterDaySecondDepartureRefusals:0,laterDayVerifiedHomecomings:0,
 laterDayIneligibleDeferrals:0,laterDayDaylightDeferrals:0,
 unforcedRefusals:0,worldSamples:[]};
for(let i=0;i<worldCount;i++){
 const seed=927801+i*47;
 const child=spawnSync(process.execPath,[source],{cwd:path.resolve(__dirname,'..'),
  env:{...process.env,BEASTBOUND_SAPIENT_SAMPLE_SEED:String(seed)},
  encoding:'utf8',timeout:120000,maxBuffer:1024*1024*4});
 if(child.error)throw child.error;
 if(child.status!==0){
  const output=child.stdout+'\n'+child.stderr;
  // The source may not produce a freely willing sapient encounter or a
  // bilateral recognised pair in a given world; neither may be faked.
  if(!/Real independently willing sapient encounter required|Distinct natural participants should genuinely agree|Distinct pairs must genuinely accept and decline|A human must be free to refuse|The sapient person may refuse/.test(output))
   throw Error('Non-source regression in seed '+seed+'\n'+output.slice(-4200));
  summary.sourceUnavailable++;
  summary.worldSamples.push({seed,outcome:'unavailable-original-source'});
  continue;
 }
 summary.genuineWorlds++;
 const journeys=[...child.stdout.matchAll(/INDEPENDENT ORIGINAL ACTUAL TERRESTRIAL JOURNEY (\{[^\n]+\})/g)]
  .map(x=>JSON.parse(x[1]));
 summary.originalPhysicalDepartures+=journeys.filter(x=>x.departed).length;
 summary.originalPhysicalDepartureRefusals+=journeys.filter(x=>!x.departed).length;
 const gradeProbes=[...child.stdout.matchAll(/INDEPENDENT ORIGINAL REAL VISITOR GRADE READINESS (\{[^\n]+\})/g)]
  .map(x=>JSON.parse(x[1]));
 summary.realFacilityReadinessProbes+=gradeProbes.length;
 summary.unfundedGradeReadiness+=gradeProbes.filter(x=>x.reason==='original-individual-fee-not-funded').length;
 summary.noInferredNumericGradeOrExam+=gradeProbes.filter(x=>x.noAutomaticGradeOrFee===true).length;
 const merchantOffers=[...child.stdout.matchAll(/INDEPENDENT ORIGINAL VISITOR MERCHANT WORK TERMS (\{[^\n]+\})/g)]
  .map(x=>JSON.parse(x[1]));
 summary.originalVisitorMarketOffers+=merchantOffers.length;
 summary.originalVisitorMarketMutualOffers+=merchantOffers.filter(x=>x.mutuallyAccepted).length;
 summary.originalVisitorMerchantRefusals+=merchantOffers.filter(x=>!x.merchantAccepted).length;
 summary.originalVisitorWorkerRefusals+=merchantOffers.filter(x=>x.merchantAccepted&&!x.visitorAccepted).length;
 summary.originalVisitorMarketUnpaidProposals+=merchantOffers.filter(x=>x.wagePaid===0&&
  x.notYetPerformedWork&&x.noAutomaticGrade&&x.homeRegionPreserved).length;
 const visitorLater=[...child.stdout.matchAll(/INDEPENDENT ORIGINAL VISITOR LATER MERCHANT OFFER (\{[^\n]+\})/g)]
  .map(x=>JSON.parse(x[1]));
 const visitorDeferrals=[...child.stdout.matchAll(/INDEPENDENT ORIGINAL VISITOR WORK LEGAL DEFERRED (\{[^\n]+\})/g)]
  .map(x=>JSON.parse(x[1]));
 const visitorChoices=[...child.stdout.matchAll(/INDEPENDENT ORIGINAL VISITOR WORK CHOICE (\{[^\n]+\})/g)]
  .map(x=>JSON.parse(x[1]));
 const visitorPayments=[...child.stdout.matchAll(/INDEPENDENT ORIGINAL VISITOR REAL FUNDED MERCHANT WAGE (\{[^\n]+\})/g)]
  .map(x=>JSON.parse(x[1]));
 summary.originalVisitorLaterOffers+=visitorLater.length;
 summary.originalVisitorMarketWorkDeferrals+=visitorDeferrals.length;
 summary.originalVisitorAfterHoursWorkDeferrals+=visitorDeferrals.filter(x=>
  x.reason==='market-not-actually-in-daytime-work-shift').length;
 summary.originalVisitorWorkDecisions+=visitorChoices.length;
 summary.originalVisitorWorkRefusals+=visitorChoices.filter(x=>!x.independentlyAccepted).length;
 summary.originalVisitorRealWorkChecks+=visitorChoices.filter(x=>x.realWorkRoll).length;
 summary.originalVisitorSuccessfulWorkChecks+=visitorChoices.filter(x=>x.realWorkSuccess).length;
 summary.originalVisitorEarnedPayments+=visitorPayments.length;
 const gradeFunding=[...child.stdout.matchAll(/INDEPENDENT ORIGINAL ACTUAL EARNED GRADE FEE FUNDING (\{[^\n]+\})/g)]
  .map(x=>JSON.parse(x[1]));
 summary.originalSameVisitorGradeFeeFunded+=gradeFunding.filter(x=>
  x.individuallyEarnedScales>=100&&x.originalMerchantPaidScales>=100&&
  x.individualRealWageReceipts>0&&x.actualJointFacility&&
  x.numericGradeStillUnestablished&&x.noExamOrContractOrForcedAssent).length;
 summary.originalVisitorUnavailableWages+=(child.stdout.match(/INDEPENDENT ORIGINAL VISITOR NO FUNDED WAGE/g)||[]).length;
 summary.originalOvernightDeferrals+=(child.stdout.match(/INDEPENDENT ORIGINAL TERRESTRIAL TRAVEL DEFERRED BY REAL DAYLIGHT/g)||[]).length;
 const visitorProposals=[...child.stdout.matchAll(/INDEPENDENT ORIGINAL VISITOR SECOND PROPOSAL (\{[^\n]+\})/g)]
  .map(x=>JSON.parse(x[1]));
 const nextLegs=[...child.stdout.matchAll(/INDEPENDENT ORIGINAL ACTUAL SECOND PHYSICAL TERRESTRIAL LEG (\{[^\n]+\})/g)]
  .map(x=>JSON.parse(x[1]));
 summary.actualVisitorNextLegProposals+=visitorProposals.length;
 summary.mutuallyConsideredVisitorNextLegs+=visitorProposals.filter(x=>
  x.result==='both-consider-visitor-leg').length;
 summary.visitorNextLegHumanRefusals+=visitorProposals.filter(x=>
  x.result==='visitor-human-refused').length;
 summary.visitorNextLegBeastRefusals+=visitorProposals.filter(x=>
  x.result==='visitor-beast-refused').length;
 summary.actualSecondLegDepartures+=nextLegs.filter(x=>x.departed).length;
 summary.actualSecondLegRefusals+=nextLegs.filter(x=>!x.departed).length;
 summary.realReturnHomeContinuity+=(child.stdout.match(/INDEPENDENT ORIGINAL RETURN HOME TWO-DAY CONTINUITY/g)||[]).length;
 const laterOffers=[...child.stdout.matchAll(/INDEPENDENT ORIGINAL LATER-DAY VISITOR PROPOSAL (\{[^\n]+\})/g)]
  .map(x=>JSON.parse(x[1]));
 const laterJourneys=[...child.stdout.matchAll(/INDEPENDENT ORIGINAL LATER-DAY SECOND JOURNEY (\{[^\n]+\})/g)]
  .map(x=>JSON.parse(x[1]));
 const homecomings=[...child.stdout.matchAll(/INDEPENDENT ORIGINAL LATER-DAY VERIFIED HOMECOMING (\{[^\n]+\})/g)]
  .map(x=>JSON.parse(x[1]));
 summary.laterDayOffers+=laterOffers.length;
 summary.laterDayMutualOffers+=laterOffers.filter(x=>x.result==='both-consider-visitor-leg').length;
 summary.laterDayHumanRefusals+=laterOffers.filter(x=>x.result==='visitor-human-refused').length;
 summary.laterDayBeastRefusals+=laterOffers.filter(x=>x.result==='visitor-beast-refused').length;
 summary.laterDaySecondDepartures+=laterJourneys.filter(x=>x.departed).length;
 summary.laterDaySecondDepartureRefusals+=laterJourneys.filter(x=>!x.departed).length;
 summary.laterDayVerifiedHomecomings+=homecomings.length;
 summary.laterDayIneligibleDeferrals+=(child.stdout.match(/INDEPENDENT ORIGINAL VISITOR LATER-DAY DEFERRED/g)||[]).length;
 summary.laterDayDaylightDeferrals+=(child.stdout.match(/INDEPENDENT ORIGINAL LATER-DAY DEPARTURE DEFERRED/g)||[]).length;

 const proposals=[...child.stdout.matchAll(/INDEPENDENT ORIGINAL TERRESTRIAL PROPOSAL (\{[^\n]+\})/g)]
  .map(x=>JSON.parse(x[1]));
 summary.witnessedTerrestrialProposals+=proposals.length;
 summary.mutuallyConsideredOriginalLegs+=proposals.filter(x=>x.result==='both-consider-leg').length;
 summary.humanTravelRefusals+=proposals.filter(x=>x.result==='human-refused').length;
 summary.beastTravelRefusals+=proposals.filter(x=>x.result==='beast-refused').length;
 summary.legallyEligibleTerrestrialPreflights+=(child.stdout.match(/INDEPENDENT ORIGINAL LINKED CROSS-REGION TRAVEL PREFLIGHT PASS/g)||[]).length;
 summary.refusedByActualStamina+=(child.stdout.match(/INDEPENDENT ORIGINAL LINKED TRAVEL REFUSED BY ACTUAL STAMINA/g)||[]).length;
 summary.refusedByIllegalPhysicalBaseline+=(child.stdout.match(/INDEPENDENT ORIGINAL LINKED TRAVEL REFUSED BY REAL PHYSICAL BASELINE/g)||[]).length;
 const pair=[...child.stdout.matchAll(/INDEPENDENT EXTENDED REAL PAIR PROGRESSION (\{[^\n]+\})/g)];
 if(!pair.length)throw Error('Missing genuine independent chronological pair assessment '+seed);
 const result=JSON.parse(pair[pair.length-1][1]);
 summary.genuinelyAcceptedRenewals+=result.freelyRenewed||0;
 summary.unforcedRefusals+=result.actualDaysTried-result.freelyRenewed;
 const interactions=result.actualInteractions||[result.actualInteraction].filter(Boolean);
 summary.actualPairInteractions+=interactions.length;
 if(interactions.length>1)summary.pairsWithRepeatedInteractions++;
 summary.successfulPairChecks+=interactions.filter(x=>x.checkSucceeded).length;
 summary.earnedOriginalEvents+=interactions.filter(x=>x.event!==null).length;
 summary.worldSamples.push({seed,days:result.actualDaysTried,renewed:result.freelyRenewed,
  actualEvent:result.actualInteraction?.event??null,
  observedInteractions:interactions.length,earnedEvents:interactions.filter(x=>x.event!==null).length,
  success:result.actualInteraction?.checkSucceeded??false});
}
A.ok(summary.genuineWorlds>=4,'Multiple genuinely independent source-backed human–beast pairs must exist in distinct worlds; no automatic pair is authored');
A.ok(summary.unforcedRefusals>0,'The native sapient person must be able to refuse new interaction');
A.equal(summary.witnessedTerrestrialProposals,summary.legallyEligibleTerrestrialPreflights,'Every physically eligible independent linked route must resolve one genuine source-sealed two-person proposal, without travel');
A.ok(summary.mutuallyConsideredOriginalLegs>0,'At least one original pair must genuinely consider a linked leg without assigning movement or future consent');
A.ok(summary.humanTravelRefusals>0&&summary.beastTravelRefusals>0,'Both separate travellers must be capable of independently refusing the actual one-leg proposal');
A.ok(summary.legallyEligibleTerrestrialPreflights>0,'At least one genuinely source-sufficient original independent human and existing local pair must pass the purely read-only route preflight');
A.ok(summary.genuinelyAcceptedRenewals>0,'At least one separate natural later-day renewed meeting must actually be accepted');
if(worldCount>=96){
 A.ok(summary.originalPhysicalDepartures>0,'Across many genuine worlds at least one mutually consenting original physically paid linked-leg arrival must be verified; no assigned travel');
 A.ok(summary.originalPhysicalDepartureRefusals>0,'Fresh actual departure refusal remains meaningful despite earlier mutually considered route');
 A.ok(summary.laterDayOffers>0&&summary.laterDayHumanRefusals>0&&
  summary.laterDayBeastRefusals>0,
  'A full source-born sample must show actual later-day voluntary opportunities with independent human and beast refusal');
 A.ok(summary.laterDaySecondDepartures>0&&summary.laterDayVerifiedHomecomings>0,
  'A genuine independent later-day physically paid second leg and subsequent verified original homecoming must occur; do not assign assent or recovery');
 A.ok(summary.realFacilityReadinessProbes>=summary.originalPhysicalDepartures,
  'Every genuinely signed first arrival must be eligible for a separate original facility *read-only* assessment without moving the player');
 A.ok(summary.originalVisitorMarketOffers>=summary.originalPhysicalDepartures,
  'Every genuinely arrived eligible source visitor must be able to be OFFERED an original merchant duty without moving the player or changing their home region');
 A.equal(summary.originalVisitorMarketOffers,summary.originalVisitorMarketUnpaidProposals,
  'A sourced visitor merchant offer can neither mint wages nor certify a numeric individual Grade');
 A.equal(summary.originalVisitorMarketOffers,
  summary.originalVisitorMarketMutualOffers+
  summary.originalVisitorMerchantRefusals+
  summary.originalVisitorWorkerRefusals,
  'The original merchant and independent visitor must decide separately, including fully unforced refusals');
 A.ok(summary.originalVisitorEarnedPayments<=summary.originalVisitorSuccessfulWorkChecks&&
  summary.originalVisitorSuccessfulWorkChecks<=summary.originalVisitorRealWorkChecks,
  'Physical Scales can be transferred only after a truly independent real original successful work check');
 A.equal(summary.originalSameVisitorGradeFeeFunded,summary.originalVisitorEarnedPayments,
  'Every truly paid visitor must demonstrate the exact same individual human owns 100+ original merchant-earned Scales while the individual sapient remains genuinely at the facility, never implying a numeric Grade');
 A.ok(summary.originalVisitorEarnedPayments>0,
  'Across genuinely seeded independent original worlds, at least one actual visiting worker must freely accept and succeed at an original career work roll and earn a real source-conserved merchant payment; never assign consent, work success or cash');
 A.equal(summary.originalVisitorEarnedPayments+
  summary.originalVisitorUnavailableWages,summary.originalVisitorMarketOffers,
  'Every real first-visit source sample must either earn an independently chosen paid wage or acknowledge an unpaid visitor outcome');
 A.equal(summary.realFacilityReadinessProbes,summary.noInferredNumericGradeOrExam,
  'A real site-only Grade readiness query never mints an examination, consent, fee, individual numeric Grade or player knowledge');
}
A.ok(summary.actualSecondLegDepartures<=summary.mutuallyConsideredVisitorNextLegs,
 'A second actual journey cannot exceed the number of genuinely independently mutually considered visitor-site routes');
A.equal(summary.realReturnHomeContinuity,summary.actualSecondLegDepartures,
 'Only an actually completed separately accepted original second physical leg may restore home-world duties in the assessment');
A.equal(summary.laterDayVerifiedHomecomings,summary.laterDaySecondDepartures,
 'Only a real source-paid second journey can earn a witnessed later-day homecoming');
A.ok(summary.laterDaySecondDepartures<=summary.laterDayMutualOffers,
 'A late actual return can never exceed freely mutually considered visitor proposals');
A.equal(summary.laterDayOffers,summary.laterDayMutualOffers+
 summary.laterDayHumanRefusals+summary.laterDayBeastRefusals,
 'Every new later-day choice must have a mutually considered or explicitly refused original outcome');
A.ok(summary.actualPairInteractions>0,'A genuinely new mutually accepted contact must reach an actual original interaction check opportunity');
console.log('INDEPENDENT LONGITUDINAL REAL PAIR POSITIVE SOURCE ASSESSMENT '+JSON.stringify(summary));
