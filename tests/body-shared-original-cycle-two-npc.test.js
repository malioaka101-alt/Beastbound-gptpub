'use strict';
// Original PC and independent human Bone-Marrow anatomy must remain the
// SAME law, not a generic Body level or free healing/technique grant.
const A=require('node:assert/strict');
const Disc=require('../rules/disciplines');
const Body=require('../rules/independent-original-body-cycle-two');
const Law=require('../rules/body-shared-original-cycle-two');
const Potential=require('../rules/potential-mechanics');
A.equal(Law.required(),180);
A.equal(Law.baseDC(),14);
A.equal(Law.riteDC(),19);
A.equal(Law.toughGain,1);
A.equal(Law.seriousBoxGain,1);
A.deepEqual(Law.METHODS,['bone','marrow','recovery']);
A.deepEqual(Disc.KEYS.body.tracks.cycle2,[180,14]);
A.equal(Potential.PRIMARY.body.cycle2,'physicalAdaptation');
A.equal(Potential.METHODS.body.bone,'physicalAdaptation');
A.equal(Potential.METHODS.body.marrow,'physicalAdaptation');
A.match(Disc.breakthrough.toString(),/body-shared-original-cycle-two/);
A.match(Disc.breakthrough.toString(),/cycleTwoLaw\.toughGain/);
A.match(Disc.breakthrough.toString(),/cycleTwoLaw\.seriousBoxGain/);
A.equal(Body.verify({table:{}},{originalBodyCycleTwo:undefined}),true);
A.equal(Body.verify({table:{}},{
 originalBodyCycleTwo:{completed:true},
 originalFirstPowerMilestones:{body:{completedCycle:'Bone-Marrow Cycle'}}
}),false,'A claimed Cycle II cannot replace a witnessed Cycle I receipt');
A.throws(()=>Body.privateStatus({table:{}},{
 originalBodyCycleTwo:{completed:true}
}),/source was altered/);
console.log('Original Body Cycle II player/NPC anatomical law and anti-forgery contract PASS');
