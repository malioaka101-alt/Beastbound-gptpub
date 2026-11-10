'use strict';
// Independent, source-grounded PROFESSIONAL competence for newly generated
// living people. Time only dates genuine work; it never awards experience.
// No automatic school fees, surnames, licences, magical disciplines, or
// player-centred promotions. Challenge and aptitude determine growth.
const Crypto=require('node:crypto'),Atlas=require('./atlas');
const ORIGIN='independent-person-earned-profession-v1',
 WORK='source-verified-person-work-v1',VERSION=1,
 TITLES=['Untrained','Novice','Trained','Expert','Master','Grandmaster'],
 THRESHOLDS=[0,10,25,50,100,200];
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const clamp=(n,a=0,b=100)=>Math.min(b,Math.max(a,n));
function draw(p){
 let x=p.rngState>>>0;
 if(!x)throw Error('Independent citizen has no genuine individual RNG');
 x^=x<<13;x^=x>>>17;x^=x<<5;
 p.rngState=(x>>>0)||0x91e10da5;
 return p.rngState/4294967296;
}
function innate(p){
 // Entirely individual seeded potential; never infer biological inheritance
 // in the absence of source-backed actual parents.
 return 1+(parseInt(hash('person-practice-aptitude|'+p.originHash+'|'+p.id).slice(0,8),16)%9);
}
function initial(p){
 const source={origin:ORIGIN,personId:p.id,actorId:p.actorId,
  personOriginHash:p.originHash,professionAtOrigin:p.birthSource.initialProfession,
  nativeRegion:p.birthSource.regionId,nonHereditaryEstimate:true};
 return {version:VERSION,origin:ORIGIN,source,sourceHash:hash(source),
  aptitude:innate(p),skillPoints:0,competenceRank:0,
  demonstratedMethods:{},qualityPoints:0,workCount:0,successes:0,
  promotions:[],workReceipts:[],authoredDuties:[],attestations:[],workOffers:[],peerGuidance:[],recognizedLicence:null,
  supernaturalSystemRanks:{},knownTechniques:[]};
}
function credibleAssistance(a){
 if(!a||!['survival','diplomacy','crafting'].includes(a.skill)||
    !['success','strong','exceptional','setback','failure','severe failure'].includes(a.degree)||
    typeof a.success!=='boolean'||
    a.success!==['success','strong','exceptional'].includes(a.degree)||
    typeof a.checkEventHash!=='string'||!/^[a-f0-9]{64}$/.test(a.checkEventHash))
  return false;
 const value=a.success?(['strong','exceptional'].includes(a.degree)?2:1):0;
 return a.support===value;
}
function verify(p){
 const c=p?.career;
 if(c===undefined)return true; // Backward-compatible prior living people.
 if(!c||c.version!==VERSION||c.origin!==ORIGIN||
  c.sourceHash!==hash(c.source)||c.source.origin!==ORIGIN||
  c.source.personId!==p.id||c.source.actorId!==p.actorId||
  c.source.personOriginHash!==p.originHash||
  c.source.professionAtOrigin!==p.birthSource.initialProfession||
  c.aptitude!==innate(p)||!Number.isInteger(c.skillPoints)||
  c.skillPoints<0||c.skillPoints>10000000||
  !Number.isInteger(c.qualityPoints)||c.qualityPoints<0||
  !Number.isInteger(c.competenceRank)||c.competenceRank<0||
  c.competenceRank>5||c.skillPoints<THRESHOLDS[c.competenceRank]||
  !Number.isInteger(c.workCount)||c.workCount<0||
  !Number.isInteger(c.successes)||c.successes<0||
  c.successes>c.workCount||
  !c.demonstratedMethods||typeof c.demonstratedMethods!=='object'||
  Array.isArray(c.demonstratedMethods)||
  Object.entries(c.demonstratedMethods).some(([k,v])=>
   !/^[a-z-]{4,40}$/.test(k)||!Number.isInteger(v)||v<1||v>c.successes)||
  !Array.isArray(c.workReceipts)||c.workReceipts.length>24||
  c.workReceipts.length>c.workCount||
  !Array.isArray(c.promotions)||c.promotions.length>5||
  c.promotions.some((r,i)=>r?.rank!==i+1||
   typeof r.receiptHash!=='string'||r.receiptHash.length!==64)||
  c.promotions.length!==c.competenceRank||
  c.recognizedLicence!==null||
  !c.supernaturalSystemRanks||Object.keys(c.supernaturalSystemRanks).length||
  !Array.isArray(c.knownTechniques)||c.knownTechniques.length||
  c.workReceipts.some(r=>!r||r.origin!==WORK||
   r.sourceHash!==hash(r.source)||
   r.source?.personId!==p.id||
   r.source?.personOriginHash!==p.originHash||
   r.source?.outcome?.success!==Boolean(r.source?.outcome?.success)||
   !Number.isInteger(r.source?.day)||
   typeof r.source?.task?.method!=='string'||
   (r.source?.context==='locally-assisted-duty'?
    !credibleAssistance(r.source.assistance):
    r.source?.assistance!==undefined||
     !['independent-duty','locally-witnessed-duty'].includes(r.source?.context))))return false;
 // GM-authored work is part of this *same* independently earned career, not
 // an extra salary engine or permission to fabricate institutional authority.
 if(c.authoredDuties!==undefined&&
   (!Array.isArray(c.authoredDuties)||
    c.authoredDuties.some(d=>!verifyDuty(p,d))||
    new Set(c.authoredDuties.map(d=>d.id)).size!==c.authoredDuties.length))
  return false;
 if(c.attestations!==undefined &&
   (!Array.isArray(c.attestations) ||
    c.attestations.some(a=>!verifyAttestation(p,a)) ||
    new Set(c.attestations.map(a=>a.id)).size!==c.attestations.length))
  return false;
 if(c.workOffers!==undefined &&
   (!Array.isArray(c.workOffers) ||
    c.workOffers.some(x=>!verifyWorkOffer(p,x)) ||
    new Set(c.workOffers.map(x=>x.id)).size!==c.workOffers.length))
  return false;
 if(c.peerGuidance!==undefined&&
   (!Array.isArray(c.peerGuidance)||
    c.peerGuidance.some(e=>!verifyPeerGuidance(p,e))||
    new Set(c.peerGuidance.map(e=>e.id)).size!==c.peerGuidance.length))
  return false;
 return true;
}
function ensure(p){
 if(!p.career)p.career=initial(p);
 if(!verify(p))throw Error('Unverified citizen profession, promotion or fake magical rank');
 return p.career;
}

