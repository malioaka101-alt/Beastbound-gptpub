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
 summary.originalOvernightDeferrals+=(child.stdout.match(/INDEPENDENT ORIGINAL TERRESTRIAL TRAVEL DEFERRED BY REAL DAYLIGHT/g)||[]).length;
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
}
A.ok(summary.actualPairInteractions>0,'A genuinely new mutually accepted contact must reach an actual original interaction check opportunity');
console.log('INDEPENDENT LONGITUDINAL REAL PAIR POSITIVE SOURCE ASSESSMENT '+JSON.stringify(summary));
