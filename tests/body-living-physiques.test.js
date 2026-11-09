'use strict';
// Full-body Cycle III is earned via the original rules, not a forged stage.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),C=require('../rules/core'),
 D=require('../rules/disciplines'),Phys=require('../rules/body-living-physiques'),
 Nerve=require('../rules/body-nerve-sense'),
 Power=require('../rules/power-overview'),Turn=require('../scripts/chat-turn');
const act=(s,name,p={})=>R.act(s,{system:'body',operation:name,params:p});
function prior(seed=927101){
 const s=E.newGame({seed,name:'Disposable Independent Body Refinement',path:'undecided'});
 R.unified.ensurePlayer(s);s.world.location='academy';
 s.player.attributes.con=30;s.player.skills.survival.rank=5;
 s.player.body.cycles=['Muscle-Tendon Cycle','Bone-Marrow Cycle'];
 s.table.disciplineTraining||={};
 s.table.disciplineTraining.body={target:null,points:0,weeks:0,methods:{},
  cooldownUntil:0,complications:[],history:[
   {day:1,target:'cycle1',quality:'strong',
    change:'Completed Cycle I Muscle-Tendon refinement; +2 stamina, Might +1, M1 natural force'},
   {day:1,target:'cycle2',quality:'strong',
    change:'Completed Cycle II Bone-Marrow refinement; +1 Toughness, +1 Serious wound box'}
  ]};
 let complete=false;
 for(let n=0;n<8&&!complete;n++){
  const result=act(s,'organWork',{focus:'integrated',minutes:15,
   approach:'Physically coordinate original existing heart, lungs, liver and kidney tissues with a real whole-body exertion limit'});
  complete=result.completed;
 }
 A.equal(complete,true,'Original genuine Organ III must be earned by a real check');
 A.equal(D.organEarned(s).cycle,3);
 A.equal(s.player.body.cycles.length,3);
 return s;
}
function witness(s,origin,cycle,details={}){
 C.event(s,'story','The individual practitioner is clinically examined during an original whole-body physical tissue integration trial with recorded limits.',{
  origin,cycle,location:s.world.location,...details});
 return s.log.length-1;
}
function recovery(s,min){
 let nights=0;
 while(s.player.stamina<min){
  A.ok(nights++<12,'Normal physiological overnight recovery must support genuine tissue practice');
  const before=s.world.minutes;
  R.act(s,{system:'health',operation:'sleep',params:{hours:8}});
  A.equal(s.world.minutes,before+480);
  if(s.player.stamina<min)
   R.act(s,{system:'world',operation:'wait',params:{minutes:960}});
 }
}
function nerveWitness(s,origin,details={}){
 C.event(s,'story','An independent practitioner clinically observes a physically present original human nervous system with measurable limitations.',{
  origin,location:s.world.location,...details});
 return s.log.length-1;
}
function earnNeuralCycle(s){
 const mapped=nerveWitness(s,Nerve.MAP,{
  clinicalObservation:'Original adult sensory and motor nerves remain observed within the same physiological body as previously earned blood and adaptive tissues.',
  independentCountertest:'A separate measured local nerve fatigue condition interrupts ordinary sensorimotor response without supernatural immunity.'});
 const n=act(s,'nerveMap',{name:'Personally observed original neural regulation',
  systems:[
   {id:'afferent',tissue:'An original human afferent nervous pathway under measured bodily heat and pain stress',
    actualFunction:'Finite sensory signals transmit across the original living nervous anatomy with fatigue'},
   {id:'motor',tissue:'An original human efferent motor control pathway integrated with original observed muscles',
    actualFunction:'Finite reflex and timing changes are measured through actual ordinary nerve transmission'}
  ],
  metabolicLimit:'Oxygen, energy, nutrition and sleep remain essential to this original human nerve regulation.',
  injuryLimit:'Nerve damage and excessive sensory loading can disrupt the original practiced neural pathways.',
  recovery:'Real clinical treatment and ordinary physical recuperation are needed after severe neural strain.',
  witnessIndex:mapped});
 A.equal(n.mapped,true);
 let ready=false;
 for(let i=0;i<15&&!ready;i++){
  recovery(s,3);
  const ix=nerveWitness(s,Nerve.PRACTICE,{
   measuredResponse:'A locally observed original peripheral and motor nerve response is measurable under a bounded physical sensory load.',
   fatigueLimit:'An independent fatigue threshold causes nerve signals and posture to degrade under repeated original work.'
  });
  const r=act(s,'nervePractice',{focus:'integrated',witnessIndex:ix,minutes:15});
  ready=r.integrated&&Object.values(r.systems).every(x=>x===2);
  A.equal(Nerve.verify(s),true);
 }
 A.equal(ready,true);
 let complete=false;
 for(let i=0;i<12&&!complete;i++){
  recovery(s,5);
  const ix=nerveWitness(s,Nerve.FORM,{
   fullBodyResponse:'Original sensory nerve and motor pathways operate together across the independently observed living human body.',
   independentFailureLimit:'Fatigue and applied local pain stimuli still interrupt this original physical nervous system without a newly invented sense.'
  });
  complete=act(s,'nerveComplete',{witnessIndex:ix,minutes:90}).formed;
 }
 A.equal(complete,true);
 A.equal(Nerve.verify(s),true);
 A.equal(Phys.verify(s),true,'Previously earned blood and adaptive sources survive the genuine neural change');
}
{
 const s=prior(),data=E.exportGame(s),rng=s.rngState;
 const ready=act(s,'physiqueStatus');
 A.equal(ready.available,true);
 A.deepEqual(ready.completed,[]);
 A.equal(Power.read(s).body.livingPhysique.available,true);
 A.equal(E.exportGame(s),data);A.equal(s.rngState,rng);
 A.throws(()=>act(s,'physiqueMap',{cycle:4,id:'nothing',method:'Declared new nerves'}),
  /body-cycle design|original witnessed/);
 A.equal(E.exportGame(s),data);
 const sources={
  5:{circulationMeasurement:'Original ordinary human blood oxygenation and vessel pressure are measured during safe local exertion.',
   metabolicLimit:'Breathing, nutrition, fatigue and actual heat loss restrict blood-essence energy transport.'},
  6:{environmentalCondition:'A real local temperature and humidity change tests observable human skin and vascular adaptation.',
   reversibleResponse:'The subject measurably returns to ordinary baseline physiology on stopping the temporary strain.'},
  7:{individualConstitution:'Observed already integrated nerves, blood, organs and adaptive skin act together in one unique human body.',
   lifespanBoundary:'The measured person remains vulnerable to injury, hunger, infection, fatigue and finite lifespan.'}
 };
 const originalMax=s.player.maxStamina;
 const order=[6,5,7],done=[];
 for(const cycle of order){
  if(cycle===7)earnNeuralCycle(s);
  const sp=Phys.SPEC[cycle],details=sources[cycle];
  const wi=witness(s,Phys.MAP,cycle,{
   ...details,
   independentCountertest:'An unrelated physical pressure and metabolic strain test breaks the response before any unearned immunity appears.'});
  const map=act(s,'physiqueMap',{cycle,id:'original_body_cycle_'+cycle,
   method:'An individual self-directed '+sp.name+' adaptation is learned through measured biological tissues and ordinary bounded recovery.',
   actualTissues:'Observed existing human connective tissues, neurons, organs, blood circulation and skin remain physically interconnected.',
   metabolicSupport:'Ordinary food, rest, oxygenation and physical energy are still essential to the new tissue response.',
   failureLimit:'Documented injury, low stamina, infection, thermal stress or incompatible loading can undermine the specialised body.',
   reversion:'Any temporary state must release back into the original protected human body; evolved tissues require clinical management.',
   witnessIndex:wi});
  A.equal(map.mapped,true);A.equal(map.noFreeTraitsOrSpeciesChange,true);
  A.equal(Phys.verify(s),true);
  let practiced=false;
  for(let n=0;n<10&&!practiced;n++){
   recovery(s,sp.energy+2);
   const ix=witness(s,Phys.WORK,cycle,{
    observedBodyResponse:'An original separately monitored tissue response changes only physically established local human structures.',
    physicalLimit:'The subject shows independently measured fatigue or pressure limits preventing a universal species power.'});
   const before=s.world.minutes,stamina=s.player.stamina;
   const trained=act(s,'physiqueWork',{cycle,witnessIndex:ix,minutes:15});
   const elapsedDays=Math.floor((before+15)/1440)-Math.floor(before/1440);
   A.equal(s.player.stamina,Math.min(s.player.maxStamina,stamina-trained.staminaSpent+5*elapsedDays));
   A.equal(s.world.minutes,before+15);
   A.equal(trained.noInstantStrengthOrOtherPower,true);
   A.equal(Phys.verify(s),true);
   practiced=trained.points>=trained.required;
  }
  A.equal(practiced,true,'Cycle '+cycle+' requires actually earned physiology');
  let formed=false;
  for(let n=0;n<10&&!formed;n++){
   recovery(s,sp.energy+2);
   const ix=witness(s,Phys.FORM,cycle,{
    integratedFunction:'All known source-observed individual tissues work together in an independent sustained physiological load check.',
    failureCounter:'A separate recorded pressure disruption demonstrates that the whole body can still be injured or exhausted.',
    metabolicTradeoff:'The actual individual spends physical stamina, nutrition, temperature control and recovery to support new tissue.'});
   const before=s.world.minutes,oldMax=s.player.maxStamina,oldSta=s.player.stamina;
   const result=act(s,'physiqueComplete',{cycle,witnessIndex:ix,minutes:90});
   A.equal(s.world.minutes,before+90);
   const elapsedDays=Math.floor((before+90)/1440)-Math.floor(before/1440);
   A.equal(s.player.stamina,Math.min(s.player.maxStamina,oldSta-result.staminaSpent+5*elapsedDays));
   A.equal(result.noAutomaticSpeciesTraitOrImmunity,true);
   formed=result.formed;
   if(formed){
    A.equal(s.player.maxStamina,oldMax+sp.bonus);
    A.equal(s.table.combatants.player.maxStamina,s.player.maxStamina);
    A.equal(s.player.body.cycles.at(-1),sp.name);
   }
   A.equal(Phys.verify(s),true);
  }
  A.equal(formed,true,'Cycle '+cycle+' should be achievable on its actual original body evidence');
  done.push(cycle);
  if(cycle===6){
   const view=Power.read(s).body;
   A.equal(view.nextCycle,null,'A school which earned Adaptive VI first must not be told the canonical fifth cycle is mandatory');
   A.ok(view.namedUndevelopedCycles.includes('Nerve-Sense Cycle'));
   A.ok(view.namedUndevelopedCycles.includes('Blood-Essence Cycle'));
  }
  A.equal(s.player.humanEvolution.stage,0);
  A.deepEqual(s.player.origin.stableTraits,[]);
  A.equal(s.player.arcane.circles,0);
  A.equal(s.player.meridian.stage,0);
  A.equal(s.player.soul.phase,0);
 }
 A.deepEqual(done,[6,5,7],'Compatible schools may earn Adaptive VI and Blood V before neural IV');
 A.equal(s.player.body.cycles.length,7);
 A.equal(s.player.maxStamina,originalMax+6);
 A.equal(act(s,'physiqueStatus').completed.length,4);
 A.equal(Power.read(s).body.livingPhysique.completed.length,4);
 A.equal(Phys.verify(s),true);
 // An original earned Adaptive Cycle can express only a personally observed
 // bounded bodily state. It must spend real stamina, expire under the normal
 // world clock, and physically return without conferring a new beast trait.
 recovery(s,5);
 let ix=witness(s,Phys.ASSUME,6,{
  environmentObserved:'A real observed temperature and humidity shift produces a finite temporary vasomotor skin response in this individual.',
  safeReversionCounter:'Independent clinical cooling and oxygenation tests demonstrate that the active response must return toward baseline.',
  safeMinutes:30});
 const before=s.player.stamina;
 const assumed=act(s,'physiqueAssume',{witnessIndex:ix,minutes:30});
 A.equal(assumed.attempted,true);
 A.equal(s.player.stamina,before-assumed.staminaSpent);
 A.equal(Phys.verify(s),true);
 if(assumed.formed){
  A.equal(act(s,'physiqueStatus').currentAdaptiveExpression.active,true);
  A.throws(()=>act(s,'physiqueAssume',{witnessIndex:ix,minutes:30}),/already active/);
  ix=witness(s,Phys.RELEASE,6,{
   observedReturn:'The recorded human skin and vascular state physically returns to its independently observed baseline under clinical control.',
   independentFailureLimit:'The return remains vulnerable to ordinary fatigue, injury and inadequate oxygen; no healing has occurred.'});
  A.equal(act(s,'physiqueRelease',{witnessIndex:ix}).released,true);
  A.equal(act(s,'physiqueStatus').currentAdaptiveExpression.active,false);
 }
 recovery(s,5);
 ix=witness(s,Phys.ASSUME,6,{
  environmentObserved:'A fresh measured ordinary dry heat gradient elicits a new reversible adaptive response from already refined original human tissues.',
  safeReversionCounter:'An independent bounded heat load confirms a time-limited return before damaging native skin or blood circulation.',
  safeMinutes:20});
 const second=act(s,'physiqueAssume',{witnessIndex:ix,minutes:20});
 A.equal(Phys.verify(s),true);
 if(second.formed){
  R.act(s,{system:'world',operation:'wait',params:{minutes:21}});
  A.equal(act(s,'physiqueStatus').currentAdaptiveExpression.active,false);
  A.equal(act(s,'physiqueStatus').currentAdaptiveExpression.naturallyExpired,true);
  A.equal(Phys.verify(s),true);
 }
 // Earned Evolved VII is permanent anatomy, NOT a time-expiring buff.
 // Its CURRENT metabolic support is a witnessed, renewable and independently
 // paid bodily condition. Use the same canonical material-transfer executor as
 // ordinary trade and food, not a parallel body-specific inventory.
 const initialCare=act(s,'physiqueStatus').constitutionMaintenance;
 A.equal(initialCare.earned,true);
 A.equal(initialCare.permanentConstitution,true);
 A.equal(initialCare.currentlyObserved,false);
 recovery(s,3);
 const observedFood=s.player.inventory.clean_rations;
 A.ok(observedFood>0,'The disposable practitioner genuinely owns provisions');
 const n=witness(s,Phys.SUSTAIN,7,{
  actualMetabolicDemand:'Original blood oxygen transport and whole-body organ workload require measured ordinary human food and sleep support.',
  independentFailureLimit:'Separate observed fatigue, hunger and tissue pressure show the constitution is not self-feeding or invulnerable.',
  observedFoodCompatibility:'Genuine carried clean rations are measured as digestible and sufficient for this particular original human food route.',
  supportedMinutes:125});
 const beforeCareStamina=s.player.stamina,beforeCareTime=s.world.minutes;
 const care=act(s,'physiqueSustain',{witnessIndex:n,minutes:60});
 A.equal(care.attempted,true);
 A.equal(care.confirmed,care.check.success);
 A.equal(care.realFoodConsumed.quantity,1);
 A.equal(s.player.inventory.clean_rations,observedFood-1);
 A.equal(s.world.minutes,beforeCareTime+60);
 A.equal(s.player.stamina,Math.min(s.player.maxStamina,
  beforeCareStamina-care.staminaSpent+5*(
   Math.floor(s.world.minutes/1440)-Math.floor(beforeCareTime/1440))));
 A.equal(Phys.verify(s),true);
 const afterCare=E.exportGame(s),afterCareRng=s.rngState;
 A.throws(()=>act(s,'physiqueSustain',{witnessIndex:n,minutes:60}),
  /already|rerolled/);
 A.equal(E.exportGame(s),afterCare);
 A.equal(s.rngState,afterCareRng);
 if(care.confirmed){
  A.equal(act(s,'physiqueStatus').constitutionMaintenance.currentlyObserved,true);
  R.act(s,{system:'world',operation:'wait',params:{minutes:126}});
  const expired=act(s,'physiqueStatus').constitutionMaintenance;
  A.equal(expired.earned,true);
  A.equal(expired.permanentConstitution,true);
  A.equal(expired.currentlyObserved,false);
  A.ok(s.player.body.cycles.includes('Evolved Physique Cycle'));
  A.equal(Phys.verify(s),true);
 }
 // A signed care receipt cannot be silently revised after saving.
 const tamperCare=E.importGame(E.exportGame(s));
 tamperCare.table.bodyRefinement.living.cycles[7].upkeep[0].source.foodQuantity=0;
 A.equal(Phys.verify(tamperCare),false);
 const snapshot=E.exportGame(s),saved=E.importGame(snapshot);
 A.equal(Phys.verify(saved),true);
 saved.table.bodyRefinement.living.cycles[7].transition.source.capacity.newMax+=20;
 A.equal(Phys.verify(saved),false);
 const forge=E.importGame(snapshot);
 forge.table.bodyRefinement.living.cycles[6].attempts[0].source.total=100;
 A.equal(Phys.verify(forge),false);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-living-physique-'));
 try{
  const file=Path.join(dir,'save.json');FS.writeFileSync(file,snapshot+'\n');
  const request={id:'body_physique_status_927101',mode:'rule',
   system:'body',operation:'physiqueStatus',params:{}};
  A.equal(Turn.execute(file,request).applied,false);
  A.equal(Turn.execute(file,request).applied,false);
  A.equal(FS.readFileSync(file,'utf8'),snapshot+'\n');
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Body #13: real organ III, adaptive VI, blood V, neural IV, evolved VII; all original earned work, no power grants, shared saved anatomy');
