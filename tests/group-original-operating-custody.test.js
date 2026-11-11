'use strict';
// Foundation #18: original voluntary player coin contributions become finite
// group operating capacity, with exact source receipts for all original
// monthly costs. This does not invent a withdrawable coin treasury.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),W=require('../rules/world'),
 G=require('../world/emergent-groups');
const names={name:'Independent Wetland Crossing Resource Circle',
 kind:'voluntary cooperative records and practical community support',
 purpose:'Help people independently share real crossing observations and local field safety knowledge without assuming permission or authority'};
const activity='I personally check the actual river-crossing observations and contribute time toward the open voluntary study circle without claiming guaranteed results.';
function setup(seed){
 const s=E.newGame({seed,name:'Disposable Original Operating Account',path:'undecided'});
 const created=R.act(s,{system:'social',operation:'formGroup',params:names});
 const e=G.lookup(s.table.realm,created.id);
 A.ok(e);
 A.equal(e.operatingAccount.anchor.amount,0);
 A.equal(G.verifyOperatingAccount(e),true);
 A.equal(G.originalOperatingHistory(s.table.realm,e.id).movements.length,0);
 return {s,e,w:s.table.realm};
}
{
 const {s,e,w}=setup(987415);
 const opening=E.exportGame(s),playerBefore=s.player.coins;
 const donation=R.act(s,{system:'social',operation:'groupContribute',
  params:{groupId:e.id,activity,coins:5}});
 A.equal(donation.spentCoins,5);
 A.equal(s.player.coins,playerBefore-5);
 A.equal(e.funds,5);
 A.equal(e.operatingAccount.anchor.amount,0);
 A.equal(e.operatingAccount.movements.length,1);
 let donationSource=e.operatingAccount.movements[0];
 A.equal(donationSource.kind,'original-voluntary-contribution');
 A.equal(donationSource.delta,5);
 A.equal(donationSource.before,0);
 A.equal(donationSource.after,5);
 A.equal(donationSource.source.playerTalonsBefore,playerBefore);
 A.equal(donationSource.source.playerTalonsAfter,s.player.coins);
 A.equal(donationSource.source.originalAction.details.groupId,e.id);
 A.equal(G.verifyOperatingAccount(e),true);
 A.ok(E.exportGame(s)!==opening);
 const groupRng=w.emergentGroups.rngState,snapshot=E.exportGame(s);
 A.throws(()=>R.act(s,{system:'social',operation:'groupContribute',
  params:{groupId:e.id,activity,coins:s.player.coins+1}}),
  /does not own the proposed real funds/);
 A.equal(E.exportGame(s),snapshot);
 A.equal(w.emergentGroups.rngState,groupRng);
 R.act(s,{system:'social',operation:'groupContribute',
  params:{groupId:e.id,activity:'I independently record more actual river observations and give an additional work session without contributing other funds.',coins:0}});
 A.equal(e.operatingAccount.movements.length,2);
 A.equal(e.operatingAccount.movements[1].delta,0);
 A.equal(e.operatingAccount.movements[1].after,5);
 const cashAfter=s.player.coins,beforeMonthly=e.funds;
 W.advance(s,30);
 A.equal(s.player.coins,cashAfter);
 A.ok(e.funds<beforeMonthly);
 A.equal(G.verifyOperatingAccount(e),true);
 A.equal(G.validate(e),true);
 const history=G.originalOperatingHistory(w,e.id);
 A.equal(history.openingBalance,0);
 A.equal(history.currentOperatingCapacity,e.funds);
 A.equal(history.notWithdrawableTalons,true);
 A.equal(history.noInventedMaterialProperty,true);
 const kinds=history.movements.map(x=>x.kind);
 A.equal(kinds.filter(k=>k==='original-voluntary-contribution').length,2);
 A.equal(kinds.filter(k=>k==='original-independent-work-cost').length,1);
 A.equal(kinds.filter(k=>k==='original-monthly-upkeep').length,1);
 A.equal(history.movements.reduce((v,x)=>v+x.delta,history.openingBalance),e.funds);
 A.equal(e.operatingAccount.movements[2].source.originalReview.details.actualFundsSpent,
  -e.operatingAccount.movements[2].delta);
 const state=E.exportGame(s),reloaded=E.importGame(state);
 A.equal(G.validate(G.lookup(reloaded.table.realm,e.id)),true);
 A.deepEqual(G.originalOperatingHistory(reloaded.table.realm,e.id),history);
 A.equal(E.exportGame(reloaded),state);
 const proof=e.operatingAccount.movements[2].hash;
 e.operatingAccount.movements[2].source.originalReview.details.actualFundsSpent=777;
 A.equal(G.validate(e),false);
 A.equal(e.operatingAccount.movements[2].hash,proof);
}
{
 const {s,e,w}=setup(987416);
 R.act(s,{system:'social',operation:'groupContribute',
  params:{groupId:e.id,activity,coins:4}});
 A.equal(e.funds,4);
 const oldFunds=e.funds,oldPlayer=s.player.coins;
 // Legacy saves have a truthful live balance but no old transaction list.
 delete e.operatingAccount;
 const original=E.exportGame(s);
 A.equal(G.originalOperatingHistory(w,e.id).movements.length,0);
 A.equal(E.exportGame(s),original,
  'Reading earlier saves must not silently invent historical receipts');
 R.act(s,{system:'social',operation:'groupContribute',
  params:{groupId:e.id,activity:'I donate one more genuine Talon alongside source-observed crossing work in the same original circle.',coins:1}});
 A.equal(e.operatingAccount.anchor.amount,oldFunds);
 A.match(e.operatingAccount.anchor.reason,/past transaction provenance was not recorded/);
 A.equal(e.operatingAccount.movements.length,1);
 A.equal(e.operatingAccount.movements[0].delta,1);
 A.equal(e.funds,oldFunds+1);
 A.equal(s.player.coins,oldPlayer-1);
 A.equal(G.verifyOperatingAccount(e),true);
 const saved=E.exportGame(s),reload=E.importGame(saved);
 A.deepEqual(G.originalOperatingHistory(reload.table.realm,e.id),
  G.originalOperatingHistory(w,e.id));
}
console.log('Original group operating custody: every real donated Talon debit and independently reviewed monthly operating cost is attested in the actual association, conserving limited capacity without inventing cash withdrawals, salaries, property, legal claims, history or extra dice');
