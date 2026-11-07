'use strict';
/* File 19 Research/Invention — explicit supplied mechanics, not bb_research.py parity.
 * Truth is fixed before any survey and never invented after a test. */
const E=require('../engine.js'), C=require('./core'), W=require('./world'), Combat=require('./combat'), Unified=require('./unified'), crypto=require('node:crypto');
const NOVELTY={rediscovery:{dc:0,base:5,ip:0,fame:5,rank:1},variant:{dc:1,base:10,ip:0,fame:5,rank:1},novel:{dc:3,base:20,ip:1,fame:10,rank:2},breakthrough:{dc:6,base:40,ip:3,fame:20,rank:3}};
const COST=[0,.5,1,3,8,20,50,150,400,1000]; // Talons: 1T = 10F, per §3.4
function start(s,p){const grade=C.int(p.grade,'grade',1,9),n=NOVELTY[p.novelty];if(!n)throw Error('Unknown novelty');
 if(typeof p.id!=='string'||!/^[a-z][a-z0-9_-]{1,48}$/.test(p.id))throw Error('Invalid research project id');
 if(!p.truth||!['not_as_framed','possible','catch','better'].includes(p.truth.feasibility)||!Array.isArray(p.truth.requirements)||!p.truth.requirements.length)throw Error('GM must establish sealed feasibility and requirements before research');
 if(p.truth.requirements.some(x=>typeof x!=='string'||!x))throw Error('Invalid requirements');
 const rank=C.int(p.leadRank,'lead rank',0,7);if(rank<n.rank)throw Error('Research lead rank too low');
 const actual=s.player.skills?.[p.skill]?.rank;if(Number.isInteger(actual)&&rank>actual)throw Error('Lead rank exceeds character skill');
 if(p.theory && (!Number.isInteger(p.ownTier)||!Number.isInteger(p.targetTier)||p.targetTier!==p.ownTier+1))throw Error('Theory must be one tier above researcher');
 if(p.theory===false && Number.isInteger(p.ownTier)&&Number.isInteger(p.targetTier)&&p.targetTier>p.ownTier)throw Error('Beyond tier requires theory flag');
 const projects=(s.table ||= {}).research ||= {};
 if(projects[p.id])throw Error('Duplicate project');
 const r={id:p.id,title:String(p.title||p.id).slice(0,100),kind:String(p.kind||'other'),skill:String(p.skill||'research'),grade,novelty:p.novelty,
 dc:p.dc===undefined?10+2*grade+n.dc:C.int(p.dc,'DC',2,60),track:p.track===undefined?n.base+5*grade:C.int(p.track,'track',1,100000),
 progress:0,prep:0,ipRequired:n.ip,fame:n.fame,leadRank:rank,truth:p.truth,surveyed:false,clues:[],milestones:[],status:'proposed',weeks:0,replications:0,fieldwork:[],theory:!!p.theory};
 projects[p.id]=r;return {id:r.id,dc:r.dc,track:r.track,status:r.status};}
function get(s,id){const p=s.table?.research?.[id];if(!p)throw Error('Research project unknown');return p;}
function publicCard(p){const {truth,sealedFalseLeads,mythLeads,...data}=p;
 return {...data,mythSources:(mythLeads||[]).map(v=>({sourceId:v.sourceId,sourceKind:v.sourceKind,degree:v.degree}))};}
function disclose(s,p,count){const pending=p.truth.requirements.filter(x=>!p.clues.includes(x));for(let i=0;i<count&&pending.length;i++){const clue=pending.shift();p.clues.push(clue);}return p.clues;}
function survey(s,p,modifier=0,{sourceValid=true}={}){if(p.surveyed)throw Error('Survey only once');if(p.novelty==='rediscovery'&&!sourceValid)throw Error('Rediscovery requires a real source');
 const r=C.check(s,{modifier,dc:10+2*p.grade,label:`Survey ${p.title}`});p.surveyed=true;p.prep=r.degree==='exceptional'?3:r.degree==='strong'?2:r.success?1:0;
 if(r.degree==='exceptional')disclose(s,p,2);else if(r.degree==='strong')disclose(s,p,1);
 p.status='researching';return {degree:r.degree,preparation:p.prep,clues:p.clues.slice()};}
function milestone(p){const newly=[];for(const percent of [25,50,75])if(p.progress>=Math.ceil(percent*p.track/100)&&!p.milestones.includes(percent)){p.milestones.push(percent);newly.push(percent);}
 if(newly.length)disclose(null,p,newly.length);return newly;}
