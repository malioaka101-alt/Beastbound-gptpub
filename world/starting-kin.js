'use strict';
// New campaigns start with named relatives whose independent lives persist.
// Knowledge of kinship never implies a conversation, presence, loyalty,
// inherited ability, title, employment or usable family resources.
const Crypto=require('node:crypto'),Atlas=require('./atlas'),
 Houses=require('./social-houses');
const ORIGIN='anchored-player-kin-individual-v1';
const EVENT='independent-starting-relative-month-v1';
const hash=o=>Crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex');
const clamp=(n,a=0,b=60)=>Math.max(a,Math.min(b,n));
const FOCUSES=['provisions','local-work','habitat-care','community-help'];
function number(seed,label){
 return Crypto.createHash('sha256').update(ORIGIN+'|'+seed+'|'+label)
  .digest().readUInt32BE(0);
}
function state(p){return {regionId:p.regionId,personalFunds:p.personalFunds,
 focus:p.focus,rngState:p.rngState};}
function record(p,day,action,roll,before){
 const source={origin:EVENT,id:p.id,day,action,roll,
  prev:p.headHash,before,after:state(p)};
 const receipt={source,hash:hash(source)};
 p.history.push(receipt);p.headHash=receipt.hash;p.lastMonthDay=day;
 // Keep the immediately preceding witness as a rolling hash anchor.
 // We do not need to pretend the earlier individual ceased to exist.
 if(p.history.length>36){const old=p.history.shift();p.anchorHash=old.hash;}
}
function seed(s,w){
 if(w.startingKin!==undefined)throw Error('Starting relations already have one life history');
 const context=s.player?.startingContext,members=s.player?.family?.members;
 if(!context||!Array.isArray(members)||!s.campaign?.slug||
    !Atlas.R[context.birthRegionId])
  throw Error('Actual newly generated kin and their original home are required');
 const original={origin:ORIGIN,worldSeed:w.worldSeed,
  campaignSlug:s.campaign.slug,hero:s.player.name,
  regionId:context.birthRegionId,
  houseId:s.player.family.house?.id||null,
  knownMembers:members.map((m,i)=>({index:i,name:m.name,relation:m.relation}))};
 if(original.houseId&&!Houses.byId[original.houseId])
  throw Error('Historical family relationship must use an original real house');
 const sourceHash=hash(original),people={};
 members.forEach((m,i)=>{
  if(typeof m.name!=='string'||m.name.length<3||
    typeof m.relation!=='string'||m.relation.length<2)
   throw Error('Known individual relatives need actual names and relationships');
  const id='kin_'+(i+1),personalSeed=number(w.worldSeed,
   'person-rng:'+sourceHash+':'+id)||0x524b4b01;
  const p={id,origin:ORIGIN,sourceHash,memberIndex:i,
   name:m.name,relation:m.relation,
   birthRegionId:context.birthRegionId,regionId:context.birthRegionId,
   personalFunds:5+number(w.worldSeed,'funds:'+sourceHash+':'+id)%17,
   focus:FOCUSES[number(w.worldSeed,'focus:'+sourceHash+':'+id)%FOCUSES.length],
   rngState:personalSeed,lastMonthDay:0,
   anchorHash:hash({origin:ORIGIN,sourceHash,id}),
   headHash:null,history:[]};
  p.headHash=p.anchorHash;
  record(p,0,'independent-relative-established',null,null);
  people[id]=p;
 });
 const ledger={version:1,origin:ORIGIN,source:original,
  sourceHash,people,lastMonthDay:0};
 w.startingKin=ledger;
 if(!verify(w))throw Error('New relative life history failed its founding source verification');
 return ledger;
}
function verify(w){
 const t=w.startingKin;
 if(!t)return true; // Older saves had no live-relative register.
 if(t.version!==1||t.origin!==ORIGIN||!t.source||
  t.source.origin!==ORIGIN||t.source.worldSeed!==w.worldSeed||
  !t.source.campaignSlug||t.sourceHash!==hash(t.source)||
  !Atlas.R[t.source.regionId]||
  (t.source.houseId&&!Houses.byId[t.source.houseId])||
  !Array.isArray(t.source.knownMembers)||
  !t.people||typeof t.people!=='object'||Array.isArray(t.people)||
  Object.keys(t.people).length!==t.source.knownMembers.length||
  !Number.isInteger(t.lastMonthDay)||t.lastMonthDay<0)return false;
 return t.source.knownMembers.every((m,i)=>{
  const id='kin_'+(i+1),p=t.people[id];
  if(!p||p.id!==id||p.memberIndex!==i||p.origin!==ORIGIN||
   p.sourceHash!==t.sourceHash||p.name!==m.name||p.relation!==m.relation||
   p.birthRegionId!==t.source.regionId||!Atlas.R[p.regionId]||
   !Number.isInteger(p.personalFunds)||p.personalFunds<0||p.personalFunds>60||
   !FOCUSES.includes(p.focus)||!Number.isInteger(p.rngState)||p.rngState<1||
   !Number.isInteger(p.lastMonthDay)||p.lastMonthDay<0||
   p.lastMonthDay>t.lastMonthDay||!Array.isArray(p.history)||
   p.history.length<1||p.history.length>36||
   typeof p.anchorHash!=='string'||p.anchorHash.length!==64||
   typeof p.headHash!=='string'||p.headHash.length!==64)return false;
  let prev=p.anchorHash,priorDay=0;
  for(const r of p.history){
   const a=r?.source;
   if(!a||r.hash!==hash(a)||a.origin!==EVENT||a.id!==id||
    a.prev!==prev||!Number.isInteger(a.day)||a.day<priorDay||
    (a.before&&(!Atlas.R[a.before.regionId]||
     !Number.isInteger(a.before.personalFunds)))||
    !Atlas.R[a.after?.regionId]||
    !Number.isInteger(a.after.personalFunds)||a.after.personalFunds<0||
    !Number.isInteger(a.after.rngState)||a.after.rngState<1||
    !FOCUSES.includes(a.after.focus))return false;
   prev=r.hash;priorDay=a.day;
  }
  const last=p.history.at(-1).source;
  return prev===p.headHash&&last.day===p.lastMonthDay&&
   JSON.stringify(last.after)===JSON.stringify(state(p));
 });
}
function draw(p){
 let x=p.rngState>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 p.rngState=(x>>>0)||0x524b4b01;
 return p.rngState/4294967296;
}
function month(w,day){
 const t=w.startingKin;
 if(!t)return {people:0,actions:0}; // No retroactive invention in older saves.
 if(!verify(w))throw Error('The family life register has unauthenticated evidence');
 if(!Number.isInteger(day)||day<0)throw Error('Actual calendar day required');
 if(day<=t.lastMonthDay)return {people:Object.keys(t.people).length,
  actions:0,duplicate:true};
 let actions=0;
 for(const p of Object.values(t.people)){
  const from=p.regionId,region=Atlas.R[from],
   eco=w.ecosystems?.[from],host=w.countries?.[region.polity];
  if(!eco||!host)throw Error('An individual relative needs a real local economy and habitat');
  const before=state(p),roll=1+Math.floor(draw(p)*20);
  let action='ordinary-personal-maintenance';
  // Relocation is local, paid and restricted to actual authored adjacent
  // regions. This does NOT establish a playable transcontinental route.
  const neighbours=(region.neighbors||[]).filter(id=>
   Atlas.R[id]&&Atlas.R[id].polity===region.polity);
  if((eco.pressure>67||eco.quality<40)&&neighbours.length&&
     p.personalFunds>=3&&roll>=15){
   p.regionId=neighbours[Math.floor(draw(p)*neighbours.length)];
   p.personalFunds-=2;action='paid-neighbouring-region-move';
  }else{
   const workplace=host.prosperity+(eco.quality-50)/2;
   if(roll+Math.floor(workplace/14)>=13){
    p.personalFunds=clamp(p.personalFunds+1+roll%3);
    action='limited-livelihood-earnings';
   }else{
    p.personalFunds=clamp(p.personalFunds-1);
    action='livelihood-or-provisions-setback';
   }
   if(roll===20&&eco.quality>=35)
    p.focus=FOCUSES[(FOCUSES.indexOf(p.focus)+1)%FOCUSES.length];
  }
  record(p,day,action,roll,before);
  actions++;
 }
 t.lastMonthDay=day;
 if(!verify(w))throw Error('A separately resolved individual family choice was altered');
 return {people:Object.keys(t.people).length,actions,duplicate:false};
}
function known(s,w){
 if(w.startingKin&&!verify(w))
  throw Error('Cannot disclose an altered family identity or history');
 const context=s.player?.startingContext,source=w.startingKin?.source;
 if(!source||source.hero!==s.player?.name||
  source.campaignSlug!==s.campaign?.slug||
  source.regionId!==context?.birthRegionId)return {
   members:(s.player?.family?.members||[]).map(m=>({
    name:m.name,relation:m.relation,knownFrom:'personal background'})),
   lifeLedgerAvailable:false,
   note:'No new facts about absent relatives can be inferred from a name or a family tree.'};
 return {members:source.knownMembers.map(m=>({
  name:m.name,relation:m.relation,
  lastEstablishedHome:Atlas.R[source.regionId].name,
  currentPresenceVerified:false})),
  lifeLedgerAvailable:true,
  note:'These are personally known early relationships. Their current whereabouts, funds, mood, willingness, private work and recent choices remain unknown until witnessed or communicated.'};
}
module.exports={ORIGIN,EVENT,seed,verify,month,known};
