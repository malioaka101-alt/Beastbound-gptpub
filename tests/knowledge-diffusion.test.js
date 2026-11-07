'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path'),
 Crypto=require('node:crypto'),E=require('../engine.js'),W=require('../rules/world'),
 S=require('../world/simulation'),D=require('../world/knowledge-diffusion'),
 I=require('../world/agent-initiatives'),Atlas=require('../world/atlas'),
 Turn=require('../scripts/chat-turn.js');
const sha=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fresh=seed=>E.newGame({seed,name:'Unranked Crossborder Worker',path:'undecided'});
function long(seed,days=1460){const s=fresh(seed);W.advance(s,days);return s;}
{
 const s=fresh(193501),world=S.peek(s);
 const saved=E.exportGame(s),rng=s.rngState;
 const report=S.publicDiffusion(s,{});
 A.equal(report.polity,'Reedmarch Compact');
 A.deepEqual(report.publishedAdoptions,[]);
 A.equal(E.exportGame(s),saved);A.equal(s.rngState,rng);
 A.throws(()=>S.publicDiffusion(s,{inventNewSpell:'free archmage rank'}),/accepts no invented sources/);
 A.equal(E.exportGame(s),saved);
 const t=D.seed(world);
 A.equal(Object.keys(t.slots).length,3);
 A.equal(t.records.length,0);
 for(const c of D.PATHS){
  const r=Atlas.tradeRoutes.find(x=>x.id===c.routeId);
  A.ok(r);
  A.equal(Atlas.I[c.institution].polity,c.destination);
  A.equal(world.notables[c.reader].polity,c.destination);
  A.equal([r.a,r.b].includes(c.destination),true);
  A.equal([r.a,r.b].includes(I.SOURCES[c.source].polity),true);
  A.equal(t.slots[c.id].state,'unaware');
 }
 A.equal(E.exportGame(s),saved);
}
{
 const a=long(193511),b=long(193511),w=a.table.realm,t=w.knowledgeDiffusion;
 A.deepEqual(w,b.table.realm);
 A.equal(t.version,1);
 A.equal(Object.keys(t.slots).length,3);
 A.ok(t.counter>=t.records.length);
 for(const entry of t.records){
  A.ok(['courier-arrival','replication-failed','method-adopted','adoption-lapsed'].includes(entry.kind),entry.kind);
  const original={id:entry.id,kind:entry.kind,day:entry.day,month:entry.month,
   source:entry.source,originId:entry.originId,originPolity:entry.originPolity,
   destination:entry.destination,readerId:entry.readerId,
   readerName:entry.readerName,routeId:entry.routeId,
   institutionId:entry.institutionId,
   sourceAttestationHash:entry.sourceAttestationHash,details:entry.details};
  A.equal(entry.hash,sha(original));
  if(entry.publicText)A.equal(entry.releaseDay,entry.day+8);
  A.equal(entry.source,D.CHANNEL);
 }
 for(const p of Object.values(t.slots)){
  A.equal(p.attempts,p.successes+p.failures);
  A.equal(p.activeBonus,p.state==='adopted');
  A.ok(p.spent>=p.attempts*6);
  if(p.sourceAttestation)A.equal(D.attestation(p),true);
 }
 for(const n of Object.values(w.notables)){
  A.equal(n.discipline.stage,0);
  A.ok(n.professional.rank<=3);
 }
 A.equal(a.player.family,null);
 A.equal(a.player.arcane.circles,0);
 A.equal(a.table.meridianTechniques,undefined);
 A.equal(S.publicDiffusion(a).publishedAdoptions.every(x=>x.destination==='Reedmarch Compact'),true);
}
{
 let adopters=0,failures=0,foreign=0;
 for(const seed of [193507,193515,193523,193531,193539,193547]){
  const s=long(seed,1800),w=s.table.realm,t=w.knowledgeDiffusion;
  adopters+=Object.values(t.slots).reduce((n,x)=>n+x.successes,0);
  failures+=Object.values(t.slots).reduce((n,x)=>n+x.failures,0);
  foreign+=Object.values(t.slots).filter(x=>x.sourceAttestation).length;
  for(const slot of Object.values(t.slots)){
   if(slot.sourceAttestation){
    A.ok(slot.sourceAttestation.publishedOn>slot.sourceAttestation.day);
    A.equal(D.attestation(slot),true);
    A.equal(slot.state==='adopted',slot.activeBonus);
   }
  }
 }
 A.ok(foreign>0,'Foreign practical work must be able to travel from genuinely published origins');
 A.ok(adopters>0,'Local professional may independently reproduce foreign technical methods');
 A.ok(failures>0,'Local adaptation of foreign knowledge must also be able to fail');
}
{
 // Never manufacture an import while the real cross-border route is closed,
 // even if the original worker's successful fieldbook is already published.
 let target=null;
 for(let seed=193580;seed<193640;seed++){
  const s=long(seed,540);
  const w=s.table.realm;
  if(D.genuinePublished(w,D.PATHS[0],Math.floor(s.world.minutes/1440))){
   target=s;break;
  }
 }
 A.ok(target,'A true source-tested Reedmarch field report should eventually be published');
 const w=target.table.realm,t=D.seed(w),
  spec=D.PATHS[0],slot=t.slots[spec.id],route=w.routes[spec.routeId];
 // An isolated disposable importer ledger begins with no previous attempts;
 // the original earlier NPC invention and dated public report remain real.
 w.knowledgeDiffusion=t;
 const today=Math.floor(target.world.minutes/1440);
 // An isolated new local reader has not previously imported this report.
 slot.state='unaware';slot.sourceAttestation=null;slot.sourceAttestationHash=null;
 route.disrupted=true;route.flow=0;
 const before=JSON.stringify(slot),buyer=w.institutions[spec.institution].funds;
 D._debug.monthSlot(w,t,slot,spec,today+1,()=>{});
 A.equal(JSON.stringify(slot),before);
 A.equal(w.institutions[spec.institution].funds,buyer);
 route.disrupted=false;route.flow=60;route.risk=20;
 D._debug.monthSlot(w,t,slot,spec,today+2,()=>{});
 A.equal(slot.state,'heard');
 A.equal(slot.attempts,0);A.equal(slot.spent,0);
 A.equal(D.attestation(slot),true);
 const source=slot.sourceAttestation;
 A.equal(source.sourcePolity,'reedmarch');
 A.equal(source.hash,D.genuinePublished(w,spec,today+2).hash);
 A.equal(slot.history.at(-1).kind,'courier-arrival');
}
{
 // A currently adopted method can go unused if its route is disrupted long
 // enough, and capacity is lost rather than receiving a permanent +1 trophy.
 let found=null;
 for(let seed=193640;seed<193730&&!found;seed++){
  const s=long(seed,1110),t=s.table.realm.knowledgeDiffusion;
  const slot=Object.values(t.slots).find(x=>x.state==='adopted');
  if(slot)found={s,slot,spec:D.PATHS.find(x=>x.id===slot.id)};
 }
 A.ok(found,'At least one genuine source-backed cross-border adoption should occur');
 const {s,slot,spec}=found,w=s.table.realm,t=w.knowledgeDiffusion,
  route=w.routes[spec.routeId],org=w.institutions[spec.institution];
 A.equal(slot.activeBonus,true);
 const beforeCapacity=org.capacity;
 route.disrupted=true;route.flow=0;
 org.funds=60; // A supported local school keeps locally reproduced expertise.
 D._debug.monthSlot(w,t,slot,spec,1111,()=>{});
 D._debug.monthSlot(w,t,slot,spec,1141,()=>{});
 A.equal(slot.state,'adopted');A.equal(slot.decayMonths,0);
 A.equal(slot.activeBonus,true);
 org.funds=20; // Extended isolation plus genuine depleted support causes a lapse.
 D._debug.monthSlot(w,t,slot,spec,1171,()=>{});
 A.equal(slot.state,'adopted');A.equal(slot.decayMonths,1);
 D._debug.monthSlot(w,t,slot,spec,1201,()=>{});
 A.equal(slot.state,'lapsed');A.equal(slot.activeBonus,false);
 A.equal(org.capacity,Math.max(0,beforeCapacity-1));
 A.ok(slot.history.some(x=>x.kind==='adoption-lapsed'));
 const record=t.records.at(-1);
 A.equal(record.kind,'adoption-lapsed');
 A.equal(record.details.routeDisrupted,true);
 A.equal(s.player.arcane.circles,0);
 A.equal(s.table.meridianTechniques,undefined);
 // Restoration is possible, but requires real work and a new independent
 // verification rather than automatic re-enrolment.
 route.disrupted=false;route.flow=70;route.risk=20;
 org.status='active';org.funds=80;org.capacity=Math.min(90,org.capacity);
 let attemptsBefore=slot.attempts;
 for(let month=0;month<40&&slot.state!=='adopted';month++){
  D._debug.monthSlot(w,t,slot,spec,1231+month*30,()=>{});
 }
 A.equal(slot.state,'adopted');
 A.equal(slot.activeBonus,true);
 A.ok(slot.attempts>attemptsBefore);
 A.equal(slot.successes>=2,true);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-method-travel-'));
 try{
  const file=Path.join(dir,'world.json'),s=fresh(193799);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const original=FS.readFileSync(file,'utf8');
  const read={id:'public_method_transfer_0001',mode:'rule',
   system:'world',operation:'diffusionStatus',params:{}};
  const r=Turn.execute(file,read);
  A.equal(r.applied,false);
  A.deepEqual(r.output.rules.publishedAdoptions,[]);
  A.equal(FS.readFileSync(file,'utf8'),original);
  A.throws(()=>Turn.execute(file,{id:'invent_method_transfer_0001',mode:'rule',
   system:'world',operation:'diffusionStatus',
   params:{inventedPublishedMethod:'royal bloodline qi strike'}}),
   /accepts no invented sources/);
  A.equal(FS.readFileSync(file,'utf8'),original);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Verified trade-carried NPC knowledge: published source trials, actual cross-border access, funded foreign reproductions, failure, uptake and reversible loss');