function complication(s,p){const d=C.die(s);const labels=['lab accident','toxic exposure','materials lost','subject harmed','dead end','funding trouble','rival','espionage','legal snag','team trouble','ethical dilemma','misleading result','exhaustion','unexpected subject reaction','side discovery','unexpected insight','patron interest','serendipity'];
 const label=d<=2?labels[0]:d===3?labels[1]:d<=5?labels[2]:labels[Math.min(labels.length-1,d-3)];
 if(d===7)p.progress=Math.max(0,Math.floor(p.progress*.9));
 if(d===18)s.player.insightPoints=(s.player.insightPoints||0)+1;
 if(d===20)p.progress=Math.min(p.track,p.progress+3);
 if(d<=2){
   Unified.ensurePlayer(s);
   const c=Combat.get(s,'player');
   Combat.harm(s,c,p.grade>=5?3:2);
   Unified.sync(s,{source:'wounds'});
 }
 C.event(s,'research',`Research complication: d20 ${d} → ${label}`);
 return {roll:d,label};}
function pointsFor(result){return result.degree==='exceptional'?3:result.degree==='strong'?2:result.degree==='success'?1:result.degree==='severe failure'?-1:0;}
function week(s,p,{modifier,mentor=0,facility=0,resources=0,assistance=0,partTime=false,subject=null}={}){
 if(!p.surveyed||p.status!=='researching'||p.progress>=p.track)throw Error('Project must be surveyed and unfinished');
 C.int(mentor,'mentor',0,3);C.int(facility,'facility',-1,2);C.int(resources,'resources',0,2);C.int(assistance,'assistance',0,4);
 if(p.grade>=3&&facility<0)throw Error('Grade III+ research needs a facility');
 const modifierCap=Math.min(6,mentor+facility+resources),bonus=C.int(modifier,'modifier',-100,100)+p.prep+modifierCap+assistance;
 const price=COST[p.grade]*(resources===1?2:resources===2?4:1);
 if(s.player.coins<price)throw Error('Research materials insufficient');s.player.coins=Number((s.player.coins-price).toFixed(2));
 const r=C.check(s,{modifier:bonus,dc:p.dc,label:`Research Week: ${p.title}`});p.weeks++;
 const raw=pointsFor(r),delta=raw===-1?-1:(partTime?raw/2:raw);
 p.progress=Math.max(0,Math.min(p.track,p.progress+delta));const milestones=milestone(p);
 if(r.roll===20)s.player.insightPoints=(s.player.insightPoints||0)+1;
 const comp=raw===-1?complication(s,p):null;
 W.advance(s,6);
 return {degree:r.degree,points:delta,progress:p.progress,track:p.track,milestones,complication:comp,selfExperimentRisk:!!(comp&&subject),requiresAdditionalFailureTable:!!(comp&&subject),coinsSpent:price};
}

function fieldwork(s,p,{eventIndex,relevance}={}){
 if(p.status!=='researching'||!p.surveyed)throw Error('Fieldwork requires a surveyed active project');
 if(typeof relevance!=='string'||relevance.trim().length<8)throw Error('GM must record how this scene bears on the research');
 C.int(eventIndex,'event index',0,s.log.length-1);
 const ev=s.log[eventIndex];if(ev.type!=='roll'||!ev.details||typeof ev.details.margin!=='number')throw Error('Fieldwork must cite an actual recorded check');
 const sixday=Math.floor((E.day(s)-1)/6),fromDay=ev.day;
 if(Math.floor((fromDay-1)/6)!==sixday)throw Error('Evidence must be from the current sixday');
 p.fieldwork ||= [];
 if(p.fieldwork.filter(x=>x.sixday===sixday).length>=2)throw Error('At most two fieldwork intervals per sixday');
 const evidenceId=crypto.createHash('sha256').update(JSON.stringify(ev)).digest('hex');
 if(p.fieldwork.some(x=>x.evidenceId===evidenceId))throw Error('Evidence already counted');
 // Fieldwork uses the original scene check result; it NEVER rolls again.
 const margin=ev.details.margin;
 const progress=margin>=10?3:margin>=5?2:margin>=0?1:0;
 p.fieldwork.push({evidenceId,sixday,relevance:relevance.trim().slice(0,200),progress});
 p.progress=Math.min(p.track,p.progress+progress);const milestones=milestone(p);
 return {points:progress,progress:p.progress,milestones,source:'recorded check',noNewRoll:true};
}
function hypothesis(s,p,{hypothesis,modifier=0}={}){if(p.progress<p.track*.25)throw Error('Hypothesis testing starts at 25% progress');
 if(typeof hypothesis!=='string'||!hypothesis.trim())throw Error('Hypothesis required');
 if(p.status!=='researching')throw Error('Project not researching');
 if(s.player.coins<COST[p.grade])throw Error('No materials for hypothesis test');s.player.coins-=COST[p.grade];
 const r=C.check(s,{modifier:C.int(modifier,'modifier',-100,100)+p.prep,dc:p.dc,label:`Hypothesis ${p.title}`});p.weeks++;W.advance(s,6);
 if(!r.success)return {outcome:'inconclusive'};
 const accepted=(p.truth.acceptedHypotheses||[]).map(x=>x.toLowerCase().trim());const matches=accepted.includes(hypothesis.toLowerCase().trim());
 if(matches){p.progress=Math.min(p.track,p.progress+2);milestone(p);return {outcome:'confirmed',points:2};}
 s.table.practicePoints ||= {};s.table.practicePoints[p.skill]=(s.table.practicePoints[p.skill]||0)+1;return {outcome:'refuted',practicePoint:1};
}
function proof(s,p,{modifier=0,extraInsight=0,testerAtTier=false}={}){if(p.progress<p.track||p.status!=='researching')throw Error('Research track unfinished');
 if(p.theory&&!testerAtTier)throw Error('Theoretical work requires a tester at the target tier');C.int(extraInsight,'extra insight',0,2);
 const ipNeeded=p.ipRequired+extraInsight;if((s.player.insightPoints||0)<ipNeeded)throw Error('Insufficient Insight Points');s.player.insightPoints-=ipNeeded;
 const r=C.check(s,{modifier:C.int(modifier,'modifier',-100,100)+p.prep+extraInsight*2,dc:p.dc,label:`Proof ${p.title}`});p.weeks++;W.advance(s,6);
 if(r.degree==='severe failure'){p.progress=Math.max(0,p.progress-p.track*.5);const comp=complication(s,p);return {outcome:'accident',complication:comp};}
 if(r.degree==='failure'){p.progress=Math.max(0,p.progress-p.track*.25);s.table.practicePoints ||= {};s.table.practicePoints[p.skill]=(s.table.practicePoints[p.skill]||0)+1;return {outcome:'failure',practicePoint:1};}
 if(p.truth.feasibility==='not_as_framed'){p.status='lesser';return {outcome:'lesser',result:String(p.truth.lesser||'Less ambitious result still requires GM identification')};}
 p.status=r.degree==='setback'?'flawed':'proven';if(r.degree==='exceptional')s.player.insightPoints++;
 return {outcome:p.status,refinement:r.degree==='exceptional',requiresCatch:p.truth.feasibility==='catch'};
}
function replication(s,p,{modifier=0}={}){if(p.status!=='proven')throw Error('Proof required before validation');if(s.player.coins<COST[p.grade])throw Error('Insufficient replication materials');
 s.player.coins-=COST[p.grade];const r=C.check(s,{modifier:C.int(modifier,'modifier',-100,100),dc:Math.max(2,p.dc-2),label:`Replication ${p.title}`});W.advance(s,6);
 if(r.success)p.replications++;if(p.replications>=2){p.status='recognised';s.player.fame=(s.player.fame||0)+p.fame;s.player.reputation.academy++;}
 return {degree:r.degree,replications:p.replications,recognised:p.status==='recognised',fame:p.status==='recognised'?p.fame:0};}
