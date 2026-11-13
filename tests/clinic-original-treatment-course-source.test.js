'use strict';
// #24: Genuine serious-injury healing uses the SAME original wound, clinic,
// clock, finances and receipts. This is a disposable test patient only.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine.js'),R=require('../rules'),
 H=require('../rules/unified'),Combat=require('../rules/combat'),
 Clinic=require('../rules/clinic-care'),Core=require('../rules/core');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const act=(s,op,params={})=>R.act(s,{system:'health',operation:op,params});
const s=E.newGame({seed:240024,name:'Original Medical Course Patient',path:'undecided'});
A.equal(E.dispatch(s,'travel academy').ok,true);
H.ensurePlayer(s);
const patient=Combat.get(s,'player');
patient.wounds=[2,2,0];
const originalWounds=[...patient.wounds],originalBank=s.player.coins,
 rng=s.rngState,initialMinute=s.world.minutes;
const admission=act(s,'clinicIntake');
A.equal(admission.seriousWounds,undefined);
A.equal(s.world.minutes,initialMinute+15);
A.equal(s.player.coins,originalBank);
A.equal(s.rngState,rng);
const started=E.exportGame(s);
A.throws(()=>act(s,'clinicRecover',{caseId:'different_case'}),/current unused/);
A.equal(E.exportGame(s),started);
const savedIntake=s.log.at(-1);
A.equal(savedIntake.details.origin,'engine-clinic-intake');
const recovered=act(s,'clinicRecover',{caseId:admission.caseId});
A.equal(recovered.recovered,true);
A.equal(recovered.noExtraRoll,true);
A.deepEqual(patient.wounds,[0,1,0]);
A.equal(s.player.coins,originalBank-30);
A.equal(s.world.minutes,initialMinute+15+6*1440);
A.equal(s.rngState,rng);
A.equal(s.table.clinicCare.receipts.length,1);
A.equal(Clinic.verifyHistory(s),true);
const row=s.table.clinicCare.receipts[0],course=row.source;
A.equal(row.sourceHash,hash(course));
A.equal(course.intakeHash,hash(savedIntake));
A.equal(course.originalIntake.details.caseId,admission.caseId);
A.equal(course.originalCompletion.details.seriousAfter,1);
A.equal(course.paidScales,3000);
A.equal(course.balanceBeforeScales-course.balanceAfterScales,3000);
A.equal(course.finishedAtMinute-course.startedAtMinute,6*1440);
A.equal(row.seriousBefore,originalWounds[1]);
A.equal(row.seriousAfter,1);
A.equal(act(s,'clinicStatus').recentReceipts[0].originalSourceVerified,true);
const saved=E.exportGame(s);
A.equal(E.exportGame(E.importGame(saved)),saved);
A.throws(()=>act(s,'clinicRecover',{caseId:admission.caseId}),/current unused/);
A.equal(E.exportGame(s),saved);
// Rotating ordinary observation logs must never delete the actual clinic's
// old consultation/payment/healing witnesses.
for(let i=0;i<120;i++)Core.event(s,'world','Unrelated visible town event '+i,{i});
A.equal(Clinic.verifyHistory(s),true);
A.equal(act(s,'clinicStatus').recentReceipts[0].originalSourceVerified,true);
// Even a re-sealed invented injury result is not a medical receipt.
const original=structuredClone(row);
row.source.seriousAfter=99;row.sourceHash=hash(row.source);
A.throws(()=>act(s,'clinicStatus'),/completed clinical course/);
s.table.clinicCare.receipts[0]=structuredClone(original);
A.equal(Clinic.verifyHistory(s),true);
s.table.clinicCare.receipts[0].source.originalIntake.details.seriousWounds=99;
A.throws(()=>Clinic.verifyHistory(s),/completed clinical course/);
s.table.clinicCare.receipts[0]=structuredClone(original);
A.equal(Clinic.verifyHistory(s),true);
s.table.clinicCare.receipts[0].source.balanceAfterScales++;
s.table.clinicCare.receipts[0].sourceHash=hash(s.table.clinicCare.receipts[0].source);
A.throws(()=>Clinic.verifyHistory(s),/completed clinical course/);
s.table.clinicCare.receipts[0]=structuredClone(original);
// Earlier clinical saves with no extra source attachment remain historical;
// they may not be misrepresented as newly independently authenticated.
const older=E.importGame(saved);
delete older.table.clinicCare.receipts[0].source;
delete older.table.clinicCare.receipts[0].sourceHash;
A.equal(Clinic.verifyHistory(older),true);
A.equal(act(older,'clinicStatus').recentReceipts[0].originalSourceVerified,false);
A.equal(older.table.combatants.player.wounds[1],1);
A.equal(s.player.coins,originalBank-30);
A.equal(patient.wounds[2],0);
console.log('Existing paid clinical sixday recovery has permanently source-backed consultation, conserved money delta, genuine wound change, no second roll, replay/rotation and legacy compatibility');
