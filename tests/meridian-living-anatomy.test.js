'use strict';
// #10 disposable original earned Stage IV -> individually mapped Stage V living
// circuits. Real engine rolls, World clock, source events and no campaign saves.
const A=require('node:assert/strict'),FS=require('node:fs'),
 OS=require('node:os'),Path=require('node:path'),
 E=require('../engine.js'),R=require('../rules'),C=require('../rules/core'),
 Net=require('../rules/meridian-living-anatomy'),Turn=require('../scripts/chat-turn');
const op=(s,k,p={})=>R.act(s,{system:'meridian',operation:k,params:p});
// Stage VI and VII are genuine Qi-intensive work. The test cannot gift Qi
// or bypass clinical resource checks: use the existing safe local sleep
// recovery, with normal intervening waking time and independent world ticks.
function restForQi(s,needed){
 let nights=0;
 while(s.player.qi<needed){
  A.ok(nights++<12,'Normal overnight Qi recovery should suffice for a disposable advanced practice');
  const before=s.world.minutes,oldQi=s.player.qi;
  const slept=R.act(s,{system:'health',operation:'sleep',params:{hours:8}});
  A.equal(slept.sleptHours,8);
  A.equal(s.world.minutes,before+480);
  A.equal(s.player.qi,Math.min(s.player.maxQi,oldQi+10));
  if(s.player.qi<needed){
   const daytime=R.act(s,{system:'world',operation:'wait',params:{minutes:960}});
   A.ok(daytime);
  }
 }
}
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
 // Stage VI extends this SAME earned and source-verified Stage V network.
 // An observed technique-and-intent is physically practiced, not a mental
 // power granted by naming it or waiting through a compulsory calendar.
 const Intent=require('../rules/meridian-living-intent');
 const routeId=circuits[0].id,intentId='reedcurrent_defensive_stillness';
 const baseline=E.exportGame(s),oldRng=s.rngState;
 A.deepEqual(op(s,'intentStatus').forms,[]);
 A.equal(E.exportGame(s),baseline);A.equal(s.rngState,oldRng);
 A.throws(()=>op(s,'intentMap',{
  id:intentId,routeId,name:'Defensive Stillness',
  movement:'A genuine measured flowing defensive return movement of the lower human channels',
  principle:'Controlled intent steadies breath and forearm fascia under safe external pressure',
  automaticSignal:'An autonomic tremorless return flow appears under mild observed movement resistance',
  limit:'Does not create invulnerable armour or command another person or creature',
  interference:'Strong unfamiliar pressure or injury may interrupt the pattern',
  witnessIndex:0}),/original local witnessed|original witnessed|intent scene/);
 A.equal(E.exportGame(s),baseline);
 C.event(s,'story',
  'Original Stage V circulation succeeds as an observed defensive intention in the same practitioner without inventing an offensive art.',{
   origin:Intent.OBSERVE,location:s.world.location,intentId,routeId,
   observedResponse:'A real low-pressure movement responds to a previously practised individual return channel.',
   trainingOrigin:'Previously successful original Meridian route integrations and reflex adjustments of the same body.'});
 const mapping=op(s,'intentMap',{
  id:intentId,routeId,name:'Reedcurrent Stillness',
  movement:'A real measured defensive return movement using a previously trained lower-body loop',
  principle:'A deliberately trained intent aligns the original circulation pressure with breath and movement',
  automaticSignal:'An observed low-pressure return reflex begins responding to mild resisted posture changes',
  limit:'Cannot bypass armour, compel minds or manifest an attack without a separately earned technique',
  interference:'Unexpected strain, serious tissue damage or disturbed breathing can break the intended return flow',
  witnessIndex:s.log.length-1});
 A.equal(mapping.mapped,true);
 A.equal(mapping.learnedCombatArt,false);
 A.equal(s.player.meridian.stage,5);
 A.equal(Intent.verify(s),true);
 let earned=false,practices=0;
 for(let i=0;i<8&&!earned;i++){
  C.event(s,'story',
   'The original practitioner visibly repeats a small restrained circulation response while adjusting their own effort and posture.',{
    origin:Intent.PRACTICE,location:s.world.location,intentId,routeId,
    bodilyFeedback:'The same trained channel and breath return in a measurable, limited involuntary micro-response.',
    voluntaryAction:'A separately initiated gentle posture practice is stopped immediately if pressure becomes unsafe.'});
  const ix=s.log.length-1,start=s.world.minutes,qi=s.player.qi;
  const result=op(s,'intentPractice',{id:intentId,witnessIndex:ix,minutes:30});
  A.equal(s.world.minutes,start+30);
  A.equal(s.player.qi,qi-result.qiSpent);
  A.equal(result.stageUnchanged,true);
  A.equal(Intent.verify(s),true);
  practices++;
  earned=result.points>=result.needed;
  const after=E.exportGame(s);
  A.throws(()=>op(s,'intentPractice',{id:intentId,witnessIndex:ix,minutes:30}),
   /real practice scene|original local witnessed|only produce one original check|enough practice/);
  A.equal(E.exportGame(s),after);
 }
 A.ok(earned,'Actual original physical repetition must develop a trained intent');
 A.ok(practices>=2,'One instant label should not turn into fully embodied intent');
 A.equal(s.player.meridian.stage,5);
 C.event(s,'story',
  'A controlled autonomic return current is witnessed under altered pressure, and the individual demonstrably stops it.',{
   origin:Intent.EMBODY,location:s.world.location,intentId,routeId,
   responseWithoutPrompt:'Actual earned defensive circulation briefly initiates under a familiar mild physical perturbation.',
   controllableStop:'The practitioner deliberately relaxes the real meridian pressure and the response terminates without new harm.',
   pressureCountertest:'Altered low-intensity physical resistance limits the response and demonstrates it is not universal domination.'});
 const start=s.world.minutes,qi=s.player.qi,sta=s.player.stamina,
  max=s.player.maxQi;
 const emb=op(s,'intentEmbody',{id:intentId,witnessIndex:s.log.length-1,minutes:90});
 A.equal(emb.formed,true);
 A.equal(emb.stage,6);
 A.equal(s.world.minutes,start+90);
 A.equal(s.player.qi,qi-emb.qiSpent);
 A.equal(s.player.stamina,sta-emb.staminaSpent);
 A.ok(s.player.maxQi>=max);
 A.equal(s.player.meridian.intentDepth,1);
 A.equal(emb.noAutomaticMindAttackOrTechnique,true);
 A.equal(op(s,'intentStatus').embodied,true);
 A.equal(Intent.verify(s),true);A.equal(Net.verify(s),true);
 A.equal(s.player.arcane.circles,0);
 A.equal(s.player.humanEvolution.stage,0);
 const original=E.exportGame(s),replayed=E.importGame(original);
 A.equal(Intent.verify(replayed),true);
 replayed.table.powerPhysiology.meridian.advancedNetwork.intentForms[intentId].points=99;
 A.equal(Intent.verify(replayed),false);
 const tampered=E.importGame(original);
 tampered.table.powerPhysiology.meridian.advancedNetwork.intentTests[0].source.capacity.newQi+=100;
 A.equal(Net.verify(tampered),false);
 A.throws(()=>op(s,'intentEmbody',{id:intentId,witnessIndex:0}),
  /source-verified Stage V|requires.*Stage V/);
 // Real Stage VII tissue integration is trained from existing fascia and
 // the already earned Stage VI intent—not from a declared rare lineage.
 const Phys=require('../rules/meridian-physique-integration');
 const interfaceId='forearm_fascia_response',tissueRoute=routeId;
 // No unearned current-Qi refill. Existing world recovery must restore
 // enough actual energy after earlier 108-Gate, Stage V and Stage VI work.
 restForQi(s,Math.min(30,s.player.maxQi));
 const beforePhysique=E.exportGame(s);
 A.deepEqual(op(s,'physiqueStatus').interfaces,[]);
 A.equal(E.exportGame(s),beforePhysique);
 C.event(s,'story',
  'The living practitioner has an ordinary forearm fascia network physically examined and its circulation response documented.',{
   origin:Phys.OBSERVE,location:s.world.location,
   interfaceId,routeId:tissueRoute,
   examination:'The ordinary tendon and fascia structure is directly examined during original source-bound low-pressure movement.',
   tissueResponse:'Fascia and blood flow respond measurably to gradual Qi pressure without creating a magical extra organ.',
   evolvedPowerClaim:false});
 const mapped=op(s,'physiqueMap',{
  id:interfaceId,routeId:tissueRoute,intentId,
  tissue:'Ordinary forearm fascia and tendon sheaths',
  existingAnatomy:'An actual source-observed ordinary forearm tendon and fascia network within the individual human body',
  organResponse:'The original observed pressure and tendon motion alter local Qi flow in a repeatable minor way',
  adaptationMethod:'Controlled low-pressure tendon recruitment synchronises with the previously earned defensive intent',
  metabolicCost:'Sustained physical work needs genuine Stamina, heat dissipation and existing Dantian Qi',
  injuryRisk:'Too much local pressure causes measured strain and destabilises the existing Meridian network',
  limit:'Normal tissue does not grant a beast organ, elemental resistance or an automatically learned combat power',
  witnessIndex:s.log.length-1});
 A.equal(mapped.registered,true);
 A.equal(mapped.noCreatedOrganOrAbility,true);
 A.equal(s.player.meridian.stage,6);
 let bodyReady=false;
 for(let i=0;i<8&&!bodyReady;i++){
  C.event(s,'story',
   'An actual controlled tendon-and-Qi training repetition shows physiologically limited integration in a voluntarily moving body.',{
    origin:Phys.PRACTICE,location:s.world.location,
    interfaceId,routeId:tissueRoute,
    adaptation:'The same observed normal connective tissues respond slowly to measured Dantian flow under distinct resisted movement.',
    welfareCountertest:'The subject stops the exercise if discomfort rises and uses normal rest and hydration rather than inventing new tissue.'});
  const j=s.log.length-1;
  if(s.player.qi<5)restForQi(s,Math.min(20,s.player.maxQi));
  const result=op(s,'physiqueWork',{id:interfaceId,witnessIndex:j,minutes:30});
  A.equal(result.noInstantPhysiqueOrOriginTrait,true);
  A.equal(Phys.verify(s),true);
  bodyReady=result.points>=result.needed;
 }
 A.equal(bodyReady,true,'Actual source-tested ordinary tissue should physically adapt by earned checks');
 A.equal(s.player.meridian.stage,6);
 const beforeBody=s.world.minutes,qiBeforeBody=s.player.qi,
  maxBeforeBody=s.player.maxQi;
 C.event(s,'story',
  'The real individual demonstrates restrained full-body load redistribution through their own formerly ordinary connective tissues.',{
   origin:Phys.EMBODY,location:s.world.location,
   interfaceId,routeId:tissueRoute,
   crossBodyResponse:'An original trunk-to-periphery tendon and fascia response distributes small physical load through previously integrated circulation.',
   materialCost:'Ordinary vascular and fascial tissues require real Qi, Stamina, nutrition and thermal recovery during sustained movement.',
   failureBoundary:'Real tissue overload, unresolved Meridian injury or absent physical circulation would collapse the response.'});
 if(s.player.qi<9)restForQi(s,Math.min(20,s.player.maxQi));
 const finished=op(s,'physiqueComplete',{id:interfaceId,witnessIndex:s.log.length-1,minutes:90});
 A.equal(finished.formed,true);
 A.equal(finished.noHumanEvolutionOrRareOrganGranted,true);
 A.equal(s.player.meridian.stage,7);
 A.equal(s.world.minutes,beforeBody+90);
 A.equal(s.player.qi,qiBeforeBody-finished.qiSpent);
 A.ok(s.player.maxQi>=maxBeforeBody);
 A.equal(s.player.meridian.physiqueIntegration,1);
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(s.player.origin.stableTraits.length,0);
 A.equal(s.player.arcane.circles,0);
 A.equal(Net.verify(s),true);
 A.equal(Phys.verify(s),true);
 A.equal(op(s,'physiqueStatus').integrated,true);
 const bodySaved=E.exportGame(s),bodyCopy=E.importGame(bodySaved);
 A.equal(Phys.verify(bodyCopy),true);
 bodyCopy.table.powerPhysiology.meridian.advancedNetwork
  .tissueInterfaces[interfaceId].points=99;
 A.equal(Net.verify(bodyCopy),false);
 const bodyTampered=E.importGame(bodySaved);
 bodyTampered.table.powerPhysiology.meridian.advancedNetwork
  .tissueTests[0].source.capacity.newMax+=100;
 A.equal(Phys.verify(bodyTampered),false);
 // VIII: a physical short-range domain with measured actual boundaries,
 // contestable environment, energy costs and no NPC/mind control.
 const Domain=require('../rules/meridian-living-domain');
 const domainId='reedcurrent_narrow_return_field';
 const measured=3,biome=require('../world/lived-places').location(s,s.world.location).biome;
 const preMap=E.exportGame(s);
 A.deepEqual(op(s,'domainStatus').domains,[]);
 A.equal(E.exportGame(s),preMap);
 A.throws(()=>op(s,'domainMap',{
  id:domainId,tissueId:interfaceId,routeId:tissueRoute,
  name:'Measured Return Field',principle:'A small observed counterflow in previously integrated fascia',
  environment:'Near the real stone crossing in known stable local air and ground',
  counter:'Intervening harder pressure or disrupted breath collapses the field',
  collapse:'Real reservoir strain and circulation conflict end the bounded response',
  limit:'No control of people, wildlife, weather or distant territory is created',
  radius:measured,witnessIndex:0}),/observed local domain|prior witnessed|physical local/);
 A.equal(E.exportGame(s),preMap);
 C.event(s,'story',
  'The real practitioner measures a small pressure-responsive circulation region with a clearly observed local environmental limit.',{
   origin:Domain.MAP,location:s.world.location,
   domainId,routeId:tissueRoute,
   radiusMetres:measured,biome,
   physicalMeasurement:'Actual independent measurements show the near-body return current weakens completely beyond three metres.',
   environmentSupport:'The observed sheltered crossing has ordinary air and ground conditions that allow the bounded current.'});
 const mappedDomain=op(s,'domainMap',{
  id:domainId,tissueId:interfaceId,routeId:tissueRoute,
  name:'Measured Reedcurrent Return Field',
  principle:'A genuine previously earned circulation can answer mild nearby air-pressure changes',
  environment:'Only ordinary sheltered air and firm ground at this actually observed crossing',
  counter:'Interrupting exhalation or stronger physical resistance collapses the finite return',
  collapse:'Exhaustion, blocked tissue or unsupported environmental pressure ends all response',
  limit:'A small self-centred field cannot make bystanders obey, grant perception or attack them',
  radius:measured,witnessIndex:s.log.length-1});
 A.equal(mappedDomain.mapped,true);
 A.equal(mappedDomain.active,false);
 A.equal(Domain.verify(s),true);
 let fieldReady=false;
 for(let i=0;i<8&&!fieldReady;i++){
  if(s.player.qi<10)restForQi(s,Math.min(22,s.player.maxQi));
  C.event(s,'story',
   'The original practitioner attempts an independently observed bounded field and tests actual collapse under changed wind.',{
    origin:Domain.PRACTICE,location:s.world.location,domainId,routeId:tissueRoute,
    counterPressure:'A shifted breeze and a measured resistant obstacle interrupt the small local pressure response.',
    observedCollapse:'The observed circulation ceases without the practitioner controlling the obstacle or environment.'});
  const ix=s.log.length-1,oldQi=s.player.qi;
  const trained=op(s,'domainPractice',{id:domainId,witnessIndex:ix,minutes:30});
  A.equal(s.player.qi,oldQi-trained.qiSpent);
  A.equal(trained.noPeopleOrCombatControl,true);
  A.equal(Domain.verify(s),true);
  fieldReady=trained.points>=trained.needed;
 }
 A.equal(fieldReady,true);
 A.equal(s.player.meridian.stage,7);
 restForQi(s,Math.min(22,s.player.maxQi));
 C.event(s,'story',
  'The individual demonstrates that the observed short-range field responds to counterpressure and stops at a measured boundary.',{
   origin:Domain.FORM,location:s.world.location,domainId,routeId:tissueRoute,
   radiusMetres:measured,
   measuredBoundary:'The independently measured three-metre edge ends all supported circulation beyond the close ground.',
   environmentCounter:'A physical resistance and changed air flow impose a real limit on this voluntary circulation field.'});
 const beforeDomain=s.world.minutes,oldDomainQi=s.player.qi,
  oldDomainMax=s.player.maxQi;
 const formation=op(s,'domainForm',{id:domainId,witnessIndex:s.log.length-1,minutes:90});
 A.equal(formation.formed,true);
 A.equal(formation.stage,8);
 A.equal(s.world.minutes,beforeDomain+90);
 A.equal(s.player.qi,oldDomainQi-formation.qiSpent);
 A.ok(s.player.maxQi>=oldDomainMax);
 A.equal(s.player.meridian.domainIntegration,1);
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(s.player.arcane.circles,0);
 A.equal(Net.verify(s),true);
 A.equal(Domain.verify(s),true);
 A.equal(op(s,'domainStatus').formed,true);
 if(s.player.qi<9)restForQi(s,Math.min(17,s.player.maxQi));
 C.event(s,'story',
  'The individual maintains only a brief, countertested personal pressure response and cannot extend it into control of others.',{
   origin:Domain.PULSE,location:s.world.location,domainId,routeId:tissueRoute,
   environmentCounter:'Changing ambient pressure independently checks the small field and can collapse it completely.',
   independentBoundary:'Nearby people and animals stay independently acting, and the observed field has a hard measured edge.'});
 const j=s.log.length-1,oldPulseQi=s.player.qi,oldPulseMinute=s.world.minutes;
 const pulse=op(s,'domainPulse',{id:domainId,witnessIndex:j,minutes:10});
 A.equal(pulse.attempted,true);
 A.equal(pulse.radiusMetres,measured);
 A.equal(s.player.qi,oldPulseQi-pulse.qiSpent);
 A.equal(s.world.minutes,oldPulseMinute+10);
 A.equal(pulse.limitedEffect.includes('not area ownership'),true);
 A.equal(Domain.verify(s),true);
 A.throws(()=>op(s,'domainPulse',{id:domainId,witnessIndex:j,minutes:10}),
  /already been resolved/);
 // A personally earned small field travels with its owner; it must
 // remeasure local physical support rather than act as land ownership.
 A.equal(E.dispatch(s,'travel academy').ok,true);
 A.equal(s.world.location,'academy');
 if(s.player.qi<9)restForQi(s,Math.min(18,s.player.maxQi));
 C.event(s,'story',
  'The same earned narrow Qi field is independently measured again inside the academy under the different local building conditions.',{
   origin:Domain.PULSE,location:s.world.location,
   domainId,routeId:tissueRoute,
   biome:require('../world/lived-places').location(s,s.world.location).biome,
   radiusMetres:measured,
   ambientSupport:'The actually observed sheltered laboratory air and solid floor support the same small three-metre field.',
   environmentCounter:'Distinct local stone and air resistance test the same source-earned boundary before use.',
   independentBoundary:'Academy staff and passing beasts remain fully independent of the individual bodily field.'});
 const remote=op(s,'domainPulse',{id:domainId,witnessIndex:s.log.length-1,minutes:10});
 A.equal(remote.attempted,true);
 A.equal(remote.radiusMetres,measured);
 A.equal(Domain.verify(s),true);
 A.equal(E.dispatch(s,'travel crossing').ok,true);
 A.equal(s.world.location,'crossing');
 const savedDomain=E.exportGame(s);
 const domainCorrupt=E.importGame(savedDomain);
 domainCorrupt.table.powerPhysiology.meridian.advancedNetwork
  .domainTests[0].source.capacity.newQi+=20;
 A.equal(Domain.verify(domainCorrupt),false);
 const pulseCorrupt=E.importGame(savedDomain);
 pulseCorrupt.table.powerPhysiology.meridian.advancedNetwork
  .domainPulses[0].source.radius=300;
 A.equal(Net.verify(pulseCorrupt),false);
 // IX: an individual genuinely examined and practiced body constitution.
 // It cannot create immortality, origin anatomy or unrelated human ranks.
 const Constitution=require('../rules/meridian-transcendent-constitution'),
  constitutionId='reedcurrent_individual_tendon_physiology';
 s.player.attributes.con=30;
 const beforeConstitution=E.exportGame(s);
 A.equal(op(s,'constitutionStatus').formed,false);
 A.equal(E.exportGame(s),beforeConstitution);
 A.throws(()=>op(s,'constitutionMap',{
  id:constitutionId,domainId,tissueId:interfaceId,
  name:'Individual Tissue Physiology',
  physicalTransformation:'Previously existing fascia changes its pressure response under sustained whole-body circulation',
  metabolicLimit:'Actual tissue remains vulnerable to heat loss, hunger, fatigue and excessive Dantian load',
  maintenance:'Ongoing resting, nutritional support and measured pressure care maintain its biological operation',
  injuryBoundary:'Excess circulation or damaged routes still cause ordinary injury and reversible destabilisation',
  individualConsequence:'The body carries a distinctive constrained metabolic profile and remains finite and vulnerable',
  lifespanLimit:'No lifespan extension, guaranteed regeneration or supernatural immortality is demonstrated',
  witnessIndex:0}),/original bodily source|witnessed examination|source-witnessed/);
 A.equal(E.exportGame(s),beforeConstitution);
 C.event(s,'story',
  'The original practitioner has an independent bodily examination showing limited but unusual real tissue energy adaptations.',{
   origin:Constitution.OBSERVE,location:s.world.location,constitutionId,
   examinedAlteration:'Direct observation shows that previously trained ordinary connective tissues have developed a stable distinct pressure response.',
   independentLimit:'A clinical countertest shows that fatigue and heat loss still prevent unlimited circulation or invulnerable tissue.',
   metabolicBurden:'Actual maintenance needs measurable energy, rest and ordinary tissue nutrition after sustained activity.',
   automaticImmortality:false});
 const formMap=op(s,'constitutionMap',{
  id:constitutionId,domainId,tissueId:interfaceId,
  name:'Individually Tempered Reedcurrent Fascia',
  physicalTransformation:'Observed original connective tissues acquire a stable conditioned pressure response linked to the earned living Qi network',
  metabolicLimit:'Heat, strain and depleted energy still interrupt normal bodily function and limit the specialized response',
  maintenance:'Sufficient nutrition, recovery and measured source-witnessed circulation care remain physically necessary',
  injuryBoundary:'Even this trained connective tissue may tear or destabilise under high pressure and active injuries',
  individualConsequence:'This particular person retains a finite body and a distinct constrained fascia response to tested Qi pressure',
  lifespanLimit:'No change to maximum lifespan, invulnerability or supernatural immortality is established by this examination',
  witnessIndex:s.log.length-1});
 A.equal(formMap.mapped,true);
 A.equal(formMap.noLongevityOrEvolutionAward,true);
 A.equal(Constitution.verify(s),true);
 let constitutionReady=false;
 for(let i=0;i<12&&!constitutionReady;i++){
  if(s.player.qi<12)restForQi(s,Math.min(24,s.player.maxQi));
  C.event(s,'story',
   'Actual original tissue and Qi are repeatedly examined while the individual performs physically restrained constitutional adaptation.',{
    origin:Constitution.PRACTICE,location:s.world.location,constitutionId,
    tissueChange:'A distinct measured return-current response occurs in the same observed fascia without creating another organ.',
    metabolicCost:'Real Qi and Stamina are spent, heat accumulates and the subject pauses for normal recovery.'});
  const ix=s.log.length-1;
  const result=op(s,'constitutionPractice',{id:constitutionId,witnessIndex:ix,minutes:30});
  A.equal(result.noInstantConstitutionOrImmortality,true);
  A.equal(Constitution.verify(s),true);
  constitutionReady=result.points>=result.needed;
 }
 A.equal(constitutionReady,true,'Genuinely practiced individual tissue physiology must be earned');
 A.equal(s.player.meridian.stage,8);
 restForQi(s,Math.min(25,s.player.maxQi));
 C.event(s,'story',
  'The subject physically demonstrates an original independent, sustained physiological response and its clear failure limit.',{
   origin:Constitution.FORM,location:s.world.location,constitutionId,
   sustainedPhysiology:'Personally tested and integrated fascia, breathing and Meridian flow remain coordinated through a controlled load.',
   counterEvidence:'Loss of energy, external resistance and direct vascular fatigue demonstrate that this individual is not invulnerable.',
   observedTradeoff:'The original body spends Qi and metabolic energy to sustain altered ordinary tissues and requires recovery afterwards.'});
 const beforeNine=s.world.minutes,qiNine=s.player.qi,maxNine=s.player.maxQi;
 const formedNine=op(s,'constitutionForm',{id:constitutionId,witnessIndex:s.log.length-1,minutes:90});
 A.equal(formedNine.formed,true);
 A.equal(s.player.meridian.stage,9);
 A.equal(s.world.minutes,beforeNine+90);
 A.equal(s.player.qi,qiNine-formedNine.qiSpent);
 A.ok(s.player.maxQi>=maxNine);
 A.equal(formedNine.noImmortalityOrUnlearnedPower,true);
 A.equal(s.player.meridian.constitutionIntegration,1);
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(s.player.origin.stableTraits.length,0);
 A.equal(s.player.arcane.circles,0);
 A.equal(Net.verify(s),true);
 A.equal(Constitution.verify(s),true);
 A.equal(op(s,'constitutionStatus').formed,true);
 if(s.player.qi<5)restForQi(s,Math.min(16,s.player.maxQi));
 C.event(s,'story',
  'A source-observed maintenance examination checks genuine circulation, appetite, tissue strain and ordinary human bodily limits.',{
   origin:Constitution.CARE,location:s.world.location,constitutionId,
   physicalMaintenance:'Rest, controlled breathing and specific tendon therapy support the actual altered metabolic structure.',
   observedLimit:'Measured fatigue and heat loss confirm that this constitution still requires normal care and real energy.'});
 const careIndex=s.log.length-1,beforeCare=s.world.minutes,careQi=s.player.qi;
 const maintained=op(s,'constitutionCare',{id:constitutionId,witnessIndex:careIndex,minutes:45});
 A.equal(s.world.minutes,beforeCare+45);
 A.equal(s.player.qi,careQi-maintained.qiSpent);
 A.equal(maintained.note.includes('no free healing'),true);
 A.equal(Constitution.verify(s),true);
 const beforeDuplicateCare=E.exportGame(s),rngBeforeDuplicateCare=s.rngState;
 A.throws(()=>op(s,'constitutionCare',{id:constitutionId,witnessIndex:careIndex}),
  /already received one original check|source-witnessed examination of the same actual body is missing/);
 A.equal(E.exportGame(s),beforeDuplicateCare,'Rejected repeated care must never mutate source or player resources');
 A.equal(s.rngState,rngBeforeDuplicateCare,'A repeated care request must not reroll');
 const finalSave=E.exportGame(s),loaded=E.importGame(finalSave);
 A.equal(Net.verify(loaded),true);
 A.equal(Constitution.verify(loaded),true);
 loaded.table.powerPhysiology.meridian.advancedNetwork
  .constitutionTests[0].source.capacity.newQi+=50;
 A.equal(Constitution.verify(loaded),false);
 const corruptCare=E.importGame(finalSave);
 corruptCare.table.powerPhysiology.meridian.advancedNetwork
  .constitutionCare[0].source.burdenAfter=999;
 A.equal(Net.verify(corruptCare),false);
}
console.log('Living Meridian route web: genuine Stage IV/108 Gate source, original 8/36/72 anatomy maps, actual engine Qi/time/pressure checks, persistent injuries and separately witnessed clinical recovery, no free Stage, tamper-safe integrity and read-only saved turn replay.');
