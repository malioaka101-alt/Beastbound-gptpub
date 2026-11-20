'use strict';
// #177: zero fabricated campaign/actor history. Original player Second Circle
// and independent NPC share one law, while unsigned NPC claims fail closed.
const A=require('node:assert/strict');
const Disc=require('../rules/disciplines'),
 Build=require('../rules/build'),
 Law=require('../rules/arcane-shared-original-circle-two'),
 NPC=require('../rules/independent-original-arcane-circle-two');
A.equal(Law.MANA_COST,2);
A.equal(Law.DC,17);
A.equal(Law.REQUIRED,4);
A.equal(Law.stabilityBonus(85),1);
A.equal(Law.stabilityBonus(59),-2);
A.equal(Law.stabilityBonus(70),0);
A.equal(Law.earned({degree:'exceptional',success:true}),4);
A.equal(Law.earned({degree:'strong',success:true}),3);
A.equal(Law.earned({degree:'success',success:true}),2);
for(const degree of ['setback','failure','severe failure'])
 A.equal(Law.earned({degree,success:false}),0);
A.equal(Law.stabilityAfter(90,{degree:'severe failure',success:false}),83);
A.equal(Law.stabilityAfter(90,{degree:'success',success:true}),91);
A.equal(Law.stabilityAfter(90,{degree:'setback',success:false}),90);
A.equal(Law.stabilityAfter(2,{degree:'severe failure',success:false}),0);
A.equal(Build.arcaneProfile(2).channels,2);
A.deepEqual(Disc.KEYS.arcane.tracks.circle1,[100,12]);
A.match(Disc.arcaneCircleWork.toString(),/arcane-shared-original-circle-two/);
A.match(Disc.arcaneCircleWork.toString(),/circleLaw\.earned\(result\)/);
A.match(Disc.arcaneCircleWork.toString(),/circleLaw\.MANA_COST/);
A.match(Disc.arcaneCircleWork.toString(),/circleLaw\.DC/);
A.equal(NPC.verify({table:{}},{originalArcaneCircleTwo:{completed:true}}),false,
 'A false Circle cannot pass source replay');
A.equal(NPC.verify({table:{}},{originalArcaneCircleTwo:undefined}),true,
 'No historical advanced claim is distinct from a forged earned Circle');
A.throws(()=>NPC.privateStatus({table:{}},{
 originalArcaneCore:{circles:2},originalArcaneCircleTwo:{completed:true}
}),/source was altered/);
console.log('Original Second Arcane Circle shared law and no-forged-stage contract PASS');
