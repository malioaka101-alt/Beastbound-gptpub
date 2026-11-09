'use strict';
// Species are authored by the GM, not generated as automatic attacks or pets.
// Reuse the real bestiary, habitat state, existing native-birth profile,
// and actual idempotent saved-turn engine.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine'),New=require('../scripts/new-campaign'),Rules=require('../rules');
const Bestiary=require('../world/bestiary'),World=require('../world/simulation');
const Generations=require('../world/wild-generations'),Turn=require('../scripts/chat-turn');
const state=(seed=58321)=>New.create({seed,slug:'living_species_test_001',mode:'gm',age:19,
 gmOpening:{locationId:'fen',scene:'In the damp reed beds, migrating moths gather near pale flowers. Their presence is not proof that every stranger can catch one.',focus:'A wetland morning',weather:'quiet mist',hour:9,minute:15}}).state;
const s=state(),coins=s.player.coins,rng=s.rngState,raw=E.exportGame(s),
 originalAnimals=structuredClone(s.beasts||{});
const first=Rules.act(s,{system:'world',operation:'speciesBiologyStatus',params:{}});
A.equal(first.species.length,2);
A.ok(first.species.some(x=>x.id==='authored:fenfox'));
A.ok(first.species.some(x=>x.id==='authored:stonehare'));
A.equal(E.exportGame(s),raw,'Read-only bestiary should not modify saved reality');
A.equal(Bestiary.bioValidate(World.peek(s).speciesBiology),true);
A.equal(World.peek(s).speciesBiology.species['authored:fenfox'].reproduction.gestationDays,
 Generations.Species.fenfox.gestationDays);
A.equal(World.peek(s).speciesBiology.species['authored:stonehare'].reproduction.adultDays,
 Generations.Species.stonehare.adultDays);
const status=Rules.act(s,{system:'world',operation:'speciesBiologyStatus',params:{speciesId:'authored:fenfox'}});
A.equal(status.known,true);
A.equal(status.species.taxonomy.family,E.SPECIES.fenfox.family);
A.equal(status.species.organs[0].name,'Mist gland');
A.equal(status.species.noSpeciesCreationOrPresentEncounter,true);
A.equal(Rules.act(s,{system:'world',operation:'speciesBiologyAge',
 params:{speciesId:'authored:fenfox',ageDays:200}}).lifeStage,'juvenile');
A.equal(Rules.act(s,{system:'world',operation:'speciesBiologyAge',
 params:{speciesId:'authored:fenfox',ageDays:370}}).lifeStage,'adult-or-later');
const fit=Rules.act(s,{system:'world',operation:'speciesBiologyFit',
 params:{speciesId:'authored:fenfox',regionId:'whisperfen'}});
A.equal(fit.known,true);A.equal(fit.listedHabitat,true);
A.equal(fit.noGuaranteedPresence,true);A.equal(fit.noAutomaticConception,true);
A.ok(typeof fit.limits.water==='boolean');
const legacy=E.importGame(E.exportGame(s));delete legacy.table.realm.speciesBiology;
const oldBefore=E.exportGame(legacy);
A.equal(Bestiary.bioStatus(legacy,{}).species.length,2);
A.equal(E.exportGame(legacy),oldBefore,'Legacy campaign must read the bestiary without creating a new saved registry');

const creature={
 speciesId:'gm:reedglass_pollenmoth',name:'Reedglass Pollenmoth',
 taxonomy:{kingdom:'Beastkind',phylum:'Arthropoda',class:'Insecta',
  order:'Lepidoptera',family:'Luminopteridae',genus:'Phosvelia',species:'reedglass'},
 parentSpeciesId:'authored:glasswing',
 variantDescription:'A related small dusk pollinator whose wing structure uses a darker wetland pigment than the existing glasswing line.',
 bodyPlan:'Six-legged flying arthropod with two pairs of narrow wings, a nectar feeding tube and a ventral abdomen.',
 habitatRegions:['whisperfen','copperwood'],
 ecologicalRole:'A dusk pollinator of reed-bed flowering plants and an ordinary prey animal.',
 diet:'nectar from dusk-opening flowers',affinity:'diffuse low-energy light',
 reproduction:{mode:'egg clutch',gestationDays:null,juvenileDays:24,adultDays:75,lifespanDays:480},
 needs:null,
 organs:[{name:'Prismatic wing vein',
  function:'Refracts ambient dusk-light while the moth flies between flowers; it is not an attack technique.',
  limit:'Requires wings in sound condition and sufficient light; cannot grant automatic stealth or a copied human spell.',
  energy:'Sustained by ordinary feeding and existing metabolism, without a declared player mana reward.'}],
 originPattern:'A coherent arthropod inherited wing and pollination lineage with no automatically transferable beast-origin trait.',
 basis:'The GM establishes this wetland ecology profile as a newly witnessed biological species account.',
 visibility:'public'};
A.equal(Rules.act(s,{system:'world',operation:'speciesBiologyAuthor',params:creature}).recorded,true);
A.equal(E.SPECIES.reedglass_pollenmoth,undefined);
A.equal(s.player.coins,coins);
A.equal(s.rngState,rng,'Writing a pre-established species is not a dice roll');
A.deepEqual(s.beasts||{},originalAnimals,'Species documentation cannot create or alter a real beast');
A.ok(!Object.values(s.beasts||{}).some(b=>b.species===creature.speciesId),
 'New taxon does not create a free individual encounter');
