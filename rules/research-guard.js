'use strict';
// The file-19 research formulas remain useful arithmetic. In private play,
// only precommitted truth and earned actors' competencies may drive them.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),W=require('./world'),R=require('./research');
const safe=(p,keys)=>{
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>!keys.includes(k)))
  throw Error('Unverified research truth, roll modifiers or support bonuses are not permitted by this operation');
};
const skillAttr={research:'int',survival:'wis',medicine:'wis',crafting:'int',
 arcana:'int',cultivation:'wis',beastcraft:'wis',diplomacy:'cha',combat:'str'};
function modifier(s,p){
 const field=p.skill;
 if(!Object.prototype.hasOwnProperty.call(skillAttr,field))
  throw Error('An actual recognised research skill is required');
 const rank=C.int(s.player.skills?.[field]?.rank,'recorded '+field+' rank',0,5);
 const attr=C.int(s.player.attributes?.[skillAttr[field]],'recorded '+skillAttr[field],1,30);
 return Math.floor((attr-10)/2)+2*rank;
}
function evidence(s,id){
 const p=R.get(s,id);
 if(!p.sourceResearchPlan||!s.table?.researchPlans?.[id]||
    s.table.researchPlans[id].source!==p.sourceResearchPlan)
  throw Error('Legacy research project lacks reconciled independent research truth');
 return p;
}
function start(s,p={}){
 safe(p,['id']);
 if(typeof p.id!=='string')throw Error('Research plan ID required');
 const plan=s.table?.researchPlans?.[p.id];
 if(!plan||plan.used||plan.id!==p.id||
    !Number.isInteger(plan.worldMinute)||plan.worldMinute<0||plan.worldMinute>s.world.minutes||
    typeof plan.source!=='string'||plan.source.trim().length<18||
    !plan.parameters||typeof plan.parameters!=='object'||Array.isArray(plan.parameters)||
    plan.parameters.id!==p.id||plan.parameters.dc!==undefined||
    plan.parameters.track!==undefined)
  throw Error('Research requires a precommitted project truth and source before any investigation');
 const field=plan.parameters.skill;
 // A sealed research plan does not itself confer subject expertise.
 const earnedRank=C.int(s.player.skills?.[field]?.rank,'actual research lead rank',0,5);
 const input={...plan.parameters,leadRank:earnedRank};
 // Scope / difficulty derive from the source maths, never an invented DC.
 const result=R.start(s,input);
 const proj=R.get(s,p.id);
 proj.sourceResearchPlan=plan.source;
 plan.used=true;
 return {...result,precommitted:true};
}
function survey(s,p={}){
 safe(p,['id']);const project=evidence(s,p.id);
 const plan=s.table.researchPlans[p.id];
 if(project.novelty==='rediscovery'&&
    (typeof plan.rediscoverySource!=='string'||plan.rediscoverySource.trim().length<18))
  throw Error('Rediscovery needs a prior identified source, not a claimant assertion');
 const result=R.survey(s,project,modifier(s,project),{sourceValid:true});
 const old=s.world.minutes;
 E.advance(s,120);W.finalizeTime(s,old);
 return {...result,elapsedMinutes:120};
}
function week(s,p={}){
 safe(p,['id','partTime']);
 if(p.partTime!==undefined&&typeof p.partTime!=='boolean')
  throw Error('Part-time research selection must be Boolean');
 const project=evidence(s,p.id);
 // Mentor, facility, resource and assistant bonuses are currently disabled
 // in the private chat runner until each has a real paid, sourced ledger.
 return R.week(s,project,{modifier:modifier(s,project),mentor:0,facility:0,
  resources:0,assistance:0,partTime:p.partTime===true});
}
function fieldwork(s,p={}){
 safe(p,['id','eventIndex']);const project=evidence(s,p.id);
 C.int(p.eventIndex,'recorded fieldwork event index',0,s.log.length-1);
 const event=s.log[p.eventIndex],hash=Crypto.createHash('sha256').update(JSON.stringify(event)).digest('hex');
 const doc=s.table?.researchFieldEvidence?.[p.id]?.[String(p.eventIndex)];
 if(!doc||doc.used||doc.projectId!==p.id||doc.eventIndex!==p.eventIndex||
    doc.eventHash!==hash||!Number.isInteger(doc.worldMinute)||
    doc.worldMinute<0||doc.worldMinute>s.world.minutes||
    typeof doc.source!=='string'||doc.source.trim().length<18||
    typeof doc.relevance!=='string'||doc.relevance.trim().length<8||
    s.table?.researchFieldEventsUsed?.[hash])
  throw Error('Fieldwork requires unused, specifically sourced scene evidence linked to this research question');
 const result=R.fieldwork(s,project,{eventIndex:p.eventIndex,relevance:doc.relevance});
 doc.used=true;
 s.table.researchFieldEventsUsed||={};
 s.table.researchFieldEventsUsed[hash]=p.id;
 return {...result,authenticated:true};
}
function hypothesis(s,p={}){
 safe(p,['id','hypothesis']);const project=evidence(s,p.id);
 return R.hypothesis(s,project,{hypothesis:p.hypothesis,modifier:modifier(s,project)});
}
function proof(s,p={}){
 safe(p,['id','extraInsight']);const project=evidence(s,p.id);
 const insight=p.extraInsight??0;C.int(insight,'additional earned Insight',0,2);
 let testerAtTier=false;
 if(project.theory){
  const t=s.table?.researchTierTesters?.[p.id];
  if(!t||!Number.isInteger(t.tier)||t.tier<s.table.researchPlans[p.id].parameters.targetTier||
     typeof t.source!=='string'||t.source.trim().length<18||
     !Number.isInteger(t.worldMinute)||t.worldMinute<0||t.worldMinute>s.world.minutes)
   throw Error('Theory proof requires an independent documented tester at the target tier');
  testerAtTier=true;
 }
 return R.proof(s,project,{modifier:modifier(s,project),extraInsight:insight,testerAtTier});
}
function replication(s,p={}){
 safe(p,['id','testerId']);const project=evidence(s,p.id);
 if(typeof p.testerId!=='string'||p.testerId.trim().length<3||
    p.testerId===s.player.name||p.testerId===s.player.name.toLowerCase())
  throw Error('Independent external replication requires a separate named tester');
 const t=s.table?.researchReplicators?.[p.id]?.[p.testerId];
 if(!t||t.used||t.testerId!==p.testerId||
    typeof t.source!=='string'||t.source.trim().length<18||
    !Number.isInteger(t.worldMinute)||t.worldMinute<0||t.worldMinute>s.world.minutes)
  throw Error('A documented independent replication opportunity and tester are required');
 const rank=C.int(t.skillRank,'recorded external tester skill',0,5);
 const ability=C.int(t.abilityScore,'recorded external tester ability',1,30);
 const mod=Math.floor((ability-10)/2)+2*rank;
 const result=R.replication(s,project,{modifier:mod});
 t.used=true;t.checkedAtMinute=s.world.minutes;
 return {...result,testerId:p.testerId,externallyReplicated:true};
}
function mythLead(s,p={}){
 safe(p,['id','sourceId']);const project=evidence(s,p.id);
 const m=s.table?.researchMythSources?.[p.id]?.[p.sourceId];
 if(!m||m.used||m.sourceId!==p.sourceId||m.location!==s.world.location||
    typeof m.source!=='string'||m.source.trim().length<18||
    !Number.isInteger(m.worldMinute)||m.worldMinute<0||m.worldMinute>s.world.minutes)
  throw Error('Evolution myth research requires an already encountered named source or site');
 const attr=C.int(s.player.attributes?.wis,'recorded Wisdom',1,30);
 const rank=Math.max(C.int(s.player.skills?.beastlore?.rank??0,'Beastlore rank',0,5),
  C.int(s.player.skills?.faithCosmology?.rank??0,'Faith & Cosmology rank',0,5));
 const result=R.mythLead(s,{id:p.id,sourceId:p.sourceId,source:m.source,
  sourceKind:m.sourceKind,dc:C.int(m.dc??15,'source difficulty',15,20),
  modifier:Math.floor((attr-10)/2)+2*rank,minutes:120});
 m.used=true;
 return {...result,authenticated:true};
}
module.exports={start,survey,week,fieldwork,hypothesis,proof,replication,mythLead};
