'use strict';
// Merchant offers are previously recorded in-world facts. No request can mint
// shop stock, choose a free price, or learn a magical attack by buying a staff.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
function fresh(seed=98121){
 const s=E.newGame({seed,name:'Equipped Merchant Fixture',path:'undecided'});
 s.player.skills.combat.rank=2;
 s.table||={};
 s.table.merchantOffers={crossing_staff_001:{
  id:'crossing_staff_001',publiclyKnown:true,seller:'North Road Quartermaster',
  location:'crossing',worldMinute:s.world.minutes,
  expiresAtMinute:s.world.minutes+1440,priceScales:250,stock:1,
  source:'Publicly posted and witnessed staff price from the crossing quartermaster',
  item:'training_staff',
  action:{id:'staff_strike',kind:'mundane',item:'training_staff',
   attribute:'str',damage:4,offM:0,attackBonus:1,canNonlethal:true,
   source:'Issued wooden training staff appraised and witnessed in a guild combat lesson',
   worldMinute:s.world.minutes}
 }};
 return s;
}
const gear=(s,operation,params={})=>R.act(s,{system:'gear',operation,params});
function beastEncounter(s){
 s.beasts.fox={id:'fox',name:'Wild Fen Fox',species:'fenfox',
  evolutionStage:'Base',sapience:1,hp:30,maxHp:30};
 s.encounter={beastId:'fox',observed:true,approaches:0,threat:true};
 s.beasts.fox.combatAssessment={beastId:'fox',species:'fenfox',evolutionStage:'Base',
  sapience:1,worldMinute:s.world.minutes,
  source:'Separate source-recorded field appraisal of the individual wild fox anatomy',
  behavior:{style:'territorial',nonlethal:true,canCommunicate:false,
   withdrawalDC:15,parleyDC:18,
   source:'Witnessed independent territorial but nonlethal fox combat temperament'},
  stats:{toughness:6,defense:12,stamina:8,vigor:1,will:1,
   offM:0,durM:0,sapience:1,attack:3,damage:4,boxes:[3,2,1]}};
}
{
 const s=fresh(),original=E.exportGame(s),rng=s.rngState;
 const offers=gear(s,'offers');
 A.equal(offers.available.length,1);A.equal(offers.available[0].priceScales,250);
 A.equal(gear(s,'status').owned.length,0);
 A.equal(E.exportGame(s),original);
 for(const p of [
  {offerId:'crossing_staff_001',priceScales:0},
  {offerId:'crossing_staff_001',damage:100},
  {offerId:'crossing_staff_001',stock:99},
  {offerId:'unknown_staff_001'}
 ])A.throws(()=>gear(s,'purchase',p),/only documented offer or item IDs|actual existing merchant|current, previously witnessed/);
 A.equal(E.exportGame(s),original);
 s.table.merchantOffers.crossing_staff_001.action.kind='arcane';
 const bad=E.exportGame(s);
 A.throws(()=>gear(s,'purchase',{offerId:'crossing_staff_001'}),/valid source-recorded equipped mundane weapon action/);
 A.equal(E.exportGame(s),bad);
 s.table.merchantOffers.crossing_staff_001.action.kind='mundane';
 s.world.location='fen';
 A.throws(()=>gear(s,'purchase',{offerId:'crossing_staff_001'}),/current, previously witnessed local merchant quotation/);
 s.world.location='crossing';
 s.player.coins=1;
 const broke=E.exportGame(s);
 A.throws(()=>gear(s,'purchase',{offerId:'crossing_staff_001'}),/Insufficient Scales/);
 A.equal(E.exportGame(s),broke);A.equal(s.rngState,rng);
}
{
 const s=fresh(98122),initial=s.world.minutes,coins=s.player.coins;
 const paid=gear(s,'purchase',{offerId:'crossing_staff_001'});
 A.equal(paid.purchased,true);A.equal(paid.paidScales,250);
 A.equal(s.player.coins,coins-2.5);A.equal(s.world.minutes,initial+10);
 A.equal(s.player.inventory.training_staff,1);
 A.equal(s.player.combatActions.staff_strike.damage,4);
 A.equal(s.table.merchantOffers.crossing_staff_001.stock,0);
 A.equal(s.table.merchantOffers.crossing_staff_001.purchases.length,1);
 A.equal(s.table.finances.entries.at(-1).change,-250);
 A.equal(gear(s,'offers').available[0].stock,0);
 A.equal(gear(s,'status').owned[0].equipped,false);
 const bought=E.exportGame(s);
 A.throws(()=>gear(s,'purchase',{offerId:'crossing_staff_001'}),/no item left in stock/);
 A.equal(E.exportGame(s),bought);
 const equipped=gear(s,'equip',{item:'training_staff'});
 A.equal(equipped.equipped,true);A.equal(s.world.minutes,initial+11);
 A.equal(s.player.equippedWeapon,'training_staff');
 A.equal(gear(s,'status').owned[0].equipped,true);
 A.throws(()=>gear(s,'equip',{item:'training_staff'}),/already equipped/);
 const un=gear(s,'unequip');
 A.equal(un.unequipped,true);A.equal(s.player.equippedWeapon,undefined);
 A.equal(s.world.minutes,initial+12);
 A.throws(()=>gear(s,'unequip'),/No mundane weapon/);
 A.equal(gear(s,'equip',{item:'training_staff'}).equipped,true);
 beastEncounter(s);
 const started=R.act(s,{system:'combat',operation:'begin',params:{beastId:'fox'}});
 A.equal(started.started,true);
 A.throws(()=>gear(s,'unequip'),/combat round/);
 A.throws(()=>gear(s,'equip',{item:'training_staff'}),/combat round/);
 const exchange=R.act(s,{system:'combat',operation:'exchange',
  params:{intent:'attack',attackId:'staff_strike',nonlethal:true}});
 A.equal(exchange.ownResult.verifiedActionId,'staff_strike');
 A.ok(exchange.ownResult.roll>=1&&exchange.ownResult.roll<=20);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-gear-market-'));
 try{
  const file=Path.join(dir,'save.json'),s=fresh(98123);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const initial=FS.readFileSync(file,'utf8');
  const offersReq={id:'gear_visible_offers_001',mode:'rule',system:'gear',operation:'offers',params:{}};
  const visible=Turn.execute(file,offersReq);
  A.equal(visible.applied,false);A.equal(visible.output.rules.available.length,1);
  A.equal(FS.readFileSync(file,'utf8'),initial);
  const forgedReq={id:'gear_forged_quote_001',mode:'rule',system:'gear',
   operation:'purchase',params:{offerId:'crossing_staff_001',priceScales:1}};
  A.throws(()=>Turn.execute(file,forgedReq),/only documented offer or item IDs/);
  A.equal(FS.readFileSync(file,'utf8'),initial);
  const purchaseReq={id:'gear_purchase_staff_001',mode:'rule',system:'gear',
   operation:'purchase',params:{offerId:'crossing_staff_001'}};
  A.equal(Turn.execute(file,purchaseReq).applied,true);
  A.equal(Turn.execute(file,purchaseReq).duplicate,true);
  let state=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(state.player.coins,82.5);A.equal(state.player.inventory.training_staff,1);
  A.equal(state.table.merchantOffers.crossing_staff_001.stock,0);
  A.equal(state.table.merchantOffers.crossing_staff_001.purchases.length,1);
  const afterPurchase=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{...purchaseReq,id:'gear_purchase_staff_002'}),/no item left in stock/);
  A.equal(FS.readFileSync(file,'utf8'),afterPurchase);
  const equipReq={id:'gear_equip_staff_001',mode:'rule',system:'gear',
   operation:'equip',params:{item:'training_staff'}};
  A.equal(Turn.execute(file,equipReq).applied,true);
  A.equal(Turn.execute(file,equipReq).duplicate,true);
  const ownedReq={id:'gear_owned_status_001',mode:'rule',system:'gear',operation:'status',params:{}};
  const owned=Turn.execute(file,ownedReq);
  A.equal(owned.applied,false);A.equal(owned.output.rules.equippedWeapon,'training_staff');
  const afterEquip=FS.readFileSync(file,'utf8');
  A.equal(FS.readFileSync(file,'utf8'),afterEquip);
  state=E.importGame(afterEquip);beastEncounter(state);
  FS.writeFileSync(file,E.exportGame(state)+'\n'); // disposable test authoring only
  const startReq={id:'gear_combat_begin_001',mode:'rule',system:'combat',operation:'begin',
   params:{beastId:'fox'}};
  A.equal(Turn.execute(file,startReq).applied,true);
  const strikeReq={id:'gear_combat_staff_001',mode:'rule',system:'combat',
   operation:'exchange',params:{intent:'attack',attackId:'staff_strike'}};
  const r=Turn.execute(file,strikeReq);
  A.equal(r.applied,true);A.equal(r.output.rules.ownResult.verifiedActionId,'staff_strike');
  A.equal(Turn.execute(file,strikeReq).duplicate,true);
  const final=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(final.player.inventory.training_staff,1);
  A.equal(final.player.coins,82.5);
  A.equal(final.table.merchantOffers.crossing_staff_001.purchases.length,1);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Source-verified mundane equipment commerce, equip and combat tests passed');
