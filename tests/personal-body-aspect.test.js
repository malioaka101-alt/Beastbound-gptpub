'use strict';
// A text RPG actor may describe any personally meaningful bodily release.
// The real GM/engine connects their freeform original creation dossier to
// actual Organ Cycle anatomy, original dice and physical consequences.
// These are disposable fixtures; NEVER a campaign save or forced form list.
const A=require('node:assert/strict'),FS=require('node:fs'),OS=require('node:os'),
 Path=require('node:path'),E=require('../engine.js'),R=require('../rules'),
 Creation=require('../rules/creation-design'),Aspect=require('../rules/personal-aspect'),
 Disc=require('../rules/disciplines'),Combat=require('../rules/combat'),
 Turn=require('../scripts/chat-turn');
const act=(s,system,operation,params={})=>R.act(s,{system,operation,params});
function body(seed=1830001,{balance=false}={}){
 const s=E.newGame({seed,name:balance?'Windward Breath':'Rooted River Breath',
  path:'body',background:balance?'scout':'fieldworker'});
 R.unified.ensurePlayer(s);
 s.world.location='crossing';
 const p=s.player,c=s.table.combatants.player;
 p.body.cycles=['Muscle-Tendon Cycle','Bone-Marrow Cycle'];
 p.attributes.con=20;p.skills.survival.rank=5;
 p.maxStamina+=2;p.stamina+=2;c.maxStamina+=2;c.stamina+=2;
 c.toughness+=1;c.boxes[1]+=1;
 s.table.disciplineTraining||={};
 s.table.disciplineTraining.body={target:null,points:0,methods:{},weeks:0,
  cooldownUntil:0,complications:[],history:[
    {day:1,target:'cycle1',quality:'strong',
     change:'Completed Cycle I Muscle-Tendon refinement; +2 stamina, Might +1, M1 natural force'},
    {day:1,target:'cycle2',quality:'strong',
     change:'Completed Cycle II Bone-Marrow refinement; +1 Toughness, +1 Serious wound box'}
  ]};
 let completed=false;
 for(let i=0;i<12&&!completed;i++){
  if(s.player.stamina<4)act(s,'health','sleep',{hours:8});
  const r=act(s,'body','organWork',{focus:'integrated',minutes:15,
   approach:'Condition my own heart, lungs, liver, kidneys and coordinated circulation without borrowed anatomy'});
  completed=r.completed;
 }
 A.equal(completed,true);
 A.equal(Disc.organEarned(s).cycle,3);
 if(balance){p.attributes.dex=30;p.attributes.con=20;}
 else {p.attributes.con=30;p.attributes.dex=12;}
 return s;
}
function proposal(){
 return {title:'Personal Riverpulse Aspect',
  purpose:'When pressure threatens me, I consciously let the actual organ refinement I have cultivated change the rhythm of my heart and breath, the weight of my stance and my response to nearby physical force. It remains my own living human body.',
  medium:'aspect-form',system:'body',function:'ward',magnitude:0,
  range:'self',area:'single',duration:'10min',novelty:'variant',
  materials:[]};
}
function prepared(s){
 const design=act(s,'creation','draft',proposal());
 A.equal(design.recorded,true);
 const id=design.id;
 let learned=false;
 for(let i=0;i<12&&!learned;i++){
  if(s.player.stamina<3)act(s,'health','sleep',{hours:8});
  const r=act(s,'creation','personalDevelop',{id,minutes:15,
   approach:'Test a personal, reversible circulation pattern rooted in my own earned living tissue and the way my body has adapted'});
  A.equal(r.energySpent,0);
  A.equal(r.staminaSpent,1);
  A.ok(Number.isInteger(r.check.roll));
  learned=r.developed;
 }
 A.equal(learned,true);
 return id;
}
function enemy(s){
 s.world.location='forest';
 s.beasts.fox={id:'fox',name:'Independent observed Lanternfen animal',
  species:'fenfox',evolutionStage:'Base',sapience:1,
  location:'forest',hp:40,maxHp:40};
 s.encounter={beastId:'fox',threat:true,observed:true};
 s.beasts.fox.combatAssessment={
  beastId:'fox',species:'fenfox',evolutionStage:'Base',sapience:1,
  worldMinute:s.world.minutes,
  source:'Actually measured independent individual beast combat posture and size at this forest edge',
  behavior:{style:'territorial',nonlethal:true,canCommunicate:false,
   withdrawalDC:15,parleyDC:18,
   source:'Independently observed individual nonlethal territorial defensive reflex'},
  stats:{toughness:35,defense:12,stamina:8,vigor:1,will:1,offM:0,
   durM:0,sapience:1,attack:4,damage:10,boxes:[3,2,1]}
 };
 A.equal(act(s,'combat','begin',{beastId:'fox'}).verifiedIndividualProfile,true);
}
{
 const s=E.newGame({seed:1830000,name:'Untrained Form Declaration',path:'body'});
 const plan=act(s,'creation','draft',proposal());
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>act(s,'creation','personalDevelop',{id:plan.id,minutes:15,
  approach:'I allow my previously trained organs to develop their personal pattern'}),
  /Organ Cycle|original verified tissue-work/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 A.throws(()=>act(s,'creation','personalUse',{id:plan.id}),
  /authentic completed/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
}
for(const balance of [false,true]){
 const s=body(balance?1830003:1830002,{balance}),id=prepared(s);
 const e=Creation.earnedPersonal(s,id);
 A.equal(e.usableAdapter,'body-organ-personal-aspect');
 A.equal(e.aspectMode,balance?'balance':'fortitude');
 A.equal(e.characterBasis.character,balance?'Windward Breath':'Rooted River Breath');
 A.equal(e.characterBasis.background,balance?'scout':'fieldworker');
 A.equal(e.characterBasis.milestone,'Organ Cycle Refinement');
 A.equal(e.boundedToExistingOrgans,true);
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(s.player.origin.phase,0);
 A.equal(s.player.arcane.circles,0);
 A.equal(s.player.meridian.stage,0);
 A.equal(Aspect.status(s).active,false);
 const saved=E.exportGame(s),rng=s.rngState;
 for(const params of [{id,bonus:9},{id,duration:100},{id,mutation:'dragon'},
  {id:'design_999'},{id,guaranteed:true}]){
  A.throws(()=>act(s,'creation','personalUse',params));
  A.equal(E.exportGame(s),saved);A.equal(s.rngState,rng);
 }
 if(s.player.stamina<3)act(s,'health','sleep',{hours:8});
 const start=s.world.minutes,sta=s.player.stamina;
 const released=act(s,'creation','personalUse',{id});
 A.equal(released.activated,true);
 A.equal(released.durationMinutes,3);
 A.equal(released.staminaSpent,2);
 A.equal(s.world.minutes,start+1);
 A.equal(s.player.stamina,sta-2);
 const view=act(s,'creation','aspectStatus');
 A.equal(view.active,true);
 A.equal(view.mode,balance?'balance':'fortitude');
 A.equal(view.mentalEffects,'None: identity and personal agency are unchanged');
 A.equal(view.noNewBeastTraits,true);
 const signed=E.importGame(E.exportGame(s));
 A.equal(Aspect.status(signed).active,true);
 A.deepEqual(Aspect.defensiveEffect(signed,'player'),
  balance?{defense:1,toughness:0}:{defense:0,toughness:1});
 A.deepEqual(Aspect.defensiveEffect(signed,'fox'),{defense:0,toughness:0});
 const evidenceTampered=E.importGame(E.exportGame(s));
 evidenceTampered.table.creationDesigns.records[id].personalDevelopment.attempts[0].earned=8;
 A.equal(Aspect.status(evidenceTampered).active,false);
 A.deepEqual(Aspect.defensiveEffect(evidenceTampered,'player'),{defense:0,toughness:0});
 const cannotStack=E.exportGame(s),unrolled=s.rngState;
 A.throws(()=>act(s,'creation','personalUse',{id}),/already active|already active|cannot be stacked/);
 A.equal(E.exportGame(s),cannotStack);A.equal(s.rngState,unrolled);
 const revertAt=s.world.minutes;
 const lowered=act(s,'creation','personalRevert');
 A.equal(lowered.reverted,true);
 A.equal(s.world.minutes,revertAt+1);
 A.equal(act(s,'creation','aspectStatus').active,false);
 A.equal(act(s,'creation','aspectStatus').cooldownRemaining>0,true);
 A.equal(Aspect.defensiveEffect(s,'player').defense,0);
 const same=E.exportGame(s),roll=s.rngState;
 A.throws(()=>act(s,'creation','personalUse',{id}),/recovery/);
 A.equal(E.exportGame(s),same);A.equal(s.rngState,roll);
 E.advance(s,15);
 if(s.player.stamina<3)act(s,'health','sleep',{hours:8});
 const activatedAgain=act(s,'creation','personalUse',{id});
 A.equal(activatedAgain.activated,true,'A real cooldown, not a once-per-character form licence');
 E.advance(s,3);
 A.equal(Aspect.status(s).active,false,'Time itself expires the form without a status-mutating callback');
 A.deepEqual(Aspect.defensiveEffect(s,'player'),{defense:0,toughness:0});
}
{
 // A personal aspect release DURING combat consumes the same real action
 // as defending, striking or withdrawing; the beast still acts for itself.
 const s=body(1830020,{balance:true}),id=prepared(s);
 if(s.player.stamina<6)act(s,'health','sleep',{hours:8});
 enemy(s);
 const pre=E.exportGame(s),rng=s.rngState;
 for(const args of [
  {intent:'aspect',personalDesignId:'design_999'},
  {intent:'aspect',personalDesignId:id,grantedWings:true},
  {intent:'aspect',personalDesignId:id,defenseBonus:200},
  {intent:'aspect',personalDesignId:id,techniqueId:'qi_strike'},
  {intent:'defend',personalDesignId:id},
  {intent:'revert',personalDesignId:id}
 ]){
  A.throws(()=>act(s,'combat','exchange',args));
  A.equal(E.exportGame(s),pre);A.equal(s.rngState,rng);
 }
 const start=s.world.minutes,sta=s.player.stamina;
 const exchange=act(s,'combat','exchange',{intent:'aspect',personalDesignId:id});
 A.equal(exchange.ownResult.activated,true);
 A.equal(exchange.ownResult.aspectMode,'balance');
 A.ok(['attack','hold','retreat'].includes(exchange.enemyPlan));
 A.equal(exchange.aspectUpkeep.spent,0,'Activation does not also bill a full extra combat minute');
 A.equal(s.world.minutes,start+1);
 // An autonomous incoming beast strike can additionally require a real
 // brace or impose other injury: never falsely assume only player stamina
 // costs occur within a jointly resolved combat exchange.
 A.ok(s.player.stamina<=sta-2);
 A.equal(s.table.combatants.player.stamina,s.player.stamina);
 A.equal(s.player.humanEvolution.stage,0);
 A.equal(s.player.origin.phase,0);
 // If an independently committed opponent attacks, original Combat.attack
 // must read the aspect effect instead of adding a second player roll.
 if(exchange.enemyPlan==='attack'&&exchange.enemyResult)
  A.equal(exchange.enemyResult.defense,
    s.table.combatants.player.defense+1);
 if(s.battle&&Aspect.status(s).active){
  const next=s.world.minutes,before=s.player.stamina;
  const r=act(s,'combat','exchange',{intent:'defend'});
  A.equal(r.aspectUpkeep.spent,1);
  A.equal(s.world.minutes,next+1);
  A.ok(s.player.stamina<=before-1);
  A.equal(s.table.combatants.player.stamina,s.player.stamina);
 }
}
{
 const s=body(1830021,{balance:false}),id=prepared(s);
 const dir=FS.mkdtempSync(Path.join(OS.tmpdir(),'bb-body-aspect-'));
 try{
  if(s.player.stamina<3)act(s,'health','sleep',{hours:8});
  const file=Path.join(dir,'only-disposable.json');
  FS.writeFileSync(file,E.exportGame(s)+'\n');
  const request={id:'body_original_aspect_1830021',mode:'rule',
   system:'creation',operation:'personalUse',params:{id}};
  const one=Turn.execute(file,request);
  A.equal(one.ok,true);A.equal(one.applied,true);
  A.equal(one.output.rules.activated,true);
  A.ok(Number.isInteger(one.output.rules.check.roll));
  const saved=FS.readFileSync(file,'utf8');
  const duplicate=Turn.execute(file,request);
  A.equal(duplicate.duplicate,true);
  A.equal(duplicate.applied,false);
  A.equal(FS.readFileSync(file,'utf8'),saved);
  const frozen=E.importGame(saved);
  A.equal(Aspect.status(frozen).active,true);
 }finally{FS.rmSync(dir,{recursive:true,force:true});}
}
console.log('Personal organ aspect: original freeform creation, two independent physiologies, earned human changes, cost, duration, upkeep, injury potential, reversion, cooldown, independent enemy and exact private replay');
