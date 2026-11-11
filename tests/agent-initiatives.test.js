'use strict';
// Real world evolution with verified mundane inventions, unknown NPCs rising,
// new voluntarily staffed rivals, actual setbacks, and reversible dominance.
// This does NOT assert new supernatural Circles, bloodlines or invented spells.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),Crypto=require('node:crypto');
const E=require('../engine.js'),W=require('../rules/world'),
 S=require('../world/simulation'),N=require('../world/notables'),
 I=require('../world/agent-initiatives'),Turn=require('../scripts/chat-turn.js');
const sha=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fresh=seed=>E.newGame({seed,name:'Independent Emergent World Fixture',path:'undecided'});
function actual(seed,days=1200){
 const s=fresh(seed);
 W.advance(s,days);
 return s;
}
{
 const s=fresh(193201),old=E.exportGame(s),rng=s.rngState;
 const v=S.publicInitiatives(s,{});
 A.deepEqual(v.knownWork,[]);
 A.deepEqual(v.knownInstitutionalMilestones,[]);
 A.equal(v.polity,'Reedmarch Compact');
 A.equal(E.exportGame(s),old);A.equal(s.rngState,rng);
 A.throws(()=>S.publicInitiatives(s,{chosenWinner:'ME'}),/accepts no hidden plans/);
 A.equal(E.exportGame(s),old);
 const r=I.seed(S.peek(s));
 A.equal(Object.keys(r.projects).length,3);
 A.equal(r.records.length,0);
 A.equal(Object.keys(r.entrants).length,0);
 for(const p of Object.values(r.projects)){
  A.equal(S.peek(s).notables[p.actorId].polity,p.polity);
  A.ok(S.peek(s).institutions[p.sponsorInstitutionId]);
  A.ok(p.method.length>20);
  A.equal(p.successes,0);A.equal(p.failures,0);
 }
 A.equal(E.exportGame(s),old);
}
{
 const a=actual(193203,1095),b=actual(193203,1095);
 A.deepEqual(a.table.realm,b.table.realm);
 const w=a.table.realm,t=w.agentInitiatives;
 A.equal(t.version,1);
 A.equal(Object.keys(t.projects).length,3);
 A.ok(t.records.length>0);
 A.ok(t.counter>=t.records.length);
 A.equal(w.ticks.months,36);
 for(const r of t.records){
  A.ok(['tested-method','failed-trial','new-organisation',
   'group-suspended','group-reopened','local-competition-changed',
   'local-competition-reversed'].includes(r.kind),r.kind);
  A.equal(r.hash,sha({id:r.id,day:r.day,month:r.month,
   actorId:r.actorId,actorName:r.actorName,polity:r.polity,kind:r.kind,
   source:r.source,method:r.method,context:r.context}));
  A.ok(r.day>0&&r.month>0);
  A.ok(r.source.includes('named Beastbound professional'));
  if(r.publicText)A.equal(r.releaseDay,r.day+8);
 }
 for(const p of Object.values(t.projects)){
  A.equal(I.verifyMilestones(p),true,
   'Original organisational founding, suspension and rivalry events must form a source-authentic historical record');
  for(const row of p.organisationMilestones||[]){
   A.equal(row.source.originalRecordHash,row.source.originalEvent.hash);
   A.equal(row.source.releaseDay,row.day+8);
   A.equal(row.source.noNewRollOrParticipation,true);
  }
  A.ok(p.successes+p.failures>0,'real independent practitioner actually tests a method');
  A.equal(p.attempts,p.successes+p.failures);
  A.ok(p.invested>=8*(p.successes+p.failures));
  A.ok(p.work>=0&&p.materials>=0);
  A.equal(p.successes>=0,true);
  A.equal(p.groupId===null||!!t.entrants[p.groupId],true);
 }
 for(const n of Object.values(w.notables)){
  A.equal(n.discipline.stage,0,'mundane craft pilots must not invent cultivation advancements');
  A.ok(n.professional.rank<=3);
 }
 const initialPublic=S.publicInitiatives(a);
 const copy=E.exportGame(a);
 A.ok(initialPublic.knownWork.every(x=>x.region==='Reedmarch Compact'));
 A.ok(initialPublic.knownWork.every(x=>x.type!=='unwitnessed-private-plan'));
 A.equal(E.exportGame(a),copy);
 const restored=E.importGame(copy);
 A.equal(E.exportGame(restored),copy);
 for(const [id,p] of Object.entries(t.projects))
  A.deepEqual(restored.table.realm.agentInitiatives.projects[id].
   organisationMilestones||[],p.organisationMilestones||[],
   'Original professional organisational milestones must survive checkpoint save and restoration');
 A.throws(()=>S.publicInitiatives(a,{privateSecrets:'reveal all rivals'}),
  /accepts no hidden plans/);
}

