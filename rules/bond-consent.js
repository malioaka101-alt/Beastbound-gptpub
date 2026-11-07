'use strict';
// Limited voluntary animal-contract discussion. It does not certify guardian
// assent, informed sapient choice, Grades, or a completed legal contract.
const E=require('../engine.js'),C=require('./core'),Bond=require('./bonds'),Agency=require('./beast-agency');
const MINUTES=30,COOLDOWN=6*1440,RIGHTS='light agreement: voluntary travel, care obligations and continuing right to refuse';
function offer(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>!['beastId','depth'].includes(k)))
  throw Error('Only beastId and supported contract depth may be supplied; consent and outcomes are not caller choices');
 const id=p.beastId,beast=s.beasts?.[id];
 if(typeof id!=='string'||!beast)throw Error('Unknown beast for contract negotiation');
 const bond=Bond.fromSave(s,id);
 if(!Number.isInteger(beast.sapience)||bond.sapience!==beast.sapience)
  throw Error('Beast sapience must match the established bond');
 if(beast.sapience>1)throw Error('S2 guardian consent and S3+ informed negotiation require separately established dialogue and legal terms');
 const depth=p.depth??'light';
 if(depth!=='light')throw Error('Animal negotiation currently supports only clear light contracts; deeper terms require advanced verified communication');
 if(bond.contract)throw Error('This beast already has a binding contract');
 if(s.battle)throw Error('Contract negotiation is not available during combat');
 if(s.encounter?.beastId!==id&&!s.player.partnerIds?.includes(id))
  throw Error('Beast must be independently present in an established encounter or accompanying partnership');
 if(beast.away===true||(beast.location&&beast.location!==s.world.location))
  throw Error('Beast is not present in the current location');
 if(['captured','forced','coerced','imprisoned'].includes(String(beast.relationship||'').toLowerCase())||
    bond.fractured||bond.willingness<50||bond.trust<30||bond.respect<20||
    /hostile|agitated|terrified|panicked|fearful/i.test(String(beast.mood||'')))
  return {offered:false,reason:'The beast is not freely willing and comfortable enough for a contract proposal',rollMade:false};
 const current=beast.contractConsentEvidence;
 if(current&&!current.used&&current.beastWilling===true)
  throw Error('An unspent witnessed contract agreement already exists; do not roll a second offer');
 s.table||={};s.table.contractConsentAttempts||={};
 const last=s.table.contractConsentAttempts[id];
 if(last!==undefined){
  C.int(last,'previous contract negotiation minute',0);
  if(s.world.minutes-last<COOLDOWN)throw Error('This beast needs sixdays before another proposed contract discussion');
 }
 const decision=Agency.evaluate(s,beast,bond,'light_contract');
 if(!decision.possible){
  Agency.remember(s,beast);
  const instant=s.world.minutes;
  s.table.contractConsentAttempts[id]=instant;
  E.advance(s,MINUTES);
  const source='Witnessed animal refusal of '+RIGHTS+' by '+beast.name+
   ' at '+s.world.location+'; it declined independently before any persuasion check.';
  beast.contractConsentEvidence={beastId:id,sapience:beast.sapience,
   species:beast.species,evolutionStage:beast.evolutionStage,depth,
   worldMinute:s.world.minutes,source,beastWilling:false,guardianConsent:false,
   informedConsent:false,origin:'resolved-voluntary-animal-contract-offer',
   terms:RIGHTS,check:null};
  C.event(s,'beast',beast.name+' declines the contract proposal without a roll.',
   {beastId:id,depth,accepted:false,independentRefusal:true});
  return {offered:true,accepted:false,check:null,rollMade:false,depth,
   elapsedMinutes:MINUTES,evidenceRecorded:true,terms:RIGHTS,reason:'The beast declined the proposal'};
 }
 const cha=C.int(s.player.attributes?.cha,'recorded Charisma',1,30);
 const skill=C.int(s.player.skills?.beastcraft?.rank??0,'recorded Beastcraft rank',0,5);
 const modifier=Math.floor((cha-10)/2)+2*skill;
 const dc=12+(bond.trust<60?2:0)+(bond.willingness<60?2:0)+(bond.respect<40?2:0);
 const check=C.check(s,{modifier,dc,label:'Independent beast assent to light contract'});
 Agency.remember(s,beast);
 const instant=s.world.minutes;
 s.table.contractConsentAttempts[id]=instant;
 E.advance(s,MINUTES);
 const willing=check.success;
 // Consent exists only when the beast freely responds positively. Even a
 // successful human check never overrides the prechecked unwillingness.
 const source=(willing?'Witnessed voluntary animal acceptance':'Witnessed animal refusal')+
  ' of '+RIGHTS+' by '+beast.name+' in '+s.world.location+
  ', check d20 '+check.roll+' vs DC '+dc+'.';
 const proof={beastId:id,sapience:beast.sapience,species:beast.species,
  evolutionStage:beast.evolutionStage,depth,worldMinute:s.world.minutes,source,
  beastWilling:willing,guardianConsent:false,informedConsent:false,
  origin:'resolved-voluntary-animal-contract-offer',terms:RIGHTS,
  check:{roll:check.roll,dc:check.dc,success:willing}};
 // A refusal is recorded too, with no implied relationship gain and no
 // reusable consent. The check, response, time and proof are one saved turn.
 beast.contractConsentEvidence=proof;
 C.event(s,'beast',willing?
  beast.name+' visibly agrees to a limited, revocable care-and-travel contract discussion.':
  beast.name+' declines the proposed contract. The refusal stands.',
  {beastId:id,depth,accepted:willing,roll:check.roll,dc});
 return {offered:true,accepted:willing,check,depth,elapsedMinutes:MINUTES,
  evidenceRecorded:true,terms:RIGHTS,reason:willing?'Voluntary animal agreement recorded':'Proposal refused'};
}
function status(s,p={}){
 if(typeof p.beastId!=='string'||!s.beasts?.[p.beastId])throw Error('Unknown beast for contract consent status');
 const e=s.beasts[p.beastId].contractConsentEvidence;
 if(!e||e.origin!=='resolved-voluntary-animal-contract-offer')return {recorded:false};
 return {recorded:true,depth:e.depth,accepted:e.beastWilling,used:!!e.used,
  worldMinute:e.worldMinute,terms:e.terms,source:e.source};
}
module.exports={offer,status};
