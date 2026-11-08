'use strict';
// Original Master Prompt §30 — the first ACTIVE personal aspect is a
// real, reversible human physiological expression of already refined
// organs, not borrowed beast anatomy or a generic "ultimate" rank.
// Players describe their own appearance and intent naturally; this rule
// uses the same earned creation dossier and the existing wound combat.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),W=require('./world'),
 Health=require('./unified'),Combat=require('./combat');
const ORIGIN='earned-character-body-organ-aspect-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const COOLDOWN_MINUTES=8,ACTIVATION_STAMINA=2,UPKEEP_PER_EXCHANGE=1;
function template(s,id){
 const e=require('./creation-design').earnedPersonal(s,id);
 if(e.usableAdapter!=='body-organ-personal-aspect'||
    e.system!=='body'||e.medium!=='aspect-form'||
    !['fortitude','balance'].includes(e.aspectMode))
  throw Error('Only an individually developed, source-proven Organ Cycle aspect-form may physically manifest');
 const record=s.table?.creationDesigns?.records?.[id];
 if(!record?.personalDevelopment?.completed)
  throw Error('The proposed aspect-form is not personally developed');
 return {e,proofHash:hash(record.personalDevelopment)};
}
function validRecord(s,a){
 if(!a||a.origin!==ORIGIN||
    !Number.isInteger(a.beganMinute)||a.beganMinute<0||
    !Number.isInteger(a.endsMinute)||a.endsMinute<=a.beganMinute||
    a.endsMinute-a.beganMinute>3||
    !Number.isInteger(a.cooldownUntil)||a.cooldownUntil<a.endsMinute||
    a.cooldownUntil-a.endsMinute<COOLDOWN_MINUTES||
    !['fortitude','balance'].includes(a.mode)||
    !Number.isInteger(a.activationStamina)||a.activationStamina!==ACTIVATION_STAMINA||
    !Number.isInteger(a.activationRoll)||a.activationRoll<1||a.activationRoll>20||
    !Number.isInteger(a.upkeepSpent)||a.upkeepSpent<0||
    (a.revertedMinute!==undefined&&
      (!Number.isInteger(a.revertedMinute)||
       a.revertedMinute<a.beganMinute||
       a.revertedMinute>=a.endsMinute))||
    typeof a.proofHash!=='string'||!/^[a-f0-9]{64}$/.test(a.proofHash))
   return null;
 try{
  const {e,proofHash}=template(s,a.designId);
  if(proofHash!==a.proofHash||e.aspectMode!==a.mode||
     e.characterBasis.sourceHash!==a.sourceHash||
     e.name!==a.name)
    return null;
  return {e,proofHash};
 }catch{return null;}
}
function present(s){
 const a=s.table?.personalAspect;
 if(!a||a.success!==true)return null;
 const proof=validRecord(s,a);
 if(!proof)return null;
 const current=s.world?.minutes;
 if(!Number.isInteger(current)||current<a.beganMinute||
    current>=a.endsMinute||
    a.revertedMinute!==undefined&&current>=a.revertedMinute)return null;
 if(s.table?.combatants?.player?.status&&s.table.combatants.player.status!=='ok')
  return null;
 return {a,...proof};
}
function status(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
    Object.keys(params).length)
  throw Error('Aspect status is a read-only view, not a selected stat profile, source or duration');
 const a=s.table?.personalAspect,here=present(s);
 const verified=a?validRecord(s,a):null,now=s.world?.minutes||0;
 if(a&&!verified)return {active:false,usable:false,reason:'saved form evidence is not genuine'};
 if(!a)return {active:false,usable:false,reason:'no personally developed form activated'};
 return {
  active:!!here,usable:!!verified,
  name:verified.e.name,designId:a.designId,
  character:verified.e.characterBasis.character,
  provenance:verified.e.characterBasis.milestone,
  styleBasis:verified.e.characterBasis.strongestFacets,
  mode:a.mode,
  effect:a.mode==='fortitude'?
   'one point of original physical wound Toughness while active':
   'one point of original defensive positioning while active',
  minutesRemaining:here?Math.max(0,a.endsMinute-now):0,
  cooldownRemaining:Math.max(0,a.cooldownUntil-now),
  reversibility:'voluntary or automatic on duration or collapse',
  mentalEffects:'None: identity and personal agency are unchanged',
  noNewBeastTraits:true,noExtraTurn:true,noFreeHealing:true,
  source:'the player-authored form, earned actual Organ Cycle and individual creation history'
 };
}
function preflight(s,id,{combat=false}={}){
 if(combat!==!!s.battle)
  throw Error('During combat, releasing an aspect takes a full original exchange subject to the independent opponent');
 if(!combat&&s.encounter)
  throw Error('Resolve an immediate creature encounter before uninterrupted physiological change');
 if(!E.LOCATIONS[s.world?.location])throw Error('The current physical scene must exist');
 const {e,proofHash}=template(s,id),old=s.table?.personalAspect;
 if(old&&!validRecord(s,old))
  throw Error('Unverified earlier active form state must be reconciled');
 if(old&&present(s))throw Error('A living aspect cannot be stacked or extended');
 if(old&&s.world.minutes<old.cooldownUntil)
  throw Error('Real bodily recovery is required before another release');
 const here=s.table?.combatants?.player;
 if(here&&here.status!=='ok')throw Error('An incapacitated practitioner cannot release a form');
 if(!Number.isInteger(s.player.stamina)||s.player.stamina<ACTIVATION_STAMINA||
    here&&here.stamina<ACTIVATION_STAMINA)
  throw Error('The release requires two actual remaining Stamina');
 const duration=({round:1,'1min':1,'10min':3})[
  s.table.creationDesigns.records[id].proposal.duration];
 if(!duration)throw Error('The original aspect proposal needs a genuinely supported duration');
 return {e,proofHash,duration,now:s.world.minutes};
}
function activate(s,id,{combat=false}={}){
 const {e,proofHash,duration,now}=preflight(s,id,{combat});
 const p=s.player,con=C.int(p.attributes?.con,'actually earned Constitution',1,30),
  rank=C.int(p.skills?.survival?.rank,'actually trained Survival',0,5);
 const check=C.check(s,{modifier:Math.floor((con-10)/2)+2*rank,
  dc:16,label:'Personally developed Organ Aspect activation'});
 p.stamina-=ACTIVATION_STAMINA;
 if(here)here.stamina=p.stamina;
 let backlash=null;
 if(check.degree==='severe failure'){
  backlash='organ-pressure and circulatory strain';
  Health.ensurePlayer(s);
  Combat.harm(s,Combat.get(s,'player'),1);
  Health.sync(s,{source:'wounds'});
 }
 // A failed actual activation cannot create an active form. Nevertheless
 // it records a cooldown; a narration-only retry does not reroll freely.
 const begins=now+(combat?0:1);
 const state={
  origin:ORIGIN,designId:id,name:e.name,mode:e.aspectMode,
  proofHash,sourceHash:e.characterBasis.sourceHash,
  beganMinute:begins,endsMinute:begins+(check.success?duration:1),
  cooldownUntil:begins+(check.success?duration:1)+COOLDOWN_MINUTES,
  activationStamina:ACTIVATION_STAMINA,activationRoll:check.roll,
  activationDegree:check.degree,success:check.success,
  upkeepSpent:0,backlash
 };
 s.table||={};s.table.personalAspect=state;
 if(!combat){
  const before=s.world.minutes;
  E.advance(s,1);W.finalizeTime(s,before);
  Health.sync(s,{source:'legacy'});
 }
 C.event(s,'progress',check.success?
  'The practitioner releases their own hard-earned organ pattern into a temporary, reversible aspect. Their actual breathing, bearing and response are shaped by their individual design.':
  'The attempted physiological release fails to stabilise; the organs need genuine recovery.',{
  origin:ORIGIN,designId:id,mode:e.aspectMode,
  durationMinutes:check.success?duration:0,
  originalCheck:check,staminaSpent:ACTIVATION_STAMINA,
  backlash,mentalEffects:'identity intact',noNewOrgans:true,
  noAutomaticEvolution:true,noBeastEssence:true
 });
 return {id,name:e.name,activated:check.success,check,
  aspectMode:check.success?e.aspectMode:null,
  durationMinutes:check.success?duration:0,
  cooldownUntil:state.cooldownUntil,staminaSpent:ACTIVATION_STAMINA,
  injury:backlash,noBeastTransformation:true,
  noAutomaticEvolution:true,voluntaryReversal:true,
  note:'The outward manifestation follows the player-authored design and lived physique; no unearned animal organs or powers'};
}
function revert(s,{combat=false}={}){
 if(combat!==!!s.battle)
  throw Error('During combat, releasing an active aspect costs a real full exchange');
 const here=present(s);
 if(!here)throw Error('There is no active personally earned aspect to release');
 const now=s.world.minutes;
 const a=here.a;
 a.revertedMinute=now;
 // The old original maximum stays on the receipt, preventing a rushed
 // rollback from pretending to recover the organs faster than normal.
 a.cooldownUntil=Math.max(a.cooldownUntil,now+COOLDOWN_MINUTES);
 if(!combat){
  const before=s.world.minutes;E.advance(s,1);
  W.finalizeTime(s,before);Health.sync(s,{source:'legacy'});
 }
 C.event(s,'progress','The personally developed physique returns to its unaltered resting circulation; its source anatomy and injuries remain.',{
   origin:ORIGIN,designId:a.designId,reversible:true,
   cooldownUntil:a.cooldownUntil,noHealing:true});
 return {reverted:true,id:a.designId,minutes:1,
  cooldownUntil:a.cooldownUntil,injuriesHealed:false};
}
function spendCombatUpkeep(s){
 const here=present(s);
 if(!here)return {spent:0,active:false};
 const p=s.player,c=s.table?.combatants?.player;
 if(!Number.isInteger(p.stamina)||p.stamina<UPKEEP_PER_EXCHANGE||
    c&&c.stamina<UPKEEP_PER_EXCHANGE){
  here.a.endsMinute=s.world.minutes;
  here.a.cooldownUntil=s.world.minutes+COOLDOWN_MINUTES;
  C.event(s,'progress','The earned aspect subsides under real fatigue; insufficient physical stamina cannot sustain it.',{
   origin:ORIGIN,designId:here.a.designId,noExtraFreeEnergy:true});
  return {spent:0,active:false,collapsed:true};
 }
 p.stamina-=UPKEEP_PER_EXCHANGE;
 if(c)c.stamina=p.stamina;
 here.a.upkeepSpent+=UPKEEP_PER_EXCHANGE;
 return {spent:UPKEEP_PER_EXCHANGE,active:true};
}
// Called from original Combat.attack, read-only, no user-selected defense.
// A formed, original state must still be active at this exact world minute.
function defensiveEffect(s,targetId){
 if(targetId!=='player')return {defense:0,toughness:0};
 const here=present(s);
 if(!here)return {defense:0,toughness:0};
 return here.a.mode==='balance'?
  {defense:1,toughness:0}:{defense:0,toughness:1};
}
module.exports={ORIGIN,status,preflight,activate,revert,present,
 spendCombatUpkeep,defensiveEffect};
