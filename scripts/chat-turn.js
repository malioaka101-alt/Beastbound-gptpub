'use strict';
// Private, file-backed ChatGPT turn executor. Never network-facing, never shells user input.
const fs=require('node:fs'), crypto=require('node:crypto');
const E=require('../engine.js'), P=require('../panels.js'), Rules=require('../rules');
const Health=Rules.unified, Core=Rules.core;
const PersonPresence=require('../world/person-presence');
const LivedPlaces=require('../world/lived-places');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const legalId=x=>typeof x==='string' && /^[a-z0-9][a-z0-9_-]{4,79}$/.test(x);
const recap=s=>s.chatRuntime?.scene ? E.recap(s).replace(/^SCENE:.*$/m,'SCENE: '+s.chatRuntime.scene) : E.recap(s);

const LOOK_WORDS=new Set(['look','look around','where am i','scene','surroundings','who is here','nearby people','routes']);
const PANELS=Object.freeze({status:'status',stats:'character',character:'character',
 inventory:'bag',bag:'bag',beasts:'tamer',journal:'journal',quests:'quests'});
function localScene(s){
 const loc=LivedPlaces.location(s,s.world?.location);
 if(!loc)throw Error('This save has no established local scene');
 const people=PersonPresence.localStatus(s,Rules.realm.peek(s)).people;
 const b=s.encounter?.beastId?s.beasts?.[s.encounter.beastId]:null;
 const encountered=b&&b.away!==true&&
  (!b.location||b.location===s.world.location);
 return {location:s.world.location,name:loc.name,
  description:loc.description,
  exits:loc.exits.map(id=>({id,name:E.LOCATIONS[id]?.name||LivedPlaces.location(s,id)?.name||id})),
  ...(loc.canonical?{}:{culture:loc.culture,
   establishedDetails:LivedPlaces.status(s,{placeId:s.world.location}).place}),
  nearbyPeople:people.map(x=>({npcId:x.npcId,name:x.name,
   profession:x.profession,meetingIsNotAssent:true})),
  publicGuildFieldBoard:s.world.location==='crossing'&&E.NPCS.elira?.location==='crossing',
  knownRestSites:Health.shelterStatus(s).available,
  nearbyCreature:encountered?{name:b.name,
   observed:s.encounter.observed===true,
   visiblyThreatening:s.encounter.threat===true}:null,
  focus:Array.isArray(s.chatRuntime?.focus)?s.chatRuntime.focus.slice(0,2):[],
  note:'A glance reveals local routes and actually established people, never hidden knowledge, free materials, willingness to tutor, creature capabilities or undiscovered events.'};
}
function actualWorker(s,wanted){
 const people=PersonPresence.localStatus(s,Rules.realm.peek(s)).people.filter(p=>
   p.npcId.startsWith('emergent:')&&
   (p.name.toLowerCase()===wanted||
    (wanted.length>=4&&p.name.toLowerCase().startsWith(wanted))));
 if(people.length!==1)throw Error('Name one actually present independent worker; an absent person cannot be summoned');
 return people[0];
}
// The player already witnessed these exact local facts. Neither an
// undiscovered species nor a favourable second die can be selected here.
function onePendingLocalSurvey(s){
 const view=Rules.act(s,{system:'world',operation:'habitatSurveyStatus',params:{}});
 if(view.pending.length!==1)
  throw Error('Interpret one genuine, still-current personally witnessed habitat survey before making another check');
 return view.pending[0].checkId;
}
function oneHarvestableLocalSurvey(s,item){
 const location=s.world.location;
 if(item==='marsh_reed'&&location!=='fen')
  throw Error('Common marsh reeds grow in the recorded wetland, not every terrain');
 if(item==='ironbloom'&&location!=='hills')
  throw Error('Ironbloom grows on the recorded Ashwind ridge, not every terrain');
 const candidates=Object.values(s.table?.habitatSurveyFindings||{}).filter(f=>
  f?.location===location&&f.biome===E.LOCATIONS[location]?.biome&&
  f.success===true&&typeof f.checkId==='string'&&
  Number.isInteger(f.interpretedAtMinute)&&
  f.interpretedAtMinute<=s.world.minutes&&
  s.world.minutes-f.interpretedAtMinute<=1440);
 if(!candidates.length)
  throw Error(item==='marsh_reed'?
   'Gathering these reeds needs a recent, genuinely successful personally witnessed fen survey':
   'Gathering local materials requires a recent, genuinely successful personally witnessed habitat survey');
 // The most recent original evidence is used, never a player-selected
 // favourable older roll and never another roll from the gather action.
 candidates.sort((a,b)=>b.interpretedAtMinute-a.interpretedAtMinute);
 if(candidates[1]?.interpretedAtMinute===candidates[0].interpretedAtMinute)
  throw Error('Conflicting field observations must be reconciled before harvesting');
 return candidates[0].checkId;
}
// Only source-witnessed offers and already equipped actions may enter natural turns.
function knownMerchantOffer(s,wanted){
 const local=Rules.act(s,{system:'gear',operation:'offers',params:{}}).available.filter(x=>x.stock>0);
 const target=wanted.trim().replace(/\s+/g,'_');
 const matched=local.filter(x=>x.offerId===target||x.item===target);
 if(matched.length!==1)
  throw Error(matched.length?
   'Several witnessed offers match; name the exact offer ID to choose the seller':
   'No current witnessed local offer matches that item; buying cannot create stock or a price');
 return matched[0].offerId;
}
function equippedMundaneAction(s,wanted){
 const owned=Rules.act(s,{system:'gear',operation:'status',params:{}});
 const equipped=owned.owned.filter(x=>x.equipped===true&&x.item===owned.equippedWeapon);
 if(equipped.length!==1)
  throw Error('An actually owned, source-recorded equipped mundane weapon is required for a physical attack');
 if(wanted&&wanted.trim().replace(/\s+/g,'_')!==equipped[0].item)
  throw Error('The named weapon is not the one actually carried and equipped');
 return equipped[0].actionId;
}
// One material-name resolver for ordinary offered goods, rather than an
// ever-growing list of item-specific phrases. The target must be the actually
// present creature; diet and its independent choice remain world-owned.
// Item names are resolved once for any physical-material verb. The source
// still decides whether an item can be safely gathered, offered or used.
function namedMaterial(text){
 const name=text.trim().toLowerCase().replace(/^(?:a|an|some|my|the)\s+/,'');
 const matches=Object.entries(E.RESOURCES).filter(([key,value])=>{
  const full=value.name.toLowerCase(),raw=key.replace(/_/g,' ');
  const last=full.split(' ').at(-1);
  return [key,raw,full,full+'s',last,last+'s',
   last.endsWith('s')?last.slice(0,-1):''].includes(name);
 });
 return matches.length===1?matches[0][0]:null;
}
function materialGatherIntent(action){
 const match=action.match(/^(?:harvest|gather|collect|cut|pick)\s+(.+)$/);
 if(!match)return null;
 return namedMaterial(match[1]);
}
function materialReplantIntent(action){
 const match=action.match(/^(?:plant|replant|sow)\s+(.+)$/);
 if(!match)return null;
 return namedMaterial(match[1]);
}
// One ordinary material-gift intent, source-checked against genuinely
// co-present human persons. A named person is not silently a wild beast.
function materialPersonIntent(s,action){
 const m=action.match(/^(?:give|offer|hand|pass)\s+(.+?)\s+to\s+(.+)$/);
 if(!m)return null;
 const item=namedMaterial(m[1]);
 if(!item)return null;
 const target=m[2].trim().replace(/^(?:the|a|an)\s+/,'');
 const beast=s.encounter?.beastId?s.beasts?.[s.encounter.beastId]:null;
 const animalNames=beast?[
  'beast','animal','creature',beast.name.toLowerCase(),
  E.SPECIES[beast.species]?.name.toLowerCase()
 ]:['beast','animal','creature'];
 if(animalNames.includes(target))return null;
 const visible=localScene(s).nearbyPeople;
 const matching=visible.filter(person=>
   [person.name.toLowerCase(),person.npcId.toLowerCase(),
    person.name.toLowerCase().split(' ')[0]].includes(target));
 if(matching.length!==1)
  throw Error(matching.length?
   'Several actually present people match; name the exact recipient':
   'No single actually present person matches this intended recipient');
 return {npcId:matching[0].npcId,item};
}
function materialOfferIntent(s,action){
 if(action==='feed'||action==='offer food')return {item:'clean_rations'};
 const m=action.match(/^(?:offer|feed|give)\s+(.+)$/);
 if(!m)return null;
 const parts=m[1].split(/\s+to\s+/);
 if(parts.length>2)return null;
 let name=parts[0].trim().replace(/^(?:a|an|some|my|the)\s+/,'');
 if(name==='food')name='clean rations';
 const item=namedMaterial(name);
 if(!item)return null;
 if(parts[1]){
  const target=parts[1].trim().replace(/^(?:the|a|an)\s+/,'');
  const beast=s.encounter?.beastId?s.beasts?.[s.encounter.beastId]:null;
  const known=beast?[
   'beast','animal','creature',beast.name.toLowerCase(),
   E.SPECIES[beast.species]?.name.toLowerCase()
  ]:[];
  if(!known.includes(target))
   throw Error('The offered resource can only be directed to the actually present named creature; no absent or different animal is summoned');
 }
 return {item};
}
// Reuse original protected creation work for real recorded plans and owned
// tools. Natural descriptions are selectors, never proof of a mechanism.
function recordedDesignId(s,wanted,verb){
 const raw=wanted.trim().replace(/^(?:my|the|a|an)\s+/,'');
 const normal=x=>String(x).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const records=Rules.act(s,{system:'creation',operation:'status',params:{}}).designs;
 let found=[];
 if(/^design_[1-9][0-9]*$/.test(raw)){
  found=Rules.act(s,{system:'creation',operation:'status',
   params:{id:raw}}).designs;
 }else if(/^water_indicator_design_[1-9][0-9]*$/.test(raw)){
  const actual=Rules.act(s,{system:'creation',operation:'prototypeStatus',
   params:{id:raw}}).prototypes;
  found=records.filter(d=>actual.some(t=>t.id===raw&&t.designId===d.id));
 }else{
  found=records.filter(d=>normal(d.title)===normal(raw));
 }
 if(found.length!==1)throw Error(found.length?
  'Several genuinely recorded designs have that title; name the exact design ID':
  verb==='craft'?
   'Unsupported crafting recipe or blueprint; record an authentic design and prove its physical method first':
   'No single genuinely recorded design or verified owned prototype matches that description');
 return found[0].id;
}
function physicalDesignIntent(s,action){
 const m=action.match(/^(build|assemble|make|prototype|craft|calibrate|test|measure|repair)\s+(.+)$/);
 if(!m)return null;
 if(m[1]==='craft'&&['field_poultice','field poultice'].includes(m[2].replace(/\s+/g,' ').trim()))
  return null;
 let id;
 try{id=recordedDesignId(s,m[2],m[1]);}
 catch(error){
  const requested=m[2].trim();
  // An *ordinary new idea* is a legitimate freeform intention, not a
  // fabricated recorded design. Explicit invalid design IDs and genuinely
  // ambiguous owned titles still require truthful reconciliation.
  if(!/^(?:design_[0-9]+|water_indicator_design_[0-9]+)$/.test(requested)&&
    /^(?:No single genuinely recorded design|Unsupported crafting recipe or blueprint)/.test(String(error.message)))
   return null;
  throw error;
 }
 const operation=['build','assemble','make','prototype','craft'].includes(m[1])?
  'prototype':m[1]==='test'?'calibrate':m[1];
 return {id,operation};
}
function nonConsequentialAction(s,action){
 if(LOOK_WORDS.has(action)){
  const scene=localScene(s);
  return {message:scene.name+': '+scene.description+
   ' Routes: '+scene.exits.map(x=>x.name).join(', ')+'.',
   scene};
 }
 if(['known campsites','campsites','shelter status'].includes(action)){
  return {message:'Only personally witnessed, currently usable rest sites are shown, not automatically safe land.',shelter:Health.shelterStatus(s)};
 }
 if(['my family','known relatives','family background','my relatives',
   'family roots'].includes(action)){
  const family=Rules.act(s,{system:'social',
   operation:'originRelativesStatus',params:{}});
  return {message:'Known relatives and only personally witnessed conversations; no hidden locations, sentiments, money, inherited abilities or promises.',family};
 }
 if(['my handoffs','my offered goods','my material gifts',
   'inspect handoffs'].includes(action)){
  const given=Rules.act(s,{system:'social',
   operation:'materialHandoffsStatus',params:{}});
  return {message:'Only the material transfers and refusals you personally witnessed are shown; no private future use or favour is inferred.',given};
 }
 if(['my plantings','check my plantings','inspect native plantings',
   'check replanted materials','inspect plantings'].includes(action)){
  const planted=Rules.act(s,{system:'world',operation:'plantingStatus',params:{}});
  return {message:'Only native material you personally planted here, and what can now be seen locally. Living shoots cannot be verified remotely.',planted};
 }
 if(['survey notes','field notes','habitat survey status','survey status'].includes(action)){
  const survey=Rules.act(s,{system:'world',operation:'habitatSurveyStatus',params:{}});
  const findings=Object.values(s.table?.habitatSurveyFindings||{})
   .filter(f=>f?.location===s.world.location&&typeof f.checkId==='string')
   .slice(-8).map(f=>({checkId:f.checkId,finding:f.finding,
    interpretedAtMinute:f.interpretedAtMinute,
    harvested:f.harvested===true,
    harvestCount:Number.isInteger(f.harvestCount)?f.harvestCount:
     f.harvested===true?1:0}));
  return {message:'Only terrain observations and interpretations you personally made here are shown; no unseen species or automatic harvest is revealed.',survey,findings};
 }
 if(['dual casting status','dual channel status'].includes(action)){
  const ability=Rules.act(s,{system:'arcane',operation:'dualChannelStatus',params:{}});
  return {message:'Your currently verified two-channel casting readiness; structural capacity alone grants no spells.',ability};
 }
 if(['shop','browse shop','browse market','merchant offers','equipment offers',
  'what is for sale',"what's for sale"].includes(action)){
  const offers=Rules.act(s,{system:'gear',operation:'offers',params:{}});
  return {message:offers.available.length?
   'These are actual previously witnessed local equipment quotations, not a universal shop catalogue.':
   'No current personally witnessed local equipment quotation is on record; this does not mean the town has no merchants.',
   offers};
 }
 if(['my designs','inspect designs','review designs','my inventions',
  'invention plans','designs','review my designs'].includes(action)){
  const designs=Rules.act(s,{system:'creation',operation:'status',params:{}});
  return {message:'Only genuinely recorded concepts and their sourced status. No proposed effect becomes an item or learned power merely by inspecting it.',designs};
 }
 if(['my prototypes','inspect prototypes','inspect my tools',
  'my instruments','invention tools','prototype status'].includes(action)){
  const prototypes=Rules.act(s,{system:'creation',operation:'prototypeStatus',params:{}});
  return {message:'Only source-authenticated owned invention prototypes and their actual condition. This is not a universal tool catalogue.',prototypes};
 }
 if(['equipment','my equipment','my weapons','equipped weapon','equipment status'].includes(action)){
  const equipment=Rules.act(s,{system:'gear',operation:'status',params:{}});
  return {message:'Only actual owned and previously appraised mundane weapons are shown.',equipment};
 }
 if(['field notices','known field notices','my field notices'].includes(action)){
  const known=Rules.act(s,{system:'opportunity',operation:'status',params:{}});
  return {message:'Previously witnessed Naturalists Guild field notices, including expired and filed requests.',known};
 }
 if(action==='help'||action==='commands'){
  const scene=localScene(s);
  return {message:'Use look/scene for real routes and people; read guild field notices at the real crossing board; sense nearby life only with genuinely earned Soul Perception; cast Arcane Spark while warding only if you actually learned both spells and earned two Circles; file a witnessed field report or track an observed public request; offer to help <present person> with <purpose> for a source-witnessed voluntary offer; do agreed work with <present person> or withdraw work offer <id>; help <present person> with work for immediate cooperation; give beast space for a real nonverbal safety gesture; offer genuine carried materials to an actually present person and respect their independent acceptance or refusal; offer actual carried rations or reeds to a truly encountered compatible wild animal without compelling its decision; survey real habitat signs, interpret their original check, then gather locally evidenced materials (reeds or ironbloom) with actual ecology and stock; you may replant actually carried native reeds or ironbloom in their own habitat and later inspect whether they establish; craft the original poultice with real ingredients at the Morrowfen infirmary or Lumenfall clinic; inspect saved designs and owned prototypes, build a genuine recorded design, calibrate or measure a verified instrument, and repair it with real materials; look for a safe campsite in real wilderness and sleep when it has been verified; travel <linked route> for movement; talk to <actually present person> for witnessed conversation; observe/watch a present beast; rest when safely sheltered; ask Orrin about supplies when actually present to hear a genuine quote, inspect witnessed merchant offers, buy an actual offer, equip a truly owned weapon, or use combat intentions (fight/attack/defend/withdraw) against an authenticated assessed encounter. protected rule operations handle sourced wildlife surveys and harvest, checks, training, medicine, crafting, bonds, research and competitions. The old generic forage, quest payouts, automatic evolution and spell shortcuts are unavailable.',
    scene,examples:['look','travel '+(scene.exits[0]?.id||'<linked route>'),
      ...(scene.nearbyPeople.length?['talk to '+scene.nearbyPeople[0].name]:[])]};
 }
 if(Object.hasOwn(PANELS,action))
  return {message:'Known '+action+' information, without changing time or progression.',
   view:P.full(s,PANELS[action])};
 return null;
}

