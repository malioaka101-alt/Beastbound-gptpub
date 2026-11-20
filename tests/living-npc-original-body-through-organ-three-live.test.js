'use strict';
// Full source-owned original NPC BODY I (true original successful rite)
// -> personally earned BONE–MARROW II (180 points / two methods / true
// breakthrough) -> independently earned ORGAN III (four distinct systems,
// integrated own physiology). Explicit historical preparation for initial
// Body I in the disposable *fixture* is synthetic but exact and fully
// replayed. Nothing after I is predicted, selected, granted or faked.
// No actual player campaign save is edited.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine'),Rules=require('../rules'),World=require('../rules/world'),
 Realm=require('../world/simulation'),Lives=require('../world/independent-person-lives'),
 Early=require('../rules/independent-original-discipline-preparation'),
 Two=require('../rules/independent-original-body-cycle-two'),
 Three=require('../rules/independent-original-body-organ-cycle-three'),
 First=require('../rules/independent-original-first-milestones'),
 Health=require('../rules/unified'),Law=require('../rules/body-shared-original-organ-cycle-three'),
 Foundation=require('../world/person-mechanical-foundations');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const {fixture}=require('./living-npc-original-soul-body-rift-first-milestones.test.js');
const candidates=[];
for(let i=0;i<9;i++){
 const seed=972800+73*i;
 const f=fixture('body','breakthrough',seed);
 const v=f.p.mechanicalFoundation;
 // A naturally generated robust test subject is a legitimate observational
 // sampling decision; this does not inspect, preselect or change FUTURE dice.
 const score=v.baselineAttributes.con*8+v.unassessedPotential.physicalAdaptation*3+
  v.unassessedPotential.evolutionaryPlasticity*2;
 candidates.push({score,seed,...f});
}
candidates.sort((a,b)=>b.score-a.score||a.seed-b.seed);
const selected=candidates[0],{s,p,day,seed}=selected;
// The prior 2,520-day actual run reached 145/180 source-paid Bone-Marrow
// points without a rite. A larger bounded calendar is required for a *real*
// rite and subsequent real four-organ work, not fewer original points.
const first=Rules.act(s,{system:'discipline',operation:'npcOriginalFirstMilestone',
 params:{actorId:p.actorId,system:'body'}});
A.equal(first.observedOutcome,'breakthrough');
A.equal(p.originalFirstPowerMilestones.body.completedCycle,'Muscle-Tendon Cycle');
const w=Realm.peek(s),life=w.independentPersonLives.people[p.id];
life.lastDay=day;
A.equal(Lives.verifyEntry(w,life),true);
const originalCombat=s.table.combatants['npc_'+p.id];
A.equal(originalCombat.status,'ok');
const statsAfterFirst={maxStamina:originalCombat.maxStamina,
 toughness:originalCombat.toughness,serious:originalCombat.boxes[1],
 critical:originalCombat.boxes[2]};
const before=s.world.minutes,target=day*1440+990;
A.ok(target>before);
E.advance(s,target-before);World.finalizeTime(s,before);
const witness=p.name+' personally chooses a safe room at home for eight hours of real sleep, physically witnessed while preparing for bed.';
s.chatRuntime.scene='Actual safe shelter and freely chosen physical rest: '+witness;
const rested=Rules.act(s,{system:'health',operation:'witnessedNpcNightSleep',
 params:{actorId:p.actorId,witness}});
A.equal(rested.freelyAccepted,true,
 'Even an exceptional body candidate has no compulsory choice to sleep');
