'use strict';
// Beastbound: a bounded first genuine emergence/regression loop.
// Named EXISTING professional NPCs do practical trials with real institute
// resources; their verified successes can create rival apprentice groups.
// No free arcane/meridian breakthroughs, new species or royal titles.
const Crypto=require('node:crypto'),A=require('./atlas');
const SOURCES=Object.freeze({
 reedmarch_field:Object.freeze({
  polity:'reedmarch',practice:'wetland-crossing field inspection',
  method:'fieldbook of refuge-crossing inspections',
  groupName:'Open Reedmarch Field Circle'
 }),
 crownspine_field:Object.freeze({
  polity:'crownspine',practice:'high-pass refuge rope checks',
  method:'tested mountain rope-and-shelter checklist',
  groupName:'Open Crownspine Rescue Learners'
 }),
 saltleague_field:Object.freeze({
  polity:'saltleague',practice:'multilingual port-accounts auditing',
  method:'tested three-language harbour accounting workbook',
  groupName:'Mirror Gulf Independent Ledger Circle'
 })
});
const SOURCE='Previously established named Beastbound professional and real institution conducting funded practical work';
const NOTICE='Independently completed local vocational pilot, member transfer, or institution recovery';
const clamp=(x,lo=0,hi=100)=>Math.max(lo,Math.min(hi,x));
const sha=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
/*
 * #18: Keep significant organisational fortunes from ORIGINAL autonomous
 * professional world decisions after the short public activity journal
 * rotates. These are copies of original source-sealed existing records,
 * not a new institution, membership transfer, diplomacy or result roll.
 */
const ORIGINAL_INSTITUTIONAL_MILESTONE='existing-independent-professional-organisational-milestone-v1';
const MILESTONE_KINDS=new Set([
 'new-organisation','group-suspended','group-reopened',
 'local-competition-changed','local-competition-reversed'
]);
function verifiedOriginalMilestone(p,row){
 const q=row?.source,ev=q?.originalEvent,ctx=ev?.context;
 if(!p||!q||!ev||!ctx||
  row.origin!==ORIGINAL_INSTITUTIONAL_MILESTONE||
  row.sourceHash!==sha(q)||q.origin!==ORIGINAL_INSTITUTIONAL_MILESTONE||
  row.id!=='orgmilestone_'+ev.id||q.id!==row.id||
  q.groupId!==p.groupId||q.actorId!==p.actorId||
  q.sponsorInstitutionId!==p.sponsorInstitutionId||
  q.polity!==p.polity||q.method!==p.method||
  q.originalRecordHash!==ev.hash||
  q.originalRecordId!==ev.id||
  q.releaseDay!==ev.releaseDay||
  row.day!==ev.day||row.kind!==ev.kind||
  !MILESTONE_KINDS.has(ev.kind)||
  ev.actorId!==p.actorId||ev.polity!==p.polity||
  ev.method!==p.method||ev.source!==SOURCE||
  ev.month<1||!Number.isInteger(ev.month)||
  !Number.isInteger(ev.day)||ev.day<1||
  ev.hash!==sha({
   id:ev.id,day:ev.day,month:ev.month,actorId:ev.actorId,
   actorName:ev.actorName,polity:ev.polity,kind:ev.kind,
   source:ev.source,method:ev.method,context:ev.context
  })||
  typeof ev.publicText!=='string'||ev.publicText.length<30||
  ev.releaseDay!==ev.day+8||
  q.noNewRollOrParticipation!==true||
  q.noPublicOfficeOrOwnershipGranted!==true)
  return false;
 const positive=n=>Number.isInteger(n)&&n>=0;
 if(ev.kind==='new-organisation')
  return ctx.to===p.groupId&&ctx.from===p.sponsorInstitutionId&&
   positive(ctx.workerTransfers)&&ctx.workerTransfers>0&&
   ctx.initialMembers===ctx.workerTransfers&&
   ctx.initialFunds===ctx.duesRaised&&positive(ctx.initialFunds)&&
   positive(ctx.priorTests)&&ctx.priorTests>=2&&
   positive(ctx.genuinePledges)&&ctx.genuinePledges>=12;
 if(ev.kind==='group-suspended')
  return positive(ctx.fundsBefore)&&positive(ctx.fundsAfter)&&
   positive(ctx.members)&&
   positive(ctx.upkeep)&&positive(ctx.dues)&&
   Number.isInteger(ctx.localShock)&&ctx.localShock>=-2&&ctx.localShock<=2;
 if(ev.kind==='group-reopened')
  return positive(ctx.funds)&&ctx.funds>=13&&positive(ctx.members)&&
   positive(ctx.previousSuspensionDay)&&ctx.previousSuspensionDay<ev.day;
 if(![ctx.incumbentMembers,ctx.newGroupMembers,
  ctx.incumbentReputation,ctx.newGroupReputation].every(positive))
  return false;
 const leading=ctx.newGroupMembers>ctx.incumbentMembers&&
  ctx.newGroupReputation>ctx.incumbentReputation;
 if(ev.kind==='local-competition-changed')
  return leading&&positive(ctx.sustainedMonths)&&ctx.sustainedMonths>=3;
 return !leading;
}
function verifyMilestones(p){
 if(p.organisationMilestones===undefined)return true;
 if(!Array.isArray(p.organisationMilestones))return false;
 const ids=new Set();let lastDay=-1;
 for(const row of p.organisationMilestones){
  if(!verifiedOriginalMilestone(p,row)||ids.has(row.id)||
   row.day<lastDay)return false;
  ids.add(row.id);lastDay=row.day;
 }
 return true;
}
function retainOriginalMilestone(p,event){
 if(!MILESTONE_KINDS.has(event?.kind))return null;
 const q={origin:ORIGINAL_INSTITUTIONAL_MILESTONE,
  id:'orgmilestone_'+event.id,groupId:p.groupId,
  actorId:p.actorId,sponsorInstitutionId:p.sponsorInstitutionId,
  polity:p.polity,method:p.method,
  originalRecordId:event.id,originalRecordHash:event.hash,
  releaseDay:event.releaseDay,originalEvent:structuredClone(event),
  noNewRollOrParticipation:true,
  noPublicOfficeOrOwnershipGranted:true};
 const row={id:q.id,origin:ORIGINAL_INSTITUTIONAL_MILESTONE,
  day:event.day,kind:event.kind,source:q,sourceHash:sha(q)};
 if(!verifiedOriginalMilestone(p,row))
  throw Error('No original independent organisational event supports this historic milestone');
 p.organisationMilestones||=[];
 if(p.organisationMilestones.some(x=>x.id===row.id))
  throw Error('An independent original milestone may not be recorded twice');
 p.organisationMilestones.push(row);
 if(!verifyMilestones(p))
  throw Error('The original organisation milestone archive cannot rewrite its historical order');
 return row;
}

