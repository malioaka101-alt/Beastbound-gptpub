'use strict';
// Disposable, genuinely-earned Soul I–VII source/identity integration.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 C=require('../rules/core'),Build=require('../rules/build'),
 Thread=require('../rules/soul-threading'),Lattice=require('../rules/soul-resonance-lattice'),
 High=require('../rules/soul-higher-architecture'),
 Power=require('../rules/power-overview'),Turn=require('../scripts/chat-turn');
const act=(s,name,params={})=>R.act(s,{system:'soul',operation:name,params});
function observed(s,origin,details={}){
 C.event(s,'story','An independent original physical and spiritual observation tests this individual person’s Soul identity and bounded structure.',{
  origin,location:s.world.location,...details});
 return s.log.length-1;
}
function recovered(s,min){
 let n=0;
 while(s.player.soul.reserve<min||s.player.stamina<6){
  A.ok(n++<18,'Existing overnight Soul reserve recovery should support authentic independent training');
  const before=s.world.minutes,old=s.player.soul.reserve;
  const r=R.act(s,{system:'health',operation:'sleep',params:{hours:8}});
  A.equal(r.sleptHours,8);
  A.equal(s.world.minutes,before+480);
  A.equal(s.player.soul.reserve,Math.min(s.player.soul.maxReserve,old+3));
  if(s.player.soul.reserve<min)
   R.act(s,{system:'world',operation:'wait',params:{minutes:960}});
 }
}
function originalPhase3(seed=875001){
 const s=E.newGame({seed,name:'Ethical Soul Architecture',path:'undecided'});
 R.unified.ensurePlayer(s);s.world.location='academy';
 s.player.attributes.wis=30;s.player.skills.cultivation.rank=5;
 s.player.soul.phase=1;s.player.soul.stability=100;
 const p=Build.soulProfile(1,{will:10});
 s.player.soul.maxReserve=p.soulReserve;
 s.player.soul.reserve=p.soulReserve;
 s.player.soul.perceptionRange=p.perceptionRangeMetres;
 s.table.disciplineTraining||={};
 s.table.disciplineTraining.soul={target:null,points:0,weeks:0,
  methods:{},cooldownUntil:0,complications:[],history:[{
   day:1,target:'phase1',quality:'strong',
   change:'Phase I Soul Perception; first stable perception'}]};
 let second=false;
 for(let i=0;i<9&&!second;i++)
  second=act(s,'threadWork',{focus:'integrated',minutes:15,
   approach:'Self-observed original mind-body and personal identity reinforcement without influencing any other soul'}).formed;
 A.equal(second,true);
 A.equal(Thread.earned(s).phase,2);
 const wi=observed(s,Lattice.MAP,{
  observedSelfResonance:'The real earned mind–body threads show a separately measured protective individual resonance pattern.',
  identityCountertest:'The subject voluntarily stops this individual resonance without exposing memories or involving another soul.'});
 act(s,'latticeMap',{name:'Personal Independent Resonance',
  resonancePattern:'The observed original three integrated spiritual links carry a bounded personal protective standing wave.',
  identityBoundary:'The independent practitioner retains their own memory and the option to stop spiritual pressure at will.',
  communicationLimit:'The internal lattice does not grant communication with other people or access to any private information.',
  interference:'Other spiritual pressure may disrupt this particular self-resonance and cause real instability or injury.',
  repairMethod:'A newly observed low-load self-resonance correction can recover the original measured pattern gradually.',
  witnessIndex:wi});
 let ready=false;
 for(let i=0;i<8&&!ready;i++){
  recovered(s,2);
  const ix=observed(s,Lattice.PRACTICE,{
   observedFeedback:'The individual observes restrained measured return waves in the already source-earned inner spiritual links.',
   voluntaryStop:'A clear independent self-initiated stopping action interrupts the pattern without influencing other minds.'});
  const x=act(s,'latticePractice',{witnessIndex:ix,minutes:15});
  ready=x.progress>=x.needed;
 }
 A.equal(ready,true);
 let third=false;
 for(let i=0;i<6&&!third;i++){
  recovered(s,4);
  const ix=observed(s,Lattice.FORM,{
   independentResponse:'The original protective self-standing wave remains stable during a measured independent pressure countertest.',
   identityBoundaryProof:'The same human person retains identity and stops the entire personal resonance without accessing anyone else.'});
  third=act(s,'latticeComplete',{witnessIndex:ix,minutes:90}).formed;
 }
 A.equal(third,true);
 A.equal(s.player.soul.phase,3);
 A.equal(Lattice.verify(s),true);
 return s;
}
{
 const s=originalPhase3(),original=E.exportGame(s),rng=s.rngState;
 A.equal(act(s,'higherStatus').phase,3);
 A.deepEqual(act(s,'higherStatus').stages,[]);
 A.equal(E.exportGame(s),original);A.equal(s.rngState,rng);
 const docs={
 4:{
  nonSentientMatrix:'A separately measured self-constructed, non-sentient spiritual scaffold has no captive mind or artificial person.',
  vesselCompatibility:'Observed local harmless vessel geometry can support a bounded non-sentient matrix without imported souls.',
  nonSentient:true},
 5:{
  internalBoundary:'The practitioner’s original protected interior sanctuary has an independently measured self-contained boundary.',
  identityCountertest:'The individual stops the sanctuary echo and remains themselves without exposing anyone else’s memory.'},
 6:{
  measuredRange:'An original personally projected limited spiritual field decreases with distance and can be measured locally.',
  independentResistance:'Environmental changes and separately observed interference can collapse the bounded personal domain.',
  measuredRangeMetres:3},
 7:{
  sustainedFeedback:'Distinct original self-supporting spiritual links continue their observed return loop under a controlled load.',
  maintenanceFailure:'The personally maintained spiritual architecture collapses without compatible reserve and bodily stability.',
  selfMaintenance:'A separately observed low-pressure self-repair regimen consumes real personal energy, effort and time.'}
 };
 const formed=[];
 for(let phase=4;phase<=7;phase++){
  const spec=High.SPEC[phase],basis=docs[phase];
  A.equal(s.player.soul.phase,phase-1);
  const before=E.exportGame(s),beforeRng=s.rngState;
  A.throws(()=>act(s,'higherMap',{
   phase,design:'This is a magical rank with no original mechanism',
   identityBoundary:'None',ethicalLimit:'None',interference:'None',
   repairMethod:'None',witnessIndex:0}),/original Soul Phase|self-structure|original|observed/);
  A.equal(E.exportGame(s),before);A.equal(s.rngState,beforeRng);
  const witness=observed(s,High.MAP,{
   phase,kind:spec.kind,
   countertest:'A separate independent physical countermeasure shows a real failure boundary without changing any external soul.',
   ...basis});
  const mapped=act(s,'higherMap',{phase,
   design:'An individually earned '+spec.name+' architecture develops self-reversible original spiritual connections through previously proved identity-safe source structures.',
   identityBoundary:'The actual practitioner preserves individual memory, independent personhood and the right to stop or refuse outside intervention.',
   ethicalLimit:'No sentient donor, compelled relationship, involuntary memory copy, resurrection or mindreading is created by this phase alone.',
   interference:'Real unsuitable source resonance or excessive Soul energy can destabilise the current personal spiritual structure.',
   repairMethod:'Independent original observed low-load self-correction can reduce actual structural damage with normal Soul reserves.',
   witnessIndex:witness});
  A.equal(mapped.mapped,true);A.equal(mapped.noSentientSoulOrOtherPersonControl,true);
  A.equal(High.verify(s),true);
  let trained=false;
  for(let i=0;i<10&&!trained;i++){
   recovered(s,spec.cost);
   const ix=observed(s,High.PRACTICE,{phase,
    observedResponse:'A new original restrained safe spiritual architecture repetition produces a measurable individual response.',
    independentBoundary:'The voluntary owner stops the response under independently measured interference without coercing anyone.'});
   const reserve=s.player.soul.reserve,worldMinute=s.world.minutes;
   const result=act(s,'higherPractice',{phase,witnessIndex:ix,minutes:15});
   A.equal(result.reserveSpent,spec.cost);
   A.equal(s.player.soul.reserve,reserve-result.reserveSpent);
   A.equal(s.world.minutes,worldMinute+15);
   A.equal(result.noAutomaticMindreadingBindingOrMedicalPower,true);
   A.equal(High.verify(s),true);
   trained=result.points>=result.needed;
  }
  A.equal(trained,true,'Actual Phase '+phase+' training should earn real original structure');
  A.equal(s.player.soul.phase,phase-1);
  let success=false;
  for(let i=0;i<10&&!success;i++){
   recovered(s,spec.cost+3);
   const ix=observed(s,High.TEST,{phase,
    actualFunction:'The individual original Soul architecture performs its intended personally bounded function in an actual independent test.',
    failureLimit:'A separately observed identity or energy stress interrupts the structure rather than granting unearned magic.',
    identityPreservation:'The living person remains independently themselves and voluntarily closes the original self-structure.'});
   const at=s.world.minutes,reserve=s.player.soul.reserve,max=s.player.soul.maxReserve;
   const outcome=act(s,'higherComplete',{phase,witnessIndex:ix,minutes:90});
   A.equal(outcome.attempted,true);
   A.equal(s.world.minutes,at+90);
   A.equal(s.player.soul.reserve,reserve-outcome.reserveSpent);
   A.equal(outcome.noAutomaticSoulCraftMindReadingOrResurrection,true);
   success=outcome.formed;
   if(success){
    A.equal(s.player.soul.phase,phase);
    A.equal(s.player.soul.maxReserve,Math.max(max,Build.soulProfile(phase,{will:10}).soulReserve));
   }
   A.equal(High.verify(s),true);
  }
  A.equal(success,true,'Actual Source-earned Phase '+phase+' must be attainable');
  A.equal(Thread.earned(s).concentrationBonus,2);
  A.equal(Lattice.verify(s),true);
  A.equal(Power.read(s).soul.higherArchitecture.phase,phase);
  A.equal(s.player.humanEvolution.stage,0);
  A.equal(s.player.arcane.circles,0);
  A.equal(s.player.meridian.stage,0);
  A.equal(s.player.soul.maxReserve>=Build.soulProfile(phase,{will:0}).soulReserve,true);
  A.equal(High.verify(E.importGame(E.exportGame(s))),true);
  formed.push(phase);
 }
 A.deepEqual(formed,[4,5,6,7]);
 A.equal(act(s,'higherStatus').next,null);
 A.equal(act(s,'higherStatus').stages.length,4);
 const snapshot=E.exportGame(s),copy=E.importGame(snapshot);
 A.equal(High.verify(copy),true);
 copy.table.soulArchitecture.higher.records[7].transition.source.capacity.newReserve+=100;
 A.equal(High.verify(copy),false);
 const altered=E.importGame(snapshot);
 altered.table.soulArchitecture.higher.records[6].attempts[0].source.points=100;
 A.equal(High.verify(altered),false);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-higher-soul-'));
 try{
  const file=Path.join(dir,'test.json');FS.writeFileSync(file,snapshot+'\n');
  const req={id:'soul_higher_status_875001',mode:'rule',system:'soul',
   operation:'higherStatus',params:{}};
  A.equal(Turn.execute(file,req).applied,false);
  A.equal(Turn.execute(file,req).applied,false);
  A.equal(FS.readFileSync(file,'utf8'),snapshot+'\n');
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
{
 const s=originalPhase3(875005),spec=High.SPEC[4];
 const wi=observed(s,High.MAP,{phase:4,kind:spec.kind,
  nonSentientMatrix:'An actual prepared empty compatible soul-wave frame is measured without requiring a sapient donor.',
  vesselCompatibility:'A small observed harmless inert substrate can temporarily support personal resonance under modest pressure.',
  nonSentient:true,
  countertest:'An independent pressure interruption causes the empty non-sentient matrix to collapse harmlessly.'});
 act(s,'higherMap',{phase:4,
  design:'An initial low-intensity personal Soul Forge experiment builds only a simple non-sentient structural frame.',
  identityBoundary:'No identity transfer or alteration is attempted and the individual practitioner retains full control.',
  ethicalLimit:'No captive intelligence, donor soul or involuntary personhood is created through this private exercise.',
  interference:'The early empty soul-wave matrix may buckle under mismatched independently observed pressure.',
  repairMethod:'A separate measured reduction in spiritual load can restore actual original self-structure integrity.',
  witnessIndex:wi});
 s.player.attributes.wis=10;s.player.skills.cultivation.rank=0;
 let harmed=false;
 for(let i=0;i<12&&!harmed;i++){
  recovered(s,spec.cost);
  const ix=observed(s,High.PRACTICE,{phase:4,
   observedResponse:'A weak real personal soul-wave matrix deforms under independent pressure without affecting any other being.',
   independentBoundary:'The subject can stop the personal experiment before any unconsented external spiritual target is touched.'});
  const r=act(s,'higherPractice',{phase:4,witnessIndex:ix,minutes:15});
  harmed=r.check.degree==='severe failure';
 }
 A.equal(harmed,true,'Low-capability real Soul Forge work must allow actual structural setbacks');
 A.ok(act(s,'higherStatus').stages[0].strain>=3);
 A.ok(s.player.soul.stability<100);
 s.player.attributes.wis=30;s.player.skills.cultivation.rank=5;
 recovered(s,2);
 const ix=observed(s,High.REPAIR,{phase:4,
  diagnosis:'An actual previously documented spiritual matrix displacement disrupts the individual protective waveform.',
  recoveryMethod:'An independently measured small personal load correction rebalances the original non-sentient framework.'});
 const r=act(s,'higherRepair',{phase:4,witnessIndex:ix,minutes:15});
 A.equal(r.repaired,true);
 A.equal(High.verify(s),true);
 const forged=E.importGame(E.exportGame(s));
 forged.table.soulArchitecture.higher.records[4].repairs[0].source.strainAfter=100;
 A.equal(High.verify(forged),false);
}
console.log('Soul Phase IV–VII: original earned Phase III, identity-safe non-sentient Soul Forge, Sanctuary, bounded Domain and maintained living architecture, actual costs/checks, repair and saved replay');
