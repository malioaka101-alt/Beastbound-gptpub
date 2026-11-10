'use strict';
// Master §26: FIRST actually observed water-element human acclimation,
// specific to a local wetland and one existing survival task. No free weather
// control, deep human evolution, other-plane immunity or extra original die.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),C=require('../rules/core'),
 Element=require('../rules/specialist-elemental-wetland'),
 Camp=require('../rules/wilderness-camp');
const {previouslyEarned}=
 require('./cross-discipline-qi-mana-coherence.test.js');
const act=(s,op,p={})=>R.act(s,{system:'specialist',operation:op,params:p});
function witness(s,exposureId){
 C.event(s,'story',
  'Independent Whisperfen field naturalists and Meridian observers measure a living human original wetland fluid-response trial against a separate control.',{
   origin:Element.WITNESS,location:s.world.location,exposureId,
   elementalEnvironment:'wetland_water_humidity',firstGateNumber:1,
   measuredWeather:String(s.world.weather||'Fair').slice(0,120),
   realSourceWaterAndHabitat:'The public Whisperfen freshwater, reeds and water-saturated air are physically measured at the actual source wetland, not inferred from an imaginary ocean.',
   originalHumanFluidAndTissueResponse:'The existing original human skin, sweat glands, blood osmolality and balance reflexes respond measurably to the current wet air and marsh footing.',
   existingQiWaterRegulationRoute:'The original personally mapped Meridian Lower Gate supports a narrow trial of fluid-pressure circulation in the same living human tissue.',
   independentUnaidedSurvivalBaseline:'A separately witnessed unaided original fen campsite assessment is measurably harder while cold wetland footing and waterlogged plants remain unchanged.',
   independentOpposingOsmoticCountertest:'Independent counter-testing of reversed moisture-pressure gradients exposes fatigue, waterlogging, tissue swelling and real loss of balance.',
   oxygenAndMetabolicConstraints:'The living body still requires normal oxygen, calories, existing Qi, actual stamina, time and temperature regulation; wetland immersion cannot create new organs.',
   warmthAndRecoveryMethods:'Separate dry warmth, genuine medical monitoring and proper rest remain necessary if this individual water-response trial causes damage.',
   habitatAndEcologicalRights:'Public reedbank access does not authorise harm to protected marsh beasts, source habitats, other persons or the sealed Riftglass vault.',
   selfConsentedExposure:true,noElementalTransformationClaim:true,
   noWeatherControl:true,noOtherRealmImmunity:true
  });
 return s.log.length-1;
}
{
 const s=E.newGame({name:'No original elemental exposure',seed:26168000});
 R.unified.ensurePlayer(s);
 const before=E.exportGame(s),rng=s.rngState;
 A.equal(act(s,'wetlandStatus').earnedSpecificWetlandAcclimation,false);
 A.throws(()=>act(s,'wetlandExposure',{witnessIndex:0}),
  /physically|wetland|observed/i);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=previouslyEarned(26168002);
 R.unified.ensurePlayer(s);
 s.player.skills.survival.rank=5;
 A.equal(E.dispatch(s,'travel fen').ok,true);
 A.equal(s.world.location,'fen');
 const originalStage=s.player.humanEvolution.stage,
  originalOrigin=s.player.origin.load,
  originalMeridianStage=s.player.meridian.stage;
 const initial=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'wetlandExposure',{witnessIndex:0}),
  /witnessed|wetland|observed|genuine original local water|independent adverse osmotic/i);
 A.equal(E.exportGame(s),initial);A.equal(s.rngState,rng);
 let success=0,attempts=0;
 for(let i=0;i<8&&success<2;i++){
  const w=witness(s,'independent_wetland_water_trial_'+String(i+1).padStart(2,'0'));
  const qi=s.player.qi,stamina=s.player.stamina,minute=s.world.minutes;
  const snap=E.exportGame(s),beforeRng=s.rngState;
  A.throws(()=>act(s,'wetlandExposure',{
   witnessIndex:w,outcome:'ascending_water_body',bonus:999}),
   /truly independently witnessed/i);
  A.equal(E.exportGame(s),snap);A.equal(s.rngState,beforeRng);
  const r=act(s,'wetlandExposure',{witnessIndex:w});
  A.equal(r.attempted,true);A.equal(r.success,r.check.success);
  A.equal(r.qiSpent,2);A.equal(r.staminaSpent,3);
  A.equal(s.player.qi,qi-2);
  A.equal(s.player.stamina,Math.min(s.player.maxStamina,
   stamina-3+5*(Math.floor(s.world.minutes/1440)-Math.floor(minute/1440))));
  A.equal(s.world.minutes,minute+60);
  A.equal(r.noAutomaticEvolution,true);
  A.equal(r.noUniversalElementalImmunity,true);
  A.equal(Element.verify(s),true);
  A.equal(s.table.combatants.player.stamina,s.player.stamina,
   'The elemental exposure must finish with the original canonical and legacy Stamina ledgers in agreement');
  success+=r.success?1:0;attempts++;
  if(success===1)A.equal(act(s,'wetlandStatus').earnedSpecificWetlandAcclimation,false,
   'One personally observed exposure is not an instant new elemental body');
  const saved=E.exportGame(s),rngAfter=s.rngState;
  A.throws(()=>act(s,'wetlandExposure',{witnessIndex:w}),
   /cannot be rerolled|water|observed/i);
  A.equal(E.exportGame(s),saved);A.equal(s.rngState,rngAfter);
 }
 A.equal(success,2,'Two separately source-observed successful actual bodily water adaptations establish this narrow human technique');
 A.equal(attempts>=2,true);
 A.equal(act(s,'wetlandStatus').earnedSpecificWetlandAcclimation,true);
 A.equal(act(s,'wetlandStatus').livingWetlandShelterSupport,1);
 A.equal(Element.support(s).mitigation,1);
 A.equal(s.player.humanEvolution.stage,originalStage);
 A.equal(s.player.origin.load,originalOrigin);
 A.equal(s.player.meridian.stage,originalMeridianStage);
 const weather=String(s.world.weather||'Fair').slice(0,120);
 const penalty=/storm|gale|flood|downpour|blizzard|whiteout/i.test(weather)?3:
  /rain|mist|fog|sleet/i.test(weather)?1:0;
 const prev=s.world.minutes,previousStamina=s.player.stamina;
 A.equal(s.table.combatants.player.stamina,s.player.stamina,
  'Read-only elemental status must not change original wound-model Stamina');
 const camp=Camp.find(s);
 A.equal(camp.searched,true);
 A.equal(camp.dc,13+penalty,
  'Earned water-element physiology provides only one bounded reduction on the real original fen campsite roll');
 A.equal(camp.personallyEarnedElementalWetlandSupport,1);
 A.equal(camp.elapsedMinutes,45);
 A.equal(s.world.minutes,prev+45);
 A.equal(s.player.stamina<=previousStamina,true);
 A.ok(camp.roll>=1&&camp.roll<=20);
 A.equal(Element.verify(s),true);
 if(camp.found){
  const shelter=s.table.sleepShelters[camp.shelterId];
  A.equal(shelter.elementalMitigation,1);
  A.equal(shelter.elementalSeal,Element.support(s).sourceSeal);
  A.equal(Camp.valid(s,shelter),shelter);
  const wrongSource=E.importGame(E.exportGame(s));
  wrongSource.table.sleepShelters[camp.shelterId].elementalMitigation=9;
  A.throws(()=>Camp.valid(wrongSource,wrongSource.table.sleepShelters[camp.shelterId]),
   /authentic|source|original/i,
   'A fabricated massive elemental bonus may not pass original campsite-source authentication');
 }
 A.equal(E.dispatch(s,'travel forest').ok,true);
 A.equal(Element.support(s).mitigation,0);
 const forestWeather=String(s.world.weather||'Fair').slice(0,120);
 const forestPenalty=/storm|gale|flood|downpour|blizzard|whiteout/i.test(forestWeather)?3:
  /rain|mist|fog|sleet/i.test(forestWeather)?1:0;
 const ordinary=Camp.find(s);
 A.equal(ordinary.dc,11+forestPenalty,
  'An original wetland-only body adaptation must not grant a bonus in unrelated woodland');
 A.equal(ordinary.personallyEarnedElementalWetlandSupport,0);
 A.equal(Element.verify(s),true);
 const restored=E.importGame(E.exportGame(s));
 A.equal(Element.verify(restored),true);
 const forged=E.importGame(E.exportGame(s));
 forged.table.specialistWetlandAttunement.trials[0].source.qiSpent=0;
 A.equal(Element.verify(forged),false);
 const falseGate=E.importGame(E.exportGame(s));
 falseGate.table.powerPhysiology.meridian.gateRecords[0].quality='Flawed';
 A.equal(Element.verify(falseGate),false);
 const unearned=E.importGame(E.exportGame(s));
 unearned.table.specialistWetlandAttunement.earned=false;
 A.equal(Element.verify(unearned),false);
 for(let j=0;j<110;j++)C.event(s,'story',
  'Independent marsh wardens continue unrelated normal work while earlier original human water exposure and campsite evidence persist.',{unrelated:j});
 A.equal(s.log.length,90);
 A.equal(Element.verify(E.importGame(E.exportGame(s))),true);
}
console.log('Specialist #16 Elemental Ascendancy: two individually measured human water-response exposures, original Qi/Stamina and adverse tests, one narrow verified genuine wetland campsite DC benefit without other-element immunity');
