'use strict';
// Original witnessed independent adult chooses whether to interpose in the
// existing SINGLE beast attack. Disposable generated persons and beasts only.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Rules=require('../rules'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),Atlas=require('../world/atlas'),
 Agency=require('../rules/combat-agency'),Combat=require('../rules/combat'),
 Health=require('../rules/unified');
const act=(s,o,p={})=>Rules.act(s,{system:'combat',operation:o,params:p});
function next(n){n>>>=0;n^=n<<13;n^=n>>>17;n^=n<<5;
 return (n>>>0)||0x91e10da5;}
function make(wants,start){
 for(let seed=start;seed<start+100;seed++){
  const s=E.newGame({seed,name:'Disposable human protects from actual beast'}),
   w=Realm.ensure(s),people=People.ensure(w),
   region=Atlas.regions.find(x=>People.siteFor(x.id)),
   eco=w.ecosystems[region.id],country=w.countries[region.polity];
  eco.quality=75;eco.pressure=15;eco.water=75;eco.forage=80;
  country.prosperity=75;country.stability=78;
  const demand=People.sourceDemand(w,region);
  A.ok(demand);
  let p=null;
  for(let j=0;j<40;j++){
   const candidate=People._debug.make(w,people,0,demand),
    chance=.45-(candidate.fatigue>=50?.12:0),
    choice=next(candidate.rngState)/4294967296<chance;
   if(candidate.mechanicalFoundation?.baselineAttributes.con>=7&&choice===wants){
    p=candidate;break;
   }
  }
  A.ok(p);
  p.shift=People.shift(p,0,w);
  s.world.location=People.siteFor(p.regionId);
  s.world.minutes=600;s.chatRuntime||={};
  const witness=p.name+' is an uninjured, unarmed, unarmoured adult here at '+
   s.world.location+', directly witnessed in this present physical scene.';
  s.chatRuntime.scene='An independent local person is here. '+witness;
  const r=Rules.act(s,{system:'health',operation:'linkWitnessedHuman',
   params:{npcId:p.actorId,witness}});
  A.equal(r.created,true);
  const b=s.beasts.fox={id:'fox',name:'Disposable original wild fox',
   species:'fenfox',evolutionStage:'Base',sapience:1,
   hp:30,maxHp:30,location:s.world.location};
  s.encounter={beastId:'fox',observed:true,approaches:0,threat:true};
  b.combatAssessment={beastId:'fox',species:b.species,
   evolutionStage:b.evolutionStage,sapience:1,worldMinute:s.world.minutes,
   source:'Previously witnessed individual field anatomy and beast combat assessment',
   behavior:{style:'predatory',nonlethal:true,canCommunicate:false,
    withdrawalDC:15,parleyDC:19,
    source:'Previously observed individual predator approach and response under threat'},
   stats:{toughness:70,defense:13,stamina:8,vigor:1,will:1,offM:0,durM:0,
    sapience:1,attack:11,damage:3,boxes:[3,2,1]}};
  act(s,'begin',{beastId:'fox'});
  if(Agency.choose(s).plan==='attack')return {s,p,id:r.id,w};
 }
 throw Error('An original independently attacking predator fixture is required');
}
for(const wants of [true,false]){
 const {s,p,id}=make(wants,wants?923001:923201),
  start=E.exportGame(s),beforeRng=p.rngState,
  beforeWorldRng=s.rngState,beforeMinute=s.world.minutes,
  pc=structuredClone(Combat.get(s,'player')),
  human=structuredClone(Combat.get(s,id));
 A.throws(()=>act(s,'exchange',{intent:'defend',npcIntervenes:wants}),
  /Player attack bonuses/);
 A.equal(E.exportGame(s),start);
 const result=act(s,'exchange',{intent:'defend',playerBrace:false});
 A.equal(result.enemyPlan,'attack');
 A.equal(result.elapsedMinutes,1);
 A.equal(result.independentHumanChoice.npcId,p.actorId);
 A.equal(result.independentHumanChoice.choseToInterpose,wants);
 A.equal(result.independentHumanChoice.noForcedLoyaltyOrCompulsoryAlly,true);
 A.equal(p.rngState,next(beforeRng));
 A.notEqual(s.rngState,beforeWorldRng);
 A.equal(s.world.minutes,beforeMinute+1);
 A.equal(s.player.meridian.stage,0);
 A.equal(s.player.arcane.circles,0);
 A.equal(s.player.partnerIds.length,0);
 const decision=s.log.find(x=>x.details?.origin===
  'original-independent-human-defensive-interposition-v1');
 A.ok(decision);
 A.equal(decision.details.actorId,p.actorId);
 A.equal(decision.details.chosenInterposition,wants);
 A.match(decision.details.sourceHash,/^[a-f0-9]{64}$/);
 const c=Combat.get(s,id);
 if(wants){
  A.equal(result.enemyResult.interposed,true);
  A.equal(result.enemyResult.npcId,p.actorId);
  A.equal(result.enemyResult.privateStatsNotDisclosed,true);
  A.equal(result.enemyResult.observedHuman.name,p.name);
  for(const field of ['defense','damageTotal','wounds','toughness','stamina'])
   A.equal(Object.hasOwn(result.enemyResult,field),false);
  A.deepEqual(Combat.get(s,'player'),pc);
  if(result.enemyResult.hit)
   A.ok(c.stamina<human.stamina||c.wounds.some((n,i)=>n>human.wounds[i])||
    c.status!=='ok');
  const last=s.log.findLast(x=>x.details?.noPrivateHumanStats===true);
  A.ok(last);
  A.equal(Object.hasOwn(last.details,'defense'),false);
  A.equal(Object.hasOwn(last.details,'wounds'),false);
 }else{
  A.equal(result.enemyResult.interposed,undefined);
  A.deepEqual(c,human);
 }
 const replay=E.importGame(E.exportGame(s));
 A.deepEqual(Combat.get(replay,id),c);
 A.equal(Realm.peek(replay).emergentPeople.people[p.id].rngState,p.rngState);
 A.deepEqual(Health.currentNpcWoundCondition(replay,p.actorId),
  Health.currentNpcWoundCondition(s,p.actorId));
}
{
 const {s,p,id}=make(true,923401),before=p.rngState;
 s.chatRuntime.scene='Only the player and the wild beast remain at this scene.';
 const result=act(s,'exchange',{intent:'defend',playerBrace:false});
 A.equal(result.independentHumanChoice,undefined);
 A.equal(p.rngState,before);
 A.deepEqual(Combat.get(s,id).wounds,[0,0,0]);
}
{
 const {s,p,id}=make(true,923601);
 Combat.get(s,id).npcOrigin.seal='0'.repeat(64);
 const saved=E.exportGame(s),rng=s.rngState,npcRng=p.rngState;
 A.throws(()=>act(s,'exchange',{intent:'defend',playerBrace:false}),
  /Original NPC combat physical-entry source was altered/);
 A.equal(E.exportGame(s),saved);
 A.equal(s.rngState,rng);
 A.equal(p.rngState,npcRng);
}
{
 const {s,p,id}=make(true,923801),c=Combat.get(s,id),old=p.rngState;
 c.wounds[0]=1;
 const result=act(s,'exchange',{intent:'defend',playerBrace:false});
 A.equal(result.independentHumanChoice,undefined);
 A.equal(p.rngState,old);
 A.equal(c.wounds[0],1);
}
console.log('Independently consented human protection: source-present adult, single original beast attack against actual wounds, free decline, private numbers, replay and tamper prevention PASS');
