'use strict';
// Named background professionals can now have independently scheduled,
// physically verifiable local duties. A public professional listing never
// itself means somebody is available for a personal conversation.
const Crypto=require('node:crypto'),Atlas=require('./atlas'),
 Engine=require('../engine.js'),Emergent=require('./emergent-people');
const SOURCE='Independent local duty itinerary of an established named professional';
const hash=v=>Crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
function seed(w){
 return {version:1,rngState:((w.worldSeed^0x3bf416a5)>>>0)||0x12345678,
  period:-1,roster:{},history:[]};
}
function ensure(w){
 if(w.personPresence===undefined)w.personPresence=seed(w);
 const t=w.personPresence;
 if(t.version!==1||!Number.isInteger(t.period)||
  !t.roster||typeof t.roster!=='object'||!Array.isArray(t.history))
  throw Error('A persistent individual duty roster is required');
 return t;
}
function draw(t){
 let x=t.rngState>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 t.rngState=(x>>>0)||0x12345678;
 return t.rngState/4294967296;
}
function locations(polity){
 return Object.keys(Engine.LOCATIONS).filter(loc=>
  Atlas.R[Atlas.LOCATION_REGION[loc]]?.polity===polity);
}
function plan(w,day){
 const t=ensure(w),period=Math.floor(day/30);
 if(t.period>=period)return t;
 if(!Number.isInteger(day)||day<0)throw Error('A genuine world day is necessary for person scheduling');
 const next={};
 for(const n of Object.values(w.notables||{})){
  const ins=w.institutions?.[n.institution],options=locations(n.polity);
  // A named person can only be placed at a real supported local game site
  // within their own polity, and only with a functioning employer.
  if(!n.id||!n.name||!options.length||!ins||
   ins.status!=='active'||n.injuryMonths>0)continue;
  // The scheduling decision belongs to an independent persistent world RNG.
  // Some professionals genuinely have no public-facing duty this period.
  if(draw(t)<.22)continue;
  let sites=options;
  if(n.profession==='civic representative'&&options.includes('crossing'))
   sites=['crossing'];
  const place=sites[Math.floor(draw(t)*sites.length)];
  const fromDay=day+1+Math.floor(draw(t)*8),
   throughDay=fromDay+2+Math.floor(draw(t)*5);
  const witness={source:SOURCE,actorId:'notable:'+n.id,
   npcId:'notable:'+n.id,name:n.name,profession:n.profession,
   polity:n.polity,institution:n.institution,
   location:place,scheduledAtDay:day,fromDay,throughDay};
  next[n.id]={...witness,hash:hash(witness)};
 }
 t.period=period;t.roster=next;
 t.history.push({period,scheduledDay:day,
  actualNamedAssignments:Object.keys(next).length,
  witnessHashes:Object.values(next).map(x=>x.hash)});
 if(t.history.length>24)t.history.shift();
 return t;
}
function verified(w,shift){
 if(!shift||shift.source!==SOURCE)return false;
 const n=w.notables?.[shift.npcId?.slice(8)];
 if(!n||shift.npcId!=='notable:'+n.id||
   shift.actorId!==shift.npcId||shift.name!==n.name||
   shift.polity!==n.polity||shift.profession!==n.profession||
   shift.institution!==n.institution||
   !Engine.LOCATIONS[shift.location]||
   Atlas.R[Atlas.LOCATION_REGION[shift.location]]?.polity!==n.polity||
   !Number.isInteger(shift.scheduledAtDay)||shift.scheduledAtDay<0||
   !Number.isInteger(shift.fromDay)||!Number.isInteger(shift.throughDay)||
   shift.fromDay<=shift.scheduledAtDay||
   shift.throughDay<shift.fromDay||shift.throughDay-shift.fromDay>6)return false;
 const {hash:seal,...body}=shift;
 return hash(body)===seal;
}
function identity(w,id){
 if(typeof id!=='string')return null;
 if(Object.hasOwn(Engine.NPCS,id)){
  const n=Engine.NPCS[id];
  return {id,name:n.name,actorId:'npc:'+id,
   location:n.location,profession:n.profession,
   goal:n.goal,topic:n.topic,source:'engine-local-npc'};
 }
 if(id.startsWith('emergent:')){
  const p=w.emergentPeople?.people?.[id.slice('emergent:'.length)];
  if(!Emergent.verify(w,p)||p.actorId!==id)return null;
  return {id,name:p.name,actorId:id,profession:p.profession,
   goal:p.purpose,topic:p.profession,polity:p.polity,
   source:'independently-generated-lived-person'};
 }
 if(!id.startsWith('notable:'))return null;
 const n=w.notables?.[id.slice(8)];
 if(!n||id!=='notable:'+n.id)return null;
 return {id,name:n.name,actorId:id,profession:n.profession,
  goal:n.life?.goal||n.profession,topic:n.mentoring||n.profession,
  polity:n.polity,institution:n.institution,
  source:'independent-professional-roster'};
}
function resolve(w,id,location,day){
 const n=identity(w,id);
 if(!n||!Number.isInteger(day)||!Engine.LOCATIONS[location])return null;
 if(n.source==='engine-local-npc')
  return n.location===location?{...n,presence:null}:null;
 if(n.source==='independently-generated-lived-person'){
  const shift=Emergent.presence(w,id,location,day);
  return shift?{...n,location,presence:shift}:null;
 }
 const shift=w.personPresence?.roster?.[id.slice(8)];
 if(!verified(w,shift)||shift.location!==location||
  day<shift.fromDay||day>shift.throughDay||
  w.institutions?.[n.institution]?.status!=='active')return null;
 return {...n,location,presence:structuredClone(shift)};
}
function proof(w,id,location,day,shift){
 if(id in Engine.NPCS)return !shift&&
  Engine.NPCS[id].location===location;
 if(id?.startsWith('emergent:'))return !!(shift&&
  Emergent.presence(w,id,location,day)?.hash===shift.hash);
 return !!(shift&&verified(w,shift)&&shift.npcId===id&&
  shift.location===location&&
  shift.fromDay<=day&&day<=shift.throughDay);
}
function localStatus(s,w){
 const day=Math.floor(s.world.minutes/1440),location=s.world.location;
 // The already-established local conversation shift for authored daytime
 // professionals is 08:00–18:00. A map pin is not proof that a registrar,
 // anatomist or physician is physically available at midnight.
 const minute=s.world.minutes%1440,ordinaryDayShift=minute>=8*60&&minute<18*60;
 const native=ordinaryDayShift?Object.keys(Engine.NPCS).filter(id=>
  Engine.NPCS[id].location===location):[];
 const visiting=Object.keys(w.personPresence?.roster||{}).map(id=>
  'notable:'+id).filter(id=>resolve(w,id,location,day));
 const created=Object.values(w.emergentPeople?.people||{})
  .map(p=>p.actorId).filter(id=>resolve(w,id,location,day));
 return {location,day:day+1,
  people:[...native,...visiting,...created].map(id=>{
   const n=resolve(w,id,location,day);
   return {npcId:id,name:n.name,profession:n.profession,
    actuallyPresent:true,meetingIsNotAssent:true};
  }),
  note:'Only people established at this actual scene appear. Public fame, a family name or a remote professional directory does not establish physical presence or permission to join.'};
}
module.exports={SOURCE,EMERGENT_SOURCE:Emergent.SHIFT,hash,seed,ensure,plan,verified,identity,resolve,proof,localStatus};
