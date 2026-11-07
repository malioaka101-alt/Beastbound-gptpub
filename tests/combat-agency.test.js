'use strict';
// All witnesses are disposable fixtures: no campaign combat or save is used.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),Rules=require('../rules'),Turn=require('../scripts/chat-turn.js');
const Agency=require('../rules/combat-agency');
function fresh(seed=45110,style='cautious'){
 const s=E.newGame({name:'Independent Combat Fixture',seed,path:'undecided'});
 s.beasts.fox={id:'fox',name:'Wild Fox',species:'fenfox',evolutionStage:'Base',
  sapience:1,location:'crossing',hp:30,maxHp:30};
 s.encounter={beastId:'fox',observed:true,approaches:0,threat:true};
 s.beasts.fox.combatAssessment={beastId:'fox',species:'fenfox',evolutionStage:'Base',
  sapience:1,worldMinute:s.world.minutes,
  source:'Independent previously witnessed anatomical and combat appraisal of fox',
  behavior:{style,nonlethal:false,canCommunicate:false,
   withdrawalDC:17,parleyDC:22,
   source:'Direct observation of independently cautious, mobile wild fox behavior'},
  stats:{toughness:5,defense:12,stamina:8,vigor:1,will:1,
   offM:0,durM:0,sapience:1,attack:3,damage:3,boxes:[3,2,1]}};
 return s;
}
const open=s=>Rules.act(s,{system:'combat',operation:'begin',params:{beastId:'fox'}});
const turn=(s,params)=>Rules.act(s,{system:'combat',operation:'exchange',params});
{
 const s=fresh(),before=s.rngState,raw=E.exportGame(s);
 delete s.beasts.fox.combatAssessment.behavior;
 A.throws(()=>open(s),/Independent source-recorded beast combat behaviour/);
 A.equal(s.rngState,before);
 A.equal(s.battle,null);A.equal(s.table?.combatants?.player,undefined);
 s.beasts.fox.combatAssessment.behavior={style:'predatory',nonlethal:false,
  canCommunicate:false,withdrawalDC:17,parleyDC:22,source:'Observed aggressive stalking'};
 open(s);
 A.equal(s.battle.enemyBehavior.style,'predatory');
 A.equal(s.rngState,before);
}
{
 const s=fresh(45111);
 open(s);
 const rng=s.rngState,minute=s.world.minutes,plan=Agency.choose(s);
 for(const params of [
  {intent:'defend',enemyPlan:'retreat'},
  {intent:'defend',enemyNonlethal:true},
  {intent:'withdraw',escapeDC:5},
  {intent:'parley',canCommunicate:true},
  {intent:'parley',parleyDC:5}
 ])A.throws(()=>turn(s,params),/Enemy plan|enemy plans/);
 A.equal(s.rngState,rng);A.equal(s.world.minutes,minute);
 A.deepEqual(Agency.choose(s),plan);A.equal(s.battle.round,1);
 A.throws(()=>turn(s,{intent:'parley'}),/communication channel/);
 A.equal(s.rngState,rng);A.equal(s.world.minutes,minute);
 const r=turn(s,{intent:'defend',playerBrace:false});
 A.equal(r.enemyPlan,plan.plan);
 A.equal(r.ownResult.defending,true);
 A.equal(r.elapsedMinutes,1);
 A.equal(s.world.minutes,minute+1);
 if(plan.plan==='attack'){
  A.ok(r.enemyResult.roll>=1&&r.enemyResult.roll<=20);
  A.equal(r.enemyResult.nonlethal,undefined); // no caller override
 }
 if(plan.plan==='hold')A.equal(r.enemyResult.heldPosition,true);
 if(plan.plan==='retreat'){A.equal(r.enemyResult.retreated,true);A.equal(s.battle,null);}
}
{
 const a=fresh(45112,'defensive'),b=fresh(45112,'defensive');
 open(a);open(b);
 const beforeA=a.rngState,beforeB=b.rngState;
 const planA=Agency.choose(a),planB=Agency.choose(b);
 A.deepEqual(planA,planB);
 A.equal(a.rngState,beforeA);A.equal(b.rngState,beforeB);
 const snapshots=[];
 for(let round=1;round<=30;round++){
  a.battle.round=round;
  snapshots.push(Agency.choose(a).plan);
 }
 A.ok(snapshots.includes('attack'));
 A.ok(snapshots.includes('retreat'));
 const enemy=a.table.combatants[a.battle.enemyId];
 enemy.wounds[1]=1;
 const injured=Agency.choose(a);
 A.ok(['attack','hold','retreat'].includes(injured.plan));
 A.equal(a.rngState,beforeA);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-independent-combat-'));
 try{
  const file=Path.join(dir,'save.json'),s=fresh(45113);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const setup={id:'combat_decision_setup_01',mode:'rule',system:'combat',operation:'begin',params:{beastId:'fox'}};
  A.equal(Turn.execute(file,setup).applied,true);
  const saved=E.importGame(FS.readFileSync(file,'utf8'));
  const planned=Agency.choose(saved).plan;
  const first=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{id:'combat_choose_enemy_01',mode:'rule',system:'combat',operation:'exchange',
   params:{intent:'defend',enemyPlan:'retreat'}}),/Enemy plan|enemy plans/);
  A.equal(FS.readFileSync(file,'utf8'),first);
  const req={id:'combat_independent_round_01',mode:'rule',system:'combat',operation:'exchange',
   params:{intent:'defend',playerBrace:false}};
  const actual=Turn.execute(file,req);
  A.equal(actual.applied,true);
  A.equal(actual.output.rules.enemyPlan,planned);
  A.equal(Turn.execute(file,req).duplicate,true);
  const final=FS.readFileSync(file,'utf8');
  A.equal(E.importGame(final).world.minutes,s.world.minutes+1);
  A.equal(FS.readFileSync(file,'utf8'),final);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
