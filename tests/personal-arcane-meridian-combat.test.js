'use strict';
// Reuse the actual creation.draft/personalDevelop and single ordinary
// combat.exchange; no new signature-action ladder and no free high-stage
// attack, spell, transformation, enemy choice or second roll.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine'),R=require('../rules'),
 C=require('../rules/creation-design'),D=require('../rules/disciplines'),
 Spark=require('../rules/arcane-spark'),
 QiStrike=require('../rules/meridian-qi-strike'),
 Turn=require('../scripts/chat-turn');
const act=(s,system,operation,params={})=>R.act(s,{system,operation,params});
const firstGeometry='Measured First Circle built from a stable sixfold Mana Core return geometry';
const secondGeometry='Counter-rotating paired Circle return loops preserving the original formula anchor and a stable second channel';
const thirdGeometry='Three independent Circle paths cross-coupled by a stable return matrix with measured resonance feedback, allowing the practitioner to monitor the existing First Circle formula at every channel.';
const origin='Personal meridian gate transition derived from authenticated prior training at Morrowfen Crossing';
function recovery(s,resource,need){
 if(s.player[resource]>=need)return;
 for(let i=0;i<8&&s.player[resource]<need;i++)
  act(s,'health','sleep',{hours:8});
 A.ok(s.player[resource]>=need,'Actual ordinary recovery must restore '+resource);
}
function arcane(seed=971501,force=false){
 const s=E.newGame({seed,name:force?'Shale-Shoulder Mage':'Rain-Count Mage',path:'arcane',background:force?'fieldworker':'scholar'});
 R.unified.ensurePlayer(s);s.world.location='academy';
 s.player.attributes.int=30;s.player.skills.arcana.rank=5;
 const a=s.player.arcane,p=R.build.arcaneProfile(1);
 a.coreIgnited=true;a.circles=1;a.geometry=firstGeometry;
 a.structuredMana=p.mana;a.channels=p.channels;a.maxComplexity=p.maxComplexity;
 s.table.disciplineTraining||={};
 s.table.disciplineTraining.arcane={target:null,points:0,weeks:0,
  methods:{},cooldownUntil:0,complications:[],history:[
   {day:1,target:'core',quality:'strong',change:'Mana Core ignited, no Circle yet'},
   {day:1,target:'circle1',quality:'strong',change:'First Circle constructed; '+firstGeometry}
  ]};
 recovery(s,'mana',2);
 const learned=act(s,'arcane','sparkStudy',{route:'independent'});
 A.equal(learned.learned,true,'Original Arcane Spark must be learned, not granted by Circle');
 for(let i=0;i<15&&s.player.arcane.circles===1;i++){
  recovery(s,'mana',2);
  act(s,'arcane','circleWork',{design:secondGeometry,minutes:15});
 }
 A.equal(s.player.arcane.circles,2);
 for(let i=0;i<12&&s.player.arcane.circles===2;i++){
  recovery(s,'mana',4);
  act(s,'arcane','matrixWork',{design:thirdGeometry,
   focus:i%2?'formula-feedback':'integrated',minutes:15});
 }
 A.equal(s.player.arcane.circles,3);
 A.equal(D.verifyThirdCircle(s).number,3);
 recovery(s,'mana',10);
 A.equal(Spark.attackProfile(s,'arcane_spark').techniqueId,'arcane_spark');
 if(force){s.player.attributes.int=20;s.player.attributes.str=30;}
 return s;
}
function meridian(seed=971502,force=false){
 const s=E.newGame({seed,name:force?'Stone-Palm Wanderer':'River-Line Wanderer',path:'meridian',background:force?'fieldworker':'scholar'});
 R.unified.ensurePlayer(s);s.world.location='crossing';
 s.player.attributes.wis=30;s.player.skills.cultivation.rank=5;
 s.player.meridian.stage=3;
 s.table.disciplineTraining||={};
 s.table.disciplineTraining.meridian={
  target:null,points:0,weeks:0,methods:{},cooldownUntil:0,
  complications:[],history:[
   {day:1,target:'foundation',quality:'strong',
    change:'Stage I Foundation Tempering; Firm structural foundation'},
   {day:1,target:'awakening',quality:'strong',
    change:'Stage II Meridian Awakening; all 12 Primary Meridians consciously mapped'}
  ]};
 s.table.powerPhysiology={meridian:{foundationQuality:'Firm',
  primaryMapped:12,gateRecords:[],transitions:[],deviationHistory:[]}};
 for(let i=1;i<=107;i++){
  const band=i<=36?'Lower':i<=72?'Middle':'High';
  const gate={number:i,band,quality:'Sound'};
  s.player.meridian.gates.push(gate);
  s.table.powerPhysiology.meridian.gateRecords.push({...gate,day:1});
  if(i===36||i===72)s.table.powerPhysiology.meridian.transitions.push({
   gate:i,day:1,quality:'Sound',route:'independent',source:origin});
 }
 recovery(s,'qi',3);
 const learned=act(s,'meridian','qiStrikeStudy',{route:'independent'});
 A.equal(learned.learned,true,'Qi Strike must be actually learned');
 let last=null;
 for(let i=0;i<100;i++){
  last=act(s,'meridian','gatePractice',{force:false,minutes:15});
  if(last.opened)break;
 }
 A.ok(last.opened);A.equal(last.opened.number,108);
 let formed=null;
 for(let i=0;i<15&&!formed;i++){
  recovery(s,'qi',8);
  const r=act(s,'meridian','seaWork',{method:i%2?'circulation':'integrated',minutes:15,
   approach:'Stabilise the inherited original 108 Gate circulation without assuming a new body rank'});
  formed=r.formed?r:null;
 }
 A.ok(formed);
 A.equal(s.player.meridian.stage,4);
 A.equal(s.table.meridianSeaFormation.points,5);
 recovery(s,'qi',15);
 A.equal(QiStrike.attackProfile(s,'qi_strike').techniqueId,'qi_strike');
 if(force){s.player.attributes.wis=20;s.player.attributes.str=30;}
 return s;
}
function concept(system){
 return {
  title:system==='arcane'?'Rain-Count Resonant Spark':'River-Line Focused Qi Palm',
  purpose:'Refine one genuinely learned original close-range technique by incorporating my earned anatomy, learned structure and individual trained instincts without inventing a new element or beast ability.',
  medium:'technique',system,function:'strike',magnitude:0,
  range:'close',area:'single',duration:'instant',novelty:'variant',materials:[]
 };
}
function develop(s,system){
 const v=act(s,'creation','draft',concept(system));
 const energy=system==='arcane'?'mana':'qi',cost=2;
 const ready=act(s,'creation','personalStatus',{id:v.id});
 A.equal(ready.expressions[0].started,false);
 let completed=null;
 for(let i=0;i<12&&!completed;i++){
  recovery(s,energy,system==='arcane'?4:5);
  const r=act(s,'creation','personalDevelop',{id:v.id,minutes:15,
   approach:'Experiment with a bounded variation of my own learned strike using the personally earned energy architecture and its actual faults'});
  A.equal(r.staminaSpent,1);A.equal(r.energySpent,cost);
  A.ok(Number.isInteger(r.check.roll));
  completed=r.developed?r:null;
 }
 A.ok(completed);
 A.equal(act(s,'creation','status',{id:v.id}).designs[0].personalExpression.completed,true);
 return {id:v.id,completed};
}
function enemy(s){
 s.world.location='forest';
 s.beasts.fox={id:'fox',name:'Independent Assessed Lanternfen Animal',
  species:'fenfox',evolutionStage:'Base',sapience:1,
  location:'forest',hp:40,maxHp:40};
 s.encounter={beastId:'fox',observed:true,threat:true};
 s.beasts.fox.combatAssessment={beastId:'fox',species:'fenfox',
  evolutionStage:'Base',sapience:1,worldMinute:s.world.minutes,
  source:'Independent field-assessed anatomical and combat risk evidence for this specific threatened wild animal',
  behavior:{style:'territorial',nonlethal:true,canCommunicate:false,
   withdrawalDC:15,parleyDC:18,
   source:'Actual recorded individual nonlethal territorial defence when cornered'},
  stats:{toughness:35,defense:12,stamina:8,vigor:1,will:1,
   offM:0,durM:0,sapience:1,attack:1,damage:0,boxes:[3,2,1]}};
 A.equal(act(s,'combat','begin',{beastId:'fox'}).verifiedIndividualProfile,true);
}
for(const system of ['arcane','meridian']){
 const ready=system==='arcane'?arcane(971501):meridian(971502);
 const originalStage=system==='arcane'?3:4;
 const {id,completed}=develop(ready,system);
 A.equal(completed.signatureMode,'precision');
 A.equal(completed.characterBasis.source.kind,
  system==='arcane'?'arcane-matrix':'meridian-sea');
 const adapter=system==='arcane'?'arcane-spark-personal-variation':
  'meridian-qi-strike-personal-variation';
 A.equal(C.earnedPersonal(ready,id).usableAdapter,adapter);
 A.equal(C.earnedPersonal(ready,id).signatureMode,'precision');
 A.equal(ready.player.humanEvolution.stage,0);
 A.equal(ready.player.origin.phase,0);
 A.equal(system==='arcane'?ready.player.arcane.circles:ready.player.meridian.stage,originalStage);
 const saved=E.importGame(E.exportGame(ready));
 A.equal(C.earnedPersonal(saved,id).signatureMode,'precision');
 const snapshot=E.exportGame(ready),rng=ready.rngState;
 A.throws(()=>act(ready,'creation','personalUse',{id}),
  /no established runnable effect/);
 A.equal(E.exportGame(ready),snapshot);A.equal(ready.rngState,rng,
  'A combat expression is not a free out-of-encounter action');
 const intent=system==='arcane'?'cast':'technique';
 const tech=system==='arcane'?'arcane_spark':'qi_strike';
 const base=system==='arcane'?Spark.attackProfile(ready,tech):
  QiStrike.attackProfile(ready,tech);
 const preview=C.combatPersonal(ready,id,intent,base);
 A.equal(preview.mode,'precision');
 A.equal(preview.profile.modifier,base.modifier+1);
 A.equal(preview.profile.damage,base.damage);
 A.equal(preview.extraEnergy,system==='arcane'?1:2);
 const altered=E.importGame(snapshot);
 altered.table.creationDesigns.records[id].personalDevelopment.attempts[0].earned=99;
 A.throws(()=>C.combatPersonal(altered,id,intent,base),
  /original skill checks|authentic completed/);
 enemy(ready);
 const before=E.exportGame(ready),rngBefore=ready.rngState,
  initialTime=ready.world.minutes,initialSta=ready.player.stamina,
  initialEnergy=ready.player[system==='arcane'?'mana':'qi'];
 for(const args of [
  {intent,techniqueId:tech,personalDesignId:'design_999'},
  {intent,techniqueId:tech,personalDesignId:id,damage:900},
  {intent,techniqueId:tech,personalDesignId:id,bonus:99},
  {intent:'defend',personalDesignId:id},
  {intent:'dual_cast',personalDesignId:id}
 ]){
  A.throws(()=>act(ready,'combat','exchange',args));
  A.equal(E.exportGame(ready),before);A.equal(ready.rngState,rngBefore);
 }
 const result=act(ready,'combat','exchange',{
  intent,techniqueId:tech,personalDesignId:id});
 A.equal(result.ownResult.verifiedTechniqueId,tech);
 A.equal(result.ownResult.personalExpression.id,id);
 A.equal(result.ownResult.personalExpression.mode,'precision');
 A.equal(result.ownResult.personalExpression.noExtraAction,true);
 A.equal(result.ownResult.personalExpression.extraStaminaSpent,1);
 A.equal(ready.player.stamina,initialSta-1);
 A.equal(ready.world.minutes,initialTime+1);
 A.equal(ready.player[system==='arcane'?'mana':'qi'],
  initialEnergy-(system==='arcane'?result.ownResult.manaSpent:result.ownResult.qiSpent));
 A.equal(result.ownResult.qiSpent,system==='meridian'?5:undefined);
 A.equal(result.ownResult.personalExpression[system==='arcane'?'extraManaSpent':'extraQiSpent'],
  system==='arcane'?1:2);
 A.ok(['attack','hold','retreat'].includes(result.enemyPlan));
 const sameNamed=system==='arcane'?arcane(971503,true):meridian(971504,true);
 const second=develop(sameNamed,system);
 A.equal(second.completed.signatureMode,'impact');
 A.equal(C.earnedPersonal(sameNamed,second.id).signatureMode,'impact');
 A.notDeepEqual(second.completed.characterBasis,completed.characterBasis);
 const alt=C.combatPersonal(sameNamed,second.id,intent,
  system==='arcane'?Spark.attackProfile(sameNamed,tech):QiStrike.attackProfile(sameNamed,tech));
 A.equal(alt.profile.damage,base.damage+1);
 A.equal(alt.profile.modifier,
  system==='arcane'?Spark.attackProfile(sameNamed,tech).modifier:
   QiStrike.attackProfile(sameNamed,tech).modifier);
 A.equal(alt.noSecondRoll,true);
}
{
 // Real private runner saves one individual creation check exactly once.
 const s=arcane(971508);
 const draft=act(s,'creation','draft',concept('arcane'));
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-personal-strike-'));
 try{
  const file=Path.join(dir,'disposable.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const req={id:'personal_arcane_971508',mode:'rule',system:'creation',
   operation:'personalDevelop',
   params:{id:draft.id,minutes:15,
    approach:'Adapt my learned genuine First Circle Spark through the specifically earned Third Circle matrix'}};
  const one=Turn.execute(file,req);
  A.equal(one.applied,true);A.equal(one.ok,true);
  A.ok(Number.isInteger(one.output.rules.check.roll));
  const saved=FS.readFileSync(file,'utf8');
  const two=Turn.execute(file,req);
  A.equal(two.duplicate,true);A.equal(two.applied,false);
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Original creation dossiers develop distinct Arcane/Meridian combat expressions; one learned source-verified exchange, real energy and stamina, independent opponent, forged-proof refusal and replay');
