'use strict';
// Evolution observation actions may use only previously witnessed scenes.
// The underlying Progress formulae are reference math, not permission to
// choose free Maturity years, recognition difficulty or Soul Sight bonuses.
const Crypto=require('node:crypto'),E=require('../engine.js');
const C=require('./core'),P=require('./progress'),W=require('./world'),Branch=require('./evolution-branch-web');
const digest=entry=>Crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex');
function current(s,key){
 if(typeof key!=='string')throw Error('Known current evolution branch key is required');
 const r=P.get(s,key),b=s.beasts?.[r.beastId];
 if(!b||!r.originAssessment||r.blocked||r.evolved||
    r.originAssessment.species!==b.species||
    r.originAssessment.evolutionStage!==b.evolutionStage)
  throw Error('Evolution observation requires a source-established, active branch in the current beast form');
 if(s.battle)throw Error('An evolution observation cannot be adjudicated during combat');
 if(b.away===true||(b.location&&b.location!==s.world.location)||
   (s.encounter?.beastId!==r.beastId&&!s.player.partnerIds?.includes(r.beastId)))
  throw Error('The observed beast must really be present during the encounter');
 return {r,b};
}
function witnessed(s,record,b,eventIndex){
 if(!record||record.used||record.beastId!==b.id||
    record.species!==b.species||record.evolutionStage!==b.evolutionStage||
    !Number.isInteger(record.worldMinute)||record.worldMinute<0||
    record.worldMinute>s.world.minutes||
    typeof record.source!=='string'||record.source.trim().length<18||
    !Number.isInteger(record.eventIndex)||record.eventIndex!==eventIndex)
  throw Error('A prior source-dated, individual-beast evolution scene assessment is required');
 C.int(eventIndex,'actual witnessed scene index',0,s.log.length-1);
 const event=s.log[eventIndex];
 if(record.eventHash!==digest(event)||
    !(event.details?.beastId===b.id||event.text.includes(b.name)))
  throw Error('Recorded evolutionary witness does not match the actual earlier beast scene');
 return {event,hash:record.eventHash};
}
function crucible(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>!['key','eventIndex'].includes(k)))
  throw Error('Crucible years, story source and success cannot be supplied by the caller');
 const {r,b}=current(s,p.key);
 const record=b.crucibleAssessments?.[r.branchId]?.[String(p.eventIndex)];
 const seen=witnessed(s,record,b,p.eventIndex);
 if(record.branchId!==r.branchId||!['combat','story','progress','world'].includes(seen.event.type))
  throw Error('A significant branch-specific Crucible must be authenticated before awarding Maturity');
 C.int(record.years,'independently adjudicated Crucible years',1,3);
 const result=P.crucible(s,r,{eventIndex:p.eventIndex,years:record.years,source:record.source});
 record.used=true;
 record.usedAtMinute=s.world.minutes;
 return {...result,witnessed:true,eventIndex:p.eventIndex};
}
function soulSight(s){
 const x=s.player.soulSight;
 return !!(x&&x.unlocked===true&&typeof x.source==='string'&&
   x.source.trim().length>=18&&Number.isInteger(x.worldMinute)&&
   x.worldMinute>=0&&x.worldMinute<=s.world.minutes);
}
function sync(s,b){
 const v=b.syncStage,rec=s.table?.bondRecords?.[b.id];
 return Number.isInteger(v)&&v>=0&&v<=10&&
   Number.isInteger(rec?.syncStage)&&rec.syncStage===v&&
   s.player.partnerIds?.includes(b.id)?v:0;
}
function signs(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).some(k=>k!=='key'))
  throw Error('Recognising evolution signs accepts only the established branch key, not a chosen roll or secret source');
 const {r,b}=current(s,p.key);
 const proof=b.evolutionSignObservations?.[r.branchId];
 if(!proof||proof.branchId!==r.branchId||
    proof.location!==s.world.location||
    s.world.minutes-proof.worldMinute>1440)
  throw Error('A recent source-recorded observation of physical evolution signs is required');
 const {hash}=witnessed(s,proof,b,proof.eventIndex);
 const duplicateKey=b.id+':'+hash;
 if(s.table?.evolutionSignScenesUsed?.[duplicateKey])
  throw Error('This witnessed scene already supported one evolution-sign interpretation');
 C.int(proof.dc,'pre-established sign recognition difficulty',12,18);
 C.int(proof.distance,'witnessed distance in metres',0,100000);
 const wis=C.int(s.player.attributes?.wis,'recorded Wisdom score',1,30);
 const rank=Math.max(
  C.int(s.player.skills?.beastlore?.rank??0,'earned Beastlore rank',0,5),
  C.int(s.player.skills?.faithCosmology?.rank??0,'earned Faith and Cosmology rank',0,5));
 const soulmate=soulSight(s)&&proof.distance<=10;
 const stage=sync(s,b);
 const modifier=Math.floor((wis-10)/2)+2*rank+
    (soulmate?1:0)+(stage>=6?2:0);
 const check=C.check(s,{modifier,dc:proof.dc,label:'Recognise witnessed evolution signs around '+b.name});
 const ready=P.status(r).ready;
 // A real successful interpretation reveals an already authored possible
 // branch; no new form, bonus or second roll is invented by the discovery.
 if(check.success)Branch.observed(s,r,proof,hash);
 const result={recognised:check.success,degree:check.degree,
  partnerFeltWindow:stage>=3&&ready,
  reading:check.success?(stage>=6?
   'A forming pattern briefly comes into focus':
   'The visible signs are consistent with an approaching transformation'):
   'The signs cannot yet be identified',
  noHiddenRequirementsDisclosed:true,sceneIndex:proof.eventIndex,
  elapsedMinutes:10};
 s.table||={};s.table.evolutionSignScenesUsed||={};
 s.table.evolutionSignScenesUsed[duplicateKey]=r.branchId;
 proof.used=true;proof.checkedAtMinute=s.world.minutes;
 const old=s.world.minutes;
 E.advance(s,10);W.finalizeTime(s,old);
 C.event(s,'beast','The witnessed evolutionary signs around '+b.name+' are examined.',
  {beastId:b.id,recognised:check.success,source:'previously witnessed sign'});
 return result;
}
module.exports={crucible,signs};
