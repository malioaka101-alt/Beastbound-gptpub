'use strict';
// First persistent *individual* wild-beast ecology. A genuine encounter can
// be watched without forcing approach or consent; witnessed animals then lead
// independent, bounded lives during actual sixday world ticks.
// Master Prompt §§5,7,11,13–16,43. Not a universal full fauna census.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 Atlas=require('./atlas'),C=require('../rules/core'),
 Agency=require('../rules/beast-agency'),
 Learning=require('./beast-ecological-learning'),
 Individuality=require('./beast-individuality');
const SOURCE='engine-local-wildlife-encounter';
const clamp=(x,lo=0,hi=100)=>Math.max(lo,Math.min(hi,x));
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const DAY=1440,WATCH_MINUTES=12,SIGNAL_MINUTES=2,INTERVAL=60;
function noParams(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Wild-beast behaviour is independently determined; no caller-selected creature, mood, chance, movement, reward or event is accepted');
}
function originalEncounter(s,{safetyAction=false}={}){
 const encounter=s.encounter,b=s.beasts?.[encounter?.beastId],
  loc=E.LOCATIONS[s.world?.location];
 if(!encounter||!b||!loc||s.battle||
  !E.SPECIES[b.species]||!loc.spawns?.includes(b.species)||
  b.habitatExposure?.[s.world.location]!==1||
  b.away===true||(b.location&&b.location!==s.world.location)||
  b.owner||s.player.partnerIds?.includes(b.id)||
  !['wild',undefined].includes(b.relationship))
  throw Error('Watching a wild individual requires a truly witnessed, present, unowned local animal');
 if((Number.isInteger(b.sapience)&&b.sapience>=3)||
  E.SPECIES[b.species].intelligence==='sapient')
  throw Error('Sapient beast persons require independent dialogue, not an animal-routine procedure');
 if(!safetyAction&&(encounter.threat===true||/hostile|terrified|panicked|fleeing/i.test(String(b.mood||''))))
  throw Error('A dangerous or fleeing animal requires a safety decision, not an uninterrupted noninvasive watch');
 if(s.table?.combatants?.player?.status&&s.table.combatants.player.status!=='ok')
  throw Error('An incapacitated observer cannot complete a careful wildlife watch');
 const matches=(s.log||[]).filter(x=>
  x.type==='encounter'&&x.details?.origin===SOURCE&&
  x.details.beastId===b.id&&x.details.species===b.species&&
  x.details.location===s.world.location&&
  x.text==='You find a wild '+E.SPECIES[b.species].name+
   ' near '+loc.name+'. It appears '+x.details.mood+
   '. It has not agreed to approach or partner with you.');
 const ev=matches.at(-1);
 if(!ev)throw Error('Only an original engine-witnessed wildlife meeting can establish this individual');
 const distance=ev.details.distanceMetres;
 if(distance!==undefined&&(!Number.isInteger(distance)||distance<2||distance>17||
   encounter.distanceMetres!==distance))
  throw Error('An actual independently generated distance must match the original encounter');
 if(ev.details.distanceMetres===undefined&&encounter.distanceMetres!==undefined)
  throw Error('The animal has no verified original distance measurement');
 if(!b.needs||!Number.isFinite(b.needs.hunger)||
  !Number.isFinite(b.needs.fatigue)||
  b.needs.hunger<0||b.needs.hunger>100||
  b.needs.fatigue<0||b.needs.fatigue>100||
  !Number.isFinite(b.condition)||b.condition<0||b.condition>100)
  throw Error('Wild-beast care and condition must be established before individual behaviour is simulated');
 return {b,ev,encounter};
}
function ensure(s,b,ev){
 if(b.individualLife!==undefined){
  const life=b.individualLife,src=life?.source;
  if(life?.version!==1||life.beastId!==b.id||
   life.species!==b.species||!src||
   ![SOURCE,'independent-mammal-birth-v1'].includes(src.origin)||
   src.beastId!==b.id||src.species!==b.species||
   (src.origin==='independent-mammal-birth-v1'&&
    (!b.wildBirth||b.wildBirth.origin!==src.origin||
     b.wildBirth.birthHash!==src.birthHash||
     b.wildBirth.birthHash!==hash(b.wildBirth.source)||
     b.wildBirth.source.beastId!==b.id||
     b.wildBirth.source.species!==b.species||
     src.initialDay!==b.wildBirth.source.bornDay))||
   life.sourceHash!==hash(src)||
   !Number.isInteger(life.rngState)||life.rngState<1||
   !Number.isInteger(life.lastTickDay)||
   !Array.isArray(life.history)||!Array.isArray(life.witnessed)||
   !Number.isInteger(life.lastWatchMinute))
   throw Error('Unverified individual animal life ledger');
  return life;
 }
 if(!ev)throw Error('An individual life requires an original encounter');
 const src={origin:SOURCE,beastId:b.id,species:b.species,
  firstSeenAt:s.world.location,witnessHash:hash(ev),
  initialDay:Math.floor(s.world.minutes/DAY)};
 const digest=Crypto.createHash('sha256').update(
  String(s.seed)+'|'+b.id+'|'+src.witnessHash+'|independent-wildlife-v1').digest();
 const seed=digest.readUInt32BE(0)||0x91e10da5;
 const life={version:1,beastId:b.id,species:b.species,
  source:src,sourceHash:hash(src),rngState:seed,
  lastTickDay:Math.floor(s.world.minutes/DAY),lastWatchMinute:-INTERVAL,
  history:[],witnessed:[]};
 b.individualLife=life;return life;
}
function draw(life){
 let x=life.rngState>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 life.rngState=(x>>>0)||0x91e10da5;
 return life.rngState/4294967296;
}
function biome(w,location){
 const reg=Atlas.LOCATION_REGION[location],eco=w?.ecosystems?.[reg];
 if(!eco||!Number.isFinite(eco.forage)||!Number.isFinite(eco.water)||
  !Number.isFinite(eco.pressure)||!Number.isFinite(eco.quality)||
  [eco.forage,eco.water,eco.pressure,eco.quality].some(x=>x<0||x>100))
  throw Error('Actual saved habitat conditions must exist before simulating animal activity');
 return eco;
}
function memory(life,event){
 life.history.push(event);if(life.history.length>24)life.history.shift();
}
function watch(s,p={}){
 noParams(p);
 const {b,ev,encounter}=originalEncounter(s);
 const w=require('./simulation').ensure(s),eco=biome(w,s.world.location);
 const past=b.individualLife;
 // Refuse a repeated equivalent watch BEFORE seeding, rolling or advancing.
 if(past&&s.world.minutes-past.lastWatchMinute<INTERVAL)
  throw Error('The animal needs a real interval before another distinct behaviour observation');
 const profile=Agency.profile(s,b),life=ensure(s,b,ev);
 const pick=draw(life),stressed=eco.pressure>73||eco.quality<30,
  hungry=b.needs.hunger>=50,tired=b.needs.fatigue>=50,
  forageAvailable=eco.forage>=30&&eco.water>=25;
 let action;
 if(stressed&&pick<.50)action='withdraw';
 else if(hungry&&forageAvailable&&pick<.92)action='forage';
 else if(tired&&pick<.85)action='rest';
 else if(pick<(.13+(profile.disposition==='independent'?.12:0)))action='withdraw';
 else if(forageAvailable&&pick<.48)action='forage';
 else if(pick<.72)action='rest';
 else if(pick<.87)action='reposition';
 else action='survey';
 const old=s.world.minutes,at=s.world.location,
  hungerBefore=b.needs.hunger;
 // Newly generated encounter records may lack a current-site field; this
 // address is witnessed directly in the original encounter, not invented.
 b.location=at;
 let description;
 if(action==='withdraw'){
  description='The animal turns away and leaves the encounter under its own power.';
  b.away=true;s.encounter=null;
 }else if(action==='forage'){
  description='The animal searches the surrounding cover and takes modest food available there.';
  b.needs.hunger=clamp(b.needs.hunger-12-Learning.bonus(s,b));
 }else if(action==='rest'){
  description='The animal settles briefly in nearby cover and rests without approaching.';
  b.needs.fatigue=clamp(b.needs.fatigue-12);
 }else if(action==='reposition'){
  const before=encounter.distanceMetres;
  if(Number.isInteger(before))encounter.distanceMetres=Math.min(24,before+3);
  description='The animal deliberately shifts farther away and keeps its own space.';
 }else description='The animal pauses to survey its surroundings, without offering contact.';
 life.lastWatchMinute=old;
 const observed={type:'witnessed-wildlife-routine',day:Math.floor(old/DAY),
  worldMinute:old,location:at,action,description,beastId:b.id,
  originalEncounterHash:life.source.witnessHash,
  noAssumedAffection:true,noBondAward:true};
 life.witnessed.push(observed);if(life.witnessed.length>18)life.witnessed.shift();
 memory(life,{type:'observed',day:observed.day,location:at,
  action,observed:true,sourceHash:hash(observed)});
 if(action==='forage'&&b.needs.hunger<hungerBefore)
  Learning.learn(s,b,{kind:'forage',action,day:observed.day,
   before:hungerBefore,after:b.needs.hunger});
 C.event(s,'beast',description,{origin:'witnessed-wildlife-routine',
  beastId:b.id,action,observedAtMinute:old,encounterHash:life.source.witnessHash,
  evidenceHash:hash(observed),left:action==='withdraw'});
 E.advance(s,WATCH_MINUTES);
 const W=require('../rules/world'),U=require('../rules/unified');
 W.finalizeTime(s,old);U.sync(s,{source:'legacy'});
 return {watched:true,beastId:b.id,observedAction:action,
  message:description,minutes:WATCH_MINUTES,
  encounterContinues:!!s.encounter&&s.encounter.beastId===b.id,
  noNewSpeciesKnowledge:true,noGuaranteedRelationship:true,
  noFreeTraining:true,noExtraPlayerRoll:true};
}
// A genuinely present wild animal may take, ignore or leave food presented
// from a respectful distance. Untaken food returns to the player's pack. The food must be real and compatible with the ONE
// already source-supported diet mapping; an offer is never a tame action.
const OFFER_MINUTES=8;
function offerFood(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).length!==1||typeof p.item!=='string')
  throw Error('Wild feeding accepts exactly one genuinely owned food item, not chosen behaviour, trust, skill, species or quantity');
 const item=p.item,{b,ev,encounter}=originalEncounter(s);
 const species=E.SPECIES[b.species];
 const allowed=require('../rules/bond-care').FEED_BY_DIET;
 if(!Array.isArray(allowed[species.diet])||!allowed[species.diet].includes(item)||
    !Object.hasOwn(E.RESOURCES,item))
  throw Error('This item has no source-established safe wild-food use for the actual species and its diet');
 const count=C.int(s.player.inventory?.[item]??0,'actual carried food',0,100000);
 if(count<1)throw Error('One actually carried '+item+' is needed for a genuine food offering');
 const Items=require('../rules/unified');
 const offeredFood=Items.planItems(s,{[item]:-1});
 if(s.table?.combatants?.player?.status&&
    s.table.combatants.player.status!=='ok')
  throw Error('An incapacitated person cannot offer food to a wild animal');
 if((b.injuries||[]).length||
    (Array.isArray(b.conditions)&&b.conditions.length)||
    b.condition<50)
  throw Error('An injured or unwell wild animal needs separate veterinary judgement, not generic hand-feeding');
 const w=require('./simulation').ensure(s),eco=biome(w,s.world.location);
 const profile=Agency.profile(s,b),originalHash=hash(ev);
 const circumstance={item,hunger:b.needs.hunger,fatigue:b.needs.fatigue,
  mood:String(b.mood||''),distance:encounter.distanceMetres??null,
  ecologyPressure:eco.pressure};
 const prior=encounter.foodOffer;
 if(prior!==undefined){
  if(!prior||prior.origin!=='observed-voluntary-wild-food-v1'||
     prior.beastId!==b.id||prior.encounterHash!==originalHash||
     !['eaten','ignored','departed'].includes(prior.response)||
     typeof prior.circumstanceHash!=='string'||
     !Number.isInteger(prior.worldMinute)||prior.worldMinute>s.world.minutes)
   throw Error('Previous wild food response requires authentic individual provenance');
  // Without any meaningful changed conditions, an identical repeated request
  // cannot fish for a different random animal decision or consume more food.
  if(prior.circumstanceHash===hash(circumstance))
   return {offered:false,repeated:true,beastId:b.id,accepted:false,
    originalResponse:prior.response,foodConsumed:0,elapsedMinutes:0,
    noExtraDecision:true,noBondAward:true,
    message:'The animal has already reacted to this same offering under unchanged conditions. It has not agreed to eat more or approach.'};
 }
 const life=ensure(s,b,ev),decision=draw(life);
 // Real hunger, habitat and persistent individual inclination matter.
 // This is the animal's own RNG, never the player picking acceptance.
 const base=b.needs.hunger>=55?.63:b.needs.hunger>=25?.43:.25;
 const nature=profile.disposition==='affiliative'?.19:
  profile.disposition==='curious'?.12:
  profile.disposition==='reserved'?-.11:-.15;
 const chance=clamp(base+nature-(eco.pressure>74?.14:0)-
  (b.needs.fatigue>65?.12:0),.03,.85);
 const response=decision<chance?'eaten':decision>.90?'departed':'ignored';
 const before=s.world.minutes,priorHunger=b.needs.hunger;
 if(response==='eaten'){
  Items.applyItems(s,offeredFood);
  b.needs.hunger=clamp(priorHunger-20);
 }
 Agency.remember(s,b);
 const observation={origin:'observed-voluntary-wild-food-v1',
  beastId:b.id,item,worldMinute:before,location:s.world.location,
  encounterHash:originalHash,originalEncounterWitness:life.source.witnessHash,
  response,foodConsumed:response==='eaten'?1:0,
  hungerChange:response==='eaten'?priorHunger-b.needs.hunger:0,
  noBondAward:true,noAutomaticTrust:true,noCompelledAcceptance:true};
 const rec={...observation,circumstanceHash:hash(circumstance)};
 life.witnessed.push(observation);
 if(life.witnessed.length>18)life.witnessed.shift();
 memory(life,{type:'personally-witnessed-food-offer',
  day:Math.floor(before/DAY),location:s.world.location,
  response,sourceHash:hash(observation),observed:true});
 if(response==='departed'){b.away=true;s.encounter=null;}
 else encounter.foodOffer=rec;
 const message=response==='eaten'?
  'The animal independently takes and eats one offered food portion. It has not agreed to companionship.':
  response==='departed'?
  'The animal chooses to move away from the food and leaves the encounter.':
  'The animal does not take the food you offer. You withdraw it without further contact.';
 C.event(s,'beast',message,{origin:observation.origin,
  beastId:b.id,item,response,foodConsumed:observation.foodConsumed,
  witnessHash:hash(observation),noPartnership:true,noTrustGain:true});
 E.advance(s,OFFER_MINUTES);
 const W=require('../rules/world'),U=require('../rules/unified');
 W.finalizeTime(s,before);U.sync(s,{source:'legacy'});
 return {offered:true,beastId:b.id,accepted:response==='eaten',
  response,foodConsumed:observation.foodConsumed,
  elapsedMinutes:OFFER_MINUTES,message,
  encounterContinues:!!s.encounter&&s.encounter.beastId===b.id,
  noPlayerDice:true,noBondAward:true,noCompelledAcceptance:true,
  hiddenNeedsNotDisplayed:true};
}

