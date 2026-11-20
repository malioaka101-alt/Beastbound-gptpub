'use strict';
// #177 — Real independent Meridian Foundation and Stage I at world-time
// boundaries. The original player source owns Qi anatomy and quality;
// neither ordinary life indicators nor a generic caster ladder grants them.
const A=require('node:assert/strict'),
 E=require('../engine.js'),R=require('../rules'),
 World=require('../rules/world'),
 Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),
 Atlas=require('../world/atlas'),
 Lives=require('../world/independent-person-lives'),
 Combat=require('../rules/combat'),
 Disc=require('../rules/disciplines'),
 Meridian=require('../world/independent-offscreen-meridian'),
 Power=require('../world/independent-original-power-days'),
 Build=require('../rules/build'),
 Core=require('../rules/core'),
 {fixture}=require('./living-npc-original-meridian-stage-one-rite.test.js');
const next=x=>{x>>>=0;x^=x<<13;x^=x>>>17;x^=x<<5;
 return (x>>>0)||0x91e10da5;};
const isPractice=q=>{
 const a=next(q.rngState)/4294967296,
  c=next(next(next(q.rngState)))/4294967296;
 return a>=.67&&c>=.38;
};
function fresh(){
 const s=E.newGame({name:'Disposable autonomous original Meridian adult',seed:988181}),
  w=Realm.ensure(s),registry=People.ensure(w),
  region=Atlas.regions.find(x=>People.siteFor(x.id)&&
   People.siteFor(x.id)!=='ruins'),
  eco=w.ecosystems[region.id],civic=w.countries[region.polity];
 Object.assign(eco,{quality:75,pressure:12,water:80,forage:80});
 Object.assign(civic,{prosperity:75,stability:80});
 const demand=People.sourceDemand(w,region);
 A.ok(demand);
 s.world.location=People.siteFor(region.id);s.world.minutes=600;
 s.chatRuntime||={};
 for(let i=0;i<130;i++){
  const p=People._debug.make(w,registry,0,demand);
  if(p.mechanicalFoundation.baselineAttributes.con<7)continue;
  p.shift=People.shift(p,0,w);
  const witness=p.name+
   ' is an uninjured, unarmed, unarmoured adult visibly present and responding beside the player.';
  s.chatRuntime.scene=witness;
  Lives.enroll(s,{actorId:p.actorId,interests:['meridian'],
   motivation:'Independently committed to authentic Meridian Foundation cultivation with no required teacher',
   witness});
  const q=w.independentPersonLives.people[p.id];
  if(!isPractice(q)||Core.die({rngState:p.rngState},100)>
   Meridian.chance(p))continue;
  const link=R.act(s,{system:'health',
   operation:'linkWitnessedHuman',params:{npcId:p.actorId,witness}});
  A.equal(link.created,true);
  return {s,p,q,c:Combat.get(s,link.id)};
 }
 throw Error('No independently eligible current Meridian practitioner in disposable source world');
}
// A genuine world day independently picks practice, then a separate original
// Meridian acceptance and d20 determine methods and points. No known future.
{
 const {s,p,q,c}=fresh(),clock=s.world.minutes,
  pcSource=s.rngState,initialPersonal=p.rngState,
  originalLifeRng=q.rngState,oldStamina=c.stamina,
  playerMoney=s.player.coins,playerStage=s.player.meridian.stage,
  before=E.exportGame(s),
  control=E.importGame(before);
 delete control.table.combatants['npc_'+p.id];
 A.equal(Disc.verifyNpcMeridian(s,p),true);
 E.advance(s,840);World.finalizeTime(s,clock);
 E.advance(control,840);World.finalizeTime(control,clock);
 A.equal(s.world.minutes,1440);
 A.equal(s.world.location,control.world.location);
 A.equal(s.rngState,control.rngState,
  'No extra shared game RNG is consumed by actual private Meridian check');
 A.deepEqual(s.log,control.log,
  'Remote Meridian practice may not reveal original private roll or identity');
 A.equal(s.player.coins,playerMoney);
 A.equal(s.player.meridian.stage,playerStage);
 A.equal(q.history.at(-1).source.action,'practice');
 A.equal(q.history.at(-1).source.focus,'meridian');
 A.equal(q.rngState,next(next(next(originalLifeRng))));
 const rec=p.meridianTraining,proof=rec.sessions.at(-1).source;
 A.equal(proof.origin,Meridian.PRACTICE);
 A.equal(proof.offscreenOpportunity.origin,Power.ORIGIN);
 A.equal(proof.offscreenOpportunity.kind,'meridian');
 A.equal(proof.offscreenOpportunity.originalWorkDay,0);
 A.equal(proof.offscreenOpportunity.independentDailySourceHash,
  q.history.at(-1).seal);
 A.equal(Power.verifyEvidence(s,p,proof),true);
 A.equal(proof.startMinute,600);
 A.equal(proof.accepted,true);
 A.equal(proof.actualMinutes,120);
 A.equal(proof.originalSkillRankBonus,0);
 A.equal(proof.noAutomaticRankOrStage,true);
 A.equal(rec.lastAttemptDay,0);
 A.equal(rec.target,'foundation');
 A.equal(c.stamina,oldStamina-1);
 A.equal(Disc.verifyNpcMeridian(s,p),true);
 A.notEqual(p.rngState,initialPersonal);
 A.equal(p.meridianTraining.earnedStage,undefined);
 A.equal(s.player.meridian.stage,0);
 const saved=E.exportGame(s),loaded=E.importGame(saved),
  lp=Realm.peek(loaded).emergentPeople.people[p.id];
 A.equal(Disc.verifyNpcMeridian(loaded,lp),true);
 const rerun=Lives.tick(s,0,1);
 A.equal(rerun.privateDailyActivities,0);
 A.equal(E.exportGame(s),saved);
 const forged=E.importGame(saved),fp=Realm.peek(forged).
  emergentPeople.people[p.id],row=fp.meridianTraining.sessions.at(-1);
 row.source.offscreenOpportunity.privatePhysicalSite='forged-distant-room';
 row.seal=require('node:crypto').createHash('sha256').
  update(JSON.stringify(row.source)).digest('hex');
 A.equal(Disc.verifyNpcMeridian(forged,fp),false);
}
// Source-generated past Foundation preparation remains *fixture-only*. The
// next milestone is not chosen here: only the genuine independent daily-life
// actor may elect that future day, then the true stage-one check resolves
// precisely once with the existing original Meridian verifier.
{
 const {s,p,c}=fixture('breakthrough',982111),w=Realm.peek(s),
  q=w.independentPersonLives.people[p.id],start=s.world.minutes,
  originalRng=p.rngState,baselineMax=c.maxStamina;
 const prepared=p.meridianTraining;
 A.equal(prepared.points,40);
 A.ok(Object.keys(prepared.methods).length>=2);
 const pastDay=Math.floor(start/1440);
 q.lastDay=pastDay;
 A.equal(Lives.verifyEntry(w,q),true);
 A.equal(Disc.verifyNpcMeridian(s,p),true);
 let result=null;
 for(let i=0;i<32;i++){
  const old=s.world.minutes;
  E.advance(s,1440);World.finalizeTime(s,old);
  const entry=p.meridianTraining.sessions.at(-1).source;
  if(entry.origin===Meridian.RITE){
   result=entry;break;
  }
 }
 A.ok(result,'The independent Meridian practitioner may undertake an original Stage I rite through true offscreen days');
 A.equal(result.originalRiteDC,17);
 A.equal(result.offscreenOpportunity.kind,'meridian');
 A.equal(Power.verifyEvidence(s,p,result),true);
 A.equal(result.pointsBefore,40);
 A.ok(result.distinctMethodsBefore>=2);
 A.equal(result.noFreeQiOrLearnedTechnique,true);
 A.equal(result.noInventedTrainingRank,true);
 A.equal(Disc.verifyNpcMeridian(s,p),true);
 A.ok(['breakthrough','declined','stalled','backlash'].includes(result.outcome));
 if(result.outcome==='breakthrough'){
  A.equal(p.meridianTraining.earnedStage,1);
  A.ok(['Perfect','Firm','Sound'].includes(
   p.meridianTraining.foundationQuality));
  A.equal(p.meridianTraining.foundationIntegrity,20);
  A.equal(c.maxStamina,baselineMax+
   Build.meridianProfile(1).bonuses.stamina);
 }else if(result.outcome==='backlash'){
  A.equal(p.meridianTraining.points,30);
  A.equal(c.wounds[0],1);
  A.equal(p.meridianTraining.cooldownUntil,result.day+30);
 }else A.equal(c.maxStamina,baselineMax);
 A.equal(s.player.meridian.stage,0);
 A.deepEqual(p.knownTechniques,[]);
 A.deepEqual(p.practicedDisciplines,[]);
 const last=E.exportGame(s),loaded=E.importGame(last),
  rp=Realm.peek(loaded).emergentPeople.people[p.id];
 A.equal(Disc.verifyNpcMeridian(loaded,rp),true);
 const tampered=E.importGame(last),tp=Realm.peek(tampered).
  emergentPeople.people[p.id],row=tp.meridianTraining.sessions.at(-1);
 row.source.offscreenOpportunity.privatePhysicalSite='another-person-home';
 row.seal=require('node:crypto').createHash('sha256').
  update(JSON.stringify(row.source)).digest('hex');
 A.equal(Disc.verifyNpcMeridian(tampered,tp),false);
}
console.log('Original independent offscreen MERIDIAN PASS: autonomously chosen Foundation method, genuine original d20/progress/body, earned separate Stage I rite and Foundation quality, durable source replay, no player presence, rank or RNG leakage');
