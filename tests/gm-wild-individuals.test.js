'use strict';
// Original GM species ecology -> truly witnessed persistent individual ->
// non-invasive independent observation -> sixday life -> saved provenance.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),E=require('../engine'),
 New=require('../scripts/new-campaign'),Rules=require('../rules'),
 Time=require('../rules/world'),World=require('../world/simulation'),
 GM=require('../world/gm-wild-individuals'),
 Unique=require('../world/beast-individuality'),Turn=require('../scripts/chat-turn');
const marker='silver-veined moth';
const s=New.create({seed:853019,slug:'gm_individual_wild_test',mode:'gm',age:16,
 gmOpening:{locationId:'forest',
 scene:'A '+marker+' pauses on the copperwood flowers while the young explorer watches from the path.',
 focus:'A quiet forest margin',weather:'cool forest air',
 hour:9,minute:15}}).state;
const rule=(operation,params={},state=s)=>Rules.act(state,{system:'world',operation,params});
const species={
 speciesId:'gm:silvervein_moth',name:'Silvervein Moth',
 taxonomy:{kingdom:'Beastkind',phylum:'Arthropoda',class:'Insecta',
  order:'Lepidoptera',family:'Luminopteridae',genus:'Lucemna',species:'silvervein'},
 parentSpeciesId:'authored:glasswing',
 variantDescription:'A distinctive small forest pollinator with narrow reflective wing scales, distinct from its ancestral form.',
 bodyPlan:'Six-limbed small flying arthropod with paired wings, light-sensitive antennae and nectar feeding mouthparts.',
 habitatRegions:['copperwood'],
 ecologicalRole:'Ordinary forest-flower pollinator and small prey animal within the local living food web.',
 diet:'flower nectar and fine pollen',affinity:'ordinary low-energy light',
 reproduction:{mode:'egg clutch',gestationDays:null,juvenileDays:30,adultDays:85,lifespanDays:410},
 needs:{minForage:20,minWater:20,minQuality:15,maxPressure:98},
 organs:[{name:'Reflective wing scales',function:'Scatter existing light during ordinary natural wing motion.',
  limit:'Cannot prove magical invisibility, a combat strike, sensory perfection or human transfer.',
  energy:'Supported only by ordinary food metabolism, not a new magical energy resource.'}],
 originPattern:'Distinct inherited arthropod wing and feeding anatomy, not a grant of spiritual or human-origin power.',
 basis:'The GM has established a sourced new taxon observed among genuine local flowers.',
 visibility:'public'};
A.equal(rule('speciesBiologyAuthor',species).recorded,true);
A.equal(rule('ecologyAuthorPopulation',{
 regionId:'copperwood',speciesId:species.speciesId,index:20,capacity:60,
 basis:'Direct GM-established local recurring ecology and flower pollinator sightings.',
 visibility:'public'}).recorded,true);
const playerRng=s.rngState,coins=s.player.coins,prior=Object.keys(s.beasts).length;
const observed={speciesId:species.speciesId,marker,
 description:'Small patterned moth with unusual silver veins moving in sunlight above the nearby flowers.',
 witness:'The GM saw the same silver-veined moth on flowering plants at the established local scene.'};
A.throws(()=>rule('gmWildWitness',{...observed,freePower:true}),/witnessed GM beast requires/);
const meeting=rule('gmWildWitness',observed);
A.equal(meeting.witnessed,true);
A.equal(Object.keys(s.beasts).length,prior+1);
A.equal(s.rngState,playerRng);
A.equal(s.player.coins,coins);
A.equal(s.encounter,null,'Actual close encounter, forced approach and combat were not granted');
const b=s.beasts[meeting.beastId];
A.equal(b.species,species.speciesId);A.equal(GM.sealed(b),true);
A.equal(GM.verify(s,b),true);
A.equal(b.owner,null);A.equal(b.relationship,'wild');
A.equal(b.level,undefined,'Unmeasured numeric grade and level must not appear');
A.equal(b.hp,undefined,'No invented combat physiology');
A.equal(b.energy,undefined,'No invented spell or physical energy profile');
A.equal(b.condition,undefined,'Unobserved clinical condition cannot be presumed perfect');
A.equal(b.sapience,undefined,'No invented cognitive classification');
A.equal(b.techniques,undefined,'No unearned combat techniques');
A.equal(rule('gmWildStatus',{beastId:b.id}).individuals[0].visibleMarker,marker);
const memory=rule('wildMemoriesStatus');
A.ok(memory.knownIndividuals.some(x=>x.beastId===b.id&&
 x.lastObservedAction==='original visual sighting only'&&
 x.lastSeenLocation==='forest'&&x.currentlyPresent==='not established'),
 'Existing wildlife memory recognises the first personally witnessed GM beast');
A.equal(rule('beastIndividualStatus',{beastId:b.id}).known,true,
 'Existing individual identity status recognises the documented first sighting');
