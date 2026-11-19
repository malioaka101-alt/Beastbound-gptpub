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
   if(independentAction(q)!==want||
    (want==='practice'&&Core.die({rngState:p.rngState},100)>
     Early.chance(p)))continue;
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
  logLen=s.log.length,personalSource=q.rngState;
 A.equal(Early.verify(s,p),true);
 E.advance(s,840);World.finalizeTime(s,originalClock);
 A.equal(s.world.minutes,1440,'One completed day; offscreen sessions add no player time');
 A.equal(s.world.location,playerLocation);
 A.equal(s.rngState,originalPlayerRng,
  'The independent personal and world owners do not consume player RNG');
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
 A.equal(s.log.length,logLen,
  'Private distant power check never leaks person, exact method or die into player log');
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
 const {s,p,q,c}=make('body','rest',998880),
  old=s.world.minutes,initialRng=p.rngState;
 Combat.harm(s,c,2);A.deepEqual(c.wounds,[1,0,0]);
 E.advance(s,840);World.finalizeTime(s,old);
 A.equal(q.history.at(-1).source.action,'rest');
 A.equal(c.wounds[0],0);
 A.equal(c.stamina,c.maxStamina);
 A.equal(p.rngState,initialRng,
  'Ordinary source-owned overnight Combat rest needs no second person roll');
 A.equal(p.originalOffscreenCombatNights?.length,1);
 A.equal(Offscreen.verifyNights(s,p),true);
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
console.log('Autonomous original offscreen power PASS: four true Core owner practices from actually chosen private lives, original anatomy, personal RNG, privacy, real chronology, no rerolls, replay/tamper and one actual settled Combat overnight recovery');
