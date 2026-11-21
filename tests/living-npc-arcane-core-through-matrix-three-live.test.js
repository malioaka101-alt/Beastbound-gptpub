'use strict';
// Real original ignition, First Circle, Second Circle and Third Matrix.
// Initial disposable Core preparation in the exported fixture is explicitly
// SYNTHETIC and source-replayed. Every later action, roll, rest and wound is
// owned by the actual independent life and original mechanics.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine'),Rules=require('../rules'),World=require('../rules/world'),
 Realm=require('../world/simulation'),Lives=require('../world/independent-person-lives'),
 Early=require('../rules/independent-original-discipline-preparation'),
 Second=require('../rules/independent-original-arcane-circle-two'),
 Third=require('../rules/independent-original-arcane-matrix-three'),
 TwoLaw=require('../rules/arcane-shared-original-circle-two'),
 ThreeLaw=require('../rules/arcane-shared-original-matrix'),
 Health=require('../rules/unified'),Offscreen=require('../world/independent-original-power-days'),
 Foundation=require('../world/person-mechanical-foundations');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const {fixture}=require('./living-npc-original-arcane-core-rite.test.js');
const sample=[];
for(let i=0;i<8;i++){
 const seed=985100+i*31, f=fixture('ignited',seed);
 sample.push({...f,seed,intelligence:f.p.mechanicalFoundation.baselineAttributes.int});
}
sample.sort((a,b)=>b.intelligence-a.intelligence||a.seed-b.seed);
const reports=[];let observedFirst=0,observedSecond=0,observedThird=0,actualMatrixChecks=0,acceptedNights=0;
for(const {s,p,today,seed,intelligence} of sample.slice(0,3)){
 const ignition=Rules.act(s,{system:'discipline',operation:'npcArcaneCoreIgnition',
  params:{actorId:p.actorId}});
 A.equal(ignition.observedOutcome,'ignited');
 A.equal(p.originalArcaneCore.circles,0);
 const life=Realm.peek(s).independentPersonLives.people[p.id];
 life.lastDay=today;
 A.equal(Lives.verifyEntry(Realm.peek(s),life),true);
 const at=s.world.minutes,evening=today*1440+990;
 A.ok(evening>at);E.advance(s,evening-at);World.finalizeTime(s,at);
 const witness=p.name+' personally chooses an actual safe settlement bedroom for eight hours of sleep, witnessed while preparing for bed.';
 s.chatRuntime.scene='An actually available safe bedroom and personal voluntary rest opportunity: '+witness;
 const night=Rules.act(s,{system:'health',operation:'witnessedNpcNightSleep',
  params:{actorId:p.actorId,witness}});
 if(!night.freelyAccepted){reports.push({seed,intelligence,night:'declined'});continue;}
 acceptedNights++;
 A.equal(Health.verifyNpcNightHistory(s,p.actorId),true);
 let days=0;
 for(let i=0;i<60;i++){
  const t=s.world.minutes;E.advance(s,30*1440);World.finalizeTime(s,t);days+=30;
  if(p.originalArcaneMatrix?.completed)break;
 }
 A.equal(Early.verify(s,p),true);
 A.equal(Second.verify(s,p),true);A.equal(Third.verify(s,p),true);
 A.equal(Offscreen.verifyNights(s,p),true);
 const two=p.originalArcaneCircleTwo,three=p.originalArcaneMatrix,
  checks2=two?.sessions.filter(x=>x.source.origin===Second.ORIGIN&&x.source.accepted)||[],
  checks3=three?.sessions.filter(x=>x.source.origin===Third.ORIGIN&&x.source.accepted)||[];
 if(p.originalArcaneCore.circles===1)observedFirst++;
 if(two?.completed)observedSecond++;
 if(three?.completed)observedThird++;
 actualMatrixChecks+=checks3.length;
 for(const row of checks2){
  const q=row.source;
  A.equal(q.check.dc,TwoLaw.DC);A.equal(q.manaSpent,TwoLaw.MANA_COST);
  A.equal(q.manaAfter,q.manaBefore-q.manaSpent);
  A.equal(q.earnedIntegrity,TwoLaw.earned(q.check));
  A.equal(q.coreStabilityAfter,TwoLaw.stabilityAfter(q.coreStabilityBefore,q.check));
 }
 const finalSecond=checks2.find(x=>x.source.stageAfter===2);
 for(const row of checks3){
  const q=row.source;
  A.ok(finalSecond&&finalSecond.source.day<q.day);
  A.equal(q.originalSecondCircleSourceHash,finalSecond.seal);
  A.equal(q.check.dc,ThreeLaw.DC);A.equal(q.manaSpent,ThreeLaw.MANA_COST);
  A.equal(q.staminaSpent,ThreeLaw.staminaCost(180));
  A.equal(q.manaAfter,q.manaBefore-q.manaSpent);
  A.equal(q.staminaAfter,q.staminaBefore-q.staminaSpent);
  A.equal(q.earnedMatrixIntegrity,ThreeLaw.earned(q.check));
  A.equal(q.coreStabilityAfter,ThreeLaw.stabilityAfter(q.coreStabilityBefore,q.check));
 }
 const nightHashes=new Set();
 for(const row of [...(two?.sessions||[]),...(three?.sessions||[])].filter(x=>x.source.originalNight)){
  const q=row.source;
  A.ok(!nightHashes.has(q.originalNightSourceHash),'Same actual night cannot refill separate Circle II and III Mana pools');
  nightHashes.add(q.originalNightSourceHash);
  A.equal(Offscreen.verifyNights(s,p,[q.originalNight]),true);
  A.equal(q.manaAfter,Math.min(q.manaCapacity,q.manaBefore+12));
 }
 const d=Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence;
 A.equal(d.originalPowerMilestones.arcane.circles,three?.completed?3:two?.completed?2:p.originalArcaneCore.circles);
 A.deepEqual(p.knownTechniques,[]);
 A.equal(s.player.arcane.circles,0);
 const saved=E.exportGame(s),copy=E.importGame(saved),rp=Realm.peek(copy).emergentPeople.people[p.id];
 A.equal(Early.verify(copy,rp),true);A.equal(Second.verify(copy,rp),true);A.equal(Third.verify(copy,rp),true);
 if(checks3.length){
  const bad=E.importGame(saved),bp=Realm.peek(bad).emergentPeople.people[p.id],
   tampered=bp.originalArcaneMatrix.sessions.find(x=>x.source.origin===Third.ORIGIN&&x.source.accepted);
  tampered.source.originalSecondCircleSourceHash='0'.repeat(64);tampered.seal=hash(tampered.source);
  A.equal(Third.verify(bad,bp),false);
 }
 reports.push({seed,intelligence,days,firstCircle:p.originalArcaneCore.circles,
  second:!!two?.completed,secondIntegrity:two?.integrity??null,
  secondChecks:checks2.length,third:!!three?.completed,thirdProgress:three?.progress??null,
  thirdChecks:checks3.length,actualManaNights:nightHashes.size});
}
A.ok(acceptedNights>=1,'At least one actual independent initial safe night is needed');
console.log('ORIGINAL AUTONOMOUS ARCANE CORE–THIRD MATRIX ASSESSMENT PASS '+JSON.stringify({
 observedFirst,observedSecond,observedThird,actualMatrixChecks,acceptedNights,reports}));
console.log(observedThird?'Actual original three-Circle chain earned':'Complete Third Circle still unproven; no selected roll or granted stage');
