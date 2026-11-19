'use strict';
// Synthetic prerequisite histories are disposable fixture-only and replayed
// through the ORIGINAL independent owner. The milestone being tested makes
// one TRUE live personal choice and uses one ORIGINAL Core.check, not a
// scripted character advancement or fabricated historical NPC.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine.js'),Rules=require('../rules'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Lives=require('../world/independent-person-lives'),
 Atlas=require('../world/atlas'),Core=require('../rules/core'),
 Combat=require('../rules/combat'),
 Early=require('../rules/independent-original-discipline-preparation'),
 First=require('../rules/independent-original-first-milestones'),
 Potential=require('../rules/potential-mechanics'),DC=require('../rules/dynamic-difficulty'),
 Disc=require('../rules/disciplines'),Build=require('../rules/build'),
 Foundation=require('../world/person-mechanical-foundations');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const chance=p=>({curious:66,steady:59,independent:51,reserved:39})[p.personality]-
 (p.fatigue>=55?15:0);
const choose=(s,p,system,extra={})=>Rules.act(s,{system:'discipline',
 operation:'npcOriginalFirstMilestone',params:{actorId:p.actorId,system,...extra}});
const attrs={soul:'wis',body:'con',rift:'int'};
function synthetic(s,p,c,system){
 const track=Disc.KEYS[system].tracks[Early.TARGETS[system]],
  sim={rngState:p.rngState},rec={origin:Early.ORIGIN,target:Early.TARGETS[system],
   points:0,methods:{},sessions:[],lastAttemptDay:-1,cooldownUntil:0};
 let injured=false;
 for(let day=0;day<360;day++){
  if(day<rec.cooldownUntil)continue;
  const start=day*1440+600,pointsBefore=rec.points,
   cooldownBefore=rec.cooldownUntil,rngBefore=sim.rngState,
   choiceD100=Core.die(sim,100),accepted=choiceD100<=chance(p);
  let minutes=5,method=null,methodNumber=null,check=null,
   complicationRoll=null,staminaCost=0,originalPhysicalInjury=false,
   newCooldown=rec.cooldownUntil;
  if(accepted){
   methodNumber=Core.die(sim,Early.METHODS[system].length);
   method=Early.METHODS[system][methodNumber-1];
   const prior=rec.sessions.filter(x=>x.source.origin===Early.ORIGIN&&x.source.accepted)
    .map(x=>({system,target:rec.target,method:x.source.method,minutes:120,
     startMinute:x.source.startMinute,eventHash:x.seal})),
    tmp={...s,world:{...s.world,minutes:start}},
    dc=DC.disciplinePractice(tmp,{system,method,
     record:rec,baseDC:track[1],independent:true,short:true,
     originalPhysicalOwner:{stamina:c.maxStamina,maxStamina:c.maxStamina},
     originalTrainingWitnesses:prior}).dc,
    apt=Potential.bonus(p.mechanicalFoundation.unassessedPotential[
     Potential.METHODS[system][method]]),
    mod=Math.floor((p.mechanicalFoundation.baselineAttributes[attrs[system]]-10)/2)+apt,
    roll=Core.die(sim,20),margin=roll+mod+Core.naturalAdjustment(roll)-dc,
    degree=Core.degree(margin),earned=Core.progress(degree)+
     (margin>=0?Math.max(0,apt):0);
   check={roll,dc,modifier:mod,degree,success:margin>=0,earned};
   rec.points=Math.min(track[0],rec.points+earned);
   rec.methods[method]=(rec.methods[method]||0)+1;
   minutes=120;staminaCost=1;
   if(degree==='severe failure'){
    complicationRoll=Core.die(sim,20);
    originalPhysicalInjury=complicationRoll<=3||complicationRoll===14||
     complicationRoll===15;
    if(originalPhysicalInjury)injured=true;
    if(complicationRoll<=5)newCooldown=day+6;
   }
  }
  const q={origin:Early.ORIGIN,actorId:p.actorId,system,target:rec.target,
   individualOriginHash:p.originHash,
   originalFoundationSeal:p.mechanicalFoundation.seal,
   originalCombatEntrySeal:c.npcOrigin.seal,
   originalShiftHash:People.shift(p,day,Realm.peek(s)).hash,
   originalSceneHash:hash('Disposable source-exact historical '+system+' fixture'),
   day,startMinute:start,actualMinutes:minutes,
   rngBefore,rngAfter:sim.rngState,
   personalityAtAttempt:p.personality,fatigueAtAttempt:p.fatigue,
   choiceD100,choiceChance:chance(p),accepted,
   method,methodNumber,check,complicationRoll,originalPhysicalInjury,
   staminaCost,staminaBefore:accepted?c.maxStamina:null,
   maxStaminaAtAttempt:accepted?c.maxStamina:null,
   staminaAfter:accepted?c.maxStamina-1:null,
   pointsBefore,pointsAfter:rec.points,cooldownBefore,
   cooldownUntil:newCooldown,originalSkillRankBonus:0,
   noAutomaticStageOrTechnique:true};
  rec.sessions.push({source:q,seal:hash(q)});
  rec.lastAttemptDay=day;rec.cooldownUntil=newCooldown;
  if(rec.points===track[0]&&Object.keys(rec.methods).length>=2)
   return {rec,rng:sim.rngState,lastDay:day,injured};
 }
 return null;
}
function fixture(system,want,seed){
 const rule=First.spec(system);
 for(let offset=0;offset<5;offset++){
  const s=E.newGame({name:'Disposable original '+system+' first-milestone test',
   seed:seed+offset}),w=Realm.ensure(s),roster=People.ensure(w),
   region=Atlas.regions.find(x=>People.siteFor(x.id)&&
    (system==='rift'?People.siteFor(x.id)==='ruins':
     People.siteFor(x.id)!=='ruins'));
  A.ok(region);
  Object.assign(w.ecosystems[region.id],{quality:75,pressure:14,water:80,forage:80});
  Object.assign(w.countries[region.polity],{prosperity:75,stability:80});
  const demand=People.sourceDemand(w,region);
  A.ok(demand);
  for(let n=0;n<140;n++){
   const p=People._debug.make(w,roster,0,demand);
   const baseline=p.mechanicalFoundation.baselineAttributes;
   if(baseline.con<7||baseline[rule.attribute]<10||
    p.mechanicalFoundation.unassessedPotential[rule.dimension]<5)continue;
   p.shift=People.shift(p,0,w);
   s.world.location=People.siteFor(p.regionId);
   s.world.minutes=600;s.chatRuntime||={};
   const witness=p.name+' is an uninjured, unarmed, unarmoured adult here at '+
    s.world.location+', directly witnessed in this current scene.';
   s.chatRuntime.scene=witness;
   Lives.enroll(s,{actorId:p.actorId,interests:[system,'craft'],
    motivation:'An independently held personal interest in authentic '+system+
     ' knowledge and ordinary working life',witness});
   const linked=Rules.act(s,{system:'health',operation:'linkWitnessedHuman',
    params:{npcId:p.actorId,witness}});
   const c=Combat.get(s,linked.id),past=synthetic(s,p,c,system);
   if(!past||past.injured)continue;
   const resultRng={rngState:past.rng},
    nextChoice=Core.die(resultRng,100),accepted=nextChoice<=chance(p),
    roll=accepted?Core.die(resultRng,20):null,
    apt=Potential.bonus(p.mechanicalFoundation.unassessedPotential[
     rule.dimension]),
    modifier=Math.floor((baseline[rule.attribute]-10)/2)+apt,
    margin=accepted?roll+modifier+Core.naturalAdjustment(roll)-rule.dc:null,
    degree=accepted?Core.degree(margin):null,
    predicted=!accepted?'declined':margin>=0?'breakthrough':
     degree==='severe failure'?'backlash':'stalled';
   if(predicted!==want)continue;
   const day=past.lastDay+1;
   p.lastTickDay=day;p.shift=People.shift(p,day,w);
   p.rngState=past.rng;p.originalEarlyDisciplinePreparation={[system]:past.rec};
   s.world.minutes=day*1440+600;
   s.chatRuntime.scene=p.name+' begins a prepared '+rule.label+
    ' rite in a genuinely suitable current local environment.';
   A.ok(People.presence(w,p.actorId,s.world.location,day,600));
   A.equal(Early.verify(s,p),true);
   return {s,w,p,c,day,beforeRng:p.rngState};
  }
 }
 throw Error('No disposable original '+system+' person with result '+want+
  ' and actual source-replayable prerequisite history');
}
for(const system of ['soul','body','rift']){
 for(const want of ['breakthrough','declined','backlash']){
  const {s,p,c,day,beforeRng}=fixture(system,want,971800+
   ['soul','body','rift'].indexOf(system)*1000+
   ['breakthrough','declined','backlash'].indexOf(want)*100);
  const old=E.exportGame(s),originalPlayerRng=s.rngState,
   originalPlayerCoins=s.player.coins,originalPlayerStamina=s.player.stamina,
   minutes=s.world.minutes,oldWounds=[...c.wounds],
   oldBody={stamina:c.stamina,maxStamina:c.maxStamina,offM:c.offM},
   originalBaseline=structuredClone(p.mechanicalFoundation);
  A.throws(()=>choose(s,p,system,{success:true}),
   /accepts actorId and power system only/);
  A.equal(E.exportGame(s),old);
  const resolved=choose(s,p,system);
  A.equal(resolved.observedOutcome,want);
  A.equal(resolved.actualOriginalCheck,want!=='declined');
  A.equal(resolved.realBacklash,want==='backlash');
  A.equal(resolved.elapsedMinutes,want==='declined'?5:180);
  A.equal(s.world.minutes,minutes+resolved.elapsedMinutes);
  A.equal(s.rngState,originalPlayerRng);
  A.equal(s.player.coins,originalPlayerCoins);
  A.equal(s.player.stamina,originalPlayerStamina);
  A.deepEqual(p.mechanicalFoundation,originalBaseline);
  A.equal(Early.verify(s,p),true);
  A.deepEqual(p.knownTechniques,[]);
  A.deepEqual(p.practicedDisciplines,[]);
  const rec=p.originalEarlyDisciplinePreparation[system],
   row=rec.sessions.at(-1),q=row.source,sp=First.spec(system);
  A.equal(q.origin,First.ORIGIN);A.equal(q.rngBefore,beforeRng);
  A.equal(q.originalRiteDC,sp.dc);A.equal(q.pointsBefore,sp.required);
  A.ok(q.distinctMethodsBefore>=2);
  A.equal(q.noOtherSystemOrTechniqueGranted,true);
  A.equal(q.originalPotentialDimension,sp.dimension);
  const dossier=Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence,
   history=dossier.originalOtherDisciplinePreparation.actualPreparations[system];
  A.equal(history.realMilestoneAttemptCount,1);
  A.equal(history.genuineSessionCount,
   rec.sessions.filter(x=>x.source.origin===Early.ORIGIN&&x.source.accepted).length);
  if(want==='breakthrough'){
   A.equal(rec.target,'earned-first-milestone');
   A.equal(rec.points,0);A.deepEqual(rec.methods,{});
   A.ok(p.originalFirstPowerMilestones?.[system]);
   A.equal(history.milestoneAwarded,true);
   if(system==='soul'){
    const profile=Build.soulProfile(1,{
     will:Math.floor((p.mechanicalFoundation.baselineAttributes.wis-10)/2)});
    A.equal(dossier.originalPowerMilestones.soul.phase,1);
    A.equal(p.originalFirstPowerMilestones.soul.soulReserve,profile.soulReserve);
    A.equal(p.originalFirstPowerMilestones.soul.perceptionRangeMetres,
     profile.perceptionRangeMetres);
   }else if(system==='body'){
    A.deepEqual(dossier.originalPowerMilestones.body.completedCycles,
     ['Muscle-Tendon Cycle']);
    A.equal(c.maxStamina,oldBody.maxStamina+2);
    A.equal(c.stamina,oldBody.stamina+2);
    A.equal(c.offM,Math.max(oldBody.offM,1));
    A.equal(p.originalFirstPowerMilestones.body.naturalStrengthIncrease,1);
   }else{
    A.equal(dossier.originalPowerMilestones.rift.step,1);
    A.equal(p.originalFirstPowerMilestones.rift.sense.notTeleportation,true);
   }
  }else{
   A.equal(rec.target,sp.target);
   A.equal(p.originalFirstPowerMilestones,undefined);
   A.equal(history.milestoneAwarded,false);
   if(want==='backlash'){
    A.equal(rec.points,Math.floor(sp.required*.75));
    A.equal(rec.cooldownUntil,day+30);
    A.deepEqual(c.wounds,[1,0,0]);
   }else A.deepEqual(c.wounds,oldWounds);
  }
  const saved=E.exportGame(s),savedRng=p.rngState;
  A.throws(()=>choose(s,p,system),
   /already earned this power-system milestone|already made a discipline decision today/);
  A.equal(E.exportGame(s),saved);
  A.equal(p.rngState,savedRng);
  const replay=E.importGame(saved),
   rp=Realm.peek(replay).emergentPeople.people[p.id];
  A.equal(Early.verify(replay,rp),true);
  A.deepEqual(rp.originalFirstPowerMilestones,p.originalFirstPowerMilestones);
  const forged=E.importGame(saved),
   fake=Realm.peek(forged).emergentPeople.people[p.id],
   fakeRow=fake.originalEarlyDisciplinePreparation[system].sessions.at(-1);
  if(want==='breakthrough')fake.originalFirstPowerMilestones[system]
   .originalSourceHash='0'.repeat(64);
  else{
   fakeRow.source.originalRiteDC=2;
   fakeRow.seal=hash(fakeRow.source);
  }
  A.equal(Early.verify(forged,fake),false);
  A.throws(()=>choose(forged,fake,system),
   /Original independent individual milestone or preparation history was altered/);
  if(want==='backlash'){
   const wfake=E.importGame(saved),
    wf=Realm.peek(wfake).emergentPeople.people[p.id],
    wr=wf.originalEarlyDisciplinePreparation[system].sessions.at(-1);
   wr.source.woundsAfter=[0,0,0];wr.seal=hash(wr.source);
   A.equal(Early.verify(wfake,wf),false);
  }
  if(want!=='declined'){
   const privacy=s.log.findLast(x=>x.details?.privateNaturalStatsNotDisclosed===true);
   A.ok(privacy);
   A.equal(Object.hasOwn(privacy.details,'roll'),false);
  }
 }
}
console.log('Original independent Soul/Body/Rift milestones PASS: three anatomical owners with genuine personal original checks, refusal, severe Light wound, source proof, no generic stage and exact replay');
