'use strict';
// Disposable test fixtures only. This deliberately does NOT exist as a
// playable authoring route; a GM must independently establish a scene.
const Crypto=require('node:crypto'),C=require('../rules/core');
function record(s,checkId,{attribute='wis',skill='survival',dc=14,
 minutes=15,label='Survey the witnessed reed bank',extra=0,risky=true}={}){
 C.event(s,'story','An independent obstacle was observed before the player attempted '+label+'.',{checkId});
 const idx=s.log.length-1,e=s.log[idx];
 s.table||={};s.table.sceneChecks||={};
 s.table.sceneChecks[checkId]={
  checkId,attribute,skill,dc,extra,minutes,label,risky,
  location:s.world.location,worldMinute:s.world.minutes,eventIndex:idx,
  eventHash:Crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex'),
  source:'Previously observed independently established hazard and opportunity at the actual location'
 };
 return s.table.sceneChecks[checkId];
}
module.exports={record};
