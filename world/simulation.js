'use strict';
// World simulation: coarse but persistent, deterministic, causal and GM-sealed.
// Never use player RNG or print hidden clocks and stats in player-facing replies.
const Crypto=require('node:crypto'),A=require('./atlas'),B=require('./bestiary'),E=require('../engine.js'),N=require('./notables'),Mythic=require('./mythic'),Houses=require('./social-houses'),Gov=require('./government-offices'),Civic=require('./civic-petitions'),PublicHearings=require('./public-hearings'),Mediation=require('./voluntary-mediation'),AgentInitiatives=require('./agent-initiatives'),KnowledgeDiffusion=require('./knowledge-diffusion'),AdaptiveAmbitions=require('./adaptive-ambitions'),ProfessionalPeers=require('./professional-peers'),FamilyMembers=require('./family-members'),EmergentGroups=require('./emergent-groups'),GroupMemberAgency=require('./group-member-agency'),PersonPresence=require('./person-presence'),WildLives=require('./wild-lives'),WildRelations=require('./wild-relations'),WildGenerations=require('./wild-generations'),EmergentPeople=require('./emergent-people'),SapientBeasts=require('./sapient-beast-persons'),IndependentContacts=require('./independent-contacts');
const GuildFieldwork=require('./guild-fieldwork');
const Renown=require('./renown-and-practice');
const MIN=0,MAX=100;
const clamp=(x,a=MIN,b=MAX)=>Math.max(a,Math.min(b,x));
const num=(x,label,min,max)=>{if(!Number.isInteger(x)||x<min||x>max)throw Error(`Invalid ${label}`);return x;};
const safe=x=>typeof x==='string'&&x.length>=8&&x.length<=220;
const worldDay=s=>Math.floor(s.world.minutes/1440);
const locationRegion=s=>A.LOCATION_REGION[s.world.location]||'morrowfen_basin';
const polityOf=s=>A.R[locationRegion(s)]?.polity||'reedmarch';
function random(w){let x=w.rngState>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;w.rngState=x>>>0||0x593f56bc;return w.rngState/4294967296;}
function noise(w,lo=-2,hi=2){return lo+Math.floor(random(w)*(hi-lo+1));}
function seedFor(s){const n=(s.seed>>>0)||1355150487;return ((n^0x9e3779b9)>>>0)||0x3199fbbb;}
function initial(s,startingDay=0){
 const w={version:1,worldSeed:seedFor(s),rngState:seedFor(s),startedAt:startingDay,lastTickDay:startingDay,
  calendarAnchor:null,ticks:{sixdays:0,months:0},countries:{},institutions:{},routes:{},ecosystems:{},diplomacy:{},notables:N.seedNotables(),houses:Houses.seed(),governance:Gov.seed(),
  market:{},mythic:Mythic.seed(),chronicle:[],sealedChronicle:[],knownSights:[],orders:[],counters:{wars:0,peaceTreaties:0,changesOfGovernment:0,closures:0,reopenings:0,ecosystemWarnings:0},
  publicKnowledge:{notes:[]}};
 for(const p of A.polities){w.countries[p.id]={...p.initial,regime:p.government,rulerTenure:0,stressMonths:0,cycle:0,warExhaustion:0};
  w.market[p.id]={grain:1,feed:1,materials:1,medicine:1,vael:1};}
 for(const ins of A.institutions)w.institutions[ins.id]={...ins.initial,status:'active',members:25+((B.hash(ins.id))%150),lastChange:0};
 for(const route of A.tradeRoutes){w.routes[route.id]={capacity:route.capacity,risk:route.risk,flow:route.capacity,disrupted:false};}
 for(const p of A.polities){for(const other of [p.ally,p.rival]){
   const key=[p.id,other].sort().join('|');if(w.diplomacy[key])continue;
   const neighbour=A.P[other];
   const areAllies=other===p.ally||neighbour.ally===p.id;
   w.diplomacy[key]={a:p.id,b:other,tension:areAllies?23:65,status:areAllies?'cooperation':'strained',conflictMonths:0,cooldown:0,treatyYears:0,tradeSanctions:false};
 }}
 for(const reg of A.regions){const options=B.localCandidates(reg.biome),samples=[];
  const observed=new Set();for(let i=0;i<Math.min(4,options.length);i++){
   const fam=options[B.hash(`${reg.id}:${i}`)%options.length].group;
   if(observed.has(fam))continue;observed.add(fam);samples.push(fam);
  }
  w.ecosystems[reg.id]={pressure:15+B.hash('pressure:'+reg.id)%45,water:65+B.hash('water:'+reg.id)%25,
   forage:50+B.hash('forage:'+reg.id)%42,quality:60+B.hash('quality:'+reg.id)%35,
   indicators:Object.fromEntries(samples.map((family,i)=>[family,{population:45+B.hash(`${reg.id}:${family}`)%45,capacity:90+B.hash(`${reg.id}:cap:${family}`)%50}])),
   collapseWarnings:0,seasonalMovement:0,lastChangeDay:0};
 }
  // The world owns physical habitat plants before any player survey occurs.
 gatheringSites(w,startingDay);
 // Seed limited provisioner stock from already established grain/feed ecology,
 // independent of the player's interest or visit.
 localProvisioner(w,startingDay);
 // Independent institution bulletin derives from real ecological starting facts.
 GuildFieldwork.seed(w,startingDay);
 PersonPresence.plan(w,startingDay);
 return w;
}
function ensure(s,{startDay=worldDay(s)}={}){s.table||={};return s.table.realm||(s.table.realm=initial(s,startDay));}
function peek(s){return s.table?.realm||initial(s);}
// Canonical example of a real local provisioner with limited owned stock.
// Goods exist in the world before any player asks to see a quotation.
function localProvisioner(w,day=w.lastTickDay){
 if(!w.localProvisioner){
  const basin=A.R.morrowfen_basin,eco=w.ecosystems?.morrowfen_basin,
   host=w.countries?.reedmarch,npc=E.NPCS.otto;
  if(!basin?.goods.includes('grain')||!basin.goods.includes('feed')||
     !eco||!host||npc?.location!=='crossing'||
     npc.profession!=='Beast provisioner')
   throw Error('An actual canonical grain/feed source and named provisioner are required');
  const initialStock=Math.min(8,Math.max(0,Math.floor(eco.forage/18)));
  w.localProvisioner={origin:'established-reedmarch-provisions-v1',
   sellerNpcId:'otto',seller:npc.name,location:'crossing',
   regionId:'morrowfen_basin',item:'clean_rations',stock:initialStock,
   fundsScales:2500,lastRestockDay:day,
   founding:{day,regionGoods:['grain','feed'],regionalForage:eco.forage,
    polityProsperity:host.prosperity,initialStock},
   history:[]};
 }
 const v=w.localProvisioner;
 if(v.origin!=='established-reedmarch-provisions-v1'||
    v.sellerNpcId!=='otto'||v.seller!==E.NPCS.otto.name||
    v.location!=='crossing'||v.regionId!=='morrowfen_basin'||
    v.item!=='clean_rations'||!Number.isInteger(v.stock)||v.stock<0||v.stock>8||
    !Number.isInteger(v.fundsScales)||v.fundsScales<0||v.fundsScales>100000000||
    !Number.isInteger(v.lastRestockDay)||!Array.isArray(v.history))
  throw Error('Existing local provisioner stock, owner or funds need reconciliation');
 return v;
}
function restockLocalProvisioner(w,day){
 const v=localProvisioner(w,day),eco=w.ecosystems.morrowfen_basin,
  host=w.countries.reedmarch;
 if(day<=v.lastRestockDay)return;
 // One independent wholesale delivery at a real world sixday tick.
 // Unsuitable terrain, poor supply, unaffordable wholesale goods or a
 // disrupted local market can block replenishment. No clock-based rank gate.
 const market=w.market.reedmarch;
 const supplyOk=eco.quality>=35&&eco.forage>=35&&
  host.prosperity>=30&&Number.isFinite(market.grain)&&market.grain<=1.5;
 const units=supplyOk?Math.min(2,8-v.stock,Math.floor(v.fundsScales/500)):0;
 if(units>0){v.stock+=units;v.fundsScales-=units*500;}
 v.lastRestockDay=day;
 v.history.push({day,kind:'independent-wholesale-attempt',received:units,
  paidScales:units*500,supplySupported:supplyOk,
  remainingStock:v.stock});
 if(v.history.length>80)v.history.shift();
}
// Shared physical source catalogue: these are *existing* local habitat
// features, not a menu of arbitrary loot. An author establishes a new
// profile only when both the region and the seen terrain support that plant.
// The same stock, harvest and resupply rules apply regardless of item name.
// Restoration is part of the SAME real habitat resource ledger as harvesting.
// A cutting has no immediate magical effect on stock or regional ecosystem.
// It may establish only at a later independent world tick.
const PROPAGATION_ORIGIN='verified-local-native-planting-v1';
const plantingHash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const GATHER_SOURCES=Object.freeze({
 fen:Object.freeze({item:'marsh_reed',region:'whisperfen',
  terrainClue:'reed islands',regionClue:'reed islands',
  maxStock:8,forageDivisor:12,restockUnits:2,impact:2,workMinutes:45,staminaCost:4}),
 hills:Object.freeze({item:'ironbloom',region:'ashwind',
  terrainClue:'ironbloom',regionClue:'ironbloom',
  maxStock:4,forageDivisor:28,restockUnits:1,impact:4,workMinutes:60,staminaCost:5})
});
function authenticGatherSource(w,location){
 const spec=GATHER_SOURCES[location],loc=E.LOCATIONS[location];
 const region=spec&&A.R[spec.region],eco=region&&w.ecosystems?.[spec.region];
 if(!spec||!loc||!E.RESOURCES[spec.item]||!region||
    !region.loc.includes(location)||!region.traits.includes(spec.regionClue)||
    !loc.description.toLowerCase().includes(spec.terrainClue)||
    !eco||![eco.forage,eco.quality,eco.pressure].every(x=>
     Number.isInteger(x)&&x>=0&&x<=100))
  throw Error('A genuinely established local resource, terrain and living ecology are required');
 return {spec,eco};
}
function gatheringSites(w,day=w.lastTickDay){
 if(w.gatheringSites===undefined){
  w.gatheringSites={};
  for(const location of Object.keys(GATHER_SOURCES)){
   const {spec,eco}=authenticGatherSource(w,location);
   const stock=Math.min(spec.maxStock,Math.max(0,Math.floor(eco.forage/spec.forageDivisor)));
   w.gatheringSites[location]={origin:'original-habitat-resource-source-v1',
    location,item:spec.item,region:spec.region,stock,maxStock:spec.maxStock,
    lastRegrowthDay:day,initialForage:eco.forage,initialStock:stock,
    history:[],plantings:[]};
  }
 }
 if(!w.gatheringSites||typeof w.gatheringSites!=='object'||
    Array.isArray(w.gatheringSites)||
    Object.keys(w.gatheringSites).length!==Object.keys(GATHER_SOURCES).length)
  throw Error('Saved physical habitat material sources need reconciliation');
 for(const [location,v] of Object.entries(w.gatheringSites)){
  const {spec}=authenticGatherSource(w,location);
  if(!v||v.origin!=='original-habitat-resource-source-v1'||
    v.location!==location||v.item!==spec.item||v.region!==spec.region||
    v.maxStock!==spec.maxStock||
    !Number.isInteger(v.stock)||v.stock<0||v.stock>v.maxStock||
    !Number.isInteger(v.lastRegrowthDay)||v.lastRegrowthDay>day||
    !Number.isInteger(v.initialForage)||v.initialForage<0||v.initialForage>100||
    !Number.isInteger(v.initialStock)||v.initialStock<0||v.initialStock>v.maxStock||
    !Array.isArray(v.history)||
    (v.plantings!==undefined&&(!Array.isArray(v.plantings)||
      v.plantings.some(p=>!p||p.origin!==PROPAGATION_ORIGIN||
       p.item!==spec.item||p.location!==location||
       !p.source||p.source.origin!==PROPAGATION_ORIGIN||
       p.source.item!==spec.item||p.source.location!==location||
       p.source.region!==spec.region||
       !Number.isInteger(p.source.plantedMinute)||
       p.source.plantedMinute<0||
       p.source.plantedMinute>day*1440+1439||
       !Number.isInteger(p.source.dueDay)||
       p.source.dueDay<=Math.floor(p.source.plantedMinute/1440)||
       p.sourceHash!==plantingHash(p.source)||
       !['pending','established','failed','crowded'].includes(p.status)||
       (p.status!=='pending'&&(!Number.isInteger(p.resolvedDay)||
         p.resolvedDay<p.source.dueDay))||
       (p.status==='pending'&&p.resolvedDay!==undefined)))))
   throw Error('Saved source stock, planting evidence or its original terrain has been altered');
 }
 return w.gatheringSites;
}
function gatheringSource(s,location=s.world.location){
 const w=ensure(s),entries=gatheringSites(w,worldDay(s)),entry=entries[location];
 if(!entry)throw Error('This site has no established harvestable physical material source');
 const {spec,eco}=authenticGatherSource(w,location);
 return {entry,spec,eco};
}
function regrowGatheringSites(w,day){
 const entries=gatheringSites(w,day);
 for(const [location,entry] of Object.entries(entries)){
  const {spec,eco}=authenticGatherSource(w,location);
  if(entry.lastRegrowthDay>=day)continue;
  // A viable planted native specimen can establish only after an actual
  // independent world interval. Even a successful earlier planting loses
  // out when regional ecology worsens or the patch is already saturated.
  const established=eco.forage>=30&&eco.quality>=30&&eco.pressure<85;
  for(const planted of entry.plantings||[]){
   if(planted.status!=='pending'||planted.source.dueDay>day)continue;
   const available=entry.stock<entry.maxStock;
   const state=established?(available?'established':'crowded'):'failed';
   if(state==='established')entry.stock++;
   planted.status=state;planted.resolvedDay=day;
   entry.history.push({kind:'player-native-planting-resolved',day,
    plantingSourceHash:planted.sourceHash,result:state,
    addedStock:state==='established'?1:0,remainingStock:entry.stock});
  }
  const healthy=eco.forage>=35&&eco.quality>=35&&eco.pressure<75;
  const units=healthy?Math.min(spec.restockUnits,entry.maxStock-entry.stock):0;
  entry.stock+=units;entry.lastRegrowthDay=day;
  entry.history.push({kind:'independent-habitat-regrowth',day,
   received:units,ecologySupported:healthy,remainingStock:entry.stock});
  if(entry.history.length>100)entry.history.shift();
 }
}
function event(w,{day,region,subject,text,channel='guild report',publiclyKnown=true,releaseDay=day,severity='routine'}={}){
 const v={day,region,subject,text,channel,publiclyKnown,releaseDay,severity};
 const arr=publiclyKnown?w.chronicle:w.sealedChronicle;
 arr.push(v);if(arr.length>200)arr.splice(0,arr.length-200);
 return v;
}
function quickContext(w){return {activeWars:Object.values(w.diplomacy).filter(x=>x.status==='war').length,disruptedRoutes:Object.values(w.routes).filter(x=>x.disrupted).length};}
// A real individual's field report enters the established regional public
// bulletin. On a later WORLD sixday, the relevant independent institution
// may assess it against its own funds/capacity. Publication is not a hiring
// contract, guild membership, supernatural technique or guaranteed favour.
function reviewPublicPractice(w,day){
 const ledger=w.culturalPractice;
 if(!ledger)return {reviewed:0,adopted:0};
 if(!Array.isArray(ledger.reports)||!Number.isInteger(ledger.counter))
  throw Error('Professional evidence archive is not a valid independent world record');
 const work=require('../rules/world-practice');
 let reviewed=0,adopted=0;
 for(const r of ledger.reports){
  if(!work.verifyReport(r))
   throw Error('A public professional report was altered or invented; an independent institution cannot accept it');
  if(r.reviewedDay!==null||!r.published||r.releaseDay>day)continue;
  const spec=Renown.J[r.jobId],method=Renown.M[spec.method],
   office=w.institutions[method.institution];
  if(!office)throw Error('A public method cannot be adopted by an organisation absent from the live world');
  const possible=office.status==='active'&&office.funds>20&&office.capacity>25,
   accepted=possible&&random(w)<Math.min(0.75,
     0.25+office.capacity/250+(r.receipt.check.degree==='exceptional'?0.08:0));
  r.reviewedDay=day;
  r.response=accepted?'independently acknowledged for further study':
   possible?'filed without acceptance':'not reviewed operationally due to limited institutional capacity';
  reviewed++;
  if(accepted){
   adopted++;
   office.reputation=clamp(office.reputation+1);
   event(w,{day,region:spec.region,subject:'civil-practice:'+r.id,
    text:AtlasName(method.institution)+' records an outside '+spec.name.toLowerCase()+
      ' field report for further institutional review; no employment, teaching or family standing follows.',
    channel:'guild dispatch',publiclyKnown:true,releaseDay:day+2,severity:'routine'});
  }
 }
 return {reviewed,adopted};
}
function AtlasName(id){return A.I[id]?.name||id;}

