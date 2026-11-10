'use strict';
// Disposable, source-correct living worker and the existing finite merchant float.
// The test's local person is made by the ORIGINAL causal source-demand factory;
// it does not assert a random independent spawn or force an NPC employer's assent.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Realm=require('../world/simulation'),Atlas=require('../world/atlas'),
 People=require('../world/emergent-people'),Career=require('../world/person-careers');
const s=E.newGame({seed:976171,name:'Physical Money Career Test',path:'undecided'}),
 w=Realm.ensure(s),day=w.lastTickDay,t=People.ensure(w);
const region=Atlas.R.morrowfen_basin,polity=Atlas.P[region.polity],
 ecology=w.ecosystems[region.id],economy=w.countries[region.polity],
 provisioner=w.localProvisioner;
A.ok(provisioner.stock>0&&provisioner.fundsScales>0,
 'A real stocked and funded merchant must exist before a documented stock-service opportunity');
const demand={kind:'livelihood-work',regionId:region.id,
 polity:region.polity,language:polity.language,
 good:'grain',localName:region.name,
 evidence:{regionalGoods:region.goods.slice(),regionBiome:region.biome,
  ecological:{quality:ecology.quality,pressure:ecology.pressure,
   water:ecology.water,forage:ecology.forage},
  civic:{stability:economy.stability,prosperity:economy.prosperity},
  existingMerchant:provisioner.seller,existingStock:provisioner.stock,
  witnessedNeed:'Maintaining an authentic finite stocked merchant provisioner'}};
const p=People._debug.make(w,t,day,demand);
p.shift=People.shift(p,day);
A.ok(People.presence(w,p.actorId,'crossing',day));
A.equal(People.verify(w,p),true);
A.equal(p.cashScales,0);
const vendor=w.localProvisioner;
A.ok(vendor.stock>0&&vendor.fundsScales>=1);
Career.authorDuty(w,p,{id:'merchant-service-authored-duty',
 role:'Ordinary documented shop stock service',
 method:'shop-stock-service',domain:'trade',day,
 goal:'Inspect already owned provisioner stock and record observed storage issues',
 witness:'An existing independent local trading need establishes honest work maintaining goods without making new stock.'});
let proof=null;
for(let i=0;i<52;i++){
 const attempt=Career.work(w,p,day);
 if(attempt.taskMethod==='shop-stock-service'&&attempt.success){
  proof=p.career.workReceipts.find(x=>x.sourceHash===attempt.receiptHash);
  break;
 }
}
A.ok(proof,'Original physical work must succeed before any merchant disbursement');
const originalPlayerMoney=s.player.coins,formerFunds=p.funds,
 merchantBefore=vendor.fundsScales,workerBefore=p.cashScales,
 amountScales=137;
const witness=vendor.seller+' personally observed the finished local stock service and independently agreed to pay 137 Scales from the currently owned provisioner funds for that one completed job.';
const input={workHash:proof.sourceHash,amountScales,day,witness};
const saved=E.exportGame(s);
A.throws(()=>Career.payVerifiedTradeWork(w,p,{...input,amountScales:merchantBefore+1}),
 /seller-funded|transfer/);
A.throws(()=>Career.payVerifiedTradeWork(w,p,{...input,witness:'An unverified remote allowance'}),
 /seller-funded|transfer/);
A.equal(E.exportGame(s),saved,'Rejected payment never changes saved state');
const paid=Career.payVerifiedTradeWork(w,p,input);
A.equal(paid.paidScales,amountScales);
A.equal(paid.noNewMoneyCreated,true);
A.equal(vendor.fundsScales,merchantBefore-amountScales);
A.equal(p.cashScales,workerBefore+amountScales);
A.equal(vendor.fundsScales+p.cashScales,merchantBefore+workerBefore);
A.equal(p.funds,formerFunds,'Abstract personal livelihood is NOT cash');
A.equal(s.player.coins,originalPlayerMoney,'Unrelated player Talons are NOT wages');
A.equal(p.career.recognizedLicence,null);
A.deepEqual(p.career.supernaturalSystemRanks,{});
A.equal(vendor.stock,w.localProvisioner.stock,'Payment is for service, not free new inventory');
A.equal(Career.verify(p),true);
A.equal(Career.verifyLocalTradePayments(w),true);
A.equal(Career.tradePaymentStatus(p)[0].amountScales,amountScales);
const once=E.exportGame(s);
A.throws(()=>Career.payVerifiedTradeWork(w,p,input),
 /real source-confirmed|double-paid/);
A.equal(E.exportGame(s),once,'Original completed check is compensated only once');
const imported=E.importGame(once),restored=imported.table.realm;
const rp=restored.emergentPeople.people[p.id];
A.equal(Career.verify(rp),true);
A.equal(Career.verifyLocalTradePayments(restored),true);
A.equal(Realm.localProvisioner(imported).fundsScales,vendor.fundsScales);
A.equal(rp.cashScales,p.cashScales);
A.equal(E.exportGame(imported),once);
for(let i=0;i<45;i++)Career.work(w,p,day);
A.equal(Career.verify(p),true,'Source-work proof survives bounded local work journal');
A.equal(Career.verifyLocalTradePayments(w),true);
const copy=E.importGame(E.exportGame(s));
A.equal(Career.verifyLocalTradePayments(copy.table.realm),true);
const entry=vendor.laborPayments[0],old=entry.source.amountScales;
entry.source.amountScales=old+1;
A.equal(Career.verifyLocalTradePayments(w),false,'Merchant ledger cannot falsify payment');
entry.source.amountScales=old;
A.equal(Career.verifyLocalTradePayments(w),true);
p.cashScales++;
A.equal(Career.verify(p),false,'Worker cannot mint local Scales without actual original transfer');
console.log('Real same-unit career payment: original seller-owned Scales transferred only after genuine completed worker trade service, independently sealed both ways, no mythical guild-budget conversion, duplicate protection, save and journal rotation');
