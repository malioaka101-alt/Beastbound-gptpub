'use strict';
// Original Third Circle law parity: no synthetic matrix, spell, tutor or
// independent bonus, and no Rank III from an unsigned saved declaration.
const A=require('node:assert/strict');
const Disc=require('../rules/disciplines');
const Build=require('../rules/build');
const Second=require('../rules/independent-original-arcane-circle-two');
const Matrix=require('../rules/independent-original-arcane-matrix-three');
const Law=require('../rules/arcane-shared-original-matrix');
A.equal(Law.DC,20);
A.equal(Law.MANA_COST,4);
A.equal(Law.REQUIRED,6);
A.equal(Law.staminaCost(180),2);
A.equal(Law.staminaCost(120),1);
A.equal(Law.stabilityBonus(85),1);
A.equal(Law.stabilityBonus(59),-2);
A.equal(Law.earned({degree:'exceptional',success:true}),6);
A.equal(Law.earned({degree:'strong',success:true}),3);
A.equal(Law.earned({degree:'success',success:true}),2);
for(const degree of ['setback','failure','severe failure'])
 A.equal(Law.earned({degree,success:false}),0);
A.equal(Law.stabilityAfter(90,{degree:'severe failure',success:false}),81);
A.equal(Law.stabilityAfter(90,{degree:'success',success:true}),91);
A.equal(Law.stabilityAfter(3,{degree:'severe failure',success:false}),0);
A.equal(Law.integrity(0,1,90),60);
A.equal(Build.arcaneProfile(3).channels,3);
A.match(Disc.matrixWork.toString(),/arcane-shared-original-matrix/);
A.match(Disc.matrixWork.toString(),/matrixLaw\.earned\(check\)/);
A.match(Disc.matrixWork.toString(),/matrixLaw\.MANA_COST/);
A.match(Disc.matrixWork.toString(),/matrixLaw\.staminaCost\(minutes\)/);
A.equal(Matrix.verify({table:{}},{originalArcaneMatrix:undefined}),true);
A.equal(Matrix.verify({table:{}},{originalArcaneMatrix:{completed:true}}),false,
 'A forged matrix is not earned progression');
A.throws(()=>Matrix.privateStatus({table:{}},{
 originalArcaneMatrix:{completed:true},originalArcaneCore:{circles:3}
}),/source was altered/);
A.equal(Second.verify({table:{}},{originalArcaneCircleTwo:{completed:true}}),false);
console.log('Original Arcane Third Circle matrix law and forged-stage contract PASS');
