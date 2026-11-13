'use strict';
// Foundation-first, reusable causal individual creation and lived experience.
// These are newly emerging *individual agents*, not a simulated census.
// No compulsory family, teacher, caste, sex, magic rank or institutional place.
const Crypto=require('node:crypto'),Atlas=require('./atlas'),
 Engine=require('../engine.js'),Careers=require('./person-careers');
const ORIGIN='causal-world-person-v1',SHIFT='emergent-local-work-presence-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const clamp=(n,a=0,b=100)=>Math.min(b,Math.max(a,n));
const DAY=1440,MINUTES=14;
function draw(t){
 let x=t.rngState>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 t.rngState=(x>>>0)||0x91e10da5;
 return t.rngState/4294967296;
}
// Reuse the SAME independently living person's RNG and actual conditions
// when a verified local public invitation asks whether they are interested.
// This is NOT entry consent, future attendance, service, sponsorship or
// a performance. The original public-event source belongs to its caller.
const PUBLIC_INVITE='independent-person-public-activity-interest-v1';
function nextRng(n){
 let x=n>>>0;
 x^=x<<13;x^=x>>>17;x^=x<<5;
 return (x>>>0)||0x91e10da5;
}
function verifyPublicInvitationChoice(q){
 if(!q||q.origin!==PUBLIC_INVITE||
  !/^[a-f0-9]{64}$/.test(q.personOriginHash||'')||
  !/^[a-f0-9]{64}$/.test(q.activityHash||'')||
  !Number.isInteger(q.rngBefore)||q.rngBefore<1||
  !Number.isInteger(q.rngAfter)||q.rngAfter<1||
  q.rngAfter!==nextRng(q.rngBefore)||
  !Number.isInteger(q.fatigue)||q.fatigue<0||q.fatigue>100||
  !['active','recovering','relocated'].includes(q.status)||
  !['curious','steady','independent','reserved'].includes(q.personality)||
  typeof q.interested!=='boolean'||q.notRegistration!==true)
  return false;
 const base=q.personality==='curious'?.67:q.personality==='independent'?.48:
  q.personality==='reserved'?.43:.57,
  chance=Math.max(.08,Math.min(.75,base-q.fatigue/350));
 return q.interested===(q.status==='active'&&q.fatigue<=76&&
  q.rngAfter/4294967296<chance);
}
function considerPublicInvitation(w,p,activityHash){
 if(!/^[a-f0-9]{64}$/.test(activityHash||'')||!verify(w,p)||
  !Number.isInteger(p.rngState)||p.rngState<1)
  throw Error('A source-backed public invitation and genuine living individual are necessary');
 const rngBefore=p.rngState,fatigue=p.fatigue,status=p.status,
  personality=p.personality;
 // Advance this individual's original RNG ONCE, not the player's dice and
 // not a shared deterministic decree that every citizen must participate.
 draw(p);
 const q={origin:PUBLIC_INVITE,personOriginHash:p.originHash,
  activityHash,rngBefore,rngAfter:p.rngState,fatigue,status,personality,
  interested:false,notRegistration:true};
 const base=personality==='curious'?.67:personality==='independent'?.48:
  personality==='reserved'?.43:.57,
  chance=Math.max(.08,Math.min(.75,base-fatigue/350));
 q.interested=status==='active'&&fatigue<=76&&p.rngState/4294967296<chance;
 if(!verifyPublicInvitationChoice(q))
  throw Error('The independent person invitation decision cannot be reconstructed');
 return {interested:q.interested,source:q};
}
// Actual entry is a later individual decision, not a retroactive
// conversion of interest into consent. The original person's RNG is owned
// only by that person; there is no new tournament RNG.
const PUBLIC_ENTRY='independent-person-open-public-event-entry-v1';
function verifyPublicEventEntryChoice(q){
 if(!q||q.origin!==PUBLIC_ENTRY||
  !/^[a-f0-9]{64}$/.test(q.personOriginHash||'')||
  !/^[a-f0-9]{64}$/.test(q.eventAdmissionHash||'')||
  !Number.isInteger(q.rngBefore)||q.rngBefore<1||
  !Number.isInteger(q.rngAfter)||q.rngAfter<1||
  q.rngAfter!==nextRng(q.rngBefore)||
  !Number.isFinite(q.fatigue)||q.fatigue<0||q.fatigue>100||
  !['active','recovering','relocated'].includes(q.status)||
  !['curious','steady','independent','reserved'].includes(q.personality)||
  typeof q.consentsToEnter!=='boolean'||
  q.noCompulsoryEntry!==true||q.noOfficialRankOrPrize!==true)
  return false;
 const base=q.personality==='curious'?.64:
  q.personality==='steady'?.60:
  q.personality==='independent'?.43:.35;
 const chance=Math.max(.07,Math.min(.76,base-q.fatigue/300));
 return q.consentsToEnter===(q.status==='active'&&q.fatigue<76&&
  q.rngAfter/4294967296<chance);
}
function considerPublicEventEntry(w,p,eventAdmissionHash){
 if(!/^[a-f0-9]{64}$/.test(eventAdmissionHash||'')||
  !verify(w,p)||!Number.isInteger(p.rngState)||p.rngState<1)
  throw Error('Only a verified independent present person and real public entry terms may be considered');
 const rngBefore=p.rngState,personality=p.personality,
  fatigue=p.fatigue,status=p.status;
 draw(p);
 const base=personality==='curious'?.64:
  personality==='steady'?.60:
  personality==='independent'?.43:.35;
 const chance=Math.max(.07,Math.min(.76,base-fatigue/300));
 const q={origin:PUBLIC_ENTRY,personOriginHash:p.originHash,
  eventAdmissionHash,rngBefore,rngAfter:p.rngState,
  personality,fatigue,status,consentsToEnter:
  status==='active'&&fatigue<76&&p.rngState/4294967296<chance,
  noCompulsoryEntry:true,noOfficialRankOrPrize:true};
 if(!verifyPublicEventEntryChoice(q))
  throw Error('The independent person event entry choice cannot be verified');
 return {consentsToEnter:q.consentsToEnter,source:q};
}
function seed(w){
 return {version:1,rngState:((w.worldSeed^0x4bc771ae)>>>0)||0x91e10da5,
  counter:0,lastSixday:-1,people:{},history:[]};
}
function ensure(w){
 if(w.emergentPeople===undefined)w.emergentPeople=seed(w);
 const t=w.emergentPeople;
 if(t?.version!==1||!Number.isInteger(t.counter)||t.counter<0||
  !Number.isInteger(t.lastSixday)||!Number.isInteger(t.rngState)||
  !t.people||typeof t.people!=='object'||Array.isArray(t.people)||
  !Array.isArray(t.history))throw Error('The independent people ledger is invalid');
 return t;
}
function sourceDemand(w,reg){
 const host=w.countries?.[reg.polity],eco=w.ecosystems?.[reg.id],
  polity=Atlas.P[reg.polity];
 if(!host||!eco||!polity||!['quality','pressure','water','forage'].every(k=>
   Number.isFinite(eco[k])&&eco[k]>=0&&eco[k]<=100)||
   !Number.isFinite(host.stability)||!Number.isFinite(host.prosperity)||
   !Array.isArray(reg.goods)||!reg.goods.length)return null;
 // These are concrete local needs, not a hard-coded roster of professions.
 const deficit=eco.quality<48||eco.pressure>64;
 const care=host.stability<46;
 const shortages=eco.forage<43||eco.water<43;
 const good=reg.goods[Math.floor((w.worldSeed+reg.id.length)%reg.goods.length)];
 const demand=deficit?'habitat-care':care?'community-relief':
  shortages?'local-provisioning':host.prosperity>47?'livelihood-work':null;
 if(!demand)return null;
 return {kind:demand,regionId:reg.id,polity:reg.polity,
  language:polity.language,good,localName:reg.name,
  evidence:{ecological:{quality:eco.quality,pressure:eco.pressure,
   water:eco.water,forage:eco.forage},
   civic:{stability:host.stability,prosperity:host.prosperity},
   regionalGoods:reg.goods.slice(),regionBiome:reg.biome}};
}
function role(d){
 const good=d.good.replace(/_/g,' ');
 switch(d.kind){
  case 'habitat-care':return {profession:d.localName+' habitat worker',
   purpose:'Reduce ecological harm and monitor habitat changes around '+d.localName};
  case 'community-relief':return {profession:good+' relief organiser',
   purpose:'Coordinate everyday '+good+' needs through real local cooperation'};
  case 'local-provisioning':return {profession:good+' supply worker',
   purpose:'Find safe supplies of '+good+' under local scarcity'};
  default:return {profession:good+' craft and trade worker',
   purpose:'Develop a sustainable livelihood around '+good+' and local trade'};
 }
}
function name(t,language,region){
 const starts=['b','br','c','d','f','g','h','j','k','l','m','n','p','r','s','sh','t','th','v','w','z'],
  vowels=['a','e','i','o','u','ae','ia','ei','ou','ai'],
  tails=['n','r','s','l','m','v','th','nd','ra','en','in','os','a','e'];
 const salt=Crypto.createHash('sha256').update(language+'|'+region).digest()[0];
 const a=starts[(Math.floor(draw(t)*starts.length)+salt)%starts.length],
  b=vowels[Math.floor(draw(t)*vowels.length)],
  c=tails[Math.floor(draw(t)*tails.length)];
 return (a+b+c).replace(/^./,x=>x.toUpperCase());
}
function verify(w,p){
 if(!p||p.origin!==ORIGIN||typeof p.id!=='string'||
  p.actorId!=='emergent:'+p.id||p.originHash!==hash(p.birthSource)||
  p.birthSource?.origin!==ORIGIN||p.birthSource?.id!==p.id||
  !Atlas.R[p.birthSource.regionId]||!Atlas.P[p.birthSource.polity]||
  Atlas.R[p.birthSource.regionId].polity!==p.birthSource.polity||
  !Number.isInteger(p.birthSource.day)||p.birthSource.day<0||
  typeof p.name!=='string'||p.name.length<4||
  !['active','recovering','relocated'].includes(p.status)||
  !Number.isInteger(p.lastTickDay)||p.lastTickDay<p.birthSource.day||
  !Atlas.R[p.regionId]||!Array.isArray(p.history)||
  p.history.length>24||
  !Number.isFinite(p.funds)||p.funds<0||p.funds>100||
  !Number.isInteger(p.cashScales??0)||p.cashScales<0||
  p.cashScales>1000000000||
  !Number.isFinite(p.fatigue)||p.fatigue<0||p.fatigue>100||
  !Number.isInteger(p.rngState)||p.rngState<1||
  !Careers.verify(p)||
  typeof p.profession!=='string'||p.profession.length<5||
  typeof p.purpose!=='string'||p.purpose.length<15)return false;
 return true;
}
function make(w,t,day,d){
 const id='person_'+(++t.counter),work=role(d);
 const language=d.language,nm=name(t,language,d.regionId);
 const origin={origin:ORIGIN,id,regionId:d.regionId,polity:d.polity,
  day,need:d.kind,demandEvidenceHash:hash(d),
  initialProfession:work.profession,localGoods:d.evidence.regionalGoods,
  language,nonAssumedKinship:true,noInheritedRanks:true};
 const personalSeed=(Crypto.createHash('sha256').update(
  w.worldSeed+'|'+id+'|'+hash(origin)+'|life-v1').digest().readUInt32BE(0))||0x91e10da5;
 const p={id,actorId:'emergent:'+id,origin:ORIGIN,
  birthSource:origin,originHash:hash(origin),
  name:nm+' of '+d.localName,
  regionId:d.regionId,polity:d.polity,language,
  profession:work.profession,purpose:work.purpose,
  status:'active',ageBand:'adult, exact birthday not established',
  family:null,ancestry:null,inheritance:null,
  practicedDisciplines:[],knownTechniques:[],
  funds:10+Math.floor(draw(t)*23),cashScales:0,
  fatigue:Math.floor(draw(t)*16),
  competence:1,personality:['reserved','curious','steady','independent'][
   Math.floor(draw(t)*4)],
  rngState:personalSeed,lastTickDay:day,shift:null,
  history:[{day,type:'life-start',regionId:d.regionId,
   cause:d.kind,demandEvidenceHash:origin.demandEvidenceHash,observed:false}]};
 p.career=Careers._debug.initial(p);
 if(!verify(w,p))throw Error('Cannot create an inconsistent living individual');
 t.people[id]=p;
 t.history.push({day,kind:'emergence',personId:id,
  originHash:p.originHash,regionId:d.regionId});
 if(t.history.length>120)t.history.shift();
 return p;
}
function siteFor(regionId){
 const reg=Atlas.R[regionId];
 if(!reg)return null;
 return (reg.loc||[]).find(loc=>
  Engine.LOCATIONS[loc]&&Atlas.LOCATION_REGION[loc]===regionId)||null;
}
function shift(p,day){
 const site=siteFor(p.regionId);
 if(!site||p.status!=='active')return null;
 const body={source:SHIFT,npcId:p.actorId,actorId:p.actorId,
  personId:p.id,name:p.name,profession:p.profession,polity:p.polity,
  originHash:p.originHash,location:site,
  scheduledAtDay:day,fromDay:day,throughDay:day+5};
 return {...body,hash:hash(body)};
}
function presence(w,id,location,day){
 if(typeof id!=='string'||!id.startsWith('emergent:')||
  !Engine.LOCATIONS[location]||!Number.isInteger(day))return null;
 const p=w.emergentPeople?.people?.[id.slice('emergent:'.length)];
 if(!verify(w,p)||p.actorId!==id||p.status!=='active')return null;
 const sh=p.shift;
 if(!sh||sh.source!==SHIFT||sh.npcId!==id||
  sh.actorId!==id||sh.personId!==p.id||sh.name!==p.name||
  sh.profession!==p.profession||sh.originHash!==p.originHash||
  sh.location!==location||sh.polity!==p.polity||
  sh.fromDay>day||sh.throughDay<day||
  sh.throughDay-sh.fromDay!==5||
  sh.scheduledAtDay!==sh.fromDay||sh.fromDay>p.lastTickDay||
  siteFor(p.regionId)!==location)return null;
 const {hash:seal,...body}=sh;
 return hash(body)===seal?structuredClone(sh):null;
}
function live(w,p,day){
 if(!verify(w,p))throw Error('Unverified independent person cannot act');
 if(p.lastTickDay>=day)return;
 const eco=w.ecosystems[p.regionId],host=w.countries[p.polity],
  region=Atlas.R[p.regionId];
 if(!eco||!host)throw Error('Living people require actual home ecology and polity');
 const x=p.status==='recovering'?null:draw(p),pressure=eco.pressure>74||eco.quality<28||
  host.stability<28;
 let choice,jobOutcome=null;
 if(p.status==='recovering'){
  // The original real-work strain uses the SAME fatigue and presence state.
  // It heals with actual elapsed sixday world time, not an invented clinic,
  // second injury pool, mandatory fixed course or automatic employment.
  p.fatigue=clamp(p.fatigue-22);
  if(p.fatigue<=55)p.status='active';
  choice='physical-recovery-from-work';
 }else if(p.fatigue>73){
  p.fatigue=clamp(p.fatigue-20);choice='rest-and-recover';
 }else if(pressure&&x<.40){
  const neighbors=(region.neighbors||[]).filter(n=>
   Atlas.R[n]&&Atlas.R[n].polity===p.polity&&
   w.ecosystems?.[n]?.quality>eco.quality);
  if(neighbors.length){
   const next=neighbors[Math.floor(draw(p)*neighbors.length)];
   p.regionId=next;p.status='relocated';choice='voluntarily-relocate';
  }else{p.funds=clamp(p.funds-2);choice='seek-safe-work';}
 }else if(host.prosperity>40&&x<.72){
  // Work actually resolves against the local problem with the person's own
  // skill, potential and independent RNG. Simply reaching another sixday
  // creates NO professional PP, experience, rank, Circle or magical technique.
  jobOutcome=Careers.work(w,p,day);
  choice='livelihood-work';
 }else{
  p.funds=clamp(p.funds-1);
  p.fatigue=clamp(p.fatigue-3);
  choice='independent-priorities';
 }
 if(p.status==='relocated'&&choice!=='voluntarily-relocate')
  p.status='active';
 p.lastTickDay=day;
 p.shift=shift(p,day);
 p.history.push({day,type:'independent-life',choice,
  regionId:p.regionId,
  ...(jobOutcome?{professionalWorkHash:jobOutcome.receiptHash,
   actualResult:jobOutcome.success?'completed':'attempted'}:{}),
  observed:false});
 if(p.history.length>24)p.history.shift();
}
function sixday(s,w,day){
 if(!Number.isInteger(day)||day<0)throw Error('A real completed sixday is required for individual person lives');
 const t=ensure(w);
 if(t.lastSixday>=day)return {created:0,updated:0};
 let updated=0;
 for(const p of Object.values(t.people)){live(w,p,day);updated++;}
 // An emerging person has a local economic/ecological cause. Select across
 // ALL supported regions independently of the player's location. This is
 // not a fixed population count; it models key individuals whose actions
 // become materially relevant in world history.
 const reg=Atlas.regions[Math.floor(draw(t)*Atlas.regions.length)],
  d=sourceDemand(w,reg);
 let created=0;
 if(d){
  const local=Object.values(t.people).filter(x=>
   x.regionId===reg.id&&x.status!=='recovering').length;
  const economicScope=clamp((w.countries[reg.polity].prosperity+
   w.ecosystems[reg.id].pressure)/30,1,9);
  // This scales meaningful new key-person emergence to continuing local
  // needs, but NEVER declares a region full or caps its population/roles.
  // More active workers make another similarly situated arrival less likely.
  const need=Math.max(1,Math.round(economicScope+
   (d.kind==='habitat-care'?2:0))),
   likelihood=clamp((d.kind==='habitat-care'?.87:.68)*
    (need/(need+local*.6)),.06,.92);
  if(draw(t)<likelihood){
   const p=make(w,t,day,d);p.shift=shift(p,day);created=1;
  }
 }
 t.lastSixday=day;
 return {created,updated};
}
function heardStatus(s,w){
 const records=s.table?.emergentConversations?.records||[];
 if(!Array.isArray(records))throw Error('Invalid personally witnessed conversation history');
 return {knownPeople:records.slice(-25).map(r=>({
  npcId:r.npcId,name:r.name,profession:r.profession,
  lastMetAt:r.location,day:r.day,heard:r.heard,
  ...(r.question?{asked:r.question,answerKind:r.answerKind}:{} )
 })),note:'Only what was witnessed personally is known. An absent person’s location, finances, personal choices and heritage remain private.'};
}
// Compose a *person's* bounded public answer from actual existing biography,
// working circumstances, region and culture. Their polity is background,
// NOT a template for belief, ethics, temperament or automatic agreement.
function localReply(s,p,question){
 const q=question.toLowerCase(),home=Atlas.R[p.birthSource.regionId],
  culture=Atlas.C[Atlas.P[p.birthSource.polity]?.culture],
  loc=Engine.LOCATIONS[s.world.location];
 const voice={
  reserved:'I can tell you this much. ',
  curious:'What brought you to ask? ',
  steady:'Here is what I know. ',
  independent:'I can speak for myself, at least. '
 }[p.personality]||'';
 const lowerFirst=x=>x[0].toLowerCase()+x.slice(1);
 if(/\b(?:road|roads|route|routes|path|paths|directions|where can i go)\b/.test(q))
  return {kind:'public-routes',spoken:voice+'The known paths from '+
   loc.name+' lead to '+loc.exits.map(id=>Engine.LOCATIONS[id].name).join(', ')+
   '. A road is not a promise of safe passage.',
   source:'Public routes of the currently witnessed local scene'};
 if(/\b(?:language|tongue|speech|dialect)\b/.test(q))
  return {kind:'individual-language',spoken:voice+
   'The language recorded in the place where my work began is '+p.language+
   '. That tells you nothing certain about another person.',
   source:'Individual established spoken language and origin'};
 if(/\b(?:custom|customs|tradition|traditions|culture|festival|home|homeland|from originally)\b/.test(q)&&
    home&&culture)
  return {kind:'home-culture',spoken:voice+
   'Around '+home.name+', '+lowerFirst(culture.customs)+' '+
   'That is a regional custom, not a rule for how every person there thinks.',
   source:'Published regional customs of '+culture.name+' and this person’s established place of origin'};
 if(/\b(?:work|working|job|profession|livelihood|task|need|needs|concern|concerns|craft|trade|help)\b/.test(q))
  return {kind:'individual-work',spoken:voice+
   'My work here is '+p.profession+'. I am trying to '+
   lowerFirst(p.purpose).replace(/[.!?]+$/,'')+
   '. That is the work I can speak for, not an offer or a promise.',
   source:'This individual’s causally established occupation and present purpose'};
 if(/\b(?:weather|rain|mist|wind)\b/.test(q))
  return {kind:'observed-weather',spoken:voice+
   'From here, the weather is '+s.world.weather+'.',
   source:'Actually observable local weather at the active scene'};
 return {kind:'unverified',spoken:voice+
  'I would rather not give you an answer I cannot substantiate. You can ask what I have actually seen here.',
  source:'No individual witnessed evidence supports a specific answer'};
}
function meet(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
  Object.keys(params).sort().join('|')!=='npcId|question'||
  typeof params.npcId!=='string'||typeof params.question!=='string'||
  params.question.trim().length<5||params.question.length>600)
  throw Error('An in-person conversation requires a real local person and a player-authored question, not chosen answers or consent');
 if(s.battle||s.encounter)throw Error('Resolve actual immediate encounters before a considered local conversation');
 if(s.table?.combatants?.player?.status&&s.table.combatants.player.status!=='ok')
  throw Error('An incapacitated character cannot hold this conversation');
 const w=require('./simulation').peek(s),now=Math.floor(s.world.minutes/DAY),
  sh=presence(w,params.npcId,s.world.location,now),
  p=w.emergentPeople?.people?.[params.npcId.slice(9)];
 if(!sh||!p||!verify(w,p))
  throw Error('That person is not independently witnessed as available at the current scene');
 const records=s.table?.emergentConversations?.records||[];
 if(!Array.isArray(records))
  throw Error('Invalid personally witnessed conversation history');
 const question=params.question.trim(),today=records.filter(r=>
  r.npcId===p.actorId&&r.day===now);
 if(s.table?.emergentConversations?.lastByDay?.[p.id]===now&&!today.length)
  throw Error('An earlier conversation has no intact witness; cannot reroll the person’s decision');
 const repeated=today.find(r=>r.question===question);
 if(repeated)
  return {met:true,npcId:p.actorId,name:p.name,profession:p.profession,
   spoke:repeated.spoke??true,heard:repeated.heard,
   answerKind:repeated.answerKind||'earlier-witnessed',
   message:p.name+' already gave this answer; no new exchange occurred.',
   alreadyAsked:true,minutes:0,noRoll:true,
   noAutomaticTeaching:true,noContract:true,noCompulsoryFees:true};
 const recent=today.at(-1);
 // A new subject is legitimate; it is not a new roll to coerce someone who
 // already declined the same meeting. The existing direct witness owns consent.
 let earlierAgreed=recent?.spoke;
 if(recent&&typeof earlierAgreed!=='boolean'){
  const event=s.log.find(e=>hash(e)===recent.eventHash&&
   e.details?.origin==='emergent-person-local-conversation');
  earlierAgreed=event?.details?.independentlyAgreed;
  if(typeof earlierAgreed!=='boolean')
   throw Error('Earlier individual conversation has no valid independent decision witness');
 }
 if(recent&&earlierAgreed===false)
  return {met:true,npcId:p.actorId,name:p.name,profession:p.profession,
   spoke:false,heard:recent.heard,answerKind:'declined',
   message:p.name+' has already declined further conversation under these circumstances.',
   alreadyDeclined:true,minutes:0,noRoll:true,
   noAutomaticTeaching:true,noContract:true,noCompulsoryFees:true};
 const duration=recent?6:MINUTES,minute=s.world.minutes%DAY;
 if(minute<8*60||minute+duration>18*60)
  throw Error('The person is not currently available for a conversation during this witnessed shift');
 const strained=p.fatigue>66||w.countries[p.polity].stability<27,
  cooperative=recent?true:draw(p)<(strained?.38:.74),
  grounded=cooperative?localReply(s,p,question):null,
  heard=grounded?.spoken||
   'I have responsibilities to attend to and cannot discuss this just now.',
  answerKind=grounded?.kind||'declined';
 const old=s.world.minutes,Core=require('../rules/core'),
  Time=require('../rules/world'),Health=require('../rules/unified');
 Engine.advance(s,duration);Time.finalizeTime(s,old);
 Health.sync(s,{source:'legacy'});
 const witnessed={origin:'emergent-person-local-conversation',
  npcId:p.actorId,personId:p.id,name:p.name,profession:p.profession,
  presence:sh,location:s.world.location,day:now,
  question,answerKind,answerSource:grounded?.source||null,
  independentlyAgreed:cooperative,
  minutes:duration,noInferredKinship:true,noFreePower:true,
  noInventedCultureOrBelief:true,noContract:true};
 Core.event(s,'story',p.name+' responds to a local question: “'+heard+'”',witnessed);
 const entry={npcId:p.actorId,name:p.name,profession:p.profession,
  location:s.world.location,day:now,heard,question,answerKind,
  spoke:cooperative,eventHash:hash(s.log.at(-1)),sourceHash:p.originHash};
 s.table.emergentConversations||={lastByDay:{},records:[]};
 s.table.emergentConversations.lastByDay[p.id]=now;
 s.table.emergentConversations.records.push(entry);
 if(s.table.emergentConversations.records.length>100)
  s.table.emergentConversations.records.shift();
 p.history.push({day:now,type:'personally-witnessed-player-meeting',
  outcome:cooperative?'spoke':'declined',location:s.world.location,
  eventHash:entry.eventHash});
 if(p.history.length>24)p.history.shift();
 return {met:true,npcId:p.actorId,name:p.name,profession:p.profession,
  spoke:cooperative,heard,answerKind,
  message:p.name+' says: “'+heard+'”',
  minutes:duration,noAutomaticTeaching:true,noContract:true,
  noCompulsoryFees:true,noInheritedStatus:true};
}
function observeLocalWork(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
  Object.keys(params).join('|')!=='npcId'||
  typeof params.npcId!=='string')
  throw Error('Only a genuinely present individual may be observed; the player cannot choose rank, results, actions or competence');
 if(s.encounter||s.battle||
  (s.table?.combatants?.player?.status&&
   s.table.combatants.player.status!=='ok'))
  throw Error('Immediate danger or incapacity prevents a calm witnessed work session');
 const day=Math.floor(s.world.minutes/DAY),
  minute=s.world.minutes%DAY;
 if(minute<8*60||minute>17*60+30)
  throw Error('A currently active local shift is needed for observing work');
 const w=require('./simulation').peek(s),
  shift=presence(w,params.npcId,s.world.location,day),
  p=w.emergentPeople?.people?.[params.npcId.slice('emergent:'.length)];
 if(!shift||!p||!verify(w,p))
  throw Error('An actual locally present independent person is required; no remote profession can be summoned');
 const willing=p.fatigue<=75&&draw(p)<(p.personality==='independent'?.58:.78),
  observed=willing?Careers.work(w,p,day,'locally-witnessed-duty'):null,
  publicWork=observed?Careers.publicWitness(observed):{
   day,work:null,goal:null,visibleOutcome:'The person freely chooses not to demonstrate work now.',
   reportedEffects:{environmental:false,civic:false,trade:false},
   noInferredFormalRank:true,noInferredMagicOrFamilyKnowledge:true
  };
 const minutes=willing?30:8,old=s.world.minutes,
  C=require('../rules/core'),Time=require('../rules/world'),
  Health=require('../rules/unified');
 Engine.advance(s,minutes);Time.finalizeTime(s,old);Health.sync(s,{source:'legacy'});
 const witness={origin:'local-independent-person-work-witness-v1',
  npcId:p.actorId,name:p.name,profession:p.profession,
  presenceHash:shift.hash,personOriginHash:p.originHash,
  localWorkSourceHash:observed?.receiptHash||null,
  day,location:shift.location,minutes,freelyAgreed:willing,
  observed:publicWork,noPrivateCareerRank:true,
  noTechniqueLearned:true,noCompulsoryContract:true};
 C.event(s,'story',p.name+(willing?' undertakes practical local work.':
  ' declines to demonstrate work.'),witness);
 s.table.personWorkWitnesses||={records:[]};
 const rec={npcId:p.actorId,name:p.name,profession:p.profession,
  day,site:shift.location,observed:publicWork,
  witnessHash:hash(s.log.at(-1)),personOriginHash:p.originHash,
  actualLocalPresence:shift.hash};
 s.table.personWorkWitnesses.records.push(rec);
 if(s.table.personWorkWitnesses.records.length>100)
  s.table.personWorkWitnesses.records.shift();
 p.history.push({day,type:'local-work-encounter',
  outcome:willing?(observed.success?'completed':'attempted'):'declined',
  observedWorkHash:observed?.receiptHash||null,
  location:shift.location,witnessHash:rec.witnessHash});
 if(p.history.length>24)p.history.shift();
 return {witnessed:true,person:p.name,npcId:p.actorId,
  freelyAgreed:willing,observed:publicWork,minutes,
  doesNotRevealPrivateRank:true,noFreeTeaching:true,noForcedWork:true};
}
function witnessedWorkStatus(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
  Object.keys(params).some(k=>k!=='npcId')||
  (params.npcId!==undefined&&typeof params.npcId!=='string'))
  throw Error('Work memories are read-only and never reveal an unwitnessed person’s private rank, aptitude or location');
 const items=s.table?.personWorkWitnesses?.records||[];
 if(!Array.isArray(items))throw Error('Invalid personal witnessed work record');
 return {personallyWitnessedWork:items.filter(x=>!params.npcId||
   x.npcId===params.npcId).slice(-30).map(x=>({
    npcId:x.npcId,name:x.name,profession:x.profession,
    day:x.day,site:x.site,observed:structuredClone(x.observed)
   })),
  note:'Only real locally witnessed work is shown. Private expertise, aptitude, remote activity, earning a legal licence or personal ancestry are not player-known.'};
}
// A witnessed proposal is an offer to work together, not employment by fiat.
// A genuine person can accept or refuse, and either side can later stop.
function proposeLocalWork(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
    Object.keys(params).sort().join('|')!=='npcId|purpose'||
    typeof params.npcId!=='string'||typeof params.purpose!=='string'||
    params.purpose.trim().length<10||params.purpose.length>240)
  throw Error('A local work proposal needs a real person and an original practical purpose, not a chosen response or wage');
 if(s.encounter||s.battle||
   (s.table?.combatants?.player?.status&&s.table.combatants.player.status!=='ok'))
  throw Error('Immediate danger or incapacity prevents a considered work proposal');
 const old=s.world.minutes,day=Math.floor(old/DAY),minute=old%DAY;
 if(minute<8*60||minute>17*60+12)
  throw Error('This worker must have enough actual time left in their established shift for the proposed work');
 const w=require('./simulation').peek(s),
  shift=presence(w,params.npcId,s.world.location,day),
  p=w.emergentPeople?.people?.[params.npcId.slice('emergent:'.length)];
 if(!shift||!p||!verify(w,p)||p.status!=='active')
  throw Error('The individual is not actively present at this actual work scene');
 const existing=s.table?.localWorkProposals;
 if(existing&&(!existing.records||!existing.byShift||
    typeof existing.records!=='object'||typeof existing.byShift!=='object'||
    Array.isArray(existing.records)||Array.isArray(existing.byShift)))
  throw Error('Invalid existing personal work offer ledger');
 // A changed genuine purpose may be discussed without waiting arbitrary
 // days. The identical unchanged proposal cannot be rerolled; recent
 // requests reduce the worker's willingness to entertain still more offers.
 const purpose=params.purpose.trim(),
  key=p.id+'|'+shift.hash+'|'+hash(purpose.toLowerCase()),
  prior=Object.values(existing?.records||{}).filter(o=>
    o.npcId===p.actorId&&o.shiftHash===shift.hash),
  active=prior.find(o=>o.state==='accepted');
 if(active)throw Error('This worker already has an accepted unfinished work offer; honour or withdraw the existing intention before proposing a different task');
 if(existing?.byShift?.[key])
  throw Error('This worker has already considered the same unchanged proposal in this real shift; repeating it cannot reroll acceptance');
 const pressure=Math.min(.55,prior.length*.16),
  chance=Math.max(.02,(p.personality==='independent'?.51:
   p.personality==='reserved'?.58:.74)-pressure),
  accepted=p.fatigue<=75&&draw(p)<chance;
 const id='work_offer_'+p.id+'_'+old,minutes=8;
 const Time=require('../rules/world'),U=require('../rules/unified'),
  C=require('../rules/core');
 Engine.advance(s,minutes);Time.finalizeTime(s,old);U.sync(s,{source:'legacy'});
 const message=accepted?
  p.name+' accepts a limited invitation to work together on the present shift; no ongoing contract or payment is implied.':
  p.name+' declines the proposed cooperation; their choice stands.';
 const witness={origin:'locally-witnessed-voluntary-work-offer-v1',
  offerId:id,npcId:p.actorId,personOriginHash:p.originHash,shiftHash:shift.hash,
  day,location:s.world.location,purpose,accepted,minutes,
  noInventedPay:true,noFutureCompulsion:true};
 C.event(s,'story',message,witness);
 const record={id,npcId:p.actorId,personId:p.id,name:p.name,
  personOriginHash:p.originHash,shiftHash:shift.hash,
  day,location:s.world.location,purpose,accepted,
  state:accepted?'accepted':'declined',eventHash:hash(s.log.at(-1)),
  createdAtMinute:old,fulfilledAtMinute:null,workReceiptHash:null};
 s.table||={};s.table.localWorkProposals||={records:{},byShift:{}};
 const ledger=s.table.localWorkProposals;
 if(!ledger.records||!ledger.byShift||typeof ledger.records!=='object'||
    Array.isArray(ledger.records)||Array.isArray(ledger.byShift))
  throw Error('Invalid existing personal work offer ledger');
 ledger.records[id]=record;ledger.byShift[key]=id;
 p.history.push({day,type:'local-voluntary-work-proposal',outcome:record.state,
  location:s.world.location,offerId:id,eventHash:record.eventHash});
 if(p.history.length>24)p.history.shift();
 return {offered:true,offerId:id,npcId:p.actorId,name:p.name,
  accepted,state:record.state,purpose,minutes,message,
  noWagesAgreed:true,noOngoingCompulsion:true};
}
function currentOffer(s,id,npcId){
 const rec=s.table?.localWorkProposals?.records?.[id];
 if(!rec||rec.id!==id||rec.npcId!==npcId||
    rec.state!=='accepted'||rec.accepted!==true)
  throw Error('A still-accepted, genuinely witnessed work offer is required');
 const ev=s.log.find(e=>e.details?.origin==='locally-witnessed-voluntary-work-offer-v1'&&
   e.details.offerId===id);
 if(!ev||hash(ev)!==rec.eventHash||
    ev.details.npcId!==rec.npcId||
    ev.details.personOriginHash!==rec.personOriginHash||
    ev.details.shiftHash!==rec.shiftHash||
    ev.details.location!==rec.location||
    ev.details.day!==rec.day||ev.details.purpose!==rec.purpose||
    ev.details.accepted!==true||
    !Number.isInteger(rec.createdAtMinute)||rec.createdAtMinute>s.world.minutes)
  throw Error('This work agreement lacks its original independent acceptance witness');
 return rec;
}
function withdrawLocalWork(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
    Object.keys(params).join('|')!=='offerId'||typeof params.offerId!=='string')
  throw Error('Only an actual personal work offer may be withdrawn');
 const rec=s.table?.localWorkProposals?.records?.[params.offerId];
 if(!rec||rec.state!=='accepted')throw Error('Only an existing unfulfilled voluntary work offer may be withdrawn');
 currentOffer(s,rec.id,rec.npcId);
 rec.state='withdrawn';
 const C=require('../rules/core');
 C.event(s,'story','You withdraw your own willingness to take this task. This does not claim the worker has received a message.',{
  origin:'player-withdrew-local-work-intention-v1',offerId:rec.id,
  npcId:rec.npcId,day:Math.floor(s.world.minutes/DAY),
  noInventedNotification:true,noPenaltyOrPay:true});
 return {withdrawn:true,offerId:rec.id,
  message:'Your work commitment is withdrawn; no payment or penalty is fabricated.',
  workerNotNecessarilyInformed:true};
}
function localWorkOffersStatus(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
    Object.keys(params).some(k=>k!=='npcId')||
    (params.npcId!==undefined&&typeof params.npcId!=='string'))
  throw Error('Personal work offers are read-only and cannot reveal remote private choices');
 const records=s.table?.localWorkProposals?.records||{};
 if(!records||typeof records!=='object'||Array.isArray(records))
  throw Error('Invalid saved work offer records');
 const now=Math.floor(s.world.minutes/DAY),location=s.world.location;
 return {knownWorkOffers:Object.values(records).filter(r=>!params.npcId||
   r.npcId===params.npcId).slice(-40).map(r=>({
    offerId:r.id,name:r.name,npcId:r.npcId,purpose:r.purpose,
    location:r.location,day:r.day,accepted:r.accepted,
    state:r.state==='accepted'&&(r.day!==now||r.location!==location)?
      'not currently actionable':r.state,
    completedWork:r.state==='completed'
  })),
  note:'These are only witnessed proposals, not paid employment, permanent consent or a guarantee of a present shift.'};
}

