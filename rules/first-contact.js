'use strict';
// First safe positive bridge from an authentic wild encounter into the
// neutral relationship ledger. No partner, contract, trust or Grade is minted.
const Crypto=require('node:crypto');
const E=require('../engine.js'),Bond=require('./bonds');
const digest=e=>Crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex');
const DAY=1440;
function register(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).length!==1||typeof p.beastId!=='string')
  throw Error('An observed first contact accepts only an existing beastId');
 const id=p.beastId,b=s.beasts?.[id],loc=E.LOCATIONS[s.world?.location];
 if(!b||s.encounter?.beastId!==id||s.battle||
    b.species!=='fenfox'||b.evolutionStage!=='Base'||
    E.SPECIES.fenfox?.intelligence!=='animal-cunning'||
    !loc?.spawns?.includes('fenfox')||
    b.habitatExposure?.[s.world.location]!==1||
    b.away===true||(b.location&&b.location!==s.world.location)||
    s.player.partnerIds?.includes(id)||b.owner)
  throw Error('First-contact recording currently requires an actually encountered local unevolved Lanternfen Fox');
 if(s.encounter?.threat===true||/hostile|terrified|panicked|fleeing/i.test(String(b.mood||'')))
  throw Error('Threatening or fleeing animals cannot be approached as a harmless first contact');
 if(s.table?.bondRecords?.[id]||b.sapienceAssessment)
  throw Error('This individual already has a recorded relationship or sapience observation');
 if(b.sapience!==undefined&&b.sapience!==1)
  throw Error('An existing independent sapience classification must not be overwritten');
 const proof=s.table?.wildlifeObservationEvidence?.[id];
 if(s.encounter?.observed!==true||!proof||proof.beastId!==id||
    proof.identified!==true||proof.species!=='fenfox'||
    proof.location!==s.world.location||proof.biome!==loc.biome||
    proof.source!=='Engine-witnessed '+loc.name+' encounter and real noninvasive Beastcraft check'||
    !Number.isInteger(proof.observedMinute)||proof.observedMinute<0||
    proof.observedMinute>s.world.minutes||
    s.world.minutes-proof.observedMinute>DAY||
    s.table?.wildlifeObservationAttempts?.[id]===undefined)
  throw Error('First contact needs this individual identified through a recent genuine wildlife observation');
 const observed=s.log[proof.rollEventIndex],r=observed?.details;
 if(!Number.isInteger(proof.rollEventIndex)||proof.rollEventIndex<0||
    proof.rollEventIndex>=s.log.length||
    observed?.type!=='roll'||digest(observed)!==proof.rollEventHash||
    !r||!Number.isInteger(r.roll)||r.roll<1||r.roll>20||
    r.dc!==10||r.success!==true||
    !observed.text.includes('Noninvasive observation of a present wild beast'))
  throw Error('The original species observation die and evidence must be preserved');
 // New engine-witnessed encounters include an immutable identity/source.
 // Older unsourced species strings cannot be upgraded into true encounters.
 const initial=s.log.find(x=>x.type==='encounter'&&x.details?.beastId===id);
 const details=initial?.details,site=E.LOCATIONS[s.world.location];
 if(!details||details.origin!=='engine-local-wildlife-encounter'||
    details.species!=='fenfox'||details.location!==s.world.location||
    typeof details.mood!=='string'||
    initial.text!=='You find a wild '+E.SPECIES.fenfox.name+' near '+site.name+
     '. It appears '+details.mood+'. It has not agreed to approach or partner with you.')
  throw Error('No original, individually identified live wild encounter was recorded');
 // This is a narrow **provisional species-specific** S1 classification from
 // the existing authored animal-cunning fox entry, not a generic
 // intelligence->sapience conversion, a scientific cognitive examination,
 // permission to tame or an inherited grade.
 b.sapience=1;
 b.sapienceAssessment={
  sapience:1,provisional:true,beastId:id,species:'fenfox',
  evolutionStage:'Base',worldMinute:s.world.minutes,
  source:'Pre-authored Lanternfen Fox animal-cunning ecology, identified in original witnessed local encounter'
 };
 const result=Bond.register(s,{beastId:id,start:'unfamiliar',years:0,
  personality:Array.isArray(b.personalityTags)?b.personalityTags:[]});
 return {...result,beastId:id,provisionalSapience:1,
  trustAwarded:0,contractCreated:false,
  note:'Neutral identity only. The independent animal can still refuse any subsequent interaction.'};
}
module.exports={register};