A.throws(()=>rule('gmWildWitness',observed),/cannot be manufactured twice/);
A.throws(()=>rule('watchWildBeast',{beastId:b.id,forceFriendly:true}),/only the original creature/);
const minutes=s.world.minutes,watch=rule('watchWildBeast',{beastId:b.id});
A.equal(watch.observed,true);A.equal(s.world.minutes,minutes+12);
A.equal(s.rngState,playerRng,'Beast alone makes its own behavioural decision');
A.equal(b.individualLife.witnessed.length,1);
A.ok(rule('wildMemoriesStatus').knownIndividuals.some(x=>x.beastId===b.id));
if(!b.away)A.throws(()=>rule('watchWildBeast',{beastId:b.id}),/distinct later source-witnessed/);
A.equal(watch.noContactOrBond,true);
A.equal(s.player.partnerIds.length,0);
A.equal(Unique.verify(b),true);
A.equal(rule('beastIndividualObserve',{beastId:b.id,category:'patterned-flight',
 description:'The silver-veined moth pauses repeatedly in the shade instead of following the nearby wind.',
 basis:'A unique factual observation follows this personally witnessed noninvasive ecological behaviour.',
 visibility:'gm-only'}).recorded,true);
A.equal(Unique.verify(b),true);
const beforeSearch=s.world.minutes,beforeStamina=s.player.stamina,
 search=rule('seekKnownWildBeast',{beastId:b.id});
A.equal(search.searched,true);
A.equal(search.minutes,45);
A.equal(s.world.minutes,beforeSearch+45);
A.equal(s.player.stamina,beforeStamina-3);
A.equal(search.noAutomaticBond,true);
A.equal(s.encounter,null,'A distant GM-beast re-sighting never manufactures a combat or bond encounter');
A.equal(search.noCombatOrBondEncounter,true);
if(search.found){
 A.equal(search.distantSightingOnly,true);
 const foundProof=b.individualLife.returnEncounters.at(-1);
 A.ok(foundProof?.originalSourceHash===b.individualLife.sourceHash);
 // A genuine elapsed interval, not a fresh roll, permits the animal another watch.
 E.advance(s,5);
 const watchedAgain=rule('watchWildBeast',{beastId:b.id});
 A.equal(watchedAgain.observed,true);
 A.equal(b.individualLife.witnessed.length,2);
 A.throws(()=>rule('watchWildBeast',{beastId:b.id}),
   /source-witnessed later re-encounter|safely available/);
}
A.equal(Unique.verify(b),true);
A.throws(()=>rule('beastTechniqueRecord',{beastId:b.id}),/unique technique needs/);
const copy=E.importGame(E.exportGame(s));
A.equal(copy.beasts[b.id].condition,undefined,'Save integration must not infer perfect condition');
A.equal(GM.verify(copy,copy.beasts[b.id]),true);
const finalRng=copy.rngState,oldMoney=copy.player.coins;
Time.advance(copy,30);
const updated=copy.beasts[b.id];
A.equal(GM.verify(copy,updated),true,'Changing real habitat data cannot retroactively falsify a true original sighting');
A.ok(updated.individualLife.history.some(x=>x.type==='offscreen-sixday'));
A.equal(copy.rngState===finalRng,false,'Original world time advances its own normal engine RNG');
A.equal(copy.player.coins,oldMoney);
A.equal(updated.hp,undefined);A.equal(updated.level,undefined);
A.equal(copy.player.partnerIds.length,0);
const tampered=E.importGame(E.exportGame(copy));
tampered.beasts[b.id].gmWild.source.description='False rewritten morphology';
A.equal(GM.sealed(tampered.beasts[b.id]),false);
A.equal(GM.verify(tampered,tampered.beasts[b.id]),false);
const tamperedBio=E.importGame(E.exportGame(s));
tamperedBio.table.realm.speciesBiology.species[species.speciesId].bodyPlan='A totally unrelated animal';
A.equal(GM.verify(tamperedBio,tamperedBio.beasts[b.id]),false,
 'GM individual verification must reject altered species biology, not trust a stale source hash');
A.throws(()=>require('../world/bestiary').bioValidate(tamperedBio.table.realm.speciesBiology),
 /silently rewritten/);
const tmp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-gm-wild-fixture-'));
try{
 const f=Path.join(tmp,'save.json'),original=E.exportGame(s)+'\n';
 FS.writeFileSync(f,original);
 const read=Turn.execute(f,{id:'gm_wild_status_read_01',mode:'rule',
  system:'world',operation:'gmWildStatus',params:{beastId:b.id}});
 A.equal(read.ok,true);A.equal(read.applied,false);
 A.equal(FS.readFileSync(f,'utf8'),original);
}finally{FS.rmSync(tmp,{recursive:true,force:true});}
console.log('GM beast integration: existing biological species, local population, sourced individual in original beasts, nonviolent agency, private sixday life, uniqueness observations, stable save, no stats/consent/powers');
