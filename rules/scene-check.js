'use strict';
// Live checks are witnessed opportunities, not arbitrary DC 2 / +100
// requests. A real scene and source-dated assessment predate the one roll.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),W=require('./world'),Health=require('./unified'),Practice=require('./earned-practice');
const digest=e=>Crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex');
function perform(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).length!==1||typeof p.checkId!=='string')
  throw Error('A witnessed scene check accepts only its established checkId');
 const id=p.checkId;
 if(!/^[a-z0-9][a-z0-9_-]{4,79}$/.test(id))
  throw Error('A valid recorded check identifier is required');
 if(s.battle||s.encounter)
  throw Error('Generic scene checks cannot bypass an unresolved beast encounter or combat round');
 const a=s.table?.sceneChecks?.[id];
 if(!a||a.used||a.checkId!==id||a.location!==s.world.location||
    !Number.isInteger(a.worldMinute)||a.worldMinute<0||a.worldMinute>s.world.minutes||
    s.world.minutes-a.worldMinute>1440||
    typeof a.source!=='string'||a.source.trim().length<18||
    typeof a.label!=='string'||a.label.trim().length<6||a.label.length>90||
    typeof a.risky!=='boolean'||
    typeof a.attribute!=='string'||typeof a.skill!=='string'||
    !Object.prototype.hasOwnProperty.call(s.player.attributes||{},a.attribute)||
    !Object.prototype.hasOwnProperty.call(s.player.skills||{},a.skill))
  throw Error('A current precommitted witnessed challenge and legitimate actor skill are required');
 C.int(a.dc,'pre-recorded challenge difficulty',5,30);
 C.int(a.extra,'recorded situational check modifier',-5,5);
 C.int(a.minutes,'actual scene-check minutes',1,1440);
 const score=C.int(s.player.attributes[a.attribute],'current character attribute',1,30);
 const rank=C.int(s.player.skills[a.skill]?.rank,'earned character skill rank',0,5);
 const index=C.int(a.eventIndex,'prior witnessed event index',0,1000000);
 const liveScene=s.log[index],
  archived=a.origin==='engine-habitat-survey'?a.observationEvent:null;
 if(archived&&digest(archived)!==a.eventHash)
  throw Error('The archived original habitat observation was altered');
 const scene=liveScene&&digest(liveScene)===a.eventHash?
  liveScene:archived;
 if(!['story','world','beast','progress'].includes(scene?.type)||
    scene.details?.checkId!==id||a.eventHash!==digest(scene)||
    s.table?.sceneCheckEventsUsed?.[a.eventHash])
  throw Error('A one-use, correctly bound prior scene witness must establish this challenge');
 // Engine-authored ecological scenes must still match their ORIGINAL
 // geographical cause and immutable local challenge, not just a copied tag.
 if(a.origin==='engine-habitat-survey'){
  const loc=E.LOCATIONS[s.world.location];
  const cfg=require('./habitat-survey').SURVEYS[loc?.biome];
  if(!cfg||!loc.spawns?.length||a.biome!==loc.biome||
     a.subject!==cfg.subject||a.attribute!=='wis'||a.skill!=='survival'||
     a.dc!==cfg.dc||a.extra!==0||a.minutes!==15||a.risky!==true||
     a.label!=='Interpret '+cfg.subject||
     a.source!=='Engine-observed '+cfg.sign.toLowerCase()+' at known '+loc.name||
     scene.type!=='world'||scene.text!==cfg.sign+' are visible at '+loc.name+'.'||
     scene.details?.observation!=='terrain-traces'||
     scene.details?.location!==s.world.location||
     scene.details?.biome!==loc.biome)
   throw Error('Engine habitat survey is not consistent with its witnessed local environment');
 }
 const modifier=Math.floor((score-10)/2)+rank*2+a.extra;
 // All provenance and actor checks precede dice, time or evidence mutation.
 const check=C.check(s,{modifier,dc:a.dc,label:a.label,risky:a.risky});
 s.table.sceneCheckEventsUsed||={};
 s.table.sceneCheckEventsUsed[a.eventHash]=id;
 a.used=true;a.checkedAtMinute=s.world.minutes;
 if(a.origin==='engine-habitat-survey'){
  // Retain an immutable identity for the ACTUAL resolved check. Research
  // fieldwork must reuse that roll rather than mint a second roll, choose a
  // favourable degree, or mistake the physical terrain cue for a discovery.
  const rollEventIndex=s.log.length-1,rollEvent=s.log[rollEventIndex];
  if(rollEvent?.type!=='roll'||rollEvent.details?.roll!==check.roll||
     rollEvent.details?.margin!==check.margin)
   throw Error('Resolved habitat check log witness is inconsistent');
  s.table.habitatSurveyFindings||={};
  s.table.habitatSurveyFindings[id]={
   checkId:id,location:s.world.location,biome:a.biome,
   observedSceneHash:a.eventHash,degree:check.degree,success:check.success,
   interpretedAtMinute:s.world.minutes,
   rollEventIndex,rollEventHash:digest(rollEvent),
   // Authentic original roll evidence is retained beyond the scene log.
   rollEvent:structuredClone(rollEvent),
   finding:check.success?'Habitat traces interpreted; no species identity independently confirmed':
    'The available trace cannot be interpreted reliably'
  };
  C.event(s,'world',check.success?
   'The visible habitat traces are interpreted; the individual creature, if any, remains unidentified.':
   'The habitat signs remain inconclusive; nothing is claimed or harvested.',
   {checkId:id,interpreted:check.success,degree:check.degree});
 }
 // Capturing the original roll witness happens above. Award ordinary
 // practice only AFTER the check, from the same capped sixday ledger used
 // by legacy skill growth. Retrying a used scene never gets this far.
 const practice=Practice.award(s,{skill:a.skill,check,risky:a.risky});
 const old=s.world.minutes;
 E.advance(s,a.minutes);
 W.finalizeTime(s,old);
 Health.sync(s,{source:'legacy'});
 return {...check,...practice,verifiedSceneCheck:id,elapsedMinutes:a.minutes};
}
module.exports={perform};
