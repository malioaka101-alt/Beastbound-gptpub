'use strict';
// Foundation #17 first bridge: dynamic GM-authored livelihoods use the one
// existing independently acting person's work, rolls, ecology and saves.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Time=require('../rules/world'),Realm=require('../world/simulation'),
 Atlas=require('../world/atlas'),Career=require('../world/person-careers');
const fresh=seed=>{
 const s=E.newGame({seed,name:'Living Work Foundation',path:'undecided'});
 const w=Realm.ensure(s);
 Time.advance(s,240);
 const person=Object.values(w.emergentPeople.people).find(p=>
  p.status==='active'&&p.fatigue<70&&
  Atlas.institutions.some(i=>i.polity===p.polity&&
   w.institutions[i.id]?.status==='active'));
 A.ok(person,'An actual independent career-bearing person must exist');
 const institution=Atlas.institutions.find(i=>i.polity===person.polity&&
  w.institutions[i.id]?.status==='active');
 return {s,w,p:person,institution,day:w.lastTickDay};
};
const ecological={id:'wetland-culvert-duty',role:'Culvert and wetland maintenance',
 method:'culvert-care',goal:'Repair observed water-channel damage without harming reed habitat',
 domain:'ecology',effect:'habitat-repair',
 witness:'An established regional inspection witnessed damaged drainage and an individually suitable repair task.'};
const practical={id:'living-stock-ledger',role:'Local provision and storage auditor',
 method:'storage-audits',goal:'Check real provision records against a local storehouse before future supply decisions',
 domain:'trade',witness:'A sourced local work scene established a concrete need to inspect existing stock and prevent losses.'};
{
 const {s,w,p,institution,day}=fresh(948171),original=s.rngState,
  beforeSkill=p.career.skillPoints;
 A.ok(Career.verify(p));
 A.deepEqual(Career.authoredDutyStatus(p),[]);
 const first=Career.authorDuty(w,p,{...ecological,institutionId:institution.id,day});
 const second=Career.authorDuty(w,p,{...practical,day});
 A.equal(first.noAutomaticSkill,true);
 A.equal(second.noLicenceOrGuaranteedWage,true);
 A.equal(p.career.skillPoints,beforeSkill,
  'Authored jobs do not confer skill from a title or a charter');
 A.equal(p.career.recognizedLicence,null);
 A.equal(s.rngState,original,'GM descriptions do not roll the player dice');
 A.equal(Career.authoredDutyStatus(p).length,2);
 A.equal(Career.verify(p),true);
 const snap=E.exportGame(s),loaded=E.importGame(snap);
 const restored=loaded.table.realm.emergentPeople.people[p.id];
 A.deepEqual(Career.authoredDutyStatus(restored),Career.authoredDutyStatus(p));
 A.equal(E.exportGame(loaded),snap);
 A.throws(()=>Career.authorDuty(w,p,{...ecological,day}),
  /source|existing|work|employer/);
 A.throws(()=>Career.authorDuty(w,p,{...practical,
  id:'made-up-career',institutionId:'fictional_school',day}),
  /source|existing|work|employer/);
 A.equal(Career.verify(p),true);
}
{
 const {s,w,p,institution,day}=fresh(948172);
 Career.authorDuty(w,p,{...ecological,institutionId:institution.id,day});
 Career.authorDuty(w,p,{...practical,day});
 let observedEcology=false,observedTrade=false;
 const starting=p.career.workCount;
 for(let i=0;i<75;i++){
  const outcome=Career.work(w,p,day);
  if(outcome.taskMethod===ecological.method)observedEcology=true;
  if(outcome.taskMethod===practical.method)observedTrade=true;
  if(observedEcology&&observedTrade)break;
 }
 A.ok(observedEcology&&observedTrade,
  'Independent actual work can adopt different custom duties without code-specific job lists');
 A.ok(p.career.workCount>starting);
 const duties=Career.authoredDutyStatus(p);
 A.ok(duties.every(d=>d.verifiedCompletedWork>=1));
 A.equal(Career.verify(p),true);
 A.equal(p.career.recognizedLicence,null,
  'Repeated genuine duties still do not forge a formal credential');
 A.deepEqual(p.career.supernaturalSystemRanks,{});
 const source=p.career.authoredDuties[0].sourceHash;
 const copy=E.importGame(E.exportGame(s)),
  cloned=copy.table.realm.emergentPeople.people[p.id];
 A.equal(cloned.career.authoredDuties[0].sourceHash,source);
 A.deepEqual(Career.authoredDutyStatus(cloned),duties);
 const sourceBefore=E.exportGame(s);
 p.career.authoredDuties[0].goal='An invented shortcut';
 A.equal(Career.verify(p),false,
  'Cannot alter role/effect without changing the original witnessed source');
 A.notEqual(E.exportGame(s),sourceBefore);
}
{
 const {s,w,p,day}=fresh(948173);
 Career.authorDuty(w,p,{...ecological,day});
 const before=Career.authoredDutyStatus(p);
 A.equal(before[0].status,'available');
 const r=Career.retireDuty(w,p,{id:ecological.id,day,
  reason:'The original repair assignment was completed and the local work was formally withdrawn.'});
 A.equal(r.retired,true);
 A.equal(Career.authoredDutyStatus(p)[0].status,'retired');
 for(let i=0;i<25;i++)
  A.notEqual(Career.work(w,p,day).taskMethod,ecological.method);
 A.equal(Career.verify(p),true);
 const saved=E.exportGame(s),restored=E.importGame(saved);
 A.equal(Career.authoredDutyStatus(
  restored.table.realm.emergentPeople.people[p.id])[0].status,'retired');
 A.throws(()=>Career.retireDuty(w,p,{id:ecological.id,day,
  reason:'I want to erase the earlier history and replace the decision'}),
  /existing job/);
}
console.log('GM-authored open-ended original careers: observed assignments, autonomous work, original source rolls, honest materials and income, durable provenance, voluntary local retirement and save reload');
