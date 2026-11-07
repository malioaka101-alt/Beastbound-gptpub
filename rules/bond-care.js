'use strict';
// Auditable sixday provisioning for the one currently supported dietary profile:
// an accompanying, healthy fox-line omnivore sheltered in a known settlement.
// This is intentionally not a generic magic "care met" button for all beasts.
const E=require('../engine.js'),C=require('./core'),Bond=require('./bonds'),Agency=require('./beast-agency'),Items=require('./unified');
const DAY=1440,SUPPLY='clean_rations',MINUTES=30;
// Explicitly authorised feed categories. The missing veterinary/nutrition
// subsystem cannot imply that potions, metals or generic quest items are food.
const FEED_BY_DIET=Object.freeze({
 omnivore:Object.freeze(['clean_rations']),
 herbivore:Object.freeze(['marsh_reed'])
});
function feedingProfile(s,b){
 const species=E.SPECIES[b.species];
 if(!species)throw Error('Unrecognised beast species has no verified feeding model');
 const r=b.welfareCarePlan;
 // Preserve the one existing source-scoped prototype for ordinary fox-line
 // omnivores. Other species/forms need a documented individual feeding plan.
 if(!r){
  if(b.species==='fenfox'&&b.evolutionStage==='Base'&&species.diet==='omnivore')
   return {item:SUPPLY,quantity:1,locations:['crossing','academy'],
    source:'Existing provisional fox-line daily rations and shelter table ruling'};
  throw Error('An individual source-documented species-appropriate welfare feeding plan is required');
 }
 if(r.species!==b.species||r.evolutionStage!==b.evolutionStage||r.diet!==species.diet||
    typeof r.source!=='string'||r.source.trim().length<18||
    !Number.isInteger(r.worldMinute)||r.worldMinute<0||r.worldMinute>s.world.minutes||
    !Array.isArray(r.shelterLocations)||!r.shelterLocations.length||
    r.shelterLocations.some(x=>!['crossing','academy'].includes(x))||
    !Array.isArray(FEED_BY_DIET[species.diet])||
    !FEED_BY_DIET[species.diet].includes(r.foodItem)||
    !Object.hasOwn(E.RESOURCES,r.foodItem))
  throw Error('Recorded feeding plan is stale, unsupported or not source-verified for this species and form');
 C.int(r.quantity,'documented daily food quantity',1,10);
 return {item:r.foodItem,quantity:r.quantity,locations:r.shelterLocations,
  source:r.source.trim()};
}
function context(s,p){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>k!=='beastId'))
  throw Error('Care recording accepts only an existing beastId, never claimed results');
 const id=p.beastId,b=s.beasts?.[id];
 if(typeof id!=='string'||!b)throw Error('Unknown beast for daily care');
 Bond.fromSave(s,id);
 if(s.battle)throw Error('Daily care is not available during combat');
 if(!s.player.partnerIds?.includes(id)||b.away===true||
    (b.location&&b.location!==s.world.location))
  throw Error('The beast must be a present, accompanying partner for daily care');
 const feeding=feedingProfile(s,b);
 if(!feeding.locations.includes(s.world.location))
  throw Error('Shelter and clean-water care are not verified at this location');
 if(!b.needs||!Number.isFinite(b.needs.hunger)||!Number.isFinite(b.needs.fatigue)||
    b.needs.hunger<0||b.needs.fatigue>50||b.needs.hunger>50||
    (b.injuries||[]).length||(b.conditions||[]).length||(b.condition??100)<60)
  throw Error('Unmet illness, hunger, injury or fatigue requires tailored care before a healthy sixday certificate');
 if(!Agency.evaluate(s,b,Bond.fromSave(s,id),'daily_care').possible)
  throw Error('The beast does not willingly accept routine handling or care in its current condition');
 return {id,b,feeding};
}
function attend(s,p){
 // Inspect the existing ledger without creating one until the daily session
 // passes all eligibility, food and schedule checks.
 const {id,b,feeding}=context(s,p),plans=s.table?.bondCareAttendance||{};
 const day=Math.floor(s.world.minutes/DAY);
 let plan=plans[id];
 if(plan?.completed){
  if(day<plan.startDay+6)throw Error('This sixday care period is already complete');
  plan=null;
 }
 if(plan&&!plan.completed){
  if(plan.days.length===6)throw Error('Complete and review the existing sixday care before starting another');
  if(day<plan.startDay+plan.days.length)throw Error('Daily care has already been recorded for this beast today');
  if(day>plan.startDay+plan.days.length)plan=null; // a missed day breaks the streak
 }
 const prior=s.table?.bondCareEnd?.[id];
 if(!plan&&prior!==undefined&&day*DAY<prior)
  throw Error('Another counted care period overlaps these days');
 const qty=s.player.inventory?.[feeding.item];
 if(!Number.isInteger(qty)||qty<feeding.quantity)
  throw Error(feeding.item===SUPPLY&&feeding.quantity===1?
   'One clean ration is required for this daily fox care':
   'Insufficient documented '+feeding.item+' feed for this daily beast care');
 if(!plan){
  plan={startDay:day,days:[],species:b.species,evolutionStage:b.evolutionStage,
   location:s.world.location,foodItem:feeding.item,foodQuantity:feeding.quantity,
   carePlanSource:feeding.source,completed:false};
 }else if(plan.species!==b.species||plan.evolutionStage!==b.evolutionStage||
     plan.location!==s.world.location||plan.foodItem!==feeding.item||
     plan.foodQuantity!==feeding.quantity||plan.carePlanSource!==feeding.source){
  throw Error('Diet, form, food quantity and shelter must remain stable throughout this sixday period');
 }
 const foodPlan=Items.planItems(s,{[feeding.item]:-feeding.quantity});
 Agency.remember(s,b);
 s.table||={};s.table.bondCareAttendance||={};
 s.table.bondCareAttendance[id]=plan;
 Items.applyItems(s,foodPlan);
 b.needs.hunger=Math.max(0,b.needs.hunger-20);
 plan.days.push(day);
 E.advance(s,MINUTES);
 C.event(s,'beast',b.name+' received observed daily species-appropriate food, water and shelter care.',
  {beastId:id,day,foodItem:feeding.item,quantity:feeding.quantity,elapsedMinutes:MINUTES});
 return {attended:true,daysRecorded:plan.days.length,daysRequired:6,
   nextReviewMinute:(plan.startDay+6)*DAY,foodConsumed:{item:feeding.item,quantity:feeding.quantity},
   elapsedMinutes:MINUTES};
}
function review(s,p){
 const {id,b,feeding}=context(s,p),plan=s.table?.bondCareAttendance?.[id];
 if(!plan||plan.completed)throw Error('No unreviewed sixday care period');
 if(plan.species!==b.species||plan.evolutionStage!==b.evolutionStage||
    plan.location!==s.world.location||plan.foodItem!==feeding.item||
    plan.foodQuantity!==feeding.quantity||plan.carePlanSource!==feeding.source)
  throw Error('The beast, feeding plan, food amount or shelter changed since the care period began');
 const endMinute=(plan.startDay+6)*DAY,startMinute=plan.startDay*DAY;
 if(s.world.minutes<endMinute)throw Error('Six full in-world days have not passed since care began');
 if(plan.days.length!==6||plan.days.some((day,i)=>day!==plan.startDay+i))
  throw Error('Six consecutive days of verified care are required');
 const prior=s.table?.bondCareEnd?.[id];
 if(prior!==undefined&&startMinute<prior)throw Error('This care interval overlaps a counted period');
 s.table.bondEvidence||={};
 s.table.bondWitnessSerial=C.int(s.table.bondWitnessSerial??0,'bond evidence serial',0,1000000000);
 let evidenceId;
 do{
  s.table.bondWitnessSerial++;
  evidenceId='bond_witness_'+String(s.table.bondWitnessSerial).padStart(6,'0');
 }while(Object.hasOwn(s.table.bondEvidence,evidenceId));
 s.table.bondEvidence[evidenceId]={beastId:id,kind:'care',needs:'met',startMinute,
  endMinute,worldMinute:endMinute,origin:'completed-provisioning-ledger',
  source:'Six consecutive logged daily feedings for '+b.name+' with documented diet '+feeding.source+
   ', paid species-appropriate food, shelter and water.',
  attendanceDays:[...plan.days],foodItem:feeding.item,
  foodUnits:6*feeding.quantity,carePlanSource:feeding.source};
 plan.completed=true;
 plan.evidenceId=evidenceId;
 C.event(s,'beast','A sixday care record is ready for '+b.name+'; relationship change still requires the normal bond.care operation.',
  {beastId:id,evidenceId,startMinute,endMinute});
 return {recorded:true,evidenceId,needs:'met',startMinute,endMinute};
}
function status(s,p){
 if(!p||typeof p.beastId!=='string'||!s.beasts?.[p.beastId])throw Error('Unknown beast for care status');
 const plan=s.table?.bondCareAttendance?.[p.beastId];
 return {daysRecorded:plan?.days?.length||0,completed:!!plan?.completed,
  nextReviewMinute:plan?(plan.startDay+6)*DAY:null,evidenceId:plan?.evidenceId||null};
}
// Both partner care and voluntary wild food offers share one source-authorised
// diet mapping. This does not make a wild animal a bonded partner.
module.exports={attend,review,status,FEED_BY_DIET};
