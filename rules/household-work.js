'use strict';
// Bounded, ordinary household jobs: no invented market, employer, contract,
// pay, material ownership, career rank, or automatic success. The present
// family member independently decides and pays from their own existing funds.
const Crypto=require('node:crypto'),E=require('../engine');
const Core=require('./core'),World=require('./world'),U=require('./unified');
const Practice=require('./earned-practice'),Realm=require('../world/simulation');
const Kin=require('../world/origin-relatives'),Places=require('../world/lived-places');
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
    Object.keys(p).sort().join('|')!=='npcId|purpose'||
    typeof p.purpose!=='string'||p.purpose.trim().length<15||
    p.purpose.length>220)
  throw Error('Name a witnessed family member and a real practical household task, not pay or outcome');
 const {person,place}=context(s,p.npcId),task=p.purpose.trim();
 if(/\b(?:steal|fight|attack|poison|hunt|capture|tame|bond|evolve|awaken|spell|dangerous|illegal)\b/i.test(task))
  throw Error('Dangerous or specialist work requires its actual owner and cannot be priced as a routine household chore');
 if(s.battle||s.encounter||s.table?.combatants?.player?.status!=='ok'&&
   s.table?.combatants?.player?.status!==undefined)
  throw Error('Immediate danger or incapacity prevents ordinary household work');
 const now=s.world.minutes,day=Math.floor(now/DAY),clock=now%DAY;
 if(clock<7*60||clock>16*60)
  throw Error('The family member must be available during an actual ordinary work period');
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
  minutes=120;spent=2;
  const skill=s.player.skills?.crafting;
  const attribute=Core.int(s.player.attributes.dex,'actual Dexterity',1,30);
  const modifier=Math.floor((attribute-10)/2)+
   2*Core.int(skill?.rank??0,'real Crafting rank',0,5);
  // Only simple ordinary chores: no client-selected DC or effect.
  s.player.stamina-=spent;
  if(s.table.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
  check=Core.check(s,{modifier,dc:12,label:'Ordinary household work — '+task.slice(0,45),risky:false});
  paid=check.success?proposedPay:0;
  if(paid){
   if(!Core.conservedTransfer({sourceBefore:fundsBefore,sourceAfter:fundsBefore-paid,
    targetBefore:playerBefore,targetAfter:playerBefore+paid,amount:paid,
    maxBalance:100000000}))
    throw Error('Family wages must conserve real employer and player funds');
   person.funds-=paid;s.player.coins+=paid;
  }
  if(skill)practice=Practice.award(s,{skill:'crafting',check,risky:true});
  person.fatigue=Math.min(100,person.fatigue+2);
 }
 // Seal the original transfer before unrelated future world ticks change
 // the employer's finances; later independent earnings are separate events.
 const immediateEmployerFunds=person.funds,immediatePlayerTalons=s.player.coins;
 E.advance(s,minutes);World.finalizeTime(s,now);U.sync(s,{source:'legacy'});
 const proof={origin:ORIGIN,actorId:person.actorId,name:person.name,
  actorSourceHash:person.sourceHash,location:s.world.location,
  day,startMinute:now,endMinute:s.world.minutes,
  task,accepted,independentRngBefore:originalRng,
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
 return {task,employer:person.name,accepted,
  ...(check?{check}:{}),
  ...(practice?{practice}:{}),
  minutes,staminaSpent:spent,
  promisedTalons:accepted?proposedPay:0,paidTalons:paid,
  employerFundsRemaining:person.funds,playerTalons:s.player.coins,
  noAutomaticAgreement:true,noUnverifiedMoney:true};
}
function status(s){
 const rows=s.table?.householdWork?.records||[];
 return {personallyWitnessedJobs:rows.slice(-24).map(x=>({
  name:x.proof.name,task:x.proof.task,accepted:x.proof.accepted,
  workedMinutes:x.proof.endMinute-x.proof.startMinute,
  paidTalons:x.proof.paidTalons,
  atMinute:x.proof.endMinute
 })),note:'Only independently agreed and actually resolved household tasks appear here.'};
}
module.exports={perform,status,ORIGIN};
