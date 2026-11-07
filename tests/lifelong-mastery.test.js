'use strict';
// Independent progression mechanics, real chronological world time, and
// physical invention upkeep. Only disposable test campaign states are used.
const A=require('node:assert/strict'),E=require('../engine.js'),
 FS=require('node:fs'),Path=require('node:path'),OS=require('node:os'),
 R=require('../rules'),L=require('../rules/mastery-lifepath'),
 Rank=require('../rules/rank-depth'),Turn=require('../scripts/chat-turn.js');
const s0=seed=>E.newGame({name:'Lifelong Mastery Fixture',seed,path:'undecided'});
const route=(s,system,operation,params={})=>R.act(s,{system,operation,params});
const view=s=>route(s,'rankings','detail');
function water(){return {title:'Civil Reed Gauge for Local Shore Work',
 purpose:'Maintain a water gauge that helps local families plan ordinary journeys safely without performing magic.',
 medium:'tool',system:'mundane',function:'sense',target:'surface_water',
 magnitude:0,range:'touch',area:'single',duration:'1min',novelty:'variant',
 materials:[{id:'marsh_reed',quantity:2}]};}
{
 const s=s0(877011),snapshot=E.exportGame(s),rng=s.rngState;
 const stat=view(s);
 const expectation={
  meridian:12,arcane:12,soul:10,body:10,rift:11,
  origin:11,evolution:10,sync:13
 };
 for(const [path,total]of Object.entries(expectation)){
  const item=stat.systems[path];
  A.equal(item.expandedLadderWaypoints,total,path+' now has three additional middle-stage milestones');
  A.equal(item.additionalMiddleStages.length,3);
  A.equal(item.deepMasteryDegrees.length,9);
  A.ok(item.additionalMiddleStages.every(x=>!x.attained));
 }
 A.equal(stat.professions.survival.expandedLadderWaypoints,9);
 A.equal(stat.professions.survival.additionalMiddleStages.length,3);
 A.equal(stat.professions.survival.extendedMasteryDegree,0);
 A.equal(stat.specialists['Formation Mastery'].expandedLadderWaypoints,10);
 A.equal(stat.specialists['Formation Mastery'].personalRank,'not independently assessed');
 A.equal(stat.beastGrades.individualMiddleStudies.length,3);
 A.equal(stat.itemsAndResearch.materialQualityMilestones.length,3);
 A.equal(L.POINTS_PER_DEGREE,90);
 A.deepEqual(L.DEGREES.slice(-3),['Integrated control','Independent innovation','Peak mastery']);
 A.equal(Object.values(L.BRIDGES).every(x=>x.length===3),true);
 A.ok(!JSON.stringify(stat).includes('unlocked_tenth_circle'));
 A.deepEqual(route(s,'rankings','detail'),stat);
 A.equal(E.exportGame(s),snapshot);A.equal(s.rngState,rng);
 for(const forbidden of [
  {path:'profession',skill:'survival',focus:'observation',days:6,rank:5},
  {path:'arcane',focus:'analysis',days:6,stage:9},
  {path:'profession',skill:'survival',focus:'wish',days:6},
  {path:'profession',skill:'no_such_skill',focus:'observation',days:6},
  {path:'profession',skill:'survival',focus:'observation',days:360}
 ])A.throws(()=>route(s,'rankings','practice',forbidden),
  /Mastery requires|practice focus|actual existing profession/);
 A.equal(E.exportGame(s),snapshot);
 A.throws(()=>route(s,'rankings','practice',{
  path:'arcane',focus:'analysis',days:6
 }),/has not been independently established/);
 A.throws(()=>route(s,'rankings','bridge',{
  path:'profession',skill:'survival'
 }),/genuinely mastered current stage/);
 A.equal(E.exportGame(s),snapshot);
}
{
 const s=s0(877012),before=s.world.minutes,
  initialRank=s.player.skills.survival.rank;
 const result=route(s,'rankings','practice',{
  path:'profession',skill:'survival',focus:'observation',days:30
 });
 A.equal(result.elapsedDays,30);
 A.equal(result.checks.length,5);
 A.equal(s.world.minutes,before+30*1440);
 A.equal(result.practiceSixdays,5);
 A.equal(result.noFreeTechnique,true);
 A.equal(result.notACanonicalBreakthrough,true);
 A.equal(s.player.skills.survival.rank,initialRank);
 A.equal(s.player.meridian.stage,0);
 A.equal(s.player.arcane.circles,0);
 A.equal(s.player.partnerIds.length,0);
 const earned=result.checks.reduce((n,c)=>n+c.progress,0);
 A.equal(result.earnedProgress,earned);
 const record=s.table.lifelongMastery['profession:survival:1'];
 A.equal(record.points,earned);
 A.equal(record.events.length,5);
 A.equal(record.methods.observation,5);
 A.equal(record.workSixdays,5);
 A.equal(record.successes,result.successfulChecks);
 A.equal(record.sourceHash,L.hash(record.source));
 A.ok(record.events.every(x=>/^[a-f0-9]{64}$/.test(x.checkHash)));
 A.equal(view(s).professions.survival.extendedMasteryDegree,0,
  'one month of training does not award lifelong mastery');
 A.deepEqual(view(s).professions.survival.additionalMiddleStages
  .filter(x=>x.attained),[]);
 A.throws(()=>route(s,'rankings','bridge',{
  path:'profession',skill:'survival'
 }),/genuinely mastered current stage/);
 const save=E.exportGame(s),copy=E.importGame(save),next={
  path:'profession',skill:'survival',focus:'repetition',days:30
 };
 const left=route(s,'rankings','practice',next);
 const right=route(copy,'rankings','practice',next);
 A.deepEqual(left.checks,right.checks,'identical replay yields identical authentic checks');
 A.deepEqual(s.table.lifelongMastery,copy.table.lifelongMastery);
 A.equal(E.exportGame(s),E.exportGame(copy));
 A.equal(view(s).professions.survival.canonicalRank,1);
 A.equal(s.player.skills.survival.rank,1);
}
{
 const s=s0(877013);
 const pure=E.exportGame(s);
 // A person without an academy, paid tutor or existing Crafting rank can
 // start learning from actual work. No sixday waiting requirement.
 const early=route(s,'rankings','practice',{
  path:'profession',skill:'crafting',focus:'observation',minutes:15
 });
 A.equal(early.elapsedMinutes,15);
 A.equal(early.practiceSessions,1);
 A.equal(early.notACanonicalBreakthrough,true);
 A.equal(s.table.lifelongMastery['profession:crafting:0'].workSixdays,0);
 A.equal(s.table.lifelongMastery['profession:crafting:0'].workMinutes,15);
 A.equal(s.world.minutes,480+15);
 A.equal(s.player.skills.crafting.rank,0);
 const p=L.derived(s,'profession','survival');
 A.equal(p.factor,1,'average verified aptitude receives no arbitrary acceleration');
 const talented=s0(877014);
 talented.player.attributes.int=19;
 talented.player.skills.research.rank=4;
 const baseline=L.derived(talented,'profession','research');
 A.ok([1,2,3].includes(baseline.factor));
 A.equal(talented.player.skills.research.rank,4);
 A.equal(L.BRIDGES.specialist.length,3);
 A.equal(L.BRIDGES.sync.length,3);
}
{
 // Identical real work and aptitude produce identical progress regardless
 // of whether a character had a quarter-hour or an afternoon available.
 const a=s0(877120),b=E.importGame(E.exportGame(a));
 const short=route(a,'rankings','practice',{
  path:'profession',skill:'survival',focus:'observation',minutes:15});
 const longer=route(b,'rankings','practice',{
  path:'profession',skill:'survival',focus:'observation',minutes:240});
 A.equal(short.checks.length,1);
 A.deepEqual(short.checks,longer.checks);
 A.equal(short.earnedProgress,longer.earnedProgress);
 A.equal(short.masteryDegree,longer.masteryDegree);
 A.equal(short.elapsedMinutes,15);
 A.equal(longer.elapsedMinutes,240);
 A.equal(a.world.minutes+225,b.world.minutes);
 A.equal(a.table.lifelongMastery['profession:survival:1'].workSixdays,0);
 A.equal(b.table.lifelongMastery['profession:survival:1'].workSixdays,0);
 // Passing whole days without *doing anything* grants zero mastery.
 const old=R.act(a,{system:'rankings',operation:'detail',params:{}});
 const World=require('../rules/world');
 World.advance(a,6);
 const after=R.act(a,{system:'rankings',operation:'detail',params:{}});
 A.equal(after.professions.survival.extendedMasteryDegree,
  old.professions.survival.extendedMasteryDegree);
 A.equal(after.professions.survival.earnedMasteryProgress,
  old.professions.survival.earnedMasteryProgress);
}
{
 // Aptitude is a performance multiplier, not a number of compulsory years.
 const Char=require('../rules/character');
 const ordinary=s0(877130),exceptional=E.importGame(E.exportGame(ordinary));
 for(const actor of [ordinary,exceptional]){
  actor.player.skills.research.rank=4;
  actor.player.attributes.int=19;
  actor.player.capabilityProfile=Char.make(actor);
 }
 ordinary.player.capabilityProfile.potential.comprehension.latent=1;
 exceptional.player.capabilityProfile.potential.comprehension.latent=9;
 A.equal(L.derived(ordinary,'profession','research').factor,1);
 A.equal(L.derived(exceptional,'profession','research').factor,3);
 const short=route(ordinary,'rankings','practice',{
  path:'profession',skill:'research',focus:'observation',minutes:30});
 const gifted=route(exceptional,'rankings','practice',{
  path:'profession',skill:'research',focus:'observation',minutes:30});
 A.equal(gifted.checks[0].roll,short.checks[0].roll);
 A.equal(gifted.earnedProgress,short.earnedProgress*3);
 A.equal(gifted.elapsedMinutes,30);
}
{
 // Increasing rank depth demands a tougher real challenge, not more days.
 // This isolated fixture injects a verified-shaped partial transcript to
 // exercise the difficulty curve without hundreds of calendar ticks.
 const s=s0(877139),id='profession:survival:1';
 const src={origin:L.ORIGIN,key:id,path:'profession',skill:'survival',
  stage:1,startedAtMinute:s.world.minutes,recordedBy:s.player.name};
 s.table||={};
 s.table.lifelongMastery={[id]:{
  origin:L.ORIGIN,key:id,path:'profession',stage:1,source:src,
  sourceHash:L.hash(src),points:450,workSixdays:0,workSessions:5,
  workMinutes:75,successes:5,methods:{observation:5},
  provenMethods:{observation:5},events:[],bridges:[],lastCompletedDay:0
 }};
 const old=s.world.minutes;
 const challenged=route(s,'rankings','practice',{
  path:'profession',skill:'survival',focus:'observation',minutes:15});
 A.equal(challenged.checks[0].dc,17);
 A.equal(challenged.elapsedMinutes,15);
 A.equal(s.world.minutes-old,15);
 A.equal(s.table.lifelongMastery[id].workSixdays,0,
  'the earned challenge scales with demonstrated skill, not with completed sixdays');
}
{
 // A qualified advanced integration trial requires deep demonstrable
 // skill, NOT sixdays of mandated rest or thirty counted calendar sessions.
 const s=s0(877140),id='profession:survival:1',
  source={origin:L.ORIGIN,key:id,path:'profession',
   skill:'survival',stage:1,startedAtMinute:s.world.minutes,
   recordedBy:s.player.name};
 s.table||={};
 s.table.lifelongMastery={
  [id]:{origin:L.ORIGIN,key:id,path:'profession',stage:1,source,
   sourceHash:L.hash(source),points:810,workSixdays:0,workSessions:4,
   workMinutes:60,successes:4,
   methods:{observation:1,repetition:1,'field-application':1,repair:1,
    innovation:1},
   provenMethods:{observation:1,repetition:1,
    'field-application':1,repair:1,innovation:1},
   events:[],bridges:[],lastCompletedDay:0}
 };
 A.equal(L.current(s,'profession','survival').level,9);
 const previous=s.world.minutes;
 const outcome=route(s,'rankings','bridge',
  {path:'profession',skill:'survival'});
 A.equal(s.world.minutes,previous+120);
 A.equal(outcome.elapsedMinutes,120);
 A.equal(outcome.noCalendarRequirement,true);
 A.equal(outcome.noStagePromotion,true);
 A.equal(s.player.skills.survival.rank,1);
 A.equal(s.table.lifelongMastery[id].workSixdays,0);
 A.equal(s.table.lifelongMastery[id].workSessions,5);
}

