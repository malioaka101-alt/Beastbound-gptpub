'use strict';
// Real, limited ethical Soul uses on the existing personal Soul record.
// Stage IV: source-witnessed self-stabilisation of ACTUAL soul injury.
// Stage V: voluntary own memory imprint and unconditional self-revocation.
// Stage VI: short bounded personal Soul Domain pulse, no NPC mindreading.
const Crypto=require('node:crypto'),E=require('../engine.js'),C=require('./core'),
 High=require('./soul-higher-architecture'),W=require('./world'),
 Places=require('../world/lived-places'),U=require('./unified');
const ORIGIN='source-earned-consensual-personal-soul-applications-v1',
 HEAL='witnessed-personal-spiritual-injury-therapy-v1',
 MEMORY='witnessed-personal-memory-imprint-source-v1',
 FIELD='witnessed-self-limited-soul-domain-countertest-v1',
 REVOKE='voluntary-original-self-imprint-revocation-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const integer=(x,lo=0,hi=100000000)=>Number.isInteger(x)&&x>=lo&&x<=hi;
const phrase=(x,lo=12,hi=900)=>typeof x==='string'&&x.trim().length>=lo&&x.trim().length<=hi;
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{2,75}$/.test(x);
const only=(x,k)=>x&&typeof x==='object'&&!Array.isArray(x)&&
 Object.keys(x).every(v=>k.includes(v));
