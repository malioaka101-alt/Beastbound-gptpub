'use strict';
// Mundane combat has one source-recorded action, its equipped item and actual
// earned Combat skill. No caller can choose Damage, Offense M or extra Qi power.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine.js'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
const SourceAttack=require('../rules/player-combat-action');
function fresh(seed=54221){
 const s=E.newGame({seed,name:'Weapon Provenance Fixture',path:'undecided'});
 s.player.skills.combat.rank=2;
 s.beasts.fox={id:'fox',name:'Wild Fen Fox',species:'fenfox',evolutionStage:'Base',
  sapience:1,hp:30,maxHp:30};
 s.encounter={beastId:'fox',observed:true,approaches:0,threat:true};
 s.beasts.fox.combatAssessment={beastId:'fox',species:'fenfox',evolutionStage:'Base',
  sapience:1,worldMinute:s.world.minutes,
  source:'Independent individual anatomical combat examination before the dangerous encounter',
  behavior:{style:'territorial',nonlethal:true,canCommunicate:false,
   withdrawalDC:15,parleyDC:18,
   source:'Previously witnessed territorial but nonlethal behaviour of this wild fox'},
  stats:{toughness:6,defense:12,stamina:8,vigor:1,will:1,offM:0,durM:0,
   sapience:1,attack:3,damage:4,boxes:[3,2,1]}};
 s.player.inventory.training_staff=1;
 s.player.equippedWeapon='training_staff';
 s.player.combatActions={staff_strike:{
  id:'staff_strike',kind:'mundane',item:'training_staff',attribute:'str',
  damage:4,offM:0,attackBonus:1,canNonlethal:true,
  worldMinute:s.world.minutes,
  source:'Issued training staff examined and observed in a basic guild combat drill'
 }};
 return s;
}
const open=s=>R.act(s,{system:'combat',operation:'begin',params:{beastId:'fox'}});
const act=(s,p)=>R.act(s,{system:'combat',operation:'exchange',params:p});
{
 const s=fresh(),before=E.exportGame(s);
 open(s);
 const original=E.exportGame(s),rng=s.rngState;
 for(const p of [
  {intent:'attack',attackId:'staff_strike',playerDamage:100},
  {intent:'attack',attackId:'staff_strike',playerAttackModifier:99},
  {intent:'attack',attackId:'staff_strike',offM:10},
  {intent:'attack',attackId:'staff_strike',qiCost:0},
  {intent:'attack',attackId:'staff_strike',attackSource:'magic sword'},
  {intent:'attack',attackId:'staff_strike',enemyPlan:'retreat'},
  {intent:'attack'},
  {intent:'attack',attackId:'new_technique'}
 ])A.throws(()=>act(s,p),/Player attack bonuses|equipped mundane combat action|equipped mundane weapon action/);
 A.equal(E.exportGame(s),original);A.equal(s.rngState,rng);
 s.player.inventory.training_staff=0;
 const noWeapon=E.exportGame(s);
 A.throws(()=>act(s,{intent:'attack',attackId:'staff_strike'}),/must actually be equipped and in inventory/);
 A.equal(E.exportGame(s),noWeapon);
 s.player.inventory.training_staff=1;s.player.equippedWeapon='wooden_bow';
 A.throws(()=>act(s,{intent:'attack',attackId:'staff_strike'}),/must actually be equipped and in inventory/);
 s.player.equippedWeapon='training_staff';
 s.player.combatActions.staff_strike.kind='arcane';
 A.throws(()=>act(s,{intent:'attack',attackId:'staff_strike'}),/source-recorded equipped mundane weapon action/);
 s.player.combatActions.staff_strike.kind='mundane';
 s.player.combatActions.staff_strike.canNonlethal=false;
 A.throws(()=>act(s,{intent:'attack',attackId:'staff_strike',nonlethal:true}),/does not allow nonlethal strikes/);
 A.equal(s.rngState,rng);
}
{
 const s=fresh(54222),rng=s.rngState,minutes=s.world.minutes,qi=s.player.qi;
 open(s);
 const got=act(s,{intent:'attack',attackId:'staff_strike',nonlethal:true});
 A.equal(got.ownResult.verifiedActionId,'staff_strike');
 A.equal(got.ownResult.modifier,undefined);
 A.ok(got.ownResult.roll>=1&&got.ownResult.roll<=20);
 A.equal(s.player.qi,qi);
 A.equal(s.world.minutes,minutes+1);
 A.notEqual(s.rngState,rng);
 A.ok(['attack','hold','retreat'].includes(got.enemyPlan));
 const proof=s.player.combatActions.staff_strike;
 A.equal(proof.damage,4);A.equal(proof.attackBonus,1);A.equal(proof.offM,0);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-player-weapon-'));
 try{
  const filename=Path.join(dir,'save.json'),s=fresh(54223);
  FS.writeFileSync(filename,E.exportGame(s)+'\n');
  const opened={id:'weapon_combat_begin_001',mode:'rule',system:'combat',
   operation:'begin',params:{beastId:'fox'}};
  A.equal(Turn.execute(filename,opened).applied,true);
  const snapshot=FS.readFileSync(filename,'utf8');
  A.throws(()=>Turn.execute(filename,{id:'weapon_cheat_attack_001',mode:'rule',
   system:'combat',operation:'exchange',
   params:{intent:'attack',attackId:'staff_strike',playerDamage:1000}}),/Player attack bonuses/);
  A.equal(FS.readFileSync(filename,'utf8'),snapshot);
  const req={id:'weapon_legal_attack_001',mode:'rule',system:'combat',operation:'exchange',
   params:{intent:'attack',attackId:'staff_strike'}};
  const r=Turn.execute(filename,req);
  A.equal(r.applied,true);
  A.equal(r.output.rules.ownResult.verifiedActionId,'staff_strike');
  A.equal(Turn.execute(filename,req).duplicate,true);
  const written=E.importGame(FS.readFileSync(filename,'utf8'));
  A.equal(written.world.minutes,s.world.minutes+1);
  A.equal(written.player.inventory.training_staff,1);
  A.equal(written.player.qi,s.player.qi);
  A.equal(written.player.skills.combat.rank,2);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}

// A genuinely earned Muscle-Tendon Cycle already establishes M1 natural
// force. Strength-based *existing* equipped attacks can express it without
// a new damage die or a fabricated technique. Dexterity and greater item
// Magnitudes are not blindly stacked.
function earnedBodyFixture(seedStart=54400){
 for(let seed=seedStart;seed<seedStart+20;seed++){
  const s=fresh(seed);
  s.encounter=null;
  s.player.attributes.con=20;s.player.skills.survival.rank=5;
  R.unified.ensurePlayer(s);
  s.table.disciplineTraining||={};
  s.table.disciplineTraining.body={target:'cycle1',points:150,weeks:0,
   cooldownUntil:0,methods:{muscle:50,tendon:50},complications:[],history:[]};
  const result=R.act(s,{system:'discipline',operation:'breakthrough',
   params:{system:'body'}});
  if(result.outcome==='breakthrough'){
   s.encounter={beastId:'fox',observed:true,approaches:0,threat:true};
   return s;
  }
 }
 throw Error('Expected a genuine source-checked Muscle-Tendon breakthrough');
}
{
 const s=fresh(54350);
 R.unified.ensurePlayer(s);
 const original=E.exportGame(s),rng=s.rngState;
 A.equal(SourceAttack.profile(s,'staff_strike').bodyRefinementM,0);
 A.equal(SourceAttack.profile(s,'staff_strike').offM,0);
 s.player.body.cycles.push('Muscle-Tendon Cycle');
 s.table.combatants.player.offM=1;
 A.equal(SourceAttack.profile(s,'staff_strike').offM,0,
  'A forged physical stage counter and combatant M1 do not make natural force earned');
 s.table.disciplineTraining={body:{history:[{
  day:1,target:'cycle1',quality:'failure',
  change:'Completed Cycle I Muscle-Tendon refinement; +2 stamina, Might +1, M1 natural force'
 }]}};
 A.equal(SourceAttack.profile(s,'staff_strike').offM,0,
  'An explicitly failed rite is not a verified successful tissue refinement');
 A.equal(s.rngState,rng);
 A.notEqual(E.exportGame(s),original);
}
{
 const s=earnedBodyFixture(),before=E.exportGame(s);
 const stamp=s.table.disciplineTraining.body.history.find(x=>x.target==='cycle1');
 A.ok(['success','strong','exceptional'].includes(stamp.quality));
 A.equal(s.player.body.cycles[0],'Muscle-Tendon Cycle');
 A.equal(s.table.combatants.player.offM,1);
 const base=SourceAttack.profile(s,'staff_strike');
 A.equal(base.bodyRefinementM,1);
 A.equal(base.offM,1);
 s.player.combatActions.staff_strike.attribute='dex';
 A.equal(SourceAttack.profile(s,'staff_strike').bodyRefinementM,0,
  'A Dexterity-based finesse action does not become a raw force strike');
 A.equal(SourceAttack.profile(s,'staff_strike').offM,0);
 s.player.combatActions.staff_strike.attribute='str';
 const higher=s.player.combatActions.staff_strike.offM;
 s.player.combatActions.staff_strike.offM=2;
 A.equal(SourceAttack.profile(s,'staff_strike').offM,2,
  'M1 body force cannot turn an established M2 weapon into M3');
 s.player.combatActions.staff_strike.offM=higher;
 const old=s.world.minutes,rng=s.rngState;
 open(s);
 const out=act(s,{intent:'attack',attackId:'staff_strike',nonlethal:true});
 A.equal(out.ownResult.verifiedActionId,'staff_strike');
 A.equal(out.ownResult.earnedBodyRefinementM,1);
 A.ok(out.ownResult.roll>=1&&out.ownResult.roll<=20);
 A.equal(s.world.minutes,old+1);
 A.notEqual(s.rngState,rng);
 A.equal(s.player.body.cycles.length,1);
 A.equal(s.player.partnerIds.length,0);
 A.ok(s.log.some(e=>e.details?.origin==='source-earned-body-cycle-one-combat-force'));
 A.notEqual(E.exportGame(s),before);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-earned-muscle-strike-'));
 try{
  const s=earnedBodyFixture(54490);
  open(s);
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const initial=FS.readFileSync(file,'utf8');
  const forged={id:'body_weapon_forged_00001',mode:'rule',system:'combat',
   operation:'exchange',params:{intent:'attack',attackId:'staff_strike',
    playerOffenseMagnitude:9}};
  A.throws(()=>Turn.execute(file,forged),/cannot be caller-selected/);
  A.equal(FS.readFileSync(file,'utf8'),initial);
  const request={id:'body_weapon_real_00001',mode:'rule',system:'combat',
   operation:'exchange',params:{intent:'attack',attackId:'staff_strike',
    nonlethal:true}};
  const r=Turn.execute(file,request);
  A.equal(r.applied,true);
  A.equal(r.output.rules.ownResult.earnedBodyRefinementM,1);
  A.equal(Turn.execute(file,request).duplicate,true);
  const loaded=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(loaded.world.minutes,s.world.minutes+1);
  A.equal(loaded.player.body.cycles[0],'Muscle-Tendon Cycle');
  A.equal(loaded.player.equippedWeapon,'training_staff');
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}

console.log('Equipped source-attested mundane attack provenance tests passed');
