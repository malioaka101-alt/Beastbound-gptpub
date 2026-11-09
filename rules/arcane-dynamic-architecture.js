'use strict';
// #11. Genuine Fourth Circle Dynamic Architecture, preserving original core,
// three-circle matrix, independent bodily costs and earlier learnt spells.
// Geometry may be authored freely; labels never grant a castable spell.
const Crypto=require('node:crypto'),E=require('../engine.js'),C=require('./core'),
 Build=require('./build'),D=require('./disciplines');
const ORIGIN='source-earned-fourth-arcane-dynamic-architecture-v1',
 MAP='witnessed-existing-three-circle-dynamic-geometry-v1',
 PRACTICE='witnessed-dynamic-arcane-channel-calibration-v1',
 BREAKTHROUGH='witnessed-fourth-circle-live-geometry-reconfiguration-v1',
 REPAIR='witnessed-original-mana-matrix-repair-v1';
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const i=(x,a=0,b=1000000000)=>Number.isInteger(x)&&x>=a&&x<=b;
const prose=(x,a=12,b=900)=>typeof x==='string'&&x.trim().length>=a&&x.trim().length<=b;
const keys=(p,k)=>p&&typeof p==='object'&&!Array.isArray(p)&&
 Object.keys(p).every(x=>k.includes(x));
