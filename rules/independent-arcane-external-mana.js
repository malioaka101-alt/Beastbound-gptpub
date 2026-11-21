'use strict';
// An external expenditure is a receipt IN the existing Arcane owner, not
// a parallel reserve. Currently only the original Boundary Domain VIII
// consumes it. The consuming owner independently verifies its own check.
const Crypto=require('node:crypto'),Build=require('./build');
const ORIGIN='source-owned-independent-arcane-external-mana-debit-v1',
 PURPOSE='rift-boundary-domain',COST=18,MINUTES=120,
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 int=(v,a=0,b=1000000000)=>Number.isInteger(v)&&v>=a&&v<=b;
function validRow(s,p,row,owner,stage,before,capacity,previousEnd){
 const q=row?.source;
 if(!q||row.seal!==hash(q)||q.origin!==ORIGIN||q.purpose!==PURPOSE||
  q.actorId!==p.actorId||q.identityOriginHash!==p.originHash||q.owner!==owner||q.stage!==stage||
  !int(q.minute,previousEnd,s.world.minutes)||q.endMinute!==q.minute+MINUTES||
  q.endMinute>s.world.minutes||q.manaBefore!==before||q.capacity!==capacity||
  q.amount!==COST||!int(before,COST,capacity)||q.manaAfter!==before-COST||
  q.noSeparateReserve!==true)return false;
 const receipt=p.originalRiftBoundaryDomains?.rows?.find(x=>x.source?.manaDebitSeal===row.seal);
 const a=receipt?.source;
 return !!a&&receipt.seal===hash(a)&&a.actorId===p.actorId&&a.accepted===true&&
  a.minute===q.minute&&a.actualMinutes===MINUTES&&a.witnessHash===q.witnessHash&&
  a.manaSpent===COST&&a.manaOwner===owner;
}
function current(s,p){
 if(p?.originalArcaneHigherArchitecture){
  const v=require('./independent-original-higher-architectures').privateStatus(s,p,'arcane');
  return {owner:'higher',stage:v.earnedStage,mana:v.currentEnergy,capacity:v.capacity};
 }
 if(p?.originalArcaneMatrix){
  const v=require('./independent-original-arcane-matrix-three').privateStatus(s,p);
  return {owner:'matrix',stage:v.verifiedArcaneCircle,mana:v.currentMana,capacity:Build.arcaneProfile(v.verifiedArcaneCircle).mana};
 }
 if(p?.originalArcaneCircleTwo){
  const v=require('./independent-original-arcane-circle-two').privateStatus(s,p);
  return {owner:'second',stage:v.verifiedArcaneCircle,mana:v.currentMana,capacity:Build.arcaneProfile(v.verifiedArcaneCircle).mana};
 }
 return null;
}
function ledger(p,owner){
 return owner==='higher'?p.originalArcaneHigherArchitecture:owner==='matrix'?p.originalArcaneMatrix:
  owner==='second'?p.originalArcaneCircleTwo:null;
}
function debit(s,p,witness){
 const v=current(s,p),d=witness?.details,minute=s.world.minutes,h=hash(witness);
 if(!v||v.mana<COST||d?.origin!==require('./rift-boundary-domain').WITNESS||
  d.actorId!==p.actorId||!s.log.some(x=>hash(x)===h))
  throw Error('Actual original Arcane Mana and fresh individual domain witness required');
 const r=ledger(p,v.owner),last=r.sessions.at(-1)?.source,
  end=last?(last.endMinute??((last.startMinute??last.minute)+last.actualMinutes)):0;
 if(!int(end,0,minute)||r.sessions.length>=(v.owner==='higher'?960:480)||
  r.sessions.some(x=>x.source.witnessHash===h))
  throw Error('No unused chronological original Arcane resource slot');
 const source={origin:ORIGIN,purpose:PURPOSE,actorId:p.actorId,identityOriginHash:p.originHash,
  owner:v.owner,stage:v.stage,minute,endMinute:minute+MINUTES,witnessHash:h,
  manaBefore:v.mana,capacity:v.capacity,amount:COST,manaAfter:v.mana-COST,noSeparateReserve:true};
 const seal=hash(source);r.sessions.push({source,seal});
 if(v.owner!=='higher')r.manaRemaining=source.manaAfter;
 return {seal,owner:v.owner};
}
function proof(s,p,seal,owner,witnessHash,minute){
 const r=ledger(p,owner),q=r?.sessions.find(x=>x.seal===seal)?.source;
 if(!q||q.origin!==ORIGIN||q.minute!==minute||q.witnessHash!==witnessHash)return false;
 return owner==='higher'?require('./independent-original-higher-architectures').verify(s,p,'arcane'):
  owner==='matrix'?require('./independent-original-arcane-matrix-three').verify(s,p):
  require('./independent-original-arcane-circle-two').verify(s,p);
}
module.exports={ORIGIN,PURPOSE,COST,MINUTES,validRow,current,debit,proof};
