'use strict';
// Independent discovery of existing *basic* patterns. This is not access to
// ancient manuals, NPC secrets, advanced Circles, or unearned gate openings.
// The real practitioner studies their own previously established anatomy,
// spends actual Mana/Qi, practises for two sixdays, and may fail.
const Crypto=require('node:crypto');
const E=require('../engine.js'),C=require('./core'),B=require('./build'),
 World=require('./world'),H=require('./unified'),
 Practice=require('./earned-practice'),Combat=require('./combat');
const DAYS=12;
const TYPES=Object.freeze({
 arcane_spark:Object.freeze({system:'arcane',skill:'arcana',attr:'int',
   dc:14,resource:'mana',energyCost:2,kind:'learned-first-circle-arcane-strike'}),
 arcane_ward:Object.freeze({system:'arcane',skill:'arcana',attr:'int',
   dc:14,resource:'mana',energyCost:2,kind:'learned-first-circle-defensive-ward'}),
 qi_strike:Object.freeze({system:'meridian',skill:'cultivation',attr:'wis',
   dc:15,resource:'qi',energyCost:3,kind:'earned-lower-gate-meridian-strike'})
});
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function shape(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).length!==1||p.route!=='independent')
  throw Error('Self-taught basic techniques accept only route:"independent", not a chosen manual, price, result or difficulty');
}
function sourceFor(id,site){
 const loc=E.LOCATIONS[site];
 if(!TYPES[id]||!loc)throw Error('Only an existing basic technique and real world location can be a self-study source');
 const anatomy=id==='qi_strike'?"the practitioner's own recorded Lower Gate 1":"the practitioner's own constructed Mana Core and First Circle";
 return 'Self-derived '+id+' practice from '+anatomy+' at '+loc.name;
}
function sourceValid(id,source){
 return typeof source==='string'&&Object.keys(E.LOCATIONS)
   .some(site=>source===sourceFor(id,site));
}
function anatomy(s,id){
 if(id==='qi_strike'){
  const g=require('./meridian-qi-strike').gate(s);
  if(g.qi!==3)throw Error('Existing Qi Strike anatomy and cost are inconsistent');
  return {gate:1,gateQuality:g.opened.quality,gateOpenedDay:g.record.day,
   resourceCost:g.qi,damage:8,kind:TYPES[id].kind};
 }
 if(!['arcane_spark','arcane_ward'].includes(id))
  throw Error('This power does not have a proven basic self-study formula');
 const basic=require('./arcane-spark').curriculum(s);
 const form=id==='arcane_spark'?require('./arcane-spark').FORM:
    require('./arcane-ward').FORM;
 const formula=B.spellCost(form);
 if(formula.minCircle!==1||formula.mana!==2||formula.castingDC!==12||
   formula.complexity!==2||formula.load!==1||
   (id==='arcane_spark'&&JSON.stringify(formula)!==JSON.stringify(basic)))
  throw Error('The current First-Circle formula must match its original canonical cost budget');
 return {spellCost:{...formula},acquiredAtCircle:s.player.arcane.circles,
  geometry:s.player.arcane.geometry,resourceCost:formula.mana,
  ...id==='arcane_spark'?{damage:6,range:'close',nonlethal:true}:
     {wardSteps:3,wardMagnitude:0},
  kind:TYPES[id].kind};
}
function learnedRow(s,id){
 return id==='qi_strike'?s.table?.meridianTechniques?.[id]:
  s.table?.arcaneTechniques?.[id];
}
function baselineAttempts(s,id){
 if(id==='arcane_spark')return s.table?.arcaneSparkStudy?.attempts||[];
 if(id==='arcane_ward')return s.table?.arcaneWardStudy?.attempts||[];
 return s.table?.meridianQiStrikeStudy?.attempts||[];
}
function setup(s,id){
 const t=TYPES[id];
 if(!t)throw Error('Unsupported basic technique');
 const a=anatomy(s,id),site=s.world?.location,loc=E.LOCATIONS[site];
 if(!loc)throw Error('An actually visited physical location is required for independent training');
 if(s.encounter||s.battle)
  throw Error('A dangerous current encounter cannot be converted into uninterrupted twelve-day study');
 const c=s.table?.combatants?.player;
 if(c&&c.status!=='ok')throw Error('An incapacitated practitioner cannot study independently');
 if(c?.wounds?.[2]>0)
  throw Error('Critical injuries require genuine treatment before twelve days of unsupervised energy practice');
 if(s.player.partnerIds?.length)
  throw Error('Actual beast partners need their own witnessed daily care during long independent training');
 if(learnedRow(s,id))throw Error('This real basic technique has already been learned');
 const attempts=s.table?.selfTaughtBasic?.attempts||[];
 if(!Array.isArray(attempts)||!Array.isArray(baselineAttempts(s,id))||
    attempts.some(x=>x.techniqueId===id&&
       (!Number.isInteger(x.finishedMinute)||s.world.minutes-x.finishedMinute<6*1440))||
    baselineAttempts(s,id).some(x=>
       Number.isInteger(x.completedMinute??x.finishedMinute)&&
       s.world.minutes-(x.completedMinute??x.finishedMinute)<6*1440))
  throw Error('A previous failed course requires a separately elapsed preparation and recovery period');
 const energy=C.int(s.player[t.resource],t.resource+' available for practical study',0,100000);
 if(energy<t.energyCost)
  throw Error('Real '+(t.resource==='mana'?'Mana':'Qi')+' is needed for independent hands-on technique practice');
 // Long field study is possible but cannot happen without twelve actual
 // days of food. No invented free wilderness provisions or permanent camps.
 const supplies=loc.biome==='settlement'?0:DAYS;
 const inv=s.player.inventory||{};
 if(supplies){
  const rations=C.int(inv.clean_rations||0,'actual clean rations for a remote study period',0,100000);
  if(rations<supplies)
   throw Error('Twelve genuine daily rations are required for a twelve-day remote study period; the same method can also be practised at an established settlement');
 }
 return {t,a,site,loc,supplies,source:sourceFor(id,site)};
}
function learn(s,id,p={}){
 shape(p);
 const {t,a,site,loc,supplies,source}=setup(s,id);
 const rank=C.int(s.player.skills?.[t.skill]?.rank,'earned technique study skill rank',0,5),
  stat=C.int(s.player.attributes?.[t.attr],'current technique study attribute',1,30);
 const wound=s.table?.combatants?.player;
 const modifier=Math.floor((stat-10)/2)+2*rank-(wound?Combat.penalty(wound):0);
 const started=s.world.minutes,oldQi=s.player.qi,oldMana=s.player.mana;
 C.event(s,'world','The practitioner independently experiments with the basic '+id+
  ' pattern at '+loc.name+' using only their actually developed '+t.system+' physiology.',{
  origin:'actual-independent-basic-technique-study',
  techniqueId:id,source,location:site,biome:loc.biome,
  startedMinute:started,days:DAYS,dc:t.dc,tuitionScales:0,
  resource:t.resource,energyConsumed:t.energyCost,
  foodConsumed:supplies,previouslyEarnedAnatomy:a
 });
 const witnessIndex=s.log.length-1,witnessHash=digest(s.log[witnessIndex]),
  witnessEvent=structuredClone(s.log[witnessIndex]);
 if(supplies){
  s.player.inventory.clean_rations-=supplies;
  if(!s.player.inventory.clean_rations)delete s.player.inventory.clean_rations;
 }
 s.player[t.resource]-=t.energyCost;
 const check=C.check(s,{modifier,dc:t.dc,
  label:'Independent '+id+' technical discovery from actual '+t.system+' practice'});
 const rollIndex=s.log.length-1,rollHash=digest(s.log[rollIndex]),
  rollEvent=structuredClone(s.log[rollIndex]);
 const pp=Practice.award(s,{skill:t.skill,check,risky:true});
 const complication=check.degree==='severe failure'?'failed technical calibration: one Stamina fatigue':null;
 if(complication){
  const combatant=s.table?.combatants?.player;
  if(combatant){
   combatant.stamina=Math.max(0,combatant.stamina-1);
   s.player.stamina=combatant.stamina;
  }else s.player.stamina=Math.max(0,s.player.stamina-1);
 }
 World.advance(s,DAYS);
 s.table||={};s.table.selfTaughtBasic||={attempts:[]};
 const attempt={techniqueId:id,route:'independent',
  source,location:site,startedMinute:started,finishedMinute:s.world.minutes,
  days:DAYS,dc:t.dc,tuitionScales:0,energySpent:t.energyCost,
  resource:t.resource,foodConsumed:supplies,
  rollIndex,rollHash,witnessIndex,witnessHash,
  // Hash-matched original witnesses survive the bounded scene log.
  witnessEvent,rollEvent,
  success:check.success,roll:check.roll,anatomy:a};
 s.table.selfTaughtBasic.attempts.push(attempt);
 if(check.success){
  const row={...a,techniqueId:id,route:'independent',kind:t.kind,
   source,studySite:site,studyStartedMinute:started,
   learnedAtMinute:s.world.minutes,witnessHash,rollHash};
  if(id==='qi_strike'){
   row.qiCost=3;row.teacher=null;row.range='close';row.nonlethal=true;
   s.table.meridianTechniques||={};s.table.meridianTechniques[id]=row;
  }else{
   s.table.arcaneTechniques||={};s.table.arcaneTechniques[id]=row;
  }
 }
 H.sync(s,{source:'legacy'});
 C.event(s,'progress',check.success?
  'The actual twelve-day self-taught '+id+' work produces one learned basic form.':
  'The twelve-day '+id+' experiment does not yield a reliable form; earned practice, materials, fatigue and the honest failure remain.',{
   origin:'independent-technique-result',techniqueId:id,
   route:'independent',sourceWitnessHash:witnessHash,
   checkEventHash:rollHash,success:check.success,
   energySpent:t.energyCost,days:DAYS,complication
  });
 const energyField=t.resource==='mana'?{manaCost:2,castingDC:12}:
  {qiCost:3};
 return {...pp,techniqueId:id,route:'independent',learned:check.success,
  check,feeTalons:0,studyDays:DAYS,elapsedDays:DAYS,
  resourceSpent:t.energyCost,foodConsumed:supplies,complication,
  source,nonlethal:true,noExtraRoll:true,...energyField};
}
function profile(s,id){
 const t=TYPES[id];
 if(!t)throw Error('Unsupported independent technique profile');
 const a=anatomy(s,id),r=learnedRow(s,id),rows=s.table?.selfTaughtBasic?.attempts;
 // An earned first-Circle technique stays grounded in the anatomy and
 // source at the time of learning. Building a second Circle must never
 // rewrite that history or revoke an already proven basic formula.
 const originalAnatomy=id==='qi_strike'?a:
  {...a,acquiredAtCircle:r?.acquiredAtCircle};
 if(!r||r.route!=='independent'||r.techniqueId!==id||
    r.kind!==t.kind||!sourceValid(id,r.source)||
    !E.LOCATIONS[r.studySite]||r.source!==sourceFor(id,r.studySite)||
    !Number.isInteger(r.studyStartedMinute)||r.studyStartedMinute<0||
    !Number.isInteger(r.learnedAtMinute)||
    r.learnedAtMinute-r.studyStartedMinute!==DAYS*1440||
    r.learnedAtMinute>s.world.minutes||
    typeof r.witnessHash!=='string'||r.witnessHash.length!==64||
    typeof r.rollHash!=='string'||r.rollHash.length!==64)
  throw Error('No authenticated independently earned basic technique matches the real body and world history');
 const x=Array.isArray(rows)&&rows.find(z=>
   z.techniqueId===id&&z.route==='independent'&&z.success===true&&
   z.source===r.source&&z.location===r.studySite&&
   z.startedMinute===r.studyStartedMinute&&z.finishedMinute===r.learnedAtMinute&&
   z.witnessHash===r.witnessHash&&z.rollHash===r.rollHash&&
   z.dc===t.dc&&z.days===DAYS&&z.tuitionScales===0&&
   z.resource===t.resource&&z.energySpent===t.energyCost&&
   z.foodConsumed===(E.LOCATIONS[r.studySite].biome==='settlement'?0:DAYS)&&
   JSON.stringify(z.anatomy)===JSON.stringify(originalAnatomy));
 if(!x)throw Error('The self-taught technique is not supported by actual original study evidence');
 // The rolling narration log is not the permanent proof ledger. A saved
 // archive must match original hashes; older saves without one still need
 // the authentic original scene in the live log.
 if((x.witnessEvent&&digest(x.witnessEvent)!==r.witnessHash)||
    (x.rollEvent&&digest(x.rollEvent)!==r.rollHash))
  throw Error('The archived original technique evidence was altered');
 const liveWitness=s.log?.[x.witnessIndex],liveCheck=s.log?.[x.rollIndex],
  witness=liveWitness&&digest(liveWitness)===r.witnessHash?
    liveWitness:x.witnessEvent,
  check=liveCheck&&digest(liveCheck)===r.rollHash?
    liveCheck:x.rollEvent,
  details=witness?.details;
 if(witness?.type!=='world'||details?.origin!=='actual-independent-basic-technique-study'||
    details?.techniqueId!==id||details?.source!==r.source||
    details?.location!==r.studySite||details?.dc!==t.dc||
    details?.resource!==t.resource||details?.energyConsumed!==t.energyCost||
    details?.tuitionScales!==0||details?.days!==DAYS||
    details?.foodConsumed!==x.foodConsumed||
    digest(witness)!==r.witnessHash||
    check?.type!=='roll'||check.details?.success!==true||
    check.details?.dc!==t.dc||check.details?.roll!==x.roll||
    digest(check)!==r.rollHash)
  throw Error('The actual original independent technique study and honest successful check are missing or forged');
 const field=t.resource;
 if(!Number.isInteger(s.player[field])||s.player[field]<t.energyCost)
  throw Error('Insufficient real '+(field==='mana'?'Mana':'Qi')+' to perform the learned technique');
 const stat=C.int(s.player.attributes?.[t.attr],'current technique casting ability',1,30);
 const rank=C.int(s.player.skills?.[t.skill]?.rank,'earned current technique skill rank',0,5);
 const modifier=Math.floor((stat-10)/2)+2*rank;
 if(id==='arcane_spark'){
  if(r.damage!==6||r.range!=='close'||r.nonlethal!==true||
    JSON.stringify(r.spellCost)!==JSON.stringify(a.spellCost)||
    r.geometry!==a.geometry||(!Number.isInteger(r.acquiredAtCircle)||r.acquiredAtCircle<1||r.acquiredAtCircle>a.acquiredAtCircle))
   throw Error('A forged Arcane Spark technique cannot override the original spell architecture');
  return {route:'independent',techniqueId:id,modifier,source:r.source,
    castingDC:12,manaCost:2,damage:6,offM:0,nonlethal:true};
 }
 if(id==='arcane_ward'){
  if(r.wardSteps!==3||r.wardMagnitude!==0||
    JSON.stringify(r.spellCost)!==JSON.stringify(a.spellCost)||
    r.geometry!==a.geometry||(!Number.isInteger(r.acquiredAtCircle)||r.acquiredAtCircle<1||r.acquiredAtCircle>a.acquiredAtCircle))
   throw Error('A forged Arcane Ward cannot replace its real small First-Circle field');
  return {route:'independent',techniqueId:id,modifier,source:r.source,
    castingDC:12,manaCost:2,wardSteps:3,wardMagnitude:0};
 }
 if(r.qiCost!==3||r.gate!==1||r.gateQuality!==a.gateQuality||
    r.gateOpenedDay!==a.gateOpenedDay||r.damage!==8||
    r.range!=='close'||r.nonlethal!==true||r.teacher!==null)
  throw Error('A forged self-taught Meridian record does not match actual Lower Gate 1');
 return {route:'independent',techniqueId:id,modifier,source:r.source,
  qiCost:3,damage:8,offM:0,nonlethal:true};
}
module.exports={learn,profile,sourceValid,sourceFor};
