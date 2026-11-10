'use strict';
// The first bounded defensive spell: a learned one-minute First-Circle Ward.
// Its architecture and Mana cost use the original family budget; the
// 3-step M0 capacity and academy course are declared local table rulings.
const SelfTech=require('./self-taught-basic-techniques');
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),B=require('./build'),W=require('./world'),
 H=require('./unified'),Practice=require('./earned-practice'),
 Spark=require('./arcane-spark');
const ID='arcane_ward',DAYS=6,FEE=400,DC=12,STEPS=3;
const SOURCE='Lumenfall Annex self-study of the established Arcane Ward family with a real First-Circle geometry';
const FORM=Object.freeze({family:'ward',rng:'self',area:'single',
 duration:'1min',magnitude:0,conditions:0,extraTargets:0,speed:'standard'});
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function only(p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('First-Circle Ward accepts no invented effect, duration, strength, spellcheck, teacher or Mana cost');
}
function budget(s){
 // Do not equate a starting Mana pool or unearned Circle counter with spell
 // competence. The same genuine core/Circle milestone tests as Spark apply.
 Spark.curriculum(s);
 const t=B.spellCost(FORM);
 const p=B.arcaneProfile(s.player.arcane.circles);
 if(t.complexity!==2||t.mana!==2||t.load!==1||t.castingDC!==12||
   t.minCircle!==1||t.ritual!==false||p.maxComplexity<t.complexity||
   p.loadTolerance<t.load)
  throw Error('Source-derived First-Circle Ward budget cannot be satisfied');
 return t;
}
function status(s,p={}){
 only(p);
 const r=s.table?.arcaneTechniques?.[ID],spec=B.spellCost(FORM);
 return {techniqueId:ID,known:!!r,minimumCircle:1,
   manaCost:spec.mana,castingDC:spec.castingDC,
   wardSteps:STEPS,wardMagnitude:0,duration:'one combat exchange (one in-world minute)',
   studyDays:DAYS,feeTalons:FEE/100,
   learnedAtMinute:r?.learnedAtMinute??null,
   activeInCombat:!!s.battle&&s.table?.combatants?.player?.ward?.steps>0,
   alternateRoute:'independent',independentStudyDays:12,independentFeeTalons:0,
   independentStudyDC:14,
   note:'Ward learning can be assisted or personally discovered; Circle capacity alone does not teach it'};
}
function study(s,p={}){
 if(p&&p.route==='independent')return SelfTech.learn(s,ID,p);
 only(p);
 const spec=budget(s);
 if(s.world?.location!=='academy'||!E.LOCATIONS.academy?.facilities?.includes('academy'))
  throw Error('The established Lumenfall Academy laboratory is required for First-Circle Ward study');
 if(s.battle||s.encounter)
  throw Error('An unsafe active threat cannot be treated as a witnessed sixday Ward lesson');
 if(s.player.partnerIds?.length)
  throw Error('Actual beast partners need an independently established daily welfare arrangement during a sixday course');
 const c=s.table?.combatants?.player;
 if(s.player.health!==s.player.maxHealth||
   (c&&(c.status!=='ok'||c.wounds.some(n=>n>0))))
  throw Error('An injured or incapacitated character needs actual care before sustained Arcane Ward study');
 if(s.table?.arcaneTechniques?.[ID])
  throw Error('The learned First-Circle Ward already exists; repeated lessons cannot mint a second copy');
 const attempts=s.table?.arcaneWardStudy?.attempts||[];
 if(!Array.isArray(attempts)||attempts.some(x=>!Number.isInteger(x.finishedMinute)||
   s.world.minutes-x.finishedMinute<6*1440))
  throw Error('A separate sixday recovery and preparation interval is required after a failed Ward lesson');
 if(!Number.isFinite(s.player.coins)||s.player.coins*100<FEE)
  throw Error('The academy Ward lesson requires four real Talons of tuition and materials');
 const int=C.int(s.player.attributes?.int,'current Intelligence',1,30),
  rank=C.int(s.player.skills?.arcana?.rank,'earned Arcana rank',0,5);
 const begin=s.world.minutes;
 H.spend(s,{scales:FEE,reason:'Real Lumenfall First-Circle defensive Ward laboratory study'});
 C.event(s,'world','A measured self-protection Ward is prepared for sixday First-Circle laboratory study.',{
  origin:'verified-first-circle-ward-syllabus',source:SOURCE,techniqueId:ID,
  durationDays:DAYS,tuitionScales:FEE,spellCost:spec,
  geometry:s.player.arcane.geometry,wardSteps:STEPS,wardMagnitude:0
 });
 const witnessIndex=s.log.length-1,witnessHash=digest(s.log[witnessIndex]);
 const check=C.check(s,{modifier:Math.floor((int-10)/2)+2*rank,dc:DC,
  label:'Lumenfall First-Circle Arcane Ward measured practical'});
 const rollIndex=s.log.length-1,rollHash=digest(s.log[rollIndex]);
 const practice=Practice.award(s,{skill:'arcana',check,risky:true});
 W.advance(s,DAYS);
 s.table||={};s.table.arcaneWardStudy||={attempts:[]};
 const rec={techniqueId:ID,source:SOURCE,startedMinute:begin,
  finishedMinute:s.world.minutes,success:check.success,
  witnessIndex,witnessHash,rollIndex,rollHash,roll:check.roll,
  spellCost:{...spec},tuitionScales:FEE,wardSteps:STEPS,
  wardMagnitude:0,geometry:s.player.arcane.geometry};
 s.table.arcaneWardStudy.attempts.push(rec);
 if(check.success){
  s.table.arcaneTechniques||={};
  s.table.arcaneTechniques[ID]={
   techniqueId:ID,kind:'learned-first-circle-defensive-ward',
   source:SOURCE,learnedAtMinute:s.world.minutes,
   geometry:s.player.arcane.geometry,acquiredAtCircle:s.player.arcane.circles,
   spellCost:{...spec},wardSteps:STEPS,wardMagnitude:0,
   witnessHash,rollHash,studyStartedMinute:begin
  };
 }
 H.sync(s,{source:'legacy'});
 C.event(s,'progress',check.success?
   'The genuine First-Circle Ward lesson is learned; its small protective field can now be cast in real combat.':
   'The actual academy Ward practical fails; the time and materials are spent, and no spell is learned.',{
     techniqueId:ID,sourceWitnessHash:witnessHash,rollHash,
     success:check.success,days:DAYS
   });
 return {...practice,learned:check.success,techniqueId:ID,
  feeTalons:FEE/100,elapsedDays:DAYS,check,noExtraRoll:true,
  manaCost:spec.mana,castingDC:spec.castingDC,
  wardSteps:STEPS,wardMagnitude:0};
}
function profile(s,techniqueId){
 if(techniqueId!==ID)throw Error('Only the specifically earned First-Circle Ward may be cast here');
 if(s.table?.arcaneTechniques?.[ID]?.route==='independent')return SelfTech.profile(s,ID);
 const spec=budget(s),r=s.table?.arcaneTechniques?.[ID];
 if(!r||r.techniqueId!==ID||r.kind!=='learned-first-circle-defensive-ward'||
   r.source!==SOURCE||r.geometry!==s.player.arcane.geometry||
   !Number.isInteger(r.acquiredAtCircle)||r.acquiredAtCircle<1||
   r.acquiredAtCircle>s.player.arcane.circles||
   !Number.isInteger(r.learnedAtMinute)||r.learnedAtMinute>s.world.minutes||
   r.wardSteps!==STEPS||r.wardMagnitude!==0||
   JSON.stringify(r.spellCost)!==JSON.stringify(spec)||
   typeof r.witnessHash!=='string'||r.witnessHash.length!==64||
   typeof r.rollHash!=='string'||r.rollHash.length!==64)
  throw Error('There is no unchanged genuinely taught First-Circle Ward record');
 const attempts=s.table?.arcaneWardStudy?.attempts;
 if(!Array.isArray(attempts)||!attempts.some(a=>
   a.techniqueId===ID&&a.success===true&&a.source===SOURCE&&
   a.finishedMinute===r.learnedAtMinute&&a.startedMinute===r.studyStartedMinute&&
   a.tuitionScales===FEE&&a.wardSteps===STEPS&&a.wardMagnitude===0&&
   a.geometry===r.geometry&&a.witnessHash===r.witnessHash&&
   a.rollHash===r.rollHash&&JSON.stringify(a.spellCost)===JSON.stringify(spec)))
  throw Error('No witnessed successful defensive Ward study supports this magical ability');
 const mana=C.int(s.player.mana,'actual Mana reserve',0,100000);
 if(mana<spec.mana)throw Error('Insufficient real Mana for the verified First-Circle Ward');
 const int=C.int(s.player.attributes?.int,'current Intelligence',1,30),
  rank=C.int(s.player.skills?.arcana?.rank,'earned Arcana rank',0,5);
 return {techniqueId:ID,source:SOURCE,castingDC:spec.castingDC,
  manaCost:spec.mana,modifier:Math.floor((int-10)/2)+2*rank,
  wardSteps:STEPS,wardMagnitude:0};
}
function cast(s,combatant,verified){
 if(!verified||verified.techniqueId!==ID||
   !(verified.source===SOURCE||
    (verified.route==='independent'&&SelfTech.sourceValid(ID,verified.source))))
  throw Error('Cannot introduce an unverified defensive spell');
 if(combatant.status!=='ok')throw Error('An incapacitated caster cannot raise a Ward');
 if(combatant.ward?.steps>0)
  throw Error('An active Ward already protects this caster; neither stacking nor replenishment is supported');
 // An independently calibrated Meridian–Arcane interface can stabilise the
 // ALREADY learned Ward's single actual casting check. The source is
 // checked here, not provided as a caller-selected bonus or extra spell.
 const hybrid=require('./cross-ward-interface'),
  support=hybrid.support(s);
 const check=C.check(s,{modifier:verified.modifier+support.bonus,
  dc:verified.castingDC,
  label:'First-Circle Ward: one honest Arcane non-attack casting roll'});
 const manaSpent=check.success?verified.manaCost:
  check.degree==='setback'?Math.floor(verified.manaCost/2):verified.manaCost;
 s.player.mana-=manaSpent;
 let backlash=false;
 if(check.success){
  // Small M0 field, one combat minute. Each legitimate incoming hit is
  // resolved by Combat.attack's existing whole-hit Ward absorption logic.
  combatant.ward={steps:STEPS,magnitude:0};
  combatant.wardSource=ID;
 }else if(check.degree==='severe failure'){
  // Fixed bounded failure consequence. Not a second die or an instant
  // arbitrary wound.
  combatant.stamina=Math.max(0,combatant.stamina-1);
  backlash=true;
 }
 C.event(s,'combat',check.success?
  'A genuine small defensive Arcane Ward briefly surrounds its caster.':
  'The defensive Ward fails to form; the genuine Mana cost is still paid.',{
    origin:'verified-one-minute-arcane-ward',source:verified.source,
    techniqueId:ID,check,success:check.success,
    manaSpent,backlash,wardSteps:check.success?STEPS:0,
    ...(support.bonus?{hybridWardSupport:{
     source:hybrid.SOURCE,calibrationSeal:support.sourceSeal,
     bonus:support.bonus}}:{})
  });
 if(support.bonus)hybrid.consume(s,support.sourceSeal,check);
 return {verifiedTechniqueId:ID,cast:check.success,check,
  manaSpent,backlash,wardSteps:check.success?STEPS:0,
  duration:'one combat exchange',learnedTechniqueSource:verified.source,
  noExtraRoll:true,
  sourceVerifiedQiManaWardBonus:support.bonus,
  consumedCalibrationSeal:support.sourceSeal};
}
function expire(s,c,castResult){
 if(castResult?.verifiedTechniqueId!==ID)return null;
 // An entire exchange takes one world minute in this engine. It is the
 // complete one-minute duration of this first basic ward.
 if(c.wardSource===ID){
  const leftover=c.ward?.steps??0;
  c.ward=null;delete c.wardSource;
  C.event(s,'combat','The one-minute Arcane Ward dissipates at the end of its actual combat exchange.',{
   origin:'verified-arcane-ward-expiry',techniqueId:ID,
   stepsRemaining:Math.max(0,leftover)
  });
  return {expired:true,stepsRemaining:Math.max(0,leftover)};
 }
 return {expired:false,stepsRemaining:0};
}
module.exports={study,status,profile,cast,expire,FORM};
