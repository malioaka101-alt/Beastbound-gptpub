'use strict';
// Master §26: one genuinely equipped and personally measured mundane staff
// form aids precisely one real independent wound-combat attack, without a
// second strike, free weapon, larger damage tier or mandatory martial school.
const A=require('node:assert/strict'),E=require('../engine.js'),
 R=require('../rules'),C=require('../rules/core'),
 Weapon=require('../rules/specialist-weapon-intent'),
 PlayerAttack=require('../rules/player-combat-action');
const specialist=(s,op,p={})=>
 R.act(s,{system:'specialist',operation:op,params:p});
const combat=(s,op,p={})=>
 R.act(s,{system:'combat',operation:op,params:p});
function fixture(seed=26166002){
 const s=E.newGame({seed,name:'Disposable authentic individual staff discipline',path:'undecided'});
 R.unified.ensurePlayer(s);
 s.player.attributes.str=30;s.player.skills.combat.rank=5;
 s.player.inventory.training_staff=1;s.player.equippedWeapon='training_staff';
 s.player.combatActions={staff_strike:{
  id:'staff_strike',kind:'mundane',item:'training_staff',
  attribute:'str',damage:4,offM:0,attackBonus:1,canNonlethal:true,
  worldMinute:s.world.minutes,
  source:'Originally witnessed real training staff obtained, physically examined and independently equipped at a public guild practice room'}};
 A.equal(PlayerAttack.profile(s,'staff_strike').damage,4);
 return s;
}
function observe(s,formId){
 C.event(s,'story',
  'Two independent martial observers measure this practitioner using their genuinely carried staff, matching bodily intent to real movement and counterattack.',
  {origin:Weapon.OBS,location:s.world.location,
  formId,attackId:'staff_strike',weaponItem:'training_staff',
  originalSchoolOrIndependentTechnique:'The individual practitioner develops an open-ended trained staff stance by genuinely witnessed repetitions rather than buying a compulsory named school.',
  knownWeaponIntent:'The intention is one bodily integrated nonlethal precise staff angle, not an invisible mind attack or guaranteed wound.',
  measuredFootingAndGrip:'The original left foot, opposite hip and both hands coordinate this individual staff lever in a physically surveyed practice space.',
  breathAndLivingBodyIntegration:'Existing breathing, tendon load and voluntary reflexes redistribute short exertion without creating a new core or magical organ.',
  independentMovementBaseline:'A real untrained straight staff contact on the same measured physical dummy provides an independently observed baseline.',
  independentCountermovementTest:'A separate opponent step to the outside defeats the intended alignment, proving there is no unconditional hit.',
  safetyAndFatigueLimits:'Real stamina, known wooden weapon geometry, finite muscle tissue and body recovery constrain the one-use focus.',
  actualEquipmentProvenance:'The real staff and its mundane strike action were documented independently before this training scene, with no free equipment granted.',
  noWeaponStatChange:true,noUnlearnedMeridianGate:true,
  noGuaranteedHit:true,noExtraAttackRoll:true});
 return s.log.length-1;
}
function enemy(s){
 s.beasts.fox={id:'fox',name:'Independent Wild Fen Fox',
  species:'fenfox',evolutionStage:'Base',sapience:1,
  hp:30,maxHp:30};
 s.encounter={beastId:'fox',observed:true,approaches:0,threat:true};
 s.beasts.fox.combatAssessment={beastId:'fox',species:'fenfox',
  evolutionStage:'Base',sapience:1,worldMinute:s.world.minutes,
  source:'Independent original encounter-specific bodily assessment of this actual cautious fen fox',
  behavior:{style:'territorial',nonlethal:true,canCommunicate:false,
   withdrawalDC:15,parleyDC:18,
   source:'Independently witnessed animal territorial and limited nonlethal defensive actions'},
  stats:{toughness:6,defense:12,stamina:8,
   vigor:1,will:1,offM:0,durM:0,
   sapience:1,attack:3,damage:4,boxes:[3,2,1]}};
}
{
 const s=E.newGame({seed:26166000,name:'No original weapon or form'});
 R.unified.ensurePlayer(s);
 const old=E.exportGame(s),rng=s.rngState;
 A.equal(specialist(s,'weaponStatus').practices,0);
 A.throws(()=>specialist(s,'weaponPractice',{
  attackId:'fabricated_weapon',witnessIndex:0}),
  /genuinely|recorded|weapon|source/i);
 A.equal(E.exportGame(s),old);A.equal(s.rngState,rng);
}
{
 const s=fixture(),wi=observe(s,'original_staff_body_alignment_01');
 const before=E.exportGame(s),rng=s.rngState;
 A.throws(()=>specialist(s,'weaponPractice',{attackId:'staff_strike',
  witnessIndex:wi,extraHit:100,damage:999}),/personally witnessed original form/);
 A.equal(E.exportGame(s),before);A.equal(s.rngState,rng);
 const st=s.player.stamina,min=s.world.minutes,
  result=specialist(s,'weaponPractice',{attackId:'staff_strike',witnessIndex:wi});
 A.equal(result.attempted,true);A.equal(result.prepared,result.check.success);
 A.equal(result.prepared,true,'Original expert physical practice succeeds only through the actual d20 check');
 A.equal(s.player.stamina,st-3);
 A.equal(s.world.minutes,min+45);
 A.equal(s.player.combatActions.staff_strike.damage,4);
 A.equal(s.player.combatActions.staff_strike.offM,0);
 A.equal(specialist(s,'weaponStatus').qualifiedFocuses.length,1);
 A.equal(Weapon.verify(s),true);
 const original=E.exportGame(s),afterRng=s.rngState;
 A.throws(()=>specialist(s,'weaponPractice',{attackId:'staff_strike',witnessIndex:wi}),
  /cannot be rerolled/);
 A.equal(E.exportGame(s),original);A.equal(s.rngState,afterRng);
 s.player.equippedWeapon='wooden_bow';
 const mismatched=E.exportGame(s),mismatchedRng=s.rngState;
 A.throws(()=>Weapon.preflight(s,'original_staff_body_alignment_01','staff_strike'),
  /equipped|inventory|original|real/i);
 A.equal(E.exportGame(s),mismatched);A.equal(s.rngState,mismatchedRng);
 s.player.equippedWeapon='training_staff';
 enemy(s);
 A.equal(combat(s,'begin',{beastId:'fox'}).started,true);
 const fightBefore=E.exportGame(s),rngBefore=s.rngState;
 A.throws(()=>combat(s,'exchange',{intent:'defend',
  weaponFocusId:'original_staff_body_alignment_01'}),
  /focus|Weapon action|attack intent/i);
 A.equal(E.exportGame(s),fightBefore);A.equal(s.rngState,rngBefore);
 const baselineProfile=PlayerAttack.profile(s,'staff_strike');
 const staminaBefore=s.player.stamina,minute=s.world.minutes;
 const answer=combat(s,'exchange',{intent:'attack',attackId:'staff_strike',
  weaponFocusId:'original_staff_body_alignment_01',nonlethal:true});
 A.equal(answer.ownResult.verifiedActionId,'staff_strike');
 A.equal(answer.ownResult.weaponIntent.formId,'original_staff_body_alignment_01');
 A.equal(answer.ownResult.weaponIntent.singlePhysicalAttackBonus,1);
 A.equal(answer.ownResult.weaponIntent.staminaSpent,2);
 A.equal(answer.ownResult.weaponIntent.noAdditionalDie,true);
 A.equal(s.player.stamina<=staminaBefore-2,true,
  'Original focused strike consumes living stamina and may incur independent enemy consequences');
 A.equal(s.world.minutes,minute+1);
 A.ok(['attack','hold','retreat'].includes(answer.enemyPlan));
 A.equal(answer.ownResult.roll>=1&&answer.ownResult.roll<=20,true);
 A.equal(s.player.combatActions.staff_strike.attackBonus,1);
 A.equal(s.player.combatActions.staff_strike.damage,4);
 A.equal(Weapon.verify(s),true);
 A.equal(specialist(s,'weaponStatus').spentStrikes,1);
 A.equal(specialist(s,'weaponStatus').qualifiedFocuses.length,0);
 A.equal(baselineProfile.modifier+1,
  Math.floor((s.player.attributes.str-10)/2)+2*s.player.skills.combat.rank+2);
 const after=E.exportGame(s),usedRng=s.rngState;
 A.throws(()=>Weapon.preflight(s,'original_staff_body_alignment_01','staff_strike'),
  /already used|unavailable/i);
 A.equal(E.exportGame(s),after);A.equal(s.rngState,usedRng);
 const saved=E.importGame(E.exportGame(s));
 A.equal(Weapon.verify(saved),true);
 const altered=E.importGame(E.exportGame(s));
 altered.table.specialistWeaponIntents.trials[0].source.rollEvent.details.roll=20;
 A.equal(Weapon.verify(altered),false);
 const fraudulent=E.importGame(E.exportGame(s));
 fraudulent.table.specialistWeaponIntents.strikes[0].source.bonus=10;
 A.equal(Weapon.verify(fraudulent),false);
 for(let i=0;i<110;i++)C.event(s,'story',
  'Independent villagers continue unrelated events while the genuine single previously prepared staff strike retains its earlier evidence.',{eventIndex:i});
 A.equal(s.log.length,90);
 A.equal(Weapon.verify(E.importGame(E.exportGame(s))),true);
}
console.log('Specialist #16 Weapon Cultivation: genuinely source-equipped staff, independent original body-integrated intent, real practice and stamina-limited one-attack inherited combat bonus without extra dice');
