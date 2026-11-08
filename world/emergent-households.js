'use strict';
// Living chosen-family households arise from repeated, independently resolved
// cooperative contact between real adult people. This is a HOUSEHOLD bond,
// never proof of biological descent, marriage, hereditary ranks or nobility.
const Crypto=require('node:crypto'),Atlas=require('./atlas'),
 People=require('./emergent-people'),Contacts=require('./independent-contacts');
const ORIGIN='mutually-established-adult-household-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const unit=x=>parseInt(hash(x).slice(0,8),16)/4294967296;
function ensure(w){
 w.emergentHouseholds||={version:1,counter:0,lastSixday:-1,
  lastMonth:0,households:{}};
 const t=w.emergentHouseholds;
 if(t.version!==1||!Number.isInteger(t.counter)||t.counter<0||
  !Number.isInteger(t.lastSixday)||!Number.isInteger(t.lastMonth)||
  !t.households||typeof t.households!=='object'||Array.isArray(t.households))
  throw Error('The living household register is inconsistent');
 return t;
}
function valid(w,h){
 if(!h||h.origin!==ORIGIN||h.source?.origin!==ORIGIN||
  h.source.id!==h.id||h.sourceHash!==hash(h.source)||
  !/^household_[1-9][0-9]*$/.test(h.id)||
  !Array.isArray(h.source.founders)||h.source.founders.length!==2||
  h.source.founders[0].id===h.source.founders[1].id||
  !Number.isInteger(h.source.foundedDay)||h.source.foundedDay<0||
  Atlas.R[h.source.regionId]?.polity!==h.source.polity||
  !['shared','apart'].includes(h.status)||
  !Number.isInteger(h.commonFunds)||h.commonFunds<0||h.commonFunds>1000||
  !Array.isArray(h.history)||h.history.some(x=>
    !Number.isInteger(x.day)||x.day<h.source.foundedDay))return false;
 const [a,b]=h.source.founders.map(f=>w.emergentPeople?.people?.[f.id]);
 if(!a||!b||!choice(w,a,b,h.source.foundedDay)||
  !choice(w,b,a,h.source.foundedDay))return false;
 return h.source.founders.every(f=>{
  const p=w.emergentPeople?.people?.[f.id];
  return p&&People.verify(w,p)&&p.originHash===f.originHash&&
   p.actorId===f.actorId&&p.family===h.id;
 });
}
function choice(w,p,other,day){
 return unit({origin:ORIGIN,worldSeed:w.worldSeed,
  actor:p.actorId,originHash:p.originHash,
  with:other.actorId,day,purpose:'choose-a-shared-household'})<
  (p.personality==='independent'?.55:.71);
}
function sixday(w,day,emit){
 const t=ensure(w);
 if(t.lastSixday>=day)return {created:0,duplicate:true};
 const contacts=Contacts.ensure(w),pairs=Object.entries(contacts.state.relations);
 let created=0;
 for(const [key,rel] of pairs){
  if(rel.contacts<3||rel.regardA<2||rel.regardB<2||
   rel.lastMeetingDay!==day)continue;
  const [aId,bId]=rel.people;
  if([aId,bId].sort().join('|')!==key)continue;
  const a=w.emergentPeople?.people?.[aId.slice('emergent:'.length)],
   b=w.emergentPeople?.people?.[bId.slice('emergent:'.length)];
  if(!a||!b||!People.verify(w,a)||!People.verify(w,b)||
   a.family||b.family||a.status!=='active'||b.status!=='active'||
   a.lastTickDay!==day||b.lastTickDay!==day||
   a.regionId!==b.regionId||a.polity!==b.polity||
   a.language!==b.language||a.funds<6||b.funds<6||
   a.fatigue>76||b.fatigue>76||
   !People.presence(w,a.actorId,People.siteFor(a.regionId),day)||
   !People.presence(w,b.actorId,People.siteFor(b.regionId),day)||
   !choice(w,a,b,day)||!choice(w,b,a,day))continue;
  // The independent social witness is already verified. Both adults
  // separately choose a common home, each paying actual existing funds.
  const id='household_'+(++t.counter),
   source={origin:ORIGIN,id,founders:[a,b].map(p=>({
    id:p.id,actorId:p.actorId,name:p.name,originHash:p.originHash,
    contribution:3})),regionId:a.regionId,polity:a.polity,
    foundedDay:day,contactPairKey:key,mutualConsents:true,
    contactReceiptHash:contacts.headHash,
    contactCount:rel.contacts,
    nonBiologicalKinship:true,noMarriageAssumed:true};
  const home={id,origin:ORIGIN,source,sourceHash:hash(source),
   name:a.name.split(' of ')[0]+' and '+b.name.split(' of ')[0]+
    ' of '+Atlas.R[a.regionId].name,
   status:'shared',commonFunds:6,history:[{day,
    event:'chosen-family-home-established',remainingSharedFunds:6}],
   releaseDay:day+6};
  a.funds-=3;b.funds-=3;a.family=id;b.family=id;
  t.households[id]=home;
  if(!valid(w,home))throw Error('Two independently chosen household founders cannot be authenticated');
  if(typeof emit==='function')emit({day,region:a.polity,
   subject:'living-household:'+id,releaseDay:home.releaseDay,
   channel:'neighbourhood registry',publiclyKnown:true,
   text:home.name+' establish a voluntary shared household after sustained work and contact. The registry records no bloodline, marriage, special rank or noble status.',
   severity:'routine'});
  created++;
 }
 t.lastSixday=day;
 return {created,duplicate:false};
}
function month(w,day){
 const t=ensure(w);
 if(t.lastMonth>=day)return {maintained:0,apart:0};
 let maintained=0,apart=0;
 for(const home of Object.values(t.households)){
  if(!valid(w,home))throw Error('The saved household founding record was altered');
  const [a,b]=home.source.founders.map(f=>w.emergentPeople.people[f.id]),
   coLocated=a.regionId===b.regionId&&a.status==='active'&&
    b.status==='active';
  if(!coLocated){home.status='apart';apart++;continue;}
  home.status='shared';
  // A shared kitchen costs food and takes actual existing contributions.
  // No offscreen income, forged children, compelled work or magic privileges.
  const paid=[a,b].map(p=>p.funds>=2?1:0);
  if(paid[0]+paid[1]===2){
   a.funds--;b.funds--;home.commonFunds=Math.min(1000,home.commonFunds+2);
   home.commonFunds--;
   a.fatigue=Math.max(0,a.fatigue-1);
   b.fatigue=Math.max(0,b.fatigue-1);
   maintained++;
  }else if(home.commonFunds>0){
   home.commonFunds--;maintained++;
  }
  home.history.push({day,event:'household-provisions',
   contributions:paid[0]+paid[1]===2?2:0,
   remainingSharedFunds:home.commonFunds});
  if(home.history.length>24)home.history.shift();
 }
 t.lastMonth=day;
 return {maintained,apart};
}
function visible(s,w){
 const polity=Atlas.R[Atlas.LOCATION_REGION[s.world.location]]?.polity,
  day=Math.floor(s.world.minutes/1440),homes=[];
 for(const h of Object.values(w.emergentHouseholds?.households||{})){
  if(!valid(w,h))throw Error('Public household background has false personal evidence');
  if(h.source.polity!==polity||h.releaseDay>day)continue;
  homes.push({id:h.id,name:h.name,founders:h.source.founders.map(x=>x.name),
   foundedDay:h.source.foundedDay,
   currentlyShared:h.status==='shared',foundFamilyNotBloodline:true,
   noKnownChildren:true,noAutomaticMarriage:true,noInheritedPowers:true});
 }
 return {localEstablishedHouseholds:homes.slice(-20),
  note:'Voluntarily chosen households, not automatic aristocratic houses, biological ancestry, marriages, heir rights or special techniques.'};
}
module.exports={ORIGIN,ensure,valid,choice,sixday,month,visible};
