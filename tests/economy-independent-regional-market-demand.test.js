'use strict';
// #19 — genuine independently lived people, distinct physical local
// regions and original public goods interest. A demand *expression*
// is never a solvent buyer, sale, legal order, stored cargo or fixed
// culturally universal want. All people below are disposable source-based
// residents, NOT additions to active campaign saves.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine.js'),Realm=require('../world/simulation'),
 World=require('../rules/world'),Atlas=require('../world/atlas'),
 People=require('../world/emergent-people'),
 Demand=require('../world/independent-regional-demand');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const DAY=1440;
function makeRealLocal(w,t,reg,day=0){
 const eco=w.ecosystems[reg.id],country=w.countries[reg.polity],
  polity=Atlas.P[reg.polity];
 const need=reg.goods.includes('medicine')?'community-relief':'local-provisioning',
  demand={kind:need,regionId:reg.id,polity:reg.polity,
   language:polity.language,good:reg.goods[0],
   localName:reg.name,
   evidence:{regionalGoods:reg.goods.slice(),regionBiome:reg.biome,
    ecological:{quality:eco.quality,pressure:eco.pressure,
     water:eco.water,forage:eco.forage},
    civic:{stability:country.stability,prosperity:country.prosperity},
    witnessedNeed:'Real local household and professional interest in existing regional supplies'}};
 const p=People._debug.make(w,t,day,demand);
 p.shift=People.shift(p,day);
 A.equal(People.verify(w,p),true);
 A.equal(!!People.presence(w,p.actorId,People.siteFor(reg.id),day),true);
 return p;
}
{
 const s=E.newGame({seed:984811,name:'Disposable Regional Demand World',
  background:'fieldworker',path:'undecided'}),w=Realm.ensure(s),
  t=People.ensure(w),local=Atlas.R.morrowfen_basin,
  remote=Atlas.R.lumenfall,
  playerCoins=s.player.coins,
  playerStock=structuredClone(s.player.inventory),
  merchantStock=w.localProvisioner.stock,
  merchantMoney=w.localProvisioner.fundsScales;
 for(let i=0;i<12;i++)makeRealLocal(w,t,local);
 for(let i=0;i<5;i++)makeRealLocal(w,t,remote);
 A.equal(Demand.verify(w),true,'original older checkpoints have no interest register');
 const old=E.exportGame(s);
 A.deepEqual(Realm.publicEconomy(s).locallyPostedGoodsInterest,[]);
 A.equal(E.exportGame(s),old,'unobserved local demand cannot create new state');
 A.throws(()=>Demand.sixday(w,6),/verified original sixday/,
  'a read-only inquiry cannot advance genuine sixday economic demand');
 A.equal(E.exportGame(s),old);
 const clock=structuredClone(s);
 World.advance(s,6);
 E.advance(clock,6*DAY);
 A.equal(s.rngState,clock.rngState,
  'the regional desire witness never adds a player skill check');
 A.equal(w.rngState,clock.table.realm.rngState,
  'the witness cannot consume original independent world RNG');
 A.equal(s.player.coins,playerCoins);
 A.deepEqual(s.player.inventory,playerStock);
 A.equal(w.localProvisioner.fundsScales,
  clock.table.realm.localProvisioner.fundsScales,
  'world still runs original independently financed wholesaling only');
 A.equal(w.localProvisioner.stock,
  clock.table.realm.localProvisioner.stock);
 A.equal(Demand.verify(w),true);
 const ledger=w.independentMarketDemand;
 A.equal(ledger.origin,Demand.LEDGER);
 A.equal(ledger.lastSixday,6);
 const decisions=ledger.records;
 A.ok(decisions.length>=8,'genuine original local-shift people act independently');
 const publicOnes=decisions.filter(x=>x.accepted),
  declined=decisions.filter(x=>!x.accepted);
 A.ok(publicOnes.length>=1,
  'at least one original independently seeded resident genuinely makes a market request');
 A.ok(declined.length>=1,
  'different independent residents can decline a market request without being compelled');
 for(const row of decisions){
  const q=row.source,person=w.emergentPeople.people[q.personId],
   reg=Atlas.R[q.regionId];
  A.ok(person);
  A.equal(q.personOriginHash,person.originHash);
  A.equal(q.originalIndependentPresence.originHash,person.originHash);
  A.equal(q.originalIndependentPresence.hash,
   hash(Object.fromEntries(Object.entries(q.originalIndependentPresence)
    .filter(([key])=>key!=='hash'))));
  A.equal(q.originalIndependentPresence.location,People.siteFor(reg.id));
  A.equal(reg.goods.includes(q.good),true);
  A.equal(q.personOriginalNeed,person.birthSource.need);
  A.equal(row.sourceHash,hash(q));
  A.equal(q.noMoneyOrItemsCreatedOrMoved,true);
  A.equal(q.noFinancialSolvencyInferred,true);
  A.equal(q.noBindingOrderOrWorkerCompulsion,true);
  A.equal(q.publicExpression===null,!row.accepted);
 }
 const first=E.exportGame(s);
 A.deepEqual(Demand.sixday(w,6),{
  newDecisions:0,publicExpressions:0,noMarketSaleInferred:true});
 A.equal(E.exportGame(s),first,'same tick cannot reroll someone's choice');
 A.throws(()=>Demand.sixday(w,18),/verified original sixday/);
 A.equal(E.exportGame(s),first);
 // All public notices are gated by the actual next day's release.
 A.deepEqual(Realm.publicEconomy(s).locallyPostedGoodsInterest,[]);
 World.advance(s,1);
 A.equal(Demand.verify(w),true);
 const localBoard=Realm.publicEconomy(s).locallyPostedGoodsInterest;
 A.equal(localBoard.every(x=>
  x.confirmedOrder===false&&x.confirmedBuyerFunds===false&&
  x.noSaleOrTransfer===true),true);
 A.equal(localBoard.every(x=>
  decisions.some(r=>r.sourceHash===x.sourceHash&&r.accepted&&
   r.source.regionId===local.id)),true);
 A.equal(localBoard.some(x=>x.localGood==='medicine'),false,
  'a physically absent regional market cannot leak remote personal requests');
 const past=E.exportGame(s),copy=E.importGame(past);
 A.equal(E.exportGame(copy),past);
 A.equal(Demand.verify(copy.table.realm),true);
 A.deepEqual(Realm.publicEconomy(copy),Realm.publicEconomy(s));
 const currentLoc=s.world.location;
 s.world.location='academy'; // disposable view-only location fixture
 const regionalBoard=Realm.publicEconomy(s).locallyPostedGoodsInterest;
 A.equal(regionalBoard.every(x=>
  decisions.some(r=>r.accepted&&r.source.regionId===remote.id&&
   r.sourceHash===x.sourceHash)),true);
 A.equal(regionalBoard.every(x=>
  remote.goods.includes(x.localGood)),true);
 s.world.location=currentLoc;
 const latest=E.exportGame(s);
 // Even a recomputed receipt hash cannot invent a good absent from the
 // actual local atlas, overwrite a person's individual decision or fake
 // an original actual witnessed physical presence.
 const actual=structuredClone(decisions[0]);
 decisions[0].source.good='invented_celestial_core';
 decisions[0].sourceHash=hash(decisions[0].source);
 A.equal(Demand.verify(w),false);
 A.throws(()=>Realm.publicEconomy(s),/demand ledger is invalid/);
 ledger.records[0]=structuredClone(actual);
 A.equal(Demand.verify(w),true);
 const row=ledger.records[0],original=structuredClone(row);
 row.source.originalIndependentPresence.location='imaginary_port';
 row.source.originalIndependentPresence.hash=hash(Object.fromEntries(
  Object.entries(row.source.originalIndependentPresence)
   .filter(([key])=>key!=='hash')));
 row.sourceHash=hash(row.source);
 A.equal(Demand.verify(w),false);
 ledger.records[0]=structuredClone(original);
 A.equal(Demand.verify(w),true);
 A.equal(E.exportGame(s),latest);
 // Old archived requests are still original decisions; beyond the
 // actual notice lifespan they no longer appear on the local board.
 World.advance(s,13);
 A.equal(Demand.verify(w),true);
 A.equal(Realm.publicEconomy(s).locallyPostedGoodsInterest.some(x=>
  x.sourceHash===actual.sourceHash),false);
}
console.log('Original #19 independent regional buyer-interest foundation: real distinct local lives and habitat-sourced goods, actual separate person-bound expressions and refusal, public release/location/expiry, no sales or liquidity inferred, unchanged player/world RNG and items, forged identity and locale rejection, exact save replay PASS');
