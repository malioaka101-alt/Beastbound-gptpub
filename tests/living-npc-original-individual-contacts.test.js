'use strict';
// Existing autonomous contact owner → GM-private living-person evidence only.
// No new relationship, magic, shared skill, consent or world contact system.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Realm=require('../world/simulation'),Atlas=require('../world/atlas'),
 People=require('../world/emergent-people'),
 Contacts=require('../world/independent-contacts'),
 Foundations=require('../world/person-mechanical-foundations');
const s=E.newGame({seed:222001,name:'Disposable Individual Contact Dossier'}),
 w=Realm.ensure(s),persons=People.ensure(w),
 region=Atlas.regions.find(x=>People.siteFor(x.id)),
 eco=w.ecosystems[region.id],host=w.countries[region.polity];
eco.quality=75;eco.pressure=18;eco.water=75;eco.forage=80;
host.prosperity=75;host.stability=78;
const demand=People.sourceDemand(w,region);
A.ok(demand,'World must already supply a real independently relevant livelihood');
const pairs=[];
for(let i=0;i<14;i+=2)pairs.push([
 People._debug.make(w,persons,0,demand),
 People._debug.make(w,persons,0,demand)
]);
const t=Contacts.ensure(w),all=pairs.flat();
const first=all[0],unknown=Contacts.privateIndividualEvidence(w,first.actorId);
A.equal(unknown.known,true);
A.equal(unknown.contactHistoryEstablished,true);
A.deepEqual(unknown.actualContacts,[]);
A.deepEqual(unknown.sharedOrdinaryMethods,[]);
A.deepEqual(Contacts.privateIndividualEvidence(w,'emergent:no_one'),{known:false});
const before=E.exportGame(s),worldRng=w.rngState,playerRng=s.rngState;
A.equal(Foundations.gmDossier(w,first.actorId).earnedEvidence.
 ordinaryIndependentContacts.noAssumedFriendsOrTraining,true);
A.equal(E.exportGame(s),before,'Private read cannot generate contact');
A.equal(w.rngState,worldRng);A.equal(s.rngState,playerRng);
let recorded=null,participants=null;
for(let day=6;day<=360&&!recorded;day+=6){
 for(const [a,b] of pairs){
  People._debug.live(w,a,day);People._debug.live(w,b,day);
  const sa=Contacts._debug.snapshot(w,a,day),
   sb=Contacts._debug.snapshot(w,b,day);
  if(!sa||!sb||sa.location!==sb.location)continue;
  if(!Contacts._debug.decision(w.worldSeed,sa,sb,day))continue;
  const result=Contacts._debug.record(w,t,[sa,sb],day);
  if(result){recorded=result;participants=[a,b];break;}
 }
}
A.ok(recorded,'Real independently co-present individuals must sometimes interact');
A.equal(Contacts.verify(w,t),true);
A.equal(recorded.noAutomaticTeaching,true);
const [p,other]=participants,id=p.actorId;
const view=Foundations.gmDossier(w,id).earnedEvidence.ordinaryIndependentContacts;
A.equal(view.privateToGM,true);
A.equal(view.contactHistoryEstablished,true);
A.equal(view.originalLedgerHeadHash,t.headHash);
A.equal(view.actualContacts.length,1);
const row=view.actualContacts[0],pair=Object.values(t.state.relations).find(x=>
 x.people.includes(id)&&x.people.includes(other.actorId));
A.ok(pair);
A.equal(row.otherActorId,other.actorId);
A.equal(row.otherOriginHash,other.originHash);
A.equal(row.genuineIndependentMeetings,pair.contacts);
A.equal(row.lastOriginalMeetingDay,pair.lastMeetingDay);
A.equal(row.originalSourceReceiptHash,t.receipts.at(-1).hash);
A.equal(row.actualMutualWorkExchanges,pair.exchanges);
A.equal(row.otherPersonAffectionOrFutureConsentNotEstablished,true);
A.equal(view.noAssumedFriendsOrTraining,true);
A.deepEqual(view.sharedOrdinaryMethods,
 (t.state.knowledge[id]||[]).map(k=>({
  otherActorId:k.from,receivedOnDay:k.atDay,
  originalWorkReceiptHash:k.sourceWorkHash,
  actualMeetingReceiptHash:k.meetingReceiptHash,
  observedOrdinaryMethod:k.method,originalWorkDomain:k.domain,
  learnedCompetence:false,noSpellOrStage:true
 })));
A.equal(p.ancestry,null);
A.equal(p.inheritance,null);
A.deepEqual(p.practicedDisciplines,[]);
A.deepEqual(p.knownTechniques,[]);
A.equal(s.player.arcane.circles,0);
A.equal(s.player.meridian.stage,0);
const noLink=all.find(x=>!participants.includes(x));
A.ok(noLink);
A.deepEqual(Foundations.gmDossier(w,noLink.actorId).
 earnedEvidence.ordinaryIndependentContacts.actualContacts,[]);
const save=E.exportGame(s),replay=E.importGame(save);
A.deepEqual(Foundations.gmDossier(Realm.peek(replay),id).earnedEvidence.
 ordinaryIndependentContacts,view,'Original individual meeting must survive save replay');
const forged=E.importGame(save),ft=Realm.peek(forged).independentContacts;
ft.receipts.at(-1).source.decision.kind='involuntary_familiarity';
A.equal(Contacts.verify(Realm.peek(forged),ft),false);
A.throws(()=>Foundations.gmDossier(Realm.peek(forged),id),
 /Unverified original independent co-presence contact history/,
 'A forged contact cannot become asserted friendship or knowledge');
const older=E.importGame(save),ow=Realm.peek(older);
delete ow.independentContacts;
const prior=Foundations.gmDossier(ow,id).earnedEvidence.ordinaryIndependentContacts;
A.equal(prior.known,true);
A.equal(prior.contactHistoryEstablished,false);
A.equal(prior.actualContacts,null,'Missing old owner is unknown, not no friends');
A.equal(E.exportGame(s),save,'No test touched the true world state');
console.log('Living NPC source contacts: independent co-presence, distinct personal partner, actual evidence, GM-only privacy, replay and forged-contact refusal PASS');
