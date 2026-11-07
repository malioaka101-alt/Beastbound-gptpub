'use strict';
// Source-grounded animal ecological learning. Behaviour, physiology and real
// outcomes matter; elapsed time alone grants NOTHING. It does not promote
// species/individual Grades, open magic powers, infer personhood or contracts.
// S3+ beast citizens require separate consenting, autonomous person systems.
const Crypto=require('node:crypto');
const E=require('../engine.js'),Atlas=require('./atlas');
// WildLives also calls us: resolve that module lazily to avoid stale circular exports.
const wild=()=>require('./wild-lives');
const ORIGIN='actual-wildlife-ecological-learning-v1',VERSION=1;
const BANDS=[0,14,42,90,160];
const TYPE=Object.freeze({
 forage:{skill:'foraging',actions:['forage','independently-foraged']},
 navigate:{skill:'navigation',actions:[
  'relocated-to-adjacent-compatible-habitat','roamed-through-existing-habitat-link']}
});
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const clamp=(x,lo,hi)=>Math.min(hi,Math.max(lo,x));
function sapient(b){
 return Number.isInteger(b?.sapience)&&b.sapience>=3||
   E.SPECIES[b?.species]?.intelligence==='sapient';
}
function innate(b){
 const p=b?.potential;
 if(!p||!['growth','adaptability','intelligence'].every(k=>
  Number.isFinite(p[k])&&p[k]>=0&&p[k]<=100))
  throw Error('Individual animal potential and biology must be established');
 // A genuinely inherited Origin Pattern can affect this real individual's
 // physical opportunities; never infer a family from surname or species.
 const senses=b.originPattern?.origin==='source-bound-Origin-inheritance-v1'&&
  b.wildBirth?.birthHash===b.originPattern.birthSourceHash?
  b.originPattern.physical?.senses:null;
 const physical=Number.isFinite(senses)?senses:p.adaptability;
 return {foraging:clamp(Math.round((p.growth+p.adaptability+physical)/3),0,100),
  navigation:clamp(Math.round((p.intelligence+p.adaptability+physical)/3),0,100)};
}
function tier(score){
 if(!Number.isInteger(score)||score<0||score>500)
  throw Error('Animal ecological practice evidence cannot be negative or unbounded');
 let n=0;for(let i=1;i<BANDS.length;i++)if(score>=BANDS[i])n=i;
 return n;
}
function initial(b){
 const life=b.individualLife,origin={origin:ORIGIN,beastId:b.id,
  species:b.species,individualLifeSourceHash:life.sourceHash};
 return {version:VERSION,origin:ORIGIN,source:origin,sourceHash:digest(origin),
  aptitude:innate(b),skills:{foraging:0,navigation:0},
  successfulMethods:{foraging:0,navigation:0},
  attempts:0,receipts:[],anchorAttempts:0,
  anchorScores:{foraging:0,navigation:0},
  anchorSuccessful:{foraging:0,navigation:0},
  anchorHash:digest(origin),headHash:digest(origin)};
}
function verify(b){
 const l=b?.individualLife,rec=l?.ecologicalLearning;
 if(rec===undefined)return true;
 // A previously earned memory remains genuine if the individual later
 // becomes a partner or a person. Only NEW wild-animal learning is forbidden.
 if(!l||
  rec.version!==VERSION||rec.origin!==ORIGIN||
  rec.sourceHash!==digest(rec.source)||
  rec.source?.origin!==ORIGIN||rec.source?.beastId!==b.id||
  rec.source?.species!==b.species||
  rec.source?.individualLifeSourceHash!==l.sourceHash||
  !Number.isInteger(rec.attempts)||rec.attempts<0||
  !Number.isInteger(rec.anchorAttempts)||rec.anchorAttempts<0||
  !Array.isArray(rec.receipts)||rec.receipts.length>24||
  rec.attempts!==rec.anchorAttempts+rec.receipts.length||
  typeof rec.anchorHash!=='string'||!/^([0-9a-f]{64})$/.test(rec.anchorHash)||
  typeof rec.headHash!=='string'||!/^([0-9a-f]{64})$/.test(rec.headHash))
  return false;
 const born=innate(b),scores={},successes={};
 for(const k of ['foraging','navigation']){
  if(rec.aptitude?.[k]!==born[k]||
    !Number.isInteger(rec.anchorScores?.[k])||
    rec.anchorScores[k]<0||rec.anchorScores[k]>500||
    !Number.isInteger(rec.anchorSuccessful?.[k])||
    rec.anchorSuccessful[k]<0||rec.anchorSuccessful[k]>rec.anchorAttempts)
   return false;
  scores[k]=rec.anchorScores[k];successes[k]=rec.anchorSuccessful[k];
 }
 let previous=rec.anchorHash;
 for(const entry of rec.receipts){
  const e=entry?.source,skill=e?.skill;
  if(!e||e.previous!==previous||e.origin!==ORIGIN||
   e.beastId!==b.id||e.species!==b.species||
   e.individualLifeSourceHash!==l.sourceHash||
   entry.hash!==digest(e)||
   !['foraging','navigation'].includes(skill)||
   !(skill==='foraging'?TYPE.forage.actions:TYPE.navigate.actions).includes(e.action)||
   typeof e.actionWitnessHash!=='string'||
   !/^([0-9a-f]{64})$/.test(e.actionWitnessHash)||
   !Number.isInteger(e.roll)||e.roll<1||e.roll>20||
   !Number.isInteger(e.day)||e.day<0||
   !Number.isFinite(e.habitat?.forage)||e.habitat.forage<0||
   e.habitat.forage>100||
   !Number.isFinite(e.habitat.pressure)||e.habitat.pressure<0||
   e.habitat.pressure>100)return false;
  const grade=tier(scores[skill]),apt=born[skill],
   dc=skill==='foraging'?12+(e.habitat.forage<46?4:0)+grade*2:
    13+(e.habitat.pressure>65?3:0)+grade*2,
   modifier=Math.floor((apt-50)/13)+grade,
   total=e.roll+modifier+(e.roll===20?5:e.roll===1?-5:0),
   margin=total-dc,passed=margin>=0,
   earned=passed?(margin>=10?7:margin>=5?4:2)*
    (apt>=88?3:apt>=73?2:1):0;
  if(e.difficulty!==dc||e.modifier!==modifier||e.total!==total||
   e.margin!==margin||e.success!==passed||e.earned!==earned)
   return false;
  if(passed){scores[skill]=Math.min(500,scores[skill]+earned);successes[skill]++;}
  previous=entry.hash;
 }
 return previous===rec.headHash&&
  ['foraging','navigation'].every(k=>
   scores[k]===rec.skills[k]&&successes[k]===rec.successfulMethods[k]);
}
function ensure(s,b){
 if(!b||sapient(b)||b.owner||s.player.partnerIds?.includes(b.id)||
  b.relationship!=='wild'||!b.individualLife||
  !E.SPECIES[b.species])
  throw Error('Ecological animal learning requires a genuine independent non-sapient wild individual');
 wild()._debug.ensure(s,b,null);
 if(b.individualLife.ecologicalLearning===undefined)
  b.individualLife.ecologicalLearning=initial(b);
 if(!verify(b))throw Error('Unverified wild individual learned expertise');
 return b.individualLife.ecologicalLearning;
}
function bonus(s,b){
 // Compatible biological skill affects one narrow ecological action only:
 // how effectively a genuinely successful forage satisfies hunger. No
 // attack, Grade, level, magical evolution, secret rank or automatic food.
 if(!b?.individualLife?.ecologicalLearning)return 0;
 // Historical learning remains verifiable, but the independent wild action
 // adapter must not be used to control or train a current partner or person.
 if(b.owner||b.relationship!=='wild'||sapient(b)){
  if(!verify(b))throw Error('Unverified historic animal learning');
  return 0;
 }
 ensure(s,b);
 return tier(b.individualLife.ecologicalLearning.skills.foraging);
}
function navigationTier(s,b){
 if(!b?.individualLife?.ecologicalLearning)return 0;
 // Historical learning remains verifiable, but the independent wild action
 // adapter must not be used to control or train a current partner or person.
 if(b.owner||b.relationship!=='wild'||sapient(b)){
  if(!verify(b))throw Error('Unverified historic animal learning');
  return 0;
 }
 ensure(s,b);
 return tier(b.individualLife.ecologicalLearning.skills.navigation);
}
function learn(s,b,parameters){
 const life=b?.individualLife;
 if(!life||!parameters||typeof parameters!=='object'||
  sapient(b)||b.owner||s.player.partnerIds?.includes(b.id)||
  b.relationship!=='wild'||b.age==='newborn')return null;
 const info=TYPE[parameters.kind];
 if(!info||!info.actions.includes(parameters.action)||
  !Number.isInteger(parameters.day)||parameters.day<0||
  !Number.isInteger(life.lastTickDay))return null;
 const last=life.history?.at(-1);
 if(!last||last.day!==parameters.day||last.action!==parameters.action||
  !['observed','offscreen-sixday'].includes(last.type)||
  !life.sourceHash||life.sourceHash!==wild()._debug.hash(life.source))
  throw Error('No actual source-backed biological action can establish new ecological proficiency');
 const before=parameters.before,after=parameters.after;
 let sourceWitness;
 if(last.type==='observed'){
  const event=life.witnessed?.at(-1);
  if(!event||event.day!==parameters.day||
   event.action!==parameters.action||
   last.sourceHash!==digest(event))throw Error('Witnessed animal learning has no original observation');
  sourceWitness=digest(event);
 }else sourceWitness=digest(last);
 const location=last.location;
 const habitat=s.table?.realm?.ecosystems?.[Atlas.LOCATION_REGION[location]];
 if(!habitat||!Number.isFinite(habitat.forage)||
  !Number.isFinite(habitat.quality)||!Number.isFinite(habitat.pressure)||
  habitat.forage<0||habitat.forage>100||
  habitat.quality<0||habitat.quality>100||
  habitat.pressure<0||habitat.pressure>100)
  throw Error('Only real available regional ecology can establish field adaptation');
 if(info.skill==='foraging'){
  if(!Number.isFinite(before)||!Number.isFinite(after)||
   after>=before||after<0||before>100||
   habitat.forage<30)
   throw Error('Learning from foraging requires actual nourishing food, not just an elapsed tick');
 }else{
  if(typeof before!=='string'||typeof after!=='string'||
   before===after||last.fromLocation!==before||last.location!==after||
   !E.LOCATIONS[before]?.exits?.includes(after)||
   !E.LOCATIONS[after]?.spawns?.includes(b.species))
   throw Error('Navigation insight requires a real connected species-compatible movement');
 }
 const rec=ensure(s,b);
 if(rec.receipts.some(x=>x.source.actionWitnessHash===sourceWitness))
  throw Error('One physical activity cannot award its ecological practice twice');
 const original=rec.skills[info.skill],grade=tier(original);
 const aptitude=rec.aptitude[info.skill];
 // The check rewards the quality of an event. Repeated trivial successes
 // become less informative at great proficiency, yet a gifted individual's
 // exceptional result can count immediately. No minimum days or age.
 const difficulty=info.skill==='foraging'?
   12+(habitat.forage<46?4:0)+grade*2:
   13+(habitat.pressure>65?3:0)+grade*2;
 const roll=1+Math.floor(wild()._debug.draw(life)*20),
  modifier=Math.floor((aptitude-50)/13)+grade,
  total=roll+modifier+(roll===20?5:roll===1?-5:0),
  margin=total-difficulty,success=margin>=0,
  earned=success?(margin>=10?7:margin>=5?4:2)*
   (aptitude>=88?3:aptitude>=73?2:1):0;
 if(success){
  rec.skills[info.skill]=Math.min(500,original+earned);
  rec.successfulMethods[info.skill]++;
 }
 const source={origin:ORIGIN,beastId:b.id,species:b.species,
  individualLifeSourceHash:life.sourceHash,actionWitnessHash:sourceWitness,
  day:parameters.day,skill:info.skill,action:parameters.action,
  location,from:before,to:after,habitat:{forage:habitat.forage,
   quality:habitat.quality,pressure:habitat.pressure},
  roll,modifier,difficulty,total,margin,success,earned,
  previous:rec.headHash};
 const receipt={source,hash:digest(source)};
 rec.headHash=receipt.hash;rec.receipts.push(receipt);
 if(rec.receipts.length>24){
  const retired=rec.receipts.shift(),skill=retired.source.skill;
  rec.anchorHash=retired.hash;rec.anchorAttempts++;
  if(retired.source.success){
   rec.anchorScores[skill]=Math.min(500,
    rec.anchorScores[skill]+retired.source.earned);
   rec.anchorSuccessful[skill]++;
  }
 }
 rec.attempts++;
 if(!verify(b))throw Error('Independent animal learning failed original source or check verification');
 return {skill:info.skill,success,earned,practiceTier:tier(rec.skills[info.skill]),
  witnessed:last.type==='observed',notPowerLevel:true,noEvolutionOrSkillCopy:true};
}
module.exports={ORIGIN,BANDS,TYPE,initial,verify,ensure,bonus,navigationTier,learn,
 _debug:{digest,innate,tier}};
