'use strict';
// #177. The historical Core preparation below is a deliberately SYNTHETIC
// disposable test ledger. Each generated receipt is mechanically recomputed
// from the original source checks, NOT a canonical claim of past NPC actions.
// The ignition action under test rolls genuinely once using the original
// independent person's persisted RNG and original combat/wound owner.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine.js'),Rules=require('../rules'),
 Realm=require('../world/simulation'),People=require('../world/emergent-people'),
 Lives=require('../world/independent-person-lives'),Atlas=require('../world/atlas'),
 Core=require('../rules/core'),Combat=require('../rules/combat'),
 DC=require('../rules/dynamic-difficulty'),Potential=require('../rules/potential-mechanics'),
 Early=require('../rules/independent-original-discipline-preparation'),
 Arcane=require('../rules/independent-original-arcane-core'),
 Disc=require('../rules/disciplines'),Build=require('../rules/build'),
 Foundation=require('../world/person-mechanical-foundations');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const chance=p=>({curious:66,steady:59,independent:51,reserved:39})[p.personality]-
 (p.fatigue>=55?15:0);
const rite=(s,p,more={})=>Rules.act(s,{system:'discipline',
 operation:'npcArcaneCoreIgnition',params:{actorId:p.actorId,...more}});
function history(s,p,c){
 const simulated={rngState:p.rngState},rec={
  origin:Early.ORIGIN,target:'core',points:0,methods:{},
  sessions:[],lastAttemptDay:-1,cooldownUntil:0};
 let physicalInjury=false;
 for(let day=0;day<260;day++){
  if(day<rec.cooldownUntil)continue;
  const start=day*1440+600,before=simulated.rngState,
   decision=Core.die(simulated,100),accept=decision<=chance(p),
   pointsBefore=rec.points,cooldownBefore=rec.cooldownUntil;
  let method=null,methodNumber=null,check=null,complicationRoll=null,
   minutes=5,spent=0,injury=false,cooldown=rec.cooldownUntil;
  if(accept){
   methodNumber=Core.die(simulated,3);
   method=Early.METHODS.arcane[methodNumber-1];
   const prior=rec.sessions.filter(x=>x.source.accepted).map(row=>({
    system:'arcane',target:'core',method:row.source.method,
    minutes:120,startMinute:row.source.startMinute,eventHash:row.seal}));
   const local={...s,world:{...s.world,minutes:start}};
   const dc=DC.disciplinePractice(local,{
    system:'arcane',method,record:rec,
    baseDC:Disc.KEYS.arcane.tracks.core[1],independent:true,short:true,
    originalPhysicalOwner:{stamina:c.maxStamina,maxStamina:c.maxStamina},
    originalTrainingWitnesses:prior}).dc,
    aptitude=Potential.bonus(p.mechanicalFoundation.unassessedPotential[
     Potential.METHODS.arcane[method]]),
    modifier=Math.floor((p.mechanicalFoundation.baselineAttributes.int-10)/2)+aptitude,
    roll=Core.die(simulated,20),
    margin=roll+modifier+Core.naturalAdjustment(roll)-dc,
    degree=Core.degree(margin),earned=Core.progress(degree)+
     (margin>=0?Math.max(0,aptitude):0);
   check={roll,dc,modifier,degree,success:margin>=0,earned};
   rec.points=Math.min(40,rec.points+earned);
   rec.methods[method]=(rec.methods[method]||0)+1;
   minutes=120;spent=1;
   if(degree==='severe failure'){
    complicationRoll=Core.die(simulated,20);
    injury=complicationRoll<=3||complicationRoll===14||complicationRoll===15;
    if(injury)physicalInjury=true;
    if(complicationRoll<=5)cooldown=day+6;
   }
  }
  const proof={origin:Early.ORIGIN,actorId:p.actorId,
   system:'arcane',target:'core',individualOriginHash:p.originHash,
   originalFoundationSeal:p.mechanicalFoundation.seal,
   originalCombatEntrySeal:c.npcOrigin.seal,
   originalShiftHash:People.shift(p,day,Realm.peek(s)).hash,
   originalSceneHash:hash(p.name+' has a disposable historical Arcane test record.'),
   day,startMinute:start,actualMinutes:minutes,
   rngBefore:before,rngAfter:simulated.rngState,
   personalityAtAttempt:p.personality,fatigueAtAttempt:p.fatigue,
   choiceD100:decision,choiceChance:chance(p),accepted:accept,
   method,methodNumber,check,complicationRoll,
   originalPhysicalInjury:injury,
   staminaCost:spent,staminaBefore:accept?c.maxStamina:null,
   maxStaminaAtAttempt:accept?c.maxStamina:null,
   staminaAfter:accept?c.maxStamina-1:null,
   pointsBefore,pointsAfter:rec.points,cooldownBefore,
   cooldownUntil:cooldown,originalSkillRankBonus:0,
   noAutomaticStageOrTechnique:true};
  rec.sessions.push({source:proof,seal:hash(proof)});
  rec.cooldownUntil=cooldown;rec.lastAttemptDay=day;
  if(rec.points===40&&Object.keys(rec.methods).length>=2){
   return {rec,rng:simulated.rngState,lastDay:day,physicalInjury};
  }
 }
 return null;
}
function fixture(want,seed){
 for(let seedOffset=0;seedOffset<5;seedOffset++){
  const s=E.newGame({name:'Disposable real Arcane Core ignition fixture',
   seed:seed+seedOffset}),w=Realm.ensure(s),roster=People.ensure(w),
   region=Atlas.regions.find(x=>People.siteFor(x.id)),
   eco=w.ecosystems[region.id],country=w.countries[region.polity];
  Object.assign(eco,{quality:75,pressure:14,water:80,forage:80});
  Object.assign(country,{prosperity:75,stability:80});
  const demand=People.sourceDemand(w,region);A.ok(demand);
  for(let n=0;n<140;n++){
   const p=People._debug.make(w,roster,0,demand);
   if(p.mechanicalFoundation.baselineAttributes.con<7)continue;
   p.shift=People.shift(p,0,w);
   s.world.location=People.siteFor(p.regionId);
   s.world.minutes=600;s.chatRuntime||={};
   const witness=p.name+' is an uninjured, unarmed, unarmoured adult here at '+
    s.world.location+', directly witnessed and conscious.';
   s.chatRuntime.scene=witness;
   Lives.enroll(s,{actorId:p.actorId,interests:['arcane','craft'],
    motivation:'An independent wish to discover their personal Arcane anatomy without demanding a tutor',
    witness});
   const linked=Rules.act(s,{system:'health',operation:'linkWitnessedHuman',
    params:{npcId:p.actorId,witness}});
   const c=Combat.get(s,linked.id),past=history(s,p,c);
   if(!past||past.physicalInjury)continue;
   const today=past.lastDay+1,originalRng={rngState:past.rng},
    decision=Core.die(originalRng,100),accept=decision<=chance(p),
    roll=accept?Core.die(originalRng,20):null,
    bonus=Potential.bonus(p.mechanicalFoundation.unassessedPotential[
     Potential.PRIMARY.arcane.core]),
    modifier=Math.floor((p.mechanicalFoundation.baselineAttributes.int-10)/2)+bonus,
    margin=accept?roll+modifier+Core.naturalAdjustment(roll)-17:null,
    degree=accept?Core.degree(margin):null,
    expected=!accept?'declined':margin>=0?'ignited':
     degree==='severe failure'?'backlash':'stalled';
   if(expected!==want)continue;
   p.lastTickDay=today;p.shift=People.shift(p,today,w);
   p.rngState=past.rng;p.originalEarlyDisciplinePreparation={arcane:past.rec};
   s.world.minutes=today*1440+600;
   s.chatRuntime.scene=p.name+
    ' begins a prepared Arcane Mana Core ignition rite at their existing suitable local workplace.';
   A.ok(People.presence(w,p.actorId,s.world.location,today,600));
   A.equal(Early.verify(s,p),true,
    'Synthetic historical source is still exactly mechanically replayed');
   return {s,w,p,c,today,initialRng:p.rngState};
  }
 }
 throw Error('A disposable person with this independently determined Arcane outcome was not found: '+want);
}
for(const [want,seed] of [['ignited',985100],['declined',985300],
 ['stalled',985500],['backlash',985700]]){
 const {s,p,c,today,initialRng}=fixture(want,seed);
 const before=E.exportGame(s),t=s.world.minutes,
  playerRng=s.rngState,playerStamina=s.player.stamina,
  playerCoins=s.player.coins,physical=c.wounds.slice();
 A.throws(()=>rite(s,p,{forcedOutcome:'ignited'}),
  /accepts only an authentic actorId/);
 A.equal(E.exportGame(s),before);
 const result=rite(s,p);
 A.equal(result.observedOutcome,want);
 A.equal(result.actualOriginalCheck,want!=='declined');
 A.equal(result.realBacklash,want==='backlash');
 A.equal(result.elapsedMinutes,want==='declined'?5:180);
 A.equal(s.world.minutes,t+result.elapsedMinutes);
 A.equal(s.rngState,playerRng);
 A.equal(s.player.stamina,playerStamina);A.equal(s.player.coins,playerCoins);
 A.equal(Early.verify(s,p),true);
 const rec=p.originalEarlyDisciplinePreparation.arcane,row=rec.sessions.at(-1),
  q=row.source;
 A.equal(q.origin,Arcane.ORIGIN);A.equal(q.rngBefore,initialRng);
 A.equal(q.choiceChance,chance(p));A.equal(q.originalRiteDC,17);
 A.equal(q.pointsBefore,40);A.ok(q.distinctMethodsBefore>=2);
 A.equal(q.actualMinutes,result.elapsedMinutes);
 A.equal(q.noCircleSpellOrTechniqueGranted,true);
 A.equal(q.originalSkillRankBonus,0);
 A.deepEqual(p.knownTechniques,[]);A.deepEqual(p.practicedDisciplines,[]);
 // The original untouched player character does not necessarily possess
 // a false-valued ignition flag in legacy saves; undefined stays unknown.
 A.equal(s.player.arcane.coreIgnited,undefined);
 A.equal(s.player.arcane.circles,0);
 const dossier=Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence;
 const arcaneStatus=dossier.originalOtherDisciplinePreparation.actualPreparations.arcane;
 A.equal(arcaneStatus.realMilestoneAttemptCount,1);
 A.equal(arcaneStatus.genuineSessionCount,
  rec.sessions.filter(x=>x.source.origin===Early.ORIGIN&&x.source.accepted).length,
  'The actual Arcane rite is not another preparation session');
 A.equal(dossier.originalPowerMilestones.arcane.coreIgnited,
  want==='ignited'?true:null);
 if(want==='ignited'){
  A.equal(p.originalArcaneCore.coreIgnited,true);
  A.equal(p.originalArcaneCore.circles,0);
  A.equal(p.originalArcaneCore.geometry,'seeded core');
  A.equal(p.originalArcaneCore.structuredMana,Build.arcaneProfile(0).mana);
  A.equal(rec.target,'circle1');
  A.equal(rec.points,0);A.deepEqual(rec.methods,{});
  A.equal(dossier.originalPowerMilestones.arcane.circles,0);
 }else{
  A.equal(p.originalArcaneCore,undefined);
  A.equal(rec.target,'core');
  A.equal(dossier.originalPowerMilestones.arcane.circles,null);
  if(want==='backlash'){
   A.equal(rec.points,30);
   A.equal(rec.cooldownUntil,today+30);
   A.notDeepEqual(c.wounds,physical);
  }else A.deepEqual(c.wounds,physical);
 }
 const after=E.exportGame(s),rng=p.rngState;
 A.throws(()=>rite(s,p),
  /already earned their original Arcane Mana Core|original discipline or rite decision cannot be rerolled today/);
 A.equal(E.exportGame(s),after);A.equal(p.rngState,rng);
 const reloaded=E.importGame(after),rp=Realm.peek(reloaded).emergentPeople.people[p.id];
 A.equal(Early.verify(reloaded,rp),true);
 A.deepEqual(rp.originalEarlyDisciplinePreparation,p.originalEarlyDisciplinePreparation);
 A.deepEqual(rp.originalArcaneCore,p.originalArcaneCore);
 const forged=E.importGame(after),fp=Realm.peek(forged).emergentPeople.people[p.id],
  fr=fp.originalEarlyDisciplinePreparation.arcane.sessions.at(-1);
 if(want==='ignited')fp.originalArcaneCore.structuredMana=9999;
 else {fr.source.originalRiteDC=2;fr.seal=hash(fr.source);}
 A.equal(Early.verify(forged,fp),false);
 A.throws(()=>rite(forged,fp),/original independent Arcane source or preparation has been altered/);
 const last=s.log.findLast(x=>x.details?.privateNaturalStatsNotDisclosed===true);
 if(want!=='declined'){A.ok(last);A.equal(Object.hasOwn(last.details,'roll'),false);}
}
console.log('Verified independent original Arcane Mana Core: distinct 40-point/2-method rite, exact original Core check, true personal choice, original mana only on success, proper setbacks/wound, private replay and no free Circle PASS');
