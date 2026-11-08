'use strict';
// Disposable new-game fixtures: narrative place authorship belongs to GM.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const Engine=require('../engine'),New=require('../scripts/new-campaign');
const Rules=require('../rules'),Realm=require('../world/simulation');
const Places=require('../world/lived-places'),Panels=require('../panels');
const Presence=require('../world/person-presence'),Turn=require('../scripts/chat-turn');
const create=(seed=44566)=>New.create({slug:'freeform_place_fixture',seed,mode:'guided',startLocation:'crossing'}).state;
const place={placeId:'winding_lane_01',name:'Winding Lantern Hamlet',
 regionId:'morrowfen_basin',kind:'riverside community',sceneType:'settlement',
 description:'Low reed-roof houses share a raised stone path beside the river. Barges pass below distant lanterns.',
 culture:'Residents exchange seasonal flood notices, honour established beast crossings, and disagree about how much riverbank should be cleared.',
 notables:[{name:'Mira Quill',context:'A locally known document restorer, whose current whereabouts and willingness to speak have not been established.'}],
 families:[{name:'Quill family',context:'A locally mentioned family with a trade in restoring old ledgers, not an inherited power or political office.'}],
 organisations:[{name:'River Watch Circle',context:'An informal, publicly mentioned flood-watch association; no members or physical attendance are implied.'}]};

const s=create(),old=Engine.exportGame(s);
A.equal(Places.peek(s),null);
const unregistered=Rules.act(s,{system:'world',operation:'placeStatus',params:{}});
A.equal(unregistered.knownPlaces.length,0);
A.equal(Engine.exportGame(s),old,'Reading places does not initialise the living-world ledger');
A.throws(()=>Rules.act(s,{system:'world',operation:'travelTo',
 params:{destinationId:place.placeId,minutes:75,journey:'An ordinary established path along the river with a daylight crossing.',uncontested:true}}),/established destination/);
A.equal(Engine.exportGame(s),old);
A.throws(()=>Rules.act(s,{system:'world',operation:'establishPlace',
 params:{...place,location:'crossing',gold:500}}),/only the specified real scene facts/);
const initCoins=s.player.coins,initRng=s.rngState,initWorldSeed=s.table.realm.rngState;
const added=Rules.act(s,{system:'world',operation:'establishPlace',params:place});
A.equal(added.established,true);
A.equal(added.place.id,place.placeId);
A.equal(added.place.knownNotables[0].notProvenPresent,true);
A.equal(s.world.location,'crossing','Describing a place does not teleport the player');
A.equal(s.player.coins,initCoins);
A.equal(s.rngState,initRng);
A.equal(s.table.realm.rngState,initWorldSeed);
A.equal(Presence.localStatus(s,Realm.peek(s)).people.some(x=>x.name==='Mira Quill'),false);
const read=Rules.act(s,{system:'world',operation:'placeStatus',params:{placeId:place.placeId}});
A.equal(read.place.knownFamilies[0].name,'Quill family');
A.equal(read.current,false);
A.equal(read.place.sceneType,'settlement');
const beforeRead=Engine.exportGame(s);
Rules.act(s,{system:'world',operation:'placeStatus',params:{}});
A.equal(Engine.exportGame(s),beforeRead);
A.throws(()=>Rules.act(s,{system:'world',operation:'establishPlace',params:place}),/cannot be overwritten/);
A.equal(Engine.exportGame(s),beforeRead);
A.throws(()=>Rules.act(s,{system:'world',operation:'establishPlace',
 params:{...place,placeId:'crossing'}}),/cannot be overwritten/);
const note={placeId:place.placeId,category:'history',name:'The winter bank repair',
 context:'Residents recall flood repairs made by paid workers twenty years ago; this supplies no current contract or wages.'};
const detail=Rules.act(s,{system:'world',operation:'recordPlaceNote',params:note});
A.equal(detail.recorded,true);
A.equal(Places.get(s,place.placeId).notes.length,1);
A.equal(Rules.act(s,{system:'world',operation:'recordPlaceNote',params:note}).alreadyKnown,true);
A.equal(Places.get(s,place.placeId).notes.length,1);

const beforeBlocked=Engine.exportGame(s);
A.throws(()=>Rules.act(s,{system:'world',operation:'travelTo',params:{
 destinationId:place.placeId,minutes:1,journey:'',uncontested:true}}),/GM-supported journey/);
A.throws(()=>Rules.act(s,{system:'world',operation:'travelTo',params:{
 destinationId:place.placeId,minutes:150,journey:'Known path following the eastern bank, with no contested crossing.',uncontested:false}}),/GM-supported journey/);
A.equal(Engine.exportGame(s),beforeBlocked);
const beforeTripMinutes=s.world.minutes;
const trip=Rules.act(s,{system:'world',operation:'travelTo',params:{
 destinationId:place.placeId,minutes:185,
 journey:'The player follows the confirmed low riverbank path, passing the already visible reed cottages without any dangerous crossings.',
 means:'walking',uncontested:true}});
