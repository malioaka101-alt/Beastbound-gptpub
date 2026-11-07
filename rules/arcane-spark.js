'use strict';
// First positive combat technique for earned First-Circle Arcane practice.
// No Circle alone grants a spell: real sixday private academy study and a
// recorded resolved Arcana check are prerequisites.
const Crypto=require('node:crypto');
const SelfTech=require('./self-taught-basic-techniques');
const E=require('../engine.js'),C=require('./core'),B=require('./build'),
 W=require('./world'),H=require('./unified'),Practice=require('./earned-practice');
const ID='arcane_spark',FEE=400,DAYS=6,DC=12;
const SOURCE='Lumenfall Annex Academy self-study using the pre-authored Arcane Spark pattern and First-Circle spell budgets';
const FORM=Object.freeze({family:'strike',damage:6,rng:'close',area:'single',
 duration:'instant',magnitude:0,conditions:0,extraTargets:0,speed:'standard'});
const digest=o=>Crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex');
function only(p,keys=[]){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>!keys.includes(k))||
    keys.some(k=>!Object.hasOwn(p,k)))
  throw Error('Arcane study accepts only its source-authored technique request; no invented spell, DC, mana or success');
}
function curriculum(s){
 const a=s.player?.arcane,history=s.table?.disciplineTraining?.arcane?.history;
 const core=history?.find(x=>x.target==='core'&&
   typeof x.change==='string'&&x.change.includes('Mana Core ignited')),
  circle=history?.find(x=>x.target==='circle1'&&
   typeof x.change==='string'&&x.change.includes('First Circle constructed'));
 if(!a?.coreIgnited||a.circles<1||!Number.isInteger(a.circles)||a.circles>9||
    typeof a.geometry!=='string'||a.geometry.trim().length<10||
    !core||!circle||!Number.isInteger(circle.day)||circle.day<core.day||
    circle.day>E.day(s)||!Number.isInteger(core.day)||core.day<1)
  throw Error('Arcane Spark requires an actually earned Mana Core and constructed First Circle, with source-dated training milestones');
 const spec=B.spellCost(FORM);
 if(spec.minCircle!==1||spec.complexity!==2||spec.mana!==2||
    spec.castingDC!==12||spec.load!==1||spec.ritual!==false)
  throw Error('Original First-Circle Arcane architecture and spell cost must match the authored spell budget');
 const power=B.arcaneProfile(a.circles);
 if(power.maxComplexity<spec.complexity||
    power.loadTolerance<spec.load)
  throw Error('Constructed Circle capacity or caster load tolerance does not support the technique');
 return spec;
}
function status(s,p={}){
 only(p);
 const a=s.table?.arcaneTechniques?.[ID],spec=B.spellCost(FORM);
 const known=!!a;
 return {techniqueId:ID,known,
  school:'First-Circle Arcane strike',
  castingDC:spec.castingDC,damage:FORM.damage,
  manaCost:spec.mana,minimumCircle:1,range:'close',nonlethal:true,
  studySite:'Lumenfall Annex Academy',studyDays:DAYS,studyFeeTalons:FEE/100,
  learnedAtMinute:known?a.learnedAtMinute:null,
  alternateRoute:'independent',independentStudyDays:12,independentFeeTalons:0,
  independentStudyDC:14,
  note:'A Circle alone does not grant this formula; academy tuition and individual experimentation are alternative paths'};
}
function learn(s,p={}){
 if(p&&p.route==='independent')return SelfTech.learn(s,ID,p);
 only(p);
 const spec=curriculum(s);
 const academy=E.LOCATIONS.academy;
 if(s.world?.location!=='academy'||!academy?.facilities?.includes('academy'))
  throw Error('The actual Lumenfall Annex Academy study laboratory is required');
 if(s.battle||s.encounter)throw Error('A dangerous active encounter cannot be treated as an uneventful sixday study');
 if(s.player.partnerIds?.length)
  throw Error('A sixday training course with partners requires separately witnessed daily beast welfare and provisions');
 const c=s.table?.combatants?.player;
 if(s.player.health!==s.player.maxHealth||
    (c&&(c.status!=='ok'||c.wounds.some(n=>n>0))))
  throw Error('The student must be medically fit for the sustained sixday Arcane study');
 if(s.table?.arcaneTechniques?.[ID])
  throw Error('The same Arcane Spark technique has already been learned');
 const previous=s.table?.arcaneSparkStudy?.attempts||[];
 if(!Array.isArray(previous)||previous.some(x=>
    Number.isInteger(x.completedMinute)&&s.world.minutes-x.completedMinute<6*1440))
  throw Error('A completed failed study must be followed by a full separate sixday recovery and preparation period');
 if(!Number.isFinite(s.player.coins)||s.player.coins*100<FEE)
  throw Error('Four actual Talons are needed for the laboratory, notes and practice materials');
 const rank=C.int(s.player.skills?.arcana?.rank,'existing Arcana skill rank',0,5),
  int=C.int(s.player.attributes?.int,'existing Intelligence',1,30),
  modifier=Math.floor((int-10)/2)+2*rank;
 const started=s.world.minutes;
 H.spend(s,{scales:FEE,reason:'Lumenfall First-Circle Arcane Spark private study and laboratory access'});
 C.event(s,'world','The actual Lumenfall Academy laboratory and the original small Arcane Spark pattern are prepared for sixdays of structured independent study.',{
  origin:'verified-first-circle-spark-syllabus',source:SOURCE,techniqueId:ID,
  durationDays:DAYS,feeScales:FEE,spellCost:spec,geometry:s.player.arcane.geometry
 });
 const witnessIndex=s.log.length-1,witnessHash=digest(s.log[witnessIndex]);
 const check=C.check(s,{modifier,dc:DC,label:'First-Circle Arcane Spark independent practical examination'});
 const rollIndex=s.log.length-1,rollHash=digest(s.log[rollIndex]);
 const practice=Practice.award(s,{skill:'arcana',check,risky:true});
 const ended=started+DAYS*1440;
 W.advance(s,DAYS);
 s.table||={};s.table.arcaneSparkStudy||={attempts:[]};
 s.table.arcaneSparkStudy.attempts.push({
  techniqueId:ID,startedMinute:started,completedMinute:ended,
  success:check.success,roll:check.roll,rollIndex,rollHash,
  witnessIndex,witnessHash,source:SOURCE,
  originalSpellCost:{...spec},actualTuitionScales:FEE
 });
 if(check.success){
  s.table.arcaneTechniques||={};
  s.table.arcaneTechniques[ID]={
   techniqueId:ID,kind:'learned-first-circle-arcane-strike',
   source:SOURCE,learnedAtMinute:s.world.minutes,
   acquiredAtCircle:s.player.arcane.circles,
   geometry:s.player.arcane.geometry,
   spellCost:{...spec},damage:FORM.damage,range:FORM.rng,
   nonlethal:true,rollHash,witnessHash,
   studyStartedMinute:started,studyCompletedMinute:ended
  };
 }
 H.sync(s,{source:'legacy'});
 C.event(s,'progress',check.success?
  'Sixdays of actual Arcane study conclude with a successful learned First-Circle Spark technique.':
  'Sixdays of actual Arcane study have not produced a reliable usable Spark pattern; another separately funded course is needed.',{
   origin:'verified-arcane-technique-study',techniqueId:ID,
   success:check.success,sourceWitnessHash:witnessHash,rollHash,
   elapsedDays:DAYS
  });
 return {...practice,techniqueId:ID,learned:check.success,
  durationDays:DAYS,feeTalons:FEE/100,check,noExtraRoll:true,
  minimumCircle:1,castingDC:spec.castingDC,manaCost:spec.mana,
  damage:FORM.damage,nonlethal:true};
}
function attackProfile(s,techniqueId){
 if(techniqueId!==ID)throw Error('Only a genuinely studied Arcane Spark has a verified private wound-combat spell profile');
 if(s.table?.arcaneTechniques?.[ID]?.route==='independent')return SelfTech.profile(s,ID);
 const spec=curriculum(s),a=s.table?.arcaneTechniques?.[ID];
 if(!a||a.techniqueId!==ID||a.kind!=='learned-first-circle-arcane-strike'||
    a.source!==SOURCE||a.range!=='close'||a.damage!==FORM.damage||
    a.nonlethal!==true||!Number.isInteger(a.learnedAtMinute)||
    a.learnedAtMinute>s.world.minutes||
    a.acquiredAtCircle<1||a.acquiredAtCircle>s.player.arcane.circles||
    a.geometry!==s.player.arcane.geometry||
    JSON.stringify(a.spellCost)!==JSON.stringify(spec)||
    typeof a.rollHash!=='string'||a.rollHash.length!==64||
    typeof a.witnessHash!=='string'||a.witnessHash.length!==64)
  throw Error('The actual taught First-Circle Arcane Spark profile is missing or inconsistent');
 const studies=s.table?.arcaneSparkStudy?.attempts;
 if(!Array.isArray(studies)||!studies.some(x=>
   x.techniqueId===ID&&x.success===true&&x.source===SOURCE&&
   x.witnessHash===a.witnessHash&&x.rollHash===a.rollHash&&
   x.completedMinute===a.learnedAtMinute&&
   x.originalSpellCost?.castingDC===spec.castingDC&&
   x.originalSpellCost?.mana===spec.mana&&
   x.actualTuitionScales===FEE))
  throw Error('No genuine witnessed original successful instruction backs this magical technique');
 const rank=C.int(s.player.skills?.arcana?.rank,'current Arcana skill rank',0,5);
 const intelligence=C.int(s.player.attributes?.int,'current spellcasting Intelligence',1,30);
 if(!Number.isInteger(s.player.mana)||s.player.mana<spec.mana)
  throw Error('Insufficient actual Mana to cast the learned Arcane Spark');
 return {techniqueId:ID,castingDC:spec.castingDC,manaCost:spec.mana,
  damage:FORM.damage,offM:0,
  modifier:Math.floor((intelligence-10)/2)+2*rank,
  nonlethal:true,source:a.source};
}
module.exports={learn,status,attackProfile,curriculum,FORM};
