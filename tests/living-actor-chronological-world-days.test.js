'use strict';
// Disposable #177 chronology regression. Long original passages must give
// independently living people the SAME source-ordered daily history as a
// series of genuine single-day original world passages.
const A=require('node:assert/strict'),
 E=require('../engine.js'),W=require('../rules/world'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Lives=require('../world/independent-person-lives'),Atlas=require('../world/atlas');
function starting(){
 const s=E.newGame({seed:991181,name:'Chronological independent person fixture'}),
  w=Realm.ensure(s),roster=People.ensure(w),
  region=Atlas.regions.find(x=>People.siteFor(x.id));
 A.ok(region);
 const eco=w.ecosystems[region.id],country=w.countries[region.polity];
 eco.quality=75;eco.pressure=15;eco.water=75;eco.forage=80;
 country.prosperity=75;country.stability=78;
 const demand=People.sourceDemand(w,region);
 A.ok(demand);
 const person=People._debug.make(w,roster,0,demand);
 A.equal(People.verify(w,person),true);
 s.chatRuntime||={};
 const witness=person.name+' is independently learning about real Meridian, Arcane and ordinary craftsmanship while working around regular responsibilities.';
 s.chatRuntime.scene=witness;
 A.equal(Lives.enroll(s,{actorId:person.actorId,
  interests:['meridian','arcane','craft','livelihood'],
  motivation:'An independent adult with multiple personal interests and no implied powers or employer',
  witness}).established,true);
 return {save:E.exportGame(s),actorId:person.actorId};
}
const {save,actorId}=starting();
for(const days of [4,13,38]){
 const bulk=E.importGame(save),single=E.importGame(save);
 // The ORIGINAL engine.advance daily market/weather owner legitimately
 // uses the shared world RNG. Compare bulk-vs-daily source replay, not
 // pre-passage RNG immobility (a false assertion for real elapsed time).
 const initialCoins=bulk.player.coins;
 W.advance(bulk,days);
 for(let i=0;i<days;i++)W.advance(single,1);
 const a=Realm.peek(bulk),b=Realm.peek(single),
  id=actorId.slice('emergent:'.length),
  personA=a.emergentPeople.people[id],
  personB=b.emergentPeople.people[id],
  lifeA=a.independentPersonLives.people[id],
  lifeB=b.independentPersonLives.people[id];
 A.equal(lifeA.lastDay,days);
 A.equal(lifeB.lastDay,days);
 A.equal(Lives.verifyEntry(a,lifeA),true);
 A.equal(Lives.verifyEntry(b,lifeB),true);
 A.deepEqual(lifeA,lifeB,'A long passage cannot let old days see future events');
 A.deepEqual(personA,personB,'World milestones cannot rewrite prior personal decisions');
 A.deepEqual(a.ecosystems,b.ecosystems);
 A.deepEqual(a.countries,b.countries);
 A.equal(a.rngState,b.rngState);
 A.equal(bulk.world.minutes,single.world.minutes);
 A.equal(bulk.rngState,single.rngState,
  'The original daily world RNG must replay identically in both intervals');
 A.equal(bulk.player.coins,initialCoins);
 A.equal(single.player.coins,initialCoins);
 A.deepEqual(personA.practicedDisciplines,[]);
 A.deepEqual(personA.knownTechniques,[]);
 A.equal(personA.meridianTraining,undefined);
 A.equal(personA.cashScales,0);
 A.ok(lifeA.history.every(x=>x.source.noMagicProgress===true));
 const replay=E.importGame(E.exportGame(bulk)),
  loaded=Realm.peek(replay).independentPersonLives.people[id];
 A.equal(Lives.verifyEntry(Realm.peek(replay),loaded),true);
 A.deepEqual(loaded,lifeA);
}
// Each original world milestone is simulated at its historical day boundary
// and the actual final world clock is restored after source resolution.
{
 const s=E.importGame(save),finalMinute=38*1440+171;
 s.world.minutes=finalMinute;
 const before=[],after=[];
 const result=Realm.tick(s,[6,12,18,24,30,36],[30],{
  beforeMilestone(day){before.push(day);},
  afterMilestone(day){
   after.push(day);
   A.equal(s.world.minutes,day*1440);
  }
 });
 A.deepEqual(before,[6,12,18,24,30,36]);
 A.deepEqual(after,before);
 A.equal(s.world.minutes,finalMinute);
 A.equal(result.sixdays,6);
 A.equal(result.months,1);
}
console.log('Original living-world chronology: daily and multi-month person histories, independent world RNG, source-verified milestones, no magic/income and save replay PASS');
