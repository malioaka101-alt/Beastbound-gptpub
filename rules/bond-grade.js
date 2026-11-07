'use strict';
// An actual field exam can reveal a numeric individual Grade only if an
// independent Grade calibration was already established in the beast's
// sealed world record. Rarity is NOT mapped to numerical Grade.
const E=require('../engine.js'),C=require('./core'),BD=require('./bonds'),Agency=require('./beast-agency');
const MINUTES=120,COOLDOWN=6*1440,PRICE=1;
function gradeReference(s,b){
 const x=b.gradeCalibration;
 if(!x||!Number.isInteger(x.grade)||x.grade<1||x.grade>9||
    !Number.isInteger(x.worldMinute)||x.worldMinute<0||x.worldMinute>s.world.minutes||
    typeof x.source!=='string'||x.source.trim().length<18||
    x.species!==b.species||x.evolutionStage!==b.evolutionStage||
    x.individualGrade!==b.individualGrade)
  throw Error('A pre-established independent numeric Grade calibration for this individual and current form is required');
 return x;
}
function assessment(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||
    Object.keys(p).some(k=>k!=='beastId'))
  throw Error('Only the beastId may be given; Grade, result, assessor and rolls are not caller-selected');
 const id=p.beastId,b=s.beasts?.[id];
 if(typeof id!=='string'||!b)throw Error('Unknown individual beast for Grade examination');
 const bond=BD.fromSave(s,id);
 if(s.battle)throw Error('Grade examination is not available during combat');
 if(!['crossing','academy'].includes(s.world.location))
  throw Error('A recognised examination facility is required for a Grade evaluation');
 if(s.encounter?.beastId!==id&&!s.player.partnerIds?.includes(id)||
    b.away===true||(b.location&&b.location!==s.world.location))
  throw Error('Individual beast must be physically present for its Grade examination');
 if(!Number.isInteger(b.sapience)||b.sapience!==bond.sapience||b.sapience>=2)
  throw Error('Protected and sapient beings need independent guardian or informed examination consent');
 if(bond.fractured||bond.willingness<30||
    /hostile|agitated|terrified|panicked|fearful/i.test(String(b.mood||''))||
    ['captured','forced','coerced'].includes(String(b.relationship||'').toLowerCase()))
  throw Error('The beast must be freely cooperative and calm for a noninvasive Grade examination');
 if(!Agency.evaluate(s,b,bond,'grade_exam').possible)
  throw Error('The beast independently declines examination or needs welfare care first');
 const calibration=gradeReference(s,b);
 const existing=b.contractGradeAssessment;
 if(existing&&existing.grade===calibration.grade&&
    existing.species===b.species&&existing.evolutionStage===b.evolutionStage&&
    existing.individualGrade===b.individualGrade)
  throw Error('This individual already has a current numeric Grade assessment');
 const last=b.gradeExamLastMinute;
 if(last!==undefined){
  C.int(last,'last Grade examination minute',0);
  if(s.world.minutes-last<COOLDOWN)throw Error('A failed Grade evaluation cannot be repeated until another sixday');
 }
 if(!Number.isFinite(s.player.coins)||s.player.coins<PRICE)
  throw Error('One Talon in examination materials is required');
 const rank=C.int(s.player.skills?.beastcraft?.rank??0,'recorded Beastcraft rank',0,5);
 const wis=C.int(s.player.attributes?.wis,'recorded Wisdom',1,30);
 const modifier=Math.floor((wis-10)/2)+2*rank;
 const dc=12+2*calibration.grade;
 s.player.coins=Number((s.player.coins-PRICE).toFixed(2));
 const checkedAtMinute=s.world.minutes;
 const check=C.check(s,{modifier,dc,label:'Individual beast Grade examination'});
 Agency.remember(s,b);
 b.gradeExamLastMinute=checkedAtMinute;
 E.advance(s,MINUTES);
 b.gradeExaminations||=[];
 const result={worldMinute:s.world.minutes,facility:s.world.location,
  outcome:check.success?'verified':'inconclusive',check:{roll:check.roll,dc:check.dc,degree:check.degree}};
 b.gradeExaminations.push(result);
 b.gradeExaminations=b.gradeExaminations.slice(-20);
 if(!check.success){
  C.event(s,'beast','The examination is inconclusive; no individual numeric Grade can be certified.',{beastId:id});
  return {completed:true,verified:false,grade:null,check,feeTalons:PRICE,minutes:MINUTES};
 }
 const grade=calibration.grade,source='Individual Grade '+grade+
  ' verified at '+s.world.location+' after d20 '+check.roll+' vs DC '+dc+
  ', against prior independent calibration: '+calibration.source.trim().slice(0,120);
 b.contractGradeAssessment={grade,species:b.species,evolutionStage:b.evolutionStage,
  individualGrade:b.individualGrade,worldMinute:s.world.minutes,source,
  origin:'observed-independent-grade-exam',facility:s.world.location,
  calibrationMinute:calibration.worldMinute,examCheck:{roll:check.roll,dc}};
 C.event(s,'beast','The completed examination confirms an individual numeric Grade '+grade+' for '+b.name+'.',
  {beastId:id,grade,source});
 return {completed:true,verified:true,grade,check,feeTalons:PRICE,minutes:MINUTES,
  source,notSpeciesRarity:true};
}
function status(s,p={}){
 if(typeof p.beastId!=='string'||!s.beasts?.[p.beastId])
  throw Error('Unknown individual beast for Grade status');
 const b=s.beasts[p.beastId],a=b.contractGradeAssessment;
 if(!a)return {assessed:false,examAttempts:b.gradeExaminations?.length||0};
 const current=a.species===b.species&&a.evolutionStage===b.evolutionStage&&
  a.individualGrade===b.individualGrade;
 return {assessed:current,grade:current?a.grade:null,
  source:current?a.source:null,examAttempts:b.gradeExaminations?.length||0};
}
module.exports={assessment,status};
