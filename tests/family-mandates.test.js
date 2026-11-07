'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),Crypto=require('node:crypto');
const E=require('../engine.js'),World=require('../rules/world'),
 Realm=require('../world/simulation'),F=require('../world/family-members'),
 Houses=require('../world/social-houses'),Turn=require('../scripts/chat-turn.js');
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const newGame=seed=>E.newGame({seed,name:'Independent Household Stewardship Test'});
const chose=(a,b)=>{
 for(let seed=1;seed<200000;seed++){
  const tmp={rngState:seed},x=F._debug.random(tmp),y=F._debug.random(tmp);
  if(a(x)&&b(y))return seed;
 }
 throw Error('No genuine independent family RNG draw satisfies the specified test choices');
};
const guarantee=()=>chose(x=>x>.96,y=>true);
function nominated(seed=907001){
 const s=newGame(seed),w=Realm.ensure(s),t=F.ensure(w),
  f=t.houses.fenwake,h=Houses.byId.fenwake;
 f.people.relative.successes=2;f.people.relative.merit=6;
 f.people.elder.merit=0;f.projects=[];w.ticks.months=10;
 t.rngState=chose(x=>x<.68,y=>y<.82);
 F._debug.coordinator(w,t,f,310,()=>{});
 A.equal(f.dutyCoordinator,'relative');
 A.equal(f.activeMandate?.active,true);
 A.equal(f.mandates.length,1);
 A.equal(f.activeMandate.initialReceiptHash,digest(f.coordinatorTransfer.witness));
 A.equal(f.coordinatorTransfer.coordinator,h.relative);
 return {s,w,t,f,h};
}
function completed(x,success,day=360){
 const p=x.f.projects[0];A.ok(p);
 A.equal(F._debug.progress(x.w,x.t,x.f,p,day,()=>{}),'working');
 x.t.rngState=success?guarantee():chose(a=>a<.04,b=>true);
 const notices=[];
 A.equal(F._debug.progress(x.w,x.t,x.f,p,day+30,e=>notices.push(e)),'finished');
 x.f.projects=[];
 return notices;
}
function newSolo(x,day=340){
 x.w.ticks.months+=3;x.f.lastCouncilMonth=0;
 x.w.houses.fenwake.publicPressure=88;
 x.t.rngState=chose(a=>a>=.76,b=>b>=.54&&b<.82);
 A.equal(F._debug.propose(x.w,x.t,x.f,day,()=>{}),true);
 A.equal(x.f.projects.length,1);
 A.equal(x.f.projects[0].kind,'relative_duty');
 A.deepEqual(x.f.projects[0].workers,['relative']);
 return x.f.projects[0];
}
{
 const {s,f,h}=nominated();
 A.equal(h.elder,'Ilyen Fenwake');
 A.equal(f.activeMandate.initialReceiptId,f.coordinatorTransfer.id);
 A.equal(f.activeMandate.completedProjects,0);
 A.equal(f.activeMandate.verifiedProjects,0);
 A.equal(s.player.family,null);
}
{
 const x=nominated(907002),{s,w,t,f,h}=x;
 const privateReserve=f.people.relative.personalFund;
 newSolo(x);
 A.equal(f.projects[0].fund,'dutyFund',
  'The real consenting coordinator may direct the specifically delegated public-duty reserve');
 const oldFund=f.dutyFund,oldRng=s.rngState;
 completed(x,true);
 A.equal(f.dutyFund,oldFund-6);
 A.equal(f.people.relative.personalFund,privateReserve);
 A.equal(f.activeMandate.completedProjects,1);
 A.equal(f.activeMandate.verifiedProjects,1);
 A.equal(f.activeMandate.failedProjects,0);
 A.equal(f.latestVerifiedDuty.witness.houseId,'fenwake');
 A.equal(f.latestVerifiedDuty.witness.details.passed,true);
 A.equal(f.latestVerifiedDuty.hash,digest(f.latestVerifiedDuty.witness));
 A.equal(s.rngState,oldRng);
 // A verified member deed, not time or wealth, now authorizes a truthful
 // public-duty progress report. Preserve the previous report boundary.
 const standing=w.houses.fenwake;
 standing.projectProgress=3;standing.lastChangeDay=300;
 Houses.month(w,390,()=>{});
 A.equal(standing.publicMilestones.at(-1).outcome,
  'reports documented practical progress toward its public duty');
 A.equal(h.elder,'Ilyen Fenwake');
 A.equal(w.governance.reedmarch.holder,'Iria Highwater');
 // Repeating the same work report in another cycle is NOT a new result.
 standing.projectProgress=3;standing.lastChangeDay=390;
 Houses.month(w,510,()=>{});
 A.notEqual(standing.publicMilestones.at(-1).outcome,
  'reports documented practical progress toward its public duty');
}
{
 const x=nominated(907003),{f,w,t}=x;
 const secret=f.people.relative.personalFund;
 newSolo(x);
 completed(x,false);
 A.equal(f.activeMandate.completedProjects,1);
 A.equal(f.activeMandate.failedProjects,1);
 A.equal(f.activeMandate.verifiedProjects,0);
 A.equal(f.latestVerifiedDuty,undefined);
 A.equal(f.people.relative.personalFund,secret);
 const standing=w.houses.fenwake;
 standing.projectProgress=3;standing.lastChangeDay=200;
 Houses.month(w,450,()=>{});
 A.notEqual(standing.publicMilestones.at(-1).outcome,
  'reports documented practical progress toward its public duty');
}
{
 const x=nominated(907004),{w,t,f}=x;
 f.activeMandate.completedProjects=2;f.activeMandate.verifiedProjects=2;
 f.activeMandate.failedProjects=0;
 w.houses.fenwake.publicPressure=44;
 w.ticks.months=15;
 t.rngState=chose(a=>a<.80,b=>b<.85);
 const old=f.people.relative.merit;
 A.equal(F._debug.reviewMandate(w,t,f,451,()=>{}),true);
 A.equal(f.dutyCoordinator,'relative');
 A.equal(f.activeMandate.active,true);
 A.equal(f.activeMandate.reviews.length,1);
 A.equal(f.activeMandate.reviews[0].renewed,true);
 A.equal(t.records.at(-1).kind,'working-mandate-accountability');
 A.equal(f.people.relative.merit,old);
 const n=t.records.length;
 w.ticks.months=16;
 A.equal(F._debug.reviewMandate(w,t,f,481,()=>{}),false);
 A.equal(t.records.length,n,'No endless approval farming without new genuine results');
}
{
 const x=nominated(907005),{w,t,f,h,s}=x;
 f.activeMandate.completedProjects=2;f.activeMandate.failedProjects=2;
 f.activeMandate.verifiedProjects=0;
 w.houses.fenwake.publicPressure=91;f.dutyFund=8;
 w.ticks.months=16;
 t.rngState=chose(a=>a>.8,b=>b<.6);
 const releases=[];A.equal(F._debug.reviewMandate(w,t,f,480,e=>releases.push(e)),true);
 A.equal(f.dutyCoordinator,'elder');
 A.equal(f.activeMandate,null);
 A.equal(f.mandates.length,1);
 const closed=f.mandates[0];
 A.equal(closed.active,false);
 A.equal(closed.conclusion.witness.details.noLegalSuccession,true);
 A.equal(closed.conclusion.witness.details.allPastMeritRetained,true);
 A.equal(closed.conclusion.hash,digest(closed.conclusion.witness));
 A.equal(f.coordinatorTransfer.proofHash,digest(f.coordinatorTransfer.witness));
 A.equal(releases.length,1);
 A.equal(releases[0].releaseDay,488);
 A.equal(h.elder,'Ilyen Fenwake');
 A.equal(w.governance.reedmarch.holder,'Iria Highwater');
 A.equal(s.player.family,null);
 A.equal(f.people.relative.successes,2);
 w.ticks.months=25;const count=t.records.length;
 F._debug.coordinator(w,t,f,750,()=>{});
 A.equal(t.records.length,count,
  'Previous merit alone cannot reinstate someone whose mandate has ended');
 // A new genuinely earned achievement unlocks the possibility of consent,
 // without giving the former coordinator a legal family succession right.
 f.people.relative.successes=3;f.people.relative.merit+=2;
 t.rngState=chose(a=>a<.68,b=>b<.82);
 F._debug.coordinator(w,t,f,780,()=>{});
 A.equal(f.dutyCoordinator,'relative');
 A.equal(f.mandates.length,2);
 A.equal(f.mandates[0].conclusion.hash,digest(closed.conclusion.witness));
}
{
 const s=newGame(907006),w=Realm.ensure(s),f=F.ensure(w).houses.fenwake;
 const standing=w.houses.fenwake;
 f.latestVerifiedDuty={day:80,id:'forged-work',hash:'forged',witness:{
  day:80,id:'forged-work',houseId:'fenwake',
  kind:'verified-family-duty',details:{passed:true}}};
 standing.projectProgress=3;standing.lastChangeDay=40;
 Houses.month(w,120,()=>{});
 A.notEqual(standing.publicMilestones.at(-1).outcome,
  'reports documented practical progress toward its public duty');
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-household-mandates-'));
 try{
  const file=Path.join(dir,'save.json'),s=newGame(907007);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const original=FS.readFileSync(file,'utf8');
  const view={id:'family_mandate_read_0001',mode:'rule',system:'world',
   operation:'familyMembersStatus',params:{}};
  A.equal(Turn.execute(file,view).applied,false);
  A.equal(FS.readFileSync(file,'utf8'),original);
  A.throws(()=>Turn.execute(file,{id:'family_mandate_cheat_0001',mode:'rule',
   system:'world',operation:'familyMembersStatus',params:{imposeDynasticHeir:true}}),
   /accepts no fabricated ancestry/);
  A.equal(FS.readFileSync(file,'utf8'),original);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Real and revocable household duty mandates: verified budget use, independent accountability, durable work evidence, no inherited throne or fabricated material progress');
