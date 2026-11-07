'use strict';
const A=require('node:assert/strict'),E=require('../engine.js'),
 S=require('../world/simulation'),H=require('../world/social-houses'),
 F=require('../world/family-members');
const game=seed=>E.newGame({seed,name:'Ordinary Kin-Council Observer',path:'undecided'});
function seed2(first,second){
 for(let k=1;k<100000;k++){
  const x={rngState:k},a=F._debug.random(x),b=F._debug.random(x);
  if(first(a)&&second(b))return k;
 }
 throw Error('No deterministic valid family choice source found');
}
function roll20(){
 for(let k=1;k<100000;k++){
  const x={rngState:k};if(Math.floor(F._debug.random(x)*20)+1===20)return k;
 }
 throw Error('No bounded independent critical check seed');
}
{
 const s=game(88001),before=E.exportGame(s),w=S.peek(s),
  t=F.seed(w);
 A.equal(Object.keys(t.houses).length,28);
 A.equal(t.version,1);
 for(const h of H.houses){
  const f=t.houses[h.id];
  A.equal(f.polity,h.polity);
  A.equal(f.people.elder.name,h.elder);
  A.equal(f.people.relative.name,h.relative);
  A.equal(f.acknowledgedRelationship,h.relation);
  A.equal(f.dutyCoordinator,'elder');
  A.equal(f.people.elder.merit,0);
  A.equal(f.people.relative.merit,0);
  A.ok(f.dutyFund>=10&&f.dutyFund<=30);
 }
 A.equal(t.houses.manytracks.acknowledgedRelationship,'chosen kin');
 A.equal(E.exportGame(s),before);
 A.deepEqual(S.publicFamilyMembers(s).knownFamilyEvents,[]);
 A.throws(()=>S.publicFamilyMembers(s,{makeHeir:'crown successor'}),
  /accepts no fabricated ancestry/);
 A.equal(E.exportGame(s),before);
}
{
 const s=game(88002),w=S.ensure(s),t=F.ensure(w),
  f=t.houses.fenwake,h=H.byId.fenwake,
  house=w.houses.fenwake;
 A.equal(h.elder,'Ilyen Fenwake');
 A.equal(h.relative,'Saren Fenwake');
 w.ticks.months=6;f.lastCouncilMonth=0;
 house.publicPressure=81;w.countries.reedmarch.stability=50;
 t.rngState=seed2(x=>x<.76,y=>y<.54);
 const localRng=s.rngState;
 const accepted=F._debug.propose(w,t,f,181,()=>{});
 A.equal(accepted,true);
 A.equal(f.projects.length,2);
 A.deepEqual(f.projects.map(x=>x.kind),['elder_duty','relative_public_review']);
 A.equal(f.disagreements,1);
 A.equal(f.tensionFromChoices,1);
 A.equal(t.records.at(-1).kind,'distinct-household-choices');
 A.equal(t.records.at(-1).notice,null);
 A.equal(s.rngState,localRng);
 const originalReserve=f.dutyFund,originalMember=f.people.relative.personalFund,
  originalPressure=house.publicPressure,originalInfluence=house.influence;
 const elderProject=f.projects[0],relativeProject=f.projects[1];
 A.equal(F._debug.progress(w,t,f,elderProject,190,()=>{}),'working');
 t.rngState=roll20();
 A.equal(F._debug.progress(w,t,f,elderProject,220,()=>{}),'finished');
 A.equal(f.people.elder.successes,1);
 A.equal(f.people.relative.successes,0);
 A.equal(house.publicPressure,originalPressure-3);
 A.equal(house.influence,originalInfluence+1);
 A.equal(f.dutyFund,originalReserve-6);
 A.equal(F._debug.progress(w,t,f,relativeProject,190,()=>{}),'working');
 t.rngState=roll20();
 const news=[];
 A.equal(F._debug.progress(w,t,f,relativeProject,220,x=>news.push(x)),'finished');
 A.equal(f.people.relative.successes,1);
 A.equal(f.people.elder.successes,1);
 A.equal(f.people.relative.personalFund,originalMember-4);
 A.equal(house.publicPressure,originalPressure-5);
 A.equal(house.influence,originalInfluence+2);
 A.equal(t.records.at(-1).kind,'verified-family-duty');
 A.equal(t.records.at(-1).details.roll,20);
 A.equal(t.records.at(-1).details.separateFunding,'personalFund');
 A.deepEqual(t.records.at(-1).details.participants,['Saren Fenwake']);
 A.equal(news.length,1);A.equal(news[0].releaseDay,228);
 A.equal(s.player.family,null);
 A.equal(s.player.arcane.circles,0);
 A.equal(h.elder,'Ilyen Fenwake');
 A.equal(f.dutyCoordinator,'elder');
}
{
 // When BOTH members select the same useful public work, they actually
 // cooperate, rather than presuming relatives always follow the elder.
 const s=game(88003),w=S.ensure(s),t=F.ensure(w),
  f=t.houses.reedward,h=H.byId.reedward;
 w.ticks.months=7;f.lastCouncilMonth=0;
 w.houses.reedward.publicPressure=82;
 t.rngState=seed2(x=>x<.76,y=>y>=.54&&y<.82);
 A.equal(F._debug.propose(w,t,f,211,()=>{}),true);
 A.equal(f.projects.length,1);A.equal(f.projects[0].kind,'joint_duty');
 const before=f.dutyFund,reference=f.projects[0],news=[];
 A.equal(F._debug.progress(w,t,f,reference,220,()=>{}),'working');
 t.rngState=roll20();
 A.equal(F._debug.progress(w,t,f,reference,250,x=>news.push(x)),'finished');
 A.equal(f.dutyFund,before-8);
 A.equal(f.people.elder.successes,1);
 A.equal(f.people.relative.successes,1);
 A.equal(f.jointWork,1);
 A.equal(f.trustFromWork,1);
 A.equal(news.length,1);
 A.equal(t.records.at(-1).details.participants.length,2);
 A.equal(h.relation,'daughter');
 A.equal(f.dutyCoordinator,'elder');
}
{
 const s=game(88004),w=S.ensure(s),t=F.ensure(w),
  f=t.houses.fenwake;
 f.projects=[];f.people.relative.successes=2;
 f.people.relative.merit=6;f.people.elder.merit=0;
 w.ticks.months=10;
 // A high-merit relative cannot take even a VOLUNTARY public project
 // coordinator role without two separate people's agreement.
 t.rngState=seed2(x=>x>.68,y=>y<.82);
 F._debug.coordinator(w,t,f,310,()=>{});
 A.equal(f.dutyCoordinator,'elder');
 A.equal(t.records.at(-1).kind,'working-leadership-review');
 A.equal(t.records.at(-1).details.noLegalSuccession,true);
 A.equal(f.lastLeadershipReviewMonth,10);
 const count=t.records.length;
 w.ticks.months=11;
 F._debug.coordinator(w,t,f,340,()=>{});
 A.equal(t.records.length,count,'No scripted monthly consent reroll until conditions permit it');
 w.ticks.months=16;
 t.rngState=seed2(x=>x<.68,y=>y<.82);
 const notice=[];F._debug.coordinator(w,t,f,490,x=>notice.push(x));
 A.equal(f.dutyCoordinator,'relative');
 A.equal(notice.length,1);
 A.ok(notice[0].text.includes('remains its established elder'));
 A.equal(t.records.at(-1).kind,'working-coordinator-changed');
 A.equal(t.records.at(-1).details.separatelyConsenting,true);
 A.equal(H.byId.fenwake.elder,'Ilyen Fenwake');
 A.equal(w.governance.reedmarch.holder,'Iria Highwater');
 A.equal(s.player.family,null);
}
{
 const s=game(88005),w=S.ensure(s),t=F.ensure(w),
  f=t.houses.fenwake,house=w.houses.fenwake;
 w.ticks.months=6;f.lastCouncilMonth=0;
 house.publicPressure=81;
 t.rngState=seed2(x=>x<.76,y=>y<.54);
 F._debug.propose(w,t,f,180,()=>{});
 const p=f.projects.find(x=>x.kind==='relative_public_review');
 A.ok(p);
 const reserve=f.people.relative.personalFund,
  beforePressure=house.publicPressure,beforeInfluence=house.influence;
 A.equal(F._debug.progress(w,t,f,p,180,()=>{}),'working');
 t.rngState=seed2(x=>x<.05,y=>true);
 A.equal(F._debug.progress(w,t,f,p,210,()=>{}),'finished');
 A.equal(f.people.relative.failures,1);
 A.equal(f.people.relative.successes,0);
 A.equal(f.people.relative.personalFund,reserve-4);
 A.equal(house.publicPressure,beforePressure);
 A.equal(house.influence,beforeInfluence);
 A.equal(t.records.at(-1).kind,'failed-family-duty');
 A.equal(t.records.at(-1).details.roll,1);
}
console.log('28 authentic family elder/relative pairs: consent, different choices, real service money, honest failure, earned coordinator with NO legal succession');
