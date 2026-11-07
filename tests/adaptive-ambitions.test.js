'use strict';
// NPCs are independent agents, not static trainers or guaranteed background
// winners. Every logged goal, cost, test, course correction and changed local
// value comes from real initial world records, never an active campaign save.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),Crypto=require('node:crypto');
const E=require('../engine.js'),W=require('../rules/world'),S=require('../world/simulation'),
 Atlas=require('../world/atlas'),Amb=require('../world/adaptive-ambitions'),
 Turn=require('../scripts/chat-turn.js');
const sha=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fresh=seed=>E.newGame({seed,name:'Unaffiliated Evolving World Resident',path:'undecided'});
const fixture=(seed=502100)=>{const s=fresh(seed),w=S.ensure(s),t=Amb.ensure(w);return {s,w,t}};
function desiredRoll(want){
 for(let seed=1;seed<50000;seed++){
  const t={rngState:seed};
  const x=Amb._debug.random(t),roll=1+Math.floor(x*20);
  if(roll===want)return seed;
 }
 throw Error('No deterministic world random seed for desired test roll');
}
function prepare(w,t,p,kind,targetId){
 const n=w.notables[p.actorId],org=w.institutions[p.organisationId];
 p.focus={kind,targetId,startedMonth:w.ticks.months,
  initialContext:Amb.options(w,n,org).find(x=>x.kind===kind&&x.targetId===targetId)?.snapshot,
  purpose:Amb.TARGETS[kind]};
 p.work=2;p.spent=4;p.blocked=0;org.funds=90;
 return {n,org};
}
const truthful=record=>sha({id:record.id,day:record.day,month:record.month,
 actorId:record.actorId,name:record.name,polity:record.polity,
 profession:record.profession,employerId:record.employerId,
 kind:record.kind,source:record.source,details:record.details});
{
 const s=fresh(502101),before=E.exportGame(s),rng=s.rngState;
 const result=S.publicAmbitions(s);
 A.equal(result.polity,'Reedmarch Compact');
 A.deepEqual(result.publicDeeds,[]);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 A.throws(()=>S.publicAmbitions(s,{forceLegendaryBloodline:true}),/accepts no chosen outcomes/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const world=S.peek(s),seeded=Amb.seed(world);
 A.equal(Object.keys(seeded.people).length,48);
 A.equal(seeded.records.length,0);
 A.equal(seeded.version,1);
 for(const p of Object.values(seeded.people)){
  const n=world.notables[p.actorId];
  A.ok(n);A.equal(n.polity,p.polity);
  A.equal(n.institution,p.organisationId);
  A.equal(p.personalGoal,n.life.goal);
  A.equal(p.focus,null);
  A.ok(p.decisionPhase>=0&&p.decisionPhase<4);
 }
 A.equal(E.exportGame(s),before);
}
{
 const a=fresh(502102),b=fresh(502102);
 W.advance(a,1200);W.advance(b,1200);
 A.deepEqual(a.table.realm,b.table.realm,'World agent plans and outcomes must replay deterministically');
 const w=a.table.realm,t=w.adaptiveAmbitions;
 A.equal(Object.keys(t.people).length,48);
 A.equal(t.counter>=t.records.length,true);
 const active=Object.values(t.people);
 A.ok(active.some(x=>x.successes>0),'Ordinary NPCs must actually complete useful projects');
 A.ok(active.some(x=>x.failures>0),'Independent NPCs must be able to fail meaningful work');
 A.ok(active.some(x=>x.pivots>0),'NPCs must be able to change direction as circumstances change');
 for(const p of active){
  const n=w.notables[p.actorId];
  A.equal(p.pivots>=0,true);A.equal(p.successes>=0,true);
  A.ok(p.work>=0&&p.work<=3);
  A.ok(p.spent>=0);
  A.equal(n.life.currentAmbition?.kind||null,p.focus?.kind||null);
 }
 for(const r of t.records){
  A.ok(['new-plan','revised-plan','verified-effort','failed-effort'].includes(r.kind));
  A.equal(r.hash,truthful(r));
  A.ok(r.actorId in w.notables);
  A.equal(r.source,Amb.SOURCE);
  if(r.publicText)A.equal(r.releaseDay,r.day+8);
  A.ok(r.details);
 }
 A.equal(a.player.family,null);
 A.equal(a.player.arcane.circles,0);
 A.equal(a.table.meridianTechniques,undefined);
 A.ok(w.governance.asterwyn.holder.length>=6);
}
{
 // Actual successful wetland field care improves only the real observed
 // local environment; no free beast evolution or invented heroic deed.
 const {s,w,t}=fixture(502103),p=t.people.reedmarch_field;
 const eco=w.ecosystems.whisperfen;
 for(const reg of Atlas.regions.filter(x=>x.polity==='reedmarch'))
  {w.ecosystems[reg.id].pressure=4;w.ecosystems[reg.id].quality=95;}
 eco.pressure=85;eco.quality=51;
 for(const route of Atlas.tradeRoutes.filter(x=>x.a==='reedmarch'||x.b==='reedmarch')){
  w.routes[route.id].risk=15;w.routes[route.id].disrupted=false;w.routes[route.id].flow=70;
 }
 const {org,n}=prepare(w,t,p,'habitat_care','whisperfen');
 A.equal(Amb.options(w,n,org)[0].targetId,'whisperfen');
 const initial=s.rngState,cost=org.funds,prior=eco.pressure,quality=eco.quality;
 t.rngState=desiredRoll(20);
 const news=[];Amb._debug.act(w,t,p,122,x=>news.push(x));
 A.equal(eco.pressure,prior-4);
 A.equal(eco.quality,quality+2);
 A.equal(p.successes,1);A.equal(p.focus,null);
 A.equal(p.work,0);A.equal(p.spent,0);
 A.equal(org.funds,cost-3);
 A.equal(s.rngState,initial);
 A.equal(t.records.at(-1).kind,'verified-effort');
 A.equal(t.records.at(-1).details.roll,20);
 A.equal(t.records.at(-1).details.beforeTarget.pressure,prior);
 A.equal(t.records.at(-1).details.afterTarget.pressure,prior-4);
 A.equal(t.records.at(-1).details.amountSpent,7);
 A.equal(news.length,1);A.equal(news[0].releaseDay,130);
 A.equal(s.player.family,null);
 A.equal(s.table?.meridianTechniques,undefined);
}
{
 // Field people may instead work on a dangerous real passage, but cannot
 // unilaterally end a war or override a blockade.
 const {s,w,t}=fixture(502104),p=t.people.reedmarch_field,route=w.routes.trade_2;
 for(const reg of Atlas.regions.filter(x=>x.polity==='reedmarch'))
  {w.ecosystems[reg.id].pressure=2;w.ecosystems[reg.id].quality=100;}
 for(const r of Atlas.tradeRoutes.filter(x=>x.a==='reedmarch'||x.b==='reedmarch')){
  w.routes[r.id].risk=15;w.routes[r.id].flow=70;w.routes[r.id].disrupted=false;
 }
 route.risk=90;route.flow=3;route.disrupted=true;
 const {org}=prepare(w,t,p,'route_safety','trade_2');
 const old=route.risk,rolls=s.rngState;
 t.rngState=desiredRoll(20);
 Amb._debug.act(w,t,p,122,()=>{});
 A.equal(route.risk,old-4);
 A.equal(route.disrupted,true);
 A.equal(route.flow,3);
 A.equal(s.rngState,rolls);
 A.equal(w.counters.wars,0);
 A.equal(org.funds,87);
}
{
 const {s,w,t}=fixture(502105),p=t.people.reedmarch_civic,n=w.notables.reedmarch_civic,
  org=w.institutions[n.institution],host=w.countries.reedmarch;
 host.legitimacy=27;org.capacity=90;
 const selected=Amb.options(w,n,org)[0];
 A.equal(selected.kind,'civic_audit');
 const govBefore=host.legitimacy,reputation=org.reputation;
 prepare(w,t,p,'civic_audit','reedmarch');
 t.rngState=desiredRoll(20);
 Amb._debug.act(w,t,p,122,()=>{});
 A.equal(org.reputation,Math.min(100,reputation+2));
 // This particular civic worker is attached to an established public
 // body; only truly governmental sponsors can affect state legitimacy.
 const isGov=['civil council','civil court','ministry','beast government','beast civil service'].includes(Atlas.I[n.institution].type);
 A.equal(host.legitimacy,govBefore+(isGov?1:0));
 A.equal(s.player.family,null);
}
{
 // A genuine failed independent check loses the money/time and cannot
 // improve ecology or create public proof of a completed intervention.
 const {s,w,t}=fixture(502106),p=t.people.reedmarch_field;
 for(const r of Atlas.regions.filter(x=>x.polity==='reedmarch'))
  {w.ecosystems[r.id].pressure=5;w.ecosystems[r.id].quality=90;}
 w.ecosystems.whisperfen.pressure=88;
 for(const r of Atlas.tradeRoutes.filter(x=>x.a==='reedmarch'||x.b==='reedmarch'))
  {w.routes[r.id].risk=12;w.routes[r.id].flow=70;w.routes[r.id].disrupted=false;}
 const {org}=prepare(w,t,p,'habitat_care','whisperfen');
 const beforeOrg=org.funds,beforeEco=w.ecosystems.whisperfen.pressure;
 t.rngState=desiredRoll(1);
 Amb._debug.act(w,t,p,122,()=>{});
 A.equal(p.failures,1);A.equal(p.successes,0);
 A.equal(org.funds,beforeOrg-3);
 A.equal(w.ecosystems.whisperfen.pressure,beforeEco);
 A.equal(t.records.at(-1).kind,'failed-effort');
 A.equal(t.records.at(-1).publicText,null);
 A.equal(s.player.arcane.circles,0);
}
{
 // Rational redirection from urgent environmental repair to trade safety
 // because local circumstances REALLY change before the original effort.
 const {w,t}=fixture(502107),p=t.people.reedmarch_field,n=w.notables.reedmarch_field;
 const org=w.institutions[n.institution];
 for(const r of Atlas.regions.filter(x=>x.polity==='reedmarch'))
  {w.ecosystems[r.id].pressure=5;w.ecosystems[r.id].quality=90;}
 w.ecosystems.whisperfen.pressure=82;
 for(const r of Atlas.tradeRoutes.filter(x=>x.a==='reedmarch'||x.b==='reedmarch'))
  {w.routes[r.id].risk=10;w.routes[r.id].flow=70;w.routes[r.id].disrupted=false;}
 prepare(w,t,p,'habitat_care','whisperfen');
 const lostCost=p.spent;org.funds-=lostCost;
 w.ecosystems.whisperfen.pressure=12;w.ecosystems.whisperfen.quality=96;
 const route=w.routes.trade_2;route.risk=98;route.disrupted=true;
 t.rngState=desiredRoll(1);
 Amb._debug.choose(w,t,p,n,org,140);
 A.equal(p.pivots,1);
 A.equal(t.records.some(r=>r.kind==='revised-plan'&&r.details.unrecoveredCosts===lostCost),true);
 A.equal(p.focus?.kind||null,'route_safety');
 A.equal(org.funds,86,'Already consumed resources cannot be refunded by changing plans');
 A.equal(n.life.currentAmbition.kind,'route_safety');
}
{
 // Repeated genuine employer closure causes delay and eventual cancellation,
 // not a free miracle completion or NPC permanently trapped in old plans.
 const {w,t}=fixture(502108),p=t.people.reedmarch_field,n=w.notables.reedmarch_field;
 const org=w.institutions[n.institution];
 for(const r of Atlas.regions.filter(x=>x.polity==='reedmarch'))
  {w.ecosystems[r.id].pressure=5;w.ecosystems[r.id].quality=96;}
 w.ecosystems.whisperfen.pressure=90;
 for(const r of Atlas.tradeRoutes.filter(x=>x.a==='reedmarch'||x.b==='reedmarch'))
  {w.routes[r.id].risk=8;w.routes[r.id].flow=75;w.routes[r.id].disrupted=false;}
 prepare(w,t,p,'habitat_care','whisperfen');org.status='suspended';
 for(let i=0;i<4;i++)Amb._debug.act(w,t,p,250+i*30,()=>{});
 A.equal(p.focus,null);A.equal(p.work,0);
 A.ok(p.pivots>0);A.equal(p.successes,0);
 A.equal(n.life.currentAmbition,undefined);
 A.equal(t.records.at(-1).kind,'revised-plan');
}
{
 // Local published visibility is separate from knowing an NPC's private
 // goals, earlier unverified failures or foreign community secrets.
 const {s,w,t}=fixture(502109),p=t.people.reedmarch_field;
 for(const r of Atlas.regions.filter(x=>x.polity==='reedmarch'))
  {w.ecosystems[r.id].pressure=5;w.ecosystems[r.id].quality=96;}
 w.ecosystems.whisperfen.pressure=85;
 for(const r of Atlas.tradeRoutes.filter(x=>x.a==='reedmarch'||x.b==='reedmarch'))
  {w.routes[r.id].risk=8;w.routes[r.id].flow=75;w.routes[r.id].disrupted=false;}
 prepare(w,t,p,'habitat_care','whisperfen');
 t.rngState=desiredRoll(20);
 const report=[];
 Amb._debug.act(w,t,p,10,e=>{const x={...e,publiclyKnown:true};w.chronicle.push(x);report.push(x);});
 A.equal(report.length,1);
 A.equal(S.publicAmbitions(s).publicDeeds.length,0);
 const local=E.exportGame(s),priorRng=s.rngState;
 A.throws(()=>S.publicAmbitions(s,{publicSecret:true}),/accepts no chosen outcomes/);
 A.equal(E.exportGame(s),local);A.equal(s.rngState,priorRng);
 W.advance(s,18);
 const reports=S.publicAmbitions(s).publicDeeds;
 A.ok(reports.some(x=>x.person===w.notables[p.actorId].name));
 A.ok(!JSON.stringify(reports).includes('currentAmbition'));
 A.ok(!JSON.stringify(reports).includes('rngState'));
 A.ok(!JSON.stringify(reports).includes('amountSpent'));
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-adaptive-agents-'));
 try{
  const file=Path.join(dir,'person.json'),s=fresh(502112);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const before=FS.readFileSync(file,'utf8');
  const read={id:'adaptive_ambition_status_0001',mode:'rule',
   system:'world',operation:'ambitionsStatus',params:{}};
  const result=Turn.execute(file,read);
  A.equal(result.applied,false);A.deepEqual(result.output.rules.publicDeeds,[]);
  A.equal(FS.readFileSync(file,'utf8'),before);
  A.throws(()=>Turn.execute(file,{id:'adaptive_ambition_cheat_0001',
   mode:'rule',system:'world',operation:'ambitionsStatus',
   params:{grantRoyalResearch:'completed'}}),/accepts no chosen outcomes/);
  A.equal(FS.readFileSync(file,'utf8'),before);
  A.equal(Turn.execute(file,read).applied,false);
  A.equal(FS.readFileSync(file,'utf8'),before);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Forty-eight source-grounded independent NPC ambitions react to actual world changes, spend real funds, fail, pivot, and publish only genuine local deeds');
