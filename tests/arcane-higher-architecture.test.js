'use strict';
// Disposable first/second/third Circle source chain -> original Dynamic IV;
// independent grammar-derived formula experiments, honest costs and replay.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),
 R=require('../rules'),C=require('../rules/core'),Turn=require('../scripts/chat-turn'),
 D=require('../rules/disciplines'),Higher=require('../rules/arcane-higher-architecture'),
 Formula=require('../rules/arcane-source-formulas');
const FIRST='Measured First Circle built from a stable sixfold Mana Core return geometry';
const SECOND='Counter-rotating paired Circle return loops preserving the original formula anchor and a stable second channel';
const THIRD='Three independent Circle paths cross-couple through a stable return matrix with measured resonance counterloop and self-correcting formula feedback';
const op=(s,k,p={})=>R.act(s,{system:'arcane',operation:k,params:p});
function restoreMana(s,needed){
 let n=0;
 while(s.player.mana<needed){
  A.ok(n++<12,'Safe original resting should recover enough real Mana');
  const old=s.world.minutes,mana=s.player.mana;
  const r=R.act(s,{system:'health',operation:'sleep',params:{}});
  A.equal(r.sleptHours,8);
  A.equal(s.world.minutes-old,480);
  A.equal(s.player.mana,Math.min(s.player.maxMana,mana+12));
  if(s.player.mana<needed)R.act(s,{system:'world',operation:'wait',
   params:{minutes:960}});
 }
}
function three(seed=614001){
 const s=E.newGame({seed,name:'Arcane IV disposable source scholar',path:'arcane'});
 R.unified.ensurePlayer(s);s.world.location='academy';
 s.player.attributes.int=24;s.player.skills.arcana.rank=5;
 s.player.arcane.coreIgnited=true;s.player.arcane.circles=1;
 s.player.arcane.geometry=FIRST;
 const p=R.build.arcaneProfile(1),a=s.player.arcane;
 a.structuredMana=p.mana;a.channels=p.channels;a.maxComplexity=p.maxComplexity;
 s.table.disciplineTraining||={};
 s.table.disciplineTraining.arcane={target:null,points:0,weeks:0,
  methods:{},cooldownUntil:0,complications:[],history:[
  {day:1,target:'core',quality:'strong',change:'Mana Core ignited, no Circle yet'},
  {day:1,target:'circle1',quality:'strong',change:'First Circle constructed; '+FIRST}
 ]};
 for(let i=0;i<12&&a.circles<2;i++){
  restoreMana(s,6);
  op(s,'circleWork',{design:SECOND,minutes:15});
 }
 A.equal(a.circles,2);
 for(let i=0;i<12&&a.circles<3;i++){
  restoreMana(s,6);
  op(s,'matrixWork',{design:THIRD,focus:'integrated',minutes:15});
 }
 A.equal(a.circles,3,'Earlier original Circle III must be earned by the existing engine');
 A.equal(D.verifyThirdCircle(s).number,3);
 A.equal(Higher.verify(s),true);
 return s;
}
{
 const s=E.newGame({seed:614000,name:'False Circle researcher',path:'arcane'});
 const before=E.exportGame(s),rng=s.rngState;
 A.equal(op(s,'dynamicStatus').available,false);
 A.throws(()=>op(s,'dynamicMap',{id:'free_rank'}),/Fourth Circle map/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=three(),a=s.player.arcane;
 const originalGeometry=a.geometry,originalMatrix=a.matrixGeometry,
  oldManaCap=s.player.maxMana,learned=structuredClone(s.table.arcaneTechniques||{});
 const baseline=E.exportGame(s),rng=s.rngState;
 A.deepEqual(op(s,'dynamicStatus').plans,[]);
 A.deepEqual(op(s,'formulaStatus').formulas,[]);
 A.equal(E.exportGame(s),baseline);A.equal(s.rngState,rng);
 const id='dynamic_relay_layer';
 A.throws(()=>op(s,'dynamicMap',{id,
  name:'Dynamic fourth loop',geometry:THIRD,
  switching:'Four anchored returns switch the existing matrix under controlled load',
  returnFeedback:'Original feedback compensates for a minor field perturbation',
  interference:'Independent return channels are not permitted to overlap unstably',
  failureMode:'On overload the fourth channel returns mana into the core and fails',
  limits:'No freely invented spell or unmeasured dynamic reaction is created',
  load:2,witnessIndex:0}),/genuinely witnessed current local/);
 A.equal(E.exportGame(s),baseline);
 C.event(s,'story',
  'The original matrix researcher observes a distinct fourth dynamic return channel and an independent countertest for resonance feedback.',{
   origin:Higher.MAP,location:s.world.location,planId:id,
   measuredSwitching:'An independently measured adjustable fourth return re-routes only the same existing original three-circle geometry.',
   independentCountertest:'The return switches fail safely against reversed phase pressure with measurable interference.'});
 const mapped=op(s,'dynamicMap',{id,
  name:'Responsive Fourth-Loop Architecture',
  geometry:'The third anchored triangular matrix gains a physically separate, monitored and retunable fourth return braid',
  switching:'Original return contacts retune between measured mana channel configurations under gradual pressure changes',
  returnFeedback:'An independently measured counterloop returns resonant feedback without adding Mana from nowhere',
  interference:'Under incompatible phase pressure the new return current breaks symmetry and loses structural coherence',
  failureMode:'The fourth channel safely collapses while old verified Core and Matrix remain structurally independent',
  limits:'The dynamic design provides physical channel capability, not any predetermined elemental effect or spell',
  load:2,witnessIndex:s.log.length-1});
 A.equal(mapped.mapped,true);A.equal(mapped.noNewCircleOrSpell,true);
 A.equal(Higher.verify(s),true);
 A.equal(a.circles,3);
 const snapshot=E.exportGame(s),oldRng=s.rngState;
 A.throws(()=>op(s,'dynamicMap',{id,
  name:'Duplicate Dynamic',geometry:THIRD,
  switching:'The same original anchor switches with its previous phase countertest',
  returnFeedback:'The same real mana loop gives the same feedback and cost',
  interference:'The same internal channel conflict persists under stress',
  failureMode:'A duplicate cannot create an independently witnessed other channel',
  limits:'Cannot grant a free new spell or automatically completed Circle',
  load:2,witnessIndex:s.log.length-1}),/already exists/);
 A.equal(E.exportGame(s),snapshot);A.equal(s.rngState,oldRng);
 let ready=false;
 for(let i=0;i<12&&!ready;i++){
  restoreMana(s,9);
  C.event(s,'story',
   'A distinct original physical study resolves a new fourth return switching trial against real interference.',{
    origin:Higher.WORK,location:s.world.location,planId:id,
    observedRouting:'A separate measured channel switch successfully feeds the original matrix under a known load.',
    observedInterference:'The observed return encounters measurable phase noise and cannot route without real Mana.'});
  const before=s.world.minutes,mana=s.player.mana;
  const r=op(s,'dynamicWork',{id,witnessIndex:s.log.length-1,minutes:30});
  A.equal(s.player.mana,mana-r.manaSpent);
  A.equal(s.world.minutes,before+30);
  A.equal(r.noAutomaticSpell,true);
  A.equal(Higher.verify(s),true);
  ready=r.progress>=r.required;
 }
 A.equal(ready,true,'An actual earned dynamic loop needs separately resolved work');
 A.equal(a.circles,3);
 restoreMana(s,14);
 C.event(s,'story',
  'The fourth-circle candidate demonstrates real-time channel retuning and countertests independent resonance failure.',{
   origin:Higher.TRIAL,location:s.world.location,planId:id,
   changedCircuit:'The fourth return braid changes a monitored circuit while keeping the earlier three-circle matrix intact.',
   failureResponse:'An independent reverse-pressure test proves the fourth loop can collapse without generating an unearned spell.'});
 const beforeTime=s.world.minutes,mana=s.player.mana,
  maxMana=s.player.maxMana,original=s.table.arcaneArchitecture.circle3;
 const result=op(s,'dynamicForm',{id,witnessIndex:s.log.length-1,minutes:90});
 A.equal(result.formed,true);
 A.equal(a.circles,4);
 A.equal(result.noNewSpellGranted,true);
 A.equal(s.player.mana,mana-result.manaSpent);
 A.equal(s.world.minutes,beforeTime+90);
 A.ok(s.player.maxMana>=maxMana);
 A.equal(a.geometry,originalGeometry);
 A.equal(a.matrixGeometry,originalMatrix);
 A.deepEqual(s.table.arcaneArchitecture.circle3,original);
 A.equal(s.player.humanEvolution.stage,0);
 A.deepEqual(s.table.arcaneTechniques||{},learned);
 A.equal(R.build.arcaneProfile(4).channels,a.channels);
 A.equal(Higher.verify(s),true);
 A.equal(R.act(s,{system:'power',operation:'status',params:{}}).arcane.dynamic.dynamicArchitecture,'formed');
 A.equal(R.act(s,{system:'arcane',operation:'dualChannelStatus',params:{}}).architectureEarned,true);
 const saved=E.exportGame(s),copy=E.importGame(saved);
 A.equal(Higher.verify(copy),true);
 copy.table.arcaneArchitecture.dynamic.history[0].source.capacity.newMana+=77;
 A.equal(Higher.verify(copy),false);
 const corrupt=E.importGame(saved);
 corrupt.player.arcane.channels=9;
 A.equal(Higher.verify(corrupt),false);
 const formulaId='self_pressure_sense';
 const grammar={family:'sense',rng:'self',area:'single',
  duration:'instant',magnitude:0,conditions:0,extraTargets:0,speed:'standard'};
 const spec=R.build.spellCost(grammar);
 A.equal(spec.mana,1);
 const beforeFormula=E.exportGame(s),rngBeforeFormula=s.rngState;
 A.throws(()=>op(s,'formulaMap',{id:formulaId,name:'unsupported',
  geometry:THIRD,method:'Invented result',observedEffect:'This has never occurred',
  interference:'No physical source explains the phase',
  counter:'There is no independent counter available',
  failureBoundary:'No real bound has been observed',
  grammar:{...grammar,complexity:-1},channels:[1],witnessIndex:0}),
 /original formula needs|original Arcane spell grammar|Invalid|specific original formula/);
 A.equal(E.exportGame(s),beforeFormula);A.equal(s.rngState,rngBeforeFormula);
 C.event(s,'story',
  'The trained mage documents a real personally observed self-pressure sensory formula and how its return is disturbed.',{
   origin:Formula.MAP,location:s.world.location,formulaId,
   experiment:'The documented sensing equation routes mana through the previously earned fourth channel without creating a new organ.',
   independentCountertest:'An independent shielding layer blocks the sensory return while ordinary mana loss remains measurable.'});
 const m=op(s,'formulaMap',{id:formulaId,
  name:'Self Pressure-Sense Calibration',
  geometry:'A measured self-referential mana probe is returned through the validated fourth circle channel and shared Core',
  method:'Original repeated safe non-invasive calibration of a narrow self-pressure sense formula',
  observedEffect:'Only the existing bodily mana pressure changes can be tested; no external creature knowledge is generated',
  interference:'A nearby grounded resistance layer interrupts the narrow sensed return phase',
  counter:'The original independent shielding countertest blocks the returned signal without affecting other beings',
  failureBoundary:'If unstable, the formula disperses its mana and yields no effect beyond recorded strain',
  grammar,channels:[1,2],witnessIndex:s.log.length-1});
 A.equal(m.authored,true);A.equal(m.manaCost,spec.mana);
 A.equal(m.automaticallyLearned,false);
 A.equal(Formula.verify(s),true);
 let studied=false;
 for(let i=0;i<10&&!studied;i++){
  restoreMana(s,6);
  C.event(s,'story',
   'A distinct original Arcane self-pressure formula experiment is measured against an independent Mana-sink interference source.',{
    origin:Formula.WORK,location:s.world.location,formulaId,
    measuredFeedback:'A repeated self-sensing return proves the formula has a measured geometric phase and actual Mana loss.',
    failureComparison:'The sink reduces measured signal coherence, showing how the same prototype can fail without imaginary targets.'});
  const before=s.world.minutes;
  const r=op(s,'formulaWork',{id:formulaId,witnessIndex:s.log.length-1,minutes:30});
  A.equal(s.world.minutes,before+30);
  A.equal(r.noAutomaticCastingEffect,true);
  studied=r.progress>=r.required;
  A.equal(Formula.verify(s),true);
 }
 A.equal(studied,true,'Actual independent source-backed work should earn experimental formula readiness');
 restoreMana(s,5);
 C.event(s,'story',
  'The original researcher runs a bounded non-combat sensory probe, measuring its Mana cost and shielding countertest.',{
   origin:Formula.PROBE,location:s.world.location,formulaId,
   observedStability:'The existing source-verified circle geometry sustains a short safely measured mana pressure probe.',
   observedCounter:'The previously observed independent shielding response continues to interrupt the probe under interference.'});
 const prevMana=s.player.mana,prevTime=s.world.minutes,ix=s.log.length-1;
 const probe=op(s,'formulaProbe',{id:formulaId,witnessIndex:ix,minutes:30});
 A.equal(probe.proven,true);
 A.equal(probe.manaSpent,spec.mana);
 A.equal(s.player.mana,prevMana-spec.mana);
 A.equal(s.world.minutes,prevTime+30);
 A.equal(probe.noAutomaticCombatSpellOrUnverifiedTargetEffect,true);
 A.equal(Formula.verify(s),true);
 const once=E.exportGame(s),beforeOnce=s.rngState;
 A.throws(()=>op(s,'formulaProbe',{id:formulaId,witnessIndex:ix,minutes:30}),
  /already.*witness|not demonstrated|countertested locally/);
 A.equal(E.exportGame(s),once);A.equal(s.rngState,beforeOnce);
 const savedFormula=E.exportGame(s);
 const altered=E.importGame(savedFormula);
 altered.table.arcaneFormulas.items[formulaId].source.cost.mana=0;
 A.equal(Formula.verify(altered),false);
 const altered2=E.importGame(savedFormula);
 altered2.table.arcaneFormulas.items[formulaId].proven=false;
 A.equal(Formula.verify(altered2),false);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-higher-arcane-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,savedFormula+'\n');
  const req={id:'higher_arcane_view_614001',mode:'rule',system:'arcane',
   operation:'formulaStatus',params:{}};
  A.equal(Turn.execute(file,req).applied,false);
  A.equal(Turn.execute(file,req).applied,false);
  A.equal(FS.readFileSync(file,'utf8'),savedFormula+'\n');
 }finally{FS.rmSync(dir,{force:true,recursive:true});}
}
console.log('Arcane IV/grammar: original three-circle source; actual dynamic architecture checks, true Mana and Stamina costs, independently learned and probed formula, original Circle spell grammar, tamper and read-only replay.');
