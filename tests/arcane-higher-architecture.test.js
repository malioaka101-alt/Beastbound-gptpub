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
}
console.log('Higher Arcane: earned Third Matrix, genuine Fourth Dynamic Circle, original multi-channel grammar, real study/cast costs and saved-source provenance without invented effects');