// Giving a genuine wild animal room needs no shared spoken language.
function giveSpace(s,p={}){
 noParams(p);
 const {b,ev,encounter}=originalEncounter(s,{safetyAction:true});
 const encounterHash=hash(ev),earlier=encounter.yieldSpace;
 if(earlier&&(!earlier||earlier.encounterHash!==encounterHash||
    !['hold','eased'].includes(earlier.response)||
    !Number.isInteger(earlier.worldMinute)||earlier.worldMinute>s.world.minutes))
  throw Error('The previous visible animal response has invalid provenance');
 const old=s.world.minutes;
 let response='unchanged',firstResponse=!earlier;
 if(firstResponse){
  const w=require('./simulation').ensure(s),eco=biome(w,s.world.location);
  const disposition=Agency.profile(s,b).disposition,life=ensure(s,b,ev);
  let willingness=encounter.threat===true?.30:.58;
  if(disposition==='reserved')willingness+=.12;
  if(disposition==='independent')willingness+=.08;
  if(eco.pressure>75)willingness-=.12;
  if(b.needs.hunger>70)willingness-=.08;
  if(/hostile|panicked|territorial|desperate/i.test(String(b.mood||'')))
   willingness-=.13;
  willingness=clamp(willingness,.06,.78);
  const choice=draw(life);
  response=choice<willingness*.45?'withdraw':
   (encounter.threat===true&&choice<willingness?'eased':'hold');
  memory(life,{type:'personally-witnessed-space-giving',day:Math.floor(old/DAY),
   location:s.world.location,worldMinute:old,encounterHash,response,observed:true});
  if(response==='withdraw'){
   b.away=true;s.encounter=null;
  }else{
   encounter.yieldSpace={encounterHash,worldMinute:old,response};
   if(response==='eased')encounter.threat=false;
  }
 }
 const message=!firstResponse?
  'You continue to give the animal room; repeating the gesture establishes no new reaction.':
  response==='withdraw'?
   'The wild animal chooses to move away under its own power.':
  response==='eased'?
   'The immediate threat display eases, but the animal has not agreed to contact.':
   'The animal holds its ground or warning; no acceptance is implied.';
 C.event(s,'beast',message,{origin:'witnessed-nonverbal-space-giving',
  beastId:b.id,encounterHash,response,firstResponse,
  noLanguageAssumed:true,noPartnership:true});
 E.advance(s,SIGNAL_MINUTES);
 const W=require('../rules/world'),U=require('../rules/unified');
 W.finalizeTime(s,old);U.sync(s,{source:'legacy'});
 return {gesture:'give_space',beastId:b.id,response,
  firstResponse,minutes:SIGNAL_MINUTES,message,
  encounterContinues:!!s.encounter&&s.encounter.beastId===b.id,
  noAssumedConsent:true,noCombatOutcome:true,noFreeReward:true};
}
function status(s,p={}){
 noParams(p);
 const id=s.encounter?.beastId,b=s.beasts?.[id];
 if(!b)return {activeEncounter:false,visibleBehaviour:null,
  note:'A currently present witnessed animal is required; remote animal locations and hidden routines are not displayed.'};
 const proof=originalEncounter(s,{safetyAction:true});
 const last=proof.b.individualLife?.witnessed?.at(-1);
 return {activeEncounter:true,beastId:id,
  knownDistanceMetres:Number.isInteger(s.encounter?.distanceMetres)?
   s.encounter.distanceMetres:null,
  lastObservedActivity:last&&last.location===s.world.location?
   {description:last.description,day:last.day+1}:null,
  lastSpaceGivingResponse:s.encounter?.yieldSpace?.response||null,
  note:'Only visible behaviour is shown. Hidden temperament, private needs, offscreen movements and evolution conditions are not readable.'};
}
// Proven ecological route familiarity sometimes helps a genuinely mobile
// wild animal pick a safer nearby compatible place. It never teleports,
// reveals hidden routes, skips an actual decision, or changes species limits.
function chooseKnownRoute(s,b,life,exits,w){
 const r=draw(life),familiarity=Learning.navigationTier(s,b);
 if(!familiarity||exits.length<2||r>=familiarity*.17)
  return exits[Math.floor(r*exits.length)];
 const candidates=exits.map(id=>{
  const eco=w.ecosystems?.[Atlas.LOCATION_REGION[id]];
  if(!eco)return {id,score:-Infinity};
  return {id,score:eco.quality+eco.forage+eco.water-2*eco.pressure};
 });
 candidates.sort((a,b)=>b.score-a.score||
  a.id.localeCompare(b.id));
 return candidates[0].id;
}
function sixday(s,days){
 if(!Array.isArray(days)||!days.length)return {updated:0};
 const w=s.table?.realm;if(!w)return {updated:0};
 let updated=0;
 for(const day of days){
  for(const b of Object.values(s.beasts||{})){
   const life=b?.individualLife;
   if(!life||b.owner||s.player.partnerIds?.includes(b.id)||
    s.encounter?.beastId===b.id||
    b.relationship!=='wild')continue;
   // A once-witnessed creature can live away from the player. Offscreen
   // histories are GM-only; no magical trail or instant public report.
   ensure(s,b,null);
   if(day<=life.lastTickDay)continue;
   const loc=E.LOCATIONS[b.location],eco=loc&&biome(w,b.location);
   if(!loc||!loc.spawns?.includes(b.species)){
    life.lastTickDay=day;continue;
   }
   const originalLocation=b.location,originalHunger=b.needs.hunger;
   const p=draw(life),tired=b.needs.fatigue>=50,
    hungry=b.needs.hunger>=45,
    shortage=eco.forage<35||eco.water<30,
    danger=eco.pressure>75||eco.quality<28;
   const exits=loc.exits.filter(id=>
    E.LOCATIONS[id]?.spawns?.includes(b.species));
   let action,afterNourishment=null;
   if((danger||shortage)&&exits.length&&p<.62){
    const dest=chooseKnownRoute(s,b,life,exits,w);
    b.location=dest;action='relocated-to-adjacent-compatible-habitat';
   }else if(hungry&&eco.forage>=30){
    b.needs.hunger=clamp(b.needs.hunger-22-Learning.bonus(s,b));
    afterNourishment=b.needs.hunger;
    action='independently-foraged';
   }else if(tired){
    b.needs.fatigue=clamp(b.needs.fatigue-25);
    // Actual independent shelter and rest allow ordinary energy recovery.
    b.energy=Math.min(b.maxEnergy,b.energy+2);
    action='sheltered-and-rested';
   }else if(exits.length&&p<.12){
    const dest=chooseKnownRoute(s,b,life,exits,w);
    b.location=dest;action='roamed-through-existing-habitat-link';
   }else{
    action='ordinary-territorial-life';
   }
   b.needs.hunger=clamp(b.needs.hunger+(shortage?9:4));
   b.needs.fatigue=clamp(b.needs.fatigue+(danger?6:3));
   if(shortage&&danger)b.condition=clamp(b.condition-1);
   // The elapsed time since an actual first sighting is established.
   // It does not invent a biological birth date, lifespan, or a maturity
   // barrier to otherwise legitimate evolution routes.
   const originalDay=life.source?.initialDay;
   if(!Number.isInteger(originalDay)||originalDay>day||originalDay<0)
    throw Error('Individual wildlife timeline lacks a valid source day');
   // Births have a real birth day. Unobserved births must not acquire an
   // invented personal sighting, even though their private lives advance.
   if(life.source.origin==='independent-mammal-birth-v1'){
    life.daysSinceBirth=day-originalDay;
   }else life.daysSinceFirstWitness=day-originalDay;
   b.away=true;life.lastTickDay=day;
   memory(life,{type:'offscreen-sixday',day,action,
    fromLocation:originalLocation,location:b.location,
    ecologicalPressure:true,observed:false});
   // Only independently completed and biologically meaningful behaviour
   // may teach the animal. A sixday of sleeping or hunger alone earns none.
   if(action==='independently-foraged'&&
      afterNourishment!==null&&afterNourishment<originalHunger)
    Learning.learn(s,b,{kind:'forage',action,day,
     before:originalHunger,after:afterNourishment});
   else if(['relocated-to-adjacent-compatible-habitat',
    'roamed-through-existing-habitat-link'].includes(action))
    Learning.learn(s,b,{kind:'navigate',action,day,
     before:originalLocation,after:b.location});
   // A learned *individual* technique may be chosen only by the beast during
   // its authentic independent action, paying its own energy and cooldown.
   Individuality.express(s,b,action,day);
   updated++;
  }
 }
 return {updated};
}