{
 const s=s0(877015);
 A.equal(E.dispatch(s,'travel fen').ok,true);
 s.player.inventory.marsh_reed=25;
 const draft=route(s,'creation','draft',water());
 let built=null;
 for(let n=0;n<12;n++){
  const x=route(s,'creation','prototype',{id:draft.id});
  if(x.assembled){built=x;break;}
 }
 A.ok(built,'a genuine physical construction succeeds in bounded repeated honest trials');
 const t=s.table.creationPrototypes[built.prototypeId];
 const initial=t.durability;
 A.equal(initial,5);
 // Physically wear a tool through real calibration attempts, retaining
 // the original design and authentic material origin.
 let attempts=0;
 while(t.durability>=5&&attempts<6){
  route(s,'creation','calibrate',{id:draft.id});
  attempts++;
 }
 A.ok(t.durability<5);
 const before=s.world.minutes,stock=s.player.inventory.marsh_reed;
 const repaired=route(s,'creation','repair',{id:draft.id});
 A.equal(s.world.minutes,before+50);
 A.equal(s.player.inventory.marsh_reed,stock-1);
 A.equal(repaired.elapsedMinutes,50);
 A.equal(repaired.materialUsed.marsh_reed,1);
 A.ok(repaired.check.roll>=1&&repaired.check.roll<=20);
 A.equal(t.repairs.length,1);
 A.equal(t.repairs[0].success,repaired.repaired);
 A.equal(t.repairs[0].rollHash.length,64);
 A.ok(t.durability<=5);
 if(repaired.repaired){
  A.equal(t.status,'unverified','maintenance requires real recalibration');
  A.equal(repaired.needsFreshCalibration,true);
  A.throws(()=>route(s,'creation','measure',{id:draft.id}),
   /successful genuine local calibration/);
 }
 const reread=E.importGame(E.exportGame(s));
 A.deepEqual(reread.table.creationPrototypes[built.prototypeId],t);
 A.equal(view(s).professions.crafting.canonicalRank,
  s.player.skills.crafting.rank);
 const safe=E.exportGame(s);
 A.throws(()=>route(s,'creation','repair',{
  id:draft.id,freeMaterials:true,success:true
 }),/genuine preexisting design ID/);
 A.equal(E.exportGame(s),safe);
}
{
 const s=s0(877016),dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-deepmaster-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const frozen=FS.readFileSync(file,'utf8');
  const read={id:'mastery_readonly_status_0001',
   mode:'rule',system:'rankings',operation:'detail',params:{}};
  A.equal(Turn.execute(file,read).applied,false);
  A.equal(FS.readFileSync(file,'utf8'),frozen);
  const req={id:'lifelong_practice_0001',mode:'rule',
   system:'rankings',operation:'practice',params:{
    path:'profession',skill:'survival',focus:'observation',days:6}};
  const one=Turn.execute(file,req);
  A.equal(one.applied,true);
  A.equal(one.output.rules.elapsedDays,6);
  A.equal(Turn.execute(file,req).duplicate,true);
  const loaded=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(loaded.table.lifelongMastery['profession:survival:1'].workSixdays,1);
  A.equal(loaded.table.lifelongMastery['profession:survival:1'].workSessions,1);
  A.equal(loaded.world.minutes,s.world.minutes+6*1440);
  const saved=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{...req,id:'fake_mastery_0002',
   params:{...req.params,mastery:9}}),/Mastery requires/);
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Mastery has 3 genuine mid-ladder milestones and 9 earnable within-stage degrees, advances through actual sixday world time, and sourced inventions require physical upkeep');
