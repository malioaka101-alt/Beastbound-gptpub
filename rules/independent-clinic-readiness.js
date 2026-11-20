'use strict';
// #177 — internal, read-only NPC entry gate to the EXISTING six-day clinic.
// A wounded, locally scheduled independent person does not yet have a paid
// appointment or a treatment. This reader cannot decide their consent, issue
// money, treat Serious/Critical wounds or spend a minute of world time.
const Engine=require('../engine.js'),
 Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),
 Mechanics=require('../world/person-mechanical-foundations'),
 Presence=require('../world/person-presence'),
 Health=require('./unified'),
 Original=require('./shared-original-clinic-recovery');
const CLINIC='academy',PHYSICIAN='vale',DAY=1440;
function inspect(s,actorId){
 if(typeof actorId!=='string'||!/^emergent:person_[0-9]+$/.test(actorId))
  throw Error('A real original source-linked independent human is required');
 const w=Realm.peek(s),
  p=w?.emergentPeople?.people?.[actorId.slice('emergent:'.length)];
 if(!w||s.table?.realm!==w||!p||p.actorId!==actorId||
  !People.verify(w,p)||!Mechanics.verify(w,p))
  throw Error('Independent clinic assessment refuses invented person, attributes or spendable cash');
 const condition=Health.currentNpcWoundCondition(s,actorId),
  body=condition&&s.table.combatants[condition.combatantId];
 if(!body)return {actorId,privateToGM:true,
  originalPhysicianOwner:'rules/clinic-care.js',
  physicallyAssessed:false,eligibleForOriginalClinic:false,
  fundedByVerifiedCash:false,actualAttendanceEstablished:false,
  noTreatmentOrConsent:true};
 let projection=null;
 try{projection=Original.project(body);}catch{}
 const minute=s.world?.minutes,day=Number.isInteger(minute)&&minute>=0?
  Math.floor(minute/DAY):null,clock=day===null?null:minute%DAY,
  doctor=Engine.NPCS[PHYSICIAN],site=Engine.LOCATIONS[CLINIC],
  physicianAvailable=doctor?.location===CLINIC&&
   doctor.profession==='Origin-pattern physician'&&
   site?.facilities?.includes('clinic')===true,
  local=day===null?null:Presence.resolve(w,actorId,CLINIC,day,clock),
  present=!!local?.presence&&local.presence.originHash===p.originHash&&
   local.presence.actorId===actorId&&
   local.presence.location===CLINIC&&p.regionId==='lumenfall'&&
   p.status==='active',
  daytime=clock!==null&&clock>=480&&clock+15<=1020,
  funds=p.cashScales,
  verifiedCash=Number.isSafeInteger(funds)&&funds>=Original.COST_SCALES;
 return {actorId,privateToGM:true,
  originalPhysicianOwner:'rules/clinic-care.js',
  originalCombatEntrySeal:condition.originalEntrySeal,
  originalPhysicalLaw:Original.ORIGINAL_OWNER,
  physicallyAssessed:true,
  eligibleForOriginalClinic:!!projection&&condition.originalConditionStatus==='ok',
  actualAttendanceEstablished:present&&daytime&&physicianAvailable,
  fundedByVerifiedCash:verifiedCash,
  sixdayFeeScales:Original.COST_SCALES,
  sixdayCourseDays:Original.DAYS,
  canOfferOnlyAfterIndependentConsentAndPaidIntake:
   !!projection&&present&&daytime&&physicianAvailable&&verifiedCash&&
   !s.battle&&!s.encounter,
  noTreatmentOrConsent:true,noTimeOrMoneyOrRollSpent:true,
  noUnprovenRankTechniqueOrCriticalHealing:true};
}
module.exports={inspect};
