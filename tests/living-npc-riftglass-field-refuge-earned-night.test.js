'use strict';
// A truly autonomous original Rift Sense I actor, starting ONLY with the
// disclosed synthetic source-replayed preliminary First Rite preparation,
// earns one actual SURVIVAL-surveyed Riftglass refuge on an independently
// chosen REST day. The original 45-minute/3-Stamina camp survey check and
// the ORIGINAL individual voluntary overnight sleep choice remain unforced.
// Assert original Combat.completedNight and source replay/import/forgery,
// never a promised safe ruins site, wizardry, stage or extra player clock.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine'),Rules=require('../rules'),World=require('../rules/world'),
 Realm=require('../world/simulation'),Lives=require('../world/independent-person-lives'),
 Field=require('../rules/independent-riftglass-field-refuge'),
 Offscreen=require('../world/independent-original-power-days'),
 Sense=require('../rules/independent-original-rift-sense-observation'),
 Recover=require('../rules/independent-original-riftglass-one-recover'),
 Wilderness=require('../rules/wilderness-camp'),
 Foundation=require('../world/person-mechanical-foundations');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const {fixture}=require('./living-npc-original-soul-body-rift-first-milestones.test.js');
const seed=973987,{s,p,day}=fixture('rift','breakthrough',seed),
 rite=Rules.act(s,{system:'discipline',
  operation:'npcOriginalFirstMilestone',
  params:{actorId:p.actorId,system:'rift'}});
A.equal(rite.observedOutcome,'breakthrough');
const w=Realm.peek(s),life=w.independentPersonLives.people[p.id];
life.lastDay=day;A.equal(Lives.verifyEntry(w,life),true);
const first=s.world.minutes;
E.advance(s,180*1440);World.finalizeTime(s,first);
A.equal(Sense.verify(s,p),true);
A.equal(Field.verify(s,p),true);
A.equal(Recover.verify(s,p),true);
A.equal(Offscreen.verifyNights(s,p),true);
const camp=p.originalRiftglassFieldRest?.attempts.find(x=>
 x.source.shelterSurveySucceeded&&x.source.nightAccepted);
A.ok(camp,'This sampled original life must actually earn a difficult outdoor camp and freely accept sleep');
const q=camp.source,night=p.originalOffscreenCombatNights?.find(x=>
 x.source.originalFieldSurveyHash===camp.seal);
A.ok(night,'The actual completed eight-hour Combat night must link this verified original Survival survey');
A.equal(q.originalIndependentRestDay.action,'rest');
A.equal(camp.seal,hash(q));
A.equal(q.originalShiftHash,q.originalShiftProof.hash);
A.equal(q.check.success,true);
A.equal(q.check.dc,Wilderness.SITES.ruins.dc+
 Wilderness.weatherPenalty(q.weather));
A.equal(q.scoutStaminaSpent,Wilderness.STAMINA);
A.equal(q.scoutMinutes,Wilderness.MINUTES);
A.equal(q.staminaAfterSurvey,q.staminaBefore-Wilderness.STAMINA);
A.equal(q.nightChoice.accepted,true);
A.equal(q.nightChoice.location,'ruins');
A.equal(q.nightChoice.rngBefore,CoreAfterScout(q.rngBefore,q.check.roll));
A.equal(q.nightChoiceHash,hash(q.nightChoice));
A.equal(q.validUntilMinute>=night.source.endMinute,true);
A.equal(night.source.originalFieldNightChoiceHash,q.nightChoiceHash);
A.equal(night.source.before.stamina,q.staminaAfterSurvey);
A.equal(night.source.after.stamina,night.source.after.maxStamina);
A.deepEqual(night.source.after.wounds,[
 Math.max(0,night.source.before.wounds[0]-1),
 night.source.before.wounds[1],night.source.before.wounds[2]]);
A.equal(night.source.site,'ruins');
A.equal(night.source.noAdditionalPlayerTimeOrFreePower,true);
A.equal(Field.verifiedNight(s,p,night.source),true);
const independentlyRefusedOrFailed=
 (p.originalRiftglassFieldRest?.attempts||[]).filter(x=>
  !x.source.shelterSurveySucceeded||!x.source.nightAccepted);
A.ok(independentlyRefusedOrFailed.length>=1,
 'Original personal Riftglass surveying must also preserve truly unsuccessful/declined nights');
