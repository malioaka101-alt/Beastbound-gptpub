'use strict';
// An actual independent professional can accept or refuse a request to
// reproduce an already proven, limited practical study. No pre-authored
// phantom tester or caller-selected skill, die, yes/no decision is needed.
const Crypto=require('node:crypto'),
 Engine=require('../engine.js'),World=require('./world'),
 Health=require('./unified'),Presence=require('../world/person-presence'),
 Atlas=require('../world/atlas');
const ORIGIN='onsite-independent-professional-research-replication-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const MINUTES=20,STA=1;
function verify(s,t){
 if(!t||t.origin!==ORIGIN||t.proofHash!==hash(t.proof)||
  t.source!==ORIGIN+':'+t.proofHash||
  t.testerId!==t.proof?.testerId||
  t.skillRank!==t.proof.skillRank||
  t.abilityScore!==10||
  t.proof.origin!==ORIGIN||
  t.proof.npcId!==t.testerId||
  t.proof.author!==s.player.name||
  !/^[a-z][a-z0-9_-]{1,48}$/.test(t.proof.projectId)||
  t.proof.skillRank<1||t.proof.skillRank>5||
  !Number.isInteger(t.worldMinute)||t.worldMinute!==t.proof.acceptedAtMinute||
  t.worldMinute>s.world.minutes||
  t.proof.consent!==true||
  t.proof.requestedMinutes!==MINUTES||
  t.proof.location!==t.proof.shift?.location||
  t.proof.npcId!==t.proof.shift?.npcId||
  t.proof.shift?.hash!==Presence.hash((({hash:seal,...body})=>body)(t.proof.shift))||
  t.proof.npcId!== 'notable:'+t.proof.notableId||
  t.proof.name!==t.proof.shift.name||
  t.proof.polity!==t.proof.shift.polity||
  !Atlas.I[t.proof.institutionId]||
  t.proof.shift.institution!==t.proof.institutionId)return false;
 const w=s.table?.realm,n=w?.notables?.[t.proof.notableId],
  project=s.table?.research?.[t.proof.projectId],
  plan=s.table?.researchPlans?.[t.proof.projectId];
 return !!(n&&project&&plan&&
  project.sourceResearchPlan===plan.source&&
  plan.used&&project.id===t.proof.projectId&&
  n.name===t.proof.name&&n.profession==='field specialist'&&
  n.polity===t.proof.polity&&
  n.institution===t.proof.institutionId&&
  n.professional.rank>=t.skillRank&&
  Presence.verified(w,t.proof.shift));
}
function invite(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).sort().join('|')!=='id|npcId'||
  typeof p.id!=='string'||typeof p.npcId!=='string')
  throw Error('A specific real proven project and currently present professional are required');
 const research=s.table?.research?.[p.id],
  plan=s.table?.researchPlans?.[p.id];
 if(!research||!plan||!plan.used||
  research.sourceResearchPlan!==plan.source||
  research.status!=='proven'||research.replications>=2||
  !['invention','ecology','method'].includes(research.kind)||
  research.grade>3)
  throw Error('Independent local field-replication invitations require an established proven practical study (Grade III or lower)');
 if(plan.origin===require('./design-research').ORIGIN&&
  !require('./design-research').verifyPlan(s,plan))
  throw Error('The sealed design source of this study is inconsistent');
 const Realm=require('../world/simulation'),
  w=Realm.peek(s),today=Math.floor(s.world.minutes/1440),
  minute=s.world.minutes%1440,
  loc=Presence.resolve(w,p.npcId,s.world.location,today),
  notable=w.notables?.[p.npcId.slice(8)];
 if(!loc||!p.npcId.startsWith('notable:')||
   !loc.presence||loc.profession!=='field specialist'||
   !notable||notable.name!==loc.name||
   notable.professional.rank<1||notable.injuryMonths>0||
   w.institutions[notable.institution]?.status!=='active')
  throw Error('A genuinely scheduled, capable, uninjured local field specialist must be physically present');
 if(plan.origin===require('./design-research').ORIGIN&&
  plan.localSource?.regionId!==Atlas.LOCATION_REGION[s.world.location])
  throw Error('This local instrument study must be independently examined in its actual tested habitat');
 if(minute<8*60||minute+MINUTES>18*60||
  s.battle||s.encounter||s.player.stamina<2)
  throw Error('Independent field study requires an available daytime appointment, safety and actual stamina');
 const requests=(s.table.researchReplicationInvitations||={});
 const already=(requests[p.id]||={})[p.npcId];
 if(already)throw Error('This professional has already freely answered this project invitation; no repeated consent rolls');
 if(s.table?.researchReplicators?.[p.id]?.[p.npcId])
  throw Error('This professional already has an independent test opportunity');
 // The relevant professional's employer, rank and genuine duty witness
 // must already be part of the saved independent world.
 const agreed=Realm.worldDraw(s)<(notable.professional.rank>=2?.73:.61),
  preMinute=s.world.minutes,shift=structuredClone(loc.presence);
 s.player.stamina-=STA;
 Engine.advance(s,MINUTES);World.finalizeTime(s,preMinute);
 Health.sync(s,{source:'legacy'});
 const acceptedAtMinute=s.world.minutes,notice={origin:ORIGIN,
  projectId:p.id,testerId:p.npcId,name:notable.name,
  location:shift.location,worldMinute:acceptedAtMinute,
  agreed,shiftHash:shift.hash};
 requests[p.id][p.npcId]={...notice,hash:hash(notice)};
 if(!agreed)return {projectId:p.id,professional:loc.name,agreed:false,
  elapsedMinutes:MINUTES,staminaSpent:STA,
  noAutomaticReplication:true,noNewResearchRoll:true,
  note:'The independently scheduled professional declined this request. No test was commissioned.'};
 const proof={origin:ORIGIN,projectId:p.id,testerId:p.npcId,
  notableId:notable.id,npcId:p.npcId,name:notable.name,
  author:s.player.name,skillRank:notable.professional.rank,
  institutionId:notable.institution,polity:notable.polity,
  location:shift.location,shift,
  consent:true,acceptedAtMinute,requestedMinutes:MINUTES};
 const evidence={origin:ORIGIN,testerId:p.npcId,
  skillRank:proof.skillRank,abilityScore:10,
  worldMinute:acceptedAtMinute,proof,proofHash:hash(proof),
  source:ORIGIN+':'+hash(proof),used:false};
 if(!verify(s,evidence))throw Error('Independent tester opportunity failed source verification');
 s.table.researchReplicators||={};
 s.table.researchReplicators[p.id]||={};
 s.table.researchReplicators[p.id][p.npcId]=evidence;
 return {projectId:p.id,testerId:p.npcId,
  professional:loc.name,agreed:true,
  rankBasis:'actual saved independent professional qualification',
  assumedAbilityScore:10,actualAbilityBonusClaimed:false,
  elapsedMinutes:MINUTES,staminaSpent:STA,
  oneRealReplicationOpportunity:true,
  noAutomaticReplication:true,
  note:'The professional agreed to attempt an independent replication. Use the original research.replication action for the actual check, cost and result.'};
}
module.exports={ORIGIN,invite,verify};