// Actual local cooperative work, not automatic employment or payment.
// The worker decides independently whether to accept a practical helper.
function assistLocalWork(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
    Object.keys(params).some(k=>!['npcId','offerId'].includes(k))||
    typeof params.npcId!=='string'||
    (params.offerId!==undefined&&typeof params.offerId!=='string'))
  throw Error('Work assistance names only a real present person and optionally their witnessed offer, never consent, pay, skill, DC or outcome');
 if(s.encounter||s.battle||
    (s.table?.combatants?.player?.status&&s.table.combatants.player.status!=='ok'))
  throw Error('Immediate danger or incapacity prevents ordinary cooperative work');
 const current=s.world.minutes,day=Math.floor(current/DAY),minute=current%DAY;
 if(minute<8*60||minute>17*60+20)
  throw Error('An individually established local work shift is required during real work hours');
 const w=require('./simulation').peek(s),
  shift=presence(w,params.npcId,s.world.location,day),
  p=w.emergentPeople?.people?.[params.npcId.slice('emergent:'.length)];
 if(!shift||!p||!verify(w,p)||p.status!=='active')
  throw Error('Only an active, individually present local worker can consider assistance');
 if(s.table?.localWorkAssistance?.lastByDay?.[p.id]===day)
  throw Error('The same task and shift have already received a work-help attempt; a distinct real task needs its own scene');
 const need=p.birthSource.need,
  skill=need==='habitat-care'||need==='local-provisioning'?'survival':
    need==='community-relief'?'diplomacy':
    need==='livelihood-work'?'crafting':null,
  attribute=skill==='survival'?'wis':skill==='diplomacy'?'cha':'int';
 if(!skill)throw Error('The independently established type of local work is not supported');
 const C=require('../rules/core'),Time=require('../rules/world'),
  U=require('../rules/unified'),Practice=require('../rules/earned-practice');
 const sta=C.int(s.player.stamina,'current work Stamina',0,10000),
  health=s.table?.combatants?.player;
 if(sta<4||(health&&health.stamina<4))
  throw Error('Four actual Stamina is required for a practical shared task');
 const eco=w.ecosystems?.[p.regionId],host=w.countries?.[p.polity];
 if(!eco||!host||![eco.quality,eco.pressure,eco.water,eco.forage,host.stability].every(Number.isFinite))
  throw Error('Actual local ecology and civic conditions are required for shared work');
 const score=C.int(s.player.attributes?.[attribute],'actual '+attribute,1,30),
  rank=C.int(s.player.skills?.[skill]?.rank,'earned '+skill+' skill',0,5);
 if(!Careers.verify(p))throw Error('Independent worker career must be genuine');
 const offer=params.offerId===undefined?null:currentOffer(s,params.offerId,p.actorId);
 if(offer&&(offer.day!==day||offer.location!==s.world.location||
    offer.shiftHash!==shift.hash||offer.personOriginHash!==p.originHash))
  throw Error('The accepted offer is no longer supported by the same genuine present shift');
 const agrees=offer? p.fatigue<=75:
    p.fatigue<=75&&draw(p)<
    (p.personality==='independent'?.51:p.personality==='reserved'?.58:.74);
 const duration=agrees?40:5;
 let check=null,observed=null,practice=null,workReceiptHash=null,support=0;
 if(agrees){
  const difficulty=12+(eco.pressure>69?3:eco.quality<38?2:0)+
    (eco.water<40||eco.forage<40?2:0)+(host.stability<40?2:0);
  check=C.check(s,{modifier:Math.floor((score-10)/2)+2*rank,
   dc:difficulty,label:'Assist '+p.name+' with real '+need.replace(/-/g,' ')+' work'});
  const proof={skill,degree:check.degree,success:check.success,
   rollEventHash:hash(s.log.at(-1))};
  const result=Careers.work(w,p,day,'locally-assisted-duty',proof);
  support=result.assistanceBonus;
  observed=Careers.publicWitness(result);
  workReceiptHash=result.receiptHash;
  practice=Practice.award(s,{skill,check,risky:true});
  s.player.stamina-=4;
 }
 Engine.advance(s,duration);
 Time.finalizeTime(s,current);
 U.sync(s,{source:'legacy'});
 s.table||={};
 s.table.localWorkAssistance||={lastByDay:{},records:[]};
 s.table.localWorkAssistance.lastByDay[p.id]=day;
 if(offer){
  offer.state=agrees?'completed':'worker_unavailable';
  offer.fulfilledAtMinute=s.world.minutes;
  offer.workReceiptHash=workReceiptHash;
 }
 const message=agrees?
  p.name+' freely agrees to work together on the current task. Both contribute their own effort.':
  p.name+' declines help during this shift; the refusal is respected.';
 const witnessed={origin:'witnessed-local-cooperative-work-v1',
  npcId:p.actorId,personOriginHash:p.originHash,shiftHash:shift.hash,
  day,location:s.world.location,minutes:duration,agreed:agrees,
  playerSkill:agrees?skill:null,
  playerCheck:check?{roll:check.roll,total:check.total,dc:check.dc,degree:check.degree}:null,
  independentWorkHash:workReceiptHash,support,
  noUncontractedPayment:true,noAssumedOngoingConsent:true};
 C.event(s,'story',message,witnessed);
 const rec={npcId:p.actorId,name:p.name,profession:p.profession,
  day,site:s.world.location,agreed:agrees,skill:agrees?skill:null,
  ownResult:check?.degree||null,observed,
  witnessHash:hash(s.log.at(-1)),personOriginHash:p.originHash,
  independentWorkHash:workReceiptHash};
 s.table.localWorkAssistance.records.push(rec);
 if(s.table.localWorkAssistance.records.length>100)
  s.table.localWorkAssistance.records.shift();
 p.history.push({day,type:'personally-witnessed-work-cooperation',
  result:agrees?'worked-together':'declined',location:s.world.location,
  witnessHash:rec.witnessHash});
 if(p.history.length>24)p.history.shift();
 return {asked:true,agreed:agrees,npcId:p.actorId,name:p.name,
  skill:agrees?skill:null,check,observed,practice,
  assistanceBonus:support,minutes:duration,message,
  ...(offer?{offerId:offer.id,agreementHonoured:agrees}:{}),
  noUncontractedPay:true,noAutomaticRankOrContract:true,
  noControlOfIndependentWorker:true};
}
function assistanceStatus(s,params={}){
 if(!params||typeof params!=='object'||Array.isArray(params)||
    Object.keys(params).some(k=>k!=='npcId')||
    (params.npcId!==undefined&&typeof params.npcId!=='string'))
  throw Error('Assistance records are read-only player-known memories, not employment offers');
 const records=s.table?.localWorkAssistance?.records||[];
 if(!Array.isArray(records))throw Error('Invalid personally witnessed work-assistance ledger');
 return {personallyAssistedWork:records.filter(x=>
    !params.npcId||x.npcId===params.npcId).slice(-30).map(x=>({
     npcId:x.npcId,name:x.name,profession:x.profession,
     day:x.day,site:x.site,agreed:x.agreed,
     skill:x.skill,ownResult:x.ownResult,
     observed:x.observed?structuredClone(x.observed):null
    })),
  note:'Only work personally attempted is shown; signed employment, private aptitude, wages and hidden competence cannot be invented.'};
}

module.exports={ORIGIN,SHIFT,considerPublicInvitation,verifyPublicInvitationChoice,considerPublicEventEntry,verifyPublicEventEntryChoice,seed,ensure,sourceDemand,verify,siteFor,shift,
 presence,sixday,heardStatus,meet,observeLocalWork,witnessedWorkStatus,
 proposeLocalWork,withdrawLocalWork,localWorkOffersStatus,
 assistLocalWork,assistanceStatus,_debug:{draw,role,make,live,name,hash}};
