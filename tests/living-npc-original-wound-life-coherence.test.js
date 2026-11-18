'use strict';
// Actual ORIGINAL wound combat state controls the SAME independent person's
// career and personal daily life; no alternative health, rank or healing pool.
// All fixtures are disposable worlds; never load a campaign save.
const A=require('node:assert/strict'),
 E=require('../engine.js'),Rules=require('../rules'),
 Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),
 Lives=require('../world/independent-person-lives'),
 Atlas=require('../world/atlas'),World=require('../rules/world'),
 Combat=require('../rules/combat'),Health=require('../rules/unified');
function person(seed){
 const s=E.newGame({seed,name:'Disposable NPC Injury and Life'}),
  w=Realm.ensure(s),list=People.ensure(w),
  region=Atlas.regions.find(x=>People.siteFor(x.id)),
  eco=w.ecosystems[region.id],host=w.countries[region.polity];
 eco.quality=75;eco.pressure=15;eco.water=75;eco.forage=80;
 host.prosperity=75;host.stability=78;
 const demand=People.sourceDemand(w,region);
 A.ok(demand);
 let p;
 for(let i=0;i<25;i++){
  const candidate=People._debug.make(w,list,0,demand);
  if(candidate.mechanicalFoundation?.baselineAttributes.con>=7){
   p=candidate;break;
  }
 }
 A.ok(p);
 p.shift=People.shift(p,0,w);
 s.world.location=People.siteFor(p.regionId);
 s.world.minutes=600;
 s.chatRuntime||={};
 const witness=p.name+' is an uninjured, unarmed, unarmoured adult here at '+
  s.world.location+', directly witnessed in this present physical scene.';
 s.chatRuntime.scene='Independent settlement observation: '+witness;
 const setup=Lives.enroll(s,{actorId:p.actorId,
  interests:['meridian','craft'],
  motivation:'A privately held interest in genuine slow study and practical everyday skills',
  witness});
 A.equal(setup.established,true);
 const linked=Rules.act(s,{system:'health',operation:'linkWitnessedHuman',
  params:{npcId:p.actorId,witness}});
 A.equal(linked.created,true);
 return {s,w,p,linked,life:w.independentPersonLives.people[p.id],witness};
}
const {s,w,p,linked,life,witness}=person(882114);
const id=linked.id,originalWork=p.career.workCount,
 originalMoney=p.funds,originalSkills=structuredClone(life.metrics),
 preWound=E.exportGame(s);
A.equal(Health.currentNpcWoundCondition(s,p.actorId).workAndOrdinaryPracticeBlocked,false);
const attack=Combat.attack(s,{targetId:id,modifier:25,damage:15,brace:false,nonlethal:true});
A.equal(attack.hit,true);
const injured=Combat.get(s,id),wounds=structuredClone(injured.wounds),
 condition=Health.currentNpcWoundCondition(s,p.actorId);
