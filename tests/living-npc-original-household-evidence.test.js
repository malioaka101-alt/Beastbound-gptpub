'use strict';
// Reuse ONLY the original mutually consenting independent household owner.
// No generated marriage, descendants, bloodline, rank or independent home ledger.
// Disposable world; no campaign save is opened.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Realm=require('../world/simulation'),Atlas=require('../world/atlas'),
 People=require('../world/emergent-people'),
 Contacts=require('../world/independent-contacts'),
 Homes=require('../world/emergent-households'),
 Foundations=require('../world/person-mechanical-foundations');

function livedHome(seed){
 const s=E.newGame({seed,name:'Disposable Existing Households Dossier'}),
  w=Realm.ensure(s),persons=People.ensure(w),
  region=Atlas.regions.find(x=>People.siteFor(x.id)),
  eco=w.ecosystems[region.id],host=w.countries[region.polity];
 eco.quality=75;eco.pressure=18;eco.water=75;eco.forage=80;
 host.prosperity=75;host.stability=78;
 const demand=People.sourceDemand(w,region);
 A.ok(demand,'Real local livelihood circumstances need evidence');
 const pairs=[];
 for(let i=0;i<14;i+=2)
  pairs.push([
   People._debug.make(w,persons,0,demand),
   People._debug.make(w,persons,0,demand)]);
 const contacts=Contacts.ensure(w);
 for(let day=6;day<=360;day+=6){
  for(const [a,b] of pairs){
   People._debug.live(w,a,day);
   People._debug.live(w,b,day);
   const first=Contacts._debug.snapshot(w,a,day),
    second=Contacts._debug.snapshot(w,b,day);
   if(!first||!second||first.location!==second.location)continue;
   if(Contacts._debug.decision(w.worldSeed,first,second,day))
    Contacts._debug.record(w,contacts,[first,second],day);
  }
  Homes.sixday(w,day);
  const home=Object.values(w.emergentHouseholds.households)[0];
  if(home)return{s,w,home,day,pairs};
 }
 throw Error('Original contact owner did not establish a consenting household');
}
const {s,w,home,day,pairs}=livedHome(222001);
const [a,b]=home.source.founders.map(x=>w.emergentPeople.people[x.id]);
A.equal(Homes.valid(w,home),true);
A.equal(home.source.mutualConsents,true);
A.equal(home.source.nonBiologicalKinship,true);
A.equal(a.family,home.id);
A.equal(b.family,home.id);
const stranger=pairs.flat().find(p=>p.actorId!==a.actorId&&p.actorId!==b.actorId);
A.ok(stranger);
A.equal(Foundations.gmDossier(w,stranger.actorId).earnedEvidence.chosenHousehold,
 null,'An acquaintance has no invented home or family');
const before=E.exportGame(s),rng=s.rngState,minutes=s.world.minutes;
for(const p of [a,b]){
 const evidence=Foundations.gmDossier(w,p.actorId).earnedEvidence.chosenHousehold;
 A.equal(evidence.originalOwner,'world/emergent-households.js');
 A.equal(evidence.householdId,home.id);
 A.equal(evidence.sourceHash,home.sourceHash);
 A.equal(evidence.formedOnDay,day);
 A.equal(evidence.originalFoundingContactHash,home.source.contactReceiptHash);
 A.deepEqual(evidence.mutuallyConsentingFounders,home.source.founders.map(x=>({
  actorId:x.actorId,originHash:x.originHash,name:x.name
 })));
 A.equal(evidence.originalRecordedCurrentArrangement,'shared');
 A.deepEqual(evidence.originalLifeTransitionHashes,[]);
 A.equal(evidence.noMarriageBloodlineHeirsOrInheritedPower,true);
 A.equal(evidence.statusDoesNotProvePresentCoLocation,true);
 A.equal(evidence.privateToGM,true);
 A.equal(p.ancestry,null);
 A.equal(p.inheritance,null);
}
A.equal(E.exportGame(s),before,'GM household projection cannot mutate the source world');
A.equal(s.rngState,rng);
A.equal(s.world.minutes,minutes);
const publicView=Homes.visible(s,w);
A.equal(JSON.stringify(publicView).includes('originalRecordedCurrentArrangement'),false);
A.equal(JSON.stringify(publicView).includes('originalLifeTransitionHashes'),false);
A.ok(publicView.localEstablishedHouseholds.every(x=>x.currentlyShared===null));
a.status='recovering'; // Existing status owner, exactly as original household regression.
A.equal(People.verify(w,a),true);
Homes.month(w,day+30);
A.equal(home.status,'apart');
A.equal(Homes.valid(w,home),true);
const apart=Foundations.gmDossier(w,a.actorId).earnedEvidence.chosenHousehold;
A.equal(apart.originalRecordedCurrentArrangement,'apart');
A.equal(apart.originalLifeTransitionHashes.length,1);
A.equal(apart.originalLifeTransitionHashes[0],home.lifeHistory.receipts[0].hash);
A.equal(apart.noMarriageBloodlineHeirsOrInheritedPower,true);
const saved=E.exportGame(s),replay=E.importGame(saved),
 rw=Realm.peek(replay);
A.deepEqual(Foundations.gmDossier(rw,a.actorId).earnedEvidence.chosenHousehold,
 apart,'Source-consistent real separation survives game save replay');
const forged=E.importGame(saved),fw=Realm.peek(forged),
 fhome=fw.emergentHouseholds.households[home.id];
fhome.lifeHistory.receipts[0].source.noInvoluntaryReunion=false;
A.throws(()=>Foundations.gmDossier(fw,a.actorId),
 /Unverified original voluntarily chosen household/,
 'Invented forced reunion cannot be promoted into GM family evidence');
const wrong=E.importGame(saved),ww=Realm.peek(wrong),
 wp=ww.emergentPeople.people[a.id];
wp.family='household_fake';
A.throws(()=>Foundations.gmDossier(ww,a.actorId),
 /Unverified original voluntarily chosen household/,
 'Assigning a new home by hand without original consent cannot work');
A.equal(E.exportGame(s),saved,'Only copied/throwaway worlds were tampered');
console.log('Living NPC original household: mutual original contacts, individual agreement, actual shared/apart transitions, private read, tamper, replay and no bloodline PASS');