for(const refused of independentlyRefusedOrFailed){
 const r=refused.source;
 A.equal(r.scoutStaminaSpent,Wilderness.STAMINA,
  'A failed independently chosen Survival survey still spends real physical Stamina');
 A.equal(r.staminaAfterSurvey,r.staminaBefore-Wilderness.STAMINA);
 A.equal((p.originalOffscreenCombatNights||[]).some(x=>
  x.source.originalFieldSurveyHash===refused.seal),false,
  'Neither a failed outdoor survey nor a personally refused sleep creates overnight wound/Stamina recovery');
 if(!r.shelterSurveySucceeded){
  A.equal(r.nightChoice,null,
   'No original person may be asked to sleep in a site that failed the source-owner Survival survey');
  A.equal(r.validUntilMinute,null,
   'An unsuccessful survey cannot yield an 18-hour free refuge');
 }else{
  A.equal(r.nightChoice?.accepted,false,
   'A genuine refusal must be preserved rather than coerced into resting');
 }
}
A.equal((p.originalOvernightRestDecisions||[]).length,0,
 'Non-settlement verified field night is not a made-up city room');
const trulyRenewed=p.originalRiftglassRecover?.renewals||[];
A.ok(trulyRenewed.length>=1,
 'This personally source-earned full Riftglass Combat night should permit a later genuinely CHOSEN second Recover, never a free once-per-day recharge');
for(const row of trulyRenewed){
 const reset=row.source.originalCombatNight;
 A.equal(reset.seal,row.source.originalCombatNightSourceHash);
 A.equal(Offscreen.verifyNights(s,p,[reset]),true);
 A.equal(row.source.originalRecoverResetOnlyByActualNight,true);
 A.equal(row.source.recoverUsesBefore,0);
 A.equal(row.source.recoverUsesAfter,1);
 A.ok(reset.source.endMinute<=row.source.startMinute,
  'Original eight-hour Combat sleep must precede each later source-owned Recover use');
 A.equal(row.source.actualOriginalRecoverGain,
  Math.min(row.source.maximumStamina,
   row.source.staminaBefore+Math.max(0,2+row.source.vigorAtAttempt))-
   row.source.staminaBefore);
}
A.deepEqual(p.knownTechniques,[]);
const d=Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence;
A.ok(d.originalRiftglassFieldRefuge?.personallyAcceptedOriginalFieldNights>=1,
 'GM privacy view must count only actually witnessed source-verified Combat field nights');
A.equal(d.originalRiftglassFieldRefuge.originalSurvivalRuleOwner,
 'rules/wilderness-camp.js');
A.equal(d.originalRiftglassFieldRefuge.originalSurveyStaminaCost,
 Wilderness.STAMINA);
A.equal(d.originalRiftglassFieldRefuge.temporaryRefugeNotPermanentHousing,true);
if(d.originalRiftExteriorAnchorMarking)
 A.equal(d.originalRiftExteriorAnchorMarking.hasActualVerifiedRiftglassSafeSleep,true);
const saved=E.exportGame(s),imported=E.importGame(saved),
 cp=Realm.peek(imported).emergentPeople.people[p.id];
A.equal(Field.verify(imported,cp),true);
A.equal(Recover.verify(imported,cp),true);
A.equal(Offscreen.verifyNights(imported,cp),true);
A.deepEqual(cp.originalRiftglassFieldRest,p.originalRiftglassFieldRest);
const fake=E.importGame(saved),fp=Realm.peek(fake).emergentPeople.people[p.id],
 forged=fp.originalRiftglassFieldRest.attempts.find(x=>x.seal===camp.seal);
forged.source.check.dc=2;forged.seal=hash(forged.source);
A.equal(Field.verify(fake,fp),false,
 'Resealed impossible easy Riftglass Survival DC cannot establish shelter');
const fakeNight=E.importGame(saved),np=Realm.peek(fakeNight).emergentPeople.people[p.id],
 editedNight=np.originalOffscreenCombatNights.find(x=>
 x.source.originalFieldSurveyHash===camp.seal);
editedNight.source.originalFieldSurveyHash='f'.repeat(64);
editedNight.seal=hash(editedNight.source);
A.equal(Offscreen.verifyNights(fakeNight,np),false,
 'Forging a valid-looking fake wilderness campsite source cannot create night-scale healing');
const fakeChoice=E.importGame(saved),pc=Realm.peek(fakeChoice).emergentPeople.people[p.id],
 nightChoice=pc.originalRiftglassFieldRest.attempts.find(x=>x.seal===camp.seal);
nightChoice.source.nightChoice.accepted=false;
nightChoice.source.nightAccepted=false;
nightChoice.source.nightChoiceHash=hash(nightChoice.source.nightChoice);
nightChoice.seal=hash(nightChoice.source);
A.equal(Field.verify(fakeChoice,pc),false,
 'A personally accepted original sleep cannot be forged into refusal with rehashed evidence');
function CoreAfterScout(rngBefore,expected){
 const x={rngState:rngBefore},roll=require('../rules/core').die(x,20);
 A.equal(roll,expected);return x.rngState;
}
console.log('SOURCE-VERIFIED RIFTGLASS REFUGE: original DC20+ Survival/3 Stamina, genuine volunteered overnight sleep, original Combat full night, no automatic shelter, import and 3 resealed forgeries all rejected PASS; world seed '+seed);
