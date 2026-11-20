'use strict';
// No synthetic Foundation points, ranks, meridians, Gates, Qi, prior combat
// body or stage receipts. One truly generated independent person's original
// daily decisions, one genuinely witnessed voluntary first safe night, and
// the EXISTING Meridian source owners alone may advance this individual.
// A long calendar is NOT a guarantee of a breakthrough.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Rules=require('../rules'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),Atlas=require('../world/atlas'),
 Lives=require('../world/independent-person-lives'),
 Unified=require('../rules/unified'),World=require('../rules/world'),
 Combat=require('../rules/combat'),Disc=require('../rules/disciplines'),
 Build=require('../rules/build'),
 Ladder=require('../world/independent-meridian-ladder'),
 Gates=require('../world/independent-meridian-gates'),
 Power=require('../world/independent-original-power-days');
function next(n){n>>>=0;n^=n<<13;n^=n>>>17;n^=n<<5;
 return (n>>>0)||0x91e10da5;}
function born(){
 const s=E.newGame({name:'Disposable untrained actual Meridian adult',
  seed:941011});
 const w=Realm.ensure(s),people=People.ensure(w);
 const region=Atlas.regions.find(r=>{
  const place=People.siteFor(r.id);
  return !!place&&E.LOCATIONS[place]?.biome==='settlement';
 });
 A.ok(region);
 const eco=w.ecosystems[region.id],polity=w.countries[region.polity];
 Object.assign(eco,{quality:75,pressure:15,water:75,forage:80});
 Object.assign(polity,{prosperity:75,stability:78});
 const demand=People.sourceDemand(w,region);
 // Select solely for *source-born* aptitude and physical fitness, before
 // any personal-world day or power check. This is a favourable but ordinary
 // real individual, NOT a fabricated stage, training point or chosen roll.
 // The witnessed eight-hour sleep is still independently decided by the
 // original owner; the fixture cannot make a declined night accepted.
 let p=null,best=-Infinity;
 for(let i=0;i<250;i++){
  const c=People._debug.make(w,people,0,demand);
  const chance=Math.min(94,
   ({curious:71,steady:82,independent:68,reserved:77})[c.personality]+
   (c.fatigue>=50?9:0));
  const attrs=c.mechanicalFoundation.baselineAttributes,
   potential=c.mechanicalFoundation.unassessedPotential;
  if(attrs.con>=11&&attrs.wis>=15&&
    1+Math.floor(next(c.rngState)/4294967296*100)<=chance){
   const score=4*attrs.wis+6*potential.meridianBreadth+
    4*potential.physicalAdaptation+4*potential.gateStability+
    (c.personality==='curious'?5:0);
   if(score>best){p=c;best=score;}
  }
 }
 A.ok(p,'Only a source-born adult with a genuinely independently accepted safe-shelter night qualifies');
 p.shift=People.shift(p,0,w);
 s.world.location=People.siteFor(p.regionId);
 s.chatRuntime||={};
 const present=p.name+' is an uninjured, unarmed, unarmoured adult here at '+
  s.world.location+', physically witnessed in this present scene.';
 s.chatRuntime.scene='An independent present adult can be examined: '+present;
 Lives.enroll(s,{actorId:p.actorId,interests:['meridian'],
  motivation:'Independent interest in genuine Meridian preparation without any promised instruction or inheritance',
  witness:present});
 const link=Rules.act(s,{system:'health',operation:'linkWitnessedHuman',
  params:{npcId:p.actorId,witness:present}});
 A.equal(link.created,true);
 const combatant=Combat.get(s,link.id);
 A.equal(!!p.meridianTraining,false);
 A.equal(!!p.originalMeridianLadder,false);
 A.equal(!!p.originalMeridianGates,false);
 A.equal(Unified.verifyNpcNightHistory(s,p.actorId),true);
 const early=s.world.minutes;
 E.advance(s,16*60+30-early);World.finalizeTime(s,early);
 const shelter=p.name+
  ' voluntarily settles into a personally witnessed safe room for sleep at home, for eight continuous hours.';
 s.chatRuntime.scene="The safe room and the person's choice are directly witnessed: "+shelter;
 const rest=Rules.act(s,{system:'health',
  operation:'witnessedNpcNightSleep',params:{actorId:p.actorId,witness:shelter}});
 A.equal(rest.freelyAccepted,true);
 A.equal(rest.elapsedMinutes,480);
 A.equal(p.originalOvernightRestDecisions[0].source.accepted,true);
 A.equal(rest.originalSourceBoundQiRestored,0,
  'An unawakened adult has no Meridian Qi to recover');
 return {s,p,combatant};
}
const {s,p,combatant}=born(),initialPc=E.exportGame(s);
const a=p.mechanicalFoundation.baselineAttributes,
 ability=k=>Math.floor((a[k]-10)/2),
 baseline=Build.humanStats({vigor:ability('con'),agility:ability('dex'),
  wits:ability('wis'),will:ability('wis'),might:ability('str')},
  {skills:{Melee:0},size:'Medium'});
