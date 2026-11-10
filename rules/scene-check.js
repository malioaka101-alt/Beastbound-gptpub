'use strict';
// Live checks are witnessed opportunities, not arbitrary DC 2 / +100
// requests. A real scene and source-dated assessment predate the one roll.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),W=require('./world'),Health=require('./unified'),Practice=require('./earned-practice');
const digest=e=>Crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex');

// This is a small GM-to-engine bridge for *existing, visible* local terrain.
// Natural-language intent is a note, NOT mechanical authority or evidence.
// The engine owns feature, actor skill, DC, one-use ID and outcome. It never
// adjudicates an unobserved obstacle, social consent, magic, or travel itself.
const LOCAL_DC=Object.freeze({settlement:10,forest:12,fen:14,hills:14,ruins:17});
const LOCAL_METHODS=Object.freeze({
 footing:{attribute:'dex',skill:'survival',minutes:15,label:'Keep footing on visible local terrain'},
 reading:{attribute:'wis',skill:'survival',minutes:10,label:'Read the visible local ground'}
});
function localSource(s,method){
 const loc=E.LOCATIONS[s.world.location],task=LOCAL_METHODS[method];
 if(!loc||!task||!Object.hasOwn(LOCAL_DC,loc.biome)||
    typeof loc.description!=='string'||loc.description.length<18)
  throw Error('Only an established local physical scene and supported mundane approach can ground this check');
 return {loc,task,dc:LOCAL_DC[loc.biome],
  source:'Original established terrain at '+loc.name+': '+loc.description,
  observed:loc.description+' Current visible weather: '+s.world.weather+'.'};
}
function prepare(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).sort().join('|')!=='intent|method'||
    typeof p.intent!=='string'||p.intent.trim().length<12||
    p.intent.trim().length>180||typeof p.method!=='string')
  throw Error('A local scene attempt accepts only a short original intention and an established mundane method, never a caller DC, skill, result or reward');
 if(s.battle||s.encounter)
  throw Error('A generic local check cannot interrupt an actual creature encounter or combat');
 const status=s.table?.combatants?.player?.status;
 if(status&&status!=='ok')
  throw Error('The character cannot attempt routine terrain work while incapacitated or recovering');
 const {loc,task,dc,source,observed}=localSource(s,p.method);
 const intent=p.intent.trim(),all=Object.values(s.table?.sceneChecks||{});
 // Rephrasing an unchanged attempt is a GM judgement, not permission to
 // roll the identical task repeatedly in this exact source context.
 if(all.some(x=>x.origin==='engine-local-scene'&&x.location===s.world.location&&
    x.method===p.method&&x.source===source&&
    x.intent?.toLowerCase()===intent.toLowerCase()))
  throw Error('This identical local attempt already has a committed check; do not roll it twice');
 if(all.some(x=>x.origin==='engine-local-scene'&&x.location===s.world.location&&
    !x.used&&x.source===source))
  throw Error('Resolve the existing pending local scene check before recording another');
 const sequence=C.int(s.sequence,'original engine event sequence',0,1000000000)+1;
 const checkId='scene_'+String(sequence).padStart(5,'0');
 if(s.table?.sceneChecks?.[checkId])throw Error('That scene-check identifier already exists');
 s.sequence=sequence;
 C.event(s,'world',observed,{
  origin:'engine-local-scene',checkId,location:s.world.location,
  biome:loc.biome,method:p.method,intent
 });
 const eventIndex=s.log.length-1,event=s.log[eventIndex];
 s.table||={};s.table.sceneChecks||={};
 s.table.sceneChecks[checkId]={
  checkId,origin:'engine-local-scene',method:p.method,intent,
  attribute:task.attribute,skill:task.skill,dc,extra:0,
  risky:false,minutes:task.minutes,label:task.label,
  location:s.world.location,biome:loc.biome,worldMinute:s.world.minutes,
  source,eventIndex,eventHash:digest(event),
  observationEvent:structuredClone(event),used:false
 };
 return {prepared:true,checkId,method:p.method,
  observed:loc.description,challenge:task.label,
  noRollYet:true,noTimeSpentYet:true,noExtraSourceClaim:true,
  scope:'Only this visible terrain; success cannot award movement, discoveries, property, supernatural abilities, or consent',
  nextAction:'Resolve the original source-bound checkId once if the GM determines genuine uncertainty'};
}
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
  archived=['engine-habitat-survey','engine-local-scene'].includes(a.origin)?a.observationEvent:null;
 if(archived&&digest(archived)!==a.eventHash)
  throw Error('The archived original habitat observation was altered');
 const scene=liveScene&&digest(liveScene)===a.eventHash?
  liveScene:archived;
 if(!['story','world','beast','progress'].includes(scene?.type)||
    scene.details?.checkId!==id||a.eventHash!==digest(scene)||
    s.table?.sceneCheckEventsUsed?.[a.eventHash])
  throw Error('A one-use, correctly bound prior scene witness must establish this challenge');
 // The source-bound GM bridge is only the original published local
 // terrain. The freeform intent cannot choose difficulty, skill, rewards,
 // NPC assent, equipment, hidden facts, hazards or a successful route.
 if(a.origin==='engine-local-scene'){
  const {loc,task,dc,source,observed}=localSource(s,a.method);
  if(a.biome!==loc.biome||a.source!==source||
     a.attribute!==task.attribute||a.skill!==task.skill||
     a.dc!==dc||a.extra!==0||a.minutes!==task.minutes||
     a.risky!==false||a.label!==task.label||
     typeof a.intent!=='string'||a.intent.trim().length<12||
     a.intent.trim().length>180||
     scene.type!=='world'||scene.text!==observed||
     scene.details?.origin!=='engine-local-scene'||
     scene.details?.location!==s.world.location||
     scene.details?.biome!==loc.biome||
     scene.details?.method!==a.method||
     scene.details?.intent!==a.intent)
   throw Error('The attempted mundane check no longer matches the original visible terrain and source-owned challenge');
 }
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
 const baseModifier=Math.floor((score-10)/2)+rank*2+a.extra;
 // A separately witnessed original body specialisation can contribute only
 // to the existing, prepared local footing task. It does not choose the DC,
 // the skill, a new roll, or an arbitrary biological power.
 const Body=require('./body-living-physiques');
 const physiology=Body.sceneSupport(s,id);
 const Origin=require('./beast-origin-integration');
 const humanOrigin=Origin.sceneSupport(s,id);
 if(physiology.bonus&&humanOrigin.bonus)
  throw Error('Two different physiological Origin/Body sources cannot stack on one original terrain challenge');
 const modifier=baseModifier+physiology.bonus+humanOrigin.bonus;
 // All provenance and actor checks precede dice, time or evidence mutation.
 const check=C.check(s,{modifier,dc:a.dc,label:a.label,risky:a.risky});
 s.table.sceneCheckEventsUsed||={};
 s.table.sceneCheckEventsUsed[a.eventHash]=id;
 a.used=true;a.checkedAtMinute=s.world.minutes;
 const tissueUse=physiology.bonus?
  Body.recordSceneSupport(s,id,check,baseModifier):null;
 const humanOriginUse=humanOrigin.bonus?
  Origin.recordUse(s,id,check,baseModifier):null;
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
 return {...check,...practice,verifiedSceneCheck:id,elapsedMinutes:a.minutes,
  ...(tissueUse?{actualPhysiologicalSupport:tissueUse}:{}),
  ...(humanOriginUse?{actualOriginLineageSupport:humanOriginUse}:{}),
  ...(a.origin==='engine-local-scene'?{scope:'visible-local-terrain-only',
   intent:a.intent,noAutomaticMovement:true,noUnknownDiscoveries:true,
   noAutomaticAgreement:true,noGrantedItems:true}: {})};
}
module.exports={perform,prepare};
