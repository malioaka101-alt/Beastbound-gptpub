'use strict';
// Disposable source-born adult. This is ONLY an original doctor's eligibility
// read. There is no NPC treatment, payment, admission, coerced decision,
// historical patient or secretly healed Serious/Critical wound in this test.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Rules=require('../rules'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),
 Atlas=require('../world/atlas'),Combat=require('../rules/combat'),
 Triage=require('../rules/independent-clinic-readiness');
const s=E.newGame({seed:190252,name:'Disposable source-owned clinic triage'}),
 w=Realm.ensure(s),list=People.ensure(w),region=Atlas.R.lumenfall;
A.ok(region&&People.siteFor(region.id)==='academy',
 'An existing real physician site must exist before reviewing NPC care');
Object.assign(w.ecosystems[region.id],{
 quality:76,pressure:18,water:80,forage:79});
Object.assign(w.countries[region.polity],{
 prosperity:77,stability:81});
const demand=People.sourceDemand(w,region);
A.ok(demand,'Existing ecology and livelihood must actually generate the patient');
const p=People._debug.make(w,list,0,demand);
p.shift=People.shift(p,0,w);
s.world.minutes=600;
s.world.location='academy';
s.chatRuntime||={};
const witness=p.name+' is an uninjured, unarmed, unarmoured adult directly witnessed in this real Lumenfall Annex scene.';
s.chatRuntime.scene=witness;
A.ok(People.verify(w,p));
const before=E.exportGame(s),beforeRng=p.rngState;
const unlinked=Triage.inspect(s,p.actorId);
A.equal(unlinked.physicallyAssessed,false,
 'An invented healthy body cannot be added by an innocent clinic eligibility query');
A.equal(unlinked.canOfferOnlyAfterIndependentConsentAndPaidIntake,undefined);
A.equal(E.exportGame(s),before);
const linked=Rules.act(s,{system:'health',operation:'linkWitnessedHuman',
 params:{npcId:p.actorId,witness}});
A.equal(linked.created,true);
const body=Combat.get(s,linked.id);
const baseline=Triage.inspect(s,p.actorId);
A.equal(baseline.eligibleForOriginalClinic,false);
A.equal(baseline.actualAttendanceEstablished,true,
 'Real current personal shift and original established physician, not the PC location alone');
const injury=Combat.harm(s,body,3);
A.ok(injury.result.includes('Serious'));
A.equal(body.wounds[1],1);
const injured=E.exportGame(s),woundBefore=[...body.wounds];
const request=Triage.inspect(s,p.actorId);
A.equal(request.eligibleForOriginalClinic,true);
A.equal(request.actualAttendanceEstablished,true);
A.equal(request.fundedByVerifiedCash,false,
 'Original abstract livelihood funds are NEVER spendable clinic cash');
A.equal(request.sixdayFeeScales,3000);
A.equal(request.sixdayCourseDays,6);
A.equal(request.canOfferOnlyAfterIndependentConsentAndPaidIntake,false,
 'Even an eligible, physically present patient cannot receive unpaid care by decree');
A.equal(request.privateToGM,true);
A.equal(request.noTreatmentOrConsent,true);
A.equal(E.exportGame(s),injured);
A.equal(p.rngState,beforeRng,'Triage must never roll or pre-decide consent');
A.deepEqual(body.wounds,woundBefore);
const critical=E.importGame(injured),
 cc=Combat.get(critical,linked.id);
cc.wounds[2]=1;
A.equal(Triage.inspect(critical,p.actorId).eligibleForOriginalClinic,false,
 'The original outpatient sixday course never treats Critical wounds');
const fakeFunds=E.importGame(injured),
 forged=Realm.peek(fakeFunds).emergentPeople.people[p.id];
forged.cashScales=3000;
A.throws(()=>Triage.inspect(fakeFunds,p.actorId),
 /refuses invented person, attributes or spendable cash/,
 'Rewriting unsourced cash is not a legitimate payment source');
const replay=E.importGame(injured);
A.deepEqual(Triage.inspect(replay,p.actorId),request);
A.throws(()=>Triage.inspect(s,'emergent:person_999999'),
 /refuses invented person, attributes or spendable cash/);
A.equal(s.table.combatants.player?.wounds[1]||0,0,
 'An NPC clinical query cannot edit the player');
console.log('Original independent clinic eligibility PASS: genuine source-born patient and wound, actual Lumenfall physician/shift, cash provenance, privacy, no fabricated payment, independent consent, extra time/roll or free healing');
