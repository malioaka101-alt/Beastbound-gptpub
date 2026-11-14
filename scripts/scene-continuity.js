'use strict';
// Durable GM-established STORY knowledge in the existing chatRuntime save.
// This is not a second ledger of consent, powers, funds, employment, biology,
// legal decisions, wounds, rolls or actor existence. Ordinary dialogue remains
// chat-native; meaningful scene checkpoints can carry sourced story continuity.
const Crypto=require('node:crypto');
const ORIGIN='gm-witnessed-narrative-continuity-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const ident=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{3,79}$/.test(x);
const refId=x=>typeof x==='string'&&/^[a-z][a-z0-9_:-]{0,109}$/.test(x);
const note=(x,a,b)=>typeof x==='string'&&x.trim().length>=a&&x.trim().length<=b;
const own=(o,allowed)=>o&&typeof o==='object'&&!Array.isArray(o)&&
 Object.keys(o).every(k=>allowed.includes(k));
const subjectKinds=['player','person','beast','place','group','world','narrative'];
function validSubject(q){
 return own(q,['kind','id'])&&Object.keys(q).length===2&&
  subjectKinds.includes(q.kind)&&typeof q.id==='string'&&
  (q.kind==='world'?q.id==='world':
   q.kind==='player'?q.id==='player':
   q.kind==='narrative'?ident(q.id):refId(q.id));
}
function preflight(req){
 if(req.gmWitness!==undefined&&!note(req.gmWitness,12,800))
  throw Error('Private GM scene evidence must be a meaningful bounded source');
 if(req.continuity===undefined){
  if(req.gmWitness!==undefined)
   throw Error('Private GM evidence is supported only alongside an actual GM-only continuity fact');
  return;
 }
 if(['status','sequence'].includes(req.mode))
  throw Error('Read-only and sequential turn requests cannot author narrative continuity');
 const entries=req.continuity;
 if(!Array.isArray(entries)||!entries.length||entries.length>8||
    !(req.scene?.trim()||req.summary?.trim()))
  throw Error('Narrative continuity belongs to an actually recorded scene or summary, up to eight meaningful facts');
 const publicText=[req.scene,req.summary].filter(Boolean).join('\n');
 if(req.gmWitness!==undefined&&!entries.some(p=>p?.visibility==='gm-only'))
  throw Error('Private GM evidence cannot be attached to a public-only scene');
 const seen=new Set();
 for(const p of entries){
  if(!own(p,['id','action','subject','category','statement','witness','visibility','priorSeal'])||
    !ident(p.id)||!['record','revise','retire'].includes(p.action)||
    !validSubject(p.subject)||!note(p.category,3,60)||
    !note(p.statement,10,480)||!note(p.witness,12,350)||
    !['player-known','gm-only'].includes(p.visibility)||
    !(p.visibility==='gm-only'?req.gmWitness:publicText)?.includes(p.witness)||
    (p.action==='record'&&p.priorSeal!==undefined)||
    (p.action!=='record'&&
     (typeof p.priorSeal!=='string'||!/^[0-9a-f]{64}$/.test(p.priorSeal)))||
    seen.has(p.id))
   throw Error('Narrative fact needs stable ID, meaningful subject, actual scene quotation and original prior seal for changes; no assumed agreement');
  seen.add(p.id);
 }
}
function registered(s,q){
 if(q.kind==='player'||q.kind==='world'||q.kind==='narrative')return true;
 if(q.kind==='beast'){
  const b=s.beasts?.[q.id];
  return !!b&&(!b.gmWild||require('../world/gm-wild-individuals').verify(s,b));
 }
 if(q.kind==='place')return !!require('../world/lived-places').location(s,q.id);
 const w=require('../world/simulation').peek(s);
 if(q.kind==='person')
  return !!require('../world/person-presence').identity(w,q.id);
 if(q.kind==='group')
  return !!require('../world/emergent-groups').lookup(w,q.id);
 return false;
}
function verify(c){
 if(c===undefined)return true;
 if(!c||c.version!==1||c.origin!==ORIGIN||
    !c.facts||Array.isArray(c.facts)||typeof c.facts!=='object')
  throw Error('Unverified original narrative continuity registry');
 for(const [id,f] of Object.entries(c.facts)){
  if(id!==f?.id||!ident(id)||!validSubject(f.subject)||
     !note(f.category,3,60)||!['player-known','gm-only'].includes(f.visibility)||
     !Array.isArray(f.history)||!f.history.length||
     !['active','retired'].includes(f.status))
   throw Error('Unverified original narrative fact identity');
  let prev=null,minute=-1;
  for(let i=0;i<f.history.length;i++){
   const row=f.history[i],x=row?.source;
   if(!x||x.origin!==ORIGIN||x.id!==id||row.seal!==hash(x)||
      x.previousSeal!==prev||x.action!==(i===0?'record':
       i===f.history.length-1&&f.status==='retired'?'retire':'revise')||
      x.category!==f.category||JSON.stringify(x.subject)!==JSON.stringify(f.subject)||
      x.visibility!==f.visibility||
      !note(x.statement,10,480)||!note(x.witness,12,350)||
      !ident(x.turnId)||!Number.isInteger(x.minute)||x.minute<minute||
      !Number.isInteger(x.day)||x.day!==Math.floor(x.minute/1440)+1)
    throw Error('Narrative fact history was rewritten or detached from its scene source');
   prev=row.seal;minute=x.minute;
  }
  const last=f.history.at(-1);
  if(f.head!==last.seal||f.statement!==last.source.statement||
     f.status!==(last.source.action==='retire'?'retired':'active'))
   throw Error('Narrative fact current state does not match its witnessed history');
 }
 return true;
}
function apply(s,req){
 preflight(req);
 if(!req.continuity)return {recorded:0};
 const c=s.chatRuntime.continuity||
  (s.chatRuntime.continuity={origin:ORIGIN,version:1,facts:{}});
 verify(c);
 const out=[];
 for(const p of req.continuity){
  const existing=c.facts[p.id];
  if(!registered(s,p.subject))
   throw Error('Narrative continuity cannot register an unverified person, beast, place or group as a real actor');
  if(p.action==='record'&&existing)
   throw Error('An existing narrative fact must be revised with original evidence, not silently replaced');
  if(p.action!=='record'&&(!existing||existing.status==='retired'||
     existing.head!==p.priorSeal||
     JSON.stringify(existing.subject)!==JSON.stringify(p.subject)||
     existing.category!==p.category||existing.visibility!==p.visibility))
   throw Error('Changing a fact requires its exact active identity, original head and unchanged audience');
  const source={origin:ORIGIN,id:p.id,action:p.action,
   subject:structuredClone(p.subject),category:p.category,
   statement:p.statement.trim(),witness:p.witness,
   visibility:p.visibility,minute:s.world.minutes,
   day:Math.floor(s.world.minutes/1440)+1,turnId:req.id,
   previousSeal:existing?.head||null};
  const row={source,seal:hash(source)};
  if(!existing){
   c.facts[p.id]={id:p.id,subject:structuredClone(p.subject),
    category:p.category,visibility:p.visibility,status:'active',
    statement:source.statement,head:row.seal,history:[row]};
  }else{
   existing.history.push(row);
   existing.head=row.seal;
   existing.statement=source.statement;
   existing.status=p.action==='retire'?'retired':'active';
  }
  out.push(p.visibility==='player-known'?
   {id:p.id,head:row.seal,action:p.action}:{private:true});
 }
 verify(c);
 return {recorded:out.length,entries:out,
  storyOnly:true,noMechanicalAgreementOrAbilityGranted:true};
}
function status(s,p={}){
 if(!own(p,['id','subject'])||p.id!==undefined&&!ident(p.id)||
    p.subject!==undefined&&!validSubject(p.subject))
  throw Error('Only a previously established story subject or fact may be inspected');
 const c=s.chatRuntime?.continuity;
 verify(c);
 const values=Object.values(c?.facts||{}).filter(f=>
  f.visibility==='player-known'&&
  (p.id===undefined||f.id===p.id)&&
  (p.subject===undefined||JSON.stringify(f.subject)===JSON.stringify(p.subject)));
 return {facts:values.map(f=>({
  id:f.id,subject:structuredClone(f.subject),category:f.category,
  statement:f.statement,status:f.status,head:f.head,
  history:f.history.map(r=>({day:r.source.day,action:r.source.action,
   statement:r.source.statement})),
  source:'scene-witnessed GM narrative, not a mechanical receipt'})),
  storyOnly:true,noSecretFactsExposed:true,
  note:'Recorded narrative context does not certify consent, ownership, ability, legal authority, money or physical effects.'};
}
module.exports={ORIGIN,hash,preflight,verify,apply,status};
