'use strict';
// #177 disposable original owner verification: Arcane Core preparation,
// Soul Phase-I preparation, Body tissue cycle-I and Rift sensing.
// Neither ordinary life familiarity nor a sealed practice check creates
// the distinct actual power-system milestone, mana, techniques or items.
const A=require('node:assert/strict'),
 Crypto=require('node:crypto'),E=require('../engine.js'),
 Rules=require('../rules'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),
 Lives=require('../world/independent-person-lives'),
 Atlas=require('../world/atlas'),Core=require('../rules/core'),
 Combat=require('../rules/combat'),
 Disc=require('../rules/disciplines'),
 Early=require('../rules/independent-original-discipline-preparation'),
 Potential=require('../rules/potential-mechanics'),
 Foundation=require('../world/person-mechanical-foundations');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function fixture(system,accepted,seed){
 const s=E.newGame({seed,name:'Disposable '+system+' living practitioner'}),
  w=Realm.ensure(s),roster=People.ensure(w),
  region=Atlas.regions.find(x=>People.siteFor(x.id)&&
   (system==='rift'?People.siteFor(x.id)==='ruins':
    People.siteFor(x.id)!=='ruins'));
 A.ok(region,'A real original practice location exists');
 const eco=w.ecosystems[region.id],host=w.countries[region.polity];
 Object.assign(eco,{quality:75,pressure:16,water:75,forage:80});
 Object.assign(host,{prosperity:75,stability:78});
 const demand=People.sourceDemand(w,region);
 A.ok(demand,'An original local economic reason exists for this adult');
 let p;
 for(let i=0;i<100;i++){
  const q=People._debug.make(w,roster,0,demand),
   chance=({curious:66,steady:59,independent:51,reserved:39})[q.personality]-
    (q.fatigue>=55?15:0);
  if(q.mechanicalFoundation.baselineAttributes.con>=7&&
   (Core.die({rngState:q.rngState},100)<=chance)===accepted){
   p=q;break;
  }
 }
 A.ok(p,'Real independent individual choice available');
 p.shift=People.shift(p,0,w);
 s.world.location=People.siteFor(p.regionId);
 s.world.minutes=600;s.chatRuntime||={};
 const witness=p.name+' is an uninjured, unarmed, unarmoured adult here at '+s.world.location+', directly witnessed in the original current scene without an invented teacher or rank.';
 s.chatRuntime.scene='The adult considers real personal '+system+' preparation. '+witness;
 A.equal(Lives.enroll(s,{actorId:p.actorId,
  interests:[system,'craft'],
  motivation:'Independently motivated to explore real '+system+' preparation along with ordinary livelihood',
  witness}).established,true);
 const body=Rules.act(s,{system:'health',operation:'linkWitnessedHuman',
  params:{npcId:p.actorId,witness}});
 A.equal(body.created,true);
 return {s,w,p,body:Combat.get(s,body.id)};
}
const attempt=(s,p,system,extra={})=>Rules.act(s,{
 system:'discipline',operation:'npcEarlyPreparation',
 params:{actorId:p.actorId,system,...extra}});
