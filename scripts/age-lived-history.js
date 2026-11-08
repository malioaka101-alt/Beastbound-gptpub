'use strict';
// Source-grounded pre-game life, not a class, a fixed destiny, free licence or
// an inferred decision by a relative. Age changes what may have happened
// before the first scene while player agency always begins at the first turn.
const Crypto=require('node:crypto');
const SOURCE='seeded-pre-game-lived-years-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const number=(seed,tag)=>Crypto.createHash('sha256').update('bb-lived-years|'+(seed>>>0)+'|'+tag).digest().readUInt32BE(0);
const pick=(seed,tag,values)=>values[number(seed,tag)%values.length];
const LIVES=Object.freeze([
 {work:'independent fieldworker',skill:'survival',context:'Experience following seasonal paths, environmental hazards and occasional survey work.'},
 {work:'market trader',skill:'diplomacy',context:'Experience dealing with arrivals, changing prices, correspondence and ordinary customers.'},
 {work:'craft worker',skill:'crafting',context:'Experience repairing everyday objects and working with limited materials.'},
 {work:'community medic',skill:'medicine',context:'Experience assisting ordinary medical care; no independent surgical licence is presumed.'},
 {work:'archive researcher',skill:'research',context:'Experience comparing records and resolving gaps in practical evidence.'},
 {work:'beast caretaker',skill:'beastcraft',context:'Experience tending ordinary animals while respecting individual autonomy and danger.'},
 {work:'independent tutor',skill:'research',context:'Experience helping others interpret established lessons; no special powers are taught automatically.'},
 {work:'local courier',skill:'survival',context:'Experience finding practical paths and carrying messages without instant travel privileges.'},
 {work:'household organiser',skill:'diplomacy',context:'Experience planning shared household work; no adult relatives are thereby compelled to agree.'},
 {work:'travelling repairer',skill:'crafting',context:'Experience doing mundane repairs away from formal shops, without universal workshop access.'},
 {work:'self-employed maker',skill:'crafting',context:'Experience running modest independent orders and handling ordinary work costs.'},
 {work:'casual worker',skill:'survival',context:'A varied livelihood built from seasonal employment, uncertain opportunities and personal choices.'}
]);
function phase(age){
 if(!Number.isInteger(age)||age<0||age>120)throw Error('Age must be a plausible integer from newborn through advanced old age');
 if(age<12)return 'childhood';
 if(age<18)return 'adolescence';
 if(age<40)return 'young-adulthood';
 if(age<65)return 'established-adulthood';
 return 'later-life';
}
function prepare(seed,age,{role,goal}={}){
 const lifePhase=phase(age),adult=age>=18,work=pick(seed,'work',LIVES),
  years=adult?Math.min(age-16,number(seed,'experience-years')%Math.max(1,Math.min(32,age-14)+1)):0,
  varied=adult?pick(seed,'prior-circumstances',[
   'ordinary employed work','self-directed work','family responsibilities',
   'change of trade','community activity','interrupted employment',
   'independent study','informal mentoring','a modest sole-person enterprise',
   'no settled occupation','a recently begun livelihood'
  ]):age<12?'household and community life':'education, household work or early apprenticeships';
 const ownWork=typeof role==='string'&&role.trim()?role.trim():
  adult?work.work:age>=12?'learning and occasional supervised work':'no established adult occupation';
 const chosenRole=typeof role==='string'&&role.trim()?role.trim():null;
 const knownSkill=chosenRole?
  (/heal|medic|physic|clinic|nurs/i.test(chosenRole)?'medicine':
   /craft|smith|repair|shipwright|weav|build|tailor|carpent|artist/i.test(chosenRole)?'crafting':
   /trade|merch|negotiat|diplomat|steward|council/i.test(chosenRole)?'diplomacy':
   /research|archiv|study|tutor|scholar/i.test(chosenRole)?'research':
   /animal|beast|herd|stable|handler/i.test(chosenRole)?'beastcraft':
   /scout|ranger|field|sail|hunter|courier/i.test(chosenRole)?'survival':null):work.skill;
 const practice=adult&&years>0&&knownSkill?Math.min(2,1+Math.floor(years/12)):0;
 const funds=adult?(20+number(seed,'prior-savings')%170):age>=12?number(seed,'small-pocket-money')%18:0;
 const known={source:SOURCE,age,phase:lifePhase,
  work:ownWork,workHistory:adult?work.context:
   age>=12?'Life experience may include learning, family duties or interests; no professional qualification is assumed.':
    'Early life, family and community shape experience; an adult job or legal office is not presumed.',
  priorWorkYears:years,ordinaryPractice:practice?{skill:knownSkill,rankCap:practice}:null,
  circumstance:varied,personalGoal:typeof goal==='string'?goal.trim():null,
  fundsSource:adult?'Modest prior savings from an independently lived biography':
   age>=12?'Small personal funds, if any; household resources belong to their owners':
    'No assumed personally owned funds or business assets',
  funds,nextBirthdayInDays:1+number(seed,'next-birthday')%365,
  distinctHistory:true,
  noFixedCareer:true,noFixedTemperament:true,noAutomaticAdultAuthority:true,
  noAutomaticRightsOrAffection:true,noInheritedPowers:true,noNPCConsent:true};
 return {...known,seal:hash(known)};
}
function verify(r){
 if(!r||r.source!==SOURCE||!Number.isInteger(r.age)||
  !['childhood','adolescence','young-adulthood','established-adulthood','later-life'].includes(r.phase)||
  r.phase!==phase(r.age)||!Number.isInteger(r.nextBirthdayInDays)||
  r.nextBirthdayInDays<1||r.nextBirthdayInDays>365)return false;
 const {seal,...body}=r;return hash(body)===seal;
}
function install(state,life){
 if(!verify(life)||state.player.age!==life.age)
  throw Error('Starting life history does not match this character and age');
 if(state.player.livedYears)throw Error('An existing pre-game life cannot be rerolled');
 state.player.livedYears=structuredClone(life);
 if(life.ordinaryPractice){
  const item=state.player.skills[life.ordinaryPractice.skill];
  if(item)item.rank=Math.max(item.rank,life.ordinaryPractice.rankCap);
 }
 // Financial baseline is a previously lived ordinary circumstance, NOT
 // an ongoing salary, family treasury, deed or free organisation.
 state.player.coins=life.funds;
 if(life.age<12){
  state.player.maxStamina=Math.min(state.player.maxStamina,36);
  state.player.stamina=Math.min(state.player.stamina,state.player.maxStamina);
  state.player.maxHealth=Math.min(state.player.maxHealth,48);
  state.player.health=Math.min(state.player.health,state.player.maxHealth);
 }
 return {phase:life.phase,work:life.work,priorWorkYears:life.priorWorkYears,
  noAutomaticOffice:true};
}
// Birthdays continue through the one civil clock. Starting life history
// remains immutable, and age never grants an automatic new class, licence,
// social standing, ability or guaranteed opportunity.
function sync(s){
 const lived=s.player?.livedYears;
 if(!lived)return {changed:false,legacy:true};
 if(!verify(lived))throw Error('The original lived-years record was altered');
 const completed=Math.floor(s.world.minutes/1440),offset=lived.nextBirthdayInDays;
 if(!Number.isInteger(completed)||completed<0)
  throw Error('Cannot age against an invalid or reversed world clock');
 const years=completed>=offset?1+Math.floor((completed-offset)/365):0;
 const actual=lived.age+years;
 if(!Number.isInteger(s.player.age)||s.player.age<lived.age||s.player.age>actual)
  throw Error('The character age is not supported by their saved lived history and calendar');
 if(actual===s.player.age)return {changed:false,age:actual,years};
 const previous=s.player.age;
 s.player.age=actual;
 require('../rules/core').event(s,'world',
  'The recorded life of '+s.player.name+' now reaches age '+actual+'.',{
  origin:'source-grounded-lived-years-birthday',previousAge:previous,
  currentAge:actual,completedWorldDays:completed,
  nextBirthdayInDays:offset,noAutoPower:true,
  noAutoJob:true,noAutomaticSocialStatus:true});
 return {changed:true,from:previous,to:actual,years};
}
module.exports={SOURCE,LIVES,phase,prepare,verify,install,sync};
