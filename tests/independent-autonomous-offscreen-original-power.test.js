'use strict';
// #177: actual independent daily choice -> real original private RNG/check
// -> original four discipline receipts, human combat fatigue and time, save
// replay, no player-summoned co-presence or magic from a generic day metric.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Rules=require('../rules'),World=require('../rules/world'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Lives=require('../world/independent-person-lives'),Atlas=require('../world/atlas'),
 Early=require('../rules/independent-original-discipline-preparation'),
 Offscreen=require('../world/independent-original-power-days'),
 Core=require('../rules/core'),Combat=require('../rules/combat');
const source=(s,p)=>Rules.act(s,{system:'health',
 operation:'linkWitnessedHuman',params:{npcId:p.actorId,witness:
 s.chatRuntime.scene}});
const next=x=>{x>>>=0;x^=x<<13;x^=x>>>17;x^=x<<5;
 return (x>>>0)||0x91e10da5;};
function independentAction(q){
 const a=next(q.rngState)/4294967296,
  b=next(next(q.rngState))/4294967296,
  c=next(next(next(q.rngState)))/4294967296;
 return a<.16?'rest':a>=.67&&c>=.38?'practice':'other';
}
function make(system,want,seed){
 for(let offset=0;offset<4;offset++){
  const s=E.newGame({name:'Disposable genuine offscreen '+system,seed:seed+offset}),
   w=Realm.ensure(s),roster=People.ensure(w),
   region=Atlas.regions.find(x=>People.siteFor(x.id)&&
    (system==='rift'?People.siteFor(x.id)==='ruins':
     want==='rest'?People.siteFor(x.id)==='academy':
      People.siteFor(x.id)!=='ruins'));
  A.ok(region);
  const eco=w.ecosystems[region.id],host=w.countries[region.polity];
  Object.assign(eco,{quality:75,pressure:12,water:80,forage:80});
  Object.assign(host,{prosperity:75,stability:80});
  const demand=People.sourceDemand(w,region);
  A.ok(demand);
  for(let n=0;n<145;n++){
   const p=People._debug.make(w,roster,0,demand);
   if(p.mechanicalFoundation.baselineAttributes.con<7)continue;
   s.world.location=People.siteFor(p.regionId);
   s.world.minutes=600;s.chatRuntime||={};
   p.shift=People.shift(p,0,w);
   const witness=p.name+' is an uninjured, unarmed, unarmoured adult in the current location. They are physically present and consciously observed.';
   s.chatRuntime.scene=witness;
   const established=Lives.enroll(s,{actorId:p.actorId,interests:[system],
    motivation:'Personally and independently interested in original '+system+
     ' practice and ordinary responsibilities',witness});
   A.ok(established.established);
   const q=w.independentPersonLives.people[p.id];
   // A previously witnessed safe shelter must first have been accepted
   // by this same person. Do not force a night-time decision to pass a test.
   const nightChance=Math.min(94,({curious:71,steady:82,
    independent:68,reserved:77})[p.personality]+(p.fatigue>=50?9:0)),
    nightRoll=1+Math.floor(next(p.rngState)/4294967296*100);
   if(independentAction(q)!==want||
    (want==='practice'&&Core.die({rngState:p.rngState},100)>
     Early.chance(p))||
    (want==='rest'&&nightRoll>nightChance))continue;
   const original=source(s,p);
   A.equal(original.created,true);
   const c=Combat.get(s,original.id);
   return {s,w,p,q,c};
  }
 }
 throw Error('No original independent person with chosen '+system+' daily '+want);
}
for(const system of ['arcane','soul','body','rift']){
 const {s,w,p,q,c}=make(system,'practice',991000+
  ['arcane','soul','body','rift'].indexOf(system)*100),
  originalPlayerRng=s.rngState,originalP=p.rngState,
  oldMax=c.maxStamina,oldStamina=c.stamina,
  originalClock=s.world.minutes,
  playerLocation=s.world.location,originalPlayerCoins=s.player.coins,
  personalSource=q.rngState;
 // Compare against the SAME original completed-day world simulation,
 // without this person's linked physical Combat owner. Ordinary world
 // passage itself legitimately consumes original core world RNG; only an
 // EXTRA remote personal check must not.
 const control=E.importGame(E.exportGame(s));
 delete control.table.combatants['npc_'+p.id];
 A.equal(Early.verify(s,p),true);
 E.advance(s,840);World.finalizeTime(s,originalClock);
 E.advance(control,840);World.finalizeTime(control,originalClock);
 A.equal(s.world.minutes,1440,'One completed day; offscreen sessions add no player time');
 A.equal(s.world.location,playerLocation);
 A.equal(s.rngState,control.rngState,
  'Original independent power checks must not consume EXTRA shared player RNG');
 A.equal(s.player.coins,originalPlayerCoins);
 A.equal(q.lastDay,1);A.equal(q.history.at(-1).source.action,'practice');
 A.equal(q.history.at(-1).source.focus,system);
 A.equal(q.rngState,next(next(next(personalSource))));
 A.equal(Early.verify(s,p),true,'Authentic original offscreen Source owner replays');
 const prep=p.originalEarlyDisciplinePreparation?.[system],
  row=prep?.sessions?.at(-1),attempt=row?.source;
 A.ok(row,'Real daily personal action opens a true source-owned power practice');
 A.equal(attempt.offscreenOpportunity.origin,Offscreen.ORIGIN);
 A.equal(attempt.offscreenOpportunity.independentDailySourceHash,
  q.history.at(-1).seal);
 A.equal(attempt.offscreenOpportunity.originalWorkDay,0);
 A.equal(attempt.offscreenOpportunity.privatePhysicalSite,
  People.siteFor(p.regionId));
 A.equal(Offscreen.verifyEvidence(s,p,attempt),true);
 A.equal(attempt.startMinute,600);
 A.equal(attempt.actualMinutes,120);
 A.equal(attempt.accepted,true,'Original private personal decision is genuine');
 A.equal(attempt.noAutomaticStageOrTechnique,true);
 A.equal(attempt.pointsBefore,0);
 A.ok(attempt.check.roll>=1&&attempt.check.roll<=20);
 A.equal(attempt.originalSkillRankBonus,0);
 A.equal(c.stamina,oldStamina-1);
 A.equal(c.maxStamina,oldMax);
 A.deepEqual(s.log,control.log,
  'Private distant Core checks must restore the entire player-known event log, while original world events remain');
 A.equal(p.originalArcaneCore,undefined);
 A.equal(p.originalFirstPowerMilestones,undefined);
 A.equal(prep.target,Early.TARGETS[system]);
 A.equal(p.rngState,attempt.rngAfter);
 A.notEqual(p.rngState,originalP);
 const after=E.exportGame(s),currentRng=p.rngState;
 const r=Lives.tick(s,0,1);
 A.equal(r.privateDailyActivities,0);
 A.equal(E.exportGame(s),after);
 A.equal(p.rngState,currentRng,'No same-day reroll');
 const imported=E.importGame(after),rp=Realm.peek(imported).
  emergentPeople.people[p.id];
 A.equal(Early.verify(imported,rp),true);
 A.deepEqual(rp.originalEarlyDisciplinePreparation,
  p.originalEarlyDisciplinePreparation);
 const altered=E.importGame(after),ap=Realm.peek(altered).
  emergentPeople.people[p.id],
  ar=ap.originalEarlyDisciplinePreparation[system].sessions.at(-1);
 ar.source.offscreenOpportunity.privatePhysicalSite='forged-distant-site';
 ar.seal=Early.hash(ar.source);
 A.equal(Early.verify(altered,ap),false,
  'Resealing a distant source without its original witnessed daily evidence fails');
}
// The original Combat.harm and completedNight are authoritative. A personally
// chosen rest action in real confirmed safe shelter repairs one LIGHT wound,
// never a second night or an invented clinic visit.
{
 const {s,p,q,c}=make('body','rest',998880);
 // First prove a true, independently ACCEPTED safe room at this exact
 // site using the existing original observed night owner. The witness is
 // genuinely present NOW; later remote nights never invent another scene.
 E.advance(s,360); // Existing witnessed evening, not an arbitrary rewind.
 const witness=p.name+
  ' chooses to sleep in a safe room at an established sheltered home.';
 s.chatRuntime.scene=witness;
 const observed=Rules.act(s,{system:'health',
  operation:'witnessedNpcNightSleep',params:{actorId:p.actorId,witness}});
 A.equal(observed.freelyAccepted,true,'The first actual safe-room visit is voluntary');
 A.equal(p.originalOvernightRestDecisions?.length,1);
 A.equal(s.world.minutes,1440);
 A.equal(p.originalOffscreenCombatNights,undefined,
  'One original witnessed night must never be counted a second time');
 // A later real Light wound and a real next-day personally chosen rest
 // permit an off-screen night at the already source-witnessed safe site.
 Combat.harm(s,c,2);A.deepEqual(c.wounds,[1,0,0]);
 const previous=s.world.minutes,initialRng=p.rngState;
 E.advance(s,1440);World.finalizeTime(s,previous);
 A.equal(q.history.at(-1).source.action,'rest');
 A.equal(c.wounds[0],0);
 A.equal(c.stamina,c.maxStamina);
 A.equal(p.rngState,initialRng,
  'Ordinary source-owned overnight Combat rest needs no second person roll');
 A.equal(p.originalOffscreenCombatNights?.length,1);
 A.equal(p.originalOffscreenCombatNights[0].source.originalWitnessedShelterHash,
  p.originalOvernightRestDecisions[0].sourceHash);
 A.equal(Offscreen.verifyNights(s,p),true);
 // Original bodily evidence has to remain checkable after the bounded
 // physical-night journal stops retaining a particular past night.
 const retainedOriginalNight=structuredClone(p.originalOffscreenCombatNights[0]);
 A.equal(Offscreen.verifyNights(s,p,[retainedOriginalNight]),true,
  'Exactly the real archived original Combat night remains independently replayable');
 const falseArchived=structuredClone(retainedOriginalNight);
 falseArchived.source.after.stamina-=1;
 falseArchived.seal=require('node:crypto').createHash('sha256').
  update(JSON.stringify(falseArchived.source)).digest('hex');
 A.equal(Offscreen.verifyNights(s,p,[falseArchived]),false,
  'A separately resealed archived night still cannot fake original Combat recovery');
 A.equal(Early.verify(s,p),true);
 const after=E.exportGame(s),reloaded=E.importGame(after),
  rp=Realm.peek(reloaded).emergentPeople.people[p.id];
 A.equal(Offscreen.verifyNights(reloaded,rp),true);
 const oldNight=rp.originalOffscreenCombatNights[0];
 oldNight.source.after.stamina=-99;
 // A re-sealed invalid night still fails its original Combat rules.
 oldNight.seal=require('node:crypto').createHash('sha256').
  update(JSON.stringify(oldNight.source)).digest('hex');
 A.equal(Offscreen.verifyNights(reloaded,rp),false);
}
// Source-prepared original Body individual from the existing independently
// replayed disposable fixture. Only its PREVIOUS preparation is synthetic;
// this test does NOT choose their upcoming daily activity or milestone result.
// It allows the actual private daily-life owner to encounter the next eligible
// independent practice day, which invokes ONE real Body milestone check.
{
 const {fixture}=require('./living-npc-original-soul-body-rift-first-milestones.test.js'),
  {s,p,day}=fixture('body','breakthrough',973100),
  q=Realm.peek(s).independentPersonLives.people[p.id],
  start=s.world.minutes;
 A.ok(q);A.equal(Early.verify(s,p),true);
 A.equal(p.originalEarlyDisciplinePreparation.body.points,150);
 // Disposable prior history has already been fully source-replayed by the
 // original fixture: align only its separately simulated ordinary-life
 // cursor, never its personal RNG, milestone outcome or current body.
 q.lastDay=day;
 A.equal(Lives.verifyEntry(Realm.peek(s),q),true);
 let found=null;
 for(let i=0;i<26;i++){
  const old=s.world.minutes;
  E.advance(s,1440);
  World.finalizeTime(s,old);
  const history=p.originalEarlyDisciplinePreparation.body.sessions,
   last=history.at(-1).source;
  if(last.origin===require('../rules/independent-original-first-milestones').ORIGIN){
   found=last;break;
  }
 }
 A.ok(found,'Original human eventually independently chose a genuine remote Body milestone rite');
 A.equal(found.offscreenOpportunity.kind,'body');
 A.equal(Offscreen.verifyEvidence(s,p,found),true);
 A.equal(found.pointsBefore,150);
 A.equal(found.noOtherSystemOrTechniqueGranted,true);
 A.equal(Early.verify(s,p),true);
 A.ok(['breakthrough','declined','stalled','backlash'].includes(found.outcome));
 if(found.outcome==='breakthrough'){
  A.equal(p.originalFirstPowerMilestones?.body?.completedCycle,
   'Muscle-Tendon Cycle');
  A.equal(p.originalFirstPowerMilestones.body.naturalStrengthIncrease,1);
 }
 const saved=E.exportGame(s),loaded=E.importGame(saved),
  lp=Realm.peek(loaded).emergentPeople.people[p.id];
 A.equal(Early.verify(loaded,lp),true);
 A.equal(loaded.world.minutes,s.world.minutes);
 A.ok(s.world.minutes>=start+1440);
}
console.log('Autonomous original offscreen power PASS: four true Core owner practices from actually chosen private lives, original anatomy, personal RNG, privacy, real chronology, no rerolls, replay/tamper and one actual settled Combat overnight recovery');