{
 // Actual calendar timing: a pilot is *not* made public by research progress
 // alone. It appears only after an authored guild report's release day.
 let target=null;
 for(let seed=193210;seed<193260;seed++){
  const s=actual(seed,120);
  const first=s.table.realm.agentInitiatives.records.find(r=>
    r.polity==='reedmarch'&&r.kind==='tested-method');
  if(first){target={s,first};break;}
 }
 A.ok(target,'Some independent Reedmarch practical pilots must genuinely pass a test');
 const {s,first}=target;
 A.ok(first.day<=Math.floor(s.world.minutes/1440));
 A.ok(first.releaseDay>Math.floor(s.world.minutes/1440));
 A.equal(S.publicInitiatives(s).knownWork.some(x=>x.development===first.publicText),false);
 const before=E.exportGame(s),rng=s.rngState;
 S.publicInitiatives(s);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 W.advance(s,first.releaseDay-Math.floor(s.world.minutes/1440));
 A.equal(S.publicInitiatives(s).knownWork.some(x=>x.development===first.publicText),true);
 A.equal(S.publicNews(s).items.some(x=>x.text===first.publicText),true);
 const discovered=S.publicInitiatives(s).knownWork.find(x=>x.development===first.publicText);
 A.ok(discovered.person.length>=6);
 A.equal(discovered.type,'tested-method');
 A.ok(!JSON.stringify(discovered).includes('rngState'));
 A.ok(!JSON.stringify(discovered).includes('invested'));
}
{
 let successes=0,failures=0,founders=0;
 for(const seed of [193211,193219,193227,193235,193243,193251]){
  const s=actual(seed,2190),t=s.table.realm.agentInitiatives;
  successes+=Object.values(t.projects).reduce((v,p)=>v+p.successes,0);
  failures+=Object.values(t.projects).reduce((v,p)=>v+p.failures,0);
  founders+=Object.keys(t.entrants).length;
  for(const e of Object.values(t.entrants)){
   const p=t.projects[e.founderId],n=s.table.realm.notables[e.founderId];
   const parent=s.table.realm.institutions[e.parentInstitutionId];
   A.equal(p.groupId,e.id);
   A.equal(n.independentPracticeId,e.id);
   A.equal(e.foundedDay>0,true);
   A.ok(e.members>=9,'Every independent group must have real participating members');
   A.ok(e.funds>=0&&e.funds<=100);
   A.ok(e.capacity>=0&&e.capacity<=100);
   A.ok(e.reputation>=0&&e.reputation<=100);
   A.ok(parent.members>=0);
   A.ok(p.successes>=2,'No spin-off exists without tested work');
   A.ok(t.records.some(r=>r.kind==='new-organisation'&&r.actorId===p.actorId));
  }
 }
 A.ok(successes>0,'NPC researchers must genuinely advance useful local knowledge');
 A.ok(failures>0,'Some source-grounded technical trials must fail');
 A.ok(founders>0,'A genuine non-noble independent training rival must eventually become possible');
}
{
 // Specifically exercise reversible competitive standing with real transferred
 // members and public records, not a fake government succession.
 let seeded=null;
 for(let seed=193260;seed<193300&&!seeded;seed++){
  const s=actual(seed,2190);
  if(Object.keys(s.table.realm.agentInitiatives.entrants).length)seeded=s;
 }
 A.ok(seeded,'At least one genuine independently formed group must be recoverable');
 const w=seeded.table.realm,t=w.agentInitiatives,
  p=Object.values(t.projects).find(x=>x.groupId);
 A.ok(p);
 const e=t.entrants[p.groupId],parent=w.institutions[p.sponsorInstitutionId];
 // Setting conditions is a disposable unit-test fixture, not a live action
 // that alters existing campaign institutions or entitles the player.
 e.status='active';e.members=42;e.funds=60;e.capacity=62;e.reputation=90;
 parent.members=21;parent.reputation=15;
 const groupMembers=e.members+parent.members;
 for(let i=0;i<4;i++)I._debug.groupMonth(w,t,p,2191+i,()=>{});
 A.equal(e.currentlyLeading,true);
 A.ok(t.records.some(r=>r.kind==='local-competition-changed'&&r.actorId===p.actorId));
 const changed=p.organisationMilestones.find(r=>r.kind==='local-competition-changed');
 A.ok(changed,'The original real group lead change needs durable evidence even if short journals later prune it');
 A.equal(changed.source.originalEvent.context.sustainedMonths>=3,true);
 A.equal(I.verifiedOriginalMilestone(p,changed),true);
 A.equal(e.members+parent.members,groupMembers);
 e.members=14;parent.members=55;e.reputation=20;parent.reputation=88;
 I._debug.groupMonth(w,t,p,2198,()=>{});
 A.equal(e.currentlyLeading,false);
 A.ok(t.records.some(r=>r.kind==='local-competition-reversed'&&r.actorId===p.actorId));
 const reversed=p.organisationMilestones.find(r=>r.kind==='local-competition-reversed');
 A.ok(reversed);
 A.equal(I.verifiedOriginalMilestone(p,reversed),true);
 A.equal(I.verifyMilestones(p),true);
 A.notEqual(changed.sourceHash,reversed.sourceHash);
 A.equal(changed.source.originalEvent.context.sustainedMonths>=3,true);
 const realMilestones=p.organisationMilestones.length,
  previousPlayerRng=seeded.rngState;
 A.ok(realMilestones>=2);
 A.equal(seeded.rngState,previousPlayerRng,
  'Pure provenance must not generate a new independent or player die roll');
 // Simulate pruning only the old SHORT news buffer in this disposable
 // fixture. This must not erase the true source-authentic historical event.
 t.records=t.records.filter(r=>r.id!==changed.source.originalRecordId&&
  r.id!==reversed.source.originalRecordId);
 A.equal(I.verifyMilestones(p),true);
 A.ok(p.organisationMilestones.some(r=>r.sourceHash===changed.sourceHash));
 const seal=changed.sourceHash;
 changed.source.originalEvent.context.newGroupMembers=999999;
 A.equal(I.verifyMilestones(p),false,
  'A fabricated historical rivalry victory must not rewrite actual membership');
 A.equal(changed.sourceHash,seal);
 A.throws(()=>I.ensure(w),/original project evidence/);
 A.ok(w.governance.asterwyn.holder.length>5);
 A.equal(seeded.player.family,null);
 A.equal(seeded.player.arcane.circles,0);
 A.equal(seeded.table.meridianTechniques,undefined);
}
{
 // Real depleted funding interrupts work, loses investment and can suspend
 // the new cooperative without turning a failure into a free reputation bonus.
 const s=fresh(193361),w=S.ensure(s),t=I.ensure(w),
  p=t.projects.reedmarch_field,n=w.notables[p.actorId],
  org=w.institutions[p.sponsorInstitutionId];
 p.work=3;p.materials=7;org.funds=5;
 const copy=E.exportGame(s),rng=s.rngState;
 I._debug.pilot(w,t,p,30,()=>{});
 I._debug.pilot(w,t,p,60,()=>{});
 A.equal(p.phase,'delayed');A.equal(p.work,2);
 A.equal(p.blocked,2);
 A.equal(p.successes,0);A.equal(p.failures,0);
 A.equal(s.rngState,rng,'Independent projects must not draw the player combat RNG');
 A.notEqual(E.exportGame(s),copy);
 A.equal(n.discipline.stage,0);
}
{
 // A severe real pilot miscalibration cannot be handwaved away by the
 // monthly professional subsystem reducing a one-month injury flag early.
 const s=fresh(193377),w=S.ensure(s),t=I.ensure(w),
  p=t.projects.reedmarch_field,org=w.institutions[p.sponsorInstitutionId];
 p.recoveryUntilMonth=3;w.ticks.months=3;
 const money=org.funds;
 I._debug.pilot(w,t,p,90,()=>{});
 A.equal(p.blocked,1);A.equal(org.funds,money);
 A.equal(p.work,0);
 w.ticks.months=4;
 I._debug.pilot(w,t,p,120,()=>{});
 A.equal(p.blocked,0);A.equal(p.work,1);
 A.ok(org.funds<money);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-emergent-npc-'));
 try{
  const file=Path.join(dir,'save.json'),s=fresh(193399);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const before=FS.readFileSync(file,'utf8');
  const read={id:'real_initiatives_read_0001',mode:'rule',
   system:'world',operation:'initiativesStatus',params:{}};
  const response=Turn.execute(file,read);
  A.equal(response.applied,false);
  A.deepEqual(response.output.rules.knownWork,[]);
  A.equal(FS.readFileSync(file,'utf8'),before);
  const fake={id:'fake_initiatives_result_0001',mode:'rule',
   system:'world',operation:'initiativesStatus',
   params:{forceDiscovery:'legendary first circle academy replacement'}};
  A.throws(()=>Turn.execute(file,fake),/accepts no hidden plans/);
  A.equal(FS.readFileSync(file,'utf8'),before);
  A.equal(Turn.execute(file,read).applied,false);
  A.equal(FS.readFileSync(file,'utf8'),before);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Source-attested evolving NPC trade methods: real costs, failure and delayed news; voluntary training rivals rise, regress or surpass old institutes without granting free power');
