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
  promotions:[],workReceipts:[],recognizedLicence:null,
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
 return true;
}
function ensure(p){
 if(!p.career)p.career=initial(p);
 if(!verify(p))throw Error('Unverified citizen profession, promotion or fake magical rank');
 return p.career;
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
   if(job.method==='habitat-repair')
    local.pressure=clamp(local.pressure-1);
   else if(job.method==='water-management')
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
module.exports={ORIGIN,WORK,VERSION,TITLES,THRESHOLDS,ensure,verify,work,
 publicWitness,_debug:{draw,hash,innate,task,initial}};
