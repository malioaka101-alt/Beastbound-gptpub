'use strict';
// Source-witnessed item handoffs between a real player and a real present
// person. Uses original person-presence, individual decisions, physical
// inventory, world time and durable receipt provenance. No invented stock
// listing, employment, friendship, salary, consent or magical effect.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),Health=require('./unified'),Time=require('./world'),
 Realm=require('../world/simulation'),Presence=require('../world/person-presence');
const ORIGIN='voluntary-in-person-material-transfer-v1',WORK=6,DAY=1440;
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const personSeed=(w,id)=>Crypto.createHash('sha256')
 .update(String(w.worldSeed)+'|'+id+'|physical-material-custody-v1')
 .digest().readUInt32BE(0)||0x45aef127;
function draw(a){
 let x=a.rngState>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 a.rngState=(x>>>0)||0x45aef127;
 return a.rngState/4294967296;
}
function validateAccount(a,id){
 if(!a||a.actorId!==id||!Number.isInteger(a.rngState)||a.rngState<1||
  !a.held||typeof a.held!=='object'||Array.isArray(a.held)||
  !Array.isArray(a.history)||a.history.length>90||
  (a.purchaseReceipts!==undefined&&
   (!Array.isArray(a.purchaseReceipts)||a.purchaseReceipts.length>10000||
    a.purchaseReceipts.some(x=>x?.origin!=='genuine-independent-funded-local-ration-purchase-v1'||
     x.actorId!==id||x.item!=='clean_rations'||x.quantity!==1||
     x.hash!==hash(Object.fromEntries(Object.entries(x).filter(([k])=>k!=='hash'))))||
    new Set(a.purchaseReceipts.map(x=>x.purchaseSourceHash)).size!==a.purchaseReceipts.length))||
  Object.entries(a.held).some(([item,quantity])=>
   !Object.hasOwn(E.RESOURCES,item)||!Number.isInteger(quantity)||
    quantity<0||quantity>100000))
  throw Error('A real recipient’s existing physical material custody needs reconciliation');
 // Use existing original events, not a separate stock ledger. New entries
 // retain complete before/after proof; historical save rows still parse.
 const latestVerifiedHolding=new Map();
 for(const record of a.history){
  if(!record||typeof record!=='object'||
     (record.origin!==ORIGIN&&
      record.origin!=='independent-personal-ration-use-v1'&&
      record.origin!=='genuine-independent-funded-local-ration-purchase-v1'))
   throw Error('A recipient’s material history must have authentic provenance');
  if(record.origin===ORIGIN){
   const {hash:seal,...source}=record;
   if(seal!==hash(source)||record.npcId!==id||
      !Object.hasOwn(E.RESOURCES,record.item)||
      ![0,1].includes(record.quantityMoved)||
      record.accepted!==(record.quantityMoved===1))
    throw Error('An original witnessed material handoff must retain its source proof');
   const fields=['playerStockBefore','playerStockAfter',
    'recipientStockBefore','recipientStockAfter'];
   if(fields.some(k=>record[k]!==undefined)){
    if(!fields.every(k=>Number.isSafeInteger(record[k])))
     throw Error('Voluntary physical handoff must retain both original balances');
    if(record.accepted?
      !C.conservedItems({sourceBefore:record.playerStockBefore,
       sourceAfter:record.playerStockAfter,
       targetBefore:record.recipientStockBefore,
       targetAfter:record.recipientStockAfter,amount:record.quantityMoved}):
      record.playerStockAfter!==record.playerStockBefore||
      record.recipientStockAfter!==record.recipientStockBefore||
      [record.playerStockBefore,record.recipientStockBefore]
       .some(n=>n<0||n>100000))
     throw Error('Voluntary physical handoff must conserve or record a genuine refusal');
    latestVerifiedHolding.set(record.item,record.recipientStockAfter);
   }
  }else if(record.origin==='genuine-independent-funded-local-ration-purchase-v1'){
   const {hash:seal,...source}=record;
   if(seal!==hash(source)||record.actorId!==id||
    record.item!=='clean_rations'||record.quantity!==1||
    !Number.isInteger(record.day)||record.day<1||
    typeof record.purchaseSourceHash!=='string'||
    !/^[a-f0-9]{64}$/.test(record.purchaseSourceHash)||
    record.noNewPhysicalItemCreated!==true||
    record.noFreeCurrencyAwarded!==true)
    throw Error('An independently paid physical ration must have a real sale source');
   if(record.heldBefore!==undefined||record.heldAfter!==undefined){
    if(!Number.isSafeInteger(record.heldBefore)||
       !Number.isSafeInteger(record.heldAfter)||
       record.heldBefore<0||record.heldAfter>100000||
       record.heldAfter!==record.heldBefore+record.quantity)
     throw Error('An original funded purchase must credit exactly the paid-for material');
    latestVerifiedHolding.set(record.item,record.heldAfter);
   }
  }else{
   if(record.actorId!==id||record.item!=='clean_rations'||
     record.quantity!==1||!Number.isInteger(record.day))
    throw Error('Independent personal material use needs a real source receipt');
   // Legacy saved sixday uses were not source-hashed. Never pretend they
   // received a newer proof or invalidate the old historical save.
   if(record.heldBefore!==undefined||record.hash!==undefined){
    const {hash:seal,...source}=record;
    if(seal!==hash(source)||!Number.isSafeInteger(record.heldBefore)||
       record.heldBefore<1||record.heldBefore>100000||
       record.remainingOwned!==record.heldBefore-record.quantity)
     throw Error('Independently used ration must retain its real original balance');
    latestVerifiedHolding.set(record.item,record.remainingOwned);
   }
  }
 }
 for(const [item,quantity] of latestVerifiedHolding)
  if((a.held[item]??0)!==quantity)
   throw Error('Original personal material custody balance disagrees with its latest witnessed transfer');
 const prior=[...a.history].reverse().find(h=>h.origin===ORIGIN);
 if(a.lastOffer!==null&&a.lastOffer!==undefined&&
    (!prior||a.lastOffer.circumstanceHash!==prior.circumstanceHash||
      a.lastOffer.response!==(prior.accepted?'accepted':'declined')))
  throw Error('Recipient’s most recent real material decision needs its original witness');
}
function custody(w){
 if(w.materialCustody===undefined)w.materialCustody={version:1,accounts:{}};
 const c=w.materialCustody;
 if(!c||c.version!==1||!c.accounts||typeof c.accounts!=='object'||
    Array.isArray(c.accounts))
  throw Error('World-owned personal material holdings need reconciliation');
 for(const [id,a] of Object.entries(c.accounts))validateAccount(a,id);
 return c;
}
function personAccount(w,id){
 const c=custody(w),account=c.accounts[id]||(
  c.accounts[id]={actorId:id,rngState:personSeed(w,id),
   held:{},history:[],lastOffer:null});
 validateAccount(account,id);return account;
}
function responseChance(person,item){
 const job=person.profession.toLowerCase();
 const provisioning=/provision|supply|trade|food|relief/;
 const field=/habitat|natural|surve|field|ecolog|botan/;
 const medical=/physic|clinic|infirm|medic|anatom/;
 const relevant=item==='clean_rations'?provisioning.test(job):
  (item==='marsh_reed'||item==='ironbloom')?
   field.test(job)||medical.test(job):false;
 return relevant?.75:.34;
}
function offer(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).sort().join('|')!=='item|npcId'||
    typeof p.npcId!=='string'||typeof p.item!=='string')
  throw Error('A material handoff requires one actually present person and one real carried item, never a caller-selected response, quantity or trust change');
 if(s.battle||s.encounter)
  throw Error('Resolve the immediate encounter or battle before handing ordinary goods to a person');
 const state=s.table?.combatants?.player?.status;
 if(state&&state!=='ok')
  throw Error('An incapacitated character cannot make a deliberate material handoff');
 if(!Object.hasOwn(E.RESOURCES,p.item))
  throw Error('Only an existing authenticated physical resource can be offered');
 // Physical presence is the real availability rule. The authored
 // public professionals already have their verified 08:00–18:00 shift in
 // person-presence; an independently present worker is not sent home by
 // an extra universal clock restriction on gifts.
 const w=Realm.peek(s),day=Math.floor(s.world.minutes/DAY),
  available=Presence.localStatus(s,w).people,
  found=available.find(x=>x.npcId===p.npcId);
 if(!found)
  throw Error('The named person is not independently established as present at this scene');
 const n=Presence.resolve(w,p.npcId,s.world.location,day);
 if(!n||n.id!==p.npcId||n.name!==found.name||
    !Presence.proof(w,p.npcId,s.world.location,day,n.presence))
  throw Error('The source of this person’s actual presence could not be verified');
 // Verify ownership *before* constructing the world custody account. An
 // unsupported item or missing goods cannot cause a hidden world mutation.
 const journal=s.table?.personalMaterialOffers;
 if(journal!==undefined&&!Array.isArray(journal))
  throw Error('Personally witnessed material handoffs need a valid original journal');
 const materialPlan=Health.planItems(s,{[p.item]:-1});
 const world=Realm.ensure(s),holder=personAccount(world,p.npcId);
 const prior=C.int(holder.held[p.item]??0,'actual recipient-held material',0,100000);
 const circumstanceHash=hash({npcId:p.npcId,item:p.item,day,
  location:s.world.location,recipientOwned:prior,
  presence:n.presence?.hash||'canonical-public-duty'});
 if(holder.lastOffer?.circumstanceHash===circumstanceHash){
  return {offered:false,repeated:true,accepted:false,
   npcId:p.npcId,item:p.item,quantityMoved:0,elapsedMinutes:0,
   noAdditionalDecision:true,noAutomaticRelationship:true,
   message:'The person has already considered this same material offer under unchanged circumstances.'};
 }
 const accepted=prior<100000&&draw(holder)<responseChance(n,p.item),
  before=s.world.minutes;
 if(accepted){
  // The original player material plan and the independent person's existing
  // physical account are the two sides of ONE real voluntary item movement.
  const moved=materialPlan.entries[0];
  if(!C.conservedItems({sourceBefore:moved.before,
    sourceAfter:moved.after,targetBefore:prior,targetAfter:prior+1,amount:1}))
   throw Error('Voluntary physical material transfer failed common finite conservation');
  Health.applyItems(s,materialPlan);
  holder.held[p.item]=prior+1;
 }
 const moved=materialPlan.entries[0];
 const witness={origin:ORIGIN,npcId:p.npcId,
  name:n.name,profession:n.profession,source:n.source,
  location:s.world.location,day,worldMinute:before,
  item:p.item,quantityOffered:1,quantityMoved:accepted?1:0,
  playerStockBefore:moved.before,
  playerStockAfter:accepted?moved.after:moved.before,
  recipientStockBefore:prior,recipientStockAfter:accepted?prior+1:prior,
  accepted,recipientPresenceHash:n.presence?.hash||null,
  circumstanceHash,noCompelledAcceptance:true,
  noContract:true,noAutomaticTrust:true,noCurrencyAward:true};
 const receipt={...witness,hash:hash(witness)};
 holder.lastOffer={circumstanceHash,response:accepted?'accepted':'declined'};
 holder.history.push(receipt);
 if(holder.history.length>90)holder.history.shift();
 s.table||={};s.table.personalMaterialOffers||=[];
 if(!Array.isArray(s.table.personalMaterialOffers))
  throw Error('Personally witnessed material handoffs need a valid original journal');
 s.table.personalMaterialOffers.push(receipt);
 // These before/after fields are real, PRIVATE recipient holdings. Retain
 // their full source proof only in the canonical custody/journal records;
 // never copy them to a player-facing scene event.
 const {recipientStockBefore:_privateBefore,
  recipientStockAfter:_privateAfter,...publicWitness}=witness;
 C.event(s,'story',accepted?
  n.name+' voluntarily accepts one real '+E.RESOURCES[p.item].name+'.':
  n.name+' declines the offered '+E.RESOURCES[p.item].name+'; you retain it.',{
   ...publicWitness,witnessHash:receipt.hash});
 E.advance(s,WORK);Time.finalizeTime(s,before);Health.sync(s,{source:'legacy'});
 return {offered:true,accepted,npcId:p.npcId,person:n.name,
  item:p.item,quantityMoved:accepted?1:0,elapsedMinutes:WORK,
  witnessHash:receipt.hash,noPlayerDice:true,noAutomaticRelationship:true,
  noContract:true,noCurrencyAward:true,message:accepted?
   n.name+' accepts the material, taking ownership of one actual item. No favour or return payment is promised.':
   n.name+' declines the item. You still own it; the conversation creates no agreement.'};
}
function status(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Material handoff history does not accept hidden targets or chosen receipts');
 const rec=s.table?.personalMaterialOffers||[];
 if(!Array.isArray(rec))throw Error('Material handoff witness journal is invalid');
 return {knownHandoffs:rec.slice(-25).map(({npcId,name,profession,location,
  item,accepted,quantityMoved,day,hash:receiptHash})=>({
   npcId,name,profession,location,item,accepted,quantityMoved,day,
   witnessHash:receiptHash})),
  note:'Only physically witnessed acceptances and refusals are shown. Private uses, dispositions, promises, future stock and hidden personal holdings are not disclosed.'};
}
// On later independent world ticks, people may eat real rations they were
// given. Other materials stay owned; no imaginary recipe, sale or aid arises.
function sixday(w,day){
 const accounts=w.materialCustody?.accounts;
 if(!accounts)return;
 if(!Number.isInteger(day)||day<0)
  throw Error('A real independent world day is required for personal goods use');
 for(const [id,a] of Object.entries(accounts)){
  validateAccount(a,id);
  if((a.held.clean_rations||0)<1)continue;
  if(draw(a)>=.7)continue;
  const heldBefore=a.held.clean_rations;
  a.held.clean_rations--;
  if(a.held.clean_rations===0)delete a.held.clean_rations;
  const used={origin:'independent-personal-ration-use-v1',
   actorId:id,item:'clean_rations',quantity:1,day,
   noPlayerBenefit:true,heldBefore,remainingOwned:a.held.clean_rations||0};
  a.history.push({...used,hash:hash(used)});
  if(a.history.length>90)a.history.shift();
  validateAccount(a,id);
 }
}

