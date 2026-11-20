'use strict';
// Unforced daily adult choices remain bound to the original three personal
// RNG draws. Genuine new interests cannot automatically dilute source-known
// old commitments into a ten-way uniform draw or grant supernatural skill.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Atlas=require('../world/atlas'),Lives=require('../world/independent-person-lives'),
 World=require('../rules/world');
const {rngNext,practiceFocus}=Lives._debug;
const priority={interestsAtIntroduction:['meridian','craft'],
 focus:'arcane',interests:['meridian','craft','arcane','soul','body']};
A.equal(practiceFocus(priority,0),'meridian');
A.equal(practiceFocus(priority,.175),'craft');
A.equal(practiceFocus(priority,.35),'arcane');
A.equal(practiceFocus(priority,.59),'arcane');
A.equal(practiceFocus(priority,.60),'meridian');
A.equal(practiceFocus(priority,.99),'body');
A.throws(()=>practiceFocus(priority,1),/original source RNG draw/);
const s=E.newGame({seed:941131,
 name:'Disposable autonomous old and new pursuit regression'});
const w=Realm.ensure(s),roster=People.ensure(w),
 region=Atlas.regions.find(x=>{
  const site=People.siteFor(x.id);
  return site&&E.LOCATIONS[site]?.biome==='settlement';
 });
A.ok(region,'An inhabited real original region is needed');
Object.assign(w.ecosystems[region.id],
 {quality:76,pressure:15,water:80,forage:80});
Object.assign(w.countries[region.polity],{prosperity:70,stability:80});
const demand=People.sourceDemand(w,region);
const p=People._debug.make(w,roster,0,demand);
A.ok(p&&People.verify(w,p));
p.shift=People.shift(p,0,w);
s.world.location=People.siteFor(p.regionId);
s.chatRuntime||={};
const witness=p.name+' freely discusses Meridian curiosity and craft at a real local workplace, without claiming any prior powers, instructor or lesson.';
s.chatRuntime.scene='An ordinary independently living adult: '+witness;
Lives.enroll(s,{actorId:p.actorId,interests:['meridian','craft'],
 motivation:'Personally interested in both Meridian cultivation and ordinary craft despite future changes of priority',
 witness});
const q=w.independentPersonLives.people[p.id],
 initialRng=s.rngState,firstInterests=q.interests.slice();
let originalPracticeDays=0,visited=0;
for(let day=1;day<=60;day++){
 const earlier=s.world.minutes,
  prior={focus:q.focus,interests:[...q.interests],
   interestsAtIntroduction:[...q.interestsAtIntroduction]};
 E.advance(s,1440);World.finalizeTime(s,earlier);
 const event=q.history.find(x=>x.source.day===day);
 A.ok(event,'A genuine personal day must be recorded');
 const src=event.source;
 A.equal(src.rngAfter,rngNext(rngNext(rngNext(src.rngBefore))),
  'No extra draws decide personal focus');
 A.equal(Lives.verifyEntry(w,q),true);
 if(src.action==='study'||src.action==='practice'){
  const b=rngNext(rngNext(src.rngBefore))/4294967296;
  A.equal(src.focus,practiceFocus(prior,b),
   'This actual personal day chooses one source-grounded interest with the original second draw');
  if(src.focus==='meridian'&&src.action==='practice')originalPracticeDays++;
  visited++;
 }
}
A.ok(visited>0,'Ordinary personal lives include actually chosen pursuits');
A.ok(originalPracticeDays>0,
 'A primary interest can still receive independently chosen physical practice');
A.deepEqual(firstInterests,['meridian','craft']);
A.equal(s.player.meridian.stage,0);
A.equal(s.player.arcane.circles,0);
A.equal(p.meridianTraining,undefined,
 'Unwitnessed physical anatomy must not materialise from ordinary interest');
A.equal(s.table?.combatants?.['npc_'+p.id],undefined,
 'A source-discovered interest cannot create an unwitnessed wound combatant');
A.equal(q.sourceHash,require('node:crypto').createHash('sha256')
 .update(JSON.stringify(q.source)).digest('hex'));
const saved=E.exportGame(s),loaded=E.importGame(saved),
 rw=Realm.peek(loaded),lq=rw.independentPersonLives.people[p.id];
A.equal(Lives.verifyEntry(rw,lq),true);
A.deepEqual(lq.history,q.history);
A.deepEqual(lq.interests,q.interests);
A.equal(loaded.player.meridian.stage,0);
console.log('Independent living interests PASS: unchanged original daily RNG, real independently chosen source and current focus, future discoveries without forced abandonment, no unearned power or time, verified save replay');
