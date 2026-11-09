'use strict';
// Foundation #09: real individual partner, existing bond metrics and actual
// witnessed action receipts. Everything is disposable, never campaign state.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 C=require('../rules/core'),Sync=require('../rules/bond-synchronisation'),
 Turn=require('../scripts/chat-turn');
const op=(s,operation,params)=>R.act(s,{system:'bond',operation,params});
function paired(seed=932101){
 const s=E.newGame({name:'Previously Established Pair',seed,path:'partner'});
 const id=s.player.partnerIds[0],b=s.beasts[id];
 A.ok(b.bondHistory.length,'Starter original source establishes the prior relationship');
 // The old partner starter omitted a numeric species sapience assessment;
 // this disposable integration fixture uses its preauthored fenfox S1 type.
 A.equal(E.SPECIES[b.species].intelligence,'animal-cunning');b.sapience=1;
 s.player.stamina=100;s.player.maxStamina=100;
 // The original engine's starter beast stores prior lived bond dimensions on
 // the beast but no bondRecords. Reconcile them once into original bond model.
 op(s,'register',{beastId:id,start:'unfamiliar'});
 const r=R.bonds.fromSave(s,id);
 r.trust=b.trust;r.respect=b.respect;
 r.communication=b.communication;r.resonance=8;r.compatibility=8;
 r.coordination=b.coordination;r.willingness=95;r.syncStage=b.syncStage;
 b.location=s.world.location;
 b.agencyProfile={origin:'individual-behaviour-v1',disposition:'affiliative'};
 s.player.attributes.dex=30;s.player.skills.beastcraft.rank=5;
 return {s,b,r};
}
function scene(s,b,stage,tag='Safe original joint formation'){
 C.event(s,'story',
  'The previously consenting pair independently practise a distinctive and nonforced timing exercise beside the market canals.',{
   origin:Sync.SCENE,beastId:b.id,targetStage:stage,location:s.world.location,
   humanAction:tag+' — the human deliberately adjusts their own position and rhythm.',
   beastAction:'The independently responsive beast practises its own measured signals and movement without compulsion.',
   safety:'Both can independently stop the shared exercise if strain or refusal is observed.'});
 return s.log.length-1;
}
function proof(s,b,stage,kind){
 C.event(s,'story','The actual partners separately recognise a previously witnessed pattern in each living body.',{
  origin:Sync.PROOF,beastId:b.id,stage,kind,location:s.world.location,
  basis:'Actual original witnessed paired physical response and separately understood resonant cues of this same pair'});
}
{
 const {s,b,r}=paired();
 const before=E.exportGame(s),rng=s.rngState;
 const view=op(s,'syncExperienceStatus',{beastId:b.id});
 A.equal(view.known,true);A.equal(view.stage,1);
 A.equal(view.targetStage,2);A.equal(view.numericReady,true);
 A.equal(view.requiredPoints,10);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 A.deepEqual(op(s,'syncExperienceStatus',{beastId:'other'}),{known:false});
 A.throws(()=>op(s,'syncPractice',{beastId:b.id,witnessIndex:0,win:true}),
  /only an existing partner/);
 A.equal(E.exportGame(s),before);
 A.throws(()=>op(s,'syncDesign',{beastId:b.id,methodId:'free_whirl',
  name:'Free Whirl',principle:'A named effect without documented earned human source',
  limits:'No existing body could actually support this technique',
  humanTechniqueId:'unknown',beastAbility:'Glimmer Veil',witnessIndex:0}),
  /requires truly earned sync Stage 5/);
 A.equal(E.exportGame(s),before);
 proof(s,b,2,'energy-perception');
 let attempts=0,accepted=0,declined=0,promoted=false;
 while(attempts++<12&&!promoted){
  const index=scene(s,b,2,'Original source scene '+attempts);
  const stamp=s.world.minutes,startStamina=s.player.stamina;
  const priorRng=s.rngState;
  const result=op(s,'syncPractice',{beastId:b.id,witnessIndex:index});
  A.equal(result.minutes,35);
  A.equal(s.world.minutes,stamp+35);
  A.equal(s.player.stamina,startStamina-4);
  A.equal(Sync.verify(s,b,r),true);
  if(result.beastDeclined){
   declined++;A.equal(result.noRoll,true);A.equal(s.rngState,priorRng);
  }else{
   accepted++;A.ok(result.check.roll>=1&&result.check.roll<=20);
   A.ok(result.pointsEarned>=1);
  }
  A.throws(()=>op(s,'syncPractice',{beastId:b.id,witnessIndex:index}),
   /original joint activity|already resolved/);
  promoted=!!result.promoted;
 }
 A.ok(promoted,'This sourced and individually earned pair has real Stage 2 experience');
 A.ok(accepted>=4);A.equal(r.syncStage,2);A.equal(b.syncStage,2);
 A.equal(r.syncState,'novice');
 A.equal(s.player.meridian.stage,0);A.equal(s.player.arcane.circles,0);
 A.equal(b.level,2);A.equal(s.player.partnerIds.length,1);
 A.equal(op(s,'syncExperienceStatus',{beastId:b.id}).stageName,'Energy Recognition');
 A.ok(r.syncPractice.history.some(x=>x.source.kind==='stage'));
 let stable=false;
 for(let n=0;n<7&&!stable;n++){
  const witnessIndex=scene(s,b,2,'Independent refinement '+n);
  const res=op(s,'syncPractice',{beastId:b.id,witnessIndex,focus:'refine'});
  A.equal(res.focus,'refine');
  stable=r.syncState==='stable'||r.syncState==='mastered';
 }
 A.equal(stable,true,'Earned stage depth depends on distinct successful practice, never a timer');
 A.equal(r.syncStage,2);
 A.equal(Sync.verify(s,b,r),true);
 const saved=E.exportGame(s),copy=E.importGame(saved);
 A.equal(Sync.verify(copy,copy.beasts[b.id],R.bonds.fromSave(copy,b.id)),true);
 copy.table.bondRecords[b.id].syncPractice.history[0].source.humanCost=999;
 A.equal(Sync.verify(copy,copy.beasts[b.id],R.bonds.fromSave(copy,b.id)),false);
 const copyTwo=E.importGame(saved);
 copyTwo.table.bondRecords[b.id].syncPractice.source.bondHash='wrong';
 A.equal(Sync.verify(copyTwo,copyTwo.beasts[b.id],R.bonds.fromSave(copyTwo,b.id)),false);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-earned-sync-'));
 try{
  const save=Path.join(dir,'save.json');FS.writeFileSync(save,saved+'\n');
  const read={id:'pair_status_00001',mode:'rule',system:'bond',
   operation:'syncExperienceStatus',params:{beastId:b.id}};
  A.equal(Turn.execute(save,read).applied,false);
  A.equal(E.importGame(FS.readFileSync(save,'utf8')).table.bondRecords[b.id].syncStage,2);
  const ix=scene(s,b,3,'New Stage 3 separate witnessed attempt');
  // Save the actual source scene in the replay state, but preserve the
  // original Stage 3 energy-medium prerequisite: no unearned medium/contract.
  FS.writeFileSync(save,E.exportGame(s)+'\n');
  const attempt={id:'pair_attempt_00001',mode:'rule',system:'bond',
   operation:'syncPractice',params:{beastId:b.id,witnessIndex:ix}};
  const snapshot=FS.readFileSync(save,'utf8');
  A.throws(()=>Turn.execute(save,attempt),/advanced shared energy|Energy synchronisation/);
  A.equal(FS.readFileSync(save,'utf8'),snapshot);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
 A.ok(declined>=0);
}
{
 // Non-earned human skill / player-selected fantasy effects never get an
 // automatic working shared spell merely by assigning a resonant name.
 const {s,b,r}=paired(932102),witnessIndex=scene(s,b,5);
 r.syncStage=5;b.syncStage=5;
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>op(s,'syncDesign',{beastId:b.id,methodId:'dream_echo',
  name:'Dream Echo',principle:'A brief dual sensory and mist timing technique between different bodies',
  limits:'Only a nearby, consenting pair with biologically compatible sensing and limited energy',
  humanTechniqueId:'arcane_spark',beastAbility:'Glimmer Veil',witnessIndex}),
  /No existing original earned-technique verifier|specific human source technique/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 // A genuinely learned human First-Circle technique is source-verified by
 // the ORIGINAL Arcane skill resolver before pair design is accepted.
 const s=E.newGame({name:'Source-Earned Pair Technique',seed:932103,path:'arcane'});
 s.player.arcane.coreIgnited=true;s.player.arcane.circles=1;
 s.player.arcane.geometry='Source-demonstrated stable First Circle geometry';
 s.player.attributes.int=30;s.player.attributes.dex=30;
 s.player.attributes.wis=30;s.player.skills.arcana.rank=5;
 s.player.skills.beastcraft.rank=5;
 s.table||={};s.table.disciplineTraining||={};
 s.table.disciplineTraining.arcane={history:[
  {day:1,target:'core',quality:'strong',change:'Mana Core independently ignited'},
  {day:1,target:'circle1',quality:'strong',change:'First Circle genuinely assembled'}
 ],methods:{},points:0,cooldownUntil:0};
 A.equal(E.dispatch(s,'travel academy').ok,true);
 const taught=R.act(s,{system:'arcane',operation:'sparkStudy',params:{}});
 A.equal(taught.learned,true);
 A.equal(s.table.arcaneTechniques.arcane_spark.techniqueId,'arcane_spark');
 A.equal(E.dispatch(s,'travel crossing').ok,true);
 A.equal(E.dispatch(s,'travel fen').ok,true);
 let fox=null;
 for(let i=0;i<32&&!fox;i++){
  A.equal(E.dispatch(s,'explore').ok,true);
  const b=s.beasts[s.encounter.beastId];
  if(b.species==='fenfox'&&!s.encounter.threat){
   const observed=R.act(s,{system:'world',operation:'observe',params:{}});
   if(observed.identified){
    op(s,'encounterRegister',{beastId:b.id});
    fox=b;
   }
  }
  if(s.encounter&&!fox)A.equal(E.dispatch(s,'leave').ok,true);
 }
 A.ok(fox,'A real individually observed fox is required for the disposable advanced-pair fixture');
 // The fixture models a historically earned Stage 5 pair from the real
 // individual and original bond record. No live game command skips stages.
 fox.relationship='reciprocal partner';fox.consent=true;
 fox.location=s.world.location;fox.owner=null;
 s.player.partnerIds.push(fox.id);
 fox.agencyProfile={origin:'individual-behaviour-v1',disposition:'affiliative'};
 const r=R.bonds.fromSave(s,fox.id);
 r.syncStage=5;fox.syncStage=5;
 Object.assign(r,{trust:90,respect:90,communication:85,
  resonance:9,compatibility:9,coordination:90,willingness:95});
 const witnessIndex=scene(s,fox,5,'Earned custom technique design');
 const p={beastId:fox.id,methodId:'spark_mist_cadence',
  name:'Spark and Mist Cadence',
  principle:'The trained human times a verified low-output Arcane pattern with the fox own mist organ',
  limits:'The same two nearby willing bodies may attempt physical alignment; no bonus damage or magic copied',
  humanTechniqueId:'arcane_spark',beastAbility:'Glimmer Veil',witnessIndex};
 A.equal(op(s,'syncDesign',p).designed,true);
 A.equal(op(s,'syncExperienceStatus',{beastId:fox.id}).methods.length,1);
 A.throws(()=>op(s,'syncDesign',p),/already recorded/);
 const method=r.syncPractice.methods[p.methodId];
 const techniqueBefore=E.exportGame(s);
 A.equal(Sync.verify(s,fox,r),true);
 C.event(s,'story',
  'The previously free individual and its human collaborator attempt a gentle locally bounded physical cadence.',{
   origin:Sync.METHOD,beastId:fox.id,methodId:p.methodId,
   methodHash:method.seal,location:s.world.location,
   humanAction:'The human practices a separately learned and restrained Arcane formation timing.',
   beastAction:'The animal freely attempts a small bodily mist signal rather than being commanded.',
   safety:'Either participant may refuse before real costs are charged; no uncontrolled emission.'});
 const index=s.log.length-1,beastEnergy=fox.energy,stamina=s.player.stamina;
 const out=op(s,'syncDemonstrate',{beastId:fox.id,methodId:p.methodId,witnessIndex:index});
 if(out.demonstrated){
  A.equal(fox.energy,beastEnergy-3);A.equal(s.player.stamina,stamina-4);
  A.ok(out.check.roll>=1);A.equal(out.limitedEffect.includes('no new damage'),true);
 }else{
  A.equal(out.beastDeclined,true);A.equal(fox.energy,beastEnergy);
 }
 A.equal(r.syncStage,5);A.equal(s.player.arcane.circles,1);
 A.equal(s.table.arcaneTechniques.arcane_spark.techniqueId,'arcane_spark');
 A.equal(Sync.verify(s,fox,r),true);
 A.throws(()=>op(s,'syncDemonstrate',{beastId:fox.id,methodId:p.methodId,witnessIndex:index}),
  /already received its only roll/);
 A.notEqual(E.exportGame(s),techniqueBefore);
}
console.log('Earned sync uses actual reciprocal pair history, free beast decisions, unique witnessed attempts, true pairwise costs and checks, ten original stage requirements, refinement, independently verified human technique and innate beast capability, limited demonstrations, no fantasy effects, tamper detection and saved read-only replay.');