/*
 * #19 — an original GM-authored freeform description can be attached to
 * ACTUALLY OWNED finite material without creating it. The source of each
 * registered fact is the original inventory, a real voluntary accepted
 * person-to-person handoff, or the existing merchant-owned local stock.
 * These are witnessed property observations, NOT arbitrary legal deeds:
 * later consumption, trade or another person's wishes remain independent.
 *
 * This intentionally extends the original physical custody system instead
 * of creating a new shop, item currency, or default economic profession.
 */
const ASSET_ORIGIN='witnessed-existing-material-owner-and-stock-attestation-v1';
const STOCK_OWNER='merchant:otto';
function ownerStock(s,ownerId,item,{requireLocal=false}={}){
 const w=Realm.peek(s),day=Math.floor(s.world.minutes/DAY);
 // Real non-stackable objects from BOTH existing physical construction and
 // paid mundane equipment purchases use this same historic owner journal.
 // The owner is verified by the original system; a description awards none.
 if(!Object.hasOwn(E.RESOURCES,item)){
  if(ownerId!=='player'||typeof item!=='string')
   throw Error('Only a real original personally owned object may be documented outside existing stackable resources');
  // One read-only owner contract; original construction or purchase proof
  // is still verified only by the responsible source module.
  const provider=Object.hasOwn(s.table?.creationPrototypes||{},item)?
   require('./creation-prototype'):require('./equipment');
  const asset=provider.ownedAsset(s,item);
  if(!asset||asset.id!==item||asset.owner!==s.player.name||
   !['existing-authored-personal-tool',
     'existing-purchased-mundane-equipment'].includes(asset.kind)||
   !Number.isInteger(asset.quantity)||asset.quantity<0||asset.quantity>1||
   typeof asset.originalRoot!=='string'||asset.originalRoot.length!==64||
   typeof asset.source!=='string'||asset.source.length<18)
   throw Error('Original physical source provider failed common ownership reconciliation');
  return {kind:asset.kind,count:asset.quantity,source:asset.source,
   ownerName:asset.owner,originalRoot:asset.originalRoot};
 }
 if(ownerId==='player'){
  const n=s.player.inventory?.[item]??0;
  C.int(n,'actual player-owned material',0,100000);
  return {kind:'player-inventory',count:n,
   source:'saved original physically owned player inventory',
   ownerName:s.player.name,originalRoot:hash({
    source:'character-existing-inventory',seed:s.seed,
    character:s.player.name})};
 }
 if(ownerId===STOCK_OWNER){
  const v=w.localProvisioner;
  if(!v||v.origin!=='established-reedmarch-provisions-v1'||
   v.sellerNpcId!=='otto'||v.item!==item||
   v.location!=='crossing'||v.regionId!=='morrowfen_basin')
   throw Error('Only genuine existing merchant-owned stock can be observed');
  if(requireLocal&&(s.world.location!==v.location||
   !Presence.localStatus(s,w).people.some(x=>x.npcId==='otto')))
   throw Error('Merchant stock cannot be viewed without genuine local presence');
  C.int(v.stock,'actual merchant-owned stock',0,100000);
  return {kind:'original-merchant-stock',count:v.stock,
   source:'original independent local provisioner owned stock',
   ownerName:v.seller,originalRoot:hash({
    origin:v.origin,founding:v.founding,sellerNpcId:v.sellerNpcId,
    location:v.location,item:v.item})};
 }
 if(typeof ownerId!=='string'||!ownerId.startsWith('npc:'))
  throw Error('The owner must be the real character, established merchant or known real recipient');
 const npcId=ownerId.slice(4),npc=Presence.identity(w,npcId),
  holdings=w.materialCustody?.accounts?.[npcId];
 if(!npc||!holdings)
  throw Error('Only an actual sourced independently owning person may be documented');
 validateAccount(holdings,npcId);
 if(requireLocal&&(s.world.location!==npc.location&&
  !Presence.resolve(w,npcId,s.world.location,day)||
  !Presence.localStatus(s,w).people.some(x=>x.npcId===npcId)))
  throw Error('Private recipient goods cannot be documented without actual presence');
 const receipts=(s.table?.personalMaterialOffers||[]).filter(x=>
  x.npcId===npcId&&x.item===item&&x.accepted&&
  x.quantityMoved===1&&x.hash===hash(Object.fromEntries(
   Object.entries(x).filter(([k])=>k!=='hash'))));
 if(!receipts.length)
  throw Error('A real independently accepted original handoff is required to establish known person-owned material');
 const count=holdings.held[item]??0;
 C.int(count,'existing person-owned material',0,100000);
 return {kind:'original-accepted-person-handoff',count,
  source:'original source-witnessed independent-person material acceptance',
  ownerName:npc.name,originalRoot:receipts[0].hash,
  referenceReceipt:receipts[0].hash};
}
function verifyAssetAttestations(s){
 const records=s.table?.materialAssetAttestations;
 if(records===undefined)return true;
 if(!Array.isArray(records)||records.length>500)return false;
 const seen=new Set();let previousMinute=-1;
 for(const row of records){
  const q=row?.source;
  if(!q||row.hash!==hash(q)||row.id!==q.id||
   q.origin!==ASSET_ORIGIN||
   row.id!=='physical_asset_'+hash({
    ownerId:q.ownerId,item:q.item,description:q.description,
    minute:q.minute,quantity:q.quantity}).slice(0,25)||
   seen.has(row.id)||
   row.ownerId!==q.ownerId||row.item!==q.item||
   row.quantity!==q.quantity||
   (!Object.hasOwn(E.RESOURCES,q.item)&&
    (q.ownerId!=='player'||
     !['existing-authored-personal-tool',
       'existing-purchased-mundane-equipment'].includes(q.ownerKind)||
     q.quantity!==1||q.physicalStockAtWitness!==1))||
   typeof q.description!=='string'||
   q.description.trim()!==q.description||
   q.description.length<20||q.description.length>450||
   !Number.isInteger(q.quantity)||q.quantity<1||
   q.quantity>100000||
   !Number.isInteger(q.physicalStockAtWitness)||
   q.physicalStockAtWitness<q.quantity||
   q.physicalStockAtWitness>100000||
   !Number.isInteger(q.minute)||q.minute<previousMinute||
   q.day!==Math.floor(q.minute/DAY)||
   typeof q.ownerName!=='string'||!q.ownerName||
   typeof q.originalRoot!=='string'||q.originalRoot.length!==64||
   q.noNewPhysicalStock!==true||
   q.noLegalTitleOrForcedConsent!==true||
   q.noCurrencyOrGuaranteedProduction!==true)
   return false;
  try{
   const owner=ownerStock(s,q.ownerId,q.item);
   if(owner.kind!==q.ownerKind||owner.originalRoot!==q.originalRoot||
    owner.ownerName!==q.ownerName)return false;
  }catch{return false;}
  seen.add(row.id);previousMinute=q.minute;
 }
 return true;
}
function attestAsset(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).sort().join('|')!=='description|item|ownerId|quantity')
  throw Error('Actual material ownership attestation accepts only an owner, sourced physical item, quantity and freeform GM description');
 if(typeof p.description!=='string'||p.description.trim()!==p.description||
  p.description.length<20||p.description.length>450)
  throw Error('A meaningful freeform physical asset description is necessary, not an invented legal deed or quality award');
 C.int(p.quantity,'physically attested material quantity',1,100000);
 if(!verifyAssetAttestations(s))
  throw Error('The existing source-backed physical asset journal has been altered');
 const owner=ownerStock(s,p.ownerId,p.item,{requireLocal:true});
 if(owner.count<p.quantity)
  throw Error('Property documentation cannot create unowned items or exceed actual owner stock');
 const minute=s.world.minutes,q={
  origin:ASSET_ORIGIN,ownerId:p.ownerId,item:p.item,
  ownerKind:owner.kind,ownerName:owner.ownerName,
  originalRoot:owner.originalRoot,
  minute,day:Math.floor(minute/DAY),
  quantity:p.quantity,physicalStockAtWitness:owner.count,
  description:p.description,
  noNewPhysicalStock:true,noLegalTitleOrForcedConsent:true,
  noCurrencyOrGuaranteedProduction:true};
 q.id='physical_asset_'+hash({ownerId:q.ownerId,item:q.item,
  description:q.description,minute:q.minute,quantity:q.quantity}).slice(0,25);
 const row={id:q.id,ownerId:q.ownerId,item:q.item,
  quantity:q.quantity,source:q,hash:hash(q)};
 const existing=s.table?.materialAssetAttestations||[];
 if(existing.some(x=>x.id===row.id))
  throw Error('An unchanged physical asset observation cannot be double recorded');
 s.table||={};s.table.materialAssetAttestations||=[];
 s.table.materialAssetAttestations.push(row);
 if(!verifyAssetAttestations(s)){
  s.table.materialAssetAttestations.pop();
  throw Error('An asset observation must remain consistent with its original owner');
 }
 return {documented:true,id:row.id,ownerId:p.ownerId,
  ownerName:owner.ownerName,item:p.item,quantity:p.quantity,
  description:p.description,sourceHash:row.hash,
  actualStockUnchanged:true,noNewGoodsOrCurrency:true,
  noLegalTitleOrCompulsoryAgreement:true};
}
function assetStatus(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).some(k=>k!=='ownerId')||
  p.ownerId!==undefined&&typeof p.ownerId!=='string')
  throw Error('Physical assets can only be inspected by a source-known owner identity');
 if(!verifyAssetAttestations(s))
  throw Error('Original physical owner history failed reconciliation');
 const journal=s.table?.materialAssetAttestations||[];
 const ownerId=p.ownerId;
 const rows=journal.filter(x=>ownerId===undefined||x.ownerId===ownerId)
  .map(x=>{
   const q=x.source;
   const owner=ownerStock(s,q.ownerId,q.item);
   // A previous snapshot remains valid history even when goods were
   // consumed, sold, handed away or replenished. Never imply a hidden
   // person's exact private stock from an earlier witnessed receipt.
   return {id:x.id,ownerId:x.ownerId,ownerName:q.ownerName,
    description:q.description,item:x.item,
    quantityAtOriginalWitness:q.quantity,
    day:q.day,sourceHash:x.hash,
    ...(q.ownerId==='player'?
     {currentlyCarried:owner.count,stillHasAtLeastQuantity:
      owner.count>=q.quantity}:{
       currentPrivateHoldingNotDisclosed:true}),
    legalTitleNotEstablished:true,
    materialNotCreated:true};
  });
 return {knownOwnedPhysicalMaterialObservations:rows.slice(-40),
  note:'Actual original physical stock and witnessed acceptance govern custody. Descriptions register observations, not duplicate goods, enforce contracts or grant new ownership. People may independently use or move their possessions; old attestations remain historical.'};
}


