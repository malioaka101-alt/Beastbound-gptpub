'use strict';
// Narrow external-actor rescue. A named existing physician can stabilise a
// genuinely incapacitated patient only where the patient and physician are
// actually present AND the independently acting threat has left.
// No user-supplied rescuer, relocation, rescue roll, Critical cure or revival.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),W=require('./world'),H=require('./unified');
const LOCATION='academy',DOCTOR='vale',ATTEND_MINUTES=30,OBSERVE_MINUTES=240;
const MAX_DELAY=60,OPEN=8*60,LAST_START=17*60,DAY=1440;
const digest=e=>Crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex');
function noClaims(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('External rescue is resolved by the established world; no selected rescuer, rescue time, location, charge or recovery outcome');
}
function eligibility(s){
 const n=E.NPCS[DOCTOR],loc=E.LOCATIONS[LOCATION],c=s.table?.combatants?.player;
 if(!n||n.location!==LOCATION||n.profession!=='Origin-pattern physician'||
    !loc?.facilities?.includes('clinic'))
  throw Error('No independently authored on-site clinical responder is established');
 if(s.world?.location!==LOCATION)
  throw Error('The actual physician is not at the site of this collapse: external transfer cannot be invented');
 const clock=s.world.minutes%DAY;
 if(clock<OPEN||clock+ATTEND_MINUTES>LAST_START)
  throw Error('The named physician is outside this local witnessed daytime response window');
 if(s.battle||s.encounter)
  throw Error('Emergency triage cannot begin during an unresolved present threat');
 if(s.table?.healthModel!=='wounds-v1'||!c||c.status!=='knocked_out')
  throw Error('This narrow external triage supports only an actually knocked-out wound-model patient');
 if(!Array.isArray(c.wounds)||c.wounds.length!==3||
    c.wounds.some(x=>!Number.isInteger(x)||x<0)||
    c.wounds[2]<1)
  throw Error('An honest critical wound record from actual nonlethal incapacity must be preserved');
 const incidents=s.table?.combatDefeats||[],d=incidents.at(-1);
 if(!d||d.status!=='knocked_out'||d.location!==LOCATION||
    d.dangerCleared!==true||
    d.opponentAftermath!=='departed after nonlethal incapacitation'||
    !['cautious','defensive'].includes(d.opponentStyle)||
    typeof d.beastId!=='string'||
    !Number.isInteger(d.worldMinute)||d.worldMinute<0||
    d.worldMinute>s.world.minutes||s.world.minutes-d.worldMinute>MAX_DELAY)
  throw Error('A fresh independently witnessed nonlethal collapse with a genuinely departed opponent is required');
 const assessment=s.beasts?.[d.beastId]?.combatAssessment?.behavior;
 if(!assessment||assessment.nonlethal!==true||assessment.style!==d.opponentStyle)
  throw Error('Recorded independent creature behaviour does not support a safe external response');
 const foe=s.table?.combatants?.['beast:'+d.beastId];
 if(!foe||foe.status!=='ok')
  throw Error('The originally assessed beast state has not been reconciled');
 if(!Number.isInteger(d.eventIndex)||d.eventIndex<0||d.eventIndex>=s.log.length||
    typeof d.eventHash!=='string')
  throw Error('The original witnessed defeat is missing its immutable scene reference');
 const ev=s.log[d.eventIndex],detail=ev?.details;
 if(ev?.type!=='injury'||detail?.origin!=='engine-wound-defeat'||
    detail.beastId!==d.beastId||detail.location!==LOCATION||
    detail.worldMinute!==d.worldMinute||detail.status!=='knocked_out'||
    detail.dangerCleared!==true||detail.opponentStyle!==d.opponentStyle||
    digest(ev)!==d.eventHash)
  throw Error('The original incapacitation, witnessed danger clearance and event hash must agree');
 const existing=s.table?.physicianRescue?.receipts||[];
 if(d.rescued===true||existing.some(r=>r.eventHash===d.eventHash))
  throw Error('This defeat already received its recorded one-time clinical intervention');
 return {c,doctor:n,incident:d};
}
function status(s,p={}){
 noClaims(p);
 const c=s.table?.combatants?.player;
 let possible=false,explanation='No witnessed safe local rescue opportunity';
 try{eligibility(s);possible=true;explanation='The existing Lumenfall physician can independently respond to the witnessed nonlethal collapse';}
 catch(e){if(c?.status==='knocked_out')explanation=e.message;}
 return {consciousness:c?.status||'unknown',eligible:possible,
  localPhysician:s.world?.location===LOCATION?E.NPCS[DOCTOR]?.name:null,
  reason:explanation,
  actualRescues:(s.table?.physicianRescue?.receipts||[]).slice(-5).map(r=>({
   sourceDefeatHash:r.eventHash,doctor:r.doctor,minutes:r.minutes,
   finalStatus:r.finalStatus,woundsHealed:r.woundsHealed
  }))};
}
function attend(s,p={}){
 noClaims(p);
 const {c,doctor,incident:d}=eligibility(s);
 const old=s.world.minutes,priorWounds=[...c.wounds],oldRng=s.rngState;
 // This intervention is an EXTERNAL professional action, NOT player movement
 // or a request to self-heal while unconscious. Source is an authored real
 // physician, on-site at the established clinic, with danger already cleared.
 d.rescued=true;
 const care=(s.table.physicianRescue||={receipts:[]});
 care.receipts||=[];
 care.receipts.push({eventHash:d.eventHash,doctor:doctor.name,
  location:LOCATION,startMinute:old,minutes:ATTEND_MINUTES+OBSERVE_MINUTES,
  finalStatus:'incapacitated',woundsHealed:0,
  source:'Named local physician personally responds to independently witnessed safe post-combat incapacity'});
 C.event(s,'injury',doctor.name+' attends the witnessed collapse after the independently nonlethal animal has left.',{
  origin:'independent-physician-rescue',defeatEventHash:d.eventHash,
  doctor:doctor.name,location:LOCATION,minutes:ATTEND_MINUTES
 });
 E.advance(s,ATTEND_MINUTES+OBSERVE_MINUTES);
 W.finalizeTime(s,old);
 // An unconscious Critical-wound patient is now being monitored and
 // stabilised, but has NOT recovered the ability to act or moved magically.
 c.status='incapacitated';
 c.firstAided=true;
 c.conditions||=[];
 if(!c.conditions.includes('under_clinical_observation'))
  c.conditions.push('under_clinical_observation');
 H.sync(s,{source:'wounds'});
 C.event(s,'injury',doctor.name+' completes supervised emergency observation; the patient remains incapacitated with Critical wounds requiring separate specialist care.',{
  origin:'verified-clinic-rescue-followup',doctor:doctor.name,
  defeatEventHash:d.eventHash,remainingWounds:[...c.wounds]
 });
 if(digest(priorWounds)!==digest(c.wounds)||s.rngState!==oldRng)
  throw Error('Clinical observation cannot roll a new die or erase existing injury');
 return {stabilized:true,externalRescuer:doctor.name,location:LOCATION,
  elapsedMinutes:ATTEND_MINUTES+OBSERVE_MINUTES,finalStatus:c.status,
  wounds:[...c.wounds],woundsHealed:0,criticalCareStillRequired:true,
  noSelfRescue:true,noNewDie:true,transported:false,
  note:'This only establishes witnessed medical supervision, not recovery of consciousness or Critical-wound healing'};
}
module.exports={status,attend};