A.equal(combatant.maxStamina,baseline.stamina,
 'Actual original independent NPC begins with a genuine unmodified human body');
const witnessedNight=p.originalOvernightRestDecisions[0].sourceHash,
 actorRng=p.rngState,pcStage=s.player.meridian.stage;
let reachedI=false,reachedII=false,firstGate=false,daysElapsed=0,
 firstI=null,firstII=null,firstGateHash=null;
for(let interval=0;interval<72&&!firstGate;interval++){
 const clock=s.world.minutes;
 E.advance(s,45*1440);
 World.finalizeTime(s,clock);
 daysElapsed+=45;
 A.equal(Disc.verifyNpcMeridian(s,p),true,
  'Every genuine Foundation event must replay through the original owner');
 A.equal(Ladder.verify(s,p),true);
 A.equal(Gates.verify(s,p),true);
 A.equal(Power.verifyNights(s,p),true);
 A.equal(s.player.meridian.stage,pcStage);
 A.equal(p.originalOvernightRestDecisions[0].sourceHash,witnessedNight);
 A.equal(combatant.npcOrigin.actorId,p.actorId);
 if(p.meridianTraining?.earnedStage===1&&!reachedI){
  reachedI=true;
  firstI=p.meridianTraining.sessions.find(x=>
   x.source.origin==='original-independent-meridian-foundation-stage-one-rite-v1'&&
   x.source.outcome==='breakthrough')?.seal;
  A.ok(combatant.maxStamina>=
   baseline.stamina+Build.meridianProfile(1).bonuses.stamina,
   'Original earned Stage I breakthrough physically increases the SAME NPC Combat body');
  if(!p.originalMeridianLadder?.stage)
   A.equal(combatant.maxStamina,
    baseline.stamina+Build.meridianProfile(1).bonuses.stamina,
    'Before later milestones, genuine Stage I receives exactly its original bonus');
 }
 if(p.originalMeridianLadder?.stage===2&&!reachedII){
  reachedII=true;
  firstII=p.originalMeridianLadder.originalStageTwoSourceHash;
  A.equal(combatant.maxStamina,
   baseline.stamina+Build.meridianProfile(2,{meridians:12}).bonuses.stamina,
   'Actual Stage II completion grants source-owned Combat Stamina without resetting wounds');
 }
 if(p.originalMeridianGates?.gates?.length){
  firstGate=true;
  firstGateHash=p.originalMeridianGates.gates[0].sourceHash;
  A.equal(combatant.maxStamina,
   baseline.stamina+Build.meridianProfile(3,
    {meridians:12,gatesS:1}).bonuses.stamina,
   'First earned Lower Gate uses original Stage III physique, not an invented bonus');
 }
}
const diagnostic=()=>JSON.stringify({elapsedDays:daysElapsed,
 founded:reachedI,awakened:reachedII,firstGate,
 physical:{status:combatant.status,wounds:combatant.wounds,
 stamina:combatant.stamina,maxStamina:combatant.maxStamina},
 person:{status:p.status,fatigue:p.fatigue,personality:p.personality,
 interests:Realm.peek(s)?.independentPersonLives?.people?.[p.id]?.interests},
 foundation:{stage:p.meridianTraining?.earnedStage,
 points:p.meridianTraining?.points,sessions:p.meridianTraining?.sessions?.length},
 awakening:{stage:p.originalMeridianLadder?.stage,
 points:p.originalMeridianLadder?.awakening?.points,
 sessions:p.originalMeridianLadder?.awakening?.sessions?.length,
 cooldown:p.originalMeridianLadder?.awakening?.cooldownUntil},
 gates:{count:p.originalMeridianGates?.gates?.length,
 progress:p.originalMeridianGates?.gateWork?.progress,
 sessions:p.originalMeridianGates?.sessions?.length},
 verifiedOffscreenNights:p.originalOffscreenCombatNights?.length||0});
A.ok(reachedI,'One ordinary untrained person must genuinely earn the complete 40-point Stage I rite through personal-world days');
A.ok(reachedII,'The same person must genuinely earn 72 Stage II points and pass the independently chosen original Awakening rite: '+diagnostic());
A.ok(firstGate,'The genuinely awakened individual must actually open Lower Gate 1 without a synthetic prerequisite: '+diagnostic());
A.match(firstI,/^[0-9a-f]{64}$/);A.match(firstII,/^[0-9a-f]{64}$/);
A.match(firstGateHash,/^[0-9a-f]{64}$/);
A.equal(p.originalMeridianLadder.foundationRiteSeal,firstI);
A.equal(p.originalMeridianGates.originalAwakeningSourceHash,firstII);
A.equal(p.originalMeridianGates.gates[0].sourceHash,firstGateHash);
A.equal(p.originalMeridianLadder.primaryMapped,12);
A.ok(p.originalOffscreenCombatNights?.length,
 'Physical Stamina recovery was independently evidenced by the actual nightly rest owner');
