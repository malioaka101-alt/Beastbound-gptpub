'use strict';
/* Maturity rules 04 §6.6–6.8, no evolution roll without original §6.3. */
const E=require('../engine.js');
const C=require('./core');
function multiplier(o={}){return Math.min(10,1+(o.vaelRich?2:0)+(o.branchResources?1:0)+(o.syncStage>=6?2:o.syncStage>=3?1:0)+(o.matchedTraining?1:0)+(o.documented?1:0));}
function maturityAdvance(track,days,o={}){C.int(days,'days',0,100000);const rate=multiplier(o);const daysPerYear=C.int(o.daysPerYear??365,'days per year',300,400);track.years=Math.min(track.requiredYears,track.years+days*rate/daysPerYear);track.rate=rate;return {years:track.years,rate,ready:track.years>=track.requiredYears};}
function register(s,{beastId,branchId,name,kind='normal',grade,requiredYears=0,conditions=[],potential,gradeCeiling,documented=false,specialConditionsMet=false,formProfile=null,eventStats=null}){
 const b=s.beasts[beastId];if(!b)throw Error('Unknown beast ID');if(typeof branchId!=='string'||!/^[a-z][\w-]{1,40}$/.test(branchId))throw Error('Invalid branch ID');
 C.int(grade,'grade',1,9);C.int(requiredYears,'maturity years',0,10000);C.int(potential,'potential',0,5);C.int(gradeCeiling,'grade ceiling',0,9);
 if(!['normal','standard','environmental','dietary','bond-born','rare','hidden','legendary'].includes(kind))throw Error('Unknown branch kind');
 if(!Array.isArray(conditions)||conditions.length===0||conditions.some(x=>!x||typeof x.label!=='string'||typeof x.met!=='boolean'||typeof x.known!=='boolean'))throw Error('Branch conditions must be fixed before research');
 let verifiedStats=null;
 if(eventStats!==null){
  if(!eventStats||typeof eventStats!=='object'||typeof eventStats.basis!=='string'||eventStats.basis.trim().length<16)throw Error('Evolution Vigor and Will modifiers require a recorded physiological source');
  C.int(eventStats.vigor,'verified beast Vigor modifier',-10,20);C.int(eventStats.will,'verified beast Will modifier',-10,20);
  verifiedStats={vigor:eventStats.vigor,will:eventStats.will,basis:eventStats.basis.trim().slice(0,160)};
 }
 const table=s.table||(s.table={});const all=table.evolution||(table.evolution={});const key=beastId+'/'+branchId;if(all[key])throw Error('Branch already registered');
 all[key]={beastId,branchId,name:String(name||branchId),kind,grade,requiredYears,years:0,conditions,documented,specialConditionsMet,potential,gradeCeiling,rate:1,ripeningSeasons:[],echoStages:[],blocked:false,formProfile:formProfile?validateFormProfile(formProfile,grade):null,eventStats:verifiedStats};
 return {key,registered:true};
}
function get(s,key){const r=s.table?.evolution?.[key];if(!r)throw Error('Unknown evolution branch');return r;}
function status(r){
 const unmet=r.conditions.filter(x=>!x.met),unknown=unmet.filter(x=>!x.known).length;
 const maturityUnmet=r.years<r.requiredYears;
 const knownUnmet=unmet.filter(x=>x.known).length+(maturityUnmet?1:0);
 // Potential never closes a valid evolution window. Low aptitude creates
 // bounded adaptation strain on the actual rite, not a grade ceiling.
 // Authentic condition, maturity, ecology and consent requirements remain.
 const byRoute=!!r.documented&&!!r.specialConditionsMet&&unmet.length===0;
 const ordinary=['normal','standard','environmental','dietary','bond-born'].includes(r.kind);
 const threshold=r.kind==='rare'?4:5;
 const potentialStrain=(ordinary||byRoute)?0:Math.min(4,
  Math.max(0,threshold-r.potential)+Math.max(0,threshold-r.gradeCeiling));
 const gate=true;
 const result={name:r.name,ready:!r.blocked&&!unknown&&!knownUnmet,
  knownUnmet,unknownUnmet:unknown,maturity:r.years,required:r.requiredYears,
  multiplier:r.rate,gate,documented:r.documented,potentialStrain,
  potentialNeverBlocksForm:true};
 return result;
}
function publicStatus(r){
 const st=status(r);
 // Actual readiness depends on sealed source conditions and consent, never
 // a potential ceiling. Public status shows only established known facts.
 return {name:st.name,knownConditionsMet:st.knownUnmet===0,
  knownUnmet:st.knownUnmet,maturity:st.maturity,required:st.required,
  multiplier:st.multiplier,documented:st.documented,
  actualEligibility:'unconfirmed until witnessed evolution event'};
}
function ripening(s,r,{season,available=true,modifier=0}={}){if(typeof season!=='string'||!season.trim())throw Error('Season identifier required');if(r.ripeningSeasons.includes(season))throw Error('Only one ripening dose each season');
 if(!available||!s.player.inventory?.ripening_fruit)throw Error('Ripening requires an actual fruit in inventory');
 s.player.inventory.ripening_fruit--;
 const d=C.check(s,{modifier,dc:12,label:'Ripening Vigor save'});r.years=Math.min(r.requiredYears,r.years+1);r.ripeningSeasons.push(season);
 const b=s.beasts[r.beastId];if(!d.success){b.condition=Math.max(0,(b.condition??100)-10);b.conditions ||= [];b.ripeningWeakness={untilMinutes:s.world.minutes+6*1440};b.conditions.push({type:'ripening-weakness',untilDay:E.day(s)+6});}
 return {years:r.years,success:d.success,condition:b.condition};}
