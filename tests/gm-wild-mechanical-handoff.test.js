'use strict';
// Source-verified GM biology/individual ecology -> real observed anatomy -> 
// existing encounter, original wound combat and independent beast agency.
// Unmeasured wildlife stays unclassified and cannot enter combat by narration.
const A=require('node:assert/strict'),E=require('../engine'),
 New=require('../scripts/new-campaign'),R=require('../rules'),
 GM=require('../world/gm-wild-individuals'),G=require('../world/bestiary'),
 CombatSource=require('../rules/combat-provenance');
const marker='silver-veined moth';
const scene='A silver-veined moth pauses on the copperwood flowers while the young explorer watches from the path.';
const s=New.create({seed:853121,slug:'gm_wild_source_combat_test',
 mode:'gm',age:16,gmOpening:{locationId:'forest',scene,
 focus:'A quiet natural forest encounter',weather:'cool forest air',
 hour:9,minute:15}}).state;
const act=(op,params={},st=s)=>R.act(st,{system:'world',operation:op,params});
const species={speciesId:'gm:silvervein_moth_combat',name:'Silvervein Moth',
 taxonomy:{kingdom:'Beastkind',phylum:'Arthropoda',class:'Insecta',
  order:'Lepidoptera',family:'Luminopteridae',genus:'Lucemna',species:'silvervein'},
 parentSpeciesId:'authored:glasswing',
 variantDescription:'A distinctive forest pollinator with narrow reflective wings and exceptionally light body structure.',
 bodyPlan:'Six-limbed small flying arthropod with paired wings, light-sensitive antennae and nectar feeding mouthparts.',
 habitatRegions:['copperwood'],
 ecologicalRole:'Ordinary forest-flower pollinator and small prey animal within the local food web.',
 diet:'flower nectar and fine pollen',affinity:'ordinary low-energy light',
 reproduction:{mode:'egg clutch',gestationDays:null,juvenileDays:30,adultDays:85,lifespanDays:410},
 needs:{minForage:20,minWater:20,minQuality:15,maxPressure:98},
 organs:[{name:'Reflective wing scales',
  function:'Scatter sunlight during ordinary flight and provide no demonstrated attack magic.',
  limit:'No verified invisibility, attack spell, copied human ability or special contract.',
  energy:'Supported by ordinary natural food metabolism, not magical energy.'}],
 originPattern:'Inherited wing morphology and ordinary food metabolism, not a source of free supernatural arts.',
 basis:'GM-established biologically consistent forest pollinator with source witnessed anatomy.',
 visibility:'public'};
A.equal(act('speciesBiologyAuthor',species).recorded,true);
A.equal(act('ecologyAuthorPopulation',{regionId:'copperwood',
 speciesId:species.speciesId,index:20,capacity:60,
 basis:'Direct GM-established recurring copperwood pollinator population observed in the local habitat.',
 visibility:'public'}).recorded,true);
const receipt=act('gmWildWitness',{speciesId:species.speciesId,marker,
 description:'Small patterned moth with unusual silver veins flying in sunlight above forest blossoms.',
 witness:'The GM witnessed a silver-veined moth on real local flowers at the existing copperwood scene.'});
const b=s.beasts[receipt.beastId];
A.equal(b.combatAssessment,undefined);
A.equal(GM.verify(s,b),true);
A.throws(()=>act('gmWildEngage',{beastId:b.id}),/source-characterised/);
const step=n=>{n=n>>>0;n^=n<<13;n^=n>>>17;n^=n<<5;return n>>>0||0x91e10da5;};
const goodSeed=(()=>{for(let i=1;i<10000;i++)if(step(i)/4294967296>.82)return i;throw Error('independent source fixture');})();
b.individualLife.rngState=goodSeed;
A.equal(act('watchWildBeast',{beastId:b.id}).observed,true);
A.equal(b.away,false);
const stats={toughness:3,defense:12,stamina:8,vigor:0,will:0,
 offM:0,durM:0,sapience:0,attack:1,damage:2,boxes:[3,2,1]};
const behavior={style:'cautious',nonlethal:true,canCommunicate:false,
 withdrawalDC:11,parleyDC:19,
 source:'Observed independent evasive motion; no evidence of a spoken language or predatory pursuit.'};
const assessment={beastId:b.id,witness:scene,
 anatomicalBasis:'The documented paired wings and light body structure support bounded natural endurance, modest defense and nonmagical impact only.',
 cognitionEvidence:'Repeated observation reveals ordinary animal-level alertness without any source of personal speech or complex sapient negotiation.',
 welfareEvidence:'The original visual study supports this momentary physical condition and resource state without assuming a permanent perfect health.',
 sapience:0,condition:75,hunger:28,fatigue:12,stats,behavior};
A.throws(()=>act('gmWildCharacterise',{...assessment,stats:{...stats,attack:999}}),/attack|measured/);
A.equal(b.combatAssessment,undefined);
const time=s.world.minutes,coins=s.player.coins,playerRoll=s.rngState;
const recorded=act('gmWildCharacterise',assessment);
A.equal(recorded.assessed,true);
A.equal(recorded.noGradeOrTechniqueGranted,true);
A.equal(s.world.minutes,time);
A.equal(s.player.coins,coins);
A.equal(s.rngState,playerRoll);
A.equal(GM.verify(s,b),true);
A.equal(b.individualGrade,undefined);
A.equal(b.energy,undefined);
A.equal(b.consent,undefined);
A.equal(GM.verifyProfile(s,b),true);
const sourceHash=b.gmWild.profile.sourceHash;
const snap=E.importGame(E.exportGame(s));
A.equal(GM.verify(snap,snap.beasts[b.id]),true);
const forged=E.importGame(E.exportGame(s));
forged.beasts[b.id].combatAssessment.stats.damage=90;
A.equal(GM.verify(forged,forged.beasts[b.id]),false);
A.throws(()=>CombatSource.begin(forged,{beastId:b.id}),/current unengaged|source-verified/);
b.individualLife.rngState=goodSeed;
const approached=act('gmWildEngage',{beastId:b.id});
A.equal(approached.encounterOpen,true);
A.equal(s.encounter.beastId,b.id);
A.equal(s.encounter.distanceMetres,undefined);
A.equal(s.player.partnerIds.length,0);
A.equal(s.rngState,playerRoll);
const bondState=E.importGame(E.exportGame(s));
const bond=R.act(bondState,{system:'bond',operation:'register',params:{beastId:b.id}});
A.equal(bond.recorded,true);
A.equal(bondState.beasts[b.id].consent,undefined);
A.equal(bondState.player.partnerIds.length,0);
const beforeCombat=s.world.minutes;
const started=R.act(s,{system:'combat',operation:'begin',params:{beastId:b.id}});
A.equal(started.started,true);
A.equal(started.verifiedIndividualProfile,true);
A.equal(s.battle.mode,'wounds-v1');
A.equal(s.battle.beastId,b.id);
A.equal(s.encounter,null);
A.equal(GM.verify(s,b),true);
A.ok(s.world.minutes===beforeCombat);
const rounds=R.act(s,{system:'combat',operation:'exchange',params:{intent:'defend'}});
A.ok(rounds.ownResult.defending);
A.equal(s.world.minutes,beforeCombat+1);
A.equal(GM.verify(s,b),true);
const saved=E.importGame(E.exportGame(s));
A.equal(GM.verify(saved,saved.beasts[b.id]),true);
A.equal(saved.beasts[b.id].gmWild.profile.sourceHash,sourceHash);
console.log('GM wildlife source profile -> actual encounter, original bond history and wound-combat exchange passed');
