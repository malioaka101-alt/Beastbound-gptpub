'use strict';
// Foundation #04: source-based species ecology in the ORIGINAL world clock.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine'),New=require('../scripts/new-campaign'),R=require('../rules');
const World=require('../world/simulation'),Web=require('../world/ecological-webs'),B=require('../world/bestiary');
const Turn=require('../scripts/chat-turn');
const make=seed=>New.create({seed,slug:'regional_ecology_test_001',mode:'gm',age:24,
 gmOpening:{locationId:'forest',scene:'Two original wild mammal lineages use the wooded verge without offering a meeting to any visitor.',focus:'Living forest margin',weather:'cool',hour:9,minute:15}}).state;
const s=make(79311),w=World.peek(s);
A.equal(Web.validate(w),true);
A.equal(w.ecosystems.copperwood.speciesWeb.populations['authored:fenfox'].index,24);
A.equal(w.ecosystems.copperwood.speciesWeb.populations['authored:stonehare'].index,46);
const player={coins:s.player.coins,partners:s.player.partnerIds.length,
 beasts:Object.keys(s.beasts||{}).length,rng:s.rngState};
const savedBefore=E.exportGame(s);
const local=R.act(s,{system:'world',operation:'ecologyStatus',params:{}});
A.equal(local.known,true);A.equal(local.populations.length,2);
A.equal(local.links.length,2);A.equal(local.noGuaranteeOfSightingsBirthsOrIndividualHunts,true);
A.ok(!Object.hasOwn(local,'habitat'),'Unwitnessed hidden raw habitat counters must not appear in published ecology');
A.equal(E.exportGame(s),savedBefore,'Reading local published ecology must not mutate campaign');
A.equal(R.act(s,{system:'world',operation:'ecologyStatus',params:{regionId:'whisperfen'}}).known,false,
 'Remote private or public census is not magically learned');
A.throws(()=>R.act(s,{system:'world',operation:'ecologyAuthorPopulation',
 params:{regionId:'imaginary_meadow',speciesId:'authored:fenfox',index:25,
 capacity:60,basis:'Some unsupported distant population record'}}),/established species habitat/);
const moth={speciesId:'gm:cedar_pollenmoth',name:'Cedar Pollenmoth',
 taxonomy:{kingdom:'Beastkind',phylum:'Arthropoda',class:'Insecta',order:'Lepidoptera',
  family:'Luminopteridae',genus:'Cerdavia',species:'cedar_pollenmoth'},
 parentSpeciesId:'authored:glasswing',
 variantDescription:'A forest-edge relative with patterned wing scales and a preference for cedar nectar.',
 bodyPlan:'Six-limbed small flying insect with paired wings, an elongated nectar tube and light-sensitive feelers.',
 habitatRegions:['copperwood','whisperfen'],
 ecologicalRole:'A small plant pollinator and prey insect of open woodland flowers.',
 diet:'nectar and pollen from flowering woodland plants',affinity:'ambient light',
 reproduction:{mode:'egg clutch',gestationDays:null,juvenileDays:18,adultDays:72,lifespanDays:360},
 needs:{minForage:25,minWater:25,minQuality:20,maxPressure:85},
 organs:[{name:'Light-scattering wing scale',
  function:'Scatters available natural light while the moth flies among flowers.',
  limit:'Requires intact wings and ambient light; does not form a spell or invisibility.',
  energy:'Ordinary nectar metabolism, not transferable human mana.'}],
 originPattern:'An insect-derived wing and feeding lineage with no automatically usable human integration.',
 basis:'GM establishes a local flower-visiting taxon on documented original woodland habitat.',
 visibility:'public'};
A.equal(R.act(s,{system:'world',operation:'speciesBiologyAuthor',params:moth}).recorded,true);
A.equal(R.act(s,{system:'world',operation:'ecologyAuthorPopulation',params:{
 regionId:'copperwood',speciesId:moth.speciesId,index:28,capacity:74,
 basis:'Local naturalists report a modest, recurring woodland pollenmoth abundance index.',
 visibility:'public'}}).recorded,true);
A.throws(()=>R.act(s,{system:'world',operation:'ecologyAuthorPopulation',params:{
 regionId:'copperwood',speciesId:moth.speciesId,index:100,capacity:180,
 basis:'Unverified replacement observation from the same region.'}}),/already established/);
A.equal(R.act(s,{system:'world',operation:'ecologyAuthorLink',params:{
 regionId:'copperwood',fromSpeciesId:moth.speciesId,
 toSpeciesId:'habitat:forage',kind:'pollinates-habitat',
 basis:'Local flower visits by the new moth contribute to ordinary forest seed cycles.',
 visibility:'public'}}).recorded,true);
