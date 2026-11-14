'use strict';
// A source-witnessed wild animal may freely withdraw or tolerate a respectful
// first approach. No shortcut to sapience, Grade, a tame encounter or trust.
// Disposable fixtures only; all genuine original systems remain authoritative.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),E=require('../engine'),
 New=require('../scripts/new-campaign'),Rules=require('../rules'),
 GM=require('../world/gm-wild-individuals'),Turn=require('../scripts/chat-turn');
function make(seed){
const marker='silver-veined moth';
const s=New.create({seed,slug:'gm_first_approach_fixture',mode:'gm',age:16,
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

 const observed={speciesId:species.speciesId,marker,
  description:'Small patterned moth with unusual silver veins moving in sunlight above the nearby flowers.',
  witness:'The GM saw the same silver-veined moth on flowering plants at the established local scene.'};
 const result=rule('gmWildWitness',observed);
 const b=s.beasts[result.beastId];
 A.equal(GM.verify(s,b),true);
 const before=E.exportGame(s);
 A.throws(()=>rule('gmWildFirstApproach',{beastId:b.id}),
  /recent genuine safe-distance animal watch/);
 A.equal(E.exportGame(s),before,'An unwitnessed approach cannot alter state');
 return {s,b,rule};
}
let chosen=null,withdrawn=false;
for(let seed=853019;seed<853031;seed++){
 const x=make(seed);
 const before=x.s.rngState;
 const watch=x.rule('watchWildBeast',{beastId:x.b.id});
 A.equal(watch.observed,true);
 A.equal(x.s.rngState,before,'Watching uses the beast own RNG');
 if(x.b.away){
  withdrawn=true;
  A.throws(()=>x.rule('gmWildFirstApproach',{beastId:x.b.id}),
   /free, visible, unengaged/);
  continue;
 }
 chosen=x;break;
}
A.ok(chosen,'At least one actually observed GM individual must remain nearby');
const {s,b,rule}=chosen;
const playerRng=s.rngState;
const earlier=E.exportGame(s),baseMinute=s.world.minutes;
A.throws(()=>rule('gmWildFirstApproach',{beastId:b.id,accepted:true}),
 /accepts only the previously witnessed beastId/);
A.equal(E.exportGame(s),earlier,'Caller-supplied animal consent is rejected before state changes');
const output=rule('gmWildFirstApproach',{beastId:b.id});
A.equal(output.attempted,true);
A.ok(['withdraw','remain-at-distance'].includes(output.reaction));
A.equal(output.noTrustAward,true);
A.equal(output.noBondOrContactGranted,true);
A.equal(output.noGradeOrSapienceAward,true);
A.equal(s.world.minutes,baseMinute+6);
A.equal(s.rngState,playerRng,'Only the independent animal RNG selects its response');
A.equal(s.encounter,null);
A.equal(s.battle,null);
A.equal(s.player.partnerIds.length,0);
A.equal(s.table?.bondRecords?.[b.id],undefined);
A.equal(b.sapience,undefined);A.equal(b.grade,undefined);
A.equal(b.condition,undefined);A.equal(b.energy,undefined);
A.equal(GM.verify(s,b),true);
A.equal(GM.sealed(b),true);
A.equal(!!b.away,output.reaction==='withdraw');
A.equal(rule('gmWildStatus',{beastId:b.id}).individuals[0].lastPersonallyObserved,
 b.individualLife.firstApproach.description);
const after=E.exportGame(s);
A.throws(()=>rule('gmWildFirstApproach',{beastId:b.id}),
 /first approach has already occurred|free, visible, unengaged/);
A.equal(E.exportGame(s),after,'First-contact decision is not rerollable');
const copy=E.importGame(after);
A.equal(GM.verify(copy,copy.beasts[b.id]),true);
copy.beasts[b.id].individualLife.firstApproach.source.rngAfter^=17;
A.equal(GM.verify(copy,copy.beasts[b.id]),false,
 'Independent choice proof cannot be silently rewritten');
const old=E.importGame(earlier);
const tmp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-gm-first-approach-'));
try {
 const file=Path.join(tmp,'save.json');
 FS.writeFileSync(file,earlier+'\n');
 const req={id:'gm_wild_first_approach_20261114',mode:'rule',
  system:'world',operation:'gmWildFirstApproach',params:{beastId:b.id}};
 const result=Turn.execute(file,req);
 A.equal(result.ok,true);A.equal(result.applied,true);
 A.equal(result.output.rules.reaction,output.reaction);
 A.equal(Turn.execute(file,req).duplicate,true,
  'Replays return the original response, never a new animal choice');
 const saved=E.importGame(FS.readFileSync(file,'utf8'));
 A.equal(GM.verify(saved,saved.beasts[b.id]),true);
 A.equal(saved.world.minutes,old.world.minutes+6);
 A.equal(saved.player.partnerIds.length,0);
 A.equal(saved.beasts[b.id].sapience,undefined);
 A.equal(saved.beasts[b.id].individualLife.firstApproach.source.rngAfter,
  b.individualLife.firstApproach.source.rngAfter);
}finally{FS.rmSync(tmp,{recursive:true,force:true});}
console.log('GM wild first approach: source-witnessed autonomous refusal/tolerance, genuine time, original animal RNG, sealed single decision, neutral contact only, honest save/replay');