// A sourced animal temperament is not proof that a non-sapient creature
// understands negotiated speech. Reject before combatants, RNG or assessment
// consumption are touched, including the file-backed Project boundary.
{
 const s=fresh(45116),a=s.beasts.fox.combatAssessment;
 a.behavior.canCommunicate=true;
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>open(s),/separately witnessed, verified signal channel/);
 A.equal(E.exportGame(s),before);
 A.equal(s.rngState,rng);
 A.equal(s.battle,null);
 A.equal(a.used,undefined);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-animal-parley-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,before+'\n');
  const saved=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{id:'animal_parley_gate_01',mode:'rule',
   system:'combat',operation:'begin',params:{beastId:'fox'}}),
   /separately witnessed, verified signal channel/);
  A.equal(FS.readFileSync(file,'utf8'),saved);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
// A fallen player cannot trigger opponent planning or consume RNG.
// These assertions use only a disposable save.
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-fallen-turn-'));
 try{
  const file=Path.join(dir,'save.json'),s=fresh(45114);
  open(s);
  Rules.combat.get(s,'player').status='critical';
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const saved=FS.readFileSync(file,'utf8'),rng=s.rngState;
  for(const intent of ['defend','parley']){
   A.throws(()=>Turn.execute(file,{id:'fallen_'+intent+'_0001',mode:'rule',
    system:'combat',operation:'exchange',params:{intent}}),/not able to act/);
   A.equal(FS.readFileSync(file,'utf8'),saved);
   A.equal(E.importGame(saved).rngState,rng);
  }
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
// A fallen character cannot bypass incapacitation by starting another fight.
// Exercise both the direct rules boundary and the file-backed turn executor.
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-fallen-begin-'));
 try{
  const file=Path.join(dir,'save.json'),s=fresh(45115);
  Rules.unified.ensurePlayer(s);
  Rules.combat.get(s,'player').status='incapacitated';
  const before=E.exportGame(s),rng=s.rngState;
  A.throws(()=>open(s),/not able to initiate combat/);
  A.equal(E.exportGame(s),before);
  A.equal(s.rngState,rng);
  FS.writeFileSync(file,before+'\n');
  const saved=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{id:'fallen_begin_0001',mode:'rule',
   system:'combat',operation:'begin',params:{beastId:'fox'}}),/no conscious movement|not able to initiate combat/);
  A.equal(FS.readFileSync(file,'utf8'),saved);
  A.equal(E.importGame(saved).rngState,rng);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
