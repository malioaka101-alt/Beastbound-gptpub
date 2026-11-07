'use strict';
// Private Project evolution is an independently accepted biological change.
// The pure event resolver is not an API for the caller to create assent, venue,
// catalysts or ritual bonuses by passing booleans and prose.
const C=require('./core'),P=require('./progress'),BD=require('./bonds'),Agency=require('./beast-agency');
const E=require('../engine.js'),W=require('./world');
const MAX_AGE=6*1440;
function event(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>k!=='key')||typeof p.key!=='string')
  throw Error('Evolution Event takes only an existing branch key; consent, Vigor, venue and catalysts are not caller-selectable');
 const r=P.get(s,p.key),b=s.beasts?.[r.beastId];
 if(!b||!r.originAssessment||r.evolved||r.blocked||
    r.originAssessment.species!==b.species||r.originAssessment.evolutionStage!==b.evolutionStage)
  throw Error('Evolution Event requires an active, authenticated current-form branch');
 if(s.battle)throw Error('Evolution transformation cannot be attempted during combat');
 if(!s.player.partnerIds?.includes(b.id)&&s.encounter?.beastId!==b.id||
    b.away===true||(b.location&&b.location!==s.world.location))
  throw Error('The evolving beast must actually be present and voluntarily participating');
 if(!Number.isInteger(b.sapience)||b.sapience<0||b.sapience>5)
  throw Error('The evolving beast has no established sapience for independent consent');
 const proof=b.evolutionConsentEvidence?.[r.branchId],target=r.formProfile;
 if(!proof||proof.used||!target||proof.beastId!==b.id||proof.branchId!==r.branchId||
    proof.species!==b.species||proof.evolutionStage!==b.evolutionStage||
    proof.targetSpecies!==target.species||proof.targetForm!==target.formName||
    proof.sapience!==b.sapience||proof.location!==s.world.location||
    !Number.isInteger(proof.worldMinute)||proof.worldMinute<0||
    proof.worldMinute>s.world.minutes||s.world.minutes-proof.worldMinute>MAX_AGE||
    typeof proof.source!=='string'||proof.source.trim().length<18||
    typeof proof.riteSource!=='string'||proof.riteSource.trim().length<18||
    proof.beastWilling!==true||typeof proof.guardianConsent!=='boolean'||
    typeof proof.informedConsent!=='boolean'||!Array.isArray(proof.catalysts)||
    proof.catalysts.length>3||proof.catalysts.some(k=>typeof k!=='string'||!/^[a-z_]{3,40}$/.test(k))||
    !Number.isInteger(proof.facility)||proof.facility<0||proof.facility>2)
  throw Error('A recent, source-recorded voluntary agreement to this exact evolution form and rite is required');
 if(proof.facility>0&&(typeof proof.facilitySource!=='string'||proof.facilitySource.length<12))
  throw Error('An actual verified evolution facility is required for a facility bonus');
 if(b.sapience===2&&(!proof.guardianConsent||
     typeof proof.guardianSource!=='string'||proof.guardianSource.trim().length<18))
  throw Error('Protected S2 evolution requires independent, named guardian consent');
 if(b.sapience>=3&&(!proof.informedConsent||
     typeof proof.informedDialogue!=='string'||proof.informedDialogue.trim().length<18))
  throw Error('Sapient S3+ evolution requires separately witnessed, informed voluntary agreement');
 const agreed={beastWilling:proof.beastWilling,guardianConsent:proof.guardianConsent,
  informedConsent:proof.informedConsent};
 if(!BD.consentGuard(b,agreed).eligible||b.consent!==true)
  throw Error('Evolution assent is no longer voluntarily established');
 if(!Number.isFinite(b.condition)||b.condition<60||!b.needs||
    !Number.isFinite(b.needs.hunger)||!Number.isFinite(b.needs.fatigue)||
    b.needs.hunger>=70||b.needs.fatigue>=70||
    (Array.isArray(b.injuries)&&b.injuries.length)||
    (Array.isArray(b.conditions)&&b.conditions.length))
  throw Error('The evolving beast requires medical or welfare care before an irreversible rite');
 if(b.sapience<=1){
  const relationship=BD.fromSave(s,b.id);
  if(!Agency.evaluate(s,b,relationship,'evolution_rite').possible)
   throw Error('The beast independently refuses or is not comfortable with this evolution rite');
 }
 // No modifiers, GM-picked roll, new consent flags, location, facility or
 // medical rank can be injected by the request.
 const rank=Math.min(4,Math.max(C.int(s.player.skills?.beastmedicine?.rank??0,'Beast Medicine skill',0,5),
  C.int(s.player.skills?.medicine?.rank??0,'Medicine skill',0,5)));
 const care={handlerRank:rank,facility:proof.facility,
  facilitySource:proof.facilitySource||'',catalysts:[...proof.catalysts]};
 // This resolver still independently enforces all real conditions, wounds,
 // potential, payment of actual items, consent and the preauthored anatomy.
 const outcome=P.evolutionEvent(s,r,{source:proof.riteSource,...agreed,care});
 if(Array.isArray(outcome.rolls)&&outcome.rolls.length){
  if(b.sapience<=1)Agency.remember(s,b);
  proof.used=true;
  proof.attemptedAtMinute=s.world.minutes;
  proof.lastOutcome=outcome.outcome;
  const old=s.world.minutes;
  E.advance(s,180);
  W.finalizeTime(s,old);
 }
 return {...outcome,ritualMinutes:Array.isArray(outcome.rolls)&&outcome.rolls.length?180:0,
  consentSource:'precommitted witnessed branch-specific agreement'};
}
module.exports={event};
