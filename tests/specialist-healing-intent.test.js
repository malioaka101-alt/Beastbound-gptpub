'use strict';
// Master §§20,26: source-observed optional clinical Qi repair of one genuine
// Serious wound. No universal obligatory Meridian route, magic cure, stolen
// tissue or second health pool; all states are disposable test characters.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),C=require('../rules/core'),
 Combat=require('../rules/combat'),
 Healing=require('../rules/specialist-healing-intent'),
 Gate=require('../rules/meridian-qi-strike');
const {previouslyEarned}=require('./cross-discipline-qi-mana-coherence.test.js');
const act=(s,operation,params={})=>
 R.act(s,{system:'specialist',operation,params});
function patient(seed){
 const s=previouslyEarned(seed);
 R.unified.ensurePlayer(s);
 s.player.attributes.wis=30;
 s.player.skills.medicine.rank=5;
 A.equal(E.dispatch(s,'travel academy').ok,true);
 A.equal(Gate.gate(s).opened.number,1);
 s.player.inventory.healing_balm=2;
 const c=Combat.get(s,'player');
 A.equal(c.wounds[1],0);
 const injury=Combat.harm(s,c,3);
 A.equal(injury.result.includes('Serious'),true);
 A.equal(c.wounds[1],1);
 A.equal(c.status,'ok');
 return s;
}
function observe(s,id='serious_tissue_repair_trial_01'){
 const c=Combat.get(s,'player');
 C.event(s,'story',
  'Independent clinical observers document an actual conscious consenting human patient, the existing First Meridian Gate circulation and a physically serious tendon wound.',{
  origin:Healing.WITNESS,location:s.world.location,
  treatmentId:id,
  observedWoundBoxes:[...c.wounds],firstMeridianGate:1,
  originalTissueAnatomy:'The actual living human anterior forearm tendon and adjacent blood flow have a visibly assessed serious tear with preserved tissue segments.',
  realMeridianRepairRoute:'The existing personally mapped First Lower Meridian Gate traces controlled original Qi through actual living forearm perfusion and nerve pathways.',
  independentOrdinaryHealingBaseline:'The current ordinary clinic would require actual supervised prolonged recovery of a Serious wound and cannot erase tissue damage instantly.',
  separatelyObservedQiResponse:'An individually witnessed short meridian-assisted tissue response reorients viable local collagen but cannot recreate missing flesh or change the species.',
  independentAdverseCirculationTest:'A separately measured reversed flow worsens local swelling and risks a real additional Light wound rather than helping the serious tear.',
  balmProvenanceAndUse:'One genuinely held existing standard healing balm is physically applied as a real supportive dressing during this clinic treatment.',
  cleanClinicControl:'The real clinic maintains separate clean implements and a normal treated baseline, with documented site and no unlicensed remote patient.',
  finiteTissueRecoveryAndAftercare:'The original living patient still retains a Light wound requiring ordinary dressing, rest and tissue consolidation after any successful Serious repair.',
  actualPatientSelfConsent:true,noGuaranteedRegeneration:true,
  noLegacyHpRestoration:true,noNewOrganOrSpeciesChange:true});
 return s.log.length-1;
}
{
 const s=E.newGame({name:'No wound and no Meridian healer',seed:26167000});
 R.unified.ensurePlayer(s);
 const old=E.exportGame(s),rng=s.rngState;
 A.equal(act(s,'healingIntentStatus').trials,0);
 A.throws(()=>act(s,'healingIntentTreat',{witnessIndex:0}),
  /clean known clinic|conscious|Serious|witnessed/i);
 A.equal(E.exportGame(s),old);A.equal(s.rngState,rng);
}
let selected=null,result=null;
for(let seed=26167001;seed<26167009&&!selected;seed++){
 const s=patient(seed);
 const wi=observe(s,'serious_tissue_repair_trial_'+seed);
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'healingIntentTreat',{witnessIndex:wi,force:true,damage:0}),
  /witnessed independently assessed/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const c=Combat.get(s,'player'),wounds=[...c.wounds],
  qi=s.player.qi,sta=s.player.stamina,
  balm=s.player.inventory.healing_balm,minute=s.world.minutes;
 const out=act(s,'healingIntentTreat',{witnessIndex:wi});
 A.equal(out.attempted,true);A.equal(out.success,out.check.success);
 A.equal(out.usedExistingHealingBalm,1);A.equal(out.qiSpent,3);
 A.equal(out.staminaSpent,4);A.equal(out.elapsedMinutes,90);
 A.equal(s.player.qi,qi-3);
 A.equal(s.player.stamina,Math.min(s.player.maxStamina,
   sta-4+5*(Math.floor(s.world.minutes/1440)-Math.floor(minute/1440))),
   'Genuine treatment exertion and existing independent world-day recovery both apply');
 A.equal(s.player.inventory.healing_balm,balm-1);
 A.equal(s.world.minutes,minute+90);
 A.equal(Healing.verify(s),true);
 if(out.success){
  A.equal(c.wounds[1],wounds[1]-1);
  A.equal(c.wounds[0],wounds[0]+1);
  selected=s;result=out;
 }else{
  A.equal(c.wounds[1],wounds[1]);
  A.equal(c.wounds[0],wounds[0]+(out.adverseAdditionalLightWound?1:0));
 }
}
A.ok(selected,'Independent high-skilled disposable human wound trials can resolve genuine successful Meridian clinical repair');
{
 const s=selected,c=Combat.get(s,'player');
 A.equal(result.success,true);
 A.equal(c.wounds[0],1);
 A.equal(c.wounds[1],0);
 A.equal(result.noLegacyHpGain,true);
 A.equal(result.noNewEvolutionOrTechniqueGranted,true);
 A.equal(s.player.humanEvolution.stage,0);
 const previous=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'healingIntentTreat',{witnessIndex:0}),
  /current Serious wound|recovery capacity|clinical/i);
 A.equal(E.exportGame(s),previous);A.equal(s.rngState,rng);
 const healthyQi=s.player.qi,regularBalm=s.player.inventory.healing_balm;
 const ordinary=R.act(s,{system:'health',operation:'balm',params:{}});
 A.equal(ordinary.treated,'Light wound');
 A.equal(c.wounds[0],0);
 A.equal(s.player.inventory.healing_balm,regularBalm-1);
 A.equal(s.player.qi,healthyQi);
 A.equal(Healing.verify(s),true,
  'Canonical ordinary care after individual Meridian repair does not rewrite original clinical source');
 const saved=E.importGame(E.exportGame(s));
 A.equal(Healing.verify(saved),true);
 const altered=E.importGame(E.exportGame(s));
 altered.table.specialistHealingIntent.attempts[0].source.balmSpent=0;
 A.equal(Healing.verify(altered),false);
 const forged=E.importGame(E.exportGame(s));
 forged.table.specialistHealingIntent.attempts[0].source.woundsAfter[1]=0+
  forged.table.specialistHealingIntent.attempts[0].source.woundsBefore[1];
 A.equal(Healing.verify(forged),false);
 const dice=E.importGame(E.exportGame(s));
 dice.table.specialistHealingIntent.attempts[0].source.check.roll=20;
 A.equal(Healing.verify(dice),false);
 const forgedAnatomy=E.importGame(E.exportGame(s));
 forgedAnatomy.table.powerPhysiology.meridian.gateRecords[0].quality='Flawed';
 A.equal(Healing.verify(forgedAnatomy),false,
  'The method cannot survive a forged first Gate or missing original meridian source');
 for(let n=0;n<110;n++)C.event(s,'story',
  'Independent physicians continue unrelated ordinary ward rounds without rewriting the earlier physically witnessed tissue repair.',{episode:n});
 A.equal(s.log.length,90);
 A.equal(Healing.verify(E.importGame(E.exportGame(s))),true);
}
console.log('Specialist #16 Healing Intent: genuine original human Serious wound, clean clinic, first-gate anatomy, consent, one original check, real balm/Qi/Stamina and residual Light care');
