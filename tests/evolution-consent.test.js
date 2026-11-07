'use strict';
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),Path=require('node:path');
const E=require('../engine'),R=require('../rules'),P=require('../rules/progress'),Turn=require('../scripts/chat-turn');
function fresh(seed=41911){
 const s=E.newGame({name:'Voluntary Evolution Fixture',seed,path:'undecided'});
 s.beasts.fox={id:'fox',name:'Moonleaf Fox',species:'fenfox',evolutionStage:'Base',
  lineage:'Marshlight',sapience:1,consent:true,condition:100,
  mood:'relaxed',needs:{hunger:10,fatigue:10},injuries:[],conditions:[],
  personalityTags:['affiliative'],location:'crossing',relationship:'mutual partner',
  hp:30,maxHp:30,energy:20,maxEnergy:20,level:6,techniques:[]};
 s.player.partnerIds=['fox'];
 R.bonds.register(s,{beastId:'fox',start:'unfamiliar'});
 const b=R.bonds.fromSave(s,'fox');b.trust=90;b.respect=85;b.willingness=90;
 const f={species:'silverveil_fox',formName:'Moonflower Fox',speciesGrade:'Rare',
  individualGrade:'Rare',size:'Small',
  anatomy:['Broad moonlit scent organs','Translucent flowerlike mane'],
  magicalOrgans:['Lunar pollen resonance sac'],
  abilities:[{name:'Moonflower Haze',effect:'Gentle mist at marsh edge',
    cost:'4 Essence',limit:'Only under open sky',
    source:'Signed marsh ecology evolution profile'}],
  needs:{diet:'Marsh insects',habitat:'Sheltered moonlit reeds',care:'Cool shaded rest'},
  levelCap:30,maxHp:50,maxEnergy:30};
 const params={beastId:'fox',branchId:'moon',name:'Moonflower',kind:'normal',
  grade:1,requiredYears:0,potential:5,gradeCeiling:5,documented:true,
  conditions:[{label:'The witnessed lunar pollen catalyst has been secured',met:true,known:true}],
  eventStats:{vigor:20,will:20,basis:'Named physiological analysis of the individual at the crossing clinic'},
  formProfile:f};
 s.beasts.fox.evolutionBranchAssessments={moon:{beastId:'fox',branchId:'moon',
  species:'fenfox',evolutionStage:'Base',worldMinute:s.world.minutes,
  source:'Independent pre-authored biological plan and branch prerequisites',parameters:params}};
 R.act(s,{system:'evolution',operation:'register',params:{beastId:'fox',branchId:'moon'}});
 return s;
}
function consent(s){
 const b=s.beasts.fox;
 b.evolutionConsentEvidence={moon:{
  beastId:'fox',branchId:'moon',species:'fenfox',evolutionStage:'Base',
  targetSpecies:'silverveil_fox',targetForm:'Moonflower Fox',
  sapience:b.sapience,location:'crossing',worldMinute:s.world.minutes,
  source:'The present beast was witnessed freely permitting the specific biological rite',
  riteSource:'The prepared and witnessed moonflower evolution rite at the crossing',
  beastWilling:true,guardianConsent:false,informedConsent:false,facility:0,catalysts:[]
 }};
}
const event=(s,params={key:'fox/moon'})=>R.act(s,{system:'evolution',operation:'event',params});
{
 const s=fresh(),r=P.get(s,'fox/moon'),rng=s.rngState,minutes=s.world.minutes;
 // Known non-time facts are absolute prerequisites, not surmountable by
 // a huge roll modifier, even in the raw source reference resolver.
 r.conditions[0].met=false;
 A.throws(()=>P.evolutionEvent(s,r,{source:'A witnessed and properly prepared lunar evolution rite',beastWilling:true}),
  /known non-time evolution prerequisite/);
 A.equal(s.rngState,rng);A.equal(s.world.minutes,minutes);A.equal(r.evolved,undefined);
 consent(s);
 A.throws(()=>event(s),/known non-time evolution prerequisite/);
 A.equal(s.beasts.fox.evolutionConsentEvidence.moon.used,undefined);
 A.equal(s.rngState,rng);
 r.conditions[0].met=true;
 A.throws(()=>event(s,{key:'fox/moon',beastWilling:true}),/only an existing branch key/);
 A.throws(()=>event(s,{key:'fox/moon',care:{handlerRank:20}}),/only an existing branch key/);
 A.equal(s.rngState,rng);
}
{
 const s=fresh(41912),rng=s.rngState,minutes=s.world.minutes;
 A.throws(()=>event(s),/recent, source-recorded voluntary agreement/);
 A.equal(s.rngState,rng);A.equal(s.world.minutes,minutes);
 consent(s);
 s.beasts.fox.evolutionConsentEvidence.moon.targetForm='Different Form';
 A.throws(()=>event(s),/recent, source-recorded voluntary agreement/);
 s.beasts.fox.evolutionConsentEvidence.moon.targetForm='Moonflower Fox';
 s.beasts.fox.condition=40;
 A.throws(()=>event(s),/medical or welfare care/);
 s.beasts.fox.condition=100;
 s.beasts.fox.agencyBoundaries={avoid:['evolution_rite'],worldMinute:0,
  source:'Repeatedly witnessed personal refusal of an irreversible evolutionary rite'};
 A.throws(()=>event(s),/independently refuses/);
 A.equal(s.rngState,rng);
}
{
 const s=fresh(41913);consent(s);
 s.beasts.fox.sapience=2;s.beasts.fox.evolutionConsentEvidence.moon.sapience=2;
 A.throws(()=>event(s),/Protected S2 evolution requires independent, named guardian consent/);
 s.beasts.fox.evolutionConsentEvidence.moon.guardianConsent=true;
 A.throws(()=>event(s),/Protected S2 evolution requires independent, named guardian consent/);
 s.beasts.fox.evolutionConsentEvidence.moon.guardianSource='Named independent guardian witnessed and signed the proposed evolution';
 const rng=s.rngState;
 // Separate lawful guardian evidence is necessary, but not automatically
 // granted by the animal-oriented disposition model.
 A.ok(event(s).outcome.startsWith('evolved'));
 A.notEqual(s.rngState,rng);
}
{
 const s=fresh(41914);consent(s);
 s.beasts.fox.sapience=3;s.beasts.fox.evolutionConsentEvidence.moon.sapience=3;
 A.throws(()=>event(s),/Sapient S3\+ evolution requires separately witnessed, informed voluntary agreement/);
 s.beasts.fox.evolutionConsentEvidence.moon.informedConsent=true;
 A.throws(()=>event(s),/Sapient S3\+ evolution requires separately witnessed, informed voluntary agreement/);
 s.beasts.fox.evolutionConsentEvidence.moon.informedDialogue='Directly witnessed informed and voluntary acceptance after discussing irreversible risks';
 A.ok(event(s).outcome.startsWith('evolved'));
}
{
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-evolution-consent-'));
 try{
  const s=fresh(41915);consent(s);
  const save=Path.join(dir,'save.json');FS.writeFileSync(save,E.exportGame(s)+'\n');
  const original=FS.readFileSync(save,'utf8');
  A.throws(()=>Turn.execute(save,{id:'evo_consentspoof_001',mode:'rule',system:'evolution',
   operation:'event',params:{key:'fox/moon',beastWilling:true}}),/only an existing branch key/);
  A.equal(FS.readFileSync(save,'utf8'),original);
  const req={id:'evo_consentapply_001',mode:'rule',system:'evolution',
   operation:'event',params:{key:'fox/moon'}};
  const done=Turn.execute(save,req);
  A.equal(done.applied,true);A.ok(done.output.rules.outcome.startsWith('evolved'));
  A.equal(done.output.rules.ritualMinutes,180);
  const after=E.importGame(FS.readFileSync(save,'utf8'));
  A.equal(after.beasts.fox.species,'silverveil_fox');
  A.equal(after.beasts.fox.evolutionStage,'Moonflower Fox');
  A.equal(after.beasts.fox.evolutionConsentEvidence.moon.used,true);
  A.equal(after.world.minutes,s.world.minutes+180);
  A.equal(after.table.evolution['fox/moon'].evolved,true);
  A.equal(Turn.execute(save,req).duplicate,true);
  const snapshot=FS.readFileSync(save,'utf8');
  A.throws(()=>Turn.execute(save,{...req,id:'evo_consentretry_001'}),/authenticated current-form branch/);
  A.equal(FS.readFileSync(save,'utf8'),snapshot);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Source-bound evolution consent and immutable biological prerequisites passed');
