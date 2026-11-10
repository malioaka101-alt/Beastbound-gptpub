'use strict';
// Master §26: first personally witnessed Weapon Cultivation method.
// The actual source-equipped weapon, technical motion, intent and living-body
// biomechanics matter. A finite focused strike adapts the ORIGINAL attack
// modifier once, with extra real stamina; never a replacement combat die,
// upgraded weapon, free new rank or universal school.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),W=require('./world'),U=require('./unified'),
 Combat=require('./combat'),Weapon=require('./player-combat-action');
const SOURCE='witnessed-weapon-intent-specialism-v1',
 OBS='gm-witnessed-body-integrated-weapon-intent-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const int=(x,lo=0,hi=100000000)=>Number.isInteger(x)&&x>=lo&&x<=hi;
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{3,65}$/.test(x);
const prose=x=>typeof x==='string'&&x.trim().length>=25&&x.length<=900;
const only=(p,keys)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(k=>keys.includes(k));
const TRAIN_MINUTES=45,TRAIN_STAMINA=3,FOCUS_DURATION=180,
 STRIKE_STAMINA=2,FOCUS_MODIFIER=1;
function ledger(s){return s.table?.specialistWeaponIntents||null;}
function witness(s,index,attackId){
 if(!int(index,0,(s.log?.length||0)-1))
  throw Error('A genuinely witnessed original weapon-intent physical trial is required');
 const w=s.log[index],d=w?.details,
  action=s.player?.combatActions?.[attackId];
 if(w?.type!=='story'||!prose(w.text)||
  d?.origin!==OBS||d.location!==s.world?.location||
  d.attackId!==attackId||d.weaponItem!==action?.item||
  !id(d.formId)||!prose(d.originalSchoolOrIndependentTechnique)||
  !prose(d.knownWeaponIntent)||
  !prose(d.measuredFootingAndGrip)||
  !prose(d.breathAndLivingBodyIntegration)||
  !prose(d.independentMovementBaseline)||
  !prose(d.independentCountermovementTest)||
  !prose(d.safetyAndFatigueLimits)||
  !prose(d.actualEquipmentProvenance)||
  d.noWeaponStatChange!==true||d.noUnlearnedMeridianGate!==true||
  d.noGuaranteedHit!==true||d.noExtraAttackRoll!==true)
  throw Error('Actual individual weapon intent, body mechanics, original equipped action, baseline and independent counter are required');
 return structuredClone(w);
}
function validCheck(a){
 const c=a.check,e=a.rollEvent;
 return !!(e?.type==='roll'&&a.rollHash===hash(e)&&
  hash(e.details)===hash(c)&&int(a.roll,1,20)&&a.roll===c.roll&&
  c.dc===a.dc&&c.modifier===a.modifier&&
  c.naturalBonus===C.naturalAdjustment(a.roll)&&
  c.total===a.roll+c.modifier+c.naturalBonus&&
  c.margin===c.total-c.dc&&c.success===(c.margin>=0)&&
  c.degree===C.degree(c.margin,true)&&
  c.progress===C.progress(c.degree));
}
function verify(s){
 const l=ledger(s);
 if(!l)return true;
 if(l.origin!==SOURCE||!Array.isArray(l.trials)||
  !Array.isArray(l.strikes)||!l.trials.length)return false;
 const successes=new Map(),usedWitnesses=new Set(),forms=new Set();
 let prior=-1;
 for(const row of l.trials){
  const a=row?.source,d=a?.witness?.details;
  if(row?.origin!==SOURCE||!a||row.seal!==hash(a)||
   a.origin!==SOURCE||a.kind!=='physical-weapon-intent-practice'||
   !id(a.formId)||!id(a.attackId)||
   !int(a.minute,prior,s.world.minutes)||
   a.minute+TRAIN_MINUTES>s.world.minutes||
   a.minutes!==TRAIN_MINUTES||
   a.staminaSpent!==TRAIN_STAMINA||
   !int(a.attributeScore,1,30)||
   !int(a.combatRank,0,5)||
   a.modifier!==Math.floor((a.attributeScore-10)/2)+2*a.combatRank||
   a.dc!==15||!validCheck(a)||
   a.success!==a.check.success||
   a.formedMinute!==(a.success?a.minute+TRAIN_MINUTES:null)||
   a.expiresAt!==(a.success?a.formedMinute+FOCUS_DURATION:null)||
   !a.witness||a.witness.type!=='story'||
   a.witnessHash!==hash(a.witness)||
   d?.origin!==OBS||d.attackId!==a.attackId||
   d.location!==a.location||
   d.weaponItem!==a.weaponItem||
   d.formId!==a.formId||
   !prose(d.originalSchoolOrIndependentTechnique)||
   !prose(d.knownWeaponIntent)||
   !prose(d.measuredFootingAndGrip)||
   !prose(d.breathAndLivingBodyIntegration)||
   !prose(d.independentMovementBaseline)||
   !prose(d.independentCountermovementTest)||
   !prose(d.safetyAndFatigueLimits)||
   !prose(d.actualEquipmentProvenance)||
   d.noWeaponStatChange!==true||
   d.noUnlearnedMeridianGate!==true||
   d.noGuaranteedHit!==true||d.noExtraAttackRoll!==true||
   usedWitnesses.has(a.witnessHash)||forms.has(a.formId))
   return false;
  usedWitnesses.add(a.witnessHash);forms.add(a.formId);
  if(a.success)successes.set(row.seal,a);
  prior=a.minute+TRAIN_MINUTES;
 }
 const used=new Set();
 let priorStrike=-1;
 for(const row of l.strikes){
  const a=row?.source,trained=successes.get(a?.practiceSeal),
   event=a?.originalAttackEvent,detail=event?.details;
  if(row?.origin!==SOURCE||!a||row.seal!==hash(a)||
   a.origin!==SOURCE||a.kind!=='spent-body-integrated-weapon-focus'||
   !trained||used.has(a.practiceSeal)||
   a.formId!==trained.formId||
   a.attackId!==trained.attackId||
   a.weaponItem!==trained.weaponItem||
   !int(a.minute,Math.max(trained.formedMinute,priorStrike),s.world.minutes)||
   a.minute>=trained.expiresAt||
   a.bonus!==FOCUS_MODIFIER||a.staminaSpent!==STRIKE_STAMINA||
   a.originalBaseModifier!==a.actualModifier-FOCUS_MODIFIER||
   !event||!['combat','roll'].includes(event.type)||
   a.originalAttackHash!==hash(event)||
   event.type==='roll'&&typeof detail?.roll!=='number'||
   !int(detail?.roll,1,20)||a.combatRoll!==detail.roll)
   return false;
  used.add(a.practiceSeal);priorStrike=a.minute;
 }
 return true;
}
function status(s){
 if(!verify(s))throw Error('The individual weapon-intent source history cannot be reconciled');
 const l=ledger(s),now=s.world.minutes,
  used=new Set((l?.strikes||[]).map(x=>x.source.practiceSeal));
 return {practices:l?.trials.length||0,
  qualifiedFocuses:(l?.trials||[]).filter(x=>x.source.success&&
    x.source.formedMinute<=now&&now<x.source.expiresAt&&
    !used.has(x.seal)).map(x=>({
     id:x.source.formId,attackId:x.source.attackId,
     weaponItem:x.source.weaponItem,
     expiresAtWorldMinute:x.source.expiresAt,
     oneUseModifier:FOCUS_MODIFIER})),
  spentStrikes:l?.strikes.length||0,
  noFreeDamage:true,noAddedDice:true,noMandatoryMentor:true,
  note:'A witnessed personally integrated ordinary weapon form can support one actual prepared attack, subject to real gear, body exertion, independent enemy action and existing wounds'};
}
function practice(s,p={}){
 if(!only(p,['witnessIndex','attackId'])||!id(p.attackId)||
  !int(p.witnessIndex,0,(s.log?.length||0)-1))
  throw Error('A personally witnessed original form and real recorded weapon action must be selected');
 if(!E.LOCATIONS[s.world?.location]||s.battle||s.encounter||
  s.world?.planeId&&s.world.planeId!=='mortal'||
  s.table?.combatants?.player?.status!=='ok')
  throw Error('Safe original bodily weapon training at an actual physical mortal scene is required');
 const profile=Weapon.profile(s,p.attackId),w=witness(s,p.witnessIndex,p.attackId);
 if(!verify(s))throw Error('Earlier actual individual weapon source evidence cannot be verified');
 const l=ledger(s),d=w.details,h=hash(w);
 if(l?.trials.some(x=>x.source.formId===d.formId||
   x.source.witnessHash===h))
  throw Error('A specific actually witnessed weapon form cannot be rerolled');
 if(!int(s.player.stamina,TRAIN_STAMINA,100000)||
  !int(s.table.combatants.player.stamina,TRAIN_STAMINA,100000))
  throw Error('Original physical training requires real living Stamina');
 const spec=s.player.combatActions[p.attackId],
  score=C.int(s.player.attributes[spec.attribute],'actual physical weapon attribute',1,30),
  rank=C.int(s.player.skills.combat.rank,'real combat rank',0,5),
  modifier=Math.floor((score-10)/2)+2*rank,minute=s.world.minutes,
  check=C.check(s,{modifier,dc:15,
   label:'Personally witnessed original bodily weapon-intent integration'}),
  event=structuredClone(s.log.at(-1));
 s.player.stamina-=TRAIN_STAMINA;
 s.table.combatants.player.stamina=s.player.stamina;
 const a={origin:SOURCE,kind:'physical-weapon-intent-practice',
  formId:d.formId,attackId:p.attackId,weaponItem:spec.item,
  minute,location:s.world.location,minutes:TRAIN_MINUTES,
  staminaSpent:TRAIN_STAMINA,attributeScore:score,combatRank:rank,
  modifier,dc:15,roll:check.roll,
  check:structuredClone(check),rollEvent:event,rollHash:hash(event),
  success:check.success,
  formedMinute:check.success?minute+TRAIN_MINUTES:null,
  expiresAt:check.success?minute+TRAIN_MINUTES+FOCUS_DURATION:null,
  witness:w,witnessHash:h};
 const receipt={origin:SOURCE,source:a,seal:hash(a)},
  record=l||{origin:SOURCE,trials:[],strikes:[]};
 record.trials.push(receipt);
 s.table.specialistWeaponIntents=record;
 E.advance(s,TRAIN_MINUTES);W.finalizeTime(s,minute);U.sync(s,{source:'legacy'});
 if(!verify(s))throw Error('Original trained individual physical weapon source failed integrity');
 return {attempted:true,prepared:check.success,check,
  formId:d.formId,attackId:p.attackId,
  staminaSpent:TRAIN_STAMINA,minutes:TRAIN_MINUTES,
  expiresAt:a.expiresAt,noExtraWeaponDamage:true,noNewRank:true};
}
function preflight(s,formId,attackId){
 if(!id(formId)||!id(attackId)||!verify(s))
  throw Error('A genuinely earned active personal weapon-intent form is required');
 const l=ledger(s),used=new Set((l?.strikes||[]).map(x=>x.source.practiceSeal)),
  current=s.world.minutes;
 const row=(l?.trials||[]).find(x=>x.source.formId===formId);
 const a=row?.source;
 if(!a?.success||a.attackId!==attackId||used.has(row.seal)||
  a.formedMinute>current||a.expiresAt<=current)
  throw Error('This independently practised weapon form is unavailable, expired, mismatched or already used');
 Weapon.profile(s,attackId);
 if(!int(s.player.stamina,STRIKE_STAMINA,100000)||
  !int(s.table.combatants.player.stamina,STRIKE_STAMINA,100000))
  throw Error('An original living human must have real exertion capacity for the prepared strike');
 return {practiceSeal:row.seal,formId,attackId,weaponItem:a.weaponItem,
  bonus:FOCUS_MODIFIER,staminaSpent:STRIKE_STAMINA};
}
function spend(s,token,baseModifier,attackResult){
 if(!token||!int(baseModifier,-100,100)||
  token.bonus!==FOCUS_MODIFIER||!int(attackResult?.roll,1,20)||
  !verify(s))
  throw Error('A real originally rolled physical attack and earned weapon focus are required');
 const event=structuredClone(s.log.at(-1)),
  a={origin:SOURCE,kind:'spent-body-integrated-weapon-focus',
   practiceSeal:token.practiceSeal,formId:token.formId,
   attackId:token.attackId,weaponItem:token.weaponItem,
   minute:s.world.minutes,bonus:FOCUS_MODIFIER,
   originalBaseModifier:baseModifier,
   actualModifier:baseModifier+FOCUS_MODIFIER,
   staminaSpent:STRIKE_STAMINA,
   combatRoll:attackResult.roll,originalAttackEvent:event,
   originalAttackHash:hash(event)};
 s.player.stamina-=STRIKE_STAMINA;
 s.table.combatants.player.stamina=s.player.stamina;
 ledger(s).strikes.push({origin:SOURCE,source:a,seal:hash(a)});
 if(!verify(s))
  throw Error('One original actual equipped weapon attack cannot reuse an independently practised intent');
 return {formId:token.formId,attackId:token.attackId,
  singlePhysicalAttackBonus:FOCUS_MODIFIER,
  staminaSpent:STRIKE_STAMINA,noAdditionalDie:true,
  notAnotherTechnique:true};
}
module.exports={SOURCE,OBS,verify,status,practice,preflight,spend};
