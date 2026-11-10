'use strict';
// Master §24: one real original human source advances stages III–VIII with
// independent rights, original physical costs/risks and a real bounded action.
// Disposable provenance, not active campaign narrative or beast material.
const A=require('node:assert/strict'),Crypto=require('node:crypto'),
 E=require('../engine.js'),R=require('../rules'),C=require('../rules/core'),
 L=require('../rules/beast-origin-lineage'),
 I=require('../rules/beast-origin-integration');
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const act=(s,op,p={})=>R.act(s,{system:'origin',operation:op,params:p});
const core=(s,op,p={})=>R.act(s,{system:'core',operation:op,params:p});
function game(seed){
 const s=E.newGame({seed,name:'Disposable human Origin Pattern laboratory',path:'origin'});
 R.unified.ensurePlayer(s);s.world.location='academy';
 for(const k of ['str','dex','con','int','wis','cha'])s.player.attributes[k]=30;
 for(const k of ['research','medicine','survival','arcana','cultivation'])
  s.player.skills[k].rank=5;
 return s;
}
function source(s,id,route='ancestral'){
 C.event(s,'story','An individual and independently examined Origin Pattern is established by original anatomical observation and separate source testimony.',{
  origin:L.SOURCE,sourceId:id,location:s.world.location,
  sourceStudy:'Repeated individual anatomical measurements demonstrate a specific known original pattern'});
 const observation=structuredClone(s.log.at(-1));
 const q={origin:L.SOURCE,sourceId:id,route,
  traitName:'Personally adapted human respiratory proprioception',
  exactObservedMechanism:'A measured human respiratory coordination pathway responds to original mechanical ground contact without acquiring beast organs.',
  originalBiology:'Original human lungs, blood and proprioceptive nerves remain ordinary vulnerable human anatomy throughout adaptation.',
  magicalRequirements:'This individually witnessed organic expression has a metabolic oxygen budget and does not require a Mana Core.',
  spiritualRequirements:'The original human soul, body identity and agency remain unchanged by an endogenous physiological mechanism.',
  metabolicLimits:'Real air, blood oxygen, food, rest and tissue integrity constrain the individually studied human balance response.',
  conflictLimit:'Other stable traits and the existing body reflexes can compete for finite oxygenation and physical load capacity.',
  integrationLoad:1,
  energyMode:'metabolic',effectAdapter:'local-footing',
  humanExpression:'Coordinated original human breathing and peripheral reflexes can assist one real source-observed local footing task.',
  independentAdaptationLimit:'Fatigue, wet stones, tendon injury and low oxygen remain measurable failure conditions at all stages.',
  rights:{mode:'unresolved',verified:false,
   originalProvenance:'No present material, inherited rights or donor consent is established by the early ecological study.'},
  minute:s.world.minutes,location:s.world.location,observation,
  observationHash:hash(observation)};
 s.table.originTraitSources||={};
 s.table.originTraitSources[id]={origin:L.SOURCE,source:q,seal:hash(q)};
}
function observed(s,id,origin,more={}){
 C.event(s,'story','The original human Origin Pattern experiment is observed independently and physically measured at the actual local research site.',{
  origin,sourceId:id,location:s.world.location,
  measuredIndividualResponse:'Measured original human body coordination responds within a bounded local oxygen and proprioception experiment.',
  independentFailureLimit:'A separate physical fatigue, tendon-injury and oxygen deprivation countertest interrupts this individual response.',
  ...more});
 return s.log.length-1;
}
function authorise(s,id,mode,material,extra={}){
 const lineageSeal=s.table.originTraitSources[id].seal;
 C.event(s,'story','An independent source and rights assessor verifies the exact Origin material ownership, identity and separate donor rights when relevant.',{
  origin:I.AUTH,sourceId:id,mode,location:s.world.location,
  verifiedSourceRights:'The individual named source and lawful rights holder are explicitly checked against this specific human biology research record.',
  observedOriginalMaterialIdentity:'The matching original biological source is individually examined instead of treating an arbitrary sighting as donated tissue.',
  ...(material.mode==='inventory'?{item:material.item,quantity:material.quantity}:{}),
  ...extra});
 const witness=structuredClone(s.log.at(-1));
 const q={origin:I.AUTH,sourceId:id,lineageSeal,mode,material,
  minute:s.world.minutes,location:s.world.location,
  witness,witnessHash:hash(witness)};
 s.table.originLineageAuthorisations||={};
 s.table.originLineageAuthorisations[id]={origin:I.AUTH,source:q,seal:hash(q)};
}
function rest(s,min){
 let tries=0;
 while(s.player.stamina<min){
  A.ok(++tries<15,'Ordinary body resources recover via existing sleep, not a free resource grant');
  R.act(s,{system:'health',operation:'sleep',params:{hours:8}});
  if(s.player.stamina<min)
   R.act(s,{system:'world',operation:'wait',params:{minutes:960}});
 }
}
function prepare(s,id){
 let mapped=false;
 for(let k=0;k<12&&!mapped;k++){
  rest(s,1);
  const i=observed(s,id,L.MAP);
  mapped=act(s,'lineageMap',{sourceId:id,witnessIndex:i,minutes:15}).mapped;
 }
 A.equal(mapped,true,'Real individual original mapping must finish');
 for(const axis of L.AXES){
  let result=null;
  for(let k=0;k<12&&result!=='promising';k++){
   rest(s,1);
   const i=observed(s,id,L.SCREEN,{axis,
    measuredExistingTraitInteractions:'Original personal biological trait conflicts are independently measured against existing integrated human tissue.'});
   result=act(s,'lineageScreen',{sourceId:id,axis,witnessIndex:i,minutes:15}).result;
  }
  A.equal(result,'promising','The original physical/energy/spiritual/conflict evidence must verify independently');
 }
}
{
 const s=game(140047),id='ancestral_breath_one';
 source(s,id);prepare(s,id);
 const humanBefore=structuredClone(s.player.humanEvolution),
  originBefore=structuredClone(s.player.origin);
 let i=observed(s,id,I.STAGE,{step:3,
  observedHumanMechanism:'A real physiological ancestral pattern is dormant in the original human without an external donor.',
  observedMetabolicCost:'The first human seeding requires individually observed living oxygen and blood circulation'});
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'lineageIntegrate',{sourceId:id,witnessIndex:i,minutes:90}),
  /ethically|authenticated|rights/i);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 authorise(s,id,'self-endogenous',{mode:'endogenous',
  sourceIdentity:'An observed dormant ancestral trait residing only in this individual human body, with no harvested animal.'});
 let last=0;
 for(const step of [3,4,5,6,7,8]){
  let completed=false;
  for(let tries=0;tries<10&&!completed;tries++){
   rest(s,I.RULES[step].cost);
   if(act(s,'lineageIntegrationStatus')[0].physiologicalStrain>=5){
    const w=observed(s,id,I.CARE,{step:'care',
     observedHumanMechanism:'Original strained human blood and respiratory tissues are physically assessed for clinical treatment.',
     observedMetabolicCost:'Actual wound treatment consumes rest, oxygenation, bodily time and genuine clinical stamina'});
    act(s,'lineageCare',{sourceId:id,witnessIndex:w,minutes:60});
   }
   i=observed(s,id,I.STAGE,{step,
    observedHumanMechanism:'Each living human developmental stage is independently observed and functional without imported beast anatomy.',
    observedMetabolicCost:'The independently measured human body expends original Stamina, oxygenation and repair resources for this stage.'});
   const beforeClock=s.world.minutes,preSta=s.player.stamina;
   const r=act(s,'lineageIntegrate',{sourceId:id,witnessIndex:i,minutes:90});
   A.equal(r.stage,step);A.equal(r.succeeded,r.check.success);
   A.equal(s.world.minutes,beforeClock+90);
   const elapsedDays=Math.floor(s.world.minutes/1440)-Math.floor(beforeClock/1440);
   A.equal(s.player.stamina,Math.min(s.player.maxStamina,
    preSta-r.staminaSpent+elapsedDays*5));
   A.equal(r.automaticEvolutionStage,false);
   A.equal(r.grantedBeastAbility,false);
   A.equal(L.verify(s),true);
   const data=E.exportGame(s),state=s.rngState;
   A.throws(()=>act(s,'lineageIntegrate',{sourceId:id,witnessIndex:i,minutes:90}),
    /witness|already|completed|original/i);
   A.equal(E.exportGame(s),data);A.equal(s.rngState,state);
   completed=r.succeeded;last=step;
  }
  A.equal(completed,true,'Each genuine human stage needs its actual original success');
  if(step===3){
   A.equal(s.player.origin.load,originBefore.load+1);
   A.equal(s.player.origin.candidate,id);
   A.deepEqual(s.player.origin.stableTraits,originBefore.stableTraits);
  }
  if(step===6){
   const scene=core(s,'prepareSceneCheck',{
    method:'footing',
    intent:'Maintain secure footing on the original visible local terrain using source-earned human breathing coordination'});
   const wi=observed(s,id,I.USE,{checkId:scene.checkId,
    observedFunction:'An actually expressed original human respiratory reflex is independently shown improving ordinary foot placement.',
    independentFailureLimit:'Observed oxygen debt and physical sprain still defeat that same human locomotion response on unstable ground'});
   const found=act(s,'lineageFooting',{sourceId:id,checkId:scene.checkId,witnessIndex:wi});
   A.equal(found.noRollYet,true);
   const beforeRoll=s.rngState,sta=s.player.stamina;
   const check=core(s,'check',{checkId:scene.checkId}).check;
   A.equal(check.modifier,Math.floor((s.player.attributes.dex-10)/2)+
    2*s.player.skills.survival.rank+1);
   A.equal(check.actualOriginLineageSupport?.staminaSpent,1);
   A.equal(check.actualOriginLineageSupport?.fromOriginalEarnedHumanLineage,true);
   A.equal(s.player.stamina,sta-1);
   A.notEqual(s.rngState,beforeRoll,'Only original scene check rolls for the actual human physical action');
   A.equal(L.verify(s),true);
   const snapshot=E.exportGame(s),checkRng=s.rngState;
   A.throws(()=>core(s,'check',{checkId:scene.checkId}),/used|source|check|one-use|witness/i);
   A.equal(E.exportGame(s),snapshot);A.equal(s.rngState,checkRng);
  }
 }
 A.equal(last,8);
 A.equal(s.player.origin.load,originBefore.load+1);
 A.equal(s.player.origin.phase,0);
 A.equal(s.player.origin.candidate,null);
 A.ok(s.player.origin.stableTraits.includes('human_origin_'+id));
 A.deepEqual(s.player.humanEvolution,humanBefore,
  'Personal human biological expression is NOT an automatic separate human Evolution stage');
 A.equal(act(s,'lineageIntegrationStatus')[0].completed,true);
 A.equal(act(s,'lineageStatus').individualSources[0].integrated,true);
 const saved=E.importGame(E.exportGame(s));
 A.equal(L.verify(saved),true);
 saved.table.originLineageStudies[id].integration.attempts[0].source.loadAfter+=4;
 A.equal(L.verify(saved),false,'Forged original human capacity load must fail');
 const forged=E.importGame(E.exportGame(s));
 forged.table.originLineageStudies[id].integration.uses[0].used.staminaSpent=0;
 A.equal(L.verify(forged),false,'Faked original d20 physical Stamina cost must fail');
 A.throws(()=>act(s,'lineageIntegrate',{sourceId:id,witnessIndex:i,minutes:90}),
  /completed/i);
}
{
 const s=game(140048),id='consented_origin_tissue';
 source(s,id,'lineage-transfer');prepare(s,id);
 const i=observed(s,id,I.STAGE,{step:3,
  observedHumanMechanism:'An ethical compatible individual donor tissue source is independently examined in a human clinic.',
  observedMetabolicCost:'Actual individual material is consumed on initial physical seeding, even if the trial fails.'});
 const sampleBefore=s.player.inventory?.origin_sample||0;
 A.throws(()=>act(s,'lineageIntegrate',{sourceId:id,witnessIndex:i,minutes:90}),
  /rights|source|authenticated|ethically/i);
 authorise(s,id,'informed-donation',{
  mode:'inventory',item:'origin_sample',quantity:1,
  sourceIdentity:'An individually authenticated compatible donated origin sample with lawful possession and true physical identity.'
 },{
  donorConsent:true,
  individualDonorConsent:'The independently competent exact donor knowingly and explicitly agreed to this individual tissue use.'});
 const refused=E.exportGame(s),refusedRng=s.rngState;
 A.throws(()=>act(s,'lineageIntegrate',{sourceId:id,witnessIndex:i,minutes:90}),
  /Insufficient genuinely owned origin_sample/);
 A.equal(E.exportGame(s),refused);A.equal(s.rngState,refusedRng);
 // A real, GM-attested inventory receipt is recorded as existing owned stock,
 // not added by the lineage action. This test fixture models material handoff.
 s.player.inventory.origin_sample=1;
 const r=act(s,'lineageIntegrate',{sourceId:id,witnessIndex:i,minutes:90});
 A.equal(r.actualMaterial.mode,'inventory');
 A.equal(r.actualMaterial.item,'origin_sample');
 A.equal(r.actualMaterial.quantity,1);
 A.equal(s.player.inventory.origin_sample||0,0);
 A.equal(L.verify(s),true);
 A.equal(s.player.origin.load,r.succeeded?1:0);
 A.ok(sampleBefore===0);
}
console.log('Origin #14: original stages 3–8, human expression, independently sourced material and no species, stage or resource shortcuts');