// An open-ended assignment of real local work, authored by the GM after a
// scene/world source. An offered duty is not a forced career, wage, licence,
// personal skill, employer consent, or pre-decided dice result.
const DUTY='gm-source-authored-person-work-v1';
const METHOD=/^[a-z][a-z-]{3,39}$/;
function verifyDuty(p,d){
 const q=d?.source;
 if(!d||d.origin!==DUTY||d.sourceHash!==hash(q)||
   q?.origin!==DUTY||q.personId!==p.id||q.actorId!==p.actorId||
   q.personOriginHash!==p.originHash||q.id!==d.id||
   q.role!==d.role||q.method!==d.method||q.goal!==d.goal||
   q.domain!==d.domain||q.effect!==d.effect||
   q.institutionId!==d.institutionId||
   q.regionId!==d.regionId||q.day!==d.openedDay||
   Atlas.R[d.regionId]?.polity!==q.originalPolity||
   !/^[a-z][a-z0-9_-]{3,60}$/.test(d.id)||
   !METHOD.test(d.method)||
   !['ecology','civic','trade'].includes(d.domain)||
   typeof d.role!=='string'||d.role.trim().length<6||d.role.length>130||
   typeof d.goal!=='string'||d.goal.trim().length<12||d.goal.length>250||
   typeof q.witness!=='string'||q.witness.length<24||q.witness.length>500||
   !Atlas.R[d.regionId]||!Atlas.P[q.originalPolity]||
   !Number.isInteger(d.openedDay)||d.openedDay<p.birthSource.day||
   d.openedDay>10000000||
   (d.institutionId!==null&&(!Atlas.I[d.institutionId]||
    Atlas.I[d.institutionId].polity!==q.originalPolity))||
   ![null,'habitat-repair','water-management'].includes(d.effect)||
   (d.effect!==null&&d.domain!=='ecology')||
   !['available','retired'].includes(d.status)||
   !Array.isArray(d.workProofHashes)||
   d.workProofHashes.some(h=>typeof h!=='string'||!/^[a-f0-9]{64}$/.test(h)))
  return false;
 if(d.status==='retired'){
  const e=d.ending;
  if(!e||e.hash!==hash(e.source)||e.source.origin!=='gm-recorded-duty-retirement-v1'||
    e.source.id!==d.id||e.source.personId!==p.id||
    e.source.priorDutySourceHash!==d.sourceHash||
    !Number.isInteger(e.source.day)||e.source.day<d.openedDay||
    typeof e.source.reason!=='string'||e.source.reason.length<20)
   return false;
 }else if(d.ending!==null)return false;
 return true;
}
function authorDuty(w,p,{id,role,method,goal,domain,effect=null,
 institutionId=null,day,witness}={}){
 const c=ensure(p);
 if(c.authoredDuties===undefined)c.authoredDuties=[]; // Backfill prior valid lives.
 if(!w||!w.ecosystems?.[p.regionId]||!w.countries?.[p.polity]||
   !Number.isInteger(day)||day<p.birthSource.day||day>w.lastTickDay||
   !Array.isArray(c.authoredDuties)||c.authoredDuties.some(d=>d.id===id)||
   typeof witness!=='string'||witness.trim().length<24||
   (institutionId!==null&&(!Atlas.I[institutionId]||
     Atlas.I[institutionId].polity!==p.polity||
     w.institutions?.[institutionId]?.status!=='active')))
  throw Error('An original local worker, established source and real existing employer are required');
 const source={origin:DUTY,personId:p.id,actorId:p.actorId,
  personOriginHash:p.originHash,id,role,method,goal,domain,effect,
  regionId:p.regionId,originalPolity:p.polity,institutionId,day,witness};
 const duty={id,origin:DUTY,role,method,goal,domain,effect,institutionId,
  regionId:p.regionId,openedDay:day,status:'available',ending:null,
  workProofHashes:[],source,sourceHash:hash(source)};
 if(!verifyDuty(p,duty))throw Error('Invalid authored work or unsupported effect; cannot create a free power or job');
 c.authoredDuties.push(duty);
 if(!verify(p))throw Error('Authored work would break original living-career integrity');
 return {id,role,method,goal,domain,available:true,
  independentlyChosenWorkStillRequired:true,
  noLicenceOrGuaranteedWage:true,noAutomaticSkill:true};
}
function retireDuty(w,p,{id,day,reason}={}){
 const c=ensure(p),d=c.authoredDuties?.find(x=>x.id===id);
 if(!d||d.status!=='available'||!Number.isInteger(day)||
   day<d.openedDay||day>w?.lastTickDay||
   typeof reason!=='string'||reason.trim().length<20)
  throw Error('An existing job and real sourced change are needed to retire a duty');
 const source={origin:'gm-recorded-duty-retirement-v1',
  id,personId:p.id,priorDutySourceHash:d.sourceHash,day,reason};
 d.ending={source,hash:hash(source)};
 d.status='retired';
 if(!verify(p))throw Error('Work history cannot be erased or silently reassigned');
 return {id,retired:true,priorWorkRetained:d.workProofHashes.length,
  noInventedDismissalPayout:true};
}
function authoredDutyStatus(p){
 if(!verify(p))throw Error('Cannot inspect forged career history');
 return (p.career?.authoredDuties||[]).map(d=>({
  id:d.id,role:d.role,method:d.method,goal:d.goal,domain:d.domain,
  institutionId:d.institutionId,regionId:d.regionId,status:d.status,
  verifiedCompletedWork:d.workProofHashes.length,
  noAutoWageOrQualification:true
 }));
}


