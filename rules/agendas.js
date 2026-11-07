'use strict';
// Small, event-sourced off-screen agendas for a text RPG. Clocks measure
// established obstacles, not fabricated prophecies or player-centric quests.
const E=require('../engine.js'),C=require('./core');
const idOK=x=>typeof x==='string'&&/^[a-z][a-z0-9_-]{2,45}$/.test(x);
function register(s,{id,owner,goal,segments=6,cadence='sixday',publiclyKnown=false,origin}={}){
 if(!idOK(id))throw Error('Agenda ID must be stable and safe');
 if(typeof owner!=='string'||owner.length<3||owner.length>90||typeof goal!=='string'||goal.length<8||goal.length>220)
   throw Error('Agenda must have an established owner and a concrete, limited goal');
 if(typeof origin!=='string'||origin.length<10)throw Error('Establish an in-world source and cause before adding an agenda');
 if(![4,6,8,12].includes(segments)||!['sixday','month'].includes(cadence))throw Error('Unsupported clock size or cadence');
 const t=s.table||(s.table={}),items=t.agendas||(t.agendas={});
 if(items[id])throw Error('Agenda already exists');
 items[id]={id,owner,goal,origin,segments,cadence,progress:0,publiclyKnown:!!publiclyKnown,resolved:false,createdAt:E.clock(s)};
 return {registered:true,id,visibility:publiclyKnown?'known':'sealed'};
}
function tick(s,sixdays,months){
 const agendas=s.table?.agendas||{},visible=[];
 for(const a of Object.values(agendas)){
  if(a.resolved)continue;
  const n=a.cadence==='sixday'?sixdays.length:months.length;
  if(!n)continue;
  const old=a.progress;a.progress=Math.min(a.segments,a.progress+n);a.resolved=a.progress>=a.segments;
  if(a.publiclyKnown){
   const note=`${a.owner}: ${a.goal} (${a.progress}/${a.segments})`;
   visible.push({id:a.id,progress:a.progress,resolved:a.resolved,notice:note});
   if(a.resolved)C.event(s,'world',`${a.owner}'s ongoing project reaches a turning point: ${a.goal}`,{agenda:a.id});
  }else{
   const sealed=(s.table.sealedAgendaEvents||=[]);
   sealed.push({id:a.id,progress:a.progress,elapsedSixdays:sixdays.length,elapsedMonths:months.length,completed:a.resolved});
   if(sealed.length>150)sealed.splice(0,sealed.length-150);
  }
 }
 return {visible};
}
function publicStatus(s){return Object.values(s.table?.agendas||{}).filter(a=>a.publiclyKnown).map(a=>({id:a.id,owner:a.owner,goal:a.goal,progress:a.progress,segments:a.segments,resolved:a.resolved}));}
function reveal(s,{id,channel,source}={}){
 const a=s.table?.agendas?.[id];if(!a)throw Error('Agenda not found');
 if(!['witnessed','gossip','guild notice','letter','public report'].includes(channel))throw Error('A plausible channel is required to learn the information');
 if(typeof source!=='string'||source.length<10)throw Error('Name a concrete route for this knowledge');
 a.publiclyKnown=true;
 C.event(s,'world',`News through ${channel}: ${a.owner} is pursuing ${a.goal}.`,{channel,source:source.slice(0,150)});
 return {known:true,id,news:`${a.owner}: ${a.goal}`,progress:a.progress,segments:a.segments};
}
module.exports={register,tick,publicStatus,reveal};