for(const system of ['arcane','soul','body','rift']){
 for(const accepted of [true,false]){
  const {s,p,body}=fixture(system,accepted,
   919005+['arcane','soul','body','rift'].indexOf(system)*100+(accepted?1:2));
  const before=E.exportGame(s),playerRng=s.rngState,coins=s.player.coins,
   pcStamina=s.player.stamina,personRng=p.rngState,
   minute=s.world.minutes,startingStamina=body.stamina;
  const original=Disc.originalActorSessionContext(s,{
   actorId:p.actorId,system,target:Early.TARGETS[system]});
  A.equal(original.noDecisionOrProgressAwarded,true);
  A.equal(original.training.earnedSkillRankBonus,0);
  A.equal(E.exportGame(s),before);
  A.throws(()=>attempt(s,p,system,{method:'selected-by-gm'}),
   /no chosen method/);
  A.equal(E.exportGame(s),before);
  const result=attempt(s,p,system);
  A.equal(result.independentChoice,accepted?'practised':'declined');
  A.equal(result.actualOriginalCheck,accepted);
  A.equal(result.stageOrTechniqueEarned,false);
  A.equal(result.elapsedMinutes,accepted?120:5);
  A.equal(s.world.minutes,minute+(accepted?120:5));
  A.equal(s.rngState,playerRng);
  A.equal(s.player.coins,coins);A.equal(s.player.stamina,pcStamina);
  A.equal(body.stamina,startingStamina-(accepted?1:0));
  A.equal(E.exportGame(s).includes('source-owned-independent-early-discipline-practice-v1'),true);
  A.deepEqual(p.knownTechniques,[]);
  A.deepEqual(p.practicedDisciplines,[]);
  const record=p.originalEarlyDisciplinePreparation[system],
   row=record.sessions[0],q=row.source,track=Disc.KEYS[system].tracks[Early.TARGETS[system]];
  A.equal(record.target,Early.TARGETS[system]);
  A.equal(q.originalSkillRankBonus,0);
  A.equal(q.rngBefore,personRng);
  A.equal(q.accepted,accepted);
  A.equal(record.sessions.length,1);
  A.equal(record.points<=track[0],true);
  A.equal(Early.verify(s,p),true);
  A.equal(Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence
   .originalOtherDisciplinePreparation.actualPreparations[system]
   .milestoneAwarded,false);
  const after=E.exportGame(s),rng=p.rngState;
  A.throws(()=>attempt(s,p,system),/already chose whether to train today/);
  A.equal(E.exportGame(s),after);
  A.equal(p.rngState,rng);
  const replay=E.importGame(after),rp=Realm.peek(replay)
   .emergentPeople.people[p.id];
  A.equal(Early.verify(replay,rp),true);
  A.deepEqual(Early.privateStatus(replay,p.actorId),
   Early.privateStatus(s,p.actorId));
  A.deepEqual(rp.originalEarlyDisciplinePreparation,
   p.originalEarlyDisciplinePreparation);
  if(accepted){
   A.ok(Early.METHODS[system].includes(q.method));
   A.equal(q.method,Early.METHODS[system][q.methodNumber-1]);
   A.equal(q.check.dc,14,'Original independent brief DC 12+2');
   const aptitude=Potential.bonus(p.mechanicalFoundation
    .unassessedPotential[Potential.METHODS[system][q.method]]);
   A.equal(q.check.modifier,
    Math.floor((p.mechanicalFoundation.baselineAttributes[
     Disc.KEYS[system].attribute]-10)/2)+aptitude);
   A.equal(q.check.earned,Core.progress(q.check.degree)+
    (q.check.success?Math.max(0,aptitude):0));
   const forged=E.importGame(after),fp=Realm.peek(forged)
    .emergentPeople.people[p.id],fr=fp.originalEarlyDisciplinePreparation[system].sessions[0];
   fr.source.check.dc=2;
   fr.seal=hash(fr.source);
   A.equal(Early.verify(forged,fp),false,
    'Re-sealing a forged cheap DC cannot change the original check');
   A.throws(()=>attempt(forged,fp,system),/proof was altered/);
   const last=s.log.findLast(x=>x.details?.privateNaturalStatsNotDisclosed===true);
   A.ok(last);
   A.equal(Object.hasOwn(last.details,'roll'),false);
  }else{
   A.equal(q.check,null);
   A.equal(q.method,null);
   A.equal(q.staminaCost,0);
   A.equal(record.points,0);
   const onlyChoice={rngState:personRng};
   Core.die(onlyChoice,100);
   A.equal(p.rngState,onlyChoice.rngState);
  }
 }
}
{
 const {s,p,body}=fixture('arcane',true,919839);
 Combat.harm(s,body,2);
 const original=E.exportGame(s),rng=p.rngState;
 A.throws(()=>attempt(s,p,'arcane'),/Unresolved original combat injury/);
 A.equal(E.exportGame(s),original);A.equal(p.rngState,rng);
}
{
 const {s,p}=fixture('soul',true,919840);
 const life=Realm.peek(s).independentPersonLives.people[p.id];
 life.focus='craft';
 const original=E.exportGame(s),rng=p.rngState;
 A.throws(()=>attempt(s,p,'soul'),/original independent Soul interest/);
 A.equal(E.exportGame(s),original);A.equal(p.rngState,rng);
}
{
 const s=E.newGame({seed:919841,name:'Old save without human Arcane preparation'});
 A.equal(Early.verify(s,{originalEarlyDisciplinePreparation:undefined}),true);
 A.ok(!s.table?.realm);
}
console.log('Original NPC Arcane/Soul/Body/Rift practice: four source owners, independent choice/check, real body cost/time/wounds, checked method/aptitude, private sealed replay, no stage or spell PASS');
