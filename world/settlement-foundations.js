'use strict';
// Foundation-first, independently persistent local settlements. A settlement
// is born as a complete physical/social snapshot, NOT when the player discovers
// its next street. Residents are identities, never free helpers or merchants.
const Crypto=require('node:crypto'),Atlas=require('./atlas');
const SOURCE='causal-persistent-settlement-foundation-v1';
const hash=v=>Crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const unit=v=>parseInt(hash(v).slice(0,8),16)/4294967296;
const pick=(list,key)=>list[Math.floor(unit(key)*list.length)];
const bounded=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
const GIVEN=['Elin','Sella','Orren','Jessa','Dara','Corin','Fenna','Lorin','Maela','Kellan','Nila','Perrin','Aven','Tarin','Iona','Roswen','Davin','Edda','Neris','Hale','Ossa','Miran','Fara','Lenna','Merek','Willa','Aila','Ren','Olen','Brynn','Soren','Lysa','Nell','Rinna','Keir','Vela','Tavin','Loma','Rill','Hedwyn'];
const FAMILIES=['Appleford','Briarwell','Rowanbank','Willowmere','Stonecress','Wrenfall','Ashgrove','Fallow','Mossell','Dawnmere','Turnleaf','Goldreed','Birchrun','Cresswater','Sedgewick','Highbough','Vale','Farbrook','Oathwood','Larkmere','Wheatley','Cloverrun','Harth','Selden','Orchard','Amberwick','Rillcross','Flintmere','Alderby','Fenward','Bellweather','Whitethorn','Dunrow','Barley','Merrow','Rookford','Hazelbrook','Oakwhistle','Bramblewick','Ravenhay'];
const TASKS=['orchard tending','produce and preserves','repair and carpentry','beast welfare and handling','reading and records','medicinal herb work','grain carrying','water and drainage','teaching and practical instruction','smallholding','cart repair','cloth and mending'];
const MOTIVES=['keep a reliable livelihood','protect family time','improve a practical method','learn a better trade','avoid unnecessary debt','maintain the shared paths','care for an older relative','help preserve the orchard soil'];
const SOURCES=['seasonal orchard yields','local smallholding work','regional barge and road trade'];
const id=v=>typeof v==='string'&&/^[a-z][a-z0-9_-]{3,63}$/.test(v);
const shape=(p,keys)=>p&&typeof p==='object'&&!Array.isArray(p)&&
  Object.keys(p).every(k=>keys.includes(k));