const ATTEST='verified-person-practical-attestation-v1';
const REVOKE_ATTEST='verified-person-practical-revocation-v1';
function verifyAttestation(p,a){
 const q=a?.source,r=q?.work;
 if(!a || a.origin!==ATTEST || a.sourceHash!==hash(q) ||
  q?.origin!==ATTEST || q.id!==a.id || q.personId!==p.id ||
  q.personOriginHash!==p.originHash ||
  q.issuerId!==a.issuerId || q.witnessId!==a.witnessId ||
  q.witnessName!==a.witnessName || q.method!==a.method ||
  q.scope!==a.scope || q.issuedDay!==a.issuedDay ||
  q.expiresDay!==a.expiresDay ||
  !/^[a-z][a-z0-9_-]{5,69}$/.test(a.id) ||
  !Atlas.I[a.issuerId] ||
  typeof a.witnessId!=='string' ||
  typeof a.witnessName!=='string' || a.witnessName.length<4 ||
  !METHOD.test(a.method) ||
  typeof a.scope!=='string' || a.scope.trim().length<12 ||
  a.scope.length>240 ||
  typeof q.witness!=='string' || q.witness.trim().length<30 ||
  q.witness.length>500 ||
  !Number.isInteger(a.issuedDay) || a.issuedDay<p.birthSource.day ||
  (a.expiresDay!==null &&
   (!Number.isInteger(a.expiresDay) || a.expiresDay<a.issuedDay)) ||
  q.issuerPolity!==Atlas.I[a.issuerId].polity ||
  !r || q.workHash!==hash(r) ||
  r.origin!==WORK || r.personId!==p.id ||
  r.personOriginHash!==p.originHash ||
  r.task?.method!==a.method || r.outcome?.success!==true ||
  !Number.isInteger(r.day) || r.day>a.issuedDay ||
  !p.career?.demonstratedMethods?.[a.method] ||
  !['issued','revoked'].includes(a.status))return false;
 if(a.status==='issued')return a.revocation===null;
 const z=a.revocation?.source;
 return !!z && a.revocation.hash===hash(z) &&
  z.origin===REVOKE_ATTEST && z.id===a.id &&
  z.priorSourceHash===a.sourceHash &&
  z.personId===p.id && z.issuerId===a.issuerId &&
  Number.isInteger(z.day) && z.day>=a.issuedDay &&
  typeof z.reason==='string' && z.reason.trim().length>=20;
}
function issueAttestation(w,p,{id,issuerId,witnessId,method,scope,
 day,witness,expiresDay=null}={}){
 const c=ensure(p);
 if(c.attestations===undefined)c.attestations=[];
 const issuer=Atlas.I[issuerId],officer=w?.notables?.[witnessId];
 if(!issuer || !officer || officer.institution!==issuerId ||
  issuer.polity!==p.polity ||
  w.institutions?.[issuerId]?.status!=='active' ||
  !w.countries?.[p.polity] ||
  !Number.isInteger(day) || day<p.birthSource.day || day>w.lastTickDay ||
  c.attestations.some(a=>a.id===id))
  throw Error('A real active institution, affiliated witness and original worker are required');
 const receipt=c.workReceipts.slice().reverse().find(x=>
  x.source?.task?.method===method &&
  x.source?.outcome?.success===true && x.source?.day<=day);
 if(!receipt || !c.demonstratedMethods[method])
  throw Error('A genuinely successful previously recorded work check is required');
 const q={origin:ATTEST,id,personId:p.id,personOriginHash:p.originHash,
  issuerId,issuerPolity:issuer.polity,witnessId,witnessName:officer.name,
  method,scope,issuedDay:day,expiresDay,witness,
  workHash:receipt.sourceHash,work:structuredClone(receipt.source)};
 const a={origin:ATTEST,id,issuerId,witnessId,witnessName:officer.name,
  method,scope,issuedDay:day,expiresDay,status:'issued',revocation:null,
  source:q,sourceHash:hash(q)};
 if(!verifyAttestation(p,a))
  throw Error('An earned attestation must have its original observed decision and genuine scope');
 c.attestations.push(a);
 if(!verify(p))throw Error('Original personal career cannot accept this attestation');
 return {id,issuerId,method,earnedWorkHash:receipt.sourceHash,
  noFormalLicenceImplied:true,noMagicOrEmploymentGranted:true};
}
function revokeAttestation(w,p,{id,day,reason}={}){
 const c=ensure(p),a=c.attestations?.find(x=>x.id===id);
 if(!a || a.status!=='issued' || !Number.isInteger(day) ||
  day<a.issuedDay || day>w?.lastTickDay ||
  typeof reason!=='string' || reason.trim().length<20)
  throw Error('A real earlier attestation and recorded withdrawal are required');
 const q={origin:REVOKE_ATTEST,id,priorSourceHash:a.sourceHash,
  personId:p.id,issuerId:a.issuerId,day,reason};
 a.revocation={source:q,hash:hash(q)};
 a.status='revoked';
 if(!verify(p))throw Error('Withdrawal cannot rewrite the earlier earned work');
 return {id,revoked:true,originalWorkRetained:true,noSkillRankLost:true};
}
function attestationStatus(p,{day}={}){
 if(!verify(p) || !Number.isInteger(day) || day<0)
  throw Error('Valid personal career and actual world day are required');
 return (p.career?.attestations||[]).map(a=>({
  id:a.id,issuerId:a.issuerId,method:a.method,scope:a.scope,
  issuedDay:a.issuedDay,expiresDay:a.expiresDay,
  status:a.status==='revoked'?'revoked':
   a.expiresDay!==null&&day>a.expiresDay?'expired':'issued',
  verifiedWorkHash:a.source.workHash,
  noGlobalLicenceOrMagicUnlock:true
 }));
}


