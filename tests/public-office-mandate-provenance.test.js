'use strict';
// Original world civic mandate history, no arbitrary new government engine.
// Only actual existing original lawful government transitions are audited.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Realm=require('../world/simulation'),Gov=require('../world/government-offices');
const s=E.newGame({seed:997101,name:'Existing Government Record Test',path:'undecided'}),
 w=Realm.ensure(s),id='reedmarch',c=Gov.byId[id],v=w.governance[id];
A.equal(Gov.royalID(id),false);
A.equal(v.holder,c.first);
A.equal(v.mandateNumber,0);
A.equal(Gov.verifyMandateAudit(v,c),true);
A.equal(Gov.historicMandates(w,id).actualMandates.length,0);
const playerRandom=s.rngState,originalWorldRandom=w.rngState,
 initialTreasury=w.countries[id].treasury,
 originalOther=w.governance.asterwyn.holder;
let draws=0;
const first=Gov.transition(w,id,w.lastTickDay,{random:()=>{
 draws++;return .03;},emit:()=>{}});
A.equal(draws,1,'Renewal uses ONLY the first original independent world decision');
A.equal(first.changed,false);
A.equal(v.mandateNumber,1);
A.equal(Gov.historicMandates(w,id).actualMandates.length,1);
A.equal(Gov.historicMandates(w,id).actualMandates[0].previous,c.first);
const sequence=[.99,.01];let position=0;
const changed=Gov.transition(w,id,w.lastTickDay,{
 random:()=>sequence[position++],emit:()=>{}});
A.equal(position,2,'A contested original mandate takes exactly two existing world choices');
A.equal(changed.changed,true);
A.equal(v.holder,c.relativeCandidate);
A.equal(v.mandateNumber,2);
A.equal(w.counters.changesOfGovernment,1);
A.equal(v.mandateHistory[1].source.firstDraw,.99);
A.equal(v.mandateHistory[1].source.secondDraw,.01);
A.equal(Gov.historicMandates(w,id).actualMandates.length,2);
A.equal(Gov.verifyMandateAudit(v,c),true);
A.equal(w.governance.asterwyn.holder,originalOther);
A.equal(w.countries[id].treasury,initialTreasury);
A.equal(s.rngState,playerRandom);
A.equal(w.rngState,originalWorldRandom,
 'Existing supplied independent world choices are only witnessed, never rerolled');
const closed=E.exportGame(s);
const copy=E.importGame(closed);
const original=Gov.historicMandates(w,id);
A.deepEqual(Gov.historicMandates(copy.table.realm,id),original);
A.equal(E.exportGame(copy),closed);
const row=v.mandateHistory[1];
row.source.next=c.independent;
A.equal(Gov.verifyMandateAudit(v,c),false);
A.throws(()=>Gov.historicMandates(w,id),/civic mandate evidence|leadership record/i);
row.source.next=c.relativeCandidate;
A.equal(Gov.verifyMandateAudit(v,c),true);
A.throws(()=>Gov.transition(w,'asterwyn',w.lastTickDay,{
 random:()=>.9}),/hereditary sovereign may not be replaced/);
A.equal(w.governance.asterwyn.holder,originalOther);
// Older saves recorded officeholder and count but NOT actual earlier ballots.
// Reconstruct only the earliest verifiable present-day audit anchor.
const older=E.importGame(closed),office=older.table.realm.governance[id],
 present=office.holder,mandate=office.mandateNumber;
delete office.auditVersion;delete office.auditAnchor;delete office.mandateHistory;
Gov.ensure(older.table.realm);
A.equal(office.auditAnchor.holder,present);
A.equal(office.auditAnchor.mandateNumber,mandate);
A.equal(office.mandateHistory.length,0);
A.equal(Gov.verifyMandateAudit(office,c),true);
A.ok(office.auditAnchor.note.includes('historic names and decisions were not recorded'));
console.log('Original government continuity: real independently made civic mandates retained with original decision source, no secondary political dice, no free treasury/royal succession, verified old-save anchor and historical save integrity');
