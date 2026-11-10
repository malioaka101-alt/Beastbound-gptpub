'use strict';
const A=require('node:assert/strict'),E=require('../engine.js'),
 Time=require('../rules/world'),Realm=require('../world/simulation'),
 Career=require('../world/person-careers'),Atlas=require('../world/atlas');
const s=E.newGame({seed:963171,name:'Work Terms Test',path:'undecided'});
const w=Realm.ensure(s);
Time.advance(s,240);
const day=w.lastTickDay,playerRng=s.rngState;
const people=Object.values(w.emergentPeople.people).filter(p=>p.status==='active'&&p.fatigue<75);
A.ok(people.length>5);
let accepted=null,declined=0;
for(const p of people){
 const officer=Object.values(w.notables).find(x=>x.polity===p.polity&&w.institutions[x.institution]?.status==='active');
 if(!officer)continue;
 const dutyId='work-'.concat(p.id);
 Career.authorDuty(w,p,{id:dutyId,role:'Local stock inspection',
  method:'local-stock-inspection',domain:'trade',
  institutionId:officer.institution,day,
  goal:'Inspect existing goods and address one clearly witnessed local deficit',
  witness:'Actual local work was described by existing institution staff with real economic evidence.'});
 const offer={id:'offer-'.concat(p.id),dutyId,
  issuerId:officer.institution,witnessId:officer.id,
  startDay:day,endDay:day+12,risk:Atlas.R[p.regionId].dangers[0],
  safetyPlan:'The worker may stop immediately on unsafe exposure and report the risk.',
  agreedScope:'A time-limited optional local task without compulsory ongoing employment',
  issuerOfferWitness:'The existing institution representative witnessed this limited voluntary opportunity with genuine local safety details.'};
 const old=p.rngState,workCount=p.career.workCount;
 A.throws(()=>Career.offerDuty(w,p,{...offer,accepted:true}),
  /chosen acceptance|salary/);
 A.equal(p.rngState,old);
 const reply=Career.offerDuty(w,p,offer);
 A.equal(s.rngState,playerRng);
 A.equal(p.career.workCount,workCount);
 A.equal(reply.noPromisedWage,true);
 A.equal(Career.verify(p),true);
 A.throws(()=>Career.offerDuty(w,p,{...offer,id:'duplicate-'.concat(p.id)}),
  /distinct day|autonomous/);
 if(reply.accepted&&!accepted)accepted={p,offer};
 if(!reply.accepted)declined++;
}
A.ok(accepted,'A real worker can accept');
A.ok(declined>0,'A real worker can refuse');
const p=accepted.p;
let linked=false;
for(let i=0;i<40;i++){
 const done=Career.work(w,p,day);
 if(done.taskMethod==='local-stock-inspection'&&p.career.workOffers[0].attemptedWork.length){
  linked=true;break;
 }
}
A.equal(linked,true,'Real work receipts fulfill accepted offers');
const original=E.exportGame(s),copy=E.importGame(original);
const counterpart=copy.table.realm.emergentPeople.people[p.id];
A.deepEqual(Career.workOfferStatus(counterpart,{day}),Career.workOfferStatus(p,{day}));
A.equal(Career.workOfferStatus(p,{day:day+13})[0].status,'expired');
const ended=Career.endWorkOffer(w,p,{id:accepted.offer.id,day,initiatedBy:'worker',
 reason:'After independently reconsidering the local conditions the worker has withdrawn this limited agreement.'});
A.equal(ended.ended,true);
A.ok(ended.attemptedWorkRetained>0);
A.equal(Career.verify(p),true);
const snap=E.exportGame(s);
A.equal(Career.verify(E.importGame(snap).table.realm.emergentPeople.people[p.id]),true);
A.throws(()=>Career.endWorkOffer(w,p,{id:accepted.offer.id,day,initiatedBy:'worker',
 reason:'This is an attempted repetition of the original voluntary withdrawal.'}),
 /existing active/);
A.equal(E.exportGame(s),snap);
p.career.workOffers[0].source.agreedScope='Forced permanent work';
A.equal(Career.verify(p),false);
console.log('Voluntary source-backed independent work: real duty and hazard, own refusal, actual work, expiry, withdrawal, save persistence');