function tickSixday(w,day){
 w.ticks.sixdays++;
 Mythic.tick(w,day,{phase:'sixday',event:e=>event(w,e)});
 const current=quickContext(w);
 for(const p of A.polities){
  const c=w.countries[p.id];let trade=0;
  for(const r of A.tradeRoutes)if(r.a===p.id||r.b===p.id)trade+=w.routes[r.id].flow>40?1:0;
  const hasWar=Object.values(w.diplomacy).some(d=>d.status==='war'&&(d.a===p.id||d.b===p.id));
  const friction=hasWar?2:0;
  c.prosperity=clamp(c.prosperity+noise(w,-2,2)+(trade>=2?1:0)-friction);
  c.treasury=clamp(c.treasury+noise(w,-2,2)+(c.prosperity>55?1:0)-friction);
  c.stability=clamp(c.stability+noise(w,-1,1)+(c.stability<38?1:0)+(c.treasury<20?-1:0)-(hasWar&&w.ticks.sixdays%2===0?1:0));
  c.legitimacy=clamp(c.legitimacy+noise(w,-1,1)+(c.legitimacy<35?1:0)+(hasWar&&w.ticks.sixdays%3===0?-1:0));
 }
 // Institutional budgets and member resources respond to their host countries.
 for(const i of A.institutions){const t=w.institutions[i.id],host=w.countries[i.polity];
  const grant=host.treasury>52?1:host.treasury<18?-2:0;
  const rescue=t.status==='suspended'&&day-t.lastChange>=60?(host.treasury>=25?4:2):0;
  t.funds=clamp(t.funds+grant+rescue+noise(w,-2,2)-(t.status==='active'?1:-1)+(host.prosperity>42?1:0));
  t.capacity=clamp(t.capacity+noise(w,-1,1)+(t.funds<18?-2:0)+(t.funds>35&&t.status==='suspended'?3:t.funds>75?1:0));
  t.reputation=clamp(t.reputation+noise(w,-1,1));
  if(t.status==='active'&&t.funds<=7&&t.capacity<22){t.status='suspended';t.lastChange=day;w.counters.closures++;
   event(w,{day,region:i.polity,subject:i.id,text:`${i.name} suspends some services after a funding crisis.`,channel:'public notice',releaseDay:day+1,severity:'important'});}
  else if(t.status==='suspended'&&t.funds>39&&t.capacity>29&&day-t.lastChange>=30){t.status='active';t.lastChange=day;w.counters.reopenings++;
   event(w,{day,region:i.polity,subject:i.id,text:`${i.name} reopens its services under revised support.`,channel:'guild dispatch',releaseDay:day+3,severity:'important'});}
 }
 // Earlier independently published real civic/practice reports can affect
 // later professional attention. The world chooses whether to acknowledge.
 reviewPublicPractice(w,day);
 // Local ecological indicators follow carrying capacity, habitat stress and food.
 for(const r of A.regions){const e=w.ecosystems[r.id];const extraction=(r.goods.includes('ore')||r.goods.includes('vael'))&&w.ticks.sixdays%2===0?3:0;
  const inheritedPressure=r.id==='whisperfen'&&w.ticks.sixdays%7===0?1:0;
  e.pressure=clamp(e.pressure+noise(w,-1,1)+(e.quality<28?1:e.quality>63?-1:0)+extraction+inheritedPressure);
  e.forage=clamp(e.forage+noise(w,-1,1)-(e.pressure>75?1:0)+(e.pressure<50?1:0));
  e.quality=clamp(e.quality+noise(w,-1,1)+(e.pressure>72?-1:e.pressure<52?1:0));
  for(const v of Object.values(e.indicators)){
   const carrying=clamp(v.capacity-e.pressure/2,8,200);
   v.population=clamp(v.population+noise(w,-2,2)+(v.population<carrying?1:-1)+(e.quality<30?-2:0),0,200);
  }
  if(e.quality<18&&day-e.lastChangeDay>180){e.collapseWarnings++;e.lastChangeDay=day;w.counters.ecosystemWarnings++;
   event(w,{day,region:r.id,subject:'habitat',text:`Naturalists warn of mounting habitat stress in ${r.name}; migration routes may change.`,channel:'field notice',releaseDay:day+4,severity:'warning'});}
 }
  // Physically limited local plants replenish only as living ecology permits.
 regrowGatheringSites(w,day);
 // Existing local provisioner independently attempts resupply as the world
 // changes; money and physical stock move even if the player never shops.
 restockLocalProvisioner(w,day);
 // Authentically handed-over provisions remain the other person's goods.
 // Their independent use of real food is not a gift-triggered player reward.
 require('../rules/material-handoffs').sixday(w,day);
 // Independent sixday field publications occur after actual ecological change,
 // even if the player is nowhere near the guild.
 // Previously authorised crews first encounter the living site; a crew
 // never arrives in the same sixday that its appointment was approved.
 GuildFieldwork.inspect(w,day,()=>random(w),v=>event(w,v));
 GuildFieldwork.review(w,day,v=>event(w,v));
 GuildFieldwork.seed(w,day);
 // Public news is scarce. Most world fluctuations are not plot events.
 if(current.activeWars>0&&w.ticks.sixdays%10===0)event(w,{day,region:'international',subject:'conflict',text:'Trade couriers report continued pressure from distant border conflicts.',channel:'courier',releaseDay:day+14,severity:'warning'});
}
function tickMonth(w,day){
 Mythic.tick(w,day,{phase:'month',event:e=>event(w,e)});
 w.ticks.months++;
 N.update(w,day,()=>random(w),v=>event(w,v));
 Gov.ensure(w);
 for(const route of A.tradeRoutes){const v=w.routes[route.id],d=Object.values(w.diplomacy).find(x=>(x.a===route.a&&x.b===route.b)||(x.a===route.b&&x.b===route.a));
  const war=d?.status==='war';const strain=d?.status==='strained';
  const badWeather=noise(w,0,10)>7;const prior=v.disrupted;
  v.risk=clamp(v.risk+noise(w,-5,5)+(war?8:strain?2:0),0,100);
  v.disrupted=war||(v.risk>80&&badWeather);
  v.flow=clamp(route.capacity+noise(w,-9,9)-(strain?8:0)-(v.disrupted?50:0),0,100);
  if(prior!==v.disrupted)event(w,{day,region:route.a,subject:route.id,text:`${route.mode} between ${A.P[route.a].name} and ${A.P[route.b].name} ${v.disrupted?'faces a serious disruption':'reopens for ordinary trade'}.`,channel:'merchant bulletin',releaseDay:day+6,severity:'important'});
 }
 for(const p of A.polities){const c=w.countries[p.id],ix=w.market[p.id];
  const routes=A.tradeRoutes.filter(r=>r.a===p.id||r.b===p.id);const supply=routes.reduce((n,r)=>n+w.routes[r.id].flow,0)/(routes.length||1);
  for(const type of Object.keys(ix)){
   const supported=p.resources.includes(type)||p.resources.includes('trade')||p.resources.includes('medicine')&&type==='medicine';
   const shortage=!supported&&supply<42?0.05:0;
   const demand=c.prosperity>72?0.02:c.prosperity<25?-0.02:0;
   const shock=type==='feed'&&Object.values(w.ecosystems).some(e=>e.quality<20)?0.03:0;
   ix[type]=Math.round(clamp(ix[type]+noise(w,-3,3)/100+shortage+demand+shock,0.6,3.5)*100)/100;
  }
  const had=c.stability<23&&c.legitimacy<27;
  c.stressMonths=had?c.stressMonths+1:Math.max(0,c.stressMonths-1);
  c.rulerTenure++;
  const legalTerm=Gov.terms(p.government),hereditary=Gov.royalID(p.id);
  // A sovereign does not die, abdicate or transmit a throne every fifteen
  // years merely because an old prototype reused an assembly term timer.
  // Court reviews publish NO automatic new ruler, heir or bloodline.
  if(hereditary&&c.rulerTenure%180===0)
   Gov.review(w,p.id,day,v=>event(w,v));
  let routine=false;
  if(!hereditary&&c.rulerTenure>=legalTerm){
   c.rulerTenure=0;c.cycle++;routine=true;
   Gov.transition(w,p.id,day,{random:()=>random(w),emit:v=>event(w,v)});
  }
  // Independent sustained political stress can cause a caretaker mandate or
  // publicly observed constitutional court review, never invisible instant
  // inheritance, a player-chosen king, or a free martial bloodline.
  if(!routine&&c.stressMonths>=6&&c.rulerTenure>=24){
   c.stressMonths=0;
   c.legitimacy=Math.max(45,c.legitimacy);
   c.stability=Math.max(40,c.stability);
   if(hereditary)Gov.crisisReview(w,p.id,day,v=>event(w,v));
   else{
    c.rulerTenure=0;c.cycle++;
    Gov.transition(w,p.id,day,{crisis:true,random:()=>random(w),emit:v=>event(w,v)});
   }
  }else if(hereditary){
   Gov.recover(w,p.id,day,v=>event(w,v));
  }
 }
 for(const [key,d] of Object.entries(w.diplomacy)){
  const a=w.countries[d.a],b=w.countries[d.b],rivals=A.P[d.a].rival===d.b||A.P[d.b].rival===d.a;
  const old=d.status;
  const economic=(a.prosperity<30||b.prosperity<30)?1:0;
  const warfare=d.status==='war';
  const friendly=!rivals&&a.prosperity>40&&b.prosperity>40?-2:0;
  d.tension=clamp(d.tension+noise(w,-4,4)+(rivals&&w.ticks.months%3===0?1:0)+economic+friendly-(warfare?2:0));
  if(d.cooldown)d.cooldown--;
  if(!warfare){a.warExhaustion=Math.max(0,a.warExhaustion-1);b.warExhaustion=Math.max(0,b.warExhaustion-1);}
  if(warfare){d.conflictMonths++;a.warExhaustion++;b.warExhaustion++;
   a.treasury=clamp(a.treasury-2);b.treasury=clamp(b.treasury-2);
   a.stability=clamp(a.stability-1);b.stability=clamp(b.stability-1);
   if(d.tension<53||d.conflictMonths>=24||a.warExhaustion>35||b.warExhaustion>35){d.status='truce';d.cooldown=48;d.conflictMonths=0;d.tension=Math.min(d.tension,37);w.counters.peaceTreaties++;}
  }else if(!d.cooldown){
   if(d.tension>93&&rivals&&d.status!=='truce'&&d.cooldown===0){d.status='war';d.conflictMonths=0;w.counters.wars++;}
   else if(d.tension>68)d.status='strained';
   else if(d.tension<29)d.status='cooperation';
   else if(d.status==='truce'&&d.tension<62)d.status='peace';
   else if(d.status==='cooperation'&&d.tension>45)d.status='peace';
  }
  if(old!==d.status){const names=`${A.P[d.a].name} and ${A.P[d.b].name}`;
   const txt=d.status==='war'?`${names} enter an armed border conflict after escalating territorial disputes.`:
    d.status==='truce'?`${names} sign an exhausted ceasefire, with trade still restricted.`:
    d.status==='cooperation'?`${names} broaden a trade and mutual-aid accord.`:
    d.status==='strained'?`${names} suspend some joint passage arrangements amid rising tensions.`:
    `${names} return to uneasy peacetime negotiations.`;
   event(w,{day,region:'international',subject:key,text:txt,channel:'foreign courier',releaseDay:day+14,severity:d.status==='war'?'warning':'important'});
  }
 }
 // Migration uses neighbouring habitats that genuinely support the same lineage.
 // Populations move; they do not appear from nowhere when a new scene starts.
 for(const r of A.regions){
  const source=w.ecosystems[r.id];
  for(const neighborId of r.neighbors||[]){
   const dest=w.ecosystems[neighborId];if(!dest)continue;
   // Choose only one direction for each neighbour pair per month.
   if(r.id>=neighborId)continue;
   for(const [family,herd] of Object.entries(source.indicators)){
    const second=dest.indicators[family];if(!second)continue;
    const pressureDifference=source.forage-dest.forage;
    const weatherShift=noise(w,-2,2);
    const transfer=Math.max(0,Math.min(4,Math.floor((Math.abs(pressureDifference)+Math.max(0,weatherShift))/15)));
    if(!transfer)continue;
    if(pressureDifference< -8&&herd.population>transfer){herd.population-=transfer;second.population+=transfer;source.seasonalMovement+=transfer;}
    else if(pressureDifference>8&&second.population>transfer){second.population-=transfer;herd.population+=transfer;dest.seasonalMovement+=transfer;}
   }
  }
 }
 // Recognise seasonal migrations without creating millions of individual beasts.
 for(const r of A.regions){const e=w.ecosystems[r.id];e.seasonalMovement=Math.max(0,Math.round(e.seasonalMovement));
  if(e.quality<25&&day-e.lastChangeDay>180){e.lastChangeDay=day;event(w,{day,region:r.id,subject:'migration',text:`A local survey notes unusually few seasonal beast tracks across ${r.name}.`,channel:'field notice',releaseDay:day+6,severity:'warning'});}
 }
 // An actual season or festival date can be announced only once a campaign
 // calendar anchor has been sourced. Never use Jory's dates for Aerin.
 if(w.calendarAnchor){
  const W=require('../rules/world'),d=W.addDate(w.calendarAnchor.date,day-1-w.calendarAnchor.atCompletedDay);
  const season=d.month===13||[1,2,11,12].includes(d.month)?'winter':d.month<=4?'spring':d.month<=7?'summer':'autumn';
  if(d.day===30 || d.month===13){
   for(const f of A.festivals){if(f.season!==season)continue;
    const nations=A.polities.filter(p=>p.culture===f.culture);
    for(const nation of nations){
     event(w,{day,region:nation.id,subject:'festival',text:`${nation.name} prepares ${f.name}: ${f.purpose}.`,channel:'public notice',releaseDay:day,severity:'routine'});
    }
   }
  }
 }
 Houses.month(w,day,v=>event(w,v));
 FamilyMembers.month(w,day,v=>event(w,v));
 AgentInitiatives.month(w,day,v=>event(w,v));
 EmergentGroups.syncWorkerFounders(w,day,v=>event(w,v));
 EmergentGroups.month(w,day,v=>event(w,v));
 PersonPresence.plan(w,day);
 GroupMemberAgency.month(w,day,v=>event(w,v));
 KnowledgeDiffusion.month(w,day,v=>event(w,v));
 AdaptiveAmbitions.month(w,day,v=>event(w,v));
}
function tick(s,weekDays=[],monthDays=[]){
 if(!weekDays.length&&!monthDays.length)return {sixdays:0,months:0,publicNotices:[]};
 const w=ensure(s,{startDay:Math.min(...weekDays,...monthDays)-1}),we=new Set(weekDays),mo=new Set(monthDays),times=[...new Set([...we,...mo])].sort((a,b)=>a-b);
 let nW=0,nM=0;
 for(const day of times){if(day<=w.lastTickDay)continue;
  if(we.has(day)){tickSixday(w,day);Houses.deliver(s,w,day,()=>random(w));Civic.review(s,w,day,()=>random(w),v=>event(w,v));PublicHearings.review(s,w,day,()=>random(w),v=>event(w,v));Mediation.review(s,w,day,()=>random(w),v=>event(w,v));ProfessionalPeers.tick(w,day,v=>event(w,v));
   // Per-individual wildlife acts against the ecology at THIS specific day,
   // not the future conditions at the end of a multi-month time jump.
   WildLives.sixday(s,[day]);
   // Relationship decisions follow genuine individual movement in the
   // same sixday; no remote animal location is disclosed to the player.
   WildRelations.sixday(s,day);
   // Births arise only from source-backed, independently lived encounters,
   // after real habitat changes; no newborn is automatically player-known.
   WildGenerations.sixday(s,day);
   // Only actually encountered sapient beast PERSONS have personal ledgers.
   // Independence, concrete accomplishments and consent matter; time alone
   // never confers expertise or invents a population or beast society.
   SapientBeasts.sixday(s,day);
   // New individuals can arise from real ecological/economic work demand
   // anywhere in the known simulated geography, without player observation.
   // Their independent decisions are dated and source-bound.
   EmergentPeople.sixday(s,w,day);
   // People with genuine overlapping work-shift witnesses may freely meet
   // and share limited ordinary information without automatic teaching.
   IndependentContacts.sixday(w,day);nW++;}
  if(mo.has(day)){tickMonth(w,day);nM++;}
  w.lastTickDay=day;
 }
 const local=polityOf(s),localReg=locationRegion(s);
 return {sixdays:nW,months:nM,publicNotices:w.chronicle.filter(e=>e.day>times[0]-1&&e.releaseDay<=worldDay(s)&&(e.region===local||e.region===localReg)).slice(-3).map(e=>e.text)};
}
function publiclyAccessible(s,e,channel='local'){
 const day=worldDay(s),reg=locationRegion(s),pol=polityOf(s);
 if(!e.publiclyKnown||e.releaseDay>day)return false;
 if(e.region===reg||e.region===pol)return true;
 if(channel==='courier'||channel==='public bulletin')return e.channel!=='field notice'&&e.channel!=='public notice';
 return false;
}
function publicNews(s,{channel='local',limit=6}={}){
 if(!['local','courier','public bulletin'].includes(channel))throw Error('Unknown in-world news channel');
 num(limit,'news limit',1,20);
 const w=peek(s);return {channel,date:'Day '+(worldDay(s)+1),items:w.chronicle.filter(e=>publiclyAccessible(s,e,channel)).slice(-limit).map(e=>({day:e.day,text:e.text,channel:e.channel,severity:e.severity}))};
}
function publicStatus(s){const w=peek(s),r=A.R[locationRegion(s)],p=A.P[r.polity],eco=w.ecosystems[r.id];
 return {day:worldDay(s)+1,region:r.name,polity:p.name,government:p.government,
  civicOffice:Gov.local(s,w),publicRights:p.rights,
  culture:A.C[p.culture].customs,trade:RANGE_TRADE[r.biome]||'regional trade',season:w.calendarAnchor?calendar(s).season:'Local season unrecorded',
  publicNews:publicNews(s).items,observedSpecies:w.knownSights.filter(x=>x.region===r.id).slice(-4).map(x=>({name:x.name,day:x.day})),
  // No private numerical strengths, hidden clocks, country finances or forecast conflicts.
  knownInstitutions:A.institutions.filter(x=>x.polity===r.polity).slice(0,5).map(x=>x.name),
  renownedPublicInstitutions:Renown.RENOWNED.filter(x=>
    x.polity===r.polity).slice(0,4).map(x=>({
    name:A.I[x.institution].name,publicPurpose:x.publicService,
    relatedHouse:require('./social-houses').byId[x.house].name})),
  sharedLocalMethods:Renown.PUBLIC_METHODS.filter(x=>
    Renown.RENOWNED.some(n=>n.polity===r.polity&&n.institution===x.institution)).
    slice(0,4).map(x=>({name:x.name,path:x.path,knowledgeIsNotMastery:true})),
  knownProfessionals:N.publicKnown(s,w.notables).filter(x=>x.community===p.name).slice(0,4),
  conservationNotice:publicNews(s).items.some(e=>/habitat|beast tracks|migration/i.test(e.text))?'Recent published naturalist warning':'No current public report'};
}
const RANGE_TRADE={wetland:'barge and reed markets',forest:'timber and herbal supply',alpine:'pass goods and quarrying',settlement:'academy services',rift:'restricted survey permits',coast:'maritime shipping',reef:'treaty markets',steppe:'herd caravans',desert:'water and glass routes'};
function publicAtlas(s,{type,id}={}){
 if(!['continent','polity','region','institution','culture','festival'].includes(type))throw Error('Unknown atlas type');
 const row=A.safeLookup(type,id);if(!row)throw Error('Unknown named location or organisation');
 if(type==='polity')return {name:row.name,continent:A.safeLookup('continent',row.continent)?.name,government:row.government,capital:row.capital,culture:A.C[row.culture].name,language:row.language,food:row.food,craft:row.craft,customs:row.customs,rights:row.rights,trade:row.resources,knownPressures:row.contested};
 if(type==='region')return {name:row.name,continent:A.safeLookup('continent',row.continent)?.name,polity:A.P[row.polity]?.name,biome:row.biome,terrain:row.traits,neighbors:row.neighbors||[],dangers:row.dangers,goods:row.goods};
 if(type==='institution')return {name:row.name,type:row.type,location:A.P[row.polity]?.name,knownWork:row.specialty,funding:row.funding,origin:row.roots,
   publiclyKnownMethods:Renown.PUBLIC_METHODS.filter(x=>x.institution===id).
    map(x=>({name:x.name,path:x.path,learningEvidence:x.learning,
     actualProcedureAvailable:!!x.actualRule})),
   publicRenown:Renown.RENOWNED.filter(x=>x.institution===id).
    map(x=>({standing:x.standing,documentedHistory:x.history,
     publiclyAssociatedFamily:require('./social-houses').byId[x.house].name,
     noHereditaryPowerAwarded:true})),
   membershipOrTeachingNotGranted:true};
 return {...row};
}
function publicEconomy(s,{polity=null}={}){
 const w=peek(s),id=polity||polityOf(s);
 if(!A.P[id])throw Error('Unknown nation');
 if(id!==polityOf(s))return {name:A.P[id].name,knownGoods:A.P[id].resources,currentMarket:'No verified local market prices; request a trade report'};
 const data=w.market[id];
 return {name:A.P[id].name,indices:{...data},note:'Regional estimates only, not binding shop quotes; published local market prices require an actual merchant'};
}
function calendar(s){const w=peek(s);const anchor=w.calendarAnchor;
 if(!anchor)return {day:worldDay(s)+1,absoluteDate:null,season:null,note:'No established absolute calendar date in this campaign save; the in-world day counter remains authoritative.'};
 const W=require('../rules/world'),d=W.addDate(anchor.date,worldDay(s)-anchor.atCompletedDay);
 const n=(d.month-1)*30+d.day;
 const season=d.month===13||d.month===1||d.month===2||d.month===11||d.month===12?'winter':d.month<=4?'spring':d.month<=7?'summer':'autumn';
 return {day:worldDay(s)+1,absoluteDate:W.dateText(d),weekday:W.dateWeekday(d),season,anchorSource:anchor.source};
}
function anchorCalendar(s,{date,source}={}){
 if(!safe(source)||!date||typeof date!=='object')throw Error('An established date and specific source are required');
 const W=require('../rules/world');W.dateText(date);
 const w=ensure(s);if(w.calendarAnchor)throw Error('Calendar already anchored; review the ledger rather than changing history');
 w.calendarAnchor={date:{year:date.year,month:date.month,day:date.day},source,atCompletedDay:worldDay(s)};
 return calendar(s);
}
function observe(s,{minutes=30,source='Direct field observation'}={}){
 num(minutes,'observation minutes',1,1440);if(!safe(source))throw Error('Describe the actual observation or survey source');
 const w=ensure(s),reg=A.R[locationRegion(s)];
 if(!reg)throw Error('Unknown local habitat');
 const local=E.LOCATIONS[s.world.location],can=(local?.spawns||[]).filter(x=>E.SPECIES[x]);
 const n=Math.floor(random(w)*0xffffffff), useCanon=can.length>0&&n%5===0;
 const species=useCanon?B.lookup('authored:'+can[n%can.length]):B.sample(reg.biome,n);
 const record={id:species.id,name:species.name,region:reg.id,day:worldDay(s)+1,source:source.slice(0,220),ecologicalRole:species.role,knownForm:species.canonical};
 w.knownSights.push(record);if(w.knownSights.length>120)w.knownSights.splice(0,w.knownSights.length-120);
 E.advance(s,minutes);return {observed:{name:species.name,habitat:reg.name,ecologicalRole:species.role,diet:species.diet,source:record.source},
  id:record.id,observationTimeMinutes:minutes,note:'Observation is not a tame, contract, level gain, identification of all powers or guaranteed combat encounter'};
}
function knownTaxon(s,{id}={}){const w=peek(s),found=w.knownSights.find(x=>x.id===id);if(!found)throw Error('Species has not been identified in this campaign');
 const v=B.lookup(id);return {id:v.id,name:v.name,biome:v.biome,role:v.role,diet:v.diet,taxonomy:v.taxonomy,
  conservation:v.conservation,mechanism:'Not fully characterised without specialist research',knownEvolutionBranches:[]};}
