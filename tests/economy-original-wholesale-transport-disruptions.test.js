'use strict';
// #19: the already established local grain/feed producer remains real.
// Original interstate weather/war trade disruption can only limit the
// SMALL existing seller's outside wholesale replacement, not magic away
// local goods, create new customs law, or alter the player/merchant RNG.
// All world risk and stock overrides below are disposable TEST fixtures.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine.js'),Realm=require('../world/simulation'),
 W=require('../rules/world'),Transport=require('../world/original-wholesale-transport'),
 Atlas=require('../world/atlas');
const sha=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fresh=seed=>E.newGame({seed,name:'Disposable Original Route Wholesale',path:'undecided'});
const newWholesale=w=>w.localProvisioner.history.filter(x=>x.kind==='independent-wholesale-attempt');
{
 const s=fresh(983151),w=Realm.ensure(s),v=w.localProvisioner;
 const originalPlayerCoins=s.player.coins,originalPlayerRng=s.rngState,
  originalSellerFunds=v.fundsScales,prior=v.stock,
  corridors=Transport.supplyCorridors();
 A.equal(corridors.length,2);
 A.deepEqual(corridors.map(x=>x.id),['trade_1','trade_2']);
 A.ok(corridors.every(x=>x.a==='reedmarch'||x.b==='reedmarch'));
 A.equal(Transport.verify(w,v),true);
 A.equal(Transport.sourceAt(w,0).wholesaleUnitCeiling,2);
 A.equal(v.originalTransportWitnessStartDay,undefined,
  'valid old original world saves have no retroactive source link');
 W.advance(s,6);
 const day=6,row=newWholesale(w)[0],q=row.originalTransportWitness.source;
 A.equal(row.day,day);
 A.equal(v.originalTransportWitnessStartDay,day);
 A.equal(q.origin,Transport.ORIGIN);
 A.equal(q.actualScarcityFromOriginalCorridor,false);
 A.equal(q.wholesaleUnitCeiling,2);
 A.equal(row.received,Math.min(2,8-prior,Math.floor(originalSellerFunds/500)));
 A.equal(v.stock,prior+row.received);
 A.equal(v.fundsScales,originalSellerFunds-500*row.received);
 A.equal(s.player.coins,originalPlayerCoins);
 A.equal(s.rngState,originalPlayerRng);
 A.equal(q.originalTradeCorridors.length,2);
 A.equal(row.originalTransportWitness.sourceHash,sha(q));
 A.equal(Transport.verify(w,v),true);
 const saved=E.exportGame(s),copy=E.importGame(saved);
 A.equal(E.exportGame(copy),saved);
 A.equal(Transport.verify(copy.table.realm,copy.table.realm.localProvisioner),true);
 A.equal(Realm.localProvisioner(copy).stock,v.stock);
}
{
 // Historical ordinary sales have worldMinute, not day. This source guard
 // must coexist with the actual unchanged merchant's original sale ledger.
 const s=fresh(983152),w=Realm.ensure(s);
 W.advance(s,6);
 const merchant=w.localProvisioner;
 merchant.history.push({buyer:'Original Buyer',worldMinute:s.world.minutes,
  priceScales:800,item:'clean_rations',offerId:'existing_valid_offer',
  kind:'actual-sale',remainingStock:merchant.stock});
 A.equal(Transport.verify(w,merchant),true);
 A.equal(Realm.localProvisioner(s).stock,merchant.stock);
}
{
 // Some original legacy route saves did not archive the risk/status change.
 // Such an unproven past obstruction must NOT be invented as new historic
 // source evidence or prohibit the existing locally sourced trade.
 const s=fresh(983154),w=Realm.ensure(s);
 w.routes.trade_1.disrupted=true;
 A.equal(w.routes.trade_1.originalChanges,undefined);
 A.equal(Transport.sourceAt(w,6).wholesaleUnitCeiling,2);
 A.equal(Transport.verify(w,w.localProvisioner),true);
}
{
 // A legitimate legacy merchant archive can lack the new source structure
 // and must not have an invented historic route decision added to it.
 const s=fresh(983153),w=Realm.ensure(s),v=w.localProvisioner;
 v.history.push({day:0,kind:'independent-wholesale-attempt',
  received:0,paidScales:0,supplySupported:false,
  remainingStock:v.stock});
 A.equal(Transport.verify(w,v),true);
 W.advance(s,6);
 A.equal(Transport.verify(w,v),true);
 A.equal(v.history[0].originalTransportWitness,undefined);
 A.equal(v.history[1].originalTransportWitness.source.day,6);
}
let disrupted=null;
for(let n=0;n<22;n++){
 const seed=(983200+Math.imul(n,2654435761))>>>0;
 const s=fresh(seed),w=Realm.ensure(s);
 for(const r of Transport.supplyCorridors())
  w.routes[r.id].risk=100; // test severe transport-risk pressure only.
 W.advance(s,30); // genuine original monthly weather and diplomatic draws
 // The sixday delivery on day 30 ALREADY happened before the day-30
 // monthly route review. Never reprice/restrict that earlier work.
 A.equal(Transport.sourceAt(w,30).wholesaleUnitCeiling,2);
 A.equal(Transport.verify(w,w.localProvisioner),true);
 const actuallyDisrupted=Transport.supplyCorridors().filter(r=>
  w.routes[r.id].disrupted);
 if(!actuallyDisrupted.length)continue;
 for(const r of actuallyDisrupted){
  A.equal(Realm.verifyOriginalRouteHistory(w,r),true);
  A.ok(w.routes[r.id].originalChanges.some(x=>
   x.day===30&&x.disrupted&&x.origin===Realm.ROUTE_CHANGE_SOURCE),
  'closure must be a real archived original month outcome');
 }
 disrupted={s,w,roads:actuallyDisrupted};
 break;
}
A.ok(disrupted,'at least one authentic original grain/feed route can close under real recorded weather');
{
 const {s,w,roads}=disrupted,v=w.localProvisioner,
  originalMoney=s.player.coins,oldPlayerRng=s.rngState;
 // Supply pressure fixtures do not invent a road closure; that was
 // independently settled and sealed by the actual original world tick.
 v.stock=0;v.fundsScales=2500;
 w.ecosystems.morrowfen_basin.forage=80;
 w.ecosystems.morrowfen_basin.quality=80;
 w.countries.reedmarch.prosperity=50;
 w.market.reedmarch.grain=1;
 const day=36,source=Transport.sourceAt(w,day);
 A.equal(source.actualScarcityFromOriginalCorridor,true);
 A.equal(source.wholesaleUnitCeiling,1,
  'a real obstruction reduces outside deliveries, without deleting source-local goods');
 const record=source.originalTradeCorridors.find(x=>
  x.routeId===roads[0].id);
 A.equal(record.actualTransportDisrupted,true);
 A.equal(record.originalChangeDay,30);
 A.equal(record.originalChangeSourceHash,
  w.routes[roads[0].id].originalChanges.at(-1).sourceHash);
 const beforeTime=s.world.minutes;
 W.advance(s,6); // next genuine sixday warehouse replacement
 const entry=newWholesale(w).at(-1);
 A.equal(entry.day,day);
 A.equal(entry.received,1);
 A.equal(entry.paidScales,500);
 A.equal(entry.remainingStock,1);
 A.equal(v.stock,1);
 A.equal(v.fundsScales,2000);
 A.equal(s.player.coins,originalMoney);
 A.equal(s.rngState,oldPlayerRng);
 A.equal(s.world.minutes,beforeTime+6*1440);
 A.equal(entry.originalTransportWitness.sourceHash,
  sha(entry.originalTransportWitness.source));
 A.deepEqual(entry.originalTransportWitness.source,Transport.sourceAt(w,day));
 A.equal(Transport.verify(w,v),true);
 const saved=E.exportGame(s),copy=E.importGame(saved);
 A.equal(E.exportGame(copy),saved);
 A.equal(Transport.verify(copy.table.realm,copy.table.realm.localProvisioner),true);
 // Falsifying the original closure state cannot inflate earlier delivery
 // capacity, even if the author recomputes a syntactically valid hash.
 const real=structuredClone(entry.originalTransportWitness);
 entry.originalTransportWitness.source.wholesaleUnitCeiling=2;
 entry.originalTransportWitness.source.actualScarcityFromOriginalCorridor=false;
 entry.originalTransportWitness.sourceHash=
  sha(entry.originalTransportWitness.source);
 A.equal(Transport.verify(w,v),false);
 A.throws(()=>Realm.localProvisioner(s),/reconciliation/);
 entry.originalTransportWitness=real;
 A.equal(Transport.verify(w,v),true);
 // Forging a corridor that the actual atlas never contained is rejected.
 entry.originalTransportWitness.source.originalTradeCorridors[0].routeId='invented_beast_tunnel';
 entry.originalTransportWitness.sourceHash=
  sha(entry.originalTransportWitness.source);
 A.equal(Transport.verify(w,v),false);
 entry.originalTransportWitness=real;
 A.equal(Transport.verify(w,v),true);
}
console.log('Original #19 local wholesale logistics: only real grain/feed routes, original independently verified month closure, subsequent sixday constrained physically purchased stock, no global blockade, no extra RNG, actual saved historical proof, tamper refusal and legacy merchant sale coexistence PASS');
