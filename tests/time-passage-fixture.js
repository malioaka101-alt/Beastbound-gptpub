'use strict';
const C=require('../rules/core'),Crypto=require('node:crypto');
function record(s,passageId,days){
 C.event(s,'story','A source-approved settlement interval and supplies were verified before this downtime.',
  {passageId});
 const eventIndex=s.log.length-1,event=s.log[eventIndex];
 s.table||={};s.table.timePassages||={};
 s.table.timePassages[passageId]={
  passageId,kind:'provisioned-local-downtime',location:s.world.location,
  worldMinute:s.world.minutes,days,rationItem:'clean_rations',dailyRations:1,
  source:'Independent town registrar verified this exact off-scene interval and no active obligations',
  purpose:'Rest and stay in the same secure settlement without new training',
  eventIndex,eventHash:Crypto.createHash('sha256').update(JSON.stringify(event)).digest('hex')
 };
 return s.table.timePassages[passageId];
}
module.exports={record};