/*
 * Real, voluntary local assignments: issue a source-grounded institution
 * opportunity to ONE actual person; that person uses their own RNG to choose
 * independently. Only an actual original work action may fulfill the offer.
 * All numbers are local physical/livelihood evidence, not a wage conversion.
 */
const WORK_OFFER='individual-source-work-offer-v1';
const OFFER_END='individual-work-offer-ending-v1';
const workerChance=(aptitude,fatigue,pressure)=>
 Math.min(.85,Math.max(.18,.55+(aptitude-5)*.025-
 (fatigue>60?.15:0)-(pressure>70?.08:0)));
function verifyWorkOffer(p,o){
 const q=o?.source, c=p.career;
 if(!o||o.origin!==WORK_OFFER||o.sourceHash!==hash(q)||
  q?.origin!==WORK_OFFER||q.id!==o.id||q.personId!==p.id||
  q.personOriginHash!==p.originHash||
  q.dutyId!==o.dutyId||q.dutyHash!==o.dutyHash||
  q.issuerId!==o.issuerId||q.issuerWitnessId!==o.issuerWitnessId||
  q.dutyRegion!==o.regionId||q.startDay!==o.startDay||
  q.endDay!==o.endDay||q.risk!==o.risk||
  q.safetyPlan!==o.safetyPlan||q.agreedScope!==o.agreedScope||
  !/^[a-z][a-z0-9_-]{5,69}$/.test(o.id)||
  !Number.isInteger(o.startDay)||o.startDay<p.birthSource.day||
  !Number.isInteger(o.endDay)||o.endDay<o.startDay||
  !Atlas.I[o.issuerId]||Atlas.I[o.issuerId].polity!==Atlas.R[o.regionId]?.polity||
  typeof o.issuerWitnessId!=='string'||o.issuerWitnessId.length<3||
  !Atlas.R[o.regionId]||
  !Atlas.R[o.regionId].dangers.includes(o.risk)||
  typeof o.safetyPlan!=='string'||o.safetyPlan.trim().length<25||
  o.safetyPlan.length>350||
  typeof o.agreedScope!=='string'||o.agreedScope.trim().length<20||
  o.agreedScope.length>350||
  typeof q.issuerOfferWitness!=='string'||
  q.issuerOfferWitness.trim().length<32||
  q.issuerOfferWitness.length>550||
  !Number.isInteger(q.fatigueAtDecision)||q.fatigueAtDecision<0||
  q.fatigueAtDecision>100||
  !Number.isInteger(q.pressureAtDecision)||q.pressureAtDecision<0||
  q.pressureAtDecision>100||
  typeof q.workerDraw!=='number'||q.workerDraw<0||q.workerDraw>=1||
  q.willingness!==workerChance(c.aptitude,q.fatigueAtDecision,q.pressureAtDecision)||
  o.accepted!==(q.workerDraw<q.willingness)||
  !c.authoredDuties?.some(d=>d.id===o.dutyId&&d.sourceHash===o.dutyHash&&
    d.regionId===o.regionId&&d.institutionId===o.issuerId)||
  !Array.isArray(o.attemptedWork)||
  o.attemptedWork.some(e=>e?.hash!==hash(e.source)||
   e.source?.personId!==p.id||e.source?.personOriginHash!==p.originHash||
   e.source?.task?.authoredDutyId!==o.dutyId||
   e.source?.task?.activeOfferId!==o.id||
   !Number.isInteger(e.source?.day)||e.source.day<o.startDay||
   e.source.day>o.endDay)||
  !['accepted','declined','ended'].includes(o.status))
  return false;
 if(!o.accepted)
  return o.status==='declined'&&o.ending===null&&o.attemptedWork.length===0;
 if(o.status==='ended'){
  const v=o.ending?.source;
  return !!v && o.ending.hash===hash(v) &&
   v.origin===OFFER_END&&v.id===o.id&&v.personId===p.id&&
   v.priorSourceHash===o.sourceHash&&
   v.issuerId===o.issuerId&&
   Number.isInteger(v.day)&&v.day>=o.startDay&&
   ['worker','issuer'].includes(v.initiatedBy)&&
   typeof v.reason==='string'&&v.reason.trim().length>=25;
 }
 return o.status==='accepted'&&o.ending===null;
}
function offerDuty(w,p,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
   Object.keys(params).some(k=>!['id','dutyId','issuerId','witnessId',
    'startDay','endDay','risk','safetyPlan','agreedScope',
    'issuerOfferWitness'].includes(k)))
  throw Error('A worker cannot be assigned a chosen acceptance, salary, rank or decision');
 const {id,dutyId,issuerId,witnessId,startDay,endDay,risk,safetyPlan,
  agreedScope,issuerOfferWitness}=params;
 const c=ensure(p),d=c.authoredDuties?.find(x=>x.id===dutyId);
 if(c.workOffers===undefined)c.workOffers=[];
 const officer=w?.notables?.[witnessId],issuer=w?.institutions?.[issuerId],
  ecology=w?.ecosystems?.[p.regionId];
 if(!d||d.status!=='available'||d.regionId!==p.regionId||
  d.institutionId!==issuerId||
  !officer||officer.institution!==issuerId||
  issuer?.status!=='active'||!ecology||!Number.isInteger(startDay)||
  startDay<p.birthSource.day||startDay>w.lastTickDay||
  !Number.isInteger(endDay)||endDay<startDay||
  c.workOffers.some(x=>x.id===id ||
    (x.dutyId===dutyId&&x.issuerId===issuerId&&x.startDay===startDay)))
  throw Error('An actual institution offer, distinct day and autonomous locally eligible worker are required');
 const fatigueAtDecision=p.fatigue,pressureAtDecision=ecology.pressure;
 const willingness=workerChance(c.aptitude,fatigueAtDecision,pressureAtDecision);
 // Validate the authored offer *before* consuming the worker's one decision.
 const provisional={id,origin:WORK_OFFER,dutyId,dutyHash:d.sourceHash,
  issuerId,issuerWitnessId:witnessId,regionId:d.regionId,
  startDay,endDay,risk,safetyPlan,agreedScope,accepted:false,
  status:'declined',ending:null,attemptedWork:[]};
 const prelim={origin:WORK_OFFER,id,personId:p.id,
  personOriginHash:p.originHash,dutyId,dutyHash:d.sourceHash,
  issuerId,issuerWitnessId:witnessId,dutyRegion:d.regionId,
  startDay,endDay,risk,safetyPlan,agreedScope,
  issuerOfferWitness,fatigueAtDecision,pressureAtDecision,willingness};
 const pretend={...provisional,source:{...prelim,workerDraw:0.99},sourceHash:hash({...prelim,workerDraw:0.99})};
 if(!verifyWorkOffer(p,pretend))
  throw Error('A real risk, written safety measure and witnessed offer are required before worker consent');
 const workerDraw=draw(p),accepted=workerDraw<willingness;
 const q={...prelim,workerDraw},o={...provisional,accepted,
  status:accepted?'accepted':'declined',source:q,sourceHash:hash(q)};
 c.workOffers.push(o);
 if(!verify(p))throw Error('The independent decision failed original career verification');
 return {id,accepted,decision:accepted?'accepted':'declined',
  risk,documentedSafetyPlan:true,scope:agreedScope,
  noCompulsoryEmployment:true,noPromisedWage:true,noForcedCooperation:true};
}
function endWorkOffer(w,p,{id,day,initiatedBy,reason}={}){
 const c=ensure(p),o=c.workOffers?.find(a=>a.id===id);
 if(!o||o.status!=='accepted'||
  !Number.isInteger(day)||day<o.startDay||day>w?.lastTickDay||
  !['worker','issuer'].includes(initiatedBy)||
  typeof reason!=='string'||reason.trim().length<25)
  throw Error('An existing active voluntary offer and witnessed ending are required');
 const q={origin:OFFER_END,id,personId:p.id,
  priorSourceHash:o.sourceHash,issuerId:o.issuerId,day,
  initiatedBy,reason};
 o.ending={source:q,hash:hash(q)};o.status='ended';
 if(!verify(p))throw Error('An ending must not delete genuine earlier work');
 return {id,ended:true,attemptedWorkRetained:o.attemptedWork.length,
  noAutomaticWageOrPunishment:true};
}
function workOfferStatus(p,{day}={}){
 if(!verify(p)||!Number.isInteger(day)||day<0)
  throw Error('Work offer inspection requires a valid career and world date');
 return (p.career?.workOffers||[]).map(o=>({
  id:o.id,dutyId:o.dutyId,issuerId:o.issuerId,
  scope:o.agreedScope,risk:o.risk,safetyPlan:o.safetyPlan,
  status:o.status==='accepted'&&day>o.endDay?'expired':o.status,
  actualWorkAttempts:o.attemptedWork.length,
  noPromisedWage:true,noLicenceGranted:true
 }));
}


