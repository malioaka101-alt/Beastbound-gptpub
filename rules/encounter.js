'use strict';
// One text-RPG combat exchange: a player intent and an independently committed
// NPC/beast plan are resolved together, never after the GM sees a favourable die.
const E=require('../engine.js'), C=require('./core'), H=require('./unified'), Combat=require('./combat'), Agency=require('./combat-agency'), PlayerAttack=require('./player-combat-action'), WeaponIntent=require('./specialist-weapon-intent'), Spark=require('./arcane-spark'), QiStrike=require('./meridian-qi-strike'), ArcaneWard=require('./arcane-ward'),DualArcane=require('./arcane-dual-channel'),Creation=require('./creation-design'),Aspect=require('./personal-aspect');
const COVER=Object.freeze({
 forest:{kind:'copperwood trunks',source:'Engine-established copperwood trunks in Copperwood Verge'},
 ruins:{kind:'ward-stone masonry',source:'Engine-established ward-stone masonry at Riftglass Outpost'}
});
function inspectCover(s,fight){
 const loc=E.LOCATIONS[s.world?.location];
 if(!loc||fight.terrain!==loc.biome)
  throw Error('Combat terrain no longer matches the independently established local scene');
 const held=fight.playerCover;
 if(held==null)return null;
 const verified=COVER[loc.biome];
 if(!verified||typeof held!=='object'||Array.isArray(held)||
   Object.keys(held).some(x=>!['kind','source','location','terrain','establishedRound'].includes(x))||
   held.kind!==verified.kind||held.source!==verified.source||
   held.location!==s.world.location||held.terrain!==loc.biome||
   !Number.isInteger(held.establishedRound)||held.establishedRound<1||
   held.establishedRound>=fight.round)
  throw Error('Cover must be a previously occupied, source-established obstacle in the actual combat terrain');
 return held;
}
function sceneStatus(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Combat scene status is a read-only view; no caller-selected cover or enemy plans');
 const fight=s.battle,loc=E.LOCATIONS[s.world?.location];
 if(!fight)return {active:false,location:loc?.name||'Unknown'};
 const held=inspectCover(s,fight);
 return {active:true,round:fight.round,location:loc.name,terrain:fight.terrain,
   cover:held?.kind||null,coverBonus:held?2:0,
   availableCover:!held?COVER[loc.biome]?.kind||null:null,
   note:'Only player-known cover and terrain; enemy decisions and hidden statistics remain sealed'};
}

