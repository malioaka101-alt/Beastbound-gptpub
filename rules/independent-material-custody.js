'use strict';
// Real finite material custody for existing independently acting humans.
// Starts EMPTY: no occupation, family or ordinary abstract funds create
// stock. Initial supported acquisition is an actual voluntary PC gift.
// Consumers debit this owner, never the PC bag or a duplicate shadow pool.
const Crypto=require('node:crypto'),E=require('../engine'),Core=require('./core'),
 U=require('./unified'),World=require('./world'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),Presence=require('../world/person-presence');
const ORIGIN='source-owned-independent-human-material-custody-v1',
 OFFER='witnessed-independent-human-material-offer-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
 int=(v,a=0,b=1000000000)=>Number.isInteger(v)&&v>=a&&v<=b;
const stockCount=(bag,item)=>bag[item]||0;
const purposes=Object.freeze({'body-upkeep':'witnessed-unique-physique-metabolic-maintenance-v1','rift-pocket-build':'gm-observed-anchored-rift-pocket-v-v1'});
function entries(value){
 if(!value||Object.getPrototypeOf(value)!==Object.prototype)return null;
 const e=Object.entries(value);
 if(!e.length||e.length>8||e.some(([k,v])=>!Object.hasOwn(E.RESOURCES,k)||!int(v,1,100000)))return null;
 return e;
}
function witnessValid(q,p){
 const w=q.witness,d=w?.details;
 return w?.type==='story'&&typeof w.text==='string'&&w.text.includes(p.name)&&
  w.day===q.day+1&&w.time===E.clock({world:{minutes:q.minute}})&&
  d?.actorId===p.actorId&&d.location===q.site&&q.witnessHash===hash(w);
}
function replay(s,p){
 const r=p?.originalMaterialCustody;
 if(r===undefined)return {};
 const w=Realm.peek(s);
 if(!w||!People.verify(w,p)||r.origin!==ORIGIN||!Array.isArray(r.rows)||
  !r.rows.length||r.rows.length>960)return null;
 const bag={},used=new Set(),offerDays=new Set();let last=0;
 for(const row of r.rows){
  const q=row?.source;
  if(!q||row.seal!==hash(q)||q.origin!==ORIGIN||q.actorId!==p.actorId||
   q.identityOriginHash!==p.originHash||!int(q.minute,last,s.world.minutes)||
   q.day!==Math.floor(q.minute/1440)||!witnessValid(q,p)||used.has(q.witnessHash)||
   !eq(q.before,bag)||!entries(q.items))return null;
  if(q.kind==='offer'){
   const d=q.witness.details,sh=q.shift,rng={rngState:q.rngBefore},
    offerKey=q.day+'|'+Object.keys(q.items).join('|');
   if(d.origin!==OFFER||!eq(d.items,q.items)||Object.keys(q.items).length!==1||
    Object.values(q.items)[0]>20||offerDays.has(offerKey)||
    !sh||sh.hash!==hash(Object.fromEntries(Object.entries(sh).filter(([k])=>k!=='hash')))||
    sh.actorId!==p.actorId||sh.originHash!==p.originHash||sh.location!==q.site||
    !int(sh.fromDay)||sh.throughDay-sh.fromDay!==5||sh.scheduledAtDay!==sh.fromDay||
    sh.fromDay>q.day||sh.throughDay<q.day||!int(q.rngBefore,1,4294967295)||
    q.personality!==p.personality||!int(q.fatigue,0,100)||
    q.chance!==People.originalItemGiftChance(q.personality,q.fatigue)||
    q.draw!==Core.die(rng,100)||q.rngAfter!==rng.rngState||
    q.accepted!==(rng.rngState/4294967296<q.chance)||
    q.minute+5>s.world.minutes||q.noObligationOrConsentToOtherAct!==true)return null;
   const [item,qty]=Object.entries(q.items)[0],before=stockCount(bag,item);
   if(!int(q.playerBefore,qty,100000)||
    q.playerAfter!==(q.accepted?q.playerBefore-qty:q.playerBefore))return null;
   if(q.accepted){
    if(!Core.conservedItems({sourceBefore:q.playerBefore,sourceAfter:q.playerAfter,
     targetBefore:before,targetAfter:before+qty,amount:qty}))return null;
    bag[item]=before+qty;
   }
   offerDays.add(offerKey);last=q.minute+5;
  }else if(q.kind==='consume'){
   if(!Object.hasOwn(purposes,q.purpose)||q.witness.details.origin!==purposes[q.purpose]||
    (q.purpose==='body-upkeep'&&(q.witness.details.cycle!==7||!eq(q.items,{clean_rations:1})))||
    (q.purpose==='rift-pocket-build'&&!eq(q.items,q.witness.details.materials))||q.noItemCreation!==true)return null;
   for(const [item,qty] of Object.entries(q.items)){
    const left=stockCount(bag,item)-qty;if(left<0)return null;
    if(left)bag[item]=left;else delete bag[item];
   }
   last=q.minute;
  }else return null;
  if(!eq(bag,q.after))return null;
  used.add(q.witnessHash);
 }
 return bag;
}
function held(s,p){
 const bag=replay(s,p);if(!bag)throw Error('Original independent material custody source altered');
 return bag;
}
function verify(s,p){try{return replay(s,p)!==null;}catch{return false;}}
function offer(s,{actorId,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId)||
  !int(witnessIndex,0,s.log.length-1))throw Error('Only a present individual and witnessed real material offer are accepted');
 const w=Realm.peek(s),p=w?.emergentPeople?.people?.[actorId.slice(9)],minute=s.world.minutes,
  day=Math.floor(minute/1440),site=s.world.location,present=p&&Presence.resolve(w,actorId,site,day,minute%1440),
  witness=structuredClone(s.log[witnessIndex]),items=witness?.details?.items,es=entries(items);
 if(!p||!People.verify(w,p)||p.status!=='active'||p.ageBand!=='adult, exact birthday not established'||
  !present?.presence||s.battle||s.encounter||s.table?.combatants?.player?.status!=='ok'||
  U.currentNpcWoundCondition(s,actorId)?.workAndOrdinaryPracticeBlocked||
  !s.chatRuntime?.scene?.includes(p.name)||!es||es.length!==1||es[0][1]>20||
  witness.details?.origin!==OFFER||!witnessValid({witness,witnessHash:hash(witness),day,minute,site},p))
  throw Error('Actual present adult, fresh witnessed offer and owned source-defined resource required');
 const before=held(s,p),[item,qty]=es[0],r=p.originalMaterialCustody||{origin:ORIGIN,rows:[]},
  witnessHash=hash(witness),playerBefore=s.player.inventory?.[item]||0,
  plan=U.planItems(s,{[item]:-qty});
 if(r.rows.length>=960||r.rows.some(x=>x.source.witnessHash===witnessHash||
  x.source.kind==='offer'&&x.source.day===day&&Object.hasOwn(x.source.items,item))||
  stockCount(before,item)+qty>100000)throw Error('Original material offer already answered or capacity unavailable');
 const rngBefore=p.rngState,chance=People.originalItemGiftChance(p.personality,p.fatigue),
  draw=Core.die(p,100),accepted=p.rngState/4294967296<chance,after=structuredClone(before);
 if(accepted){U.applyItems(s,plan);after[item]=stockCount(after,item)+qty;}
 const source={origin:ORIGIN,kind:'offer',actorId,identityOriginHash:p.originHash,site,day,minute,
  witness,witnessHash,shift:structuredClone(present.presence),items,before,after,
  playerBefore,playerAfter:accepted?playerBefore-qty:playerBefore,rngBefore,rngAfter:p.rngState,
  personality:p.personality,fatigue:p.fatigue,chance,draw,accepted,noObligationOrConsentToOtherAct:true};
 r.rows.push({source,seal:hash(source)});p.originalMaterialCustody=r;
 E.advance(s,5);World.finalizeTime(s,minute);
 if(!verify(s,p))throw Error('Original material offer fails custody replay');
 Core.event(s,'story',p.name+(accepted?' accepts the offered material.':' declines the offered material.'),{
  actorId,item,quantity:qty,accepted,noObligationOrConsentToOtherAct:true});
 return {actorId,accepted,item,quantity:qty,transferred:accepted,elapsedMinutes:5,noObligationOrConsentToOtherAct:true};
}
function canConsume(s,p,items){
 const es=entries(items);if(!es)return false;
 const bag=held(s,p);return es.every(([item,qty])=>stockCount(bag,item)>=qty);
}
// Internal only; the calling original action owns the check and time.
// A debit is inseparably bound to that original procedure's fresh witness.
function consume(s,p,items,purpose,witness){
 if(!Object.hasOwn(purposes,purpose)||!canConsume(s,p,items))throw Error('Actually held compatible material is required');
 const r=p.originalMaterialCustody,minute=s.world.minutes,day=Math.floor(minute/1440),site=s.world.location,
  witnessHash=hash(witness),before=held(s,p),after=structuredClone(before);
 if(r.rows.length>=960||r.rows.some(x=>x.source.witnessHash===witnessHash)||
  !s.log.some(x=>hash(x)===witnessHash)||
  !witnessValid({witness,witnessHash,day,minute,site},p)||witness.details.origin!==purposes[purpose]||
  (purpose==='body-upkeep'&&(witness.details.cycle!==7||!eq(items,{clean_rations:1})))||
  (purpose==='rift-pocket-build'&&!eq(items,witness.details.materials)))throw Error('Fresh original witnessed material consumption required');
 for(const [item,qty] of Object.entries(items)){
  after[item]-=qty;if(!after[item])delete after[item];
 }
 const source={origin:ORIGIN,kind:'consume',actorId:p.actorId,identityOriginHash:p.originHash,
  day,minute,site,witness:structuredClone(witness),witnessHash,items:structuredClone(items),
  purpose,before,after,noItemCreation:true};
 const seal=hash(source);r.rows.push({source,seal});
 if(!verify(s,p))throw Error('Original material debit fails custody replay');
 return seal;
}
function debitProof(s,p,seal,items,purpose,witnessHash,minute){
 if(!verify(s,p))return false;
 const q=p.originalMaterialCustody?.rows.find(x=>x.seal===seal)?.source;
 return !!q&&q.kind==='consume'&&q.purpose===purpose&&q.witnessHash===witnessHash&&
  q.minute===minute&&eq(q.items,items);
}
module.exports={ORIGIN,OFFER,verify,held,offer,canConsume,consume,debitProof};
