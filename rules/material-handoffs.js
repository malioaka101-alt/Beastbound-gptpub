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
  Object.entries(a.held).some(([item,quantity])=>
   !Object.hasOwn(E.RESOURCES,item)||!Number.isInteger(quantity)||
    quantity<0||quantity>100000))
  throw Error('A real recipient’s existing physical material custody needs reconciliation');
 for(const record of a.history){
  if(!record||typeof record!=='object'||
     (record.origin!==ORIGIN&&
      record.origin!=='independent-personal-ration-use-v1'))
   throw Error('A recipient’s material history must have authentic provenance');
  if(record.origin===ORIGIN){
   const {hash:seal,...source}=record;
   if(seal!==hash(source)||record.npcId!==id||
      !Object.hasOwn(E.RESOURCES,record.item)||
      ![0,1].includes(record.quantityMoved)||
      record.accepted!==(record.quantityMoved===1))
    throw Error('An original witnessed material handoff must retain its source proof');
  }else if(record.actorId!==id||record.item!=='clean_rations'||
    record.quantity!==1||!Number.isInteger(record.day))
   throw Error('Independent personal material use needs a real source receipt');
 }
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
  Health.applyItems(s,materialPlan);
  holder.held[p.item]=prior+1;
 }
 const witness={origin:ORIGIN,npcId:p.npcId,
  name:n.name,profession:n.profession,source:n.source,
  location:s.world.location,day,worldMinute:before,
  item:p.item,quantityOffered:1,quantityMoved:accepted?1:0,
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
 C.event(s,'story',accepted?
  n.name+' voluntarily accepts one real '+E.RESOURCES[p.item].name+'.':
  n.name+' declines the offered '+E.RESOURCES[p.item].name+'; you retain it.',{
   ...witness,witnessHash:receipt.hash});
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
  a.held.clean_rations--;
  if(a.held.clean_rations===0)delete a.held.clean_rations;
  a.history.push({origin:'independent-personal-ration-use-v1',
   actorId:id,item:'clean_rations',quantity:1,day,
   noPlayerBenefit:true,remainingOwned:a.held.clean_rations||0});
  if(a.history.length>90)a.history.shift();
 }
}
module.exports={ORIGIN,offer,status,sixday};
