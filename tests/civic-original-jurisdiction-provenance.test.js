'use strict';
// Foundation #18: a real original civic act belongs to its actual polity,
// local region, governing office and incumbent AT THAT ACT. No invented law,
// criminal finding, compulsory command, royal family or legal fee.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),W=require('../rules/world'),
 Gov=require('../world/government-offices'),
 Atlas=require('../world/atlas'),Realm=require('../world/simulation'),
 Petitions=require('../world/civic-petitions'),
 Hearings=require('../world/public-hearings');
const fresh=(seed=994201)=>E.newGame({
 seed,name:'Disposable Original Jurisdiction Test',path:'undecided'});
const act=(s,operation,params={})=>
 R.act(s,{system:'social',operation,params});
const statement='Please consider public records access and wetland ferry passage for ordinary residents and beast-safe refuge routes, without asserting any accusation as settled law.';
{
 const s=fresh(),w=Realm.ensure(s),day=w.lastTickDay;
 const territory=Atlas.LOCATION_REGION.crossing;
 A.equal(territory,'morrowfen_basin');
 A.equal(Atlas.R[territory].polity,'reedmarch');
 const snap=Gov.jurisdictionSnapshot(w,'reedmarch',territory,day);
 A.equal(snap.governingBody,'March Council');
 A.equal(snap.incumbent,'Iria Highwater');
 A.equal(snap.noAutomaticEnforcement,true);
 const old=E.exportGame(s),rng=s.rngState;
 A.throws(()=>Gov.jurisdictionSnapshot(w,'asterwyn',territory,day),
  /real present civic jurisdiction/);
 A.throws(()=>Gov.jurisdictionSnapshot(w,'reedmarch','imaginary_palace',day),
  /real present civic jurisdiction/);
 A.throws(()=>Gov.attestOriginalCivicProcedure(s,w,{
  kind:'public_hearing',witnessId:'invented_hearing_0001'}),
  /real present civic jurisdiction|real independently verified local council decision/);
 A.throws(()=>Gov.attestOriginalCivicProcedure(s,w,{
  kind:'royal_confiscation',witnessId:'fabricated_title_001'}),
  /real independently decided original civic review/);
 A.equal(E.exportGame(s),old);
 A.equal(s.rngState,rng);
 A.deepEqual(Gov.historicalCivicProcedures(w,'reedmarch').originalAttestedReviews,[]);
}
{
 const s=fresh(994202),w=Realm.ensure(s);
 const petition=act(s,'petition',{statement});
 A.equal(petition.filed,true);
 W.advance(s,6);
 const person=s.table.civicPetitions.records[0],
  official=w.civicPetitionReviews[0];
 A.ok(Petitions.sourceCheck(s,person));
 A.equal(person.state,'at_counter');
 A.equal(official.source,Petitions.REVIEW);
 const rows=Gov.historicalCivicProcedures(w,'reedmarch').originalAttestedReviews;
 A.equal(rows.length,1);
 const first=rows[0],stored=w.governance.reedmarch.civicProcedures[0];
 A.equal(first.procedureId,'citizen_petition:'+person.petitionId);
 A.equal(first.originalDecision,person.decision);
 A.equal(first.originalSourceHash,person.eventHash);
 A.equal(first.regionId,'morrowfen_basin');
 A.equal(first.officeholderAtReview,'Iria Highwater');
 A.equal(first.noEnactedLaw,true);
 A.equal(first.noFindingOfGuilt,true);
 A.equal(stored.source.originalReviewHash,
  require('../world/emergent-groups').hash(official));
 A.equal(stored.source.noNewRightToCompel,true);
 A.equal(first.publicReleaseDay,person.decision==='docketed'?official.day+2:null);
 A.equal(Gov.verifyCivicProcedures(w.governance.reedmarch,Gov.byId.reedmarch),true);
 const old=E.exportGame(s),rng=s.rngState;
 A.throws(()=>Gov.attestOriginalCivicProcedure(s,w,{
  kind:'citizen_petition',witnessId:person.petitionId}),
  /already recorded/);
 A.equal(E.exportGame(s),old);A.equal(s.rngState,rng);
 const future=official.day+1;
 const priorHolder=first.officeholderAtReview;
 const officeChange=Gov.transition(w,'reedmarch',future,{
  random:()=>.99});
 A.equal(officeChange.changed,true);
 A.notEqual(w.governance.reedmarch.holder,priorHolder);
 A.equal(Gov.verifyCivicProcedures(w.governance.reedmarch,Gov.byId.reedmarch),true);
 A.equal(Gov.historicalCivicProcedures(w,'reedmarch').
  originalAttestedReviews[0].officeholderAtReview,priorHolder,
  'A later electoral result cannot rewrite the actual earlier clerk and council');
 A.throws(()=>Gov.jurisdictionSnapshot(w,'reedmarch','morrowfen_basin',official.day),
  /real present civic jurisdiction/,
  'A later incumbent cannot use a later mandate as retroactive approval');
 const saved=E.exportGame(s),copy=E.importGame(saved);
 A.deepEqual(Gov.historicalCivicProcedures(copy.table.realm,'reedmarch'),
  Gov.historicalCivicProcedures(w,'reedmarch'));
 A.equal(E.exportGame(copy),saved);
 stored.source.originalReview.decision='invented_conscription_law';
 A.equal(Gov.verifyCivicProcedures(w.governance.reedmarch,Gov.byId.reedmarch),false);
 A.throws(()=>Gov.ensure(w),/jurisdictional procedure/);
}
{
 const s=fresh(994203),w=Realm.ensure(s);
 W.advance(s,3);
 const previous=s.world.minutes,minute=previous%1440;
 if(minute<600){
  E.advance(s,600-minute);
  W.finalizeTime(s,previous);
 }
 A.equal(E.day(s),4);
 const spoken=act(s,'hearing',{issueId:'general_business',testimony:statement});
 A.equal(spoken.heard,true);
 const before=Gov.historicalCivicProcedures(w,'reedmarch');
 A.equal(before.originalAttestedReviews.length,0);
 W.advance(s,9);
 const hearing=s.table.publicHearings.records[0],
  resolved=w.publicHearingReviews[0];
 A.equal(Hearings.sourceCheck(s,hearing),true);
 A.equal(hearing.state,'reviewed');
 A.equal(resolved.source,Hearings.REVIEW);
 const rows=Gov.historicalCivicProcedures(w,'reedmarch').originalAttestedReviews;
 A.equal(rows.length,1);
 A.equal(rows[0].procedureId,'public_hearing:'+spoken.hearingId);
 A.equal(rows[0].originalDecision,hearing.disposition);
 A.equal(rows[0].originalSourceHash,hearing.eventHash);
 A.equal(rows[0].publicReleaseDay,hearing.releaseDay);
 A.equal(rows[0].noEnactedLaw,true);
 A.equal(rows[0].officeholderAtReview,w.governance.reedmarch.holder);
 A.equal(Gov.verifyCivicProcedures(w.governance.reedmarch,Gov.byId.reedmarch),true);
 const old=E.exportGame(s),rng=s.rngState;
 A.throws(()=>Gov.attestOriginalCivicProcedure(s,w,{
  kind:'public_hearing',witnessId:hearing.hearingId}),/already recorded/);
 A.equal(E.exportGame(s),old);A.equal(s.rngState,rng);
 const saved=E.exportGame(s),copy=E.importGame(saved);
 A.deepEqual(Gov.historicalCivicProcedures(copy.table.realm,'reedmarch'),
  Gov.historicalCivicProcedures(w,'reedmarch'));
 A.equal(E.exportGame(copy),saved);
 const stamp=w.governance.reedmarch.civicProcedures[0].hash;
 w.governance.reedmarch.civicProcedures[0].source.regionId='many_nest';
 A.equal(Gov.verifyCivicProcedures(w.governance.reedmarch,Gov.byId.reedmarch),false);
 A.equal(w.governance.reedmarch.civicProcedures[0].hash,stamp);
}
{
 const s=fresh(994204),w=Realm.ensure(s);
 // Earlier saves with no such procedural history are NOT retroactively
 // assigned invented original public hearings or official acts.
 delete w.governance.reedmarch.civicProcedures;
 A.equal(Gov.verifyCivicProcedures(w.governance.reedmarch,Gov.byId.reedmarch),true);
 A.deepEqual(Gov.historicalCivicProcedures(w,'reedmarch').originalAttestedReviews,[]);
}
console.log('Original constitutional jurisdiction: authentic existing local petitions/hearings bind only actual original officeholder and region; later public mandates cannot forge history, and no legislation, guilt, rights, compulsion or coins are invented');
