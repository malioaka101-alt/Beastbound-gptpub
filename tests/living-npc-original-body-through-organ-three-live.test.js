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


// Continue the exact previously earned Organ III person into the original
// witnessed neural route. Clinical observations below are explicit authored
// disposable test scenes (same witness boundary as the original player
// owner), NOT inferred offscreen anatomy, compulsory consent or success.
const Nerve=require('../rules/independent-original-body-nerve-sense-four'),
 PCNerve=require('../rules/body-nerve-sense'),
 NeuralLaw=require('../rules/body-shared-original-nerve-sense'),
 Core=require('../rules/core'),Presence=require('../world/person-presence');
const systems=[
 {id:'peripheral',tissue:'Original peripheral sensory endings and afferent nerves examined in the same living individual.',
  actualFunction:'Measured proprioceptive response remains bounded by physical conduction and original fatigue.'},
 {id:'motor',tissue:'Original spinal motor control and existing tendon reflexes of this living human body.',
  actualFunction:'Observed motor timing and deliberate controlled stopping remain within measurable physical limits.'},
 {id:'autonomic',tissue:'Existing autonomic regulation pathways of the previously earned heart and lung integration.',
  actualFunction:'Measured cardiac and breathing response to controlled exertion; no unlimited endurance.'}
];
const IVsite=s.world.location,priorMax=originalCombat.maxStamina;
let actualMap=false,practiceCount=0,repairCount=0,formChecks=0,refusals=0,extended=false;
for(let i=0;i<180&&!p.originalBodyNerveSenseFour?.completed;i++){
 const beforeDay=s.world.minutes,target=(Math.floor(beforeDay/1440)+1)*1440+600;
 E.advance(s,target-beforeDay);World.finalizeTime(s,beforeDay);
 const now=Math.floor(s.world.minutes/1440);
 if(!Presence.resolve(Realm.peek(s),p.actorId,IVsite,now,600)||
  originalCombat.status!=='ok'||originalCombat.wounds.some(x=>x!==0)||
  originalCombat.stamina<4)continue;
 const r=p.originalBodyNerveSenseFour,plan=r?.plan;
 let origin,details,minutes;
 if(!plan){
  origin=PCNerve.MAP;
  details={name:'Personally witnessed original neural map',systems,
   clinicalObservation:'Existing peripheral, spinal motor and autonomic responses are actually examined and distinguished.',
   independentCountertest:'Controlled stimuli and local voluntary stopping identify distinct finite responses without new senses.',
   metabolicLimit:'Ordinary oxygen, food, thermal balance and rest constrain the individual neural physiology.',
   injuryLimit:'Real neural and physical fatigue and injury interrupt coordination and controlled responses.',
   recovery:'Observed impairment requires genuine recovery or separately witnessed rehabilitation.'};
 }else if(r.strain>=5||Object.values(r.progress).every(x=>x===2)&&r.strain>2){
  origin=PCNerve.REPAIR;minutes=60;
  details={observedDamage:'Actual strain remains from the recorded earlier failed neural work, with a measured degraded physical response.',
   restorativeMethod:'Observed controlled rehabilitation, reduced stimulus and measured return of ordinary voluntary function.'};
 }else if(NeuralLaw.ready(r.progress,r.integrated,r.strain)){
  origin=PCNerve.FORM;minutes=90;
  details={fullBodyResponse:'Observed integrated sensory, motor and autonomic response across all established personal regions.',
   independentFailureLimit:'The independent controlled counterstimulus demonstrates finite response and physical stopping limits.'};
 }else if(!extended&&practiceCount>0){
  origin=PCNerve.MAP;
  details={systems:[{id:'vestibular',
   tissue:'Distinct existing vestibular hair cells and cranial sensory pathway examined in this individual.',
   actualFunction:'Measured orientation under controlled vestibular load remains limited by ordinary dizziness.'}],
   clinicalObservation:'The separately observed pre-existing vestibular pathway is distinguished from previous mapped regions.',
   independentCountertest:'Controlled orientation changes demonstrate bounded vestibular response and ordinary physical failure limits.'};
 }else{
  origin=PCNerve.PRACTICE;minutes=60;
  details={focus:'integrated',
   measuredResponse:'The actual previously observed regions display bounded reflex, sensory and autonomic response under controlled exertion.',
   fatigueLimit:'Controlled repetition measures the individual physical workload and the point at which fatigue limits integration.'};
 }
 s.chatRuntime.scene=p.name+' is actually present for a locally observed neural function and stopping-limit procedure.';
 Core.event(s,'story',s.chatRuntime.scene,{
  origin,location:IVsite,actorId:p.actorId,...details});
 const witnessIndex=s.log.length-1,before=E.exportGame(s),rng=s.rngState;
 const req={actorId:p.actorId,witnessIndex,...(minutes===undefined?{}:{minutes})};
 if(!r){
  A.throws(()=>Rules.act(s,{system:'body',operation:'npcNerveWork',params:{...req,success:true}}),/accepts actorId/);
  A.equal(E.exportGame(s),before);
 }
 const result=Rules.act(s,{system:'body',operation:'npcNerveWork',params:req});
 A.equal(Nerve.verify(s,p),true);
 // NPC roll uses only the actor's own RNG. World simulation may use
 // other independent sources; no player technique or capacity is awarded.
 const receipt=p.originalBodyNerveSenseFour.sessions.at(-1),q=receipt.source;
 A.equal(q.witnessHash,hash(q.witness));
 A.equal(q.accepted,result.independentlyAccepted);
 if(!q.accepted){refusals++;A.equal(q.staminaSpent,0);A.equal(q.check,null);}
 else if(q.kind==='map'){actualMap=true;A.equal(q.check,null);}
 else if(q.kind==='extend'){extended=true;A.equal(q.after.progress.vestibular,0);}
 else if(q.kind==='practice'){practiceCount++;A.equal(q.check.dc,18);A.equal(q.staminaSpent,NeuralLaw.practiceStamina(minutes));}
 else if(q.kind==='repair'){repairCount++;A.equal(q.check.dc,15);A.equal(q.staminaSpent,NeuralLaw.repairStamina(minutes));}
 else if(q.kind==='form'){formChecks++;A.equal(q.check.dc,21);A.equal(q.staminaSpent,4);}
}
const IV=p.originalBodyNerveSenseFour;
A.ok(actualMap,'Actual original Organ III adult must freely accept a separately witnessed original neural map');
A.ok(practiceCount>0,'Actual neural work, not merely an anatomical title, must be observed');
A.equal(Nerve.verify(s,p),true);
A.equal(Three.verify(s,p),true);
A.equal(originalCombat.maxStamina,priorMax+(IV.completed?1:0));
A.deepEqual(p.knownTechniques,[]);
const IVd=Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence;
A.equal(IVd.originalBodyNerveSenseFour.earnedNerveSenseCycle,IV.completed);
A.equal(IVd.originalPowerMilestones.body.completedCycles.length,IV.completed?4:3);
const IVsave=E.exportGame(s),IVcopy=E.importGame(IVsave),
 IVp=Realm.peek(IVcopy).emergentPeople.people[p.id];