/* Optional individually witnessed peer instruction. Not a paid teacher,
   automatic skill, qualification, apprenticeship contract or power system.
   The previously known task remains the learner's OWN genuine d20 work. */
const PEER='independently-witnessed-peer-guidance-v1';
const peerChance=fatigue=>Math.min(.75,Math.max(.20,.62-(fatigue>65?.20:fatigue>40?.10:0)));
function peerStep(seed){
 let x=seed>>>0;
 x^=x<<13;x^=x>>>17;x^=x<<5;
 const rngState=(x>>>0)||0x91e10da5;
 return {rngState,draw:rngState/4294967296};
}
function verifyPeerGuidance(p,e){
 const q=e?.source,pr=q?.teacherWork;
 if(!e||e.origin!==PEER||e.sourceHash!==hash(q)||
  q?.origin!==PEER||e.id!==q.id||
  q.learnerId!==p.id||q.learnerOriginHash!==p.originHash||
  q.teacherId!==e.teacherId||q.teacherOriginHash!==e.teacherOriginHash||
  q.method!==e.method||q.day!==e.day||
  !/^[a-z][a-z0-9_-]{5,69}$/.test(e.id)||
  !METHOD.test(e.method)||
  e.teacherId===p.id||
  typeof q.place!=='string'||q.place.length<2||
  typeof q.teacherShiftHash!=='string'||q.teacherShiftHash.length!==64||
  typeof q.learnerShiftHash!=='string'||q.learnerShiftHash.length!==64||
  !Number.isInteger(q.validThroughDay)||q.validThroughDay<q.day||
  !Number.isInteger(e.day)||e.day<p.birthSource.day||
  typeof q.witness!=='string'||q.witness.trim().length<30||
  q.witness.length>480||
  !pr||q.teacherWorkHash!==hash(pr)||
  pr.origin!==WORK||pr.personId!==e.teacherId||
  pr.personOriginHash!==e.teacherOriginHash||
  pr.task?.method!==e.method||pr.outcome?.success!==true||
  !Number.isInteger(pr.day)||pr.day>e.day||
  !Number.isInteger(q.teacherRngBefore)||q.teacherRngBefore<1||
  !Number.isInteger(q.teacherRngAfter)||q.teacherRngAfter<1||
  peerStep(q.teacherRngBefore).rngState!==q.teacherRngAfter||
  q.teacherChoice!==peerStep(q.teacherRngBefore).draw||
  !Number.isInteger(q.teacherFatigueBefore)||q.teacherFatigueBefore<0||
  q.teacherFatigueBefore>100||
  !Number.isInteger(q.learnerFatigueBefore)||q.learnerFatigueBefore<0||
  q.learnerFatigueBefore>100||
  q.willingness!==peerChance(q.teacherFatigueBefore)||
  e.accepted!==(q.teacherChoice<q.willingness)||
  !['declined','accepted','used'].includes(e.status))return false;
 if(!e.accepted)return e.status==='declined'&&e.used===null&&
  q.teacherFatigueAfter===q.teacherFatigueBefore&&
  q.learnerFatigueAfter===q.learnerFatigueBefore;
 if(q.teacherFatigueAfter!==clamp(q.teacherFatigueBefore+2)||
  q.learnerFatigueAfter!==clamp(q.learnerFatigueBefore+2))
  return false;
 if(e.status==='accepted')return e.used===null;
 const receipt=e.used?.source;
 return e.status==='used'&&!!receipt&&
  e.used.hash===hash(receipt)&&
  receipt.origin===WORK&&receipt.personId===p.id&&
  receipt.personOriginHash===p.originHash&&
  receipt.task?.method===e.method&&
  receipt.peerGuidanceHash===e.sourceHash&&
  receipt.peerGuidanceBonus===1&&
  Number.isInteger(receipt.day)&&receipt.day>=e.day&&
  receipt.day<=q.validThroughDay;
}
function observePeerGuidance(w,learner,teacher,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
  Object.keys(params).some(k=>!['id','method','day','witness'].includes(k)))
  throw Error('Instruction cannot choose mentor consent, skill gain or a successful check');
 const {id,method,day,witness}=params;
 const c=ensure(learner),tc=ensure(teacher);
 if(c.peerGuidance===undefined)c.peerGuidance=[];
 const People=require('./emergent-people');
 const location=learner?.shift?.location;
 const lp=People.presence(w,learner.actorId,location,day),
  tp=People.presence(w,teacher.actorId,location,day);
 const teacherWork=tc.workReceipts.slice().reverse().find(r=>
  r.source?.task?.method===method&&r.source?.outcome?.success===true&&
  r.source.day<=day);
 if(!lp||!tp||teacher.id===learner.id||
  !Number.isInteger(day)||day<0||day>w.lastTickDay||
  !teacherWork||!tc.demonstratedMethods[method]||
  learner.fatigue>85||teacher.fatigue>85||
  typeof witness!=='string'||witness.trim().length<30||
  !/^[a-z][a-z0-9_-]{5,69}$/.test(id)||
  c.peerGuidance.some(x=>x.id===id||
   x.teacherId===teacher.id&&x.method===method&&x.day===day))
  throw Error('Two genuinely present autonomous workers and a source-proven teachable method are required');
 const teacherRngBefore=teacher.rngState,
  teacherFatigueBefore=teacher.fatigue,
  learnerFatigueBefore=learner.fatigue,
  willingness=peerChance(teacherFatigueBefore);
 // All original validity checks precede the teacher's single decision.
 const teacherChoice=draw(teacher),accepted=teacherChoice<willingness;
 if(accepted){
  teacher.fatigue=clamp(teacher.fatigue+2);
  learner.fatigue=clamp(learner.fatigue+2);
 }
 const q={origin:PEER,id,learnerId:learner.id,
  learnerOriginHash:learner.originHash,teacherId:teacher.id,
  teacherOriginHash:teacher.originHash,
  method,day,place:location,learnerShiftHash:lp.hash,
  teacherShiftHash:tp.hash,validThroughDay:Math.min(lp.throughDay,tp.throughDay),
  witness,teacherWorkHash:teacherWork.sourceHash,
  teacherWork:structuredClone(teacherWork.source),
  teacherRngBefore,teacherRngAfter:teacher.rngState,teacherChoice,
  teacherFatigueBefore,teacherFatigueAfter:teacher.fatigue,
  learnerFatigueBefore,learnerFatigueAfter:learner.fatigue,willingness};
 const e={id,origin:PEER,method,teacherId:teacher.id,
  teacherOriginHash:teacher.originHash,day,accepted,
  status:accepted?'accepted':'declined',used:null,source:q,
  sourceHash:hash(q)};
 c.peerGuidance.push(e);
 if(!verify(learner)||!verify(teacher))
  throw Error('An individual teaching decision must remain original and independently witnessed');
 return {id,accepted,status:e.status,method,
  noGuaranteedLearning:true,noCompulsoryTeacher:true,
  noRankOrSpellGranted:true,noWageOrContract:true};
}
function peerGuidanceStatus(p,{day}={}){
 if(!verify(p)||!Number.isInteger(day)||day<0)
  throw Error('A valid living worker and current day are needed');
 return (p.career?.peerGuidance||[]).map(e=>({
  id:e.id,method:e.method,teacherId:e.teacherId,
  status:e.status==='accepted'&&day>e.source.validThroughDay?'expired':e.status,
  appliedTo:e.used?.hash||null,
  noSkillAwarded:true
 }));
}

