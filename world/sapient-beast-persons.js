'use strict';
// Sapient beasts are independent PERSONS. This adapter attaches only to an
// actually encountered, authored sapient individual, and uses the reusable
// earned-evidence reducer. No invented settlements, population census,
// human-style guild ranks, forced speech, contracts, ownership or spells.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 Atlas=require('./atlas'),Practice=require('./earned-individual-practice'),
 Agency=require('../rules/beast-agency'),C=require('../rules/core');
const ORIGIN='genuine-encounter-sapient-person-v1',
 ACTIVITY='autonomous-sapient-person-activity-v1',
 DAY=1440,HISTORY=24;
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const clamp=(v,lo=0,hi=100)=>Math.min(hi,Math.max(lo,v));
const noParams=p=>{
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Sapient persons choose their own actions; no caller-provided result, attitude, ability, location or training is accepted');
};
function sapient(b){
 return !!E.SPECIES[b?.species]&&
  (E.SPECIES[b.species].intelligence==='sapient'||
   Number.isInteger(b.sapience)&&b.sapience>=3);
}
function original(s){
 const b=s.beasts?.[s.encounter?.beastId],loc=E.LOCATIONS[s.world?.location];
 if(!b||!sapient(b)||!loc||s.battle||s.encounter?.threat||
  b.owner||s.player.partnerIds?.includes(b.id)||
  b.relationship!=='wild'||b.away===true||
  (b.location&&b.location!==s.world.location)||
  !loc.spawns.includes(b.species)||
  b.habitatExposure?.[s.world.location]!==1||
  /hostile|panicked|terrified|fleeing|desperate|agitated/i.test(String(b.mood))||
  !Number.isFinite(b.condition)||b.condition<55||
  !b.needs||!Number.isFinite(b.needs.hunger)||
  !Number.isFinite(b.needs.fatigue)||
  b.needs.hunger>75||b.needs.fatigue>75)
  throw Error('A peaceful, healthy, genuinely present sapient person must freely be able to respond');
 const e=(s.log||[]).filter(x=>
  x.type==='encounter'&&
  x.details?.origin==='engine-local-wildlife-encounter'&&
  x.details?.beastId===b.id&&x.details.species===b.species&&
  x.details.location===s.world.location&&
  x.details.mood===b.mood&&
  x.details.distanceMetres===s.encounter.distanceMetres&&
  x.text===`You find a wild ${E.SPECIES[b.species].name} near ${loc.name}. It appears ${b.mood}. It has not agreed to approach or partner with you.`);
 const ev=e.at(-1);
 if(!ev)throw Error('A sapient being first contact must follow an actual witnessed engine encounter');
 return {b,ev,location:s.world.location};
}
function aptitude(b){
 const p=b.potential;
 if(!p||!['growth','intelligence','adaptability'].every(k=>
  Number.isFinite(p[k])&&p[k]>=0&&p[k]<=100))
  throw Error('The sapient individual lacks verified physical and cognitive potential');
 return {'field-judgement':Math.round(p.intelligence*.65+p.adaptability*.35),
  'resource-care':Math.round(p.adaptability*.65+p.growth*.35)};
}
function provenance(b,ev,minute){
 return {origin:ORIGIN,beastId:b.id,species:b.species,
  encounterEvent:structuredClone(ev),encounterHash:hash(ev),
  encounteredAtMinute:minute,noAssumedProfession:true,noAssumedLanguage:true};
}
function originProof(b,source){
 const ev=source?.encounterEvent,d=ev?.details,spec=E.SPECIES[b?.species],
  loc=E.LOCATIONS[d?.location];
 return sapient(b)&&source.origin===ORIGIN&&source.beastId===b.id&&
  source.species===b.species&&hash(ev)===source.encounterHash&&
  ev?.type==='encounter'&&d?.origin==='engine-local-wildlife-encounter'&&
  d.beastId===b.id&&d.species===b.species&&loc?.spawns?.includes(b.species)&&
  Number.isInteger(d.distanceMetres)&&d.distanceMetres>=2&&
  d.distanceMetres<=17&&
  ev.text===`You find a wild ${spec.name} near ${loc.name}. It appears ${d.mood}. It has not agreed to approach or partner with you.`&&
  Number.isInteger(source.encounteredAtMinute)&&source.encounteredAtMinute>=0;
}
function make(s,b,ev){
 const src=provenance(b,ev,s.world.minutes),sourceHash=hash(src),
  bytes=Crypto.createHash('sha256').update(
   String(s.seed)+'|'+b.id+'|'+sourceHash+'|sapient-person-v1').digest(),
  seed=bytes.readUInt32BE(0)||0x91e10da5;
 return {version:1,origin:ORIGIN,source:src,sourceHash,
  rngState:seed,lastTickDay:Math.floor(s.world.minutes/DAY),
  triedEncounters:[],history:[],
  practice:Practice.make('sapient:'+b.id,sourceHash,aptitude(b)),
  noImposedProfession:true,noInferredSociety:true};
}
function verify(b){
 const l=b?.sapientLife;
 if(l===undefined)return true;
 if(!l||l.version!==1||l.origin!==ORIGIN||
  l.sourceHash!==hash(l.source)||!originProof(b,l.source)||
  !Number.isInteger(l.rngState)||l.rngState<1||
  !Number.isInteger(l.lastTickDay)||l.lastTickDay<0||
  !Array.isArray(l.triedEncounters)||l.triedEncounters.length>24||
  l.triedEncounters.some(x=>typeof x!=='string'||!/^[a-f0-9]{64}$/.test(x))||
  !Array.isArray(l.history)||l.history.length>HISTORY||
  !Practice.verify(l.practice,'sapient:'+b.id,l.sourceHash,aptitude(b))||
  l.noImposedProfession!==true||l.noInferredSociety!==true)
  return false;
 return true;
}
function ensure(s,b,ev){
 if(!sapient(b))throw Error('A sapient person is required; animal training cannot establish personhood');
 if(!b.sapientLife){
  if(!ev)throw Error('A sapient person needs a genuine original personal encounter, not a remote invented biography');
  b.sapientLife=make(s,b,ev);
 }
 if(!verify(b))throw Error('Unverified sapient individual life, achievements or ancestry');
 return b.sapientLife;
}
function draw(l){
 let x=l.rngState>>>0;
 x^=x<<13;x^=x>>>17;x^=x<<5;
 l.rngState=(x>>>0)||0x91e10da5;
 return l.rngState/4294967296;
}
function remember(l,e){
 l.history.push(e);if(l.history.length>HISTORY)l.history.shift();
}
function meet(s,p={}){
 noParams(p);
 const {b,ev,location}=original(s),key=hash(ev),existing=b.sapientLife;
 if(existing){
  if(!verify(b))throw Error('Unverified existing sapient individual');
  if(existing.triedEncounters.includes(key))
   throw Error('The person has already responded to this encounter; do not reroll their choice');
 }
 const l=ensure(s,b,ev),profile=Agency.profile(s,b);
 const available=b.needs.hunger<65&&b.needs.fatigue<65&&b.condition>=65;
 const offer=draw(l),willing=available&&offer<
  (profile.disposition==='independent'?.36:
   profile.disposition==='reserved'?.49:.72);
 const medium=E.SPECIES[b.species].ability.effect==='sound'?
  'a short personally chosen vocal pattern':'a cautious visible gesture';
 const response=willing?
  'The person offers '+medium+'; no shared language, name or agreement has been established.':
  'The person chooses not to engage further and maintains their own distance.';
 const now=s.world.minutes,minutes=willing?12:5,day=Math.floor(now/DAY);
 l.triedEncounters.push(key);
 if(l.triedEncounters.length>24)l.triedEncounters.shift();
 remember(l,{type:'personally-witnessed-contact',day,
  minute:now,location,meetingHash:key,
  willingness:willing,description:response,private:false});
 const witnessed={origin:'personally-witnessed-sapient-contact-v1',
  beastId:b.id,species:b.species,day,minute:now,location,
  meetingHash:key,description:response,freelyEngaged:willing,
  noAssumedSpeech:true,noContract:true,noLearnedTechnique:true};
 C.event(s,'story',response,witnessed);
 s.table||={};s.table.sapientBeastContacts||=[];
 s.table.sapientBeastContacts.push({beastId:b.id,
  species:E.SPECIES[b.species].name,day,location,
  response,freelyEngaged:willing,
  witnessHash:hash(s.log.at(-1))});
 if(s.table.sapientBeastContacts.length>80)
  s.table.sapientBeastContacts.shift();
 if(!willing){b.away=true;s.encounter=null;}
 const old=s.world.minutes,Time=require('../rules/world'),
  U=require('../rules/unified');
 E.advance(s,minutes);Time.finalizeTime(s,old);U.sync(s,{source:'legacy'});
 return {encountered:true,personSpecies:E.SPECIES[b.species].name,
  freelyEngaged:willing,response,minutes,
  noAssumedName:true,noAssumedSharedLanguage:true,
  noFreeSkills:true,noContractOrOwnership:true};
}
function witnessedStatus(s,p={}){
 noParams(p);
 const memories=s.table?.sapientBeastContacts||[];
 if(!Array.isArray(memories))throw Error('Invalid witnessed person memory');
 return {personallyWitnessedContacts:memories.slice(-30).map(x=>({
  species:x.species,day:x.day,location:x.location,
  freelyEngaged:x.freelyEngaged,response:x.response
 })),
  note:'Only remembered in-person encounters appear. Their private whereabouts, competence, origin, personal name and intentions are not known.'};
}
function location(s,b){
 const loc=E.LOCATIONS[b.location],region=Atlas.LOCATION_REGION[b.location],
  eco=s.table?.realm?.ecosystems?.[region];
 if(!loc?.spawns?.includes(b.species)||!eco||
  !['forage','water','pressure','quality'].every(k=>
   Number.isFinite(eco[k])&&eco[k]>=0&&eco[k]<=100))
  return null;
 return eco;
}
function sixday(s,day){
 if(!Number.isInteger(day)||day<0)throw Error('Actual calendar tick required for independent decisions');
 let acted=0,earned=0;
 for(const b of Object.values(s.beasts||{})){
  if(!b.sapientLife)continue; // No spawning people from global calendars.
  if(!verify(b))throw Error('Unverified autonomous sapient person');
  if(!sapient(b)||b.owner||s.player.partnerIds?.includes(b.id)||
   b.relationship!=='wild'||s.encounter?.beastId===b.id)continue;
  const l=b.sapientLife;
  if(day<=l.lastTickDay)continue;
  const eco=location(s,b);
  l.lastTickDay=day;
  if(!eco)continue;
  const decision=draw(l),before={hunger:b.needs.hunger,
   fatigue:b.needs.fatigue,condition:b.condition},site=b.location;
  let action='personal-activities',r=null;
  // A person can choose to rest, refuse work or adapt as an independent
  // individual. NO "XP per sixday": the clock is only an opportunity.
  if(b.condition<62||before.hunger>65||before.fatigue>68||
   eco.pressure>86){
   action='self-directed-recovery';
   b.needs.fatigue=clamp(b.needs.fatigue-8);
  }else if(decision<.26){
   action='independent-environmental-study';
   r={domain:'field-judgement',method:'habitat-observation'};
  }else if(decision<.44&&eco.forage>=35&&eco.water>=30){
   action='independent-resource-care';
   r={domain:'resource-care',method:'shelter-maintenance'};
  }
  if(r){
   const activity={origin:ACTIVITY,personId:b.id,
    personOriginHash:l.sourceHash,day,location:site,action,
    before,habitat:{forage:eco.forage,water:eco.water,
     pressure:eco.pressure,quality:eco.quality},
    chosenByIndividual:true},
    activityHash=hash(activity),roll=1+Math.floor(draw(l)*20),
    modifier=before.fatigue>45?-2:0,
    challenge=r.domain==='field-judgement'?
     12+(eco.pressure>62?4:0)+(eco.quality<40?2:0):
     12+(eco.forage<50?3:0)+(eco.water<50?2:0);
   // Only the verified individual agent creates this task. No player-facing
   // operation may select roll, method, DC, success or hidden progress.
   const outcome=Practice.record(l.practice,'sapient:'+b.id,
    l.sourceHash,aptitude(b),{
     domain:r.domain,method:r.method,activityHash,
     contextHash:hash(activity.habitat),day,roll,challenge,modifier});
   if(outcome.success&&r.domain==='resource-care')
    b.needs.fatigue=clamp(b.needs.fatigue-7);
   remember(l,{day,location:site,action,
    activityHash,workHash:outcome.receiptHash,
    result:outcome.success?'effective':'unresolved',private:true});
   earned+=outcome.earned;
  }else remember(l,{day,location:site,action,private:true});
  b.away=true;
  acted++;
  if(!verify(b))throw Error('Off-screen sapient experience lost genuine provenance');
 }
 return {acted,earned}; // GM-private, never a public XP notification.
}
module.exports={ORIGIN,ACTIVITY,make,verify,ensure,meet,witnessedStatus,sixday,
 _debug:{hash,original,aptitude,originProof,draw,location}};
