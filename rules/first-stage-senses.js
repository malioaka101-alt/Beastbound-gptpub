'use strict';
// Real first-stage Soul Perception and Rift Sense, NOT mindreading,
// soul extraction, private NPC secrets, teleportation or supernatural rank.
// Canon: Unified Master Prompt §§19, 22, 25 and 45.
// Both are bounded, costly, source-witnessed actions after earned rites.
const Crypto=require('node:crypto');
const E=require('../engine.js'),Core=require('./core'),W=require('./world'),
 Build=require('./build'),U=require('./unified'),
 Realm=require('../world/simulation'),Atlas=require('../world/atlas'),
 Presence=require('../world/person-presence');
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const SOUL_COST=2,RIFT_STAMINA=2,SOUL_MINUTES=6,RIFT_MINUTES=12;
const SOUL='phase1',RIFT='sense';
function noParams(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Earned perception abilities accept no chosen target, sensed answer, DC, range, cost, hidden truth or free roll');
}
function stageProof(s,system,target){
 const state=system==='soul'?s.player.soul:s.player.rift,
  stage=system==='soul'?state?.phase:state?.step;
 if(!Number.isInteger(stage)||stage<1)
  throw Error('The practitioner must actually earn the first '+system+' discipline breakthrough before using its perception');
 const hist=s.table?.disciplineTraining?.[system]?.history;
 if(!Array.isArray(hist)||!hist.some(x=>
  x.target===target&&x.quality&&typeof x.change==='string'&&
  (system==='soul'?x.change.startsWith('Phase I Soul Perception'):
   x.change.startsWith('Step I Rift Sense'))))
  throw Error('The learned '+system+' phase needs its actual earlier earned breakthrough record');
 return state;
}
function scene(s){
 if(!E.LOCATIONS[s.world?.location])throw Error('A real current local scene is required');
 if(s.battle)throw Error('A concentration exercise cannot bypass combat turns');
 const c=s.table?.combatants?.player;
 if(c&&c.status!=='ok')throw Error('An incapacitated practitioner cannot attempt unprotected spiritual sensing');
 if(s.encounter?.threat===true)
  throw Error('An immediately threatening animal needs a safe encounter decision, not a free meditation');
}
function livingBeast(s,range){
 const id=s.encounter?.beastId,b=s.beasts?.[id],loc=E.LOCATIONS[s.world.location];
 if(!id||!b||!E.SPECIES[b.species]||b.away===true||
  !Number.isInteger(s.encounter?.distanceMetres)||
  s.encounter.distanceMetres<1||s.encounter.distanceMetres>range||
  b.location&&b.location!==s.world.location||
  !Array.isArray(loc.spawns)||!loc.spawns.includes(b.species)||
  b.habitatExposure?.[s.world.location]!==1)return null;
 const witness=(s.log||[]).find(x=>x.type==='encounter'&&
  x.details?.origin==='engine-local-wildlife-encounter'&&
  x.details?.beastId===id&&x.details?.species===b.species&&
  x.details?.location===s.world.location&&
  x.details?.distanceMetres===s.encounter.distanceMetres&&
  x.text==='You find a wild '+E.SPECIES[b.species].name+
   ' near '+loc.name+'. It appears '+x.details?.mood+
   '. It has not agreed to approach or partner with you.');
 if(!witness)return null;
 return {id,encounterHash:digest(witness)};
}
// Recent direct conversation establishes close in-person physical proximity.
// A public employment listing, a known name or a distant shift never does.
// We additionally require that the independently scheduled person is still
// present, with the original in-world conversation and its event hash.
// This is NOT a search for hidden people, intentions, soul quality or minds.
function personallyWitnessedNearbyPerson(s,range){
 if(range<10||!Number.isInteger(s.world?.minutes))return null;
 const loc=s.world.location,now=s.world.minutes,day=Math.floor(now/1440),
  minute=now%1440;
 if(minute<8*60||minute>=18*60)return null;
 const w=Realm.peek(s),conversations=[
  ...(s.table?.npcConversations?.records||[]).map(x=>({
   ...x,
   // Actual followup speech is still a recently witnessed local person;
   // an unanswered question reveals no private identity or soul attribute.
   origin:x.origin==='witnessed-npc-source-grounded-question'?
    'source-verified-npc-followup':'engine-local-npc-conversation',
   canonical:true})),
  ...(s.table?.emergentConversations?.records||[]).map(x=>({
   ...x,origin:'emergent-person-local-conversation',canonical:false}))
 ];
 for(let i=conversations.length-1;i>=0;i--){
  const r=conversations[i];
  if(r.location!==loc||typeof r.npcId!=='string'||
     typeof r.eventHash!=='string'||r.eventHash.length!==64)
   continue;
  const witness=s.log?.find(x=>digest(x)===r.eventHash);
  if(!witness||witness.type!=='story'||
     witness.details?.origin!==r.origin||
     witness.details?.npcId!==r.npcId||
     witness.details?.location!==loc)
   continue;
  const originalMinute=r.canonical?r.worldMinute:
   (Number.isInteger(witness.day)&&witness.day>=1&&
    typeof witness.time==='string'&&
    /^Day [0-9]+, [0-2][0-9]:[0-5][0-9]$/.test(witness.time)?
    (witness.day-1)*1440+
     Number(witness.time.slice(-5,-3))*60+
     Number(witness.time.slice(-2)):null);
  if(!Number.isInteger(originalMinute)||
     originalMinute>now||now-originalMinute>10||
     Math.floor(originalMinute/1440)!==day)
   continue;
  const present=Presence.resolve(w,r.npcId,loc,day);
  if(!present||present.actorId!==(
     r.npcId.startsWith('emergent:')?r.npcId:'npc:'+r.npcId)||
    (r.canonical&&(
      present.source!=='engine-local-npc'||
      !Object.hasOwn(E.NPCS,r.npcId)||
      E.NPCS[r.npcId].name!==r.name||
      witness.details?.npcName!==r.name))||
    (!r.canonical&&(
      present.source!=='independently-generated-lived-person'||
      witness.details?.personId!==r.npcId.slice('emergent:'.length)||
      witness.details?.name!==r.name||
      witness.details?.presence?.hash!==present.presence?.hash||
      r.sourceHash!==w.emergentPeople?.people?.[
       r.npcId.slice('emergent:'.length)]?.originHash)))
   continue;
  // The player knows a conversation happened. The spell senses an actual
  // living presence, not a target they selected or a private person attribute.
  return {witnessHash:r.eventHash,actorId:r.npcId};
 }
 return null;
}
function soulStatus(s,p={}){
 noParams(p);
 const soul=s.player.soul,h=s.table?.disciplineTraining?.soul?.history||[];
 const earned=soul?.phase>=1&&h.some(x=>
  x.target==='phase1'&&x.change?.startsWith('Phase I Soul Perception'));
 return {earned:!!earned,phase:soul?.phase||0,
  reserve:earned?soul.reserve:null,maxReserve:earned?soul.maxReserve:null,
  perceptionRangeMetres:earned?soul.perceptionRange:null,
  uses:(s.table?.perceptionPractice?.soulAttempts||[]).length,
  description:'Phase I senses only limited self-structure and witnessed nearby living signatures. It is not mindreading, beast taming, remote location detection or a licence to extract a soul.'};
}
function perceive(s,p={}){
 noParams(p);const soul=stageProof(s,'soul',SOUL);scene(s);
 const range=Core.int(soul.perceptionRange,'earned range in metres',10,5000),
  max=Core.int(soul.maxReserve,'earned Soul reserve limit',1,10000),
  available=Core.int(soul.reserve,'actual Soul reserve',0,max);
 if(available<SOUL_COST)throw Error('Not enough actual Soul reserve for Soul Perception; meaningful rest is needed');
 // An unmeasured or distant animal cannot be invented inside the actual
 // Soul Perception range. The practitioner can still sense their own pattern.
 const beast=livingBeast(s,range),
  person=personallyWitnessedNearbyPerson(s,range);
 const attr=Core.int(s.player.attributes.wis,'recorded Wisdom',1,30),
  rank=Core.int(s.player.skills?.cultivation?.rank,'earned Cultivation rank',0,5);
 const start=s.world.minutes,location=s.world.location,
  dc=beast||person?14:12,modifier=Math.floor((attr-10)/2)+2*rank;
 Core.event(s,'world','The practitioner concentrates on their own established spiritual pattern'+
  (beast?' while a genuinely encountered animal is nearby.':
   person?' while a recently spoken-to person remains present.':'.'),{
  origin:'earned-bounded-soul-perception',site:location,
  stage:soul.phase,rangeMetres:range,cost:SOUL_COST,minutes:SOUL_MINUTES,
  nearbyBeastId:beast?.id||null,encounterHash:beast?.encounterHash||null,
  recentlySpokenPersonWitnessHash:person?.witnessHash||null,
  cannotReadThoughts:true,noSoulExtraction:true,noHiddenGrade:true
 });
 const witnessIndex=s.log.length-1,witnessHash=digest(s.log[witnessIndex]);
 const check=Core.check(s,{modifier,dc,label:'Earned Soul Perception: present living resonance',risky:false});
 const rollIndex=s.log.length-1,rollHash=digest(s.log[rollIndex]);
 soul.reserve-=SOUL_COST;
 const old=s.world.minutes;
 E.advance(s,SOUL_MINUTES);W.finalizeTime(s,old);U.sync(s,{source:'legacy'});
 const success=check.success;
 const report={origin:'earned-bounded-soul-perception',
  attemptDay:E.day(s),worldMinute:s.world.minutes,location,
  phase:soul.phase,cost:SOUL_COST,rangeMetres:range,
  success,degree:check.degree,nearbyBeastId:beast?.id||null,
  encounterHash:beast?.encounterHash||null,
  nearbyPersonWitnessHash:person?.witnessHash||null,witnessIndex,witnessHash,
  rollIndex,rollHash,used:false};
 s.table||={};s.table.perceptionPractice||={soulAttempts:[],riftAttempts:[]};
 s.table.perceptionPractice.soulAttempts.push(report);
 s.table.perceptionPractice.soulAttempts=s.table.perceptionPractice.soulAttempts.slice(-50);
 if(success&&beast){
  s.table.perceptionPractice.soulFocus||={};
  s.table.perceptionPractice.soulFocus[beast.id]={
   ...report,beastId:beast.id,
   note:'One bounded noninvasive observation focus, not a new species or inferred mind'};
 }
 const sensedBeast=success&&!!beast,sensedPerson=success&&!!person,
  message=!success?'The spiritual impressions remain indistinct; no reliable nearby signature is identified.':
   sensedBeast||sensedPerson?
    'You briefly distinguish your own living pattern from another genuinely witnessed, nearby life-sign. No identity, species, grade, thoughts or intentions are revealed.':
    'You become briefly aware of your own stable spiritual pattern. No other life-sign is mechanically established at close range.';
 Core.event(s,'progress',message,{origin:'bounded-soul-perception-result',
  succeeded:success,focusedAlreadyEncounteredBeast:sensedBeast,
  nearbyRecentConversant:sensedPerson,
  sourceWitnessHash:witnessHash,checkEventHash:rollHash});
 return {performed:true,discipline:'soul',phase:soul.phase,
  success,check,remainingReserve:soul.reserve,energySpent:SOUL_COST,
  minutes:SOUL_MINUTES,rangeMetres:range,ownSoulAwareness:success,
  nearbyLifeSign:sensedBeast||sensedPerson,
  recentConversantSignature:sensedPerson,noNamesRead:true,noBeastMindRead:true,
  noUnseenCreaturesInvented:true,noAutomaticPartnership:true,
  message};
}
function focusBonus(s,id){
 const f=s.table?.perceptionPractice?.soulFocus?.[id];
 if(!f||f.used||!f.success||f.beastId!==id||
  f.nearbyBeastId!==id||f.location!==s.world.location||
  s.encounter?.beastId!==id||!Number.isInteger(f.worldMinute)||
  s.world.minutes<f.worldMinute||s.world.minutes-f.worldMinute>60)return 0;
 const active=livingBeast(s,f.rangeMetres);
 if(!active||active.encounterHash!==f.encounterHash)return 0;
 // The player journal is a rolling 90-event window. A real event can shift
 // indices during the same six-minute action, so match its original digest
 // rather than trusting a stale array offset.
 const w=s.log?.find(x=>digest(x)===f.witnessHash),
  r=s.log?.find(x=>digest(x)===f.rollHash);
 if(w?.type!=='world'||digest(w)!==f.witnessHash||
  w.details?.origin!=='earned-bounded-soul-perception'||
  w.details?.nearbyBeastId!==id||w.details?.encounterHash!==f.encounterHash||
  w.details?.cost!==SOUL_COST||w.details?.rangeMetres!==f.rangeMetres||
  r?.type!=='roll'||digest(r)!==f.rollHash||
  r.details?.success!==true||r.details?.degree!==f.degree)return 0;
 return 1;
}
function useFocus(s,id){
 if(!focusBonus(s,id))return false;
 s.table.perceptionPractice.soulFocus[id].used=true;
 return true;
}
function riftStatus(s,p={}){
 noParams(p);
 const rift=s.player.rift,h=s.table?.disciplineTraining?.rift?.history||[];
 const earned=rift?.step>=1&&h.some(x=>
  x.target==='sense'&&x.change?.startsWith('Step I Rift Sense'));
 const scans=(s.table?.perceptionPractice?.riftAttempts||[]);
 return {earned:!!earned,step:rift?.step||0,
  knownReadings:scans.filter(x=>x.success).slice(-8).map(x=>({
   location:x.location,day:x.day,observation:x.publicObservation,
   source:'personally witnessed local boundary-pressure sense'})),
  note:'Rift Sense can interpret a locally measured boundary field. It grants no portal access, hidden vault map, travel step or protected-site permit.'};
}
function senseRift(s,p={}){
 noParams(p);const rift=stageProof(s,'rift',RIFT);scene(s);
 if(rift.sense?.notTeleportation!==true||
  rift.sense?.requires!=='Nearby anomaly or measured weak boundary')
  throw Error('Rift Sense lacks its original non-teleporting earned structural restriction');
 const location=s.world.location;
 if(location!=='ruins'||Atlas.LOCATION_REGION[location]!=='riftglass')
  throw Error('No established immediately measurable Riftglass exterior boundary exists at this location');
 if(s.encounter)throw Error('Resolve the actual nearby beast encounter before studying the rift boundary');
 const stamina=Core.int(s.player.stamina,'actual stamina',0,100000);
 const c=s.table?.combatants?.player;
 if(stamina<RIFT_STAMINA||(c&&c.stamina<RIFT_STAMINA))
  throw Error('Insufficient Stamina for a careful boundary-sense session');
 const w=Realm.peek(s),site=w.mythic?.riftglass_vault,
  eco=w.ecosystems?.riftglass;
 if(!site||!eco||
  !['quiet','fading','surging','unstable'].includes(site.phase)||
  !Number.isInteger(site.charge)||site.charge<0||site.charge>100||
  !Number.isInteger(site.seal)||site.seal<0||site.seal>100||
  !Number.isInteger(eco.pressure)||eco.pressure<0||eco.pressure>100)
  throw Error('A genuinely recorded local boundary and ecological pressure are required');
 const pre={siteId:'riftglass_vault',phase:site.phase,charge:site.charge,
  seal:site.seal,ecosystemPressure:eco.pressure,
  worldSeed:w.worldSeed,day:Math.floor(s.world.minutes/1440)};
 const sampleHash=digest(pre);
 const risk=site.phase==='unstable'||site.seal<35?'unstable':
  site.phase==='surging'||site.charge>72||eco.pressure>73?'elevated':'contained';
 const dc=risk==='unstable'?17:risk==='elevated'?15:13;
 const int=Core.int(s.player.attributes.int,'recorded Intelligence',1,30),
  rank=Core.int(s.player.skills?.arcana?.rank,'earned Arcana rank',0,5),
  modifier=Math.floor((int-10)/2)+2*rank;
 const started=s.world.minutes;
 Core.event(s,'world','The practitioner studies known exterior boundary pressure at Riftglass Outpost without attempting to enter the sealed vault.',{
  origin:'earned-rift-sense-exterior',siteId:pre.siteId,location,
  boundarySampleHash:sampleHash,minutes:RIFT_MINUTES,
  staminaCost:RIFT_STAMINA,actualDC:dc,
  noSecretPassages:true,noInstantTravel:true
 });
 const witnessHash=digest(s.log.at(-1));
 const check=Core.check(s,{modifier,dc,label:'Earned Rift Sense: exterior boundary coherence',risky:false});
 const rollHash=digest(s.log.at(-1));
 s.player.stamina-=RIFT_STAMINA;
 if(c){c.stamina-=RIFT_STAMINA;U.sync(s,{source:'wounds'});}
 const old=s.world.minutes;
 E.advance(s,RIFT_MINUTES);W.finalizeTime(s,old);U.sync(s,{source:'legacy'});
 const publicObservation=check.success?
  risk==='unstable'?'Strongly irregular boundary pressure; maintaining distance from the sealed vault is prudent.':
   risk==='elevated'?'Elevated, shifting spatial pressure along the known exterior wards.':
    'The existing exterior ward line feels comparatively contained at this moment.':
  'The surrounding spatial pressure cannot be interpreted reliably.';
 s.table||={};s.table.perceptionPractice||={soulAttempts:[],riftAttempts:[]};
 s.table.perceptionPractice.riftAttempts.push({
  origin:'earned-rift-sense-exterior',day:E.day(s),worldMinute:s.world.minutes,
  location,siteId:pre.siteId,sourceSnapshotHash:sampleHash,
  success:check.success,degree:check.degree,staminaSpent:RIFT_STAMINA,
  minutes:RIFT_MINUTES,witnessHash,rollHash,publicObservation});
 s.table.perceptionPractice.riftAttempts=s.table.perceptionPractice.riftAttempts.slice(-50);
 Core.event(s,'progress',publicObservation,{
  origin:'earned-rift-sense-observation',siteId:pre.siteId,
  sourceSnapshotHash:sampleHash,succeeded:check.success,
  sourceWitnessHash:witnessHash,checkEventHash:rollHash});
 return {performed:true,discipline:'rift',step:rift.step,
  success:check.success,check,minutes:RIFT_MINUTES,
  staminaSpent:RIFT_STAMINA,publicObservation,
  noVaultEntry:true,noTeleportation:true,noHiddenRouteRevealed:true};
}
module.exports={SOUL_COST,RIFT_STAMINA,SOUL_MINUTES,RIFT_MINUTES,
 soulStatus,perceive,focusBonus,useFocus,riftStatus,senseRift};
