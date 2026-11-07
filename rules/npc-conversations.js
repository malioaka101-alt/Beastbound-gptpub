'use strict';
// Small canonical, witness-backed first NPC conversation path.
// The player may choose whom to address, not retroactively choose what the
// person said, promise, reveal or privately knows.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),W=require('./world'),Health=require('./unified');
const MINUTES=12,OPEN=8*60,CLOSE=18*60;
const digest=e=>Crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex');
// Read the existing authored NPC roster at request time: newly established
// individuals do not require maintaining a second frozen conversation list.
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
 // Do not enumerate unseen persons, private goals, agendas, or player-unknown facts.
 return {knownConversations:rec.slice(-25).map(x=>({
  npcId:x.npcId,name:x.name,profession:x.profession,location:x.location,
  day:x.day,heard:x.heard,source:x.source
 }))};
}
function converse(s,p={}){
 paramsOnly(p,['npcId']);
 const id=p.npcId,npc=E.NPCS[id];
 if(typeof id!=='string'||!Object.hasOwn(E.NPCS,id)||!npc)
  throw Error('Name a real, established local character for conversation');
 if(s.battle||s.encounter)
  throw Error('Resolve active combat or the nearby beast encounter before a settled conversation');
 if(npc.location!==s.world.location)
  throw Error(npc.name+' is not independently established as present at this location');
 const minute=s.world.minutes%1440;
 if(minute<OPEN||minute+MINUTES>CLOSE)
  throw Error('The established professional is not available outside the local daytime conversation window');
 const day=E.day(s);
 if(s.table?.npcConversations?.visits?.[id]?.[String(day)])
  throw Error('This conversation has already been witnessed today; continue freeform dialogue without minting a second meeting');
 if(typeof npc.topic!=='string'||npc.topic.trim().length<15||
    typeof npc.profession!=='string'||npc.profession.trim().length<5||
    typeof npc.name!=='string'||npc.name.trim().length<5||
    !E.LOCATIONS[npc.location])
  throw Error('This NPC needs a real authored public dialogue and profession before conversation');
 const prior=s.npcMemory?.[npc.name]??0;
 C.int(prior,'previous witnessed NPC meetings',0,1000000);
 const entries=s.npcKnowledge?.[npc.name]??[];
 if(!Array.isArray(entries))throw Error('Previous NPC conversation knowledge is not a valid ledger');
 // The NPC offers exactly their pre-authored public professional observation.
 // Their private goal, hidden affinity, off-screen events and commitments remain sealed.
 const heard=npc.topic;
 const before=s.world.minutes;
 E.advance(s,MINUTES);
 W.finalizeTime(s,before);
 Health.sync(s,{source:'legacy'});
 const source='Direct in-person professional conversation with '+npc.name+
  ' at '+E.LOCATIONS[npc.location].name;
 C.event(s,'story',npc.name+', '+npc.profession+', says: “'+heard+'”',{
  origin:'engine-local-npc-conversation',npcId:id,npcName:npc.name,
  location:s.world.location,minutes:MINUTES
 });
 const event=s.log[s.log.length-1];
 const record={npcId:id,name:npc.name,profession:npc.profession,
  location:s.world.location,day,worldMinute:s.world.minutes,
  heard,source,origin:'witnessed-npc-professional-topic',
  eventHash:digest(event)};
 s.table||={};s.table.npcConversations||={visits:{},records:[]};
 const ledger=s.table.npcConversations;
 ledger.visits||={};ledger.records||=[];
 if(!Array.isArray(ledger.records))throw Error('NPC memory is not a valid list');
 ledger.visits[id]||={};
 ledger.visits[id][String(day)]=record.eventHash;
 ledger.records.push(record);
 s.npcMemory||={};s.npcMemory[npc.name]=prior+1;
 s.npcKnowledge||={};s.npcKnowledge[npc.name]=entries;
 if(!entries.some(x=>x.fact===heard&&x.source===source))
  entries.push({fact:heard,source,day,eventHash:record.eventHash});
 return {met:true,npcId:id,name:npc.name,profession:npc.profession,
  spoken:heard,message:npc.name+' says: “'+heard+'”',
  elapsedMinutes:MINUTES,meetingDay:day,
  noRoll:true,noContract:true,noInventedPromise:true,
  knowledgeSource:'direct-witnessed-canonical-npc-dialogue'};
}
module.exports={converse,status};
