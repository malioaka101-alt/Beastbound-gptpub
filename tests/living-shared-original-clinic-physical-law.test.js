'use strict';
// Shared original PC/NPC clinical PHYSICAL effect contract. These are pure
// projections of the existing funded, sixday in-patient law, NOT simulated
// treatment of an unfunded independent citizen or a free wound repair.
const A=require('node:assert/strict'),
 Combat=require('../rules/combat'),
 Original=require('../rules/shared-original-clinic-recovery'),
 Clinic=require('../rules/clinic-care');
A.equal(Original.ORIGINAL_OWNER,'rules/clinic-care.js:recover');
A.equal(Original.DAYS,6);
A.equal(Original.COST_SCALES,3000);
const human=Combat.makeCombatant({name:'Disposable patient',
 toughness:10,defense:12,vigor:1});
human.wounds=[2,2,0];
human.stamina=1;human.recoverUses=1;human.firstAided=true;
const raw=JSON.stringify(human),
 projection=Original.project(human),
 second=Original.project(structuredClone(human));
A.deepEqual(projection,second,'One original clinical law for all real wound combatants');
A.deepEqual(projection.woundsAfter,[0,1,0]);
A.equal(projection.staminaAfter,human.maxStamina);
A.equal(projection.seriousBefore,2);
A.equal(projection.lightBefore,2);
A.equal(projection.recoverUsesAfter,0);
A.equal(projection.firstAidedAfter,false);
A.equal(JSON.stringify(human),raw,
 'A public source-law projection must NOT heal an NPC or spend money by itself');
A.equal(projection.noMedicalRoll,true);
A.equal(projection.noTimeOrMoneyChangedByProjection,true);
const noSerious=structuredClone(human);noSerious.wounds=[2,0,0];
A.throws(()=>Original.project(noSerious),/verified Serious wound/);
const critical=structuredClone(human);critical.wounds=[1,1,1];
A.throws(()=>Original.project(critical),/no Critical wound/);
const incapacitated=structuredClone(human);
incapacitated.status='incapacitated';
A.throws(()=>Original.project(incapacitated),/conscious human/);
const forged=structuredClone(human);forged.wounds=[0,80,0];
A.throws(()=>Original.project(forged),/real Combat body/);
const emptyStamina=structuredClone(human);emptyStamina.maxStamina=0;
emptyStamina.stamina=0;
A.equal(Original.project(emptyStamina).staminaAfter,0,
 'Existing original Combat allows a legal zero-Stamina body without a fictional extra eligibility gate');
A.equal(typeof Clinic.verifyHistory,'function',
 'The original paid-consultation, sixday-clock and money-verification owner remains intact');
console.log('Shared original sixday clinical physical law PASS: unchanged one Serious wound, Light recovery, real Combat Stamina, zero extra time/dice/money or free NPC healing; original independent doctor/payment gates retained');
