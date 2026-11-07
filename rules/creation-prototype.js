'use strict';
// First genuine source-bound experimental adapter for an original mundane
// physical sensing design. This does NOT execute generic spells or recipes.
// Adaptable prototype machinery: other mechanisms need their own grounded
// physical models, not user-provided magical assertions.
const Crypto=require('node:crypto'),E=require('../engine.js'),
 C=require('./core'),W=require('./world'),H=require('./unified'),
 Realm=require('../world/simulation'),Atlas=require('../world/atlas'),
 Design=require('./creation-design'),Practice=require('./earned-practice'),
 Mastery=require('./mastery-lifepath'),Work=require('./physical-work');
const ORIGIN='source-witnessed-mundane-prototype-v1',
 TIME=85,TEST_TIME=15,OBS_TIME=8,STA=4;
const hash=x=>Crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function one(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||
  Object.keys(p).sort().join('|')!=='id'||
  typeof p.id!=='string'||!/^design_[1-9][0-9]*$/.test(p.id))
  throw Error('A genuine preexisting design ID is required; no caller-selected grade, yield, roll or effect');
 return p.id;
}
function design(s,id){
 const d=s.table?.creationDesigns?.records?.[id];
 if(!d||d.id!==id||d.origin!==Design.ORIGIN||
  d.source?.id!==id||d.source.creator!==s.player.name||
  d.sourceHash!==hash(d.source)||
  d.proposalHash!==hash(d.proposal)||
  d.source.proposalHash!==d.proposalHash||
  d.scopeHash!==d.source.scopeHash)
  throw Error('Only a genuine originally sealed invention dossier can be prototyped');
 const p=Design.input(d.proposal),
  a=Design.analysis(s,p);
 if(a.scopeHash!==d.scopeHash||p.system!=='mundane'||
  p.medium!=='tool'||p.function!=='sense'||
  p.target!=='surface_water'||p.magnitude!==0||
  p.range!=='touch'||p.area!=='single'||
  p.duration!=='1min'||p.novelty!=='variant'||
  p.materials.length!==1||p.materials[0].id!=='marsh_reed'||
  p.materials[0].quantity!==2)
  throw Error('No proven physical prototype adapter for this particular proposed mechanism; further research is required');
 return d;
}
function local(s){
 const loc=E.LOCATIONS[s.world?.location],reg=Atlas.LOCATION_REGION[s.world?.location];
 if(!loc||!reg||!['fen','forest'].includes(loc.biome))
  throw Error('A real accessible surface-water field site is needed to calibrate this indicator');
 if(s.encounter||s.battle)
  throw Error('Resolve the immediate encounter before performing delicate physical trials');
 const status=s.table?.combatants?.player;
 if(status&&status.status!=='ok')
  throw Error('An incapacitated person cannot complete a physical prototype trial');
 return {site:s.world.location,region:reg,loc};
}
function checkItem(s,id){
 const t=s.table?.creationPrototypes?.[id];
 if(!t||t.origin!==ORIGIN||t.id!==id||t.owner!==s.player.name||
  t.sourceHash!==hash(t.source)||t.source.prototypeId!==id||
  t.source.designId!==t.designId||
  t.source.location!==t.madeAt||
  t.source.checkWitnessHash!==t.checkWitnessHash||
  !['unverified','calibrated','broken'].includes(t.status)||
  !Number.isInteger(t.durability)||t.durability<0||t.durability>6||
  !Array.isArray(t.readings)||t.readings.length>8)
  throw Error('No source-verified owned physical invention is available');
 const d=design(s,t.designId);
 if(d.prototypeId!==id||t.source.designScopeHash!==d.scopeHash||
  t.source.designHash!==d.sourceHash)
  throw Error('The physical invention has no intact original design provenance');
 return t;
}
function build(s,p={}){
 const id=one(p),d=design(s,id),site=local(s);
 if(d.prototypeId)throw Error('A previous successful prototype exists; use or test it rather than duplicating free output');
 const supply=C.int(s.player.inventory?.marsh_reed??0,'real Marsh Reed stock',0,100000);
 if(supply<2)throw Error('A physical reed-based water indicator needs 2 actual Marsh Reed');
 if(C.int(s.player.stamina,'real stamina',0,100000)<STA+1)
  throw Error('Insufficient bodily energy for a real physical assembly trial');
 const ability=C.int(s.player.skills?.crafting?.rank??0,'earned Crafting rank',0,5),
  intellect=C.int(s.player.attributes?.int,'earned practical intelligence',1,30);
 // The design was assessed earlier. Naming it cannot increase these source
 // limits, and a licence/teacher is not obligatory for elementary craft.
 const old=s.world.minutes;
 const source={origin:ORIGIN,designId:id,designHash:d.sourceHash,
  designScopeHash:d.scopeHash,location:site.site,
  input:{marsh_reed:2},minutes:TIME,
  originalCraftingRank:ability,fromMinute:old};
 const prepared=Work.plan(s,{inputs:{marsh_reed:2},stamina:STA,minutes:TIME,
  dc:12,modifier:Math.floor((intellect-10)/2)+2*ability+
   Mastery.bonus(s,'crafting'),
  label:'Construct a bounded reed surface-water indicator',
  event:{type:'world',
   text:'The inventor assembles an actual reed-based surface-water indicator with a field calibration mark.',
   details:source}});
 const completed=Work.perform(s,prepared);
 const roll=completed.check,
  precheckHash=completed.witnessHash,
  checkWitnessHash=completed.rollHash;
 d.attempts||=[];
 const trial={startMinute:old,finishMinute:s.world.minutes,
  location:site.site,resources:{marsh_reed:2},
  check:{roll:roll.roll,dc:roll.dc,degree:roll.degree,margin:roll.margin},
  witnessHash:precheckHash,checkWitnessHash,success:roll.success};
 d.attempts.push(trial);
 const trialIndex=d.attempts.length;
 if(!roll.success){
  d.status='trial-failed';
  C.event(s,'research','The reed arrangement cannot retain a usable physical calibration. The supplied reeds are spent.',{
   origin:ORIGIN,designId:id,trialIndex,success:false,
   input:{marsh_reed:2},checkWitnessHash,noFreeEffect:true});
  return {designId:id,assembled:false,reason:'unreliable physical mechanism',
   consumed:{marsh_reed:2},elapsedMinutes:TIME,staminaSpent:STA,
   check:roll,noTechniqueLearned:true};
 }
 const prototypeId='water_indicator_'+id;
 const itemSource={...source,prototypeId,checkWitnessHash,
  trialIndex,grade:1,physicalFunction:'approximate local surface-water availability',
  notSoulSight:true,noRemoteScanning:true};
 const item={id:prototypeId,designId:id,owner:s.player.name,
  origin:ORIGIN,source:itemSource,sourceHash:hash(itemSource),
  checkWitnessHash,prototypeQuality:roll.degree,
  status:'unverified',durability:5,
  madeAt:site.site,readings:[]};
 s.table.creationPrototypes||={};
 s.table.creationPrototypes[prototypeId]=item;
 d.prototypeId=prototypeId;d.status='prototyped';
 C.event(s,'research','One uncalibrated field indicator is physically assembled. It still needs a real water calibration before use.',{
  origin:ORIGIN,designId:id,prototypeId,checkWitnessHash,
  materialConsumed:{marsh_reed:2},notMagic:true});
 const experience=Practice.award(s,{skill:'crafting',check:roll,risky:true});
 return {designId:id,assembled:true,prototypeId,
  status:item.status,effectGrade:1,
  boundedFunction:'approximate local surface-water availability',
  consumed:{marsh_reed:2},elapsedMinutes:TIME,staminaSpent:STA,
  check:roll,...experience,noTechniqueLearned:true,
  noFreeManaOrQi:true};
}
function reading(s,t,testing){
 const site=local(s);
 const day=Math.floor(s.world.minutes/1440),w=Realm.peek(s),
  eco=w.ecosystems?.[site.region];
 if(!eco||!Number.isFinite(eco.water)||eco.water<0||eco.water>100)
  throw Error('A valid current local ecology record is needed for a physical water reading');
 const stamina=testing?2:1,time=testing?TEST_TIME:OBS_TIME;
 if(C.int(s.player.stamina,'real stamina',0,100000)<stamina+1)
  throw Error('Insufficient Stamina for a careful local instrument reading');
 const int=C.int(s.player.attributes?.int,'practised intelligence',1,30),
  rank=C.int(s.player.skills?.crafting?.rank??0,'earned Crafting rank',0,5),
  old=s.world.minutes,fromWater=eco.water;
 s.player.stamina-=stamina;
 const roll=C.check(s,{modifier:Math.floor((int-10)/2)+2*rank+Mastery.bonus(s,'crafting'),
  dc:testing?11:10,label:testing?'Calibrate a real reed water indicator':'Interpret a surface-water gauge'});
 const checkWitnessHash=hash(s.log.at(-1));
 const estimate=roll.success?
  fromWater<33?'scarce':fromWater<67?'moderate':'abundant':'inconclusive';
 // Never reveals an exact 0–100 ecological score, invisible private
 // biology, hidden world, safe drinking quality or a magical reservoir.
 const result={day,site:site.site,observedCategory:estimate,
  target:'surface_water',success:roll.success,
  checkWitnessHash,source:'physical field readout only'};
 t.readings.push(result);if(t.readings.length>8)t.readings.shift();
 t.durability--;
 if(t.durability===0)t.status='broken';
 else if(testing&&roll.success)t.status='calibrated';
 E.advance(s,time);W.finalizeTime(s,old);H.sync(s,{source:'legacy'});
 C.event(s,'world',roll.success?
  'A physically limited surface-water gauge indicates '+estimate+' local availability.':
  'The physical water gauge yields an inconclusive reading.',{
   origin:ORIGIN,prototypeId:t.id,site:site.site,
   observedCategory:estimate,checkWitnessHash,
   noPreciseHiddenWater:true,noSupernaturalDetection:true});
 return {prototypeId:t.id,status:t.status,
  observedCategory:estimate,site:site.site,
  elapsedMinutes:time,staminaSpent:stamina,
  durabilityRemaining:t.durability,check:roll,
  scope:'Only approximate physical surface-water availability at this actually visited site'};
}
function calibrate(s,p={}){
 const id=one(p).replace(/^design_/,'water_indicator_design_'),
  t=checkItem(s,id);
 if(t.status==='broken')throw Error('A broken instrument cannot be calibrated');
 return reading(s,t,true);
}
function measure(s,p={}){
 const id=one(p).replace(/^design_/,'water_indicator_design_'),
  t=checkItem(s,id);
 if(t.status!=='calibrated')
  throw Error('A recorded physical prototype requires a successful genuine local calibration before measurement');
 return reading(s,t,false);
}
function repair(s,p={}){
 const id=one(p).replace(/^design_/,'water_indicator_design_'),
  t=checkItem(s,id),site=local(s);
 if(t.durability>=5&&t.status!=='broken')
  throw Error('The owned physical tool is not worn enough to require a source-backed repair');
 const reeds=C.int(s.player.inventory?.marsh_reed??0,
  'real replacement reed',0,100000);
 if(reeds<1)throw Error('A physical field repair needs one actual Marsh Reed');
 if(C.int(s.player.stamina,'repair stamina',0,100000)<3)
  throw Error('Insufficient physical energy for controlled field repair');
 const int=C.int(s.player.attributes.int,'actual intelligence',1,30),
  rank=C.int(s.player.skills.crafting.rank,'earned Crafting rank',0,5),
  old=s.world.minutes;
 const prepared=Work.plan(s,{inputs:{marsh_reed:1},stamina:2,
  minimumRemaining:1,minutes:50,dc:12,
  modifier:Math.floor((int-10)/2)+2*rank+Mastery.bonus(s,'crafting'),
  label:'Repair a source-verified ordinary water indicator',
  event:{type:'world',
   text:'A genuine worn reed sensor is dismantled for physical field repairs.',
   details:{origin:ORIGIN,prototypeId:id,location:site.site,
    replacement:{marsh_reed:1},fromMinute:old,notNewInvention:true}}});
 const completed=Work.perform(s,prepared);
 const check=completed.check,workHash=completed.witnessHash,
  rollHash=completed.rollHash;
 t.repairs||=[];
 t.repairs.push({fromMinute:old,finishMinute:s.world.minutes,
  location:site.site,workHash,rollHash,
  success:check.success,replacement:{marsh_reed:1}});
 if(t.repairs.length>20)t.repairs.shift();
 if(check.success){
  t.durability=Math.min(5,t.durability+2);
  t.status='unverified'; // recalibration after changing measuring reeds
 }
 C.event(s,'research',check.success?
  'The physical sensor is mended but must be recalibrated after repair.':
  'The reed repair fails; the replacement stock is spent.',{
   origin:ORIGIN,prototypeId:id,workHash,rollHash,
   restored:check.success,noNewGrade:true,
   needsFreshCalibration:check.success});
 const experience=Practice.award(s,{skill:'crafting',check,risky:true});
 return {prototypeId:id,repaired:check.success,
  materialUsed:{marsh_reed:1},elapsedMinutes:50,staminaSpent:2,
  durabilityRemaining:t.durability,needsFreshCalibration:check.success,
  check,...experience,noUnverifiedImprovement:true};
}
function status(s,p={}){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).some(k=>k!=='id'))
  throw Error('Prototype status is read-only and accepts no caller-provided result, material Grade or location');
 if(p.id!==undefined&&(!/^water_indicator_design_[1-9][0-9]*$/.test(p.id)))
  throw Error('A source-backed existing instrument ID is required');
 const entries=Object.values(s.table?.creationPrototypes||{})
  .filter(x=>!p.id||x.id===p.id);
 return {prototypes:entries.slice(-35).map(x=>{
  const t=checkItem(s,x.id);
  return {id:t.id,designId:t.designId,
   function:t.source.physicalFunction,
   grade:t.source.grade,status:t.status,
   durability:t.durability,quality:t.prototypeQuality,
   lastPersonallyObserved:t.readings.at(-1)?.observedCategory||null,
   notMagical:true,notYetGeneralArtefactCrafting:true};
 }),note:'Only source-backed owned physical prototypes, not an inventory of hypothetical spells, magical items or hidden remote data'};
}
module.exports={ORIGIN,build,calibrate,measure,repair,status,_debug:{checkItem,design,local,hash}};
