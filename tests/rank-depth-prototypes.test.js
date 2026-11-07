'use strict';
// True canonical multi-axis rank depth; one actually built, calibrated,
// physically limited civilian prototype. Disposable saves only.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),
 Proto=require('../rules/creation-prototype'),
 Design=require('../rules/creation-design'),
 Rank=require('../rules/rank-depth'),
 Turn=require('../scripts/chat-turn');
const go=(s,operation,params={})=>R.act(s,{system:'creation',operation,params});
const rank=s=>R.act(s,{system:'rankings',operation:'detail',params:{}});
const fresh=seed=>E.newGame({name:'Genuine Invention and Ranking Test',seed,path:'undecided'});
const spec=()=>({title:'Reed Surface-Water Field Gauge',
 purpose:'Measure rough visible wetland water availability to help ferry workers plan safe ordinary crossings and habitat care.',
 medium:'tool',system:'mundane',function:'sense',target:'surface_water',
 magnitude:0,range:'touch',area:'single',duration:'1min',novelty:'variant',
 materials:[{id:'marsh_reed',quantity:2}]});
function withMaterials(seed){
 const s=fresh(seed);
 A.equal(E.dispatch(s,'travel fen').ok,true);
 s.player.inventory.marsh_reed=18; // test fixture only, NOT a live save.
 return s;
}
function begin(s){
 const d=go(s,'draft',spec());
 A.equal(d.id,'design_1');return d;
}
{
 const s=fresh(848000),state=E.exportGame(s),rng=s.rngState;
 const result=rank(s);
 A.equal(result.professions.crafting.canonicalRank,0);
 A.equal(result.professions.crafting.title,'Untrained');
 A.equal(result.professions.crafting.withinRankDepth,'not established');
 A.equal(result.professions.crafting.demonstratedPracticeEvents,0);
 A.equal(result.professions.crafting.noRankIncrease,true);
 A.equal(result.systems.meridian.earnedStage,0);
 A.equal(result.systems.arcane.earnedStage,0);
 A.equal(result.systems.soul.earnedStage,0);
 A.equal(result.systems.body.earnedStage,0);
 A.equal(result.systems.rift.earnedStage,0);
 A.equal(result.systems.origin.earnedStage,0);
 A.equal(result.systems.evolution.earnedStage,0);
 A.equal(result.systems.evolution.stageName,'Baseline Human');
 A.equal(result.systems.sync.earnedStage,null);
 A.equal(result.systems.sync.withinStageDepth,'unassessed');
 A.equal(Rank.SYSTEM_INFO.meridian.stages.length,9);
 A.equal(Rank.SYSTEM_INFO.arcane.stages.length,9);
 A.equal(Rank.SYSTEM_INFO.soul.stages.length,7);
 A.equal(Rank.SYSTEM_INFO.body.stages.length,7);
 A.equal(Rank.SYSTEM_INFO.rift.stages.length,8);
 A.equal(Rank.SYSTEM_INFO.origin.stages.length,8);
 A.equal(Rank.SYSTEM_INFO.sync.stages.length,10);
 A.equal(Rank.SPECIALISTS.length,6);
 A.ok(Object.values(result.specialists).every(x=>
  x.personalRank==='not independently assessed'));
 A.deepEqual(Rank.SKILLS,['Untrained','Novice','Trained','Expert','Master','Grandmaster']);
 A.equal(result.itemsAndResearch.grade,'I–IX');
 A.throws(()=>R.act(s,{system:'rankings',operation:'detail',
   params:{setRank:5,mastered:true}}),/strictly read-only/);
 A.equal(E.exportGame(s),state);A.equal(s.rngState,rng);
}
{
 const s=withMaterials(848001),before=E.exportGame(s);
 A.equal(go(s,'evaluate',spec()).scopeHash,Design._debug.hash({
  medium:'tool',system:'mundane',function:'sense',magnitude:0,
  range:'touch',area:'single',duration:'1min',target:'surface_water'}));
 A.equal(E.exportGame(s),before);
 A.throws(()=>go(s,'evaluate',{...spec(),target:'souls_of_unseen_people'}),
  /actual medium|effect target/);
 A.throws(()=>go(s,'evaluate',{...spec(),quality:'ultimate'}),
  /Creation accepts/);
 A.equal(E.exportGame(s),before);
 const d=begin(s);
 A.equal(d.proposal.target,'surface_water');
 A.equal(s.table.creationDesigns.records[d.id].proposalHash,
  Design._debug.hash(s.table.creationDesigns.records[d.id].proposal));
 s.table.creationDesigns.records[d.id].proposal.title='Universal Wish Machine';
 const changed=E.exportGame(s);
 A.throws(()=>go(s,'prototype',{id:d.id}),/originally sealed/);
 A.equal(E.exportGame(s),changed);
}
{
 let success=null,fail=null;
 for(let i=0;i<160;i++){
  // Dispersed independent seeds avoid adjacent xorshift streams sharing
  // nearly identical first-roll outcomes. No outcome is predetermined.
  const seed=(848010+Math.imul(i,2654435761))>>>0;
  const s=withMaterials(seed);
  const d=begin(s);
  const before=s.world.minutes,stamina=s.player.stamina,
    materials=s.player.inventory.marsh_reed;
  const result=go(s,'prototype',{id:d.id});
  A.equal(result.elapsedMinutes,85);
  A.equal(result.staminaSpent,4);
  A.equal(s.world.minutes,before+85);
  A.equal(s.player.inventory.marsh_reed,materials-2);
  A.equal(s.player.stamina,stamina-4);
  A.equal(result.consumed.marsh_reed,2);
  A.equal(result.noTechniqueLearned,true);
  A.equal(s.player.arcane.circles,0);
  A.equal(s.player.soul.phase,0);
  A.equal(s.player.meridian.stage,0);
  A.equal(s.player.partnerIds.length,0);
  A.equal(s.table.creationDesigns.records[d.id].attempts.length,1);
  if(result.assembled&&!success)success={s,d,result};
  if(!result.assembled&&!fail)fail={s,d,result};
  if(success&&fail)break;
 }
 A.ok(success,'actual building can succeed through a real roll');
 A.ok(fail,'actual building can fail and consume real materials');
 const failure=fail;
 A.equal(failure.s.table.creationDesigns.records[failure.d.id].status,'trial-failed');
 A.equal(failure.s.table.creationDesigns.records[failure.d.id].prototypeId,undefined);
 A.equal(go(failure.s,'prototypeStatus').prototypes.length,0);
 const retry=go(failure.s,'prototype',{id:failure.d.id});
 A.equal(retry.consumed.marsh_reed,2);
 A.equal(failure.s.table.creationDesigns.records[failure.d.id].attempts.length,2);
 const {s,d,result}=success,entry=s.table.creationDesigns.records[d.id];
 A.equal(entry.prototypeId,result.prototypeId);
 A.equal(entry.status,'prototyped');
 A.equal(entry.implementedEffect,false,
  'a physical basic tool is not a freely learned spell or supernatural effect');
 A.equal(s.player.inventory.water_indicator,undefined);
 const p=s.table.creationPrototypes[result.prototypeId];
 A.equal(p.status,'unverified');A.equal(p.source.grade,1);
 A.equal(p.source.designScopeHash,d.scopeHash);
 A.equal(p.source.designHash,entry.sourceHash);
 A.equal(p.owner,s.player.name);
 A.equal(go(s,'prototypeStatus').prototypes.length,1);
 A.equal(go(s,'status',{id:d.id}).designs[0].noItemCreated,false);
 A.equal(rank(s).professions.crafting.withinRankDepth,'initially demonstrated');
 A.equal(rank(s).professions.crafting.canonicalRank,s.player.skills.crafting.rank);
 A.throws(()=>go(s,'measure',{id:d.id}),/successful genuine local calibration/);
 const beforeCal=s.world.minutes;
 let calibrated=false;
 for(let tries=0;tries<5;tries++){
  const x=go(s,'calibrate',{id:d.id});
  A.equal(x.elapsedMinutes,15);
  A.ok(['scarce','moderate','abundant','inconclusive'].includes(x.observedCategory));
  A.equal(x.scope.includes('surface-water'),true);
  A.equal(x.check.dc,11);
  if(x.status==='calibrated'){calibrated=true;break;}
  if(x.status==='broken')break;
 }
 A.ok(s.world.minutes>beforeCal);
 const last=p.readings.at(-1);
 A.equal(last.source,'physical field readout only');
 A.equal(Object.hasOwn(last,'actualWaterScore'),false);
 A.equal(s.table.creationPrototypes[result.prototypeId].owner,s.player.name);
 const copy=E.importGame(E.exportGame(s));
 A.deepEqual(copy.table.creationPrototypes[result.prototypeId],p);
 A.deepEqual(rank(copy),rank(s));
 if(calibrated){
  const left=p.durability;
  const resultRead=go(s,'measure',{id:d.id});
  A.equal(resultRead.elapsedMinutes,8);
  A.equal(resultRead.durabilityRemaining,left-1);
  A.equal(resultRead.scope.includes('surface-water'),true);
  A.equal(resultRead.check.dc,10);
 }
 // Injecting magic powers or arbitrary item stats through the work route
 // is always refused without side effects.
 const frozen=E.exportGame(s);
 for(const forged of [{id:d.id,grade:9},{id:d.id,free:true},
  {id:'design_9999',power:'infinite'}]){
  A.throws(()=>go(s,'prototype',forged),/genuine preexisting design ID/);
 }
 A.equal(E.exportGame(s),frozen);
}
{
 const s=withMaterials(848222),d=begin(s);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-craft-prototype-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const frozen=FS.readFileSync(file,'utf8');
  const read={id:'ranks_depth_status_0001',mode:'rule',
   system:'rankings',operation:'detail',params:{}};
  A.equal(Turn.execute(file,read).applied,false);
  A.equal(FS.readFileSync(file,'utf8'),frozen);
  const prot={id:'creation_reed_trial_0001',mode:'rule',
   system:'creation',operation:'prototype',params:{id:d.id}};
  const first=Turn.execute(file,prot);
  A.equal(first.applied,true);
  A.equal(Turn.execute(file,prot).duplicate,true);
  const saved=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(saved.table.creationDesigns.records[d.id].attempts.length,1);
  A.equal(saved.player.inventory.marsh_reed,16);
  A.equal(saved.world.minutes,s.world.minutes+85);
  const read2={id:'instrument_status_0001',mode:'rule',
   system:'creation',operation:'prototypeStatus',params:{}};
  A.equal(Turn.execute(file,read2).applied,false);
  const after=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{...prot,id:'force_magic_trial_0001',
   params:{id:d.id,success:true}}),/genuine preexisting design ID/);
  A.equal(FS.readFileSync(file,'utf8'),after);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Actual original civilian prototyping consumes materials/time, succeeds or fails honestly, calibrates only local visible water, while rank-depth remains earned and read-only');
