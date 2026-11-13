'use strict';
// #22: Use genuine independent people, their original contacts and the
// established home owner. All changes occur in disposable world fixtures;
// never alter a real player's saved family or force a relationship.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Realm=require('../world/simulation'),Atlas=require('../world/atlas'),
 People=require('../world/emergent-people'),
 Contacts=require('../world/independent-contacts'),
 Homes=require('../world/emergent-households'),
 Core=require('../rules/core');
function livedHome(seed){
 const s=E.newGame({seed,name:'Independent Lived Households Fixture'}),
  w=Realm.ensure(s),persons=People.ensure(w),
  region=Atlas.regions.find(x=>People.siteFor(x.id)),
  eco=w.ecosystems[region.id],host=w.countries[region.polity];
 eco.quality=75;eco.pressure=18;eco.water=75;eco.forage=80;
 host.prosperity=75;host.stability=78;
 const demand=People.sourceDemand(w,region);
 A.ok(demand);
 const pairs=[];
 for(let i=0;i<14;i+=2){
  const a=People._debug.make(w,persons,0,demand),
   b=People._debug.make(w,persons,0,demand);
  pairs.push([a,b]);
 }
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
  // End of the same sixday: original mutual contact/proximity source only.
  Homes.sixday(w,day);
  const home=Object.values(w.emergentHouseholds.households)[0];
  if(home)return {s,w,home,day};
 }
 throw Error('No independently consenting household formed from real co-present contact receipts');
}
const {s,w,home,day}=livedHome(222001);
const [a,b]=home.source.founders.map(x=>w.emergentPeople.people[x.id]);
A.equal(Homes.valid(w,home),true);
A.equal(home.status,'shared');
A.equal(home.lifeHistory.receipts.length,0);
A.equal(home.source.mutualConsents,true);
A.equal(a.family,home.id);A.equal(b.family,home.id);
const founding=structuredClone(home.source),playerRng=s.rngState,
 purse=s.player.coins,rank=s.player.rankings;
A.equal(Homes.visible(s,w).localEstablishedHouseholds.every(h=>
 h.currentlyShared===null),true,'a registry of founding is not a window into private current life');
// An actual person state owner can reflect illness or distance. The shared
// household must then record separation without calling it an annulment,
// death, forced divorce or marriage.
a.status='recovering';
A.equal(People.verify(w,a),true);
Homes.month(w,day+30);
A.equal(home.status,'apart');
A.equal(home.lifeHistory.receipts.length,1);
A.equal(home.lifeHistory.receipts[0].source.nextStatus,'apart');
A.equal(home.lifeHistory.receipts[0].source.renewedAgreement,null);
A.equal(Homes.valid(w,home),true);
const interrupted=E.exportGame(s);
A.equal(Homes.valid(E.importGame(interrupted).table.realm,
 E.importGame(interrupted).table.realm.emergentHouseholds.households[home.id]),true);
A.equal(Homes.month(w,day+30).maintained,0);
A.equal(E.exportGame(s),interrupted,'no duplicate event or second resolution');
// Returning to the same area does not force a reunion. Each still chooses
// independently, even when the earlier founding was mutual.
a.status='active';
let nextDay=day+60,declined=false,returned=false;
for(;nextDay<=day+450;nextDay+=30){
 // Actual independent sixday lives establish today's presence and priorities.
 People._debug.live(w,a,nextDay);
 People._debug.live(w,b,nextDay);
 const expected=Homes.valid(w,home);
 A.equal(expected,true);
 const status=Homes.month(w,nextDay);
 if(home.status==='apart'){
  declined=true;
  A.equal(status.apart>=1,true);
 }else{
  returned=true;break;
 }
}
A.ok(returned,'A lived pair can freely renew their shared home');
A.equal(home.lifeHistory.receipts.length,2);
const restored=home.lifeHistory.receipts[1].source;
A.equal(restored.previousStatus,'apart');
A.equal(restored.nextStatus,'shared');
A.deepEqual(restored.renewedAgreement,[true,true]);
A.equal(restored.noInvoluntaryReunion,true);
A.equal(Homes.valid(w,home),true);
A.deepEqual(home.source,founding);
A.equal(s.rngState,playerRng);
A.equal(s.player.coins,purse);
A.deepEqual(s.player.rankings,rank);
A.equal(a.ancestry,null);A.equal(b.ancestry,null);
A.equal(a.inheritance,null);A.equal(b.inheritance,null);
// Persistent original history is source-sealed and cannot be rewritten as
// involuntary marriage, hereditary privilege, or a reunion on a fake date.
const sealed=E.exportGame(s),back=E.importGame(sealed),
 original=structuredClone(home.lifeHistory.receipts[1]);
A.equal(Homes.valid(back.table.realm,
 back.table.realm.emergentHouseholds.households[home.id]),true);
home.lifeHistory.receipts[1].source.renewedAgreement[0]=false;
A.equal(Homes.valid(w,home),false);
home.lifeHistory.receipts[1]=original;
A.equal(Homes.valid(w,home),true);
home.lifeHistory.receipts[1].source.day+=500;
A.equal(Homes.valid(w,home),false);
home.lifeHistory.receipts[1]=original;
A.equal(E.exportGame(s),sealed);
// Former saves without the optional transition source are not retrofitted
// with invented life history, romance, succession or dependent children.
const old=E.importGame(sealed),older=old.table.realm.emergentHouseholds.households[home.id];
delete older.lifeHistory;
A.equal(Homes.valid(old.table.realm,older),true);
A.equal(older.source.mutualConsents,true);
for(let i=0;i<90;i++)Core.event(s,'world','Ordinary world life '+i,{i});
A.equal(Homes.valid(w,home),true);
console.log('Lived family foundation: original voluntary founders and contacts, real interrupted co-residence, independent return decisions, durable source-sealed history, no fabricated relationships, power or inheritance');