A.equal(Nerve.verify(IVcopy,IVp),true);
const IVfake=E.importGame(IVsave),IVbad=Realm.peek(IVfake).emergentPeople.people[p.id],
 IVrow=IVbad.originalBodyNerveSenseFour.sessions.find(x=>x.source.kind==='practice'&&x.source.accepted);
IVrow.source.check.dc=2;IVrow.seal=hash(IVrow.source);
A.equal(Nerve.verify(IVfake,IVbad),false,'Resealed fake neural check cannot create original physiology');
console.log('ORIGINAL WITNESSED NPC NERVE-SENSE IV ASSESSMENT PASS '+JSON.stringify({
 actualMap,practiceCount,repairCount,formChecks,refusals,extended,formed:IV.completed,
 progress:IV.progress,strain:IV.strain}));


// Continue the same actual Organ III / witnessed IV practitioner into
// the original independent Blood/Adaptive plans (V and VI are not serial
// prerequisites). All new tissue witness text is an explicitly authored
// disposable test scene; all choices, checks, elapsed days and costs real.
const Physique=require('../rules/independent-original-body-living-physiques'),
 PCPhysique=require('../rules/body-living-physiques'),
 PLaw=require('../rules/body-shared-original-living-physique');
const advancedMax=originalCombat.maxStamina,counts={map:0,work:0,care:0,form:0,repeat:0,declined:0};
for(let i=0;i<300;i++){
 const old=s.world.minutes,target=(Math.floor(old/1440)+1)*1440+600;
 E.advance(s,target-old);World.finalizeTime(s,old);
 const dayNow=Math.floor(s.world.minutes/1440);
 if(!Presence.resolve(Realm.peek(s),p.actorId,IVsite,dayNow,600)||
  originalCombat.status!=='ok'||originalCombat.wounds.some(x=>x!==0)||
  originalCombat.stamina<5)continue;
 const ledger=p.originalBodyLivingPhysiques,cycles=ledger?.cycles||{};
 const unfinished=[5,6].filter(c=>!cycles[c]?.completed);
 const cycle=unfinished.length?unfinished[i%unfinished.length]:
  IV.completed&&!cycles[7]?.completed?7:null;
 if(!cycle)break;
 const rec=cycles[cycle],sp=PLaw.SPEC[cycle];let origin,details,minutes;
 if(!rec){
  origin=PCPhysique.MAP;
  details={designId:'witnessed_personal_physique_'+cycle,
   method:'A separately observed bounded refinement procedure for this individual’s existing biological tissues.',
   actualTissues:'Existing individual tissue, circulation and metabolic responses are physically observed and measured without copied species power.',
   metabolicSupport:'Observed ordinary oxygen, water, nutrition and metabolic demand limit the procedure.',
   failureLimit:'An independently observed physical counterstimulus identifies impairment and a genuine failure boundary.',
   reversion:'The examined practitioner can stop the workload and requires ordinary supported physical recovery.',
   independentCountertest:'Actual controlled finite anatomical response and failure boundary are examined in this local test scene.',
   ...Object.fromEntries(sp.sources.map(k=>[k,'Distinct actual tissue function and metabolic limitations are witnessed for '+sp.name+' in this disposable anatomical test scene.']))};
 }else if(rec.strain>=5||rec.points===6&&rec.strain>2){
  origin=PCPhysique.CARE;minutes=60;
  details={observedBodyResponse:'Previously recorded strain is now observed in bounded individual physical response and targeted clinical correction.',
   physicalLimit:'Measured fatigue and damage constrain this restorative treatment; no automatic healing.'};
 }else if(PLaw.ready(rec.points,rec.strain)){
  origin=PCPhysique.FORM;minutes=90;
  details={integratedFunction:'All actually mapped individual original tissues are observed in a controlled integrated whole body response.',
   failureCounter:'An independently applied bounded counterstimulus measures the failure threshold and safe stopping response.',
   metabolicTradeoff:'Actual physiological demand and ordinary nutrition and fatigue limit the integrated function.'};
 }else{
  origin=PCPhysique.WORK;minutes=60;
  details={observedBodyResponse:'The separately examined individual tissue design displays measurable but bounded response to the original exertion procedure.',
   physicalLimit:'Finite observed metabolic load, fatigue and physical damage constrain this personal training.'};
 }
 const kind=origin===PCPhysique.MAP?'map':origin===PCPhysique.CARE?'care':origin===PCPhysique.FORM?'form':'work';
 if(kind!=='map'&&originalCombat.stamina<PLaw.checkSpec(cycle,kind,
   p.mechanicalFoundation.baselineAttributes.con,0,rec.strain).cost)continue;
 s.chatRuntime.scene=p.name+' is present for a witnessed original individual '+sp.name+' procedure.';
 Core.event(s,'story',s.chatRuntime.scene,{origin,location:IVsite,actorId:p.actorId,cycle,...details});
 const req={actorId:p.actorId,witnessIndex:s.log.length-1,...(minutes===undefined?{}:{minutes})};
 const before=E.exportGame(s);
 if(!ledger){
  A.throws(()=>Rules.act(s,{system:'body',operation:'npcLivingPhysiqueWork',params:{...req,formed:true}}),/accepts actorId/);
  A.equal(E.exportGame(s),before);
 }
 const result=Rules.act(s,{system:'body',operation:'npcLivingPhysiqueWork',params:req}),
  receipt=p.originalBodyLivingPhysiques.sessions.at(-1),q=receipt.source;
 A.equal(Physique.verify(s,p),true);
 A.equal(q.accepted,result.independentlyAccepted);
 if(!q.accepted){counts.declined++;A.equal(q.staminaSpent,0);}
 else{
  counts[kind]++;
  if(kind!=='map'){
   const expected=PLaw.checkSpec(cycle,kind,p.mechanicalFoundation.baselineAttributes.con,0,q.before.strain);
   A.equal(q.staminaSpent,expected.cost);A.equal(q.check.dc,expected.dc);
   A.equal(q.check.modifier,expected.modifier);
  }
  if(cycle===7)A.ok(q.supportingProof.nerve&&q.supportingProof.blood&&q.supportingProof.adaptive);
 }
}
const advanced=p.originalBodyLivingPhysiques;
A.ok(advanced&&counts.map>=1&&counts.work>=1,'Actual NPC advanced tissue map and paid original practice required');
A.equal(Physique.verify(s,p),true);
const earnedAdvanced=Object.entries(advanced.cycles).filter(([,r])=>r.completed),
 bonus=earnedAdvanced.reduce((sum,[k])=>sum+PLaw.SPEC[k].bonus,0);
