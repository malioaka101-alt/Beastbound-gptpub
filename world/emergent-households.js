'use strict';
// Living chosen-family households arise from repeated, independently resolved
// cooperative contact between real adult people. This is a HOUSEHOLD bond,
// never proof of biological descent, marriage, hereditary ranks or nobility.
const Crypto=require('node:crypto'),Atlas=require('./atlas'),
 People=require('./emergent-people'),Contacts=require('./independent-contacts');
const ORIGIN='mutually-established-adult-household-v1';
const LIFE='original-independent-household-life-transition-v1';
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
// Life changes are consequences of the original two individuals' locations,
// health and independent renewed choice. They do not infer romance, marriage,
// biological parenthood, legal succession, grief, affection or ownership.
function lifeBaseline(h,status){
 return hash({origin:LIFE,householdSourceHash:h.sourceHash,status});
}
function ensureLife(h){
 if(h.lifeHistory===undefined){
  const anchor=lifeBaseline(h,h.status);
  h.lifeHistory={baseline:h.status,anchor,headHash:anchor,receipts:[]};
 }
 return h.lifeHistory;
}
function personFact(p){
 return {id:p.id,actorId:p.actorId,originHash:p.originHash,
  regionId:p.regionId,status:p.status,lastTickDay:p.lastTickDay,
  personality:p.personality};
}
function returnChoice(w,a,b,day){
 const x=unit({origin:LIFE,seed:w.worldSeed,actor:a.actorId,
  originHash:a.originHash,personality:a.personality,
  other:b.actorId,day,purpose:'renew-voluntary-shared-household'});
 return x<(a.personality==='independent'?.51:.69);
}
function sameHome(a,b){
 return a.regionId===b.regionId&&a.status==='active'&&b.status==='active';
}
function validLife(w,h){
 const t=h.lifeHistory;
 if(t===undefined)return true; // Already saved families remain valid.
 if(!t||!['shared','apart'].includes(t.baseline)||
  t.anchor!==lifeBaseline(h,t.baseline)||!Array.isArray(t.receipts)||
  t.receipts.length>10000)return false;
 let prior=t.baseline,previous=t.anchor,lastDay=h.source.foundedDay-1;
 for(const r of t.receipts){
  const q=r?.source;
  if(!q||r.hash!==hash(q)||q.origin!==LIFE||
   q.householdId!==h.id||q.originalHouseholdHash!==h.sourceHash||
   q.previous!==previous||q.previousStatus!==prior||
   !['shared','apart'].includes(q.nextStatus)||q.nextStatus===prior||
   !Number.isInteger(q.day)||q.day<=lastDay||
   q.day<h.source.foundedDay||
   !Array.isArray(q.people)||q.people.length!==2||
   q.noPresumedMarriageOrChildren!==true||
   q.noInvoluntaryReunion!==true)return false;
  const persons=q.people.map(f=>w.emergentPeople?.people?.[f?.id]);
  if(persons.some((p,i)=>!p||p.actorId!==q.people[i].actorId||
   p.originHash!==q.people[i].originHash||
   p.personality!==q.people[i].personality||
   !['active','recovering','relocated'].includes(q.people[i].status)||
   !Atlas.R[q.people[i].regionId]||
   !Number.isInteger(q.people[i].lastTickDay)||
   q.people[i].lastTickDay>q.day)||
   q.people.some((f,i)=>f.id!==h.source.founders[i].id||
    f.originHash!==h.source.founders[i].originHash))
   return false;
  const colocated=sameHome(...q.people);
  if(q.nextStatus==='shared'&&
   (!colocated||prior!=='apart'||
    q.renewedAgreement?.length!==2||
    !q.renewedAgreement.every((v,i)=>
      v===returnChoice(w,q.people[i],q.people[1-i],q.day))))
   return false;
  if(q.nextStatus==='apart'&&
   (colocated||prior!=='shared'||q.renewedAgreement!==null))return false;
  prior=q.nextStatus;previous=r.hash;lastDay=q.day;
 }
 return t.headHash===previous&&h.status===prior;
}
function noteChange(w,h,day,next,people){
 const t=ensureLife(h),prior=h.status;
 const facts=people.map(personFact),coLocated=sameHome(...facts),
  votes=next==='shared'?facts.map((f,i)=>
   returnChoice(w,f,facts[1-i],day)):null;
 if(prior===next||
  next==='shared'&&(!coLocated||votes.some(v=>!v))||
  next==='apart'&&coLocated)
  throw Error('A living household cannot change without real conditions and separate consent');
 const source={origin:LIFE,householdId:h.id,originalHouseholdHash:h.sourceHash,
  day,previousStatus:prior,nextStatus:next,people:facts,
  renewedAgreement:votes,previous:t.headHash,
  noPresumedMarriageOrChildren:true,noInvoluntaryReunion:true};
 const row={source,hash:hash(source)};
 t.receipts.push(row);t.headHash=row.hash;
 h.status=next;
 h.history.push({day,event:next==='shared'?
  'shared-home-resumed-by-two-independent-people':
  'shared-home-interrupted-by-real-life-circumstances',
  transitionSourceHash:row.hash});
 if(h.history.length>24)h.history.shift();
 if(!validLife(w,h))throw Error('Household life change lost its original sources');
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
 })&&validLife(w,h);
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
  ensureLife(home);
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
  ensureLife(home);
  if(!coLocated){
   if(home.status==='shared')noteChange(w,home,day,'apart',[a,b]);
   apart++;continue;
  }
  // Founders' first consent is not a lifetime obligation. After time
  // apart they must each independently want to resume a shared home.
  if(home.status==='apart'){
   if(!returnChoice(w,a,b,day)||!returnChoice(w,b,a,day)){
    apart++;continue;
   }
   noteChange(w,home,day,'shared',[a,b]);
  }
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
   currentlyShared:null, // An original founding notice does not reveal private later arrangements.
   lastPubliclyWitnessedArrangement:'established-together',
   foundFamilyNotBloodline:true,
   noKnownChildren:true,noAutomaticMarriage:true,noInheritedPowers:true});
 }
 return {localEstablishedHouseholds:homes.slice(-20),
  note:'Voluntarily chosen households, not automatic aristocratic houses, biological ancestry, marriages, heir rights or special techniques.'};
}
module.exports={ORIGIN,LIFE,ensure,valid,choice,sixday,month,visible};