A.throws(()=>R.act(s,{system:'world',operation:'ecologyAuthorLink',params:{
 regionId:'copperwood',fromSpeciesId:moth.speciesId,toSpeciesId:moth.speciesId,
 kind:'preys-on',basis:'A made-up self predator link should never pass'}}),/Food link/);
A.throws(()=>R.act(s,{system:'world',operation:'ecologyAuthorLink',params:{
 regionId:'copperwood',fromSpeciesId:moth.speciesId,toSpeciesId:'habitat:forage',
 kind:'pollinates-habitat',basis:'Duplicate ecology should never multiply effects'}}),/already exists/);
const secret=R.act(s,{system:'world',operation:'ecologyAuthorPopulation',params:{
 regionId:'whisperfen',speciesId:moth.speciesId,index:6,capacity:30,
 basis:'GM establishes the lesser-known edge of the moth population in a neighbouring wetland.',
 visibility:'gm-only'}});
A.equal(secret.recorded,true);
const beforeTick=structuredClone(w.ecosystems.copperwood.speciesWeb);
World.tick(s,[6,12,18,24,30],[30]);
A.equal(w.ticks.sixdays,5);A.equal(w.ticks.months,1);
A.equal(Web.validate(w),true);
A.ok(w.ecosystems.copperwood.speciesWeb.populations[moth.speciesId].history.length>0);
A.notDeepEqual(w.ecosystems.copperwood.speciesWeb,beforeTick,
 'Living relationships should affect a saved and continuing ecosystem');
A.equal(s.player.coins,player.coins);A.equal(s.player.partnerIds.length,player.partners);
A.equal(Object.keys(s.beasts||{}).length,player.beasts);
A.equal(s.rngState,player.rng,'Independent web ticks must not consume player dice');
A.equal(w.ecosystems.whisperfen.speciesWeb.populations[moth.speciesId].origin.visibility,'gm-only');
const publicMoth=R.act(s,{system:'world',operation:'ecologyStatus',params:{}});
A.ok(publicMoth.populations.some(x=>x.speciesId===moth.speciesId));
A.ok(!publicMoth.populations.some(x=>x.regionId==='whisperfen'));
const round=E.importGame(E.exportGame(s));
A.equal(Web.validate(World.peek(round)),true);
A.deepEqual(World.peek(round).ecosystems.copperwood.speciesWeb,w.ecosystems.copperwood.speciesWeb);
const altered=E.importGame(E.exportGame(s));
altered.table.realm.ecosystems.copperwood.speciesWeb.populations[moth.speciesId].origin.startIndex=191;
A.throws(()=>Web.validate(World.peek(altered)),/source was changed/);
const alteredHistory=E.importGame(E.exportGame(s));
alteredHistory.table.realm.ecosystems.copperwood.speciesWeb.populations[moth.speciesId].history[0].after=189;
A.throws(()=>Web.validate(World.peek(alteredHistory)),/history was rewritten/);
const legacy=E.importGame(E.exportGame(s));
delete legacy.table.realm.ecosystems.copperwood.speciesWeb;
A.equal(Web.validate(World.peek(legacy)),true,'Old saves without a new web remain loadable');
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'beastbound_ecology_'));
try{
 const path=Path.join(dir,'state.json'),fixture=make(79315);
 FS.writeFileSync(path,E.exportGame(fixture)+'\n');
 const exact=FS.readFileSync(path,'utf8');
 const read=Turn.execute(path,{id:'ecology_read_01',mode:'rule',
  system:'world',operation:'ecologyStatus',params:{}});
 A.equal(read.applied,false);
 A.equal(FS.readFileSync(path,'utf8'),exact);
 const request={id:'ecology_author_01',mode:'rule',
  system:'world',operation:'ecologyAuthorPopulation',
  params:{regionId:'whisperfen',speciesId:'authored:fenfox',
   index:17,capacity:72,visibility:'gm-only',
   basis:'GM sources a coherent newly surveyed fox abundance in the existing fen habitat.'}};
 A.equal(Turn.execute(path,request).applied,true);
 const committed=FS.readFileSync(path,'utf8');
 A.equal(Turn.execute(path,request).duplicate,true);
 A.equal(FS.readFileSync(path,'utf8'),committed);
 A.equal(E.importGame(committed).table.realm.ecosystems.whisperfen.speciesWeb
  .populations['authored:fenfox'].index,17);
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('Ecological web: original regional habitats, authored taxa, guarded population indices, source-hashed links, independent food/reproduction pressures, conservation-bounded migration, hidden data, persistence, original dice and actual protected turn replay.');
