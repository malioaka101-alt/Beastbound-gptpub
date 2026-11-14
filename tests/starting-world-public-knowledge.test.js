'use strict';
// Starting World: public familiarity is already in the original Atlas,
// houses, bestiary, government and discipline canon. It is not a second
// world generator, player skill, sighting, contract or hidden event.
const A=require('node:assert/strict'),Fs=require('node:fs'),
 Os=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),Rules=require('../rules'),
 Atlas=require('../world/atlas'),Houses=require('../world/social-houses'),
 B=require('../world/bestiary'),Realm=require('../world/simulation'),
 Gov=require('../world/government-offices'),
 View=require('../world/starting-world'),
 Turn=require('../scripts/chat-turn.js');
const s=E.newGame({seed:180014,name:'Starting World Ordinary Resident',path:'undecided'});
const save=()=>E.exportGame(s),original=save(),rng=s.rngState,minute=s.world.minutes;
const view=topic=>Rules.act(s,{system:'world',operation:'startingWorld',params:{topic}});
A.equal(View.SOURCE,'established-common-world-knowledge-v1');
A.equal(View.TOPICS.length,10);
const overview=view('overview');
A.equal(overview.source,View.SOURCE);
A.equal(overview.continents.length,6);
A.equal(overview.wellKnownStates.length,16);
A.equal(overview.familiarHouseNames.length,14);
A.equal(overview.recognisedPaths.length,8);
A.equal(overview.currentWorldUnchanged,true);
A.ok(overview.neverGrants.includes('NPC consent'));
const continents=view('continents');
A.deepEqual(continents.continents.map(x=>x.name),Atlas.continents.map(x=>x.name));
A.equal(continents.continents.length,6);
const polities=view('polities');
A.equal(polities.polities.length,24);
A.deepEqual(polities.polities.map(x=>x.name),Atlas.polities.map(x=>x.name));
A.equal(polities.trade.length,Atlas.tradeRoutes.length);
A.equal(polities.polities.find(x=>x.id==='reef_cantons').formOfGovernment,'beast polity');
A.equal(polities.polities.find(x=>x.id==='asterwyn').formOfGovernment,'monarchy');
A.equal(polities.polities.find(x=>x.id==='red_sultanate').formOfGovernment,'sultanate');
A.ok(polities.polities.every(x=>!Object.hasOwn(x,'ruler')&&
 !Object.hasOwn(x,'treasury')&&!Object.hasOwn(x,'diplomacy')));
const families=view('families');
A.equal(families.wellKnownHouses.length,14);
A.ok(families.wellKnownHouses.every(x=>
 Houses.byId[x.id].name===x.name&&!Object.hasOwn(x,'privateRelations')&&
 !Object.hasOwn(x,'powers')&&!Object.hasOwn(x,'publicElder')));
A.equal(view('institutions').familiarInstitutions.length,15);
const systems=view('systems');
A.equal(systems.noUnifiedRankLadder,true);
A.deepEqual(systems.disciplines.map(x=>x.id),[
 'meridian','arcane','soul','body','beast-origin','rift','specialist','partnership']);
A.equal(systems.disciplines.find(x=>x.id==='partnership').measures.includes('agreement'),true);
A.equal(view('beasts').familiarLineages.length,14);
A.ok(view('beasts').familiarLineages.every(x=>
 B.GROUPS.some(g=>g.id===x.id&&g.name===x.name)&&
 !Object.hasOwn(x,'mechanism')&&!Object.hasOwn(x,'sapience')&&
 !Object.hasOwn(x,'evolutions')));
A.ok(view('beasts').familiarLocalExamples.length>=4);
A.ok(view('beasts').familiarLocalExamples.every(x=>x.folkGrade==='Common'&&
 !Object.hasOwn(x,'ability')&&!Object.hasOwn(x,'evolutions')));
A.equal(view('life').ordinaryCustoms.length,7);
A.equal(view('life').publicFestivals.length,Atlas.festivals.length);
A.deepEqual(view('history').commonHistory.map(x=>x.era),Atlas.history.map(x=>x.era));
const local=view('local');
A.equal(local.local.placed,true);
A.equal(local.local.locationId,'crossing');
A.equal(local.local.region,'Morrowfen Basin');
A.equal(local.local.polity,'Reedmarch Compact');
A.equal(local.local.localPublicGovernment.officeholder,
 Gov.report(Realm.peek(s),'reedmarch').officeholder);
A.deepEqual(local.local.locallyKnownFamilies.map(x=>x.id),
 Houses.houses.filter(h=>h.polity==='reedmarch').map(x=>x.id));
