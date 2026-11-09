'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 C=require('../rules/core'),D=require('../rules/disciplines'),
 Arc=require('../rules/arcane-dynamic-architecture'),
 Spells=require('../rules/arcane-spell-grammar'),
 Turn=require('../scripts/chat-turn');
const firstDesign='Measured First Circle built from an originally stable sixfold Mana Core geometry and return loop';
const secondDesign='Two independently connected Circle channels form a dual counter-rotating, source-observed return geometry';
const thirdDesign='Three physically independent Circle paths are cross-coupled through a stable return matrix, with measured interference feedback and formula correction across all three existing channels.';
const fourthDesign='The genuinely earned three resonant Circle channels permit one bounded component to be reoriented during casting; separately sensed feedback and reversible geometric reconfiguration maintain the original stable core.';
const op=(s,name,p={})=>R.act(s,{system:'arcane',operation:name,params:p});
const witnessed=(s,origin,details={})=>{
 C.event(s,'story','The individual Arcane practitioner performs a witnessed bounded original physical test of Mana geometry without claiming any unearned spell.',{
  origin,location:s.world.location,...details});
 return s.log.length-1;
};
function rest(s,minimum){
 let count=0;
 while(s.player.mana<minimum||s.player.stamina<4){
  A.ok(count++<20,'Original sleep recovery must be sufficient for a disposable physical mage');
  const before=s.world.minutes,mana=s.player.mana;
  const r=R.act(s,{system:'health',operation:'sleep',params:{hours:8}});
  A.equal(r.sleptHours,8);
  A.equal(s.world.minutes,before+480);
  A.equal(s.player.mana,Math.min(s.player.maxMana,mana+12));
  if(s.player.mana<minimum)
   R.act(s,{system:'world',operation:'wait',params:{minutes:960}});
 }
}
function earnedThird(seed){
 const s=E.newGame({seed,name:'Source-earned Fourth Circle',path:'arcane'});
 R.unified.ensurePlayer(s);
 s.world.location='academy';
 s.player.attributes.int=30;s.player.skills.arcana.rank=5;
 const a=s.player.arcane,profile=R.build.arcaneProfile(1);
 a.coreIgnited=true;a.circles=1;a.geometry=firstDesign;
 a.structuredMana=profile.mana;a.channels=profile.channels;
 a.maxComplexity=profile.maxComplexity;
 s.table.disciplineTraining||={};
 s.table.disciplineTraining.arcane={target:null,points:0,weeks:0,
  methods:{},cooldownUntil:0,complications:[],history:[
   {day:1,target:'core',quality:'strong',change:'Mana Core ignited, no Circle yet'},
   {day:1,target:'circle1',quality:'strong',change:'First Circle constructed; '+firstDesign}
  ]};
 for(let attempt=0;attempt<10&&a.circles===1;attempt++)
  op(s,'circleWork',{design:secondDesign,minutes:15});
 A.equal(a.circles,2,'Original dual-channel work must actually complete');
 for(let attempt=0;attempt<10&&a.circles===2;attempt++){
  rest(s,4);
  op(s,'matrixWork',{design:thirdDesign,focus:'integrated',minutes:15});
 }
 A.equal(a.circles,3,'The original three-Circle matrix must actually be earned');
 A.equal(D.verifyThirdCircle(s).number,3);
 return s;
}
{
 const s=earnedThird(831111),a=s.player.arcane,
  start=E.exportGame(s),rng=s.rngState;
 const st=op(s,'dynamicStatus');
 A.equal(st.available,true);A.equal(st.constructed,false);
 A.equal(op(s,'formulaStatus').known,0);
 A.equal(E.exportGame(s),start);A.equal(s.rngState,rng);
 A.throws(()=>op(s,'dynamicMap',{design:fourthDesign,witnessIndex:0}),
  /multi-channel redesign|personally witnessed/);
 A.equal(E.exportGame(s),start);
 const witnessIndex=witnessed(s,Arc.MAP,{
  observedChannelResponse:'The real third matrix has a measurable variable return path allowing deliberate small reorientation.',
  knownCountertest:'External pressure and deliberately broken feedback make the correction fail without an extra Circle.' ,
  existingChannels:3});
 const mapped=op(s,'dynamicMap',{
  design:fourthDesign,
  channelInteraction:'The two side channels stabilise the main Circle while a separate dynamic branch is rotated.',
  interference:'Resonance drift and formula interference can break this personally observed redesign.',
  safety:'The original core remains intact, and feedback or pressure rise stops practice immediately.',
  witnessIndex});
 A.equal(mapped.mapped,true);A.equal(mapped.notConstructed,true);
 A.equal(Arc.verify(s),true);
 let ready=false;
 for(let n=0;n<10&&!ready;n++){
  rest(s,3);
  const ix=witnessed(s,Arc.PRACTICE,{
   channelTest:'An actual measured channel correction moves one geometry component while preserving the old matrix.',
   failureLimit:'The original core feedback fails under known interference, imposing genuine structural strain.'});
  const before=s.world.minutes,priorMana=s.player.mana,
   result=op(s,'dynamicWork',{witnessIndex:ix,minutes:15});
  A.equal(s.world.minutes,before+15);
  A.equal(s.player.mana,priorMana-result.manaSpent);
  A.equal(result.noFreeMagic,true);
  A.equal(Arc.verify(s),true);
  ready=result.points>=result.needed;
 }
 A.ok(ready,'Observed repeated actual calibration must earn fourth-Circle readiness');
 rest(s,8);
 const ix=witnessed(s,Arc.BREAKTHROUGH,{
  changedDuringCasting:'The fourth geometric channel is independently observed changing alignment during a harmless bounded Mana flow.',
  interferenceCounter:'A real measured ambient counterpressure reveals the precise limit of the new dynamic feedback loop.'});
 const before=s.world.minutes,previous=s.player.mana,max=s.player.maxMana;
 const result=op(s,'dynamicComplete',{witnessIndex:ix,minutes:90});
 A.equal(result.formed,true);
 A.equal(s.player.arcane.circles,4);
 A.equal(s.player.arcane.channels,R.build.arcaneProfile(4).channels);
 A.equal(s.world.minutes,before+90);
 A.equal(s.player.mana,previous-result.manaSpent);
 A.equal(s.player.maxMana,Math.max(max,R.build.arcaneProfile(4).mana));
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(Arc.verify(s),true);
 A.equal(op(s,'dynamicStatus').constructed,true);
 const copy=E.importGame(E.exportGame(s));
 A.equal(Arc.verify(copy),true);
 copy.table.arcaneArchitecture.dynamicFourth.attempts[0].source.manaSpent=999;
 A.equal(Arc.verify(copy),false);
 const exampleForm={family:'shape',rng:'self',area:'single',
  duration:'instant',magnitude:0,conditions:1,speed:'standard'};
 const oldSpellNames=Object.keys(s.table.arcaneTechniques||{});
 const fId='river_wind_manachannel_trace';
 const beforeFormula=E.exportGame(s);
 A.throws(()=>op(s,'formulaMap',{
  id:fId,name:'Observed mana trace',form:{...exampleForm,family:'impossible'},
  channels:[1,2],mechanism:'Two source-observed geometry channels provide small local harmless resonance',
  limit:'There is no damage or magically changed matter from an untrained design',
  interferenceSource:'Local mana pressure can disrupt the observed original Circle signals',
  witnessIndex:ix}),/bounded noncombat formula|Unknown spell family/);
 A.equal(E.exportGame(s),beforeFormula);
 const formulaWitness=witnessed(s,Spells.MAP,{
  formulaId:fId,
  observedGeometry:'Two original fourth-Circle channels form an actual separately measured short Mana return path.',
  knownFailure:'A disturbed return line loses its signal entirely without transforming local matter.'});
 const planned=op(s,'formulaMap',{id:fId,name:'River Wind Mana Trace',
  form:exampleForm,channels:[1,2],
  mechanism:'Two earned individual channels make a small measured local Mana resonance indicator for practice',
  limit:'No damage, healing, stored object, new creature ability or automatic third-party effect is granted',
  interferenceSource:'Observed uncontrolled ambient mana turbulence disrupts the tracked return phase',
  witnessIndex:formulaWitness});
 A.equal(planned.mapped,true);A.equal(planned.learned,false);
 A.equal(Object.keys(s.table.arcaneTechniques||{}).length,oldSpellNames.length);
 A.equal(Spells.verify(s),true);
 let learned=false;
 for(let n=0;n<10&&!learned;n++){
  rest(s,4);
  const wi=witnessed(s,Spells.STUDY,{
   formulaId:fId,
   practicalTest:'The mage measures original individual signals, repeats the safe channel flow and tests loss of coherence.',
   interference:'Normal ambient mana noise and deliberately changed geometry disrupt the small local returned signal.'});
  const x=op(s,'formulaLearn',{id:fId,witnessIndex:wi,minutes:15});
  A.equal(x.noInstantSpellEffect,true);
  learned=x.learned;A.equal(Spells.verify(s),true);
 }
 A.equal(learned,true);
 A.equal(s.table.arcaneTechniques[fId].source,Spells.ORIGIN);
 A.equal(s.player.arcane.circles,4);
 rest(s,5);
 const wi=witnessed(s,Spells.CAST,{
  formulaId:fId,
  physicalObservation:'A small self-contained personal Mana calibration indicator is observed; no new power changes the world.',
  environmentalCounter:'A simple change to nearby Mana background weakens the return without harming other people.'});
 const manaPrior=s.player.mana,minutePrior=s.world.minutes;
 const casting=op(s,'formulaCast',{id:fId,witnessIndex:wi});
 A.equal(casting.limitedEffect.includes('no automatic strike'),true);
 A.equal(s.world.minutes,minutePrior+5);
 A.equal(s.player.mana,manaPrior-casting.manaSpent);
 A.equal(Spells.verify(s),true);
 const snapshot=E.exportGame(s),rngPrior=s.rngState;
 A.throws(()=>op(s,'formulaCast',{id:fId,witnessIndex:wi}),
  /cannot be rolled twice|already been|original local formula activity has not been witnessed/);
 A.equal(E.exportGame(s),snapshot);A.equal(s.rngState,rngPrior);
 const tampered=E.importGame(snapshot);
 tampered.table.arcaneArchitecture.formulae.records[fId].study[0].source.roll=20;
 A.equal(Spells.verify(tampered),false);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'beastbound-arcane-high-'));
 try{
  const file=Path.join(dir,'checkpoint.json');FS.writeFileSync(file,snapshot+'\n');
  const request={id:'arcane_formula_view_83001',mode:'rule',system:'arcane',
   operation:'formulaStatus',params:{}};
  const read=Turn.execute(file,request);
  A.equal(read.applied,false);
  A.equal(FS.readFileSync(file,'utf8'),snapshot+'\n');
  const repeat=Turn.execute(file,request);
  A.equal(repeat.applied,false);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
 // Circles V-IX must build on the real Fourth, each with its own observed
 // physical source. The built-in spell grammar remains separate from rank.
 const High=require('../rules/arcane-higher-circles'),
  Cosmos=require('../world/cosmology-ledger');
 const fields={
 5:{measuredRadius:'Measured near-body Mana field decays within a finite observed radius, with the boundary marked and independently tested.',
    ambientCounter:'Existing stone and air pressures interrupt unsupported projection and can collapse the small field.'},
 6:{existingTissue:'The existing human nerve pathways and ordinary forearm tissues are directly examined, not invented into a special organ.',
    nerveResponse:'Observed mundane nerve timing responds to restricted Mana geometry with metabolic stress and no new senses.'},
 7:{layerMeasurement:'An original local astral interference pattern is measured at a physical Circle boundary without entering a spirit realm.',
    identityProtection:'Independent feedback confirms that this experiment cannot read another person or take their identity.'},
 8:{lawManifestation:'The original source-confirmed Origin Pattern is observed through bounded energy response under a real local constraint.',
    observedLawLimit:'A witness confirms that understanding a law does not rewrite it, transcend biology or produce a miracle.'},
 9:{physicalNetwork:'An actual measured local Mana exchange between distinct existing workshop conductors is investigated as a small network.',
    feedbackIsolation:'Isolated individual links fail safely when the environmental network pressure exceeds supported bounds.',
    networkIsolation:'Real prepared laboratory isolation physically separates the body from catastrophic feedback.'}
 };
 const plannedSpellKeys=Object.keys(s.table.arcaneTechniques||{}).sort();
 // An independent less-confident practitioner can suffer real structural
 // overload and must use the original repair check (not a free reset).
 const injured=E.importGame(E.exportGame(s));
 injured.player.attributes.int=12;injured.player.skills.arcana.rank=2;
 injured.player.arcane.coreStability=45;
 const im=witnessed(injured,High.MAP,{
  kind:'field',circle:5,existingChannels:4,
  measuredRadius:'A measured tiny self-contained Mana field reaches only a few observed local paces at low output.',
  ambientCounter:'Ordinary ambient pressure can disrupt the incompletely prepared weak Core field.',
  countertest:'Independent measured channel opposition makes the original incomplete field break under stress.'});
 op(injured,'higherMap',{stage:5,
  design:'A deliberately cautious individual fifth field design preserving three previous channels while measuring unstable fourth output.',
  channelModel:'The previously earned fourth geometry is connected to a small new output branch with independently measured Mana load.',
  interference:'Ambient pressure at the observed laboratory tests weak resonance and can overload the original Core.',
  safety:'The subject stops all projection on actual strain and only seeks separate clinical Arcane matrix repair.',
  witnessIndex:im});
 let overloaded=false;
 for(let i=0;i<8&&!overloaded;i++){
  rest(injured,5);
  const j=witnessed(injured,High.PRACTICE,{
   circle:5,measuredResponse:'An original short-lived measured weak fifth field struggles to carry any additional Mana flux.',
   resistance:'A separate physical interference condition from the room causes possible source-logged overload.'});
  const r=op(injured,'higherWork',{stage:5,witnessIndex:j,minutes:15});
  overloaded=r.check.degree==='severe failure';
 }
 A.equal(overloaded,true,'Original engine stress should sometimes produce severe physical Arcane overload');
 A.ok(op(injured,'higherStatus').stages[0].strain>=3);
 A.equal(High.verify(injured),true);
 let recovered=false;
 for(let i=0;i<10&&!recovered;i++){
  rest(injured,2);
  const j=witnessed(injured,High.REPAIR,{
   circle:5,
   examinedFailure:'The actual recorded Mana matrix strain is examined through physical channel response and measured feedback.',
   restorativeGeometry:'An original small-scale recalibration and controlled energy flow are independently observed under safe load.'});
  const x=op(injured,'higherRepair',{stage:5,witnessIndex:j,minutes:30});
  A.equal(High.verify(injured),true);
  recovered=x.repaired;
 }
 A.equal(recovered,true,'Original witnessed Arcane repair should be possible without an invented healer gate');
 A.ok(op(injured,'higherStatus').stages[0].strain<=4);
 const damaged=E.importGame(E.exportGame(injured));
 damaged.table.arcaneArchitecture.higherCircles.circles[5].repairs.at(-1).source.strainAfter=999;
 A.equal(High.verify(damaged),false,'Forged clinical recovery cannot delete recorded structural overload');
 const lawReg=Cosmos.peek(s)||Cosmos.seed();
 const law=lawReg.planes.mortal.facts.find(x=>x.domain==='origin-pattern'&&x.kind==='law');
 A.ok(law?.seal,'Circle VIII is anchored to an existing true cosmology law, not a fabricated claim');
 A.equal(op(s,'higherStatus').circles,4);
 for(let stage=5;stage<=9;stage++){
  const spec=High.SPEC[stage],initial=s.player.arcane.circles;
  A.equal(initial,stage-1);
  const beforeBad=E.exportGame(s),rngBeforeBad=s.rngState;
  A.throws(()=>op(s,'higherMap',{stage,design:'A named magic circle',
   channelModel:'Unmeasured',interference:'None',safety:'None',
   witnessIndex:0}),/plan needs|source|previous/);
  A.equal(E.exportGame(s),beforeBad);A.equal(s.rngState,rngBeforeBad);
  const extra={
   ...fields[stage],kind:spec.kind,circle:stage,
   existingChannels:s.player.arcane.channels,
   countertest:'Original independent pressure and controlled collapse measurements limit the proposed new Circle geometry.',
   ...(stage===8?{lawSeal:law.seal}:{})
  };
  const wi=witnessed(s,High.MAP,extra);
  const details={
   stage,
   design:'An individually constructed '+spec.name+' Circle with original observed feedback across the existing channels and a reversible controlled geometry under distinct physical interference.',
   channelModel:'Every already earned channel remains connected to the same genuine Mana Core while a new bounded structural layer is being developed.',
   interference:'Real excess Mana flow, ambient opposition, individual tissue or geometric mismatch can collapse this architecture.',
   safety:'The practitioner observes failure limits and avoids uncontrolled environmental, spiritual, personal or biological claims.',
   witnessIndex:wi,
   ...(stage===8?{lawRef:{planeId:'mortal',domain:'origin-pattern'}}:{})
  };
  A.equal(op(s,'higherMap',details).mapped,true);
  A.equal(High.verify(s),true);
  A.equal(s.player.arcane.circles,stage-1);
  let ready=false;
  for(let attempt=0;attempt<12&&!ready;attempt++){
   rest(s,spec.minuteCost);
   const practiceIndex=witnessed(s,High.PRACTICE,{
    circle:stage,kind:spec.kind,
    measuredResponse:'A separate real training attempt tests the correct original Mana structure against measured local pressure.',
    resistance:'An actual independently witnessed environmental or biological limit prevents an invented unbounded magical response.'});
   const priorMana=s.player.mana,start=s.world.minutes;
   const training=op(s,'higherWork',{stage,witnessIndex:practiceIndex,minutes:15});
   A.equal(s.world.minutes,start+15);
   A.equal(s.player.mana,priorMana-training.manaSpent);
   A.equal(training.noFreeSpell,true);
   A.equal(High.verify(s),true);
   ready=training.points>=training.required;
  }
  A.ok(ready,'Stage '+stage+' must be earned with original checks');
  let passed=false;
  for(let attempt=0;attempt<12&&!passed;attempt++){
   rest(s,spec.minuteCost+4);
   const challengeIndex=witnessed(s,High.TEST,{
    circle:stage,kind:spec.kind,
    independentCountertest:'A genuinely new physical opponent pressure, local ambient change or structural challenge tests this individual Circle.',
    limitObserved:'The original witnessed result shows a bounded structural response rather than free magic or world law rewriting.'});
   const mana=s.player.mana,max=s.player.maxMana,tick=s.world.minutes,
    result=op(s,'higherComplete',{stage,witnessIndex:challengeIndex,minutes:90});
   A.equal(result.attempted,true);
   A.equal(s.player.mana,mana-result.manaSpent);
   A.equal(s.world.minutes,tick+90);
   A.equal(result.noAutomaticSpellOrOverriddenWorldLaw,true);
   passed=result.formed;
   if(passed){
    A.equal(s.player.arcane.circles,stage);
    const profile=R.build.arcaneProfile(stage);
    A.equal(s.player.arcane.channels,profile.channels);
    A.equal(s.player.maxMana,Math.max(max,profile.mana));
   }
   A.equal(High.verify(s),true);
  }
  A.equal(passed,true,'Actual original Stage '+stage+' structural work should become achievable');
  A.deepEqual(Object.keys(s.table.arcaneTechniques||{}).sort(),plannedSpellKeys);
  A.equal(s.player.humanEvolution.stage,0);
  A.equal(s.player.meridian.stage,0);
  A.equal(s.player.soul.phase,0);
  A.equal(s.player.origin.stableTraits.length,0);
  A.equal(High.verify(E.importGame(E.exportGame(s))),true);
 }
 A.equal(s.player.arcane.circles,9);
 A.equal(op(s,'higherStatus').stages.length,5);
 const fullSave=E.exportGame(s),derived=E.importGame(fullSave);
 derived.table.arcaneArchitecture.higherCircles.circles[9].transition.source.capacity.newMana+=900;
 A.equal(High.verify(derived),false);
 // An original named attack or World Circuit idea can be mapped and studied
 // within the real formula grammar but cannot manufacture a combat adapter.
 const harmful='bounded_original_mana_strike';
 const wAttack=witnessed(s,Spells.MAP,{
  formulaId:harmful,
  observedGeometry:'An original high-circle branch geometry is measured separately without claiming actual physical attack or damage.',
  knownFailure:'The studied unexecuted combat concept lacks independently verified target harm and real defence contests.'});
 const combatPlan=op(s,'formulaMap',{id:harmful,name:'Hypothetical Focused Mana Strike',
  form:{family:'strike',damage:8,rng:'close',area:'single',duration:'instant',magnitude:0},
  channels:[1,2,3],
  mechanism:'A freely imagined and physically plausible designed spell combines three original channels to focus bounded Mana pressure.',
  limit:'No damage is learned until a real separately witnessed source, casting target and combat contest are implemented.',
  interferenceSource:'Independent resistance, unprepared targets and actual Mana pressure can disrupt the unfinished design.',
  witnessIndex:wAttack});
 A.equal(combatPlan.mapped,true);A.equal(combatPlan.effectAdapterAvailable,false);
 const frozen=E.exportGame(s),freezeRng=s.rngState;
 A.throws(()=>op(s,'formulaCast',{id:harmful,witnessIndex:wAttack}),
  /not authentically recorded|originally learned|not authentically/);
 A.equal(E.exportGame(s),frozen);A.equal(s.rngState,freezeRng);
 A.equal(Spells.verify(s),true);
}
console.log('Higher Arcane: earned Third Matrix, genuine Fourth Dynamic Circle, original multi-channel grammar, real study/cast costs and saved-source provenance without invented effects');