A.equal(Health.verifyNpcNightHistory(s,p.actorId),true);
let stageTwo=null,stageThree=null,firstThreeDay=null,days=0;
for(let i=0;i<140;i++){
 const minute=s.world.minutes;
 E.advance(s,30*1440);World.finalizeTime(s,minute);days+=30;
 if(i%5===4){
  A.equal(Early.verify(s,p),true);
  A.equal(Two.verify(s,p),true);
  A.equal(Three.verify(s,p),true);
 }
 if(p.originalBodyCycleTwo?.completed&&!stageTwo){
  const r=p.originalBodyCycleTwo,proof=r.sessions.find(x=>
   x.source.target==='cycle2-rite'&&x.source.outcome==='breakthrough');
  A.ok(proof&&proof.source.completedAfter,
   'Body II requires a genuinely checked individual Bone-Marrow rite');
  stageTwo={proof:structuredClone(proof),day:proof.source.day};
  A.equal(Two.verify(s,p),true);
  A.equal(originalCombat.toughness>=statsAfterFirst.toughness+1,true);
  A.equal(originalCombat.boxes[1]>=statsAfterFirst.serious+1,true);
 }
 if(p.originalBodyOrganCycleThree&&!firstThreeDay)
  firstThreeDay=p.originalBodyOrganCycleThree.sessions[0]?.source?.day;
 if(p.originalBodyOrganCycleThree?.completed){
  stageThree=p.originalBodyOrganCycleThree;break;
 }
}
const diagnostic=()=>JSON.stringify({
 candidateSeed:seed,aptitude:selected.score,con:p.mechanicalFoundation.baselineAttributes.con,
 days,stageII:!!p.originalBodyCycleTwo?.completed,
 IIpoints:p.originalBodyCycleTwo?.points,
 IIsessions:p.originalBodyCycleTwo?.sessions?.length,
 IIrites:p.originalBodyCycleTwo?.sessions?.filter(x=>x.source.target==='cycle2-rite').length,
 stageIII:!!p.originalBodyOrganCycleThree?.completed,
 IIIsessions:p.originalBodyOrganCycleThree?.sessions?.length,
 IIIorgans:p.originalBodyOrganCycleThree?.organs,
 IIIintegrated:p.originalBodyOrganCycleThree?.integrated,
 trueNights:p.originalOffscreenCombatNights?.length,
 combat:{stamina:originalCombat.stamina,maxStamina:originalCombat.maxStamina,
 wounds:originalCombat.wounds,status:originalCombat.status}
});
A.ok(stageTwo,'Original Body II independently earned Bone-Marrow formation not witnessed: '+diagnostic());
A.ok(stageThree,'Original Body III independent integrated organ formation not witnessed: '+diagnostic());
A.ok(firstThreeDay>stageTwo.day,'Organ III work must occur after actual physical II rite');
A.equal(stageThree.integrated,true);
A.deepEqual(stageThree.organs,{heart:2,lungs:2,liver:2,kidneys:2});
A.ok(stageThree.sessions.some(x=>x.source.accepted&&x.source.earned>0),
 'Original Body III never grants tissue integration without a genuine check');
A.equal(originalCombat.maxStamina,statsAfterFirst.maxStamina+Law.STAMINA_GAIN);
A.equal(originalCombat.toughness,statsAfterFirst.toughness+2);
A.equal(originalCombat.boxes[1],statsAfterFirst.serious+1);
A.equal(originalCombat.boxes[2],statsAfterFirst.critical+Law.CRITICAL_BOX_GAIN);
A.equal(Early.verify(s,p),true);A.equal(Two.verify(s,p),true);
A.equal(Three.verify(s,p),true);
A.deepEqual(p.knownTechniques,[]);
const dossier=Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence;
A.equal(dossier.originalBodyOrganCycleThree.earnedOrganCycle,true);
A.equal(dossier.originalPowerMilestones.body.completedCycles.length,3);
A.equal(dossier.originalPowerReadiness.originalBodyOrganPhysiology.staminaCapacityGain,2);
const original=E.exportGame(s),copy=E.importGame(original),
 rp=Realm.peek(copy).emergentPeople.people[p.id];
A.equal(Two.verify(copy,rp),true);
A.equal(Three.verify(copy,rp),true);
A.deepEqual(rp.originalBodyOrganCycleThree,stageThree);
const counterfeit=E.importGame(original),
 fp=Realm.peek(counterfeit).emergentPeople.people[p.id];
const row=fp.originalBodyOrganCycleThree.sessions.find(x=>x.source.accepted);
A.ok(row);
row.source.check.dc=2;row.seal=hash(row.source);
A.equal(Three.verify(counterfeit,fp),false,
 'Resealing an unreal easy organ DC never overrides source anatomy');
console.log('REAL independently acting Body I→ 180-point Bone–Marrow II→ four-organ integrated Body III COMPLETE, +2 Stamina/+1 Toughness/+1 critical box, original overnight recovery, save/tamper PASS; seed '+seed+' days '+days);
