'use strict';
// Only disposable worlds. Genuine individual workers must be simultaneously
// present and use their existing personal work RNG, aptitude, and receipts.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Time=require('../rules/world'),Realm=require('../world/simulation'),
 People=require('../world/emergent-people'),
 Career=require('../world/person-careers');
let accepted=null,refused=0;
for(const seed of [974171,974172,974173,974174,974175,974176]){
 const s=E.newGame({seed,name:'Living Skill Sharing Test',path:'undecided'});
 const w=Realm.ensure(s);
 Time.advance(s,240);
 const day=w.lastTickDay;
 const all=Object.values(w.emergentPeople.people).filter(p=>
  p.status==='active'&&p.fatigue<=55&&p.shift&&
  People.presence(w,p.actorId,p.shift.location,day));
 const pairs=[];
 for(const mentor of all)for(const learner of all){
  if(mentor.id!==learner.id&&
    mentor.shift.location===learner.shift.location)
   pairs.push({mentor,learner});
 }
 for(const {mentor,learner} of pairs){
  if(accepted)break;
  let proof=mentor.career.workReceipts.slice().reverse().find(x=>x.source.outcome.success);
  for(let tries=0;!proof&&tries<9;tries++){
   Career.work(w,mentor,day);
   proof=mentor.career.workReceipts.slice().reverse().find(x=>x.source.outcome.success);
  }
  if(!proof||mentor.fatigue>85||learner.fatigue>85)continue;
  const method=proof.source.task.method,signature='peer-'.concat(seed,'-',mentor.id,'-',learner.id);
  if(!learner.career.authoredDuties.some(x=>x.method===method))
   Career.authorDuty(w,learner,{id:'duty-'.concat(seed,'-',mentor.id),
    role:'Practical peer-supported local services',
    method,domain:proof.source.task.domain,
    goal:'Apply a previously observed useful working method to an individually valid local task',
    day,witness:'A genuine local working opportunity exists for observation and an independently attempted practical task.'});
  const before=E.exportGame(s), teacherRng=mentor.rngState;
  A.throws(()=>Career.observePeerGuidance(w,learner,mentor,{
   id:signature,method,day,
   witness:'Original local work practice is independently witnessed in this present shared shift.',
   chosenConsent:true}),/cannot choose mentor consent/);
  A.equal(mentor.rngState,teacherRng);
  A.equal(E.exportGame(s),before);
  const response=Career.observePeerGuidance(w,learner,mentor,{
   id:signature,method,day,
   witness:'The two personally present workers witnessed a specific professional technique and requested optional guidance during the shared work shift.'});
  A.equal(response.noGuaranteedLearning,true);
  A.equal(response.noRankOrSpellGranted,true);
  A.equal(Career.verify(learner),true);
  A.equal(Career.verify(mentor),true);
  A.throws(()=>Career.observePeerGuidance(w,learner,mentor,{
   id:signature+'-reroll',method,day,
   witness:'Trying the same person and method again solely to select a different result is not authentic evidence.'}),
   /genuinely present|teachable method/);
  if(!response.accepted){refused++;continue;}
  accepted={s,w,mentor,learner,method,day,response,teacherEvidence:proof.sourceHash};
 }
 if(accepted)break;
}
A.ok(accepted,'At least one real present professional must freely agree across independent worlds');
const {s,w,learner,mentor,method,day,response}=accepted;
const entry=()=>learner.career.peerGuidance.find(x=>x.id===response.id);
const state=()=>Career.peerGuidanceStatus(learner,{day}).find(x=>x.id===response.id);
A.equal(state().status,'accepted');
const startSkill=learner.career.skillPoints,
 originalWork=learner.career.workCount,
 originalPlayerRng=s.rngState;
let used=null;
for(let i=0;i<40;i++){
 const a=Career.work(w,learner,day);
 if(a.oneOriginalWorkCheckPeerSupport===1){used=a;break;}
}
A.ok(used,'Guidance is consumed by a later actual independently chosen original task');
A.equal(used.taskMethod,method);
A.equal(s.rngState,originalPlayerRng,'No free second player roll from advice');
A.ok(learner.career.workCount>originalWork);
A.ok(learner.career.skillPoints>=startSkill,
 'Only original genuine work can earn practice');
A.equal(state().status,'used');
A.equal(entry().used.hash,used.receiptHash);
A.equal(Career.verify(learner),true);
for(let i=0;i<40;i++)Career.work(w,learner,day);
A.equal(state().status,'used');
A.equal(Career.verify(learner),true,
 'Original peer evidence survives original finite work-journal rotation');
A.equal(learner.career.recognizedLicence,null);
A.deepEqual(learner.career.supernaturalSystemRanks,{});
const snap=E.exportGame(s),copy=E.importGame(snap),
 p2=copy.table.realm.emergentPeople.people[learner.id];
A.equal(Career.verify(p2),true);
A.deepEqual(Career.peerGuidanceStatus(p2,{day}),Career.peerGuidanceStatus(learner,{day}));
A.equal(E.exportGame(copy),snap);
const beforeHash=entry().sourceHash;
entry().source.teacherWork.outcome.success=false;
A.equal(Career.verify(learner),false,'Claimed prior achievement cannot be falsified');
A.equal(entry().sourceHash,beforeHash);
console.log('Open-ended original career peer teaching: actually co-present competent mentor, own consent, honest work and one bounded non-stacking later check, no power/contract, replay-safe, refusals='+refused);
