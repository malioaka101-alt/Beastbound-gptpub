'use strict';
// Grounded by System Additions Parts 4, 5, 6 and Table Rules Part 3.
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const E=require('../engine.js'),P=require('../panels.js'),R=require('../rules'),Turn=require('../scripts/chat-turn.js');
const Scene=require('./scene-witness-fixture');
let assertions=0;const eq=(a,b)=>{assert.deepEqual(a,b);assertions++;},yes=x=>{assert(x);assertions++;};
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'bb-rules-'));
const save=path.join(temp,'aerin.json');
const fresh=()=>{const s=E.importGame(fs.readFileSync(path.join(__dirname,'..','saves','aerin_marsh.json'),'utf8'));fs.writeFileSync(save,E.exportGame(s)+'\n');return s;};
const read=()=>E.importGame(fs.readFileSync(save,'utf8'));
const act=(id,system,operation,params={})=>Turn.execute(save,{id,mode:'rule',system,operation,params});
try{
 fresh();
 // Explicit source formulas: 01a/03b/19.
 eq(R.build.researchGrade('meridian',3),3);eq(R.build.researchGrade('arcane',4),4);
 eq(R.build.researchGrade('soul',4),6);eq(R.build.researchGrade('body',1),2);
 eq(R.build.researchGrade('rift',4),5);eq(R.build.researchGrade('sync',10),9);
 eq(R.build.researchGrade('skill',3),6);eq(R.build.effectGrade(1),3);
 eq(R.build.deviceMagnitude(5),3);eq(R.build.spellCasting({complexity:8,specialised:true,prepared:true}),{complexity:7,castingDC:17,castingBonus:3});
 for(const [novelty,expected] of Object.entries({rediscovery:[14,15],variant:[15,20],novel:[17,30],breakthrough:[20,50]})){
   const x=R.research.NOVELTY[novelty];eq([10+4+x.dc,x.base+10],expected);
 }
 eq(R.research.COST.slice(1),[.5,1,3,8,20,50,150,400,1000]);
 eq(R.progress.multiplier({}),1);eq(R.progress.multiplier({vaelRich:true,syncStage:3,matchedTraining:true}),5);
 eq(R.progress.multiplier({vaelRich:true,branchResources:true,syncStage:7,matchedTraining:true,documented:true}),8);
 // Origin-pattern rites and consent alone do not open a blocked evolution route.
 const demo=E.newGame({seed:999});demo.beasts.test_beast={id:'test_beast',name:'Willow',consent:true,evolutionStage:'Base',condition:100,syncStage:6};
 R.progress.register(demo,{beastId:'test_beast',branchId:'ascending',kind:'hidden',grade:5,requiredYears:20,potential:5,gradeCeiling:5,conditions:[{label:'Catalyst obtained',met:true,known:true}]});
 const branch=R.progress.get(demo,'test_beast/ascending');
 eq(R.progress.eventGate(demo,branch).eligible,false);
 const echo=R.progress.patternEcho(demo,branch,{source:'Confirmed ancient relic',modifier:30});eq(echo.gain,10);
 assert.throws(()=>R.progress.patternEcho(demo,branch,{source:'Confirmed ancient relic',modifier:30}));assertions++;
 R.progress.maturityAdvance(branch,365,{vaelRich:true,syncStage:6,documented:true,matchedTraining:true,branchResources:true});
 eq(R.progress.eventGate(demo,branch).eligible,false);
 branch.years=20;eq(R.progress.eventGate(demo,branch).eligible,true);eq(R.progress.eventGate(demo,branch).requiresEventRoll,true);

 const m={years:0,requiredYears:20};const ma=R.progress.maturityAdvance(m,365,{vaelRich:true,syncStage:3,matchedTraining:true});eq(ma.years,5);
 // Sixday calendar ticks after days 6,12...30 not at starts.
 eq(R.world.calendarTicks(0,31),{sixdays:[6,12,18,24,30],months:[30]});
 eq(R.world.money(1234),'12T 3F 4S');
 let s=E.newGame({seed:123,name:'test'});E.advance(s,5*1440);eq(s.world.politics.reedClans,'negotiating fishing rights');
 const d=E.newGame({seed:3,name:'days'});R.world.advance(d,6);yes(d.world.minutes>480);eq(d.table.calendar.sixdays,[6]);
 // Honest checks: 1 is not auto failure and 20 not auto win.
 eq(R.core.degree(10),'exceptional');eq(R.core.degree(5),'strong');eq(R.core.degree(0),'success');eq(R.core.degree(-1),'setback');eq(R.core.degree(-5),'failure');eq(R.core.degree(-10),'severe failure');
 eq(R.core.degree(-10,false),'failure');eq(R.core.assist(['strong','strong','success']),4);
 const state=E.newGame({seed:456});const result=R.core.opposed(state,{modifier:2},{modifier:2});eq(result.winner,result.a.total>result.b.total?'a':'b');
 const ae=E.newGame({seed:17}),be=E.newGame({seed:17});eq(R.core.check(ae,{modifier:6,dc:12}),R.core.check(be,{modifier:6,dc:12}));eq(ae.rngState,be.rngState);
 // Ward absorbs the WHOLE hit, even the hit breaking it.
 const t={ward:{steps:2}};eq(R.core.wardHit(t,3),{absorbed:true,remaining:0,collapsed:true});eq(R.core.wardHit(t,1),{absorbed:false,remaining:0});
 // Casting one roll, DC and Defense, never fabricate damage/wound without full §01b.
 const mage=E.newGame({seed:987});mage.player.mana=100;const spell=R.core.castAttack(mage,{modifier:12,complexity:8,manaCost:12,defense:14,specialised:true});
 eq(spell.castingDC,17);yes(spell.manaSpent>=6&&spell.manaSpent<=12);yes(!spell.hit||spell.damagePending===true);
 // Real private-turn wiring. No Aerin progress from a read-only call.
 const initial=read();eq(initial.player.name,'Aerin Marsh');const startHash=Turn.hash(fs.readFileSync(save));
 assert.throws(()=>act('port_read_001','bond','consent',{beastId:'missing'}));assertions++;eq(Turn.hash(fs.readFileSync(save)),startHash);
 const sourcePlan=read();
 sourcePlan.table ||= {};sourcePlan.table.researchPlans ||= {};
 sourcePlan.table.researchPlans.murrain={id:'murrain',source:'Documented guild field study authorised before initial survey',
  worldMinute:sourcePlan.world.minutes,
  parameters:{id:'murrain',title:'Murrain Screen',kind:'method',skill:'survival',grade:2,
   novelty:'variant',truth:{feasibility:'possible',
    requirements:['Water-borne marker','Wetland sample','Independently verified reagent'],
    acceptedHypotheses:['water is involved']}}};
 fs.writeFileSync(save,E.exportGame(sourcePlan)+'\n');
 let z=act('port_start_001','research','start',{id:'murrain'});
 eq(z.applied,true);eq(z.output.rules.dc,15);eq(z.output.rules.track,20);
 const conflict=act('port_start_001','research','start',{});eq(conflict.ok,false);eq(conflict.applied,false);
 const replay=act('port_start_001','research','start',{id:'murrain'});eq(replay.duplicate,true);
 const rq=act('port_read_002','research','status',{id:'murrain'});eq(rq.applied,false);yes(!JSON.stringify(rq.output).includes('Water-borne marker'));
 z=act('port_survey_001','research','survey',{id:'murrain'});
 yes(z.output.rules.preparation>=0&&z.output.rules.preparation<=3);
 const coins=read().player.coins;z=act('port_week_001','research','week',{id:'murrain'});
 yes(z.output.rules.points>=-1&&z.output.rules.points<=3);
 eq(z.output.rules.coinsSpent,1);eq(read().player.coins,coins-1);
 yes(read().world.minutes>=480+6*1440);
 // A real prior check is the only supported evidence source for fieldwork.
 const recorded=read();
 Scene.record(recorded,'marsh_trace_0001',{skill:'survival',attribute:'wis',
  dc:15,minutes:15,label:'Survey marsh trace'});
 fs.writeFileSync(save,E.exportGame(recorded)+'\n');
 const fc=act('port_fieldcheck_001','core','check',{checkId:'marsh_trace_0001'});
 eq(fc.applied,true);const evIndex=read().log.length-1;
 // Explicitly bind this previously recorded check to the sealed project
 // before claiming fieldwork: an unrelated check is not automatic evidence.
 const fieldSource=read(),event=fieldSource.log[evIndex];
 const digest=require('node:crypto').createHash('sha256').update(JSON.stringify(event)).digest('hex');
 fieldSource.table.researchFieldEvidence ||= {};
 fieldSource.table.researchFieldEvidence.murrain={[evIndex]:{
  projectId:'murrain',eventIndex:evIndex,eventHash:digest,worldMinute:fieldSource.world.minutes,
  source:'Independent marshwater observation corroborated by the named field notebook',
  relevance:'Survey marsh trace tests river water as evidence'}};
 fs.writeFileSync(save,E.exportGame(fieldSource)+'\n');
 const fw=act('port_fieldwork_001','research','fieldwork',{id:'murrain',eventIndex:evIndex});
 yes(fw.output.rules.points>=0&&fw.output.rules.points<=3);eq(fw.output.rules.noNewRoll,true);
 assert.throws(()=>act('port_fieldwork_002','research','fieldwork',{id:'murrain',eventIndex:evIndex}));assertions++;

 // Repeated rule ID must not spend more resources.
 const last=Turn.hash(fs.readFileSync(save));eq(act('port_week_001','research','week',{id:'murrain'}).duplicate,true);eq(Turn.hash(fs.readFileSync(save)),last);
 const oldRev=read().chatRuntime.revision;const stale=Turn.execute(save,{id:'port_stale_001',mode:'rule',system:'world',operation:'advance',params:{days:1},expectedHash:'wrong'});eq(stale.applied,false);eq(read().chatRuntime.revision,oldRev);
 // Fake high-grade research/without fixed GM truth is forbidden.
 assert.throws(()=>R.research.start(E.newGame({seed:5}),{id:'myth',grade:9,novelty:'breakthrough',leadRank:5}));assertions++;
 // Evolution setup requires existing beast; potential and branch conditions.
 const s2=read();s2.beasts.beast_demo={id:'beast_demo',name:'Test fox',species:'fenfox',
  evolutionStage:'Base',sapience:1,condition:100,consent:true,location:'crossing',lineage:'Marshlight'};
 s2.player.partnerIds.push('beast_demo');
 R.realm.anchorCalendar(s2,{date:{year:1153,month:10,day:5},
  source:'Public civil calendar at the crossing, recorded by the town registrar'});
 s2.beasts.beast_demo.ripeningDoseAssessments={hidden_form:{
  beastId:'beast_demo',branchId:'hidden_form',species:'fenfox',evolutionStage:'Base',
  seasonKey:'1153:autumn',item:'ripening_fruit',beastWilling:true,
  worldMinute:s2.world.minutes,
  source:'Verified season fruit sourced from Vael-rich grove with beast cooperation'
 }};
 // A privately authored source branch belongs to the disposable beast,
 // not to the rule caller. Full anatomy, physiology and limitations are fixed
 // before any future attempt can be allowed.
 const profile={species:'fenfox_sentinel',formName:'Reed Sentinel Fox',speciesGrade:'Rare',
  individualGrade:'Rare',size:'Small',anatomy:['Dense reed-laced rib cage','Luminous ear-fringe sensors'],
  magicalOrgans:['Bog-lantern resonance pouch'],abilities:[{name:'Stillwater Mist',
   effect:'Masks shallow tracks in mist',cost:'4 Essence',limit:'Only near wetlands',
   source:'Independently registered ward biology study'}],
  needs:{diet:'Shellfish',habitat:'Wetland banks',care:'Still-water recovery'},
  levelCap:40,maxHp:70,maxEnergy:40};
 s2.beasts.beast_demo.evolutionBranchAssessments={hidden_form:{
  beastId:'beast_demo',branchId:'hidden_form',species:'fenfox',evolutionStage:'Base',
  worldMinute:s2.world.minutes,source:'GM pre-established rare branch from independent wetland survey',
  parameters:{beastId:'beast_demo',branchId:'hidden_form',grade:5,requiredYears:20,kind:'hidden',
   potential:5,gradeCeiling:5,conditions:[{label:'Mastered skill',met:false,known:true},
    {label:'Sealed blessing',met:false,known:false}],
   formProfile:profile,eventStats:{vigor:2,will:3,basis:'Recorded clinic examination of the young sentinel fox'}}}};
 // The player actually discovered this branch from a prior named study;
 // private status is never authorised solely by guessing a branch key.
 s2.table||={};s2.table.evolutionDiscoveries={'beast_demo/hidden_form':{
  key:'beast_demo/hidden_form',beastId:'beast_demo',species:'fenfox',
  evolutionStage:'Base',revealedToPlayer:true,worldMinute:s2.world.minutes,
  source:'Witnessed and documented lineage survey presented to the protagonist'}};
 s2.player.inventory.ripening_fruit=1;fs.writeFileSync(save,E.exportGame(s2)+'\n');
 z=act('port_branch_001','evolution','register',{beastId:'beast_demo',branchId:'hidden_form'});eq(z.applied,true);
 let r=act('port_branch_status','evolution','status',{key:'beast_demo/hidden_form'});eq(r.applied,false);yes(!Object.hasOwn(r.output.rules,'unknownUnmet'));eq(R.progress.status(R.progress.get(read(),'beast_demo/hidden_form')).unknownUnmet,1);eq(r.output.rules.known,true);eq(r.output.rules.knownUnmet,2);
 eq(r.output.rules.knownConditionsMet,false);yes(!Object.hasOwn(r.output.rules,'ready'));
 z=act('port_mature_001','evolution','advance',{key:'beast_demo/hidden_form',days:6});
 yes(Math.abs(z.output.rules.years-6/365)<1e-10);eq(z.output.rules.rate,1);
 z=act('port_ripen_001','evolution','ripening',{key:'beast_demo/hidden_form'});
 yes(Math.abs(z.output.rules.years-(1+6/365))<1e-10);eq(read().player.inventory.ripening_fruit,0);
 assert.throws(()=>R.progress.ripening(read(),R.progress.get(read(),'beast_demo/hidden_form'),{season:'Leaffall'}));assertions++;
 r=act('port_eligible_001','evolution','eligibility',{key:'beast_demo/hidden_form'});eq(r.output.rules.knownConditionsMet,false);
 yes(!Object.hasOwn(r.output.rules,'eligible'));
 // S2 Protected Mind requires guardian and evident willingness; S3+ informed consent.
 eq(R.bonds.consentGuard({sapience:2},{beastWilling:true,guardianConsent:false}).eligible,false);
 eq(R.bonds.consentGuard({sapience:2},{beastWilling:true,guardianConsent:true}).eligible,true);
 eq(R.bonds.consentGuard({sapience:3},{beastWilling:true,informedConsent:false}).eligible,false);
 eq(R.bonds.consentGuard({sapience:3},{beastWilling:true,informedConsent:true}).eligible,true);
 const sick=E.newGame({seed:55,name:'Ripening Test'});sick.beasts.b={id:'b',name:'Youngling',condition:100};sick.player.inventory.ripening_fruit=1;
 R.progress.register(sick,{beastId:'b',branchId:'branch',kind:'rare',grade:4,requiredYears:3,potential:4,gradeCeiling:4,conditions:[{label:'Catalyst',met:true,known:true}]});
 const dose=R.progress.ripening(sick,R.progress.get(sick,'b/branch'),{season:'Migration',modifier:-60});eq(dose.success,false);eq(sick.beasts.b.condition,90);
 E.advance(sick,6*1440);eq(sick.beasts.b.condition,100);yes(!sick.beasts.b.ripeningWeakness);

 yes(P.core(read()).split('\n').every(x=>Array.from(x).length===34));
 console.log(`PASS — ${assertions} explicit assertions; real chat-turn integration, replay, core, build, world, research, evolution, consent`);
}finally{fs.rmSync(temp,{recursive:true,force:true});}