A.notEqual(p.rngState,actorRng);
A.deepEqual(p.knownTechniques,[],
 'Even genuine opened Gates never automatically teach Qi Strike');
A.equal(p.originalMeridianSea,undefined);
const saved=E.exportGame(s),loaded=E.importGame(saved),
 rp=Realm.peek(loaded).emergentPeople.people[p.id];
A.equal(Disc.verifyNpcMeridian(loaded,rp),true);
A.equal(Ladder.verify(loaded,rp),true);
A.equal(Gates.verify(loaded,rp),true);
A.equal(Power.verifyNights(loaded,rp),true);
const tampered=E.importGame(saved),
 tp=Realm.peek(tampered).emergentPeople.people[p.id];
tp.originalMeridianGates.gates[0].quality='Perfect';
A.equal(Gates.verify(tampered,tp),false,
 'A forged Gate quality cannot survive exact historical source replay');
console.log('REAL independent Meridian living chain PASS: never-filled Foundation -> original Stage I rite -> all 12 Primary Stage II -> first actual individual Gate, genuine voluntary nightly recovery, personal RNG, saved replay, anti-forgery, no unearned Qi Strike; real elapsed days '+daysElapsed);

 // OPTIONAL, genuine longer integration proof. Run on demand, never on
 // ordinary draft edits or the full inventory: this deliberately uses real
 // person/world RNG and NO fabricated Stage II/Gate source or forced rolls.
 // Only the runtime budget differs; all original source validators remain.
const target=Number(process.env.BEASTBOUND_MERIDIAN_GATE_TARGET||0);
if(target!==0){
 A.ok([12,36,72,108].includes(target),'Only real original Gate milestones');
 const GateLaw=require('../rules/meridian-shared-original-gates');
 const maxMoreDays=Number(process.env.BEASTBOUND_MERIDIAN_MAX_ADDITIONAL_DAYS||3600);
 A.ok(Number.isInteger(maxMoreDays)&&maxMoreDays>=45&&maxMoreDays<=18000);
 let more=0,record=0;
 while((p.originalMeridianGates?.gates?.length||0)<target&&more<maxMoreDays){
  const began=s.world.minutes;
  E.advance(s,45*1440);
  World.finalizeTime(s,began);
  more+=45;
  A.equal(Gates.verify(s,p),true,
   'The full previously earned original 108-Gate journal must replay');
  A.equal(Power.verifyNights(s,p),true,
   'The independent person only receives source-verified night recovery');
  if(p.originalMeridianGates?.gates?.length>=record+12){
   record=p.originalMeridianGates.gates.length;
   console.log('REAL Meridian gate milestone: '+record+
    '/108 after '+(daysElapsed+more)+' physical days');
  }
 }
 const count=p.originalMeridianGates?.gates?.length||0;
 const problem=JSON.stringify({target,count,
  additionalDays:more,elapsedDays:daysElapsed+more,
  physicalStatus:combatant.status,wounds:combatant.wounds,
  stamina:combatant.stamina,maxStamina:combatant.maxStamina,
  gateSessions:p.originalMeridianGates?.sessions?.length,
  first108Source:p.originalMeridianGates?.gates?.[107]?.sourceHash||null,
  livingSourceValid:Gates.verify(s,p)});
 A.ok(count>=target,'Real unscripted source-born Gate target did not finish: '+problem);
 const profile=GateLaw.profile(3,p.originalMeridianGates.gates);
 A.equal(combatant.maxStamina,baseline.stamina+profile.bonuses.stamina,
  'Every real Gate threshold updates the SAME original NPC physical Combat body');
 A.equal(combatant.toughness,baseline.toughness+(profile.bonuses.toughness||0));
 A.equal(combatant.wpr,profile.bonuses.wpr||0);
 A.deepEqual(p.knownTechniques,[],
  'An actual long 108-Gate journey never automatically teaches Qi Strike');
 const savedLong=E.exportGame(s),restored=E.importGame(savedLong),
  actual=Realm.peek(restored).emergentPeople.people[p.id];
 A.equal(Gates.verify(restored,actual),true);
 A.ok(actual.originalMeridianGates.gates.length>=target);
 console.log('REAL uninterrupted original Meridian source-born NPC Gate '+target+
  ' PASS: all actual chosen Gate practice, real wounds and restorative nights,'+
  ' physical Combat anatomy, saved journal replay; days '+(daysElapsed+more));
}