// Use exactly the existing engine's place-name resolution for known exits.
// A non-adjacent or unknown destination is still a valid travel intention;
// it must not spend time or create a route without verified adjudication.
function linkedTravelIntent(s,action){
 const wanted=action.replace(/^(?:travel|go to|move to)\s+/,'').trim();
 const places=E.LOCATIONS,ids=Object.keys(places);
 let target=Object.hasOwn(places,wanted)?wanted:
  ids.find(id=>places[id].name.toLowerCase()===wanted);
 if(!target){
  const candidates=ids.filter(id=>places[id].name.toLowerCase().includes(wanted));
  if(candidates.length===1)target=candidates[0];
 }
 return !!target && places[s.world.location]?.exits.includes(target);
}
function unresolvedSceneIntent(s,intent){
 const scene=localScene(s);
 return {gmAdjudication:{intent,status:'unresolved',
  location:scene.location,scene:scene.name,visibleContext:scene,
  noRollOccurred:true,noTimeElapsed:true,noItemsChanged:true,
  noOutcomeClaimed:true,requiresSourceBoundResolution:true},
  message:'The intention is open for GM adjudication against the actual local scene. No success, failure, die, item, time, relationship or power has been assigned; use an existing verified rule or narrate only an uncontested source-grounded observation.'};
}