const TRACK_MINUTES=45,TRACK_STAMINA=3;
// The list is a JOURNAL of the player's own earlier observations, not a
// remote wildlife locator. Species and individual grade remain concealed.
function memories(s,p={}){
 noParams(p);
 const seen=[];
 for(const b of Object.values(s.beasts||{})){
  const life=b?.individualLife;
  if(!life||!life.witnessed?.length)continue;
  ensure(s,b,null);
  const lastWatch=life.witnessed.at(-1),
   returned=life.returnEncounters?.at(-1);
  const last=returned&&returned.worldMinute>lastWatch.worldMinute?
   returned:lastWatch;
  if(!Number.isInteger(last.worldMinute)||typeof last.location!=='string')
   throw Error('Individual encounter memory has no real witnessed place and date');
  seen.push({beastId:b.id,lastSeenLocation:last.location,
   lastSeenDay:Math.floor(last.worldMinute/DAY)+1,
   lastObservedAction:lastWatch.action,
   lastSeenBy:'personally witnessed',currentlyPresent:'not established'});
 }
 seen.sort((a,b)=>a.beastId.localeCompare(b.beastId));
 return {knownIndividuals:seen.slice(-30),
  note:'These are the player\'s recorded historical meetings, not current whereabouts, guaranteed survival, friendship, species identification or available targets.'};
}
function track(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).length!==1||typeof p.beastId!=='string')
  throw Error('Searching accepts only a previously witnessed individual beastId, never a chosen location, chance, animal reaction or search result');
 const id=p.beastId,b=s.beasts?.[id],life=b?.individualLife,
  loc=E.LOCATIONS[s.world?.location];
 if(!b||!life||!life.witnessed?.length)
  throw Error('Only a genuinely watched and remembered individual can be sought again');
 ensure(s,b,null);
 if(!loc||!Array.isArray(loc.spawns)||!loc.spawns.length)
  throw Error('A real accessible outdoor wildlife habitat is required for a tracking search');
 if(s.battle||s.encounter)
  throw Error('Finish or safely leave the current encounter before searching for another individual');
 if(s.table?.combatants?.player?.status&&s.table.combatants.player.status!=='ok')
  throw Error('An incapacitated practitioner cannot safely track an animal');
 if(b.owner||s.player.partnerIds?.includes(id)||
  b.relationship!=='wild')
  throw Error('This route is for an independently living wild individual, not a captive or partner');
 // A genuine search can follow immediately after an animal leaves. Time,
 // expenditure, terrain and the animal's agency are the constraints, not a
 // universal invented one-day prohibition on looking for someone again.
 const stamina=C.int(s.player.stamina,'actual tracking Stamina',0,100000),
  combatant=s.table?.combatants?.player;
 if(stamina<TRACK_STAMINA||(combatant&&combatant.stamina<TRACK_STAMINA))
  throw Error('Insufficient actual Stamina for a full field search');
 // The attempt is an honest search in the current *player* location, not
 // a private map query. In particular, a missing individual is no error:
 // the character can only learn that the search did not confirm its presence.
 const start=s.world.minutes,site=s.world.location;
 C.event(s,'world','The player begins a careful search for an individually remembered animal without assuming it is still here.',{
  origin:'remembered-wild-individual-search',beastId:id,site,
  originalWitnessHash:life.source.witnessHash,
  startMinute:start,timeMinutes:TRACK_MINUTES,staminaCost:TRACK_STAMINA,
  noLocationGuarantee:true,noForcedAnimalConsent:true
 });
 const witnessHash=hash(s.log.at(-1));
 // Elapsed time can change the world; decide the animal's actual present
 // location only AFTER any genuine calendar and ecological transitions.
 E.advance(s,TRACK_MINUTES);
 const W=require('../rules/world'),U=require('../rules/unified');
 W.finalizeTime(s,start);
 s.player.stamina=Math.max(0,s.player.stamina-TRACK_STAMINA);
 if(combatant){combatant.stamina=s.player.stamina;U.sync(s,{source:'wounds'});}
 const world=require('./simulation').ensure(s);
 const eco=biome(world,site);
 const dc=eco.pressure>75||eco.quality<30?16:14,
  stat=C.int(s.player.attributes?.wis,'earned tracking Wisdom',1,30),
  skill=C.int(s.player.skills?.survival?.rank,'earned Survival ability',0,5);
 const check=C.check(s,{modifier:Math.floor((stat-10)/2)+2*skill,
  dc,label:'Look for signs of a personally witnessed wild individual',risky:false});
 const rollHash=hash(s.log.at(-1));
 const disposition=Agency.profile(s,b).disposition;
 const availability=clamp(0.58-(disposition==='independent'?0.12:0)-
  (eco.pressure>75?0.12:0)-
  (b.needs?.hunger>=65?0.10:0)-
  (b.needs?.fatigue>=65?0.10:0),0.12,0.72);
 const independentlyPresent=b.location===site&&loc.spawns.includes(b.species)&&
  !b.injuries?.length&&b.condition>=45&&
  !/terrified|panicked|hostile|fleeing|desperate/i.test(String(b.mood||''))&&
  !['captured','forced','coerced','imprisoned'].includes(String(b.relationship).toLowerCase());
 // A search nowhere near the beast must not move its separate independent
 // RNG stream or affect future off-screen choices. Only an actual verified
 // local search can prompt the animal to decide whether it is seen.
 const creatureResponse=check.success&&independentlyPresent?draw(life):null,
  found=creatureResponse!==null&&creatureResponse<availability;
 life.searchAttempts||=[];
 life.searchAttempts.push({day:Math.floor(s.world.minutes/DAY),site,
  beastId:id,worldMinute:s.world.minutes,found,
  checkRollHash:rollHash,searchWitnessHash:witnessHash});
 if(life.searchAttempts.length>24)life.searchAttempts.shift();
 // No repetitive free checks: each further attempt requires actual field
 // time and stamina, and cannot erase the previous outcome.
 let message='No confirmed meeting with the remembered animal follows this search; its current whereabouts and intentions remain unknown.';
 if(found){
  const distanceMetres=2+Math.floor(draw(life)*16);
  const mood=eco.pressure>80?'wary':
   disposition==='independent'?'reserved':String(b.mood||'watchful');
  const threat=eco.pressure>93&&creatureResponse<.14;
  b.mood=mood;b.away=false;
  b.habitatExposure||={};b.habitatExposure[site]=1;
  s.encounter={beastId:id,observed:false,approaches:0,
   threat,distanceMetres};
  const wording='You find a wild '+E.SPECIES[b.species].name+
   ' near '+loc.name+'. It appears '+mood+
   '. It has not agreed to approach or partner with you.';
  C.event(s,'encounter',wording,{origin:SOURCE,
   beastId:id,species:b.species,location:site,mood,
   distanceMetres,previouslyWitnessed:true});
  const ev=s.log.at(-1);
  const record={origin:'genuine-reencounter',beastId:id,
   location:site,worldMinute:s.world.minutes,distanceMetres,
   originalSourceHash:life.sourceHash,encounterHash:hash(ev)};
  life.returnEncounters||=[];life.returnEncounters.push(record);
  if(life.returnEncounters.length>20)life.returnEncounters.shift();
  memory(life,{type:'observed-return',day:Math.floor(s.world.minutes/DAY),
   location:site,observed:true,sourceHash:hash(record)});
  message='You recognise the individual animal from your earlier observation. It remains free to approach, ignore or withdraw; its feelings and other private history are not established.';
 }
 C.event(s,'beast',message,{origin:'remembered-wild-individual-search-result',
  beastId:id,found,searchWitnessHash:witnessHash,
  checkRollHash:rollHash,noAutomaticPartnership:true,
  noUnseenLocationDisclosure:true});
 return {searched:true,found,beastId:id,check,minutes:TRACK_MINUTES,
  staminaSpent:TRACK_STAMINA,message,encounterContinues:found,
  noGuaranteedReturn:true,noAutomaticBond:true,
  hiddenMovementNotRevealed:true};
}

module.exports={SOURCE,WATCH_MINUTES,SIGNAL_MINUTES,OFFER_MINUTES,TRACK_MINUTES,TRACK_STAMINA,watch,giveSpace,offerFood,status,memories,track,sixday,
 _debug:{hash,originalEncounter,ensure,draw}};
