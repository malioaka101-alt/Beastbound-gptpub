'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 C=require('../rules/core'),Disc=require('../rules/disciplines'),
 Nerve=require('../rules/body-nerve-sense'),Power=require('../rules/power-overview'),
 Turn=require('../scripts/chat-turn');
const act=(s,k,p={})=>R.act(s,{system:'body',operation:k,params:p});
function rest(s,min=4){
 let count=0;
 while(s.player.stamina<min){
  A.ok(count++<10,'Original whole-body rest must recover physical exertion');
  const at=s.world.minutes;R.act(s,{system:'health',operation:'sleep',params:{hours:8}});
  A.equal(s.world.minutes,at+480);
 }
}
function third(seed=581011){
 const s=E.newGame({seed,name:'Original Human Nerve Refiner',path:'undecided',background:'fieldworker'});
 R.unified.ensurePlayer(s);s.world.location='academy';
 const p=s.player,c=s.table.combatants.player;
 p.body.cycles=['Muscle-Tendon Cycle','Bone-Marrow Cycle'];
 p.attributes.con=30;p.skills.survival.rank=5;
 p.maxStamina+=2;p.stamina+=2;c.maxStamina+=2;c.stamina+=2;
 c.toughness+=1;c.boxes[1]+=1;
 s.table.disciplineTraining||={};
 s.table.disciplineTraining.body={
  target:null,points:0,methods:{},weeks:0,cooldownUntil:0,complications:[],
  history:[
   {day:1,target:'cycle1',quality:'strong',
    change:'Completed Cycle I Muscle-Tendon refinement; +2 stamina, Might +1, M1 natural force'},
   {day:1,target:'cycle2',quality:'strong',
    change:'Completed Cycle II Bone-Marrow refinement; +1 Toughness, +1 Serious wound box'}
  ]};
 let formed=false;
 for(let n=0;n<12&&!formed;n++){
  rest(s,2);
  formed=act(s,'organWork',{focus:'integrated',minutes:15,
   approach:'Observed original heart lung kidney and liver regulation across the whole body'}).completed;
 }
 A.equal(formed,true,'Original third organ cycle must genuinely earn its own full-body proof');
 A.equal(Disc.organEarned(s).cycle,3);
 return s;
}
function witness(s,origin,details){
 C.event(s,'story',
  'A practitioner demonstrates physically measured personal neural adaptation under an independent reversible countertest.',{
   origin,location:s.world.location,...details});
 return s.log.length-1;
}
{
 const s=third(),before=E.exportGame(s),rng=s.rngState;
 A.equal(act(s,'nerveStatus').ready,true);
 A.equal(Power.read(s).body.nerveSense.ready,true);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 A.throws(()=>act(s,'nerveMap',{}),/Original observed neural regions/);
 A.equal(E.exportGame(s),before);
 const wi=witness(s,Nerve.MAP,{
  clinicalObservation:'Observed existing peripheral nerve conduction, spinal motor returns and autonomic regulation remain visibly measurable.',
  independentCountertest:'Deliberate local cold and controlled exertion disrupt the learned timing without creating new senses.'});
 const systems=[
  {id:'peripheral',tissue:'Original peripheral sensory endings and intact afferent nerves already present in this individual body',
   actualFunction:'Measured fine touch/proprioceptive signals are carried by actual peripheral pathways without extrasensory claims'},
  {id:'motor',tissue:'Existing spinal motor control and tendon reflex pathways integrated with previously trained muscles',
   actualFunction:'Original motor timing adjusts individual movement coordination within measurable reaction and fatigue limits'},
  {id:'autonomic',tissue:'Actual previously observed autonomic cardiac and breathing control pathways in living tissue',
   actualFunction:'Heart and respiration regulation stay active under load without infinite endurance or invented organs'}
 ];
 const mapped=act(s,'nerveMap',{
  name:'Individual Whole-Body Neural Adaptation',systems,
  metabolicLimit:'Ordinary food, rest, oxygen and heat balance still constrain nerve transmission and sustained exertion.',
  injuryLimit:'Fatigue, excessive stimulation and genuine neural injury can impair these same human pathways.',
  recovery:'Measured recovery and clinical rehabilitation are required when original neural overtraining causes disruption.',
  witnessIndex:wi});
 A.equal(mapped.mapped,true);
 A.equal(s.player.body.cycles.length,3);
 A.equal(Nerve.verify(s),true);
 let ready=false;
 for(let i=0;i<10&&!ready;i++){
  rest(s,3);
  const ix=witness(s,Nerve.PRACTICE,{
   measuredResponse:'Original peripheral sensory, motor and autonomic signals show a small measured trainable change under natural limits.',
   fatigueLimit:'The practitioner experiences real local nerve fatigue after sustained controlled sensory and reflex workload.'});
  const at=s.world.minutes,beforeStamina=s.player.stamina;
  const r=act(s,'nervePractice',{focus:'integrated',witnessIndex:ix,minutes:15});
  A.equal(s.world.minutes,at+15);
  A.equal(s.player.stamina,beforeStamina-r.staminaSpent);
  A.equal(r.noAutomaticSensoryArt,true);
  A.equal(Nerve.verify(s),true);
  ready=r.integrated&&Object.values(r.systems).every(x=>x===2);
 }
 A.equal(ready,true);
 A.equal(s.player.body.cycles.length,3);
 rest(s,4);
 let formed=false;
 for(let i=0;i<8&&!formed;i++){
  rest(s,4);
  const ix=witness(s,Nerve.FORM,{
   fullBodyResponse:'A new whole-body testing sequence confirms adaptive reflex, sensory and autonomic regulation in the same existing tissue.',
   independentFailureLimit:'Original physical fatigue and a controlled counterstimulus demonstrate finite neural response and real weakness.'});
  const previousMax=s.player.maxStamina,oldStamina=s.player.stamina;
  const r=act(s,'nerveComplete',{witnessIndex:ix,minutes:90});
  A.equal(s.player.stamina,oldStamina-r.staminaSpent);
  if(r.formed)A.equal(s.player.maxStamina,previousMax+1);
  formed=r.formed;A.equal(Nerve.verify(s),true);
 }
 A.equal(formed,true);
 A.deepEqual(s.player.body.cycles,[
  'Muscle-Tendon Cycle','Bone-Marrow Cycle','Organ Cycle','Nerve-Sense Cycle']);
 A.equal(Disc.organEarned(s).cycle,3,'Earlier Organ Cycle proof must survive later bodily change');
 A.equal(act(s,'nerveStatus').completed,true);
 A.equal(s.player.arcane.circles,0);A.equal(s.player.soul.phase,0);
 A.equal(s.player.humanEvolution.stage,0);
 A.deepEqual(s.player.origin.stableTraits,[]);
 const saved=E.exportGame(s),copy=E.importGame(saved);
 A.equal(Nerve.verify(copy),true);
 copy.table.bodyRefinement.neural.attempts[0].source.after.peripheral=99;
 A.equal(Nerve.verify(copy),false);
 const forged=E.importGame(saved);
 forged.player.body.nerveSenseProof.transitionHash='counterfeit';
 A.equal(Nerve.verify(forged),false);
 const filePath=Path.join(FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-nerve4-')),'save.json');
 try{
  FS.writeFileSync(filePath,saved+'\n');
  const req={id:'nerve_status_581011',mode:'rule',system:'body',operation:'nerveStatus',params:{}};
  A.equal(Turn.execute(filePath,req).applied,false);
  A.equal(Turn.execute(filePath,req).applied,false);
  A.equal(FS.readFileSync(filePath,'utf8'),saved+'\n');
 }finally{FS.rmSync(Path.dirname(filePath),{recursive:true,force:true})}
}
console.log('Body #13 first route: genuinely earned Organ III -> independently witnessed integrated Nerve–Sense IV, real stamina/tissue injury constraints, saved source and private replay');