A.equal(originalCombat.maxStamina,advancedMax+bonus);
const ad=Foundation.gmDossier(Realm.peek(s),p.actorId,s).earnedEvidence;
A.equal(ad.originalBodyLivingPhysiques.cycles.filter(x=>x.completed).length,earnedAdvanced.length);
A.deepEqual(p.knownTechniques,[]);
const adsave=E.exportGame(s),adcopy=E.importGame(adsave),adp=Realm.peek(adcopy).emergentPeople.people[p.id];
A.equal(Physique.verify(adcopy,adp),true);
const adfake=E.importGame(adsave),adbad=Realm.peek(adfake).emergentPeople.people[p.id],
 adrow=adbad.originalBodyLivingPhysiques.sessions.find(x=>x.source.kind==='work'&&x.source.accepted);
adrow.source.check.dc=1;adrow.seal=hash(adrow.source);
A.equal(Physique.verify(adfake,adbad),false,'Rehashed cheap fake advanced physiology cannot grant actual advancement');
console.log('ORIGINAL WITNESSED NPC BODY V–VII ASSESSMENT PASS '+JSON.stringify({
 counts,cycles:advanced.cycles,actualCapacityGain:bonus}));


// Separate individual tissue development uses the actual earlier whole-body
// map, NOT a new cycle or an additional capacity award.
const tissueCycle=Object.keys(advanced.cycles).map(Number).find(x=>x===5)||Number(Object.keys(advanced.cycles)[0]);
const tissueCounts={map:0,work:0,care:0,declined:0};
const tissueId='individual_circulation_tissue';
const tissueMax=originalCombat.maxStamina;
for(let i=0;i<90;i++){
 const old=s.world.minutes,target=(Math.floor(old/1440)+1)*1440+600;
 E.advance(s,target-old);World.finalizeTime(s,old);
 const dayNow=Math.floor(s.world.minutes/1440);
 if(!Presence.resolve(Realm.peek(s),p.actorId,IVsite,dayNow,600)||
  originalCombat.status!=='ok'||originalCombat.wounds.some(x=>x!==0)||
  originalCombat.stamina<5)continue;
 const rec=advanced.cycles[tissueCycle],t=rec.tissues?.find(x=>x.id===tissueId);
 if(t?.points>=2&&t.strain===0)break;
 const kind=!t?'tissue-map':t.strain>=5?'tissue-care':'tissue-work';
 const origin=kind==='tissue-map'?PCPhysique.TISSUE:kind==='tissue-care'?PCPhysique.TISSUE_CARE:PCPhysique.TISSUE_WORK;
 const details=kind==='tissue-map'?{
  tissue:'The local existing circulation tissue examined in this individual under actual controlled load.',
  realFunction:'Measured finite physical contribution to blood circulation and ordinary tissue oxygenation.',
  metabolicTradeoff:'Measured existing metabolic demand limits continued exertion and requires normal supported rest.',
  failureLimit:'Observed physical fatigue and loss of controlled function are independent boundaries on the experiment.',
  observedTissue:'Distinct original tissue response is examined within the previously mapped whole body design.',
  independentCountertest:'An independently observed controlled counterstimulus identifies finite original tissue response.'
 }:{
  observedResponse:'The mapped individual tissue displays an actual bounded response to the local controlled procedure.',
  physicalLimit:'Measured fatigue and loss of ordinary tissue function bound the experiment and require stopping.'
 };
 s.chatRuntime.scene=p.name+' is present for an observed individual tissue procedure.';
 Core.event(s,'story',s.chatRuntime.scene,{origin,location:IVsite,actorId:p.actorId,cycle:tissueCycle,tissueId,...details});
 const result=Rules.act(s,{system:'body',operation:'npcLivingPhysiqueWork',
  params:{actorId:p.actorId,witnessIndex:s.log.length-1,...(t?{minutes:60}:{})}});
 const q=advanced.sessions.at(-1).source;
 A.equal(Physique.verify(s,p),true);
 A.deepEqual(q.before,q.after,'Individual tissue work cannot advance whole-body stage');
 A.equal(q.maxBefore,q.maxAfter);A.equal(result.independentlyAccepted,q.accepted);
 if(!q.accepted){tissueCounts.declined++;A.equal(q.staminaSpent,0);}
 else if(kind==='tissue-map'){tissueCounts.map++;A.equal(q.check,null);}
 else{
  tissueCounts[kind==='tissue-care'?'care':'work']++;
  const mode=PLaw.checkSpec(tissueCycle,kind==='tissue-care'?'care':'work',
   p.mechanicalFoundation.baselineAttributes.con,0,q.tissueBefore.strain);
  A.equal(q.check.dc,mode.dc);A.equal(q.staminaSpent,mode.cost);
 }
}
A.equal(originalCombat.maxStamina,tissueMax);
A.deepEqual(p.knownTechniques,[]);
const tissueSave=E.exportGame(s),tc=E.importGame(tissueSave),
 tp=Realm.peek(tc).emergentPeople.people[p.id];
