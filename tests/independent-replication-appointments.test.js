'use strict';
// A documented researcher can ask a REAL available professional for a
// separate experiment: no phantom academic or player-entered bonus.
const A=require('node:assert/strict'),
 E=require('../engine.js'),R=require('../rules'),W=require('../rules/world'),
 Realm=require('../world/simulation'),
 Presence=require('../world/person-presence'),
 Appointments=require('../rules/research-replication');
const s=E.newGame({seed:93414,name:'Independent Research Test Worker',path:'undecided'});
s.player.attributes.int=30;s.player.skills.research={rank:5,xp:0};
s.player.coins=500;s.player.insightPoints=8;
s.table||={};
s.table.researchPlans={survey_method:{
 id:'survey_method',worldMinute:s.world.minutes,
 source:'Independent signed local work study and an original witnessed professional brief',
 parameters:{id:'survey_method',title:'Safe Ferry Inspection Notes',
  kind:'method',skill:'research',grade:1,novelty:'variant',
  truth:{feasibility:'possible',requirements:[
   'Compare independent inspection records with actual safe work results'
  ],acceptedHypotheses:['A bounded method can be independently verified']}}
}};
const act=(op,params)=>R.act(s,{system:'research',operation:op,params});
A.equal(act('start',{id:'survey_method'}).status,'proposed');
act('survey',{id:'survey_method'});
let weeks=0;
while(s.table.research.survey_method.progress<s.table.research.survey_method.track){
 if(++weeks>24)throw Error('Completed research unavailable in disposable fixture');
 act('week',{id:'survey_method'});
}
const proof=act('proof',{id:'survey_method'});
A.equal(proof.outcome,'proven','Independent replication must follow real research proof');
const denied=E.exportGame(s),rng=s.rngState;
A.throws(()=>act('inviteReplication',{id:'survey_method',npcId:'notable:nonexistent'}),
 /scheduled|present/);
A.equal(E.exportGame(s),denied);
A.equal(s.rngState,rng,'A nonexistent examiner must not consume a research die');
let found=null;
for(let i=0;i<26&&!found;i++){
 const w=Realm.ensure(s),now=Math.floor(s.world.minutes/1440),
  candidates=Object.values(w.personPresence?.roster||{})
   .filter(sh=>sh.profession==='field specialist'&&
    sh.throughDay>=now&&Presence.verified(w,sh));
 const sh=candidates[0];
 if(sh){
  const apptDay=Math.max(now,sh.fromDay),targetMinute=apptDay*1440+9*60;
  if(targetMinute>s.world.minutes){
   const old=s.world.minutes;
   E.advance(s,targetMinute-old);
   W.finalizeTime(s,old);
  }
  s.world.location=sh.location; // Disposable fixture establishes the physical site.
  const actual=Presence.resolve(Realm.peek(s),sh.npcId,
   s.world.location,Math.floor(s.world.minutes/1440));
  if(actual)found=sh;
 }
 if(!found){
  const old=s.world.minutes;E.advance(s,6*1440);W.finalizeTime(s,old);
 }
}
A.ok(found,'A scheduled, genuinely qualified field examiner eventually works at a real local site');
const before=s.world.minutes,stamina=s.player.stamina,rollRng=s.rngState;
const out=act('inviteReplication',{id:'survey_method',npcId:found.npcId});
A.equal(typeof out.agreed,'boolean');
A.equal(out.elapsedMinutes,20);
A.equal(s.world.minutes,before+20);
A.equal(s.player.stamina,stamina-1);
A.equal(s.rngState,rollRng,'Independent consent uses the world stream, not the research check die');
const recorded=s.table.researchReplicationInvitations.survey_method[found.npcId];
A.equal(recorded.agreed,out.agreed);
const after=E.exportGame(s);
A.throws(()=>act('inviteReplication',{id:'survey_method',npcId:found.npcId}),
 /already freely answered/);
A.equal(E.exportGame(s),after,'Cannot reroll an earlier acceptance or refusal');
if(out.agreed){
 const t=s.table.researchReplicators.survey_method[found.npcId];
 A.equal(Appointments.verify(s,t),true);
 A.equal(t.abilityScore,10,'Do not invent a higher mental ability for the examiner');
 const beforeRoll=s.rngState;
 const replication=act('replication',{id:'survey_method',testerId:found.npcId});
 A.equal(replication.externallyReplicated,true);
 A.notEqual(s.rngState,beforeRoll,'Actual replication, unlike the invitation, rolls one new research die');
 A.equal(t.used,true,'An independent tester cannot be reused as a fresh experiment');
 const rolled=E.exportGame(s);
 A.throws(()=>act('replication',{id:'survey_method',testerId:found.npcId}),
  /documented independent replication/);
 A.equal(E.exportGame(s),rolled);
}else{
 A.equal(s.table.researchReplicators?.survey_method?.[found.npcId],undefined,
  'Declining to test cannot be recorded as a completed test');
}
console.log('Independently scheduled real NPC can accept/refuse a replication request without a fabricated tester or extra roll; authentic accepted work uses original research math');
