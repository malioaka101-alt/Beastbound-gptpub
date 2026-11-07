'use strict';
// Reuse ONE source-verified material-gathering procedure for separate natural
// habitats. The legacy marsh-reed operation and first-of-day receipts remain
// compatible. Species and geographical evidence come from the original
// setting, not from arbitrary player-selected resource or quantity values.
const E=require('../engine.js'),C=require('./core'),W=require('./world'),
 Health=require('./unified'),Habitat=require('./habitat-survey'),
 Realm=require('../world/simulation');
const DAY=1440;
function harvest(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).length!==1||typeof p.checkId!=='string')
  throw Error('Sustainable common reed harvest accepts only a previously successful witnessed checkId');
 return gather(s,{item:'marsh_reed',checkId:p.checkId});
}
function gather(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).length!==2||typeof p.checkId!=='string'||
    typeof p.item!=='string')
  throw Error('Field gathering requires one real material item and a previously successful witnessed checkId; quantity, rarity and outcome are not selectable');
 if(s.battle||s.encounter)
  throw Error('Resolve the active encounter before gathering any habitat resource');
 const item=p.item,location=s.world.location,loc=E.LOCATIONS[location];
 if(item==='marsh_reed'&&location!=='fen')
  throw Error('Common marsh reeds may only be harvested in their established wetland habitat');
 if(item==='ironbloom'&&location!=='hills')
  throw Error('Ironbloom must be gathered at its established Ashwind Foothills source');
 // Unsupported named goods are not automatically collectable because a
 // creature, vendor, item list or continent exists somewhere in the atlas.
 if(!loc||!['fen','hills'].includes(location)||
    !['marsh_reed','ironbloom'].includes(item))
  throw Error('This named resource has no actually established harvestable local source');
 const id=p.checkId,check=s.table?.sceneChecks?.[id],
  finding=s.table?.habitatSurveyFindings?.[id],
  survey=Habitat.SURVEYS[loc.biome];
 if(!check||!check.used||check.origin!=='engine-habitat-survey'||
    check.location!==location||check.biome!==loc.biome||
    check.skill!=='survival'||check.dc!==survey?.dc||check.extra!==0||
    !Number.isInteger(check.checkedAtMinute)||
    check.checkedAtMinute>s.world.minutes||
    s.world.minutes-check.checkedAtMinute>DAY||
    !finding||finding.checkId!==id||finding.success!==true||
    finding.location!==location||finding.biome!==loc.biome||
    finding.observedSceneHash!==check.eventHash||
    !Number.isInteger(finding.interpretedAtMinute)||
    finding.interpretedAtMinute!==check.checkedAtMinute)
  throw Error(item==='marsh_reed'?
   'Harvest requires a recent successful authentic fen survey':
   'Gathering requires a recent successful authentic local habitat survey');
 const completedDay=Math.floor(s.world.minutes/DAY);
 const records=s.table?.fenReedHarvestAttempts;
 if(records!==undefined&&!Array.isArray(records))
  throw Error('Previously recorded reed gathering attempts need reconciliation');
 const allRecords=s.table?.materialGatherAttempts;
 if(allRecords!==undefined&&!Array.isArray(allRecords))
  throw Error('Recorded physical gathering attempts need reconciliation');
 const oldDaily=s.table?.fenReedHarvests;
 if(oldDaily!==undefined&&(!oldDaily||typeof oldDaily!=='object'||Array.isArray(oldDaily)))
  throw Error('Previously recorded first daily reed harvests need reconciliation');
 if(finding.harvested!==undefined&&typeof finding.harvested!=='boolean')
  throw Error('Unrecognised previous harvest indicator');
 // Before the generalized ledger, reeds had an independent per-day first
 // receipt and a full older attempt list. Preserve both as witnessed history.
 const reed=item==='marsh_reed';
 const priorLegacy=reed?Object.values(oldDaily||{}).filter(x=>
  x?.checkId===id&&x.location==='fen'&&x.quantity===1&&
  Number.isInteger(x.worldMinute)&&x.worldMinute<=s.world.minutes):[];
 const priorModern=reed?(records||[]).filter(x=>
  x?.checkId===id&&x.location==='fen'&&x.quantity===1&&
  Number.isInteger(x.worldMinute)&&x.worldMinute<=s.world.minutes&&
  x.sourceEventHash===check.eventHash&&
  x.sourceRollHash===finding.rollEventHash):[];
 const priorUnified=(allRecords||[]).filter(x=>
  x?.checkId===id&&x.item===item&&x.location===location&&
  x.origin==='source-authentic-local-gather-v1'&&x.quantity===1&&
  x.sourceEventHash===check.eventHash&&
  x.sourceRollHash===finding.rollEventHash&&
  Number.isInteger(x.worldMinute)&&x.worldMinute<=s.world.minutes);
 if(finding.harvested===true&&
    !priorLegacy.length&&!priorModern.length&&!priorUnified.length)
  throw Error('Original first reed harvest record is missing; reconcile the previous resource before continuing');
 if(reed&&oldDaily?.[completedDay]&&
    (oldDaily[completedDay].location!=='fen'||oldDaily[completedDay].quantity!==1))
  throw Error('Original daily reed harvest is inconsistent; preserve its historical receipt');
 const pool=C.int(s.player.stamina,'real field Stamina',0,100000),
  effort=reed?4:5,work=reed?45:60;
 if(pool<effort+2)
  throw Error('Insufficient Stamina for a careful, low-impact field harvest');
 const character=s.table?.combatants?.player;
 if(s.player.health!==s.player.maxHealth||
    (character&&(character.status!=='ok'||character.wounds?.some(w=>w>0))))
  throw Error('Injured gatherers need tailored medical safety and assistance');
 if(reed){
  C.int(s.world.fenPressure,'recorded fen habitat pressure',0,9);
  if(s.world.fenPressure>=7)
   throw Error('This wetland is too disturbed for further safe harvesting');
 }
 // Identical original Survival roll and terrain witness govern the
 // ecological interpretation for ALL physically recorded materials here.
 const proof=Habitat.interpreted(s,id,{habitat:location,
  mustSucceed:true,maxAgeMinutes:DAY});
 const physical=Realm.gatheringSource(s,location);
 if(physical.entry.item!==item)
  throw Error('The physically known local resource is not the requested item');
 const {entry,spec,eco}=physical;
 if(eco.quality<30||eco.forage<30||eco.pressure>=80)
  throw Error('This habitat cannot safely support collecting more of its actual local material');
 if(entry.stock<1)
  throw Error('The actual local material patch is exhausted; no new material is created on request');
 const materialPlan=Health.planItems(s,{[item]:1});
 const before=s.world.minutes,habitatPressureBefore=reed?s.world.fenPressure:eco.pressure;
 if(reed){
  s.table.fenReedHarvests||={};
  if(!s.table.fenReedHarvests[completedDay]){
   s.table.fenReedHarvests[completedDay]={
    checkId:id,location:'fen',quantity:1,worldMinute:before,
    sourceEventHash:proof.observationHash,sourceRollHash:proof.rollHash,
    originalSurvivalRoll:proof.originalRoll};
  }
 }
 const legacyAlreadyRecorded=priorLegacy.length&&
  !priorModern.some(a=>a.worldMinute===priorLegacy[0].worldMinute);
 const previousCount=reed?Math.max(priorUnified.length,
  priorModern.length+(legacyAlreadyRecorded?1:0)):priorUnified.length;
 const attemptNumber=previousCount+1;
 s.table.materialGatherAttempts||=[];
 const receipt={origin:'source-authentic-local-gather-v1',
  checkId:id,item,location,quantity:1,attemptNumber,
  worldMinute:before,sourceEventHash:proof.observationHash,
  sourceRollHash:proof.rollHash,originalSurvivalRoll:proof.originalRoll,
  habitatPressureBefore,workMinutes:work,staminaSpent:effort,
  originalStockBefore:entry.stock};
 s.table.materialGatherAttempts.push(receipt);
 if(reed){
  s.table.fenReedHarvestAttempts||=[];
  s.table.fenReedHarvestAttempts.push({
   checkId:id,location:'fen',quantity:1,worldMinute:before,attemptNumber,
   sourceEventHash:proof.observationHash,sourceRollHash:proof.rollHash,
   originalSurvivalRoll:proof.originalRoll,
   habitatPressureBefore:s.world.fenPressure,
   habitatPressureAfter:s.world.fenPressure+1,
   staminaSpent:effort,workMinutes:work});
 }
 finding.harvested=true;finding.harvestedAtMinute=before;
 finding.harvestCount=attemptNumber;
 Health.applyItems(s,materialPlan);
 s.player.stamina-=effort;
 entry.stock--;
 // Material extraction has one source-scoped physical effect on the actual
 // ecosystem. The original short fen-pressure scale remains save-compatible.
 eco.pressure=Math.min(100,eco.pressure+spec.impact);
 eco.forage=Math.max(0,eco.forage-1);
 if(reed)s.world.fenPressure++;
 receipt.habitatPressureAfter=reed?s.world.fenPressure:eco.pressure;
 entry.history.push({kind:'actual-local-harvest',checkId:id,
  item,worldMinute:before,sourceEventHash:proof.observationHash,
  sourceRollHash:proof.rollHash,remainingStock:entry.stock});
 if(entry.history.length>100)entry.history.shift();
 E.advance(s,work);
 W.finalizeTime(s,before);
 Health.sync(s,{source:'legacy'});
 C.event(s,'world',reed?
  'One common marsh reed is gathered from the witnessed wetland margin.':
  'One ironbloom plant is carefully collected from the source-known Ashwind ridge.',{
  origin:receipt.origin,item,quantity:1,checkId:id,attemptNumber,
  originalStockRemaining:entry.stock,
  habitatPressure:receipt.habitatPressureAfter,
  sourceRollHash:proof.rollHash});
 return {item,quantity:1,checkId:id,attemptNumber,
  elapsedMinutes:work,staminaSpent:effort,
  remainingLocalStock:entry.stock,
  habitatPressureAfter:receipt.habitatPressureAfter,
  harvestKind:reed?'witnessed-common-wetland-flora':
   'witnessed-source-known-ridge-flora',
  originalSurvivalRoll:proof.originalRoll,sourceRollHash:proof.rollHash,
  rareResourcesAwarded:0,
  note:'Further work depends on real stock, stamina, ecological conditions and current original field evidence; no extra dice or hidden rare loot'};
}