function revealProfessional(s,params){return N.reveal(ensure(s),params);}
function publicProfessionals(s){return {people:N.publicKnown(s,peek(s).notables)};}
function mythicLore(s,{type='site',id,region=null}={}){
 if(type==='site'&&!id)region=region||locationRegion(s);
 return Mythic.publicLore({type,id,region});
}
function revealNews(s,{text,region=locationRegion(s),channel='guild report',source,originDay=worldDay(s),lag=0}={}){
 if(!safe(text)||!safe(source))throw Error('World news needs a concrete established source and text');
 if(!['guild report','courier','public notice','field notice','merchant bulletin','official proclamation'].includes(channel))throw Error('Unsupported disclosure channel');
 num(lag,'publication delay',0,90);num(originDay,'origin day',0,1000000);
 if(!A.R[region]&&!A.P[region]&&region!=='international')throw Error('Unknown news region');
 const w=ensure(s);event(w,{day:originDay,region,subject:'reported',text:text.slice(0,220),channel,releaseDay:originDay+lag});
 return {accepted:true,notice:'Only a documented report, not new secret knowledge',channel};
}
function synopsis(s){const w=peek(s);return {version:w.version,continents:A.continents.length,polities:A.polities.length,institutions:A.institutions.length,regions:A.regions.length,tradeRoutes:A.tradeRoutes.length,
  generatedSpeciesCapacity:B.SPECIES_COUNT,regionalFormCapacity:B.FORM_COUNT,mythicSites:Mythic.SITES.length,mythicTraditions:Mythic.TRADITIONS.length,realmTraditions:Mythic.REALMS.length,backgroundProfessionals:Object.keys(w.notables||{}).length,elapsedSixdayTicks:w.ticks.sixdays,elapsedMonthTicks:w.ticks.months,
  note:'These are configured systems and catalogue capacity; not a claim of personally authored species or full individual-citizen simulation'};}