function execute(savePath, req) {
 if(!req || !legalId(req.id))throw Error('Invalid stable turn id');
 if(!['act','check','checkpoint','status','rule'].includes(req.mode))throw Error('Unsupported mode');
 const saved=fs.readFileSync(savePath,'utf8'),preHash=hash(saved);
 const s=E.importGame(saved);
 const runtime=s.chatRuntime||(s.chatRuntime={revision:0,applied:{},focus:[]});
 // Keep the full immutable turn-id ledger. Pruning allowed accidental rerolls
 // after 150 messages, which violates the Table Rules' honest-dice requirement.
 const requestHash=hash(JSON.stringify(req));
 if(runtime.applied?.[req.id]){
   const previous=runtime.applied[req.id];
   if(previous.hash && previous.hash!==requestHash)return {id:req.id,ok:false,applied:false,error:'Turn ID already used for a different request',revision:runtime.revision,stateHash:preHash};
   // If a runner saved the turn but stopped before writing results/<id>.json,
   // recover its original committed mechanical outcome. Never execute it again.
   // Old checkpoints without receipts retain their historical safe fallback.
   const receipt=previous.receipt;
   return {id:req.id,ok:receipt?.ok??true,duplicate:true,applied:false,
    revision:runtime.revision,
    ...(receipt?{recovered:true,originalRevision:previous.revision,
      clock:receipt.clock,output:receipt.output,events:receipt.events,
      ...(receipt.message!==undefined?{message:receipt.message}:{})}:{}),
    stateHash:preHash,panel:P.core(s),hud:P.hudData(s),recap:recap(s)};
 }

 if(req.expectedHash && req.expectedHash!==preHash)return {id:req.id,ok:false,applied:false,error:'Stale checkpoint; reload before processing this turn',stateHash:preHash};
 if(s.campaign?.requiresGmOpening&&s.campaign.openingState!=='authored'&&
  req.mode!=='status'&&!(req.mode==='rule'&&req.system==='world'&&
   req.operation==='authorOpening'))
  throw Error('This campaign has no playable opening yet: the GM must first author a unique real scene and starting place');
 if(req.mode==='status'&&s.campaign?.requiresGmOpening&&
    s.campaign.openingState!=='authored')
  return {id:req.id,ok:true,applied:false,openingPending:true,
   revision:runtime.revision,stateHash:preHash,
   knownCharacter:{name:s.player.name,age:s.player.age},
   note:'The GM has not authored the first scene. The technical save location is not a played or player-known starting place.'};
 if(req.mode==='status')return {id:req.id,ok:true,applied:false,revision:runtime.revision,stateHash:preHash,panel:P.core(s),hud:P.hudData(s),recap:recap(s)};
 const consciousness=s.table?.combatants?.player?.status;
 if(['incapacitated','knocked_out','rehabilitating','dying','dead'].includes(consciousness)){
   const passive=new Set(['health.status','health.clinicStatus','health.rescueStatus','health.criticalStatus','health.physicianRescue','health.criticalCare','health.criticalRehab','combat.status','combat.sceneStatus']);
   if(['act','check'].includes(req.mode)||
      (req.mode==='rule'&&!passive.has(req.system+'.'+req.operation)))
     throw Error('The player is '+consciousness+
       '; no conscious movement, combat, craft, rolls or self-treatment can occur without witnessed external rescue');
 }
 // Organic world inspections are genuinely read-only even when
 // older checkpoints lazily initialise a background realm on first look.
 // Reading public research, individual methods, a household, or personal
 // prepared plans never creates a turn receipt or commits incidental state.
 if(req.mode==='rule'&&['research.designPlansStatus',
   'world.localResearchStatus','world.localInnovationsStatus',
   'world.localHouseholdsStatus'].includes(req.system+'.'+req.operation)){
   const viewed=Rules.act(s,req);
   return {id:req.id,ok:true,applied:false,revision:runtime.revision,
    stateHash:preHash,output:{rules:viewed},
    panel:P.core(E.importGame(saved)),hud:P.hudData(E.importGame(saved))};
 }
 // Inspection is real information, not an action that burns a turn, evicts
 // witnessed history or fabricates a time tick. Never call legacy dispatch
 // merely for a harmless look, menu or self-status.
 if(req.mode==='act'&&typeof req.action==='string'){
  const reading=nonConsequentialAction(s,req.action.trim().toLowerCase());
  if(reading)return {id:req.id,ok:true,applied:false,revision:runtime.revision,
   stateHash:preHash,output:reading,message:reading.message,panel:P.core(E.importGame(saved)),hud:P.hudData(E.importGame(saved)),
   recap:recap(s)};
 }
 const oldRng=s.rngState, oldMinutes=s.world.minutes, oldLog=s.log.length;
 const before=JSON.stringify(s);
 let response={},ok=true;
 if(req.mode==='act'){
   if(typeof req.action!=='string'||req.action.length>200)throw Error('Invalid engine action');
   const action=req.action.trim().toLowerCase();
   const retired=['soothe','qi strike','arcane spark','invite','propose partnership','form bond','evolve','evolve partner'];
   if(retired.includes(action))throw Error('Old HP combat, automatic partnership and one-roll evolution are retired in Project chats. Use the wound/bond/evolution rule operations with established prerequisites.');
   if(/^(?:train|study)\s+/.test(action)||/^(?:evolve|evolution)(?:\s|$)/.test(action)||['human evolution','origin practice','ripening','pattern echo'].includes(action))throw Error('Prototype automatic power training/evolution is retired. Use the verified discipline and evolution rule operations with real tracks, prerequisites and checks.');
   // The offline prototype's research commands bypass the sourced private-chat
   // project, evidence and complication ledger. Never route them through dispatch.
   if(/^research\s+(?:start|survey|week|fieldwork|hypothesis|proof|validate)(?:\s|$)/.test(action))throw Error('Prototype research commands are retired in Project chats. Use the source-backed research rule operations with established evidence and prerequisites.');
   // A source-authored normal medical recipe is supported only at the real
   // clean verified medical workplace. All other prototype craft shortcuts stay retired.
   // Authenticated saved designs can be assembled through the original
   // protected creation rules. Bare craft still cannot name a free recipe.
   if(action==='craft')
     throw Error('Unsupported crafting recipe: name the original known recipe or a recorded and physically supportable design');
   if(action==='forage'||action==='gather')
     throw Error('Prototype foraging cannot mint minerals, shards or resources by repeated legacy rolls. Use world.habitatSurvey, resolve its witnessed check, then world.harvestReeds for the currently supported common fen reed.');
   if(['befriend'].includes(action))
     throw Error('Legacy automatic befriending cannot bypass individual beast welfare, refusal and evidence; use a genuine witnessed animal interaction instead.');
   // No witnessed issuer, task evidence or independently adjudicated payout exists for legacy quests.
   if(/^(?:quest\s+(?:accept|submit)(?:\s|$)|guild$)/.test(action))
     throw Error('Legacy quest board, acceptance and submission are retired in private play; a witnessed issuer, objective and independently verified completion are required.');
   if(/^(?:compete(?:\s|$)|competitions$|tournaments$|events$)/.test(action))
     throw Error('Unscheduled prototype competitions cannot grant repeated prizes, qualifications or ranking points in private play. A witnessed event, actual schedule, officials, entry and scoring prerequisites require a verified competition procedure before results can be awarded.');
   const designWork=physicalDesignIntent(s,action);
   if(['ask orrin about supplies','ask orrin what he sells',
     'ask orrin what is for sale','ask orrin about rations',
     'ask orrin vale about supplies','inquire about provisions',
     'inspect orrin\'s provisions'].includes(action)){
     response.gear=Rules.act(s,{system:'gear',operation:'inquire',
       params:{npcId:'otto'}});
     response.message=response.gear.message;
   }else if(materialPersonIntent(s,action)){
     // A real targeted person gets a choice and physical custody of an
     // accepted item. Neither speech nor gift promises reciprocal favour.
     const {item,npcId}=materialPersonIntent(s,action);
     response.handoff=Rules.act(s,{system:'social',
       operation:'materialHandoff',params:{npcId,item}});
     response.message=response.handoff.message;
   }else if(materialOfferIntent(s,action)){
     const {item}=materialOfferIntent(s,action);
     response.wildlife=Rules.act(s,{system:'world',operation:'offerWildFood',
       params:{item}});
     response.message=response.wildlife.message;
   }else if(['fight','start combat','confront'].includes(action)){
     if(!s.encounter?.beastId)
       throw Error('Old unverified fight initiation is retired; an actual encountered, separately assessed opponent is required');
     response.combat=Rules.act(s,{system:'combat',operation:'begin',
       params:{beastId:s.encounter.beastId}});
     response.message='You enter a genuine assessed wound-model encounter. The creature retains its independent choices.';
   }else if(/^(?:buy|purchase)(?:\s|$)/.test(action)){
     const requested=action.replace(/^(?:buy|purchase)(?:\s+|$)/,'').trim();
     if(!requested)throw Error('Name one actually witnessed local offer or item; no universal market stock is assumed');
     const offerId=knownMerchantOffer(s,requested);
     response.gear=Rules.act(s,{system:'gear',operation:'purchase',params:{offerId}});
     response.message='You purchase the witnessed item at its originally quoted price using actual currency and stock.';
   }else if(/^(?:equip|draw|wield)(?:\s|$)/.test(action)){
     const item=action.replace(/^(?:equip|draw|wield)(?:\s+|$)/,'').trim()
       .replace(/^my\s+/,'').replace(/\s+/g,'_');
     if(!item)throw Error('Name the exact already owned mundane weapon to equip');
     response.gear=Rules.act(s,{system:'gear',operation:'equip',params:{item}});
     response.message='You equip your actually owned and previously appraised mundane weapon.';
   }else if(/^(?:unequip|sheathe|put away)(?:\s|$)/.test(action)){
     const named=action.replace(/^(?:unequip|sheathe|put away)(?:\s+|$)/,'').trim()
       .replace(/^my\s+/,'').replace(/\s+/g,'_');
     const equipped=s.player.equippedWeapon;
     if(named&&named!=='weapon'&&named!==equipped)
       throw Error('You can only put away the weapon actually equipped');
     response.gear=Rules.act(s,{system:'gear',operation:'unequip',params:{}});
     response.message='You put away the currently equipped mundane weapon.';
   }else if(/^(?:attack|strike|hit)(?:\s|$)/.test(action)){
     const m=action.match(/^(?:attack|strike|hit)(?:\s+(nonlethally|non-lethally))?(?:\s+with\s+([a-z0-9 _-]+))?$/);
     if(!m)throw Error('Describe an equipped mundane strike, optionally nonlethally; other tactics need a sourced combat procedure');
     if(!s.battle)throw Error('A real assessed wound-combat scene must already be active before a strike');
     const attackId=equippedMundaneAction(s,m[2]);
     response.combat=Rules.act(s,{system:'combat',operation:'exchange',
       params:{intent:'attack',attackId,...(m[1]?{nonlethal:true}:{})}});
     response.message='Your recorded weapon strikes using the real combat roll; the opponent chooses independently.';
   }else if(['defend','guard','block','defend myself'].includes(action)){
     if(!s.battle)throw Error('Defensive combat exchanges require an actual active assessed wound-model fight');
     response.combat=Rules.act(s,{system:'combat',operation:'exchange',
       params:{intent:'defend'}});
     response.message='You defend while the opponent independently resolves its move.';
   }else if(['retreat','withdraw','flee','try to retreat'].includes(action)){
     if(s.battle){
       response.combat=Rules.act(s,{system:'combat',operation:'exchange',
         params:{intent:'withdraw'}});
       response.message='You try to disengage; the check and opposition decide whether you escape.';
     }else if(s.encounter){
       response.wildlife=Rules.act(s,{system:'world',operation:'giveWildSpace',params:{}});
       response.message=response.wildlife.message;
     }else throw Error('There is no currently witnessed encounter to retreat from');
   }else if(['take cover','seek cover','move into cover'].includes(action)){
     if(!s.battle)throw Error('Cover requires actual ongoing combat and a verified terrain obstacle');
     response.combat=Rules.act(s,{system:'combat',operation:'exchange',
       params:{intent:'take_cover'}});
     response.message='You attempt to occupy physically verified local cover as the opponent acts.';
   }else if(['recover in combat','catch my breath in combat'].includes(action)){
     if(!s.battle)throw Error('Combat recovery requires an actual active assessed wound-model fight');
     response.combat=Rules.act(s,{system:'combat',operation:'exchange',
       params:{intent:'recover'}});
     response.message='You spend your combat exchange recovering while the opponent acts independently.';
   }else if(['parley','attempt to parley'].includes(action)){
     if(!s.battle)throw Error('Combat parley requires an actual active assessed wound-model fight');
     response.combat=Rules.act(s,{system:'combat',operation:'exchange',
       params:{intent:'parley'}});
     response.message='You attempt parley through an actually established communication channel.';
   }else if(['sense nearby life','sense living presences','focus on nearby souls','sense souls around me'].includes(action)){
     response.soul=Rules.act(s,{system:'soul',operation:'perceive',params:{}});
     response.message=response.soul.message;
   }else if(['survey habitat','survey the habitat','survey habitat signs',
     'survey local habitat signs','inspect habitat signs',
     'examine habitat signs','observe habitat signs','survey the fen',
     'survey the forest','survey the foothills','study the local terrain'].includes(action)){
     response.survey=Rules.act(s,{system:'world',operation:'habitatSurvey',params:{}});
     response.message='You spend real time observing local habitat traces; the signs exist, but an honest interpretation is still required.';
   }else if(['interpret habitat signs','interpret the habitat signs',
     'interpret survey','interpret my survey','interpret local traces',
     'interpret the traces'].includes(action)){
     const checkId=onePendingLocalSurvey(s);
     response.surveyCheck=Rules.act(s,{system:'core',operation:'check',params:{checkId}}).check;
     response.message=response.surveyCheck.success?
      'Your real Survival check interprets the observed terrain, without identifying an unobserved creature.':
      'Your real Survival check could not reliably interpret the signs; no resource or species is granted.';
   }else if(materialGatherIntent(action)){
     const item=materialGatherIntent(action);
     const checkId=oneHarvestableLocalSurvey(s,item);
     response.harvest=Rules.act(s,{system:'world',operation:'gatherMaterial',
       params:{item,checkId}});
     response.message='You physically gather one verified local material through actual fieldwork. The source loses stock, and the surrounding habitat bears the disturbance.';
   }else if(materialReplantIntent(action)){
     // Species and location come from the actual world source; no selected
     // roll, viability, or future growth result is accepted from the player.
     const item=materialReplantIntent(action);
     response.planting=Rules.act(s,{system:'world',operation:'replantMaterial',params:{item}});
     response.message=response.planting.viabilityVerified?
      'You plant an actual native specimen. Future survival depends on later independent habitat conditions.':
      'You spend a real native specimen attempting propagation, but this attempt has not established a viable cutting.';
   }else if(['read guild field notices','read field notices','quest board','inspect guild bulletin'].includes(action)){
     response.opportunity=Rules.act(s,{system:'opportunity',operation:'board',params:{}});
     response.message='You read the actual Naturalists Guild bulletin, with real local fieldwork needs but no promised reward.';
   }else if(/^(follow|ignore|release) field notice field_(forest|fen)_[0-9]+$/.test(action)){
     const m=action.match(/^(follow|ignore|release) field notice (field_(?:forest|fen)_[0-9]+)$/);
     response.opportunity=Rules.act(s,{system:'opportunity',operation:'interest',
       params:{noticeId:m[2],choice:m[1]}});
     response.message='You update your own interest in a witnessed field notice; the institution has not promised a contract.';
   }else if(/^file field report field_(forest|fen)_[0-9]+ with habitat_(forest|fen)_[0-9]+$/.test(action)){
     const m=action.match(/^file field report (field_(?:forest|fen)_[0-9]+) with (habitat_(?:forest|fen)_[0-9]+)$/);
     response.opportunity=Rules.act(s,{system:'opportunity',operation:'file',
       params:{noticeId:m[1],checkId:m[2]}});
     response.message='The existing field observation is recorded at the guild without another roll or an invented payout.';
   }else if(['craft field_poultice','craft field poultice'].includes(action.replace(/\s+/g,' ').trim())){
     response.craft=Rules.act(s,{system:'craft',operation:'fieldPoultice',params:{}});
     response.message=response.craft.succeeded?
       'One real standard healing balm was crafted from consumed materials.':
       'The attempt failed; both real ingredients were consumed.';
   }else if(designWork){
     const {id,operation}=designWork;
     response.creation=Rules.act(s,{system:'creation',operation,params:{id}});
     response.message=operation==='prototype'?
      (response.creation.assembled?
       'The physically sourced design is assembled after real supplies, labour and an original Crafting check; the prototype still needs calibration.':
       'The physical construction failed; the real supplies and work were spent.'):
      operation==='repair'?
       (response.creation.repaired?
        'The owned worn instrument is mended; it needs an actual new calibration.':
        'The attempt to repair the instrument failed after real materials and labour.'):
      'The actual owned instrument is tested in its local scene, with one honest check and no hidden supernatural sensing.';
   }else if(['cast arcane spark while warding','cast spark and ward',
      'cast arcane ward and spark together'].includes(action)){
     if(!s.battle)throw Error('Two-channel casting in this implementation requires an actual active combat scene');
     response.combat=Rules.act(s,{system:'combat',operation:'exchange',
       params:{intent:'dual_cast'}});
     response.message='You attempt both already learned Arcane formulas through your earned dual-channel architecture; the opponent resolves its own response.';
   }else if(/^offer to help .+ with .+$/.test(action)){
     const match=action.match(/^offer to help (.+?) with (.+)$/);
     if(!match)throw Error('Offer a real person a practical purpose');
     const worker=actualWorker(s,match[1].trim());
     response.work=Rules.act(s,{system:'social',operation:'proposeLocalWork',
       params:{npcId:worker.npcId,purpose:match[2].trim()}});
     response.message=response.work.message;
   }else if(/^do agreed work with .+$/.test(action)){
     const wanted=action.slice('do agreed work with '.length).trim(),
       worker=actualWorker(s,wanted),
       offers=s.table?.localWorkProposals?.records||{},
       applicable=Object.values(offers).filter(o=>o.npcId===worker.npcId&&
         o.state==='accepted'&&o.day===Math.floor(s.world.minutes/1440)&&
         o.location===s.world.location);
     if(applicable.length!==1)
      throw Error('An actual accepted, unfulfilled local work offer is required');
     response.work=Rules.act(s,{system:'social',operation:'assistLocalPersonWork',
       params:{npcId:worker.npcId,offerId:applicable[0].id}});
     response.message=response.work.message;
   }else if(/^withdraw work offer [a-z0-9_-]+$/.test(action)){
     const id=action.slice('withdraw work offer '.length);
     response.work=Rules.act(s,{system:'social',operation:'withdrawLocalWork',
       params:{offerId:id}});
     response.message=response.work.message;
   }else if(/^(?:help|assist) .+ (?:with|on) (?:their )?work$/.test(action)||
     /^work alongside .+$/.test(action)){
     const wanted=action.startsWith('work alongside ')?
       action.slice('work alongside '.length).trim():
       action.replace(/^(?:help|assist) /,'')
         .replace(/ (?:with|on) (?:their )?work$/,'').trim();
     const matches=PersonPresence.localStatus(s,Rules.realm.peek(s)).people.filter(p=>
       p.npcId.startsWith('emergent:')&&
       (p.name.toLowerCase()===wanted||
        (wanted.length>=4&&p.name.toLowerCase().startsWith(wanted))));
     if(matches.length!==1)throw Error(
       'A single actually present independent worker is required for this currently supported work scene; other tasks need their own witnessed local agreement');
     response.work=Rules.act(s,{system:'social',operation:'assistLocalPersonWork',
       params:{npcId:matches[0].npcId}});
     response.message=response.work.message;
   }else if(/^talk(?:\s|$)/.test(action)){
     const wanted=action.replace(/^talk(?:\s+to)?\s*/, '').trim();
     if(!wanted)throw Error('Name the specific person you want to address in the current location');
     // An open-ended topic can be *asked*, but cannot become a fabricated
     // answer. Keep identity matching separate from player-authored question.
     const about=wanted.lastIndexOf(' about '),
       person=about<0?wanted:wanted.slice(0,about).trim(),
       question=about<0?null:wanted.slice(about+' about '.length).trim();
     if(question!==null&&!question)
       throw Error('Give a genuine topic for the question, not a claimed reply');
     const matches=Object.entries(E.NPCS).filter(([id,n])=>
       n.name.toLowerCase()===person ||
       (person.length>=4 && n.name.toLowerCase().startsWith(person)));
     if(matches.length===1){
       // A question now reaches the original canonical person's own
       // source-verified follow-up path. If no source supports an answer,
       // the engine leaves it unresolved for natural GM dialogue.
       response.npc=Rules.act(s,{system:'npc',operation:'converse',
        params:{npcId:matches[0][0],...(question?{question}:{})}});
       response.message=response.npc.message;
     }else{
       // A newly generated person is addressable by their *actually present*
       // individual name; a remote roster entry does not establish an encounter.
       const named=person,
        inquiry=question||'Could we talk about the work you do here?';
       const people=PersonPresence.localStatus(s,Rules.realm.peek(s)).people.filter(p=>
        (p.npcId.startsWith('emergent:')||
         p.npcId.startsWith('origin-kin:'))&&
        (p.name.toLowerCase()===named||
         (named.length>=4&&p.name.toLowerCase().startsWith(named))));
       if(people.length!==1)
        throw Error('A single established NPC name or actually present person is required for a witnessed conversation');
       response.npc=Rules.act(s,{system:'social',
        operation:people[0].npcId.startsWith('origin-kin:')?
         'speakOriginRelative':'speakLocalPerson',
        params:{npcId:people[0].npcId,question:inquiry}});
       response.message=response.npc.message;
     }
   }else if(['give beast space','give animal space','back away slowly',
     'yield space','lower my posture','lower my stance'].includes(action)){
     if(s.battle){
       response.combat=Rules.act(s,{system:'combat',operation:'exchange',
         params:{intent:'yield_space'}});
       response.message=response.combat.ended?
         'The encounter ends after a nonthreatening attempt to separate.':
         'You visibly give ground without claiming the opponent understands speech; its independent response still resolves.';
     }else{
       response.wildlife=Rules.act(s,{system:'world',operation:'giveWildSpace',params:{}});
       response.message=response.wildlife.message;
     }
   }else if(['approach','approach slowly'].includes(action)){
     const beastId=s.encounter?.beastId;
     if(!beastId)throw Error('A present animal encounter is required for a natural gentle approach');
     response.bond=Rules.act(s,{system:'bond',operation:'interact',
       params:{beastId,approach:'gentle'}});
     response.message=response.bond.message;
   }else if(/^track (?:beast|animal) [a-z0-9_-]{4,80}$/.test(action)){
     const id=action.replace(/^track (?:beast|animal) /,'');
     response.wildlife=Rules.act(s,{system:'world',
      operation:'seekKnownWildBeast',params:{beastId:id}});
     response.message=response.wildlife.message;
   }else if(['watch beast','watch animal','watch quietly'].includes(action)){
     response.wildlife=Rules.act(s,{system:'world',operation:'watchWildBeast',params:{}});
     response.message=response.wildlife.message;
   }else if(['observe','inspect beast'].includes(action)){
     response.wildlife=Rules.act(s,{system:'world',operation:'observe',params:{}});
     response.message=response.wildlife.message;
   }else if(action==='help'||action==='commands'){
     response.message='Private Project play: use natural actions for travel, looking, foraging and dialogue. Use protected rule operations for checks, wound combat/healing, research, power training, beast partnership and evolution. Legacy prototype shortcuts are not available.';
   }else if(['find shelter','look for shelter','look for a safe campsite',
     'find a safe campsite','scout a campsite','search for dry ground to sleep',
     'find somewhere safe to sleep'].includes(action)){
     response.camp=Rules.act(s,{system:'health',operation:'findShelter',params:{}});
     response.message=response.camp.message;
   }else if(/^sleep at fieldcamp_(forest|fen|hills)_[0-9]+$/.test(action)){
     const shelterId=action.slice('sleep at '.length);
     response.health=Health.sleep(s,{shelterId});
     response.message='You sleep at the source-verified campsite; time and the independent world continue.';
   }else if(action==='rest'||action==='sleep'){
     const sites=Health.shelterStatus(s);
     const shelterId=sites.settlementShelter?undefined:
      sites.available.length===1?sites.available[0].shelterId:undefined;
     if(!sites.settlementShelter&&sites.available.length>1)
      throw Error('Choose an actually witnessed campsite by its ID when multiple suitable sites exist');
     response.health=Health.sleep(s,shelterId?{shelterId}:{});
     response.message='You rest at a genuinely suitable shelter while the world moves forward; serious injuries remain.';
   }else if(['heal','use balm','use healing balm','apply healing balm',
     'treat my light wound with healing balm'].includes(action)){
     response.health=Health.balm(s);response.message='Healing balm applied to a genuine Light wound.';
   }else if(/^(?:travel|go to|move to)\s+\S/.test(action)&&
      !linkedTravelIntent(s,action)){
     // The engine must not reject a real journey merely because its route
     // has not yet been established. No unverified teleportation occurs.
     Object.assign(response,unresolvedSceneIntent(s,req.action.trim()));
   }else if(/^(?:travel|go to|move to)\s+\S/.test(action)||
      ['explore','search area','look for beasts','scout',
       'leave','leave beast'].includes(action)){
     // Retain only the explicitly established ordinary legacy movement /
     // exploration bridge. Never let an unfamiliar intention fall through to
     // retired quest, instant prize, automatic power or other old shortcuts.
     if(!E.LOCATIONS[s.world.location]){
      Object.assign(response,unresolvedSceneIntent(s,req.action.trim()));
     }else{
      const r=E.dispatch(s,req.action);ok=r.ok;response.message=r.message;
      if(ok)Health.sync(s,{source:'legacy'});
     }
   }else{
     // Open-ended play is a GM decision, not a parser error and not an excuse
     // to select a DC, loot, NPC consent or skill outcome. An unrecognized
     // intention goes back to the narrator with the real current scene.
     // Trivial warranted actions may be narrated without a roll; genuine
     // uncertain tasks need an already source-committed check/operation.
     Object.assign(response,unresolvedSceneIntent(s,req.action.trim()));
   }

 } else if(req.mode==='rule'){
   if(typeof req.system!=='string'||typeof req.operation!=='string')throw Error('Rule system and operation required');
   // These deterministic read-only views inform the GM's next scene;
   // neither requesting historic context nor inspecting one's own earned
   // physique/practice is itself a new player action or storytelling.
   response.rules=Rules.act(s,req);
   if(['research.status','evolution.status','evolution.eligibility','origin.researchStatus','bond.consent','bond.consentStatus','bond.gradeStatus','combat.status','combat.sceneStatus','gear.offers','gear.status','bond.status','bond.evidenceStatus','bond.careStatus','bond.syncReadiness','health.status','health.clinicStatus','health.rescueStatus','health.criticalStatus','health.shelterStatus','character.status','discipline.status','power.status','soul.perceptionStatus','rift.senseStatus','arcane.sparkStatus','arcane.wardStatus','arcane.dualChannelStatus','meridian.qiStrikeStatus','world.agendaStatus','world.placeStatus','world.cosmologyStatus','world.cosmologyBoundaryStatus','world.historyStatus','world.realmStatus','world.governmentStatus','world.realmOverview','world.atlas','world.heritage','world.culturalPracticeStatus','world.calendar','world.news','world.market','world.species','world.speciesBiologyStatus','world.speciesBiologyAge','world.speciesBiologyFit','world.ecologyStatus','world.beastIndividualStatus','world.habitatSurveyStatus','world.plantingStatus','competition.status','npc.status','social.status','social.groupsStatus','social.groupMembersStatus','social.localPeopleStatus','social.metPeopleStatus','social.originRelativesStatus','social.materialHandoffsStatus','social.witnessedPersonWorkStatus','social.assistedWorkStatus','social.localWorkOffersStatus','opportunity.status','social.sapientBeastMemoriesStatus','social.petitionStatus','social.hearingStatus','social.mediationStatus','craft.status','creation.evaluate','creation.status','creation.personalStatus','creation.aspectStatus','creation.prototypeStatus','rankings.detail','world.wildBehaviourStatus','world.wildMemoriesStatus','world.sightingStatus','world.professionals','world.initiativesStatus','world.diffusionStatus','world.ambitionsStatus','world.peersStatus','world.familyMembersStatus','world.mythic'].includes(req.system+'.'+req.operation))return {id:req.id,ok:true,applied:false,revision:runtime.revision,stateHash:preHash,output:response,panel:P.core(E.importGame(saved)),hud:P.hudData(E.importGame(saved))};
 } else if(req.mode==='check'){
   // The processor's validated campaign field addresses the save; it is not
   // a caller-selected check attribute, DC, modifier or rolled outcome.
   if(Object.keys(req).some(k=>!['id','mode','campaign','checkId','expectedHash','focus'].includes(k)))
     throw Error('A playable scene check takes only a precommitted checkId, not chosen DC, skill, modifier, time or outcome');
   response.check=Rules.act(s,{system:'core',operation:'check',params:{checkId:req.checkId}}).check;

 } else if(req.mode==='checkpoint'){
   if(!req.scene || typeof req.scene!=='string' || req.scene.length>450)throw Error('A short scene pickup point is required');
   s.chatRuntime.scene=req.scene;
   if(req.focus){if(!Array.isArray(req.focus)||req.focus.length>2||req.focus.some(x=>typeof x!=='string'||x.length>80))throw Error('Invalid scene focus');s.chatRuntime.focus=req.focus;}
   const summary=String(req.summary||'').slice(0,400);
   if(summary){s.chatRuntime.journal ||= [];s.chatRuntime.journal.push({day:E.day(s),text:summary});s.chatRuntime.journal=s.chatRuntime.journal.slice(-30);}
   response.message='Scene checkpoint recorded';
 }
 if(ok && req.focus && req.mode!=='checkpoint'){if(!Array.isArray(req.focus)||req.focus.length>2||req.focus.some(x=>typeof x!=='string'||x.length>80))throw Error('Invalid focus');s.chatRuntime.focus=req.focus;}
 // Advance off-screen agendas for ALL time-consuming chat actions, not only
 // explicit world.advance. The calendar ledger deduplicates existing ticks.
 if(s.world.minutes!==oldMinutes)Rules.world.finalizeTime(s,oldMinutes);
 // Canonical wound health is the only mechanically active injury system.
 // Reject conflicting legacy HP mutations BEFORE a save can be written.
 Health.validate(s);
 const changed=(ok || s.rngState!==oldRng || s.world.minutes!==oldMinutes) && JSON.stringify(s)!==before;

 if(!changed)return {id:req.id,ok,applied:false,revision:runtime.revision,message:response.message,output:response,stateHash:preHash,panel:P.core(E.importGame(saved)),hud:P.hudData(E.importGame(saved))};
 runtime.applied ||= {};
 runtime.revision=(Number(runtime.revision)||0)+1;
 // Archive only the original player-facing outcome, dice/events and clock
 // *within the same atomic save* as the applied-turn marker. The original
 // stateHash and panels cannot be archived here without a self-hashing save.
 // A replay uses the saved original outcome and the current honest HUD.
 const events=s.log.slice(oldLog).filter(x=>x.type!=='notice').slice(-12);
 const receipt={ok,clock:E.clock(s),output:response,events,
  ...(response.message!==undefined?{message:response.message}:{})};
 runtime.applied[req.id]={revision:runtime.revision,mode:req.mode,
  hash:requestHash,receipt};
 const next=E.exportGame(s)+'\n';
 const tmp=savePath+'.tmp-'+process.pid;
 try{fs.writeFileSync(tmp,next,{flag:'wx'});fs.renameSync(tmp,savePath);}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}
 return {id:req.id,ok,applied:true,revision:runtime.revision,stateHash:hash(next),
  clock:receipt.clock,output:receipt.output,events:receipt.events,
  ...(receipt.message!==undefined?{message:receipt.message}:{}),
  panel:P.core(s),hud:P.hudData(s),recap:recap(s)};
}
module.exports={execute,hash,legalId};
if(require.main===module){
 const [save,request]=process.argv.slice(2);
 if(!save||!request){console.error('Usage: node scripts/chat-turn.js <save.json> <request.json>');process.exit(2);}
 try{console.log(JSON.stringify(execute(save,JSON.parse(fs.readFileSync(request,'utf8'))),null,2));}
 catch(err){console.error(err.stack||err.message);process.exitCode=1;}
}