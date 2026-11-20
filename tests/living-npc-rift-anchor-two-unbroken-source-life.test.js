'use strict';
// Honest source-owned longitudinal Riftglass exterior study, not a stage
// grant. ORIGINAL Step I historical preparation below is a transparent
// pre-replayed disposable fixture. Each REAL Step I rite, exterior reading,
// Anchor II work day, choice, DC, strain, wound and environment after that
// belongs to the existing independently acting NPC and world source.
//
// An actual non-settlement Riftglass ruin has no verified original safe
// overnight shelter. The game must NOT mint full Stamina every calendar
// day or pretend an offscreen camp exists just to produce a completed anchor.
// This acceptance test reports an actually earned Anchor II if it happens,
// or a source-replayed exertion bottleneck otherwise. Neither is fabricated.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine'),Rules=require('../rules'),World=require('../rules/world'),
 Realm=require('../world/simulation'),Lives=require('../world/independent-person-lives'),
 Early=require('../rules/independent-original-discipline-preparation'),
 Sense=require('../rules/independent-original-rift-sense-observation'),
 Anchor=require('../rules/independent-original-rift-exterior-anchor-two'),
 Recover=require('../rules/independent-original-riftglass-one-recover'),
 SenseLaw=require('../rules/rift-shared-original-exterior-sense'),
 Law=require('../rules/rift-shared-original-anchor-law'),
 Foundation=require('../world/person-mechanical-foundations');
const {fixture}=require('./living-npc-original-soul-body-rift-first-milestones.test.js');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const options=[];
for(let i=0;i<14;i++){
 const seed=973800+i*17,{s,p,day}=fixture('rift','breakthrough',seed);
 const rite=Rules.act(s,{system:'discipline',operation:'npcOriginalFirstMilestone',
  params:{actorId:p.actorId,system:'rift'}});
 A.equal(rite.observedOutcome,'breakthrough');
 const w=Realm.peek(s),life=w.independentPersonLives.people[p.id];
 life.lastDay=day;
 A.equal(Lives.verifyEntry(w,life),true);
 A.equal(p.originalFirstPowerMilestones?.rift?.step,1);
 const body=s.table.combatants['npc_'+p.id];
 A.equal(body.status,'ok');
 options.push({s,p,life,body,seed,day,startingStamina:body.stamina,
  startingWounds:[...body.wounds],
  originalInt:p.mechanicalFoundation.baselineAttributes.int});
}
// Score only ALREADY existent anatomy; no future dice/decisions are searched,
// adjusted, assigned or overwritten. All 14 independent lives are actually
// simulated, including subjects who do not form an anchor.
options.sort((a,b)=>b.startingStamina-a.startingStamina||
 b.originalInt-a.originalInt||a.seed-b.seed);