// System Additions 04 §6.8: researched myths are evidence, not invented evolution truths.
function mythLead(s,{id,sourceId,source,sourceKind='myth',modifier=0,dc=15,minutes=120}={}){
 const p=get(s,id);
 if(p.kind!=='evolution')throw Error('Myth lead procedure only documents beast evolutionary research');
 if(!['myth','relic','ruin','temple record','elder testimony','fossil'].includes(sourceKind))throw Error('A myth lead needs an identifiable source type');
 if(typeof sourceId!=='string'||!/^[a-z][a-z0-9_-]{2,60}$/.test(sourceId))throw Error('Use a stable distinct source ID');
 if(typeof source!=='string'||source.trim().length<15)throw Error('A concrete previously encountered record or site is required');
 C.int(modifier,'lore modifier',-60,60);C.int(dc,'myth source DC',15,20);C.int(minutes,'research minutes',15,1440);
 p.mythLeads ||= [];
 if(p.mythLeads.some(x=>x.sourceId===sourceId))throw Error('This myth source has already been surveyed');
 const roll=C.check(s,{modifier,dc,label:`Trace evolution myth at ${sourceKind}`});
 const prep=roll.degree==='exceptional'?3:roll.degree==='strong'?2:roll.success?1:0;
 const clueCount=roll.degree==='exceptional'?2:roll.degree==='strong'?1:0;
 p.prep=Math.max(p.prep,prep);
 const known=new Set(p.clues);
 const revealed=[];
 for(const fixed of p.truth.requirements){if(revealed.length>=clueCount)break;if(!known.has(fixed)){known.add(fixed);p.clues.push(fixed);revealed.push(fixed);}}
 const sealedFalseLead=roll.degree==='severe failure';
 p.mythLeads.push({sourceId,source:source.trim().slice(0,220),sourceKind,day:E.day(s),dc,degree:roll.degree,prep,clues:revealed.length,sealedFalseLead});
 if(sealedFalseLead)(p.sealedFalseLeads ||= []).push({sourceId,needsPrecommittedMisinterpretation:true});
 E.advance(s,minutes);
 return {degree:roll.degree,preparation:p.prep,clues:revealed,source:sourceKind,
   researchTimeMinutes:minutes,note:'Clues come from fixed research truth; no new branch or ability is generated'};
}
module.exports={NOVELTY,COST,start,get,publicCard,survey,week,fieldwork,hypothesis,proof,replication,pointsFor,mythLead};