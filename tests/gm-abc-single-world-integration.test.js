'use strict';
// Disposable, single-save GM integration across original independent wildlife,
// field instruction and source-conserved material. NEVER a live campaign save.
const A=require('node:assert/strict'),E=require('../engine'),R=require('../rules'),
 New=require('../scripts/new-campaign'),GM=require('../world/gm-wild-individuals'),
 Person=require('../world/emergent-people'),Groups=require('../world/emergent-groups'),
 Agency=require('../world/group-member-agency'),Material=require('../rules/material-discovery');
const scene='Silver-veined moths pass over the Copperwood flowers. A Silver-Striped Ration rests on a clean field table. Talia Meadow is working in the forest clearing, demonstrating how to check ordinary research notebooks while teaching visitors to recognise mistaken measurements. The moth remains on a visible blossom.';
const s=New.create({seed:29873,slug:'disposable_gm_abc_single_save',
 mode:'gm',age:25,gmOpening:{locationId:'forest',scene,
 focus:'A field lesson near a natural wildlife habitat',
 weather:'cool afternoon sunlight',hour:10,minute:0}}).state;
const social=(op,params={})=>R.act(s,{system:'social',operation:op,params});
const world=(op,params={})=>R.act(s,{system:'world',operation:op,params});
const creation=(op,params={})=>R.act(s,{system:'creation',operation:op,params});
const baselineCoins=s.player.coins,baselineStock=s.player.inventory.clean_rations,
 baselinePartners=[...(s.player.partnerIds||[])];
// 3C: an existing personally held ration supports a real observed variant
// with exactly one original appraisal. This is not an extra physical good.
const owned=social('documentOwnedMaterial',{ownerId:'player',
 item:'clean_rations',quantity:1,
 description:'The personally carried silver-striped ration has a distinct visible grain casing on the real forest field table.'});
A.equal(owned.documented,true);
const sample={assetId:owned.id,materialId:'field_silver_grain',
 name:'Silver-Striped Ration',
 visibleBasis:'The original carried ration has a prominent silver stripe and visibly different ordinary grain fibres on its casing.'};
s.rngState=0xabcdef01; // disposable independent test fixture; never live play
A.equal(creation('appraiseSourcedMaterial',sample).identified,true);
A.equal(Material.count(s,sample.materialId),1);
A.equal(s.player.inventory.clean_rations,baselineStock-1);
A.equal(creation('releaseSourcedMaterial',{materialId:sample.materialId}).released,true);
A.equal(s.player.inventory.clean_rations,baselineStock);
A.equal(Material.count(s,sample.materialId),0);
// 3A: actual sourced biology, ecological population and living individual.
// The animal's reaction draws from ITS own independent wildlife RNG.
const species={speciesId:'gm:field_copper_glider',name:'Copper Glider',
 taxonomy:{kingdom:'Beastkind',phylum:'Arthropoda',class:'Insecta',
  order:'Lepidoptera',family:'Luminopteridae',genus:'Copperna',species:'glider'},
 parentSpeciesId:'authored:glasswing',
 variantDescription:'Small copper-veined pollinator with a soft green abdomen and delicate reflective wings.',
 bodyPlan:'Six-legged flying arthropod with paired veined wings, antennae and simple nectar feeding organs.',
 habitatRegions:['copperwood'],
 ecologicalRole:'Ordinary blossom pollinator and light prey creature in a genuine forest habitat.',
 diet:'nectar and trace pollen',affinity:'unverified ordinary reflected sunlight',
 reproduction:{mode:'egg clutch',gestationDays:null,juvenileDays:30,adultDays:85,lifespanDays:410},
 needs:{minForage:20,minWater:20,minQuality:15,maxPressure:98},
 organs:[{name:'Reflective wing veins',
  function:'Scatter ordinary sunlight without any demonstrated magical attack or copied technique.',
  limit:'No sourced invisibility, teleportation, telepathy, ownership or affection.',
  energy:'Ordinary food metabolism, not proven mana or qi.'}],
 originPattern:'Ordinary insect anatomy, not a free cultivation rank or supernatural effect.',
 basis:'GM-established field pollinator with witnessed wing anatomy and a compatible ecological niche.',
 visibility:'public'};
A.equal(world('speciesBiologyAuthor',species).recorded,true);
A.equal(world('ecologyAuthorPopulation',{regionId:'copperwood',
 speciesId:species.speciesId,index:20,capacity:60,
 basis:'Direct evidence of a recurring compatible Copperwood blossom pollinator population.',
 visibility:'public'}).recorded,true);
const found=world('gmWildWitness',{speciesId:species.speciesId,
 marker:'Silver-veined moth',
 description:'A small moth with delicate reflective copper veins on visible forest blossoms.',
 witness:'Silver-veined moths pass over the Copperwood flowers.'});
const b=s.beasts[found.beastId];
A.equal(GM.verify(s,b),true);
A.equal(b.combatAssessment,undefined);
const step=n=>{n=n>>>0;n^=n<<13;n^=n>>>17;n^=n<<5;return n>>>0||0x91e10da5;};
const watchSeed=(()=>{for(let i=0x80000000;i<0x80020000;i++)
 if(step(i)/4294967296>.82)return i;throw Error('Missing animal fixture');})();