A.ok(wounds.some(n=>n>0));
A.equal(condition.source,'rules/combat.js');
A.equal(condition.hasUnresolvedWounds,true);
A.equal(condition.workAndOrdinaryPracticeBlocked,true);
A.equal(condition.noAutomaticWoundHealingOrSkillAward,true);
A.equal(condition.originalEntrySeal,injured.npcOrigin.seal);
const injuredSnapshot=E.exportGame(s),rollAfterAttack=s.rngState;
for(const request of [
 {system:'social',operation:'observeLocalWork',params:{npcId:p.actorId}},
 {system:'social',operation:'proposeLocalWork',
  params:{npcId:p.actorId,purpose:'Help repair the source-witnessed village work site'}},
 {system:'social',operation:'assistLocalWork',params:{npcId:p.actorId}}
]){
 A.throws(()=>Rules.act(s,request),/Original combat wounds or incapacity/);
 A.equal(E.exportGame(s),injuredSnapshot,
  'Rejected work cannot consume the player's roll, coin, clock, or choice');
}
A.equal(s.rngState,rollAfterAttack);
A.equal(p.career.workCount,originalWork);
const playerMeridian=s.player.meridian.stage;
const playerArcane=s.player.arcane.circles;
const summary=World.advance(s,6);
A.ok(summary.sixdayTicks.length>=1,
 'Source engine needs an actually elapsed original sixday');
A.equal(p.career.workCount,originalWork,'Combat-wounded NPC cannot earn career progress');
A.equal(p.funds,originalMoney,'Combat-wounded NPC cannot get unearned work income');
A.equal(p.history.at(-1).choice,'rest-from-original-combat-condition');
A.equal(p.history.at(-1).originalWoundWorkBlocked,true);
A.equal(p.history.at(-1).originalCombatantEntrySeal,injured.npcOrigin.seal);
A.equal(p.shift,null,'An injured actor cannot retain an ordinary productive work shift');
A.deepEqual(Combat.get(s,id).wounds,wounds,'Ordinary sixday rest cannot silently heal combat wounds');
A.equal(Health.currentNpcWoundCondition(s,p.actorId).workAndOrdinaryPracticeBlocked,true);
A.deepEqual(life.metrics,originalSkills,
 'Personal study and practice cannot progress under unresolved combat wounds');
A.ok(life.history.length>=6);
A.ok(life.history.every(e=>e.source.action==='rest'&&e.source.improved===0),
 'Only original ordinary rest can happen while combat wounds persist');
A.equal(s.player.meridian.stage,playerMeridian);
A.equal(s.player.arcane.circles,playerArcane);
const after=E.exportGame(s),replay=E.importGame(after);
const rw=Realm.peek(replay),rp=rw.emergentPeople.people[p.id];
A.equal(rp.career.workCount,originalWork);
A.deepEqual(Combat.get(replay,id).wounds,wounds);
A.equal(Health.currentNpcWoundCondition(replay,rp.actorId).workAndOrdinaryPracticeBlocked,true);
A.deepEqual(rw.independentPersonLives.people[p.id].metrics,originalSkills);
const forged=E.importGame(after),fc=Combat.get(forged,id);
fc.npcOrigin.foundationSeal='0'.repeat(64);
A.throws(()=>Health.currentNpcWoundCondition(forged,p.actorId),
 /original independent person|physical-entry source was altered|original source/,
 'Forging a private physical entry cannot unblock someone');
A.throws(()=>World.advance(forged,6),
 /original independent person|physical-entry source was altered|original source/,
 'World simulation must refuse a forged current wound owner');
const dying=E.importGame(preWound),dw=Realm.peek(dying),
 dp=dw.emergentPeople.people[p.id],
 dl=dw.independentPersonLives.people[p.id],
 dc=Combat.get(dying,id),
 priorLifeRng=dl.rngState;
const fatal=Combat.harm(dying,dc,7);
A.equal(fatal.status,'dead');
A.equal(Health.currentNpcWoundCondition(dying,dp.actorId).terminal,true);
World.advance(dying,6);
A.equal(dp.career.workCount,originalWork,
 'An NPC killed through the original combat model cannot work later');
A.equal(dp.funds,originalMoney,'Death cannot generate ordinary wages');
A.equal(dp.shift,null,'Death must prevent later independent work-site appearances');
A.equal(dp.history.at(-1).choice,'original-combat-death-no-activity');
A.equal(dl.rngState,priorLifeRng,'The deceased cannot make new independent activity choices');
A.deepEqual(dl.history,[],'A deceased person cannot study, make friends or practise offscreen');
A.equal(dl.lastDay,6,'No imaginary skipped days can be awarded later');
A.equal(Combat.get(dying,id).status,'dead','Ordinary time cannot resurrect the NPC');
A.equal(Health.currentNpcWoundCondition(dying,dp.actorId).terminal,true);
A.deepEqual(Combat.get(dying,id).wounds,[0,0,0],
 'Fatal harm was the original outright-kill ruling, not invented wound ticks');
console.log('Living NPC original wounds: on-site witnessed work gates, independent study gates, actual original sixday rest without wound healing, death inactivity, original save replay, and forged physical entry rejection PASS');
