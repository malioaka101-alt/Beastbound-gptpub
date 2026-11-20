'use strict';
// This test MUST import the actual source-born 108-Gate save produced by
// tests/meridian-npc-actual-unbroken-source-progression.test.js. NO fabricated
// Stage I, Stage II, any of the 108 Gates, energy, wounds, witnessed shelter,
// independent RNG outcomes or prefilled Stage IV–IX receipts are permitted.
// The NPC still chooses each original actual-life day, rolls via Core once,
// and pays genuine resources and bodily setbacks in the existing world.
const A=require('node:assert/strict'),FS=require('node:fs'),
 E=require('../engine.js'),Realm=require('../world/simulation'),
 Disc=require('../rules/disciplines'),Combat=require('../rules/combat'),
 World=require('../rules/world'),Gate=require('../world/independent-meridian-gates'),
 Sea=require('../world/independent-meridian-sea'),
 Web=require('../world/independent-meridian-web'),
 Advanced=require('../world/independent-meridian-advanced'),
 Power=require('../world/independent-original-power-days'),
 Convalescence=require('../world/independent-serious-convalescence');
const input=process.env.BEASTBOUND_MERIDIAN_REAL_SOURCE_INPUT;
if(!input||!/^meridian-real-108-[a-z0-9_-]+\.json$/.test(input)||
 !FS.existsSync(input))
 throw Error('A genuinely engine-earned 108-Gate source checkpoint is mandatory');
const s=E.importGame(FS.readFileSync(input,'utf8')),
 w=Realm.peek(s),
 people=Object.values(w.emergentPeople?.people||{}),
 matches=people.filter(p=>p.originalMeridianGates?.gates?.length===108);
A.equal(matches.length,1,'Exactly one genuinely source-verified 108-Gate adult required');
const p=matches[0],
 body=Combat.get(s,'npc_'+p.id),
 clock=s.world.minutes;
A.equal(p.originalMeridianSea,undefined,
 'Stage IV cannot be prefilled in the genuine 108-Gate source fixture');
A.equal(p.originalMeridianWeb,undefined);
A.equal(p.originalMeridianAdvanced,undefined);
A.equal(Disc.verifyNpcMeridian(s,p),true);
A.equal(Gate.verify(s,p),true,
 'All real 108 individually opened Gates must pass their actual source replay');
A.equal(Power.verifyNights(s,p),true);
A.equal(Convalescence.verify(s,p),true);
A.equal(Disc.npcMeridianPrivateStatus(s,p.actorId).originalMeridianStageEarned,3);
A.equal(s.player.meridian.stage,0,'NPC cannot receive the player progression');
A.deepEqual(p.knownTechniques,[],
 'An unopened learned-technique study cannot be assumed from 108 opened Gates');
A.equal(body.npcOrigin.actorId,p.actorId);
const goal=Number(process.env.BEASTBOUND_MERIDIAN_ADVANCED_TARGET||9);
A.ok([4,5,6,7,8,9].includes(goal));
const budget=Number(process.env.BEASTBOUND_MERIDIAN_ADVANCED_MAX_DAYS||9000);
A.ok(Number.isInteger(budget)&&budget>=45&&budget<=18000);
let days=0,highest=3;
const current=()=>p.originalMeridianAdvanced?.stage>=6?
 p.originalMeridianAdvanced.stage:
 p.originalMeridianWeb?.stage===5?5:
 p.originalMeridianSea?.stage===4?4:3;
