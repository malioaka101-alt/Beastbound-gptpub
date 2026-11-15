'use strict';
// Beastbound source-bound GM briefing and optional structured fact guard.
// Pure and read-only: no progression, actor decisions, dice or save mutation.
// Arbitrary prose is not mechanically provable: unverifiable claims fail closed.
const Presence=require('../world/person-presence');
const Kin=require('../world/origin-relatives');
const Realm=require('../world/simulation');
const Continuity=require('./scene-continuity');
const Panels=require('../panels');
const SKIN='beastbound-ink-gold-manhwa-v1';
const TYPES=Object.freeze({
 'npc-present':['type','npcId'],
 'npc-knows':['type','npcId','factId'],
 'relationship':['type','npcId','kinship'],
 'player-has-item':['type','itemId'],
 'narrative-fact':['type','factId'],
 'spoken-exact':['type','words'],
 'panel-skin':['type','skin']
});
const keys=(v,allowed)=>!!v&&typeof v==='object'&&!Array.isArray(v)&&
 Object.keys(v).every(k=>allowed.includes(k));
const token=v=>typeof v==='string'&&/^[a-z][a-z0-9_:.-]{2,110}$/.test(v);
const phrase=(v,len=200)=>typeof v==='string'&&v.trim()&&v.length<=len;
function validateAssertions(assertions){
 if(!Array.isArray(assertions)||!assertions.length||assertions.length>8)
  throw Error('GM evidence requires one to eight pre-existing claims, not a new story outcome');
 return assertions.map(c=>{
  const fields=TYPES[c?.type];
  if(!fields||!keys(c,fields)||Object.keys(c).length!==fields.length)
   throw Error('Unsupported or untyped GM scene assertion; do not choose actor outcomes');
  if(c.type==='npc-present'&&!token(c.npcId)||
     c.type==='npc-knows'&&(!token(c.npcId)||!token(c.factId))||
     c.type==='relationship'&&(!token(c.npcId)||!token(c.kinship))||
     c.type==='player-has-item'&&!token(c.itemId)||
     c.type==='narrative-fact'&&!token(c.factId)||
     c.type==='spoken-exact'&&!phrase(c.words,250)||
     c.type==='panel-skin'&&!phrase(c.skin,80))
   throw Error('GM assertion has an invalid original actor, evidence, wording or skin');
  return c;
 });
}
function knownFamily(s){
 const summary=Kin.status(s,{});
 return summary.relatives.map(r=>({
  npcId:r.npcId,name:r.name,
  // A mechanical household role is NOT an asserted biological relationship.
  kinship:r.kinship||null,householdRole:r.householdRole,
  confirmedRelationship:r.confirmedRelationship||null
 }));
}
function context(s){
 const at=s.world?.location,w=Realm.peek(s),
  present=Presence.localStatus(s,w).people,
  hud=Panels.hudData(s);
 Continuity.verify(s.chatRuntime?.continuity);
 return {hud,locationId:at,minute:s.world?.minutes,
  present,relatives:knownFamily(s),
  publicStoryFacts:Object.values(s.chatRuntime?.continuity?.facts||{})
   .filter(f=>f.status==='active'&&f.visibility==='player-known')
   .map(f=>({id:f.id,category:f.category,subject:f.subject,
    statement:f.statement,sourceSeal:f.head}))};
}
function brief(s,params={}){
 if(!keys(params,['npcId'])||
   params.npcId!==undefined&&!token(params.npcId))
  throw Error('A GM briefing accepts only a previously established NPC identity filter');
 const v=context(s),focus=s.chatRuntime?.focus||[];
 const queried=params.npcId;
 const nearby=queried?v.present.filter(p=>p.npcId===queried):v.present;
 const knownFamily=queried?v.relatives.filter(p=>p.npcId===queried):v.relatives;
 return {
  authority:'current verified save; never an independent actor decision',
  location:v.locationId,clock:v.hud.time,date:v.hud.date,
  player:{name:v.hud.name,age:v.hud.identity.age,
   resources:v.hud.resources,coins:v.hud.coins},
  presentPeople:nearby.map(p=>({npcId:p.npcId,name:p.name,
   profession:p.profession,actuallyPresent:true,noInferredConsent:true})),
  ...(queried?{queriedNpc:queried,presenceConfirmed:nearby.length===1}:{}),
  knownFamily,
  knownStoryFacts:v.publicStoryFacts,
  currentScene:s.chatRuntime?.scene||null,
  focus:Array.isArray(focus)?focus.slice(0,2):[],
  panel:{skin:v.hud.presentation.skin,variant:v.hud.presentation.variant,
   approvedRenderer:'panels.inChatHtml',contract:v.hud.presentation.contract},
  boundaries:{
   unlistedPerson:'not confirmed here; never automatically absent',
   householdRole:'guardian does not establish mother, aunt or biological kinship',
   npcSecrets:'a nearby NPC knows no private fact by proximity alone',
   books:'a studied subject is not proof that its physical notes are held',
   ordinaryDialogue:'do not force a meal, quest, consent, paid job or player decision',
   timeAndRewards:'only a verified original engine output may change numbers'
  }
 };
}
function audit(s,params={}){
 if(!keys(params,['assertions','scene'])||
  params.scene!==undefined&&!phrase(params.scene,450))
  throw Error('GM evidence review takes only an actual short draft and typed assertions');
 const claims=validateAssertions(params.assertions);
 const v=context(s);
 const verdicts=claims.map(c=>{
  let verified=false,reason='no source-backed evidence established';
  if(c.type==='npc-present'){
   verified=v.present.some(p=>p.npcId===c.npcId);
   reason=verified?'physically verified in the exact current scene':
    'presence not confirmed here; do not invent arrival or infer absence';
  }else if(c.type==='relationship'){
   const f=v.relatives.find(r=>r.npcId===c.npcId);
   const special=f?.confirmedRelationship||'';
   const relationPattern=new RegExp('\\b'+c.kinship.replace(/[.*+?^$\{\}()|[\]\\]/g,'\\$&')+'\\b','i');
   verified=!!f&&(f.kinship===c.kinship||
    (special.length>0&&!/\\b(?:not|never|isn.t)\\b/i.test(special)&&
     relationPattern.test(special)));
   reason=verified?'original kinship or explicit confirmed continuity':
    'household role alone is not specific kinship; no matching sourced relation';
  }else if(c.type==='npc-knows'){
   const f=s.chatRuntime?.continuity?.facts?.[c.factId];
   verified=!!f&&f.status==='active'&&f.category==='npc-knowledge'&&
    f.subject?.kind==='person'&&f.subject.id===c.npcId&&
    f.visibility==='player-known'&&
    !!Presence.identity(Realm.peek(s),c.npcId);
   reason=verified?'individual source-sealed knowledge fact':
    'no individual witnessed or learned knowledge; public fame is not private knowledge';
  }else if(c.type==='player-has-item'){
   const count=s.player?.inventory?.[c.itemId];
   verified=Number.isInteger(count)&&count>0;
   reason=verified?'original personally owned inventory item':
    'studying a subject or mentioning a notebook does not establish custody';
  }else if(c.type==='narrative-fact'){
   const f=v.publicStoryFacts.find(f=>f.id===c.factId);
   verified=!!f;
   reason=verified?'active witnessed player-known continuity record':
    'no active player-known source-sealed narrative fact';
  }else if(c.type==='spoken-exact'){
   verified=!!params.scene&&params.scene.includes(c.words);
   reason=verified?'exact player words appear in the scene':
    'quoted player speech must appear in the scene, not be paraphrased';
  }else if(c.type==='panel-skin'){
   verified=c.skin===SKIN&&v.hud.presentation.skin===SKIN;
   reason=verified?'approved ink-and-gold fantasy presentation':
    'a generic card is not the approved Beastbound fantasy window';
  }
  return {type:c.type,verified,reason};
 });
 return {clear:verdicts.every(x=>x.verified),verdicts,
  immutable:true,noTimeElapsed:true,noNPCDecision:true,noRoll:true};
}
function assert(s,assertions,{scene}={}){
 const result=audit(s,{assertions,scene});
 if(!result.clear)throw Error('GM compliance gate rejected an unsupported scene claim: '+
  result.verdicts.filter(x=>!x.verified).map(x=>x.type+': '+x.reason).join('; '));
 return result;
}
module.exports={SKIN,TYPES,validateAssertions,brief,audit,assert};
