'use strict';
// Disposable learned First-Circle defence: no free ward from Mana or Circle,
// no invented defensive magnitude, and no live character save changed.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path'),
 Crypto=require('node:crypto');
const E=require('../engine.js'),R=require('../rules'),B=require('../rules/build'),
 Turn=require('../scripts/chat-turn.js'),Combat=require('../rules/combat');
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const magic=(s,operation,params={})=>R.act(s,{system:'arcane',operation,params});
const battle=(s,params)=>R.act(s,{system:'combat',operation:'exchange',params});
function firstCircle(seed=44001){
 const s=E.newGame({seed,name:'First Circle Ward Student',path:'arcane'});
 s.player.arcane.coreIgnited=true;
 s.player.arcane.circles=1;
 s.player.arcane.geometry='stable measured sixfold First Circle';
 s.table||={};s.table.disciplineTraining||={};
 s.table.disciplineTraining.arcane={target:null,points:0,weeks:0,cooldownUntil:0,methods:{},
  history:[
   {day:1,target:'core',quality:'strong',change:'Mana Core ignited, no Circle yet'},
   {day:1,target:'circle1',quality:'strong',change:'First Circle constructed; stable measured sixfold First Circle'}
  ]};
 return s;
}
function academy(seed=44001){
 const s=firstCircle(seed);
 A.equal(E.dispatch(s,'travel academy').ok,true);
 return s;
}
function foe(s){
 A.equal(E.dispatch(s,'travel crossing').ok,true);
 A.equal(E.dispatch(s,'travel forest').ok,true);
 s.beasts.fox={id:'fox',name:'Independently Assessed Hostile Fox',species:'fenfox',
  evolutionStage:'Base',sapience:1,hp:30,maxHp:30,location:'forest'};
 s.encounter={beastId:'fox',observed:true,threat:true};
 s.beasts.fox.combatAssessment={
  beastId:'fox',species:'fenfox',evolutionStage:'Base',sapience:1,worldMinute:s.world.minutes,
  source:'Previously witnessed individual forest animal anatomical and combat profile',
  behavior:{style:'territorial',nonlethal:true,canCommunicate:false,
   withdrawalDC:15,parleyDC:18,
   source:'Independently observed aggressive territorial, nonlethal behaviour of this animal'},
  stats:{toughness:12,defense:12,stamina:8,vigor:1,will:1,offM:0,durM:0,
   sapience:1,attack:28,damage:60,boxes:[3,2,1]}
 };
 const begun=R.act(s,{system:'combat',operation:'begin',params:{beastId:'fox'}});
 A.equal(begun.independentEnemyBehavior,true);
}
function learned(){
 for(let i=1;i<90;i++){
  const s=academy((i*2654435761)>>>0);
  const r=magic(s,'wardStudy');
  if(r.learned)return s;
 }
 throw Error('The deterministic test seeds did not produce an honestly successful Ward lesson');
}
{
 const s=E.newGame({seed:44008,name:'No Free Ward'}),before=E.exportGame(s),rng=s.rngState;
 const spec=B.spellCost({family:'ward',rng:'self',area:'single',duration:'1min',
  magnitude:0,conditions:0,extraTargets:0,speed:'standard'});
 A.deepEqual([spec.complexity,spec.mana,spec.load,spec.castingDC,spec.minCircle],[2,2,1,12,1]);
 A.equal(magic(s,'wardStatus').known,false);
 A.throws(()=>magic(s,'wardStudy'),/actually earned Mana Core/);
 A.throws(()=>magic(s,'wardStudy',{mana:0,steps:900,free:true}),/accepts no invented effect/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 let success=false,failure=false;
 for(let i=1;i<110;i++){
  const s=academy((i*2654435761)>>>0),minutes=s.world.minutes,
    money=s.player.coins,pp=s.player.skills.arcana.xp;
  const r=magic(s,'wardStudy');
  A.equal(r.elapsedDays,6);A.equal(r.feeTalons,4);
  A.equal(r.manaCost,2);A.equal(r.castingDC,12);
  A.equal(r.wardSteps,3);A.equal(r.wardMagnitude,0);
  A.equal(r.check.success,r.learned);
  A.equal(s.world.minutes,minutes+6*1440);A.equal(s.player.coins,money-4);
  A.ok(s.player.skills.arcana.xp>=pp);
  const a=s.table.arcaneWardStudy.attempts[0];
  A.equal(a.tuitionScales,400);A.equal(a.success,r.learned);
  A.equal(digest(s.log[a.witnessIndex]),a.witnessHash);
  A.equal(digest(s.log[a.rollIndex]),a.rollHash);
  A.equal(magic(s,'wardStatus').known,r.learned);
  const save=E.exportGame(s),rng=s.rngState;
  if(r.learned){
   A.equal(s.table.arcaneTechniques.arcane_ward.wardSteps,3);
   A.throws(()=>magic(s,'wardStudy'),/already exists/);
   success=true;
  }else{
   A.equal(s.table.arcaneTechniques?.arcane_ward,undefined);
   A.throws(()=>magic(s,'wardStudy'),/separate sixday recovery/);
   failure=true;
  }
  A.equal(E.exportGame(s),save);A.equal(s.rngState,rng);
  if(success&&failure)break;
 }
 A.equal(success,true);A.equal(failure,true);
}
{
 const s=academy(44011);
 foe(s);
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>battle(s,{intent:'ward',techniqueId:'arcane_ward'}),/genuinely taught First-Circle Ward/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=learned();
 foe(s);
 const before=E.exportGame(s),rng=s.rngState;
 for(const params of [
  {intent:'ward',techniqueId:'arcane_ward',wardSteps:999},
  {intent:'ward',techniqueId:'arcane_ward',manaCost:0},
  {intent:'ward',techniqueId:'arcane_ward',enemyPlan:'retreat'},
  {intent:'ward',techniqueId:'arcane_ward',nonlethal:false},
  {intent:'ward',techniqueId:'invented_ward'},
  {intent:'attack',techniqueId:'arcane_ward'}
 ]){
  A.throws(()=>battle(s,params),/cannot be caller-selected|Weapon action and nonlethal|Only the specifically earned First-Circle Ward|Only a real attack spell, defensive Ward/);
  A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 }
}
{
 let wards=0,fizzles=0,blocks=0,attacked=0;
 for(let i=1;i<160;i++){
  const s=academy((i*2654435761)>>>0);
  if(!magic(s,'wardStudy').learned)continue;
  foe(s);
  const prior=s.world.minutes,mana=s.player.mana,
   player=Combat.get(s,'player'),wounds=[...player.wounds];
  const resolved=battle(s,{intent:'ward',techniqueId:'arcane_ward'});
  A.equal(resolved.ownResult.verifiedTechniqueId,'arcane_ward');
  A.equal(resolved.ownResult.noExtraRoll,true);
  A.equal(resolved.ownResult.check.dc,12);
  A.equal(resolved.ownResult.manaSpent,(!resolved.ownResult.cast&&resolved.ownResult.check.degree==='setback')?1:2);
  A.equal(s.player.mana,mana-resolved.ownResult.manaSpent);
  A.equal(s.world.minutes,prior+1);
  A.equal(player.ward??null,null);
  A.equal(resolved.ownResult.expiry.expired,resolved.ownResult.cast);
  if(resolved.ownResult.cast)wards++;else fizzles++;
  if(resolved.enemyPlan==='attack'){
   attacked++;
   if(resolved.ownResult.cast&&resolved.enemyResult?.ward?.absorbed){
    blocks++;
    A.deepEqual(player.wounds,wounds);
    A.equal(resolved.enemyResult.ward.collapsed,true);
   }
  }
  if(blocks&&wards&&fizzles&&attacked)break;
 }
 A.ok(wards,'A genuine successful Ward cast is possible');
 A.ok(fizzles,'A Ward can genuinely fizzle with its correct partial/full Mana loss');
 A.ok(attacked,'Independent opponents must be allowed to attack a warding caster');
 A.ok(blocks,'A real successful Ward must absorb an independently chosen attack');
}
{
 const s=learned();foe(s);s.player.mana=0;
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>battle(s,{intent:'ward',techniqueId:'arcane_ward'}),/Insufficient real Mana/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 s.player.mana=10;s.table.arcaneTechniques.arcane_ward.wardSteps=1000;
 const forged=E.exportGame(s);
 A.throws(()=>battle(s,{intent:'ward',techniqueId:'arcane_ward'}),/no unchanged genuinely taught First-Circle Ward record/);
 A.equal(E.exportGame(s),forged);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-arcane-ward-'));
 try{
  const file=Path.join(dir,'save.json'),s=learned();
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const original=FS.readFileSync(file,'utf8');
  const status=Turn.execute(file,{id:'ward_readonly_00001',mode:'rule',
    system:'arcane',operation:'wardStatus',params:{}});
  A.equal(status.applied,false);A.equal(status.output.rules.known,true);
  A.equal(FS.readFileSync(file,'utf8'),original);
  foe(s);FS.writeFileSync(file,E.exportGame(s)+'\n');
  const ready=FS.readFileSync(file,'utf8');
  A.throws(()=>Turn.execute(file,{id:'ward_cheat_00001',mode:'rule',
   system:'combat',operation:'exchange',
   params:{intent:'ward',techniqueId:'arcane_ward',steps:200}}),/cannot be caller-selected/);
  A.equal(FS.readFileSync(file,'utf8'),ready);
  const req={id:'ward_cast_real_00001',mode:'rule',system:'combat',
   operation:'exchange',params:{intent:'ward',techniqueId:'arcane_ward'}};
  const cast=Turn.execute(file,req);
  A.equal(cast.applied,true);
  A.equal(cast.output.rules.ownResult.verifiedTechniqueId,'arcane_ward');
  A.equal(Turn.execute(file,req).duplicate,true);
  const after=E.importGame(FS.readFileSync(file,'utf8'));
  A.equal(after.player.mana,s.player.mana-cast.output.rules.ownResult.manaSpent);
  A.equal(after.table.combatants.player.ward??null,null);
  A.equal(after.world.minutes,s.world.minutes+1);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('One learned defensive Ward: true source-bounded academy course, single casting die, honest Mana and one-minute actual incoming-hit absorption');