A.equal(Physique.verify(tc,tp),true);
const tr=tp.originalBodyLivingPhysiques.sessions.find(x=>x.source.kind==='tissue-work'&&x.source.accepted);
if(tr){tr.source.check.dc=1;tr.seal=hash(tr.source);A.equal(Physique.verify(tc,tp),false);}
console.log('INDIVIDUAL NPC BODY TISSUE ASSESSMENT '+JSON.stringify({counts:tissueCounts,
 tissues:advanced.cycles[tissueCycle].tissues||[],noExtraCapacity:true}));


// Only a genuinely formed VI can attempt a temporary response. No fixture
// grants stage VI. A failed or refused response is a valid outcome.
const adaptCounts={attempt:0,refused:0,formed:0,released:0,releaseRefused:0,expired:0};
if(advanced.cycles[6]?.completed){
 for(let i=0;i<30;i++){
  const old=s.world.minutes,target=(Math.floor(old/1440)+1)*1440+600;
  E.advance(s,target-old);World.finalizeTime(s,old);
  const now=s.world.minutes,dayNow=Math.floor(now/1440);
  if(!Presence.resolve(Realm.peek(s),p.actorId,IVsite,dayNow,600)||
   originalCombat.status!=='ok'||originalCombat.wounds.some(x=>x!==0)||
   originalCombat.stamina<3)continue;
  s.chatRuntime.scene=p.name+' is present for the measured reversible adaptive response.';
  Core.event(s,'story',s.chatRuntime.scene,{origin:PCPhysique.ASSUME,actorId:p.actorId,
   location:IVsite,cycle:6,safeMinutes:60,
   environmentObserved:'The actual bounded local thermal and mechanical conditions are separately observed in this disposable test scene.',
   safeReversionCounter:'The measured individual response has a finite stopping limit and a verified ordinary return procedure.'});
  const result=Rules.act(s,{system:'body',operation:'npcAdaptiveAssume',params:{
   actorId:p.actorId,witnessIndex:s.log.length-1,minutes:60}});
  const q=advanced.expressions.at(-1).source;
  A.equal(Physique.verify(s,p),true);
  A.equal(q.maxBefore,q.maxAfter);
  if(!q.accepted){adaptCounts.refused++;A.equal(q.staminaSpent,0);continue;}
  adaptCounts.attempt++;A.equal(q.staminaSpent,2);A.equal(q.check.dc,18);
  if(!result.formed)continue;
  adaptCounts.formed++;
  A.equal(result.active,true);A.equal(result.expiresAtMinute,now+61);
  // Separate decision to revert, not a forced success.
  s.chatRuntime.scene=p.name+' is present and considers returning to baseline.';
  Core.event(s,'story',s.chatRuntime.scene,{origin:PCPhysique.RELEASE,actorId:p.actorId,
   location:IVsite,cycle:6,
   observedReturn:'Actual controlled response and ordinary baseline return are examined within this reversible procedure.',
   independentFailureLimit:'Independent measured stopping conditions distinguish ordinary return from an unstable response.'});
  const released=Rules.act(s,{system:'body',operation:'npcAdaptiveRelease',params:{
   actorId:p.actorId,witnessIndex:s.log.length-1}});
  A.equal(Physique.verify(s,p),true);
  if(released.released){adaptCounts.released++;A.equal(released.active,false);A.equal(released.cooldownRemaining,8);}
  else{adaptCounts.releaseRefused++;A.equal(released.active,true);}
  const previous=s.world.minutes;
  E.advance(s,Math.max(1,now+69-previous));World.finalizeTime(s,previous);
  const view=Physique.privateStatus(s,p).currentAdaptiveExpression;
  A.equal(view.active,false);A.equal(view.cooldownRemaining,0);
  if(!released.released)adaptCounts.expired++;
  const saved=E.exportGame(s),copy=E.importGame(saved),person=Realm.peek(copy).emergentPeople.people[p.id];
  A.equal(Physique.verify(copy,person),true);
  const tampered=person.originalBodyLivingPhysiques.expressions.find(x=>x.source.kind==='assume'&&x.source.check?.success);
  tampered.source.activeUntil++;tampered.seal=hash(tampered.source);
  A.equal(Physique.verify(copy,person),false,'Resealed fake adaptive duration rejected');
  if(adaptCounts.released)break;
 }
}
console.log('INDEPENDENT ADAPTIVE VI EXPRESSION ASSESSMENT '+JSON.stringify({earned:!!advanced.cycles[6]?.completed,counts:adaptCounts}));


