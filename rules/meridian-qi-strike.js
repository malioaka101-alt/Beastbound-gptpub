'use strict';
// First verifiably earned Meridian technique — distinct from a Gate opening.
// The old prototype explicitly names Qi Strike but the live wound combat
// requires actual education, a real first Gate and cost-accounted Qi.
const Crypto=require('node:crypto');
const SelfTech=require('./self-taught-basic-techniques');
const E=require('../engine.js'),C=require('./core'),Build=require('./build'),
 World=require('./world'),Health=require('./unified'),Practice=require('./earned-practice');
const ID='qi_strike',DAYS=6,FEE=300,DC=13,DAMAGE=8;
const FORM=Object.freeze({damage:DAMAGE,rng:'close',area:'single',projectionM:0,riders:0});
const SOURCE='Professor Sera first-gate Meridian anatomy instruction at Lumenfall Annex for the pre-authored Qi Strike pattern';
const digest=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function noClaims(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).length)
  throw Error('Meridian Qi Strike lessons accept no chosen Gate, bonus, Qi cost, quality, teacher, roll or result');
}
function gate(s){
 const m=s.player?.meridian,records=s.table?.powerPhysiology?.meridian?.gateRecords||[];
 const opened=m?.gates?.[0],record=records.find(x=>x.number===1);
 if(!Number.isInteger(m?.stage)||m.stage<3||
    !Array.isArray(m.gates)||m.gates.length<1||
    opened?.number!==1||opened.band!=='Lower'||
    !['Sound','Perfect','Flawed'].includes(opened.quality)||
    !record||record.band!=='Lower'||record.quality!==opened.quality||
    !Number.isInteger(record.day)||record.day<1||record.day>E.day(s)||
    !Number.isInteger(s.table?.powerPhysiology?.meridian?.primaryMapped)||
    s.table.powerPhysiology.meridian.primaryMapped!==12)
  throw Error('Qi Strike requires the genuine first Lower Meridian Gate and all 12 previously mapped Primary Meridians');
 const qi=Build.qiTechniqueCost(FORM);
 if(qi!==3)throw Error('The authored first-gate Qi Strike budget must remain fixed at 3 Qi');
 return {qi,opened,record};
}
function status(s,p={}){
 noClaims(p);
 const learned=s.table?.meridianTechniques?.[ID];
 return {techniqueId:ID,known:!!learned,
  requiredGate:1,requiredStage:3,
  energy:'Qi',qiCost:Build.qiTechniqueCost(FORM),
  damage:DAMAGE,range:'close',nonlethal:true,
  school:'Meridian first-gate reinforcement strike',
  academyInstructor:'Professor Sera',studyDays:DAYS,feeTalons:FEE/100,
  learnedAtMinute:learned?.learnedAtMinute??null,
  alternateRoute:'independent',independentStudyDays:12,independentFeeTalons:0,
  independentStudyDC:15,
  note:'Opening a Gate does not instantly teach this technique, but a paid instructor is one path rather than a universal law'};
}
function learn(s,p={}){
 if(p&&p.route==='independent')return SelfTech.learn(s,ID,p);
 noClaims(p);
 const {qi,opened,record}=gate(s),doctor=E.NPCS.sera,
  site=E.LOCATIONS.academy;
 if(s.world?.location!=='academy'||site?.facilities?.includes('academy')!==true||
    doctor?.location!=='academy'||doctor.profession!=='Meridian anatomist')
  throw Error('Actual Lumenfall Academy and its named Meridian anatomist Professor Sera are required');
 if(s.battle||s.encounter)
  throw Error('An active dangerous scene cannot be converted into a safe sixday Meridian lesson');
 if((s.player.partnerIds||[]).length)
  throw Error('A real sixday teaching period with beast partners requires separate warranted care and feeding');
 const combatant=s.table?.combatants?.player;
 if(s.player.health!==s.player.maxHealth||
    (combatant&&(combatant.status!=='ok'||combatant.wounds.some(n=>n>0))))
  throw Error('A significantly injured character must receive actual medical care before sustained Qi training');
 if(s.table?.meridianTechniques?.[ID])
  throw Error('This earned Qi Strike technique has already been mastered');
 const attempts=s.table?.meridianQiStrikeStudy?.attempts||[];
 if(!Array.isArray(attempts)||attempts.some(x=>
    Number.isInteger(x.completedMinute)&&s.world.minutes-x.completedMinute<6*1440))
  throw Error('A previously unsuccessful course requires a fresh full sixday preparation before another attempt');
 if(!Number.isFinite(s.player.coins)||s.player.coins*100<FEE)
  throw Error('Three real Talons of teaching materials and laboratory access are required');
 const rank=C.int(s.player.skills?.cultivation?.rank,'earned Cultivation rank',0,5);
 const wisdom=C.int(s.player.attributes?.wis,'recorded Wisdom',1,30);
 const started=s.world.minutes;
 Health.spend(s,{scales:FEE,reason:'Real Meridian Qi Strike sixday anatomy and practical study with Professor Sera'});
 C.event(s,'world','Professor Sera supervises genuine First-Gate anatomy and the fixed Qi Strike reinforcement pattern.',{
  origin:'sourced-first-gate-qi-strike-study',teacher:doctor.name,location:'academy',
  source:SOURCE,techniqueId:ID,gate:opened.number,gateQuality:opened.quality,
  gateOpenedDay:record.day,durationDays:DAYS,feeScales:FEE,qiCost:qi,damage:DAMAGE
 });
 const witnessIndex=s.log.length-1,witnessHash=digest(s.log[witnessIndex]);
 const check=C.check(s,{modifier:Math.floor((wisdom-10)/2)+2*rank,
  dc:DC,label:'Professor Sera first-gate Qi Strike practical demonstration'});
 const rollIndex=s.log.length-1,rollHash=digest(s.log[rollIndex]);
 const pp=Practice.award(s,{skill:'cultivation',check,risky:true});
 World.advance(s,DAYS);
 s.table||={};s.table.meridianQiStrikeStudy||={attempts:[]};
 s.table.meridianQiStrikeStudy.attempts.push({
  techniqueId:ID,source:SOURCE,instructor:doctor.name,location:'academy',
  startedMinute:started,completedMinute:s.world.minutes,
  gate:opened.number,gateQuality:opened.quality,gateOpenedDay:record.day,
  roll:check.roll,success:check.success,rollIndex,rollHash,
  witnessIndex,witnessHash,feeScales:FEE,qiCost:qi,damage:DAMAGE
 });
 if(check.success){
  s.table.meridianTechniques||={};
  s.table.meridianTechniques[ID]={
   techniqueId:ID,kind:'earned-lower-gate-meridian-strike',source:SOURCE,
   learnedAtMinute:s.world.minutes,gate:1,
   gateQuality:opened.quality,gateOpenedDay:record.day,
   qiCost:qi,damage:DAMAGE,range:'close',nonlethal:true,
   rollHash,witnessHash,teacher:doctor.name
  };
 }
 Health.sync(s,{source:'legacy'});
 C.event(s,'progress',check.success?
  'Real sixday First-Gate instruction produces one learned Qi Strike technique.':
  'The sixday practical Qi Strike technique lesson does not produce a reliable form; full tuition and time were expended.',{
   origin:'verified-meridian-technique-study',techniqueId:ID,
   result:check.success?'learned':'not-yet-learned',
   sourceWitnessHash:witnessHash,checkEventHash:rollHash,days:DAYS
  });
 return {...pp,techniqueId:ID,learned:check.success,
  check,noExtraRoll:true,studyDays:DAYS,feeTalons:FEE/100,
  qiCost:qi,damage:DAMAGE,range:'close',nonlethal:true};
}
function attackProfile(s,id){
 if(id!==ID)throw Error('Only a genuinely taught First-Gate Qi Strike is an approved playable Meridian combat technique');
 if(s.table?.meridianTechniques?.[ID]?.route==='independent')return SelfTech.profile(s,ID);
 const {qi,opened,record}=gate(s),a=s.table?.meridianTechniques?.[ID];
 if(!a||a.techniqueId!==ID||a.kind!=='earned-lower-gate-meridian-strike'||
    a.source!==SOURCE||a.teacher!==E.NPCS.sera?.name||
    a.gate!==1||a.gateQuality!==opened.quality||
    a.gateOpenedDay!==record.day||a.qiCost!==qi||
    a.damage!==DAMAGE||a.range!=='close'||a.nonlethal!==true||
    !Number.isInteger(a.learnedAtMinute)||a.learnedAtMinute>s.world.minutes||
    typeof a.rollHash!=='string'||a.rollHash.length!==64||
    typeof a.witnessHash!=='string'||a.witnessHash.length!==64)
  throw Error('No consistent taught First-Gate Qi Strike ability exists in the verified technique ledger');
 const attempts=s.table?.meridianQiStrikeStudy?.attempts||[];
 if(!Array.isArray(attempts)||!attempts.some(x=>
    x.techniqueId===ID&&x.success===true&&x.source===SOURCE&&
    x.instructor===a.teacher&&x.gate===1&&
    x.gateQuality===a.gateQuality&&x.gateOpenedDay===a.gateOpenedDay&&
    x.rollHash===a.rollHash&&x.witnessHash===a.witnessHash&&
    x.completedMinute===a.learnedAtMinute&&
    x.feeScales===FEE&&x.qiCost===qi&&x.damage===DAMAGE))
  throw Error('The learned Qi Strike has no source-matched original successful teaching record');
 const available=C.int(s.player.qi,'recorded current Qi',0,100000),
  rank=C.int(s.player.skills?.cultivation?.rank,'earned Cultivation rank',0,5),
  wisdom=C.int(s.player.attributes?.wis,'recorded Wisdom',1,30);
 if(available<qi)throw Error('Insufficient real Qi for the source-budgeted learned strike');
 return {techniqueId:ID,qiCost:qi,damage:DAMAGE,offM:0,nonlethal:true,
  modifier:Math.floor((wisdom-10)/2)+2*rank,source:SOURCE};
}
module.exports={learn,status,attackProfile,gate,FORM};
