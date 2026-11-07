'use strict';
// A campaign's civil date cannot be set to a conveniently chosen season by
// an arbitrary user request. A recorded, independently witnessed dated
// register must predate the one-time absolute calendar anchor.
const Crypto=require('node:crypto'),C=require('./core'),E=require('../engine.js');
const Realm=require('../world/simulation'),W=require('./world');
const hash=e=>Crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex');
function anchor(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).length!==1||typeof p.evidenceId!=='string')
  throw Error('Absolute calendar anchoring accepts only a precommitted civil date evidenceId, not a chosen date or source');
 const id=p.evidenceId;
 if(!/^[a-z0-9][a-z0-9_-]{4,79}$/.test(id))
  throw Error('A specific witnessed civil record identifier is required');
 if(s.table?.realm?.calendarAnchor)
  throw Error('Civil date already established; it cannot be rewritten to suit a rite');
 if(s.battle||s.encounter)
  throw Error('Cannot establish a new civil date during an unresolved encounter');
 const e=s.table?.calendarEvidence?.[id];
 if(!e||e.used||e.evidenceId!==id||e.origin!=='witnessed-civil-register'||
    !Number.isInteger(e.worldMinute)||e.worldMinute!==s.world.minutes||
    e.location!==s.world.location||E.LOCATIONS[s.world.location]?.biome!=='settlement'||
    typeof e.source!=='string'||e.source.trim().length<18||
    typeof e.register!=='string'||e.register.trim().length<6||
    !e.date||typeof e.date!=='object'||Array.isArray(e.date))
  throw Error('A prior source-dated local civil register matching the current scene is required');
 if(Object.keys(e.date).some(k=>!['year','month','day'].includes(k)))
  throw Error('Civil date must come from a complete pre-recorded calendar entry');
 W.dateText(e.date); // validate Aldmere 12x30 + five Concord Days
 const index=C.int(e.eventIndex,'civil-register witness index',0,s.log.length-1);
 const scene=s.log[index];
 if(!['story','world','progress'].includes(scene?.type)||
    scene.details?.calendarEvidenceId!==id||
    e.eventHash!==hash(scene)||
    s.table?.calendarEvidenceEventsUsed?.[e.eventHash])
  throw Error('The dated civil register must match an actual earlier witnessed scene');
 const date={year:e.date.year,month:e.date.month,day:e.date.day};
 const result=Realm.anchorCalendar(s,{date,source:e.source});
 s.table.calendarEvidenceEventsUsed||={};
 s.table.calendarEvidenceEventsUsed[e.eventHash]=id;
 e.used=true;e.anchoredAtMinute=s.world.minutes;
 C.event(s,'world','A witnessed local civil register establishes the campaign calendar.',
  {calendarEvidenceId:id,absoluteDate:result.absoluteDate,register:e.register});
 return {...result,fromRecordedRegister:true};
}
module.exports={anchor};
