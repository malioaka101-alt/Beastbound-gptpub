'use strict';
const A=require('node:assert/strict'),P=require('../world/earned-individual-practice'),
 L=require('../world/causal-learning');
const h=n=>P.hash({actualFixture:n});
const teacherId='human:river-crafter',tOrigin=h('teacher-source'),
 tApt={'structural-design':82},teach=P.make(teacherId,tOrigin,tApt);
P.record(teach,teacherId,tOrigin,tApt,{domain:'structural-design',
 method:'measured-repair',activityHash:h('the original work'),
 contextHash:h('local materials'),day:1,roll:18,challenge:12,modifier:2});
const claimed={actorId:teacherId,actorOriginHash:tOrigin,
 aptitudes:tApt,practice:teach,receiptHash:teach.receipts[0].hash};
const proven=L.provenDemonstration(claimed);
A.equal(proven.attestation.method,'measured-repair');
A.throws(()=>L.provenDemonstration({...claimed,receiptHash:h('fake')}),/retained source/);
const corrupt=structuredClone(teach);corrupt.points['structural-design']+=1;
A.throws(()=>L.provenDemonstration({...claimed,practice:corrupt}),/Unverified/);
const learnerId='sapient:individual-41',lOrigin=h('sapient original identity'),
 lApt={'structural-design':95},learning=P.make(learnerId,lOrigin,lApt),
 history=L.make(learnerId,lOrigin),person={actorId:learnerId,
 actorOriginHash:lOrigin,aptitudes:lApt,practice:learning};
const task=(i,roll=17)=>({domain:'structural-design',method:'adapted-repair',
 activityHash:h('actual learner task '+i),contextHash:h('local physical challenge '+i),
 day:2,roll,challenge:14,modifier:1});
const access=h('freely offered and comprehensible working encounter');
// The engine adapter attests an actual local event, not player assertion.
const authorised=o=>o.accessHash===access&&o.learnerId===learnerId&&
 o.route==='peer-observation'&&o.sourceHash===proven.hash;
const before=JSON.stringify({learning,history});
A.throws(()=>L.resolve({ledger:history,learner:person,
 route:'peer-observation',accessHash:access,source:claimed,
 task:task(1),authorise:()=>false}),/No verified/);
A.equal(JSON.stringify({learning,history}),before);
const outcome=L.resolve({ledger:history,learner:person,
 route:'peer-observation',accessHash:access,source:claimed,
 task:task(1),authorise:authorised});
A.equal(outcome.success,true);
A.ok(outcome.earned>0);
A.equal(outcome.noTransferredRank,true);
A.equal(outcome.noAutomaticTechnique,true);
A.equal(teach.points['structural-design'],teach.receipts[0].source.result.earned);
A.equal(teach.receipts.length,1);
A.equal(learning.receipts.length,1);
A.equal(history.receipts.length,1);
A.equal(L.verify(JSON.parse(JSON.stringify(history)),learnerId,lOrigin),true);
A.equal(P.verify(learning,learnerId,lOrigin,lApt),true);
const unchanged=JSON.stringify({learning,history});
A.throws(()=>L.resolve({ledger:history,learner:person,
 route:'peer-observation',accessHash:access,source:claimed,
 task:task(1),authorise:authorised}),/cannot be replayed/);
A.equal(JSON.stringify({learning,history}),unchanged);
A.throws(()=>L.resolve({ledger:history,learner:person,
 route:'peer-observation',accessHash:access,source:claimed,
 task:task(2),authorise:o=>o.sourceHash!==proven.hash}),/No verified/);
A.equal(JSON.stringify({learning,history}),unchanged);
// A personally grounded discovery does NOT require a teacher or fee.
const selfId='human:solitary-fieldworker',selfOrigin=h('self grounded'),
 selfApt={'field-judgement':86},selfPractice=P.make(selfId,selfOrigin,selfApt),
 selfHistory=L.make(selfId,selfOrigin),self={actorId:selfId,
 actorOriginHash:selfOrigin,aptitudes:selfApt,practice:selfPractice};
const selfTask={domain:'field-judgement',method:'novel-field-test',
 activityHash:h('actual experiment'),contextHash:h('real habitat'),
 day:3,roll:19,challenge:16,modifier:0};
const selfOutcome=L.resolve({ledger:selfHistory,learner:self,
 route:'self-experiment',accessHash:h('attested actual experiment'),
 task:selfTask,authorise:o=>o.sourceHash===null&&o.route==='self-experiment'});
A.equal(selfOutcome.success,true);A.equal(selfOutcome.noCompulsoryTeacher,true);
// Failing a genuine attempt is recorded honestly, not granted competence.
const fail=L.resolve({ledger:selfHistory,learner:self,
 route:'self-experiment',accessHash:h('another real experiment'),
 task:{...selfTask,activityHash:h('failed independent attempt'),roll:1},
 authorise:()=>true});
A.equal(fail.success,false);A.equal(fail.earned,0);
A.equal(selfHistory.attempts,2);
// Save/reload and audit tampering.
const t=structuredClone(selfHistory);t.receipts[0].source.success=false;
A.equal(L.verify(t,selfId,selfOrigin),false);
A.equal(L.verify(selfHistory,selfId,selfOrigin),true);
A.throws(()=>L.resolve({ledger:selfHistory,learner:self,
 route:'self-experiment',accessHash:h('forged grant'),
 task:{...selfTask,activityHash:h('fraud'),level:20},authorise:()=>true}),
 /caller-selected/);
// Many independent accomplishments remain checkpoint-bounded, never time gated.
for(let i=0;i<29;i++)L.resolve({ledger:selfHistory,learner:self,
 route:'self-experiment',accessHash:h('actual study access '+i),
 task:{domain:'field-judgement',method:'novel-field-test',
 activityHash:h('genuine unique work '+i),contextHash:h('real field condition '+i),
 day:4,roll:15,challenge:16,modifier:1},authorise:()=>true});
A.equal(selfHistory.attempts,31);
A.equal(selfHistory.anchorAttempts,7);
A.equal(selfHistory.receipts.length,24);
A.equal(L.verify(JSON.parse(JSON.stringify(selfHistory)),selfId,selfOrigin),true);
A.equal(P.verify(selfPractice,selfId,selfOrigin,selfApt),true);
console.log('Causal learning requires valid independent source, verified access and learner practice; no fees, forced teacher, stolen rank, calendar gate or failed-skill credit');
