'use strict';
// Finish Line A: ordinary material handoffs across different actually present
// people and sourced items; ownership and the receiver's choice stay real.
// All states and file-backed turns are disposable: never modify Aerin.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 Core=require('../rules/core'),H=require('../rules/material-handoffs'),
 Turn=require('../scripts/chat-turn.js');
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-material-to-person-')),
 file=Path.join(dir,'test.json');
const write=s=>FS.writeFileSync(file,E.exportGame(s)+'\n');
const read=()=>FS.readFileSync(file,'utf8'),load=()=>E.importGame(read());
const act=(id,action)=>Turn.execute(file,{id,mode:'act',action});
const fresh=seed=>E.newGame({seed,name:'Human Material Handoff Fixture',
 background:'fieldworker',path:'undecided'});
function chosenSeed(npcId,item,accepted){
 for(let seed=82831;seed<83281;seed++){
  const s=fresh(seed);
  if(npcId==='sera')A.equal(E.dispatch(s,'travel academy').ok,true);
  const outcome=R.act(s,{system:'social',operation:'materialHandoff',
   params:{npcId,item}});
  if(outcome.accepted===accepted)return seed;
 }
 throw Error('No independent in-person choice matching fixture requirement');
}
try{
 const impossible=fresh(82800),untouched=E.exportGame(impossible),
  rng=impossible.rngState;
 for(const p of [
  {npcId:'unknown',item:'clean_rations'},
  {npcId:'sera',item:'clean_rations'},
  {npcId:'otto',item:'phantom_leaf'},
  {npcId:'otto',item:'clean_rations',accept:true},
  {npcId:'otto',item:'clean_rations',amount:100},
  {npcId:'notable:invented',item:'marsh_reed'}
 ]){
  A.throws(()=>R.act(impossible,{system:'social',operation:'materialHandoff',
   params:p}));
  A.equal(E.exportGame(impossible),untouched);
  A.equal(impossible.rngState,rng);
 }
 impossible.world.minutes=22*60;
 const afterHours=E.exportGame(impossible);
 A.throws(()=>R.act(impossible,{system:'social',operation:'materialHandoff',
  params:{npcId:'otto',item:'clean_rations'}}),/not independently established as present/);
 A.equal(E.exportGame(impossible),afterHours);
 impossible.world.minutes=8*60;
 impossible.player.inventory.clean_rations=0;
 const noGoods=E.exportGame(impossible);
 A.throws(()=>R.act(impossible,{system:'social',operation:'materialHandoff',
  params:{npcId:'otto',item:'clean_rations'}}),/Insufficient genuinely owned/);
 A.equal(E.exportGame(impossible),noGoods);

 // Paid real merchant stock transfers to the player, then a distinct freely
 // chosen *gift*, not a second purchase or coerced transaction, reaches Orrin.
 const yes=chosenSeed('otto','clean_rations',true),s=fresh(yes);
 write(s);
 const quotation=act('material_quote_orrin_0001','ask orrin about supplies');
 A.equal(quotation.output.gear.quoted,true);
 const sale=act('material_purchase_actual_0001','buy clean rations');
 A.equal(sale.output.gear.purchased,true);
 const before=load(),playerRng=before.rngState,priorFood=before.player.inventory.clean_rations,
  merchantStock=before.table.realm.localProvisioner.stock,
  merchantFunds=before.table.realm.localProvisioner.fundsScales,
  beforeCoins=before.player.coins,beforeMinute=before.world.minutes;
 const given=act('material_gift_actual_0001','give clean rations to Orrin Vale');
 A.equal(given.applied,true);A.equal(given.output.handoff.offered,true);
 A.equal(given.output.handoff.accepted,true);
 A.equal(given.output.handoff.quantityMoved,1);
 A.equal(given.output.handoff.noCurrencyAward,true);
 let after=load(),account=after.table.realm.materialCustody.accounts.otto;
 A.equal(after.player.inventory.clean_rations,priorFood-1);
 A.equal(account.held.clean_rations,1);
 A.doesNotThrow(()=>H.validateAccount(account,'otto'));
 const custodyWitness=account.history.find(x=>x.origin===H.ORIGIN);
 A.equal(custodyWitness.playerStockBefore,priorFood);
 A.equal(custodyWitness.playerStockAfter,priorFood-1);
 A.equal(custodyWitness.recipientStockBefore,0);
 A.equal(custodyWitness.recipientStockAfter,1);
 const sceneEvent=after.log.find(x=>x.details?.witnessHash===custodyWitness.hash);
 A.ok(sceneEvent,'the genuinely witnessed handoff remains in the scene log');
 A.equal(Object.hasOwn(sceneEvent.details,'recipientStockBefore'),false);
 A.equal(Object.hasOwn(sceneEvent.details,'recipientStockAfter'),false,
  'a narrator receives the actual acceptance, not the other person’s private inventory');
 const inflated=structuredClone(account);
 inflated.held.clean_rations=2;
 A.throws(()=>H.validateAccount(inflated,'otto'),/balance disagrees/,
  'another privately held ration cannot appear without its original incoming receipt');
 const rebased=structuredClone(account),ghost={...rebased.history[0],
  recipientStockBefore:8,recipientStockAfter:9};
 delete ghost.hash;
 ghost.hash=require('node:crypto').createHash('sha256')
  .update(JSON.stringify(ghost)).digest('hex');
 rebased.history.push(ghost);
 rebased.held.clean_rations=9;
 A.throws(()=>H.validateAccount(rebased,'otto'),/unexplained transfer balance jump/,
  'two individually sealed receipts cannot bridge eight units of invented stock');
 const downgraded=structuredClone(account),legacyGhost={...downgraded.history[0]};
 for(const field of ['playerStockBefore','playerStockAfter',
  'recipientStockBefore','recipientStockAfter'])delete legacyGhost[field];
 delete legacyGhost.hash;
 legacyGhost.hash=require('node:crypto').createHash('sha256')
  .update(JSON.stringify(legacyGhost)).digest('hex');
 downgraded.history.push(legacyGhost);
 A.throws(()=>H.validateAccount(downgraded,'otto'),/legacy material receipt/,
  'a newly recorded custody step cannot be rewritten as an old-format receipt');
 // Historical source-hashed offers lacked the newer balance fields. They
 // remain readable without reinterpreting their old original decision.
 const legacy=structuredClone(account),priorWitness=legacy.history.find(x=>x.origin===H.ORIGIN);
 for(const key of ['playerStockBefore','playerStockAfter',
  'recipientStockBefore','recipientStockAfter'])delete priorWitness[key];
 delete priorWitness.hash;
 priorWitness.hash=require('node:crypto').createHash('sha256')
  .update(JSON.stringify(priorWitness)).digest('hex');
 A.doesNotThrow(()=>H.validateAccount(legacy,'otto'));
 A.equal(Core.conservedItems({sourceBefore:priorFood,
  sourceAfter:after.player.inventory.clean_rations,
  targetBefore:0,targetAfter:account.held.clean_rations,amount:1}),true);
 A.equal(after.player.coins,beforeCoins,'The gift is not a sale');
 A.equal(after.table.realm.localProvisioner.stock,merchantStock,
  'Personally donated rations do not magically become quoted commercial stock');
 A.equal(after.table.realm.localProvisioner.fundsScales,merchantFunds);
 A.equal(after.player.partnerIds.length,0);
 A.equal(after.rngState,playerRng,'The person decides independently, not by player RNG');
 A.equal(after.world.minutes,beforeMinute+6);
 A.equal(account.history.length,1);
 A.equal(account.history[0].origin,'voluntary-in-person-material-transfer-v1');
 A.equal(account.history[0].accepted,true);
 A.equal(account.history[0].hash.length,64);
 const snapshot=read(),personRng=account.rngState;
 const replay=act('material_gift_actual_0001','give clean rations to Orrin Vale');
 A.equal(replay.duplicate,true);A.equal(replay.recovered,true);
 A.equal(read(),snapshot);
 A.equal(load().table.realm.materialCustody.accounts.otto.rngState,personRng);
 const witness=act('material_gift_status_00001','my handoffs');
 A.equal(witness.applied,false);
 A.equal(witness.output.given.knownHandoffs[0].item,'clean_rations');
 A.equal(witness.output.given.knownHandoffs[0].accepted,true);
 A.equal(read(),snapshot);
 const unknownHeld=act('material_gift_status_00002','inspect handoffs');
 A.equal(unknownHeld.applied,false);
 A.ok(!JSON.stringify(unknownHeld.output).includes('rngState'));
 A.ok(!JSON.stringify(unknownHeld.output).includes('held'));
 // A world tick may use honestly held food for personal subsistence. It
 // cannot credit player coins, replenish their bag or imply social trust.
 const ticks=load(),totalBefore=ticks.player.inventory.clean_rations,
  worldAccount=ticks.table.realm.materialCustody.accounts.otto;
 R.world.advance(ticks,24);
 const later=ticks.table.realm.materialCustody.accounts.otto;
 A.equal(ticks.player.inventory.clean_rations,totalBefore);
 A.ok((later.held.clean_rations||0)===0||
  (later.held.clean_rations||0)===1);
 A.equal(later.history.filter(h=>h.origin===
  'independent-personal-ration-use-v1').length,
  (later.held.clean_rations||0)===0?1:0);
 A.doesNotThrow(()=>H.validateAccount(later,'otto'),
  'a genuine new consumption after an actual gift completes the same balance chain');
 A.equal(worldAccount.actorId,'otto');

 // A real rejection retains all the material; unchanged repeated offers
 // do not fish for a favourable second choice on the person's own RNG.
 const declineSeed=chosenSeed('otto','clean_rations',false);
 write(fresh(declineSeed));
 const prior=load(),food=prior.player.inventory.clean_rations;
 const declined=act('material_declined_gift_001','offer rations to Orrin');
 A.equal(declined.output.handoff.accepted,false);
 after=load();account=after.table.realm.materialCustody.accounts.otto;
 A.equal(after.player.inventory.clean_rations,food);
 A.equal(account.held.clean_rations||0,0);
 const refusalRng=account.rngState,minute=after.world.minutes;
 const repeat=act('material_declined_gift_002','give clean rations to Orrin');
 A.equal(repeat.output.handoff.repeated,true);
 A.equal(repeat.output.handoff.noAdditionalDecision,true);
 A.equal(repeat.output.handoff.elapsedMinutes,0);
 A.equal(load().player.inventory.clean_rations,food);
 A.equal(load().world.minutes,minute);
 A.equal(load().table.realm.materialCustody.accounts.otto.rngState,refusalRng);

 // Distinct original material and another legitimately present professional
 // travel through the SAME ownership and independent choice procedure.
 const doctorSeed=chosenSeed('sera','marsh_reed',true),doctor=fresh(doctorSeed);
 A.equal(E.dispatch(doctor,'travel academy').ok,true);
 write(doctor);
 const oldReed=load().player.inventory.marsh_reed,
  doRng=load().rngState;
 const herb=act('material_medical_source_gift_001','hand marsh reed to Professor Sera');
 A.equal(herb.output.handoff.accepted,true);
 A.equal(herb.output.handoff.item,'marsh_reed');
 after=load();
 A.equal(after.player.inventory.marsh_reed,oldReed-1);
 A.equal(after.table.realm.materialCustody.accounts.sera.held.marsh_reed,1);
 const secondOwner=after.table.realm.materialCustody.accounts.sera;
 A.doesNotThrow(()=>H.validateAccount(secondOwner,'sera'));
 const extraReeds=structuredClone(secondOwner);
 extraReeds.held.marsh_reed=2;
 A.throws(()=>H.validateAccount(extraReeds,'sera'),/balance disagrees/,
  'unrelated physical goods and person identities share the same verified custody balance');
 A.equal(Core.conservedItems({sourceBefore:oldReed,
  sourceAfter:after.player.inventory.marsh_reed,targetBefore:0,
  targetAfter:after.table.realm.materialCustody.accounts.sera.held.marsh_reed,
  amount:1}),true,
  'another sourced item and distinct person share the same physical conservation');
 A.equal(after.rngState,doRng);
 const oldSave=read();
 A.throws(()=>act('material_nonlocal_person_01',
  'give marsh reed to Orrin Vale'),/No single actually present person/);
 A.equal(read(),oldSave);
 A.throws(()=>act('material_forged_person_01',
  'give marsh reed to imaginary expert'),/No single actually present person/);
 A.equal(read(),oldSave);

 // World-owned material custody proofs remain source-verifiable if the
 // private save is altered; no invented receipt may justify another handoff.
 const forged=load();
 forged.table.realm.materialCustody.accounts.sera.history[0].quantityMoved=2;
 const tampered=E.exportGame(forged);
 A.throws(()=>R.act(forged,{system:'social',operation:'materialHandoff',
  params:{npcId:'sera',item:'marsh_reed'}}),/original witnessed material handoff/);
 A.equal(E.exportGame(forged),tampered);
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('Genuine gifts of different materials to multiple present people preserve voluntary refusal, owner inventory and private world consequences');
