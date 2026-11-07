'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),Crypto=require('node:crypto');
const E=require('../engine.js'),W=require('../rules/world'),
 Realm=require('../world/simulation'),F=require('../world/family-members'),
 H=require('../world/social-houses'),Turn=require('../scripts/chat-turn.js');
const sha=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const game=seed=>E.newGame({seed,name:'Ordinary Family Member World Observer'});
{
 const a=game(881000),b=game(881000);
 W.advance(a,1460);W.advance(b,1460);
 const w=a.table.realm,t=w.familyMembers;
 A.deepEqual(w,b.table.realm,'Years of independent family decisions must replay precisely');
 A.equal(Object.keys(t.houses).length,28);
 A.ok(t.records.length>0);
 A.ok(t.records.some(r=>r.kind==='distinct-household-choices'));
 A.ok(t.records.some(r=>r.kind==='verified-family-duty'));
 A.ok(t.records.some(r=>r.kind==='failed-family-duty'));
 A.ok(t.counter>=t.records.length);
 A.ok(Object.values(t.houses).some(f=>f.disagreements>0));
 A.ok(Object.values(t.houses).some(f=>f.jointWork>0));
 for(const h of H.houses){
  const f=t.houses[h.id];
  A.equal(f.elderName,h.elder);
  A.equal(f.relativeName,h.relative);
  A.equal(f.acknowledgedRelationship,h.relation);
  A.ok(f.dutyFund>=0&&f.dutyFund<=80);
  A.ok(f.people.relative.personalFund>=0&&f.people.relative.personalFund<=18);
  A.ok(f.trustFromWork>=0&&f.trustFromWork<=8);
  A.ok(f.tensionFromChoices>=0&&f.tensionFromChoices<=8);
  A.ok(f.people.elder.merit>=0&&f.people.relative.merit>=0);
  A.ok(['elder','relative'].includes(f.dutyCoordinator));
  A.ok(f.projects.length<=2);
  if(f.dutyCoordinator==='relative'){
   A.ok(f.people.relative.successes>=2);
   A.ok(f.coordinatorTransfer,'A rightful working coordinator keeps genuine durable evidence');
   A.equal(f.coordinatorTransfer.priorElder,h.elder);
   A.equal(f.coordinatorTransfer.coordinator,h.relative);
   A.equal(f.coordinatorTransfer.source,F.SOURCE);
   A.equal(f.coordinatorTransfer.proofHash,sha(f.coordinatorTransfer.witness));
   A.equal(f.coordinatorTransfer.witness.details.separatelyConsenting,true);
  }
 }
 for(const r of t.records){
  const evidence={id:r.id,day:r.day,month:r.month,houseId:r.houseId,
   houseName:r.houseName,polity:r.polity,elder:r.elder,
   relative:r.relative,relationship:r.relationship,
   kind:r.kind,source:r.source,details:r.details};
  A.equal(r.hash,sha(evidence));
  A.equal(r.source,F.SOURCE);
  A.ok(H.byId[r.houseId]);
  if(r.notice)A.equal(r.releaseDay,r.day+8);
 }
 A.equal(w.governance.asterwyn.holder,'Queen Orelia Asterwyn');
 A.equal(a.player.family,null);
 A.equal(a.player.arcane.circles,0);
 A.equal(a.table.meridianTechniques,undefined);
 const local=Realm.publicFamilyMembers(a);
 A.equal(local.polity,'Reedmarch Compact');
 A.ok(local.knownFamilyEvents.every(v=>v.house&&v.kind&&v.notice));
 const frozen=E.exportGame(a),rng=a.rngState;
 Realm.publicFamilyMembers(a);
 A.equal(E.exportGame(a),frozen);A.equal(a.rngState,rng);
 A.throws(()=>Realm.publicFamilyMembers(a,{secretMarriage:true}),
  /accepts no fabricated ancestry/);
}
{
 // Fake or modified proof cannot become locally published family history.
 const s=game(881001);W.advance(s,700);
 const w=s.table.realm,t=w.familyMembers,now=Math.floor(s.world.minutes/1440);
 const base=Realm.publicFamilyMembers(s).knownFamilyEvents;
 A.ok(base.length>0,'Actual local family work should eventually yield public reports');
 const real=t.records.find(x=>x.notice===base[0].notice&&
  x.polity==='reedmarch'&&x.releaseDay<=now);
 A.ok(real,'The displayed public report must retain actual unaltered source evidence');
 const old=real.hash;real.hash='fabricated social honour';
 A.equal(Realm.publicFamilyMembers(s).knownFamilyEvents.some(x=>x.notice===real.notice),false);
 real.hash=old;
 A.ok(Realm.publicFamilyMembers(s).knownFamilyEvents.some(x=>x.notice===real.notice));
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-living-family-members-'));
 try{
  const file=Path.join(dir,'character.json'),s=game(881002);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const exact=FS.readFileSync(file,'utf8');
  const msg={id:'family_people_readonly_0001',mode:'rule',
   system:'world',operation:'familyMembersStatus',params:{}};
  const read=Turn.execute(file,msg);
  A.equal(read.applied,false);
  A.deepEqual(read.output.rules.knownFamilyEvents,[]);
  A.equal(FS.readFileSync(file,'utf8'),exact);
  A.throws(()=>Turn.execute(file,{id:'family_fake_0001',
   mode:'rule',system:'world',operation:'familyMembersStatus',
   params:{queenDiesAndCrownToMe:true}}),/accepts no fabricated ancestry/);
  A.equal(FS.readFileSync(file,'utf8'),exact);
  A.equal(Turn.execute(file,msg).applied,false);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Real multi-year family disagreements, joint work and earned local status remain deterministic, sourced, published, reversible and never automatic inheritance');