A.equal(trip.arrived,true);
A.equal(s.world.location,place.placeId);
A.equal(s.world.minutes,beforeTripMinutes+185);
A.equal(s.flags.visited[place.placeId],true);
A.equal(s.player.coins,initCoins);
A.equal(s.rngState,initRng);
A.equal(s.table.realm.rngState,initWorldSeed);
A.equal(Realm.publicStatus(s).region,'Morrowfen Basin');
A.equal(Engine.status(s).location,place.name);
A.ok(Engine.recap(s).includes(place.name));
A.ok(Engine.coreHud(s).includes(place.name.slice(0,15)));
A.equal(Panels.hudData(s).location,place.name);
A.ok(Panels.core(s).includes(place.name.slice(0,12)));
A.equal(Rules.act(s,{system:'world',operation:'placeStatus',params:{placeId:place.placeId}}).current,true);
A.equal(Rules.act(s,{system:'health',operation:'shelterStatus',params:{}}).settlementShelter,true);
A.equal(Presence.localStatus(s,Realm.peek(s)).people.length,0);
A.equal(Engine.importGame(Engine.exportGame(s)).world.location,place.placeId);
A.equal(Engine.exportGame(s).includes('Winding Lantern Hamlet'),true);
const scene=Turn.execute; // actual file-backed turns checked below
A.equal(Places.peek(s).journeys.length,1);
A.equal(Places.peek(s).journeys[0].from,'crossing');
A.equal(Places.peek(s).journeys[0].to,place.placeId);
A.throws(()=>Rules.act(s,{system:'world',operation:'travelTo',params:{
 destinationId:place.placeId,minutes:80,journey:'This would be the same place, not a journey of any kind.',uncontested:true}}),/GM-supported journey/);

const restore=Rules.act(s,{system:'world',operation:'travelTo',params:{
 destinationId:'crossing',minutes:200,
 journey:'A non-dangerous return along the riverbank from the established hamlet.',uncontested:true}});
A.equal(restore.arrived,true);
A.equal(s.world.location,'crossing');
A.equal(s.player.coins,initCoins);
A.equal(Presence.localStatus(s,Realm.peek(s)).people.some(x=>x.name==='Mira Quill'),false);
const after=Engine.importGame(Engine.exportGame(s));
const existing=after.table.realm.livedPlaces.places[place.placeId];
existing.description='Forged perfect city of riches';
A.equal(Places.verifyPlace(existing),false,
 'Canonical place description is sealed; additional observed facts are appended rather than rewriting original scene history');

const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-authored-places-'));
try{
 const file=Path.join(dir,'campaign.json'),state=create(44567);
 FS.writeFileSync(file,Engine.exportGame(state)+'\n');
 const before=FS.readFileSync(file,'utf8');
 const first=Turn.execute(file,{id:'places_readonly_001',mode:'rule',
  system:'world',operation:'placeStatus',params:{}});
 A.equal(first.applied,false);
 A.equal(FS.readFileSync(file,'utf8'),before);
 const made=Turn.execute(file,{id:'places_create_001',mode:'rule',
  system:'world',operation:'establishPlace',params:place});
 A.equal(made.ok,true);
 A.equal(made.applied,true);
 const fixed=FS.readFileSync(file,'utf8');
 const again=Turn.execute(file,{id:'places_create_001',mode:'rule',
  system:'world',operation:'establishPlace',params:place});
 A.equal(again.duplicate,true);
 A.equal(FS.readFileSync(file,'utf8'),fixed);
 const journey=Turn.execute(file,{id:'places_journey_001',mode:'rule',
  system:'world',operation:'travelTo',params:{
   destinationId:place.placeId,minutes:250,
   journey:'A previously agreed and uneventful riverbank walk from the current village to the lantern hamlet.',
   uncontested:true}});
 A.equal(journey.ok,true);A.equal(journey.applied,true);
 const latest=Engine.importGame(FS.readFileSync(file,'utf8'));
 A.equal(latest.world.location,place.placeId);
 const status=Turn.execute(file,{id:'places_status_002',mode:'status'});
 A.equal(status.ok,true);
 A.equal(status.applied,false);
 A.ok(status.hud.location===place.name);
 const here=Turn.execute(file,{id:'places_look_003',mode:'act',action:'look'});
 A.equal(here.ok,true);
 A.equal(here.applied,false);
 A.ok(here.output.scene.name===place.name);
 A.equal(Presence.localStatus(latest,Realm.peek(latest)).people.length,0);
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('GM-authored in-play places are persistent and readable without phantom NPCs; freeform uneventful travel advances the original world clock without forcing prebuilt ports or travel graph edges.');
