'use strict';
// Preserve the EXACT original player route and Stamina law while an
// independent sapient route is only a non-mutating source preflight.
const A=require('node:assert/strict'),E=require('../engine'),
 Law=require('../rules/travel-shared-original-law'),
 Preflight=require('../rules/independent-sapient-terrestrial-preflight');
A.deepEqual(Law.legSpec('forest'),{minutes:75,stamina:4});
A.deepEqual(Law.legSpec('ruins'),{minutes:145,stamina:4});
A.deepEqual(Law.legSpec('crossing'),{minutes:75,stamina:4});
A.throws(()=>Law.legSpec(''),/destination required/);
const s=E.newGame({name:'Disposable original terrestrial route parity',seed:987331,path:'undecided'});
let previous=s.world.minutes,stamina=s.player.stamina;
A.equal(s.world.location,'crossing');
A.equal(E.dispatch(s,'travel fen').ok,true);
A.equal(s.world.location,'fen');A.equal(s.world.minutes-previous,75);
A.equal(s.player.stamina,Math.max(0,stamina-4));
previous=s.world.minutes;stamina=s.player.stamina;
A.equal(E.dispatch(s,'travel ruins').ok,true);
A.equal(s.world.location,'ruins');A.equal(s.world.minutes-previous,145);
A.equal(s.player.stamina,Math.max(0,stamina-4));
previous=s.world.minutes;stamina=s.player.stamina;
A.equal(E.dispatch(s,'travel academy').ok,false,'No invented original direct route from ruins to academy');
A.equal(s.world.minutes,previous);A.equal(s.world.location,'ruins');A.equal(s.player.stamina,stamina);
A.deepEqual(Preflight.routeStatus(s,null,null,'crossing'),{
 privateToGM:true,proposalEligible:false,reason:'missing-original-individual-or-established-destination',
 noMovementOrConsentOrGrade:true});
const saved=E.exportGame(s),copy=E.importGame(saved);
A.equal(E.exportGame(copy),saved);
console.log('ORIGINAL TERRESTRIAL TRAVEL PARITY PASS '+JSON.stringify({
 verifiedLegs:[{from:'crossing',to:'fen',minutes:75,stamina:4},
 {from:'fen',to:'ruins',minutes:145,stamina:4}],
 noInventedDirectRoute:true,noIndependentMovementGranted:true}));
