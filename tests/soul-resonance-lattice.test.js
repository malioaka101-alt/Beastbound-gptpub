'use strict';
// Foundation #12: original Soul Phase II -> source-earned personal Phase III.
// No invented person consent, mindreading, compulsory teacher or campaign file.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),C=require('../rules/core'),
 Build=require('../rules/build'),Thread=require('../rules/soul-threading'),
 Lattice=require('../rules/soul-resonance-lattice'),
 Senses=require('../rules/first-stage-senses'),
 Power=require('../rules/power-overview'),Turn=require('../scripts/chat-turn');
const act=(s,k,p={})=>R.act(s,{system:'soul',operation:k,params:p});
function first(seed=874401){
 const s=E.newGame({seed,name:'Disposable Source-Earned Personal Soul',path:'undecided',background:'healer'});
 R.unified.ensurePlayer(s);
 s.world.location='academy';s.player.attributes.wis=30;
 s.player.skills.cultivation.rank=5;
 s.player.soul.phase=1;s.player.soul.stability=100;
 const p=Build.soulProfile(1,{will:10});
 s.player.soul.maxReserve=p.soulReserve;
 s.player.soul.reserve=p.soulReserve;
 s.player.soul.perceptionRange=p.perceptionRangeMetres;
 s.table.disciplineTraining||={};
 s.table.disciplineTraining.soul={target:null,points:0,weeks:0,
  methods:{},cooldownUntil:0,complications:[],history:[
   {day:1,target:'phase1',quality:'strong',
    change:'Phase I Soul Perception; first stable perception'}
  ]};
 return s;
}
function second(seed=874401){
 const s=first(seed);let earned=false;
 for(let i=0;i<8&&!earned;i++)
  earned=act(s,'threadWork',{focus:'integrated',minutes:15,
   approach:'Coordinate the original individual mind, body and spiritual identity without influencing any other person'}).formed;
 A.equal(earned,true,'Prior Phase II must actually complete through original Soul Threading checks');
 A.equal(s.player.soul.phase,2);
 A.equal(Thread.earned(s).phase,2);
 return s;
}
function witnessed(s,origin,details={}){
 C.event(s,'story',
 'The practitioner witnesses their own previously established spiritual structure during a physically restrained identity-safeguarded test.',{
  origin,location:s.world.location,...details});
 return s.log.length-1;
}
function rest(s,min){
 let days=0;
 while(s.player.soul.reserve<min||s.player.stamina<5){
  A.ok(days++<12,'Actual overnight Soul and Stamina recovery should be enough');
  const before=s.world.minutes,old=s.player.soul.reserve;
  R.act(s,{system:'health',operation:'sleep',params:{hours:8}});
  A.equal(s.world.minutes,before+480);
  A.equal(s.player.soul.reserve,Math.min(s.player.soul.maxReserve,old+3));
  if(s.player.soul.reserve<min)
   R.act(s,{system:'world',operation:'wait',params:{minutes:960}});
 }
}
{
 const s=first(874400),before=E.exportGame(s),rng=s.rngState;
 A.equal(act(s,'latticeStatus').ready,false);
 A.throws(()=>act(s,'latticeMap',{}),/design needs|Phase II/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=second(),p=s.player;
 const before=E.exportGame(s),rng=s.rngState;
 A.equal(act(s,'latticeStatus').ready,true);
 A.equal(act(s,'latticeStatus').formed,false);
 A.equal(Power.read(s).soul.lattice.ready,true);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const invalid={name:'Bounded Inner Resonance',
  resonancePattern:'The original mind-body-soul thread stabilises a small measurable self-resonant protective standing wave.',
  identityBoundary:'Every experiment preserves the original identity and tests an independent voluntary stopping response.',
  communicationLimit:'There is no automatic communication with or access to another person’s thoughts, memories or soul.',
  interference:'Unfamiliar spiritual pressure disrupts the observed pattern and can cause a real identity resonance backlash.',
  repairMethod:'The individual can apply independently observed small correction pulses after diagnosing the original strain.',
  witnessIndex:0};
 A.throws(()=>act(s,'latticeMap',invalid),/personally witnessed|self-observation|actual/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const wi=witnessed(s,Lattice.MAP,{
  observedSelfResonance:'The genuine Phase II mind-body-soul links show an individually measured limited inner resonance response.',
  identityCountertest:'The subject intentionally stops the self-resonance and clearly retains the original person’s separate identity.'});
 const mapped=act(s,'latticeMap',{...invalid,witnessIndex:wi});
 A.equal(mapped.mapped,true);A.equal(mapped.formed,false);
 A.equal(s.player.soul.phase,2);
 A.equal(Lattice.verify(s),true);
 A.throws(()=>act(s,'latticeMap',{...invalid,witnessIndex:wi}),/existing personally mapped/);
 let ready=false;
 for(let i=0;i<8&&!ready;i++){
  rest(s,2);
  const ix=witnessed(s,Lattice.PRACTICE,{
   observedFeedback:'A separate low-intensity personal resonance return is measured through original physically stabilized thread links.',
   voluntaryStop:'A personally controlled effort ends the experiment before external patterns or persons can be influenced.'});
  const start=s.world.minutes,oldSoul=s.player.soul.reserve;
  const r=act(s,'latticePractice',{witnessIndex:ix,minutes:15});
  A.equal(s.world.minutes,start+15);
  A.equal(s.player.soul.reserve,oldSoul-r.reserveSpent);
  A.equal(r.noMindreadingOrBondAward,true);
  A.equal(Lattice.verify(s),true);
  ready=r.progress>=r.needed;
  const checkpoint=E.exportGame(s),rng0=s.rngState;
  A.throws(()=>act(s,'latticePractice',{witnessIndex:ix,minutes:15}),
   /same original soul practice|ready for its separate formation trial/);
  A.equal(E.exportGame(s),checkpoint);A.equal(s.rngState,rng0);
 }
 A.equal(ready,true,'Earned work should produce a structurally stable self-resonance pattern');
 A.equal(s.player.soul.phase,2);
 rest(s,4);
 let formed=false;
 for(let i=0;i<6&&!formed;i++){
  rest(s,4);
  const ix=witnessed(s,Lattice.FORM,{
   independentResponse:'A new independently observed protected standing wave responds to changed harmless personal pressure.',
   identityBoundaryProof:'The practitioner remains independently themselves and can deliberately stop the resonance without reading any other mind.'});
  const oldSoul=s.player.soul.reserve,oldMax=s.player.soul.maxReserve,
   minute=s.world.minutes;
  const result=act(s,'latticeComplete',{witnessIndex:ix,minutes:90});
  A.equal(s.world.minutes,minute+90);
  A.equal(s.player.soul.reserve,oldSoul-result.reserveSpent);
  A.equal(result.noAutomaticContractCommunicationOrMindreading,true);
  A.equal(Lattice.verify(s),true);
  formed=result.formed;
  if(formed){
   A.equal(s.player.soul.phase,3);
   A.equal(s.player.soul.maxReserve,Math.max(oldMax,Build.soulProfile(3,{will:10}).soulReserve));
  }
 }
 A.equal(formed,true,'A separate original formation test must earn Phase III');
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(s.player.arcane.circles,0);
 A.equal(s.player.meridian.stage,0);
 A.equal(s.player.soul.resonanceLatticeIntegrity,1);
 A.equal(Lattice.status(s).formed,true);
 A.equal(Thread.earned(s).concentrationBonus,2,
  'Authentic Phase II protection cannot disappear when progressing to Phase III');
 A.equal(Power.read(s).soul.threading.earned,true);
 A.equal(Power.read(s).soul.lattice.formed,true);
 rest(s,2);
 const sensed=Senses.perceive(s,{});
 A.equal(sensed.threadConcentrationBonus,2);
 A.equal(sensed.noNamesRead,true);
 A.equal(sensed.noBeastMindRead,true);
 const saved=E.exportGame(s),copy=E.importGame(saved);
 A.equal(Lattice.verify(copy),true);
 copy.table.soulArchitecture.lattice.attempts[0].source.total=99;
 A.equal(Lattice.verify(copy),false,'Forged lattice progress must be detected');
 const corrupt=E.importGame(saved);
 corrupt.player.soul.threadProof.workHash='forged';
 A.equal(Lattice.verify(corrupt),false,'Phase II prior identity source cannot be forged');
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-soul-lattice-'));
 try{
  const file=Path.join(dir,'save.json');FS.writeFileSync(file,saved+'\n');
  const query={id:'soul_III_lattice_status_874401',mode:'rule',
   system:'soul',operation:'latticeStatus',params:{}};
  A.equal(Turn.execute(file,query).applied,false);
  A.equal(Turn.execute(file,query).applied,false);
  A.equal(FS.readFileSync(file,'utf8'),saved+'\n');
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
{
 // A less capable source-earned person may experience actual spiritual
 // interference; recovery must expend their own reserve and be witnessed.
 const s=second(874405);
 const mapWitness=witnessed(s,Lattice.MAP,{
  observedSelfResonance:'The same original mind and soul threads exhibit a small measured variable resonance response.',
  identityCountertest:'A personally verified voluntary stop preserves independent identity and closes the weak resonant loop.'});
 act(s,'latticeMap',{
  name:'Cautious Personal Resonance',resonancePattern:'Individual mind-body threads produce a repeatable small oscillation',
  identityBoundary:'The self retains original independent memory and personhood under controlled spiritual perturbation.',
  communicationLimit:'Neither the pattern nor the map gives other people’s private thoughts or consent to a contract.',
  interference:'Unstable crossing resonance may interrupt inner attention and create a source-observed stability loss.',
  repairMethod:'Self-correcting low-load resonance and ordinary physical rest can reduce actually observed structural strain.',
  witnessIndex:mapWitness});
 s.player.attributes.wis=10;s.player.skills.cultivation.rank=0;
 let severe=false;
 for(let i=0;i<12&&!severe;i++){
  rest(s,2);
  const w=witnessed(s,Lattice.PRACTICE,{
   observedFeedback:'A weak self-produced resonance is measured despite mismatched tempo and unstable return.',
   voluntaryStop:'The subject maintains the right to stop the exercise whenever self-identity strain appears.'});
  const r=act(s,'latticePractice',{witnessIndex:w,minutes:15});
  severe=r.check.degree==='severe failure';
 }
 A.equal(severe,true,'Actual original check must sometimes create real identity strain');
 A.ok(act(s,'latticeStatus').strain>=3);
 A.ok(s.player.soul.stability<100);
 s.player.attributes.wis=30;s.player.skills.cultivation.rank=5;
 rest(s,1);
 const ix=witnessed(s,Lattice.REPAIR,{
  diagnosis:'A recorded original resonance mismatch makes the individual protective lattice less stable under pressure.',
  selfCorrection:'A separately observed reduced-load adjustment restores some actual structural balance without mind alteration.'});
 const r=act(s,'latticeRepair',{witnessIndex:ix,minutes:60});
 A.equal(r.repaired,true);
 A.ok(r.strain<=3);A.equal(Lattice.verify(s),true);
 const edited=E.importGame(E.exportGame(s));
 edited.table.soulArchitecture.lattice.repairs[0].source.strainAfter=99;
 A.equal(Lattice.verify(edited),false);
}
console.log('Soul foundation #12 Phase III: original Phase II source, actual personal resonance, checks/costs/injury-repair, identity boundaries, saved replay, no mindreading or compelled souls');
