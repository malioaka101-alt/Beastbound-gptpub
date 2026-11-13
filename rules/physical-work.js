'use strict';
// A common executor for *already sourced* physical work: field medicine,
// actual invention assembly and repair. This is not a public recipe engine.
// Ownership, environment, mechanism and output are established by the caller.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),H=require('./unified'),W=require('./world');
const proof=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const prepared=new WeakSet();
function plan(s,{inputs,minutes,stamina,minimumRemaining=1,modifier,dc,label,event}={}){
 if(!inputs||typeof inputs!=='object'||Array.isArray(inputs)||
   Object.keys(inputs).length===0||
   Object.keys(inputs).some(k=>!Number.isInteger(inputs[k])||
     inputs[k]<1||inputs[k]>100000))
  throw Error('Authentic physical work needs an actual nonempty set of finite ingredients');
 C.int(minutes,'established physical work minutes',1,480);
 C.int(stamina,'established physical work stamina',1,100);
 C.int(minimumRemaining,'minimum safe remaining Stamina',1,100);
 C.int(dc,'source-established Crafting difficulty',2,40);
 C.int(modifier,'actual earned Crafting modifier',-100,100);
 if(typeof label!=='string'||label.trim().length<8||label.length>200)
  throw Error('The established physical work check needs a meaningful task label');
 if(!event||typeof event!=='object'||Array.isArray(event)||
    !['world','research'].includes(event.type)||
    typeof event.text!=='string'||event.text.trim().length<18||
    !event.details||typeof event.details!=='object'||
    Array.isArray(event.details))
  throw Error('A genuinely source-described work scene is needed before spending materials');
 const current=C.int(s.player?.stamina,'actual physical work stamina',0,100000);
 if(current<stamina+minimumRemaining)
  throw Error('Insufficient actual Stamina for safe physical work');
 const items=H.planItems(s,Object.fromEntries(
  Object.entries(inputs).map(([k,amount])=>[k,-amount])));
 const selected=Object.freeze({items,minutes,stamina,modifier,dc,label,
  event:{type:event.type,text:event.text,details:structuredClone(event.details)},
  startedAtMinute:s.world.minutes,startedAtStamina:current,
  materials:Object.freeze({...inputs})});
 prepared.add(selected);
 return selected;
}
function perform(s,job){
 if(!job||!prepared.has(job))
  throw Error('Only a newly preflighted source-backed physical work plan may be performed');
 if(s.world.minutes!==job.startedAtMinute||
    s.player.stamina!==job.startedAtStamina)
  throw Error('The physical working conditions changed after their original verification');
 const before=s.world.minutes;
 // One real, prevalidated transfer for all ingredients, not one subtract per
 // type that can leave a half-consumed recipe on a failing later input.
 H.applyItems(s,job.items);
 prepared.delete(job);
 s.player.stamina-=job.stamina;
 C.event(s,job.event.type,job.event.text,job.event.details);
 const witnessIndex=s.log.length-1,
  originalWorkbench=structuredClone(s.log[witnessIndex]),
  witnessHash=proof(originalWorkbench);
 const check=C.check(s,{modifier:job.modifier,dc:job.dc,label:job.label});
 const rollIndex=s.log.length-1,
  originalRoll=structuredClone(s.log[rollIndex]),
  rollHash=proof(originalRoll);
 E.advance(s,job.minutes);
 W.finalizeTime(s,before);
 H.sync(s,{source:'legacy'});
 return {check,startedAtMinute:before,finishedAtMinute:s.world.minutes,
  materialsUsed:{...job.materials},elapsedMinutes:job.minutes,
  staminaSpent:job.stamina,
  witnessIndex,witnessHash,rollIndex,rollHash,
  originalWorkbench,originalRoll};
}
// A read-only verifier for the ORIGINAL completed physical-work witnesses.
// Shared by real medicine, built objects and repairs. It is not a new work
// executor, a roll oracle or a caller-supplied way to grant output.
function verifyReceipt({originalWorkbench:w,originalRoll:e,witnessHash,rollHash,
  inputs,inputKey,startedAtMinute,finishedAtMinute,minutes}={}){
 if(!w||!e||typeof w!=='object'||typeof e!=='object'||
    w.type!=='world'&&w.type!=='research'||e.type!=='roll'||
    !w.details||typeof w.details!=='object'||Array.isArray(w.details)||
    !e.details||typeof e.details!=='object'||Array.isArray(e.details)||
    typeof w.text!=='string'||w.text.trim().length<18||
    typeof e.text!=='string'||!e.text.trim()||
    w.day!==e.day||w.time!==e.time||
    !Number.isInteger(w.day)||w.day<0||
    proof(w)!==witnessHash||proof(e)!==rollHash)
  return false;
 if(!inputs||typeof inputs!=='object'||Array.isArray(inputs)||
    Object.keys(inputs).length===0||
    Object.keys(inputs).some(k=>!Number.isInteger(inputs[k])||inputs[k]<1)||
    !['inputs','input','replacement'].includes(inputKey)||
    JSON.stringify(w.details[inputKey])!==JSON.stringify(inputs))
  return false;
 if(!Number.isInteger(startedAtMinute)||startedAtMinute<0||
    !Number.isInteger(finishedAtMinute)||
    !Number.isInteger(minutes)||minutes<1||minutes>480||
    finishedAtMinute-startedAtMinute!==minutes)
  return false;
 // Event timestamps are original world-clock witnesses, not self-reported
 // metadata. Never accept a consistently rehashed roll attached to a
 // different historic minute or location in the character's timeline.
 const atStart={world:{minutes:startedAtMinute}};
 if(w.day!==E.day(atStart)||w.time!==E.clock(atStart))return false;
 const c=e.details;
 if(!Array.isArray(c.dice)||c.dice.length!==1||
    !Number.isInteger(c.roll)||c.roll<1||c.roll>20||
    c.dice[0]!==c.roll||
    !Number.isInteger(c.modifier)||c.modifier< -100||c.modifier>100||
    !Number.isInteger(c.dc)||c.dc<2||c.dc>40)
  return false;
 const naturalBonus=C.naturalAdjustment(c.roll),
  total=c.roll+c.modifier+naturalBonus,
  margin=total-c.dc,degree=C.degree(margin);
 return c.naturalBonus===naturalBonus&&c.total===total&&
  c.margin===margin&&c.degree===degree&&
  c.success===(margin>=0)&&c.progress===C.progress(degree);
}
module.exports={plan,perform,verifyReceipt};
