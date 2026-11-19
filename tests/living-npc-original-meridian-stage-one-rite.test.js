'use strict';
// Only disposable source-generated people. Historical 40-point journals in
// this isolated fixture are deterministic, mechanically replayed test data:
// NOT a claim of unplayed canonical off-screen achievements.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine.js'),R=require('../rules'),
 World=require('../world/simulation'),
 People=require('../world/emergent-people'),
 Lives=require('../world/independent-person-lives'),
 Atlas=require('../world/atlas'),Core=require('../rules/core'),
 Combat=require('../rules/combat'),D=require('../rules/disciplines'),
 DC=require('../rules/dynamic-difficulty'),
 Potential=require('../rules/potential-mechanics'),
 Foundation=require('../world/person-mechanical-foundations'),
 Build=require('../rules/build');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const chance=p=>Math.max(10,({curious:66,steady:59,independent:51,reserved:39})[p.personality]-(p.fatigue>=55?15:0));
const rite=(s,p,extra={})=>R.act(s,{system:'discipline',operation:'npcMeridianStageOneRite',params:{actorId:p.actorId,...extra}});
function history(s,p,c){
 const copy={rngState:p.rngState},
  rec={origin:'original-independent-meridian-foundation-practice-v1',
   target:'foundation',stageAtStart:0,points:0,methods:{},sessions:[],
   lastAttemptDay:-1,cooldownUntil:0};
 for(let day=0;day<230;day++){
  if(day<rec.cooldownUntil)continue;
  const shift=People.shift(p,day,World.peek(s));
  if(!shift)continue;
  const time=day*1440+600,pointsBefore=rec.points,before=copy.rngState,
   choice=Core.die(copy,100),accepted=choice<=chance(p);
  let method=null,methodNumber=null,check=null,complicationRoll=null,
   spent=0,minutes=5,cooldown=rec.cooldownUntil;
  if(accepted){
   methodNumber=Core.die(copy,3);
   method=['breath','tissue','circulation'][methodNumber-1];
   const earlier=rec.sessions.filter(r=>r.source.accepted).map(r=>({
    system:'meridian',target:'foundation',method:r.source.method,
    minutes:120,startMinute:r.source.startMinute,eventHash:r.seal}));
   const local={...s,world:{...s.world,minutes:time}},
    dc=DC.disciplinePractice(local,{system:'meridian',method,
     record:rec,baseDC:12,independent:true,short:true,
     originalPhysicalOwner:{stamina:c.maxStamina,maxStamina:c.maxStamina},
     originalTrainingWitnesses:earlier}).dc,
    aptitude=Potential.bonus(p.mechanicalFoundation.unassessedPotential[
     Potential.METHODS.meridian[method]]),
    modifier=Math.floor((p.mechanicalFoundation.baselineAttributes.wis-10)/2)+aptitude,
    roll=Core.die(copy,20),
    margin=roll+modifier+Core.naturalAdjustment(roll)-dc,
    degree=Core.degree(margin);
   check={roll,dc,modifier,degree,success:margin>=0,
    earned:Core.progress(degree)+(margin>=0?Math.max(0,aptitude):0)};
   if(degree==='severe failure'){
    complicationRoll=Core.die(copy,20);
    if(complicationRoll<=5)cooldown=day+6;
   }
   rec.points=Math.min(40,rec.points+check.earned);
   rec.methods[method]=(rec.methods[method]||0)+1;
   spent=1;minutes=120;
  }
  const body={
   origin:rec.origin,actorId:p.actorId,
   individualOriginHash:p.originHash,
   originalFoundationSeal:p.mechanicalFoundation.seal,
   originalCombatEntrySeal:c.npcOrigin.seal,
   originalShiftHash:shift.hash,
   originalSceneHash:hash(p.name+' performs disposable test-only source-calculated Foundation work.'),
   target:'foundation',originalSkillRankBonus:0,
   startMinute:time,day,rngBefore:before,rngAfter:copy.rngState,
   choiceD100:choice,choiceChance:chance(p),accepted,
   personalityAtAttempt:p.personality,fatigueAtAttempt:p.fatigue,
   actualMinutes:minutes,method,methodNumber,staminaCost:spent,
   staminaBefore:accepted?c.maxStamina:null,
   maxStaminaAtAttempt:accepted?c.maxStamina:null,
   staminaAfter:accepted?c.maxStamina-1:null,
   check,complicationRoll,pointsBefore,pointsAfter:rec.points,
   cooldownUntil:cooldown,noAutomaticRankOrStage:true};
  rec.sessions.push({source:body,seal:hash(body)});
  rec.lastAttemptDay=day;rec.cooldownUntil=cooldown;
  if(rec.points===40&&Object.keys(rec.methods).length>=2)
   return {rec,rng:copy.rngState,lastDay:day};
 }
 return null;
}
function fixture(outcome,seed){
 for(let worldSeed=seed;worldSeed<seed+4;worldSeed++){
  const s=E.newGame({seed:worldSeed,name:'Disposable independently acting Meridian practitioner'}),
   w=World.ensure(s),t=People.ensure(w),
   reg=Atlas.regions.find(x=>People.siteFor(x.id)),
   eco=w.ecosystems[reg.id],host=w.countries[reg.polity];
  eco.quality=75;eco.pressure=15;eco.water=75;eco.forage=80;
  host.prosperity=75;host.stability=78;
  const demand=People.sourceDemand(w,reg);
  for(let i=0;i<100;i++){
   const p=People._debug.make(w,t,0,demand);
   if(p.status!=='active'||
    p.mechanicalFoundation.baselineAttributes.con<7)continue;
   s.world.minutes=600;s.world.location=People.siteFor(p.regionId);
   p.shift=People.shift(p,0,w);
   if(!p.shift)continue;
   s.chatRuntime||={};
   const witness=p.name+' is an uninjured, unarmed, unarmoured adult here at '+
    s.world.location+', physically witnessed in this scene.';
   s.chatRuntime.scene=witness;
   Lives.enroll(s,{actorId:p.actorId,interests:['meridian'],
    motivation:'A personal determination to work on genuine Meridian Foundation preparation',
    witness});
   const linked=R.act(s,{system:'health',operation:'linkWitnessedHuman',
    params:{npcId:p.actorId,witness}});
   const c=Combat.get(s,linked.id),past=history(s,p,c);
   if(!past)continue;
   const predicted={rngState:past.rng},decision=Core.die(predicted,100),
    accepts=decision<=chance(p),roll=accepts?Core.die(predicted,20):null,
    aptitude=Potential.bonus(p.mechanicalFoundation.unassessedPotential[
     Potential.PRIMARY.meridian.foundation]),
    modifier=Math.floor((p.mechanicalFoundation.baselineAttributes.wis-10)/2)+aptitude,
    margin=accepts?roll+modifier+Core.naturalAdjustment(roll)-17:null,
    degree=accepts?Core.degree(margin):null,
    expected=!accepts?'declined':margin>=0?'breakthrough':
     degree==='severe failure'?'backlash':'stalled';
   if(expected!==outcome)continue;
   const day=past.lastDay+1,shift=People.shift(p,day,w);
   if(!shift)continue;
   p.meridianTraining=past.rec;p.rngState=past.rng;p.shift=shift;
   s.world.minutes=day*1440+600;
   s.chatRuntime.scene=p.name+
    ' begins a prepared Meridian Foundation rite, witnessed locally in a suitable quiet courtyard.';
   A.equal(D.verifyNpcMeridian(s,p),true,
    'The isolated historical fixture must replay through the original discipline owner');
   A.equal(D.npcMeridianPrivateStatus(s,p.actorId).originalRiteEligible,true);
   return {s,p,c,degree,roll};
  }
 }
 throw Error('No independently seeded '+outcome+
  ' rite case after original replayed 40-point history');
}
for(const expected of ['breakthrough','declined','backlash','stalled']){
 const {s,p,c,degree}=fixture(expected,
  expected==='breakthrough'?982111:expected==='declined'?982211:
   expected==='backlash'?982311:982411);
 const before=E.exportGame(s),pcRng=s.rngState,initial=s.world.minutes,
  stamina=c.stamina,max=c.maxStamina,pcStamina=s.player.stamina,
  personRng=p.rngState;
 for(const extra of [{roll:20},{outcome:'breakthrough'},{dc:2},
  {chosenStage:9},{points:40}]){
  A.throws(()=>rite(s,p,extra),
   /never select its dice, result, stage or consent/);
  A.equal(E.exportGame(s),before);
 }
 const result=rite(s,p);
 A.equal(result.observedOutcome,expected);
 A.equal(result.actualOriginalCheck,expected!=='declined');
 A.equal(result.elapsedMinutes,expected==='declined'?5:180);
 A.equal(s.world.minutes,initial+result.elapsedMinutes);
 A.equal(s.rngState,pcRng);
 A.equal(s.player.stamina,pcStamina);
 A.equal(s.player.meridian.stage,0);
 A.deepEqual(p.knownTechniques,[]);
 A.deepEqual(p.practicedDisciplines,[]);
 A.equal(D.verifyNpcMeridian(s,p),true);
 A.notEqual(p.rngState,personRng);
 const q=p.meridianTraining.sessions.at(-1).source;
 A.equal(q.originalRiteDC,17);
 A.equal(q.origin,'original-independent-meridian-foundation-stage-one-rite-v1');
 A.equal(q.noInventedTrainingRank,true);
 A.equal(q.noFreeQiOrLearnedTechnique,true);
 A.equal(q.feeTalons,0);
 A.equal(q.insightSpent,0);
 if(expected==='breakthrough'){
  A.equal(p.meridianTraining.earnedStage,1);
  A.equal(p.meridianTraining.target,'awakening');
  A.equal(p.meridianTraining.foundationIntegrity,20);
  A.equal(c.stamina,stamina+Build.meridianProfile(1).bonuses.stamina);
  A.equal(c.maxStamina,max+Build.meridianProfile(1).bonuses.stamina);
  A.deepEqual(c.wounds,[0,0,0]);
  A.equal(p.meridianTraining.points,0);
  A.deepEqual(p.meridianTraining.methods,{});
  A.ok(['Perfect','Firm','Sound'].includes(p.meridianTraining.foundationQuality));
  const privateDossier=Foundation.earnedEvidence(World.peek(s),p.actorId,s);
  A.equal(privateDossier.originalPowerMilestones.meridian.stage,1);
  A.equal(privateDossier.originalMeridianPreparation.originalBreakthroughPerformed,true);
 }else{
  A.equal(p.meridianTraining.earnedStage,undefined);
  A.equal(c.maxStamina,max);
  A.equal(c.stamina,stamina);
  A.equal(p.meridianTraining.target,'foundation');
  if(expected==='backlash'){
   A.equal(degree,'severe failure');
   A.equal(c.wounds[0],1);
   A.equal(p.meridianTraining.points,30);
   A.equal(p.meridianTraining.cooldownUntil,Math.floor(initial/1440)+30);
  }else{
   A.deepEqual(c.wounds,[0,0,0]);
   A.equal(p.meridianTraining.points,40);
   if(expected==='stalled')
    A.ok([12,24].includes(p.meridianTraining.cooldownUntil-Math.floor(initial/1440)));
  }
 }
 const saved=E.exportGame(s),replay=E.importGame(saved),
  restored=World.peek(replay).emergentPeople.people[p.id];
 A.equal(D.verifyNpcMeridian(replay,restored),true);
 A.deepEqual(D.npcMeridianPrivateStatus(replay,p.actorId),
  D.npcMeridianPrivateStatus(s,p.actorId));
 A.deepEqual(Combat.get(replay,'npc_'+p.id),c);
 const forged=E.importGame(saved),
  fperson=World.peek(forged).emergentPeople.people[p.id],
  row=fperson.meridianTraining.sessions.at(-1);
 row.source.outcome='breakthrough';
 A.equal(D.verifyNpcMeridian(forged,fperson),false);
 const resealed=E.importGame(saved),
  rp=World.peek(resealed).emergentPeople.people[p.id],
  last=rp.meridianTraining.sessions.at(-1);
 if(last.source.check){
  last.source.check.dc=2;last.seal=hash(last.source);
  A.equal(D.verifyNpcMeridian(resealed,rp),false);
 }
 const lastState=E.exportGame(s),lastRng=p.rngState;
 A.throws(()=>rite(s,p),
  /40 genuinely earned|rite decision cannot be rerolled|completed Stage I/);
 A.equal(E.exportGame(s),lastState);
 A.equal(p.rngState,lastRng);
}
console.log('Original NPC Stage I Meridian rite: 40 source-replayed Foundation points, two methods, independent DC17 check, actual 180-minute rite, Stage I +2 stamina, genuine refusal/stalls and 25% backlash loss plus Light wound, private GM evidence, save replay and tamper rejection PASS');
