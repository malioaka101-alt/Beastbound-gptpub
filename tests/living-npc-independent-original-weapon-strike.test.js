'use strict';
// Source-backed ordinary NPC weapon, independent risk choice, and ONE native
// Combat.attack; no invented martial rank, gear, personal power or second die.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),Atlas=require('../world/atlas'),
 Gear=require('../rules/equipment'),Combat=require('../rules/combat'),
 Agency=require('../rules/combat-agency');
const rule=(s,sys,op,p={})=>R.act(s,{system:sys,operation:op,params:p});
function next(x){x>>>=0;x^=x<<13;x^=x>>>17;x^=x<<5;
 return (x>>>0)||0x91e10da5;}
function giftChance(p){return Math.max(.08,Math.min(.65,
 (p.personality==='curious'?.52:p.personality==='steady'?.41:
 p.personality==='independent'?.31:.23)-
 (p.fatigue>=60?.16:p.fatigue>=35?.07:0)));}
function strikeChance(p){return Math.max(.08,Math.min(.72,
 (p.personality==='curious'?.46:p.personality==='steady'?.38:
 p.personality==='independent'?.32:.20)+.10-
 (p.fatigue>=50?.14:0)));}
function setup(want,seedStart){
 for(let seed=seedStart;seed<seedStart+22;seed++){
  const s=E.newGame({seed,name:'Disposable autonomous armed beast encounter'}),
   w=Realm.ensure(s),people=People.ensure(w),
   reg=Atlas.regions.find(x=>People.siteFor(x.id)),
   eco=w.ecosystems[reg.id],host=w.countries[reg.polity];
  eco.quality=75;eco.pressure=15;eco.water=75;eco.forage=80;
  host.prosperity=75;host.stability=78;
  const d=People.sourceDemand(w,reg);
  A.ok(d);
  let p=null;
  for(let i=0;i<55;i++){
   const c=People._debug.make(w,people,0,d),
    gift=next(c.rngState)/4294967296<giftChance(c),
    strike=next(next(c.rngState))/4294967296<strikeChance(c);
   if(gift&&strike===want&&
    c.mechanicalFoundation.baselineAttributes.con>=7){p=c;break;}
  }
  if(!p)continue;
  p.shift=People.shift(p,0,w);
  s.world.location=People.siteFor(p.regionId);
  s.world.minutes=600;s.chatRuntime||={};
  const witness=p.name+' is an uninjured, unarmed, unarmoured adult here at '+
   s.world.location+', directly witnessed in this present physical scene.';
  s.chatRuntime.scene='An original physical examination establishes: '+witness;
  const human=rule(s,'health','linkWitnessedHuman',{npcId:p.actorId,witness});
  A.equal(human.created,true);
  const stamp=s.world.minutes;
  s.table.merchantOffers={source_staff_001:{
   id:'source_staff_001',publiclyKnown:true,
   seller:'North Road Quartermaster',location:s.world.location,
   worldMinute:stamp,expiresAtMinute:stamp+1440,
   priceScales:250,stock:1,
   source:'Previously observed and source-established real stock from the staff merchant',
   item:'training_staff',
   action:{id:'staff_strike',kind:'mundane',item:'training_staff',
    attribute:'str',damage:4,offM:0,attackBonus:1,canNonlethal:true,
    source:'Previously appraised ordinary training-staff weapon action',
    worldMinute:stamp}
  }};
  A.equal(rule(s,'gear','purchase',{offerId:'source_staff_001'}).purchased,true);
  A.equal(rule(s,'gear','giveWeaponToPerson',{
   npcId:p.actorId,item:'training_staff'}).transferred,true);
  A.equal(s.player.inventory.training_staff,0);
  A.equal(Gear.verifiedIndependentWeapon(s,p.actorId).
   actualMundaneAction.damage,4);
  s.chatRuntime.scene='The wild beast approaches while '+
   p.name+' holds the training staff ready beside the player.';
  s.beasts.fox={id:'fox',name:'Individually assessed wild fenfox',
   species:'fenfox',evolutionStage:'Base',sapience:1,hp:30,maxHp:30,
   location:s.world.location};
  s.encounter={beastId:'fox',observed:true,approaches:0,threat:true};
  s.beasts.fox.combatAssessment={beastId:'fox',species:'fenfox',
   evolutionStage:'Base',sapience:1,worldMinute:s.world.minutes,
   source:'Actual previously witnessed individual wild beast anatomical combat assessment',
   behavior:{style:'predatory',nonlethal:true,canCommunicate:false,
    withdrawalDC:15,parleyDC:19,
    source:'Independently witnessed predator threatening and retreating behaviour'},
   stats:{toughness:8,defense:10,stamina:8,vigor:1,will:1,
    offM:0,durM:0,sapience:1,attack:3,damage:3,boxes:[4,3,2]}};
  rule(s,'combat','begin',{beastId:'fox'});
  if(Agency.choose(s).plan!=='retreat')return {s,p,id:human.id};
 }
 throw Error('Actual independent armed human and non-retreating predator required');
}
for(const want of [true,false]){
 const {s,p,id}=setup(want,want?926001:926060),
  before=E.exportGame(s),npcRng=p.rngState,
  worldRng=s.rngState,clock=s.world.minutes,
  playerRank=s.player.skills.combat.rank;
 for(const params of [
  {intent:'defend',npcAttack:true},
  {intent:'defend',npcDamage:999},
  {intent:'defend',npcId:p.actorId}
 ])A.throws(()=>rule(s,'combat','exchange',params),/Player attack bonuses/);
 A.equal(E.exportGame(s),before);
 const result=rule(s,'combat','exchange',{intent:'defend',playerBrace:false});
 A.equal(result.elapsedMinutes,1);
 A.equal(s.world.minutes,clock+1);
 A.notEqual(s.rngState,worldRng,'Original enemy attacks or real armed human roll the engine');
 A.equal(result.independentArmedHumanDecision.npcId,p.actorId);
 A.equal(result.independentArmedHumanDecision.choseStrike,want);
 A.equal(result.independentArmedHumanDecision.noCompulsoryCombatByEquippedHuman,true);
 A.equal(p.rngState,next(npcRng),'The same independent person chooses one response');
 A.equal(s.player.skills.combat.rank,playerRank);
 A.equal(s.player.inventory.training_staff,0);
 A.equal(s.player.equippedWeapon,undefined);
 A.equal(p.knownTechniques.length,0);
 A.equal(p.practicedDisciplines.length,0);
 A.equal(s.player.meridian.stage,0);
 A.equal(s.player.arcane.circles,0);
 const choice=s.log.find(x=>x.details?.origin===
  'original-armed-individual-beast-strike-choice-v1');
 A.ok(choice);
 A.equal(choice.details.choseStrike,want);
 if(want){
  A.ok(result.independentHumanAttack);
  A.equal(result.independentHumanAttack.npcId,p.actorId);
  A.equal(result.independentHumanAttack.weaponItem,'training_staff');
  A.equal(result.independentHumanAttack.originalActionId,'staff_strike');
  A.equal(result.independentHumanAttack.actualOriginalWoundRoll,true);
  A.equal(result.independentHumanAttack.independentlyChosen,true);
  A.ok(result.independentHumanAttack.roll>=1&&
   result.independentHumanAttack.roll<=20);
  for(const field of ['modifier','damage','total','offM','physicalAttributes'])
   A.equal(Object.hasOwn(result.independentHumanAttack,field),false);
  const event=s.log.findLast(x=>x.details?.independentHumanAttack===true);
  A.ok(event,'One original wound-model Combat.attack is required');
  for(const k of ['modifier','total','damageTotal','wounds','toughness'])
   A.equal(Object.hasOwn(event.details,k),false);
  A.equal(event.details.noPrivateHumanStats,true);
 }else{
  A.equal(result.independentHumanAttack,undefined);
  A.equal(s.log.some(x=>x.details?.independentHumanAttack),false);
 }
 const replay=E.importGame(E.exportGame(s));
 A.deepEqual(Gear.verifiedIndependentWeapon(replay,p.actorId),
  Gear.verifiedIndependentWeapon(s,p.actorId));
 A.deepEqual(Combat.get(replay,id),Combat.get(s,id));
 A.equal(Realm.peek(replay).emergentPeople.people[p.id].rngState,p.rngState);
}
{
 const {s,p}=setup(true,926120),old=p.rngState;
 s.chatRuntime.scene='The player alone faces the beast; the armed person is elsewhere.';
 const output=rule(s,'combat','exchange',{intent:'defend',playerBrace:false});
 A.equal(output.independentArmedHumanDecision,undefined);
 A.equal(p.rngState,old);
}
{
 const {s,p}=setup(true,926160),saved=E.exportGame(s),rng=s.rngState,
  personal=p.rngState,person=Realm.peek(s).emergentPeople.people[p.id];
 person.mundaneWeapon.source.originalCombatAction.damage=70;
 const altered=E.exportGame(s);
 A.throws(()=>rule(s,'combat','exchange',{intent:'defend',playerBrace:false}),
  /paid physical transfer receipt|differs from original merchant appraisal/);
 A.equal(E.exportGame(s),altered);
 A.equal(s.rngState,rng);
 A.equal(p.rngState,personal);
 A.notEqual(altered,saved);
}
console.log('Original NPC weapon strike: paid transferred staff, source-verified independent combat choice, same Combat.attack and wound model, no assumed rank or duplicate item, private roll, replay, absent/fraud refusal PASS');
