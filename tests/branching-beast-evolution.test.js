'use strict';
// #06: Disposable real original progress, independent choice and same world.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 FS=require('node:fs'),OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),P=require('../rules/progress'),
 Time=require('../rules/world'),Web=require('../rules/evolution-branch-web'),
 Turn=require('../scripts/chat-turn');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const op=(s,k,p={})=>R.act(s,{system:'evolution',operation:k,params:p});
function fixture(seed=962001){
 const s=E.newGame({name:'Independent Evolution Fixture',seed,path:'undecided'});
 s.player.partnerIds=['fox'];
 s.player.attributes.wis=30;s.player.skills.beastlore={rank:5,xp:0};
 s.beasts.fox={id:'fox',name:'Moonleaf Fox',species:'fenfox',
  evolutionStage:'Base',lineage:'Marshlight',speciesGrade:'Common',individualGrade:'Common',sapience:1,consent:true,
  condition:100,mood:'relaxed',needs:{hunger:10,fatigue:10},
  injuries:[],conditions:[],personalityTags:['affiliative'],
  location:'crossing',relationship:'mutual partner',trust:80,
  hp:30,maxHp:30,energy:40,maxEnergy:40,level:6,techniques:[]};
 R.bonds.register(s,{beastId:'fox',start:'unfamiliar'});
 const bond=R.bonds.fromSave(s,'fox');bond.trust=90;bond.respect=85;bond.willingness=90;
 return {s,b:s.beasts.fox};
}
function plan(s,branchId='reedveil',name='Reedveil Fox'){
 const form={species:'source_form_'+branchId,formName:name,
  speciesGrade:'Rare',individualGrade:'Rare',size:'Small',
  anatomy:['Restructured capillary reed filter','Expanded whisker root nerves'],
  magicalOrgans:['Retuned wetland vapor membrane'],
  abilities:[{name:'Adaptive Mist Reflex '+branchId,
   effect:'Short protective local mist response',cost:'3 internal energy',
   limit:'Only in adequately moist living air',
   source:'Pre-examined source-backed regional wetland physiology'}],
  needs:{diet:'Living freshwater invertebrates',
   habitat:'Reed bank with clean water',care:'Rest in shaded wetland shelter'},
  levelCap:30,maxHp:50,maxEnergy:32};
 const parameters={beastId:'fox',branchId,name,
  kind:'environmental',grade:1,requiredYears:0,potential:5,
  gradeCeiling:5,documented:true,specialConditionsMet:false,
  conditions:[{label:'Previously documented reed filter adaptation',known:true,met:true}],
  eventStats:{vigor:20,will:20,
   basis:'Independently examined living creature physiology and actual pre-existing wetland anatomy'},
  formProfile:form};
 const ecology={regionId:'morrowfen_basin',minForage:0,minWater:0,
  minQuality:0,maxPressure:100,riteEnergy:3,riteCondition:2,
  basis:'Actual Morrowfen local ecology and pre-examined source ecology constraints'};
 const p={beastId:'fox',branchId,parameters,ecology,
  incompatibleWith:branchId==='reedveil'?['nightreed']:['reedveil'],
  source:'GM-authored original local evolutionary observations of this specific existing beast'};
 return {p,form};
}
function sign(s,branchId){
 const b=s.beasts.fox;
 const C=require('../rules/core');
 C.event(s,'beast','Observed changes in '+b.name+' physically support an emerging original branch',
  {beastId:b.id,kind:'biological-sign',source:'Directly witnessed anatomical signs in local habitat'});
 const eventIndex=s.log.length-1,ev=s.log[eventIndex];
 b.evolutionSignObservations||={};
 b.evolutionSignObservations[branchId]={beastId:b.id,branchId,
  species:b.species,evolutionStage:b.evolutionStage,
  worldMinute:s.world.minutes,source:'Independently witnessed particular emerging physiology of this beast',
  location:s.world.location,eventIndex,eventHash:hash(ev),
  dc:12,distance:3};
 return op(s,'signs',{key:'fox/'+branchId});
}
function consent(s,branchId,form){
 const b=s.beasts.fox;
 b.evolutionConsentEvidence||={};
 b.evolutionConsentEvidence[branchId]={beastId:b.id,branchId,
  species:b.species,evolutionStage:b.evolutionStage,
  targetSpecies:form.species,targetForm:form.formName,
  sapience:b.sapience,location:s.world.location,worldMinute:s.world.minutes,
  source:'An actual independently witnessed voluntary response to this exact proposed evolutionary rite',
  riteSource:'Original signed and individually witnessed wetland evolution event plan at the crossing',
  beastWilling:true,guardianConsent:false,informedConsent:false,
  facility:0,catalysts:[]};
}
{
 const {s}=fixture(962002),rng=s.rngState;
 const original=E.exportGame(s),a=plan(s);
 A.throws(()=>op(s,'authorBranch',{...a.p,win:true}),/without selecting outcome/);
 A.throws(()=>op(s,'authorBranch',{...a.p,ecology:{...a.p.ecology,riteEnergy:-1}}),
  /regional physiological fit/);
 A.equal(E.exportGame(s),original);
 A.equal(op(s,'authorBranch',a.p).authored,true);
 A.equal(s.rngState,rng,'GM authoring must not generate a transformation roll');
 A.deepEqual(op(s,'branchWebStatus',{beastId:'fox'}).known,[],
  'Possible branches remain private until an actual observation is resolved');
 const before=E.exportGame(s),clone=E.importGame(before);
 A.deepEqual(clone.beasts.fox.evolutionBranchAssessments.reedveil,
  s.beasts.fox.evolutionBranchAssessments.reedveil);
 A.throws(()=>op(s,'authorBranch',a.p),/already has a branch assessment/);
 A.equal(E.exportGame(s),before);
 const originalAssessment=structuredClone(s.beasts.fox.evolutionBranchAssessments.reedveil);
 s.beasts.fox.evolutionBranchAssessments.reedveil.branching.source.ecology.minForage=99;
 A.throws(()=>op(s,'register',{beastId:'fox',branchId:'reedveil'}),
  /differs from original GM-authored/);
 s.beasts.fox.evolutionBranchAssessments.reedveil=originalAssessment;
 A.equal(op(s,'register',{beastId:'fox',branchId:'reedveil'}).registered,true);
 A.ok(P.get(s,'fox/reedveil').branching.seal);
 A.equal(op(s,'branchWebStatus',{beastId:'fox'}).known.length,0);
 const discovered=sign(s,'reedveil');
 A.equal(discovered.recognised,true);
 const publicKnown=op(s,'branchWebStatus',{beastId:'fox'});
 A.equal(publicKnown.known.length,1);
 A.equal(publicKnown.known[0].name,'Reedveil Fox');
 A.equal(op(s,'status',{key:'fox/reedveil'}).known,true);
 A.equal(JSON.stringify(publicKnown).includes('minForage'),false);
 A.equal(JSON.stringify(publicKnown).includes('will'),false);
 A.equal(s.rngState===rng,false,'A genuine sign recognition consumes the real original check roll');
}
{
 const {s,b}=fixture(962003),a=plan(s,'reedveil','Reedveil Fox'),
  alt=plan(s,'nightreed','Nightreed Fox');
 op(s,'authorBranch',a.p);op(s,'authorBranch',alt.p);
 op(s,'register',{beastId:b.id,branchId:'reedveil'});
 op(s,'register',{beastId:b.id,branchId:'nightreed'});
 const r=P.get(s,'fox/reedveil'),other=P.get(s,'fox/nightreed');
 A.equal(r.blocked,false);A.equal(other.blocked,false);
 A.equal(op(s,'branchWebStatus',{beastId:'fox'}).known.length,0);
 consent(s,'reedveil',a.form);
 const rng=s.rngState,stamp=s.world.minutes;
 b.energy=1;
 A.throws(()=>op(s,'event',{key:'fox/reedveil'}),/cannot afford/);
 A.equal(s.rngState,rng);A.equal(s.world.minutes,stamp);
 A.equal(r.evolved,undefined);A.equal(b.evolutionEcology,undefined);
 b.energy=40;
 const result=op(s,'event',{key:'fox/reedveil'});
 A.ok(result.outcome.startsWith('evolved'));
 A.equal(r.evolved,true);A.equal(other.blocked,true);
 A.equal(other.closedBy,'fox/reedveil');
 A.equal(b.species,a.form.species);
 A.equal(b.evolutionStage,a.form.formName);
 A.ok(b.evolutionHistory.at(-1).branchWorldSource);
 A.equal(b.energy,Math.min(40,a.form.maxEnergy)-a.p.ecology.riteEnergy);
 A.equal(b.condition,98);
 A.equal(r.branchAttemptOutcome.energySpent,3);
 A.equal(Web.ecoVerify(s,b),true);
 A.throws(()=>op(s,'event',{key:'fox/nightreed'}),
  /active, authenticated current-form branch/);
 const changed=E.importGame(E.exportGame(s));
 A.equal(Web.ecoVerify(changed,changed.beasts.fox),true);
 const prior=E.exportGame(s),parallel=E.importGame(prior);
 // Actual existing world ticks, without inserting a new species or making
 // an owned creature secretly roam, preserve deterministic ecology.
 Time.advance(s,6);Time.advance(parallel,6);
 A.deepEqual(s.beasts.fox,parallel.beasts.fox);
 A.equal(Web.ecoVerify(s,b),true);
 // Make the returned evolved creature inhabit a different physical region
 // in this disposable isolated state. The same real sixday world must then
 // impose bounded ecological stress on the creature's new biology.
 b.location='forest';
 const beforeCondition=b.condition;
 Time.advance(s,6);
 A.ok(b.condition<beforeCondition);
 A.ok(b.evolutionEcology.effectCount>=1);
 A.equal(Web.ecoVerify(s,b),true);
 const tampered=E.importGame(E.exportGame(s));
 tampered.beasts.fox.evolutionEcology.history.at(-1).source.conditionLoss=300;
 A.equal(Web.ecoVerify(tampered,tampered.beasts.fox),false);
 A.equal(s.player.partnerIds.length,1,'Individual transformation cannot create a partner');
 A.equal(s.beasts.fox.id,'fox');
}
{
 const {s,b}=fixture(962004),a=plan(s);
 const tmp=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-evolution-web-'));
 try{
  const save=Path.join(tmp,'save.json');FS.writeFileSync(save,E.exportGame(s)+'\n');
  const first=FS.readFileSync(save,'utf8');
  const request={id:'evolution_web_author_001',mode:'rule',system:'evolution',
   operation:'authorBranch',params:a.p};
  const authored=Turn.execute(save,request);
  A.equal(authored.applied,true);
  const once=FS.readFileSync(save,'utf8');
  A.equal(Turn.execute(save,request).duplicate,true);
  A.equal(FS.readFileSync(save,'utf8'),once);
  const view={id:'evolution_web_status_001',mode:'rule',system:'evolution',
   operation:'branchWebStatus',params:{beastId:'fox'}};
  A.equal(Turn.execute(save,view).applied,false);
  A.equal(FS.readFileSync(save,'utf8'),once);
  const registered={id:'evolution_web_reg_001',mode:'rule',system:'evolution',
   operation:'register',params:{beastId:'fox',branchId:'reedveil'}};
  A.equal(Turn.execute(save,registered).applied,true);
  A.equal(Turn.execute(save,registered).duplicate,true);
  const loaded=E.importGame(FS.readFileSync(save,'utf8'));
  A.equal(P.get(loaded,'fox/reedveil').branching.seal,
   loaded.beasts.fox.evolutionBranchAssessments.reedveil.branching.seal);
  A.equal(loaded.beasts.fox.id,b.id);
  A.equal(FS.readFileSync(save,'utf8')!==first,true);
 }finally{FS.rmSync(tmp,{recursive:true,force:true});}
}
console.log('Open GM-authored branching evolution uses original form registration, hidden witnessed signs, genuine consent and rolls, rivalry closure, energy and condition costs, world sixday ecology, provenance tampering and saved turn replay.');
