'use strict';
// Original Meridian Foundation: actual independent person chooses, pays
// existing physical Stamina, rolls ORIGINAL C.check and earns only real
// training points. No automatic Stage I, Qi, techniques or cloned player.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Rules=require('../rules'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),Lives=require('../world/independent-person-lives'),
 Atlas=require('../world/atlas'),Core=require('../rules/core'),
 Combat=require('../rules/combat'),Disc=require('../rules/disciplines'),
 Potential=require('../rules/potential-mechanics');
const perform=(s,id,extra={})=>Rules.act(s,{system:'discipline',operation:'npcMeridianPractice',
 params:{actorId:id,...extra}});
function fixture(accepted,seed){
 const s=E.newGame({seed,name:'Disposable source Meridian practitioner'}),
  w=Realm.ensure(s),people=People.ensure(w),
  region=Atlas.regions.find(x=>People.siteFor(x.id)),
  eco=w.ecosystems[region.id],host=w.countries[region.polity];
 eco.quality=75;eco.pressure=16;eco.water=75;eco.forage=80;
 host.prosperity=75;host.stability=78;
 const demand=People.sourceDemand(w,region);
 A.ok(demand);
 let p;
 for(let i=0;i<70;i++){
  const c=People._debug.make(w,people,0,demand);
  const chance=({curious:66,steady:59,independent:51,reserved:39})[c.personality]-
   (c.fatigue>=55?15:0);
  if(c.mechanicalFoundation.baselineAttributes.con>=7&&
   (Core.die({rngState:c.rngState},100)<=chance)===accepted){p=c;break;}
 }
 A.ok(p,'A genuinely consenting or declining independent adult exists');
 p.shift=People.shift(p,0,w);
 s.world.location=People.siteFor(p.regionId);
 s.world.minutes=600;s.chatRuntime||={};
 const witness=p.name+' is an uninjured, unarmed, unarmoured adult here at '+
  s.world.location+', directly witnessed in this present physical scene.';
 s.chatRuntime.scene='The person studies their own possible Meridian path. '+witness;
 A.equal(Lives.enroll(s,{actorId:p.actorId,interests:['meridian','craft'],
  motivation:'A personally held interest in slow authentic Meridian preparation and ordinary craftsmanship',
  witness}).established,true);
 const body=Rules.act(s,{system:'health',operation:'linkWitnessedHuman',
  params:{npcId:p.actorId,witness}});
 A.equal(body.created,true);
 return {s,w,p,bodyId:body.id};
}
for(const accept of [true,false]){
 const {s,p,bodyId}=fixture(accept,accept?930911:931012),
  initial=E.exportGame(s),playerRng=s.rngState,
  individualRng=p.rngState,minute=s.world.minutes,
  c=Combat.get(s,bodyId),stamina=c.stamina,
  originalPlayerStamina=s.player.stamina,
  originalCoins=s.player.coins;
 A.equal(Disc.npcMeridianPrivateStatus(s,p.actorId).actualFoundationPracticePoints,0);
 for(const invalid of [{method:'breath'},{dc:2},{points:40},{route:'free'},
  {insightSpent:2},{minutes:15}]){
  A.throws(()=>perform(s,p.actorId,invalid),/no chosen roll or method/);
  A.equal(E.exportGame(s),initial);
 }
 const result=perform(s,p.actorId);
 A.equal(result.independentChoice,accept?'practised':'declined');
 A.equal(result.actualOriginalCheck,accept);
 A.equal(result.stageOrTechniqueEarned,false);
 A.equal(result.privateProgressNotDisclosed,true);
 A.equal(result.elapsedMinutes,accept?120:5);
 A.equal(s.world.minutes,minute+(accept?120:5));
 A.equal(s.rngState,playerRng,'The player/world RNG cannot resolve NPC personal practice');
 A.equal(s.player.coins,originalCoins);
 A.equal(s.player.stamina,originalPlayerStamina);
 A.equal(s.player.meridian.stage,0);
 A.deepEqual(p.knownTechniques,[]);
 A.deepEqual(p.practicedDisciplines,[]);
 A.equal(Disc.verifyNpcMeridian(s,p),true);
 const rec=p.meridianTraining;
 A.ok(rec);
 A.equal(rec.sessions.length,1);
 const source=rec.sessions[0].source;
 A.equal(source.origin,'original-independent-meridian-foundation-practice-v1');
 A.equal(source.accepted,accept);
 A.equal(source.originalSkillRankBonus,0);
 A.equal(source.noAutomaticRankOrStage,true);
 A.equal(source.pointsBefore,0);
 A.equal(source.rngBefore,individualRng);
 const replay=E.importGame(E.exportGame(s));
 const rw=Realm.peek(replay),rp=rw.emergentPeople.people[p.id];
 A.equal(Disc.verifyNpcMeridian(replay,rp),true);
 A.deepEqual(rp.meridianTraining,p.meridianTraining);
 A.deepEqual(Disc.npcMeridianPrivateStatus(replay,p.actorId),
  Disc.npcMeridianPrivateStatus(s,p.actorId));
 A.equal(Disc.npcMeridianPrivateStatus(s,p.actorId).originalRiteEligible,false);
 if(accept){
  A.ok(['breath','tissue','circulation'].includes(source.method));
  A.equal(source.actualMinutes,120);
  A.equal(source.staminaCost,1);
  A.equal(source.staminaBefore,stamina);
  A.equal(source.staminaAfter,stamina-1);
  A.equal(c.stamina,stamina-1);
  const aptitude=Potential.bonus(p.mechanicalFoundation.unassessedPotential[
   Potential.METHODS.meridian[source.method]]);
  A.equal(source.check.dc,14,'Original base 12 + independent personal session 2 DC');
  A.equal(source.check.modifier,
   Math.floor((p.mechanicalFoundation.baselineAttributes.wis-10)/2)+aptitude);
  A.equal(source.check.earned,
   Core.progress(source.check.degree)+(source.check.success?Math.max(0,aptitude):0));
  A.equal(rec.points,source.check.earned);
  A.equal(rec.methods[source.method],1);
  const pr=s.log.findLast(x=>x.details?.privateNaturalStatsNotDisclosed===true);
  A.ok(pr,'Real original practice check logged privately');
  for(const field of ['modifier','roll','dc','total','margin'])
   A.equal(Object.hasOwn(pr.details,field),false);
  A.ok(p.rngState!==individualRng);
 }else{
  A.equal(source.method,null);
  A.equal(source.check,null);
  A.equal(source.actualMinutes,5);
  A.equal(c.stamina,stamina);
  A.equal(rec.points,0);
  A.deepEqual(rec.methods,{});
  A.equal(p.rngState,Core.die({rngState:individualRng},100)?
   source.rngAfter:source.rngAfter);
 }
 const end=E.exportGame(s),rngAfter=p.rngState;
 A.throws(()=>perform(s,p.actorId),/already made their independent Meridian choice today/);
 A.equal(E.exportGame(s),end,'One same-day independent intention cannot be rerolled');
 A.equal(p.rngState,rngAfter);
 const tampered=E.importGame(end),
  tperson=Realm.peek(tampered).emergentPeople.people[p.id];
 tperson.meridianTraining.sessions[0].source.pointsAfter=40;
 A.equal(Disc.verifyNpcMeridian(tampered,tperson),false);
 const tamperedBefore=E.exportGame(tampered),trng=tperson.rngState;
 A.throws(()=>perform(tampered,p.actorId),/proof was altered/);
 A.equal(E.exportGame(tampered),tamperedBefore);
 A.equal(tperson.rngState,trng);
}
{
 const {s,p,bodyId}=fixture(true,931115);
 Combat.harm(s,Combat.get(s,bodyId),2);
 const before=E.exportGame(s),prng=p.rngState;
 A.throws(()=>perform(s,p.actorId),/Unresolved original combat injury/);
 A.equal(E.exportGame(s),before);
 A.equal(p.rngState,prng);
}
{
 const {s,p}=fixture(true,931119);
 const q=Realm.peek(s).independentPersonLives.people[p.id];
 q.focus='craft';
 const before=E.exportGame(s);
 A.throws(()=>perform(s,p.actorId),/current original independent Meridian interest/);
 A.equal(E.exportGame(s),before);
}
console.log('Actual NPC Meridian Foundation: autonomous independent practice/decline, original dice, biological aptitude, original DC and stamina, no free stage/Qi, preserved source and replay, forged-work and injury refusal PASS');
