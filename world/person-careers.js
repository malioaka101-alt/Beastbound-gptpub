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
  promotions:[],workReceipts:[],authoredDuties:[],recognizedLicence:null,
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
   q.originalPolity!==p.birthSource.polity&&
    q.originalPolity!==p.polity||
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

function task(w,p){
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
   available.push({method:duty.method,goal:duty.goal,
    domain:duty.domain,effect:duty.effect,authoredDutyId:duty.id});
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
 const c=ensure(p),job=task(w,p),
  innovation=require('./independent-innovations').workBonus(w,p,job.method),
  local=w.ecosystems[p.regionId],
  polity=w.countries[p.polity],
  originalSkill=c.competenceRank,
  dc=job.difficulty+Math.floor(originalSkill/2),
  modifier=originalSkill*2+Math.floor((c.aptitude-5)/2)-
   (p.fatigue>70?3:p.fatigue>45?1:0)+support+innovation.bonus,
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
  ...(assisted?{assistance:{skill:assistance.skill,checkEventHash:assistance.rollEventHash,
   success:assistance.success,degree:assistance.degree,support}}:{}),
  before:original,roll,modifier,dc,total,margin,
  outcome:{success,degree,earned},
  after:{quality:local.quality,pressure:local.pressure,
   stability:polity.stability,funds:p.funds,fatigue:p.fatigue}};
 const receipt={origin:WORK,source:receiptSource,sourceHash:hash(receiptSource)};
 c.workReceipts.push(receipt);
 if(job.authoredDutyId){
  const selected=c.authoredDuties.find(d=>d.id===job.authoredDutyId);
  if(!selected||!verifyDuty(p,selected))
   throw Error('Source-authored work must still belong to the real worker');
  selected.workProofHashes.push(receipt.sourceHash);
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
  noTechniqueOrSpellLearned:true,noContractOrGuildRank:true};
}
function publicWitness(x){
 return {day:x.day,work:x.taskMethod,goal:x.goal,
  visibleOutcome:x.success?x.degree+' practical result':
   'The task did not achieve its intended effect',
  reportedEffects:x.observedChange,
  noInferredFormalRank:true,noInferredMagicOrFamilyKnowledge:true};
}
module.exports={ORIGIN,WORK,VERSION,TITLES,THRESHOLDS,DUTY,ensure,verify,work,authorDuty,retireDuty,authoredDutyStatus,
 publicWitness,_debug:{draw,hash,innate,task,initial}};
