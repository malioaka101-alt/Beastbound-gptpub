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
module.exports={plan,perform};