function patternEcho(s,r,{modifier=0,source}={}){if(!source||typeof source!=='string')throw Error('Verified relic/ruin source required');const stage=s.beasts[r.beastId]?.evolutionStage||'Base';if(r.echoStages.includes(stage))throw Error('Pattern Echo usable once per stage');const x=C.check(s,{modifier,dc:15,label:'Pattern Echo'});
 const gain=x.degree==='exceptional'?Math.max(5,r.requiredYears/2):x.degree==='strong'?5:x.success?3:0;
 r.echoStages.push(stage);r.years=Math.min(r.requiredYears,r.years+gain);return {gain,years:r.years,degree:x.degree};}
function eventGate(s,r){const st=status(r);const b=s.beasts[r.beastId];return {...st,consent:b?.consent===true,eligible:st.ready&&b?.consent===true,requiresEventRoll:true};}

// Source-backed additions from System Additions 00b §4 and 04 §§6.6–6.8.
function crucible(s,r,{eventIndex,years=1,source}={}){
 const b=s.beasts?.[r.beastId];if(!b)throw Error('Evolution beast missing');
 C.int(years,'Crucible Maturity years',1,3);
 if(typeof source!=='string'||source.trim().length<12)throw Error('Crucible requires a specific verified scene and source');
 C.int(eventIndex,'scene log index',0,s.log.length-1);
 const entry=s.log[eventIndex];
 if(!['combat','story','progress','world'].includes(entry.type))throw Error('Crucible needs a significant existing world or story event');
 if(!entry.text.includes(b.name)&&entry.details?.beastId!==b.id)throw Error('The existing Crucible scene must involve the beast by name or identity');
 if(r.blocked||r.evolved)throw Error('Evolution branch is no longer active');
 const evidence=require('node:crypto').createHash('sha256').update(JSON.stringify(entry)).digest('hex');
 const used=(s.table ||= {}).evolutionCrucibles||((s.table).evolutionCrucibles={});
 if(used[r.beastId+':'+evidence])throw Error('This Crucible has already supported an evolution branch');
 used[r.beastId+':'+evidence]=r.branchId;
 const prior=r.years;r.years=Math.min(r.requiredYears,r.years+years);
 C.event(s,'progress',`A real Crucible event advances ${b.name}'s evolutionary readiness.`,{beastId:b.id,branchId:r.branchId,source:source.trim().slice(0,180),maturityGain:r.years-prior});
 return {maturityGained:r.years-prior,years:r.years,required:r.requiredYears,source:'recorded event',noNewRoll:true};
}
function recogniseSigns(s,r,{modifier=0,dc=15,soulSight=false,distance=10,source}={}){
 const b=s.beasts?.[r.beastId];if(!b)throw Error('Evolution beast missing');
 if(typeof source!=='string'||source.trim().length<12)throw Error('Recognition needs an actual observed sign and source');
 C.int(dc,'recognition DC',12,18);C.int(modifier,'recognition modifier',-60,60);
 C.int(distance,'distance in metres',0,100000);
 if(soulSight&&distance>10)throw Error('Soul Sight bonus applies only within ten metres');
 const sync=b.syncStage||0;
 const observed=C.check(s,{modifier:modifier+(soulSight?1:0)+(sync>=6?2:0),dc,label:`Recognise the signs around ${b.name}`});
 const window=status(r).ready;
 const felt=sync>=3&&window;
 return {recognised:observed.success,degree:observed.degree,partnerFeltWindow:felt,
  reading:observed.success?(sync>=6?'A forming pattern briefly comes into focus':'The visible signs are consistent with an approaching transformation'):'The signs cannot yet be identified',
  noHiddenRequirementsDisclosed:true};
}
function evolutionCare(s,b,{handlerRank=0,facility=0,facilitySource='',catalysts=[]}={}){
 C.int(handlerRank,'Beast Medicine rank',0,4);C.int(facility,'facility bonus',0,2);
 const savedRank=Math.max(s.player.skills?.beastmedicine?.rank||0,s.player.skills?.medicine?.rank||0);
 if(handlerRank>savedRank)throw Error('Handler medical skill not established in this save');
 if(facility>0&&(typeof facilitySource!=='string'||facilitySource.length<12))throw Error('Evolution facility must have an established in-world source');
 if(!Array.isArray(catalysts)||catalysts.length>3||catalysts.some(k=>typeof k!=='string'||!/^[a-z_]{3,40}$/.test(k)))throw Error('Up to three actual catalyst items required');
 const inv=s.player.inventory||{};
 const counts={};for(const k of catalysts){counts[k]=(counts[k]||0)+1;if((inv[k]||0)<counts[k])throw Error('Required evolution catalyst not owned: '+k);}
 // Required consumables are paid for once, on the actual attempted event.
 for(const [k,n] of Object.entries(counts)){inv[k]-=n;if(inv[k]===0)delete inv[k];}
 const present=(s.player.partnerIds||[]).includes(b.id);
 return handlerRank+facility+catalysts.length+(present&&b.trust>=60?1:0)+(present?(b.syncStage>=7?2:b.syncStage>=4?1:0):0);
}
// Full form must predate the roll: no event can become a successful but undefined
// transformation. Authoring a form does NOT disclose its sealed branch to player.
const VALID_SIZES=new Set(['Tiny','Small','Medium','Large','Huge','Gargantuan','Colossal']);
function validateFormProfile(form,grade){
 if(!form||typeof form!=='object'||Array.isArray(form))throw Error('Evolution requires a pre-recorded form profile');
 const word=(v,name)=>{if(typeof v!=='string'||v.trim().length<3||v.length>160)throw Error('Invalid evolution form '+name);return v.trim();};
 C.int(grade,'target grade',1,9);
 if(!VALID_SIZES.has(form.size))throw Error('Evolution form must specify a real size');
 const result={species:word(form.species,'species'),formName:word(form.formName,'name'),
  speciesGrade:word(form.speciesGrade,'species grade'),individualGrade:word(form.individualGrade,'individual grade'),
  size:form.size,anatomy:form.anatomy,magicalOrgans:form.magicalOrgans,abilities:form.abilities,
  needs:form.needs,levelCap:form.levelCap,maxHp:form.maxHp,maxEnergy:form.maxEnergy};
 if(!Array.isArray(result.anatomy)||result.anatomy.length<2||result.anatomy.length>15||result.anatomy.some(v=>typeof v!=='string'||v.length<5))throw Error('Evolution requires anatomical consequences');
 if(!Array.isArray(result.magicalOrgans)||result.magicalOrgans.some(v=>typeof v!=='string'||v.length<4))throw Error('Invalid magical organ record');
 if(!Array.isArray(result.abilities)||result.abilities.some(a=>!a||typeof a.name!=='string'||typeof a.effect!=='string'||typeof a.cost!=='string'||typeof a.limit!=='string'||!a.source))throw Error('Every evolved ability needs effect, cost, limit and source');
 if(!result.needs||typeof result.needs.diet!=='string'||typeof result.needs.habitat!=='string'||typeof result.needs.care!=='string')throw Error('Evolution must record new biological needs');
 C.int(result.levelCap,'evolved level cap',1,200);C.int(result.maxHp,'evolved maximum health',1,999999);C.int(result.maxEnergy,'evolved maximum energy',1,999999);
 if(result.abilities.length>12)throw Error('Evolution profile has too many unverified abilities');
 return JSON.parse(JSON.stringify(result));
}
function applyForm(s,r,b){
 const f=validateFormProfile(r.formProfile,r.grade);
 if(s.encounter?.beastId===b.id||s.battle?.enemyId===b.id)throw Error('Cannot evolve during unresolved combat');
 const wound=s.table?.combatants?.['beast:'+b.id];
 if(wound&&(wound.wounds?.some(v=>v>0)||wound.status!=='ok'))throw Error('Evolution with existing wounds requires an explicit wound and anatomy transfer ruling');
 const old={species:b.species,speciesGrade:b.speciesGrade,individualGrade:b.individualGrade,evolutionStage:b.evolutionStage,
  maxHp:b.maxHp,maxEnergy:b.maxEnergy,level:b.level,techniques:[...(b.techniques||[])]};
 b.species=f.species;b.speciesGrade=f.speciesGrade;b.individualGrade=f.individualGrade;b.evolutionStage=f.formName;
 b.evolutionGrade=r.grade;b.size=f.size;b.anatomy=[...f.anatomy];b.magicalOrgans=[...f.magicalOrgans];
 b.abilities=f.abilities.map(a=>({...a}));b.techniques=[...new Set([...(b.techniques||[]),...f.abilities.map(a=>a.name)])];
 b.evolutionNeeds={...f.needs};b.levelCap=f.levelCap;
 b.maxHp=f.maxHp;b.hp=Math.min(f.maxHp,b.hp||f.maxHp);b.maxEnergy=f.maxEnergy;b.energy=Math.min(f.maxEnergy,b.energy||f.maxEnergy);
 if(wound){
  // An uninjured wound-profile remains authoritative; new combatant properties
  // (Magnitude/armour/boxes) need a new sourced stat profile before next combat.
  delete s.table.combatants['beast:'+b.id];delete b.combatId;delete b.combatModel;
 }
 (b.evolutionHistory ||= []).push({branchId:r.branchId,day:E.day(s),old,form:f.formName,status:'fully documented form applied'});
 r.evolved=true;r.needsVerifiedFormProfile=false;r.years=Math.min(r.years,r.requiredYears);
 return {old,newForm:f.formName,newSpecies:f.species,abilities:f.abilities.map(a=>a.name),needs:f.needs};
}
function evolutionEvent(s,r,{vigor,will,source,beastWilling=false,guardianConsent=false,informedConsent=false,care={}}={}){
 const b=s.beasts?.[r.beastId];if(!b)throw Error('Evolution beast missing');
 if(typeof source!=='string'||source.trim().length<12)throw Error('Evolution Event requires an established scene, catalysts and source');
 if(r.blocked||r.evolved)throw Error('This branch has already closed or evolved');
 if(r.stalledUntilDay&&E.day(s)<r.stalledUntilDay)throw Error('Evolution window stalled until a later season');
 // Maturity itself may be attempted early with its canonical DC increase,
 // but a *known non-time biological/ritual requirement* is not a dice bonus.
 // Unknown conditions retain the source-defined stalled/twisted failure risk.
 if(r.conditions.some(c=>c.known&&!c.met))
  throw Error('A known non-time evolution prerequisite is unmet; no rite can bypass it by rolling high');
 const B=require('./bonds');
 const consent=B.consentGuard(b,{beastWilling,guardianConsent,informedConsent});
 if(!consent.eligible||b.consent!==true)throw Error('Evolution requires actual voluntary willingness and appropriate protected-mind/informed consent');
 if(vigor!==undefined||will!==undefined)throw Error('Evolution Vigor/Will may not be supplied at attempt time; use a previously recorded, sourced beast profile');
 const verified=r.eventStats;
 if(!verified||typeof verified.basis!=='string')throw Error('Evolution requires a precommitted, sourced Vigor/Will record');
 C.int(verified.vigor,'evolution Vigor modifier',-10,20);C.int(verified.will,'evolution Will modifier',-10,20);
 const gate=status(r);
 if(!gate.unknownUnmet){
  validateFormProfile(r.formProfile,r.grade); // before catalysts, RNG or costs
  if(s.encounter?.beastId===b.id||s.battle?.enemyId===b.id)throw Error('Evolution cannot resolve during combat');
  const c=s.table?.combatants?.['beast:'+b.id];
  if(c&&(c.wounds?.some(v=>v>0)||c.status!=='ok'))throw Error('Wounded beast requires a pre-established form and wound transfer plan');
 }
 const careBonus=evolutionCare(s,b,care);
 const kindBonus=r.kind==='hidden'&&r.documented?2:r.kind==='rare'?2:['hidden','legendary'].includes(r.kind)?4:0;
 const dc=10+2*r.grade+kindBonus+2*gate.knownUnmet+gate.potentialStrain;
 const trials=r.grade<=3?1:r.grade<=6?3:5;
 const needed=r.grade<=3?1:r.grade<=6?2:3;
 const bonus=verified.vigor+verified.will+(r.potential-3)+careBonus;
 const results=[];
 for(let i=0;i<trials;i++)results.push(C.check(s,{modifier:bonus,dc,label:`${b.name} Evolution ${i+1}/${trials}`}));
 const successes=results.filter(x=>x.success).length, severe=results.some(x=>x.degree==='severe failure');
 let outcome,complication=null;
 if(gate.unknownUnmet){outcome=severe?'twisted transformation; nature uncertain':'stalled';
  if(severe)r.pendingTransformation='twisted branch requires GM-adjudicated form';
  else r.stalledUntilDay=E.day(s)+90;
 }else if(successes>=needed){outcome=successes===trials&&results.some(x=>x.degree==='exceptional')?'evolved with bonus pending':'evolved';
  const applied=applyForm(s,r,b);
  r.appliedFormSummary=applied;
 }else if(!severe){outcome='stalled until next season';r.stalledUntilDay=E.day(s)+90;}
 else{
  const roll=C.die(s);
  const condition=roll<=6?'illness':roll<=10?'lost technique':roll<=13?'malformation':roll<=16?'permanent branch closure':roll<=19?'twisted branch':'critical collapse';
  complication={roll,condition,requiresAdjudication:condition!=='permanent branch closure'};
  outcome='failed evolution: '+condition;
  if(roll<=6){b.condition=Math.max(0,(b.condition??100)-20);(b.conditions ||= []).push({type:'evolution-illness',untilMinutes:s.world.minutes+30*1440,conditionLoss:20});}
  if(roll>=14&&roll<=16)r.blocked=true;
  if(roll>=17)r.pendingTransformation=condition+' — resolve injury/form using verified wound profile';
 }
 r.lastEvent={outcome,day:E.day(s),dc,trials,needed,successes,
  potentialStrain:gate.potentialStrain,source:source.trim().slice(0,180),complication};
 C.event(s,'progress',`${b.name}: evolutionary transformation ${outcome}.`,{beastId:b.id,branchId:r.branchId,dc,successes,needed,outcome,complication});
 return {outcome,dc,successes,needed,rolls:results.map(x=>({roll:x.roll,total:x.total,degree:x.degree})),
  complication,confirmedForm:r.evolved?b.evolutionStage:null,formChange:r.evolved?r.appliedFormSummary:null,requiresFormProfile:false,
  noUnverifiedAbilitiesGranted:true};
}

