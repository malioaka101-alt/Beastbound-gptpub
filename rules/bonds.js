'use strict';
// Relationship model for Beastbound. Bond values describe observed history; a
// record is never ownership, and no new record silently creates a contract.
const C=require('./core');
const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,Math.round(n*10)/10));
const startingProfiles={
 // An initial record is not evidence that the parties have met or bonded.
 unfamiliar:[0,0,0,0,0,0,0],
 imprinted:[30,40,30,10,20,20,50],
 won_by_trust:[25,15,15,20,10,10,50],
 breeder:[15,5,10,10,5,10,40],
 rescued:[10,5,15,15,5,5,30],
 professional:[20,10,5,20,5,15,40],
 captured:[0,0,0,5,0,0,5],
 negotiated:[20,5,0,30,10,40,60]
};
const names=['trust','familiarity','affection','respect','loyalty','communication','willingness'];
const annual={trust:8,familiarity:10,affection:6,respect:4,loyalty:5,communication:5,coordination:6,sharedExperience:4,willingness:3};
const events={
 good_care_week:{familiarity:2,affection:1,trust:1},training_week:{coordination:3,communication:1},
 training_week_qualified:{coordination:4.5,communication:1},shared_danger:{sharedExperience:5,trust:3,coordination:2},
 protected_at_risk:{trust:8,loyalty:5,affection:3},respected_refusal:{respect:3,willingness:3},
 play:{affection:2},gentle_treatment:{trust:2,affection:2},excelled_together:{respect:3,sharedExperience:3},
 shouting:{trust:-3,affection:-2},forced_against_will:{willingness:-8,trust:-5},
 neglect_week:{trust:-2,affection:-2,willingness:-3},abandoned_in_danger:{trust:-25,loyalty:-20},
 abuse:{trust:-20,affection:-15,willingness:-20},broken_promise:{trust:-15,respect:-10},
 month_apart:{familiarity:-2,communication:-2},reunion:{affection:5}
};
const heightened={proud:['respected_refusal','excelled_together'],clingy:['month_apart','reunion'],
 timid:['shouting','forced_against_will'],protective:['protected_at_risk']};
