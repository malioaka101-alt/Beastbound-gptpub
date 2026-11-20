'use strict';
// Existing ORIGINAL Meridian anatomy is physical, not a dossier-only label.
// Apply ONLY source-verified cumulative human Combat bonuses, to the SAME
// original independently witnessed combatant. No new rank law, free training,
// free recovery, alternate health pool, equipment claim, or NPC technique.
const B=require('./build'),Gate=require('./meridian-shared-original-gates'),
 Disc=require('./disciplines');
const Crypto=require('node:crypto');
const H=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const ORIGIN='source-earned-original-meridian-human-combat-parity-v1';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function sourceProfile(s,p){
 const info=Disc.npcMeridianPrivateStatus(s,p.actorId),
  stage=info.originalMeridianStageEarned;
 if(!Number.isInteger(stage)||stage<1||stage>9)return null;
 // The private Meridian status owns authentic Foundation proof, but the
 // higher-stage status is a READ view. Revalidate the actual stage owner's
 // complete chronological receipts before projecting physical effects
 // into Combat or into a second discipline's weapon action.
 const owner=stage===1?null:stage===2?
  '../world/independent-meridian-ladder':stage===3?
  '../world/independent-meridian-gates':stage===4?
  '../world/independent-meridian-sea':stage===5?
  '../world/independent-meridian-web':
  '../world/independent-meridian-advanced';
 if(owner&&!require(owner).verify(s,p))
  throw Error('Original individual Meridian stage source failed full owner replay');
 const gates=info.originalStageThreeIndividualGates||[],
  routes=info.originalStageFiveWebRoutes||[],
  extraordinary=new Set(routes.flatMap(x=>x.segments||[])
   .filter(x=>x.kind==='extraordinary').map(x=>x.number)).size;
 const profile=stage<3?B.meridianProfile(stage,{meridians:12}):
  Gate.profile(stage,gates,{seaRings:stage>=4?1:0,
   extraordinary,webComplete:stage>=5,intentDepth:stage>=6?1:0});
 const physical=profile.bonuses;
 const proof=stage===1?
  p.meridianTraining.sessions.findLast(x=>
   x.source?.outcome==='breakthrough'&&x.source?.earnedStageAfter===1)?.seal:
  stage===2?p.originalMeridianLadder.originalStageTwoSourceHash:
  stage===3?gates.at(-1)?.sourceHash:
  stage===4?p.originalMeridianSea.attempts.at(-1)?.seal:
  stage===5?p.originalMeridianWeb.originalStageFiveSourceHash:
  p.originalMeridianAdvanced.achieved[stage]?.originalSourceHash;
 if(typeof proof!=='string'||!/^[a-f0-9]{64}$/.test(proof))
  throw Error('Original individual Meridian physical bonus lacks earned source');
 return {stage,openedGates:gates.length,proof,physical};
}
function originalHuman(p){
 const a=p.mechanicalFoundation?.baselineAttributes;
 if(!a)throw Error('Original source-derived human anatomy required');
 const x=k=>Math.floor((a[k]-10)/2);
 return B.humanStats({vigor:x('con'),agility:x('dex'),
  wits:x('wis'),will:x('wis'),might:x('str')},{
   skills:{Melee:0},size:'Medium'});
}
function expected(base,bonuses){
 return {toughness:base.toughness+(bonuses.toughness||0),
  boxes:[base.boxes[0]+(bonuses.light||0),
   base.boxes[1]+(bonuses.serious||0),
   base.boxes[2]+(bonuses.critical||0)],
  maxStamina:base.stamina+(bonuses.stamina||0),
  wpr:bonuses.wpr||0};
}
function synchronize(s,p){
 if(!p?.actorId||!p.actorId.startsWith('emergent:'))
  throw Error('Independent source-owned original human required');
 const body=s.table?.combatants?.['npc_'+p.id],
  source=body?.npcOrigin;
 if(!source||source.actorId!==p.actorId||
  source.foundationSeal!==p.mechanicalFoundation?.seal||
  source.originalUnarmouredHumanBaseline!==true)
  throw Error('Actual original witnessed human Combat body is required');
 const earned=sourceProfile(s,p);
 if(!earned)return {applied:false,noUnverifiedPower:true};
 const base=originalHuman(p),prior=body.originalMeridianPhysical,
  bodyMilestone=p.originalFirstPowerMilestones?.body;
 // Body Cycle I is a DIFFERENT, originally earned human tissue law.
 // It adds +2 to this SAME Combat body. Preserve it instead of having a
 // Meridian projection silently overwrite or reject the other discipline.
 const bodyBonus=bodyMilestone?(()=>{
  if(!require('./independent-original-discipline-preparation').verify(s,p)||
   bodyMilestone.kind!=='body-muscle-tendon-cycle-one'||
   bodyMilestone.maxStaminaAfter!==bodyMilestone.maxStaminaBefore+2)
   throw Error('Body Cycle I Stamina requires independently replayed original source');
  return 2;
 })():0;
 const previousBonus=prior?.bonuses||
  (p.meridianTraining?.earnedStage===1&&
   body.maxStamina===base.stamina+bodyBonus+
    B.meridianProfile(1).bonuses.stamina?
   B.meridianProfile(1).bonuses:{});
 const before=expected(base,previousBonus),
  after=expected(base,earned.physical);
 before.maxStamina+=bodyBonus;after.maxStamina+=bodyBonus;
 if(prior){
  const {seal,...sourceData}=prior;
  if(prior.origin!==ORIGIN||prior.actorId!==p.actorId||
   prior.originalCombatEntrySeal!==body.npcOrigin.seal||
   seal!==H(sourceData))
   throw Error('Original Meridian Combat bonus record was altered');
 }
 if(body.toughness!==before.toughness||
  !same(body.boxes,before.boxes)||
  body.maxStamina!==before.maxStamina||
  body.wpr!==before.wpr)
  throw Error('NPC Combat ancestry differs from original source bonus; no overwrite or free stat rewrite');
 if(body.wounds.some((v,i)=>v>after.boxes[i]))
  throw Error('A genuine existing Combat injury cannot be erased by changed anatomy');
 const staminaDelta=after.maxStamina-before.maxStamina;
 if(staminaDelta<0)
  throw Error('Original earned human Meridian stamina cannot regress without source');
 body.maxStamina=after.maxStamina;
 body.stamina=Math.min(after.maxStamina,body.stamina+staminaDelta);
 body.toughness=after.toughness;
 body.boxes=[...after.boxes];
 body.wpr=after.wpr;
 const proof={origin:ORIGIN,actorId:p.actorId,
  originalCombatEntrySeal:body.npcOrigin.seal,
  originalStage:earned.stage,
  originalOpenedGates:earned.openedGates,
  originalMilestoneHash:earned.proof,
  bonuses:structuredClone(earned.physical),
  absolute:after,
  noAutomaticAbilityTechniqueHealingOrSecondPool:true};
 body.originalMeridianPhysical={...proof,seal:H(proof)};
 return {applied:!same(before,after),originalStage:earned.stage,
  sourceHash:earned.proof,actualOriginalCombatBonuses:after,
  noTechniqueOrFreeHeal:true};
}
module.exports={ORIGIN,sourceProfile,synchronize};