b.individualLife.rngState=watchSeed;
A.equal(world('watchWildBeast',{beastId:b.id}).observed,true);
A.equal(b.away,false);
A.equal(world('gmWildCharacterise',{beastId:b.id,witness:scene,
 anatomicalBasis:'Paired wings, a fragile exoskeleton, and tiny ordinary organs provide bounded flight and light stamina.',
 cognitionEvidence:'Repeated observation indicates basic animal reactions to light and motion, without demonstrated personal speech.',
 welfareEvidence:'The visible animal forages and appears alert but its health assessment is limited to observed external condition.',
 sapience:0,condition:75,hunger:28,fatigue:12,
 stats:{toughness:3,defense:12,stamina:8,vigor:0,will:0,
  offM:0,durM:0,sapience:0,attack:1,damage:2,boxes:[3,2,1]},
 behavior:{style:'cautious',nonlethal:true,canCommunicate:false,
  withdrawalDC:11,parleyDC:19,
  source:'Observed cautious small-animal movements with no demonstrated speech or aggressive contact.'}}).assessed,true);
b.individualLife.rngState=0xffffffff; // independent withdrawal fixture
const approach=world('gmWildEngage',{beastId:b.id});
A.equal(approach.beastWithdrew,true);
A.equal(s.encounter,null);
A.deepEqual(s.player.partnerIds,baselinePartners);
A.equal(b.consent,undefined);
A.equal(GM.verify(s,b),true);
// 3B: the independently real teacher must consent to membership, then the
// specific duty; the original career must really succeed before one original
// player practice check can observe it.
const npc=social('introduceWitnessedPerson',{
 name:'Talia Meadow',profession:'Independent field notebook instructor',
 purpose:'Share reliable voluntarily demonstrated field recording practices with willing learners.',
 personality:'Patient, independent and careful about promises to learners.',
 background:'Talia travels to field sites to compare observation notebooks and independently demonstrate ordinary research methods.',
 witness:'Talia Meadow is working in the forest clearing, demonstrating how to check ordinary research notebooks'});
A.equal(social('authorWitnessedPersonDuty',{npcId:npc.npcId,
 id:'copperwood_field_teaching',role:'Voluntary field research methods instructor',
 method:'research',domain:'education',
 goal:'Teach and demonstrate ordinary research methods through careful field notebook checks',
 witness:'Talia Meadow is working in the forest clearing, demonstrating how to check ordinary research notebooks'}).available,true);
const group=social('formGroup',{name:'Copperwood Field Notebook Circle',
 kind:'voluntary naturalist study group',
 purpose:'Share field observations and ordinary research without automatic academy status or payment.'});
const w=s.table.realm;
const low=(()=>{for(let i=1;i<100000;i++){
 const t={rngState:i};if(Agency.draw(t)<.015)return i;
}throw Error('Missing person choice fixture');})();
Agency.ensure(w).rngState=low;
A.equal(social('inviteGroupMember',{groupId:group.id,npcId:npc.npcId,
 proposal:'Will you freely participate in this local observation circle while retaining the right to refuse further work?'}).joined,true);
Agency.ensure(w).rngState=low;
const role=social('offerGroupResponsibility',{groupId:group.id,npcId:npc.npcId,
 title:'Voluntary practical field educator',
 scope:'Share ordinary notebook research methods without promising another person learning or an instructor wage.',
 untilDay:4});
A.equal(role.agreed,true);
const teacher=w.emergentPeople.people[npc.npcId.slice('emergent:'.length)];
let seed=null;for(let i=1;i<1000000;i++){
 const a=step(i),b=step(a),c=step(b);
 if(a/4294967296<.01&&c/4294967296>.96){seed=i;break;}
}
A.ok(seed);teacher.rngState=seed;
A.equal(Person.verify(w,teacher),true);
A.equal(social('observeGroupRoleWork',{groupId:group.id,roleId:role.id,
 npcId:npc.npcId}).roleWorkRecorded,true);
const row=Groups.lookup(w,group.id).roleWork[0];
A.equal(row.source.originalCareerReceipt.source.outcome.success,true);
const teacherCount=teacher.career.workCount;
const studied=social('studyWitnessedGroupMethod',{
 groupId:group.id,serviceId:row.id,skill:'research',
 focus:'repetition',minutes:30});
A.equal(studied.witnessedStudy,true);
A.equal(studied.noExtraTeacherRollOrWage,true);
A.equal(teacher.career.workCount,teacherCount);
A.equal(s.player.coins,baselineCoins);
A.equal(Material.verify(s),true);
A.equal(GM.verify(s,b),true);
A.equal(Groups.validate(Groups.lookup(w,group.id),w),true);
// Complete original state and distinct individual sources survive the ONE
// regular save/export round-trip; no save or live turn was ever written.
const saved=E.importGame(E.exportGame(s));
A.equal(Groups.validate(Groups.lookup(saved.table.realm,group.id),
 saved.table.realm),true);
A.equal(Material.verify(saved),true);
A.equal(GM.verify(saved,saved.beasts[b.id]),true);
A.equal(saved.table.materialRecords[sample.materialId].status,'released');
A.deepEqual(saved.player.partnerIds,baselinePartners);
console.log('Single-world GM field integration: real owned material identity, one independently living beast, willing teacher and original learner practice coexist in one saved world; no extra goods, funds, ranks or forced consent');