function sourceEvent(s,index,kind){
 if(!integer(index,0,s.log.length-1))throw Error('An original witnessed personal Soul event is required');
 const e=s.log[index];
 if(e?.type!=='story'||e.details?.origin!==kind||
  e.details.location!==s.world.location||
  !phrase(e.text,16,900))
  throw Error('No genuine locally observed self-owned Soul evidence is established');
 return structuredClone(e);
}
function original(s,phase){
 if(!s.player?.soul||s.player.soul.phase<phase||
  !High.verify(s)||!Places.location(s)||
  s.battle||s.encounter||
  (s.table?.combatants?.player&&s.table.combatants.player.status!=='ok'))
  throw Error('This Soul application requires an earned safe original self-architecture and a conscious present practitioner');
 return s.player.soul;
}
function sourceVerified(s){
 const t=s.table?.soulArchitecture?.ethicalApplications;
 if(!t)return true;
 if(t.origin!==ORIGIN||!Array.isArray(t.healing)||
  !t.imprints||typeof t.imprints!=='object'||Array.isArray(t.imprints)||
  !Array.isArray(t.pulses))return false;
 const witnesses=new Set();
 function checkRoll(receipt,kind){
  const a=receipt?.source;
  if(receipt?.origin!==ORIGIN||receipt.seal!==hash(a)||
   a?.origin!==ORIGIN||a.kind!==kind||
   !integer(a.minute,0,s.world.minutes)||
   !integer(a.minutes,5,480)||
   !integer(a.reserveSpent,1,50)||!integer(a.staminaSpent,1,20)||
   !integer(a.roll,1,20)||a.check?.roll!==a.roll||
   !a.checkEvent||hash(a.checkEvent)!==a.checkEventHash||
   a.checkEvent.type!=='roll'||hash(a.checkEvent.details)!==hash(a.check)||
   !a.witness||hash(a.witness)!==a.witnessHash||
   witnesses.has(a.witnessHash))return false;
  witnesses.add(a.witnessHash);
  return true;
 }
 for(const row of t.healing){
  const a=row?.source;
  if(!checkRoll(row,'healing')||
   a.witness.details?.origin!==HEAL||
   a.witness.details?.injuryBefore!==a.before||
   !integer(a.before,1,99)||!integer(a.after,1,100)||
   a.reserveSpent!==2||
   a.after!==(a.check.success?Math.min(100,a.before+2):
    a.check.degree==='severe failure'?Math.max(1,a.before-1):a.before)||
   !phrase(a.witness.details?.observedInjury,24,900)||
   !phrase(a.witness.details?.treatmentLimit,24,900))
   return false;
 }
 for(const [name,row] of Object.entries(t.imprints)){
  const a=row?.source,revocations=row?.revocations;
  if(!id(name)||!checkRoll(row,'imprint')||
   a.id!==name||a.witness.details?.origin!==MEMORY||
   !integer(a.memoryIndex,0,s.log.length-1)||
   !s.log[a.memoryIndex]||
   s.log[a.memoryIndex].type!=='story'||
   a.memoryHash!==hash(s.log[a.memoryIndex])||
   a.witness.details?.memoryHash!==a.memoryHash||
   !phrase(a.summary,15,350)||
   a.witness.details?.personallyWitnessed!==true||
   !Array.isArray(revocations)||
   row.formed!==a.check.success)
   return false;
  for(const revoked of revocations){
   const q=revoked?.source;
   if(revoked?.origin!==REVOKE||revoked.seal!==hash(q)||
    q?.origin!==REVOKE||q.id!==name||
    q.originalSeal!==row.seal||q.selfRevoked!==true||
    !integer(q.minute,a.minute,s.world.minutes))
    return false;
  }
  if(revocations.length>1||
   (revocations.length>0&&!row.formed)||
   row.active!==(row.formed&&revocations.length===0))
   return false;
 }
 for(const row of t.pulses){
  const a=row?.source,d=s.table?.soulArchitecture?.higher?.records?.[6]?.source;
  if(!checkRoll(row,'pulse')||
   a.witness.details?.origin!==FIELD||
   !d||a.sourceDomainHash!==hash(d)||
   !integer(a.radius,1,d.measuredRangeMetres)||
   a.witness.details?.radiusMetres!==a.radius||
   !phrase(a.witness.details?.independentCounter,24,900)||
   !phrase(a.witness.details?.personalBoundary,24,900)||
   a.sustained!==a.check.success||
   a.sustainedUntil!==(a.sustained?a.minute+a.minutes:null)||
   a.reserveSpent!==3+Math.ceil(a.radius/3))
   return false;
 }
 return true;
}
function ensure(s){
 s.table.soulArchitecture.ethicalApplications||={
  origin:ORIGIN,healing:[],imprints:{},pulses:[]};
 if(!sourceVerified(s))throw Error('Original personal Soul application history was altered');
 return s.table.soulArchitecture.ethicalApplications;
}
function stabilize(s,p={}){
 if(!only(p,['witnessIndex','minutes'])||!integer(p.minutes??60,15,480))
  throw Error('Personal spiritual rehabilitation needs a real witnessed injury and treatment time');
 const soul=original(s,4);
 if(!integer(soul.stability,1,99))
  throw Error('The actual Soul has no recorded instability to rehabilitate');
 if(!sourceVerified(s))throw Error('Original personal Soul healing history was altered');
 const witness=sourceEvent(s,p.witnessIndex,HEAL);
 if(witness.details?.injuryBefore!==soul.stability||
  !phrase(witness.details?.observedInjury,24,900)||
  !phrase(witness.details?.treatmentLimit,24,900))
  throw Error('A specific original observed Soul stability deficit and bounded treatment plan are required');
 const root=s.table.soulArchitecture.ethicalApplications;
 if(root?.healing?.some(x=>x.source.witnessHash===hash(witness)))
  throw Error('One originally witnessed Soul treatment cannot be rolled twice');
 const minutes=p.minutes??60,reserveSpent=2,staminaSpent=1+Math.ceil(minutes/120);
 if(!integer(soul.reserve,reserveSpent,100000)||
  !integer(s.player.stamina,staminaSpent,100000))
  throw Error('Real Soul Reserve and Stamina are needed for rehabilitation');
 const before=s.world.minutes,prior=soul.stability;
 soul.reserve-=reserveSpent;s.player.stamina-=staminaSpent;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
 const check=C.check(s,{modifier:Math.floor(((s.player.attributes?.wis??10)-10)/2)+
  2*(s.player.skills?.cultivation?.rank||0),
  dc:16,label:'Clinically witnessed personal Soul resonance stabilisation'});
 const checkEvent=structuredClone(s.log.at(-1));
 soul.stability=check.success?Math.min(100,prior+2):
  check.degree==='severe failure'?Math.max(1,prior-1):prior;
 const source={origin:ORIGIN,kind:'healing',minute:before,minutes,
  reserveSpent,staminaSpent,witness,witnessHash:hash(witness),
  roll:check.roll,check:structuredClone(check),checkEvent,
  checkEventHash:hash(checkEvent),before:prior,after:soul.stability};
 ensure(s).healing.push({origin:ORIGIN,source,seal:hash(source)});
 E.advance(s,minutes);W.finalizeTime(s,before);U.sync(s,{source:'legacy'});
 if(!sourceVerified(s))throw Error('Soul therapy cannot be reconciled to the real injury and original check');
 return {attempted:true,check,stabilityBefore:prior,stabilityAfter:soul.stability,
  reserveSpent,staminaSpent,minutes,
  noResurrectionMemoryEditingOrOtherSoulChange:true};
}
function imprint(s,p={}){
 if(!only(p,['id','summary','memoryIndex','witnessIndex','minutes'])||
  !id(p.id)||!phrase(p.summary,15,350)||
  !integer(p.memoryIndex,0,s.log.length-1)||
  !integer(p.minutes??45,15,480))
  throw Error('An own remembered, witnessed original event, self-consent and genuine imprint effort are required');
 const soul=original(s,5);
 if(!sourceVerified(s))throw Error('Saved original personal imprint history is inconsistent');
 const memory=s.log[p.memoryIndex];
 if(memory?.type!=='story')
  throw Error('Only an original personally observed scene can become a self-owned memory imprint');
 const witness=sourceEvent(s,p.witnessIndex,MEMORY),d=witness.details;
 if(p.memoryIndex>=p.witnessIndex||d.memoryHash!==hash(memory)||
  d.personallyWitnessed!==true||
  !phrase(d?.selfConsent,24,900)||
  !phrase(d?.privacyBoundary,24,900))
  throw Error('Original personal memory, voluntary informed self-consent and privacy boundaries are required');
 if(s.table.soulArchitecture.ethicalApplications?.imprints?.[p.id])
  throw Error('This individual imprint history already exists and cannot be overwritten');
 const minutes=p.minutes??45,reserveSpent=2,staminaSpent=2;
 if(!integer(soul.reserve,reserveSpent,100000)||
  !integer(s.player.stamina,staminaSpent,100000))
  throw Error('Imprinting requires genuine Soul Reserve and physical energy');
 const before=s.world.minutes;
 soul.reserve-=reserveSpent;s.player.stamina-=staminaSpent;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
 const check=C.check(s,{modifier:Math.floor(((s.player.attributes?.wis??10)-10)/2)+
  2*(s.player.skills?.cultivation?.rank||0),dc:18,
  label:'Individual voluntary memory imprint from personally witnessed experience'});
 const checkEvent=structuredClone(s.log.at(-1));
 const source={origin:ORIGIN,kind:'imprint',id:p.id,summary:p.summary.trim(),
  memoryIndex:p.memoryIndex,memoryHash:hash(memory),
  minute:before,minutes,reserveSpent,staminaSpent,
  witness,witnessHash:hash(witness),roll:check.roll,
  check:structuredClone(check),checkEvent,checkEventHash:hash(checkEvent)};
 ensure(s).imprints[p.id]={origin:ORIGIN,source,seal:hash(source),
  formed:check.success,active:check.success,revocations:[]};
 E.advance(s,minutes);W.finalizeTime(s,before);U.sync(s,{source:'legacy'});
 if(!sourceVerified(s))throw Error('Original personally witnessed imprint source is no longer valid');
 return {attempted:true,formed:check.success,id:p.id,check,
  reserveSpent,staminaSpent,minutes,active:check.success,
  noExternalMemoryCopiedOrSentientSoulCreated:true};
}
function revoke(s,p={}){
 if(!only(p,['id'])||!id(p.id))throw Error('An existing self-owned imprint identity is required for voluntary revocation');
 const soul=original(s,5);
 if(!sourceVerified(s))throw Error('Original personal imprint history was changed');
 const root=s.table?.soulArchitecture?.ethicalApplications,record=root?.imprints?.[p.id];
 if(!record?.formed||!record.active)
  throw Error('There is no active original self-owned imprint to revoke');
 const start=s.world.minutes,source={origin:REVOKE,id:p.id,minute:start,
  originalSeal:record.seal,selfRevoked:true};
 record.revocations.push({origin:REVOKE,source,seal:hash(source)});
 record.active=false;
 E.advance(s,5);W.finalizeTime(s,start);
 if(!sourceVerified(s))throw Error('The self-revocation record was altered');
 return {revoked:true,id:p.id,minutes:5,
  noOtherConsentNeededForOwnRevocation:true,
  noOtherPersonsMemoriesModified:true};
}
function pulse(s,p={}){
 if(!only(p,['witnessIndex','minutes','radius'])||
  !integer(p.minutes??10,5,60)||!integer(p.radius,1,100000))
  throw Error('A genuinely observed bounded personal Soul Domain and real measured radius are required');
 const soul=original(s,6);
 if(!sourceVerified(s))throw Error('Original Soul Domain application history was altered');
 const sourceDomain=s.table.soulArchitecture.higher.records[6]?.source;
 if(!sourceDomain||
  !integer(p.radius,1,sourceDomain.measuredRangeMetres))
  throw Error('The previously earned personal Soul Domain cannot exceed its original witnessed range');
 const witness=sourceEvent(s,p.witnessIndex,FIELD);
 if(witness.details?.radiusMetres!==p.radius||
  !phrase(witness.details?.independentCounter,24,900)||
  !phrase(witness.details?.personalBoundary,24,900))
  throw Error('The currently measured local domain and independent environmental resistance must be witnessed');
 const root=s.table.soulArchitecture.ethicalApplications;
 if(root?.pulses?.some(x=>x.source.witnessHash===hash(witness)))
  throw Error('The same original bounded Soul Domain check cannot be repeated');
 const minutes=p.minutes??10,
  reserveSpent=3+Math.ceil(p.radius/3),
  staminaSpent=1+Math.ceil(minutes/20);
 if(!integer(soul.reserve,reserveSpent,100000)||
  !integer(s.player.stamina,staminaSpent,100000))
  throw Error('Actual Soul Reserve and Stamina cannot sustain the witnessed spiritual field');
 const before=s.world.minutes;
 soul.reserve-=reserveSpent;s.player.stamina-=staminaSpent;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
 const check=C.check(s,{modifier:Math.floor(((s.player.attributes?.wis??10)-10)/2)+
  2*(s.player.skills?.cultivation?.rank||0),
  dc:16+Math.ceil(p.radius/5),
  label:'Original bounded self-only Soul Domain environmental countertest'});
 const checkEvent=structuredClone(s.log.at(-1));
 const source={origin:ORIGIN,kind:'pulse',minute:before,minutes,
  radius:p.radius,sourceDomainHash:hash(sourceDomain),reserveSpent,
  staminaSpent,witness,witnessHash:hash(witness),check:structuredClone(check),
  checkEvent,checkEventHash:hash(checkEvent),roll:check.roll,
  sustained:check.success,sustainedUntil:check.success?before+minutes:null};
 ensure(s).pulses.push({origin:ORIGIN,source,seal:hash(source)});
 E.advance(s,minutes);W.finalizeTime(s,before);U.sync(s,{source:'legacy'});
 if(!sourceVerified(s))throw Error('Soul Domain pulse has no verified physical or environmental support');
 return {attempted:true,sustained:check.success,collapsed:!check.success,
  check,radiusMetres:p.radius,minutes,reserveSpent,staminaSpent,
  noAutomaticMindReadingNpcControlOrTerritoryClaim:true};
}
function status(s){
 const phase=s.player?.soul?.phase||0;
 if(phase<4)return {phase,available:false,
  note:'Genuinely earned Phase IV Soul Forge is needed for ethical applications'};
 if(!sourceVerified(s))throw Error('Original personally consented Soul applications have been altered');
 const root=s.table?.soulArchitecture?.ethicalApplications;
 return {phase,stability:s.player.soul.stability,
  personalImprints:Object.entries(root?.imprints||{}).map(([k,x])=>({
   id:k,summary:x.source.summary,active:x.active,formed:x.formed,
   revocableBySelf:true})),
  priorSelfHealingAttempts:root?.healing?.length||0,
  priorBoundedDomainAttempts:root?.pulses?.length||0,
  noOtherPersonsMemoryOrSoulAccess:true};
}
module.exports={ORIGIN,HEAL,MEMORY,FIELD,REVOKE,
 stabilize,imprint,revoke,pulse,status,verify:sourceVerified};