// Direct rules entry points reject every real incapacity state without a
// mutation, including before an item/technique or cover can be inspected.
// The file-backed path is already covered above using disposable saves.
{
 const fallen=['incapacitated','knocked_out','dying','dead','rehabilitating'];
 for(const [i,status] of fallen.entries()){
  const active=fresh(45200+i);
  open(active);
  Rules.combat.get(active,'player').status=status;
  const during=E.exportGame(active),activeRng=active.rngState;
  for(const intent of ['defend','parley','recover','withdraw','take_cover','attack']){
   A.throws(()=>turn(active,{intent}),/not able to act/);
   A.equal(E.exportGame(active),during);
   A.equal(active.rngState,activeRng);
  }
  const pending=fresh(45300+i);
  Rules.unified.ensurePlayer(pending);
  Rules.combat.get(pending,'player').status=status;
  const before=E.exportGame(pending),rng=pending.rngState;
  A.throws(()=>open(pending),/not able to initiate combat/);
  A.equal(E.exportGame(pending),before);
  A.equal(pending.rngState,rng);
  A.equal(pending.beasts.fox.combatAssessment.used,undefined);
 }
}

// Nonverbal yielding is possible without inventing speech or beast obedience.
// A prior independent attack remains dangerous; a hold permits a real check.
for(const plan of ['attack','hold','retreat']){
 let fixture;
 for(let seed=45400;seed<45600;seed++){
  const s=fresh(seed,'defensive');open(s);
  if(Agency.choose(s).plan===plan){fixture=s;break;}
 }
 A.ok(fixture,'Expected an independent '+plan+' decision');
 const s=fixture,original=E.exportGame(s),rng=s.rngState;
 A.throws(()=>turn(s,{intent:'yield_space',enemyPlan:'hold'}),/enemy plans/);
 A.throws(()=>turn(s,{intent:'yield_space',withdrawalDC:5}),/enemy plans/);
 A.equal(E.exportGame(s),original);A.equal(s.rngState,rng);
 A.throws(()=>turn(s,{intent:'parley'}),/communication channel/);
 A.equal(E.exportGame(s),original);
 const minute=s.world.minutes,output=turn(s,{intent:'yield_space'});
 A.equal(output.ownResult.givingSpace,true);
 A.equal(output.ownResult.nonverbal,true);
 A.equal(output.enemyPlan,plan);
 if(plan==='attack'){
  A.equal(output.ownResult.check,null);
  A.ok(output.enemyResult.hit===true||output.enemyResult.hit===false);
  A.equal(s.world.minutes,minute+1);
 }
 if(plan==='retreat'){
  A.equal(output.ownResult.check,null);
  A.equal(output.enemyResult.retreated,true);
  A.equal(s.battle,null);
 }
 if(plan==='hold'){
  A.ok(output.ownResult.check);
  A.equal(output.ownResult.disengaged,output.ownResult.check.success);
  A.equal(s.world.minutes,minute+(output.ownResult.disengaged?2:1));
  if(output.ownResult.disengaged)A.equal(s.battle,null);
 }
 A.equal(s.player.partnerIds.length,0);
}
// Exercise the natural-language gateway and replay-safe checkpoint on a
// disposable combat save, without invoking the prototype HP combat path.
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-combat-give-space-'));
 try{
  const file=Path.join(dir,'save.json'),s=fresh(45605,'defensive');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const begin={id:'space_begin_0001',mode:'rule',system:'combat',
   operation:'begin',params:{beastId:'fox'}};
  A.equal(Turn.execute(file,begin).applied,true);
  const initial=FS.readFileSync(file,'utf8');
  const request={id:'space_action_0001',mode:'act',action:'back away slowly'};
  const out=Turn.execute(file,request);
  A.equal(out.applied,true);
  A.equal(out.output.combat.ownResult.givingSpace,true);
  A.equal(Turn.execute(file,request).duplicate,true);
  const final=FS.readFileSync(file,'utf8');
  A.notEqual(final,initial);
  A.equal(FS.readFileSync(file,'utf8'),final);
 }finally{FS.rmSync(dir,{force:true,recursive:true});}
}

console.log('Independent animal combat plan tests passed');