function witness(s,index,origin){
 if(!i(index,0,s.log.length-1))throw Error('An original personally witnessed Arcane structural event is required');
 const e=s.log[index],d=e?.details;
 if(e?.type!=='story'||d?.origin!==origin||
  d.location!==s.world.location||!prose(e.text,18,900))
  throw Error('This activity has no genuine local Arcane source witness');
 return structuredClone(e);
}
function third(s){
 const a=s.player?.arcane,p=s.table?.arcaneArchitecture?.circle3;
 if(!a||!p||a.circles<3||a.coreIgnited!==true||
  !prose(p.matrixGeometry,30,500)||!i(p.completedMinute,0,s.world.minutes))
  throw Error('Actual original Third Circle Matrix Formation must be earned first');
 if(a.circles===3)D.verifyThirdCircle(s);
 const history=s.table?.disciplineTraining?.arcane?.history||[];
 if(!history.some(x=>x.target==='circle3'&&x.witnessSource==='earned-third-circle-matrix-formation-v1'))
  throw Error('Original third-matrix construction history is missing');
 return {a,p,sourceHash:hash(p)};
}
function verify(s){
 const a=s.player?.arcane,root=s.table?.arcaneArchitecture,
  l=root?.dynamicFourth;
 if(!l)return (a?.circles||0)<4;
 if(!l||l.origin!==ORIGIN||l.thirdHash!==hash(root.circle3)||
  !l.source||l.sourceHash!==hash(l.source)||
  l.source.origin!==ORIGIN||l.source.thirdHash!==l.thirdHash||
  !l.source.witness||l.source.witnessHash!==hash(l.source.witness)||
  l.source.witness.details?.origin!==MAP||
  !prose(l.source.design,30,900)||
  !prose(l.source.channelInteraction,25,900)||
  !prose(l.source.interference,25,900)||
  !Array.isArray(l.attempts)||!Array.isArray(l.repairs)||
  !Array.isArray(l.transitions)||!i(l.points,0,6)||
  !i(l.strain,0,100)||!i(l.source.minute,0,s.world.minutes))
  return false;
 let points=0,strain=0,success=null;
 const events=[...l.attempts.map(e=>({kind:'attempt',e})),
   ...l.repairs.map(e=>({kind:'repair',e}))].sort((x,y)=>x.e.source.minute-y.e.source.minute);
 let last=l.source.minute;
 const used=new Set();
 for(const {kind,e} of events){
  const x=e?.source;
  if(e?.origin!==ORIGIN||e.seal!==hash(x)||
   x?.origin!==ORIGIN||x.kind!==kind||
   !i(x.minute,last,s.world.minutes)||!i(x.minutes,15,480)||
   !i(x.manaSpent,1,30)||!i(x.staminaSpent,1,20)||
   !i(x.roll,1,20)||x.check?.roll!==x.roll||
   !x.checkEvent||x.checkEventHash!==hash(x.checkEvent)||
   x.checkEvent.type!=='roll'||
   hash(x.checkEvent.details)!==hash(x.check)||
   !x.witness||x.witnessHash!==hash(x.witness)||
   x.witness.details?.origin!==(kind==='attempt'?PRACTICE:REPAIR)||
   used.has(x.witnessHash))
   return false;
  used.add(x.witnessHash);
  if(kind==='attempt'){
   if(x.earned!==(x.check.success?x.check.progress:0)||
    x.total!==Math.min(6,points+x.earned)||
    x.strainAdded!==(x.check.degree==='severe failure'?3:0))
    return false;
   points=x.total;strain=Math.min(100,strain+x.strainAdded);
  }else{
   if(x.strainBefore!==strain||
    x.strainAfter!==(x.check.success?Math.max(0,strain-2):strain))
    return false;
   strain=x.strainAfter;
  }
  last=x.minute+x.minutes;
 }
 if(points!==l.points||strain!==l.strain)return false;
 for(const t of l.transitions){
  const x=t?.source,profile=Build.arcaneProfile(4);
  if(t.origin!==ORIGIN||t.seal!==hash(x)||
   x?.origin!==ORIGIN||x.kind!=='fourth-circle-integration'||
   !i(x.minute,l.source.minute,s.world.minutes)||!i(x.minutes,30,480)||
   !i(x.manaSpent,1,50)||!i(x.staminaSpent,1,20)||
   !i(x.roll,1,20)||x.check?.roll!==x.roll||
   x.formed!==x.check.success||x.pointsAtAttempt!==6||
   x.witness.details?.origin!==BREAKTHROUGH||
   x.witnessHash!==hash(x.witness)||
   x.checkEventHash!==hash(x.checkEvent)||
   hash(x.checkEvent.details)!==hash(x.check)||
   used.has(x.witnessHash))
   return false;
  used.add(x.witnessHash);
  if(x.formed){
   if(success)return false;
   success=t;
   const cap=x.capacity;
   if(!cap||cap.newMax!==Math.max(cap.oldMax,profile.mana)||
    cap.newMana!==cap.oldMana-x.manaSpent||
    cap.channels!==profile.channels||
    cap.maxComplexity!==profile.maxComplexity||
    !i(cap.oldMana,x.manaSpent,100000)||!i(cap.oldMax,0,100000))
    return false;
  }else if(x.capacity!==null)return false;
 }
 if((a?.circles||0)===4&&!success)return false;
 if((a?.circles||0)===3&&success)return false;
 if(success&&a.circles===4){
  const p=Build.arcaneProfile(4),cap=success.source.capacity;
  if(a.channels!==p.channels||a.structuredMana!==p.mana||
   a.maxComplexity!==p.maxComplexity||a.intake!==p.intake||
   a.preparedCapacity!==p.prepared||
   a.dynamicGeometry!==l.source.design||
   s.player.maxMana<cap.newMax)
   return false;
 }
 return true;
}
function prerequisite(s){
 const {a,p,sourceHash}=third(s);
 if(a.circles!==3||a.coreStability<45||s.battle||s.encounter)
  throw Error('An intact, safe and originally earned Third Circle is needed for a fourth-Circle redesign');
 if(s.table?.arcaneArchitecture?.dynamicFourth&&!verify(s))
  throw Error('Saved dynamic Arcane geometry or original checks were altered');
 return {a,p,sourceHash};
}
function map(s,p={}){
 if(!keys(p,['design','channelInteraction','interference','safety',
  'witnessIndex'])||
  !prose(p.design,30,900)||!prose(p.channelInteraction,25,900)||
  !prose(p.interference,25,900)||!prose(p.safety,25,900))
  throw Error('Dynamic Circle proposal needs a real multi-channel redesign, interference and physical safety');
 const {sourceHash}=prerequisite(s);
 if(s.table.arcaneArchitecture.dynamicFourth)
  throw Error('The existing physical design must be developed, not replaced by a new declared rank');
 const e=witness(s,p.witnessIndex,MAP),d=e.details;
 if(!prose(d.observedChannelResponse,25,900)||
   !prose(d.knownCountertest,25,900)||
   d.existingChannels!==3)
  throw Error('An actual observed three-channel response is needed before redesign');
 const source={origin:ORIGIN,thirdHash:sourceHash,minute:s.world.minutes,
  design:p.design.trim(),channelInteraction:p.channelInteraction.trim(),
  interference:p.interference.trim(),safety:p.safety.trim(),
  witness:e,witnessHash:hash(e)};
 s.table.arcaneArchitecture.dynamicFourth={origin:ORIGIN,thirdHash:sourceHash,
  source,sourceHash:hash(source),attempts:[],repairs:[],
  transitions:[],points:0,strain:0};
 return {mapped:true,notConstructed:true,channels:3,noFreeSpell:true};
}
function work(s,p={}){
 if(!keys(p,['witnessIndex','minutes'])||!i(p.minutes??60,15,480))
  throw Error('Actual Fourth Circle work requires a distinct local witness and real duration');
 const {a}=prerequisite(s),l=s.table.arcaneArchitecture.dynamicFourth;
 if(!l)throw Error('A genuine original dynamic Arcane design must precede practice');
 if(l.strain>=5)throw Error('Structural overload needs physical repair before another reconfiguration');
 if(l.points>=6)throw Error('Fourth Circle structural practice is ready for a separate live test');
 const e=witness(s,p.witnessIndex,PRACTICE);
 if(!prose(e.details.channelTest,20,900)||!prose(e.details.failureLimit,20,900))
  throw Error('Genuine local reconfiguration and a measured failure limit are required');
 const w=hash(e);
 if(l.attempts.some(x=>x.source.witnessHash===w))
  throw Error('One original Arcane exercise cannot be rerolled');
 const mana=3,minutes=p.minutes??60,stamina=Math.ceil(minutes/120)+1;
 if(!i(s.player.mana,mana,100000)||!i(s.player.stamina,stamina,100000))
  throw Error('Actual Mana and Stamina are insufficient to reconfigure this Circle');
 const before=s.world.minutes;
 s.player.mana-=mana;s.player.stamina-=stamina;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
 const modifier=Math.floor((s.player.attributes.int-10)/2)+
  2*(s.player.skills.arcana?.rank||0)+
  Math.floor(a.coreStability/25)-2;
 const check=C.check(s,{modifier,dc:21,label:'Earned Fourth Circle live dynamic geometry calibration'});
 const event=structuredClone(s.log.at(-1));
 const earned=check.success?check.progress:0,
  damage=check.degree==='severe failure'?3:0;
 if(damage)a.coreStability=Math.max(1,a.coreStability-damage*2);
 l.points=Math.min(6,l.points+earned);l.strain=Math.min(100,l.strain+damage);
 const source={origin:ORIGIN,kind:'attempt',minute:before,
  minutes,manaSpent:mana,staminaSpent:stamina,
  witness:e,witnessHash:w,check:structuredClone(check),
  checkEvent:event,checkEventHash:hash(event),
  roll:check.roll,earned,total:l.points,strainAdded:damage};
 l.attempts.push({origin:ORIGIN,source,seal:hash(source)});
 E.advance(s,minutes);require('./world').finalizeTime(s,before);
 if(!verify(s))throw Error('Actual Arcane matrix practice no longer matches original check receipts');
 return {practised:true,check,earned,points:l.points,needed:6,
  strain:l.strain,manaSpent:mana,staminaSpent:stamina,
  minutes,noFreeMagic:true};
}
function repair(s,p={}){
 if(!keys(p,['witnessIndex','minutes'])||!i(p.minutes??60,15,480))
  throw Error('Arcane Core repair needs a real witnessed structural repair event and time');
 const {a}=prerequisite(s),l=s.table.arcaneArchitecture.dynamicFourth;
 if(!l||!l.strain)throw Error('No actually observed Arcane matrix strain needs correction');
 const e=witness(s,p.witnessIndex,REPAIR);
 if(!prose(e.details.actualDamage,25,900)||
  !prose(e.details.method,25,900))
  throw Error('An original diagnostic and repair method must be witnessed');
 const w=hash(e);
 if(l.repairs.some(x=>x.source.witnessHash===w))
  throw Error('This exact Arcane repair was already attempted');
 const mana=2,minutes=p.minutes??60,stamina=1+Math.ceil(minutes/120);
 if(!i(s.player.mana,mana,100000)||!i(s.player.stamina,stamina,100000))
  throw Error('Repair requires actual Mana and physical effort');
 const before=s.world.minutes;
 s.player.mana-=mana;s.player.stamina-=stamina;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.int-10)/2)+
  2*(s.player.skills.arcana?.rank||0),
  dc:14,label:'Repair actual observed Mana matrix backlash'});
 const event=structuredClone(s.log.at(-1)),strainBefore=l.strain;
 l.strain=check.success?Math.max(0,strainBefore-2):strainBefore;
 if(check.success)a.coreStability=Math.min(100,a.coreStability+2);
 const source={origin:ORIGIN,kind:'repair',minute:before,
  minutes,manaSpent:mana,staminaSpent:stamina,
  witness:e,witnessHash:w,roll:check.roll,check:structuredClone(check),
  checkEvent:event,checkEventHash:hash(event),
  strainBefore,strainAfter:l.strain};
 l.repairs.push({origin:ORIGIN,source,seal:hash(source)});
 E.advance(s,minutes);require('./world').finalizeTime(s,before);
 if(!verify(s))throw Error('Source-based Arcane repair history was altered');
 return {repaired:check.success,check,strain:l.strain,
  manaSpent:mana,staminaSpent:stamina,minutes,
  noInstantPerfectCore:true};
}
function complete(s,p={}){
 if(!keys(p,['witnessIndex','minutes'])||!i(p.minutes??90,30,480))
  throw Error('Fourth Circle needs an independently witnessed live reconfiguration test');
 const {a}=prerequisite(s),l=s.table.arcaneArchitecture.dynamicFourth;
 if(!l||l.points<6||l.strain>2)throw Error('Source-earned dynamic practice and low core strain are required');
 const e=witness(s,p.witnessIndex,BREAKTHROUGH);
 if(!prose(e.details.changedDuringCasting,25,900)||
  !prose(e.details.interferenceCounter,25,900))
  throw Error('A genuine live on-the-fly Circle redesign and countertest must be witnessed');
 const w=hash(e);
 if(l.transitions.some(x=>x.source.witnessHash===w))
  throw Error('The original live reconstruction cannot receive a second roll');
 const mana=8,minutes=p.minutes??90,stamina=Math.ceil(minutes/90)+2;
 if(!i(s.player.mana,mana,100000)||!i(s.player.stamina,stamina,100000))
  throw Error('The intact three-channel core cannot sustain a real Fourth Circle without reserves');
 const before=s.world.minutes,oldMana=s.player.mana,oldMax=s.player.maxMana;
 s.player.mana-=mana;s.player.stamina-=stamina;
 if(s.table?.combatants?.player)s.table.combatants.player.stamina=s.player.stamina;
 const check=C.check(s,{modifier:Math.floor((s.player.attributes.int-10)/2)+
  2*(s.player.skills.arcana?.rank||0)+Math.floor(a.coreStability/25)-2,
  dc:24,label:'Fourth Circle Dynamic Architecture independent live test'});
 const event=structuredClone(s.log.at(-1));let capacity=null;
 if(check.success){
  const profile=Build.arcaneProfile(4);
  a.circles=4;a.channels=profile.channels;a.structuredMana=profile.mana;
  a.maxComplexity=profile.maxComplexity;a.intake=profile.intake;
  a.loadTolerance=profile.loadTolerance;
  a.preparedCapacity=profile.prepared;a.dynamicGeometry=l.source.design;
  s.player.maxMana=Math.max(oldMax,profile.mana);
  capacity={oldMana,newMana:s.player.mana,oldMax,newMax:s.player.maxMana,
   channels:profile.channels,maxComplexity:profile.maxComplexity};
 }
 const source={origin:ORIGIN,kind:'fourth-circle-integration',
  minute:before,minutes,witness:e,witnessHash:w,
  manaSpent:mana,staminaSpent:stamina,
  check:structuredClone(check),checkEvent:event,checkEventHash:hash(event),
  roll:check.roll,formed:check.success,pointsAtAttempt:l.points,capacity};
 l.transitions.push({origin:ORIGIN,source,seal:hash(source)});
 E.advance(s,minutes);require('./world').finalizeTime(s,before);
 if(!verify(s))throw Error('Fourth Circle structural source or capacity evidence was changed');
 return {attempted:true,formed:check.success,stage:a.circles,check,
  manaSpent:mana,staminaSpent:stamina,minutes,capacity,
  noInstantSpells:true};
}
function status(s){
 const a=s.player?.arcane,l=s.table?.arcaneArchitecture?.dynamicFourth;
 if((a?.circles||0)<3)return {available:false,circles:a?.circles||0,
  note:'Earn the original three-Circle resonance matrix first'};
 if(!verify(s))throw Error('Arcane dynamic geometry source was changed');
 return {available:a.circles===3,circles:a.circles,
  design:l?.source?.design||null,points:l?.points||0,
  needed:6,strain:l?.strain||0,
  constructed:a.circles>=4,
  noFreeSpell:true,optionalTeacher:true};
}
module.exports={ORIGIN,MAP,PRACTICE,BREAKTHROUGH,REPAIR,
 map,work,repair,complete,status,verify};