/*
 * Real independent citizen purchasing reuses SAME ORIGINAL physical
 * personal material account as gifts and later sixday ration use. It is
 * never a new player-facing item, secret duplicated wallet or free stock.
 */
const SOURCE_PURCHASE='genuine-independent-funded-local-ration-purchase-v1';
function preflightPurchasedRation(w,id,row){
 const c=w?.materialCustody;
 if(c!==undefined){
  if(c?.version!==1||!c.accounts||typeof c.accounts!=='object'||
   Array.isArray(c.accounts))
   throw Error('Real person physical stock accounts must reconcile before funded trade');
  for(const [key,a] of Object.entries(c.accounts))validateAccount(a,key);
 }
 const held=c?.accounts?.[id]?.held?.clean_rations??0;
 if(typeof id!=='string'||!id.startsWith('emergent:person_')||
  !row||row.origin!==SOURCE_PURCHASE||
  row.sourceHash!==hash(row.source)||
  row.source?.actorId!==id||
  row.source.item!=='clean_rations'||row.source.quantity!==1||
  !Number.isInteger(row.source.day)||row.source.day<1||
  !Number.isInteger(held)||held<0||held>=100000||
  c?.accounts?.[id]?.purchaseReceipts?.some(x=>
   x.origin===SOURCE_PURCHASE&&x.purchaseSourceHash===row.sourceHash))
  throw Error('One existing personally owned ration may be credited only from a new genuine funded sale');
 return true;
}
function creditPurchasedRation(w,id,row){
 preflightPurchasedRation(w,id,row);
 const a=personAccount(w,id),heldBefore=a.held.clean_rations??0,
  q={origin:SOURCE_PURCHASE,actorId:id,item:'clean_rations',quantity:1,
   day:row.source.day,purchaseSourceHash:row.sourceHash,
   heldBefore,heldAfter:heldBefore+1,
   noNewPhysicalItemCreated:true,noFreeCurrencyAwarded:true};
 const r={...q,hash:hash(q)};
 a.held.clean_rations=q.heldAfter;
 a.history.push(r);
 if(a.history.length>90)a.history.shift();
 a.purchaseReceipts||=[];a.purchaseReceipts.push(structuredClone(r));
 validateAccount(a,id);
 return r.hash;
}

module.exports={ORIGIN,ASSET_ORIGIN,offer,status,sixday,
 attestAsset,assetStatus,verifyAssetAttestations,validateAccount,
 SOURCE_PURCHASE,preflightPurchasedRation,creditPurchasedRation};
