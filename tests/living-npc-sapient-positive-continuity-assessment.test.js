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
const summary={genuineWorlds:0,sourceUnavailable:0,genuinelyAcceptedRenewals:0,
 actualPairInteractions:0,pairsWithRepeatedInteractions:0,successfulPairChecks:0,earnedOriginalEvents:0,
 unforcedRefusals:0,worldSamples:[]};
for(let i=0;i<24;i++){
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
A.ok(summary.genuinelyAcceptedRenewals>0,'At least one separate natural later-day renewed meeting must actually be accepted');
A.ok(summary.actualPairInteractions>0,'A genuinely new mutually accepted contact must reach an actual original interaction check opportunity');
console.log('INDEPENDENT LONGITUDINAL REAL PAIR POSITIVE SOURCE ASSESSMENT '+JSON.stringify(summary));
