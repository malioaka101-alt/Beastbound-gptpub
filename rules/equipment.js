'use strict';
// Commerce is source-backed: a prior, publicly witnessed merchant quotation
// authorises one actual mundane item at its fixed, uneditable price. An
// unobserved market does not create stock, credentials or weapons.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),Wallet=require('./unified');
const Realm=require('../world/simulation'),Presence=require('../world/person-presence');
const Weapons=require('./player-combat-action');
const MarketScarcity=require('./original-local-market-scarcity');
const MAX_QUOTE_AGE=6*1440;
const PROVISION_ORIGIN='source-witnessed-local-provisions-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function quoteProof(q){
 return {origin:PROVISION_ORIGIN,id:q.id,sellerNpcId:q.sellerNpcId,
  seller:q.seller,location:q.location,item:q.item,
  source:q.source,worldMinute:q.worldMinute,
  expiresAtMinute:q.expiresAtMinute,priceScales:q.priceScales,
  initialStock:q.initialStock,
  ...(q.originalMarketScarcity?{
   originalMarketScarcity:q.originalMarketScarcity,
   originalMarketScarcityHash:q.originalMarketScarcityHash}:{})};
}
function inquire(s,p={}){
 input(p,['npcId']);
 if(p.npcId!=='otto')throw Error('Name an actually established local provisioner, not a caller-created merchant');
 if(s.battle||s.encounter)
  throw Error('An unresolved animal encounter or battle prevents an ordinary market conversation');
 if(s.world.location!=='crossing'||!E.LOCATIONS.crossing.facilities.includes('market'))
  throw Error('The provisioner is not here; distant market listings do not prove local stock');
 const people=Presence.localStatus(s,Realm.peek(s)).people;
 if(!people.some(x=>x.npcId==='otto'))
  throw Error('The provisioner has no established public-facing shift at this time');
 const time=s.world.minutes%1440;
 if(time+5>18*60)throw Error('The provisioner cannot finish this quotation outside the recorded shift');
 const v=Realm.localProvisioner(s),now=s.world.minutes;
 const scarcity=MarketScarcity.observe(s.table.realm,v);
 const priceScales=scarcity.source.actualQuotedPriceScales;
 const id='orrin_rations_'+(++s.sequence);
 const q={id,kind:'provisions',origin:PROVISION_ORIGIN,
  publiclyKnown:true,sellerNpcId:'otto',seller:v.seller,
  source:'Original in-person quote from the source-established beast provisioner backed by regional grain/feed and owned stock',
  location:v.location,item:'clean_rations',worldMinute:now,
  expiresAtMinute:now+1440,priceScales,stock:v.stock,initialStock:v.stock,
  originalMarketScarcity:scarcity.source,
  originalMarketScarcityHash:scarcity.sourceHash,
  purchases:[]};
 q.proofHash=hash(quoteProof(q));
 s.table.merchantOffers||={};s.table.merchantOffers[id]=q;
 E.advance(s,5);
 C.event(s,'trade',v.seller+' quotes actual stocked clean rations from the local provisioner.',{
  origin:PROVISION_ORIGIN,offerId:id,sellerNpcId:'otto',
  item:q.item,quotedStock:q.stock,priceScales:q.priceScales,
  proofHash:q.proofHash,worldMinute:now,
  originalMarketScarcityHash:q.originalMarketScarcityHash});
 return {quoted:true,offerId:id,seller:v.seller,item:q.item,
  priceScales,stock:v.stock,elapsedMinutes:5,
  message:v.stock>0?
   'Orrin gives the current price and the finite supplies he really holds.':
   'Orrin has no rations left to sell right now; no stock appears by asking.'};
}

