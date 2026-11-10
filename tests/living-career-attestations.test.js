'use strict';
// Foundation #17: author a document only after genuinely earned work and a
// source-witnessed actual institution decision. All games are disposable.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Time=require('../rules/world'),Realm=require('../world/simulation'),
 Career=require('../world/person-careers');
function context(seed){
 const s=E.newGame({seed,name:'Local Work Recognition',path:'undecided'}),
  w=Realm.ensure(s);
 Time.advance(s,240);
 const p=Object.values(w.emergentPeople.people).find(x=>{
  const officer=Object.values(w.notables).find(y=>
   y.polity===x.polity&&w.institutions[y.institution]?.status==='active');
  return x.status==='active'&&x.fatigue<75&&officer;
 });
 A.ok(p,'Use a genuine living worker, never fabricate a new person to issue papers');
 const officer=Object.values(w.notables).find(y=>
  y.polity===p.polity&&w.institutions[y.institution]?.status==='active');
 return {s,w,p,officer,day:w.lastTickDay};
}
function successfulWork(w,p,day){
 let receipt=p.career.workReceipts.findLast(x=>x.source.outcome.success);
 for(let i=0;!receipt&&i<45;i++){
  Career.work(w,p,day);
  receipt=p.career.workReceipts.findLast(x=>x.source.outcome.success);
 }
 A.ok(receipt,'Competence must come from a real successful earlier check');
 return receipt;
}
const note='The established professional witnessed the work, reviewed its original outcome and separately agreed to record a limited practical attestation.';
{
 const {s,w,p,officer,day}=context(953171);
 const failed='fabricated-system-master';
 A.throws(()=>Career.issueAttestation(w,p,{
  id:failed,issuerId:officer.institution,witnessId:officer.id,
  method:'invented-gravity-magic',scope:'Unbounded supernatural control',
  witness:note,day}),/successful|earlier work/);
 const receipt=successfulWork(w,p,day),method=receipt.source.task.method;
 const oldRank=p.career.competenceRank,oldFunds=p.funds,oldRng=s.rngState;
 const a=Career.issueAttestation(w,p,{id:'ecology-source-credential',
  issuerId:officer.institution,witnessId:officer.id,method,
  scope:'Documented local practical work using the witnessed existing method',
  witness:note,day,expiresDay:day+6});
 A.equal(a.noFormalLicenceImplied,true);
 A.equal(a.noMagicOrEmploymentGranted,true);
 A.equal(a.earnedWorkHash,receipt.sourceHash);
 A.equal(s.rngState,oldRng,'A signature is not an extra random advancement');
 A.equal(p.career.competenceRank,oldRank);
 A.equal(p.funds,oldFunds,'Issuing proof pays no fantasy salary');
 A.equal(p.career.recognizedLicence,null);
 A.deepEqual(p.career.supernaturalSystemRanks,{});
 A.equal(Career.verify(p),true);
 A.equal(Career.attestationStatus(p,{day})[0].status,'issued');
 A.equal(Career.attestationStatus(p,{day:day+7})[0].status,'expired');
 const frozen=E.exportGame(s),copy=E.importGame(frozen);
 const cp=copy.table.realm.emergentPeople.people[p.id];
 A.deepEqual(Career.attestationStatus(cp,{day}),
  Career.attestationStatus(p,{day}));
 A.equal(E.exportGame(copy),frozen);
 A.throws(()=>Career.issueAttestation(w,p,{id:'ecology-source-credential',
  issuerId:officer.institution,witnessId:officer.id,method,
  scope:'Documented local practical work using the witnessed existing method',
  witness:note,day}),/real active institution/);
 A.throws(()=>Career.issueAttestation(w,p,{id:'another-practice-attest',
  issuerId:'unseen-guild',witnessId:officer.id,method,
  scope:'Claimed oversight from an organisation not present in the world',
  witness:note,day}),/real active institution/);
 A.equal(E.exportGame(s),frozen,'Refusal never mutates original work');
 for(let i=0;i<40;i++)Career.work(w,p,day);
 A.ok(p.career.workReceipts.length<=24);
 A.equal(Career.verify(p),true,
  'Original issuing evidence survives the short career receipt window');
 const second=E.importGame(E.exportGame(s));
 A.equal(Career.verify(second.table.realm.emergentPeople.people[p.id]),true);
}
{
 const {s,w,p,officer,day}=context(953172);
 const receipt=successfulWork(w,p,day);
 Career.issueAttestation(w,p,{id:'source-attested-survey',
  issuerId:officer.institution,witnessId:officer.id,
  method:receipt.source.task.method,
  scope:'Recorded competence in this specific independently completed task',
  witness:note,day});
 const oldWork=p.career.workCount;
 const done=Career.revokeAttestation(w,p,{id:'source-attested-survey',day,
  reason:'An observed institution decision has explicitly withdrawn this particular recognition.'});
 A.equal(done.originalWorkRetained,true);
 A.equal(Career.attestationStatus(p,{day})[0].status,'revoked');
 A.equal(p.career.workCount,oldWork);
 A.equal(Career.verify(p),true);
 const snap=E.exportGame(s),copy=E.importGame(snap);
 A.equal(Career.attestationStatus(
  copy.table.realm.emergentPeople.people[p.id],{day})[0].status,'revoked');
 A.throws(()=>Career.revokeAttestation(w,p,{id:'source-attested-survey',day,
  reason:'Attempt to withdraw the same original decision a second time'}),
  /real earlier attestation/);
 A.equal(E.exportGame(s),snap);
 p.career.attestations[0].scope='No evidence needed for any magical title';
 A.equal(Career.verify(p),false,'Source seals guard witness scope after reload');
}
console.log('Existing independent careers: source-authored bounded practical attestation, actual worker and issuer witness, no licence/power/pay, durable proof, expiry and independent revocation');