const byId=Bestiary.lookup(creature.speciesId,{state:s});
A.equal(byId.taxonomy.family,'Luminopteridae');
A.equal(byId.knownEvolutionBranches.length,0);
A.equal(byId.rarity,'unclassified');
const learned=Rules.act(s,{system:'world',operation:'speciesBiologyStatus',params:{speciesId:creature.speciesId}});
A.equal(learned.known,true);
A.equal(learned.species.parentSpeciesId,'authored:glasswing');
A.equal(learned.species.reproduction.adultDays,75);
const stage=Rules.act(s,{system:'world',operation:'speciesBiologyAge',
 params:{speciesId:creature.speciesId,ageDays:30}});
A.equal(stage.lifeStage,'juvenile');
const unknownFit=Rules.act(s,{system:'world',operation:'speciesBiologyFit',
 params:{speciesId:creature.speciesId,regionId:'whisperfen'}});
A.equal(unknownFit.suitability,'unknown','Unknown physiology does not fabricate numeric ecological fitness');
A.throws(()=>World.knownTaxon(s,{id:creature.speciesId}),/not been identified/,
 'Public biological literature is not proof the player met or identified that species');
A.throws(()=>Rules.act(s,{system:'world',operation:'speciesBiologyAuthor',params:creature}),/already|established/i);

const related={...creature,speciesId:'gm:rivercopper_pollenmoth',
 name:'Rivercopper Pollenmoth',parentSpeciesId:'gm:reedglass_pollenmoth',
 variantDescription:'A later distinct regional radiation has copper wing reflectance and is concentrated in forest-edge nectar corridors.',
 habitatRegions:['copperwood'],visibility:'gm-only'};
A.equal(Rules.act(s,{system:'world',operation:'speciesBiologyAuthor',params:related}).recorded,true);
A.equal(Bestiary.bioStatus(s,{speciesId:related.speciesId}).known,false);
A.throws(()=>Bestiary.lookup(related.speciesId,{state:s}),/No identified public taxonomy/);
A.equal(Rules.act(s,{system:'world',operation:'speciesBiologyAge',
 params:{speciesId:related.speciesId,ageDays:100}}).profileKnown,false);
A.throws(()=>Rules.act(s,{system:'world',operation:'speciesBiologyAuthor',params:{
 ...creature,speciesId:'gm:incoherent_lineage',
 taxonomy:{...creature.taxonomy,family:'Unrelatedidae'}}}),/family/);
A.throws(()=>Rules.act(s,{system:'world',operation:'speciesBiologyAuthor',params:{
 ...creature,speciesId:'gm:instant_beast_companion',freePower:true}}),/concrete established biological facts/);

const note={speciesId:creature.speciesId,category:'field-observation',
 observation:'Field notebooks record this species visiting twilight flowers, not an impossible permanent glow.',
 basis:'A publicly established naturalist observation of flowering reed beds.',
 visibility:'public'};
A.equal(Rules.act(s,{system:'world',operation:'speciesBiologyNote',params:note}).recorded,true);
A.equal(Rules.act(s,{system:'world',operation:'speciesBiologyNote',params:note}).alreadyRecorded,true);
A.equal(Bestiary.bioStatus(s,{speciesId:creature.speciesId}).species.observations.length,1);
A.throws(()=>Rules.act(s,{system:'world',operation:'speciesBiologyNote',params:{
 ...note,speciesId:related.speciesId}}),/hidden species/);
const saved=E.importGame(E.exportGame(s));
A.equal(Bestiary.bioValidate(saved.table.realm.speciesBiology),true);
A.equal(saved.table.realm.speciesBiology.species[creature.speciesId].observations.length,1);
const forged=E.importGame(E.exportGame(s));
forged.table.realm.speciesBiology.species[creature.speciesId].bodyPlan='A newly claimed flying whale';
A.throws(()=>Bestiary.bioStatus(forged,{}),/source biology was silently rewritten/);
const forgedNote=E.importGame(E.exportGame(s));
forgedNote.table.realm.speciesBiology.species[creature.speciesId].observations[0].observation='Invented secret power';
A.throws(()=>Bestiary.bioStatus(forgedNote,{}),/observation was rewritten/);
const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-gm-biology-'));
try{
 const file=Path.join(dir,'save.json'),fixture=state(58322);
 FS.writeFileSync(file,E.exportGame(fixture)+'\n');
 const before=FS.readFileSync(file,'utf8');
 const read=Turn.execute(file,{id:'biology_read_001',mode:'rule',
  system:'world',operation:'speciesBiologyStatus',params:{}});
 A.equal(read.applied,false);A.equal(FS.readFileSync(file,'utf8'),before);
 const req={id:'biology_author_001',mode:'rule',system:'world',
  operation:'speciesBiologyAuthor',params:creature};
 A.equal(Turn.execute(file,req).applied,true);
 const after=FS.readFileSync(file,'utf8');
 A.equal(Turn.execute(file,req).duplicate,true);
 A.equal(FS.readFileSync(file,'utf8'),after);
 A.equal(E.importGame(after).table.realm.speciesBiology.species[creature.speciesId].name,creature.name);
}finally{FS.rmSync(dir,{recursive:true,force:true});}
console.log('Living bestiary: real existing mammal lifecycles, GM-authored taxa and inherited variants, organs with limits, habitat fit against independent ecological state, private observations, source hashes, no auto-spawn and real save replay.');
