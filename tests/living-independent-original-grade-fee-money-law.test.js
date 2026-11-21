'use strict';
// Isolated SAME physical money-owner expense, after ACTUAL paid merchant
// work. The synthetic expense receipt has NO biological exam/consent and
// MUST NEVER certify a numeric Grade; it only tests fee conservation.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine'),Core=require('../rules/core'),
 Realm=require('../world/simulation'),Atlas=require('../world/atlas'),
 People=require('../world/emergent-people'),Career=require('../world/person-careers'),
 Purchase=require('../world/independent-local-purchases'),
 Grade=require('../rules/independent-original-beast-grade-exam');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const s=E.newGame({name:'Disposable physical original Grade fee accounting',seed:976171,path:'undecided'}),
 w=Realm.ensure(s),day=w.lastTickDay,t=People.ensure(w),
 region=Atlas.R.morrowfen_basin,polity=Atlas.P[region.polity],
 eco=w.ecosystems[region.id],country=w.countries[region.polity],seller=w.localProvisioner;
const demand={kind:'livelihood-work',regionId:region.id,polity:region.polity,language:polity.language,
 good:'grain',localName:region.name,evidence:{regionalGoods:region.goods.slice(),regionBiome:region.biome,
 ecological:{quality:eco.quality,pressure:eco.pressure,water:eco.water,forage:eco.forage},
 civic:{stability:country.stability,prosperity:country.prosperity},
 existingMerchant:seller.seller,existingStock:seller.stock,
 witnessedNeed:'The exact original finite-stock merchant provides real individually paid inventory service'}};
const p=People._debug.make(w,t,day,demand);p.shift=People.shift(p,day);
Career.authorDuty(w,p,{id:'disposable-source-earned-grade-fee-work',
 role:'Genuine locally witnessed market stock service',
 method:'shop-stock-service',domain:'trade',day,
 goal:'Observe owned provisions and identify original warehouse risks with a completed practical task',
 witness:'The original independently present merchant maintains finite goods and can pay for actual witnessed completed work.'});
let task=null;
for(let n=0;n<52;n++){
 const a=Career.work(w,p,day);
 if(a.success&&a.taskMethod==='shop-stock-service'){task=p.career.workReceipts.find(x=>x.sourceHash===a.receiptHash);break;}
}
A.ok(task,'An actual successful paid source-owner job is required');
const merchantBefore=seller.fundsScales,playerCoins=s.player.coins,
 pay=Career.payVerifiedTradeWork(w,p,{workHash:task.sourceHash,amountScales:137,day,
 witness:seller.seller+' actually observed this complete local stock service and pays 137 existing Scales to the physically present worker.'});
A.equal(pay.paidScales,137);A.equal(p.cashScales,137);A.equal(Career.verify(p),true);
const q={origin:Grade.ORIGIN,actorId:p.actorId,humanHash:p.originHash,
 minute:s.world.minutes,endMinute:s.world.minutes+120,actualMinutes:120,
 accepted:true,humanChoice:{accepted:true},beastChoice:{outcome:'accepted'},
 cashBefore:137,cashAfter:37,feeScales:100,site:'academy',witnessHash:'e'.repeat(64)};
p.originalIndependentGradeExams=[{source:q,seal:hash(q)}];p.cashScales=37;
A.deepEqual(Purchase.verifyPersonal(p),{valid:true,spentScales:100,receivedScales:0});
A.equal(Career.verify(p),true,'The real original worker wage and service expense reconcile with ONE physical Scales balance');
A.equal(People.verify(w,p),true);
A.equal(s.player.coins,playerCoins);A.equal(seller.fundsScales,merchantBefore-137);
A.equal(Grade.verify(s,p),false,'An isolated fee receipt cannot create an assessment, beast assent or numeric Grade');
A.equal(s.table?.bondRecords?.['npc_grade'],undefined);
const saved=E.exportGame(s),copy=E.importGame(saved),
 c=copy.table.realm.emergentPeople.people[p.id];
A.equal(Career.verify(c),true);A.equal(Grade.verify(copy,c),false);
c.originalIndependentGradeExams[0].source.cashAfter=36;
c.originalIndependentGradeExams[0].seal=hash(c.originalIndependentGradeExams[0].source);
A.equal(Career.verify(c),false,'A forged price or unpaid fee must fail the original financial owner');
console.log('SOURCE-PAID ORIGINAL GRADE FEE ACCOUNTING PASS: actual signed worker wage 137 Scales, 100 physical expense, 37 conserved, no numeric Grade from isolated fixture');
