'use strict';
// Disposable, authentic source-receipt fixtures. NPC peers are genuinely two
// separate people and their collaboration needs separate informed consent.
const assert=require('node:assert/strict'),E=require('../engine.js'),
 W=require('../rules/world'),S=require('../world/simulation'),
 Amb=require('../world/adaptive-ambitions'),Peer=require('../world/professional-peers');
const create=seed=>E.newGame({seed,name:'Independent Peer Community Tester'});
function wanted(lo,hi){
 for(let i=1;i<90000;i++){const rng={rngState:i},v=Peer._debug.random(rng);if(v>=lo&&v<hi)return i;}
 throw Error('No independent bounded world random source matched');
}
function start(seed=704001){
 const s=create(seed),w=S.ensure(s),research=Amb.ensure(w),
  p=research.people.reedmarch_field,org=w.institutions[p.organisationId];
 w.ecosystems.whisperfen.pressure=83;w.ecosystems.whisperfen.quality=50;
 for(const r of Object.values(w.routes)){r.disrupted=false;r.risk=10;r.flow=65;}
 p.focus={kind:'habitat_care',targetId:'whisperfen',startedMonth:0,
  initialContext:{pressure:83,quality:50},purpose:Amb.TARGETS.habitat_care};
 p.work=2;p.spent=4;org.funds=86;
 research.rngState=wanted(.95,1);
 const news=[];
 Amb._debug.act(w,research,p,20,x=>{w.chronicle.push({...x,publiclyKnown:true});news.push(x);});
 assert.equal(news.length,1);
 const source=research.records.at(-1);
 assert.equal(source.kind,'verified-effort');
 assert.equal(source.details.roll,20);
 assert.equal(source.details.changed,true);
 assert.equal(Peer.sourced(w,source,27),false);
 assert.equal(Peer.sourced(w,source,28),true);
 const t=Peer.ensure(w),pair=t.pairs.reedmarch_peer_pair;
 return {s,w,t,pair,source};
}
function begin(kind,seed=704001){
 const x=start(seed);
 x.t.rngState=kind==='join'?wanted(0,.43):
  kind==='compare'?wanted(.43,.78):wanted(.78,1);
 Peer._debug.initiate(x.w,x.t,x.pair,28,()=>{});
 assert.equal(x.pair.pending?.kind||null,kind==='join'?'joint_offer':
  kind==='compare'?'independent_comparison':null);
 return x;
}
function finish(x,success,day=40){
 for(let i=0;i<2;i++)Peer._debug.undertake(x.w,x.t,x.pair,day+6*i,()=>{});
 x.t.rngState=success?wanted(.95,1):wanted(0,.05);
 const notices=[];Peer._debug.undertake(x.w,x.t,x.pair,day+12,
  n=>{x.w.chronicle.push({...n,publiclyKnown:true});notices.push(n);});
 return notices;
}
{
 const s=create(704002),saved=E.exportGame(s),rng=s.rngState;
 assert.deepEqual(S.publicPeers(s).verifiedPeerWork,[]);
 assert.throws(()=>S.publicPeers(s,{forceLove:true}),/accepts no hidden personal intentions/);
 assert.equal(E.exportGame(s),saved);assert.equal(s.rngState,rng);
 const t=Peer.seed(S.peek(s));
 assert.equal(Peer.GROUPS.length,24);
 assert.equal(Object.keys(t.pairs).length,24);
 for(const pair of Object.values(t.pairs)){
  assert.equal(pair.people.length,2);assert.notEqual(pair.people[0],pair.people[1]);
  assert.equal(S.peek(s).notables[pair.people[0]].polity,pair.polity);
  assert.equal(S.peek(s).notables[pair.people[1]].polity,pair.polity);
  assert.equal(pair.trust,0);assert.equal(pair.contrast,0);
 }
 assert.equal(E.exportGame(s),saved);
}
{
 const x=start(704003);
 assert.equal(Peer.sourced(x.w,{...x.source,hash:'fabricated'},28),false);
 assert.equal(Peer.sourced(x.w,{...x.source,details:{...x.source.details,success:false}},28),false);
 const real=x.w.chronicle.pop();
 assert.equal(Peer.sourced(x.w,x.source,28),false);
 x.w.chronicle.push(real);
 assert.equal(Peer.sourced(x.w,x.source,28),true);
}
{
 const x=begin('none',704004);
 assert.equal(x.pair.pending,null);
 assert.equal(x.pair.trust,0);assert.equal(x.pair.contrast,0);
 assert.equal(x.t.records.at(-1).kind,'no-engagement');
 assert.equal(x.t.records.at(-1).notice,null);
}
{
 const x=begin('join',704005),org=x.w.institutions[x.w.notables.reedmarch_civic.institution];
 const before=org.funds;
 x.t.rngState=wanted(.9,1);
 Peer._debug.reply(x.w,x.t,x.pair,34,()=>{});
 assert.equal(x.pair.pending,null);
 assert.equal(x.pair.trust,0);assert.equal(x.pair.contrast,0);
 assert.equal(x.t.records.at(-1).kind,'personal-response');
 assert.equal(x.t.records.at(-1).details.decision,'declined');
 assert.equal(org.funds,before);
}
{
 const x=begin('join',704006);
 const a=x.w.notables.reedmarch_field,b=x.w.notables.reedmarch_civic,
  oa=x.w.institutions[a.institution],ob=x.w.institutions[b.institution],
  original=[oa.funds,ob.funds],playerRng=x.s.rngState;
 x.t.rngState=wanted(0,.5);
 Peer._debug.reply(x.w,x.t,x.pair,34,()=>{});
 assert.equal(x.pair.pending.stage,'checking');
 assert.equal(x.pair.pending.choices[0].actorId,a.id);
 assert.equal(x.pair.pending.choices[0].choice,'willing');
 const news=finish(x,true,40);
 assert.equal(news.length,1);assert.equal(news[0].releaseDay,60);
 assert.equal(x.pair.pending,null);
 assert.equal(x.pair.collaborations,1);assert.equal(x.pair.trust,1);
 assert.equal(x.pair.comparisons,0);assert.equal(x.pair.contrast,0);
 const result=x.t.records.at(-1);
 assert.equal(result.kind,'verified-cooperation');
 assert.deepEqual(result.details.participants,[a.id,b.id]);
 assert.equal(result.details.roll,20);
 assert.equal(result.details.paidSessions,3);
 assert.equal(result.details.totalCost,12);
 assert.equal(oa.funds,original[0]-6);assert.equal(ob.funds,original[1]-6);
 assert.equal(x.s.rngState,playerRng);
 assert.equal(x.s.player.family,null);
 assert.equal(x.s.player.arcane.circles,0);
 assert.deepEqual(S.publicPeers(x.s).verifiedPeerWork,[]);
 W.advance(x.s,60);
 assert.ok(S.publicPeers(x.s).verifiedPeerWork.some(v=>
  v.kind==='verified-cooperation'&&v.people.includes(a.name)&&v.people.includes(b.name)));
}
{
 const x=begin('compare',704007),a=x.w.notables.reedmarch_field,
  b=x.w.notables.reedmarch_civic,
  oa=x.w.institutions[a.institution],ob=x.w.institutions[b.institution],
  original=[oa.funds,ob.funds],rng=x.s.rngState;
 assert.deepEqual(x.pair.pending.choices,[]);
 const news=finish(x,true,34);
 assert.equal(news.length,1);
 assert.equal(x.pair.comparisons,1);assert.equal(x.pair.contrast,1);
 assert.equal(x.pair.collaborations,0);assert.equal(x.pair.trust,0);
 assert.equal(x.t.records.at(-1).kind,'verified-alternative');
 assert.equal(oa.funds,original[0]);
 assert.equal(ob.funds,original[1]-6);
 assert.equal(x.s.rngState,rng);
 assert.equal(x.s.player.family,null);
}
{
 const x=begin('compare',704008),b=x.w.notables.reedmarch_civic,
  org=x.w.institutions[b.institution],capacity=org.capacity;
 const report=finish(x,false,34);
 assert.equal(report.length,1);
 assert.equal(x.pair.failedWork,1);assert.equal(x.pair.contrast,0);
 assert.equal(org.capacity,capacity);
 assert.equal(x.t.records.at(-1).kind,'failed-peer-review');
 assert.equal(x.t.records.at(-1).details.roll,1);
}
{
 const x=begin('join',704009);
 x.t.rngState=wanted(0,.5);
 Peer._debug.reply(x.w,x.t,x.pair,34,()=>{});
 const fund=x.w.institutions[x.w.notables.reedmarch_field.institution];
 fund.funds=4;
 for(let i=0;i<4;i++)Peer._debug.undertake(x.w,x.t,x.pair,40+i*6,()=>{});
 assert.equal(x.pair.pending,null);
 assert.equal(x.pair.collaborations,0);
 assert.equal(x.t.records.at(-1).kind,'attempt-abandoned');
 assert.equal(fund.funds,4);
}
console.log('24 peer pairs: authentic authored work, abstention, individual consent, cooperative training, independent comparison, real failure and closure costs');
