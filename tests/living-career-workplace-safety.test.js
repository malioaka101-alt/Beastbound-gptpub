'use strict';
// Disposable source-evidenced occupational hazards, never automatic injury
// for merely choosing a profession, refusing a job or living in a region.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Realm=require('../world/simulation'),Atlas=require('../world/atlas'),
 People=require('../world/emergent-people'),Career=require('../world/person-careers'),
 Rules=require('../rules');
const s=E.newGame({seed:978171,name:'Independent Safety Test',path:'undecided'}),
 w=Realm.ensure(s),day=w.lastTickDay,t=People.ensure(w),
 region=Atlas.R.morrowfen_basin;
A.ok(w.localProvisioner.stock>0,'The underlying actual provisioner must really exist');
const d={kind:'livelihood-work',regionId:region.id,polity:region.polity,
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
  existingStock:w.localProvisioner.stock}};
const p=People._debug.make(w,t,day,d);
p.shift=People.shift(p,day);
A.ok(People.presence(w,p.actorId,'crossing',day));
A.equal(People.verify(w,p),true);
const safetyWitness='The witnessed completed local work included an actual reedbank flood hazard beside the established Morrowfen Crossing supply route. The worker personally encountered hazardous footing during this one original independently decided work attempt.';
const danger=region.dangers[0];
A.equal(danger,'flood');
const initial=E.exportGame(s);
A.throws(()=>Career.observeWorkplaceSafety(w,p,{id:'invalid-risk-claim',
 workHash:'fabricated',hazard:danger,witness:safetyWitness,day,
 injury:'permanent'}) ,/cannot be ordered/);
A.equal(E.exportGame(s),initial);
let original=null;
for(let i=0;i<260;i++){
 const outcome=Career.work(w,p,day);
 const last=p.career.workReceipts.at(-1);
 if(!outcome.success&&last.source.margin<=-6&&p.fatigue>=75){
  original=last;break;
 }
}
A.ok(original,'An actual individually rolled failed, tiring, hazardous work attempt must precede strain');
const before=p.fatigue,playerRng=s.rngState,workerRng=p.rngState,
 careerProgress=p.career.skillPoints,
 originalHash=original.sourceHash;
const started=E.exportGame(s);
A.throws(()=>Career.observeWorkplaceSafety(w,p,{
 id:'false-hazard-record',workHash:originalHash,
 hazard:'invented dragons',witness:safetyWitness,day}),/real present worker|regional hazard/);
A.equal(E.exportGame(s),started);
const event=Career.observeWorkplaceSafety(w,p,{
 id:'recorded-reedbank-safety-incident',workHash:originalHash,
 hazard:danger,witness:safetyWitness,day});
A.equal(event.incidentType,'work-related-strain');
A.equal(event.changedFatigue,8);
A.equal(event.noExtraWorkRoll,true);
A.equal(event.noArbitraryWound,true);
A.equal(p.fatigue,Math.min(100,before+8));
A.equal(p.status,'recovering');
A.equal(p.shift,null,'Worker requiring recovery has no fabricated current shift');
A.equal(s.rngState,playerRng);
A.equal(p.rngState,workerRng,'The previous real work check was not rerolled');
A.equal(p.career.skillPoints,careerProgress);
A.equal(Career.workplaceSafetyStatus(p).length,1);
A.equal(Career.verify(p),true);
A.equal(People.verify(w,p),true);
A.throws(()=>Career.work(w,p,day),/recovering worker/);
const after=E.exportGame(s);
A.throws(()=>Career.observeWorkplaceSafety(w,p,{
 id:'another-risk-citation',workHash:originalHash,
 hazard:danger,witness:safetyWitness,day}),/real present worker|current fatigue/);
A.equal(E.exportGame(s),after);
const imported=E.importGame(after),cp=imported.table.realm.emergentPeople.people[p.id];
A.equal(Career.verify(cp),true);
A.equal(People.verify(imported.table.realm,cp),true);
A.deepEqual(Career.workplaceSafetyStatus(cp),Career.workplaceSafetyStatus(p));
for(let i=0;i<4&&p.status==='recovering';i++){
 Rules.world.advance(s,6);
 A.equal(People.verify(w,p),true);
 A.equal(Career.verify(p),true);
}
A.equal(p.status,'active','Real sixday fatigue recovery eventually restores independent local work');
A.equal(Career.workplaceSafetyStatus(p)[0].recordedFatigueImpact,8);
const clone=E.importGame(E.exportGame(s));
A.equal(Career.verify(clone.table.realm.emergentPeople.people[p.id]),true);
const record=p.career.safetyIncidents[0];
record.source.work.outcome.success=true;
A.equal(Career.verify(p),false,'Cannot rewrite original hazard-causing work as a success');
console.log('Original work safety: sourced local risk, actual prior roll, no fabricated extra roll or injury, reversible fatigue, independent sixday recovery, tamper-rejecting original career provenance');
