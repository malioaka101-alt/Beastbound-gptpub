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
 reports.push({seed,originalRiftReading:!!p.originalRiftMeasuredSense?.successfulReading,
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