/**
 * Returning a native plant to an actual patch is the reverse use of the
 * EXISTING physical resource ledger, not a separate loot or skill ladder.
 * The player may try without a paid teacher or an already-passed survey.
 * A viable rooted cutting/propagule is an uncertain outcome of an honest
 * Survival check; even success only queues a potential later plant.
 */
function replant(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).length!==1||typeof p.item!=='string')
  throw Error('Native planting needs exactly one actually owned material name; no quantity, viability, roll or result may be chosen');
 if(s.battle||s.encounter)
  throw Error('An unresolved encounter or active battle prevents careful native planting');
 const item=p.item,location=s.world.location,loc=E.LOCATIONS[location];
 if(!loc||!['fen','hills'].includes(location)||
    !['marsh_reed','ironbloom'].includes(item))
  throw Error('Only an actual established native plant can be returned to this local habitat');
 if(Realm.sourceItemAt(location)!==item)
  throw Error('A gathered plant cannot be introduced into a different habitat without genuine compatibility evidence');
 const status=s.table?.combatants?.player;
 if((status&&status.status!=='ok')||s.player.health!==s.player.maxHealth)
  throw Error('A seriously injured or incapacitated planter needs individual medical and field safety assessment');
 const stamina=C.int(s.player.stamina,'real native planting Stamina',0,100000);
 if(stamina<5)throw Error('Insufficient Stamina to prepare and protect a native planting');
 const wis=C.int(s.player.attributes?.wis,'actual Survival Wisdom',1,30),
  rank=C.int(s.player.skills?.survival?.rank??0,'earned Survival rank',0,5);
 // The original item is consumed even if the cutting proves nonviable. The
 // world does not promise that a harvested flower contains viable seeds.
 const plan=Health.planItems(s,{[item]:-1});
 const {entry,spec,eco}=Realm.gatheringSource(s,location);
 const before=s.world.minutes,day=Math.floor(before/DAY),
  nextSixday=(Math.floor(day/6)+1)*6;
 const dc=(item==='marsh_reed'?12:14)+(eco.pressure>=70?2:0)+
  (eco.quality<35?2:0);
 Health.applyItems(s,plan);
 s.player.stamina-=3;
 const check=C.check(s,{modifier:Math.floor((wis-10)/2)+2*rank,
  dc,label:'Try to establish viable native '+E.RESOURCES[item].name+' in '+loc.name});
 const rollEvent=structuredClone(s.log.at(-1)),
  rollHash=Realm.plantingHash(rollEvent);
 const source={origin:Realm.PROPAGATION_ORIGIN,item,location,
  region:spec.region,plantedMinute:before,dueDay:nextSixday,
  nativeHabitatWitness:entry.origin,
  originalRoll:check.roll,rollHash,rollEvent,
  originalDc:dc,originalSkillRank:rank,ecologyBefore:{
   quality:eco.quality,forage:eco.forage,pressure:eco.pressure}};
 const sourceHash=Realm.plantingHash(source);
 if(check.success){
  entry.plantings||=[];
  entry.plantings.push({origin:Realm.PROPAGATION_ORIGIN,
   item,location,source,sourceHash,status:'pending'});
 }
 s.table||={};s.table.materialRestorationAttempts||=[];
 s.table.materialRestorationAttempts.push({
  item,location,sourceHash,source,viabilityVerified:check.success,
  recordedAtMinute:before,quantityUsed:1,
  noInstantHabitatBenefit:true,
  pendingEstablishment:check.success});
 C.event(s,'world',check.success?
  'One native planting is set into the local habitat; only later growth will prove whether it survives.':
  'The carried plant material is used in a careful propagation attempt, but no viable planting is established.',{
  origin:Realm.PROPAGATION_ORIGIN,item,location,
  sourceHash,rollHash,viabilityVerified:check.success,
  actualMaterialSpent:1,pendingEstablishment:check.success,
  noInstantResourceCreation:true});
 E.advance(s,40);W.finalizeTime(s,before);Health.sync(s,{source:'legacy'});
 return {attempted:true,item,quantityUsed:1,
  viabilityVerified:check.success,
  awaitingRealGrowth:check.success,
  nextPossibleAssessmentDay:nextSixday+1,
  localStockUnchanged:entry.stock,
  elapsedMinutes:40,staminaSpent:3,check,
  originalRollHash:rollHash,
  note:'One native material was actually consumed. A viable attempt may establish only on a later world tick if habitat conditions support it; no guaranteed regrowth or instant ecological cure'};
}
function plantingStatus(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Local planted-material inspection is read-only and cannot choose outcome or a remote site');
 const location=s.world.location,w=Realm.peek(s);
 const entry=w.gatheringSites?.[location];
 const records=s.table?.materialRestorationAttempts||[];
 if(!Array.isArray(records))
  throw Error('Original native planting records need reconciliation');
 const planted=entry?.plantings||[];
 if(!Array.isArray(planted))
  throw Error('Original local plant source records need reconciliation');
 return {location,observedPlantings:records.filter(r=>r?.location===location)
  .slice(-20).map(r=>{
   const original=r.viabilityVerified?
    planted.find(x=>x.sourceHash===r.sourceHash):null;
   return {item:r.item,plantedAtMinute:r.recordedAtMinute,
    originalViability:r.viabilityVerified,
    presentState:original?.status||(r.viabilityVerified?
     'not-yet-confirmed':'no viable planting'),
    nextPossibleAssessmentDay:r.viabilityVerified?
     r.source.dueDay+1:null};
  }),note:'Only native work personally attempted here and its locally inspectable condition are shown. No remote hidden flora status, free harvested plant, future success guarantee or outside-world knowledge'};
}

module.exports={harvest,gather,replant,plantingStatus};