A.ok(local.local.locallyKnownFamilies.every(x=>x.publicElder&&x.publicDispute));
A.ok(local.local.locallyKnownInstitutions.some(x=>x.id==='naturalists_guild'));
A.equal(save(),original);A.equal(s.rngState,rng);A.equal(s.world.minutes,minute);
for(const fake of [{topic:'current-diplomacy'}, {topic:'families',secret:true},
 {topic:'systems',learnTechnique:'all'}, {topic:'local',forceRegion:'reef_cantons'}]){
 A.throws(()=>Rules.act(s,{system:'world',operation:'startingWorld',params:fake}),
 /Unknown Starting World topic|accepts only a public topic/);
 A.equal(save(),original);
}
// A different ACTUAL connected local location gives different regional
// familiarity without teleportation by reading.
A.equal(E.dispatch(s,'travel forest').ok,true);
const inForest=view('local');
A.equal(inForest.local.locationId,'forest');
A.equal(inForest.local.region,'Copperwood Verge');
A.equal(inForest.local.polity,'Reedmarch Compact');
A.notDeepEqual(inForest.local.regionTraits,local.local.regionTraits);
const lateSave=save(),later=E.importGame(lateSave);
A.deepEqual(View.status(later,{topic:'local'}),inForest);
A.equal(E.exportGame(later),lateSave);
// During new campaign generation, the un-authored technical staging
// location is NEVER asserted to be the player's lived starting place.
const pre=E.newGame({seed:180015,name:'Unopened Starting Life',path:'undecided'});
pre.campaign={requiresGmOpening:true,openingState:'awaiting-gm'};
A.equal(View.status(pre,{topic:'local'}).local.placed,false);
A.equal(View.status(pre,{topic:'overview'}).continents.length,6);
const tmp=Fs.mkdtempSync(Path.join(Os.tmpdir(),'bb-starting-world-'));
try{
 const path=Path.join(tmp,'disposable.json');
 Fs.writeFileSync(path,E.exportGame(pre)+'\n');
 const unchanged=Fs.readFileSync(path,'utf8');
 const ruleRead=Turn.execute(path,{id:'common_world_read_0001',
  mode:'rule',system:'world',operation:'startingWorld',params:{topic:'polities'}});
 A.equal(ruleRead.ok,true);A.equal(ruleRead.applied,false);
 A.equal(ruleRead.output.rules.polities.length,24);
 A.equal(Fs.readFileSync(path,'utf8'),unchanged);
 const natural=Turn.execute(path,{id:'common_world_read_0002',
  mode:'act',action:'starting world'});
 A.equal(natural.ok,true);A.equal(natural.applied,false);
 A.equal(natural.output.startingWorld.continents.length,6);
 A.equal(Fs.readFileSync(path,'utf8'),unchanged);
 const powers=Turn.execute(path,{id:'common_world_read_0003',
  mode:'act',action:'power systems'});
 A.equal(powers.ok,true);A.equal(powers.applied,false);
 A.equal(powers.output.startingWorld.disciplines.length,8);
 A.equal(Fs.readFileSync(path,'utf8'),unchanged);
 const blocked=Turn.execute(path,{id:'common_world_read_0004',
  mode:'rule',system:'world',operation:'startingWorld',params:{topic:'local'}});
 A.equal(blocked.applied,false);A.equal(blocked.output.rules.local.placed,false);
 A.equal(Fs.readFileSync(path,'utf8'),unchanged);
 A.throws(()=>Turn.execute(path,{id:'common_world_fake_0001',
  mode:'rule',system:'world',operation:'startingWorld',
  params:{topic:'polities',revealPlans:true}}),/accepts only a public topic/);
 A.throws(()=>Turn.execute(path,{id:'common_world_fake_0002',
  mode:'act',action:'look'}),/no playable opening yet/);
 A.equal(Fs.readFileSync(path,'utf8'),unchanged);
 // Once a game actually has a played scene, both the established local
 // culture and other public topics are available without changes.
 const active=E.newGame({seed:180016,name:'Actual Common Knowledge Resident'});
 Fs.writeFileSync(path,E.exportGame(active)+'\n');
 const activeStart=Fs.readFileSync(path,'utf8');
 for(const [id,action,topic] of [
  ['common_world_read_0005','world kingdoms','polities'],
  ['common_world_read_0006','famous families','families'],
  ['common_world_read_0007','common beasts','beasts'],
  ['common_world_read_0008','local common knowledge','local']
 ]){
  const seen=Turn.execute(path,{id,mode:'act',action});
  A.equal(seen.applied,false);A.equal(seen.output.startingWorld.topic,topic);
  A.equal(Fs.readFileSync(path,'utf8'),activeStart);
 }
}finally{Fs.rmSync(tmp,{recursive:true,force:true});}
console.log('Starting World public knowledge: all 6 continents/24 states, real family & institution references, distinct powers, common beasts and festivals; no secret/current-state leakage, no time/RNG/save effects, new campaign opening privacy, local context and chat read-only PASS');
