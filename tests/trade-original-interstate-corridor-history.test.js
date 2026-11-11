'use strict';
// #18 genuine original merchant route disruption and opening are sourced
// from exactly three ORIGINAL world draws and original historic diplomacy.
// This is not a new war, trade agreement, route, coin or random check.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine.js'),R=require('../rules'),Realm=require('../world/simulation'),
 Atlas=require('../world/atlas'),W=require('../rules/world'),
 FS=require('node:fs'),OS=require('node:os'),Path=require('node:path'),
 Turn=require('../scripts/chat-turn.js');
const sha=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const local=r=>r.a==='reedmarch'||r.b==='reedmarch';
const act=(s,routeId,extra={})=>R.act(s,{
 system:'world',operation:'tradeRouteHistory',params:{routeId,...extra}});
const draw=r=>{
 let x=r.rngState>>>0;
 x^=x<<13;x^=x>>>17;x^=x<<5;
 r.rngState=x>>>0||0x593f56bc;
 return r.rngState/4294967296;
};
function fixture(){
 // Disposable original world seeds, never an NPC- or GM-chosen outcome.
 // Artificially saturated initial corridor risks are a test pressure
 // fixture only. Actual ORIGINAL weather/trade draws still determine
 // whether a closure really occurs.
 for(let seed=998131;seed<998145;seed++){
  const s=E.newGame({seed,name:'Disposable Interpolity Trade Evidence',path:'undecided'}),
   w=Realm.ensure(s);
  const clock=structuredClone(s);
  for(const route of Atlas.tradeRoutes)
   w.routes[route.id].risk=100;
  const priorPlayerCoins=s.player.coins;
  W.advance(s,30);E.advance(clock,30*1440);
  A.equal(s.rngState,clock.rngState,
   'The source archive never draws a player or encounter RNG in addition to original daily passage');
  A.equal(s.player.coins,priorPlayerCoins);
  const choices=Atlas.tradeRoutes.filter(r=>local(r)&&
   w.routes[r.id].originalChanges?.length===1&&
   !Object.values(w.diplomacy).some(d=>
    ((d.a===r.a&&d.b===r.b)||(d.b===r.a&&d.a===r.b))&&
    d.status==='war'));
  if(choices.length)return {s,w,r:choices[0],clock,priorPlayerCoins};
 }
 throw Error('No deterministic original local weather route closure arose from tested seeds');
}
{
 const {s,w,r,clock,priorPlayerCoins}=fixture(),v=w.routes[r.id],
  first=v.originalChanges[0],q=first.source;
 A.equal(first.origin,Realm.ROUTE_CHANGE_SOURCE);
 A.equal(first.disrupted,true);
 A.equal(q.disruptedBefore,false);
 A.equal(q.disruptedAfter,true);
 A.equal(q.originalNotice.releaseDay,q.day+6);
 A.equal(q.noNewRouteGoodsOrMoney,true);
 A.equal(q.noForeignOfficerConsentOrTreaty,true);
 A.equal(q.originalDiplomaticStatus==='not-tracked'||
  ['cooperation','peace','war','truce','strained'].includes(q.originalDiplomaticStatus),true);
 A.equal(q.originalDiplomaticStatus==='war'&&q.warAtReview,false,
  'This original weather-grounded local route is not claimed to be a forced war closure');
 A.equal(v.risk,q.riskAfter);
 A.equal(v.flow,q.flowAfter);
 A.equal(Realm.verifyOriginalRouteHistory(w,r),true);
 const rng={rngState:q.rngBefore};
 A.equal(Math.floor(draw(rng)*11),q.weatherRoll);
 A.equal(Math.floor(draw(rng)*11)-5,q.riskRoll);
 A.equal(Math.floor(draw(rng)*19)-9,q.flowRoll);
 A.equal(rng.rngState,q.rngAfter);
 const now=Math.floor(s.world.minutes/1440);
 A.equal(now,q.day);
 let seen=act(s,r.id);
 A.equal(seen.locallyKnownPublishedChanges.length,0,
  'Actual original news must await the original six-day merchant bulletin release');
 const before=E.exportGame(s),rngPlayer=s.rngState;
 A.throws(()=>act(s,r.id,{inventSignedTreaty:true}),
  /Only a real original local corridor ID/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rngPlayer);
 A.throws(()=>act(s,'trade_9999'),/genuinely local/);
 W.advance(s,6);E.advance(clock,6*1440);
 seen=act(s,r.id);
 A.equal(seen.locallyKnownPublishedChanges.length,1);
 A.equal(seen.locallyKnownPublishedChanges[0].report,q.originalNotice.text);
 A.equal(seen.locallyKnownPublishedChanges[0].sourceHash,first.sourceHash);
 A.equal(seen.locallyKnownPublishedChanges[0].noTreatyConcluded,true);
 A.equal(s.rngState,clock.rngState);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'beastbound-route-'));
 try{
  const file=Path.join(dir,'test.json'),baseline=E.exportGame(s)+'\n';
  FS.writeFileSync(file,baseline);
  const read=Turn.execute(file,{
   id:'real_original_trade_read_0001',mode:'rule',
   system:'world',operation:'tradeRouteHistory',
   params:{routeId:r.id}});
  A.equal(read.applied,false);
  A.equal(read.output.rules.locallyKnownPublishedChanges.length,1);
  A.equal(FS.readFileSync(file,'utf8'),baseline);
  A.throws(()=>Turn.execute(file,{
   id:'fake_original_route_funds_0001',mode:'rule',
   system:'world',operation:'tradeRouteHistory',
   params:{routeId:r.id,forceMerchantSale:true}}),
  /Only a real original local corridor ID/);
  A.equal(FS.readFileSync(file,'utf8'),baseline);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
 // An actual next original month, with risk no longer dangerously
 // elevated, reopens the weather-closed corridor without additional roll.
 v.risk=0;
 W.advance(s,24);E.advance(clock,24*1440);
 A.equal(v.originalChanges.length,2,
  'The real next world-month result should independently reopen a weather-closed local route');
 const second=v.originalChanges[1];
 A.equal(second.disrupted,false);
 A.equal(second.day,60);
 A.equal(second.source.disruptedBefore,true);
 A.equal(second.source.disruptedAfter,false);
 A.equal(second.source.originalNotice.releaseDay,66);
 A.equal(Realm.verifyOriginalRouteHistory(w,r),true);
 A.equal(act(s,r.id).locallyKnownPublishedChanges.length,1,
  'Merchant reopening cannot be public before its original notice delay');
 W.advance(s,6);E.advance(clock,6*1440);
 A.equal(act(s,r.id).locallyKnownPublishedChanges.length,2);
 A.equal(s.rngState,clock.rngState);
 A.equal(s.player.coins,priorPlayerCoins);
 const verified=E.exportGame(s),restored=E.importGame(verified);
 A.equal(E.exportGame(restored),verified);
 A.deepEqual(act(restored,r.id),act(s,r.id));
 const originalHash=first.sourceHash;
 first.source.weatherRoll=first.source.weatherRoll===10?0:10;
 first.sourceHash=sha(first.source);
 A.equal(Realm.verifyOriginalRouteHistory(w,r),false,
  'Even recomputed seals cannot transform a real original weather draw into a fabricated closure');
 first.sourceHash=originalHash;
 first.source.weatherRoll=q.weatherRoll; // same referenced original; restore from verified copy below.
 const originalSource=Realm.peek(restored).routes[r.id].originalChanges[0].source;
 v.originalChanges[0]=structuredClone(Realm.peek(restored).routes[r.id].originalChanges[0]);
 A.equal(Realm.verifyOriginalRouteHistory(w,r),true);
 const legacy=E.importGame(verified),lroute=legacy.table.realm.routes[r.id];
 delete lroute.originalChanges;
 A.equal(Realm.verifyOriginalRouteHistory(legacy.table.realm,r),true);
 A.equal(act(legacy,r.id).locallyKnownPublishedChanges.length,0,
  'Unrecorded old history must never be manufactured from a current saved route');
 A.ok(originalSource.originalNotice.text.length>40);
}
console.log('Actual original world political and weather trade corridor disruption: original independent RNG replay, diplomatic historical causality, real routing/flow, true delayed merchant notice, eventual real reopening, no fake treaty/payments, read-only private chat, durable source-verifiable save and honest legacy gap');
