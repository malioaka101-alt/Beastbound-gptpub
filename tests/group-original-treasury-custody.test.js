'use strict';
// Foundation #18: real original player Talons feed ONE existing voluntary
// association operating balance; independently spent work/upkeep never
// create another wallet, fictitious members, salary or legal authority.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),W=require('../rules/world'),
 G=require('../world/emergent-groups'),Turn=require('../scripts/chat-turn.js');
const act=(s,op,params={})=>R.act(s,{system:'social',operation:op,params});
const names={name:'Volunteer Marsh Crossing Records Circle',
 kind:'independent and open-ended neighbourhood society',
 purpose:'Make real accurate and modest independent marsh route safety notes without asserting inherited privilege or a monopoly over local travellers'};
const activity='I freely try to record safe marsh crossings and contribute limited original money for this genuinely attempted local group work.';
const fresh=(seed)=>E.newGame({seed,name:'Original Association Treasury Test',path:'undecided'});
{
 const s=fresh(998109),form=act(s,'formGroup',names),
  w=s.table.realm,e=G.lookup(w,form.id),initialCoins=s.player.coins,
  first=act(s,'groupTreasuryStatus',{groupId:e.id});
 A.equal(first.currentOperatingFunds,0);
 A.equal(first.knownMovements.length,0);
 A.equal(first.auditedSinceDay,null,
  'Read-only financial inspection cannot invent an earlier donor or original account');
 A.equal(e.treasuryAudit,undefined);
 const safe=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'groupTreasuryStatus',{
  groupId:e.id,authoriseWithdrawal:true}),/accepts only the real founder/);
 A.equal(E.exportGame(s),safe);A.equal(s.rngState,rng);
 const inWorld=act(s,'groupContribute',{groupId:e.id,activity,coins:5});
 A.equal(inWorld.spentCoins,5);
 A.equal(s.player.coins,initialCoins-5);
 A.equal(e.funds,5);
 A.equal(G.verifyTreasuryAudit(e),true);
 let status=act(s,'groupTreasuryStatus',{groupId:e.id});
 A.equal(status.openingBalance,0);
 A.equal(status.earlierMovementsUnreconstructed,false);
 A.equal(status.knownMovements.length,1);
 A.equal(status.knownMovements[0].kind,'personal-original-contribution');
 A.equal(status.knownMovements[0].amount,5);
 A.equal(status.knownMovements[0].balanceAfter,5);
 const event=e.treasuryAudit.receipts[0].source.proof.originalEvent;
 A.equal(event.details.groupId,e.id);
 A.equal(event.details.coins,5);
 A.equal(event.details.actor,s.player.name);
 const afterFunding=E.exportGame(s),afterFundingRng=s.rngState;
 A.throws(()=>G.addTreasuryReceipt(e,{
  kind:'personal-original-contribution',day:w.lastTickDay,amount:5,
  before:e.funds,proof:e.treasuryAudit.receipts[0].source.proof}),
 /original source cannot be spent or received twice|matching original cash movement/);
 A.equal(E.exportGame(s),afterFunding);
 A.equal(s.rngState,afterFundingRng);
 W.advance(s,30);
 A.equal(e.activity.length,0);
 A.equal(e.workSessions,1);
 status=act(s,'groupTreasuryStatus',{groupId:e.id});
 A.deepEqual(status.knownMovements.map(x=>x.kind),[
  'personal-original-contribution',
  'original-independent-work-cost',
  'original-monthly-upkeep'
 ]);
 const [money,work,upkeep]=e.treasuryAudit.receipts;
 A.equal(work.source.proof.originalReview.details.actualFundsSpent,
  work.source.amount);
 A.equal(work.source.proof.originalReviewHash,
  work.source.proof.originalReview.hash);
 A.equal(work.source.before,5);
 A.equal(upkeep.source.amount,1);
 A.equal(upkeep.source.proof.membersAtTick,1);
 A.equal(work.source.before-work.source.amount,upkeep.source.before);
 A.equal(upkeep.source.after,e.funds);
 A.equal(e.funds,5-work.source.amount-1);
 A.equal(s.player.coins,initialCoins-5);
 A.equal(G.validate(e),true);
 const noHiddenCash=E.exportGame(s);
 const copy=E.importGame(noHiddenCash),restored=copy.table.realm;
 A.equal(G.validate(G.lookup(restored,e.id)),true);
 A.deepEqual(act(copy,'groupTreasuryStatus',{groupId:e.id}),status);
 A.equal(E.exportGame(copy),noHiddenCash);
 const now=E.exportGame(s);
 W.advance(s,30);
 A.equal(G.verifyTreasuryAudit(e),true);
 A.ok(e.treasuryAudit.receipts.length>=3);
 A.equal(s.player.coins,initialCoins-5);
 A.notEqual(E.exportGame(s),now);
 const originalHash=e.treasuryAudit.receipts[1].sourceHash;
 e.treasuryAudit.receipts[1].source.proof.originalReview.details.actualFundsSpent=9999;
 A.equal(G.validate(e),false,
  'A copied fraudulent world spending result cannot alter the original account');
 A.equal(e.treasuryAudit.receipts[1].sourceHash,originalHash);
}
{
 // Old saved groups with unrecorded earlier movements preserve their actual
 // existing funds as an anchor, never fabricated older payment receipts.
 const s=fresh(998110),form=act(s,'formGroup',names),w=s.table.realm,
  e=G.lookup(w,form.id);
 act(s,'groupContribute',{groupId:e.id,activity,coins:5});
 W.advance(s,30);
 const actual=e.funds,playerBefore=s.player.coins;
 delete e.treasuryAudit;
 A.equal(G.validate(e),true);
 A.equal(act(s,'groupTreasuryStatus',{groupId:e.id}).
  earlierMovementsUnreconstructed,true);
 act(s,'groupContribute',{groupId:e.id,activity,coins:2});
 A.equal(e.treasuryAudit.anchor.source.balance,actual);
 A.equal(e.treasuryAudit.receipts.length,1);
 A.equal(e.treasuryAudit.receipts[0].source.amount,2);
 A.equal(e.funds,actual+2);
 A.equal(s.player.coins,playerBefore-2);
 A.equal(G.validate(e),true);
 const saved=E.exportGame(s),restored=E.importGame(saved);
 A.equal(E.exportGame(restored),saved);
 A.equal(G.treasuryAuditStatus(restored.table.realm,e.id).
  earlierMovementsUnreconstructed,true);
}
{
 const s=fresh(998111),form=act(s,'formGroup',names),w=s.table.realm,e=G.lookup(w,form.id);
 act(s,'groupContribute',{groupId:e.id,activity,coins:1});
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-group-treasury-'));
 try{
  const file=Path.join(dir,'save.json'),original=E.exportGame(s)+'\n';
  FS.writeFileSync(file,original);
  const read=Turn.execute(file,{id:'group_treasury_read_0001',
   mode:'rule',system:'social',operation:'groupTreasuryStatus',
   params:{groupId:e.id}});
  A.equal(read.applied,false);
  A.equal(read.output.rules.currentOperatingFunds,1);
  A.equal(FS.readFileSync(file,'utf8'),original);
  A.throws(()=>Turn.execute(file,{id:'group_treasury_fake_0001',
   mode:'rule',system:'social',operation:'groupTreasuryStatus',
   params:{groupId:e.id,coins:5000}}),/accepts only the real founder/);
  A.equal(FS.readFileSync(file,'utf8'),original);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Verified original group Talons: one existing account, real personal donation receipts, original independent-work debits, original month upkeep, non-invented legacy balance anchors, forbidden withdrawal, save parity and tamper rejection');
