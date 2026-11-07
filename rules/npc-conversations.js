'use strict';
// A real authored NPC can carry several differently sourced conversations,
// not just recite the same public sentence once per day. Conversation remains
// ordinary human speech; never create promises, private insight or a roll.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),W=require('./world'),Health=require('./unified'),Presence=require('../world/person-presence'),Realm=require('../world/simulation');
const MINUTES=12,FOLLOWUP=6;
const digest=e=>Crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex');
function paramsOnly(p,keys){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>!keys.includes(k))||
    keys.some(k=>!Object.hasOwn(p,k)))
  throw Error('NPC conversation accepts only its existing canonical NPC identity; no caller-authored claims or dialogue');
}
function status(s,p={}){
 paramsOnly(p,[]);
 const rec=s.table?.npcConversations?.records||[];
 if(!Array.isArray(rec))throw Error('NPC conversation history is not a valid saved ledger');
 return {knownConversations:rec.slice(-25).map(x=>({
  npcId:x.npcId,name:x.name,profession:x.profession,location:x.location,
  day:x.day,heard:x.heard,source:x.source,
  ...(x.question?{asked:x.question,answerKind:x.answerKind}:{}),
  ...(x.question?{noInventedAnswer:x.answerKind==='unverified'}:{})
 }))};
}
const tokens=x=>new Set(String(x).toLowerCase().match(/[a-z]{4,}/g)||[]);
function contextualAnswer(npc,question,s){
 const q=question.toLowerCase(),words=tokens(question),
  evidence=tokens(npc.topic+' '+npc.profession);
 const directlyRelated=[...words].some(word=>evidence.has(word)||
  [...evidence].some(k=>k.startsWith(word)&&word.length>=5));
 if(directlyRelated||/\b(?:what do you do|your work|your profession|your advice)\b/.test(q))
  return {kind:'authored-professional-topic',heard:npc.topic,
   source:'Original canon public professional statement of '+npc.name};
 if(/\b(?:route|routes|road|roads|way to|directions|where can i go)\b/.test(q)){
  const loc=E.LOCATIONS[s.world.location];
  const exits=loc.exits.map(k=>E.LOCATIONS[k]?.name).filter(Boolean);
  return {kind:'public-local-routes',
   heard:'The established paths out of '+loc.name+' lead to '+exits.join(', ')+'.',
   source:'Original known physical exits from '+loc.name};
 }
 if(/\b(?:weather|rain|mist|wind|temperature)\b/.test(q)){
  return {kind:'locally-observed-weather',
   heard:'The current local weather is '+s.world.weather+'.',
   source:'Personally observed current local weather in the active world'};
 }
 // The GM may respond naturally if the speaker could reasonably know more,
 // but this source alone cannot establish an answer or hidden information.
 return {kind:'unverified',heard:null,
  source:'No established public answer from this person for this question'};
}
function converse(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    (p.question===undefined?
     (Object.keys(p).sort().join('|')!=='npcId'):
     (Object.keys(p).sort().join('|')!=='npcId|question')))
  throw Error('NPC conversation accepts only a real local person and optional open question; no chosen reply, reward, assent or hidden knowledge');
 const id=p.npcId,npc=E.NPCS[id];
 if(typeof id!=='string'||!Object.hasOwn(E.NPCS,id)||!npc)
  throw Error('Name a real, established local character for conversation');
 if(p.question!==undefined&&
   (typeof p.question!=='string'||p.question.trim().length<5||
    p.question.trim().length>200))
  throw Error('A real follow-up question requires an actual short, meaningful topic');
 if(s.battle||s.encounter)
  throw Error('Resolve active combat or the nearby beast encounter before a settled conversation');
 if(npc.location!==s.world.location)
  throw Error(npc.name+' is not independently established as present at this location');
 // The existing person-presence authority defines the actual public
 // shift; no conversation-local blanket hours or new appointment registry.
 const visible=Presence.localStatus(s,Realm.peek(s)).people;
 if(!visible.some(x=>x.npcId===id))
  throw Error('The established professional is not independently available at this scene and time');
 if(typeof npc.topic!=='string'||npc.topic.trim().length<15||
    typeof npc.profession!=='string'||npc.profession.trim().length<5||
    typeof npc.name!=='string'||npc.name.trim().length<5||
    !E.LOCATIONS[npc.location])
  throw Error('This NPC needs a real authored public dialogue and profession before conversation');
 const day=E.day(s);
 const ledger=s.table?.npcConversations;
 if(ledger&&(!Array.isArray(ledger.records)||
   !ledger.visits||typeof ledger.visits!=='object'))
  throw Error('NPC conversation memory is not a valid saved record');
 const records=ledger?.records||[],
  greeted=records.some(x=>x.npcId===id&&x.day===day)||
   !!ledger?.visits?.[id]?.[String(day)],
  standardHeard=records.some(x=>x.npcId===id&&x.day===day&&
   x.origin==='witnessed-npc-professional-topic'&&x.heard===npc.topic);
 const question=p.question?.trim();
 // An introduction already heard is not a compulsory once-a-day silence
 // gate. Repeat it freely; genuine follow-up topics can still be asked.
 if(standardHeard&&!question)
  return {met:true,npcId:id,name:npc.name,profession:npc.profession,
   spoken:npc.topic,message:npc.name+' has already shared that public observation today. You may continue asking specific questions.',
   alreadyMetToday:true,elapsedMinutes:0,noRoll:true,noContract:true,
   noInventedPromise:true,knowledgeSource:'previously-witnessed-local-npc-topic'};
 const previous=records.find(x=>x.npcId===id&&x.day===day&&
  x.question===question&&question!==undefined);
 if(previous)
  return {met:true,npcId:id,name:npc.name,profession:npc.profession,
   spoken:previous.heard,message:previous.heard?
    npc.name+' has already given the same grounded reply to that question.':
    'The same question has no newly established reply under unchanged circumstances.',
   answerKind:previous.answerKind,alreadyAsked:true,elapsedMinutes:0,
   noRoll:true,noContract:true,noInventedPromise:true,
   knowledgeSource:previous.source};
 const result=question?contextualAnswer(npc,question,s):
  {kind:'authored-professional-topic',heard:npc.topic,
   source:'Original canon public professional statement of '+npc.name};
 const standardWitness=result.kind==='authored-professional-topic'&&
  result.heard===npc.topic&&!standardHeard;
 const duration=greeted?FOLLOWUP:MINUTES;
 const before=s.world.minutes;
 const prior=s.npcMemory?.[npc.name]??0;
 C.int(prior,'previous witnessed NPC meetings',0,1000000);
 const entries=s.npcKnowledge?.[npc.name]??[];
 if(!Array.isArray(entries))throw Error('Previous NPC conversation knowledge is not a valid ledger');
 // No "unknown question" becomes a fabricated expert answer or entitlement.
 const source='Direct in-person professional conversation with '+npc.name+
  ' at '+E.LOCATIONS[npc.location].name;
 const heard=result.heard;
 E.advance(s,duration);W.finalizeTime(s,before);Health.sync(s,{source:'legacy'});
 // The FIRST genuinely heard original professional statement retains its
 // exact legacy provenance even when introduced by a natural question. This
 // is essential evidence for optional theory and nearby-life sensing; a
 // later unrelated question cannot erase or reassign that original witness.
 C.event(s,'story',standardWitness?
  npc.name+', '+npc.profession+', says: “'+heard+'”':
  heard?npc.name+' offers source-known context: “'+heard+'”':
   'You ask '+npc.name+' a question. No verified answer to that topic is established by this encounter.',{
  ...(standardWitness?
   {origin:'engine-local-npc-conversation',npcId:id,npcName:npc.name,
    location:s.world.location,minutes:duration}:
   {origin:'source-verified-npc-followup',npcId:id,npcName:npc.name,
    location:s.world.location,minutes:duration,
    ...(question?{question,answerKind:result.kind}:{}),
    ...(heard?{answerSource:result.source}:{noAnsweredClaim:true})})
 });
 const event=s.log.at(-1);
 const record={npcId:id,name:npc.name,profession:npc.profession,
  location:s.world.location,day,worldMinute:s.world.minutes,
  heard,source,origin:standardWitness?
   'witnessed-npc-professional-topic':'witnessed-npc-source-grounded-question',
  eventHash:digest(event),...(question?{question,answerKind:result.kind,
   answerSource:result.source}:{} )};
 s.table||={};s.table.npcConversations||={visits:{},records:[]};
 const saved=s.table.npcConversations;saved.visits||={};saved.records||=[];
 if(!Array.isArray(saved.records))throw Error('NPC memory is not a valid list');
 // Legacy visits prove the actual authored topic, NOT that an unrelated
 // question was asked. Never create even an empty visit map for a wholly
 // unverified exchange; only the separately witnessed record is retained.
 if(standardWitness){
  saved.visits[id]||={};
  if(!saved.visits[id][String(day)])
   saved.visits[id][String(day)]=record.eventHash;
 }
 saved.records.push(record);
 if(!greeted){
  s.npcMemory||={};s.npcMemory[npc.name]=prior+1;
 }
 s.npcKnowledge||={};s.npcKnowledge[npc.name]=entries;
 if(heard&&!entries.some(x=>x.fact===heard&&x.source===source))
  entries.push({fact:heard,source,day,eventHash:record.eventHash});
 return {met:true,npcId:id,name:npc.name,profession:npc.profession,
  spoken:heard,answerKind:result.kind,
  message:heard?npc.name+' shares source-backed information: “'+heard+'”':
   'You ask '+npc.name+' about '+question+'. Their available public facts do not establish an answer; their actual response needs contextual GM portrayal, not invented lore.',
  elapsedMinutes:duration,meetingDay:day,
  noRoll:true,noContract:true,noInventedPromise:true,
  knowledgeSource:result.source};
}
module.exports={converse,status};