const diagnostic=()=>JSON.stringify({
 completedStage:current(),target:goal,elapsedDays:days,
 body:{status:body.status,wounds:body.wounds,stamina:body.stamina,
  maxStamina:body.maxStamina},
 sea:p.originalMeridianSea&&{
  stage:p.originalMeridianSea.stage,
  points:p.originalMeridianSea.points,
  stability:p.originalMeridianSea.stability,
  qi:p.originalMeridianSea.energy?.currentQi,
  attempts:p.originalMeridianSea.attempts?.length},
 web:p.originalMeridianWeb&&{
  stage:p.originalMeridianWeb.stage,
  stability:p.originalMeridianWeb.stability,
  qi:p.originalMeridianWeb.energy?.currentQi,
  routes:p.originalMeridianWeb.routes?.map(x=>({
   kind:x.kind,integrity:x.integrity,required:x.required,
   injuries:x.injuries?.map(v=>({healed:v.healed,loss:v.loss}))})),
  sessions:p.originalMeridianWeb.sessions?.length},
 advanced:p.originalMeridianAdvanced&&{
  stage:p.originalMeridianAdvanced.stage,
  stability:p.originalMeridianAdvanced.stability,
  qi:p.originalMeridianAdvanced.energy?.currentQi,
  track:p.originalMeridianAdvanced.track,
  sessions:p.originalMeridianAdvanced.sessions?.length},
 lastPersonalDay:w.independentPersonLives?.people?.[p.id]?.lastDay});
while(current()<goal&&days<budget){
 const from=s.world.minutes,remaining=budget-days,
  step=Math.min(45,remaining);
 E.advance(s,step*1440);
 World.finalizeTime(s,from);
 A.equal(s.world.minutes,from+step*1440,
  'Original game world, not a second NPC clock, advances once');
 days+=step;
 const now=current();
 if(now>highest){
  // Multiple genuine breakthroughs inside the SAME 45-day engine batch
  // are lawful. Every intermediate source is still replayed by the
  // original latest-stage owner; don't demand a fabricated idle month.
  A.ok(now>highest&&now<=9);
  highest=now;
  A.equal(Disc.npcMeridianPrivateStatus(s,p.actorId).originalMeridianStageEarned,now);
  if(now===4)A.equal(Sea.verify(s,p),true);
  if(now===5)A.equal(Web.verify(s,p),true);
  if(now>=6)A.equal(Advanced.verify(s,p),true);
  A.equal(body.originalMeridianPhysical?.originalStage,now,
   'Actually earned Stage IV–IX physical changes must apply to canonical Combat');
  console.log('REAL NPC advanced Meridian stage '+now+
   ' source-verified after '+days+' post-Gate days');
 }
}
A.ok(current()>=goal,
 'Genuine original 108-Gate NPC could not advance to Stage '+goal+
 ' within the source-defined world days: '+diagnostic());
A.equal(Disc.verifyNpcMeridian(s,p),true);
A.equal(Gate.verify(s,p),true);
A.equal(Sea.verify(s,p),true);
if(goal>=5)A.equal(Web.verify(s,p),true);
if(goal>=6)A.equal(Advanced.verify(s,p),true);
A.equal(Power.verifyNights(s,p),true);
A.equal(Convalescence.verify(s,p),true);
A.ok(body.originalMeridianPhysical?.originalStage>=goal);
A.deepEqual(p.knownTechniques,[],
 'No autonomous advanced NPC may acquire an unearned learned Qi Strike');
A.equal(s.player.meridian.stage,0);
A.ok(s.world.minutes>clock);
const saved=E.exportGame(s),reloaded=E.importGame(saved),
 rp=Realm.peek(reloaded).emergentPeople.people[p.id];
A.equal(Disc.npcMeridianPrivateStatus(reloaded,rp.actorId).
 originalMeridianStageEarned,current());
A.equal(Gate.verify(reloaded,rp),true);
A.equal(Sea.verify(reloaded,rp),true);
if(goal>=5)A.equal(Web.verify(reloaded,rp),true);
if(goal>=6)A.equal(Advanced.verify(reloaded,rp),true);
A.deepEqual(Combat.get(reloaded,'npc_'+p.id),body,
 'The real NPC Combat body must survive serialized source replay unchanged');
console.log('REAL NPC original Gate 108 -> Stage '+goal+
 ' PASS: same unmodified earned individual, real independent world ticks,'+
 ' every original stage source and actual Combat physique, save/import replay;'+
 ' post-Gate days '+days);
