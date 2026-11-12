'use strict';
// #19 — actual sourced optional merchant wage negotiation. Neither an
// invented universal employment catalogue nor a compulsory fee or teacher.
// Disposable original emergent citizens only; no existing campaign changed.
const A=require('node:assert/strict'),E=require('../engine.js'),
 Realm=require('../world/simulation'),Atlas=require('../world/atlas'),
 People=require('../world/emergent-people'),Career=require('../world/person-careers'),
 Terms=require('../world/merchant-voluntary-work-terms');
function create(seed){
 const s=E.newGame({seed,name:'Disposable Independent Wage Terms',
  path:'undecided'}),w=Realm.ensure(s),day=w.lastTickDay,t=People.ensure(w),
  region=Atlas.R.morrowfen_basin,polity=Atlas.P[region.polity],
  ecology=w.ecosystems[region.id],economy=w.countries[region.polity],
  seller=w.localProvisioner;
 const demand={kind:'livelihood-work',regionId:region.id,
  polity:region.polity,language:polity.language,
  good:'grain',localName:region.name,
  evidence:{regionalGoods:region.goods.slice(),regionBiome:region.biome,
   ecological:{quality:ecology.quality,pressure:ecology.pressure,
    water:ecology.water,forage:ecology.forage},
   civic:{stability:economy.stability,prosperity:economy.prosperity},
   existingMerchant:seller.seller,existingStock:seller.stock,
   witnessedNeed:'Original local provisioner has finite existing trading stock'}};
 const p=People._debug.make(w,t,day,demand);
 p.shift=People.shift(p,day);
 A.ok(People.presence(w,p.actorId,'crossing',day));
 const dutyId='merchant-stock-original-service',
  role='Locally witnessed actual provisioner stock service';
 Career.authorDuty(w,p,{id:dutyId,role,method:'shop-stock-service',
  domain:'trade',day,
  goal:'Inspect existing merchant supplies and carefully report observed storage conditions',
  witness:'An independent source-backed local provisioner needs ordinary attention to physical stock without producing any items'});
 const scope=role+
  ': voluntarily inspect real seller-owned stock and report witnessed storage conditions, without guaranteed manufactured goods.';
 const witness=seller.seller+' and '+p.name+
  ' are physically present at the original Morrowfen Crossing market and may independently decide whether one limited local stock-service wage is acceptable.';
 const args={id:'original_merchant_service_terms_'+seed,
  dutyId,scope,witness,day,throughDay:day+6,amountScales:137};
 return {s,w,p,seller,day,dutyId,args};
}
{
 const {s,w,p,args}=create(982911),saved=E.exportGame(s),oldRng=s.rngState;
 const invalid=[
  {...args,accepted:true},
  {...args,amountScales:0},
  {...args,amountScales:w.localProvisioner.fundsScales+1},
  {...args,dutyId:'imaginary-role'},
  {...args,scope:'I demand all trade income without having worked'},
  {...args,witness:'An unknown employer agreed to all of these demands'},
  {...args,day:w.lastTickDay+90},
  {...args,id:'x'}
 ];
 for(const input of invalid){
  A.throws(()=>Terms.negotiate(w,p,input));
  A.equal(E.exportGame(s),saved);
  A.equal(s.rngState,oldRng);
  A.equal(Terms.verify(w),true);
 }
 A.throws(()=>Terms.settle(w,p,{
  agreementId:'imaginary-agreement',workHash:'a'.repeat(64),day:w.lastTickDay}),
 /accepted|genuine|Only one/);
 A.equal(E.exportGame(s),saved);
}
let accepted=null,sellerDeclined=null,workerDeclined=null;
for(let n=0;n<130;n++){
 const context=create((982950+Math.imul(n,2654435761))>>>0);
 const {s,w,p,seller,args}=context,coins=s.player.coins,
  stock=seller.stock,funds=seller.fundsScales,
  playerRng=s.rngState,worldRng=w.rngState,personRng=p.rngState;
 const outcome=Terms.negotiate(w,p,args),row=seller.serviceTerms[0],q=row.source;
 A.equal(outcome.noFundsTransferred,true);
 A.equal(outcome.noForcedWork,true);
 A.equal(outcome.noWorkCredited,true);
 A.equal(outcome.amountScales,args.amountScales);
 A.equal(outcome.accepted,q.merchantAccepted&&q.workerAccepted);
 A.equal(outcome.workerAccepted,q.workerAccepted);
 A.equal(Terms.verify(w),true);
 A.equal(People.verify(w,p),true);
 A.equal(Career.verifyLocalTradePayments(w),true);
 A.equal(seller.stock,stock);
 A.equal(seller.fundsScales,funds);
 A.equal(p.cashScales,0);
 A.equal(s.player.coins,coins);
 A.equal(s.rngState,playerRng);
 A.equal(w.rngState,worldRng);
 A.equal(p.rngState, q.merchantAccepted?q.workerRngAfter:personRng);
 A.equal(Terms.workerTerms(w,p)[0].agreed,outcome.accepted);
 A.throws(()=>Terms.negotiate(w,p,args),/nonduplicate/);
 const frozen=E.exportGame(s),restored=E.importGame(frozen);
 A.equal(E.exportGame(restored),frozen);
 A.equal(Terms.verify(restored.table.realm),true);
 if(outcome.accepted&&!accepted)accepted=context;
 if(!q.merchantAccepted&&!sellerDeclined)sellerDeclined=context;
 if(q.merchantAccepted&&!q.workerAccepted&&!workerDeclined)
  workerDeclined=context;
 if(accepted&&sellerDeclined&&workerDeclined)break;
}
A.ok(accepted,'a genuine seller and worker must independently agree in some disposable seeds');
A.ok(sellerDeclined,'an independent merchant can decline a voluntary price');
A.ok(workerDeclined,'an individual worker can independently refuse a merchant offer');
for(const selected of [sellerDeclined,workerDeclined]){
 const {s,w,p,args,seller}=selected,
  before=E.exportGame(s);
 A.throws(()=>Terms.settle(w,p,{
  agreementId:args.id,workHash:'a'.repeat(64),day:w.lastTickDay}),
  /accepted/);
 A.equal(E.exportGame(s),before);
 A.equal(seller.fundsScales,w.localProvisioner.fundsScales);
}
{
 const {s,w,p,args,seller,day,dutyId}=accepted,
  initialCoins=s.player.coins,initialStock=seller.stock,
  originalMerchantFunds=seller.fundsScales,playerRng=s.rngState;
 const prior=E.exportGame(s);
 A.throws(()=>Terms.settle(w,p,{agreementId:args.id,
  workHash:'a'.repeat(64),day}),/completed work|agreed|accepted/);
 A.equal(E.exportGame(s),prior);
 let completed=null;
 for(let i=0;i<135;i++){
  const step=Career.work(w,p,day);
  if(step.success&&p.career.workReceipts.some(x=>
   x.sourceHash===step.receiptHash&&
   x.source.task.authoredDutyId===dutyId)){
   completed=step;break;
  }
 }
 A.ok(completed,'original independently chosen actual trade service eventually finishes successfully');
 A.equal(seller.fundsScales,originalMerchantFunds);
 A.equal(p.cashScales,0,'the agreement alone cannot pay even after finished work');
 const beforePay=E.exportGame(s),beforeRng=p.rngState,
  total=seller.fundsScales+p.cashScales;
 A.throws(()=>Terms.settle(w,p,{agreementId:args.id,
  workHash:'c'.repeat(64),day}),/completed work|agreed/);
 A.equal(E.exportGame(s),beforePay);
 const paid=Terms.settle(w,p,{agreementId:args.id,
  workHash:completed.receiptHash,day});
 A.equal(paid.originalWageTermsSettled,true);
 A.equal(paid.independentMutualConsent,true);
 A.equal(paid.paidScales,args.amountScales);
 A.equal(paid.originalWorkHash,completed.receiptHash);
 A.equal(seller.fundsScales,originalMerchantFunds-args.amountScales);
 A.equal(p.cashScales,args.amountScales);
 A.equal(seller.fundsScales+p.cashScales,total,
  'actual Scales move from one real owner to another without creation');
 A.equal(s.player.coins,initialCoins);
 A.equal(seller.stock,initialStock);
 A.equal(p.rngState,beforeRng,'settlement does not reroll original completed work or assent');
 A.equal(s.rngState,playerRng);
 A.equal(Terms.verify(w),true);
 A.equal(Career.verifyLocalTradePayments(w),true);
 A.equal(Terms.workerTerms(w,p)[0].settled,true);
 A.equal(seller.serviceTerms[0].settlement.source.workHash,
  completed.receiptHash);
 const saved=E.exportGame(s),copy=E.importGame(saved);
 A.equal(E.exportGame(copy),saved);
 A.equal(Terms.verify(copy.table.realm),true);
 A.equal(Realm.localProvisioner(copy).fundsScales,
  originalMerchantFunds-args.amountScales);
 A.throws(()=>Terms.settle(w,p,{agreementId:args.id,
  workHash:completed.receiptHash,day}),/not yet settled/);
 A.equal(E.exportGame(s),saved);
 // Faking worker consent or overriding the actual agreed compensation
 // cannot survive independently replayable original two-party terms.
 seller.serviceTerms[0].source.workerAccepted=false;
 A.equal(Terms.verify(w),false);
 A.throws(()=>Realm.localProvisioner(s),/reconciliation/);
}
console.log('Foundation #19 source-verifiable seller and independent worker voluntary one-service wage terms: actual separate assent/refusal, no compelled work/pay, genuine original success, finite funds transfer, source replay, duplicate/forgery rejection and exact saved state PASS');
