'use strict';
// Shared exact existing player/individual Body Organ Cycle III law.
// Early-stage histories cannot be forged by declaring cycles or technique.
const A=require('node:assert/strict');
const Disc=require('../rules/disciplines');
const Body=require('../rules/independent-original-body-organ-cycle-three');
const Second=require('../rules/independent-original-body-cycle-two');
const Law=require('../rules/body-shared-original-organ-cycle-three');
A.equal(Law.DC,17);
A.equal(Law.REQUIRED_PER_ORGAN,2);
A.equal(Law.STAMINA_GAIN,2);
A.equal(Law.TOUGHNESS_GAIN,1);
A.equal(Law.CRITICAL_BOX_GAIN,1);
A.equal(Law.staminaCost(120),1);
A.equal(Law.staminaCost(180),2);
A.deepEqual(Law.ORGANS,['heart','lungs','liver','kidneys']);
A.deepEqual(Law.FOCI,['heart','lungs','liver','kidneys','integrated']);
A.deepEqual(Law.empty(),{heart:0,lungs:0,liver:0,kidneys:0});
const n=Law.grow(Law.empty(),false,'integrated','success');
A.equal(n.integrated,true);
A.deepEqual(n.organs,{heart:1,lungs:1,liver:1,kidneys:1});
A.equal(Law.formed(n.organs,n.integrated),false);
const z=Law.grow(n.organs,n.integrated,'integrated','success');
A.equal(Law.formed(z.organs,z.integrated),true);
A.equal(Law.gain('exceptional'),3);
A.equal(Law.gain('strong'),2);
A.equal(Law.gain('success'),1);
A.equal(Law.gain('failure'),0);
A.match(Disc.organWork.toString(),/OrganLaw.grow/);
A.match(Disc.organWork.toString(),/OrganLaw.formed/);
A.match(Disc.organWork.toString(),/OrganLaw.STAMINA_GAIN/);
A.equal(Body.verify({table:{}},{originalBodyOrganCycleThree:undefined}),true);
A.equal(Body.verify({table:{}},{
 originalBodyOrganCycleThree:{completed:true}
}),false,'No forged Cycle III without genuinely earned Cycle II proof');
A.equal(Second.verify({table:{}},{
 originalBodyCycleTwo:{completed:true}
}),false);
A.throws(()=>Body.privateStatus({table:{}},{
 originalBodyOrganCycleThree:{completed:true}
}),/physical evidence was altered/);
// This short smoke also exercises real original PC Cycle III organ-forming
// actions with their existing saved source, costs and combat effects.
require('./body-organ-cycle-three.test.js');
console.log('Original player/individual Body Cycle III organ law parity and unearned-stage rejection PASS');