function task(w,p,day=w.lastTickDay){
 const eco=w.ecosystems?.[p.regionId],host=w.countries?.[p.polity],
  region=Atlas.R[p.regionId];
 if(!eco||!host||!region||region.polity!==p.polity||
  ![eco.quality,eco.pressure,eco.water,eco.forage,host.stability,
   host.prosperity].every(Number.isFinite))
  throw Error('An independently lived profession requires actual current local conditions');
 const need=p.birthSource.need;
 // General functional job patterns adapt to what is *actually happening*
 // instead of assuming a fixed preauthored profession directory.
 const available=need==='habitat-care'?[
   {method:'habitat-survey',domain:'ecology',goal:'record local damage'},
   {method:'habitat-repair',domain:'ecology',goal:'reduce local environmental pressure'},
   {method:'water-management',domain:'ecology',goal:'improve practical water care'}
  ]:need==='community-relief'?[
   {method:'supply-coordination',domain:'civic',goal:'organise fair local goods access'},
   {method:'public-repair',domain:'civic',goal:'repair useful common infrastructure'},
   {method:'dispute-mediation',domain:'civic',goal:'reduce a local community dispute'}
  ]:need==='local-provisioning'?[
   {method:'supply-survey',domain:'trade',goal:'locate workable regional goods'},
   {method:'route-planning',domain:'trade',goal:'improve practical supply routes'},
   {method:'storage-care',domain:'trade',goal:'reduce supply spoilage'}
  ]:[
   {method:'goods-craft',domain:'trade',goal:'make useful local trade goods'},
   {method:'tool-repair',domain:'trade',goal:'maintain working equipment'},
   {method:'market-service',domain:'trade',goal:'serve local trade fairly'}
  ];
 // The same independently chosen real work engine can develop any number
 // of locally established duties. A role's founding never forces the worker
 // to take it; existing work and rest remain available.
 const c=ensure(p);
 for(const duty of c.authoredDuties||[]){
  if(duty.status==='available'&&duty.regionId===p.regionId&&
    (duty.institutionId===null||
      w.institutions?.[duty.institutionId]?.status==='active'))
   {
    const valid=c.workOffers?.filter(a=>a.dutyId===duty.id&&
      a.status==='accepted'&&a.startDay<=day&&a.endDay>=day);
    const active=valid?.at(-1);
    available.push({method:duty.method,goal:duty.goal,
      domain:duty.domain,effect:duty.effect,authoredDutyId:duty.id,
      ...(active?{activeOfferId:active.id}:{})});
   }
 }
 const work=available[Math.floor(draw(p)*available.length)];
 const pressure=eco.pressure>69?3:eco.quality<38?2:0,
  scarcity=eco.water<40||eco.forage<40?2:0,
  instability=host.stability<40?2:0;
 return {...work,regionId:p.regionId,polity:p.polity,
  localGood:region.goods[0],
  context:{quality:eco.quality,pressure:eco.pressure,
   water:eco.water,forage:eco.forage,stability:host.stability,
   prosperity:host.prosperity},
  difficulty:12+pressure+scarcity+instability};
}
function work(w,p,day,context='independent-duty',assistance=null){
 if(!Number.isInteger(day)||day<0||
   !['independent-duty','locally-witnessed-duty','locally-assisted-duty'].includes(context))
  throw Error('Independent real work requires an actual witnessed or world source');
 const assisted=context==='locally-assisted-duty';
 if((!assisted&&assistance!==null)||
    (assisted&&(!assistance||!['survival','diplomacy','crafting'].includes(assistance.skill)||
     !['success','strong','exceptional','setback','failure','severe failure'].includes(assistance.degree)||
     typeof assistance.success!=='boolean'||
     assistance.success!==['success','strong','exceptional'].includes(assistance.degree)||
     typeof assistance.rollEventHash!=='string'||!/^[a-f0-9]{64}$/.test(assistance.rollEventHash))))
  throw Error('Cooperative work needs an actual separately resolved and witnessed player skill check');
 const support=assisted&&assistance.success?
   (['strong','exceptional'].includes(assistance.degree)?2:1):0;
 const c=ensure(p),job=task(w,p,day),
  innovation=require('./independent-innovations').workBonus(w,p,job.method),
  local=w.ecosystems[p.regionId],
  polity=w.countries[p.polity],
  originalSkill=c.competenceRank,
  supportFromPeer=(c.peerGuidance||[]).slice().reverse().find(e=>
   e.accepted&&e.status==='accepted'&&
   e.method===job.method&&e.day<=day&&day<=e.source.validThroughDay),
  peerBonus=supportFromPeer?1:0,
  dc=job.difficulty+Math.floor(originalSkill/2),
  modifier=originalSkill*2+Math.floor((c.aptitude-5)/2)-
   (p.fatigue>70?3:p.fatigue>45?1:0)+support+innovation.bonus+peerBonus,
  roll=1+Math.floor(draw(p)*20),
  total=roll+modifier+(roll===20?5:roll===1?-5:0),
  margin=total-dc,
  degree=margin>=10?'exceptional':margin>=5?'strong':
   margin>=0?'success':margin>=-5?'setback':'failure',
  success=margin>=0,
  // Harder genuine work teaches more; gifted individuals can make
  // exceptional progress in one accomplishment. None is tied to a day count.
  challengeFactor=job.difficulty>=18?2:1,
  giftFactor=c.aptitude>=9?3:c.aptitude>=7?2:1,
  earned=success?(degree==='exceptional'?7:degree==='strong'?4:2)*
   giftFactor*challengeFactor:0;
 const original={quality:local.quality,pressure:local.pressure,
  stability:polity.stability,funds:p.funds,fatigue:p.fatigue};
 if(success){
  p.funds=clamp(p.funds+(job.domain==='trade'?2:1));
  if(job.domain==='ecology'){
   if((job.effect||job.method)==='habitat-repair')
    local.pressure=clamp(local.pressure-1);
   else if((job.effect||job.method)==='water-management')
    local.quality=clamp(local.quality+1);
  }else if(job.domain==='civic')
   polity.stability=clamp(polity.stability+1);
  p.fatigue=clamp(p.fatigue+4);
 }else{
  p.fatigue=clamp(p.fatigue+3);
  if(job.domain==='trade')p.funds=clamp(p.funds-1);
 }
 c.workCount++;
 if(success){
  c.successes++;
  c.skillPoints+=earned;
  c.qualityPoints+=margin>=10?3:margin>=5?2:1;
  c.demonstratedMethods[job.method]=(c.demonstratedMethods[job.method]||0)+1;
 }
 const receiptSource={origin:WORK,personId:p.id,personOriginHash:p.originHash,
  day,context,regionId:p.regionId,profession:p.profession,task:job,
  ...(innovation.methodId?{appliedLimitedMethodId:innovation.methodId,
   independentlyTestedMethodBonus:innovation.bonus}:{}),
  ...(supportFromPeer?{peerGuidanceHash:supportFromPeer.sourceHash,
   peerGuidanceBonus:peerBonus}:{}),
  ...(assisted?{assistance:{skill:assistance.skill,checkEventHash:assistance.rollEventHash,
   success:assistance.success,degree:assistance.degree,support}}:{}),
  before:original,roll,modifier,dc,total,margin,
  outcome:{success,degree,earned},
  after:{quality:local.quality,pressure:local.pressure,
   stability:polity.stability,funds:p.funds,fatigue:p.fatigue}};
 const receipt={origin:WORK,source:receiptSource,sourceHash:hash(receiptSource)};
 if(supportFromPeer){
  supportFromPeer.status='used';
  supportFromPeer.used={source:structuredClone(receiptSource),hash:receipt.sourceHash};
 }
 c.workReceipts.push(receipt);
 if(job.authoredDutyId){
  const selected=c.authoredDuties.find(d=>d.id===job.authoredDutyId);
  if(!selected||!verifyDuty(p,selected))
   throw Error('Source-authored work must still belong to the real worker');
  selected.workProofHashes.push(receipt.sourceHash);
  if(job.activeOfferId){
   const accepted=c.workOffers?.find(a=>a.id===job.activeOfferId&&
    a.dutyId===job.authoredDutyId&&a.status==='accepted'&&
    a.startDay<=day&&a.endDay>=day);
   if(!accepted)throw Error('An ended or invalid offer cannot claim contracted work');
   accepted.attemptedWork.push({hash:receipt.sourceHash,
    source:structuredClone(receipt.source)});
  }
 }
 if(c.workReceipts.length>24)c.workReceipts.shift();
 const methods=Object.keys(c.demonstratedMethods).length;
 while(c.competenceRank<5&&c.skillPoints>=THRESHOLDS[c.competenceRank+1]){
  const next=c.competenceRank+1;
  // Expert, Master and Grandmaster accomplishments need distinctive
  // *demonstrated* breadth and quality. No age, sixday-count or profession
  // title guarantees qualification, and arbitrary repeated low tasks fail.
  const qualityGate=next<=2||
   (next===3&&methods>=2&&c.qualityPoints>=12)||
   (next===4&&methods>=3&&['strong','exceptional'].includes(degree))||
   (next===5&&methods>=3&&degree==='exceptional');
  if(!qualityGate)break;
  c.competenceRank=next;
  c.promotions.push({rank:next,receiptHash:receipt.sourceHash,
   method:job.method,degree,provedCompetence:true,
   noFormalLicence:true,noMagicSystemUnlock:true});
 }
 if(!verify(p))throw Error('An independent work outcome failed source-proven rank verification');
 return {personId:p.id,day,context,receiptHash:receipt.sourceHash,
  taskMethod:job.method,goal:job.goal,domain:job.domain,
  success,degree,earnedPractice:earned,observedChange:{
   environmental:original.quality!==local.quality||
    original.pressure!==local.pressure,
   civic:original.stability!==polity.stability,
   trade:original.funds!==p.funds},
  privateCompetenceRank:c.competenceRank,
  ...(assisted?{assistanceBonus:support}:{}),
  ...(supportFromPeer?{oneOriginalWorkCheckPeerSupport:peerBonus}:{}),
  noTechniqueOrSpellLearned:true,noContractOrGuildRank:true};
}
function publicWitness(x){
 return {day:x.day,work:x.taskMethod,goal:x.goal,
  visibleOutcome:x.success?x.degree+' practical result':
   'The task did not achieve its intended effect',
  reportedEffects:x.observedChange,
  noInferredFormalRank:true,noInferredMagicOrFamilyKnowledge:true};
}
module.exports={ORIGIN,WORK,VERSION,TITLES,THRESHOLDS,DUTY,ATTEST,WORK_OFFER,ensure,verify,work,authorDuty,retireDuty,authoredDutyStatus,issueAttestation,revokeAttestation,attestationStatus,offerDuty,endWorkOffer,workOfferStatus,observePeerGuidance,peerGuidanceStatus,
 publicWitness,_debug:{draw,hash,innate,task,initial}};
