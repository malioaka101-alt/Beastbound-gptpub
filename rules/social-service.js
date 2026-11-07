'use strict';
// Earned social notice is based on real field practice rather than paid noble
// access, an invented family heir or a player-selected favourable response.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),W=require('./world'),H=require('./unified'),
 Houses=require('../world/social-houses'),Social=require('./social-fabric'),
 Habitat=require('./habitat-survey');
const digest=e=>Crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex');
const PURPOSE='field_report',TIME=12,MAX_AGE=30*1440;
const HABITATS=Object.freeze({fenwake:['forest','fen'],
 reedcouncil:['fen'],reedward:['fen']});
function only(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).length!==2||
    typeof p.houseId!=='string'||typeof p.checkId!=='string')
  throw Error('Civic field-report submission accepts only an actual local houseId and earlier witnessed checkId');
}
function proof(s,checkId,houseId){
 const a=s.table?.sceneChecks?.[checkId],f=s.table?.habitatSurveyFindings?.[checkId];
 if(!a||!f||!a.used||a.origin!=='engine-habitat-survey'||
   a.checkId!==checkId||f.checkId!==checkId||
   a.location!==f.location||!HABITATS[houseId]?.includes(a.location)||
   !Number.isInteger(a.worldMinute)||a.worldMinute<0||
   s.world.minutes-a.worldMinute>MAX_AGE||
   !Number.isInteger(a.eventIndex)||a.eventIndex<0||
   !Number.isInteger(f.rollEventIndex)||f.rollEventIndex<=a.eventIndex||
   f.rollEventIndex>=s.log.length||a.eventIndex>=s.log.length||
   !f.success||f.observedSceneHash!==a.eventHash||
   f.interpretedAtMinute!==a.checkedAtMinute||
   !Number.isInteger(a.checkedAtMinute)||a.checkedAtMinute<a.worldMinute||
   !Number.isInteger(a.dc)||!['fen','forest'].includes(a.location)||
   a.attribute!=='wis'||a.skill!=='survival'||a.extra!==0||a.minutes!==15||
   a.risky!==true||!s.table?.sceneCheckEventsUsed||
   s.table.sceneCheckEventsUsed[a.eventHash]!==checkId)
  throw Error('A real successful relevant habitat field survey with its original terrain and roll evidence is required');
 const loc=E.LOCATIONS[a.location],cfg=Habitat.SURVEYS[loc?.biome],
  ev=s.log[a.eventIndex],roll=s.log[f.rollEventIndex];
 if(!cfg||!loc.spawns?.length||a.biome!==loc.biome||
   a.subject!==cfg.subject||a.dc!==cfg.dc||
   a.label!=='Interpret '+cfg.subject||
   a.source!=='Engine-observed '+cfg.sign.toLowerCase()+' at known '+loc.name||
   ev?.type!=='world'||ev.text!==cfg.sign+' are visible at '+loc.name+'.'||
   ev.details?.checkId!==checkId||ev.details?.location!==a.location||
   ev.details?.biome!==loc.biome||ev.details?.observation!=='terrain-traces'||
   digest(ev)!==a.eventHash||
   roll?.type!=='roll'||roll.details?.success!==true||
   roll.details?.dc!==cfg.dc||
   roll.text?.includes(a.label)!==true||
   roll.details?.degree!==f.degree||
   digest(roll)!==f.rollEventHash)
  throw Error('The named environmental fieldwork cannot be reconstructed from genuine unaltered observations and dice');
 return {a,f,roll,rollHash:digest(roll)};
}
function submit(s,p={}){
 only(p);
 const h=Houses.byId[p.houseId];
 if(!h||!HABITATS[h.id]||h.polity!=='reedmarch')
  throw Error('Only the named local households with a genuinely relevant published ecological duty can receive this kind of field report');
 Social.civic(s,TIME);
 const known=Social.lastWitness(s,h),old=s.table?.socialFabric?.letters||[];
 if(old.some(x=>x.houseId===h.id&&
      s.world.minutes-x.postedAtMinute<30*1440))
  throw Error('Allow the family to consider one request before sending another within thirty in-world days');
 if(s.table?.socialFabric?.reportsUsed?.[p.checkId])
  throw Error('This actual field survey has already been offered to a household; repeatable reports are not a reputation farm');
 const {a,f,rollHash}=proof(s,p.checkId,h.id);
 const start=s.world.minutes,id='house_field_'+h.id+'_'+start;
 E.advance(s,TIME);W.finalizeTime(s,start);H.sync(s,{source:'legacy'});
 C.event(s,'story','A genuine successful '+E.LOCATIONS[a.location].name+
  ' habitat field report is publicly submitted for '+h.name+"'s civic review.",{
    origin:'registered-source-witnessed-family-fieldwork',houseId:h.id,
    letterId:id,checkId:p.checkId,witnessedCharterHash:known.eventHash,
    originalTerrainHash:a.eventHash,originalCheckHash:rollHash,
    habitat:a.location,degree:f.degree,minutes:TIME
 });
 const ev=s.log.at(-1),ledger=Social.ledger(s);
 ledger.reportsUsed||={};
 ledger.reportsUsed[p.checkId]=id;
 ledger.letters.push({
  letterId:id,houseId:h.id,purpose:PURPOSE,
  state:'sent',postedAtMinute:start,
  nextReplyDay:Math.floor(start/1440)+6,
  source:'Witnessed noninvasive field report submitted to a chartered local household',
  eventHash:digest(ev),charterHash:known.eventHash,
  evidenceCheckId:p.checkId,evidenceRollHash:rollHash,
  evidenceSceneHash:a.eventHash,habitat:a.location,degree:f.degree
 });
 return {submitted:true,houseId:h.id,letterId:id,
  evidenceCheckId:p.checkId,habitat:a.location,
  minutes:TIME,reviewPending:true,recognitionNotGuaranteed:true,
  socialStandingGained:0,rankGranted:false,tuitionOrPayment:0};
}
module.exports={submit,proof};
