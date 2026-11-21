'use strict';
// #19 — a REAL existing merchant and a REAL independently lived person may
// negotiate a limited, freeform trade-service wage. This is one sourced
// example, NOT a universal employer, contract, job or salary template.
// The merchant can independently decline; so can the individual worker.
// Agreement cannot force work, pay an unperformed task, mint currency or
// turn an abstract career livelihood score into physical Scales.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 People=require('./emergent-people'),Careers=require('./person-careers');
const ORIGIN='independent-original-local-trade-service-wage-terms-v1',
 SETTLEMENT='fulfilled-original-local-trade-service-wage-terms-v1',
 VISITOR_WORK='personally-chosen-original-visitor-market-service-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function seed(w){
 return Crypto.createHash('sha256').update(
  String(w.worldSeed)+'|otto|original-independent-trade-wage-terms-v1')
  .digest().readUInt32BE(0)||0x91e10da5;
}
function draw(before){
 if(!Number.isInteger(before)||before<1)throw Error('An original independent agent decision needs a genuine personal RNG');
 let x=before>>>0;
 x^=x<<13;x^=x>>>17;x^=x<<5;
 const after=(x>>>0)||0x91e10da5;
 return {after,value:after/4294967296};
}
function sellerChance(q){
 const fraction=q.amountScales/Math.max(1,q.merchantFundsAtOffer);
 return Math.max(.10,Math.min(.88,.64-
  fraction*.42+(q.stockAtOffer<2?.08:0)+
  (q.localPressureAtOffer>60?.08:0)));
}
function workerChance(q){
 return Math.max(.10,Math.min(.94,.43+
  (q.amountScales>=150?.14:q.amountScales>=75?.08:0)+
  (q.workerFatigueAtOffer>60?-.16:0)+
  ((q.workerAptitudeAtOffer-5)*.018)));
}
function originalMerchant(w){
 const v=w?.localProvisioner;
 if(!v||v.origin!=='established-reedmarch-provisions-v1'||
  v.sellerNpcId!=='otto'||v.seller!==E.NPCS.otto?.name||
  v.location!=='crossing'||v.regionId!=='morrowfen_basin'||
  v.item!=='clean_rations'||!Number.isInteger(v.fundsScales)||
  v.fundsScales<0||v.fundsScales>100000000||
  !Number.isInteger(v.stock)||v.stock<0||v.stock>8)
  throw Error('Real current original seller, finite stock and owned funds are required');
 return v;
}
function originalWorker(w,p){
 if(!p||p.actorId!=='emergent:'+p.id||
  w?.emergentPeople?.people?.[p.id]!==p||
  p.status!=='active'||!People.verify(w,p)||!Careers.verify(p))
  return false;
 // A historically verified visiting employee must not lose their source-
 // signed employment receipt merely because their home polity differs or
 // they later RETURNED. Actual SITE presence remains an independent fresh
 // requirement for negotiate and payment; this is identity verification.
 if(p.regionId!=='morrowfen_basin'&&
  !p.career?.authoredDuties?.some(d=>d.regionId==='morrowfen_basin'&&
   d.source?.visitorSite==='crossing'&&
   /^[a-f0-9]{64}$/.test(d.source?.visitorArrivalSeal||'')))
  return false;
 return true;
}
function verifyVisitorAttempts(p,row){
 const attempts=row.visitorAttempts;
 if(attempts===undefined)return true;
 if(!row.accepted||!Array.isArray(attempts)||attempts.length>16)return false;
 let lastDay=-1;
 for(const a of attempts){
  const q=a?.source,step=q?.workerRngBefore&&draw(q.workerRngBefore),
   pos=require('../rules/independent-sapient-terrestrial-journey')
    .position(p,q?.minute),proof=q?.work;
  if(!q||a.sourceHash!==hash(q)||q.origin!==VISITOR_WORK||
   q.agreementId!==row.id||q.agreementHash!==row.sourceHash||
   q.workerId!==p.id||q.workerOriginHash!==p.originHash||
   !Number.isInteger(q.day)||q.day<=lastDay||
   q.day<row.source.day||q.day>row.source.throughDay||
   !Number.isInteger(q.minute)||Math.floor(q.minute/1440)!==q.day||
   q.minute%1440<8*60||q.minute%1440>=18*60||
   q.site!=='crossing'||!pos?.arrived||pos.location!==q.site||
   q.arrivalSeal!==pos.sourceHash||
   !Number.isInteger(q.fatigueBefore)||q.fatigueBefore<0||q.fatigueBefore>100||
   q.willingness!==Math.max(.12,Math.min(.88,.54+
     (p.career.aptitude-5)*.03-(q.fatigueBefore>70?.21:q.fatigueBefore>40?.10:0)))||
   !step||step.after!==q.workerRngAfter||step.value!==q.workerDraw||
   q.accepted!==(step.value<q.willingness))return false;
  if(q.accepted){
   if(!proof||q.workHash!==hash(proof)||
    proof.origin!==Careers.WORK||proof.personId!==p.id||
    proof.personOriginHash!==p.originHash||
    proof.context!=='independent-visitor-merchant-service'||
    proof.visitorService?.agreementHash!==row.sourceHash||
    proof.visitorService?.agreementId!==row.id||
    proof.visitorService?.arrivalSeal!==q.arrivalSeal||
    proof.visitorService?.minute!==q.minute||
    proof.task?.authoredDutyId!==row.source.dutyId||
    proof.task?.method!==row.source.workMethod||
    proof.regionId!=='morrowfen_basin'||
    !p.career?.authoredDuties?.some(d=>d.id===row.source.dutyId&&
      d.workProofHashes?.includes(q.workHash)))return false;
  }else if(q.work!==null||q.workHash!==null)return false;
  lastDay=q.day;
 }
 return true;
}
function verifyOne(w,row,previousMerchantRng){
 const q=row?.source,p=w.emergentPeople?.people?.[q?.workerId],
  v=w.localProvisioner;
 if(!q||!p||!originalWorker(w,p)||!v||
  row.origin!==ORIGIN||row.sourceHash!==hash(q)||
  row.id!==q.id||row.workerId!==q.workerId||
  row.accepted!==q.accepted||
  !/^[a-z][a-z0-9_-]{6,69}$/.test(q.id)||
  q.origin!==ORIGIN||q.workerOriginHash!==p.originHash||
  q.workerActorId!==p.actorId||
  q.sellerNpcId!=='otto'||q.sellerName!==E.NPCS.otto.name||
  q.location!=='crossing'||q.regionId!=='morrowfen_basin'||
  typeof q.witness!=='string'||q.witness.trim().length<60||
  q.witness.length>650||!q.witness.includes(q.sellerName)||
  !q.witness.includes(p.name)||
  typeof q.scope!=='string'||q.scope.trim().length<25||
  q.scope.length>400||
  !Number.isInteger(q.day)||q.day<p.birthSource.day||
  q.day>10000000||
  !Number.isInteger(q.throughDay)||q.throughDay<q.day||
  q.throughDay>q.day+365||
  !Number.isInteger(q.amountScales)||q.amountScales<1||
  q.amountScales>100000000||
  !Number.isInteger(q.merchantFundsAtOffer)||
  q.merchantFundsAtOffer<q.amountScales||
  q.merchantFundsAtOffer>100000000||
  !Number.isInteger(q.stockAtOffer)||q.stockAtOffer<0||
  q.stockAtOffer>8||
  !Number.isInteger(q.localPressureAtOffer)||
  q.localPressureAtOffer<0||q.localPressureAtOffer>100||
  !Number.isInteger(q.workerFatigueAtOffer)||
  q.workerFatigueAtOffer<0||q.workerFatigueAtOffer>100||
  !Number.isInteger(q.workerAptitudeAtOffer)||
  q.workerAptitudeAtOffer!==p.career.aptitude||
  q.merchantRngBefore!==previousMerchantRng||
  q.merchantWillingness!==sellerChance(q)||
  typeof q.noMandatoryLabour!=='boolean'||q.noMandatoryLabour!==true||
  q.noCreatedMoneyOrGoods!==true||
  q.noAutomaticSkillOrLicence!==true)
  return false;
 const duty=p.career.authoredDuties?.find(x=>x.id===q.dutyId);
 if(!duty||duty.sourceHash!==q.dutySourceHash||
  duty.domain!=='trade'||duty.regionId!=='morrowfen_basin'||
  q.scope.indexOf(duty.role)<0||
  duty.openedDay>q.day||q.workMethod!==duty.method||
  q.dutyGoal!==duty.goal)return false;
 const m=draw(previousMerchantRng);
 if(m.after!==q.merchantRngAfter||
  m.value!==q.merchantDraw||
  q.merchantAccepted!==(m.value<q.merchantWillingness))
  return false;
 if(q.merchantAccepted){
  if(!Number.isInteger(q.workerRngBefore)||q.workerRngBefore<1||
   q.workerWillingness!==workerChance(q))return false;
  const k=draw(q.workerRngBefore);
  if(k.after!==q.workerRngAfter||
   k.value!==q.workerDraw||
   q.workerAccepted!==(k.value<q.workerWillingness))
   return false;
 }else if(q.workerRngBefore!==null||q.workerRngAfter!==null||
  q.workerDraw!==null||q.workerWillingness!==null||
  q.workerAccepted!==false)return false;
 if(q.accepted!==(q.merchantAccepted&&q.workerAccepted)||
  !verifyVisitorAttempts(p,row))return false;
 if(!q.accepted)return row.settlement===null&&
  (row.visitorAttempts===undefined||row.visitorAttempts.length===0);
 if(row.settlement===null)return true;
 const payment=row.settlement,s=payment?.source,
  merchantPayment=v.laborPayments?.find(x=>x.sourceHash===s?.paymentSourceHash),
  workerPayment=p.career.tradePayments?.find(x=>x.sourceHash===s?.paymentSourceHash);
 if(!s||payment.hash!==hash(s)||
  s.origin!==SETTLEMENT||s.agreementId!==q.id||
  s.workerId!==p.id||s.amountScales!==q.amountScales||
  s.sellerId!=='otto'||!Number.isInteger(s.day)||
  s.day<q.day||s.day<s.workDay||
  s.workDay>q.throughDay||s.workDay<q.day||
  typeof s.workHash!=='string'||s.workHash.length!==64||
  !merchantPayment||!workerPayment||
  JSON.stringify(merchantPayment)!==JSON.stringify(workerPayment)||
  merchantPayment.sourceHash!==s.paymentSourceHash||
  merchantPayment.workHash!==s.workHash||
  merchantPayment.amountScales!==s.amountScales||
  merchantPayment.source?.work?.task?.authoredDutyId!==q.dutyId||
  merchantPayment.source?.work?.task?.method!==q.workMethod||
  merchantPayment.source?.work?.day!==s.workDay||
  merchantPayment.source?.day!==s.day||
  merchantPayment.source?.work?.outcome?.success!==true)
  return false;
 return true;
}
function verify(w){
 const v=w?.localProvisioner;
 if(!v)return true;
 if(v.serviceTerms===undefined&&v.serviceTermsRngState===undefined)
  return true; // Backward-compatible original checkpoint.
 if(!Array.isArray(v.serviceTerms)||v.serviceTerms.length>1000||
  !Number.isInteger(v.serviceTermsRngState)||
  v.serviceTermsRngState<1)return false;
 let last=seed(w),lastDay=-1;
 const seen=new Set(),settledWork=new Set();
 for(const row of v.serviceTerms){
  if(!verifyOne(w,row,last)||seen.has(row.id)||
   row.source.day<lastDay)return false;
  if(row.settlement){
   const work=row.settlement.source.workHash;
   if(settledWork.has(work))return false;
   settledWork.add(work);
  }
  last=row.source.merchantRngAfter;lastDay=row.source.day;
  seen.add(row.id);
 }
 return last===v.serviceTermsRngState;
}
function negotiate(w,p,args={}){
 if(!args||typeof args!=='object'||Array.isArray(args)||
  Object.keys(args).sort().join('|')!==
   'amountScales|day|dutyId|id|scope|throughDay|witness')
  throw Error('A source-grounded merchant-worker proposal needs real terms and cannot choose another person’s consent, paid result or outcome');
 const {id,day,dutyId,scope,throughDay,amountScales,witness}=args;
 const v=originalMerchant(w);
 if(!originalWorker(w,p)||!verify(w)||
  !Number.isInteger(day)||day!==w.lastTickDay||
  !Number.isInteger(throughDay)||throughDay<day||
  throughDay>day+365||
  !Number.isInteger(amountScales)||amountScales<1||
  amountScales>v.fundsScales||
  !People.presence(w,p.actorId,v.location,day)||
  v.serviceTerms?.some(x=>x.id===id||
   x.workerId===p.id&&x.source.dutyId===dutyId&&
   (x.source.day===day||x.accepted&&!x.settlement&&
    x.source.throughDay>=day)))
  throw Error('One original local, funded, independent worker and nonduplicate genuine time-limited offer are needed');
 const c=Careers.ensure(p),d=c.authoredDuties?.find(x=>x.id===dutyId),
  ecology=w.ecosystems?.morrowfen_basin;
 if(!d||d.status!=='available'||d.domain!=='trade'||
  d.regionId!==v.regionId||d.openedDay>day||
  !ecology||!Number.isInteger(ecology.pressure)||
  typeof scope!=='string'||!scope.includes(d.role)||
  typeof witness!=='string'||!witness.includes(p.name)||
  !witness.includes(v.seller))
  throw Error('Proposed work terms require an original real local trade duty and actual witness, never imaginary employment');
 const merchantRngBefore=v.serviceTermsRngState??seed(w),
  m=draw(merchantRngBefore),
  sourceBase={origin:ORIGIN,id,day,throughDay,
   sellerNpcId:v.sellerNpcId,sellerName:v.seller,
   location:v.location,regionId:v.regionId,
   workerId:p.id,workerOriginHash:p.originHash,
   workerActorId:p.actorId,
   dutyId,dutySourceHash:d.sourceHash,workMethod:d.method,
   dutyGoal:d.goal,scope,witness,amountScales,
   merchantFundsAtOffer:v.fundsScales,
   stockAtOffer:v.stock,
   localPressureAtOffer:ecology.pressure,
   workerFatigueAtOffer:p.fatigue,
   workerAptitudeAtOffer:c.aptitude,
   noMandatoryLabour:true,noCreatedMoneyOrGoods:true,
   noAutomaticSkillOrLicence:true},
  merchantWillingness=sellerChance(sourceBase),
  merchantAccepted=m.value<merchantWillingness,
  workerRngBefore=merchantAccepted?p.rngState:null,
  k=merchantAccepted?draw(workerRngBefore):null,
  workerWillingness=merchantAccepted?workerChance(sourceBase):null,
  workerAccepted=!!k&&k.value<workerWillingness,
  q={...sourceBase,
   merchantRngBefore,merchantRngAfter:m.after,
   merchantWillingness,merchantDraw:m.value,merchantAccepted,
   workerRngBefore,workerRngAfter:k?.after??null,
   workerDraw:k?.value??null,workerWillingness,workerAccepted,
   accepted:merchantAccepted&&workerAccepted},
  row={id,origin:ORIGIN,workerId:p.id,accepted:q.accepted,
   source:q,sourceHash:hash(q),settlement:null};
 if(!verifyOne(w,row,merchantRngBefore))
  throw Error('No genuine, independently accepted bounded compensation terms were verified');
 v.serviceTerms||=[];v.serviceTerms.push(row);
 v.serviceTermsRngState=m.after;
 if(k)p.rngState=k.after;
 if(!verify(w)||!People.verify(w,p))
  throw Error('Independent original employer/worker agency proof was not preserved');
 return {id,offered:true,merchantAccepted,
  workerAccepted,accepted:q.accepted,
  amountScales,throughDay,
  noForcedWork:true,noFundsTransferred:true,
  noWorkCredited:true,noGuaranteedOutcome:true};
}
function visitorWorkStatus(s,{actorId,agreementId,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId)||
  typeof agreementId!=='string')
  throw Error('Read-only visitor work inspection requires exact original visitor actor and existing agreement only');
 const deny=reason=>({privateToGM:true,eligible:false,reason,
  noWorkDecisionOrOriginalRollOrFeeOrClock:true});
 const w=require('./simulation').peek(s),
  p=w?.emergentPeople?.people?.[actorId.slice(9)],
  v=w?.localProvisioner,
  row=v?.serviceTerms?.find(x=>x.id===agreementId&&x.workerId===p?.id&&x.accepted),
  minute=s.world.minutes,day=Math.floor(minute/1440),
  Visit=require('../rules/independent-sapient-terrestrial-journey'),
  pos=Visit.position(p,minute);
 if(!p||!row||row.settlement)return deny('no-unsettled-mutually-agreed-original-service');
 if(!originalWorker(w,p)||!verify(w)||p.status!=='active')
  return deny('unverified-or-recovering-original-worker');
 // The original merchant and sixday market inventory are authoritative
 // at their most recent world tick. This REAL date may fall between ticks;
 // a new day inside the sixday interval is not an invented extra sixday.
 if(day<w.lastTickDay||day>=w.lastTickDay+6||
  day<row.source.day||day>row.source.throughDay)
  return deny('merchant-has-no-original-confirmed-workday');
 if(p.regionId===v.regionId||!pos?.arrived||pos.location!=='crossing'||
  !Visit.verify(s,p))
  return deny('no-source-verified-independent-visitor-at-original-market');
 if(!People.presence(w,actorId,'crossing',day,minute%1440))
  return deny('original-visitor-not-physically-present');
 if(minute%1440<8*60||minute%1440>=18*60)
  return deny('market-not-actually-in-daytime-work-shift');
 if((row.visitorAttempts||[]).some(x=>x.source.day===day))
  return deny('original-visitor-already-made-one-work-choice-today');
 if(require('../rules/unified').currentNpcWoundCondition(s,actorId)?.
   workAndOrdinaryPracticeBlocked)
  return deny('original-individual-combat-condition-blocks-work');
 return {privateToGM:true,eligible:true,actorId,agreementId,
  actualMarket:'crossing',sourceArrivalSeal:pos.sourceHash,
  noWorkDecisionOrOriginalRollOrFeeOrClock:true};
}
function performVisitorService(s,{actorId,agreementId,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId)||
  typeof agreementId!=='string')
  throw Error('A real independent visitor may consider only their original accepted current market-service agreement');
 const w=require('./simulation').peek(s),
  p=w?.emergentPeople?.people?.[actorId.slice(9)],
  v=originalMerchant(w),
  row=v.serviceTerms?.find(x=>x.id===agreementId&&x.workerId===p?.id&&x.accepted),
  day=Math.floor(s.world.minutes/1440),
  minute=s.world.minutes,
  pos=require('../rules/independent-sapient-terrestrial-journey')
   .position(p,minute);
 const readiness=visitorWorkStatus(s,{actorId,agreementId});
 if(!readiness.eligible)
  throw Error('Original independent visitor work currently unlawful: '+readiness.reason);
 const fatigueBefore=p.fatigue,
  willingness=Math.max(.12,Math.min(.88,.54+
    (p.career.aptitude-5)*.03-(fatigueBefore>70?.21:fatigueBefore>40?.10:0))),
  workerRngBefore=p.rngState,step=draw(workerRngBefore),
  accepted=step.value<willingness;
 p.rngState=step.after;
 let work=null,workHash=null;
 if(accepted){
  const receipt=Careers.work(w,p,day,
   'independent-visitor-merchant-service',null,
   {world:s,agreementId});
  workHash=receipt.receiptHash;
  work=structuredClone(p.career.workReceipts.find(x=>x.sourceHash===workHash).source);
 }
 const q={origin:VISITOR_WORK,agreementId,agreementHash:row.sourceHash,
  workerId:p.id,workerOriginHash:p.originHash,day,minute,
  site:'crossing',arrivalSeal:pos.sourceHash,fatigueBefore,willingness,
  workerRngBefore,workerRngAfter:step.after,workerDraw:step.value,
  accepted,work,workHash};
 row.visitorAttempts||=[];
 row.visitorAttempts.push({source:q,sourceHash:hash(q)});
 if(!verify(w)||!People.verify(w,p))
  throw Error('Original individual visitor service and decision receipt failed independent source replay');
 return {privateToGM:true,actorId,agreementId,
  independentlyAcceptedWork:accepted,
  workAttempted:!!work,
  workSuccess:!!work?.outcome.success,workHash,
  noGuaranteedJobSuccessOrPayment:true,
  noNewWageUntilSeparateVerifiedSettlement:true,
  noImpliedGradeOrMagicalBond:true};
}
function settle(w,p,{agreementId,workHash,day}={},sourceWorld=null){
 const v=originalMerchant(w);
 if(!originalWorker(w,p)||!verify(w)||!Number.isInteger(day)||
  (sourceWorld?(
   require('./simulation').peek(sourceWorld)!==w||
   day!==Math.floor(sourceWorld.world?.minutes/1440)||
   day<w.lastTickDay||day>=w.lastTickDay+6):
   day!==w.lastTickDay))
  throw Error('A genuine original merchant and independently present worker must settle at an actual day');
 const row=v.serviceTerms?.find(x=>x.id===agreementId&&
  x.workerId===p.id&&x.accepted);
 if(!row||row.settlement!==null||
  typeof workHash!=='string'||!/^[a-f0-9]{64}$/.test(workHash))
  throw Error('Only one authentic mutually accepted and not yet settled agreement can pay real work');
 const q=row.source,
  finished=p.career?.workReceipts?.find(x=>x.sourceHash===workHash),
  visitor=p.regionId!==v.regionId;
 if(visitor&&(!sourceWorld||
   require('./simulation').peek(sourceWorld)!==w||
   Math.floor(sourceWorld.world.minutes/1440)!==day||
   !row.visitorAttempts?.some(x=>x.source.accepted&&
    x.source.workHash===workHash&&x.source.work?.outcome.success)))
  throw Error('A real visiting worker must independently attempt and succeed at the originally accepted employer duty before any payment');
 if(!finished||finished.source.outcome?.success!==true||
  finished.source.task?.domain!=='trade'||
  finished.source.task.authoredDutyId!==q.dutyId||
  finished.source.task.method!==q.workMethod||
  finished.source.day<q.day||finished.source.day>q.throughDay||
  finished.source.day>day||
  v.fundsScales<q.amountScales)
  throw Error('An agreement cannot pay before the actual agreed independent completed work and available seller money');
 // Original physical money engine remains canonical and rejects double-pay.
 const witness=v.seller+' settles the independently accepted merchant service terms '+
  q.id+' after this real worker completed the agreed source-verified local trading duty; payment is authorised from existing seller-owned Scales only.';
 const paid=Careers.payVerifiedTradeWork(w,p,{
  workHash,amountScales:q.amountScales,day,witness},sourceWorld);
 const payment=p.career.tradePayments.find(x=>x.workHash===workHash),
  record={origin:SETTLEMENT,agreementId:q.id,workerId:p.id,
   sellerId:'otto',amountScales:q.amountScales,
   workHash,workDay:finished.source.day,
   day,paymentSourceHash:payment.sourceHash};
 row.settlement={source:record,hash:hash(record)};
 if(!verify(w)||!People.verify(w,p))
  throw Error('Physical wage transfer did not reconcile with its actual accepted source');
 return {...paid,agreementId:q.id,independentMutualConsent:true,
  originalWageTermsSettled:true,noExtraPaymentOrWork:true};
}
function settleVisitorService(s,{actorId,agreementId,workHash,...extra}={}){
 if(Object.keys(extra).length||typeof actorId!=='string'||
  !/^emergent:person_[0-9]+$/.test(actorId)||
  typeof agreementId!=='string'||typeof workHash!=='string')
  throw Error('Original independent market payment accepts only the actual worker and individually completed work receipt, not a chosen amount or success');
 const w=require('./simulation').peek(s),
  p=w?.emergentPeople?.people?.[actorId.slice(9)];
 if(!p||w.emergentPeople?.people?.[p.id]!==p)
  throw Error('Unknown independently lived visitor cannot be paid');
 return settle(w,p,{agreementId,workHash,
  day:Math.floor(s.world.minutes/1440)},s);
}
function workerTerms(w,p){
 if(!originalWorker(w,p)||!verify(w))
  throw Error('Only the real individual may inspect their original local work terms');
 return (w.localProvisioner?.serviceTerms||[])
  .filter(x=>x.workerId===p.id).map(x=>({
   id:x.id,amountScales:x.source.amountScales,
   dutyId:x.source.dutyId,scope:x.source.scope,
   agreed:x.accepted,settled:!!x.settlement,
   day:x.source.day,throughDay:x.source.throughDay,
   notCompulsoryWork:true,noPayUntilActualSuccessfulWork:true}));
}
module.exports={ORIGIN,SETTLEMENT,VISITOR_WORK,negotiate,
 visitorWorkStatus,performVisitorService,settleVisitorService,settle,verify,workerTerms};