// Expected-rate and practical progress helpers. Natural 20/1 modifiers must
// match core.check; this function never touches the RNG.
function expectedRate(modifier,dc){
 C.int(modifier,'training modifier',-100,100);C.int(dc,'training DC',2,100);
 let points=0;
 for(let face=1;face<=20;face++){
  const margin=face+C.naturalAdjustment(face)+modifier-dc;
  points+=C.progress(C.degree(margin));
 }
 return points/20;
}
function trainingWeek(s,{modifier=0,dc=15,partTime=false,label='Training'}={}){
 const rolled=C.check(s,{modifier,dc,label});
 return {check:rolled,points:rolled.progress*(partTime?.5:1),complicationNeeded:rolled.degree==='severe failure'};
}
function breakthrough(s,{modifier=0,dc=15,insightSpent=0,label='Breakthrough'}={}){
 C.int(insightSpent,'Insight spent',0,2);
 if((s.player.insightPoints||0)<insightSpent)throw Error('Insufficient Insight Points');
 s.player.insightPoints-=insightSpent;
 const check=C.check(s,{modifier:modifier+insightSpent*2,dc,label});
 const next={exceptional:'breakthrough with bonus',strong:'breakthrough',success:'breakthrough',setback:'retry after two training weeks',
 failure:'retry after four training weeks','severe failure':'backlash: apply discipline-specific table'};
 return {check,outcome:next[check.degree],requiresFailureTable:check.degree==='severe failure'};
}
// This remains a PURE progress estimate, NOT a player-callable success
// operation. Trusted world adapters must establish real pedagogical context.
// A scholar can know and explain a subject without practising its power,
// while a powerful practitioner can still be a poor communicator.
function trainingPP({currentRank=0,teacherRank=null,teacherKnowledge=null,
 teachingClarity=null,partTime=false,comprehension=3}={}){
 C.int(currentRank,'current skill rank',0,5);
 C.int(comprehension,'learner comprehension',0,6);
 if(teacherRank!==null)C.int(teacherRank,'verified teacher practical rank',0,5);
 if(teacherKnowledge!==null)C.int(teacherKnowledge,'verified relevant subject knowledge',0,6);
 if(teachingClarity!==null)C.int(teachingClarity,'verified instruction clarity',0,6);
 // Preserve old source-reference vectors when older callers supplied only
 // teacherRank, but do not let documented poor communication create a bonus.
 const practised=teacherRank!==null&&teacherRank>currentRank&&
  (teachingClarity===null||teachingClarity>=2);
 let gain=practised?4:2;
 if(teacherKnowledge!==null&&teachingClarity!==null){
  if(teacherKnowledge>=4&&teachingClarity>=3)gain=Math.max(gain,4);
  if(teacherKnowledge>=5&&teachingClarity>=5)gain=Math.max(gain,5);
 }
 if(currentRank>=3)gain=Math.ceil(gain/2);
 gain=Math.max(1,gain+(comprehension>=4?1:comprehension<=1?-1:0));
 return partTime?Math.ceil(gain/2):gain;
}
const ppCost=[0,10,25,50,100,200];
function addPracticePoints(skill,points){
 C.int(points,'practice points',0,10000);C.int(skill.rank,'skill rank',0,5);
 if(!Number.isFinite(skill.pp))skill.pp=0;
 skill.pp+=points;const advancements=[];
 while(skill.rank<5){
  const next=skill.rank+1;
  if(skill.pp<ppCost[next])break;
  if(next>=4&&!skill['trial_'+next]){
   advancements.push(`${next===4?'Mastery':'Grand'} Trial required before rank ${next}`);
   break;
  }
  skill.pp-=ppCost[next];skill.rank++;
  advancements.push(`Rank ${skill.rank}`);
 }
 return {rank:skill.rank,pp:skill.pp,advancements};
}
function xpToNext(level,rate='Average'){
 C.int(level,'beast level',1,200);
 const multiplier={Fast:.75,Average:1,Slow:1.5,'Very slow':2}[rate];
 if(multiplier===undefined)throw Error('Unknown growth rate');
 const x=10*level*multiplier;
 const floor=Math.floor(x);
 return x-floor===.5?(floor%2===0?floor:floor+1):Math.round(x); // Python's ties-to-even
}
module.exports={multiplier,maturityAdvance,register,get,status,publicStatus,ripening,patternEcho,eventGate,crucible,recogniseSigns,evolutionCare,evolutionEvent,validateFormProfile,
 expectedRate,trainingWeek,breakthrough,trainingPP,addPracticePoints,xpToNext};