'use strict';
// #18: only actual historical public offices at an original interstate
// status transition. Officeholders are NOT treaty signatories or envoys.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine.js'),Realm=require('../world/simulation'),
 Gov=require('../world/government-offices'),Atlas=require('../world/atlas'),
 W=require('../rules/world');
const seal=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const s=E.newGame({seed:997936,name:'Disposable Bilateral Office History',path:'undecided'}),
 w=Realm.ensure(s),
 pair=Object.entries(w.diplomacy).find(([key,d])=>
  (Atlas.P[d.a].rival===d.b||Atlas.P[d.b].rival===d.a)&&
  d.status==='strained'&&d.cooldown===0&&
  (!Gov.royalID(d.a)||!Gov.royalID(d.b)));
A.ok(pair,'An original rivalry with real public offices is required');
const [key,d]=pair,coins=s.player.coins,clock=structuredClone(s);
A.equal(Realm.verifyDiplomaticOfficeContexts(w,key),true);
A.equal(Realm.diplomaticTransitionHistory(w,key).transitions.length,0);
d.tension=100; // Disposable pressure; original world monthly decision remains real.
W.advance(s,30);
E.advance(clock,30*1440);
A.equal(d.status,'war');
A.equal(s.player.coins,coins);
A.equal(s.rngState,clock.rngState);
A.equal(Realm.verifyDiplomaticAudit(d,key),true);
A.equal(Realm.verifyDiplomaticOfficeContexts(w,key),true);
const row=d.diplomaticAudit.transitions[0],source=row.source;
A.equal(source.officeContextOrigin,Realm.BILATERAL_OFFICE_CONTEXT);
A.equal(source.noSignedBilateralTreaty,true);
A.equal(source.noEnvoyConsentInferred,true);
A.deepEqual(source.officesAtChange.map(x=>x.polity),[d.a,d.b]);
for(const context of source.officesAtChange){
 const h=Gov.historicMandates(w,context.polity),
  charter=Gov.byId[context.polity],
  matches=h.actualMandates.filter(x=>x.number<=context.mandateNumber&&
   x.day<=source.day),
  latest=matches.at(-1);
 A.equal(context.office,charter.title);
 A.equal(context.governingBody,charter.governingBody);
 A.equal(context.governingForm,charter.government);
 A.equal(context.incumbent,latest?.next??h.originalAuditAnchor.holder);
 A.equal(context.mandateNumber,latest?.number??h.originalAuditAnchor.mandateNumber);
 A.equal(context.originalAnchorHash,seal(h.originalAuditAnchor));
 A.equal(context.lastOriginalMandateHash,latest?.sourceHash||null);
 A.equal(context.noRepresentativeConsentAsserted,true);
 A.equal(context.noForeignSovereigntyGranted,true);
}
const firstSnapshot=structuredClone(source.officesAtChange);
d.tension=0;
W.advance(s,30);
E.advance(clock,30*1440);
A.equal(d.status,'truce');
A.equal(s.rngState,clock.rngState);
A.equal(s.player.coins,coins);
A.equal(Realm.verifyDiplomaticOfficeContexts(w,key),true);
const view=Realm.diplomaticTransitionHistory(w,key);
A.equal(view.transitions.length,2);
A.deepEqual(view.transitions[0].originalOfficesAtChange,firstSnapshot);
A.equal(view.transitions[1].originalOfficesAtChange.length,2);
A.ok(w.chronicle.filter(x=>x.subject===key).every(x=>x.releaseDay===x.day+14));
A.ok(w.chronicle.filter(x=>x.subject===key).every(x=>
 !/(?:signed|treaty|envoy|agreed|consented|negotiated)/i.test(x.text)));
const saved=E.exportGame(s),clone=E.importGame(saved);
A.equal(E.exportGame(clone),saved);
A.deepEqual(Realm.diplomaticTransitionHistory(clone.table.realm,key),view);
// A later actual original mandate renewal cannot rewrite past incumbents.
const nonRoyal=[d.a,d.b].find(x=>!Gov.royalID(x));
const next=Gov.transition(w,nonRoyal,w.lastTickDay,{
 random:()=>.99,emit:()=>{}});
A.ok(next.mandateNumber>=1);
A.equal(Realm.verifyDiplomaticOfficeContexts(w,key),true);
A.deepEqual(d.diplomaticAudit.transitions[0].source.officesAtChange,firstSnapshot);
// Rehashing a counterfeit official cannot make it true against actual
// original independent government mandate evidence.
const oldSource=structuredClone(row.source),oldHash=row.hash;
row.source.officesAtChange[0].incumbent='Imagined diplomatic signatory';
row.hash=seal(row.source);
A.equal(Realm.verifyDiplomaticAudit(d,key),false,
 'The newly source-linked original public courier copy now independently rejects a forged government transition hash');
A.equal(Realm.verifyDiplomaticOfficeContexts(w,key),false);
A.throws(()=>Realm.diplomaticTransitionHistory(w,key),
 /original diplomatic relation history|actual historical civic office/i);
row.source=oldSource;row.hash=oldHash;
A.equal(Realm.verifyDiplomaticOfficeContexts(w,key),true);
// Older originally recorded transitions lack representative details;
// never attach modern officeholders retroactively.
const older=E.importGame(saved),relation=older.table.realm.diplomacy[key];
for(const item of relation.diplomaticAudit.transitions){
 delete item.source.officesAtChange;
 delete item.source.officeContextOrigin;
 delete item.source.noSignedBilateralTreaty;
 delete item.source.noEnvoyConsentInferred;
 // This disposable older checkpoint predates BOTH the newer historical
 // office-context and durable courier-copy evidence. Neither must be
 // reconstructed from a current incumbent or imagined publication.
 delete item.publicCourier;
 item.hash=seal(item.source);
}
A.equal(Realm.verifyDiplomaticAudit(relation,key),true);
A.equal(Realm.verifyDiplomaticOfficeContexts(older.table.realm,key),true);
A.ok(Realm.diplomaticTransitionHistory(older.table.realm,key).transitions
 .every(x=>x.originalOfficesAtChange===null));
console.log('Verified bilateral civic-office context for genuine original war/truce transitions, real constitutional terms and original release delay; no signed treaty or consenting envoy invented, durable save and forgery guards');