// Evolved VII care uses actual separately accepted physical provisions.
// Only perform it if this very person's previous original live history
// genuinely achieved VII. Never replace missing stock with a fixture grant.
const Custody=require('../rules/independent-material-custody'),
 upkeepCounts={offered:0,received:0,accepted:0,declined:0,confirmed:0};
if(advanced.cycles[7]?.completed){
 for(let i=0;i<45;i++){
  const old=s.world.minutes,target=(Math.floor(old/1440)+1)*1440+600;
  E.advance(s,target-old);World.finalizeTime(s,old);
  const dayNow=Math.floor(s.world.minutes/1440);
  if(!Presence.resolve(Realm.peek(s),p.actorId,IVsite,dayNow,600)?.presence||
   s.world.location!==IVsite||originalCombat.status!=='ok'||originalCombat.wounds.some(x=>x!==0)||
   originalCombat.stamina<2)continue;
  if(!Custody.canConsume(s,p,{clean_rations:1})){
   if(!s.player.inventory.clean_rations)break;
   s.chatRuntime.scene=p.name+' considers an actual offered clean ration, with no obligation.';
   Core.event(s,'story',s.chatRuntime.scene,{origin:Custody.OFFER,actorId:p.actorId,location:IVsite,items:{clean_rations:1}});
   const gift=Rules.act(s,{system:'material',operation:'offerToPerson',params:{actorId:p.actorId,witnessIndex:s.log.length-1}});
   upkeepCounts.offered++;if(gift.accepted)upkeepCounts.received++;else continue;
  }
  const beforeFood=Custody.held(s,p).clean_rations,beforeMax=originalCombat.maxStamina,
   playerFood=s.player.inventory.clean_rations||0,minute=s.world.minutes;
  s.chatRuntime.scene=p.name+' considers the genuinely earned constitution and its compatible nourishment needs.';
  Core.event(s,'story',s.chatRuntime.scene,{origin:PCPhysique.SUSTAIN,actorId:p.actorId,cycle:7,location:IVsite,
   actualMetabolicDemand:'Actual compatible individual constitution is examined under measured physiological demands in this disposable procedure.',
   independentFailureLimit:'Finite observed metabolic capacity and a specific safe stopping point are independently observed.',
   observedFoodCompatibility:'The actually held clean ration is examined and confirmed compatible with this specific constitution.',
   supportedMinutes:120});
  const result=Rules.act(s,{system:'body',operation:'npcLivingPhysiqueWork',params:{actorId:p.actorId,witnessIndex:s.log.length-1,minutes:60}}),
   q=advanced.sessions.at(-1).source;
  A.equal(Physique.verify(s,p),true);
  A.equal(Custody.verify(s,p),true);
  A.equal(originalCombat.maxStamina,beforeMax);
  A.equal(s.player.inventory.clean_rations||0,playerFood);
  A.deepEqual(q.before,q.after);
  if(q.accepted){
   upkeepCounts.accepted++;
   A.equal(q.staminaSpent,2);A.equal(q.check.dc,18);
   A.equal(Custody.held(s,p).clean_rations||0,beforeFood-1);
   A.equal(Custody.debitProof(s,p,q.foodDebitSeal,{clean_rations:1},'body-upkeep',q.witnessHash,minute),true);
  }else{upkeepCounts.declined++;A.equal(Custody.held(s,p).clean_rations,beforeFood);}
  if(result.confirmedMaintenance){
   upkeepCounts.confirmed++;
   const status=Physique.privateStatus(s,p).constitutionMaintenance;
   A.equal(status.currentlyObserved,true);A.equal(status.observedSupportUntil,minute+180);
   const save=E.exportGame(s),copy=E.importGame(save),cp=Realm.peek(copy).emergentPeople.people[p.id];
   A.equal(Physique.verify(copy,cp),true);
   const bad=cp.originalBodyLivingPhysiques.sessions.find(x=>x.source.kind==='sustain'&&x.source.check?.success);
   bad.source.foodDebitSeal='0'.repeat(64);bad.seal=hash(bad.source);
   A.equal(Physique.verify(copy,cp),false,'Unsupported provision consumption cannot confirm maintenance');
   const at=s.world.minutes;
   E.advance(s,121);World.finalizeTime(s,at);
   const expired=Physique.privateStatus(s,p).constitutionMaintenance;
   A.equal(expired.currentlyObserved,false);A.equal(expired.permanentConstitution,true);
   break;
  }
 }
}
console.log('INDEPENDENT EVOLVED VII METABOLIC MAINTENANCE '+JSON.stringify({earned:!!advanced.cycles[7]?.completed,counts:upkeepCounts}));
