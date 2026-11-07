'use strict';
// Real Second Arcane Circle path, canon §21. A blueprint is only intent;
// first-Circle source + actual Mana, independent check and design work matter.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),
 Self=require('../rules/self-taught-basic-techniques'),
 Turn=require('../scripts/chat-turn');
const DESIGN='Branch the existing stabilised Circle into a counter-rotating dual-channel return loop, preserving the original formula anchor.';
const fresh=(seed=612101)=>{
 const s=E.newGame({seed,name:'Second Circle Independent Design Fixture',path:'arcane'});
 R.unified.ensurePlayer(s);
 const first='Measured stable First Circle with a sixfold return geometry';
 const a=s.player.arcane,p=R.build.arcaneProfile(1);
 a.coreIgnited=true;a.circles=1;a.geometry=first;
 a.structuredMana=p.mana;a.channels=p.channels;
 a.maxComplexity=p.maxComplexity;
 s.player.attributes.int=20;s.player.skills.arcana.rank=5;
 s.table.disciplineTraining||={};
 s.table.disciplineTraining.arcane={target:null,points:0,weeks:0,
  methods:{},cooldownUntil:0,complications:[],history:[
   {day:1,target:'core',quality:'strong',change:'Mana Core ignited, no Circle yet'},
   {day:1,target:'circle1',quality:'strong',change:'First Circle constructed; '+first}
  ]};
 return s;
};
const work=(s,p)=>R.act(s,{system:'arcane',operation:'circleWork',params:p});
{
 const s=fresh(),before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>work(s,{design:DESIGN,awardedCircle:9}),/accepts only/);
 A.throws(()=>work(s,{design:DESIGN,teacher:'Invisible wizard'}),/accepts only/);
 A.throws(()=>work(s,{design:'I win automatically'}),/concrete dual-channel/);
 A.throws(()=>work(s,{design:DESIGN,minutes:0}),/minutes/);
 A.throws(()=>work(s,{design:DESIGN,route:'established'}),/source-verified independent/);
 A.throws(()=>work(s,{design:DESIGN,claimedDC:1}),/accepts only/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const info=R.act(s,{system:'discipline',operation:'status',params:{}});
 A.match(info.systems.arcane.target,/Second Circle/);
 A.equal(info.systems.arcane.circleWork.manaSpentPerAttempt,2);
 A.equal(info.systems.arcane.trainingRoutes[0],'independent');
 A.equal(E.exportGame(s),before);
 // All actual abilities must come from previously earned anatomy and check.
 let constructed=false,spent=0,mana=0;
 for(let n=0;n<8&&!constructed;n++){
  const minutes=n===0?15:180,start=s.world.minutes,oldMana=s.player.mana,
   prevMeridian=JSON.stringify(s.player.meridian),prevSoul=s.player.soul.phase;
  const outcome=work(s,{design:DESIGN,minutes});
  A.equal(outcome.tuitionTalons,0);
  A.equal(outcome.check.dc,17);
  A.equal(outcome.manaSpent,2);
  A.equal(outcome.newSpellGranted,false);
  A.equal(s.world.minutes,start+minutes);
  A.equal(s.player.mana,oldMana-2);
  A.equal(JSON.stringify(s.player.meridian),prevMeridian);
  A.equal(s.player.soul.phase,prevSoul);
  constructed=outcome.constructed;spent+=minutes;mana+=2;
 }
 A.ok(constructed,'a genuine high-skill individual can design Circle II without mandated teachers or a calendar gate');
 A.equal(s.player.arcane.circles,2);
 A.equal(s.player.arcane.channels,R.build.arcaneProfile(2).channels);
 A.equal(s.player.arcane.structuredMana,R.build.arcaneProfile(2).mana);
 A.equal(s.player.arcane.maxComplexity,R.build.arcaneProfile(2).maxComplexity);
 A.equal(s.player.arcane.geometry,'Measured stable First Circle with a sixfold return geometry');
 A.equal(s.table.arcaneArchitecture.circle2.integratedDesign,DESIGN);
 A.equal(s.table.arcaneCircleRevision.attempts.reduce((sum,x)=>sum+x.earnedIntegrity,0)>=4,true);
 A.equal(s.table.arcaneArchitecture.circle2.noNewSpellGranted,true);
 A.equal(s.table.arcaneTechniques?.arcane_spark,undefined);
 A.equal(s.table.arcaneTechniques?.arcane_ward,undefined);
 A.ok(s.table.arcaneCircleRevision.attempts.length>=1);
 A.equal(s.player.mana,24-mana);
 A.ok(spent<6*1440,'Arcane progress depends on actual checks and resources, not mandatory weeks');
 const checkpoint=E.importGame(E.exportGame(s));
 A.deepEqual(checkpoint.table.arcaneArchitecture,s.table.arcaneArchitecture);
 A.deepEqual(checkpoint.table.arcaneCircleRevision,s.table.arcaneCircleRevision);
 const locked=E.exportGame(s),lastRng=s.rngState;
 A.throws(()=>work(s,{design:DESIGN}),/genuinely earned|First Circle/);
 A.equal(E.exportGame(s),locked);A.equal(s.rngState,lastRng);
}
{
 const s=fresh(612102),before=E.exportGame(s),rng=s.rngState;
 delete s.table.disciplineTraining.arcane.history[0].change;
 const damaged=E.exportGame(s);
 A.throws(()=>work(s,{design:DESIGN}),/genuinely earned/);
 A.equal(E.exportGame(s),damaged);
 A.equal(s.rngState,rng);
 A.notEqual(damaged,before);
}
{
 const s=fresh(612103);s.player.mana=1;
 const current=E.exportGame(s),rng=s.rngState;
 A.throws(()=>work(s,{design:DESIGN}),/actual available Mana/);
 A.equal(E.exportGame(s),current);A.equal(s.rngState,rng);
}
{
 // Proven basic spell learned at the First Circle must NOT be lost after
 // construction of the Second. Its original evidence remains unchanged.
 let source=null;
 for(let seed=612104;seed<612116&&!source;seed++){
  const s=fresh(seed),x=Self.learn(s,'arcane_spark',{route:'independent'});
  if(x.learned)source=s;
 }
 A.ok(source,'a genuine earlier basic spell can be earned');
 const prior=Self.profile(source,'arcane_spark'),oldTechnique=
  structuredClone(source.table.arcaneTechniques.arcane_spark);
 A.equal(prior.techniqueId,'arcane_spark');
 let built=false;
 for(let i=0;i<8&&!built;i++)
  built=work(source,{design:DESIGN,minutes:180}).constructed;
 A.equal(built,true);
 A.deepEqual(source.table.arcaneTechniques.arcane_spark,oldTechnique);
 const after=Self.profile(source,'arcane_spark');
 A.equal(after.techniqueId,'arcane_spark');
 A.equal(after.manaCost,prior.manaCost);
 A.deepEqual(E.importGame(E.exportGame(source)).table.arcaneTechniques.arcane_spark,
  oldTechnique);
}
{
 // Private turn runner must execute only once and actually save the earned
 // work. Repeating a stable ID is read-only even if the roll failed.
 const s=fresh(612117),dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-circle-two-'));
 try{
  const filepath=Path.join(dir,'save.json');
  FS.writeFileSync(filepath,E.exportGame(s)+'\n');
  const req={id:'arcane_circle_two_612117',mode:'rule',
   system:'arcane',operation:'circleWork',params:{design:DESIGN,minutes:25}};
  const out=Turn.execute(filepath,req);
  A.equal(out.applied,true);
  A.equal(out.output.rules.minutes,25);
  const changed=FS.readFileSync(filepath,'utf8');
  A.equal(Turn.execute(filepath,req).duplicate,true);
  A.equal(FS.readFileSync(filepath,'utf8'),changed);
  const restored=E.importGame(changed);
  A.equal(restored.world.minutes,s.world.minutes+25);
  A.equal(restored.table.arcaneCircleRevision.attempts.length,1);
  A.equal(restored.table.arcaneCircleRevision.attempts[0].manaSpent,2);
  const forged={...req,id:'forged_circle_two_612117',params:{design:DESIGN,minutes:25,grade:'Ninth'}};
  A.throws(()=>Turn.execute(filepath,forged),/accepts only/);
  A.equal(FS.readFileSync(filepath,'utf8'),changed);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
{
 // An authored theoretical expert with NO cultivation rank can help actual
 // Second Circle design once personally heard, without granting a Circle.
 const id='fixture_circle_archivist';
 E.NPCS[id]={name:'Archive Mathematician',location:'academy',
  profession:'Comparative scholar',publicExpertise:['arcane'],
  topic:'Mana Circle geometry can be studied through symbolic formulae, return paths, resonance and parallel channel stability even without personal casting experience.',
  temperament:'inquisitive and meticulous',goal:'understand magical design'};
 try{
  const guided=fresh(612118),solo=fresh(612118);
  guided.world.location='academy';solo.world.location='academy';
  for(const s of [guided,solo]){
   const heard=R.act(s,{system:'npc',operation:'converse',params:{npcId:id}});
   A.equal(heard.noRoll,true);
  }
  A.equal(E.NPCS[id].circles,undefined);
  const withTheory=work(guided,{design:DESIGN,minutes:50,guidanceId:id}),
   ownWork=work(solo,{design:DESIGN,minutes:50});
  A.equal(withTheory.check.roll,ownWork.check.roll);
  A.equal(withTheory.check.modifier,ownWork.check.modifier+1);
  A.equal(withTheory.theoreticalGuidance.aDemonstration,false);
  A.equal(withTheory.theoreticalGuidance.sourceId,id);
  A.equal(withTheory.newSpellGranted,false);
  A.equal(withTheory.tuitionTalons,0);
  A.equal(guided.table.arcaneCircleRevision.attempts[0].
   theoreticalGuidance.witnessHash.length,64);
  A.equal(E.importGame(E.exportGame(guided)).table.arcaneCircleRevision
   .attempts[0].theoreticalGuidance.sourceId,id);
  // A badly matched topic cannot offer any Arcane help, no matter the
  // attractive label or player's desire to use it.
  const invalid=fresh(612119);
  invalid.world.location='academy';
  R.act(invalid,{system:'npc',operation:'converse',params:{npcId:id}});
  const snap=E.exportGame(invalid),rng=invalid.rngState;
  A.throws(()=>work(invalid,{design:DESIGN,guidanceId:'unknown_mentor'}),
   /source-backed/);
  A.equal(E.exportGame(invalid),snap);A.equal(invalid.rngState,rng);
 }finally{delete E.NPCS[id];}
}

// The Second Circle's two real channels must matter during play, but only
// with BOTH spells actually learned. No stage counter alone gives either
// spell or a free second enemy decision.
function realDual(seedStart=620100){
 for(let seed=seedStart;seed<seedStart+65;seed++){
  const s=fresh(seed),ward=Self.learn(s,'arcane_ward',{route:'independent'});
  if(!ward.learned)continue;
  const spark=Self.learn(s,'arcane_spark',{route:'independent'});
  if(!spark.learned)continue;
  let built=false;
  for(let n=0;n<7&&!built;n++)
   built=work(s,{design:DESIGN,minutes:180}).constructed;
  if(built)return s;
 }
 throw Error('No independent student earned Ward, Spark and a genuine dual-channel Second Circle');
}
function dualFoe(s){
 A.equal(E.dispatch(s,'travel forest').ok,true);
 s.beasts.fox={id:'fox',name:'Observed Territorial Fox',species:'fenfox',
  evolutionStage:'Base',sapience:1,hp:30,maxHp:30,location:'forest'};
 s.encounter={beastId:'fox',observed:true,threat:true};
 s.beasts.fox.combatAssessment={
  beastId:'fox',species:'fenfox',evolutionStage:'Base',sapience:1,
  worldMinute:s.world.minutes,
  source:'Independently witnessed and verified forest animal combat anatomy',
  behavior:{style:'territorial',nonlethal:true,canCommunicate:false,
   withdrawalDC:15,parleyDC:18,
   source:'Actually observed and independently profiled territorial behaviour'},
  stats:{toughness:12,defense:12,stamina:8,vigor:1,will:1,offM:0,durM:0,
   sapience:1,attack:28,damage:60,boxes:[3,2,1]}
 };
 A.equal(R.act(s,{system:'combat',operation:'begin',
  params:{beastId:'fox'}}).started,true);
}
const dualAct=(s,params={intent:'dual_cast'})=>
 R.act(s,{system:'combat',operation:'exchange',params});
{
 const novice=fresh(620099);
 dualFoe(novice);
 const before=E.exportGame(novice),rng=novice.rngState;
 A.throws(()=>dualAct(novice),/genuinely earned, stable Second Arcane Circle/);
 A.equal(E.exportGame(novice),before);A.equal(novice.rngState,rng);
}
{
 // Genuine structural ability cannot auto-teach the two component spells.
 const s=fresh(620098);let built=false;
 for(let n=0;n<8&&!built;n++)built=work(s,{design:DESIGN,minutes:180}).constructed;
 A.equal(built,true);
 A.equal(s.table.arcaneTechniques?.arcane_spark,undefined);
 A.equal(s.table.arcaneTechniques?.arcane_ward,undefined);
 dualFoe(s);
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>dualAct(s),/actual taught First-Circle Arcane Spark|self-taught technique|actual original independent technique/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=realDual(),original=E.exportGame(s);
 A.equal(s.player.arcane.circles,2);
 A.equal(s.player.arcane.channels,2);
 A.ok(s.table.arcaneTechniques.arcane_ward);
 A.ok(s.table.arcaneTechniques.arcane_spark);
 dualFoe(s);
 const preview=R.act(s,{system:'arcane',operation:'dualChannelStatus',params:{}});
 A.equal(preview.architectureEarned,true);
 A.equal(preview.sparkCurrentlyCastable,true);
 A.equal(preview.wardCurrentlyCastable,true);
 A.equal(preview.ready,true);
 A.equal(preview.combinedManaCost,4);
 const good=E.exportGame(s),rng=s.rngState;
 A.throws(()=>R.act(s,{system:'arcane',operation:'dualChannelStatus',
  params:{freeMana:100}}),/read-only/);
 A.equal(E.exportGame(s),good);A.equal(s.rngState,rng);
 for(const p of [
  {intent:'dual_cast',manaCost:0},
  {intent:'dual_cast',techniqueId:'new_legendary_spell'},
  {intent:'dual_cast',enemyPlan:'hold'},
  {intent:'dual_cast',nonlethal:false},
  {intent:'dual_cast',wardSteps:999},
  {intent:'dual_cast',attackId:'unearned_staff'}
 ]){
  A.throws(()=>dualAct(s,p),/cannot be caller-selected|Only a real attack spell|Weapon action and nonlethal|appl.*only/);
  A.equal(E.exportGame(s),good);A.equal(s.rngState,rng);
 }
 s.table.combatants.player.ward={steps:1,magnitude:0};
 const already=E.exportGame(s),activeRng=s.rngState;
 A.throws(()=>dualAct(s),/active Ward already protects/);
 A.equal(E.exportGame(s),already);A.equal(s.rngState,activeRng);
 s.table.combatants.player.ward=null;
 s.player.mana=3;
 const low=E.exportGame(s),lowRng=s.rngState;
 A.throws(()=>dualAct(s),/combined real Mana cost/);
 A.equal(E.exportGame(s),low);A.equal(s.rngState,lowRng);
 s.player.mana=14;
 const start=s.world.minutes,mana=s.player.mana;
 const out=dualAct(s);
 A.equal(out.ownResult.dualChannel,true);
 A.deepEqual(out.ownResult.verifiedTechniques,['arcane_ward','arcane_spark']);
 A.equal(out.ownResult.channels,2);
 A.equal(out.ownResult.ward.verifiedTechniqueId,'arcane_ward');
 A.ok(out.ownResult.ward.check.roll>=1&&out.ownResult.ward.check.roll<=20);
 A.ok(out.ownResult.spark.roll>=1&&out.ownResult.spark.roll<=20);
 A.equal(out.ownResult.manaSpent,
  out.ownResult.ward.manaSpent+out.ownResult.spark.manaSpent);
 A.equal(s.player.mana,mana-out.ownResult.manaSpent);
 A.equal(s.world.minutes,start+1);
 A.equal(out.ownResult.ward.expiry.expired,out.ownResult.ward.cast);
 A.equal(R.combat.get(s,'player').ward??null,null);
 A.equal(out.ownResult.oneIndependentEnemyPlan,true);
 A.equal(out.ownResult.noFreeSpell,true);
 A.ok(['attack','hold','retreat'].includes(out.enemyPlan));
 // The spell architecture never changed the distinct evolution, Soul,
 // Meridian, Qi or partner tracks merely by doing simultaneous casting.
 A.equal(s.player.arcane.circles,2);
 A.equal(s.player.partnerIds.length,0);
 A.equal(s.player.meridian.stage,E.importGame(original).player.meridian.stage);
}
{
 const s=realDual(621200);dualFoe(s);
 const original=E.exportGame(s);
 for(const tamper of [
  x=>{x.table.arcaneArchitecture.circle2.channelCount=8;},
  x=>{x.table.arcaneCircleRevision.attempts[0].earnedIntegrity=99;},
  x=>{x.table.arcaneArchitecture.circle2.noNewSpellGranted=false;},
  x=>{x.player.arcane.circles=1;},
  x=>{x.table.disciplineTraining.arcane.history=
    x.table.disciplineTraining.arcane.history.filter(e=>e.target!=='circle2');}
 ]){
  const damaged=E.importGame(original);tamper(damaged);
  const before=E.exportGame(damaged),rng=damaged.rngState;
  A.throws(()=>dualAct(damaged),/genuinely earned, stable Second Arcane Circle/);
  A.equal(E.exportGame(damaged),before);
  A.equal(damaged.rngState,rng);
 }
}
{
 const s=realDual(622300);dualFoe(s);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-arcane-two-channel-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const initial=FS.readFileSync(file,'utf8');
  const status=Turn.execute(file,{id:'dual_status_620101',mode:'act',
   action:'dual casting status'});
  A.equal(status.applied,false);
  A.equal(status.output.ability.ready,true);
  A.equal(FS.readFileSync(file,'utf8'),initial);
  const forged={id:'dual_fake_620101',mode:'rule',
   system:'combat',operation:'exchange',
   params:{intent:'dual_cast',wardSteps:1000}};
  A.throws(()=>Turn.execute(file,forged),/cannot be caller-selected/);
  A.equal(FS.readFileSync(file,'utf8'),initial);
  const request={id:'dual_real_620101',mode:'act',
   action:'cast arcane spark while warding'};
  const r=Turn.execute(file,request);
  A.equal(r.applied,true);
  A.equal(r.output.combat.ownResult.dualChannel,true);
  A.equal(Turn.execute(file,request).duplicate,true);
  const after=FS.readFileSync(file,'utf8'),state=E.importGame(after);
  A.equal(state.world.minutes,s.world.minutes+1);
  A.equal(state.player.arcane.circles,2);
  A.equal(state.player.mana,
   s.player.mana-r.output.combat.ownResult.manaSpent);
  A.equal(state.table.combatants.player.ward??null,null);
  A.notEqual(after,initial);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}


// An earned technique remains authentic after ordinary narrative log rotation.
// The sealed original study and successful check survive in the separate
// independently learned technique evidence, not new chosen magic rolls.
{
 const s=realDual(623300),earlier=E.exportGame(s);
 const earned=s.table.selfTaughtBasic.attempts.filter(x=>
  ['arcane_spark','arcane_ward'].includes(x.techniqueId)&&x.success);
 A.equal(earned.length,2);
 A.ok(earned.every(x=>x.witnessEvent?.type==='world'&&
  x.rollEvent?.type==='roll'));
 for(let i=0;i<105;i++)
  R.core.event(s,'story','Unrelated witnessed ordinary passage '+i);
 A.equal(s.log.some(e=>e.details?.origin==='actual-independent-basic-technique-study'),false);
 A.equal(Self.profile(s,'arcane_spark').techniqueId,'arcane_spark');
 A.equal(Self.profile(s,'arcane_ward').techniqueId,'arcane_ward');
 dualFoe(s);
 A.equal(R.act(s,{system:'arcane',operation:'dualChannelStatus',params:{}}).ready,true);
 const save=E.exportGame(s),rng=s.rngState;
 const altered=E.importGame(save);
 altered.table.selfTaughtBasic.attempts.find(x=>x.techniqueId==='arcane_spark').witnessEvent.details.source='forged power';
 const damaged=E.exportGame(altered),damagedRng=altered.rngState;
 A.throws(()=>Self.profile(altered,'arcane_spark'),/archived original technique evidence was altered/);
 A.throws(()=>dualAct(altered),/archived original technique evidence was altered/);
 A.equal(E.exportGame(altered),damaged);A.equal(altered.rngState,damagedRng);
 A.equal(E.exportGame(s),save);A.equal(s.rngState,rng);
 const legacy=E.importGame(earlier);
 for(const a of legacy.table.selfTaughtBasic.attempts){
  delete a.witnessEvent;delete a.rollEvent;
 }
 A.equal(Self.profile(legacy,'arcane_spark').techniqueId,'arcane_spark');
 for(let i=0;i<105;i++)
  R.core.event(legacy,'story','Later scene that does not create older spell authority '+i);
 A.throws(()=>Self.profile(legacy,'arcane_spark'),
  /actual original independent technique study and honest successful check are missing or forged/);
}

console.log('Arcane Second Circle is independently redesigned from earned geometry and Mana, costs genuine effort and rolls, grants no free spells, preserves older learned techniques and checkpoints idempotently');