function input(p,keys){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>!keys.includes(k)))
  throw Error('Equipment transaction accepts only documented offer or item IDs; price, stock and weapon stats are not caller-selected');
}
function validOffer(s,id,{mustBeInStock=true}={}){
 if(typeof id!=='string'||!/^[a-z][a-z0-9_-]{3,60}$/.test(id))
  throw Error('An actual existing merchant offer ID is required');
 const q=s.table?.merchantOffers?.[id];
 if(!q||q.id!==id||q.publiclyKnown!==true||
    typeof q.seller!=='string'||q.seller.trim().length<3||
    typeof q.source!=='string'||q.source.trim().length<18||
    q.location!==s.world.location||
    !Number.isInteger(q.worldMinute)||q.worldMinute<0||q.worldMinute>s.world.minutes||
    !Number.isInteger(q.expiresAtMinute)||q.expiresAtMinute<q.worldMinute||
    q.expiresAtMinute-q.worldMinute>MAX_QUOTE_AGE||
    s.world.minutes>q.expiresAtMinute)
  throw Error('A current, previously witnessed local merchant quotation is required');
 C.int(q.priceScales,'documented price in Scales',1,100000000);
 C.int(q.stock,'recorded merchant stock',0,100);
 if(mustBeInStock&&q.stock<1)throw Error('The known merchant has no item left in stock');
 if(q.kind==='provisions'){
  const v=s.table?.realm?.localProvisioner;
  if(q.origin!==PROVISION_ORIGIN||q.sellerNpcId!=='otto'||
    q.seller!==E.NPCS.otto.name||q.location!=='crossing'||
    q.item!=='clean_rations'||q.source!==
      'Original in-person quote from the source-established beast provisioner backed by regional grain/feed and owned stock'||
    !Number.isInteger(q.initialStock)||q.initialStock<0||q.initialStock>8||
    q.stock>q.initialStock||q.proofHash!==hash(quoteProof(q))||
    (q.originalMarketScarcity!==undefined&&
     !MarketScarcity.verify(q.originalMarketScarcity,
      q.originalMarketScarcityHash,q.priceScales,q.initialStock))||
    (q.originalMarketScarcity?.originalPaidDemand!==undefined&&
     !require('./original-paid-demand-price').backedByActualSeller(
      s.table?.realm,q.originalMarketScarcity.originalPaidDemand))||
    (q.originalMarketScarcity===undefined&&
     q.originalMarketScarcityHash!==undefined)||
    !v||v.sellerNpcId!=='otto'||v.item!=='clean_rations'||
    !Number.isInteger(v.stock)||v.stock<0||v.stock>8||
    !Number.isInteger(v.fundsScales)||v.fundsScales<0||
    !Array.isArray(q.purchases))
   throw Error('Original provisioner stock and source-verified price must agree');
  if(mustBeInStock&&(q.stock<1||v.stock<1))
   throw Error('The provisioner has no real rations remaining in this offer');
  return q;
 }
 if(!q.action||q.item!==q.action.item)
  throw Error('Merchant quote must name a previously appraised exact mundane weapon');
 Weapons.validateSpec(s,q.action.id,q.action);
 return q;
}
function offers(s,p={}){
 input(p,[]);
 const available=[];
 for(const [id,q] of Object.entries(s.table?.merchantOffers||{})){
  try{
   const offer=validOffer(s,id,{mustBeInStock:false});
   const realStock=offer.kind==='provisions'?
    Math.min(offer.stock,s.table.realm.localProvisioner.stock):offer.stock;
   available.push({offerId:id,seller:offer.seller,item:offer.item,
    priceScales:offer.priceScales,stock:realStock,
    expiresAtMinute:offer.expiresAtMinute,
    ...(offer.kind==='provisions'?{kind:'provisions',
     ...(offer.originalMarketScarcity?{
      knownPriceBasis:[
       'Original local regional grain market',
       ...(offer.originalMarketScarcity.localForage<45?
        ['Strained local forage conditions']:[]),
       ...(offer.originalMarketScarcity.localQuality<35?
        ['Strained local habitat conditions']:[]),
       ...(offer.originalMarketScarcity.actualSellerStock<=1?
        ['Very limited genuinely owned seller stock']:[]),
       ...(offer.originalMarketScarcity.originalPaidDemand?.realFundedBuyerSalesCount>0?
        ['Recently completed local paid purchases']:[])
      ]}:{})}:
      {weaponActionId:offer.action.id})});
  }catch{}
 }
 return {available:available.slice(0,30),location:s.world.location,
  note:'Only established, publicly witnessed local offers are shown; regional market indices are not binding quotes'};
}
function purchase(s,p={}){
 input(p,['offerId']);
 if(s.battle||s.encounter)
  throw Error('Cannot buy equipment during an unresolved encounter');
 const q=validOffer(s,p.offerId),a=q.action,item=q.item;
 if(q.kind==='provisions'){
  const v=s.table.realm.localProvisioner;
  const coins=C.int(Math.round(s.player.coins*100),'saved purse in Scales',0,100000000);
  if(!Number.isFinite(s.player.coins)||Math.abs(s.player.coins*100-coins)>0.001)
   throw Error('Purse requires an accurate Scales denomination');
  if(coins<q.priceScales)throw Error('Insufficient Scales for the actual quoted provisions');
  if(v.fundsScales+q.priceScales>100000000)
   throw Error('Seller account requires reconciliation before receiving money');
  const materialPlan=Wallet.planItems(s,{clean_rations:1});
  // One unit physically leaves the vendor. No guessed seller consent, price,
  // inventory, weapon skill, or chosen dice. All preflights finish first.
  Wallet.spend(s,{scales:q.priceScales,reason:'Purchased clean rations from '+q.seller});
  v.stock--;v.fundsScales+=q.priceScales;q.stock--;
  Wallet.applyItems(s,materialPlan);
  const sale={buyer:s.player.name,worldMinute:s.world.minutes,
   priceScales:q.priceScales,item:'clean_rations',offerId:q.id};
  q.purchases.push(sale);
  v.history.push({...sale,kind:'actual-sale',remainingStock:v.stock});
  if(v.history.length>80)v.history.shift();
  E.advance(s,10);
  C.event(s,'trade','One genuinely stocked ration is sold for the previously witnessed price.',{
   origin:PROVISION_ORIGIN,offerId:q.id,priceScales:q.priceScales,
   item:'clean_rations',remainingStock:v.stock});
  return {purchased:true,item:'clean_rations',quantity:1,
   paidScales:q.priceScales,remainingStock:v.stock,elapsedMinutes:10};
 }

 if(s.player.inventory?.[item]!==undefined&&s.player.inventory[item]!==0)
  throw Error('This nonstackable mundane weapon is already owned or inventory needs reconciliation');
 if(s.player.combatActions?.[a.id])
  throw Error('An existing combat technique cannot be replaced by a merchant quote');
 if(q.purchases!==undefined&&!Array.isArray(q.purchases))
  throw Error('Merchant purchase journal must be reconciled before purchase');
 const coins=C.int(Math.round(s.player.coins*100),'saved purse in Scales',0,100000000);
 if(!Number.isFinite(s.player.coins)||Math.abs(s.player.coins*100-coins)>0.001)
  throw Error('Purse requires an accurate Scales denomination');
 if(coins<q.priceScales)throw Error('Insufficient Scales for the actual quoted weapon');
 // Everything is checked before the purse, item, stock or world minute moves.
 Wallet.spend(s,{scales:q.priceScales,reason:'Purchased '+item+' from '+q.seller});
 s.player.inventory||={};s.player.inventory[item]=(s.player.inventory[item]||0)+1;
 s.player.combatActions||={};
 s.player.combatActions[a.id]={...a};
 q.stock--;
 q.purchases||=[];
 q.purchases.push({buyer:s.player.name,worldMinute:s.world.minutes,priceScales:q.priceScales});
 q.purchases=q.purchases.slice(-100);
 E.advance(s,10);
 C.event(s,'trade','A recorded mundane weapon purchase is completed with actual payment and a real item.',
  {offerId:p.offerId,item,priceScales:q.priceScales,seller:q.seller});
 return {purchased:true,item,actionId:a.id,paidScales:q.priceScales,
  remainingStock:q.stock,elapsedMinutes:10};
}
function itemAction(s,item){
 if(typeof item!=='string'||!/^[a-z_]{3,60}$/.test(item))
  throw Error('A specific source-recorded mundane weapon item is required');
 const entries=Object.entries(s.player.combatActions||{}).filter(([id,a])=>a.item===item);
 if(entries.length!==1)throw Error('Only a single established mundane weapon action can be equipped for this item');
 const [id,a]=entries[0];
 Weapons.validateSpec(s,id,a);
 if(!Number.isInteger(s.player.inventory?.[item])||s.player.inventory[item]<1)
  throw Error('An owned weapon must actually be in inventory before equipping');
 return {id,action:a};
}
function equip(s,p={}){
 input(p,['item']);
 if(s.battle)throw Error('Cannot rearrange weapons in a combat round without a verified draw action');
 const {id}=itemAction(s,p.item);
 if(s.player.equippedWeapon===p.item)throw Error('That exact weapon is already equipped');
 s.player.equippedWeapon=p.item;
 E.advance(s,1);
 C.event(s,'equipment','A carried mundane weapon is equipped.',{item:p.item,actionId:id});
 return {equipped:true,item:p.item,actionId:id,elapsedMinutes:1};
}
function unequip(s,p={}){
 input(p,[]);
 if(s.battle)throw Error('Cannot unequip a weapon in a combat round without a verified action');
 const item=s.player.equippedWeapon;
 if(!item)throw Error('No mundane weapon is currently equipped');
 itemAction(s,item);
 delete s.player.equippedWeapon;
 E.advance(s,1);
 C.event(s,'equipment','The carried mundane weapon is safely unequipped.',{item});
 return {unequipped:true,item,elapsedMinutes:1};
}
function status(s,p={}){
 input(p,[]);
 const owned=[];
 for(const [id,a] of Object.entries(s.player.combatActions||{})){
  try{
   Weapons.validateSpec(s,id,a);
   if(Number.isInteger(s.player.inventory?.[a.item])&&s.player.inventory[a.item]>0)
    owned.push({item:a.item,actionId:id,equipped:s.player.equippedWeapon===a.item,
      damage:a.damage,offM:a.offM,attackBonus:a.attackBonus,attribute:a.attribute,
      canNonlethal:a.canNonlethal});
  }catch{}
 }
 return {equippedWeapon:owned.find(x=>x.equipped)?.item||null,owned:owned.slice(0,30)};
}
// Source-only bridge into the EXISTING physical property ledger. It neither
// transfers a weapon nor revalues it: a historically purchased mundane item
// can be described there without becoming a new type of inventory.
function ownedAsset(s,item){
 if(typeof item!=='string'||!/^[a-z_]{3,60}$/.test(item))
  throw Error('An original purchased mundane item ID or source-verified owned physical invention is required');
 const present=C.int(s.player?.inventory?.[item]??0,
  'original physically carried equipment',0,1);
 const actions=Object.entries(s.player?.combatActions||{})
  .filter(([,a])=>a?.item===item);
 if(actions.length!==1)
  throw Error('A uniquely sourced existing mundane equipment profile is required');
 const [actionId,action]=actions[0];
 Weapons.validateSpec(s,actionId,action);
 const witnesses=[];
 for(const [id,q] of Object.entries(s.table?.merchantOffers||{})){
  if(!q||q.kind==='provisions'||q.item!==item||q.id!==id||
    q.publiclyKnown!==true||typeof q.source!=='string'||
    q.source.trim().length<18||typeof q.seller!=='string'||
    q.seller.trim().length<3||!E.LOCATIONS[q.location]||
    !Number.isInteger(q.worldMinute)||q.worldMinute<0||
    q.worldMinute>s.world.minutes||
    !Number.isInteger(q.expiresAtMinute)||
    q.expiresAtMinute-q.worldMinute<0||
    q.expiresAtMinute-q.worldMinute>MAX_QUOTE_AGE||
    !Number.isInteger(q.priceScales)||q.priceScales<1||
    q.priceScales>100000000||
    !Number.isInteger(q.stock)||q.stock<0||q.stock>100||
    !Array.isArray(q.purchases)||
    JSON.stringify(q.action)!==JSON.stringify(action))
   continue;
  const purchases=q.purchases.filter(p=>p&&
   p.buyer===s.player.name&&p.priceScales===q.priceScales&&
   Number.isInteger(p.worldMinute)&&p.worldMinute>=q.worldMinute&&
   p.worldMinute<=q.expiresAtMinute&&p.worldMinute<=s.world.minutes);
  // A sale requires the original known quote, original paid purchase row
  // and the exact combat action that purchase actually installed.
  if(purchases.length!==1)continue;
  witnesses.push({offerId:id,seller:q.seller,location:q.location,
   originalSource:q.source,quotedAtMinute:q.worldMinute,
   expiresAtMinute:q.expiresAtMinute,priceScales:q.priceScales,
   item,action:structuredClone(q.action),purchase:structuredClone(purchases[0])});
 }
 if(witnesses.length!==1)
  throw Error('No unambiguous original source-witnessed purchase exists for this carried equipment');
 return {id:item,owner:s.player.name,quantity:present,
  originalRoot:hash({origin:'verified-existing-mundane-equipment-purchase-v1',
   ...witnesses[0]}),kind:'existing-purchased-mundane-equipment',
  source:'original locally witnessed and paid mundane equipment purchase'};
}
module.exports={offers,inquire,purchase,equip,unequip,status,ownedAsset};