function begin(s,p={}){
 if(s.battle)throw Error('An encounter is already in progress');
 if(!s.encounter||s.encounter.beastId!==p.beastId)throw Error('Combat may only begin against the currently established encountered beast');
 if(s.player.partnerIds?.includes(p.beastId))throw Error('Partner is not a hostile random opponent');
 // A previously recorded collapse cannot be bypassed by opening a fresh fight.
 // Check before any player/combatant initialization or encounter mutation.
 const existingPlayer=s.table?.combatants?.player;
 if(existingPlayer&&existingPlayer.status!=='ok')
  throw Error('Player is not able to initiate combat; witnessed external rescue is required');
 H.ensurePlayer(s);
 if(!p.source||typeof p.source!=='string'||p.source.length<10)throw Error('Beast stat provenance/observation required');
 C.int(p.attack,'beast attack modifier',-20,50);C.int(p.damage,'beast damage',0,100);
 const linked=H.ensureBeast(s,p);
 const enemy=s.table.combatants[linked.id];enemy.attackModifier=p.attack;enemy.damage=p.damage;
 enemy.source=p.source.slice(0,180);
 s.battle={mode:'wounds-v1',enemyId:linked.id,beastId:p.beastId,round:1,terrain:E.LOCATIONS[s.world.location].biome,
   objective:'survive, negotiate, restrain or disengage',startedAt:E.clock(s)};
 s.encounter=null;
 C.event(s,'combat','A dangerous encounter becomes an active fight. Neither side has to fight to the death.',{beastId:p.beastId});
 return {started:true,enemy:Combat.observedCombatant(enemy),round:1};
}
function exchange(s,p={}){
 const fight=s.battle;if(!fight||fight.mode!=='wounds-v1')throw Error('No canonical wound-model combat scene is active');
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).some(k=>!
   ['intent','attackId','techniqueId','nonlethal','playerBrace','personalDesignId','weaponFocusId'].includes(k)))
  throw Error('Player attack bonuses, damage, Qi spending, enemy plans and encounter DCs cannot be caller-selected');
 if(!['attack','cast','ward','dual_cast','technique','defend','recover','withdraw','parley','yield_space','take_cover','aspect','revert'].includes(p.intent))throw Error('Player intent required: attack, cast, ward, dual_cast, technique, defend, recover, withdraw, parley, yield_space or take_cover');
 if(p.playerBrace!==undefined&&![true,false,'auto'].includes(p.playerBrace))
  throw Error('Player bracing must be a real reaction choice');
 if(p.nonlethal!==undefined&&typeof p.nonlethal!=='boolean')
  throw Error('Nonlethal player intent must be Boolean');
 if(p.intent!=='attack'&&(p.attackId!==undefined||p.nonlethal!==undefined||p.weaponFocusId!==undefined))
  throw Error('Weapon action and nonlethal strike, including prepared physical focus, apply only to an actual attack intent');
 if(!['cast','ward','technique'].includes(p.intent)&&p.techniqueId!==undefined)
  throw Error('Only a real attack spell, defensive Ward or Meridian technique may name a previously learned technique');
 if(p.personalDesignId!==undefined&&!['cast','technique','aspect'].includes(p.intent))
  throw Error('A personal combat expression must be used through its exact original learned strike action, not a free action or dual cast');
 if(p.intent==='aspect'&&p.personalDesignId===undefined)
  throw Error('A narrated release requires an actually developed individual aspect source');
 if(p.intent==='aspect'&&p.techniqueId!==undefined)
  throw Error('A personal physique release is not a second spell or learned attack');
 // Refuse an already recorded collapse before cover, equipment or spell preflight.
 // Those checks must not mutate an unusable in-memory encounter on rejection.
 const recordedPlayer=s.table?.combatants?.player;
 if(recordedPlayer&&recordedPlayer.status!=='ok')
  throw Error('Player is not able to act; intervention or rescue must be adjudicated');
 const held=inspectCover(s,fight);
 if(p.intent==='take_cover'&&(!COVER[fight.terrain]||held))
  throw Error(held?'The player is already occupying this real cover':'This established terrain offers no verified solid cover in the current encounter');
 // Verify equipment, recorded damage and learned mundane ability before
 // initialising combat or touching the game's random stream.
 const action=p.intent==='attack'?PlayerAttack.profile(s,p.attackId):null;
 const weaponFocus=p.weaponFocusId===undefined?null:
  WeaponIntent.preflight(s,p.weaponFocusId,p.attackId);
 // Validate actual learned spell and Mana BEFORE independent enemy decisions
 // and all dice. A First Circle alone does not grant spells.
 const dual=p.intent==='dual_cast'?DualArcane.verify(s):null;
 const spell=['cast','dual_cast'].includes(p.intent)?
  Spark.attackProfile(s,dual?'arcane_spark':p.techniqueId):null;
 const meridian=p.intent==='technique'?QiStrike.attackProfile(s,p.techniqueId):null;
 // Validate the original design, completed personal work, native learned
 // profile AND extra energy/stamina before enemy decisions or any dice.
 const variation=p.personalDesignId===undefined||p.intent==='aspect'?null:
  Creation.combatPersonal(s,p.personalDesignId,p.intent,spell||meridian);
 const activeSpell=variation&&p.intent==='cast'?variation.profile:spell;
 const activeMeridian=variation&&p.intent==='technique'?variation.profile:meridian;
 if(p.intent==='aspect')Aspect.preflight(s,p.personalDesignId,{combat:true});
 if(p.intent==='revert'&&!Aspect.present(s))
  throw Error('No original living aspect is available to voluntarily release');
 const wardProfile=['ward','dual_cast'].includes(p.intent)?
  ArcaneWard.profile(s,dual?'arcane_ward':p.techniqueId):null;
 if(dual&&C.int(s.player.mana,'real available Mana',0,100000)<
    spell.manaCost+wardProfile.manaCost)
  throw Error('Two genuine simultaneous spells require their combined real Mana cost');
 // An already active field cannot be silently stacked or replenished. Check
 // this before the opponent's independent plan or either casting die.
 if(['ward','dual_cast'].includes(p.intent)&&
    s.table?.combatants?.player?.ward?.steps>0)
  throw Error('An active Ward already protects this caster; neither stacking nor replenishment is supported');
 if(action&&p.nonlethal===true&&!action.canNonlethal)
  throw Error('This established weapon profile does not allow nonlethal strikes');
 const isNonlethal=action?(p.nonlethal??action.canNonlethal):false;
 // Check capacity and credible communication before choosing the enemy's independent plan.
 const own=H.ensurePlayer(s),player=Combat.get(s,'player'),enemy=Combat.get(s,fight.enemyId);
 if(player.status!=='ok')throw Error('Player is not able to act; intervention or rescue must be adjudicated');
 if(enemy.status!=='ok'){s.battle=null;return {ended:true,reason:'Opponent no longer able to fight'};}
 if(p.intent==='parley'&&fight.enemyBehavior?.canCommunicate!==true)
  throw Error('Spoken parley requires a previously established credible communication channel; a wild animal cannot understand speech by fiat');
 // The enemy chooses independently before any player combat dice.
 const decision=Agency.choose(s),enemyPlan=decision.plan;
 let ownResult=null,enemyResult=null;
 const atkOpts={attackerId:'player',targetId:fight.enemyId};
 // One actual minute of active-physique exertion costs physical Stamina.
 // This is charged before its defensive effect can protect against a real
 // opponent. If exhausted the aspect collapses, never bestows free armor.
 const aspectUpkeep=['aspect','revert'].includes(p.intent)?
   {spent:0,active:!!Aspect.present(s)}:Aspect.spendCombatUpkeep(s);
 // Moving to strike or withdraw means stepping out of previously occupied cover.
 if(['attack','cast','dual_cast','technique','withdraw'].includes(p.intent))fight.playerCover=null;
 if(p.intent==='aspect'){
  ownResult=Aspect.activate(s,p.personalDesignId,{combat:true});
  ownResult.action='personally developed physique release';
 }else if(p.intent==='revert'){
  ownResult=Aspect.revert(s,{combat:true});
  ownResult.action='voluntary aspect reversion';
 }else if(p.intent==='attack'){
  ownResult=Combat.attack(s,{...atkOpts,
   modifier:action.modifier+(weaponFocus?.bonus||0),damage:action.damage,
   offM:action.offM,brace:false,nonlethal:isNonlethal});
  if(weaponFocus){
   const earned=WeaponIntent.spend(s,weaponFocus,action.modifier,ownResult);
   ownResult.weaponIntent=earned;
   C.event(s,'combat',
    'The personally trained and equipped weapon form changes the existing single strike through real body effort.',{
     origin:WeaponIntent.SOURCE,formId:earned.formId,
     attackId:action.actionId,physicalModifier:earned.singlePhysicalAttackBonus,
     staminaSpent:earned.staminaSpent,noSecondAttackRoll:true,
     noExtraWeaponDamage:true});
  }
  ownResult.verifiedActionId=action.actionId;
  if(action.bodyRefinementM){
   ownResult.earnedBodyRefinementM=action.bodyRefinementM;
   C.event(s,'combat','The earned Muscle-Tendon refinement contributes its authentic natural force to this physical strike.',{
    origin:'source-earned-body-cycle-one-combat-force',
    cycle:'Muscle-Tendon Cycle',naturalOffenseMagnitude:action.bodyRefinementM,
    weaponActionId:action.actionId,noAdditionalDamageRoll:true});
  }
 }else if(p.intent==='cast'){
  if(variation){
   s.player.stamina-=variation.extraStamina;
   player.stamina-=variation.extraStamina;
  }
  ownResult=Combat.attack(s,{...atkOpts,modifier:activeSpell.modifier,
    damage:activeSpell.damage,offM:activeSpell.offM,brace:false,
    nonlethal:activeSpell.nonlethal,castingDC:activeSpell.castingDC,
    manaCost:activeSpell.manaCost});
  ownResult.verifiedTechniqueId=spell.techniqueId;
  ownResult.learnedTechniqueSource=spell.source;
  if(variation){
   ownResult.personalExpression={id:variation.id,name:variation.name,
    mode:variation.mode,sourceFacet:variation.sourceFacet,
    extraManaSpent:variation.extraEnergy,
    extraStaminaSpent:variation.extraStamina,noExtraAction:true};
   C.event(s,'combat','The original personally developed Arcane Spark variation is woven into the existing one-spell exchange.',{
    origin:'character-authored-creation-expression-v1',
    designId:variation.id,mode:variation.mode,
    sourceMilestone:variation.sourceMilestone,
    extraManaBudgeted:variation.extraEnergy,
    extraStaminaSpent:variation.extraStamina,noSecondRoll:true});
  }
 }else if(p.intent==='dual_cast'){
  ownResult=DualArcane.cast(s,player,atkOpts,wardProfile,spell,dual);
 }else if(p.intent==='ward'){
  ownResult=ArcaneWard.cast(s,player,wardProfile);
 }else if(p.intent==='technique'){
  // Honest source-attested Meridian reinforcement, with all Qi spent before
  // its one attack roll. Not a spell: no Arcane casting DC or Mana conversion.
  s.player.qi-=activeMeridian.qiCost;
  if(variation){
   s.player.stamina-=variation.extraStamina;
   player.stamina-=variation.extraStamina;
  }
  ownResult=Combat.attack(s,{...atkOpts,modifier:activeMeridian.modifier,
   damage:activeMeridian.damage,offM:activeMeridian.offM,brace:false,
   nonlethal:activeMeridian.nonlethal});
  ownResult.verifiedTechniqueId=meridian.techniqueId;
  ownResult.qiSpent=activeMeridian.qiCost;
  ownResult.learnedTechniqueSource=meridian.source;
  if(variation){
   ownResult.personalExpression={id:variation.id,name:variation.name,
    mode:variation.mode,sourceFacet:variation.sourceFacet,
    extraQiSpent:variation.extraEnergy,
    extraStaminaSpent:variation.extraStamina,noExtraAction:true};
   C.event(s,'combat','The practitioner applies the originally developed Qi Strike variation in the existing one-action exchange.',{
    origin:'character-authored-creation-expression-v1',
    designId:variation.id,mode:variation.mode,
    sourceMilestone:variation.sourceMilestone,
    extraQiSpent:variation.extraEnergy,
    extraStaminaSpent:variation.extraStamina,noSecondRoll:true});
  }
 }else if(p.intent==='take_cover'){
  const obstacle=COVER[fight.terrain];
  fight.playerCover={
   kind:obstacle.kind,source:obstacle.source,
   location:s.world.location,terrain:fight.terrain,establishedRound:fight.round
  };
  ownResult={takingCover:true,cover:obstacle.kind,coverBonus:2};
 }else if(p.intent==='defend'){
  ownResult={defending:true};
 }else if(p.intent==='recover'){
  // A real turn is spent regaining Stamina. The opponent's independent
  // response still resolves, and unearned Endurance never gives extra uses.
  ownResult={recovering:true,...Combat.recover(s,{id:'player',enduranceTrained:false})};
 }else if(p.intent==='yield_space'){
  // Releasing pressure does not confer speech, consent or control. An animal
  // independently committed to attack remains dangerous; one holding its
  // position may permit a nonthreatening separation.
  ownResult={givingSpace:true,nonverbal:true,disengaged:false,check:null};
  if(enemyPlan==='hold'){
   const wis=C.int(s.player.attributes?.wis,'actual Wisdom',1,30);
   const rank=C.int(s.player.skills?.beastcraft?.rank??0,'actual Beastcraft rank',0,5);
   const check=C.check(s,{modifier:Math.floor((wis-10)/2)+2*rank,
    dc:decision.withdrawalDC,label:'Yield space without provoking pursuit'});
   ownResult.check=check;ownResult.disengaged=check.success;
   if(check.success){
    s.battle=null;E.advance(s,2);H.sync(s,{source:'legacy'});
    C.event(s,'combat','The player gives ground without threatening the opponent; it holds position and lets the separation stand.',{
     origin:'witnessed-nonverbal-disengagement',beastId:fight.beastId,
     enemyCommittedPlan:enemyPlan,checkRoll:check.roll,noAnimalConsentAssumed:true});
    return {ended:true,reason:'Nonverbal separation',ownResult,
     enemyPlan,elapsedMinutes:2};
   }
  }
 }else if(p.intent==='withdraw'){
  const mod=Math.floor((s.player.attributes.dex-10)/2)+Math.min(5,s.player.skills.survival.rank)*2;
  const c=C.check(s,{modifier:mod,dc:decision.withdrawalDC,label:'Withdraw without pursuit'});
  ownResult={check:c,escaped:c.success};
  if(c.success){s.battle=null;E.advance(s,2);H.sync(s,{source:'legacy'});return {ended:true,reason:'Withdrawal succeeded',ownResult,elapsedMinutes:2};}
 }else{
  if(!decision.canCommunicate)throw Error('De-escalation requires a previously established credible communication channel; a wild animal cannot understand speech by fiat');
  const mod=Math.floor((s.player.attributes.cha-10)/2)+Math.min(5,s.player.skills.beastcraft.rank)*2;
  const c=C.check(s,{modifier:mod,dc:decision.parleyDC,label:'De-escalate a dangerous encounter'});
  ownResult={check:c,disengaged:c.success};
  if(c.success){s.battle=null;E.advance(s,2);H.sync(s,{source:'legacy'});return {ended:true,reason:'Mutual disengagement',ownResult,elapsedMinutes:2};}
 }
 if(enemyPlan==='retreat'){
  // Independent NPC/beast intent; no automatic surrender or death.
  s.battle=null;enemyResult={retreated:true};
 }else if(enemyPlan==='attack'&&enemy.status==='ok'&&player.status==='ok'){
  enemyResult=Combat.attack(s,{attackerId:fight.enemyId,targetId:'player',modifier:enemy.attackModifier,damage:enemy.damage,
    activeDefense:p.intent==='defend',coverBonus:fight.playerCover?2:0,
    brace:p.playerBrace??'auto',nonlethal:decision.nonlethal});
 }else enemyResult={heldPosition:true};
 E.advance(s,1);
 // A Ward with a sourced one-minute duration covers the current exchange's
 // independent enemy response, but cannot be stockpiled for later combats.
 if(p.intent==='ward')ownResult.expiry=ArcaneWard.expire(s,player,ownResult);
 if(p.intent==='dual_cast')ownResult.ward.expiry=ArcaneWard.expire(s,player,ownResult.ward);
 // The wound pool is authoritative; E.advance only changes stamina on day boundaries.
 H.sync(s,{source:'wounds'});
 const defeated=player.status!=='ok';
 if(defeated){
  // A collapsed character cannot choose another combat action. Keep the
  // injury and autonomous opponent consequence; never silently rescue or heal.
  s.table||={};s.table.combatDefeats||=[];
  // A cautious/defensive animal that explicitly uses a nonlethal attack
  // withdraws once the adversary is unable to continue. Territorial or
  // predatory animals are NOT presumed to leave. This is a bounded
  // source-profiled post-defeat behaviour, not a player-selected retreat.
  const behavior=fight.enemyBehavior;
  const foeWithdraws=decision.nonlethal===true &&
   ['cautious','defensive'].includes(behavior?.style) &&
   enemyPlan==='attack'&&enemy.status==='ok';
  const incident={beastId:fight.beastId,round:fight.round,
   worldMinute:s.world.minutes,status:player.status,
   location:s.world.location,
   dangerCleared:foeWithdraws,
   opponentAftermath:foeWithdraws?'departed after nonlethal incapacitation':'not independently established as departed',
   opponentStyle:behavior?.style||null,
   source:'Engine-witnessed wound-combat exchange and independently recorded nonlethal opponent behaviour'};
  C.event(s,'injury','The character is '+player.status+
   '; the fight ends. '+(foeWithdraws?
    'The independently cautious/defensive beast leaves the motionless opponent.':
    'The opponent is not known to have left.')+
   ' Outside rescue is still required; no treatment has occurred.',
   {...incident,origin:'engine-wound-defeat'});
  incident.eventIndex=s.log.length-1;
  incident.eventHash=require('node:crypto').createHash('sha256').
   update(JSON.stringify(s.log[incident.eventIndex])).digest('hex');
  s.table.combatDefeats.push(incident);
  s.battle=null;
 }else if(enemy.status!=='ok'||enemyPlan==='retreat')s.battle=null;
 else {Combat.newRound(s,{ids:['player',fight.enemyId]});fight.round++;}
 const r={ownResult,enemyResult,enemyPlan,aspectUpkeep,round:fight.round,elapsedMinutes:1,ended:!s.battle,
   defeated,rescueRequired:defeated,
   player:Combat.publicCombatant(player),opponent:Combat.observedCombatant(enemy)};
 C.event(s,'combat',`Exchange: ${p.intent} against ${enemyPlan}; ${r.ended?'the engagement ends':'the engagement continues'}.`,null);
 return r;
}
module.exports={begin,exchange,sceneStatus};