let acceptedTotal=0,sensedTotal=0,completions=0,exhaustions=0;
const reports=[];let audited=null;
for(const item of options){
 const {s,p,body,seed,startingStamina}=item;
 const before=s.world.minutes;
 // Same original individual calendar processes EACH of these 180 true days
 // exactly once, with no extra player action, clock, selected check or rite.
 E.advance(s,180*1440);World.finalizeTime(s,before);
 A.equal(Early.verify(s,p),true);
 A.equal(Sense.verify(s,p),true);
 A.equal(Anchor.verify(s,p),true);
 A.equal(Recover.verify(s,p),true);
 A.equal(Lives.verifyEntry(Realm.peek(s),item.life),true);
 const sensed=p.originalRiftMeasuredSense?.attempts||[],
  anchors=p.originalRiftExteriorAnchor?.attempts||[],
  chargedSense=sensed.filter(x=>x.source.accepted),
  chargedAnchors=anchors.filter(x=>x.source.accepted),
  spent=chargedSense.length*SenseLaw.STAMINA_COST+
   chargedAnchors.length*Law.staminaCost(120),
  trueOnceRecover=p.originalRiftglassRecover?.source?.actualOriginalRecoverGain||0,
  formed=p.originalRiftExteriorAnchor?.completed===true;
 sensedTotal+=chargedSense.length;
 acceptedTotal+=chargedAnchors.length;
 if(formed)completions++;
 if(body.stamina<Law.staminaCost(120))exhaustions++;
 A.ok(body.stamina<=startingStamina-spent+trueOnceRecover&&body.stamina>=0,
  'True Rift expenditure is a minimum; a personally CHOSEN rest day may restore at most ONE source-verified Combat Recover. Other independently original actions also spend Stamina; no unsafe-site sleep inferred');
 A.equal((p.originalOffscreenCombatNights||[]).length,0,
  'A Riftglass exterior ruin is not an independently verified settlement bedroom');
 A.equal((p.originalOvernightRestDecisions||[]).length,0,
  'A remote field worker has no invented witnessed safe shelter');
 A.deepEqual(p.knownTechniques,[],
  'An exterior anchor never creates a Fold, portal or spell technique');
 const r=p.originalRiftExteriorAnchor;
 if(formed){
  A.ok(r.anchor&&r.integrated);
  A.deepEqual(r.axes,{bearing:2,resonance:2,stability:2});
  A.equal(r.anchor.noFoldStepVaultEntryOrPortalGranted,true);
  A.equal(r.anchor.integrity,r.anchorIntegrity);
 }else if(r){
  A.equal(r.anchor,null);
  A.ok(!r.integrated||Law.AXES.some(k=>r.axes[k]<2));
 }
 const d=Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence;
 A.equal(d.originalPowerMilestones.rift.step,formed?2:1);
 if(r){
  A.equal(d.originalRiftExteriorAnchorMarking.noFoldOrVaultAccess,true);
  A.equal(d.originalRiftExteriorAnchorMarking.currentOriginalCombatStamina,
   body.stamina,'GM-only Rift readiness must read the real Combat source');
  A.equal(d.originalRiftExteriorAnchorMarking.nextOriginalAnchorPracticeStaminaCost,
   Law.staminaCost(120));
  A.equal(d.originalRiftExteriorAnchorMarking.originalOneRecoverActuallyUsed,
   !!p.originalRiftglassRecover);
  A.equal(d.originalRiftExteriorAnchorMarking.sourceVerifiedOneRecoverGain,
   trueOnceRecover);
  A.equal(d.originalRiftExteriorAnchorMarking.furtherOriginalRecoverNeedsRealNight,
   (body.recoverUses||0)>=1);
  A.equal(d.originalRiftExteriorAnchorMarking.actualPhysicalReadinessForAnotherAnchor,
   !formed&&body.status==='ok'&&body.wounds.every(x=>x===0)&&
    body.stamina>=Law.staminaCost(120));
  A.equal(d.originalRiftExteriorAnchorMarking.hasActualVerifiedRiftglassSafeSleep,
   false,'An observed dangerous field site is not a fictitious safe bedroom');
  A.equal(d.originalRiftExteriorAnchorMarking.provenRiftglassAnchor===null,
   !formed);
 }
 const summary={seed,int:item.originalInt,initial:startingStamina,
  remaining:body.stamina,originalSingleRecoverGain:trueOnceRecover,
  otherOriginalExertionOrDamage:
   startingStamina-spent+trueOnceRecover-body.stamina,
  readingChecks:chargedSense.length,
  anchorChecks:chargedAnchors.length,
  anchorAxes:r?.axes||null,integrated:r?.integrated||false,
  strain:r?.strain||0,formed,
  earnedProof:r?.anchor?.id||null};
 reports.push(summary);
 if(!audited&&chargedAnchors.length)audited=item;
}
A.ok(sensedTotal>=1,
 'A genuinely original Riftglass exterior measurement was never attempted');
A.ok(acceptedTotal>=1,
 'The independent bounded sample did not contain a paid original Anchor II practice');
A.ok(audited,'Source-owned spatial Anchor II receipts must exist before replay');
const {s,p}=audited,reading=p.originalRiftMeasuredSense?.successfulReading;
A.ok(reading,'The examined original Anchor II work must follow a personally successful Rift reading');
const anchor=p.originalRiftExteriorAnchor,accepted=anchor.attempts.find(x=>x.source.accepted);
A.equal(accepted.seal,hash(accepted.source));
A.equal(accepted.source.originalReadingSourceHash,reading.sourceHash);
A.equal(accepted.source.originalReadingSnapshotHash,reading.readingSnapshotHash);
A.equal(accepted.source.check.dc,Law.dc(accepted.source.snapshot));
A.equal(accepted.source.sampleHash,SenseLaw.digest(accepted.source.snapshot));
A.equal(accepted.source.staminaSpent,Law.staminaCost(120));
A.equal(accepted.source.noFoldOrVaultRouteByAnchorAlone,true);
const exported=E.exportGame(s),imported=E.importGame(exported),
 copy=Realm.peek(imported).emergentPeople.people[p.id];
A.equal(Sense.verify(imported,copy),true);
A.equal(Anchor.verify(imported,copy),true);
A.equal(Recover.verify(imported,copy),true);
A.deepEqual(copy.originalRiftExteriorAnchor,anchor);
const tampered=E.importGame(exported),
 falsePerson=Realm.peek(tampered).emergentPeople.people[p.id];
const falseRow=falsePerson.originalRiftExteriorAnchor.attempts.find(x=>x.source.accepted);
falseRow.source.check.dc=2;
falseRow.seal=hash(falseRow.source);
A.equal(Anchor.verify(tampered,falsePerson),false,
 'A resealed easy Rift geometry check cannot create a true original spatial anchor');
console.log('Authentic independent Riftglass II 14-source-life acceptance PASS: '+
 JSON.stringify({sensedTotal,acceptedTotal,completions,exhaustions,reports}));
console.log(completions?
 'At least one original personally formed full Rift Anchor II, no Fold/vault access.':
 'Original Rift II FULL FORMATION STILL UNPROVEN: no fabricated rest at remote ruins; true physical exertion bottleneck.');
