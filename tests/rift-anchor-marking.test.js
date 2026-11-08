'use strict';
// Canon §25: Rift Anchor Marking II uses an actual witnessed exterior
// spatial measurement. All characters are disposable tests; no campaign
// checkpoint, unknown map or remote vault is created or edited.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),
 Anchor=require('../rules/rift-anchors'),
 Power=require('../rules/power-overview'),
 Sens=require('../rules/first-stage-senses'),
 Turn=require('../scripts/chat-turn.js');
const rule=(s,system,operation,params={})=>R.act(s,{system,operation,params});
const APPR='Measure the existing exterior wardline against my own balance, resonance and landmarks without crossing any seal';
function earnedFirst(seed=1521101){
 const s=E.newGame({seed,name:'Disposable Rift II cartographer',path:'undecided'});
 R.unified.ensurePlayer(s);
 s.player.attributes.int=30;s.player.skills.arcana.rank=5;
 A.equal(E.dispatch(s,'travel fen').ok,true);
 A.equal(E.dispatch(s,'travel ruins').ok,true);
 let attempts=0,seen=false;
 while(rule(s,'discipline','status').systems.rift.progress<50){
  A.ok(++attempts<50,'Real Rift I training should progress through authentic checks');
  const p=rule(s,'discipline','practice',{
   system:'rift',method:attempts%2?'boundaries':'orientation',
   route:'independent',minutes:15});
  A.equal(p.route,'independent');
  A.equal(p.staminaSpent,1);
  seen=true;
 }
 A.equal(seen,true);
 const b=rule(s,'discipline','breakthrough',
  {system:'rift',route:'independent'});
 A.equal(b.outcome,'breakthrough');
 A.equal(s.player.rift.step,1);
 A.equal(s.table.disciplineTraining.rift.history[0].target,'sense');
 return s;
}
function measured(seed=1521102){
 const s=earnedFirst(seed);
 const result=rule(s,'rift','sense');
 A.equal(result.success,true,'Actual original high-skill Rift Sense observes the exterior boundary');
 A.equal(result.noVaultEntry,true);A.equal(result.noTeleportation,true);
 A.equal(s.table.perceptionPractice.riftAttempts.at(-1).success,true);
 return s;
}
{
 const unearned=E.newGame({seed:1521199,name:'Not a Rift cultivator',path:'undecided'});
 const before=E.exportGame(unearned),rng=unearned.rngState;
 const status=rule(unearned,'rift','anchorStatus');
 A.equal(status.ready,false);
 A.throws(()=>rule(unearned,'rift','anchorWork',{
  focus:'integrated',minutes:15}),/authentically earned/);
 A.equal(E.exportGame(unearned),before);A.equal(unearned.rngState,rng);
}
{
 const s=earnedFirst(1521103),before=E.exportGame(s),rng=s.rngState;
 A.equal(rule(s,'rift','anchorStatus').ready,false);
 A.throws(()=>rule(s,'rift','anchorWork',{focus:'integrated'}),
  /genuinely successful personally measured/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=measured(),before=E.exportGame(s),rng=s.rngState;
 const st=rule(s,'rift','anchorStatus');
 A.equal(st.ready,true);A.equal(st.requiredPerAxis,2);
 A.equal(st.integratedReferenceRequired,true);
 A.equal(rule(s,'discipline','status').systems.rift.target,
  'Step II — Anchor Marking');
 A.deepEqual(st.axes,{bearing:0,resonance:0,stability:0});
 A.equal(Power.read(s).rift.anchors.ready,true);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng,
  'Status and power readouts may not roll or change the world');
 for(const args of [
  {focus:'integrated',minutes:15,coords:'secret vault'},
  {focus:'integrated',minutes:15,teleport:true},
  {focus:'integrated',minutes:15,selectedDC:1},
  {focus:'integrated',minutes:0},
  {focus:'portal',minutes:15},
  {focus:'integrated',approach:'I win'},
  {focus:'integrated',minutes:15,feeTalons:0}
 ]){
  A.throws(()=>rule(s,'rift','anchorWork',args));
  A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 }
 const tampered=E.importGame(before);
 tampered.table.perceptionPractice.riftAttempts[0].success=false;
 const old=E.exportGame(tampered),r=tampered.rngState;
 A.throws(()=>rule(tampered,'rift','anchorWork',{
  focus:'integrated'}),/genuinely successful/);
 A.equal(E.exportGame(tampered),old);A.equal(tampered.rngState,r);
 const left=E.importGame(before);
 A.equal(E.dispatch(left,'travel fen').ok,true);
 const outside=E.exportGame(left),outsideRng=left.rngState;
 A.throws(()=>rule(left,'rift','anchorWork',{focus:'integrated'}),
  /No authentic measurable Riftglass exterior/);
 A.equal(E.exportGame(left),outside);
 A.equal(left.rngState,outsideRng);
}
{
 const s=measured(1521104),original=E.exportGame(s);
 const initialStamina=s.player.stamina,initialTime=s.world.minutes;
 let formed=null,spent=0,time=0;
 for(let i=0;i<15&&!formed;i++){
  const before=s.world.minutes,stamina=s.player.stamina,
   minutes=i===0?15:60,focus=i===0?'bearing':'integrated';
  const result=rule(s,'rift','anchorWork',
   {focus,minutes,approach:APPR});
  A.equal(result.check.dc>=18&&result.check.dc<=22,true);
  A.ok(Number.isInteger(result.check.roll));
  A.equal(result.staminaSpent,2+Math.ceil(minutes/120));
  A.equal(result.feeTalons,0);
  A.equal(result.noVaultEntry,true);A.equal(result.noTeleportation,true);
  A.equal(s.world.minutes,before+minutes);
  A.equal(s.player.stamina,stamina-result.staminaSpent);
  spent+=result.staminaSpent;time+=minutes;
  formed=result.formed?result:null;
 }
 A.ok(formed,'Real high-skill spatial practice should establish one bound reference');
 A.equal(s.player.rift.step,2);
 A.equal(s.player.rift.anchors.length,1);
 A.equal(s.player.rift.anchors[0].id,Anchor.SITE);
 A.equal(s.player.rift.anchors[0].location,'ruins');
 A.deepEqual(s.table.riftAnchorWork.axes,
  {bearing:2,resonance:2,stability:2});
 A.equal(s.table.riftAnchorWork.integrated,true);
 A.equal(s.table.riftAnchorWork.completed,true);
 A.equal(s.player.stamina,initialStamina-spent);
 A.equal(s.world.minutes,initialTime+time);
 A.equal(s.player.meridian.stage,0);
 A.equal(s.player.arcane.circles,0);
 A.equal(s.player.soul.phase,0);
 A.deepEqual(s.player.body.cycles,[]);
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(Anchor.earned(s).id,Anchor.SITE);
 A.equal(rule(s,'rift','anchorStatus').earned,true);
 A.equal(Power.read(s).rift.anchors.earned,true);
 const saved=E.importGame(E.exportGame(s));
 A.deepEqual(saved.player.rift.anchorProof,s.player.rift.anchorProof);
 A.equal(Anchor.earned(saved).id,Anchor.SITE);
 const noSecond=E.exportGame(s),rng=s.rngState;
 A.throws(()=>rule(s,'rift','anchorWork',{focus:'integrated'}),
  /genuinely completed Step I|new Step II anchor/);
 A.equal(E.exportGame(s),noSecond);A.equal(s.rngState,rng);
 const pretend=E.importGame(original);
 pretend.player.rift.step=2;
 pretend.player.rift.anchors=[{id:Anchor.SITE}];
 A.throws(()=>Anchor.earned(pretend),/lacks its original/);
 // After genuinely forming the anchor, perform a real orientation check,
 // then spend the temporary benefit on one genuine Rift Sense check.
 const orientTime=s.world.minutes,orientStamina=s.player.stamina;
 const orientation=rule(s,'rift','orient');
 A.equal(orientation.performed,true);
 A.equal(orientation.success,true);
 A.equal(orientation.orientationReady,true);
 A.equal(orientation.noTeleportation,true);
 A.equal(s.world.minutes,orientTime+10);
 A.equal(s.player.stamina,orientStamina-1);
 A.equal(s.table.riftOrientation.used,false);
 const pre=s.world.minutes,prior=s.player.stamina;
 const sense=rule(s,'rift','sense');
 A.equal(sense.orientationBonus,2);
 A.equal(sense.check.modifier,Math.floor((s.player.attributes.int-10)/2)+
  2*s.player.skills.arcana.rank+2);
 A.equal(sense.noVaultEntry,true);
 A.equal(sense.noHiddenRouteRevealed,true);
 A.equal(s.world.minutes,pre+Sens.RIFT_MINUTES);
 A.equal(s.player.stamina,prior-Sens.RIFT_STAMINA);
 A.equal(s.table.riftOrientation.used,true);
 const again=rule(s,'rift','sense');
 A.equal(again.orientationBonus,0,'A one-use bearing does not apply to multiple rolls');
 const guarded=E.exportGame(s),priorRng=s.rngState;
 A.throws(()=>rule(s,'rift','orient',{secretRoute:true}),/not selected secret coordinates/);
 A.equal(E.exportGame(s),guarded);A.equal(s.rngState,priorRng);
}
{
 // A failed orientation cannot give a prepared bonus. Uses independent
 // disposable game seeds, not repeated outcomes in an active campaign.
 let observed=false;
 for(let seed=242010;seed<242060&&!observed;seed++){
  const s=measured(seed);
  s.rngState=(Math.imul(seed,2654435761)>>>0)||1;
  s.player.attributes.int=10;s.player.skills.arcana.rank=0;
  const r=rule(s,'rift','anchorWork',{focus:'bearing',minutes:15});
  if(r.check.degree==='severe failure'){
   observed=true;
   A.equal(r.backlash,'spatial vertigo and shear strain');
   A.ok(s.table.combatants.player.wounds.some(n=>n>0));
   A.equal(s.player.rift.step,1);
  }
 }
 A.equal(observed,true,'Severe local spatial instability can genuinely wound the practitioner');
}
{
 const s=measured(1521106),dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-anchor2-'));
 try{
  const file=Path.join(dir,'disposable.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const request={id:'rift_anchor_1521106',mode:'rule',
   system:'rift',operation:'anchorWork',
   params:{focus:'integrated',minutes:15}};
  const first=Turn.execute(file,request);
  A.equal(first.ok,true);A.equal(first.applied,true);
  A.ok(Number.isInteger(first.output.rules.check.roll));
  const receipt=FS.readFileSync(file,'utf8');
  const repeated=Turn.execute(file,request);
  A.equal(repeated.duplicate,true);
  A.equal(repeated.applied,false);
  A.equal(FS.readFileSync(file,'utf8'),receipt);
  A.equal(E.importGame(receipt).world.minutes,s.world.minutes+15);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Rift II: authentic witnessed boundary, spatial axes, actual hazards, source-hashed anchor, limited one-use orientation, no teleportation or vault entry, original private replay');
