'use strict';
// Source-verifiable practice is portable across different person kinds
// without a fixed profession, species, magical rank or calendar gate.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Time=require('../rules/world'),People=require('../world/person-careers'),
 Practice=require('../world/earned-individual-practice');
const fakeHash=n=>Practice.hash({genuineFixture:n});
{
 const source=fakeHash('independent-actor'),aptitudes={
  'field-judgement':85,'resource-care':35};
 const a=Practice.make('sapient:individual-7',source,aptitudes);
 A.equal(Practice.verify(a,'sapient:individual-7',source,aptitudes),true);
 A.equal(a.points['field-judgement'],0);
 const before=JSON.stringify(a);
 // No number of years or sessions can unlock anything through the reducer.
 A.equal(Practice.degree(a.points['field-judgement']),0);
 A.equal(JSON.stringify(a),before);
 const first={domain:'field-judgement',method:'habitat-observation',
  activityHash:fakeHash('one real local survey'),contextHash:fakeHash('real habitat'),
  day:4,roll:20,challenge:13,modifier:0};
 const win=Practice.record(a,'sapient:individual-7',source,aptitudes,first);
 A.equal(win.success,true);A.ok(win.earned>0);
 A.equal(win.freeTechnique,false);A.equal(win.freeRank,false);
 A.equal(Practice.verify(a,'sapient:individual-7',source,aptitudes),true);
 const unchanged=JSON.stringify(a);
 A.throws(()=>Practice.record(a,'sapient:individual-7',source,aptitudes,first),
  /only once/);
 A.equal(JSON.stringify(a),unchanged);
 A.throws(()=>Practice.record(a,'sapient:individual-7',source,aptitudes,
  {...first,activityHash:fakeHash('forged'),rank:9}),/caller-selected/);
 A.equal(JSON.stringify(a),unchanged);
 const changed=structuredClone(a);
 changed.points['field-judgement']=90000;
 A.equal(Practice.verify(changed,'sapient:individual-7',source,aptitudes),false);
 changed.points['field-judgement']=a.points['field-judgement'];
 changed.receipts[0].source.result.earned+=100;
 A.equal(Practice.verify(changed,'sapient:individual-7',source,aptitudes),false);
 A.equal(Practice.verify(a,'sapient:individual-7',source,aptitudes),true);
 const rollAgain=Practice.make('sapient:individual-7',source,aptitudes);
 A.deepEqual(Practice.record(rollAgain,'sapient:individual-7',source,aptitudes,first),win);
 A.deepEqual(rollAgain,a);
}
{
 // Other actor domains fit without a catalogue of every possible skill.
 const src=fakeHash('self-taught-inventor'),apt={
  'healing-knowledge':91,'structural-design':74,'field-judgement':15};
 const ledger=Practice.make('human:apprentice-7',src,apt);
 const events=[];
 for(let i=0;i<31;i++){
  const t={domain:i%2?'structural-design':'healing-knowledge',
   method:i%2?'physical-prototype':'injury-assessment',
   activityHash:fakeHash('actual action '+i),
   contextHash:fakeHash('actual problem '+i),
   day:Math.floor(i/4),roll:13+i%8,challenge:11+i%4,modifier:1};
  events.push(t);
  Practice.record(ledger,'human:apprentice-7',src,apt,t);
 }
 A.equal(ledger.receipts.length,24);
 A.equal(ledger.anchorAttempts,7);
 A.equal(ledger.attempts,31);
 A.equal(Practice.verify(ledger,'human:apprentice-7',src,apt),true);
 const stored=JSON.parse(JSON.stringify(ledger));
 A.equal(Practice.verify(stored,'human:apprentice-7',src,apt),true);
 const altered=structuredClone(stored);
 altered.receipts[0].source.roll=altered.receipts[0].source.roll===20?1:20;
 A.equal(Practice.verify(altered,'human:apprentice-7',src,apt),false);
 A.throws(()=>Practice.make('beast:fake','invalid',{alchemy:100}),/identity/);
 A.equal(Practice.degree(0),0);
 A.equal(Practice.degree(131),4);
}
{
 // The existing humans' ACTUAL source-bound work can feed the same
 // generic achievement reducer without taking over their professional rank
 // or assigning them a magical/cultural authority.
 const s=E.newGame({seed:963112,name:'Portable Merit Contract Fixture'});
 Time.advance(s,96);
 const p=Object.values(s.table.realm.emergentPeople.people)
  .find(x=>x.career?.workReceipts?.length);
 A.ok(p,'a genuine independent person must actually have a work receipt');
 A.equal(People.verify(p),true);
 const real=p.career.workReceipts.at(-1);
 const src=real.source;
 A.equal(real.sourceHash,Practice.hash(src));
 const id='human:'+p.id,apt={'practical-work':p.career.aptitude*10},
  ledger=Practice.make(id,p.originHash,apt);
 const before=JSON.stringify(p.career),rank=p.career.competenceRank;
 const result=Practice.record(ledger,id,p.originHash,apt,{
  domain:'practical-work',method:src.task.method,
  activityHash:real.sourceHash,contextHash:Practice.hash(src.task),
  day:src.day,roll:src.roll,challenge:src.dc,modifier:src.modifier});
 A.equal(Practice.verify(ledger,id,p.originHash,apt),true);
 A.ok(typeof result.success==='boolean');
 A.equal(JSON.stringify(p.career),before);
 A.equal(p.career.competenceRank,rank);
}
console.log('Generic action-evidence reducer supports human and sapient-beast aptitudes, challenges, varied methods, sealed rolling saves and no time/automatic-rank gates');
