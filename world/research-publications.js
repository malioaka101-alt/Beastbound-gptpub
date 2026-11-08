'use strict';
// Recognised research can become genuine world knowledge when its author
// VOLUNTARILY submits it. Public notices are not free power or automatic
// adoption; a real, independently funded institution may study it later.
const Crypto=require('node:crypto'),Atlas=require('./atlas');
const ORIGIN='independent-recognised-research-world-publication-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function store(w){
 w.researchPublications||={version:1,counter:0,records:{}};
 const x=w.researchPublications;
 if(x.version!==1||!Number.isInteger(x.counter)||x.counter<0||
   !x.records||typeof x.records!=='object'||Array.isArray(x.records))
  throw Error('The live world research-publication ledger is invalid');
 return x;
}
function valid(x){
 return !!(x&&x.origin===ORIGIN&&
  typeof x.id==='string'&&/^world_research_[1-9][0-9]*$/.test(x.id)&&
  typeof x.source==='object'&&x.source!==null&&
  x.source.origin===ORIGIN&&x.source.id===x.id&&
  x.sourceHash===hash(x.source)&&
  x.source.title.length>=4&&x.source.author.length>=2&&
  Number.isInteger(x.source.submittedDay)&&
  Number.isInteger(x.source.releaseDay)&&
  x.source.releaseDay===x.source.submittedDay+3&&
  Atlas.R[x.source.regionId]?.polity===x.source.polity&&
  ['invention','ecology','method'].includes(x.source.kind)&&
  typeof x.source.planSourceHash==='string'&&
  typeof x.source.projectReceiptHash==='string'&&
  /^[a-f0-9]{64}$/.test(x.source.projectReceiptHash)&&
  ['awaiting-review','endorsed-for-study','not-adopted'].includes(x.reviewStatus)&&
  (x.reviewStatus==='awaiting-review'?x.reviewDay===null:
   Number.isInteger(x.reviewDay)&&x.reviewDay>=x.source.releaseDay));
}
function submit(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
   Object.keys(params).join('|')!=='id'||typeof params.id!=='string')
  throw Error('Publication must refer only to an actually recognised, completed research project');
 if(s.encounter||s.battle||s.player.stamina<2)
  throw Error('A safe, conscious research author needs time and Stamina to file a report');
 const id=params.id,project=s.table?.research?.[id],
  plan=s.table?.researchPlans?.[id];
 if(!project||!plan||!plan.used||plan.id!==id||
  project.sourceResearchPlan!==plan.source||
  project.id!==id||project.status!=='recognised'||
  project.replications<2||!['invention','ecology','method'].includes(project.kind))
  throw Error('Independent completed replication and an authenticated source plan are required for publication');
 if(plan.origin===require('../rules/design-research').ORIGIN&&
  !require('../rules/design-research').verifyPlan(s,plan))
  throw Error('The original created design research source was altered');
 const names=Object.entries(s.table?.researchReplicators?.[id]||{}).
  filter(([who,t])=>t.used&&t.testerId===who&&
   typeof t.source==='string'&&t.source.length>=18&&
   Number.isInteger(t.checkedAtMinute)&&t.checkedAtMinute<=s.world.minutes);
 if(names.length<2||new Set(names.map(([who])=>who)).size<2)
  throw Error('Two independently witnessed, distinct replication testers are required for a public technical claim');
 const Realm=require('./simulation'),world=Realm.ensure(s),ledger=store(world);
 if(Object.values(ledger.records).some(r=>r.source.projectId===id&&
  r.source.author===s.player.name))
  throw Error('This research has already been submitted; the same findings cannot be published twice as separate discoveries');
 const reg=Atlas.R[Atlas.LOCATION_REGION[s.world.location]];
 if(!reg)throw Error('A real local region and postal route are required');
 const day=Math.floor(s.world.minutes/1440),elapsed=45,
  projectProof={id,projectTitle:project.title,kind:project.kind,
   grade:project.grade,sourcePlan:project.sourceResearchPlan,
   creationScopeHash:plan.parameters?.creationScopeHash||null,
   actualStatus:project.status,actualReplications:project.replications,
   independentTesters:names.map(([who,t])=>({
    name:who,source:t.source,checkedAtMinute:t.checkedAtMinute}))};
 const E=require('../engine.js'),W=require('../rules/world'),
  Unified=require('../rules/unified');
 const old=s.world.minutes;
 s.player.stamina-=1;
 E.advance(s,elapsed);W.finalizeTime(s,old);Unified.sync(s,{source:'legacy'});
 const submittedDay=Math.floor(s.world.minutes/1440),key='world_research_'+(++ledger.counter);
 const source={origin:ORIGIN,id:key,projectId:id,
  author:s.player.name,title:project.title.slice(0,100),kind:project.kind,
  grade:project.grade,polity:reg.polity,regionId:reg.id,
  submittedDay,releaseDay:submittedDay+3,
  planSourceHash:hash(plan.source),
  projectReceiptHash:hash(projectProof),
  proof:projectProof};
 const rec={id:key,origin:ORIGIN,source,sourceHash:hash(source),
  reviewStatus:'awaiting-review',reviewDay:null,institutionId:null,
  practicalTrial:null, noFreeTechnique:true,noInheritedRank:true};
 if(!valid(rec))throw Error('A research publication cannot be authenticated');
 ledger.records[key]=rec;
 world.chronicle.push({day:submittedDay,region:reg.polity,
  subject:'world-research:'+key,channel:'local research registry',
  text:s.player.name+' submits a replicated '+project.kind+
    ' report, “'+source.title+'”, for public examination. Independent institutions have not yet adopted its applications.',
  publiclyKnown:true,releaseDay:source.releaseDay,severity:'routine'});
 if(world.chronicle.length>200)world.chronicle.splice(0,world.chronicle.length-200);
 return {id:key,projectId:id,sourceBound:true,
  publicationSubmitted:true,publicationReleasedOnDay:source.releaseDay+1,
  elapsedMinutes:elapsed,staminaSpent:1,
  requiresIndependentWorldReview:true,
  noAutomaticTechnique:true,noSchoolRank:true,noPublicationBeforeRelease:true};
}
function review(w,day,draw,emit){
 const ledger=w.researchPublications;
 if(!ledger)return {reviewed:0,endorsed:0};
 store(w);let reviewed=0,endorsed=0;
 for(const row of Object.values(ledger.records)){
  if(!valid(row))throw Error('A published research claim lost its original authenticated source');
  if(row.reviewStatus!=='awaiting-review'||row.source.releaseDay>day)continue;
  const local=Atlas.institutions.filter(i=>i.polity===row.source.polity),
   preferred=local.find(i=>/academ|college|university|institute|research/i.
    test(i.name+' '+i.type))||local[0],
   org=preferred&&w.institutions[preferred.id];
  if(!org||org.status!=='active'||org.funds<8)continue;
  // A genuine institution spends its OWN funds and resolves a separate
  // independent world check. Published claims never force adoption.
  const before={funds:org.funds,capacity:org.capacity,
   reputation:org.reputation},cost=2;
  org.funds-=cost;
  const roll=1+Math.floor(draw()*20),modifier=
   Math.floor(before.capacity/25)+(before.reputation>=65?1:0);
  const dc=15+Math.floor(row.source.grade/3);
  const passed=roll===20||(roll!==1&&roll+modifier>=dc);
  if(passed){org.capacity=Math.min(100,org.capacity+1);
   org.reputation=Math.min(100,org.reputation+1);endorsed++;}
  row.reviewStatus=passed?'endorsed-for-study':'not-adopted';
  row.reviewDay=day;row.institutionId=preferred.id;
  row.practicalTrial={roll,modifier,dc,passed,cost,
   before,after:{funds:org.funds,capacity:org.capacity,
    reputation:org.reputation}};
  reviewed++;
  emit({day,region:row.source.polity,subject:'research-review:'+row.id,
   channel:'guild research notice',publiclyKnown:true,releaseDay:day+2,
   text:preferred.name+(passed?' acknowledges':' does not adopt')+
    ' the locally submitted '+row.source.kind+' report “'+row.source.title+
    '” after a funded independent evaluation. This is not a spell, general training licence or automatic institutional membership.',
   severity:'routine'});
 }
 return {reviewed,endorsed};
}
function visible(s,w){
 const polity=Atlas.R[Atlas.LOCATION_REGION[s.world.location]]?.polity,
  now=Math.floor(s.world.minutes/1440),ledger=w.researchPublications;
 const records=[];
 for(const r of Object.values(ledger?.records||{})){
  if(!valid(r))throw Error('Published world findings have an invalid immutable source');
  if(r.source.polity!==polity||r.source.releaseDay>now)continue;
  records.push({id:r.id,title:r.source.title,author:r.source.author,
   kind:r.source.kind,publishedDay:r.source.releaseDay+1,
   status:r.reviewDay!==null&&r.reviewDay+2<=now?
    r.reviewStatus:'awaiting independent review',
   adoptingInstitution:r.reviewDay!==null&&r.reviewDay+2<=now?
    Atlas.I[r.institutionId]?.name||null:null,
   noFreeTechnique:true});
 }
 return {publishedLocalResearch:records.slice(-20),
  note:'Only independently replicated work voluntarily filed and physically released in this polity; private research, distant unpublished studies and secret institution rolls stay undisclosed.'};
}
module.exports={ORIGIN,store,valid,submit,review,visible};
