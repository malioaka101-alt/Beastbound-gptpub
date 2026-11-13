'use strict';
// #20: real independent public council records-review disposition has one
// narrow lawful follow-through in its EXISTING original office docket.
// Nothing here authorises new laws, property seizure, guilt or beast control.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),W=require('../rules/world'),
 Gov=require('../world/government-offices'),
 Realm=require('../world/simulation'),
 Hearings=require('../rules/public-hearings');
const claim='Please examine the existing public charter and resident records concerning safe wetland passage and protected habitats, without treating my allegation as proven or forcing the other households to agree.';
function make(seed,issueId){
 const s=E.newGame({seed,name:'Disposable Authentic Civic Remedy',
  path:'undecided'}),w=Realm.ensure(s);
 W.advance(s,3);
 if(s.world.minutes%1440<600){
  const before=s.world.minutes;
  E.advance(s,600-s.world.minutes%1440);
  W.finalizeTime(s,before);
 }
 const recorded=R.act(s,{system:'social',operation:'hearing',params:{
  issueId,testimony:claim}});
 A.equal(recorded.heard,true);
 W.advance(s,9);
 const row=s.table.publicHearings.records.find(x=>x.hearingId===recorded.hearingId);
 A.equal(row.state,'reviewed');
 // The full original world advance legitimately uses its own independent
 // game state and must not be mistaken for an individual remedy roll.
 A.equal(Gov.verifyCivicProcedures(w.governance.reedmarch,Gov.byId.reedmarch),true);
 A.equal(Gov.verifyRecordsRemedies(w.governance.reedmarch,Gov.byId.reedmarch),true);
 return {s,w,row,gov:w.governance.reedmarch};
}
function chosen(issueId,start){
 let negative=null;
 for(let i=0;i<70;i++){
  const f=make(start+i,issueId),
   docket=f.gov.publicHearingDockets.find(x=>x.hearingId===f.row.hearingId);
  if(f.row.disposition!=='records_review'){
   A.equal(docket.recordsInspection,undefined,
    'no procedural remedy can arise from a refusal, deferral or mediation invitation');
   if(!negative)negative=f;
   continue;
  }
  if(f.w.institutions.marsh_council.capacity<45)continue;
  return {...f,negative};
 }
 throw Error('A genuinely independent council must issue a public record-review order in at least one original fixture');
}
// Zero pending original remedies must be a read-only no-op: walking every
// sovereign mandate at every world sixday would be both false work and slow.
{
 const s=E.newGame({seed:995021,name:'Disposable Unchanged Civic Tick',
  path:'undecided'}),w=Realm.ensure(s),before=E.exportGame(s);
 A.equal(Gov.followUpPublicRecordsInspections(w,w.lastTickDay),0);
 A.equal(E.exportGame(s),before);
 delete w.governance; // historical saved states can predate office registers
 A.equal(Gov.followUpPublicRecordsInspections(w,w.lastTickDay),0);
 A.equal(w.governance,undefined,
  'an irrelevant sixday may not silently reconstruct every old civic office');
}
for(const [issue,start] of [['reedbed_access',995050],['general_business',995450]]){
 const {s,w,row,gov,negative}=chosen(issue,start),
  docket=gov.publicHearingDockets.find(x=>x.hearingId===row.hearingId),
  procedure=gov.civicProcedures.find(x=>x.procedureId==='public_hearing:'+row.hearingId),
  order=docket.recordsInspection;
 A.ok(order);
 A.equal(order.source.origin,Gov.RECORDS_REMEDY);
 A.equal(order.source.originalCivicProcedureHash,procedure.hash);
 A.equal(order.source.incumbentAtDecision,procedure.source.incumbent);
 A.equal(order.source.mandateAtDecision,procedure.source.mandateNumber);
 A.equal(order.source.originalHearingHash,row.eventHash);
 A.equal(order.source.regionId,'morrowfen_basin');
 A.equal(order.source.originalPublicCharters.length,issue==='reedbed_access'?2:0);
 A.equal(order.source.noFindingOfGuilt,true);
 A.equal(order.source.noNewLaw,true);
 A.equal(order.source.noPrivateDisclosureOrForcedWitness,true);
 A.equal(order.fulfilled,null);
 A.equal(procedure.source.noNewLawEnacted,true);
 A.equal(procedure.source.noFindingOfGuilt,true);
 const initialPlayerCoins=s.player.coins,initialInventory=
  structuredClone(s.player.inventory);
 A.equal(Gov.verifyRecordsRemedies(gov,Gov.byId.reedmarch),true);
 const preNotice=Hearings.status(s).priorTestimony.find(x=>x.hearingId===row.hearingId);
 A.equal(preNotice.publicRecordsReview,null,
  'private pending council orders do not appear before their public release');
 W.advance(s,2);
 const visible=Hearings.status(s).priorTestimony.find(x=>x.hearingId===row.hearingId);
 A.equal(visible.publicRecordsReview?.ordered,true);
 A.equal(visible.publicRecordsReview.completed,false);
 W.advance(s,4);
 const completion=docket.recordsInspection.fulfilled;
 A.ok(completion,'the existing competent council must index its public source in the next actual original sixday');
 A.equal(completion.source.originalHearingHash,undefined);
 A.equal(completion.source.orderSourceHash,order.hash);
 A.equal(completion.source.publicRecordsExamined.length,
  order.source.originalPublicCharters.length);
 A.equal(completion.source.noFindingOfGuilt,true);
 A.equal(completion.source.noFinesOrCompelledBeastAction,true);
 A.equal(s.player.coins,initialPlayerCoins);
 A.deepEqual(s.player.inventory,initialInventory);
 A.equal(Gov.verifyRecordsRemedies(gov,Gov.byId.reedmarch),true);
 const pending=Hearings.status(s).priorTestimony.find(x=>x.hearingId===row.hearingId);
 A.equal(pending.publicRecordsReview.completed,false,
  'a new official notice is not public before its original release day');
 W.advance(s,3);
 const announced=Hearings.status(s).priorTestimony.find(x=>x.hearingId===row.hearingId);
 A.equal(announced.publicRecordsReview.completed,true);
 A.equal(announced.publicRecordsReview.findingOfGuilt,false);
 A.equal(announced.publicRecordsReview.newLawEnacted,false);
 A.equal(announced.publicRecordsReview.noCompulsoryPrivateOrBeastAction,true);
 const beforeRepeatRng=s.rngState,beforeWorldRng=w.rngState;
 A.equal(Gov.followUpPublicRecordsInspections(w,w.lastTickDay),0,
  'an original completed order cannot be executed twice');
 A.equal(s.rngState,beforeRepeatRng);
 A.equal(w.rngState,beforeWorldRng,
  'repeated administrative status reads never draw another world decision');
 const saved=E.exportGame(s),restored=E.importGame(saved);
 A.equal(E.exportGame(restored),saved);
 A.equal(Gov.verifyRecordsRemedies(restored.table.realm.governance.reedmarch,
  Gov.byId.reedmarch),true);
 const tampered=structuredClone(order);
 order.source.originalPublicCharters.push({houseId:'imaginary',name:'Nonexistent'});
 order.hash=require('node:crypto').createHash('sha256')
  .update(JSON.stringify(order.source)).digest('hex');
 A.equal(Gov.verifyRecordsRemedies(gov,Gov.byId.reedmarch),false,
  'rehashing a fabricated household cannot establish new legal evidence');
 docket.recordsInspection=tampered;
 A.equal(Gov.verifyRecordsRemedies(gov,Gov.byId.reedmarch),true);
 const forged=structuredClone(tampered.fulfilled);
 docket.recordsInspection.fulfilled.source.completedDay+=5;
 docket.recordsInspection.fulfilled.hash=require('node:crypto')
  .createHash('sha256').update(JSON.stringify(
   docket.recordsInspection.fulfilled.source)).digest('hex');
 A.equal(Gov.verifyRecordsRemedies(gov,Gov.byId.reedmarch),false,
  'a complete rehash still cannot forge original review chronology or release');
 docket.recordsInspection.fulfilled=forged;
 A.equal(Gov.verifyRecordsRemedies(gov,Gov.byId.reedmarch),true);
 const old=E.exportGame(s);
 A.equal(Hearings.status(s).priorTestimony.find(x=>x.hearingId===row.hearingId).
  publicRecordsReview.completed,true);
 A.equal(E.exportGame(s),old,'the public legal-remedy view is read-only');
 const legacy=structuredClone(s);
 delete legacy.table.realm.governance.reedmarch.publicHearingDockets.
  find(x=>x.hearingId===row.hearingId).recordsInspection;
 A.equal(Gov.verifyRecordsRemedies(legacy.table.realm.governance.reedmarch,
  Gov.byId.reedmarch),true,
  'old proceedings must remain readable without retroactively inventing an order');
 if(negative){
  const d=negative.gov.publicHearingDockets.find(x=>x.hearingId===negative.row.hearingId);
  A.equal(d.recordsInspection,undefined);
  A.equal(Gov.verifyRecordsRemedies(negative.gov,Gov.byId.reedmarch),true);
 }
}
console.log('Foundation #20 original jurisdictional administrative remedy: actual independent council public records order, authored existing local charters and witness, later competent staff follow-through, public release, no guilt/law/compulsion, two unlike issues, tamper/save/replay/legacy PASS');
