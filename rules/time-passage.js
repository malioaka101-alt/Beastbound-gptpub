'use strict';
// A private chat cannot leap 10,000 days just by asking the world clock to
// advance. Only source-witnessed, supplied, safe local downtime is playable.
const Crypto=require('node:crypto'),E=require('../engine.js'),C=require('./core');
const W=require('./world'),Health=require('./unified');
const digest=e=>Crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex');
function passage(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).length!==1||typeof p.passageId!=='string')
  throw Error('World time passage accepts only a precommitted passageId, not requested days');
 const id=p.passageId;
 if(!/^[a-z0-9][a-z0-9_-]{4,79}$/.test(id))
  throw Error('A previously witnessed downtime identifier is required');
 if(s.battle||s.encounter)
  throw Error('Unresolved combat or beast encounters cannot be skipped as uneventful downtime');
 const origin=s.table?.timePassages?.[id],here=E.LOCATIONS[s.world.location];
 if(!origin||origin.used||origin.passageId!==id||
    !Number.isInteger(origin.worldMinute)||origin.worldMinute!==s.world.minutes||
    origin.location!==s.world.location||here?.biome!=='settlement'||
    origin.kind!=='provisioned-local-downtime'||
    typeof origin.source!=='string'||origin.source.trim().length<18||
    typeof origin.purpose!=='string'||origin.purpose.trim().length<18)
  throw Error('Time passage requires previously recorded, safe local downtime at this actual clock and place');
 const days=C.int(origin.days,'approved actual downtime days',1,6);
 if(origin.rationItem!=='clean_rations'||origin.dailyRations!==1)
  throw Error('Provisional downtime requires actual recorded food provisioning');
 if((s.player.partnerIds||[]).length)
  throw Error('Downtime with active beast partners requires species-appropriate daily care and cannot be silently skipped');
 if(s.player.health!==s.player.maxHealth||
    s.table?.combatants?.player?.status&&s.table.combatants.player.status!=='ok'||
    (s.table?.combatants?.player?.wounds||[]).some(n=>n>0))
  throw Error('An injured or incapacitated player needs witnessed care rather than uneventful time skipping');
 const available=s.player.inventory?.clean_rations;
 if(!Number.isInteger(available)||available<days)
  throw Error('Insufficient actual clean rations for the full planned downtime');
 const index=C.int(origin.eventIndex,'recorded downtime observation index',0,s.log.length-1);
 const witness=s.log[index];
 if(!['story','world','progress'].includes(witness?.type)||
    witness.details?.passageId!==id||
    origin.eventHash!==digest(witness)||
    s.table?.timePassageEventsUsed?.[origin.eventHash])
  throw Error('A unique previously witnessed local downtime plan is required');
 // Validate ALL prerequisites before resources, clock, agenda state or RNG.
 s.player.inventory.clean_rations-=days;
 if(s.player.inventory.clean_rations===0)delete s.player.inventory.clean_rations;
 s.table.timePassageEventsUsed||={};
 s.table.timePassageEventsUsed[origin.eventHash]=id;
 origin.used=true;origin.usedAtMinute=s.world.minutes;
 const result=W.advance(s,days);
 Health.sync(s,{source:'legacy'});
 C.event(s,'story','The documented local downtime passes without awarding unearned training, skills or income.',
  {passageId:id,days,rationsConsumed:days,location:s.world.location});
 return {...result,precommitted:true,rationsConsumed:days,
  unchangedLocation:s.world.location,source:'prior witnessed local downtime'};
}
module.exports={passage};
