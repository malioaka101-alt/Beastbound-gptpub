'use strict';
// One genuinely reusable internal item-movement mechanism, used in trade,
// wilderness gathering, medicine, animal food and clinical treatment.
// No new item type, production recipe, right to merchant stock or animal consent.
const A=require('node:assert/strict'),E=require('../engine.js'),
 U=require('../rules/unified'),R=require('../rules');
function disposable(seed){
 return E.newGame({seed,name:'Real Material Movement Fixture',background:'fieldworker'});
}
{
 const s=disposable(960011),start=E.exportGame(s),rng=s.rngState;
 const invalid=[
  {marsh_reed:-100,clean_rations:1},
  {clean_rations:100001},
  {invented_dragon_shard:1},
  {clean_rations:0},
  {clean_rations:1.5}
 ];
 for(const changes of invalid){
  A.throws(()=>U.planItems(s,changes));
  A.equal(E.exportGame(s),start);
  A.equal(s.rngState,rng);
 }
 const old={...s.player.inventory};
 const plan=U.planItems(s,{marsh_reed:-2,clean_rations:-1});
 A.deepEqual(plan.entries.map(x=>x.item).sort(),
  ['clean_rations','marsh_reed']);
 A.deepEqual(s.player.inventory,old,'Planning never consumes real items');
 A.deepEqual(U.applyItems(s,plan),{marsh_reed:-2,clean_rations:-1});
 A.equal(s.player.inventory.marsh_reed||0,old.marsh_reed-2);
 A.equal(s.player.inventory.clean_rations,old.clean_rations-1);
 A.throws(()=>U.applyItems(s,plan),/freshly verified internal physical material plan/);
 A.equal(s.rngState,rng,'Moving real material never rolls');

 const stale=U.planItems(s,{clean_rations:-1,healing_balm:1});
 s.player.inventory.healing_balm=(s.player.inventory.healing_balm||0)+1;
 const before=E.exportGame(s);
 A.throws(()=>U.applyItems(s,stale),/stock changed after its original verification/);
 A.equal(E.exportGame(s),before,
  'Stale multi-resource plan cannot partly pay the ration then mint balm');

 const full=disposable(960012);
 full.player.inventory.marsh_reed=100000;
 const cap=E.exportGame(full);
 A.throws(()=>U.planItems(full,{marsh_reed:1}),/capacity would be exceeded/);
 A.equal(E.exportGame(full),cap);
}
{
 const s=disposable(960020),rng=s.rngState,coins=s.player.coins;
 // An internal material plan NEVER constitutes permission to purchase.
 A.throws(()=>R.act(s,{system:'gear',operation:'purchase',
  params:{offerId:'invented_shop_0001'}}),/real|available|witnessed|offer/i);
 A.equal(s.player.coins,coins);
 A.equal(s.rngState,rng);
 // The private Rules.act API intentionally does not expose raw item minting
 // or the plan/commit primitives as player-authorised operations.
 A.throws(()=>R.act(s,{system:'inventory',operation:'applyItems',
  params:{item:'marsh_reed',delta:100}}),/Unsupported rule operation/);
}
console.log('Shared internal material plans conserve stock across trade, gathering, medicine and beast feeding; invalid plans are atomic');