function communicationCap(sapience,{beastHandlingRank=0,contractDepth=null,soulPhase=0,lattice=false,syncStage=0}={}){
 C.int(sapience,'sapience',0,5);
 let cap=[20,50,70][sapience]??100;
 if(sapience===1&&beastHandlingRank>=3)cap=60;
 if(['standard','deep','covenant'].includes(contractDepth))cap+=20;
 if(soulPhase>=3)cap+=20;
 if(lattice)cap+=15;
 if(syncStage>=2)cap+=10;
 return Math.min(100,cap);
}
function create({human,beast,sapience=1,start='won_by_trust',years=0,compatibility=5,resonance=5,personality=[]}={}){
 if(!startingProfiles[start])throw Error('Unknown bond background');
 if(typeof human!=='string'||typeof beast!=='string'||!human||!beast)throw Error('Bond participants required');
 C.int(years,'bond years',0,100);C.int(sapience,'sapience',0,5);
 C.int(compatibility,'compatibility',1,10);C.int(resonance,'resonance',1,10);
 if(!Array.isArray(personality)||personality.length>5||personality.some(x=>typeof x!=='string'))throw Error('Invalid personality tags');
 const values=startingProfiles[start];
 const bond={human,beast,sapience,compatibility,resonance,personality:[...personality],
   coordination:0,sharedExperience:0,contractStability:0,contract:null,lowWeeks:0,
   syncStage:0,syncState:null,syncPoints:0,fractured:false};
 names.forEach((name,i)=>{bond[name]=values[i];});
 for(const [key,delta] of Object.entries(annual))bond[key]=Math.min(70,(bond[key]||0)+delta*years);
 bond.commCap=communicationCap(sapience);
 bond.communication=Math.min(bond.communication,bond.commCap);
 return bond;
}
function consentGuard(b,{guardianConsent=false,informedConsent=false,beastWilling=false}={}){
 if(!b)throw Error('Unknown beast');
 const sapience=Number.isInteger(b.sapience)?b.sapience:(b.intelligence==='sapient'?3:null);
 if(sapience===null)throw Error('Sapience not established; cannot certify agreement');
 if(sapience<=1)return {eligible:!!beastWilling,reason:beastWilling?'Voluntary animal cooperation; welfare still applies':'S0–S1 behaviour does not demonstrate willingness'};
 if(sapience===2)return {eligible:guardianConsent&&beastWilling,reason:guardianConsent&&beastWilling?'Protected Mind and guardian both agree':'S2 needs guardian consent AND evident willingness'};
 return {eligible:informedConsent&&beastWilling,reason:informedConsent&&beastWilling?'Informed voluntary choice':'S3+ person must give informed consent'};
}
function applyEvent(b,name,times=1){
 if(!events[name])throw Error('Unknown bond event');C.int(times,'times',1,30);
 const double=b.personality.some(tag=>(heightened[tag.toLowerCase()]||[]).includes(name))?2:1;
 const before={};
 for(const [key,delta] of Object.entries(events[name])){
   before[key]=b[key]||0;
   let next=before[key]+delta*times*double;
   if(name==='good_care_week'&&key==='trust')next=Math.min(next,Math.max(before[key],60));
   if(key==='communication')next=Math.min(next,b.commCap);
   b[key]=clamp(next);
 }
 return {event:name,multiplier:double,changes:Object.fromEntries(Object.keys(before).map(k=>[k,b[k]-before[k]]))};
}
function weeklyCare(b,needs='met'){
 if(!['met','mostly','neglected'].includes(needs))throw Error('Care must be met, mostly or neglected');
 const ev=needs==='met'?applyEvent(b,'good_care_week'):needs==='neglected'?applyEvent(b,'neglect_week'):null;
 b.lowWeeks=b.trust<20||b.willingness<20?b.lowWeeks+1:0;
 if(b.lowWeeks>=2)b.fractured=true;
 const contractResult=b.fractured&&b.contract?adjustStability(b,'fracture_week'):null;
 return {care:needs,changes:ev?.changes||{},lowWeeks:b.lowWeeks,fractured:b.fractured,contract:contractResult};
}
function simpleCommandReady(b){return b.coordination>=20&&b.trust>=30&&!b.fractured;}
const risk={low:2,moderate:5,high:8,extreme:12};
function willingness(s,b,{handlerRank=0,riskLevel='moderate'}={}){
 if(!Object.hasOwn(risk,riskLevel))throw Error('Unknown risk level');C.int(handlerRank,'Beast Handling rank',0,5);
 const bonus=Math.floor((b.trust+b.loyalty)/20)+handlerRank+(b.respect>=60?2:0);
 const outcome=C.check(s,{modifier:bonus,dc:10+risk[riskLevel],label:`${b.beast} willingness`});
 return {obeys:outcome.success,degree:outcome.degree,
   response:outcome.success?'cooperates':outcome.degree==='severe failure'?'flees or acts on instinct':'hesitates or refuses',check:outcome};
}
function contractLoad(grade,sapience,depth='standard'){
 C.int(grade,'grade',1,9);C.int(sapience,'sapience',0,5);
 const shift={light:-1,standard:0,deep:1,covenant:2}[depth];
 if(shift===undefined)throw Error('Invalid contract depth');
 const base=grade>=6?5:grade>=4||sapience>=3?3:grade===3||sapience===2?2:1;
 return Math.max(1,base+shift);
}
function bondCapacity(will,soulPhase=0){
 C.int(will,'Will',-10,20);C.int(soulPhase,'Soul Phase',0,7);
 return Math.max(1,2+will+soulPhase);
}
const depthBase={light:50,standard:60,deep:70,covenant:80};
const linkRange={light:'100 m',standard:'1 km',deep:'10 km',covenant:'100 km'};
function seal(s,b,{grade,depth='standard',will,contractLore=0,soulDB=0,soulPhase=0,usedCapacity=0,bonuses=0,beastWilling=false,guardianConsent=false,informedConsent=false}={}){
 if(b.contract)return {sealed:false,reason:'An existing contract must be lawfully ended before a new one can be sealed'};
 const consent=consentGuard(b,{beastWilling,guardianConsent,informedConsent});
 if(!consent.eligible||b.willingness<50)return {sealed:false,reason:consent.eligible?'Bond willingness below 50':consent.reason};
 C.int(will,'Will',-10,20);C.int(contractLore,'Contract Lore',-20,30);C.int(soulDB,'Soul discipline bonus',0,20);
 C.int(usedCapacity,'used bond capacity',0,100);C.int(bonuses,'contract stability bonus',-50,50);
 const load=contractLoad(grade,b.sapience,depth),dc=12+2*load;
 const capacity=bondCapacity(will,soulPhase);
 // Over-capacity agreements must never roll or create a contract, even
 // when the handler and beast otherwise consent.
 if(usedCapacity+load>capacity)return {sealed:false,reason:'Insufficient bond capacity',load,usedCapacity,capacity,overCapacity:true};
 const ch=C.check(s,{modifier:will+contractLore+soulDB,dc,label:`Contract sealing (${depth})`});
 if(!ch.success){if(ch.degree==='severe failure')b.trust=clamp(b.trust-5);return {sealed:false,load,check:ch};}
 const stability=clamp(depthBase[depth]+bonuses+(soulPhase>=3?10:0));
 b.contract={depth,load,link:linkRange[depth],base:depthBase[depth]};
 b.contractStability=stability;
 if(depth!=='light')b.commCap=Math.min(100,b.commCap+20);
 return {sealed:true,load,stability,link:linkRange[depth],overCapacity:false,capacity,check:ch};
}
const stabilityChange={honoured_month:1,minor_breach:-5,major_breach:-15,fracture_week:-10,over_capacity_week:-5,month_apart:-2};
function adjustStability(b,reason){
 if(!b.contract)throw Error('No contract to adjust');
 if(!Object.hasOwn(stabilityChange,reason))throw Error('Unknown stability event');
 let v=b.contractStability+stabilityChange[reason];
 if(reason==='honoured_month')v=Math.min(v,b.contract.base+20);
 b.contractStability=clamp(v);
 return {stability:b.contractStability,state:v<=0?'dissolved':v<=20?'frayed':'holding'};
}
const syncThresholds={
 1:[20,15,0,0,10,30,6],2:[30,25,3,0,20,40,10],3:[40,35,4,3,30,50,15],
 4:[50,45,5,4,40,60,20],5:[60,55,5,4,55,65,25],6:[70,65,6,5,65,70,30],
 7:[75,70,7,6,70,75,40],8:[80,80,7,7,85,80,50],9:[90,85,8,8,85,90,null],10:[95,90,9,9,90,95,null]
};
const syncFields=['trust','communication','resonance','compatibility','coordination','willingness'];
const specialSync={2:'Energy perception from a partner',4:'A suitable bond or resonance medium',7:'Sufficient human Soul Stability',9:'Years together, shared experience and evolution opportunity',10:'A unique qualifying event'};
function syncReadiness(b,stage){
 C.int(stage,'sync stage',1,10);
 const requirements=syncThresholds[stage];
 const missing={};
 for(let i=0;i<syncFields.length;i++)if((b[syncFields[i]]||0)<requirements[i])missing[syncFields[i]]=`${b[syncFields[i]]||0}/${requirements[i]}`;
 return {numericReady:!Object.keys(missing).length,missing,trainingPoints:requirements[6],extraRequirement:specialSync[stage]||null,
   externallyVerified:!specialSync[stage]};
}
function publicBond(b){
 const word=n=>n<20?'Low':n<40?'Guarded':n<60?'Established':n<80?'Strong':'Profound';
 return {beast:b.beast,sapience:b.sapience,trust:word(b.trust),willingness:word(b.willingness),
   familiarity:word(b.familiarity),syncStage:b.syncStage,syncState:b.syncState,contractDepth:b.contract?.depth||null,fractured:b.fractured};
}
function register(s,{beastId,start='won_by_trust',years=0,personality=[]}={}){
 if(!s.beasts?.[beastId])throw Error('No recorded beast');
 const beast=s.beasts[beastId],list=(s.table||={}).bondRecords||=( {} );
 if(list[beastId])throw Error('Bond already recorded');
 if(!Number.isInteger(beast.sapience))throw Error('Beast sapience not recorded');
 list[beastId]=create({human:s.player.name,beast:beast.name,sapience:beast.sapience,start,years,personality});
 return {recorded:true,beast:beast.name,contract:false};
}
function fromSave(s,id){const b=s.table?.bondRecords?.[id];if(!b)throw Error('Bond record not found');return b;}
module.exports={consentGuard,communicationCap,create,applyEvent,weeklyCare,simpleCommandReady,willingness,
  contractLoad,bondCapacity,seal,adjustStability,syncReadiness,publicBond,register,fromSave};