function isSettlement(place){
 return !!(place&&place.sceneType==='settlement'&&
  /\b(hamlet|village|town|city|borough|settlement)\b/i.test(place.kind+' '+place.name));
}
function ensure(w){
 w.settlementFoundations||={version:1,source:SOURCE,records:{}};
 const t=w.settlementFoundations;
 if(t.version!==1||t.source!==SOURCE||!t.records||
    typeof t.records!=='object'||Array.isArray(t.records))
  throw Error('Invalid persistent settlement foundation register');
 return t;
}
function peek(s){return s.table?.realm?.settlementFoundations||null;}
function nameFor(place){
 return /\b(common|green|square)$/i.test(place.name)?
   place.name.replace(/\s+(common|green|square)$/i,''):place.name;
}
function physicalSites(place,regional){
 const orch=regional.biome==='forest'||regional.id==='orchard_vales';
 const publicSites=[
  ['common',orch?'Village green and public well':'Central public square','central','public',true],
  ['reading_house','Reading house and shared records','central','public',/reading house/i.test(place.description)],
  ['training_yard','Enclosed practical training yard','work','supervised',/practice yard|training/i.test(place.description)],
  ['handling_pens','Fenced beast-handling pens and troughs','work','restricted',/beast-handling pens/i.test(place.description)],
  ['market_lane','Roadside exchange and produce stalls','trade','public',true],
  ['workshops','Repair and craft workshops','trade','public',false],
  ['storage','Grain and winter-provision stores','work','restricted',false],
  ['cottages','Household lanes and cottages','homes','public',true],
  ['edge','Orchard and hedgerow boundary paths','edge','public',true],
  ['water','Drainage and watering infrastructure','edge','public',true],
  ['meeting','Shared local meeting room','central','public',false]
 ];
 return publicSites.map(([id,name,district,access,priorKnown])=>({
  id,name,district,access,priorKnown,independentUse:true,
  existingSceneWitness:priorKnown?place.foundingHash:null,
  routes:id==='common'?['reading_house','market_lane','cottages','training_yard']:
   id==='reading_house'?['common','meeting']:
   id==='training_yard'?['common','handling_pens','storage']:
   id==='handling_pens'?['training_yard','edge']:
   id==='cottages'?['common','edge','water']:
   id==='market_lane'?['common','workshops','storage']:
   id==='workshops'?['market_lane','storage']:
   id==='edge'?['cottages','handling_pens','water']:
   id==='water'?['edge','cottages']:
   id==='meeting'?['reading_house']:['market_lane','training_yard']
 }));
}
function generate(place,w){
 const region=Atlas.R[place.regionId],polity=Atlas.P[region.polity],
  root={source:SOURCE,worldSeed:w.worldSeed,placeId:place.id,
   placeFoundingHash:place.foundingHash,regionId:region.id,
   settlementName:nameFor(place),settlementKind:place.kind,
   createdMinute:place.establishedMinute,
   originatingPolity:region.polity,culture:polity.culture,
   regionEcology:region.biome,tradeGoods:[...region.goods]},
  planSeed=hash(root),n=21+Math.floor(unit(planSeed+':count')*13),
  sites=physicalSites(place,region),households=[],residents=[];
 for(let i=0;i<n;i++){
  const h='household_'+(i+1),surname=FAMILIES[(i+Math.floor(unit(planSeed+':family-offset')*FAMILIES.length))%FAMILIES.length],
   home='dwelling_'+(i+1),size=2+Math.floor(unit(planSeed+':size:'+i)*4),
   profession=pick(TASKS,[planSeed,h,'trade']),
   adults=size<4?1:2,personIds=[];
  for(let j=0;j<size;j++){
   const personId='resident_'+(i+1)+'_'+(j+1),
    given=pick(GIVEN,[planSeed,h,j,'given']),
    ageBand=j<adults?'adult':(j===size-1&&size>4?'elder':'child'),
    role=j===0?'householder':j<adults?'adult relative':ageBand==='elder'?'older relative':'dependent child',
    task=ageBand==='child'?'young learner':j===1&&adults>1?
      pick(TASKS,[planSeed,personId,'own-work']):profession;
   residents.push({id:personId,actorId:'settlement:'+place.id+':'+personId,
    name:given+' '+surname,ageBand,householdId:h,householdRole:role,
    dwellingId:home,profession:task,
    temperament:pick(['reserved','sociable','practical','independent'],[planSeed,personId,'personality']),
    concern:pick(MOTIVES,[planSeed,personId,'concern']),
    dayPattern:pick(['early','ordinary','late'],[planSeed,personId,'routine']),
    noInferredWillingness:true,notAutomaticallyKnown:true});
   personIds.push(personId);
  }
  households.push({id:h,name:surname+' household',dwellingId:home,
   district:i%4===0?'edge':'homes',memberIds:personIds,livelihood:profession,
   residence:{id:home,kind:'private dwelling',access:'private',
     builtIntoNeighbourhood:true},noInheritedTitle:true});
 }
 const whole={schema:1,name:nameFor(place),kind:place.kind,
  regionId:region.id,polityId:region.polity,culture:polity.culture,
  environmentalContext:{biome:region.biome,knownResources:[...region.goods],
   existingOrchards:region.id==='orchard_vales',naturalRisks:[...region.dangers]},
  townPlan:{districts:[{id:'central',purpose:'commons and learning'},
    {id:'homes',purpose:'residences and gardens'},
    {id:'trade',purpose:'trading and repairs'},
    {id:'work',purpose:'handling and food storage'},
    {id:'edge',purpose:'orchards and water'}],
   sites,links:sites.flatMap(site=>site.routes.filter(to=>site.id<to)
     .map(to=>({from:site.id,to,walkable:true}))),
   dwellings:households.map(h=>({...h.residence,householdId:h.id,district:h.district})),
   publicWater:['common','water'],accessRules:'Households and animal enclosures retain their own access and welfare rules'},
  civic:{polity:polity.name,rightsContext:polity.rights,
   assemblySiteId:'meeting',custom:'Household discussion and shared maintenance of the public common',
   authority:'local practical assembly; no unearned national office or rank'},
  economy:{regionGoods:[...region.goods],connections:[...SOURCES],
   workplaceSiteIds:['market_lane','workshops','training_yard','storage'],
   noFictionalTradableStock:true,independentFromPlayer:true},
  households,residents};
 const founding={...root,wholeHash:hash(whole),households:households.length,
   residents:residents.length};
 const record={version:1,source:SOURCE,placeId:place.id,founding,
  foundingHash:hash(founding),whole,live:{lastSixday:Math.floor(place.establishedMinute/1440),
   waterCondition:75,roadCondition:75,localWorkPressure:30,lastWitnessHash:null,
   historyAnchor:hash(founding),history:[],agents:{},conversations:[]},playerObservedSites:[]};
 if(!verify(place,record))throw Error('Generated settlement failed its original source proof');
 return record;
}
function verify(place,record){
 if(!place||!record||record.version!==1||record.source!==SOURCE||
  record.placeId!==place.id||record.founding?.source!==SOURCE||
  record.founding?.placeId!==place.id||
  record.founding?.placeFoundingHash!==place.foundingHash||
  record.foundingHash!==hash(record.founding)||
  record.founding.wholeHash!==hash(record.whole)||
  record.founding.households!==record.whole.households.length||
  record.founding.residents!==record.whole.residents.length||
  !Array.isArray(record.live?.history)||!Array.isArray(record.live?.conversations)||
  !Array.isArray(record.playerObservedSites)||
  !Number.isInteger(record.live?.lastSixday)||
  !Number.isInteger(record.live?.waterCondition)||
  !Number.isInteger(record.live?.roadCondition)||
  !Number.isInteger(record.live?.localWorkPressure)||
  record.live.history.length>90||
  record.playerObservedSites.some(x=>!record.whole.townPlan.sites.some(y=>y.id===x)))return false;
 let previous=record.live.historyAnchor||record.foundingHash;
 for(const h of record.live.history){
  if(!h||h.previous!==previous||h.hash!==hash({
   previous:h.previous,day:h.day,water:h.water,road:h.road,
   work:h.work,eco:h.eco,prosperity:h.prosperity,agencyHash:h.agencyHash}))
   return false;
  previous=h.hash;
 }
 return record.live.history.length===0||
  (record.live.lastWitnessHash===previous);
}
function get(s,placeId){
 const r=peek(s)?.records?.[placeId];if(!r)return null;
 const place=require('./lived-places').get(s,placeId);
 if(!verify(place,r))throw Error('Saved settlement foundation has lost its source-sealed identity');
 return r;
}
function found(s,{placeId}={}){
 if(!id(placeId))throw Error('A named previously founded settlement place is required');
 const Places=require('./lived-places'),place=Places.get(s,placeId);
 if(!isSettlement(place))throw Error('This place has not been established as a whole village, hamlet, town or city');
 const w=require('./simulation').ensure(s),t=ensure(w);
 if(t.records[placeId]){
  if(!verify(place,t.records[placeId]))throw Error('Existing settlement foundation is invalid');
  return {alreadyFounded:true,placeId,households:t.records[placeId].whole.households.length,
   residentCount:t.records[placeId].whole.residents.length,noTimeElapsed:true};
 }
 const generated=generate(place,w);t.records[placeId]=generated;
 require('../rules/core').event(s,'world','A persistent settlement foundation is established: '+generated.whole.name+'.',{
  source:SOURCE,placeId,foundingHash:generated.foundingHash,
  households:generated.whole.households.length,
  residents:generated.whole.residents.length,
  noPlayerResources:true,noNPCContactOrConsent:true,noTimeElapsed:true});
 return {founded:true,placeId,name:generated.whole.name,
  households:generated.whole.households.length,residentCount:generated.whole.residents.length,
  sites:generated.whole.townPlan.sites.length,noPlayerReward:true,noNPCSightings:true,
  note:'The entire local foundation is persisted. An unvisited building or resident is not automatically known or present.'};
}
function onPlaceEstablished(s,place){
 if(isSettlement(place))return found(s,{placeId:place.id});
 return null;
}
function scheduledSite(r,person,day,minute){
 const hour=Math.floor(minute/60);
 if(hour<7||hour>=20)return person.dwellingId;
 if(person.ageBand==='child'){
  if(hour>=9&&hour<14)return 'reading_house';
  return hour>=14&&hour<18?'common':'cottages';
 }
 if(person.ageBand==='elder')
  return hour>=10&&hour<16?'common':'cottages';
 const early=person.dayPattern==='early'?-1:person.dayPattern==='late'?1:0,
  site=person.profession.includes('beast')?'handling_pens':
    person.profession.includes('reading')||person.profession.includes('teaching')?'reading_house':
    person.profession.includes('repair')||person.profession.includes('mending')?'workshops':
    person.profession.includes('water')?'water':
    person.profession.includes('grain')?'storage':
    person.profession.includes('produce')?'market_lane':'edge';
 const activity=r.live.agents[person.id];
 if(activity?.day===day&&activity.atHome)return person.dwellingId;
 if(hour>=8+early&&hour<16+early)return site;
 return hour<18?'common':'cottages';
}
function localPeople(s,w){
 const r=w?.settlementFoundations?.records?.[s.world.location];
 const site=s.chatRuntime?.settlementSite;
 if(!r||!site||!r.whole.townPlan.sites.some(x=>x.id===site))return [];
 const day=Math.floor(s.world.minutes/1440),minute=s.world.minutes%1440;
 return r.whole.residents.filter(p=>scheduledSite(r,p,day,minute)===site).map(p=>({
  npcId:p.actorId,name:p.name,profession:p.profession,
  actuallyPresent:true,meetingIsNotAssent:true,
  siteId:site,origin:'persistent-settlement-resident'}));
}
function status(s,{placeId}={}){
 const idToSee=placeId||s.world.location,r=get(s,idToSee);
 if(!r)return {founded:false,placeId:idToSee,
  note:'No persisted settlement foundation has yet been established at this site.'};
 const here=s.world.location===idToSee,visible=r.whole.townPlan.sites.filter(x=>
  x.priorKnown||r.playerObservedSites.includes(x.id));
 return {founded:true,name:r.whole.name,
  centre:require('./lived-places').get(s,idToSee).name,
  placeId:idToSee,region:Atlas.R[r.whole.regionId].name,
  knownLandmarks:visible.map(x=>({id:x.id,name:x.name,access:x.access})),
  currentSite:here?(s.chatRuntime?.settlementSite||'common'):null,
  ...(here?{locallyObservedPeople:localPeople(s,require('./simulation').peek(s)).map(x=>({
   npcId:x.npcId,name:x.name,profession:x.profession}))}:{}),
  note:'Only established personally discoverable details are shown. Private residences, full household rosters, off-screen routines and individual concerns remain hidden.'};
}
function visit(s,{siteId}={}){
 if(typeof siteId!=='string')throw Error('Name an actual local settlement site');
 const r=get(s,s.world.location);
 if(!r)throw Error('The current location has no persisted settlement to explore');
 const site=r.whole.townPlan.sites.find(x=>x.id===siteId);
 if(!site||site.access==='restricted')
  throw Error('This site is not an accessible public place; caretaker permission is needed');
 if(s.encounter||s.battle||
   (s.table?.combatants?.player?.status&&s.table.combatants.player.status!=='ok'))
  throw Error('The present danger or condition prevents ordinary local movement');
 const from=s.chatRuntime?.settlementSite||'common';
 if(siteId===from)return {alreadyHere:true,time:0,siteId,people:localPeople(s,require('./simulation').peek(s))};
 const minutes=site.district===r.whole.townPlan.sites.find(x=>x.id===from)?.district?5:9,
   start=s.world.minutes;
 require('../engine').advance(s,minutes);
 require('../rules/world').finalizeTime(s,start);
 require('../rules/unified').sync(s,{source:'legacy'});
 s.chatRuntime||={revision:0,applied:{},focus:[]};
 s.chatRuntime.settlementSite=siteId;
 if(!r.playerObservedSites.includes(siteId))r.playerObservedSites.push(siteId);
 const people=localPeople(s,require('./simulation').peek(s));
 require('../rules/core').event(s,'travel','The local walk reaches '+site.name+'.',{
  source:SOURCE,placeId:r.placeId,siteId,fromSiteId:from,
  minutes,observedPersonIds:people.map(x=>x.npcId),
  noAutomaticConsent:true,noSuppliesOrSkillGained:true});
 return {arrived:true,siteId,site:site.name,minutes,
  visiblePeople:people.map(p=>({npcId:p.npcId,name:p.name,profession:p.profession})),
  noNPCConsentInferred:true};
}
function tick(w,day){
 const t=w.settlementFoundations;
 if(!t)return;
 for(const r of Object.values(t.records)){
  const place=w.livedPlaces?.places?.[r.placeId];
  if(!verify(place,r))throw Error('Cannot tick an invalid settlement foundation');
  if(day<=r.live.lastSixday)continue;
  const eco=w.ecosystems[r.whole.regionId],
   host=w.countries[r.whole.polityId],
   forage=eco?.forage??50,quality=eco?.quality??50,
   prosperity=host?.prosperity??50,prior=r.live.lastWitnessHash||r.foundingHash;
  const input={foundingHash:r.foundingHash,day,forage,quality,prosperity};
  const water=bounded(r.live.waterCondition+(forage>45?1:-2)
     +(unit([input,'water'])>.65?1:0),0,100),
   road=bounded(r.live.roadCondition+(prosperity>44?1:-1)
     -(unit([input,'road'])>.7?1:0),0,100),
   work=bounded(r.live.localWorkPressure+(prosperity<40?2:-1)
     +(quality<40?2:0),0,100);
  r.live.waterCondition=water;r.live.roadCondition=road;r.live.localWorkPressure=work;
  r.live.agents={};
  for(const p of r.whole.residents){
   if(p.ageBand==='child')continue;
   const atHome=unit([input,p.id,'independent-day-choice'])<
     (p.temperament==='independent'?.16:.08)+(work>65?.1:0);
   r.live.agents[p.id]={day,atHome,kind:atHome?'attending private responsibilities':'maintaining ordinary work pattern'};
  }
  const agencyHash=hash(r.live.agents);
  const witness={previous:prior,day,water,road,work,
   eco:{forage,quality},prosperity,agencyHash};
  const entry={...witness,hash:hash(witness)};
  r.live.history.push(entry);
  if(r.live.history.length>90){
   const evicted=r.live.history.shift();r.live.historyAnchor=evicted.hash;
  }
  r.live.lastSixday=day;r.live.lastWitnessHash=entry.hash;
 }
}
function speak(s,{npcId,question}={}){
 if(typeof npcId!=='string'||typeof question!=='string'||
    question.trim().length<3||question.length>400)
  throw Error('Speak to one actually encountered settlement resident with a genuine question');
 const r=get(s,s.world.location);
 if(!r)throw Error('No established settlement resident is present here');
 const w=require('./simulation').peek(s),
   candidate=localPeople(s,w).find(x=>x.npcId===npcId),
   person=r.whole.residents.find(x=>x.actorId===npcId);
 if(!candidate||!person)
  throw Error('A named independent resident must be genuinely present at this exact site');
 if(s.encounter||s.battle)throw Error('An immediate encounter prevents ordinary conversation');
 const day=Math.floor(s.world.minutes/1440),start=s.world.minutes,
  willing=unit([r.foundingHash,npcId,start,'own-choice'])<
   (person.temperament==='sociable'?.78:person.temperament==='reserved'?.43:.63),
  aboutFriends=/\b(bram|tessa)\b/i.test(question),
  aboutProfession=/\b(work|job|do here|occupation|livelihood)\b/i.test(question),
  heard=!willing?'Sorry, I have things to attend to just now.':
    aboutFriends?'I cannot tell you where they are.':
    aboutProfession?'I usually work with '+person.profession+'.':
    'I can speak about the ordinary life here, but I cannot promise an answer to that.',
  duration=willing?8:3;
 require('../engine').advance(s,duration);
 require('../rules/world').finalizeTime(s,start);
 require('../rules/unified').sync(s,{source:'legacy'});
 const receipt={personId:person.id,npcId,day,worldMinute:start,
   question:question.trim(),heard,willing,siteId:s.chatRuntime?.settlementSite,
   noRemoteKnowledge:true,noCompelledCooperation:true};
 r.live.conversations.push({...receipt,hash:hash(receipt)});
 if(r.live.conversations.length>80)r.live.conversations.shift();
 require('../rules/core').event(s,'story',
  person.name+(willing?' answers a question.':' declines to speak.'),{
   source:SOURCE,...receipt,conversationHash:hash(receipt)});
 return {spoken:willing,name:person.name,npcId,heard,minutes:duration,
  noOtherPersonWhereaboutsInferred:true,noAutomaticAid:true};
}
module.exports={SOURCE,isSettlement,ensure,peek,verify,get,found,onPlaceEstablished,status,visit,speak,localPeople,tick};
