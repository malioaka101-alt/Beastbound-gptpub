'use strict';
// Source-authored provisioner: real world inventory -> live conversation ->
// quoted price -> paid supply -> autonomous resupply, with no free item minting.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-local-provisions-'));
const file=Path.join(dir,'save.json');
const write=s=>FS.writeFileSync(file,E.exportGame(s)+'\n');
const read=()=>FS.readFileSync(file,'utf8');
const state=()=>E.importGame(read());
const act=(id,action)=>Turn.execute(file,{id,mode:'act',action});
try {
 const created=E.newGame({seed:626511,name:'Causal Food Supply Fixture',path:'undecided'});
 write(created);
 const untouched=read(),oldRng=state().rngState;
 const unobserved=act('trade_invisible_shop_00001','browse market');
 A.equal(unobserved.applied,false);
 A.equal(unobserved.output.offers.available.length,0);
 A.equal(read(),untouched);
 A.throws(()=>act('trade_unwitnessed_buy_01','buy clean rations'),
  /No current witnessed local offer/);
 A.equal(read(),untouched);
 A.equal(state().rngState,oldRng);
 // No forged item, fee, willingness or seller accepted from the player.
 A.throws(()=>R.act(state(),{system:'gear',operation:'inquire',
  params:{npcId:'otto',stock:10000}}),/only documented offer or item IDs/);
 A.throws(()=>R.act(state(),{system:'gear',operation:'inquire',
  params:{npcId:'fake_seller'}}),/established local provisioner/);

 const quoted=act('trade_first_orrin_quote_01','ask orrin about supplies');
 A.equal(quoted.applied,true);
 A.equal(quoted.output.gear.quoted,true);
 A.equal(quoted.output.gear.seller,E.NPCS.otto.name);
 A.equal(quoted.output.gear.item,'clean_rations');
 A.equal(quoted.output.gear.priceScales,800);
 A.ok(quoted.output.gear.stock>0&&quoted.output.gear.stock<=8);
 A.equal(state().world.minutes,created.world.minutes+5);
 A.equal(state().player.coins,created.player.coins);
 A.equal(state().rngState,oldRng,'A normal price quotation has no dice');
 const store=state().table.realm.localProvisioner;
 A.equal(store.stock,quoted.output.gear.stock);
 A.equal(store.sellerNpcId,'otto');
 A.equal(store.item,'clean_rations');
 A.deepEqual(store.founding.regionGoods,['grain','feed']);

 const visible=act('trade_public_quote_view_01','what is for sale');
 A.equal(visible.applied,false);
 A.equal(visible.output.offers.available[0].priceScales,800);
 A.equal(visible.output.offers.available[0].kind,'provisions');
 const seen=read();A.equal(act('trade_public_quote_view_02','browse market').applied,false);
 A.equal(read(),seen);

 const forged=state();
 const originalQuote=forged.table.merchantOffers[quoted.output.gear.offerId];
 originalQuote.priceScales=1;
 const tampered=Path.join(dir,'tampered.json');
 FS.writeFileSync(tampered,E.exportGame(forged)+'\n');
 A.throws(()=>Turn.execute(tampered,{id:'trade_forged_sale_001',mode:'rule',
   system:'gear',operation:'purchase',
   params:{offerId:quoted.output.gear.offerId}}),
  /source-verified price/);
 A.equal(state().player.coins,created.player.coins);
 A.equal(read(),seen);

 const bought=act('trade_first_rations_buy_01','buy clean rations');
 A.equal(bought.applied,true);
 A.equal(bought.output.gear.purchased,true);
 A.equal(bought.output.gear.quantity,1);
 A.equal(bought.output.gear.paidScales,800);
 A.equal(state().player.coins,created.player.coins-8);
 A.equal(state().player.inventory.clean_rations,created.player.inventory.clean_rations+1);
 A.equal(state().table.realm.localProvisioner.stock,store.stock-1);
 A.equal(state().table.realm.localProvisioner.fundsScales,store.fundsScales+800);
 A.equal(state().table.realm.localProvisioner.history.at(-1).kind,'actual-sale');
 A.equal(state().table.merchantOffers[quoted.output.gear.offerId].stock,store.stock-1);
 const after=read(),oldRevision=state().chatRuntime.revision;
 const replay=act('trade_first_rations_buy_01','buy clean rations');
 A.equal(replay.duplicate,true);
 A.equal(replay.recovered,true);
 A.deepEqual(replay.output,bought.output);
 A.equal(read(),after);
 A.equal(state().chatRuntime.revision,oldRevision);
 A.throws(()=>R.act(state(),{system:'gear',operation:'purchase',
  params:{offerId:quoted.output.gear.offerId,priceScales:0}}),
  /only documented offer or item IDs/);

 // The player cannot spend a previously seen stock unit after all units
 // have physically left the same seller.
 for(let i=1;i<store.stock;i++){
  const r=act('trade_legal_repeat_buy_'+i,'buy '+quoted.output.gear.offerId);
  A.equal(r.output.gear.purchased,true);
 }
 A.equal(state().table.realm.localProvisioner.stock,0);
 A.equal(state().table.merchantOffers[quoted.output.gear.offerId].stock,0);
 const exhausted=read();
 A.throws(()=>act('trade_exhausted_buy_001','buy clean rations'),
  /No current witnessed local offer/);
 A.equal(read(),exhausted);
 const none=act('trade_no_inventory_view_01','browse shop');
 A.equal(none.applied,false);
 A.equal(none.output.offers.available[0].stock,0);

 // A fresh quote cannot conjure new food when the actual shelf is empty.
 const out=act('trade_empty_new_quote_001','ask orrin what he sells');
 A.equal(out.output.gear.stock,0);
 A.equal(state().table.realm.localProvisioner.stock,0);

 // Tick the *independent* world sixday; it can finance wholesale replacement
 // only from the seller's real account and actual regional food conditions.
 const future=state(),ledger=future.table.realm.localProvisioner,
  priorFunds=ledger.fundsScales,priorHistory=ledger.history.length;
 R.world.advance(future,6);
 A.ok(future.table.realm.localProvisioner.history.length>priorHistory);
 const newStock=future.table.realm.localProvisioner.stock;
 A.ok(newStock>=0&&newStock<=2);
 A.equal(future.table.realm.localProvisioner.fundsScales,
  priorFunds-newStock*500);
 A.equal(future.table.realm.localProvisioner.history.at(-1).kind,
  'independent-wholesale-attempt');
 // Old quotations expire even if the world later genuinely restocks.
 A.equal(R.act(future,{system:'gear',operation:'offers',params:{}}).available.length,0);
 // Replenishment is an independently paid world event, not a player grant.
 A.equal(future.player.inventory.clean_rations,state().player.inventory.clean_rations);

 // A seller cannot be summoned to quote after hours or from the fen.
 const absent=E.newGame({seed:626512,name:'Daytime Presence Proof'});
 absent.world.minutes=22*60;write(absent);
 const dark=read();
 A.throws(()=>act('trade_night_time_offer_01','ask orrin about supplies'),
  /public-facing shift/);
 A.equal(read(),dark);
 absent.world.minutes=480;absent.world.location='fen';write(absent);
 const elsewhere=read();
 A.throws(()=>act('trade_remote_offer_0001','ask orrin about supplies'),
  /not here/);
 A.equal(read(),elsewhere);
} finally {
 FS.rmSync(dir,{recursive:true,force:true});
}
console.log('Live source-backed provisioner stock, quote, actual purchase and world resupply');
