'use strict';
// #10 disposable original earned Stage IV -> individually mapped Stage V living
// circuits. Real engine rolls, World clock, source events and no campaign saves.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),C=require('../rules/core'),
 Net=require('../rules/meridian-living-anatomy'),Turn=require('../scripts/chat-turn');
const op=(s,k,p={})=>R.act(s,{system:'meridian',operation:k,params:p});
function stage4(seed=245101){
 const s=E.newGame({seed,name:'Stage IV Real Living Anatomy Fixture',path:'meridian'});
 R.unified.ensurePlayer(s);
 s.world.location='crossing';
 s.player.attributes.wis=20;s.player.skills.cultivation.rank=5;
 s.player.meridian.stage=3;s.player.meridian.gates=[];
 s.table.disciplineTraining||={};
 s.table.disciplineTraining.meridian={target:null,points:0,
  weeks:0,methods:{},cooldownUntil:0,complications:[],history:[
   {day:1,target:'foundation',quality:'strong',
    change:'Stage I Foundation Tempering; Firm structural foundation'},
   {day:1,target:'awakening',quality:'strong',
    change:'Stage II Meridian Awakening; all 12 Primary Meridians consciously mapped'}]};
 s.table.powerPhysiology={meridian:{foundationQuality:'Firm',
  primaryMapped:12,gateRecords:[],transitions:[],deviationHistory:[]}};
 const recorded=s.table.powerPhysiology.meridian;
 for(let i=1;i<=107;i++){
  const gate={number:i,band:i<=36?'Lower':i<=72?'Middle':'High',quality:'Sound'};
  s.player.meridian.gates.push(gate);
  recorded.gateRecords.push({...gate,day:1});
  if(i===36||i===72)recorded.transitions.push({
   gate:i,day:1,quality:'Sound',route:'independent',
   source:'Authentic prior lower or middle Meridian transition in the prepared source fixture'});
 }
 let opened=false;
 for(let i=0;i<80&&!opened;i++)
  opened=!!op(s,'gatePractice',{force:false,minutes:15}).opened;
 A.ok(opened,'The last Gate must actually open through the original engine');
 let formed=false;
 for(let i=0;i<12&&!formed;i++)
  formed=op(s,'seaWork',{method:'integrated',minutes:15}).formed;
 A.ok(formed,'Actual source-verified 108 Gates and a real Stage IV Dantian Sea are required');
 A.equal(Net.prior(s).m.stage,4);
 return s;
}
function seen(s,id,description){
 C.event(s,'story',
  'The living Meridian practitioner witnesses an original anatomical pathway and its pressure or clinical significance.',{
   origin:Net.MAP,location:s.world.location,
   subject:'original-individual-meridian-anatomy',routeId:id,
   description:description||'Distinct witnessed primary-to-branch linkage in existing anatomy'});
 return s.log.length-1;
}
const mk=(s,id,kind,number,load=1)=>{
 const i=seen(s,id);
 return {id,name:'Actual individual '+id+' pathway',
  principle:'An original witnessed pressure route distributing controlled Qi through a specifically mapped tissue corridor.',
  interference:'High pressure from neighbouring meridians can obstruct controlled flow if circulation conflicts.',
  pressureRisk:'Existing scar tissue or excessive Qi load can destabilise the individual living channel.',
  treatmentPath:'Medical recovery must be witnessed, separately rolled and physically sustainable.',
  load,segments:[{kind,number}],gates:[number],dantian:'lower',
  witnessIndex:i};
};
{
 const s=E.newGame({seed:245100,name:'Not Yet Awakened',path:'meridian'});
 const before=E.exportGame(s),rng=s.rngState;
 A.deepEqual(op(s,'livingWebStatus'),{stage:0,available:false,
  note:'A genuinely formed Stage IV Dantian Sea is needed'});
 A.throws(()=>op(s,'livingWebMap',{
  id:'fake_map',name:'Invented Route',
  principle:'A description that cannot substitute for real Gate anatomy',
  interference:'Without actual anatomical sources this route has no real pressure',
  pressureRisk:'Fabricated meridian histories cannot create a living network',
  treatmentPath:'An invented instant treatment is not a clinical source',
  load:1,segments:[{kind:'minor',number:1}],gates:[1],dantian:'lower',
  witnessIndex:0}),/Stage IV|original|Gates/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
{
 const s=stage4(),stage=s.player.meridian.stage,qi=s.player.qi;
 const gate=s.player.meridian.gates.length,
  maxQi=s.player.maxQi,initial=E.exportGame(s),rng=s.rngState;
 A.equal(op(s,'livingWebStatus').available,true);
 A.equal(op(s,'livingWebStatus').coverage.complete,false);
 A.equal(E.exportGame(s),initial);A.equal(s.rngState,rng);
 const p=mk(s,'branch_coil_low','extraordinary',1,1);
 const snapshot=E.exportGame(s);
 A.throws(()=>op(s,'livingWebMap',{...p,
  segments:[{kind:'minor',number:73}]}),/nonexistent or duplicate anatomical structures/);
 A.equal(E.exportGame(s),snapshot);
 A.equal(op(s,'livingWebMap',p).mapped,true);
 A.equal(Net.verify(s),true);
 A.equal(s.player.meridian.stage,4);
 A.equal(s.player.meridian.gates.length,gate);
 A.equal(s.player.maxQi,maxQi);
 A.throws(()=>op(s,'livingWebMap',p),/Already mapped/);
 A.equal(op(s,'livingWebStatus').routes.length,1);
 const double=mk(s,'overlapping_minor','extraordinary',1,2),before=E.exportGame(s);
 A.throws(()=>op(s,'livingWebMap',double),/conflicting routes/);
 A.equal(E.exportGame(s),before,'A rejected conflicting pathway cannot allocate phantom anatomy');
 s.player.attributes.wis=30;s.player.skills.cultivation.rank=5;
 let integrated=false;
 for(let i=0;i<12&&!integrated;i++){
  const start=s.world.minutes,oldQi=s.player.qi;
  const x=op(s,'livingWebWork',{routeId:p.id,minutes:15});
  A.equal(x.minutes,15);A.equal(s.world.minutes-start,15);
  A.equal(s.player.qi,oldQi-x.qiSpent);
  A.ok(x.check.roll>=1&&x.check.roll<=20);
  A.equal(Net.verify(s),true);
  integrated=x.completed;
 }
 A.ok(integrated,'One genuinely learned small circulation route must be achievable');
 A.equal(Net.coverage(s).integrated.extraordinary,1);
 A.equal(Net.coverage(s).integrated.major,0);
 A.equal(Net.coverage(s).complete,false);
 A.equal(s.player.meridian.stage,stage);
 A.throws(()=>op(s,'livingWebWork',{routeId:p.id}),/already structurally integrated/);
 A.equal(qi>s.player.qi,true);
 const saved=E.exportGame(s),copy=E.importGame(saved);
 A.equal(Net.verify(copy),true);
 copy.table.powerPhysiology.meridian.advancedNetwork.routes[p.id].integrity=19;
 A.equal(Net.verify(copy),false,'Forging route integrity without earned original check receipts fails');
 const second=E.importGame(saved);
 second.table.powerPhysiology.meridian.advancedNetwork.routes[p.id].source.load=9;
 A.equal(Net.verify(second),false,'Forged physical pressure cannot alter the mapped original anatomy');
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-meridian-web-'));
 try{
  const file=Path.join(dir,'save.json');
  FS.writeFileSync(file,saved+'\n');
  const reading={id:'meridian_web_view_00001',mode:'rule',system:'meridian',
   operation:'livingWebStatus',params:{}};
  A.equal(Turn.execute(file,reading).applied,false);
  A.equal(FS.readFileSync(file,'utf8'),saved+'\n');
  A.equal(Turn.execute(file,reading).applied,false);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
{
 // High pressure is never free: a severe failure can reduce actual Meridian
 // stability. Recovering an injury requires a NEW witnessed clinical scene
 // and an original medical roll, rather than a status toggle or zero-cost cure.
 let injured=null;
 for(let seed=245300;seed<245360&&!injured;seed++){
  const s=stage4(seed);
  const p=mk(s,'high_load_route','minor',2,9);
  op(s,'livingWebMap',p);
  s.player.attributes.wis=8;s.player.skills.cultivation.rank=0;
  const r=op(s,'livingWebWork',{routeId:p.id,minutes:15});
  if(r.setback)injured={s,p,r};
 }
 A.ok(injured,'A real high-risk pressure check must produce a source-backed deviation');
 const {s,p,r}=injured;
 A.equal(r.setback.type,'route-pressure-deviation');
 A.equal(Net.verify(s),true);
 A.equal(op(s,'livingWebStatus').routes[0].unrecoveredDeviations,1);
 const phys=s.table.powerPhysiology.meridian;
 A.equal(phys.deviationHistory.at(-1).source,'original-meridian-living-route-pressure-v1');
 const route=phys.advancedNetwork.routes[p.id],injury=route.injuries[0];
 const before=E.exportGame(s),beforeRng=s.rngState;
 A.throws(()=>op(s,'livingWebTreat',{routeId:p.id,witnessIndex:0}),
  /specific|original|witnessed/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,beforeRng);
 s.player.attributes.wis=30;s.player.skills.medicine.rank=5;
 let treated=false;
 for(let i=0;i<10&&!treated;i++){
  C.event(s,'story',
   'The pressure-affected meridian tissue receives independently observed clinical assessment, relaxation and physical treatment.',{
    origin:Net.TREAT,location:s.world.location,
    routeId:p.id,injuryHash:injury.seal,
    diagnosis:'The original observed pressure deviation affects a specific mapped small branch route.',
    treatment:'Gentle recorded manual pressure, controlled rest and graduated circulation reduce the actual existing load.'});
  const j=s.log.length-1,first=s.world.minutes;
  const result=op(s,'livingWebTreat',{routeId:p.id,witnessIndex:j,minutes:15});
  A.equal(s.world.minutes-first,15);
  treated=result.clinicalRecovery;
 }
 A.ok(treated,'Actual medical skill and a new witnessed source should restore one injury');
 A.equal(op(s,'livingWebStatus').routes[0].unrecoveredDeviations,0);
 A.equal(Net.verify(s),true);
 const saved=E.importGame(E.exportGame(s));
 saved.table.powerPhysiology.meridian.advancedNetwork.routes[p.id].care.at(-1)
  .source.stabilityRecovered=999;
 A.equal(Net.verify(saved),false);
 A.equal(s.player.humanEvolution.stage,0);
}
{
 // Stage V is a separately witnessed, *connected* 12-Primary +
 // Extraordinary/Major/Minor functional response, not all 116 segments
 // filled as compulsory fixed practice lessons.
 const s=stage4(245512);
 s.player.attributes.wis=30;s.player.skills.cultivation.rank=5;
 s.player.stamina=75;
 A.throws(()=>op(s,'livingWebComplete',{witnessIndex:0}),
  /real individual route|physical Meridian network|witnessed/);
 const circuits=[
  mk(s,'original_extra_current','extraordinary',1,1),
  mk(s,'original_major_current','major',1,1),
  mk(s,'original_minor_current','minor',1,1)
 ];
 for(const route of circuits){
  A.equal(op(s,'livingWebMap',route).mapped,true);
  let completed=false;
  for(let i=0;i<9&&!completed;i++)
   completed=op(s,'livingWebWork',{routeId:route.id,minutes:15}).completed;
  A.equal(completed,true,'Each genuinely tested branch must establish physical integrity');
 }
 A.equal(s.player.meridian.stage,4);
 const ready=Net.spanning(s);
 A.equal(ready.ready,true);
 A.equal(ready.extraordinary,1);
 A.deepEqual(ready.ids,circuits.map(x=>x.id).sort());
 A.equal(Net.coverage(s).complete,false,
  'Network integration must not require all 116 channels to be prescribed as mandatory lessons');
 const ids=ready.ids,previous=s.world.minutes,oldQi=s.player.qi,
  oldMax=s.player.maxQi,oldSta=s.player.stamina;
 C.event(s,'story',
  'The practitioner witnesses a responsive living Meridian return current linking personally mapped channels across three anatomically separate families.',{
   origin:Net.TRANSITION,location:s.world.location,routeIds:ids,
   returnFlow:'A verified independently responsive Qi return loop connects the actual Primary, Extraordinary and Branch channels.',
   stressResponse:'The living circuit diverts mild pressure without unsupported healing and remains stable under measured controlled strain.',
   physicalBasis:'The actual source-mapped open Gates carry compatible local Dantian pressure between integrated living anatomical corridors.'});
 const witnessIndex=s.log.length-1;
 const before=E.exportGame(s);
 A.throws(()=>op(s,'livingWebComplete',{witnessIndex:0}),
  /personally witnessed|integrated return flow|original local anatomical source/);
 A.equal(E.exportGame(s),before);
 const r=op(s,'livingWebComplete',{witnessIndex,minutes:90});
 A.equal(r.attempted,true);
 A.equal(r.formed,true);
 A.equal(s.world.minutes,previous+90);
 A.equal(s.player.meridian.stage,5);
 A.equal(s.player.qi,oldQi-r.qiSpent,'Earned reservoir expansion cannot refill the current Dantian Sea');
 A.equal(s.player.stamina,oldSta-r.staminaSpent);
 A.ok(s.player.maxQi>=oldMax);
 A.equal(r.capacity.newMax,s.player.maxQi);
 const Build=require('../rules/build');
 const grades=s.table.powerPhysiology.meridian.gateRecords,
  profile=Build.meridianProfile(5,{meridians:12,
   gatesP:grades.filter(x=>x.quality==='Perfect').length,
   gatesS:grades.filter(x=>x.quality==='Sound').length,
   gatesF:grades.filter(x=>x.quality==='Flawed').length,
   seaRings:s.player.meridian.dantianSea.rings,
   extraordinary:1,webComplete:true});
 A.equal(s.player.meridian.flow,profile.flow);
 A.equal(s.player.meridian.recoveryRate,profile.recovery);
 A.equal(s.player.meridian.stableQiLimit,profile.qi);
 A.equal(s.player.maxQi,Math.max(oldMax,profile.qi));
 A.equal(s.player.arcane.circles,0);
 A.equal(s.player.soul.phase,0);
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(Net.verify(s),true);
 A.equal(op(s,'livingWebStatus').stage,5);
 A.equal(R.act(s,{system:'power',operation:'status',params:{}}).meridian.stage,5);
 A.throws(()=>op(s,'livingWebComplete',{witnessIndex}),/Stage IV Dantian Sea must precede/);
 const saved=E.exportGame(s),copy=E.importGame(saved);
 A.equal(Net.verify(copy),true);
 const net=copy.table.powerPhysiology.meridian.advancedNetwork;
 net.integrationAttempts[0].source.capacity.newQi+=100;
 A.equal(Net.verify(copy),false,'Forged Qi from a stage event is invalid');
 const altered=E.importGame(saved);
 altered.player.meridian.flow=999;
 A.equal(Net.verify(altered),false,'Source-correct capacity must stay physically derived');
 const after=E.importGame(saved);
 const archived=after.table.powerPhysiology.meridian.advancedNetwork;
 archived.transitions[0].source.witnessHash='altered';
 A.equal(Net.verify(after),false);
}
console.log('Living Meridian route web: genuine Stage IV/108 Gate source, original 8/36/72 anatomy maps, actual engine Qi/time/pressure checks, persistent injuries and separately witnessed clinical recovery, no free Stage, tamper-safe integrity and read-only saved turn replay.');