function seed(w){
 const projects={};
 for(const [id,spec] of Object.entries(SOURCES)){
  const n=w.notables?.[id];
  if(!n||n.polity!==spec.polity||!A.I[n.institution]||
     A.I[n.institution].polity!==spec.polity)
   throw Error('Emergent professional project must be grounded in a named existing worker and real employing institution');
  projects[id]={
   actorId:id,polity:spec.polity,sponsorInstitutionId:n.institution,
   practice:spec.practice,method:spec.method,
   phase:'preparing',work:0,materials:0,invested:0,
   attempts:0,successes:0,failures:0,blocked:0,
   communityPledges:0,groupId:null,lastOutcome:null,history:[]
  };
 }
 return {version:1,seededAtMonth:w.ticks.months,
  rngState:((w.worldSeed^0x73e1a26c)>>>0)||0x51a19317,
  projects,entrants:{},records:[],counter:0};
}
function ensure(w){
 if(w.agentInitiatives===undefined)w.agentInitiatives=seed(w);
 const t=w.agentInitiatives;
 if(t.version!==1||!t.projects||!t.entrants||!Array.isArray(t.records)||
   Object.values(t.projects).some(p=>!verifyMilestones(p)))
  throw Error('Actual long-term professional work needs valid persistent original project evidence');
 return t;
}
function rng(t){
 let x=t.rngState>>>0;
 x^=x<<13;x^=x>>>17;x^=x<<5;
 t.rngState=(x>>>0)||0x51a19317;
 return t.rngState/4294967296;
}
function d20(t){return 1+Math.floor(rng(t)*20);}
function record(w,t,p,day,kind,text,context,emit,{publicNotice=true}={}){
 const n=w.notables[p.actorId],id='agentwork_'+(++t.counter);
 const evidence={id,day,month:w.ticks.months,actorId:p.actorId,
  actorName:n.name,polity:p.polity,kind,
  source:SOURCE,method:p.method,context};
 const row={...evidence,hash:sha(evidence),
  publicText:publicNotice?text:null,releaseDay:publicNotice?day+8:null};
 t.records.push(row);
 if(t.records.length>200)t.records.splice(0,t.records.length-200);
 if(MILESTONE_KINDS.has(kind))retainOriginalMilestone(p,row);
 p.history.push({id,day,kind,hash:row.hash});
 if(p.history.length>20)p.history.splice(0,p.history.length-20);
 if(publicNotice&&typeof emit==='function')
  emit({day,region:p.polity,subject:'agent-work:'+id,text,
   channel:'guild report',releaseDay:row.releaseDay,severity:'routine'});
 return row;
}
function institution(w,p){
 return p.groupId?w.agentInitiatives.entrants[p.groupId]:
  w.institutions?.[p.sponsorInstitutionId];
}
function pilot(w,t,p,day,emit){
 const spec=SOURCES[p.actorId],n=w.notables[p.actorId],
  org=institution(w,p),host=w.countries[p.polity];
 if(!n||!host||!org)throw Error('No real professional, sponsoring workshop or national economic conditions exist');
 if(n.injuryMonths>0||
    (Number.isInteger(p.recoveryUntilMonth)&&w.ticks.months<=p.recoveryUntilMonth)||
    org.status!=='active'||org.funds<15){
  p.blocked++;
  if(p.blocked>=2){
   p.work=Math.max(0,p.work-1);
   p.phase='delayed';
   p.lastOutcome='work delayed by actual illness or budget';
  }
  return;
 }
 p.blocked=0;p.phase='preparing';
 // This is a real transfer of institutional or cooperative resources:
 // no player fee, conjured patron, instant publication or free prototype.
 const spent=org.funds>=40?3:2;
 org.funds-=spent;
 p.materials+=spent;p.work++;
 p.invested+=spent;
 if(p.work<4||p.materials<8)return;
 const roll=d20(t),modifier=2*n.professional.rank+
  (org.capacity>=60?2:0)+(host.stability>=55?1:0)-
  (org.funds<20?2:0);
 const dc=14+(spec.polity==='crownspine'?1:0);
 const success=roll===20||(roll!==1&&roll+modifier>=dc);
 p.attempts++;
 const before={work:p.work,materials:p.materials,
  orgFunds:org.funds,orgCapacity:org.capacity,
  skillRank:n.professional.rank,hostStability:host.stability};
 p.work=0;p.materials=0;
 if(success){
  p.successes++;p.phase='applied';p.lastOutcome='practical method passed a limited field trial';
  org.capacity=clamp(org.capacity+1);
  org.reputation=clamp(org.reputation+1);
  record(w,t,p,day,'tested-method',
   n.name+' publishes a documented local trial of the '+spec.method+
   ' through '+(p.groupId?spec.groupName:A.I[p.sponsorInstitutionId].name)+
   '. This is practical field training, not a new supernatural technique.',
   {roll,modifier,dc,success,before,
    after:{capacity:org.capacity,reputation:org.reputation},
    edition:p.successes,invested:p.invested},emit);
 }else{
  p.failures++;p.phase='reworking';p.lastOutcome='trial failed; preparation must be repeated';
  // A rare serious mishap interrupts an NPC's actual time without
  // silently adding an unknown permanent wound or an endangered beast.
  if(roll===1){
   n.injuryMonths=Math.max(n.injuryMonths,1);
   p.recoveryUntilMonth=w.ticks.months+1;
  }
  record(w,t,p,day,'failed-trial',
   n.name+' reports that a '+spec.practice+
   ' pilot did not pass its practical verification. Materials were spent; work continues.',
   {roll,modifier,dc,success,before,
    materialsLost:before.materials,monthsOfInjury:roll===1?1:0},emit,
   {publicNotice:p.failures%2===0});
 }
}
function found(w,t,p,day,emit){
 const spec=SOURCES[p.actorId],n=w.notables[p.actorId],
  parent=w.institutions[p.sponsorInstitutionId],host=w.countries[p.polity];
 if(p.groupId||p.successes<2||!parent||!host||
    parent.status!=='active'||parent.members<30)return;
 // Named, existing field workers actually choose whether to leave an
 // incumbent institution and pay modest voluntary group dues.
 const pledge=rng(t);
 const newPledges=pledge<(host.stability>=42?.75:.45)?
  2+Math.floor(rng(t)*4):0;
 p.communityPledges=Math.min(16,p.communityPledges+newPledges);
 if(p.communityPledges<12)return;
 if(rng(t)>.55)return; // plausible choice, never a forced split
 const people=12,id='open_workshop_'+p.actorId;
 if(t.entrants[id])return;
 parent.members-=people;
 t.entrants[id]={
  id,name:spec.groupName,polity:p.polity,founderId:p.actorId,
  parentInstitutionId:p.sponsorInstitutionId,
  status:'active',members:people,funds:people,capacity:27,
  reputation:26,foundedDay:day,lastChangeDay:day,
  financialStrain:0,leadMonths:0,currentlyLeading:false,
  independentWork:spec.practice
 };
 p.groupId=id;p.phase='independent-work';
 n.independentPracticeId=id;
 n.mentoring='independently formed vocational study group';
 p.lastOutcome='independent apprentice circle formed by willing workers';
 record(w,t,p,day,'new-organisation',
  'After tested work by '+n.name+', twelve workers leave '+
  A.I[p.sponsorInstitutionId].name+' voluntarily to form '+
  spec.groupName+'. The new group begins with member dues; its future is not guaranteed.',
  {workerTransfers:people,from:p.sponsorInstitutionId,to:id,
   duesRaised:people,priorTests:p.successes,
   genuinePledges:p.communityPledges,
   initialMembers:t.entrants[id].members,initialFunds:t.entrants[id].funds},
  emit);
}
function groupMonth(w,t,p,day,emit){
 if(!p.groupId)return;
 const e=t.entrants[p.groupId],
  parent=w.institutions[p.sponsorInstitutionId],
  host=w.countries[p.polity];
 if(!e||!parent||!host)throw Error('No real incumbent institution and independent workers exist');
 const fundsBefore=e.funds,membersBefore=e.members,
  parentMembers=parent.members;
 // Membership dues, operational costs, weather and public confidence.
 const dues=1+Math.floor(e.members/9),upkeep=2+Math.floor(e.members/30),
  localShock=Math.floor(rng(t)*5)-2;
 e.funds=clamp(e.funds+dues-upkeep+localShock+(host.prosperity>69?1:0));
 if(e.status==='active'){
  const draw=rng(t),chance=clamp(25+p.successes*4+
   Math.round((e.reputation-parent.reputation)/4),8,60)/100;
  if(draw<chance&&parent.members>18){
   const joiners=Math.min(parent.members-18,1+Math.floor(rng(t)*4));
   parent.members-=joiners;e.members+=joiners;
   e.reputation=clamp(e.reputation+1);
  }else if(draw>.84&&e.members>9){
   const returners=Math.min(e.members-9,1+Math.floor(rng(t)*3));
   e.members-=returners;parent.members+=returners;
   e.reputation=clamp(e.reputation-1);
  }
  if(e.funds>=32&&e.capacity<100)e.capacity++;
 }
 if(e.funds<=2)e.financialStrain++;else e.financialStrain=0;
 if(e.status==='active'&&e.financialStrain>=3){
  e.status='suspended';e.lastChangeDay=day;
  p.phase='suspended';p.lastOutcome='independent group suspends due to real funding shortfall';
  record(w,t,p,day,'group-suspended',
   specName(p)+' temporarily suspends training after a sustained funding shortage. Its members have not vanished.',
   {fundsBefore,fundsAfter:e.funds,members:e.members,dues,upkeep,localShock},
   emit);
 }else if(e.status==='suspended'&&e.funds>=13&&day-e.lastChangeDay>=30){
  const actualSuspensionDay=e.lastChangeDay;
  e.status='active';e.lastChangeDay=day;p.phase='independent-work';
  record(w,t,p,day,'group-reopened',
   specName(p)+' resumes independent practical training after rebuilding its real reserves.',
   {funds:e.funds,members:e.members,previousSuspensionDay:actualSuspensionDay},emit);
 }
 // Rivalry is about documented participation and adoption, NOT taking the
 // incumbent's land, sovereign office or hereditary family status.
 const leading=e.status==='active'&&e.members>parent.members&&
  e.reputation>parent.reputation;
 e.leadMonths=leading?e.leadMonths+1:0;
 if(leading&&e.leadMonths>=3&&!e.currentlyLeading){
  e.currentlyLeading=true;
  record(w,t,p,day,'local-competition-changed',
   specName(p)+' now has more local vocational participants and tested-method reputation than '+
   A.I[p.sponsorInstitutionId].name+
   '. This is a change in local training preference, not a government takeover.',
   {incumbentMembers:parent.members,newGroupMembers:e.members,
    incumbentReputation:parent.reputation,newGroupReputation:e.reputation,
    sustainedMonths:e.leadMonths},emit);
 }else if(!leading&&e.currentlyLeading){
  e.currentlyLeading=false;
  record(w,t,p,day,'local-competition-reversed',
   'Local vocational preference shifts again between '+specName(p)+
   ' and '+A.I[p.sponsorInstitutionId].name+
   ' as their real membership and standing change.',
   {incumbentMembers:parent.members,newGroupMembers:e.members,
    incumbentReputation:parent.reputation,newGroupReputation:e.reputation},
   emit);
 }
 // Both sets of workers still exist in the same real polity; no cloning.
 if(parent.members+e.members!==parentMembers+membersBefore)
  throw Error('A competing apprenticeship group cannot clone or erase real local members');
}
function specName(p){return SOURCES[p.actorId].groupName;}
function month(w,day,emit){
 const t=ensure(w);
 for(const p of Object.values(t.projects)){
  if(p.groupId)groupMonth(w,t,p,day,emit);
  pilot(w,t,p,day,emit);
  if(!p.groupId)found(w,t,p,day,emit);
 }
 return t;
}
function visible(s,w){
 const t=w.agentInitiatives,local=A.R[A.LOCATION_REGION[s.world.location]]?.polity,
  now=Math.floor(s.world.minutes/1440);
 if(!t||!local)return {polity:A.P[local]?.name||null,knownWork:[],
  knownInstitutionalMilestones:[],
  note:'Only actually released local professional reports are visible; private ambitions and trials are not disclosed.'};
 const records=t.records.filter(r=>r.polity===local&&
  r.publicText&&r.releaseDay<=now&&
  w.chronicle?.some(e=>e.subject==='agent-work:'+r.id&&
   e.day===r.day&&e.releaseDay===r.releaseDay&&e.text===r.publicText)&&
  r.hash===sha({
   id:r.id,day:r.day,month:r.month,actorId:r.actorId,
   actorName:r.actorName,polity:r.polity,kind:r.kind,
   source:r.source,method:r.method,context:r.context
  })).slice(-12).map(r=>({
   day:r.day,person:r.actorName,development:r.publicText,
   type:r.kind,region:A.P[r.polity].name
  }));
 const milestones=Object.values(t.projects).flatMap(p=>
  (p.organisationMilestones||[]).map(row=>({p,row}))).filter(({p,row})=>{
   if(!verifiedOriginalMilestone(p,row))
    throw Error('Unverified original institutional history cannot be disclosed');
   return p.polity===local&&row.source.releaseDay<=now;
  }).sort((a,b)=>a.row.day-b.row.day||
   a.row.id.localeCompare(b.row.id)).map(({row})=>({
    day:row.day,type:row.kind,
    originalSourceHash:row.source.originalRecordHash,
    independentProfessional:row.source.originalEvent.actorName,
    publishedDevelopment:row.source.originalEvent.publicText,
    noAdditionalWorkOrPoliticalOffice:true
   }));
 return {polity:A.P[local].name,knownWork:records,
  knownInstitutionalMilestones:milestones,
  note:'Only published local achievements and original independently changed organisational fortunes, not private plans, unannounced finances, hidden membership rolls or diplomatic authority.'};
}
module.exports={SOURCES,SOURCE,NOTICE,seed,ensure,month,visible,
 ORIGINAL_INSTITUTIONAL_MILESTONE,verifyMilestones,verifiedOriginalMilestone,
 _debug:{rng,d20,pilot,found,groupMonth,record}};
