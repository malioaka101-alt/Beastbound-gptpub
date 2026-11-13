'use strict';
// The first reusable, source-bounded creative design framework.
// Uses disposable game states and never edits Aerin or any other campaign.
const A=require('node:assert/strict'),FS=require('node:fs'),
 Path=require('node:path'),OS=require('node:os'),
 E=require('../engine.js'),R=require('../rules'),
 Creation=require('../rules/creation-design'),
 Turn=require('../scripts/chat-turn.js'),B=require('../rules/build');
const fresh=seed=>E.newGame({name:'Invention Boundaries Fixture',seed,path:'undecided',background:'fieldworker'});
const call=(s,operation,params)=>R.act(s,{system:'creation',operation,params});
const concept=()=>({
 title:'Wetland Water-Watch Indicator',
 purpose:'Help ferry crews and independent beast sanctuary workers detect changes in accessible water without frightening nearby animals.',
 medium:'tool',system:'mundane',function:'sense',magnitude:0,
 range:'touch',area:'single',duration:'1min',novelty:'variant',
 materials:[{id:'marsh_reed',quantity:2}]
});
{
 const s=fresh(832001),old=E.exportGame(s),rng=s.rngState;
 for(const forged of [
  {...concept(),rank:9},
  {...concept(),difficulty:1},
  {...concept(),cost:0},
  {...concept(),effectStrength:'infinite'},
  {...concept(),materials:[{id:'marsh_reed',quantity:2,grade:9}]},
  {...concept(),materials:[{id:'marsh_reed',quantity:2,free:true}]},
  {...concept(),materials:[{id:'marsh_reed',quantity:2},{id:'marsh_reed',quantity:1}]},
  {...concept(),magnitude:999}
 ])A.throws(()=>call(s,'evaluate',forged),/Creation accepts|material|Duplicate|actual medium|bounded proposed Magnitude/);
 A.equal(E.exportGame(s),old);A.equal(s.rngState,rng);
 const assessed=call(s,'evaluate',concept());
 A.equal(assessed.envelope.function,'sense');
 A.equal(assessed.envelope.effectGrade,1,'trivial grounded mechanism has first-grade effective envelope');
 A.equal(assessed.envelope.meaning.includes('no thoughts'),true);
 A.equal(assessed.proposal.purpose,concept().purpose);
 A.equal(assessed.envelope.medium,'tool');
 A.equal(assessed.prerequisites.earnedRank,s.player.skills.crafting.rank);
 A.equal(assessed.prerequisites.matchingReplicatedEvidence,false);
 A.equal(assessed.noItemCreated,true);
 A.equal(assessed.noTechniqueLearned,true);
 A.ok(assessed.gaps.some(g=>/physical prototype/.test(g)),
  'an ordinary useful invention requires a genuine prototype, not academic gatekeeping');
 A.equal(assessed.envelope.researchBudget.ordinaryPrototypeRoute,true);
 A.equal(assessed.prerequisites.noveltyLeadRankRequired,0,
  'novice mundane work is not barred by compulsory paid training');
 A.equal(E.exportGame(s),old);A.equal(s.rngState,rng);
}
{
 // The GM can begin with a story-grounded idea, not an invented universal
 // rank, shape, distance, craft time, price, effect scale or curriculum.
 // These remain ordinary ORIGINAL design records, not separate new systems.
 const s=fresh(832013),before=E.exportGame(s),oldRng=s.rngState;
 const idea={
  title:'Uncharted living-world craft possibility',
  purpose:'Study whether a newly encountered cultural technique or natural phenomenon can become a useful practice without assuming it already works.'
 };
 const view=call(s,'evaluate',idea);
 A.equal(view.proposal.title,idea.title);
 A.equal(view.proposal.purpose,idea.purpose);
 for(const k of ['medium','system','function','magnitude','range','area','duration','novelty'])
  A.equal(view.proposal[k],null,'unspecified facts are not fabricated: '+k);
 A.equal(view.envelope.effectGrade,null);
 A.equal(view.envelope.provisionalArcaneOrQiBudget,null);
 A.equal(view.envelope.researchBudget.theoreticalDC,null);
 A.equal(view.envelope.researchBudget.nominalMaterialsPerSixdayTalons,null);
 A.equal(view.prerequisites.earnedRank,null);
 A.equal(view.prerequisites.noveltyLeadRankRequired,null);
 A.equal(view.noItemCreated,true);
 A.equal(view.noTechniqueLearned,true);
 A.equal(E.exportGame(s),before);
 A.equal(s.rngState,oldRng);
 const partially={...idea,medium:'original constructed object',
  system:'unexplored craft tradition'};
 const second=call(s,'evaluate',partially);
 A.equal(second.proposal.medium,partially.medium);
 A.equal(second.proposal.system,partially.system);
 A.equal(second.envelope.effectGrade,null);
 A.ok(second.gaps.length);
 A.equal(E.exportGame(s),before);
 for(const malformed of [{...idea,magnitude:999},
  {...idea,range:'no physical limit'},
  {...idea,novelty:'automatic godhood'},
  {...idea,medium:12}]){
  A.throws(()=>call(s,'evaluate',malformed));
  A.equal(E.exportGame(s),before);
 }
 const time=s.world.minutes,stamina=s.player.stamina,
  stock=structuredClone(s.player.inventory);
 const drafted=call(s,'draft',idea);
 A.equal(drafted.recorded,true);
 A.equal(drafted.prerequisites.skill,null);
 A.equal(s.world.minutes,time+35);
 A.equal(s.player.stamina,stamina-1);
 A.deepEqual(s.player.inventory,stock);
 const original=s.table.creationDesigns.records[drafted.id];
 A.equal(original.proposal.system,null);
 A.equal(original.implementedEffect,false);
 const observed=call(s,'status',{id:drafted.id}).designs[0];
 A.equal(observed.effectGrade,null);
 A.equal(observed.noItemCreated,true);
 const saved=E.exportGame(s),rng=s.rngState;
 A.throws(()=>call(s,'prototype',{id:drafted.id}),
  /No proven physical prototype adapter/);
 A.equal(E.exportGame(s),saved);
 A.equal(s.rngState,rng);
 A.equal(E.exportGame(E.importGame(saved)),saved);
 const recorded=call(s,'draft',partially);
 A.equal(s.table.creationDesigns.records[recorded.id].proposal.medium,
  partially.medium);
 A.equal(s.table.creationDesigns.records[recorded.id].implementedEffect,false);
 const after=E.exportGame(s),rngAfter=s.rngState;
 A.throws(()=>call(s,'prototype',{id:recorded.id}),
  /No proven physical prototype adapter/);
 A.equal(E.exportGame(s),after);
 A.equal(s.rngState,rngAfter);
}
{
 // GM-authored target language is open-ended at the proposal layer:
 // neither a fixed water-target menu nor a fabricated working mechanism.
 // These are descriptions of possibilities, not extra power/item rules.
 const s=fresh(832011),baseline=E.exportGame(s),rolls=s.rngState;
 const targets=[
  'a hand-accessible change in a local instrument signal',
  'a nearby work surface that could support ordinary shaping',
  'an unstudied biological or supernatural signature'
 ];
 for(const target of targets){
  const proposal={...concept(),title:'Unverified original proposal '+target.slice(0,32),target};
  const assessment=call(s,'evaluate',proposal);
  A.equal(assessment.proposal.target,target);
  A.equal(assessment.noItemCreated,true);
  A.ok(assessment.gaps.length>0,
   'a descriptive target does not prove the corresponding effect');
 }
 A.equal(E.exportGame(s),baseline);
 A.equal(s.rngState,rolls);
 // Neither a novel shape nor a novel creative mechanism needs a name in
 // an engine enum to be considered. It also cannot become working power.
 const unstudied={...concept(),
  title:'GM-proposed original physical form',
  medium:'living woven support geometry',
  function:'entirely unstudied local mechanism',
  target:'surface contact at a fictional worksite'};
 const free=call(s,'evaluate',unstudied);
 A.equal(free.proposal.medium,unstudied.medium);
 A.equal(free.proposal.function,unstudied.function);
 A.ok(free.gaps.some(x=>/Original mechanism is unverified/.test(x)));
 A.ok(free.gaps.some(x=>/Original medium is unverified/.test(x)));
 A.equal(free.envelope.provisionalArcaneOrQiBudget,null);
 A.equal(free.envelope.effectGrade,null,
  'an original unknown mechanism has no pre-assigned working grade');
 A.equal(free.envelope.researchBudget.theoreticalDC,null,
  'original mechanism cannot be forced into a fixed default DC');
 A.equal(free.envelope.researchBudget.nominalMaterialsPerSixdayTalons,null,
  'the engine cannot assign a made-up universal research fee');
 A.equal(free.prerequisites.noveltyLeadRankRequired,null,
  'no mandatory proficiency gate is inferred before the mechanism exists');
 A.equal(free.noPractisedPowerGranted,true);
 A.equal(free.noItemCreated,true);
 const arcane=call(s,'evaluate',{...unstudied,system:'arcane'});
 A.equal(arcane.envelope.provisionalArcaneOrQiBudget,null);
 A.ok(arcane.gaps.some(x=>/No proved energy or physiology model/.test(x)));
 A.equal(arcane.noTechniqueLearned,true);
 // A novel discipline, even one with a familiar word such as 'sense',
 // cannot borrow an established discipline's rank, costs, or success.
 const originalSystem={...concept(),
  title:'GM-proposed original discipline',
  system:'unexplored communal echo practice'};
 const systemView=call(s,'evaluate',originalSystem);
 A.equal(systemView.proposal.system,originalSystem.system);
 A.ok(systemView.gaps.some(x=>/Original proposed discipline/.test(x)));
 A.equal(systemView.prerequisites.skill,null);
 A.equal(systemView.prerequisites.earnedRank,null);
 A.equal(systemView.prerequisites.noveltyLeadRankRequired,null);
 A.equal(systemView.envelope.effectGrade,null);
 A.equal(systemView.envelope.researchBudget.theoreticalDC,null);
 A.equal(systemView.envelope.researchBudget.nominalMaterialsPerSixdayTalons,null);
 A.equal(systemView.envelope.provisionalArcaneOrQiBudget,null);
 A.equal(systemView.noItemCreated,true);
 A.equal(systemView.noTechniqueLearned,true);
 const misleading=call(s,'evaluate',{...originalSystem,
  system:'universal_rank'});
 A.equal(misleading.prerequisites.earnedRank,null);
 A.equal(misleading.noPractisedPowerGranted,true);
 A.equal(E.exportGame(s),baseline);
 A.equal(s.rngState,rolls);
 for(const target of ['', '  ', 'x'.repeat(161),'unsafe'+String.fromCharCode(10)+'name',3]){
  A.throws(()=>call(s,'evaluate',{...concept(),target}),/proposed target/);
 }
 A.equal(E.exportGame(s),baseline);
 // A completely new mechanism and form can be saved in the same original
 // design journal, with NO item or operational technique created.
 const novel=call(s,'draft',unstudied);
 const novelEntry=s.table.creationDesigns.records[novel.id];
 A.equal(novelEntry.proposal.medium,unstudied.medium);
 A.equal(novelEntry.proposal.function,unstudied.function);
 A.equal(novelEntry.implementedEffect,false);
 const unprovedSave=E.exportGame(s),unprovedRng=s.rngState;
 A.throws(()=>call(s,'prototype',{id:novel.id}),
  /No proven physical prototype adapter/);
 A.equal(E.exportGame(s),unprovedSave);
 A.equal(s.rngState,unprovedRng);
 A.equal(E.exportGame(E.importGame(unprovedSave)),unprovedSave);
 const unheard=call(s,'draft',originalSystem);
 A.equal(s.table.creationDesigns.records[unheard.id].proposal.system,
  originalSystem.system);
 A.equal(s.table.creationDesigns.records[unheard.id].implementedEffect,false);
 const unreadSave=E.exportGame(s),unreadRng=s.rngState;
 A.throws(()=>call(s,'prototype',{id:unheard.id}),
  /No proven physical prototype adapter/);
 A.equal(E.exportGame(s),unreadSave);
 A.equal(s.rngState,unreadRng);
 A.equal(E.exportGame(E.importGame(unreadSave)),unreadSave);
 const custom={...concept(),
  title:'Original freely described signal probe',
  target:targets[0]};
 const d=call(s,'draft',custom);
 A.equal(d.recorded,true);
 A.equal(s.table.creationDesigns.records[d.id].proposal.target,targets[0]);
 A.equal(s.table.creationDesigns.records[d.id].implementedEffect,false);
 const noTrial=E.exportGame(s),rng=s.rngState;
 A.throws(()=>call(s,'prototype',{id:d.id}),
  /No proven physical prototype adapter/);
 A.equal(E.exportGame(s),noTrial);
 A.equal(s.rngState,rng);
 A.equal(s.table.creationPrototypes,undefined);
 const restored=E.importGame(noTrial);
 A.equal(E.exportGame(restored),noTrial);
 A.equal(call(restored,'status',{id:d.id}).designs[0].noItemCreated,true);
}
{
 const s=fresh(832002),now=s.world.minutes,stamina=s.player.stamina,
  materials=JSON.stringify(s.player.inventory),mana=s.player.mana,
  qi=s.player.qi,rank=s.player.skills.crafting.rank;
 const d=call(s,'draft',concept());
 A.equal(d.recorded,true);A.equal(d.stage,'idea-under-evaluation');
 A.equal(d.id,'design_1');
 A.equal(d.requiresIndependentProof,true);
 A.equal(d.elapsedMinutes,35);A.equal(d.staminaSpent,1);
 A.equal(s.world.minutes,now+35);A.equal(s.player.stamina,stamina-1);
 A.equal(JSON.stringify(s.player.inventory),materials);
 A.equal(s.player.mana,mana);A.equal(s.player.qi,qi);
 A.equal(s.player.skills.crafting.rank,rank);
 A.equal(s.player.inventory.water_watch_indicator,undefined);
 A.equal(s.player.combatActions?.water_watch_indicator,undefined);
 A.equal(s.player.meridian.stage,0);A.equal(s.player.arcane.circles,0);
 A.equal(s.table.creationDesigns.records.design_1.implementedEffect,false);
 A.equal(s.table.creationDesigns.records.design_1.status,'unproven-concept');
 const dossier=call(s,'status',{id:d.id}).designs[0];
 A.equal(dossier.title,concept().title);
 A.equal(dossier.noItemCreated,true);
 const after=E.exportGame(s),rng=s.rngState;
 A.deepEqual(call(s,'status').designs.length,1);
 A.equal(E.exportGame(s),after);A.equal(s.rngState,rng);
 A.throws(()=>call(s,'status',{id:'design_1',showHiddenFormula:true}),/read-only/);
 A.equal(E.exportGame(s),after);
 const again=call(s,'draft',{...concept(),title:'Second Thoughtful Ferry Tool'});
 A.equal(again.id,'design_2');
 A.equal(call(s,'status').designs.length,2);
 A.equal(s.player.inventory.water_watch_indicator,undefined);
}
{
 // A maximally ambitious title does not get to change the mechanical
 // effect primitive's documented, narrow scope.
 const s=fresh(832003),before=E.exportGame(s);
 const dream={...concept(),title:'Universal Miracle Restoration Machine',
  purpose:'Treat a patient in a distant crisis while exploring the speculative boundaries of healing and new sources of technology.',
  medium:'device',function:'mend',magnitude:7,
  range:'extreme',area:'100m',duration:'permanent',
  novelty:'breakthrough',materials:[{id:'moss_crystal',quantity:15}]};
 const v=call(s,'evaluate',dream);
 A.equal(v.envelope.effectGrade,9);
 A.ok(v.envelope.meaning.includes('no resurrection'));
 A.ok(v.gaps.some(g=>/only supports superficial repair/.test(g)));
 A.ok(v.gaps.some(g=>/Persistent effects need source/.test(g)));
 A.ok(v.gaps.some(g=>/missing|not fully held/.test(g)));
 A.equal(v.prerequisites.missingMaterials[0].id,'moss_crystal');
 A.equal(v.envelope.magnitude,7);
 A.equal(v.envelope.researchBudget.grade,9);
 A.equal(v.envelope.researchBudget.theoreticalDC,
  10+2*9+6,'large breakthrough requires a high source-derived research DC');
 A.equal(v.envelope.researchBudget.progressionTrack,40+5*9);
 A.equal(v.envelope.researchBudget.nominalMaterialsPerSixdayTalons,1000);
 A.equal(v.stage,'idea-under-evaluation');A.equal(v.noItemCreated,true);
 A.equal(E.exportGame(s),before);
}
{
 const s=fresh(832004),before=E.exportGame(s);
 for(const use of [
  'Support community food storage and preservation without pretending to manufacture new matter.',
  'Mark safe livestock paths and support communication with animal carers and sanctuary coordinators.',
  'Assist low-impact rescue and environmental monitoring rather than fighting anyone.',
  'Protect shared workshops against a clearly specified ordinary hazard.'
 ]){
  const v=call(s,'evaluate',{...concept(),purpose:use});
  A.equal(v.envelope.effectGrade,1);
  A.equal(v.envelope.system,'mundane');
  A.equal(v.noItemCreated,true);
 }
 for(const system of ['arcane','meridian','soul','body','rift','origin','runes',
  'formations','alchemy','healing','partnership']){
  const response=call(s,'evaluate',{...concept(),medium:'technique',
   system,materials:[],function:'sense',magnitude:1});
  A.equal(response.envelope.system,system);
  A.ok(response.gaps.length>0,'unsupported mastery is never inferred from a school label');
  A.equal(response.noTechniqueLearned,true);
 }
 A.equal(E.exportGame(s),before);
}
{
 const s=fresh(832005),base={...concept(),medium:'technique',
  system:'arcane',materials:[],function:'signal',magnitude:1,
  range:'medium',duration:'10min'};
 const result=call(s,'evaluate',base),form=B.spellCost({
  family:'link',rng:'medium',area:'single',duration:'10min',
  magnitude:1,speed:'standard'});
 A.equal(result.envelope.provisionalArcaneOrQiBudget.mana,form.mana);
 A.equal(result.envelope.provisionalArcaneOrQiBudget.complexity,form.complexity);
 A.equal(result.envelope.provisionalArcaneOrQiBudget.minCircle,form.minCircle);
 A.ok(result.gaps.some(g=>/Circle/.test(g)));
 A.equal(result.envelope.researchBudget.ordinaryPrototypeRoute,false);
 A.equal(s.player.arcane.circles,0);
 const outside=call(s,'evaluate',{...base,magnitude:7});
 A.equal(outside.envelope.provisionalArcaneOrQiBudget.unsupportedMagnitude,true);
 A.ok(outside.gaps.some(g=>/Arcane Circle/.test(g)));
 A.equal(s.player.arcane.circles,0);
 const mer=call(s,'evaluate',{...base,system:'meridian',function:'strike',
  magnitude:1,range:'close',duration:'instant'});
 A.equal(mer.envelope.provisionalArcaneOrQiBudget.qi,
  B.qiTechniqueCost({damage:8,rng:'close',area:'single',projectionM:1}));
 A.ok(mer.gaps.some(g=>/mapped Meridian/.test(g)));
 A.equal(s.player.qi,14,'paper budget never spends physical Qi');
}
{
 const s=fresh(832006),old=E.exportGame(s);
 const wrong=call(s,'evaluate',{...concept(),researchId:'fake_school_secret'});
 A.equal(wrong.prerequisites.matchingReplicatedEvidence,false);
 A.equal(E.exportGame(s),old);
 // Copying a project title or faking its status cannot become a certified
 // material/technical result. Only the full source-matched study is proof.
 s.table||={};s.table.researchPlans={
  fake_school_secret:{source:'claimed legendary manuscript',parameters:{
   creationScopeHash:'f'.repeat(64)}}};
 s.table.research={fake_school_secret:{id:'fake_school_secret',
  grade:9,replications:2,status:'recognised',
  sourceResearchPlan:'claimed legendary manuscript',
  truth:{feasibility:'possible'}}};
 const still=call(s,'evaluate',{...concept(),researchId:'fake_school_secret'});
 A.equal(still.prerequisites.matchingReplicatedEvidence,false);
 A.equal(still.noItemCreated,true);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-creation-dossier-'));
 try{
  const file=Path.join(dir,'save.json'),s=fresh(832007);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const frozen=FS.readFileSync(file,'utf8');
  const view={id:'creation_evaluate_0001',mode:'rule',
   system:'creation',operation:'evaluate',params:concept()};
  A.equal(Turn.execute(file,view).applied,false);
  A.equal(FS.readFileSync(file,'utf8'),frozen);
  const request={id:'creation_draft_00001',mode:'rule',
   system:'creation',operation:'draft',params:concept()};
  const made=Turn.execute(file,request);
  A.equal(made.applied,true);
  A.equal(made.output.rules.recorded,true);
  A.equal(Turn.execute(file,request).duplicate,true);
  const after=FS.readFileSync(file,'utf8');
  const saved=E.importGame(after);
  A.equal(saved.table.creationDesigns.records.design_1.status,'unproven-concept');
  A.equal(saved.world.minutes,s.world.minutes+35);
  A.equal(saved.player.inventory.water_watch_indicator,undefined);
  const status={id:'creation_status_0001',mode:'rule',
   system:'creation',operation:'status',params:{id:'design_1'}};
  A.equal(Turn.execute(file,status).applied,false);
  A.equal(Turn.execute(file,status).output.rules.designs.length,1);
  A.equal(FS.readFileSync(file,'utf8'),after);
  A.throws(()=>Turn.execute(file,{...request,id:'creation_cheat_0001',
   params:{...concept(),success:true,rank:9}}),/Creation accepts/);
  A.equal(FS.readFileSync(file,'utf8'),after);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Compositional inventions accept imaginative noncombat proposals while enforcing proven rank, ability, energy, evidence, materials and non-operative blueprint status');
