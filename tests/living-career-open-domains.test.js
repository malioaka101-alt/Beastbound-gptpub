'use strict';
// GM authorability test: professions and practical domains are not a finite
// catalogue, but an unsourced domain cannot invent cures, beast consent,
// transport, combat, specialised gear, or supernatural results.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Time=require('../rules/world'),Realm=require('../world/simulation'),
 Career=require('../world/person-careers');
const s=E.newGame({seed:981171,name:'Broad Professional World',path:'undecided'}),
 w=Realm.ensure(s);
Time.advance(s,240);
const p=Object.values(w.emergentPeople.people).find(x=>
 x.status==='active'&&x.fatigue<75);
A.ok(p,'An actual independently generated worker must exist');
const day=w.lastTickDay;
const examples=[
 {id:'work-local-veterinary',role:'Field veterinarian for ordinary beast care',
  method:'beast-welfare-survey',domain:'beast-care',
  goal:'Document a genuinely observed noninvasive animal welfare concern without treating a hypothetical patient'},
 {id:'work-local-medicine',role:'Community medical field note practitioner',
  method:'clinic-log-review',domain:'clinical-services',
  goal:'Review real local service observations without claiming a diagnosis or providing unverified medicine'},
 {id:'work-local-mapping',role:'Regional cartographic route analyst',
  method:'landmark-recording',domain:'cartography',
  goal:'Compile factual routes from witnessed terrain without teleporting or discovering a secret location'},
 {id:'work-cultural-practice',role:'Local language and performance facilitator',
  method:'cultural-translation',domain:'cultural-work',
  goal:'Serve a witnessed everyday language need without magically teaching all cultures'}
];
const witness='An observed original living-community source demonstrated a real work task suited to this actual worker, rather than automatically guaranteeing an effect.';
const oldCash=p.cashScales??0,oldRanks=structuredClone(p.career.supernaturalSystemRanks),
 oldTechniques=structuredClone(p.knownTechniques),oldPP=p.career.skillPoints;
for(const e of examples){
 const accepted=Career.authorDuty(w,p,{...e,day,witness});
 A.equal(accepted.noAutomaticSkill,true);
}
A.equal(p.career.skillPoints,oldPP);
A.equal(p.cashScales??0,oldCash);
A.deepEqual(p.career.supernaturalSystemRanks,oldRanks);
A.equal(Career.verify(p),true);
const before=E.exportGame(s);
A.throws(()=>Career.authorDuty(w,p,{...examples[0],id:'fake-instant-cure',
  effect:'resurrect-a-patient',day,witness}),
 /Invalid authored work|unsupported effect/);
A.throws(()=>Career.authorDuty(w,p,{...examples[0],id:'fake-unsafe-domain',
  domain:'!magic:infinite',day,witness}),
 /Invalid authored work|unsupported effect/);
A.equal(E.exportGame(s),before,'Untrusted effect and malformed domain cannot mutate career');
const observed=new Set();
for(let i=0;i<110&&observed.size<examples.length;i++){
 const quality=w.ecosystems[p.regionId].quality,
  pressure=w.ecosystems[p.regionId].pressure,
  stability=w.countries[p.polity].stability;
 const output=Career.work(w,p,day);
 if(examples.some(e=>e.method===output.taskMethod)){
  observed.add(output.taskMethod);
  A.equal(w.ecosystems[p.regionId].quality,quality);
  A.equal(w.ecosystems[p.regionId].pressure,pressure);
  A.equal(w.countries[p.polity].stability,stability);
  A.equal(p.cashScales??0,oldCash);
  A.deepEqual(p.knownTechniques,oldTechniques);
  A.deepEqual(p.career.supernaturalSystemRanks,oldRanks);
  A.equal(output.noTechniqueOrSpellLearned,true);
  A.equal(output.noContractOrGuildRank,true);
 }
}
A.equal(observed.size,examples.length,
 'All source-authored practical domains are actually available inside the original independent task resolver');
A.equal(Career.verify(p),true);
const original=E.exportGame(s),copy=E.importGame(original),
 restored=copy.table.realm.emergentPeople.people[p.id];
A.deepEqual(Career.authoredDutyStatus(restored),Career.authoredDutyStatus(p));
A.equal(E.exportGame(copy),original);
const old=p.career.authoredDuties[0].domain;
p.career.authoredDuties[0].domain='unbounded-magic';
A.equal(Career.verify(p),false,'Source hash must protect the true professional domain');
p.career.authoredDuties[0].domain=old;
A.equal(Career.verify(p),true);
console.log('Open-ended professional domains: four unrelated GM-authored valid careers reuse one real NPC work resolver; no invented medical, beast, travel or power results; persisted and tamper-safe');
