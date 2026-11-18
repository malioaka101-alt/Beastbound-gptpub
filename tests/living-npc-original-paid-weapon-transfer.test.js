'use strict';
// Real paid weapon custody and independent recipient consent, with only
// original source-verified identities and equipment. Disposable fixture.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Rules=require('../rules'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),Atlas=require('../world/atlas'),
 Gear=require('../rules/equipment');
const gear=(s,op,p={})=>Rules.act(s,{system:'gear',operation:op,params:p});
function next(x){x>>>=0;x^=x<<13;x^=x>>>17;x^=x<<5;
 return (x>>>0)||0x91e10da5;}
function chance(p){return Math.max(.08,Math.min(.65,
 (p.personality==='curious'?.52:p.personality==='steady'?.41:
 p.personality==='independent'?.31:.23)-(p.fatigue>=60?.16:
 p.fatigue>=35?.07:0)));}
function source(want,seed){
 const s=E.newGame({seed,name:'Disposable paid item to autonomous person'}),
  w=Realm.ensure(s),people=People.ensure(w),
  reg=Atlas.regions.find(r=>People.siteFor(r.id)),
  eco=w.ecosystems[reg.id],host=w.countries[reg.polity];
 eco.quality=75;eco.pressure=15;eco.water=75;eco.forage=80;
 host.prosperity=75;host.stability=78;
 const d=People.sourceDemand(w,reg);
 A.ok(d);
 let p;
 for(let i=0;i<50;i++){
  const c=People._debug.make(w,people,0,d);
  if((next(c.rngState)/4294967296<chance(c))===want){p=c;break;}
 }
 A.ok(p);
 p.shift=People.shift(p,0,w);
 s.world.location=People.siteFor(p.regionId);
 s.world.minutes=600;s.chatRuntime||={};
 s.chatRuntime.scene=p.name+' is personally witnessed at the market.';
 const now=s.world.minutes;
 s.table.merchantOffers={original_staff_001:{
  id:'original_staff_001',publiclyKnown:true,
  seller:'North Road Quartermaster',location:s.world.location,
  worldMinute:now,expiresAtMinute:now+1440,
  priceScales:250,stock:1,
  source:'Originally observed and personally witnessed real stock offer',
  item:'training_staff',
  action:{id:'staff_strike',kind:'mundane',item:'training_staff',
   attribute:'str',damage:4,offM:0,attackBonus:1,canNonlethal:true,
   worldMinute:now,source:'Original witnessed and appraised wooden staff melee form'}
 }};
 const initialCoins=s.player.coins;
 A.equal(gear(s,'purchase',{offerId:'original_staff_001'}).purchased,true);
 return {s,w,p,initialCoins};
}
for(const accepted of [true,false]){
 const {s,w,p,initialCoins}=source(accepted,accepted?916011:916033),
  originalRoot=Gear.ownedAsset(s,'training_staff').originalRoot,
  old=E.exportGame(s),npcRng=p.rngState,worldRng=s.rngState,
  minute=s.world.minutes;
 A.equal(Gear.verifiedIndependentWeapon(s,p.actorId),null);
 for(const bad of [
  {npcId:p.actorId,item:'training_staff',accept:true},
  {npcId:p.actorId,item:'training_staff',damage:99},
  {npcId:p.actorId,item:'training_staff',rank:8}]){
  A.throws(()=>gear(s,'giveWeaponToPerson',bad),/only documented/);
  A.equal(E.exportGame(s),old);
 }
 const result=gear(s,'giveWeaponToPerson',{
  npcId:p.actorId,item:'training_staff'});
 A.equal(result.accepted,accepted);
 A.equal(result.transferred,accepted);
 A.equal(result.noEarnedTechniqueOrCombatConsent,true);
 A.equal(p.rngState,next(npcRng));
 A.equal(s.rngState,worldRng);
 A.equal(s.world.minutes,minute+5);
 A.equal(s.player.coins,initialCoins-2.5);
 A.equal(s.player.inventory.training_staff,accepted?0:1);
 A.equal(p.originalWeaponOffers.length,1);
 A.equal(People.verifyOriginalWeaponGiftChoice(
  p.originalWeaponOffers[0].source),true);
 A.equal(p.originalWeaponOffers[0].source.originalPurchasedAssetRoot,
  originalRoot);
 A.deepEqual(p.knownTechniques,[]);
 A.deepEqual(p.practicedDisciplines,[]);
 A.equal(s.player.meridian.stage,0);
 if(accepted){
  const proof=Gear.verifiedIndependentWeapon(s,p.actorId);
  A.equal(proof.item,'training_staff');
  A.equal(proof.actualMundaneAction.damage,4);
  A.equal(proof.actualMundaneAction.offM,0);
  A.equal(proof.actualMundaneAction.attackBonus,1);
  A.equal(proof.noInferredCombatRank,true);
  A.equal(proof.noForcedEquipmentUseOrFutureCombatConsent,true);
  A.equal(Gear.ownedAsset(s,'training_staff').quantity,0);
  A.equal(gear(s,'status').owned.length,0);
  A.throws(()=>gear(s,'equip',{item:'training_staff'}),
   /in inventory/);
  const forged=E.importGame(E.exportGame(s)),
   person=Realm.peek(forged).emergentPeople.people[p.id];
  person.mundaneWeapon.source.originalCombatAction.damage=80;
  A.throws(()=>Gear.verifiedIndependentWeapon(forged,p.actorId),
   /physical transfer receipt|differs from original/);
  const cloned=E.importGame(E.exportGame(s));
  cloned.player.inventory.training_staff=1;
  A.throws(()=>Gear.verifiedIndependentWeapon(cloned,p.actorId),
   /conflicts with player custody/);
 }else{
  A.equal(p.mundaneWeapon,undefined);
  A.equal(Gear.verifiedIndependentWeapon(s,p.actorId),null);
  const checkpoint=E.exportGame(s),rng=p.rngState;
  A.throws(()=>gear(s,'giveWeaponToPerson',{
   npcId:p.actorId,item:'training_staff'}),/unchanged original item offer/);
  A.equal(E.exportGame(s),checkpoint);
  A.equal(p.rngState,rng);
 }
 const saved=E.exportGame(s),replay=E.importGame(saved);
 A.deepEqual(Gear.verifiedIndependentWeapon(replay,p.actorId),
  Gear.verifiedIndependentWeapon(s,p.actorId));
 A.equal(E.exportGame(s),saved);
}
{
 const {s,p}=source(true,916059);
 gear(s,'equip',{item:'training_staff'});
 const checkpoint=E.exportGame(s);
 A.throws(()=>gear(s,'giveWeaponToPerson',{
  npcId:p.actorId,item:'training_staff'}),/unequipped/);
 A.equal(E.exportGame(s),checkpoint);
}
{
 const {s,p}=source(true,916061);
 s.chatRuntime.scene='Only an unrelated trader is present.';
 const checkpoint=E.exportGame(s);
 A.throws(()=>gear(s,'giveWeaponToPerson',{
  npcId:p.actorId,item:'training_staff'}),/current witnessed scene/);
 A.equal(E.exportGame(s),checkpoint);
}
console.log('Original paid weapon source: independent acceptance or refusal, preserved price, real owner stock, no created items or power, idempotent refusal, forged receipt denial and replay PASS');
