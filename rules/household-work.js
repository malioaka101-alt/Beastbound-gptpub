'use strict';
// Bounded, ordinary household jobs: no invented market, employer, contract,
// pay, material ownership, career rank, or automatic success. The present
// family member independently decides and pays from their own existing funds.
const Crypto=require('node:crypto'),E=require('../engine');
const Core=require('./core'),World=require('./world'),U=require('./unified');
const Practice=require('./earned-practice'),Realm=require('../world/simulation');
const Kin=require('../world/origin-relatives'),Places=require('../world/lived-places');
const Difficulty=require('./dynamic-difficulty');
const GM=require('./gm-contextual-dc');
const ORIGIN='witnessed-voluntary-household-work-v1',DAY=1440;
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function draw(p){
 let x=p.rngState>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;
 p.rngState=(x>>>0)||0x6fb78a3d;
 return p.rngState/4294967296;
}
function context(s,npcId){
 const place=Places.location(s,s.world?.location);
 if(!place||place.sceneType!=='settlement'||
    !/cottage|homestead|household|family home/i.test(place.kind||''))
  throw Error('Ordinary household work requires an actually established family home');
 const realm=Realm.ensure(s),kin=realm.originKin,
  person=kin?.people?.[npcId?.slice('origin-kin:'.length)];
 if(typeof npcId!=='string'||!npcId.startsWith('origin-kin:')||
   !person||!Kin.verify(realm,person)||person.actorId!==npcId||
   person.status!=='active'||person.name===s.player?.name||
   place.regionId!==kin.homeRegionId)
  throw Error('A real local family member with genuine independent funds is required');
 // Ordinary kinship does NOT prove someone's current presence or agreement.
 const pickup=s.chatRuntime?.scene||'';
 if(!pickup.toLowerCase().includes(person.name.toLowerCase()))
  throw Error('The family member must first be actually witnessed at this household scene');
 return {person,place};
}
function perform(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>!['npcId','purpose','approach','gmContext'].includes(k))||
    typeof p.npcId!=='string'||
    typeof p.purpose!=='string'||p.purpose.trim().length<15||
    p.purpose.length>220)
  throw Error('Name a witnessed family member and a real practical household task, not pay or outcome');
 const {person,place}=context(s,p.npcId),task=p.purpose.trim(),
   approach=p.approach===undefined?'standard':p.approach;
 if(typeof approach!=='string'||!Difficulty.WORK_APPROACHES[approach])
  throw Error('Household work approach must be standard, careful or rushed');
 if(/\b(?:steal|fight|attack|poison|hunt|capture|tame|bond|evolve|awaken|spell|dangerous|illegal)\b/i.test(task))
  throw Error('Dangerous or specialist work requires its actual owner and cannot be priced as a routine household chore');
 if(s.battle||s.encounter||s.table?.combatants?.player?.status!=='ok'&&
   s.table?.combatants?.player?.status!==undefined)
  throw Error('Immediate danger or incapacity prevents ordinary household work');
 const now=s.world.minutes,day=Math.floor(now/DAY),clock=now%DAY;
 if(clock<7*60||clock>16*60)
  throw Error('The family member must be available during an actual ordinary work period');
 const difficulty=GM.adjust(s,Difficulty.householdWork(s,{person,approach}),
  p.gmContext,{owner:'social.householdWork',min:8,max:18});
 s.table||={};s.table.householdWork||={version:1,records:[]};
 const ledger=s.table.householdWork;
 if(ledger.version!==1||!Array.isArray(ledger.records)||
    ledger.records.some(x=>!x||x.origin!==ORIGIN||x.hash!==hash(x.proof)))
  throw Error('Invalid original household-work receipts');
 if(ledger.records.some(x=>x.proof.actorId===person.actorId&&x.proof.day===day))
  throw Error('This family member has already considered one household job this day');
 if(s.player.stamina<3||s.table.combatants?.player?.stamina<3)
  throw Error('Routine physical work requires genuine available Stamina');
 const fundsBefore=Core.int(person.funds,'original family funds',0,100),
   playerBefore=Core.int(s.player.coins,'original player Talons',0,100000000),
   staminaBefore=s.player.stamina,originalRng=person.rngState;
 const proposedPay=fundsBefore>=4?2:fundsBefore>=2?1:0;
 // The employer's own original RNG and actual fatigue decide acceptance.
 const accepted=proposedPay>0&&person.fatigue<=75&&
   draw(person)<(person.temperament==='reserved'?.68:.86);
 let check=null,practice=null,spent=0,paid=0,minutes=5;
 if(accepted){
  minutes=difficulty.minutes;spent=difficulty.staminaCost;
  const skill=s.player.skills?.crafting;
  const attribute=Core.int(s.player.attributes.dex,'actual Dexterity',1,30);
  const modifier=Math.floor((attribute-10)/2)+
   2*Core.int(skill?.rank??0,'real Crafting rank',0,5);
  // Only simple ordinary chores: no client-selected DC or effect.
  s.player.stamina-=spent;
  if(s.table.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
  check=Core.check(s,{modifier,dc:difficulty.dc,
   label:'Ordinary household work — '+task.slice(0,45),risky:false});
  paid=check.success?proposedPay:0;
  if(paid){
   if(!Core.conservedTransfer({sourceBefore:fundsBefore,sourceAfter:fundsBefore-paid,
    targetBefore:playerBefore,targetAfter:playerBefore+paid,amount:paid,
    maxBalance:100000000}))
    throw Error('Family wages must conserve real employer and player funds');
   person.funds-=paid;s.player.coins+=paid;
  }
  if(skill)practice=Practice.award(s,{skill:'crafting',check,risky:true});
  person.fatigue=Math.min(100,person.fatigue+spent);
 }
 // Seal the original transfer before unrelated future world ticks change
 // the employer's finances; later independent earnings are separate events.
 const immediateEmployerFunds=person.funds,immediatePlayerTalons=s.player.coins;
 E.advance(s,minutes);World.finalizeTime(s,now);U.sync(s,{source:'legacy'});
 const proof={origin:ORIGIN,actorId:person.actorId,name:person.name,
  actorSourceHash:person.sourceHash,location:s.world.location,
  day,startMinute:now,endMinute:s.world.minutes,
  task,approach,accepted,
  ...(accepted?{difficulty}:{}),independentRngBefore:originalRng,
  independentRngAfter:person.rngState,
  employerFundsBefore:fundsBefore,employerFundsAfter:immediateEmployerFunds,
  playerTalonsBefore:playerBefore,playerTalonsAfter:immediatePlayerTalons,
  proposedPayTalons:proposedPay,paidTalons:paid,
  staminaBefore,staminaAfter:s.player.stamina,
  ...(check?{originalCheck:check}:{}),
  noGuaranteedContract:true,noForcedConsent:true};
 const receipt={origin:ORIGIN,proof,hash:hash(proof)};
 ledger.records.push(receipt);
 Core.event(s,'story',accepted?
  (check.success?person.name+' inspects and pays for the completed household work.':
   person.name+' inspects the attempted household work; no wages are awarded for unfinished work.'):
  person.name+' independently declines the household work request.',{
   origin:ORIGIN,receiptHash:receipt.hash,actorId:person.actorId,
   minutes,accepted,paidTalons:paid,sourceFundsChanged:paid>0});
 return {task,approach,employer:person.name,accepted,
  ...(accepted?{difficulty}:{}),
  ...(check?{check}:{}),
  ...(practice?{practice}:{}),
  minutes,staminaSpent:spent,
  promisedTalons:accepted?proposedPay:0,paidTalons:paid,
  employerFundsRemaining:person.funds,playerTalons:s.player.coins,
  noAutomaticAgreement:true,noUnverifiedMoney:true};
}
// Optional GM-facing preview: purely read-only, no acceptance, die or wages.
function difficultyPreview(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>!['npcId','purpose','approach'].includes(k))||
    typeof p.npcId!=='string'||
    typeof p.purpose!=='string'||p.purpose.trim().length<15||
    p.purpose.length>220)
  throw Error('Work difficulty preview must name the real relative, practical task and optional actual approach');
 const {person,place}=context(s,p.npcId);
 const approach=p.approach===undefined?'standard':p.approach;
 if(!Difficulty.WORK_APPROACHES[approach])
  throw Error('Unsupported household approach');
 const difficulty=Difficulty.householdWork(s,{person,approach});
 const modifier=Math.floor((Core.int(s.player.attributes.dex,'Dexterity',1,30)-10)/2)+
   2*Core.int(s.player.skills?.crafting?.rank??0,'Crafting rank',0,5);
 const today=Math.floor(s.world.minutes/DAY);
 return {owner:'social.householdWork',task:p.purpose.trim(),approach,
  place:place.name,baseDC:difficulty.baseDC,computedDC:difficulty.dc,
  factors:difficulty.factors,minutes:difficulty.minutes,
  staminaCost:difficulty.staminaCost,modifier,
  alreadyConsideredToday:(s.table?.householdWork?.records||[])
   .some(x=>x?.proof?.actorId===person.actorId&&x.proof.day===today),
  currentScene:s.chatRuntime?.scene||null,
  noDieRolled:true,noConsentAssumed:true,noWagesPromised:true,
  gmNext:'Cite an existing scene/place/weather quote and contextual reason if a real adjustment is warranted; the original rule still rolls independently'};
}
// A guardian's modest *originally promised allowance* is not an employer's
// contract or an excuse to roll the same failed shift again. A failure at
// first inspection can be corrected by genuinely witnessed follow-through.
// Only the guardian can settle their original accepted offer, using real
// funds, after the GM has actually witnessed enough correction in the scene.
const ALLOWANCE_ORIGIN='guardian-household-followthrough-allowance-v1';
function settleGuardianAllowance(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).sort().join('|')!=='npcId|sourceQuote'||
    typeof p.npcId!=='string'||typeof p.sourceQuote!=='string'||
    p.sourceQuote.trim().length<24||p.sourceQuote.length>180)
  throw Error('Guardian allowance needs the original present guardian and a genuine saved-scene correction quote, not an amount, reward or result');
 if(s.battle||s.encounter)
  throw Error('Cannot settle an ordinary family allowance during combat or an active encounter');
 const {person}=context(s,p.npcId);
 if(!/\b(?:parent|guardian|mother|father)\b/i.test(person.relation||''))
  throw Error('An agreed family allowance follow-through must be settled by an actual guardian');
 const scene=s.chatRuntime?.scene||'',quote=p.sourceQuote.trim();
 if(!scene.toLowerCase().includes(quote.toLowerCase()))
  throw Error('A real GM-witnessed correction must already be in the saved scene');
 const ledger=s.table?.householdWork;
 if(!ledger||ledger.version!==1||!Array.isArray(ledger.records)||
    ledger.records.some(x=>!x||x.origin!==ORIGIN||x.hash!==hash(x.proof)))
  throw Error('The original household work and its receipt must be verified');
 const today=Math.floor(s.world.minutes/DAY);
 const eligible=ledger.records.filter(x=>{
  const w=x.proof;
  return w.actorId===person.actorId&&w.day===today&&
   w.accepted===true&&w.paidTalons===0&&
   w.originalCheck?.success===false&&
   Number.isInteger(w.proposedPayTalons)&&w.proposedPayTalons>=1&&
   w.proposedPayTalons<=2&&w.location===s.world.location&&
   w.endMinute<=s.world.minutes&&
   s.world.minutes-w.endMinute<=DAY;
 });
 if(eligible.length!==1)
  throw Error('No single previously accepted, unfinished guardian allowance from this day is pending');
 const prior=eligible[0],work=prior.proof;
 // This is the supporting post-inspection *correction*, not a second shift
 // or skill check. The GM-authored current scene names the actual task
 // object and a physical recheck; an unrelated day of Soul practice alone
 // cannot create a household payment.
 const task=work.task.toLowerCase();
 const nouns=['harness','strap','buckle','stitch','leather','orchard','garden','clean','repair'];
 const witnessNouns=nouns.filter(n=>task.includes(n)&&quote.toLowerCase().includes(n));
 if(!witnessNouns.length||!/\b(?:re.examined|re.checked|reworked|corrected|sorted|repaired|checked|finished|redone)\b/i.test(quote))
  throw Error('The original unfinished family task needs a personally witnessed corrective recheck in this scene');
 const works=(s.table?.independentTraining||[]).filter(t=>
  t&&t.location===work.location&&Number.isInteger(t.startMinute)&&
  Number.isInteger(t.minutes)&&t.minutes>=90&&
  t.startMinute>=work.endMinute&&t.startMinute+t.minutes<=s.world.minutes&&
  Number.isInteger(t.eventIndex)&&t.eventIndex>=0&&
  typeof t.eventHash==='string'&&
  hash(s.log?.[t.eventIndex])===t.eventHash&&
  s.log[t.eventIndex]?.details?.partTime===true);
 if(works.length!==1)
  throw Error('A genuinely elapsed corrective period alongside separately verified part-time practice is required for this original follow-through');
 const priorSettlements=ledger.allowanceSettlements||[];
 if(!Array.isArray(priorSettlements)||priorSettlements.some(x=>
    !x||x.origin!==ALLOWANCE_ORIGIN||x.hash!==hash(x.proof)))
  throw Error('Original guardian allowance settlement ledger was altered');
 if(priorSettlements.some(x=>x.proof.originalReceiptHash===prior.hash))
  throw Error('This guardian has already settled the original family allowance');
 const amount=work.proposedPayTalons;
 const sourceBefore=Core.int(person.funds,'guardian actual finite Talons',0,100);
 const playerBefore=Core.int(s.player.coins,'player actual finite Talons',0,100000000);
 if(sourceBefore<amount)
  throw Error('The guardian no longer has the actual Talons for the promised family allowance');
 if(!Core.conservedTransfer({sourceBefore,sourceAfter:sourceBefore-amount,
   targetBefore:playerBefore,targetAfter:playerBefore+amount,
   amount,maxBalance:100000000}))
  throw Error('A guardian allowance must conserve the same actual family funds');
 // This is the GM's now-witnessed guardian approval of the original offered
 // pocket money for finishing the corrected family task. It is NOT a
 // reroll, skill reward, automatic pay from a company, or a new contract.
 person.funds-=amount;s.player.coins+=amount;
 const receiptProof={origin:ALLOWANCE_ORIGIN,actorId:person.actorId,
  actorName:person.name,actorSourceHash:person.sourceHash,
  originalReceiptHash:prior.hash,originalCheck:work.originalCheck,
  originalOfferTalons:amount,originalOutcomePreserved:true,
  timeAtFinalReview:s.world.minutes,placeId:s.world.location,
  sceneHash:hash(scene),correctiveQuote:quote,
  correctionRecordHash:works[0].eventHash,
  guardianFundsBefore:sourceBefore,guardianFundsAfter:person.funds,
  childTalonsBefore:playerBefore,childTalonsAfter:s.player.coins,
  paidTalons:amount,allowanceNotWages:true,noExtraCheck:true,
  noSkillOrSoulProgress:true,noForcedNewContract:true};
 const receipt={origin:ALLOWANCE_ORIGIN,proof:receiptProof,hash:hash(receiptProof)};
 ledger.allowanceSettlements=priorSettlements;
 ledger.allowanceSettlements.push(receipt);
 U.sync(s,{source:'legacy'});
 Core.event(s,'story',person.name+' acknowledges the finished correction and gives the originally offered family allowance.',{
  origin:ALLOWANCE_ORIGIN,actorId:person.actorId,
  originalReceiptHash:prior.hash,settlementHash:receipt.hash,
  amount,guardianFundsConserved:true,noSecondRoll:true,noExtraWork:true});
 return {settled:true,guardian:person.name,amountTalons:amount,
   originalOfferTalons:amount,guardianFundsRemaining:person.funds,
   playerTalons:s.player.coins,originalCheck:work.originalCheck,
   originalCheckNotRerolled:true,correctiveMinutes:works[0].minutes,
   elapsedMinutes:0,noExtraPractice:true,noNewJob:true,
   note:'A guardian gives the previously promised modest allowance after reviewing the genuine corrected household help; not commercial wage payment or a new Crafting result'};
}
function status(s){
 const rows=s.table?.householdWork?.records||[];
 return {personallyWitnessedJobs:rows.slice(-24).map(x=>({
  name:x.proof.name,task:x.proof.task,accepted:x.proof.accepted,
  approach:x.proof.approach||'standard',
  ...(x.proof.difficulty?{difficulty:x.proof.difficulty}:{}),
  workedMinutes:x.proof.endMinute-x.proof.startMinute,
  paidTalons:x.proof.paidTalons,
  atMinute:x.proof.endMinute
 })),note:'Only independently agreed and actually resolved household tasks appear here.'};
}
module.exports={perform,status,difficultyPreview,settleGuardianAllowance,ORIGIN,ALLOWANCE_ORIGIN};
