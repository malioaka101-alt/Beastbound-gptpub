'use strict';
// Deep source-to-code regression: real saves, independent measures, no free powers.
const A=require('node:assert/strict'),E=require('../engine'),R=require('../rules');
const FS=require('node:fs'),OS=require('node:os'),Path=require('node:path'),Turn=require('../scripts/chat-turn');
const Character=R.character,D=R.disciplines,P=R.progress;
let assertions=0;const ok=(v,msg)=>{A.ok(v,msg);assertions++;},eq=(a,b,msg)=>{A.deepEqual(a,b,msg);assertions++;},err=(f,re)=>{A.throws(f,re);assertions++;};
const fresh=(seed=555,coins=1000)=>{const s=E.newGame({name:'No-Prophecy Student',seed,path:'partner'});s.world.location='academy';s.player.coins=coins;R.unified.ensurePlayer(s);return s;};
// Independent physical/energetic/mental/spiritual capabilities and latent profile.
for(const seed of [1,23,365,555,2926136976]){
 const s=fresh(seed),before=s.rngState,cap=Character.ensure(s);
 eq(cap,Character.make(s),'capability profile must be seeded, not fabricated anew');eq(s.rngState,before,'creation cannot consume combat RNG');
 eq(Object.keys(cap.domains).sort(),['physical','energetic','mental','spiritual'].sort());
 eq(Object.keys(cap.potential).length,Object.keys(Character.POTENTIAL).length);
 const status=Character.publicStatus(s);ok(!JSON.stringify(status).includes('latent'));eq(status.attributes,s.player.attributes);
 ok(Object.values(status.potential).every(x=>x.state==='unassessed'));
 eq(Character.ensure(s),cap,'repeated initialization must be idempotent');
 const restored=E.importGame(E.exportGame(s));eq(restored.player.capabilityProfile,cap);
}
// No arbitrary public potential rating. An actual local exam costs time, money and one check.
{
 const s=fresh(733),before=Character.publicStatus(s),rng=s.rngState;
 err(()=>Character.assess(s,{dimension:'universalPower',facility:'Lumenfall Clinic',source:'Real qualified medical examination'}),/Unknown potential/);
 eq(s.rngState,rng);const old=s.world.minutes,coins=s.player.coins;
 const x=Character.assess(s,{dimension:'soulDepth',facility:'Lumenfall Clinic',source:'Direct signed clinic examination by an assessor'});
 ok(x.check.roll>=1&&x.check.roll<=20);eq(s.world.minutes-old,120);eq(s.player.coins,coins-1);
 const publicProfile=Character.publicStatus(s);ok(!JSON.stringify(publicProfile).includes('latent'));
 eq(Object.values(publicProfile.potential).filter(q=>q.state==='provisionally assessed').length,1);
 err(()=>Character.assess(s,{dimension:'soulDepth',facility:'Lumenfall Clinic',source:'Direct signed clinic examination by an assessor'}),/already used/);
 eq(before.potential.meridianBreadth.state,'unassessed');
}
// Cross-language first-tier profile vectors are actual numeric capacities,
// not proof of having learnt techniques. Source: bb_build.py reference tables.
{
 const B=R.build;
 eq(B.arcaneProfile(0,{ignited:false}).mana,0);
 eq(B.arcaneProfile(1,{density:1}).mana,15);
 eq(B.arcaneProfile(1,{density:1}).channels,1);
 eq(B.arcaneProfile(1,{density:1}).maxComplexity,2);
 eq(B.soulProfile(0).soulReserve,0);
 eq(B.soulProfile(1,{will:2}).soulReserve,7);
 eq(B.soulProfile(1,{will:2}).perceptionRangeMetres,10);
 eq(B.meridianProfile(2,{meridians:12}).qi,16);
}
// Starting specialisation is an emphasis only; no Meridian Gate or Arcane Circle is granted.
{
 const s=fresh(555);eq(s.player.path,'partner');eq(s.player.arcane.circles,0);eq(s.player.meridian.gates.length,0);
 eq(D.status(s).systems.arcane.target,'core');eq(D.status(s).systems.meridian.target,'foundation');
 err(()=>D.breakthrough(s,{system:'meridian',source:'Careful guided clinic rite before preparation'}),/Incomplete/);
 const prep=D.practice(s,{system:'meridian',method:'breath',source:'Lumenfall Annex lesson with a known teacher'});
 ok(prep.check.roll>=1&&prep.check.roll<=20);eq(prep.timeDays,6);eq(s.player.meridian.stage,0);
 ok(s.table.realm.ticks.sixdays>=1);
 err(()=>D.practice(s,{system:'meridian',method:'core-geometry',source:'Wrong training method at the school'}),/Method does not/);
}
// Source-sized early tracks have actual rite prerequisites; their first milestones
// change separate biological/energetic records, not a global power level.
for(const [system,target,method1,method2,amount] of [
 ['meridian','foundation','breath','tissue',40],['arcane','core','mana-attunement','core-geometry',40],
 ['soul','phase1','self-awareness','identity-ward',100],['body','cycle1','muscle','tendon',150],
 ['rift','sense','orientation','boundaries',50]
]){
 const s=fresh(1002),d=D.status(s);eq(d.systems[system].target,target);eq(d.systems[system].required,amount);
 const saved=s.table.disciplineTraining||(s.table.disciplineTraining={});saved[system]={target,points:amount,weeks:42,methods:{[method1]:1,[method2]:1},cooldownUntil:0,complications:[],history:[]};
 s.player.attributes[system==='arcane'||system==='rift'?'int':'wis']=20;
 s.player.skills[R.disciplines.KEYS[system].skill].rank=5;
 const old=s.world.minutes,roll=D.breakthrough(s,{system,source:'Established monitored breakthrough procedure at Lumenfall'});
 ok(roll.check.roll>=1&&roll.check.roll<=20);eq(s.world.minutes-old,180);
 if(roll.outcome==='breakthrough'){
  if(system==='meridian'){eq(s.player.meridian.stage,1);eq(s.table.powerPhysiology.meridian.primaryMapped,0);}
  if(system==='arcane'){ok(s.player.arcane.coreIgnited);eq(s.player.arcane.circles,0);}
  if(system==='soul')eq(s.player.soul.phase,1);
  if(system==='body')eq(s.player.body.cycles[0],'Muscle-Tendon Cycle');
  if(system==='rift')eq(s.player.rift.step,1);
 }else ok(s.table.disciplineTraining[system].cooldownUntil>0);
 // No milestone in one system changes the other systems.
 if(system!=='arcane')eq(s.player.arcane.circles,0);
 if(system!=='meridian')eq(s.player.meridian.stage,0);
}
// Gate progression: no 108-gate teleport, verified individual gate checks,
// quality and actual world time, and mandatory 36/72/108 transition evidence.
{
 const s=fresh(31337);s.player.meridian.stage=2;
 s.table.powerPhysiology={meridian:{foundationQuality:'Firm',primaryMapped:12,gateRecords:[],deviationHistory:[]}};
 let opened=0;
 for(let k=0;k<5;k++){
  const out=D.gatePractice(s,{source:'Clinic-supervised Gate I controlled circulatory practice'});
  if(out.opened)opened++;
 }
 ok(opened<=1);ok(s.player.meridian.gates.length<=1);
 if(opened){eq(s.player.meridian.gates[0].number,1);ok(['Sound','Perfect','Flawed'].includes(s.player.meridian.gates[0].quality));}
 const before=s.rngState;
 s.player.meridian.gates=Array.from({length:35},(_,i)=>({number:i+1,quality:'Sound',band:'Lower'}));
 s.table.meridianGateTraining={gate:36,progress:3,forced:false};
 err(()=>D.gatePractice(s,{source:'Gate XXXVI reserved for a milestone without proof'}),/transition rite/);eq(s.rngState,before);
}
// Critically, no evolution succeeds as a nametag-only mutation or consumes
// catalysts without an authored biological form and consent.
{
 const s=fresh(729);s.beasts.test={id:'test',name:'Bracken',species:'fenfox',sapience:1,consent:true,trust:75,
  syncStage:4,level:15,evolutionStage:'Base',maxHp:30,hp:30,maxEnergy:18,energy:18,techniques:[]};
 s.player.partnerIds=['test'];
 const params={beastId:'test',branchId:'marsh',name:'Marshwarden',grade:2,kind:'rare',requiredYears:0,potential:5,gradeCeiling:5,
  conditions:[{label:'A recorded wetland catalyst',known:true,met:true}],eventStats:{vigor:20,will:20,basis:'Observed measured vitality of Bracken at the ward clinic'}};
 P.register(s,params);const b=s.beasts.test,r=P.get(s,'test/marsh'),rng=s.rngState;
 err(()=>P.evolutionEvent(s,r,{beastWilling:true,source:'A ready wetland evolution inside the proper shrine'}),/pre-recorded form profile/);
 eq(s.rngState,rng);eq(b.evolutionStage,'Base');ok(!r.evolved);
 err(()=>P.evolutionEvent(s,r,{vigor:20,will:20,beastWilling:true,source:'Attempting to override measured Vigor in the rite'}),/may not be supplied/);
 // A different branch with a fully established form changes anatomy and needs.
 P.register(s,{...params,branchId:'marsh_b',formProfile:{species:'fenfox_warden',formName:'Marshwarden Fox',speciesGrade:'Uncommon',individualGrade:'Uncommon',size:'Small',
  anatomy:['Broadened chest for marsh swimming','Luminous reedlike hair around the ears'],magicalOrgans:['Veil-diffusion sac'],
  abilities:[{name:'Mist Shield',effect:'Covers an adjacent space in dense mist',cost:'3 Essence',limit:'Requires damp air',source:'Proven research report'}],
  needs:{diet:'Fresh shellfish',habitat:'Marsh and reedbank',care:'Mist-bath rest after saturation'},levelCap:30,maxHp:40,maxEnergy:28}});
 const r2=P.get(s,'test/marsh_b');const result=P.evolutionEvent(s,r2,{beastWilling:true,source:'The established marsh shrine rite and all materials verified'});
 ok(result.outcome.startsWith('evolved'));eq(b.species,'fenfox_warden');eq(b.evolutionStage,'Marshwarden Fox');
 ok(b.abilities.some(x=>x.name==='Mist Shield'&&x.cost&&x.limit));eq(b.evolutionNeeds.habitat,'Marsh and reedbank');
 eq(b.relationship,undefined);eq(s.player.partnerIds[0],'test');
 err(()=>P.evolutionEvent(s,r2,{beastWilling:true,source:'No double rolling this rite'}),/closed or evolved/);
}
// Chat runner rejects old shortcut cultivation. This is an actual executable
// refusal, not only a handbook instruction. No seed, clock or save mutation.
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-path-parity-'));
 try{
  const filename=Path.join(dir,'campaign.json'),s=fresh(188);
  FS.writeFileSync(filename,E.exportGame(s)+'\n');const old=FS.readFileSync(filename,'utf8');
  for(const [id,action] of [
   ['no_auto_meridian_001','train meridian'],
   ['no_auto_meridian_002','train  meridian'],
   ['no_auto_meridian_003','study   arcane'],
   ['no_auto_evolution_004','evolve  human'],
   ['no_auto_evolution_005','ripening'],
   ['no_auto_evolution_006','pattern echo'],
   ['no_auto_research_007','evolve partner'],
   ['no_auto_research_008','research start Impossible | evolution | 9 | breakthrough'],
   ['no_auto_research_009','research survey phantom'],
   ['no_auto_research_010','research week phantom'],
   ['no_auto_research_011','research fieldwork phantom'],
   ['no_auto_research_012','research hypothesis phantom | made up'],
   ['no_auto_research_013','research proof phantom'],
   ['no_auto_research_014','research validate phantom'],
   ['no_auto_research_015','research   proof phantom']
  ]){
   err(()=>Turn.execute(filename,{id,mode:'act',action}),/Prototype automatic power training|retired/);
   eq(FS.readFileSync(filename,'utf8'),old);
  }
  const help=Turn.execute(filename,{id:'protected_help_001',mode:'act',action:'help'});
  eq(help.applied,false);ok(help.message.includes('protected rule operations'));
  ok(!help.message.includes('train meridian'));eq(FS.readFileSync(filename,'utf8'),old);
  const view=Turn.execute(filename,{id:'read_full_stats_001',mode:'rule',system:'character',operation:'status'});
  eq(view.applied,false);ok(!JSON.stringify(view.output).includes('latent'));
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
// The offline attack math is not an ability ledger. Raw rule requests cannot
// conjure spells from a baseline Mana pool or damage Wards without an exchange.
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-no-raw-magic-'));
 try{
  const file=Path.join(dir,'campaign.json'),s=fresh(189);
  s.player.mana=30;
  eq(s.player.arcane.circles,0);
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const old=FS.readFileSync(file,'utf8'),rng=s.rngState;
  const probes=[
   {id:'unlearned_spell_001',mode:'rule',system:'core',operation:'castAttack',params:{modifier:20,complexity:0,manaCost:0,defense:10}},
   {id:'unlearned_spell_002',mode:'rule',system:'combat',operation:'attack',params:{targetId:'player',modifier:20,damage:12,castingDC:10,manaCost:0}},
   {id:'unlearned_spell_003',mode:'rule',system:'combat',operation:'attack',params:{targetId:'player',modifier:20,damage:12,manaCost:0}},
   {id:'unearned_ward_004',mode:'rule',system:'core',operation:'wardHit',params:{targetId:'player',severity:10}}
  ];
  for(const req of probes){
   err(()=>Turn.execute(file,req),/spell|Ward|cast/i);
   eq(FS.readFileSync(file,'utf8'),old,'rejected raw magic must not touch the save');
  }
  eq(E.importGame(FS.readFileSync(file,'utf8')).rngState,rng);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
// A consented seal must still fit the handler's genuine saved capacity.
// Missing/forged capacity, Will or Soul Phase must not create a contract or roll.
{
 const s=E.newGame({name:'Bond Capacity Fixture',seed:611,path:'undecided'});
 R.unified.ensurePlayer(s);
 s.player.attributes.wis=10; // 0 Will, two units of capacity at Soul Phase 0
 s.beasts.newbond={id:'newbond',name:'River Fox',species:'fenfox',individualGrade:'Common',evolutionStage:'Base',sapience:1,
  contractGradeAssessment:{grade:6,source:'Signed individual Grade VI record for capacity test',species:'fenfox',
   individualGrade:'Common',evolutionStage:'Base',worldMinute:s.world.minutes},
  contractConsentEvidence:{beastId:'newbond',sapience:1,depth:'standard',species:'fenfox',evolutionStage:'Base',
   source:'Witnessed willingness for the standard bond in the capacity test',worldMinute:s.world.minutes,
   beastWilling:true,guardianConsent:false,informedConsent:false}};
 R.bonds.register(s,{beastId:'newbond',start:'negotiated'});
 const b=R.bonds.fromSave(s,'newbond');
 b.willingness=90;
 const rng=s.rngState;
 let denied=R.act(s,{system:'bond',operation:'seal',params:{beastId:'newbond',grade:6,beastWilling:true}});
 eq(denied.sealed,false);eq(denied.overCapacity,true);eq(denied.capacity,2);
 eq(s.rngState,rng);eq(b.contract,null);eq(s.player.partnerIds.length,0);
 // Simulate a new, reconciled Grade I assessment for the separate capacity case.
 s.beasts.newbond.contractGradeAssessment.grade=1;
 const prior=R.bonds.create({human:s.player.name,beast:'Old Friend',sapience:1,start:'negotiated'});
 prior.contract={depth:'standard',load:2,base:60};
 s.table.bondRecords.prior=prior;s.player.partnerIds=['prior'];
 err(()=>R.act(s,{system:'bond',operation:'seal',params:{beastId:'newbond',grade:1,beastWilling:true,usedCapacity:0}}),/Used bond capacity/);
 err(()=>R.act(s,{system:'bond',operation:'seal',params:{beastId:'newbond',grade:1,beastWilling:true,will:20}}),/Will must match/);
 err(()=>R.act(s,{system:'bond',operation:'seal',params:{beastId:'newbond',grade:1,beastWilling:true,soulPhase:3}}),/Soul Phase must match/);
 denied=R.act(s,{system:'bond',operation:'seal',params:{beastId:'newbond',grade:1,beastWilling:true}});
 eq(denied.sealed,false);eq(denied.overCapacity,true);eq(denied.usedCapacity,2);
 eq(s.rngState,rng);eq(b.contract,null);eq(s.player.partnerIds,['prior']);
 // An existing contract cannot be silently overwritten by another seal.
 b.contract={depth:'light',load:1,base:50};
 denied=R.act(s,{system:'bond',operation:'seal',params:{beastId:'newbond',grade:1,beastWilling:true}});
 eq(denied.sealed,false);ok(denied.reason.includes('existing contract'));
 eq(b.contract.depth,'light');eq(s.rngState,rng);
 // A separate legacy partner without a contract-load ledger cannot be ignored.
 const legacy=fresh(612),beforeRng=legacy.rngState;
 legacy.beasts.newbond={id:'newbond',name:'New Friend',sapience:1};
 R.bonds.register(legacy,{beastId:'newbond',start:'negotiated'});
 err(()=>R.act(legacy,{system:'bond',operation:'seal',params:{beastId:'newbond',grade:1,beastWilling:true}}),/reconciled contract load/);
 eq(legacy.rngState,beforeRng);
}
// Relationship numbers are consequences of a previously established history,
// not a callable reward. Evidence has a specific beast, event and elapsed time.
{
 const s=E.newGame({name:'Witnessed Bond Fixture',seed:665,path:'undecided'});
 R.unified.ensurePlayer(s);
 s.beasts.witness={id:'witness',name:'Birch Hare',sapience:1};
 R.bonds.register(s,{beastId:'witness',start:'negotiated'});
 const b=R.bonds.fromSave(s,'witness');
 const start=s.world.minutes,rng=s.rngState,affection=b.affection;
 err(()=>R.act(s,{system:'bond',operation:'event',params:{beastId:'witness',event:'play'}}),/witnessed bond evidence/);
 err(()=>R.act(s,{system:'bond',operation:'care',params:{beastId:'witness',needs:'met'}}),/witnessed bond evidence/);
 err(()=>R.act(s,{system:'bond',operation:'stability',params:{beastId:'witness',event:'honoured_month'}}),/witnessed bond evidence/);
 err(()=>R.act(s,{system:'bond',operation:'willingness',params:{beastId:'witness',handlerRank:5}}),/Handler rank/);
 eq(s.rngState,rng);eq(b.affection,affection);
 s.table.bondEvidence={
  witnessed_play_001:{beastId:'witness',kind:'event',event:'play',worldMinute:start,source:'Direct observation of voluntary play beside the barn'},
  witnessed_week_001:{beastId:'witness',kind:'care',needs:'met',startMinute:start,endMinute:start+8640,worldMinute:start+8640,source:'Recorded week of safe shelter, food and clean water'},
  witnessed_week_002:{beastId:'witness',kind:'care',needs:'met',startMinute:start,endMinute:start+8640,worldMinute:start+8640,source:'Duplicate overlapping week recorded by a second witness'}
 };
 err(()=>R.act(s,{system:'bond',operation:'event',params:{beastId:'witness',event:'play',times:30,evidenceId:'witnessed_play_001'}}),/cannot be multiplied/);
 eq(s.table.bondEvidence.witnessed_play_001.used,undefined);
 const first=R.act(s,{system:'bond',operation:'event',params:{beastId:'witness',event:'play',evidenceId:'witnessed_play_001'}});
 eq(first.changes.affection,2);eq(b.affection,affection+2);
 ok(s.table.bondEvidence.witnessed_play_001.used);
 err(()=>R.act(s,{system:'bond',operation:'event',params:{beastId:'witness',event:'play',evidenceId:'witnessed_play_001'}}),/unused matching/);
 err(()=>R.act(s,{system:'bond',operation:'care',params:{beastId:'witness',needs:'met',evidenceId:'witnessed_week_001'}}),/not actually elapsed|dated in the future/);
 s.world.minutes+=8640;
 const cared=R.act(s,{system:'bond',operation:'care',params:{beastId:'witness',needs:'met',evidenceId:'witnessed_week_001'}});
 eq(cared.care,'met');ok(s.table.bondEvidence.witnessed_week_001.used);
 err(()=>R.act(s,{system:'bond',operation:'care',params:{beastId:'witness',needs:'met',evidenceId:'witnessed_week_002'}}),/overlaps/);
 b.contract={depth:'standard',load:1,base:60};b.contractStability=60;
 s.table.bondEvidence.month_001={beastId:'witness',kind:'stability',event:'honoured_month',startMinute:start,endMinute:start+30*1440,worldMinute:start+30*1440,source:'Signed account of an unbroken month of mutual obligations'};
 err(()=>R.act(s,{system:'bond',operation:'stability',params:{beastId:'witness',event:'honoured_month',evidenceId:'month_001'}}),/not actually elapsed|dated in the future/);
 s.world.minutes=start+30*1440;
 const honoured=R.act(s,{system:'bond',operation:'stability',params:{beastId:'witness',event:'honoured_month',evidenceId:'month_001'}});
 eq(honoured.stability,61);ok(s.table.bondEvidence.month_001.used);
 err(()=>R.act(s,{system:'bond',operation:'stability',params:{beastId:'witness',event:'honoured_month',evidenceId:'month_001'}}),/unused matching/);
}
// Rejections in the protected file-backed runner do not alter a checkpoint.
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-bond-proof-'));
 try{
  const path=Path.join(dir,'save.json'),s=E.newGame({name:'No Event Farming',seed:666,path:'undecided'});
  s.beasts.fox={id:'fox',name:'Gray Fox',sapience:1};R.bonds.register(s,{beastId:'fox',start:'negotiated'});
  FS.writeFileSync(path,E.exportGame(s)+'\n');
  const raw=FS.readFileSync(path,'utf8');
  for(const [id,system,operation,params] of [
   ['free_bond_incident_001','bond','event',{beastId:'fox',event:'protected_at_risk',times:30}],
   ['free_bond_care_002','bond','care',{beastId:'fox',needs:'met'}],
   ['free_bond_stability_003','bond','stability',{beastId:'fox',event:'honoured_month'}]
  ]){
   err(()=>Turn.execute(path,{id,mode:'rule',system,operation,params}),/witnessed|multiplied/);
   eq(FS.readFileSync(path,'utf8'),raw);
  }
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
// Numeric beast Grade and contract skill/discipline bonuses must all come from
// existing, source-attributed save records before any contract dice are rolled.
{
 const s=E.newGame({name:'Contract Provenance Fixture',seed:919,path:'undecided'});
 R.unified.ensurePlayer(s);
 s.beasts.test={id:'test',name:'Stone Swift',species:'stonehare',individualGrade:'Common',evolutionStage:'Base',sapience:1};
 R.bonds.register(s,{beastId:'test',start:'negotiated'});
 R.bonds.fromSave(s,'test').willingness=85;
 const base={system:'bond',operation:'seal',params:{beastId:'test',beastWilling:true}};
 const rng=s.rngState;
 err(()=>R.act(s,base),/recorded numeric individual beast Grade/);
 eq(s.rngState,rng);
 s.beasts.test.contractGradeAssessment={
  grade:1,source:'Signed Grade I individual examination by licensed assessor',
  species:'stonehare',individualGrade:'Common',evolutionStage:'Base',worldMinute:s.world.minutes
 };
 for(const [key,value,expect] of [
  ['grade',9,/Grade must match/],
  ['contractLore',20,/Contract Lore bonus/],
  ['soulDB',20,/Soul discipline bonus/],
  ['bonuses',50,/stability bonuses/]
 ]){
  err(()=>R.act(s,{...base,params:{...base.params,[key]:value}}),expect);
  eq(s.rngState,rng);
 }
 // A Grade record tied to an earlier biological form cannot be reused.
 s.beasts.test.evolutionStage='New Form';
 err(()=>R.act(s,base),/recorded numeric individual beast Grade/);
 eq(s.rngState,rng);
}
// The contract requester cannot assert consent by setting boolean flags.
// Only an existing witnessed agreement tied to the actual terms can authorise a seal.
{
 const s=E.newGame({name:'Independent Consent Fixture',seed:921,path:'undecided'});
 R.unified.ensurePlayer(s);
 s.beasts.fox={id:'fox',name:'Bright Fox',sapience:1,species:'fenfox',
  individualGrade:'Common',evolutionStage:'Base',contractGradeAssessment:{
   grade:1,source:'Signed individual Grade I examination before bond negotiation',
   worldMinute:s.world.minutes,species:'fenfox',individualGrade:'Common',evolutionStage:'Base'
  }};
 R.bonds.register(s,{beastId:'fox',start:'negotiated'});
 const b=R.bonds.fromSave(s,'fox');b.willingness=85;
 const base={system:'bond',operation:'seal',params:{beastId:'fox',grade:1,beastWilling:true}};
 const rng=s.rngState;
 err(()=>R.act(s,base),/witnessed consent/);
 eq(s.rngState,rng);eq(b.contract,null);
 s.beasts.fox.contractConsentEvidence={
  beastId:'fox',sapience:1,depth:'standard',species:'fenfox',evolutionStage:'Base',
  worldMinute:s.world.minutes,source:'Directly witnessed refusal followed by renewed negotiation',
  beastWilling:false,guardianConsent:false,informedConsent:false
 };
 err(()=>R.act(s,base),/disagrees with recorded contract consent/);
 eq(s.rngState,rng);eq(b.contract,null);
 const refused=R.act(s,{...base,params:{beastId:'fox',grade:1}});
 eq(refused.sealed,false);eq(s.rngState,rng);eq(b.contract,null);
 s.beasts.fox.contractConsentEvidence.beastWilling=true;
 s.beasts.fox.contractConsentEvidence.source='Freshly recorded voluntary agreement to the proposed standard terms';
 err(()=>R.act(s,{...base,params:{...base.params,depth:'deep'}}),/witnessed consent/);
 eq(s.rngState,rng);
 const resolved=R.act(s,base);
 ok(resolved.check&&resolved.check.roll>=1&&resolved.check.roll<=20);
 if(resolved.sealed){
  ok(s.beasts.fox.contractConsentEvidence.used);
  eq(s.player.partnerIds,['fox']);
  err(()=>R.act(s,base),/witnessed consent|existing contract/);
 }else eq(s.beasts.fox.contractConsentEvidence.used,undefined);
}
// A bond record cannot generate decades of trust or invented personality
// merely because the request supplies a favourable origin story.
{
 const s=E.newGame({name:'Relationship Origins Fixture',seed:773,path:'undecided'});
 s.beasts.fox={id:'fox',name:'Free Fox',species:'fenfox',evolutionStage:'Base',sapience:1,personalityTags:['timid']};
 const rng=s.rngState;
 err(()=>R.act(s,{system:'bond',operation:'register',params:{beastId:'fox',start:'won_by_trust',years:30}}),/source-recorded pre-existing bond history/);
 err(()=>R.act(s,{system:'bond',operation:'register',params:{beastId:'fox',personality:['protective']}}),/personality tags/);
 eq(s.table?.bondRecords?.fox,undefined);eq(s.rngState,rng);
 const registered=R.act(s,{system:'bond',operation:'register',params:{beastId:'fox'}});
 ok(registered.recorded);eq(registered.historicalSource,null);
 const neutral=R.bonds.fromSave(s,'fox');
 eq(neutral.trust,0);eq(neutral.willingness,0);eq(neutral.affection,0);
 eq(neutral.personality,['timid']);
 const s2=E.newGame({name:'Verified History Fixture',seed:774,path:'undecided'});
 s2.beasts.fox={id:'fox',name:'Old Friend',species:'fenfox',evolutionStage:'Base',sapience:1,
  bondHistoryAssessment:{beastId:'fox',sapience:1,species:'fenfox',evolutionStage:'Base',
   start:'won_by_trust',years:3,worldMinute:s2.world.minutes,
   source:'Family diary and witness testimony of three years of gentle care'}};
 const established=R.act(s2,{system:'bond',operation:'register',params:{beastId:'fox',start:'won_by_trust',years:3}});
 ok(established.recorded);ok(s2.beasts.fox.bondHistoryAssessment.used);
 ok(R.bonds.fromSave(s2,'fox').trust>25);
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-bond-start-'));
 try{
  const filename=Path.join(dir,'save.json'),s=E.newGame({name:'Unrecorded Past',seed:775,path:'undecided'});
  s.beasts.fox={id:'fox',name:'Fox',species:'fenfox',evolutionStage:'Base',sapience:1};
  FS.writeFileSync(filename,E.exportGame(s)+'\n');
  const before=FS.readFileSync(filename,'utf8');
  err(()=>Turn.execute(filename,{id:'fake_history_00001',mode:'rule',system:'bond',operation:'register',
   params:{beastId:'fox',start:'imprinted',years:100}}),/source-recorded pre-existing bond history/);
  eq(FS.readFileSync(filename,'utf8'),before);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Deep source parity tests passed: '+assertions+' assertions');