module.exports={initial,ensure,peek,localProvisioner:s=>localProvisioner(ensure(s),worldDay(s)),gatheringSource,sourceItemAt:location=>GATHER_SOURCES[location]?.item||null,PROPAGATION_ORIGIN,plantingHash,worldDraw:s=>random(ensure(s)),tick,calendar,anchorCalendar,publicAtlas,publicStatus,publicInitiatives:(s,p={})=>{if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)throw Error('Public initiative status accepts no hidden plans, chosen outcomes or remote covert reports');return AgentInitiatives.visible(s,peek(s));},publicDiffusion:(s,p={})=>{if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)throw Error('Knowledge diffusion status accepts no invented sources or remote hidden results');return KnowledgeDiffusion.visible(s,peek(s));},publicAmbitions:(s,p={})=>{if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)throw Error('Public NPC ambition status accepts no chosen outcomes or secret future plans');return AdaptiveAmbitions.visible(s,peek(s));},publicPeers:(s,p={})=>{if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)throw Error('Public peer status accepts no hidden personal intentions or selected relationship outcomes');return ProfessionalPeers.visible(s,peek(s));},publicFamilyMembers:(s,p={})=>{if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)throw Error('Public family-person status accepts no fabricated ancestry, appointed heir or chosen private dispute');return FamilyMembers.publicStatus(s,peek(s));},publicEmergentGroups:(s,p={})=>{if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)throw Error('Association status cannot be used to invent members, office or heritage');return EmergentGroups.visible(s,peek(s));},publicGovernment: (s,p={})=>{if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)throw Error('Local government status accepts no forged ruler, sovereign claims or selected remote offices');return Gov.local(s,peek(s));},publicNews,publicEconomy,observe,knownTaxon,revealNews,publicProfessionals,revealProfessional,mythicLore,synopsis,
 // testing/GM diagnostics only; never pass hidden state to player-facing panels.
 _debug:{tickMonth,tickSixday,noise,quickContext}};