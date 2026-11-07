'use strict';
// Foundation A: one natural chat path uses existing verified purchase, equip
// and independent wound-combat operations. All characters are disposable.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path');
const E=require('../engine.js'),Turn=require('../scripts/chat-turn.js');
const root=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-natural-gear-combat-'));
const file=n=>Path.join(root,n+'.json');
const read=p=>FS.readFileSync(p,'utf8');
const state=p=>E.importGame(read(p));
const write=(p,s)=>FS.writeFileSync(p,E.exportGame(s)+'\n');
const act=(p,id,action)=>Turn.execute(p,{id,mode:'act',action});

function merchant(seed=971400){
 const s=E.newGame({seed,name:'Free Choice Gear Fixture',path:'undecided'});
 s.table||={};
 // This merchant exists only in a disposable source-attested fixture. The
 // live game never gains a free shop from this test.
 s.table.merchantOffers={crossing_staff_001:{
  id:'crossing_staff_001',publiclyKnown:true,seller:'North Road Quartermaster',
  location:'crossing',worldMinute:s.world.minutes,
  expiresAtMinute:s.world.minutes+1440,priceScales:250,stock:1,
  source:'Previously established and publicly witnessed quartermaster staff quotation',
  item:'training_staff',
  action:{id:'staff_strike',kind:'mundane',item:'training_staff',
   attribute:'str',damage:4,offM:0,attackBonus:1,canNonlethal:true,
   source:'Ordinary timber staff examined and documented by an independent equipment appraiser',
   worldMinute:s.world.minutes}
 }};
 return s;
}
function witnessedEncounter(s){
 s.beasts.fox={id:'fox',name:'Wild Reed Fox',species:'fenfox',
  evolutionStage:'Base',sapience:1,hp:30,maxHp:30};
 s.encounter={beastId:'fox',observed:true,approaches:0,threat:true};
 s.beasts.fox.combatAssessment={beastId:'fox',species:'fenfox',
  evolutionStage:'Base',sapience:1,worldMinute:s.world.minutes,
  source:'Independently recorded direct anatomical assessment of the individual wild fox',
  behavior:{style:'territorial',nonlethal:true,canCommunicate:false,
   withdrawalDC:15,parleyDC:18,
   source:'Previously witnessed independent territorial movement of this wild fox'},
  stats:{toughness:6,defense:12,stamina:8,vigor:1,will:1,
   offM:0,durM:0,sapience:1,attack:3,damage:4,boxes:[3,2,1]}};
}
try {
 const empty=file('empty');write(empty,E.newGame({seed:971401,name:'No Free Market'}));
 const emptyBytes=read(empty),rng=state(empty).rngState;
 const noShop=act(empty,'natural_empty_shop_0001','browse market');
 A.equal(noShop.applied,false);
 A.equal(noShop.output.offers.available.length,0);
 A.match(noShop.message,/No current personally witnessed/);
 A.throws(()=>act(empty,'natural_free_buy_00001','buy rations'),
  /No current witnessed local offer/);
 A.throws(()=>act(empty,'natural_no_fight_0001','fight'),/retired/);
 A.throws(()=>act(empty,'natural_no_attack_0001','attack'),
  /wound-combat scene must already be active/);
 A.equal(read(empty),emptyBytes);
 A.equal(state(empty).rngState,rng);

 const market=file('market');write(market,merchant());
 const baseline=read(market),initial=state(market);
 const quoted=act(market,'natural_quotes_00001','what is for sale');
 A.equal(quoted.applied,false);
 A.equal(quoted.output.offers.available[0].priceScales,250);
 A.equal(read(market),baseline);
 const nothing=act(market,'natural_my_gear_0001','my equipment');
 A.equal(nothing.applied,false);
 A.equal(nothing.output.equipment.owned.length,0);
 const bought=act(market,'natural_buy_staff_0001','buy training staff');
 A.equal(bought.applied,true);
 A.equal(bought.output.gear.paidScales,250);
 A.equal(bought.output.gear.item,'training_staff');
 A.equal(state(market).player.coins,initial.player.coins-2.5);
 A.equal(state(market).table.merchantOffers.crossing_staff_001.stock,0);
 A.equal(state(market).player.inventory.training_staff,1);
 const afterPurchase=read(market);
 const boughtAgain=act(market,'natural_buy_staff_0001','buy training staff');
 A.equal(boughtAgain.duplicate,true);
 A.equal(boughtAgain.recovered,true);
 A.deepEqual(boughtAgain.output,bought.output);
 A.equal(read(market),afterPurchase);
 A.throws(()=>act(market,'natural_new_buy_0001','buy crossing_staff_001'),
  /No current witnessed local offer/);
 A.equal(read(market),afterPurchase);
 const equipped=act(market,'natural_equip_staff_0001','equip training staff');
 A.equal(equipped.applied,true);
 A.equal(equipped.output.gear.actionId,'staff_strike');
 A.equal(state(market).player.equippedWeapon,'training_staff');
 const equippedStatus=act(market,'natural_equipped_view_0001','equipment');
 A.equal(equippedStatus.applied,false);
 A.equal(equippedStatus.output.equipment.equippedWeapon,'training_staff');

 // A real opponent's independent, source-attested profile is a separate
 // prerequisite from buying a weapon. No player-selected enemy statistics.
 const prepared=state(market);witnessedEncounter(prepared);write(market,prepared);
 const originalCombat=read(market);
 A.throws(()=>act(market,'natural_bad_weapon_0001','attack with dragon blade'),
  /wound-combat scene must already be active/);
 A.equal(read(market),originalCombat);
 const opened=act(market,'natural_begin_00001','fight');
 A.equal(opened.output.combat.started,true);
 A.equal(state(market).battle.mode,'wounds-v1');
 const beforeAttack=read(market),beforeRng=state(market).rngState;
 A.throws(()=>act(market,'natural_wrong_gear_0001','attack with dragon blade'),
  /not the one actually carried and equipped/);
 A.equal(read(market),beforeAttack);
 A.equal(state(market).rngState,beforeRng);
 const attack=act(market,'natural_staff_attack_01','strike nonlethally with training staff');
 A.equal(attack.applied,true);
 A.equal(attack.output.combat.ownResult.verifiedActionId,'staff_strike');
 A.ok(attack.output.combat.ownResult.roll>=1&&attack.output.combat.ownResult.roll<=20);
 A.ok(['attack','hold','retreat'].includes(attack.output.combat.enemyPlan));
 const afterAttack=read(market);
 const repeat=act(market,'natural_staff_attack_01','strike nonlethally with training staff');
 A.equal(repeat.duplicate,true);
 A.deepEqual(repeat.output,attack.output);
 A.equal(read(market),afterAttack);
 const after=state(market);
 A.equal(after.player.inventory.training_staff,1);
 A.equal(after.table.merchantOffers.crossing_staff_001.purchases.length,1);
 A.ok(after.world.minutes>initial.world.minutes);
 // World-time consequences are never user-selected or forcibly skipped.

 // Unarmed defense and withdrawal are legal without inventing a weapon.
 for(const [label,command] of [['defense','defend'],['withdraw','retreat']]){
  const p=file(label),s=E.newGame({seed:971450+(label==='defense'?1:2),
   name:'Independent Defensive Turn',path:'undecided'});
  witnessedEncounter(s);write(p,s);
  A.equal(act(p,'natural_'+label+'_begin_1','start combat').output.combat.started,true);
  const response=act(p,'natural_'+label+'_act_001',command);
  A.equal(response.applied,true);
  if(label==='defense')A.equal(response.output.combat.ownResult.defending,true);
  else A.equal(typeof response.output.combat.ownResult.check.success,'boolean');
  A.equal(act(p,'natural_'+label+'_act_001',command).duplicate,true);
 }
 // Put away only a real owned equipped weapon outside active combat.
 const afterCombat=state(market);
 // Combat may remain active depending on independent decisions; do not force
 // it to end just to make equipment manipulation tests pass.
 const p=file('unequip'),u=merchant(971470);
 u.player.inventory.training_staff=1;
 u.player.combatActions={staff_strike:{...u.table.merchantOffers.crossing_staff_001.action}};
 u.player.equippedWeapon='training_staff';
 write(p,u);
 const un=act(p,'natural_put_away_00001','put away weapon');
 A.equal(un.output.gear.unequipped,true);
 A.equal(state(p).player.equippedWeapon,undefined);
} finally {
 FS.rmSync(root,{recursive:true,force:true});
}
console.log('Natural purchase, equip and independent combat bridge passed');
