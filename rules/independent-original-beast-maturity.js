'use strict';
// Original §6.6 Maturity belongs to the existing registered branch. This
// adapter credits only actual completed offscreen native wildlife intervals.
// It creates no branch, form, consent, rite, acceleration or second clock.
const Crypto=require('node:crypto'),E=require('../engine'),P=require('./progress'),
 Branch=require('./evolution-branch-web'),Core=require('./core');
const ORIGIN='source-earned-independent-native-beast-maturity-v1',
 WITNESS='gm-witnessed-independent-native-beast-maturity-enrolment-v1',
 hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex'),
 int=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b,
 actions=new Set(['independently-foraged','sheltered-and-rested','relocated-to-adjacent-compatible-habitat','roamed-through-existing-habitat-link','ordinary-territorial-life']);
function identity(s,b){
 if(!b||b.gmWild||b.generatedWild||!E.SPECIES[b.species]||!b.individualLife)return null;
 try{const life=require('../world/wild-lives')._debug.ensure(s,b,null);
  return life.sourceHash;}catch{return null;}
}
function plan(s,r,b){
 const a=b?.evolutionBranchAssessments?.[r.branchId];
 if(!a||!r.branching||!r.originAssessment||r.branching.seal!==r.originAssessment.branchSeal)return null;
 try{const verified=Branch.preRegister(s,b,a);
  if(!verified||verified.seal!==r.branching.seal||hash(r.branching.source)!==verified.seal)return null;
  return verified;}catch{return null;}
}
function enrolled(s,r,b){
 const l=r.independentMaturity;if(!l)return null;
 const id=identity(s,b),source=plan(s,r,b),q=l.source,w=q?.witness,d=w?.details;
 if(!id||!source||l.origin!==ORIGIN||l.seal!==hash(q)||q?.origin!==ORIGIN||
  q.beastId!==b.id||q.lifeSeal!==id||q.branchSeal!==source.seal||
  q.key!==b.id+'/'+r.branchId||q.requiredYears!==r.requiredYears||
  q.requiredYears!==source.source.parameters.requiredYears||
  r.documented!==source.source.parameters.documented||q.documented!==r.documented||
  !int(q.minute,source.source.minute,s.world.minutes)||q.startDay!==Math.ceil(q.minute/1440)||
  w?.type!=='story'||q.witnessHash!==hash(w)||d?.origin!==WITNESS||
  d.beastId!==b.id||d.branchId!==r.branchId||d.location!==q.location||
  d.noTransformationOrConsent!==true||typeof d.observedIndividualBiology!=='string'||
  d.observedIndividualBiology.trim().length<25||w.day!==Math.floor(q.minute/1440)+1||
  w.time!==E.clock({world:{minutes:q.minute}})||
  !Array.isArray(l.rows)||l.rows.length>4096)return null;
 return l;
}
function replay(s,r,b){
 const l=enrolled(s,r,b);if(!l)return null;
 const q=l.source,track={years:0,requiredYears:q.requiredYears,rate:1};
 let last=q.startDay,head=l.seal;
 for(const row of l.rows){
  const a=row?.source,activity=a?.activity;
  const retained=b.individualLife.history.find(x=>x.type==='offscreen-sixday'&&x.day===a?.day);
  if(!a||row.seal!==hash(a)||a.origin!==ORIGIN||a.previous!==head||
   a.beastId!==b.id||a.branchSeal!==q.branchSeal||a.lifeSeal!==q.lifeSeal||
   !int(a.day,last+1,Math.floor(s.world.minutes/1440))||a.day>b.individualLife.lastTickDay||
   !s.table?.calendar?.sixdays?.includes(a.day)||
   !int(a.previousLifeDay,b.individualLife.source.initialDay,a.day-1)||
   a.from!==Math.max(last,a.previousLifeDay,a.day-6)||a.days!==a.day-a.from||
   (retained&&hash(retained)!==a.activityHash)||
   activity?.type!=='offscreen-sixday'||activity.day!==a.day||
   !actions.has(activity.action)||activity.observed!==false||
   activity.ecologicalPressure!==true||a.activityHash!==hash(activity)||
   !E.LOCATIONS[activity.location]?.spawns?.includes(b.species)||
   !E.LOCATIONS[activity.fromLocation]?.spawns?.includes(b.species)||
   a.before!==track.years||a.noRiteOrNewForm!==true)return null;
  const result=P.maturityAdvance(track,a.days,{documented:q.documented,daysPerYear:365});
  if(a.after!==result.years||a.rate!==result.rate)return null;
  last=a.day;head=row.seal;
 }
 return l.lastDay===last&&l.head===head&&r.years===track.years&&r.rate===track.rate?track:null;
}
function verify(s,r,b){
 if(r?.independentMaturity===undefined)return true;
 try{return replay(s,r,b)!==null;}catch{return false;}
}
function enroll(s,{key,witnessIndex,...extra}={}){
 if(Object.keys(extra).length||typeof key!=='string'||!int(witnessIndex,0,s.log.length-1))
  throw Error('Only an existing original branch and freshly witnessed individual Maturity baseline are accepted');
 const r=P.get(s,key),b=s.beasts[r.beastId],source=plan(s,r,b),id=identity(s,b),
  minute=s.world.minutes,witness=structuredClone(s.log[witnessIndex]),d=witness.details;
 if(!source||!id||r.independentMaturity||r.evolved||r.blocked||r.years!==0||r.rate!==1||
  b.owner!==null||b.relationship!=='wild'||s.player.partnerIds?.includes(b.id)||
  b.away===true||b.location!==s.world.location||s.battle||
  witness.type!=='story'||d?.origin!==WITNESS||d.beastId!==b.id||d.branchId!==r.branchId||
  d.location!==b.location||d.noTransformationOrConsent!==true||
  typeof d.observedIndividualBiology!=='string'||d.observedIndividualBiology.trim().length<25||
  witness.day!==Math.floor(minute/1440)+1||witness.time!==E.clock(s))
  throw Error('Actual present source-verified native wild individual, untouched registered branch and fresh observed baseline required');
 const q={origin:ORIGIN,key,beastId:b.id,lifeSeal:id,branchSeal:source.seal,
  minute,startDay:Math.ceil(minute/1440),requiredYears:r.requiredYears,documented:r.documented,
  location:b.location,witness,witnessHash:hash(witness)};
 const seal=hash(q);r.independentMaturity={origin:ORIGIN,source:q,seal,rows:[],lastDay:q.startDay,head:seal};
 if(!verify(s,r,b))throw Error('Independent original Maturity baseline failed replay');
 return {enrolled:true,key,noTransformationOrConsent:true,noMaturityGranted:true};
}
// Called ONLY from the canonical native wildlife owner after its actual
// life tick. Do not extrapolate skipped encounters or unknown old years.
function afterLife(s,b,previousDay,activity){
 if(!b||b.owner!==null||b.relationship!=='wild'||b.away!==true||
  s.player.partnerIds?.includes(b.id)||!int(previousDay)||
  b.individualLife?.lastTickDay!==activity?.day||!actions.has(activity?.action)||
  hash(b.individualLife.history.at(-1))!==hash(activity))return 0;
 let count=0;
 for(const r of Object.values(s.table?.evolution||{})){
  if(r.beastId!==b.id||!r.independentMaturity||r.evolved||r.blocked)continue;
  if(!verify(s,r,b))throw Error('Actual original independent beast Maturity history was altered');
  const l=r.independentMaturity,day=activity.day,
   from=Math.max(l.lastDay,previousDay,day-6);
  if(from>=day||r.years>=r.requiredYears||l.rows.length>=4096)continue;
  const before=r.years,result=P.maturityAdvance(r,day-from,{documented:r.documented,daysPerYear:365}),
   q={origin:ORIGIN,previous:l.head,beastId:b.id,branchSeal:l.source.branchSeal,lifeSeal:l.source.lifeSeal,
    day,from,previousLifeDay:previousDay,days:day-from,activity:structuredClone(activity),activityHash:hash(activity),
    before,after:result.years,rate:result.rate,noRiteOrNewForm:true};
  const seal=hash(q);l.rows.push({source:q,seal});l.lastDay=day;l.head=seal;
  if(!verify(s,r,b))throw Error('Original independent elapsed Maturity failed replay');
  count++;
 }
 return count;
}
function privateStatus(s,r,b){
 const track=replay(s,r,b);if(!track)throw Error('Independent Maturity history does not verify');
 return {privateToGM:true,years:track.years,requiredYears:track.requiredYears,
  rate:track.rate,completedIntervals:r.independentMaturity.rows.length,noTransformationOrConsent:true};
}
// Until a real accelerated source adapter is connected, an enrolled branch
// cannot be mutated by an unreceipted manual or bypass operation.
function requireOrdinary(r){
 if(r?.independentMaturity)throw Error('This independent Maturity branch advances from its original wildlife life ticks; other advancement requires a source-linked adapter');
}
module.exports={ORIGIN,WITNESS,enroll,afterLife,verify,privateStatus,requireOrdinary};
