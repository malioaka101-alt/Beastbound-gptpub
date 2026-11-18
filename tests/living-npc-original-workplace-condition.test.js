'use strict';
// Stage 2B.3: original workplace consequences and recovery are visible to the
// GM only, with no invented wound boxes, diagnoses or combat parameters.
// All actions happen in a disposable world, NEVER Maddoc's saved campaign.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Realm=require('../world/simulation'),Atlas=require('../world/atlas'),
 People=require('../world/emergent-people'),
 Careers=require('../world/person-careers'),Rules=require('../rules'),
 Foundations=require('../world/person-mechanical-foundations');
const s=E.newGame({seed:978171,name:'Disposable Condition Evidence',
 path:'undecided'}),w=Realm.ensure(s),day=w.lastTickDay,
 registry=People.ensure(w),region=Atlas.R.morrowfen_basin;
const person=People._debug.make(w,registry,day,{
 kind:'livelihood-work',regionId:region.id,polity:region.polity,
 language:Atlas.P[region.polity].language,
 good:'grain',localName:region.name,
 evidence:{ecological:{quality:w.ecosystems[region.id].quality,
  pressure:w.ecosystems[region.id].pressure,
  water:w.ecosystems[region.id].water,
  forage:w.ecosystems[region.id].forage},
  civic:{stability:w.countries[region.polity].stability,
   prosperity:w.countries[region.polity].prosperity},
  regionalGoods:region.goods.slice(),regionBiome:region.biome,
  existingOriginalMerchant:w.localProvisioner.seller,
  existingStock:w.localProvisioner.stock}});
person.shift=People.shift(person,day);
A.ok(People.presence(w,person.actorId,'crossing',day));
const id=person.actorId;
const first=Foundations.gmDossier(w,id).earnedEvidence.physicalCondition;
A.equal(first.workplaceIncidentEvidence.length,0);
A.equal(first.originalCareerWorkBlockedByRecoveryStatus,false);
A.equal(first.wounds,null);
A.equal(first.currentAttributes,null);
let receipt=null;
for(let i=0;i<260;i++){
 const result=Careers.work(w,person,day);
 const last=person.career.workReceipts.at(-1);
 if(!result.success&&last.source.margin<=-6&&person.fatigue>=75){
  receipt=last;break;
 }
}
A.ok(receipt,'Actual independent worker checks must create a witnessed risky original result');
const witness='The original local work witnessed real dangerous reedbank flood footing by the existing Morrowfen Crossing route, producing a specific strenuous workplace encounter.';
const playerRng=s.rngState,workerRng=person.rngState,time=s.world.minutes,
 result=Careers.observeWorkplaceSafety(w,person,{
  id:'original-recorded-npc-reedbank-strain',workHash:receipt.sourceHash,
  hazard:region.dangers[0],witness,day});
A.equal(result.incidentType,'work-related-strain');
A.equal(result.recovering,true);
A.equal(result.noArbitraryWound,true);
A.equal(person.status,'recovering');
A.equal(s.rngState,playerRng);
A.equal(person.rngState,workerRng,'Original effort is never rerolled');
A.equal(s.world.minutes,time,'The private incident report does not advance game time');
const original=E.exportGame(s);
const dossier=Foundations.gmDossier(w,id);
const condition=dossier.earnedEvidence.physicalCondition;
A.equal(condition.status,'recovering');
A.equal(condition.originalCareerWorkBlockedByRecoveryStatus,true);
A.equal(condition.wounds,null,'A strain event is not a clinical wound-box award');
A.equal(condition.currentAttributes,null,'No combat stats assigned by condition report');
A.equal(condition.recoveryStatusNotClinicalWoundDiagnosis,true);
A.equal(condition.workplaceIncidentEvidence.length,1);
A.equal(condition.workplaceIncidentEvidence[0].originalWorkHash,receipt.sourceHash);
A.equal(condition.workplaceIncidentEvidence[0].recordedFatigueImpact,8);
A.equal(condition.workplaceIncidentEvidence[0].originalSourceHash,
 person.career.safetyIncidents[0].sourceHash);
A.equal(dossier.earnedEvidence.originalPowerMilestones.meridian.stage,null);
A.deepEqual(dossier.earnedEvidence.verifiedLearnedTechniques,[]);
A.equal(E.exportGame(s),original,'GM condition status must be read-only');
const publicView=Rules.act(s,{system:'social',
 operation:'witnessedPeopleStatus',params:{npcId:id}});
A.equal(JSON.stringify(publicView).includes('workplaceIncidentEvidence'),false);
A.equal(JSON.stringify(publicView).includes('originalSourceHash'),false);
A.equal(JSON.stringify(publicView).includes('currentAttributes'),false);
const replay=E.importGame(original);
A.deepEqual(Foundations.gmDossier(Realm.peek(replay),id).earnedEvidence.physicalCondition,
 condition,'Exact source-backed condition persists across saved replay');
const forged=E.importGame(original),fw=Realm.peek(forged);
fw.emergentPeople.people[person.id].career.safetyIncidents[0]
 .source.work.outcome.success=true;
A.throws(()=>Foundations.gmDossier(fw,id),/Unverified|corrupted/i,
 'Cannot recast a real hazardous failed work event as success');
for(let i=0;i<4&&person.status==='recovering';i++)
 Rules.world.advance(s,6);
A.equal(person.status,'active','Original recovery can actually restore work eligibility');
const recovered=Foundations.gmDossier(w,id).earnedEvidence.physicalCondition;
A.equal(recovered.originalCareerWorkBlockedByRecoveryStatus,false);
A.equal(recovered.workplaceIncidentEvidence.length,1,
 'Healing/recovery does not erase a real historical incident');
A.equal(recovered.wounds,null,'Recovering status does not invent clinical wound metadata');
console.log('Living NPC Stage 2B.3: original risky work, sourced strain, current recovery gate, history, privacy, replay, tamper and no clinical invention PASS');
